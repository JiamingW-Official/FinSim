import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { generateNPCs } from "@/data/leaderboard/npc-generator";
import { getLeagueForLevel, DIMENSIONS } from "@/types/leaderboard";
import { INITIAL_CAPITAL } from "@/types/trading";
import type { LeaderboardEntry, LeaderboardDimension, RankedEntry } from "@/types/leaderboard";

export function useLeaderboard(dimension: LeaderboardDimension) {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const equityHistory = useTradingStore((s) => s.equityHistory);

  // NPCs are deterministic — compute once
  const npcs = useMemo(() => generateNPCs(), []);

  // Build user entry from live store data
  const userEntry = useMemo<LeaderboardEntry>(() => {
    const totalPnL = portfolioValue - INITIAL_CAPITAL + stats.totalPnL;

    // Win rate
    const winRate =
      stats.totalTrades > 0
        ? (stats.profitableTrades / stats.totalTrades) * 100
        : 0;

    // Sharpe ratio from equity snapshots
    let sharpeRatio = 0;
    if (equityHistory.length >= 2) {
      const returns: number[] = [];
      for (let i = 1; i < equityHistory.length; i++) {
        const prev = equityHistory[i - 1].portfolioValue;
        const curr = equityHistory[i].portfolioValue;
        if (prev > 0) returns.push((curr - prev) / prev);
      }
      if (returns.length > 0) {
        const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
        const std = Math.sqrt(
          returns.reduce((sum, r) => sum + (r - avg) ** 2, 0) / returns.length,
        );
        sharpeRatio = std > 0 ? (avg / std) * Math.sqrt(252) : 0;
      }
    }

    // Max drawdown from equity history
    let maxDrawdown = 0;
    let peak = INITIAL_CAPITAL;
    for (const snap of equityHistory) {
      if (snap.portfolioValue > peak) peak = snap.portfolioValue;
      const dd = ((peak - snap.portfolioValue) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // Weekly P&L: sum trades from the last 7 days
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeklyPnL = tradeHistory
      .filter((t) => now - t.timestamp < weekMs)
      .reduce((sum, t) => sum + t.realizedPnL, 0);

    return {
      id: "user",
      name: "You",
      isUser: true,
      level,
      title,
      league: getLeagueForLevel(level),
      avatarSeed: 0,
      totalPnL: Math.round(totalPnL * 100) / 100,
      weeklyPnL: Math.round(weeklyPnL * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
      longestStreak: stats.consecutiveWins,
      totalTrades: stats.totalTrades,
      maxDrawdownPct: Math.round(maxDrawdown * 10) / 10,
      xp,
      achievementCount: achievements.filter((a) => a.unlockedAt > 0).length,
    };
  }, [xp, level, title, stats, achievements, portfolioValue, equityHistory]);

  // Merge + sort + assign ranks
  const ranked = useMemo<RankedEntry[]>(() => {
    const dimConfig = DIMENSIONS.find((d) => d.id === dimension)!;
    const all = [...npcs, userEntry];

    all.sort((a, b) => {
      const va = dimConfig.getValue(a);
      const vb = dimConfig.getValue(b);
      return dimConfig.sortDescending ? vb - va : va - vb;
    });

    return all.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [npcs, userEntry, dimension]);

  const userRank = ranked.find((e) => e.isUser)!;

  return { ranked, userRank, userEntry };
}
