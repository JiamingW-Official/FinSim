// ---------------------------------------------------------------------------
// Earnings Surprise Prediction Model — Momentum + Sector + Historical Factors
// ---------------------------------------------------------------------------

export interface EarningsPrediction {
  ticker: string;
  quarter: string;
  estimatedEPS: number;
  modelPrediction: number;
  beatProbability: number;
  historicalBeatRate: number;
  factors: {
    name: string;
    signal: "positive" | "negative" | "neutral";
    weight: number;
  }[];
  educationalNote: string;
}

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function periodReturn(prices: number[], periods: number): number {
  if (prices.length < periods + 1) return 0;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - 1 - periods];
  if (past === 0) return 0;
  return ((current - past) / past) * 100;
}

function sma(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const window = prices.slice(-period);
  return window.reduce((s, v) => s + v, 0) / period;
}

// ─── Quarter helpers ─────────────────────────────────────────────────────────

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Q${q} ${now.getFullYear()}`;
}

// ─── Sector beat rates (historical averages, simulated) ──────────────────────

const SECTOR_BEAT_RATES: Record<string, number> = {
  Technology: 0.72,
  Consumer: 0.65,
  Financial: 0.68,
  ETF: 0.60,
  Healthcare: 0.70,
  Energy: 0.62,
  Industrials: 0.64,
};

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Predict earnings surprise likelihood using pre-earnings price momentum,
 * analyst revision trends (simulated), sector patterns, and historical beat rate.
 */
export function predictEarningsSurprise(
  ticker: string,
  prices: number[],
  fundamentals: {
    sector: string;
    revenueGrowthYoY: number;
    grossMargin: number;
    analystCount: number;
    lastEarningsResult: string;
  },
): EarningsPrediction {
  // Seed for deterministic simulated analyst revisions
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
  }
  const rand = mulberry32(seed);

  const quarter = getCurrentQuarter();

  // Simulated consensus EPS (based on price level as rough proxy)
  const currentPrice = prices.length > 0 ? prices[prices.length - 1] : 100;
  const estimatedEPS = Math.round((currentPrice / 25) * 100) / 100;

  // ── Factor 1: Pre-earnings Price Momentum (21-day) ──────────────────────
  const preEarningsMomentum = periodReturn(prices, 21);
  let momentumSignal: "positive" | "negative" | "neutral" = "neutral";
  let momentumScore = 0;

  if (preEarningsMomentum > 3) {
    momentumSignal = "positive";
    momentumScore = Math.min(preEarningsMomentum / 10, 1) * 0.2;
  } else if (preEarningsMomentum < -3) {
    momentumSignal = "negative";
    momentumScore = Math.max(preEarningsMomentum / 10, -1) * 0.2;
  }

  // ── Factor 2: Analyst Revision Trend (simulated) ────────────────────────
  // Higher analyst count + positive revision = positive signal
  const revisionTrend = rand() * 2 - 1; // -1 to 1
  const revisedRevision = revisionTrend * (fundamentals.analystCount > 10 ? 0.8 : 0.5);
  let revisionSignal: "positive" | "negative" | "neutral" = "neutral";
  let revisionScore = 0;

  if (revisedRevision > 0.2) {
    revisionSignal = "positive";
    revisionScore = revisedRevision * 0.25;
  } else if (revisedRevision < -0.2) {
    revisionSignal = "negative";
    revisionScore = revisedRevision * 0.25;
  }

  // ── Factor 3: Revenue Growth Trend ──────────────────────────────────────
  let growthSignal: "positive" | "negative" | "neutral" = "neutral";
  let growthScore = 0;
  const revGrowth = fundamentals.revenueGrowthYoY;

  if (revGrowth > 10) {
    growthSignal = "positive";
    growthScore = Math.min(revGrowth / 40, 1) * 0.2;
  } else if (revGrowth < 0) {
    growthSignal = "negative";
    growthScore = Math.max(revGrowth / 20, -1) * 0.2;
  }

  // ── Factor 4: Gross Margin Health ───────────────────────────────────────
  let marginSignal: "positive" | "negative" | "neutral" = "neutral";
  let marginScore = 0;
  const gm = fundamentals.grossMargin;

  if (gm > 50) {
    marginSignal = "positive";
    marginScore = 0.1;
  } else if (gm < 25 && gm > 0) {
    marginSignal = "negative";
    marginScore = -0.05;
  }

  // ── Factor 5: Historical Beat Pattern ───────────────────────────────────
  const lastResult = fundamentals.lastEarningsResult;
  let histSignal: "positive" | "negative" | "neutral" = "neutral";
  let histScore = 0;

  if (lastResult === "beat") {
    histSignal = "positive";
    histScore = 0.1;
  } else if (lastResult === "miss") {
    histSignal = "negative";
    histScore = -0.1;
  }

  // ── Factor 6: Sector Momentum ──────────────────────────────────────────
  const sectorBeatRate = SECTOR_BEAT_RATES[fundamentals.sector] ?? 0.65;
  const sectorMomentum = periodReturn(prices, 63); // ~3 month
  let sectorSignal: "positive" | "negative" | "neutral" = "neutral";
  let sectorScore = 0;

  if (sectorMomentum > 5) {
    sectorSignal = "positive";
    sectorScore = 0.1;
  } else if (sectorMomentum < -5) {
    sectorSignal = "negative";
    sectorScore = -0.05;
  }

  // ── Factor 7: Price vs SMA Alignment ────────────────────────────────────
  const sma50 = sma(prices, 50);
  const priceVsSMA = currentPrice > 0 ? ((currentPrice - sma50) / currentPrice) * 100 : 0;
  let trendSignal: "positive" | "negative" | "neutral" = "neutral";
  let trendScore = 0;

  if (priceVsSMA > 5) {
    trendSignal = "positive";
    trendScore = 0.05;
  } else if (priceVsSMA < -5) {
    trendSignal = "negative";
    trendScore = -0.05;
  }

  // ── Aggregate ───────────────────────────────────────────────────────────
  const totalScore =
    momentumScore + revisionScore + growthScore + marginScore + histScore + sectorScore + trendScore;

  // Base beat probability from sector + adjustment from factors
  const baseProbability = sectorBeatRate * 100;
  const beatProbability = Math.round(
    Math.max(15, Math.min(90, baseProbability + totalScore * 100)),
  );

  // Model prediction: estimated EPS * (1 + adjustment)
  const surprisePct = totalScore * 0.5; // ±% surprise
  const modelPrediction =
    Math.round(estimatedEPS * (1 + surprisePct) * 100) / 100;

  // Historical beat rate for this stock (simulated)
  const historicalBeatRate = Math.round(
    (sectorBeatRate + (rand() - 0.5) * 0.2) * 100,
  );

  // Build factors list
  const factors = [
    {
      name: "Pre-earnings momentum (21d)",
      signal: momentumSignal,
      weight: 0.2,
    },
    {
      name: "Analyst revision trend",
      signal: revisionSignal,
      weight: 0.25,
    },
    {
      name: "Revenue growth YoY",
      signal: growthSignal,
      weight: 0.2,
    },
    {
      name: "Gross margin health",
      signal: marginSignal,
      weight: 0.1,
    },
    {
      name: "Historical beat pattern",
      signal: histSignal,
      weight: 0.1,
    },
    {
      name: "Sector momentum (63d)",
      signal: sectorSignal,
      weight: 0.1,
    },
    {
      name: "Price vs 50-SMA alignment",
      signal: trendSignal,
      weight: 0.05,
    },
  ];

  // Educational note
  const positiveFactors = factors.filter((f) => f.signal === "positive").length;
  const negativeFactors = factors.filter((f) => f.signal === "negative").length;

  let educationalNote =
    "Earnings surprise prediction uses multiple signals to estimate whether a company will beat analyst consensus. ";

  if (positiveFactors > negativeFactors + 2) {
    educationalNote +=
      "A strong positive factor alignment suggests the market may be underestimating this quarter's results. However, markets are efficient and consensus estimates often already incorporate visible trends.";
  } else if (negativeFactors > positiveFactors + 2) {
    educationalNote +=
      "Several negative signals suggest headwinds for this quarter. Be cautious about holding through earnings when multiple factors align negatively. Consider protective puts or reducing position size.";
  } else {
    educationalNote +=
      "Mixed signals suggest uncertainty around this earnings report. In these cases, straddles or strangles can profit from large moves in either direction, though they require significant moves to break even.";
  }

  return {
    ticker,
    quarter,
    estimatedEPS,
    modelPrediction,
    beatProbability,
    historicalBeatRate: Math.max(40, Math.min(85, historicalBeatRate)),
    factors,
    educationalNote,
  };
}
