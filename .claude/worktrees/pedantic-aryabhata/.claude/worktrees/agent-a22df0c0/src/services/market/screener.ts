import { FUNDAMENTALS, type FundamentalsData } from "@/data/fundamentals";
import { WATCHLIST_STOCKS } from "@/types/market";

export type ScreenerCriteria =
  | { type: "pe_below"; value: number }
  | { type: "pe_above"; value: number }
  | { type: "dividend_above"; value: number }
  | { type: "rsi_below"; value: number }
  | { type: "rsi_above"; value: number }
  | { type: "above_200ma" }
  | { type: "below_200ma" }
  | { type: "high_momentum" }
  | { type: "low_volatility" }
  | { type: "value" }
  | { type: "growth" }
  | { type: "quality" };

export interface ScreenerResult {
  ticker: string;
  name: string;
  matchedCriteria: string[];
  score: number; // 0-100
  metrics: Record<string, number | string>;
}

export interface PresetScreen {
  name: string;
  description: string;
  criteria: ScreenerCriteria[];
}

function getTickerName(ticker: string): string {
  const stock = WATCHLIST_STOCKS.find((s) => s.ticker === ticker);
  return stock ? stock.name : ticker;
}

/**
 * Simulate an RSI value from fundamentals momentum signals.
 * Uses eps growth + revenue growth as momentum proxy.
 */
function simulateRSI(fund: FundamentalsData): number {
  const momentum = fund.epsGrowthYoY * 0.6 + fund.revenueGrowthYoY * 0.4;
  // Map momentum to RSI-like scale: -20% -> RSI 25, 0% -> 50, +20% -> 75
  return Math.max(10, Math.min(90, 50 + momentum * 1.25));
}

/**
 * Simulate beta/volatility-based score.
 * Low beta = low volatility.
 */
function isLowVolatility(fund: FundamentalsData): boolean {
  return fund.beta < 1.0;
}

function evaluateCriteria(
  ticker: string,
  fund: FundamentalsData,
  criteria: ScreenerCriteria[],
): { matched: string[]; score: number; metrics: Record<string, number | string> } {
  const matched: string[] = [];
  let totalPoints = 0;
  let maxPoints = 0;
  const metrics: Record<string, number | string> = {
    sector: fund.sector,
    "P/E": fund.peRatio,
    "Fwd P/E": fund.forwardPE,
    "Div Yield": `${fund.dividendYield.toFixed(2)}%`,
    "EPS Growth": `${fund.epsGrowthYoY.toFixed(1)}%`,
    "Gross Margin": `${fund.grossMargin.toFixed(1)}%`,
    Beta: fund.beta,
  };

  const rsi = simulateRSI(fund);
  metrics["RSI (sim)"] = Math.round(rsi);

  for (const c of criteria) {
    maxPoints += 1;
    switch (c.type) {
      case "pe_below":
        if (fund.peRatio > 0 && fund.peRatio < c.value) {
          matched.push(`P/E < ${c.value}`);
          totalPoints += 1;
        }
        break;
      case "pe_above":
        if (fund.peRatio >= c.value) {
          matched.push(`P/E >= ${c.value}`);
          totalPoints += 1;
        }
        break;
      case "dividend_above":
        if (fund.dividendYield >= c.value) {
          matched.push(`Div Yield >= ${c.value}%`);
          totalPoints += 1;
        }
        break;
      case "rsi_below":
        if (rsi < c.value) {
          matched.push(`RSI < ${c.value}`);
          totalPoints += 1;
        }
        break;
      case "rsi_above":
        if (rsi > c.value) {
          matched.push(`RSI > ${c.value}`);
          totalPoints += 1;
        }
        break;
      case "above_200ma":
        if (fund.twoHundredDayMA > 0) {
          // Use week52High proximity as proxy
          const pctFrom200 =
            ((fund.week52High * 0.9) / fund.twoHundredDayMA - 1) * 100;
          if (pctFrom200 > -5) {
            matched.push("Above 200-day MA");
            totalPoints += 1;
          }
        }
        break;
      case "below_200ma":
        if (fund.twoHundredDayMA > 0) {
          const pctFrom200 =
            ((fund.week52Low * 1.1) / fund.twoHundredDayMA - 1) * 100;
          if (pctFrom200 < 0) {
            matched.push("Below 200-day MA");
            totalPoints += 1;
          }
        }
        break;
      case "high_momentum":
        if (fund.epsGrowthYoY > 10 && fund.revenueGrowthYoY > 5) {
          matched.push("High Momentum");
          totalPoints += 1;
        }
        break;
      case "low_volatility":
        if (isLowVolatility(fund)) {
          matched.push("Low Volatility");
          totalPoints += 1;
        }
        break;
      case "value":
        {
          let valueScore = 0;
          if (fund.peRatio > 0 && fund.peRatio < fund.sectorAvgPE)
            valueScore++;
          if (fund.pbRatio > 0 && fund.pbRatio < 5) valueScore++;
          if (fund.dividendYield > 1) valueScore++;
          if (fund.forwardPE > 0 && fund.forwardPE < fund.peRatio)
            valueScore++;
          if (valueScore >= 2) {
            matched.push("Value Stock");
            totalPoints += 1;
          }
        }
        break;
      case "growth":
        {
          let growthScore = 0;
          if (fund.revenueGrowthYoY > 10) growthScore++;
          if (fund.epsGrowthYoY > 15) growthScore++;
          if (fund.revenueGrowth3Y > 10) growthScore++;
          if (fund.fcfGrowth > 10) growthScore++;
          if (growthScore >= 2) {
            matched.push("Growth Stock");
            totalPoints += 1;
          }
        }
        break;
      case "quality":
        {
          let qualityScore = 0;
          if (fund.grossMargin > 40) qualityScore++;
          if (fund.roe > 15) qualityScore++;
          if (fund.currentRatio > 1.0) qualityScore++;
          if (fund.netMargin > 15) qualityScore++;
          if (fund.returnOnCapital > 15) qualityScore++;
          if (qualityScore >= 3) {
            matched.push("Quality Stock");
            totalPoints += 1;
          }
        }
        break;
    }
  }

  const score =
    maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  return { matched, score, metrics };
}

