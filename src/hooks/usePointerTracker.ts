"use client";

import { createPointerTracker, type PointerTrackerOptions } from "@/src/lib/gemini-gradient";
import { useEffect, useRef, type RefObject } from "react";

/**
 * Tracks the pointer relative to `targetRef` while `enabled` (see `createPointerTracker`).
 * Callbacks may change between renders without re-attaching listeners.
 * Stays off when the user prefers reduced motion: hover effects are motion too.
 */
export function usePointerTracker(
  targetRef: RefObject<Element | null>,
  { enabled = true, ...options }: PointerTrackerOptions & { enabled?: boolean },
) {
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return createPointerTracker(target, {
      margin: latest.current.margin,
      onMove: (s) => latest.current.onMove?.(s),
      onPulse: (s) => latest.current.onPulse?.(s),
    });
  }, [targetRef, enabled]);
}
