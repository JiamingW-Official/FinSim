import type { OHLCVBar } from "@/types/market";

// ── Seeded PRNG (same formula used across codebase) ──────────────
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 16) / 32767;
  };
}

// ── Bar generator helpers ────────────────────────────────────────

/** Generate OHLCV bars using a Brownian-bridge walk.
 *  startPrice → endPrice over `count` bars.
 *  volatilityPct: daily vol as fraction (e.g. 0.02 = 2%).
 */
function generateBars(
  ticker: string,
  startTimestamp: number, // ms
  barIntervalMs: number,
  count: number,
  startPrice: number,
  endPrice: number,
  volatilityPct: number,
  seed: number,
  volumeBase = 5_000_000,
): OHLCVBar[] {
  const rng = mulberry32(seed);
  const bars: OHLCVBar[] = [];
  let price = startPrice;
  const totalDrift = Math.log(endPrice / startPrice);

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1);
    const remaining = count - i;
    // Brownian bridge pull toward target
    const bridgePull = (totalDrift - Math.log(price / startPrice)) / remaining;
    const shock = (rng() - 0.5) * 2 * volatilityPct;
    const logReturn = bridgePull * 0.6 + shock;
    const open = price;
    price = price * Math.exp(logReturn);
    const amplitude = Math.abs(open - price) + price * volatilityPct * rng() * 0.5;
    const high = Math.max(open, price) + amplitude * rng() * 0.4;
    const low = Math.min(open, price) - amplitude * rng() * 0.4;
    // U-shaped volume (higher at open & close)
    const uShape = 1 + Math.pow(Math.abs(t - 0.5) * 2, 1.5);
    const volume = Math.round(volumeBase * uShape * (0.5 + rng()));

    bars.push({
      ticker,
      timeframe: "1d",
      timestamp: startTimestamp + i * barIntervalMs,
      open: +open.toFixed(4),
      high: +high.toFixed(4),
      low: +low.toFixed(4),
      close: +price.toFixed(4),
      volume,
    });
  }
  return bars;
}

const DAY_MS = 86_400_000;

// ── Price Level helper ───────────────────────────────────────────
export interface PriceLevel {
  price: number;
  label: string;
  type: "support" | "resistance" | "key";
}

// ── Main interface ───────────────────────────────────────────────
export type EventDifficulty = "Beginner" | "Intermediate" | "Expert";
export type EventCategory =
  | "macro"
  | "policy"
  | "geopolitical"
  | "corporate"
  | "election";

export interface HistoricalEvent {
  id: string;
  title: string;
  date: string; // ISO date of the event peak/main date
  description: string;
  category: EventCategory;
  difficulty: EventDifficulty;
  keyLevels: PriceLevel[];
  bars: OHLCVBar[];
  /** Optional: probability curve leading up to the event (0-100) */
  probabilityCurve?: number[];
  /** Teaching points shown after resolution */
  educationalPoints: string[];
  /** The market direction on resolution day */
  correctAnswer: "bullish" | "bearish" | "neutral";
  /** Index into bars[] where the user is asked to make a decision */
  decisionBarIndex: number;
  /** Human-readable context shown at decision point */
  decisionContext: string;
  /** Ticker label shown in the chart */
  ticker: string;
  /** Asset being charted */
  assetLabel: string;
  /** Stats shown in the breakdown panel */
  stats: { label: string; value: string }[];
}

// ────────────────────────────────────────────────────────────────
// Event 1: Brexit Referendum — June 2016
// Asset: GBP/USD (~1.49 pre-vote → 1.32 crash)
// ────────────────────────────────────────────────────────────────
const BREXIT_BARS = generateBars(
  "GBPUSD",
  new Date("2016-05-16").getTime(),
  DAY_MS,
  50,
  1.455,
  1.32,
  0.008,
  0x1a2b3c4d,
  800_000_000,
);

