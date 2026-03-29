"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, TrendingDown, TrendingUp, Shield,
  Play, Pause, FastForward, CheckCircle, BookOpen,
  ChevronDown, ChevronRight,
} from "lucide-react";

// ── Seeded PRNG ─────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Scenario data ───────────────────────────────────────────────

interface TimelineEvent {
  barIndex: number;
  label: string;
  detail: string;
}

interface BlackSwanScenario {
  id: string;
  name: string;
  subtitle: string;
  severity: string;
  drop: number; // max drop percent
  bars: number; // total bars
  seed: number;
  driftProfile: (progress: number) => number; // drift per bar
  volatilityProfile: (progress: number) => number;
  events: TimelineEvent[];
  whatHappened: string;
  lessons: string[];
}

const SCENARIOS: BlackSwanScenario[] = [
  {
    id: "gfc_2008",
    name: "2008 Financial Crisis",
    subtitle: "18-month bear market, -55% from peak",
    severity: "Catastrophic",
    drop: 55,
    bars: 90,
    seed: 20080101,
    driftProfile: (p) => {
      // Sharp decline from bar 10-60, then stabilize
      if (p < 0.1) return -0.002;
      if (p < 0.7) return -0.012 - Math.sin(p * Math.PI) * 0.008;
      return -0.003 + p * 0.004;
    },
    volatilityProfile: (p) => {
      if (p < 0.1) return 0.02;
      if (p < 0.5) return 0.04 + p * 0.03;
      if (p < 0.7) return 0.055;
      return 0.03;
    },
    events: [
      { barIndex: 5, label: "Bear Stearns", detail: "Bear Stearns collapses, first major bank failure" },
      { barIndex: 25, label: "Lehman Brothers", detail: "Lehman files bankruptcy — markets in freefall" },
      { barIndex: 35, label: "TARP Bailout", detail: "$700B emergency bank bailout announced" },
      { barIndex: 50, label: "Circuit Breakers", detail: "NYSE halts trading multiple times" },
      { barIndex: 75, label: "Recovery Begins", detail: "Fed signals quantitative easing; bottom forms" },
    ],
    whatHappened: "The 2008 crisis was triggered by the collapse of the US housing bubble and toxic mortgage-backed securities. The S&P 500 fell 55% from peak to trough over 18 months. Lehman's collapse on September 15, 2008 was the pivotal moment.",
    lessons: [
      "Leverage amplifies losses during systemic crises",
      "Correlation of assets spikes to 1.0 in crashes — diversification fails",
      "Cash is king: preserving capital lets you buy at the bottom",
      "Volatility can stay elevated for months after initial crash",
    ],
  },
  {
    id: "flash_crash_2020",
    name: "2020 Flash Crash",
    subtitle: "33% crash in 33 days then V-recovery",
    severity: "Extreme",
    drop: 33,
    bars: 60,
    seed: 20200219,
    driftProfile: (p) => {
      if (p < 0.05) return 0.001;
      if (p < 0.4) return -0.022 - p * 0.01;
      if (p < 0.5) return -0.005;
      return 0.018 - p * 0.01;
    },
    volatilityProfile: (p) => {
      if (p < 0.1) return 0.015;
      if (p < 0.45) return 0.045 + p * 0.04;
      if (p < 0.55) return 0.07;
      return 0.035 - p * 0.015;
    },
    events: [
      { barIndex: 3, label: "WHO Alert", detail: "WHO declares COVID-19 a global health emergency" },
      { barIndex: 15, label: "Panic Selling", detail: "Fastest 30% decline in S&P history begins" },
      { barIndex: 28, label: "Circuit Breaker", detail: "NYSE halts trading 4 times in 2 weeks" },
      { barIndex: 33, label: "Bottom", detail: "March 23 bottom: S&P at 2,191" },
      { barIndex: 40, label: "Fed Bazooka", detail: "Fed announces unlimited QE; stocks surge" },
      { barIndex: 55, label: "V-Recovery", detail: "Full recovery by August — fastest ever" },
    ],
    whatHappened: "COVID-19 triggered the fastest bear market in history. The S&P 500 fell 34% in just 33 days (Feb 19 – Mar 23, 2020), then staged a miraculous V-shaped recovery driven by unprecedented Federal Reserve intervention.",
    lessons: [
      "Black swans can be exogenous (external shocks), not just financial",
      "V-recoveries are rare but possible with strong policy response",
      "Selling at the bottom locks in losses permanently",
      "Hedges (put options, inverse ETFs) become critical in fast crashes",
    ],
  },
  {
    id: "black_monday_1987",
    name: "1987 Black Monday",
    subtitle: "Single day -22% shock",
    severity: "Sudden",
    drop: 22,
    bars: 30,
    seed: 19871019,
    driftProfile: (p) => {
      // Normal until bar 15 (Oct 19), then single-day cliff
      if (p < 0.47) return 0.003;
      if (p < 0.53) return -0.18; // the crash bar
      if (p < 0.7) return -0.008;
      return 0.005;
    },
    volatilityProfile: (p) => {
      if (p < 0.45) return 0.012;
      if (p < 0.55) return 0.08;
      if (p < 0.7) return 0.04;
      return 0.018;
    },
    events: [
      { barIndex: 2, label: "Pre-Crash Rally", detail: "Market near all-time highs, euphoria sets in" },
      { barIndex: 14, label: "October 19, 1987", detail: "Dow Jones falls 22.6% in a single trading day" },
      { barIndex: 18, label: "Aftermath", detail: "Global markets follow — Hong Kong down 45%" },
      { barIndex: 25, label: "Stabilization", detail: "Fed injects liquidity; panic subsides" },
    ],
    whatHappened: "Black Monday remains the largest single-day percentage decline in Dow Jones history at -22.6% on October 19, 1987. Portfolio insurance strategies and program trading created a feedback loop that amplified selling.",
    lessons: [
      "Tail risk: extreme events happen far more often than models predict",
      "Stop-losses can fail in fast markets — gaps occur",
      "Portfolio insurance strategies can create self-reinforcing crashes",
      "Diversification across asset classes matters on normal days, not crash days",
    ],
  },
  {
    id: "crypto_winter_2022",
    name: "Crypto Winter 2022",
    subtitle: "80% decline over 12 months",
    severity: "Prolonged",
    drop: 80,
    bars: 70,
    seed: 20211108,
    driftProfile: (p) => {
      if (p < 0.05) return -0.005;
      if (p < 0.3) return -0.025;
      // LUNA collapse
      if (p < 0.35) return -0.08;
      if (p < 0.5) return -0.015;
      // FTX collapse
      if (p < 0.6) return -0.045;
      if (p < 0.75) return -0.008;
      return 0.003;
    },
    volatilityProfile: (p) => {
      if (p < 0.1) return 0.04;
      if (p < 0.35) return 0.06;
      if (p < 0.4) return 0.12;
      if (p < 0.55) return 0.05;
      if (p < 0.65) return 0.1;
      return 0.04;
    },
    events: [
      { barIndex: 3, label: "ATH Passed", detail: "Bitcoin ATH in Nov 2021 — fear begins" },
      { barIndex: 20, label: "Rate Hikes", detail: "Fed begins aggressive rate hikes; risk assets sold" },
      { barIndex: 30, label: "LUNA Collapse", detail: "Terra/LUNA algorithmic stablecoin implodes — $40B wiped" },
      { barIndex: 45, label: "3AC / Celsius", detail: "Three Arrows Capital insolvent; Celsius halts withdrawals" },
      { barIndex: 55, label: "FTX Collapse", detail: "FTX exchange files bankruptcy — $8B customer funds missing" },
      { barIndex: 68, label: "Bottom Zone", detail: "Bitcoin near $16K — 77% below ATH" },
    ],
    whatHappened: "The 2022 crypto winter saw Bitcoin fall from $69K to $16K (-77%). Multiple contagion events cascaded: LUNA (-99%), Three Arrows Capital bankruptcy, Celsius freeze, and FTX collapse — each amplifying the next.",
    lessons: [
      "Interconnected leverage creates contagion — one failure triggers the next",
      "Liquidity crises mean you cannot exit at quoted prices",
      "Counterparty risk: even exchanges can fail",
      "Sizing positions to survive -80% drawdowns requires tiny allocations",
    ],
  },
];

