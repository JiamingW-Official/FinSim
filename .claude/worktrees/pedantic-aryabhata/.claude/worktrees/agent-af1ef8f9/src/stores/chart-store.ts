import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Timeframe } from "@/types/market";

export type ChartStyle = "candles" | "bars" | "line" | "area";

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

export type DrawingTool =
  | "none"
  | "trendline"
  | "hline"
  | "rect"
  | "fib"
  | "text"
  | "eraser";

export interface DrawingPoint {
  x: number; // pixel x relative to chart container
  y: number; // pixel y relative to chart container
  price: number; // price value at this point
}

export type Drawing =
  | {
      id: string;
      type: "trendline";
      p1: DrawingPoint;
      p2: DrawingPoint;
      color: string;
    }
  | {
      id: string;
      type: "hline";
      price: number;
      color: string;
      label?: string;
    }
  | {
      id: string;
      type: "rect";
      p1: DrawingPoint;
      p2: DrawingPoint;
      color: string;
    }
  | {
      id: string;
      type: "fib";
      p1: DrawingPoint; // swing high or low (first click)
      p2: DrawingPoint; // other end (second click)
      color: string;
      levels: { ratio: number; price: number }[];
    }
  | {
      id: string;
      type: "text";
      p: DrawingPoint;
      text: string;
      color: string;
    };

interface ChartState {
  currentTicker: string;
  currentTimeframe: Timeframe;
  chartStyle: ChartStyle;
  activeIndicators: IndicatorType[];
  lastToggledIndicator: IndicatorType | null;
  // Drawing tools
  activeTool: DrawingTool;
  drawings: Drawing[];
  setTicker: (ticker: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  setChartStyle: (style: ChartStyle) => void;
  toggleIndicator: (ind: IndicatorType) => void;
  setActiveIndicators: (inds: IndicatorType[]) => void;
  clearLastToggled: () => void;
  setActiveTool: (tool: DrawingTool) => void;
  addDrawing: (drawing: Drawing) => void;
  removeDrawing: (id: string) => void;
  clearDrawings: () => void;
}

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      currentTicker: "AAPL",
      currentTimeframe: "15m",
      chartStyle: "candles",
      activeIndicators: [],
      lastToggledIndicator: null,
      activeTool: "none",
      drawings: [],
      setTicker: (ticker) => set({ currentTicker: ticker }),
      setTimeframe: (tf) => set({ currentTimeframe: tf }),
      setChartStyle: (style) => set({ chartStyle: style }),
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
      setActiveIndicators: (inds) => set({ activeIndicators: inds }),
      clearLastToggled: () => set({ lastToggledIndicator: null }),
      setActiveTool: (tool) => set({ activeTool: tool }),
      addDrawing: (drawing) =>
        set((state) => ({ drawings: [...state.drawings, drawing] })),
      removeDrawing: (id) =>
        set((state) => ({ drawings: state.drawings.filter((d) => d.id !== id) })),
      clearDrawings: () => set({ drawings: [] }),
    }),
    {
      name: "finsim-chart-prefs",
      partialize: (state) => ({
        chartStyle: state.chartStyle,
        currentTicker: state.currentTicker,
        currentTimeframe: state.currentTimeframe,
        activeIndicators: state.activeIndicators,
      }),
    },
  ),
);
