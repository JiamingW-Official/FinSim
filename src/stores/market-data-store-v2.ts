import { create } from "zustand";
import type { OHLCVBar } from "@/types/market";

interface DailyChange {
  change: number;
  changePct: number;
}

interface MarketDataStateV2 {
  /** Currently visible bars per ticker (ticker -> bars) */
  visibleBars: Record<string, OHLCVBar[]>;

  /** Latest interpolated price per ticker */
  currentPrices: Record<string, number>;

  /** Daily change (absolute + percentage) per ticker */
  dailyChanges: Record<string, DailyChange>;

  /** Set of tickers currently loading data */
  loadingTickers: Record<string, boolean>;

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Replace the visible bars for a ticker */
  updateBars: (ticker: string, bars: OHLCVBar[]) => void;

  /** Update the current price and daily change for a ticker */
  updatePrice: (
    ticker: string,
    price: number,
    change: number,
    changePct: number,
  ) => void;

  /** Mark a ticker as loading or finished loading */
  setLoading: (ticker: string, loading: boolean) => void;

  /** Get current price for a ticker (returns 0 if unknown) */
  getPrice: (ticker: string) => number;

  /** Get visible bars for a ticker (returns empty array if none) */
  getBars: (ticker: string) => OHLCVBar[];

  /** Clear all data (e.g., on game reset) */
  reset: () => void;
}

export const useMarketDataStoreV2 = create<MarketDataStateV2>((set, get) => ({
  visibleBars: {},
  currentPrices: {},
  dailyChanges: {},
  loadingTickers: {},

  updateBars: (ticker, bars) =>
    set((state) => ({
      visibleBars: { ...state.visibleBars, [ticker]: bars },
    })),

  updatePrice: (ticker, price, change, changePct) =>
    set((state) => ({
      currentPrices: { ...state.currentPrices, [ticker]: price },
      dailyChanges: { ...state.dailyChanges, [ticker]: { change, changePct } },
    })),

  setLoading: (ticker, loading) =>
    set((state) => ({
      loadingTickers: { ...state.loadingTickers, [ticker]: loading },
    })),

  getPrice: (ticker) => get().currentPrices[ticker] ?? 0,

  getBars: (ticker) => get().visibleBars[ticker] ?? [],

  reset: () =>
    set({
      visibleBars: {},
      currentPrices: {},
      dailyChanges: {},
      loadingTickers: {},
    }),
}));
