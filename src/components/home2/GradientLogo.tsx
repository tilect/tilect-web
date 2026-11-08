"use client";

import { useGeminiGradient, type GradientStatus } from "@/src/hooks/useGeminiGradient";
import { usePointerTracker } from "@/src/hooks/usePointerTracker";
import {
  DEFAULT_POINTER_EFFECTS,
  paletteToCssFallback,
  TILECT_PALETTE,
  type AuroraParams,
  type PointerEffects,
  type PointerSample,
} from "@/src/lib/gemini-gradient";
import { useEffect, useRef, type CSSProperties } from "react";

export type GlowParams = {
  /** Peak opacity of the halo (it breathes between ~65% and 100% of this). */
  opacity: number;
  /** Blur radius as a percentage of the logo width. */
  blur: number;
};

export const DEFAULT_GLOW: GlowParams = { opacity: 0.85, blur: 4.5 };

/** The blurred halo leans toward the pointer and brightens while it's near. */
export type HaloFollowEffect = {
  enabled: boolean;
  /** Fraction of the pointer's offset from the logo center that the halo travels. */
  follow: number;
  /** Halo opacity multiplier while the pointer is near. */
  boost: number;
};

/** Every hover effect, each switchable on its own: two drawn by the shader, one by CSS. */
export type HoverEffects = PointerEffects & { halo: HaloFollowEffect };

export const DEFAULT_HOVER_EFFECTS: HoverEffects = {
  ...DEFAULT_POINTER_EFFECTS,
  halo: { enabled: false, follow: 0.15, boost: 1.5 },
};

type Props = {
  /** Logo image whose alpha channel cuts out the gradient (PNG with transparency or SVG). */
  src: string;
  /** Intrinsic size of `src`, used for the aspect ratio. */
  width: number;
  height: number;
  /** Hex color stops; the first one is the resting color. */
  colors?: readonly string[];
  params?: Partial<AuroraParams>;
  /** Soft blurred halo behind the logo, like the Gemini glow. `false` disables it. */
  glow?: GlowParams | false;
  /** Pointer effects; all off when omitted. */
  effects?: HoverEffects;
  /** Render-loop state changes (dev tooling). */
  onStatus?: (status: GradientStatus) => void;
  className?: string;
};

/**
 * Pure view: the logo is a CSS mask over a canvas that the gradient renderer
 * paints. A static CSS gradient sits behind the canvas as the no-WebGL /
 * pre-hydration fallback, and the canvas fades in once its first frame lands.
 */
export function GradientLogo({
  src,
  width,
  height,
  colors = TILECT_PALETTE,
  params,
  glow = DEFAULT_GLOW,
  effects = DEFAULT_HOVER_EFFECTS,
  onStatus,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  const pointer = useGeminiGradient(canvasRef, {
    colors,
    params,
    effects,
    onStatus,
    glowRef: glow ? glowRef : undefined,
  });

  const { spotlight, ripple, halo } = effects;
  const tracking = spotlight.enabled || ripple.enabled || halo.enabled;
  usePointerTracker(rootRef, {
    enabled: tracking,
    onMove: (s) => {
      pointer.setPointer(s.inside ? s : null);
      moveHalo(haloRef.current, rootRef.current, halo, s);
    },
    onPulse: pointer.pulse,
  });

  // Switching an effect off mid-hover: drop its leftover state.
  useEffect(() => {
    if (!halo.enabled) resetHalo(haloRef.current);
    if (!tracking) pointer.setPointer(null);
  }, [halo.enabled, tracking, pointer]);

  const masked: CSSProperties = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    backgroundImage: paletteToCssFallback(colors),
  };

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`relative @container ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {glow && (
        // Blur sits on a wrapper: filters apply before masks on the same element,
        // so blurring the masked node itself would get clipped back to the logo.
        <div
          ref={haloRef}
          className="pointer-events-none absolute inset-0 transition-[translate,opacity] duration-700 ease-out"
          style={{
            opacity: `calc(${glow.opacity} * var(--halo-boost, 1))`,
            filter: `blur(${glow.blur}cqw)`,
          }}
        >
          <div className="logo-glow size-full" style={masked}>
            <canvas
              ref={glowRef}
              className="block size-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
            />
          </div>
        </div>
      )}

      <div className="relative size-full" style={masked}>
        <canvas
          ref={canvasRef}
          className="block size-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
        />
      </div>
    </div>
  );
}

/** Halo-follow effect: written straight to the DOM (no re-render per pointer move); CSS eases it. */
function moveHalo(
  haloEl: HTMLDivElement | null,
  rootEl: HTMLDivElement | null,
  halo: HaloFollowEffect,
  s: PointerSample,
) {
  if (!haloEl || !rootEl) return;
  if (!halo.enabled || !s.inside) return resetHalo(haloEl);
  const dx = (s.x - 0.5) * rootEl.clientWidth * halo.follow;
  const dy = (0.5 - s.y) * rootEl.clientHeight * halo.follow;
  haloEl.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
  haloEl.style.setProperty("--halo-boost", String(halo.boost));
}

function resetHalo(haloEl: HTMLDivElement | null) {
  if (!haloEl) return;
  haloEl.style.translate = "";
  haloEl.style.removeProperty("--halo-boost");
}
