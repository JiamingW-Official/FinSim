"use client";

import { useState, useCallback, useEffect } from "react";
import { BookMarked, TrendingUp, RotateCcw, Zap, Layers, Copy, Play, Edit2, Trash2, Download, GitCompare, CheckCircle2, X, Save } from "lucide-react";
import VisualStrategyBuilder from "@/components/backtest/VisualStrategyBuilder";
import type { VisualStrategy } from "@/components/backtest/VisualStrategyBuilder";

// ── Types ─────────────────────────────────────────────────────────────────────

type StrategyCategory = "trend" | "mean-reversion" | "momentum" | "breakout";

interface PrebuiltStrategy {
  id: string;
  name: string;
  category: StrategyCategory;
  description: string;
  parameters: string[];
  sharpe: number;
  winRate: number;
  bestYear: number;
  worstYear: number;
  prefillEntry: Partial<VisualStrategy>;
}

type PageTab = "library" | "my-strategies" | "builder";

const CATEGORY_META: Record<StrategyCategory, { label: string; color: string; bg: string }> = {
  trend:           { label: "Trend",           color: "text-primary",   bg: "bg-primary/10" },
  "mean-reversion":{ label: "Mean Reversion",  color: "text-amber-400",  bg: "bg-amber-500/10" },
  momentum:        { label: "Momentum",         color: "text-primary", bg: "bg-primary/10" },
  breakout:        { label: "Breakout",         color: "text-emerald-400",   bg: "bg-teal-500/10" },
};

// ── Pre-built strategy definitions ────────────────────────────────────────────

