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
  xpReward?: number;
  category?: "trading" | "learning" | "social" | "milestones";
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
  dailyStreak: number;
  lastTradeDate: string;
  comboCount: number;
  optionsTradesCount: number;
  optionsSpreadsCount: number;
  optionsCondorsCount: number;
  optionsTotalPnL: number;
  optionsAnalysisViewed: boolean;
  unusualActivityViewed: boolean;
  // new fields
  optionsChainViewed: number;
  lessonsCompleted: number;
  predictionsCorrect: number;
  portfolioValue: number;
  tradesTodayPnLs: number[];   // P&L list for trades on current date (for perfect_day)
  tradesTodayDate: string;     // date key for tradesTodayPnLs
  maxDrawdownTrades: number;   // consecutive trades tracked for risk_master
  maxDrawdownStreak: number;   // best (lowest-drawdown) streak so far
  currentLowDrawdownStreak: number; // current streak of trades with drawdown < 5%
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
  dailyStreak: 0,
  lastTradeDate: "",
  comboCount: 0,
  optionsTradesCount: 0,
  optionsSpreadsCount: 0,
  optionsCondorsCount: 0,
  optionsTotalPnL: 0,
  optionsAnalysisViewed: false,
  unusualActivityViewed: false,
  optionsChainViewed: 0,
  lessonsCompleted: 0,
  predictionsCorrect: 0,
  portfolioValue: 100000,
  tradesTodayPnLs: [],
  tradesTodayDate: "",
  maxDrawdownTrades: 0,
  maxDrawdownStreak: 0,
  currentLowDrawdownStreak: 0,
};

// Lesson score breakdown — multi-dimensional scoring
export interface LessonScoreBreakdown {
  quizPoints: number;
  quizMaxPoints: number;
  speedBonus: number;
  comboBonus: number;
  practiceBonus: number;
  totalPoints: number;
  maxPoints: number;
  grade: "S" | "A" | "B" | "C";
  accuracy: number;
  bestCombo: number;
}

