import { DAILY_QUEST_POOL, WEEKLY_QUEST_POOL } from "./quest-pool";
import type { QuestDefinition } from "@/types/quests";

/**
 * Deterministic daily quest selection.
 * Same PRNG as src/data/challenges/daily-seed.ts:
 * date string → polynomial hash → MINSTD LCG → Fisher-Yates → pick 3
 */
export function getDailyQuests(dateStr?: string): QuestDefinition[] {
 const date = dateStr ?? new Date().toISOString().slice(0, 10);
 let seed = 0;
 for (let i = 0; i < date.length; i++) {
 seed = (seed * 31 + date.charCodeAt(i)) | 0;
 }
 seed = Math.abs(seed);
 // Use a different multiplier offset so quests differ from daily challenges
 seed = (seed + 7727) | 0;

 let s = seed === 0 ? 1 : seed;
 const rng = () => {
 s = (s * 16807 + 0) % 2147483647;
 return (s - 1) / 2147483646;
 };

 const indices = DAILY_QUEST_POOL.map((_, i) => i);
 for (let i = indices.length - 1; i > 0; i--) {
 const j = Math.floor(rng() * (i + 1));
 [indices[i], indices[j]] = [indices[j], indices[i]];
 }

 return indices.slice(0, 3).map((i) => DAILY_QUEST_POOL[i]);
}

/**
 * Deterministic weekly quest selection.
 * Seeds from Monday of the current week, picks 5 from pool.
 */
export function getWeeklyQuests(dateStr?: string): QuestDefinition[] {
 const date = dateStr ?? new Date().toISOString().slice(0, 10);
 const d = new Date(date);
 const day = d.getDay();
 const monday = new Date(d);
 monday.setDate(d.getDate() - ((day + 6) % 7));
 const mondayStr = monday.toISOString().slice(0, 10);

 let seed = 0;
 for (let i = 0; i < mondayStr.length; i++) {
 seed = (seed * 31 + mondayStr.charCodeAt(i)) | 0;
 }
 seed = Math.abs(seed);

 let s = seed === 0 ? 1 : seed;
 const rng = () => {
 s = (s * 16807 + 0) % 2147483647;
 return (s - 1) / 2147483646;
 };

 const indices = WEEKLY_QUEST_POOL.map((_, i) => i);
 for (let i = indices.length - 1; i > 0; i--) {
 const j = Math.floor(rng() * (i + 1));
 [indices[i], indices[j]] = [indices[j], indices[i]];
 }

 return indices.slice(0, 5).map((i) => WEEKLY_QUEST_POOL[i]);
}

/** Get the Monday date string for the current week */
export function getCurrentMonday(): string {
 const now = new Date();
 const day = now.getDay();
 const monday = new Date(now);
 monday.setDate(now.getDate() - ((day + 6) % 7));
 return monday.toISOString().slice(0, 10);
}
