"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Globe,
  AlertTriangle,
  BarChart2,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 3;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 3) {
  s = seed;
}

function randBetween(min: number, max: number) {
  return min + rand() * (max - min);
}

function randInt(min: number, max: number) {
  return Math.floor(randBetween(min, max + 1));
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({
  values,
  color,
  width = 80,
  height = 28,
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Area Chart SVG ────────────────────────────────────────────────────────────
function AreaChart({
  series,
  width = 480,
  height = 140,
  labels,
}: {
  series: { label: string; color: string; values: number[] }[];
  width?: number;
  height?: number;
  labels?: string[];
}) {
  if (!series.length || !series[0].values.length) return null;
  const n = series[0].values.length;
  const maxVal = Math.max(...series.flatMap((s) => s.values));
  const padL = 40;
  const padB = 24;
  const padR = 8;
  const padT = 8;
  const W = width - padL - padR;
  const H = height - padT - padB;

  function toPath(vals: number[], fill: boolean): string {
    const pts = vals.map((v, i) => {
      const x = padL + (i / (n - 1)) * W;
      const y = padT + H - (v / maxVal) * H;
      return `${x},${y}`;
    });
    if (fill) {
      const firstX = padL;
      const lastX = padL + W;
      const baseY = padT + H;
      return `M${firstX},${baseY} L${pts[0]} L${pts.slice(1).join(" L")} L${lastX},${baseY} Z`;
    }
    return `M${pts[0]} L${pts.slice(1).join(" L")}`;
  }

  return (
    <svg width={width} height={height}>
      {[0, 0.5, 1].map((t, i) => {
        const y = padT + H - t * H;
        return (
          <g key={i}>
            <line x1={padL} x2={padL + W} y1={y} y2={y} stroke="#ffffff10" strokeWidth={1} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">
              {((t * maxVal) / 1000).toFixed(0)}T
            </text>
          </g>
        );
      })}
      {series.map((s) => (
        <path key={s.label + "area"} d={toPath(s.values, true)} fill={s.color} opacity={0.15} />
      ))}
      {series.map((s) => (
        <path key={s.label + "line"} d={toPath(s.values, false)} fill="none" stroke={s.color} strokeWidth={1.5} />
      ))}
      {labels &&
        labels.map((lbl, i) => {
          if (i % Math.ceil(n / 6) !== 0) return null;
          const x = padL + (i / (n - 1)) * W;
          return (
            <text key={i} x={x} y={height - 4} textAnchor="middle" fontSize={9} fill="#6b7280">
              {lbl}
            </text>
          );
        })}
    </svg>
  );
}

// ── Bar Chart SVG ─────────────────────────────────────────────────────────────
function BarChart({
  bars,
  width = 320,
  height = 140,
  horizontal = false,
}: {
  bars: { label: string; value: number; color: string }[];
  width?: number;
  height?: number;
  horizontal?: boolean;
}) {
  if (!bars.length) return null;
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.value)));
  const padL = horizontal ? 90 : 8;
  const padR = 8;
  const padT = 8;
  const padB = horizontal ? 8 : 28;
  const W = width - padL - padR;
  const H = height - padT - padB;

  if (horizontal) {
    const rowH = H / bars.length;
    const zeroX = padL + (maxAbs > 0 ? W / 2 : 0);
    return (
      <svg width={width} height={height}>
        <line x1={zeroX} x2={zeroX} y1={padT} y2={padT + H} stroke="#ffffff20" strokeWidth={1} />
        {bars.map((b, i) => {
          const barW = (Math.abs(b.value) / (maxAbs || 1)) * (W / 2);
          const x = b.value >= 0 ? zeroX : zeroX - barW;
          const y = padT + i * rowH + 2;
          const bh = rowH - 4;
          return (
            <g key={i}>
              <text x={padL - 4} y={y + bh / 2 + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                {b.label}
              </text>
              <rect x={x} y={y} width={barW} height={bh} rx={2} fill={b.color} opacity={0.8} />
              <text x={x + (b.value >= 0 ? barW + 2 : -2)} y={y + bh / 2 + 4} textAnchor={b.value >= 0 ? "start" : "end"} fontSize={9} fill={b.color}>
                {b.value > 0 ? "+" : ""}{b.value.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  const barW = W / bars.length;
  return (
    <svg width={width} height={height}>
      {bars.map((b, i) => {
        const bh = (Math.abs(b.value) / (maxAbs || 1)) * H;
        const x = padL + i * barW + 2;
        const y = b.value >= 0 ? padT + H - bh : padT + H;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW - 4} height={bh} rx={2} fill={b.color} opacity={0.8} />
            <text x={x + (barW - 4) / 2} y={height - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Quadrant Chart SVG ────────────────────────────────────────────────────────
function QuadrantChart({
  point,
  width = 260,
  height = 220,
}: {
  point: { x: number; y: number; label: string };
  width?: number;
  height?: number;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(cx, cy) - 24;
  const dotX = cx + point.x * r;
  const dotY = cy - point.y * r;
  const quadrants = [
    { label: "Stagflation", color: "#ef444420", x: cx - r, y: cy - r, w: r, h: r },
    { label: "Goldilocks", color: "#10b98120", x: cx, y: cy - r, w: r, h: r },
    { label: "Deflation", color: "#6b728020", x: cx - r, y: cy, w: r, h: r },
    { label: "Reflation", color: "#f59e0b20", x: cx, y: cy, w: r, h: r },
  ];
  return (
    <svg width={width} height={height}>
      {quadrants.map((q) => (
        <g key={q.label}>
          <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={q.color} />
          <text x={q.x + q.w / 2} y={q.y + q.h / 2 + 4} textAnchor="middle" fontSize={10} fill="#6b7280">
            {q.label}
          </text>
        </g>
      ))}
      <line x1={cx} x2={cx} y1={cy - r} y2={cy + r} stroke="#ffffff20" strokeWidth={1} />
      <line x1={cx - r} x2={cx + r} y1={cy} y2={cy} stroke="#ffffff20" strokeWidth={1} />
      <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
        Growth
      </text>
      <text x={cx - r - 4} y={cy} textAnchor="end" fontSize={9} fill="#6b7280" transform={`rotate(-90,${cx - r - 4},${cy})`}>
        Inflation
      </text>
      <circle cx={dotX} cy={dotY} r={7} fill="#6366f1" opacity={0.9} />
      <circle cx={dotX} cy={dotY} r={12} fill="#6366f1" opacity={0.2} />
      <text x={dotX + 10} y={dotY - 8} fontSize={10} fill="#a5b4fc">
        {point.label}
      </text>
    </svg>
  );
}

// ── Heat Matrix ───────────────────────────────────────────────────────────────
function HeatMatrix({
  rows,
  cols,
  data,
  width = 360,
  height = 120,
}: {
  rows: string[];
  cols: string[];
  data: number[][];
  width?: number;
  height?: number;
}) {
  const cellW = (width - 80) / cols.length;
  const cellH = (height - 20) / rows.length;
  const maxAbs = Math.max(...data.flat().map(Math.abs));
  function cellColor(v: number): string {
    const t = v / (maxAbs || 1);
    if (t > 0.4) return "#10b981";
    if (t > 0.1) return "#84cc16";
    if (t > -0.1) return "#6b7280";
    if (t > -0.4) return "#f59e0b";
    return "#ef4444";
  }
  return (
    <svg width={width} height={height}>
      {cols.map((c, j) => (
        <text key={j} x={80 + j * cellW + cellW / 2} y={14} textAnchor="middle" fontSize={9} fill="#6b7280">
          {c}
        </text>
      ))}
      {rows.map((r, i) =>
        cols.map((_, j) => {
          const v = data[i]?.[j] ?? 0;
          return (
            <g key={`${i}-${j}`}>
              {j === 0 && (
                <text x={76} y={20 + i * cellH + cellH / 2 + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                  {r}
                </text>
              )}
              <rect x={80 + j * cellW + 1} y={20 + i * cellH + 1} width={cellW - 2} height={cellH - 2} rx={2} fill={cellColor(v)} opacity={0.75} />
              <text x={80 + j * cellW + cellW / 2} y={20 + i * cellH + cellH / 2 + 4} textAnchor="middle" fontSize={9} fill="#fff">
                {v > 0 ? "+" : ""}{v.toFixed(1)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ── Yield Curve Line Chart ─────────────────────────────────────────────────────
function YieldCurveChart({
  spreads,
  width = 480,
  height = 120,
}: {
  spreads: number[];
  width?: number;
  height?: number;
}) {
  const n = spreads.length;
  const min = Math.min(...spreads);
  const max = Math.max(...spreads);
  const range = max - min || 1;
  const padL = 36;
  const padR = 8;
  const padT = 8;
  const padB = 20;
  const W = width - padL - padR;
  const H = height - padT - padB;

  const toXY = (i: number, v: number) => ({
    x: padL + (i / (n - 1)) * W,
    y: padT + H - ((v - min) / range) * H,
  });

  const pts = spreads.map((v, i) => toXY(i, v));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  // Zero line
  const zeroY = padT + H - ((0 - min) / range) * H;

  // Fill inversion areas (below zero)
  const invSegments: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (spreads[i] < 0 || spreads[i + 1] < 0) {
      const x1 = a.x;
      const x2 = b.x;
      const y1 = Math.min(a.y, padT + H);
      const y2 = Math.min(b.y, padT + H);
      invSegments.push(`M${x1},${zeroY} L${x1},${y1} L${x2},${y2} L${x2},${zeroY} Z`);
    }
  }

  return (
    <svg width={width} height={height}>
      <line x1={padL} x2={padL + W} y1={zeroY} y2={zeroY} stroke="#ef444440" strokeWidth={1} strokeDasharray="4,2" />
      <text x={padL - 4} y={zeroY + 4} textAnchor="end" fontSize={8} fill="#ef4444">0</text>
      {invSegments.map((d, i) => <path key={i} d={d} fill="#ef444420" />)}
      <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeLinejoin="round" />
      {[-2, -1, 0, 1, 2].map((tick, i) => {
        if (tick < min - 0.1 || tick > max + 0.1) return null;
        const y = padT + H - ((tick - min) / range) * H;
        return (
          <g key={i}>
            <line x1={padL - 3} x2={padL} y1={y} y2={y} stroke="#ffffff30" strokeWidth={1} />
            <text x={padL - 5} y={y + 4} textAnchor="end" fontSize={8} fill="#6b7280">{tick}</text>
          </g>
        );
      })}
      <text x={padL + W / 2} y={height - 2} textAnchor="middle" fontSize={9} fill="#6b7280">
        2Y-10Y Spread (%)
      </text>
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type TrafficLight = "green" | "yellow" | "red";
type Trend = "up" | "stable" | "down";

interface EconIndicator {
  name: string;
  value: string;
  prev: string;
  unit: string;
  traffic: TrafficLight;
  trend: Trend;
  weight: number;
  sparkValues: number[];
  score: number; // 0-100
}

interface FedMeeting {
  date: string;
  hikePct: number;
  holdPct: number;
  cutPct: number;
}

interface Country {
  name: string;
  flag: string;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  debtGdp: number;
  currentAccount: number;
}

interface RecessionIndicator {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  triggered: boolean;
  desc: string;
}

interface GicsSector {
  name: string;
  color: string;
  revenueGrowth: number;
  margin: number;
  capex: number;
  empGrowth: number;
  igPct: number;
  ism: number;
  revisions: number;
}

// ── Data Generation ───────────────────────────────────────────────────────────
function generateData() {
  resetSeed(42);

  // Tab 1: US Indicators
  const indicators: EconIndicator[] = [
    { name: "GDP Growth", unit: "% QoQ ann.", weight: 0.15 },
    { name: "CPI", unit: "% YoY", weight: 0.12 },
    { name: "PCE", unit: "% YoY", weight: 0.10 },
    { name: "Core PCE", unit: "% YoY", weight: 0.12 },
    { name: "PPI", unit: "% YoY", weight: 0.07 },
    { name: "Unemployment U3", unit: "%", weight: 0.10 },
    { name: "Unemployment U6", unit: "%", weight: 0.06 },
    { name: "NFP", unit: "K jobs", weight: 0.08 },
    { name: "Consumer Conf.", unit: "Index", weight: 0.05 },
    { name: "ISM Mfg", unit: "Index", weight: 0.05 },
    { name: "ISM Services", unit: "Index", weight: 0.05 },
    { name: "Retail Sales", unit: "% MoM", weight: 0.05 },
  ].map((ind) => {
    const sparkValues = Array.from({ length: 12 }, () => randBetween(0.5, 5));
    const lastVal = sparkValues[sparkValues.length - 1];
    const prevVal = sparkValues[sparkValues.length - 2];

    let value: string;
    let traffic: TrafficLight;
    let score: number;
    const v = randBetween(-0.5, 4);

    if (ind.name === "GDP Growth") {
      value = (2.1 + v * 0.4).toFixed(1);
      traffic = parseFloat(value) > 2.5 ? "green" : parseFloat(value) > 1 ? "yellow" : "red";
      score = parseFloat(value) > 2.5 ? 75 + randBetween(0, 20) : parseFloat(value) > 1 ? 40 + randBetween(0, 30) : randBetween(10, 40);
    } else if (ind.name.includes("CPI") || ind.name.includes("PCE") || ind.name.includes("PPI")) {
      value = (3.2 + v * 0.5).toFixed(1);
      traffic = parseFloat(value) < 2.5 ? "green" : parseFloat(value) < 4 ? "yellow" : "red";
      score = parseFloat(value) < 2.5 ? 75 + randBetween(0, 20) : parseFloat(value) < 4 ? 40 + randBetween(0, 30) : randBetween(10, 35);
    } else if (ind.name.includes("Unemployment")) {
      value = (4.1 + v * 0.3).toFixed(1);
      traffic = parseFloat(value) < 4.5 ? "green" : parseFloat(value) < 5.5 ? "yellow" : "red";
      score = parseFloat(value) < 4.5 ? 70 + randBetween(0, 25) : parseFloat(value) < 5.5 ? 40 + randBetween(0, 30) : randBetween(10, 40);
    } else if (ind.name === "NFP") {
      const nfp = Math.round(180 + v * 40);
      value = nfp.toString();
      traffic = nfp > 200 ? "green" : nfp > 100 ? "yellow" : "red";
      score = nfp > 200 ? 70 + randBetween(0, 25) : nfp > 100 ? 40 + randBetween(0, 30) : randBetween(10, 40);
    } else if (ind.name.includes("ISM")) {
      value = (52 + v * 3).toFixed(1);
      traffic = parseFloat(value) > 52 ? "green" : parseFloat(value) > 48 ? "yellow" : "red";
      score = parseFloat(value) > 52 ? 70 + randBetween(0, 25) : parseFloat(value) > 48 ? 40 + randBetween(0, 30) : randBetween(10, 40);
    } else if (ind.name === "Consumer Conf.") {
      value = (102 + v * 8).toFixed(0);
      traffic = parseFloat(value) > 100 ? "green" : parseFloat(value) > 85 ? "yellow" : "red";
      score = parseFloat(value) > 100 ? 70 + randBetween(0, 25) : parseFloat(value) > 85 ? 40 + randBetween(0, 30) : randBetween(10, 40);
    } else {
      value = (0.4 + v * 0.3).toFixed(1);
      traffic = parseFloat(value) > 0.3 ? "green" : parseFloat(value) > 0 ? "yellow" : "red";
      score = parseFloat(value) > 0.3 ? 70 + randBetween(0, 25) : parseFloat(value) > 0 ? 40 + randBetween(0, 30) : randBetween(10, 40);
    }

    const trend: Trend = lastVal > prevVal * 1.02 ? "up" : lastVal < prevVal * 0.98 ? "down" : "stable";

    return {
      ...ind,
      value,
      prev: (parseFloat(value) - randBetween(-0.3, 0.3)).toFixed(1),
      traffic,
      trend,
      sparkValues,
      score,
    } as EconIndicator;
  });

  // Tab 2: Fed Watch
  const fedMeetings: FedMeeting[] = [
    { date: "Jan 29, 2026", hikePct: 2, holdPct: 85, cutPct: 13 },
    { date: "Mar 19, 2026", hikePct: 3, holdPct: 68, cutPct: 29 },
    { date: "May 7, 2026", hikePct: 4, holdPct: 52, cutPct: 44 },
    { date: "Jun 18, 2026", hikePct: 5, holdPct: 41, cutPct: 54 },
    { date: "Jul 30, 2026", hikePct: 6, holdPct: 38, cutPct: 56 },
    { date: "Sep 17, 2026", hikePct: 6, holdPct: 35, cutPct: 59 },
    { date: "Nov 5, 2026", hikePct: 7, holdPct: 32, cutPct: 61 },
    { date: "Dec 17, 2026", hikePct: 8, holdPct: 29, cutPct: 63 },
  ];

  const balanceSheetSeries = (() => {
    const months = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(2024, 2 + i, 1);
      return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear().toString().slice(2)}`;
    });
    resetSeed(77);
    const treasuries = Array.from({ length: 24 }, (_, i) => 4800 - i * 18 + randBetween(-50, 50));
    const mbs = Array.from({ length: 24 }, (_, i) => 2300 - i * 12 + randBetween(-30, 30));
    const other = Array.from({ length: 24 }, () => randBetween(400, 600));
    return {
      series: [
        { label: "Treasuries", color: "#6366f1", values: treasuries },
        { label: "MBS", color: "#10b981", values: mbs },
        { label: "Other", color: "#f59e0b", values: other },
      ],
      labels: months,
    };
  })();

  const fedSpeak = [
    { name: "Powell (Chair)", date: "Mar 20", score: 42, sentiment: "Neutral" },
    { name: "Waller", date: "Mar 18", score: 68, sentiment: "Hawkish" },
    { name: "Daly", date: "Mar 15", score: 31, sentiment: "Dovish" },
    { name: "Barkin", date: "Mar 12", score: 55, sentiment: "Neutral" },
    { name: "Williams", date: "Mar 10", score: 44, sentiment: "Neutral" },
  ];

  // Tab 3: Global
  const countries: Country[] = [
    { name: "United States", flag: "🇺🇸", gdpGrowth: 2.4, inflation: 3.1, unemployment: 4.1, debtGdp: 128, currentAccount: -3.2 },
    { name: "Euro Area", flag: "🇪🇺", gdpGrowth: 0.8, inflation: 2.6, unemployment: 6.1, debtGdp: 92, currentAccount: 2.1 },
    { name: "China", flag: "🇨🇳", gdpGrowth: 4.8, inflation: 0.5, unemployment: 5.2, debtGdp: 78, currentAccount: 1.8 },
    { name: "Japan", flag: "🇯🇵", gdpGrowth: 0.9, inflation: 2.9, unemployment: 2.5, debtGdp: 264, currentAccount: 3.4 },
    { name: "Germany", flag: "🇩🇪", gdpGrowth: -0.2, inflation: 2.2, unemployment: 5.8, debtGdp: 66, currentAccount: 5.1 },
    { name: "UK", flag: "🇬🇧", gdpGrowth: 0.5, inflation: 3.4, unemployment: 4.4, debtGdp: 102, currentAccount: -3.8 },
    { name: "Canada", flag: "🇨🇦", gdpGrowth: 1.1, inflation: 2.8, unemployment: 6.7, debtGdp: 107, currentAccount: -0.9 },
    { name: "Australia", flag: "🇦🇺", gdpGrowth: 1.6, inflation: 3.2, unemployment: 4.1, debtGdp: 54, currentAccount: -1.2 },
    { name: "Brazil", flag: "🇧🇷", gdpGrowth: 2.2, inflation: 5.1, unemployment: 7.8, debtGdp: 89, currentAccount: -1.9 },
    { name: "India", flag: "🇮🇳", gdpGrowth: 6.8, inflation: 4.8, unemployment: 8.1, debtGdp: 84, currentAccount: -1.1 },
    { name: "Mexico", flag: "🇲🇽", gdpGrowth: 1.8, inflation: 4.4, unemployment: 2.8, debtGdp: 52, currentAccount: -1.4 },
    { name: "South Korea", flag: "🇰🇷", gdpGrowth: 2.1, inflation: 2.3, unemployment: 2.9, debtGdp: 54, currentAccount: 3.2 },
  ];

  const surpriseIndex = [
    { region: "US", value: 12.4 },
    { region: "EU", value: -8.2 },
    { region: "China", value: 3.1 },
    { region: "EM", value: -4.8 },
  ];

  const capitalFlowData: number[][] = [
    [12, -3, 8, 15],
    [-5, 2, -8, 6],
    [18, 7, 22, 11],
    [-2, -9, 4, -6],
  ];

  // Tab 4: Recession
  resetSeed(99);
  const yieldCurveSpreads = Array.from({ length: 60 }, (_, i) => {
    let base = -1.5 + (i / 20);
    base += Math.sin(i / 8) * 0.4;
    base += randBetween(-0.15, 0.15);
    return parseFloat(Math.max(-2.2, Math.min(2.8, base)).toFixed(2));
  });

  const recessionIndicators: RecessionIndicator[] = [
    { name: "2Y-10Y Spread", value: -0.18, threshold: 0, unit: "%", triggered: true, desc: "Inverted yield curve — historically predates recessions by 12–18 months" },
    { name: "IG Credit Spread", value: 142, threshold: 200, unit: "bps", triggered: false, desc: "Investment grade spreads elevated but below stress threshold" },
    { name: "HY Credit Spread", value: 385, threshold: 500, unit: "bps", triggered: false, desc: "High yield spreads widening, watch for acceleration above 500" },
    { name: "ISM New Orders", value: 46.8, threshold: 50, unit: "Index", triggered: true, desc: "Below 50 signals manufacturing contraction; leading indicator" },
    { name: "LEI Index YoY", value: -4.2, threshold: -3.5, unit: "%", triggered: true, desc: "Conference Board LEI declining 6 consecutive months" },
    { name: "Sahm Rule", value: 0.38, threshold: 0.5, unit: "pp", triggered: false, desc: "Unemployment rise of 0.38pp from 12-month low — near threshold" },
  ];

  // Tab 5: Sectors
  resetSeed(55);
  const sectorData: GicsSector[] = [
    { name: "Technology", color: "#6366f1", revenueGrowth: 14.2, margin: 28.5, capex: 18.1, empGrowth: 3.2, igPct: 82, ism: 54.2, revisions: 12 },
    { name: "Healthcare", color: "#10b981", revenueGrowth: 8.1, margin: 22.4, capex: 9.2, empGrowth: 2.8, igPct: 91, ism: 51.8, revisions: 6 },
    { name: "Financials", color: "#3b82f6", revenueGrowth: 6.4, margin: 31.2, capex: 4.1, empGrowth: 0.8, igPct: 88, ism: 52.1, revisions: 4 },
    { name: "Cons. Disc.", color: "#f59e0b", revenueGrowth: 5.8, margin: 12.1, capex: 8.4, empGrowth: 1.2, igPct: 68, ism: 49.4, revisions: -3 },
    { name: "Cons. Staples", color: "#84cc16", revenueGrowth: 3.2, margin: 18.6, capex: 5.2, empGrowth: 0.4, igPct: 85, ism: 50.8, revisions: 2 },
    { name: "Industrials", color: "#8b5cf6", revenueGrowth: 7.4, margin: 14.8, capex: 12.4, empGrowth: 1.8, igPct: 78, ism: 50.2, revisions: 3 },
    { name: "Energy", color: "#ef4444", revenueGrowth: -2.1, margin: 22.1, capex: 24.1, empGrowth: 2.4, igPct: 62, ism: 48.8, revisions: -8 },
    { name: "Materials", color: "#14b8a6", revenueGrowth: 1.4, margin: 16.2, capex: 11.8, empGrowth: 0.2, igPct: 74, ism: 47.4, revisions: -2 },
    { name: "Real Estate", color: "#f97316", revenueGrowth: 4.8, margin: 28.4, capex: 6.8, empGrowth: -0.4, igPct: 58, ism: 49.8, revisions: -5 },
    { name: "Utilities", color: "#06b6d4", revenueGrowth: 2.8, margin: 19.2, capex: 22.4, empGrowth: -0.2, igPct: 88, ism: 51.4, revisions: 1 },
    { name: "Comm. Svcs", color: "#ec4899", revenueGrowth: 9.2, margin: 24.8, capex: 14.2, empGrowth: 1.4, igPct: 72, ism: 52.8, revisions: 7 },
  ];

  // Tab 6: Regime
  const regimeHistory = [
    { period: "Q1 2022", regime: "Reflation", gdpMom: 0.4, inflMom: 0.8 },
    { period: "Q2 2022", regime: "Stagflation", gdpMom: -0.3, inflMom: 0.9 },
    { period: "Q3 2022", regime: "Stagflation", gdpMom: -0.2, inflMom: 0.7 },
    { period: "Q4 2022", regime: "Stagflation", gdpMom: 0.1, inflMom: 0.5 },
    { period: "Q1 2023", regime: "Deflation", gdpMom: 0.2, inflMom: -0.2 },
    { period: "Q2 2023", regime: "Deflation", gdpMom: 0.4, inflMom: -0.4 },
    { period: "Q3 2023", regime: "Goldilocks", gdpMom: 0.6, inflMom: -0.3 },
    { period: "Q4 2023", regime: "Goldilocks", gdpMom: 0.7, inflMom: -0.1 },
    { period: "Q1 2024", regime: "Reflation", gdpMom: 0.5, inflMom: 0.3 },
    { period: "Q2 2024", regime: "Reflation", gdpMom: 0.4, inflMom: 0.2 },
    { period: "Q3 2024", regime: "Goldilocks", gdpMom: 0.5, inflMom: -0.1 },
    { period: "Q4 2024", regime: "Goldilocks", gdpMom: 0.4, inflMom: -0.2 },
    { period: "Q1 2026", regime: "Goldilocks", gdpMom: 0.3, inflMom: -0.1 },
  ];

  const regimeColors: Record<string, string> = {
    Goldilocks: "#10b981",
    Reflation: "#f59e0b",
    Stagflation: "#ef4444",
    Deflation: "#6b7280",
  };

  const assetByRegime: number[][] = [
    [18.4, 8.2, -12.1, 4.8],   // Equities
    [-5.2, -2.1, 8.4, 12.1],   // Bonds
    [6.8, 14.2, 22.1, -8.4],   // Commodities
    [4.2, 8.1, 12.4, 6.8],     // Gold
    [22.1, 18.4, -18.2, -4.8], // Growth
    [-8.2, 12.4, 4.8, 16.2],   // Value
    [14.8, 6.2, -4.8, 2.1],    // Credit
    [2.8, 4.8, 18.4, 8.4],     // USD
  ];

  return {
    indicators,
    fedMeetings,
    balanceSheetSeries,
    fedSpeak,
    countries,
    surpriseIndex,
    capitalFlowData,
    yieldCurveSpreads,
    recessionIndicators,
    sectorData,
    regimeHistory,
    regimeColors,
    assetByRegime,
  };
}

// ── Helper Components ─────────────────────────────────────────────────────────
function TrafficDot({ status }: { status: TrafficLight }) {
  const colors = { green: "bg-emerald-500", yellow: "bg-amber-400", red: "bg-red-500" };
  return <span className={cn("inline-block w-2 h-2 rounded-full", colors[status])} />;
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 65 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="w-full bg-foreground/5 rounded-full h-1 mt-1">
      <div className="h-1 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  );
}

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("bg-foreground/[0.03] border border-border rounded-xl p-4", className)}
    >
      <h3 className="text-xs font-semibold text-muted-foreground mb-3">{title}</h3>
      {children}
    </motion.div>
  );
}

// ── Tab 1: US Economic Dashboard ──────────────────────────────────────────────
function USDashboard({ data }: { data: ReturnType<typeof generateData> }) {
  const { indicators } = data;

  const compositeScore = useMemo(() => {
    const totalWeight = indicators.reduce((a, b) => a + b.weight, 0);
    const weighted = indicators.reduce((a, b) => a + b.score * b.weight, 0);
    return Math.round(weighted / totalWeight);
  }, [indicators]);

  const scoreColor = compositeScore >= 65 ? "text-emerald-400" : compositeScore >= 40 ? "text-amber-400" : "text-red-400";
  const scoreLabel = compositeScore >= 65 ? "Expansion" : compositeScore >= 40 ? "Mixed" : "Contraction";

  return (
    <div className="space-y-4">
      {/* Composite Score */}
      <SectionCard title="Economic Composite Score">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className={cn("text-2xl font-bold", scoreColor)}>{compositeScore}</div>
            <div className="text-xs text-muted-foreground mt-1">out of 100</div>
          </div>
          <div className="flex-1">
            <div className={cn("text-lg font-semibold", scoreColor)}>{scoreLabel}</div>
            <div className="w-full bg-foreground/5 rounded-full h-3 mt-2">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${compositeScore}%`,
                  background: compositeScore >= 65 ? "linear-gradient(90deg,#059669,#10b981)" : compositeScore >= 40 ? "linear-gradient(90deg,#d97706,#f59e0b)" : "linear-gradient(90deg,#dc2626,#ef4444)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Contraction</span>
              <span>Mixed</span>
              <span>Expansion</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {(["green", "yellow", "red"] as TrafficLight[]).map((t) => {
              const count = indicators.filter((i) => i.traffic === t).length;
              return (
                <div key={t} className="text-center">
                  <div className={cn("text-xl font-bold", t === "green" ? "text-emerald-400" : t === "yellow" ? "text-amber-400" : "text-red-400")}>{count}</div>
                  <div className="text-muted-foreground capitalize">{t}</div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Indicators Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {indicators.map((ind, i) => (
          <motion.div
            key={ind.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="bg-foreground/[0.03] border border-border rounded-lg p-3 hover:border-border transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground truncate">{ind.name}</span>
              <TrafficDot status={ind.traffic} />
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-xl font-semibold text-white">{ind.value}</span>
              <span className="text-xs text-muted-foreground mb-0.5">{ind.unit}</span>
              <div className="ml-auto"><TrendIcon trend={ind.trend} /></div>
            </div>
            <div className="flex items-center justify-between">
              <Sparkline
                values={ind.sparkValues}
                color={ind.traffic === "green" ? "#10b981" : ind.traffic === "yellow" ? "#f59e0b" : "#ef4444"}
              />
            </div>
            <ScoreBar score={ind.score} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Fed Watch ──────────────────────────────────────────────────────────
function FedWatch({ data }: { data: ReturnType<typeof generateData> }) {
  const { fedMeetings, balanceSheetSeries, fedSpeak } = data;
  const currentRate = 4.375;
  const neutralRate = 2.5;
  const taylorRate = 5.14;
  const hawks = 5;
  const doves = 4;
  const neutral = 3;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rates Panel */}
        <SectionCard title="Policy Rates">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Fed Funds (Target)</span>
              <span className="text-lg font-bold text-white">{currentRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Neutral Rate (r*)</span>
              <span className="text-lg font-bold text-emerald-400">{neutralRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Taylor Rule Rate</span>
              <span className="text-lg font-bold text-amber-400">{taylorRate}%</span>
            </div>
            <div className="mt-3 p-2 bg-foreground/5 rounded-lg text-xs text-muted-foreground">
              <div className="font-semibold text-muted-foreground mb-1">Taylor Rule Formula</div>
              <code className="text-indigo-300">r* + π + 0.5(π-2%) + 0.5(GDP gap)</code>
              <div className="mt-1">= 2.5 + 3.1 + 0.5(1.1) + 0.5(-0.6) = {taylorRate}%</div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Current rate is <span className={currentRate > taylorRate ? "text-amber-400" : "text-emerald-400"}>{currentRate > taylorRate ? "above" : "below"}</span> Taylor rule by {Math.abs(currentRate - taylorRate).toFixed(2)}pp
            </div>
          </div>
        </SectionCard>

        {/* FOMC Voter Composition */}
        <SectionCard title="FOMC Voter Composition">
          <div className="space-y-2">
            {[{ label: "Hawks", count: hawks, color: "#ef4444" }, { label: "Neutral", count: neutral, color: "#6b7280" }, { label: "Doves", count: doves, color: "#10b981" }].map((v) => (
              <div key={v.label} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">{v.label}</span>
                <div className="flex-1 bg-foreground/5 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${(v.count / 12) * 100}%`, backgroundColor: v.color }} />
                </div>
                <span className="text-xs font-mono text-white w-4">{v.count}</span>
              </div>
            ))}
            <div className="text-xs text-muted-foreground mt-2">12 total FOMC voters (7 governors + 5 presidents)</div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Hawkish Lean</div>
            <div className="w-full h-3 rounded-full overflow-hidden bg-emerald-900/30 relative">
              <div className="absolute left-0 top-0 h-full bg-red-500/60 rounded-l-full" style={{ width: `${(hawks / 12) * 100}%` }} />
              <div className="absolute right-0 top-0 h-full bg-emerald-500/60 rounded-r-full" style={{ width: `${(doves / 12) * 100}%` }} />
              <div className="absolute left-1/2 top-0 w-px h-full bg-foreground/30" />
            </div>
          </div>
        </SectionCard>

        {/* Fed Speak Tracker */}
        <SectionCard title="Recent Fed Speak">
          <div className="space-y-2">
            {fedSpeak.map((sp, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{sp.name}</div>
                  <div className="text-xs text-muted-foreground">{sp.date}</div>
                </div>
                <div className="text-xs px-2 py-0.5 rounded-full" style={{
                  backgroundColor: sp.score > 55 ? "#ef444420" : sp.score < 40 ? "#10b98120" : "#6b728020",
                  color: sp.score > 55 ? "#f87171" : sp.score < 40 ? "#34d399" : "#9ca3af",
                }}>
                  {sp.sentiment}
                </div>
                <div className="w-12 bg-foreground/5 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${sp.score}%`,
                      backgroundColor: sp.score > 55 ? "#ef4444" : sp.score < 40 ? "#10b981" : "#6b7280",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Meeting Calendar */}
      <SectionCard title="Fed Meeting Calendar — Implied Probabilities">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-1.5 pr-4">Meeting</th>
                <th className="text-right pr-3">Hike</th>
                <th className="text-right pr-3">Hold</th>
                <th className="text-right pr-3">Cut</th>
                <th className="text-left pr-2">Probability Bar</th>
              </tr>
            </thead>
            <tbody>
              {fedMeetings.map((m, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-1.5 pr-4 text-white font-medium">{m.date}</td>
                  <td className="text-right pr-3 text-red-400">{m.hikePct}%</td>
                  <td className="text-right pr-3 text-muted-foreground">{m.holdPct}%</td>
                  <td className="text-right pr-3 text-emerald-400">{m.cutPct}%</td>
                  <td className="pr-2 w-40">
                    <div className="flex h-3 rounded-full overflow-hidden gap-px">
                      <div className="bg-red-500/60" style={{ width: `${m.hikePct}%` }} />
                      <div className="bg-muted/60" style={{ width: `${m.holdPct}%` }} />
                      <div className="bg-emerald-500/60" style={{ width: `${m.cutPct}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Balance Sheet */}
      <SectionCard title="Fed Balance Sheet — Assets (24 Months)">
        <div className="flex items-start gap-4">
          <div className="overflow-x-auto flex-1">
            <AreaChart
              series={balanceSheetSeries.series}
              labels={balanceSheetSeries.labels}
              width={540}
              height={150}
            />
          </div>
          <div className="space-y-1.5 shrink-0">
            {balanceSheetSeries.series.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-muted-foreground">{s.label}</span>
              </div>
            ))}
            <div className="mt-2 text-xs text-muted-foreground">QT pace: ~$60B/month</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 3: Global Comparison ──────────────────────────────────────────────────
function GlobalComparison({ data }: { data: ReturnType<typeof generateData> }) {
  const { countries, surpriseIndex, capitalFlowData } = data;
  const [sortBy, setSortBy] = useState<keyof Country>("gdpGrowth");

  const sorted = useMemo(() => [...countries].sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number)), [countries, sortBy]);

  function cellColor(val: number, metric: string): string {
    if (metric === "gdpGrowth") return val > 3 ? "text-emerald-400" : val > 1.5 ? "text-muted-foreground" : val > 0 ? "text-amber-400" : "text-red-400";
    if (metric === "inflation") return val < 2.5 ? "text-emerald-400" : val < 4 ? "text-amber-400" : "text-red-400";
    if (metric === "unemployment") return val < 4 ? "text-emerald-400" : val < 6 ? "text-muted-foreground" : val < 8 ? "text-amber-400" : "text-red-400";
    if (metric === "debtGdp") return val < 60 ? "text-emerald-400" : val < 100 ? "text-amber-400" : "text-red-400";
    if (metric === "currentAccount") return val > 2 ? "text-emerald-400" : val > -1 ? "text-muted-foreground" : "text-red-400";
    return "text-muted-foreground";
  }

  const regionalBars = [
    { label: "US", value: 2.4, color: "#6366f1" },
    { label: "EU", value: 0.8, color: "#3b82f6" },
    { label: "China", value: 4.8, color: "#ef4444" },
    { label: "EM", value: 4.2, color: "#10b981" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Regional Bar Chart */}
        <SectionCard title="Regional GDP Growth (%)" className="lg:col-span-1">
          <BarChart bars={regionalBars} width={240} height={140} />
        </SectionCard>

        {/* Surprise Index */}
        <SectionCard title="Economic Surprise Index" className="lg:col-span-1">
          <BarChart
            bars={surpriseIndex.map((s) => ({ label: s.region, value: s.value, color: s.value > 0 ? "#10b981" : "#ef4444" }))}
            width={240}
            height={140}
          />
          <div className="text-xs text-muted-foreground mt-2">Positive = data beating consensus expectations</div>
        </SectionCard>

        {/* Capital Flow Heatmap */}
        <SectionCard title="Capital Flow Heatmap" className="lg:col-span-1">
          <HeatMatrix
            rows={["Equities", "Bonds", "EM", "Commodities"]}
            cols={["US", "EU", "EM", "APAC"]}
            data={capitalFlowData}
            width={280}
            height={120}
          />
          <div className="text-xs text-muted-foreground mt-2">$ billions, 4-week flows</div>
        </SectionCard>
      </div>

      {/* Country Table */}
      <SectionCard title="Global Macro Comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-1.5 w-32">Country</th>
                {[
                  { key: "gdpGrowth", label: "GDP %" },
                  { key: "inflation", label: "CPI %" },
                  { key: "unemployment", label: "Unemp %" },
                  { key: "debtGdp", label: "Debt/GDP" },
                  { key: "currentAccount", label: "CA/GDP" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={cn("text-right py-1.5 pr-4 cursor-pointer hover:text-muted-foreground transition-colors", sortBy === col.key && "text-indigo-400")}
                    onClick={() => setSortBy(col.key as keyof Country)}
                  >
                    {col.label} {sortBy === col.key && "▼"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <motion.tr
                  key={c.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-1.5 text-white">
                    {c.flag} {c.name}
                  </td>
                  <td className={cn("text-right pr-4 font-mono", cellColor(c.gdpGrowth, "gdpGrowth"))}>{c.gdpGrowth > 0 ? "+" : ""}{c.gdpGrowth.toFixed(1)}%</td>
                  <td className={cn("text-right pr-4 font-mono", cellColor(c.inflation, "inflation"))}>{c.inflation.toFixed(1)}%</td>
                  <td className={cn("text-right pr-4 font-mono", cellColor(c.unemployment, "unemployment"))}>{c.unemployment.toFixed(1)}%</td>
                  <td className={cn("text-right pr-4 font-mono", cellColor(c.debtGdp, "debtGdp"))}>{c.debtGdp}%</td>
                  <td className={cn("text-right pr-4 font-mono", cellColor(c.currentAccount, "currentAccount"))}>{c.currentAccount > 0 ? "+" : ""}{c.currentAccount.toFixed(1)}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="text-emerald-400">■</span> Best quartile</span>
          <span className="flex items-center gap-1"><span className="text-amber-400">■</span> Middle</span>
          <span className="flex items-center gap-1"><span className="text-red-400">■</span> Worst quartile</span>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 4: Recession Indicators ───────────────────────────────────────────────
function RecessionTab({ data }: { data: ReturnType<typeof generateData> }) {
  const { yieldCurveSpreads, recessionIndicators } = data;

  const triggered = recessionIndicators.filter((r) => r.triggered).length;
  const riskScore = Math.round((triggered / recessionIndicators.length) * 100);
  const consensusProb = 28;

  return (
    <div className="space-y-4">
      {/* Probability Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Recession Probability (12 Month)">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-24 h-24">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff10" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={riskScore >= 50 ? "#ef4444" : riskScore >= 33 ? "#f59e0b" : "#10b981"}
                  strokeWidth="10"
                  strokeDasharray={`${(consensusProb / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-bold", consensusProb >= 50 ? "text-red-400" : consensusProb >= 33 ? "text-amber-400" : "text-emerald-400")}>{consensusProb}%</span>
                <span className="text-xs text-muted-foreground">consensus</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-amber-400">Elevated Risk</div>
              <div className="text-xs text-muted-foreground">{triggered} of {recessionIndicators.length} indicators triggered</div>
              <div className="text-xs text-muted-foreground">Yield curve inversion ongoing</div>
              <div className="text-xs text-muted-foreground">LEI declining 6 consecutive months</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Signal Scorecard" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-2">
            {recessionIndicators.map((ri, i) => (
              <div key={i} className={cn("p-2 rounded-lg border text-xs", ri.triggered ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5")}>
                <div className="flex items-center gap-1 mb-0.5">
                  {ri.triggered ? <AlertTriangle className="w-3 h-3 text-red-400" /> : <Activity className="w-3 h-3 text-emerald-400" />}
                  <span className={cn("font-medium", ri.triggered ? "text-red-300" : "text-emerald-300")}>{ri.name}</span>
                </div>
                <div className="font-mono text-white">{ri.value}{ri.unit}</div>
                <div className="text-muted-foreground">Threshold: {ri.threshold}{ri.unit}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Yield Curve Chart */}
      <SectionCard title="2Y-10Y Treasury Spread — Inversion History">
        <div className="overflow-x-auto">
          <YieldCurveChart spreads={yieldCurveSpreads} width={560} height={130} />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-red-500/40 inline-block rounded" /> Inversion periods (below 0)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block" /> 2Y-10Y spread</span>
        </div>
      </SectionCard>

      {/* Indicator Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {recessionIndicators.map((ri, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn("p-3 rounded-lg border text-xs", ri.triggered ? "border-red-500/20 bg-red-500/5" : "border-border bg-foreground/[0.02]")}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">{ri.name}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-xs", ri.triggered ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300")}>
                {ri.triggered ? "TRIGGERED" : "CLEAR"}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-bold text-white">{ri.value}{ri.unit}</span>
              <span className="text-muted-foreground">vs {ri.threshold}{ri.unit} threshold</span>
            </div>
            <div className="text-muted-foreground">{ri.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Sector Data ────────────────────────────────────────────────────────
function SectorDataTab({ data }: { data: ReturnType<typeof generateData> }) {
  const { sectorData } = data;

  const empBars = sectorData.map((s) => ({ label: s.name.slice(0, 6), value: s.empGrowth, color: s.empGrowth > 0 ? s.color : "#ef4444" }));
  const revisionBars = sectorData.map((s) => ({ label: s.name.slice(0, 6), value: s.revisions, color: s.revisions > 0 ? "#10b981" : "#ef4444" }));

  return (
    <div className="space-y-4">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Sector Employment Growth (% YoY)">
          <div className="overflow-x-auto">
            <BarChart bars={empBars} width={400} height={140} />
          </div>
        </SectionCard>
        <SectionCard title="Earnings Revisions (Net Upgrades - Downgrades)">
          <div className="overflow-x-auto">
            <BarChart bars={revisionBars} width={400} height={140} />
          </div>
        </SectionCard>
      </div>

      {/* Sector Table */}
      <SectionCard title="GICS Sector Fundamentals">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-1.5 w-36">Sector</th>
                <th className="text-right pr-4">Rev Growth</th>
                <th className="text-right pr-4">Net Margin</th>
                <th className="text-right pr-4">Capex %</th>
                <th className="text-right pr-4">Emp Growth</th>
                <th className="text-right pr-4">IG %</th>
                <th className="text-right pr-4">ISM Supp.</th>
                <th className="text-right pr-4">Revisions</th>
              </tr>
            </thead>
            <tbody>
              {sectorData.map((s, i) => (
                <motion.tr
                  key={s.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-1.5 text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </td>
                  <td className={cn("text-right pr-4 font-mono", s.revenueGrowth > 8 ? "text-emerald-400" : s.revenueGrowth > 3 ? "text-muted-foreground" : "text-red-400")}>
                    {s.revenueGrowth > 0 ? "+" : ""}{s.revenueGrowth.toFixed(1)}%
                  </td>
                  <td className={cn("text-right pr-4 font-mono", s.margin > 22 ? "text-emerald-400" : s.margin > 15 ? "text-muted-foreground" : "text-amber-400")}>
                    {s.margin.toFixed(1)}%
                  </td>
                  <td className="text-right pr-4 font-mono text-muted-foreground">{s.capex.toFixed(1)}%</td>
                  <td className={cn("text-right pr-4 font-mono", s.empGrowth > 1 ? "text-emerald-400" : s.empGrowth > 0 ? "text-muted-foreground" : "text-red-400")}>
                    {s.empGrowth > 0 ? "+" : ""}{s.empGrowth.toFixed(1)}%
                  </td>
                  <td className={cn("text-right pr-4 font-mono", s.igPct > 80 ? "text-emerald-400" : s.igPct > 65 ? "text-amber-400" : "text-red-400")}>
                    {s.igPct}%
                  </td>
                  <td className={cn("text-right pr-4 font-mono", s.ism > 52 ? "text-emerald-400" : s.ism > 48 ? "text-muted-foreground" : "text-red-400")}>
                    {s.ism.toFixed(1)}
                  </td>
                  <td className={cn("text-right pr-4 font-mono", s.revisions > 0 ? "text-emerald-400" : "text-red-400")}>
                    {s.revisions > 0 ? "+" : ""}{s.revisions}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Credit Quality */}
      <SectionCard title="Sector Credit Quality — IG vs HY Breakdown">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {sectorData.map((s) => (
            <div key={s.name} className="text-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-muted-foreground truncate">{s.name}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500/60" style={{ width: `${s.igPct}%` }} title="IG" />
                <div className="bg-amber-500/60" style={{ width: `${100 - s.igPct}%` }} title="HY" />
              </div>
              <div className="flex justify-between mt-0.5 text-muted-foreground">
                <span>{s.igPct}% IG</span>
                <span>{100 - s.igPct}% HY</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 6: Market Regime Tracker ──────────────────────────────────────────────
function RegimeTracker({ data }: { data: ReturnType<typeof generateData> }) {
  const { regimeHistory, regimeColors, assetByRegime } = data;
  const current = regimeHistory[regimeHistory.length - 1];
  const currentColor = regimeColors[current.regime];

  const regimeAssets = ["Equities", "Bonds", "Commodities", "Gold", "Growth", "Value", "Credit", "USD"];
  const regimeCols = ["Goldilocks", "Reflation", "Stagflation", "Deflation"];

  const leadingSignals = [
    { indicator: "GDP Momentum", signal: "Positive", direction: "up" as Trend },
    { indicator: "Inflation Momentum", signal: "Declining", direction: "down" as Trend },
    { indicator: "Credit Impulse", signal: "Positive", direction: "up" as Trend },
    { indicator: "PMI Trend", signal: "Stable", direction: "stable" as Trend },
    { indicator: "Earnings Revision", signal: "Positive", direction: "up" as Trend },
  ];

  const predictedRegime = "Goldilocks";

  return (
    <div className="space-y-4">
      {/* Current Regime */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Current Regime">
          <div className="flex flex-col items-center gap-3">
            <div
              className="text-2xl font-bold px-4 py-2 rounded-xl"
              style={{ color: currentColor, backgroundColor: currentColor + "20", border: `1px solid ${currentColor}40` }}
            >
              {current.regime}
            </div>
            <QuadrantChart
              point={{ x: current.gdpMom, y: current.inflMom * -1, label: current.regime }}
              width={200}
              height={180}
            />
            <div className="text-xs text-muted-foreground text-center">Growth momentum vs Inflation momentum</div>
          </div>
        </SectionCard>

        {/* Regime History Timeline */}
        <SectionCard title="Regime Transition History" className="lg:col-span-2">
          <div className="space-y-1.5">
            {regimeHistory.map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground w-16 shrink-0">{r.period}</span>
                <div className="flex-1 h-5 rounded flex items-center px-2" style={{ backgroundColor: regimeColors[r.regime] + "20" }}>
                  <span className="font-medium" style={{ color: regimeColors[r.regime] }}>{r.regime}</span>
                </div>
                <span className={cn("w-20 text-right font-mono", r.gdpMom >= 0 ? "text-emerald-400" : "text-red-400")}>
                  GDP {r.gdpMom > 0 ? "+" : ""}{r.gdpMom.toFixed(1)}
                </span>
                <span className={cn("w-24 text-right font-mono", r.inflMom <= 0 ? "text-emerald-400" : "text-amber-400")}>
                  Inf {r.inflMom > 0 ? "+" : ""}{r.inflMom.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Asset Performance by Regime */}
      <SectionCard title="Historical Asset Performance by Regime (Avg Annual %)">
        <div className="overflow-x-auto">
          <HeatMatrix
            rows={regimeAssets}
            cols={regimeCols}
            data={assetByRegime}
            width={440}
            height={200}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="text-emerald-400">■</span> Strong outperformance</span>
          <span className="flex items-center gap-1"><span className="text-amber-400">■</span> Underperformance</span>
          <span className="flex items-center gap-1"><span className="text-red-400">■</span> Strong underperformance</span>
        </div>
      </SectionCard>

      {/* Regime Prediction */}
      <SectionCard title="Next Regime Prediction — Leading Indicators">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            {leadingSignals.map((ls, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <TrendIcon trend={ls.direction} />
                <span className="text-muted-foreground flex-1">{ls.indicator}</span>
                <span className={cn("font-medium", ls.direction === "up" ? "text-emerald-400" : ls.direction === "down" ? "text-red-400" : "text-muted-foreground")}>
                  {ls.signal}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
            <div className="text-xs text-muted-foreground mb-1">Predicted Next Regime</div>
            <div className="text-2xl font-bold text-emerald-400">{predictedRegime}</div>
            <div className="text-xs text-muted-foreground mt-2">Confidence: High (4/5 signals aligned)</div>
            <div className="text-xs text-muted-foreground mt-1">Leading indicators suggest continued growth deceleration with inflation normalizing — consistent with late Goldilocks transition.</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EconDataPage() {
  const data = useMemo(() => generateData(), []);
  const [activeTab, setActiveTab] = useState("us");

  const tabs = [
    { id: "us", label: "US Dashboard", icon: Activity },
    { id: "fed", label: "Fed Watch", icon: RefreshCw },
    { id: "global", label: "Global", icon: Globe },
    { id: "recession", label: "Recession", icon: AlertTriangle },
    { id: "sectors", label: "Sectors", icon: BarChart2 },
    { id: "regime", label: "Regime", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Economic Data</h1>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Macro indicators, Fed policy, global comparisons, and recession signals</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-foreground/[0.04] border border-border rounded-xl p-1 mb-6 flex flex-wrap gap-1 h-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground data-[state=active]:bg-foreground/10 data-[state=active]:text-white transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="us" className="data-[state=inactive]:hidden">
              <USDashboard data={data} />
            </TabsContent>
            <TabsContent value="fed" className="data-[state=inactive]:hidden">
              <FedWatch data={data} />
            </TabsContent>
            <TabsContent value="global" className="data-[state=inactive]:hidden">
              <GlobalComparison data={data} />
            </TabsContent>
            <TabsContent value="recession" className="data-[state=inactive]:hidden">
              <RecessionTab data={data} />
            </TabsContent>
            <TabsContent value="sectors" className="data-[state=inactive]:hidden">
              <SectorDataTab data={data} />
            </TabsContent>
            <TabsContent value="regime" className="data-[state=inactive]:hidden">
              <RegimeTracker data={data} />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
