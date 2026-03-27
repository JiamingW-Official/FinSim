import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DefaultOrderType = "market" | "limit" | "stop" | "stop-limit";
export type DecimalPlaces = 2 | 4 | 6;
export type SlippageModel = "none" | "low" | "realistic" | "high";
export type FontSize = "sm" | "md" | "lg";
export type ChartStyle = "candlestick" | "ohlc" | "line" | "area";
export type DefaultTimeframe = "5m" | "15m" | "1h" | "1d" | "1wk";
export type DefaultInstrument = "stock" | "options" | "crypto";
export type AppTheme = "dark" | "light" | "system";
export type PnLColorScheme = "default" | "colorblind";
export type RiskTolerance = "conservative" | "moderate" | "aggressive";
export type TradingExperience = "beginner" | "intermediate" | "advanced" | "expert";
export type InvestmentGoal = "learn" | "wealth" | "income" | "speculation";

interface TradingPreferencesState {
  // ── Trading ────────────────────────────────────────────────────────────────
  /** Default order type pre-selected in the trade panel */
  defaultOrderType: DefaultOrderType;
  /** Default quantity for order entry */
  defaultQuantity: number;
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
  /** Default instrument type */
  defaultInstrument: DefaultInstrument;
  /** Risk per trade as % of account (0.5–5) */
  riskPerTradePct: number;
  /** Max daily loss limit in dollars */
  maxDailyLossLimit: number;
  /** Auto-stop trading when daily loss limit is hit */
  autoStopAtDailyLoss: boolean;

  // ── Display ─────────────────────────────────────────────────────────────────
  /** App-level theme preference */
  appTheme: AppTheme;
  /** Chart style */
  chartStyle: ChartStyle;
  /** Default timeframe for the chart */
  defaultTimeframe: DefaultTimeframe;
  /** Show volume bars on chart */
  showVolume: boolean;
  /** Show grid lines on chart */
  showGridLines: boolean;
  /** Animate chart transitions */
  chartAnimation: boolean;
  /** Chart / UI color theme (for chart-specific theming) */
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
  /** P&L color scheme */
  pnlColorScheme: PnLColorScheme;

  // ── Notifications ──────────────────────────────────────────────────────────
  /** Enable price alerts */
  priceAlertsEnabled: boolean;
  /** Enable achievement alerts */
  achievementAlertsEnabled: boolean;
  /** Enable level-up alerts */
  levelUpAlertsEnabled: boolean;
  /** Enable daily reminder notification */
  dailyReminderEnabled: boolean;
  /** Daily reminder hour (0–23) */
  dailyReminderHour: number;
  /** Enable AI coach suggestions */
  aiCoachSuggestionsEnabled: boolean;
  /** Enable sound effects */
  soundEffectsEnabled: boolean;
  /** Sound volume 0–100 */
  soundVolume: number;

  // ── Account / Profile ──────────────────────────────────────────────────────
  /** Trading experience level */
  tradingExperience: TradingExperience;
  /** Risk tolerance profile */
  riskTolerance: RiskTolerance;
  /** Investment goals (multi-select) */
  investmentGoals: InvestmentGoal[];

  // ── Execution quality stats ────────────────────────────────────────────────
  /** Accumulated stats for execution quality report */
  totalSlippagePaid: number;
  totalCommissionPaid: number;
  totalTradesTracked: number;
  /** Sum of (estimated - actual) fill price deltas in dollars (positive = saved money) */
  totalFillSavings: number;

  // ── Setters — Trading ──────────────────────────────────────────────────────
  setDefaultOrderType: (t: DefaultOrderType) => void;
  setDefaultQuantity: (q: number) => void;
  setDefaultPositionSizePct: (pct: number) => void;
  setProMode: (v: boolean) => void;
  setShowCommissions: (v: boolean) => void;
  setSlippageModel: (m: SlippageModel) => void;
  setShowTradeConfirmation: (v: boolean) => void;
  setAutoStopLossEnabled: (v: boolean) => void;
  setAutoStopLossPct: (pct: number) => void;
  setDefaultInstrument: (i: DefaultInstrument) => void;
  setRiskPerTradePct: (pct: number) => void;
  setMaxDailyLossLimit: (limit: number) => void;
  setAutoStopAtDailyLoss: (v: boolean) => void;

  // ── Setters — Display ───────────────────────────────────────────────────────
  setAppTheme: (t: AppTheme) => void;
  setChartStyle: (s: ChartStyle) => void;
  setDefaultTimeframe: (tf: DefaultTimeframe) => void;
  setShowVolume: (v: boolean) => void;
  setShowGridLines: (v: boolean) => void;
  setChartAnimation: (v: boolean) => void;
  setChartTheme: (t: "dark" | "light") => void;
  setCompactMode: (v: boolean) => void;
  setAnimatePageTransitions: (v: boolean) => void;
  setFontSize: (s: FontSize) => void;
  setDecimalPlaces: (d: DecimalPlaces) => void;
  setShowPnLAsPct: (v: boolean) => void;
  setShowSidebarLabels: (v: boolean) => void;
  setPnlColorScheme: (s: PnLColorScheme) => void;

  // ── Setters — Notifications ────────────────────────────────────────────────
  setPriceAlertsEnabled: (v: boolean) => void;
  setAchievementAlertsEnabled: (v: boolean) => void;
  setLevelUpAlertsEnabled: (v: boolean) => void;
  setDailyReminderEnabled: (v: boolean) => void;
  setDailyReminderHour: (h: number) => void;
  setAiCoachSuggestionsEnabled: (v: boolean) => void;
  setSoundEffectsEnabled: (v: boolean) => void;
  setSoundVolume: (v: number) => void;

