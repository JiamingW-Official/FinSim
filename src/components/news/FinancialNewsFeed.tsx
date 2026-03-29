"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Calendar,
  Zap,
  Activity,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  BarChart2,
  MessageSquare,
  Filter,
  Globe,
  Flame,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────

let s = 43;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function rb(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function ri(lo: number, hi: number) {
  return Math.floor(rb(lo, hi + 1));
}
function rp<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Types ────────────────────────────────────────────────────────────────────

type ArticleCategory = "Macro" | "Equities" | "Bonds" | "Crypto" | "Options";
type ArticleSentiment = "bullish" | "bearish" | "neutral";
type EarningTime = "BMO" | "AMC";
type EconPriority = "High" | "Medium" | "Low";
type RatingAction = "Upgrade" | "Downgrade" | "PT Change";

interface NewsHeadline {
  id: number;
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  fullStory: string;
}

interface Article {
  id: number;
  title: string;
  source: string;
  minutesAgo: number;
  category: ArticleCategory;
  sentiment: ArticleSentiment;
  sentimentScore: number; // -1 to 1
  para1: string;
  para2: string;
  extraPara: string;
  tickers: string[];
}

interface EarningsEntry {
  id: number;
  ticker: string;
  company: string;
  date: string;
  time: EarningTime;
  epsEst: number;
  epsPrior: number;
  importance: 1 | 2 | 3;
  impliedMove: number;
  historicalSurprises: number[]; // last 8 quarters %
}

interface EconRelease {
  id: number;
  name: string;
  date: string;
  daysFromNow: number;
  hoursFromNow: number;
  priority: EconPriority;
  prior: string;
  consensus: string;
  actual: string | null; // null = not yet released
  affectedAssets: string[];
}

interface AnalystRating {
  id: number;
  firm: string;
  ticker: string;
  sector: string;
  action: RatingAction;
  oldRating: string;
  newRating: string;
  oldPT: number;
  newPT: number;
  reaction: number; // % stock move on day
  accuracy: number; // 0-100%
}

interface SocialTicker {
  id: number;
  ticker: string;
  company: string;
  bullishPct: number;
  bearishPct: number;
  mentions: number;
  mentionAvg: number;
  priceChange: number;
  memeAlert: boolean;
  trend: "rising" | "falling" | "flat";
}

// ── Data Generation ──────────────────────────────────────────────────────────

const SOURCES = ["Bloomberg", "Reuters", "WSJ", "CNBC", "FT", "MarketWatch", "Barron's"];
const TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "GS", "XOM"];
const SECTORS = ["Technology", "Financials", "Energy", "Healthcare", "Consumer", "Industrials"];
const RATINGS = ["Strong Buy", "Buy", "Neutral", "Underperform", "Sell"];
const ANALYST_FIRMS = [
  "Goldman Sachs", "Morgan Stanley", "JPMorgan", "Citi", "BofA",
  "Wells Fargo", "Oppenheimer", "Piper Sandler", "Needham", "Cowen",
];

