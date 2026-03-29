import type { BarGenConfig } from "@/data/lessons/practice-data";

// ── Arena types ────────────────────────────────────────────────

export type ArenaType =
  | "speed_trading"
  | "trend_catching"
  | "risk_control"
  | "reversal_hunter"
  | "scalp_master";

export interface ArenaTypeConfig {
  id: ArenaType;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  timeLimitSeconds: number;
  barCount: number;
  startPrice: number;
  scoringWeights: {
    pnl: number;
    riskControl: number;
    efficiency: number;
    speed: number;
  };
  barGenConfig: Partial<BarGenConfig>;
}

// ── Arena NPC ──────────────────────────────────────────────────

export type ArenaPersonality = "aggressive" | "conservative" | "balanced" | "momentum";

export interface ArenaNPC {
  id: string;
  name: string;
  rank: ArenaRank;
  elo: number;
  avatarSeed: number;
  skillLevel: number; // 0.0 - 1.0
  personality: ArenaPersonality;
}

// ── Arena match result ─────────────────────────────────────────

export interface ArenaMatchResult {
  matchId: string;
  arenaType: ArenaType;
  opponentId: string;
  opponentName: string;

  // Player
  playerPnL: number;
  playerPnLPercent: number;
  playerMaxDrawdown: number;
  playerTradesCount: number;
  playerWinRate: number;
  playerScore: number;

  // Opponent (simulated)
  opponentPnL: number;
  opponentPnLPercent: number;
  opponentScore: number;

  // Outcome
  playerWon: boolean;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  xpEarned: number;

  // Timing
  timeLimitSeconds: number;
  timeUsedSeconds: number;
  completedAt: number;
}

// ── Arena ranks ────────────────────────────────────────────────

export type ArenaRank = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master";

export interface ArenaRankInfo {
  rank: ArenaRank;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  minElo: number;
}

export const ARENA_RANKS: Record<ArenaRank, ArenaRankInfo> = {
  bronze:   { rank: "bronze",   label: "Bronze",   emoji: "🥉", color: "text-orange-400",  bgColor: "bg-orange-500/10",  borderColor: "border-orange-500/30",  minElo: 0 },
  silver:   { rank: "silver",   label: "Silver",   emoji: "🥈", color: "text-gray-300",    bgColor: "bg-gray-400/10",    borderColor: "border-gray-400/30",    minElo: 800 },
  gold:     { rank: "gold",     label: "Gold",     emoji: "🥇", color: "text-amber-400",   bgColor: "bg-amber-500/10",   borderColor: "border-amber-500/30",   minElo: 1200 },
  platinum: { rank: "platinum", label: "Platinum", emoji: "💠", color: "text-emerald-400",    bgColor: "bg-emerald-500/10",    borderColor: "border-emerald-500/30",    minElo: 1600 },
  diamond:  { rank: "diamond",  label: "Diamond",  emoji: "💎", color: "text-muted-foreground",    bgColor: "bg-muted/30",    borderColor: "border-border",    minElo: 2000 },
  master:   { rank: "master",   label: "Master",   emoji: "👑", color: "text-primary",  bgColor: "bg-primary/10",  borderColor: "border-border",  minElo: 2500 },
};

export const ARENA_RANK_ORDER: ArenaRank[] = ["bronze", "silver", "gold", "platinum", "diamond", "master"];

export function getArenaRankForElo(elo: number): ArenaRank {
  if (elo >= 2500) return "master";
  if (elo >= 2000) return "diamond";
  if (elo >= 1600) return "platinum";
  if (elo >= 1200) return "gold";
  if (elo >= 800)  return "silver";
  return "bronze";
}

/** Standard ELO change calculation with K-factor 32 */
export function calculateEloChange(playerElo: number, opponentElo: number, playerWon: boolean): number {
  const K = 32;
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actual = playerWon ? 1 : 0;
  return Math.round(K * (actual - expected));
}

/** Calculate composite arena score from individual metrics */
export function calculateArenaScore(
  weights: ArenaTypeConfig["scoringWeights"],
  pnlPercent: number,
  maxDrawdownPercent: number,
  winRate: number,
  tradesPerMinute: number,
): number {
  // Normalize each component to 0-100 range
  const pnlScore = Math.max(0, Math.min(100, 50 + pnlPercent * 10));
  const riskScore = Math.max(0, Math.min(100, 100 - maxDrawdownPercent * 5));
  const efficiencyScore = Math.max(0, Math.min(100, winRate));
  const speedScore = Math.max(0, Math.min(100, tradesPerMinute * 20));

  return Math.round(
    pnlScore * weights.pnl +
    riskScore * weights.riskControl +
    efficiencyScore * weights.efficiency +
    speedScore * weights.speed,
  );
}
