"use client";

import { useEffect, useRef, type AnchorHTMLAttributes } from "react";

const HOLD_MS = 700;
const TOUCH_DELAY_MS = 240;

/**
 * Anchor with visible tap feedback. Touch has no hover and a quick tap ends
 * `:active` before it can be seen, so a press sets `data-pressed` for a moment
 * (CSS keys off it) and, for touch/pen only, navigation waits a beat so the
 * animation is actually seen before the browser leaves the page.
 */
export function PressLink({
  spot = false,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Flag `data-lit` while a mouse hovers (the CSS keys the hover state off it). */
  spot?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const hold = useRef<number | undefined>(undefined);
  const nav = useRef<number | undefined>(undefined);
  const pointer = useRef("mouse");

  useEffect(
    () => () => {
      window.clearTimeout(hold.current);
      window.clearTimeout(nav.current);
    },
    [],
  );

  return (
    <a
      ref={ref}
      {...props}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        if (spot && e.pointerType === "mouse" && ref.current) ref.current.dataset.lit = "true";
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        if (ref.current) delete ref.current.dataset.lit;
      }}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        pointer.current = e.pointerType;
        const el = ref.current;
        if (!el) return;
        el.dataset.pressed = "true";
        window.clearTimeout(hold.current);
        hold.current = window.setTimeout(() => delete el.dataset.pressed, HOLD_MS);
      }}
      onClick={(e) => {
        onClick?.(e);
        const touch = pointer.current !== "mouse";
        pointer.current = "mouse";
        const href = props.href;
        const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (e.defaultPrevented || !touch || modified || reduced || !href) return;

        e.preventDefault();
        nav.current = window.setTimeout(() => {
          if (props.target === "_blank") {
            const w = window.open(href, "_blank");
            if (w) w.opener = null;
            else window.location.href = href;
          } else {
            window.location.href = href;
          }
        }, TOUCH_DELAY_MS);
      }}
    />
  );
}
