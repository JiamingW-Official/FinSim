import type {
  BacktestConfig,
  BacktestResult,
  BacktestTrade,
  BacktestEquityPoint,
  BacktestMetrics,
  BacktestBar,
  DrawdownPoint,
  PeriodReturn,
  ConditionRule,
  IndicatorSource,
  MonteCarloResult,
  MonteCarloRun,
} from "@/types/backtest";
import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "@/services/indicators/sma";
import { generateRealisticBars } from "@/data/lessons/practice-data";
import { calculateSMA } from "@/services/indicators/sma";
import { calculateEMA } from "@/services/indicators/ema";
import { calculateRSI } from "@/services/indicators/rsi";
import { calculateMACD } from "@/services/indicators/macd";
import { calculateBollingerBands } from "@/services/indicators/bollinger";
import { calculateATR } from "@/services/indicators/atr";
import { calculateStochastic } from "@/services/indicators/stochastic";
import { calculateVWAP } from "@/services/indicators/vwap";
import { calculateCommission } from "@/services/trading/fees";
import { computeScenarioGrade } from "@/types/challenges";
import { BAR_PRESETS } from "./bar-presets";

// ── Indicator map at each bar index ──────────────────────────

interface BarIndicators {
  price: number;
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  macd_line: number | null;
  macd_signal: number | null;
  bollinger_upper: number | null;
  bollinger_lower: number | null;
  bollinger_middle: number | null;
  atr14: number | null;
  stoch_k: number | null;
  stoch_d: number | null;
  vwap: number | null;
}

function buildIndicatorMap(bars: OHLCVBar[]): BarIndicators[] {
  const sma20 = calculateSMA(bars, 20);
  const sma50 = calculateSMA(bars, 50);
  const ema12 = calculateEMA(bars, 12);
  const ema26 = calculateEMA(bars, 26);
  const rsi14 = calculateRSI(bars, 14);
  const macd = calculateMACD(bars, 12, 26, 9);
  const boll = calculateBollingerBands(bars, 20, 2);
  const atr14 = calculateATR(bars, 14);
  const stoch = calculateStochastic(bars, 14, 3);
  const vwap = calculateVWAP(bars);

  const lookup = (pts: IndicatorPoint[]): Map<number, number> => {
    const m = new Map<number, number>();
    for (const p of pts) m.set(p.time, p.value);
    return m;
  };

  const sma20Map = lookup(sma20);
  const sma50Map = lookup(sma50);
  const ema12Map = lookup(ema12);
  const ema26Map = lookup(ema26);
  const rsi14Map = lookup(rsi14);
  const macdLineMap = lookup(macd.macdLine);
  const macdSignalMap = lookup(macd.signalLine);
  const bollUpperMap = lookup(boll.upper);
  const bollLowerMap = lookup(boll.lower);
  const bollMiddleMap = lookup(boll.middle);
  const atr14Map = lookup(atr14);
  const stochKMap = lookup(stoch.kLine);
  const stochDMap = lookup(stoch.dLine);
  const vwapMap = lookup(vwap);

  return bars.map((bar) => {
    const t = bar.timestamp / 1000;
    return {
      price: bar.close,
      sma20: sma20Map.get(t) ?? null,
      sma50: sma50Map.get(t) ?? null,
      ema12: ema12Map.get(t) ?? null,
      ema26: ema26Map.get(t) ?? null,
      rsi14: rsi14Map.get(t) ?? null,
      macd_line: macdLineMap.get(t) ?? null,
      macd_signal: macdSignalMap.get(t) ?? null,
      bollinger_upper: bollUpperMap.get(t) ?? null,
      bollinger_lower: bollLowerMap.get(t) ?? null,
      bollinger_middle: bollMiddleMap.get(t) ?? null,
      atr14: atr14Map.get(t) ?? null,
      stoch_k: stochKMap.get(t) ?? null,
      stoch_d: stochDMap.get(t) ?? null,
      vwap: vwapMap.get(t) ?? null,
    };
  });
}

// ── Condition evaluation ─────────────────────────────────────

function getValue(
  indicators: BarIndicators,
  source: IndicatorSource | number,
): number | null {
  if (typeof source === "number") return source;
  return indicators[source];
}

