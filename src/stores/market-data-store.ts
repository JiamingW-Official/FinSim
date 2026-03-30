import { create } from "zustand";
import type { OHLCVBar } from "@/types/market";

const INITIAL_REVEALED = 1300; // ~50 days × 26 bars/day (15m bars)

interface MarketDataState {
 allData: OHLCVBar[];
 revealedCount: number;
 isPlaying: boolean;
 /** 5m sub-bar step within current 15m bar (0, 1, 2) */
 subBarStep: number;

 setAllData: (data: OHLCVBar[]) => void;
 setRevealedCount: (n: number) => void;
 incrementRevealed: () => void;
 setIsPlaying: (playing: boolean) => void;
 setSubBarStep: (step: number) => void;
 reset: () => void;
 getCurrentBar: () => OHLCVBar | null;
 getVisibleData: () => OHLCVBar[];
}

export const useMarketDataStore = create<MarketDataState>((set, get) => ({
 allData: [],
 revealedCount: INITIAL_REVEALED,
 isPlaying: false,
 subBarStep: 2, // start fully revealed (all 3 sub-bars of last 15m bar)

 setAllData: (data) =>
 set((state) => {
 // Bail out early if the incoming data is referentially identical or
 // structurally the same (same length + same last bar timestamp), so
 // that downstream useMemos keyed on `allData` don't recompute.
 if (
  state.allData === data ||
  (state.allData.length === data.length &&
   data.length > 0 &&
   state.allData[data.length - 1]?.timestamp === data[data.length - 1]?.timestamp)
 ) {
  return {};
 }
 return {
  allData: data,
  revealedCount: Math.min(INITIAL_REVEALED, data.length),
  subBarStep: 2,
 };
 }),

 setRevealedCount: (n) =>
 set((state) => ({
 revealedCount: Math.max(1, Math.min(n, state.allData.length)),
 subBarStep: 2, // fully reveal sub-bars when jumping
 })),

 incrementRevealed: () =>
 set((state) => ({
 revealedCount: Math.min(state.revealedCount + 1, state.allData.length),
 })),

 setIsPlaying: (playing) => set({ isPlaying: playing }),
 setSubBarStep: (step) => set({ subBarStep: step }),

 reset: () =>
 set((state) => ({
 revealedCount: Math.min(INITIAL_REVEALED, state.allData.length),
 isPlaying: false,
 subBarStep: 2,
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
