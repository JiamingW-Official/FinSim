// Simulated sell-side analyst coverage with seeded PRNG

export interface AnalystRating {
  firm: string;
  analyst: string;
  rating: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
  priceTarget: number;
  date: string;
  priorRating: string;
}

export interface AnalystConsensus {
  ratings: AnalystRating[];
  avgRating: number;
  avgPriceTarget: number;
  highTarget: number;
  lowTarget: number;
  buyPct: number;
  holdPct: number;
  sellPct: number;
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

const FIRMS = [
  "Goldman Sachs",
  "Morgan Stanley",
  "JPMorgan",
  "BofA Securities",
  "Citi",
  "Barclays",
  "UBS",
  "Deutsche Bank",
  "RBC Capital",
  "Jefferies",
  "Needham",
  "Piper Sandler",
];

const ANALYST_FIRST = [
  "Michael",
  "Sarah",
  "David",
  "Jennifer",
  "James",
  "Emily",
  "Robert",
  "Amanda",
  "William",
  "Lisa",
  "Daniel",
  "Rachel",
];
const ANALYST_LAST = [
  "Chen",
  "Smith",
  "Patel",
  "Johnson",
  "Kim",
  "Rodriguez",
  "Taylor",
  "Wilson",
  "Anderson",
  "Thomas",
  "Martinez",
  "Brown",
];

const RATINGS: AnalystRating["rating"][] = [
  "Strong Buy",
  "Buy",
  "Hold",
  "Sell",
  "Strong Sell",
];

const RATING_WEIGHTS = [0.15, 0.35, 0.3, 0.15, 0.05];

function pickWeightedRating(rand: () => number): AnalystRating["rating"] {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < RATING_WEIGHTS.length; i++) {
    cumulative += RATING_WEIGHTS[i];
    if (r < cumulative) return RATINGS[i];
  }
  return "Hold";
}

function ratingToNumeric(rating: string): number {
  switch (rating) {
    case "Strong Buy":
      return 5;
    case "Buy":
      return 4;
    case "Hold":
      return 3;
    case "Sell":
      return 2;
    case "Strong Sell":
      return 1;
    default:
      return 3;
  }
}

export function generateAnalystRatings(
  ticker: string,
  currentPrice: number
): AnalystConsensus {
  const seed = hashTicker(ticker);
  const rand = mulberry32(seed);

  const analystCount = 8 + Math.floor(rand() * 5); // 8-12
  const shuffledFirms = [...FIRMS].sort(() => rand() - 0.5);
  const selectedFirms = shuffledFirms.slice(0, analystCount);

  const ratings: AnalystRating[] = [];
  let totalRating = 0;
  let totalTarget = 0;
  let highTarget = -Infinity;
  let lowTarget = Infinity;
  let buyCount = 0;
  let holdCount = 0;
  let sellCount = 0;

  for (let i = 0; i < analystCount; i++) {
    const firm = selectedFirms[i];
    const firstName = ANALYST_FIRST[Math.floor(rand() * ANALYST_FIRST.length)];
    const lastName = ANALYST_LAST[Math.floor(rand() * ANALYST_LAST.length)];

    const rating = pickWeightedRating(rand);

    // Price target: based on rating sentiment + random spread
    let targetBias: number;
    switch (rating) {
      case "Strong Buy":
        targetBias = 1.15 + rand() * 0.2; // +15% to +35%
        break;
      case "Buy":
        targetBias = 1.05 + rand() * 0.15; // +5% to +20%
        break;
      case "Hold":
        targetBias = 0.95 + rand() * 0.1; // -5% to +5%
        break;
      case "Sell":
        targetBias = 0.8 + rand() * 0.1; // -20% to -10%
        break;
      case "Strong Sell":
        targetBias = 0.65 + rand() * 0.1; // -35% to -25%
        break;
      default:
        targetBias = 1.0;
    }

    const priceTarget = Math.round(currentPrice * targetBias * 100) / 100;

    // Generate a plausible prior rating (often same or adjacent)
    const priorShift = rand() < 0.6 ? 0 : rand() < 0.5 ? -1 : 1;
    const currentIdx = RATINGS.indexOf(rating);
    const priorIdx = Math.max(0, Math.min(RATINGS.length - 1, currentIdx + priorShift));
    const priorRating = RATINGS[priorIdx];

    // Random date within the last 90 days
    const daysAgo = Math.floor(rand() * 90);
    const date = new Date(2026, 2, 25); // March 25, 2026
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];

    ratings.push({
      firm,
      analyst: `${firstName} ${lastName}`,
      rating,
      priceTarget,
      date: dateStr,
      priorRating,
    });

    totalRating += ratingToNumeric(rating);
    totalTarget += priceTarget;
    if (priceTarget > highTarget) highTarget = priceTarget;
    if (priceTarget < lowTarget) lowTarget = priceTarget;

    if (rating === "Strong Buy" || rating === "Buy") buyCount++;
    else if (rating === "Hold") holdCount++;
    else sellCount++;
  }

  // Sort by date, most recent first
  ratings.sort((a, b) => b.date.localeCompare(a.date));

  return {
    ratings,
    avgRating: Math.round((totalRating / analystCount) * 100) / 100,
    avgPriceTarget: Math.round((totalTarget / analystCount) * 100) / 100,
    highTarget,
    lowTarget,
    buyPct: Math.round((buyCount / analystCount) * 100),
    holdPct: Math.round((holdCount / analystCount) * 100),
    sellPct: Math.round((sellCount / analystCount) * 100),
  };
}
