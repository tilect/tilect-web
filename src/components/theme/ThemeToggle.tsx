"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

const BUTTON =
  "grid size-8 place-items-center text-foreground/40 transition-colors hover:text-foreground/80 focus-visible:text-foreground/80 focus-visible:outline-none";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return (
      <button type="button" className={`${BUTTON} ${className}`} aria-label="Toggle theme">
        <span className="block size-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`${BUTTON} ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <PixelSun /> : <PixelMoon />}
    </button>
  );
}

/** Pixel-art icons on a 12×12 grid, one-pixel strokes, drawn crisp. */
function PixelIcon({ pixels }: { pixels: readonly (readonly [number, number])[] }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className="block size-4"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {pixels.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
      ))}
    </svg>
  );
}

// Hollow 4×4 core with eight single-pixel rays.
const SUN = [
  [5, 4], [6, 4], [4, 5], [7, 5], [4, 6], [7, 6], [5, 7], [6, 7],
  [5, 1], [6, 1], [5, 10], [6, 10], [1, 5], [1, 6], [10, 5], [10, 6],
  [2, 2], [9, 2], [2, 9], [9, 9],
] as const;

// Thin crescent opening to the top right.
const MOON = [
  [5, 1], [6, 1], [3, 2], [4, 2], [2, 3], [2, 4], [1, 5], [1, 6],
  [2, 7], [2, 8], [3, 9], [4, 9], [5, 10], [6, 10], [7, 10], [8, 9],
  [9, 8], [10, 7], [7, 2], [6, 3], [6, 4], [6, 5], [7, 6], [8, 7], [9, 7],
] as const;

function PixelSun() {
  return <PixelIcon pixels={SUN} />;
}

function PixelMoon() {
  return <PixelIcon pixels={MOON} />;
}
