"use client";

import { useState, useMemo, useCallback } from "react";
import { Bot, Plus, X, Play, ChevronRight, AlertTriangle, Info, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StrategyLab from "@/components/backtest/StrategyLab";

// ── Types ──────────────────────────────────────────────────────────────────────

type ConditionType =
  | "rsi_lt"
  | "ma_cross_above"
  | "volume_breakout"
  | "macd_cross"
  | "bb_lower"
  | "profit_target"
  | "stop_loss"
  | "max_bars";

type Logic = "AND" | "OR";
type SizingType = "fixed_shares" | "fixed_dollar" | "pct_portfolio" | "kelly";

interface Condition {
  id: string;
  type: ConditionType;
  param: number;
}

interface Strategy {
  name: string;
  entryConditions: Condition[];
  entryLogic: Logic;
  exitConditions: Condition[];
  exitLogic: Logic;
  sizing: SizingType;
  sizingValue: number;
}

interface TradeRecord {
  entryBar: number;
  exitBar: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
  exitReason: string;
}

interface BacktestResult {
  equity: number[];
  trades: TradeRecord[];
  totalReturn: number;
  numTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  sharpe: number;
  profitFactor: number;
  buyAndHold: number;
}

// ── Mulberry32 PRNG ────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

// ── Price data generation (252 bars ~ 1 year) ─────────────────────────────────

interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
}

function generateBars(seed: number, startPrice = 150): Bar[] {
  const rand = mulberry32(seed);
  const bars: Bar[] = [];
  let price = startPrice;
  const baseDate = new Date("2025-01-02");

  for (let i = 0; i < 252; i++) {
    const d = new Date(baseDate);
    // skip weekends
    let dayOffset = i;
    let addedDays = 0;
    let calDay = 0;
    while (addedDays < dayOffset + 1) {
      calDay++;
      const wd = (baseDate.getDay() + calDay - 1) % 7;
      if (wd !== 0 && wd !== 6) addedDays++;
    }
    d.setDate(baseDate.getDate() + calDay - 1);
    const dateStr = d.toISOString().slice(0, 10);

    const drift = (rand() - 0.48) * 0.022;
    const vol = 0.015 + rand() * 0.02;
    const open = price;
    price = Math.max(5, price * (1 + drift + (rand() - 0.5) * vol));
    const high = Math.max(open, price) * (1 + rand() * 0.008);
    const low = Math.min(open, price) * (1 - rand() * 0.008);
    const volume = 1_000_000 + rand() * 9_000_000;
    bars.push({ open, high, low, close: price, volume, date: dateStr });
  }
  return bars;
}

// ── Indicator helpers ──────────────────────────────────────────────────────────

function calcRSI(closes: number[], period = 14): number[] {
  const result: number[] = new Array(closes.length).fill(50);
  if (closes.length < period + 1) return result;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) avgGain += d; else avgLoss -= d;
  }
  avgGain /= period; avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(0, d)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(0, -d)) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return result;
}

