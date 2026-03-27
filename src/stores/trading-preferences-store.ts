import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DefaultOrderType = "market" | "limit" | "stop";
export type DecimalPlaces = 2 | 4 | 6;
export type SlippageModel = "none" | "low" | "realistic" | "high";
export type FontSize = "sm" | "md" | "lg";

interface TradingPreferencesState {
  // ── Trading ────────────────────────────────────────────────────────────────
  /** Default order type pre-selected in the trade panel */
  defaultOrderType: DefaultOrderType;
  /** Default position size as % of portfolio (1–25) */
  defaultPositionSizePct: number;
  /** Pro mode: enables per-share/per-contract commissions instead of $0 */
  proMode: boolean;
  /** Show commission cost in order entry and trade history */
  showCommissions: boolean;
  /** Simulated slippage model applied to fills */
  slippageModel: SlippageModel;
  /** Show confirmation dialog before executing trades */
  showTradeConfirmation: boolean;
  /** Automatically place a stop-loss on entry */
  autoStopLossEnabled: boolean;
  /** Stop-loss % below entry price */
  autoStopLossPct: number;

  // ── Appearance ─────────────────────────────────────────────────────────────
  /** Chart / UI color theme */
  chartTheme: "dark" | "light";
  /** Reduce padding across the dashboard */
  compactMode: boolean;
  /** Smooth page transition animations */
  animatePageTransitions: boolean;
  /** Font size preference for UI text */
  fontSize: FontSize;
  /** Number of decimal places for prices and P&L */
  decimalPlaces: DecimalPlaces;
  /** Show P&L as percentage instead of dollar amount */
  showPnLAsPct: boolean;
  /** Show text labels next to sidebar navigation icons */
  showSidebarLabels: boolean;

  // ── Execution quality stats ────────────────────────────────────────────────
  /** Accumulated stats for execution quality report */
  totalSlippagePaid: number;
  totalCommissionPaid: number;
  totalTradesTracked: number;
  /** Sum of (estimated - actual) fill price deltas in dollars (positive = saved money) */
  totalFillSavings: number;

  // ── Setters — Trading ──────────────────────────────────────────────────────
  setDefaultOrderType: (t: DefaultOrderType) => void;
  setDefaultPositionSizePct: (pct: number) => void;
  setProMode: (v: boolean) => void;
  setShowCommissions: (v: boolean) => void;
  setSlippageModel: (m: SlippageModel) => void;
  setShowTradeConfirmation: (v: boolean) => void;
  setAutoStopLossEnabled: (v: boolean) => void;
  setAutoStopLossPct: (pct: number) => void;

  // ── Setters — Appearance ───────────────────────────────────────────────────
  setChartTheme: (t: "dark" | "light") => void;
  setCompactMode: (v: boolean) => void;
  setAnimatePageTransitions: (v: boolean) => void;
  setFontSize: (s: FontSize) => void;
  setDecimalPlaces: (d: DecimalPlaces) => void;
  setShowPnLAsPct: (v: boolean) => void;
  setShowSidebarLabels: (v: boolean) => void;

  // ── Execution tracking ─────────────────────────────────────────────────────
  toggleProMode: () => void;
  recordExecution: (slippage: number, commission: number, fillSavings: number) => void;
  resetStats: () => void;

  // ── Global reset ───────────────────────────────────────────────────────────
  resetAll: () => void;
}

const DEFAULTS = {
  defaultOrderType: "market" as DefaultOrderType,
  defaultPositionSizePct: 5,
  proMode: false,
  showCommissions: true,
  slippageModel: "realistic" as SlippageModel,
  showTradeConfirmation: true,
  autoStopLossEnabled: false,
  autoStopLossPct: 5,

  chartTheme: "dark" as "dark" | "light",
  compactMode: false,
  animatePageTransitions: true,
  fontSize: "md" as FontSize,
  decimalPlaces: 2 as DecimalPlaces,
  showPnLAsPct: false,
  showSidebarLabels: false,

  totalSlippagePaid: 0,
  totalCommissionPaid: 0,
  totalTradesTracked: 0,
  totalFillSavings: 0,
};

export const useTradingPreferencesStore = create<TradingPreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setDefaultOrderType: (t) => set({ defaultOrderType: t }),
      setDefaultPositionSizePct: (pct) => set({ defaultPositionSizePct: pct }),
      setProMode: (v) => set({ proMode: v }),
      setShowCommissions: (v) => set({ showCommissions: v }),
      setSlippageModel: (m) => set({ slippageModel: m }),
      setShowTradeConfirmation: (v) => set({ showTradeConfirmation: v }),
      setAutoStopLossEnabled: (v) => set({ autoStopLossEnabled: v }),
      setAutoStopLossPct: (pct) => set({ autoStopLossPct: pct }),

      setChartTheme: (t) => set({ chartTheme: t }),
      setCompactMode: (v) => set({ compactMode: v }),
      setAnimatePageTransitions: (v) => set({ animatePageTransitions: v }),
      setFontSize: (s) => set({ fontSize: s }),
      setDecimalPlaces: (d) => set({ decimalPlaces: d }),
      setShowPnLAsPct: (v) => set({ showPnLAsPct: v }),
      setShowSidebarLabels: (v) => set({ showSidebarLabels: v }),

      toggleProMode: () => set((s) => ({ proMode: !s.proMode })),
      recordExecution: (slippage, commission, fillSavings) =>
        set((s) => ({
          totalSlippagePaid: s.totalSlippagePaid + slippage,
          totalCommissionPaid: s.totalCommissionPaid + commission,
          totalTradesTracked: s.totalTradesTracked + 1,
          totalFillSavings: s.totalFillSavings + fillSavings,
        })),
      resetStats: () =>
        set({
          totalSlippagePaid: 0,
          totalCommissionPaid: 0,
          totalTradesTracked: 0,
          totalFillSavings: 0,
        }),

      resetAll: () => set({ ...DEFAULTS }),
    }),
    {
      name: "finsim_settings",
    },
  ),
);
