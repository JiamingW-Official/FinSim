// ── AI Player Factory ────────────────────────────────────────────────────────
// Generates deterministic AI competitors for the trading competition.

export type AIStrategy =
  | "momentum"
  | "value"
  | "swing"
  | "index"
  | "contrarian"
  | "random";

export interface AIPlayer {
  id: string;
  name: string;
  avatarSeed: number;
  strategy: AIStrategy;
  riskTolerance: number; // 0.1–1.0
  startingCapital: number; // always 100000
  bio: string;
}

// ── Seeded PRNG ──────────────────────────────────────────────────────────────

function createPRNG(seed: number) {
  let s = seed === 0 ? 1 : seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Name pool (42 diverse names — real + handle-style traders) ───────────────

const NAMES: string[] = [
  "Marcus Chen",
  "Sarah Williams",
  "Raj Patel",
  "Elena Volkov",
  "James O'Brien",
  "Yuki Tanaka",
  "Aisha Mohammed",
  "Carlos Rivera",
  "Priya Sharma",
  "David Kim",
  "Olivia Foster",
  "André Dubois",
  "Mei-Ling Wu",
  "Hassan Ali",
  "Sophia Petrov",
  "Liam Nakamura",
  "Fatima Al-Rashid",
  "Thomas Berg",
  "Ingrid Svensson",
  "Rafael Costa",
  "Nina Kowalski",
  "Ben Okafor",
  "Emily Chang",
  "Omar Hassan",
  "Julia Müller",
  "Kenji Watanabe",
  "Isabella Torres",
  "Dmitri Sokolov",
  "Grace Okonkwo",
  "Sebastian Park",
  // Handle-style trader names
  "AlphaQuant_7",
  "MarketMaker99",
  "TrendFollower",
  "MeanReversionBot",
  "BreakoutHunter",
  "MomentumRider",
  "VolArb_X",
  "DeltaHedger",
  "TapeReader42",
  "FlowTrader",
  "SigmaEdge",
  "QuietCarry",
];

const STRATEGIES: AIStrategy[] = [
  "momentum",
  "value",
  "swing",
  "index",
  "contrarian",
  "random",
];

const STRATEGY_BIOS: Record<AIStrategy, string[]> = {
  momentum: [
    "Rides winners until trend breaks.",
    "Follows the tape — lets momentum run.",
    "Trend is friend until it bends.",
  ],
  value: [
    "Buys undervalued names, holds patiently.",
    "Deep value hunter — margin of safety first.",
    "Looks for bargains everyone else ignores.",
  ],
  swing: [
    "Catches 5-day swings with tight stops.",
    "Short-term patterns, medium-term gains.",
    "Mean-reversion plays on pullbacks.",
  ],
  index: [
    "Equal-weight across the board. Rebalances monthly.",
    "Passive diversification — boring by design.",
    "Buy everything, sell nothing.",
  ],
  contrarian: [
    "Fades the crowd — buys panic, sells euphoria.",
    "Goes against the grain on extreme moves.",
    "When others are greedy, gets cautious.",
  ],
  random: [
    "Coin-flip trader. The benchmark.",
    "Random entries — purely luck-based.",
    "Darts at a board. Let's see what happens.",
  ],
};

// ── Generator ────────────────────────────────────────────────────────────────

export function generateAIPlayers(count: number, seed: number): AIPlayer[] {
  const rng = createPRNG(seed);
  const players: AIPlayer[] = [];

  // Shuffle names deterministically
  const shuffled = [...NAMES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (let i = 0; i < count; i++) {
    const name = shuffled[i % shuffled.length];
    const strategy = STRATEGIES[Math.floor(rng() * STRATEGIES.length)];
    const bios = STRATEGY_BIOS[strategy];
    const bio = bios[Math.floor(rng() * bios.length)];
    const riskTolerance = Math.round((0.1 + rng() * 0.9) * 100) / 100;
    const avatarSeed = Math.floor(rng() * 1_000_000);

    players.push({
      id: `ai-${seed}-${i}`,
      name,
      avatarSeed,
      strategy,
      riskTolerance,
      startingCapital: 100_000,
      bio,
    });
  }

  return players;
}
