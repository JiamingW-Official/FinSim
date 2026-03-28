import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Order,
  OrderSide,
  Position,
  TradeRecord,
  EquitySnapshot,
  ConditionalTrigger,
} from "@/types/trading";
import { INITIAL_CAPITAL } from "@/types/trading";
import type { OHLCVBar } from "@/types/market";
import { generateId } from "@/lib/utils";
import { calculateFees } from "@/services/trading/fees";

// Helper: compute P&L based on position side
function computePnL(
  side: "long" | "short",
  currentPrice: number,
  avgPrice: number,
  quantity: number,
) {
  const pnl =
    side === "long"
      ? (currentPrice - avgPrice) * quantity
      : (avgPrice - currentPrice) * quantity;
  const pnlPercent =
    avgPrice !== 0
      ? side === "long"
        ? ((currentPrice - avgPrice) / avgPrice) * 100
        : ((avgPrice - currentPrice) / avgPrice) * 100
      : 0;
  return { pnl, pnlPercent };
}

// Seeded borrow rates per ticker (0.5–5% annualized)
// Uses a simple hash of the ticker string for determinism
function seedBorrowRate(ticker: string): number {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) {
    h = (h * 31 + ticker.charCodeAt(i)) & 0xffffffff;
  }
  const norm = Math.abs(h) / 0x7fffffff;
  // Range: 0.5% to 5%
  return Math.round((0.5 + norm * 4.5) * 100) / 100;
}

const KNOWN_TICKERS = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "SPY", "QQQ", "BTC"];
const BORROW_RATES: Record<string, number> = Object.fromEntries(
  KNOWN_TICKERS.map((t) => [t, seedBorrowRate(t)]),
);

interface TradingState {
  cash: number;
  positions: Position[];
  orders: Order[];
  pendingOrders: Order[];
  tradeHistory: TradeRecord[];
  portfolioValue: number;
  equityHistory: EquitySnapshot[];
  lastTradeFlash: { side: "buy" | "sell"; timestamp: number } | null;
  marginUsed: number;
  marginLimit: number;
  borrowRates: Record<string, number>;

  placeBuyOrder: (
    ticker: string,
    quantity: number,
    price: number,
    simulationDate: number,
  ) => Order | null;
  placeSellOrder: (
    ticker: string,
    quantity: number,
    price: number,
    simulationDate: number,
  ) => Order | null;
  placeShortOrder: (
    ticker: string,
    quantity: number,
    price: number,
    simulationDate: number,
  ) => Order | null;
  coverShortOrder: (
    ticker: string,
    quantity: number,
    price: number,
    simulationDate: number,
  ) => Order | null;
  placeLimitOrder: (
    ticker: string,
    side: OrderSide,
    quantity: number,
    limitPrice: number,
    simulationDate: number,
  ) => Order | null;
  placeStopLossOrder: (
    ticker: string,
    quantity: number,
    stopPrice: number,
    simulationDate: number,
  ) => Order | null;
  placeTakeProfitOrder: (
    ticker: string,
    quantity: number,
    takeProfitPrice: number,
    simulationDate: number,
  ) => Order | null;
  placeBracketOrder: (
    ticker: string,
    side: OrderSide,
    quantity: number,
    entryPrice: number,
    stopPrice: number,
    takeProfitPrice: number,
    simulationDate: number,
  ) => Order | null;
  placeOCOOrder: (
    ticker: string,
    quantity: number,
    priceA: number,
    priceB: number,
    simulationDate: number,
  ) => Order | null;
  placeTrailingStopOrder: (
    ticker: string,
    quantity: number,
    trailAmount: number,
    trailPercent: number | undefined,
    currentPrice: number,
    simulationDate: number,
  ) => Order | null;
  placeConditionalOrder: (
    ticker: string,
    side: OrderSide,
    quantity: number,
    limitPrice: number,
    condition: ConditionalTrigger,
    simulationDate: number,
  ) => Order | null;
  cancelPendingOrder: (orderId: string) => void;
  checkPendingOrders: (bar: OHLCVBar, simulationDate: number) => Order[];
  recordEquitySnapshot: (simulationDate: number) => void;
  updateTradeNotes: (
    tradeId: string,
    notes: string,
    tags?: string[],
  ) => void;
  updatePositionPrice: (ticker: string, currentPrice: number) => void;
  updateAllPositionPrices: (
    getPriceForTicker: (ticker: string) => number | null,
  ) => void;
  clearTradeFlash: () => void;
  resetPortfolio: () => void;
  deductCash: (amount: number) => boolean;
  addCash: (amount: number) => void;
  accrueMarginInterest: () => void;
  updateMarginMetrics: () => void;
}

