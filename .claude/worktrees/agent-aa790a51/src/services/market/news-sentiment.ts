// Synthetic news sentiment data for simulation

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: number;
  sentiment: "positive" | "negative" | "neutral";
  impact: "low" | "medium" | "high";
}

export interface NewsSentimentSummary {
  items: NewsItem[];
  aggregateSentiment: number; // -1 to 1
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const HEADLINE_TEMPLATES: Record<string, { headlines: string[]; sentiment: "positive" | "negative" | "neutral" }[]> = {
  default: [
    { headlines: ["{ticker} beats Q4 earnings estimates by 12%", "{ticker} raises full-year revenue guidance"], sentiment: "positive" },
    { headlines: ["{ticker} announces $2B share buyback program", "{ticker} secures major government contract"], sentiment: "positive" },
    { headlines: ["{ticker} misses revenue expectations; shares slide", "{ticker} CFO departs amid accounting review"], sentiment: "negative" },
    { headlines: ["{ticker} faces regulatory scrutiny over data practices", "{ticker} warns of supply chain disruptions"], sentiment: "negative" },
    { headlines: ["{ticker} trading flat ahead of earnings report", "{ticker} analyst ratings unchanged this quarter"], sentiment: "neutral" },
    { headlines: ["{ticker} sector rotation continues amid macro uncertainty", "Options activity surges on {ticker} ahead of catalyst"], sentiment: "neutral" },
  ],
};

const SOURCES = ["Reuters", "Bloomberg", "CNBC", "MarketWatch", "WSJ", "Barrons", "Financial Times", "Seeking Alpha"];

export function generateNewsSentiment(ticker: string, count: number = 8): NewsSentimentSummary {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + new Date().getDate();
  const rand = seededRandom(seed);

  const templates = HEADLINE_TEMPLATES.default;
  const items: NewsItem[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const templateGroup = templates[Math.floor(rand() * templates.length)];
    const headline = templateGroup.headlines[Math.floor(rand() * templateGroup.headlines.length)].replace("{ticker}", ticker);
    const source = SOURCES[Math.floor(rand() * SOURCES.length)];
    const minutesAgo = Math.floor(rand() * 480) + 5;
    const impacts: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];

    items.push({
      id: `news-${ticker}-${i}`,
      headline,
      source,
      timestamp: now - minutesAgo * 60 * 1000,
      sentiment: templateGroup.sentiment,
      impact: impacts[Math.floor(rand() * 3)],
    });
  }

  items.sort((a, b) => b.timestamp - a.timestamp);

  const sentimentScores: number[] = items.map((n) => (n.sentiment === "positive" ? 1 : n.sentiment === "negative" ? -1 : 0));
  const aggregateSentiment = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;

  return { items, aggregateSentiment };
}
