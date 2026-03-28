"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  AlertCircle,
  BarChart3,
  Calendar,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsSentimentAnalyzer } from "@/components/news/NewsSentimentAnalyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── mulberry32 seeded PRNG ─────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ──────────────────────────────────────────────────────────────────

type Sentiment = "Bullish" | "Bearish" | "Neutral";
type Category =
  | "All"
  | "Fed/Rates"
  | "Earnings"
  | "Tech"
  | "Commodities"
  | "Macro"
  | "Geopolitical";

interface NewsItem {
  id: number;
  headline: string;
  source: string;
  minutesAgo: number;
  tickers: string[];
  sentiment: Sentiment;
  category: Exclude<Category, "All">;
  summary: string;
  marketImpact: string;
  isBreaking: boolean;
}

interface InsiderRow {
  date: string;
  company: string;
  ticker: string;
  insiderName: string;
  role: string;
  type: "Buy" | "Sell";
  shares: number;
  value: number;
}

interface AnalystChange {
  date: string;
  firm: string;
  ticker: string;
  change: "Upgrade" | "Downgrade";
  fromRating: string;
  toRating: string;
  newTarget: number;
}

interface EarningsRow {
  ticker: string;
  company: string;
  epsEst: number;
  epsActual: number;
  epsSurprisePct: number;
  revSurprisePct: number;
  day1Reaction: number;
  day5Drift: number;
}

interface CalendarEvent {
  date: string;
  event: string;
  type: "economic" | "earnings" | "holiday";
  impact: "high" | "medium" | "low";
  forecast?: string;
  previous?: string;
}

interface TickerSentiment {
  ticker: string;
  bullishPct: number;
  mentionCount: number;
}

interface SectorSentiment {
  sector: string;
  positive: number;
  negative: number;
  total: number;
}

// ── Data generation ────────────────────────────────────────────────────────

const SOURCES = ["Reuters", "Bloomberg", "CNBC", "WSJ", "FT"];
const TICKERS_ALL = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "SPY", "QQQ", "GLD", "BTC", "JPM", "NFLX", "AMD"];

