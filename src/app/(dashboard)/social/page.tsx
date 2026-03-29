"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, TrendingUp, TrendingDown, Flame, Heart, MessageSquare,
  Users, Star, Medal, Crown, ChevronUp, ChevronDown, X, Plus,
  Copy, BarChart2, Shield, Zap, Target, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Settings2, RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SocialTradingHub from "@/components/social/SocialTradingHub";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "return" | "sharpe" | "winRate" | "elo";
type TimePeriod = "daily" | "weekly" | "monthly" | "allTime";
type AssetFilter = "all" | "stocks" | "options" | "crypto" | "multi";
type IdeaDirection = "long" | "short";
type IdeaFilter = "all" | "long" | "short" | "highConviction";
type MarketRegimeVote = "bull" | "bear" | "sideways";

interface Trader {
  id: string;
  rank: number;
  username: string;
  initials: string;
  avatarColor: string;
  returnPct: number;
  sharpe: number;
  winRate: number;
  totalTrades: number;
  followers: number;
  elo: number;
  assetClass: AssetFilter;
  isYou?: boolean;
}

interface TradeIdea {
  id: string;
  trader: { username: string; initials: string; avatarColor: string };
  ticker: string;
  direction: IdeaDirection;
  entry: number;
  target: number;
  stop: number;
  rationale: string;
  likes: number;
  comments: number;
  hoursAgo: number;
  conviction: "high" | "medium" | "low";
  thesis?: string;
  closed?: boolean;
  closedPnlPct?: number;
}

interface CopyTrader {
  id: string;
  username: string;
  initials: string;
  avatarColor: string;
  returnPct: number;
  winRate: number;
  speciality: string;
  recentTrades: { ticker: string; direction: string; returnPct: number }[];
  similarity: number;
}

interface TickerSentiment {
  ticker: string;
  longPct: number;
  shortPct: number;
  totalVotes: number;
  price: number;
  change: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  prize: string;
  endsIn: string;
  participants: number;
  category: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "META", "SPY", "QQQ", "GLD"];
const TICKER_PRICES: Record<string, number> = {
  AAPL: 185, MSFT: 370, GOOG: 155, AMZN: 178, NVDA: 460,
  TSLA: 190, META: 475, SPY: 490, QQQ: 420, GLD: 185,
};

const AVATAR_COLORS = [
  "bg-primary", "bg-emerald-500", "bg-primary", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
  "bg-teal-500", "bg-indigo-500", "bg-lime-500", "bg-fuchsia-500",
  "bg-sky-500", "bg-red-500", "bg-green-500", "bg-primary",
  "bg-yellow-500", "bg-muted-foreground", "bg-muted-foreground", "bg-muted-foreground",
];

const USERNAMES = [
  "AlphaTrader_X", "QuantKing99", "MomoRider", "TechBull88", "SwingMaster",
  "ScalpQueen", "ValuHunter", "TrendRider", "VolPlayer", "RiskMgr2k",
  "FlowWatcher", "OptionsGuru", "CryptoNinja", "MacroMind", "PatternPro",
  "GapNGo", "DeltaForce", "SigmaTrader", "BetaBreaker", "AlgoBot7",
];

const SPECIALITIES = [
  "Momentum breakout", "Swing trading RSI+MACD", "VWAP reclaim",
  "Earnings plays", "Options flow", "Sector rotation",
  "Mean reversion", "Trend following", "Gap-and-go",
];

const RATIONALES = [
  "RSI recovering from oversold with MACD bullish crossover. Volume confirming the move. Strong support at this level.",
  "Breaking out of 6-week consolidation with above-average volume. Target aligns with previous resistance turned support.",
  "Earnings beat catalyst with positive guidance revision. Market underpricing the beat. Multiple analyst upgrades expected.",
  "Technical setup: bull flag on daily chart with strong relative strength vs sector. Options flow shows unusual call activity.",
  "VWAP reclaim after morning gap-down. Volume fading on the sell-off — buyers stepping in at key support.",
  "Cup-and-handle breakout on weekly chart. Fundamental catalyst: new product cycle + margin expansion story intact.",
  "Short setup: stock up 40% in 3 weeks with no fundamental change. Insider selling detected. RSI extremely overbought.",
  "Sector rotation play: money moving from tech into energy. This ticker leads its sub-sector with strong momentum.",
];

