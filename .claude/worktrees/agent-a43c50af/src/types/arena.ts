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
  /** SVG icon type: "shield" | "diamond" | "star" */
  iconType: "shield" | "diamond" | "star";
  color: string;
  bgColor: string;
  borderColor: string;
  minElo: number;
  maxElo: number | null;
}

export const ARENA_RANKS: Record<ArenaRank, ArenaRankInfo> = {
  bronze:   { rank: "bronze",   label: "Bronze",   iconType: "shield",  color: "text-orange-400",  bgColor: "bg-orange-500/10",  borderColor: "border-orange-500/30",  minElo: 0,    maxElo: 1099 },
  silver:   { rank: "silver",   label: "Silver",   iconType: "shield",  color: "text-gray-300",    bgColor: "bg-gray-400/10",    borderColor: "border-gray-400/30",    minElo: 1100, maxElo: 1299 },
  gold:     { rank: "gold",     label: "Gold",     iconType: "shield",  color: "text-amber-400",   bgColor: "bg-amber-500/10",   borderColor: "border-amber-500/30",   minElo: 1300, maxElo: 1499 },
  platinum: { rank: "platinum", label: "Platinum", iconType: "diamond", color: "text-teal-400",    bgColor: "bg-teal-500/10",    borderColor: "border-teal-500/30",    minElo: 1500, maxElo: 1699 },
  diamond:  { rank: "diamond",  label: "Diamond",  iconType: "diamond", color: "text-cyan-400",    bgColor: "bg-cyan-500/10",    borderColor: "border-cyan-500/30",    minElo: 1700, maxElo: null },
  master:   { rank: "master",   label: "Master",   iconType: "star",    color: "text-purple-400",  bgColor: "bg-purple-500/10",  borderColor: "border-purple-500/30",  minElo: 2200, maxElo: null },
};

export const ARENA_RANK_ORDER: ArenaRank[] = ["bronze", "silver", "gold", "platinum", "diamond", "master"];

export function getArenaRankForElo(elo: number): ArenaRank {
  if (elo >= 2200) return "master";
  if (elo >= 1700) return "diamond";
  if (elo >= 1500) return "platinum";
  if (elo >= 1300) return "gold";
  if (elo >= 1100) return "silver";
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
