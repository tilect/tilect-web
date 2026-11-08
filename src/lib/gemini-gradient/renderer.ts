import { paletteToLinearRgb } from "./palettes";
import { DEFAULT_PARAMS, type AuroraParams } from "./params";
import { createFragmentShader, VERTEX_SHADER } from "./shaders";

export interface GradientRendererOptions {
  /** Hex color stops; the first one is the resting color. */
  palette: readonly string[];
  /** Initial tuning; anything omitted uses `DEFAULT_PARAMS`. */
  params?: Partial<AuroraParams>;
  /** Device-pixel-ratio cap; the effect is soft, so 2 is plenty. Default 2. */
  maxDpr?: number;
  /**
   * Optional 2D canvas that receives a downscaled copy of every frame.
   * Useful for a blurred "glow" layer without paying for a second WebGL context.
   */
  mirror?: HTMLCanvasElement | null;
  /** Resolution of the mirror relative to the canvas CSS size. Default 0.25. */
  mirrorScale?: number;
  /** Called after the first frame has been drawn. */
  onFirstFrame?: () => void;
  /** Called whenever the render loop changes state (for debugging / dev UI). */
  onStatus?: (status: RendererStatus) => void;
}

/** `paused` = off-screen or tab hidden; `reduced-motion` = a single still frame is shown. */
export type RendererStatus = "animating" | "paused" | "reduced-motion" | "context-lost";

export interface GradientRenderer {
  /** Update tuning live; the clock keeps running. */
  setParams(params: Partial<AuroraParams>): void;
  /** Swap colors live. Must keep the same number of stops (the shader is compiled for it). */
  setPalette(palette: readonly string[]): void;
  destroy(): void;
}

const UNIFORMS = [
  "resolution",
  "time",
  "colors",
  "period",
  "rest",
  "lag",
  "frontAmount",
  "frontScale",
  "intensity",
  "floor",
  "topGlow",
  "folds",
  "shadowChroma",
] as const;

/**
 * Start the clock just before a wave so the page opens on the resting color
 * and the first aurora rolls in ~1s after load.
 */
const START_LEAD = 1;
/** Time (in cycle seconds) of the still frame shown when motion is reduced: mid-wave, several hues visible. */
const STILL_TIME = 2.2;

/**
 * Animate the Gemini "thinking" aurora on `canvas`.
 *
 * Handles sizing (ResizeObserver + DPR), pausing when off-screen or the tab is
 * hidden, `prefers-reduced-motion` (renders one still frame) and WebGL
 * context loss/restore.
 *
 * Returns `null` when WebGL is unavailable so callers can keep a CSS fallback.
 */
