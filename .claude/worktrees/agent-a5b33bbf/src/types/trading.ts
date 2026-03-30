export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop_loss" | "take_profit";
export type OrderStatus = "filled" | "cancelled" | "rejected" | "pending";

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
