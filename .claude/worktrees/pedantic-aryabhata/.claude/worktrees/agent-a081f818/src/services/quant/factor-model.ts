import type { OHLCVBar } from "@/types/market";
import type { FundamentalsData } from "@/data/fundamentals";

// ─── Types ──────────────────────────────────────────────────────────────────

export type FactorName = "momentum" | "value" | "quality" | "volatility" | "size";

export interface FactorExposure {
  factor: FactorName;
  exposure: number;      // -1 to +1
  signal: "long" | "short" | "neutral";
  confidence: number;    // 0-100
  description: string;
}

export interface FactorAnalysis {
  factors: FactorExposure[];
  dominantFactor: FactorName;
  factorTilt: string;
  recommendation: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function dailyReturns(bars: OHLCVBar[]): number[] {
  const ret: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    if (bars[i - 1].close !== 0) {
      ret.push((bars[i].close - bars[i - 1].close) / bars[i - 1].close);
    }
  }
  return ret;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  const mu = sum / arr.length;
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - mu;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / (arr.length - 1));
}

// ─── Factor Calculations ────────────────────────────────────────────────────

/**
 * Momentum factor: 12-month return minus 1-month return (Jegadeesh & Titman 1993).
 * Positive score = strong upward momentum.
 */
function calcMomentum(bars: OHLCVBar[]): FactorExposure {
  if (bars.length < 22) {
    return {
      factor: "momentum",
      exposure: 0,
      signal: "neutral",
      confidence: 0,
      description: "Insufficient data to calculate momentum.",
    };
  }

  const current = bars[bars.length - 1].close;
  // 12-month return (~252 bars) or max available
  const longIdx = Math.max(0, bars.length - 252);
  const longReturn = (current - bars[longIdx].close) / bars[longIdx].close;

  // 1-month return (~21 bars)
  const shortIdx = Math.max(0, bars.length - 21);
  const shortReturn = (current - bars[shortIdx].close) / bars[shortIdx].close;

  // Momentum signal = 12m return - 1m return (skip recent month to avoid reversal)
  const momentumReturn = longReturn - shortReturn;

  // Normalize to [-1, 1]: +-50% return maps to +-1
  const exposure = clamp(momentumReturn / 0.5, -1, 1);
  const confidence = Math.min(100, Math.abs(momentumReturn) * 200);

  let signal: "long" | "short" | "neutral" = "neutral";
  if (exposure > 0.15) signal = "long";
  else if (exposure < -0.15) signal = "short";

  const direction = momentumReturn > 0 ? "positive" : "negative";
  const pct = (momentumReturn * 100).toFixed(1);

  return {
    factor: "momentum",
    exposure,
    signal,
    confidence: Math.round(confidence),
    description: `${direction === "positive" ? "Positive" : "Negative"} momentum (${pct}% risk-adjusted 12-1 month return). Momentum investors buy recent winners and sell recent losers, expecting trends to persist.`,
  };
}

/**
 * Value factor: Based on P/E and P/B ratios vs sector averages.
 * Low P/E relative to sector = high value exposure (positive).
 */
function calcValue(fundamentals: FundamentalsData): FactorExposure {
  if (fundamentals.peRatio <= 0 && fundamentals.pbRatio <= 0) {
    return {
      factor: "value",
      exposure: 0,
      signal: "neutral",
      confidence: 20,
      description: "Valuation ratios unavailable (ETF or insufficient data).",
    };
  }

  // P/E relative to sector: low ratio = value stock
  let peScore = 0;
  if (fundamentals.peRatio > 0 && fundamentals.sectorAvgPE > 0) {
    const peRelative = fundamentals.peRatio / fundamentals.sectorAvgPE;
    // peRelative < 0.7 = deep value (+1), > 1.5 = expensive (-1)
    peScore = clamp((1.1 - peRelative) / 0.5, -1, 1);
  }

  // P/B: low P/B = value. Normalize around 3.0 as median
  let pbScore = 0;
  if (fundamentals.pbRatio > 0) {
    pbScore = clamp((3 - fundamentals.pbRatio) / 5, -1, 1);
  }

  // Weighted average (P/E gets 60%, P/B gets 40%)
  const exposure = clamp(peScore * 0.6 + pbScore * 0.4, -1, 1);
  const confidence = Math.round(
    Math.min(100, (Math.abs(peScore) + Math.abs(pbScore)) * 50),
  );

  let signal: "long" | "short" | "neutral" = "neutral";
  if (exposure > 0.15) signal = "long";
  else if (exposure < -0.15) signal = "short";

  const valuation =
    exposure > 0.3 ? "undervalued" : exposure < -0.3 ? "expensive" : "fairly valued";

  return {
    factor: "value",
    exposure,
    signal,
    confidence,
    description: `Stock appears ${valuation} (P/E ${fundamentals.peRatio.toFixed(1)}x vs sector ${fundamentals.sectorAvgPE.toFixed(1)}x, P/B ${fundamentals.pbRatio.toFixed(1)}x). Value investors buy cheap stocks, expecting mean reversion to fair value.`,
  };
}

