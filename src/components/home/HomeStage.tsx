"use client";

import type { GradientStatus } from "@/src/hooks/useGeminiGradient";
import { ICON_BUTTON, PixelIcon, ThemeToggle } from "@/src/components/theme";
import { DEFAULT_PARAMS, TILECT_PALETTE } from "@/src/lib/gemini-gradient";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AuroraTuner, type AuroraConfig, type ThemeName } from "./AuroraTuner";
import { DEFAULT_GLOW, DEFAULT_HOVER_EFFECTS, GradientLogo } from "./GradientLogo";

const LOGO = { src: "/logo/Tilect_black1.png", width: 911, height: 103 };

type ThemeConfigs = Record<ThemeName, AuroraConfig>;

const DARK_CONFIG: AuroraConfig = {
  colors: [...TILECT_PALETTE],
  params: DEFAULT_PARAMS,
  glow: DEFAULT_GLOW,
  hover: {
    ...DEFAULT_HOVER_EFFECTS,
    spotlight: { ...DEFAULT_HOVER_EFFECTS.spotlight, enabled: true },
    ripple: { ...DEFAULT_HOVER_EFFECTS.ripple, enabled: true },
  },
};

/**
 * Production config per theme. Paste the panel's "Copiar" output here.
 * Light starts as a copy of dark until the designer tunes it.
 */
const DEFAULT_CONFIGS: ThemeConfigs = {
  dark: DARK_CONFIG,
  light: structuredClone(DARK_CONFIG),
};

/** Only read/written while the design panel is on (local / TEST). */
const STORAGE_KEY = "tilect:aurora-config:v1";

const emptySubscribe = () => () => {};

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

      <div className="flex w-full justify-center">
        <GradientLogo
          {...LOGO}
          colors={config.colors}
          params={config.params}
          glow={config.glow}
          effects={config.hover}
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
