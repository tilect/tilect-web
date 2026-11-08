/**
 * Gemini "thinking" aurora gradient — framework-agnostic logic.
 * No React in here: the React binding lives in `@/src/hooks/useGeminiGradient`.
 */
export { createGradientRenderer } from "./renderer";
export type { GradientRenderer, GradientRendererOptions, RendererStatus } from "./renderer";
export { PALETTES, paletteToCssFallback, type PaletteName } from "./palettes";
export { DEFAULT_PARAMS, type AuroraParams } from "./params";
