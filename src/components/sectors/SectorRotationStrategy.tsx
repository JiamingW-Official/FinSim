"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (mulberry32, seed=2580) ──────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTORS_11 = [
  { name: "Technology",             etf: "XLK",  color: "#6366f1" },
  { name: "Healthcare",             etf: "XLV",  color: "#10b981" },
  { name: "Financials",             etf: "XLF",  color: "#3b82f6" },
  { name: "Consumer Discretionary", etf: "XLY",  color: "#f59e0b" },
  { name: "Consumer Staples",       etf: "XLP",  color: "#84cc16" },
  { name: "Industrials",            etf: "XLI",  color: "#8b5cf6" },
  { name: "Energy",                 etf: "XLE",  color: "#ef4444" },
  { name: "Materials",              etf: "XLB",  color: "#14b8a6" },
  { name: "Real Estate",            etf: "XLRE", color: "#f97316" },
  { name: "Utilities",              etf: "XLU",  color: "#06b6d4" },
  { name: "Communication Services", etf: "XLC",  color: "#ec4899" },
] as const;

type SectorName = (typeof SECTORS_11)[number]["name"];

const FACTORS_6 = [
  { name: "Value",          etf: "VLUE", color: "#3b82f6" },
  { name: "Growth",         etf: "IWF",  color: "#6366f1" },
  { name: "Momentum",       etf: "MTUM", color: "#10b981" },
  { name: "Quality",        etf: "QUAL", color: "#f59e0b" },
  { name: "Low Volatility", etf: "USMV", color: "#8b5cf6" },
  { name: "Small Cap",      etf: "IWM",  color: "#ec4899" },
] as const;

type FactorName = (typeof FACTORS_6)[number]["name"];

// ── Cycle phase definitions ────────────────────────────────────────────────────

interface CyclePhase {
  label: string;
  shortLabel: string;
  angleStart: number;
  angleEnd: number;
  color: string;
  gdp: string;
  inflation: string;
  rates: string;
  employment: string;
  leaders: SectorName[];
  laggards: SectorName[];
}

const CYCLE_PHASES: CyclePhase[] = [
  {
    label: "Early Expansion",
    shortLabel: "Early Exp",
    angleStart: 0,
    angleEnd: 90,
    color: "#10b981",
    gdp: "Accelerating",
    inflation: "Low",
    rates: "Falling / Low",
    employment: "Improving",
    leaders: ["Financials", "Consumer Discretionary", "Industrials"],
    laggards: ["Utilities", "Consumer Staples", "Real Estate"],
  },
  {
    label: "Late Expansion",
    shortLabel: "Late Exp",
    angleStart: 90,
    angleEnd: 180,
    color: "#6366f1",
    gdp: "Peak Growth",
    inflation: "Rising",
    rates: "Rising",
    employment: "Full / Tight",
    leaders: ["Energy", "Materials", "Technology"],
    laggards: ["Real Estate", "Utilities", "Consumer Staples"],
  },
  {
    label: "Early Recession",
    shortLabel: "Early Rec",
    angleStart: 180,
    angleEnd: 270,
    color: "#f59e0b",
    gdp: "Decelerating",
    inflation: "Peaked",
    rates: "Peaked / Falling",
    employment: "Weakening",
    leaders: ["Healthcare", "Consumer Staples", "Utilities"],
    laggards: ["Financials", "Consumer Discretionary", "Industrials"],
  },
  {
    label: "Late Recession",
    shortLabel: "Late Rec",
    angleStart: 270,
    angleEnd: 360,
    color: "#ef4444",
    gdp: "Contracting",
    inflation: "Falling",
    rates: "Low / Cut",
    employment: "Declining",
    leaders: ["Financials", "Real Estate", "Consumer Discretionary"],
    laggards: ["Energy", "Materials", "Technology"],
  },
];

// Current position: Late Expansion (needle at ~135 degrees)
const CURRENT_PHASE_IDX = 1; // Late Expansion
const CURRENT_NEEDLE_ANGLE = 135;

// ── Sector cycle performance matrix ───────────────────────────────────────────

// Typical performance in each phase: strong/moderate/weak/negative
type PhasePerf = "strong" | "moderate" | "weak" | "negative";

const CYCLE_MATRIX: Record<SectorName, [PhasePerf, PhasePerf, PhasePerf, PhasePerf]> = {
  "Technology":             ["moderate", "strong",   "weak",     "weak"],
  "Healthcare":             ["weak",     "moderate", "strong",   "moderate"],
  "Financials":             ["strong",   "moderate", "negative", "strong"],
  "Consumer Discretionary": ["strong",   "moderate", "negative", "strong"],
  "Consumer Staples":       ["weak",     "weak",     "strong",   "moderate"],
  "Industrials":            ["strong",   "moderate", "negative", "weak"],
  "Energy":                 ["moderate", "strong",   "weak",     "negative"],
  "Materials":              ["moderate", "strong",   "weak",     "negative"],
  "Real Estate":            ["weak",     "weak",     "moderate", "strong"],
  "Utilities":              ["negative", "weak",     "strong",   "moderate"],
  "Communication Services": ["moderate", "strong",   "weak",     "moderate"],
};

function phasePerfColor(p: PhasePerf): string {
  switch (p) {
    case "strong":   return "bg-emerald-500/25 text-emerald-300";
    case "moderate": return "bg-blue-500/20 text-blue-300";
    case "weak":     return "bg-muted/30 text-muted-foreground";
    case "negative": return "bg-red-500/20 text-red-400";
  }
}

// ── Data generation ────────────────────────────────────────────────────────────