function calcEMA(closes: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = new Array(closes.length).fill(0);
  result[0] = closes[0];
  for (let i = 1; i < closes.length; i++) {
    result[i] = closes[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

function calcSMA(closes: number[], period: number): number[] {
  const result: number[] = new Array(closes.length).fill(0);
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { result[i] = closes[i]; continue; }
    let s = 0;
    for (let j = 0; j < period; j++) s += closes[i - j];
    result[i] = s / period;
  }
  return result;
}

function calcMACD(closes: number[]): { macd: number[]; signal: number[] } {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macd = closes.map((_, i) => ema12[i] - ema26[i]);
  const signal = calcEMA(macd, 9);
  return { macd, signal };
}

function calcBB(closes: number[], period = 20, mult = 2): { upper: number[]; lower: number[]; mid: number[] } {
  const mid = calcSMA(closes, period);
  const upper: number[] = [], lower: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = closes.slice(start, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length);
    upper.push(mid[i] + mult * std);
    lower.push(mid[i] - mult * std);
  }
  return { upper, lower, mid };
}

function calcAvgVolume(volumes: number[], period = 20): number[] {
  return volumes.map((_, i) => {
    const start = Math.max(0, i - period + 1);
    const slice = volumes.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// ── Backtester ─────────────────────────────────────────────────────────────────

function runBacktest(strategy: Strategy, bars: Bar[]): BacktestResult {
  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume);
  const rsi = calcRSI(closes);
  const { macd, signal: macdSig } = calcMACD(closes);
  const bb = calcBB(closes);
  const avgVol = calcAvgVolume(volumes);

  const maPeriods = strategy.entryConditions
    .filter((c) => c.type === "ma_cross_above")
    .map((c) => c.param);
  const exitMaPeriods = strategy.exitConditions
    .filter((c) => c.type === "ma_cross_above")
    .map((c) => c.param);
  const allMaPeriods = [...new Set([...maPeriods, ...exitMaPeriods])];
  const mas: Record<number, number[]> = {};
  for (const p of allMaPeriods) mas[p] = calcSMA(closes, p);

  const STARTING_CAPITAL = 10000;
  let capital = STARTING_CAPITAL;
  let shares = 0;
  let entryPrice = 0;
  let entryBar = 0;
  const equity: number[] = [];
  const trades: TradeRecord[] = [];

  function evalCondition(c: Condition, i: number): boolean {
    const prev = i > 0 ? i - 1 : 0;
    switch (c.type) {
      case "rsi_lt": return rsi[i] < c.param;
      case "ma_cross_above": {
        const ma = mas[c.param] ?? [];
        return closes[prev] < (ma[prev] ?? 0) && closes[i] >= (ma[i] ?? 0);
      }
      case "volume_breakout": return volumes[i] > avgVol[i] * c.param;
      case "macd_cross": return macd[prev] < macdSig[prev] && macd[i] >= macdSig[i];
      case "bb_lower": {
        const range = bb.upper[i] - bb.lower[i];
        const pctB = range > 0 ? (closes[i] - bb.lower[i]) / range : 0.5;
        return pctB < 0.05;
      }
      default: return false;
    }
  }

  function evalExitCondition(c: Condition, i: number, curEntry: number): boolean {
    const pnlPct = (closes[i] - curEntry) / curEntry;
    const barsHeld = i - entryBar;
    switch (c.type) {
      case "profit_target": return pnlPct >= c.param / 100;
      case "stop_loss": return pnlPct <= -c.param / 100;
      case "max_bars": return barsHeld >= c.param;
      default: return evalCondition(c, i);
    }
  }

  function checkLogic(conditions: Condition[], logic: Logic, i: number, isExit: boolean, curEntry = 0): boolean {
    if (conditions.length === 0) return false;
    if (logic === "AND") return conditions.every((c) => isExit ? evalExitCondition(c, i, curEntry) : evalCondition(c, i));
    return conditions.some((c) => isExit ? evalExitCondition(c, i, curEntry) : evalCondition(c, i));
  }

  for (let i = 1; i < bars.length; i++) {
    const price = closes[i];

    if (shares > 0) {
      // Check exit
      const shouldExit = checkLogic(strategy.exitConditions, strategy.exitLogic, i, true, entryPrice);
      if (shouldExit || i === bars.length - 1) {
        const pnl = (price - entryPrice) * shares;
        const pnlPct = (price - entryPrice) / entryPrice;
        capital += shares * price;
        const exitReason = i === bars.length - 1 ? "End of period" :
          strategy.exitConditions.find((c) => evalExitCondition(c, i, entryPrice))?.type
            .replace("profit_target", "Profit target")
            .replace("stop_loss", "Stop loss")
            .replace("max_bars", "Max bars") ?? "Exit signal";
        trades.push({ entryBar, exitBar: i, entryPrice, exitPrice: price, pnl, pnlPct, exitReason });
        shares = 0;
      }
    } else {
      // Check entry
      const shouldEnter = checkLogic(strategy.entryConditions, strategy.entryLogic, i, false);
      if (shouldEnter && capital > price) {
        let numShares: number;
        switch (strategy.sizing) {
          case "fixed_shares": numShares = Math.min(strategy.sizingValue, Math.floor(capital / price)); break;
          case "fixed_dollar": numShares = Math.floor(Math.min(strategy.sizingValue, capital) / price); break;
          case "pct_portfolio": numShares = Math.floor((capital * strategy.sizingValue / 100) / price); break;
          case "kelly": numShares = Math.floor((capital * 0.25) / price); break;
          default: numShares = Math.floor(capital * 0.5 / price);
        }
        if (numShares > 0) {
          shares = numShares;
          capital -= shares * price;
          entryPrice = price;
          entryBar = i;
        }
      }
    }

    equity.push(capital + shares * price);
  }

  // Metrics
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const totalReturn = (equity[equity.length - 1] ?? STARTING_CAPITAL) / STARTING_CAPITAL - 1;
  const winRate = trades.length ? wins.length / trades.length : 0;
  const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnlPct, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((a, t) => a + t.pnlPct, 0) / losses.length : 0;

  let peak = STARTING_CAPITAL;
  let maxDrawdown = 0;
  for (const e of equity) {
    if (e > peak) peak = e;
    const dd = (peak - e) / peak;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const returns = equity.map((e, i) => i === 0 ? 0 : (e - equity[i - 1]) / equity[i - 1]);
  const meanR = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdR = Math.sqrt(returns.reduce((a, b) => a + (b - meanR) ** 2, 0) / returns.length);
  const sharpe = stdR > 0 ? (meanR / stdR) * Math.sqrt(252) : 0;

  const grossWin = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0;
  const buyAndHold = closes[closes.length - 1] / closes[0] - 1;

  return {
    equity,
    trades,
    totalReturn,
    numTrades: trades.length,
    winRate,
    avgWin,
    avgLoss,
    maxDrawdown,
    sharpe,
    profitFactor,
    buyAndHold,
  };
}

// ── Condition type metadata ────────────────────────────────────────────────────

const ENTRY_CONDITION_TYPES: { type: ConditionType; label: string; defaultParam: number; unit: string }[] = [
  { type: "rsi_lt", label: "RSI < X (oversold)", defaultParam: 30, unit: "" },
  { type: "ma_cross_above", label: "Price crosses above MA(X)", defaultParam: 50, unit: "period" },
  { type: "volume_breakout", label: "Volume > X× average", defaultParam: 2, unit: "×" },
  { type: "macd_cross", label: "MACD crosses above signal", defaultParam: 0, unit: "" },
  { type: "bb_lower", label: "Bollinger %B < 0.05 (lower band)", defaultParam: 0, unit: "" },
];

const EXIT_CONDITION_TYPES: { type: ConditionType; label: string; defaultParam: number; unit: string }[] = [
  ...ENTRY_CONDITION_TYPES,
  { type: "profit_target", label: "X% profit target", defaultParam: 5, unit: "%" },
  { type: "stop_loss", label: "Y% stop loss", defaultParam: 3, unit: "%" },
  { type: "max_bars", label: "Z bars maximum hold", defaultParam: 20, unit: "bars" },
];

function conditionLabel(c: Condition): string {
  switch (c.type) {
    case "rsi_lt": return `RSI < ${c.param}`;
    case "ma_cross_above": return `Price crosses MA(${c.param})`;
    case "volume_breakout": return `Volume > ${c.param}× avg`;
    case "macd_cross": return "MACD crosses signal";
    case "bb_lower": return "BB %B < 0.05";
    case "profit_target": return `${c.param}% profit target`;
    case "stop_loss": return `${c.param}% stop loss`;
    case "max_bars": return `${c.param} bars max`;
    default: return c.type;
  }
}

// ── Strategy Library data ─────────────────────────────────────────────────────

interface LibraryStrategy {
  id: string;
  name: string;
  description: string;
  avgReturn: number;
  winRate: number;
  condition: string;
  strategy: Strategy;
}

const LIBRARY_STRATEGIES: LibraryStrategy[] = [
  {
    id: "golden_cross",
    name: "Golden Cross",
    description: "Buy when 50-day MA crosses above 200-day MA. Classic long-term trend following signal.",
    avgReturn: 18.4,
    winRate: 0.62,
    condition: "Trending bull markets",
    strategy: {
      name: "Golden Cross",
      entryConditions: [{ id: "e1", type: "ma_cross_above", param: 50 }],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "profit_target", param: 15 }, { id: "x2", type: "stop_loss", param: 8 }],
      exitLogic: "OR",
      sizing: "pct_portfolio",
      sizingValue: 80,
    },
  },
  {
    id: "rsi_mean",
    name: "RSI Mean Reversion",
    description: "Buy oversold dips (RSI < 30), sell when overbought (RSI > 70). Counter-trend strategy.",
    avgReturn: 14.2,
    winRate: 0.58,
    condition: "Range-bound markets",
    strategy: {
      name: "RSI Mean Reversion",
      entryConditions: [{ id: "e1", type: "rsi_lt", param: 30 }],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "profit_target", param: 8 }, { id: "x2", type: "stop_loss", param: 5 }],
      exitLogic: "OR",
      sizing: "pct_portfolio",
      sizingValue: 50,
    },
  },
  {
    id: "bb_squeeze",
    name: "Bollinger Band Squeeze",
    description: "Enter when price touches lower band in a tight squeeze, ride the expansion breakout.",
    avgReturn: 22.7,
    winRate: 0.54,
    condition: "Low-volatility consolidation",
    strategy: {
      name: "BB Squeeze",
      entryConditions: [{ id: "e1", type: "bb_lower", param: 0 }],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "profit_target", param: 10 }, { id: "x2", type: "stop_loss", param: 4 }],
      exitLogic: "OR",
      sizing: "fixed_dollar",
      sizingValue: 5000,
    },
  },
  {
    id: "macd_momentum",
    name: "MACD Momentum",
    description: "MACD line crosses above signal line with volume confirmation. Trend initiation play.",
    avgReturn: 16.8,
    winRate: 0.56,
    condition: "Trending markets",
    strategy: {
      name: "MACD Momentum",
      entryConditions: [
        { id: "e1", type: "macd_cross", param: 0 },
        { id: "e2", type: "volume_breakout", param: 1.5 },
      ],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "profit_target", param: 12 }, { id: "x2", type: "stop_loss", param: 6 }],
      exitLogic: "OR",
      sizing: "pct_portfolio",
      sizingValue: 60,
    },
  },
  {
    id: "breakout",
    name: "52-Week High Breakout",
    description: "Buy when price breaks to new highs on strong volume. Momentum continuation.",
    avgReturn: 24.1,
    winRate: 0.51,
    condition: "Bull market momentum",
    strategy: {
      name: "52W Breakout",
      entryConditions: [{ id: "e1", type: "volume_breakout", param: 2.5 }, { id: "e2", type: "ma_cross_above", param: 20 }],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "max_bars", param: 30 }, { id: "x2", type: "stop_loss", param: 7 }],
      exitLogic: "OR",
      sizing: "pct_portfolio",
      sizingValue: 70,
    },
  },
  {
    id: "opening_range",
    name: "Opening Range Breakout",
    description: "Trade the breakout of the first 30-minute range. Intraday momentum capture.",
    avgReturn: 11.3,
    winRate: 0.52,
    condition: "High-volatility open days",
    strategy: {
      name: "Opening Range Breakout",
      entryConditions: [{ id: "e1", type: "volume_breakout", param: 2 }],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "max_bars", param: 5 }, { id: "x2", type: "profit_target", param: 3 }, { id: "x3", type: "stop_loss", param: 2 }],
      exitLogic: "OR",
      sizing: "fixed_dollar",
      sizingValue: 2000,
    },
  },
  {
    id: "trend_follow",
    name: "Trend Following",
    description: "ADX-style: enter when EMA(20) > EMA(50) with strong momentum. Ride the trend.",
    avgReturn: 19.6,
    winRate: 0.60,
    condition: "Strong directional markets",
    strategy: {
      name: "Trend Following",
      entryConditions: [{ id: "e1", type: "ma_cross_above", param: 20 }, { id: "e2", type: "macd_cross", param: 0 }],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "stop_loss", param: 5 }, { id: "x2", type: "max_bars", param: 40 }],
      exitLogic: "OR",
      sizing: "pct_portfolio",
      sizingValue: 65,
    },
  },
  {
    id: "gap_go",
    name: "Gap and Go",
    description: "Overnight gap > 2% with volume surge. Momentum continuation through the gap.",
    avgReturn: 27.3,
    winRate: 0.49,
    condition: "Earnings / catalyst events",
    strategy: {
      name: "Gap and Go",
      entryConditions: [{ id: "e1", type: "volume_breakout", param: 3 }, { id: "e2", type: "rsi_lt", param: 70 }],
      entryLogic: "AND",
      exitConditions: [{ id: "x1", type: "profit_target", param: 5 }, { id: "x2", type: "stop_loss", param: 3 }, { id: "x3", type: "max_bars", param: 3 }],
      exitLogic: "OR",
      sizing: "fixed_dollar",
      sizingValue: 3000,
    },
  },
];

