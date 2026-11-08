/**
 * Color stops for the animated gradient. The first stop is the resting color;
 * the rest are the hue wave, which wraps back to the first stop seamlessly.
 */
export const PALETTES = {
  /**
   * Gemini "thinking" aurora. Sampled from a screen recording of the app
   * (top of the screen, mid-cycle) and lifted ~20% so the logo reads on ink.
   */
  gemini: [
    "#3460C8", // Gemini blue (rest)
    "#2577B0", // azure
    "#0E8A7A", // teal
    "#129948", // green
    "#84A814", // chartreuse
    "#B8B014", // yellow
    "#D29A2E", // amber
    "#AC5590", // magenta
    "#8C4CB0", // violet
    "#6656BA", // indigo
  ],
  /**
   * Tilect brand lilacs (from the t-shirt print), all kept saturated: on the
   * dark ink page any greyish violet reads as the background leaking through.
   */
  tilect: ["#6C63B5", "#8F86D1", "#ADA2F2", "#8F86D1", "#7E72D6"],
} as const satisfies Record<string, readonly string[]>;

export type PaletteName = keyof typeof PALETTES;

/**
 * Static CSS stand-in for the resting frame (top-lit resting color), used before
 * WebGL paints and when it's unavailable, so the fade-in never jumps.
 */
export function paletteToCssFallback(colors: readonly string[]): string {
  return `linear-gradient(to bottom, ${colors[0]}, color-mix(in srgb, ${colors[0]} 50%, black))`;
}

/**
 * Parse `#rgb` / `#rrggbb` into linear-light RGB triples, flattened for a
 * `uniform vec3[]`. Blending happens in linear space so the transitions
 * stay luminous instead of turning muddy in the middle.
 */
export function paletteToLinearRgb(colors: readonly string[]): Float32Array {
  const out = new Float32Array(colors.length * 3);
  colors.forEach((hex, i) => {
    const [r, g, b] = hexToRgb(hex);
    out[i * 3] = srgbToLinear(r);
    out[i * 3 + 1] = srgbToLinear(g);
    out[i * 3 + 2] = srgbToLinear(b);
  });
  return out;
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Invalid hex color: ${hex}`);
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
