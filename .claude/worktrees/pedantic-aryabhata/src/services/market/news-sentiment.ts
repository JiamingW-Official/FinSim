// Synthetic news sentiment data for simulation

export type NewsCategory = "Earnings" | "Fed" | "Economy" | "Sector" | "Company";
export type NewsSentimentLabel = "Bullish" | "Bearish" | "Neutral";

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: number;
  sentiment: "positive" | "negative" | "neutral";
  sentimentLabel: NewsSentimentLabel;
  impact: "low" | "medium" | "high";
  category: NewsCategory;
  relatedTickers: string[];
  bodyParagraphs: string[];
  impactAnalysis: string;
}

export interface NewsSentimentSummary {
  items: NewsItem[];
  aggregateSentiment: number; // -1 to 1
  trendingTickers: { ticker: string; mentions: number }[];
}

// ─── Keyword-based sentiment detection ───────────────────────────────────────

const BULLISH_WORDS = ["beat", "surge", "record", "rally", "upgrade", "outperform", "growth", "gain", "strong", "positive", "raises", "secures", "buyback"];
const BEARISH_WORDS = ["miss", "drop", "decline", "cut", "downgrade", "underperform", "loss", "warn", "weak", "negative", "scrutiny", "disruptions", "departs"];

export function detectHeadlineSentiment(headline: string): NewsSentimentLabel {
  const lower = headline.toLowerCase();
  let bullishCount = 0;
  let bearishCount = 0;
  for (const w of BULLISH_WORDS) {
    if (lower.includes(w)) bullishCount++;
  }
  for (const w of BEARISH_WORDS) {
    if (lower.includes(w)) bearishCount++;
  }
  if (bullishCount > bearishCount) return "Bullish";
  if (bearishCount > bullishCount) return "Bearish";
  return "Neutral";
}

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Headline templates with categories ──────────────────────────────────────

interface HeadlineTemplate {
  headline: string;
  sentiment: "positive" | "negative" | "neutral";
  category: NewsCategory;
  bodyTemplates: string[];
  impactTemplate: string;
  relatedTickerPool: string[];
}

