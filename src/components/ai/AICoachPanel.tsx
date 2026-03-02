"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw, AlertCircle, Zap } from "lucide-react";
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

type Mode = "trade" | "review" | "brief";

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: "trade", label: "Trade Advisor", desc: "Analyze current chart setup" },
  { value: "review", label: "Post-Trade", desc: "Review your last trade" },
  { value: "brief", label: "Morning Brief", desc: "Market context for current ticker" },
];

// ─── Inline Sub-Components ───────────────────────────────────────────────────

function ScoreGauge({ score, bias }: { score: number; bias: string }) {
  // 20 segments: indices 0-9 = negative half (-100 to 0), 10-19 = positive half (0 to +100)
  // Each segment covers 10 score units
  const SEGMENTS = 20;
  const label =
    bias === "bullish" ? "BULLISH" : bias === "bearish" ? "BEARISH" : "NEUTRAL";
  const labelColor =
    bias === "bullish" ? "text-emerald-400" : bias === "bearish" ? "text-red-400" : "text-amber-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-muted-foreground">Signal Score</span>
        <span className={cn("font-black", labelColor)}>
          {score > 0 ? "+" : ""}{score} / 100 {label}
        </span>
      </div>
      {/* Segmented bar */}
      <div className="flex gap-0.5">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const segMin = -100 + i * 10; // segment floor value
          const isBullSeg = i >= SEGMENTS / 2;
          const isActive = score >= 0
            ? isBullSeg && segMin < score
            : !isBullSeg && segMin >= score;
          const isCenter = i === 9 || i === 10;
          return (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-sm transition-all duration-500",
                isActive
                  ? isBullSeg
                    ? score >= 40 ? "bg-emerald-500" : "bg-green-400"
                    : score <= -40 ? "bg-red-500" : "bg-orange-400"
                  : isCenter
                  ? "bg-border"
                  : "bg-muted",
              )}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] text-muted-foreground/50">
        <span>−100</span>
        <span>0</span>
        <span>+100</span>
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
              "shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold leading-none whitespace-nowrap transition-all",
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
                "rounded border px-2 py-1.5 text-[9px]",
                selectedSig.direction === "bullish"
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : "bg-red-500/10 border-red-500/25",
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-foreground/80">{selectedSig.shortLabel}</span>
                <span className="text-amber-400 text-[10px]">
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
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-red-400 font-bold">${nearestRes.price.toFixed(2)}</span>
          <span className="text-muted-foreground/70">{nearestRes.label}</span>
          <span className="text-red-400/60 text-[8px]">▲ R</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[9px] py-0.5 border-y border-border/30">
        <span className="text-foreground font-black">● ${currentPrice.toFixed(2)}</span>
        <span className="text-muted-foreground/50 text-[8px]">current</span>
        {rr && <span className="text-amber-400 font-bold text-[8px]">R/R {rr}</span>}
      </div>
      {nearestSup && (
        <div className="flex items-center justify-between text-[9px]">
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
          ? "bg-purple-500/10 border-purple-500/30"
          : "bg-orange-500/10 border-orange-500/30",
      )}
    >
      <div
        className={cn(
          "w-0.5 h-5 rounded-full shrink-0 animate-pulse",
          isBull ? "bg-purple-400" : "bg-orange-400",
        )}
      />
      <Zap
        className={cn("h-3 w-3 shrink-0", isBull ? "text-purple-400" : "text-orange-400")}
      />
      <span
        className={cn(
          "text-[9px] font-bold leading-tight",
          isBull ? "text-purple-300" : "text-orange-300",
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
      <div className="flex items-center gap-1.5 text-[9px]">
        <span className="text-[10px]">📊</span>
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
    grade === "A" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : grade === "B" ? "bg-green-500/15 text-green-400 border-green-500/30"
    : grade === "C" ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
    : grade === "D" ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
    : "bg-red-500/15 text-red-400 border-red-500/30";

  return (
    <div className={cn("rounded border px-3 py-2 text-center", cls)}>
      <div className="text-2xl font-black leading-none">{grade}</div>
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
          <div className="text-[9px] text-emerald-400 leading-tight">
            <span className="font-bold">✓ Worked: </span>
            {result.wentWell}
          </div>
          <div className="text-[9px] text-amber-400 leading-tight">
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
        "rounded border px-1 py-0.5 text-[9px] font-black leading-none",
        cls.bg, cls.text, cls.border,
      )}
    >
      {label}
    </span>
  );
}

const REGIME_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  strong_bull: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  bull:        { bg: "bg-green-500/15",   text: "text-green-400",   border: "border-green-500/30" },
  ranging:     { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30" },
  bear:        { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30" },
  strong_bear: { bg: "bg-rose-500/15",    text: "text-rose-400",    border: "border-rose-500/30" },
};

const CONVICTION_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: "bg-primary/15",   text: "text-primary",          border: "border-primary/30" },
  medium: { bg: "bg-orange-500/15", text: "text-orange-400",       border: "border-orange-500/30" },
  low:    { bg: "bg-muted",         text: "text-muted-foreground", border: "border-border" },
};