const HEADLINES: NewsHeadline[] = [
  { id: 0, sentiment: "negative", text: "Fed signals higher-for-longer rates; 2-year yield spikes to 5.1%", fullStory: "Federal Reserve officials reiterated their commitment to keeping interest rates elevated through mid-2026, pushing the 2-year Treasury yield to its highest level in over a decade. Markets are now pricing in just one rate cut for the remainder of the year, down from three cuts projected at the start of Q1.\n\nThe minutes of the last FOMC meeting revealed deep disagreement among members about the timing of potential easing. Several governors flagged persistent services inflation as a key concern, while others worried about labor market cooling accelerating faster than expected." },
  { id: 1, sentiment: "positive", text: "NVDA beats Q1 earnings by 23%; data center revenue surges 87% YoY", fullStory: "NVIDIA delivered another blockbuster quarter, surpassing Wall Street estimates by 23% on the bottom line. Data center revenue reached $22.6B, an 87% year-over-year increase driven by surging demand for H100 and B200 GPU clusters across hyperscale cloud providers.\n\nCEO Jensen Huang cited accelerating adoption of AI inference workloads as the primary growth driver. The company also raised full-year guidance above consensus, sending shares up 12% in after-hours trading." },
  { id: 2, sentiment: "negative", text: "China PMI contracts for third consecutive month, stoking global growth fears", fullStory: "China's official manufacturing PMI fell to 48.7 in March, marking the third consecutive month of contraction and raising concerns about a broader economic slowdown in the world's second-largest economy. The reading missed expectations of 49.5.\n\nNew export orders remained particularly weak, suggesting that global demand headwinds are beginning to bite. Analysts at UBS downgraded their China GDP forecast to 4.1% for 2026, citing weak property sector activity and slowing infrastructure spending." },
  { id: 3, sentiment: "positive", text: "Bitcoin breaks $95K resistance; institutional ETF inflows hit weekly record", fullStory: "Bitcoin surged through the key $95,000 technical level on Monday, fueled by record-breaking weekly inflows into spot Bitcoin ETFs totaling $3.2 billion. BlackRock's IBIT alone attracted $1.4 billion in net new assets over the week.\n\nOn-chain metrics show a significant decline in exchange reserves, suggesting long-term holders are accumulating rather than distributing. Options markets are pricing a 68% probability of Bitcoin reaching $110,000 by end of June." },
  { id: 4, sentiment: "neutral", text: "Oil holds near $78 as OPEC+ signals production flexibility into Q3", fullStory: "Crude oil prices stabilized around $78 per barrel after OPEC+ communicated openness to adjusting production levels depending on demand conditions through Q3. Saudi Arabia's energy minister emphasized the group's readiness to respond to market dynamics.\n\nThe International Energy Agency revised its 2026 demand growth forecast slightly lower to 1.1 million barrels per day, citing electric vehicle adoption outpacing expectations in China and Europe." },
  { id: 5, sentiment: "positive", text: "S&P 500 hits all-time high as tech sector leads broad market rally", fullStory: "The S&P 500 closed at a fresh all-time high of 5,842, led by a 3.2% surge in the technology sector following better-than-expected earnings from several megacap names. Breadth was strong, with 78% of S&P components advancing on the day.\n\nMarket internals remain constructive: put/call ratios are at one-year lows, the VIX dropped to 13.8, and institutional positioning data suggests funds are still underweight equities relative to historical norms." },
  { id: 6, sentiment: "negative", text: "Commercial real estate delinquencies rise 14% QoQ; regional banks under pressure", fullStory: "Commercial real estate loan delinquencies climbed 14% quarter-over-quarter in Q1 2026, with office properties seeing the sharpest deterioration as remote work trends persist. Regional banks with heavy CRE exposure saw their shares fall an average of 4.7% on the news.\n\nThe FDIC flagged 67 banks as being on its 'problem list,' up from 52 in the prior quarter. Analysts warn that a wave of maturities in the $2.3 trillion CRE loan market over the next 18 months could pressure bank earnings materially." },
  { id: 7, sentiment: "positive", text: "EU approves landmark AI regulation; tech stocks rally on clarity", fullStory: "European Union lawmakers gave final approval to a comprehensive artificial intelligence regulatory framework, providing legal certainty for technology companies operating in the bloc. Contrary to initial investor fears, the rules are considered less restrictive than early drafts suggested.\n\nMajor U.S. tech stocks with significant European exposure, including MSFT, GOOGL, and META, all rose between 1.5% and 3.2% on the news. Industry groups praised the tiered risk-based approach that exempts most business applications from heavy compliance burdens." },
  { id: 8, sentiment: "neutral", text: "Treasury auction demand weakens; 10-year yield tests 4.65% level", fullStory: "Demand at the latest 10-year Treasury note auction came in below expectations, with a bid-to-cover ratio of 2.28 versus the prior 2.47, signaling softening appetite from foreign buyers. The yield briefly touched 4.65% before retreating.\n\nThe weak auction follows several months of elevated supply as the U.S. Treasury finances a widening fiscal deficit. Primary dealers were forced to absorb a larger-than-usual share of the offering, which is typically viewed as a bearish technical signal for bond prices." },
  { id: 9, sentiment: "negative", text: "TSLA misses delivery estimates by 8%; executive departures weigh on sentiment", fullStory: "Tesla reported first-quarter deliveries of 387,000 vehicles, falling 8% short of the consensus estimate of 421,000. The shortfall was attributed to factory downtime associated with the Cybertruck ramp and softer-than-expected demand in Europe.\n\nThree senior executives departed in the quarter, adding to an already turbulent leadership picture. Short interest in the stock has climbed to 4.2% of float, the highest level in 18 months." },
  { id: 10, sentiment: "positive", text: "Biotech sector surges after landmark FDA approval for Alzheimer's therapy", fullStory: "The biotech sector gained 4.1% after the FDA granted approval for a novel Alzheimer's disease-modifying therapy backed by Phase 3 data showing a 35% reduction in cognitive decline versus placebo. The approval marks a significant milestone for the field.\n\nMultiple companies working on adjacent mechanisms saw their shares rally in sympathy, including several mid-cap names with active clinical programs. Analysts estimate the total addressable market at over $20 billion annually." },
  { id: 11, sentiment: "neutral", text: "Dollar index retreats from 6-month high as growth differentials narrow", fullStory: "The U.S. Dollar Index pulled back from a six-month high after economic data from the Eurozone and Japan surprised to the upside, narrowing the growth differential that had been supporting dollar strength. EUR/USD recovered above 1.0850.\n\nCurrency strategists at Citi and Deutsche Bank both revised their year-end dollar forecasts modestly lower, citing the possibility that the Fed's easing cycle may begin before other major central banks fully close the gap." },
  { id: 12, sentiment: "positive", text: "JPM, GS post record trading revenue; Wall Street banks beat across the board", fullStory: "Major Wall Street banks reported another strong quarter, with JPMorgan and Goldman Sachs posting record fixed income and equity trading revenues. Investment banking fees also rebounded sharply, up 41% year-over-year as the M&A pipeline opened.\n\nThe KBW Bank Index advanced 3.8% on the earnings releases, led by Goldman Sachs which rose 6.4% after beating EPS estimates by 18%. Net interest margins held up better than feared despite moderate loan growth." },
  { id: 13, sentiment: "negative", text: "Consumer confidence falls to 3-year low; spending outlook dims", fullStory: "The Conference Board's Consumer Confidence Index dropped to 97.1 in March, its lowest reading since early 2023, as households grew increasingly worried about job security and persistent inflation in food and housing costs.\n\nRetailers and consumer discretionary stocks fell broadly on the news. Analysts at Morgan Stanley cut their Q2 GDP estimate by 0.3 percentage points, warning that the consumer, the largest engine of U.S. economic growth, may be entering a period of meaningful retrenchment." },
  { id: 14, sentiment: "positive", text: "AMZN AWS revenue accelerates to 22% growth; AI infrastructure spend beats", fullStory: "Amazon's AWS cloud division grew 22% year-over-year, accelerating from 17% in the prior quarter on the back of surging AI-related infrastructure demand and new enterprise contract wins. The segment contributed $28.3B in revenue, above the $26.7B consensus.\n\nAWS operating margins expanded by 280 basis points year-over-year to 37.6%, demonstrating the powerful operating leverage in the cloud business. Management raised AWS revenue guidance for the full year, citing a robust pipeline of multi-year enterprise AI commitments." },
];

