import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Order,
  OrderSide,
  Position,
  TradeRecord,
  EquitySnapshot,
} from "@/types/trading";
import { INITIAL_CAPITAL } from "@/types/trading";
import type { OHLCVBar } from "@/types/market";
import { generateId } from "@/lib/utils";
import { calculateFees, calculateLimitFees } from "@/services/trading/fees";

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

interface TradingState {
  cash: number;
  positions: Position[];
  orders: Order[];
  pendingOrders: Order[];
  tradeHistory: TradeRecord[];
  portfolioValue: number;
  equityHistory: EquitySnapshot[];
  lastTradeFlash: { side: "buy" | "sell"; timestamp: number } | null;

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
}

function recalcPortfolioValue(
  cash: number,
  positions: Position[],
): number {
  const posValue = positions.reduce(
    (sum, p) => sum + p.quantity * p.currentPrice,
    0,
  );
  return cash + posValue;
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

        // Record execution stats for the quality report
        try {
          const { useTradingPreferencesStore } = require("./trading-preferences-store");
          useTradingPreferencesStore.getState().recordExecution(
            fees.slippageAmount * quantity,
            fees.commission,
            0,
          );
        } catch { /* store not loaded */ }

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

        // Record execution stats for the quality report
        try {
          const { useTradingPreferencesStore } = require("./trading-preferences-store");
          useTradingPreferencesStore.getState().recordExecution(
            fees.slippageAmount * quantity,
            fees.commission,
            0,
          );
        } catch { /* store not loaded */ }

        // Notify on profitable trades ≥5%
        try {
          const pnlPct = existingPos.avgPrice > 0
            ? ((execPrice - existingPos.avgPrice) / existingPos.avgPrice) * 100
            : 0;
          if (pnlPct >= 5) {
            const { useNotificationStore } = require("./notification-store");
            const sign = pnlPct >= 0 ? "+" : "";
            useNotificationStore.getState().addNotification({
              type: "trade",
              title: `${ticker} closed — ${sign}${pnlPct.toFixed(1)}%`,
              message: `Sold ${quantity} shares at $${execPrice.toFixed(2)}. Realized P&L: $${realizedPnL.toFixed(2)}.`,
              icon: "TrendingUp",
              color: "text-green-400",
              priority: pnlPct >= 10 ? "high" : "medium",
            });
          }
        } catch { /* notification store not loaded yet */ }

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

        // Notify on profitable short covers ≥5%
        try {
          const pnlPct = shortPos.avgPrice > 0
            ? ((shortPos.avgPrice - execPrice) / shortPos.avgPrice) * 100
            : 0;
          if (pnlPct >= 5) {
            const { useNotificationStore } = require("./notification-store");
            const sign = pnlPct >= 0 ? "+" : "";
            useNotificationStore.getState().addNotification({
              type: "trade",
              title: `${ticker} short covered — ${sign}${pnlPct.toFixed(1)}%`,
              message: `Covered ${quantity} shares at $${execPrice.toFixed(2)}. Realized P&L: $${realizedPnL.toFixed(2)}.`,
              icon: "TrendingDown",
              color: "text-green-400",
              priority: pnlPct >= 10 ? "high" : "medium",
            });
          }
        } catch { /* notification store not loaded yet */ }

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
        const remaining: Order[] = [];

        for (const order of state.pendingOrders) {
          if (order.ticker !== bar.ticker) {
            remaining.push(order);
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
          }

          if (shouldFill) {
            // Limit and stop/tp fills execute at the named price — no extra
            // slippage since the investor already specified their price.
            const fees = calculateLimitFees(fillPrice, order.quantity, order.side);

            if (order.type === "limit") {
              if (order.side === "buy") {
                get().placeBuyOrder(
                  order.ticker,
                  order.quantity,
                  fillPrice,
                  simulationDate,
                );
              } else {
                get().placeSellOrder(
                  order.ticker,
                  order.quantity,
                  fillPrice,
                  simulationDate,
                );
              }
            } else if (
              order.type === "stop_loss" ||
              order.type === "take_profit"
            ) {
              const pos = get().positions.find(
                (p) => p.ticker === order.ticker,
              );
              if (pos) {
                const qty = Math.min(order.quantity, pos.quantity);
                if (pos.side === "long") {
                  get().placeSellOrder(
                    order.ticker,
                    qty,
                    fillPrice,
                    simulationDate,
                  );
                } else {
                  get().coverShortOrder(
                    order.ticker,
                    qty,
                    fillPrice,
                    simulationDate,
                  );
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

            // Record execution stats for the quality report
            try {
              const { useTradingPreferencesStore } = require("./trading-preferences-store");
              useTradingPreferencesStore.getState().recordExecution(
                fees.slippageAmount * order.quantity,
                fees.commission,
                0, // limit fills at named price — no fill savings/loss vs market
              );
            } catch { /* store not loaded */ }

            // Notify user that the pending order was filled
            try {
              const { useNotificationStore } = require("./notification-store");
              const typeLabel =
                order.type === "limit"
                  ? "Limit"
                  : order.type === "stop_loss"
                  ? "Stop-Loss"
                  : "Take-Profit";
              useNotificationStore.getState().addNotification({
                type: "trade",
                title: `${typeLabel} order filled — ${order.ticker}`,
                message: `${order.side === "buy" ? "Bought" : "Sold"} ${order.quantity} ${order.ticker} at $${fillPrice.toFixed(2)}.`,
                icon: order.type === "stop_loss" ? "Shield" : "Target",
                color:
                  order.type === "stop_loss"
                    ? "text-amber-400"
                    : "text-green-400",
                priority: "medium",
              });
            } catch { /* notification store not loaded */ }
          } else {
            remaining.push(order);
          }
        }

        if (filled.length > 0) {
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
      }),
    },
  ),
);
