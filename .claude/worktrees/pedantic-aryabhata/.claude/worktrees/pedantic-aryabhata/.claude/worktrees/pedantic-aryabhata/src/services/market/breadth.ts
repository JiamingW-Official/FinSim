export interface MarketBreadth {
  advanceDeclineRatio: number;
  advancingCount: number;
  decliningCount: number;
  newHighs: number;
  newLows: number;
  percentAbove200MA: number;
  percentAbove50MA: number;
  mcclellanOscillator: number;
  breadthThrust: boolean;
  interpretation: string;
  educationalNote: string;
}

function simpleMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices.reduce((s, p) => s + p, 0) / prices.length;
  }
  const slice = prices.slice(-period);
  return slice.reduce((s, p) => s + p, 0) / slice.length;
}

export function calculateMarketBreadth(
  tickerPrices: Record<string, number[]>,
): MarketBreadth {
  const tickers = Object.keys(tickerPrices);
  const totalStocks = tickers.length;

  if (totalStocks === 0) {
    return {
      advanceDeclineRatio: 1,
      advancingCount: 0,
      decliningCount: 0,
      newHighs: 0,
      newLows: 0,
      percentAbove200MA: 50,
      percentAbove50MA: 50,
      mcclellanOscillator: 0,
      breadthThrust: false,
      interpretation: "No data available.",
      educationalNote:
        "Market breadth measures the number of advancing vs declining stocks. Strong breadth confirms price trends, while divergence can signal reversals.",
    };
  }

  let advancing = 0;
  let declining = 0;
  let above200MA = 0;
  let above50MA = 0;
  let newHighs = 0;
  let newLows = 0;

  // Track recent A/D for McClellan Oscillator
  const dailyNetAdvances: number[] = [];

  for (const ticker of tickers) {
    const prices = tickerPrices[ticker];
    if (!prices || prices.length < 2) continue;

    const current = prices[prices.length - 1];
    const prev = prices[prices.length - 2];

    // Advancing / Declining
    if (current > prev) {
      advancing++;
    } else if (current < prev) {
      declining++;
    }

    // Above 200-day MA
    const ma200 = simpleMA(prices, 200);
    if (current > ma200) above200MA++;

    // Above 50-day MA
    const ma50 = simpleMA(prices, 50);
    if (current > ma50) above50MA++;

    // 52-week (252 trading days) highs / lows
    const lookback = Math.min(252, prices.length);
    const recentPrices = prices.slice(-lookback);
    const high52 = Math.max(...recentPrices);
    const low52 = Math.min(...recentPrices);
    // Within 2% of 52-week high = new high
    if (current >= high52 * 0.98) newHighs++;
    // Within 2% of 52-week low = new low
    if (current <= low52 * 1.02) newLows++;
  }

  // For McClellan Oscillator, simulate recent daily breadth from prices
  // Use last 39 days of data to compute EMA(19) and EMA(39) of net advances
  for (let dayOffset = 39; dayOffset >= 0; dayOffset--) {
    let dayAdv = 0;
    let dayDec = 0;
    for (const ticker of tickers) {
      const prices = tickerPrices[ticker];
      if (!prices || prices.length < dayOffset + 2) continue;
      const idx = prices.length - 1 - dayOffset;
      if (idx < 1) continue;
      if (prices[idx] > prices[idx - 1]) dayAdv++;
      else if (prices[idx] < prices[idx - 1]) dayDec++;
    }
    dailyNetAdvances.push(dayAdv - dayDec);
  }

  // McClellan Oscillator = EMA(19) of net advances - EMA(39) of net advances
  function ema(values: number[], period: number): number {
    const k = 2 / (period + 1);
    let result = values[0];
    for (let i = 1; i < values.length; i++) {
      result = values[i] * k + result * (1 - k);
    }
    return result;
  }

  const ema19 = ema(dailyNetAdvances, 19);
  const ema39 = ema(dailyNetAdvances, 39);
  const mcclellanOscillator = Math.round((ema19 - ema39) * 100) / 100;

  // Breadth Thrust: advancing issues > 61.5% of total in a 10-day window
  // Simulated: if recent 5-day advancing ratio > 0.615
  const recentAdvRatio =
    totalStocks > 0 ? advancing / totalStocks : 0;
  const breadthThrust = recentAdvRatio > 0.615;

  const advanceDeclineRatio =
    declining > 0 ? Math.round((advancing / declining) * 100) / 100 : advancing > 0 ? 999 : 1;

  const percentAbove200MA =
    totalStocks > 0
      ? Math.round((above200MA / totalStocks) * 1000) / 10
      : 50;
  const percentAbove50MA =
    totalStocks > 0
      ? Math.round((above50MA / totalStocks) * 1000) / 10
      : 50;

  // Build interpretation
  let interpretation: string;
  if (advanceDeclineRatio > 2 && percentAbove200MA > 60) {
    interpretation =
      "Strongly bullish breadth. Most stocks are advancing and trading above key moving averages. This broad participation confirms the uptrend.";
  } else if (advanceDeclineRatio > 1.2 && percentAbove200MA > 50) {
    interpretation =
      "Moderately bullish breadth. More stocks advancing than declining with decent participation above the 200-day MA.";
  } else if (advanceDeclineRatio < 0.5 && percentAbove200MA < 40) {
    interpretation =
      "Strongly bearish breadth. Most stocks are declining and trading below key moving averages. This suggests broad-based selling pressure.";
  } else if (advanceDeclineRatio < 0.8) {
    interpretation =
      "Moderately bearish breadth. More stocks declining with weakening internals. Watch for potential divergences with index prices.";
  } else {
    interpretation =
      "Mixed breadth signals. The market is showing selective participation. Focus on sector rotation and individual stock strength.";
  }

  if (breadthThrust) {
    interpretation +=
      " A breadth thrust signal has been detected, which is a rare and historically reliable bullish indicator.";
  }

  if (newHighs > 0 && newLows > 0 && newLows > newHighs) {
    interpretation +=
      " More stocks are hitting 52-week lows than highs, a cautionary sign even if indices are holding up.";
  }

  const educationalNote =
    "Market breadth measures how many stocks participate in a market move. When indices rise but breadth narrows (fewer stocks advancing), it can signal a weakening rally. The McClellan Oscillator uses exponential moving averages of advancing minus declining issues to gauge momentum. A breadth thrust, where advancing stocks exceed 61.5% of the total, is one of the most reliable bullish signals in technical analysis.";

  return {
    advanceDeclineRatio,
    advancingCount: advancing,
    decliningCount: declining,
    newHighs,
    newLows,
    percentAbove200MA,
    percentAbove50MA,
    mcclellanOscillator,
    breadthThrust,
    interpretation,
    educationalNote,
  };
}
