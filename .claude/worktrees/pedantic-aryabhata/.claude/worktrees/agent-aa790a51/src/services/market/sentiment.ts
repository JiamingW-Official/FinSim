export type SentimentLevel =
  | "extreme_fear"
  | "fear"
  | "neutral"
  | "greed"
  | "extreme_greed";

export interface SentimentComponent {
  name: string;
  value: number; // 0-100
  signal: string;
  weight: number;
}

export interface MarketSentiment {
  overall: number; // 0-100
  level: SentimentLevel;
  components: SentimentComponent[];
  historicalAvg: number;
  educationalNote: string;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function simpleMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((s, p) => s + p, 0) / slice.length;
}

function getSentimentLevel(score: number): SentimentLevel {
  if (score <= 20) return "extreme_fear";
  if (score <= 40) return "fear";
  if (score <= 60) return "neutral";
  if (score <= 80) return "greed";
  return "extreme_greed";
}

/**
 * Market Momentum: SPY price relative to its 125-day moving average.
 * Above MA = greed territory, below = fear territory.
 */
function calcMarketMomentum(prices: number[]): SentimentComponent {
  const ma125 = simpleMA(prices, 125);
  const current = prices[prices.length - 1];
  const diff = ((current - ma125) / ma125) * 100;
  // Map -10% to +10% range to 0-100
  const value = clamp(50 + diff * 5, 0, 100);
  const signal =
    diff > 2
      ? "SPY trading well above 125-day MA"
      : diff > 0
        ? "SPY slightly above 125-day MA"
        : diff > -2
          ? "SPY slightly below 125-day MA"
          : "SPY trading well below 125-day MA";
  return { name: "Market Momentum", value, signal, weight: 0.25 };
}

/**
 * Stock Price Strength: ratio of stocks near 52-week highs vs lows.
 * Simulated from recent price momentum.
 */
function calcPriceStrength(prices: number[]): SentimentComponent {
  if (prices.length < 252) {
    const recentReturn =
      prices.length > 20
        ? (prices[prices.length - 1] - prices[prices.length - 20]) /
          prices[prices.length - 20]
        : 0;
    const value = clamp(50 + recentReturn * 500, 0, 100);
    const signal =
      value > 60
        ? "More stocks near 52-week highs than lows"
        : value < 40
          ? "More stocks near 52-week lows than highs"
          : "Balanced highs vs lows";
    return { name: "Stock Price Strength", value, signal, weight: 0.15 };
  }
  const high252 = Math.max(...prices.slice(-252));
  const low252 = Math.min(...prices.slice(-252));
  const current = prices[prices.length - 1];
  const pctFromHigh = (current - low252) / (high252 - low252 || 1);
  const value = clamp(pctFromHigh * 100, 0, 100);
  const signal =
    value > 70
      ? "More stocks near 52-week highs than lows"
      : value < 30
        ? "More stocks near 52-week lows than highs"
        : "Balanced highs vs lows";
  return { name: "Stock Price Strength", value, signal, weight: 0.15 };
}

/**
 * Market Volatility (VIX): inverse relationship with sentiment.
 * VIX < 15 = extreme greed, VIX > 30 = extreme fear.
 */
function calcVolatility(
  prices: number[],
  vixLevel?: number,
): SentimentComponent {
  let vix = vixLevel;
  if (vix === undefined) {
    // Simulate VIX from recent realized volatility
    const returns: number[] = [];
    const lookback = Math.min(30, prices.length - 1);
    for (let i = prices.length - lookback; i < prices.length; i++) {
      if (i > 0) {
        returns.push(Math.log(prices[i] / prices[i - 1]));
      }
    }
    const mean = returns.reduce((s, r) => s + r, 0) / (returns.length || 1);
    const variance =
      returns.reduce((s, r) => s + (r - mean) ** 2, 0) /
      (returns.length - 1 || 1);
    vix = Math.sqrt(variance * 252) * 100; // annualized vol in percent
    vix = clamp(vix, 10, 50);
  }
  // Map VIX: 10=100(extreme greed), 20=50(neutral), 35+=0(extreme fear)
  const value = clamp(100 - ((vix - 10) / 25) * 100, 0, 100);
  const ma50Vix = vix; // simplified — in real we'd compare to 50-day MA of VIX
  const signal =
    vix < 15
      ? `VIX at ${vix.toFixed(1)} signals complacency`
      : vix < 20
        ? `VIX at ${vix.toFixed(1)} indicates low volatility`
        : vix < 25
          ? `VIX at ${vix.toFixed(1)} shows moderate concern`
          : `VIX at ${vix.toFixed(1)} signals elevated fear`;
  void ma50Vix;
  return { name: "Market Volatility (VIX)", value, signal, weight: 0.2 };
}

/**
 * Put/Call Ratio: simulated from price trend.
 * High put/call = fear, low = greed.
 */
