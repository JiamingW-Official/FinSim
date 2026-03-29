"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Users, Star, Crown, Medal,
  Copy, BarChart2, Target, ArrowUpRight,
  ArrowDownRight, Heart, MessageSquare, ThumbsUp, ThumbsDown,
  Flame, Eye, ChevronDown, ChevronUp, Filter, SortAsc,
  Send, AlertCircle, Trophy,
} from "lucide-react";
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

const HUB_SEED = 4815;

// ─── Types ────────────────────────────────────────────────────────────────────

type StrategyType = "Momentum" | "Value" | "Options" | "Crypto" | "Dividend" | "Macro" | "Swing" | "Day Trading";
type RiskLevel = "Low" | "Medium" | "High" | "Very High";
type StrategySortKey = "return" | "sharpe" | "followers" | "newest";
type TradeDirection = "Long" | "Short";
type IdeaSortKey = "liked" | "recent" | "conviction";
type IdeaFilter = "all" | "long" | "short" | "sector";
type BadgeTier = "Gold" | "Silver" | "Bronze";
type ReactionType = "thumbsup" | "thumbsdown" | "fire" | "thinking";

interface Strategy {
  id: string;
  name: string;
  author: string;
  returnYTD: number;
  sharpe: number;
  maxDrawdown: number;
  followers: number;
  copiers: number;
  type: StrategyType;
  risk: RiskLevel;
  equityCurve: number[];
  createdDaysAgo: number;
}

interface TradeIdea {
  id: string;
  author: string;
  authorColor: string;
  authorInitials: string;
  badge: BadgeTier;
  accuracyRate: number;
  ticker: string;
  company: string;
  direction: TradeDirection;
  entry: number;
  stop: number;
  target: number;
  thesis: string;
  sector: string;
  timeframe: string;
  conviction: "High" | "Medium" | "Low";
  likes: number;
  comments: number;
  agrees: number;
  disagrees: number;
  hoursAgo: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  color: string;
  initials: string;
  returnPct: number;
  sharpe: number;
  maxDD: number;
  trades: number;
  winRate: number;
  style: string;
  isYou?: boolean;
}

interface TopTrader {
  id: string;
  username: string;
  color: string;
  initials: string;
  positions: { ticker: string; weight: number; costBasis: number; currentPnlPct: number }[];
  recentTrades: { ticker: string; action: "Buy" | "Sell"; size: number; daysAgo: number }[];
  beta: number;
  concentration: number;
  vol: number;
}

interface DiscussionMessage {
  id: string;
  author: string;
  authorColor: string;
  authorInitials: string;
  content: string;
  minutesAgo: number;
  reactions: Record<ReactionType, number>;
}

interface DiscussionThread {
  id: string;
  topic: string;
  messages: DiscussionMessage[];
  mentions: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-primary", "bg-emerald-500", "bg-primary", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
  "bg-teal-500", "bg-indigo-500", "bg-lime-500", "bg-fuchsia-500",
  "bg-sky-500", "bg-red-500", "bg-green-500", "bg-primary",
];

const USERNAMES = [
  "AlphaRider", "QuantEdge", "MomoKing", "TechBull88", "SwingPro",
  "ScalpQueen", "ValuHunter", "TrendRider", "VolPlayer", "RiskMgr2k",
  "FlowWatcher", "OptionsGuru", "CryptoNinja", "MacroMind", "PatternPro",
  "GapNGo", "DeltaForce", "SigmaTrader", "BetaBreaker", "AlgoBot7",
  "ZeroHedge", "IronCondor", "CurveSteepen", "TailRisk", "BlackSwan",
  "AlphaDecay", "FactorKing", "BenchmarkBeat", "DrawdownKing", "RollYield",
];

const TICKERS = [
  { ticker: "AAPL", company: "Apple Inc.", sector: "Technology", price: 185 },
  { ticker: "MSFT", company: "Microsoft Corp.", sector: "Technology", price: 370 },
  { ticker: "NVDA", company: "NVIDIA Corp.", sector: "Technology", price: 460 },
  { ticker: "TSLA", company: "Tesla Inc.", sector: "Consumer Cyclical", price: 190 },
  { ticker: "META", company: "Meta Platforms", sector: "Technology", price: 475 },
  { ticker: "AMZN", company: "Amazon.com", sector: "Consumer Cyclical", price: 178 },
  { ticker: "GOOG", company: "Alphabet Inc.", sector: "Technology", price: 155 },
  { ticker: "SPY", company: "SPDR S&P 500 ETF", sector: "ETF", price: 490 },
  { ticker: "QQQ", company: "Invesco QQQ ETF", sector: "ETF", price: 420 },
  { ticker: "GLD", company: "SPDR Gold Shares", sector: "Commodities", price: 185 },
];

const STRATEGY_NAMES = [
  "Momentum Surge", "Deep Value Play", "Iron Condor Machine", "Crypto Alpha",
  "Dividend Compunder", "Global Macro Pulse", "Swing Structure", "Scalp Master",
];