// ── Condition editor ───────────────────────────────────────────────────────────

function ConditionEditor({
  condition,
  options,
  onChange,
  onRemove,
}: {
  condition: Condition;
  options: typeof ENTRY_CONDITION_TYPES;
  onChange: (c: Condition) => void;
  onRemove: () => void;
}) {
  const meta = options.find((o) => o.type === condition.type) ?? options[0];
  const needsParam = !["macd_cross", "bb_lower"].includes(condition.type);

  return (
    <div className="flex items-center gap-2 rounded-md border border-border/50 bg-card/60 px-3 py-2">
      <select
        value={condition.type}
        onChange={(e) => {
          const newType = e.target.value as ConditionType;
          const newMeta = options.find((o) => o.type === newType) ?? options[0];
          onChange({ ...condition, type: newType, param: newMeta.defaultParam });
        }}
        className="flex-1 bg-transparent text-xs text-muted-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o.type} value={o.type}>{o.label}</option>
        ))}
      </select>
      {needsParam && (
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            value={condition.param}
            onChange={(e) => onChange({ ...condition, param: parseFloat(e.target.value) || 0 })}
            className="w-16 rounded bg-muted px-2 py-0.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-muted-foreground">{meta.unit}</span>
        </div>
      )}
      <button onClick={onRemove} className="ml-1 text-muted-foreground hover:text-red-400 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Strategy plain-English summary ────────────────────────────────────────────

