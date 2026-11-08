"use client";

import { Text } from "@/src/components/ui/typography";
import type { GradientStatus } from "@/src/hooks/useGeminiGradient";
import { PALETTES, type AuroraParams, type PaletteName } from "@/src/lib/gemini-gradient";
import { useState } from "react";
import { toast } from "sonner";
import type { GlowParams } from "./GradientLogo";

/**
 * Dev-only tuning panel for the home 2 aurora. Not translated on purpose:
 * it's a design tool, only rendered in development or with `?tune`.
 */

export type AuroraConfig = {
  colors: string[];
  params: AuroraParams;
  glow: GlowParams;
};

type Slider<K extends string> = {
  key: K;
  label: string;
  min: number;
  max: number;
  step: number;
};

const SECTIONS: { title: string; sliders: Slider<keyof AuroraParams>[] }[] = [
  {
    title: "Tiempo",
    sliders: [
      { key: "speed", label: "Velocidad", min: 0.1, max: 3, step: 0.05 },
      { key: "period", label: "Duración del ciclo (s)", min: 2, max: 20, step: 0.5 },
      { key: "rest", label: "Reposo en el primer color", min: 0, max: 0.9, step: 0.05 },
    ],
  },
  {
    title: "Ola",
    sliders: [
      { key: "lagX", label: "Desfase izquierda → derecha (s)", min: 0, max: 5, step: 0.1 },
      { key: "lagY", label: "Desfase abajo → arriba (s)", min: -2, max: 3, step: 0.1 },
      { key: "frontAmount", label: "Irregularidad del frente", min: 0, max: 2, step: 0.05 },
      { key: "frontScale", label: "Detalle del frente (− = lenguas anchas)", min: 0.1, max: 2, step: 0.05 },
    ],
  },
  {
    title: "Luz",
    sliders: [
      { key: "intensity", label: "Intensidad", min: 0.3, max: 2, step: 0.05 },
      { key: "floor", label: "Brillo en la parte baja", min: 0, max: 1, step: 0.05 },
      { key: "topGlow", label: "Brillo del borde superior", min: 0, max: 1, step: 0.05 },
      { key: "folds", label: "Pliegues oscuros", min: 0, max: 1, step: 0.05 },
      { key: "shadowChroma", label: "Color en las sombras (0 = se agrisan)", min: 0, max: 3, step: 0.1 },
    ],
  },
];

const GLOW_SLIDERS: Slider<keyof GlowParams>[] = [
  { key: "opacity", label: "Opacidad", min: 0, max: 1, step: 0.05 },
  { key: "blur", label: "Desenfoque (% del ancho)", min: 0, max: 15, step: 0.5 },
];

const STATUS_LABEL: Record<GradientStatus, { text: string; ok: boolean }> = {
  animating: { text: "Animando (WebGL)", ok: true },
  paused: { text: "En pausa (fuera de pantalla o pestaña oculta)", ok: false },
  "reduced-motion": { text: "Fotograma fijo: el sistema pide reducir movimiento", ok: false },
  "context-lost": { text: "Contexto WebGL perdido", ok: false },
  "no-webgl": { text: "Sin WebGL: se ve el fondo CSS estático", ok: false },
};

type Props = {
  value: AuroraConfig;
  status: GradientStatus | null;
  onChange: (next: AuroraConfig) => void;
  onReset: () => void;
};

export function AuroraTuner({ value, status, onChange, onReset }: Props) {
  const [open, setOpen] = useState(true);

  const setParam = (key: keyof AuroraParams, n: number) =>
    onChange({ ...value, params: { ...value.params, [key]: n } });
  const setGlow = (key: keyof GlowParams, n: number) =>
    onChange({ ...value, glow: { ...value.glow, [key]: n } });
  const setColor = (i: number, hex: string) =>
    onChange({ ...value, colors: value.colors.map((c, j) => (j === i ? hex.toUpperCase() : c)) });
  const loadPreset = (name: PaletteName) => onChange({ ...value, colors: [...PALETTES[name]] });

  async function copy() {
    const json = JSON.stringify(value, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      toast.success("Configuración copiada");
    } catch {
      console.log(json);
      toast.error("No se pudo copiar; está en la consola");
    }
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 flex max-h-[55dvh] flex-col overflow-hidden rounded-xl border border-paper/10 bg-ink/85 text-paper shadow-2xl backdrop-blur-md sm:inset-x-auto sm:right-4 sm:top-4 sm:max-h-none sm:w-80">
      <header className="flex items-center justify-between gap-2 border-b border-paper/10 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2"
          aria-expanded={open}
        >
          <Text as="span" size="sm" weight="bold">
            Ajustes aurora
          </Text>
          <span className="text-paper/50">{open ? "▾" : "▸"}</span>
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md px-2 py-1 text-xs text-paper/70 hover:bg-paper/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={copy}
            className="rounded-md bg-accent px-2 py-1 text-xs font-bold text-ink hover:bg-accent/80"
          >
            Copiar
          </button>
        </div>
      </header>

      {status && (
        <div className="flex items-center gap-2 border-b border-paper/10 px-4 py-2 text-xs">
          <span
            className={`size-2 shrink-0 rounded-full ${STATUS_LABEL[status].ok ? "bg-accent" : "bg-paper/30"}`}
          />
          <span className="text-paper/70">{STATUS_LABEL[status].text}</span>
        </div>
      )}

      {open && (
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {SECTIONS.map((section) => (
            <Section key={section.title} title={section.title}>
              {section.sliders.map((s) => (
                <Range key={s.key} spec={s} value={value.params[s.key]} onChange={(n) => setParam(s.key, n)} />
              ))}
            </Section>
          ))}

          <Section title="Halo">
            {GLOW_SLIDERS.map((s) => (
              <Range key={s.key} spec={s} value={value.glow[s.key]} onChange={(n) => setGlow(s.key, n)} />
            ))}
          </Section>

          <Section title="Colores">
            <div className="flex gap-2">
              {(Object.keys(PALETTES) as PaletteName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => loadPreset(name)}
                  className="rounded-md border border-paper/15 px-2 py-1 text-xs hover:bg-paper/10"
                >
                  {name}
                </button>
              ))}
            </div>
            <Text size="xs" className="text-paper/50">
              El primero es el color de reposo; el resto, la ola en orden.
            </Text>
            <div className="grid grid-cols-5 gap-2">
              {value.colors.map((c, i) => (
                <label key={i} className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => setColor(i, e.target.value)}
                    className="h-8 w-full cursor-pointer rounded border border-paper/15 bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-paper/50">{i === 0 ? "reposo" : i}</span>
                </label>
              ))}
            </div>
          </Section>
        </div>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <Text as="h2" size="xs" weight="bold" className="uppercase tracking-wider text-paper/50">
        {title}
      </Text>
      {children}
    </section>
  );
}

function Range({
  spec: { label, min, max, step },
  value,
  onChange,
}: {
  spec: Slider<string>;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs">
        <span className="text-paper/80">{label}</span>
        <span className="font-mono text-paper/60">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-accent"
      />
    </label>
  );
}
