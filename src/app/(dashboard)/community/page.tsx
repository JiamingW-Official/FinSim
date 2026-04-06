"use client";

import { useState, useEffect, useCallback } from "react";
import {
 Heart, Copy, TrendingUp, TrendingDown, Minus, Users, Star,
 BarChart2, Flame, ChevronUp, ChevronDown, X, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
 return function () {
 seed |= 0;
 seed = (seed + 0x6d2b79f5) | 0;
 let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
 t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

function hashStr(s: string): number {
 let h = 0;
 for (let i = 0; i < s.length; i++) {
 h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
 }
 return Math.abs(h);
}

function seededRng(seed: number) {
 let s = seed === 0 ? 1 : Math.abs(seed);
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommunityTrade {
 id: string;
 trader: string;
 initials: string;
 avatarColor: string;
 ticker: string;
 direction: "long" | "short";
 entry: number;
 target: number;
 likes: number;
 timestamp: number;
 setupName: string;
}

interface AnalystRating {
 ticker: string;
 consensus: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
 analysts: number;
 currentPrice: number;
 priceTarget: number;
 upgrades: number;
 downgrades: number;
}

interface TrendingTopic {
 id: string;
 ticker?: string;
 topic: string;
 mentions: number;
 sentiment: number; // -100 to +100
 change: number; // % mention change
}

interface VolumeAnomaly {
 ticker: string;
 volume: number;
 avgVolume: number;
 ratio: number;
 price: number;
 priceChange: number;
}

interface TopTrader {
 id: string;
 username: string;
 initials: string;
 avatarColor: string;
 returnPct: number;
 winRate: number;
 trades: number;
 strategy: string;
 tradeHistory: { ticker: string; pnl: number; date: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "META", "SPY", "QQQ", "GLD"];

const TICKER_BASE_PRICES: Record<string, number> = {
 AAPL: 185, MSFT: 370, GOOG: 155, AMZN: 178, NVDA: 460,
 TSLA: 190, META: 475, SPY: 490, QQQ: 420, GLD: 185,
};

const AVATAR_COLORS = [
 "bg-primary", "bg-emerald-500", "bg-primary", "bg-amber-500",
 "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
 "bg-teal-500", "bg-indigo-500",
];

const TRADER_NAMES = [
 "QuantKing", "AlphaSeeker", "MomoTrader", "TechBull99", "SwingMaster",
 "ScalpQueen", "ValuHunter", "TrendRider", "VolPlayer", "RiskMgr",
];

const STRATEGIES = [
 "Momentum breakout with tight stops",
 "Swing trading with RSI + MACD confluence",
 "VWAP reclaim + volume confirmation",
 "Earnings-driven catalyst plays",
 "Sector rotation + relative strength",
 "Options flow + unusual activity tracking",
 "Mean reversion on oversold conditions",
 "Trend following with trailing stops",
 "Gap-and-go intraday scalping",
 "Multi-timeframe confluence entries",
];

const SETUP_NAMES = [
 "Bull Confluence", "Momentum Breakout", "Oversold Bounce", "VWAP Reclaim",
 "Golden Cross", "RSI Recovery", "Resistance Rejection", "Overbought Fade",
 "Trend Continuation", "Bull Flag",
];

const TRENDING_TOPICS = [
 { topic: "AAPL earnings beat", ticker: "AAPL", baseMentions: 4200 },
 { topic: "Fed rate decision", ticker: undefined, baseMentions: 8700 },
 { topic: "NVDA AI demand surge", ticker: "NVDA", baseMentions: 6100 },
 { topic: "TSLA delivery miss", ticker: "TSLA", baseMentions: 3800 },
 { topic: "META Reality Labs update", ticker: "META", baseMentions: 2900 },
 { topic: "SPY support level test", ticker: "SPY", baseMentions: 5500 },
 { topic: "MSFT cloud growth", ticker: "MSFT", baseMentions: 3200 },
 { topic: "QQQ breakout attempt", ticker: "QQQ", baseMentions: 2400 },
];

// Date-seeded bucket (changes daily)
const DATE_BUCKET = Math.floor(Date.now() / 86400000);

// ─── Data generators ──────────────────────────────────────────────────────────

function generateCommunityTrades(): CommunityTrade[] {
 const trades: CommunityTrade[] = [];
 const usedNames = new Set<string>();

 for (let i = 0; i < 10; i++) {
 const rng = mulberry32(DATE_BUCKET * 13 + i * 17 + 5);
 const tickerIdx = Math.floor(rng() * ALL_TICKERS.length);
 const ticker = ALL_TICKERS[tickerIdx];
 const base = TICKER_BASE_PRICES[ticker] ?? 100;
 const direction: "long" | "short" = rng() > 0.4 ? "long" : "short";
 const noise = (rng() - 0.5) * 0.06;
 const entry = parseFloat((base * (1 + noise)).toFixed(2));
 const targetPct = 0.03 + rng() * 0.05;
 const target = parseFloat(
 direction === "long"
 ? (entry * (1 + targetPct)).toFixed(2)
 : (entry * (1 - targetPct)).toFixed(2),
 );
 const likes = Math.floor(rng() * 180) + 5;
 const nameIdx = Math.floor(rng() * TRADER_NAMES.length);
 let name = TRADER_NAMES[nameIdx];
 // Avoid duplicate names
 let suffix = 0;
 while (usedNames.has(name)) {
 suffix++;
 name = `${TRADER_NAMES[nameIdx]}${suffix}`;
 }
 usedNames.add(name);
 const initials = name.slice(0, 2).toUpperCase();
 const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
 const setupIdx = Math.floor(rng() * SETUP_NAMES.length);
 const hoursAgo = Math.floor(rng() * 22) + 1;

 trades.push({
 id: `ct-${i}`,
 trader: name,
 initials,
 avatarColor: AVATAR_COLORS[colorIdx],
 ticker,
 direction,
 entry,
 target,
 likes,
 timestamp: Date.now() - hoursAgo * 3600000,
 setupName: SETUP_NAMES[setupIdx],
 });
 }

 return trades;
}

function generateAnalystRatings(): AnalystRating[] {
 return ALL_TICKERS.map((ticker, i) => {
 const rng = seededRng(hashStr(ticker) + DATE_BUCKET * 7);
 const base = TICKER_BASE_PRICES[ticker] ?? 100;
 const ratings: AnalystRating["consensus"][] = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];
 const ratingIdx = Math.floor(rng() * 4); // bias toward Buy
 const consensus = ratings[ratingIdx];
 const analysts = Math.floor(rng() * 25) + 8;
 const noise = (rng() - 0.3) * 0.2; // bias upward
 const currentPrice = parseFloat((base * (1 + (rng() - 0.5) * 0.08)).toFixed(2));
 const priceTarget = parseFloat((currentPrice * (1 + noise)).toFixed(2));
 const upgrades = Math.floor(rng() * 4);
 const downgrades = Math.floor(rng() * 2);

 return { ticker, consensus, analysts, currentPrice, priceTarget, upgrades, downgrades };
 });
}

function generateTrendingTopics(): { topics: TrendingTopic[]; anomalies: VolumeAnomaly[] } {
 const rng = mulberry32(DATE_BUCKET * 997 + 13);

 const topics: TrendingTopic[] = TRENDING_TOPICS.map((t, i) => {
 const r = mulberry32(DATE_BUCKET * 31 + i * 7);
 const mentions = Math.floor(t.baseMentions * (0.8 + r() * 0.4));
 const sentiment = Math.round((r() - 0.4) * 160);
 const change = parseFloat(((r() - 0.4) * 40).toFixed(1));
 return {
 id: `topic-${i}`,
 ticker: t.ticker,
 topic: t.topic,
 mentions,
 sentiment: Math.max(-100, Math.min(100, sentiment)),
 change,
 };
 }).sort((a, b) => b.mentions - a.mentions);

 const anomalyTickers = ALL_TICKERS.slice(0, 6);
 const anomalies: VolumeAnomaly[] = anomalyTickers.map((ticker) => {
 const r = mulberry32(hashStr(ticker) + DATE_BUCKET * 53);
 const base = TICKER_BASE_PRICES[ticker] ?? 100;
 const price = parseFloat((base * (1 + (r() - 0.5) * 0.08)).toFixed(2));
 const priceChange = parseFloat(((r() - 0.4) * 8).toFixed(2));
 const avgVolume = Math.floor(r() * 50_000_000) + 10_000_000;
 const ratio = parseFloat((1.5 + r() * 3.5).toFixed(2));
 const volume = Math.round(avgVolume * ratio);
 return { ticker, volume, avgVolume, ratio, price, priceChange };
 }).sort((a, b) => b.ratio - a.ratio);

 void rng;
 return { topics, anomalies };
}

function generateTopTraders(): TopTrader[] {
 return Array.from({ length: 10 }, (_, i) => {
 const rng = seededRng(i * 999 + DATE_BUCKET * 3);
 const nameIdx = i % TRADER_NAMES.length;
 const username = TRADER_NAMES[nameIdx];
 const initials = username.slice(0, 2).toUpperCase();
 const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
 const returnPct = parseFloat((8 + rng() * 42).toFixed(1));
 const winRate = parseFloat((45 + rng() * 40).toFixed(1));
 const trades = Math.floor(rng() * 120) + 20;
 const stratIdx = Math.floor(rng() * STRATEGIES.length);

 const tradeHistory = Array.from({ length: 6 }, (_, j) => {
 const tr = seededRng(i * 137 + j * 41 + DATE_BUCKET);
 const tickerIdx = Math.floor(tr() * ALL_TICKERS.length);
 const pnl = parseFloat(((tr() - 0.35) * 20).toFixed(1));
 const daysAgo = j * 3 + Math.floor(tr() * 2);
 const d = new Date(Date.now() - daysAgo * 86400000);
 const date = `${d.getMonth() + 1}/${d.getDate()}`;
 return { ticker: ALL_TICKERS[tickerIdx], pnl, date };
 });

 return {
 id: `trader-${i}`,
 username,
 initials,
 avatarColor: AVATAR_COLORS[colorIdx],
 returnPct,
 winRate,
 trades,
 strategy: STRATEGIES[stratIdx],
 tradeHistory,
 };
 }).sort((a, b) => b.returnPct - a.returnPct);
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getLikedTrades(): Set<string> {
 if (typeof window === "undefined") return new Set();
 try {
 const raw = localStorage.getItem("community_liked_trades");
 return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
 } catch {
 return new Set();
 }
}

function saveLikedTrades(liked: Set<string>) {
 if (typeof window === "undefined") return;
 try {
 localStorage.setItem("community_liked_trades", JSON.stringify([...liked]));
 } catch { /* noop */ }
}

function getFollowedTraders(): Set<string> {
 if (typeof window === "undefined") return new Set();
 try {
 const raw = localStorage.getItem("community_followed_traders");
 return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
 } catch {
 return new Set();
 }
}

function saveFollowedTraders(followed: Set<string>) {
 if (typeof window === "undefined") return;
 try {
 localStorage.setItem("community_followed_traders", JSON.stringify([...followed]));
 } catch { /* noop */ }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
 initials,
 colorClass,
 size = "md",
}: {
 initials: string;
 colorClass: string;
 size?: "sm" | "md" | "lg";
}) {
 const sizeClass = size === "lg" ? "h-10 w-10 text-sm" : size === "sm" ? "h-6 w-6 text-[11px]" : "h-8 w-8 text-xs text-muted-foreground";
 return (
 <div
 className={cn(
 "shrink-0 flex items-center justify-center rounded-full font-semibold text-foreground",
 colorClass,
 sizeClass,
 )}
 >
 {initials}
 </div>
 );
}

function DirectionBadge({ direction }: { direction: "long" | "short" }) {
 if (direction === "long")
 return (
 <span className="inline-flex items-center gap-0.5 rounded border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400 leading-none ">
 Long
 </span>
 );
 return (
 <span className="inline-flex items-center gap-0.5 rounded border border-red-500/40 bg-red-500/15 px-1.5 py-0.5 text-[11px] font-medium text-red-400 leading-none ">
 Short
 </span>
 );
}

function ConsensusBadge({ consensus }: { consensus: AnalystRating["consensus"] }) {
 const styles: Record<AnalystRating["consensus"], string> = {
 "Strong Buy": "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
 "Buy": "border-green-500/40 bg-green-500/15 text-green-400",
 "Hold": "border-amber-500/40 bg-amber-500/15 text-amber-400",
 "Sell": "border-red-500/40 bg-red-500/15 text-red-400",
 "Strong Sell": "border-rose-500/40 bg-rose-500/15 text-rose-400",
 };
 return (
 <span className={cn("rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none", styles[consensus])}>
 {consensus}
 </span>
 );
}

function SentimentBar({ score }: { score: number }) {
 const normalized = (score + 100) / 2; // 0–100
 const color = score > 20 ? "bg-emerald-500" : score < -20 ? "bg-red-500" : "bg-amber-500";
 return (
 <div className="flex items-center gap-1.5">
 <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
 <div
 className={cn("h-full rounded-full transition-colors", color)}
 style={{ width: `${normalized}%` }}
 />
 </div>
 <span className={cn("text-[11px] font-medium w-6 text-right", score > 20 ? "text-emerald-400" : score < -20 ? "text-red-400" : "text-amber-400")}>
 {score > 0 ? "+" : ""}{score}
 </span>
 </div>
 );
}

// ─── Tab 1: Trade Ideas ────────────────────────────────────────────────────────

type TradeFilter = "all" | "liked" | "recent" | "following";

function TradeIdeasTab() {
 const [trades] = useState<CommunityTrade[]>(() => generateCommunityTrades());
 const [likedTrades, setLikedTrades] = useState<Set<string>>(new Set());
 const [followedTraders, setFollowedTraders] = useState<Set<string>>(new Set());
 const [filter, setFilter] = useState<TradeFilter>("all");
 const [copiedId, setCopiedId] = useState<string | null>(null);

 useEffect(() => {
 setLikedTrades(getLikedTrades());
 setFollowedTraders(getFollowedTraders());
 }, []);

 const toggleLike = useCallback((id: string) => {
 setLikedTrades((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 saveLikedTrades(next);
 return next;
 });
 }, []);

 const handleCopyTrade = useCallback((trade: CommunityTrade) => {
 setCopiedId(trade.id);
 setTimeout(() => setCopiedId(null), 2000);
 }, []);

 const tradesWithLikes = trades.map((t) => ({
 ...t,
 likes: likedTrades.has(t.id) ? t.likes + 1 : t.likes,
 }));

 const filtered = tradesWithLikes.filter((t) => {
 if (filter === "liked") return likedTrades.has(t.id);
 if (filter === "following") return followedTraders.has(t.trader);
 return true;
 });

 const sorted = [...filtered].sort((a, b) => {
 if (filter === "liked") return b.likes - a.likes;
 if (filter === "recent") return b.timestamp - a.timestamp;
 return b.likes - a.likes;
 });

 const filterOptions: { value: TradeFilter; label: string }[] = [
 { value: "all", label: "All" },
 { value: "liked", label: "Most Liked" },
 { value: "recent", label: "Recent" },
 { value: "following", label: "Following" },
 ];

 return (
 <div className="space-y-3">
 {/* Filter chips */}
 <div className="flex gap-1 flex-wrap">
 {filterOptions.map((f) => (
 <button
 key={f.value}
 type="button"
 onClick={() => setFilter(f.value)}
 className={cn(
 "rounded border px-2 py-1 text-xs text-muted-foreground font-medium leading-none transition-colors",
 filter === f.value
 ? "bg-muted/10 border-primary/30 text-foreground"
 : "border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/30",
 )}
 >
 {f.label}
 </button>
 ))}
 </div>

 {/* Cards */}
 <div className="space-y-2">
 
 {sorted.map((trade, i) => {
 const ageMs = Date.now() - trade.timestamp;
 const ageH = Math.floor(ageMs / 3600000);
 const ageLabel = ageH < 1 ? "< 1h ago" : `${ageH}h ago`;
 const isLiked = likedTrades.has(trade.id);
 const isCopied = copiedId === trade.id;
 const upside = ((trade.target - trade.entry) / trade.entry * 100);
 const upsideAbs = Math.abs(upside);

 return (
 <div
 key={trade.id}
 className={cn(
 "rounded-lg border p-3 space-y-2",
 trade.direction === "long"
 ? "border-emerald-500/20 bg-emerald-500/5"
 : "border-red-500/20 bg-red-500/5",
 )}
 >
 {/* Header row */}
 <div className="flex items-center gap-2">
 <Avatar initials={trade.initials} colorClass={trade.avatarColor} size="sm" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="text-xs font-semibold text-foreground truncate">{trade.trader}</span>
 <DirectionBadge direction={trade.direction} />
 <span className="text-xs font-medium text-foreground">{trade.ticker}</span>
 </div>
 <div className="text-[11px] text-muted-foreground/50">{trade.setupName} · {ageLabel}</div>
 </div>
 </div>

 {/* Price row */}
 <div className="grid grid-cols-3 gap-2 text-[11px]">
 <div>
 <div className="text-muted-foreground/50 text-[7px] font-medium mb-0.5">Entry</div>
 <div className="font-mono font-medium text-foreground">${trade.entry.toFixed(2)}</div>
 </div>
 <div>
 <div className="text-muted-foreground/50 text-[7px] font-medium mb-0.5">Target</div>
 <div className={cn("font-mono font-medium", trade.direction === "long" ? "text-emerald-400" : "text-red-400")}>
 ${trade.target.toFixed(2)}
 </div>
 </div>
 <div>
 <div className="text-muted-foreground/50 text-[7px] font-medium mb-0.5">Upside</div>
 <div className={cn("font-mono font-medium", upsideAbs >= 4 ? "text-emerald-400" : "text-amber-400")}>
 {upside > 0 ? "+" : ""}{upside.toFixed(1)}%
 </div>
 </div>
 </div>

 {/* Action row */}
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => toggleLike(trade.id)}
 className={cn(
 "flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium leading-none transition-colors",
 isLiked
 ? "border-rose-500/40 bg-rose-500/15 text-rose-400"
 : "border-border bg-muted text-muted-foreground hover:text-rose-400 hover:border-rose-500/30",
 )}
 >
 <Heart className={cn("h-2.5 w-2.5", isLiked && "fill-current")} />
 {trade.likes}
 </button>
 <button
 type="button"
 onClick={() => handleCopyTrade(trade)}
 className={cn(
 "flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium leading-none transition-colors",
 isCopied
 ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
 : "border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/30",
 )}
 >
 {isCopied ? "Copied!" : "Copy Trade"}
 </button>
 <button
 type="button"
 onClick={() => {
 setFollowedTraders((prev) => {
 const next = new Set(prev);
 if (next.has(trade.trader)) next.delete(trade.trader);
 else next.add(trade.trader);
 saveFollowedTraders(next);
 return next;
 });
 }}
 className={cn(
 "ml-auto flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium leading-none transition-colors",
 followedTraders.has(trade.trader)
 ? "border-primary/40 bg-muted/10 text-foreground"
 : "border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/30",
 )}
 >
 {followedTraders.has(trade.trader) ? "Following" : "Follow"}
 </button>
 </div>
 </div>
 );
 })}
 

 {sorted.length === 0 && (
 <p className="text-sm text-muted-foreground text-center py-8">
 {filter === "following" ? "Follow some traders to see their ideas here." : "No trades found."}
 </p>
 )}
 </div>
 </div>
 );
}

// ─── Tab 2: Analyst Ratings ────────────────────────────────────────────────────

function AnalystRatingsTab() {
 const [ratings] = useState<AnalystRating[]>(() => generateAnalystRatings());

 return (
 <div className="space-y-2">
 <p className="text-xs text-muted-foreground/60">
 Consensus ratings aggregated from synthetic sell-side analyst coverage. Updated daily.
 </p>

 {ratings.map((r, i) => {
 const upside = ((r.priceTarget - r.currentPrice) / r.currentPrice) * 100;
 const isUp = upside >= 0;

 return (
 <div
 key={r.ticker}
 className="rounded-lg border border-border bg-card p-3 space-y-2"
 >
 {/* Row 1 */}
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-sm font-medium text-foreground w-12 shrink-0">{r.ticker}</span>
 <ConsensusBadge consensus={r.consensus} />
 <span className="text-[11px] text-muted-foreground/60">{r.analysts} analysts</span>
 <div className={cn(
 "ml-auto flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[11px] font-medium",
 isUp ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-red-500/40 bg-red-500/5 text-red-400",
 )}>
 {isUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
 {isUp ? "+" : ""}{upside.toFixed(1)}%
 </div>
 </div>

 {/* Row 2: prices */}
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <div>
 <span className="text-muted-foreground/50 mr-1">Current</span>
 <span className="font-mono font-medium text-foreground">${r.currentPrice.toFixed(2)}</span>
 </div>
 <div>
 <span className="text-muted-foreground/50 mr-1">Target</span>
 <span className={cn("font-mono font-medium", isUp ? "text-emerald-400" : "text-red-400")}>${r.priceTarget.toFixed(2)}</span>
 </div>
 </div>

 {/* Row 3: rating changes this week */}
 {(r.upgrades > 0 || r.downgrades > 0) && (
 <div className="flex items-center gap-2 text-[11px]">
 {r.upgrades > 0 && (
 <span className="flex items-center gap-0.5 text-emerald-400">
 {r.upgrades} upgrade{r.upgrades > 1 ? "s" : ""} this week
 </span>
 )}
 {r.downgrades > 0 && (
 <span className="flex items-center gap-0.5 text-red-400">
 {r.downgrades} downgrade{r.downgrades > 1 ? "s" : ""} this week
 </span>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 );
}

// ─── Tab 3: Trending ──────────────────────────────────────────────────────────

function TrendingTab() {
 const [{ topics, anomalies }] = useState(() => generateTrendingTopics());

 function formatVolume(v: number): string {
 if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
 if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
 return String(v);
 }

 return (
 <div className="space-y-5">
 {/* Trending topics */}
 <section className="space-y-2">
 <div className="flex items-center gap-1.5 mb-1">
 <h3 className="text-xs font-medium text-foreground">Trending Topics</h3>
 </div>
 {topics.map((t, i) => (
 <div
 key={t.id}
 className="rounded-lg border border-border bg-card p-3 space-y-1.5"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5 flex-wrap">
 {t.ticker && (
 <span className="text-[11px] font-medium text-foreground bg-muted/10 rounded px-1 py-0.5">{t.ticker}</span>
 )}
 <span className="text-xs font-medium text-foreground">{t.topic}</span>
 </div>
 <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/60">
 <span>{t.mentions.toLocaleString()} mentions</span>
 <span className={cn(t.change > 0 ? "text-emerald-400" : "text-red-400")}>
 {t.change > 0 ? "+" : ""}{t.change}% vs yesterday
 </span>
 </div>
 </div>
 <div className="shrink-0 text-[11px] font-medium text-muted-foreground/40">
 #{i + 1}
 </div>
 </div>
 <SentimentBar score={t.sentiment} />
 </div>
 ))}
 </section>

 {/* Volume anomalies */}
 <section className="space-y-2">
 <div className="flex items-center gap-1.5 mb-1">
 <h3 className="text-xs font-medium text-foreground">Volume Anomalies</h3>
 <span className="text-[11px] text-muted-foreground/50">vs 30-day avg</span>
 </div>
 {anomalies.map((a, i) => (
 <div
 key={a.ticker}
 className="rounded-lg border border-border bg-card p-2.5"
 >
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-foreground w-10 shrink-0">{a.ticker}</span>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between text-[11px] mb-1">
 <span className="text-muted-foreground/60">{formatVolume(a.volume)} / {formatVolume(a.avgVolume)} avg</span>
 <span className={cn(
 "font-medium rounded px-1 py-0.5",
 a.ratio >= 3 ? "text-rose-400 bg-rose-500/10" : a.ratio >= 2 ? "text-amber-400 bg-amber-500/10" : "text-foreground bg-muted/10",
 )}>
 {a.ratio.toFixed(1)}x
 </span>
 </div>
 <div className="h-1.5 rounded-full bg-muted overflow-hidden">
 <div
 className={cn(
 "h-full rounded-full transition-colors",
 a.ratio >= 3 ? "bg-rose-500" : a.ratio >= 2 ? "bg-amber-500" : "bg-primary",
 )}
 style={{ width: `${Math.min((a.ratio / 5) * 100, 100)}%` }}
 />
 </div>
 </div>
 <div className={cn(
 "shrink-0 text-xs text-muted-foreground font-medium font-mono",
 a.priceChange >= 0 ? "text-emerald-400" : "text-red-400",
 )}>
 {a.priceChange >= 0 ? "+" : ""}{a.priceChange.toFixed(1)}%
 </div>
 </div>
 </div>
 ))}
 </section>
 </div>
 );
}

// ─── Tab 4: Top Traders ───────────────────────────────────────────────────────

function TopTradersTab() {
 const [traders] = useState<TopTrader[]>(() => generateTopTraders());
 const [followedTraders, setFollowedTraders] = useState<Set<string>>(new Set());
 const [profileTrader, setProfileTrader] = useState<TopTrader | null>(null);

 useEffect(() => {
 setFollowedTraders(getFollowedTraders());
 }, []);

 const toggleFollow = useCallback((id: string) => {
 setFollowedTraders((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 saveFollowedTraders(next);
 return next;
 });
 }, []);

 return (
 <div className="space-y-2">
 {traders.map((trader, i) => (
 <div
 key={trader.id}
 className="rounded-lg border border-border bg-card p-3 space-y-2"
 >
 {/* Header */}
 <div className="flex items-center gap-2">
 <div className="relative shrink-0">
 <Avatar initials={trader.initials} colorClass={trader.avatarColor} />
 {i < 3 && (
 <span className={cn(
 "absolute -top-1 -right-1 text-[11px] leading-none",
 i === 0 ? "text-yellow-400" : i === 1 ? "text-muted-foreground" : "text-amber-600",
 )}>
 {i === 0 ? "★" : i === 1 ? "✦" : "◆"}
 </span>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-medium text-foreground">{trader.username}</span>
 <span className="text-[11px] text-muted-foreground/40">#{i + 1}</span>
 </div>
 <div className="text-[11px] text-muted-foreground/60 truncate">{trader.strategy}</div>
 </div>
 <div className={cn(
 "shrink-0 text-sm font-medium font-mono",
 trader.returnPct >= 0 ? "text-emerald-400" : "text-red-400",
 )}>
 +{trader.returnPct.toFixed(1)}%
 </div>
 </div>

 {/* Stats row */}
 <div className="grid grid-cols-3 gap-2 text-[11px]">
 <div>
 <div className="text-muted-foreground/50 text-[7px] font-medium mb-0.5">Win Rate</div>
 <div className={cn("font-medium", trader.winRate >= 60 ? "text-emerald-400" : trader.winRate >= 45 ? "text-amber-400" : "text-red-400")}>
 {trader.winRate.toFixed(1)}%
 </div>
 </div>
 <div>
 <div className="text-muted-foreground/50 text-[7px] font-medium mb-0.5">Trades</div>
 <div className="font-medium text-foreground">{trader.trades}</div>
 </div>
 <div>
 <div className="text-muted-foreground/50 text-[7px] font-medium mb-0.5">This Month</div>
 <div className="font-medium text-emerald-400">+{trader.returnPct.toFixed(1)}%</div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => setProfileTrader(trader)}
 className="flex items-center gap-1 rounded border border-border bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground leading-none hover:text-foreground hover:bg-muted/30 transition-colors"
 >
 View Profile
 </button>
 <button
 type="button"
 onClick={() => toggleFollow(trader.id)}
 className={cn(
 "flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium leading-none transition-colors ml-auto",
 followedTraders.has(trader.id)
 ? "border-primary/40 bg-muted/10 text-foreground"
 : "border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/30",
 )}
 >
 {followedTraders.has(trader.id) ? "Following" : "Follow"}
 </button>
 </div>
 </div>
 ))}

 {/* Profile Modal */}
 
 {profileTrader && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
 onClick={() => setProfileTrader(null)}
 >
 <div
 className="w-full max-w-sm rounded-md border border-border bg-card p-4 space-y-4"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Modal header */}
 <div className="flex items-center gap-3">
 <Avatar initials={profileTrader.initials} colorClass={profileTrader.avatarColor} size="lg" />
 <div className="flex-1">
 <div className="text-sm font-medium text-foreground">{profileTrader.username}</div>
 <div className="text-xs text-muted-foreground/60 truncate">{profileTrader.strategy}</div>
 </div>
 <button
 type="button"
 onClick={() => setProfileTrader(null)}
 className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
 >
 <X className="h-4 w-4" />
 </button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-3 gap-2">
 {[
 { label: "Return", value: `+${profileTrader.returnPct.toFixed(1)}%`, color: "text-emerald-400" },
 { label: "Win Rate", value: `${profileTrader.winRate.toFixed(1)}%`, color: "text-amber-400" },
 { label: "Trades", value: String(profileTrader.trades), color: "text-foreground" },
 ].map((s) => (
 <div key={s.label} className="rounded-lg bg-muted/50 p-2 text-center">
 <div className="text-[11px] text-muted-foreground/50 mb-1">{s.label}</div>
 <div className={cn("text-sm font-medium", s.color)}>{s.value}</div>
 </div>
 ))}
 </div>

 {/* Recent trades */}
 <div>
 <div className="text-xs font-medium text-muted-foreground/60 mb-2">Recent Trades</div>
 <div className="space-y-1">
 {profileTrader.tradeHistory.map((t, idx) => (
 <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground py-1 border-b border-border last:border-0">
 <span className="font-medium text-foreground">{t.ticker}</span>
 <span className="text-muted-foreground/50">{t.date}</span>
 <span className={cn("font-mono font-medium", t.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
 {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(1)}%
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CommunityPage() {
 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Header */}
 <div className="mb-6">
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Community</h1>
 <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">LEADERBOARD · DISCUSSION · INSIGHTS</p>
 </div>

 {/* Tabs */}
 <div className="flex-1 min-h-0">
 <Tabs defaultValue="ideas" className="flex flex-col h-full">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto shrink-0 mb-0 w-auto">
 <TabsTrigger value="ideas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Trade Ideas
 </TabsTrigger>
 <TabsTrigger value="analysts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Analyst Ratings
 </TabsTrigger>
 <TabsTrigger value="trending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Trending
 </TabsTrigger>
 <TabsTrigger value="traders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Top Traders
 </TabsTrigger>
 </TabsList>

 <TabsContent value="ideas" className="mt-4 data-[state=inactive]:hidden">
 <TradeIdeasTab />
 </TabsContent>
 <TabsContent value="analysts" className="mt-4 data-[state=inactive]:hidden">
 <AnalystRatingsTab />
 </TabsContent>
 <TabsContent value="trending" className="mt-4 data-[state=inactive]:hidden">
 <TrendingTab />
 </TabsContent>
 <TabsContent value="traders" className="mt-4 data-[state=inactive]:hidden">
 <TopTradersTab />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 </div>
 );
}
