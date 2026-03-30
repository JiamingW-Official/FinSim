"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Activity,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 42;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 42;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CentralBank {
  name: string;
  shortName: string;
  country: string;
  rate: number;
  lastChange: "hike" | "cut" | "hold";
  lastChangeBps: number;
  nextMeeting: string;
  stance: "hawkish" | "dovish" | "neutral";
  inflation: number;
  realRate: number;
  flag: string;
}

interface YieldPoint {
  tenor: string;
  months: number;
  current: number;
  threeMonthsAgo: number;
  oneYearAgo: number;
}

interface DotPlotPoint {
  member: number;
  year: "2024" | "2025" | "2026" | "long-run";
  rate: number;
}

interface BalanceSheetPoint {
  year: number;
  treasuries: number;
  mbs: number;
  other: number;
}

interface FedFuturesPoint {
  meeting: string;
  impliedRate: number;
  probCut: number;
  probHold: number;
  probHike: number;
}

// ── Static data ───────────────────────────────────────────────────────────────

const CENTRAL_BANKS: CentralBank[] = [
  {
    name: "Federal Reserve",
    shortName: "Fed",
    country: "USA",
    rate: 5.375,
    lastChange: "hold",
    lastChangeBps: 0,
    nextMeeting: "May 7, 2026",
    stance: "hawkish",
    inflation: 3.2,
    realRate: 2.175,
    flag: "🇺🇸",
  },
  {
    name: "European Central Bank",
    shortName: "ECB",
    country: "Eurozone",
    rate: 3.65,
    lastChange: "cut",
    lastChangeBps: -25,
    nextMeeting: "Apr 17, 2026",
    stance: "dovish",
    inflation: 2.6,
    realRate: 1.05,
    flag: "🇪🇺",
  },
  {
    name: "Bank of Japan",
    shortName: "BOJ",
    country: "Japan",
    rate: 0.5,
    lastChange: "hike",
    lastChangeBps: 25,
    nextMeeting: "Apr 30, 2026",
    stance: "hawkish",
    inflation: 3.1,
    realRate: -2.6,
    flag: "🇯🇵",
  },
  {
    name: "Bank of England",
    shortName: "BOE",
    country: "UK",
    rate: 4.5,
    lastChange: "cut",
    lastChangeBps: -25,
    nextMeeting: "May 8, 2026",
    stance: "neutral",
    inflation: 3.5,
    realRate: 1.0,
    flag: "🇬🇧",
  },
  {
    name: "People's Bank of China",
    shortName: "PBOC",
    country: "China",
    rate: 3.1,
    lastChange: "cut",
    lastChangeBps: -10,
    nextMeeting: "Apr 20, 2026",
    stance: "dovish",
    inflation: 0.4,
    realRate: 2.7,
    flag: "🇨🇳",
  },
  {
    name: "Reserve Bank of Australia",
    shortName: "RBA",
    country: "Australia",
    rate: 4.1,
    lastChange: "cut",
    lastChangeBps: -25,
    nextMeeting: "May 20, 2026",
    stance: "neutral",
    inflation: 3.4,
    realRate: 0.7,
    flag: "🇦🇺",
  },
  {
    name: "Bank of Canada",
    shortName: "BOC",
    country: "Canada",
    rate: 2.75,
    lastChange: "cut",
    lastChangeBps: -25,
    nextMeeting: "Apr 16, 2026",
    stance: "dovish",
    inflation: 2.8,
    realRate: -0.05,
    flag: "🇨🇦",
  },
  {
    name: "Swiss National Bank",
    shortName: "SNB",
    country: "Switzerland",
    rate: 0.25,
    lastChange: "cut",
    lastChangeBps: -25,
    nextMeeting: "Jun 19, 2026",
    stance: "dovish",
    inflation: 0.3,
    realRate: -0.05,
    flag: "🇨🇭",
  },
];

// 12-month heatmap data (H=hike, C=cut, X=hold)
// Each row: 12 months ending March 2026 (Apr25..Mar26)
const RATE_HEATMAP: Record<string, ("H" | "C" | "X")[]> = {
  Fed:  ["X","X","X","X","X","X","X","X","X","X","X","X"],
  ECB:  ["X","C","X","C","X","C","X","C","X","C","X","C"],
  BOJ:  ["X","H","X","X","X","H","X","X","X","X","X","X"],
  BOE:  ["X","C","X","X","C","X","X","C","X","X","C","X"],
  PBOC: ["C","X","C","X","X","X","C","X","X","C","X","X"],
  RBA:  ["X","X","X","X","X","X","C","X","X","X","C","X"],
  BOC:  ["C","C","X","C","C","X","C","X","C","C","X","C"],
  SNB:  ["X","C","X","X","C","X","X","C","X","X","X","C"],
};

const HEATMAP_MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const YIELD_CURVE: YieldPoint[] = [
  { tenor: "3M", months: 3,   current: 5.30, threeMonthsAgo: 5.32, oneYearAgo: 5.25 },
  { tenor: "6M", months: 6,   current: 5.20, threeMonthsAgo: 5.28, oneYearAgo: 5.18 },
  { tenor: "1Y", months: 12,  current: 5.05, threeMonthsAgo: 5.15, oneYearAgo: 4.95 },
  { tenor: "2Y", months: 24,  current: 4.72, threeMonthsAgo: 4.85, oneYearAgo: 4.60 },
  { tenor: "5Y", months: 60,  current: 4.35, threeMonthsAgo: 4.50, oneYearAgo: 4.15 },
  { tenor: "10Y",months: 120, current: 4.30, threeMonthsAgo: 4.48, oneYearAgo: 4.00 },
  { tenor: "30Y",months: 360, current: 4.55, threeMonthsAgo: 4.65, oneYearAgo: 4.25 },
];