function strategyToEnglish(s: Strategy): string {
  if (s.entryConditions.length === 0) return "No entry conditions defined.";
  const entryParts = s.entryConditions.map(conditionLabel);
  const exitParts = s.exitConditions.map(conditionLabel);
  const entryStr = entryParts.join(` ${s.entryLogic} `);
  const exitStr = exitParts.length ? exitParts.join(` ${s.exitLogic} `) : "end of period";

  let sizeStr = "";
  switch (s.sizing) {
    case "fixed_shares": sizeStr = `${s.sizingValue} shares`; break;
    case "fixed_dollar": sizeStr = `$${s.sizingValue.toLocaleString()}`; break;
    case "pct_portfolio": sizeStr = `${s.sizingValue}% of portfolio`; break;
    case "kelly": sizeStr = "Kelly fraction (≈25%)"; break;
  }

  return `Enter when ${entryStr}. Exit when ${exitStr}. Size: ${sizeStr}.`;
}

// ── Equity Curve SVG ──────────────────────────────────────────────────────────

function EquityCurve({ equity, trades, startCapital = 10000 }: { equity: number[]; trades: TradeRecord[]; startCapital?: number }) {
  const W = 600, H = 250;
  const PAD = { top: 16, right: 16, bottom: 24, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minVal = Math.min(...equity, startCapital);
  const maxVal = Math.max(...equity, startCapital);
  const range = maxVal - minVal || 1;

  function xOf(i: number) { return PAD.left + (i / (equity.length - 1)) * chartW; }
  function yOf(v: number) { return PAD.top + (1 - (v - minVal) / range) * chartH; }

  const linePath = equity.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");

  // Drawdown shading
  let peak = equity[0];
  const ddPath: string[] = [];
  for (let i = 0; i < equity.length; i++) {
    if (equity[i] > peak) peak = equity[i];
    if (equity[i] < peak) {
      ddPath.push(`M ${xOf(i).toFixed(1)} ${yOf(peak).toFixed(1)} L ${xOf(i).toFixed(1)} ${yOf(equity[i]).toFixed(1)}`);
    }
  }

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minVal + t * range);
  const formatVal = (v: number) => `$${(v / 1000).toFixed(1)}k`;

  // Buy/sell markers
  const markers = trades.flatMap((t) => [
    { x: xOf(t.entryBar), y: yOf(equity[t.entryBar] ?? startCapital), type: "buy" },
    { x: xOf(t.exitBar), y: yOf(equity[t.exitBar] ?? equity[equity.length - 1]), type: t.pnl > 0 ? "win" : "loss" },
  ]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 250 }}>
      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill="transparent" />
      {/* Grid lines */}
      {yTicks.map((v, i) => (
        <line
          key={i}
          x1={PAD.left} y1={yOf(v).toFixed(1)}
          x2={W - PAD.right} y2={yOf(v).toFixed(1)}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1}
        />
      ))}
      {/* Drawdown shading */}
      {ddPath.map((d, i) => (
        <path key={i} d={d} stroke="rgba(239,68,68,0.25)" strokeWidth={1.5} />
      ))}
      {/* Equity line */}
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      {/* Start capital reference line */}
      <line
        x1={PAD.left} y1={yOf(startCapital).toFixed(1)}
        x2={W - PAD.right} y2={yOf(startCapital).toFixed(1)}
        stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" strokeWidth={1}
      />
      {/* Buy/sell markers */}
      {markers.map((m, i) => (
        <circle
          key={i}
          cx={m.x.toFixed(1)} cy={m.y.toFixed(1)} r={3}
          fill={m.type === "buy" ? "#22c55e" : m.type === "win" ? "#3b82f6" : "#ef4444"}
          opacity={0.85}
        />
      ))}
      {/* Y-axis labels */}
      {yTicks.map((v, i) => (
        <text
          key={i}
          x={PAD.left - 4} y={(yOf(v) + 3).toFixed(1)}
          textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.35)"
        >
          {formatVal(v)}
        </text>
      ))}
    </svg>
  );
}

// ── Optimization Heatmap SVG ───────────────────────────────────────────────────

