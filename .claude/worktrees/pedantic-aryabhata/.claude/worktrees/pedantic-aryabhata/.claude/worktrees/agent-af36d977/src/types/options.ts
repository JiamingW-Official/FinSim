export type OptionType = "call" | "put";
export type OptionSide = "buy" | "sell";
export type OptionStyle = "european" | "american";

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number; // per-day decay
  vega: number; // per 1% IV change
  rho: number;
  // Second-order
  vanna: number;
  charm: number;
  vomma: number;
  speed: number;
}

export interface OptionContract {
  ticker: string;
  type: OptionType;
  strike: number;
  expiry: string; // ISO date "2024-03-15"
  daysToExpiry: number;
  style: OptionStyle;
  bid: number;
  ask: number;
  mid: number;
  last: number;
  iv: number;
  volume: number;
  openInterest: number;
  greeks: Greeks;
  inTheMoney: boolean;
}

export interface OptionChainExpiry {
  expiry: string;
  daysToExpiry: number;
  calls: OptionContract[];
  puts: OptionContract[];
}

export interface StrategyLeg {
  type: OptionType;
  side: OptionSide;
  strike: number;
  expiry: string;
  quantity: number; // number of contracts (each = 100 shares)
  price: number; // premium per share
  greeks: Greeks;
}

export interface StrategyPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  legs: Omit<StrategyLeg, "strike" | "expiry" | "price" | "greeks">[];
  strikeOffsets: number[];
  maxProfit: string;
  maxLoss: string;
  sentiment: "bullish" | "bearish" | "neutral" | "volatile";
}

export interface OptionsPosition {
  id: string;
  ticker: string;
  legs: StrategyLeg[];
  strategyName: string;
  openedAt: number;
  netDebit: number; // positive = debit, negative = credit
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  totalGreeks: Greeks;
}

export interface OptionsTradeRecord {
  id: string;
  ticker: string;
  strategyName: string;
  legs: StrategyLeg[];
  side: "open" | "close";
  netDebit: number;
  realizedPnL: number;
  fees: number;
  timestamp: number;
  simulationDate: number;
}

export interface PayoffPoint {
  spotPrice: number;
  pnl: number; // at expiry
  pnlCurrentTime: number; // at current time-to-expiry
}

export const RISK_FREE_RATE = 0.05;
export const CONTRACT_MULTIPLIER = 100;

// ── Analytics types ────────────────────────────────────────────────────────

export interface ChainAnalytics {
  totalCallVolume: number;
  totalPutVolume: number;
  putCallRatioVolume: number;
  totalCallOI: number;
  totalPutOI: number;
  putCallRatioOI: number;
  atmIV: number;
  historicalVolatility: number;
  ivRank: number;         // 0-100: how high current IV is vs simulated 52-wk range
  ivPercentile: number;   // 0-100: % of simulated days where IV was below current
  ivVsHvSpread: number;   // atmIV - hv (positive = expensive options)
  expectedMove1SD: number; // ±$ move at front-month expiry (1 std dev)
  heatScore: number;      // 0-100 composite activity score
}

export interface UnusualActivityItem {
  id: string;
  ticker: string;
  expiry: string;
  dte: number;
  strike: number;
  type: OptionType;
  side: "ask" | "bid";
  sentiment: "bullish" | "bearish" | "neutral";
  orderType: "floor" | "sweep" | "normal";
  size: number;       // number of contracts
  price: number;      // premium per share
  premium: number;    // total premium = price * size * 100
  bid: number;
  ask: number;
  timestamp: number;  // ms since epoch (within last 2 hours)
}

export interface StrategyRecommendation {
  preset: StrategyPreset;
  legs: StrategyLeg[];
  probabilityOfProfit: number; // 0-100
  probabilityITM: number;      // 0-100
  maxProfit: number | "unlimited";
  maxLoss: number | "unlimited";
  returnOnRisk: number;        // |maxProfit| / |maxLoss| if both finite, else 0
  breakevens: number[];
  miniPayoff: { x: number; y: number }[]; // 20-pt normalized curve (x=spotPct, y=pnl)
}

export type OptionSentiment =
  | "bullish"
  | "very_bullish"
  | "neutral"
  | "directional"
  | "very_bearish"
  | "bearish";

export interface ChainFilters {
  typeFilter: "both" | "call" | "put";
  moneynessFilter: "all" | "atm" | "itm" | "otm";
}