const STRATEGY_TYPES: StrategyType[] = ["Momentum", "Value", "Options", "Crypto", "Dividend", "Macro", "Swing", "Day Trading"];
const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Very High"];

const THESES = [
  "RSI recovering from oversold with MACD bullish crossover — volume confirming. Strong support at this level holds since Q3. The risk/reward here is excellent at 3:1 with a defined stop below the 50-day MA.",
  "Breaking out of 6-week consolidation on above-average volume. Target aligns with the previous resistance-turned-support zone from February. Sector rotation into this name is accelerating.",
  "Earnings beat catalyst with positive forward guidance revision. Market is underpricing the beat by at least 8%. Multiple analyst upgrades expected in the next 2 weeks.",
  "Technical setup: bull flag on the daily chart with strong relative strength vs sector peers. Options flow showing unusual call activity in the near-term expiry — smart money positioning.",
  "Short setup: stock up 42% in 3 weeks with no fundamental change. Insider selling detected last week. RSI hit 87 (extremely overbought). Mean reversion to the 200-day MA is the base case.",
  "Cup-and-handle breakout on the weekly chart confirmed. Fundamental catalyst: new product cycle beginning plus margin expansion story fully intact. Holding through earnings.",
  "VWAP reclaim after morning gap-down with volume fading on sell-off. Buyers stepping in at key support. This is a classic intraday reversal pattern with a tight stop.",
  "Sector rotation play: institutional money moving from growth into value. This ticker leads its sub-sector with strong momentum. Relative rotation graph confirms the move.",
];

const TIMEFRAMES = ["Intraday", "Swing (2-5d)", "Weekly", "Monthly", "Long-Term"];

const DISCUSSION_TOPICS = [
  "AI stocks: bubble or secular growth story?",
  "Fed pivot trade: what to buy when cuts start?",
  "Crypto bull market: how to size your allocation?",
];

const DISCUSSION_MESSAGES = [
  ["The AI capex supercycle is real. We're in the infrastructure phase — just like the internet in 1999 but the fundamentals are much stronger this time.", "NVDA forward P/E is high but the earnings growth rate justifies it. PEG ratio is actually reasonable below 1.5.", "I disagree — the hyperscalers are all spending $50B+ on capex chasing the same AI pie. Margins will compress when supply catches up.", "The bubble thesis is lazy. NVDA has genuine pricing power and a moat in CUDA. Bears said the same in 2020 and 2022.", "Don't sleep on the software layer plays. $MSFT Azure AI attach rates are accelerating massively — this is where the real margin expansion happens.", "Semis look toppy short-term but the secular trend is intact for 5+ years. Buy the dip when AI hype cools.", "The risk is regulatory, not fundamental. EU AI Act could kneecap monetization in the largest market outside the US.", "I'm running a barbell: 50% NVDA (the infrastructure winner) + 50% cash for when the correction comes. Best of both worlds."],
  ["Historical playbook says buy duration (TLT) when Fed starts cutting. But this cycle is different — inflation is still sticky.", "I like REIT exposure here. They've been hammered by rate expectations and a pivot is the ultimate catalyst.", "Small-cap value (IWN) has been left for dead while mega-cap ran. Historical mean reversion + rate cut = 30%+ potential.", "Utilities sector is my conviction play. Defensive with dividend yield + AI electricity demand tailwind. Underowned.", "Don't overcomplicate it — just buy SPY. A soft landing with rate cuts is as bullish as it gets for broad equities.", "I'm fading the rate cut trade. Market is pricing 3 cuts this year but the data doesn't support it. Will be disappointed.", "EM equities (EEM) are the sleeper trade here. Dollar weakness from rate cuts + cheap valuations + China recovery.", "Financials (XLF) are the paradox play — they rally on rate cuts because of steeper yield curve, not lower rates."],
  ["Kelly criterion says never put more than 5% of your portfolio in any single crypto. Volatility too high to go bigger.", "BTC dominance is rising which historically precedes an alt season rally. Sizing up ETH and SOL here.", "The on-chain data looks clean — long-term holders accumulating, exchange reserves declining. Classic pre-bull setup.", "I run 15% crypto as my speculative sleeve. Within that: 60% BTC, 30% ETH, 10% SOL. No meme coins.", "Don't ignore the macro correlation. BTC trades with Nasdaq when risk-off hits. It's not the uncorrelated hedge people claim.", "Retail hasn't come back yet — that's actually bullish. The real bull run hasn't started. Last cycle peaked when Uber drivers were asking about crypto.", "The ETF approval changed the institutional landscape permanently. $10B+ inflows expected this year from pension allocators.", "Hard cap my crypto at 10% even if conviction is high. The tail risk of a 70% drawdown is too painful emotionally to hold through."],
];

// ─── Data Generators ──────────────────────────────────────────────────────────

