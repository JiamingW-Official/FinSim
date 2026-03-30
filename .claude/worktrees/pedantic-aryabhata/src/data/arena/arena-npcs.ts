import type { ArenaNPC, ArenaPersonality, ArenaTypeConfig } from "@/types/arena";
import { getArenaRankForElo } from "@/types/arena";

// ── Seeded PRNG (same as npc-generator.ts) ─────────────────────

function seededRng(seed: number) {
 let s = seed;
 return () => {
 s = (s * 16807 + 0) % 2147483647;
 return (s - 1) / 2147483646;
 };
}

function normalRandom(rng: () => number): number {
 const u1 = Math.max(rng(), 1e-10);
 const u2 = rng();
 return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ── Name pools ─────────────────────────────────────────────────

const FIRST_NAMES = [
 "Alex", "Jordan", "Sam", "Morgan", "Quinn", "Taylor", "Riley", "Casey",
 "Avery", "Reese", "Blake", "Drew", "Skyler", "Kai", "Sage", "River",
 "Phoenix", "Rowan", "Harper", "Logan", "Emery", "Finley", "Hayden", "Jesse",
 "Lennox", "Marley", "Noel", "Oakley", "Peyton", "Remy",
];

const LAST_NAMES = [
 "Chen", "Park", "Kim", "Nakamura", "Singh", "Patel", "Wang", "Tanaka",
 "Lee", "Wu", "Ahmad", "Gupta", "Liu", "Huang", "Torres", "Garcia",
 "Fischer", "Meyer", "Berg", "Holm", "Nilsen", "Johansson", "Petrov", "Ivanova",
 "Romano", "Rossi", "Martin", "Dubois", "Santos", "Almeida",
];

const PERSONALITIES: ArenaPersonality[] = ["aggressive", "conservative", "balanced", "momentum"];

// ── Generate deterministic arena opponents ─────────────────────

let _cachedOpponents: ArenaNPC[] | null = null;

export function generateArenaOpponents(): ArenaNPC[] {
 if (_cachedOpponents) return _cachedOpponents;

 const rng = seededRng(arenaBaseSeed());
 const opponents: ArenaNPC[] = [];

 for (let i = 0; i < 30; i++) {
 const firstIdx = Math.floor(rng() * FIRST_NAMES.length);
 const lastIdx = Math.floor(rng() * LAST_NAMES.length);
 const name = `${FIRST_NAMES[firstIdx]} ${LAST_NAMES[lastIdx]}`;

 // ELO distribution: weighted toward 400-1400 range
 const eloBase = 400 + Math.floor(rng() * 800);
 const eloVariance = Math.floor(normalRandom(rng) * 300);
 const elo = Math.max(200, Math.min(2800, eloBase + eloVariance));

 // Skill correlates with ELO but with variance
 const skillBase = Math.max(0, Math.min(1, (elo - 200) / 2600));
 const skillNoise = normalRandom(rng) * 0.1;
 const skillLevel = Math.max(0.05, Math.min(0.95, skillBase + skillNoise));

 const personalityIdx = Math.floor(rng() * PERSONALITIES.length);

 opponents.push({
 id: `arena_npc_${i}`,
 name,
 rank: getArenaRankForElo(elo),
 elo,
 avatarSeed: Math.floor(rng() * 100000),
 skillLevel,
 personality: PERSONALITIES[personalityIdx],
 });
 }

 _cachedOpponents = opponents;
 return opponents;
}

function arenaBaseSeed(): number {
 // Deterministic seed from a fixed string
 let s = 0;
 const str = "alpha-deck-arena-npcs-v1";
 for (let i = 0; i < str.length; i++) {
 s = (s * 31 + str.charCodeAt(i)) | 0;
 }
 return Math.abs(s) || 1;
}

// ── Matchmaking ────────────────────────────────────────────────

/** Find an opponent within ±150 ELO. Falls back to closest if none in range. */
export function findOpponent(playerElo: number): ArenaNPC {
 const opponents = generateArenaOpponents();
 const range = 150;

 // Filter candidates within range
 let candidates = opponents.filter((o) => Math.abs(o.elo - playerElo) <= range);

 // Fallback: pick closest 5
 if (candidates.length === 0) {
 candidates = [...opponents]
 .sort((a, b) => Math.abs(a.elo - playerElo) - Math.abs(b.elo - playerElo))
 .slice(0, 5);
 }

 // Pick random from candidates (non-deterministic for variety)
 return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Simulate opponent result ───────────────────────────────────

/** Deterministic opponent result based on skill + match seed */
export function simulateOpponentResult(
 opponent: ArenaNPC,
 matchSeed: number,
 arenaConfig: ArenaTypeConfig,
): { pnl: number; pnlPercent: number; score: number; tradesCount: number; winRate: number; maxDrawdown: number } {
 const rng = seededRng(matchSeed + opponent.avatarSeed);
 const skill = opponent.skillLevel;

 // Better skill = more profitable on average
 const basePnlPercent = (skill - 0.3) * 8 + normalRandom(rng) * 3;
 const pnlPercent = Math.max(-10, Math.min(15, basePnlPercent));
 const startingCash = 10000;
 const pnl = startingCash * (pnlPercent / 100);

 // Trades: higher speed personalities trade more
 const speedMult = opponent.personality === "aggressive" ? 1.4 : opponent.personality === "momentum" ? 1.2 : opponent.personality === "conservative" ? 0.7 : 1.0;
 const tradesCount = Math.max(1, Math.floor((3 + skill * 6) * speedMult + normalRandom(rng) * 1.5));

 // Win rate
 const winRate = Math.max(20, Math.min(90, 40 + skill * 35 + normalRandom(rng) * 10));

 // Max drawdown
 const maxDrawdown = Math.max(0.5, Math.min(15, (1 - skill) * 8 + Math.abs(normalRandom(rng) * 2)));

 // Composite score
 const { scoringWeights } = arenaConfig;
 const timeMins = arenaConfig.timeLimitSeconds / 60;
 const tradesPerMin = tradesCount / timeMins;

 const pnlScore = Math.max(0, Math.min(100, 50 + pnlPercent * 10));
 const riskScore = Math.max(0, Math.min(100, 100 - maxDrawdown * 5));
 const effScore = Math.max(0, Math.min(100, winRate));
 const speedScore = Math.max(0, Math.min(100, tradesPerMin * 20));

 const score = Math.round(
 pnlScore * scoringWeights.pnl +
 riskScore * scoringWeights.riskControl +
 effScore * scoringWeights.efficiency +
 speedScore * scoringWeights.speed,
 );

 return { pnl, pnlPercent, score, tradesCount, winRate, maxDrawdown };
}
