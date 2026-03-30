import type { TierDefinition } from "@/types/tiers";

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    name: "Cadet",
    level: 1,
    description:
      "New to the flight deck. Complete the tutorial and learn the fundamentals of options and market mechanics.",
    unlockedFeatures: [
      "Long calls and puts",
      "Basic Greeks (Delta, Gamma, Theta, Vega)",
      "Level 1 lessons",
      "Paper trading simulator",
      "Standard order types",
    ],
    requirements: {
      tradesCompleted: 0,
      minSharpe: null,
      behaviorScore: null,
      completedLessons: 1,
      additionalNotes: "Complete the onboarding tutorial",
    },
    color: "slate-400",
    icon: "Plane",
    achievements: [
      {
        id: "cadet_first_trade",
        name: "First Flight",
        description: "Execute your first simulated trade",
      },
      {
        id: "cadet_greeks_lesson",
        name: "Understanding Greeks",
        description: "Complete the Greeks fundamentals lesson",
      },
      {
        id: "cadet_tutorial_complete",
        name: "Cleared for Takeoff",
        description: "Complete the full onboarding tutorial",
      },
      {
        id: "cadet_first_call",
        name: "Call Sign",
        description: "Buy your first call option",
      },
      {
        id: "cadet_first_put",
        name: "Put It Down",
        description: "Buy your first put option",
      },
    ],
  },
  {
    name: "First Officer",
    level: 2,
    description:
      "Ready to assist in complex maneuvers. You understand directional strategies and are learning multi-leg structures.",
    unlockedFeatures: [
      "Vertical spreads (bull call, bear put)",
      "Calendar spreads",
      "P&L visualization charts",
      "Options chain filters",
      "Strategy builder — basic presets",
    ],
    requirements: {
      tradesCompleted: 20,
      minSharpe: null,
      behaviorScore: null,
      completedLessons: 5,
      additionalNotes: "Pass the spreads knowledge quiz",
    },
    color: "sky-400",
    icon: "Navigation",
    achievements: [
      {
        id: "fo_spread_opened",
        name: "Spread Pilot",
        description: "Open your first vertical spread",
      },
      {
        id: "fo_calendar_opened",
        name: "Time Horizon",
        description: "Open your first calendar spread",
      },
      {
        id: "fo_20_trades",
        name: "Experience Logged",
        description: "Complete 20 total trades",
      },
      {
        id: "fo_quiz_passed",
        name: "Spreads Certified",
        description: "Pass the spreads knowledge quiz",
      },
      {
        id: "fo_pnl_positive",
        name: "In the Black",
        description: "Achieve a positive cumulative P&L",
      },
    ],
  },
  {
    name: "Captain",
    level: 3,
    description:
      "Command of the aircraft. You can manage complex multi-leg positions and interpret volatility surfaces.",
    unlockedFeatures: [
      "Straddles and strangles",
      "Iron condors",
      "Greeks surface visualization",
      "Volatility smile chart",
      "Advanced strategy builder",
      "Position risk analysis",
    ],
    requirements: {
      tradesCompleted: 50,
      minSharpe: 0.5,
      behaviorScore: null,
      completedLessons: 10,
      additionalNotes:
        "Maintain Sharpe ratio above 0.5 over your last 20 trades",
    },
    color: "blue-400",
    icon: "Compass",
    achievements: [
      {
        id: "captain_straddle",
        name: "Both Ways",
        description: "Open a straddle position",
      },
      {
        id: "captain_condor",
        name: "Iron Wings",
        description: "Open and close an iron condor profitably",
      },
      {
        id: "captain_50_trades",
        name: "Battle-Tested",
        description: "Complete 50 total trades",
      },
      {
        id: "captain_sharpe_05",
        name: "Risk-Adjusted",
        description: "Achieve a Sharpe ratio above 0.5",
      },
      {
        id: "captain_vol_surface",
        name: "Surface Awareness",
        description: "View the volatility surface 5 times",
      },
    ],
  },
  {
    name: "Commander",
    level: 4,
    description:
      "Fleet-level decision maker. You build custom multi-leg strategies and navigate complex market environments.",
    unlockedFeatures: [
      "Custom multi-leg strategy builder",
      "Full volatility surface modeling",
      "Quant engine access",
      "Backtesting framework",
      "Portfolio correlation matrix",
      "Scenario analysis tools",
    ],
    requirements: {
      tradesCompleted: 100,
      minSharpe: 1.0,
      behaviorScore: null,
      completedLessons: 20,
      additionalNotes: "Demonstrate positive P&L over any consecutive 50 trades",
    },
    color: "indigo-400",
    icon: "Radio",
    achievements: [
      {
        id: "commander_custom_leg",
        name: "Architect",
        description: "Build and execute a custom 4-leg strategy",
      },
      {
        id: "commander_100_trades",
        name: "Century",
        description: "Complete 100 total trades",
      },
      {
        id: "commander_sharpe_1",
        name: "Sharp Edge",
        description: "Achieve a Sharpe ratio above 1.0",
      },
      {
        id: "commander_backtest",
        name: "Data-Driven",
        description: "Run 5 backtests on different strategies",
      },
      {
        id: "commander_50_positive",
        name: "Sustained Altitude",
        description: "Stay profitable across 50 consecutive trades",
      },
    ],
  },
  {
    name: "Alpha",
    level: 5,
    description:
      "Elite operator. You have demonstrated sustained performance, disciplined behavior, and mastery of complex instruments.",
    unlockedFeatures: [
      "Reinforcement learning (RL) mode",
      "Prediction markets integration",
      "Counterparty agent simulation",
      "Tokenized real-world assets",
      "Black Swan arena",
      "Beat Black-Scholes mode",
      "Full historical event replay",
      "Alpha leaderboard",
    ],
    requirements: {
      tradesCompleted: 100,
      minSharpe: 1.0,
      behaviorScore: 70,
      completedLessons: 30,
      additionalNotes:
        "Maintain a behavioral discipline score above 70 over any 30-day period",
    },
    color: "amber-400",
    icon: "Crosshair",
    achievements: [
      {
        id: "alpha_rl_mode",
        name: "Beyond Black-Scholes",
        description: "Win against the RL pricing engine",
      },
      {
        id: "alpha_prediction_market",
        name: "Market Oracle",
        description: "Resolve 10 prediction markets correctly",
      },
      {
        id: "alpha_black_swan",
        name: "Tail Risk Survivor",
        description: "Survive a Black Swan scenario with positive P&L",
      },
      {
        id: "alpha_behavior_70",
        name: "Disciplined Operator",
        description: "Achieve a behavioral score of 70+",
      },
      {
        id: "alpha_tokenized",
        name: "New Frontier",
        description: "Trade all available tokenized asset classes",
      },
    ],
  },
];

