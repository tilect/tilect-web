"use client";

import { Text } from "@/src/components/ui/typography";
import type { GradientStatus } from "@/src/hooks/useGeminiGradient";
import type { AuroraParams } from "@/src/lib/gemini-gradient";
import { toast } from "sonner";
import type { GlowParams, HoverEffects } from "./GradientLogo";

/**
 * Design tuning panel for the home aurora. Not translated on purpose: it's a
 * design tool, only rendered when `SHOW_DESIGN_PANEL=true`. A drawer over the
 * right edge: it never pushes the page layout around.
 */

export type ThemeName = "dark" | "light";

export type AuroraConfig = {
  colors: string[];
  params: AuroraParams;
  glow: GlowParams;
  hover: HoverEffects;
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

/** Hover effects: each is independent and has its own switch. */
type HoverKey = keyof HoverEffects;
type HoverSlider = { [K in HoverKey]: Slider<Exclude<keyof HoverEffects[K], "enabled"> & string> }[HoverKey];

const HOVER_EFFECTS: { key: HoverKey; label: string; hint: string; sliders: HoverSlider[] }[] = [
  {
    key: "spotlight",
    label: "Foco de luz",
    hint: "La aurora se ilumina bajo el cursor.",
    sliders: [
      { key: "strength", label: "Intensidad", min: 0.1, max: 3, step: 0.05 },
      { key: "radius", label: "Radio (alturas del logo)", min: 0.3, max: 5, step: 0.1 },
    ],
  },
  {
    key: "ripple",
    label: "Ondas",
    hint: "Al entrar el cursor sale un único anillo de color. Si sales y vuelves a entrar, solo sale otro cuando el anterior ha recorrido el % indicado.",
    sliders: [
      { key: "strength", label: "Intensidad", min: 0.1, max: 1, step: 0.05 },
      { key: "speed", label: "Velocidad", min: 1, max: 15, step: 0.5 },
      { key: "width", label: "Grosor", min: 0.2, max: 3, step: 0.1 },
      { key: "retrigger", label: "Nueva onda tras (% del recorrido)", min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    key: "halo",
    label: "Halo que sigue al cursor",
    hint: "El halo de detrás se desplaza hacia el ratón y brilla más.",
    sliders: [
      { key: "follow", label: "Cuánto se desplaza", min: 0, max: 0.5, step: 0.01 },
      { key: "boost", label: "Brillo extra", min: 1, max: 2.5, step: 0.05 },
    ],
  },
];

const STATUS_LABEL: Record<GradientStatus, { text: string; ok: boolean }> = {
  animating: { text: "Animando (WebGL)", ok: true },
  paused: { text: "En pausa (fuera de pantalla o pestaña oculta)", ok: false },
  "reduced-motion": { text: "Fotograma fijo: el sistema pide reducir movimiento", ok: false },
  "context-lost": { text: "Contexto WebGL perdido", ok: false },
  "no-webgl": { text: "Sin WebGL: se ve el fondo CSS estático", ok: false },
};

type Props = {
  /** Theme whose config is being edited. */
  theme: ThemeName;
  value: AuroraConfig;
  /** What "Copiar" exports (every theme's config). */
  exportValue: unknown;
  status: GradientStatus | null;
  open: boolean;
  onChange: (next: AuroraConfig) => void;
  onReset: () => void;
};

export function AuroraTuner({
  theme,
  value,
  exportValue,
  status,
  open,
  onChange,
  onReset,
}: Props) {
  const setParam = (key: keyof AuroraParams, n: number) =>
    onChange({ ...value, params: { ...value.params, [key]: n } });
  const setGlow = (key: keyof GlowParams, n: number) =>
    onChange({ ...value, glow: { ...value.glow, [key]: n } });
  const setColor = (i: number, hex: string) =>
    onChange({ ...value, colors: value.colors.map((c, j) => (j === i ? hex.toUpperCase() : c)) });
  const setHover = (effect: HoverKey, patch: Record<string, number | boolean>) =>
    onChange({ ...value, hover: { ...value.hover, [effect]: { ...value.hover[effect], ...patch } } });

  async function copy() {
    const json = JSON.stringify(exportValue, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      toast.success("Configuración copiada");
    } catch {
      console.log(json);
      toast.error("No se pudo copiar; está en la consola");
    }
  }

  return (
    <aside
      id="design-drawer"
      aria-label="Ajustes de diseño"
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-y-0 right-0 z-40 flex w-[min(20rem,85vw)] flex-col border-l border-paper/10 bg-ink/90 text-paper shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Right padding leaves room for the brush + theme buttons floating above. */}
      <header className="flex items-center gap-2 px-4 pb-2 pr-24 pt-5">
        <Text as="h2" size="sm" weight="bold">
          Ajustes
        </Text>
        <span
          title="Cada tema tiene su propia configuración; cambia el tema para editar el otro."
          className="rounded-full border border-paper/15 px-2 py-0.5 font-mono text-[10px] uppercase text-paper/70"
        >
          {theme}
        </span>
      </header>
      <div className="flex items-center justify-between gap-2 border-b border-paper/10 px-4 pb-3">
        <span className="font-mono text-[10px] text-paper/40">Ctrl+D · Esc</span>
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
      </div>

      {status && (
        <div className="flex items-center gap-2 border-b border-paper/10 px-4 py-2 text-xs">
          <span
            className={`size-2 shrink-0 rounded-full ${STATUS_LABEL[status].ok ? "bg-accent" : "bg-paper/30"}`}
          />
          <span className="text-paper/70">{STATUS_LABEL[status].text}</span>
        </div>
      )}

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

        <Section title="Ratón">
          {HOVER_EFFECTS.map((effect) => {
            const state = value.hover[effect.key] as unknown as Record<string, number> & { enabled: boolean };
            return (
              <div key={effect.key} className="space-y-3 rounded-lg border border-paper/10 p-3">
                <Switch
                  label={effect.label}
                  checked={state.enabled}
                  onChange={(enabled) => setHover(effect.key, { enabled })}
                />
                <Text size="xs" className="text-paper/50">
                  {effect.hint}
                </Text>
                {state.enabled &&
                  effect.sliders.map((s) => (
                    <Range
                      key={s.key}
                      spec={s}
                      value={state[s.key]}
                      onChange={(n) => setHover(effect.key, { [s.key]: n })}
                    />
                  ))}
              </div>
            );
          })}
        </Section>

        <Section title="Colores">
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

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <Text as="span" size="sm" weight="bold">
        {label}
      </Text>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-paper/20"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-paper transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </span>
    </button>
  );
}