const ARTICLE_DATA: Article[] = [
  {
    id: 0, category: "Macro", source: "Bloomberg", minutesAgo: 14, sentiment: "bearish", sentimentScore: -0.65,
    title: "Fed's Stubborn Inflation Battle Reshapes Global Rate Outlook",
    para1: "The Federal Reserve's battle against persistent core inflation has forced a broad repricing of global interest rate expectations, with markets now assigning near-zero probability to a rate cut before September. Core PCE, the Fed's preferred inflation gauge, came in at 2.8% for February, well above the 2% target.",
    para2: "International spillovers are significant. The Bank of England and European Central Bank have delayed their own easing cycles in part due to currency pressures from a strong dollar. Emerging market central banks face a dilemma: hold rates high to defend currencies, or cut to support slowing growth.",
    extraPara: "Structural factors complicate the picture further. The re-onshoring trend in manufacturing, elevated shelter costs, and wage growth in services suggest inflation may settle above 2% for an extended period. Some economists argue the Fed should explicitly raise its inflation target, though Powell has consistently dismissed this option.",
    tickers: ["TLT", "GLD", "DXY", "SPY"],
  },
  {
    id: 1, category: "Equities", source: "WSJ", minutesAgo: 37, sentiment: "bullish", sentimentScore: 0.78,
    title: "AI Capital Expenditure Supercycle Shows No Signs of Slowing",
    para1: "Technology giants are accelerating their artificial intelligence infrastructure investments at a pace that is surprising even the most optimistic analysts. Combined capital expenditure guidance from MSFT, GOOGL, META, and AMZN for 2026 now totals over $280 billion, a 55% increase from 2025.",
    para2: "The beneficiaries extend well beyond chip makers. Power utilities, data center REITs, cooling technology companies, and fiber optic cable manufacturers are all seeing demand surge. Analysts at Evercore ISI describe the current cycle as 'the largest infrastructure buildout in the history of technology.'",
    extraPara: "Skeptics warn that return-on-investment timelines remain unclear and that the current buildout could result in massive overcapacity if enterprise AI adoption lags. But for now, hyperscalers show no willingness to risk falling behind in what they perceive as a winner-takes-most race.",
    tickers: ["NVDA", "MSFT", "GOOGL", "META", "AMZN"],
  },
  {
    id: 2, category: "Bonds", source: "FT", minutesAgo: 92, sentiment: "bearish", sentimentScore: -0.45,
    title: "Global Bond Vigilantes Reassert Themselves as Deficits Widen",
    para1: "Sovereign bond markets are showing renewed stress as investors demand higher compensation for fiscal risk. The U.S. 10-year yield has pushed through 4.6% while UK gilts briefly touched 5.1%, reminiscent of the 2022 Truss-era turmoil that ultimately forced a policy reversal.",
    para2: "The International Monetary Fund's latest fiscal monitor projects that G7 debt-to-GDP ratios will reach an average of 128% by 2030 under current policy trajectories. This has prompted several sovereign wealth funds to quietly reduce their duration exposure in favor of shorter-dated instruments.",
    extraPara: "Credit spreads in investment-grade and high-yield markets remain relatively contained, suggesting the bond market's concerns are focused on rate levels and fiscal sustainability rather than credit quality. A break above 5% on the U.S. 10-year would likely trigger broader risk-off selling across asset classes.",
    tickers: ["TLT", "IEF", "HYG", "LQD"],
  },
  {
    id: 3, category: "Crypto", source: "Reuters", minutesAgo: 155, sentiment: "bullish", sentimentScore: 0.62,
    title: "Institutional Crypto Adoption Reaches Inflection Point",
    para1: "The approval and subsequent success of spot Bitcoin and Ethereum ETFs has fundamentally changed the institutional landscape for digital assets. Total assets under management across crypto ETFs have surpassed $85 billion, with pension funds and insurance companies allocating to the asset class for the first time.",
    para2: "Bitcoin's correlation with risk assets has declined over the past six months, strengthening the case for portfolio diversification. A study by Fidelity Digital Assets found that even a 1-3% portfolio allocation to Bitcoin over the past decade would have meaningfully improved risk-adjusted returns.",
    extraPara: "Regulatory clarity remains the key variable. The SEC's more constructive stance under new leadership has encouraged several major banks to begin offering crypto custody and trading services to wealth management clients. The convergence of traditional finance and digital assets is accelerating faster than most observers anticipated twelve months ago.",
    tickers: ["IBIT", "FBTC", "ETHA", "COIN"],
  },
  {
    id: 4, category: "Options", source: "CNBC", minutesAgo: 203, sentiment: "neutral", sentimentScore: 0.05,
    title: "Volatility Surface Signals Unusual Hedging Activity Ahead of NFP",
    para1: "The options market is sending cautionary signals ahead of Friday's non-farm payroll report, with the VIX term structure showing an unusual inversion between 1-week and 1-month implied volatility. Typically a sign of near-term event uncertainty, the pattern suggests institutional desks are purchasing short-dated protection.",
    para2: "Skew in equity index options has steepened, with out-of-the-money puts commanding an unusually large premium relative to calls. This asymmetric positioning historically precedes either a sharp downside move or a significant vol-crush rally if the feared catalyst fails to materialize.",
    extraPara: "Single-stock options activity has been equally noteworthy. Unusual call sweeps in financials and put buying in consumer discretionary names suggest sector rotation expectations among options-market participants. The CBOE's SKEW index, which measures tail risk premium, is near its 90th percentile of the past two years.",
    tickers: ["SPY", "QQQ", "VIX", "SVIX"],
  },
];

