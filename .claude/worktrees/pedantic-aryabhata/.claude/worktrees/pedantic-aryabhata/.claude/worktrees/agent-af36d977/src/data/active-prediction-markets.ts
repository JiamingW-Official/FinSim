// ── Active Prediction Markets ────────────────────────────────────────────────
// 20 simulated "live" markets that update daily.
// Prices are seeded with mulberry32(seed=20260327) for reproducibility.

export interface ActiveMarket {
  id: string;
  question: string;
  category: "macro" | "earnings" | "crypto" | "politics" | "commodities";
  yesPrice: number;      // current "Yes" contract price 0–100
  noPrice: number;       // = 100 - yesPrice
  volume24h: number;     // $ volume in last 24 h
  totalLiquidity: number;
  resolveDate: string;   // "YYYY-MM-DD"
  resolution: "pending" | "yes" | "no";
  trend: "rising" | "falling" | "stable";
  priceHistory: number[]; // last 7 days of yes prices
}

// mulberry32 PRNG — same family used across FinSim for seeded randomness
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260327);

// Helpers
function randInt(lo: number, hi: number) {
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}
function randFloat(lo: number, hi: number, dp = 0) {
  const v = rng() * (hi - lo) + lo;
  return parseFloat(v.toFixed(dp));
}

// Generate a 7-day price history that drifts toward `current`
function makeHistory(current: number): number[] {
  const history: number[] = [];
  let v = current + randInt(-12, 12);
  v = Math.min(97, Math.max(3, v));
  for (let i = 0; i < 7; i++) {
    history.push(v);
    v = v + randInt(-5, 5);
    v = Math.min(97, Math.max(3, v));
  }
  // Make last value equal to current
  history[6] = current;
  return history;
}

// Compute trend from first → last of history
function computeTrend(h: number[]): "rising" | "falling" | "stable" {
  const delta = h[h.length - 1] - h[0];
  if (delta >= 4) return "rising";
  if (delta <= -4) return "falling";
  return "stable";
}

function makeMarket(
  id: string,
  question: string,
  category: ActiveMarket["category"],
  yesPrice: number,
  volume24h: number,
  totalLiquidity: number,
  resolveDate: string,
  resolution: ActiveMarket["resolution"] = "pending",
): ActiveMarket {
  const ph = makeHistory(yesPrice);
  return {
    id,
    question,
    category,
    yesPrice,
    noPrice: 100 - yesPrice,
    volume24h,
    totalLiquidity,
    resolveDate,
    resolution,
    trend: computeTrend(ph),
    priceHistory: ph,
  };
}

