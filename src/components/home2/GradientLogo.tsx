"use client";

import { useGeminiGradient, type GradientStatus } from "@/src/hooks/useGeminiGradient";
import {
  PALETTES,
  paletteToCssFallback,
  type AuroraParams,
} from "@/src/lib/gemini-gradient";
import { useRef, type CSSProperties } from "react";

export type GlowParams = {
  /** Peak opacity of the halo (it breathes between ~65% and 100% of this). */
  opacity: number;
  /** Blur radius as a percentage of the logo width. */
  blur: number;
};

export const DEFAULT_GLOW: GlowParams = { opacity: 0.85, blur: 4.5 };

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
  colors = PALETTES.gemini,
  params,
  glow = DEFAULT_GLOW,
  onStatus,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);

  useGeminiGradient(canvasRef, { colors, params, onStatus, glowRef: glow ? glowRef : undefined });

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
      aria-hidden
      className={`relative @container ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {glow && (
        // Blur sits on a wrapper: filters apply before masks on the same element,
        // so blurring the masked node itself would get clipped back to the logo.
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: glow.opacity, filter: `blur(${glow.blur}cqw)` }}
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
