export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: PlayerStats) => boolean;
}

export interface PlayerStats {
  totalTrades: number;
  profitableTrades: number;
  totalPnL: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  largestWin: number;
  largestLoss: number;
  uniqueTickersTraded: string[];
  shortTradesCount: number;
  limitOrdersUsed: number;
}

export const INITIAL_STATS: PlayerStats = {
  totalTrades: 0,
  profitableTrades: 0,
  totalPnL: 0,
  consecutiveWins: 0,
  consecutiveLosses: 0,
  largestWin: 0,
  largestLoss: 0,
  uniqueTickersTraded: [],
  shortTradesCount: 0,
  limitOrdersUsed: 0,
};

// XP required to reach each level (index 0 = level 1)
export const LEVEL_THRESHOLDS: number[] = Array.from({ length: 50 }, (_, i) =>
  Math.floor(100 * Math.pow(1.15, i)),
);

export const LEVEL_TITLES: Record<number, string> = {
  1: "Rookie",
  5: "Apprentice",
  10: "Trader",
  15: "Skilled Trader",
  20: "Veteran",
  25: "Pro",
  30: "Expert",
  35: "Master",
  40: "Grandmaster",
  45: "Legend",
  50: "Alpha Legend",
};

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_trade",
    name: "First Steps",
    description: "Complete your first trade",
    icon: "Zap",
    condition: (s) => s.totalTrades >= 1,
  },
  {
    id: "first_profit",
    name: "In The Green",
    description: "Close a trade with profit",
    icon: "TrendingUp",
    condition: (s) => s.profitableTrades >= 1,
  },
  {
    id: "five_streak",
    name: "Hot Streak",
    description: "Win 5 trades in a row",
    icon: "Flame",
    condition: (s) => s.consecutiveWins >= 5,
  },
  {
    id: "ten_trades",
    name: "Getting Started",
    description: "Complete 10 trades",
    icon: "BarChart3",
    condition: (s) => s.totalTrades >= 10,
  },
  {
    id: "fifty_trades",
    name: "Seasoned",
    description: "Complete 50 trades",
    icon: "Award",
    condition: (s) => s.totalTrades >= 50,
  },
  {
    id: "short_seller",
    name: "Bear Mode",
    description: "Complete a short sale",
    icon: "TrendingDown",
    condition: (s) => s.shortTradesCount >= 1,
  },
  {
    id: "limit_master",
    name: "Patient Trader",
    description: "Use 5 limit orders",
    icon: "Target",
    condition: (s) => s.limitOrdersUsed >= 5,
  },
  {
    id: "big_win",
    name: "Jackpot",
    description: "Make $5,000+ on a single trade",
    icon: "DollarSign",
    condition: (s) => s.largestWin >= 5000,
  },
  {
    id: "diversified",
    name: "Diversified",
    description: "Trade 5 different stocks",
    icon: "Layers",
    condition: (s) => s.uniqueTickersTraded.length >= 5,
  },
];

export function getLevelForXP(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else break;
  }
  return Math.min(level, 50);
}

export function getTitleForLevel(level: number): string {
  let title = "Rookie";
  for (const [lvl, t] of Object.entries(LEVEL_TITLES)) {
    if (level >= Number(lvl)) title = t;
  }
  return title;
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 50) return LEVEL_THRESHOLDS[49];
  return LEVEL_THRESHOLDS[currentLevel];
}
