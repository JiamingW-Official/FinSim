import { DAILY_CHALLENGE_POOL } from "./daily-challenges";
import type { DailyChallengeDefinition } from "@/types/challenges";

/**
 * Deterministic daily challenge selector.
 * Same date → same 3 challenges (seeded Fisher-Yates shuffle).
 */
export function getDailyChallenges(dateStr?: string): DailyChallengeDefinition[] {
 const date = dateStr ?? new Date().toISOString().slice(0, 10);

 // Hash date string into a numeric seed
 let seed = 0;
 for (let i = 0; i < date.length; i++) {
 seed = (seed * 31 + date.charCodeAt(i)) | 0;
 }
 seed = Math.abs(seed);

 // Simple seeded PRNG (same algorithm as practice-data.ts)
 let s = seed === 0 ? 1 : seed;
 const rng = () => {
 s = (s * 16807 + 0) % 2147483647;
 return (s - 1) / 2147483646;
 };

 // Fisher-Yates shuffle on indices
 const indices = DAILY_CHALLENGE_POOL.map((_, i) => i);
 for (let i = indices.length - 1; i > 0; i--) {
 const j = Math.floor(rng() * (i + 1));
 [indices[i], indices[j]] = [indices[j], indices[i]];
 }

 // Pick first 3
 return indices.slice(0, 3).map((i) => DAILY_CHALLENGE_POOL[i]);
}

export function getTodayDateString(): string {
 return new Date().toISOString().slice(0, 10);
}