const BREXIT_EVENT: HistoricalEvent = {
  id: "brexit-2016",
  title: "Brexit Referendum",
  date: "2016-06-23",
  description:
    "The UK held a referendum on EU membership. Markets had priced in a 'Remain' victory. The unexpected 'Leave' result triggered the largest single-day GBP crash in modern history.",
  category: "geopolitical",
  difficulty: "Intermediate",
  ticker: "GBPUSD",
  assetLabel: "GBP/USD",
  decisionBarIndex: 26,
  decisionContext:
    "Polls show 52/48 Remain lead. Exit polls are about to be released. GBP has rallied 1% on optimism. What is your position heading into the overnight count?",
  correctAnswer: "bearish",
  probabilityCurve: [
    52, 53, 54, 55, 54, 53, 52, 51, 52, 53, 54, 52, 51, 50, 51, 52, 53, 55,
    56, 57, 58, 59, 60, 61, 62, 63, 64, 28, 22, 20,
  ],
  keyLevels: [
    { price: 1.495, label: "Pre-vote high", type: "resistance" },
    { price: 1.455, label: "Pre-vote range", type: "support" },
    { price: 1.38, label: "Initial support", type: "support" },
    { price: 1.32, label: "Flash crash low", type: "key" },
  ],
  bars: BREXIT_BARS,
  educationalPoints: [
    "Markets can be wrong: Polls showed 'Remain' at 52% yet 'Leave' won 51.9%.",
    "Tail risk: Binary events (referendums, elections) carry extreme outcome risk that options markets sometimes misprice.",
    "VIX equivalent: GBP/USD implied vol spiked from 11% to 34% in 24 hours.",
    "Contagion: FTSE 100 fell 8% on open, EUR/USD dropped 3%, gold surged 5%.",
    "Safe-haven flow: JPY and gold rallied as risk-off sentiment dominated.",
    "Mean reversion: GBP stabilized ~1.32 over subsequent months, not 1.20 as some forecasted.",
  ],
  stats: [
    { label: "GBP/USD peak drop", value: "-11.2% intraday" },
    { label: "FTSE 100 open gap", value: "-8.7%" },
    { label: "VIX spike", value: "25 → 26 (equity vol)" },
    { label: "GBP implied vol", value: "11% → 34%" },
    { label: "Gold 1-day move", value: "+4.8%" },
    { label: "Result margin", value: "Leave 51.9% / Remain 48.1%" },
  ],
};

// ────────────────────────────────────────────────────────────────
// Event 2: COVID Crash — March 2020
// Asset: SPY (S&P 500 ETF: 337 → 218 → recovery)
// ────────────────────────────────────────────────────────────────
const COVID_CRASH_BARS = generateBars(
  "SPY",
  new Date("2020-02-12").getTime(),
  DAY_MS,
  60,
  337,
  218,
  0.04,
  0x2c3d4e5f,
  100_000_000,
);