const RAW_HEADLINES: {
  headline: string;
  tickers: string[];
  category: Exclude<Category, "All">;
  bullishKw?: string[];
  bearishKw?: string[];
  summary: string;
  marketImpact: string;
}[] = [
  {
    headline: "Fed Holds Rates Steady, Signals Two Cuts in 2026 Amid Cooling Inflation",
    tickers: ["SPY", "QQQ"],
    category: "Fed/Rates",
    bullishKw: ["cuts", "cooling"],
    summary:
      "The Federal Reserve held its benchmark rate at 5.25%–5.50% at Wednesday's FOMC meeting but updated the dot plot to show two rate cuts expected in 2026. Chair Powell noted that inflation data has improved materially while cautioning that the labor market remains resilient.",
    marketImpact: "Positive for equities and bonds. Rate-sensitive sectors (utilities, real estate) may outperform.",
  },
  {
    headline: "NVIDIA Posts Record Q4 Revenue of $39B, Beats Estimates by 18%",
    tickers: ["NVDA", "AMD"],
    category: "Earnings",
    bullishKw: ["record", "beats"],
    summary:
      "NVIDIA reported Q4 FY2026 revenue of $38.9 billion, smashing analyst consensus of $33.1 billion. Data center segment surged 120% YoY driven by Blackwell GPU demand. EPS of $0.89 beat the $0.75 estimate.",
    marketImpact: "Strong bullish catalyst for semiconductor sector. Watch for follow-through in AMD and AVGO.",
  },
  {
    headline: "Tesla Misses Q1 Delivery Estimates by 12%, Cuts Full-Year Guidance",
    tickers: ["TSLA"],
    category: "Earnings",
    bearishKw: ["misses", "cuts"],
    summary:
      "Tesla delivered 335,000 vehicles in Q1 2026 versus analyst expectations of 381,000. The company reduced full-year delivery guidance to 1.5 million units from the previously implied 1.8 million, citing slower demand in Europe and intensifying EV competition.",
    marketImpact: "Bearish for TSLA. May weigh on broader EV sector including RIVN and LCID.",
  },
  {
    headline: "CPI Rises 2.4% YoY in February, Softer Than 2.6% Forecast",
    tickers: ["SPY", "GLD"],
    category: "Macro",
    bullishKw: ["softer"],
    summary:
      "The Bureau of Labor Statistics reported the Consumer Price Index rose 2.4% year-over-year in February 2026, below the 2.6% consensus estimate. Core CPI ex-food and energy came in at 2.8% YoY. Monthly headline CPI was flat for the second consecutive month.",
    marketImpact: "Bullish for bonds and rate-sensitive stocks. Reduces pressure on Fed to maintain elevated rates.",
  },
  {
    headline: "Oil Surges 4% as Tensions Escalate in the Middle East",
    tickers: ["GLD", "SPY"],
    category: "Geopolitical",
    bearishKw: ["tensions", "escalate"],
    summary:
      "Crude oil jumped 4.2% to $87 per barrel after satellite imagery showed military buildups near critical shipping lanes in the Strait of Hormuz. The move rattled global risk sentiment and sent energy stocks sharply higher while broader indices fell.",
    marketImpact: "Bullish energy, bearish airlines and transport. Watch for risk-off positioning in SPY.",
  },
  {
    headline: "Apple Unveils AI-Powered Vision Pro 2 with 40% Battery Life Improvement",
    tickers: ["AAPL"],
    category: "Tech",
    bullishKw: ["unveils", "improvement"],
    summary:
      "Apple announced the Vision Pro 2 headset at its Spring Event, featuring a redesigned M4 Ultra chip and 40% improved battery life. The device will ship in June at a starting price of $2,999. Apple also previewed deep integrations with its Apple Intelligence platform.",
    marketImpact: "Positive for AAPL near-term. Bullish for AR/VR supply chain: LUMENTUM, II-VI.",
  },
  {
    headline: "Jobs Report: NFP Adds 180K in March, Unemployment Ticks Up to 4.1%",
    tickers: ["SPY", "QQQ"],
    category: "Macro",
    bullishKw: ["adds"],
    summary:
      "The March nonfarm payrolls report showed 180,000 jobs added versus the 210,000 consensus, while the unemployment rate rose to 4.1% from 4.0%. Average hourly earnings grew 3.7% YoY, slightly below the 3.9% forecast, signaling a gradual labor market cooling.",
    marketImpact: "Mixed signal — weaker hiring supports rate cuts, but rising unemployment raises recession concerns.",
  },
  {
    headline: "Microsoft Azure Revenue Grows 31% YoY, AI Cloud Demand Accelerating",
    tickers: ["MSFT", "NVDA"],
    category: "Earnings",
    bullishKw: ["grows", "accelerating"],
    summary:
      "Microsoft's fiscal Q3 results showed Azure and other cloud services revenue growing 31% year-over-year. CEO Satya Nadella highlighted that AI-related services now represent over 25% of Azure revenue, up from 12% a year ago. Total revenue of $68B beat the $66B estimate.",
    marketImpact: "Bullish for MSFT, cloud sector, and AI infrastructure plays like NVDA.",
  },
  {
    headline: "China Retaliates with 15% Tariff on US Tech Exports",
    tickers: ["AAPL", "QCOM", "NVDA"],
    category: "Geopolitical",
    bearishKw: ["tariff", "retaliation"],
    summary:
      "China's Ministry of Commerce announced a 15% tariff on a range of US technology exports effective April 15, targeting semiconductors, software, and cloud services. The move comes in response to US restrictions on advanced chip exports to Chinese entities.",
    marketImpact: "Bearish for US tech companies with significant China exposure: AAPL, QCOM, MU.",
  },
  {
    headline: "Gold Hits All-Time High of $3,100/oz on Safe-Haven Demand",
    tickers: ["GLD"],
    category: "Commodities",
    bullishKw: ["high", "demand"],
    summary:
      "Gold futures surged to a record $3,104 per troy ounce as investors sought refuge amid geopolitical uncertainty and expectations of lower real yields. ETF inflows into gold funds hit a three-year high this week, with GLD seeing $2.1 billion in single-day inflows.",
    marketImpact: "Bullish GLD and gold miners (GDX, NEM, GOLD). Typically bearish for USD.",
  },
  {
    headline: "Meta AI Assistant Reaches 1 Billion Monthly Active Users",
    tickers: ["META"],
    category: "Tech",
    bullishKw: ["reaches", "billion"],
    summary:
      "Meta announced that its AI assistant, powered by Llama 4, has surpassed one billion monthly active users across WhatsApp, Instagram, Messenger, and Facebook. The milestone underscores rapid consumer AI adoption and opens new monetization pathways for Meta.",
    marketImpact: "Bullish for META. Positive sentiment for AI sector broadly.",
  },
  {
    headline: "Fed's Waller: Rate Cuts Could Come Sooner If Disinflation Continues",
    tickers: ["SPY", "QQQ"],
    category: "Fed/Rates",
    bullishKw: ["cuts", "continues"],
    summary:
      "Fed Governor Christopher Waller stated in a speech that rate reductions could begin sooner than markets currently price if the disinflationary trend continues over the next two to three months. He emphasized the Fed is data-dependent and not on a preset path.",
    marketImpact: "Bullish for rate-sensitive sectors. Treasury yields declined 6bps on the comments.",
  },
  {
    headline: "Amazon AWS Signs $12B Multi-Year AI Infrastructure Deal with Saudi Arabia",
    tickers: ["AMZN"],
    category: "Tech",
    bullishKw: ["signs", "deal"],
    summary:
      "Amazon Web Services announced a landmark $12 billion multi-year agreement to build AI cloud infrastructure across Saudi Arabia, including three new data center regions. The deal is Amazon's largest international cloud commitment to date.",
    marketImpact: "Bullish for AMZN. Positive for cloud infrastructure and hyperscaler capex themes.",
  },
  {
    headline: "JPMorgan Q1 Profit Beats Estimates, Investment Banking Revenue Up 45%",
    tickers: ["JPM"],
    category: "Earnings",
    bullishKw: ["beats", "up"],
    summary:
      "JPMorgan Chase reported Q1 2026 net income of $14.2 billion, beating the $12.8 billion analyst consensus. Investment banking fees surged 45% year-over-year as IPO activity rebounded sharply. Net interest income of $23.1 billion was slightly above expectations.",
    marketImpact: "Bullish for JPM and broader financial sector. KRE (regional banks ETF) may also benefit.",
  },
  {
    headline: "PCE Inflation Data Shows Price Pressures Easing to 2.2% in February",
    tickers: ["SPY"],
    category: "Macro",
    bullishKw: ["easing"],
    summary:
      "The Personal Consumption Expenditures price index, the Fed's preferred inflation measure, rose 2.2% year-over-year in February, down from 2.5% in January. The data reinforces the case for Fed rate cuts in the second half of 2026.",
    marketImpact: "Bullish for equities and bonds. Expect continued rally in rate-sensitive sectors.",
  },
  {
    headline: "Google Faces $10B EU Fine Over Search Monopoly Practices",
    tickers: ["GOOGL"],
    category: "Geopolitical",
    bearishKw: ["fine", "monopoly"],
    summary:
      "The European Commission issued a preliminary finding that Alphabet's Google has abused its dominant position in online search to favor its own shopping and travel services. A final fine of up to $10 billion is expected within six months pending appeal rights.",
    marketImpact: "Bearish for GOOGL near-term. Regulatory overhang may weigh on multiples.",
  },
  {
    headline: "Netflix Adds 8.4M Subscribers in Q1, Ad-Supported Tier Now 40% of New Signups",
    tickers: ["NFLX"],
    category: "Earnings",
    bullishKw: ["adds", "new"],
    summary:
      "Netflix reported 8.4 million net subscriber additions in Q1 2026, well above the 5.1 million consensus estimate. The ad-supported tier accounted for 40% of new sign-ups globally, ahead of the company's 30% internal target, boosting revenue per user metrics.",
    marketImpact: "Bullish for NFLX. Positive read-through for streaming sector.",
  },
  {
    headline: "ISM Manufacturing PMI Contracts for 3rd Straight Month at 48.2",
    tickers: ["SPY"],
    category: "Macro",
    bearishKw: ["contracts", "3rd"],
    summary:
      "The Institute for Supply Management manufacturing index came in at 48.2 for March, below the expansion threshold of 50 for a third consecutive month. New orders sub-index fell to 45.8 while employment edged up slightly to 49.4.",
    marketImpact: "Bearish for industrial stocks. May increase recession probability estimates.",
  },
  {
    headline: "Copper Prices Fall 6% on Weak China PMI Data",
    tickers: ["GLD"],
    category: "Commodities",
    bearishKw: ["fall", "weak"],
    summary:
      "Copper futures dropped 6.1% to $3.82 per pound after China's official NBS Manufacturing PMI fell to 49.0, signaling contraction in the world's largest copper consumer. Weak construction activity and subdued factory output weighed on base metals broadly.",
    marketImpact: "Bearish for copper miners (FCX, SCCO). May signal broader global slowdown concerns.",
  },
  {
    headline: "AMD Gains AI Data Center Market Share with MI350 GPU Launch",
    tickers: ["AMD", "NVDA"],
    category: "Tech",
    bullishKw: ["gains", "launch"],
    summary:
      "Advanced Micro Devices announced commercial availability of its MI350 GPU accelerator, which benchmarks claim matches NVIDIA's H200 at 20% lower cost. Microsoft and Google confirmed they will deploy MI350 clusters in select data center regions by Q3 2026.",
    marketImpact: "Bullish for AMD, potentially bearish for NVDA's pricing power. Watch for share price divergence.",
  },
  {
    headline: "FOMC Minutes Reveal Hawkish Dissent: Two Members Wanted Rate Hike",
    tickers: ["SPY", "QQQ"],
    category: "Fed/Rates",
    bearishKw: ["hawkish", "hike"],
    summary:
      "Minutes from the latest Federal Open Market Committee meeting revealed two members dissented in favor of a 25 basis point rate hike, citing stickier-than-expected services inflation. Markets pared rate cut expectations for 2026 following the release.",
    marketImpact: "Bearish for equities, especially growth stocks. Treasury yields rose 8bps.",
  },
  {
    headline: "US 30-Year Treasury Auction Draws Weakest Demand in Five Years",
    tickers: ["SPY"],
    category: "Fed/Rates",
    bearishKw: ["weakest"],
    summary:
      "The US Treasury's $20 billion auction of 30-year bonds drew a bid-to-cover ratio of 2.23, the lowest since 2021. The auction tailed by 3 basis points, suggesting waning foreign and domestic demand for long-duration US debt at current yield levels.",
    marketImpact: "Bearish for bonds, may push yields higher. Long-duration equity plays (utilities, REITs) at risk.",
  },
  {
    headline: "EU Reaches Deal on AI Act Compliance for Large Language Models",
    tickers: ["MSFT", "GOOGL", "META"],
    category: "Geopolitical",
    summary:
      "European Union lawmakers reached a final agreement on enforcement mechanisms for the AI Act's provisions governing frontier AI models, with compliance deadlines starting August 2026. Companies face fines up to 3% of global revenue for non-compliance.",
    marketImpact: "Regulatory cost headwind for major AI players. May accelerate EU-based AI infrastructure investment.",
  },
  {
    headline: "Natural Gas Inventories Post Largest Weekly Build Since 2022",
    tickers: ["GLD"],
    category: "Commodities",
    bearishKw: ["build"],
    summary:
      "The EIA reported a natural gas storage build of 72 billion cubic feet for the week ending March 21, the largest single-week injection since November 2022. Warmer-than-expected temperatures and sluggish LNG export demand drove the outsized build.",
    marketImpact: "Bearish for natural gas prices. May weigh on E&P stocks with high gas exposure.",
  },
  {
    headline: "GDP Growth Revised Up to 2.8% in Q4 2025, Consumer Spending Resilient",
    tickers: ["SPY", "QQQ"],
    category: "Macro",
    bullishKw: ["growth", "revised up", "resilient"],
    summary:
      "The Bureau of Economic Analysis revised Q4 2025 GDP growth up to 2.8% annualized from the initial estimate of 2.3%, primarily due to stronger consumer spending data. Personal consumption expenditures were revised to 3.1% from 2.7%.",
    marketImpact: "Broadly bullish for equities. Reduces near-term recession fears and supports consumer discretionary.",
  },
];

