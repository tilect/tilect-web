/** Tunable parameters of the aurora. All can be changed live via `renderer.setParams()`. */
export interface AuroraParams {
  /** Animation speed multiplier. */
  speed: number;
  /** Seconds per cycle (rest + hue wave). Measured in the Gemini app: 8. */
  period: number;
  /** Fraction of each cycle resting on the first color. Gemini: ~0.4. */
  rest: number;
  /** Seconds the wave front takes to cross the canvas left → right. */
  lagX: number;
  /** Seconds the wave front takes to cross the canvas bottom → top. */
  lagY: number;
  /** Irregularity of the wave front, in seconds of noise. */
  frontAmount: number;
  /** Spatial frequency of the front noise (lower = broader aurora tongues). */
  frontScale: number;
  /** Overall brightness multiplier. */
  intensity: number;
  /** Brightness at the bottom edge (top is 1). */
  floor: number;
  /** Extra brightness on the top edge. */
  topGlow: number;
  /** Depth of the dark curtain folds. */
  folds: number;
  /** Saturation boost in the shadows, so they stay coloured instead of greying out. */
  shadowChroma: number;
}

export const DEFAULT_PARAMS: AuroraParams = {
  speed: 1,
  period: 8,
  rest: 0.4,
  lagX: 1.3,
  lagY: 0.6,
  frontAmount: 0.55,
  frontScale: 0.4,
  intensity: 1,
  floor: 0.4,
  topGlow: 0.25,
  folds: 0.25,
  shadowChroma: 1,
};