function TradePlanCard({ plan }: { plan: TradePlan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-md border border-border/40 bg-muted/30 px-2 py-2 space-y-1"
    >
      <div className="text-[9px] font-black uppercase tracking-wider text-foreground/50">
        Trade Plan
      </div>
      <div className="flex justify-between text-[9px]">
        <span className="text-muted-foreground">Entry Zone</span>
        <span className="font-mono text-foreground">
          ${plan.entryZone[0].toFixed(2)}–${plan.entryZone[1].toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between text-[9px]">
        <span className="text-red-400/80">Stop Loss</span>
        <span className="font-mono text-red-400">${plan.stopLoss.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[9px]">
        <span className="text-emerald-400/80">Target 1</span>
        <span className="font-mono text-emerald-400">${plan.target1.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[9px]">
        <span className="text-emerald-400/50">Target 2</span>
        <span className="font-mono text-emerald-400/60">${plan.target2.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[9px]">
        <span className="text-muted-foreground">Size / R:R</span>
        <span className="font-mono text-foreground">
          {plan.positionSize} sh&nbsp;•&nbsp;{plan.riskRewardRatio.toFixed(1)}:1
        </span>
      </div>
      <p className="text-[8.5px] text-muted-foreground/60 leading-tight border-t border-border/30 pt-1">
        {plan.rationale}
      </p>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-md border px-2 py-2 space-y-1",
        isProfit ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-wider text-foreground/50">
          Live Position
        </span>
        <span
          className={cn(
            "text-[10px] font-bold font-mono",
            isProfit ? "text-emerald-400" : "text-red-400",
          )}
        >
          {isProfit ? "+" : ""}${unrealizedPnL.toFixed(2)}{" "}
          <span className="text-[8px]">({isProfit ? "+" : ""}{unrealizedPnLPercent.toFixed(1)}%)</span>
        </span>
      </div>
      {atrTrailingStop !== null && (
        <div className="flex justify-between text-[9px]">
          <span className="text-muted-foreground">ATR Trail Stop</span>
          <span className="font-mono text-amber-400">${atrTrailingStop.toFixed(2)}</span>
        </div>
      )}
      <p className="text-[8.5px] text-muted-foreground/80 leading-tight">{alignmentMsg}</p>
    </motion.div>
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
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reanalysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTriggerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRevealedRef = useRef(0);

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
      const chars = fullText.split("");
      let i = 0;
      typingRef.current = setInterval(() => {
        if (i < chars.length) {
          setSummaryText((prev) => prev + chars[i]);
          i++;
        } else {
          stopTyping();
          setLoading(false);
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
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-zinc-900 px-3 py-1.5 shadow text-[10px] max-w-56">
          <span className="shrink-0">📊</span>
          <span className="text-zinc-400">{msg}</span>
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
          <span className="text-sm leading-none">{moodEmoji}</span>
          <span className="font-bold">AlphaBot</span>
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
              <div className="flex gap-1">
                {MODES.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => {
                      setMode(m.value);
                      setSummaryText("");
                      setResult(null);
                      setError(null);
                      setSelectedSignalId(null);
                      stopTyping();
                    }}
                    title={m.desc}
                    className={cn(
                      "flex-1 rounded px-1.5 py-1 text-[9px] font-bold transition-all leading-tight",
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
                        <div className="rounded-md bg-background/60 px-2 py-1.5 text-[10px] leading-relaxed text-foreground/80">
                          {summaryText}
                          {loading && (
                            <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-primary" />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Setup name hero badge */}
                      {result.setupName && (
                        <div className={cn("rounded-md border px-2 py-2 text-center", regimeCls.bg, regimeCls.border)}>
                          <div className={cn("text-[10px] font-black tracking-wider uppercase", regimeCls.text)}>
                            {moodEmoji} {result.setupName}
                          </div>
                        </div>
                      )}

                      {/* Score gauge */}
                      <ScoreGauge score={result.score} bias={result.bias} />

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
                        <div className="rounded-md bg-background/60 px-2 py-1.5 text-[10px] leading-relaxed text-foreground/80 italic">
                          {summaryText}
                          {loading && (
                            <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-primary" />
                          )}
                        </div>
                      )}

                      {/* Animated insights */}
                      {result.insights.length > 0 && !loading && (
                        <div className="space-y-1">
                          {result.insights.map((insight, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="flex gap-1.5 text-[9px] leading-tight"
                            >
                              <span className="text-primary font-bold shrink-0 mt-0.5">›</span>
                              <span className="text-muted-foreground">{insight}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Trade Plan */}
                      {result.tradePlan && mode === "trade" && !loading && (
                        <TradePlanCard plan={result.tradePlan} />
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

              {/* Loading state (before result) */}
              {loading && !result && (
                <div className="text-[10px] text-muted-foreground animate-pulse text-center py-2">
                  AlphaBot is analyzing…
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex items-start gap-1.5 text-[10px] text-red-400 rounded bg-red-500/10 border border-red-500/20 px-2 py-1.5">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-[10px] font-black transition-colors",
                    loading
                      ? "cursor-not-allowed bg-primary/30 text-primary/50"
                      : "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
                  )}
                >
                  {loading ? "Analyzing…" : "Get Analysis"}
                </button>
                {result && !loading && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="rounded-md border border-border px-2 py-1.5 text-[10px] text-muted-foreground hover:bg-accent transition-colors"
                    title="Retry"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