function OptimizationHeatmap({
  results,
  paramLabel,
  params,
}: {
  results: BacktestResult[];
  paramLabel: string;
  params: number[];
}) {
  const W = 500, H = 180;
  const PAD = { top: 24, right: 16, bottom: 40, left: 60 };
  const chartW = W - PAD.left - PAD.right;
  const cellW = chartW / results.length;
  const chartH = H - PAD.top - PAD.bottom;

  const returns = results.map((r) => r.totalReturn);
  const minR = Math.min(...returns);
  const maxR = Math.max(...returns);
  const rangeR = maxR - minR || 1;

  function colorFromReturn(r: number): string {
    const t = (r - minR) / rangeR;
    if (t < 0.5) {
      const v = Math.round(t * 2 * 255);
      return `rgb(${v},${Math.round(v * 0.4)},0)`;
    } else {
      const v = Math.round((t - 0.5) * 2 * 255);
      return `rgb(0,${v},${Math.round(v * 0.4)})`;
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 180 }}>
      {results.map((r, i) => {
        const x = PAD.left + i * cellW;
        const retLabel = `${(r.totalReturn * 100).toFixed(1)}%`;
        return (
          <g key={i}>
            <rect
              x={x} y={PAD.top}
              width={cellW - 2} height={chartH}
              fill={colorFromReturn(r.totalReturn)}
              rx={3}
            />
            <text x={x + cellW / 2} y={PAD.top + chartH / 2 - 4} textAnchor="middle" fontSize={10} fill="white" fontWeight={600}>
              {retLabel}
            </text>
            <text x={x + cellW / 2} y={PAD.top + chartH / 2 + 10} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.6)">
              W:{(r.winRate * 100).toFixed(0)}%
            </text>
            <text x={x + cellW / 2} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)">
              {paramLabel}={params[i]}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
        Parameter sweep: {paramLabel}
      </text>
    </svg>
  );
}

// ── Monte Carlo Distribution SVG ───────────────────────────────────────────────

function MonteCarloChart({ returns }: { returns: number[] }) {
  const W = 500, H = 160;
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const sorted = [...returns].sort((a, b) => a - b);
  const minR = sorted[0];
  const maxR = sorted[sorted.length - 1];
  const range = maxR - minR || 0.01;

  // Histogram with 20 bins
  const BINS = 20;
  const binSize = range / BINS;
  const counts = new Array(BINS).fill(0);
  for (const r of sorted) {
    const b = Math.min(BINS - 1, Math.floor((r - minR) / binSize));
    counts[b]++;
  }
  const maxCount = Math.max(...counts, 1);

  const median = sorted[Math.floor(sorted.length / 2)];
  const p5 = sorted[Math.floor(sorted.length * 0.05)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  function xOf(r: number) { return PAD.left + ((r - minR) / range) * chartW; }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 160 }}>
      {counts.map((c, i) => {
        const x = PAD.left + i * (chartW / BINS);
        const barH = (c / maxCount) * chartH;
        const binMid = minR + (i + 0.5) * binSize;
        return (
          <rect
            key={i}
            x={x} y={PAD.top + chartH - barH}
            width={chartW / BINS - 1} height={barH}
            fill={binMid >= 0 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"}
          />
        );
      })}
      {/* P5/median/P95 lines */}
      {[
        { r: p5, label: "P5", color: "#ef4444" },
        { r: median, label: "Med", color: "#facc15" },
        { r: p95, label: "P95", color: "#22c55e" },
      ].map(({ r, label, color }) => (
        <g key={label}>
          <line x1={xOf(r)} y1={PAD.top} x2={xOf(r)} y2={PAD.top + chartH} stroke={color} strokeDasharray="3 2" strokeWidth={1.5} />
          <text x={xOf(r)} y={PAD.top - 4} textAnchor="middle" fontSize={8} fill={color}>{label}: {(r * 100).toFixed(1)}%</text>
        </g>
      ))}
      {/* X-axis labels */}
      {[-0.3, -0.15, 0, 0.15, 0.3].filter((v) => v >= minR && v <= maxR).map((v) => (
        <text key={v} x={xOf(v)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.4)">
          {(v * 100).toFixed(0)}%
        </text>
      ))}
    </svg>
  );
}

// ── Metric chip ────────────────────────────────────────────────────────────────

