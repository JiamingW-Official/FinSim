"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
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
import { Button } from "@/components/ui/button";
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

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: "trade", label: "Analyze", desc: "Technical signal analysis for current chart" },
  { value: "review", label: "Review", desc: "Grade and review your last completed trade" },
  { value: "brief", label: "Market Brief", desc: "Sector context and key levels for this ticker" },
  { value: "ideas", label: "Ideas", desc: "Top trade setups across all tickers" },
  { value: "scan", label: "Scan", desc: "Ranked opportunities by signal strength" },
  { value: "personalized", label: "Coach", desc: "Adaptive tips based on your trading patterns" },
];

// ─── Inline Sub-Components ───────────────────────────────────────────────────

function ScoreGauge({ score, bias }: { score: number; bias: string }) {
  // ── Semicircle SVG gauge ────────────────────────────────────────────────
  // The arc sweeps 180° (π rad) from the left (180°) to the right (0°).
  // We fill proportionally from the center outward in the bias direction.
  const label =
    bias === "bullish" ? "Bullish" : bias === "bearish" ? "Bearish" : "Neutral";

  const strokeColor =
    score > 30
      ? "#34d399" // emerald-400
      : score < -30
      ? "#f87171" // red-400
      : "#fbbf24"; // amber-400

  const textColor =
    score > 30
      ? "text-emerald-400"
      : score < -30
      ? "text-red-400"
      : "text-amber-400";

  // SVG dimensions
  const W = 80;
  const H = 46; // just above the radius so we see the full arc + number
  const R = 34;  // arc radius
  const CX = W / 2;
  const CY = 42; // center slightly below bottom so arc is centered visually

  // Arc from 180° to 0° (left to right, clockwise).
  // Fill fraction: map score (-100..+100) → 0..1 based on how far from center
  // The arc fills from 180° (left) for bearish, or from 0° (right) for bullish,
  // always starting at center (90° = top of semicircle, or actually CY bottom).
  //
  // Simpler model: full arc is 180° sweep (left-to-right).
  // Neutral center point = 90° from left = 270° in SVG coords.
  // Fill from center toward left (bearish) or right (bullish).
  // The filled sweep angle = |score| / 100 * 90°.

  const sweepDeg = (Math.abs(score) / 100) * 90; // 0..90°

  // Arc helper
  function arcPoint(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + R * Math.cos(rad),
      y: CY - R * Math.sin(rad),
    };
  }

  // Background arc: full 180° from 0° to 180° (SVG angle: right=0, up=90, left=180)
  const bgStart = arcPoint(0);
  const bgEnd = arcPoint(180);
  const bgD = `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Filled arc
  let fillD = "";
  if (score !== 0) {
    // Center of arc at 90° (top)
    const centerAngle = 90;
    if (score > 0) {
      // Bull: sweeps from center (90°) counterclockwise toward 180° (left-to-right)
      // But visually: fill from center toward right (0°)
      const startA = centerAngle;
      const endA = centerAngle - sweepDeg; // e.g. score=100 → endA=0°
      const p1 = arcPoint(startA);
      const p2 = arcPoint(endA);
      const large = sweepDeg > 90 ? 1 : 0;
      fillD = `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 0 ${p2.x} ${p2.y}`;
    } else {
      // Bear: sweeps from center (90°) toward 180° (left)
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
      {/* SVG gauge */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 overflow-visible">
        {/* Background track */}
        <path
          d={bgD}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-border/50"
          strokeLinecap="round"
        />
        {/* Filled arc */}
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
        {/* Center dot */}
        <circle cx={CX} cy={CY - R} r="2.5" fill={strokeColor} />
        {/* Score number */}
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

      {/* Label + context */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className={cn("text-[11px] font-bold leading-none", textColor)}>{label}</div>
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
      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
        {top.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => onSelect(selectedId === s.id ? null : s.id)}
            title={s.description}
            className={cn(
              "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none whitespace-nowrap transition-all",
              s.direction === "bullish"
                ? selectedId === s.id
                  ? "bg-emerald-500/30 text-emerald-300 border-emerald-400/60 ring-1 ring-emerald-400/40"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                : selectedId === s.id
                ? "bg-red-500/30 text-red-300 border-red-400/60 ring-1 ring-red-400/40"
                : "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25",
            )}
          >
            {s.direction === "bullish" ? "↑" : "↓"} {s.shortLabel}
          </button>
        ))}
      </div>
      {/* Expanded signal detail */}
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
                "rounded border px-2 py-1.5 text-[11px]",
                selectedSig.direction === "bullish"
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : "bg-red-500/10 border-red-500/25",
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-foreground/80">{selectedSig.shortLabel}</span>
                <span className="text-amber-400 text-xs">
                  {"★".repeat(selectedSig.strength)}{"☆".repeat(3 - selectedSig.strength)}
                </span>
              </div>
              <p className="text-muted-foreground leading-tight">{selectedSig.description}</p>
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
    <div className="rounded-md bg-background/40 border border-border/40 px-2 py-1.5 space-y-0.5">
      {nearestRes && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-red-400 font-bold">${nearestRes.price.toFixed(2)}</span>
          <span className="text-muted-foreground/70">{nearestRes.label}</span>
          <span className="text-red-400/60 text-[8px]">▲ R</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[11px] py-0.5 border-y border-border/30">
        <span className="text-foreground font-bold">● ${currentPrice.toFixed(2)}</span>
        <span className="text-muted-foreground/50 text-[8px]">current</span>
        {rr && <span className="text-amber-400 font-bold text-[8px]">R/R {rr}</span>}
      </div>
      {nearestSup && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-emerald-400 font-bold">${nearestSup.price.toFixed(2)}</span>
          <span className="text-muted-foreground/70">{nearestSup.label}</span>
          <span className="text-emerald-400/60 text-[8px]">▼ S</span>
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
        "flex items-center gap-1.5 rounded border px-2 py-1.5",
        isBull
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-red-500/10 border-red-500/30",
      )}
    >
      <div
        className={cn(
          "w-0.5 h-5 rounded-full shrink-0 animate-pulse",
          isBull ? "bg-emerald-500" : "bg-red-500",
        )}
      />
      <Zap
        className={cn("h-3 w-3 shrink-0", isBull ? "text-emerald-500" : "text-red-500")}
      />
      <span
        className={cn(
          "text-[11px] font-bold leading-tight",
          isBull ? "text-emerald-500" : "text-red-500",
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
    <div className="rounded bg-background/40 border border-border/50 px-2 py-1.5 space-y-0.5">
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="text-xs">📊</span>
        <span className="font-bold text-foreground/80">{styleLabel}</span>
        <span className="text-muted-foreground">
          {(profile.winRate * 100).toFixed(0)}% WR
        </span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{profile.riskRewardRatio.toFixed(1)}:1 R/R</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">PF {profile.profitFactor.toFixed(1)}</span>
      </div>
      <div className="text-[8px] text-muted-foreground/70 leading-tight">
        {profile.strengthMessage}
      </div>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const cls =
    grade === "A" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
    : grade === "B" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    : grade === "C" ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
    : grade === "D" ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
    : "bg-red-500/15 text-red-500 border-red-500/30";

  return (
    <div className={cn("rounded border px-3 py-2 text-center", cls)}>
      <div className="text-2xl font-bold leading-none">{grade}</div>
      <div className="text-[8px] font-bold mt-0.5 opacity-80">TRADE GRADE</div>
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
          <div className="text-[11px] text-emerald-400 leading-tight">
            <span className="font-bold">✓ Worked: </span>
            {result.wentWell}
          </div>
          <div className="text-[11px] text-amber-400 leading-tight">
            <span className="font-bold">↑ Improve: </span>
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
        "rounded border px-1 py-0.5 text-[11px] font-bold leading-none",
        cls.bg, cls.text, cls.border,
      )}
    >
      {label}
    </span>
  );
}

const REGIME_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  strong_bull: { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30" },
  bull:        { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  ranging:     { bg: "bg-amber-500/15",   text: "text-amber-500",   border: "border-amber-500/30" },
  bear:        { bg: "bg-red-500/15",     text: "text-red-500",     border: "border-red-500/30" },
  strong_bear: { bg: "bg-red-500/20",     text: "text-red-500",     border: "border-red-500/40" },
};

const CONVICTION_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: "bg-primary/15",   text: "text-primary",          border: "border-primary/30" },
  medium: { bg: "bg-orange-500/15", text: "text-orange-400",       border: "border-orange-500/30" },
  low:    { bg: "bg-muted",         text: "text-muted-foreground", border: "border-border" },
};

// ─── Multi-Timeframe Confluence Panel ────────────────────────────────────────

// Seeded PRNG (same as project convention)
function seededRand(seed: number): number {
  const s = (seed * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
}

interface TFRow {
  label: string;
  direction: "bullish" | "bearish" | "neutral";
  strength: number; // 1–5
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

    // Bias alignment: daily most likely to agree with base, 1H least
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
          className={cn("h-2 w-1 rounded-sm transition-colors", i < value ? color : "bg-border/30")}
        />
      ))}
    </div>
  );
}

function MultiTimeframePanel({ barIndex, bias }: { barIndex: number; bias: string }) {
  const rows = buildTimeframeRows(barIndex, bias);
  const agreeing = rows.filter((r) => r.direction !== "neutral" && r.direction === (bias === "neutral" ? r.direction : bias)).length;
  const confluenceColor = agreeing === 3 ? "text-emerald-400" : agreeing === 2 ? "text-amber-400" : "text-red-400";

  return (
    <div
      className="rounded-md border border-border/40 bg-background/30 px-2 py-2 space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold text-foreground/50">
          Multi-TF Confluence
        </div>
        <span className={cn("text-[11px] font-bold", confluenceColor)}>
          {agreeing}/3 aligned
        </span>
      </div>

      {rows.map((row) => {
        const dirColor =
          row.direction === "bullish"
            ? "text-emerald-400"
            : row.direction === "bearish"
            ? "text-red-400"
            : "text-amber-400";
        const barColor =
          row.direction === "bullish"
            ? "bg-emerald-400"
            : row.direction === "bearish"
            ? "bg-red-400"
            : "bg-amber-400";
        const arrow =
          row.direction === "bullish" ? "↑" : row.direction === "bearish" ? "↓" : "→";

        return (
          <div key={row.label} className="flex items-center gap-2 text-[11px]">
            <span className="w-9 text-muted-foreground font-bold shrink-0">{row.label}</span>
            <span className={cn("w-3 font-bold shrink-0", dirColor)}>{arrow}</span>
            <StrengthBars value={row.strength} color={barColor} />
            <span className="text-muted-foreground/70 truncate min-w-0">{row.topSignal}</span>
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

  // 1. Trend alignment: regime is bull/bear (not ranging) and bias matches
  const trendAligned =
    (regime.regime === "bull" || regime.regime === "strong_bull") && result.bias === "bullish" ||
    (regime.regime === "bear" || regime.regime === "strong_bear") && result.bias === "bearish";

  // 2. Volume confirmation: OBV or volume signal present
  const volumeConfirmed = signals.some(
    (s) => s.category === "volume" && s.direction === result.bias,
  );

  // 3. Pattern detected
  const patternDetected = signals.some((s) => s.category === "pattern" && s.direction !== "neutral");

  // 4. S/R level nearby (within 1.5%)
  const nearLevel =
    levels.supports.some((l) => Math.abs(l.price - currentPrice) / currentPrice < 0.015) ||
    levels.resistances.some((l) => Math.abs(l.price - currentPrice) / currentPrice < 0.015);

  // 5. Divergence absent (no conflicting divergence)
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
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : metCount >= 3
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";
  const badgeLabel =
    metCount >= 4 ? "HIGH" : metCount >= 3 ? "MED" : "LOW";

  return (
    <div
      className="rounded-md border border-border/40 bg-background/30 px-2 py-2 space-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold text-foreground/50">
          Confidence Check
        </div>
        <span className={cn("rounded border px-1.5 py-0.5 text-[8px] font-bold leading-none", badgeColor)}>
          {metCount}/5 {badgeLabel}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5 text-[8.5px]">
            <span className={f.met ? "text-emerald-400" : "text-muted-foreground/40"}>
              {f.met ? "✓" : "✗"}
            </span>
            <span className={f.met ? "text-foreground/70" : "text-muted-foreground/50"}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TradePlanCard with R:R calculator and position sizing ───────────────────

function TradePlanCard({ plan, conviction }: { plan: TradePlan; conviction: string }) {
  const entry = (plan.entryZone[0] + plan.entryZone[1]) / 2;
  const risk = Math.abs(entry - plan.stopLoss);
  const reward = Math.abs(plan.target1 - entry);
  const rrRatio = risk > 0 ? reward / risk : 0;

  // Probability of hitting target from conviction
  const winProb =
    conviction === "high" ? 0.62 : conviction === "medium" ? 0.50 : 0.38;
  const lossProb = 1 - winProb;
  const expectedValue = winProb * reward - lossProb * risk;

  const rrColor =
    rrRatio >= 2.0
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : rrRatio >= 1.5
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";

  // Position sizing variants (2% account risk default, 1% conservative, 3% aggressive)
  const ACCOUNT = 100_000;
  const conservativeSize = risk > 0 ? Math.max(1, Math.min(100, Math.floor((ACCOUNT * 0.01) / risk))) : 1;
  const aggressiveSize = risk > 0 ? Math.max(1, Math.min(150, Math.floor((ACCOUNT * 0.03) / risk))) : 1;
  const conservativeVal = conservativeSize * entry;
  const aggressiveVal = aggressiveSize * entry;

  return (
    <div
      className="rounded-md border border-border/40 bg-muted/30 px-2 py-2 space-y-1"
    >
      <div className="text-[11px] font-bold text-foreground/50">
        Suggested Plan
      </div>
      <div className="text-[9px] text-muted-foreground/50 -mt-0.5">
        Based on detected technical signals
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">Entry Zone</span>
        <span className="font-mono text-foreground">
          ${plan.entryZone[0].toFixed(2)}–${plan.entryZone[1].toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-red-400/80">Stop Loss</span>
        <span className="font-mono text-red-400">${plan.stopLoss.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-emerald-400/80">Target 1</span>
        <span className="font-mono text-emerald-400">${plan.target1.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-emerald-400/50">Target 2</span>
        <span className="font-mono text-emerald-400/60">${plan.target2.toFixed(2)}</span>
      </div>

      {/* R:R Calculator */}
      <div className="border-t border-border/30 pt-1 space-y-0.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">R:R Ratio</span>
          <span className={cn("rounded border px-1.5 py-0.5 text-[8px] font-bold leading-none", rrColor)}>
            {rrRatio.toFixed(1)}:1
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Win prob</span>
          <span className="font-mono text-foreground/70">{(winProb * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Expected value</span>
          <span className={cn("font-mono", expectedValue >= 0 ? "text-emerald-400" : "text-red-400")}>
            {expectedValue >= 0 ? "+" : ""}${expectedValue.toFixed(2)}/sh
          </span>
        </div>
      </div>

      {/* Position Sizing */}
      <div className="border-t border-border/30 pt-1 space-y-0.5">
        <div className="text-[8px] font-bold text-foreground/40">
          Position Sizing (2% risk)
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground/70">Conservative (1%)</span>
          <span className="font-mono text-foreground/60">{conservativeSize} sh · ${conservativeVal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-foreground/70 font-bold">Standard (2%)</span>
          <span className="font-mono text-primary font-bold">{plan.positionSize} sh · ${(plan.positionSize * entry).toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground/70">Aggressive (3%)</span>
          <span className="font-mono text-foreground/60">{aggressiveSize} sh · ${aggressiveVal.toFixed(0)}</span>
        </div>
      </div>

      <p className="text-[8.5px] text-muted-foreground/60 leading-tight border-t border-border/30 pt-1">
        {plan.rationale}
      </p>
    </div>
  );
}

function AlphaBotFace({
  loading,
  bias,
  conviction,
}: {
  loading?: boolean;
  bias?: string;
  conviction?: string;
}) {
  const isHappy = !loading && bias === "bullish" && conviction === "high";
  const isSad = !loading && bias === "bearish" && conviction === "high";

  return (
    <div className="shrink-0"
    >
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        {/* Face */}
        <rect x="2" y="3" width="24" height="22" rx="5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
        {/* Antenna */}
        <line x1="14" y1="3" x2="14" y2="1" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="14" cy="0.8" r="1.5" fill="#10b981" />

        {/* Expression */}
        {loading ? (
          <g>
            <circle cx="9.5" cy="13" r="2.5" fill="#94a3b8" opacity="0.5" />
            <circle cx="18.5" cy="13" r="2.5" fill="#94a3b8" opacity="0.5" />
            {/* Bouncing dots */}
            <motion.circle cx="10" cy="20.5" r="1.3" fill="#10b981"
              animate={{ cy: [20.5, 18.5, 20.5] }}
              transition={{ repeat: Infinity, duration: 0.7, delay: 0 }} />
            <motion.circle cx="14" cy="20.5" r="1.3" fill="#10b981"
              animate={{ cy: [20.5, 18.5, 20.5] }}
              transition={{ repeat: Infinity, duration: 0.7, delay: 0.15 }} />
            <motion.circle cx="18" cy="20.5" r="1.3" fill="#10b981"
              animate={{ cy: [20.5, 18.5, 20.5] }}
              transition={{ repeat: Infinity, duration: 0.7, delay: 0.3 }} />
          </g>
        ) : isHappy ? (
          <g>
            <path d="M7 13.5 Q9.5 10.5 12 13.5" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M16 13.5 Q18.5 10.5 21 13.5" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M9 19.5 Q14 23.5 19 19.5" stroke="#34d399" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        ) : isSad ? (
          <g>
            <path d="M7 11.5 Q9.5 14.5 12 11.5" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M16 11.5 Q18.5 14.5 21 11.5" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M9 21.5 Q14 17.5 19 21.5" stroke="#f87171" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="9.5" cy="12.5" r="2" fill="#94a3b8" />
            <circle cx="18.5" cy="12.5" r="2" fill="#94a3b8" />
            <path d="M9.5 19.5 L18.5 19.5" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
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
        "rounded-md border px-2 py-2 space-y-1",
        isProfit ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-foreground/50">
          Live Position
        </span>
        <span
          className={cn(
            "text-xs font-bold font-mono",
            isProfit ? "text-emerald-400" : "text-red-400",
          )}
        >
          {isProfit ? "+" : ""}${unrealizedPnL.toFixed(2)}{" "}
          <span className="text-[8px]">({isProfit ? "+" : ""}{unrealizedPnLPercent.toFixed(1)}%)</span>
        </span>
      </div>
      {atrTrailingStop !== null && (
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">ATR Trail Stop</span>
          <span className="font-mono text-amber-400">${atrTrailingStop.toFixed(2)}</span>
        </div>
      )}
      <p className="text-[8.5px] text-muted-foreground/80 leading-tight">{alignmentMsg}</p>
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
  // Persist the last analysis result so switching to Ideas/Scan and back
  // does not lose the trade analysis without re-running the engine.
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
          // Auto-scroll text area
          if (textScrollRef.current) {
            textScrollRef.current.scrollTop = textScrollRef.current.scrollHeight;
          }
        } else {
          stopTyping();
          setLoading(false);
          // Show blinking cursor for 3s then fade
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
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card px-3 py-1.5 shadow text-xs max-w-56">
          <span className="shrink-0">📊</span>
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

  // ─── Mood emoji ────────────────────────────────────────────────────────────
  const moodEmoji = !result
    ? "🤖"
    : result.conviction === "high" && result.bias === "bullish"
    ? "🚀"
    : result.conviction === "high" && result.bias === "bearish"
    ? "🐻"
    : result.divergences.length > 0
    ? "⚡"
    : result.bias === "neutral"
    ? "🔍"
    : "📊";

  // Badge classes
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

  // ─── Live position coaching values ─────────────────────────────────────
  const openPosition = positions.find((p) => p.ticker === currentTicker) ?? null;

  const atrTrailingStop: number | null = (() => {
    if (!openPosition || !result) return null;
    // Find ATR from result signals or snap (use 3% fallback)
    const atrSig = result.signals.find((s) => s.id.startsWith("atr_"));
    const atrEstimate = atrSig ? currentPrice * 0.03 : currentPrice * 0.03;
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
    return "⚠️ Signals turned against your position. Consider reducing size or tightening stop.";
  })();

  return (
    <div className="shrink-0 border-t border-border bg-card">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-accent/20 transition-colors"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <AlphaBotFace loading={loading} bias={result?.bias} conviction={result?.conviction} />
          <span className="font-bold">Market Analysis</span>
          {expanded && (
            <span className="text-[9px] text-muted-foreground/70 font-normal">Rules-based</span>
          )}
          {result && !expanded && (
            <>
              <SmallBadge label={result.regime.label} cls={regimeCls} />
              <SmallBadge
                label={`${result.score > 0 ? "+" : ""}${result.score}`}
                cls={scoreCls}
              />
              <SmallBadge label={result.conviction.toUpperCase()} cls={convictionCls} />
            </>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
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
            <div className="flex flex-col gap-2 px-3 pb-3">
              {/* Mode selector */}
              <div className="flex gap-1 flex-wrap">
                {MODES.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => {
                      const prevMode = mode;
                      setMode(m.value);
                      // Ideas, Scan, and Personalized tabs are self-contained — don't clear analysis state.
                      // When returning from these tabs back to an analysis mode, restore
                      // the persisted result so it doesn't appear blank.
                      if (m.value === "ideas" || m.value === "scan" || m.value === "personalized") {
                        stopTyping();
                        return;
                      }
                      if (
                        (prevMode === "ideas" || prevMode === "scan" || prevMode === "personalized") &&
                        m.value === "trade" &&
                        lastResultRef.current
                      ) {
                        // Restore without re-typing
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
                      "flex-1 rounded px-1 py-1 text-[8.5px] font-bold transition-all leading-tight min-w-0",
                      mode === m.value
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* ── Visual output area ─────────────────────────────────── */}
              {result && (
                <div className="space-y-2">
                  {/* Review mode: grade + worked/improve */}
                  {mode === "review" && result.grade ? (
                    <>
                      <ReviewDisplay result={result} />
                      {/* Typed summary */}
                      {(summaryText || loading) && (
                        <div className="rounded-md bg-background/60 px-2 py-1.5 text-xs leading-relaxed text-foreground/80">
                          {summaryText}
                          {loading && (
                            <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-primary" />
                          )}
                          {!loading && showCursor && (
                            <motion.span
                              className="ml-0.5 inline-block h-2 w-0.5 bg-primary"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ repeat: 5, duration: 0.5, type: "tween" }}
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Setup name hero badge */}
                      {result.setupName && (
                        <div className={cn("rounded-md border px-2 py-2 text-center", regimeCls.bg, regimeCls.border)}>
                          <div className={cn("text-xs font-bold tracking-wider uppercase", regimeCls.text)}>
                            {moodEmoji} {result.setupName}
                          </div>
                        </div>
                      )}

                      {/* Sentiment Gauge (full semicircle) when signals are present */}
                      {result.signals.length > 0 ? (
                        <SentimentGauge
                          score={result.score}
                          bias={result.bias}
                          signals={result.signals}
                        />
                      ) : (
                        /* Fallback compact gauge when no indicator signals */
                        <ScoreGauge score={result.score} bias={result.bias} />
                      )}

                      {/* Signal chips — clickable, expandable */}
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
                        <div ref={textScrollRef} className="rounded-md bg-background/60 px-2 py-1.5 text-xs leading-relaxed text-foreground/80 italic max-h-24 overflow-y-auto scrollbar-hide">
                          {summaryText}
                          {loading && (
                            <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-primary" />
                          )}
                          {!loading && showCursor && (
                            <motion.span
                              className="ml-0.5 inline-block h-2 w-0.5 bg-primary"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ repeat: 5, duration: 0.5, type: "tween" }}
                            />
                          )}
                        </div>
                      )}

                      {/* Animated insights with sentiment icons */}
                      {result.insights.length > 0 && !loading && (
                        <div className="space-y-1">
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
                              <div
                                key={i}
                                className="flex gap-1.5 text-[11px] leading-tight"
                              >
                                {isBullish ? (
                                  <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                                ) : isWarning ? (
                                  <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Info className="h-3 w-3 text-primary/70 shrink-0 mt-0.5" />
                                )}
                                <span className="text-muted-foreground">{insight}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Multi-Timeframe Confluence Panel */}
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

                  {/* Live Position Coach — shown whenever a position is open */}
                  {openPosition && result && !loading && (
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

              {/* ── Ideas tab ─────────────────────────────────────────────── */}
              {mode === "ideas" && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-foreground/40">
                    Trade Ideas — All Tickers
                  </div>
                  <TradeIdeaFeed compact />
                </div>
              )}

              {/* ── Scan tab ──────────────────────────────────────────────── */}
              {mode === "scan" && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-foreground/40">
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

              {/* ── Personalized Coach tab ──────────────────────────────────── */}
              {mode === "personalized" && (
                <PersonalizedCoach />
              )}

              {/* Loading state (before result) */}
              {loading && !result && mode !== "ideas" && mode !== "scan" && mode !== "personalized" && (
                <div className="text-xs text-muted-foreground animate-pulse text-center py-2">
                  Analyzing signals…
                </div>
              )}

              {/* Error state */}
              {error && mode !== "ideas" && mode !== "scan" && mode !== "personalized" && (
                <div className="flex items-start gap-1.5 text-xs text-red-400 rounded bg-red-500/10 border border-red-500/20 px-2 py-1.5">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action buttons — hidden on Ideas and Scan tabs */}
              {mode !== "ideas" && mode !== "scan" && mode !== "personalized" && (
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 text-xs font-bold"
                >
                  {loading ? "Analyzing…" : "Get Analysis"}
                </Button>
                {result && !loading && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyze}
                    title="Retry"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