const THESES = [
  "The setup here is textbook momentum continuation. We had a strong earnings catalyst two weeks ago, and price has been consolidating tightly for 12 trading days — this is classic 'digestion' behavior before the next leg up. Volume on consolidation days is below average, which confirms distribution is minimal. The breakout level ($X) coincides perfectly with the 21-day EMA acting as dynamic support. My target is the measured move from the consolidation range projected upward, with a stop just below the 50-day MA.",
  "This is a mean-reversion trade with a catalyst. The stock dropped 18% on an earnings miss that I believe was a kitchen-sink quarter — management cleared the decks. Forward guidance was actually better than feared, and the market overreacted. RSI hit 22 (deeply oversold), and we're seeing buying interest at the 200-day MA — a historically significant support zone for this name. Risk/reward is compelling at 3:1.",
  "Pure technical setup: three consecutive failed breakout attempts above $X, each with diminishing volume. This is a distribution pattern. Short squeeze ratio is only 2 days — so a squeeze isn't a major risk. Target is the next major support at $Y, with stop above the most recent high.",
];

const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Best Options Trade",
    description: "Most profitable options trade this week. Must post full trade plan before entry.",
    prize: "500 XP + Gold Badge",
    endsIn: "3 days",
    participants: 142,
    category: "Options",
  },
  {
    id: "c2",
    title: "Trend Follower of the Month",
    description: "Highest cumulative return using only trend-following strategies over 30 days.",
    prize: "2,000 XP + Leaderboard Feature",
    endsIn: "18 days",
    participants: 389,
    category: "Strategy",
  },
  {
    id: "c3",
    title: "Best Sharpe Ratio",
    description: "Maintain the highest risk-adjusted return over 2 weeks. Min 10 trades.",
    prize: "1,000 XP + AlphaBot Crown",
    endsIn: "9 days",
    participants: 217,
    category: "Risk Mgmt",
  },
  {
    id: "c4",
    title: "Crypto Sprint",
    description: "Best % return trading crypto assets only. All positions must be posted.",
    prize: "750 XP + Crypto Badge",
    endsIn: "5 days",
    participants: 96,
    category: "Crypto",
  },
];

// ─── Data Generators ──────────────────────────────────────────────────────────

const SEED = 5555;

