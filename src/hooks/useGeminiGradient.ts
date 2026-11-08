"use client";

import {
  createGradientRenderer,
  type AuroraParams,
  type GradientRenderer,
  type RendererStatus,
} from "@/src/lib/gemini-gradient";
import { useEffect, useRef, type RefObject } from "react";

type Options = {
  /** Hex color stops; the first one is the resting color. */
  colors: readonly string[];
  /** Tuning; anything omitted uses the library defaults. */
  params?: Partial<AuroraParams>;
  /** Optional 2D canvas that mirrors each frame at low resolution (for a blurred glow). */
  glowRef?: RefObject<HTMLCanvasElement | null>;
  /** Render-loop state changes; `no-webgl` means the CSS fallback is showing. */
  onStatus?: (status: GradientStatus) => void;
};

export type GradientStatus = RendererStatus | "no-webgl";

/**
 * Mounts the Gemini aurora renderer on `canvasRef` for the lifetime of the component.
 *
 * Color and param changes are pushed live (the animation clock keeps running);
 * the renderer is only rebuilt when the number of color stops changes.
 * Sets `data-ready` on the canvas after the first frame so the view can fade it in
 * over its CSS fallback. If WebGL is unavailable nothing happens and the fallback stays.
 */
export function useGeminiGradient(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { colors, params, glowRef, onStatus }: Options,
) {
  const rendererRef = useRef<GradientRenderer | null>(null);
  const latest = useRef({ colors, params, onStatus });

  // Declared before the mount effect so `latest` is fresh when the renderer is created.
  useEffect(() => {
    latest.current = { colors, params, onStatus };
    rendererRef.current?.setPalette(colors);
    if (params) rendererRef.current?.setParams(params);
  }, [colors, params, onStatus]);

  const stopCount = colors.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const glow = glowRef?.current ?? null;

    const renderer = createGradientRenderer(canvas, {
      palette: latest.current.colors,
      params: latest.current.params,
      mirror: glow,
      onFirstFrame: () => {
        canvas.dataset.ready = "";
        if (glow) glow.dataset.ready = "";
      },
      onStatus: (status) => latest.current.onStatus?.(status),
    });
    rendererRef.current = renderer;
    if (!renderer) latest.current.onStatus?.("no-webgl");

    return () => {
      renderer?.destroy();
      rendererRef.current = null;
      delete canvas.dataset.ready;
      if (glow) delete glow.dataset.ready;
    };
  }, [canvasRef, glowRef, stopCount]);
}
