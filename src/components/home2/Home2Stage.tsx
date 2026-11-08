"use client";

import type { GradientStatus } from "@/src/hooks/useGeminiGradient";
import { DEFAULT_PARAMS, TILECT_PALETTE } from "@/src/lib/gemini-gradient";
import { useState } from "react";
import { AuroraTuner, type AuroraConfig } from "./AuroraTuner";
import { DEFAULT_GLOW, DEFAULT_HOVER_EFFECTS, GradientLogo } from "./GradientLogo";

const LOGO = { src: "/logo/Tilect_black1.png", width: 911, height: 103 };

const DEFAULT_CONFIG: AuroraConfig = {
  colors: [...TILECT_PALETTE],
  params: DEFAULT_PARAMS,
  glow: DEFAULT_GLOW,
  hover: DEFAULT_HOVER_EFFECTS,
};

/** Centered gradient logo, plus the tuning panel when `tune` is on. */
export function Home2Stage({ tune }: { tune: boolean }) {
  const [config, setConfig] = useState<AuroraConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<GradientStatus | null>(null);

  return (
    <>
      {/* While tuning, center the logo in the space the panel leaves free. */}
      <div className={`flex w-full justify-center ${tune ? "max-sm:pb-[55dvh] sm:pr-84" : ""}`}>
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
          value={config}
          status={status}
          onChange={setConfig}
          onReset={() => setConfig(DEFAULT_CONFIG)}
        />
      )}
    </>
  );
}
