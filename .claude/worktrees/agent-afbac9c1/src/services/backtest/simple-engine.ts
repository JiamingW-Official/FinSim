// Simplified backtesting engine using seeded synthetic price data.
// This is a lightweight alternative to engine.ts for the BacktestPanel UI.
// `runBacktest` is exported as an alias for `runSimpleBacktest` for forward-compat.

export interface SimpleBacktestResult {
  strategyId: string;
  ticker: string;
  totalTrades: number;
  winRate: number;
  totalReturn: number; // %
  maxDrawdown: number; // %
  sharpeRatio: number;
  calmarRatio: number;
  avgHoldDays: number;
  avgWin: number; // % per winning trade
  avgLoss: number; // % per losing trade
  profitFactor: number;
  trades: SimpleBacktestTrade[];
  tradeLog: TradeLogEntry[];
  equityCurve: { bar: number; equity: number }[];
}

export interface SimpleBacktestTrade {
  entryBar: number;
  exitBar: number;
  entryPrice: number;
  exitPrice: number;
  pnlPct: number;
  side: "long" | "short";
}

/** Compact trade-by-trade log entry */
export interface TradeLogEntry {
  /** Bar index at entry */
  entry: number;
  /** Bar index at exit */
  exit: number;
  /** P&L in dollars (based on $10k equity fraction per trade) */
  pnl: number;
  /** Number of bars held */
  bars: number;
}

// Mulberry32 PRNG — fast, seeded, portable
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// SMA over arr[0..i] with given period
function sma(arr: number[], period: number, i: number): number {
  if (i < period - 1) return arr[i];
  let sum = 0;
  for (let k = i - period + 1; k <= i; k++) sum += arr[k];
  return sum / period;
}

// Standard deviation of arr[i-period+1..i]
function rollingStd(arr: number[], period: number, i: number): number {
  if (i < period - 1) return 0;
  const mean = sma(arr, period, i);
  let sq = 0;
  for (let k = i - period + 1; k <= i; k++) sq += (arr[k] - mean) ** 2;
  return Math.sqrt(sq / period);
}