const BALANCE_SHEET_DATA: BalanceSheetPoint[] = [
  { year: 2008, treasuries: 0.48, mbs: 0.0,  other: 0.44 },
  { year: 2009, treasuries: 0.77, mbs: 0.90, other: 0.33 },
  { year: 2010, treasuries: 1.0,  mbs: 1.08, other: 0.24 },
  { year: 2011, treasuries: 1.65, mbs: 0.89, other: 0.18 },
  { year: 2012, treasuries: 1.66, mbs: 0.92, other: 0.17 },
  { year: 2013, treasuries: 2.18, mbs: 1.37, other: 0.17 },
  { year: 2014, treasuries: 2.46, mbs: 1.72, other: 0.18 },
  { year: 2015, treasuries: 2.46, mbs: 1.75, other: 0.20 },
  { year: 2016, treasuries: 2.46, mbs: 1.77, other: 0.20 },
  { year: 2017, treasuries: 2.45, mbs: 1.78, other: 0.20 },
  { year: 2018, treasuries: 2.20, mbs: 1.65, other: 0.18 },
  { year: 2019, treasuries: 2.08, mbs: 1.48, other: 0.17 },
  { year: 2020, treasuries: 4.69, mbs: 2.06, other: 0.45 },
  { year: 2021, treasuries: 5.77, mbs: 2.63, other: 0.30 },
  { year: 2022, treasuries: 5.67, mbs: 2.72, other: 0.26 },
  { year: 2023, treasuries: 4.88, mbs: 2.42, other: 0.22 },
  { year: 2024, treasuries: 4.52, mbs: 2.25, other: 0.21 },
];

const FED_FUTURES: FedFuturesPoint[] = [
  { meeting: "May '26",  impliedRate: 5.375, probCut: 5,  probHold: 88, probHike: 7  },
  { meeting: "Jun '26",  impliedRate: 5.25,  probCut: 42, probHold: 54, probHike: 4  },
  { meeting: "Jul '26",  impliedRate: 5.125, probCut: 55, probHold: 42, probHike: 3  },
  { meeting: "Sep '26",  impliedRate: 5.0,   probCut: 65, probHold: 33, probHike: 2  },
  { meeting: "Nov '26",  impliedRate: 4.875, probCut: 58, probHold: 40, probHike: 2  },
  { meeting: "Dec '26",  impliedRate: 4.75,  probCut: 52, probHold: 46, probHike: 2  },
];

// Dot plot: 18 FOMC members, 4 horizons
function generateDotPlot(): DotPlotPoint[] {
  resetSeed();
  const dots: DotPlotPoint[] = [];
  const yearProjections: Record<string, number[]> = {
    "2024": [5.375, 5.375, 5.375, 5.125, 5.125, 5.125, 5.375, 5.375, 5.125, 4.875, 5.375, 5.125, 5.375, 4.875, 5.125, 5.375, 5.375, 5.125],
    "2025": [4.625, 4.375, 4.375, 4.125, 4.125, 4.375, 4.625, 4.375, 4.125, 3.875, 4.625, 4.375, 4.625, 3.875, 4.125, 4.625, 4.375, 4.125],
    "2026": [3.625, 3.375, 3.375, 3.125, 3.125, 3.375, 3.625, 3.375, 3.125, 2.875, 3.625, 3.375, 3.625, 2.875, 3.125, 3.625, 3.375, 3.125],
    "long-run": [2.875, 2.625, 2.625, 2.875, 2.875, 2.625, 2.875, 2.875, 2.625, 2.875, 2.625, 2.875, 2.875, 2.625, 2.875, 2.875, 2.625, 2.875],
  };
  (["2024", "2025", "2026", "long-run"] as const).forEach((year) => {
    yearProjections[year].forEach((rate, i) => {
      dots.push({ member: i, year, rate });
    });
  });
  return dots;
}

// ── Helper components ─────────────────────────────────────────────────────────

function StanceChip({ stance }: { stance: "hawkish" | "dovish" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs text-muted-foreground font-semibold uppercase tracking-wide",
        stance === "hawkish" && "bg-red-500/15 text-red-400",
        stance === "dovish" && "bg-emerald-500/15 text-emerald-400",
        stance === "neutral" && "bg-yellow-500/15 text-yellow-400",
      )}
    >
      {stance}
    </span>
  );
}

function ChangeChip({ dir, bps }: { dir: "hike" | "cut" | "hold"; bps: number }) {
  if (dir === "hold") return <span className="text-muted-foreground text-xs">Hold</span>;
  const isHike = dir === "hike";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isHike ? "text-red-400" : "text-emerald-400")}>
      {isHike ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(bps)}bps
    </span>
  );
}

// ── Section: Fed Policy Dashboard ─────────────────────────────────────────────

