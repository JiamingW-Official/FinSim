import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PREDICTION_MARKETS } from "@/data/prediction-markets";

// ── Live Market Store (for ACTIVE_MARKETS bankroll) ───────────────────────────

export interface PredictionPosition {
  marketId: string;
  side: "yes" | "no";
  shares: number;
  avgPrice: number; // cents (0–100)
  timestamp: number;
}

export interface ResolvedPosition {
  marketId: string;
  side: "yes" | "no";
  shares: number;
  avgPrice: number;
  pnl: number;
  won: boolean;
  resolvedAt: number;
}

interface LiveMarketState {
  positions: PredictionPosition[];
  history: ResolvedPosition[];
  bankroll: number; // virtual money separate from trading capital

  invest: (
    marketId: string,
    side: "yes" | "no",
    shares: number,
    price: number, // cents
  ) => boolean; // returns false if insufficient bankroll
  cashOut: (marketId: string, currentPrice: number) => void;
  resolveAll: (
    resolutions: Record<string, "yes" | "no">,
  ) => void;
  getPosition: (marketId: string) => PredictionPosition | undefined;
  resetBankroll: () => void;
}

const DEFAULT_BANKROLL = 1000;

export const useLiveMarketStore = create<LiveMarketState>()(
  persist(
    (set, get) => ({
      positions: [],
      history: [],
      bankroll: DEFAULT_BANKROLL,

      invest: (marketId, side, shares, price) => {
        const cost = (price * shares) / 100;
        const state = get();
        if (cost > state.bankroll) return false;

        const existing = state.positions.find(
          (p) => p.marketId === marketId,
        );

        if (existing && existing.side === side) {
          // Average into existing position
          const totalShares = existing.shares + shares;
          const totalCost =
            (existing.avgPrice * existing.shares) / 100 + cost;
          const newAvg = parseFloat(((totalCost / totalShares) * 100).toFixed(2));
          set({
            bankroll: parseFloat((state.bankroll - cost).toFixed(2)),
            positions: state.positions.map((p) =>
              p.marketId === marketId
                ? { ...p, shares: totalShares, avgPrice: newAvg }
                : p,
            ),
          });
        } else if (existing && existing.side !== side) {
          // Different side: close existing first, open new
          const closePnl = -((existing.avgPrice * existing.shares) / 100); // lose cost
          const closedPos: ResolvedPosition = {
            marketId,
            side: existing.side,
            shares: existing.shares,
            avgPrice: existing.avgPrice,
            pnl: closePnl,
            won: false,
            resolvedAt: Date.now(),
          };
          set({
            bankroll: parseFloat((state.bankroll - cost).toFixed(2)),
            positions: [
              ...state.positions.filter((p) => p.marketId !== marketId),
              { marketId, side, shares, avgPrice: price, timestamp: Date.now() },
            ],
            history: [closedPos, ...state.history],
          });
        } else {
          set({
            bankroll: parseFloat((state.bankroll - cost).toFixed(2)),
            positions: [
              ...state.positions,
              { marketId, side, shares, avgPrice: price, timestamp: Date.now() },
            ],
          });
        }
        return true;
      },

      cashOut: (marketId, currentPrice) => {
        const state = get();
        const pos = state.positions.find((p) => p.marketId === marketId);
        if (!pos) return;
        const proceeds = (currentPrice * pos.shares) / 100;
        const pnl = proceeds - (pos.avgPrice * pos.shares) / 100;
        const resolved: ResolvedPosition = {
          marketId,
          side: pos.side,
          shares: pos.shares,
          avgPrice: pos.avgPrice,
          pnl: parseFloat(pnl.toFixed(2)),
          won: pnl >= 0,
          resolvedAt: Date.now(),
        };
        set({
          bankroll: parseFloat((state.bankroll + proceeds).toFixed(2)),
          positions: state.positions.filter((p) => p.marketId !== marketId),
          history: [resolved, ...state.history],
        });
      },

      resolveAll: (resolutions) => {
        const state = get();
        const toClose = state.positions.filter(
          (p) => resolutions[p.marketId] !== undefined,
        );
        if (toClose.length === 0) return;

        let bankrollDelta = 0;
        const newHistory: ResolvedPosition[] = [];

        for (const pos of toClose) {
          const outcome = resolutions[pos.marketId];
          const won = pos.side === outcome;
          const payout = won ? pos.shares : 0; // $1 per share if win
          const cost = (pos.avgPrice * pos.shares) / 100;
          const pnl = payout - cost;
          bankrollDelta += payout;
          newHistory.push({
            marketId: pos.marketId,
            side: pos.side,
            shares: pos.shares,
            avgPrice: pos.avgPrice,
            pnl: parseFloat(pnl.toFixed(2)),
            won,
            resolvedAt: Date.now(),
          });
        }

        const closedIds = new Set(toClose.map((p) => p.marketId));
        set({
          bankroll: parseFloat((state.bankroll + bankrollDelta).toFixed(2)),
          positions: state.positions.filter((p) => !closedIds.has(p.marketId)),
          history: [...newHistory, ...state.history],
        });
      },

      getPosition: (marketId) => {
        return get().positions.find((p) => p.marketId === marketId);
      },

      resetBankroll: () => {
        set({ positions: [], history: [], bankroll: DEFAULT_BANKROLL });
      },
    }),
    {
      name: "alpha-deck-live-markets",
      partialize: (state) => ({
        positions: state.positions,
        history: state.history,
        bankroll: state.bankroll,
      }),
    },
  ),
);