export const ACTIVE_MARKETS: ActiveMarket[] = [
  // ── Macro (5) ────────────────────────────────────────────────────────────
  makeMarket(
    "am-fed-rate-cut-may",
    "Fed cuts interest rates at the May 2026 FOMC meeting?",
    "macro",
    randInt(28, 48),
    randInt(180_000, 420_000),
    randInt(1_200_000, 3_500_000),
    "2026-05-07",
  ),
  makeMarket(
    "am-us-recession-2026",
    "US economy enters recession (two consecutive negative GDP quarters) in 2026?",
    "macro",
    randInt(22, 42),
    randInt(90_000, 260_000),
    randInt(800_000, 2_200_000),
    "2026-12-31",
  ),
  makeMarket(
    "am-cpi-above-3-april",
    "US CPI year-over-year above 3.0% for April 2026?",
    "macro",
    randInt(38, 62),
    randInt(70_000, 180_000),
    randInt(500_000, 1_400_000),
    "2026-05-13",
  ),
  makeMarket(
    "am-unemployment-below-4",
    "US unemployment rate stays below 4.0% through Q2 2026?",
    "macro",
    randInt(52, 74),
    randInt(50_000, 130_000),
    randInt(400_000, 1_100_000),
    "2026-07-05",
  ),
  makeMarket(
    "am-soft-landing-2026",
    "Fed achieves soft landing — inflation < 2.5% AND no recession by end of 2026?",
    "macro",
    randInt(30, 52),
    randInt(110_000, 320_000),
    randInt(900_000, 2_600_000),
    "2026-12-31",
  ),

  // ── Earnings (4) ─────────────────────────────────────────────────────────
  makeMarket(
    "am-nvda-beats-q1",
    "NVIDIA beats Q1 2026 EPS consensus estimate?",
    "earnings",
    randInt(60, 82),
    randInt(300_000, 650_000),
    randInt(2_000_000, 5_000_000),
    "2026-05-28",
  ),
  makeMarket(
    "am-aapl-revenue-120b",
    "Apple quarterly revenue exceeds $120B in the next earnings report?",
    "earnings",
    randInt(42, 66),
    randInt(200_000, 480_000),
    randInt(1_400_000, 3_800_000),
    "2026-05-01",
  ),
  makeMarket(
    "am-tsla-delivery-miss",
    "Tesla misses analyst delivery estimates for Q1 2026?",
    "earnings",
    randInt(35, 60),
    randInt(180_000, 400_000),
    randInt(1_100_000, 3_000_000),
    "2026-04-03",
  ),
  makeMarket(
    "am-meta-user-growth",
    "META daily active users grow >5% YoY in Q1 2026 earnings?",
    "earnings",
    randInt(48, 70),
    randInt(140_000, 340_000),
    randInt(900_000, 2_400_000),
    "2026-04-30",
  ),

  // ── Crypto (4) ───────────────────────────────────────────────────────────
  makeMarket(
    "am-btc-100k-yearend",
    "Bitcoin price above $100,000 by December 31, 2026?",
    "crypto",
    randInt(44, 68),
    randInt(500_000, 1_200_000),
    randInt(3_500_000, 9_000_000),
    "2026-12-31",
  ),
  makeMarket(
    "am-eth-5k-yearend",
    "Ethereum price above $5,000 by December 31, 2026?",
    "crypto",
    randInt(30, 55),
    randInt(280_000, 700_000),
    randInt(1_800_000, 5_000_000),
    "2026-12-31",
  ),
  makeMarket(
    "am-crypto-mktcap-4t",
    "Total crypto market cap exceeds $4 trillion in 2026?",
    "crypto",
    randInt(35, 60),
    randInt(200_000, 520_000),
    randInt(1_400_000, 4_000_000),
    "2026-12-31",
  ),
  makeMarket(
    "am-btc-etf-inflows-q2",
    "Bitcoin spot ETF net inflows exceed $10B in Q2 2026?",
    "crypto",
    randInt(38, 63),
    randInt(150_000, 380_000),
    randInt(1_000_000, 2_800_000),
    "2026-07-01",
  ),

  // ── Politics (3) ─────────────────────────────────────────────────────────
  makeMarket(
    "am-us-debt-ceiling-2026",
    "US Congress raises or suspends the debt ceiling before July 2026?",
    "politics",
    randInt(55, 78),
    randInt(80_000, 220_000),
    randInt(600_000, 1_700_000),
    "2026-07-01",
  ),
  makeMarket(
    "am-us-tariff-rollback",
    "US rolls back >25% of 2025 tariffs by end of 2026?",
    "politics",
    randInt(20, 45),
    randInt(100_000, 280_000),
    randInt(700_000, 2_000_000),
    "2026-12-31",
  ),
  makeMarket(
    "am-g7-ai-regulation",
    "G7 nations agree on binding AI safety framework in 2026?",
    "politics",
    randInt(15, 38),
    randInt(50_000, 140_000),
    randInt(400_000, 1_200_000),
    "2026-12-31",
  ),

  // ── Commodities (4) ──────────────────────────────────────────────────────
  makeMarket(
    "am-oil-above-90",
    "WTI crude oil price exceeds $90/barrel before July 2026?",
    "commodities",
    randInt(25, 50),
    randInt(130_000, 340_000),
    randInt(900_000, 2_500_000),
    "2026-07-01",
  ),
  makeMarket(
    "am-gold-above-3000",
    "Gold price stays above $3,000/oz through end of Q2 2026?",
    "commodities",
    randInt(50, 75),
    randInt(120_000, 300_000),
    randInt(800_000, 2_200_000),
    "2026-06-30",
  ),
  makeMarket(
    "am-natgas-winter-spike",
    "Natural gas (Henry Hub) exceeds $4.50/MMBtu during winter 2026 peak?",
    "commodities",
    randInt(30, 55),
    randInt(80_000, 200_000),
    randInt(500_000, 1_500_000),
    "2026-03-31",
  ),
  makeMarket(
    "am-copper-above-5",
    "Copper price exceeds $5.00/lb on CME before September 2026?",
    "commodities",
    randInt(38, 65),
    randInt(90_000, 240_000),
    randInt(600_000, 1_800_000),
    "2026-09-01",
  ),
];

// Category metadata
export const ACTIVE_CATEGORY_LABELS: Record<ActiveMarket["category"], string> = {
  macro: "Macro",
  earnings: "Earnings",
  crypto: "Crypto",
  politics: "Politics",
  commodities: "Commodities",
};

export const ACTIVE_CATEGORY_COLORS: Record<ActiveMarket["category"], string> = {
  macro: "bg-blue-500/10 text-blue-400",
  earnings: "bg-purple-500/10 text-purple-400",
  crypto: "bg-orange-500/10 text-orange-400",
  politics: "bg-red-500/10 text-red-400",
  commodities: "bg-amber-500/10 text-amber-400",
};
