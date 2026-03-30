import type { SeasonDefinition, SeasonRewardTier, SeasonAchievementDef } from "@/types/season";

// ── Season names (one per month) ───────────────────────────────

const SEASON_NAMES: Record<number, { name: string; theme: string }> = {
  0:  { name: "Season of the Frost Bear",   theme: "winter_bear" },
  1:  { name: "Season of the Iron Bull",    theme: "recovery" },
  2:  { name: "Season of the Green Shoots", theme: "spring_growth" },
  3:  { name: "Season of the Rising Tide",  theme: "momentum" },
  4:  { name: "Season of the Golden Calf",  theme: "prosperity" },
  5:  { name: "Season of the Thunder Hawk", theme: "volatility" },
  6:  { name: "Season of the Crimson Lion", theme: "summer_heat" },
  7:  { name: "Season of the Silver Fox",   theme: "stealth" },
  8:  { name: "Season of the Harvest Moon", theme: "autumn_gains" },
  9:  { name: "Season of the Shadow Wolf",  theme: "uncertainty" },
  10: { name: "Season of the Crystal Stag", theme: "clarity" },
  11: { name: "Season of the Phoenix",      theme: "year_end" },
};

// ── Reward tiers (20 escalating tiers) ─────────────────────────

const TIER_XP_THRESHOLDS = [
  100, 250, 450, 700, 1000,
  1400, 1900, 2500, 3200, 4000,
  5000, 6200, 7500, 9000, 10800,
  12800, 15000, 17500, 20500, 24000,
];

function buildRewardTiers(): SeasonRewardTier[] {
  const tiers: SeasonRewardTier[] = [
    { tier: 1,  xpRequired: TIER_XP_THRESHOLDS[0],  reward: { type: "xp", value: 50,  label: "+50 XP Bonus",          icon: "✨" } },
    { tier: 2,  xpRequired: TIER_XP_THRESHOLDS[1],  reward: { type: "title", value: "Seasonal Rookie", label: "Title: Seasonal Rookie", icon: "🏷️" } },
    { tier: 3,  xpRequired: TIER_XP_THRESHOLDS[2],  reward: { type: "xp", value: 100, label: "+100 XP Bonus",         icon: "✨" } },
    { tier: 4,  xpRequired: TIER_XP_THRESHOLDS[3],  reward: { type: "badge", value: "season_streak", label: "Badge: Streak Master", icon: "🔥" } },
    { tier: 5,  xpRequired: TIER_XP_THRESHOLDS[4],  reward: { type: "xp", value: 150, label: "+150 XP Bonus",         icon: "✨" } },
    { tier: 6,  xpRequired: TIER_XP_THRESHOLDS[5],  reward: { type: "title", value: "Market Explorer", label: "Title: Market Explorer", icon: "🏷️" } },
    { tier: 7,  xpRequired: TIER_XP_THRESHOLDS[6],  reward: { type: "xp", value: 200, label: "+200 XP Bonus",         icon: "✨" } },
    { tier: 8,  xpRequired: TIER_XP_THRESHOLDS[7],  reward: { type: "xp_boost", value: 1.1, label: "10% XP Boost (24h)", icon: "⚡" } },
    { tier: 9,  xpRequired: TIER_XP_THRESHOLDS[8],  reward: { type: "xp", value: 300, label: "+300 XP Bonus",         icon: "✨" } },
    { tier: 10, xpRequired: TIER_XP_THRESHOLDS[9],  reward: { type: "title", value: "Season Veteran", label: "Title: Season Veteran", icon: "🏷️" } },
    { tier: 11, xpRequired: TIER_XP_THRESHOLDS[10], reward: { type: "xp", value: 400, label: "+400 XP Bonus",         icon: "✨" } },
    { tier: 12, xpRequired: TIER_XP_THRESHOLDS[11], reward: { type: "badge", value: "season_warrior", label: "Badge: Season Warrior", icon: "⚔️" } },
    { tier: 13, xpRequired: TIER_XP_THRESHOLDS[12], reward: { type: "xp", value: 500, label: "+500 XP Bonus",         icon: "✨" } },
    { tier: 14, xpRequired: TIER_XP_THRESHOLDS[13], reward: { type: "xp_boost", value: 1.15, label: "15% XP Boost (24h)", icon: "⚡" } },
    { tier: 15, xpRequired: TIER_XP_THRESHOLDS[14], reward: { type: "xp", value: 600, label: "+600 XP Bonus",         icon: "✨" } },
    { tier: 16, xpRequired: TIER_XP_THRESHOLDS[15], reward: { type: "title", value: "Market Conqueror", label: "Title: Market Conqueror", icon: "🏷️" } },
    { tier: 17, xpRequired: TIER_XP_THRESHOLDS[16], reward: { type: "xp", value: 750, label: "+750 XP Bonus",         icon: "✨" } },
    { tier: 18, xpRequired: TIER_XP_THRESHOLDS[17], reward: { type: "badge", value: "season_legend", label: "Badge: Season Legend", icon: "👑" } },
    { tier: 19, xpRequired: TIER_XP_THRESHOLDS[18], reward: { type: "xp", value: 1000, label: "+1000 XP Bonus",       icon: "✨" } },
    { tier: 20, xpRequired: TIER_XP_THRESHOLDS[19], reward: { type: "title", value: "Season Champion", label: "Title: Season Champion", icon: "🏆" } },
  ];
  return tiers;
}

