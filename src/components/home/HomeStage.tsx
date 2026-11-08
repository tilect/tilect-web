"use client";

import type { GradientStatus } from "@/src/hooks/useGeminiGradient";
import { ICON_BUTTON, PixelIcon, ThemeToggle } from "@/src/components/theme";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AuroraTuner, type AuroraConfig, type ThemeName } from "./AuroraTuner";
import { GradientLogo } from "./GradientLogo";

const LOGO = { src: "/logo/Tilect_black1.png", width: 911, height: 103 };

type ThemeConfigs = Record<ThemeName, AuroraConfig>;

/** Animation values, shared by both themes: only the colors differ. Paste the panel's "Copiar" values here. */
const ANIMATION: Omit<AuroraConfig, "colors"> = {
  params: {
    speed: 1, period: 8, rest: 0.4, lagX: 1.3, lagY: 0.6, frontAmount: 0.55, frontScale: 0.4,
    intensity: 1, floor: 0.4, topGlow: 0.25, folds: 0.25, shadowChroma: 1,
  },
  glow: { opacity: 0.85, blur: 8.5 },
  hover: {
    spotlight: { enabled: true, strength: 0.6, radius: 0.6 },
    ripple: { enabled: true, strength: 0.6, speed: 2, width: 1.6, retrigger: 0.75 },
    halo: { enabled: true, follow: 0.08, boost: 1.85 },
  },
};

/** Per-theme colors. */
const DEFAULT_CONFIGS: ThemeConfigs = {
  dark: { colors: ["#6C63B5", "#8F86D1", "#ADA2F2", "#8F86D1", "#7E72D6"], ...ANIMATION },
  light: { colors: ["#6C63B5", "#8F86D1", "#ADA2F2", "#8F86D1", "#7E72D6"], ...ANIMATION },
};

/** Only read/written while the design panel is on (local / TEST). */
const STORAGE_KEY = "tilect:aurora-config:v2";

const emptySubscribe = () => () => {};

/** Phones and other touch-first screens: only the tap ripple, no spotlight or halo. */
const TOUCH_QUERY = "(max-width: 639px), (pointer: coarse)";

function subscribeTouch(cb: () => void) {
  const mq = window.matchMedia(TOUCH_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Centered gradient logo and the top-right controls (theme toggle, plus a brush
 * that opens the design drawer when `tune` is on).
 */
export function HomeStage({ tune }: { tune: boolean }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  // Until mounted the theme is unknown on the server: render dark, then switch.
  const theme: ThemeName = mounted && resolvedTheme === "light" ? "light" : "dark";

  const [configs, setConfigs] = useState<ThemeConfigs>(DEFAULT_CONFIGS);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<GradientStatus | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore the designer's work (TEST / local only).
  useEffect(() => {
    if (!tune) return;
    const stored = readStorage<Partial<ThemeConfigs>>(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off hydration from localStorage
    if (stored) setConfigs(mergeConfigs(stored));
    setLoaded(true);
  }, [tune]);

  useEffect(() => {
    if (tune && loaded) writeStorage(STORAGE_KEY, configs);
  }, [tune, loaded, configs]);

  // Ctrl+D (the Control key on both Mac and Windows) toggles the drawer; Esc closes it.
  useEffect(() => {
    if (!tune) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tune]);

  const config = configs[theme];
  const touch = useSyncExternalStore(
    subscribeTouch,
    () => window.matchMedia(TOUCH_QUERY).matches,
    () => false,
  );
  const hover = touch
    ? {
        spotlight: { ...config.hover.spotlight, enabled: false },
        ripple: { ...config.hover.ripple, enabled: true },
        halo: { ...config.hover.halo, enabled: false },
      }
    : config.hover;

  return (
    <>
      {/* Over the drawer (always ink), force the dark tokens so the icons stay visible. */}
      <div className={`fixed right-4 top-4 z-50 flex items-center gap-1 ${tune && open ? "dark" : ""}`}>
        {tune && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="design-drawer"
            aria-label={open ? "Cerrar ajustes de diseño" : "Abrir ajustes de diseño"}
            title="Ajustes de diseño (Ctrl+D)"
            className={`${ICON_BUTTON} ${open ? "text-foreground/80" : ""}`}
          >
            <PixelIcon pixels={BRUSH} />
          </button>
        )}
        <ThemeToggle />
      </div>

      <div className="flex w-full justify-center px-6">
        <GradientLogo
          {...LOGO}
          colors={config.colors}
          params={config.params}
          glow={config.glow}
          effects={hover}
          onStatus={tune ? setStatus : undefined}
          className="w-full max-w-4xl"
        />
      </div>
      {tune && (
        <AuroraTuner
          theme={theme}
          value={config}
          exportValue={configs}
          status={status}
          open={open}
          onChange={(next) => setConfigs((c) => ({ ...c, [theme]: next }))}
          onReset={() => setConfigs((c) => ({ ...c, [theme]: DEFAULT_CONFIGS[theme] }))}
        />
      )}
    </>
  );
}

// Pixel paintbrush: bristles bottom left, handle up to the top right.
const BRUSH = [
  [10, 1], [9, 2], [10, 2], [8, 3], [9, 3], [7, 4], [8, 4], [6, 5], [7, 5],
  [4, 6], [5, 6], [3, 7], [4, 7], [5, 7], [2, 8], [3, 8], [4, 8], [1, 9], [2, 9],
  [1, 10],
] as const;

/** Stored configs over the defaults, so keys added later don't come back undefined. */
function mergeConfigs(stored: Partial<ThemeConfigs>): ThemeConfigs {
  const merge = (base: AuroraConfig, s?: Partial<AuroraConfig>): AuroraConfig => ({
    colors: Array.isArray(s?.colors) && s.colors.length ? s.colors : base.colors,
    params: { ...base.params, ...s?.params },
    glow: { ...base.glow, ...s?.glow },
    hover: {
      spotlight: { ...base.hover.spotlight, ...s?.hover?.spotlight },
      ripple: { ...base.hover.ripple, ...s?.hover?.ripple },
      halo: { ...base.hover.halo, ...s?.hover?.halo },
    },
  });
  return {
    dark: merge(DEFAULT_CONFIGS.dark, stored.dark),
    light: merge(DEFAULT_CONFIGS.light, stored.light),
  };
}

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, blocked): the panel still works, just won't persist.
  }
}