export function createGradientRenderer(
  canvas: HTMLCanvasElement,
  options: GradientRendererOptions,
): GradientRenderer | null {
  const context = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!context) return null;
  // Re-bind with a non-null type so the hoisted helpers below see it narrowed.
  const gl: WebGLRenderingContext = context;

  const { palette, maxDpr = 2, mirror = null, mirrorScale = 0.25, onFirstFrame, onStatus } = options;

  const stopCount = palette.length;
  let colors = paletteToLinearRgb(palette);
  let params: AuroraParams = { ...DEFAULT_PARAMS, ...options.params };
  const fragmentSource = createFragmentShader(stopCount);
  const mirrorCtx = mirror?.getContext("2d") ?? null;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let program: WebGLProgram | null = null;
  let uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null> | null = null;

  let rafId = 0;
  let lastTs = 0;
  let time = -START_LEAD;
  let firstFrameDrawn = false;
  let inView = true;
  let contextLost = false;
  let destroyed = false;
  let status: RendererStatus | null = null;

  const reducedMotion = () => motionQuery.matches;
  const shouldAnimate = () =>
    !destroyed && !contextLost && inView && !document.hidden && !reducedMotion();

  // --- GL setup (also re-run after a context restore) -------------------------
  function init(): boolean {
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return false;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[gemini-gradient] link failed:", gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return false;
    }
    gl.useProgram(prog);

    // One triangle larger than clip space covers the whole viewport.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    uniforms = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(prog, `u_${name}`)]),
    ) as NonNullable<typeof uniforms>;
    program = prog;
    applyUniforms();
    return true;
  }

  /** Push colors + tuning to the GPU (cheap; called on init and on every live change). */
  function applyUniforms() {
    if (!uniforms) return;
    gl.uniform3fv(uniforms.colors, colors);
    gl.uniform1f(uniforms.period, Math.max(params.period, 0.1));
    gl.uniform1f(uniforms.rest, Math.min(Math.max(params.rest, 0), 0.95));
    gl.uniform2f(uniforms.lag, params.lagX, params.lagY);
    gl.uniform1f(uniforms.frontAmount, params.frontAmount);
    gl.uniform1f(uniforms.frontScale, params.frontScale);
    gl.uniform1f(uniforms.intensity, params.intensity);
    gl.uniform1f(uniforms.floor, params.floor);
    gl.uniform1f(uniforms.topGlow, params.topGlow);
    gl.uniform1f(uniforms.folds, params.folds);
    gl.uniform1f(uniforms.shadowChroma, params.shadowChroma);
  }

  // --- Sizing ------------------------------------------------------------------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (mirror) {
      const mw = Math.max(1, Math.round(canvas.clientWidth * mirrorScale));
      const mh = Math.max(1, Math.round(canvas.clientHeight * mirrorScale));
      if (mirror.width !== mw || mirror.height !== mh) {
        mirror.width = mw;
        mirror.height = mh;
      }
    }
  }

  // --- Drawing -----------------------------------------------------------------
  function draw() {
    if (!program || !uniforms || contextLost) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // The drawing buffer is still valid within the same task, so copying now
    // works without `preserveDrawingBuffer`.
    if (mirrorCtx && mirror) {
      mirrorCtx.drawImage(canvas, 0, 0, mirror.width, mirror.height);
    }

    if (!firstFrameDrawn) {
      firstFrameDrawn = true;
      onFirstFrame?.();
    }
  }

  function frame(ts: number) {
    rafId = 0;
    // Clamp dt so returning from a background tab doesn't jump the animation.
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.1) : 0;
    lastTs = ts;
    time += dt * params.speed;
    draw();
    if (shouldAnimate()) rafId = requestAnimationFrame(frame);
  }

  /** Start or stop the loop to match current conditions; draw a still frame when paused by reduced motion. */
  function sync() {
    const next: RendererStatus = contextLost
      ? "context-lost"
      : reducedMotion()
        ? "reduced-motion"
        : shouldAnimate()
          ? "animating"
          : "paused";
    if (next !== status && !destroyed) {
      status = next;
      onStatus?.(next);
    }

    if (shouldAnimate()) {
      if (!rafId) {
        lastTs = 0;
        rafId = requestAnimationFrame(frame);
      }
      return;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (reducedMotion() && !destroyed && !contextLost) {
      time = STILL_TIME;
      draw();
    }
  }

  // --- Events --------------------------------------------------------------------
  function onContextLost(e: Event) {
    e.preventDefault();
    contextLost = true;
    program = null;
    uniforms = null;
    sync();
  }

  function onContextRestored() {
    contextLost = false;
    if (init()) {
      resize();
      sync();
      if (!rafId) draw();
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    // When animating the next frame picks up the new size; otherwise redraw now.
    if (!rafId) draw();
  });

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });

  if (!init()) return null;

  resize();
  resizeObserver.observe(canvas);
  intersectionObserver.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  motionQuery.addEventListener("change", sync);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  // Paint immediately so there's no blank frame before the first rAF.
  if (reducedMotion()) time = STILL_TIME;
  draw();
  sync();

  /** Redraw right away when no loop is running (reduced motion / off-screen), so edits show. */
  function redrawIfIdle() {
    if (!rafId) draw();
  }

  return {
    setParams(next) {
      params = { ...params, ...next };
      applyUniforms();
      redrawIfIdle();
    },
    setPalette(next) {
      if (next.length !== stopCount) {
        throw new Error(`setPalette needs ${stopCount} colors (got ${next.length})`);
      }
      colors = paletteToLinearRgb(next);
      applyUniforms();
      redrawIfIdle();
    },
    destroy() {
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motionQuery.removeEventListener("change", sync);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (program && !contextLost) gl.deleteProgram(program);
      program = null;
    },
  };
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error("[gemini-gradient] shader compile failed:", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}
