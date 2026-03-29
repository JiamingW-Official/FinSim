"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Target,
  Info,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG (seed=682006) ─────────────────────────────────────────────────
let s = 682006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed(seed: number) { s = seed; }

// ── Types ─────────────────────────────────────────────────────────────────────

type CyclePhase = "Recovery" | "Expansion" | "Slowdown" | "Contraction";
type SignalLevel = "bullish" | "neutral" | "bearish";

interface SectorDef {
  name: string;
  etf: string;
  color: string;
  expenseRatio: number; // %
  aumB: number;
  beta: number;
  bestPhases: CyclePhase[];
  description: string;
}

interface SignalDef {
  id: string;
  name: string;
  description: string;
  currentValue: string;
  signal: SignalLevel;
  implication: string;
  detail: string;
}

interface FactorDef {
  name: string;
  color: string;
  description: string;
  bestPhase: CyclePhase;
  worstPhase: CyclePhase;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CYCLE_PHASES: { phase: CyclePhase; color: string; textColor: string; angle: number; description: string; characteristics: string[] }[] = [
  {
    phase: "Recovery",
    color: "#22c55e",
    textColor: "#86efac",
    angle: 45,
    description: "GDP rebounding, rates near lows, credit spreads tightening",
    characteristics: ["Rising PMI from trough", "Loose monetary policy", "Credit spreads tightening", "Earnings trough passed"],
  },
  {
    phase: "Expansion",
    color: "#3b82f6",
    textColor: "#93c5fd",
    angle: 135,
    description: "Strong growth, rising rates, peak earnings momentum",
    characteristics: ["PMI > 55", "Rate hike cycle underway", "Yield curve steepening", "Strong earnings revisions"],
  },
  {
    phase: "Slowdown",
    color: "#f59e0b",
    textColor: "#fcd34d",
    angle: 225,
    description: "Decelerating growth, peak rates, margin pressure",
    characteristics: ["PMI declining from peak", "Rate hike cycle ending", "Yield curve flattening", "Earnings revisions negative"],
  },
  {
    phase: "Contraction",
    color: "#ef4444",
    textColor: "#fca5a5",
    angle: 315,
    description: "Recession, rate cuts, wide credit spreads",
    characteristics: ["PMI < 50", "Rate cut cycle active", "Yield curve inverted/steepening", "Earnings in freefall"],
  },
];

const CURRENT_PHASE: CyclePhase = "Slowdown";

const SECTORS: SectorDef[] = [
  {
    name: "Technology",
    etf: "XLK",
    color: "#6366f1",
    expenseRatio: 0.10,
    aumB: 62.4,
    beta: 1.24,
    bestPhases: ["Recovery", "Expansion"],
    description: "Software, semiconductors, hardware; high growth, rate-sensitive",
  },
  {
    name: "Financials",
    etf: "XLF",
    color: "#3b82f6",
    expenseRatio: 0.10,
    aumB: 38.1,
    beta: 1.14,
    bestPhases: ["Recovery", "Expansion"],
    description: "Banks, insurers, asset managers; benefits from rising rates and loan growth",
  },
  {
    name: "Healthcare",
    etf: "XLV",
    color: "#10b981",
    expenseRatio: 0.10,
    aumB: 27.6,
    beta: 0.68,
    bestPhases: ["Slowdown", "Contraction"],
    description: "Defensive sector; stable demand regardless of economic cycle",
  },
  {
    name: "Energy",
    etf: "XLE",
    color: "#ef4444",
    expenseRatio: 0.10,
    aumB: 22.8,
    beta: 1.31,
    bestPhases: ["Expansion", "Slowdown"],
    description: "Oil majors, E&P, services; driven by commodity prices and global demand",
  },
  {
    name: "Industrials",
    etf: "XLI",
    color: "#8b5cf6",
    expenseRatio: 0.10,
    aumB: 18.5,
    beta: 1.05,
    bestPhases: ["Recovery", "Expansion"],
    description: "Aerospace, defense, transportation; tracks capex cycle closely",
  },
  {
    name: "Consumer Staples",
    etf: "XLP",
    color: "#84cc16",
    expenseRatio: 0.10,
    aumB: 16.2,
    beta: 0.56,
    bestPhases: ["Contraction", "Slowdown"],
    description: "Food, beverages, household products; ultra-defensive, stable dividends",
  },
  {
    name: "Consumer Disc.",
    etf: "XLY",
    color: "#f59e0b",
    expenseRatio: 0.10,
    aumB: 14.7,
    beta: 1.19,
    bestPhases: ["Recovery", "Expansion"],
    description: "Retail, autos, leisure; highly cyclical, leveraged to consumer confidence",
  },
  {
    name: "Real Estate",
    etf: "XLRE",
    color: "#f97316",
    expenseRatio: 0.10,
    aumB: 8.3,
    beta: 0.83,
    bestPhases: ["Recovery", "Contraction"],
    description: "REITs; sensitive to interest rates, benefits from rate cuts",
  },
  {
    name: "Materials",
    etf: "XLB",
    color: "#14b8a6",
    expenseRatio: 0.10,
    aumB: 7.1,
    beta: 1.08,
    bestPhases: ["Recovery", "Expansion"],
    description: "Chemicals, metals, mining; early-cycle commodity play",
  },
  {
    name: "Utilities",
    etf: "XLU",
    color: "#06b6d4",
    expenseRatio: 0.10,
    aumB: 11.4,
    beta: 0.42,
    bestPhases: ["Contraction", "Slowdown"],
    description: "Electric, gas, water utilities; bond proxies, very defensive",
  },
  {
    name: "Comm. Services",
    etf: "XLC",
    color: "#ec4899",
    expenseRatio: 0.10,
    aumB: 19.3,
    beta: 0.98,
    bestPhases: ["Expansion", "Recovery"],
    description: "Media, telecom, interactive entertainment; blended cyclical/defensive",
  },
];

// Historical avg returns by phase (seeded synthetic data)
function buildPhaseReturns(): Record<string, Record<CyclePhase, number>> {
  resetSeed(682006);
  const BASE: Record<CyclePhase, number[]> = {
    Recovery:    [8, 9, 3, 6, 7, 1, 10, 5, 8, 2, 7],
    Expansion:   [12, 8, 2, 10, 9, 0, 11, 4, 6, -1, 8],
    Slowdown:    [-2, -4, 4, 3, -3, 5, -5, 2, -2, 6, -3],
    Contraction: [-14, -18, -3, -10, -16, -2, -20, -5, -15, -1, -12],
  };
  const result: Record<string, Record<CyclePhase, number>> = {};
  SECTORS.forEach((sec, i) => {
    result[sec.etf] = {
      Recovery: BASE.Recovery[i] + (rand() - 0.5) * 3,
      Expansion: BASE.Expansion[i] + (rand() - 0.5) * 3,
      Slowdown: BASE.Slowdown[i] + (rand() - 0.5) * 2,
      Contraction: BASE.Contraction[i] + (rand() - 0.5) * 4,
    };
  });
  return result;
}

const PHASE_RETURNS = buildPhaseReturns();

const ROTATION_SIGNALS: SignalDef[] = [
  {
    id: "pmi",
    name: "Manufacturing PMI",
    description: "Purchasing Managers Index — leading indicator of industrial activity",
    currentValue: "48.3",
    signal: "bearish",
    implication: "Below 50 signals contraction; rotate defensively",
    detail: "PMI has been below 50 for 4 consecutive months, historically associated with late-cycle / early contraction.",
  },
  {
    id: "yield_curve",
    name: "Yield Curve (2s10s)",
    description: "10Y minus 2Y Treasury spread — recession predictor",
    currentValue: "-18 bps",
    signal: "bearish",
    implication: "Inverted curve historically leads recession by 12–18 months",
    detail: "Curve re-inverted after brief steepening; historically this 're-inversion' is more ominous than initial inversion.",
  },
  {
    id: "credit_spreads",
    name: "IG Credit Spreads",
    description: "Investment-grade corporate bond spread over Treasuries",
    currentValue: "142 bps",
    signal: "neutral",
    implication: "Spreads widened but not at recession levels; monitor for acceleration",
    detail: "Spreads up from 95 bps 6 months ago. Below 200 bps historically consistent with no imminent recession.",
  },
  {
    id: "earnings_breadth",
    name: "Earnings Revision Breadth",
    description: "% of S&P 500 companies with upward EPS revisions minus downward",
    currentValue: "-22%",
    signal: "bearish",
    implication: "Broad earnings cuts historically precede sector outperformance of defensives",
    detail: "Only 39% of companies seeing upward revisions vs 61% cuts. Energy and Healthcare are bucking the trend.",
  },
  {
    id: "ism_services",
    name: "Services PMI (ISM)",
    description: "ISM Non-Manufacturing Index — covers ~80% of U.S. economy",
    currentValue: "51.8",
    signal: "neutral",
    implication: "Services still expanding, providing buffer against manufacturing weakness",
    detail: "Services PMI has been more resilient than manufacturing. Consumer-facing businesses still showing modest growth.",
  },
  {
    id: "fed_rate",
    name: "Fed Funds Rate Trend",
    description: "Direction and level of policy rate — key cycle driver",
    currentValue: "Paused at 5.25%",
    signal: "neutral",
    implication: "Rate pause is neutral; first cut would be bullish for rate-sensitive sectors",
    detail: "Fed is on hold with one more potential hike priced in. Historically, first cut is when to rotate into Utilities/XLRE/XLV.",
  },
];

const FACTORS: FactorDef[] = [
  {
    name: "Value",
    color: "#3b82f6",
    description: "Cheap on P/E, P/B, P/S metrics; outperforms in early cycle when beaten-down stocks recover",
    bestPhase: "Recovery",
    worstPhase: "Contraction",
  },
  {
    name: "Growth",
    color: "#6366f1",
    description: "High revenue/earnings growth stocks; peaks in mid-cycle expansion before rate sensitivity bites",
    bestPhase: "Expansion",
    worstPhase: "Slowdown",
  },
  {
    name: "Quality",
    color: "#10b981",
    description: "High ROE, low leverage, stable earnings; defensive quality thrives in late cycle and contraction",
    bestPhase: "Slowdown",
    worstPhase: "Recovery",
  },
  {
    name: "Momentum",
    color: "#f59e0b",
    description: "12-1 month price momentum; powerful in trending markets, dangerous at cycle turns",
    bestPhase: "Expansion",
    worstPhase: "Contraction",
  },
  {
    name: "Low Volatility",
    color: "#ec4899",
    description: "Minimum variance / low-beta stocks; shine when markets turn volatile in late cycle",
    bestPhase: "Contraction",
    worstPhase: "Expansion",
  },
];

// Factor returns by phase (synthetic)
function buildFactorReturns(): Record<string, Record<CyclePhase, number>> {
  resetSeed(682006 + 1);
  return {
    Value:          { Recovery: 9.2, Expansion: 6.1, Slowdown: 1.2, Contraction: -8.4 },
    Growth:         { Recovery: 7.8, Expansion: 14.3, Slowdown: -3.1, Contraction: -18.7 },
    Quality:        { Recovery: 4.1, Expansion: 7.2, Slowdown: 5.8, Contraction: -2.1 },
    Momentum:       { Recovery: 6.3, Expansion: 11.8, Slowdown: 2.4, Contraction: -14.2 },
    "Low Volatility": { Recovery: 3.2, Expansion: 4.8, Slowdown: 6.4, Contraction: 1.8 },
  };
}

const FACTOR_RETURNS = buildFactorReturns();

// Tactical allocation by phase
const TACTICAL_ALLOCATION: Record<CyclePhase, Record<string, number>> = {
  Recovery:    { XLK: 18, XLF: 16, XLY: 14, XLI: 13, XLB: 10, XLC: 9, XLE: 8, XLRE: 6, XLV: 4, XLP: 1, XLU: 1 },
  Expansion:   { XLK: 22, XLF: 15, XLE: 14, XLY: 12, XLI: 11, XLC: 10, XLB: 6, XLV: 5, XLRE: 2, XLP: 2, XLU: 1 },
  Slowdown:    { XLV: 20, XLP: 18, XLU: 14, XLE: 12, XLK: 10, XLC: 9, XLF: 7, XLI: 5, XLY: 3, XLRE: 2, XLB: 0 },
  Contraction: { XLV: 24, XLP: 22, XLU: 20, XLRE: 10, XLF: 8, XLC: 7, XLK: 5, XLE: 2, XLI: 1, XLY: 1, XLB: 0 },
};

// ── Helper Components ─────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: SignalLevel }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
      signal === "bullish" && "bg-green-500/20 text-green-400",
      signal === "neutral" && "bg-yellow-500/20 text-yellow-400",
      signal === "bearish" && "bg-red-500/20 text-red-400",
    )}>
      {signal === "bullish" && <TrendingUp className="w-3 h-3" />}
      {signal === "neutral" && <Minus className="w-3 h-3" />}
      {signal === "bearish" && <TrendingDown className="w-3 h-3" />}
      {signal.charAt(0).toUpperCase() + signal.slice(1)}
    </span>
  );
}