function deriveSentiment(
  item: (typeof RAW_HEADLINES)[number],
  rng: () => number,
): Sentiment {
  const h = item.headline.toLowerCase();
  const bullScore = (item.bullishKw ?? []).filter((kw) => h.includes(kw)).length;
  const bearScore = (item.bearishKw ?? []).filter((kw) => h.includes(kw)).length;
  if (bullScore > bearScore) return "Bullish";
  if (bearScore > bullScore) return "Bearish";
  const r = rng();
  if (r < 0.4) return "Bullish";
  if (r < 0.7) return "Bearish";
  return "Neutral";
}

function generateNewsItems(): NewsItem[] {
  const rng = mulberry32(1234);
  return RAW_HEADLINES.map((raw, idx) => {
    const minutesAgo = Math.floor(rng() * 480) + 1; // 1–480 minutes
    const source = SOURCES[Math.floor(rng() * SOURCES.length)];
    const sentiment = deriveSentiment(raw, rng);
    return {
      id: idx,
      headline: raw.headline,
      source,
      minutesAgo,
      tickers: raw.tickers,
      sentiment,
      category: raw.category,
      summary: raw.summary,
      marketImpact: raw.marketImpact,
      isBreaking: idx < 3,
    };
  });
}

function generateInsiderRows(): InsiderRow[] {
  const rng = mulberry32(1234 + 100);
  const companies = [
    { ticker: "NVDA", company: "NVIDIA Corp" },
    { ticker: "AAPL", company: "Apple Inc" },
    { ticker: "MSFT", company: "Microsoft Corp" },
    { ticker: "TSLA", company: "Tesla Inc" },
    { ticker: "AMZN", company: "Amazon.com Inc" },
    { ticker: "META", company: "Meta Platforms" },
    { ticker: "GOOGL", company: "Alphabet Inc" },
    { ticker: "JPM", company: "JPMorgan Chase" },
    { ticker: "NFLX", company: "Netflix Inc" },
    { ticker: "AMD", company: "Advanced Micro Devices" },
  ];
  const roles = ["CEO", "CFO", "COO", "Director", "SVP", "CTO", "Chairman"];
  const names = [
    "Jensen Huang", "Tim Cook", "Satya Nadella", "Elon Musk", "Andy Jassy",
    "Mark Zuckerberg", "Sundar Pichai", "Jamie Dimon", "Ted Sarandos", "Lisa Su",
  ];
  return companies.map((c, i) => {
    const type: "Buy" | "Sell" = rng() < 0.35 ? "Buy" : "Sell";
    const shares = Math.floor(rng() * 50000) + 5000;
    const price = 100 + rng() * 400;
    const daysAgo = Math.floor(rng() * 14);
    const d = new Date("2026-03-27");
    d.setDate(d.getDate() - daysAgo);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      company: c.company,
      ticker: c.ticker,
      insiderName: names[i],
      role: roles[Math.floor(rng() * roles.length)],
      type,
      shares,
      value: Math.round(shares * price),
    };
  });
}

function generateAnalystChanges(): AnalystChange[] {
  const rng = mulberry32(1234 + 200);
  const firms = ["Goldman Sachs", "Morgan Stanley", "BofA", "Citi", "JPMorgan", "UBS", "Barclays", "Jefferies"];
  const ratings = ["Buy", "Overweight", "Neutral", "Hold", "Underweight", "Sell"];
  return TICKERS_ALL.slice(0, 8).map((ticker, i) => {
    const upgrade = rng() < 0.6;
    const fromIdx = upgrade
      ? Math.floor(rng() * 2) + 2
      : Math.floor(rng() * 2);
    const toIdx = upgrade
      ? Math.floor(rng() * 2)
      : Math.floor(rng() * 2) + 3;
    const daysAgo = Math.floor(rng() * 7);
    const d = new Date("2026-03-27");
    d.setDate(d.getDate() - daysAgo);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      firm: firms[i % firms.length],
      ticker,
      change: upgrade ? "Upgrade" : "Downgrade",
      fromRating: ratings[fromIdx],
      toRating: ratings[toIdx],
      newTarget: Math.round((80 + rng() * 320) * 10) / 10,
    };
  });
}