function generateEarnings(): EarningsEntry[] {
  const companies = [
    ["AAPL", "Apple Inc."], ["MSFT", "Microsoft"], ["GOOGL", "Alphabet"],
    ["AMZN", "Amazon"], ["META", "Meta Platforms"], ["NVDA", "NVIDIA"],
    ["TSLA", "Tesla"], ["JPM", "JPMorgan Chase"], ["GS", "Goldman Sachs"],
    ["JNJ", "Johnson & Johnson"], ["XOM", "ExxonMobil"], ["AMGN", "Amgen"],
    ["NFLX", "Netflix"], ["AMD", "Advanced Micro Devices"], ["CRM", "Salesforce"],
  ];
  const dates = [
    "Apr 1", "Apr 1", "Apr 2", "Apr 2", "Apr 3",
    "Apr 3", "Apr 7", "Apr 7", "Apr 8", "Apr 8",
    "Apr 9", "Apr 9", "Apr 10", "Apr 10", "Apr 14",
  ];
  return companies.map(([ticker, company], i) => ({
    id: i,
    ticker,
    company,
    date: dates[i],
    time: (i % 2 === 0 ? "AMC" : "BMO") as EarningTime,
    epsEst: parseFloat(rb(0.8, 6.5).toFixed(2)),
    epsPrior: parseFloat(rb(0.6, 6.0).toFixed(2)),
    importance: (ri(1, 3)) as 1 | 2 | 3,
    impliedMove: parseFloat(rb(2.5, 12.5).toFixed(1)),
    historicalSurprises: Array.from({ length: 8 }, () => parseFloat(rb(-8, 18).toFixed(1))),
  }));
}

