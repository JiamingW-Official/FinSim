import { create } from "zustand";
import type { Timeframe } from "@/types/market";

export type IndicatorType =
  | "sma20"
  | "sma50"
  | "ema12"
  | "ema26"
  | "bollinger"
  | "rsi"
  | "macd"
  | "stochastic"
  | "atr"
  | "vwap"
  | "adx"
  | "obv"
  | "cci"
  | "williams_r"
  | "psar";

interface ChartState {
  currentTicker: string;
  currentTimeframe: Timeframe;
  activeIndicators: IndicatorType[];
  lastToggledIndicator: IndicatorType | null;
  setTicker: (ticker: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  toggleIndicator: (ind: IndicatorType) => void;
  clearLastToggled: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  currentTicker: "AAPL",
  currentTimeframe: "15m",
  activeIndicators: [],
  lastToggledIndicator: null,
  setTicker: (ticker) => set({ currentTicker: ticker }),
  setTimeframe: (tf) => set({ currentTimeframe: tf }),
  toggleIndicator: (ind) =>
    set((state) => {
      const isRemoving = state.activeIndicators.includes(ind);
      return {
        activeIndicators: isRemoving
          ? state.activeIndicators.filter((i) => i !== ind)
          : [...state.activeIndicators, ind],
        lastToggledIndicator: isRemoving ? null : ind,
      };
    }),
  clearLastToggled: () => set({ lastToggledIndicator: null }),
}));