function generateLeaderboard(): Trader[] {
  const rng = mulberry32(SEED);
  const assetClasses: AssetFilter[] = ["stocks", "options", "crypto", "multi", "all"];
  const traders: Trader[] = [];

  for (let i = 0; i < 20; i++) {
    const idx = Math.floor(rng() * USERNAMES.length);
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const username = USERNAMES[i] ?? `Trader${i}`;
    const initials = username.slice(0, 2).toUpperCase();
    const returnPct = (rng() * 120 - 10); // -10% to +110%
    const sharpe = 0.4 + rng() * 2.8;
    const winRate = 35 + rng() * 40;
    const totalTrades = Math.floor(20 + rng() * 180);
    const followers = Math.floor(rng() * 2000);
    const elo = Math.floor(1000 + rng() * 1000);
    const assetClass = assetClasses[Math.floor(rng() * (assetClasses.length - 1))] ?? "stocks";

    traders.push({
      id: `t${i}`,
      rank: i + 1,
      username,
      initials,
      avatarColor: AVATAR_COLORS[colorIdx] ?? "bg-primary",
      returnPct: Math.round(returnPct * 10) / 10,
      sharpe: Math.round(sharpe * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
      totalTrades,
      followers,
      elo,
      assetClass,
    });
    void idx; // suppress unused var
  }

  // Mark "you" as rank 7
  if (traders[6]) traders[6].isYou = true;

  return traders;
}

function generateTradeIdeas(): TradeIdea[] {
  const rng = mulberry32(SEED + 100);
  const ideas: TradeIdea[] = [];

  for (let i = 0; i < 15; i++) {
    const traderIdx = Math.floor(rng() * USERNAMES.length);
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const username = USERNAMES[traderIdx] ?? `Trader${i}`;
    const tickerIdx = Math.floor(rng() * ALL_TICKERS.length);
    const ticker = ALL_TICKERS[tickerIdx] ?? "AAPL";
    const basePrice = TICKER_PRICES[ticker] ?? 100;
    const direction: IdeaDirection = rng() > 0.45 ? "long" : "short";
    const entryOffset = (rng() - 0.5) * 0.04;
    const entry = Math.round(basePrice * (1 + entryOffset) * 100) / 100;
    const targetMult = direction === "long" ? 1 + 0.05 + rng() * 0.15 : 1 - 0.05 - rng() * 0.15;
    const stopMult = direction === "long" ? 1 - 0.02 - rng() * 0.05 : 1 + 0.02 + rng() * 0.05;
    const target = Math.round(entry * targetMult * 100) / 100;
    const stop = Math.round(entry * stopMult * 100) / 100;
    const rationaleIdx = Math.floor(rng() * RATIONALES.length);
    const convictionRoll = rng();
    const conviction = convictionRoll > 0.65 ? "high" : convictionRoll > 0.35 ? "medium" : "low";
    const closed = rng() > 0.75;
    const closedPnlPct = closed
      ? (direction === "long" ? 1 : -1) * (rng() * 12 - 2)
      : undefined;
    const thesisIdx = Math.floor(rng() * THESES.length);

    ideas.push({
      id: `idea${i}`,
      trader: {
        username,
        initials: username.slice(0, 2).toUpperCase(),
        avatarColor: AVATAR_COLORS[colorIdx] ?? "bg-primary",
      },
      ticker,
      direction,
      entry,
      target,
      stop,
      rationale: RATIONALES[rationaleIdx] ?? "",
      likes: Math.floor(rng() * 120),
      comments: Math.floor(rng() * 30),
      hoursAgo: Math.floor(1 + rng() * 47),
      conviction,
      thesis: THESES[thesisIdx]?.replace("$X", String(entry)).replace("$Y", String(stop)),
      closed,
      closedPnlPct: closedPnlPct !== undefined ? Math.round(closedPnlPct * 10) / 10 : undefined,
    });
  }

  return ideas.sort((a, b) => b.likes - a.likes);
}

function generateCopyTraders(): CopyTrader[] {
  const rng = mulberry32(SEED + 200);
  const traders: CopyTrader[] = [];

  for (let i = 0; i < 8; i++) {
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const username = USERNAMES[i + 3] ?? `Trader${i}`;
    const specialityIdx = Math.floor(rng() * SPECIALITIES.length);

    const recentTrades = Array.from({ length: 5 }, (_, j) => {
      const tickerIdx = Math.floor(rng() * ALL_TICKERS.length);
      const dir = rng() > 0.4 ? "Long" : "Short";
      const ret = (rng() * 20 - 4) * (dir === "Long" ? 1 : -1);
      return {
        ticker: ALL_TICKERS[tickerIdx] ?? "AAPL",
        direction: dir,
        returnPct: Math.round(ret * 10) / 10,
        key: j,
      };
    });

    traders.push({
      id: `ct${i}`,
      username,
      initials: username.slice(0, 2).toUpperCase(),
      avatarColor: AVATAR_COLORS[colorIdx] ?? "bg-primary",
      returnPct: Math.round((20 + rng() * 80) * 10) / 10,
      winRate: Math.round((45 + rng() * 30) * 10) / 10,
      speciality: SPECIALITIES[specialityIdx] ?? "Momentum",
      recentTrades,
      similarity: Math.floor(30 + rng() * 55),
    });
  }

  return traders;
}

function generateTickerSentiment(): TickerSentiment[] {
  const rng = mulberry32(SEED + 300);
  return ALL_TICKERS.map((ticker) => {
    const longPct = Math.round(20 + rng() * 70);
    const price = TICKER_PRICES[ticker] ?? 100;
    const change = Math.round((rng() * 6 - 3) * 100) / 100;
    return {
      ticker,
      longPct,
      shortPct: 100 - longPct,
      totalVotes: Math.floor(100 + rng() * 900),
      price,
      change,
    };
  });
}

// ─── Static data (computed once) ─────────────────────────────────────────────

const LEADERBOARD_DATA = generateLeaderboard();
const TRADE_IDEAS_DATA = generateTradeIdeas();
const COPY_TRADERS_DATA = generateCopyTraders();
const TICKER_SENTIMENT_DATA = generateTickerSentiment();

const REGIME_VOTES = { bull: 318, bear: 142, sideways: 227 };

// ─── Helper components ────────────────────────────────────────────────────────

function Avatar({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  return (
    <div className={cn("shrink-0 rounded-full flex items-center justify-center font-bold text-foreground", color, sizeClass)}>
      {initials}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
  return <span className="text-xs font-mono text-muted-foreground/60 w-4 text-center">{rank}</span>;
}

function ReturnBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const pos = value >= 0;
  return (
    <span className={cn("text-sm font-semibold tabular-nums", pos ? "text-emerald-400" : "text-rose-400")}>
      {pos ? "+" : ""}{value}{suffix}
    </span>
  );
}

function ConvictionDot({ conviction }: { conviction: "high" | "medium" | "low" }) {
  return (
    <span className={cn(
      "inline-block h-2 w-2 rounded-full",
      conviction === "high" ? "bg-emerald-400" : conviction === "medium" ? "bg-amber-400" : "bg-rose-400",
    )} />
  );
}

// ─── Tab 1: Leaderboard ───────────────────────────────────────────────────────

function PodiumCard({ trader, place }: { trader: Trader; place: 1 | 2 | 3 }) {
  const heights = { 1: "h-24", 2: "h-16", 3: "h-12" };
  const labels = { 1: "1st", 2: "2nd", 3: "3rd" };
  const colors = {
    1: "border-yellow-400/60 bg-yellow-400/10",
    2: "border-muted-foreground/60 bg-muted-foreground/10",
    3: "border-amber-600/60 bg-amber-600/10",
  };
  const crownColors = { 1: "text-yellow-400", 2: "text-muted-foreground", 3: "text-amber-600" };

  return (
    <div className={cn("flex flex-col items-center gap-2", place === 1 ? "order-2" : place === 2 ? "order-1" : "order-3")}>
      {place === 1 && <Crown className={cn("h-5 w-5", crownColors[place])} />}
      <Avatar initials={trader.initials} color={trader.avatarColor} size="lg" />
      <div className="text-center">
        <p className="text-xs font-semibold">{trader.username}</p>
        <ReturnBadge value={trader.returnPct} />
      </div>
      <div className={cn("w-full rounded-t-md border-t border-x flex items-end justify-center pb-1 min-w-[72px]", heights[place], colors[place])}>
        <span className="text-xs font-bold text-muted-foreground">{labels[place]}</span>
      </div>
    </div>
  );
}

function LeaderboardTab() {
  const [sort, setSort] = useState<SortField>("return");
  const [period, setPeriod] = useState<TimePeriod>("weekly");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");

  const sorted = useMemo(() => {
    const filtered = assetFilter === "all"
      ? LEADERBOARD_DATA
      : LEADERBOARD_DATA.filter((t) => t.assetClass === assetFilter || t.assetClass === "all");
    return [...filtered].sort((a, b) => {
      if (sort === "return") return b.returnPct - a.returnPct;
      if (sort === "sharpe") return b.sharpe - a.sharpe;
      if (sort === "winRate") return b.winRate - a.winRate;
      return b.elo - a.elo;
    }).map((t, i) => ({ ...t, rank: i + 1 }));
  }, [sort, assetFilter]);

  const top3 = sorted.slice(0, 3);
  const youRow = sorted.find((t) => t.isYou);

  const sortBtn = (field: SortField, label: string) => (
    <button
      onClick={() => setSort(field)}
      className={cn(
        "px-2.5 py-1 rounded text-xs font-medium transition-colors",
        sort === field ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {(["daily", "weekly", "monthly", "allTime"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium capitalize transition-colors",
                period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p === "allTime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {sortBtn("return", "Return")}
          {sortBtn("sharpe", "Sharpe")}
          {sortBtn("winRate", "Win Rate")}
          {sortBtn("elo", "ELO")}
        </div>
      </div>

      {/* Asset filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "stocks", "options", "crypto", "multi"] as AssetFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setAssetFilter(f)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize border transition-colors",
              assetFilter === f
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground",
            )}
          >
            {f === "multi" ? "Multi-Asset" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="bg-card border border-border/50 rounded-xl p-6">
        <p className="text-xs font-semibold text-muted-foreground/60 mb-4 text-center">Top Performers</p>
        <div className="flex items-end justify-center gap-4">
          {top3[1] && <PodiumCard trader={top3[1]} place={2} />}
          {top3[0] && <PodiumCard trader={top3[0]} place={1} />}
          {top3[2] && <PodiumCard trader={top3[2]} place={3} />}
        </div>
      </div>

      {/* Your rank callout */}
      {youRow && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Your rank</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-bold text-foreground">#{youRow.rank}</span>
            <ReturnBadge value={youRow.returnPct} />
            <span className="text-muted-foreground">Sharpe {youRow.sharpe}</span>
            <span className="text-muted-foreground">{youRow.winRate}% WR</span>
            <span className="text-muted-foreground">ELO {youRow.elo}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground/60 w-8">#</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground/60">Trader</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground/60">Return</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground/60">Sharpe</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground/60">Win %</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground/60 hidden sm:table-cell">Trades</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground/60 hidden md:table-cell">Followers</th>
              <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground/60">ELO</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((trader, idx) => (
              <motion.tr
                key={trader.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={cn(
                  "border-b border-border/30 last:border-0 transition-colors",
                  trader.isYou ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/30",
                )}
              >
                <td className="py-2 px-3">
                  <div className="flex items-center justify-center">
                    <RankBadge rank={trader.rank} />
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Avatar initials={trader.initials} color={trader.avatarColor} size="sm" />
                    <span className={cn("font-medium text-xs", trader.isYou ? "text-primary" : "")}>
                      {trader.username}
                      {trader.isYou && <span className="ml-1.5 text-xs bg-primary/20 text-primary rounded px-1">You</span>}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right"><ReturnBadge value={trader.returnPct} /></td>
                <td className="py-2 px-3 text-right text-xs text-muted-foreground">{trader.sharpe}</td>
                <td className="py-2 px-3 text-right text-xs text-muted-foreground">{trader.winRate}%</td>
                <td className="py-2 px-3 text-right text-xs text-muted-foreground hidden sm:table-cell">{trader.totalTrades}</td>
                <td className="py-2 px-3 text-right text-xs text-muted-foreground hidden md:table-cell">{trader.followers.toLocaleString()}</td>
                <td className="py-2 px-3 text-right text-xs font-mono text-muted-foreground">{trader.elo}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab 2: Trade Ideas ───────────────────────────────────────────────────────

function IdeaCard({
  idea,
  liked,
  onToggleLike,
}: {
  idea: TradeIdea;
  liked: boolean;
  onToggleLike: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = idea.direction === "long";

  return (
    <motion.div
      layout
      className="rounded-xl border border-border/50 bg-card p-4 space-y-3 hover:border-border/80 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Avatar initials={idea.trader.initials} color={idea.trader.avatarColor} size="sm" />
          <div>
            <p className="text-xs font-semibold">{idea.trader.username}</p>
            <p className="text-xs text-muted-foreground">{idea.hoursAgo}h ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConvictionDot conviction={idea.conviction} />
          <span className="text-xs text-muted-foreground capitalize">{idea.conviction} conviction</span>
        </div>
      </div>

      {/* Direction + Ticker */}
      <div className="flex items-center gap-3">
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-bold uppercase",
          isLong ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
        )}>
          {idea.direction}
        </span>
        <span className="font-bold text-sm">{idea.ticker}</span>
        {idea.closed && idea.closedPnlPct !== undefined && (
          <span className={cn(
            "ml-auto text-xs font-semibold px-2 py-0.5 rounded",
            idea.closedPnlPct >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
          )}>
            Closed {idea.closedPnlPct >= 0 ? "+" : ""}{idea.closedPnlPct}%
          </span>
        )}
      </div>

      {/* Price levels */}
      <div className="flex gap-4 text-xs">
        <div>
          <p className="text-muted-foreground/60">Entry</p>
          <p className="font-mono font-semibold">${idea.entry}</p>
        </div>
        <div>
          <p className="text-muted-foreground/60">Target</p>
          <p className="font-mono font-semibold text-emerald-400">${idea.target}</p>
        </div>
        <div>
          <p className="text-muted-foreground/60">Stop</p>
          <p className="font-mono font-semibold text-rose-400">${idea.stop}</p>
        </div>
        <div className="ml-auto">
          <p className="text-muted-foreground/60">R:R</p>
          <p className="font-mono font-semibold">
            {Math.abs(Math.round(
              ((isLong ? idea.target - idea.entry : idea.entry - idea.target) /
                Math.abs(isLong ? idea.entry - idea.stop : idea.stop - idea.entry)) * 10,
            ) / 10)}:1
          </p>
        </div>
      </div>

      {/* Rationale */}
      <p className="text-xs text-muted-foreground/80 leading-relaxed">{idea.rationale}</p>

      {/* Expanded thesis */}
      <AnimatePresence>
        {expanded && idea.thesis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 pt-3 text-xs text-muted-foreground/70 leading-relaxed space-y-2">
              <p className="font-semibold text-foreground/80">Full Thesis</p>
              <p>{idea.thesis}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onToggleLike(idea.id)}
          className={cn(
            "flex items-center gap-1 text-xs transition-colors",
            liked ? "text-rose-400" : "text-muted-foreground hover:text-rose-400",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
          <span>{idea.likes + (liked ? 1 : 0)}</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{idea.comments}</span>
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <span>{expanded ? "Less" : "Full thesis"}</span>
        </button>
      </div>
    </motion.div>
  );
}

function PostIdeaModal({ onClose }: { onClose: () => void }) {
  const [ticker, setTicker] = useState("AAPL");
  const [direction, setDirection] = useState<IdeaDirection>("long");
  const [entry, setEntry] = useState("");
  const [target, setTarget] = useState("");
  const [stop, setStop] = useState("");
  const [thesis, setThesis] = useState("");

  const charCount = thesis.length;

  return (
    <div className="space-y-4 p-1">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Ticker</label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ALL_TICKERS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Direction</label>
          <div className="flex gap-1">
            <button
              onClick={() => setDirection("long")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                direction === "long"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              LONG
            </button>
            <button
              onClick={() => setDirection("short")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                direction === "short"
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              SHORT
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Entry", val: entry, set: setEntry },
          { label: "Target", val: target, set: setTarget },
          { label: "Stop", val: stop, set: setStop },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
            <input
              type="number"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-muted-foreground">Thesis</label>
          <span className={cn("text-xs", charCount > 260 ? "text-rose-400" : "text-muted-foreground/60")}>
            {charCount}/280
          </span>
        </div>
        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value.slice(0, 280))}
          placeholder="Describe your trade setup and rationale..."
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground border border-border transition-colors">
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Post Idea
        </button>
      </div>
    </div>
  );
}

function TradeIdeasTab() {
  const [filter, setFilter] = useState<IdeaFilter>("all");
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("social_liked_ideas");
      return new Set(stored ? (JSON.parse(stored) as string[]) : []);
    } catch {
      return new Set();
    }
  });
  const [postOpen, setPostOpen] = useState(false);

  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try {
        localStorage.setItem("social_liked_ideas", JSON.stringify([...next]));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return TRADE_IDEAS_DATA;
    if (filter === "long") return TRADE_IDEAS_DATA.filter((i) => i.direction === "long");
    if (filter === "short") return TRADE_IDEAS_DATA.filter((i) => i.direction === "short");
    if (filter === "highConviction") return TRADE_IDEAS_DATA.filter((i) => i.conviction === "high");
    return TRADE_IDEAS_DATA;
  }, [filter]);

  const trending = TRADE_IDEAS_DATA.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {(["all", "long", "short", "highConviction"] as IdeaFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors capitalize",
                filter === f
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "highConviction" ? "High Conviction" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <Dialog open={postOpen} onOpenChange={setPostOpen}>
          <DialogTrigger asChild>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              Post Idea
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Share a Trade Idea</DialogTitle>
            </DialogHeader>
            <PostIdeaModal onClose={() => setPostOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Trending section */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-semibold text-muted-foreground/80">Trending Ideas</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trending.map((idea) => (
            <div key={idea.id} className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Avatar initials={idea.trader.initials} color={idea.trader.avatarColor} size="sm" />
                <span className="text-[11px] font-medium">{idea.trader.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded uppercase",
                  idea.direction === "long" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
                )}>
                  {idea.direction}
                </span>
                <span className="text-xs font-bold">{idea.ticker}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>{idea.likes + (likedIds.has(idea.id) ? 1 : 0)} likes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} liked={likedIds.has(idea.id)} onToggleLike={toggleLike} />
        ))}
      </div>
    </div>
  );
}

// ─── Tab 3: Copy Trading ──────────────────────────────────────────────────────

function CopyTraderCard({
  trader,
  following,
  onToggleFollow,
  maxCopySize,
  autoExecute,
}: {
  trader: CopyTrader;
  following: boolean;
  onToggleFollow: (id: string) => void;
  maxCopySize: string;
  autoExecute: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3 transition-colors",
      following ? "border-primary/30 bg-primary/3" : "border-border/50 bg-card hover:border-border/70",
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar initials={trader.initials} color={trader.avatarColor} size="md" />
          <div>
            <p className="text-sm font-semibold">{trader.username}</p>
            <p className="text-[11px] text-muted-foreground">{trader.speciality}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleFollow(trader.id)}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-medium border transition-colors",
            following
              ? "border-primary/40 bg-primary/10 text-primary hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/40"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5",
          )}
        >
          {following ? "Following" : "Follow"}
        </button>
      </div>

      <div className="flex gap-4 text-xs">
        <div>
          <p className="text-muted-foreground/60">Return</p>
          <ReturnBadge value={trader.returnPct} />
        </div>
        <div>
          <p className="text-muted-foreground/60">Win Rate</p>
          <p className="font-semibold">{trader.winRate}%</p>
        </div>
        <div>
          <p className="text-muted-foreground/60">Style match</p>
          <p className="font-semibold">{trader.similarity}%</p>
        </div>
      </div>

      {/* Portfolio similarity bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground/60 mb-1">
          <span>Style similarity</span>
          <span>{trader.similarity}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/60 rounded-full transition-all"
            style={{ width: `${trader.similarity}%` }}
          />
        </div>
      </div>

      {/* Recent trades — only shown when following */}
      <AnimatePresence>
        {following && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 pt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/60 mb-2">Recent trades</p>
              {trader.recentTrades.map((trade, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-bold px-1.5 rounded",
                      trade.direction === "Long" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
                    )}>
                      {trade.direction}
                    </span>
                    <span className="font-medium">{trade.ticker}</span>
                  </div>
                  <ReturnBadge value={trade.returnPct} />
                </div>
              ))}

              {/* Copy button for latest idea */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {autoExecute ? `Auto-copy: $${maxCopySize} max` : "Manual copy mode"}
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  <Copy className="h-3 w-3" />
                  Copy Latest
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyTradingTab() {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [maxCopySize, setMaxCopySize] = useState("500");
  const [autoExecute, setAutoExecute] = useState(false);

  const toggleFollow = useCallback((id: string) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const followedTraders = COPY_TRADERS_DATA.filter((t) => followingIds.has(t.id));

  return (
    <div className="space-y-4">
      {/* Auto-copy settings */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground/80">Auto-Copy Settings</h3>
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Max copy size ($)</label>
            <input
              type="number"
              value={maxCopySize}
              onChange={(e) => setMaxCopySize(e.target.value)}
              className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Auto-execute trades</label>
            <button
              onClick={() => setAutoExecute(!autoExecute)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
                autoExecute ? "bg-primary border-primary" : "bg-muted border-border",
              )}
            >
              <span className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                autoExecute ? "translate-x-4" : "translate-x-0.5",
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Following summary */}
      {followedTraders.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Following {followedTraders.length} trader{followedTraders.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex gap-2">
            {followedTraders.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleFollow(t.id)}
                className="flex items-center gap-1 text-xs bg-muted/50 rounded px-1.5 py-0.5 text-muted-foreground hover:text-rose-400 transition-colors"
              >
                <span>{t.username}</span>
                <X className="h-2.5 w-2.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trader cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COPY_TRADERS_DATA.map((trader) => (
          <CopyTraderCard
            key={trader.id}
            trader={trader}
            following={followingIds.has(trader.id)}
            onToggleFollow={toggleFollow}
            maxCopySize={maxCopySize}
            autoExecute={autoExecute}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Tab 4: Community Stats ───────────────────────────────────────────────────

// SVG Bubble Chart
function BubbleChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  const W = 400;
  const H = 200;

  // Simple packing: arrange in two rows
  const positions = data.map((d, i) => {
    const r = 16 + (d.value / max) * 32;
    const col = i % 5;
    const row = Math.floor(i / 5);
    return {
      x: 40 + col * 76 + (row === 1 ? 38 : 0),
      y: 55 + row * 100,
      r,
      ...d,
    };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r} className={p.color} fillOpacity={0.3} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1} />
          <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize={9} className="fill-current" opacity={0.9}>
            {p.label}
          </text>
          <text x={p.x} y={p.y + 9} textAnchor="middle" fontSize={8} opacity={0.6} className="fill-current">
            {p.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

// SVG Histogram
function ReturnHistogram({ data }: { data: { bucket: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.count));
  const W = 400;
  const H = 120;
  const barW = Math.floor(W / data.length) - 2;
  const padLeft = 4;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={0} y1={H - t * H} x2={W} y2={H - t * H}
          stroke="currentColor" strokeOpacity={0.08} strokeWidth={1}
        />
      ))}
      {/* Bars */}
      {data.map((d, i) => {
        const bh = max > 0 ? (d.count / max) * H : 0;
        const x = padLeft + i * (barW + 2);
        const y = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} className={d.color} rx={2} fillOpacity={0.8} />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={8} className="fill-current" opacity={0.5}>
              {d.bucket}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CommunityStatsTab() {
  const [regimeVote, setRegimeVote] = useState<MarketRegimeVote | null>(null);
  const totalRegime = REGIME_VOTES.bull + REGIME_VOTES.bear + REGIME_VOTES.sideways;
  const currentRegimeVotes = {
    bull: REGIME_VOTES.bull + (regimeVote === "bull" ? 1 : 0),
    bear: REGIME_VOTES.bear + (regimeVote === "bear" ? 1 : 0),
    sideways: REGIME_VOTES.sideways + (regimeVote === "sideways" ? 1 : 0),
  };

  const discussionData = ALL_TICKERS.map((t, i) => ({
    label: t,
    value: [420, 387, 312, 298, 540, 265, 470, 380, 290, 218][i] ?? 200,
    color: ["text-primary", "text-emerald-400", "text-primary", "text-amber-400", "text-rose-400",
      "text-muted-foreground", "text-orange-400", "text-emerald-400", "text-indigo-400", "text-yellow-400"][i] ?? "text-primary",
  }));

  const histogramData = [
    { bucket: "<-20%", count: 12, color: "fill-rose-600" },
    { bucket: "-20", count: 18, color: "fill-rose-500" },
    { bucket: "-10", count: 28, color: "fill-rose-400" },
    { bucket: "-5", count: 42, color: "fill-rose-300" },
    { bucket: "0", count: 65, color: "fill-muted-foreground" },
    { bucket: "+5", count: 87, color: "fill-emerald-300" },
    { bucket: "+10", count: 73, color: "fill-emerald-400" },
    { bucket: "+20", count: 51, color: "fill-emerald-500" },
    { bucket: "+40", count: 34, color: "fill-emerald-600" },
    { bucket: ">50%", count: 19, color: "fill-emerald-700" },
  ];

  return (
    <div className="space-y-4">
      {/* Sentiment grid */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground/80">Market Sentiment</h3>
          </div>
          <span className="text-xs text-muted-foreground/60">% of traders long vs short</span>
        </div>
        <div className="space-y-2">
          {TICKER_SENTIMENT_DATA.map((s) => {
            const contrarian = s.longPct > 80 || s.longPct < 20;
            return (
              <div key={s.ticker} className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold w-10">{s.ticker}</span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${s.longPct}%` }}
                    />
                    <div className="h-full bg-rose-500 flex-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs w-32 justify-end">
                  <span className="text-emerald-400">{s.longPct}% L</span>
                  <span className="text-rose-400">{s.shortPct}% S</span>
                  {contrarian && (
                    <span className="text-amber-400 font-semibold">!</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs w-20 justify-end">
                  {s.change >= 0
                    ? <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    : <ArrowDownRight className="h-3 w-3 text-rose-400" />}
                  <span className={s.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {s.change >= 0 ? "+" : ""}{s.change}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-amber-400/80 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Tickers with &gt;80% long or &lt;20% long may be contrarian signals
        </p>
      </div>

      {/* Regime vote */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground/80">Market Regime Vote</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {(["bull", "bear", "sideways"] as MarketRegimeVote[]).map((r) => {
            const votes = currentRegimeVotes[r];
            const total = currentRegimeVotes.bull + currentRegimeVotes.bear + currentRegimeVotes.sideways;
            const pct = Math.round((votes / total) * 100);
            const selected = regimeVote === r;
            return (
              <button
                key={r}
                onClick={() => setRegimeVote(r === regimeVote ? null : r)}
                className={cn(
                  "rounded-xl border p-3 text-center transition-colors",
                  selected
                    ? r === "bull"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                      : r === "bear"
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                        : "border-amber-500/50 bg-amber-500/10 text-amber-400"
                    : "border-border hover:border-border/80",
                )}
              >
                <p className="text-lg mb-1">
                  {r === "bull" ? "🐂" : r === "bear" ? "🐻" : "↔"}
                </p>
                <p className="text-xs font-semibold capitalize">{r}</p>
                <p className="text-xl font-bold mt-1">{pct}%</p>
                <p className="text-xs text-muted-foreground">{votes.toLocaleString()} votes</p>
              </button>
            );
          })}
        </div>
        {regimeVote && (
          <p className="text-[11px] text-primary text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            You voted: {regimeVote}
          </p>
        )}
      </div>

      {/* Discussion bubble chart */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground/80">Most Discussed This Week</h3>
        </div>
        <BubbleChart data={discussionData} />
      </div>

      {/* Return distribution histogram */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground/80">Community P&L Distribution (This Month)</h3>
        </div>
        <ReturnHistogram data={histogramData} />
        <div className="flex justify-between text-xs text-muted-foreground/60 mt-1 px-1">
          <span>Losses</span>
          <span>Breakeven</span>
          <span>Gains</span>
        </div>
      </div>

      {/* Challenges */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground/80">Active Challenges</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHALLENGES.map((c) => (
            <div key={c.id} className="rounded-lg border border-border/50 p-3 space-y-2 hover:border-border/70 transition-colors">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{c.category}</span>
                <span className="text-xs text-muted-foreground">Ends in {c.endsIn}</span>
              </div>
              <p className="text-xs font-semibold">{c.title}</p>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">{c.description}</p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{c.participants} participants</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{c.prize}</span>
                </div>
              </div>
              <button className="w-full py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors">
                Join Challenge
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [tab, setTab] = useState("leaderboard");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Social Trading</h1>
            <p className="text-xs text-muted-foreground">Leaderboards, trade ideas, copy trading &amp; community insights</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4 w-full sm:w-auto">
              <TabsTrigger value="leaderboard" className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                <span>Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="ideas" className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                <span>Trade Ideas</span>
              </TabsTrigger>
              <TabsTrigger value="copy" className="flex items-center gap-1.5">
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Trading</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Community</span>
              </TabsTrigger>
              <TabsTrigger value="hub" className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>Hub</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="data-[state=inactive]:hidden">
              <LeaderboardTab />
            </TabsContent>
            <TabsContent value="ideas" className="data-[state=inactive]:hidden">
              <TradeIdeasTab />
            </TabsContent>
            <TabsContent value="copy" className="data-[state=inactive]:hidden">
              <CopyTradingTab />
            </TabsContent>
            <TabsContent value="stats" className="data-[state=inactive]:hidden">
              <CommunityStatsTab />
            </TabsContent>
            <TabsContent value="hub" className="data-[state=inactive]:hidden">
              <SocialTradingHub />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