function evaluateCondition(
  rule: ConditionRule,
  current: BarIndicators,
  previous: BarIndicators | null,
): boolean {
  const srcVal = getValue(current, rule.source);
  const tgtVal = getValue(current, rule.target);
  if (srcVal === null || tgtVal === null) return false;

  switch (rule.operator) {
    case "greater_than":
      return srcVal > tgtVal;
    case "less_than":
      return srcVal < tgtVal;
    case "crosses_above": {
      if (!previous) return false;
      const prevSrc = getValue(previous, rule.source);
      const prevTgt = getValue(previous, rule.target);
      if (prevSrc === null || prevTgt === null) return false;
      return prevSrc <= prevTgt && srcVal > tgtVal;
    }
    case "crosses_below": {
      if (!previous) return false;
      const prevSrc = getValue(previous, rule.source);
      const prevTgt = getValue(previous, rule.target);
      if (prevSrc === null || prevTgt === null) return false;
      return prevSrc >= prevTgt && srcVal < tgtVal;
    }
    default:
      return false;
  }
}

// ── Single backtest run (core simulation) ────────────────────

interface SimResult {
  trades: BacktestTrade[];
  equityCurve: BacktestEquityPoint[];
  bars: BacktestBar[];
}

function simulate(config: BacktestConfig, seedOverride?: number): SimResult {
  const { strategy, barCount, startingCapital, barGenPreset } = config;
  const seed = seedOverride ?? config.seed;
  const preset = BAR_PRESETS[barGenPreset];

  const practiceBars = generateRealisticBars({
    ...preset,
    count: barCount,
    seed,
  });

  const baseTimestamp = Date.now() - barCount * 86_400_000;
  const ohlcvBars: OHLCVBar[] = practiceBars.map((b, i) => ({
    timestamp: baseTimestamp + i * 86_400_000,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
    ticker: strategy.ticker,
    timeframe: "1d" as const,
  }));

  const bars: BacktestBar[] = ohlcvBars.map((b) => ({
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
    timestamp: b.timestamp,
  }));

  const indicators = buildIndicatorMap(ohlcvBars);
  const warmup = strategy.warmupBars ?? 0;

  let cash = startingCapital;
  let shares = 0;
  let entryBar = -1;
  let entryPrice = 0;
  let peakSinceEntry = 0;
  let worstSinceEntry = Infinity; // for MAE
  let bestSinceEntry = 0; // for MFE
  const trades: BacktestTrade[] = [];
  const equityCurve: BacktestEquityPoint[] = [];
  let tradeCounter = 0;

  const isLong = strategy.direction === "long";

  for (let i = 0; i < barCount; i++) {
    const current = indicators[i];
    const previous = i > 0 ? indicators[i - 1] : null;
    const price = current.price;
    const barHigh = bars[i].high;
    const barLow = bars[i].low;

    // ── If no position, check entry rules (AND logic) ──
    if (shares === 0 && strategy.entryRules.length > 0 && i >= warmup) {
      const allMet = strategy.entryRules.every((rule) =>
        evaluateCondition(rule, current, previous),
      );

      if (allMet) {
        let sharesToBuy: number;
        if (strategy.positionSizing.kind === "fixed_shares") {
          sharesToBuy = strategy.positionSizing.shares;
        } else if (strategy.positionSizing.kind === "kelly_criterion") {
          // Simplified Kelly: use half-Kelly with max cap
          const maxPct = strategy.positionSizing.maxPercent;
          const capitalToUse = cash * (maxPct / 100);
          sharesToBuy = Math.floor(capitalToUse / price);
        } else {
          const capitalToUse = cash * (strategy.positionSizing.percent / 100);
          sharesToBuy = Math.floor(capitalToUse / price);
        }

        if (sharesToBuy > 0 && sharesToBuy * price <= cash) {
          const commission = calculateCommission(sharesToBuy);
          cash -= sharesToBuy * price + commission;
          shares = sharesToBuy;
          entryBar = i;
          entryPrice = price;
          peakSinceEntry = price;
          worstSinceEntry = 0;
          bestSinceEntry = 0;
        }
      }
    }

    // ── If in position, track MAE/MFE and check exits ──
    else if (shares > 0) {
      // Track peak price for trailing stop
      if (isLong) {
        if (barHigh > peakSinceEntry) peakSinceEntry = barHigh;
        const unrealizedPct = ((price - entryPrice) / entryPrice) * 100;
        const mfePct = ((barHigh - entryPrice) / entryPrice) * 100;
        const maePct = ((entryPrice - barLow) / entryPrice) * 100;
        if (mfePct > bestSinceEntry) bestSinceEntry = mfePct;
        if (maePct > worstSinceEntry) worstSinceEntry = maePct;
      } else {
        if (barLow < peakSinceEntry || peakSinceEntry === 0) peakSinceEntry = barLow > 0 ? barLow : peakSinceEntry;
        const mfePct = ((entryPrice - barLow) / entryPrice) * 100;
        const maePct = ((barHigh - entryPrice) / entryPrice) * 100;
        if (mfePct > bestSinceEntry) bestSinceEntry = mfePct;
        if (maePct > worstSinceEntry) worstSinceEntry = maePct;
      }

      let shouldExit = false;
      let exitReason = "";
      const barsHeld = i - entryBar;

      for (const exit of strategy.exitRules) {
        if (shouldExit) break;
        switch (exit.kind) {
          case "condition":
            if (evaluateCondition(exit.rule, current, previous)) {
              shouldExit = true;
              exitReason = exit.rule.label;
            }
            break;
          case "bars_held":
            if (barsHeld >= exit.count) {
              shouldExit = true;
              exitReason = `Held ${exit.count} bars`;
            }
            break;
          case "profit_target": {
            const pctGain = isLong
              ? ((price - entryPrice) / entryPrice) * 100
              : ((entryPrice - price) / entryPrice) * 100;
            if (pctGain >= exit.percent) {
              shouldExit = true;
              exitReason = `Profit +${exit.percent}%`;
            }
            break;
          }
          case "stop_loss": {
            const pctLoss = isLong
              ? ((entryPrice - price) / entryPrice) * 100
              : ((price - entryPrice) / entryPrice) * 100;
            if (pctLoss >= exit.percent) {
              shouldExit = true;
              exitReason = `Stop loss -${exit.percent}%`;
            }
            break;
          }
          case "trailing_stop": {
            const drawdownFromPeak = isLong
              ? ((peakSinceEntry - price) / peakSinceEntry) * 100
              : ((price - peakSinceEntry) / peakSinceEntry) * 100;
            if (drawdownFromPeak >= exit.percent) {
              shouldExit = true;
              exitReason = `Trail stop -${exit.percent}% from peak`;
            }
            break;
          }
          case "atr_stop": {
            const atrVal = current.atr14;
            if (atrVal !== null) {
              const stopDistance = atrVal * exit.multiplier;
              const hitStop = isLong
                ? price < peakSinceEntry - stopDistance
                : price > peakSinceEntry + stopDistance;
              if (hitStop) {
                shouldExit = true;
                exitReason = `ATR stop (${exit.multiplier}×ATR)`;
              }
            }
            break;
          }
        }
      }

      // Force exit on last bar
      if (!shouldExit && i === barCount - 1) {
        shouldExit = true;
        exitReason = "End of data";
      }

      if (shouldExit) {
        const commission = calculateCommission(shares);
        const pnl = isLong
          ? (price - entryPrice) * shares - commission
          : (entryPrice - price) * shares - commission;
        const pnlPercent = isLong
          ? ((price - entryPrice) / entryPrice) * 100
          : ((entryPrice - price) / entryPrice) * 100;

        cash += shares * price - commission;

        trades.push({
          id: `trade-${tradeCounter++}`,
          entryBar,
          exitBar: i,
          entryPrice,
          exitPrice: price,
          direction: strategy.direction,
          shares,
          pnl: +pnl.toFixed(2),
          pnlPercent: +pnlPercent.toFixed(2),
          commission: +commission.toFixed(2),
          holdingBars: barsHeld,
          exitReason,
          mae: +worstSinceEntry.toFixed(2),
          mfe: +bestSinceEntry.toFixed(2),
        });

        shares = 0;
        entryBar = -1;
        entryPrice = 0;
        peakSinceEntry = 0;
        worstSinceEntry = 0;
        bestSinceEntry = 0;
      }
    }

    const equity = cash + shares * price;
    equityCurve.push({ bar: i, value: +equity.toFixed(2) });
  }

  return { trades, equityCurve, bars };
}

