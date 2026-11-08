"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export const ICON_BUTTON =
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
      <button type="button" className={`${ICON_BUTTON} ${className}`} aria-label="Toggle theme">
        <span className="block size-6" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`${ICON_BUTTON} ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/** Thin line icons: 1.5 stroke on a 24 grid, same as the social icons, round caps, crisp at any size. */
export function LineIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="block size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function SunIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </LineIcon>
  );
}

function MoonIcon() {
  return (
    <LineIcon>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </LineIcon>
  );
}

export function BrushIcon() {
  return (
    <LineIcon>
      <path d="M18.5 3.5l2 2L12 14l-2-2z" />
      <path d="M10 12c-2.2-.3-4 1.3-4 3.3 0 1.4-.8 2.5-2 3.2 4 1.3 8.5.2 8-4.5" />
    </LineIcon>
  );
}
