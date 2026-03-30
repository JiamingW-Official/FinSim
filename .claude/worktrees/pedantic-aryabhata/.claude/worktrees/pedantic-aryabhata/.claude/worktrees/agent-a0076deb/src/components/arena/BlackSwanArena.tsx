"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  Activity,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Target,
  BookOpen,
  BarChart2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Star,
  Zap,
} from "lucide-react";
import {
  BLACK_SWAN_SCENARIOS,
  getSeverityColor,
  getSeverityLabel,
} from "@/data/black-swan-scenarios";
import type { BlackSwanScenario, SurvivalCriterion } from "@/data/black-swan-scenarios";

// ── Types ──────────────────────────────────────────────────────────────────

type ArenaPhase = "lobby" | "briefing" | "active" | "post_analysis";

interface SurvivalResult {
  scenarioId: string;
  survived: boolean;
  capitalPreserved: number;       // fraction 0–1
  maxDrawdownPct: number;
  hedgeApplied: boolean;
  netExposurePeak: number;        // fraction 0–1
  survivalScore: number;          // 0–100
  criteriaResults: { id: string; passed: boolean }[];
  completedAt: number;
}

// ── VIX Speedometer ───────────────────────────────────────────────────────

function VixGauge({ vix, className }: { vix: number; className?: string }) {
  // Map VIX 0–100 to angle -135deg to +135deg (270deg arc)
  const clampedVix = Math.min(100, Math.max(0, vix));
  const angleDeg = -135 + (clampedVix / 100) * 270;
  const color =
    clampedVix >= 60
      ? "#ef4444"
      : clampedVix >= 40
      ? "#f97316"
      : clampedVix >= 25
      ? "#eab308"
      : "#22c55e";

  // SVG arc helper
  const polarToXY = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
  };

  // Build arc path for the gauge track
  const arcPath = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToXY(startAngle, r);
    const end = polarToXY(endAngle, r);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const needleEnd = polarToXY(angleDeg + 90, 28);
  const needleBase1 = polarToXY(angleDeg + 90 - 90, 5);
  const needleBase2 = polarToXY(angleDeg + 90 + 90, 5);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg viewBox="0 0 100 60" className="w-24 h-16">
        {/* Track */}
        <path
          d={arcPath(-135, 135, 38)}
          fill="none"
          stroke="#1f2937"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Fill arc */}
        <path
          d={arcPath(-135, angleDeg + 90 - 90, 38)}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          style={{ transition: "all 0.8s ease" }}
        />
        {/* Zone markers */}
        {[25, 40, 60, 80].map((v) => {
          const a = -135 + (v / 100) * 270;
          const inner = polarToXY(a + 90, 30);
          const outer = polarToXY(a + 90, 34);
          return (
            <line
              key={v}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#374151"
              strokeWidth="1.5"
            />
          );
        })}
        {/* Needle */}
        <polygon
          points={`${needleEnd.x},${needleEnd.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={color}
          style={{ transition: "all 0.8s ease", transformOrigin: "50px 50px" }}
        />
        {/* Center dot */}
        <circle cx="50" cy="50" r="4" fill="#111827" stroke={color} strokeWidth="1.5" />
      </svg>
      <div className="text-center">
        <div className="font-black tabular-nums text-lg leading-none" style={{ color }}>
          {clampedVix.toFixed(0)}
        </div>
        <div className="text-[9px] text-muted-foreground/60 tracking-widest uppercase">VIX</div>
      </div>
    </div>
  );
}

// ── Severity Bar ──────────────────────────────────────────────────────────

function SeverityBar({ severity }: { severity: number }) {
  const cols = getSeverityColor(severity);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className={cn(
              "w-2 rounded-sm",
              i < severity ? cols.bg : "bg-muted/20",
            )}
            style={{ height: `${8 + (i < severity ? i : 0) * 1.5}px` }}
          />
        ))}
      </div>
      <span className={cn("text-[10px] font-black tracking-wider", cols.text)}>
        {getSeverityLabel(severity)}
      </span>
    </div>
  );
}

// ── Correlation Matrix Indicator ──────────────────────────────────────────

function CorrelationMatrix({ correlationSpike }: { correlationSpike: number }) {
  const assets = ["EQ", "BD", "GD", "OIL", "EM"];
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] text-muted-foreground/60 tracking-widest uppercase mb-1">
        Correlation
      </div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${assets.length}, 1fr)` }}>
        {assets.map((a, i) =>
          assets.map((b, j) => {
            const isdiag = i === j;
            const corr = isdiag ? 1 : Math.min(1, correlationSpike * (0.7 + Math.random() * 0.3));
            const intensity = Math.round(corr * 100);
            return (
              <div
                key={`${i}-${j}`}
                title={`${a}/${b}: ${corr.toFixed(2)}`}
                className="h-4 w-4 rounded-sm flex items-center justify-center"
                style={{
                  backgroundColor: isdiag
                    ? "#ef4444"
                    : `rgba(239,68,68,${corr * 0.9})`,
                }}
              >
                {isdiag && (
                  <span className="text-[6px] font-bold text-white/80">{a}</span>
                )}
              </div>
            );
          }),
        )}
      </div>
      <div className="text-[9px] tabular-nums text-red-400/80">
        r ≈ +{correlationSpike.toFixed(2)}
      </div>
    </div>
  );
}