// ── Main backtest entry point ────────────────────────────────

export function runBacktest(config: BacktestConfig): BacktestResult {
  const { trades, equityCurve, bars } = simulate(config);
  const metrics = computeMetrics(trades, equityCurve, config.startingCapital, bars.length);
  const drawdownCurve = computeDrawdownCurve(equityCurve, config.startingCapital);
  const periodReturns = computePeriodReturns(equityCurve, trades, config.startingCapital);

  const grade = computeScenarioGrade(metrics.totalReturnPercent, {
    S: 15,
    A: 8,
    B: 0,
  });

  return {
    id: `bt-${Date.now()}-${config.seed}`,
    config,
    trades,
    equityCurve,
    drawdownCurve,
    periodReturns,
    metrics,
    grade,
    bars,
    completedAt: Date.now(),
  };
}

// ── Monte Carlo simulation ───────────────────────────────────

export function runMonteCarlo(config: BacktestConfig, numRuns: number): MonteCarloResult {
  const runs: MonteCarloRun[] = [];
  const baseSeed = config.seed;

  for (let r = 0; r < numRuns; r++) {
    const seed = baseSeed + r * 7919; // prime spacing for diverse seeds
    const { trades, equityCurve } = simulate(config, seed);
    const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : config.startingCapital;
    const totalReturnPercent = ((finalEquity - config.startingCapital) / config.startingCapital) * 100;

    // Quick max drawdown
    let peak = config.startingCapital;
    let maxDdPct = 0;
    for (const pt of equityCurve) {
      if (pt.value > peak) peak = pt.value;
      const dd = ((peak - pt.value) / peak) * 100;
      if (dd > maxDdPct) maxDdPct = dd;
    }

    // Quick Sharpe
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1].value;
      if (prev > 0) returns.push((equityCurve[i].value - prev) / prev);
    }
    let sharpe = 0;
    if (returns.length > 1) {
      const avg = returns.reduce((s, v) => s + v, 0) / returns.length;
      const variance = returns.reduce((s, v) => s + (v - avg) ** 2, 0) / (returns.length - 1);
      const std = Math.sqrt(variance);
      sharpe = std > 0 ? (avg / std) * Math.sqrt(252) : 0;
    }

    runs.push({
      seed,
      finalEquity: +finalEquity.toFixed(2),
      totalReturnPercent: +totalReturnPercent.toFixed(2),
      maxDrawdownPercent: +maxDdPct.toFixed(2),
      sharpeRatio: +sharpe.toFixed(2),
      equityCurve,
    });
  }

  // Compute percentile bands
  const maxLen = Math.max(...runs.map((r) => r.equityCurve.length));
  const p5: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p95: number[] = [];

  for (let i = 0; i < maxLen; i++) {
    const values = runs
      .map((r) => r.equityCurve[i]?.value ?? r.equityCurve[r.equityCurve.length - 1]?.value ?? config.startingCapital)
      .sort((a, b) => a - b);
    p5.push(percentile(values, 5));
    p25.push(percentile(values, 25));
    p50.push(percentile(values, 50));
    p75.push(percentile(values, 75));
    p95.push(percentile(values, 95));
  }

  // Return distribution stats
  const returnValues = runs.map((r) => r.totalReturnPercent).sort((a, b) => a - b);
  const mean = returnValues.reduce((s, v) => s + v, 0) / returnValues.length;
  const median = percentile(returnValues, 50);
  const variance = returnValues.reduce((s, v) => s + (v - mean) ** 2, 0) / (returnValues.length - 1);
  const stdDev = Math.sqrt(variance);
  const profitProbability = (returnValues.filter((v) => v > 0).length / returnValues.length) * 100;
  const tailRisk10 = (returnValues.filter((v) => v < -10).length / returnValues.length) * 100;
  const upside20 = (returnValues.filter((v) => v > 20).length / returnValues.length) * 100;

  return {
    runs,
    percentiles: { p5, p25, p50, p75, p95 },
    returnDistribution: {
      mean: +mean.toFixed(2),
      median: +median.toFixed(2),
      stdDev: +stdDev.toFixed(2),
      min: returnValues[0],
      max: returnValues[returnValues.length - 1],
      profitProbability: +profitProbability.toFixed(1),
      tailRisk10: +tailRisk10.toFixed(1),
      upside20: +upside20.toFixed(1),
    },
  };
}

