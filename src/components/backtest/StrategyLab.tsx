"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Play, Plus, X, AlertTriangle, Info, Zap, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── PRNG ──────────────────────────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

type EntryConditionType =
  | "rsi_lt"
  | "rsi_gt"
  | "price_above_ma"
  | "price_below_ma"
  | "volume_spike"
  | "macd_cross_bull"
  | "bb_lower_touch"
  | "bb_upper_touch";

type ExitConditionType =
  | "rsi_overbought"
  | "trailing_stop"
  | "profit_target"
  | "stop_loss"
  | "time_exit";

type SizingType = "fixed_dollar" | "pct_portfolio" | "kelly" | "fixed_shares";

interface LabCondition {
  id: string;
  type: EntryConditionType | ExitConditionType;
  param: number;
}

interface RiskRules {
  maxPositionPct: number;
  maxPortfolioRiskPct: number;
  maxDrawdownStop: number;
}

interface LabStrategy {
  name: string;
  entryConditions: LabCondition[];
  exitConditions: LabCondition[];
  sizing: SizingType;
  sizingValue: number;
  riskRules: RiskRules;
}

interface LabTrade {
  entryBar: number;
  exitBar: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
  holdingBars: number;
  exitReason: string;
}

interface LabBacktestResult {
  equity: number[];
  trades: LabTrade[];
  totalReturn: number;
  cagr: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  maxDrawdown: number;
  avgDrawdown: number;
  recoveryFactor: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  totalTrades: number;
  avgHoldingPeriod: number;
  commissionDrag: number;
  buyAndHold: number;
}

interface OptimResult {
  paramA: number;
  paramB: number;
  sharpe: number;
  totalReturn: number;
  winRate: number;
}

interface LiveSignal {
  id: string;
  ticker: string;
  signalType: string;
  condition: string;
  time: string;
  suggestedEntry: number;
}

interface DailyPnL {
  day: number;
  strategy: number;
  benchmark: number;
}

// ── Bar / price data ──────────────────────────────────────────────────────────

interface SBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateLabBars(seed: number, n = 1000, startPrice = 150): SBar[] {
  const rand = mulberry32(seed);
  const bars: SBar[] = [];
  let price = startPrice;
  for (let i = 0; i < n; i++) {
    const drift = (rand() - 0.48) * 0.018;
    const vol = 0.012 + rand() * 0.018;
    const open = price;
    price = Math.max(5, price * (1 + drift + (rand() - 0.5) * vol));
    const high = Math.max(open, price) * (1 + rand() * 0.006);
    const low = Math.min(open, price) * (1 - rand() * 0.006);
    const volume = 800_000 + rand() * 8_000_000;
    bars.push({ open, high, low, close: price, volume });
  }
  return bars;
}

// ── Indicators ────────────────────────────────────────────────────────────────

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

