/**
 * Pointer-driven effects drawn by the renderer's shader. Each one is
 * independent and can be switched on/off on its own.
 *
 * Distances are in canvas heights (for a wordmark: the logo's cap height),
 * so the effects keep their look at any size.
 */

/** A pool of light that follows the pointer over the aurora. */
export interface SpotlightEffect {
  enabled: boolean;
  /** Extra brightness at the pointer (1 = +100%). */
  strength: number;
  /** Radius of the light pool, in canvas heights. */
  radius: number;
}

/** Rings that expand from the pointer and repaint the aurora with a later hue as they pass. */
export interface RippleEffect {
  enabled: boolean;
  /** How strongly a ring repaints what it crosses (0..1). */
  strength: number;
  /** Expansion speed, in canvas heights per second. */
  speed: number;
  /** Ring thickness, in canvas heights. */
  width: number;
  /**
   * Re-entering while a ring is still travelling only starts a new one once the
   * current ring has covered this fraction of its path (0..1).
   */
  retrigger: number;
}

export interface PointerEffects {
  spotlight: SpotlightEffect;
  ripple: RippleEffect;
}

export const DEFAULT_POINTER_EFFECTS: PointerEffects = {
  spotlight: { enabled: false, strength: 0.9, radius: 1.6 },
  ripple: { enabled: false, strength: 0.85, speed: 6, width: 0.9, retrigger: 0.75 },
};

/** Pointer position in canvas UV: x 0→1 left→right, y 0→1 bottom→top (may fall outside while near). */
export interface PointerPosition {
  x: number;
  y: number;
}