export function calculateGrade(ratio: number): "S" | "A" | "B" | "C" {
  if (ratio >= 0.95) return "S";
  if (ratio >= 0.80) return "A";
  if (ratio >= 0.60) return "B";
  return "C";
}

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
    xpReward: 25,
    category: "trading",
    condition: (s) => s.totalTrades >= 1,
  },
  {
    id: "first_profit",
    name: "First Blood",
    description: "Make your first profitable trade",
    icon: "TrendingUp",
    xpReward: 50,
    category: "trading",
    condition: (s) => s.profitableTrades >= 1,
  },
  {
    id: "five_streak",
    name: "Hot Streak",
    description: "Win 5 trades in a row",
    icon: "Flame",
    xpReward: 200,
    category: "trading",
    condition: (s) => s.consecutiveWins >= 5,
  },
  {
    id: "ten_trades",
    name: "Getting Started",
    description: "Complete 10 trades",
    icon: "Activity",
    xpReward: 100,
    category: "trading",
    condition: (s) => s.totalTrades >= 10,
  },
  {
    id: "fifty_trades",
    name: "Seasoned",
    description: "Complete 50 trades",
    icon: "Award",
    xpReward: 250,
    category: "milestones",
    condition: (s) => s.totalTrades >= 50,
  },
  {
    id: "short_seller",
    name: "Bear Mode",
    description: "Complete a short sale",
    icon: "TrendingDown",
    xpReward: 50,
    category: "trading",
    condition: (s) => s.shortTradesCount >= 1,
  },
  {
    id: "limit_master",
    name: "Patient Trader",
    description: "Use 5 limit orders",
    icon: "Target",
    xpReward: 75,
    category: "trading",
    condition: (s) => s.limitOrdersUsed >= 5,
  },
  {
    id: "big_win",
    name: "Jackpot",
    description: "Make $5,000+ on a single trade",
    icon: "DollarSign",
    xpReward: 300,
    category: "trading",
    condition: (s) => s.largestWin >= 5000,
  },
  {
    id: "diversified",
    name: "Diversified",
    description: "Trade 5 different stocks",
    icon: "Layers",
    xpReward: 100,
    category: "trading",
    condition: (s) => s.uniqueTickersTraded.length >= 5,
  },
  {
    id: "on_a_roll",
    name: "On A Roll",
    description: "3-day trading streak",
    icon: "Flame",
    xpReward: 75,
    category: "milestones",
    condition: (s) => s.dailyStreak >= 3,
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "7-day trading streak",
    icon: "Flame",
    xpReward: 150,
    category: "milestones",
    condition: (s) => s.dailyStreak >= 7,
  },
  {
    id: "combo_master",
    name: "Unstoppable",
    description: "Reach a 5x combo",
    icon: "Zap",
    xpReward: 150,
    category: "trading",
    condition: (s) => s.comboCount >= 5,
  },
  {
    id: "options_first",
    name: "Options Initiate",
    description: "Place your first options trade",
    icon: "Activity",
    xpReward: 50,
    category: "trading",
    condition: (s) => s.optionsTradesCount >= 1,
  },
  {
    id: "options_spread",
    name: "Spread Eagle",
    description: "Execute a spread strategy",
    icon: "GitBranch",
    xpReward: 100,
    category: "trading",
    condition: (s) => s.optionsSpreadsCount >= 1,
  },
  {
    id: "options_iron_condor",
    name: "Iron Will",
    description: "Execute an Iron Condor",
    icon: "Shield",
    xpReward: 150,
    category: "trading",
    condition: (s) => s.optionsCondorsCount >= 1,
  },
  {
    id: "options_profit_1k",
    name: "Premium Collector",
    description: "Earn $1,000+ from options trades",
    icon: "DollarSign",
    xpReward: 200,
    category: "trading",
    condition: (s) => s.optionsTotalPnL >= 1000,
  },
  {
    id: "vol_analyst",
    name: "Volatility Analyst",
    description: "Study the Analysis dashboard",
    icon: "LineChart",
    xpReward: 50,
    category: "learning",
    condition: (s) => s.optionsAnalysisViewed,
  },
  {
    id: "flow_watcher",
    name: "Flow Watcher",
    description: "Investigate unusual options activity",
    icon: "Eye",
    xpReward: 50,
    category: "learning",
    condition: (s) => s.unusualActivityViewed,
  },
  {
    id: "condor_master",
    name: "Iron Condor Master",
    description: "Execute 3 Iron Condor strategies",
    icon: "Shield",
    xpReward: 300,
    category: "trading",
    condition: (s) => s.optionsCondorsCount >= 3,
  },
  {
    id: "options_millionaire",
    name: "Options Millionaire",
    description: "Earn $10,000+ from options trades",
    icon: "Trophy",
    xpReward: 500,
    category: "milestones",
    condition: (s) => s.optionsTotalPnL >= 10000,
  },
  // New achievements (Task 2)
  {
    id: "win_streak_5",
    name: "Hot Streak",
    description: "Win 5 trades in a row",
    icon: "Flame",
    xpReward: 200,
    category: "trading",
    condition: (s) => s.consecutiveWins >= 5,
  },
  {
    id: "perfect_day",
    name: "Perfect Day",
    description: "Green on every trade in a day (min 3)",
    icon: "Sun",
    xpReward: 150,
    category: "trading",
    condition: (s) =>
      s.tradesTodayPnLs.length >= 3 &&
      s.tradesTodayPnLs.every((p) => p > 0),
  },
  {
    id: "risk_master",
    name: "Risk Master",
    description: "Keep max drawdown under 5% for 20 trades",
    icon: "Shield",
    xpReward: 300,
    category: "trading",
    condition: (s) => s.maxDrawdownStreak >= 20,
  },
  {
    id: "options_explorer",
    name: "Options Explorer",
    description: "View the options chain 10 times",
    icon: "BarChart2",
    xpReward: 75,
    category: "learning",
    condition: (s) => s.optionsChainViewed >= 10,
  },
  {
    id: "lesson_complete_5",
    name: "Student",
    description: "Complete 5 lessons",
    icon: "BookOpen",
    xpReward: 100,
    category: "learning",
    condition: (s) => s.lessonsCompleted >= 5,
  },
  {
    id: "lesson_complete_20",
    name: "Scholar",
    description: "Complete 20 lessons",
    icon: "GraduationCap",
    xpReward: 300,
    category: "learning",
    condition: (s) => s.lessonsCompleted >= 20,
  },
  {
    id: "prediction_correct_5",
    name: "Oracle",
    description: "Get 5 predictions correct",
    icon: "Target",
    xpReward: 200,
    category: "milestones",
    condition: (s) => s.predictionsCorrect >= 5,
  },
  {
    id: "portfolio_10k",
    name: "Growing Up",
    description: "Reach $110,000 portfolio value",
    icon: "DollarSign",
    xpReward: 250,
    category: "milestones",
    condition: (s) => s.portfolioValue >= 110000,
  },
];