const COVID_EVENT: HistoricalEvent = {
  id: "covid-crash-2020",
  title: "COVID-19 Market Crash",
  date: "2020-03-16",
  description:
    "WHO declared COVID-19 a pandemic on March 11. Circuit breakers triggered on March 9, 12, and 16. The S&P 500 fell 34% in 33 days — the fastest bear market in history. VIX reached 82.7.",
  category: "macro",
  difficulty: "Beginner",
  ticker: "SPY",
  assetLabel: "S&P 500 (SPY)",
  decisionBarIndex: 20,
  decisionContext:
    "Wuhan is under lockdown. Italy has declared a national emergency. S&P futures are down 4% tonight. WHO has not yet declared a pandemic. What is your position?",
  correctAnswer: "bearish",
  probabilityCurve: [
    85, 83, 80, 75, 70, 65, 60, 55, 50, 45, 40, 38, 35, 30, 28, 25, 22, 20,
    18, 15, 12, 10, 8, 6, 5, 4, 3, 2, 2, 3,
  ],
  keyLevels: [
    { price: 337, label: "Feb all-time high", type: "resistance" },
    { price: 293, label: "200-day MA", type: "support" },
    { price: 250, label: "Circuit breaker zone", type: "key" },
    { price: 218, label: "March 23 low", type: "support" },
  ],
  bars: COVID_CRASH_BARS,
  educationalPoints: [
    "Circuit breakers: NYSE halted trading 3 times (March 9, 12, 16) when S&P fell >7% at open.",
    "VIX spike: Volatility index reached 82.7 on March 16 — exceeding the 2008 financial crisis peak of 80.86.",
    "Fed response: Fed cut rates to 0% on March 15 and launched unlimited QE — the fastest policy pivot ever.",
    "Speed matters: The 34% decline took only 33 calendar days — the fastest bear market ever recorded.",
    "Recovery: The S&P 500 recovered all losses by August 2020 — the fastest bear market recovery.",
    "Sector divergence: Tech recovered fast; airlines, hotels, and cruise lines took 2+ years.",
  ],
  stats: [
    { label: "Peak-to-trough decline", value: "-34% in 33 days" },
    { label: "VIX peak", value: "82.7" },
    { label: "Circuit breakers triggered", value: "3 times" },
    { label: "Fed rate cut", value: "0-0.25% (March 15)" },
    { label: "QE announcement", value: "Unlimited (March 23)" },
    { label: "Recovery time", value: "5 months to new highs" },
  ],
};

// ────────────────────────────────────────────────────────────────
// Event 3: SVB Collapse — March 2023
// Asset: KRE (Regional Bank ETF: 58 → 37)
// ────────────────────────────────────────────────────────────────
const SVB_BARS = generateBars(
  "KRE",
  new Date("2023-02-01").getTime(),
  DAY_MS,
  50,
  58,
  37,
  0.025,
  0x3d4e5f60,
  30_000_000,
);

const SVB_EVENT: HistoricalEvent = {
  id: "svb-collapse-2023",
  title: "SVB Bank Collapse",
  date: "2023-03-10",
  description:
    "Silicon Valley Bank disclosed a $1.8B loss on bond sales. Venture capitalists tweeted to pull deposits. Within 48 hours, $42B in withdrawal requests triggered the second-largest bank failure in US history.",
  category: "corporate",
  difficulty: "Expert",
  ticker: "KRE",
  assetLabel: "Regional Banks (KRE)",
  decisionBarIndex: 28,
  decisionContext:
    "SVB just announced a $1.8B bond loss and a capital raise. Sequoia Capital sent a memo to portfolio companies. Twitter is calling it a bank run. The stock is halted. What is your position in regional bank ETFs?",
  correctAnswer: "bearish",
  keyLevels: [
    { price: 62, label: "Jan peak", type: "resistance" },
    { price: 58, label: "Pre-announcement", type: "resistance" },
    { price: 46, label: "Key support", type: "support" },
    { price: 37, label: "Contagion low", type: "key" },
  ],
  bars: SVB_BARS,
  educationalPoints: [
    "Duration risk: SVB had loaded up on long-term treasuries when rates were low — rising rates crushed their bond portfolio.",
    "Social media bank run: The 2023 crisis showed Twitter/X can accelerate bank runs — $42B in withdrawal requests in 48 hours.",
    "Contagion: Signature Bank and First Republic failed within weeks. Credit Suisse was taken over by UBS.",
    "CDS spreads: Credit default swaps on regional banks spiked 300-500 bps before equity prices fell — a leading indicator.",
    "Fed backstop: The BTFP facility was launched within 72 hours, lending against par value of bank bonds.",
    "Concentration risk: SVB's depositor base was 97% tech startups — extreme concentration made runs faster.",
  ],
  stats: [
    { label: "SVB stock drop", value: "-60% in 2 days" },
    { label: "Deposit withdrawals", value: "$42B requested" },
    { label: "Bond portfolio loss", value: "$1.8B realized" },
    { label: "KRE ETF peak drop", value: "-36% in 2 weeks" },
    { label: "Banks failed", value: "3 (SVB, Signature, FRC)" },
    { label: "BTFP loans peak", value: "$168B" },
  ],
};

