"use client";

import { ThemeToggle } from "../theme";
import { LocaleSelector } from "./LocaleSelector";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-end px-4 py-3">
        {/* Theme toggle + Locale selector */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSelector />
        </div>
      </div>
    </nav>
  );
}