function generateEarningsRows(): EarningsRow[] {
  const rng = mulberry32(1234 + 300);
  const data = [
    { ticker: "NVDA", company: "NVIDIA Corp" },
    { ticker: "MSFT", company: "Microsoft Corp" },
    { ticker: "AAPL", company: "Apple Inc" },
    { ticker: "AMZN", company: "Amazon.com" },
    { ticker: "META", company: "Meta Platforms" },
    { ticker: "TSLA", company: "Tesla Inc" },
    { ticker: "GOOGL", company: "Alphabet Inc" },
    { ticker: "NFLX", company: "Netflix Inc" },
    { ticker: "JPM", company: "JPMorgan Chase" },
    { ticker: "AMD", company: "AMD" },
  ];
  return data.map((d) => {
    const epsEst = Math.round((0.5 + rng() * 2.5) * 100) / 100;
    const surpriseFactor = (rng() - 0.3) * 0.4; // bias positive
    const epsActual = Math.round(epsEst * (1 + surpriseFactor) * 100) / 100;
    const epsSurprisePct = Math.round(surpriseFactor * 100 * 10) / 10;
    const revSurprisePct = Math.round((rng() - 0.25) * 20 * 10) / 10;
    const day1Reaction = Math.round((epsSurprisePct * 0.3 + (rng() - 0.5) * 12) * 10) / 10;
    const drift = Math.round((rng() - 0.5) * 8 * 10) / 10;
    const day5Drift = Math.round((drift - day1Reaction * 0.2) * 10) / 10;
    return {
      ticker: d.ticker,
      company: d.company,
      epsEst,
      epsActual,
      epsSurprisePct,
      revSurprisePct,
      day1Reaction,
      day5Drift,
    };
  });
}

function generateCalendarEvents(): CalendarEvent[] {
  return [
    // This week
    { date: "Mar 27", event: "Consumer Confidence (Mar)", type: "economic", impact: "medium", forecast: "104.0", previous: "102.8" },
    { date: "Mar 27", event: "Richmond Fed Manufacturing", type: "economic", impact: "low", forecast: "2", previous: "-5" },
    { date: "Mar 28", event: "GDP (Q4 Final)", type: "economic", impact: "high", forecast: "2.8%", previous: "3.1%" },
    { date: "Mar 28", event: "Jobless Claims", type: "economic", impact: "medium", forecast: "220K", previous: "214K" },
    { date: "Mar 28", event: "Pending Home Sales (Feb)", type: "economic", impact: "low", forecast: "1.2%", previous: "-4.6%" },
    { date: "Mar 29", event: "PCE Inflation (Feb)", type: "economic", impact: "high", forecast: "2.2%", previous: "2.5%" },
    { date: "Mar 29", event: "Good Friday — Market Closed", type: "holiday", impact: "high" },
    // Next week
    { date: "Apr 1", event: "ISM Manufacturing PMI (Mar)", type: "economic", impact: "high", forecast: "49.5", previous: "50.3" },
    { date: "Apr 2", event: "JOLTS Job Openings (Feb)", type: "economic", impact: "medium", forecast: "8.9M", previous: "8.86M" },
    { date: "Apr 2", event: "NVIDIA Q1 Earnings", type: "earnings", impact: "high" },
    { date: "Apr 3", event: "ADP Employment (Mar)", type: "economic", impact: "medium", forecast: "155K", previous: "140K" },
    { date: "Apr 3", event: "ISM Services PMI (Mar)", type: "economic", impact: "high", forecast: "53.0", previous: "53.5" },
    { date: "Apr 4", event: "Nonfarm Payrolls (Mar)", type: "economic", impact: "high", forecast: "185K", previous: "180K" },
    { date: "Apr 4", event: "Unemployment Rate (Mar)", type: "economic", impact: "high", forecast: "4.1%", previous: "4.1%" },
    { date: "Apr 4", event: "Average Hourly Earnings (Mar)", type: "economic", impact: "medium", forecast: "3.7%", previous: "3.7%" },
    // FOMC dates
    { date: "Apr 29–30", event: "FOMC Meeting", type: "economic", impact: "high" },
    { date: "Jun 10–11", event: "FOMC Meeting", type: "economic", impact: "high" },
    { date: "Jul 29–30", event: "FOMC Meeting", type: "economic", impact: "high" },
    // Earnings next 30 days
    { date: "Apr 2", event: "Tesla (TSLA) Q1 Earnings", type: "earnings", impact: "high" },
    { date: "Apr 9", event: "JPMorgan (JPM) Q1 Earnings", type: "earnings", impact: "high" },
    { date: "Apr 16", event: "Apple (AAPL) Q2 Earnings", type: "earnings", impact: "high" },
    { date: "Apr 23", event: "Microsoft (MSFT) Q3 Earnings", type: "earnings", impact: "high" },
    { date: "Apr 24", event: "Alphabet (GOOGL) Q1 Earnings", type: "earnings", impact: "high" },
    { date: "Apr 25", event: "Amazon (AMZN) Q1 Earnings", type: "earnings", impact: "high" },
    { date: "May 1", event: "Meta (META) Q1 Earnings", type: "earnings", impact: "high" },
    { date: "May 8", event: "Netflix (NFLX) Q1 Earnings", type: "earnings", impact: "medium" },
    { date: "May 15", event: "AMD Q1 Earnings", type: "earnings", impact: "medium" },
    { date: "May 21", event: "CPI (Apr)", type: "economic", impact: "high", forecast: "2.3%", previous: "2.4%" },
    { date: "May 22", event: "PPI (Apr)", type: "economic", impact: "medium", forecast: "2.1%", previous: "2.3%" },
    { date: "Apr 17", event: "Memorial Day — Market Closed", type: "holiday", impact: "high" },
  ];
}

function generateTickerSentiments(): TickerSentiment[] {
  const rng = mulberry32(1234 + 400);
  return ["NVDA", "AAPL", "TSLA", "MSFT", "META", "AMZN", "GOOGL", "AMD"].map((ticker) => ({
    ticker,
    bullishPct: Math.round(30 + rng() * 55),
    mentionCount: Math.floor(rng() * 90000) + 10000,
  }));
}

function generateSectorSentiments(): SectorSentiment[] {
  const rng = mulberry32(1234 + 500);
  const sectors = ["Technology", "Financials", "Healthcare", "Energy", "Consumer", "Industrials", "Utilities", "Materials"];
  return sectors.map((sector) => {
    const total = Math.floor(rng() * 180) + 40;
    const positive = Math.floor(total * (0.3 + rng() * 0.5));
    return { sector, positive, negative: total - positive, total };
  });
}