// ────────────────────────────────────────────────────────────────
// Event 4: Fed Pivot — September 2024
// Asset: TLT (20-Year Treasury ETF: 94 → 103)
// ────────────────────────────────────────────────────────────────
const FED_PIVOT_BARS = generateBars(
  "TLT",
  new Date("2024-08-01").getTime(),
  DAY_MS,
  50,
  90,
  103,
  0.012,
  0x4e5f6071,
  25_000_000,
);

const FED_PIVOT_EVENT: HistoricalEvent = {
  id: "fed-pivot-2024",
  title: "Fed Rate Cut Pivot",
  date: "2024-09-18",
  description:
    "The Federal Reserve cut rates by 50bps on September 18, 2024 — more than the 25bps consensus expected. The 'buy the rumor, sell the news' dynamic played out as bonds briefly sold off after the announcement.",
  category: "policy",
  difficulty: "Expert",
  ticker: "TLT",
  assetLabel: "Long Bond (TLT)",
  decisionBarIndex: 32,
  decisionContext:
    "CPI has fallen to 2.5%. Unemployment ticked up to 4.3%. Fed Funds futures price 100% chance of a cut — but 25bps or 50bps? Markets have been rallying in anticipation. What is your bond position into the FOMC?",
  correctAnswer: "bullish",
  probabilityCurve: [
    30, 32, 35, 38, 42, 45, 50, 55, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82,
    84, 85, 86, 87, 88, 89, 90, 92, 94, 95, 96, 97,
  ],
  keyLevels: [
    { price: 90, label: "August low", type: "support" },
    { price: 94, label: "Pre-FOMC range", type: "support" },
    { price: 99, label: "Post-cut resistance", type: "resistance" },
    { price: 103, label: "September peak", type: "key" },
  ],
  bars: FED_PIVOT_BARS,
  educationalPoints: [
    "Buy the rumor, sell the news: Bonds rallied 8% in anticipation of cuts, then briefly dipped on announcement day.",
    "50bps surprise: Markets expected 25bps but got 50bps — yet long bonds sold off initially on growth concerns.",
    "Yield curve: The 2s/10s curve un-inverted for the first time since 2022, signaling economic normalization.",
    "Rate expectations vs reality: Futures had priced 8 cuts in 12 months; actual pace was much slower.",
    "Dollar impact: USD weakened on the 50bps cut, boosting emerging market assets and commodities.",
    "Equity reaction: Value stocks and small caps outperformed as the 'higher for longer' trade unwound.",
  ],
  stats: [
    { label: "Cut size", value: "50bps (vs 25bps expected)" },
    { label: "TLT pre-cut rally", value: "+13% from August low" },
    { label: "10Y yield post-cut", value: "3.65% → 3.80% (rose!)" },
    { label: "USD index move", value: "-1.5% on cut day" },
    { label: "Gold reaction", value: "+1.2% to new ATH" },
    { label: "Projected vs actual cuts", value: "8 priced / 3 delivered" },
  ],
};

// ────────────────────────────────────────────────────────────────
// Event 5: 2024 US Presidential Election — November 2024
// Asset: SPY (Trump election trade: markets up sharply)
// ────────────────────────────────────────────────────────────────
const ELECTION_2024_BARS = generateBars(
  "SPY",
  new Date("2024-10-01").getTime(),
  DAY_MS,
  55,
  568,
  600,
  0.01,
  0x5f607182,
  120_000_000,
);

