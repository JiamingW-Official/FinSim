// ═══════════════════════════════════════════════════════════════════════════
// Professional-Grade Backtesting Engine
// References: De Prado "Advances in Financial Machine Learning",
//   Triple-Barrier Method, Walk-Forward Analysis, Monte Carlo simulation
// ═══════════════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────────────

export interface BarData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestConfig {
  strategyId: string;
  ticker: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  positionSizing: "fixed" | "percent" | "kelly" | "volatility-adjusted";
  slippage: number; // bps
  commission: number; // per trade
  maxPositions: number;
  riskPerTrade: number; // as fraction
}

export interface BacktestTrade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  side: "long" | "short";
  shares: number;
  pnl: number;
  pnlPercent: number;
  holdingPeriod: number; // bars
  mae: number; // max adverse excursion (%)
  mfe: number; // max favorable excursion (%)
  rMultiple: number;
  exitReason: string;
}

export interface BacktestResult {
  config: BacktestConfig;
  trades: BacktestTrade[];
  equityCurve: { date: string; equity: number; drawdown: number }[];
  // Performance
  totalReturn: number;
  cagr: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number;
  // Trade stats
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  avgRMultiple: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgHoldingPeriod: number;
  // Risk
  var95: number;
  cvar95: number;
  ulcerIndex: number;
  // Monthly returns
  monthlyReturns: { month: string; return: number }[];
}

export interface WalkForwardResult {
  folds: WalkForwardFold[];
  inSampleAvgReturn: number;
  outOfSampleAvgReturn: number;
  inSampleAvgSharpe: number;
  outOfSampleAvgSharpe: number;
  degradationRatio: number; // OOS/IS return ratio
  robustnessScore: number; // 0-100
}

export interface WalkForwardFold {
  foldIndex: number;
  inSampleReturn: number;
  outOfSampleReturn: number;
  inSampleSharpe: number;
  outOfSampleSharpe: number;
  inSampleTrades: number;
  outOfSampleTrades: number;
}

export interface MonteCarloBacktestResult {
  simulations: number;
  originalReturn: number;
  originalSharpe: number;
  originalMaxDrawdown: number;
  confidenceIntervals: {
    metric: string;
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  }[];
  ruinProbability: number;
  medianReturn: number;
  medianMaxDrawdown: number;
}

// ── Strategy definition ──────────────────────────────────────────────────

export interface StrategyDef {
  id: string;
  name: string;
  description: string;
  category: "trend" | "mean-reversion" | "momentum" | "breakout" | "composite";
  run: (data: BarData[], config: BacktestConfig) => BacktestTrade[];
}

// ── Indicator helpers ────────────────────────────────────────────────────

function sma(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j];
    result.push(sum / period);
  }
  return result;
}

function ema(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); }
    else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j];
      prev = sum / period;
      result.push(prev);
    } else {
      prev = data[i] * k + prev! * (1 - k);
      result.push(prev);
    }
  }
  return result;
}

function rsi(closes: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [null];
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (i <= period) {
      if (change > 0) avgGain += change; else avgLoss += Math.abs(change);
      if (i === period) {
        avgGain /= period; avgLoss /= period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      } else { result.push(null); }
    } else {
      avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (change < 0 ? Math.abs(change) : 0)) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

function atr(data: BarData[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [null];
  const trs: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const tr = Math.max(
      data[i].high - data[i].low,
      Math.abs(data[i].high - data[i - 1].close),
      Math.abs(data[i].low - data[i - 1].close),
    );
    trs.push(tr);
    if (trs.length < period) { result.push(null); continue; }
    if (trs.length === period) {
      result.push(trs.reduce((a, b) => a + b, 0) / period);
    } else {
      result.push((result[result.length - 1]! * (period - 1) + tr) / period);
    }
  }
  return result;
}

function bollingerBands(closes: number[], period: number = 20, mult: number = 2) {
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  const middle: (number | null)[] = [];
  const bandwidth: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(null); lower.push(null); middle.push(null); bandwidth.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    const avg = sum / period;
    let sqSum = 0;
    for (let j = i - period + 1; j <= i; j++) sqSum += (closes[j] - avg) ** 2;
    const std = Math.sqrt(sqSum / period);
    middle.push(avg);
    upper.push(avg + mult * std);
    lower.push(avg - mult * std);
    bandwidth.push(avg > 0 ? (mult * 2 * std) / avg : 0);
  }
  return { upper, lower, middle, bandwidth };
}

function macd(closes: number[], fast = 12, slow = 26, signal = 9) {
  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);
  const line: (number | null)[] = fastEma.map((f, i) =>
    f !== null && slowEma[i] !== null ? f - slowEma[i]! : null,
  );
  const lineNums = line.filter((v): v is number => v !== null);
  const sig = ema(lineNums, signal);
  const signalLine: (number | null)[] = new Array(line.length).fill(null);
  const histogram: (number | null)[] = new Array(line.length).fill(null);
  let j = 0;
  for (let k = 0; k < line.length; k++) {
    if (line[k] !== null) {
      signalLine[k] = sig[j] ?? null;
      histogram[k] = signalLine[k] !== null ? line[k]! - signalLine[k]! : null;
      j++;
    }
  }
  return { line, signalLine, histogram };
}

function adx(data: BarData[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const dxValues: number[] = [];
  let prevPlusDM = 0, prevMinusDM = 0, prevTR = 0;
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(null); continue; }
    const high = data[i].high, low = data[i].low, prevHigh = data[i - 1].high, prevLow = data[i - 1].low;
    const prevClose = data[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    const plusDM = high - prevHigh > prevLow - low && high - prevHigh > 0 ? high - prevHigh : 0;
    const minusDM = prevLow - low > high - prevHigh && prevLow - low > 0 ? prevLow - low : 0;
    if (i <= period) {
      prevPlusDM += plusDM; prevMinusDM += minusDM; prevTR += tr;
      if (i === period) {
        const plusDI = prevTR > 0 ? (prevPlusDM / prevTR) * 100 : 0;
        const minusDI = prevTR > 0 ? (prevMinusDM / prevTR) * 100 : 0;
        const dx = plusDI + minusDI > 0 ? Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100 : 0;
        dxValues.push(dx);
        result.push(null); // need more DX values
      } else { result.push(null); }
    } else {
      prevPlusDM = prevPlusDM - prevPlusDM / period + plusDM;
      prevMinusDM = prevMinusDM - prevMinusDM / period + minusDM;
      prevTR = prevTR - prevTR / period + tr;
      const plusDI = prevTR > 0 ? (prevPlusDM / prevTR) * 100 : 0;
      const minusDI = prevTR > 0 ? (prevMinusDM / prevTR) * 100 : 0;
      const dx = plusDI + minusDI > 0 ? Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100 : 0;
      dxValues.push(dx);
      if (dxValues.length < period) { result.push(null); continue; }
      if (dxValues.length === period) {
        result.push(dxValues.reduce((a, b) => a + b, 0) / period);
      } else {
        result.push((result[result.length - 1]! * (period - 1) + dx) / period);
      }
    }
  }
  return result;
}

