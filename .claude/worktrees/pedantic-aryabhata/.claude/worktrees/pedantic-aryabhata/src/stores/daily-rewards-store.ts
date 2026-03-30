import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./game-store";

const DAY_REWARDS = [25, 35, 50, 75, 100, 150, 300] as const;

function todayStr(): string {
 return new Date().toISOString().slice(0, 10);
}

interface DailyRewardsState {
 /** Day indices (0-6) already claimed in current cycle */
 claimedDays: number[];
 /** YYYY-MM-DD of last claim */
 lastClaimDate: string;
 /** YYYY-MM-DD when current 7-day cycle started */
 cycleStartDate: string;
 /** Consecutive days claimed without missing */
 streakCount: number;

 /** Returns the current day index (0-6) or -1 if cycle complete */
 getCurrentDay: () => number;
 /** Whether today can be claimed */
 canClaimToday: () => boolean;
 /** Claim today's reward — returns XP earned */
 claimToday: () => number;
}

export const useDailyRewardsStore = create<DailyRewardsState>()(
 persist(
 (set, get) => ({
 claimedDays: [],
 lastClaimDate: "",
 cycleStartDate: "",
 streakCount: 0,

 getCurrentDay: () => {
 const state = get();
 if (!state.cycleStartDate) return 0; // First time — day 0
 const start = new Date(state.cycleStartDate).getTime();
 const now = new Date(todayStr()).getTime();
 const dayIndex = Math.floor((now - start) / 86_400_000);
 // If past day 6, cycle is complete
 if (dayIndex > 6) return -1;
 return dayIndex;
 },

 canClaimToday: () => {
 const state = get();
 const today = todayStr();
 if (state.lastClaimDate === today) return false;

 const dayIndex = state.getCurrentDay();
 // If cycle complete (day > 6), start new cycle — claimable
 if (dayIndex === -1) return true;
 return !state.claimedDays.includes(dayIndex);
 },

 claimToday: () => {
 const state = get();
 const today = todayStr();
 if (state.lastClaimDate === today) return 0;

 let dayIndex = state.getCurrentDay();
 let claimedDays = [...state.claimedDays];
 let cycleStartDate = state.cycleStartDate;

 // Start new cycle if needed
 if (!cycleStartDate || dayIndex === -1) {
 cycleStartDate = today;
 dayIndex = 0;
 claimedDays = [];
 }

 if (claimedDays.includes(dayIndex)) return 0;

 // Streak logic
 const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
 const streakCount =
 state.lastClaimDate === yesterday
 ? state.streakCount + 1
 : state.lastClaimDate === ""
 ? 1
 : 1; // reset on gap

 const xpReward = DAY_REWARDS[dayIndex] ?? 25;
 claimedDays.push(dayIndex);

 set({
 claimedDays,
 lastClaimDate: today,
 cycleStartDate,
 streakCount,
 });

 // Award XP through game store
 const gameStore = useGameStore.getState();
 gameStore.awardXP(xpReward);

 // Check daily_reward_7 achievement (all 7 days claimed)
 if (claimedDays.length === 7) {
 const existingIds = new Set(gameStore.achievements.map((a) => a.id));
 if (!existingIds.has("daily_reward_7")) {
 const pending = {
 id: "daily_reward_7",
 name: "Dedicated Trader",
 description: "Claim all 7 days in a reward cycle",
 icon: "Gift",
 unlockedAt: Date.now(),
 };
 useGameStore.setState((s) => ({
 achievements: [...s.achievements, pending],
 pendingAchievements: [...s.pendingAchievements, pending],
 }));
 }
 }

 return xpReward;
 },
 }),
 {
 name: "alpha-deck-daily-rewards",
 partialize: (state) => ({
 claimedDays: state.claimedDays,
 lastClaimDate: state.lastClaimDate,
 cycleStartDate: state.cycleStartDate,
 streakCount: state.streakCount,
 }),
 },
 ),
);

export { DAY_REWARDS };