// ── Season achievements (5 per season) ─────────────────────────

function buildSeasonAchievements(seasonId: string): SeasonAchievementDef[] {
  return [
    {
      id: `${seasonId}_trades_100`,
      name: "Century Trader",
      description: "Complete 100 trades this season",
      icon: "📊",
      xpReward: 200,
    },
    {
      id: `${seasonId}_lessons_10`,
      name: "Dedicated Learner",
      description: "Complete 10 lessons this season",
      icon: "📚",
      xpReward: 150,
    },
    {
      id: `${seasonId}_arena_10`,
      name: "Arena Regular",
      description: "Win 10 arena matches this season",
      icon: "⚔️",
      xpReward: 250,
    },
    {
      id: `${seasonId}_quests_30`,
      name: "Quest Completionist",
      description: "Complete 30 quests this season",
      icon: "📜",
      xpReward: 200,
    },
    {
      id: `${seasonId}_all_modes`,
      name: "Renaissance Trader",
      description: "Use every game mode at least once this season",
      icon: "🌟",
      xpReward: 300,
    },
  ];
}

// ── Main API ───────────────────────────────────────────────────

let _cachedSeason: SeasonDefinition | null = null;
let _cachedMonth: string | null = null;

/** Get the season definition for the current (or given) month. */
export function getCurrentSeason(dateStr?: string): SeasonDefinition {
  const date = dateStr ? new Date(dateStr) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthKey = `${year}_${String(month + 1).padStart(2, "0")}`;

  if (_cachedSeason && _cachedMonth === monthKey) return _cachedSeason;

  // First and last day of the month
  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  const seasonId = `season_${monthKey}`;
  const { name, theme } = SEASON_NAMES[month] ?? { name: "Season of Trading", theme: "default" };

  const season: SeasonDefinition = {
    id: seasonId,
    name,
    theme,
    startDate,
    endDate,
    rewardTiers: buildRewardTiers(),
    specialAchievements: buildSeasonAchievements(seasonId),
  };

  _cachedSeason = season;
  _cachedMonth = monthKey;
  return season;
}

/** Get days remaining in the current season. */
export function getSeasonDaysRemaining(dateStr?: string): number {
  const season = getCurrentSeason(dateStr);
  const now = dateStr ? new Date(dateStr) : new Date();
  const end = new Date(season.endDate);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Get the current tier based on season XP. */
export function getSeasonTier(seasonXP: number): number {
  const tiers = buildRewardTiers();
  let tier = 0;
  for (const t of tiers) {
    if (seasonXP >= t.xpRequired) tier = t.tier;
    else break;
  }
  return tier;
}

/** Get XP needed for the next tier. */
export function getNextTierXP(seasonXP: number): { current: number; required: number; tierNumber: number } | null {
  const tiers = buildRewardTiers();
  for (const t of tiers) {
    if (seasonXP < t.xpRequired) {
      return { current: seasonXP, required: t.xpRequired, tierNumber: t.tier };
    }
  }
  return null; // Max tier reached
}
