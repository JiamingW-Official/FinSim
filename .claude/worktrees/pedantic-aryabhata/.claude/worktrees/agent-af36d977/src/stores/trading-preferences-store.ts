import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Timeframe } from "@/types/market";
import type { IndicatorType } from "@/stores/chart-store";

export type DefaultOrderType = "market" | "limit" | "stop";
export type DecimalPlaces = 2 | 4 | 6;
export type ChartStyle = "candles" | "bars" | "line" | "area";
export type CrosshairStyle = "normal" | "magnet";

interface TradingPreferencesState {
  // Trading Preferences
  defaultOrderType: DefaultOrderType;
  defaultPositionSizePct: number; // 1–20
  riskPerTradeDollar: number; // max risk per trade in dollars
  autoCalculateSizeFromRisk: boolean;
  preferredTimeframe: Timeframe;
  showTradeConfirmation: boolean;
  autoStopLossEnabled: boolean;
  autoStopLossPct: number; // e.g. 5 means 5% below entry

  // Chart Settings
  defaultIndicators: IndicatorType[];
  chartStyle: ChartStyle;
  chartTheme: "dark" | "light";
  crosshairStyle: CrosshairStyle;
  decimalPlaces: DecimalPlaces;
  showPnLAsPct: boolean;

  // Notifications
  notifAchievements: boolean;
  notifDailyMissions: boolean;
  notifAICoach: boolean;
  notifLevelUp: boolean;
  alertLevelBreachToasts: boolean;
  alertAchievementToasts: boolean;
  alertBarAdvanceCommentary: boolean;

  // Display
  compactMode: boolean;
  showSidebarLabels: boolean;
  animatePageTransitions: boolean;

  // Setters — Trading
  setDefaultOrderType: (t: DefaultOrderType) => void;
  setDefaultPositionSizePct: (pct: number) => void;
  setRiskPerTradeDollar: (v: number) => void;
  setAutoCalculateSizeFromRisk: (v: boolean) => void;
  setPreferredTimeframe: (tf: Timeframe) => void;
  setShowTradeConfirmation: (v: boolean) => void;
  setAutoStopLossEnabled: (v: boolean) => void;
  setAutoStopLossPct: (pct: number) => void;

  // Setters — Chart
  setDefaultIndicators: (inds: IndicatorType[]) => void;
  toggleDefaultIndicator: (ind: IndicatorType) => void;
  setChartStyle: (s: ChartStyle) => void;
  setChartTheme: (t: "dark" | "light") => void;
  setCrosshairStyle: (s: CrosshairStyle) => void;
  setDecimalPlaces: (d: DecimalPlaces) => void;
  setShowPnLAsPct: (v: boolean) => void;

  // Setters — Notifications
  setNotifAchievements: (v: boolean) => void;
  setNotifDailyMissions: (v: boolean) => void;
  setNotifAICoach: (v: boolean) => void;
  setNotifLevelUp: (v: boolean) => void;
  setAlertLevelBreachToasts: (v: boolean) => void;
  setAlertAchievementToasts: (v: boolean) => void;
  setAlertBarAdvanceCommentary: (v: boolean) => void;

  // Setters — Display
  setCompactMode: (v: boolean) => void;
  setShowSidebarLabels: (v: boolean) => void;
  setAnimatePageTransitions: (v: boolean) => void;

  resetAll: () => void;
}

type Defaults = Omit<
  TradingPreferencesState,
  | "setDefaultOrderType"
  | "setDefaultPositionSizePct"
  | "setRiskPerTradeDollar"
  | "setAutoCalculateSizeFromRisk"
  | "setPreferredTimeframe"
  | "setShowTradeConfirmation"
  | "setAutoStopLossEnabled"
  | "setAutoStopLossPct"
  | "setDefaultIndicators"
  | "toggleDefaultIndicator"
  | "setChartStyle"
  | "setChartTheme"
  | "setCrosshairStyle"
  | "setDecimalPlaces"
  | "setShowPnLAsPct"
  | "setNotifAchievements"
  | "setNotifDailyMissions"
  | "setNotifAICoach"
  | "setNotifLevelUp"
  | "setAlertLevelBreachToasts"
  | "setAlertAchievementToasts"
  | "setAlertBarAdvanceCommentary"
  | "setCompactMode"
  | "setShowSidebarLabels"
  | "setAnimatePageTransitions"
  | "resetAll"
>;

const DEFAULTS: Defaults = {
  defaultOrderType: "market",
  defaultPositionSizePct: 5,
  riskPerTradeDollar: 200,
  autoCalculateSizeFromRisk: false,
  preferredTimeframe: "15m",
  showTradeConfirmation: true,
  autoStopLossEnabled: false,
  autoStopLossPct: 5,

  defaultIndicators: [],
  chartStyle: "candles",
  chartTheme: "dark",
  crosshairStyle: "normal",
  decimalPlaces: 2,
  showPnLAsPct: false,

  notifAchievements: true,
  notifDailyMissions: true,
  notifAICoach: true,
  notifLevelUp: true,
  alertLevelBreachToasts: true,
  alertAchievementToasts: true,
  alertBarAdvanceCommentary: true,

  compactMode: false,
  showSidebarLabels: false,
  animatePageTransitions: true,
};

export const useTradingPreferencesStore = create<TradingPreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setDefaultOrderType: (t) => set({ defaultOrderType: t }),
      setDefaultPositionSizePct: (pct) => set({ defaultPositionSizePct: pct }),
      setRiskPerTradeDollar: (v) => set({ riskPerTradeDollar: v }),
      setAutoCalculateSizeFromRisk: (v) => set({ autoCalculateSizeFromRisk: v }),
      setPreferredTimeframe: (tf) => set({ preferredTimeframe: tf }),
      setShowTradeConfirmation: (v) => set({ showTradeConfirmation: v }),
      setAutoStopLossEnabled: (v) => set({ autoStopLossEnabled: v }),
      setAutoStopLossPct: (pct) => set({ autoStopLossPct: pct }),

      setDefaultIndicators: (inds) => set({ defaultIndicators: inds }),
      toggleDefaultIndicator: (ind) =>
        set((s) => ({
          defaultIndicators: s.defaultIndicators.includes(ind)
            ? s.defaultIndicators.filter((i) => i !== ind)
            : [...s.defaultIndicators, ind],
        })),
      setChartStyle: (style) => set({ chartStyle: style }),
      setChartTheme: (t) => set({ chartTheme: t }),
      setCrosshairStyle: (s) => set({ crosshairStyle: s }),
      setDecimalPlaces: (d) => set({ decimalPlaces: d }),
      setShowPnLAsPct: (v) => set({ showPnLAsPct: v }),

      setNotifAchievements: (v) => set({ notifAchievements: v }),
      setNotifDailyMissions: (v) => set({ notifDailyMissions: v }),
      setNotifAICoach: (v) => set({ notifAICoach: v }),
      setNotifLevelUp: (v) => set({ notifLevelUp: v }),
      setAlertLevelBreachToasts: (v) => set({ alertLevelBreachToasts: v }),
      setAlertAchievementToasts: (v) => set({ alertAchievementToasts: v }),
      setAlertBarAdvanceCommentary: (v) => set({ alertBarAdvanceCommentary: v }),

      setCompactMode: (v) => set({ compactMode: v }),
      setShowSidebarLabels: (v) => set({ showSidebarLabels: v }),
      setAnimatePageTransitions: (v) => set({ animatePageTransitions: v }),

      resetAll: () => set({ ...DEFAULTS }),
    }),
    { name: "finsim_settings" },
  ),
);
