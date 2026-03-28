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

export type ChartType = "candlestick" | "heikin_ashi" | "line" | "area";

interface ChartState {
  currentTicker: string;
  currentTimeframe: Timeframe;
  activeIndicators: IndicatorType[];
  lastToggledIndicator: IndicatorType | null;
  chartType: ChartType;
  showVolume: boolean;
  showGrid: boolean;
  useLog: boolean;
  showEarnings: boolean;
  showDividends: boolean;
  setTicker: (ticker: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  toggleIndicator: (ind: IndicatorType) => void;
  clearLastToggled: () => void;
  setChartType: (type: ChartType) => void;
  setShowVolume: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setUseLog: (useLog: boolean) => void;
  setShowEarnings: (show: boolean) => void;
  setShowDividends: (show: boolean) => void;
}

export const useChartStore = create<ChartState>((set) => ({
  currentTicker: "AAPL",
  currentTimeframe: "15m",
  activeIndicators: [],
  lastToggledIndicator: null,
  chartType: "candlestick",
  showVolume: true,
  showGrid: true,
  useLog: false,
  showEarnings: false,
  showDividends: false,
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
  setChartType: (type) => set({ chartType: type }),
  setShowVolume: (show) => set({ showVolume: show }),
  setShowGrid: (show) => set({ showGrid: show }),
  setUseLog: (useLog) => set({ useLog }),
  setShowEarnings: (show) => set({ showEarnings: show }),
  setShowDividends: (show) => set({ showDividends: show }),
}));
