"use client";

import { useState, useMemo } from "react";
import {
 TrendingUp,
 TrendingDown,
 Minus,
 Flame,
 ChevronDown,
 ChevronUp,
 ChevronRight,
 ArrowUp,
 ArrowDown,
 AlertCircle,
 BarChart3,
 Activity,
 Zap,
 Globe,
 MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── mulberry32 seeded PRNG ──────────────────────────────────────────────────

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

// ── Constants ───────────────────────────────────────────────────────────────

const TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "JNJ", "XOM"];
const TIME_PERIODS = ["1h", "3h", "6h", "12h", "1d", "3d", "1w", "2w", "1m", "3m"];
const SOURCES = ["Bloomberg", "Reuters", "WSJ", "CNBC", "FT"];
const IMPACT_TYPES = ["Macro", "Company Specific", "Sector", "Geopolitical"] as const;
type ImpactType = typeof IMPACT_TYPES[number];

// ── Sentiment color helpers ─────────────────────────────────────────────────

function sentimentColor(score: number): string {
 if (score >= 0.6) return "bg-emerald-600 text-foreground";
 if (score >= 0.3) return "bg-emerald-500/70 text-foreground";
 if (score >= 0.1) return "bg-emerald-400/50 text-emerald-100";
 if (score >= -0.1) return "bg-muted text-muted-foreground";
 if (score >= -0.3) return "bg-red-400/50 text-red-100";
 if (score >= -0.6) return "bg-red-500/70 text-foreground";
 return "bg-red-700 text-foreground";
}

function sentimentBorderColor(score: number): string {
 if (score >= 0.3) return "border-emerald-500";
 if (score >= 0.1) return "border-emerald-400/50";
 if (score >= -0.1) return "border-border";
 if (score >= -0.3) return "border-red-400/50";
 return "border-red-500";
}

function scoreLabel(score: number): string {
 if (score >= 0.6) return "Very Bullish";
 if (score >= 0.3) return "Bullish";
 if (score >= 0.1) return "Slightly Bullish";
 if (score >= -0.1) return "Neutral";
 if (score >= -0.3) return "Slightly Bearish";
 if (score >= -0.6) return "Bearish";
 return "Very Bearish";
}

// ── Types ───────────────────────────────────────────────────────────────────

interface HeatmapCell {
 ticker: string;
 period: string;
 score: number;
 headlines: string[];
}

interface TopStory {
 id: number;
 headline: string;
 source: string;
 publishedAgo: string;
 tickers: string[];
 sentimentScore: number;
 impactType: ImpactType;
 aiSummary: string;
 priceMovesPct: Record<string, number>;
}

interface EarningsCall {
 ticker: string;
 company: string;
 date: string;
 managementTone: "Confident" | "Cautious" | "Defensive" | "Upbeat";
 guidanceAction: "Raised" | "Lowered" | "Maintained" | "Withdrawn";
 keywordFreq: {
 headwinds: number;
 tailwinds: number;
 uncertain: number;
 growth: number;
 margins: number;
 };
 qaTone: "Positive" | "Neutral" | "Skeptical" | "Hostile";
 sentimentScore: number;
 stockReaction: number;
}

interface SocialData {
 ticker: string;
 twitterVolume: number;
 redditMentions: number;
 bullishPct: number;
 bearishPct: number;
 neutralPct: number;
 momentum: "Accelerating" | "Decelerating" | "Stable";
 sevenDayAvgVolume: number;
 hourlyVolume: number[];
 hourlySentiment: number[];
}

interface MacroEvent {
 event: string;
 type: string;
 avgEquityMove: number;
 avgBondMove: number;
 avgDollarMove: number;
 scatterPoints: { miss: number; reaction: number }[];
 historicalNote: string;
}

interface UpcomingEvent {
 date: string;
 event: string;
 consensus: string;
 previous: string;
 playbook: { asset: string; avgMove: string; direction: "up" | "down" | "mixed" }[];
}

// ── Data generation ─────────────────────────────────────────────────────────

