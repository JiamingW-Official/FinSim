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
  | { type: "quality" }
  // New criteria types
  | { type: "momentum_rocket" }
  | { type: "oversold_bounce" }
  | { type: "earnings_beat" }
  | { type: "high_short_interest" }
  | { type: "insider_buying" }
  | { type: "sector_leader" }
  | { type: "graham_number" }
  | { type: "canslim_like" };

export interface ScreenerResult {
  ticker: string;
  name: string;
  matchedCriteria: string[];
  score: number; // 0-100
  metrics: Record<string, number | string>;
  sparkline: number[]; // 8 synthetic price points for mini chart
  aiSignal: "bullish" | "bearish" | "neutral";
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

/**
 * Generate a seeded 8-bar sparkline centered around the 52w midpoint.
 * Uses a simple LCG so results are stable per ticker.
 */
export function generateSparkline(ticker: string, fund: FundamentalsData): number[] {
  // Seeded LCG using ticker char codes
  let s = ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 1013;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const mid = (fund.week52High + fund.week52Low) / 2;
  const range = (fund.week52High - fund.week52Low) * 0.3;
  const points: number[] = [];
  let prev = mid - range * 0.5 + rand() * range;
  for (let i = 0; i < 8; i++) {
    prev = prev + (rand() - 0.48) * range * 0.25;
    prev = Math.max(fund.week52Low * 0.98, Math.min(fund.week52High * 1.02, prev));
    points.push(prev);
  }
  return points;
}

/**
 * Compute a lightweight AI bias signal from fundamentals.
 * Returns "bullish" | "bearish" | "neutral".
 */
export function computeAISignal(fund: FundamentalsData): "bullish" | "bearish" | "neutral" {
  let score = 0;

  // Analyst consensus
  if (fund.analystRating === "Strong Buy") score += 2;
  else if (fund.analystRating === "Buy") score += 1;
  else if (fund.analystRating === "Sell") score -= 1;
  else if (fund.analystRating === "Strong Sell") score -= 2;

  // Earnings
  if (fund.lastEarningsResult === "beat") score += 1;
  else if (fund.lastEarningsResult === "miss") score -= 1;

  // Momentum (EPS + revenue growth)
  if (fund.epsGrowthYoY > 20) score += 1;
  else if (fund.epsGrowthYoY < 0) score -= 1;
  if (fund.revenueGrowthYoY > 10) score += 1;
  else if (fund.revenueGrowthYoY < 0) score -= 1;

  // Insider activity
  if (fund.insiderTransactions === "Net Buying") score += 1;
  else if (fund.insiderTransactions === "Net Selling") score -= 1;

  // Valuation relative to sector
  if (fund.peRatio > 0 && fund.peRatio < fund.sectorAvgPE * 0.8) score += 1;
  else if (fund.peRatio > fund.sectorAvgPE * 1.5) score -= 1;

  if (score >= 2) return "bullish";
  if (score <= -2) return "bearish";
  return "neutral";
}

/**
 * Compute the Graham Number check: sqrt(22.5 * EPS * BV/share).
 * If peRatio * pbRatio < 22.5, stock passes Graham's combined screen.
 */
function passesGrahamNumber(fund: FundamentalsData): boolean {
  if (fund.peRatio <= 0 || fund.pbRatio <= 0) return false;
  return fund.peRatio * fund.pbRatio < 22.5;
}

/**
 * Determine top sector leaders by EPS growth + revenue growth composite.
 * Returns a Set of tickers that are in the top-3 of their sector.
 */
function getSectorLeaders(): Set<string> {
  const bySector: Record<string, { ticker: string; score: number }[]> = {};
  for (const [ticker, fund] of Object.entries(FUNDAMENTALS)) {
    if (fund.sector === "ETF") continue;
    const score = fund.epsGrowthYoY * 0.5 + fund.revenueGrowthYoY * 0.3 + fund.grossMargin * 0.2;
    if (!bySector[fund.sector]) bySector[fund.sector] = [];
    bySector[fund.sector].push({ ticker, score });
  }
  const leaders = new Set<string>();
  for (const stocks of Object.values(bySector)) {
    stocks.sort((a, b) => b.score - a.score);
    stocks.slice(0, 3).forEach((s) => leaders.add(s.ticker));
  }
  return leaders;
}

// Cache sector leaders (computed once at module load, stable for simulation)
const SECTOR_LEADERS = getSectorLeaders();

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

      // ── New criteria ────────────────────────────────────────────────────────

      case "momentum_rocket":
        // Price > EMA50 proxy (above 50-day MA), RSI 50-70, relative volume > 2x avg
        {
          const aboveEma50 = fund.fiftyDayMA > 0
            ? fund.week52High * 0.88 > fund.fiftyDayMA
            : false;
          const rsiInRange = rsi >= 50 && rsi <= 70;
          const highVolume = fund.relativeVolume >= 1.5;
          if (aboveEma50 && rsiInRange && highVolume) {
            matched.push("Momentum Rocket");
            totalPoints += 1;
          }
        }
        break;

