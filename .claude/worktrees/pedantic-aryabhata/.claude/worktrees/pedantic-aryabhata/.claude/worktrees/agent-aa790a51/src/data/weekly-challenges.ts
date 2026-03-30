export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  metric: "trades" | "pnl" | "winRate" | "options" | "streak" | "backtests";
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
  icon: string; // lucide icon name
}

// Mulberry32 seeded PRNG — same algorithm used elsewhere in the codebase
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ISO week number (Monday = start of week)
export function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
}

// ISO year for the week (handles year-boundary week 53→1 transitions)
export function getISOWeekYear(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

// Next Monday 00:00 local time in ms from now
export function getMsUntilMonday(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilMonday,
  );
  return nextMonday.getTime() - now.getTime();
}

// Weekly key used for localStorage / store reset detection
export function getWeekKey(date: Date = new Date()): string {
  return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`;
}

// Full pool of 12 challenges
const CHALLENGE_POOL: WeeklyChallenge[] = [
  {
    id: "wc_trade_10",
    title: "Volume Trader",
    description: "Complete 10 trades this week",
    target: 10,
    metric: "trades",
    xpReward: 200,
    difficulty: "easy",
    icon: "BarChart2",
  },
  {
    id: "wc_trade_25",
    title: "Market Veteran",
    description: "Complete 25 trades this week",
    target: 25,
    metric: "trades",
    xpReward: 400,
    difficulty: "medium",
    icon: "BarChart3",
  },
  {
    id: "wc_trade_50",
    title: "Trading Machine",
    description: "Complete 50 trades this week",
    target: 50,
    metric: "trades",
    xpReward: 750,
    difficulty: "hard",
    icon: "Activity",
  },
  {
    id: "wc_pnl_500",
    title: "Green Week",
    description: "Earn $500 in net P&L this week",
    target: 500,
    metric: "pnl",
    xpReward: 300,
    difficulty: "easy",
    icon: "TrendingUp",
  },
  {
    id: "wc_pnl_2000",
    title: "Big Gains",
    description: "Earn $2,000 in net P&L this week",
    target: 2000,
    metric: "pnl",
    xpReward: 600,
    difficulty: "medium",
    icon: "DollarSign",
  },
  {
    id: "wc_pnl_5000",
    title: "Alpha Generator",
    description: "Earn $5,000 in net P&L this week",
    target: 5000,
    metric: "pnl",
    xpReward: 1000,
    difficulty: "hard",
    icon: "Rocket",
  },
  {
    id: "wc_winrate_60",
    title: "Consistent Edge",
    description: "Maintain a 60%+ win rate this week (min 5 trades)",
    target: 60,
    metric: "winRate",
    xpReward: 350,
    difficulty: "medium",
    icon: "Target",
  },
  {
    id: "wc_winrate_75",
    title: "Sharp Shooter",
    description: "Maintain a 75%+ win rate this week (min 8 trades)",
    target: 75,
    metric: "winRate",
    xpReward: 700,
    difficulty: "hard",
    icon: "Crosshair",
  },
  {
    id: "wc_options_3",
    title: "Options Initiate",
    description: "Place 3 options trades this week",
    target: 3,
    metric: "options",
    xpReward: 300,
    difficulty: "easy",
    icon: "Layers",
  },
  {
    id: "wc_options_10",
    title: "Derivatives Desk",
    description: "Place 10 options trades this week",
    target: 10,
    metric: "options",
    xpReward: 550,
    difficulty: "medium",
    icon: "GitBranch",
  },
  {
    id: "wc_streak_5",
    title: "On Fire",
    description: "Reach a 5-trade win streak at any point this week",
    target: 5,
    metric: "streak",
    xpReward: 400,
    difficulty: "medium",
    icon: "Flame",
  },
  {
    id: "wc_backtests_5",
    title: "Quant Lab",
    description: "Run 5 backtests this week",
    target: 5,
    metric: "backtests",
    xpReward: 250,
    difficulty: "easy",
    icon: "FlaskConical",
  },
];

// Select 3 challenges for a given ISO week key
export function getWeeklyChallenges(weekKey: string): WeeklyChallenge[] {
  // Derive a numeric seed from the week key string
  const seed = weekKey
    .split("")
    .reduce((s, c) => s + c.charCodeAt(0), 0);
  const rand = mulberry32(seed);

  const shuffled = [...CHALLENGE_POOL].sort(() => rand() - 0.5);
  return shuffled.slice(0, 3);
}