/**
 * Quality factor: ROE, gross margin, debt-to-equity.
 * High ROE + high margins + low debt = positive quality exposure.
 */
function calcQuality(fundamentals: FundamentalsData): FactorExposure {
  if (fundamentals.roe === 0 && fundamentals.grossMargin === 0) {
    return {
      factor: "quality",
      exposure: 0,
      signal: "neutral",
      confidence: 20,
      description: "Quality metrics unavailable for this instrument.",
    };
  }

  // ROE: >20% is excellent, <5% is poor
  const roeScore = clamp((fundamentals.roe - 12) / 15, -1, 1);

  // Gross margin: >60% is excellent, <20% is poor
  const marginScore = clamp((fundamentals.grossMargin - 40) / 30, -1, 1);

  // D/E: <0.5 is excellent, >2.0 is concerning (inverted: low debt = high quality)
  const deScore = clamp((1.0 - fundamentals.debtToEquity) / 1.0, -1, 1);

  // Weighted: ROE 40%, margin 35%, D/E 25%
  const exposure = clamp(
    roeScore * 0.4 + marginScore * 0.35 + deScore * 0.25,
    -1,
    1,
  );
  const confidence = Math.round(
    Math.min(100, (Math.abs(roeScore) + Math.abs(marginScore) + Math.abs(deScore)) * 30),
  );

  let signal: "long" | "short" | "neutral" = "neutral";
  if (exposure > 0.15) signal = "long";
  else if (exposure < -0.15) signal = "short";

  const quality =
    exposure > 0.3 ? "high-quality" : exposure < -0.3 ? "low-quality" : "average-quality";

  return {
    factor: "quality",
    exposure,
    signal,
    confidence,
    description: `${quality === "high-quality" ? "High" : quality === "low-quality" ? "Low" : "Average"} quality profile (ROE ${fundamentals.roe.toFixed(1)}%, GM ${fundamentals.grossMargin.toFixed(1)}%, D/E ${fundamentals.debtToEquity.toFixed(2)}). Quality investors favor profitable, well-managed companies with strong balance sheets.`,
  };
}

/**
 * Volatility factor: Annualized standard deviation of daily returns.
 * Low volatility = positive exposure (low-vol anomaly).
 */
function calcVolatility(bars: OHLCVBar[]): FactorExposure {
  if (bars.length < 22) {
    return {
      factor: "volatility",
      exposure: 0,
      signal: "neutral",
      confidence: 0,
      description: "Insufficient data to calculate volatility factor.",
    };
  }

  const returns = dailyReturns(bars);
  const vol = stdDev(returns) * Math.sqrt(252); // annualized

  // Market average vol ~16%. Low vol (<12%) = positive, high vol (>25%) = negative
  // Inverted: low vol stocks historically outperform on risk-adjusted basis
  const exposure = clamp((0.18 - vol) / 0.12, -1, 1);
  const confidence = Math.round(Math.min(100, Math.abs(vol - 0.18) * 400));

  let signal: "long" | "short" | "neutral" = "neutral";
  if (exposure > 0.15) signal = "long";
  else if (exposure < -0.15) signal = "short";

  const volLevel =
    vol < 0.15 ? "low" : vol > 0.25 ? "high" : "moderate";

  return {
    factor: "volatility",
    exposure,
    signal,
    confidence,
    description: `${volLevel.charAt(0).toUpperCase() + volLevel.slice(1)} volatility (${(vol * 100).toFixed(1)}% annualized). The low-volatility anomaly shows that less volatile stocks tend to deliver better risk-adjusted returns over time.`,
  };
}

/**
 * Size factor: Based on market capitalization.
 * Small cap = positive exposure (small-cap premium).
 */