interface SectorRS {
  name: string;
  etf: string;
  color: string;
  rsNow: number;       // current RS vs S&P 500 (around 1.0)
  rs4wChange: number;  // change in RS over 4 weeks
  rs12wChange: number; // change in RS over 12 weeks
  rsTrend: "rising" | "falling" | "flat";
  rsAbove1: boolean;
  rsHistory: number[]; // 90 data points
}

interface SectorPerfData {
  name: string;
  etf: string;
  color: string;
  ret1w: number;
  ret1m: number;
  ret3m: number;
  ret6m: number;
  retYtd: number;
  ret1y: number;
  above50ma: number;   // % stocks above 50MA
  above200ma: number;  // % stocks above 200MA
}

interface FactorRS {
  name: FactorName;
  etf: string;
  color: string;
  rsNow: number;
  rsHistory: number[];
  phaseFit: "leader" | "neutral" | "laggard";
}

interface RegionalData {
  region: string;
  topSector: string;
  bottom: string;
  usdImpact: "positive" | "negative" | "neutral";
}

interface CapitalFlow {
  etf: string;
  name: string;
  color: string;
  flow4w: number; // $B inflow/outflow
}

interface SeasonalityData {
  name: string;
  etf: string;
  color: string;
  monthly: number[]; // 12 months avg return
}

function generateAllData() {
  const rng = mulberry32(2580);

  // RS data for 11 sectors
  const sectorRS: SectorRS[] = SECTORS_11.map((s) => {
    const rsNow = 0.82 + rng() * 0.4; // 0.82 to 1.22
    const rs4wChange = (rng() - 0.48) * 0.14;
    const rs12wChange = (rng() - 0.46) * 0.22;
    const rsTrend: "rising" | "falling" | "flat" =
      rs4wChange > 0.02 ? "rising" : rs4wChange < -0.02 ? "falling" : "flat";
    const rsHistory: number[] = [];
    let rs = rsNow - rs12wChange;
    for (let i = 0; i < 90; i++) {
      rs += (rng() - 0.49) * 0.006;
      rsHistory.push(Math.max(0.6, Math.min(1.4, rs)));
    }
    return {
      name: s.name,
      etf: s.etf,
      color: s.color,
      rsNow,
      rs4wChange,
      rs12wChange,
      rsTrend,
      rsAbove1: rsNow > 1.0,
      rsHistory,
    };
  });

  // Sort by rsNow descending
  const sectorRSRanked = [...sectorRS].sort((a, b) => b.rsNow - a.rsNow);

  // Performance data
  const sectorPerfs: SectorPerfData[] = SECTORS_11.map((s) => ({
    name: s.name,
    etf: s.etf,
    color: s.color,
    ret1w:    (rng() - 0.48) * 6,
    ret1m:    (rng() - 0.46) * 14,
    ret3m:    (rng() - 0.44) * 24,
    ret6m:    (rng() - 0.43) * 34,
    retYtd:   (rng() - 0.42) * 38,
    ret1y:    (rng() - 0.40) * 48,
    above50ma:  30 + rng() * 65,
    above200ma: 25 + rng() * 60,
  }));

  // Seasonality (12-month averages per sector)
  const seasonality: SeasonalityData[] = SECTORS_11.map((s) => ({
    name: s.name,
    etf: s.etf,
    color: s.color,
    monthly: Array.from({ length: 12 }, () => (rng() - 0.42) * 6),
  }));

  // Factor RS
  const factorRS: FactorRS[] = FACTORS_6.map((f) => {
    const rsNow = 0.85 + rng() * 0.35;
    const rsHistory: number[] = [];
    let rs = rsNow - (rng() - 0.5) * 0.18;
    for (let i = 0; i < 90; i++) {
      rs += (rng() - 0.49) * 0.007;
      rsHistory.push(Math.max(0.65, Math.min(1.35, rs)));
    }
    // Phase fit for Late Expansion
    const lateExpLeaders: FactorName[] = ["Momentum", "Growth"];
    const lateExpLaggards: FactorName[] = ["Low Volatility", "Value"];
    const phaseFit: "leader" | "neutral" | "laggard" = lateExpLeaders.includes(f.name as FactorName)
      ? "leader"
      : lateExpLaggards.includes(f.name as FactorName)
        ? "laggard"
        : "neutral";
    return { name: f.name, etf: f.etf, color: f.color, rsNow, rsHistory, phaseFit };
  });

  // Capital flows
  const capitalFlows: CapitalFlow[] = SECTORS_11.map((s) => ({
    etf: s.etf,
    name: s.name,
    color: s.color,
    flow4w: (rng() - 0.45) * 8,
  })).sort((a, b) => b.flow4w - a.flow4w);

  // Regional data
  const regionals: RegionalData[] = [
    { region: "US",     topSector: "Technology",    bottom: "Utilities",       usdImpact: "neutral" },
    { region: "Europe", topSector: "Financials",    bottom: "Energy",          usdImpact: "negative" },
    { region: "EM",     topSector: "Materials",     bottom: "Consumer Staples",usdImpact: "negative" },
    { region: "Asia",   topSector: "Industrials",   bottom: "Real Estate",     usdImpact: "negative" },
  ];

  return { sectorRS, sectorRSRanked, sectorPerfs, seasonality, factorRS, capitalFlows, regionals };
}

// ── Utility helpers ────────────────────────────────────────────────────────────

function fmt(v: number, digits = 1): string {
  return (v > 0 ? "+" : "") + v.toFixed(digits) + "%";
}

function retCls(v: number): string {
  if (v > 4) return "text-emerald-400";
  if (v > 0) return "text-emerald-500";
  if (v > -4) return "text-red-500";
  return "text-red-400";
}