function generateData() {
 const rng = mulberry32(1926);
 const r = () => rng();

 // Section 1: Heatmap
 const heatmap: HeatmapCell[][] = TICKERS.map((ticker) =>
 TIME_PERIODS.map((period) => {
 const score = (r() * 2 - 1) * 0.85;
 const headlinePool: Record<string, string[]> = {
 AAPL: [
 "Apple eyes AI chip integration in iPhone 17 lineup",
 "Tim Cook dismisses tariff headwinds in investor briefing",
 "Apple services revenue hits all-time high of $26B",
 ],
 MSFT: [
 "Microsoft Azure OpenAI capacity doubles in Q1",
 "Teams premium subscription growth accelerates",
 "Activision integration drives gaming revenue 34% higher",
 ],
 GOOGL: [
 "Google Search AI mode surpasses 1B queries per day",
 "Alphabet antitrust ruling expected within weeks",
 "YouTube Shorts monetization rate triples YoY",
 ],
 AMZN: [
 "AWS re:Invent reveals next-gen Trainium 3 chip",
 "Amazon Prime membership hits 240M globally",
 "Retail operating margins expand 180bps in Q4",
 ],
 NVDA: [
 "NVIDIA Blackwell demand backlog extends to 18 months",
 "H200 shipments to hyperscalers accelerate",
 "CUDA developer ecosystem surpasses 5M engineers",
 ],
 META: [
 "Meta AI assistant reaches 700M monthly active users",
 "Reality Labs headset sales disappoint in holiday quarter",
 "Instagram Threads overtakes X in daily active users",
 ],
 TSLA: [
 "Tesla FSD v13 achieves 99.1% intervention-free rate",
 "Cybertruck production rate doubles to 2,000/week",
 "Tesla Energy storage deployments up 67% YoY",
 ],
 JPM: [
 "JPMorgan net interest income guidance raised for 2026",
 "Investment banking fees surge 28% on M&A revival",
 "JPM credit card delinquencies tick up 12bps",
 ],
 JNJ: [
 "Johnson & Johnson's Darzalex hits $10B annual run rate",
 "J&J talc settlement clears final legal hurdle",
 "Innovative medicine pipeline: 3 Phase III readouts due",
 ],
 XOM: [
 "ExxonMobil Pioneer integration delivers $1B synergies ahead of schedule",
 "Permian Basin output exceeds 1.5M boe/d for first time",
 "XOM raises dividend 5% citing free cash flow strength",
 ],
 };
 return {
 ticker,
 period,
 score,
 headlines: (headlinePool[ticker] ?? []).slice(0, 2),
 };
 })
 );

 // Overall market sentiment
 const allScores = heatmap.flat().map((c) => c.score);
 const marketScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

 // Section 2: Top Stories
 const TOP_HEADLINE_TEMPLATES: Omit<TopStory, "id" | "sentimentScore" | "priceMovesPct">[] = [
 {
 headline: "Fed Officials Signal Patience on Rate Cuts Despite Strong Jobs Data",
 source: "Bloomberg",
 publishedAgo: "14m ago",
 tickers: ["SPY", "QQQ"],
 impactType: "Macro",
 aiSummary:
 "Multiple Fed governors have communicated that the central bank needs additional confidence on inflation before easing. This raises the probability of the first cut being pushed to late 2026, pressuring rate-sensitive equities.",
 },
 {
 headline: "NVIDIA Secures $40B in Sovereign AI Orders Across 12 Nations",
 source: "Reuters",
 publishedAgo: "43m ago",
 tickers: ["NVDA"],
 impactType: "Company Specific",
 aiSummary:
 "NVIDIA's sovereign AI division has signed binding purchase agreements with 12 national governments totaling $40 billion over 3 years. The deals include full data-center infrastructure buildouts, significantly de-risking near-term revenue.",
 },
 {
 headline: "China Manufacturing PMI Contracts for Third Consecutive Month",
 source: "FT",
 publishedAgo: "1h ago",
 tickers: ["XOM", "AMZN"],
 impactType: "Geopolitical",
 aiSummary:
 "China's official manufacturing PMI fell to 48.7, below the 50 expansion threshold for the third straight month. Weaker demand from the world's largest goods producer creates cascading effects for global supply chains and commodity demand.",
 },
 {
 headline: "Apple Plans to Move 90% of US iPhone Assembly to India by 2027",
 source: "WSJ",
 publishedAgo: "2h ago",
 tickers: ["AAPL"],
 impactType: "Company Specific",
 aiSummary:
 "Apple's supply chain restructuring plan aims to reduce reliance on Chinese manufacturing by expanding Foxconn's Tamil Nadu facility to handle the majority of US-destined iPhones. This is a multi-year $15B commitment.",
 },
 {
 headline: "EU Digital Markets Act Fines: Meta Faces $1.3B Penalty for Data Sharing",
 source: "Reuters",
 publishedAgo: "3h ago",
 tickers: ["META"],
 impactType: "Sector",
 aiSummary:
 "The European Commission has issued a preliminary finding that Meta violated DMA provisions by combining user data across its platforms without adequate consent. The fine could reach $1.3B and may require structural changes to ad targeting.",
 },
 {
 headline: "JPMorgan Upgrades Entire Energy Sector to Overweight on Supply Tightness",
 source: "CNBC",
 publishedAgo: "4h ago",
 tickers: ["XOM", "JPM"],
 impactType: "Sector",
 aiSummary:
 "JPMorgan's commodity strategists raised their 12-month Brent crude target to $95/bbl, citing OPEC+ supply discipline and record summer travel demand. All major integrated oil companies are upgraded to Overweight.",
 },
 {
 headline: "Google Gemini Ultra Outperforms GPT-5 on 7 of 9 Standard Benchmarks",
 source: "Bloomberg",
 publishedAgo: "5h ago",
 tickers: ["GOOGL", "MSFT"],
 impactType: "Sector",
 aiSummary:
 "Alphabet's latest Gemini Ultra 2.0 model scored higher than OpenAI's GPT-5 on coding, reasoning, and multimodal tasks in independent evaluations. This shifts the competitive AI landscape and may benefit Alphabet's Cloud and Search businesses.",
 },
 {
 headline: "Treasury Yields Spike as $110B Bond Auction Shows Weak Demand",
 source: "WSJ",
 publishedAgo: "6h ago",
 tickers: ["JPM", "JNJ"],
 impactType: "Macro",
 aiSummary:
 "The 10-year Treasury auction saw a bid-to-cover ratio of 2.31, below the 12-auction average of 2.58. Foreign central bank participation dropped 4 percentage points, suggesting reduced global appetite for US sovereign debt.",
 },
 {
 headline: "J&J Wins FDA Approval for Next-Generation CAR-T Therapy",
 source: "FT",
 publishedAgo: "8h ago",
 tickers: ["JNJ"],
 impactType: "Company Specific",
 aiSummary:
 "Johnson & Johnson received FDA breakthrough approval for ciltacabtagene autoleucel in earlier-line myeloma treatment, expanding the addressable patient population by an estimated 8×. Peak sales estimates from analysts range from $4B to $7B annually.",
 },
 {
 headline: "Tesla Robotaxi Permit Denied in California; Company Eyes Texas Expansion",
 source: "CNBC",
 publishedAgo: "10h ago",
 tickers: ["TSLA"],
 impactType: "Company Specific",
 aiSummary:
 "California's DMV rejected Tesla's commercial robotaxi permit application citing insufficient safety data and disagreement over incident reporting methodology. Tesla's response pivots to Texas, where regulations are more permissive, for its initial commercial launch.",
 },
 ];

 const topStories: TopStory[] = TOP_HEADLINE_TEMPLATES.map((t, i) => ({
 id: i + 1,
 ...t,
 sentimentScore: parseFloat((r() * 2 - 1).toFixed(2)),
 priceMovesPct: Object.fromEntries(
 t.tickers.map((tk) => [tk, parseFloat(((r() * 2 - 1) * 4).toFixed(2))])
 ),
 }));

 // Section 3: Earnings calls
 const EARNINGS_COMPANIES = [
 { ticker: "MSFT", company: "Microsoft", date: "Jan 29, 2026" },
 { ticker: "AAPL", company: "Apple", date: "Jan 30, 2026" },
 { ticker: "META", company: "Meta", date: "Feb 5, 2026" },
 { ticker: "AMZN", company: "Amazon", date: "Feb 6, 2026" },
 { ticker: "GOOGL", company: "Alphabet", date: "Feb 4, 2026" },
 ];
 const TONES: EarningsCall["managementTone"][] = ["Confident", "Cautious", "Defensive", "Upbeat"];
 const GUIDANCE: EarningsCall["guidanceAction"][] = ["Raised", "Lowered", "Maintained", "Withdrawn"];
 const QA_TONES: EarningsCall["qaTone"][] = ["Positive", "Neutral", "Skeptical", "Hostile"];

 const earningsCalls: EarningsCall[] = EARNINGS_COMPANIES.map((co) => {
 const sentScore = parseFloat(((r() * 2 - 1) * 0.8).toFixed(2));
 return {
 ...co,
 managementTone: TONES[Math.floor(r() * TONES.length)],
 guidanceAction: GUIDANCE[Math.floor(r() * GUIDANCE.length)],
 keywordFreq: {
 headwinds: Math.floor(r() * 8) + 1,
 tailwinds: Math.floor(r() * 8) + 1,
 uncertain: Math.floor(r() * 6) + 1,
 growth: Math.floor(r() * 12) + 2,
 margins: Math.floor(r() * 9) + 2,
 },
 qaTone: QA_TONES[Math.floor(r() * QA_TONES.length)],
 sentimentScore: sentScore,
 stockReaction: parseFloat(((r() * 2 - 1) * 8).toFixed(2)),
 };
 });

 // Section 4: Social media
 const MOMENTUM_OPTIONS: SocialData["momentum"][] = ["Accelerating", "Decelerating", "Stable"];
 const socialData: SocialData[] = TICKERS.map((ticker) => {
 const baseVolume = Math.floor(r() * 40000) + 5000;
 const sevenDayAvg = Math.floor(baseVolume * (0.6 + r() * 0.8));
 const bull = 30 + Math.floor(r() * 40);
 const bear = 10 + Math.floor(r() * 35);
 const neutral = 100 - bull - bear;
 const hourlyVolume = Array.from({ length: 24 }, () => Math.floor(r() * baseVolume * 0.15 + baseVolume * 0.03));
 const hourlySentiment = Array.from({ length: 24 }, () => parseFloat(((r() * 2 - 1) * 0.7).toFixed(2)));
 return {
 ticker,
 twitterVolume: baseVolume,
 redditMentions: Math.floor(r() * 2000) + 200,
 bullishPct: bull,
 bearishPct: bear,
 neutralPct: Math.max(neutral, 5),
 momentum: MOMENTUM_OPTIONS[Math.floor(r() * 3)],
 sevenDayAvgVolume: sevenDayAvg,
 hourlyVolume,
 hourlySentiment,
 };
 });

 // Section 5: Macro events
 const macroEvents: MacroEvent[] = [
 {
 event: "Fed Rate Hike (+25bp)",
 type: "Monetary Policy",
 avgEquityMove: -0.8,
 avgBondMove: -1.2,
 avgDollarMove: +0.4,
 scatterPoints: Array.from({ length: 12 }, () => ({
 miss: parseFloat(((r() - 0.5) * 0.5).toFixed(3)),
 reaction: parseFloat(((r() - 0.5) * 2.5).toFixed(2)),
 })),
 historicalNote: "Equities have averaged -0.8% on hike days since 2022, with tech outperforming relative to defensives.",
 },
 {
 event: "CPI Miss (+0.1pp above consensus)",
 type: "Inflation Data",
 avgEquityMove: -1.4,
 avgBondMove: -0.9,
 avgDollarMove: +0.6,
 scatterPoints: Array.from({ length: 12 }, () => ({
 miss: parseFloat(((r() - 0.5) * 0.4).toFixed(3)),
 reaction: parseFloat(((r() - 0.5) * 3).toFixed(2)),
 })),
 historicalNote: "Bond markets react more sharply than equities to CPI surprises; a 0.2pp beat causes avg 10Y yield spike of +14bps.",
 },
 {
 event: "NFP Beat (+100k above consensus)",
 type: "Labor Market",
 avgEquityMove: -0.5,
 avgBondMove: -0.7,
 avgDollarMove: +0.8,
 scatterPoints: Array.from({ length: 12 }, () => ({
 miss: parseFloat(((r() - 0.5) * 150).toFixed(0)),
 reaction: parseFloat(((r() - 0.5) * 1.8).toFixed(2)),
 })),
 historicalNote: "Paradoxically, strong jobs data often pressures equities by pushing out rate-cut timelines; dollar typically strengthens.",
 },
 {
 event: "Geopolitical Escalation",
 type: "Risk Event",
 avgEquityMove: -2.1,
 avgBondMove: +1.8,
 avgDollarMove: +0.2,
 scatterPoints: Array.from({ length: 8 }, () => ({
 miss: parseFloat(((r() - 0.2) * 3).toFixed(2)),
 reaction: parseFloat(((r() - 0.5) * 5).toFixed(2)),
 })),
 historicalNote: "Risk-off flows dominate; Treasuries and gold benefit. Equity recovery average is 8 trading days to pre-event level.",
 },
 ];

 const upcomingEvents: UpcomingEvent[] = [
 {
 date: "Mar 28, 2026",
 event: "PCE Inflation (Feb)",
 consensus: "2.5% YoY",
 previous: "2.4% YoY",
 playbook: [
 { asset: "S&P 500", avgMove: "-0.8% if +0.1pp miss", direction: "down" },
 { asset: "10Y Treasury", avgMove: "+12bps if +0.1pp miss", direction: "down" },
 { asset: "USD Index", avgMove: "+0.4% if +0.1pp miss", direction: "up" },
 { asset: "Gold", avgMove: "-0.6% if +0.1pp miss", direction: "down" },
 ],
 },
 {
 date: "Apr 2, 2026",
 event: "ISM Manufacturing PMI",
 consensus: "49.5",
 previous: "48.9",
 playbook: [
 { asset: "S&P 500", avgMove: "+0.4% if beat", direction: "up" },
 { asset: "Industrials ETF", avgMove: "+0.9% if beat", direction: "up" },
 { asset: "Crude Oil", avgMove: "+1.2% if beat", direction: "up" },
 { asset: "10Y Treasury", avgMove: "-6bps if beat", direction: "up" },
 ],
 },
 {
 date: "Apr 4, 2026",
 event: "Non-Farm Payrolls (Mar)",
 consensus: "+185k",
 previous: "+228k",
 playbook: [
 { asset: "S&P 500", avgMove: "-0.5% if +100k beat", direction: "mixed" },
 { asset: "USD Index", avgMove: "+0.8% if +100k beat", direction: "up" },
 { asset: "2Y Treasury", avgMove: "+18bps if +100k beat", direction: "down" },
 { asset: "Nasdaq", avgMove: "-0.9% if +100k beat", direction: "down" },
 ],
 },
 ];

 return { heatmap, marketScore, topStories, earningsCalls, socialData, macroEvents, upcomingEvents };
}

