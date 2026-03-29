"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart2,
  Layers,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Globe,
  RefreshCw,
} from "lucide-react";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 173;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function randRange(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function randInt(lo: number, hi: number) {
  return Math.floor(randRange(lo, hi + 1));
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SECTORS = [
  { name: "Technology",             etf: "XLK",  color: "#6366f1", short: "Tech" },
  { name: "Healthcare",             etf: "XLV",  color: "#10b981", short: "Health" },
  { name: "Financials",             etf: "XLF",  color: "#3b82f6", short: "Fin" },
  { name: "Consumer Discretionary", etf: "XLY",  color: "#f59e0b", short: "Disc" },
  { name: "Consumer Staples",       etf: "XLP",  color: "#84cc16", short: "Staples" },
  { name: "Industrials",            etf: "XLI",  color: "#8b5cf6", short: "Indus" },
  { name: "Energy",                 etf: "XLE",  color: "#ef4444", short: "Energy" },
  { name: "Materials",              etf: "XLB",  color: "#14b8a6", short: "Matls" },
  { name: "Real Estate",            etf: "XLRE", color: "#f97316", short: "REIT" },
  { name: "Utilities",              etf: "XLU",  color: "#06b6d4", short: "Utils" },
  { name: "Comm Services",          etf: "XLC",  color: "#ec4899", short: "Comm" },
] as const;

type SectorName = (typeof SECTORS)[number]["name"];

// ── Business Cycle Data ────────────────────────────────────────────────────────

interface CyclePhase {
  label: string;
  short: string;
  angleStart: number;
  angleEnd: number;
  color: string;
  leaders: SectorName[];
  laggards: SectorName[];
}

const CYCLE_PHASES: CyclePhase[] = [
  {
    label: "Early Expansion",
    short: "Early Exp",
    angleStart: 270,
    angleEnd: 360,
    color: "#10b981",
    leaders: ["Financials", "Consumer Discretionary", "Industrials"],
    laggards: ["Utilities", "Consumer Staples", "Real Estate"],
  },
  {
    label: "Mid Expansion",
    short: "Mid Exp",
    angleStart: 0,
    angleEnd: 90,
    color: "#6366f1",
    leaders: ["Technology", "Industrials", "Materials"],
    laggards: ["Utilities", "Consumer Staples", "Energy"],
  },
  {
    label: "Late Expansion",
    short: "Late Exp",
    angleStart: 90,
    angleEnd: 180,
    color: "#f59e0b",
    leaders: ["Energy", "Materials", "Technology"],
    laggards: ["Real Estate", "Utilities", "Consumer Staples"],
  },
  {
    label: "Recession",
    short: "Recession",
    angleStart: 180,
    angleEnd: 270,
    color: "#ef4444",
    leaders: ["Healthcare", "Consumer Staples", "Utilities"],
    laggards: ["Financials", "Consumer Discretionary", "Industrials"],
  },
];

const CURRENT_PHASE_IDX = 1; // Mid Expansion
const CURRENT_NEEDLE_DEG = 45; // mid-way through Mid Expansion quadrant

// Avg returns by phase (%) — seeded synthetic
const PHASE_RETURNS: Record<SectorName, [number, number, number, number]> = {
  "Technology":             [8.2, 12.4, 6.8, -14.2],
  "Healthcare":             [5.1,  6.3,  9.4,   4.2],
  "Financials":             [14.3, 8.1, -3.2, -18.6],
  "Consumer Discretionary": [16.8, 10.2, -2.8, -22.4],
  "Consumer Staples":       [2.4,  3.1,  7.9,   8.3],
  "Industrials":            [12.6, 11.4, -1.4, -15.8],
  "Energy":                 [4.8,  9.2, 14.3,  -6.2],
  "Materials":              [6.3, 10.8, 11.2,  -9.4],
  "Real Estate":            [-1.4,  4.2,  3.8, -12.6],
  "Utilities":              [-3.2,  1.8,  8.6,  11.4],
  "Comm Services":          [9.4,  8.6,  4.2, -11.8],
};

// ── Momentum Data ──────────────────────────────────────────────────────────────

interface MomentumRow {
  name: SectorName;
  etf: string;
  color: string;
  ret1w: number;
  ret1m: number;
  ret3m: number;
  ret6m: number;
  ret12m: number;
  composite: number;
}

function buildMomentumData(): MomentumRow[] {
  return SECTORS.map((sec) => {
    const r1w  = randRange(-3.5, 4.5);
    const r1m  = randRange(-8, 10);
    const r3m  = randRange(-12, 18);
    const r6m  = randRange(-15, 25);
    const r12m = randRange(-20, 35);
    const composite = r1w * 0.1 + r1m * 0.2 + r3m * 0.25 + r6m * 0.25 + r12m * 0.2;
    return {
      name: sec.name,
      etf: sec.etf,
      color: sec.color,
      ret1w: parseFloat(r1w.toFixed(2)),
      ret1m: parseFloat(r1m.toFixed(2)),
      ret3m: parseFloat(r3m.toFixed(2)),
      ret6m: parseFloat(r6m.toFixed(2)),
      ret12m: parseFloat(r12m.toFixed(2)),
      composite: parseFloat(composite.toFixed(2)),
    };
  });
}

// ── Relative Strength Data ─────────────────────────────────────────────────────

interface RSRow {
  name: SectorName;
  etf: string;
  color: string;
  rsNow: number;
  rs4wChange: number;
  rs12wChange: number;
  trend: "rising" | "falling" | "flat";
  atNewHigh: boolean;
  divergence: boolean;
  rsHistory: number[];
}

function buildRSData(): RSRow[] {
  return SECTORS.map((sec) => {
    // Build 52-pt history with random walk
    const history: number[] = [];
    let val = randRange(0.85, 1.15);
    for (let i = 0; i < 52; i++) {
      val = Math.max(0.6, Math.min(1.6, val + randRange(-0.025, 0.025)));
      history.push(parseFloat(val.toFixed(4)));
    }
    const rsNow = history[history.length - 1];
    const rs4wAgo = history[history.length - 5];
    const rs12wAgo = history[history.length - 13];
    const rs4wChange = parseFloat(((rsNow - rs4wAgo) * 100).toFixed(2));
    const rs12wChange = parseFloat(((rsNow - rs12wAgo) * 100).toFixed(2));
    const trend = rs4wChange > 0.5 ? "rising" : rs4wChange < -0.5 ? "falling" : "flat";
    const maxRS = Math.max(...history);
    const atNewHigh = rsNow >= maxRS * 0.98;
    // Divergence: recent price low but RS improving
    const divergence = rs4wChange > 0.5 && rs12wChange < -1.0;
    return {
      name: sec.name,
      etf: sec.etf,
      color: sec.color,
      rsNow: parseFloat(rsNow.toFixed(3)),
      rs4wChange,
      rs12wChange,
      trend,
      atNewHigh,
      divergence,
      rsHistory: history,
    };
  });
}

// ── Economic Indicators ────────────────────────────────────────────────────────

interface EconIndicator {
  name: string;
  shortName: string;
  value: string;
  direction: "up" | "down" | "neutral";
  bullishSectors: SectorName[];
  bearishSectors: SectorName[];
}

const ECON_INDICATORS: EconIndicator[] = [
  {
    name: "PMI Manufacturing",
    shortName: "PMI",
    value: "54.2",
    direction: "up",
    bullishSectors: ["Industrials", "Materials", "Technology"],
    bearishSectors: ["Utilities", "Consumer Staples"],
  },
  {
    name: "Yield Curve (10Y-2Y)",
    shortName: "Yield Curve",
    value: "+0.42%",
    direction: "up",
    bullishSectors: ["Financials", "Industrials", "Consumer Discretionary"],
    bearishSectors: ["Utilities", "Real Estate"],
  },
  {
    name: "Oil Price (WTI)",
    shortName: "Oil",
    value: "$83.40",
    direction: "up",
    bullishSectors: ["Energy", "Materials"],
    bearishSectors: ["Consumer Discretionary", "Industrials"],
  },
  {
    name: "US Dollar Index",
    shortName: "DXY",
    value: "104.8",
    direction: "up",
    bullishSectors: ["Financials", "Consumer Staples"],
    bearishSectors: ["Materials", "Energy", "Industrials"],
  },
  {
    name: "HY Credit Spreads",
    shortName: "HY Spreads",
    value: "312 bps",
    direction: "down",
    bullishSectors: ["Financials", "Consumer Discretionary", "Industrials"],
    bearishSectors: ["Utilities", "Consumer Staples"],
  },
  {
    name: "Housing Starts",
    shortName: "Housing",
    value: "1.42M",
    direction: "up",
    bullishSectors: ["Real Estate", "Materials", "Industrials"],
    bearishSectors: ["Utilities"],
  },
  {
    name: "Consumer Confidence",
    shortName: "Conf",
    value: "102.4",
    direction: "up",
    bullishSectors: ["Consumer Discretionary", "Financials", "Technology"],
    bearishSectors: ["Consumer Staples", "Utilities"],
  },
  {
    name: "Unemployment Rate",
    shortName: "Unemp",
    value: "3.8%",
    direction: "down",
    bullishSectors: ["Consumer Discretionary", "Technology", "Industrials"],
    bearishSectors: ["Healthcare"],
  },
];

// Build signal matrix: for each sector, count bullish/bearish econ signals
function buildEconMatrix(): Record<SectorName, { bullish: number; bearish: number; net: number }> {
  const result = {} as Record<SectorName, { bullish: number; bearish: number; net: number }>;
  SECTORS.forEach((s) => {
    result[s.name] = { bullish: 0, bearish: 0, net: 0 };
  });
  ECON_INDICATORS.forEach((ind) => {
    const mult = ind.direction === "up" ? 1 : ind.direction === "down" ? -1 : 0;
    ind.bullishSectors.forEach((sn) => {
      if (result[sn]) {
        if (mult > 0) result[sn].bullish++;
        else if (mult < 0) result[sn].bearish++;
      }
    });
    ind.bearishSectors.forEach((sn) => {
      if (result[sn]) {
        if (mult < 0) result[sn].bullish++;
        else if (mult > 0) result[sn].bearish++;
      }
    });
  });
  SECTORS.forEach((s) => {
    result[s.name].net = result[s.name].bullish - result[s.name].bearish;
  });
  return result;
}

// ── Inter-Market Data ──────────────────────────────────────────────────────────

interface CrossAsset {
  name: string;
  ticker: string;
  price: string;
  change: number;
  direction: "risk-on" | "risk-off" | "neutral";
}

const CROSS_ASSETS: CrossAsset[] = [
  { name: "10Y Treasury",   ticker: "TLT",    price: "91.42",  change: -0.34, direction: "risk-on" },
  { name: "Gold",           ticker: "GLD",    price: "194.82", change: 0.62,  direction: "risk-off" },
  { name: "Crude Oil",      ticker: "USO",    price: "74.28",  change: 1.14,  direction: "risk-on" },
  { name: "US Dollar",      ticker: "DXY",    price: "104.8",  change: 0.22,  direction: "neutral" },
  { name: "HY Bonds",       ticker: "HYG",    price: "76.42",  change: 0.18,  direction: "risk-on" },
  { name: "VIX",            ticker: "VIX",    price: "14.82",  change: -0.8,  direction: "risk-on" },
  { name: "EM Equities",    ticker: "EEM",    price: "41.24",  change: 0.44,  direction: "risk-on" },
  { name: "JPY/USD",        ticker: "FXY",    price: "66.82",  change: -0.12, direction: "neutral" },
];

// Sector correlations to cross assets (synthetic, -1 to +1)
interface SectorCorrelation {
  name: SectorName;
  bonds: number;
  gold: number;
  oil: number;
  dollar: number;
  hy: number;
}

function buildCorrelations(): SectorCorrelation[] {
  // Fixed meaningful correlations, seeded
  const corrs: Record<SectorName, [number, number, number, number, number]> = {
    "Technology":             [ 0.12, -0.18, -0.22, -0.28,  0.54],
    "Healthcare":             [ 0.34,  0.22, -0.14,  0.08,  0.28],
    "Financials":             [-0.52, -0.32, -0.08, -0.12,  0.68],
    "Consumer Discretionary": [-0.18, -0.24, -0.44, -0.14,  0.62],
    "Consumer Staples":       [ 0.48,  0.28, -0.12,  0.18,  0.12],
    "Industrials":            [-0.24, -0.14,  0.22, -0.38,  0.58],
    "Energy":                 [-0.08,  0.14,  0.78, -0.42,  0.24],
    "Materials":              [-0.14,  0.32,  0.54, -0.48,  0.42],
    "Real Estate":            [ 0.62,  0.18, -0.24, -0.08,  0.34],
    "Utilities":              [ 0.72,  0.32, -0.28,  0.12,  0.08],
    "Comm Services":          [ 0.08, -0.12, -0.18, -0.22,  0.48],
  };
  return SECTORS.map((s) => ({
    name: s.name,
    bonds:  corrs[s.name][0],
    gold:   corrs[s.name][1],
    oil:    corrs[s.name][2],
    dollar: corrs[s.name][3],
    hy:     corrs[s.name][4],
  }));
}

// ── Tactical Model ─────────────────────────────────────────────────────────────

type Stance = "Overweight" | "Neutral" | "Underweight";
type Confidence = "High" | "Medium" | "Low";

interface TacticalRow {
  name: SectorName;
  etf: string;
  color: string;
  momentumScore: number;  // -3 to +3
  econScore: number;      // -3 to +3
  rsScore: number;        // -3 to +3
  interMarketScore: number; // -3 to +3
  composite: number;      // average
  stance: Stance;
  confidence: Confidence;
  allocationPct: number;  // suggested %
  historicalAlpha: number; // avg alpha vs equal-weight
}

function buildTacticalModel(
  momentum: MomentumRow[],
  rs: RSRow[],
  econMatrix: Record<SectorName, { bullish: number; bearish: number; net: number }>,
  correlations: SectorCorrelation[],
): TacticalRow[] {
  // Rank composite momentum
  const sortedMom = [...momentum].sort((a, b) => b.composite - a.composite);
  const momRankMap: Record<string, number> = {};
  sortedMom.forEach((r, i) => { momRankMap[r.name] = ((sortedMom.length - 1 - i) / (sortedMom.length - 1)) * 6 - 3; });

  // Rank RS
  const sortedRS = [...rs].sort((a, b) => b.rs12wChange - a.rs12wChange);
  const rsRankMap: Record<string, number> = {};
  sortedRS.forEach((r, i) => { rsRankMap[r.name] = ((sortedRS.length - 1 - i) / (sortedRS.length - 1)) * 6 - 3; });

  return SECTORS.map((sec) => {
    const econData = econMatrix[sec.name];
    const corr = correlations.find((c) => c.name === sec.name)!;

    const momentumScore = parseFloat((momRankMap[sec.name] ?? 0).toFixed(2));
    const econScore = parseFloat(Math.max(-3, Math.min(3, econData.net * 0.75)).toFixed(2));
    const rsScore = parseFloat((rsRankMap[sec.name] ?? 0).toFixed(2));
    // Inter-market: reward positive HY correlation (risk-on signal), mild penalty for high bond/gold correlation
    const interMarketScore = parseFloat(Math.max(-3, Math.min(3,
      corr.hy * 2 - corr.bonds * 1.5 - Math.abs(corr.dollar) * 0.5
    )).toFixed(2));

    const composite = parseFloat(((momentumScore + econScore + rsScore + interMarketScore) / 4).toFixed(2));

    const stance: Stance = composite >= 0.8 ? "Overweight" : composite <= -0.5 ? "Underweight" : "Neutral";
    const signalAgreement = [momentumScore, econScore, rsScore, interMarketScore]
      .filter(v => (composite > 0 ? v > 0 : v < 0)).length;
    const confidence: Confidence = signalAgreement >= 3 ? "High" : signalAgreement >= 2 ? "Medium" : "Low";

    const baseAlloc = 9.09; // equal weight
    const extra = composite * 2.5;
    const allocationPct = parseFloat(Math.max(2, Math.min(18, baseAlloc + extra)).toFixed(1));

    const historicalAlpha = parseFloat((composite * 1.8 + randRange(-0.8, 0.8)).toFixed(2));

    return {
      name: sec.name,
      etf: sec.etf,
      color: sec.color,
      momentumScore,
      econScore,
      rsScore,
      interMarketScore,
      composite,
      stance,
      confidence,
      allocationPct,
      historicalAlpha,
    };
  });
}

// ── SVG Helpers ────────────────────────────────────────────────────────────────

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildArcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

// Normalize a series to [0,1]
function normalizeSeries(data: number[]): number[] {
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  if (mx === mn) return data.map(() => 0.5);
  return data.map((v) => (v - mn) / (mx - mn));
}

function buildPolyline(
  data: number[],
  x: number,
  y: number,
  w: number,
  h: number,
  yInvert = true,
): string {
  if (data.length < 2) return "";
  const norm = normalizeSeries(data);
  return norm
    .map((v, i) => {
      const px = x + (i / (norm.length - 1)) * w;
      const py = yInvert ? y + h - v * h : y + v * h;
      return `${px},${py}`;
    })
    .join(" ");
}

// ── Shared small helpers ───────────────────────────────────────────────────────

function fmtPct(v: number, decimals = 1): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}

function momColor(v: number, allVals: number[]): string {
  const sorted = [...allVals].sort((a, b) => a - b);
  const tercile1 = sorted[Math.floor(sorted.length / 3)];
  const tercile2 = sorted[Math.floor((2 * sorted.length) / 3)];
  if (v >= tercile2) return "bg-emerald-500/20 text-emerald-300";
  if (v <= tercile1) return "bg-red-500/20 text-red-400";
  return "bg-muted/20 text-muted-foreground";
}

function corrColor(v: number): string {
  if (v >= 0.5) return "text-emerald-400";
  if (v >= 0.2) return "text-emerald-300/70";
  if (v <= -0.5) return "text-red-400";
  if (v <= -0.2) return "text-red-300/70";
  return "text-muted-foreground";
}

function stanceColor(stance: Stance) {
  if (stance === "Overweight") return "text-emerald-400 bg-emerald-500/15";
  if (stance === "Underweight") return "text-red-400 bg-red-500/15";
  return "text-muted-foreground bg-muted/20";
}

function confColor(c: Confidence) {
  if (c === "High") return "text-emerald-400";
  if (c === "Medium") return "text-amber-400";
  return "text-muted-foreground";
}

// ── Tab Definitions ────────────────────────────────────────────────────────────

const TABS = [
  { id: "cycle",       label: "Business Cycle",       icon: RefreshCw },
  { id: "momentum",    label: "Sector Momentum",       icon: Activity },
  { id: "rs",          label: "Relative Strength",     icon: TrendingUp },
  { id: "econ",        label: "Econ → Sectors",        icon: Globe },
  { id: "intermarket", label: "Inter-Market",          icon: Layers },
  { id: "tactical",   label: "Tactical Model",         icon: Target },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── SECTION 1: Business Cycle Clock ───────────────────────────────────────────

function BusinessCycleClock({ phaseIdx, phase }: { phaseIdx: number; phase: CyclePhase }) {
  const cx = 140, cy = 140, r = 110, innerR = 42;

  return (
    <svg width={280} height={280} viewBox="0 0 280 280" className="overflow-visible">
      {/* Quadrant arcs */}
      {CYCLE_PHASES.map((p, i) => {
        const isCurrent = i === phaseIdx;
        return (
          <g key={p.label}>
            <path
              d={buildArcPath(cx, cy, r, p.angleStart, p.angleEnd)}
              fill={p.color}
              opacity={isCurrent ? 0.35 : 0.12}
              stroke={p.color}
              strokeWidth={isCurrent ? 1.5 : 0.5}
              strokeOpacity={isCurrent ? 0.8 : 0.3}
            />
            {/* Label */}
            {(() => {
              const midAngle = (p.angleStart + p.angleEnd) / 2;
              const pos = polarToXY(cx, cy, r * 0.68, midAngle);
              return (
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={p.color}
                  fontSize={9}
                  fontWeight={isCurrent ? 700 : 400}
                  opacity={isCurrent ? 1 : 0.6}
                >
                  {p.short}
                </text>
              );
            })()}
          </g>
        );
      })}

      {/* Divider lines */}
      {[0, 90, 180, 270].map((angle) => {
        const p1 = polarToXY(cx, cy, innerR + 2, angle);
        const p2 = polarToXY(cx, cy, r, angle);
        return (
          <line
            key={angle}
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            stroke="#ffffff"
            strokeOpacity={0.12}
            strokeWidth={1}
          />
        );
      })}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="#0f0f14" stroke="#ffffff" strokeOpacity={0.15} strokeWidth={1} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#e5e7eb" fontSize={8} fontWeight={600}>
        CYCLE
      </text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#e5e7eb" fontSize={8}>
        CLOCK
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill={phase.color} fontSize={7} fontWeight={700}>
        NOW
      </text>

      {/* Needle */}
      {(() => {
        const np = polarToXY(cx, cy, r * 0.82, CURRENT_NEEDLE_DEG);
        const nb = polarToXY(cx, cy, -innerR * 0.4, CURRENT_NEEDLE_DEG);
        return (
          <>
            <line
              x1={nb.x} y1={nb.y}
              x2={np.x} y2={np.y}
              stroke="#ffffff"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <circle cx={np.x} cy={np.y} r={4} fill="#ffffff" />
          </>
        );
      })()}
      <circle cx={cx} cy={cy} r={4} fill="#ffffff" opacity={0.9} />
    </svg>
  );
}

// ── SECTION 3: RS Mini Sparkline ───────────────────────────────────────────────

function RSSparkline({ data, color, width = 80, height = 28 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const pts = buildPolyline(data, 0, 0, width, height, true);
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* last point dot */}
      {(() => {
        const norm = normalizeSeries(data);
        const lv = norm[norm.length - 1];
        const lx = width;
        const ly = height - lv * height;
        return <circle cx={lx} cy={ly} r={2.5} fill={color} />;
      })()}
    </svg>
  );
}

// ── SECTION 5: Risk-On/Off Barometer SVG ──────────────────────────────────────

function RiskBarometer({ score }: { score: number }) {
  // score: -1 (full risk-off) to +1 (full risk-on)
  const w = 220, h = 80;
  const cx = w / 2, cy = h - 10;
  const r = 62;
  // Arc from 180 to 360 degrees (semicircle bottom)
  const startAngle = 180;
  const endAngle = 360;
  // Gradient stops for the arc: red → yellow → green
  const needleAngle = 180 + ((score + 1) / 2) * 180;
  const np = polarToXY(cx, cy, r * 0.78, needleAngle);

  function arcSeg(startD: number, endD: number, color: string = "") {
    const s = polarToXY(cx, cy, r, startD);
    const e = polarToXY(cx, cy, r, endD);
    const si = polarToXY(cx, cy, r - 14, startD);
    const ei = polarToXY(cx, cy, r - 14, endD);
    const large = endD - startD > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${r - 14} ${r - 14} 0 ${large} 0 ${si.x} ${si.y} Z`;
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Risk-off zone */}
      <path d={arcSeg(startAngle, 225)} fill="#ef4444" opacity={0.3} />
      {/* Neutral zone */}
      <path d={arcSeg(225, 315)} fill="#f59e0b" opacity={0.25} />
      {/* Risk-on zone */}
      <path d={arcSeg(315, endAngle)} fill="#10b981" opacity={0.3} />

      {/* Labels */}
      {(() => {
        const lp = polarToXY(cx, cy, r + 10, 195);
        const np2 = polarToXY(cx, cy, r + 10, 270);
        const rp = polarToXY(cx, cy, r + 10, 345);
        return (
          <>
            <text x={lp.x} y={lp.y} textAnchor="middle" fill="#ef4444" fontSize={8} fontWeight={600}>RISK-OFF</text>
            <text x={np2.x} y={np2.y + 4} textAnchor="middle" fill="#f59e0b" fontSize={8}>NEUTRAL</text>
            <text x={rp.x} y={rp.y} textAnchor="middle" fill="#10b981" fontSize={8} fontWeight={600}>RISK-ON</text>
          </>
        );
      })()}

      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={np.x} y2={np.y}
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.9}
      />
      <circle cx={cx} cy={cy} r={5} fill="white" opacity={0.9} />
    </svg>
  );
}

// ── SECTION 2: Momentum Matrix ─────────────────────────────────────────────────

function MomentumSection({ data }: { data: MomentumRow[] }) {
  const allRet1w  = data.map((d) => d.ret1w);
  const allRet1m  = data.map((d) => d.ret1m);
  const allRet3m  = data.map((d) => d.ret3m);
  const allRet6m  = data.map((d) => d.ret6m);
  const allRet12m = data.map((d) => d.ret12m);
  const allComp   = data.map((d) => d.composite);

  const sortedByComp = [...data].sort((a, b) => b.composite - a.composite);

  const topDecile = data
    .filter((d) => d.composite >= sortedByComp[1].composite)
    .slice(0, 2)
    .map((d) => d.name);
  const botDecile = data
    .filter((d) => d.composite <= sortedByComp[sortedByComp.length - 2].composite)
    .slice(0, 2)
    .map((d) => d.name);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium w-36">Sector</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">1W</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">1M</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">3M</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">6M</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">12M</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">Composite</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td className="py-1.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                    <span className="text-foreground font-medium truncate max-w-[100px]">{row.name}</span>
                  </div>
                </td>
                <td className={cn("py-1.5 px-2 text-right rounded", momColor(row.ret1w, allRet1w))}>
                  {fmtPct(row.ret1w)}
                </td>
                <td className={cn("py-1.5 px-2 text-right rounded", momColor(row.ret1m, allRet1m))}>
                  {fmtPct(row.ret1m)}
                </td>
                <td className={cn("py-1.5 px-2 text-right rounded", momColor(row.ret3m, allRet3m))}>
                  {fmtPct(row.ret3m)}
                </td>
                <td className={cn("py-1.5 px-2 text-right rounded", momColor(row.ret6m, allRet6m))}>
                  {fmtPct(row.ret6m)}
                </td>
                <td className={cn("py-1.5 px-2 text-right rounded", momColor(row.ret12m, allRet12m))}>
                  {fmtPct(row.ret12m)}
                </td>
                <td className={cn("py-1.5 px-2 text-right font-semibold rounded", momColor(row.composite, allComp))}>
                  {fmtPct(row.composite)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
        {/* Rotation Signals */}
        <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Rotation Signals</div>
          <div className="space-y-1.5">
            {topDecile.map((n) => (
              <div key={n} className="flex items-center gap-2 text-xs">
                <ArrowUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300">{n}</span>
                <span className="text-muted-foreground text-xs ml-auto">Entering top decile</span>
              </div>
            ))}
            {botDecile.map((n) => (
              <div key={n} className="flex items-center gap-2 text-xs">
                <ArrowDown className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-red-300">{n}</span>
                <span className="text-muted-foreground text-xs ml-auto">Entering bottom decile</span>
              </div>
            ))}
          </div>
        </div>

        {/* Momentum Composite Ranking */}
        <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Composite Rank</div>
          <div className="space-y-1">
            {sortedByComp.slice(0, 5).map((row, i) => (
              <div key={row.name} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}.</span>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                <span className="text-xs text-foreground flex-1 truncate">{row.name}</span>
                <span className={cn("text-xs font-mono", row.composite >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {fmtPct(row.composite)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Momentum Persistence */}
        <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Momentum Persistence</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Sector momentum typically persists for <span className="text-foreground font-medium">3–6 months</span> before mean-reverting.</p>
            <p>Top-decile sectors outperform by ~<span className="text-emerald-400 font-medium">2.4% / month</span> on average.</p>
            <p>Bottom-decile sectors underperform by ~<span className="text-red-400 font-medium">1.8% / month</span> on average.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SectorTimingDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("cycle");

  // Build all data once (useMemo — PRNG is top-level, so consistent on first render)
  const momentumData = useMemo(() => buildMomentumData(), []);
  const rsData = useMemo(() => buildRSData(), []);
  const econMatrix = useMemo(() => buildEconMatrix(), []);
  const correlations = useMemo(() => buildCorrelations(), []);
  const tacticalData = useMemo(
    () => buildTacticalModel(momentumData, rsData, econMatrix, correlations),
    [momentumData, rsData, econMatrix, correlations],
  );

  const currentPhase = CYCLE_PHASES[CURRENT_PHASE_IDX];

  // Risk-on score based on cross assets
  const riskOnScore = useMemo(() => {
    const riskOnCount = CROSS_ASSETS.filter((a) => a.direction === "risk-on" && a.change > 0).length;
    const riskOffCount = CROSS_ASSETS.filter((a) => a.direction === "risk-off" && a.change > 0).length;
    return (riskOnCount - riskOffCount) / CROSS_ASSETS.length;
  }, []);

  // Sorted RS data
  const rsRanked = useMemo(
    () => [...rsData].sort((a, b) => b.rs12wChange - a.rs12wChange),
    [rsData],
  );

  // Econ confluence
  const econConfluence = useMemo(() => {
    const entries = SECTORS.map((s) => ({
      name: s.name,
      color: s.color,
      ...econMatrix[s.name],
    }));
    return entries.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [econMatrix]);

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Sector Timing Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Business cycle · momentum · relative strength · inter-market analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current phase:</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${currentPhase.color}22`, color: currentPhase.color }}
          >
            {currentPhase.label}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-border/50 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* ── TAB 1: Business Cycle Clock ── */}
          {activeTab === "cycle" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Clock */}
              <div className="flex flex-col items-center gap-3 bg-muted/15 rounded-lg p-4 border border-border/40">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Business Cycle Position
                </div>
                <BusinessCycleClock phaseIdx={CURRENT_PHASE_IDX} phase={currentPhase} />
                <div
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${currentPhase.color}22`, color: currentPhase.color }}
                >
                  {currentPhase.label}
                </div>
              </div>

              {/* Overweight / Underweight */}
              <div className="flex flex-col gap-3">
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">
                    Overweight — {currentPhase.label}
                  </div>
                  <div className="space-y-1.5">
                    {currentPhase.leaders.map((s) => {
                      const sec = SECTORS.find((x) => x.name === s)!;
                      return (
                        <div key={s} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                          <span className="text-foreground">{s}</span>
                          <span className="ml-auto text-muted-foreground text-xs">{sec.etf}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">
                    Underweight — {currentPhase.label}
                  </div>
                  <div className="space-y-1.5">
                    {currentPhase.laggards.map((s) => {
                      const sec = SECTORS.find((x) => x.name === s)!;
                      return (
                        <div key={s} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                          <span className="text-foreground">{s}</span>
                          <span className="ml-auto text-muted-foreground text-xs">{sec.etf}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Historical performance table */}
              <div className="bg-muted/15 rounded-lg p-3 border border-border/40 overflow-x-auto">
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Avg Returns by Cycle Phase (%)
                </div>
                <table className="w-full text-xs min-w-[260px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-1 px-1 text-muted-foreground font-medium">Sector</th>
                      {CYCLE_PHASES.map((p) => (
                        <th
                          key={p.label}
                          className="text-right py-1 px-1 font-medium"
                          style={{ color: p.color }}
                        >
                          {p.short.split(" ")[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SECTORS.map((sec) => {
                      const rets = PHASE_RETURNS[sec.name];
                      return (
                        <tr key={sec.name} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="py-1 px-1 text-muted-foreground truncate max-w-[70px]">{sec.short}</td>
                          {rets.map((r, i) => (
                            <td
                              key={i}
                              className={cn(
                                "py-1 px-1 text-right font-mono font-medium",
                                r >= 8 ? "text-emerald-400" : r >= 3 ? "text-emerald-300/70" : r >= 0 ? "text-muted-foreground" : "text-red-400",
                              )}
                            >
                              {r >= 0 ? "+" : ""}{r.toFixed(1)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 2: Sector Momentum ── */}
          {activeTab === "momentum" && (
            <MomentumSection data={momentumData} />
          )}

          {/* ── TAB 3: Relative Strength ── */}
          {activeTab === "rs" && (
            <div className="space-y-4">
              {/* RS Ranked Table */}
              <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  RS Ranking vs S&P 500 — Strongest to Weakest
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[560px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-2 text-muted-foreground font-medium">Rank</th>
                        <th className="text-left py-2 px-2 text-muted-foreground font-medium">Sector</th>
                        <th className="text-right py-2 px-2 text-muted-foreground font-medium">RS Now</th>
                        <th className="text-right py-2 px-2 text-muted-foreground font-medium">4W Chg</th>
                        <th className="text-right py-2 px-2 text-muted-foreground font-medium">12W Chg</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">Trend</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">Flags</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">RS Line (52W)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsRanked.map((row, i) => (
                        <tr key={row.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-1.5 px-2 text-muted-foreground font-mono">{i + 1}</td>
                          <td className="py-1.5 px-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                              <span className="text-foreground font-medium truncate max-w-[100px]">{row.name}</span>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-foreground">
                            {row.rsNow.toFixed(3)}
                          </td>
                          <td className={cn(
                            "py-1.5 px-2 text-right font-mono",
                            row.rs4wChange >= 0 ? "text-emerald-400" : "text-red-400"
                          )}>
                            {row.rs4wChange >= 0 ? "+" : ""}{row.rs4wChange.toFixed(2)}
                          </td>
                          <td className={cn(
                            "py-1.5 px-2 text-right font-mono",
                            row.rs12wChange >= 0 ? "text-emerald-400" : "text-red-400"
                          )}>
                            {row.rs12wChange >= 0 ? "+" : ""}{row.rs12wChange.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            {row.trend === "rising" && <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mx-auto" />}
                            {row.trend === "falling" && <TrendingDown className="w-3.5 h-3.5 text-red-400 mx-auto" />}
                            {row.trend === "flat" && <Minus className="w-3.5 h-3.5 text-muted-foreground mx-auto" />}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <div className="flex gap-1 justify-center">
                              {row.atNewHigh && (
                                <span className="text-[11px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                                  NEW HIGH
                                </span>
                              )}
                              {row.divergence && (
                                <span className="text-[11px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                                  DIVERGE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-1.5 px-2 flex justify-center">
                            <RSSparkline data={row.rsHistory} color={row.color} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Breakouts + Divergences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">RS Breakouts</span>
                  </div>
                  <div className="space-y-1.5">
                    {rsRanked.filter((r) => r.atNewHigh).length === 0 && (
                      <p className="text-xs text-muted-foreground">No sectors at new RS highs currently.</p>
                    )}
                    {rsRanked.filter((r) => r.atNewHigh).map((row) => (
                      <div key={row.name} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-foreground">{row.name}</span>
                        <span className="text-muted-foreground ml-auto text-xs">
                          RS {row.rsNow.toFixed(3)} — new 52W high
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">RS Divergences</span>
                  </div>
                  <div className="space-y-1.5">
                    {rsRanked.filter((r) => r.divergence).length === 0 && (
                      <p className="text-xs text-muted-foreground">No RS divergences detected.</p>
                    )}
                    {rsRanked.filter((r) => r.divergence).map((row) => (
                      <div key={row.name} className="flex items-center gap-2 text-xs">
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="text-foreground">{row.name}</span>
                        <span className="text-muted-foreground ml-auto text-xs">
                          12W RS low but improving
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: Economic Indicators → Sectors ── */}
          {activeTab === "econ" && (
            <div className="space-y-4">
              {/* Indicator Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ECON_INDICATORS.map((ind) => (
                  <div key={ind.name} className="bg-muted/15 rounded-lg p-3 border border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {ind.shortName}
                      </span>
                      <div className={cn(
                        "flex items-center gap-0.5 text-xs font-semibold",
                        ind.direction === "up" ? "text-emerald-400" : ind.direction === "down" ? "text-red-400" : "text-amber-400",
                      )}>
                        {ind.direction === "up" ? <ArrowUp className="w-3 h-3" /> : ind.direction === "down" ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {ind.direction.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-foreground">{ind.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{ind.name}</div>
                  </div>
                ))}
              </div>

              {/* Signal Matrix */}
              <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Current Signal Matrix — Econ Indicator Impact per Sector
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[560px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-1.5 px-2 text-muted-foreground font-medium w-36">Sector</th>
                        {ECON_INDICATORS.map((ind) => (
                          <th key={ind.shortName} className="text-center py-1.5 px-1 text-muted-foreground font-medium">
                            {ind.shortName}
                          </th>
                        ))}
                        <th className="text-center py-1.5 px-2 text-muted-foreground font-medium">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SECTORS.map((sec) => {
                        const econ = econMatrix[sec.name];
                        return (
                          <tr key={sec.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="py-1.5 px-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                                <span className="text-foreground truncate max-w-[100px]">{sec.name}</span>
                              </div>
                            </td>
                            {ECON_INDICATORS.map((ind) => {
                              const isBull = ind.bullishSectors.includes(sec.name as SectorName);
                              const isBear = ind.bearishSectors.includes(sec.name as SectorName);
                              const isPos = ind.direction === "up" ? isBull : isBear;
                              const isNeg = ind.direction === "up" ? isBear : isBull;
                              return (
                                <td key={ind.shortName} className="py-1.5 px-1 text-center">
                                  {isPos && <span className="text-emerald-400 font-bold">+</span>}
                                  {isNeg && <span className="text-red-400 font-bold">-</span>}
                                  {!isPos && !isNeg && <span className="text-muted-foreground/30">·</span>}
                                </td>
                              );
                            })}
                            <td className="py-1.5 px-2 text-center">
                              <span
                                className={cn(
                                  "text-xs font-bold px-1.5 py-0.5 rounded",
                                  econ.net > 1 ? "bg-emerald-500/20 text-emerald-400" :
                                  econ.net < -1 ? "bg-red-500/20 text-red-400" :
                                  "bg-muted/20 text-muted-foreground",
                                )}
                              >
                                {econ.net > 0 ? "+" : ""}{econ.net}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confluence */}
              <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Signal Confluence — Top Bullish / Bearish Setups
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 mb-1.5">Most Bullish</div>
                    {econConfluence.filter((e) => e.net > 0).slice(0, 4).map((e) => {
                      const sec = SECTORS.find((s) => s.name === e.name)!;
                      return (
                        <div key={e.name} className="flex items-center gap-2 mb-1 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                          <span className="text-foreground flex-1 truncate">{e.name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: e.bullish }).map((_, i) => (
                              <span key={i} className="w-1.5 h-3 rounded-sm bg-emerald-500/60" />
                            ))}
                            {Array.from({ length: e.bearish }).map((_, i) => (
                              <span key={i} className="w-1.5 h-3 rounded-sm bg-red-500/40" />
                            ))}
                          </div>
                          <span className="text-emerald-400 font-mono font-medium text-xs">+{e.net}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-red-400 mb-1.5">Most Bearish</div>
                    {econConfluence.filter((e) => e.net < 0).slice(0, 4).map((e) => {
                      const sec = SECTORS.find((s) => s.name === e.name)!;
                      return (
                        <div key={e.name} className="flex items-center gap-2 mb-1 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                          <span className="text-foreground flex-1 truncate">{e.name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: e.bullish }).map((_, i) => (
                              <span key={i} className="w-1.5 h-3 rounded-sm bg-emerald-500/60" />
                            ))}
                            {Array.from({ length: e.bearish }).map((_, i) => (
                              <span key={i} className="w-1.5 h-3 rounded-sm bg-red-500/40" />
                            ))}
                          </div>
                          <span className="text-red-400 font-mono font-medium text-xs">{e.net}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: Inter-Market Analysis ── */}
          {activeTab === "intermarket" && (
            <div className="space-y-4">
              {/* Cross-asset overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CROSS_ASSETS.map((asset) => (
                  <div key={asset.ticker} className="bg-muted/15 rounded-lg p-3 border border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">{asset.ticker}</span>
                      <span className={cn(
                        "text-[11px] px-1.5 py-0.5 rounded-full font-medium",
                        asset.direction === "risk-on" ? "bg-emerald-500/20 text-emerald-400" :
                        asset.direction === "risk-off" ? "bg-red-500/20 text-red-400" :
                        "bg-muted/20 text-muted-foreground",
                      )}>
                        {asset.direction}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-foreground">{asset.price}</div>
                    <div className={cn(
                      "text-xs font-medium mt-0.5",
                      asset.change >= 0 ? "text-emerald-400" : "text-red-400",
                    )}>
                      {asset.change >= 0 ? "+" : ""}{asset.change.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{asset.name}</div>
                  </div>
                ))}
              </div>

              {/* Risk-On / Risk-Off Barometer */}
              <div className="bg-muted/15 rounded-lg p-4 border border-border/40">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Risk-On / Risk-Off Barometer
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <RiskBarometer score={riskOnScore} />
                  <div className="flex-1 space-y-2 text-xs text-muted-foreground">
                    <p>
                      Current composite reading:{" "}
                      <span className={cn(
                        "font-semibold",
                        riskOnScore > 0.2 ? "text-emerald-400" : riskOnScore < -0.2 ? "text-red-400" : "text-amber-400",
                      )}>
                        {riskOnScore > 0.2 ? "Risk-On" : riskOnScore < -0.2 ? "Risk-Off" : "Neutral"}
                      </span>
                      {" "}({(riskOnScore * 100).toFixed(0)}% score)
                    </p>
                    <p>VIX below 18 signals low fear. HY spreads tightening supports equity upside.</p>
                    <p>
                      Risk-on environment favors{" "}
                      <span className="text-foreground">Technology, Financials, Consumer Discretionary</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cross-Asset Correlations Table */}
              <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Sector Correlations vs Cross Assets
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[480px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-2 text-muted-foreground font-medium w-36">Sector</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">Bonds</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">Gold</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">Oil</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">Dollar</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium">HY Bonds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correlations.map((row) => {
                        const sec = SECTORS.find((s) => s.name === row.name)!;
                        return (
                          <tr key={row.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="py-1.5 px-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                                <span className="text-foreground truncate max-w-[110px]">{row.name}</span>
                              </div>
                            </td>
                            {[row.bonds, row.gold, row.oil, row.dollar, row.hy].map((v, i) => (
                              <td key={i} className={cn("py-1.5 px-2 text-center font-mono text-xs", corrColor(v))}>
                                {v.toFixed(2)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dollar & Oil impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Strong Dollar Impact</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-red-300">
                      <ArrowDown className="w-3 h-3 flex-shrink-0" />
                      <span>Hurts: Materials, Energy, Industrials (weaker exports)</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300">
                      <ArrowUp className="w-3 h-3 flex-shrink-0" />
                      <span>Helps: Financials, Consumer Staples (domestic focus)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Oil Price Impact</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <ArrowUp className="w-3 h-3 flex-shrink-0" />
                      <span>Helps: Energy (+0.78), Materials (+0.54 corr)</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-300">
                      <ArrowDown className="w-3 h-3 flex-shrink-0" />
                      <span>Hurts: Consumer Discretionary, Airlines, Industrials</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: Tactical Allocation Model ── */}
          {activeTab === "tactical" && (
            <div className="space-y-4">
              {/* Summary chips */}
              <div className="flex flex-wrap gap-2">
                {(["Overweight", "Neutral", "Underweight"] as Stance[]).map((stance) => {
                  const count = tacticalData.filter((r) => r.stance === stance).length;
                  return (
                    <div
                      key={stance}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                        stance === "Overweight" ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5" :
                        stance === "Underweight" ? "border-red-500/40 text-red-400 bg-red-500/5" :
                        "border-foreground/15 text-muted-foreground bg-foreground/5",
                      )}
                    >
                      {stance}: {count} sectors
                    </div>
                  );
                })}
              </div>

              {/* Main table */}
              <div className="bg-muted/15 rounded-lg p-3 border border-border/40 overflow-x-auto">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Factor Model — Combined Signal Scores
                </div>
                <table className="w-full text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium w-36">Sector</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Mom</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Econ</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">RS</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">X-Asset</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Composite</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Stance</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Confidence</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Alloc %</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Alpha (hist)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tacticalData
                      .slice()
                      .sort((a, b) => b.composite - a.composite)
                      .map((row) => {
                        function scoreCell(v: number) {
                          return (
                            <span className={cn(
                              "inline-block w-10 text-center font-mono font-medium",
                              v >= 1 ? "text-emerald-400" : v <= -1 ? "text-red-400" : "text-muted-foreground",
                            )}>
                              {v >= 0 ? "+" : ""}{v.toFixed(1)}
                            </span>
                          );
                        }
                        return (
                          <tr key={row.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="py-1.5 px-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                                <span className="text-foreground font-medium truncate max-w-[100px]">{row.name}</span>
                              </div>
                            </td>
                            <td className="py-1.5 px-2 text-center">{scoreCell(row.momentumScore)}</td>
                            <td className="py-1.5 px-2 text-center">{scoreCell(row.econScore)}</td>
                            <td className="py-1.5 px-2 text-center">{scoreCell(row.rsScore)}</td>
                            <td className="py-1.5 px-2 text-center">{scoreCell(row.interMarketScore)}</td>
                            <td className="py-1.5 px-2 text-center">
                              <span className={cn(
                                "font-mono font-bold",
                                row.composite >= 0.8 ? "text-emerald-400" : row.composite <= -0.5 ? "text-red-400" : "text-amber-400",
                              )}>
                                {row.composite >= 0 ? "+" : ""}{row.composite.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded font-medium",
                                stanceColor(row.stance),
                              )}>
                                {row.stance}
                              </span>
                            </td>
                            <td className={cn("py-1.5 px-2 text-center text-xs font-semibold", confColor(row.confidence))}>
                              {row.confidence}
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              <div className="flex items-center gap-1.5 justify-end">
                                <div className="w-16 bg-foreground/10 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${(row.allocationPct / 18) * 100}%`,
                                      backgroundColor: row.color,
                                      opacity: 0.8,
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-foreground">{row.allocationPct}%</span>
                              </div>
                            </td>
                            <td className={cn(
                              "py-1.5 px-2 text-right font-mono text-xs",
                              row.historicalAlpha >= 0 ? "text-emerald-400" : "text-red-400",
                            )}>
                              {row.historicalAlpha >= 0 ? "+" : ""}{row.historicalAlpha.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Model notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Model Methodology
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Momentum (25%): weighted 1W–12M composite</li>
                    <li>• Economic regime (25%): econ indicator net score</li>
                    <li>• Relative strength (25%): RS trend vs S&P 500</li>
                    <li>• Inter-market (25%): HY/bond/dollar correlations</li>
                  </ul>
                </div>
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Model vs Equal-Weight
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg annual alpha</span>
                      <span className="text-emerald-400 font-medium">+3.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win rate (monthly)</span>
                      <span className="text-emerald-400 font-medium">61.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max drawdown (model)</span>
                      <span className="text-amber-400 font-medium">-14.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max drawdown (EW)</span>
                      <span className="text-red-400 font-medium">-22.3%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/15 rounded-lg p-3 border border-border/40">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Top Conviction
                  </div>
                  <div className="space-y-1.5">
                    {tacticalData
                      .filter((r) => r.confidence === "High" && r.stance === "Overweight")
                      .slice(0, 3)
                      .map((r) => (
                        <div key={r.name} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="text-foreground flex-1 truncate">{r.name}</span>
                          <span className="text-emerald-400 font-mono">{r.allocationPct}%</span>
                        </div>
                      ))}
                    {tacticalData.filter((r) => r.confidence === "High" && r.stance === "Overweight").length === 0 && (
                      <p className="text-xs text-muted-foreground">No high-conviction overweights currently.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Simulated data for educational purposes only. Not investment advice.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BarChart2 className="w-3 h-3" />
          <span>Updated: Mar 28, 2026</span>
        </div>
      </div>
    </div>
  );
}
