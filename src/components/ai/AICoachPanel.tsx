"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, RotateCcw, AlertCircle } from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { cn } from "@/lib/utils";
import {
  analyzeTradeSetup,
  reviewLastTrade,
  generateMarketBrief,
} from "@/services/ai/engine";

type Mode = "trade" | "review" | "brief";

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: "trade", label: "Trade Advisor", desc: "Analyze current chart setup" },
  { value: "review", label: "Post-Trade", desc: "Review your last trade" },
  { value: "brief", label: "Morning Brief", desc: "Market context for current ticker" },
];

export function AICoachPanel() {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<Mode>("trade");
  const [text, setText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
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
      setText("");
      const chars = fullText.split("");
      let i = 0;
      typingRef.current = setInterval(() => {
        if (i < chars.length) {
          setText((prev) => prev + chars[i]);
          i++;
        } else {
          stopTyping();
          setLoading(false);
        }
      }, 12);
    },
    [stopTyping],
  );

  const handleAnalyze = useCallback(() => {
    stopTyping();
    setLoading(true);
    setText("");
    setScore(null);
    setError(null);

    // Defer to next tick so UI updates before computation
    setTimeout(() => {
      try {
        let result;

        if (mode === "trade") {
          result = analyzeTradeSetup({
            visibleData,
            activeIndicators: activeIndicators as string[] as Parameters<typeof analyzeTradeSetup>[0]["activeIndicators"],
            positions,
            currentTicker,
          });
        } else if (mode === "review") {
          const lastSell = [...tradeHistory].find((t) => t.side === "sell");
          if (!lastSell) {
            setError("No completed sell trades yet. Make a trade first.");
            setLoading(false);
            return;
          }
          const lastBuy = tradeHistory.find(
            (t) => t.side === "buy" && t.ticker === lastSell.ticker,
          );
          result = reviewLastTrade({
            lastSell,
            entryPrice: lastBuy?.price ?? lastSell.price,
          });
        } else {
          result = generateMarketBrief({
            ticker: currentTicker,
            visibleData,
            activeIndicators: activeIndicators as string[] as Parameters<typeof generateMarketBrief>[0]["activeIndicators"],
          });
        }

        setScore(result.score);
        startTyping(result.text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
        setLoading(false);
      }
    }, 0);
  }, [
    mode,
    visibleData,
    activeIndicators,
    positions,
    currentTicker,
    tradeHistory,
    startTyping,
    stopTyping,
  ]);

  const scoreBgClass =
    score === null
      ? ""
      : score >= 15
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : score <= -15
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-muted text-muted-foreground border-border";

  return (
    <div className="shrink-0 border-t border-border bg-card">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-accent/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-primary" />
          <span className="font-bold">AI Coach</span>
          {score !== null && !expanded && (
            <span
              className={cn(
                "rounded border px-1 py-0.5 text-[9px] font-bold leading-none",
                scoreBgClass,
              )}
            >
              {score > 0 ? "+" : ""}
              {score}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
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
                      setText("");
                      setScore(null);
                      setError(null);
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

              {/* Output area */}
              {(text || loading || error) && (
                <div className="max-h-48 overflow-y-auto rounded-md bg-background/60 p-2">
                  {/* Score badge */}
                  {score !== null && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded border px-1.5 py-0.5 text-[9px] font-black leading-none",
                          scoreBgClass,
                        )}
                      >
                        {score > 0 ? "+" : ""}
                        {score} / 100
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        confluence score
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-1.5 text-[10px] text-red-400">
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {text && (
                    <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-foreground/80">
                      {text}
                      {loading && (
                        <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-primary" />
                      )}
                    </p>
                  )}

                  {loading && !text && (
                    <div className="text-[10px] text-muted-foreground animate-pulse">
                      Analyzing...
                    </div>
                  )}
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
                  {loading ? "Analyzing..." : "Get Analysis"}
                </button>
                {text && !loading && (
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