function generateStrategies(): Strategy[] {
  const rng = mulberry32(HUB_SEED);
  return STRATEGY_NAMES.map((name, i) => {
    const returnYTD = Math.round((rng() * 140 - 15) * 10) / 10;
    const sharpe = Math.round((0.3 + rng() * 2.7) * 100) / 100;
    const maxDrawdown = Math.round(-(2 + rng() * 28) * 10) / 10;
    const followers = Math.floor(50 + rng() * 3000);
    const copiers = Math.floor(followers * (0.1 + rng() * 0.4));

    // 90-day equity curve seeded per strategy
    const curveRng = mulberry32(HUB_SEED + i * 13);
    const equityCurve: number[] = [100];
    for (let d = 1; d < 90; d++) {
      const prev = equityCurve[d - 1]!;
      const delta = (curveRng() - 0.46) * 3;
      equityCurve.push(Math.max(60, prev + delta));
    }

    return {
      id: `strat-${i}`,
      name,
      author: USERNAMES[i] ?? `Trader${i}`,
      returnYTD,
      sharpe,
      maxDrawdown,
      followers,
      copiers,
      type: STRATEGY_TYPES[i] ?? "Momentum",
      risk: RISK_LEVELS[Math.floor(rng() * RISK_LEVELS.length)] ?? "Medium",
      equityCurve,
      createdDaysAgo: Math.floor(30 + rng() * 300),
    };
  });
}

function generateTradeIdeas(): TradeIdea[] {
  const rng = mulberry32(HUB_SEED + 100);
  const ideas: TradeIdea[] = [];
  for (let i = 0; i < 20; i++) {
    const authorIdx = Math.floor(rng() * USERNAMES.length);
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const author = USERNAMES[authorIdx] ?? `Trader${i}`;
    const tickerData = TICKERS[Math.floor(rng() * TICKERS.length)] ?? TICKERS[0]!;
    const direction: TradeDirection = rng() > 0.45 ? "Long" : "Short";
    const base = tickerData.price;
    const entry = Math.round(base * (1 + (rng() - 0.5) * 0.04) * 100) / 100;
    const targetMult = direction === "Long" ? 1 + 0.05 + rng() * 0.15 : 1 - 0.05 - rng() * 0.15;
    const stopMult = direction === "Long" ? 1 - 0.02 - rng() * 0.05 : 1 + 0.02 + rng() * 0.05;
    const target = Math.round(entry * targetMult * 100) / 100;
    const stop = Math.round(entry * stopMult * 100) / 100;
    const badgeRoll = rng();
    const badge: BadgeTier = badgeRoll > 0.75 ? "Gold" : badgeRoll > 0.4 ? "Silver" : "Bronze";
    const convictionRoll = rng();
    const conviction = convictionRoll > 0.65 ? "High" : convictionRoll > 0.35 ? "Medium" : "Low";
    const thesisIdx = Math.floor(rng() * THESES.length);
    const timeframeIdx = Math.floor(rng() * TIMEFRAMES.length);

    ideas.push({
      id: `idea-hub-${i}`,
      author,
      authorColor: AVATAR_COLORS[colorIdx] ?? "bg-primary",
      authorInitials: author.slice(0, 2).toUpperCase(),
      badge,
      accuracyRate: Math.round((40 + rng() * 45) * 10) / 10,
      ticker: tickerData.ticker,
      company: tickerData.company,
      direction,
      entry,
      stop,
      target,
      thesis: THESES[thesisIdx] ?? "",
      sector: tickerData.sector,
      timeframe: TIMEFRAMES[timeframeIdx] ?? "Swing (2-5d)",
      conviction,
      likes: Math.floor(rng() * 200),
      comments: Math.floor(rng() * 40),
      agrees: Math.floor(rng() * 80),
      disagrees: Math.floor(rng() * 30),
      hoursAgo: Math.floor(1 + rng() * 72),
    });
  }
  return ideas.sort((a, b) => b.likes - a.likes);
}

function generateLeaderboard(): LeaderboardEntry[] {
  const rng = mulberry32(HUB_SEED + 200);
  const styles = ["Momentum", "Value", "Options", "Swing", "Day Trading", "Macro", "Quant", "Arbitrage"];
  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < 25; i++) {
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const username = USERNAMES[i] ?? `Trader${i}`;
    entries.push({
      rank: i + 1,
      username,
      color: AVATAR_COLORS[colorIdx] ?? "bg-primary",
      initials: username.slice(0, 2).toUpperCase(),
      returnPct: Math.round((rng() * 90 - 5) * 10) / 10,
      sharpe: Math.round((0.3 + rng() * 2.5) * 100) / 100,
      maxDD: Math.round(-(2 + rng() * 25) * 10) / 10,
      trades: Math.floor(15 + rng() * 200),
      winRate: Math.round((35 + rng() * 40) * 10) / 10,
      style: styles[Math.floor(rng() * styles.length)] ?? "Momentum",
    });
  }
  // Sort by Sharpe
  entries.sort((a, b) => b.sharpe - a.sharpe).forEach((e, i) => { e.rank = i + 1; });
  // Mark you at position 11
  if (entries[11]) entries[11].isYou = true;
  return entries;
}