const ELECTION_2024_EVENT: HistoricalEvent = {
  id: "election-2024",
  title: "2024 US Presidential Election",
  date: "2024-11-05",
  description:
    "Donald Trump won the 2024 presidential election decisively, defeating Kamala Harris. Polymarket had Trump at 65% probability by election day. Markets reacted with a sharp risk-on rally — 'Trump trade' sectors (banks, crypto, defense) surged.",
  category: "election",
  difficulty: "Intermediate",
  ticker: "SPY",
  assetLabel: "S&P 500 (SPY)",
  decisionBarIndex: 28,
  decisionContext:
    "Election Day. Polymarket shows Trump at 63%, Harris at 37%. Senate polling is very tight. Volatility is elevated. Markets close at 4pm before results. What is your S&P 500 position?",
  correctAnswer: "bullish",
  probabilityCurve: [
    50, 51, 52, 50, 49, 51, 53, 55, 57, 58, 59, 60, 59, 58, 59, 60, 61, 62,
    63, 64, 65, 63, 65, 64, 63, 65, 64, 65, 88, 92,
  ],
  keyLevels: [
    { price: 568, label: "Oct high before vol pickup", type: "resistance" },
    { price: 554, label: "Pre-election dip low", type: "support" },
    { price: 580, label: "Election night futures high", type: "key" },
    { price: 600, label: "Post-election ATH", type: "resistance" },
  ],
  bars: ELECTION_2024_BARS,
  educationalPoints: [
    "Prediction markets vs polls: Polymarket had Trump at 65% on election day while most polls showed near-50/50.",
    "The Trump trade: Financials, crypto, defense, and energy surged on deregulation expectations.",
    "Bitcoin reaction: BTC hit all-time highs above $75,000 within 24 hours of the result.",
    "Bond selloff: 10-year yields jumped as inflation concerns from tariff proposals emerged.",
    "Sector rotation: Clean energy ETFs sold off while fossil fuel stocks rallied sharply.",
    "Buy-the-anticipation: Markets had partially priced in a Trump win via Polymarket — surprise was the margin.",
  ],
  stats: [
    { label: "S&P 500 next-day move", value: "+2.5%" },
    { label: "Bitcoin move", value: "+10% to ATH $75K" },
    { label: "Polymarket final odds", value: "Trump 65% / Harris 35%" },
    { label: "10Y yield spike", value: "+15bps" },
    { label: "Bank stocks (KBE)", value: "+10% in 2 days" },
    { label: "Electoral vote margin", value: "312 vs 226" },
  ],
};

// ────────────────────────────────────────────────────────────────
// Event 6: GameStop Short Squeeze — January 2021
// Asset: GME ($20 → $483 → $50)
// ────────────────────────────────────────────────────────────────
const GME_BARS = generateBars(
  "GME",
  new Date("2021-01-04").getTime(),
  DAY_MS,
  35,
  20,
  380,
  0.18,
  0x607182a3,
  40_000_000,
);