// ── Generate bars from scenario ─────────────────────────────────

interface Bar {
  o: number; h: number; l: number; c: number;
}

function generateScenarioBars(scenario: BlackSwanScenario): Bar[] {
  const rng = seededRng(scenario.seed);
  const bars: Bar[] = [];
  let price = 100;

  for (let i = 0; i < scenario.bars; i++) {
    const p = i / scenario.bars;
    const drift = scenario.driftProfile(p);
    const vol = scenario.volatilityProfile(p);

    const o = price;
    const noise = (rng() - 0.5) * vol * 2;
    const c = o * (1 + drift + noise);
    const highExtra = rng() * vol * price;
    const lowExtra = rng() * vol * price;
    const h = Math.max(o, c) + highExtra;
    const l = Math.min(o, c) - lowExtra;

    bars.push({ o, h: h, l: Math.max(l, price * 0.01), c: Math.max(c, price * 0.05) });
    price = bars[bars.length - 1].c;
  }

  return bars;
}

// ── SVG Chart ───────────────────────────────────────────────────

interface ChartAnnotation {
  barIndex: number;
  label: string;
}

function ScenarioChart({
  bars,
  revealedBars,
  annotations,
}: {
  bars: Bar[];
  revealedBars: number;
  annotations: ChartAnnotation[];
}) {
  const W = 500;
  const H = 140;
  const PAD_TOP = 16;
  const PAD_BOT = 4;
  const chartH = H - PAD_TOP - PAD_BOT;

  const visible = bars.slice(0, revealedBars);
  if (visible.length === 0) return <div className="w-full h-36 bg-white/[0.02] rounded-lg animate-pulse" />;

  const barW = W / bars.length;
  const allPrices = visible.flatMap((b) => [b.h, b.l]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;

  const toX = (i: number) => i * barW + barW / 2;
  const toY = (v: number) => PAD_TOP + chartH - ((v - minP) / range) * chartH;

  const visibleAnnotations = annotations.filter((a) => a.barIndex < revealedBars);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-lg bg-white/[0.02]"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Bars */}
      {visible.map((b, i) => {
        const x = toX(i);
        const bull = b.c >= b.o;
        const color = bull ? "#10b981" : "#ef4444";
        const bodyTop = toY(Math.max(b.o, b.c));
        const bodyBot = toY(Math.min(b.o, b.c));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        return (
          <g key={i}>
            <line x1={x} y1={toY(b.h)} x2={x} y2={toY(b.l)} stroke={color} strokeWidth={0.5} strokeOpacity={0.5} />
            <rect x={x - barW * 0.38} y={bodyTop} width={barW * 0.76} height={bodyH} fill={color} fillOpacity={0.85} />
          </g>
        );
      })}

      {/* Annotations */}
      {visibleAnnotations.map((ann) => {
        const x = toX(ann.barIndex);
        const bar = bars[ann.barIndex];
        if (!bar) return null;
        const y = toY(bar.h) - 4;
        return (
          <g key={ann.barIndex}>
            <line x1={x} y1={y} x2={x} y2={y - 14} stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.7} strokeDasharray="2,2" />
            <rect x={Math.min(x - 16, W - 50)} y={y - 26} width={52} height={12} rx={2} fill="#78350f" fillOpacity={0.8} />
            <text
              x={Math.min(x - 16, W - 50) + 26}
              y={y - 17}
              textAnchor="middle"
              fill="#fbbf24"
              fontSize={6.5}
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              {ann.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Grade calculation ────────────────────────────────────────────

function calcGrade(portfolioLossPct: number): { grade: "S" | "A" | "B" | "C" | "D"; color: string; label: string } {
  if (portfolioLossPct < 5) return { grade: "S", color: "text-emerald-400", label: "Outstanding" };
  if (portfolioLossPct < 10) return { grade: "A", color: "text-emerald-400", label: "Excellent" };
  if (portfolioLossPct < 20) return { grade: "B", color: "text-amber-400", label: "Good" };
  if (portfolioLossPct < 35) return { grade: "C", color: "text-orange-400", label: "Survived" };
  return { grade: "D", color: "text-red-400", label: "Wiped Out" };
}

// ── Scenario Card ────────────────────────────────────────────────

function ScenarioCard({ scenario, onSelect }: { scenario: BlackSwanScenario; onSelect: () => void }) {
  const severityColor: Record<string, string> = {
    Catastrophic: "text-red-400 bg-red-500/10 border-red-500/20",
    Extreme: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    Sudden: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Prolonged: "text-primary bg-primary/10 border-border",
  };

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group w-full rounded-lg border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-sm font-bold text-zinc-200">{scenario.name}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{scenario.subtitle}</div>
        </div>
        <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold shrink-0 mt-0.5", severityColor[scenario.severity] ?? "text-zinc-400 bg-zinc-800 border-zinc-700")}>
          {scenario.severity}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
        <span className="text-red-400 font-bold">-{scenario.drop}%</span>
        <span>{scenario.bars} bars</span>
        <span>{scenario.events.length} key events</span>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-3 w-3" />
        Start scenario
      </div>
    </motion.button>
  );
}

// ── Active Scenario ─────────────────────────────────────────────

type Speed = 1 | 2 | 5;

interface ActiveScenarioProps {
  scenario: BlackSwanScenario;
  bars: Bar[];
  onComplete: (portfolioValue: number) => void;
  onBack: () => void;
}

function ActiveScenario({ scenario, bars, onComplete, onBack }: ActiveScenarioProps) {
  const STARTING_VALUE = 100_000;

  const [revealedBars, setRevealedBars] = useState(3);
  const [speed, setSpeed] = useState<Speed>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [portfolio, setPortfolio] = useState(STARTING_VALUE);
  const [hedged, setHedged] = useState(false);
  const [soldPct, setSoldPct] = useState(0); // 0-100 how much sold
  const [currentEvent, setCurrentEvent] = useState<TimelineEvent | null>(null);
  const [eventKey, setEventKey] = useState(0);
  const prevRevealedRef = useRef(3);

  const isComplete = revealedBars >= scenario.bars;

  // Auto-advance
  const advanceRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doAdvance = useCallback(() => {
    setRevealedBars((prev) => {
      if (prev >= scenario.bars) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [scenario.bars]);

  useEffect(() => {
    if (isPlaying && !isComplete) {
      const intervalMs = Math.round(400 / speed);
      advanceRef.current = setInterval(doAdvance, intervalMs);
    } else {
      if (advanceRef.current) clearInterval(advanceRef.current);
    }
    return () => { if (advanceRef.current) clearInterval(advanceRef.current); };
  }, [isPlaying, isComplete, speed, doAdvance]);

  // Update portfolio value as bars advance
  useEffect(() => {
    if (revealedBars === prevRevealedRef.current) return;
    prevRevealedRef.current = revealedBars;

    const barIdx = revealedBars - 1;
    if (barIdx < 0 || barIdx >= bars.length) return;

    const bar = bars[barIdx];
    const prevBar = bars[Math.max(0, barIdx - 1)];
    const barReturn = (bar.c - prevBar.c) / prevBar.c;

    // Portfolio impact
    // Sold portion is cash (no market exposure)
    // Hedged portion reduces downside by 70% (inverse ETF)
    const exposurePct = (100 - soldPct) / 100;
    const hedgeFactor = hedged ? 0.3 : 1.0; // hedge reduces loss by 70%

    const effectiveReturn = barReturn < 0
      ? barReturn * exposurePct * hedgeFactor
      : barReturn * exposurePct * (hedged ? 0.4 : 1.0); // hedge also clips upside

    setPortfolio((prev) => prev * (1 + effectiveReturn));

    // Check events
    const evt = scenario.events.find((e) => e.barIndex === barIdx);
    if (evt && evt !== currentEvent) {
      setCurrentEvent(evt);
      setEventKey((k) => k + 1);
    }
  }, [revealedBars, bars, soldPct, hedged, scenario.events, currentEvent]);

  // Trigger completion
  useEffect(() => {
    if (isComplete) {
      onComplete(portfolio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const handleSell25 = useCallback(() => {
    setSoldPct((prev) => Math.min(100, prev + 25));
  }, []);

  const handleHedge = useCallback(() => {
    setHedged((h) => !h);
  }, []);

  const pnlPct = ((portfolio - STARTING_VALUE) / STARTING_VALUE) * 100;
  const currentBar = bars[Math.max(0, revealedBars - 1)];
  const startBar = bars[0];
  const pricePct = currentBar && startBar ? ((currentBar.c - startBar.c) / startBar.c) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-zinc-200">{scenario.name}</div>
          <div className="text-xs text-zinc-500">Bar {revealedBars} / {scenario.bars}</div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Exit scenario
        </button>
      </div>

      {/* Portfolio value */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
          <div className="text-[11px] text-zinc-600 mb-1">Portfolio</div>
          <div className="text-sm font-bold tabular-nums text-zinc-200">
            ${Math.round(portfolio).toLocaleString()}
          </div>
          <div className={cn("text-xs font-bold tabular-nums", pnlPct >= 0 ? "text-emerald-400" : "text-red-400")}>
            {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
          <div className="text-[11px] text-zinc-600 mb-1">Market</div>
          <div className={cn("text-sm font-bold tabular-nums", pricePct >= 0 ? "text-emerald-400" : "text-red-400")}>
            {pricePct >= 0 ? "+" : ""}{pricePct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-600">{scenario.drop}% max drop</div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
          <div className="text-[11px] text-zinc-600 mb-1">Exposure</div>
          <div className="text-sm font-bold tabular-nums text-zinc-200">{100 - soldPct}%</div>
          <div className={cn("text-[11px] font-bold", hedged ? "text-amber-400" : "text-zinc-600")}>
            {hedged ? "Hedged" : "Unhedged"}
          </div>
        </div>
      </div>

      {/* Event ticker */}
      <div className="h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentEvent && (
            <motion.div
              key={eventKey}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5"
            >
              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-400">{currentEvent.label}: </span>
                <span className="text-xs text-zinc-400">{currentEvent.detail}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart */}
      <ScenarioChart
        bars={bars}
        revealedBars={revealedBars}
        annotations={scenario.events.map((e) => ({ barIndex: e.barIndex, label: e.label }))}
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          disabled={isComplete}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
            isPlaying
              ? "bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
              : "bg-teal-500/20 border border-teal-500/30 text-emerald-400 hover:bg-teal-500/30",
            isComplete && "opacity-40 cursor-not-allowed",
          )}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        {/* Speed */}
        <div className="flex items-center gap-0.5 rounded-lg border border-white/5 bg-white/[0.02] p-0.5">
          {([1, 2, 5] as Speed[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded px-2 py-1 text-xs font-bold transition-colors",
                speed === s ? "bg-white/10 text-zinc-200" : "text-zinc-600 hover:text-zinc-400",
              )}
            >
              {s === 5 ? <FastForward className="h-3 w-3" /> : `${s}x`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={doAdvance}
          disabled={isComplete || isPlaying}
          className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-40 transition-colors"
        >
          Step
        </button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleSell25}
          disabled={soldPct >= 100}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <TrendingDown className="h-3.5 w-3.5" />
          Sell 25% ({soldPct}% sold)
        </button>

        <button
          type="button"
          onClick={handleHedge}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-bold transition-colors",
            hedged
              ? "border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
              : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
          )}
        >
          <Shield className="h-3.5 w-3.5" />
          {hedged ? "Hedged (active)" : "Buy Hedge (Inv. ETF)"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-teal-500/60"
          animate={{ width: `${(revealedBars / scenario.bars) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// ── Post-scenario results ────────────────────────────────────────

interface ScenarioResultsProps {
  scenario: BlackSwanScenario;
  finalPortfolio: number;
  onPlayAgain: () => void;
  onBack: () => void;
}

function ScenarioResults({ scenario, finalPortfolio, onPlayAgain, onBack }: ScenarioResultsProps) {
  const STARTING_VALUE = 100_000;
  const lossPct = Math.max(0, ((STARTING_VALUE - finalPortfolio) / STARTING_VALUE) * 100);
  const { grade, color, label } = calcGrade(lossPct);
  const passed = lossPct < 20;
  const gold = lossPct < 10;

  const [showLessons, setShowLessons] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Grade */}
      <div className="flex flex-col items-center gap-2 py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={cn("text-6xl font-bold", color)}
        >
          {grade}
        </motion.div>
        <div className={cn("text-sm font-bold", color)}>{label}</div>
        <div className="text-xs text-zinc-500">{scenario.name}</div>
      </div>

      {/* Result chips */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
          <div className="text-xs text-zinc-600 mb-1">Final Portfolio</div>
          <div className="text-sm font-bold tabular-nums text-zinc-200">${Math.round(finalPortfolio).toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
          <div className="text-xs text-zinc-600 mb-1">Loss</div>
          <div className={cn("text-sm font-bold tabular-nums", lossPct < 20 ? "text-emerald-400" : "text-red-400")}>
            -{lossPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2",
        passed ? "border-teal-500/20 bg-teal-500/5" : "border-red-500/20 bg-red-500/5",
      )}>
        {passed
          ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          : <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
        }
        <div>
          <div className={cn("text-xs font-bold", passed ? "text-emerald-400" : "text-red-400")}>
            {gold ? "Gold rank achieved!" : passed ? "Passed — loss below 20%" : "Failed — loss exceeded 20%"}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {gold ? "Elite risk management." : passed ? "Strong discipline under pressure." : "Next time: sell early, hedge sooner."}
          </div>
        </div>
      </div>

      {/* What actually happened */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <div className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          What Actually Happened
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">{scenario.whatHappened}</p>
      </div>

      {/* Lessons */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLessons((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            Lessons Learned
          </span>
          {showLessons ? <ChevronDown className="h-3.5 w-3.5 text-zinc-500" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
        </button>
        <AnimatePresence>
          {showLessons && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-1.5">
                {scenario.lessons.map((lesson, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400">
                    <span className="text-emerald-500 mt-0.5 shrink-0">-</span>
                    {lesson}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-500/20 border border-teal-500/30 py-2.5 text-sm font-bold text-emerald-400 transition-colors hover:bg-teal-500/30"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/10"
        >
          Scenarios
        </button>
      </div>
    </motion.div>
  );
}

// ── Main BlackSwanTab ───────────────────────────────────────────

type SwanPhase = "select" | "playing" | "results";

export function BlackSwanTab() {
  const [phase, setPhase] = useState<SwanPhase>("select");
  const [selectedScenario, setSelectedScenario] = useState<BlackSwanScenario | null>(null);
  const [scenarioBars, setScenarioBars] = useState<Bar[]>([]);
  const [finalPortfolio, setFinalPortfolio] = useState(0);

  const handleSelectScenario = useCallback((scenario: BlackSwanScenario) => {
    const bars = generateScenarioBars(scenario);
    setSelectedScenario(scenario);
    setScenarioBars(bars);
    setPhase("playing");
  }, []);

  const handleComplete = useCallback((portfolioValue: number) => {
    setFinalPortfolio(portfolioValue);
    setPhase("results");
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (selectedScenario) {
      const bars = generateScenarioBars(selectedScenario);
      setScenarioBars(bars);
      setPhase("playing");
    }
  }, [selectedScenario]);

  const handleBack = useCallback(() => {
    setPhase("select");
    setSelectedScenario(null);
    setScenarioBars([]);
  }, []);

  return (
    <div>
      <AnimatePresence mode="wait">
        {phase === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2.5">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Black Swan Mode
              </div>
              <div className="text-[11px] text-zinc-400 leading-relaxed">
                Survive extreme historical market crashes. Start with $100K — lose less than 20% to pass, less than 10% for gold rank. Bars advance automatically at 10x speed.
              </div>
            </div>

            <div className="text-xs font-bold text-zinc-400 mb-2">Choose a Scenario</div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SCENARIOS.map((s) => (
                <ScenarioCard key={s.id} scenario={s} onSelect={() => handleSelectScenario(s)} />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "playing" && selectedScenario && scenarioBars.length > 0 && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ActiveScenario
              scenario={selectedScenario}
              bars={scenarioBars}
              onComplete={handleComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {phase === "results" && selectedScenario && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScenarioResults
              scenario={selectedScenario}
              finalPortfolio={finalPortfolio}
              onPlayAgain={handlePlayAgain}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
