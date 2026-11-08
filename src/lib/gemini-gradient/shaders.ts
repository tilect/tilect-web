/**
 * GLSL (WebGL 1 / GLSL ES 1.00) sources for the Gemini "thinking" aurora.
 *
 * Reverse-engineered from a screen recording of the Gemini app while it answers:
 *  - The surface rests on a single color (the first stop) for ~40% of each cycle.
 *  - Then a hue wave rolls through the whole palette (blue → teal → green →
 *    yellow → amber → magenta → violet → blue) in ~5s.
 *  - The wave travels diagonally: it reaches the bottom-left first and the
 *    top-right ~1s later, so two or three hues coexist mid-transition, with
 *    soft, irregular fronts — the "aurora borealis" look.
 *  - Light hangs from the top: bright at the top edge, dimming downwards,
 *    with darker curtain folds drifting through the lower part.
 */

/** Full-screen triangle: three vertices cover the viewport, no index buffer needed. */
export const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** Ripple slots in the shader; older rings are recycled when a new one starts. */
export const MAX_RIPPLES = 4;

export function createFragmentShader(stopCount: number): string {
  if (!Number.isInteger(stopCount) || stopCount < 2) {
    throw new Error("Gradient palette needs at least 2 colors");
  }

  return /* glsl */ `
precision highp float;

#define STOPS ${stopCount}
#define RIPPLES ${MAX_RIPPLES}

uniform vec2 u_resolution;
uniform float u_time;          // seconds (already scaled by speed)
uniform float u_period;        // seconds per full cycle (rest + wave)
uniform float u_rest;          // fraction of the cycle resting on the first color
uniform vec2 u_lag;            // seconds the wave takes to cross x (left→right) and y (bottom→top)
uniform vec3 u_colors[STOPS];  // linear-light RGB; u_colors[0] is the resting color
uniform float u_frontAmount;   // seconds of noise added to the wave arrival (front irregularity)
uniform float u_frontScale;    // spatial frequency of that noise (lower = broader tongues)
uniform float u_intensity;     // overall brightness multiplier
uniform float u_floor;         // brightness at the bottom edge (top is 1.0)
uniform float u_topGlow;       // extra brightness on the top edge
uniform float u_folds;         // depth of the dark curtain folds
uniform float u_shadowChroma;  // saturation boost in the shadows (0 = plain darkening)

// Pointer effects (see effects.ts). Distances are in canvas heights.
uniform vec3 u_pointer;            // xy = smoothed pointer (UV), z = spotlight amount (0 = off)
uniform float u_spotRadius;
uniform vec4 u_ripples[RIPPLES];   // xy = origin (UV), z = age in seconds (< 0 = unused), w = unused
uniform vec3 u_ripple;             // x = strength, y = speed, z = width

// --- 2D simplex noise (Ashima Arts / Stefan Gustavson, MIT) -----------------
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// --- Cyclic palette lookup ---------------------------------------------------
// Each stop gets a smoothstep "tent" weight; neighbouring weights sum to 1, so
// this is a smooth interpolation that wraps from the last stop to the first.
vec3 palette(float t) {
  float x = fract(t) * float(STOPS);
  vec3 color = vec3(0.0);
  for (int i = 0; i < STOPS; i++) {
    float d = abs(x - float(i));
    d = min(d, float(STOPS) - d);
    float w = clamp(1.0 - d, 0.0, 1.0);
    color += u_colors[i] * (w * w * (3.0 - 2.0 * w));
  }
  return color;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;   // y = 0 at the bottom
  float aspect = u_resolution.x / u_resolution.y;
  float t = u_time;

  // Noise space: sqrt(aspect) keeps features readable on very wide canvases
  // (a wordmark is ~9:1) without collapsing into one blob on square ones.
  vec2 p = (uv - 0.5) * vec2(sqrt(aspect), 1.0) * 1.2;

  // --- When does the wave reach this pixel? -----------------------------------
  // Diagonal travel (bottom-left first) plus slowly drifting noise, which bends
  // the wave front into soft aurora-like tongues.
  float front = u_frontAmount * (
      snoise(p * u_frontScale + vec2(t * 0.04, -t * 0.03))
    + snoise(p * u_frontScale * 2.25 - vec2(t * 0.03, t * 0.05)) * 0.22);
  float lag = uv.x * u_lag.x + uv.y * u_lag.y + front;

  // Cycle phase: [0, 1 - rest) is the hue wave, the remainder rests on color 0.
  float phase = fract((t - lag) / u_period);
  float wave = clamp(phase / (1.0 - u_rest), 0.0, 1.0);
  vec3 color = palette(wave);

  // Canvas-height units, so circles stay round on the wide canvas.
  vec2 q = vec2(uv.x * aspect, uv.y);

  // --- Ripples: rings from pointer pulses repaint the aurora with a later hue ---
  float ringSum = 0.0;
  vec3 ringHue = vec3(0.0);
  float reach = length(vec2(aspect, 1.0)) + u_ripple.z;
  for (int i = 0; i < RIPPLES; i++) {
    vec4 r = u_ripples[i];
    if (r.z >= 0.0) {
      float life = reach / u_ripple.y;
      float fade = (1.0 - smoothstep(0.4, 1.0, r.z / life)) * smoothstep(0.0, 0.12, r.z);
      float x = (length(q - vec2(r.x * aspect, r.y)) - r.z * u_ripple.y) / u_ripple.z;
      float ring = exp(-x * x * 4.0) * fade;
      // The hue drifts across the ring's thickness, like a passing aurora band.
      ringHue += palette(wave + 0.3 - x * 0.12) * ring;
      ringSum += ring;
    }
  }
  float ringMix = clamp(ringSum, 0.0, 1.0) * u_ripple.x;
  color = mix(color, ringHue / max(ringSum, 1e-4), ringMix);

  // --- Light hanging from the top ----------------------------------------------
  float fall = mix(u_floor, 1.0, smoothstep(0.0, 1.0, uv.y));
  // Luminous top edge, like the light source just above the screen in the app.
  fall += u_topGlow * smoothstep(0.75, 1.0, uv.y);
  // Darker curtain folds, mostly in the lower half; they drift even while resting.
  float folds = snoise(vec2(p.x * 1.1 + t * 0.06, p.y * 0.6 - t * 0.1));
  fall *= 1.0 - u_folds * smoothstep(-0.2, 0.8, folds) * (1.0 - uv.y * 0.7);
  color *= fall * u_intensity;
  // Plain darkening drains chroma, so pale stops (lilacs) turn grey in the
  // shadows. Push saturation up as light falls off to keep shadows coloured.
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, 1.0 + u_shadowChroma * clamp(1.0 - fall, 0.0, 1.0));
  color = color * (1.0 + 1.3 * ringMix) + 0.02 * ringMix;   // rings carry light of their own

  // --- Spotlight: a pool of light under the pointer ------------------------------
  float dp = length(q - vec2(u_pointer.x * aspect, u_pointer.y));
  float spot = u_pointer.z * exp(-dp * dp / (u_spotRadius * u_spotRadius));
  color = color * (1.0 + spot) + 0.03 * spot;

  // Linear → sRGB, then a hair of dither to kill banding in the soft ramps.
  color = pow(max(color, 0.0), vec3(1.0 / 2.2));
  color += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;
}