const GME_EVENT: HistoricalEvent = {
  id: "gamestop-2021",
  title: "GameStop Short Squeeze",
  date: "2021-01-28",
  description:
    "WallStreetBets coordinated a short squeeze on GameStop (GME), which had 140% short interest. The stock rose from $20 to $483 in 3 weeks, forcing hedge funds (notably Melvin Capital) to cover billions in losses. Robinhood halted buying on Jan 28.",
  category: "corporate",
  difficulty: "Expert",
  ticker: "GME",
  assetLabel: "GameStop (GME)",
  decisionBarIndex: 15,
  decisionContext:
    "GME is up 150% in two weeks. Short interest is still 140% of float. r/WallStreetBets has 3 million members posting rocket emojis. Institutional shorts are under water. Do you chase or fade?",
  correctAnswer: "bullish",
  keyLevels: [
    { price: 20, label: "Jan 4 start", type: "support" },
    { price: 76, label: "First breakout", type: "key" },
    { price: 150, label: "Major resistance cleared", type: "key" },
    { price: 483, label: "All-time high (Jan 28)", type: "resistance" },
  ],
  bars: GME_BARS,
  educationalPoints: [
    "Short interest mechanics: When short interest exceeds 100% of float, a short squeeze becomes mathematically certain if longs hold — shorts must buy to cover.",
    "Gamma squeeze: Options market makers buying stock to hedge call options accelerated the squeeze exponentially.",
    "Retail vs institutions: Melvin Capital lost ~53% (~$6.8B) in January 2021 alone.",
    "Robinhood restriction: The buy restriction on Jan 28 crashed GME from $483 to $112 intraday — showing platform risk.",
    "Payment for order flow: The controversy exposed PFOF and retail broker conflicts of interest.",
    "Reversion: GME eventually fell back below $20 — fundamentals did not support the squeeze price.",
  ],
  stats: [
    { label: "Peak gain from Jan 4", value: "+2,315% ($20 → $483)" },
    { label: "Short interest at peak", value: "140% of float" },
    { label: "Melvin Capital loss", value: "-53% / ~$6.8B" },
    { label: "Robinhood restriction", value: "Jan 28 — buy halted" },
    { label: "WSB members at peak", value: "8.6 million" },
    { label: "Post-restriction drop", value: "-77% intraday" },
  ],
};

// ────────────────────────────────────────────────────────────────
// Event 7: 2022 Bear Market — Rate Hike Cycle
// Asset: QQQ (Nasdaq 100: 400 → 250 / tech selloff)
// ────────────────────────────────────────────────────────────────
const BEAR_2022_BARS = generateBars(
  "QQQ",
  new Date("2022-01-03").getTime(),
  DAY_MS,
  80,
  400,
  255,
  0.022,
  0x7182a3b4,
  80_000_000,
);

const BEAR_2022_EVENT: HistoricalEvent = {
  id: "bear-market-2022",
  title: "2022 Rate Hike Bear Market",
  date: "2022-06-16",
  description:
    "The Fed raised rates 425bps in 2022 — the fastest hiking cycle since 1981. The Nasdaq fell 33%, growth stocks fell 60-80%, crypto lost $2 trillion in market cap, and 60/40 portfolios had their worst year since 1937.",
  category: "policy",
  difficulty: "Intermediate",
  ticker: "QQQ",
  assetLabel: "Nasdaq 100 (QQQ)",
  decisionBarIndex: 30,
  decisionContext:
    "The Fed has hiked 150bps in 3 months. Inflation is at 9.1% — a 40-year high. The 10Y yield has risen from 1.5% to 3.5%. Tech stocks are down 30% from ATH. Is this a buying opportunity or is there more pain ahead?",
  correctAnswer: "bearish",
  keyLevels: [
    { price: 400, label: "Jan 2022 ATH", type: "resistance" },
    { price: 340, label: "First bear territory", type: "support" },
    { price: 290, label: "Support zone", type: "support" },
    { price: 255, label: "Oct 2022 low", type: "key" },
  ],
  bars: BEAR_2022_BARS,
  educationalPoints: [
    "Duration risk in equities: Growth stocks trade like long-duration bonds — rising rates crush discounted cash flow valuations.",
    "60/40 failure: The traditional 60% stock / 40% bond portfolio lost 16% in 2022 — bonds provided no protection when rates rose.",
    "Crypto winter: BTC fell from $69K to $16K; FTX collapsed in November 2022 ($32B in losses).",
    "Rate sensitivity: A 100bps rise in rates can reduce a 30x P/E stock's fair value by 20-30%.",
    "The 'TINA' unwind: 'There Is No Alternative' to stocks broke as T-bills yielded 4-5% again.",
    "Earnings reality: Many high-multiple tech companies reported slowing growth, justifying lower multiples.",
  ],
  stats: [
    { label: "Fed rate hikes in 2022", value: "425bps total" },
    { label: "QQQ peak-to-trough", value: "-36%" },
    { label: "Worst single-day", value: "Jun 13: -4.7%" },
    { label: "Crypto total loss", value: "-$2 trillion" },
    { label: "60/40 portfolio 2022", value: "-16%" },
    { label: "Inflation peak (CPI)", value: "9.1% (Jun 2022)" },
  ],
};

