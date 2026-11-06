"use client";

import {
  Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

// Par categórico validado (light, superfície #F4EFE6): ΔE CVD 17.3, contraste ≥ 3:1.
export const C1 = "#A13A2F";
export const C2 = "#2B6E9E";
const INK2 = "#4A453D";
const MUTED = "#6F685C";
const GRID = "#D6CDBB";
const tick = { fill: MUTED, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" };

type Row = Record<string, string | number>;

function Tip({ active, payload, label, unit = "", digits = 0 }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; unit?: string; digits?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-ink bg-card px-3 py-2 text-sm shadow-[3px_3px_0_var(--color-ink)]">
      <p className="font-display text-base">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="num flex items-center gap-2 text-ink-2">
          <span className="inline-block size-2.5 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="text-ink">{Number(p.value).toFixed(digits)}{unit}</span>
        </p>
      ))}
    </div>
  );
}

/** Rótulo do radar em até duas linhas, ancorado para fora do centro (não corta nas bordas). */
function WrappedTick(props: { x?: number; y?: number; cx?: number; payload?: { value: string } }) {
  const { x = 0, y = 0, cx = 0, payload } = props;
  const words = (payload?.value ?? "").split(" ");
  const mid = Math.ceil(words.length / 2);
  const lines = words.length > 1 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : [words.join(" ")];
  const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
  return (
    <text x={x} y={y} textAnchor={anchor} fill={INK2} fontSize={10.5} fontFamily="IBM Plex Mono, monospace">
      {lines.map((l, i) => <tspan key={i} x={x} dy={i === 0 ? (lines.length > 1 ? -4 : 3) : 12}>{l}</tspan>)}
    </text>
  );
}

function LegendText(value: string) {
  return <span style={{ color: INK2, fontFamily: "Newsreader Variable, serif", fontSize: 14 }}>{value}</span>;
}

/** Radar de estilo (percentis 0–100 no corpus). 1 ou 2 autores. */
export function StyleRadar({ data, nameA, nameB, height = 320 }: { data: Row[]; nameA: string; nameB?: string; height?: number }) {
  return (
    <figure>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius="66%" margin={{ top: 12, right: 28, bottom: 12, left: 28 }}>
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="label" tick={<WrappedTick />} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name={nameA} dataKey="a" stroke={C1} strokeWidth={2} fill={C1} fillOpacity={0.12}
                 dot={{ r: 4, fill: C1, stroke: "#F4EFE6", strokeWidth: 2 }} />
          {nameB && (
            <Radar name={nameB} dataKey="b" stroke={C2} strokeWidth={2} fill={C2} fillOpacity={0.1}
                   dot={{ r: 4, fill: C2, stroke: "#F4EFE6", strokeWidth: 2 }} />
          )}
          <Tooltip content={<Tip unit="º pct" />} />
          {nameB && <Legend formatter={LegendText} iconType="circle" />}
        </RadarChart>
      </ResponsiveContainer>
      <figcaption className="eyebrow mt-1 text-center">Percentil no corpus · 0 = menor, 100 = maior</figcaption>
    </figure>
  );
}

/** Barras divergentes de temas inferidos do texto (z-score: + acima da média do corpus). */
export function ThemeBars({ data, nameA, nameB, height }: { data: Row[]; nameA: string; nameB?: string; height?: number }) {
  const h = height ?? Math.max(260, data.length * (nameB ? 30 : 22) + 40);
  return (
    <figure>
      <ResponsiveContainer width="100%" height={h}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }} barGap={2} barCategoryGap={nameB ? "22%" : "28%"}>
          <CartesianGrid horizontal={false} stroke={GRID} strokeDasharray="2 4" />
          <XAxis type="number" tick={tick} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
          <YAxis type="category" dataKey="theme" width={168} tick={{ ...tick, fill: INK2, fontSize: 11.5 }} axisLine={false} tickLine={false} interval={0} />
          <ReferenceLine x={0} stroke={INK2} />
          <Tooltip content={<Tip digits={2} unit=" z" />} cursor={{ fill: "#EBE4D6" }} />
          <Bar name={nameA} dataKey="a" fill={C1} radius={4} maxBarSize={10} />
          {nameB && <Bar name={nameB} dataKey="b" fill={C2} radius={4} maxBarSize={10} />}
          {nameB && <Legend formatter={LegendText} iconType="circle" verticalAlign="top" />}
        </BarChart>
      </ResponsiveContainer>
      <figcaption className="eyebrow mt-1">Ênfase temática relativa (z) · 0 = média do corpus</figcaption>
    </figure>
  );
}

/** Componentes do score (0–1). Componentes sem dados aparecem como "sem dados", nunca como zero. */
export function ComponentBars({ components, labels, weights }: {
  components: Record<string, number | null>; labels: Record<string, string>; weights: Record<string, number>;
}) {
  const keys = ["semantic", "genre", "subgenre", "theme", "style"];
  return (
    <dl className="space-y-3">
      {keys.map((k) => {
        const v = components[k];
        return (
          <div key={k} className="grid grid-cols-[9.5rem_1fr_4.5rem] items-center gap-3">
            <dt className="text-[0.95rem] leading-tight">
              {labels[k]}
              <span className="eyebrow block">{weights[k] !== undefined ? `peso ${weights[k]}` : "só exibição"}</span>
            </dt>
            <dd className="relative h-2.5 rounded-sm bg-paper-2" title={v === null ? "sem dados" : v.toFixed(3)}>
              {v !== null && <span className="absolute inset-y-0 left-0 rounded-sm bg-ink" style={{ width: `${Math.max(v * 100, 1.5)}%` }} />}
            </dd>
            <dd className="num text-right text-sm">{v === null ? <span className="whitespace-nowrap text-muted">sem dados</span> : v.toFixed(2)}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Barras simples de distribuição (0–1), ex.: fração dos autores escolhidos com cada gênero. */
export function DistBars({ data, className }: { data: { label: string; value: number }[]; className?: string }) {
  if (!data.length) return <p className="text-muted">Sem dados de metadados para estes autores.</p>;
  return (
    <ul className={cn("space-y-2", className)}>
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[1fr_6rem_2.5rem] items-center gap-3" title={`${Math.round(d.value * 100)}%`}>
          <span>{d.label}</span>
          <span className="relative h-2 rounded-sm bg-paper-2">
            <span className="absolute inset-y-0 left-0 rounded-sm bg-accent" style={{ width: `${d.value * 100}%` }} />
          </span>
          <span className="num text-right text-sm text-ink-2">{Math.round(d.value * 100)}%</span>
        </li>
      ))}
    </ul>
  );
}

/** Medidor horizontal do score principal. */
export function ScoreMeter({ value, label }: { value: number; label?: string }) {
  return (
    <div title={label}>
      <div className="relative h-1.5 rounded-sm bg-paper-2">
        <span className="absolute inset-y-0 left-0 rounded-sm bg-accent" style={{ width: `${Math.min(100, value * 100)}%` }} />
      </div>
    </div>
  );
}