// ── Section 1: Market Sentiment Heatmap ────────────────────────────────────

function MarketSentimentHeatmap({
 heatmap,
 marketScore,
}: {
 heatmap: HeatmapCell[][];
 marketScore: number;
}) {
 const [selected, setSelected] = useState<HeatmapCell | null>(null);

 const overallDir = marketScore > 0.05 ? "up" : marketScore < -0.05 ? "down" : "neutral";

 return (
 <Card className="border-border bg-card">
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2 text-sm font-semibold">
 <Activity className="h-4 w-4 text-primary" />
 Market Sentiment Heatmap
 </CardTitle>
 <div className="flex items-center gap-2">
 <span className="text-xs text-muted-foreground">Overall Market:</span>
 <span
 className={cn(
 "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
 marketScore > 0.05
 ? "bg-emerald-500/20 text-emerald-400"
 : marketScore < -0.05
 ? "bg-red-500/20 text-red-400"
 : "bg-muted text-muted-foreground"
 )}
 >
 {overallDir === "up" ? (
 <ArrowUp className="h-3 w-3" />
 ) : overallDir === "down" ? (
 <ArrowDown className="h-3 w-3" />
 ) : (
 <Minus className="h-3 w-3" />
 )}
 {marketScore > 0 ? "+" : ""}
 {(marketScore * 100).toFixed(1)}% {scoreLabel(marketScore)}
 </span>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 {/* Heatmap grid */}
 <div className="overflow-x-auto">
 <div className="min-w-[640px]">
 {/* Header row */}
 <div className="mb-1 flex">
 <div className="w-14 shrink-0" />
 {TIME_PERIODS.map((p) => (
 <div key={p} className="flex-1 text-center text-xs font-medium text-muted-foreground">
 {p}
 </div>
 ))}
 </div>
 {/* Data rows */}
 {heatmap.map((row, ri) => (
 <div key={ri} className="mb-0.5 flex items-center gap-0.5">
 <div className="w-14 shrink-0 text-right text-[11px] font-medium text-foreground pr-1">
 {TICKERS[ri]}
 </div>
 {row.map((cell, ci) => (
 <button
 key={ci}
 onClick={() => setSelected(selected?.ticker === cell.ticker && selected?.period === cell.period ? null : cell)}
 title={`${cell.ticker} ${cell.period}: ${cell.score > 0 ? "+" : ""}${cell.score.toFixed(2)}`}
 className={cn(
 "flex-1 rounded-sm py-2 text-[11px] font-semibold transition-colors hover:ring-1 hover:ring-white/30",
 sentimentColor(cell.score),
 selected?.ticker === cell.ticker && selected?.period === cell.period && "ring-2 ring-white"
 )}
 >
 {cell.score > 0 ? "+" : ""}
 {cell.score.toFixed(2)}
 </button>
 ))}
 </div>
 ))}
 </div>
 </div>

 {/* Legend */}
 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <span>Legend:</span>
 {[
 { label: "Very Bullish", cls: "bg-emerald-600" },
 { label: "Bullish", cls: "bg-emerald-500/70" },
 { label: "Neutral", cls: "bg-muted" },
 { label: "Bearish", cls: "bg-red-500/70" },
 { label: "Very Bearish", cls: "bg-red-700" },
 ].map((l) => (
 <span key={l.label} className="flex items-center gap-0.5">
 <span className={cn("inline-block h-2.5 w-2.5 rounded-sm", l.cls)} />
 {l.label}
 </span>
 ))}
 </div>

 {/* Selected cell headlines */}
 {selected && (
 <div className={cn("rounded-lg border p-3 bg-card/80", sentimentBorderColor(selected.score))}>
 <div className="mb-2 flex items-center justify-between">
 <span className="text-xs font-semibold">
 {selected.ticker} — {selected.period} period
 </span>
 <span
 className={cn(
 "rounded-full px-2 py-0.5 text-xs font-medium",
 sentimentColor(selected.score)
 )}
 >
 {selected.score > 0 ? "+" : ""}
 {selected.score.toFixed(2)} {scoreLabel(selected.score)}
 </span>
 </div>
 <ul className="space-y-1">
 {selected.headlines.map((h, i) => (
 <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
 <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
 {h}
 </li>
 ))}
 </ul>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

// ── Section 2: Top Story Analysis ──────────────────────────────────────────

function TopStoryAnalysis({ stories }: { stories: TopStory[] }) {
 const [expandedId, setExpandedId] = useState<number | null>(null);
 const [filterImpact, setFilterImpact] = useState<"All" | ImpactType>("All");
 const [filterSent, setFilterSent] = useState<"All" | "Bullish" | "Bearish">("All");

 const filtered = useMemo(
 () =>
 stories.filter((s) => {
 if (filterImpact !== "All" && s.impactType !== filterImpact) return false;
 if (filterSent === "Bullish" && s.sentimentScore < 0.1) return false;
 if (filterSent === "Bearish" && s.sentimentScore > -0.1) return false;
 return true;
 }),
 [stories, filterImpact, filterSent]
 );

 return (
 <Card className="border-border bg-card">
 <CardHeader className="pb-3">
 <div className="flex flex-wrap items-center gap-2">
 <CardTitle className="flex items-center gap-2 text-sm font-semibold">
 <Globe className="h-4 w-4 text-primary" />
 Top Story Analysis
 </CardTitle>
 <div className="ml-auto flex flex-wrap gap-1">
 {(["All", ...IMPACT_TYPES] as const).map((t) => (
 <button
 key={t}
 onClick={() => setFilterImpact(t)}
 className={cn(
 "rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
 filterImpact === t
 ? "bg-primary text-primary-foreground"
 : "bg-muted text-muted-foreground hover:bg-muted/80"
 )}
 >
 {t}
 </button>
 ))}
 <div className="mx-1 h-4 border-r border-border" />
 {(["All", "Bullish", "Bearish"] as const).map((s) => (
 <button
 key={s}
 onClick={() => setFilterSent(s)}
 className={cn(
 "rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
 filterSent === s
 ? "bg-primary text-primary-foreground"
 : "bg-muted text-muted-foreground hover:bg-muted/80"
 )}
 >
 {s}
 </button>
 ))}
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-2">
 {filtered.length === 0 && (
 <p className="py-4 text-center text-xs text-muted-foreground">No stories match current filters.</p>
 )}
 {filtered.map((story) => {
 const isExpanded = expandedId === story.id;
 return (
 <div
 key={story.id}
 className={cn(
 "rounded-lg border border-border bg-background/50 transition-colors",
 isExpanded && sentimentBorderColor(story.sentimentScore)
 )}
 >
 <button
 onClick={() => setExpandedId(isExpanded ? null : story.id)}
 className="flex w-full items-start gap-3 p-3 text-left"
 >
 {/* Sentiment bar */}
 <div
 className={cn(
 "mt-1 h-10 w-1 shrink-0 rounded-full",
 story.sentimentScore >= 0.3
 ? "bg-emerald-500"
 : story.sentimentScore <= -0.3
 ? "bg-red-500"
 : "bg-yellow-500"
 )}
 />
 <div className="min-w-0 flex-1">
 <div className="mb-1 flex flex-wrap items-center gap-1.5">
 <Badge variant="outline" className="text-[11px] px-1.5 py-0">
 {story.impactType}
 </Badge>
 {story.tickers.map((tk) => (
 <span key={tk} className="rounded bg-primary/10 px-1 text-xs font-semibold text-primary">
 {tk}
 </span>
 ))}
 <span className="text-xs text-muted-foreground">{story.source}</span>
 <span className="text-xs text-muted-foreground">{story.publishedAgo}</span>
 </div>
 <p className="text-xs font-medium leading-snug">{story.headline}</p>
 </div>
 <div className="flex shrink-0 flex-col items-end gap-1">
 <span
 className={cn(
 "rounded-full px-1.5 py-0.5 text-xs font-semibold",
 sentimentColor(story.sentimentScore)
 )}
 >
 {story.sentimentScore > 0 ? "+" : ""}
 {story.sentimentScore.toFixed(2)}
 </span>
 {isExpanded ? (
 <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
 ) : (
 <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
 )}
 </div>
 </button>

 {isExpanded && (
 <div className="border-t border-border px-3 pb-3 pt-2 space-y-2">
 <p className="text-xs text-muted-foreground leading-relaxed">{story.aiSummary}</p>
 <div className="flex flex-wrap gap-2">
 {Object.entries(story.priceMovesPct).map(([tk, move]) => (
 <span
 key={tk}
 className={cn(
 "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
 move >= 0
 ? "bg-emerald-500/15 text-emerald-400"
 : "bg-red-500/15 text-red-400"
 )}
 >
 {tk}{" "}
 {move >= 0 ? (
 <ArrowUp className="h-2.5 w-2.5" />
 ) : (
 <ArrowDown className="h-2.5 w-2.5" />
 )}
 {Math.abs(move).toFixed(2)}% since publication
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 );
 })}
 </CardContent>
 </Card>
 );
}

// ── Section 3: Earnings Commentary Sentiment ────────────────────────────────

function EarningsCommentary({ calls }: { calls: EarningsCall[] }) {
 const toneColor: Record<EarningsCall["managementTone"], string> = {
 Confident: "bg-emerald-500/20 text-emerald-400",
 Upbeat: "bg-emerald-400/20 text-emerald-300",
 Cautious: "bg-yellow-500/20 text-yellow-400",
 Defensive: "bg-red-500/20 text-red-400",
 };
 const guidanceColor: Record<EarningsCall["guidanceAction"], string> = {
 Raised: "bg-emerald-500/20 text-emerald-400",
 Maintained: "bg-muted text-muted-foreground",
 Lowered: "bg-red-500/20 text-red-400",
 Withdrawn: "bg-orange-500/20 text-orange-400",
 };
 const qaColor: Record<EarningsCall["qaTone"], string> = {
 Positive: "text-emerald-400",
 Neutral: "text-muted-foreground",
 Skeptical: "text-yellow-400",
 Hostile: "text-red-400",
 };

 // SVG scatter: stockReaction vs sentimentScore
 const W = 260;
 const H = 120;
 const PAD = 20;

 return (
 <Card className="border-border bg-card">
 <CardHeader className="pb-3">
 <CardTitle className="flex items-center gap-2 text-sm font-semibold">
 <BarChart3 className="h-4 w-4 text-primary" />
 Earnings Call Commentary Sentiment
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {calls.map((call) => (
 <div
 key={call.ticker}
 className="rounded-lg border border-border bg-background/50 p-3 space-y-2"
 >
 {/* Header */}
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-semibold">{call.company}</span>
 <span className="rounded bg-primary/10 px-1.5 text-xs font-semibold text-primary">{call.ticker}</span>
 <span className="text-xs text-muted-foreground">{call.date}</span>
 <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", toneColor[call.managementTone])}>
 Mgmt: {call.managementTone}
 </span>
 <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", guidanceColor[call.guidanceAction])}>
 Guidance {call.guidanceAction}
 </span>
 <span className={cn("ml-auto text-xs font-medium", qaColor[call.qaTone])}>
 Q&A: {call.qaTone}
 </span>
 </div>

 {/* Keyword frequency */}
 <div className="space-y-1">
 <p className="text-xs font-medium text-muted-foreground">
 Keyword Frequency
 </p>
 <div className="flex flex-wrap gap-1.5">
 {[
 { key: "headwinds", label: "headwinds", neg: true },
 { key: "uncertain", label: "uncertain", neg: true },
 { key: "tailwinds", label: "tailwinds", neg: false },
 { key: "growth", label: "growth", neg: false },
 { key: "margins", label: "margins", neg: null },
 ].map(({ key, label, neg }) => {
 const count = call.keywordFreq[key as keyof typeof call.keywordFreq];
 return (
 <span
 key={key}
 className={cn(
 "rounded px-1.5 py-0.5 text-xs font-medium",
 neg === true
 ? "bg-red-500/15 text-red-400"
 : neg === false
 ? "bg-emerald-500/15 text-emerald-400"
 : "bg-muted text-muted-foreground"
 )}
 >
 &ldquo;{label}&rdquo; ×{count}
 </span>
 );
 })}
 </div>
 </div>

 {/* Score + reaction */}
 <div className="flex items-center gap-4 text-xs">
 <span className="text-muted-foreground">
 Sentiment Score:{" "}
 <span
 className={cn(
 "font-semibold",
 call.sentimentScore >= 0.1
 ? "text-emerald-400"
 : call.sentimentScore <= -0.1
 ? "text-red-400"
 : "text-muted-foreground"
 )}
 >
 {call.sentimentScore > 0 ? "+" : ""}
 {call.sentimentScore.toFixed(2)}
 </span>
 </span>
 <span className="text-muted-foreground">
 Stock D+1:{" "}
 <span
 className={cn(
 "font-semibold",
 call.stockReaction >= 0 ? "text-emerald-400" : "text-red-400"
 )}
 >
 {call.stockReaction >= 0 ? "+" : ""}
 {call.stockReaction.toFixed(2)}%
 </span>
 </span>
 <span className="ml-auto text-xs text-muted-foreground">
 Correlation:{" "}
 <span className="font-medium text-foreground">
 {call.sentimentScore * call.stockReaction > 0 ? "Aligned" : "Diverged"}
 </span>
 </span>
 </div>
 </div>
 ))}

 {/* Scatter: sentiment vs stock reaction */}
 <div>
 <p className="mb-1 text-xs font-medium text-muted-foreground">
 Sentiment Score vs. D+1 Stock Reaction
 </p>
 <svg width={W} height={H} className="overflow-visible">
 {/* Axes */}
 <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="currentColor" strokeOpacity={0.2} />
 <line x1={PAD} y1={(H - PAD) / 2 + PAD / 2} x2={W - PAD} y2={(H - PAD) / 2 + PAD / 2} stroke="currentColor" strokeOpacity={0.2} />
 {/* Labels */}
 <text x={W / 2} y={H - 2} fill="currentColor" fontSize={8} textAnchor="middle" opacity={0.5}>
 Sentiment Score
 </text>
 <text x={6} y={H / 2} fill="currentColor" fontSize={8} textAnchor="middle" opacity={0.5} transform={`rotate(-90, 6, ${H / 2})`}>
 Stock %
 </text>
 {/* Points */}
 {calls.map((call, i) => {
 const cx = PAD + ((call.sentimentScore + 1) / 2) * (W - PAD * 2);
 const cy = H - PAD - ((call.stockReaction + 10) / 20) * (H - PAD * 2);
 return (
 <g key={i}>
 <circle cx={cx} cy={cy} r={5} fill={call.sentimentScore >= 0 ? "#10b981" : "#ef4444"} opacity={0.8} />
 <text x={cx + 6} y={cy + 3} fill="currentColor" fontSize={7} opacity={0.7}>
 {call.ticker}
 </text>
 </g>
 );
 })}
 </svg>
 </div>
 </CardContent>
 </Card>
 );
}

// ── Section 4: Social Media Pulse ──────────────────────────────────────────

function SocialMediaPulse({ data }: { data: SocialData[] }) {
 const [selectedTicker, setSelectedTicker] = useState<string>(data[0]?.ticker ?? "AAPL");
 const selected = data.find((d) => d.ticker === selectedTicker)!;
 const isViral = selected.twitterVolume > selected.sevenDayAvgVolume * 3;

 const momentumColor: Record<SocialData["momentum"], string> = {
 Accelerating: "text-emerald-400",
 Decelerating: "text-red-400",
 Stable: "text-muted-foreground",
 };

 // SVG 24h chart
 const W = 400;
 const H = 90;
 const PAD_L = 8;
 const PAD_R = 8;
 const PAD_T = 8;
 const PAD_B = 16;
 const inner_w = W - PAD_L - PAD_R;
 const inner_h = H - PAD_T - PAD_B;

 const maxVol = Math.max(...selected.hourlyVolume);
 const volPoints = selected.hourlyVolume
 .map((v, i) => {
 const x = PAD_L + (i / (selected.hourlyVolume.length - 1)) * inner_w;
 const y = PAD_T + (1 - v / maxVol) * inner_h;
 return `${x},${y}`;
 })
 .join(" ");

 const sentPoints = selected.hourlySentiment
 .map((s, i) => {
 const x = PAD_L + (i / (selected.hourlySentiment.length - 1)) * inner_w;
 const y = PAD_T + (1 - (s + 1) / 2) * inner_h;
 return `${x},${y}`;
 })
 .join(" ");

 return (
 <Card className="border-border bg-card">
 <CardHeader className="pb-3">
 <CardTitle className="flex items-center gap-2 text-sm font-semibold">
 <MessageSquare className="h-4 w-4 text-primary" />
 Social Media Pulse
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {/* Ticker grid */}
 <div className="flex flex-wrap gap-1.5">
 {data.map((d) => {
 const viral = d.twitterVolume > d.sevenDayAvgVolume * 3;
 return (
 <button
 key={d.ticker}
 onClick={() => setSelectedTicker(d.ticker)}
 className={cn(
 "relative flex flex-col items-center rounded-lg border px-3 py-1.5 text-xs transition-colors",
 selectedTicker === d.ticker
 ? "border-primary bg-primary/10"
 : "border-border bg-background/50 hover:border-border"
 )}
 >
 <span className="font-semibold">{d.ticker}</span>
 <span
 className={cn(
 "text-xs",
 d.bullishPct > 50 ? "text-emerald-400" : d.bearishPct > 40 ? "text-red-400" : "text-muted-foreground"
 )}
 >
 {d.bullishPct}% bull
 </span>
 {viral && (
 <span className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 rounded-full bg-orange-500 px-1 text-[11px] font-semibold text-foreground">
 <Flame className="h-2 w-2" />
 HOT
 </span>
 )}
 </button>
 );
 })}
 </div>

 {/* Selected ticker detail */}
 {selected && (
 <div className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
 <div className="flex items-center gap-3 flex-wrap">
 <span className="text-sm font-semibold">{selected.ticker}</span>
 {isViral && (
 <Badge className="bg-orange-500 text-foreground text-xs">
 <Flame className="mr-0.5 h-2.5 w-2.5" />
 VIRAL — {((selected.twitterVolume / selected.sevenDayAvgVolume) * 100 - 100).toFixed(0)}% above 7d avg
 </Badge>
 )}
 <span className={cn("ml-auto text-xs font-medium", momentumColor[selected.momentum])}>
 {selected.momentum === "Accelerating" ? (
 <TrendingUp className="inline h-3 w-3 mr-0.5" />
 ) : selected.momentum === "Decelerating" ? (
 <TrendingDown className="inline h-3 w-3 mr-0.5" />
 ) : (
 <Minus className="inline h-3 w-3 mr-0.5" />
 )}
 {selected.momentum}
 </span>
 </div>

 {/* Stats row */}
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 {[
 { label: "X/Twitter Vol", value: selected.twitterVolume.toLocaleString() },
 { label: "Reddit Mentions", value: selected.redditMentions.toLocaleString() },
 { label: "7d Avg Vol", value: selected.sevenDayAvgVolume.toLocaleString() },
 { label: "Bullish/Bear/Neutral", value: `${selected.bullishPct}/${selected.bearishPct}/${selected.neutralPct}%` },
 ].map((s) => (
 <div key={s.label} className="rounded bg-muted/50 p-2">
 <p className="text-[11px] text-muted-foreground">{s.label}</p>
 <p className="text-xs font-semibold">{s.value}</p>
 </div>
 ))}
 </div>

 {/* Sentiment bar */}
 <div>
 <p className="mb-1 text-xs text-muted-foreground">Sentiment distribution</p>
 <div className="flex h-3 overflow-hidden rounded-full">
 <div className="bg-emerald-500" style={{ width: `${selected.bullishPct}%` }} />
 <div className="bg-muted" style={{ width: `${selected.neutralPct}%` }} />
 <div className="bg-red-500" style={{ width: `${selected.bearishPct}%` }} />
 </div>
 <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
 <span className="text-emerald-400">{selected.bullishPct}% Bullish</span>
 <span>{selected.neutralPct}% Neutral</span>
 <span className="text-red-400">{selected.bearishPct}% Bearish</span>
 </div>
 </div>

 {/* 24h SVG chart */}
 <div>
 <p className="mb-1 text-xs text-muted-foreground">24h Mention Volume + Sentiment</p>
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 {/* Volume area */}
 <polyline
 points={volPoints}
 fill="none"
 stroke="#6366f1"
 strokeWidth={1.5}
 strokeOpacity={0.7}
 />
 {/* Sentiment line */}
 <polyline
 points={sentPoints}
 fill="none"
 stroke="#10b981"
 strokeWidth={1.5}
 strokeOpacity={0.7}
 strokeDasharray="3 2"
 />
 {/* Axis hours */}
 {[0, 6, 12, 18, 23].map((h) => (
 <text
 key={h}
 x={PAD_L + (h / 23) * inner_w}
 y={H - 2}
 fill="currentColor"
 fontSize={7}
 textAnchor="middle"
 opacity={0.4}
 >
 {h}h
 </text>
 ))}
 {/* Legend */}
 <rect x={W - 90} y={PAD_T} width={6} height={2} fill="#6366f1" opacity={0.7} />
 <text x={W - 82} y={PAD_T + 3} fill="currentColor" fontSize={7} opacity={0.6}>
 Volume
 </text>
 <rect x={W - 90} y={PAD_T + 10} width={6} height={2} fill="#10b981" opacity={0.7} />
 <text x={W - 82} y={PAD_T + 13} fill="currentColor" fontSize={7} opacity={0.6}>
 Sentiment
 </text>
 </svg>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

// ── Section 5: Macro Event Impact Model ────────────────────────────────────

function MacroEventImpact({
 events,
 upcoming,
}: {
 events: MacroEvent[];
 upcoming: UpcomingEvent[];
}) {
 const [selectedEvent, setSelectedEvent] = useState(0);
 const ev = events[selectedEvent];

 // SVG scatter
 const W = 280;
 const H = 140;
 const PL = 32;
 const PR = 12;
 const PT = 12;
 const PB = 24;
 const iw = W - PL - PR;
 const ih = H - PT - PB;

 const xMin = Math.min(...ev.scatterPoints.map((p) => p.miss));
 const xMax = Math.max(...ev.scatterPoints.map((p) => p.miss));
 const yMin = Math.min(...ev.scatterPoints.map((p) => p.reaction));
 const yMax = Math.max(...ev.scatterPoints.map((p) => p.reaction));

 const toSvgX = (v: number) => PL + ((v - xMin) / (xMax - xMin || 1)) * iw;
 const toSvgY = (v: number) => PT + (1 - (v - yMin) / (yMax - yMin || 1)) * ih;

 const dirColor = (d: UpcomingEvent["playbook"][0]["direction"]) =>
 d === "up" ? "text-emerald-400" : d === "down" ? "text-red-400" : "text-yellow-400";

 return (
 <Card className="border-border bg-card">
 <CardHeader className="pb-3">
 <CardTitle className="flex items-center gap-2 text-sm font-semibold">
 <Zap className="h-4 w-4 text-primary" />
 Macro Event Impact Model
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {/* Event selector */}
 <div className="flex flex-wrap gap-1.5">
 {events.map((e, i) => (
 <button
 key={i}
 onClick={() => setSelectedEvent(i)}
 className={cn(
 "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
 selectedEvent === i
 ? "bg-primary text-primary-foreground"
 : "bg-muted text-muted-foreground hover:bg-muted/80"
 )}
 >
 {e.event}
 </button>
 ))}
 </div>

 {/* Historical averages */}
 <div className="grid grid-cols-3 gap-2">
 {[
 { label: "Avg Equity", value: ev.avgEquityMove, suffix: "%" },
 { label: "Avg Bond", value: ev.avgBondMove, suffix: "%" },
 { label: "Avg Dollar", value: ev.avgDollarMove, suffix: "%" },
 ].map((m) => (
 <div key={m.label} className="rounded-lg border border-border p-2 text-center">
 <p className="text-xs text-muted-foreground">{m.label}</p>
 <p
 className={cn(
 "text-sm font-semibold",
 m.value >= 0 ? "text-emerald-400" : "text-red-400"
 )}
 >
 {m.value >= 0 ? "+" : ""}
 {m.value.toFixed(1)}
 {m.suffix}
 </p>
 </div>
 ))}
 </div>

 {/* Historical note */}
 <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
 <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
 <p className="text-xs text-muted-foreground leading-relaxed">{ev.historicalNote}</p>
 </div>

 {/* Scatter plot */}
 <div>
 <p className="mb-1 text-xs font-medium text-muted-foreground">
 Surprise Magnitude vs. Market Reaction (historical)
 </p>
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 {/* Grid */}
 <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="currentColor" strokeOpacity={0.15} />
 <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="currentColor" strokeOpacity={0.15} />
 {/* Zero lines */}
 <line
 x1={toSvgX(0)}
 y1={PT}
 x2={toSvgX(0)}
 y2={H - PB}
 stroke="currentColor"
 strokeOpacity={0.3}
 strokeDasharray="3 2"
 />
 <line
 x1={PL}
 y1={toSvgY(0)}
 x2={W - PR}
 y2={toSvgY(0)}
 stroke="currentColor"
 strokeOpacity={0.3}
 strokeDasharray="3 2"
 />
 {/* Points */}
 {ev.scatterPoints.map((p, i) => (
 <circle
 key={i}
 cx={toSvgX(p.miss)}
 cy={toSvgY(p.reaction)}
 r={4}
 fill={p.reaction >= 0 ? "#10b981" : "#ef4444"}
 opacity={0.75}
 />
 ))}
 {/* Axis labels */}
 <text x={W / 2} y={H - 2} fill="currentColor" fontSize={7} textAnchor="middle" opacity={0.5}>
 Surprise magnitude
 </text>
 <text x={8} y={H / 2} fill="currentColor" fontSize={7} textAnchor="middle" opacity={0.5} transform={`rotate(-90, 8, ${H / 2})`}>
 Reaction %
 </text>
 </svg>
 </div>

 {/* Surprise index chips */}
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Surprise Index — Current Economic Releases
 </p>
 <div className="flex flex-wrap gap-1.5">
 {[
 { label: "CPI", value: "+0.08pp", dir: "up" },
 { label: "NFP", value: "+42k", dir: "up" },
 { label: "GDP", value: "-0.1pp", dir: "down" },
 { label: "ISM Mfg", value: "-0.4", dir: "down" },
 { label: "Retail Sales", value: "+0.2pp", dir: "up" },
 { label: "Consumer Conf", value: "+3.1", dir: "up" },
 ].map((item) => (
 <span
 key={item.label}
 className={cn(
 "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
 item.dir === "up"
 ? "bg-emerald-500/15 text-emerald-400"
 : "bg-red-500/15 text-red-400"
 )}
 >
 {item.dir === "up" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
 {item.label} {item.value}
 </span>
 ))}
 </div>
 </div>

 {/* Upcoming events playbook */}
 <div>
 <p className="mb-2 text-xs font-medium text-muted-foreground">
 Upcoming Event Playbook
 </p>
 <div className="space-y-2">
 {upcoming.map((ev, i) => (
 <div key={i} className="rounded-lg border border-border bg-background/50 p-3 space-y-1.5">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-semibold">{ev.event}</span>
 <Badge variant="outline" className="text-[11px] px-1.5 py-0">
 {ev.date}
 </Badge>
 <span className="text-xs text-muted-foreground">
 Consensus: <span className="font-medium text-foreground">{ev.consensus}</span>
 </span>
 <span className="text-xs text-muted-foreground">
 Previous: <span className="font-medium text-foreground">{ev.previous}</span>
 </span>
 </div>
 <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
 {ev.playbook.map((pb) => (
 <div key={pb.asset} className="rounded bg-muted/40 p-1.5">
 <p className="text-[11px] text-muted-foreground">{pb.asset}</p>
 <p className={cn("text-xs font-medium", dirColor(pb.direction))}>
 {pb.avgMove}
 </p>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>
 );
}

// ── Main export ─────────────────────────────────────────────────────────────

export function NewsSentimentAnalyzer() {
 const { heatmap, marketScore, topStories, earningsCalls, socialData, macroEvents, upcomingEvents } =
 useMemo(() => generateData(), []);

 return (
 <div className="space-y-4">
 <MarketSentimentHeatmap heatmap={heatmap} marketScore={marketScore} />
 <TopStoryAnalysis stories={topStories} />
 <EarningsCommentary calls={earningsCalls} />
 <SocialMediaPulse data={socialData} />
 <MacroEventImpact events={macroEvents} upcoming={upcomingEvents} />
 </div>
 );
}
