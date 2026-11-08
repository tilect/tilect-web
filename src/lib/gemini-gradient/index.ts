/**
 * Gemini "thinking" aurora gradient — framework-agnostic logic.
 * No React in here: the React binding lives in `@/src/hooks/useGeminiGradient`.
 */
export { createGradientRenderer } from "./renderer";
export type { GradientRenderer, GradientRendererOptions, RendererStatus } from "./renderer";
export { paletteToCssFallback, TILECT_PALETTE } from "./palettes";
export { DEFAULT_PARAMS, type AuroraParams } from "./params";
export {
  DEFAULT_POINTER_EFFECTS,
  type PointerEffects,
  type PointerPosition,
  type RippleEffect,
  type SpotlightEffect,
} from "./effects";
export { createPointerTracker, type PointerSample, type PointerTrackerOptions } from "./pointer";
