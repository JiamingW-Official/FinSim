import type { PlayerStats } from "@/types/game";

export type UserLevel = "beginner" | "intermediate" | "advanced";
export type UserFocus = "learning" | "trading" | "options" | "quant" | "predictions";

export interface UserProfile {
  level: UserLevel;
  primaryFocus: UserFocus;
  strengths: string[];
  weaknesses: string[];
  nextActions: NextAction[];
  personalizedTip: string;
}

export interface NextAction {
  type: "lesson" | "trade" | "challenge" | "prediction" | "review";
  title: string;
  description: string;
  href: string;
  priority: number; // 1-5, higher = more important
}

/**
 * Analyze user behavior and generate personalized recommendations.
 * This is the "agentic" layer — it proactively determines what the user
 * should do next based on their activity patterns.
 */
export function analyzeUserProfile(
  stats: PlayerStats,
  completedLessons: string[],
  level: number,
  predictionAccuracy?: number,
): UserProfile {
  // Determine user level
  let userLevel: UserLevel = "beginner";
  if (level >= 10 && stats.totalTrades >= 20 && completedLessons.length >= 10) {
    userLevel = "advanced";
  } else if (level >= 5 || stats.totalTrades >= 5 || completedLessons.length >= 5) {
    userLevel = "intermediate";
  }

  // Determine primary focus based on activity patterns
  let primaryFocus: UserFocus = "learning";
  if (stats.totalTrades > completedLessons.length * 2) {
    primaryFocus = "trading";
  }
  if (stats.optionsTradesCount > stats.totalTrades * 0.3) {
    primaryFocus = "options";
  }

  // Identify strengths
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const winRate = stats.totalTrades > 0
    ? stats.profitableTrades / stats.totalTrades
    : 0;

  if (winRate > 0.6 && stats.totalTrades >= 10) strengths.push("High win rate");
  if (winRate < 0.4 && stats.totalTrades >= 5) weaknesses.push("Low win rate — review entry timing");

  if (stats.consecutiveWins >= 5) strengths.push("Consistent winning streaks");
  if (stats.consecutiveLosses >= 3) weaknesses.push("Consecutive losses — consider smaller position sizes");

  if (stats.limitOrdersUsed > stats.totalTrades * 0.3) strengths.push("Good use of limit orders");
  if (stats.limitOrdersUsed === 0 && stats.totalTrades >= 5) weaknesses.push("Not using limit orders — they improve fill prices");

  if (stats.uniqueTickersTraded.length >= 5) strengths.push("Diversified across tickers");
  if (stats.uniqueTickersTraded.length <= 1 && stats.totalTrades >= 5) weaknesses.push("Trading only one ticker — diversify");

  if (stats.shortTradesCount > 0) strengths.push("Experience with short selling");
  if (completedLessons.length >= 15) strengths.push("Strong educational foundation");
  if (completedLessons.length < 3 && stats.totalTrades >= 5) weaknesses.push("Trading without completing lessons — learn fundamentals first");

  if (predictionAccuracy && predictionAccuracy > 60) strengths.push("Good prediction accuracy");

  // Generate next actions based on gaps
  const nextActions: NextAction[] = [];

  if (completedLessons.length === 0) {
    nextActions.push({
      type: "lesson",
      title: "Start your first lesson",
      description: "Learn the basics of stock trading before risking capital",
      href: "/learn",
      priority: 5,
    });
  }

  if (stats.totalTrades === 0 && completedLessons.length >= 2) {
    nextActions.push({
      type: "trade",
      title: "Place your first trade",
      description: "Apply what you learned — buy a stock you understand",
      href: "/trade",
      priority: 5,
    });
  }

  if (stats.totalTrades >= 5 && stats.optionsTradesCount === 0 && userLevel !== "beginner") {
    nextActions.push({
      type: "trade",
      title: "Explore options trading",
      description: "Learn about calls, puts, and strategies",
      href: "/options",
      priority: 3,
    });
  }

  if (stats.totalTrades >= 3 && winRate < 0.4) {
    nextActions.push({
      type: "review",
      title: "Review your trade history",
      description: "Analyze patterns in your losing trades",
      href: "/portfolio",
      priority: 4,
    });
  }

  if (completedLessons.length >= 5 && !completedLessons.some(l => l.startsWith("pf-"))) {
    nextActions.push({
      type: "lesson",
      title: "Personal finance fundamentals",
      description: "Budgeting, compound interest, and investing basics",
      href: "/learn",
      priority: 3,
    });
  }

  nextActions.push({
    type: "prediction",
    title: "Make predictions",
    description: "Test your market intuition with prediction markets",
    href: "/predictions",
    priority: userLevel === "beginner" ? 2 : 4,
  });

  if (stats.dailyStreak >= 3) {
    nextActions.push({
      type: "challenge",
      title: "Daily challenge",
      description: `${stats.dailyStreak}-day streak — keep it going`,
      href: "/challenges",
      priority: 3,
    });
  }

  // Sort by priority
  nextActions.sort((a, b) => b.priority - a.priority);

  // Generate personalized tip
  const personalizedTip = generateTip(userLevel, stats, winRate, completedLessons.length);

  return {
    level: userLevel,
    primaryFocus,
    strengths,
    weaknesses,
    nextActions: nextActions.slice(0, 3), // top 3
    personalizedTip,
  };
}

function generateTip(
  level: UserLevel,
  stats: PlayerStats,
  winRate: number,
  lessonsCompleted: number,
): string {
  if (level === "beginner") {
    if (lessonsCompleted === 0) {
      return "Start with the Trading Basics lessons. Understanding how markets work gives you an edge.";
    }
    if (stats.totalTrades === 0) {
      return "You have the knowledge — time to practice. Place a small trade to see how it feels.";
    }
    return "Focus on learning one indicator well rather than using many poorly. RSI is a good starting point.";
  }

  if (level === "intermediate") {
    if (winRate < 0.4) {
      return "Your win rate suggests entry timing needs work. Try waiting for multiple indicator confirmation before entering.";
    }
    if (stats.limitOrdersUsed === 0) {
      return "Use limit orders to control your entry price. Market orders often give you worse fills.";
    }
    if (stats.shortTradesCount === 0) {
      return "Learning to short sell expands your toolkit. You can profit in down markets too.";
    }
    return "Consider your risk/reward before each trade. Aim for at least 2:1 reward-to-risk ratio.";
  }

  // Advanced
  if (stats.optionsTradesCount === 0) {
    return "Options strategies can generate income and hedge risk. Start with covered calls.";
  }
  return "Track your Sharpe ratio in the portfolio analytics. Consistency matters more than big wins.";
}