export function runScreener(criteria: ScreenerCriteria[]): ScreenerResult[] {
  const results: ScreenerResult[] = [];

  for (const [ticker, fund] of Object.entries(FUNDAMENTALS)) {
    // Skip ETFs for most screens
    if (fund.sector === "ETF" && criteria.some((c) => c.type === "pe_below" || c.type === "quality" || c.type === "growth" || c.type === "value" || c.type === "dividend_above")) {
      continue;
    }

    const { matched, score, metrics } = evaluateCriteria(
      ticker,
      fund,
      criteria,
    );

    if (matched.length > 0) {
      results.push({
        ticker,
        name: getTickerName(ticker),
        matchedCriteria: matched,
        score,
        metrics,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

export const PRESET_SCREENS: PresetScreen[] = [
  {
    name: "Value Picks",
    description: "Low P/E stocks trading below sector average with dividends",
    criteria: [
      { type: "value" },
      { type: "pe_below", value: 25 },
      { type: "dividend_above", value: 0.5 },
    ],
  },
  {
    name: "Growth Momentum",
    description: "High revenue and earnings growth with strong momentum",
    criteria: [
      { type: "growth" },
      { type: "high_momentum" },
      { type: "rsi_above", value: 50 },
    ],
  },
  {
    name: "Dividend Yield",
    description: "Stocks with attractive dividend yields above 1.5%",
    criteria: [
      { type: "dividend_above", value: 1.5 },
      { type: "quality" },
    ],
  },
  {
    name: "Low Volatility",
    description: "Stable stocks with beta below 1.0",
    criteria: [
      { type: "low_volatility" },
      { type: "quality" },
      { type: "above_200ma" },
    ],
  },
  {
    name: "Quality Factor",
    description: "High margins, strong ROE, and solid balance sheets",
    criteria: [
      { type: "quality" },
      { type: "above_200ma" },
    ],
  },
  {
    name: "RSI Oversold",
    description: "Stocks with simulated RSI below 40 (potential bounce)",
    criteria: [
      { type: "rsi_below", value: 40 },
      { type: "value" },
    ],
  },
];
