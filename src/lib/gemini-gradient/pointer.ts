/**
 * Framework-free pointer tracking relative to an element.
 *
 * Reports the pointer in the element's UV space (x 0→1 left→right, y 0→1
 * bottom→top, matching the shader) and emits one "pulse" each time the
 * pointer enters the hover zone (nothing more while it stays inside). What a
 * pulse does is up to the caller.
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
}

/** Start tracking; returns a function that stops it. */
export function createPointerTracker(
  target: Element,
  { onMove, onPulse, margin = 0.5 }: PointerTrackerOptions,
): () => void {
  let inside = false;
  let last: PointerSample = { x: 0.5, y: 0.5, inside: false };

  function sample(e: PointerEvent): PointerSample {
    const r = target.getBoundingClientRect();
    const m = margin * r.height;
    return {
      x: (e.clientX - r.left) / r.width,
      y: 1 - (e.clientY - r.top) / r.height,
      inside:
        e.clientX >= r.left - m &&
        e.clientX <= r.right + m &&
        e.clientY >= r.top - m &&
        e.clientY <= r.bottom + m,
    };
  }

  // Touch goes through here too (pointerdown): a tap that lands inside is an entry.
  function onPointerMove(e: PointerEvent) {
    const s = sample(e);
    if (s.inside && !inside) onPulse?.(s);
    inside = s.inside;
    last = s;
    onMove?.(s);
  }

  function leave() {
    if (!inside && !last.inside) return;
    inside = false;
    last = { ...last, inside: false };
    onMove?.(last);
  }

  // Touch has no hover: the effect lasts while the finger is down.
  function onPointerUp(e: PointerEvent) {
    if (e.pointerType !== "mouse") leave();
  }

  const root = document.documentElement;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", leave, { passive: true });
  window.addEventListener("blur", leave);
  root.addEventListener("pointerleave", leave);

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", leave);
    window.removeEventListener("blur", leave);
    root.removeEventListener("pointerleave", leave);
  };
}