function recalcPortfolioValue(
  cash: number,
  positions: Position[],
): number {
  // Long positions add value; short positions add unrealized P&L to equity
  const posValue = positions.reduce((sum, p) => {
    if (p.side === "long") return sum + p.quantity * p.currentPrice;
    // For short: equity contribution = unrealized P&L (entry - current) * qty
    return sum + p.unrealizedPnL;
  }, 0);
  return cash + posValue;
}

function computeMarginUsed(positions: Position[]): number {
  // Margin used = sum of short position current value (borrowed notional)
  return positions
    .filter((p) => p.side === "short")
    .reduce((sum, p) => sum + p.quantity * p.currentPrice, 0);
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      cash: INITIAL_CAPITAL,
      positions: [],
      orders: [],
      pendingOrders: [],
      tradeHistory: [],
      portfolioValue: INITIAL_CAPITAL,
      equityHistory: [],
      lastTradeFlash: null,
      marginUsed: 0,
      marginLimit: INITIAL_CAPITAL * 2, // 2× equity = 50% margin requirement
      borrowRates: BORROW_RATES,

      placeBuyOrder: (ticker, quantity, price, simulationDate) => {
        const state = get();
        const fees = calculateFees(price, quantity, "buy");

        if (fees.totalCost > state.cash) return null;

        const execPrice = fees.executionPrice;
        const order: Order = {
          id: generateId(),
          ticker,
          side: "buy",
          type: "market",
          quantity,
          status: "filled",
          filledQty: quantity,
          avgFillPrice: execPrice,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          createdAt: Date.now(),
          filledAt: Date.now(),
        };

        // If there's a short position, cover it first
        const existingPos = state.positions.find((p) => p.ticker === ticker);
        if (existingPos && existingPos.side === "short") {
          const coverQty = Math.min(quantity, existingPos.quantity);
          const { pnl } = computePnL("short", execPrice, existingPos.avgPrice, coverQty);
          const realizedPnL = pnl - fees.commission;
          const remainingShort = existingPos.quantity - coverQty;
          const remainingBuy = quantity - coverQty;

          let newPositions = remainingShort > 0
            ? state.positions.map((p) =>
                p.ticker === ticker
                  ? {
                      ...p,
                      quantity: remainingShort,
                      currentPrice: execPrice,
                      ...computePnL("short", execPrice, p.avgPrice, remainingShort),
                      unrealizedPnL: computePnL("short", execPrice, p.avgPrice, remainingShort).pnl,
                      unrealizedPnLPercent: computePnL("short", execPrice, p.avgPrice, remainingShort).pnlPercent,
                    }
                  : p,
              )
            : state.positions.filter((p) => p.ticker !== ticker);

          let newCash = state.cash - coverQty * execPrice - fees.commission + realizedPnL + coverQty * execPrice;
          // Simplified: cash changes by -(coverQty * execPrice) - commission + proceeds from closing short
          newCash = state.cash - fees.commission - (execPrice - existingPos.avgPrice) * coverQty;

          // If there's remaining buy qty, add as long position
          if (remainingBuy > 0) {
            const buyCost = remainingBuy * execPrice;
            newCash -= buyCost;
            newPositions = [
              ...newPositions,
              {
                ticker,
                quantity: remainingBuy,
                avgPrice: execPrice,
                side: "long" as const,
                currentPrice: execPrice,
                unrealizedPnL: 0,
                unrealizedPnLPercent: 0,
                openedAtTimestamp: simulationDate,
              },
            ];
          }

          const trade: TradeRecord = {
            id: generateId(),
            ticker,
            side: "buy",
            quantity,
            price: execPrice,
            realizedPnL,
            fees: fees.commission,
            slippage: fees.slippageAmount,
            timestamp: Date.now(),
            simulationDate,
          };

          set({
            cash: newCash,
            positions: newPositions,
            orders: [...state.orders, order],
            tradeHistory: [trade, ...state.tradeHistory],
            portfolioValue: recalcPortfolioValue(newCash, newPositions),
            lastTradeFlash: { side: "buy", timestamp: Date.now() },
          });
          return order;
        }

        // Normal long buy
        let newPositions: Position[];
        if (existingPos && existingPos.side === "long") {
          const totalQty = existingPos.quantity + quantity;
          const newAvg =
            (existingPos.avgPrice * existingPos.quantity +
              execPrice * quantity) /
            totalQty;
          const { pnl, pnlPercent } = computePnL("long", execPrice, newAvg, totalQty);
          newPositions = state.positions.map((p) =>
            p.ticker === ticker
              ? {
                  ...p,
                  quantity: totalQty,
                  avgPrice: newAvg,
                  currentPrice: execPrice,
                  unrealizedPnL: pnl,
                  unrealizedPnLPercent: pnlPercent,
                }
              : p,
          );
        } else {
          newPositions = [
            ...state.positions,
            {
              ticker,
              quantity,
              avgPrice: execPrice,
              side: "long" as const,
              currentPrice: execPrice,
              unrealizedPnL: 0,
              unrealizedPnLPercent: 0,
              openedAtTimestamp: simulationDate,
            },
          ];
        }

        const newCash = state.cash - fees.totalCost;
        const trade: TradeRecord = {
          id: generateId(),
          ticker,
          side: "buy",
          quantity,
          price: execPrice,
          realizedPnL: 0,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          timestamp: Date.now(),
          simulationDate,
        };

        set({
          cash: newCash,
          positions: newPositions,
          orders: [...state.orders, order],
          tradeHistory: [trade, ...state.tradeHistory],
          portfolioValue: recalcPortfolioValue(newCash, newPositions),
          lastTradeFlash: { side: "buy", timestamp: Date.now() },
        });

        return order;
      },

      placeSellOrder: (ticker, quantity, price, simulationDate) => {
        const state = get();
        const existingPos = state.positions.find(
          (p) => p.ticker === ticker && p.side === "long",
        );
        if (!existingPos || existingPos.quantity < quantity) return null;

        const fees = calculateFees(price, quantity, "sell");
        const execPrice = fees.executionPrice;

        const order: Order = {
          id: generateId(),
          ticker,
          side: "sell",
          type: "market",
          quantity,
          status: "filled",
          filledQty: quantity,
          avgFillPrice: execPrice,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          createdAt: Date.now(),
          filledAt: Date.now(),
        };

        const realizedPnL =
          (execPrice - existingPos.avgPrice) * quantity - fees.commission;
        const remainingQty = existingPos.quantity - quantity;

        let newPositions: Position[];
        if (remainingQty === 0) {
          newPositions = state.positions.filter((p) => p.ticker !== ticker);
        } else {
          const { pnl, pnlPercent } = computePnL(
            "long",
            execPrice,
            existingPos.avgPrice,
            remainingQty,
          );
          newPositions = state.positions.map((p) =>
            p.ticker === ticker
              ? {
                  ...p,
                  quantity: remainingQty,
                  currentPrice: execPrice,
                  unrealizedPnL: pnl,
                  unrealizedPnLPercent: pnlPercent,
                }
              : p,
          );
        }

        const newCash = state.cash + quantity * execPrice - fees.commission;
        const trade: TradeRecord = {
          id: generateId(),
          ticker,
          side: "sell",
          quantity,
          price: execPrice,
          realizedPnL,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          timestamp: Date.now(),
          simulationDate,
        };

        set({
          cash: newCash,
          positions: newPositions,
          orders: [...state.orders, order],
          tradeHistory: [trade, ...state.tradeHistory],
          portfolioValue: recalcPortfolioValue(newCash, newPositions),
          lastTradeFlash: { side: "sell", timestamp: Date.now() },
        });

        return order;
      },

      placeShortOrder: (ticker, quantity, price, simulationDate) => {
        const state = get();
        const fees = calculateFees(price, quantity, "sell");
        const execPrice = fees.executionPrice;

        const order: Order = {
          id: generateId(),
          ticker,
          side: "sell",
          type: "market",
          quantity,
          status: "filled",
          filledQty: quantity,
          avgFillPrice: execPrice,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          createdAt: Date.now(),
          filledAt: Date.now(),
        };

        const existingShort = state.positions.find(
          (p) => p.ticker === ticker && p.side === "short",
        );

        let newPositions: Position[];
        if (existingShort) {
          const totalQty = existingShort.quantity + quantity;
          const newAvg =
            (existingShort.avgPrice * existingShort.quantity +
              execPrice * quantity) /
            totalQty;
          newPositions = state.positions.map((p) =>
            p.ticker === ticker && p.side === "short"
              ? {
                  ...p,
                  quantity: totalQty,
                  avgPrice: newAvg,
                  currentPrice: execPrice,
                  unrealizedPnL: computePnL("short", execPrice, newAvg, totalQty).pnl,
                  unrealizedPnLPercent: computePnL("short", execPrice, newAvg, totalQty).pnlPercent,
                }
              : p,
          );
        } else {
          newPositions = [
            ...state.positions,
            {
              ticker,
              quantity,
              avgPrice: execPrice,
              side: "short" as const,
              currentPrice: execPrice,
              unrealizedPnL: 0,
              unrealizedPnLPercent: 0,
            },
          ];
        }

        // Short sale proceeds go to cash
        const newCash = state.cash + quantity * execPrice - fees.commission;

        const trade: TradeRecord = {
          id: generateId(),
          ticker,
          side: "sell",
          quantity,
          price: execPrice,
          realizedPnL: 0,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          timestamp: Date.now(),
          simulationDate,
        };

        set({
          cash: newCash,
          positions: newPositions,
          orders: [...state.orders, order],
          tradeHistory: [trade, ...state.tradeHistory],
          portfolioValue: recalcPortfolioValue(newCash, newPositions),
          lastTradeFlash: { side: "sell", timestamp: Date.now() },
        });

        return order;
      },

      coverShortOrder: (ticker, quantity, price, simulationDate) => {
        const state = get();
        const shortPos = state.positions.find(
          (p) => p.ticker === ticker && p.side === "short",
        );
        if (!shortPos || shortPos.quantity < quantity) return null;

        const fees = calculateFees(price, quantity, "buy");
        const execPrice = fees.executionPrice;

        const order: Order = {
          id: generateId(),
          ticker,
          side: "buy",
          type: "market",
          quantity,
          status: "filled",
          filledQty: quantity,
          avgFillPrice: execPrice,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          createdAt: Date.now(),
          filledAt: Date.now(),
        };

        const realizedPnL =
          (shortPos.avgPrice - execPrice) * quantity - fees.commission;
        const remainingQty = shortPos.quantity - quantity;

        let newPositions: Position[];
        if (remainingQty === 0) {
          newPositions = state.positions.filter(
            (p) => !(p.ticker === ticker && p.side === "short"),
          );
        } else {
          const { pnl, pnlPercent } = computePnL(
            "short",
            execPrice,
            shortPos.avgPrice,
            remainingQty,
          );
          newPositions = state.positions.map((p) =>
            p.ticker === ticker && p.side === "short"
              ? {
                  ...p,
                  quantity: remainingQty,
                  currentPrice: execPrice,
                  unrealizedPnL: pnl,
                  unrealizedPnLPercent: pnlPercent,
                }
              : p,
          );
        }

        const newCash = state.cash - quantity * execPrice - fees.commission;

        const trade: TradeRecord = {
          id: generateId(),
          ticker,
          side: "buy",
          quantity,
          price: execPrice,
          realizedPnL,
          fees: fees.commission,
          slippage: fees.slippageAmount,
          timestamp: Date.now(),
          simulationDate,
        };

        set({
          cash: newCash,
          positions: newPositions,
          orders: [...state.orders, order],
          tradeHistory: [trade, ...state.tradeHistory],
          portfolioValue: recalcPortfolioValue(newCash, newPositions),
          lastTradeFlash: { side: "buy", timestamp: Date.now() },
        });

        return order;
      },

      placeLimitOrder: (ticker, side, quantity, limitPrice, simulationDate) => {
        const order: Order = {
          id: generateId(),
          ticker,
          side,
          type: "limit",
          quantity,
          status: "pending",
          filledQty: 0,
          avgFillPrice: 0,
          limitPrice,
          createdAt: simulationDate,
        };

        set((state) => ({
          pendingOrders: [...state.pendingOrders, order],
        }));
        return order;
      },

      placeStopLossOrder: (ticker, quantity, stopPrice, simulationDate) => {
        const order: Order = {
          id: generateId(),
          ticker,
          side: "sell",
          type: "stop_loss",
          quantity,
          status: "pending",
          filledQty: 0,
          avgFillPrice: 0,
          stopPrice,
          createdAt: simulationDate,
        };

        set((state) => ({
          pendingOrders: [...state.pendingOrders, order],
        }));
        return order;
      },

      placeTakeProfitOrder: (
        ticker,
        quantity,
        takeProfitPrice,
        simulationDate,
      ) => {
        const order: Order = {
          id: generateId(),
          ticker,
          side: "sell",
          type: "take_profit",
          quantity,
          status: "pending",
          filledQty: 0,
          avgFillPrice: 0,
          takeProfitPrice,
          createdAt: simulationDate,
        };

        set((state) => ({
          pendingOrders: [...state.pendingOrders, order],
        }));
        return order;
      },

      placeBracketOrder: (ticker, side, quantity, entryPrice, stopPrice, takeProfitPrice, simulationDate) => {
        const groupId = generateId();
        // Entry order (limit at entryPrice)
        const entryOrder: Order = {
          id: generateId(),
          ticker,
          side,
          type: "bracket",
          quantity,
          status: "pending",
          filledQty: 0,
          avgFillPrice: 0,
          limitPrice: entryPrice,
          bracketStopPrice: stopPrice,
          bracketTakeProfitPrice: takeProfitPrice,
          bracketGroupId: groupId,
          createdAt: simulationDate,
        };
        set((state) => ({
          pendingOrders: [...state.pendingOrders, entryOrder],
        }));
        return entryOrder;
      },

      placeOCOOrder: (ticker, quantity, priceA, priceB, simulationDate) => {
        const groupId = generateId();
        const ocoOrder: Order = {
          id: generateId(),
          ticker,
          side: "buy",
          type: "oco",
          quantity,
          status: "pending",
          filledQty: 0,
          avgFillPrice: 0,
          ocoPriceA: priceA,
          ocoPriceB: priceB,
          ocoGroupId: groupId,
          createdAt: simulationDate,
        };
        set((state) => ({
          pendingOrders: [...state.pendingOrders, ocoOrder],
        }));
        return ocoOrder;
      },

      placeTrailingStopOrder: (ticker, quantity, trailAmount, trailPercent, currentPrice, simulationDate) => {
        const order: Order = {
          id: generateId(),
          ticker,
          side: "sell",
          type: "trailing_stop",
          quantity,
          status: "pending",
          filledQty: 0,
          avgFillPrice: 0,
          trailAmount,
          trailPercent,
          trailHighWater: currentPrice,
          createdAt: simulationDate,
        };
        set((state) => ({
          pendingOrders: [...state.pendingOrders, order],
        }));
        return order;
      },

      placeConditionalOrder: (ticker, side, quantity, limitPrice, condition, simulationDate) => {
        const order: Order = {
          id: generateId(),
          ticker,
          side,
          type: "conditional",
          quantity,
          status: "pending",
          filledQty: 0,
          avgFillPrice: 0,
          limitPrice,
          condition,
          createdAt: simulationDate,
        };
        set((state) => ({
          pendingOrders: [...state.pendingOrders, order],
        }));
        return order;
      },

      cancelPendingOrder: (orderId) => {
        set((state) => ({
          pendingOrders: state.pendingOrders.filter((o) => o.id !== orderId),
          orders: [
            ...state.orders,
            {
              ...state.pendingOrders.find((o) => o.id === orderId)!,
              status: "cancelled" as const,
            },
          ],
        }));
      },

      checkPendingOrders: (bar, simulationDate) => {
        const state = get();
        const filled: Order[] = [];
        // Track OCO / bracket group IDs to cancel after first fill
        const cancelledGroupIds = new Set<string>();
        // Updated trailing stop orders (high-water update)
        const updatedTrailingOrders: Order[] = [];

        const remaining: Order[] = [];

        for (const order of state.pendingOrders) {
          if (order.ticker !== bar.ticker) {
            remaining.push(order);
            continue;
          }

          // Skip orders whose OCO/bracket group already filled
          if (order.ocoGroupId && cancelledGroupIds.has(order.ocoGroupId)) {
            continue; // effectively cancelled
          }
          if (order.bracketGroupId && cancelledGroupIds.has(order.bracketGroupId)) {
            continue;
          }

          let shouldFill = false;
          let fillPrice = 0;

          if (order.type === "limit") {
            if (order.side === "buy" && bar.low <= (order.limitPrice ?? 0)) {
              shouldFill = true;
              fillPrice = order.limitPrice ?? 0;
            } else if (
              order.side === "sell" &&
              bar.high >= (order.limitPrice ?? 0)
            ) {
              shouldFill = true;
              fillPrice = order.limitPrice ?? 0;
            }
          } else if (order.type === "stop_loss") {
            const pos = state.positions.find((p) => p.ticker === order.ticker);
            if (pos?.side === "long" && bar.low <= (order.stopPrice ?? 0)) {
              shouldFill = true;
              fillPrice = order.stopPrice ?? 0;
            } else if (
              pos?.side === "short" &&
              bar.high >= (order.stopPrice ?? 0)
            ) {
              shouldFill = true;
              fillPrice = order.stopPrice ?? 0;
            }
          } else if (order.type === "take_profit") {
            const pos = state.positions.find((p) => p.ticker === order.ticker);
            if (
              pos?.side === "long" &&
              bar.high >= (order.takeProfitPrice ?? 0)
            ) {
              shouldFill = true;
              fillPrice = order.takeProfitPrice ?? 0;
            } else if (
              pos?.side === "short" &&
              bar.low <= (order.takeProfitPrice ?? 0)
            ) {
              shouldFill = true;
              fillPrice = order.takeProfitPrice ?? 0;
            }
          } else if (order.type === "bracket") {
            // Entry leg: treat as a buy limit when price hits limitPrice
            if (order.side === "buy" && bar.low <= (order.limitPrice ?? 0)) {
              shouldFill = true;
              fillPrice = order.limitPrice ?? 0;
            } else if (order.side === "sell" && bar.high >= (order.limitPrice ?? 0)) {
              shouldFill = true;
              fillPrice = order.limitPrice ?? 0;
            }
          } else if (order.type === "oco") {
            // Fires on whichever leg is hit first
            const priceA = order.ocoPriceA ?? 0;
            const priceB = order.ocoPriceB ?? 0;
            // priceA = buy-stop (above resistance): triggers when bar crosses up
            if (bar.high >= priceA) {
              shouldFill = true;
              fillPrice = priceA;
            // priceB = buy-limit (below support): triggers when bar drops to level
            } else if (bar.low <= priceB) {
              shouldFill = true;
              fillPrice = priceB;
            }
          } else if (order.type === "trailing_stop") {
            const barClose = bar.close;
            const highWater = Math.max(order.trailHighWater ?? barClose, bar.high);
            // Compute current stop level
            let trailStop: number;
            if (order.trailPercent != null && order.trailPercent > 0) {
              trailStop = highWater * (1 - order.trailPercent / 100);
            } else {
              trailStop = highWater - (order.trailAmount ?? 0);
            }
            if (bar.low <= trailStop) {
              shouldFill = true;
              fillPrice = trailStop;
            } else {
              // Update high-water mark in place for next bar
              updatedTrailingOrders.push({ ...order, trailHighWater: highWater });
            }
          } else if (order.type === "conditional") {
            const cond = order.condition;
            if (cond) {
              if (cond.type === "price_above" && bar.high >= cond.value) {
                shouldFill = true;
                fillPrice = order.limitPrice ?? bar.close;
              } else if (cond.type === "price_below" && bar.low <= cond.value) {
                shouldFill = true;
                fillPrice = order.limitPrice ?? bar.close;
              } else if (cond.type === "volume_spike" && bar.volume >= cond.value) {
                shouldFill = true;
                fillPrice = order.limitPrice ?? bar.close;
              }
              // rsi_above / rsi_below: these need computed RSI; skip fill for now
              // (would require passing indicator data to checkPendingOrders)
            }
          }

          if (shouldFill) {
            // Execute the fill
            if (order.type === "limit" || order.type === "conditional") {
              if (order.side === "buy") {
                get().placeBuyOrder(order.ticker, order.quantity, fillPrice, simulationDate);
              } else {
                get().placeSellOrder(order.ticker, order.quantity, fillPrice, simulationDate);
              }
            } else if (
              order.type === "stop_loss" ||
              order.type === "take_profit"
            ) {
              const pos = get().positions.find((p) => p.ticker === order.ticker);
              if (pos) {
                const qty = Math.min(order.quantity, pos.quantity);
                if (pos.side === "long") {
                  get().placeSellOrder(order.ticker, qty, fillPrice, simulationDate);
                } else {
                  get().coverShortOrder(order.ticker, qty, fillPrice, simulationDate);
                }
              }
            } else if (order.type === "bracket") {
              // Entry fills → place SL + TP child orders
              if (order.side === "buy") {
                get().placeBuyOrder(order.ticker, order.quantity, fillPrice, simulationDate);
              } else {
                get().placeSellOrder(order.ticker, order.quantity, fillPrice, simulationDate);
              }
              // Add child stop-loss and take-profit
              if (order.bracketStopPrice) {
                get().placeStopLossOrder(order.ticker, order.quantity, order.bracketStopPrice, simulationDate);
              }
              if (order.bracketTakeProfitPrice) {
                get().placeTakeProfitOrder(order.ticker, order.quantity, order.bracketTakeProfitPrice, simulationDate);
              }
              if (order.bracketGroupId) cancelledGroupIds.add(order.bracketGroupId);
            } else if (order.type === "oco") {
              // Whichever leg hits: fill as a buy order, cancel other leg via group
              get().placeBuyOrder(order.ticker, order.quantity, fillPrice, simulationDate);
              if (order.ocoGroupId) cancelledGroupIds.add(order.ocoGroupId);
            } else if (order.type === "trailing_stop") {
              const pos = get().positions.find((p) => p.ticker === order.ticker);
              if (pos) {
                const qty = Math.min(order.quantity, pos.quantity);
                if (pos.side === "long") {
                  get().placeSellOrder(order.ticker, qty, fillPrice, simulationDate);
                } else {
                  get().coverShortOrder(order.ticker, qty, fillPrice, simulationDate);
                }
              }
            }

            const filledOrder: Order = {
              ...order,
              status: "filled",
              filledQty: order.quantity,
              avgFillPrice: fillPrice,
              filledAt: simulationDate,
            };
            filled.push(filledOrder);
          } else {
            // For trailing stops we may have updated high-water
            const updated = updatedTrailingOrders.find((o) => o.id === order.id);
            remaining.push(updated ?? order);
          }
        }

        if (filled.length > 0 || updatedTrailingOrders.length > 0) {
          set((state) => ({
            pendingOrders: remaining,
            orders: [...state.orders, ...filled],
          }));
        }

        return filled;
      },

      recordEquitySnapshot: (simulationDate) => {
        const state = get();
        const positionsValue = state.positions.reduce(
          (sum, p) => sum + p.quantity * p.currentPrice,
          0,
        );

        set((s) => ({
          equityHistory: [
            ...s.equityHistory,
            {
              timestamp: simulationDate,
              portfolioValue: s.portfolioValue,
              cash: s.cash,
              positionsValue,
            },
          ],
        }));
      },

      updateTradeNotes: (tradeId, notes, tags) => {
        set((state) => ({
          tradeHistory: state.tradeHistory.map((t) =>
            t.id === tradeId ? { ...t, notes, tags: tags ?? t.tags } : t,
          ),
        }));
      },

      updatePositionPrice: (ticker, currentPrice) =>
        set((state) => {
          const newPositions = state.positions.map((p) => {
            if (p.ticker !== ticker) return p;
            const { pnl, pnlPercent } = computePnL(
              p.side,
              currentPrice,
              p.avgPrice,
              p.quantity,
            );
            return {
              ...p,
              currentPrice,
              unrealizedPnL: pnl,
              unrealizedPnLPercent: pnlPercent,
            };
          });
          return {
            positions: newPositions,
            portfolioValue: recalcPortfolioValue(state.cash, newPositions),
          };
        }),

      updateAllPositionPrices: (getPriceForTicker) =>
        set((state) => {
          const newPositions = state.positions.map((p) => {
            const newPrice = getPriceForTicker(p.ticker);
            if (newPrice === null) return p;
            const { pnl, pnlPercent } = computePnL(
              p.side,
              newPrice,
              p.avgPrice,
              p.quantity,
            );
            return {
              ...p,
              currentPrice: newPrice,
              unrealizedPnL: pnl,
              unrealizedPnLPercent: pnlPercent,
            };
          });
          return {
            positions: newPositions,
            portfolioValue: recalcPortfolioValue(state.cash, newPositions),
          };
        }),

      accrueMarginInterest: () => {
        const state = get();
        // Daily interest = annual rate / 365 on borrowed notional
        const dailyInterest = state.positions
          .filter((p) => p.side === "short")
          .reduce((sum, p) => {
            const rate = state.borrowRates[p.ticker] ?? 1.0;
            return sum + p.quantity * p.currentPrice * (rate / 100 / 365);
          }, 0);
        if (dailyInterest <= 0) return;
        const newCash = state.cash - dailyInterest;
        set({
          cash: newCash,
          portfolioValue: recalcPortfolioValue(newCash, state.positions),
        });
      },

      updateMarginMetrics: () => {
        const state = get();
        const used = computeMarginUsed(state.positions);
        // marginLimit = 2× portfolio equity
        const equity = recalcPortfolioValue(state.cash, state.positions);
        set({
          marginUsed: used,
          marginLimit: equity * 2,
        });
      },

      clearTradeFlash: () => set({ lastTradeFlash: null }),

      resetPortfolio: () =>
        set({
          cash: INITIAL_CAPITAL,
          positions: [],
          orders: [],
          pendingOrders: [],
          tradeHistory: [],
          portfolioValue: INITIAL_CAPITAL,
          equityHistory: [],
          lastTradeFlash: null,
          marginUsed: 0,
          marginLimit: INITIAL_CAPITAL * 2,
        }),

      deductCash: (amount: number) => {
        const state = get();
        if (state.cash < amount) return false;
        set({
          cash: state.cash - amount,
          portfolioValue: recalcPortfolioValue(
            state.cash - amount,
            state.positions,
          ),
        });
        return true;
      },

      addCash: (amount: number) => {
        const state = get();
        set({
          cash: state.cash + amount,
          portfolioValue: recalcPortfolioValue(
            state.cash + amount,
            state.positions,
          ),
        });
      },
    }),
    {
      name: "alpha-deck-trading",
      partialize: (state) => ({
        cash: state.cash,
        positions: state.positions,
        orders: state.orders,
        pendingOrders: state.pendingOrders,
        tradeHistory: state.tradeHistory,
        portfolioValue: state.portfolioValue,
        equityHistory: state.equityHistory,
        marginUsed: state.marginUsed,
        marginLimit: state.marginLimit,
      }),
    },
  ),
);
