import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getGameTime,
  type MarketSession,
  type GameClockState,
} from "@/services/game-clock/engine";

interface ClockState {
  // Persisted
  seasonStartRealMs: number | null;
  seasonId: string;

  // Derived (not persisted, recomputed on every tick)
  gameDate: string; // ISO date "2023-03-15"
  gameTimeDisplay: string; // "14:35"
  gameHour: number;
  gameMinute: number;
  marketSession: MarketSession;
  tradingDayIndex: number;
  totalTradingDays: number;
  seasonProgress: number;
  isMarketDay: boolean;
  isSeasonOver: boolean;
  tickVersion: number;

  // Actions
  startSeason: () => void;
  tick: () => void;
  getGameState: () => GameClockState | null;
}

/** Format Date to "YYYY-MM-DD" in UTC */
function formatDateISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Format time as "HH:MM" */
function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export const useClockStore = create<ClockState>()(
  persist(
    (set, get) => ({
      // Persisted
      seasonStartRealMs: null,
      seasonId: "season-1",

      // Derived defaults
      gameDate: "2023-01-01",
      gameTimeDisplay: "09:30",
      gameHour: 9,
      gameMinute: 30,
      marketSession: "closed" as MarketSession,
      tradingDayIndex: 0,
      totalTradingDays: 0,
      seasonProgress: 0,
      isMarketDay: false,
      isSeasonOver: false,
      tickVersion: 0,

      startSeason: () => {
        // Anchor to last midnight EST so all players at same real time = same game day/time.
        // EST = UTC-5. Midnight EST = 05:00 UTC.
        // This means Day 1 = 0:00-4:00 AM EST, Day 6 = 8:00-11:59 PM EST.
        const EST_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC-5
        const nowUtcMs = Date.now();
        const nowESTMs = nowUtcMs - EST_OFFSET_MS;
        // Floor to midnight in EST, then convert back to UTC
        const lastMidnightESTasUTC =
          Math.floor(nowESTMs / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000) + EST_OFFSET_MS;
        set({
          seasonStartRealMs: lastMidnightESTasUTC,
          seasonId: `season-${lastMidnightESTasUTC}`,
          tickVersion: 0,
        });
        // Immediately compute initial state
        get().tick();
      },

      tick: () => {
        const { seasonStartRealMs } = get();
        if (seasonStartRealMs === null) return;

        const state = getGameTime(seasonStartRealMs);

        set({
          gameDate: formatDateISO(state.gameDate),
          gameTimeDisplay: formatTime(state.gameHour, state.gameMinute),
          gameHour: state.gameHour,
          gameMinute: state.gameMinute,
          marketSession: state.marketSession,
          tradingDayIndex: state.tradingDayIndex,
          totalTradingDays: state.totalTradingDays,
          seasonProgress: state.seasonProgress,
          isMarketDay: state.isMarketDay,
          isSeasonOver: state.isSeasonOver,
          // tickVersion intentionally not incremented every tick —
          // bar sync uses its own setInterval to avoid cascading re-renders
        });
      },

      getGameState: () => {
        const { seasonStartRealMs } = get();
        if (seasonStartRealMs === null) return null;
        return getGameTime(seasonStartRealMs);
      },
    }),
    {
      name: "finsim-clock-v1",
      partialize: (state) => ({
        seasonStartRealMs: state.seasonStartRealMs,
        seasonId: state.seasonId,
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration, immediately tick to catch up
        if (state?.seasonStartRealMs !== null) {
          state?.tick();
        }
      },
    }
  )
);
