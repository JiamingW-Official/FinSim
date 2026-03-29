"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpDown,
  Target,
  Layers,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 742006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function randBetween(lo: number, hi: number): number {
  return lo + rand() * (hi - lo);
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface CurvePoint {
  tenor: string;
  years: number;
  yield: number;
  dv01: number;
}

interface SpreadRecord {
  rating: string;
  sector: string;
  oas: number;
  history1y: number;
  history3y: number;
  zScore: number;
  signal: "cheap" | "rich" | "fair";
}

interface CrossMarketRow {
  instrument: string;
  type: string;
  yield: number;
  teyAdjusted: number | null;
  spreadVsTsy: number;
  otrOtsPremium: number | null;
  signal: "buy" | "sell" | "neutral";
}

interface SectorSpread {
  sector: string;
  currentSpread: number;
  sixMonthAvg: number;
  leverage: number;
  spreadPerTurnLev: number;
  signal: "cheap" | "rich" | "fair";
}

interface CarryRollPoint {
  tenor: string;
  years: number;
  yield: number;
  carryBps: number;
  rollBps: number;
  totalReturnBps: number;
}

// ── Seed-generated data ────────────────────────────────────────────────────────

const CURVE_POINTS: CurvePoint[] = [
  { tenor: "3M", years: 0.25, yield: 5.32, dv01: 250 },
  { tenor: "6M", years: 0.5, yield: 5.28, dv01: 497 },
  { tenor: "1Y", years: 1, yield: 5.01, dv01: 985 },
  { tenor: "2Y", years: 2, yield: 4.72, dv01: 1940 },
  { tenor: "3Y", years: 3, yield: 4.52, dv01: 2860 },
  { tenor: "5Y", years: 5, yield: 4.38, dv01: 4620 },
  { tenor: "7Y", years: 7, yield: 4.41, dv01: 6310 },
  { tenor: "10Y", years: 10, yield: 4.48, dv01: 8750 },
  { tenor: "20Y", years: 20, yield: 4.71, dv01: 15800 },
  { tenor: "30Y", years: 30, yield: 4.62, dv01: 20300 },
].map((p) => ({ ...p, yield: p.yield + (rand() - 0.5) * 0.04 }));

// Butterfly: 2Y short wing, 5Y belly, 10Y long wing
const BUTTERFLY_CONFIG = {
  shortWingTenor: "2Y",
  bellyTenor: "5Y",
  longWingTenor: "10Y",
  shortWingYield: CURVE_POINTS[3].yield,
  bellyYield: CURVE_POINTS[5].yield,
  longWingYield: CURVE_POINTS[7].yield,
};

const SPREAD_RECORDS: SpreadRecord[] = [
  { rating: "AAA", sector: "Financials", oas: 48, history1y: 42, history3y: 55, zScore: 0.0, signal: "fair" },
  { rating: "AA", sector: "Industrials", oas: 72, history1y: 68, history3y: 80, zScore: 0.0, signal: "fair" },
  { rating: "A", sector: "Utilities", oas: 105, history1y: 98, history3y: 118, zScore: 0.0, signal: "fair" },
  { rating: "BBB", sector: "TMT", oas: 152, history1y: 140, history3y: 170, zScore: 0.0, signal: "fair" },
  { rating: "BB", sector: "Financials", oas: 285, history1y: 310, history3y: 380, zScore: 0.0, signal: "fair" },
  { rating: "B", sector: "Energy", oas: 430, history1y: 420, history3y: 510, zScore: 0.0, signal: "fair" },
  { rating: "CCC", sector: "Retail", oas: 890, history1y: 960, history3y: 1120, zScore: 0.0, signal: "fair" },
].map((r) => {
  const noise = (rand() - 0.5) * 8;
  const oas = r.oas + noise;
  const sigma = (r.history3y - r.history1y) * 0.35;
  const mean = (r.history1y + r.history3y) / 2;
  const z = sigma > 0 ? (oas - mean) / sigma : 0;
  const signal: SpreadRecord["signal"] = z > 0.5 ? "cheap" : z < -0.5 ? "rich" : "fair";
  return { ...r, oas: Math.round(oas), zScore: Math.round(z * 100) / 100, signal };
});

const CROSS_MARKET: CrossMarketRow[] = [
  {
    instrument: "2Y Treasury (OTR)",
    type: "Treasury",
    yield: CURVE_POINTS[3].yield,
    teyAdjusted: null,
    spreadVsTsy: 0,
    otrOtsPremium: null,
    signal: "neutral",
  },
  {
    instrument: "2Y Treasury (OTS)",
    type: "Treasury",
    yield: CURVE_POINTS[3].yield - 0.018,
    teyAdjusted: null,
    spreadVsTsy: 0,
    otrOtsPremium: 1.8,
    signal: "neutral",
  },
  {
    instrument: "2Y FNMA Agency",
    type: "Agency",
    yield: CURVE_POINTS[3].yield + 0.26,
    teyAdjusted: null,
    spreadVsTsy: 26,
    otrOtsPremium: null,
    signal: "buy",
  },
  {
    instrument: "5Y Treasury (OTR)",
    type: "Treasury",
    yield: CURVE_POINTS[5].yield,
    teyAdjusted: null,
    spreadVsTsy: 0,
    otrOtsPremium: null,
    signal: "neutral",
  },
  {
    instrument: "5Y FHLB Agency",
    type: "Agency",
    yield: CURVE_POINTS[5].yield + 0.31,
    teyAdjusted: null,
    spreadVsTsy: 31,
    otrOtsPremium: null,
    signal: "buy",
  },
  {
    instrument: "5Y AA Muni",
    type: "Muni",
    yield: CURVE_POINTS[5].yield * 0.72,
    teyAdjusted: (CURVE_POINTS[5].yield * 0.72) / (1 - 0.37),
    spreadVsTsy: Math.round(((CURVE_POINTS[5].yield * 0.72) / (1 - 0.37) - CURVE_POINTS[5].yield) * 100),
    otrOtsPremium: null,
    signal: "buy",
  },
  {
    instrument: "10Y Treasury (OTR)",
    type: "Treasury",
    yield: CURVE_POINTS[7].yield,
    teyAdjusted: null,
    spreadVsTsy: 0,
    otrOtsPremium: null,
    signal: "neutral",
  },
  {
    instrument: "10Y TIPS Breakeven",
    type: "TIPS",
    yield: CURVE_POINTS[7].yield - 2.28,
    teyAdjusted: null,
    spreadVsTsy: -228,
    otrOtsPremium: null,
    signal: "neutral",
  },
  {
    instrument: "10Y AA Muni",
    type: "Muni",
    yield: CURVE_POINTS[7].yield * 0.68,
    teyAdjusted: (CURVE_POINTS[7].yield * 0.68) / (1 - 0.37),
    spreadVsTsy: Math.round(((CURVE_POINTS[7].yield * 0.68) / (1 - 0.37) - CURVE_POINTS[7].yield) * 100),
    otrOtsPremium: null,
    signal: "buy",
  },
];

const SECTOR_SPREADS: SectorSpread[] = (
  [
    { sector: "Financials", currentSpread: 112, sixMonthAvg: 125, leverage: 2.1, spreadPerTurnLev: 0, signal: "rich" as const },
    { sector: "Industrials", currentSpread: 138, sixMonthAvg: 132, leverage: 3.4, spreadPerTurnLev: 0, signal: "fair" as const },
    { sector: "Utilities", currentSpread: 97, sixMonthAvg: 102, leverage: 4.2, spreadPerTurnLev: 0, signal: "fair" as const },
    { sector: "TMT", currentSpread: 162, sixMonthAvg: 148, leverage: 2.8, spreadPerTurnLev: 0, signal: "cheap" as const },
    { sector: "Energy", currentSpread: 188, sixMonthAvg: 195, leverage: 2.6, spreadPerTurnLev: 0, signal: "fair" as const },
    { sector: "Healthcare", currentSpread: 144, sixMonthAvg: 138, leverage: 3.1, spreadPerTurnLev: 0, signal: "cheap" as const },
    { sector: "Consumer", currentSpread: 175, sixMonthAvg: 162, leverage: 3.8, spreadPerTurnLev: 0, signal: "cheap" as const },
  ] as SectorSpread[]
).map((s) => ({
  ...s,
  currentSpread: s.currentSpread + Math.round((rand() - 0.5) * 6),
  spreadPerTurnLev: Math.round((s.currentSpread / s.leverage) * 10) / 10,
}));

const CARRY_ROLL: CarryRollPoint[] = CURVE_POINTS.filter((p) =>
  ["1Y", "2Y", "3Y", "5Y", "7Y", "10Y"].includes(p.tenor)
).map((p, i) => {
  const carry = Math.round(p.yield * 10 * randBetween(0.85, 1.0));
  const roll = Math.round(randBetween(2, 18) * (i < 2 ? 1.8 : 1));
  return {
    tenor: p.tenor,
    years: p.years,
    yield: p.yield,
    carryBps: carry,
    rollBps: roll,
    totalReturnBps: carry + roll,
  };
});

// ── Helpers ────────────────────────────────────────────────────────────────────

const signalColor = (sig: string) => {
  if (sig === "cheap" || sig === "buy") return "text-emerald-400";
  if (sig === "rich" || sig === "sell") return "text-red-400";
  return "text-muted-foreground";
};

const signalBg = (sig: string) => {
  if (sig === "cheap" || sig === "buy") return "bg-emerald-500/5 text-emerald-400 border border-emerald-500/20";
  if (sig === "rich" || sig === "sell") return "bg-red-500/5 text-red-400 border border-red-500/20";
  return "bg-muted/40 text-muted-foreground border border-border/30";
};

const zColor = (z: number) => {
  if (z > 0.5) return "text-emerald-400";
  if (z < -0.5) return "text-red-400";
  return "text-muted-foreground";
};

// ── Curve SVG ─────────────────────────────────────────────────────────────────

function YieldCurveSVG({ highlight }: { highlight: "steepener" | "flattener" | "butterfly" | null }) {
  const W = 560;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 40, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const yMin = Math.min(...CURVE_POINTS.map((p) => p.yield)) - 0.15;
  const yMax = Math.max(...CURVE_POINTS.map((p) => p.yield)) + 0.15;
  const xMax = 30;

  const toX = (yr: number) => PAD.left + (yr / xMax) * plotW;
  const toY = (y: number) => PAD.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  const pathD = CURVE_POINTS.map((p, i) =>
    (i === 0 ? "M" : "L") + ` ${toX(p.years).toFixed(1)} ${toY(p.yield).toFixed(1)}`
  ).join(" ");

  const areaD =
    pathD +
    ` L ${toX(CURVE_POINTS[CURVE_POINTS.length - 1].years)} ${toY(yMin)} L ${toX(0)} ${toY(yMin)} Z`;

  const yTicks = [4.3, 4.5, 4.7, 4.9, 5.1, 5.3];
  const xTicks = CURVE_POINTS.map((p) => ({ x: toX(p.years), label: p.tenor }));

  const getHighlightPoints = () => {
    if (highlight === "steepener") return [CURVE_POINTS[3], CURVE_POINTS[7]];
    if (highlight === "flattener") return [CURVE_POINTS[3], CURVE_POINTS[7]];
    if (highlight === "butterfly") return [CURVE_POINTS[3], CURVE_POINTS[5], CURVE_POINTS[7]];
    return [];
  };

  const hlPts = getHighlightPoints();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((y) => (
        <line
          key={y}
          x1={PAD.left}
          y1={toY(y)}
          x2={W - PAD.right}
          y2={toY(y)}
          stroke="#27272a"
          strokeWidth="1"
        />
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#curveGrad)" />

      {/* Curve line */}
      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {CURVE_POINTS.map((p) => (
        <circle key={p.tenor} cx={toX(p.years)} cy={toY(p.yield)} r="3.5" fill="#818cf8" />
      ))}

      {/* Highlight points */}
      {hlPts.map((p, i) => (
        <circle
          key={`hl-${i}`}
          cx={toX(p.years)}
          cy={toY(p.yield)}
          r="6"
          fill={
            highlight === "steepener"
              ? i === 0
                ? "#34d399"
                : "#f87171"
              : highlight === "flattener"
                ? i === 0
                  ? "#f87171"
                  : "#34d399"
                : i === 1
                  ? "#facc15"
                  : "#818cf8"
          }
          opacity="0.9"
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((y) => (
        <text key={y} x={PAD.left - 6} y={toY(y) + 4} textAnchor="end" fontSize="9" fill="#71717a">
          {y.toFixed(1)}%
        </text>
      ))}

      {/* X-axis labels */}
      {xTicks
        .filter((_, i) => i % 2 === 0 || CURVE_POINTS[i].tenor === "10Y" || CURVE_POINTS[i].tenor === "30Y")
        .map(({ x, label }) => (
          <text key={label} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">
            {label}
          </text>
        ))}

      {/* Axis lines */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#3f3f46" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}

// ── Z-Score Chart SVG ─────────────────────────────────────────────────────────

function ZScoreChart({ records }: { records: SpreadRecord[] }) {
  const W = 560;
  const H = 200;
  const PAD = { top: 16, right: 20, bottom: 36, left: 48 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const barW = plotW / records.length - 8;
  const zMin = -2;
  const zMax = 2;

  const toY = (z: number) => PAD.top + plotH - ((z - zMin) / (zMax - zMin)) * plotH;
  const zeroY = toY(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Zero line */}
      <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />

      {/* +/-1 bands */}
      <rect x={PAD.left} y={toY(1)} width={plotW} height={toY(-1) - toY(1)} fill="#6366f1" opacity="0.05" />

      {records.map((r, i) => {
        const x = PAD.left + i * (plotW / records.length) + 4;
        const z = Math.max(zMin, Math.min(zMax, r.zScore));
        const barTop = z >= 0 ? toY(z) : zeroY;
        const barH = Math.abs(toY(z) - zeroY);
        const fill = z > 0.5 ? "#34d399" : z < -0.5 ? "#f87171" : "#71717a";

        return (
          <g key={r.rating}>
            <rect x={x} y={barTop} width={barW} height={Math.max(barH, 2)} fill={fill} rx="2" opacity="0.8" />
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#a1a1aa">
              {r.rating}
            </text>
            <text
              x={x + barW / 2}
              y={z >= 0 ? barTop - 4 : barTop + barH + 12}
              textAnchor="middle"
              fontSize="9"
              fill={fill}
            >
              {r.zScore > 0 ? "+" : ""}
              {r.zScore.toFixed(1)}σ
            </text>
          </g>
        );
      })}

      {/* Y-axis */}
      {[-2, -1, 0, 1, 2].map((z) => (
        <text key={z} x={PAD.left - 6} y={toY(z) + 4} textAnchor="end" fontSize="9" fill="#71717a">
          {z > 0 ? "+" : ""}
          {z}σ
        </text>
      ))}

      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}

// ── Sector Spread SVG ─────────────────────────────────────────────────────────

function SectorSpreadChart({ data }: { data: SectorSpread[] }) {
  const W = 560;
  const H = 220;
  const PAD = { top: 16, right: 20, bottom: 48, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxSpread = Math.max(...data.flatMap((d) => [d.currentSpread, d.sixMonthAvg])) + 20;
  const barGroupW = plotW / data.length;
  const barW = (barGroupW - 10) / 2;

  const toH = (v: number) => (v / maxSpread) * plotH;
  const baseY = PAD.top + plotH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid lines */}
      {[50, 100, 150, 200].map((v) => {
        const y = baseY - toH(v);
        return (
          <g key={v}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#27272a" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#71717a">
              {v}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = PAD.left + i * barGroupW + 5;
        const currH = toH(d.currentSpread);
        const avgH = toH(d.sixMonthAvg);
        const fill = d.signal === "cheap" ? "#34d399" : d.signal === "rich" ? "#f87171" : "#818cf8";

        return (
          <g key={d.sector}>
            {/* Current spread bar */}
            <rect x={x} y={baseY - currH} width={barW} height={currH} fill={fill} rx="2" opacity="0.85" />
            {/* 6M avg bar */}
            <rect x={x + barW + 2} y={baseY - avgH} width={barW} height={avgH} fill="#52525b" rx="2" opacity="0.7" />
            {/* Label */}
            <text
              x={x + barGroupW / 2 - 3}
              y={H - 6}
              textAnchor="middle"
              fontSize="8.5"
              fill="#a1a1aa"
              transform={`rotate(-30, ${x + barGroupW / 2 - 3}, ${H - 6})`}
            >
              {d.sector}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={W - PAD.right - 110} y={PAD.top} width={10} height={10} fill="#818cf8" rx="2" />
      <text x={W - PAD.right - 97} y={PAD.top + 9} fontSize="9" fill="#a1a1aa">
        Current
      </text>
      <rect x={W - PAD.right - 55} y={PAD.top} width={10} height={10} fill="#52525b" rx="2" />
      <text x={W - PAD.right - 42} y={PAD.top + 9} fontSize="9" fill="#a1a1aa">
        6M Avg
      </text>

      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={baseY} stroke="#3f3f46" strokeWidth="1" />
      <line x1={PAD.left} y1={baseY} x2={W - PAD.right} y2={baseY} stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}

// ── Carry & Roll SVG ─────────────────────────────────────────────────────────

function CarryRollSVG({ data }: { data: CarryRollPoint[] }) {
  const W = 560;
  const H = 220;
  const PAD = { top: 16, right: 20, bottom: 36, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.totalReturnBps)) + 10;
  const toY = (v: number) => PAD.top + plotH - (v / maxVal) * plotH;
  const xStep = plotW / (data.length - 1);
  const toX = (i: number) => PAD.left + i * xStep;

  const carryPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.carryBps)}`).join(" ");
  const rollPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.rollBps)}`).join(" ");
  const totalPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.totalReturnBps)}`).join(" ");

  const totalAreaD =
    totalPath +
    ` L ${toX(data.length - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

  const ticks = [20, 40, 60, 80];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {ticks.map((v) => (
        <g key={v}>
          <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
            {v}
          </text>
        </g>
      ))}

      <path d={totalAreaD} fill="url(#totalGrad)" />
      <path d={totalPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={carryPath} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" />
      <path d={rollPath} fill="none" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="2 3" strokeLinecap="round" />

      {data.map((d, i) => (
        <g key={d.tenor}>
          <circle cx={toX(i)} cy={toY(d.totalReturnBps)} r="4" fill="#22d3ee" />
          <text x={toX(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#a1a1aa">
            {d.tenor}
          </text>
        </g>
      ))}

      {/* Legend */}
      <line x1={W - 170} y1={PAD.top + 6} x2={W - 158} y2={PAD.top + 6} stroke="#22d3ee" strokeWidth="2.5" />
      <text x={W - 155} y={PAD.top + 10} fontSize="9" fill="#a1a1aa">
        Total Return
      </text>
      <line x1={W - 170} y1={PAD.top + 20} x2={W - 158} y2={PAD.top + 20} stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x={W - 155} y={PAD.top + 24} fontSize="9" fill="#a1a1aa">
        Carry
      </text>
      <line x1={W - 170} y1={PAD.top + 34} x2={W - 158} y2={PAD.top + 34} stroke="#fb923c" strokeWidth="1.5" strokeDasharray="2 3" />
      <text x={W - 155} y={PAD.top + 38} fontSize="9" fill="#a1a1aa">
        Roll-Down
      </text>

      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#3f3f46" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────

function StatChip({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-muted/60 border border-border/40 px-3 py-2 flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── Info Box ─────────────────────────────────────────────────────────────────

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-3 flex gap-2 text-xs text-muted-foreground">
      <Info className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FixedIncomeRVPage() {
  const [curveHighlight, setCurveHighlight] = useState<"steepener" | "flattener" | "butterfly" | null>(null);

  const curve2Y = CURVE_POINTS.find((p) => p.tenor === "2Y")!;
  const curve5Y = CURVE_POINTS.find((p) => p.tenor === "5Y")!;
  const curve10Y = CURVE_POINTS.find((p) => p.tenor === "10Y")!;
  const curve30Y = CURVE_POINTS.find((p) => p.tenor === "30Y")!;

  const slope2s10s = useMemo(() => (curve10Y.yield - curve2Y.yield).toFixed(2), []);
  const slope5s30s = useMemo(() => (curve30Y.yield - curve5Y.yield).toFixed(2), []);

  // DV01-neutral ratios
  const dv01Ratio_2y10y = useMemo(
    () => (curve10Y.dv01 / curve2Y.dv01).toFixed(2),
    []
  );
  const butterflyValue = useMemo(
    () =>
      (
        BUTTERFLY_CONFIG.bellyYield -
        (BUTTERFLY_CONFIG.shortWingYield + BUTTERFLY_CONFIG.longWingYield) / 2
      ).toFixed(3),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 border-l-4 border-l-primary rounded-lg bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Fixed Income Relative Value</h1>
          <span className="ml-auto text-xs text-muted-foreground bg-muted/60 border border-border/40 rounded px-2 py-0.5">
            As of Mar 28, 2026
          </span>
        </div>
        <p className="text-xs text-muted-foreground ml-11">
          Yield curve trades, spread analysis, cross-market opportunities, sector rotation and carry/roll strategies.
        </p>
      </motion.div>

      {/* Summary chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6"
      >
        <StatChip label="2s10s Slope" value={`${Number(slope2s10s) >= 0 ? "+" : ""}${slope2s10s} bps`} sub="Near flat" />
        <StatChip label="5s30s Slope" value={`${Number(slope5s30s) >= 0 ? "+" : ""}${slope5s30s} bps`} sub="Slight normal" />
        <StatChip label="10Y TIPS BE" value="2.28%" sub="vs 5yr avg 2.35%" />
        <StatChip label="IG Avg OAS" value="118 bps" sub="-8 bps WoW" />
        <StatChip label="HY Avg OAS" value="382 bps" sub="+4 bps WoW" />
        <StatChip label="Muni/Tsy Ratio" value="68%" sub="10Y, pre-tax" />
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <Tabs defaultValue="curve">
          <TabsList className="bg-card/70 border border-border/60 h-9 mb-4 flex-wrap gap-1 p-1">
            <TabsTrigger value="curve" className="text-xs text-muted-foreground h-7 px-3 data-[state=active]:bg-muted/80">
              Yield Curve Trades
            </TabsTrigger>
            <TabsTrigger value="spreads" className="text-xs text-muted-foreground h-7 px-3 data-[state=active]:bg-muted/80">
              Spread Analysis
            </TabsTrigger>
            <TabsTrigger value="crossmarket" className="text-xs text-muted-foreground h-7 px-3 data-[state=active]:bg-muted/80">
              Cross-Market RV
            </TabsTrigger>
            <TabsTrigger value="sector" className="text-xs text-muted-foreground h-7 px-3 data-[state=active]:bg-muted/80">
              Sector Rotation
            </TabsTrigger>
            <TabsTrigger value="carry" className="text-xs text-muted-foreground h-7 px-3 data-[state=active]:bg-muted/80">
              Carry &amp; Roll
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Yield Curve Trades ─────────────────────────────────────── */}
          <TabsContent value="curve" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Left: curve visual */}
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium">Current Yield Curve</h2>
                  <span className="text-xs text-muted-foreground">US Treasuries — 3M to 30Y</span>
                </div>
                <YieldCurveSVG highlight={curveHighlight} />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {(["steepener", "flattener", "butterfly", null] as const).map((h) => (
                    <button
                      key={String(h)}
                      onClick={() => setCurveHighlight(h)}
                      className={cn(
                        "text-xs text-muted-foreground px-2.5 py-1 rounded border transition-colors",
                        curveHighlight === h
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                          : "bg-muted/50 border-border/40 text-muted-foreground hover:text-muted-foreground"
                      )}
                    >
                      {h === null ? "Reset" : h.charAt(0).toUpperCase() + h.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: trade constructions */}
              <div className="space-y-3">
                {/* Steepener */}
                <div
                  className={cn(
                    "rounded-md border p-4 transition-colors cursor-pointer",
                    curveHighlight === "steepener"
                      ? "bg-emerald-900/10 border-emerald-500/30"
                      : "bg-card/60 border-border/50 hover:border-border/60"
                  )}
                  onClick={() => setCurveHighlight(curveHighlight === "steepener" ? null : "steepener")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">2s10s Steepener</span>
                    <span className="ml-auto text-xs bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                      LONG 2Y / SHORT 10Y
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Buy the 2Y note, short the 10Y note. Profits if the curve steepens (2s10s spread widens). DV01-neutral
                    ratio ensures no outright duration bias.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">2Y Yield</div>
                      <div className="font-semibold">{curve2Y.yield.toFixed(2)}%</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">10Y Yield</div>
                      <div className="font-medium">{curve10Y.yield.toFixed(2)}%</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">DV01 Ratio</div>
                      <div className="font-medium">{dv01Ratio_2y10y}x</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Trade: Long $10M 2Y + Short ${dv01Ratio_2y10y}x notional 10Y &bull; Current slope: {Number(slope2s10s) >= 0 ? "+" : ""}{slope2s10s} bps
                  </div>
                </div>

                {/* Flattener */}
                <div
                  className={cn(
                    "rounded-md border p-4 transition-colors cursor-pointer",
                    curveHighlight === "flattener"
                      ? "bg-red-900/10 border-red-500/30"
                      : "bg-card/60 border-border/50 hover:border-border/60"
                  )}
                  onClick={() => setCurveHighlight(curveHighlight === "flattener" ? null : "flattener")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm font-medium text-red-400">2s10s Flattener</span>
                    <span className="ml-auto text-xs bg-red-500/5 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                      SHORT 2Y / LONG 10Y
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Short the 2Y, buy the 10Y. Profits if the curve flattens or inverts. Favored when Fed is expected to hold
                    while long-end anchored by low inflation expectations.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">5s30s Slope</div>
                      <div className="font-medium">+{slope5s30s} bps</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">2Y DV01</div>
                      <div className="font-medium">${curve2Y.dv01.toLocaleString()}</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">10Y DV01</div>
                      <div className="font-medium">${curve10Y.dv01.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Butterfly */}
                <div
                  className={cn(
                    "rounded-md border p-4 transition-colors cursor-pointer",
                    curveHighlight === "butterfly"
                      ? "bg-yellow-900/10 border-yellow-500/30"
                      : "bg-card/60 border-border/50 hover:border-border/60"
                  )}
                  onClick={() => setCurveHighlight(curveHighlight === "butterfly" ? null : "butterfly")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">2s5s10s Butterfly</span>
                    <span className="ml-auto text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">
                      BARBELL vs BULLET
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Long 5Y belly (bullet), short wings (2Y + 10Y barbell). DV01-neutral on each wing. Profits when the belly
                    cheapens relative to wings — positive butterfly value.
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">2Y Wing</div>
                      <div className="font-medium">{BUTTERFLY_CONFIG.shortWingYield.toFixed(2)}%</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">5Y Belly</div>
                      <div className="font-medium text-yellow-400">{BUTTERFLY_CONFIG.bellyYield.toFixed(2)}%</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">10Y Wing</div>
                      <div className="font-medium">{BUTTERFLY_CONFIG.longWingYield.toFixed(2)}%</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-muted-foreground mb-0.5">Fly Value</div>
                      <div className={cn("font-medium", Number(butterflyValue) > 0 ? "text-emerald-400" : "text-red-400")}>
                        {Number(butterflyValue) > 0 ? "+" : ""}{butterflyValue}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <InfoBox>
                DV01-neutral construction: the notional of each leg is sized so that a 1bp parallel move in yields produces
                equal but offsetting P&L. This isolates the curve shape bet and removes outright duration risk from the trade.
              </InfoBox>
            </div>
          </TabsContent>

          {/* ── Tab 2: Spread Analysis ────────────────────────────────────────── */}
          <TabsContent value="spreads" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Z-Score chart */}
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <h2 className="text-sm font-medium mb-1">OAS Z-Score vs 3Y History</h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Green bars = cheap (wide vs history) &bull; Red = rich (tight vs history) &bull; ±1σ band shaded
                </p>
                <ZScoreChart records={SPREAD_RECORDS} />
              </div>

              {/* Spread table */}
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <h2 className="text-sm font-medium mb-3">OAS by Rating / Sector</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border/60">
                        {["Rating", "Sector", "OAS (bps)", "1Y Avg", "3Y Avg", "Z-Score", "Signal"].map((h) => (
                          <th key={h} className="text-left text-muted-foreground py-2 pr-3 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SPREAD_RECORDS.map((r, i) => (
                        <motion.tr
                          key={r.rating}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border/30 hover:bg-muted/20"
                        >
                          <td className="py-2 pr-3 font-mono font-medium text-foreground">{r.rating}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{r.sector}</td>
                          <td className="py-2 pr-3 font-mono">{r.oas}</td>
                          <td className="py-2 pr-3 font-mono text-muted-foreground">{r.history1y}</td>
                          <td className="py-2 pr-3 font-mono text-muted-foreground">{r.history3y}</td>
                          <td className={cn("py-2 pr-3 font-mono font-medium", zColor(r.zScore))}>
                            {r.zScore > 0 ? "+" : ""}{r.zScore}σ
                          </td>
                          <td className="py-2">
                            <span className={cn("px-1.5 py-0.5 rounded text-xs text-muted-foreground font-medium", signalBg(r.signal))}>
                              {r.signal.toUpperCase()}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* IG vs HY comparison */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">IG Credit</span>
                </div>
                <div className="text-2xl font-bold mb-1">118 <span className="text-sm text-muted-foreground font-normal">bps OAS</span></div>
                <div className="text-xs text-muted-foreground mb-2">vs 10Y average: 125 bps</div>
                <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded px-2 py-1">
                  Slightly RICH to history — limited upside from spread compression
                </div>
              </div>
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">HY Credit</span>
                </div>
                <div className="text-lg font-medium mb-1">382 <span className="text-sm text-muted-foreground font-normal">bps OAS</span></div>
                <div className="text-xs text-muted-foreground mb-2">vs 10Y average: 420 bps</div>
                <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded px-2 py-1">
                  FAIR value — select issuer opportunities in BB-rated
                </div>
              </div>
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">IG vs HY Differential</span>
                </div>
                <div className="text-lg font-medium mb-1">264 <span className="text-sm text-muted-foreground font-normal">bps</span></div>
                <div className="text-xs text-muted-foreground mb-2">vs 10Y average: 295 bps</div>
                <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1">
                  Tight differential — HY not well compensated vs IG quality
                </div>
              </div>
            </div>

            <div className="mt-3">
              <InfoBox>
                OAS (Option-Adjusted Spread) removes the value of embedded options (calls/puts) from the spread. Z-score
                measures how many standard deviations current OAS sits from its 3-year average — positive (wide/cheap),
                negative (tight/rich).
              </InfoBox>
            </div>
          </TabsContent>

          {/* ── Tab 3: Cross-Market RV ────────────────────────────────────────── */}
          <TabsContent value="crossmarket" className="data-[state=inactive]:hidden">
            <div className="rounded-md bg-card/60 border border-border/50 p-4 mb-4">
              <h2 className="text-sm font-medium mb-3">Treasury / Agency / Muni Value Matrix</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border/60">
                      {["Instrument", "Type", "Yield", "TEY (37%)", "Sprd vs Tsy", "OTR/OTS Prem", "View"].map(
                        (h) => (
                          <th key={h} className="text-left text-muted-foreground py-2 pr-4 font-medium">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {CROSS_MARKET.map((row, i) => (
                      <motion.tr
                        key={`${row.instrument}-${i}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn(
                          "border-b border-border/30 hover:bg-muted/20",
                          row.type === "Muni" && "bg-indigo-500/3",
                          row.type === "TIPS" && "bg-cyan-500/3"
                        )}
                      >
                        <td className="py-2 pr-4 font-medium text-foreground">{row.instrument}</td>
                        <td className="py-2 pr-4">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-xs text-muted-foreground",
                              row.type === "Treasury" && "bg-muted/50 text-muted-foreground",
                              row.type === "Agency" && "bg-primary/10 text-primary",
                              row.type === "Muni" && "bg-indigo-500/10 text-indigo-400",
                              row.type === "TIPS" && "bg-cyan-500/10 text-muted-foreground"
                            )}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2 pr-4 font-mono">{row.yield.toFixed(2)}%</td>
                        <td className="py-2 pr-4 font-mono">
                          {row.teyAdjusted != null ? (
                            <span className="text-indigo-400">{row.teyAdjusted.toFixed(2)}%</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className={cn("py-2 pr-4 font-mono", row.spreadVsTsy > 0 ? "text-emerald-400" : row.spreadVsTsy < -100 ? "text-muted-foreground" : "text-muted-foreground")}>
                          {row.spreadVsTsy === 0 ? "—" : `${row.spreadVsTsy > 0 ? "+" : ""}${row.spreadVsTsy} bps`}
                        </td>
                        <td className="py-2 pr-4 font-mono text-muted-foreground">
                          {row.otrOtsPremium != null ? `${row.otrOtsPremium} bps` : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2">
                          <span className={cn("px-1.5 py-0.5 rounded text-xs text-muted-foreground font-medium", signalBg(row.signal))}>
                            {row.signal.toUpperCase()}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RV Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">Agency Premium</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  FNMA 2Y trades at +26 bps vs OTR Treasury. Historical range: +18–42 bps. Currently FAIR-to-CHEAP.
                  Implicit GSE government backing provides high credit quality at above-Treasury yields.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Typical range:</span>
                  <span className="text-muted-foreground">+18 — +42 bps</span>
                  <span className={cn("ml-auto px-1.5 py-0.5 rounded", signalBg("buy"))}>BUY</span>
                </div>
              </div>

              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs text-muted-foreground font-medium">Muni Tax Equiv. Yield</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  10Y AA Muni nominal yield of {(CURVE_POINTS[7].yield * 0.68).toFixed(2)}% equates to{" "}
                  {((CURVE_POINTS[7].yield * 0.68) / 0.63).toFixed(2)}% TEY for a 37% bracket investor — a{" "}
                  {Math.round(((CURVE_POINTS[7].yield * 0.68) / 0.63 - CURVE_POINTS[7].yield) * 100)} bps pickup vs
                  Treasuries.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Muni/Tsy ratio:</span>
                  <span className="text-indigo-300">68% (below 80% = cheap)</span>
                  <span className={cn("ml-auto px-1.5 py-0.5 rounded", signalBg("buy"))}>BUY</span>
                </div>
              </div>

              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">10Y TIPS Breakeven</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  10Y nominal Treasury at {CURVE_POINTS[7].yield.toFixed(2)}% vs TIPS real yield of{" "}
                  {(CURVE_POINTS[7].yield - 2.28).toFixed(2)}%. Breakeven inflation: 2.28% — below the 5Y average of
                  2.35%. Suggests TIPS slightly cheap relative to nominals.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-muted-foreground">5Y avg BE:</span>
                  <span className="text-muted-foreground">2.35% &bull; Current: 2.28%</span>
                  <span className={cn("ml-auto px-1.5 py-0.5 rounded", signalBg("buy"))}>TIPS</span>
                </div>
              </div>
            </div>

            <InfoBox>
              On-the-run (OTR) Treasuries trade at a liquidity premium versus off-the-run (OTS) bonds of the same maturity.
              This premium (typically 1–5 bps) can be harvested by swapping into cheaper OTS bonds, sacrificing marginal
              liquidity for incremental yield.
            </InfoBox>
          </TabsContent>

          {/* ── Tab 4: Sector Rotation ────────────────────────────────────────── */}
          <TabsContent value="sector" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Chart */}
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <h2 className="text-sm font-medium mb-1">Sector Spread: Current vs 6M Average</h2>
                <p className="text-xs text-muted-foreground mb-3">
                  <span className="text-emerald-400">■</span> Cheap &nbsp;
                  <span className="text-red-400">■</span> Rich &nbsp;
                  <span className="text-indigo-400">■</span> Fair vs history — bars in bps OAS
                </p>
                <SectorSpreadChart data={SECTOR_SPREADS} />
              </div>

              {/* Table */}
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <h2 className="text-sm font-medium mb-3">Spread per Turn of Leverage</h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Spread/leverage ratio normalizes compensation across sectors with different capital structures.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border/60">
                        {["Sector", "OAS (bps)", "6M Avg", "Leverage", "Sprd/Turn Lev", "Signal"].map((h) => (
                          <th key={h} className="text-left text-muted-foreground py-2 pr-3 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SECTOR_SPREADS.sort((a, b) => b.spreadPerTurnLev - a.spreadPerTurnLev).map((s, i) => (
                        <motion.tr
                          key={s.sector}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border/30 hover:bg-muted/20"
                        >
                          <td className="py-2 pr-3 font-medium text-foreground">{s.sector}</td>
                          <td className="py-2 pr-3 font-mono">{s.currentSpread}</td>
                          <td className="py-2 pr-3 font-mono text-muted-foreground">{s.sixMonthAvg}</td>
                          <td className="py-2 pr-3 font-mono text-muted-foreground">{s.leverage.toFixed(1)}x</td>
                          <td className={cn("py-2 pr-3 font-mono font-medium", signalColor(s.signal))}>
                            {s.spreadPerTurnLev.toFixed(1)}
                          </td>
                          <td className="py-2">
                            <span className={cn("px-1.5 py-0.5 rounded text-xs text-muted-foreground font-medium", signalBg(s.signal))}>
                              {s.signal.toUpperCase()}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rotation recommendations */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Overweight Recommendation</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    <span><span className="text-foreground font-medium">TMT (Tech/Media/Telecom)</span> — spreads at +162 bps, 14 bps wide to 6M avg. Earnings stability and BB migration tailwinds support tightening.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    <span><span className="text-foreground font-medium">Healthcare</span> — +144 bps, 6 bps cheap. Defensive cashflows, limited refinancing risk, M&A pipeline supportive.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    <span><span className="text-foreground font-medium">Consumer</span> — widest spread per turn of leverage. Credit positive catalyst from rate cut cycle expected H2 2026.</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Underweight / Trim</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">–</span>
                    <span><span className="text-foreground font-medium">Financials</span> — OAS 13 bps tight to 6M avg. Binary regulatory risk and CRE exposure create asymmetric risk/reward.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">–</span>
                    <span><span className="text-foreground font-medium">CCC-rated bonds</span> — overall HY richness limits the risk premium. Prefer BB/single-B where fundamentals are improving.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">—</span>
                    <span><span className="text-foreground font-medium">Utilities</span> — FAIR at -5 bps to avg. Rate sensitivity caps total return; prefer duration-neutral IG credit.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <InfoBox>
                Spread per turn of leverage normalizes sector OAS by the median debt/EBITDA ratio, providing a comparability
                metric across different capital structures. Higher values indicate better compensation per unit of financial risk taken.
              </InfoBox>
            </div>
          </TabsContent>

          {/* ── Tab 5: Carry & Roll ────────────────────────────────────────────── */}
          <TabsContent value="carry" className="data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* SVG */}
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <h2 className="text-sm font-medium mb-1">Riding the Yield Curve — 6M Horizon</h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Carry (coupon accrual) + Roll-down (yield decline as bond ages) = Total expected return in bps
                </p>
                <CarryRollSVG data={CARRY_ROLL} />
              </div>

              {/* Table */}
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <h2 className="text-sm font-medium mb-3">Carry &amp; Roll Breakdown Table</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border/60">
                        {["Tenor", "Yield", "Carry (6M)", "Roll-Down", "Total (bps)", "Ann. Return"].map(
                          (h) => (
                            <th key={h} className="text-left text-muted-foreground py-2 pr-3 font-medium">
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {CARRY_ROLL.map((row, i) => {
                        const annualized = ((row.totalReturnBps / 10000) * 2 * 100).toFixed(2);
                        return (
                          <motion.tr
                            key={row.tenor}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="border-b border-border/30 hover:bg-muted/20"
                          >
                            <td className="py-2 pr-3 font-medium text-foreground">{row.tenor}</td>
                            <td className="py-2 pr-3 font-mono">{row.yield.toFixed(2)}%</td>
                            <td className="py-2 pr-3 font-mono text-indigo-400">+{row.carryBps}</td>
                            <td className="py-2 pr-3 font-mono text-orange-400">+{row.rollBps}</td>
                            <td className="py-2 pr-3 font-mono font-medium text-muted-foreground">+{row.totalReturnBps}</td>
                            <td className="py-2 pr-3 font-mono text-muted-foreground">{annualized}%</td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Best tenor highlight */}
                <div className="mt-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Optimal Carry Point</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const best = [...CARRY_ROLL].sort((a, b) => b.totalReturnBps - a.totalReturnBps)[0];
                      return `The ${best.tenor} point offers the highest total 6M return of +${best.totalReturnBps} bps (+${((best.totalReturnBps / 10000) * 2 * 100).toFixed(2)}% annualized). Optimal for "riding the curve" strategy given current shape.`;
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Carry concepts */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-400">Carry</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The yield earned on holding a bond over a period (net of financing cost). In a normal upward-sloping
                  curve, longer bonds have higher carry. Formula: (Coupon − Repo Rate) × Time.
                </p>
              </div>
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Roll-Down</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Price appreciation as a bond "rolls down" the yield curve toward maturity. A 5Y bond held for 6M
                  becomes a 4.5Y bond priced at the (typically lower) 4.5Y yield — generating capital gain.
                </p>
              </div>
              <div className="rounded-md bg-card/60 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Riding the Curve</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined strategy of maximizing carry + roll-down. Most effective in a stable, upward-sloping curve.
                  Risk: parallel shift up erodes returns; steepening at the target tenor is particularly adverse.
                </p>
              </div>
            </div>

            <div className="mt-3">
              <InfoBox>
                Total expected return = Carry + Roll-Down − Duration × ΔYield. This analysis assumes a static yield curve
                over the 6-month horizon. In practice, an investor should stress-test returns under parallel shifts of
                ±25/50/100 bps to assess risk-adjusted attractiveness.
              </InfoBox>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
