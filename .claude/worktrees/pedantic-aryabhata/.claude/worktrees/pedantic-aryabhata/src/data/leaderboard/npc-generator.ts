import { FIRST_NAMES, LAST_NAMES, HANDLES } from "./npc-names";
import { getLeagueForLevel, getTitleForLevel } from "@/types/leaderboard";
import { LEVEL_THRESHOLDS } from "@/types/game";
import type { LeaderboardEntry } from "@/types/leaderboard";

const NPC_COUNT = 50;
const SEED_STRING = "alpha-deck-leaderboard-v1";

function createRng(seedStr: string) {
 let seed = 0;
 for (let i = 0; i < seedStr.length; i++) {
 seed = (seed * 31 + seedStr.charCodeAt(i)) | 0;
 }
 seed = Math.abs(seed);
 let s = seed === 0 ? 1 : seed;
 return () => {
 s = (s * 16807 + 0) % 2147483647;
 return (s - 1) / 2147483646;
 };
}

/** Box-Muller transform for normal-distributed values */
function normalRandom(rng: () => number, mean: number, std: number): number {
 const u1 = Math.max(1e-10, rng()); // avoid log(0)
 const u2 = rng();
 const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
 return mean + z * std;
}

/**
 * Generate 50 deterministic NPC players.
 * Same seed → same NPCs every time.
 */
export function generateNPCs(): LeaderboardEntry[] {
 const rng = createRng(SEED_STRING);
 const npcs: LeaderboardEntry[] = [];

 for (let i = 0; i < NPC_COUNT; i++) {
 // Level distribution: weighted toward lower levels
 const levelRoll = rng();
 let level: number;
 if (levelRoll < 0.40) level = Math.floor(rng() * 10) + 1;
 else if (levelRoll < 0.65) level = Math.floor(rng() * 10) + 11;
 else if (levelRoll < 0.85) level = Math.floor(rng() * 15) + 21;
 else if (levelRoll < 0.95) level = Math.floor(rng() * 15) + 36;
 else level = 50;

 // Name: 80% real name, 20% gamer handle
 const useHandle = rng() < 0.2;
 let name: string;
 if (useHandle) {
 name = HANDLES[Math.floor(rng() * HANDLES.length)];
 } else {
 const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
 const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
 name = `${first} ${last}`;
 }

 // Skill factor: correlated with level but has variance
 const skill = Math.max(0.05, Math.min(1, level / 50 + normalRandom(rng, 0, 0.15)));

 // Stats
 const totalTrades = Math.floor(20 + skill * 300 + rng() * 100);
 const winRate = Math.max(25, Math.min(85, 35 + skill * 40 + normalRandom(rng, 0, 8)));
 const totalPnL = normalRandom(rng, -10000 + skill * 80000, 15000 + skill * 20000);
 const sharpeRatio = Math.max(-0.5, normalRandom(rng, skill * 2.0, 0.5));
 const longestStreak = Math.max(1, Math.floor(1 + skill * 15 + rng() * 5));
 const maxDrawdownPct = Math.max(2, Math.min(65, 50 - skill * 35 + normalRandom(rng, 0, 8)));

 // XP from level threshold + some random extra
 const xp = level <= 50
 ? LEVEL_THRESHOLDS[level - 1] + Math.floor(rng() * 500)
 : LEVEL_THRESHOLDS[49] + Math.floor(rng() * 5000);

 const achievementCount = Math.min(20, Math.floor(rng() * (level / 50) * 20 + rng() * 3));

 npcs.push({
 id: `npc-${i}`,
 name,
 isUser: false,
 level,
 title: getTitleForLevel(level),
 league: getLeagueForLevel(level),
 avatarSeed: Math.floor(rng() * 1000000),
 totalPnL: Math.round(totalPnL * 100) / 100,
 sharpeRatio: Math.round(sharpeRatio * 100) / 100,
 winRate: Math.round(winRate * 10) / 10,
 longestStreak,
 totalTrades,
 maxDrawdownPct: Math.round(maxDrawdownPct * 10) / 10,
 xp,
 achievementCount,
 });
 }

 return npcs;
}