function heatBg(v: number, min: number, max: number): string {
  const t = (v - min) / (max - min || 1);
  if (t > 0.65) return "bg-emerald-500/30 text-emerald-300";
  if (t > 0.5)  return "bg-emerald-500/15 text-emerald-400";
  if (t < 0.35) return "bg-red-500/30 text-red-400";
  if (t < 0.5)  return "bg-red-500/15 text-red-500";
  return "bg-muted/20 text-muted-foreground";
}

// ── Section 1 Components ──────────────────────────────────────────────────────

function BusinessCycleClock() {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  const CX = 160, CY = 160, R_OUTER = 140, R_INNER = 80;

  function polarToXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  function describeArc(startDeg: number, endDeg: number, rIn: number, rOut: number): string {
    const s1 = polarToXY(startDeg, rOut);
    const e1 = polarToXY(endDeg, rOut);
    const s2 = polarToXY(endDeg, rIn);
    const e2 = polarToXY(startDeg, rIn);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${rOut} ${rOut} 0 ${large} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${rIn} ${rIn} 0 ${large} 0 ${e2.x} ${e2.y}`,
      "Z",
    ].join(" ");
  }

  const needleEnd = polarToXY(CURRENT_NEEDLE_ANGLE, R_INNER - 10);
  const nb1 = polarToXY(CURRENT_NEEDLE_ANGLE + 90, 8);
  const nb2 = polarToXY(CURRENT_NEEDLE_ANGLE - 90, 8);

  const currentPhase = CYCLE_PHASES[CURRENT_PHASE_IDX];

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 text-xs font-semibold text-muted-foreground">Business Cycle Clock</div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* SVG Clock */}
        <div className="shrink-0">
          <svg viewBox="0 0 320 320" className="w-full" style={{ maxWidth: 320 }}>
            {CYCLE_PHASES.map((phase, i) => {
              const midAngle = (phase.angleStart + phase.angleEnd) / 2;
              const labelPos = polarToXY(midAngle, (R_INNER + R_OUTER) / 2);
              const isActive = i === CURRENT_PHASE_IDX;
              const isHovered = hoveredPhase === i;

              return (
                <g
                  key={phase.label}
                  onMouseEnter={() => setHoveredPhase(i)}
                  onMouseLeave={() => setHoveredPhase(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={describeArc(phase.angleStart, phase.angleEnd, R_INNER, R_OUTER)}
                    fill={phase.color}
                    opacity={isActive ? 0.45 : isHovered ? 0.22 : 0.12}
                    stroke={isActive ? phase.color : "transparent"}
                    strokeWidth={isActive ? 2 : 0}
                  />
                  {phase.shortLabel.split(" ").map((word, wi) => (
                    <text
                      key={wi}
                      x={labelPos.x}
                      y={labelPos.y + wi * 13 - 6}
                      textAnchor="middle"
                      fill={phase.color}
                      fontSize={10}
                      fontWeight={isActive ? "700" : "500"}
                      opacity={isActive ? 1 : 0.65}
                    >
                      {word}
                    </text>
                  ))}
                </g>
              );
            })}

            {/* Dividers */}
            {[0, 90, 180, 270].map((a) => {
              const r1 = polarToXY(a, R_INNER);
              const r2 = polarToXY(a, R_OUTER);
              return (
                <line key={a} x1={r1.x} y1={r1.y} x2={r2.x} y2={r2.y} stroke="#ffffff18" strokeWidth={1} />
              );
            })}

            {/* Inner circle */}
            <circle cx={CX} cy={CY} r={R_INNER - 2} fill="#0f172a" stroke="#ffffff12" strokeWidth={1} />

            {/* Sector dots on the ring */}
            {SECTORS_11.map((s) => {
              // Map sectors to angles for Late Expansion phase
              const sectorAngles: Record<string, number> = {
                "Financials": 15, "Technology": 50, "Consumer Discretionary": 80,
                "Industrials": 115, "Energy": 145, "Materials": 170,
                "Consumer Staples": 205, "Healthcare": 240, "Utilities": 270,
                "Real Estate": 305, "Communication Services": 340,
              };
              const angle = sectorAngles[s.name] ?? 0;
              const dot = polarToXY(angle, R_INNER + 10);
              const lbl = polarToXY(angle, R_OUTER + 18);
              const isLeader = CYCLE_PHASES[CURRENT_PHASE_IDX].leaders.includes(s.name as SectorName);
              return (
                <g key={s.name}>
                  <circle cx={dot.x} cy={dot.y} r={isLeader ? 5 : 3} fill={isLeader ? s.color : "#ffffff30"}
                    stroke={isLeader ? "#fff" : "none"} strokeWidth={1} />
                  <text x={lbl.x} y={lbl.y + 3} textAnchor="middle" fill={isLeader ? s.color : "#475569"}
                    fontSize={isLeader ? 9 : 8} fontWeight={isLeader ? "700" : "400"}>
                    {s.etf}
                  </text>
                </g>
              );
            })}

            {/* Needle */}
            <polygon
              points={`${needleEnd.x},${needleEnd.y} ${nb1.x},${nb1.y} ${nb2.x},${nb2.y}`}
              fill="#ffffff" opacity={0.9}
            />
            <circle cx={CX} cy={CY} r={6} fill="#ffffff" />
            <text x={CX} y={CY + 22} textAnchor="middle" fill={currentPhase.color} fontSize={10} fontWeight="700">
              {currentPhase.shortLabel}
            </text>
          </svg>

          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {CYCLE_PHASES.map((p, i) => (
              <span key={p.label} className="flex items-center gap-1" style={{ color: p.color }}>
                <span className="h-2 w-2 rounded-full" style={{ background: p.color, opacity: i === CURRENT_PHASE_IDX ? 1 : 0.5 }} />
                {p.label}{i === CURRENT_PHASE_IDX ? " (now)" : ""}
              </span>
            ))}
          </div>
        </div>

        {/* Phase details */}
        <div className="flex-1 space-y-3">
          {/* Current phase card */}
          <div className="rounded border p-3" style={{ borderColor: currentPhase.color + "40", background: currentPhase.color + "08" }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: currentPhase.color }} />
              <span className="text-xs font-bold" style={{ color: currentPhase.color }}>{currentPhase.label}</span>
              <span className="ml-auto rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">CURRENT</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-muted-foreground">GDP: </span><span className="text-foreground/80">{currentPhase.gdp}</span></div>
              <div><span className="text-muted-foreground">Inflation: </span><span className="text-foreground/80">{currentPhase.inflation}</span></div>
              <div><span className="text-muted-foreground">Rates: </span><span className="text-foreground/80">{currentPhase.rates}</span></div>
              <div><span className="text-muted-foreground">Employment: </span><span className="text-foreground/80">{currentPhase.employment}</span></div>
            </div>
          </div>

          {/* All phases mini grid */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-muted-foreground">All Phase Characteristics</div>
            {CYCLE_PHASES.map((p, i) => (
              <div key={p.label} className={cn("rounded border border-border/20 p-2", i === CURRENT_PHASE_IDX && "border-border/60")}>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.leaders.map((l) => {
                    const sec = SECTORS_11.find((s) => s.name === l)!;
                    return (
                      <span key={l} className="rounded px-1.5 py-0.5 text-[11px] font-mono font-semibold"
                        style={{ background: sec.color + "25", color: sec.color }}>
                        {sec.etf}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CyclePerformanceMatrix() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 bg-card">
      <div className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground">
        Sector Performance Matrix by Cycle Phase
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 bg-muted/10">
            <th className="py-2 pl-4 pr-3 text-left text-xs font-semibold text-muted-foreground">Sector</th>
            {CYCLE_PHASES.map((p, i) => (
              <th key={p.label} className="px-2 py-2 text-center text-xs font-semibold" style={{ color: p.color }}>
                {p.shortLabel}{i === CURRENT_PHASE_IDX ? " *" : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTORS_11.map((s) => (
            <tr key={s.name} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
              <td className="py-1.5 pl-4 pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-medium">{s.name}</span>
                </div>
              </td>
              {CYCLE_MATRIX[s.name].map((perf, pi) => (
                <td key={pi} className="px-2 py-1.5 text-center">
                  <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize", phasePerfColor(perf))}>
                    {perf}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3 px-4 py-2 text-xs text-muted-foreground border-t border-border/20">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-emerald-500/25" /> Strong</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-blue-500/20" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-muted/30" /> Weak</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-red-500/20" /> Negative</span>
        <span className="ml-auto">* Current phase</span>
      </div>
    </div>
  );
}

// ── Section 2 Components ──────────────────────────────────────────────────────

function RSSparkline({ history, color }: { history: number[]; color: string }) {
  const W = 80, H = 28;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 0.01;
  const pts = history
    .map((v, i) => `${(i / (history.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} opacity={0.8} />
      <line x1={0} y1={H - ((1.0 - min) / range) * H} x2={W} y2={H - ((1.0 - min) / range) * H}
        stroke="#ffffff18" strokeWidth={1} strokeDasharray="2,2" />
    </svg>
  );
}

function RSRankingTable({ ranked }: { ranked: SectorRS[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 bg-card">
      <div className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground">
        RS Ranking vs S&P 500 (90-day)
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 bg-muted/10">
            <th className="py-2 pl-4 pr-2 text-left text-xs font-semibold text-muted-foreground">Rank</th>
            <th className="py-2 pr-3 text-left text-xs font-semibold text-muted-foreground">Sector</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground">RS Now</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground">4W Chg</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground">12W Chg</th>
            <th className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">Trend</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">90D RS</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((s, i) => (
            <tr key={s.name} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
              <td className="py-1.5 pl-4 pr-2 text-xs tabular-nums text-muted-foreground">{i + 1}</td>
              <td className="py-1.5 pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-mono font-semibold" style={{ color: s.color }}>{s.etf}</span>
                  <span className="hidden text-[11px] text-muted-foreground sm:inline">{s.name}</span>
                </div>
              </td>
              <td className="px-2 py-1.5 text-right">
                <span className={cn("font-mono text-xs font-semibold tabular-nums", s.rsAbove1 ? "text-emerald-400" : "text-red-400")}>
                  {s.rsNow.toFixed(3)}
                </span>
              </td>
              <td className="px-2 py-1.5 text-right">
                <span className={cn("text-xs tabular-nums", s.rs4wChange >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {s.rs4wChange >= 0 ? "+" : ""}{s.rs4wChange.toFixed(3)}
                </span>
              </td>
              <td className="px-2 py-1.5 text-right">
                <span className={cn("text-xs tabular-nums", s.rs12wChange >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {s.rs12wChange >= 0 ? "+" : ""}{s.rs12wChange.toFixed(3)}
                </span>
              </td>
              <td className="px-2 py-1.5 text-center">
                {s.rsTrend === "rising" && <ArrowUp className="mx-auto h-3 w-3 text-emerald-400" />}
                {s.rsTrend === "falling" && <ArrowDown className="mx-auto h-3 w-3 text-red-400" />}
                {s.rsTrend === "flat" && <Minus className="mx-auto h-3 w-3 text-muted-foreground" />}
              </td>
              <td className="px-3 py-1.5 text-center">
                <RSSparkline history={s.rsHistory} color={s.color} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 px-4 py-2 text-xs text-muted-foreground border-t border-border/20">
        <span className="text-emerald-400 font-semibold">RS &gt; 1.0</span> = outperforming S&P 500
        <span className="text-red-400 font-semibold">RS &lt; 1.0</span> = underperforming
        <span className="ml-auto">RS = sector return / S&P 500 return (rolling)</span>
      </div>
    </div>
  );
}

function RSMomentumMatrix({ ranked }: { ranked: SectorRS[] }) {
  // Quadrants: above1 + rising, above1 + falling, below1 + rising, below1 + falling
  const quadrants = [
    { label: "Leading",    desc: "Above 1.0 + Rising",  above1: true,  rising: true,  cls: "border-emerald-500/40 bg-emerald-500/5" },
    { label: "Weakening",  desc: "Above 1.0 + Falling", above1: true,  rising: false, cls: "border-amber-500/40 bg-amber-500/5" },
    { label: "Improving",  desc: "Below 1.0 + Rising",  above1: false, rising: true,  cls: "border-blue-500/40 bg-blue-500/5" },
    { label: "Lagging",    desc: "Below 1.0 + Falling", above1: false, rising: false, cls: "border-red-500/40 bg-red-500/5" },
  ];

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 text-xs font-semibold text-muted-foreground">JdK RS Momentum Matrix</div>
      <div className="grid grid-cols-2 gap-2">
        {quadrants.map((q) => {
          const sectors = ranked.filter((s) =>
            s.rsAbove1 === q.above1 && (s.rsTrend === "rising") === q.rising,
          );
          return (
            <div key={q.label} className={cn("rounded border p-3", q.cls)}>
              <div className="mb-1 text-xs font-bold text-foreground/80">{q.label}</div>
              <div className="mb-1 text-[11px] text-muted-foreground">{q.desc}</div>
              <div className="flex flex-wrap gap-1">
                {sectors.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">none</span>
                ) : (
                  sectors.map((s) => (
                    <span key={s.etf} className="rounded px-1.5 py-0.5 text-[11px] font-mono font-semibold"
                      style={{ background: s.color + "20", color: s.color }}>
                      {s.etf}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section 3 Components ──────────────────────────────────────────────────────

function EtfPerfHeatmap({ perfs }: { perfs: SectorPerfData[] }) {
  const cols: { key: keyof SectorPerfData; label: string }[] = [
    { key: "ret1w",  label: "1W"  },
    { key: "ret1m",  label: "1M"  },
    { key: "ret3m",  label: "3M"  },
    { key: "ret6m",  label: "6M"  },
    { key: "retYtd", label: "YTD" },
    { key: "ret1y",  label: "1Y"  },
  ];

  const colMins: Record<string, number> = {};
  const colMaxs: Record<string, number> = {};
  for (const c of cols) {
    const vals = perfs.map((p) => p[c.key] as number);
    colMins[c.key] = Math.min(...vals);
    colMaxs[c.key] = Math.max(...vals);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 bg-card">
      <div className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground">
        Sector ETF Performance Heatmap
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 bg-muted/10">
            <th className="py-2 pl-4 pr-3 text-left text-xs font-semibold text-muted-foreground">Sector</th>
            {cols.map((c) => (
              <th key={c.key} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {perfs.map((p) => (
            <tr key={p.name} className="border-b border-border/20 last:border-0">
              <td className="py-1.5 pl-4 pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs font-mono font-semibold" style={{ color: p.color }}>{p.etf}</span>
                </div>
              </td>
              {cols.map((c) => {
                const v = p[c.key] as number;
                return (
                  <td key={c.key} className="px-1 py-1.5 text-center">
                    <span className={cn("rounded px-1.5 py-0.5 text-[11px] tabular-nums font-mono", heatBg(v, colMins[c.key], colMaxs[c.key]))}>
                      {fmt(v)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeasonalityChart({ data }: { data: SeasonalityData[] }) {
  const [selectedSector, setSelectedSector] = useState<string>("Technology");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sector = data.find((d) => d.name === selectedSector) ?? data[0];
  const maxAbs = Math.max(...sector.monthly.map((v) => Math.abs(v)), 1);
  const W = 480, H = 80, BAR_W = W / 12;

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground">Sector Seasonality Patterns</div>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="rounded border border-border/40 bg-background px-2 py-1 text-xs text-foreground"
        >
          {data.map((d) => (
            <option key={d.name} value={d.name}>{d.etf} — {d.name}</option>
          ))}
        </select>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ height: H + 20 }}>
        {sector.monthly.map((v, i) => {
          const barH = Math.abs(v / maxAbs) * (H / 2 - 4);
          const pos = v >= 0;
          const bx = i * BAR_W + 2;
          const by = pos ? H / 2 - barH : H / 2;
          return (
            <g key={i}>
              <rect x={bx} y={by} width={BAR_W - 4} height={barH} rx={2}
                fill={pos ? sector.color : "#ef4444"} opacity={0.75} />
              <text x={bx + (BAR_W - 4) / 2} y={H + 14} textAnchor="middle" fill="#64748b" fontSize={8}>
                {months[i]}
              </text>
              <text
                x={bx + (BAR_W - 4) / 2}
                y={pos ? by - 2 : by + barH + 8}
                textAnchor="middle"
                fill={pos ? sector.color : "#ef4444"}
                fontSize={7}
              >
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#ffffff18" strokeWidth={1} />
      </svg>
      <div className="mt-1 text-[11px] text-muted-foreground">
        Historical avg monthly returns for {sector.name} — seeded synthetic data (seed 2580)
      </div>
    </div>
  );
}

function BreadthBars({ perfs }: { perfs: SectorPerfData[] }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 text-xs font-semibold text-muted-foreground">
        Sector Breadth — % Stocks Above MAs
      </div>
      <div className="space-y-2">
        {perfs.map((p) => (
          <div key={p.name} className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold" style={{ color: p.color }}>{p.etf}</span>
              <div className="flex gap-3 text-muted-foreground">
                <span>50MA: <span className={cn("font-semibold", p.above50ma > 60 ? "text-emerald-400" : p.above50ma < 40 ? "text-red-400" : "text-foreground/60")}>{p.above50ma.toFixed(0)}%</span></span>
                <span>200MA: <span className={cn("font-semibold", p.above200ma > 60 ? "text-emerald-400" : p.above200ma < 40 ? "text-red-400" : "text-foreground/60")}>{p.above200ma.toFixed(0)}%</span></span>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${p.above50ma}%` }} />
              </div>
              <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500/60" style={{ width: `${p.above200ma}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-emerald-500/60" /> % above 50MA</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-blue-500/60" /> % above 200MA</span>
      </div>
    </div>
  );
}

function RotationSignal({ ranked }: { ranked: SectorRS[] }) {
  const buy = ranked[0];
  const sell = ranked[ranked.length - 1];

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-primary" />
        Rotation Signal
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="h-3 w-3" /> BUY / OVERWEIGHT
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: buy.color }} />
            <span className="font-mono text-sm font-bold" style={{ color: buy.color }}>{buy.etf}</span>
            <span className="text-xs text-muted-foreground">{buy.name}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Strongest RS: {buy.rsNow.toFixed(3)} | Trend: {buy.rsTrend}
          </div>
        </div>
        <div className="rounded border border-red-500/30 bg-red-500/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-red-400">
            <TrendingDown className="h-3 w-3" /> SELL / UNDERWEIGHT
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: sell.color }} />
            <span className="font-mono text-sm font-bold" style={{ color: sell.color }}>{sell.etf}</span>
            <span className="text-xs text-muted-foreground">{sell.name}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Weakest RS: {sell.rsNow.toFixed(3)} | Trend: {sell.rsTrend}
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Rule: Rotate out of weakest RS sector into strongest RS sector. Re-evaluate monthly.
      </div>
    </div>
  );
}

// ── Section 4 Components ──────────────────────────────────────────────────────

function FactorRSChart({ factors }: { factors: FactorRS[] }) {
  const W = 480, H = 120;
  const allVals = factors.flatMap((f) => f.rsHistory);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 0.01;

  function toXY(i: number, v: number) {
    return {
      x: (i / 89) * W,
      y: H - ((v - minV) / range) * H,
    };
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 text-xs font-semibold text-muted-foreground">Factor RS vs S&P 500 (90 days)</div>
      <svg viewBox={`0 0 ${W} ${H + 4}`} className="w-full" style={{ height: H + 4 }}>
        {/* RS = 1.0 baseline */}
        <line
          x1={0} y1={H - ((1.0 - minV) / range) * H}
          x2={W} y2={H - ((1.0 - minV) / range) * H}
          stroke="#ffffff18" strokeWidth={1} strokeDasharray="3,3"
        />
        {factors.map((f) => {
          const pts = f.rsHistory.map((v, i) => {
            const { x, y } = toXY(i, v);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polyline key={f.name} points={pts} fill="none" stroke={f.color} strokeWidth={1.5} opacity={0.8} />
          );
        })}
        {/* End labels */}
        {factors.map((f) => {
          const last = f.rsHistory[f.rsHistory.length - 1];
          const { x, y } = toXY(89, last);
          return (
            <text key={f.name} x={x + 3} y={y + 3} fill={f.color} fontSize={8} fontWeight="600">
              {f.etf}
            </text>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {factors.map((f) => (
          <span key={f.name} className="flex items-center gap-1 text-[11px]" style={{ color: f.color }}>
            <span className="h-1.5 w-3 rounded-full inline-block" style={{ background: f.color }} />
            {f.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function FactorCycleGrid({ factors }: { factors: FactorRS[] }) {
  const phaseFitLabels = {
    "Early Expansion":  { leaders: ["Value", "Small Cap"], laggards: ["Low Volatility"] },
    "Late Expansion":   { leaders: ["Momentum", "Growth"], laggards: ["Value", "Low Volatility"] },
    "Early Recession":  { leaders: ["Quality", "Low Volatility"], laggards: ["Momentum", "Small Cap"] },
    "Late Recession":   { leaders: ["Value", "Quality"], laggards: ["Growth", "Momentum"] },
  };

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 text-xs font-semibold text-muted-foreground">Factor Cycle Analysis</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {CYCLE_PHASES.map((p, i) => {
          const fit = phaseFitLabels[p.label as keyof typeof phaseFitLabels];
          const isActive = i === CURRENT_PHASE_IDX;
          return (
            <div key={p.label} className={cn("rounded border p-3", isActive ? "border-border/60" : "border-border/20")}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                <span className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</span>
                {isActive && <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">NOW</span>}
              </div>
              <div className="space-y-1">
                <div className="text-[11px]">
                  <span className="text-emerald-400 font-semibold">Leads: </span>
                  {fit.leaders.map((l, li) => {
                    const f = FACTORS_6.find((x) => x.name === l);
                    return (
                      <span key={l} style={{ color: f?.color ?? "#fff" }} className="font-mono text-[11px] font-semibold">
                        {f?.etf}{li < fit.leaders.length - 1 ? ", " : ""}
                      </span>
                    );
                  })}
                </div>
                <div className="text-[11px]">
                  <span className="text-red-400 font-semibold">Lags: </span>
                  {fit.laggards.map((l, li) => {
                    const f = FACTORS_6.find((x) => x.name === l);
                    return (
                      <span key={l} style={{ color: f?.color ?? "#888" }} className="font-mono text-[11px]">
                        {f?.etf}{li < fit.laggards.length - 1 ? ", " : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FactorLeadershipPanel({ factors }: { factors: FactorRS[] }) {
  const sorted = [...factors].sort((a, b) => b.rsNow - a.rsNow);
  const top2 = sorted.slice(0, 2);
  const bottom2 = sorted.slice(-2);

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 text-xs font-semibold text-muted-foreground">Current Factor Leadership</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="h-3 w-3" /> Outperforming
          </div>
          <div className="space-y-1.5">
            {top2.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
                  <span className="font-mono text-xs font-bold" style={{ color: f.color }}>{f.etf}</span>
                  <span className="text-xs text-muted-foreground">{f.name}</span>
                </div>
                <span className="font-mono text-xs text-emerald-400">{f.rsNow.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-red-400">
            <TrendingDown className="h-3 w-3" /> Underperforming
          </div>
          <div className="space-y-1.5">
            {bottom2.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded border border-red-500/20 bg-red-500/5 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
                  <span className="font-mono text-xs font-bold" style={{ color: f.color }}>{f.etf}</span>
                  <span className="text-xs text-muted-foreground">{f.name}</span>
                </div>
                <span className="font-mono text-xs text-red-400">{f.rsNow.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 5 Components ──────────────────────────────────────────────────────

function RegionalSectorLeadership({ regionals }: { regionals: RegionalData[] }) {
  const regionColors: Record<string, string> = {
    US: "#6366f1", Europe: "#10b981", EM: "#f59e0b", Asia: "#ec4899",
  };

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Globe className="h-3.5 w-3.5" /> Regional Sector Leadership
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {regionals.map((r) => (
          <div key={r.region} className="rounded border border-border/30 bg-muted/10 p-3">
            <div className="mb-2 font-semibold text-xs" style={{ color: regionColors[r.region] }}>
              {r.region}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="text-muted-foreground">Top: </span>
                <span className="font-semibold text-foreground/80">{r.topSector}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />
                <span className="text-muted-foreground">Weak: </span>
                <span className="font-semibold text-foreground/80">{r.bottom}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                <span className="text-muted-foreground">USD: </span>
                <span className={cn("font-semibold",
                  r.usdImpact === "positive" ? "text-emerald-400" :
                  r.usdImpact === "negative" ? "text-red-400" : "text-muted-foreground")}>
                  {r.usdImpact === "positive" ? "Tailwind" : r.usdImpact === "negative" ? "Headwind" : "Neutral"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CurrencyCommodityImpact() {
  const impacts = [
    {
      title: "Strong USD",
      effect: "headwind",
      desc: "Multinational revenues decline when repatriated; benefits domestic-focused sectors.",
      hurt: ["Technology", "Materials", "Energy"],
      help: ["Utilities", "Consumer Staples", "Real Estate"],
    },
    {
      title: "Commodity Super-Cycle",
      effect: "tailwind",
      desc: "Energy & Materials outperform during commodity bull markets; Technology lags in early stages.",
      hurt: ["Technology", "Consumer Discretionary"],
      help: ["Energy", "Materials", "Industrials"],
    },
    {
      title: "Geopolitical Risk",
      effect: "mixed",
      desc: "Defense spending increases benefit Industrials; supply chain reshoring boosts Industrials & Materials.",
      hurt: ["Consumer Discretionary", "Real Estate"],
      help: ["Industrials", "Energy", "Materials"],
      tickers: ["LMT", "NOC", "RTX"],
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {impacts.map((imp) => {
        const borderCls = imp.effect === "tailwind" ? "border-emerald-500/30" :
          imp.effect === "headwind" ? "border-red-500/30" : "border-amber-500/30";
        const bgCls = imp.effect === "tailwind" ? "bg-emerald-500/5" :
          imp.effect === "headwind" ? "bg-red-500/5" : "bg-amber-500/5";
        return (
          <div key={imp.title} className={cn("rounded-lg border p-3", borderCls, bgCls)}>
            <div className="mb-1.5 text-xs font-bold text-foreground/80">{imp.title}</div>
            <div className="mb-2 text-[11px] text-muted-foreground leading-relaxed">{imp.desc}</div>
            <div className="space-y-1 text-[11px]">
              <div>
                <span className="text-emerald-400 font-semibold">Benefits: </span>
                {imp.help.map((h) => {
                  const s = SECTORS_11.find((x) => x.name === h);
                  return s ? (
                    <span key={h} className="font-mono font-semibold mr-1" style={{ color: s.color }}>{s.etf}</span>
                  ) : null;
                })}
              </div>
              <div>
                <span className="text-red-400 font-semibold">Hurts: </span>
                {imp.hurt.map((h) => {
                  const s = SECTORS_11.find((x) => x.name === h);
                  return s ? (
                    <span key={h} className="font-mono text-muted-foreground mr-1">{s.etf}</span>
                  ) : null;
                })}
              </div>
              {imp.tickers && (
                <div>
                  <span className="text-muted-foreground">Key names: </span>
                  {imp.tickers.map((t) => (
                    <span key={t} className="font-mono text-xs font-semibold text-primary mr-1">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CapitalFlowsChart({ flows }: { flows: CapitalFlow[] }) {
  const maxAbs = Math.max(...flows.map((f) => Math.abs(f.flow4w)), 1);
  const W = 480, BAR_H = 26, LBL_W = 50, MID = LBL_W + 140;

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="mb-3 text-xs font-semibold text-muted-foreground">
        Sector ETF Capital Flows (4-week, $B)
      </div>
      <svg viewBox={`0 0 ${W} ${flows.length * BAR_H + 8}`} className="w-full" style={{ height: flows.length * BAR_H + 8 }}>
        <line x1={MID} y1={0} x2={MID} y2={flows.length * BAR_H + 8} stroke="#ffffff18" strokeWidth={1} />
        {flows.map((f, i) => {
          const barLen = (Math.abs(f.flow4w) / maxAbs) * 130;
          const pos = f.flow4w >= 0;
          const bx = pos ? MID : MID - barLen;
          const y = i * BAR_H + 4;
          return (
            <g key={f.etf}>
              <text x={LBL_W - 4} y={y + BAR_H / 2 + 3} textAnchor="end" fill={f.color} fontSize={9} fontWeight="600">
                {f.etf}
              </text>
              <rect x={bx} y={y + 4} width={barLen} height={BAR_H - 10} rx={2}
                fill={pos ? "#10b981" : "#ef4444"} opacity={0.7} />
              <text
                x={pos ? MID + barLen + 3 : MID - barLen - 3}
                y={y + BAR_H / 2 + 3}
                textAnchor={pos ? "start" : "end"}
                fill={pos ? "#10b981" : "#ef4444"}
                fontSize={8}
              >
                {f.flow4w >= 0 ? "+" : ""}{f.flow4w.toFixed(1)}B
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Section tabs ──────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "cycle",    label: "Cycle Framework" },
  { id: "rs",       label: "Relative Strength" },
  { id: "momentum", label: "Momentum" },
  { id: "factor",   label: "Factor Rotation" },
  { id: "global",   label: "Global" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ── Main Component ────────────────────────────────────────────────────────────

export default function SectorRotationStrategy() {
  const [activeSection, setActiveSection] = useState<SectionId>("cycle");

  const { sectorRS, sectorRSRanked, sectorPerfs, seasonality, factorRS, capitalFlows, regionals } =
    useMemo(() => generateAllData(), []);

  return (
    <div className="space-y-4">
      {/* Section nav */}
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeSection === s.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section 1: Business Cycle Framework */}
      {activeSection === "cycle" && (
        <div className="space-y-4">
          <BusinessCycleClock />
          <CyclePerformanceMatrix />
        </div>
      )}

      {/* Section 2: Relative Strength Analysis */}
      {activeSection === "rs" && (
        <div className="space-y-4">
          <RSRankingTable ranked={sectorRSRanked} />
          <RSMomentumMatrix ranked={sectorRSRanked} />
          <RotationSignal ranked={sectorRSRanked} />
        </div>
      )}

      {/* Section 3: Sector Momentum Indicators */}
      {activeSection === "momentum" && (
        <div className="space-y-4">
          <EtfPerfHeatmap perfs={sectorPerfs} />
          <SeasonalityChart data={seasonality} />
          <BreadthBars perfs={sectorPerfs} />
        </div>
      )}

      {/* Section 4: Factor Rotation */}
      {activeSection === "factor" && (
        <div className="space-y-4">
          <FactorRSChart factors={factorRS} />
          <div className="grid gap-4 lg:grid-cols-2">
            <FactorCycleGrid factors={factorRS} />
            <FactorLeadershipPanel factors={factorRS} />
          </div>
        </div>
      )}

      {/* Section 5: Global Sector Rotation */}
      {activeSection === "global" && (
        <div className="space-y-4">
          <RegionalSectorLeadership regionals={regionals} />
          <CurrencyCommodityImpact />
          <CapitalFlowsChart flows={capitalFlows} />
          <div className="rounded-lg border border-border/40 bg-card p-4">
            <div className="mb-3 text-xs font-semibold text-muted-foreground">Geopolitical Sector Impact</div>
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded border border-border/30 bg-muted/10 p-3 space-y-1.5">
                <div className="font-semibold text-foreground/80">Defense Spending</div>
                <div className="text-muted-foreground leading-relaxed">NATO budget increases drive Industrials demand. Key names: LMT, NOC, RTX, BA, GD.</div>
                <div className="flex gap-1 flex-wrap">
                  {["LMT","NOC","RTX"].map((t) => (
                    <span key={t} className="rounded bg-primary/10 px-1.5 py-0.5 font-mono font-semibold text-primary">{t}</span>
                  ))}
                </div>
              </div>
              <div className="rounded border border-border/30 bg-muted/10 p-3 space-y-1.5">
                <div className="font-semibold text-foreground/80">Energy Independence</div>
                <div className="text-muted-foreground leading-relaxed">Domestic energy production themes benefit XLE, XOP. LNG export infrastructure investment rising.</div>
                <div className="flex gap-1 flex-wrap">
                  {["XLE","XOP"].map((t) => (
                    <span key={t} className="rounded bg-red-500/10 px-1.5 py-0.5 font-mono font-semibold text-red-400">{t}</span>
                  ))}
                </div>
              </div>
              <div className="rounded border border-border/30 bg-muted/10 p-3 space-y-1.5">
                <div className="font-semibold text-foreground/80">Supply Chain Reshoring</div>
                <div className="text-muted-foreground leading-relaxed">CHIPS Act + IRA drive domestic manufacturing build-out. Industrials & Materials positioned well.</div>
                <div className="flex gap-1 flex-wrap">
                  {["XLI","XLB"].map((t) => (
                    <span key={t} className="rounded bg-purple-500/10 px-1.5 py-0.5 font-mono font-semibold text-purple-400">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