function calcPutCallRatio(prices: number[]): SentimentComponent {
  const lookback = Math.min(20, prices.length - 1);
  const recentReturn =
    lookback > 0
      ? (prices[prices.length - 1] - prices[prices.length - 1 - lookback]) /
        prices[prices.length - 1 - lookback]
      : 0;
  // Simulated put/call ratio: negative returns -> higher ratio
  const pcr = clamp(0.9 - recentReturn * 5, 0.5, 1.5);
  // PCR > 1.1 = fear (bullish contrarian), PCR < 0.7 = greed
  const value = clamp(((1.1 - pcr) / 0.6) * 100, 0, 100);
  const signal =
    pcr > 1.1
      ? `Put/Call ratio at ${pcr.toFixed(2)} signals hedging demand`
      : pcr > 0.9
        ? `Put/Call ratio at ${pcr.toFixed(2)} shows moderate caution`
        : `Put/Call ratio at ${pcr.toFixed(2)} signals bullish positioning`;
  return { name: "Put/Call Ratio", value, signal, weight: 0.15 };
}

/**
 * Safe Haven Demand: simulated bond vs stock flow.
 * Money flowing into bonds = fear, into stocks = greed.
 */
function calcSafeHavenDemand(prices: number[]): SentimentComponent {
  // Use rolling 20-day volatility as proxy for safe haven demand
  const lookback = Math.min(20, prices.length - 1);
  const returns: number[] = [];
  for (let i = prices.length - lookback; i < prices.length; i++) {
    if (i > 0) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const avgReturn =
    returns.reduce((s, r) => s + r, 0) / (returns.length || 1);
  const vol = Math.sqrt(
    returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) /
      (returns.length - 1 || 1),
  );
  // Low vol + positive returns = greed (no safe haven demand)
  const trendScore = clamp(avgReturn * 1000, -5, 5);
  const volPenalty = clamp(vol * 100, 0, 5);
  const value = clamp(50 + trendScore * 8 - volPenalty * 4, 0, 100);
  const signal =
    value > 60
      ? "Low demand for safe haven assets"
      : value < 40
        ? "Elevated demand for bonds and safe havens"
        : "Balanced flow between stocks and bonds";
  return { name: "Safe Haven Demand", value, signal, weight: 0.15 };
}

/**
 * Junk Bond Demand: simulated credit spread.
 * Tight spreads = greed, wide spreads = fear.
 */
function calcJunkBondDemand(prices: number[]): SentimentComponent {
  // Use price momentum and volatility as proxy
  const lookback = Math.min(50, prices.length - 1);
  const ret =
    lookback > 0
      ? (prices[prices.length - 1] - prices[prices.length - 1 - lookback]) /
        prices[prices.length - 1 - lookback]
      : 0;
  // Positive returns and trending market = tight spreads = greed
  const value = clamp(50 + ret * 300, 0, 100);
  const signal =
    value > 60
      ? "Tight credit spreads indicate risk appetite"
      : value < 40
        ? "Widening credit spreads signal risk aversion"
        : "Credit spreads at neutral levels";
  return { name: "Junk Bond Demand", value, signal, weight: 0.1 };
}

export function calculateMarketSentiment(
  spyPrices: number[],
  vixLevel?: number,
): MarketSentiment {
  if (spyPrices.length < 5) {
    return {
      overall: 50,
      level: "neutral",
      components: [],
      historicalAvg: 50,
      educationalNote:
        "The Fear & Greed Index measures market sentiment using multiple indicators. Values below 25 indicate extreme fear (potential buying opportunity), while values above 75 suggest extreme greed (potential caution signal).",
    };
  }

  const components: SentimentComponent[] = [
    calcMarketMomentum(spyPrices),
    calcPriceStrength(spyPrices),
    calcVolatility(spyPrices, vixLevel),
    calcPutCallRatio(spyPrices),
    calcSafeHavenDemand(spyPrices),
    calcJunkBondDemand(spyPrices),
  ];

  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const overall = Math.round(
    components.reduce((s, c) => s + c.value * c.weight, 0) / totalWeight,
  );
  const level = getSentimentLevel(overall);

  // Historical average: simulated as slightly above neutral
  const historicalAvg = 52;

  const educationalNote =
    level === "extreme_fear"
      ? 'The Fear & Greed Index is at extreme fear levels. Warren Buffett famously said "Be greedy when others are fearful." Historically, extreme fear has preceded above-average forward returns, though timing the exact bottom is difficult.'
      : level === "fear"
        ? "The market is in fear territory. While this can signal a buying opportunity, it is important to understand what is driving the fear. Check individual indicators for more context."
        : level === "neutral"
          ? "The Fear & Greed Index is near neutral, indicating balanced market sentiment. Neither excessive optimism nor pessimism is dominating. This is often a stable environment for stock-picking."
          : level === "greed"
            ? "The market is in greed territory. While momentum can continue, elevated greed levels suggest caution. Consider whether positions are appropriately sized and hedged."
            : 'The Fear & Greed Index is at extreme greed. Historically, extreme greed has often preceded market pullbacks. Consider taking profits or tightening stops. "Be fearful when others are greedy."';

  return { overall, level, components, historicalAvg, educationalNote };
}