function percentile(sorted: number[], pct: number): number {
  const idx = (pct / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// ── Drawdown curve ───────────────────────────────────────────

function computeDrawdownCurve(
  equityCurve: BacktestEquityPoint[],
  startingCapital: number,
): DrawdownPoint[] {
  let peak = startingCapital;
  return equityCurve.map((pt) => {
    if (pt.value > peak) peak = pt.value;
    const dd = peak - pt.value;
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    return { bar: pt.bar, drawdown: +dd.toFixed(2), drawdownPercent: +ddPct.toFixed(2) };
  });
}

// ── Period returns (~monthly, 20 bars each) ──────────────────

function computePeriodReturns(
  equityCurve: BacktestEquityPoint[],
  trades: BacktestTrade[],
  startingCapital: number,
): PeriodReturn[] {
  const PERIOD_SIZE = 20;
  const result: PeriodReturn[] = [];
  const len = equityCurve.length;

  for (let start = 0; start < len; start += PERIOD_SIZE) {
    const end = Math.min(start + PERIOD_SIZE - 1, len - 1);
    const startVal = start === 0 ? startingCapital : equityCurve[start - 1].value;
    const endVal = equityCurve[end].value;
    const returnPct = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;
    const periodTrades = trades.filter((t) => t.entryBar >= start && t.entryBar <= end).length;
    const periodIdx = Math.floor(start / PERIOD_SIZE);

    result.push({
      period: periodIdx,
      label: `P${periodIdx + 1}`,
      returnPercent: +returnPct.toFixed(2),
      trades: periodTrades,
    });
  }

  return result;
}

// ── Advanced metrics computation ─────────────────────────────

function computeMetrics(
  trades: BacktestTrade[],
  equityCurve: BacktestEquityPoint[],
  startingCapital: number,
  totalBars: number,
): BacktestMetrics {
  const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : startingCapital;
  const totalReturn = finalEquity - startingCapital;
  const totalReturnPercent = (totalReturn / startingCapital) * 100;

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  // Max drawdown
  let peak = startingCapital;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  for (const pt of equityCurve) {
    if (pt.value > peak) peak = pt.value;
    const dd = peak - pt.value;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownPercent = (dd / peak) * 100;
    }
  }

  // Daily returns
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].value;
    if (prev > 0) returns.push((equityCurve[i].value - prev) / prev);
  }

  const avgReturn = returns.length > 0 ? returns.reduce((s, r) => s + r, 0) / returns.length : 0;
  const variance = returns.length > 1 ? returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / (returns.length - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // Sharpe ratio
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  // Sortino ratio (downside deviation only)
  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVariance = downsideReturns.length > 1
    ? downsideReturns.reduce((s, r) => s + r ** 2, 0) / (downsideReturns.length - 1)
    : 0;
  const downsideDev = Math.sqrt(downsideVariance);
  const sortinoRatio = downsideDev > 0 ? (avgReturn / downsideDev) * Math.sqrt(252) : 0;

  // Calmar ratio (annualized return / max drawdown)
  const annualizedReturn = returns.length > 0 ? avgReturn * 252 : 0;
  const calmarRatio = maxDrawdownPercent > 0 ? (annualizedReturn * 100) / maxDrawdownPercent : 0;

  // Expectancy
  const winRateFrac = trades.length > 0 ? wins.length / trades.length : 0;
  const lossRateFrac = 1 - winRateFrac;
  const expectancy = (winRateFrac * avgWin) - (lossRateFrac * avgLoss);

  // Recovery factor
  const recoveryFactor = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

  // Payoff ratio
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;

  // Ulcer Index (RMS of drawdown percentages)
  let sumSqDd = 0;
  let ddPeak = startingCapital;
  for (const pt of equityCurve) {
    if (pt.value > ddPeak) ddPeak = pt.value;
    const ddPct = ddPeak > 0 ? ((ddPeak - pt.value) / ddPeak) * 100 : 0;
    sumSqDd += ddPct ** 2;
  }
  const ulcerIndex = equityCurve.length > 0 ? Math.sqrt(sumSqDd / equityCurve.length) : 0;

  // Time in market
  const barsInMarket = trades.reduce((s, t) => s + t.holdingBars, 0);
  const timeInMarket = totalBars > 0 ? (barsInMarket / totalBars) * 100 : 0;

  // MAE/MFE averages
  const avgMAE = trades.length > 0 ? trades.reduce((s, t) => s + t.mae, 0) / trades.length : 0;
  const avgMFE = trades.length > 0 ? trades.reduce((s, t) => s + t.mfe, 0) / trades.length : 0;
  const edgeCaptureRatio = avgMFE > 0
    ? (trades.reduce((s, t) => s + Math.max(0, t.pnlPercent), 0) / trades.length) / avgMFE
    : 0;

  const avgHoldingBars = trades.length > 0 ? trades.reduce((s, t) => s + t.holdingBars, 0) / trades.length : 0;
  const totalCommissions = trades.reduce((s, t) => s + t.commission, 0);
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl)) : 0;

  // Consecutive
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let curWins = 0;
  let curLosses = 0;
  for (const t of trades) {
    if (t.pnl > 0) { curWins++; curLosses = 0; if (curWins > consecutiveWins) consecutiveWins = curWins; }
    else { curLosses++; curWins = 0; if (curLosses > consecutiveLosses) consecutiveLosses = curLosses; }
  }

  // Trade PnL distribution
  const pnls = trades.map((t) => t.pnl);
  const medianTradePnl = pnls.length > 0 ? percentile([...pnls].sort((a, b) => a - b), 50) : 0;
  const stdDevTradePnl = pnls.length > 1
    ? Math.sqrt(pnls.reduce((s, p) => s + (p - (pnls.reduce((a, b) => a + b, 0) / pnls.length)) ** 2, 0) / (pnls.length - 1))
    : 0;

  // Skewness & kurtosis
  const pnlMean = pnls.length > 0 ? pnls.reduce((s, p) => s + p, 0) / pnls.length : 0;
  let m3 = 0, m4 = 0;
  for (const p of pnls) {
    const d = p - pnlMean;
    m3 += d ** 3;
    m4 += d ** 4;
  }
  const n = pnls.length;
  const skewness = n > 2 && stdDevTradePnl > 0 ? (m3 / n) / (stdDevTradePnl ** 3) : 0;
  const kurtosis = n > 3 && stdDevTradePnl > 0 ? (m4 / n) / (stdDevTradePnl ** 4) - 3 : 0;

  return {
    totalReturn: +totalReturn.toFixed(2),
    totalReturnPercent: +totalReturnPercent.toFixed(2),
    totalTrades: trades.length,
    winRate: +winRate.toFixed(1),
    avgWin: +avgWin.toFixed(2),
    avgLoss: +avgLoss.toFixed(2),
    profitFactor: +profitFactor.toFixed(2),
    maxDrawdown: +maxDrawdown.toFixed(2),
    maxDrawdownPercent: +maxDrawdownPercent.toFixed(2),
    sharpeRatio: +sharpeRatio.toFixed(2),
    avgHoldingBars: +avgHoldingBars.toFixed(1),
    totalCommissions: +totalCommissions.toFixed(2),
    largestWin: +largestWin.toFixed(2),
    largestLoss: +largestLoss.toFixed(2),
    consecutiveWins,
    consecutiveLosses,
    sortinoRatio: +sortinoRatio.toFixed(2),
    calmarRatio: +calmarRatio.toFixed(2),
    expectancy: +expectancy.toFixed(2),
    recoveryFactor: +recoveryFactor.toFixed(2),
    payoffRatio: +payoffRatio.toFixed(2),
    ulcerIndex: +ulcerIndex.toFixed(2),
    timeInMarket: +timeInMarket.toFixed(1),
    avgMAE: +avgMAE.toFixed(2),
    avgMFE: +avgMFE.toFixed(2),
    edgeCaptureRatio: +edgeCaptureRatio.toFixed(2),
    medianTradePnl: +medianTradePnl.toFixed(2),
    stdDevTradePnl: +stdDevTradePnl.toFixed(2),
    skewness: +skewness.toFixed(2),
    kurtosis: +kurtosis.toFixed(2),
  };
}