function calcSMA(closes: number[], period: number): number[] {
  return closes.map((_, i) => {
    const start = Math.max(0, i - period + 1);
    const slice = closes.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

function calcEMA(closes: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = new Array(closes.length).fill(0);
  result[0] = closes[0];
  for (let i = 1; i < closes.length; i++) result[i] = closes[i] * k + result[i - 1] * (1 - k);
  return result;
}

function calcBB(closes: number[], period = 20, mult = 2) {
  const mid = calcSMA(closes, period);
  const upper: number[] = [], lower: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const start = Math.max(0, i - period + 1);
    const sl = closes.slice(start, i + 1);
    const mean = sl.reduce((a, b) => a + b, 0) / sl.length;
    const std = Math.sqrt(sl.reduce((a, b) => a + (b - mean) ** 2, 0) / sl.length);
    upper.push(mid[i] + mult * std);
    lower.push(mid[i] - mult * std);
  }
  return { upper, lower, mid };
}

function calcAvgVolume(vols: number[], period = 20): number[] {
  return vols.map((_, i) => {
    const sl = vols.slice(Math.max(0, i - period + 1), i + 1);
    return sl.reduce((a, b) => a + b, 0) / sl.length;
  });
}

// ── Backtester ────────────────────────────────────────────────────────────────

const COMMISSION_PCT = 0.001; // 0.1% per trade

function runLabBacktest(strategy: LabStrategy, bars: SBar[]): LabBacktestResult {
  const closes = bars.map(b => b.close);
  const volumes = bars.map(b => b.volume);
  const rsi = calcRSI(closes);
  const ma50 = calcSMA(closes, 50);
  const ma200 = calcSMA(closes, 200);
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macd = closes.map((_, i) => ema12[i] - ema26[i]);
  const macdSig = calcEMA(macd, 9);
  const bb = calcBB(closes);
  const avgVol = calcAvgVolume(volumes);

  const CAPITAL = 10000;
  let capital = CAPITAL;
  let shares = 0;
  let entryPrice = 0;
  let entryBar = 0;
  let highWaterMark = CAPITAL;
  const equity: number[] = [];
  const trades: LabTrade[] = [];
  let commissionPaid = 0;

  function checkEntry(i: number): boolean {
    if (strategy.entryConditions.length === 0) return false;
    return strategy.entryConditions.every(c => {
      const prev = Math.max(0, i - 1);
      switch (c.type as EntryConditionType) {
        case "rsi_lt": return rsi[i] < c.param;
        case "rsi_gt": return rsi[i] > c.param;
        case "price_above_ma": return closes[i] > (c.param === 200 ? ma200[i] : ma50[i]);
        case "price_below_ma": return closes[i] < (c.param === 200 ? ma200[i] : ma50[i]);
        case "volume_spike": return volumes[i] > avgVol[i] * c.param;
        case "macd_cross_bull": return macd[prev] < macdSig[prev] && macd[i] >= macdSig[i];
        case "bb_lower_touch": {
          const range = bb.upper[i] - bb.lower[i];
          return range > 0 && (closes[i] - bb.lower[i]) / range < 0.05;
        }
        case "bb_upper_touch": {
          const range = bb.upper[i] - bb.lower[i];
          return range > 0 && (closes[i] - bb.lower[i]) / range > 0.95;
        }
        default: return false;
      }
    });
  }

  function checkExit(i: number): string | null {
    const pnlPct = (closes[i] - entryPrice) / entryPrice;
    const barsHeld = i - entryBar;
    for (const c of strategy.exitConditions) {
      switch (c.type as ExitConditionType) {
        case "rsi_overbought": if (rsi[i] > c.param) return "RSI overbought"; break;
        case "profit_target": if (pnlPct >= c.param / 100) return "Profit target"; break;
        case "stop_loss": if (pnlPct <= -c.param / 100) return "Stop loss"; break;
        case "trailing_stop": {
          // simplified trailing: track via pnlPct from entry
          if (pnlPct <= -c.param / 100) return "Trailing stop"; break;
        }
        case "time_exit": if (barsHeld >= c.param) return "Time exit"; break;
      }
    }
    return null;
  }

  for (let i = 1; i < bars.length; i++) {
    const price = closes[i];

    // Check drawdown stop
    const portfolioValue = capital + shares * price;
    if (portfolioValue > highWaterMark) highWaterMark = portfolioValue;
    const ddFromPeak = (highWaterMark - portfolioValue) / highWaterMark;
    if (ddFromPeak >= strategy.riskRules.maxDrawdownStop / 100 && shares === 0) {
      // don't take new entries
    }

    if (shares > 0) {
      const reason = checkExit(i);
      if (reason || i === bars.length - 1) {
        const pnl = (price - entryPrice) * shares;
        const pnlPct = (price - entryPrice) / entryPrice;
        const commission = price * shares * COMMISSION_PCT;
        commissionPaid += commission;
        capital += shares * price - commission;
        trades.push({
          entryBar,
          exitBar: i,
          entryPrice,
          exitPrice: price,
          pnl: pnl - commission,
          pnlPct,
          holdingBars: i - entryBar,
          exitReason: reason ?? "End of period",
        });
        shares = 0;
      }
    } else {
      const portfolioDd = (highWaterMark - (capital + shares * price)) / highWaterMark;
      const shouldEnter = checkEntry(i) && portfolioDd < strategy.riskRules.maxDrawdownStop / 100;
      if (shouldEnter && capital > price) {
        let maxCapital: number;
        switch (strategy.sizing) {
          case "fixed_dollar": maxCapital = Math.min(strategy.sizingValue, capital); break;
          case "pct_portfolio": maxCapital = capital * Math.min(strategy.sizingValue, strategy.riskRules.maxPositionPct) / 100; break;
          case "kelly": maxCapital = capital * 0.25; break;
          case "fixed_shares": maxCapital = strategy.sizingValue * price; break;
          default: maxCapital = capital * 0.5;
        }
        const numShares = Math.floor(maxCapital / price);
        if (numShares > 0) {
          const commission = price * numShares * COMMISSION_PCT;
          commissionPaid += commission;
          shares = numShares;
          capital -= shares * price + commission;
          entryPrice = price;
          entryBar = i;
        }
      }
    }

    equity.push(capital + shares * price);
  }

  // Metrics
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const finalEquity = equity[equity.length - 1] ?? CAPITAL;
  const totalReturn = finalEquity / CAPITAL - 1;
  const years = bars.length / 252;
  const cagr = Math.pow(finalEquity / CAPITAL, 1 / Math.max(years, 0.1)) - 1;

  let peak = equity[0] ?? CAPITAL;
  let maxDd = 0;
  let totalDd = 0;
  let ddCount = 0;
  for (const e of equity) {
    if (e > peak) peak = e;
    const dd = (peak - e) / peak;
    if (dd > maxDd) maxDd = dd;
    if (dd > 0) { totalDd += dd; ddCount++; }
  }
  const avgDd = ddCount > 0 ? totalDd / ddCount : 0;

  const returns = equity.map((e, i) => i === 0 ? 0 : (e - equity[i - 1]) / equity[i - 1]);
  const meanR = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdR = Math.sqrt(returns.reduce((a, b) => a + (b - meanR) ** 2, 0) / returns.length);
  const sharpe = stdR > 0 ? (meanR / stdR) * Math.sqrt(252) : 0;

  const downsideReturns = returns.filter(r => r < 0);
  const downsideStd = downsideReturns.length > 0
    ? Math.sqrt(downsideReturns.reduce((a, r) => a + r * r, 0) / downsideReturns.length)
    : 0;
  const sortino = downsideStd > 0 ? (meanR / downsideStd) * Math.sqrt(252) : 0;

  const calmar = maxDd > 0 ? cagr / maxDd : 0;
  const recoveryFactor = maxDd > 0 ? totalReturn / maxDd : 0;

  const grossWin = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0;

  const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnlPct, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((a, t) => a + t.pnlPct, 0) / losses.length : 0;
  const winRate = trades.length ? wins.length / trades.length : 0;
  const expectancy = winRate * avgWin + (1 - winRate) * avgLoss;

  const avgHoldingPeriod = trades.length
    ? trades.reduce((a, t) => a + t.holdingBars, 0) / trades.length
    : 0;

  const commissionDrag = commissionPaid / CAPITAL;
  const buyAndHold = closes[closes.length - 1] / closes[0] - 1;

  return {
    equity, trades, totalReturn, cagr, sharpe, sortino, calmar,
    maxDrawdown: maxDd, avgDrawdown: avgDd, recoveryFactor,
    winRate, avgWin, avgLoss, profitFactor, expectancy,
    totalTrades: trades.length, avgHoldingPeriod, commissionDrag, buyAndHold,
  };
}

// ── Preset strategies ─────────────────────────────────────────────────────────

interface PresetStrategy {
  id: string;
  name: string;
  description: string;
  strategy: LabStrategy;
}

const PRESETS: PresetStrategy[] = [
  {
    id: "mean_rev", name: "Mean Reversion",
    description: "Buy oversold RSI dips below support, exit on recovery.",
    strategy: {
      name: "Mean Reversion",
      entryConditions: [
        { id: "e1", type: "rsi_lt", param: 30 },
        { id: "e2", type: "price_above_ma", param: 200 },
      ],
      exitConditions: [
        { id: "x1", type: "rsi_overbought", param: 65 },
        { id: "x2", type: "stop_loss", param: 5 },
      ],
      sizing: "pct_portfolio", sizingValue: 50,
      riskRules: { maxPositionPct: 50, maxPortfolioRiskPct: 2, maxDrawdownStop: 20 },
    },
  },
  {
    id: "trend_follow", name: "Trend Following",
    description: "MACD crossover with price above 50MA, ride the trend.",
    strategy: {
      name: "Trend Following",
      entryConditions: [
        { id: "e1", type: "macd_cross_bull", param: 0 },
        { id: "e2", type: "price_above_ma", param: 50 },
      ],
      exitConditions: [
        { id: "x1", type: "trailing_stop", param: 7 },
        { id: "x2", type: "time_exit", param: 60 },
      ],
      sizing: "pct_portfolio", sizingValue: 65,
      riskRules: { maxPositionPct: 65, maxPortfolioRiskPct: 3, maxDrawdownStop: 25 },
    },
  },
  {
    id: "momentum", name: "Momentum",
    description: "Volume spike + RSI strength above midline, short hold.",
    strategy: {
      name: "Momentum",
      entryConditions: [
        { id: "e1", type: "volume_spike", param: 2.5 },
        { id: "e2", type: "rsi_gt", param: 55 },
      ],
      exitConditions: [
        { id: "x1", type: "profit_target", param: 8 },
        { id: "x2", type: "stop_loss", param: 4 },
        { id: "x3", type: "time_exit", param: 15 },
      ],
      sizing: "fixed_dollar", sizingValue: 3000,
      riskRules: { maxPositionPct: 30, maxPortfolioRiskPct: 1.5, maxDrawdownStop: 15 },
    },
  },
  {
    id: "carry", name: "Carry",
    description: "Buy dips below 200MA when RSI oversold, long hold.",
    strategy: {
      name: "Carry",
      entryConditions: [
        { id: "e1", type: "price_below_ma", param: 200 },
        { id: "e2", type: "rsi_lt", param: 35 },
      ],
      exitConditions: [
        { id: "x1", type: "profit_target", param: 15 },
        { id: "x2", type: "stop_loss", param: 8 },
      ],
      sizing: "pct_portfolio", sizingValue: 40,
      riskRules: { maxPositionPct: 40, maxPortfolioRiskPct: 2, maxDrawdownStop: 25 },
    },
  },
  {
    id: "earnings_drift", name: "Earnings Drift",
    description: "BB lower band touch with volume surge, short squeeze play.",
    strategy: {
      name: "Earnings Drift",
      entryConditions: [
        { id: "e1", type: "bb_lower_touch", param: 0 },
        { id: "e2", type: "volume_spike", param: 2 },
      ],
      exitConditions: [
        { id: "x1", type: "profit_target", param: 6 },
        { id: "x2", type: "stop_loss", param: 3 },
        { id: "x3", type: "time_exit", param: 10 },
      ],
      sizing: "fixed_dollar", sizingValue: 2500,
      riskRules: { maxPositionPct: 25, maxPortfolioRiskPct: 1, maxDrawdownStop: 12 },
    },
  },
  {
    id: "pairs", name: "Pairs Trading",
    description: "Upper BB touch reversal — fade strength, capture reversion.",
    strategy: {
      name: "Pairs Trading",
      entryConditions: [
        { id: "e1", type: "bb_upper_touch", param: 0 },
        { id: "e2", type: "rsi_gt", param: 70 },
      ],
      exitConditions: [
        { id: "x1", type: "rsi_overbought", param: 55 },
        { id: "x2", type: "stop_loss", param: 4 },
      ],
      sizing: "pct_portfolio", sizingValue: 35,
      riskRules: { maxPositionPct: 35, maxPortfolioRiskPct: 1.5, maxDrawdownStop: 15 },
    },
  },
];

// ── Entry/Exit condition metadata ─────────────────────────────────────────────

const ENTRY_TYPES: { type: EntryConditionType; label: string; defaultParam: number; unit: string; hasParam: boolean }[] = [
  { type: "rsi_lt", label: "RSI < X (oversold)", defaultParam: 30, unit: "", hasParam: true },
  { type: "rsi_gt", label: "RSI > X (strength)", defaultParam: 55, unit: "", hasParam: true },
  { type: "price_above_ma", label: "Price above MA(X)", defaultParam: 50, unit: "period", hasParam: true },
  { type: "price_below_ma", label: "Price below MA(X)", defaultParam: 200, unit: "period", hasParam: true },
  { type: "volume_spike", label: "Volume > X× avg", defaultParam: 2, unit: "×", hasParam: true },
  { type: "macd_cross_bull", label: "MACD crosses above signal", defaultParam: 0, unit: "", hasParam: false },
  { type: "bb_lower_touch", label: "BB lower band touch", defaultParam: 0, unit: "", hasParam: false },
  { type: "bb_upper_touch", label: "BB upper band touch", defaultParam: 0, unit: "", hasParam: false },
];

const EXIT_TYPES: { type: ExitConditionType; label: string; defaultParam: number; unit: string; hasParam: boolean }[] = [
  { type: "rsi_overbought", label: "RSI > X (exit)", defaultParam: 70, unit: "", hasParam: true },
  { type: "profit_target", label: "X% profit target", defaultParam: 8, unit: "%", hasParam: true },
  { type: "stop_loss", label: "X% stop loss", defaultParam: 5, unit: "%", hasParam: true },
  { type: "trailing_stop", label: "X% trailing stop", defaultParam: 5, unit: "%", hasParam: true },
  { type: "time_exit", label: "X bars time exit", defaultParam: 20, unit: "bars", hasParam: true },
];

function conditionLabel(c: LabCondition): string {
  const allTypes = [...ENTRY_TYPES, ...EXIT_TYPES];
  const meta = allTypes.find(t => t.type === c.type);
  if (!meta) return c.type;
  if (!meta.hasParam) return meta.label.split("(")[0].trim();
  return `${meta.label.split("(")[0].trim()} ${c.param}${meta.unit}`;
}

function buildStrategyDescription(s: LabStrategy): string {
  if (s.entryConditions.length === 0) return "No entry conditions defined. Add at least one entry rule.";
  const entry = s.entryConditions.map(conditionLabel).join(" AND ");
  const exit = s.exitConditions.length
    ? s.exitConditions.map(conditionLabel).join(" OR ")
    : "end of period";
  const sizeDesc = s.sizing === "fixed_dollar" ? `$${s.sizingValue.toLocaleString()} fixed`
    : s.sizing === "pct_portfolio" ? `${s.sizingValue}% of portfolio`
    : s.sizing === "kelly" ? "Kelly fraction (~25%)"
    : `${s.sizingValue} shares`;
  return `Enter when ${entry}. Exit when ${exit}. Size: ${sizeDesc}. Max DD stop: ${s.riskRules.maxDrawdownStop}%.`;
}

// ── SVG: Equity curve + drawdown ──────────────────────────────────────────────

function LabEquityCurve({ result }: { result: LabBacktestResult }) {
  const { equity } = result;
  const W = 640, H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  // Downsample to 200 points
  const step = Math.max(1, Math.floor(equity.length / 200));
  const sampled = equity.filter((_, i) => i % step === 0);

  const allVals = [...sampled, 10000];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  function xOf(i: number) { return PAD.left + (i / (sampled.length - 1)) * cW; }
  function yOf(v: number) { return PAD.top + (1 - (v - minV) / range) * cH; }

  const linePath = sampled.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
  const bhPath = sampled.map((_, i) => {
    const bhV = 10000 * (1 + result.buyAndHold * i / (sampled.length - 1));
    return `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(bhV).toFixed(1)}`;
  }).join(" ");

  // Drawdown band
  let peak = sampled[0];
  const ddBand: string[] = [];
  for (let i = 0; i < sampled.length; i++) {
    if (sampled[i] > peak) peak = sampled[i];
    if (sampled[i] < peak) {
      ddBand.push(`M ${xOf(i).toFixed(1)} ${yOf(peak).toFixed(1)} L ${xOf(i).toFixed(1)} ${yOf(sampled[i]).toFixed(1)}`);
    }
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => minV + t * range);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 220 }}>
      {yTicks.map((v, i) => (
        <line key={i} x1={PAD.left} y1={yOf(v).toFixed(1)} x2={W - PAD.right} y2={yOf(v).toFixed(1)}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      {ddBand.map((d, i) => (
        <path key={i} d={d} stroke="rgba(239,68,68,0.2)" strokeWidth={1.5} />
      ))}
      <path d={bhPath} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 3" />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <line x1={PAD.left} y1={yOf(10000).toFixed(1)} x2={W - PAD.right} y2={yOf(10000).toFixed(1)}
        stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" strokeWidth={1} />
      {yTicks.map((v, i) => (
        <text key={i} x={PAD.left - 4} y={(yOf(v) + 3).toFixed(1)} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.35)">
          ${(v / 1000).toFixed(1)}k
        </text>
      ))}
      <text x={W - PAD.right} y={PAD.top + cH * 0.1} fontSize={8} fill="rgba(255,255,255,0.3)" textAnchor="end">B&H</text>
      <text x={W - PAD.right} y={PAD.top + cH * 0.02} fontSize={8} fill="#3b82f6" textAnchor="end">Strategy</text>
    </svg>
  );
}

// ── SVG: Optimization heatmap 5×5 ────────────────────────────────────────────

function OptimHeatmap({ results, paramAVals, paramBVals, paramALabel, paramBLabel, bestIdx }: {
  results: OptimResult[];
  paramAVals: number[];
  paramBVals: number[];
  paramALabel: string;
  paramBLabel: string;
  bestIdx: number;
}) {
  const W = 520, H = 300;
  const PAD = { top: 40, right: 16, bottom: 50, left: 70 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const NA = paramAVals.length; // 5
  const NB = paramBVals.length; // 5
  const cellW = cW / NA;
  const cellH = cH / NB;

  const sharpes = results.map(r => r.sharpe);
  const minS = Math.min(...sharpes);
  const maxS = Math.max(...sharpes);
  const rangeS = maxS - minS || 1;

  function colorFromSharpe(s: number): string {
    const t = (s - minS) / rangeS;
    if (t < 0.5) {
      const v = Math.round(t * 2 * 200);
      return `rgb(${200 - v},${Math.round(v * 0.3)},0)`;
    }
    const v = Math.round((t - 0.5) * 2 * 220);
    return `rgb(0,${v},${Math.round(v * 0.4)})`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
      {/* Title */}
      <text x={W / 2} y={14} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.5)" fontWeight={600}>
        Sharpe Ratio Heatmap — {paramALabel} × {paramBLabel}
      </text>
      {/* Cells */}
      {results.map((r, idx) => {
        const ai = Math.floor(idx / NB);
        const bi = idx % NB;
        const x = PAD.left + ai * cellW;
        const y = PAD.top + bi * cellH;
        const isBest = idx === bestIdx;
        return (
          <g key={idx}>
            <rect x={x + 1} y={y + 1} width={cellW - 2} height={cellH - 2}
              fill={colorFromSharpe(r.sharpe)} rx={2}
              stroke={isBest ? "#facc15" : "transparent"} strokeWidth={isBest ? 2 : 0} />
            <text x={x + cellW / 2} y={y + cellH / 2 - 3} textAnchor="middle" fontSize={9} fill="white" fontWeight={600}>
              {r.sharpe.toFixed(2)}
            </text>
            <text x={x + cellW / 2} y={y + cellH / 2 + 9} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.6)">
              {(r.totalReturn * 100).toFixed(0)}%
            </text>
            {isBest && (
              <text x={x + cellW / 2} y={y + cellH / 2 + 20} textAnchor="middle" fontSize={7} fill="#facc15">
                BEST
              </text>
            )}
          </g>
        );
      })}
      {/* Axis labels paramA */}
      {paramAVals.map((v, i) => (
        <text key={i} x={PAD.left + i * cellW + cellW / 2} y={H - PAD.bottom + 14}
          textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.5)">
          {v}
        </text>
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">{paramALabel}</text>
      {/* Axis labels paramB */}
      {paramBVals.map((v, i) => (
        <text key={i} x={PAD.left - 4} y={PAD.top + i * cellH + cellH / 2 + 3}
          textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.5)">
          {v}
        </text>
      ))}
      <text x={12} y={PAD.top + cH / 2} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)"
        transform={`rotate(-90, 12, ${PAD.top + cH / 2})`}>{paramBLabel}</text>
    </svg>
  );
}