function generateTopTraders(): TopTrader[] {
  const rng = mulberry32(HUB_SEED + 300);
  return USERNAMES.slice(0, 5).map((username, i) => {
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const tickerSubset = [...TICKERS].sort(() => rng() - 0.5).slice(0, 5);
    const rawWeights = tickerSubset.map(() => 10 + rng() * 30);
    const totalW = rawWeights.reduce((a, b) => a + b, 0);
    const positions = tickerSubset.map((t, j) => ({
      ticker: t.ticker,
      weight: Math.round((rawWeights[j]! / totalW) * 100 * 10) / 10,
      costBasis: Math.round(t.price * (0.8 + rng() * 0.2) * 100) / 100,
      currentPnlPct: Math.round((rng() * 40 - 10) * 10) / 10,
    }));
    const recentTrades = Array.from({ length: 3 }, (_, k) => {
      const t = TICKERS[Math.floor(rng() * TICKERS.length)] ?? TICKERS[0]!;
      return {
        ticker: t.ticker,
        action: (rng() > 0.5 ? "Buy" : "Sell") as "Buy" | "Sell",
        size: Math.round(1 + rng() * 15),
        daysAgo: Math.floor(1 + rng() * 14),
      };
    });
    return {
      id: `top-${i}`,
      username,
      color: AVATAR_COLORS[colorIdx] ?? "bg-primary",
      initials: username.slice(0, 2).toUpperCase(),
      positions,
      recentTrades,
      beta: Math.round((0.5 + rng() * 1.5) * 100) / 100,
      concentration: Math.round((positions[0]?.weight ?? 30)),
      vol: Math.round((8 + rng() * 22) * 10) / 10,
    };
  });
}

function generateDiscussionThreads(): DiscussionThread[] {
  const rng = mulberry32(HUB_SEED + 400);
  return DISCUSSION_TOPICS.map((topic, ti) => {
    const msgs = DISCUSSION_MESSAGES[ti] ?? [];
    const mentions: string[] = [];
    const messages = msgs.map((content, mi) => {
      const authorIdx = Math.floor(rng() * USERNAMES.length);
      const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
      const author = USERNAMES[authorIdx] ?? `User${mi}`;
      // pick a mentioned ticker
      const mentionTicker = TICKERS[Math.floor(rng() * TICKERS.length)]?.ticker;
      if (mentionTicker && !mentions.includes(mentionTicker)) mentions.push(mentionTicker);
      return {
        id: `msg-${ti}-${mi}`,
        author,
        authorColor: AVATAR_COLORS[colorIdx] ?? "bg-primary",
        authorInitials: author.slice(0, 2).toUpperCase(),
        content,
        minutesAgo: Math.floor(5 + rng() * 180),
        reactions: {
          thumbsup: Math.floor(rng() * 40),
          thumbsdown: Math.floor(rng() * 10),
          fire: Math.floor(rng() * 25),
          thinking: Math.floor(rng() * 20),
        },
      };
    });
    return { id: `thread-${ti}`, topic, messages, mentions: mentions.slice(0, 3) };
  });
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STRATEGIES_DATA = generateStrategies();
const TRADE_IDEAS_DATA = generateTradeIdeas();
const LEADERBOARD_DATA = generateLeaderboard();
const TOP_TRADERS_DATA = generateTopTraders();
const DISCUSSION_DATA = generateDiscussionThreads();

// ─── Mini Components ──────────────────────────────────────────────────────────

function Avatar({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";
  return (
    <div className={cn("shrink-0 rounded-full flex items-center justify-center font-bold text-foreground", color, sizeClass)}>
      {initials}
    </div>
  );
}

function BadgePill({ tier }: { tier: BadgeTier }) {
  const cls = tier === "Gold"
    ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/30"
    : tier === "Silver"
    ? "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30"
    : "bg-amber-700/15 text-amber-600 border-amber-700/30";
  return (
    <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[11px] font-bold uppercase", cls)}>
      <Star className="h-2.5 w-2.5 fill-current" />
      {tier}
    </span>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const cls = level === "Low"
    ? "bg-emerald-500/15 text-emerald-400"
    : level === "Medium"
    ? "bg-amber-500/15 text-amber-400"
    : level === "High"
    ? "bg-orange-500/15 text-orange-400"
    : "bg-rose-500/15 text-rose-400";
  return <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded", cls)}>{level}</span>;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
  return <span className="text-xs font-mono text-muted-foreground/60 w-5 text-center">{rank}</span>;
}

function ReturnBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={cn("text-sm font-semibold tabular-nums", pos ? "text-emerald-400" : "text-rose-400")}>
      {pos ? "+" : ""}{value}%
    </span>
  );
}

// Mini equity curve SVG
function EquityCurveSVG({ data }: { data: number[] }) {
  const W = 96;
  const H = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(" ");
  const lastY = H - ((data[data.length - 1]! - min) / range) * H;
  const isUp = (data[data.length - 1] ?? 0) >= (data[0] ?? 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-24 h-9 shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={isUp ? "#34d399" : "#f87171"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={(data.length - 1) / (data.length - 1) * W} cy={lastY} r={2} fill={isUp ? "#34d399" : "#f87171"} />
    </svg>
  );
}

// Portfolio donut SVG
function DonutSVG({ positions }: { positions: { ticker: string; weight: number; currentPnlPct: number }[] }) {
  const COLORS = ["#60a5fa", "#34d399", "#a78bfa", "#fbbf24", "#f87171"];
  const CX = 50;
  const CY = 50;
  const R = 38;
  const INNER_R = 24;
  const W = 100;
  const H = 100;
  let cumAngle = -90;
  const slices = positions.map((p, i) => {
    const angle = (p.weight / 100) * 360;
    const startA = cumAngle;
    cumAngle += angle;
    const endA = cumAngle;
    const toRad = (a: number) => (a * Math.PI) / 180;
    const sx = CX + R * Math.cos(toRad(startA));
    const sy = CY + R * Math.sin(toRad(startA));
    const ex = CX + R * Math.cos(toRad(endA));
    const ey = CY + R * Math.sin(toRad(endA));
    const six = CX + INNER_R * Math.cos(toRad(startA));
    const siy = CY + INNER_R * Math.sin(toRad(startA));
    const eix = CX + INNER_R * Math.cos(toRad(endA));
    const eiy = CY + INNER_R * Math.sin(toRad(endA));
    const large = angle > 180 ? 1 : 0;
    const d = `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey} L ${eix} ${eiy} A ${INNER_R} ${INNER_R} 0 ${large} 0 ${six} ${siy} Z`;
    return { d, color: COLORS[i % COLORS.length] ?? "#60a5fa", ticker: p.ticker, weight: p.weight };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-20 shrink-0">
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} fillOpacity={0.8} stroke="var(--background)" strokeWidth={1} />
      ))}
    </svg>
  );
}

