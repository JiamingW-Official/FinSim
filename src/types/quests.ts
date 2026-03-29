// ── Quest condition snapshot ────────────────────────────────────
// Flat object aggregating stats from ALL stores for condition evaluation.
// Built once per check cycle by quest-store.buildSnapshot().

export interface QuestConditionSnapshot {
  // GameStore cumulative
  totalTrades: number;
  profitableTrades: number;
  totalPnL: number;
  consecutiveWins: number;
  uniqueTickersTraded: number;
  shortTradesCount: number;
  limitOrdersUsed: number;
  dailyStreak: number;
  comboCount: number;
  xp: number;
  level: number;
  achievementCount: number;

  // LearnStore cumulative
  completedLessonsCount: number;
  sRankLessons: number;
  learningStreak: number;

  // TradingStore cumulative
  portfolioValue: number;
  tradeHistoryCount: number;

  // ChallengeStore cumulative
  totalDailyChallengesCompleted: number;
  scenariosCompleted: number;
  sRankScenarios: number;

  // BacktestStore cumulative
  totalBacktestsRun: number;
  savedStrategiesCount: number;

  // FlashcardStore cumulative
  totalCardsReviewed: number;
  overallMastery: number;

  // PredictionStore cumulative
  totalPredictions: number;
  correctPredictions: number;
  predictionBestStreak: number;

  // Session-scoped (reset daily/weekly by quest store)
  sessionTradesCount: number;
  sessionProfitableTrades: number;
  sessionPnL: number;
  sessionLessonsCompleted: number;
  sessionSRankLessons: number;
  sessionChallengesCompleted: number;
  sessionBacktestsRun: number;
  sessionCardsReviewed: number;
  sessionPredictions: number;
  sessionCorrectPredictions: number;
  sessionArenaWins: number;
  sessionArenaMatches: number;
  sessionXPEarned: number;
}

// ── Quest condition ────────────────────────────────────────────

export interface QuestCondition {
  field: keyof QuestConditionSnapshot;
  operator: ">=" | ">" | "==" | "<=";
  target: number;
  label: string;
}

// ── Quest reward ───────────────────────────────────────────────

export type QuestRewardType = "xp" | "title" | "strategy_template";

export interface QuestReward {
  type: QuestRewardType;
  value: number | string;
  label: string;
}

// ── Quest definition ───────────────────────────────────────────

export type QuestCategory = "daily" | "weekly" | "milestone";

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: QuestCategory;
  conditions: QuestCondition[];
  rewards: QuestReward[];
  xpReward: number;
  /** Navigation route for "Go Complete" button (e.g. "/trade", "/learn") */
  route?: string;
  /** For milestone chains — group ID */
  chainId?: string;
  /** For milestone chains — position in chain (0-based) */
  chainIndex?: number;
}

// ── Quest progress ─────────────────────────────────────────────

export interface QuestProgress {
  questId: string;
  conditions: boolean[];
  isComplete: boolean;
  claimedAt: number | null;
}

// ── Milestone chain info ───────────────────────────────────────

export interface MilestoneChain {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const MILESTONE_CHAINS: MilestoneChain[] = [
  { id: "trading", name: "Trading Path", icon: "BarChart3", color: "text-emerald-400" },
  { id: "learning", name: "Scholar Path", icon: "GraduationCap", color: "text-amber-400" },
  { id: "challenge", name: "Challenger Path", icon: "Swords", color: "text-rose-400" },
  { id: "backtest", name: "Quant Path", icon: "FlaskConical", color: "text-primary" },
  { id: "mastery", name: "Mastery Path", icon: "Crown", color: "text-primary" },
];