// Learning achievements — checked separately by learn-store
export interface LearningAchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (completedLessons: string[], lessonScores: Record<string, LessonScoreBreakdown>, learningStreak: number) => boolean;
}

export const LEARNING_ACHIEVEMENT_DEFS: LearningAchievementDef[] = [
  {
    id: "quick_learner",
    name: "Quick Learner",
    description: "Complete 5 lessons",
    icon: "BookOpen",
    condition: (cl) => cl.length >= 5,
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Complete all 20 lessons",
    icon: "GraduationCap",
    condition: (cl) => cl.length >= 20,
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Get S rank on any lesson",
    icon: "Star",
    condition: (_cl, scores) => Object.values(scores).some((s) => s.grade === "S"),
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "7-day learning streak",
    icon: "Flame",
    condition: (_cl, _scores, streak) => streak >= 7,
  },
  {
    id: "s_rank",
    name: "S-Rank Master",
    description: "Get S rank on 10 lessons",
    icon: "Crown",
    condition: (_cl, scores) => Object.values(scores).filter((s) => s.grade === "S").length >= 10,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Earn 50+ speed bonus in one lesson",
    icon: "Zap",
    condition: (_cl, scores) => Object.values(scores).some((s) => s.speedBonus >= 50),
  },
  {
    id: "combo_king",
    name: "Combo King",
    description: "Achieve a 5x combo streak",
    icon: "Flame",
    condition: (_cl, scores) => Object.values(scores).some((s) => s.bestCombo >= 5),
  },
  {
    id: "profitable_student",
    name: "Profitable Student",
    description: "Earn practice bonus in 5 lessons",
    icon: "TrendingUp",
    condition: (_cl, scores) => Object.values(scores).filter((s) => s.practiceBonus > 0).length >= 5,
  },
];

// Mini-game achievements — checked by flashcard/prediction/daily-rewards stores
export interface MiniGameAchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const MINIGAME_ACHIEVEMENT_DEFS: MiniGameAchievementDef[] = [
  {
    id: "flashcard_starter",
    name: "Card Sharp",
    description: "Review 10 flashcards",
    icon: "Brain",
  },
  {
    id: "flashcard_master",
    name: "Walking Encyclopedia",
    description: "Reach 80% mastery on all cards",
    icon: "GraduationCap",
  },
  {
    id: "prediction_streak_5",
    name: "Crystal Ball",
    description: "Predict 5 candles correctly in a row",
    icon: "Eye",
  },
  {
    id: "prediction_streak_10",
    name: "Market Oracle",
    description: "Predict 10 candles correctly in a row",
    icon: "Sparkles",
  },
  {
    id: "daily_reward_7",
    name: "Dedicated Trader",
    description: "Claim all 7 days in a reward cycle",
    icon: "Gift",
  },
  {
    id: "first_backtest",
    name: "Lab Rat",
    description: "Run your first backtest",
    icon: "FlaskConical",
  },
  {
    id: "profitable_strategy",
    name: "Alpha Found",
    description: "Create a profitable strategy",
    icon: "TrendingUp",
  },
  {
    id: "sharpe_above_1",
    name: "Risk Adjusted",
    description: "Achieve Sharpe ratio above 1.0",
    icon: "Shield",
  },
  {
    id: "ten_backtests",
    name: "Systematic Thinker",
    description: "Run 10 backtests",
    icon: "BarChart3",
  },
  {
    id: "s_rank_backtest",
    name: "Master Strategist",
    description: "Get S grade on a backtest",
    icon: "Crown",
  },
  // Quest achievements
  {
    id: "quest_first",
    name: "Quest Seeker",
    description: "Complete your first quest",
    icon: "ScrollText",
  },
  {
    id: "quest_daily_streak_7",
    name: "Daily Devotion",
    description: "Complete all daily quests 7 days in a row",
    icon: "Flame",
  },
  // Arena achievements
  {
    id: "arena_first_win",
    name: "Gladiator",
    description: "Win your first arena match",
    icon: "Swords",
  },
  {
    id: "arena_gold",
    name: "Golden Fighter",
    description: "Reach Gold rank in Arena",
    icon: "Medal",
  },
  {
    id: "arena_streak_5",
    name: "Unstoppable Force",
    description: "Win 5 arena matches in a row",
    icon: "Flame",
  },
  // Season achievements
  {
    id: "season_tier_10",
    name: "Season Veteran",
    description: "Reach tier 10 in a season",
    icon: "Star",
  },
  {
    id: "season_tier_20",
    name: "Season Champion",
    description: "Reach tier 20 in a season",
    icon: "Trophy",
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