const HEADLINE_TEMPLATES: HeadlineTemplate[] = [
  // Earnings - positive
  {
    headline: "{ticker} beats Q4 earnings estimates by 12%, raises guidance",
    sentiment: "positive",
    category: "Earnings",
    bodyTemplates: [
      "{ticker} reported fourth-quarter earnings per share of $3.42, surpassing analyst consensus estimates of $3.05 by a wide margin. Revenue came in at $24.8B, up 18% year-over-year and ahead of the $22.1B consensus.",
      "Management highlighted strong demand across all product segments, with the cloud division growing 34% annually. CEO noted that the company's strategic investments are beginning to materially pay off, driving operating leverage across the business.",
      "Looking ahead, {ticker} raised its full-year revenue guidance to $98B–$102B from the prior $92B–$96B range, citing robust pipeline momentum and favorable macro tailwinds in its core markets.",
    ],
    impactTemplate: "{ticker} earnings beat signals strong fundamental momentum; expect upside continuation if broader market cooperates.",
    relatedTickerPool: ["SPY", "QQQ", "MSFT", "AAPL"],
  },
  // Earnings - negative
  {
    headline: "{ticker} misses Q3 revenue estimates; shares slide after hours",
    sentiment: "negative",
    category: "Earnings",
    bodyTemplates: [
      "{ticker} disclosed third-quarter revenue of $18.3B, falling short of the $20.1B consensus estimate by roughly 9%. EPS of $1.87 also missed the $2.14 analyst mean, citing headwinds from foreign exchange and slowing enterprise spending.",
      "The company noted that deal closures slipped into subsequent quarters as customers grew more cautious amid macro uncertainty. Gross margin contracted by 220 basis points to 38.4%, below the 40.6% expected by Wall Street.",
      "Guidance for the upcoming quarter was set below consensus, with management pointing to elongated sales cycles and competitive pricing pressure as key headwinds. The CFO acknowledged the need for cost restructuring initiatives.",
    ],
    impactTemplate: "{ticker} revenue miss raises concerns about near-term demand; watch support levels as sentiment may remain under pressure.",
    relatedTickerPool: ["SPY", "QQQ"],
  },
  // Earnings - positive variant
  {
    headline: "{ticker} announces $2B share buyback program after record quarter",
    sentiment: "positive",
    category: "Earnings",
    bodyTemplates: [
      "{ticker} announced a $2 billion share repurchase program authorized by its board of directors, following the company's strongest quarterly results in its history. The buyback represents approximately 3.2% of shares outstanding at current prices.",
      "The record quarter featured revenue growth of 22% year-over-year, driven by accelerating demand in enterprise software and services. Free cash flow reached $4.1B for the quarter, providing ample capacity for capital returns.",
      "Analysts broadly welcomed the capital allocation decision, noting that the buyback alongside a 15% dividend increase signals management's confidence in sustained earnings power. The stock has outperformed the S&P 500 by over 18% year-to-date.",
    ],
    impactTemplate: "{ticker}'s buyback signals strong balance sheet confidence; near-term share price support likely as repurchases provide a technical floor.",
    relatedTickerPool: ["SPY", "QQQ", "JPM"],
  },
  // Fed - neutral
  {
    headline: "Fed holds rates steady; signals data-dependent path ahead",
    sentiment: "neutral",
    category: "Fed",
    bodyTemplates: [
      "The Federal Reserve held the federal funds rate at its 5.25%–5.50% target range at its latest FOMC meeting, as widely expected by market participants. The accompanying statement maintained language emphasizing a commitment to returning inflation to the 2% target.",
      "Chair Powell emphasized during the press conference that future rate decisions will remain highly data-dependent, particularly with respect to labor market resilience and services inflation. He noted that the committee is not yet confident that inflation has been sustainably contained.",
      "Market pricing for rate cuts shifted modestly dovish following the meeting, with fed funds futures now implying roughly 2.3 cuts by year-end. Treasury yields fell modestly while equity markets extended intraday gains on the perceived balanced tone.",
    ],
    impactTemplate: "Rate hold removes near-term tightening risk for {ticker}; equity valuations supported but vigilance warranted if data reaccelerates.",
    relatedTickerPool: ["SPY", "QQQ", "JPM", "AAPL", "MSFT"],
  },
  // Fed - negative
  {
    headline: "Fed minutes reveal hawkish tilt; rate cut timeline pushed out",
    sentiment: "negative",
    category: "Fed",
    bodyTemplates: [
      "Minutes from the Federal Reserve's most recent meeting showed a more hawkish tone than markets had anticipated, with several members expressing concern that progress toward the 2% inflation target has stalled. At least three officials discussed the potential need for additional tightening.",
      "The minutes highlighted persistent services inflation and resilient wage growth as factors arguing against premature policy easing. Officials noted that financial conditions had eased materially since late last year, potentially re-stimulating demand.",
      "Following the release, the 2-year Treasury yield rose 14 basis points to 4.93%, while rate-sensitive sectors including real estate and utilities saw meaningful selling pressure. Equity markets broadly declined as expectations for near-term cuts were pared back.",
    ],
    impactTemplate: "Hawkish Fed signals raise discount rates for growth stocks; {ticker} and peers may face valuation headwinds until rate path clarifies.",
    relatedTickerPool: ["SPY", "QQQ", "AAPL", "MSFT", "NVDA"],
  },
  // Economy - positive
  {
    headline: "Strong jobs report beats estimates; unemployment falls to 3.7%",
    sentiment: "positive",
    category: "Economy",
    bodyTemplates: [
      "The U.S. economy added 285,000 nonfarm payroll jobs in the latest report, handily beating the consensus forecast of 195,000. The unemployment rate ticked down to 3.7%, the lowest reading in five months, while labor force participation edged up to 62.8%.",
      "Goods-producing industries led hiring gains, with manufacturing adding 42,000 jobs and construction contributing another 38,000. The service sector remained robust, with healthcare and business services together accounting for nearly half of total job creation.",
      "Average hourly earnings rose 0.3% month-over-month and 4.1% year-over-year, broadly in line with expectations. The strong data suggested consumer spending momentum likely remained intact, supporting near-term GDP growth estimates.",
    ],
    impactTemplate: "Strong labor data boosts consumer spending outlook, a positive backdrop for {ticker}'s revenue visibility near-term.",
    relatedTickerPool: ["SPY", "QQQ", "AMZN", "JPM"],
  },
  // Economy - negative
  {
    headline: "GDP growth disappoints at 1.2%, below the 2.4% consensus estimate",
    sentiment: "negative",
    category: "Economy",
    bodyTemplates: [
      "U.S. real GDP grew at an annualized rate of just 1.2% in the most recent quarter, significantly missing the 2.4% consensus estimate and decelerating from the prior quarter's 2.8% pace. Consumer spending growth slowed to 1.5%, its weakest reading in six quarters.",
      "Business fixed investment declined 0.8%, dragged by a sharp contraction in equipment spending as companies pulled back on capital expenditures amid heightened uncertainty. Net exports subtracted 0.6 percentage points from growth, partly due to a strengthening dollar.",
      "Economists noted that the soft print heightens the risk of a technical recession if momentum does not recover in subsequent quarters. The data sparked a bond market rally as expectations for Federal Reserve easing were pulled forward.",
    ],
    impactTemplate: "Weak GDP growth raises macro headwinds for {ticker}; corporate earnings revisions could weigh on forward multiples if slowdown persists.",
    relatedTickerPool: ["SPY", "QQQ", "JPM", "AMZN"],
  },
  // Sector - positive
  {
    headline: "Tech sector outperforms on AI infrastructure spending surge",
    sentiment: "positive",
    category: "Sector",
    bodyTemplates: [
      "Technology stocks broadly outperformed the market this week as a wave of capital expenditure announcements from hyperscalers underscored the accelerating build-out of AI infrastructure. Semiconductor and cloud infrastructure names led the gains, with the sector ETF rising over 4%.",
      "Industry checks by multiple research firms indicate that data center orders have exceeded expectations by 25%–35%, with lead times on high-bandwidth memory and advanced compute packages extending beyond 18 months. The supply-demand imbalance is expected to sustain pricing power through next year.",
      "Analysts upgraded several names in the sector following the spending announcements, citing improved earnings visibility and expanding addressable markets. Consensus EPS estimates for the group have been revised upward by an average of 8% over the past 30 days.",
    ],
    impactTemplate: "AI infrastructure tailwind directly benefits {ticker}'s growth trajectory; sector momentum likely to persist through the current spending cycle.",
    relatedTickerPool: ["NVDA", "MSFT", "AAPL", "GOOG", "META", "QQQ"],
  },
  // Sector - negative
  {
    headline: "Semiconductor stocks slide on export restriction fears",
    sentiment: "negative",
    category: "Sector",
    bodyTemplates: [
      "Semiconductor stocks fell broadly after reports surfaced that the U.S. Commerce Department is considering additional export controls on advanced chip technology to China. The restrictions, if implemented, could cut off a significant revenue stream for several leading chip designers.",
      "Analysts estimate that China revenue accounts for 20%–40% of sales for major semiconductor companies, making the potential restrictions a material earnings headwind. Some firms also source components from Chinese suppliers, creating dual-sided supply chain risk.",
      "The sector ETF fell 3.8% on the day, with losses concentrated in companies with the highest China exposure. Market participants are waiting for official confirmation of the policy timeline before reassessing forward estimates.",
    ],
    impactTemplate: "Export restriction risk creates near-term uncertainty for {ticker}; position sizing should account for policy headline volatility.",
    relatedTickerPool: ["NVDA", "AAPL", "MSFT", "QQQ"],
  },
  // Company - positive
  {
    headline: "{ticker} secures major partnership deal, shares rally",
    sentiment: "positive",
    category: "Company",
    bodyTemplates: [
      "{ticker} announced a multi-year strategic partnership valued at $1.4B with one of the world's largest enterprises, expanding distribution and co-development agreements across three key product lines. The partnership is expected to be accretive to earnings within 18 months.",
      "The deal validates {ticker}'s technology platform as an industry standard, and management indicated that it has opened conversations with several other potential partners of comparable scale. The partner's customer base of over 50 million active users provides immediate cross-selling opportunity.",
      "Analysts raised price targets following the announcement, with the median consensus estimate moving from $215 to $242. The stock closed up 6.3% on heavy volume, with over 2.8x normal daily turnover suggesting strong institutional interest.",
    ],
    impactTemplate: "{ticker}'s new partnership enhances revenue visibility and competitive moat; near-term upside catalyst with potential for further deal announcements.",
    relatedTickerPool: ["SPY", "QQQ"],
  },
  // Company - negative
  {
    headline: "{ticker} faces regulatory scrutiny; antitrust probe widened",
    sentiment: "negative",
    category: "Company",
    bodyTemplates: [
      "{ticker} disclosed that federal regulators have expanded their antitrust investigation to include its recent acquisition and several pricing practices in its core business. The probe, which began 14 months ago, now involves subpoenas to more than 30 current and former employees.",
      "Legal experts estimate that potential remedies could range from behavioral constraints to forced divestitures, with worst-case scenarios presenting material earnings headwinds. The company has set aside $400M for legal costs, though analysts believe ultimate exposure could be higher.",
      "Shares fell 4.1% on the news, erasing gains from the prior week. Management stated they are cooperating fully with investigators and remain confident in the legality of their business practices, but declined to provide a timeline for resolution.",
    ],
    impactTemplate: "Regulatory overhang creates uncertainty for {ticker}; event-driven risk may keep a valuation discount in place until probe resolution.",
    relatedTickerPool: ["SPY"],
  },
  // Company - neutral
  {
    headline: "{ticker} CFO transition announced; strategic review underway",
    sentiment: "neutral",
    category: "Company",
    bodyTemplates: [
      "{ticker} announced that its current Chief Financial Officer will transition to an advisory role over the next six months, with an executive search underway for a permanent successor. The company emphasized that the transition is part of planned succession management.",
      "Simultaneously, the board announced a strategic review of non-core business units representing roughly 15% of total revenue. Management stated the review is intended to sharpen focus on its highest-return businesses and could result in divestitures or spinoffs.",
      "The stock traded in a narrow range following the announcement as investors weighed potential uncertainty against the possibility of value-unlocking actions. Analysts maintained a range of views, with some welcoming the portfolio rationalization and others concerned about execution risk.",
    ],
    impactTemplate: "{ticker}'s strategic review introduces both risk and opportunity; monitor for asset sale announcements which could act as near-term catalysts.",
    relatedTickerPool: ["SPY", "QQQ"],
  },
  // Sector - neutral
  {
    headline: "Financials sector rotation underway as yield curve flattens",
    sentiment: "neutral",
    category: "Sector",
    bodyTemplates: [
      "Financial sector stocks experienced mixed performance this week as the yield curve flattened toward its lowest level in three months. Bank stocks with significant net interest margin sensitivity underperformed, while capital markets-heavy firms held up better on strong trading revenues.",
      "Strategists noted that a flat yield curve compresses the spread between short-term deposit costs and long-term lending rates, squeezing bank profitability. However, some analysts argued that credit quality metrics remain pristine, limiting downside risk for the sector.",
      "Flows data showed rotation out of regionals into larger money-center banks as investors sought balance sheet resilience. The sector is expected to remain volatile heading into the next round of Fed communications.",
    ],
    impactTemplate: "Yield curve dynamics affect {ticker}'s margin outlook indirectly; monitor rate-sensitive positioning as the sector digests macro signals.",
    relatedTickerPool: ["JPM", "SPY"],
  },
];

