import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getWeekKey } from "@/data/weekly-challenges";

interface WeeklyChallengeState {
  // Week key at the time of last write — used to detect Monday resets
  weekKey: string;
  // IDs of challenges that have been claimed in the current week
  claimedIds: string[];

  claimChallenge: (id: string) => void;
  // Returns claimed IDs for the current week (resets stale data automatically)
  getClaimedIds: () => string[];
}

export const useWeeklyChallengeStore = create<WeeklyChallengeState>()(
  persist(
    (set, get) => ({
      weekKey: getWeekKey(),
      claimedIds: [],

      claimChallenge: (id: string) => {
        const currentWeek = getWeekKey();
        set((state) => {
          // If it's a new week, reset before claiming
          const base =
            state.weekKey === currentWeek ? state.claimedIds : [];
          if (base.includes(id)) return state; // already claimed
          return {
            weekKey: currentWeek,
            claimedIds: [...base, id],
          };
        });
      },

      getClaimedIds: () => {
        const state = get();
        const currentWeek = getWeekKey();
        if (state.weekKey !== currentWeek) {
          // Stale — reset in-place and return empty
          set({ weekKey: currentWeek, claimedIds: [] });
          return [];
        }
        return state.claimedIds;
      },
    }),
    {
      name: "finsim-weekly-challenges",
      partialize: (state) => ({
        weekKey: state.weekKey,
        claimedIds: state.claimedIds,
      }),
    },
  ),
);