function MetricChip({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border/50 bg-card/60 px-3 py-2 min-w-[90px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={cn("text-sm font-bold tabular-nums", positive === true ? "text-green-400" : positive === false ? "text-red-400" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

type Tab = "builder" | "results" | "library" | "optimization" | "strategy_lab";

const TABS: { id: Tab; label: string; hasIcon?: boolean }[] = [
  { id: "builder", label: "Strategy Builder" },
  { id: "results", label: "Backtest Results" },
  { id: "library", label: "Strategy Library" },
  { id: "optimization", label: "Optimization" },
  { id: "strategy_lab", label: "Strategy Lab", hasIcon: true },
];

const DEFAULT_STRATEGY: Strategy = {
  name: "My Strategy",
  entryConditions: [{ id: "e1", type: "rsi_lt", param: 30 }],
  entryLogic: "AND",
  exitConditions: [
    { id: "x1", type: "profit_target", param: 10 },
    { id: "x2", type: "stop_loss", param: 5 },
  ],
  exitLogic: "OR",
  sizing: "pct_portfolio",
  sizingValue: 50,
};

export default function AlgoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("builder");
  const [strategy, setStrategy] = useState<Strategy>(DEFAULT_STRATEGY);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Optimization state
  const [optParam, setOptParam] = useState<"rsi" | "ma" | "volume">("rsi");
  const [optResults, setOptResults] = useState<BacktestResult[] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mcResults, setMcResults] = useState<number[] | null>(null);

  // Seed based on strategy name
  const seed = useMemo(() => strSeed(strategy.name || "default"), [strategy.name]);
  const bars = useMemo(() => generateBars(seed), [seed]);

  function addEntryCondition() {
    setStrategy((s) => ({
      ...s,
      entryConditions: [...s.entryConditions, { id: `e${Date.now()}`, type: "rsi_lt", param: 30 }],
    }));
  }

  function addExitCondition() {
    setStrategy((s) => ({
      ...s,
      exitConditions: [...s.exitConditions, { id: `x${Date.now()}`, type: "profit_target", param: 5 }],
    }));
  }

  function removeEntry(id: string) {
    setStrategy((s) => ({ ...s, entryConditions: s.entryConditions.filter((c) => c.id !== id) }));
  }

  function removeExit(id: string) {
    setStrategy((s) => ({ ...s, exitConditions: s.exitConditions.filter((c) => c.id !== id) }));
  }

  function updateEntry(updated: Condition) {
    setStrategy((s) => ({ ...s, entryConditions: s.entryConditions.map((c) => (c.id === updated.id ? updated : c)) }));
  }

  function updateExit(updated: Condition) {
    setStrategy((s) => ({ ...s, exitConditions: s.exitConditions.map((c) => (c.id === updated.id ? updated : c)) }));
  }

  const handleRunBacktest = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const r = runBacktest(strategy, bars);
      setResult(r);
      setIsRunning(false);
      setActiveTab("results");
    }, 400);
  }, [strategy, bars]);

  const handleLoadLibrary = useCallback((lib: LibraryStrategy) => {
    setStrategy(lib.strategy);
    setActiveTab("builder");
  }, []);

  const handleRunOptimization = useCallback(() => {
    setIsOptimizing(true);
    setTimeout(() => {
      const paramValues: Record<string, number[]> = {
        rsi: [10, 15, 20, 25, 30, 35],
        ma: [10, 20, 30, 50, 100, 200],
        volume: [1.2, 1.5, 2.0, 2.5, 3.0, 4.0],
      };
      const values = paramValues[optParam];
      const results = values.map((v) => {
        const modified: Strategy = {
          ...strategy,
          entryConditions: strategy.entryConditions.map((c) => {
            if (optParam === "rsi" && c.type === "rsi_lt") return { ...c, param: v };
            if (optParam === "ma" && c.type === "ma_cross_above") return { ...c, param: v };
            if (optParam === "volume" && c.type === "volume_breakout") return { ...c, param: v };
            return c;
          }),
        };
        return runBacktest(modified, generateBars(seed + Math.floor(v * 100)));
      });
      setOptResults(results);

      // Monte Carlo: shuffle trade order 500 times
      if (result) {
        const mc: number[] = [];
        const rand = mulberry32(seed + 999);
        for (let i = 0; i < 500; i++) {
          const shuffled = [...result.trades].sort(() => rand() - 0.5);
          let cap = 10000;
          for (const t of shuffled) cap = cap * (1 + t.pnlPct * 0.5);
          mc.push(cap / 10000 - 1);
        }
        setMcResults(mc);
      }

      setIsOptimizing(false);
    }, 600);
  }, [strategy, seed, result, optParam]);

  const optParamValues: Record<string, number[]> = {
    rsi: [10, 15, 20, 25, 30, 35],
    ma: [10, 20, 30, 50, 100, 200],
    volume: [1.2, 1.5, 2.0, 2.5, 3.0, 4.0],
  };

  // Walk-forward (80/20 split)
  const wfInSample = useMemo(() => {
    const inBars = bars.slice(0, Math.floor(bars.length * 0.8));
    return runBacktest(strategy, inBars);
  }, [strategy, bars]);

  const wfOutSample = useMemo(() => {
    const outBars = bars.slice(Math.floor(bars.length * 0.8));
    return runBacktest(strategy, outBars);
  }, [strategy, bars]);

  const summary = strategyToEnglish(strategy);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-black/30 px-6 py-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">Algo Trading Lab</h1>
          <p className="text-xs text-muted-foreground">Build, backtest, and optimize algorithmic strategies</p>
        </div>
        {result && (
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className={cn("font-semibold", result.totalReturn >= 0 ? "text-green-400" : "text-red-400")}>
              {result.totalReturn >= 0 ? "+" : ""}{(result.totalReturn * 100).toFixed(1)}% total return
            </span>
            <span>{result.numTrades} trades</span>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border/50 bg-black/20 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-muted-foreground"
            )}
          >
            {tab.hasIcon
              ? <span className="flex items-center gap-1.5"><FlaskConical className="h-3 w-3" />{tab.label}</span>
              : tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Tab 1: Strategy Builder ── */}
        {activeTab === "builder" && (
          <div className="p-6">
            <div className="mx-auto max-w-5xl space-y-6">
              {/* Strategy Name */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">
                    Strategy Name
                  </label>
                  <input
                    value={strategy.name}
                    onChange={(e) => setStrategy((s) => ({ ...s, name: e.target.value }))}
                    className="w-full max-w-xs rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="My Strategy"
                  />
                </div>
                <Button
                  onClick={handleRunBacktest}
                  disabled={isRunning || strategy.entryConditions.length === 0}
                  className="flex items-center gap-2 bg-primary hover:bg-primary text-white shrink-0"
                >
                  <Play className="h-3.5 w-3.5" />
                  {isRunning ? "Running..." : "Run Backtest"}
                </Button>
              </div>

              {/* Three-panel layout */}
              <div className="grid grid-cols-3 gap-4">
                {/* Entry Rules */}
                <Card className="border-border/50 bg-card/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Entry Rules</h2>
                    <select
                      value={strategy.entryLogic}
                      onChange={(e) => setStrategy((s) => ({ ...s, entryLogic: e.target.value as Logic }))}
                      className="text-xs rounded border border-border bg-muted px-2 py-0.5 text-muted-foreground"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    {strategy.entryConditions.map((c) => (
                      <ConditionEditor
                        key={c.id}
                        condition={c}
                        options={ENTRY_CONDITION_TYPES}
                        onChange={updateEntry}
                        onRemove={() => removeEntry(c.id)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={addEntryCondition}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-muted-foreground transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add condition
                  </button>
                  <div className="rounded-md border border-border/50 bg-black/20 p-2 text-xs text-muted-foreground">
                    <Info className="inline h-3 w-3 mr-1" />
                    Conditions joined by {strategy.entryLogic} logic
                  </div>
                </Card>

                {/* Exit Rules */}
                <Card className="border-border/50 bg-card/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Exit Rules</h2>
                    <select
                      value={strategy.exitLogic}
                      onChange={(e) => setStrategy((s) => ({ ...s, exitLogic: e.target.value as Logic }))}
                      className="text-xs rounded border border-border bg-muted px-2 py-0.5 text-muted-foreground"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    {strategy.exitConditions.map((c) => (
                      <ConditionEditor
                        key={c.id}
                        condition={c}
                        options={EXIT_CONDITION_TYPES}
                        onChange={updateExit}
                        onRemove={() => removeExit(c.id)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={addExitCondition}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-muted-foreground transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add condition
                  </button>
                  <div className="rounded-md border border-border/50 bg-black/20 p-2 text-xs text-muted-foreground">
                    <Info className="inline h-3 w-3 mr-1" />
                    Exit fires when {strategy.exitLogic === "OR" ? "any" : "all"} conditions match
                  </div>
                </Card>

                {/* Position Sizing */}
                <Card className="border-border/50 bg-card/50 p-4 space-y-4">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Position Sizing</h2>
                  <div className="space-y-2">
                    {(
                      [
                        { v: "fixed_shares", label: "Fixed Shares" },
                        { v: "fixed_dollar", label: "Fixed $ Amount" },
                        { v: "pct_portfolio", label: "% of Portfolio" },
                        { v: "kelly", label: "Kelly Fraction" },
                      ] as { v: SizingType; label: string }[]
                    ).map((opt) => (
                      <label key={opt.v} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="sizing"
                          value={opt.v}
                          checked={strategy.sizing === opt.v}
                          onChange={() => setStrategy((s) => ({ ...s, sizing: opt.v }))}
                          className="accent-blue-500"
                        />
                        <span className="text-xs text-muted-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {strategy.sizing !== "kelly" && (
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        {strategy.sizing === "fixed_shares" ? "Shares"
                          : strategy.sizing === "fixed_dollar" ? "Dollar amount ($)"
                          : "Portfolio %"}
                      </label>
                      <input
                        type="number"
                        value={strategy.sizingValue}
                        onChange={(e) => setStrategy((s) => ({ ...s, sizingValue: parseFloat(e.target.value) || 0 }))}
                        className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  )}
                  {strategy.sizing === "kelly" && (
                    <p className="text-xs text-muted-foreground">
                      Kelly uses 25% of portfolio per trade (conservative half-Kelly).
                    </p>
                  )}
                </Card>
              </div>

              {/* Strategy Summary */}
              <Card className="border-border/50 bg-card/50 p-4">
                <h2 className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Strategy Summary</h2>
                <p className="text-sm text-foreground leading-relaxed">{summary}</p>
              </Card>
            </div>
          </div>
        )}

        {/* ── Tab 2: Backtest Results ── */}
        {activeTab === "results" && (
          <div className="p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {!result ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
                  <Bot className="h-12 w-12 opacity-30" />
                  <p className="text-sm">No backtest results yet. Build a strategy and click &quot;Run Backtest&quot;.</p>
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => setActiveTab("builder")}
                  >
                    Go to Builder
                  </Button>
                </div>
              ) : (
                <>
                  {/* Performance Summary */}
                  <div>
                    <h2 className="mb-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Performance Summary</h2>
                    <div className="flex flex-wrap gap-2">
                      <MetricChip
                        label="Total Return"
                        value={`${result.totalReturn >= 0 ? "+" : ""}${(result.totalReturn * 100).toFixed(1)}%`}
                        positive={result.totalReturn >= 0}
                      />
                      <MetricChip label="Trades" value={String(result.numTrades)} />
                      <MetricChip
                        label="Win Rate"
                        value={`${(result.winRate * 100).toFixed(1)}%`}
                        positive={result.winRate >= 0.5}
                      />
                      <MetricChip
                        label="Avg Win"
                        value={`+${(result.avgWin * 100).toFixed(1)}%`}
                        positive
                      />
                      <MetricChip
                        label="Avg Loss"
                        value={`${(result.avgLoss * 100).toFixed(1)}%`}
                        positive={false}
                      />
                      <MetricChip
                        label="Max Drawdown"
                        value={`-${(result.maxDrawdown * 100).toFixed(1)}%`}
                        positive={false}
                      />
                      <MetricChip
                        label="Sharpe"
                        value={result.sharpe.toFixed(2)}
                        positive={result.sharpe >= 1}
                      />
                      <MetricChip
                        label="Profit Factor"
                        value={result.profitFactor > 99 ? "∞" : result.profitFactor.toFixed(2)}
                        positive={result.profitFactor >= 1}
                      />
                      <MetricChip
                        label="vs Buy & Hold"
                        value={`${result.totalReturn >= result.buyAndHold ? "+" : ""}${((result.totalReturn - result.buyAndHold) * 100).toFixed(1)}%`}
                        positive={result.totalReturn >= result.buyAndHold}
                      />
                    </div>
                  </div>

                  {/* Equity Curve */}
                  <Card className="border-border/50 bg-card/50 p-4">
                    <h2 className="mb-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Equity Curve</h2>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="inline-block h-1.5 w-4 rounded bg-primary" /> Strategy
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="inline-block h-1.5 w-4 rounded bg-muted" /> Capital floor
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Buy
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Loss exit
                      </div>
                    </div>
                    <EquityCurve equity={result.equity} trades={result.trades} />
                  </Card>

                  {/* Trade Log */}
                  <Card className="border-border/50 bg-card/50 p-4">
                    <h2 className="mb-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      Trade Log ({result.trades.length} trades)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/50 text-left text-muted-foreground">
                            <th className="pb-2 pr-4 font-medium">#</th>
                            <th className="pb-2 pr-4 font-medium">Entry Bar</th>
                            <th className="pb-2 pr-4 font-medium">Entry $</th>
                            <th className="pb-2 pr-4 font-medium">Exit Bar</th>
                            <th className="pb-2 pr-4 font-medium">Exit $</th>
                            <th className="pb-2 pr-4 font-medium">P&L %</th>
                            <th className="pb-2 font-medium">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.trades.slice(0, 30).map((t, i) => (
                            <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-1.5 pr-4 text-muted-foreground">{i + 1}</td>
                              <td className="py-1.5 pr-4 text-muted-foreground">{t.entryBar}</td>
                              <td className="py-1.5 pr-4 text-muted-foreground">${t.entryPrice.toFixed(2)}</td>
                              <td className="py-1.5 pr-4 text-muted-foreground">{t.exitBar}</td>
                              <td className="py-1.5 pr-4 text-muted-foreground">${t.exitPrice.toFixed(2)}</td>
                              <td className={cn("py-1.5 pr-4 font-semibold", t.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                                {t.pnlPct >= 0 ? "+" : ""}{(t.pnlPct * 100).toFixed(1)}%
                              </td>
                              <td className="py-1.5 text-muted-foreground">{t.exitReason}</td>
                            </tr>
                          ))}
                          {result.trades.length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-4 text-center text-muted-foreground">No trades generated</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {result.trades.length > 30 && (
                        <p className="mt-2 text-xs text-muted-foreground">Showing first 30 of {result.trades.length} trades</p>
                      )}
                    </div>
                  </Card>

                  {/* Buy & Hold comparison */}
                  <Card className="border-border/50 bg-card/50 p-4">
                    <h2 className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">vs Buy &amp; Hold</h2>
                    <div className="flex items-end gap-8">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Strategy Return</p>
                        <p className={cn("text-2xl font-bold tabular-nums", result.totalReturn >= 0 ? "text-green-400" : "text-red-400")}>
                          {result.totalReturn >= 0 ? "+" : ""}{(result.totalReturn * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Buy &amp; Hold Return</p>
                        <p className={cn("text-2xl font-bold tabular-nums", result.buyAndHold >= 0 ? "text-green-300" : "text-red-300")}>
                          {result.buyAndHold >= 0 ? "+" : ""}{(result.buyAndHold * 100).toFixed(1)}%
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "self-center",
                          result.totalReturn >= result.buyAndHold
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        )}
                      >
                        {result.totalReturn >= result.buyAndHold ? "Outperforms" : "Underperforms"} B&H by{" "}
                        {Math.abs((result.totalReturn - result.buyAndHold) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 3: Strategy Library ── */}
        {activeTab === "library" && (
          <div className="p-6">
            <div className="mx-auto max-w-5xl">
              <p className="mb-4 text-xs text-muted-foreground">
                Pre-built strategies. Click &quot;Load Strategy&quot; to populate the builder and customize.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {LIBRARY_STRATEGIES.map((lib) => {
                  const libSeed = strSeed(lib.id);
                  const libReturn = (mulberry32(libSeed)() * 0.4 - 0.05 + lib.avgReturn / 100);
                  return (
                    <Card key={lib.id} className="border-border/50 bg-card/50 p-4 space-y-3 hover:border-border transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{lib.name}</h3>
                          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{lib.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Avg Annual</span>
                          <span className={cn("text-sm font-bold tabular-nums", lib.avgReturn >= 0 ? "text-green-400" : "text-red-400")}>
                            +{lib.avgReturn.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Win Rate</span>
                          <span className="text-sm font-bold tabular-nums text-foreground">{(lib.winRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Best For</span>
                          <span className="text-xs text-muted-foreground">{lib.condition}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLoadLibrary(lib)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary transition-colors"
                      >
                        Load Strategy <ChevronRight className="h-3 w-3" />
                      </button>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Optimization ── */}
        {activeTab === "optimization" && (
          <div className="p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Parameter Sweep */}
              <Card className="border-border/50 bg-card/50 p-4 space-y-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Parameter Sweep</h2>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Parameter to sweep</label>
                    <select
                      value={optParam}
                      onChange={(e) => setOptParam(e.target.value as typeof optParam)}
                      className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground outline-none"
                    >
                      <option value="rsi">RSI Period (if RSI condition)</option>
                      <option value="ma">MA Period (if MA condition)</option>
                      <option value="volume">Volume Multiplier (if volume condition)</option>
                    </select>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Values: {optParamValues[optParam].join(", ")}
                  </div>
                  <Button
                    onClick={handleRunOptimization}
                    disabled={isOptimizing}
                    className="shrink-0 bg-primary hover:bg-primary text-white text-xs"
                  >
                    {isOptimizing ? "Optimizing..." : "Run 6 Backtests"}
                  </Button>
                </div>

                {optResults && (
                  <div className="space-y-2">
                    <OptimizationHeatmap
                      results={optResults}
                      paramLabel={optParam === "rsi" ? "RSI" : optParam === "ma" ? "MA" : "Vol×"}
                      params={optParamValues[optParam]}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-block h-2 w-4 rounded bg-green-500/60" /> Positive return
                      <span className="inline-block h-2 w-4 rounded bg-orange-500/60 ml-2" /> Negative return
                    </div>
                  </div>
                )}
              </Card>

              {/* Overfitting Warning */}
              <Card className="border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-amber-300">Overfitting Warning</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      When optimizing parameters, strategies may be overfit to the test period.
                      {strategy.entryConditions.length + strategy.exitConditions.length >= 4
                        ? " You have many conditions — high overfitting risk."
                        : " Keep parameter count low and validate out-of-sample."}
                      {" "}Always test on unseen data before trading real capital.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Walk-Forward */}
              <Card className="border-border/50 bg-card/50 p-4 space-y-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Walk-Forward Testing</h2>
                <p className="text-[11px] text-muted-foreground">
                  Strategy performance on in-sample (first 80%) vs out-of-sample (last 20%) data.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border border-border/50 bg-card/60 p-3 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">In-Sample (≈202 bars)</p>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Return</span>
                        <span className={cn("font-semibold", wfInSample.totalReturn >= 0 ? "text-green-400" : "text-red-400")}>
                          {(wfInSample.totalReturn * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="text-muted-foreground">{(wfInSample.winRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Sharpe</span>
                        <span className="text-muted-foreground">{wfInSample.sharpe.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Trades</span>
                        <span className="text-muted-foreground">{wfInSample.numTrades}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border border-border/50 bg-card/60 p-3 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Out-of-Sample (≈50 bars)</p>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Return</span>
                        <span className={cn("font-semibold", wfOutSample.totalReturn >= 0 ? "text-green-400" : "text-red-400")}>
                          {(wfOutSample.totalReturn * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="text-muted-foreground">{(wfOutSample.winRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Sharpe</span>
                        <span className="text-muted-foreground">{wfOutSample.sharpe.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Trades</span>
                        <span className="text-muted-foreground">{wfOutSample.numTrades}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {wfInSample.totalReturn > 0 && wfOutSample.totalReturn < wfInSample.totalReturn * 0.5 && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Out-of-sample performance dropped significantly — possible overfitting.
                  </div>
                )}
              </Card>

              {/* Monte Carlo */}
              <Card className="border-border/50 bg-card/50 p-4 space-y-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">Monte Carlo Simulation</h2>
                <p className="text-[11px] text-muted-foreground">
                  Trade order shuffled 500 times to show distribution of possible outcomes.
                  {!mcResults && " Run parameter sweep above to generate Monte Carlo results."}
                </p>
                {mcResults ? (
                  <div className="space-y-2">
                    <MonteCarloChart returns={mcResults} />
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Median: </span>
                        <span className="text-muted-foreground">
                          {(([...mcResults].sort((a, b) => a - b))[Math.floor(mcResults.length / 2)] * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P5 (worst 5%): </span>
                        <span className="text-red-400">
                          {(([...mcResults].sort((a, b) => a - b))[Math.floor(mcResults.length * 0.05)] * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P95 (best 5%): </span>
                        <span className="text-green-400">
                          {(([...mcResults].sort((a, b) => a - b))[Math.floor(mcResults.length * 0.95)] * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center text-muted-foreground text-xs border border-border/50 rounded-md">
                    Run optimization to generate Monte Carlo distribution
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ── Tab 5: Strategy Lab ── */}
        {activeTab === "strategy_lab" && (
          <StrategyLab />
        )}
      </div>
    </div>
  );
}