  // ── Setters — Account ──────────────────────────────────────────────────────
  setTradingExperience: (e: TradingExperience) => void;
  setRiskTolerance: (r: RiskTolerance) => void;
  setInvestmentGoals: (goals: InvestmentGoal[]) => void;
  toggleInvestmentGoal: (goal: InvestmentGoal) => void;

  // ── Execution tracking ─────────────────────────────────────────────────────
  toggleProMode: () => void;
  recordExecution: (slippage: number, commission: number, fillSavings: number) => void;
  resetStats: () => void;

  // ── Global reset ───────────────────────────────────────────────────────────
  resetAll: () => void;
}

const DEFAULTS = {
  defaultOrderType: "market" as DefaultOrderType,
  defaultQuantity: 10,
  defaultPositionSizePct: 5,
  proMode: false,
  showCommissions: true,
  slippageModel: "realistic" as SlippageModel,
  showTradeConfirmation: true,
  autoStopLossEnabled: false,
  autoStopLossPct: 5,
  defaultInstrument: "stock" as DefaultInstrument,
  riskPerTradePct: 1,
  maxDailyLossLimit: 500,
  autoStopAtDailyLoss: false,

  appTheme: "dark" as AppTheme,
  chartStyle: "candlestick" as ChartStyle,
  defaultTimeframe: "1d" as DefaultTimeframe,
  showVolume: true,
  showGridLines: true,
  chartAnimation: true,
  chartTheme: "dark" as "dark" | "light",
  compactMode: false,
  animatePageTransitions: true,
  fontSize: "md" as FontSize,
  decimalPlaces: 2 as DecimalPlaces,
  showPnLAsPct: false,
  showSidebarLabels: false,
  pnlColorScheme: "default" as PnLColorScheme,

  priceAlertsEnabled: true,
  achievementAlertsEnabled: true,
  levelUpAlertsEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderHour: 9,
  aiCoachSuggestionsEnabled: true,
  soundEffectsEnabled: true,
  soundVolume: 70,

  tradingExperience: "beginner" as TradingExperience,
  riskTolerance: "moderate" as RiskTolerance,
  investmentGoals: ["learn"] as InvestmentGoal[],

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
      setDefaultQuantity: (q) => set({ defaultQuantity: q }),
      setDefaultPositionSizePct: (pct) => set({ defaultPositionSizePct: pct }),
      setProMode: (v) => set({ proMode: v }),
      setShowCommissions: (v) => set({ showCommissions: v }),
      setSlippageModel: (m) => set({ slippageModel: m }),
      setShowTradeConfirmation: (v) => set({ showTradeConfirmation: v }),
      setAutoStopLossEnabled: (v) => set({ autoStopLossEnabled: v }),
      setAutoStopLossPct: (pct) => set({ autoStopLossPct: pct }),
      setDefaultInstrument: (i) => set({ defaultInstrument: i }),
      setRiskPerTradePct: (pct) => set({ riskPerTradePct: pct }),
      setMaxDailyLossLimit: (limit) => set({ maxDailyLossLimit: limit }),
      setAutoStopAtDailyLoss: (v) => set({ autoStopAtDailyLoss: v }),

      setAppTheme: (t) => set({ appTheme: t }),
      setChartStyle: (s) => set({ chartStyle: s }),
      setDefaultTimeframe: (tf) => set({ defaultTimeframe: tf }),
      setShowVolume: (v) => set({ showVolume: v }),
      setShowGridLines: (v) => set({ showGridLines: v }),
      setChartAnimation: (v) => set({ chartAnimation: v }),
      setChartTheme: (t) => set({ chartTheme: t }),
      setCompactMode: (v) => set({ compactMode: v }),
      setAnimatePageTransitions: (v) => set({ animatePageTransitions: v }),
      setFontSize: (s) => set({ fontSize: s }),
      setDecimalPlaces: (d) => set({ decimalPlaces: d }),
      setShowPnLAsPct: (v) => set({ showPnLAsPct: v }),
      setShowSidebarLabels: (v) => set({ showSidebarLabels: v }),
      setPnlColorScheme: (s) => set({ pnlColorScheme: s }),

      setPriceAlertsEnabled: (v) => set({ priceAlertsEnabled: v }),
      setAchievementAlertsEnabled: (v) => set({ achievementAlertsEnabled: v }),
      setLevelUpAlertsEnabled: (v) => set({ levelUpAlertsEnabled: v }),
      setDailyReminderEnabled: (v) => set({ dailyReminderEnabled: v }),
      setDailyReminderHour: (h) => set({ dailyReminderHour: h }),
      setAiCoachSuggestionsEnabled: (v) => set({ aiCoachSuggestionsEnabled: v }),
      setSoundEffectsEnabled: (v) => set({ soundEffectsEnabled: v }),
      setSoundVolume: (v) => set({ soundVolume: v }),

      setTradingExperience: (e) => set({ tradingExperience: e }),
      setRiskTolerance: (r) => set({ riskTolerance: r }),
      setInvestmentGoals: (goals) => set({ investmentGoals: goals }),
      toggleInvestmentGoal: (goal) =>
        set((s) => ({
          investmentGoals: s.investmentGoals.includes(goal)
            ? s.investmentGoals.filter((g) => g !== goal)
            : [...s.investmentGoals, goal],
        })),

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