function ReturnCell({ value }: { value: number }) {
  const color = value > 6 ? "#22c55e"
    : value > 2 ? "#86efac"
    : value > -2 ? "#94a3b8"
    : value > -8 ? "#fca5a5"
    : "#ef4444";
  const bg = value > 6 ? "rgba(34,197,94,0.25)"
    : value > 2 ? "rgba(134,239,172,0.12)"
    : value > -2 ? "rgba(148,163,184,0.08)"
    : value > -8 ? "rgba(252,165,165,0.12)"
    : "rgba(239,68,68,0.25)";
  return (
    <td className="px-3 py-2 text-center text-xs font-mono" style={{ color, backgroundColor: bg }}>
      {value > 0 ? "+" : ""}{value.toFixed(1)}%
    </td>
  );
}

// ── Tab 1: Business Cycle Clock ───────────────────────────────────────────────

function BusinessCycleClock() {
  const [activePhase, setActivePhase] = useState<CyclePhase>(CURRENT_PHASE);
  const activeData = CYCLE_PHASES.find(p => p.phase === activePhase)!;
  const currentData = CYCLE_PHASES.find(p => p.phase === CURRENT_PHASE)!;

  // SVG clock parameters
  const cx = 200, cy = 200, r = 150, innerR = 70;

  // Best sectors per phase
  const PHASE_SECTORS: Record<CyclePhase, string[]> = {
    Recovery:    ["XLK", "XLF", "XLY", "XLI", "XLB"],
    Expansion:   ["XLK", "XLE", "XLF", "XLI", "XLC"],
    Slowdown:    ["XLV", "XLP", "XLU", "XLE"],
    Contraction: ["XLV", "XLP", "XLU", "XLRE"],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Business Cycle Clock</h2>
          <p className="text-xs text-muted-foreground">Current phase drives optimal sector allocation</p>
        </div>
        <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          Current: {CURRENT_PHASE}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Clock */}
        <Card className="bg-card border-border/50">
          <CardContent className="pt-4 flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="w-full max-w-sm" style={{ maxHeight: 340 }}>
              {/* Background ring */}
              <circle cx={cx} cy={cy} r={r + 18} fill="rgba(15,23,42,0.9)" stroke="#1e293b" strokeWidth={1} />

              {/* Phase arcs */}
              {CYCLE_PHASES.map((p, i) => {
                const startDeg = i * 90 - 90;
                const endDeg = startDeg + 90;
                const toRad = (d: number) => (d * Math.PI) / 180;
                const x1 = cx + r * Math.cos(toRad(startDeg));
                const y1 = cy + r * Math.sin(toRad(startDeg));
                const x2 = cx + r * Math.cos(toRad(endDeg));
                const y2 = cy + r * Math.sin(toRad(endDeg));
                const xi1 = cx + innerR * Math.cos(toRad(startDeg));
                const yi1 = cy + innerR * Math.sin(toRad(startDeg));
                const xi2 = cx + innerR * Math.cos(toRad(endDeg));
                const yi2 = cy + innerR * Math.sin(toRad(endDeg));
                const isActive = p.phase === activePhase;
                const isCurrent = p.phase === CURRENT_PHASE;
                const midDeg = startDeg + 45;
                const labelR = (r + innerR) / 2;
                const lx = cx + labelR * Math.cos(toRad(midDeg));
                const ly = cy + labelR * Math.sin(toRad(midDeg));

                return (
                  <g key={p.phase} onClick={() => setActivePhase(p.phase)} style={{ cursor: "pointer" }}>
                    <path
                      d={`M${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} L${xi2},${yi2} A${innerR},${innerR} 0 0,0 ${xi1},${yi1} Z`}
                      fill={isActive ? p.color : `${p.color}33`}
                      stroke={isCurrent ? "#fff" : "#334155"}
                      strokeWidth={isCurrent ? 2.5 : 1}
                      style={{ transition: "fill 0.2s" }}
                    />
                    <text
                      x={lx} y={ly - 6}
                      textAnchor="middle"
                      fill={isActive ? "#fff" : "#94a3b8"}
                      fontSize={isActive ? 11 : 10}
                      fontWeight={isActive ? "700" : "400"}
                    >
                      {p.phase}
                    </text>
                    {isCurrent && (
                      <text x={lx} y={ly + 8} textAnchor="middle" fill="#fff" fontSize={8}>
                        ▶ NOW
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Dividers */}
              {[0, 90, 180, 270].map((deg) => {
                const toRad = (d: number) => (d * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={cx + innerR * Math.cos(toRad(deg))}
                    y1={cy + innerR * Math.sin(toRad(deg))}
                    x2={cx + r * Math.cos(toRad(deg))}
                    y2={cy + r * Math.sin(toRad(deg))}
                    stroke="#0f172a" strokeWidth={2}
                  />
                );
              })}

              {/* Center label */}
              <circle cx={cx} cy={cy} r={innerR - 4} fill="#0f172a" stroke="#1e293b" strokeWidth={1} />
              <text x={cx} y={cy - 10} textAnchor="middle" fill="#94a3b8" fontSize={9}>CYCLE</text>
              <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="700">
                {activePhase}
              </text>
              <circle cx={cx} cy={cy} r={6} fill={activeData.color} />

              {/* Cycle direction arrows */}
              <text x={cx + r + 22} y={cy + 4} textAnchor="middle" fill="#475569" fontSize={10}>→</text>
              <text x={cx - r - 22} y={cy + 4} textAnchor="middle" fill="#475569" fontSize={10}>←</text>
              <text x={cx} y={cy - r - 22} textAnchor="middle" fill="#475569" fontSize={10}>↑</text>
              <text x={cx} y={cy + r + 28} textAnchor="middle" fill="#475569" fontSize={10}>↓</text>
            </svg>
          </CardContent>
        </Card>

        {/* Phase details */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Card className="bg-card border-border/50" style={{ borderLeftColor: activeData.color, borderLeftWidth: 3 }}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold" style={{ color: activeData.color }}>
                    {activePhase} Phase
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground">{activeData.description}</p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Key Characteristics</p>
                    <ul className="space-y-1">
                      {activeData.characteristics.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: activeData.color }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold text-muted-foreground">Best Sectors This Phase</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {PHASE_SECTORS[activePhase].map((etf) => {
                      const sec = SECTORS.find(s => s.etf === etf);
                      if (!sec) return null;
                      return (
                        <span key={etf} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground border border-border">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                          {etf}
                          <span className="text-muted-foreground">— {sec.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-white">Transition signal: </span>
                    {activePhase === "Recovery" && "Watch for PMI crossing 55 and yield curve steepening — signals shift to Expansion."}
                    {activePhase === "Expansion" && "Watch for PMI topping out, yield curve flattening, Fed rate hikes accelerating — signals shift to Slowdown."}
                    {activePhase === "Slowdown" && "Watch for PMI crossing below 50, credit spread widening above 200 bps — signals shift to Contraction."}
                    {activePhase === "Contraction" && "Watch for PMI bottoming, Fed cutting rates, credit spreads tightening — signals shift to Recovery."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Cycle phase selector (row) */}
      <div className="grid grid-cols-4 gap-3">
        {CYCLE_PHASES.map((p) => (
          <button
            key={p.phase}
            onClick={() => setActivePhase(p.phase)}
            className={cn(
              "rounded-lg border p-3 text-left transition-all",
              activePhase === p.phase
                ? "border-opacity-70 bg-opacity-10"
                : "border-border bg-card hover:border-muted-foreground",
            )}
            style={activePhase === p.phase ? {
              borderColor: p.color,
              backgroundColor: `${p.color}15`,
            } : {}}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-xs font-semibold text-white">{p.phase}</span>
              {p.phase === CURRENT_PHASE && (
                <span className="ml-auto text-xs font-bold" style={{ color: p.color }}>NOW</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-snug">{p.description.split(",")[0]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Sector Performance Heatmap ────────────────────────────────────────

function SectorPerformance() {
  const phases: CyclePhase[] = ["Recovery", "Expansion", "Slowdown", "Contraction"];
  const phaseColors: Record<CyclePhase, string> = {
    Recovery: "#22c55e",
    Expansion: "#3b82f6",
    Slowdown: "#f59e0b",
    Contraction: "#ef4444",
  };

  // SVG heatmap
  const cellW = 88, cellH = 32;
  const labelW = 110;
  const headerH = 36;
  const svgW = labelW + cellW * 4 + 8;
  const svgH = headerH + cellH * SECTORS.length + 8;

  function heatColor(val: number): string {
    if (val > 10) return "#166534";
    if (val > 5)  return "#15803d";
    if (val > 2)  return "#1a4228";
    if (val > -2) return "#1e293b";
    if (val > -8) return "#450a0a";
    return "#7f1d1d";
  }
  function textColorForVal(val: number): string {
    if (val > 2) return "#86efac";
    if (val > -2) return "#94a3b8";
    return "#fca5a5";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Sector Performance by Cycle Phase</h2>
          <p className="text-xs text-muted-foreground">Historical average annualized returns per phase (GICS sectors)</p>
        </div>
      </div>

      {/* Heatmap SVG */}
      <Card className="bg-card border-border/50 overflow-hidden">
        <CardContent className="pt-4 pb-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ width: "100%", minWidth: 480 }}
          >
            {/* Header row */}
            <rect x={0} y={0} width={svgW} height={headerH} fill="#0f172a" />
            <text x={labelW / 2} y={22} textAnchor="middle" fill="#475569" fontSize={11} fontWeight="600">SECTOR</text>
            {phases.map((ph, i) => (
              <g key={ph}>
                <rect
                  x={labelW + i * cellW + 2} y={4}
                  width={cellW - 4} height={headerH - 8}
                  rx={4}
                  fill={`${phaseColors[ph]}22`}
                  stroke={phaseColors[ph]}
                  strokeWidth={1}
                />
                <text
                  x={labelW + i * cellW + cellW / 2} y={22}
                  textAnchor="middle"
                  fill={phaseColors[ph]}
                  fontSize={11}
                  fontWeight="700"
                >
                  {ph}
                </text>
              </g>
            ))}

            {/* Data rows */}
            {SECTORS.map((sec, rowIdx) => {
              const y = headerH + rowIdx * cellH;
              const isEven = rowIdx % 2 === 0;
              return (
                <g key={sec.etf}>
                  <rect x={0} y={y} width={svgW} height={cellH} fill={isEven ? "#0f172a" : "#080f1a"} />
                  {/* Sector label */}
                  <rect x={4} y={y + 4} width={6} height={cellH - 8} rx={2} fill={sec.color} />
                  <text x={16} y={y + cellH / 2 - 4} fill="#e2e8f0" fontSize={10} fontWeight="600" dominantBaseline="middle">
                    {sec.etf}
                  </text>
                  <text x={16} y={y + cellH / 2 + 8} fill="#64748b" fontSize={9} dominantBaseline="middle">
                    {sec.name.length > 16 ? sec.name.slice(0, 15) + "…" : sec.name}
                  </text>

                  {/* Phase cells */}
                  {phases.map((ph, colIdx) => {
                    const val = PHASE_RETURNS[sec.etf]?.[ph] ?? 0;
                    const cx2 = labelW + colIdx * cellW;
                    return (
                      <g key={ph}>
                        <rect
                          x={cx2 + 2} y={y + 2}
                          width={cellW - 4} height={cellH - 4}
                          rx={3}
                          fill={heatColor(val)}
                        />
                        <text
                          x={cx2 + cellW / 2} y={y + cellH / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={textColorForVal(val)}
                          fontSize={11}
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {val > 0 ? "+" : ""}{val.toFixed(1)}%
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 px-1">
        <span className="text-xs text-muted-foreground">Return Legend:</span>
        {[
          { label: "> +10%", bg: "#166534", text: "#86efac" },
          { label: "+2 to +10%", bg: "#1a4228", text: "#86efac" },
          { label: "-2 to +2%", bg: "#1e293b", text: "#94a3b8" },
          { label: "-8 to -2%", bg: "#450a0a", text: "#fca5a5" },
          { label: "< -8%", bg: "#7f1d1d", text: "#fca5a5" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-8 h-4 rounded text-center text-xs leading-4" style={{ backgroundColor: item.bg, color: item.text }}>
              {" "}
            </span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Performance table */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Phase Return Summary Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-2 text-left text-muted-foreground font-medium">Sector</th>
                  <th className="px-3 py-2 text-center text-green-400 font-medium">Recovery</th>
                  <th className="px-3 py-2 text-center text-primary font-medium">Expansion</th>
                  <th className="px-3 py-2 text-center text-yellow-400 font-medium">Slowdown</th>
                  <th className="px-3 py-2 text-center text-red-400 font-medium">Contraction</th>
                </tr>
              </thead>
              <tbody>
                {SECTORS.map((sec, i) => (
                  <tr key={sec.etf} className={cn("border-b border-border", i % 2 === 0 ? "bg-transparent" : "bg-muted/20")}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                        <span className="font-semibold text-white">{sec.etf}</span>
                        <span className="text-muted-foreground">{sec.name}</span>
                      </div>
                    </td>
                    {phases.map((ph) => (
                      <ReturnCell key={ph} value={PHASE_RETURNS[sec.etf]?.[ph] ?? 0} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Rotation Signals ───────────────────────────────────────────────────

function RotationSignals() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const bullCount = ROTATION_SIGNALS.filter(s => s.signal === "bullish").length;
  const bearCount = ROTATION_SIGNALS.filter(s => s.signal === "bearish").length;
  const neutralCount = ROTATION_SIGNALS.filter(s => s.signal === "neutral").length;

  const overallSignal: SignalLevel = bearCount >= 3 ? "bearish" : bullCount >= 3 ? "bullish" : "neutral";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-yellow-500/10">
          <Activity className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Rotation Signals Dashboard</h2>
          <p className="text-xs text-muted-foreground">PMI, yield curve, credit spreads, earnings revisions as rotation triggers</p>
        </div>
      </div>

      {/* Summary banner */}
      <Card className={cn(
        "border",
        overallSignal === "bullish" && "border-green-500/40 bg-green-500/5",
        overallSignal === "neutral" && "border-yellow-500/40 bg-yellow-500/5",
        overallSignal === "bearish" && "border-red-500/40 bg-red-500/5",
      )}>
        <CardContent className="px-5 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Overall Rotation Signal</p>
              <div className="flex items-center gap-3">
                <SignalBadge signal={overallSignal} />
                <span className="text-sm text-muted-foreground">
                  {overallSignal === "bearish"
                    ? "Rotate toward defensives: XLV, XLP, XLU"
                    : overallSignal === "bullish"
                    ? "Rotate toward cyclicals: XLK, XLF, XLY"
                    : "Hold balanced allocation, monitor for turn"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400 font-semibold">{bullCount} Bullish</span>
              <span className="text-yellow-400 font-semibold">{neutralCount} Neutral</span>
              <span className="text-red-400 font-semibold">{bearCount} Bearish</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROTATION_SIGNALS.map((sig) => {
          const isOpen = expanded === sig.id;
          return (
            <motion.div key={sig.id} layout>
              <Card
                className={cn(
                  "bg-card border-border/50 cursor-pointer transition-all hover:border-muted-foreground",
                  isOpen && "border-muted-foreground",
                )}
                onClick={() => setExpanded(isOpen ? null : sig.id)}
              >
                <CardContent className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{sig.name}</p>
                      <p className="text-xs text-muted-foreground">{sig.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <SignalBadge signal={sig.signal} />
                      <span className="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                        {sig.currentValue}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{sig.implication}</p>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 border-t border-border/50 mt-1">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary" />
                            <p>{sig.detail}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-xs text-muted-foreground">
                    {isOpen ? "Click to collapse" : "Click for analysis"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Cycle positioning recommendation */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Current Cycle Positioning</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Overweight", sectors: ["XLV", "XLP", "XLU"], color: "green" },
              { label: "Neutral", sectors: ["XLE", "XLC", "XLK"], color: "yellow" },
              { label: "Underweight", sectors: ["XLF", "XLY", "XLB"], color: "red" },
            ].map(({ label, sectors, color }) => (
              <div key={label} className={cn(
                "rounded-lg p-3 border",
                color === "green" && "border-green-500/30 bg-green-500/5",
                color === "yellow" && "border-yellow-500/30 bg-yellow-500/5",
                color === "red" && "border-red-500/30 bg-red-500/5",
              )}>
                <p className={cn(
                  "text-xs font-semibold mb-2",
                  color === "green" && "text-green-400",
                  color === "yellow" && "text-yellow-400",
                  color === "red" && "text-red-400",
                )}>{label}</p>
                <div className="space-y-1">
                  {sectors.map((etf) => {
                    const sec = SECTORS.find(s => s.etf === etf);
                    return (
                      <div key={etf} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sec?.color }} />
                        <span className="text-xs text-muted-foreground">{etf}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on {CURRENT_PHASE} phase signals. Signals update when PMI, yield curve, or credit spreads cross key thresholds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Factor Rotation ────────────────────────────────────────────────────

function FactorRotation() {
  const phases: CyclePhase[] = ["Recovery", "Expansion", "Slowdown", "Contraction"];
  const phaseColors: Record<CyclePhase, string> = {
    Recovery: "#22c55e",
    Expansion: "#3b82f6",
    Slowdown: "#f59e0b",
    Contraction: "#ef4444",
  };

  // SVG Factor Cycle Chart (radar-like bar chart per phase)
  const chartW = 480, chartH = 280;
  const barGroupW = chartW / phases.length;
  const maxVal = 16;
  const minVal = -20;
  const range = maxVal - minVal;
  const chartBottom = chartH - 30;
  const chartTop = 20;
  const chartArea = chartBottom - chartTop;

  function valToY(v: number): number {
    return chartBottom - ((v - minVal) / range) * chartArea;
  }

  const zeroY = valToY(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Factor Rotation by Business Cycle</h2>
          <p className="text-xs text-muted-foreground">Value, Growth, Quality, Momentum, Low-Vol factor returns per phase</p>
        </div>
      </div>

      {/* Factor cycle chart */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-sm">Factor Return by Cycle Phase (avg annualized %)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4 overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", minWidth: 400 }}>
            {/* Y gridlines */}
            {[-15, -10, -5, 0, 5, 10, 15].map((v) => (
              <g key={v}>
                <line x1={30} y1={valToY(v)} x2={chartW - 10} y2={valToY(v)} stroke="#1e293b" strokeWidth={1} />
                <text x={24} y={valToY(v)} textAnchor="end" dominantBaseline="middle" fill="#475569" fontSize={9}>
                  {v > 0 ? "+" : ""}{v}%
                </text>
              </g>
            ))}

            {/* Zero line */}
            <line x1={30} y1={zeroY} x2={chartW - 10} y2={zeroY} stroke="#475569" strokeWidth={1.5} strokeDasharray="4,3" />

            {/* Bars per phase */}
            {phases.map((ph, phIdx) => {
              const groupX = 30 + phIdx * ((chartW - 40) / phases.length);
              const groupW2 = (chartW - 40) / phases.length;
              const barW = (groupW2 - 16) / FACTORS.length;

              return (
                <g key={ph}>
                  {/* Phase label */}
                  <text
                    x={groupX + groupW2 / 2} y={chartH - 8}
                    textAnchor="middle" fill={phaseColors[ph]} fontSize={11} fontWeight="700"
                  >
                    {ph}
                  </text>

                  {/* Background */}
                  <rect
                    x={groupX + 2} y={chartTop}
                    width={groupW2 - 4} height={chartBottom - chartTop}
                    fill={`${phaseColors[ph]}08`}
                    rx={2}
                  />

                  {/* Bars */}
                  {FACTORS.map((factor, fIdx) => {
                    const val = FACTOR_RETURNS[factor.name]?.[ph] ?? 0;
                    const x = groupX + 8 + fIdx * barW;
                    const y1 = val >= 0 ? valToY(val) : zeroY;
                    const y2 = val >= 0 ? zeroY : valToY(val);
                    const h = Math.abs(y2 - y1);

                    return (
                      <g key={factor.name}>
                        <rect
                          x={x} y={y1}
                          width={barW - 2} height={h}
                          fill={factor.color}
                          fillOpacity={0.8}
                          rx={2}
                        />
                        {Math.abs(val) > 4 && (
                          <text
                            x={x + (barW - 2) / 2}
                            y={val >= 0 ? y1 - 3 : y2 + 10}
                            textAnchor="middle"
                            fill={factor.color}
                            fontSize={8}
                            fontWeight="600"
                          >
                            {val > 0 ? "+" : ""}{val.toFixed(1)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap mt-2 px-2">
            {FACTORS.map((f) => (
              <div key={f.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: f.color }} />
                <span className="text-xs text-muted-foreground">{f.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {FACTORS.map((factor) => {
          const isCurrent = factor.bestPhase === CURRENT_PHASE;
          return (
            <Card
              key={factor.name}
              className={cn(
                "bg-card border-border/50 transition-all",
                isCurrent && "ring-1",
              )}
              style={(isCurrent ? { ringColor: factor.color, borderColor: factor.color } : {}) as React.CSSProperties}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold" style={{ color: factor.color }}>
                    {factor.name}
                  </CardTitle>
                  {isCurrent && (
                    <Badge className="text-xs" style={{ backgroundColor: `${factor.color}25`, color: factor.color, borderColor: `${factor.color}40` }}>
                      Best Now
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <p className="text-xs text-muted-foreground">{factor.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded p-2 bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 font-medium mb-0.5">Best Phase</p>
                    <p className="text-xs text-foreground">{factor.bestPhase}</p>
                  </div>
                  <div className="rounded p-2 bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 font-medium mb-0.5">Worst Phase</p>
                    <p className="text-xs text-foreground">{factor.worstPhase}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {phases.map((ph) => {
                    const val = FACTOR_RETURNS[factor.name]?.[ph] ?? 0;
                    return (
                      <div key={ph} className="text-center">
                        <p className="text-xs text-muted-foreground mb-0.5">{ph.slice(0, 3)}</p>
                        <p className={cn("text-xs font-mono font-semibold", val > 0 ? "text-green-400" : "text-red-400")}>
                          {val > 0 ? "+" : ""}{val.toFixed(1)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 5: ETF Implementation ─────────────────────────────────────────────────

function ETFImplementation() {
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(CURRENT_PHASE);
  const alloc = TACTICAL_ALLOCATION[selectedPhase];

  const phaseColors: Record<CyclePhase, string> = {
    Recovery: "#22c55e",
    Expansion: "#3b82f6",
    Slowdown: "#f59e0b",
    Contraction: "#ef4444",
  };

  // SVG allocation bar chart
  const barChartW = 480;
  const barH = 22;
  const sortedSectors = [...SECTORS].sort((a, b) => (alloc[b.etf] ?? 0) - (alloc[a.etf] ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <DollarSign className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">ETF Implementation & Tactical Allocation</h2>
          <p className="text-xs text-muted-foreground">SPDR sector ETFs (XL-series) with tactical weights per cycle phase</p>
        </div>
      </div>

      {/* Phase selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">View allocation for phase:</span>
        {(["Recovery", "Expansion", "Slowdown", "Contraction"] as CyclePhase[]).map((ph) => (
          <button
            key={ph}
            onClick={() => setSelectedPhase(ph)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium border transition-all",
              selectedPhase === ph
                ? "text-white"
                : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground bg-transparent",
            )}
            style={selectedPhase === ph ? {
              backgroundColor: `${phaseColors[ph]}25`,
              borderColor: phaseColors[ph],
              color: phaseColors[ph],
            } : {}}
          >
            {ph}
            {ph === CURRENT_PHASE && " (Now)"}
          </button>
        ))}
      </div>

      {/* Allocation chart */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">
            Tactical Allocation — <span style={{ color: phaseColors[selectedPhase] }}>{selectedPhase} Phase</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <svg viewBox={`0 0 ${barChartW} ${(barH + 6) * SECTORS.length + 10}`} style={{ width: "100%" }}>
            {sortedSectors.map((sec, i) => {
              const pct = alloc[sec.etf] ?? 0;
              const barWidth = (pct / 25) * (barChartW - 140);
              const y = i * (barH + 6) + 4;
              return (
                <g key={sec.etf}>
                  {/* ETF label */}
                  <text x={0} y={y + barH / 2} dominantBaseline="middle" fill="#e2e8f0" fontSize={11} fontWeight="600">
                    {sec.etf}
                  </text>
                  {/* Sector name */}
                  <text x={44} y={y + barH / 2} dominantBaseline="middle" fill="#64748b" fontSize={9}>
                    {sec.name.slice(0, 14)}
                  </text>
                  {/* Bar track */}
                  <rect x={140} y={y + 4} width={barChartW - 160} height={barH - 8} rx={3} fill="#1e293b" />
                  {/* Bar fill */}
                  {pct > 0 && (
                    <rect
                      x={140} y={y + 4}
                      width={barWidth} height={barH - 8}
                      rx={3}
                      fill={sec.color}
                      fillOpacity={0.8}
                    />
                  )}
                  {/* Pct label */}
                  <text
                    x={140 + barWidth + 6}
                    y={y + barH / 2}
                    dominantBaseline="middle"
                    fill={pct > 0 ? sec.color : "#475569"}
                    fontSize={10}
                    fontWeight="600"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* ETF details table */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">SPDR Sector ETF Reference</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50">
                  <th className="px-4 py-2 text-left text-muted-foreground font-medium">ETF</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Sector</th>
                  <th className="px-3 py-2 text-center text-muted-foreground font-medium">Exp. Ratio</th>
                  <th className="px-3 py-2 text-center text-muted-foreground font-medium">AUM ($B)</th>
                  <th className="px-3 py-2 text-center text-muted-foreground font-medium">Beta</th>
                  <th className="px-3 py-2 text-center text-muted-foreground font-medium">
                    {selectedPhase} Wt.
                  </th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium hidden lg:table-cell">Best Phases</th>
                </tr>
              </thead>
              <tbody>
                {SECTORS.map((sec, i) => {
                  const pct = alloc[sec.etf] ?? 0;
                  const isBest = sec.bestPhases.includes(selectedPhase);
                  return (
                    <tr key={sec.etf} className={cn("border-b border-border", i % 2 === 0 ? "" : "bg-muted/20")}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                          <span className="font-semibold text-white">{sec.etf}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{sec.name}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{sec.expenseRatio.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">${sec.aumB.toFixed(1)}B</td>
                      <td className="px-3 py-2 text-center">
                        <span className={cn(
                          "font-mono",
                          sec.beta > 1.1 ? "text-red-400" : sec.beta < 0.7 ? "text-green-400" : "text-muted-foreground"
                        )}>
                          {sec.beta.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={cn(
                          "font-semibold",
                          pct >= 15 ? "text-green-400"
                          : pct >= 8 ? "text-primary"
                          : pct >= 3 ? "text-muted-foreground"
                          : "text-muted-foreground",
                        )}>
                          {pct}%
                        </span>
                        {isBest && <span className="ml-1 text-green-400">★</span>}
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {sec.bestPhases.map((ph) => (
                            <span
                              key={ph}
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${phaseColors[ph]}20`,
                                color: phaseColors[ph],
                              }}
                            >
                              {ph.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Implementation notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <Shield className="w-4 h-4" />,
            color: "blue",
            title: "Execution",
            points: [
              "All XL ETFs are highly liquid (>$1B daily volume)",
              "Expense ratio 0.10% across all SPDR sector ETFs",
              "Rebalance quarterly or at cycle phase transitions",
              "Use limit orders; spreads typically 1–2 bps",
            ],
          },
          {
            icon: <Zap className="w-4 h-4" />,
            color: "yellow",
            title: "Risk Management",
            points: [
              "Max single sector weight 25% to limit concentration",
              "Use equal-weight as default, tilt tactically ±5–10%",
              "Monitor PMI monthly for phase transition signals",
              "Drawdown stop: -15% on any individual ETF",
            ],
          },
          {
            icon: <Target className="w-4 h-4" />,
            color: "green",
            title: "Tax Efficiency",
            points: [
              "XL ETFs are structured to minimize capital gain distributions",
              "Hold in tax-advantaged accounts when possible",
              "Harvest losses in underperforming sectors for rebalancing",
              "Average holding period 6–18 months per phase",
            ],
          },
        ].map(({ icon, color, title, points }) => (
          <Card key={title} className="bg-card border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className={cn(
                  "p-1.5 rounded",
                  color === "blue" && "bg-primary/10 text-primary",
                  color === "yellow" && "bg-yellow-500/10 text-yellow-400",
                  color === "green" && "bg-green-500/10 text-green-400",
                )}>
                  {icon}
                </span>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="space-y-1.5">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SectorRotationPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Sector Rotation Strategy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Business cycle investing — allocate to sectors and factors that historically outperform each economic phase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-sm px-3 py-1">
            Phase: {CURRENT_PHASE}
          </Badge>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400 font-medium">3 Bearish Signals</span>
          </div>
        </div>
      </div>

      {/* Summary stat chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Current Phase", value: CURRENT_PHASE, sub: "Late-cycle", icon: <Clock className="w-4 h-4" />, color: "#f59e0b" },
          { label: "Best Sector", value: "XLV", sub: "Healthcare +4.2% avg", icon: <TrendingUp className="w-4 h-4" />, color: "#10b981" },
          { label: "Avoid", value: "XLY", sub: "Consumer Disc. -5.1%", icon: <TrendingDown className="w-4 h-4" />, color: "#ef4444" },
          { label: "Best Factor", value: "Quality", sub: "+5.8% avg slowdown", icon: <Shield className="w-4 h-4" />, color: "#6366f1" },
        ].map(({ label, value, sub, icon, color }) => (
          <Card key={label} className="bg-card border-border/50">
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span style={{ color }}>{icon}</span>
              </div>
              <p className="text-lg font-bold text-white" style={{ color }}>{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="clock" className="space-y-4">
        <TabsList className="bg-muted border border-border/50 h-auto flex-wrap">
          <TabsTrigger value="clock" className="data-[state=active]:bg-muted text-xs">
            Business Cycle Clock
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-muted text-xs">
            Sector Performance
          </TabsTrigger>
          <TabsTrigger value="signals" className="data-[state=active]:bg-muted text-xs">
            Rotation Signals
          </TabsTrigger>
          <TabsTrigger value="factors" className="data-[state=active]:bg-muted text-xs">
            Factor Rotation
          </TabsTrigger>
          <TabsTrigger value="etf" className="data-[state=active]:bg-muted text-xs">
            ETF Implementation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="data-[state=inactive]:hidden">
          <BusinessCycleClock />
        </TabsContent>
        <TabsContent value="performance" className="data-[state=inactive]:hidden">
          <SectorPerformance />
        </TabsContent>
        <TabsContent value="signals" className="data-[state=inactive]:hidden">
          <RotationSignals />
        </TabsContent>
        <TabsContent value="factors" className="data-[state=inactive]:hidden">
          <FactorRotation />
        </TabsContent>
        <TabsContent value="etf" className="data-[state=inactive]:hidden">
          <ETFImplementation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