// ── Prediction Market Store (existing, for PREDICTION_MARKETS) ────────────────

export interface PredictionBet {
  marketId: string;
  position: "yes" | "no";
  amount: number;
  probability: number; // 0-1
  timestamp: number;
  resolved?: boolean;
  payout?: number;
  outcome?: boolean;
}

export interface TradeRecord {
  id: string;
  marketId: string;
  side: "yes" | "no";
  amount: number;
  price: number; // probability at time of trade (0-1)
  timestamp: number;
  type: "buy" | "resolve";
  pnl?: number;
}

export interface CalibrationBucket {
  bucket: string;
  predicted: number;
  actual: number;
  count: number;
}

interface PredictionMarketState {
  bets: PredictionBet[];
  tradeHistory: TradeRecord[];
  insightPoints: number;
  totalResolved: number;
  correctPredictions: number;

  placeBet: (
    marketId: string,
    position: "yes" | "no",
    amount: number,
    probability: number,
  ) => void;
  resolveBet: (marketId: string, outcome: boolean) => void;
  getAccuracy: () => number;
  getBrierScore: () => number;
  getMarketBet: (marketId: string) => PredictionBet | undefined;
  getPortfolioValue: () => {
    totalInvested: number;
    currentValue: number;
    unrealizedPnl: number;
    realizedPnl: number;
    bestPosition: { marketId: string; pnl: number } | null;
    worstPosition: { marketId: string; pnl: number } | null;
  };
  getCalibrationData: () => CalibrationBucket[];
  getTradeHistory: () => TradeRecord[];
}

