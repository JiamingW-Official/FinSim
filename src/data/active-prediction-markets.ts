// ── Active Prediction Markets ─────────────────────────────────────────────────
// Curated set of markets for the LiveMarkets component.
// resolution: "pending" | "yes" | "no"

export type ActiveMarketCategory =
  | "macro"
  | "earnings"
  | "crypto"
  | "politics"
  | "commodities";

export type ActiveMarketResolution = "pending" | "yes" | "no";

export type ActiveMarketTrend = "rising" | "falling" | "stable";

export interface ActiveMarket {
  id: string;
  question: string;
  category: ActiveMarketCategory;
  yesPrice: number;    // 1–99 (cents on the dollar)
  noPrice: number;     // computed as 100 - yesPrice in practice; stored explicitly
  trend: ActiveMarketTrend;
  priceHistory: number[]; // 30 data points (0–100)
  volume24h: number;
  totalLiquidity: number;
  resolveDate: string; // ISO date string
  resolution: ActiveMarketResolution;
}

// ── Labels & colors for category chips ────────────────────────────────────────

export const ACTIVE_CATEGORY_LABELS: Record<ActiveMarketCategory, string> = {
  macro: "Macro",
  earnings: "Earnings",
  crypto: "Crypto",
  politics: "Politics",
  commodities: "Commodities",
};

export const ACTIVE_CATEGORY_COLORS: Record<ActiveMarketCategory, string> = {
  macro: "bg-blue-500/15 text-blue-400",
  earnings: "bg-violet-500/15 text-violet-400",
  crypto: "bg-orange-500/15 text-orange-400",
  politics: "bg-rose-500/15 text-rose-400",
  commodities: "bg-amber-500/15 text-amber-400",
};

// ── Helper: generate seeded price history ─────────────────────────────────────

function priceHistory(start: number, end: number, seed: number): number[] {
  let s = seed;
  const next = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 16) / 32767;
  };
  const pts: number[] = [start];
  for (let i = 1; i < 30; i++) {
    const t = i / 29;
    const target = start + (end - start) * t;
    const noise = (next() - 0.5) * 10;
    pts.push(Math.max(1, Math.min(99, Math.round(target + noise))));
  }
  pts[29] = end;
  return pts;
}

// ── Market data ───────────────────────────────────────────────────────────────

