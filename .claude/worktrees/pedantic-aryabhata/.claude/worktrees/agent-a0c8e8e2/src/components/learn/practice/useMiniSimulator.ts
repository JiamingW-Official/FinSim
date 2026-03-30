import { useReducer, useCallback, useEffect, useRef } from "react";
import type { PracticeChallenge, PracticeObjective } from "@/data/lessons/types";

// ── Types ─────────────────────────────────────────────────────

export interface MiniPosition {
  quantity: number;
  avgPrice: number;
  side: "long" | "short";
}

export interface MiniTrade {
  side: "buy" | "sell" | "short" | "cover";
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
  totalAdvanced: number;
  realizedPnL: number;
}

type MiniSimAction =
  | { type: "ADVANCE" }
  | { type: "BUY"; quantity: number }
  | { type: "SELL"; quantity: number }
  | { type: "SHORT"; quantity: number }
  | { type: "COVER"; quantity: number }
  | { type: "CLOSE_POSITION" }
  | { type: "TOGGLE_INDICATOR"; indicator: string }
  | { type: "SET_PLAYING"; playing: boolean };

// ── Objective checking ────────────────────────────────────────

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
      const closeTrades = trades.filter((t) => t.side === "sell" || t.side === "cover");
      return closeTrades.length > 0 && state.realizedPnL >= obj.maxLoss;
    }
    default:
      return false;
  }
}

// ── Reducer ───────────────────────────────────────────────────