// ─── Section 1: Trending Strategies ───────────────────────────────────────────

function StrategyCard({ strategy, followed, copied, onFollow, onCopy }: {
  strategy: Strategy;
  followed: boolean;
  copied: boolean;
  onFollow: (id: string) => void;
  onCopy: (id: string) => void;
}) {
  return (
    <div className={cn(
      "rounded-md border p-4 space-y-3 transition-all",
      followed ? "border-primary/30 bg-primary/3" : "border-border/50 bg-card hover:border-border/70",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-semibold truncate">{strategy.name}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">by {strategy.author}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <RiskBadge level={strategy.risk} />
          <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50">
            {strategy.type}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground/70">YTD Return</p>
          <ReturnBadge value={strategy.returnYTD} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground/70">Sharpe</p>
          <p className="text-sm font-semibold tabular-nums">{strategy.sharpe}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/70">Max DD</p>
          <p className="text-sm font-semibold tabular-nums text-rose-400">{strategy.maxDrawdown}%</p>
        </div>
      </div>

      {/* Equity curve + followers */}
      <div className="flex items-center justify-between">
        <EquityCurveSVG data={strategy.equityCurve} />
        <div className="text-right space-y-0.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
            <Users className="h-3 w-3" />
            <span>{strategy.followers.toLocaleString()} followers</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
            <Copy className="h-3 w-3" />
            <span>{strategy.copiers.toLocaleString()} copiers</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onFollow(strategy.id)}
          className={cn(
            "flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-colors",
            followed
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5",
          )}
        >
          {followed ? "Following" : "Follow"}
        </button>
        <button
          onClick={() => onCopy(strategy.id)}
          className={cn(
            "flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-colors",
            copied
              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
              : "border-border text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5",
          )}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function TrendingStrategiesSection() {
  const [sortKey, setSortKey] = useState<StrategySortKey>("return");
  const [filterType, setFilterType] = useState<StrategyType | "All">("All");
  const [filterRisk, setFilterRisk] = useState<RiskLevel | "All">("All");
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let data = [...STRATEGIES_DATA];
    if (filterType !== "All") data = data.filter((s) => s.type === filterType);
    if (filterRisk !== "All") data = data.filter((s) => s.risk === filterRisk);
    if (sortKey === "return") data.sort((a, b) => b.returnYTD - a.returnYTD);
    else if (sortKey === "sharpe") data.sort((a, b) => b.sharpe - a.sharpe);
    else if (sortKey === "followers") data.sort((a, b) => b.followers - a.followers);
    else data.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
    return data;
  }, [sortKey, filterType, filterRisk]);

  const toggleFollow = (id: string) => setFollowedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleCopy = (id: string) => setCopiedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const sortOptions: { key: StrategySortKey; label: string }[] = [
    { key: "return", label: "Top Return" },
    { key: "sharpe", label: "Highest Sharpe" },
    { key: "followers", label: "Most Followers" },
    { key: "newest", label: "Newest" },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {sortOptions.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                sortKey === s.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as StrategyType | "All")}
            className="text-xs bg-muted/50 border border-border/50 rounded px-2 py-1 text-muted-foreground"
          >
            <option value="All">All Types</option>
            {STRATEGY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as RiskLevel | "All")}
            className="text-xs bg-muted/50 border border-border/50 rounded px-2 py-1 text-muted-foreground"
          >
            <option value="All">All Risk</option>
            {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map((s) => (
          <StrategyCard
            key={s.id}
            strategy={s}
            followed={followedIds.has(s.id)}
            copied={copiedIds.has(s.id)}
            onFollow={toggleFollow}
            onCopy={toggleCopy}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section 2: Trade Ideas Feed ──────────────────────────────────────────────

function IdeaCard({ idea, agreed, disagreed, onAgree, onDisagree }: {
  idea: TradeIdea;
  agreed: boolean;
  disagreed: boolean;
  onAgree: (id: string) => void;
  onDisagree: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = idea.direction === "Long";
  const rr = Math.abs((idea.target - idea.entry) / (idea.entry - idea.stop));

  return (
    <div className="rounded-md border border-border/50 bg-card p-4 space-y-3 hover:border-border/70 transition-colors">
      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar initials={idea.authorInitials} color={idea.authorColor} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold">{idea.author}</span>
              <BadgePill tier={idea.badge} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{idea.accuracyRate}% accuracy</span>
              <span>•</span>
              <span>{idea.hoursAgo}h ago</span>
              <span>•</span>
              <span>{idea.timeframe}</span>
            </div>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
          isLong ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
        )}>
          {isLong ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {idea.direction}
        </div>
      </div>

      {/* Ticker + Levels */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-base font-bold">{idea.ticker}</p>
          <p className="text-xs text-muted-foreground">{idea.company}</p>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground/70 uppercase">Entry</p>
            <p className="text-xs font-semibold tabular-nums">${idea.entry}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground/70 uppercase">Stop</p>
            <p className="text-xs font-semibold tabular-nums text-rose-400">${idea.stop}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground/70 uppercase">Target</p>
            <p className="text-xs font-semibold tabular-nums text-emerald-400">${idea.target}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-muted-foreground/70">R:R</p>
          <p className="text-xs font-bold text-amber-400">{rr.toFixed(1)}:1</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{idea.sector}</span>
        <span className={cn(
          "text-[11px] px-1.5 py-0.5 rounded font-semibold",
          idea.conviction === "High" ? "bg-emerald-500/15 text-emerald-400"
          : idea.conviction === "Medium" ? "bg-amber-500/15 text-amber-400"
          : "bg-muted/60 text-muted-foreground",
        )}>
          {idea.conviction} Conviction
        </span>
      </div>

      {/* Thesis (expandable) */}
      <div>
        <p className={cn("text-[11px] text-muted-foreground leading-relaxed", !expanded && "line-clamp-2")}>
          {idea.thesis}
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-0.5 text-xs text-primary/70 hover:text-primary mt-0.5 transition-colors"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Read more</>}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            <span>{idea.likes}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{idea.comments}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAgree(idea.id)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors",
              agreed
                ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
                : "border-border/50 text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400",
            )}
          >
            <ThumbsUp className="h-3 w-3" />
            Agree {idea.agrees + (agreed ? 1 : 0)}
          </button>
          <button
            onClick={() => onDisagree(idea.id)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors",
              disagreed
                ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                : "border-border/50 text-muted-foreground hover:border-rose-500/40 hover:text-rose-400",
            )}
          >
            <ThumbsDown className="h-3 w-3" />
            Disagree {idea.disagrees + (disagreed ? 1 : 0)}
          </button>
        </div>
      </div>
    </div>
  );
}

function TradeIdeasFeedSection() {
  const [sortKey, setSortKey] = useState<IdeaSortKey>("liked");
  const [filter, setFilter] = useState<IdeaFilter>("all");
  const [agreedIds, setAgreedIds] = useState<Set<string>>(new Set());
  const [disagreedIds, setDisagreedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let data = [...TRADE_IDEAS_DATA];
    if (filter === "long") data = data.filter((i) => i.direction === "Long");
    else if (filter === "short") data = data.filter((i) => i.direction === "Short");
    else if (filter === "sector") data = data.filter((i) => i.sector === "Technology");
    if (sortKey === "liked") data.sort((a, b) => b.likes - a.likes);
    else if (sortKey === "recent") data.sort((a, b) => a.hoursAgo - b.hoursAgo);
    else data.sort((a, b) => {
      const order = { High: 2, Medium: 1, Low: 0 };
      return order[b.conviction] - order[a.conviction];
    });
    return data;
  }, [sortKey, filter]);

  const toggleAgree = (id: string) => {
    setAgreedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setDisagreedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };
  const toggleDisagree = (id: string) => {
    setDisagreedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setAgreedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const filterOptions: { key: IdeaFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "long", label: "Long Only" },
    { key: "short", label: "Short Only" },
    { key: "sector", label: "Tech Sector" },
  ];
  const sortOptions: { key: IdeaSortKey; label: string }[] = [
    { key: "liked", label: "Most Liked" },
    { key: "recent", label: "Most Recent" },
    { key: "conviction", label: "Highest Conviction" },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                filter === f.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
          {sortOptions.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={cn(
                "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                sortKey === s.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            agreed={agreedIds.has(idea.id)}
            disagreed={disagreedIds.has(idea.id)}
            onAgree={toggleAgree}
            onDisagree={toggleDisagree}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Leaderboard & Rankings ────────────────────────────────────────

function LeaderboardRankingsSection() {
  const [category, setCategory] = useState<"all" | "swing" | "options" | "longterm">("all");

  const filtered = useMemo(() => {
    if (category === "all") return LEADERBOARD_DATA;
    const styleMap: Record<string, string[]> = {
      swing: ["Swing", "Momentum"],
      options: ["Options", "Arbitrage"],
      longterm: ["Value", "Macro", "Quant"],
    };
    const styles = styleMap[category] ?? [];
    return LEADERBOARD_DATA.filter((e) => styles.includes(e.style));
  }, [category]);

  const categoryOptions = [
    { key: "all" as const, label: "All Traders" },
    { key: "swing" as const, label: "Top Swing Traders" },
    { key: "options" as const, label: "Top Options Traders" },
    { key: "longterm" as const, label: "Top Long-Term Investors" },
  ];

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit flex-wrap">
        {categoryOptions.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              category === c.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground/70 w-8">Rank</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground/70">Trader</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground/70">Return</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground/70">Sharpe</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground/70">Max DD</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground/70">Trades</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground/70">Win%</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground/70">Style</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground/70"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((entry, rowIdx) => (
                <tr
                  key={entry.rank}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    entry.isYou && "bg-primary/5 border-l-2 border-l-primary",
                  )}
                >
                  <td className="px-3 py-2 w-8">
                    <div className="flex items-center justify-center">
                      <RankIcon rank={rowIdx + 1} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar initials={entry.initials} color={entry.color} size="sm" />
                      <span className={cn("font-medium", entry.isYou && "text-primary")}>
                        {entry.username} {entry.isYou && <span className="text-[11px] text-primary/70">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ReturnBadge value={entry.returnPct} />
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{entry.sharpe}</td>
                  <td className="px-3 py-2 text-right text-rose-400 font-mono">{entry.maxDD}%</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{entry.trades}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{entry.winRate}%</td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{entry.style}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {!entry.isYou && (
                      <button className="text-xs px-2 py-0.5 rounded border border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                        Challenge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Section 4: Portfolio Transparency ────────────────────────────────────────

function TopTraderCard({ trader }: { trader: TopTrader }) {
  const [cloned, setCloned] = useState(false);

  return (
    <div className="rounded-md border border-border/50 bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar initials={trader.initials} color={trader.color} size="md" />
          <div>
            <p className="text-sm font-semibold">{trader.username}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>β {trader.beta}</span>
              <span>•</span>
              <span>Conc. {trader.concentration}%</span>
              <span>•</span>
              <span>Vol {trader.vol}%</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setCloned(true)}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors",
            cloned
              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5",
          )}
        >
          <Copy className="h-3 w-3" />
          {cloned ? "Cloned!" : "Clone Portfolio"}
        </button>
      </div>

      <div className="flex gap-4">
        {/* Donut */}
        <div className="shrink-0">
          <DonutSVG positions={trader.positions} />
        </div>

        {/* Positions table */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase mb-1">Top Positions</p>
          <div className="space-y-1">
            {trader.positions.map((p) => (
              <div key={p.ticker} className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-semibold w-12">{p.ticker}</span>
                <span className="text-muted-foreground">{p.weight}%</span>
                <span className="text-muted-foreground text-xs">${p.costBasis}</span>
                <span className={cn("font-semibold", p.currentPnlPct >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {p.currentPnlPct >= 0 ? "+" : ""}{p.currentPnlPct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent trades */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground/70 uppercase mb-1.5">Recent Trades</p>
        <div className="flex items-center gap-2 flex-wrap">
          {trader.recentTrades.map((t, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                t.action === "Buy" ? "bg-emerald-500/5 text-emerald-400" : "bg-rose-500/10 text-rose-400",
              )}
            >
              {t.action === "Buy" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {t.action} {t.size} {t.ticker}
              <span className="text-muted-foreground ml-0.5">{t.daysAgo}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioTransparencySection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Eye className="h-3.5 w-3.5" />
        <span>Traders who voluntarily share their portfolios publicly. Clone to mirror their allocations in your simulated account.</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {TOP_TRADERS_DATA.map((trader) => (
          <TopTraderCard key={trader.id} trader={trader} />
        ))}
      </div>
    </div>
  );
}

// ─── Section 5: Discussion & Insights ─────────────────────────────────────────

const REACTION_ICONS: Record<ReactionType, string> = {
  thumbsup: "👍",
  thumbsdown: "👎",
  fire: "🔥",
  thinking: "🤔",
};

function MessageBubble({ msg, reactions, onReact }: {
  msg: DiscussionMessage;
  reactions: Record<ReactionType, number>;
  onReact: (type: ReactionType) => void;
}) {
  return (
    <div className="flex gap-2.5">
      <Avatar initials={msg.authorInitials} color={msg.authorColor} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold">{msg.author}</span>
          <span className="text-xs text-muted-foreground">{msg.minutesAgo}m ago</span>
        </div>
        <p className="text-[11px] text-muted-foreground/90 leading-relaxed mb-1.5">{msg.content}</p>
        <div className="flex items-center gap-1 flex-wrap">
          {(Object.keys(REACTION_ICONS) as ReactionType[]).map((type) => (
            <button
              key={type}
              onClick={() => onReact(type)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-muted/50 hover:bg-muted text-xs transition-colors"
            >
              <span>{REACTION_ICONS[type]}</span>
              <span className="text-muted-foreground">{reactions[type]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscussionSection() {
  const [activeThread, setActiveThread] = useState(0);
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<ReactionType, number>>>(() => {
    const init: Record<string, Record<ReactionType, number>> = {};
    DISCUSSION_DATA.forEach((thread) => {
      thread.messages.forEach((msg) => {
        init[msg.id] = { ...msg.reactions };
      });
    });
    return init;
  });
  const [replyText, setReplyText] = useState("");
  const [replyPosted, setReplyPosted] = useState(false);

  const handleReact = (msgId: string, type: ReactionType) => {
    setReactionCounts((prev) => ({
      ...prev,
      [msgId]: {
        ...prev[msgId]!,
        [type]: (prev[msgId]![type] ?? 0) + 1,
      },
    }));
  };

  const handlePostReply = () => {
    if (!replyText.trim()) return;
    setReplyPosted(true);
    setReplyText("");
    setTimeout(() => setReplyPosted(false), 3000);
  };

  const thread = DISCUSSION_DATA[activeThread];

  // Top discussion-driven stock mentions across all threads
  const allMentions = DISCUSSION_DATA.flatMap((t) => t.mentions);
  const mentionCounts = allMentions.reduce<Record<string, number>>((acc, m) => {
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  const topMentions = Object.entries(mentionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Top mentions widget */}
      <div className="bg-card border border-border/50 rounded-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-semibold text-muted-foreground/80">Today&apos;s Hot Mentions</h3>
        </div>
        <div className="flex items-center gap-3">
          {topMentions.map(([ticker, count], i) => (
            <div key={ticker} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <span className={cn("text-xs font-bold", i === 0 ? "text-amber-400" : i === 1 ? "text-muted-foreground" : "text-amber-600")}>
                #{i + 1}
              </span>
              <span className="text-sm font-bold">{ticker}</span>
              <span className="text-xs text-muted-foreground">{count} mentions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Thread selector */}
      <div className="space-y-2">
        {DISCUSSION_DATA.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveThread(i)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-md border transition-colors",
              activeThread === i
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 bg-card hover:border-border/70",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t.topic}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{t.messages.length} replies</span>
                {t.mentions.length > 0 && (
                  <span className="text-primary/70">{t.mentions.join(", ")}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Active thread messages */}
      {thread && (
        <div className="bg-card border border-border/50 rounded-md p-4 space-y-4">
          <h3 className="text-sm font-semibold border-b border-border/30 pb-3">{thread.topic}</h3>
          <div className="space-y-4">
            {thread.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                reactions={reactionCounts[msg.id] ?? msg.reactions}
                onReact={(type) => handleReact(msg.id, type)}
              />
            ))}
          </div>

          {/* Reply input */}
          <div className="border-t border-border/30 pt-3">
            {replyPosted ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                Reply posted successfully!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePostReply()}
                  placeholder="Share your thoughts..."
                  className="flex-1 text-xs bg-muted/50 border border-border/50 rounded-lg px-3 py-2 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                />
                <button
                  onClick={handlePostReply}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <Send className="h-3 w-3" />
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type HubSection = "strategies" | "ideas" | "leaderboard" | "portfolios" | "discussion";

const HUB_SECTIONS: { key: HubSection; label: string; icon: React.ReactNode }[] = [
  { key: "strategies", label: "Trending Strategies", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { key: "ideas", label: "Trade Ideas", icon: <Target className="h-3.5 w-3.5" /> },
  { key: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-3.5 w-3.5" /> },
  { key: "portfolios", label: "Portfolio Transparency", icon: <BarChart2 className="h-3.5 w-3.5" /> },
  { key: "discussion", label: "Discussion", icon: <MessageSquare className="h-3.5 w-3.5" /> },
];

export default function SocialTradingHub() {
  const [activeSection, setActiveSection] = useState<HubSection>("strategies");

  return (
    <div className="space-y-5">
      {/* Section Nav */}
      <div className="flex items-center gap-1 bg-muted/40 rounded-md p-1 flex-wrap">
        {HUB_SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeSection === s.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeSection === "strategies" && <TrendingStrategiesSection />}
          {activeSection === "ideas" && <TradeIdeasFeedSection />}
          {activeSection === "leaderboard" && <LeaderboardRankingsSection />}
          {activeSection === "portfolios" && <PortfolioTransparencySection />}
          {activeSection === "discussion" && <DiscussionSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
