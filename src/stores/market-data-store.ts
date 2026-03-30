import { create } from "zustand";
import type { OHLCVBar } from "@/types/market";

const INITIAL_REVEALED = 1300; // ~50 days × 26 bars/day (15m bars)

// Game epoch: all bar timestamps are shifted so the FIRST bar = Jan 1, 2031.
// Real historical data is used for prices; only the displayed calendar is shifted.
const GAME_EPOCH_MS = Date.UTC(2031, 0, 1); // Jan 1, 2031 00:00 UTC

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

 setAllData: (data) => {
 // Shift all timestamps so the first bar lands exactly on Jan 1, 2031.
 let bars = data;
 if (data.length > 0) {
 const offset = GAME_EPOCH_MS - data[0].timestamp;
 bars = data.map((b) => ({ ...b, timestamp: b.timestamp + offset }));
 }
 return set({
 allData: bars,
 revealedCount: Math.min(INITIAL_REVEALED, bars.length),
 subBarStep: 2,
 });
 },

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
