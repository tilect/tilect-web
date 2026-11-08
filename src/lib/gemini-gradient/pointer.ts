/**
 * Framework-free pointer tracking relative to an element.
 *
 * Reports the pointer in the element's UV space (x 0→1 left→right, y 0→1
 * bottom→top, matching the shader) and turns movement into discrete
 * "pulses": on entering the hover zone, on every press, and after the pointer
 * has travelled a set distance. What a pulse does is up to the caller.
 */

export interface PointerSample {
  x: number;
  y: number;
  /** Inside the element, or within `margin` of it. */
  inside: boolean;
}

export interface PointerTrackerOptions {
  onMove?: (sample: PointerSample) => void;
  onPulse?: (sample: PointerSample) => void;
  /** Hover zone around the element, as a fraction of its height. Default 0.5. */
  margin?: number;
  /** Pointer travel between pulses while moving, as a fraction of the element width. Default 0.22. */
  pulseDistance?: number;
  /** Minimum time between movement pulses, in ms (presses always pulse). Default 350. */
  pulseInterval?: number;
}

/** Start tracking; returns a function that stops it. */
export function createPointerTracker(
  target: Element,
  { onMove, onPulse, margin = 0.5, pulseDistance = 0.22, pulseInterval = 350 }: PointerTrackerOptions,
): () => void {
  let inside = false;
  let last: PointerSample = { x: 0.5, y: 0.5, inside: false };
  let lastClient: { x: number; y: number } | null = null;
  let travelled = 0;
  let lastPulse = -Infinity;

  function sample(e: PointerEvent): { s: PointerSample; width: number } {
    const r = target.getBoundingClientRect();
    const m = margin * r.height;
    return {
      s: {
        x: (e.clientX - r.left) / r.width,
        y: 1 - (e.clientY - r.top) / r.height,
        inside:
          e.clientX >= r.left - m &&
          e.clientX <= r.right + m &&
          e.clientY >= r.top - m &&
          e.clientY <= r.bottom + m,
      },
      width: r.width,
    };
  }

  function pulse(s: PointerSample, force = false) {
    const now = performance.now();
    if (!force && now - lastPulse < pulseInterval) return;
    lastPulse = now;
    travelled = 0;
    onPulse?.(s);
  }

  function onPointerMove(e: PointerEvent) {
    const { s, width } = sample(e);
    if (s.inside) {
      if (!inside) {
        pulse(s);
      } else if (lastClient && width > 0) {
        travelled += Math.hypot(e.clientX - lastClient.x, e.clientY - lastClient.y) / width;
        if (travelled >= pulseDistance) pulse(s);
      }
    }
    inside = s.inside;
    lastClient = { x: e.clientX, y: e.clientY };
    last = s;
    onMove?.(s);
  }

  function onPointerDown(e: PointerEvent) {
    const { s } = sample(e);
    if (s.inside) pulse(s, true);
    onPointerMove(e);
  }

  function leave() {
    if (!inside && !last.inside) return;
    inside = false;
    lastClient = null;
    last = { ...last, inside: false };
    onMove?.(last);
  }

  // Touch has no hover: the effect lasts while the finger is down.
  function onPointerUp(e: PointerEvent) {
    if (e.pointerType !== "mouse") leave();
  }

  const root = document.documentElement;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", leave, { passive: true });
  window.addEventListener("blur", leave);
  root.addEventListener("pointerleave", leave);

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", leave);
    window.removeEventListener("blur", leave);
    root.removeEventListener("pointerleave", leave);
  };
}
