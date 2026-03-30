/**
 * event-backtest.ts
 *
 * Runs trading strategies against historical crisis events to show how each
 * strategy would have performed during the crash, trough, and recovery.
 */

import { BACKTEST_STRATEGIES, type StrategyId } from "@/services/backtest/strategies";

// ── Mulberry32 PRNG ───────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── CandleData (lightweight, used only in this module) ────────────────────

export interface CandleData {
  bar: number; // 0-based index
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Event price series definition ─────────────────────────────────────────

export interface BacktestEvent {
  id: string;
  name: string;
  /** Short human-readable description of what happened */
  description: string;
  /** % drawdown at the worst point (negative number, e.g. -34) */
  crashPercent: number;
  /** Calendar days for full price recovery */
  recoveryDays: number;
  /** Base volatility during normal pre-event period (e.g. 0.015 = 1.5%/day) */
  normalVol: number;
  /** Volatility multiplier during the crash bars */
  crisisVolMult: number;
  /** Seed for deterministic PRNG */
  seed: number;
}

/** Built-in crisis events aligned with historical-events.ts */
export const BACKTEST_EVENTS: BacktestEvent[] = [
  {
    id: "brexit-2016",
    name: "Brexit Referendum (2016)",
    description: "GBP/USD fell 11% in a single day as 'Leave' unexpectedly won",
    crashPercent: -11,
    recoveryDays: 90,
    normalVol: 0.008,
    crisisVolMult: 4.5,
    seed: 0x1a2b3c4d,
  },
  {
    id: "covid-crash-2020",
    name: "COVID-19 Crash (2020)",
    description: "S&P 500 lost 34% in 33 days — fastest bear market in history",
    crashPercent: -34,
    recoveryDays: 150,
    normalVol: 0.015,
    crisisVolMult: 5.5,
    seed: 0x2c3d4e5f,
  },
  {
    id: "svb-collapse-2023",
    name: "SVB Bank Collapse (2023)",
    description: "Regional banks fell 36% in two weeks on deposit-run contagion",
    crashPercent: -36,
    recoveryDays: 180,
    normalVol: 0.02,
    crisisVolMult: 4.0,
    seed: 0x3d4e5f60,
  },
  {
    id: "bear-market-2022",
    name: "2022 Rate-Hike Bear Market",
    description: "Nasdaq fell 36% as the Fed hiked 425bps — worst since 2008",
    crashPercent: -36,
    recoveryDays: 365,
    normalVol: 0.022,
    crisisVolMult: 2.5,
    seed: 0x7182a3b4,
  },
  {
    id: "gamestop-2021",
    name: "GameStop Short Squeeze (2021)",
    description: "GME surged 2,315% then collapsed — extreme two-sided volatility",
    crashPercent: -77,
    recoveryDays: 30,
    normalVol: 0.12,
    crisisVolMult: 3.5,
    seed: 0x607182a3,
  },
  {
    id: "fed-pivot-2024",
    name: "Fed Rate Cut Pivot (2024)",
    description: "Long bonds rallied 13% in anticipation of the first 50bps cut",
    crashPercent: -5,
    recoveryDays: 60,
    normalVol: 0.01,
    crisisVolMult: 1.8,
    seed: 0x4e5f6071,
  },
  {
    id: "flash-crash-2010",
    name: "Flash Crash (2010)",
    description: "Dow lost 9% in minutes on an algorithmic cascade; recovered same day",
    crashPercent: -9,
    recoveryDays: 3,
    normalVol: 0.012,
    crisisVolMult: 8.0,
    seed: 0xaabbccdd,
  },
  {
    id: "nvidia-ai-boom-2023",
    name: "Nvidia AI Boom (2023-24)",
    description: "NVDA rose 533% in 15 months; pullbacks were sharp but brief",
    crashPercent: -25,
    recoveryDays: 45,
    normalVol: 0.028,
    crisisVolMult: 2.0,
    seed: 0x8293a4b5,
  },
];

// ── Price series generator ────────────────────────────────────────────────

/**
 * Generates a three-phase price series for a crisis event:
 *  Phase 1 — PRE (30 bars):  calm trending, slight up-drift, normal vol
 *  Phase 2 — CRASH (8 bars): rapid decline toward crashPercent, elevated vol
 *  Phase 3 — RECOVERY (25 bars): Brownian bridge back toward startPrice * recoveryFactor
 *
 * Total: 63 bars
 */
export function generateEventPriceSeries(
  event: BacktestEvent,
  startPrice = 100,
): CandleData[] {
  const rng = mulberry32(event.seed);

  const PRE_BARS = 30;
  const CRASH_BARS = 8;
  const RECOVERY_BARS = 25;
  const TOTAL = PRE_BARS + CRASH_BARS + RECOVERY_BARS;

  const bars: CandleData[] = [];
  let price = startPrice;

  // Slight pre-event drift (slightly bullish)
  const preDrift = 0.0003;

  // ── Phase 1: Pre-event normal bars ─────────────────────────────────────
  for (let i = 0; i < PRE_BARS; i++) {
    const shock = (rng() - 0.5) * 2 * event.normalVol;
    const open = price;
    price = price * Math.exp(preDrift + shock);
    const amplitude = Math.abs(open - price) + price * event.normalVol * rng() * 0.3;
    const high = Math.max(open, price) + amplitude * rng() * 0.5;
    const low = Math.min(open, price) - amplitude * rng() * 0.5;
    const volume = Math.round(1_000_000 * (0.7 + rng() * 0.6));
    bars.push({ bar: i, open: +open.toFixed(4), high: +high.toFixed(4), low: +low.toFixed(4), close: +price.toFixed(4), volume });
  }

  // ── Phase 2: Crash bars ─────────────────────────────────────────────────
  const crashTarget = startPrice * (1 + event.crashPercent / 100);
  // Brownian bridge toward crash target
  const preCrashPrice = price;
  const logDiff = Math.log(crashTarget / preCrashPrice);
  let crashPrice = preCrashPrice;

  for (let i = 0; i < CRASH_BARS; i++) {
    const remaining = CRASH_BARS - i;
    const bridgePull = (logDiff - Math.log(crashPrice / preCrashPrice)) / remaining;
    const shock = (rng() - 0.5) * 2 * event.normalVol * event.crisisVolMult;
    const logReturn = bridgePull * 0.75 + shock;
    const open = crashPrice;
    crashPrice = crashPrice * Math.exp(logReturn);
    const amplitude =
      Math.abs(open - crashPrice) + crashPrice * event.normalVol * event.crisisVolMult * rng() * 0.4;
    const high = Math.max(open, crashPrice) + amplitude * rng() * 0.3;
    const low = Math.min(open, crashPrice) - amplitude * rng() * 0.5;
    // Panic volume: 3–8x normal
    const volume = Math.round(1_000_000 * (3 + rng() * 5));
    bars.push({
      bar: PRE_BARS + i,
      open: +open.toFixed(4),
      high: +high.toFixed(4),
      low: +low.toFixed(4),
      close: +crashPrice.toFixed(4),
      volume,
    });
  }

  // ── Phase 3: Recovery bars ──────────────────────────────────────────────
  // Recovery target: startPrice * (1 + crashPercent*0.6) — partial recovery
  // For GME-style events the crash is the top; recovery is just normalisation
  const recoveryFraction = Math.min(0.85, Math.max(0.3, 150 / Math.max(event.recoveryDays, 1)));
  const recoveryTarget = crashTarget + (startPrice - crashTarget) * recoveryFraction;
  let recPrice = crashPrice;
  const logRecovery = Math.log(recoveryTarget / crashPrice);

  for (let i = 0; i < RECOVERY_BARS; i++) {
    const remaining = RECOVERY_BARS - i;
    const bridgePull = (logRecovery - Math.log(recPrice / crashPrice)) / remaining;
    const shock = (rng() - 0.5) * 2 * event.normalVol * (1 + event.crisisVolMult * 0.3);
    const logReturn = bridgePull * 0.5 + shock;
    const open = recPrice;
    recPrice = recPrice * Math.exp(logReturn);
    const amplitude =
      Math.abs(open - recPrice) + recPrice * event.normalVol * rng() * 0.4;
    const high = Math.max(open, recPrice) + amplitude * rng() * 0.4;
    const low = Math.min(open, recPrice) - amplitude * rng() * 0.4;
    const volume = Math.round(1_000_000 * (1.2 + rng() * 1.5));
    bars.push({
      bar: PRE_BARS + CRASH_BARS + i,
      open: +open.toFixed(4),
      high: +high.toFixed(4),
      low: +low.toFixed(4),
      close: +recPrice.toFixed(4),
      volume,
    });
  }

  return bars;
}

// ── Strategy signal helpers ───────────────────────────────────────────────

function sma(prices: number[], period: number, i: number): number {
  if (i < period - 1) return prices[i];
  let sum = 0;
  for (let k = i - period + 1; k <= i; k++) sum += prices[k];
  return sum / period;
}

function rollingStd(prices: number[], period: number, i: number): number {
  if (i < period - 1) return 0;
  const mean = sma(prices, period, i);
  let sq = 0;
  for (let k = i - period + 1; k <= i; k++) sq += (prices[k] - mean) ** 2;
  return Math.sqrt(sq / period);
}

function buildEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result = new Array(prices.length).fill(0);
  result[0] = prices[0];
  for (let i = 1; i < prices.length; i++) {
    result[i] = prices[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

function buildATR(prices: number[], period: number): number[] {
  const trs: number[] = [0];
  for (let i = 1; i < prices.length; i++) trs.push(Math.abs(prices[i] - prices[i - 1]));
  const atr = new Array(prices.length).fill(0);
  let sum = 0;
  for (let i = 1; i <= period && i < prices.length; i++) sum += trs[i];
  if (period < prices.length) atr[period] = sum / period;
  for (let i = period + 1; i < prices.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + trs[i]) / period;
  }
  return atr;
}

function buildZScore(prices: number[], period: number): number[] {
  const z = new Array(prices.length).fill(0);
  for (let i = period - 1; i < prices.length; i++) {
    const mean = sma(prices, period, i);
    const std = rollingStd(prices, period, i);
    z[i] = std > 0 ? (prices[i] - mean) / std : 0;
  }
  return z;
}

// ── Trade record ──────────────────────────────────────────────────────────

interface EventTrade {
  entryBar: number;
  exitBar: number;
  entryPrice: number;
  exitPrice: number;
  pnlPct: number;
}

// ── Result types ──────────────────────────────────────────────────────────

export interface EventStrategyResult {
  strategyId: StrategyId;
  strategyName: string;
  /** Price at which the strategy first entered (or NaN if it never entered) */
  entryPrice: number;
  /** Entry bar index (relative to generateEventPriceSeries output) */
  entryBar: number;
  /** Max drawdown % measured from entry to worst bar during the event */
  maxDrawdownFromEntry: number;
  /** Bar at which maximum drawdown was measured */
  maxDrawdownBar: number;
  /** Recovery bar index (first bar above entry price after crash) or -1 */
  recoveryBar: number;
  /** Final P&L % (cash at end vs cash at start relative to first trade) */
  finalPnlPct: number;
  /** Number of trades executed */
  tradeCount: number;
  /** Individual trades */
  trades: EventTrade[];
  /** Equity curve (bar → capital, starting at 10000) */
  equityCurve: { bar: number; equity: number }[];
  /** Letter grade based on finalPnlPct vs crash severity */
  grade: "A" | "B" | "C" | "D" | "F";
}

export interface EventBacktestResult {
  event: BacktestEvent;
  bars: CandleData[];
  strategyResults: EventStrategyResult[];
  /** ID of the best-performing strategy */
  bestStrategyId: StrategyId;
  /** ID of the worst-performing strategy */
worstStrategyId: StrategyId;
}

// ── Grading ───────────────────────────────────────────────────────────────

function gradeResult(pnlPct: number, crashPercent: number): "A" | "B" | "C" | "D" | "F" {
  // Grade relative to the crash: surviving a -34% crash with only -5% is an A
  const severity = Math.abs(crashPercent);
  if (pnlPct >= 5) return "A";
  if (pnlPct >= 0) return "B";
  if (pnlPct >= -(severity * 0.15)) return "C";
  if (pnlPct >= -(severity * 0.40)) return "D";
  return "F";
}

// ── Core engine ───────────────────────────────────────────────────────────

/**
 * Runs a single strategy against a pre-generated price series.
 * Returns entry/exit trades, drawdown, recovery time, and grade.
 */
function runStrategy(
  strategyId: StrategyId,
  bars: CandleData[],
  crashPercent: number,
): Omit<EventStrategyResult, "strategyName"> {
  const prices = bars.map((b) => b.close);
  const n = prices.length;

  // Pre-build indicators
  const ema12 = buildEMA(prices, 12);
  const ema26 = buildEMA(prices, 26);
  const signalLine = buildEMA(
    ema12.map((v, i) => v - ema26[i]),
    9,
  );
  const zScores = buildZScore(prices, 20);
  const atrVals = buildATR(prices, 14);

  const trades: EventTrade[] = [];
  let cash = 10000;
  let position: { entry: number; bar: number; stop?: number; peakPrice?: number } | null = null;

  const equity: { bar: number; equity: number }[] = [{ bar: 0, equity: 10000 }];

  for (let i = 10; i < n; i++) {
    const price = prices[i];
    let shouldBuy = false;
    let shouldSell = false;

    switch (strategyId) {
      case "sma_crossover": {
        const fast = sma(prices, 20, i);
        const fastP = sma(prices, 20, i - 1);
        const slow = sma(prices, 50, i);
        const slowP = sma(prices, 50, i - 1);
        shouldBuy = fastP < slowP && fast > slow;
        shouldSell = fastP > slowP && fast < slow;
        break;
      }
      case "rsi_reversion": {
        const period = 14;
        const slice = prices.slice(Math.max(0, i - period), i + 1);
        let gains = 0, losses = 0;
        for (let j = 1; j < slice.length; j++) {
          const d = slice[j] - slice[j - 1];
          if (d > 0) gains += d; else losses += -d;
        }
        gains /= period; losses /= period;
        const rsi = losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);
        shouldBuy = rsi < 30;
        shouldSell = rsi > 70;
        break;
      }
      case "breakout": {
        const hw = prices.slice(Math.max(0, i - 20), i);
        const lw = prices.slice(Math.max(0, i - 10), i);
        const hi = hw.length ? Math.max(...hw) : price;
        const lo = lw.length ? Math.min(...lw) : price;
        shouldBuy = price > hi;
        shouldSell = price < lo;
        break;
      }
      case "macd_trend": {
        const hist = ema12[i] - ema26[i] - signalLine[i];
        const histP = ema12[i - 1] - ema26[i - 1] - signalLine[i - 1];
        shouldBuy = histP <= 0 && hist > 0;
        shouldSell = histP >= 0 && hist < 0;
        break;
      }
      case "bollinger_mean": {
        const mid = sma(prices, 20, i);
        const std = rollingStd(prices, 20, i);
        shouldBuy = price < mid - 2 * std;
        shouldSell = price > mid;
        break;
      }
      case "mean_reversion_2std": {
        const mid = sma(prices, 20, i);
        const std = rollingStd(prices, 20, i);
        shouldBuy = price < mid - 2 * std;
        shouldSell = price > mid + std;
        break;
      }
      case "momentum_3m": {
        if (i >= 63 && i % 21 === 0) {
          const mom = (prices[i] - prices[i - 63]) / prices[i - 63];
          shouldBuy = mom > 0.05;
          shouldSell = mom < 0;
        }
        break;
      }
      case "pairs_trading": {
        const z = zScores[i];
        if (position) {
          shouldSell = z > -0.5;
        } else {
          shouldBuy = z < -2;
        }
        break;
      }
      case "trend_atr_stop": {
        const hw = prices.slice(Math.max(0, i - 20), i);
        const hi = hw.length ? Math.max(...hw) : price;
        const atr = atrVals[i] > 0 ? atrVals[i] : price * 0.02;
        if (position) {
          if (position.peakPrice === undefined || price > position.peakPrice) position.peakPrice = price;
          const trail = position.peakPrice - 2 * atr;
          if (position.stop === undefined || trail > position.stop) position.stop = trail;
          shouldSell = price <= (position.stop ?? position.entry - 2 * atr);
        } else {
          shouldBuy = price > hi;
        }
        break;
      }
      case "volatility_breakout": {
        // Simple vol spike: measure 5-bar realized vol
        if (i >= 5) {
          let sq = 0;
          for (let k = i - 4; k <= i; k++) {
            const r = prices[k - 1] > 0 ? (prices[k] - prices[k - 1]) / prices[k - 1] : 0;
            sq += r * r;
          }
          const vol = Math.sqrt((sq / 5) * 252) * 100;
          if (position) {
            shouldSell = i - position.bar >= 10;
          } else {
            shouldBuy = vol > 25;
          }
        }
        break;
      }
    }

    if (shouldBuy && !position) {
      position = { entry: price, bar: i };
    } else if (shouldSell && position) {
      const pnlPct = ((price - position.entry) / position.entry) * 100;
      cash *= 1 + pnlPct / 100;
      trades.push({ entryBar: position.bar, exitBar: i, entryPrice: position.entry, exitPrice: price, pnlPct });
      position = null;
    }

    equity.push({ bar: i, equity: Math.round(cash) });
  }

  // Close any open position at last bar
  if (position) {
    const price = prices[n - 1];
    const pnlPct = ((price - position.entry) / position.entry) * 100;
    cash *= 1 + pnlPct / 100;
    trades.push({ entryBar: position.bar, exitBar: n - 1, entryPrice: position.entry, exitPrice: price, pnlPct });
    equity[equity.length - 1] = { bar: n - 1, equity: Math.round(cash) };
  }

  // Metrics
  const firstEntry = trades.length > 0 ? trades[0].entryPrice : prices[0];
  const entryBar = trades.length > 0 ? trades[0].entryBar : -1;
  const entryPrice = trades.length > 0 ? firstEntry : prices[0];

  // Max drawdown from entry
  let maxDD = 0;
  let maxDDBar = entryBar;
  let peak = entryPrice;
  for (let i = Math.max(0, entryBar); i < n; i++) {
    if (prices[i] > peak) peak = prices[i];
    const dd = ((peak - prices[i]) / peak) * 100;
    if (dd > maxDD) { maxDD = dd; maxDDBar = i; }
  }

  // Recovery bar: first bar after crash where price >= entry
  const CRASH_START = 30; // Phase 2 starts here
  let recoveryBar = -1;
  if (entryBar >= 0) {
    for (let i = CRASH_START + 8; i < n; i++) {
      if (prices[i] >= entryPrice) { recoveryBar = i; break; }
    }
  }

  const finalPnlPct = ((cash - 10000) / 10000) * 100;

  return {
    strategyId,
    entryPrice,
    entryBar,
    maxDrawdownFromEntry: Math.round(maxDD * 100) / 100,
    maxDrawdownBar: maxDDBar,
    recoveryBar,
    finalPnlPct: Math.round(finalPnlPct * 100) / 100,
    tradeCount: trades.length,
    trades,
    equityCurve: equity,
    grade: gradeResult(finalPnlPct, crashPercent),
  };
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Runs all 10 strategies against a single historical crisis event.
 */
export function runEventBacktest(event: BacktestEvent): EventBacktestResult {
  const bars = generateEventPriceSeries(event, 100);

  const strategyResults: EventStrategyResult[] = BACKTEST_STRATEGIES.map((s) => {
    const result = runStrategy(s.id, bars, event.crashPercent);
    return { ...result, strategyName: s.name };
  });

  // Best = highest finalPnlPct; worst = lowest
  const sorted = [...strategyResults].sort((a, b) => b.finalPnlPct - a.finalPnlPct);
  const bestStrategyId = sorted[0].strategyId;
  const worstStrategyId = sorted[sorted.length - 1].strategyId;

  return { event, bars, strategyResults, bestStrategyId, worstStrategyId };
}

// ── Stress test ───────────────────────────────────────────────────────────

export interface StressTestRow {
  eventId: string;
  eventName: string;
  pnlPct: number;
  maxDrawdown: number;
  grade: "A" | "B" | "C" | "D" | "F";
  survived: boolean;
}

export interface StressTestSummaryResult {
  strategyId: StrategyId;
  strategyName: string;
  rows: StressTestRow[];
  avgPnlPct: number;
  avgMaxDrawdown: number;
  survivedCount: number;
  totalEvents: number;
  /** 0–100 score: 100 = survived every event with positive P&L */
  resilienceScore: number;
}

/**
 * Runs a single strategy against ALL backtest events and aggregates performance.
 */
export function runStressTest(strategyId: StrategyId): StressTestSummaryResult {
  const strategy = BACKTEST_STRATEGIES.find((s) => s.id === strategyId)!;
  const rows: StressTestRow[] = [];

  for (const event of BACKTEST_EVENTS) {
    const bars = generateEventPriceSeries(event, 100);
    const result = runStrategy(strategyId, bars, event.crashPercent);
    rows.push({
      eventId: event.id,
      eventName: event.name,
      pnlPct: result.finalPnlPct,
      maxDrawdown: result.maxDrawdownFromEntry,
      grade: result.grade,
      survived: result.finalPnlPct > -(Math.abs(event.crashPercent) * 0.4),
    });
  }

  const avgPnlPct = rows.reduce((s, r) => s + r.pnlPct, 0) / rows.length;
  const avgMaxDrawdown = rows.reduce((s, r) => s + r.maxDrawdown, 0) / rows.length;
  const survivedCount = rows.filter((r) => r.survived).length;

  // Resilience score: base 50 + survival rate 30 + avg P&L component 20
  const survivalComponent = (survivedCount / rows.length) * 30;
  // avgPnlPct clamped to [-30, +20], mapped to 0-20
  const pnlClamped = Math.max(-30, Math.min(20, avgPnlPct));
  const pnlComponent = ((pnlClamped + 30) / 50) * 20;
  const resilienceScore = Math.round(50 + survivalComponent + pnlComponent);

  return {
    strategyId,
    strategyName: strategy?.name ?? strategyId,
    rows,
    avgPnlPct: Math.round(avgPnlPct * 100) / 100,
    avgMaxDrawdown: Math.round(avgMaxDrawdown * 100) / 100,
    survivedCount,
    totalEvents: rows.length,
    resilienceScore,
  };
}
