import { create } from "zustand";
import type { Timeframe } from "@/types/market";

export type IndicatorType =
  | "sma20"
  | "sma50"
  | "ema12"
  | "ema26"
  | "bollinger"
  | "rsi";

interface ChartState {
  currentTicker: string;
  currentTimeframe: Timeframe;
  activeIndicators: IndicatorType[];
  setTicker: (ticker: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  toggleIndicator: (ind: IndicatorType) => void;
}

export const useChartStore = create<ChartState>((set) => ({
  currentTicker: "AAPL",
  currentTimeframe: "1d",
  activeIndicators: [],
  setTicker: (ticker) => set({ currentTicker: ticker }),
  setTimeframe: (tf) => set({ currentTimeframe: tf }),
  toggleIndicator: (ind) =>
    set((state) => ({
      activeIndicators: state.activeIndicators.includes(ind)
        ? state.activeIndicators.filter((i) => i !== ind)
        : [...state.activeIndicators, ind],
    })),
}));