function calcSize(fundamentals: FundamentalsData): FactorExposure {
  const marketCap = fundamentals.marketCapNum; // in billions

  if (marketCap <= 0) {
    return {
      factor: "size",
      exposure: 0,
      signal: "neutral",
      confidence: 20,
      description: "Market cap data unavailable.",
    };
  }

  // Size premium: small caps (< $10B) historically outperform large caps
  // Map: $2B -> +1, $50B -> 0, $2000B -> -1 (log scale)
  const logCap = Math.log10(marketCap);
  // log10(2) = 0.3, log10(50) = 1.7, log10(2000) = 3.3
  const exposure = clamp((1.7 - logCap) / 1.6, -1, 1);
  const confidence = Math.round(Math.min(100, Math.abs(1.7 - logCap) * 50));

  let signal: "long" | "short" | "neutral" = "neutral";
  if (exposure > 0.15) signal = "long";
  else if (exposure < -0.15) signal = "short";

  const sizeLabel =
    marketCap < 10
      ? "Small-cap"
      : marketCap < 100
        ? "Mid-cap"
        : "Large-cap";

  return {
    factor: "size",
    exposure,
    signal,
    confidence,
    description: `${sizeLabel} (${fundamentals.marketCap}). Historically, smaller companies have earned higher returns (the size premium), compensating investors for higher risk and less liquidity.`,
  };
}

// ─── Main Analysis Function ─────────────────────────────────────────────────

/**
 * Analyze factor exposures for a given ticker.
 *
 * @param ticker - Stock ticker symbol
 * @param bars - OHLCV price history
 * @param fundamentals - Fundamental data for the stock
 */
export function analyzeFactors(
  ticker: string,
  bars: OHLCVBar[],
  fundamentals: FundamentalsData,
): FactorAnalysis {
  const factors: FactorExposure[] = [
    calcMomentum(bars),
    calcValue(fundamentals),
    calcQuality(fundamentals),
    calcVolatility(bars),
    calcSize(fundamentals),
  ];

  // Find dominant factor (highest absolute exposure with decent confidence)
  let dominant: FactorExposure = factors[0];
  let maxScore = 0;
  for (const f of factors) {
    const score = Math.abs(f.exposure) * (f.confidence / 100);
    if (score > maxScore) {
      maxScore = score;
      dominant = f;
    }
  }

  // Generate tilt description
  const positiveFactors = factors
    .filter((f) => f.exposure > 0.2)
    .map((f) => f.factor);
  const negativeFactors = factors
    .filter((f) => f.exposure < -0.2)
    .map((f) => f.factor);

  let factorTilt = "Balanced exposure";
  if (positiveFactors.length > 0) {
    const labels: Record<FactorName, string> = {
      momentum: "Momentum",
      value: "Value",
      quality: "Quality",
      volatility: "Low-Vol",
      size: "Small-Cap",
    };
    factorTilt = positiveFactors.map((f) => labels[f]).join("-") + " tilt";
  }

  // Educational recommendation
  const recs: string[] = [];
  for (const f of factors) {
    if (f.signal === "long" && f.confidence >= 40) {
      if (f.factor === "momentum")
        recs.push("Strong price momentum favors trend-following strategies.");
      if (f.factor === "value")
        recs.push("Low valuation multiples suggest potential upside to fair value.");
      if (f.factor === "quality")
        recs.push("High profitability and strong balance sheet reduce downside risk.");
      if (f.factor === "volatility")
        recs.push("Low volatility profile suits risk-averse portfolios.");
      if (f.factor === "size")
        recs.push("Small-cap status offers growth potential with the size premium.");
    } else if (f.signal === "short" && f.confidence >= 40) {
      if (f.factor === "momentum")
        recs.push("Weak momentum suggests caution with trend-following approaches.");
      if (f.factor === "value")
        recs.push("Rich valuation multiples mean high expectations are already priced in.");
      if (f.factor === "quality")
        recs.push("Weaker quality metrics warrant careful position sizing.");
      if (f.factor === "volatility")
        recs.push("Higher volatility demands wider stops and smaller positions.");
    }
  }

  const recommendation =
    recs.length > 0
      ? `${ticker} factor profile: ${recs.slice(0, 3).join(" ")}`
      : `${ticker} shows balanced factor exposures with no dominant style tilt. Consider diversifying across multiple factor strategies.`;

  return {
    factors,
    dominantFactor: dominant.factor,
    factorTilt,
    recommendation,
  };
}
