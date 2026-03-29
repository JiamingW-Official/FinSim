import { getTitleForLevel } from "@/types/game";

// ── League system ──────────────────────────────────────────────

export type LeagueTier = "bronze" | "silver" | "gold" | "diamond" | "alpha";

export interface LeagueInfo {
  tier: LeagueTier;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
}

export const LEAGUES: Record<LeagueTier, LeagueInfo> = {
  bronze: {
    tier: "bronze",
    label: "Bronze",
    emoji: "🥉",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    badgeClass: "",
  },
  silver: {
    tier: "silver",
    label: "Silver",
    emoji: "🥈",
    color: "text-gray-300",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30",
    badgeClass: "badge-premium",
  },
  gold: {
    tier: "gold",
    label: "Gold",
    emoji: "🥇",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    badgeClass: "badge-gold",
  },
  diamond: {
    tier: "diamond",
    label: "Diamond",
    emoji: "💎",
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    badgeClass: "badge-diamond",
  },
  alpha: {
    tier: "alpha",
    label: "Alpha",
    emoji: "👑",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-border",
    badgeClass: "badge-alpha",
  },
};

export function getLeagueForLevel(level: number): LeagueTier {
  if (level >= 45) return "alpha";
  if (level >= 36) return "diamond";
  if (level >= 21) return "gold";
  if (level >= 11) return "silver";
  return "bronze";
}

// Re-export for convenience
export { getTitleForLevel } from "@/types/game";

// ── Leaderboard dimensions ─────────────────────────────────────

export type LeaderboardDimension =
  | "total_pnl"
  | "sharpe_ratio"
  | "win_rate"
  | "longest_streak"
  | "speed_race"
  | "risk_control"
  | "xp_ranking";

export interface LeaderboardEntry {
  id: string;
  name: string;
  isUser: boolean;
  level: number;
  title: string;
  league: LeagueTier;
  avatarSeed: number;
  totalPnL: number;
  sharpeRatio: number;
  winRate: number;
  longestStreak: number;
  totalTrades: number;
  maxDrawdownPct: number;
  xp: number;
  achievementCount: number;
}

export interface RankedEntry extends LeaderboardEntry {
  rank: number;
}

export interface DimensionConfig {
  id: LeaderboardDimension;
  label: string;
  shortLabel: string;
  icon: string;
  format: (value: number) => string;
  getValue: (entry: LeaderboardEntry) => number;
  sortDescending: boolean;
}

function formatCompactCurrency(v: number): string {
  const abs = Math.abs(v);
  const sign = v >= 0 ? "+" : "-";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export const DIMENSIONS: DimensionConfig[] = [
  {
    id: "total_pnl",
    label: "Total P&L",
    shortLabel: "P&L",
    icon: "DollarSign",
    sortDescending: true,
    getValue: (e) => e.totalPnL,
    format: formatCompactCurrency,
  },
  {
    id: "win_rate",
    label: "Win Rate",
    shortLabel: "Win %",
    icon: "Target",
    sortDescending: true,
    getValue: (e) => e.winRate,
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: "sharpe_ratio",
    label: "Sharpe Ratio",
    shortLabel: "Sharpe",
    icon: "TrendingUp",
    sortDescending: true,
    getValue: (e) => e.sharpeRatio,
    format: (v) => v.toFixed(2),
  },
  {
    id: "longest_streak",
    label: "Win Streak",
    shortLabel: "Streak",
    icon: "Flame",
    sortDescending: true,
    getValue: (e) => e.longestStreak,
    format: (v) => `${v}`,
  },
  {
    id: "speed_race",
    label: "Most Trades",
    shortLabel: "Trades",
    icon: "Zap",
    sortDescending: true,
    getValue: (e) => e.totalTrades,
    format: (v) => `${v}`,
  },
  {
    id: "risk_control",
    label: "Risk Control",
    shortLabel: "Risk",
    icon: "ShieldCheck",
    sortDescending: false,
    getValue: (e) => e.maxDrawdownPct,
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: "xp_ranking",
    label: "XP Ranking",
    shortLabel: "XP",
    icon: "Star",
    sortDescending: true,
    getValue: (e) => e.xp,
    format: (v) => v.toLocaleString(),
  },
];
