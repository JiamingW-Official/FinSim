import type { OHLCVBar } from "@/types/market";

export interface NewsItem {
  id: string;
  headline: string;
  sentiment: "bullish" | "bearish" | "neutral";
  timestamp: number;
}

const BULLISH_STRONG = [
  "{ticker} surges {pct}% on heavy buying pressure",
  "{ticker} rallies {pct}%, breaking above resistance",
  "{name} shares spike {pct}% amid strong demand",
  "{ticker} up {pct}% as bulls take control",
];

const BULLISH_MILD = [
  "{ticker} gains {pct}% in steady trading",
  "{name} ticks higher, up {pct}%",
  "{ticker} edges up {pct}% on moderate volume",
  "{name} adds {pct}% as buyers step in",
];

const BEARISH_STRONG = [
  "{ticker} plunges {pct}% amid sell-off",
  "{name} breaks below support, down {pct}%",
  "{ticker} tumbles {pct}% on heavy selling",
  "{name} drops {pct}% as bears dominate",
];

const BEARISH_MILD = [
  "{ticker} dips {pct}%, sellers push lower",
  "{name} slips {pct}% in cautious trading",
  "{ticker} eases {pct}% on light volume",
  "{name} retreats {pct}% on profit-taking",
];

const VOLUME_ALERTS = [
  "Unusual volume detected in {ticker}",
  "{ticker} trading on elevated volume",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

/**
 * Generate a news headline based on price change between bars.
 * Returns null if the price change is insignificant (<0.5%).
 */
export function generateNews(
  currentBar: OHLCVBar,
  previousBar: OHLCVBar,
  stockName: string,
): NewsItem | null {
  const change = ((currentBar.close - previousBar.close) / previousBar.close) * 100;
  const absChange = Math.abs(change);

  // No news for small moves
  if (absChange < 0.5) return null;

  const vars = {
    ticker: currentBar.ticker,
    name: stockName,
    pct: absChange.toFixed(1),
  };

  let headline: string;
  let sentiment: "bullish" | "bearish" | "neutral";

  if (change > 3) {
    headline = fill(pick(BULLISH_STRONG), vars);
    sentiment = "bullish";
  } else if (change > 0.5) {
    headline = fill(pick(BULLISH_MILD), vars);
    sentiment = "bullish";
  } else if (change < -3) {
    headline = fill(pick(BEARISH_STRONG), vars);
    sentiment = "bearish";
  } else {
    headline = fill(pick(BEARISH_MILD), vars);
    sentiment = "bearish";
  }

  // Occasionally add volume alert for large moves
  if (absChange > 4 && Math.random() > 0.5) {
    headline += " — " + fill(pick(VOLUME_ALERTS), vars);
  }

  return {
    id: `${currentBar.ticker}-${currentBar.timestamp}-${Date.now()}`,
    headline,
    sentiment,
    timestamp: currentBar.timestamp,
  };
}
