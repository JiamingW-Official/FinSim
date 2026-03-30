"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 622007;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 622007;
}
function rb(min: number, max: number) {
  return min + rand() * (max - min);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface TimeSeriesPoint {
  label: string;
  value: number;
}

interface LineSeries {
  name: string;
  color: string;
  points: TimeSeriesPoint[];
}

interface HeatmapCell {
  country: string;
  value: number;
  label: string;
}

// ── Data Generation ───────────────────────────────────────────────────────────
function makeQuarters(n: number, start: [number, number]): string[] {
  const labels: string[] = [];
  let [year, q] = start;
  for (let i = 0; i < n; i++) {
    labels.push(`Q${q} ${year}`);
    q++;
    if (q > 4) { q = 1; year++; }
  }
  return labels;
}

function makeMonths(n: number): string[] {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const labels: string[] = [];
  let y = 2022; let m = 0;
  for (let i = 0; i < n; i++) {
    labels.push(`${months[m]} ${y}`);
    m++;
    if (m >= 12) { m = 0; y++; }
  }
  return labels.slice(0, n);
}

resetSeed();

// ── Growth Indicators data ────────────────────────────────────────────────────
const quarters = makeQuarters(16, [2022, 1]);

const gdpSeries: LineSeries = {
  name: "Real GDP Growth (YoY %)",
  color: "#6366f1",
  points: quarters.map((label, i) => {
    const base = [2.1, 1.9, 2.3, 2.5, 2.0, 1.7, 1.5, 1.8, 2.2, 2.4, 2.6, 2.8, 2.5, 2.3, 2.1, 1.9][i];
    return { label, value: parseFloat((base + rb(-0.15, 0.15)).toFixed(2)) };
  }),
};

const pmiSeries: LineSeries = {
  name: "Manufacturing PMI",
  color: "#10b981",
  points: quarters.map((label, i) => {
    const base = [52.4, 51.8, 50.2, 49.5, 48.9, 49.2, 50.1, 51.3, 52.0, 52.8, 53.1, 52.6, 52.2, 51.9, 51.4, 50.8][i];
    return { label, value: parseFloat((base + rb(-0.3, 0.3)).toFixed(1)) };
  }),
};

const indProdSeries: LineSeries = {
  name: "Industrial Production (YoY %)",
  color: "#f59e0b",
  points: quarters.map((label, i) => {
    const base = [3.2, 2.8, 2.1, 1.6, 0.9, 0.4, 0.7, 1.2, 1.8, 2.3, 2.7, 3.0, 2.8, 2.5, 2.2, 1.9][i];
    return { label, value: parseFloat((base + rb(-0.2, 0.2)).toFixed(2)) };
  }),
};

const retailSalesSeries: LineSeries = {
  name: "Retail Sales (YoY %)",
  color: "#ec4899",
  points: quarters.map((label, i) => {
    const base = [7.8, 6.2, 4.9, 3.4, 2.1, 1.8, 2.4, 3.1, 3.8, 4.2, 4.7, 5.1, 4.8, 4.3, 3.9, 3.5][i];
    return { label, value: parseFloat((base + rb(-0.3, 0.3)).toFixed(2)) };
  }),
};

// ── Inflation data ─────────────────────────────────────────────────────────────
const months = makeMonths(24);

const cpiSeries: LineSeries = {
  name: "CPI (YoY %)",
  color: "#ef4444",
  points: months.map((label, i) => {
    const base = [7.5,7.9,8.5,8.3,8.6,9.1,8.5,8.3,8.2,7.7,7.1,6.5,6.4,6.0,5.0,4.9,4.0,3.7,3.7,3.2,3.1,2.9,2.8,2.6][i] ?? rb(2.5, 3.5);
    return { label, value: parseFloat((base + rb(-0.05, 0.05)).toFixed(1)) };
  }),
};

const pceSeries: LineSeries = {
  name: "Core PCE (YoY %)",
  color: "#f97316",
  points: months.map((label, i) => {
    const base = [5.2,5.3,5.6,5.2,4.9,4.8,4.7,4.6,4.9,5.0,4.7,4.4,4.7,4.6,4.6,4.4,3.8,3.7,3.7,3.4,3.5,3.2,3.1,2.8][i] ?? rb(2.5, 3.5);
    return { label, value: parseFloat((base + rb(-0.05, 0.05)).toFixed(1)) };
  }),
};

const tipsBeSeries: LineSeries = {
  name: "5Y TIPS Breakeven (%)",
  color: "#8b5cf6",
  points: months.map((label, i) => {
    const base = [2.9,3.0,3.1,3.0,2.9,2.8,2.6,2.5,2.4,2.3,2.3,2.4,2.3,2.3,2.4,2.3,2.4,2.4,2.5,2.4,2.4,2.3,2.3,2.3][i] ?? rb(2.2, 2.6);
    return { label, value: parseFloat((base + rb(-0.03, 0.03)).toFixed(2)) };
  }),
};

const wageSeries: LineSeries = {
  name: "Wage Growth (YoY %)",
  color: "#14b8a6",
  points: months.map((label, i) => {
    const base = [5.7,5.6,5.6,5.5,5.2,5.1,5.2,5.2,5.0,4.7,4.6,4.6,4.4,4.4,4.3,4.4,4.2,4.2,4.0,4.0,4.1,4.0,3.9,3.9][i] ?? rb(3.5, 4.5);
    return { label, value: parseFloat((base + rb(-0.05, 0.05)).toFixed(1)) };
  }),
};

// ── Labor Market data ──────────────────────────────────────────────────────────
const unemploymentSeries: LineSeries = {
  name: "Unemployment Rate (%)",
  color: "#6366f1",
  points: months.map((label, i) => {
    const base = [4.0,3.8,3.6,3.6,3.6,3.6,3.5,3.7,3.5,3.7,3.7,3.5,3.4,3.6,3.5,3.4,3.6,3.8,3.9,3.9,3.7,3.7,3.7,3.9][i] ?? rb(3.5, 4.2);
    return { label, value: parseFloat((base + rb(-0.05, 0.05)).toFixed(1)) };
  }),
};

const joltsSeries: LineSeries = {
  name: "JOLTS Openings (millions)",
  color: "#10b981",
  points: months.map((label, i) => {
    const base = [11.2,11.3,11.8,11.9,11.7,10.7,10.3,10.1,10.3,10.4,10.4,10.5,10.6,10.0,9.7,9.6,9.8,9.6,9.6,8.8,8.7,8.9,8.7,8.6][i] ?? rb(8.0, 9.5);
    return { label, value: parseFloat((base + rb(-0.1, 0.1)).toFixed(1)) };
  }),
};

const lfpSeries: LineSeries = {
  name: "Labor Force Participation (%)",
  color: "#f59e0b",
  points: months.map((label, i) => {
    const base = [62.2,62.3,62.4,62.2,62.3,62.2,62.1,62.1,62.1,62.2,62.1,62.3,62.4,62.5,62.6,62.6,62.6,62.8,62.8,62.8,62.7,62.5,62.5,62.5][i] ?? rb(62.3, 62.8);
    return { label, value: parseFloat((base + rb(-0.05, 0.05)).toFixed(1)) };
  }),
};

// ── Global Comparison data ─────────────────────────────────────────────────────
const g7Countries = ["USA","CAN","GBR","DEU","FRA","ITA","JPN"];
const g20Extra = ["CHN","IND","BRA","AUS","KOR","MEX","IDN","SAU"];
const allCountries = [...g7Countries, ...g20Extra];

const gdpGrowthMatrix: HeatmapCell[] = allCountries.map((c) => {
  const vals: Record<string, number> = {
    USA:2.5,CAN:1.2,GBR:0.3,DEU:-0.2,FRA:0.9,ITA:0.7,JPN:1.9,
    CHN:5.2,IND:7.0,BRA:2.9,AUS:2.0,KOR:1.4,MEX:3.2,IDN:5.0,SAU:3.6,
  };
  const base = vals[c] ?? 2.0;
  return { country: c, value: parseFloat((base + rb(-0.1, 0.1)).toFixed(1)), label: `${(base + rb(-0.1, 0.1)).toFixed(1)}%` };
});

const inflationMatrix: HeatmapCell[] = allCountries.map((c) => {
  const vals: Record<string, number> = {
    USA:3.1,CAN:3.4,GBR:4.0,DEU:2.9,FRA:2.6,ITA:0.9,JPN:2.8,
    CHN:0.2,IND:5.1,BRA:4.6,AUS:3.8,KOR:3.2,MEX:4.7,IDN:2.6,SAU:1.7,
  };
  const base = vals[c] ?? 3.0;
  return { country: c, value: parseFloat((base + rb(-0.05, 0.05)).toFixed(1)), label: `${(base + rb(-0.05, 0.05)).toFixed(1)}%` };
});

const currentAccountMatrix: HeatmapCell[] = allCountries.map((c) => {
  const vals: Record<string, number> = {
    USA:-3.1,CAN:-1.2,GBR:-3.5,DEU:5.8,FRA:-1.5,ITA:0.2,JPN:3.5,
    CHN:1.5,IND:-1.3,BRA:-2.2,AUS:-1.0,KOR:2.2,MEX:-1.1,IDN:-0.5,SAU:3.7,
  };
  const base = vals[c] ?? 0.5;
  return { country: c, value: parseFloat((base + rb(-0.1, 0.1)).toFixed(1)), label: `${(base + rb(-0.1, 0.1)).toFixed(1)}%` };
});

// ── Regime Tracker data ────────────────────────────────────────────────────────
const leadingIndicators = [
  { name: "ISM Manufacturing", value: 50.1, threshold: 50, direction: "above", weight: 2 },
  { name: "Building Permits (MoM%)", value: 2.3, threshold: 0, direction: "above", weight: 1 },
  { name: "Consumer Confidence", value: 104.2, threshold: 100, direction: "above", weight: 2 },
  { name: "S&P 500 (6m trend)", value: 1.8, threshold: 0, direction: "above", weight: 2 },
  { name: "Yield Curve (10Y-2Y, bps)", value: 18, threshold: 0, direction: "above", weight: 3 },
  { name: "Credit Spreads (IG, bps)", value: 112, threshold: 130, direction: "below", weight: 2 },
  { name: "Initial Jobless Claims (k)", value: 212, threshold: 250, direction: "below", weight: 2 },
  { name: "New Orders (PMI sub-idx)", value: 52.4, threshold: 50, direction: "above", weight: 1 },
  { name: "Avg Weekly Hours Mfg", value: 40.4, threshold: 40, direction: "above", weight: 1 },
  { name: "M2 Money Supply (YoY%)", value: 0.6, threshold: 0, direction: "above", weight: 1 },
];

// ── SVG Line Chart ─────────────────────────────────────────────────────────────
function LineChart({
  series,
  height = 200,
  showGrid = true,
  referenceLines,
}: {
  series: LineSeries[];
  height?: number;
  showGrid?: boolean;
  referenceLines?: { value: number; color: string; label: string }[];
}) {
  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const refVals = referenceLines?.map((r) => r.value) ?? [];
  const allVals = [...allValues, ...refVals];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const pad = (maxV - minV) * 0.08 || 0.5;
  const lo = minV - pad;
  const hi = maxV + pad;
  const range = hi - lo;

  const W = 700;
  const H = height;
  const PADL = 52;
  const PADR = 16;
  const PADT = 12;
  const PADB = 36;
  const plotW = W - PADL - PADR;
  const plotH = H - PADT - PADB;

  const px = (i: number, total: number) => PADL + (i / (total - 1)) * plotW;
  const py = (v: number) => PADT + plotH - ((v - lo) / range) * plotH;

  const nLabels = series[0]?.points.length ?? 0;
  const labelStep = Math.max(1, Math.floor(nLabels / 6));

  const yTicks = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {showGrid &&
        Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = lo + (range * i) / yTicks;
          const y = py(v);
          return (
            <g key={i}>
              <line x1={PADL} x2={W - PADR} y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeOpacity={0.6} />
              <text x={PADL - 6} y={y + 4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={9} opacity={0.5}>
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

      {referenceLines?.map((rl, ri) => {
        const y = py(rl.value);
        return (
          <g key={ri}>
            <line x1={PADL} x2={W - PADR} y1={y} y2={y} stroke={rl.color} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
            <text x={W - PADR + 2} y={y + 4} fill={rl.color} fontSize={8} opacity={0.7}>{rl.label}</text>
          </g>
        );
      })}

      {series[0]?.points.map((pt, i) => {
        if (i % labelStep !== 0) return null;
        return (
          <text key={i} x={px(i, nLabels)} y={H - 4} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8} opacity={0.4}>
            {pt.label}
          </text>
        );
      })}

      {series.map((ser) => {
        const pts = ser.points.map((p, i) => `${px(i, ser.points.length)},${py(p.value)}`).join(" ");
        return (
          <g key={ser.name}>
            <polyline points={pts} fill="none" stroke={ser.color} strokeWidth={1.5} strokeLinejoin="round" strokeOpacity={0.9} />
            {ser.points.map((p, i) => (
              <circle key={i} cx={px(i, ser.points.length)} cy={py(p.value)} r={2} fill={ser.color} fillOpacity={0.8} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Heatmap ────────────────────────────────────────────────────────────────────
function HeatmapGrid({
  cells,
  title,
  minColor,
  midColor,
  maxColor,
  domain,
}: {
  cells: HeatmapCell[];
  title: string;
  minColor: string;
  midColor: string;
  maxColor: string;
  domain: [number, number];
}) {
  const [lo, hi] = domain;
  const mid = (lo + hi) / 2;

  function lerp(a: string, b: string, t: number): string {
    const hexToRgb = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b2 = parseInt(h.slice(5, 7), 16);
      return [r, g, b2];
    };
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const bv = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${bv})`;
  }

  function colorFor(v: number): string {
    if (v <= mid) {
      const t = Math.max(0, Math.min(1, (v - lo) / (mid - lo)));
      return lerp(minColor, midColor, t);
    } else {
      const t = Math.max(0, Math.min(1, (v - mid) / (hi - mid)));
      return lerp(midColor, maxColor, t);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-2">{title}</p>
      <div className="grid grid-cols-5 gap-1">
        {cells.map((cell) => {
          const bg = colorFor(cell.value);
          const textDark = cell.value < mid ? cell.value > lo + (mid - lo) * 0.4 : cell.value < mid + (hi - mid) * 0.6;
          return (
            <div
              key={cell.country}
              className="rounded p-1.5 flex flex-col items-center justify-center text-center"
              style={{ background: bg, minHeight: 44 }}
            >
              <span className={`text-xs font-mono font-semibold ${textDark ? "text-background" : "text-foreground"}`}>{cell.country}</span>
              <span className={`text-[11px] font-mono tabular-nums ${textDark ? "text-background/70" : "text-foreground/80"}`}>{cell.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat Chip ──────────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  delta,
  unit = "",
}: {
  label: string;
  value: number;
  delta: number;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-6 py-5">
      <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30">{label}</p>
      <p className="font-serif text-2xl font-bold tabular-nums text-foreground">
        {value.toFixed(value % 1 === 0 ? 0 : value >= 10 ? 1 : 2)}{unit}
      </p>
      <p className={cn("text-[11px] font-mono tabular-nums", delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-muted-foreground/40")}>
        {delta > 0 ? "+" : ""}{delta.toFixed(1)}{unit} vs prev
      </p>
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────
function ChartLegend({ series }: { series: LineSeries[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      {series.map((s) => (
        <div key={s.name} className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
          <span className="text-[11px] font-mono text-muted-foreground/50">{s.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Chart Card wrapper ─────────────────────────────────────────────────────────
function ChartCard({
  category,
  title,
  currentValue,
  currentValuePositive,
  description,
  children,
}: {
  category: string;
  title: string;
  currentValue: string;
  currentValuePositive: boolean;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">{category}</p>
          <p className="font-serif text-lg font-semibold text-foreground leading-tight">{title}</p>
        </div>
        <span className={cn("font-mono text-sm font-bold tabular-nums", currentValuePositive ? "text-emerald-400" : "text-red-400")}>
          {currentValue}
        </span>
      </div>
      {children}
      {description && (
        <p className="text-[11px] text-muted-foreground/50 mt-3 leading-relaxed font-mono">{description}</p>
      )}
    </div>
  );
}

// ── Regime Quadrant SVG ────────────────────────────────────────────────────────
function RegimeQuadrant({
  inflation,
  growth,
}: {
  inflation: number;
  growth: number;
}) {
  const W = 320;
  const H = 280;
  const PAD = 40;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  const growthMin = -1; const growthMax = 4;
  const inflMin = 0; const inflMax = 7;
  const inflMid = 2.5;
  const growthMid = 1.5;

  const gx = (g: number) => PAD + ((g - growthMin) / (growthMax - growthMin)) * plotW;
  const iy = (inf: number) => PAD + plotH - ((inf - inflMin) / (inflMax - inflMin)) * plotH;

  const cx = gx(growth);
  const cy = iy(inflation);
  const midX = gx(growthMid);
  const midY = iy(inflMid);

  const quadrants = [
    { label: "Expansion", color: "#10b981", x: midX + 4, y: PAD + 16 },
    { label: "Stagflation", color: "#f59e0b", x: PAD + 4, y: PAD + 16 },
    { label: "Deflation", color: "#6366f1", x: PAD + 4, y: H - PAD - 6 },
    { label: "Recovery", color: "#3b82f6", x: midX + 4, y: H - PAD - 6 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <rect x={PAD} y={PAD} width={midX - PAD} height={midY - PAD} fill="#f59e0b" opacity={0.06} />
      <rect x={midX} y={PAD} width={W - PAD - midX} height={midY - PAD} fill="#10b981" opacity={0.06} />
      <rect x={PAD} y={midY} width={midX - PAD} height={H - PAD - midY} fill="#6366f1" opacity={0.06} />
      <rect x={midX} y={midY} width={W - PAD - midX} height={H - PAD - midY} fill="#3b82f6" opacity={0.06} />

      <line x1={PAD} x2={W - PAD} y1={midY} y2={midY} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={midX} x2={midX} y1={PAD} y2={H - PAD} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4 3" />

      <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="hsl(var(--border))" strokeWidth={1} />
      <line x1={PAD} x2={PAD} y1={PAD} y2={H - PAD} stroke="hsl(var(--border))" strokeWidth={1} />

      <text x={W / 2} y={H - 6} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9} opacity={0.4}>GDP Growth (%)</text>
      <text x={12} y={H / 2} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9} opacity={0.4} transform={`rotate(-90, 12, ${H / 2})`}>Inflation (%)</text>

      {[growthMin, 0, growthMid, growthMax].map((g, i) => (
        <text key={i} x={gx(g)} y={H - PAD + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8} opacity={0.35}>{g}%</text>
      ))}
      {[inflMin, inflMid, inflMax].map((inf, i) => (
        <text key={i} x={PAD - 4} y={iy(inf) + 4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={8} opacity={0.35}>{inf}%</text>
      ))}

      {quadrants.map((q) => (
        <text key={q.label} x={q.x} y={q.y} fill={q.color} fontSize={9} fontWeight="600" opacity={0.6}>{q.label}</text>
      ))}

      <circle cx={cx} cy={cy} r={10} fill="#6366f1" opacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill="#6366f1" />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#a5b4fc" fontSize={8} fontWeight="600" opacity={0.8}>NOW</text>
    </svg>
  );
}

// ── NBER Cycle Bar ─────────────────────────────────────────────────────────────
function NBERCycleBar() {
  const cycles = [
    { label: "GFC Trough", year: "Jun '09", end: "Feb '20", type: "expansion", pct: 52 },
    { label: "COVID Shock", year: "Feb '20", end: "Apr '20", type: "recession", pct: 1 },
    { label: "Post-COVID", year: "Apr '20", end: "present", type: "expansion", pct: 47 },
  ];
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-2">NBER Business Cycle</p>
      <div className="flex rounded-lg overflow-hidden h-7">
        {cycles.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-center text-[10px] font-mono font-semibold relative overflow-hidden"
            style={{
              width: `${c.pct}%`,
              background: c.type === "expansion" ? "#10b981" : "#ef4444",
              opacity: 0.75,
            }}
          >
            <span className="text-background/90 truncate px-1">{c.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground/30 mt-1 px-0.5">
        <span>Jun 2009</span>
        <span>Feb 2020</span>
        <span>Apr 2020</span>
        <span>Present</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MacroDashboardPage() {
  const [activeTab, setActiveTab] = useState("growth");

  // Compute leading indicator score
  const liScore = useMemo(() => {
    let totalWeight = 0;
    let passedWeight = 0;
    for (const li of leadingIndicators) {
      totalWeight += li.weight;
      const passed = li.direction === "above" ? li.value > li.threshold : li.value < li.threshold;
      if (passed) passedWeight += li.weight;
    }
    return Math.round((passedWeight / totalWeight) * 100);
  }, []);

  // Current regime determination
  const currentGrowth = 2.5;
  const currentInflation = 3.1;
  const regimeLabel =
    currentGrowth > 1.5 && currentInflation > 2.5
      ? "Expansion"
      : currentGrowth > 1.5 && currentInflation <= 2.5
      ? "Recovery"
      : currentGrowth <= 1.5 && currentInflation > 2.5
      ? "Stagflation"
      : "Deflation";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Macro Research</h1>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">CYCLES · INDICATORS · POLICY · GROWTH</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/50 border border-border rounded px-2 py-0.5">{regimeLabel}</span>
          <span className="text-[10px] font-mono text-muted-foreground/30">Q1 2026</span>
        </div>
      </div>

      <div className="border-t border-border mb-6" />

      {/* ── Hero Stat Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border border border-border rounded-lg mb-6">
        <StatChip label="US Real GDP Growth" value={2.5} delta={0.2} unit="%" />
        <StatChip label="CPI (YoY)" value={2.8} delta={-0.1} unit="%" />
        <StatChip label="Unemployment" value={3.9} delta={0.1} unit="%" />
        <StatChip label="Fed Funds Rate" value={5.25} delta={0.0} unit="%" />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6 w-full justify-start gap-0">
            {["growth", "inflation", "labor", "global", "regime"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  "rounded-none border-b-2 border-transparent bg-transparent shadow-none px-4 py-2 text-xs capitalize transition-colors",
                  "data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=active]:font-semibold",
                  "data-[state=inactive]:text-muted-foreground/50"
                )}
              >
                {tab === "growth" ? "Growth" : tab === "inflation" ? "Inflation" : tab === "labor" ? "Labor" : tab === "global" ? "Global" : "Regime"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── TAB 1: Growth Indicators ──────────────────────────────────────── */}
          <TabsContent value="growth" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard
                  category="Growth"
                  title="Real GDP Growth (YoY %)"
                  currentValue="+2.5%"
                  currentValuePositive={true}
                  description="Steady expansion above trend growth of ~1.8%. Driven by resilient consumer spending and services sector."
                >
                  <LineChart
                    series={[gdpSeries]}
                    height={180}
                    referenceLines={[{ value: 0, color: "#ef4444", label: "0%" }]}
                  />
                  <ChartLegend series={[gdpSeries]} />
                </ChartCard>

                <ChartCard
                  category="Activity"
                  title="Manufacturing PMI"
                  currentValue="50.8"
                  currentValuePositive={true}
                  description="Barely in expansion territory. New orders sub-index at 52.4 signals modest improvement ahead."
                >
                  <LineChart
                    series={[pmiSeries]}
                    height={180}
                    referenceLines={[{ value: 50, color: "#f59e0b", label: "50 (boom/bust)" }]}
                  />
                  <ChartLegend series={[pmiSeries]} />
                </ChartCard>

                <ChartCard
                  category="Production"
                  title="Industrial Production (YoY %)"
                  currentValue="+1.9%"
                  currentValuePositive={true}
                  description="Recovery from 2023 contraction. Semiconductor and auto sectors leading rebound."
                >
                  <LineChart series={[indProdSeries]} height={180} />
                  <ChartLegend series={[indProdSeries]} />
                </ChartCard>

                <ChartCard
                  category="Consumer"
                  title="Retail Sales (YoY %)"
                  currentValue="+3.5%"
                  currentValuePositive={true}
                  description="Normalizing from post-pandemic highs. Real (inflation-adjusted) growth near +0.7%."
                >
                  <LineChart series={[retailSalesSeries]} height={180} />
                  <ChartLegend series={[retailSalesSeries]} />
                </ChartCard>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Composite</p>
                  <p className="font-serif text-lg font-semibold text-foreground leading-tight">Growth Composite Overlay</p>
                </div>
                <LineChart
                  series={[gdpSeries, indProdSeries, retailSalesSeries]}
                  height={200}
                  referenceLines={[{ value: 0, color: "#6b7280", label: "0%" }]}
                />
                <ChartLegend series={[gdpSeries, indProdSeries, retailSalesSeries]} />
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 2: Inflation ──────────────────────────────────────────────── */}
          <TabsContent value="inflation" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard
                  category="Inflation"
                  title="CPI vs Core PCE (YoY %)"
                  currentValue="2.8%"
                  currentValuePositive={false}
                >
                  <LineChart
                    series={[cpiSeries, pceSeries]}
                    height={200}
                    referenceLines={[{ value: 2.0, color: "#10b981", label: "Fed 2% target" }]}
                  />
                  <ChartLegend series={[cpiSeries, pceSeries]} />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30 mb-1">CPI (latest)</p>
                      <p className="font-serif text-lg font-bold text-red-400 tabular-nums">2.8%</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30 mb-1">Core PCE (latest)</p>
                      <p className="font-serif text-lg font-bold text-orange-400 tabular-nums">2.8%</p>
                    </div>
                  </div>
                </ChartCard>

                <ChartCard
                  category="Expectations"
                  title="Inflation Expectations (TIPS Breakeven)"
                  currentValue="2.3%"
                  currentValuePositive={false}
                  description="5Y TIPS breakeven at 2.3% — Market expects inflation slightly above Fed target over next 5 years, down from 3.1% peak in early 2022."
                >
                  <LineChart
                    series={[tipsBeSeries]}
                    height={200}
                    referenceLines={[
                      { value: 2.0, color: "#10b981", label: "2% target" },
                      { value: 2.5, color: "#f59e0b", label: "2.5% alert" },
                    ]}
                  />
                  <ChartLegend series={[tipsBeSeries]} />
                </ChartCard>

                <ChartCard
                  category="Labor Costs"
                  title="Wage Growth (YoY %)"
                  currentValue="+3.9%"
                  currentValuePositive={false}
                  description="Average hourly earnings at +3.9% — Wage growth decelerating from 5.7% peak but still above Fed's estimated ~3.5% sustainable rate."
                >
                  <LineChart
                    series={[wageSeries]}
                    height={200}
                    referenceLines={[{ value: 3.5, color: "#f59e0b", label: "~Sustainable" }]}
                  />
                  <ChartLegend series={[wageSeries]} />
                </ChartCard>

                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Breakdown</p>
                    <p className="font-serif text-lg font-semibold text-foreground leading-tight">CPI Component Breakdown</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Shelter", contribution: 1.8, color: "#6366f1" },
                      { name: "Food at Home", contribution: 0.3, color: "#10b981" },
                      { name: "Energy", contribution: -0.2, color: "#f59e0b" },
                      { name: "Core Services ex-Shelter", contribution: 0.6, color: "#ef4444" },
                      { name: "Core Goods", contribution: 0.1, color: "#8b5cf6" },
                      { name: "Medical Care", contribution: 0.2, color: "#ec4899" },
                    ].map((comp) => (
                      <div key={comp.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[11px] font-mono text-muted-foreground/50">{comp.name}</span>
                          <span className={cn("text-[11px] font-mono tabular-nums", comp.contribution >= 0 ? "text-foreground/70" : "text-emerald-400")}>
                            {comp.contribution >= 0 ? "+" : ""}{comp.contribution.toFixed(1)}pp
                          </span>
                        </div>
                        <div className="h-1 bg-border/40 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.abs(comp.contribution) / 2 * 100}%`, background: comp.color, opacity: comp.contribution < 0 ? 0.4 : 0.7 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 mt-3 leading-relaxed font-mono">
                    Shelter remains the largest contributor at +1.8pp. Energy is deflationary (-0.2pp), providing offset.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Composite</p>
                  <p className="font-serif text-lg font-semibold text-foreground leading-tight">Inflation Overview (24-Month Trend)</p>
                </div>
                <LineChart
                  series={[cpiSeries, pceSeries, tipsBeSeries, wageSeries]}
                  height={220}
                  referenceLines={[{ value: 2.0, color: "#10b981", label: "2%" }]}
                />
                <ChartLegend series={[cpiSeries, pceSeries, tipsBeSeries, wageSeries]} />
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 3: Labor Market ───────────────────────────────────────────── */}
          <TabsContent value="labor" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard
                  category="Employment"
                  title="Unemployment Rate (U-3, %)"
                  currentValue="3.9%"
                  currentValuePositive={false}
                >
                  <LineChart
                    series={[unemploymentSeries]}
                    height={200}
                    referenceLines={[
                      { value: 4.0, color: "#f59e0b", label: "NAIRU ~4%" },
                      { value: 5.0, color: "#ef4444", label: "Recession alert" },
                    ]}
                  />
                  <ChartLegend series={[unemploymentSeries]} />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: "U-3 (headline)", value: "3.9%" },
                      { label: "U-6 (broad)", value: "7.4%" },
                      { label: "Long-term unemp", value: "1.2%" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg border border-border p-2 text-center">
                        <p className="text-[10px] font-mono text-muted-foreground/30 mb-0.5">{m.label}</p>
                        <p className="font-mono text-sm font-bold tabular-nums text-foreground">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <ChartCard
                  category="Job Market"
                  title="JOLTS Job Openings (millions)"
                  currentValue="8.6M"
                  currentValuePositive={true}
                  description="Job openings at 8.6M — Down from 12M peak but still above pre-pandemic levels. Hires-to-openings ratio improving. Quits rate 2.1% (normalizing)."
                >
                  <LineChart
                    series={[joltsSeries]}
                    height={200}
                    referenceLines={[{ value: 8.0, color: "#6366f1", label: "Pre-COVID avg" }]}
                  />
                  <ChartLegend series={[joltsSeries]} />
                </ChartCard>

                <ChartCard
                  category="Participation"
                  title="Labor Force Participation Rate (%)"
                  currentValue="62.5%"
                  currentValuePositive={false}
                  description="LFP at 62.5% — Still ~0.9pp below Feb 2020 peak due to early retirements and demographic shifts among 55+ cohort."
                >
                  <LineChart
                    series={[lfpSeries]}
                    height={200}
                    referenceLines={[{ value: 63.4, color: "#6b7280", label: "Pre-COVID peak" }]}
                  />
                  <ChartLegend series={[lfpSeries]} />
                </ChartCard>

                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Wages</p>
                    <p className="font-serif text-lg font-semibold text-foreground leading-tight">Sector Wage Pressure</p>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { sector: "Leisure & Hospitality", growth: 5.2, pressure: "High" },
                      { sector: "Healthcare", growth: 4.8, pressure: "High" },
                      { sector: "Construction", growth: 4.3, pressure: "Medium" },
                      { sector: "Professional Services", growth: 3.9, pressure: "Medium" },
                      { sector: "Retail Trade", growth: 3.4, pressure: "Medium" },
                      { sector: "Financial Activities", growth: 3.1, pressure: "Low" },
                      { sector: "Manufacturing", growth: 3.0, pressure: "Low" },
                      { sector: "Information", growth: 2.6, pressure: "Low" },
                    ].map((sec) => (
                      <div key={sec.sector} className="flex items-center gap-3">
                        <div className="w-36 text-[11px] font-mono text-muted-foreground/50 truncate shrink-0">{sec.sector}</div>
                        <div className="flex-1 h-1 bg-border/40 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(sec.growth / 6) * 100}%`,
                              background: sec.pressure === "High" ? "#ef4444" : sec.pressure === "Medium" ? "#f59e0b" : "#10b981",
                              opacity: 0.7,
                            }}
                          />
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-foreground/70 w-10 text-right">{sec.growth}%</div>
                        <span className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                          sec.pressure === "High"
                            ? "text-red-400 border-red-500/20"
                            : sec.pressure === "Medium"
                            ? "text-amber-400 border-amber-500/20"
                            : "text-emerald-400 border-emerald-500/20"
                        )}>
                          {sec.pressure}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 mt-3 leading-relaxed font-mono">
                    Leisure/Hospitality and Healthcare remain hotspots. Tech sector wage growth has compressed from 2021-22 highs.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Composite</p>
                  <p className="font-serif text-lg font-semibold text-foreground leading-tight">Labor Market Composite (24-Month)</p>
                </div>
                <LineChart series={[unemploymentSeries, lfpSeries]} height={200} />
                <ChartLegend series={[unemploymentSeries, lfpSeries]} />
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 4: Global Comparison ──────────────────────────────────────── */}
          <TabsContent value="global" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Global</p>
                    <p className="font-serif text-lg font-semibold text-foreground leading-tight">GDP Growth (YoY %)</p>
                  </div>
                  <HeatmapGrid
                    cells={gdpGrowthMatrix}
                    title="G20 GDP Growth Rate"
                    minColor="#7f1d1d"
                    midColor="#374151"
                    maxColor="#065f46"
                    domain={[-0.5, 7.5]}
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/30 mt-2 px-1">
                    <span className="text-red-400/60">Contraction</span>
                    <span>Neutral</span>
                    <span className="text-emerald-400/60">Strong Growth</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 mt-2 leading-relaxed font-mono">
                    India (+7.0%) and Indonesia (+5.0%) lead. Germany (-0.2%) in mild recession. USA (+2.5%) outperforms G7 peers.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Prices</p>
                    <p className="font-serif text-lg font-semibold text-foreground leading-tight">Inflation (CPI YoY %)</p>
                  </div>
                  <HeatmapGrid
                    cells={inflationMatrix}
                    title="G20 Consumer Price Inflation"
                    minColor="#065f46"
                    midColor="#374151"
                    maxColor="#7f1d1d"
                    domain={[0, 8]}
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/30 mt-2 px-1">
                    <span className="text-emerald-400/60">Below Target</span>
                    <span>At Target</span>
                    <span className="text-red-400/60">Above Target</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 mt-2 leading-relaxed font-mono">
                    China (+0.2%) near deflation. UK (+4.0%) most persistent G7 inflation. Global disinflation trend intact.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">External</p>
                    <p className="font-serif text-lg font-semibold text-foreground leading-tight">Current Account (% GDP)</p>
                  </div>
                  <HeatmapGrid
                    cells={currentAccountMatrix}
                    title="Current Account Balance"
                    minColor="#7f1d1d"
                    midColor="#374151"
                    maxColor="#1e3a5f"
                    domain={[-4, 6]}
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/30 mt-2 px-1">
                    <span className="text-red-400/60">Deficit</span>
                    <span>Balanced</span>
                    <span>Surplus</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 mt-2 leading-relaxed font-mono">
                    Germany (+5.8%) and Japan (+3.5%) run large surpluses. USA (-3.1%) and UK (-3.5%) structural deficit nations.
                  </p>
                </div>
              </div>

              {/* G7 comparison table */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Comparison</p>
                  <p className="font-serif text-lg font-semibold text-foreground leading-tight">G7 Macro Snapshot</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 border-b border-border">
                      <tr>
                        <th className="text-left pb-2 font-mono font-medium">Country</th>
                        <th className="text-right pb-2 font-mono font-medium">GDP Growth</th>
                        <th className="text-right pb-2 font-mono font-medium">Inflation</th>
                        <th className="text-right pb-2 font-mono font-medium">Unemployment</th>
                        <th className="text-right pb-2 font-mono font-medium">Policy Rate</th>
                        <th className="text-right pb-2 font-mono font-medium">Current Acct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { c: "USA", gdp: 2.5, cpi: 3.1, unemp: 3.9, rate: 5.25, ca: -3.1 },
                        { c: "Canada", gdp: 1.2, cpi: 3.4, unemp: 5.8, rate: 5.00, ca: -1.2 },
                        { c: "UK", gdp: 0.3, cpi: 4.0, unemp: 4.2, rate: 5.25, ca: -3.5 },
                        { c: "Germany", gdp: -0.2, cpi: 2.9, unemp: 5.9, rate: 4.50, ca: 5.8 },
                        { c: "France", gdp: 0.9, cpi: 2.6, unemp: 7.3, rate: 4.50, ca: -1.5 },
                        { c: "Italy", gdp: 0.7, cpi: 0.9, unemp: 6.7, rate: 4.50, ca: 0.2 },
                        { c: "Japan", gdp: 1.9, cpi: 2.8, unemp: 2.5, rate: 0.10, ca: 3.5 },
                      ].map((row) => (
                        <tr key={row.c} className="border-b border-border/40 hover:bg-foreground/[0.02] transition-colors">
                          <td className="py-2.5 text-sm font-mono font-medium text-foreground">{row.c}</td>
                          <td className={cn("text-right py-2.5 text-sm font-mono tabular-nums", row.gdp < 0 ? "text-red-400" : row.gdp > 2 ? "text-emerald-400" : "text-amber-400")}>
                            {row.gdp > 0 ? "+" : ""}{row.gdp.toFixed(1)}%
                          </td>
                          <td className={cn("text-right py-2.5 text-sm font-mono tabular-nums", row.cpi > 3.5 ? "text-red-400" : row.cpi < 1.5 ? "text-foreground/60" : "text-amber-400")}>
                            {row.cpi.toFixed(1)}%
                          </td>
                          <td className="text-right py-2.5 text-sm font-mono tabular-nums text-foreground/70">{row.unemp.toFixed(1)}%</td>
                          <td className="text-right py-2.5 text-sm font-mono tabular-nums text-indigo-400">{row.rate.toFixed(2)}%</td>
                          <td className={cn("text-right py-2.5 text-sm font-mono tabular-nums", row.ca > 0 ? "text-foreground/70" : "text-red-400")}>
                            {row.ca > 0 ? "+" : ""}{row.ca.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 5: Regime Tracker ─────────────────────────────────────────── */}
          <TabsContent value="regime" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Regime Quadrant */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Regime</p>
                    <p className="font-serif text-lg font-semibold text-foreground leading-tight">Macro Regime Quadrant</p>
                  </div>
                  <RegimeQuadrant inflation={currentInflation} growth={currentGrowth} />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-lg border border-emerald-500/20 p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wide text-emerald-400/70 mb-1">Expansion Regime</p>
                      <p className="text-[11px] font-mono text-muted-foreground/50 leading-relaxed">Growth above trend, inflation above target. Current US regime. Favor equities, commodities, real assets.</p>
                    </div>
                    <div className="rounded-lg border border-indigo-500/20 p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wide text-indigo-400/70 mb-1">Asset Implications</p>
                      <p className="text-[11px] font-mono text-muted-foreground/50 leading-relaxed">Overweight: cyclicals, energy. Neutral: IG bonds. Underweight: long-duration Treasuries, defensive sectors.</p>
                    </div>
                  </div>
                </div>

                {/* Leading Indicators Scorecard */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Scorecard</p>
                      <p className="font-serif text-lg font-semibold text-foreground leading-tight">Leading Indicators</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-muted-foreground/30 mb-0.5">Composite</p>
                      <p className={cn("font-serif text-2xl font-bold tabular-nums", liScore >= 70 ? "text-emerald-400" : liScore >= 50 ? "text-amber-400" : "text-red-400")}>
                        {liScore}<span className="text-base font-mono text-muted-foreground/30">/100</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {leadingIndicators.map((li) => {
                      const passed = li.direction === "above" ? li.value > li.threshold : li.value < li.threshold;
                      return (
                        <div key={li.name} className="flex items-center justify-between border-b border-border/30 pb-2 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", passed ? "bg-emerald-400" : "bg-red-400")} />
                            <span className="text-[11px] font-mono text-muted-foreground/50">{li.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-[11px] font-mono tabular-nums font-medium", passed ? "text-foreground/80" : "text-red-400")}>
                              {li.value}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground/25">thr:{li.threshold}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* NBER cycle tracker */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Cycle</p>
                  <p className="font-serif text-lg font-semibold text-foreground leading-tight">NBER Business Cycle Tracker</p>
                </div>
                <NBERCycleBar />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[
                    { label: "Current Expansion", value: "71 months", sub: "Apr 2020 – present", accent: "text-emerald-400" },
                    { label: "Avg Post-WWII Expansion", value: "65 months", sub: "Historical average", accent: "text-foreground/60" },
                    { label: "Longest Ever", value: "128 months", sub: "Jun 2009 – Feb 2020", accent: "text-indigo-400" },
                    { label: "Recession Probability", value: "18%", sub: "12-month ahead (NY Fed)", accent: "text-amber-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30 mb-1">{stat.label}</p>
                      <p className={cn("font-serif text-xl font-bold tabular-nums", stat.accent)}>{stat.value}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/30 mt-0.5">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recession risk indicators */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Risk</p>
                  <p className="font-serif text-lg font-semibold text-foreground leading-tight">Recession Early Warning Signals</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { signal: "Yield Curve (10Y-2Y)", value: "+18 bps", status: "neutral", detail: "Recently uninverted from -108bps; historically lags recession by 12-18m" },
                    { signal: "Sahm Rule Indicator", value: "0.18", status: "safe", detail: "Below 0.5 threshold. Rule: 3m avg UE rate rise ≥ 0.5pp from 12m low." },
                    { signal: "Conference Board LEI", value: "-0.3% MoM", status: "warn", detail: "12 consecutive monthly declines prior; recent stabilization encouraging." },
                    { signal: "Real Retail Sales Trend", value: "+0.7% YoY", status: "safe", detail: "Positive real growth signals consumer still supporting GDP." },
                    { signal: "ISM New Orders", value: "52.4", status: "safe", detail: "Above 50 = expansion. Consistent with 6-month growth runway." },
                    { signal: "Credit Conditions (SLOOS)", value: "Tightening", status: "warn", detail: "Banks still reporting tighter lending standards; credit slowdown risk." },
                  ].map((item) => (
                    <div
                      key={item.signal}
                      className="rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30">{item.signal}</span>
                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                          item.status === "safe" ? "bg-emerald-400" : item.status === "warn" ? "bg-amber-400" : "bg-muted-foreground/30"
                        )} />
                      </div>
                      <p className={cn("font-serif text-base font-semibold tabular-nums mb-1",
                        item.status === "safe" ? "text-emerald-400" : item.status === "warn" ? "text-amber-400" : "text-muted-foreground/60"
                      )}>
                        {item.value}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground/40 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-6 pt-4">
        <p className="text-[10px] font-mono text-muted-foreground/25">
          Data shown is simulated for educational purposes. Sources modeled after BEA, BLS, Federal Reserve, ISM, Conference Board, NY Fed. Last updated: Q1 2026.
        </p>
      </div>
      </div>
    </div>
  );
}