// ────────────────────────────────────────────────────────────────
// Event 8: Nvidia AI Boom — 2023–2024
// Asset: NVDA ($150 → $950 parabolic move)
// ────────────────────────────────────────────────────────────────
const NVDA_BARS = generateBars(
  "NVDA",
  new Date("2023-01-03").getTime(),
  DAY_MS,
  80,
  150,
  870,
  0.028,
  0x8293a4b5,
  45_000_000,
);

const NVDA_EVENT: HistoricalEvent = {
  id: "nvidia-ai-boom-2023",
  title: "Nvidia AI Boom",
  date: "2024-03-08",
  description:
    "ChatGPT's viral launch in late 2022 ignited demand for AI compute. Nvidia's H100 GPU became the 'new oil.' NVDA rose from $150 to $950 in 15 months — a 533% gain — making it briefly the world's most valuable company at $3.3 trillion.",
  category: "corporate",
  difficulty: "Beginner",
  ticker: "NVDA",
  assetLabel: "Nvidia (NVDA)",
  decisionBarIndex: 30,
  decisionContext:
    "NVDA just reported Q1 2024 earnings: revenue tripled year-over-year. Data center revenue hit $22B. The stock is up 100% YTD. Options IV is at 60%. Do you chase the momentum or wait for a pullback?",
  correctAnswer: "bullish",
  keyLevels: [
    { price: 150, label: "Jan 2023 base", type: "support" },
    { price: 280, label: "Post-earnings breakout", type: "key" },
    { price: 500, label: "Mag-7 inclusion zone", type: "key" },
    { price: 950, label: "2024 ATH pre-split", type: "resistance" },
  ],
  bars: NVDA_BARS,
  educationalPoints: [
    "Product-market fit at scale: NVDA's H100 GPU had a 12-month waiting list — demand vastly exceeded supply.",
    "Options premium explosion: At $500+ stock price, ATM options had 60%+ implied volatility — selling premiums was lucrative.",
    "Momentum vs valuation: NVDA traded at 40x forward earnings at peak — justify it with growth or avoid it as overvalued.",
    "Earnings gap risk: NVDA moved ±10% on earnings 4 times in 2023-24 — holding through earnings required conviction.",
    "Index inclusion: S&P 500 funds were forced to buy as NVDA's weight grew — mechanical buying supported the trend.",
    "Broader AI theme: NVDA's rise pulled AMD, SMCI, and AI infrastructure names up with it — sector momentum.",
  ],
  stats: [
    { label: "Price gain (15 months)", value: "+533% ($150 → $950)" },
    { label: "Market cap peak", value: "$3.3 trillion" },
    { label: "Data center revenue", value: "$47B run rate (2024)" },
    { label: "H100 waitlist", value: "12+ months" },
    { label: "Options IV at peak", value: "~60%" },
    { label: "Weight in S&P 500", value: "6.5% at peak" },
  ],
};

// ── Exports ──────────────────────────────────────────────────────
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  BREXIT_EVENT,
  COVID_EVENT,
  SVB_EVENT,
  FED_PIVOT_EVENT,
  ELECTION_2024_EVENT,
  GME_EVENT,
  BEAR_2022_EVENT,
  NVDA_EVENT,
];

export const EVENT_DIFFICULTY_COLOR: Record<EventDifficulty, string> = {
  Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Expert: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  macro: "Macro",
  policy: "Policy",
  geopolitical: "Geopolitical",
  corporate: "Corporate",
  election: "Election",
};
