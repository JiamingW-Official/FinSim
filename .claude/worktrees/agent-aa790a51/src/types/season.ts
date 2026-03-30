// ── Season reward tiers ────────────────────────────────────────

export interface SeasonRewardTier {
  tier: number; // 1-20
  xpRequired: number;
  reward: {
    type: "xp" | "title" | "badge" | "xp_boost";
    value: string | number;
    label: string;
    icon: string;
  };
}

// ── Season definition ──────────────────────────────────────────

export interface SeasonAchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface SeasonDefinition {
  id: string;           // "season_2026_03"
  name: string;         // "Season of the Bull"
  theme: string;
  startDate: string;    // "2026-03-01"
  endDate: string;      // "2026-03-31"
  rewardTiers: SeasonRewardTier[];
  specialAchievements: SeasonAchievementDef[];
}

// ── Season progress ────────────────────────────────────────────

export interface SeasonProgress {
  seasonId: string;
  seasonXP: number;
  highestTierClaimed: number;
  achievements: string[];
  weeklyXPHistory: number[];
}

// ── Season XP sources ──────────────────────────────────────────
// Central mapping of all activities to season XP amounts.

export const SEASON_XP_SOURCES = {
  trade_completed: 2,
  profitable_trade: 5,
  lesson_completed: 10,
  lesson_s_rank: 25,
  daily_challenge_completed: 15,
  scenario_completed: 20,
  scenario_s_rank: 50,
  backtest_run: 5,
  backtest_profitable: 15,
  arena_win: 30,
  arena_loss: 10,
  flashcard_session: 3,
  prediction_correct: 2,
  quest_daily_completed: 10,
  quest_weekly_completed: 25,
  daily_login: 5,
} as const;

export type SeasonXPSource = keyof typeof SEASON_XP_SOURCES;