function generateEconCalendar(): EconRelease[] {
  const releases = [
    { name: "Non-Farm Payrolls", priority: "High" as EconPriority, assets: ["USD", "Bonds", "Equities"] },
    { name: "CPI (Core YoY)", priority: "High" as EconPriority, assets: ["Bonds", "USD", "Gold"] },
    { name: "Fed FOMC Minutes", priority: "High" as EconPriority, assets: ["All"] },
    { name: "ISM Manufacturing PMI", priority: "High" as EconPriority, assets: ["USD", "Equities"] },
    { name: "GDP (Q1 Advance)", priority: "High" as EconPriority, assets: ["USD", "Bonds", "Equities"] },
    { name: "PPI (MoM)", priority: "Medium" as EconPriority, assets: ["Bonds", "USD"] },
    { name: "Retail Sales (MoM)", priority: "High" as EconPriority, assets: ["Equities", "USD"] },
    { name: "Jobless Claims", priority: "Medium" as EconPriority, assets: ["USD", "Equities"] },
    { name: "Consumer Confidence", priority: "Medium" as EconPriority, assets: ["Consumer", "Equities"] },
    { name: "Building Permits", priority: "Low" as EconPriority, assets: ["REITs", "Homebuilders"] },
    { name: "Durable Goods Orders", priority: "Medium" as EconPriority, assets: ["Industrials", "USD"] },
    { name: "Trade Balance", priority: "Low" as EconPriority, assets: ["USD"] },
    { name: "Fed Chair Speech", priority: "High" as EconPriority, assets: ["All"] },
    { name: "PCE Price Index", priority: "High" as EconPriority, assets: ["Bonds", "Gold", "USD"] },
    { name: "Michigan Consumer Sentiment", priority: "Medium" as EconPriority, assets: ["Consumer", "Equities"] },
    { name: "ISM Services PMI", priority: "High" as EconPriority, assets: ["USD", "Equities"] },
    { name: "JOLTS Job Openings", priority: "Medium" as EconPriority, assets: ["USD", "Bonds"] },
    { name: "ADP Employment Change", priority: "Medium" as EconPriority, assets: ["USD", "Equities"] },
    { name: "Factory Orders", priority: "Low" as EconPriority, assets: ["Industrials"] },
    { name: "Housing Starts", priority: "Medium" as EconPriority, assets: ["REITs", "Homebuilders"] },
  ];
  return releases.map((r, i) => ({
    id: i,
    name: r.name,
    priority: r.priority,
    affectedAssets: r.assets,
    date: `Apr ${1 + Math.floor(i / 4)}`,
    daysFromNow: Math.floor(i / 4),
    hoursFromNow: i === 0 ? 6 : ri(1, 72),
    prior: `${rb(-0.5, 3.5).toFixed(1)}%`,
    consensus: `${rb(-0.5, 3.5).toFixed(1)}%`,
    actual: i < 4 ? `${rb(-0.5, 3.5).toFixed(1)}%` : null,
  }));
}

function generateAnalystRatings(): AnalystRating[] {
  return Array.from({ length: 20 }, (_, i) => {
    const oldIdx = ri(0, 4);
    const delta = ri(-2, 2);
    const newIdx = Math.min(4, Math.max(0, oldIdx + delta));
    const action: RatingAction = delta > 0 ? "Upgrade" : delta < 0 ? "Downgrade" : "PT Change";
    const oldPT = ri(80, 420);
    const ptDelta = ri(-40, 80);
    return {
      id: i,
      firm: rp(ANALYST_FIRMS),
      ticker: rp(TICKERS),
      sector: rp(SECTORS),
      action,
      oldRating: RATINGS[oldIdx],
      newRating: RATINGS[newIdx],
      oldPT,
      newPT: Math.max(50, oldPT + ptDelta),
      reaction: parseFloat(rb(-5, 8).toFixed(2)),
      accuracy: ri(42, 78),
    };
  });
}