// ── Formatting helpers ─────────────────────────────────────────────────────

function formatTimeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h ago` : `${h}h ${m}m ago`;
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Sentiment badge ────────────────────────────────────────────────────────

function SentimentBadge({ s }: { s: Sentiment }) {
  if (s === "Bullish")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        <TrendingUp className="h-2.5 w-2.5" />
        Bullish
      </span>
    );
  if (s === "Bearish")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
        <TrendingDown className="h-2.5 w-2.5" />
        Bearish
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Minus className="h-2.5 w-2.5" />
      Neutral
    </span>
  );
}

// ── Fear/Greed SVG Gauge ───────────────────────────────────────────────────

function FearGreedGauge({ value }: { value: number }) {
  // value: 0-100
  const cx = 120;
  const cy = 120;
  const r = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle; // 240 degrees

  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(start: number, end: number, innerR: number, outerR: number) {
    const s1 = polarToXY(start, outerR);
    const e1 = polarToXY(end, outerR);
    const s2 = polarToXY(end, innerR);
    const e2 = polarToXY(start, innerR);
    const large = end - start > 180 ? 1 : 0;
    return `M${s1.x},${s1.y} A${outerR},${outerR},0,${large},1,${e1.x},${e1.y} L${s2.x},${s2.y} A${innerR},${innerR},0,${large},0,${e2.x},${e2.y} Z`;
  }

  const segments = [
    { label: "Extreme Fear", color: "#ef4444", from: 0, to: 20 },
    { label: "Fear", color: "#f97316", from: 20, to: 40 },
    { label: "Neutral", color: "#eab308", from: 40, to: 60 },
    { label: "Greed", color: "#84cc16", from: 60, to: 80 },
    { label: "Extreme Greed", color: "#22c55e", from: 80, to: 100 },
  ];

  const needleAngle = startAngle + (value / 100) * totalAngle;
  const needleTip = polarToXY(needleAngle, r - 10);
  const needleBase1 = polarToXY(needleAngle + 90, 8);
  const needleBase2 = polarToXY(needleAngle - 90, 8);

  const activeSegment = segments.find((s) => value >= s.from && value <= s.to) ?? segments[2];

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="240" height="160" viewBox="0 0 240 160">
        {/* Background arcs */}
        {segments.map((seg) => {
          const sa = startAngle + (seg.from / 100) * totalAngle;
          const ea = startAngle + (seg.to / 100) * totalAngle;
          return (
            <path
              key={seg.label}
              d={describeArc(sa, ea, 60, r)}
              fill={seg.color}
              opacity={0.25}
            />
          );
        })}
        {/* Active fill */}
        {(() => {
          const sa = startAngle;
          const ea = startAngle + (value / 100) * totalAngle;
          return (
            <path
              d={describeArc(sa, ea, 60, r)}
              fill={activeSegment.color}
              opacity={0.7}
            />
          );
        })()}
        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill="white"
          opacity={0.9}
        />
        <circle cx={cx} cy={cy} r={6} fill="white" opacity={0.9} />
        {/* Value text */}
        <text x={cx} y={cy + 26} textAnchor="middle" fill="white" fontSize={28} fontWeight="bold">
          {value}
        </text>
        <text x={cx} y={cy + 44} textAnchor="middle" fill={activeSegment.color} fontSize={11} fontWeight={600}>
          {activeSegment.label}
        </text>
      </svg>
      <div className="flex gap-2 flex-wrap justify-center">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sector sentiment bar chart ─────────────────────────────────────────────

function SectorSentimentChart({ data }: { data: SectorSentiment[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total));
  const W = 340;
  const barH = 16;
  const gap = 8;
  const labelW = 90;
  const barW = W - labelW - 50;
  const totalH = data.length * (barH + gap);

  return (
    <svg width={W} height={totalH} className="overflow-visible">
      {data.map((d, i) => {
        const y = i * (barH + gap);
        const posW = (d.positive / maxTotal) * barW;
        const negW = (d.negative / maxTotal) * barW;
        const posPct = Math.round((d.positive / d.total) * 100);
        return (
          <g key={d.sector}>
            <text x={0} y={y + barH - 3} fill="currentColor" fontSize={10} className="fill-muted-foreground">
              {d.sector}
            </text>
            <rect x={labelW} y={y} width={posW} height={barH} fill="#22c55e" opacity={0.7} rx={2} />
            <rect x={labelW + posW} y={y} width={negW} height={barH} fill="#ef4444" opacity={0.7} rx={2} />
            <text x={labelW + posW + negW + 6} y={y + barH - 3} fill={posPct >= 50 ? "#22c55e" : "#ef4444"} fontSize={10} fontWeight={600}>
              {posPct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── EPS surprise scatter plot ──────────────────────────────────────────────

function EarningsScatterPlot({ rows }: { rows: EarningsRow[] }) {
  const W = 340;
  const H = 220;
  const pad = { top: 16, right: 16, bottom: 36, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const xMin = Math.min(...rows.map((r) => r.epsSurprisePct)) - 5;
  const xMax = Math.max(...rows.map((r) => r.epsSurprisePct)) + 5;
  const yMin = Math.min(...rows.map((r) => r.day1Reaction)) - 2;
  const yMax = Math.max(...rows.map((r) => r.day1Reaction)) + 2;

  function toX(v: number) {
    return pad.left + ((v - xMin) / (xMax - xMin)) * innerW;
  }
  function toY(v: number) {
    return pad.top + ((yMax - v) / (yMax - yMin)) * innerH;
  }

  // Simple linear regression
  const n = rows.length;
  const sumX = rows.reduce((a, r) => a + r.epsSurprisePct, 0);
  const sumY = rows.reduce((a, r) => a + r.day1Reaction, 0);
  const sumXY = rows.reduce((a, r) => a + r.epsSurprisePct * r.day1Reaction, 0);
  const sumX2 = rows.reduce((a, r) => a + r.epsSurprisePct ** 2, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;

  const regX1 = xMin;
  const regY1 = slope * regX1 + intercept;
  const regX2 = xMax;
  const regY2 = slope * regX2 + intercept;

  const xTicks = [-20, -10, 0, 10, 20, 30].filter((t) => t >= xMin && t <= xMax);
  const yTicks = [-10, -5, 0, 5, 10].filter((t) => t >= yMin && t <= yMax);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="currentColor" opacity={0.2} />
      <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="currentColor" opacity={0.2} />
      {/* Zero lines */}
      {xMin < 0 && xMax > 0 && (
        <line x1={toX(0)} y1={pad.top} x2={toX(0)} y2={pad.top + innerH} stroke="currentColor" opacity={0.1} strokeDasharray="4,4" />
      )}
      {yMin < 0 && yMax > 0 && (
        <line x1={pad.left} y1={toY(0)} x2={pad.left + innerW} y2={toY(0)} stroke="currentColor" opacity={0.1} strokeDasharray="4,4" />
      )}
      {/* X ticks */}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={toX(t)} y1={pad.top + innerH} x2={toX(t)} y2={pad.top + innerH + 4} stroke="currentColor" opacity={0.3} />
          <text x={toX(t)} y={pad.top + innerH + 14} textAnchor="middle" fill="currentColor" opacity={0.5} fontSize={9}>
            {t}%
          </text>
        </g>
      ))}
      {/* Y ticks */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={pad.left - 4} y1={toY(t)} x2={pad.left} y2={toY(t)} stroke="currentColor" opacity={0.3} />
          <text x={pad.left - 6} y={toY(t) + 3} textAnchor="end" fill="currentColor" opacity={0.5} fontSize={9}>
            {t}%
          </text>
        </g>
      ))}
      {/* Axis labels */}
      <text x={pad.left + innerW / 2} y={H - 2} textAnchor="middle" fill="currentColor" opacity={0.4} fontSize={9}>
        EPS Surprise %
      </text>
      <text transform={`translate(10,${pad.top + innerH / 2}) rotate(-90)`} textAnchor="middle" fill="currentColor" opacity={0.4} fontSize={9}>
        Day 1 Reaction %
      </text>
      {/* Regression line */}
      <line
        x1={toX(regX1)}
        y1={toY(regY1)}
        x2={toX(regX2)}
        y2={toY(regY2)}
        stroke="#6366f1"
        strokeWidth={1.5}
        opacity={0.6}
        strokeDasharray="6,3"
      />
      {/* Points */}
      {rows.map((r) => (
        <g key={r.ticker}>
          <circle
            cx={toX(r.epsSurprisePct)}
            cy={toY(r.day1Reaction)}
            r={5}
            fill={r.day1Reaction >= 0 ? "#22c55e" : "#ef4444"}
            opacity={0.75}
          />
          <text
            x={toX(r.epsSurprisePct)}
            y={toY(r.day1Reaction) - 8}
            textAnchor="middle"
            fill="currentColor"
            fontSize={8}
            opacity={0.7}
          >
            {r.ticker}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Countdown timer ────────────────────────────────────────────────────────

function CountdownTimer() {
  const target = useMemo(() => {
    // Next high-impact event: PCE on Mar 29 9:00 AM ET (14:00 UTC)
    const d = new Date("2026-03-29T14:00:00Z");
    return d;
  }, []);

  const [remaining, setRemaining] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setRemaining("Now");
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hrs = Math.floor((diff % 86_400_000) / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      const secs = Math.floor((diff % 60_000) / 1_000);
      setRemaining(
        days > 0
          ? `${days}d ${hrs}h ${mins}m`
          : `${hrs}h ${mins}m ${secs}s`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm">
      <Clock className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">Next high-impact event:</span>
      <span className="font-semibold text-primary">PCE Inflation (Mar 29)</span>
      <span className="ml-auto font-mono font-bold text-primary">{remaining}</span>
    </div>
  );
}

// ── Category pill ──────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["All", "Fed/Rates", "Earnings", "Tech", "Commodities", "Macro", "Geopolitical"];

function CategoryPills({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            active === c
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

// ── Impact dot ─────────────────────────────────────────────────────────────

function ImpactDot({ impact }: { impact: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        impact === "high" && "bg-red-500",
        impact === "medium" && "bg-amber-500",
        impact === "low" && "bg-emerald-500",
      )}
    />
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

const NEWS_ITEMS = generateNewsItems();
const INSIDER_ROWS = generateInsiderRows();
const ANALYST_CHANGES = generateAnalystChanges();
const EARNINGS_ROWS = generateEarningsRows();
const CALENDAR_EVENTS = generateCalendarEvents();
const TICKER_SENTIMENTS = generateTickerSentiments();
const SECTOR_SENTIMENTS = generateSectorSentiments();
const FEAR_GREED_VALUE = 62; // seeded fixed value

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const filteredNews = useMemo(() => {
    if (activeCategory === "All") return NEWS_ITEMS;
    return NEWS_ITEMS.filter((n) => n.category === activeCategory);
  }, [activeCategory]);

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function addToWatchlist(ticker: string) {
    setWatchlist((prev) => {
      const next = new Set(prev);
      next.add(ticker);
      return next;
    });
  }

  // Divergence alerts: bearish news but ticker is in bullish list, or vice versa
  const divergences = useMemo(() => {
    return NEWS_ITEMS.filter((n) => {
      if (n.sentiment === "Neutral") return false;
      // Find if any ticker in this news has opposite social sentiment
      return n.tickers.some((t) => {
        const ts = TICKER_SENTIMENTS.find((s) => s.ticker === t);
        if (!ts) return false;
        const socialBullish = ts.bullishPct >= 55;
        const socialBearish = ts.bullishPct <= 40;
        return (n.sentiment === "Bullish" && socialBearish) || (n.sentiment === "Bearish" && socialBullish);
      });
    }).slice(0, 3);
  }, []);

  // Overreaction detector
  const overreactions = useMemo(() => {
    return EARNINGS_ROWS.filter((r) => {
      // Day 1 positive but day 5 negative or vice versa
      return (r.day1Reaction > 3 && r.day5Drift < -2) || (r.day1Reaction < -3 && r.day5Drift > 2);
    });
  }, []);

  const insiderBuys = INSIDER_ROWS.filter((r) => r.type === "Buy").length;
  const insiderSells = INSIDER_ROWS.filter((r) => r.type === "Sell").length;
  const upgrades = ANALYST_CHANGES.filter((r) => r.change === "Upgrade").length;
  const downgrades = ANALYST_CHANGES.filter((r) => r.change === "Downgrade").length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-6 py-4">
        <Newspaper className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold leading-none">Market News</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            News feed, sentiment analysis, earnings impact &amp; economic calendar
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Last updated:</span>
          <span className="text-xs font-medium">Mar 27, 2026 · 4:32 PM ET</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feed" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-6 mt-3 shrink-0 self-start">
          <TabsTrigger value="feed">
            <Newspaper className="mr-1.5 h-3.5 w-3.5" />
            News Feed
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="earnings">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Earnings Impact
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Event Calendar
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: News Feed ─────────────────────────────────────────── */}
        <TabsContent
          value="feed"
          className="flex-1 overflow-y-auto px-6 pb-6 data-[state=inactive]:hidden"
        >
          <div className="mb-4 mt-4">
            <CategoryPills active={activeCategory} onChange={setActiveCategory} />
          </div>
          <div className="flex flex-col gap-3">
            {filteredNews.map((item) => {
              const expanded = expandedId === item.id;
              return (
                <Card key={item.id} className="border-border/50">
                  <CardContent className="p-4">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {item.isBreaking && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-400">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                                Breaking
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-primary">
                              {item.source}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTimeAgo(item.minutesAgo)}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm font-semibold leading-snug text-foreground">
                            {item.headline}
                          </p>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <SentimentBadge s={item.sentiment} />
                            {item.tickers.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-foreground/70"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="shrink-0 text-muted-foreground/40">
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="mt-4 border-t border-border/50 pt-4 space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="rounded-md bg-muted/50 px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Market Impact
                          </p>
                          <p className="text-xs text-foreground/80">{item.marketImpact}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">Related tickers:</span>
                          {item.tickers.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => addToWatchlist(t)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold transition-colors",
                                watchlist.has(t)
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
                              )}
                            >
                              {!watchlist.has(t) && <Plus className="h-2.5 w-2.5" />}
                              {t}
                              {watchlist.has(t) && (
                                <span className="text-[9px]">Watched</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Tab 2: Sentiment Dashboard ───────────────────────────────── */}
        <TabsContent
          value="sentiment"
          className="flex-1 overflow-y-auto px-6 pb-6 data-[state=inactive]:hidden"
        >
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Fear/Greed gauge */}
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Overall Market Sentiment — Fear &amp; Greed Index</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <FearGreedGauge value={FEAR_GREED_VALUE} />
              </CardContent>
            </Card>

            {/* Social media sentiment */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Social Media Sentiment (Reddit / Twitter)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TICKER_SENTIMENTS.map((ts) => (
                    <div key={ts.ticker} className="flex items-center gap-3">
                      <span className="w-12 font-mono text-xs font-semibold text-foreground/70">
                        {ts.ticker}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500/70 transition-all"
                          style={{ width: `${ts.bullishPct}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "w-10 text-right text-xs font-semibold",
                          ts.bullishPct >= 55
                            ? "text-emerald-400"
                            : ts.bullishPct <= 40
                            ? "text-red-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {ts.bullishPct}%
                      </span>
                      <span className="w-16 text-right text-[10px] text-muted-foreground">
                        {(ts.mentionCount / 1000).toFixed(0)}K mentions
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sector sentiment */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">News Sentiment by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <SectorSentimentChart data={SECTOR_SENTIMENTS} />
                <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500/70 inline-block" />
                    Positive articles
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-red-500/70 inline-block" />
                    Negative articles
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Insider trading */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Insider Trading Sentiment</CardTitle>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-400 font-semibold">{insiderBuys} Buys</span>
                    <span className="text-red-400 font-semibold">{insiderSells} Sells</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-1.5 text-left font-medium text-muted-foreground">Date</th>
                        <th className="pb-1.5 text-left font-medium text-muted-foreground">Ticker</th>
                        <th className="pb-1.5 text-left font-medium text-muted-foreground">Insider</th>
                        <th className="pb-1.5 text-right font-medium text-muted-foreground">Type</th>
                        <th className="pb-1.5 text-right font-medium text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INSIDER_ROWS.map((row, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="py-1.5 text-muted-foreground">{row.date}</td>
                          <td className="py-1.5 font-mono font-semibold">{row.ticker}</td>
                          <td className="py-1.5 text-muted-foreground max-w-[90px] truncate">{row.insiderName}</td>
                          <td className="py-1.5 text-right">
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                                row.type === "Buy"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-red-500/15 text-red-400",
                              )}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className="py-1.5 text-right font-medium">{formatLargeNumber(row.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Analyst changes */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Analyst Rating Changes This Week</CardTitle>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-400 font-semibold">{upgrades} Upgrades</span>
                    <span className="text-red-400 font-semibold">{downgrades} Downgrades</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ANALYST_CHANGES.map((row, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground w-12">{row.date}</span>
                      <span className="font-mono font-semibold w-12">{row.ticker}</span>
                      <span className="flex-1 text-muted-foreground text-[10px] truncate">{row.firm}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                          row.change === "Upgrade"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400",
                        )}
                      >
                        {row.change === "Upgrade" ? "▲" : "▼"} {row.change}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {row.fromRating} → {row.toRating}
                      </span>
                      <span className="font-medium w-14 text-right">${row.newTarget}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Divergence alerts */}
            {divergences.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    Sentiment vs Price Divergence Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {divergences.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 text-xs">
                        <SentimentBadge s={item.sentiment} />
                        <span className="text-muted-foreground flex-1">
                          <span className="font-semibold text-foreground">{item.tickers.join(", ")}</span>
                          {" — "}
                          News is {item.sentiment.toLowerCase()} but social media sentiment diverges.
                          Potential mispricing or delayed market reaction.
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 3: Earnings Impact ───────────────────────────────────── */}
        <TabsContent
          value="earnings"
          className="flex-1 overflow-y-auto px-6 pb-6 data-[state=inactive]:hidden"
        >
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Table */}
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Earnings Reactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-2 text-left font-medium text-muted-foreground">Ticker</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">EPS Est.</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">EPS Actual</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">EPS Surp.</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">Rev Surp.</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">Day 1</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">5-Day Drift</th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EARNINGS_ROWS.map((row) => {
                        const isOverreaction =
                          (row.day1Reaction > 3 && row.day5Drift < -2) ||
                          (row.day1Reaction < -3 && row.day5Drift > 2);
                        return (
                          <tr key={row.ticker} className="border-b border-border/30">
                            <td className="py-2">
                              <div className="font-mono font-semibold">{row.ticker}</div>
                              <div className="text-[10px] text-muted-foreground">{row.company}</div>
                            </td>
                            <td className="py-2 text-right text-muted-foreground">${row.epsEst.toFixed(2)}</td>
                            <td className="py-2 text-right font-medium">${row.epsActual.toFixed(2)}</td>
                            <td
                              className={cn(
                                "py-2 text-right font-semibold",
                                row.epsSurprisePct >= 0 ? "text-emerald-400" : "text-red-400",
                              )}
                            >
                              {row.epsSurprisePct >= 0 ? "+" : ""}
                              {row.epsSurprisePct.toFixed(1)}%
                            </td>
                            <td
                              className={cn(
                                "py-2 text-right",
                                row.revSurprisePct >= 0 ? "text-emerald-400" : "text-red-400",
                              )}
                            >
                              {row.revSurprisePct >= 0 ? "+" : ""}
                              {row.revSurprisePct.toFixed(1)}%
                            </td>
                            <td
                              className={cn(
                                "py-2 text-right font-semibold",
                                row.day1Reaction >= 0 ? "text-emerald-400" : "text-red-400",
                              )}
                            >
                              {row.day1Reaction >= 0 ? "+" : ""}
                              {row.day1Reaction.toFixed(1)}%
                            </td>
                            <td
                              className={cn(
                                "py-2 text-right",
                                row.day5Drift >= 0 ? "text-emerald-400" : "text-red-400",
                              )}
                            >
                              {row.day5Drift >= 0 ? "+" : ""}
                              {row.day5Drift.toFixed(1)}%
                            </td>
                            <td className="py-2 text-right">
                              {isOverreaction && (
                                <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-400">
                                  Overreaction
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Scatter plot */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">EPS Surprise vs Day-1 Price Reaction</CardTitle>
              </CardHeader>
              <CardContent>
                <EarningsScatterPlot rows={EARNINGS_ROWS} />
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Dashed line = regression. Green = positive reaction, red = negative reaction.
                </p>
              </CardContent>
            </Card>

            {/* Overreaction detector */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Market Overreaction Detector
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overreactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No significant overreactions detected.</p>
                ) : (
                  <div className="space-y-3">
                    {overreactions.map((row) => {
                      const reversed = (row.day1Reaction > 0 && row.day5Drift < 0) || (row.day1Reaction < 0 && row.day5Drift > 0);
                      return (
                        <div key={row.ticker} className="rounded-md bg-amber-500/10 p-3 text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold">{row.ticker}</span>
                            <span className="text-muted-foreground">{row.company}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            Day-1 reaction: <span className={cn("font-semibold", row.day1Reaction >= 0 ? "text-emerald-400" : "text-red-400")}>{row.day1Reaction >= 0 ? "+" : ""}{row.day1Reaction.toFixed(1)}%</span>{" "}
                            → 5-day drift: <span className={cn("font-semibold", row.day5Drift >= 0 ? "text-emerald-400" : "text-red-400")}>{row.day5Drift >= 0 ? "+" : ""}{row.day5Drift.toFixed(1)}%</span>.{" "}
                            {reversed
                              ? "Market fully reversed the initial move — potential mean-reversion opportunity."
                              : "Drift amplified the initial reaction — momentum continuation."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pre-earnings sentiment */}
                <div className="mt-4 border-t border-border/50 pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Pre-Earnings Sentiment (Next Week&apos;s Reporters)
                  </p>
                  <div className="space-y-2">
                    {[
                      { ticker: "NVDA", date: "Apr 2", score: 82 },
                      { ticker: "TSLA", date: "Apr 2", score: 38 },
                      { ticker: "JPM", date: "Apr 9", score: 65 },
                    ].map((item) => (
                      <div key={item.ticker} className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold w-12">{item.ticker}</span>
                        <span className="text-muted-foreground w-12">{item.date}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              item.score >= 60 ? "bg-emerald-500/70" : item.score >= 45 ? "bg-amber-500/70" : "bg-red-500/70",
                            )}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "w-10 text-right font-semibold",
                            item.score >= 60 ? "text-emerald-400" : item.score >= 45 ? "text-amber-400" : "text-red-400",
                          )}
                        >
                          {item.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4: Event Calendar ────────────────────────────────────── */}
        <TabsContent
          value="calendar"
          className="flex-1 overflow-y-auto px-6 pb-6 data-[state=inactive]:hidden"
        >
          <div className="mt-4 space-y-4">
            {/* Countdown */}
            <CountdownTimer />

            {/* This week */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">This Week (Mar 27 – Mar 29)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {CALENDAR_EVENTS.filter((e) =>
                    ["Mar 27", "Mar 28", "Mar 29"].some((d) => e.date.startsWith(d))
                  ).map((event, i) => (
                    <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
                      <ImpactDot impact={event.impact} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-muted-foreground w-14 shrink-0">
                            {event.date}
                          </span>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              event.type === "holiday" ? "text-amber-400" : "text-foreground",
                            )}
                          >
                            {event.event}
                          </span>
                          {event.type === "earnings" && (
                            <Badge variant="outline" className="text-[9px] border-primary/50 text-primary ml-1">
                              Earnings
                            </Badge>
                          )}
                        </div>
                        {(event.forecast || event.previous) && (
                          <div className="mt-0.5 flex gap-4 text-[10px] text-muted-foreground">
                            {event.forecast && <span>Forecast: <span className="font-medium text-foreground">{event.forecast}</span></span>}
                            {event.previous && <span>Previous: <span className="font-medium">{event.previous}</span></span>}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wide shrink-0",
                          event.impact === "high" ? "text-red-400" : event.impact === "medium" ? "text-amber-400" : "text-emerald-400",
                        )}
                      >
                        {event.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next week */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Next Week (Mar 31 – Apr 4)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {CALENDAR_EVENTS.filter((e) =>
                    ["Apr 1", "Apr 2", "Apr 3", "Apr 4"].some((d) => e.date.startsWith(d))
                  ).map((event, i) => (
                    <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
                      <ImpactDot impact={event.impact} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-muted-foreground w-14 shrink-0">
                            {event.date}
                          </span>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              event.type === "holiday" ? "text-amber-400" : "text-foreground",
                            )}
                          >
                            {event.event}
                          </span>
                          {event.type === "earnings" && (
                            <Badge variant="outline" className="text-[9px] border-primary/50 text-primary ml-1">
                              Earnings
                            </Badge>
                          )}
                        </div>
                        {(event.forecast || event.previous) && (
                          <div className="mt-0.5 flex gap-4 text-[10px] text-muted-foreground">
                            {event.forecast && <span>Forecast: <span className="font-medium text-foreground">{event.forecast}</span></span>}
                            {event.previous && <span>Previous: <span className="font-medium">{event.previous}</span></span>}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wide shrink-0",
                          event.impact === "high" ? "text-red-400" : event.impact === "medium" ? "text-amber-400" : "text-emerald-400",
                        )}
                      >
                        {event.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FOMC dates */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Upcoming FOMC Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {CALENDAR_EVENTS.filter((e) => e.event.includes("FOMC")).map((event, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-center"
                    >
                      <p className="text-xs font-bold text-primary">{event.date}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">FOMC Meeting</p>
                      <span className="mt-1 inline-block text-[9px] font-bold uppercase text-red-400">HIGH</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Earnings next 30 days */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Major Earnings — Next 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {CALENDAR_EVENTS.filter(
                    (e) => e.type === "earnings" && !e.event.includes("FOMC")
                  ).map((event, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border/50 bg-muted/30 px-3 py-2"
                    >
                      <p className="text-[10px] text-muted-foreground">{event.date}</p>
                      <p className="text-xs font-semibold leading-snug mt-0.5">{event.event}</p>
                      <ImpactDot impact={event.impact} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market holidays */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Holidays &amp; Market Closures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {CALENDAR_EVENTS.filter((e) => e.type === "holiday").map((event, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3"
                    >
                      <p className="text-xs font-bold text-amber-400">{event.date}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{event.event}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
