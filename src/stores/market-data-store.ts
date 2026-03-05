import { create } from "zustand";
import type { OHLCVBar } from "@/types/market";

const INITIAL_REVEALED = 1300; // ~50 days × 26 bars/day (15m bars)

interface MarketDataState {
  allData: OHLCVBar[];
  revealedCount: number;
  isPlaying: boolean;
  speed: number;

  setAllData: (data: OHLCVBar[]) => void;
  setRevealedCount: (n: number) => void;
  incrementRevealed: () => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
  getCurrentBar: () => OHLCVBar | null;
  getVisibleData: () => OHLCVBar[];
}

export const useMarketDataStore = create<MarketDataState>((set, get) => ({
  allData: [],
  revealedCount: INITIAL_REVEALED,
  isPlaying: false,
  speed: 1,

  setAllData: (data) =>
    set({
      allData: data,
      revealedCount: Math.min(INITIAL_REVEALED, data.length),
    }),

  setRevealedCount: (n) =>
    set((state) => ({
      revealedCount: Math.max(1, Math.min(n, state.allData.length)),
    })),

  incrementRevealed: () =>
    set((state) => ({
      revealedCount: Math.min(state.revealedCount + 1, state.allData.length),
    })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),

  reset: () =>
    set((state) => ({
      revealedCount: Math.min(INITIAL_REVEALED, state.allData.length),
      isPlaying: false,
    })),

  getCurrentBar: () => {
    const { allData, revealedCount } = get();
    if (allData.length === 0 || revealedCount === 0) return null;
    return allData[revealedCount - 1];
  },

  getVisibleData: () => {
    const { allData, revealedCount } = get();
    return allData.slice(0, revealedCount);
  },
}));