// EMA helper (iterative, memoised in array)
function buildEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = new Array(prices.length).fill(0);
  result[0] = prices[0];
  for (let i = 1; i < prices.length; i++) {
    result[i] = prices[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

// ATR (true range approximation using close-to-close as proxy, since we only have closes)
function buildATR(prices: number[], period: number): number[] {
  const trs: number[] = [0];
  for (let i = 1; i < prices.length; i++) {
    trs.push(Math.abs(prices[i] - prices[i - 1]));
  }
  // Wilder smoothing
  const atr: number[] = new Array(prices.length).fill(0);
  let sum = 0;
  for (let i = 1; i <= period && i < prices.length; i++) sum += trs[i];
  atr[period] = sum / period;
  for (let i = period + 1; i < prices.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + trs[i]) / period;
  }
  return atr;
}

// Z-score of price relative to its rolling mean/std
function buildZScore(prices: number[], period: number): number[] {
  const z: number[] = new Array(prices.length).fill(0);
  for (let i = period - 1; i < prices.length; i++) {
    const mean = sma(prices, period, i);
    const std = rollingStd(prices, period, i);
    z[i] = std > 0 ? (prices[i] - mean) / std : 0;
  }
  return z;
}

// Realized volatility (annualized %, using daily log-return approximation)
function buildRealizedVol(prices: number[], period: number): number[] {
  const vol: number[] = new Array(prices.length).fill(0);
  for (let i = period; i < prices.length; i++) {
    let sqSum = 0;
    for (let k = i - period + 1; k <= i; k++) {
      const r = prices[k - 1] > 0 ? (prices[k] - prices[k - 1]) / prices[k - 1] : 0;
      sqSum += r * r;
    }
    // annualized in %: sqrt(252 * variance) * 100
    vol[i] = Math.sqrt((sqSum / period) * 252) * 100;
  }
  return vol;
}

export function runSimpleBacktest(
  strategyId: string,
  ticker: string,
  params: Record<string, number>,
  bars: number = 252,
): SimpleBacktestResult {
  // Generate synthetic price series via Brownian bridge
  const rng = mulberry32(ticker.charCodeAt(0) * 1000 + strategyId.length * 37);
  const prices: number[] = [100];
  for (let i = 1; i < bars; i++) {
    const change = (rng() - 0.49) * 0.025;
    prices.push(prices[i - 1] * (1 + change));
  }

  const trades: SimpleBacktestTrade[] = [];
  const equity: { bar: number; equity: number }[] = [{ bar: 0, equity: 10000 }];
  let cash = 10000;
  let position: { entry: number; bar: number; stop?: number; peakPrice?: number } | null = null;

  // Pre-build indicator series that need full array
  const ema12 = buildEMA(prices, 12);
  const ema26 = buildEMA(prices, 26);
  const signalEMA = buildEMA(
    ema12.map((v, i) => v - ema26[i]),
    params.signal ?? 9,
  );

  // Pre-build series for new strategies
  const zScores = buildZScore(prices, Math.floor(params.period ?? 20));
  const atrVals = buildATR(prices, Math.floor(params.atrPeriod ?? 14));
  const realizedVol = buildRealizedVol(prices, Math.floor(params.volPeriod ?? 20));

  for (let i = 20; i < bars; i++) {
    const price = prices[i];
    let shouldBuy = false;
    let shouldSell = false;

    if (strategyId === "sma_crossover") {
      const fast = sma(prices, params.fastPeriod ?? 20, i);
      const fastPrev = sma(prices, params.fastPeriod ?? 20, i - 1);
      const slow = sma(prices, params.slowPeriod ?? 50, i);
      const slowPrev = sma(prices, params.slowPeriod ?? 50, i - 1);
      shouldBuy = fastPrev < slowPrev && fast > slow;
      shouldSell = fastPrev > slowPrev && fast < slow;

    } else if (strategyId === "rsi_reversion") {
      const period = params.period ?? 14;
      const slice = prices.slice(Math.max(0, i - period), i + 1);
      let gains = 0, losses = 0;
      for (let j = 1; j < slice.length; j++) {
        const diff = slice[j] - slice[j - 1];
        if (diff > 0) gains += diff;
        else losses += -diff;
      }
      gains /= period;
      losses /= period;
      const rsi = losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);
      shouldBuy = rsi < (params.oversold ?? 30);
      shouldSell = rsi > (params.overbought ?? 70);

    } else if (strategyId === "breakout") {
      const ep = Math.floor(params.entryPeriod ?? 20);
      const xp = Math.floor(params.exitPeriod ?? 10);
      const highWindow = prices.slice(Math.max(0, i - ep), i);
      const lowWindow = prices.slice(Math.max(0, i - xp), i);
      const periodHigh = highWindow.length > 0 ? Math.max(...highWindow) : price;
      const periodLow = lowWindow.length > 0 ? Math.min(...lowWindow) : price;
      shouldBuy = price > periodHigh;
      shouldSell = price < periodLow;

    } else if (strategyId === "macd_trend") {
      const hist = ema12[i] - ema26[i] - signalEMA[i];
      const histPrev = ema12[i - 1] - ema26[i - 1] - signalEMA[i - 1];
      shouldBuy = histPrev <= 0 && hist > 0;
      shouldSell = histPrev >= 0 && hist < 0;

    } else if (strategyId === "bollinger_mean") {
      const bbPeriod = Math.floor(params.period ?? 20);
      const bbStd = params.stdDev ?? 2;
      const mid = sma(prices, bbPeriod, i);
      const std = rollingStd(prices, bbPeriod, i);
      const lower = mid - bbStd * std;
      shouldBuy = price < lower;
      shouldSell = price > mid;

    } else if (strategyId === "mean_reversion_2std") {
      const period = Math.floor(params.period ?? 20);
      const entryStd = params.entryStd ?? 2;
      const exitStd = params.exitStd ?? 1;
      const mid = sma(prices, period, i);
      const std = rollingStd(prices, period, i);
      shouldBuy = price < mid - entryStd * std;
      shouldSell = price > mid + exitStd * std;

    } else if (strategyId === "momentum_3m") {
      const lookback = Math.floor(params.lookback ?? 63);
      const rebalance = Math.floor(params.rebalance ?? 21);
      const window = Math.floor(params.window ?? 126);
      // Only check signals on rebalance intervals
      const isRebalanceBar = i % rebalance === 0;
      if (isRebalanceBar && i >= lookback + window) {
        // Compute 63-bar return of current position relative to recent window
        const currentMomentum = prices[i - 1] > 0 ? (prices[i] - prices[i - lookback]) / prices[i - lookback] : 0;
        // Gather a distribution of momentum values from the window
        const momentumSamples: number[] = [];
        for (let k = i - window; k < i - lookback; k++) {
          if (prices[k] > 0) {
            momentumSamples.push((prices[k + lookback] - prices[k]) / prices[k]);
          }
        }
        if (momentumSamples.length > 4) {
          momentumSamples.sort((a, b) => a - b);
          const p75 = momentumSamples[Math.floor(momentumSamples.length * 0.75)];
          const p50 = momentumSamples[Math.floor(momentumSamples.length * 0.50)];
          shouldBuy = currentMomentum > p75;
          shouldSell = currentMomentum < p50;
        }
      }

    } else if (strategyId === "pairs_trading") {
      // Simulated spread: compare price to a synthetic "pair" price (phase-shifted)
      const period = Math.floor(params.period ?? 20);
      const entryZ = params.entryZ ?? 2;
      const exitZ = params.exitZ ?? 0.5;
      // Use z-score as a proxy for spread deviation
      const z = zScores[i];
      if (position) {
        // Long position: entered when z was < -entryZ, exit when z > -exitZ
        // Short position: entered when z was > entryZ, exit when z < exitZ
        const exitLong = position && z > -exitZ;
        const exitShort = position && z < exitZ;
        shouldSell = exitLong || exitShort;
      } else {
        shouldBuy = z < -entryZ;
        // Short signal stored separately via shouldSell when no position — handled below
        if (z > entryZ) {
          // Short sell: treat as shouldBuy=false, shouldSell=true but open a short
          // For simplicity in this engine we only go long
          shouldBuy = false;
        }
      }

    } else if (strategyId === "trend_atr_stop") {
      const breakoutPeriod = Math.floor(params.breakoutPeriod ?? 20);
      const atrMult = params.atrMult ?? 2;
      const highWindow = prices.slice(Math.max(0, i - breakoutPeriod), i);
      const periodHigh = highWindow.length > 0 ? Math.max(...highWindow) : price;
      const atr = atrVals[i] > 0 ? atrVals[i] : price * 0.02;

      if (position) {
        // Update trailing stop
        if (position.peakPrice === undefined || price > position.peakPrice) {
          position.peakPrice = price;
        }
        const trailStop = position.peakPrice - atrMult * atr;
        if (position.stop === undefined || trailStop > position.stop) {
          position.stop = trailStop;
        }
        shouldSell = price <= (position.stop ?? position.entry - atrMult * atr);
      } else {
        shouldBuy = price > periodHigh;
      }

    } else if (strategyId === "volatility_breakout") {
      const volThreshold = params.volThreshold ?? 25;
      const holdBars = Math.floor(params.holdBars ?? 10);
      const vol = realizedVol[i];

      if (position) {
        // Exit after fixed hold period
        shouldSell = i - position.bar >= holdBars;
      } else {
        // Enter on volatility spike above threshold
        shouldBuy = vol > volThreshold;
      }

    } else {
      // Fallback: sparse random signals
      shouldBuy = rng() < 0.05 && !position;
      shouldSell = rng() < 0.08 && !!position;
    }

    if (shouldBuy && !position) {
      position = { entry: price, bar: i };
    } else if (shouldSell && position) {
      const pnlPct = ((price - position.entry) / position.entry) * 100;
      cash *= 1 + pnlPct / 100;
      trades.push({
        entryBar: position.bar,
        exitBar: i,
        entryPrice: position.entry,
        exitPrice: price,
        pnlPct,
        side: "long",
      });
      position = null;
    }

    equity.push({ bar: i, equity: Math.round(cash) });
  }

  // Close any open position at the last bar
  if (position) {
    const price = prices[bars - 1];
    const pnlPct = ((price - position.entry) / position.entry) * 100;
    cash *= 1 + pnlPct / 100;
    trades.push({
      entryBar: position.bar,
      exitBar: bars - 1,
      entryPrice: position.entry,
      exitPrice: price,
      pnlPct,
      side: "long",
    });
    equity[equity.length - 1] = { bar: bars - 1, equity: Math.round(cash) };
  }

  // ── Metrics ──────────────────────────────────────────────────────────────

  const wins = trades.filter((t) => t.pnlPct > 0);
  const losses = trades.filter((t) => t.pnlPct <= 0);
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  const totalReturn = ((cash - 10000) / 10000) * 100;

  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnlPct, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnlPct, 0) / losses.length : 0;

  const grossWin = wins.reduce((s, t) => s + t.pnlPct, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnlPct, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0;

  const returns = equity
    .map((e, i) => (i > 0 ? (e.equity - equity[i - 1].equity) / equity[i - 1].equity : 0))
    .slice(1);
  const avgReturn = returns.reduce((s, v) => s + v, 0) / (returns.length || 1);
  const stdReturn = Math.sqrt(
    returns.reduce((s, v) => s + (v - avgReturn) ** 2, 0) / (returns.length || 1),
  );
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;

  let peak = 10000;
  let maxDrawdown = 0;
  for (const e of equity) {
    if (e.equity > peak) peak = e.equity;
    const dd = ((peak - e.equity) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Calmar: annualized return / max drawdown
  const years = bars / 252;
  const cagr = years > 0 ? (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100 : 0;
  const calmarRatio = maxDrawdown > 0 ? cagr / maxDrawdown : 0;

  const avgHoldDays =
    trades.length > 0
      ? trades.reduce((s, t) => s + (t.exitBar - t.entryBar), 0) / trades.length
      : 0;

  // Trade log: compact dollar P&L per trade (proportional to $10k)
  const tradeLog: TradeLogEntry[] = trades.map((t) => ({
    entry: t.entryBar,
    exit: t.exitBar,
    pnl: +(10000 * (t.pnlPct / 100)).toFixed(2),
    bars: t.exitBar - t.entryBar,
  }));

  return {
    strategyId,
    ticker,
    totalTrades: trades.length,
    winRate,
    totalReturn,
    maxDrawdown,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    calmarRatio: Math.round(calmarRatio * 100) / 100,
    avgHoldDays: Math.round(avgHoldDays),
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    trades,
    tradeLog,
    equityCurve: equity,
  };
}

/** Alias for runSimpleBacktest — allows importing as `runBacktest` for forward compatibility. */
export const runBacktest = runSimpleBacktest;
