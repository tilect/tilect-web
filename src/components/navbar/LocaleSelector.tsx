"use client";

import { usePathname, useRouter } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "../ui/typography";

export function LocaleSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (nextLocale: string) => {
      router.replace(pathname, { locale: nextLocale });
      setOpen(false);
    },
    [router, pathname],
  );

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors hover:bg-foreground/10"
      >
        <Text as="span" size="sm" weight="bold" className="uppercase">
          {locale}
        </Text>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 z-50 mt-1 overflow-hidden rounded-md border border-foreground/10 bg-background shadow-lg"
        >
          {routing.locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                type="button"
                onClick={() => handleSelect(loc)}
                className={`flex w-full items-center px-4 py-2 text-left transition-colors hover:bg-foreground/10 ${
                  loc === locale ? "bg-foreground/5" : ""
                }`}
              >
                <Text
                  as="span"
                  size="sm"
                  weight={loc === locale ? "bold" : "normal"}
                  className="uppercase"
                >
                  {loc}
                </Text>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