function FedPolicyDashboard() {
  const dotPlot = useMemo(() => generateDotPlot(), []);
  const spread2y10y = YIELD_CURVE[5].current - YIELD_CURVE[3].current;
  const spread3m10y = YIELD_CURVE[5].current - YIELD_CURVE[0].current;

  // Dual mandate gauge helper
  function GaugeArc({
    label,
    value,
    max,
    target,
    color,
    unit,
  }: {
    label: string;
    value: number;
    max: number;
    target: number;
    color: string;
    unit: string;
  }) {
    const pct = Math.min(value / max, 1);
    const targetPct = Math.min(target / max, 1);
    const r = 52;
    const cx = 70;
    const cy = 70;
    const startAngle = -200;
    const sweep = 220;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const arc = (angle: number) => {
      const a = toRad(startAngle + angle * sweep);
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };
    const trackEnd = arc(1);
    const trackStart = arc(0);
    const fillEnd = arc(pct);
    const targetPos = arc(targetPct);
    const largeArc0 = sweep > 180 ? 1 : 0;
    const largeArcFill = pct * sweep > 180 ? 1 : 0;
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={140} height={100} viewBox="0 0 140 100">
          <path
            d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArc0} 1 ${trackEnd.x} ${trackEnd.y}`}
            fill="none"
            stroke="rgb(var(--muted))"
            strokeWidth={8}
            strokeLinecap="round"
          />
          {pct > 0 && (
            <path
              d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArcFill} 1 ${fillEnd.x} ${fillEnd.y}`}
              fill="none"
              stroke={color}
              strokeWidth={8}
              strokeLinecap="round"
            />
          )}
          <circle cx={targetPos.x} cy={targetPos.y} r={4} fill="white" opacity={0.6} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={18} fontWeight={700} fill="currentColor" className="fill-foreground">
            {value}{unit}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize={9} fill="currentColor" className="fill-muted-foreground">
            target: {target}{unit}
          </text>
        </svg>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    );
  }

  // Dot plot SVG
  const dotsByYear: Record<string, number[]> = { "2024": [], "2025": [], "2026": [], "long-run": [] };
  dotPlot.forEach((d) => dotsByYear[d.year].push(d.rate));

  const years = ["2024", "2025", "2026", "long-run"] as const;
  const svgW = 520;
  const svgH = 200;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const rateMin = 2.5;
  const rateMax = 5.75;
  const toY = (r: number) => padT + ((rateMax - r) / (rateMax - rateMin)) * (svgH - padT - padB);
  const colW = (svgW - padL - padR) / 4;

  // Balance sheet area chart
  const bsW = 560;
  const bsH = 160;
  const bsPadL = 44;
  const bsPadR = 12;
  const bsPadT = 12;
  const bsPadB = 28;
  const bsYears = BALANCE_SHEET_DATA.map((d) => d.year);
  const bsMaxVal = 9; // $9T max
  const bsToX = (yr: number) =>
    bsPadL + ((yr - bsYears[0]) / (bsYears[bsYears.length - 1] - bsYears[0])) * (bsW - bsPadL - bsPadR);
  const bsToY = (v: number) => bsPadT + ((bsMaxVal - v) / bsMaxVal) * (bsH - bsPadT - bsPadB);

  function makeAreaPath(
    data: BalanceSheetPoint[],
    topFn: (d: BalanceSheetPoint) => number,
    botFn: (d: BalanceSheetPoint) => number,
  ) {
    const top = data.map((d) => `${bsToX(d.year)},${bsToY(topFn(d))}`).join(" L ");
    const botRev = [...data].reverse().map((d) => `${bsToX(d.year)},${bsToY(botFn(d))}`).join(" L ");
    return `M ${top} L ${botRev} Z`;
  }

  const otherPath = makeAreaPath(
    BALANCE_SHEET_DATA,
    (d) => d.treasuries + d.mbs + d.other,
    (d) => d.treasuries + d.mbs,
  );
  const mbsPath = makeAreaPath(
    BALANCE_SHEET_DATA,
    (d) => d.treasuries + d.mbs,
    (d) => d.treasuries,
  );
  const treasuriesPath = makeAreaPath(
    BALANCE_SHEET_DATA,
    (d) => d.treasuries,
    () => 0,
  );

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Fed Funds Rate", value: "5.25–5.50%", sub: "Target Range", color: "text-primary" },
          { label: "Next Meeting", value: "May 7", sub: "2026 · 7 weeks away", color: "text-foreground" },
          { label: "QT Pace", value: "$60B/mo", sub: "Rolling off balance sheet", color: "text-amber-400" },
          { label: "Core PCE", value: "3.2%", sub: "vs 2.0% target", color: "text-red-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className={cn("mt-0.5 text-xl font-bold tabular-nums", item.color)}>{item.value}</p>
            <p className="text-xs text-muted-foreground/60">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Dual mandate gauges */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-4 text-sm font-semibold">Fed Dual Mandate</h3>
        <div className="flex flex-wrap justify-around gap-4">
          <GaugeArc label="PCE Inflation" value={3.2} max={6} target={2} color="#f87171" unit="%" />
          <GaugeArc label="Unemployment (U3)" value={4.1} max={10} target={4.0} color="#34d399" unit="%" />
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-[100px] w-[140px] flex-col items-center justify-center gap-2 rounded-lg bg-muted/20">
              <span className="text-2xl font-bold text-amber-400">1.2%</span>
              <span className="text-xs text-muted-foreground">GDP Growth (QoQ ann.)</span>
              <span className="text-xs text-muted-foreground/60">Trend: 2.0%</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Real GDP</span>
          </div>
        </div>
      </div>

      {/* Dot Plot */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">FOMC Dot Plot — Rate Projections</h3>
          <span className="text-xs text-muted-foreground">18 members · Mar 2026 SEP</span>
        </div>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="min-w-[400px]">
            {/* Y gridlines */}
            {[2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5].map((r) => (
              <g key={r}>
                <line x1={padL} x2={svgW - padR} y1={toY(r)} y2={toY(r)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
                <text x={padL - 6} y={toY(r) + 4} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.5}>
                  {r.toFixed(1)}%
                </text>
              </g>
            ))}
            {/* Column labels */}
            {years.map((yr, ci) => {
              const cx = padL + ci * colW + colW / 2;
              return (
                <text key={yr} x={cx} y={svgH - 8} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>
                  {yr === "long-run" ? "Long Run" : yr}
                </text>
              );
            })}
            {/* Median lines */}
            {years.map((yr, ci) => {
              const vals = [...dotsByYear[yr]].sort((a, b) => a - b);
              const median = vals[Math.floor(vals.length / 2)];
              const cx = padL + ci * colW + colW / 2;
              return (
                <line
                  key={`med-${yr}`}
                  x1={cx - 14}
                  x2={cx + 14}
                  y1={toY(median)}
                  y2={toY(median)}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  opacity={0.9}
                />
              );
            })}
            {/* Dots — jitter within column */}
            {dotPlot.map((d, i) => {
              const ci = years.indexOf(d.year);
              const jitter = ((i % 6) - 2.5) * 5;
              const cx = padL + ci * colW + colW / 2 + jitter;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={toY(d.rate)}
                  r={4}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.7}
                  stroke="hsl(var(--primary))"
                  strokeOpacity={0.3}
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-primary" /> Median projection
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary/60" /> Individual member
          </span>
        </div>
      </div>

      {/* Fed Balance Sheet */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Fed Balance Sheet 2008–2024</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-primary/70" />Treasuries</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-emerald-500/60" />MBS</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-amber-500/50" />Other</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <svg width={bsW} height={bsH} viewBox={`0 0 ${bsW} ${bsH}`} className="min-w-[400px]">
            {/* Y gridlines */}
            {[0, 2, 4, 6, 8].map((v) => (
              <g key={v}>
                <line x1={bsPadL} x2={bsW - bsPadR} y1={bsToY(v)} y2={bsToY(v)} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
                <text x={bsPadL - 4} y={bsToY(v) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.45}>
                  ${v}T
                </text>
              </g>
            ))}
            {/* QE labels */}
            {[
              { yr: 2009, label: "QE1" },
              { yr: 2011, label: "QE2" },
              { yr: 2013, label: "QE3" },
              { yr: 2020, label: "COVID QE" },
              { yr: 2022, label: "QT" },
            ].map(({ yr, label }) => (
              <g key={label}>
                <line
                  x1={bsToX(yr)}
                  x2={bsToX(yr)}
                  y1={bsPadT}
                  y2={bsH - bsPadB}
                  stroke="currentColor"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <text x={bsToX(yr) + 3} y={bsPadT + 10} fontSize={8} fill="currentColor" opacity={0.4}>
                  {label}
                </text>
              </g>
            ))}
            {/* Area paths */}
            <path d={treasuriesPath} fill="rgb(59,130,246)" fillOpacity={0.55} />
            <path d={mbsPath} fill="rgb(52,211,153)" fillOpacity={0.5} />
            <path d={otherPath} fill="rgb(251,191,36)" fillOpacity={0.45} />
            {/* X axis ticks */}
            {[2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024].map((yr) => (
              <text key={yr} x={bsToX(yr)} y={bsH - 8} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4}>
                {yr}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* QT Pace Meter */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-medium">Quantitative Tightening Pace</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="text-muted-foreground">Monthly Roll-Off</span>
              <span className="font-medium text-amber-400">$60B / month</span>
            </div>
            <div className="h-3 rounded-full bg-muted/30">
              <motion.div
                className="h-full rounded-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground/50">
              <span>$0</span>
              <span>Max $100B</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Treasuries cap:</span>
              <span className="font-medium">$35B/mo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-muted-foreground">MBS cap:</span>
              <span className="font-medium">$25B/mo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <span className="text-muted-foreground">Since Jun 2022</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section: Global Central Banks ─────────────────────────────────────────────

function GlobalCentralBanks() {
  const [sortBy, setSortBy] = useState<"rate" | "realRate" | "inflation">("rate");

  const sorted = useMemo(
    () => [...CENTRAL_BANKS].sort((a, b) => b[sortBy] - a[sortBy]),
    [sortBy],
  );

  return (
    <div className="space-y-4">
      {/* Cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Central Bank Snapshot</h3>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5 text-xs text-muted-foreground">
            {(["rate", "realRate", "inflation"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={cn(
                  "rounded px-2 py-0.5 transition-colors",
                  sortBy === k ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {k === "rate" ? "Rate" : k === "realRate" ? "Real Rate" : "CPI"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((bank, i) => (
              <motion.div
                key={bank.shortName}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-lg border border-border bg-card/60 p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{bank.flag}</span>
                    <div>
                      <p className="text-[11px] font-medium">{bank.shortName}</p>
                      <p className="text-[11px] text-muted-foreground">{bank.country}</p>
                    </div>
                  </div>
                  <StanceChip stance={bank.stance} />
                </div>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-lg font-medium tabular-nums">{bank.rate.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <ChangeChip dir={bank.lastChange} bps={bank.lastChangeBps} />
                  <span className="text-muted-foreground/60">{bank.nextMeeting}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 rounded bg-muted/20 p-1.5 text-xs text-muted-foreground">
                  <div>
                    <span className="text-muted-foreground/60">Inflation</span>
                    <p className="font-medium text-red-400">{bank.inflation}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60">Real Rate</span>
                    <p className={cn("font-medium", bank.realRate >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {bank.realRate >= 0 ? "+" : ""}{bank.realRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Rate Decision Heatmap */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Rate Decision Heatmap (Apr 25 – Mar 26)</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-red-500/60" />Hike</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-emerald-500/60" />Cut</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-muted/40" />Hold</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs text-muted-foreground">
            <thead>
              <tr>
                <th className="w-12 pb-1 pr-2 text-left text-muted-foreground/60">Bank</th>
                {HEATMAP_MONTHS.map((m) => (
                  <th key={m} className="pb-1 text-center font-normal text-muted-foreground/60">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(RATE_HEATMAP).map(([bank, decisions]) => (
                <tr key={bank}>
                  <td className="py-0.5 pr-2 font-medium text-muted-foreground">{bank}</td>
                  {decisions.map((d, mi) => (
                    <td key={mi} className="py-0.5 text-center">
                      <span
                        className={cn(
                          "inline-flex h-5 w-7 items-center justify-center rounded text-[11px] font-medium",
                          d === "H" && "bg-red-500/20 text-red-400",
                          d === "C" && "bg-emerald-500/20 text-emerald-400",
                          d === "X" && "bg-muted/20 text-muted-foreground/40",
                        )}
                      >
                        {d === "H" ? "↑" : d === "C" ? "↓" : "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Rate Comparison Bar Chart */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-medium">Real Interest Rates (Nominal − Inflation)</h3>
        <div className="space-y-2">
          {[...CENTRAL_BANKS]
            .sort((a, b) => b.realRate - a.realRate)
            .map((bank) => {
              const maxReal = 3.5;
              const pct = (Math.abs(bank.realRate) / maxReal) * 100;
              const positive = bank.realRate >= 0;
              return (
                <div key={bank.shortName} className="flex items-center gap-2 text-[11px]">
                  <span className="w-8 text-muted-foreground/70">{bank.flag}</span>
                  <span className="w-8 font-medium">{bank.shortName}</span>
                  <div className="flex flex-1 items-center gap-1">
                    <div className="relative h-4 flex-1 overflow-hidden rounded-sm bg-muted/20">
                      {positive ? (
                        <div
                          className="absolute left-0 top-0 h-full rounded-sm bg-emerald-500/50"
                          style={{ width: `${pct}%` }}
                        />
                      ) : (
                        <div
                          className="absolute right-0 top-0 h-full rounded-sm bg-red-500/50"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                    </div>
                    <span className={cn("w-12 text-right font-medium tabular-nums", positive ? "text-emerald-400" : "text-red-400")}>
                      {positive ? "+" : ""}{bank.realRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ── Section: Yield Curve Analysis ─────────────────────────────────────────────

function YieldCurveAnalysis() {
  const [selectedTenor, setSelectedTenor] = useState<string | null>(null);

  const spread2y10y = YIELD_CURVE[5].current - YIELD_CURVE[3].current;
  const spread3m10y = YIELD_CURVE[5].current - YIELD_CURVE[0].current;
  const is2y10yInverted = spread2y10y < 0;
  const is3m10yInverted = spread3m10y < 0;

  const selected = YIELD_CURVE.find((y) => y.tenor === selectedTenor);

  // Build SVG yield curve
  const svgW = 520;
  const svgH = 180;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const rateMin = 4.0;
  const rateMax = 5.5;

  const tenorPositions = YIELD_CURVE.map((_, i) => padL + (i / (YIELD_CURVE.length - 1)) * (svgW - padL - padR));
  const toY = (r: number) => padT + ((rateMax - r) / (rateMax - rateMin)) * (svgH - padT - padB);

  function buildLinePath(key: "current" | "threeMonthsAgo" | "oneYearAgo") {
    return YIELD_CURVE.map((pt, i) => `${i === 0 ? "M" : "L"} ${tenorPositions[i]} ${toY(pt[key])}`).join(" ");
  }

  // 24-month FF vs 10yr
  resetSeed();
  const ffVs10yrData = useMemo(() => {
    let ff = 5.375;
    let yr10 = 3.8;
    return Array.from({ length: 24 }, (_, i) => {
      ff += (rand() - 0.52) * 0.05;
      yr10 += (rand() - 0.48) * 0.07;
      const mo = new Date(2024, 3 + i);
      return {
        label: mo.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        ff: Math.max(4.5, Math.min(5.6, ff)),
        yr10: Math.max(3.7, Math.min(4.8, yr10)),
      };
    });
  }, []);

  const ffW = 520;
  const ffH = 120;
  const ffPadL = 40;
  const ffPadR = 12;
  const ffPadT = 10;
  const ffPadB = 28;
  const ffMin = 3.5;
  const ffMax = 6.0;
  const ffToX = (i: number) => ffPadL + (i / (ffVs10yrData.length - 1)) * (ffW - ffPadL - ffPadR);
  const ffToY = (v: number) => ffPadT + ((ffMax - v) / (ffMax - ffMin)) * (ffH - ffPadT - ffPadB);

  function buildFFPath(key: "ff" | "yr10") {
    return ffVs10yrData.map((d, i) => `${i === 0 ? "M" : "L"} ${ffToX(i)} ${ffToY(d[key])}`).join(" ");
  }

  return (
    <div className="space-y-4">
      {/* Inversion alerts */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "2Y–10Y Spread", value: spread2y10y, inverted: is2y10yInverted },
          { label: "3M–10Y Spread", value: spread3m10y, inverted: is3m10yInverted },
        ].map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-between rounded-lg border p-3",
              item.inverted
                ? "border-red-500/40 bg-red-500/5 animate-pulse"
                : "border-border bg-card/60",
            )}
          >
            <div>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className={cn("text-lg font-medium tabular-nums", item.inverted ? "text-red-400" : "text-emerald-400")}>
                {item.value >= 0 ? "+" : ""}{item.value.toFixed(2)}%
              </p>
            </div>
            {item.inverted ? (
              <div className="flex flex-col items-end">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="mt-0.5 text-[11px] font-medium uppercase text-red-400">Inverted</span>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <Activity className="h-5 w-5 text-emerald-400" />
                <span className="mt-0.5 text-[11px] font-medium uppercase text-emerald-400">Normal</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Yield curve chart */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">US Treasury Yield Curve</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-primary" />Current</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-amber-400" />3M Ago</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-muted-foreground/50" />1Y Ago</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="min-w-[400px]">
            {/* Gridlines */}
            {[4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5].map((r) => (
              <g key={r}>
                <line x1={padL} x2={svgW - padR} y1={toY(r)} y2={toY(r)} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
                <text x={padL - 4} y={toY(r) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.45}>
                  {r.toFixed(2)}
                </text>
              </g>
            ))}
            {/* Tenor labels */}
            {YIELD_CURVE.map((pt, i) => (
              <text key={pt.tenor} x={tenorPositions[i]} y={svgH - 8} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.5}>
                {pt.tenor}
              </text>
            ))}
            {/* 1Y ago line */}
            <path d={buildLinePath("oneYearAgo")} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="4,3" />
            {/* 3M ago line */}
            <path d={buildLinePath("threeMonthsAgo")} fill="none" stroke="rgb(251,191,36)" strokeOpacity={0.6} strokeWidth={1.5} />
            {/* Current line */}
            <path d={buildLinePath("current")} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
            {/* Clickable dots */}
            {YIELD_CURVE.map((pt, i) => (
              <circle
                key={pt.tenor}
                cx={tenorPositions[i]}
                cy={toY(pt.current)}
                r={selectedTenor === pt.tenor ? 6 : 4}
                fill={selectedTenor === pt.tenor ? "hsl(var(--primary))" : "hsl(var(--background))"}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                className="cursor-pointer"
                onClick={() => setSelectedTenor(selectedTenor === pt.tenor ? null : pt.tenor)}
              />
            ))}
          </svg>
        </div>

        {/* Selected tenor detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="rounded-lg bg-muted/20 p-3 text-[11px]">
                <p className="mb-2 font-medium">{selected.tenor} Treasury Note</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted-foreground/60">Current</span>
                    <p className="font-medium text-primary">{selected.current.toFixed(2)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60">3M Ago</span>
                    <p className={cn("font-medium", selected.current > selected.threeMonthsAgo ? "text-emerald-400" : "text-red-400")}>
                      {selected.threeMonthsAgo.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground/60">1Y Ago</span>
                    <p className={cn("font-medium", selected.current > selected.oneYearAgo ? "text-emerald-400" : "text-red-400")}>
                      {selected.oneYearAgo.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-muted-foreground/60">3M Change:</span>
                  <span className={cn("font-medium", selected.current - selected.threeMonthsAgo >= 0 ? "text-red-400" : "text-emerald-400")}>
                    {(selected.current - selected.threeMonthsAgo >= 0 ? "+" : "")}{((selected.current - selected.threeMonthsAgo) * 100).toFixed(0)}bps
                  </span>
                  <span className="text-muted-foreground/60">YoY Change:</span>
                  <span className={cn("font-medium", selected.current - selected.oneYearAgo >= 0 ? "text-red-400" : "text-emerald-400")}>
                    {(selected.current - selected.oneYearAgo >= 0 ? "+" : "")}{((selected.current - selected.oneYearAgo) * 100).toFixed(0)}bps
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FF vs 10yr chart */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Fed Funds vs 10-Year Treasury (24 months)</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-primary" />Fed Funds</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-amber-400" />10Y Treasury</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <svg width={ffW} height={ffH} viewBox={`0 0 ${ffW} ${ffH}`} className="min-w-[400px]">
            {[4.0, 4.5, 5.0, 5.5].map((v) => (
              <g key={v}>
                <line x1={ffPadL} x2={ffW - ffPadR} y1={ffToY(v)} y2={ffToY(v)} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
                <text x={ffPadL - 4} y={ffToY(v) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.45}>
                  {v.toFixed(1)}%
                </text>
              </g>
            ))}
            {ffVs10yrData.filter((_, i) => i % 4 === 0).map((d, i) => (
              <text key={i} x={ffToX(i * 4)} y={ffH - 8} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4}>
                {d.label}
              </text>
            ))}
            <path d={buildFFPath("yr10")} fill="none" stroke="rgb(251,191,36)" strokeWidth={1.5} opacity={0.7} />
            <path d={buildFFPath("ff")} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Section: Monetary Policy Transmission ─────────────────────────────────────

function PolicyTransmission() {
  const [activeChannel, setActiveChannel] = useState<number | null>(null);

  const channels = [
    {
      name: "Interest Rate Channel",
      steps: [
        { label: "Bank Rate", color: "bg-primary/80" },
        { label: "Lending Rates", color: "bg-primary/70" },
        { label: "Investment & Consumption", color: "bg-cyan-500/60" },
        { label: "Inflation", color: "bg-red-500/60" },
      ],
      lag: "6–18 months",
      effectiveness: 85,
      description: "Higher rates raise borrowing costs for businesses and households, reducing investment and consumption, which lowers aggregate demand and inflation.",
    },
    {
      name: "Exchange Rate Channel",
      steps: [
        { label: "Rate Differential", color: "bg-primary/80" },
        { label: "FX Rate Appreciation", color: "bg-primary/70" },
        { label: "Exports ↓ / Imports ↑", color: "bg-fuchsia-500/60" },
        { label: "Inflation", color: "bg-red-500/60" },
      ],
      lag: "3–12 months",
      effectiveness: 60,
      description: "Higher domestic rates attract foreign capital, appreciating the currency. This makes exports less competitive and imports cheaper, reducing import-led inflation.",
    },
    {
      name: "Asset Price Channel",
      steps: [
        { label: "Rate Hike", color: "bg-primary/80" },
        { label: "Asset Prices ↓", color: "bg-amber-500/70" },
        { label: "Wealth Effect ↓", color: "bg-orange-500/60" },
        { label: "Spending & Inflation", color: "bg-red-500/60" },
      ],
      lag: "12–24 months",
      effectiveness: 55,
      description: "Rising rates reduce the present value of future cash flows, lowering equity and real estate prices. Reduced household wealth leads to lower consumer spending.",
    },
    {
      name: "Credit Channel",
      steps: [
        { label: "Tighter Policy", color: "bg-primary/80" },
        { label: "Bank Lending ↓", color: "bg-teal-500/70" },
        { label: "Credit Availability ↓", color: "bg-emerald-500/60" },
        { label: "Output & Prices", color: "bg-red-500/60" },
      ],
      lag: "9–18 months",
      effectiveness: 70,
      description: "Higher rates reduce bank net interest margins and increase default risk, causing banks to tighten credit standards and reduce lending to households and businesses.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-1 text-sm font-medium">Monetary Policy Transmission Channels</h3>
        <p className="mb-4 text-[11px] text-muted-foreground">Click a channel to see details</p>
        <div className="space-y-3">
          {channels.map((ch, ci) => (
            <motion.div
              key={ch.name}
              className={cn(
                "cursor-pointer rounded-lg border p-3 transition-colors",
                activeChannel === ci ? "border-primary/40 bg-primary/5" : "border-border bg-muted/10 hover:bg-muted/20",
              )}
              onClick={() => setActiveChannel(activeChannel === ci ? null : ci)}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium">{ch.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Lag: {ch.lag}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-muted-foreground/60">Effect:</span>
                    <div className="h-1.5 w-16 rounded-full bg-muted/30">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${ch.effectiveness}%` }}
                      />
                    </div>
                    <span className="font-medium">{ch.effectiveness}%</span>
                  </div>
                  {activeChannel === ci ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                </div>
              </div>
              {/* Flow diagram */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {ch.steps.map((step, si) => (
                  <div key={si} className="flex shrink-0 items-center gap-1">
                    <span className={cn("rounded px-2 py-1 text-xs font-medium text-foreground/90", step.color)}>
                      {step.label}
                    </span>
                    {si < ch.steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                    )}
                  </div>
                ))}
              </div>
              <AnimatePresence>
                {activeChannel === ci && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden text-[11px] text-muted-foreground/80"
                  >
                    {ch.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tightening vs Easing Cycle */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-medium">Tightening vs Easing Cycle Comparison</h3>
        <div className="grid grid-cols-2 gap-4 text-[11px]">
          {[
            {
              label: "Current Tightening Cycle",
              color: "text-red-400",
              borderColor: "border-red-500/30",
              items: [
                "Start: Mar 2022",
                "Total hikes: +525bps",
                "Peak rate: 5.25–5.50%",
                "Duration: 16 months",
                "Pause since: Jul 2023",
                "1st cut: Sep 2024",
              ],
            },
            {
              label: "Easing Cycle (2019–2020)",
              color: "text-emerald-400",
              borderColor: "border-emerald-500/30",
              items: [
                "Start: Jul 2019",
                "Total cuts: -225bps",
                "Trough rate: 0–0.25%",
                "COVID emergency: Mar 2020",
                "QE: $120B/month",
                "Duration: 18 months",
              ],
            },
          ].map((cycle) => (
            <div key={cycle.label} className={cn("rounded-lg border p-3", cycle.borderColor)}>
              <p className={cn("mb-2 font-medium", cycle.color)}>{cycle.label}</p>
              <ul className="space-y-1">
                {cycle.items.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section: Forward Guidance ─────────────────────────────────────────────────

function ForwardGuidance() {
  // Fed Funds futures implied path SVG
  const svgW = 500;
  const svgH = 140;
  const padL = 44;
  const padR = 16;
  const padT = 12;
  const padB = 30;
  const rateMin = 4.5;
  const rateMax = 5.6;
  const toX = (i: number) => padL + (i / (FED_FUTURES.length - 1)) * (svgW - padL - padR);
  const toY = (r: number) => padT + ((rateMax - r) / (rateMax - rateMin)) * (svgH - padT - padB);

  const linePath = FED_FUTURES.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.impliedRate)}`).join(" ");
  const areaPath = `${linePath} L ${toX(FED_FUTURES.length - 1)} ${svgH - padB} L ${toX(0)} ${svgH - padB} Z`;

  const guidanceData = [
    {
      bank: "Fed",
      flag: "🇺🇸",
      summary: "Higher for longer stance maintained. Data-dependent approach. Two 25bps cuts projected for 2026 in median dot plot. Balance sheet normalization ongoing.",
      tone: "hawkish" as const,
    },
    {
      bank: "ECB",
      flag: "🇪🇺",
      summary: "Gradual easing cycle underway. Disinflation progressing well. Services inflation remains sticky. Next move likely 25bps cut in April 2026.",
      tone: "dovish" as const,
    },
    {
      bank: "BOJ",
      flag: "🇯🇵",
      summary: "Normalizing ultra-loose policy. Wage-price dynamics improving. Rate hike to 0.5% in Jan 2026. Further hikes conditional on sustained wage growth.",
      tone: "hawkish" as const,
    },
    {
      bank: "BOE",
      flag: "🇬🇧",
      summary: "Cautious cutting cycle. Services CPI above 4%. Labour market loosening gradually. Split MPC votes. Next 25bps cut likely May 2026.",
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Futures implied path */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Fed Funds Futures — Implied Rate Path</h3>
          <span className="text-xs text-muted-foreground">CME FedWatch · As of Mar 2026</span>
        </div>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="min-w-[360px]">
            {[4.5, 4.75, 5.0, 5.25, 5.5].map((r) => (
              <g key={r}>
                <line x1={padL} x2={svgW - padR} y1={toY(r)} y2={toY(r)} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
                <text x={padL - 4} y={toY(r) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.45}>
                  {r.toFixed(2)}%
                </text>
              </g>
            ))}
            <path d={areaPath} fill="hsl(var(--primary))" fillOpacity={0.08} />
            <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
            {FED_FUTURES.map((d, i) => (
              <g key={i}>
                <circle cx={toX(i)} cy={toY(d.impliedRate)} r={4} fill="hsl(var(--primary))" fillOpacity={0.8} />
                <text x={toX(i)} y={svgH - 8} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.5}>
                  {d.meeting}
                </text>
                <text x={toX(i)} y={toY(d.impliedRate) - 8} textAnchor="middle" fontSize={8} fill="hsl(var(--primary))" fontWeight={600}>
                  {d.impliedRate.toFixed(2)}%
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Probability histogram by meeting */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-medium">Rate Outcome Probabilities by Meeting</h3>
        <div className="space-y-2">
          {FED_FUTURES.map((d) => (
            <div key={d.meeting} className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="w-16 shrink-0 text-muted-foreground">{d.meeting}</span>
              <div className="flex flex-1 gap-0.5 overflow-hidden rounded-sm">
                <div
                  className="flex h-5 items-center justify-center bg-emerald-500/50 text-[11px] font-medium text-emerald-200 transition-all"
                  style={{ width: `${d.probCut}%`, minWidth: d.probCut > 0 ? 16 : 0 }}
                >
                  {d.probCut > 4 ? `${d.probCut}%` : ""}
                </div>
                <div
                  className="flex h-5 items-center justify-center bg-muted/40 text-[11px] font-medium text-muted-foreground transition-all"
                  style={{ width: `${d.probHold}%` }}
                >
                  {d.probHold > 8 ? `${d.probHold}%` : ""}
                </div>
                <div
                  className="flex h-5 items-center justify-center bg-red-500/40 text-[11px] font-medium text-red-200 transition-all"
                  style={{ width: `${d.probHike}%`, minWidth: d.probHike > 0 ? 12 : 0 }}
                >
                  {d.probHike > 4 ? `${d.probHike}%` : ""}
                </div>
              </div>
              <span className="w-16 shrink-0 text-right font-medium text-primary">{d.impliedRate.toFixed(3)}%</span>
            </div>
          ))}
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-emerald-500/50" />Cut</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-muted/40" />Hold</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-red-500/40" />Hike</span>
          </div>
        </div>
      </div>

      {/* Forward guidance tracker */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-medium">Central Bank Forward Guidance Tracker</h3>
        <div className="space-y-3">
          {guidanceData.map((bank) => (
            <div key={bank.bank} className="rounded-lg border border-border bg-muted/10 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>{bank.flag}</span>
                  <span className="text-xs text-muted-foreground font-medium">{bank.bank}</span>
                </div>
                <StanceChip stance={bank.tone} />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground/80">{bank.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section: Balance Sheets ────────────────────────────────────────────────────

function CentralBankBalanceSheets() {
  // Side-by-side comparison (% of GDP)
  const cbGdp = [
    { name: "Fed", flag: "🇺🇸", pct: 27.5, color: "bg-primary/70", peak: 36.7 },
    { name: "ECB", flag: "🇪🇺", pct: 48.2, color: "bg-primary/70", peak: 66.1 },
    { name: "BOJ", flag: "🇯🇵", pct: 124.3, color: "bg-red-400/70", peak: 134.2 },
  ];

  // M2 growth rate (monthly, 24 months)
  resetSeed();
  const m2Data = useMemo(() => {
    let v = 6.0;
    return Array.from({ length: 24 }, (_, i) => {
      v = v + (rand() - 0.55) * 0.8;
      v = Math.max(-2, Math.min(12, v));
      const mo = new Date(2024, 3 + i);
      return {
        label: mo.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        value: Math.round(v * 10) / 10,
      };
    });
  }, []);

  // M2V (velocity)
  resetSeed();
  const m2vData = useMemo(() => {
    let v = 1.23;
    return Array.from({ length: 24 }, (_, i) => {
      v = v + (rand() - 0.48) * 0.02;
      v = Math.max(1.1, Math.min(1.5, v));
      const mo = new Date(2024, 3 + i);
      return {
        label: mo.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        value: Math.round(v * 1000) / 1000,
      };
    });
  }, []);

  // Line chart helper
  function MiniLineChart({
    data,
    color,
    label,
    unit,
    zeroLine,
  }: {
    data: { label: string; value: number }[];
    color: string;
    label: string;
    unit: string;
    zeroLine?: boolean;
  }) {
    const w = 480;
    const h = 90;
    const pL = 36;
    const pR = 10;
    const pT = 8;
    const pB = 24;
    const vals = data.map((d) => d.value);
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const toX = (i: number) => pL + (i / (data.length - 1)) * (w - pL - pR);
    const toY = (v: number) => pT + ((maxV - v) / range) * (h - pT - pB);
    const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.value)}`).join(" ");
    const area = `${path} L ${toX(data.length - 1)} ${h - pB} L ${toX(0)} ${h - pB} Z`;

    return (
      <div>
        <p className="mb-2 text-xs text-muted-foreground font-medium">{label}</p>
        <div className="overflow-x-auto">
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="min-w-[320px]">
            {zeroLine && (
              <line x1={pL} x2={w - pR} y1={toY(0)} y2={toY(0)} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="3,3" />
            )}
            <path d={area} fill={color} fillOpacity={0.12} />
            <path d={path} fill="none" stroke={color} strokeWidth={1.8} />
            {data.filter((_, i) => i % 4 === 0).map((d, i) => (
              <text key={i} x={toX(i * 4)} y={h - 6} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4}>
                {d.label}
              </text>
            ))}
            <text x={pL - 2} y={toY(maxV) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
              {maxV.toFixed(1)}{unit}
            </text>
            <text x={pL - 2} y={toY(minV) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
              {minV.toFixed(1)}{unit}
            </text>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CB balance sheet % GDP */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <h3 className="mb-4 text-sm font-medium">Central Bank Balance Sheets (% of GDP)</h3>
        <div className="space-y-4">
          {cbGdp.map((cb) => (
            <div key={cb.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span>{cb.flag}</span>
                  <span className="font-medium">{cb.name}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground/60">Peak: {cb.peak}%</span>
                  <span className="font-medium">{cb.pct}%</span>
                </div>
              </div>
              <div className="h-4 rounded-full bg-muted/20">
                <div className="relative h-full">
                  <motion.div
                    className={cn("h-full rounded-full", cb.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${(cb.pct / 150) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  {/* Peak marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/30"
                    style={{ left: `${(cb.peak / 150) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground/50">Scale: 0–150% of GDP. White marker = peak.</p>
        </div>
      </div>

      {/* Fed balance sheet components (same data, different framing) */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Fed Balance Sheet Components (Current)</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
          {[
            { label: "Treasuries", value: "$4.52T", pct: "59%", color: "bg-primary/60" },
            { label: "MBS", value: "$2.25T", pct: "29%", color: "bg-emerald-500/60" },
            { label: "Other", value: "$0.21T", pct: "3%", color: "bg-amber-500/60" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/20 p-3">
              <div className={cn("mx-auto mb-2 h-1.5 w-12 rounded-full", item.color)} />
              <p className="text-xs text-muted-foreground font-medium">{item.value}</p>
              <p className="text-muted-foreground/60">{item.label}</p>
              <p className="text-xs font-medium text-primary">{item.pct}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex h-5 gap-0.5 overflow-hidden rounded-md">
          <div className="bg-primary/60 transition-all" style={{ width: "59%" }} />
          <div className="bg-emerald-500/60 transition-all" style={{ width: "29%" }} />
          <div className="bg-amber-500/60 transition-all" style={{ width: "3%" }} />
          <div className="bg-muted/30 transition-all" style={{ width: "9%" }} />
        </div>
      </div>

      {/* M2 growth */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <MiniLineChart
          data={m2Data}
          color="hsl(var(--primary))"
          label="M2 Money Supply Growth Rate (YoY %)"
          unit="%"
          zeroLine
        />
      </div>

      {/* M2 velocity */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <MiniLineChart
          data={m2vData}
          color="rgb(251,191,36)"
          label="Velocity of M2 Money (GDP / M2)"
          unit=""
        />
        <p className="mt-1 text-xs text-muted-foreground/50">
          Velocity = nominal GDP / M2. Lower velocity = money turning over more slowly, deflationary pressure.
        </p>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "fed",          label: "Fed Policy",       icon: BarChart3 },
  { id: "global",       label: "Global CBs",        icon: Globe     },
  { id: "yield",        label: "Yield Curve",       icon: TrendingUp },
  { id: "transmission", label: "Transmission",      icon: Activity  },
  { id: "guidance",     label: "Fwd Guidance",      icon: Info      },
  { id: "balancesheet", label: "Balance Sheets",    icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CentralBankPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fed");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* HERO Header */}
      <div className="shrink-0 border-b border-border border-l-4 border-l-primary bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Central Banking &amp; Monetary Policy</h1>
            <p className="text-xs text-muted-foreground">
              Fed policy · Global rates · Yield curves · Transmission mechanisms · Forward guidance
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-red-500/5 px-2 py-0.5 font-medium text-red-400">
              Fed Funds: 5.25–5.50%
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-400">
              PCE: 3.2%
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
              U3: 4.1%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabId)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="shrink-0 border-b border-border bg-background/60 px-4 pt-2">
          <TabsList className="h-auto gap-0 rounded-none border-0 bg-transparent p-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative flex items-center gap-1.5 rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 text-[11px] font-medium text-muted-foreground/60 transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="fed" className="m-0 p-4 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <FedPolicyDashboard />
            </motion.div>
          </TabsContent>
          <TabsContent value="global" className="m-0 p-4 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <GlobalCentralBanks />
            </motion.div>
          </TabsContent>
          <TabsContent value="yield" className="m-0 p-4 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <YieldCurveAnalysis />
            </motion.div>
          </TabsContent>
          <TabsContent value="transmission" className="m-0 p-4 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <PolicyTransmission />
            </motion.div>
          </TabsContent>
          <TabsContent value="guidance" className="m-0 p-4 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <ForwardGuidance />
            </motion.div>
          </TabsContent>
          <TabsContent value="balancesheet" className="m-0 p-4 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <CentralBankBalanceSheets />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