function zScore(closes: number[], period: number = 20): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    const avg = sum / period;
    let sqSum = 0;
    for (let j = i - period + 1; j <= i; j++) sqSum += (closes[j] - avg) ** 2;
    const std = Math.sqrt(sqSum / period);
    result.push(std > 0 ? (closes[i] - avg) / std : 0);
  }
  return result;
}

// ── Position sizing ──────────────────────────────────────────────────────

function calculateShares(
  config: BacktestConfig,
  equity: number,
  price: number,
  volatility: number,
  winRate: number,
  avgWinLossRatio: number,
): number {
  let capitalToUse: number;
  switch (config.positionSizing) {
    case "fixed":
      capitalToUse = equity * config.riskPerTrade;
      break;
    case "percent":
      capitalToUse = equity * config.riskPerTrade;
      break;
    case "kelly": {
      const p = Math.max(0.01, Math.min(0.99, winRate));
      const b = Math.max(0.01, avgWinLossRatio);
      let kelly = (p * b - (1 - p)) / b;
      kelly = Math.max(0, Math.min(0.25, kelly)); // half-Kelly cap
      capitalToUse = equity * kelly;
      break;
    }
    case "volatility-adjusted": {
      const targetVol = 0.15; // 15% annual target
      const weight = volatility > 0 ? Math.min(1, targetVol / volatility) : 0.1;
      capitalToUse = equity * weight * config.riskPerTrade * 10;
      break;
    }
    default:
      capitalToUse = equity * config.riskPerTrade;
  }
  return Math.max(0, Math.floor(capitalToUse / price));
}

function applySlippage(price: number, side: "long" | "short", bps: number): number {
  const slippageFrac = bps / 10000;
  return side === "long" ? price * (1 + slippageFrac) : price * (1 - slippageFrac);
}

// ── Trade tracking helpers ───────────────────────────────────────────────

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface OpenPosition {
  side: "long" | "short";
  entryPrice: number;
  entryIndex: number;
  shares: number;
  stopPrice: number;
  peakPrice: number;
  troughPrice: number;
}

function closeTrade(
  data: BarData[],
  pos: OpenPosition,
  exitIndex: number,
  exitPrice: number,
  config: BacktestConfig,
  exitReason: string,
): BacktestTrade {
  const effectiveExit = applySlippage(exitPrice, pos.side === "long" ? "short" : "long", config.slippage);
  const pnl = pos.side === "long"
    ? (effectiveExit - pos.entryPrice) * pos.shares - config.commission * 2
    : (pos.entryPrice - effectiveExit) * pos.shares - config.commission * 2;
  const pnlPercent = pos.side === "long"
    ? (effectiveExit - pos.entryPrice) / pos.entryPrice
    : (pos.entryPrice - effectiveExit) / pos.entryPrice;

  // MAE/MFE as percentages
  let mae = 0, mfe = 0;
  for (let j = pos.entryIndex; j <= exitIndex; j++) {
    if (pos.side === "long") {
      const adverse = (pos.entryPrice - data[j].low) / pos.entryPrice;
      const favorable = (data[j].high - pos.entryPrice) / pos.entryPrice;
      if (adverse > mae) mae = adverse;
      if (favorable > mfe) mfe = favorable;
    } else {
      const adverse = (data[j].high - pos.entryPrice) / pos.entryPrice;
      const favorable = (pos.entryPrice - data[j].low) / pos.entryPrice;
      if (adverse > mae) mae = adverse;
      if (favorable > mfe) mfe = favorable;
    }
  }

  const initialRisk = Math.abs(pos.entryPrice - pos.stopPrice);
  const rMultiple = initialRisk > 0 ? pnl / (initialRisk * pos.shares) : pnlPercent / 0.02;

  return {
    entryDate: formatDate(data[pos.entryIndex].timestamp),
    exitDate: formatDate(data[exitIndex].timestamp),
    entryPrice: pos.entryPrice,
    exitPrice: effectiveExit,
    side: pos.side,
    shares: pos.shares,
    pnl: +pnl.toFixed(2),
    pnlPercent: +(pnlPercent * 100).toFixed(2),
    holdingPeriod: exitIndex - pos.entryIndex,
    mae: +(mae * 100).toFixed(2),
    mfe: +(mfe * 100).toFixed(2),
    rMultiple: +rMultiple.toFixed(2),
    exitReason,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STRATEGY IMPLEMENTATIONS (8 professional strategies)
// ═══════════════════════════════════════════════════════════════════════════

// Helper: compute rolling volatility (annualized) for position sizing
function rollingVolatility(closes: number[], period: number = 20): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period) { result.push(null); continue; }
    const rets: number[] = [];
    for (let j = i - period + 1; j <= i; j++) {
      if (closes[j - 1] > 0) rets.push((closes[j] - closes[j - 1]) / closes[j - 1]);
    }
    const avg = rets.reduce((a, b) => a + b, 0) / rets.length;
    const variance = rets.reduce((a, b) => a + (b - avg) ** 2, 0) / (rets.length - 1 || 1);
    result.push(Math.sqrt(variance) * Math.sqrt(252));
  }
  return result;
}

// ── 1. SMA Crossover with Volume Confirmation ───────────────────────────

function smaCrossoverStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const closes = data.map((d) => d.close);
  const volumes = data.map((d) => d.volume);
  const fast = sma(closes, 10);
  const slow = sma(closes, 30);
  const volSMA = sma(volumes, 20);
  const atrVals = atr(data, 14);
  const vol = rollingVolatility(closes);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  for (let i = 1; i < data.length; i++) {
    // Exit check
    if (pos) {
      const shouldExit =
        (pos.side === "long" && fast[i] !== null && slow[i] !== null && fast[i]! < slow[i]!) ||
        (pos.side === "short" && fast[i] !== null && slow[i] !== null && fast[i]! > slow[i]!) ||
        (pos.side === "long" && data[i].low <= pos.stopPrice) ||
        (pos.side === "short" && data[i].high >= pos.stopPrice);

      if (shouldExit || i === data.length - 1) {
        let exitPrice = data[i].close;
        let reason = "Signal reversal";
        if (pos.side === "long" && data[i].low <= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (pos.side === "short" && data[i].high >= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (i === data.length - 1) reason = "End of data";

        const trade = closeTrade(data, pos, i, exitPrice, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    // Entry check
    if (!pos && fast[i] !== null && slow[i] !== null && fast[i - 1] !== null && slow[i - 1] !== null && volSMA[i] !== null) {
      const volumeConfirm = data[i].volume > volSMA[i]! * 1.2;
      const atrVal = atrVals[i] ?? data[i].close * 0.02;
      const winRate = total > 0 ? wins / total : 0.5;
      const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;

      if (fast[i - 1]! <= slow[i - 1]! && fast[i]! > slow[i]! && volumeConfirm) {
        const entryPrice = applySlippage(data[i].close, "long", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: entryPrice - atrVal * 2, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      } else if (fast[i - 1]! >= slow[i - 1]! && fast[i]! < slow[i]! && volumeConfirm) {
        const entryPrice = applySlippage(data[i].close, "short", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: entryPrice + atrVal * 2, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
    }
  }
  return trades;
}

// ── 2. RSI Mean Reversion with Trend Filter ──────────────────────────────

function rsiMeanReversionStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const closes = data.map((d) => d.close);
  const rsiVals = rsi(closes, 14);
  const sma200 = sma(closes, 200);
  const atrVals = atr(data, 14);
  const vol = rollingVolatility(closes);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  for (let i = 1; i < data.length; i++) {
    if (pos) {
      const holdBars = i - pos.entryIndex;
      const shouldExit =
        (pos.side === "long" && rsiVals[i] !== null && rsiVals[i]! > 65) ||
        (pos.side === "short" && rsiVals[i] !== null && rsiVals[i]! < 35) ||
        holdBars >= 20 ||
        (pos.side === "long" && data[i].low <= pos.stopPrice) ||
        (pos.side === "short" && data[i].high >= pos.stopPrice);

      if (shouldExit || i === data.length - 1) {
        let exitPrice = data[i].close;
        let reason = "RSI mean reversion target";
        if (pos.side === "long" && data[i].low <= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (pos.side === "short" && data[i].high >= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (holdBars >= 20) reason = "Time exit (20 bars)";
        if (i === data.length - 1) reason = "End of data";

        const trade = closeTrade(data, pos, i, exitPrice, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    if (!pos && rsiVals[i] !== null && sma200[i] !== null) {
      const atrVal = atrVals[i] ?? data[i].close * 0.02;
      const winRate = total > 0 ? wins / total : 0.5;
      const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;

      // Buy oversold in uptrend
      if (rsiVals[i]! < 30 && data[i].close > sma200[i]!) {
        const entryPrice = applySlippage(data[i].close, "long", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: entryPrice - atrVal * 1.5, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
      // Sell overbought in downtrend
      else if (rsiVals[i]! > 70 && data[i].close < sma200[i]!) {
        const entryPrice = applySlippage(data[i].close, "short", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: entryPrice + atrVal * 1.5, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
    }
  }
  return trades;
}

// ── 3. MACD Divergence with Histogram Confirmation ──────────────────────

function macdDivergenceStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const closes = data.map((d) => d.close);
  const m = macd(closes);
  const atrVals = atr(data, 14);
  const vol = rollingVolatility(closes);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  for (let i = 1; i < data.length; i++) {
    if (pos) {
      const shouldExit =
        (pos.side === "long" && m.line[i] !== null && m.signalLine[i] !== null && m.line[i]! < m.signalLine[i]!) ||
        (pos.side === "short" && m.line[i] !== null && m.signalLine[i] !== null && m.line[i]! > m.signalLine[i]!) ||
        (pos.side === "long" && data[i].low <= pos.stopPrice) ||
        (pos.side === "short" && data[i].high >= pos.stopPrice);

      if (shouldExit || i === data.length - 1) {
        let exitPrice = data[i].close;
        let reason = "MACD signal cross";
        if (pos.side === "long" && data[i].low <= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (pos.side === "short" && data[i].high >= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (i === data.length - 1) reason = "End of data";

        const trade = closeTrade(data, pos, i, exitPrice, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    if (!pos && m.line[i] !== null && m.signalLine[i] !== null &&
      m.line[i - 1] !== null && m.signalLine[i - 1] !== null && m.histogram[i] !== null) {
      const atrVal = atrVals[i] ?? data[i].close * 0.02;
      const winRate = total > 0 ? wins / total : 0.5;
      const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;

      // Bullish: MACD crosses above signal + histogram positive and increasing
      if (m.line[i - 1]! <= m.signalLine[i - 1]! && m.line[i]! > m.signalLine[i]! &&
        m.histogram[i]! > 0 && (m.histogram[i - 1] === null || m.histogram[i]! > m.histogram[i - 1]!)) {
        const entryPrice = applySlippage(data[i].close, "long", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: entryPrice - atrVal * 2, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
      // Bearish
      else if (m.line[i - 1]! >= m.signalLine[i - 1]! && m.line[i]! < m.signalLine[i]! &&
        m.histogram[i]! < 0 && (m.histogram[i - 1] === null || m.histogram[i]! < m.histogram[i - 1]!)) {
        const entryPrice = applySlippage(data[i].close, "short", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: entryPrice + atrVal * 2, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
    }
  }
  return trades;
}

// ── 4. Breakout with ATR Stop ────────────────────────────────────────────

function breakoutStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const lookback = 20;
  const closes = data.map((d) => d.close);
  const atrVals = atr(data, 14);
  const vol = rollingVolatility(closes);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  for (let i = lookback; i < data.length; i++) {
    // Update trailing stop
    if (pos && atrVals[i] !== null) {
      const atrVal = atrVals[i]!;
      if (pos.side === "long") {
        if (data[i].high > pos.peakPrice) pos.peakPrice = data[i].high;
        const trailStop = pos.peakPrice - atrVal * 3;
        if (trailStop > pos.stopPrice) pos.stopPrice = trailStop;
      } else {
        if (data[i].low < pos.troughPrice || pos.troughPrice === 0) pos.troughPrice = data[i].low;
        const trailStop = pos.troughPrice + atrVal * 3;
        if (trailStop < pos.stopPrice) pos.stopPrice = trailStop;
      }
    }

    if (pos) {
      const shouldExit =
        (pos.side === "long" && data[i].low <= pos.stopPrice) ||
        (pos.side === "short" && data[i].high >= pos.stopPrice) ||
        (i - pos.entryIndex >= 40);

      if (shouldExit || i === data.length - 1) {
        let exitPrice = data[i].close;
        let reason = "Trailing ATR stop";
        if (pos.side === "long" && data[i].low <= pos.stopPrice) exitPrice = pos.stopPrice;
        if (pos.side === "short" && data[i].high >= pos.stopPrice) exitPrice = pos.stopPrice;
        if (i - pos.entryIndex >= 40) { reason = "Time exit (40 bars)"; }
        if (i === data.length - 1) reason = "End of data";

        const trade = closeTrade(data, pos, i, exitPrice, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    if (!pos) {
      let highestHigh = -Infinity, lowestLow = Infinity;
      for (let j = i - lookback; j < i; j++) {
        if (data[j].high > highestHigh) highestHigh = data[j].high;
        if (data[j].low < lowestLow) lowestLow = data[j].low;
      }
      const atrVal = atrVals[i] ?? data[i].close * 0.02;
      const winRate = total > 0 ? wins / total : 0.5;
      const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;

      if (data[i].close > highestHigh) {
        const entryPrice = applySlippage(data[i].close, "long", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: entryPrice - atrVal * 3, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      } else if (data[i].close < lowestLow) {
        const entryPrice = applySlippage(data[i].close, "short", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: entryPrice + atrVal * 3, peakPrice: entryPrice, troughPrice: data[i].low };
        }
      }
    }
  }
  return trades;
}

// ── 5. Bollinger Squeeze (Bandwidth Squeeze Breakout) ────────────────────

function bollingerSqueezeStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const closes = data.map((d) => d.close);
  const boll = bollingerBands(closes, 20, 2);
  const atrVals = atr(data, 14);
  const vol = rollingVolatility(closes);
  const ema9 = ema(closes, 9);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  // Find periods of low bandwidth (squeeze) then trade the breakout direction
  for (let i = 30; i < data.length; i++) {
    if (pos) {
      const holdBars = i - pos.entryIndex;
      const shouldExit =
        holdBars >= 15 ||
        (pos.side === "long" && data[i].close < (boll.middle[i] ?? data[i].close)) ||
        (pos.side === "short" && data[i].close > (boll.middle[i] ?? data[i].close)) ||
        (pos.side === "long" && data[i].low <= pos.stopPrice) ||
        (pos.side === "short" && data[i].high >= pos.stopPrice);

      if (shouldExit || i === data.length - 1) {
        let exitPrice = data[i].close;
        let reason = "BB middle cross";
        if (pos.side === "long" && data[i].low <= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (pos.side === "short" && data[i].high >= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (holdBars >= 15) reason = "Time exit (15 bars)";
        if (i === data.length - 1) reason = "End of data";

        const trade = closeTrade(data, pos, i, exitPrice, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    if (!pos && boll.bandwidth[i] !== null && boll.bandwidth[i - 1] !== null) {
      // Look for bandwidth at 10-bar low (squeeze)
      let minBW = Infinity;
      for (let j = i - 10; j < i; j++) {
        if (boll.bandwidth[j] !== null && boll.bandwidth[j]! < minBW) minBW = boll.bandwidth[j]!;
      }
      const isSqueezing = boll.bandwidth[i]! <= minBW * 1.05;

      if (isSqueezing && boll.upper[i] !== null && boll.lower[i] !== null) {
        const atrVal = atrVals[i] ?? data[i].close * 0.02;
        const winRate = total > 0 ? wins / total : 0.5;
        const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;

        // Direction determined by EMA slope
        const emaSlope = ema9[i] !== null && ema9[i - 1] !== null ? ema9[i]! - ema9[i - 1]! : 0;

        if (emaSlope > 0 && data[i].close > boll.upper[i]!) {
          const entryPrice = applySlippage(data[i].close, "long", config.slippage);
          const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
          if (shares > 0) {
            pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: boll.lower[i]!, peakPrice: entryPrice, troughPrice: entryPrice };
          }
        } else if (emaSlope < 0 && data[i].close < boll.lower[i]!) {
          const entryPrice = applySlippage(data[i].close, "short", config.slippage);
          const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
          if (shares > 0) {
            pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: boll.upper[i]!, peakPrice: entryPrice, troughPrice: data[i].low };
          }
        }
      }
    }
  }
  return trades;
}

// ── 6. Trend Following (ADX + EMA alignment + trailing stop) ─────────────

function trendFollowingStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const closes = data.map((d) => d.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const adxVals = adx(data, 14);
  const atrVals = atr(data, 14);
  const vol = rollingVolatility(closes);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  for (let i = 1; i < data.length; i++) {
    // Update trailing stop
    if (pos && atrVals[i] !== null) {
      const atrVal = atrVals[i]!;
      if (pos.side === "long") {
        if (data[i].high > pos.peakPrice) pos.peakPrice = data[i].high;
        const trailStop = pos.peakPrice - atrVal * 2.5;
        if (trailStop > pos.stopPrice) pos.stopPrice = trailStop;
      } else {
        if (data[i].low < pos.troughPrice || pos.troughPrice === 0) pos.troughPrice = data[i].low;
        const trailStop = pos.troughPrice + atrVal * 2.5;
        if (trailStop < pos.stopPrice) pos.stopPrice = trailStop;
      }
    }

    if (pos) {
      const shouldExit =
        (pos.side === "long" && data[i].low <= pos.stopPrice) ||
        (pos.side === "short" && data[i].high >= pos.stopPrice) ||
        (adxVals[i] !== null && adxVals[i]! < 20); // trend weakening

      if (shouldExit || i === data.length - 1) {
        let exitPrice = data[i].close;
        let reason = "Trend weakened (ADX < 20)";
        if (pos.side === "long" && data[i].low <= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Trailing stop"; }
        if (pos.side === "short" && data[i].high >= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Trailing stop"; }
        if (i === data.length - 1) reason = "End of data";

        const trade = closeTrade(data, pos, i, exitPrice, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    if (!pos && adxVals[i] !== null && ema20[i] !== null && ema50[i] !== null) {
      const trendStrong = adxVals[i]! > 25;
      const atrVal = atrVals[i] ?? data[i].close * 0.02;
      const winRate = total > 0 ? wins / total : 0.5;
      const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;

      // Long: strong trend + EMA20 > EMA50 + price above EMA20
      if (trendStrong && ema20[i]! > ema50[i]! && data[i].close > ema20[i]!) {
        const entryPrice = applySlippage(data[i].close, "long", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: entryPrice - atrVal * 2.5, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
      // Short: strong trend + EMA20 < EMA50 + price below EMA20
      else if (trendStrong && ema20[i]! < ema50[i]! && data[i].close < ema20[i]!) {
        const entryPrice = applySlippage(data[i].close, "short", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: entryPrice + atrVal * 2.5, peakPrice: entryPrice, troughPrice: data[i].low };
        }
      }
    }
  }
  return trades;
}

// ── 7. Triple Barrier (De Prado) ─────────────────────────────────────────
// Three barriers: (1) profit take, (2) stop loss, (3) time limit
// Entry via momentum signal; exit at whichever barrier is hit first

function tripleBarrierStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const profitTarget = 0.04; // 4% profit target
  const stopLoss = 0.02; // 2% stop loss
  const maxHolding = 10; // 10-bar time barrier
  const closes = data.map((d) => d.close);
  const rsiVals = rsi(closes, 14);
  const sma50 = sma(closes, 50);
  const vol = rollingVolatility(closes);
  const atrVals = atr(data, 14);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  for (let i = 1; i < data.length; i++) {
    if (pos) {
      const holdBars = i - pos.entryIndex;
      let pnlPct: number;
      if (pos.side === "long") {
        pnlPct = (data[i].close - pos.entryPrice) / pos.entryPrice;
      } else {
        pnlPct = (pos.entryPrice - data[i].close) / pos.entryPrice;
      }

      let shouldExit = false;
      let reason = "";

      // Barrier 1: Profit target
      if (pnlPct >= profitTarget) { shouldExit = true; reason = `Profit barrier (+${(profitTarget * 100).toFixed(0)}%)`; }
      // Barrier 2: Stop loss
      else if (pnlPct <= -stopLoss) { shouldExit = true; reason = `Stop barrier (-${(stopLoss * 100).toFixed(0)}%)`; }
      // Barrier 3: Time exit
      else if (holdBars >= maxHolding) { shouldExit = true; reason = `Time barrier (${maxHolding} bars)`; }

      if (shouldExit || i === data.length - 1) {
        if (i === data.length - 1 && !shouldExit) reason = "End of data";
        const trade = closeTrade(data, pos, i, data[i].close, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    if (!pos && rsiVals[i] !== null && sma50[i] !== null) {
      const winRate = total > 0 ? wins / total : 0.5;
      const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;
      const atrVal = atrVals[i] ?? data[i].close * 0.02;

      // Long entry: RSI rising from oversold + above SMA50
      if (rsiVals[i]! < 40 && rsiVals[i - 1] !== null && rsiVals[i]! > rsiVals[i - 1]! && data[i].close > sma50[i]!) {
        const entryPrice = applySlippage(data[i].close, "long", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: entryPrice * (1 - stopLoss), peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
      // Short entry: RSI falling from overbought + below SMA50
      else if (rsiVals[i]! > 60 && rsiVals[i - 1] !== null && rsiVals[i]! < rsiVals[i - 1]! && data[i].close < sma50[i]!) {
        const entryPrice = applySlippage(data[i].close, "short", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: entryPrice * (1 + stopLoss), peakPrice: entryPrice, troughPrice: data[i].low };
        }
      }
    }
  }
  return trades;
}

// ── 8. Mean Reversion + Momentum (Z-Score entry, momentum exit) ──────────

function meanRevMomentumStrategy(data: BarData[], config: BacktestConfig): BacktestTrade[] {
  const closes = data.map((d) => d.close);
  const zScores = zScore(closes, 20);
  const rsiVals = rsi(closes, 14);
  const atrVals = atr(data, 14);
  const vol = rollingVolatility(closes);
  const ema10 = ema(closes, 10);
  const trades: BacktestTrade[] = [];
  let pos: OpenPosition | null = null;
  let equity = config.initialCapital;
  let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;

  for (let i = 1; i < data.length; i++) {
    if (pos) {
      const holdBars = i - pos.entryIndex;
      // Momentum exit: Z-score crosses zero OR RSI hits neutral zone OR time
      const zCrossZero = pos.side === "long"
        ? (zScores[i] !== null && zScores[i]! >= 0)
        : (zScores[i] !== null && zScores[i]! <= 0);
      const rsiNeutral = rsiVals[i] !== null && rsiVals[i]! > 45 && rsiVals[i]! < 55;

      const shouldExit =
        (zCrossZero && holdBars >= 3) ||
        (rsiNeutral && holdBars >= 5) ||
        holdBars >= 25 ||
        (pos.side === "long" && data[i].low <= pos.stopPrice) ||
        (pos.side === "short" && data[i].high >= pos.stopPrice);

      if (shouldExit || i === data.length - 1) {
        let exitPrice = data[i].close;
        let reason = "Z-score mean reversion";
        if (pos.side === "long" && data[i].low <= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (pos.side === "short" && data[i].high >= pos.stopPrice) { exitPrice = pos.stopPrice; reason = "Stop loss"; }
        if (holdBars >= 25) reason = "Time exit (25 bars)";
        if (i === data.length - 1) reason = "End of data";

        const trade = closeTrade(data, pos, i, exitPrice, config, reason);
        trades.push(trade);
        equity += trade.pnl;
        total++;
        if (trade.pnl > 0) { wins++; totalWinAmt += trade.pnl; } else { totalLossAmt += Math.abs(trade.pnl); }
        pos = null;
      }
    }

    if (!pos && zScores[i] !== null) {
      const atrVal = atrVals[i] ?? data[i].close * 0.02;
      const winRate = total > 0 ? wins / total : 0.5;
      const avgWLR = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : 1.5;

      // Buy: Z-score < -2 (deeply oversold)
      if (zScores[i]! < -2) {
        const entryPrice = applySlippage(data[i].close, "long", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "long", entryPrice, entryIndex: i, shares, stopPrice: entryPrice - atrVal * 2, peakPrice: entryPrice, troughPrice: entryPrice };
        }
      }
      // Sell: Z-score > 2 (deeply overbought)
      else if (zScores[i]! > 2) {
        const entryPrice = applySlippage(data[i].close, "short", config.slippage);
        const shares = calculateShares(config, equity, entryPrice, vol[i] ?? 0.2, winRate, avgWLR);
        if (shares > 0) {
          pos = { side: "short", entryPrice, entryIndex: i, shares, stopPrice: entryPrice + atrVal * 2, peakPrice: entryPrice, troughPrice: data[i].low };
        }
      }
    }
  }
  return trades;
}

// ── Strategy Registry ────────────────────────────────────────────────────

export const STRATEGIES: StrategyDef[] = [
  {
    id: "sma-crossover",
    name: "SMA Crossover",
    description: "Fast/slow MA cross with volume confirmation. Classic trend-following approach.",
    category: "trend",
    run: smaCrossoverStrategy,
  },
  {
    id: "rsi-mean-reversion",
    name: "RSI Mean Reversion",
    description: "Buy RSI<30 in uptrend, sell RSI>70 in downtrend. Trend-filtered contrarian.",
    category: "mean-reversion",
    run: rsiMeanReversionStrategy,
  },
  {
    id: "macd-divergence",
    name: "MACD Divergence",
    description: "MACD signal cross with histogram confirmation. Momentum-based entry/exit.",
    category: "momentum",
    run: macdDivergenceStrategy,
  },
  {
    id: "breakout",
    name: "Breakout",
    description: "N-bar high/low breakout with ATR trailing stop. Channel breakout system.",
    category: "breakout",
    run: breakoutStrategy,
  },
  {
    id: "bollinger-squeeze",
    name: "Bollinger Squeeze",
    description: "Low bandwidth squeeze detection then trade the breakout direction.",
    category: "breakout",
    run: bollingerSqueezeStrategy,
  },
  {
    id: "trend-following",
    name: "Trend Following",
    description: "ADX>25 + EMA alignment + trailing stop. Pure trend system.",
    category: "trend",
    run: trendFollowingStrategy,
  },
  {
    id: "triple-barrier",
    name: "Triple Barrier (De Prado)",
    description: "Profit target, stop loss, and time exit barriers. From 'Advances in Financial ML'.",
    category: "composite",
    run: tripleBarrierStrategy,
  },
  {
    id: "mean-rev-momentum",
    name: "Mean Reversion + Momentum",
    description: "Z-score entry with momentum exit. Statistical arbitrage approach.",
    category: "mean-reversion",
    run: meanRevMomentumStrategy,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BACKTEST ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export function runProfessionalBacktest(
  data: BarData[],
  config: BacktestConfig,
): BacktestResult {
  const strategy = STRATEGIES.find((s) => s.id === config.strategyId);
  if (!strategy) {
    throw new Error(`Unknown strategy: ${config.strategyId}`);
  }

  const trades = strategy.run(data, config);

  // Build equity curve
  const equityCurve = buildEquityCurve(data, trades, config.initialCapital);

  // Compute all metrics
  return computeFullMetrics(config, trades, equityCurve, data);
}

function buildEquityCurve(
  data: BarData[],
  trades: BacktestTrade[],
  initialCapital: number,
): { date: string; equity: number; drawdown: number }[] {
  const curve: { date: string; equity: number; drawdown: number }[] = [];
  let equity = initialCapital;
  let peak = initialCapital;

  // Build a map of bar index -> realized PnL
  const pnlByExitDate = new Map<string, number>();
  for (const trade of trades) {
    const existing = pnlByExitDate.get(trade.exitDate) ?? 0;
    pnlByExitDate.set(trade.exitDate, existing + trade.pnl);
  }

  // Track open position unrealized PnL
  let currentTradeIdx = 0;

  for (let i = 0; i < data.length; i++) {
    const dateStr = formatDate(data[i].timestamp);

    // Add realized PnL
    const realized = pnlByExitDate.get(dateStr);
    if (realized !== undefined) {
      equity += realized;
    }

    // Track unrealized for open positions
    let unrealized = 0;
    for (const trade of trades) {
      const entryDateTs = new Date(trade.entryDate).getTime();
      const exitDateTs = new Date(trade.exitDate).getTime();
      if (data[i].timestamp >= entryDateTs && data[i].timestamp < exitDateTs) {
        if (trade.side === "long") {
          unrealized += (data[i].close - trade.entryPrice) * trade.shares;
        } else {
          unrealized += (trade.entryPrice - data[i].close) * trade.shares;
        }
      }
    }

    const totalEquity = equity + unrealized;
    if (totalEquity > peak) peak = totalEquity;
    const drawdown = peak > 0 ? (peak - totalEquity) / peak : 0;

    curve.push({
      date: dateStr,
      equity: +totalEquity.toFixed(2),
      drawdown: +(drawdown * 100).toFixed(2),
    });
  }

  return curve;
}

function computeFullMetrics(
  config: BacktestConfig,
  trades: BacktestTrade[],
  equityCurve: { date: string; equity: number; drawdown: number }[],
  data: BarData[],
): BacktestResult {
  const initialCapital = config.initialCapital;
  const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : initialCapital;
  const totalReturn = (finalEquity - initialCapital) / initialCapital;
  const years = data.length / 252;
  const cagr = years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : 0;

  // Daily returns
  const dailyReturns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity;
    if (prev > 0) dailyReturns.push((equityCurve[i].equity - prev) / prev);
  }

  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
  const variance = dailyReturns.length > 1
    ? dailyReturns.reduce((a, b) => a + (b - avgReturn) ** 2, 0) / (dailyReturns.length - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  // Sortino
  const downsideReturns = dailyReturns.filter((r) => r < 0);
  const downsideVar = downsideReturns.length > 1
    ? downsideReturns.reduce((a, r) => a + r ** 2, 0) / (downsideReturns.length - 1)
    : 0;
  const downsideDev = Math.sqrt(downsideVar);
  const sortinoRatio = downsideDev > 0 ? (avgReturn / downsideDev) * Math.sqrt(252) : 0;

  // Max drawdown and duration
  let maxDrawdown = 0;
  let maxDrawdownDuration = 0;
  let currentDDStart = 0;
  let peak = equityCurve[0]?.equity ?? initialCapital;
  for (let i = 0; i < equityCurve.length; i++) {
    if (equityCurve[i].equity > peak) {
      peak = equityCurve[i].equity;
      currentDDStart = i;
    }
    const dd = (peak - equityCurve[i].equity) / peak;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownDuration = i - currentDDStart;
    }
  }

  // Calmar
  const calmarRatio = maxDrawdown > 0 ? cagr / maxDrawdown : 0;

  // Trade stats
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  const avgWin = wins.length > 0 ? wins.reduce((a, t) => a + t.pnlPercent, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, t) => a + t.pnlPercent, 0) / losses.length : 0;
  const grossProfit = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
  const expectancy = trades.length > 0
    ? trades.reduce((a, t) => a + t.pnl, 0) / trades.length
    : 0;
  const avgRMultiple = trades.length > 0
    ? trades.reduce((a, t) => a + t.rMultiple, 0) / trades.length
    : 0;

  // Consecutive wins/losses
  let maxConsecWins = 0, maxConsecLosses = 0, curWins = 0, curLosses = 0;
  for (const t of trades) {
    if (t.pnl > 0) { curWins++; curLosses = 0; if (curWins > maxConsecWins) maxConsecWins = curWins; }
    else { curLosses++; curWins = 0; if (curLosses > maxConsecLosses) maxConsecLosses = curLosses; }
  }

  const avgHoldingPeriod = trades.length > 0 ? trades.reduce((a, t) => a + t.holdingPeriod, 0) / trades.length : 0;

  // VaR 95 and CVaR 95
  const sortedReturns = [...dailyReturns].sort((a, b) => a - b);
  const var95Idx = Math.floor(sortedReturns.length * 0.05);
  const var95 = sortedReturns.length > 0 ? sortedReturns[var95Idx] : 0;
  const cvar95 = sortedReturns.length > 0
    ? sortedReturns.slice(0, var95Idx + 1).reduce((a, b) => a + b, 0) / (var95Idx + 1 || 1)
    : 0;

  // Ulcer Index
  let sumSqDd = 0;
  let ulcerPeak = equityCurve[0]?.equity ?? initialCapital;
  for (const pt of equityCurve) {
    if (pt.equity > ulcerPeak) ulcerPeak = pt.equity;
    const ddPct = ulcerPeak > 0 ? ((ulcerPeak - pt.equity) / ulcerPeak) * 100 : 0;
    sumSqDd += ddPct ** 2;
  }
  const ulcerIndex = equityCurve.length > 0 ? Math.sqrt(sumSqDd / equityCurve.length) : 0;

  // Monthly returns
  const monthlyReturns = computeMonthlyReturns(equityCurve);

  return {
    config,
    trades,
    equityCurve,
    totalReturn: +(totalReturn * 100).toFixed(2),
    cagr: +(cagr * 100).toFixed(2),
    sharpeRatio: +sharpeRatio.toFixed(2),
    sortinoRatio: +sortinoRatio.toFixed(2),
    calmarRatio: +calmarRatio.toFixed(2),
    maxDrawdown: +(maxDrawdown * 100).toFixed(2),
    maxDrawdownDuration,
    totalTrades: trades.length,
    winRate: +(winRate * 100).toFixed(1),
    avgWin: +avgWin.toFixed(2),
    avgLoss: +avgLoss.toFixed(2),
    profitFactor: +profitFactor.toFixed(2),
    expectancy: +expectancy.toFixed(2),
    avgRMultiple: +avgRMultiple.toFixed(2),
    maxConsecutiveWins: maxConsecWins,
    maxConsecutiveLosses: maxConsecLosses,
    avgHoldingPeriod: +avgHoldingPeriod.toFixed(1),
    var95: +(var95 * 100).toFixed(2),
    cvar95: +(cvar95 * 100).toFixed(2),
    ulcerIndex: +ulcerIndex.toFixed(2),
    monthlyReturns,
  };
}

function computeMonthlyReturns(
  equityCurve: { date: string; equity: number; drawdown: number }[],
): { month: string; return: number }[] {
  if (equityCurve.length < 2) return [];
  const monthMap = new Map<string, { first: number; last: number }>();
  for (const pt of equityCurve) {
    const month = pt.date.substring(0, 7); // YYYY-MM
    const existing = monthMap.get(month);
    if (!existing) {
      monthMap.set(month, { first: pt.equity, last: pt.equity });
    } else {
      existing.last = pt.equity;
    }
  }

  const result: { month: string; return: number }[] = [];
  for (const [month, { first, last }] of monthMap) {
    result.push({ month, return: +(((last - first) / first) * 100).toFixed(2) });
  }
  return result.sort((a, b) => a.month.localeCompare(b.month));
}

// ═══════════════════════════════════════════════════════════════════════════
// WALK-FORWARD ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

export function runWalkForwardAnalysis(
  data: BarData[],
  config: BacktestConfig,
  inSampleBars: number = 200,
  outOfSampleBars: number = 50,
): WalkForwardResult {
  const totalBars = data.length;
  const stepSize = inSampleBars + outOfSampleBars;
  const folds: WalkForwardFold[] = [];
  let foldIndex = 0;

  for (let start = 0; start + stepSize <= totalBars; start += outOfSampleBars) {
    const isEnd = start + stepSize;
    if (isEnd > totalBars) break;

    const inSampleData = data.slice(start, start + inSampleBars);
    const outSampleData = data.slice(start + inSampleBars, start + stepSize);

    if (inSampleData.length < 50 || outSampleData.length < 10) continue;

    const isResult = runProfessionalBacktest(inSampleData, config);
    const oosResult = runProfessionalBacktest(outSampleData, config);

    folds.push({
      foldIndex,
      inSampleReturn: isResult.totalReturn,
      outOfSampleReturn: oosResult.totalReturn,
      inSampleSharpe: isResult.sharpeRatio,
      outOfSampleSharpe: oosResult.sharpeRatio,
      inSampleTrades: isResult.totalTrades,
      outOfSampleTrades: oosResult.totalTrades,
    });

    foldIndex++;
    if (foldIndex >= 10) break; // cap at 10 folds
  }

  if (folds.length === 0) {
    return {
      folds: [],
      inSampleAvgReturn: 0,
      outOfSampleAvgReturn: 0,
      inSampleAvgSharpe: 0,
      outOfSampleAvgSharpe: 0,
      degradationRatio: 0,
      robustnessScore: 0,
    };
  }

  const isAvgReturn = folds.reduce((a, f) => a + f.inSampleReturn, 0) / folds.length;
  const oosAvgReturn = folds.reduce((a, f) => a + f.outOfSampleReturn, 0) / folds.length;
  const isAvgSharpe = folds.reduce((a, f) => a + f.inSampleSharpe, 0) / folds.length;
  const oosAvgSharpe = folds.reduce((a, f) => a + f.outOfSampleSharpe, 0) / folds.length;
  const degradation = isAvgReturn !== 0 ? oosAvgReturn / isAvgReturn : 0;

  // Robustness: % of OOS folds that are profitable, weighted by degradation ratio
  const profitableFolds = folds.filter((f) => f.outOfSampleReturn > 0).length;
  const robustness = Math.min(100, Math.max(0,
    (profitableFolds / folds.length) * 50 +
    Math.min(1, Math.max(0, degradation)) * 30 +
    (oosAvgSharpe > 0 ? Math.min(20, oosAvgSharpe * 10) : 0),
  ));

  return {
    folds,
    inSampleAvgReturn: +isAvgReturn.toFixed(2),
    outOfSampleAvgReturn: +oosAvgReturn.toFixed(2),
    inSampleAvgSharpe: +isAvgSharpe.toFixed(2),
    outOfSampleAvgSharpe: +oosAvgSharpe.toFixed(2),
    degradationRatio: +degradation.toFixed(2),
    robustnessScore: +robustness.toFixed(0),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MONTE CARLO SIMULATION (trade sequence reshuffling)
// ═══════════════════════════════════════════════════════════════════════════

export function runMonteCarloBacktest(
  result: BacktestResult,
  numSims: number = 500,
): MonteCarloBacktestResult {
  const trades = result.trades;
  if (trades.length === 0) {
    return {
      simulations: numSims,
      originalReturn: result.totalReturn,
      originalSharpe: result.sharpeRatio,
      originalMaxDrawdown: result.maxDrawdown,
      confidenceIntervals: [],
      ruinProbability: 0,
      medianReturn: 0,
      medianMaxDrawdown: 0,
    };
  }

  // Seeded PRNG for reproducibility
  let seed = 42;
  function nextRand(): number {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  const simReturns: number[] = [];
  const simSharpes: number[] = [];
  const simMaxDDs: number[] = [];
  const simProfitFactors: number[] = [];
  const simWinRates: number[] = [];
  const initialCapital = result.config.initialCapital;

  for (let s = 0; s < numSims; s++) {
    // Fisher-Yates shuffle of trade sequence
    const shuffled = [...trades];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Simulate equity curve from shuffled trades
    let equity = initialCapital;
    let peak = initialCapital;
    let maxDD = 0;
    const equityPath: number[] = [initialCapital];
    const rets: number[] = [];
    let w = 0;

    for (const trade of shuffled) {
      const prevEquity = equity;
      equity += trade.pnl;
      if (equity > peak) peak = equity;
      const dd = (peak - equity) / peak;
      if (dd > maxDD) maxDD = dd;
      equityPath.push(equity);
      if (prevEquity > 0) rets.push((equity - prevEquity) / prevEquity);
      if (trade.pnl > 0) w++;
    }

    const totalRet = (equity - initialCapital) / initialCapital * 100;
    simReturns.push(totalRet);
    simMaxDDs.push(maxDD * 100);

    const avgR = rets.length > 0 ? rets.reduce((a, b) => a + b, 0) / rets.length : 0;
    const stdR = rets.length > 1
      ? Math.sqrt(rets.reduce((a, b) => a + (b - avgR) ** 2, 0) / (rets.length - 1))
      : 0;
    simSharpes.push(stdR > 0 ? (avgR / stdR) * Math.sqrt(trades.length) : 0);

    const wins = shuffled.filter((t) => t.pnl > 0);
    const losses = shuffled.filter((t) => t.pnl <= 0);
    const gp = wins.reduce((a, t) => a + t.pnl, 0);
    const gl = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
    simProfitFactors.push(gl > 0 ? gp / gl : gp > 0 ? 99 : 0);
    simWinRates.push(shuffled.length > 0 ? (w / shuffled.length) * 100 : 0);
  }

  // Compute percentiles
  const pct = (arr: number[], p: number): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * p / 100);
    return sorted[Math.min(idx, sorted.length - 1)];
  };

  const confidenceIntervals: MonteCarloBacktestResult["confidenceIntervals"] = [
    { metric: "Total Return %", p5: +pct(simReturns, 5).toFixed(2), p25: +pct(simReturns, 25).toFixed(2), p50: +pct(simReturns, 50).toFixed(2), p75: +pct(simReturns, 75).toFixed(2), p95: +pct(simReturns, 95).toFixed(2) },
    { metric: "Sharpe Ratio", p5: +pct(simSharpes, 5).toFixed(2), p25: +pct(simSharpes, 25).toFixed(2), p50: +pct(simSharpes, 50).toFixed(2), p75: +pct(simSharpes, 75).toFixed(2), p95: +pct(simSharpes, 95).toFixed(2) },
    { metric: "Max Drawdown %", p5: +pct(simMaxDDs, 5).toFixed(2), p25: +pct(simMaxDDs, 25).toFixed(2), p50: +pct(simMaxDDs, 50).toFixed(2), p75: +pct(simMaxDDs, 75).toFixed(2), p95: +pct(simMaxDDs, 95).toFixed(2) },
    { metric: "Profit Factor", p5: +pct(simProfitFactors, 5).toFixed(2), p25: +pct(simProfitFactors, 25).toFixed(2), p50: +pct(simProfitFactors, 50).toFixed(2), p75: +pct(simProfitFactors, 75).toFixed(2), p95: +pct(simProfitFactors, 95).toFixed(2) },
    { metric: "Win Rate %", p5: +pct(simWinRates, 5).toFixed(2), p25: +pct(simWinRates, 25).toFixed(2), p50: +pct(simWinRates, 50).toFixed(2), p75: +pct(simWinRates, 75).toFixed(2), p95: +pct(simWinRates, 95).toFixed(2) },
  ];

  // Ruin probability: % of sims with > 50% drawdown
  const ruinProbability = +(simMaxDDs.filter((dd) => dd > 50).length / numSims * 100).toFixed(1);

  return {
    simulations: numSims,
    originalReturn: result.totalReturn,
    originalSharpe: result.sharpeRatio,
    originalMaxDrawdown: result.maxDrawdown,
    confidenceIntervals,
    ruinProbability,
    medianReturn: +pct(simReturns, 50).toFixed(2),
    medianMaxDrawdown: +pct(simMaxDDs, 50).toFixed(2),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNTHETIC DATA GENERATOR (for demo/testing)
// ═══════════════════════════════════════════════════════════════════════════

export function generateSyntheticBars(
  count: number = 500,
  startPrice: number = 100,
  drift: number = 0.0003,
  volatility: number = 0.015,
  seed: number = 12345,
): BarData[] {
  let s = seed;
  function prng(): number {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  }
  // Box-Muller transform for normal distribution
  function randn(): number {
    const u1 = Math.max(0.0001, prng());
    const u2 = prng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  const bars: BarData[] = [];
  let price = startPrice;
  const baseTs = Date.now() - count * 86_400_000;

  for (let i = 0; i < count; i++) {
    const ret = drift + volatility * randn();
    const open = price;
    const close = open * (1 + ret);
    const intraVol = Math.abs(ret) + volatility * 0.5;
    const high = Math.max(open, close) * (1 + Math.abs(randn()) * intraVol * 0.3);
    const low = Math.min(open, close) * (1 - Math.abs(randn()) * intraVol * 0.3);
    const volume = Math.floor(1_000_000 * (0.5 + prng()) * (1 + Math.abs(ret) * 20));

    bars.push({
      timestamp: baseTs + i * 86_400_000,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });

    price = close;
  }

  return bars;
}
