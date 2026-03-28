export type OrderSide = "buy" | "sell";
export type OrderType =
  | "market"
  | "limit"
  | "stop_loss"
  | "take_profit"
  | "bracket"
  | "oco"
  | "trailing_stop"
  | "conditional";
export type OrderStatus = "filled" | "cancelled" | "rejected" | "pending";

export type ConditionalTriggerType =
  | "price_above"
  | "price_below"
  | "rsi_above"
  | "rsi_below"
  | "volume_spike";

export interface ConditionalTrigger {
  type: ConditionalTriggerType;
  value: number;
}

export interface Order {
  id: string;
  ticker: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  status: OrderStatus;
  filledQty: number;
  avgFillPrice: number;
  limitPrice?: number;
  stopPrice?: number;
  takeProfitPrice?: number;
  fees?: number;
  slippage?: number;
  createdAt: number;
  filledAt?: number;

  // Bracket order fields
  bracketStopPrice?: number;
  bracketTakeProfitPrice?: number;
  bracketGroupId?: string;

  // OCO fields
  ocoGroupId?: string;
  ocoPriceA?: number;  // buy-stop above resistance
  ocoPriceB?: number;  // buy-limit below support

  // Trailing stop fields
  trailAmount?: number;   // absolute trail distance
  trailPercent?: number;  // % trail distance (used instead of trailAmount when set)
  trailHighWater?: number; // highest price seen since activation

  // Conditional / GTC fields
  condition?: ConditionalTrigger;
}

export interface Position {
  ticker: string;
  quantity: number;
  avgPrice: number;
  side: "long" | "short";
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface TradeRecord {
  id: string;
  ticker: string;
  side: OrderSide;
  quantity: number;
  price: number;
  realizedPnL: number;
  fees: number;
  slippage: number;
  timestamp: number;
  simulationDate: number;
  notes?: string;
  tags?: string[];
}

export interface EquitySnapshot {
  timestamp: number;
  portfolioValue: number;
  cash: number;
  positionsValue: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

export const INITIAL_CAPITAL = 100_000;