      case "oversold_bounce":
        // RSI < 30, price near 52w low (within 20%), dividend yield > 0
        {
          const priceNearLow = fund.week52Low > 0 && fund.twoHundredDayMA > 0
            ? fund.twoHundredDayMA < fund.week52Low * 1.2
            : false;
          if (rsi < 30 && priceNearLow && fund.dividendYield > 0) {
            matched.push("Oversold Bounce");
            totalPoints += 1;
          }
        }
        break;

      case "earnings_beat":
        // Last quarter beat estimates, positive EPS surprise > 3%
        if (
          fund.lastEarningsResult === "beat" &&
          fund.earningsSurprisePct > 3 &&
          fund.epsGrowthYoY > 0
        ) {
          matched.push("Earnings Beat");
          totalPoints += 1;
        }
        break;

      case "high_short_interest":
        // Short float > 15% — high short interest (potential squeeze)
        if (fund.shortFloat > 15) {
          matched.push(`Short Float ${fund.shortFloat.toFixed(1)}%`);
          totalPoints += 1;
        }
        break;

      case "insider_buying":
        // Net insider buying activity
        if (fund.insiderTransactions === "Net Buying") {
          matched.push("Insider Buying");
          totalPoints += 1;
        }
        break;

      case "sector_leader":
        // Top 3 stocks by composite score in their sector
        if (SECTOR_LEADERS.has(ticker)) {
          matched.push("Sector Leader");
          totalPoints += 1;
        }
        break;

      case "graham_number":
        // P/E × P/B < 22.5 (Benjamin Graham combined screen)
        if (passesGrahamNumber(fund)) {
          matched.push(`P/E×P/B=${( fund.peRatio * fund.pbRatio).toFixed(1)}<22.5`);
          totalPoints += 1;
        }
        break;

      case "canslim_like":
        // EPS growth > 25%, RS proxy (relative strength) > 80 (EPS growth rank), near 52w high
        {
          const epsHigh = fund.epsGrowthYoY > 25;
          // RS proxy: percentile of EPS growth among all tickers
          const allEpsGrowths = Object.values(FUNDAMENTALS)
            .filter((f) => f.sector !== "ETF")
            .map((f) => f.epsGrowthYoY);
          allEpsGrowths.sort((a, b) => a - b);
          const rank = allEpsGrowths.filter((v) => v <= fund.epsGrowthYoY).length;
          const rs = Math.round((rank / allEpsGrowths.length) * 100);
          const nearHigh = fund.week52High > 0 && fund.twoHundredDayMA > 0
            ? fund.twoHundredDayMA > fund.week52High * 0.75
            : false;
          if (epsHigh && rs > 80 && nearHigh) {
            matched.push("CANSLIM-like");
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
    if (
      fund.sector === "ETF" &&
      criteria.some(
        (c) =>
          c.type === "pe_below" ||
          c.type === "quality" ||
          c.type === "growth" ||
          c.type === "value" ||
          c.type === "dividend_above" ||
          c.type === "momentum_rocket" ||
          c.type === "earnings_beat" ||
          c.type === "high_short_interest" ||
          c.type === "insider_buying" ||
          c.type === "sector_leader" ||
          c.type === "graham_number" ||
          c.type === "canslim_like",
      )
    ) {
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
        sparkline: generateSparkline(ticker, fund),
        aiSignal: computeAISignal(fund),
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
  {
    name: "Momentum Rockets",
    description: "Price above EMA50, RSI in 50–70 range, elevated volume",
    criteria: [
      { type: "momentum_rocket" },
      { type: "high_momentum" },
    ],
  },
  {
    name: "Oversold Bounce",
    description: "RSI < 30, near 52-week low, pays a dividend",
    criteria: [
      { type: "oversold_bounce" },
      { type: "rsi_below", value: 35 },
    ],
  },
  {
    name: "Earnings Beats",
    description: "Last quarter beat estimates with positive guidance",
    criteria: [
      { type: "earnings_beat" },
      { type: "growth" },
    ],
  },
  {
    name: "High Short Interest",
    description: "Short float above 15% — potential short squeeze candidates",
    criteria: [
      { type: "high_short_interest" },
    ],
  },
  {
    name: "Insider Buying",
    description: "Net insider purchases — skin in the game signal",
    criteria: [
      { type: "insider_buying" },
      { type: "quality" },
    ],
  },
  {
    name: "Sector Leaders",
    description: "Top 3 stocks by composite score within each sector",
    criteria: [
      { type: "sector_leader" },
    ],
  },
  {
    name: "Graham Number",
    description: "P/E × P/B < 22.5 — Benjamin Graham deep value screen",
    criteria: [
      { type: "graham_number" },
      { type: "dividend_above", value: 0 },
    ],
  },
  {
    name: "CANSLIM-like",
    description: "EPS growth > 25%, high relative strength, near 52w high",
    criteria: [
      { type: "canslim_like" },
      { type: "above_200ma" },
    ],
  },
];