// ── SVG: Monte Carlo fan chart ─────────────────────────────────────────────────

function MonteCarloFan({ simulations, buyAndHold }: { simulations: number[][], buyAndHold: number }) {
  const W = 600, H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const N = simulations[0]?.length ?? 0;
  if (N === 0) return null;

  // Compute percentiles at each point
  const pcts = [5, 25, 50, 75, 95];
  const bands: number[][] = pcts.map(() => []);

  for (let t = 0; t < N; t++) {
    const vals = simulations.map(s => s[t]).sort((a, b) => a - b);
    for (let p = 0; p < pcts.length; p++) {
      const idx = Math.floor((pcts[p] / 100) * vals.length);
      bands[p].push(vals[Math.min(idx, vals.length - 1)]);
    }
  }

  const allVals = bands.flat();
  const minV = Math.min(...allVals, 10000 * (1 + buyAndHold));
  const maxV = Math.max(...allVals, 10000);
  const range = maxV - minV || 1;

  function xOf(i: number) { return PAD.left + (i / (N - 1)) * cW; }
  function yOf(v: number) { return PAD.top + (1 - (v - minV) / range) * cH; }

  function bandPath(band: number[]) {
    return band.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
  }

  // Fill between bands
  function fillBetween(upper: number[], lower: number[]) {
    const topPath = upper.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
    const botPath = [...lower].reverse().map((v, i) => `L ${xOf(lower.length - 1 - i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
    return topPath + " " + botPath + " Z";
  }

  // B&H reference line
  const bhPath = Array.from({ length: N }, (_, i) =>
    `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(10000 * (1 + buyAndHold * i / (N - 1))).toFixed(1)}`
  ).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => minV + t * range);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 220 }}>
      {yTicks.map((v, i) => (
        <line key={i} x1={PAD.left} y1={yOf(v).toFixed(1)} x2={W - PAD.right} y2={yOf(v).toFixed(1)}
          stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      {/* Fan fills */}
      <path d={fillBetween(bands[4], bands[0])} fill="rgba(59,130,246,0.06)" />
      <path d={fillBetween(bands[3], bands[1])} fill="rgba(59,130,246,0.10)" />
      {/* Percentile lines */}
      <path d={bandPath(bands[0])} fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth={1} />
      <path d={bandPath(bands[1])} fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth={1} />
      <path d={bandPath(bands[2])} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      <path d={bandPath(bands[3])} fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth={1} />
      <path d={bandPath(bands[4])} fill="none" stroke="rgba(34,197,94,0.7)" strokeWidth={1} />
      {/* B&H */}
      <path d={bhPath} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="4 3" />
      {/* Y-axis */}
      {yTicks.map((v, i) => (
        <text key={i} x={PAD.left - 4} y={(yOf(v) + 3).toFixed(1)} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.35)">
          ${(v / 1000).toFixed(1)}k
        </text>
      ))}
      {/* Legend */}
      {[
        { color: "rgba(239,68,68,0.7)", label: "P5" },
        { color: "rgba(251,191,36,0.7)", label: "P25" },
        { color: "#3b82f6", label: "P50" },
        { color: "rgba(34,197,94,0.7)", label: "P75" },
        { color: "rgba(34,197,94,0.9)", label: "P95" },
        { color: "rgba(255,255,255,0.4)", label: "B&H" },
      ].map(({ color, label }, i) => (
        <g key={i} transform={`translate(${PAD.left + i * 75}, ${H - 8})`}>
          <line x1={0} y1={0} x2={16} y2={0} stroke={color} strokeWidth={1.5} strokeDasharray={label === "B&H" ? "4 2" : undefined} />
          <text x={20} y={3} fontSize={8} fill="rgba(255,255,255,0.4)">{label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG: Histogram ────────────────────────────────────────────────────────────

function OutcomeHistogram({ finalValues }: { finalValues: number[] }) {
  const W = 400, H = 160;
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const BINS = 25;

  const minV = Math.min(...finalValues);
  const maxV = Math.max(...finalValues);
  const range = maxV - minV || 1;
  const binSize = range / BINS;

  const counts = new Array(BINS).fill(0);
  for (const v of finalValues) {
    const b = Math.min(BINS - 1, Math.floor((v - minV) / binSize));
    counts[b]++;
  }
  const maxC = Math.max(...counts, 1);

  function xOf(v: number) { return PAD.left + ((v - minV) / range) * cW; }

  const sorted = [...finalValues].sort((a, b) => a - b);
  const p5 = sorted[Math.floor(sorted.length * 0.05)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 160 }}>
      {counts.map((c, i) => {
        const x = PAD.left + i * (cW / BINS);
        const barH = (c / maxC) * cH;
        const binMid = minV + (i + 0.5) * binSize;
        return (
          <rect key={i} x={x} y={PAD.top + cH - barH} width={cW / BINS - 1} height={barH}
            fill={binMid >= 10000 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"} />
        );
      })}
      {[{ v: p5, label: "P5", color: "#ef4444" }, { v: median, label: "Med", color: "#facc15" }, { v: p95, label: "P95", color: "#22c55e" }].map(({ v, label, color }) => (
        <g key={label}>
          <line x1={xOf(v)} y1={PAD.top} x2={xOf(v)} y2={PAD.top + cH} stroke={color} strokeDasharray="3 2" strokeWidth={1.5} />
          <text x={xOf(v)} y={PAD.top - 3} textAnchor="middle" fontSize={8} fill={color}>{label}</text>
        </g>
      ))}
      <line x1={xOf(10000)} y1={PAD.top} x2={xOf(10000)} y2={PAD.top + cH}
        stroke="rgba(255,255,255,0.3)" strokeDasharray="4 2" strokeWidth={1} />
      <text x={xOf(10000)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.3)">Break-even</text>
    </svg>
  );
}

// ── SVG: Daily P&L bar chart ──────────────────────────────────────────────────

function DailyPnLChart({ days }: { days: DailyPnL[] }) {
  const W = 500, H = 160;
  const PAD = { top: 16, right: 16, bottom: 32, left: 50 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const N = days.length;
  const barW = (cW / N) * 0.35;

  const allVals = days.flatMap(d => [d.strategy, d.benchmark, 0]);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = Math.max(maxV - minV, 0.01);

  function yOf(v: number) { return PAD.top + (1 - (v - minV) / range) * cH; }
  function xOf(i: number) { return PAD.left + (i + 0.5) * (cW / N); }
  const zeroY = yOf(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 160 }}>
      <line x1={PAD.left} y1={zeroY.toFixed(1)} x2={W - PAD.right} y2={zeroY.toFixed(1)}
        stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      {days.map((d, i) => {
        const sx = xOf(i) - barW;
        const bx = xOf(i) + 2;
        const sY = yOf(d.strategy);
        const bY = yOf(d.benchmark);
        const sH = Math.abs(zeroY - sY);
        const bH = Math.abs(zeroY - bY);
        return (
          <g key={i}>
            <rect x={sx} y={d.strategy >= 0 ? sY : zeroY} width={barW} height={sH}
              fill={d.strategy >= 0 ? "rgba(59,130,246,0.7)" : "rgba(239,68,68,0.6)"} rx={1} />
            <rect x={bx} y={d.benchmark >= 0 ? bY : zeroY} width={barW} height={bH}
              fill={d.benchmark >= 0 ? "rgba(255,255,255,0.2)" : "rgba(239,68,68,0.3)"} rx={1} />
          </g>
        );
      })}
      {[minV, 0, maxV].map((v, i) => (
        <text key={i} x={PAD.left - 4} y={(yOf(v) + 3).toFixed(1)} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.35)">
          {(v * 100).toFixed(1)}%
        </text>
      ))}
      <text x={PAD.left} y={H - 4} fontSize={8} fill="rgba(59,130,246,0.8)">Strategy</text>
      <text x={PAD.left + 60} y={H - 4} fontSize={8} fill="rgba(255,255,255,0.4)">SPY</text>
    </svg>
  );
}

// ── Metric chip ───────────────────────────────────────────────────────────────

function LabMetric({ label, value, positive, sub }: { label: string; value: string; positive?: boolean; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-white/8 bg-zinc-900/60 px-3 py-2 min-w-[100px]">
      <span className="text-[9px] text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className={cn("text-sm font-bold tabular-nums",
        positive === true ? "text-green-400" : positive === false ? "text-red-400" : "text-zinc-200")}>
        {value}
      </span>
      {sub && <span className="text-[9px] text-zinc-600">{sub}</span>}
    </div>
  );
}

// ── Condition row ─────────────────────────────────────────────────────────────

type ConditionOptionMeta = { type: string; label: string; defaultParam: number; unit: string; hasParam: boolean };

function ConditionRow({
  condition,
  options,
  onChange,
  onRemove,
}: {
  condition: LabCondition;
  options: ConditionOptionMeta[];
  onChange: (c: LabCondition) => void;
  onRemove: () => void;
}) {
  const meta = options.find(o => o.type === condition.type) ?? options[0];
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/8 bg-zinc-900/60 px-3 py-2">
      <select
        value={condition.type}
        onChange={e => {
          const newType = e.target.value;
          const newMeta = options.find(o => o.type === newType) ?? options[0];
          onChange({ ...condition, type: newType as EntryConditionType | ExitConditionType, param: newMeta.defaultParam });
        }}
        className="flex-1 bg-transparent text-xs text-zinc-300 outline-none"
      >
        {options.map(o => <option key={o.type} value={o.type}>{o.label}</option>)}
      </select>
      {meta.hasParam && (
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            value={condition.param}
            onChange={e => onChange({ ...condition, param: parseFloat(e.target.value) || 0 })}
            className="w-16 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-[10px] text-zinc-500">{meta.unit}</span>
        </div>
      )}
      <button onClick={onRemove} className="text-zinc-600 hover:text-red-400 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type LabSection = "builder" | "results" | "optimization" | "montecarlo" | "paper";

const LAB_SECTIONS: { id: LabSection; label: string; icon: React.ReactNode }[] = [
  { id: "builder", label: "Strategy Builder", icon: <Zap className="h-3 w-3" /> },
  { id: "results", label: "Backtest Results", icon: <Activity className="h-3 w-3" /> },
  { id: "optimization", label: "Optimization", icon: <TrendingUp className="h-3 w-3" /> },
  { id: "montecarlo", label: "Monte Carlo", icon: <RefreshCw className="h-3 w-3" /> },
  { id: "paper", label: "Live Paper", icon: <Play className="h-3 w-3" /> },
];

const DEFAULT_STRATEGY: LabStrategy = {
  name: "My Lab Strategy",
  entryConditions: [
    { id: "e1", type: "rsi_lt", param: 30 },
    { id: "e2", type: "price_above_ma", param: 200 },
    { id: "e3", type: "volume_spike", param: 1.5 },
  ],
  exitConditions: [
    { id: "x1", type: "rsi_overbought", param: 70 },
    { id: "x2", type: "trailing_stop", param: 5 },
  ],
  sizing: "pct_portfolio",
  sizingValue: 50,
  riskRules: { maxPositionPct: 50, maxPortfolioRiskPct: 2, maxDrawdownStop: 20 },
};

const SEED = 4321;
const TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META", "GOOGL", "AMD"];

export default function StrategyLab() {
  const [section, setSection] = useState<LabSection>("builder");
  const [strategy, setStrategy] = useState<LabStrategy>(DEFAULT_STRATEGY);
  const [result, setResult] = useState<LabBacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Optimization state
  const [optParamA, setOptParamA] = useState<"rsi_period" | "volume_mult" | "profit_target">("rsi_period");
  const [optParamB, setOptParamB] = useState<"stop_loss" | "time_exit" | "ma_period">("stop_loss");
  const [optResults, setOptResults] = useState<OptimResult[] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Monte Carlo state
  const [mcSimulations, setMcSimulations] = useState<number[][] | null>(null);
  const [mcFinalValues, setMcFinalValues] = useState<number[] | null>(null);
  const [isRunningMC, setIsRunningMC] = useState(false);

  // Paper trading state
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [dailyPnL, setDailyPnL] = useState<DailyPnL[]>([]);
  const signalRef = useRef(0);

  const bars = useMemo(() => generateLabBars(SEED, 1000), []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRunBacktest = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const r = runLabBacktest(strategy, bars);
      setResult(r);
      setIsRunning(false);
      setSection("results");
    }, 500);
  }, [strategy, bars]);

  const handleLoadPreset = useCallback((preset: PresetStrategy) => {
    setStrategy({ ...preset.strategy });
    setSection("builder");
  }, []);

  const handleRunOptimization = useCallback(() => {
    setIsOptimizing(true);
    setTimeout(() => {
      const paramAOptions: Record<string, number[]> = {
        rsi_period: [10, 15, 20, 25, 30],
        volume_mult: [1.2, 1.5, 2.0, 2.5, 3.0],
        profit_target: [4, 6, 8, 10, 12],
      };
      const paramBOptions: Record<string, number[]> = {
        stop_loss: [2, 3, 4, 5, 6],
        time_exit: [10, 15, 20, 30, 40],
        ma_period: [20, 50, 100, 150, 200],
      };
      const aVals = paramAOptions[optParamA];
      const bVals = paramBOptions[optParamB];

      const results: OptimResult[] = [];
      for (const a of aVals) {
        for (const b of bVals) {
          const modified: LabStrategy = {
            ...strategy,
            entryConditions: strategy.entryConditions.map(c => {
              if (optParamA === "rsi_period" && c.type === "rsi_lt") return { ...c, param: a };
              if (optParamA === "volume_mult" && c.type === "volume_spike") return { ...c, param: a };
              return c;
            }),
            exitConditions: strategy.exitConditions.map(c => {
              if (optParamA === "profit_target" && c.type === "profit_target") return { ...c, param: a };
              if (optParamB === "stop_loss" && c.type === "stop_loss") return { ...c, param: b };
              if (optParamB === "stop_loss" && c.type === "trailing_stop") return { ...c, param: b };
              if (optParamB === "time_exit" && c.type === "time_exit") return { ...c, param: b };
              return c;
            }),
          };
          const r = runLabBacktest(modified, generateLabBars(SEED + Math.floor(a * 10 + b), 1000));
          results.push({ paramA: a, paramB: b, sharpe: r.sharpe, totalReturn: r.totalReturn, winRate: r.winRate });
        }
      }
      setOptResults(results);
      setIsOptimizing(false);
    }, 700);
  }, [strategy, optParamA, optParamB]);

  const handleRunMC = useCallback(() => {
    if (!result || result.trades.length < 3) return;
    setIsRunningMC(true);
    setTimeout(() => {
      const rand = mulberry32(SEED + 999);
      const tradeReturns = result.trades.map(t => t.pnlPct);
      const N_SIM = 500;
      const N_STEPS = 50;
      const sims: number[][] = [];
      const finalVals: number[] = [];

      for (let sim = 0; sim < N_SIM; sim++) {
        const shuffled = [...tradeReturns].sort(() => rand() - 0.5);
        const curve: number[] = [10000];
        let cap = 10000;
        for (let step = 0; step < N_STEPS; step++) {
          const trIdx = step % shuffled.length;
          cap = cap * (1 + shuffled[trIdx] * 0.5);
          // resample noise
          cap *= 1 + (rand() - 0.5) * 0.004;
          curve.push(Math.max(100, cap));
        }
        sims.push(curve);
        finalVals.push(cap);
      }

      setMcSimulations(sims);
      setMcFinalValues(finalVals);
      setIsRunningMC(false);
    }, 800);
  }, [result]);

  // ── Paper trading signals ───────────────────────────────────────────────────

  useEffect(() => {
    if (section !== "paper") return;

    const rand = mulberry32(SEED + signalRef.current * 137);

    function generateSignals(): LiveSignal[] {
      const r = mulberry32(SEED + signalRef.current * 31 + Date.now() % 1000);
      const now = new Date();
      return Array.from({ length: 5 }, (_, i) => {
        const ticker = TICKERS[Math.floor(r() * TICKERS.length)];
        const signalTypes = ["RSI Oversold", "MACD Cross", "Volume Spike", "BB Touch", "MA Cross"];
        const conditions = [
          "RSI(14) < 30, Price > MA(200)",
          "MACD crossed signal on surge",
          `Volume ${(r() * 2 + 1.5).toFixed(1)}× avg`,
          "Price at Bollinger lower band",
          "Price crossed above MA(50)",
        ];
        const basePrice = 100 + r() * 300;
        const t = new Date(now.getTime() - i * 18000 - r() * 60000);
        return {
          id: `sig_${signalRef.current}_${i}`,
          ticker,
          signalType: signalTypes[Math.floor(r() * signalTypes.length)],
          condition: conditions[Math.floor(r() * conditions.length)],
          time: t.toLocaleTimeString(),
          suggestedEntry: parseFloat(basePrice.toFixed(2)),
        };
      });
    }

    // Generate daily P&L (last 20 days)
    const dPnL: DailyPnL[] = [];
    for (let d = 0; d < 20; d++) {
      dPnL.push({
        day: d,
        strategy: (rand() - 0.47) * 0.03,
        benchmark: (rand() - 0.48) * 0.02,
      });
    }
    setDailyPnL(dPnL);
    setLiveSignals(generateSignals());

    const interval = setInterval(() => {
      signalRef.current += 1;
      setLiveSignals(generateSignals());
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ── Derivations ─────────────────────────────────────────────────────────────

  const description = useMemo(() => buildStrategyDescription(strategy), [strategy]);

  const paramALabels: Record<string, string> = {
    rsi_period: "RSI Threshold",
    volume_mult: "Volume Mult",
    profit_target: "Profit Target%",
  };
  const paramBLabels: Record<string, string> = {
    stop_loss: "Stop Loss%",
    time_exit: "Time Exit (bars)",
    ma_period: "MA Period",
  };
  const paramAVals: Record<string, number[]> = {
    rsi_period: [10, 15, 20, 25, 30],
    volume_mult: [1.2, 1.5, 2.0, 2.5, 3.0],
    profit_target: [4, 6, 8, 10, 12],
  };
  const paramBVals: Record<string, number[]> = {
    stop_loss: [2, 3, 4, 5, 6],
    time_exit: [10, 15, 20, 30, 40],
    ma_period: [20, 50, 100, 150, 200],
  };

  const bestOptIdx = useMemo(() => {
    if (!optResults) return -1;
    let best = -1, bestSharpe = -Infinity;
    optResults.forEach((r, i) => { if (r.sharpe > bestSharpe) { bestSharpe = r.sharpe; best = i; } });
    return best;
  }, [optResults]);

  // Walk-forward: 70/30 split
  const wfInSample = useMemo(() => runLabBacktest(strategy, bars.slice(0, Math.floor(bars.length * 0.7))), [strategy, bars]);
  const wfOutSample = useMemo(() => runLabBacktest(strategy, bars.slice(Math.floor(bars.length * 0.7))), [strategy, bars]);

  // MC risk metrics
  const mcRisk = useMemo(() => {
    if (!mcFinalValues || mcFinalValues.length === 0) return null;
    const sorted = [...mcFinalValues].sort((a, b) => a - b);
    const pctPositive = mcFinalValues.filter(v => v > 10000).length / mcFinalValues.length;
    const worstP5 = sorted[Math.floor(sorted.length * 0.05)];
    const pct20dd = mcFinalValues.filter(v => v < 10000 * 0.8).length / mcFinalValues.length;
    return { pctPositive, worstP5, pct20dd };
  }, [mcFinalValues]);

  // P&L attribution
  const attribution = useMemo(() => {
    if (!dailyPnL.length) return null;
    const strategyTotal = dailyPnL.reduce((a, d) => a + d.strategy, 0);
    const benchmarkTotal = dailyPnL.reduce((a, d) => a + d.benchmark, 0);
    const alpha = strategyTotal - benchmarkTotal;
    return { strategyTotal, benchmarkTotal, alpha };
  }, [dailyPnL]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function addEntry() {
    if (strategy.entryConditions.length >= 3) return;
    setStrategy(s => ({
      ...s, entryConditions: [...s.entryConditions, { id: `e${Date.now()}`, type: "rsi_lt", param: 30 }],
    }));
  }
  function addExit() {
    if (strategy.exitConditions.length >= 2) return;
    setStrategy(s => ({
      ...s, exitConditions: [...s.exitConditions, { id: `x${Date.now()}`, type: "profit_target", param: 8 }],
    }));
  }
  function removeEntry(id: string) { setStrategy(s => ({ ...s, entryConditions: s.entryConditions.filter(c => c.id !== id) })); }
  function removeExit(id: string) { setStrategy(s => ({ ...s, exitConditions: s.exitConditions.filter(c => c.id !== id) })); }
  function updateEntry(c: LabCondition) { setStrategy(s => ({ ...s, entryConditions: s.entryConditions.map(x => x.id === c.id ? c : x) })); }
  function updateExit(c: LabCondition) { setStrategy(s => ({ ...s, exitConditions: s.exitConditions.map(x => x.id === c.id ? c : x) })); }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">
      {/* Sub-tab bar */}
      <div className="flex gap-0 border-b border-white/5 bg-black/10 overflow-x-auto shrink-0">
        {LAB_SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors",
              section === s.id
                ? "border-b-2 border-violet-500 text-violet-300"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
        <div className="ml-auto flex items-center pr-3 gap-3">
          {result && (
            <Badge className={cn("text-[10px]", result.totalReturn >= 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400")}>
              {result.totalReturn >= 0 ? "+" : ""}{(result.totalReturn * 100).toFixed(1)}% | {result.totalTrades} trades
            </Badge>
          )}
        </div>
      </div>

      {/* ── Section 1: Strategy Builder ── */}
      {section === "builder" && (
        <div className="p-6 space-y-6">
          {/* Preset pills */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Preset Strategies</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => handleLoadPreset(p)}
                  className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
                  title={p.description}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy name + run */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Strategy Name</label>
              <input
                value={strategy.name}
                onChange={e => setStrategy(s => ({ ...s, name: e.target.value }))}
                className="w-full max-w-xs rounded-md border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <Button
              onClick={handleRunBacktest}
              disabled={isRunning || strategy.entryConditions.length === 0}
              className="bg-violet-600 hover:bg-violet-500 text-white shrink-0 flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5" />
              {isRunning ? "Running..." : "Run Backtest (1000 bars)"}
            </Button>
          </div>

          {/* Main builder grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Entry conditions */}
            <Card className="border-white/8 bg-zinc-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Entry Rules</h3>
                <Badge className="text-[9px] bg-zinc-800 text-zinc-400">up to 3</Badge>
              </div>
              <div className="space-y-2">
                {strategy.entryConditions.map(c => (
                  <ConditionRow
                    key={c.id}
                    condition={c}
                    options={ENTRY_TYPES}
                    onChange={updateEntry}
                    onRemove={() => removeEntry(c.id)}
                  />
                ))}
              </div>
              {strategy.entryConditions.length < 3 && (
                <button onClick={addEntry} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Plus className="h-3 w-3" /> Add condition
                </button>
              )}
              <div className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0" /> All conditions must match (AND logic)
              </div>
            </Card>

            {/* Exit conditions */}
            <Card className="border-white/8 bg-zinc-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Exit Rules</h3>
                <Badge className="text-[9px] bg-zinc-800 text-zinc-400">up to 2</Badge>
              </div>
              <div className="space-y-2">
                {strategy.exitConditions.map(c => (
                  <ConditionRow
                    key={c.id}
                    condition={c}
                    options={EXIT_TYPES}
                    onChange={updateExit}
                    onRemove={() => removeExit(c.id)}
                  />
                ))}
              </div>
              {strategy.exitConditions.length < 2 && (
                <button onClick={addExit} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Plus className="h-3 w-3" /> Add condition
                </button>
              )}
              <div className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0" /> First matching condition exits (OR logic)
              </div>
            </Card>

            {/* Position sizing + risk */}
            <Card className="border-white/8 bg-zinc-900/50 p-4 space-y-4">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Sizing & Risk</h3>
              <div className="space-y-2">
                {([
                  { v: "fixed_dollar", label: "Fixed $ Amount" },
                  { v: "pct_portfolio", label: "% of Portfolio" },
                  { v: "kelly", label: "Kelly Fraction" },
                  { v: "fixed_shares", label: "Fixed Shares" },
                ] as { v: SizingType; label: string }[]).map(opt => (
                  <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="lab-sizing" value={opt.v}
                      checked={strategy.sizing === opt.v}
                      onChange={() => setStrategy(s => ({ ...s, sizing: opt.v }))}
                      className="accent-violet-500" />
                    <span className="text-xs text-zinc-300">{opt.label}</span>
                  </label>
                ))}
              </div>
              {strategy.sizing !== "kelly" && (
                <div>
                  <label className="mb-1 block text-[10px] text-zinc-500">
                    {strategy.sizing === "fixed_dollar" ? "Amount ($)" : strategy.sizing === "pct_portfolio" ? "Portfolio %" : "Shares"}
                  </label>
                  <input
                    type="number"
                    value={strategy.sizingValue}
                    onChange={e => setStrategy(s => ({ ...s, sizingValue: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              )}
              <div className="space-y-2 pt-1 border-t border-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Risk Rules</p>
                {[
                  { key: "maxPositionPct", label: "Max position size (%)", min: 1, max: 100 },
                  { key: "maxPortfolioRiskPct", label: "Max portfolio risk (%)", min: 0.1, max: 10 },
                  { key: "maxDrawdownStop", label: "Max drawdown stop (%)", min: 1, max: 50 },
                ].map(({ key, label, min, max }) => (
                  <div key={key}>
                    <label className="mb-0.5 block text-[10px] text-zinc-500">{label}</label>
                    <input
                      type="number" min={min} max={max}
                      value={strategy.riskRules[key as keyof RiskRules]}
                      onChange={e => setStrategy(s => ({
                        ...s, riskRules: { ...s.riskRules, [key]: parseFloat(e.target.value) || 0 },
                      }))}
                      className="w-full rounded border border-white/10 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Strategy description */}
          <Card className="border-white/8 bg-zinc-900/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Strategy Logic</p>
            <p className="text-sm text-zinc-200 leading-relaxed">{description}</p>
          </Card>
        </div>
      )}

      {/* ── Section 2: Backtest Results ── */}
      {section === "results" && (
        <div className="p-6 space-y-6">
          {!result ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-zinc-500">
              <Activity className="h-12 w-12 opacity-20" />
              <p className="text-sm">No results yet. Build a strategy and click Run Backtest.</p>
              <Button variant="outline" className="text-xs" onClick={() => setSection("builder")}>
                Go to Builder
              </Button>
            </div>
          ) : (
            <>
              {/* Metrics grid */}
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Performance Metrics</p>
                <div className="flex flex-wrap gap-2">
                  <LabMetric label="Total Return" value={`${result.totalReturn >= 0 ? "+" : ""}${(result.totalReturn * 100).toFixed(1)}%`} positive={result.totalReturn >= 0} />
                  <LabMetric label="CAGR" value={`${result.cagr >= 0 ? "+" : ""}${(result.cagr * 100).toFixed(1)}%`} positive={result.cagr >= 0} sub="annualized" />
                  <LabMetric label="Sharpe" value={result.sharpe.toFixed(2)} positive={result.sharpe >= 1} sub="risk-adj" />
                  <LabMetric label="Sortino" value={result.sortino.toFixed(2)} positive={result.sortino >= 1} sub="downside" />
                  <LabMetric label="Calmar" value={result.calmar.toFixed(2)} positive={result.calmar >= 0.5} sub="cagr/MDD" />
                  <LabMetric label="Max Drawdown" value={`-${(result.maxDrawdown * 100).toFixed(1)}%`} positive={false} />
                  <LabMetric label="Avg Drawdown" value={`-${(result.avgDrawdown * 100).toFixed(2)}%`} />
                  <LabMetric label="Recovery Factor" value={result.recoveryFactor.toFixed(2)} positive={result.recoveryFactor >= 1} />
                  <LabMetric label="Win Rate" value={`${(result.winRate * 100).toFixed(1)}%`} positive={result.winRate >= 0.5} />
                  <LabMetric label="Avg Win" value={`+${(result.avgWin * 100).toFixed(1)}%`} positive />
                  <LabMetric label="Avg Loss" value={`${(result.avgLoss * 100).toFixed(1)}%`} positive={false} />
                  <LabMetric label="Profit Factor" value={result.profitFactor > 99 ? "∞" : result.profitFactor.toFixed(2)} positive={result.profitFactor >= 1.5} />
                  <LabMetric label="Expectancy" value={`${result.expectancy >= 0 ? "+" : ""}${(result.expectancy * 100).toFixed(2)}%`} positive={result.expectancy >= 0} sub="per trade" />
                  <LabMetric label="Total Trades" value={String(result.totalTrades)} />
                  <LabMetric label="Avg Hold" value={`${result.avgHoldingPeriod.toFixed(1)} bars`} sub="period" />
                  <LabMetric label="Commission Drag" value={`-${(result.commissionDrag * 100).toFixed(2)}%`} positive={false} sub="0.1%/trade" />
                  <LabMetric label="vs Buy & Hold" value={`${result.totalReturn >= result.buyAndHold ? "+" : ""}${((result.totalReturn - result.buyAndHold) * 100).toFixed(1)}%`} positive={result.totalReturn >= result.buyAndHold} />
                </div>
              </div>

              {/* Equity curve */}
              <Card className="border-white/8 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Equity Curve</h3>
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-blue-500" /> Strategy</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-zinc-600" style={{ borderTop: "1px dashed" }} /> B&H</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500/50" /> Drawdown</span>
                  </div>
                </div>
                <LabEquityCurve result={result} />
              </Card>

              {/* Trade log */}
              <Card className="border-white/8 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Trade Log ({result.trades.length} trades, showing first 20)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/8 text-left text-zinc-500">
                        <th className="pb-2 pr-3 font-medium">#</th>
                        <th className="pb-2 pr-3 font-medium">Entry Bar</th>
                        <th className="pb-2 pr-3 font-medium">Entry $</th>
                        <th className="pb-2 pr-3 font-medium">Exit Bar</th>
                        <th className="pb-2 pr-3 font-medium">Exit $</th>
                        <th className="pb-2 pr-3 font-medium">Hold</th>
                        <th className="pb-2 pr-3 font-medium">P&L %</th>
                        <th className="pb-2 font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.trades.slice(0, 20).map((t, i) => (
                        <tr key={i} className="border-b border-white/4 hover:bg-white/2">
                          <td className="py-1.5 pr-3 text-zinc-500">{i + 1}</td>
                          <td className="py-1.5 pr-3 text-zinc-400">{t.entryBar}</td>
                          <td className="py-1.5 pr-3 text-zinc-300">${t.entryPrice.toFixed(2)}</td>
                          <td className="py-1.5 pr-3 text-zinc-400">{t.exitBar}</td>
                          <td className="py-1.5 pr-3 text-zinc-300">${t.exitPrice.toFixed(2)}</td>
                          <td className="py-1.5 pr-3 text-zinc-500">{t.holdingBars}b</td>
                          <td className={cn("py-1.5 pr-3 font-semibold", t.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                            {t.pnlPct >= 0 ? "+" : ""}{(t.pnlPct * 100).toFixed(1)}%
                          </td>
                          <td className="py-1.5 text-zinc-500">{t.exitReason}</td>
                        </tr>
                      ))}
                      {result.trades.length === 0 && (
                        <tr><td colSpan={8} className="py-4 text-center text-zinc-600">No trades generated</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Section 3: Optimization ── */}
      {section === "optimization" && (
        <div className="p-6 space-y-6">
          {/* Controls */}
          <Card className="border-white/8 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Parameter Sweep (5×5 = 25 combinations)</h3>
            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <label className="mb-1 block text-[10px] text-zinc-500">Parameter A (rows)</label>
                <select value={optParamA} onChange={e => setOptParamA(e.target.value as typeof optParamA)}
                  className="w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 outline-none">
                  <option value="rsi_period">RSI Threshold (10–30)</option>
                  <option value="volume_mult">Volume Multiplier (1.2–3.0)</option>
                  <option value="profit_target">Profit Target % (4–12)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-zinc-500">Parameter B (columns)</label>
                <select value={optParamB} onChange={e => setOptParamB(e.target.value as typeof optParamB)}
                  className="w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 outline-none">
                  <option value="stop_loss">Stop Loss % (2–6)</option>
                  <option value="time_exit">Time Exit Bars (10–40)</option>
                  <option value="ma_period">MA Period (20–200)</option>
                </select>
              </div>
              <Button onClick={handleRunOptimization} disabled={isOptimizing}
                className="bg-violet-600 hover:bg-violet-500 text-white text-xs">
                {isOptimizing ? "Optimizing..." : "Run 25 Backtests"}
              </Button>
            </div>

            {optResults && (
              <div className="space-y-3">
                <OptimHeatmap
                  results={optResults}
                  paramAVals={paramAVals[optParamA]}
                  paramBVals={paramBVals[optParamB]}
                  paramALabel={paramALabels[optParamA]}
                  paramBLabel={paramBLabels[optParamB]}
                  bestIdx={bestOptIdx}
                />
                {bestOptIdx >= 0 && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block h-3 w-3 rounded-sm border-2 border-yellow-400" />
                    <span className="text-zinc-400">
                      Best: {paramALabels[optParamA]}={optResults[bestOptIdx].paramA}, {paramBLabels[optParamB]}={optResults[bestOptIdx].paramB} — Sharpe {optResults[bestOptIdx].sharpe.toFixed(2)}, Return {(optResults[bestOptIdx].totalReturn * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Overfitting warning */}
          <Card className="border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300">Overfitting Warning</h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Best in-sample parameters may not generalize to live trading. The more parameters you optimize,
                  the higher the overfitting risk. Always validate on out-of-sample data before allocating capital.
                  Consider reducing strategy complexity if in-sample Sharpe is significantly higher than OOS.
                </p>
              </div>
            </div>
          </Card>

          {/* Walk-forward 70/30 */}
          <Card className="border-white/8 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Walk-Forward Analysis — 70% Train / 30% Out-of-Sample</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "In-Sample (700 bars)", r: wfInSample },
                { label: "Out-of-Sample (300 bars)", r: wfOutSample },
              ].map(({ label, r }) => (
                <div key={label} className="rounded-md border border-white/8 bg-zinc-900/60 p-3 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
                  {[
                    { l: "Return", v: `${(r.totalReturn * 100).toFixed(1)}%`, pos: r.totalReturn >= 0 },
                    { l: "CAGR", v: `${(r.cagr * 100).toFixed(1)}%`, pos: r.cagr >= 0 },
                    { l: "Sharpe", v: r.sharpe.toFixed(2), pos: r.sharpe >= 1 },
                    { l: "Max DD", v: `-${(r.maxDrawdown * 100).toFixed(1)}%`, pos: false },
                    { l: "Win Rate", v: `${(r.winRate * 100).toFixed(0)}%`, pos: r.winRate >= 0.5 },
                    { l: "Trades", v: String(r.totalTrades), pos: undefined },
                  ].map(({ l, v, pos }) => (
                    <div key={l} className="flex justify-between text-xs">
                      <span className="text-zinc-500">{l}</span>
                      <span className={cn("font-semibold", pos === true ? "text-green-400" : pos === false ? "text-red-400" : "text-zinc-300")}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {wfInSample.sharpe > 0 && wfOutSample.sharpe < wfInSample.sharpe * 0.5 && (
              <div className="flex items-center gap-2 text-[11px] text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                OOS Sharpe dropped {((1 - wfOutSample.sharpe / wfInSample.sharpe) * 100).toFixed(0)}% vs in-sample — possible overfitting.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Section 4: Monte Carlo ── */}
      {section === "montecarlo" && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Monte Carlo Analysis</h3>
              <p className="text-xs text-zinc-500 mt-0.5">500 simulations by shuffling trade returns. Requires backtest results.</p>
            </div>
            <Button
              onClick={handleRunMC}
              disabled={isRunningMC || !result || result.trades.length < 3}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs flex items-center gap-2"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRunningMC && "animate-spin")} />
              {isRunningMC ? "Simulating..." : "Run 500 Simulations"}
            </Button>
          </div>

          {!result && (
            <Card className="border-white/8 bg-zinc-900/40 p-8 text-center">
              <p className="text-zinc-500 text-sm">Run a backtest first to enable Monte Carlo analysis.</p>
              <Button variant="outline" className="mt-4 text-xs" onClick={() => setSection("builder")}>Go to Builder</Button>
            </Card>
          )}

          {result && !mcSimulations && !isRunningMC && (
            <Card className="border-white/8 bg-zinc-900/40 p-8 text-center">
              <p className="text-zinc-500 text-sm">Click "Run 500 Simulations" to generate Monte Carlo analysis.</p>
            </Card>
          )}

          {mcSimulations && mcFinalValues && mcRisk && (
            <>
              {/* Fan chart */}
              <Card className="border-white/8 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wide">Equity Fan Chart — 500 Paths</h3>
                <MonteCarloFan simulations={mcSimulations} buyAndHold={result?.buyAndHold ?? 0} />
              </Card>

              {/* Risk metrics */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-white/8 bg-zinc-900/50 p-4 text-center space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Prob. of Positive Returns</p>
                  <p className={cn("text-2xl font-black tabular-nums", mcRisk.pctPositive >= 0.5 ? "text-green-400" : "text-red-400")}>
                    {(mcRisk.pctPositive * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-zinc-600">of 500 paths end profitable</p>
                </Card>
                <Card className="border-white/8 bg-zinc-900/50 p-4 text-center space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Worst-Case P5 (5th pct)</p>
                  <p className={cn("text-2xl font-black tabular-nums", mcRisk.worstP5 >= 10000 ? "text-green-400" : "text-red-400")}>
                    ${mcRisk.worstP5.toFixed(0)}
                  </p>
                  <p className="text-[10px] text-zinc-600">on $10,000 start</p>
                </Card>
                <Card className="border-white/8 bg-zinc-900/50 p-4 text-center space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Prob. of 20%+ Drawdown</p>
                  <p className={cn("text-2xl font-black tabular-nums", mcRisk.pct20dd <= 0.2 ? "text-green-400" : "text-red-400")}>
                    {(mcRisk.pct20dd * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-zinc-600">equity falls below $8,000</p>
                </Card>
              </div>

              {/* Final value histogram */}
              <Card className="border-white/8 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wide">Distribution of Final Portfolio Values</h3>
                <OutcomeHistogram finalValues={mcFinalValues} />
                <div className="flex gap-4 mt-2 text-[10px]">
                  {[
                    { label: "Median", val: [...mcFinalValues].sort((a, b) => a - b)[Math.floor(mcFinalValues.length * 0.5)], color: "text-yellow-400" },
                    { label: "P5 (worst)", val: [...mcFinalValues].sort((a, b) => a - b)[Math.floor(mcFinalValues.length * 0.05)], color: "text-red-400" },
                    { label: "P95 (best)", val: [...mcFinalValues].sort((a, b) => a - b)[Math.floor(mcFinalValues.length * 0.95)], color: "text-green-400" },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <span className="text-zinc-500">{label}: </span>
                      <span className={cn("font-semibold", color)}>${val.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Section 5: Live Paper Trading ── */}
      {section === "paper" && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Live Paper Trading</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Synthetic signals refresh every 5 seconds. Not real data.</p>
            </div>
            <Badge className="bg-green-500/15 text-green-400 text-[10px] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live
            </Badge>
          </div>

          {/* Current signals table */}
          <Card className="border-white/8 bg-zinc-900/50 p-4">
            <h3 className="mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wide">Recent Signals (last 20)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/8 text-left text-zinc-500">
                    <th className="pb-2 pr-4 font-medium">Ticker</th>
                    <th className="pb-2 pr-4 font-medium">Signal</th>
                    <th className="pb-2 pr-4 font-medium">Condition</th>
                    <th className="pb-2 pr-4 font-medium">Time</th>
                    <th className="pb-2 font-medium">Suggested Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {liveSignals.map((sig, i) => (
                    <tr key={sig.id} className="border-b border-white/4 hover:bg-white/2">
                      <td className="py-1.5 pr-4">
                        <span className="font-bold text-zinc-200">{sig.ticker}</span>
                      </td>
                      <td className="py-1.5 pr-4">
                        <Badge className="text-[9px] bg-violet-500/15 text-violet-300">{sig.signalType}</Badge>
                      </td>
                      <td className="py-1.5 pr-4 text-zinc-400">{sig.condition}</td>
                      <td className="py-1.5 pr-4 text-zinc-500">{sig.time}</td>
                      <td className="py-1.5 font-semibold text-zinc-200">${sig.suggestedEntry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* P&L attribution */}
          {attribution && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-white/8 bg-zinc-900/50 p-4 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Strategy P&L (20d)</p>
                <p className={cn("text-2xl font-black tabular-nums", attribution.strategyTotal >= 0 ? "text-green-400" : "text-red-400")}>
                  {attribution.strategyTotal >= 0 ? "+" : ""}{(attribution.strategyTotal * 100).toFixed(2)}%
                </p>
              </Card>
              <Card className="border-white/8 bg-zinc-900/50 p-4 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">SPY Benchmark (20d)</p>
                <p className={cn("text-2xl font-black tabular-nums", attribution.benchmarkTotal >= 0 ? "text-zinc-300" : "text-red-400")}>
                  {attribution.benchmarkTotal >= 0 ? "+" : ""}{(attribution.benchmarkTotal * 100).toFixed(2)}%
                </p>
              </Card>
              <Card className={cn("p-4 text-center", attribution.alpha >= 0 ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5")}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Alpha (vs SPY)</p>
                <p className={cn("text-2xl font-black tabular-nums", attribution.alpha >= 0 ? "text-green-400" : "text-red-400")}>
                  {attribution.alpha >= 0 ? "+" : ""}{(attribution.alpha * 100).toFixed(2)}%
                </p>
              </Card>
            </div>
          )}

          {/* Daily P&L bar chart */}
          {dailyPnL.length > 0 && (
            <Card className="border-white/8 bg-zinc-900/50 p-4">
              <h3 className="mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wide">Daily P&L — Last 20 Days (Strategy vs SPY)</h3>
              <DailyPnLChart days={dailyPnL} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
