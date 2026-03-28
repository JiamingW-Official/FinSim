"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── mulberry32 seeded PRNG ────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Data generation ───────────────────────────────────────────────────────────

interface MonthlyPoint {
  month: string;
  value: number;
}

function generateMonthlyData(
  baseValue: number,
  months: number,
  volatility: number,
  rng: () => number,
): MonthlyPoint[] {
  const data: MonthlyPoint[] = [];
  let v = baseValue;
  const now = new Date(2026, 2, 1); // March 2026
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    v = v + (rng() - 0.5) * volatility;
    data.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      value: Math.round(v * 100) / 100,
    });
  }
  return data;
}

function generateQuarterlyData(
  baseValue: number,
  quarters: number,
  volatility: number,
  rng: () => number,
): MonthlyPoint[] {
  const data: MonthlyPoint[] = [];
  let v = baseValue;
  const now = new Date(2026, 2, 1);
  for (let i = quarters - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i * 3);
    v = v + (rng() - 0.5) * volatility;
    data.push({
      month: `Q${Math.ceil((d.getMonth() + 1) / 3)} '${String(d.getFullYear()).slice(2)}`,
      value: Math.round(v * 100) / 100,
    });
  }
  return data;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface KPICard {
  label: string;
  unit: string;
  current: number;
  previous: number;
  weight: number; // for health score
  healthDir: "up" | "down"; // "up" = higher is better
  sparkline: MonthlyPoint[];
  color: string;
  description: string;
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({
  data,
  color,
  width = 96,
  height = 32,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  // Fill path
  const fillPath = `M ${pts[0]} L ${pts.join(" L ")} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Line chart SVG ────────────────────────────────────────────────────────────

interface LineData {
  label: string;
  color: string;
  values: number[];
}

function LineChart({
  series,
  labels,
  width = 400,
  height = 180,
  showRecession = false,
  dottedRef,
  yLabel,
}: {
  series: LineData[];
  labels: string[];
  width?: number;
  height?: number;
  showRecession?: boolean;
  dottedRef?: number; // horizontal dashed line
  yLabel?: string;
}) {
  const padL = 48;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const W = width - padL - padR;
  const H = height - padT - padB;

  const allVals = series.flatMap((s) => s.values);
  if (dottedRef !== undefined) allVals.push(dottedRef);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const rangeV = maxV - minV || 1;

  const n = labels.length;
  const toX = (i: number) => padL + (i / (n - 1)) * W;
  const toY = (v: number) => padT + H - ((v - minV) / rangeV) * H;

  // Y-axis ticks
  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    minV + (i / yTicks) * rangeV,
  );

  // X-axis labels — show every Nth
  const xStep = Math.ceil(n / 6);
  const xLabels = labels.filter((_, i) => i % xStep === 0 || i === n - 1);
  const xLabelIndices = labels
    .map((_, i) => i)
    .filter((i) => i % xStep === 0 || i === n - 1);

  // Recession band: approximate 2020 region (20% from left for 5y monthly chart)
  const recessionStart = Math.floor(n * 0.07);
  const recessionEnd = Math.floor(n * 0.17);

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Recession shading */}
      {showRecession && (
        <rect
          x={toX(recessionStart)}
          y={padT}
          width={toX(recessionEnd) - toX(recessionStart)}
          height={H}
          fill="rgba(156,163,175,0.12)"
        />
      )}

      {/* Grid lines */}
      {yTickVals.map((v, i) => (
        <line
          key={i}
          x1={padL}
          y1={toY(v)}
          x2={padL + W}
          y2={toY(v)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      {yTickVals.map((v, i) => (
        <text
          key={i}
          x={padL - 6}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize="9"
          fill="rgba(255,255,255,0.35)"
        >
          {v.toFixed(1)}
        </text>
      ))}

      {/* Y-axis label */}
      {yLabel && (
        <text
          x={8}
          y={padT + H / 2}
          textAnchor="middle"
          fontSize="8"
          fill="rgba(255,255,255,0.3)"
          transform={`rotate(-90,8,${padT + H / 2})`}
        >
          {yLabel}
        </text>
      )}

      {/* X-axis labels */}
      {xLabelIndices.map((idx, i) => (
        <text
          key={i}
          x={toX(idx)}
          y={padT + H + 14}
          textAnchor="middle"
          fontSize="8"
          fill="rgba(255,255,255,0.3)"
        >
          {labels[idx]}
        </text>
      ))}

      {/* Dotted reference line */}
      {dottedRef !== undefined && (
        <line
          x1={padL}
          y1={toY(dottedRef)}
          x2={padL + W}
          y2={toY(dottedRef)}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          strokeDasharray="4,3"
        />
      )}

      {/* Spread fill (between first two series) */}
      {series.length >= 2 && (
        <path
          d={(() => {
            const s0 = series[0].values;
            const s1 = series[1].values;
            const fwd = s0.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ");
            const rev = s1
              .map((v, i) => `${toX(i)},${toY(v)}`)
              .reverse()
              .join(" L ");
            return `M ${fwd} L ${rev} Z`;
          })()}
          fill="rgba(99,102,241,0.08)"
        />
      )}

      {/* Lines */}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ");
        return (
          <polyline
            key={si}
            points={s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={si === 1 ? "none" : "none"}
          />
        );
      })}

      {/* Legend */}
      {series.map((s, si) => (
        <g key={si} transform={`translate(${padL + si * 80}, ${height - 8})`}>
          <rect x={0} y={-5} width={14} height={3} rx="1" fill={s.color} />
          <text x={18} y={0} fontSize="8" fill="rgba(255,255,255,0.4)">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Scatter plot SVG ─────────────────────────────────────────────────────────

interface ScatterPoint {
  x: number;
  y: number;
}

function ScatterPlot({
  points,
  xLabel,
  yLabel,
  color,
  width = 180,
  height = 160,
}: {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  color: string;
  width?: number;
  height?: number;
}) {
  const padL = 36;
  const padR = 10;
  const padT = 10;
  const padB = 28;
  const W = width - padL - padR;
  const H = height - padT - padB;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rx = maxX - minX || 1;
  const ry = maxY - minY || 1;

  const toX = (v: number) => padL + ((v - minX) / rx) * W;
  const toY = (v: number) => padT + H - ((v - minY) / ry) * H;

  // Simple linear regression for trendline
  const n = points.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const slope =
    xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0) /
    (xs.reduce((s, x) => s + (x - meanX) ** 2, 0) || 1);
  const intercept = meanY - slope * meanX;
  const x1 = minX;
  const x2 = maxX;
  const y1 = slope * x1 + intercept;
  const y2 = slope * x2 + intercept;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + H} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1={padL} y1={padT + H} x2={padL + W} y2={padT + H} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Trendline */}
      <line
        x1={toX(x1)}
        y1={toY(y1)}
        x2={toX(x2)}
        y2={toY(y2)}
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeDasharray="3,2"
      />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r="3" fill={color} fillOpacity="0.7" />
      ))}

      {/* Labels */}
      <text x={padL + W / 2} y={height - 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">
        {xLabel}
      </text>
      <text
        x={8}
        y={padT + H / 2}
        textAnchor="middle"
        fontSize="8"
        fill="rgba(255,255,255,0.35)"
        transform={`rotate(-90,8,${padT + H / 2})`}
      >
        {yLabel}
      </text>
    </svg>
  );
}

// ── Dot plot SVG (Fed dot plot) ───────────────────────────────────────────────

function DotPlot({
  dots,
  years,
  actualRate,
}: {
  dots: number[][];
  years: string[];
  actualRate: number;
}) {
  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 24;
  const width = 560;
  const height = 200;
  const W = width - padL - padR;
  const H = height - padT - padB;

  const minV = 2.5;
  const maxV = 6.5;
  const rangeV = maxV - minV;
  const colW = W / years.length;

  const toY = (v: number) => padT + H - ((v - minV) / rangeV) * H;
  const toX = (col: number) => padL + col * colW + colW / 2;

  const yTicks = [3, 3.5, 4, 4.5, 5, 5.5, 6];

  return (
    <svg width={width} height={height} className="overflow-visible w-full">
      {/* Grid */}
      {yTicks.map((v) => (
        <line
          key={v}
          x1={padL}
          y1={toY(v)}
          x2={padL + W}
          y2={toY(v)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {/* Y-axis ticks */}
      {yTicks.map((v) => (
        <text key={v} x={padL - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)">
          {v.toFixed(1)}%
        </text>
      ))}
      {/* Current rate line */}
      <line
        x1={padL}
        y1={toY(actualRate)}
        x2={padL + W}
        y2={toY(actualRate)}
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray="4,2"
      />
      <text x={padL + W + 4} y={toY(actualRate) + 4} fontSize="8" fill="#f59e0b">
        Now
      </text>
      {/* Year labels */}
      {years.map((y, i) => (
        <text
          key={i}
          x={toX(i)}
          y={height - 6}
          textAnchor="middle"
          fontSize="9"
          fill="rgba(255,255,255,0.4)"
        >
          {y}
        </text>
      ))}
      {/* Dots */}
      {dots.map((col, ci) =>
        col.map((v, di) => (
          <circle key={`${ci}-${di}`} cx={toX(ci)} cy={toY(v)} r="4" fill="#6366f1" fillOpacity="0.8" />
        )),
      )}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MacroPage() {
  const [expandedChart, setExpandedChart] = useState<number | null>(null);
  const [inflationTarget, setInflationTarget] = useState(2.0);
  const [actualInflation, setActualInflation] = useState(3.1);
  const [potentialGDP, setPotentialGDP] = useState(2.0);
  const [actualGDP, setActualGDP] = useState(2.8);

  // Generate all data once with seeded PRNG
  const data = useMemo(() => {
    const rng = mulberry32(5050);

    // 12-bar sparklines (monthly)
    const gdpSpark = generateMonthlyData(2.4, 12, 0.6, rng);
    const cpiSpark = generateMonthlyData(3.2, 12, 0.25, rng);
    const fedSpark = generateMonthlyData(5.25, 12, 0.15, rng);
    const unempSpark = generateMonthlyData(3.9, 12, 0.12, rng);
    const t10Spark = generateMonthlyData(4.45, 12, 0.18, rng);
    const pmiSpark = generateMonthlyData(48.5, 12, 2.1, rng);

    // Fix end values to current
    gdpSpark[11].value = 2.8;
    cpiSpark[11].value = 3.1;
    fedSpark[11].value = 5.25;
    unempSpark[11].value = 3.7;
    t10Spark[11].value = 4.62;
    pmiSpark[11].value = 49.2;

    const kpis: KPICard[] = [
      {
        label: "GDP Growth",
        unit: "%",
        current: 2.8,
        previous: 2.4,
        weight: 0.25,
        healthDir: "up",
        sparkline: gdpSpark,
        color: "#22c55e",
        description: "Real GDP YoY growth rate",
      },
      {
        label: "CPI Inflation",
        unit: "%",
        current: 3.1,
        previous: 3.4,
        weight: 0.2,
        healthDir: "down",
        sparkline: cpiSpark,
        color: "#f59e0b",
        description: "Consumer Price Index YoY",
      },
      {
        label: "Fed Funds Rate",
        unit: "%",
        current: 5.25,
        previous: 5.5,
        weight: 0.15,
        healthDir: "down",
        sparkline: fedSpark,
        color: "#6366f1",
        description: "Target federal funds rate",
      },
      {
        label: "Unemployment",
        unit: "%",
        current: 3.7,
        previous: 3.9,
        weight: 0.2,
        healthDir: "down",
        sparkline: unempSpark,
        color: "#ec4899",
        description: "U-3 unemployment rate",
      },
      {
        label: "10Y Treasury",
        unit: "%",
        current: 4.62,
        previous: 4.45,
        weight: 0.1,
        healthDir: "down",
        sparkline: t10Spark,
        color: "#14b8a6",
        description: "10-year Treasury yield",
      },
      {
        label: "ISM PMI",
        unit: "",
        current: 49.2,
        previous: 50.3,
        weight: 0.1,
        healthDir: "up",
        sparkline: pmiSpark,
        color: "#f97316",
        description: "ISM Manufacturing PMI (>50 = expansion)",
      },
    ];

    // Economic Health Score (0–100)
    // Each indicator contributes based on distance from "ideal"
    // GDP: ideal ~2.5%, CPI: ideal ~2%, Fed: ideal ~2.5%, Unemp: ideal ~4%, T10: ideal ~3%, PMI: ideal ~55
    function normalize(val: number, ideal: number, worst: number): number {
      const dist = Math.abs(val - ideal);
      const maxDist = Math.abs(worst - ideal);
      return Math.max(0, 1 - dist / maxDist);
    }
    const scores = [
      normalize(2.8, 2.5, 0) * 0.25,
      normalize(3.1, 2.0, 8) * 0.2,
      normalize(5.25, 2.5, 8) * 0.15,
      normalize(3.7, 4.0, 10) * 0.2,
      normalize(4.62, 3.0, 7) * 0.1,
      normalize(49.2, 55, 30) * 0.1,
    ];
    const healthScore = Math.round(scores.reduce((a, b) => a + b, 0) * 100);

    // Historical chart data
    // GDP quarterly 5y = 20 quarters
    const gdpRng = mulberry32(5051);
    const gdpQuarterly = generateQuarterlyData(2.1, 20, 0.8, gdpRng);
    gdpQuarterly[19].value = 2.8;

    // CPI monthly 3y = 36 months
    const cpiRng = mulberry32(5052);
    const cpiMonthly = generateMonthlyData(7.9, 36, 0.5, cpiRng);
    cpiMonthly[35].value = 3.1;
    // Core CPI offset
    const coreCpiRng = mulberry32(5053);
    const coreCpiMonthly = generateMonthlyData(6.5, 36, 0.4, coreCpiRng);
    coreCpiMonthly[35].value = 3.8;

    // Fed rate + 10Y monthly 5y = 60 months
    const fedRng = mulberry32(5054);
    const fedMonthly = generateMonthlyData(0.08, 60, 0.25, fedRng);
    fedMonthly.forEach((d, i) => {
      if (i > 12 && i < 50) d.value = Math.max(0, d.value + (i - 12) * 0.08);
    });
    fedMonthly[59].value = 5.25;

    const t10Rng = mulberry32(5055);
    const t10Monthly = generateMonthlyData(1.5, 60, 0.18, t10Rng);
    t10Monthly.forEach((d, i) => {
      if (i > 10) d.value = Math.max(1, d.value + (i - 10) * 0.055);
    });
    t10Monthly[59].value = 4.62;

    // Unemployment monthly 5y = 60 months
    const unempRng = mulberry32(5056);
    const unempMonthly = generateMonthlyData(14.7, 60, 0.6, unempRng);
    unempMonthly.forEach((d, i) => {
      d.value = Math.max(3.5, unempMonthly[0].value - (i / 59) * (14.7 - 3.7));
    });
    unempMonthly[59].value = 3.7;

    // Scatter data (correlation analysis)
    const scatterRng = mulberry32(5057);
    const cpiVsSnp: { x: number; y: number }[] = [];
    const rateVsPe: { x: number; y: number }[] = [];
    const pmiVsEarnings: { x: number; y: number }[] = [];
    const unempVsConsumer: { x: number; y: number }[] = [];
    for (let i = 0; i < 36; i++) {
      const cpi = 2 + scatterRng() * 6;
      cpiVsSnp.push({ x: cpi, y: 12 - cpi * 1.5 + (scatterRng() - 0.5) * 8 });

      const rate = scatterRng() * 5;
      rateVsPe.push({ x: rate, y: 28 - rate * 2.8 + (scatterRng() - 0.5) * 4 });

      const pmi = 44 + scatterRng() * 16;
      pmiVsEarnings.push({ x: pmi, y: (pmi - 50) * 1.2 + (scatterRng() - 0.5) * 5 });

      const unemp = 3.5 + scatterRng() * 8;
      unempVsConsumer.push({ x: unemp, y: 70 - unemp * 3.5 + (scatterRng() - 0.5) * 6 });
    }

    // Fed Funds futures probabilities — next 6 FOMC meetings
    const fomcDates = ["Mar 19", "May 7", "Jun 18", "Jul 30", "Sep 17", "Oct 29"];
    const fomcProbs: { cut: number; hold: number; hike: number }[] = [];
    const fomcRng = mulberry32(5058);
    for (let i = 0; i < 6; i++) {
      const cut = Math.round((0.15 + i * 0.08 + fomcRng() * 0.1) * 100);
      const hike = Math.round((0.05 - i * 0.01 + fomcRng() * 0.03) * 100);
      const hold = Math.max(0, 100 - cut - hike);
      fomcProbs.push({ cut, hold, hike });
    }

    // Dot plot data — 19 participants, 4 years
    const dotYears = ["2026", "2027", "2028", "Longer"];
    const dotRng = mulberry32(5059);
    const dotData: number[][] = dotYears.map((_, yi) => {
      const center = [4.75, 4.0, 3.25, 2.75][yi];
      return Array.from({ length: 19 }, () => {
        const offset = (dotRng() - 0.5) * 1.0;
        return Math.round((center + offset) * 4) / 4;
      });
    });

    // Historical FOMC meetings last 12
    const fomcHistory = [
      { date: "Mar 2025", decision: "Hold" as const, rate: "5.25–5.50%", dissents: 0 },
      { date: "Jan 2025", decision: "Hold" as const, rate: "5.25–5.50%", dissents: 1 },
      { date: "Dec 2024", decision: "Cut" as const, rate: "5.25–5.50%", dissents: 0 },
      { date: "Nov 2024", decision: "Cut" as const, rate: "5.50–5.75%", dissents: 0 },
      { date: "Sep 2024", decision: "Cut" as const, rate: "5.75–6.00%", dissents: 1 },
      { date: "Jul 2024", decision: "Hold" as const, rate: "6.00–6.25%", dissents: 0 },
      { date: "Jun 2024", decision: "Hold" as const, rate: "6.00–6.25%", dissents: 2 },
      { date: "May 2024", decision: "Hold" as const, rate: "6.00–6.25%", dissents: 0 },
      { date: "Mar 2024", decision: "Hike" as const, rate: "5.75–6.00%", dissents: 0 },
      { date: "Jan 2024", decision: "Hike" as const, rate: "5.50–5.75%", dissents: 1 },
      { date: "Dec 2023", decision: "Hike" as const, rate: "5.25–5.50%", dissents: 0 },
      { date: "Nov 2023", decision: "Hold" as const, rate: "5.25–5.50%", dissents: 0 },
    ];

    return {
      kpis,
      healthScore,
      gdpQuarterly,
      cpiMonthly,
      coreCpiMonthly,
      fedMonthly,
      t10Monthly,
      unempMonthly,
      scatterCpiVsSnp: cpiVsSnp,
      scatterRateVsPe: rateVsPe,
      scatterPmiVsEarnings: pmiVsEarnings,
      scatterUnempVsConsumer: unempVsConsumer,
      fomcDates,
      fomcProbs,
      dotYears,
      dotData,
      fomcHistory,
    };
  }, []);

  // Taylor Rule: r = r* + π + 0.5(π - π*) + 0.5(y - y*)
  // r* = neutral = 0.5%, π* = target inflation
  const taylorRate = useMemo(() => {
    const rStar = 0.5;
    const outputGap = actualGDP - potentialGDP;
    return rStar + actualInflation + 0.5 * (actualInflation - inflationTarget) + 0.5 * outputGap;
  }, [inflationTarget, actualInflation, potentialGDP, actualGDP]);

  // Macro signal decoder
  const signals = useMemo(() => {
    const gdp = 2.8;
    const cpi = 3.1;
    const rate = 5.25;
    const pmi = 49.2;

    const stockSignal =
      gdp > 2.5 && cpi < 4 && pmi > 48
        ? "bullish"
        : gdp < 1 || cpi > 5 || pmi < 45
          ? "bearish"
          : "neutral";
    const bondSignal =
      rate > 4.5 && cpi > 3 ? "bearish" : rate < 3 && cpi < 2.5 ? "bullish" : "neutral";
    const commSignal = cpi > 3.5 ? "bullish" : cpi < 2 ? "bearish" : "neutral";
    const usdSignal =
      rate > 4 ? "bullish" : rate < 2.5 ? "bearish" : "neutral";

    return { stocks: stockSignal, bonds: bondSignal, commodities: commSignal, usd: usdSignal } as const;
  }, []);

  const signalColor = (s: string) =>
    s === "bullish" ? "text-emerald-400 bg-emerald-400/10" : s === "bearish" ? "text-red-400 bg-red-400/10" : "text-amber-400 bg-amber-400/10";

  const healthColor =
    data.healthScore >= 70
      ? "bg-emerald-500"
      : data.healthScore >= 45
        ? "bg-amber-500"
        : "bg-red-500";

  const CORRELATIONS = [
    { indicator: "GDP Growth", corr: 0.62, direction: "positive" },
    { indicator: "CPI Inflation", corr: -0.41, direction: "negative" },
    { indicator: "Fed Funds Rate", corr: -0.38, direction: "negative" },
    { indicator: "Unemployment", corr: -0.55, direction: "negative" },
    { indicator: "10Y Treasury", corr: -0.29, direction: "negative" },
    { indicator: "ISM PMI", corr: 0.57, direction: "positive" },
    { indicator: "Consumer Confidence", corr: 0.48, direction: "positive" },
    { indicator: "Retail Sales", corr: 0.44, direction: "positive" },
  ];

  const handleChartClick = useCallback(
    (idx: number) => {
      setExpandedChart(expandedChart === idx ? null : idx);
    },
    [expandedChart],
  );

  const chartConfigs = useMemo(() => {
    const gdpLabels = data.gdpQuarterly.map((d) => d.month);
    const cpiLabels = data.cpiMonthly.map((d) => d.month);
    const rateLabels = data.fedMonthly.map((d) => d.month);
    const unempLabels = data.unempMonthly.map((d) => d.month);

    return [
      {
        title: "GDP Growth (Quarterly)",
        series: [{ label: "GDP %", color: "#22c55e", values: data.gdpQuarterly.map((d) => d.value) }],
        labels: gdpLabels,
        showRecession: true,
        yLabel: "%",
      },
      {
        title: "CPI vs Core CPI (Monthly)",
        series: [
          { label: "CPI", color: "#f59e0b", values: data.cpiMonthly.map((d) => d.value) },
          { label: "Core CPI", color: "#fb923c", values: data.coreCpiMonthly.map((d) => d.value) },
        ],
        labels: cpiLabels,
        showRecession: true,
        yLabel: "%",
      },
      {
        title: "Fed Rate vs 10Y Treasury",
        series: [
          { label: "Fed Rate", color: "#6366f1", values: data.fedMonthly.map((d) => d.value) },
          { label: "10Y Yield", color: "#14b8a6", values: data.t10Monthly.map((d) => d.value) },
        ],
        labels: rateLabels,
        showRecession: true,
        yLabel: "%",
      },
      {
        title: "Unemployment Rate",
        series: [{ label: "Unemployment", color: "#ec4899", values: data.unempMonthly.map((d) => d.value) }],
        labels: unempLabels,
        showRecession: true,
        dottedRef: 4.0,
        yLabel: "%",
      },
    ];
  }, [data]);

  // Next release countdowns (static since synthetic)
  const RELEASES = [
    { label: "FOMC Meeting", date: "Mar 19, 2026", daysLeft: -8 },
    { label: "CPI Release", date: "Apr 10, 2026", daysLeft: 14 },
    { label: "Jobs Report (NFP)", date: "Apr 3, 2026", daysLeft: 7 },
    { label: "GDP Advance Est.", date: "Apr 30, 2026", daysLeft: 34 },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Macro Economic Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Key indicators, historical trends, market correlations &amp; Fed policy
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Synthetic Data
            </span>
            <span>Updated Mar 2026</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="indicators" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-6 mt-3 shrink-0 justify-start gap-0 rounded-none border-b border-border/40 bg-transparent p-0">
          {["indicators", "charts", "correlation", "fedwatch"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
            >
              {tab === "indicators"
                ? "Key Indicators"
                : tab === "charts"
                  ? "Historical Charts"
                  : tab === "correlation"
                    ? "Market Correlation"
                    : "Fed Watch"}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Key Indicators ─────────────────────────────────────────── */}
        <TabsContent
          value="indicators"
          className="mt-0 flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden"
        >
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {data.kpis.map((kpi) => {
              const change = kpi.current - kpi.previous;
              const isUp = change > 0;
              const goodChange = kpi.healthDir === "up" ? isUp : !isUp;
              const changeColor = goodChange ? "text-emerald-400" : "text-red-400";
              const Arrow = isUp ? TrendingUp : TrendingDown;
              return (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-border/50 bg-card p-4 flex flex-col gap-2"
                >
                  <div className="text-xs font-medium text-muted-foreground">{kpi.label}</div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }}>
                      {kpi.current}
                      {kpi.unit}
                    </span>
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs", changeColor)}>
                    <Arrow className="h-3 w-3" />
                    <span>
                      {isUp ? "+" : ""}
                      {change.toFixed(2)}
                      {kpi.unit} vs prev
                    </span>
                  </div>
                  <div className="mt-1">
                    <Sparkline
                      data={kpi.sparkline.map((d) => d.value)}
                      color={kpi.color}
                      width={88}
                      height={28}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground/60">{kpi.description}</div>
                </div>
              );
            })}
          </div>

          {/* Economic Health Score */}
          <div className="mt-6 rounded-xl border border-border/50 bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Economic Health Score</div>
                <div className="text-xs text-muted-foreground">
                  Weighted composite of 6 key macro indicators vs. ideal ranges
                </div>
              </div>
              <div
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  data.healthScore >= 70
                    ? "text-emerald-400"
                    : data.healthScore >= 45
                      ? "text-amber-400"
                      : "text-red-400",
                )}
              >
                {data.healthScore}/100
              </div>
            </div>
            <div className="relative h-3 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", healthColor)}
                style={{ width: `${data.healthScore}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/50">
              <span>0 — Recession</span>
              <span>50 — Neutral</span>
              <span>100 — Optimal</span>
            </div>
          </div>

          {/* Release countdown */}
          <div className="mt-6">
            <div className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              Upcoming Data Releases
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {RELEASES.map((r) => (
                <div
                  key={r.label}
                  className="rounded-xl border border-border/50 bg-card p-4 flex flex-col gap-1"
                >
                  <div className="text-xs font-medium text-muted-foreground">{r.label}</div>
                  <div className="text-sm font-semibold">{r.date}</div>
                  <div
                    className={cn(
                      "text-xs font-medium",
                      r.daysLeft < 0
                        ? "text-muted-foreground/50"
                        : r.daysLeft <= 7
                          ? "text-amber-400"
                          : "text-primary/70",
                    )}
                  >
                    {r.daysLeft < 0
                      ? "Released"
                      : r.daysLeft === 0
                        ? "Today"
                        : `In ${r.daysLeft} days`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Historical Charts ──────────────────────────────────────── */}
        <TabsContent
          value="charts"
          className="mt-0 flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden"
        >
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            Click any chart to expand. Gray bands indicate 2020 recession period.
          </div>
          <div className={cn("grid gap-4", expandedChart === null ? "grid-cols-2" : "grid-cols-1")}>
            {chartConfigs.map((cfg, idx) => {
              const isExpanded = expandedChart === idx;
              const isHidden = expandedChart !== null && !isExpanded;
              if (isHidden) return null;
              const chartW = isExpanded ? 760 : 400;
              const chartH = isExpanded ? 280 : 180;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border/50 bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => handleChartClick(idx)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold">{cfg.title}</div>
                    <button className="text-muted-foreground/50 hover:text-foreground">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <LineChart
                      series={cfg.series}
                      labels={cfg.labels}
                      width={chartW}
                      height={chartH}
                      showRecession={cfg.showRecession}
                      dottedRef={"dottedRef" in cfg ? cfg.dottedRef : undefined}
                      yLabel={cfg.yLabel}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Tab 3: Market Correlation ─────────────────────────────────────── */}
        <TabsContent
          value="correlation"
          className="mt-0 flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden"
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Correlation table */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 text-sm font-semibold">
                Indicator vs. S&P 500 — Historical Correlations
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Indicator</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Correlation</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {CORRELATIONS.map((c) => (
                    <tr key={c.indicator} className="border-b border-border/20">
                      <td className="py-2 pr-4">{c.indicator}</td>
                      <td
                        className={cn(
                          "py-2 text-right tabular-nums font-semibold",
                          c.corr > 0 ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {c.corr > 0 ? "+" : ""}
                        {c.corr.toFixed(2)}
                      </td>
                      <td className="py-2 pl-3">
                        <div className="flex items-center gap-1">
                          <div className="relative h-2 w-24 rounded-full bg-muted/30 overflow-hidden">
                            {c.corr > 0 ? (
                              <div
                                className="absolute left-1/2 h-full rounded-full bg-emerald-500"
                                style={{ width: `${Math.abs(c.corr) * 50}%` }}
                              />
                            ) : (
                              <div
                                className="absolute h-full rounded-full bg-red-500"
                                style={{
                                  right: "50%",
                                  width: `${Math.abs(c.corr) * 50}%`,
                                }}
                              />
                            )}
                            <div className="absolute left-1/2 top-0 h-full w-px bg-border/60" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scatter plots */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 text-sm font-semibold">Scatter Analysis</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">CPI vs S&P Returns</div>
                  <ScatterPlot
                    points={data.scatterCpiVsSnp}
                    xLabel="CPI %"
                    yLabel="S&P %"
                    color="#f59e0b"
                    width={190}
                    height={150}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Rate Hikes vs P/E</div>
                  <ScatterPlot
                    points={data.scatterRateVsPe}
                    xLabel="Fed Rate %"
                    yLabel="P/E ratio"
                    color="#6366f1"
                    width={190}
                    height={150}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">PMI vs Earnings Growth</div>
                  <ScatterPlot
                    points={data.scatterPmiVsEarnings}
                    xLabel="ISM PMI"
                    yLabel="EPS Grwth %"
                    color="#f97316"
                    width={190}
                    height={150}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Unemp vs Consumer</div>
                  <ScatterPlot
                    points={data.scatterUnempVsConsumer}
                    xLabel="Unemployment %"
                    yLabel="Conf. Index"
                    color="#ec4899"
                    width={190}
                    height={150}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Macro Signal Decoder */}
          <div className="mt-6 rounded-xl border border-border/50 bg-card p-5">
            <div className="mb-1 text-sm font-semibold">Macro Signal Decoder</div>
            <div className="mb-4 text-xs text-muted-foreground">
              Current indicator readings interpreted for each asset class
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { label: "Stocks (S&P 500)", signal: signals.stocks, desc: "GDP+PMI supportive; inflation cooling" },
                  { label: "Bonds (10Y)", signal: signals.bonds, desc: "High rates suppress prices" },
                  { label: "Commodities", signal: signals.commodities, desc: "Elevated CPI supports hard assets" },
                  { label: "USD Index", signal: signals.usd, desc: "High rates attract capital flows" },
                ] as const
              ).map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border/40 p-4 flex flex-col gap-2"
                >
                  <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
                      signalColor(item.signal),
                    )}
                  >
                    {item.signal === "bullish" ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : item.signal === "bearish" ? (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    ) : (
                      <Minus className="mr-1 h-3 w-3" />
                    )}
                    {item.signal}
                  </span>
                  <div className="text-[10px] text-muted-foreground/70">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Fed Watch ──────────────────────────────────────────────── */}
        <TabsContent
          value="fedwatch"
          className="mt-0 flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden"
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* FOMC Futures Probabilities */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-1 text-sm font-semibold">Fed Funds Futures — FOMC Meeting Probabilities</div>
              <div className="mb-4 text-xs text-muted-foreground">
                Market-implied probabilities for each upcoming FOMC decision
              </div>
              <div className="space-y-3">
                {data.fomcDates.map((date, i) => {
                  const p = data.fomcProbs[i];
                  return (
                    <div key={date} className="flex items-center gap-3">
                      <div className="w-14 shrink-0 text-xs font-medium text-muted-foreground">{date}</div>
                      <div className="flex-1 space-y-1">
                        {/* Stacked bar */}
                        <div className="flex h-5 overflow-hidden rounded-md">
                          <div
                            className="flex items-center justify-center text-[9px] font-bold text-white bg-emerald-500"
                            style={{ width: `${p.cut}%` }}
                          >
                            {p.cut > 8 ? `Cut ${p.cut}%` : ""}
                          </div>
                          <div
                            className="flex items-center justify-center text-[9px] font-bold text-white bg-blue-500"
                            style={{ width: `${p.hold}%` }}
                          >
                            {p.hold > 12 ? `Hold ${p.hold}%` : ""}
                          </div>
                          <div
                            className="flex items-center justify-center text-[9px] font-bold text-white bg-red-500"
                            style={{ width: `${p.hike}%` }}
                          >
                            {p.hike > 5 ? `Hike ${p.hike}%` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="w-28 shrink-0 text-[10px] text-muted-foreground tabular-nums">
                        C:{p.cut}% H:{p.hold}% R:{p.hike}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-3 rounded-sm bg-emerald-500 inline-block" /> Cut
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-3 rounded-sm bg-blue-500 inline-block" /> Hold
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-3 rounded-sm bg-red-500 inline-block" /> Hike
                </span>
              </div>
            </div>

            {/* Taylor Rule Calculator */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-1 text-sm font-semibold">Taylor Rule Calculator</div>
              <div className="mb-4 text-xs text-muted-foreground">
                r = r* + π + 0.5(π − π*) + 0.5(y − y*) where r* = 0.5%
              </div>
              <div className="space-y-4">
                {(
                  [
                    {
                      label: "Inflation Target (π*)",
                      value: inflationTarget,
                      set: setInflationTarget,
                      min: 0.5,
                      max: 4,
                      step: 0.25,
                      color: "#f59e0b",
                    },
                    {
                      label: "Actual Inflation (π)",
                      value: actualInflation,
                      set: setActualInflation,
                      min: 0,
                      max: 10,
                      step: 0.1,
                      color: "#ec4899",
                    },
                    {
                      label: "Potential GDP Growth (y*)",
                      value: potentialGDP,
                      set: setPotentialGDP,
                      min: 0,
                      max: 5,
                      step: 0.1,
                      color: "#22c55e",
                    },
                    {
                      label: "Actual GDP Growth (y)",
                      value: actualGDP,
                      set: setActualGDP,
                      min: -3,
                      max: 8,
                      step: 0.1,
                      color: "#6366f1",
                    },
                  ] as const
                ).map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-semibold tabular-nums" style={{ color: s.color }}>
                        {s.value.toFixed(2)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={s.value}
                      onChange={(e) => s.set(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg bg-muted/20 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Taylor Rule Rate</div>
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    {taylorRate.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Actual Fed Rate</div>
                  <div className="text-2xl font-bold text-amber-400 tabular-nums">5.25%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Gap</div>
                  <div
                    className={cn(
                      "text-xl font-bold tabular-nums",
                      taylorRate - 5.25 > 0.5
                        ? "text-red-400"
                        : taylorRate - 5.25 < -0.5
                          ? "text-emerald-400"
                          : "text-muted-foreground",
                    )}
                  >
                    {taylorRate - 5.25 > 0 ? "+" : ""}
                    {(taylorRate - 5.25).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOMC Dot Plot */}
          <div className="mt-6 rounded-xl border border-border/50 bg-card p-5">
            <div className="mb-1 text-sm font-semibold">FOMC Dot Plot</div>
            <div className="mb-4 text-xs text-muted-foreground">
              Each dot = one participant&apos;s rate projection. Dashed amber = current rate (5.25%).
            </div>
            <div className="overflow-x-auto">
              <DotPlot dots={data.dotData} years={data.dotYears} actualRate={5.25} />
            </div>
          </div>

          {/* Historical FOMC Timeline */}
          <div className="mt-6 rounded-xl border border-border/50 bg-card p-5">
            <div className="mb-4 text-sm font-semibold">Historical FOMC Meeting Timeline</div>
            <div className="space-y-2">
              {data.fomcHistory.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-border/20 px-4 py-2.5 hover:bg-muted/10 transition-colors"
                >
                  <div className="w-20 shrink-0 text-xs text-muted-foreground">{m.date}</div>
                  <span
                    className={cn(
                      "w-12 shrink-0 rounded-full px-2 py-0.5 text-center text-[10px] font-bold",
                      m.decision === "Cut"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : m.decision === "Hike"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-blue-500/15 text-blue-400",
                    )}
                  >
                    {m.decision}
                  </span>
                  <div className="flex-1 text-xs font-medium tabular-nums">{m.rate}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {m.dissents > 0 ? (
                      <span className="text-amber-400">{m.dissents} dissent{m.dissents > 1 ? "s" : ""}</span>
                    ) : (
                      <span className="text-muted-foreground/40">Unanimous</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