function createReducer(challenge: PracticeChallenge) {
  return function reducer(state: MiniSimState, action: MiniSimAction): MiniSimState {
    const bars = challenge.priceData;
    const next = { ...state };

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
        // Can't buy while short — must cover first
        if (state.position && state.position.side === "short") return state;

        next.cash = state.cash - cost;
        next.trades = [...state.trades, { side: "buy" as const, quantity: action.quantity, price, barIndex: state.revealedCount - 1 }];

        if (state.position && state.position.side === "long") {
          const totalQty = state.position.quantity + action.quantity;
          const totalCost = state.position.avgPrice * state.position.quantity + price * action.quantity;
          next.position = { quantity: totalQty, avgPrice: totalCost / totalQty, side: "long" };
        } else {
          next.position = { quantity: action.quantity, avgPrice: price, side: "long" };
        }
        break;
      }

      case "SELL": {
        if (!state.position || state.position.side !== "long" || state.position.quantity < action.quantity) return state;
        const currentBar = bars[state.revealedCount - 1];
        if (!currentBar) return state;
        const price = currentBar.close;

        const pnl = (price - state.position.avgPrice) * action.quantity;
        next.realizedPnL = state.realizedPnL + pnl;
        next.cash = state.cash + price * action.quantity;
        next.trades = [...state.trades, { side: "sell" as const, quantity: action.quantity, price, barIndex: state.revealedCount - 1 }];

        const remaining = state.position.quantity - action.quantity;
        next.position = remaining > 0
          ? { quantity: remaining, avgPrice: state.position.avgPrice, side: "long" }
          : null;
        break;
      }

      case "SHORT": {
        const currentBar = bars[state.revealedCount - 1];
        if (!currentBar) return state;
        const price = currentBar.close;
        // Can't short while long — must sell first
        if (state.position && state.position.side === "long") return state;
        // Margin: need price × qty in cash as collateral
        const margin = price * action.quantity;
        if (margin > state.cash) return state;

        next.cash = state.cash - margin;
        next.trades = [...state.trades, { side: "short" as const, quantity: action.quantity, price, barIndex: state.revealedCount - 1 }];

        if (state.position && state.position.side === "short") {
          const totalQty = state.position.quantity + action.quantity;
          const totalCost = state.position.avgPrice * state.position.quantity + price * action.quantity;
          next.position = { quantity: totalQty, avgPrice: totalCost / totalQty, side: "short" };
        } else {
          next.position = { quantity: action.quantity, avgPrice: price, side: "short" };
        }
        break;
      }

      case "COVER": {
        if (!state.position || state.position.side !== "short" || state.position.quantity < action.quantity) return state;
        const currentBar = bars[state.revealedCount - 1];
        if (!currentBar) return state;
        const price = currentBar.close;

        // Short profit = (entry - exit) × qty
        const pnl = (state.position.avgPrice - price) * action.quantity;
        next.realizedPnL = state.realizedPnL + pnl;
        // Return margin + P&L
        next.cash = state.cash + state.position.avgPrice * action.quantity + pnl;
        next.trades = [...state.trades, { side: "cover" as const, quantity: action.quantity, price, barIndex: state.revealedCount - 1 }];

        const remaining = state.position.quantity - action.quantity;
        next.position = remaining > 0
          ? { quantity: remaining, avgPrice: state.position.avgPrice, side: "short" }
          : null;
        break;
      }

      case "CLOSE_POSITION": {
        if (!state.position) return state;
        const currentBar = bars[state.revealedCount - 1];
        if (!currentBar) return state;
        const price = currentBar.close;
        const qty = state.position.quantity;

        if (state.position.side === "long") {
          const pnl = (price - state.position.avgPrice) * qty;
          next.realizedPnL = state.realizedPnL + pnl;
          next.cash = state.cash + price * qty;
          next.trades = [...state.trades, { side: "sell" as const, quantity: qty, price, barIndex: state.revealedCount - 1 }];
        } else {
          const pnl = (state.position.avgPrice - price) * qty;
          next.realizedPnL = state.realizedPnL + pnl;
          next.cash = state.cash + state.position.avgPrice * qty + pnl;
          next.trades = [...state.trades, { side: "cover" as const, quantity: qty, price, barIndex: state.revealedCount - 1 }];
        }
        next.position = null;
        break;
      }

      case "TOGGLE_INDICATOR": {
        if (state.activeIndicators.includes(action.indicator)) {
          next.activeIndicators = state.activeIndicators.filter((i) => i !== action.indicator);
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

// ── Hook ──────────────────────────────────────────────────────

export interface MiniSimOptions {
  playSpeedMs?: number;
  initialIndicators?: string[];
}

export function useMiniSimulator(challenge: PracticeChallenge, options?: MiniSimOptions) {
  const playSpeed = options?.playSpeedMs ?? 600;
  const initialIndicators = options?.initialIndicators ?? [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reducer = useCallback(createReducer(challenge), [challenge]);

  const initialState: MiniSimState = {
    revealedCount: challenge.initialReveal,
    cash: challenge.startingCash ?? 10000,
    position: null,
    trades: [],
    completedObjectives: challenge.objectives.map(() => false),
    activeIndicators: initialIndicators,
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
  const short = useCallback((qty: number) => dispatch({ type: "SHORT", quantity: qty }), []);
  const cover = useCallback((qty: number) => dispatch({ type: "COVER", quantity: qty }), []);
  const closePosition = useCallback(() => dispatch({ type: "CLOSE_POSITION" }), []);
  const toggleIndicator = useCallback(
    (ind: string) => dispatch({ type: "TOGGLE_INDICATOR", indicator: ind }),
    [],
  );
  const play = useCallback(() => dispatch({ type: "SET_PLAYING", playing: true }), []);
  const pause = useCallback(() => dispatch({ type: "SET_PLAYING", playing: false }), []);

  // Auto-play with configurable speed
  useEffect(() => {
    if (state.isPlaying && state.revealedCount < state.totalBars) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "ADVANCE" });
      }, playSpeed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (state.isPlaying && state.revealedCount >= state.totalBars) {
        dispatch({ type: "SET_PLAYING", playing: false });
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isPlaying, state.revealedCount, state.totalBars, playSpeed]);

  const allComplete = state.completedObjectives.every(Boolean);
  const currentPrice =
    state.revealedCount > 0
      ? challenge.priceData[state.revealedCount - 1].close
      : challenge.priceData[0].close;

  // Long profits when price rises, short profits when price falls
  const unrealizedPnL = state.position
    ? state.position.side === "long"
      ? (currentPrice - state.position.avgPrice) * state.position.quantity
      : (state.position.avgPrice - currentPrice) * state.position.quantity
    : 0;

  return {
    ...state,
    allComplete,
    currentPrice,
    unrealizedPnL,
    advance,
    buy,
    sell,
    short,
    cover,
    closePosition,
    toggleIndicator,
    play,
    pause,
  };
}

// MiniTrade and MiniPosition are exported via their interface declarations above