const SOURCES = ["Reuters", "Bloomberg", "CNBC", "MarketWatch", "WSJ", "Barron's", "Financial Times", "Seeking Alpha"];

// All tickers that appear across news for trending computation
const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "JPM", "SPY", "QQQ", "META"];

export function generateNewsSentiment(ticker: string, count: number = 10): NewsSentimentSummary {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + new Date().getDate();
  const rand = seededRandom(seed);

  const items: NewsItem[] = [];
  const now = Date.now();

  // Shuffle templates deterministically
  const shuffled = [...HEADLINE_TEMPLATES].sort(() => rand() - 0.5);
  const selected = shuffled.slice(0, count);

  for (let i = 0; i < selected.length; i++) {
    const tmpl = selected[i];
    const headline = tmpl.headline.replace(/\{ticker\}/g, ticker);
    const source = SOURCES[Math.floor(rand() * SOURCES.length)];
    const minutesAgo = Math.floor(rand() * 600) + 5;
    const impacts: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
    const impact = impacts[Math.floor(rand() * 3)];

    // Build related tickers: always include current ticker + 1-3 from pool
    const poolSize = Math.floor(rand() * 3) + 1;
    const pool = [...tmpl.relatedTickerPool].sort(() => rand() - 0.5).slice(0, poolSize);
    const relatedTickers = [...new Set([ticker, ...pool])];

    const bodyParagraphs = tmpl.bodyTemplates.map((p) => p.replace(/\{ticker\}/g, ticker));
    const impactAnalysis = tmpl.impactTemplate.replace(/\{ticker\}/g, ticker);

    const sentimentLabel = detectHeadlineSentiment(headline);

    items.push({
      id: `news-${ticker}-${i}-${seed}`,
      headline,
      source,
      timestamp: now - minutesAgo * 60 * 1000,
      sentiment: tmpl.sentiment,
      sentimentLabel,
      impact,
      category: tmpl.category,
      relatedTickers,
      bodyParagraphs,
      impactAnalysis,
    });
  }

  items.sort((a, b) => b.timestamp - a.timestamp);

  const sentimentScores: number[] = items.map((n) => (n.sentiment === "positive" ? 1 : n.sentiment === "negative" ? -1 : 0));
  const aggregateSentiment = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;

  // Compute trending tickers across all news items
  const mentionMap: Record<string, number> = {};
  for (const item of items) {
    for (const t of item.relatedTickers) {
      mentionMap[t] = (mentionMap[t] ?? 0) + 1;
    }
  }
  // Also inject synthetic mentions for other tickers to make "trending" meaningful
  const trendSeed = seededRandom(seed + 999);
  for (const t of ALL_TICKERS) {
    if (!mentionMap[t]) {
      mentionMap[t] = Math.floor(trendSeed() * 5) + 1;
    }
  }

  const trendingTickers = Object.entries(mentionMap)
    .map(([t, mentions]) => ({ ticker: t, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);

  return { items, aggregateSentiment, trendingTickers };
}