export const usePredictionMarketStore = create<PredictionMarketState>()(
  persist(
    (set, get) => ({
      bets: [],
      tradeHistory: [],
      insightPoints: 1000,
      totalResolved: 0,
      correctPredictions: 0,

      placeBet: (marketId, position, amount, probability) => {
        const state = get();
        const existing = state.bets.find(
          (b) => b.marketId === marketId && !b.resolved,
        );
        if (existing) return;
        if (amount > state.insightPoints) return;
        if (amount < 10 || amount > 500) return;

        const prob = probability / 100;
        const bet: PredictionBet = {
          marketId,
          position,
          amount,
          probability: prob,
          timestamp: Date.now(),
        };

        const trade: TradeRecord = {
          id: `${Date.now()}-${marketId}`,
          marketId,
          side: position,
          amount,
          price: prob,
          timestamp: Date.now(),
          type: "buy",
        };

        set({
          bets: [...state.bets, bet],
          tradeHistory: [trade, ...state.tradeHistory],
          insightPoints: state.insightPoints - amount,
        });

        try {
          const { useGameStore } = require("./game-store");
          useGameStore.getState().awardXP(10);
        } catch {
          /* game store not loaded */
        }
      },

      resolveBet: (marketId, outcome) => {
        const state = get();
        const betIndex = state.bets.findIndex(
          (b) => b.marketId === marketId && !b.resolved,
        );
        if (betIndex === -1) return;

        const bet = state.bets[betIndex];
        const isCorrect =
          (bet.position === "yes" && outcome) ||
          (bet.position === "no" && !outcome);

        let payout = 0;
        if (isCorrect) {
          if (bet.position === "yes") {
            payout = Math.round(bet.amount * (1 / bet.probability));
          } else {
            payout = Math.round(bet.amount * (1 / (1 - bet.probability)));
          }
        }

        const pnl = payout - bet.amount;

        const updatedBets = [...state.bets];
        updatedBets[betIndex] = {
          ...bet,
          resolved: true,
          payout,
          outcome,
        };

        const resolveTrade: TradeRecord = {
          id: `${Date.now()}-${marketId}-resolve`,
          marketId,
          side: bet.position,
          amount: payout,
          price: outcome ? 1 : 0,
          timestamp: Date.now(),
          type: "resolve",
          pnl,
        };

        set({
          bets: updatedBets,
          tradeHistory: [resolveTrade, ...state.tradeHistory],
          insightPoints: state.insightPoints + payout,
          totalResolved: state.totalResolved + 1,
          correctPredictions:
            state.correctPredictions + (isCorrect ? 1 : 0),
        });

        if (isCorrect) {
          try {
            const { useGameStore } = require("./game-store");
            useGameStore.getState().awardXP(25);
          } catch {
            /* game store not loaded */
          }
        }
      },

      getAccuracy: () => {
        const { totalResolved, correctPredictions } = get();
        if (totalResolved === 0) return 0;
        return Math.round((correctPredictions / totalResolved) * 100);
      },

      getBrierScore: () => {
        const { bets } = get();
        const resolvedBets = bets.filter((b) => b.resolved);
        if (resolvedBets.length === 0) return 0;

        let sumSquaredError = 0;
        for (const bet of resolvedBets) {
          const outcomeValue = bet.outcome ? 1 : 0;
          const forecast =
            bet.position === "yes" ? bet.probability : 1 - bet.probability;
          sumSquaredError += (forecast - outcomeValue) ** 2;
        }

        return Number((sumSquaredError / resolvedBets.length).toFixed(3));
      },

      getMarketBet: (marketId) => {
        return get().bets.find(
          (b) => b.marketId === marketId && !b.resolved,
        );
      },

      getPortfolioValue: () => {
        const { bets } = get();
        const activeBets = bets.filter((b) => !b.resolved);
        const resolvedBets = bets.filter((b) => b.resolved);

        const totalInvested = activeBets.reduce((s, b) => s + b.amount, 0);

        let currentValue = 0;
        let bestPosition: { marketId: string; pnl: number } | null = null;
        let worstPosition: { marketId: string; pnl: number } | null = null;

        for (const bet of activeBets) {
          const market = PREDICTION_MARKETS.find(
            (m) => m.id === bet.marketId,
          );
          if (!market) continue;

          const currentProb = market.probability / 100;
          let mtmValue: number;
          if (bet.position === "yes") {
            mtmValue = bet.amount * (currentProb / bet.probability);
          } else {
            mtmValue =
              bet.amount * ((1 - currentProb) / (1 - bet.probability));
          }
          currentValue += mtmValue;

          const pnl = mtmValue - bet.amount;
          if (!bestPosition || pnl > bestPosition.pnl) {
            bestPosition = { marketId: bet.marketId, pnl };
          }
          if (!worstPosition || pnl < worstPosition.pnl) {
            worstPosition = { marketId: bet.marketId, pnl };
          }
        }

        const realizedPnl = resolvedBets.reduce(
          (s, b) => s + ((b.payout ?? 0) - b.amount),
          0,
        );

        return {
          totalInvested: Math.round(totalInvested),
          currentValue: Math.round(currentValue),
          unrealizedPnl: Math.round(currentValue - totalInvested),
          realizedPnl: Math.round(realizedPnl),
          bestPosition,
          worstPosition,
        };
      },

      getCalibrationData: () => {
        const { bets } = get();
        const resolvedBets = bets.filter((b) => b.resolved);
        if (resolvedBets.length === 0) return [];

        const bucketLabels = [
          "0-10%",
          "10-20%",
          "20-30%",
          "30-40%",
          "40-50%",
          "50-60%",
          "60-70%",
          "70-80%",
          "80-90%",
          "90-100%",
        ];
        const buckets: Record<
          string,
          { sum: number; correct: number; count: number }
        > = {};
        for (const label of bucketLabels) {
          buckets[label] = { sum: 0, correct: 0, count: 0 };
        }

        for (const bet of resolvedBets) {
          const userProb =
            bet.position === "yes" ? bet.probability : 1 - bet.probability;
          const pctIdx = Math.min(9, Math.floor(userProb * 10));
          const label = bucketLabels[pctIdx];
          buckets[label].sum += userProb;
          buckets[label].count += 1;
          if (bet.outcome) {
            buckets[label].correct += 1;
          }
        }

        return bucketLabels
          .filter((label) => buckets[label].count > 0)
          .map((label) => ({
            bucket: label,
            predicted:
              Math.round(
                (buckets[label].sum / buckets[label].count) * 100,
              ) / 100,
            actual:
              Math.round(
                (buckets[label].correct / buckets[label].count) * 100,
              ) / 100,
            count: buckets[label].count,
          }));
      },

      getTradeHistory: () => {
        return get().tradeHistory;
      },
    }),
    {
      name: "alpha-deck-prediction-markets",
      partialize: (state) => ({
        bets: state.bets,
        tradeHistory: state.tradeHistory,
        insightPoints: state.insightPoints,
        totalResolved: state.totalResolved,
        correctPredictions: state.correctPredictions,
      }),
    },
  ),
);
