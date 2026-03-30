import type { ScenarioGrade } from "@/types/challenges";

// ── Indicator sources for strategy rules ────────────────────────

export type IndicatorSource =
  | "price"
  | "sma20"
  | "sma50"
  | "ema12"
  | "ema26"
  | "rsi14"
  | "macd_line"
  | "macd_signal"
  | "bollinger_upper"
  | "bollinger_lower"
  | "bollinger_middle"
  | "atr14"
  | "stoch_k"
  | "stoch_d"
  | "vwap";

export type ConditionOperator =
  | "crosses_above"
  | "crosses_below"
  | "greater_than"
  | "less_than";

export interface ConditionRule {
  id: string;
  source: IndicatorSource;
  operator: ConditionOperator;
  target: IndicatorSource | number;
  label: string;
}

// ── Exit types ──────────────────────────────────────────────────

export type ExitType =
  | { kind: "condition"; rule: ConditionRule }
  | { kind: "bars_held"; count: number }
  | { kind: "profit_target"; percent: number }
  | { kind: "stop_loss"; percent: number }
  | { kind: "trailing_stop"; percent: number }
  | { kind: "atr_stop"; multiplier: number };

// ── Position sizing ─────────────────────────────────────────────

export type PositionSizing =
  | { kind: "fixed_shares"; shares: number }
  | { kind: "percent_of_capital"; percent: number }
  | { kind: "kelly_criterion"; maxPercent: number };

// ── Strategy configuration ──────────────────────────────────────

export interface StrategyConfig {
  id: string;
  name: string;
  ticker: string;
  entryRules: ConditionRule[];
  exitRules: ExitType[];
  positionSizing: PositionSizing;
  direction: "long" | "short";
  /** Min bars of indicator warmup before first trade allowed */
  warmupBars: number;
  /** Max simultaneous open trades (currently 1) */
  maxOpenTrades: number;
}

// ── Backtest configuration ──────────────────────────────────────

export type BarGenPreset =
  | "trending_up"
  | "trending_down"
  | "sideways"
  | "volatile"
  | "random";

export interface BacktestConfig {
  strategy: StrategyConfig;
  barCount: number;
  startingCapital: number;
  seed: number;
  barGenPreset: BarGenPreset;
  /** Number of Monte Carlo runs (0 = disabled, 50-200 typical) */
  monteCarloRuns: number;
}

// ── Backtest results ────────────────────────────────────────────

export interface BacktestTrade {
  id: string;
  entryBar: number;
  exitBar: number;
  entryPrice: number;
  exitPrice: number;
  direction: "long" | "short";
  shares: number;
  pnl: number;
  pnlPercent: number;
  commission: number;
  holdingBars: number;
  exitReason: string;
  /** Maximum Adverse Excursion — worst drawdown during trade */
  mae: number;
  /** Maximum Favorable Excursion — best unrealized gain during trade */
  mfe: number;
}

export interface BacktestEquityPoint {
  bar: number;
  value: number;
}

export interface DrawdownPoint {
  bar: number;
  drawdown: number;
  drawdownPercent: number;
}

export interface PeriodReturn {
  /** Period index (0-based, each ~20 bars) */
  period: number;
  label: string;
  returnPercent: number;
  trades: number;
}

// ── Advanced metrics ────────────────────────────────────────────

export interface BacktestMetrics {
  // Core
  totalReturn: number;
  totalReturnPercent: number;
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  avgHoldingBars: number;
  totalCommissions: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;

  // Advanced risk metrics
  sortinoRatio: number;
  calmarRatio: number;
  /** avg PnL per trade (win_rate * avg_win - loss_rate * avg_loss) */
  expectancy: number;
  /** totalReturn / maxDrawdown */
  recoveryFactor: number;
  /** avgWin / avgLoss */
  payoffRatio: number;
  /** Ulcer Performance Index — penalizes prolonged drawdowns */
  ulcerIndex: number;
  /** Percent of bars where a position is open */
  timeInMarket: number;

  // Trade quality
  avgMAE: number;
  avgMFE: number;
  /** Ratio of realized P&L to MFE — how much edge was captured */
  edgeCaptureRatio: number;

  // Distribution
  medianTradePnl: number;
  stdDevTradePnl: number;
  skewness: number;
  kurtosis: number;
}

export interface BacktestBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface BacktestResult {
  id: string;
  config: BacktestConfig;
  trades: BacktestTrade[];
  equityCurve: BacktestEquityPoint[];
  drawdownCurve: DrawdownPoint[];
  periodReturns: PeriodReturn[];
  metrics: BacktestMetrics;
  grade: ScenarioGrade;
  bars: BacktestBar[];
  completedAt: number;
}

// ── Monte Carlo simulation ──────────────────────────────────────

export interface MonteCarloRun {
  seed: number;
  finalEquity: number;
  totalReturnPercent: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  equityCurve: BacktestEquityPoint[];
}

export interface MonteCarloResult {
  runs: MonteCarloRun[];
  /** Percentile bands for equity curves */
  percentiles: {
    p5: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p95: number[];
  };
  /** Distribution stats */
  returnDistribution: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    /** Probability of profit (% of runs with positive return) */
    profitProbability: number;
    /** Probability of losing > 10% */
    tailRisk10: number;
    /** Probability of gaining > 20% */
    upside20: number;
  };
}

// ── Saved strategy ──────────────────────────────────────────────

export interface SavedStrategy {
  id: string;
  strategy: StrategyConfig;
  bestGrade: ScenarioGrade;
  bestReturn: number;
  savedAt: number;
}

// ── Rule catalog entry ──────────────────────────────────────────

export type RuleCategory = "momentum" | "trend" | "mean-reversion" | "volatility";

export interface RuleCatalogEntry {
  id: string;
  label: string;
  description: string;
  category: RuleCategory;
  rule: ConditionRule;
}

// ── Strategy template system ────────────────────────────────────

export type StrategyDifficulty = 1 | 2 | 3 | 4 | 5;
export type StrategyCategory = "trend-following" | "mean-reversion" | "momentum" | "volatility" | "composite";

export interface StrategySignal {
  type: "entry" | "exit";
  label: string;
  description: string;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  category: StrategyCategory;
  difficulty: StrategyDifficulty;

  /** 2-3 paragraph theory explanation */
  theory: string;
  /** How the signals work */
  signals: StrategySignal[];
  /** Which market conditions it works best in */
  bestConditions: BarGenPreset[];
  /** Strengths of this approach */
  strengths: string[];
  /** Weaknesses/risks */
  weaknesses: string[];
  /** Key parameters that users can tune */
  keyParameters: { name: string; description: string; default: string }[];
  /** Historical context — who invented it, famous users */
  history: string;

  /** The actual strategy config to load */
  defaultConfig: Omit<StrategyConfig, "id" | "name" | "ticker">;
  /** Recommended presets */
  recommendedPreset: BarGenPreset;
  recommendedBars: number;
}
