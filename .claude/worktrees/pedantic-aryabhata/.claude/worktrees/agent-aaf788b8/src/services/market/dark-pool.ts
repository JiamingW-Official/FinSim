export interface DarkPoolFlow {
  ticker: string;
  timestamp: number;
  side: "buy" | "sell";
  size: number;
  price: number;
  notional: number;
  venue: string;
  significance: "routine" | "notable" | "unusual" | "massive";
}

export interface DarkPoolSummary {
  ticker: string;
  totalVolume: number;
  darkPoolPercent: number;
  netFlow: number;
  largestTrade: DarkPoolFlow;
  recentFlows: DarkPoolFlow[];
  interpretation: string;
  educationalNote: string;
}

const VENUES = ["FINRA ADF", "IEX", "BATS", "NYSE Arca"] as const;

/**
 * Seeded PRNG (mulberry32).
 * Same seed => same sequence, ensuring deterministic generation.
 */
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
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = (hash * 31 + ticker.charCodeAt(i)) | 0;
  }
  return hash;
}

function getSignificance(
  notional: number,
): DarkPoolFlow["significance"] {
  if (notional >= 5_000_000) return "massive";
  if (notional >= 1_000_000) return "unusual";
  if (notional >= 250_000) return "notable";
  return "routine";
}

export function generateDarkPoolActivity(
  ticker: string,
  currentPrice: number,
  dailyVolume: number,
): DarkPoolSummary {
  const seed = hashTicker(ticker) + Math.floor(currentPrice * 100);
  const rand = mulberry32(seed);

  // Dark pool is typically 40-45% of total volume
  const darkPoolPct = 0.40 + rand() * 0.05;
  const darkPoolVolume = Math.round(dailyVolume * darkPoolPct);
  const tradeCount = 20 + Math.floor(rand() * 11); // 20-30 trades

  const flows: DarkPoolFlow[] = [];
  let totalSize = 0;
  let buyVolume = 0;
  let sellVolume = 0;
  const now = Date.now();

  for (let i = 0; i < tradeCount; i++) {
    // Time: spread across last 6.5 hours (trading session)
    const hoursAgo = rand() * 6.5;
    const timestamp = now - hoursAgo * 3600 * 1000;

    // Side: slightly biased towards one direction for realism
    const buyBias = 0.48 + rand() * 0.08; // 48-56% chance buy
    const side: "buy" | "sell" = rand() < buyBias ? "buy" : "sell";

    // Size: log-normal distribution for realistic trade sizes
    // Most trades 100-5,000 shares, occasional 10,000-50,000
    const logSize = 4.6 + rand() * 3.0 + (rand() < 0.1 ? 2.5 : 0);
    const size = Math.round(Math.exp(logSize) / 100) * 100; // Round to 100s
    const clampedSize = Math.max(100, Math.min(50000, size));

    // Price: slightly around current price
    const priceOffset = (rand() - 0.5) * currentPrice * 0.005;
    const price = Math.round((currentPrice + priceOffset) * 100) / 100;

    const notional = clampedSize * price;
    const venue = VENUES[Math.floor(rand() * VENUES.length)];

    flows.push({
      ticker,
      timestamp,
      side,
      size: clampedSize,
      price,
      notional,
      venue,
      significance: getSignificance(notional),
    });

    totalSize += clampedSize;
    if (side === "buy") buyVolume += clampedSize;
    else sellVolume += clampedSize;
  }

  // Sort by timestamp descending (most recent first)
  flows.sort((a, b) => b.timestamp - a.timestamp);

  const largestTrade = flows.reduce((max, f) =>
    f.notional > max.notional ? f : max,
  );

  const netFlow = (buyVolume - sellVolume) * currentPrice;

  // Build interpretation
  const netPct = ((buyVolume - sellVolume) / (totalSize || 1)) * 100;
  let interpretation: string;

  if (netPct > 10) {
    interpretation = `Institutional flow for ${ticker} is showing net buying pressure. Dark pool participants have been accumulating shares, with buy volume exceeding sell volume by ${Math.abs(netPct).toFixed(0)}%. The largest block trade was ${largestTrade.size.toLocaleString()} shares at $${largestTrade.price.toFixed(2)} on ${largestTrade.venue}.`;
  } else if (netPct < -10) {
    interpretation = `Institutional flow for ${ticker} is skewing to the sell side. Dark pool participants are net sellers with ${Math.abs(netPct).toFixed(0)}% more volume on the sell side. The largest block was ${largestTrade.size.toLocaleString()} shares. This could indicate institutional distribution.`;
  } else {
    interpretation = `Dark pool activity for ${ticker} is relatively balanced between buyers and sellers. Total dark pool volume represents ${(darkPoolPct * 100).toFixed(1)}% of overall trading volume, which is within the normal range. No clear directional bias from institutional participants.`;
  }

  const unusualCount = flows.filter(
    (f) => f.significance === "unusual" || f.significance === "massive",
  ).length;
  if (unusualCount > 0) {
    interpretation += ` ${unusualCount} unusual or massive trade${unusualCount > 1 ? "s" : ""} detected.`;
  }

  const educationalNote =
    "Dark pools are private exchanges where institutional investors trade large blocks of shares away from public exchanges. This reduces market impact and prevents front-running. Roughly 40-45% of all U.S. equity volume occurs in dark pools. Tracking this flow can provide insights into what large investors are doing, though delayed reporting means the data is not real-time. Net buying in dark pools can signal institutional accumulation, while net selling may indicate distribution.";

  return {
    ticker,
    totalVolume: darkPoolVolume,
    darkPoolPercent: Math.round(darkPoolPct * 1000) / 10,
    netFlow,
    largestTrade,
    recentFlows: flows,
    interpretation,
    educationalNote,
  };
}