const PREBUILT_STRATEGIES: PrebuiltStrategy[] = [
  {
    id: "rsi-mean-rev",
    name: "RSI Mean Reversion",
    category: "mean-reversion",
    description:
      "Buys when RSI(14) drops below 30 (oversold), exits when RSI recovers above 70. " +
      "Works best in range-bound, low-volatility markets. Uses 5% stop-loss to cap downside.",
    parameters: [
      "RSI period: 14",
      "Entry threshold: RSI < 30",
      "Exit threshold: RSI > 70",
      "Stop-loss: 5%",
      "Position size: 50%",
    ],
    sharpe: 1.42,
    winRate: 58,
    bestYear: 34.2,
    worstYear: -12.1,
    prefillEntry: {
      name: "RSI Mean Reversion",
      entryConditions: [{ id: "e1", indicator: "RSI", condition: "crosses above", targetPreset: "30", targetNumber: 30, usePreset: true }],
      exitConditions:  [{ id: "x1", indicator: "RSI", condition: "crosses below", targetPreset: "70", targetNumber: 70, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 5,
      positionSizePercent: 50,
    },
  },
  {
    id: "macd-momentum",
    name: "MACD Momentum",
    category: "momentum",
    description:
      "Enters long when MACD line crosses above the signal line; exits when MACD crosses back below. " +
      "Captures medium-term trend continuation after momentum shifts. " +
      "Default parameters: fast=12, slow=26, signal=9.",
    parameters: [
      "MACD fast EMA: 12",
      "MACD slow EMA: 26",
      "Signal period: 9",
      "Entry: MACD crosses above signal line",
      "Exit: MACD crosses below signal line",
      "Stop-loss: 8%",
    ],
    sharpe: 1.18,
    winRate: 51,
    bestYear: 41.7,
    worstYear: -18.4,
    prefillEntry: {
      name: "MACD Momentum",
      entryConditions: [{ id: "e1", indicator: "MACD", condition: "crosses above", targetPreset: "signal line", targetNumber: 0, usePreset: true }],
      exitConditions:  [{ id: "x1", indicator: "MACD", condition: "crosses below", targetPreset: "signal line", targetNumber: 0, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 8,
      positionSizePercent: 60,
    },
  },
  {
    id: "ema-crossover",
    name: "EMA Crossover",
    category: "trend",
    description:
      "Classic 9/21 EMA crossover. Long when fast (9) EMA crosses above slow (21) EMA; " +
      "flat when fast crosses below. Simple, robust trend-following suited to trending equities.",
    parameters: [
      "Fast EMA period: 9",
      "Slow EMA period: 21",
      "Entry: 9 EMA crosses above 21 EMA",
      "Exit: 9 EMA crosses below 21 EMA",
      "No explicit stop — exits on signal",
      "Position size: 70%",
    ],
    sharpe: 1.05,
    winRate: 47,
    bestYear: 52.3,
    worstYear: -22.0,
    prefillEntry: {
      name: "EMA Crossover",
      entryConditions: [{ id: "e1", indicator: "EMA", condition: "crosses above", targetPreset: null, targetNumber: 0, usePreset: false }],
      exitConditions:  [{ id: "x1", indicator: "EMA", condition: "crosses below", targetPreset: null, targetNumber: 0, usePreset: false }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: null,
      positionSizePercent: 70,
    },
  },
  {
    id: "bb-breakout",
    name: "Bollinger Breakout",
    category: "breakout",
    description:
      "Buys when price closes outside the upper Bollinger Band (2 std, 20-period SMA) indicating " +
      "a volatility expansion breakout. Exits when price re-enters the band. " +
      "High win-rate in trending phases; requires volume confirmation.",
    parameters: [
      "BB period: 20",
      "Standard deviations: 2",
      "Entry: price breaks above upper band",
      "Exit: price falls back inside band",
      "Stop-loss: 6% from entry",
      "Position size: 40%",
    ],
    sharpe: 0.94,
    winRate: 44,
    bestYear: 67.1,
    worstYear: -29.5,
    prefillEntry: {
      name: "Bollinger Breakout",
      entryConditions: [{ id: "e1", indicator: "BB", condition: "crosses above", targetPreset: null, targetNumber: 0, usePreset: false }],
      exitConditions:  [{ id: "x1", indicator: "BB", condition: "crosses below", targetPreset: null, targetNumber: 0, usePreset: false }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 6,
      positionSizePercent: 40,
    },
  },
  {
    id: "adx-trend-follow",
    name: "ADX Trend Follow",
    category: "trend",
    description:
      "Uses ADX(14) to confirm trend strength above 25 before entering. " +
      "+DI/-DI direction determines long vs flat. " +
      "Avoids choppy markets where other trend systems lose money.",
    parameters: [
      "ADX period: 14",
      "Trend strength threshold: ADX > 25",
      "Entry: ADX > 25 AND +DI > -DI",
      "Exit: ADX drops below 20 OR -DI crosses above +DI",
      "Stop-loss: 4%",
      "Position size: 55%",
    ],
    sharpe: 1.31,
    winRate: 54,
    bestYear: 38.8,
    worstYear: -11.6,
    prefillEntry: {
      name: "ADX Trend Follow",
      entryConditions: [{ id: "e1", indicator: "ADX", condition: "value >", targetPreset: "20", targetNumber: 25, usePreset: false }],
      exitConditions:  [{ id: "x1", indicator: "ADX", condition: "is below", targetPreset: "20", targetNumber: 20, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 4,
      positionSizePercent: 55,
    },
  },
  {
    id: "cci-reversal",
    name: "CCI Reversal",
    category: "mean-reversion",
    description:
      "Commodity Channel Index reversion: enter long when CCI(20) drops below -100 and reverses, " +
      "exit when CCI rises above +100. Captures oversold bounces across equities and commodities.",
    parameters: [
      "CCI period: 20",
      "Entry: CCI crosses above -100",
      "Exit: CCI crosses above +100",
      "Stop-loss: 6%",
      "Position size: 45%",
    ],
    sharpe: 1.22,
    winRate: 56,
    bestYear: 29.4,
    worstYear: -14.8,
    prefillEntry: {
      name: "CCI Reversal",
      entryConditions: [{ id: "e1", indicator: "CCI", condition: "crosses above", targetPreset: null, targetNumber: -100, usePreset: false }],
      exitConditions:  [{ id: "x1", indicator: "CCI", condition: "crosses above", targetPreset: "80", targetNumber: 100, usePreset: false }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 6,
      positionSizePercent: 45,
    },
  },
  {
    id: "orb",
    name: "Opening Range Breakout",
    category: "breakout",
    description:
      "Intraday strategy: defines the high/low of the first 30 minutes as the 'opening range'. " +
      "Goes long on a close above the range high, short on a break below range low. " +
      "Closes all positions at end of session to avoid overnight risk.",
    parameters: [
      "Opening range: first 30 minutes",
      "Timeframe: 5m or 15m bars",
      "Entry: price breaks and closes outside range",
      "Exit: end-of-day (15:50 ET) OR 1.5× ATR target",
      "Stop-loss: opposite side of range",
      "Position size: 30%",
    ],
    sharpe: 1.55,
    winRate: 52,
    bestYear: 44.2,
    worstYear: -9.8,
    prefillEntry: {
      name: "Opening Range Breakout",
      entryConditions: [{ id: "e1", indicator: "BB", condition: "crosses above", targetPreset: null, targetNumber: 0, usePreset: false }],
      exitConditions:  [{ id: "x1", indicator: "RSI", condition: "is above", targetPreset: "70", targetNumber: 70, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 3,
      positionSizePercent: 30,
    },
  },
  {
    id: "dual-momentum",
    name: "Dual Momentum",
    category: "momentum",
    description:
      "Gary Antonacci's Dual Momentum: applies absolute momentum (is the asset trending up?) " +
      "AND relative momentum (is it outperforming a benchmark?). " +
      "Monthly rebalancing between equities, international stocks, and bonds.",
    parameters: [
      "Lookback period: 12 months",
      "Absolute momentum: compare to T-bills return",
      "Relative momentum: rank assets by return",
      "Rebalance: monthly",
      "Allocation: 100% to top-ranked qualifying asset",
      "Max drawdown target: 15%",
    ],
    sharpe: 1.68,
    winRate: 63,
    bestYear: 28.9,
    worstYear: -8.2,
    prefillEntry: {
      name: "Dual Momentum",
      entryConditions: [
        { id: "e1", indicator: "MACD", condition: "is above", targetPreset: "0", targetNumber: 0, usePreset: true },
        { id: "e2", indicator: "EMA",  condition: "is above", targetPreset: null, targetNumber: 0, usePreset: false },
      ],
      exitConditions: [{ id: "x1", indicator: "MACD", condition: "is below", targetPreset: "0", targetNumber: 0, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: null,
      positionSizePercent: 100,
    },
  },
  {
    id: "carry-momentum",
    name: "Carry + Momentum Combo",
    category: "momentum",
    description:
      "Combines carry (positive MACD histogram — instrument earning positive roll) with " +
      "price momentum (OBV confirming institutional accumulation). " +
      "Exits when either signal turns negative.",
    parameters: [
      "Carry signal: MACD histogram > 0",
      "Momentum signal: OBV trending up (above 20-period mean)",
      "Entry: both signals positive",
      "Exit: either signal turns negative",
      "Stop-loss: 5%",
      "Position size: 50%",
    ],
    sharpe: 1.38,
    winRate: 57,
    bestYear: 35.6,
    worstYear: -13.2,
    prefillEntry: {
      name: "Carry + Momentum Combo",
      entryConditions: [
        { id: "e1", indicator: "MACD", condition: "is above", targetPreset: "0", targetNumber: 0, usePreset: true },
        { id: "e2", indicator: "OBV",  condition: "is above", targetPreset: "0", targetNumber: 0, usePreset: true },
      ],
      exitConditions: [{ id: "x1", indicator: "MACD", condition: "crosses below", targetPreset: "0", targetNumber: 0, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "OR",
      stopLossPercent: 5,
      positionSizePercent: 50,
    },
  },
  {
    id: "pairs-mean-rev",
    name: "Pairs Mean Reversion",
    category: "mean-reversion",
    description:
      "Statistical arbitrage between two correlated assets. " +
      "When the spread (z-score) exceeds 2 standard deviations, short the outperformer and long " +
      "the underperformer. Close when spread reverts below 0.5 std. " +
      "Classic long-short market-neutral approach.",
    parameters: [
      "Spread z-score entry: > 2.0 std",
      "Spread z-score exit: < 0.5 std",
      "Lookback for spread calc: 60 bars",
      "Max holding period: 20 bars",
      "Stop-loss: z-score > 3.5 std",
      "Equal dollar-weight both legs",
    ],
    sharpe: 1.81,
    winRate: 66,
    bestYear: 22.4,
    worstYear: -6.1,
    prefillEntry: {
      name: "Pairs Mean Reversion",
      entryConditions: [{ id: "e1", indicator: "RSI", condition: "is below", targetPreset: "30", targetNumber: 30, usePreset: true }],
      exitConditions:  [{ id: "x1", indicator: "RSI", condition: "is above", targetPreset: "70", targetNumber: 70, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 4,
      positionSizePercent: 50,
    },
  },
  {
    id: "triple-screen",
    name: "Triple Screen (Elder)",
    category: "trend",
    description:
      "Dr. Alexander Elder's three-screen method: Screen 1 — weekly MACD identifies trend direction; " +
      "Screen 2 — daily stochastic/RSI finds pullback entry in trend direction; " +
      "Screen 3 — intraday breakout trigger. Combines multiple timeframes for high-precision entries.",
    parameters: [
      "Screen 1: Weekly MACD — defines primary trend",
      "Screen 2: Daily RSI(14) < 40 for long setup in uptrend",
      "Screen 3: Enter on intraday breakout above prior bar high",
      "Stop-loss: below Screen 2 low",
      "Target: 2× risk (R:R = 1:2)",
      "Position size: 40% per trade",
    ],
    sharpe: 1.47,
    winRate: 60,
    bestYear: 31.8,
    worstYear: -10.4,
    prefillEntry: {
      name: "Triple Screen (Elder)",
      entryConditions: [
        { id: "e1", indicator: "MACD", condition: "is above", targetPreset: "0", targetNumber: 0, usePreset: true },
        { id: "e2", indicator: "RSI",  condition: "is below", targetPreset: "30", targetNumber: 40, usePreset: false },
      ],
      exitConditions: [{ id: "x1", indicator: "RSI", condition: "crosses above", targetPreset: "70", targetNumber: 70, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 5,
      positionSizePercent: 40,
    },
  },
  {
    id: "turtle-trading",
    name: "Turtle Trading System",
    category: "breakout",
    description:
      "Based on the famous Richard Dennis/William Eckhardt turtle experiment. " +
      "System 1: enter on 20-day high breakout, exit on 10-day low. " +
      "System 2: enter on 55-day high, exit on 20-day low. " +
      "Uses ATR-based position sizing with pyramid adds on successful trades.",
    parameters: [
      "System 1 entry: 20-day channel breakout",
      "System 1 exit: 10-day channel low",
      "System 2 entry: 55-day channel breakout",
      "System 2 exit: 20-day channel low",
      "Unit size: 1% account risk per ATR unit",
      "Maximum 4 pyramid units per market",
    ],
    sharpe: 0.88,
    winRate: 38,
    bestYear: 78.4,
    worstYear: -31.2,
    prefillEntry: {
      name: "Turtle Trading System",
      entryConditions: [{ id: "e1", indicator: "ADX", condition: "value >", targetPreset: "20", targetNumber: 25, usePreset: false }],
      exitConditions:  [{ id: "x1", indicator: "ADX", condition: "is below", targetPreset: "20", targetNumber: 20, usePreset: true }],
      entryLogic: "AND",
      exitLogic: "AND",
      stopLossPercent: 7,
      positionSizePercent: 25,
    },
  },
];

// ── Tiny seeded PRNG for deterministic "backtest progress" ─────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Strategy Card ──────────────────────────────────────────────────────────────

function StrategyCard({
  strategy,
  onClone,
}: {
  strategy: PrebuiltStrategy;
  onClone: (s: PrebuiltStrategy) => void;
}) {
  const [backtestState, setBacktestState] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [resultSharpe, setResultSharpe] = useState<number | null>(null);

  const meta = CATEGORY_META[strategy.category];

  const handleQuickBacktest = () => {
    if (backtestState !== "idle") return;
    setBacktestState("running");
    setProgress(0);

    const rand = seededRand(strategy.id.charCodeAt(0) * 1337 + Date.now());
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(rand() * 15 + 5);
        if (next >= 100) {
          clearInterval(interval);
          setBacktestState("done");
          // Slightly vary the sharpe
          setResultSharpe(+(strategy.sharpe + (rand() - 0.5) * 0.3).toFixed(2));
          return 100;
        }
        return next;
      });
    }, 120);
  };

  const sharpeColor =
    (resultSharpe ?? strategy.sharpe) >= 1.5
      ? "text-emerald-400"
      : (resultSharpe ?? strategy.sharpe) >= 1.0
      ? "text-primary"
      : "text-amber-400";

  return (
    <div className="flex flex-col rounded-md border border-border/50 bg-foreground/[0.025] p-4 gap-3 hover:border-border transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground truncate">{strategy.name}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs text-muted-foreground font-medium ${meta.bg} ${meta.color}`}>
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{strategy.description}</p>

      {/* Parameters */}
      <ul className="space-y-0.5">
        {strategy.parameters.map((p, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
            {p}
          </li>
        ))}
      </ul>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 rounded-lg border border-border/50 bg-black/20 px-3 py-2">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] text-muted-foreground">Sharpe</span>
          <span className={`text-xs text-muted-foreground font-bold tabular-nums ${sharpeColor}`}>
            {resultSharpe ?? strategy.sharpe}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] text-muted-foreground">Win%</span>
          <span className="text-xs font-bold tabular-nums text-muted-foreground">{strategy.winRate}%</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] text-muted-foreground">Best Yr</span>
          <span className="text-xs font-medium tabular-nums text-emerald-400">+{strategy.bestYear}%</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] text-muted-foreground">Worst Yr</span>
          <span className="text-xs font-medium tabular-nums text-rose-400">{strategy.worstYear}%</span>
        </div>
      </div>

      {/* Quick Backtest progress */}
      {backtestState === "running" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-muted-foreground">Running backtest...</span>
            <span className="text-muted-foreground tabular-nums">{progress}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-foreground/5 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {backtestState === "done" && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          Backtest complete — Sharpe {resultSharpe}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleQuickBacktest}
          disabled={backtestState === "running"}
          className={`flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground font-medium transition-colors ${
            backtestState === "running"
              ? "cursor-not-allowed bg-foreground/5 text-muted-foreground"
              : "bg-foreground/5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Play className="h-3 w-3" />
          {backtestState === "running" ? "Running..." : backtestState === "done" ? "Re-run" : "Quick Backtest"}
        </button>
        <button
          onClick={() => onClone(strategy)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary"
        >
          <Copy className="h-3 w-3" />
          Clone &amp; Customize
        </button>
      </div>
    </div>
  );
}

// ── My Strategies Tab ──────────────────────────────────────────────────────────

interface SavedStrategyRowProps {
  strategy: VisualStrategy & { lastBacktestSharpe?: number; lastBacktestReturn?: number; savedAt: number };
  onEdit: () => void;
  onBacktest: () => void;
  onDelete: () => void;
  onExport: () => void;
  selected: boolean;
  onSelect: () => void;
}

function SavedStrategyRow({ strategy, onEdit, onBacktest, onDelete, onExport, selected, onSelect }: SavedStrategyRowProps) {
  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return "just now";
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
        selected ? "border-primary/40 bg-primary/5" : "border-border/50 bg-foreground/[0.02] hover:border-border"
      }`}
    >
      {/* Select checkbox for compare */}
      <button
        onClick={onSelect}
        className={`h-4 w-4 shrink-0 rounded border transition-colors ${
          selected ? "border-primary bg-primary" : "border-border bg-transparent"
        }`}
        aria-label="Select for comparison"
      >
        {selected && <span className="flex h-full w-full items-center justify-center text-[11px] text-foreground font-medium">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{strategy.name}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>Modified {timeAgo(strategy.savedAt)}</span>
          <span>{strategy.entryConditions.length} entry / {strategy.exitConditions.length} exit rules</span>
          {strategy.stopLossPercent !== null && <span>SL {strategy.stopLossPercent}%</span>}
        </div>
      </div>

      {/* Last backtest stats */}
      <div className="flex items-center gap-4 shrink-0">
        {strategy.lastBacktestSharpe != null && (
          <div className="text-center">
            <div className="text-[11px] text-muted-foreground">Sharpe</div>
            <div className={`text-xs font-medium tabular-nums ${strategy.lastBacktestSharpe >= 1 ? "text-primary" : "text-amber-400"}`}>
              {strategy.lastBacktestSharpe.toFixed(2)}
            </div>
          </div>
        )}
        {strategy.lastBacktestReturn != null && (
          <div className="text-center">
            <div className="text-[11px] text-muted-foreground">Return</div>
            <div className={`text-xs font-medium tabular-nums ${strategy.lastBacktestReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {strategy.lastBacktestReturn >= 0 ? "+" : ""}{strategy.lastBacktestReturn.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="rounded p-1.5 text-muted-foreground hover:bg-muted/30 hover:text-muted-foreground transition-colors" title="Edit">
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={onBacktest} className="rounded p-1.5 text-muted-foreground hover:bg-muted/30 hover:text-primary transition-colors" title="Backtest">
          <Play className="h-3.5 w-3.5" />
        </button>
        <button onClick={onExport} className="rounded p-1.5 text-muted-foreground hover:bg-muted/30 hover:text-muted-foreground transition-colors" title="Export JSON">
          <Download className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="rounded p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors" title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Comparison Panel ───────────────────────────────────────────────────────────

type StoredStrategy = VisualStrategy & { lastBacktestSharpe?: number; lastBacktestReturn?: number; savedAt: number };

function ComparePanel({ a, b, onClose }: { a: StoredStrategy; b: StoredStrategy; onClose: () => void }) {
  const rand = seededRand(a.id.charCodeAt(0) + b.id.charCodeAt(0));

  const aStats = {
    sharpe: a.lastBacktestSharpe ?? +(rand() * 1.5 + 0.5).toFixed(2),
    ret: a.lastBacktestReturn ?? +(rand() * 40 - 10).toFixed(1),
    winRate: Math.floor(rand() * 25 + 40),
    maxDD: +(rand() * 20 + 5).toFixed(1),
  };
  const bStats = {
    sharpe: b.lastBacktestSharpe ?? +(rand() * 1.5 + 0.5).toFixed(2),
    ret: b.lastBacktestReturn ?? +(rand() * 40 - 10).toFixed(1),
    winRate: Math.floor(rand() * 25 + 40),
    maxDD: +(rand() * 20 + 5).toFixed(1),
  };

  const rows: { label: string; aVal: string; bVal: string; higherBetter: boolean }[] = [
    { label: "Sharpe Ratio",    aVal: aStats.sharpe.toFixed(2), bVal: bStats.sharpe.toFixed(2), higherBetter: true },
    { label: "Total Return",    aVal: `${aStats.ret >= 0 ? "+" : ""}${aStats.ret}%`, bVal: `${bStats.ret >= 0 ? "+" : ""}${bStats.ret}%`, higherBetter: true },
    { label: "Win Rate",        aVal: `${aStats.winRate}%`, bVal: `${bStats.winRate}%`, higherBetter: true },
    { label: "Max Drawdown",    aVal: `-${aStats.maxDD}%`, bVal: `-${bStats.maxDD}%`, higherBetter: false },
    { label: "Entry Rules",     aVal: String(a.entryConditions.length), bVal: String(b.entryConditions.length), higherBetter: false },
    { label: "Stop Loss",       aVal: a.stopLossPercent != null ? `${a.stopLossPercent}%` : "None", bVal: b.stopLossPercent != null ? `${b.stopLossPercent}%` : "None", higherBetter: false },
    { label: "Position Size",   aVal: `${a.positionSizePercent}%`, bVal: `${b.positionSizePercent}%`, higherBetter: false },
  ];

  const numericA = (s: string) => parseFloat(s.replace(/[^0-9.-]/g, ""));
  const numericB = (s: string) => parseFloat(s.replace(/[^0-9.-]/g, ""));

  return (
    <div className="rounded-md border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Strategy Comparison</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 text-center">
        <div className="rounded-lg border border-border/50 bg-foreground/[0.02] px-3 py-2">
          <span className="text-xs font-medium text-primary">{a.name}</span>
        </div>
        <span className="flex items-center text-xs text-muted-foreground">vs</span>
        <div className="rounded-lg border border-border/50 bg-foreground/[0.02] px-3 py-2">
          <span className="text-xs font-medium text-primary">{b.name}</span>
        </div>
      </div>

      <div className="space-y-1">
        {rows.map((row) => {
          const nA = numericA(row.aVal);
          const nB = numericB(row.bVal);
          const aWins = row.higherBetter ? nA > nB : nA < nB;
          const bWins = row.higherBetter ? nB > nA : nB < nA;
          return (
            <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-1 border-b border-border/50 last:border-0">
              <div className={`text-right text-xs tabular-nums font-medium ${aWins ? "text-emerald-400" : "text-muted-foreground"}`}>{row.aVal}</div>
              <div className="text-center text-xs text-muted-foreground w-24">{row.label}</div>
              <div className={`text-left text-xs tabular-nums font-medium ${bWins ? "text-emerald-400" : "text-muted-foreground"}`}>{row.bVal}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Local storage key ─────────────────────────────────────────────────────────

const LS_KEY = "finsim_strategy_library";

function loadStrategies(): StoredStrategy[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStrategies(strategies: StoredStrategy[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(strategies));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StrategiesPage() {
  const [activeTab, setActiveTab] = useState<PageTab>("library");
  const [savedStrategies, setSavedStrategies] = useState<StoredStrategy[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cloneTemplate, setCloneTemplate] = useState<Partial<VisualStrategy> | null>(null);
  const [editStrategy, setEditStrategy] = useState<VisualStrategy | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setSavedStrategies(loadStrategies());
  }, []);

  // Category filter for library
  const [categoryFilter, setCategoryFilter] = useState<StrategyCategory | "all">("all");

  const filteredStrategies =
    categoryFilter === "all"
      ? PREBUILT_STRATEGIES
      : PREBUILT_STRATEGIES.filter((s) => s.category === categoryFilter);

  const handleClone = useCallback((strategy: PrebuiltStrategy) => {
    setCloneTemplate(strategy.prefillEntry);
    setActiveTab("builder");
  }, []);

  const handleSaveStrategy = useCallback((strategy: VisualStrategy) => {
    setSavedStrategies((prev) => {
      const existing = prev.findIndex((s) => s.id === strategy.id);
      const entry: StoredStrategy = { ...strategy, savedAt: Date.now() };
      let next: StoredStrategy[];
      if (existing >= 0) {
        next = prev.map((s, i) => (i === existing ? entry : s));
      } else {
        next = [...prev, { ...entry, id: `vstrat-${Date.now()}` }];
      }
      saveStrategies(next);
      return next;
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSavedStrategies((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveStrategies(next);
      return next;
    });
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const handleExport = useCallback((strategy: StoredStrategy) => {
    const json = JSON.stringify(strategy, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${strategy.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2
        ? [...prev, id]
        : [prev[1], id],
    );
  }, []);

  const comparePair =
    selectedIds.length === 2
      ? ([savedStrategies.find((s) => s.id === selectedIds[0])!, savedStrategies.find((s) => s.id === selectedIds[1])!] as [StoredStrategy, StoredStrategy])
      : null;

  const TABS: { id: PageTab; label: string; icon: React.ElementType }[] = [
    { id: "library",       label: "Strategy Library", icon: BookMarked },
    { id: "my-strategies", label: "My Strategies",    icon: Layers },
    { id: "builder",       label: "Strategy Builder", icon: TrendingUp },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-black/30 px-6 py-6 border-l-4 border-l-primary">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <BookMarked className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-medium text-foreground">Strategy Library</h1>
          <p className="text-xs text-muted-foreground">Browse, customize, and build trading strategies</p>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{PREBUILT_STRATEGIES.length} pre-built strategies</span>
          <span>{savedStrategies.length} saved</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border/50 bg-black/20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs text-muted-foreground font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.id === "my-strategies" && savedStrategies.length > 0 && (
              <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {savedStrategies.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Save toast */}
      {saveToast && (
        <div className="absolute top-16 right-6 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300">
          <Save className="h-3.5 w-3.5" />
          Strategy saved to library
        </div>
      )}

      {/* ── Tab Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {/* Tab 1: Strategy Library */}
        {activeTab === "library" && (
          <div className="flex h-full flex-col overflow-hidden">
            {/* Category filter bar */}
            <div className="flex items-center gap-2 border-b border-border/50 bg-black/10 px-6 py-2.5">
              <span className="text-xs text-muted-foreground mr-1">Filter:</span>
              {(["all", "trend", "mean-reversion", "momentum", "breakout"] as const).map((cat) => {
                const meta = cat === "all" ? null : CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1 text-xs text-muted-foreground font-medium transition-colors ${
                      categoryFilter === cat
                        ? cat === "all"
                          ? "bg-muted text-foreground"
                          : `${meta!.bg} ${meta!.color} ring-1 ring-foreground/10`
                        : "bg-foreground/5 text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground"
                    }`}
                  >
                    {cat === "all" ? "All" : CATEGORY_META[cat].label}
                  </button>
                );
              })}
              <span className="ml-auto text-xs text-muted-foreground">{filteredStrategies.length} strategies</span>
            </div>

            {/* Cards grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                {filteredStrategies.map((strategy) => (
                  <StrategyCard key={strategy.id} strategy={strategy} onClone={handleClone} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Strategies */}
        {activeTab === "my-strategies" && (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-4xl space-y-4">
                {/* Compare header */}
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-primary/5 px-4 py-2.5">
                    <GitCompare className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs text-primary flex-1">
                      {selectedIds.length === 1
                        ? "Select one more strategy to compare side-by-side"
                        : "2 strategies selected for comparison"}
                    </span>
                    {selectedIds.length === 2 && (
                      <button
                        onClick={() => setShowCompare(true)}
                        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-foreground hover:bg-primary transition-colors"
                      >
                        <GitCompare className="h-3 w-3" />
                        Compare
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-muted-foreground hover:text-muted-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Comparison panel */}
                {showCompare && comparePair && (
                  <ComparePanel
                    a={comparePair[0]}
                    b={comparePair[1]}
                    onClose={() => setShowCompare(false)}
                  />
                )}

                {/* Strategy list */}
                {savedStrategies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-20 text-center">
                    <Layers className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No strategies saved yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Clone a pre-built strategy from the Library or build your own in the Builder tab
                    </p>
                    <button
                      onClick={() => setActiveTab("library")}
                      className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-foreground hover:bg-primary transition-colors"
                    >
                      Browse Library
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedStrategies.map((strategy) => (
                      <SavedStrategyRow
                        key={strategy.id}
                        strategy={strategy}
                        onEdit={() => {
                          setEditStrategy(strategy);
                          setActiveTab("builder");
                        }}
                        onBacktest={() => {
                          // Simulate quick backtest stamp
                          const r = seededRand(strategy.id.charCodeAt(0) * 31);
                          const sharpe = +(r() * 1.5 + 0.3).toFixed(2);
                          const ret = +(r() * 50 - 10).toFixed(1);
                          setSavedStrategies((prev) => {
                            const next = prev.map((s) =>
                              s.id === strategy.id
                                ? { ...s, lastBacktestSharpe: sharpe, lastBacktestReturn: ret }
                                : s,
                            );
                            saveStrategies(next);
                            return next;
                          });
                        }}
                        onDelete={() => handleDelete(strategy.id)}
                        onExport={() => handleExport(strategy)}
                        selected={selectedIds.includes(strategy.id)}
                        onSelect={() => handleToggleSelect(strategy.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Strategy Builder */}
        {activeTab === "builder" && (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-2xl space-y-4">
                {/* Save to Library button row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium text-foreground">Visual Strategy Builder</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define entry/exit conditions, then save to your library
                    </p>
                  </div>
                </div>

                {/* Inject a wrapper around VisualStrategyBuilder that surfaces Save to Library */}
                <StrategyBuilderWrapper
                  cloneTemplate={cloneTemplate}
                  editStrategy={editStrategy}
                  onSave={handleSaveStrategy}
                  onClearClone={() => {
                    setCloneTemplate(null);
                    setEditStrategy(null);
                  }}
                  savedStrategies={savedStrategies}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Strategy Builder Wrapper ───────────────────────────────────────────────────
// Wraps VisualStrategyBuilder and adds a "Save to Library" button

function StrategyBuilderWrapper({
  cloneTemplate,
  editStrategy,
  onSave,
  onClearClone,
  savedStrategies,
}: {
  cloneTemplate: Partial<VisualStrategy> | null;
  editStrategy: VisualStrategy | null;
  onSave: (s: VisualStrategy) => void;
  onClearClone: () => void;
  savedStrategies: StoredStrategy[];
}) {
  const [pendingStrategy, setPendingStrategy] = useState<VisualStrategy | null>(null);

  const handleSave = (s: VisualStrategy) => {
    setPendingStrategy(s);
  };

  const handleCommitSave = () => {
    if (pendingStrategy) {
      onSave(pendingStrategy);
    }
  };

  // Build pre-filled savedStrategies for the builder (include template + edit)
  const builderSaved: VisualStrategy[] = [
    ...(cloneTemplate
      ? [
          {
            id: "cloned-template",
            name: (cloneTemplate.name as string) ?? "Cloned Strategy",
            entryConditions: cloneTemplate.entryConditions ?? [],
            entryLogic: cloneTemplate.entryLogic ?? "AND",
            exitConditions: cloneTemplate.exitConditions ?? [],
            exitLogic: cloneTemplate.exitLogic ?? "AND",
            stopLossPercent: cloneTemplate.stopLossPercent ?? null,
            positionSizePercent: cloneTemplate.positionSizePercent ?? 50,
          },
        ]
      : []),
    ...(editStrategy ? [editStrategy] : []),
    ...savedStrategies,
  ];

  return (
    <div className="space-y-3">
      {/* Template notice */}
      {(cloneTemplate || editStrategy) && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-primary/5 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs text-primary">
              {editStrategy ? `Editing: ${editStrategy.name}` : `Cloned from: ${cloneTemplate?.name}`}
              {" — load it from the dropdown below"}
            </span>
          </div>
          <button onClick={onClearClone} className="text-muted-foreground hover:text-muted-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <VisualStrategyBuilder
        savedStrategies={builderSaved}
        onSaveStrategy={handleSave}
        onRunCustomBacktest={() => {}}
      />

      {/* Save to Library CTA */}
      {pendingStrategy && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="flex-1 text-xs text-emerald-300">
            <strong>{pendingStrategy.name}</strong> is ready to save to your library
          </span>
          <button
            onClick={handleCommitSave}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-emerald-500 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            Save to Library
          </button>
          <button
            onClick={() => setPendingStrategy(null)}
            className="text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
