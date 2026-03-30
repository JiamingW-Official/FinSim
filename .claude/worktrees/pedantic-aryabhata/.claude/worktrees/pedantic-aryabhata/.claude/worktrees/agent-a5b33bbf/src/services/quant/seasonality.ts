// Monthly/weekly return seasonality per ticker

export interface SeasonalityData {
  ticker: string;
  monthlyReturns: Record<string, number>;
  dayOfWeekReturns: Record<string, number>;
  bestMonth: string;
  worstMonth: string;
  sellInMayEffect: number;
  januaryEffect: number;
  santaRallyEffect: number;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTicker(ticker: string): number {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) {
    h = (h * 31 + ticker.charCodeAt(i)) | 0;
  }
  return h;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Base seasonal tendencies (loosely modeled on S&P 500 historical patterns)
const BASE_MONTHLY = [
  1.2, 0.1, 0.8, 1.5, 0.2, -0.1, 0.8, -0.3, -0.8, 0.9, 1.5, 1.3,
];
const BASE_DAILY = [0.02, 0.04, -0.01, 0.03, -0.02];

export function getSeasonality(ticker: string): SeasonalityData {
  const seed = hashTicker(ticker);
  const rand = mulberry32(seed);

  // Generate monthly returns with ticker-specific variation
  const monthlyReturns: Record<string, number> = {};
  let bestMonth = MONTHS[0];
  let worstMonth = MONTHS[0];
  let bestReturn = -Infinity;
  let worstReturn = Infinity;

  for (let i = 0; i < 12; i++) {
    // Base pattern + ticker-specific noise
    const noise = (rand() - 0.5) * 3.0; // +/- 1.5%
    const value = Math.round((BASE_MONTHLY[i] + noise) * 100) / 100;
    monthlyReturns[MONTHS[i]] = value;

    if (value > bestReturn) {
      bestReturn = value;
      bestMonth = MONTHS[i];
    }
    if (value < worstReturn) {
      worstReturn = value;
      worstMonth = MONTHS[i];
    }
  }

  // Generate day-of-week returns
  const dayOfWeekReturns: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    const noise = (rand() - 0.5) * 0.08;
    dayOfWeekReturns[DAYS[i]] = Math.round((BASE_DAILY[i] + noise) * 1000) / 1000;
  }

  // Sell in May effect: sum of May-October returns vs November-April
  const mayOctReturn =
    (monthlyReturns["May"] ?? 0) +
    (monthlyReturns["June"] ?? 0) +
    (monthlyReturns["July"] ?? 0) +
    (monthlyReturns["August"] ?? 0) +
    (monthlyReturns["September"] ?? 0) +
    (monthlyReturns["October"] ?? 0);
  const novAprReturn =
    (monthlyReturns["November"] ?? 0) +
    (monthlyReturns["December"] ?? 0) +
    (monthlyReturns["January"] ?? 0) +
    (monthlyReturns["February"] ?? 0) +
    (monthlyReturns["March"] ?? 0) +
    (monthlyReturns["April"] ?? 0);
  const sellInMayEffect = Math.round((novAprReturn - mayOctReturn) * 100) / 100;

  // January effect: January return (small-caps tend to outperform)
  const januaryEffect = monthlyReturns["January"] ?? 0;

  // Santa rally: last 5 trading days of December + first 2 of January
  // Approximate as a fraction of December + January returns
  const santaRallyEffect =
    Math.round(
      ((monthlyReturns["December"] ?? 0) * 0.25 +
        (monthlyReturns["January"] ?? 0) * 0.1) *
        100
    ) / 100;

  return {
    ticker,
    monthlyReturns,
    dayOfWeekReturns,
    bestMonth,
    worstMonth,
    sellInMayEffect,
    januaryEffect,
    santaRallyEffect,
  };
}
