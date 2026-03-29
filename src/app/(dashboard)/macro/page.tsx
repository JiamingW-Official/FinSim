"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Globe,
  AlertTriangle,
  BarChart2,
  Users,
  DollarSign,
  Layers,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
              <line x1={PADL} x2={W - PADR} y1={y} y2={y} stroke="#1f2937" strokeWidth={1} />
              <text x={PADL - 6} y={y + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

      {referenceLines?.map((rl, ri) => {
        const y = py(rl.value);
        return (
          <g key={ri}>
            <line x1={PADL} x2={W - PADR} y1={y} y2={y} stroke={rl.color} strokeWidth={1} strokeDasharray="4 3" />
            <text x={W - PADR + 2} y={y + 4} fill={rl.color} fontSize={8}>{rl.label}</text>
          </g>
        );
      })}

      {series[0]?.points.map((pt, i) => {
        if (i % labelStep !== 0) return null;
        return (
          <text key={i} x={px(i, nLabels)} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize={8}>
            {pt.label.split(" ").slice(-1)[0]}
          </text>
        );
      })}

      {series.map((ser) => {
        const pts = ser.points.map((p, i) => `${px(i, ser.points.length)},${py(p.value)}`).join(" ");
        return (
          <g key={ser.name}>
            <polyline points={pts} fill="none" stroke={ser.color} strokeWidth={2} strokeLinejoin="round" />
            {ser.points.map((p, i) => (
              <circle key={i} cx={px(i, ser.points.length)} cy={py(p.value)} r={2.5} fill={ser.color} />
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
      <p className="text-xs text-muted-foreground mb-2 font-medium">{title}</p>
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
              <span className={`text-xs font-bold ${textDark ? "text-background" : "text-foreground"}`}>{cell.country}</span>
              <span className={`text-[11px] ${textDark ? "text-muted-foreground/50" : "text-foreground/90"}`}>{cell.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  delta,
  unit = "",
  icon,
}: {
  label: string;
  value: number;
  delta: number;
  unit?: string;
  icon?: React.ReactNode;
}) {
  const positive = delta >= 0;
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="text-2xl font-bold text-foreground">
          {value.toFixed(1)}{unit}
        </div>
        <div className={`flex items-center gap-1 text-xs mt-1 ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>{positive ? "+" : ""}{delta.toFixed(1)}{unit} vs prev</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────
function ChartLegend({ series }: { series: LineSeries[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      {series.map((s) => (
        <div key={s.name} className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
          <span className="text-xs text-muted-foreground">{s.name}</span>
        </div>
      ))}
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

  // growth axis: -1 to 4 %; inflation axis: 0 to 7%
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
      {/* Quadrant backgrounds */}
      <rect x={PAD} y={PAD} width={midX - PAD} height={midY - PAD} fill="#f59e0b" opacity={0.07} />
      <rect x={midX} y={PAD} width={W - PAD - midX} height={midY - PAD} fill="#10b981" opacity={0.07} />
      <rect x={PAD} y={midY} width={midX - PAD} height={H - PAD - midY} fill="#6366f1" opacity={0.07} />
      <rect x={midX} y={midY} width={W - PAD - midX} height={H - PAD - midY} fill="#3b82f6" opacity={0.07} />

      {/* Grid lines */}
      <line x1={PAD} x2={W - PAD} y1={midY} y2={midY} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={midX} x2={midX} y1={PAD} y2={H - PAD} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />

      {/* Axes */}
      <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="#4b5563" strokeWidth={1} />
      <line x1={PAD} x2={PAD} y1={PAD} y2={H - PAD} stroke="#4b5563" strokeWidth={1} />

      {/* Axis labels */}
      <text x={W / 2} y={H - 6} textAnchor="middle" fill="#9ca3af" fontSize={9}>GDP Growth (%)</text>
      <text x={12} y={H / 2} textAnchor="middle" fill="#9ca3af" fontSize={9} transform={`rotate(-90, 12, ${H / 2})`}>Inflation (%)</text>

      {/* Tick values */}
      {[growthMin, 0, growthMid, growthMax].map((g, i) => (
        <text key={i} x={gx(g)} y={H - PAD + 12} textAnchor="middle" fill="#6b7280" fontSize={8}>{g}%</text>
      ))}
      {[inflMin, inflMid, inflMax].map((inf, i) => (
        <text key={i} x={PAD - 4} y={iy(inf) + 4} textAnchor="end" fill="#6b7280" fontSize={8}>{inf}%</text>
      ))}

      {/* Quadrant labels */}
      {quadrants.map((q) => (
        <text key={q.label} x={q.x} y={q.y} fill={q.color} fontSize={9} fontWeight="600" opacity={0.8}>{q.label}</text>
      ))}

      {/* Current position dot */}
      <circle cx={cx} cy={cy} r={10} fill="#6366f1" opacity={0.2} />
      <circle cx={cx} cy={cy} r={6} fill="#6366f1" />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#a5b4fc" fontSize={9} fontWeight="600">NOW</text>
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
      <p className="text-xs text-muted-foreground mb-2 font-medium">NBER Business Cycle</p>
      <div className="flex rounded-lg overflow-hidden h-8">
        {cycles.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-center text-[11px] font-semibold relative overflow-hidden"
            style={{
              width: `${c.pct}%`,
              background: c.type === "expansion" ? "#10b981" : "#ef4444",
              opacity: 0.85,
            }}
          >
            <span className="text-foreground truncate px-1">{c.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1 px-0.5">
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

  const regimeColor =
    regimeLabel === "Expansion"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : regimeLabel === "Recovery"
      ? "bg-primary/20 text-primary border-border"
      : regimeLabel === "Stagflation"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : "bg-primary/20 text-primary border-border";

  const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

  return (
    <div className="p-4 space-y-4 min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Globe size={22} className="text-indigo-400" />
            Macroeconomics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Simulated macro indicators for informed investment decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`border ${regimeColor} font-semibold text-sm px-3 py-1`}>
            {regimeLabel}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground border-border">
            as of Q1 2026
          </Badge>
        </div>
      </motion.div>

      {/* Summary Row — Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-md border border-border bg-card border-l-4 border-l-primary p-6"
      >
        <StatChip label="US Real GDP Growth" value={2.5} delta={0.2} unit="%" icon={<TrendingUp size={13} />} />
        <StatChip label="CPI (YoY)" value={2.8} delta={-0.1} unit="%" icon={<Activity size={13} />} />
        <StatChip label="Unemployment" value={3.9} delta={0.1} unit="%" icon={<Users size={13} />} />
        <StatChip label="Fed Funds Rate" value={5.25} delta={0.0} unit="%" icon={<DollarSign size={13} />} />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border h-10 mb-4">
            <TabsTrigger value="growth" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <BarChart2 size={12} className="mr-1.5" /> Growth
            </TabsTrigger>
            <TabsTrigger value="inflation" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <TrendingUp size={12} className="mr-1.5" /> Inflation
            </TabsTrigger>
            <TabsTrigger value="labor" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <Users size={12} className="mr-1.5" /> Labor
            </TabsTrigger>
            <TabsTrigger value="global" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <Globe size={12} className="mr-1.5" /> Global
            </TabsTrigger>
            <TabsTrigger value="regime" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              <Layers size={12} className="mr-1.5" /> Regime
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Growth Indicators ────────────────────────────────────────── */}
          <TabsContent value="growth" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* GDP Chart */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp size={14} className="text-indigo-400" />
                      Real GDP Growth (YoY %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      series={[gdpSeries]}
                      height={180}
                      referenceLines={[{ value: 0, color: "#ef4444", label: "0%" }]}
                    />
                    <ChartLegend series={[gdpSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Current: <span className="text-foreground font-medium">+2.5%</span> — Steady expansion above trend growth of ~1.8%. Driven by resilient consumer spending and services sector.
                    </p>
                  </CardContent>
                </Card>

                {/* PMI Chart */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Activity size={14} className="text-emerald-400" />
                      Manufacturing PMI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      series={[pmiSeries]}
                      height={180}
                      referenceLines={[{ value: 50, color: "#f59e0b", label: "50 (boom/bust)" }]}
                    />
                    <ChartLegend series={[pmiSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Current: <span className="text-foreground font-medium">50.8</span> — Barely in expansion territory. New orders sub-index at 52.4 signals modest improvement ahead.
                    </p>
                  </CardContent>
                </Card>

                {/* Industrial Production */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <BarChart2 size={14} className="text-amber-400" />
                      Industrial Production (YoY %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart series={[indProdSeries]} height={180} />
                    <ChartLegend series={[indProdSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Current: <span className="text-foreground font-medium">+1.9%</span> — Recovery from 2023 contraction. Semiconductor and auto sectors leading rebound.
                    </p>
                  </CardContent>
                </Card>

                {/* Retail Sales */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <DollarSign size={14} className="text-pink-400" />
                      Retail Sales (YoY %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart series={[retailSalesSeries]} height={180} />
                    <ChartLegend series={[retailSalesSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Current: <span className="text-foreground font-medium">+3.5%</span> — Normalizing from post-pandemic highs. Real (inflation-adjusted) growth near +0.7%.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Combined overlay */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Growth Composite Overlay</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    series={[gdpSeries, indProdSeries, retailSalesSeries]}
                    height={200}
                    referenceLines={[{ value: 0, color: "#6b7280", label: "0%" }]}
                  />
                  <ChartLegend series={[gdpSeries, indProdSeries, retailSalesSeries]} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 2: Inflation ─────────────────────────────────────────────────── */}
          <TabsContent value="inflation" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* CPI & PCE */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <TrendingDown size={14} className="text-red-400" />
                      CPI vs Core PCE (YoY %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      series={[cpiSeries, pceSeries]}
                      height={200}
                      referenceLines={[{ value: 2.0, color: "#10b981", label: "Fed 2% target" }]}
                    />
                    <ChartLegend series={[cpiSeries, pceSeries]} />
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-muted rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground">CPI (latest)</div>
                        <div className="text-lg font-medium text-red-400">2.8%</div>
                      </div>
                      <div className="bg-muted rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground">Core PCE (latest)</div>
                        <div className="text-lg font-medium text-orange-400">2.8%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* TIPS Breakeven */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Activity size={14} className="text-muted-foreground/50" />
                      Inflation Expectations (TIPS Breakeven)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      series={[tipsBeSeries]}
                      height={200}
                      referenceLines={[
                        { value: 2.0, color: "#10b981", label: "2% target" },
                        { value: 2.5, color: "#f59e0b", label: "2.5% alert" },
                      ]}
                    />
                    <ChartLegend series={[tipsBeSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      5Y TIPS breakeven at <span className="text-foreground font-medium">2.3%</span> — Market expects inflation slightly above Fed target over next 5 years, down from 3.1% peak in early 2022.
                    </p>
                  </CardContent>
                </Card>

                {/* Wage Growth */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-400" />
                      Wage Growth (YoY %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      series={[wageSeries]}
                      height={200}
                      referenceLines={[{ value: 3.5, color: "#f59e0b", label: "~Sustainable" }]}
                    />
                    <ChartLegend series={[wageSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Average hourly earnings at <span className="text-foreground font-medium">+3.9%</span> — Wage growth decelerating from 5.7% peak but still above Fed's estimated ~3.5% sustainable rate.
                    </p>
                  </CardContent>
                </Card>

                {/* Inflation breakdown */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">CPI Component Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "Shelter", contribution: 1.8, color: "bg-indigo-500" },
                      { name: "Food at Home", contribution: 0.3, color: "bg-emerald-500" },
                      { name: "Energy", contribution: -0.2, color: "bg-amber-500" },
                      { name: "Core Services ex-Shelter", contribution: 0.6, color: "bg-red-500" },
                      { name: "Core Goods", contribution: 0.1, color: "bg-primary" },
                      { name: "Medical Care", contribution: 0.2, color: "bg-pink-500" },
                    ].map((comp) => (
                      <div key={comp.name}>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="text-muted-foreground">{comp.name}</span>
                          <span className={comp.contribution >= 0 ? "text-foreground" : "text-emerald-400"}>
                            {comp.contribution >= 0 ? "+" : ""}{comp.contribution.toFixed(1)}pp
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${comp.color}`}
                            style={{ width: `${Math.abs(comp.contribution) / 2 * 100}%`, opacity: comp.contribution < 0 ? 0.5 : 1 }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-1">
                      Shelter remains the largest contributor at +1.8pp. Energy is deflationary (-0.2pp), providing offset.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Full overlay */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Inflation Overview (24-Month Trend)</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    series={[cpiSeries, pceSeries, tipsBeSeries, wageSeries]}
                    height={220}
                    referenceLines={[{ value: 2.0, color: "#10b981", label: "2%" }]}
                  />
                  <ChartLegend series={[cpiSeries, pceSeries, tipsBeSeries, wageSeries]} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 3: Labor Market ──────────────────────────────────────────────── */}
          <TabsContent value="labor" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Unemployment */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Users size={14} className="text-indigo-400" />
                      Unemployment Rate (U-3, %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                        <div key={m.label} className="bg-muted rounded p-2 text-center">
                          <div className="text-xs text-muted-foreground">{m.label}</div>
                          <div className="text-sm font-medium text-foreground">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* JOLTS */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <BarChart2 size={14} className="text-emerald-400" />
                      JOLTS Job Openings (millions)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      series={[joltsSeries]}
                      height={200}
                      referenceLines={[{ value: 8.0, color: "#6366f1", label: "Pre-COVID avg" }]}
                    />
                    <ChartLegend series={[joltsSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Job openings at <span className="text-foreground font-medium">8.6M</span> — Down from 12M peak but still above pre-pandemic levels. Hires-to-openings ratio improving. Quits rate 2.1% (normalizing).
                    </p>
                  </CardContent>
                </Card>

                {/* LFP */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Activity size={14} className="text-amber-400" />
                      Labor Force Participation Rate (%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      series={[lfpSeries]}
                      height={200}
                      referenceLines={[{ value: 63.4, color: "#6b7280", label: "Pre-COVID peak" }]}
                    />
                    <ChartLegend series={[lfpSeries]} />
                    <p className="text-xs text-muted-foreground mt-2">
                      LFP at <span className="text-foreground font-medium">62.5%</span> — Still ~0.9pp below Feb 2020 peak due to early retirements and demographic shifts among 55+ cohort.
                    </p>
                  </CardContent>
                </Card>

                {/* Wage pressure heatmap */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">Sector Wage Pressure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
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
                        <div className="w-36 text-xs text-muted-foreground truncate shrink-0">{sec.sector}</div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(sec.growth / 6) * 100}%`,
                              background: sec.pressure === "High" ? "#ef4444" : sec.pressure === "Medium" ? "#f59e0b" : "#10b981",
                            }}
                          />
                        </div>
                        <div className="text-xs text-foreground font-medium w-10 text-right">{sec.growth}%</div>
                        <Badge
                          className={`text-xs text-muted-foreground py-0 px-1.5 border ${
                            sec.pressure === "High"
                              ? "bg-red-500/5 text-red-400 border-red-500/30"
                              : sec.pressure === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/5 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {sec.pressure}
                        </Badge>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-1">
                      Leisure/Hospitality and Healthcare remain hotspots. Tech sector (Information) wage growth has compressed significantly from 2021-22 highs.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* All labor series */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Labor Market Composite (24-Month)</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    series={[unemploymentSeries, lfpSeries]}
                    height={200}
                  />
                  <ChartLegend series={[unemploymentSeries, lfpSeries]} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 4: Global Comparison ─────────────────────────────────────────── */}
          <TabsContent value="global" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* GDP Growth Heatmap */}
                <Card className="bg-card border-border lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Globe size={14} className="text-indigo-400" />
                      GDP Growth (YoY %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeatmapGrid
                      cells={gdpGrowthMatrix}
                      title="G20 GDP Growth Rate"
                      minColor="#7f1d1d"
                      midColor="#374151"
                      maxColor="#065f46"
                      domain={[-0.5, 7.5]}
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-2 px-1">
                      <span className="text-red-400">Contraction</span>
                      <span>Neutral</span>
                      <span className="text-emerald-400">Strong Growth</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      India (+7.0%) and Indonesia (+5.0%) lead. Germany (-0.2%) in mild recession. USA (+2.5%) outperforms G7 peers.
                    </p>
                  </CardContent>
                </Card>

                {/* Inflation Heatmap */}
                <Card className="bg-card border-border lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-400" />
                      Inflation (CPI YoY %)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeatmapGrid
                      cells={inflationMatrix}
                      title="G20 Consumer Price Inflation"
                      minColor="#065f46"
                      midColor="#374151"
                      maxColor="#7f1d1d"
                      domain={[0, 8]}
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-2 px-1">
                      <span className="text-emerald-400">Below Target</span>
                      <span>At Target</span>
                      <span className="text-red-400">Above Target</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      China (+0.2%) near deflation. UK (+4.0%) most persistent G7 inflation. Global disinflation trend intact.
                    </p>
                  </CardContent>
                </Card>

                {/* Current Account Heatmap */}
                <Card className="bg-card border-border lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <DollarSign size={14} className="text-muted-foreground/50" />
                      Current Account (% GDP)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeatmapGrid
                      cells={currentAccountMatrix}
                      title="Current Account Balance"
                      minColor="#7f1d1d"
                      midColor="#374151"
                      maxColor="#1e3a5f"
                      domain={[-4, 6]}
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-2 px-1">
                      <span className="text-red-400">Deficit</span>
                      <span>Balanced</span>
                      <span className="text-primary">Surplus</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Germany (+5.8%) and Japan (+3.5%) run large surpluses. USA (-3.1%) and UK (-3.5%) structural deficit nations.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* G7 comparison table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">G7 Macro Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-muted-foreground">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Country</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">GDP Growth</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Inflation</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Unemployment</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Policy Rate</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Current Acct</th>
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
                          <tr key={row.c} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2 font-medium text-foreground">{row.c}</td>
                            <td className={`text-right py-2 ${row.gdp < 0 ? "text-red-400" : row.gdp > 2 ? "text-emerald-400" : "text-amber-400"}`}>
                              {row.gdp > 0 ? "+" : ""}{row.gdp.toFixed(1)}%
                            </td>
                            <td className={`text-right py-2 ${row.cpi > 3.5 ? "text-red-400" : row.cpi < 1.5 ? "text-primary" : "text-amber-400"}`}>
                              {row.cpi.toFixed(1)}%
                            </td>
                            <td className="text-right py-2 text-foreground">{row.unemp.toFixed(1)}%</td>
                            <td className="text-right py-2 text-indigo-400">{row.rate.toFixed(2)}%</td>
                            <td className={`text-right py-2 ${row.ca > 0 ? "text-primary" : "text-red-400"}`}>
                              {row.ca > 0 ? "+" : ""}{row.ca.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 5: Regime Tracker ────────────────────────────────────────────── */}
          <TabsContent value="regime" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Regime Quadrant */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Layers size={14} className="text-indigo-400" />
                      Macro Regime Quadrant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegimeQuadrant inflation={currentInflation} growth={currentGrowth} />
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2">
                        <div className="text-xs text-emerald-400 font-medium mb-1">Expansion Regime</div>
                        <div className="text-xs text-muted-foreground">Growth above trend, inflation above target. Current US regime. Favor equities, commodities, real assets.</div>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded p-2">
                        <div className="text-xs text-indigo-400 font-medium mb-1">Asset Implications</div>
                        <div className="text-xs text-muted-foreground">Overweight: cyclicals, energy. Neutral: IG bonds. Underweight: long-duration Treasuries, defensive sectors.</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Leading Indicators Scorecard */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Activity size={14} className="text-emerald-400" />
                      Leading Indicators Scorecard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">Composite Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={liScore} className="w-24 h-2" />
                        <span className={`text-sm font-medium ${liScore >= 70 ? "text-emerald-400" : liScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {liScore}/100
                        </span>
                      </div>
                    </div>
                    {leadingIndicators.map((li) => {
                      const passed = li.direction === "above" ? li.value > li.threshold : li.value < li.threshold;
                      return (
                        <div key={li.name} className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {passed ? (
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                            )}
                            <span className="text-muted-foreground">{li.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${passed ? "text-foreground" : "text-red-400"}`}>
                              {li.value}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              (thr: {li.threshold})
                            </span>
                            {passed ? (
                              <TrendingUp size={10} className="text-emerald-400" />
                            ) : (
                              <TrendingDown size={10} className="text-red-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* NBER cycle tracker */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Layers size={14} className="text-muted-foreground/50" />
                    NBER Business Cycle Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NBERCycleBar />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {[
                      { label: "Current Expansion", value: "71 months", sub: "Apr 2020 – present", color: "emerald" },
                      { label: "Avg Post-WWII Expansion", value: "65 months", sub: "Historical average", color: "blue" },
                      { label: "Longest Ever", value: "128 months", sub: "Jun 2009 – Feb 2020", color: "indigo" },
                      { label: "Recession Probability", value: "18%", sub: "12-month ahead (NY Fed)", color: "amber" },
                    ].map((stat) => (
                      <div key={stat.label} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-lg p-3`}>
                        <div className={`text-xs text-muted-foreground text-${stat.color}-400 font-medium mb-0.5`}>{stat.label}</div>
                        <div className="text-lg font-medium text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.sub}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recession risk indicators */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-400" />
                    Recession Early Warning Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                        className={`rounded-lg p-3 border ${
                          item.status === "safe"
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : item.status === "warn"
                            ? "bg-amber-500/5 border-amber-500/20"
                            : "bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{item.signal}</span>
                          {item.status === "safe" ? (
                            <Minus size={12} className="text-emerald-400" />
                          ) : item.status === "warn" ? (
                            <AlertTriangle size={12} className="text-amber-400" />
                          ) : (
                            <Minus size={12} className="text-muted-foreground" />
                          )}
                        </div>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            item.status === "safe" ? "text-emerald-400" : item.status === "warn" ? "text-amber-400" : "text-muted-foreground"
                          }`}
                        >
                          {item.value}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground border-t border-border pt-4">
        Data shown is simulated for educational purposes. Sources modeled after BEA, BLS, Federal Reserve, ISM, Conference Board, NY Fed. Last updated: Q1 2026.
      </div>
    </div>
  );
}
