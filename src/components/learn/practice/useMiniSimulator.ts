import { useReducer, useCallback, useEffect, useRef } from "react";
import type { PracticeChallenge, PracticeObjective } from "@/data/lessons/types";

interface MiniPosition {
  quantity: number;
  avgPrice: number;
}

interface MiniTrade {
  side: "buy" | "sell";
  quantity: number;
  price: number;
  barIndex: number;
}

interface MiniSimState {
  revealedCount: number;
  cash: number;
  position: MiniPosition | null;
  trades: MiniTrade[];
  completedObjectives: boolean[];
  activeIndicators: string[];
  isPlaying: boolean;
  totalBars: number;
  totalAdvanced: number; // bars advanced by user since start
  realizedPnL: number; // cumulative realized profit/loss
}

type MiniSimAction =
  | { type: "ADVANCE" }
  | { type: "BUY"; quantity: number }
  | { type: "SELL"; quantity: number }
  | { type: "TOGGLE_INDICATOR"; indicator: string }
  | { type: "SET_PLAYING"; playing: boolean };

function checkObjective(
  obj: PracticeObjective,
  state: MiniSimState,
  trades: MiniTrade[],
): boolean {
  switch (obj.kind) {
    case "buy": {
      const totalBought = trades
        .filter((t) => t.side === "buy")
        .reduce((sum, t) => sum + t.quantity, 0);
      return totalBought >= obj.minQuantity;
    }
    case "sell": {
      const totalSold = trades
        .filter((t) => t.side === "sell")
        .reduce((sum, t) => sum + t.quantity, 0);
      return totalSold >= obj.minQuantity;
    }
    case "advance-time":
      return state.totalAdvanced >= obj.bars;
    case "toggle-indicator":
      return state.activeIndicators.includes(obj.indicator);
    case "profit-target":
      return state.realizedPnL >= obj.minProfit;
    case "stop-loss": {
      // Check if user sold at a loss ≤ maxLoss (cut losses early)
      const sellTrades = trades.filter((t) => t.side === "sell");
      return sellTrades.length > 0 && state.realizedPnL >= obj.maxLoss;
    }
    default:
      return false;
  }
}

function createReducer(challenge: PracticeChallenge) {
  return function reducer(state: MiniSimState, action: MiniSimAction): MiniSimState {
    const bars = challenge.priceData;
    let next = { ...state };

    switch (action.type) {
      case "ADVANCE": {
        if (state.revealedCount >= bars.length) return state;
        next.revealedCount = state.revealedCount + 1;
        next.totalAdvanced = state.totalAdvanced + 1;
        break;
      }
      case "BUY": {
        const currentBar = bars[state.revealedCount - 1];
        if (!currentBar) return state;
        const price = currentBar.close;
        const cost = price * action.quantity;
        if (cost > state.cash) return state;

        next.cash = state.cash - cost;
        const trade: MiniTrade = {
          side: "buy",
          quantity: action.quantity,
          price,
          barIndex: state.revealedCount - 1,
        };
        next.trades = [...state.trades, trade];

        if (state.position) {
          const totalQty = state.position.quantity + action.quantity;
          const totalCost =
            state.position.avgPrice * state.position.quantity + price * action.quantity;
          next.position = {
            quantity: totalQty,
            avgPrice: totalCost / totalQty,
          };
        } else {
          next.position = { quantity: action.quantity, avgPrice: price };
        }
        break;
      }
      case "SELL": {
        if (!state.position || state.position.quantity < action.quantity) return state;
        const currentBar = bars[state.revealedCount - 1];
        if (!currentBar) return state;
        const price = currentBar.close;
        const revenue = price * action.quantity;

        // Track realized PnL
        const pnlFromSell = (price - state.position.avgPrice) * action.quantity;
        next.realizedPnL = state.realizedPnL + pnlFromSell;

        next.cash = state.cash + revenue;
        const trade: MiniTrade = {
          side: "sell",
          quantity: action.quantity,
          price,
          barIndex: state.revealedCount - 1,
        };
        next.trades = [...state.trades, trade];

        const remaining = state.position.quantity - action.quantity;
        next.position =
          remaining > 0
            ? { quantity: remaining, avgPrice: state.position.avgPrice }
            : null;
        break;
      }
      case "TOGGLE_INDICATOR": {
        if (state.activeIndicators.includes(action.indicator)) {
          next.activeIndicators = state.activeIndicators.filter(
            (i) => i !== action.indicator,
          );
        } else {
          next.activeIndicators = [...state.activeIndicators, action.indicator];
        }
        break;
      }
      case "SET_PLAYING": {
        next.isPlaying = action.playing;
        break;
      }
    }

    // Check objectives
    next.completedObjectives = challenge.objectives.map((obj, i) =>
      state.completedObjectives[i] || checkObjective(obj, next, next.trades),
    );

    return next;
  };
}

export function useMiniSimulator(challenge: PracticeChallenge) {
  const reducer = useCallback(createReducer(challenge), [challenge]);

  const initialState: MiniSimState = {
    revealedCount: challenge.initialReveal,
    cash: challenge.startingCash ?? 10000,
    position: null,
    trades: [],
    completedObjectives: challenge.objectives.map(() => false),
    activeIndicators: [],
    isPlaying: false,
    totalBars: challenge.priceData.length,
    totalAdvanced: 0,
    realizedPnL: 0,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => dispatch({ type: "ADVANCE" }), []);
  const buy = useCallback((qty: number) => dispatch({ type: "BUY", quantity: qty }), []);
  const sell = useCallback((qty: number) => dispatch({ type: "SELL", quantity: qty }), []);
  const toggleIndicator = useCallback(
    (ind: string) => dispatch({ type: "TOGGLE_INDICATOR", indicator: ind }),
    [],
  );
  const play = useCallback(() => dispatch({ type: "SET_PLAYING", playing: true }), []);
  const pause = useCallback(() => dispatch({ type: "SET_PLAYING", playing: false }), []);

  // Auto-play
  useEffect(() => {
    if (state.isPlaying && state.revealedCount < state.totalBars) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "ADVANCE" });
      }, 600);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (state.isPlaying && state.revealedCount >= state.totalBars) {
        dispatch({ type: "SET_PLAYING", playing: false });
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isPlaying, state.revealedCount, state.totalBars]);

  const allComplete = state.completedObjectives.every(Boolean);
  const currentPrice =
    state.revealedCount > 0
      ? challenge.priceData[state.revealedCount - 1].close
      : challenge.priceData[0].close;

  const unrealizedPnL = state.position
    ? (currentPrice - state.position.avgPrice) * state.position.quantity
    : 0;

  return {
    ...state,
    allComplete,
    currentPrice,
    unrealizedPnL,
    advance,
    buy,
    sell,
    toggleIndicator,
    play,
    pause,
  };
}

export type { MiniTrade, MiniPosition };