/** Look up a tier definition by name */
export function getTierByName(
  name: string,
): TierDefinition | undefined {
  return TIER_DEFINITIONS.find((t) => t.name === name);
}

/**
 * Compute the current tier based on player stats.
 * Returns the highest tier whose hard requirements are met.
 */
export function computeCurrentTier(stats: {
  totalTrades: number;
  sharpeRatio?: number;
  behaviorScore?: number;
  completedLessons?: number;
  tutorialComplete?: boolean;
}): TierDefinition {
  const {
    totalTrades,
    sharpeRatio = 0,
    behaviorScore = 0,
    completedLessons = 0,
    tutorialComplete = false,
  } = stats;

  // Walk tiers in reverse order (highest first) and return the first one met
  for (let i = TIER_DEFINITIONS.length - 1; i >= 0; i--) {
    const tier = TIER_DEFINITIONS[i];
    const req = tier.requirements;

    if (totalTrades < req.tradesCompleted) continue;
    if (req.minSharpe !== null && sharpeRatio < req.minSharpe) continue;
    if (req.behaviorScore !== null && behaviorScore < req.behaviorScore) continue;
    if (completedLessons < req.completedLessons) continue;
    if (tier.level === 1 && !tutorialComplete && totalTrades === 0) {
      // Cadet is default — always granted
    }

    return tier;
  }

  // Fallback: always at least Cadet
  return TIER_DEFINITIONS[0];
}

/**
 * Compute progress (0–100) toward the NEXT tier.
 * If the player is at Alpha, returns 100.
 */
export function computeTierProgress(stats: {
  totalTrades: number;
  sharpeRatio?: number;
  behaviorScore?: number;
  completedLessons?: number;
  tutorialComplete?: boolean;
}): { currentTier: TierDefinition; nextTier: TierDefinition | null; progress: number } {
  const currentTier = computeCurrentTier(stats);

  if (currentTier.level === 5) {
    return { currentTier, nextTier: null, progress: 100 };
  }

  const nextTier = TIER_DEFINITIONS[currentTier.level]; // level is 1-indexed, array is 0-indexed → next tier is at index `level`

  const req = nextTier.requirements;
  const {
    totalTrades,
    sharpeRatio = 0,
    behaviorScore = 0,
    completedLessons = 0,
  } = stats;

  // Gather progress ratios for each relevant requirement
  const ratios: number[] = [];

  if (req.tradesCompleted > 0) {
    ratios.push(Math.min(totalTrades / req.tradesCompleted, 1));
  }
  if (req.minSharpe !== null) {
    ratios.push(Math.min(sharpeRatio / req.minSharpe, 1));
  }
  if (req.behaviorScore !== null) {
    ratios.push(Math.min(behaviorScore / req.behaviorScore, 1));
  }
  if (req.completedLessons > 0) {
    ratios.push(Math.min(completedLessons / req.completedLessons, 1));
  }

  if (ratios.length === 0) return { currentTier, nextTier, progress: 100 };

  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return { currentTier, nextTier, progress: Math.round(avg * 100) };
}