function generateSocialData(): SocialTicker[] {
  const extras = [
    ["GME", "GameStop"],
    ["AMC", "AMC Entertainment"],
  ];
  const combined = [...TICKERS.slice(0, 8).map((t) => [t, t]), ...extras];
  return combined.map(([ticker, company], i) => {
    const bull = ri(28, 78);
    const mentions = ri(2400, 95000);
    const avg = ri(800, 25000);
    const pc = parseFloat(rb(-6, 9).toFixed(2));
    const meme = mentions / avg > 3.5;
    return {
      id: i, ticker, company,
      bullishPct: bull, bearishPct: 100 - bull,
      mentions, mentionAvg: avg,
      priceChange: pc,
      memeAlert: meme,
      trend: (pc > 2 ? "rising" : pc < -2 ? "falling" : "flat") as "rising" | "falling" | "flat",
    };
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Breaking News Ticker
function BreakingNewsTicker({ headlines, onSelect }: {
  headlines: NewsHeadline[];
  onSelect: (h: NewsHeadline) => void;
}) {
  const tickerText = headlines.map((h) => h.text).join("   •••   ");
  return (
    <div className="bg-card border border-border/60 rounded-lg overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 bg-red-600 px-3 flex items-center">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">Breaking</span>
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <div
            className="flex whitespace-nowrap"
            style={{
              animation: "tickerScroll 60s linear infinite",
            }}
          >
            {[...headlines, ...headlines].map((h, i) => (
              <button
                key={i}
                onClick={() => onSelect(h)}
                className={cn(
                  "inline text-xs mr-8 hover:underline transition-colors cursor-pointer bg-transparent border-0 p-0",
                  h.sentiment === "positive" && "text-green-400",
                  h.sentiment === "negative" && "text-red-400",
                  h.sentiment === "neutral" && "text-foreground"
                )}
              >
                {h.text}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// Headline Story Modal
function HeadlineStory({ headline, onClose }: { headline: NewsHeadline; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border border-border/60 rounded-lg bg-card p-4 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors text-xs"
      >
        ✕ close
      </button>
      <p className={cn(
        "text-sm font-semibold mb-3",
        headline.sentiment === "positive" && "text-green-400",
        headline.sentiment === "negative" && "text-red-400",
      )}>
        {headline.text}
      </p>
      {headline.fullStory.split("\n\n").map((p, i) => (
        <p key={i} className="text-xs text-muted-foreground mb-2 leading-relaxed">{p}</p>
      ))}
    </motion.div>
  );
}

// Article card
function ArticleCard({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false);

  const sentimentConfig = {
    bullish: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: TrendingUp },
    bearish: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: TrendingDown },
    neutral: { color: "text-muted-foreground", bg: "bg-muted/40 border-border", icon: Minus },
  }[article.sentiment];

  const categoryColor: Record<ArticleCategory, string> = {
    Macro: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Equities: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Bonds: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Crypto: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    Options: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  };

  const SentimentIcon = sentimentConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-border/60 rounded-lg bg-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn("text-[10px] font-semibold border px-1.5 py-0.5 rounded", categoryColor[article.category])}>
              {article.category}
            </span>
            <span className="text-[10px] text-muted-foreground">{article.source}</span>
            <span className="text-[10px] text-muted-foreground">{article.minutesAgo}m ago</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">{article.title}</h3>
        </div>
        <div className={cn("flex-shrink-0 flex items-center gap-1 border px-2 py-1 rounded text-[10px] font-medium", sentimentConfig.bg, sentimentConfig.color)}>
          <SentimentIcon className="w-3 h-3" />
          <span className="capitalize">{article.sentiment}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{article.para1}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{article.para2}</p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">{article.extraPara}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-wrap gap-1">
          {article.tickers.map((t) => (
            <span key={t} className="text-[10px] font-mono bg-muted/50 text-foreground px-1.5 py-0.5 rounded border border-border/40 cursor-pointer hover:bg-muted transition-colors">
              ${t}
            </span>
          ))}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
        </button>
      </div>
    </motion.div>
  );
}

// Earnings surprise SVG chart
function EarningsSurpriseChart({ data }: { data: number[] }) {
  const W = 200, H = 60, pad = 8;
  const min = Math.min(-5, ...data);
  const max = Math.max(5, ...data);
  const range = max - min || 1;
  const toY = (v: number) => pad + ((max - v) / range) * (H - pad * 2);
  const barW = (W - pad * 2) / data.length - 2;
  const zeroY = toY(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
      <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
      {data.map((v, i) => {
        const x = pad + i * ((W - pad * 2) / data.length) + 1;
        const y = toY(Math.max(v, 0));
        const height = Math.abs(toY(v) - zeroY);
        const isPositive = v >= 0;
        return (
          <rect
            key={i}
            x={x} y={isPositive ? y : zeroY}
            width={barW} height={Math.max(1, height)}
            fill={isPositive ? "#22c55e" : "#ef4444"}
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}

// Earnings Calendar
function EarningsCalendar({ entries }: { entries: EarningsEntry[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: e.id * 0.03 }}
        >
          <button
            onClick={() => setSelected(selected === e.id ? null : e.id)}
            className="w-full text-left border border-border/60 rounded-lg bg-card p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0">
                  <p className="text-xs font-bold text-foreground font-mono">{e.ticker}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{e.company}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{e.date}
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    e.time === "AMC" ? "bg-indigo-500/15 text-indigo-400" : "bg-amber-500/15 text-amber-400"
                  )}>
                    {e.time}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 3 }, (_, si) => (
                      <Star
                        key={si}
                        className={cn("w-3 h-3", si < e.importance ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right flex-shrink-0">
                <div>
                  <p className="text-[10px] text-muted-foreground">Est EPS</p>
                  <p className="text-xs font-mono font-semibold text-foreground">${e.epsEst}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Prior</p>
                  <p className="text-xs font-mono text-muted-foreground">${e.epsPrior}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Impl Move</p>
                  <p className="text-xs font-mono font-semibold text-amber-400">±{e.impliedMove}%</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", selected === e.id && "rotate-180")} />
              </div>
            </div>
          </button>
          <AnimatePresence>
            {selected === e.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border border-t-0 border-border/60 rounded-b-lg bg-muted/20 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Historical EPS Surprise (last 8 quarters %)</p>
                  <EarningsSurpriseChart data={e.historicalSurprises} />
                  <div className="flex gap-3 mt-2">
                    {e.historicalSurprises.map((v, i) => (
                      <span key={i} className={cn("text-[10px] font-mono", v >= 0 ? "text-green-400" : "text-red-400")}>
                        {v > 0 ? "+" : ""}{v}%
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// Economic Calendar
function EconomicCalendar({ releases }: { releases: EconRelease[] }) {
  const nextHigh = releases.find((r) => r.priority === "High" && r.actual === null);

  const priorityConfig = {
    High: "bg-red-500/15 text-red-400 border-red-500/30",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Low: "bg-muted/40 text-muted-foreground border-border",
  };

  return (
    <div className="space-y-3">
      {nextHigh && (
        <div className="border border-red-500/30 rounded-lg bg-red-500/5 p-3 flex items-center gap-3">
          <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-400">Next High-Priority Release</p>
            <p className="text-xs text-foreground mt-0.5">{nextHigh.name}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-muted-foreground">Countdown</p>
            <p className="text-xs font-mono font-bold text-red-400">
              {nextHigh.daysFromNow === 0 ? `${nextHigh.hoursFromNow}h` : `${nextHigh.daysFromNow}d ${nextHigh.hoursFromNow % 24}h`}
            </p>
          </div>
        </div>
      )}

      <div className="border border-border/60 rounded-lg bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60">
              {["Date", "Release", "Priority", "Prior", "Consensus", "Actual", "Affects"].map((h) => (
                <th key={h} className="text-left text-[10px] text-muted-foreground font-medium px-3 py-2 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {releases.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                <td className="px-3 py-2">
                  <span className={cn("text-[10px] border px-1.5 py-0.5 rounded font-medium", priorityConfig[r.priority])}>
                    {r.priority}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{r.prior}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{r.consensus}</td>
                <td className="px-3 py-2 font-mono font-semibold">
                  {r.actual ? (
                    <span className={parseFloat(r.actual) > parseFloat(r.consensus) ? "text-green-400" : "text-red-400"}>
                      {r.actual}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 flex-wrap">
                    {r.affectedAssets.map((a) => (
                      <span key={a} className="text-[9px] bg-muted/50 text-muted-foreground px-1 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analyst Upgrades/Downgrades
function AnalystRatings({ ratings }: { ratings: AnalystRating[] }) {
  const [filter, setFilter] = useState<"All" | RatingAction>("All");
  const [sectorFilter, setSectorFilter] = useState<string>("All");

  const filtered = useMemo(() => ratings.filter((r) => {
    const matchAction = filter === "All" || r.action === filter;
    const matchSector = sectorFilter === "All" || r.sector === sectorFilter;
    return matchAction && matchSector;
  }), [ratings, filter, sectorFilter]);

  const actionConfig = {
    Upgrade: "text-green-400",
    Downgrade: "text-red-400",
    "PT Change": "text-amber-400",
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-muted-foreground" />
          {(["All", "Upgrade", "Downgrade", "PT Change"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="text-[10px] bg-card border border-border/60 rounded px-2 h-6 text-foreground cursor-pointer"
        >
          <option value="All">All Sectors</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="border border-border/60 rounded-lg bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-border/60">
              {["Firm", "Ticker", "Action", "Old Rating", "New Rating", "Old PT", "New PT", "Reaction", "Accuracy"].map((h) => (
                <th key={h} className="text-left text-[10px] text-muted-foreground font-medium px-3 py-2 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.firm}</td>
                <td className="px-3 py-2 font-mono font-bold text-foreground">{r.ticker}</td>
                <td className="px-3 py-2">
                  <span className={cn("font-semibold", actionConfig[r.action])}>
                    {r.action === "Upgrade" && <ArrowUp className="w-3 h-3 inline mr-0.5" />}
                    {r.action === "Downgrade" && <ArrowDown className="w-3 h-3 inline mr-0.5" />}
                    {r.action}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.oldRating}</td>
                <td className="px-3 py-2 font-medium text-foreground">{r.newRating}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">${r.oldPT}</td>
                <td className="px-3 py-2 font-mono font-semibold text-foreground">${r.newPT}</td>
                <td className={cn("px-3 py-2 font-mono font-semibold", r.reaction >= 0 ? "text-green-400" : "text-red-400")}>
                  {r.reaction >= 0 ? "+" : ""}{r.reaction.toFixed(2)}%
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", r.accuracy >= 60 ? "bg-green-500" : r.accuracy >= 45 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${r.accuracy}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{r.accuracy}%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Social sentiment bar SVG
function SentimentBar({ bull, bear }: { bull: number; bear: number }) {
  const W = 120, H = 8;
  const bullW = (bull / 100) * W;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="rounded overflow-hidden">
      <rect x={0} y={0} width={bullW} height={H} fill="#22c55e" opacity={0.8} />
      <rect x={bullW} y={0} width={W - bullW} height={H} fill="#ef4444" opacity={0.8} />
    </svg>
  );
}

// Correlation sparkline
function CorrelationSparkline({ price, sentiment }: { price: number[]; sentiment: number[] }) {
  const W = 80, H = 28, pad = 3;
  const toY = (arr: number[], v: number) => {
    const mn = Math.min(...arr), mx = Math.max(...arr);
    const range = mx - mn || 1;
    return pad + ((mx - v) / range) * (H - pad * 2);
  };
  const pts = (arr: number[]) =>
    arr.map((v, i) => `${pad + (i / (arr.length - 1)) * (W - pad * 2)},${toY(arr, v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <polyline points={pts(price)} fill="none" stroke="#3b82f6" strokeWidth={1.2} />
      <polyline points={pts(sentiment)} fill="none" stroke="#a855f7" strokeWidth={1.2} strokeDasharray="2,1" />
    </svg>
  );
}

// Social Sentiment Pulse
function SocialSentimentPulse({ data }: { data: SocialTicker[] }) {
  const mentionRatios = useMemo(
    () => data.map((d) => d.mentions / d.mentionAvg),
    [data]
  );

  // Deterministic sparklines per ticker
  const sparklines = useMemo(() =>
    data.map((d) => {
      let localS = d.id * 77 + 1;
      const localRand = () => {
        localS = (localS * 1103515245 + 12345) & 0x7fffffff;
        return localS / 0x7fffffff;
      };
      const price = Array.from({ length: 14 }, () => localRand() * 20 - 5);
      const sent = Array.from({ length: 14 }, () => localRand() * 100);
      return { price, sent };
    }), [data]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-blue-500" />
          <span className="text-[10px] text-muted-foreground">Price</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-purple-500 border-dashed border-t" style={{ borderStyle: "dashed" }} />
          <span className="text-[10px] text-muted-foreground">Social Sentiment</span>
        </div>
      </div>

      {data.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="border border-border/60 rounded-lg bg-card p-3"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-20 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold font-mono text-foreground">{d.ticker}</p>
                {d.memeAlert && (
                  <span className="text-[9px] bg-orange-500/15 text-orange-400 border border-orange-500/30 px-1 py-0.5 rounded font-bold uppercase tracking-wide">Meme</span>
                )}
              </div>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-medium mt-0.5",
                d.trend === "rising" ? "text-green-400" : d.trend === "falling" ? "text-red-400" : "text-muted-foreground"
              )}>
                {d.trend === "rising" && <TrendingUp className="w-3 h-3" />}
                {d.trend === "falling" && <TrendingDown className="w-3 h-3" />}
                {d.trend === "flat" && <Minus className="w-3 h-3" />}
                {d.priceChange >= 0 ? "+" : ""}{d.priceChange.toFixed(2)}%
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <SentimentBar bull={d.bullishPct} bear={d.bearishPct} />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="text-green-400">{d.bullishPct}% Bull</span>
                <span className="text-red-400">{d.bearishPct}% Bear</span>
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-muted-foreground">Mentions</p>
              <p className={cn(
                "text-xs font-mono font-semibold",
                mentionRatios[i] > 2 ? "text-orange-400" : mentionRatios[i] > 1.2 ? "text-amber-400" : "text-foreground"
              )}>
                {d.mentions >= 1000 ? `${(d.mentions / 1000).toFixed(1)}K` : d.mentions}
              </p>
              <p className="text-[9px] text-muted-foreground">
                {mentionRatios[i].toFixed(1)}x avg
              </p>
            </div>

            <div className="flex-shrink-0">
              <p className="text-[10px] text-muted-foreground mb-0.5">vs Price</p>
              <CorrelationSparkline price={sparklines[i].price} sentiment={sparklines[i].sent} />
            </div>

            {mentionRatios[i] > 2 && (
              <div className="flex items-center gap-1 text-[10px] text-orange-400 font-semibold">
                <Flame className="w-3 h-3" />
                <span>{mentionRatios[i].toFixed(1)}x spike</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FinancialNewsFeed() {
  const [selectedHeadline, setSelectedHeadline] = useState<NewsHeadline | null>(null);
  const [activeTab, setActiveTab] = useState("commentary");

  const earnings = useMemo(() => generateEarnings(), []);
  const econ = useMemo(() => generateEconCalendar(), []);
  const ratings = useMemo(() => generateAnalystRatings(), []);
  const social = useMemo(() => generateSocialData(), []);

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Financial News Feed</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <BreakingNewsTicker headlines={HEADLINES} onSelect={setSelectedHeadline} />

      {/* Story Expansion */}
      <AnimatePresence>
        {selectedHeadline && (
          <HeadlineStory headline={selectedHeadline} onClose={() => setSelectedHeadline(null)} />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8 gap-0.5">
          {[
            { value: "commentary", label: "Commentary", icon: MessageSquare },
            { value: "earnings", label: "Earnings", icon: BarChart2 },
            { value: "econ", label: "Economic", icon: Calendar },
            { value: "analysts", label: "Analysts", icon: Activity },
            { value: "social", label: "Social", icon: Zap },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="text-xs h-7 px-3 flex items-center gap-1.5">
              <Icon className="w-3 h-3" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="commentary" className="mt-4 space-y-4 data-[state=inactive]:hidden">
          {ARTICLE_DATA.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </TabsContent>

        <TabsContent value="earnings" className="mt-4 data-[state=inactive]:hidden">
          <EarningsCalendar entries={earnings} />
        </TabsContent>

        <TabsContent value="econ" className="mt-4 data-[state=inactive]:hidden">
          <EconomicCalendar releases={econ} />
        </TabsContent>

        <TabsContent value="analysts" className="mt-4 data-[state=inactive]:hidden">
          <AnalystRatings ratings={ratings} />
        </TabsContent>

        <TabsContent value="social" className="mt-4 data-[state=inactive]:hidden">
          <SocialSentimentPulse data={social} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