export const ACTIVE_MARKETS: ActiveMarket[] = [
  // ── Macro ──────────────────────────────────────────────────────────────────
  {
    id: "fed-cut-june-2026",
    question: "Will the Fed cut rates at the June 2026 FOMC meeting?",
    category: "macro",
    yesPrice: 62,
    noPrice: 38,
    trend: "rising",
    priceHistory: priceHistory(45, 62, 1001),
    volume24h: 2_840_000,
    totalLiquidity: 9_200_000,
    resolveDate: "2026-06-18",
    resolution: "pending",
  },
  {
    id: "cpi-above-3-may-2026",
    question: "Will US CPI YoY stay above 3% for May 2026?",
    category: "macro",
    yesPrice: 44,
    noPrice: 56,
    trend: "falling",
    priceHistory: priceHistory(58, 44, 1002),
    volume24h: 1_200_000,
    totalLiquidity: 4_500_000,
    resolveDate: "2026-06-12",
    resolution: "pending",
  },
  {
    id: "us-recession-2026",
    question: "Will the US enter recession in 2026?",
    category: "macro",
    yesPrice: 28,
    noPrice: 72,
    trend: "stable",
    priceHistory: priceHistory(25, 28, 1003),
    volume24h: 5_100_000,
    totalLiquidity: 18_000_000,
    resolveDate: "2027-01-15",
    resolution: "pending",
  },
  {
    id: "spx-6000-q2-2026",
    question: "Will the S&P 500 close above 6,000 by end of Q2 2026?",
    category: "macro",
    yesPrice: 71,
    noPrice: 29,
    trend: "rising",
    priceHistory: priceHistory(55, 71, 1004),
    volume24h: 3_900_000,
    totalLiquidity: 12_000_000,
    resolveDate: "2026-06-30",
    resolution: "pending",
  },
  // ── Earnings ───────────────────────────────────────────────────────────────
  {
    id: "nvda-beat-q1-2026",
    question: "Will NVIDIA beat EPS estimates in Q1 FY2027 earnings?",
    category: "earnings",
    yesPrice: 78,
    noPrice: 22,
    trend: "rising",
    priceHistory: priceHistory(65, 78, 2001),
    volume24h: 6_700_000,
    totalLiquidity: 21_000_000,
    resolveDate: "2026-05-28",
    resolution: "pending",
  },
  {
    id: "aapl-revenue-miss-q2",
    question: "Will Apple report revenue miss for Q2 2026?",
    category: "earnings",
    yesPrice: 31,
    noPrice: 69,
    trend: "falling",
    priceHistory: priceHistory(42, 31, 2002),
    volume24h: 2_200_000,
    totalLiquidity: 7_800_000,
    resolveDate: "2026-05-01",
    resolution: "pending",
  },
  {
    id: "tsla-profit-q1-2026",
    question: "Will Tesla be profitable in Q1 2026?",
    category: "earnings",
    yesPrice: 55,
    noPrice: 45,
    trend: "stable",
    priceHistory: priceHistory(52, 55, 2003),
    volume24h: 3_400_000,
    totalLiquidity: 11_000_000,
    resolveDate: "2026-04-22",
    resolution: "pending",
  },
  // ── Crypto ─────────────────────────────────────────────────────────────────
  {
    id: "btc-100k-june-2026",
    question: "Will Bitcoin hit $100K before June 30, 2026?",
    category: "crypto",
    yesPrice: 67,
    noPrice: 33,
    trend: "rising",
    priceHistory: priceHistory(48, 67, 3001),
    volume24h: 8_900_000,
    totalLiquidity: 32_000_000,
    resolveDate: "2026-06-30",
    resolution: "pending",
  },
  {
    id: "eth-etf-staking-2026",
    question: "Will a US spot Ethereum ETF with staking be approved in 2026?",
    category: "crypto",
    yesPrice: 52,
    noPrice: 48,
    trend: "rising",
    priceHistory: priceHistory(35, 52, 3002),
    volume24h: 4_100_000,
    totalLiquidity: 14_000_000,
    resolveDate: "2026-12-31",
    resolution: "pending",
  },
  {
    id: "crypto-market-cap-4t",
    question: "Will total crypto market cap exceed $4T in 2026?",
    category: "crypto",
    yesPrice: 43,
    noPrice: 57,
    trend: "stable",
    priceHistory: priceHistory(40, 43, 3003),
    volume24h: 2_800_000,
    totalLiquidity: 9_500_000,
    resolveDate: "2026-12-31",
    resolution: "pending",
  },
  // ── Politics ────────────────────────────────────────────────────────────────
  {
    id: "trump-approval-50-2026",
    question: "Will Trump approval rating exceed 50% in any major poll in 2026?",
    category: "politics",
    yesPrice: 34,
    noPrice: 66,
    trend: "falling",
    priceHistory: priceHistory(41, 34, 4001),
    volume24h: 1_600_000,
    totalLiquidity: 5_200_000,
    resolveDate: "2026-12-31",
    resolution: "pending",
  },
  {
    id: "china-taiwan-2026",
    question: "Will China conduct major military exercises near Taiwan in 2026?",
    category: "politics",
    yesPrice: 47,
    noPrice: 53,
    trend: "stable",
    priceHistory: priceHistory(44, 47, 4002),
    volume24h: 3_300_000,
    totalLiquidity: 10_000_000,
    resolveDate: "2026-12-31",
    resolution: "pending",
  },
  // ── Commodities ─────────────────────────────────────────────────────────────
  {
    id: "oil-70-q2-2026",
    question: "Will WTI crude oil drop below $70/barrel in Q2 2026?",
    category: "commodities",
    yesPrice: 38,
    noPrice: 62,
    trend: "falling",
    priceHistory: priceHistory(50, 38, 5001),
    volume24h: 2_100_000,
    totalLiquidity: 7_400_000,
    resolveDate: "2026-06-30",
    resolution: "pending",
  },
  {
    id: "gold-3000-2026",
    question: "Will gold price exceed $3,000/oz in 2026?",
    category: "commodities",
    yesPrice: 72,
    noPrice: 28,
    trend: "rising",
    priceHistory: priceHistory(55, 72, 5002),
    volume24h: 4_600_000,
    totalLiquidity: 15_000_000,
    resolveDate: "2026-12-31",
    resolution: "pending",
  },
  {
    id: "natgas-winter-spike",
    question: "Will natural gas spike above $5 in Winter 2026?",
    category: "commodities",
    yesPrice: 41,
    noPrice: 59,
    trend: "stable",
    priceHistory: priceHistory(38, 41, 5003),
    volume24h: 1_400_000,
    totalLiquidity: 4_800_000,
    resolveDate: "2027-03-01",
    resolution: "pending",
  },
];
