"use client";

import type { GradientStatus } from "@/src/hooks/useGeminiGradient";
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
  hover: DEFAULT_HOVER_EFFECTS,
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
const HIDDEN_KEY = "tilect:aurora-panel-hidden";

const emptySubscribe = () => () => {};

/** Centered gradient logo, plus the design panel when `tune` is on. */
export function HomeStage({ tune }: { tune: boolean }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  // Until mounted the theme is unknown on the server: render dark, then switch.
  const theme: ThemeName = mounted && resolvedTheme === "light" ? "light" : "dark";

  const [configs, setConfigs] = useState<ThemeConfigs>(DEFAULT_CONFIGS);
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState<GradientStatus | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore the designer's work (TEST / local only).
  useEffect(() => {
    if (!tune) return;
    const stored = readStorage<Partial<ThemeConfigs>>(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off hydration from localStorage
    if (stored) setConfigs(mergeConfigs(stored));
    setHidden(readStorage<boolean>(HIDDEN_KEY) ?? false);
    setLoaded(true);
  }, [tune]);

  useEffect(() => {
    if (tune && loaded) writeStorage(STORAGE_KEY, configs);
  }, [tune, loaded, configs]);

  useEffect(() => {
    if (tune && loaded) writeStorage(HIDDEN_KEY, hidden);
  }, [tune, loaded, hidden]);

  // Ctrl+D (the Control key on both Mac and Windows) shows / hides the panel.
  useEffect(() => {
    if (!tune) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setHidden((h) => !h);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tune]);

  const config = configs[theme];
  const panelOpen = tune && !hidden;

  return (
    <>
      {/* While the panel is open, center the logo in the space it leaves free. */}
      <div className={`flex w-full justify-center ${panelOpen ? "max-sm:pb-[55dvh] sm:pr-84" : ""}`}>
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
          hidden={hidden}
          onToggleHidden={() => setHidden((h) => !h)}
          onChange={(next) => setConfigs((c) => ({ ...c, [theme]: next }))}
          onReset={() => setConfigs((c) => ({ ...c, [theme]: DEFAULT_CONFIGS[theme] }))}
        />
      )}
    </>
  );
}

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
