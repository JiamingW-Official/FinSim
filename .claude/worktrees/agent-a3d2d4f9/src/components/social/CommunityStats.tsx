"use client";

import { useMemo } from "react";
import { Users, BarChart3, TrendingUp, Target, Flame, Award } from "lucide-react";

// mulberry32 PRNG — consistent with the rest of the codebase
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STRATEGY_NAMES = [
  "Bull Call Spread",
  "Iron Condor",
  "Covered Call",
  "Cash-Secured Put",
  "Momentum Long",
  "Straddle",
  "Protective Put",
  "LEAPS",
];

const CHALLENGE_NAMES = [
  "Iron Condor challenge",
  "Bull Call Spread challenge",
  "10-trade streak challenge",
  "First Profit challenge",
  "Options Basics challenge",
  "Swing Trading challenge",
  "Risk Management challenge",
  "Earnings Play challenge",
];

const TICKER_NAMES = ["AAPL", "TSLA", "NVDA", "SPY", "MSFT", "AMZN", "META", "QQQ"];

interface CommunityStat {
  id: string;
  icon: React.ElementType;
  text: string;
}

function generateCommunityStats(daySeed: number): CommunityStat[] {
  const rng = mulberry32(daySeed);

  const challengeIndex = Math.floor(rng() * CHALLENGE_NAMES.length);
  const challengeCount = Math.floor(rng() * 300) + 80; // 80–379

  const strategyIndex = Math.floor(rng() * STRATEGY_NAMES.length);

  const avgWinRate = (rng() * 12 + 50).toFixed(1); // 50.0–62.0%

  const activeTradersToday = Math.floor(rng() * 800) + 200; // 200–999

  const tickerIndex = Math.floor(rng() * TICKER_NAMES.length);
  const tickerCount = Math.floor(rng() * 150) + 50; // 50–199

  const streakCount = Math.floor(rng() * 60) + 15; // 15–74

  const avgPnLPct = (rng() * 4 + 0.5).toFixed(1); // 0.5–4.5%

  const lessonsCompleted = Math.floor(rng() * 500) + 100; // 100–599

  const optionsTradesCount = Math.floor(rng() * 200) + 40; // 40–239

  return [
    {
      id: "challenge",
      icon: Award,
      text: `${challengeCount} traders completed the ${CHALLENGE_NAMES[challengeIndex]} today`,
    },
    {
      id: "strategy",
      icon: TrendingUp,
      text: `Most popular strategy this week: ${STRATEGY_NAMES[strategyIndex]}`,
    },
    {
      id: "winrate",
      icon: Target,
      text: `Average win rate this week: ${avgWinRate}%`,
    },
    {
      id: "active",
      icon: Users,
      text: `${activeTradersToday} traders active today`,
    },
    {
      id: "ticker",
      icon: BarChart3,
      text: `${tickerCount} traders bought ${TICKER_NAMES[tickerIndex]} today`,
    },
    {
      id: "streak",
      icon: Flame,
      text: `${streakCount} traders are on a 7+ day streak`,
    },
    {
      id: "pnl",
      icon: TrendingUp,
      text: `Average P&L this week: +${avgPnLPct}%`,
    },
    {
      id: "lessons",
      icon: Award,
      text: `${lessonsCompleted} lessons completed by the community today`,
    },
    {
      id: "options",
      icon: BarChart3,
      text: `${optionsTradesCount} options trades placed in the last 24 hours`,
    },
    {
      id: "rank",
      icon: Flame,
      text: `Top 10% of traders averaged ${(rng() * 8 + 5).toFixed(1)}% return this week`,
    },
  ];
}

// Seed changes once per calendar day
function getDaySeed(): number {
  return Math.floor(Date.now() / 86_400_000);
}

export function CommunityStats() {
  const daySeed = getDaySeed();
  const stats = useMemo(() => generateCommunityStats(daySeed), [daySeed]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Community Activity</span>
          <span className="ml-auto text-[9px] text-muted-foreground">
            Updated daily
          </span>
        </div>
      </div>

      {/* Stats list */}
      <div className="divide-y divide-border/40">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="flex items-start gap-3 px-4 py-2.5">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-[11px] leading-snug text-muted-foreground">{stat.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
