export type MarketRegime =
  | "strong_bull"
  | "bull"
  | "ranging"
  | "bear"
  | "strong_bear";

export interface RegimeAnalysis {
  regime: MarketRegime;
  label: string;
  color: "emerald" | "green" | "amber" | "orange" | "red" | "rose";
  adxLevel: "strong" | "moderate" | "weak";
  trendDirection: "up" | "down" | "sideways";
  /** Applied to raw confluence score: trending regimes amplify directional signals */
  scoreMultiplier: number;
}

export function detectMarketRegime(params: {
  close: number;
  adx?: number;
  sma20?: number;
  sma50?: number;
}): RegimeAnalysis {
  const { close, adx, sma20, sma50 } = params;

  const adxVal = adx ?? 0;
  const adxLevel: RegimeAnalysis["adxLevel"] =
    adxVal >= 30 ? "strong" : adxVal >= 20 ? "moderate" : "weak";

  const aboveSma20 = sma20 !== undefined && close > sma20;
  const belowSma20 = sma20 !== undefined && close < sma20;
  const sma20AboveSma50 =
    sma20 !== undefined && sma50 !== undefined && sma20 > sma50;
  const sma20BelowSma50 =
    sma20 !== undefined && sma50 !== undefined && sma20 < sma50;

  // Strong bull: ADX ≥ 30 + price above rising SMA20 above SMA50
  if (adxVal >= 30 && aboveSma20 && sma20AboveSma50) {
    return {
      regime: "strong_bull",
      label: "Strong Bull",
      color: "emerald",
      adxLevel,
      trendDirection: "up",
      scoreMultiplier: 1.3,
    };
  }

  // Bull: ADX ≥ 20 + price above SMA20
  if (adxVal >= 20 && aboveSma20) {
    return {
      regime: "bull",
      label: "Bull",
      color: "green",
      adxLevel,
      trendDirection: "up",
      scoreMultiplier: 1.15,
    };
  }

  // Strong bear: ADX ≥ 30 + price below declining SMA20 below SMA50
  if (adxVal >= 30 && belowSma20 && sma20BelowSma50) {
    return {
      regime: "strong_bear",
      label: "Strong Bear",
      color: "rose",
      adxLevel,
      trendDirection: "down",
      scoreMultiplier: 1.3,
    };
  }

  // Bear: ADX ≥ 20 + price below SMA20
  if (adxVal >= 20 && belowSma20) {
    return {
      regime: "bear",
      label: "Bear",
      color: "red",
      adxLevel,
      trendDirection: "down",
      scoreMultiplier: 1.15,
    };
  }

  // Ranging: weak ADX or no SMA data
  return {
    regime: "ranging",
    label: "Ranging",
    color: "amber",
    adxLevel,
    trendDirection: "sideways",
    scoreMultiplier: 0.85,
  };
}
