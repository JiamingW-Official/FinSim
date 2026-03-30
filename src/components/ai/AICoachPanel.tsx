"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Zap,
  TrendingUp,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { cn } from "@/lib/utils";
import {
  analyzeTradeSetup,
  reviewLastTrade,
  generateMarketBrief,
  type AnalysisResult,
  type TradePlan,
} from "@/services/ai/engine";
import { TradeIdeaFeed } from "@/components/ai/TradeIdeaFeed";
import { OpportunityScanner } from "@/components/ai/OpportunityScanner";
import { SentimentGauge } from "@/components/ai/SentimentGauge";
import { PersonalizedCoach } from "@/components/ai/PersonalizedCoach";

type Mode = "trade" | "review" | "brief" | "ideas" | "scan" | "personalized";

const MODES: { value: Mode; label: string; shortLabel: string; desc: string }[] = [
  { value: "trade", label: "Analyze", shortLabel: "Setup", desc: "Technical signal analysis for current chart" },
  { value: "review", label: "Review", shortLabel: "Review", desc: "Grade and review your last completed trade" },
  { value: "brief", label: "Market Brief", shortLabel: "Brief", desc: "Sector context and key levels for this ticker" },
  { value: "ideas", label: "Ideas", shortLabel: "Ideas", desc: "Top trade setups across all tickers" },
  { value: "scan", label: "Scan", shortLabel: "Scan", desc: "Ranked opportunities by signal strength" },
  { value: "personalized", label: "Coach", shortLabel: "Coach", desc: "Adaptive tips based on your trading patterns" },
];

// ─── Inline Sub-Components ───────────────────────────────────────────────────