// ── Scenario Card ─────────────────────────────────────────────────────────

function ScenarioCard({
  scenario,
  onSelect,
  bestResult,
}: {
  scenario: BlackSwanScenario;
  onSelect: () => void;
  bestResult?: SurvivalResult;
}) {
  const cols = getSeverityColor(scenario.severity);
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative overflow-hidden rounded-lg border text-left transition-all",
        "bg-[#0c0f16] hover:bg-[#0f1218]",
        cols.border,
        "hover:border-opacity-80",
      )}
    >
      {/* Top severity stripe */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${cols.text.replace("text-", "").replace("-400", "")} 40%, transparent)`,
          opacity: 0.6,
        }}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={cn("text-sm font-black leading-tight", cols.text)}>
              {scenario.name}
            </h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 italic">
              {scenario.tagline}
            </p>
          </div>
          <div
            className={cn(
              "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md text-xs font-black",
              cols.bg,
              cols.text,
            )}
          >
            {scenario.severity}
          </div>
        </div>

        {/* Severity bar */}
        <SeverityBar severity={scenario.severity} />

        {/* Stats chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded bg-muted/20 px-1.5 py-0.5 text-[9px] text-muted-foreground">
            <Activity className="h-2.5 w-2.5" />
            VIX {scenario.initialVIX}
          </span>
          <span className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] text-red-400/80">
            <TrendingDown className="h-2.5 w-2.5" />
            {scenario.priceShock}%
          </span>
          <span className="flex items-center gap-1 rounded bg-muted/20 px-1.5 py-0.5 text-[9px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {scenario.duration}d
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              cols.bg,
              cols.text,
            )}
          >
            {scenario.category.replace("_", " ")}
          </span>
        </div>

        {/* Best result badge */}
        {bestResult && (
          <div className="flex items-center gap-1.5 border-t border-border/30 pt-2">
            {bestResult.survived ? (
              <CheckCircle className="h-3 w-3 text-green-400" />
            ) : (
              <XCircle className="h-3 w-3 text-red-400" />
            )}
            <span className="text-[9px] text-muted-foreground/70">
              Best: <span className="font-bold tabular-nums">{bestResult.survivalScore}</span> pts
              {" "}— {bestResult.survived ? "SURVIVED" : "ELIMINATED"}
            </span>
          </div>
        )}

        {/* Hover CTA */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/50 to-transparent py-3 opacity-0 transition-opacity group-hover:opacity-100">
          <span className={cn("flex items-center gap-1.5 text-xs font-black", cols.text)}>
            <AlertTriangle className="h-3 w-3" />
            Enter Scenario
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// ── Briefing Panel ────────────────────────────────────────────────────────

function BriefingPanel({
  scenario,
  onStart,
  onBack,
}: {
  scenario: BlackSwanScenario;
  onStart: () => void;
  onBack: () => void;
}) {
  const cols = getSeverityColor(scenario.severity);
  const [tab, setTab] = useState<"situation" | "education" | "criteria">("situation");

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={cn("border-b px-6 py-4", cols.border, "border-opacity-40 bg-[#0c0f16]")}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Scenarios
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={cn("h-4 w-4", cols.text)} />
              <span className={cn("text-xs font-bold uppercase tracking-widest", cols.text)}>
                {getSeverityLabel(scenario.severity)} — Severity {scenario.severity}/10
              </span>
            </div>
            <h2 className="text-xl font-black text-foreground">{scenario.name}</h2>
            <p className="text-sm text-muted-foreground/70 italic mt-0.5">{scenario.tagline}</p>
          </div>
          <VixGauge vix={scenario.initialVIX} className="flex-shrink-0" />
        </div>

        {/* Stat chips row */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1">
            <TrendingDown className="h-3 w-3 text-red-400" />
            <span className="text-xs font-bold tabular-nums text-red-400">
              {scenario.priceShock}% Initial Shock
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-muted/20 border border-border/30 px-2.5 py-1">
            <BarChart2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {scenario.volatilityMultiplier}x Volatility
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-muted/20 border border-border/30 px-2.5 py-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {scenario.duration} bars
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-muted/20 border border-border/30 px-2.5 py-1">
            <Activity className="h-3 w-3 text-amber-400/80" />
            <span className="text-xs text-amber-400/80 tabular-nums">
              Correlation +{scenario.correlationSpike.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {(["situation", "education", "criteria"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-colors",
                tab === t
                  ? cn(cols.bg, cols.text)
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "education" ? "Learn" : t === "criteria" ? "Survival Rules" : "Situation"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#080b11]">
        <AnimatePresence mode="wait">
          {tab === "situation" && (
            <motion.div
              key="situation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Situation Report
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{scenario.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-2">
                    <XCircle className="h-3.5 w-3.5" />
                    Common Mistakes
                  </h4>
                  <ul className="space-y-1.5">
                    {scenario.commonMistakes.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                        <span className="mt-0.5 text-red-400/50">—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-green-400 mb-2">
                    <CheckCircle className="h-3.5 w-3.5" />
                    What Worked
                  </h4>
                  <ul className="space-y-1.5">
                    {scenario.whatWorked.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                        <span className="mt-0.5 text-green-400/50">+</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  Historical Analogues
                </h4>
                <ul className="space-y-1">
                  {scenario.historicalAnalogues.map((h, i) => (
                    <li key={i} className="text-xs text-muted-foreground/80 flex items-start gap-2">
                      <span className="text-muted-foreground/40 mt-0.5">{i + 1}.</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {tab === "education" && (
            <motion.div
              key="education"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
                Key Concepts You Will Need
              </h3>
              {scenario.educationalFocus.map((focus, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-lg border border-border/30 bg-card p-3"
                >
                  <div className={cn(
                    "flex-shrink-0 flex h-5 w-5 items-center justify-center rounded text-[10px] font-black",
                    cols.bg,
                    cols.text,
                  )}>
                    {i + 1}
                  </div>
                  <span className="text-xs text-foreground/80 leading-relaxed">{focus}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "criteria" && (
            <motion.div
              key="criteria"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 mb-4">
                <p className="text-xs text-amber-400/80">
                  <strong>All criteria must be satisfied</strong> to be declared a Black Swan Survivor.
                  Fail even one and you join the 98% of traders who did not make it through.
                </p>
              </div>
              {scenario.survivalCriteria.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-lg border border-border/40 bg-card p-4"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Target className={cn("h-3.5 w-3.5", cols.text)} />
                    <span className="text-xs font-bold text-foreground">{c.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.minCapitalPreserved !== undefined && (
                      <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] text-green-400">
                        Min {(c.minCapitalPreserved * 100).toFixed(0)}% capital
                      </span>
                    )}
                    {c.maxDrawdownPct !== undefined && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] text-red-400">
                        Max {c.maxDrawdownPct}% drawdown
                      </span>
                    )}
                    {c.requiresHedge && (
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] text-blue-400">
                        Hedge required
                      </span>
                    )}
                    {c.maxNetExposureFraction !== undefined && (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-400">
                        Max {(c.maxNetExposureFraction * 100).toFixed(0)}% exposure
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between gap-3 border-t border-border/30 bg-[#0c0f16] px-6 py-4">
        <div className="text-xs text-muted-foreground/60">
          ⚠ This scenario simulates real market conditions. Capital preservation is the primary objective.
        </div>
        <motion.button
          type="button"
          onClick={onStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2",
            "bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-500/40",
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Enter the Arena
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Active Scenario Simulation ────────────────────────────────────────────

function ActiveScenario({
  scenario,
  onComplete,
}: {
  scenario: BlackSwanScenario;
  onComplete: (result: SurvivalResult) => void;
}) {
  const cols = getSeverityColor(scenario.severity);

  // Simulation state
  const [bar, setBar] = useState(0);
  const [capital, setCapital] = useState(10000);
  const [peakCapital, setPeakCapital] = useState(10000);
  const [hedgeApplied, setHedgeApplied] = useState(false);
  const [netExposure, setNetExposure] = useState(1.0); // fraction of starting capital
  const [peakExposure, setPeakExposure] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [vixLevel, setVixLevel] = useState(scenario.initialVIX);
  const [priceLevel, setPriceLevel] = useState(100);
  const [priceHistory, setPriceHistory] = useState<number[]>([100]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startingCapital = 10000;

  // Seeded PRNG for reproducible chaos
  const seedRef = useRef(scenario.severity * 7919 + scenario.initialVIX * 31);
  const prng = useCallback(() => {
    seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
    return (seedRef.current & 0xffff) / 0xffff;
  }, []);

  const advance = useCallback(() => {
    setBar((prev) => {
      const next = prev + 1;
      if (next >= scenario.duration) {
        setFinished(true);
        return scenario.duration;
      }

      const progress = next / scenario.duration;
      // VIX gradually declines after initial spike
      setVixLevel(
        Math.max(
          15,
          scenario.initialVIX * (1 - progress * 0.4) + (prng() - 0.5) * 8,
        ),
      );

      // Simulate price movement: initial shock + high-vol brownian
      setPriceLevel((prev) => {
        const drift =
          next <= 3
            ? scenario.priceShock / 3 / 100
            : (prng() - 0.45) * 0.04 * scenario.volatilityMultiplier;
        const newPrice = prev * (1 + drift + (prng() - 0.5) * 0.015 * scenario.volatilityMultiplier);
        const clamped = Math.max(30, newPrice);
        setPriceHistory((h) => [...h.slice(-60), clamped]);
        return clamped;
      });

      return next;
    });
  }, [scenario.duration, scenario.initialVIX, scenario.priceShock, scenario.volatilityMultiplier, prng]);

  const play = useCallback(() => {
    if (finished) return;
    setIsPlaying(true);
    intervalRef.current = setInterval(() => advance(), 400);
  }, [advance, finished]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // Update capital tracking
  useEffect(() => {
    setPeakCapital((prev) => Math.max(prev, capital));
  }, [capital]);
  useEffect(() => {
    setPeakExposure((prev) => Math.max(prev, netExposure));
  }, [netExposure]);

  // Auto-finish
  useEffect(() => {
    if (!finished) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
  }, [finished]);

  const maxDrawdownPct = ((peakCapital - capital) / peakCapital) * 100;
  const capitalPreservedFraction = capital / startingCapital;
  const pnlPct = ((capital - startingCapital) / startingCapital) * 100;
  const progress = (bar / scenario.duration) * 100;

  // Hedge / reduce exposure actions
  const applyHedge = () => {
    setHedgeApplied(true);
    // Hedging costs a small premium but cuts exposure
    setCapital((c) => c * 0.995);
    setNetExposure((e) => Math.max(0, e - 0.3));
  };

  const reduceExposure = () => {
    setNetExposure((e) => Math.max(0, e - 0.25));
    setCapital((c) => c * (1 + (priceLevel / priceHistory[0] - 1) * 0.1 * netExposure));
  };

  const goFlat = () => {
    setCapital((c) => c * (1 + (priceLevel / priceHistory[0] - 1) * 0.3 * netExposure));
    setNetExposure(0);
  };

  const handleFinish = () => {
    if (!finished) setFinished(true);
  };

  // Compute survival on finish
  useEffect(() => {
    if (!finished) return;
    const criteriaResults = scenario.survivalCriteria.map((c) => {
      let passed = true;
      if (c.minCapitalPreserved !== undefined) {
        passed = passed && capitalPreservedFraction >= c.minCapitalPreserved;
      }
      if (c.maxDrawdownPct !== undefined) {
        passed = passed && maxDrawdownPct <= c.maxDrawdownPct;
      }
      if (c.requiresHedge) {
        passed = passed && hedgeApplied;
      }
      if (c.maxNetExposureFraction !== undefined) {
        passed = passed && peakExposure <= c.maxNetExposureFraction;
      }
      return { id: c.id, passed };
    });

    const survived = criteriaResults.every((r) => r.passed);

    // Score: 0–100 based on criteria passed + capital preserved
    const critPassed = criteriaResults.filter((r) => r.passed).length;
    const critScore = (critPassed / criteriaResults.length) * 60;
    const capScore = Math.max(0, Math.min(40, capitalPreservedFraction * 40));
    const survivalScore = Math.round(critScore + capScore);

    const result: SurvivalResult = {
      scenarioId: scenario.id,
      survived,
      capitalPreserved: capitalPreservedFraction,
      maxDrawdownPct,
      hedgeApplied,
      netExposurePeak: peakExposure,
      survivalScore,
      criteriaResults,
      completedAt: Date.now(),
    };

    // Small delay for dramatic effect
    const t = setTimeout(() => onComplete(result), 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Mini sparkline path
  const sparkPath = useMemo(() => {
    if (priceHistory.length < 2) return "";
    const min = Math.min(...priceHistory);
    const max = Math.max(...priceHistory);
    const range = max - min || 1;
    const w = 200;
    const h = 40;
    const pts = priceHistory.map((p, i) => {
      const x = (i / (priceHistory.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${x},${y}`;
    });
    return `M ${pts.join(" L ")}`;
  }, [priceHistory]);

  return (
    <div className="flex h-full flex-col bg-[#080b11]">
      {/* HUD */}
      <div className="border-b border-red-900/30 bg-[#0c0f16] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Scenario name */}
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn("h-3.5 w-3.5 animate-pulse", cols.text)} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest", cols.text)}>
                {scenario.name}
              </span>
            </div>
            <div className="text-[9px] text-muted-foreground/50 mt-0.5">
              Bar {bar}/{scenario.duration}
            </div>
          </div>

          {/* VIX */}
          <VixGauge vix={vixLevel} />

          {/* Capital */}
          <div className="text-right">
            <div className={cn(
              "text-lg font-black tabular-nums",
              capital >= startingCapital ? "text-green-400" : capital >= startingCapital * 0.8 ? "text-amber-400" : "text-red-400",
            )}>
              ${capital.toFixed(0)}
            </div>
            <div className={cn(
              "text-xs tabular-nums font-bold",
              pnlPct >= 0 ? "text-green-400/80" : "text-red-400/80",
            )}>
              {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
            </div>
          </div>

          {/* Correlation */}
          <CorrelationMatrix correlationSpike={scenario.correlationSpike * (0.5 + (bar / scenario.duration) * 0.5)} />
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full bg-muted/20 overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", bar >= scenario.duration * 0.8 ? "bg-red-500" : "bg-amber-500")}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chart area */}
        <div className="flex-1 p-4 space-y-4">
          {/* Price sparkline */}
          <div className="rounded-lg border border-red-900/30 bg-[#0c0f16] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                Market Price
              </span>
              <span className={cn(
                "text-sm font-black tabular-nums",
                priceLevel >= 100 ? "text-green-400" : "text-red-400",
              )}>
                {priceLevel.toFixed(2)}
              </span>
            </div>
            <svg viewBox={`0 0 200 40`} className="w-full h-12" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              {sparkPath && (
                <>
                  <path d={`${sparkPath} L 200,40 L 0,40 Z`} fill="url(#sparkGrad)" />
                  <path d={sparkPath} fill="none" stroke="#ef4444" strokeWidth="1.5" />
                </>
              )}
            </svg>
          </div>

          {/* Stress indicators */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/30 bg-[#0c0f16] p-2.5">
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-1">Drawdown</div>
              <div className={cn(
                "text-sm font-black tabular-nums",
                maxDrawdownPct < 10 ? "text-green-400" : maxDrawdownPct < 20 ? "text-amber-400" : "text-red-400",
              )}>
                {maxDrawdownPct.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-border/30 bg-[#0c0f16] p-2.5">
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-1">Exposure</div>
              <div className={cn(
                "text-sm font-black tabular-nums",
                netExposure <= 0.3 ? "text-green-400" : netExposure <= 0.6 ? "text-amber-400" : "text-red-400",
              )}>
                {(netExposure * 100).toFixed(0)}%
              </div>
            </div>
            <div className="rounded-lg border border-border/30 bg-[#0c0f16] p-2.5">
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-1">Hedge</div>
              <div className={cn("text-sm font-black", hedgeApplied ? "text-green-400" : "text-red-400/70")}>
                {hedgeApplied ? "ACTIVE" : "NONE"}
              </div>
            </div>
          </div>

          {/* Educational callout */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="text-[9px] text-amber-400/80 font-bold uppercase tracking-wider mb-1">
              Market Intelligence
            </div>
            <p className="text-xs text-foreground/70">
              {bar < 5
                ? "Initial shock absorbing. Prioritize reducing gross exposure before the second leg down."
                : bar < 15
                ? "Contagion spreading across correlated assets. Traditional diversification is failing."
                : bar < 30
                ? "Liquidity is returning but tail risk remains elevated. Stay disciplined."
                : "Late-stage stabilization. Policy intervention may trigger sharp relief rally."}
            </p>
          </div>
        </div>

        {/* Action panel */}
        <div className="w-64 border-l border-red-900/20 bg-[#0c0f16] flex flex-col p-4 gap-3">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">
            Survival Actions
          </div>

          {/* Survival criteria checklist */}
          <div className="space-y-1.5">
            {scenario.survivalCriteria.map((c) => {
              let currentPass = true;
              if (c.minCapitalPreserved !== undefined) currentPass = currentPass && capitalPreservedFraction >= c.minCapitalPreserved;
              if (c.maxDrawdownPct !== undefined) currentPass = currentPass && maxDrawdownPct <= c.maxDrawdownPct;
              if (c.requiresHedge) currentPass = currentPass && hedgeApplied;
              if (c.maxNetExposureFraction !== undefined) currentPass = currentPass && netExposure <= c.maxNetExposureFraction;
              return (
                <div
                  key={c.id}
                  className={cn(
                    "flex items-center gap-2 rounded border px-2 py-1.5",
                    currentPass
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-red-500/20 bg-red-500/5",
                  )}
                >
                  {currentPass
                    ? <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                    : <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />}
                  <span className="text-[9px] text-foreground/70 leading-tight">{c.label}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border/20 pt-3 space-y-2">
            <button
              type="button"
              onClick={applyHedge}
              disabled={hedgeApplied || finished}
              className="w-full rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Shield className="h-3 w-3 inline mr-1.5" />
              Apply Hedge
            </button>
            <button
              type="button"
              onClick={reduceExposure}
              disabled={netExposure <= 0 || finished}
              className="w-full rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            >
              <TrendingDown className="h-3 w-3 inline mr-1.5" />
              Reduce Exposure (-25%)
            </button>
            <button
              type="button"
              onClick={goFlat}
              disabled={netExposure <= 0 || finished}
              className="w-full rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <Zap className="h-3 w-3 inline mr-1.5" />
              Go Flat (Close All)
            </button>
          </div>

          {/* Playback controls */}
          <div className="border-t border-border/20 pt-3 mt-auto space-y-2">
            <div className="flex gap-2">
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={play}
                  disabled={finished}
                  className="flex-1 rounded-md bg-muted/30 px-3 py-2 text-xs font-bold text-foreground/80 hover:bg-accent transition-colors disabled:opacity-40 focus-visible:outline-none"
                >
                  Play
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pause}
                  className="flex-1 rounded-md bg-muted/30 px-3 py-2 text-xs font-bold text-foreground/80 hover:bg-accent transition-colors focus-visible:outline-none"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={advance}
                disabled={finished || isPlaying}
                className="flex-1 rounded-md bg-muted/30 px-3 py-2 text-xs font-bold text-foreground/80 hover:bg-accent transition-colors disabled:opacity-40 focus-visible:outline-none"
              >
                Step
              </button>
            </div>
            <button
              type="button"
              onClick={handleFinish}
              disabled={finished}
              className="w-full rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400/80 hover:bg-red-500/20 transition-colors disabled:opacity-40 focus-visible:outline-none"
            >
              End Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post-Scenario Analysis ─────────────────────────────────────────────────

function PostAnalysis({
  scenario,
  result,
  onPlayAgain,
  onBackToLobby,
}: {
  scenario: BlackSwanScenario;
  result: SurvivalResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}) {
  const cols = getSeverityColor(scenario.severity);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full flex-col items-center overflow-y-auto bg-[#080b11] p-6 gap-6"
    >
      {/* Verdict banner */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex flex-col items-center gap-2"
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border-2",
            result.survived
              ? "border-green-500/50 bg-green-500/10"
              : "border-red-500/50 bg-red-500/10",
          )}
        >
          {result.survived
            ? <CheckCircle className="h-8 w-8 text-green-400" />
            : <XCircle className="h-8 w-8 text-red-400" />}
        </div>
        <div className={cn(
          "text-3xl font-black tracking-tight",
          result.survived ? "text-green-400" : "text-red-400",
        )}>
          {result.survived ? "SURVIVED" : "ELIMINATED"}
        </div>
        <div className="text-sm text-muted-foreground/60">
          {scenario.name} — {getSeverityLabel(scenario.severity)}
        </div>
      </motion.div>

      {/* Score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 rounded-lg border border-border/40 bg-card px-6 py-3"
      >
        <Star className="h-5 w-5 text-amber-400" />
        <span className="text-muted-foreground text-sm">Survival Score</span>
        <span className="text-3xl font-black tabular-nums text-foreground">{result.survivalScore}</span>
        <span className="text-muted-foreground/60 text-xs">/ 100</span>
      </motion.div>

      {/* Criteria breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-lg space-y-2"
      >
        <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">
          Criteria Breakdown
        </h3>
        {scenario.survivalCriteria.map((c, i) => {
          const cr = result.criteriaResults.find((r) => r.id === c.id);
          const passed = cr?.passed ?? false;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                passed
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-red-500/20 bg-red-500/5",
              )}
            >
              {passed
                ? <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground">{c.label}</div>
                <div className="text-[10px] text-muted-foreground/70">{c.description}</div>
              </div>
              <span className={cn(
                "text-xs font-black uppercase",
                passed ? "text-green-400" : "text-red-400",
              )}>
                {passed ? "PASS" : "FAIL"}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Performance stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-lg grid grid-cols-2 gap-3"
      >
        <div className="rounded-lg border border-border/30 bg-card p-3">
          <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Capital Preserved</div>
          <div className={cn(
            "text-lg font-black tabular-nums mt-1",
            result.capitalPreserved >= 0.9 ? "text-green-400"
              : result.capitalPreserved >= 0.75 ? "text-amber-400"
              : "text-red-400",
          )}>
            {(result.capitalPreserved * 100).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-border/30 bg-card p-3">
          <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Max Drawdown</div>
          <div className={cn(
            "text-lg font-black tabular-nums mt-1",
            result.maxDrawdownPct < 10 ? "text-green-400"
              : result.maxDrawdownPct < 25 ? "text-amber-400"
              : "text-red-400",
          )}>
            {result.maxDrawdownPct.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-border/30 bg-card p-3">
          <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Hedge Status</div>
          <div className={cn(
            "text-lg font-black mt-1",
            result.hedgeApplied ? "text-green-400" : "text-red-400/70",
          )}>
            {result.hedgeApplied ? "DEPLOYED" : "NONE"}
          </div>
        </div>
        <div className="rounded-lg border border-border/30 bg-card p-3">
          <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Peak Exposure</div>
          <div className={cn(
            "text-lg font-black tabular-nums mt-1",
            result.netExposurePeak <= 0.4 ? "text-green-400"
              : result.netExposurePeak <= 0.7 ? "text-amber-400"
              : "text-red-400",
          )}>
            {(result.netExposurePeak * 100).toFixed(0)}%
          </div>
        </div>
      </motion.div>

      {/* Survivorship analysis */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-lg rounded-lg border border-border/30 bg-card p-4"
      >
        <h3 className="flex items-center gap-2 text-xs font-bold text-foreground mb-3">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          Survivorship Analysis
        </h3>
        <p className="text-xs text-muted-foreground/80 mb-3">
          In historical events of this type, approximately{" "}
          <strong className="text-foreground">{Math.max(2, 12 - scenario.severity)}%</strong>{" "}
          of retail traders preserved more than 80% of their capital. The primary failure mode:
        </p>
        <div className="space-y-1.5">
          {scenario.commonMistakes.slice(0, 3).map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-foreground/70">
              <span className="text-red-400/60 mt-0.5 flex-shrink-0">—</span>
              {m}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-3"
      >
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex items-center gap-2 rounded-md bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
        >
          <AlertTriangle className="h-4 w-4" />
          Try Again
        </button>
        <button
          type="button"
          onClick={onBackToLobby}
          className="rounded-md border border-border bg-muted/30 px-6 py-2.5 text-sm font-bold text-muted-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Back to Lobby
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Hall of Fame ──────────────────────────────────────────────────────────

function HallOfFame({ results }: { results: SurvivalResult[] }) {
  const survived = results.filter((r) => r.survived);

  if (survived.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border/30 bg-card p-8 text-center">
        <Trophy className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-bold text-muted-foreground">No Survivors Yet</p>
        <p className="text-xs text-muted-foreground/60">Complete a Black Swan scenario without being eliminated to earn your place here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5">
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
        <Trophy className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-bold text-amber-400">Black Swan Survivors Hall of Fame</span>
      </div>
      <div className="p-3 space-y-2">
        {survived
          .sort((a, b) => b.survivalScore - a.survivalScore)
          .slice(0, 5)
          .map((r, i) => {
            const sc = BLACK_SWAN_SCENARIOS.find((s) => s.id === r.scenarioId);
            const cols = sc ? getSeverityColor(sc.severity) : { text: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30" };
            return (
              <div
                key={`${r.scenarioId}-${r.completedAt}`}
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-card px-3 py-2"
              >
                <span className="text-sm font-black text-amber-400/60 w-4 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-foreground">{sc?.name ?? r.scenarioId}</div>
                  <div className="text-[9px] text-muted-foreground/60">
                    {(r.capitalPreserved * 100).toFixed(1)}% preserved · DD {r.maxDrawdownPct.toFixed(1)}%
                  </div>
                </div>
                <div className={cn("text-sm font-black tabular-nums", cols.text)}>
                  {r.survivalScore}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export function BlackSwanArena() {
  const [phase, setPhase] = useState<ArenaPhase>("lobby");
  const [selectedScenario, setSelectedScenario] = useState<BlackSwanScenario | null>(null);
  const [lastResult, setLastResult] = useState<SurvivalResult | null>(null);
  const [allResults, setAllResults] = useState<SurvivalResult[]>([]);
  const [showHallOfFame, setShowHallOfFame] = useState(false);

  const handleSelectScenario = useCallback((scenario: BlackSwanScenario) => {
    setSelectedScenario(scenario);
    setPhase("briefing");
  }, []);

  const handleStartScenario = useCallback(() => {
    setPhase("active");
  }, []);

  const handleScenarioComplete = useCallback((result: SurvivalResult) => {
    setLastResult(result);
    setAllResults((prev) => [...prev, result]);
    setPhase("post_analysis");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setLastResult(null);
    setPhase("briefing");
  }, []);

  const handleBackToLobby = useCallback(() => {
    setSelectedScenario(null);
    setLastResult(null);
    setPhase("lobby");
  }, []);

  // Best result per scenario
  const bestResults = useMemo(() => {
    const map: Record<string, SurvivalResult> = {};
    for (const r of allResults) {
      if (!map[r.scenarioId] || r.survivalScore > map[r.scenarioId].survivalScore) {
        map[r.scenarioId] = r;
      }
    }
    return map;
  }, [allResults]);

  return (
    <div className="flex h-full flex-col bg-[#080b11]">
      <AnimatePresence mode="wait">
        {phase === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col overflow-hidden"
          >
            {/* Lobby header */}
            <div className="border-b border-red-900/20 bg-[#0c0f16] px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                      Black Swan Arena
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-foreground">Extreme Scenario Mode</h1>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Eight tail-risk scenarios that separated survivors from the crowd.
                    Capital preservation is the only metric that matters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHallOfFame((v) => !v)}
                  className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Hall of Fame
                </button>
              </div>

              {/* Warning banner */}
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400/80">
                  ⚠ These scenarios simulate market conditions where most portfolios were destroyed.
                  Severity 9–10 events have no safe plays — only less catastrophic losses.
                </span>
              </div>
            </div>

            {/* Hall of Fame (collapsible) */}
            <AnimatePresence>
              {showHallOfFame && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-border/20 px-6 py-4"
                >
                  <HallOfFame results={allResults} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scenario grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {BLACK_SWAN_SCENARIOS.map((scenario, i) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ScenarioCard
                      scenario={scenario}
                      onSelect={() => handleSelectScenario(scenario)}
                      bestResult={bestResults[scenario.id]}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "briefing" && selectedScenario && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <BriefingPanel
              scenario={selectedScenario}
              onStart={handleStartScenario}
              onBack={handleBackToLobby}
            />
          </motion.div>
        )}

        {phase === "active" && selectedScenario && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ActiveScenario
              scenario={selectedScenario}
              onComplete={handleScenarioComplete}
            />
          </motion.div>
        )}

        {phase === "post_analysis" && selectedScenario && lastResult && (
          <motion.div
            key="post_analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <PostAnalysis
              scenario={selectedScenario}
              result={lastResult}
              onPlayAgain={handlePlayAgain}
              onBackToLobby={handleBackToLobby}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