function ScoreGauge({ score, bias }: { score: number; bias: string }) {
  const label =
    bias === "bullish" ? "Bullish" : bias === "bearish" ? "Bearish" : "Neutral";

  const strokeColor =
    score > 30
      ? "#34d399"
      : score < -30
      ? "#f87171"
      : "#fbbf24";

  const textColor =
    score > 30
      ? "text-emerald-400"
      : score < -30
      ? "text-red-400"
      : "text-amber-400";

  const W = 80;
  const H = 46;
  const R = 34;
  const CX = W / 2;
  const CY = 42;

  const sweepDeg = (Math.abs(score) / 100) * 90;

  function arcPoint(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + R * Math.cos(rad),
      y: CY - R * Math.sin(rad),
    };
  }

  const bgStart = arcPoint(0);
  const bgEnd = arcPoint(180);
  const bgD = `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  let fillD = "";
  if (score !== 0) {
    const centerAngle = 90;
    if (score > 0) {
      const startA = centerAngle;
      const endA = centerAngle - sweepDeg;
      const p1 = arcPoint(startA);
      const p2 = arcPoint(endA);
      const large = sweepDeg > 90 ? 1 : 0;
      fillD = `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 0 ${p2.x} ${p2.y}`;
    } else {
      const startA = centerAngle;
      const endA = centerAngle + sweepDeg;
      const p1 = arcPoint(startA);
      const p2 = arcPoint(endA);
      const large = sweepDeg > 90 ? 1 : 0;
      fillD = `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`;
    }
  }

  return (
    <div className="flex items-center gap-3">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 overflow-visible">
        <path
          d={bgD}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-border/50"
          strokeLinecap="round"
        />
        {fillD && (
          <path
            d={fillD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease, d 0.5s ease" }}
          />
        )}
        <circle cx={CX} cy={CY - R} r="2.5" fill={strokeColor} />
        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="monospace"
          fill={strokeColor}
        >
          {score > 0 ? "+" : ""}{score}
        </text>
      </svg>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className={cn("text-[11px] font-semibold leading-none", textColor)}>{label}</div>
        <div className="text-[10px] text-muted-foreground">Composite: {score > 0 ? "+" : ""}{score} / 100</div>
      </div>
    </div>
  );
}

function SignalChips({
  signals,
  selectedId,
  onSelect,
}: {
  signals: AnalysisResult["signals"];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const top = [...signals]
    .filter((s) => s.direction !== "neutral")
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 7);

  if (top.length === 0) return null;

  const selectedSig = top.find((s) => s.id === selectedId);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1 pb-0.5">
        {top.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => onSelect(selectedId === s.id ? null : s.id)}
            title={s.description}
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[8px] font-mono leading-none whitespace-nowrap transition-colors",
              s.direction === "bullish"
                ? selectedId === s.id
                  ? "bg-emerald-500/20 text-emerald-400/90 border-emerald-500/40 ring-1 ring-emerald-500/30"
                  : "bg-emerald-500/5 text-emerald-400/70 border-emerald-500/20 hover:bg-emerald-500/15"
                : selectedId === s.id
                ? "bg-rose-500/20 text-rose-400/90 border-rose-500/40 ring-1 ring-rose-500/30"
                : "bg-rose-500/5 text-rose-400/70 border-rose-500/20 hover:bg-rose-500/15",
            )}
          >
            {s.shortLabel}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selectedSig && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "rounded border px-2 py-1.5 text-[10px]",
                selectedSig.direction === "bullish"
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-rose-500/5 border-rose-500/20",
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-foreground/80">{selectedSig.shortLabel}</span>
                <span className="text-amber-400 text-xs">
                  {"★".repeat(selectedSig.strength)}{"☆".repeat(3 - selectedSig.strength)}
                </span>
              </div>
              <p className="text-muted-foreground/70 leading-tight">{selectedSig.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LevelLadder({
  levels,
  currentPrice,
}: {
  levels: AnalysisResult["levels"];
  currentPrice: number;
}) {
  const nearestRes = levels.resistances[0];
  const nearestSup = levels.supports[0];

  if (!nearestRes && !nearestSup) return null;

  const rr =
    nearestRes && nearestSup
      ? (() => {
          const reward = nearestRes.price - currentPrice;
          const risk = currentPrice - nearestSup.price;
          if (risk <= 0 || reward <= 0) return null;
          return `1:${(reward / risk).toFixed(1)}`;
        })()
      : null;

  return (
    <div className="rounded border border-border/30 bg-background/30 px-2 py-1.5 space-y-0.5">
      {nearestRes && (
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-rose-400 font-mono font-semibold">${nearestRes.price.toFixed(2)}</span>
          <span className="text-muted-foreground/50">{nearestRes.label}</span>
          <span className="text-rose-400/50 font-mono">▲ R</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[10px] py-0.5 border-y border-border/20">
        <span className="text-foreground/70 font-mono font-semibold">● ${currentPrice.toFixed(2)}</span>
        <span className="text-muted-foreground/40 font-mono">now</span>
        {rr && <span className="text-amber-400/80 font-mono font-semibold">R/R {rr}</span>}
      </div>
      {nearestSup && (
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 font-mono font-semibold">${nearestSup.price.toFixed(2)}</span>
          <span className="text-muted-foreground/50">{nearestSup.label}</span>
          <span className="text-emerald-400/50 font-mono">▼ S</span>
        </div>
      )}
    </div>
  );
}

function DivergenceAlert({ divergences }: { divergences: AnalysisResult["divergences"] }) {
  if (divergences.length === 0) return null;
  const d = divergences[0];
  const isBull = d.type === "bullish";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded border px-2 py-1",
        isBull
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-rose-500/5 border-rose-500/20",
      )}
    >
      <div
        className={cn(
          "w-0.5 h-4 rounded-full shrink-0 animate-pulse",
          isBull ? "bg-emerald-500/60" : "bg-rose-500/60",
        )}
      />
      <Zap
        className={cn("h-2.5 w-2.5 shrink-0", isBull ? "text-emerald-500/70" : "text-rose-500/70")}
      />
      <span
        className={cn(
          "text-[10px] font-mono leading-tight",
          isBull ? "text-emerald-500/70" : "text-rose-500/70",
        )}
      >
        {d.description.length > 65 ? d.description.slice(0, 65) + "…" : d.description}
      </span>
    </div>
  );
}

function ProfileCard({ profile }: { profile: AnalysisResult["traderProfile"] }) {
  if (!profile || profile.totalTrades < 5) return null;

  const styleLabel = profile.style.charAt(0).toUpperCase() + profile.style.slice(1);

  return (
    <div className="rounded border border-border/20 bg-background/30 px-2 py-1.5 space-y-0.5">
      <div className="flex items-center gap-1.5 text-[10px] font-mono">
        <span className="font-semibold text-foreground/70">{styleLabel}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-muted-foreground/60">
          {(profile.winRate * 100).toFixed(0)}% WR
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-muted-foreground/60">{profile.riskRewardRatio.toFixed(1)}:1 R/R</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-muted-foreground/60">PF {profile.profitFactor.toFixed(1)}</span>
      </div>
      <div className="text-[9px] font-mono text-muted-foreground/50 leading-tight">
        {profile.strengthMessage}
      </div>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const cls =
    grade === "A" ? "bg-emerald-500/5 text-emerald-500/80 border-emerald-500/25"
    : grade === "B" ? "bg-emerald-500/5 text-emerald-500/80 border-emerald-500/20"
    : grade === "C" ? "bg-amber-500/10 text-amber-500/80 border-amber-500/25"
    : grade === "D" ? "bg-orange-500/10 text-orange-400/80 border-orange-500/25"
    : "bg-rose-500/5 text-rose-500/80 border-rose-500/25";

  return (
    <div className={cn("rounded border px-3 py-2 text-center shrink-0", cls)}>
      <div className="text-2xl font-semibold leading-none font-mono">{grade}</div>
      <div className="text-[9px] font-mono font-semibold mt-0.5 opacity-70 uppercase tracking-wider">Grade</div>
    </div>
  );
}

function ReviewDisplay({ result }: { result: AnalysisResult }) {
  if (!result.grade) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <GradeBadge grade={result.grade} />
        <div className="flex-1 space-y-1">
          <div className="text-[10px] font-mono text-emerald-400/80 leading-tight">
            <span className="font-semibold">✓ </span>
            {result.wentWell}
          </div>
          <div className="text-[10px] font-mono text-amber-400/80 leading-tight">
            <span className="font-semibold">↑ </span>
            {result.improve}
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallBadge({ label, cls }: { label: string; cls: { bg: string; text: string; border: string } }) {
  return (
    <span
      className={cn(
        "rounded border px-1 py-0.5 text-[9px] font-mono font-semibold leading-none uppercase tracking-wide",
        cls.bg, cls.text, cls.border,
      )}
    >
      {label}
    </span>
  );
}

const REGIME_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  strong_bull: { bg: "bg-emerald-500/5", text: "text-emerald-500/80", border: "border-emerald-500/25" },
  bull: { bg: "bg-emerald-500/5", text: "text-emerald-500/80", border: "border-emerald-500/20" },
  ranging: { bg: "bg-amber-500/10", text: "text-amber-500/80", border: "border-amber-500/25" },
  bear: { bg: "bg-rose-500/5", text: "text-rose-500/80", border: "border-rose-500/25" },
  strong_bear: { bg: "bg-rose-500/15", text: "text-rose-500/80", border: "border-rose-500/30" },
};

const CONVICTION_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "bg-primary/15", text: "text-primary", border: "border-primary/30" },
  medium: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  low: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

// ─── Multi-Timeframe Confluence Panel ────────────────────────────────────────

function seededRand(seed: number): number {
  const s = (seed * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
}

interface TFRow {
  label: string;
  direction: "bullish" | "bearish" | "neutral";
  strength: number;
  topSignal: string;
}

function buildTimeframeRows(barIndex: number, baseBias: string): TFRow[] {
  const seeds = [barIndex * 31 + 7, barIndex * 53 + 13, barIndex * 97 + 41];
  const labels = ["Daily", "4H", "1H"];
  const bullSignals = ["RSI Uptrend", "MACD Cross", "Above SMA50", "BB Bounce", "OBV Rising"];
  const bearSignals = ["RSI Declining", "MACD Bear", "Below SMA20", "BB Squeeze", "ADX Strong"];
  const neutSignals = ["Ranging", "Low ADX", "Coiling", "Mixed Vol"];

  return labels.map((label, i) => {
    const r1 = seededRand(seeds[i]);
    const r2 = seededRand(seeds[i] * 7 + 3);
    const r3 = seededRand(seeds[i] * 13 + 11);

    const alignProb = i === 0 ? 0.72 : i === 1 ? 0.58 : 0.45;
    let direction: "bullish" | "bearish" | "neutral";
    if (r1 < alignProb) {
      direction = baseBias === "bullish" ? "bullish" : baseBias === "bearish" ? "bearish" : "neutral";
    } else if (r1 < alignProb + 0.15) {
      direction = "neutral";
    } else {
      direction = baseBias === "bullish" ? "bearish" : "bullish";
    }

    const strength = Math.max(1, Math.min(5, Math.round(r2 * 4 + 1)));
    const sigPool = direction === "bullish" ? bullSignals : direction === "bearish" ? bearSignals : neutSignals;
    const topSignal = sigPool[Math.floor(r3 * sigPool.length)];

    return { label, direction, strength, topSignal };
  });
}

function StrengthBars({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn("h-1.5 w-1 rounded-sm transition-colors", i < value ? color : "bg-border/20")}
        />
      ))}
    </div>
  );
}

function MultiTimeframePanel({ barIndex, bias }: { barIndex: number; bias: string }) {
  const rows = buildTimeframeRows(barIndex, bias);
  const agreeing = rows.filter((r) => r.direction !== "neutral" && r.direction === (bias === "neutral" ? r.direction : bias)).length;
  const confluenceColor = agreeing === 3 ? "text-emerald-400/80" : agreeing === 2 ? "text-amber-400/80" : "text-rose-400/80";

  return (
    <div className="rounded border border-border/20 bg-background/20 px-2 py-1.5 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
          Multi-TF
        </span>
        <span className={cn("text-[9px] font-mono font-semibold", confluenceColor)}>
          {agreeing}/3 aligned
        </span>
      </div>

      {rows.map((row) => {
        const dirColor =
          row.direction === "bullish"
            ? "text-emerald-400/70"
            : row.direction === "bearish"
            ? "text-rose-400/70"
            : "text-amber-400/70";
        const barColor =
          row.direction === "bullish"
            ? "bg-emerald-400/60"
            : row.direction === "bearish"
            ? "bg-rose-400/60"
            : "bg-amber-400/60";
        const arrow =
          row.direction === "bullish" ? "↑" : row.direction === "bearish" ? "↓" : "→";

        return (
          <div key={row.label} className="flex items-center gap-2 text-[9px] font-mono">
            <span className="w-8 text-muted-foreground/50 shrink-0">{row.label}</span>
            <span className={cn("w-2.5 font-semibold shrink-0", dirColor)}>{arrow}</span>
            <StrengthBars value={row.strength} color={barColor} />
            <span className="text-muted-foreground/40 truncate min-w-0">{row.topSignal}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Strategy Confidence Meter ────────────────────────────────────────────────

interface ConfidenceFactor {
  label: string;
  met: boolean;
}

function buildConfidenceFactors(result: AnalysisResult, currentPrice: number): ConfidenceFactor[] {
  const { signals, divergences, levels, regime } = result;

  const trendAligned =
    (regime.regime === "bull" || regime.regime === "strong_bull") && result.bias === "bullish" ||
    (regime.regime === "bear" || regime.regime === "strong_bear") && result.bias === "bearish";

  const volumeConfirmed = signals.some(
    (s) => s.category === "volume" && s.direction === result.bias,
  );

  const patternDetected = signals.some((s) => s.category === "pattern" && s.direction !== "neutral");

  const nearLevel =
    levels.supports.some((l) => Math.abs(l.price - currentPrice) / currentPrice < 0.015) ||
    levels.resistances.some((l) => Math.abs(l.price - currentPrice) / currentPrice < 0.015);

  const noConflictingDivergence = !divergences.some(
    (d) =>
      (d.type === "bearish" && result.bias === "bullish") ||
      (d.type === "bullish" && result.bias === "bearish"),
  );

  return [
    { label: "Trend alignment", met: trendAligned },
    { label: "Volume confirm", met: volumeConfirmed },
    { label: "Pattern detected", met: patternDetected },
    { label: "S/R level nearby", met: nearLevel },
    { label: "Divergence absent", met: noConflictingDivergence },
  ];
}

function StrategyConfidenceMeter({ result, currentPrice }: { result: AnalysisResult; currentPrice: number }) {
  const factors = buildConfidenceFactors(result, currentPrice);
  const metCount = factors.filter((f) => f.met).length;
  const badgeColor =
    metCount >= 4
      ? "bg-emerald-500/5 text-emerald-400/70 border-emerald-500/20"
      : metCount >= 3
      ? "bg-amber-500/5 text-amber-400/70 border-amber-500/20"
      : "bg-rose-500/5 text-rose-400/70 border-rose-500/20";
  const badgeLabel =
    metCount >= 4 ? "HIGH" : metCount >= 3 ? "MED" : "LOW";

  return (
    <div className="rounded border border-border/20 bg-background/20 px-2 py-1.5 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
          Confidence
        </span>
        <span className={cn("rounded border px-1 py-0.5 text-[8px] font-mono font-semibold leading-none uppercase", badgeColor)}>
          {metCount}/5 {badgeLabel}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5 text-[9px] font-mono">
            <span className={f.met ? "text-emerald-400/70" : "text-muted-foreground/30"}>
              {f.met ? "✓" : "✗"}
            </span>
            <span className={f.met ? "text-foreground/60" : "text-muted-foreground/40"}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TradePlanCard ───────────────────────────────────────────────────────────

function TradePlanCard({ plan, conviction }: { plan: TradePlan; conviction: string }) {
  const entry = (plan.entryZone[0] + plan.entryZone[1]) / 2;
  const risk = Math.abs(entry - plan.stopLoss);
  const reward = Math.abs(plan.target1 - entry);
  const rrRatio = risk > 0 ? reward / risk : 0;

  const winProb =
    conviction === "high" ? 0.62 : conviction === "medium" ? 0.50 : 0.38;
  const lossProb = 1 - winProb;
  const expectedValue = winProb * reward - lossProb * risk;

  const rrColor =
    rrRatio >= 2.0
      ? "bg-emerald-500/5 text-emerald-400/70 border-emerald-500/20"
      : rrRatio >= 1.5
      ? "bg-amber-500/5 text-amber-400/70 border-amber-500/20"
      : "bg-rose-500/5 text-rose-400/70 border-rose-500/20";

  const ACCOUNT = 100_000;
  const conservativeSize = risk > 0 ? Math.max(1, Math.min(100, Math.floor((ACCOUNT * 0.01) / risk))) : 1;
  const aggressiveSize = risk > 0 ? Math.max(1, Math.min(150, Math.floor((ACCOUNT * 0.03) / risk))) : 1;
  const conservativeVal = conservativeSize * entry;
  const aggressiveVal = aggressiveSize * entry;

  return (
    <div className="rounded border border-border/20 bg-background/20 px-2 py-1.5 space-y-1">
      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
        Suggested Plan
      </span>

      <div className="space-y-0.5">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground/60">Entry Zone</span>
          <span className="text-foreground/70">${plan.entryZone[0].toFixed(2)}–${plan.entryZone[1].toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-rose-400/70">Stop Loss</span>
          <span className="text-rose-400/80">${plan.stopLoss.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-emerald-400/70">Target 1</span>
          <span className="text-emerald-400/80">${plan.target1.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-emerald-400/40">Target 2</span>
          <span className="text-emerald-400/50">${plan.target2.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-border/20 pt-1 space-y-0.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground/60">R:R Ratio</span>
          <span className={cn("rounded border px-1 py-0.5 text-[8px] font-semibold leading-none", rrColor)}>
            {rrRatio.toFixed(1)}:1
          </span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground/60">Win prob</span>
          <span className="text-foreground/60">{(winProb * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground/60">Expected value</span>
          <span className={expectedValue >= 0 ? "text-emerald-400/70" : "text-rose-400/70"}>
            {expectedValue >= 0 ? "+" : ""}${expectedValue.toFixed(2)}/sh
          </span>
        </div>
      </div>

      <div className="border-t border-border/20 pt-1 space-y-0.5">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
          Sizing (2% risk)
        </span>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-muted-foreground/50">Conservative (1%)</span>
          <span className="text-muted-foreground/50">{conservativeSize} sh · ${conservativeVal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-foreground/60 font-semibold">Standard (2%)</span>
          <span className="text-primary/70 font-semibold">{plan.positionSize} sh · ${(plan.positionSize * entry).toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-muted-foreground/50">Aggressive (3%)</span>
          <span className="text-muted-foreground/50">{aggressiveSize} sh · ${aggressiveVal.toFixed(0)}</span>
        </div>
      </div>

      <p className="text-[9px] font-mono text-muted-foreground/50 leading-tight border-t border-border/20 pt-1">
        {plan.rationale}
      </p>
    </div>
  );
}

function LivePositionCoach({
  unrealizedPnL,
  unrealizedPnLPercent,
  atrTrailingStop,
  alignmentMsg,
}: {
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  atrTrailingStop: number | null;
  alignmentMsg: string;
}) {
  const isProfit = unrealizedPnL >= 0;
  return (
    <div
      className={cn(
        "rounded border px-2 py-1.5 space-y-0.5",
        isProfit ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
          Live Position
        </span>
        <span
          className={cn(
            "text-[10px] font-mono font-semibold tabular-nums",
            isProfit ? "text-emerald-400/80" : "text-rose-400/80",
          )}
        >
          {isProfit ? "+" : ""}${unrealizedPnL.toFixed(2)}{" "}
          <span className="text-[9px] opacity-70">({isProfit ? "+" : ""}{unrealizedPnLPercent.toFixed(1)}%)</span>
        </span>
      </div>
      {atrTrailingStop !== null && (
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-muted-foreground/50">ATR Trail Stop</span>
          <span className="text-amber-400/70">${atrTrailingStop.toFixed(2)}</span>
        </div>
      )}
      <p className="text-[9px] font-mono text-muted-foreground/60 leading-tight">{alignmentMsg}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AICoachPanel() {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<Mode>("trade");
  const [summaryText, setSummaryText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [showCursor, setShowCursor] = useState(false);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reanalysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTriggerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const prevRevealedRef = useRef(0);
  const lastResultRef = useRef<AnalysisResult | null>(null);

  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const tradeHistoryLength = useTradingStore((s) => s.tradeHistory.length);
  const currentTicker = useChartStore((s) => s.currentTicker);
  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const visibleData = allData.slice(0, revealedCount);

  const stopTyping = useCallback(() => {
    if (typingRef.current !== null) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
  }, []);

  const startTyping = useCallback(
    (fullText: string) => {
      stopTyping();
      setSummaryText("");
      setShowCursor(false);
      if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
      const chars = fullText.split("");
      let i = 0;
      typingRef.current = setInterval(() => {
        if (i < chars.length) {
          setSummaryText((prev) => prev + chars[i]);
          i++;
          if (textScrollRef.current) {
            textScrollRef.current.scrollTop = textScrollRef.current.scrollHeight;
          }
        } else {
          stopTyping();
          setLoading(false);
          setShowCursor(true);
          cursorTimerRef.current = setTimeout(() => setShowCursor(false), 3000);
        }
      }, 14);
    },
    [stopTyping],
  );

  const runAnalysis = useCallback(
    (overrideMode?: Mode) => {
      const activeMode = overrideMode ?? mode;
      stopTyping();
      setLoading(true);
      setSummaryText("");
      setResult(null);
      setError(null);
      setSelectedSignalId(null);

      setTimeout(() => {
        try {
          let analysisResult: AnalysisResult;

          if (activeMode === "trade") {
            analysisResult = analyzeTradeSetup({
              visibleData,
              activeIndicators: activeIndicators as Parameters<typeof analyzeTradeSetup>[0]["activeIndicators"],
              positions,
              currentTicker,
              tradeHistory,
            });
          } else if (activeMode === "review") {
            const lastSell = [...tradeHistory].find((t) => t.side === "sell");
            if (!lastSell) {
              setError("No completed sell trades yet. Make a trade first.");
              setLoading(false);
              return;
            }
            const lastBuy = tradeHistory.find(
              (t) => t.side === "buy" && t.ticker === lastSell.ticker,
            );
            analysisResult = reviewLastTrade({
              lastSell,
              entryPrice: lastBuy?.price ?? lastSell.price,
              tradeHistory,
            });
          } else {
            analysisResult = generateMarketBrief({
              ticker: currentTicker,
              visibleData,
              activeIndicators: activeIndicators as Parameters<typeof generateMarketBrief>[0]["activeIndicators"],
              tradeHistory,
            });
          }

          setResult(analysisResult);
          lastResultRef.current = analysisResult;
          startTyping(analysisResult.summary);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Analysis failed");
          setLoading(false);
        }
      }, 0);
    },
    [mode, visibleData, activeIndicators, positions, currentTicker, tradeHistory, startTyping, stopTyping],
  );

  const handleAnalyze = useCallback(() => runAnalysis(), [runAnalysis]);

  // ─── Agentic Trigger 1: New sell trade → auto switch to review + analyze ──
  const prevTradeLen = useRef(tradeHistoryLength);
  useEffect(() => {
    if (tradeHistoryLength > prevTradeLen.current) {
      const hasSell = tradeHistory[0]?.side === "sell";
      if (hasSell) {
        setMode("review");
        setExpanded(true);
        stopTyping();
        setSummaryText("");
        setResult(null);
        if (autoTriggerTimer.current) clearTimeout(autoTriggerTimer.current);
        autoTriggerTimer.current = setTimeout(() => {
          runAnalysis("review");
        }, 350);
      }
    }
    prevTradeLen.current = tradeHistoryLength;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeHistoryLength]);

  // ─── Agentic Trigger 2: Ticker change → auto morning brief (if open) ──────
  const prevTicker = useRef(currentTicker);
  useEffect(() => {
    if (prevTicker.current !== currentTicker && expanded) {
      prevTicker.current = currentTicker;
      setMode("brief");
      stopTyping();
      setSummaryText("");
      setResult(null);
      if (autoTriggerTimer.current) clearTimeout(autoTriggerTimer.current);
      autoTriggerTimer.current = setTimeout(() => {
        runAnalysis("brief");
      }, 400);
    } else {
      prevTicker.current = currentTicker;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTicker]);

  // ─── Agentic Trigger 3: Indicator toggle → re-analyze (debounced 800ms) ───
  const indicatorKey = activeIndicators.join(",");
  useEffect(() => {
    if (!result) return;
    if (reanalysisTimer.current) clearTimeout(reanalysisTimer.current);
    reanalysisTimer.current = setTimeout(() => {
      runAnalysis();
    }, 800);
    return () => {
      if (reanalysisTimer.current) clearTimeout(reanalysisTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicatorKey]);

  // ─── Agentic Trigger 4: Bar advance → position commentary ──────────────
  useEffect(() => {
    if (revealedCount <= prevRevealedRef.current) {
      prevRevealedRef.current = revealedCount;
      return;
    }
    prevRevealedRef.current = revealedCount;

    const openPos = positions.find((p) => p.ticker === currentTicker);
    if (!openPos || !expanded) return;

    const pct = openPos.unrealizedPnLPercent ?? 0;
    const messages =
      pct > 5
        ? ["Looking strong — let winners run. Trail your stop up.", "Momentum in your favor. Consider partial profit here.", "Position working well. Keep your stop discipline."]
        : pct > 0
        ? ["Small edge so far — stay disciplined, respect your stop.", "In the green — watch for follow-through volume.", "Positive territory. Hold the plan."]
        : pct > -3
        ? ["Small drawdown — still within plan. Hold your stop level.", "Watch for reversal signals before adding or cutting.", "Drawdown manageable — reassess at your stop level."]
        : ["Position under pressure — check if your stop is still valid.", "Significant drawdown. Is the thesis intact?", "Consider reducing size if conviction has dropped."];

    const msg = messages[revealedCount % messages.length];
    toast.custom(
      () => (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow text-xs max-w-56">
          <span className="shrink-0"></span>
          <span className="text-muted-foreground">{msg}</span>
        </div>
      ),
      { duration: 2500, position: "bottom-right" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTyping();
      if (reanalysisTimer.current) clearTimeout(reanalysisTimer.current);
      if (autoTriggerTimer.current) clearTimeout(autoTriggerTimer.current);
      if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
    };
  }, [stopTyping]);

  const regimeCls = result?.regime
    ? (REGIME_CLASSES[result.regime.regime] ?? REGIME_CLASSES.ranging)
    : REGIME_CLASSES.ranging;

  const convictionCls = result?.conviction
    ? (CONVICTION_CLASSES[result.conviction] ?? CONVICTION_CLASSES.low)
    : CONVICTION_CLASSES.low;

  const scoreCls = !result
    ? CONVICTION_CLASSES.low
    : result.score >= 15
    ? REGIME_CLASSES.bull
    : result.score <= -15
    ? REGIME_CLASSES.bear
    : CONVICTION_CLASSES.low;

  const currentPrice = visibleData[visibleData.length - 1]?.close ?? 0;

  const openPosition = positions.find((p) => p.ticker === currentTicker) ?? null;

  const atrTrailingStop: number | null = (() => {
    if (!openPosition || !result) return null;
    const atrEstimate = currentPrice * 0.03;
    if (openPosition.side === "long") {
      return currentPrice - atrEstimate * 2;
    }
    return currentPrice + atrEstimate * 2;
  })();

  const trendAlignmentMessage: string = (() => {
    if (!openPosition || !result) return "";
    const posIsLong = openPosition.side === "long";
    const biasAligned =
      (posIsLong && result.bias === "bullish") ||
      (!posIsLong && result.bias === "bearish");
    if (biasAligned) return "Trend aligned — hold for target. Trail your stop as price advances.";
    if (result.bias === "neutral") return "Signals are mixed — stay disciplined and respect your stop level.";
    return "Signals turned against your position. Consider reducing size or tightening stop.";
  })();

  // ─── Score for compact header display ──────────────────────────────────
  const score = result?.score ?? null;

  return (
    <div className="shrink-0 border-t border-border/20 bg-transparent">
      {/* ── Toggle header ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between px-3 transition-colors hover:bg-muted/5",
          expanded ? "py-2 border-b border-border/20" : "py-1.5 opacity-60 hover:opacity-100",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse shrink-0" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-foreground/70">
            AlphaBot
          </span>
          {result && !expanded && (
            <div className="flex items-center gap-1 ml-1">
              <SmallBadge label={result.regime.label} cls={regimeCls} />
              <SmallBadge label={`${result.score > 0 ? "+" : ""}${result.score}`} cls={scoreCls} />
              <SmallBadge label={result.conviction.toUpperCase()} cls={convictionCls} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {score !== null && expanded && (
            <span className={cn(
              "text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded",
              score >= 15 ? "bg-emerald-500/10 text-emerald-400" :
              score <= -15 ? "bg-rose-500/10 text-rose-400" :
              "bg-muted/20 text-muted-foreground/60"
            )}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          <span className="text-[9px] font-mono text-muted-foreground/30">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* ── Mode selector ── */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/10 shrink-0">
              {MODES.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => {
                    const prevMode = mode;
                    setMode(m.value);
                    if (m.value === "ideas" || m.value === "scan" || m.value === "personalized") {
                      stopTyping();
                      return;
                    }
                    if (
                      (prevMode === "ideas" || prevMode === "scan" || prevMode === "personalized") &&
                      m.value === "trade" &&
                      lastResultRef.current
                    ) {
                      setResult(lastResultRef.current);
                      setSummaryText(lastResultRef.current.summary);
                      return;
                    }
                    setSummaryText("");
                    setResult(null);
                    setError(null);
                    setSelectedSignalId(null);
                    stopTyping();
                  }}
                  title={m.desc}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-colors",
                    mode === m.value
                      ? "bg-primary/15 text-primary/80"
                      : "text-muted-foreground/30 hover:text-muted-foreground/60",
                  )}
                >
                  {m.shortLabel}
                </button>
              ))}
              {mode !== "ideas" && mode !== "scan" && mode !== "personalized" && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="ml-auto text-[9px] font-mono text-primary/60 hover:text-primary/80 transition-colors disabled:opacity-30"
                >
                  {loading ? "···" : "▶ Run"}
                </button>
              )}
            </div>

            {/* ── Main content ── */}
            <div className="flex flex-col gap-1.5 px-3 py-2">

              {/* ── Ideas tab ── */}
              {mode === "ideas" && (
                <div className="space-y-1.5">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
                    Trade Ideas — All Tickers
                  </div>
                  <TradeIdeaFeed compact />
                </div>
              )}

              {/* ── Scan tab ── */}
              {mode === "scan" && (
                <div className="space-y-1.5">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
                    Opportunity Scanner
                  </div>
                  <OpportunityScanner
                    currentTicker={currentTicker}
                    onSelectTicker={(t) => {
                      const store = useChartStore.getState();
                      store.setTicker(t);
                    }}
                  />
                </div>
              )}

              {/* ── Personalized Coach tab ── */}
              {mode === "personalized" && <PersonalizedCoach />}

              {/* ── Loading state (before result) ── */}
              {loading && !result && mode !== "ideas" && mode !== "scan" && mode !== "personalized" && (
                <div className="text-[9px] font-mono text-muted-foreground/40 animate-pulse text-center py-3 uppercase tracking-widest">
                  Analyzing signals…
                </div>
              )}

              {/* ── Error state ── */}
              {error && mode !== "ideas" && mode !== "scan" && mode !== "personalized" && (
                <div className="flex items-start gap-1.5 text-[10px] font-mono text-rose-500/70 rounded border border-rose-500/20 bg-rose-500/5 px-2 py-1.5">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Analysis output ── */}
              {result && mode !== "ideas" && mode !== "scan" && mode !== "personalized" && (
                <div className="space-y-1.5">
                  {/* Review mode */}
                  {mode === "review" && result.grade ? (
                    <>
                      <ReviewDisplay result={result} />
                      {(summaryText || loading) && (
                        <div
                          ref={textScrollRef}
                          className="flex-1 overflow-y-auto px-2 py-1.5 font-mono text-[10px] leading-relaxed text-foreground/60 bg-background/30 rounded border border-border/20 max-h-20"
                        >
                          {summaryText}
                          {loading && (
                            <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-primary/60" />
                          )}
                          {!loading && showCursor && (
                            <motion.span
                              className="ml-0.5 inline-block h-2 w-0.5 bg-primary/60"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ repeat: 5, duration: 0.5, type: "tween" }}
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Setup name */}
                      {result.setupName && (
                        <div className={cn("rounded border px-2 py-1 text-center", regimeCls.bg, regimeCls.border)}>
                          <div className={cn("text-[10px] font-mono font-semibold", regimeCls.text)}>
                            {result.setupName}
                          </div>
                        </div>
                      )}

                      {/* Sentiment gauge or score gauge */}
                      {result.signals.length > 0 ? (
                        <SentimentGauge
                          score={result.score}
                          bias={result.bias}
                          signals={result.signals}
                        />
                      ) : (
                        <ScoreGauge score={result.score} bias={result.bias} />
                      )}

                      {/* Signal chips */}
                      {result.signals.length > 0 && (
                        <SignalChips
                          signals={result.signals}
                          selectedId={selectedSignalId}
                          onSelect={setSelectedSignalId}
                        />
                      )}

                      {/* Divergence alert */}
                      <DivergenceAlert divergences={result.divergences} />

                      {/* Level ladder */}
                      {currentPrice > 0 && (
                        <LevelLadder levels={result.levels} currentPrice={currentPrice} />
                      )}

                      {/* Typed summary */}
                      {(summaryText || loading) && (
                        <div
                          ref={textScrollRef}
                          className="flex-1 overflow-y-auto px-2 py-1.5 font-mono text-[10px] leading-relaxed text-foreground/60 bg-background/30 rounded border border-border/20 italic max-h-20"
                        >
                          {summaryText}
                          {loading && (
                            <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-primary/60" />
                          )}
                          {!loading && showCursor && (
                            <motion.span
                              className="ml-0.5 inline-block h-2 w-0.5 bg-primary/60"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ repeat: 5, duration: 0.5, type: "tween" }}
                            />
                          )}
                        </div>
                      )}

                      {/* Animated insights */}
                      {result.insights.length > 0 && !loading && (
                        <div className="space-y-0.5">
                          {result.insights.map((insight, i) => {
                            const lower = insight.toLowerCase();
                            const isBullish =
                              lower.includes("strong") ||
                              lower.includes("bullish") ||
                              lower.includes("upward") ||
                              lower.includes("rising") ||
                              lower.includes("buy") ||
                              lower.includes("momentum");
                            const isWarning =
                              lower.includes("warning") ||
                              lower.includes("risk") ||
                              lower.includes("caution") ||
                              lower.includes("bearish") ||
                              lower.includes("downward") ||
                              lower.includes("weak");
                            return (
                              <div key={i} className="flex gap-1.5 text-[9px] font-mono leading-tight">
                                {isBullish ? (
                                  <TrendingUp className="h-2.5 w-2.5 text-emerald-400/70 shrink-0 mt-px" />
                                ) : isWarning ? (
                                  <AlertTriangle className="h-2.5 w-2.5 text-amber-400/70 shrink-0 mt-px" />
                                ) : (
                                  <Info className="h-2.5 w-2.5 text-primary/50 shrink-0 mt-px" />
                                )}
                                <span className="text-muted-foreground/60">{insight}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Multi-TF Confluence */}
                      {mode === "trade" && !loading && visibleData.length > 0 && (
                        <MultiTimeframePanel
                          barIndex={visibleData.length}
                          bias={result.bias}
                        />
                      )}

                      {/* Strategy Confidence Meter */}
                      {mode === "trade" && !loading && currentPrice > 0 && (
                        <StrategyConfidenceMeter
                          result={result}
                          currentPrice={currentPrice}
                        />
                      )}

                      {/* Trade Plan */}
                      {result.tradePlan && mode === "trade" && !loading && (
                        <TradePlanCard plan={result.tradePlan} conviction={result.conviction} />
                      )}
                    </>
                  )}

                  {/* Live Position Coach */}
                  {openPosition && !loading && (
                    <LivePositionCoach
                      unrealizedPnL={openPosition.unrealizedPnL}
                      unrealizedPnLPercent={openPosition.unrealizedPnLPercent}
                      atrTrailingStop={atrTrailingStop}
                      alignmentMsg={trendAlignmentMessage}
                    />
                  )}

                  {/* Trader profile */}
                  <ProfileCard profile={result.traderProfile} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
