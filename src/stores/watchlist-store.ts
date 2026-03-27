import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WatchlistItem {
  ticker: string;
  addedAt: number;
  alertAbove?: number;
  alertBelow?: number;
  alertAboveEnabled?: boolean;
  alertBelowEnabled?: boolean;
  notes?: string;
}

interface WatchlistState {
  watchlist: WatchlistItem[];
  firedAlerts: Set<string>;

  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  reorderWatchlist: (fromIndex: number, toIndex: number) => void;
  setAlert: (ticker: string, above?: number, below?: number) => void;
  toggleAlertAbove: (ticker: string, enabled: boolean) => void;
  toggleAlertBelow: (ticker: string, enabled: boolean) => void;
  clearAlert: (ticker: string) => void;
  isWatched: (ticker: string) => boolean;
  markAlertFired: (key: string) => void;
  hasAlertFired: (key: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      firedAlerts: new Set<string>(),

      addToWatchlist: (ticker) => {
        const { watchlist } = get();
        const upperTicker = ticker.trim().toUpperCase();
        if (!upperTicker || watchlist.some((w) => w.ticker === upperTicker)) return;
        set((state) => ({
          watchlist: [
            ...state.watchlist,
            { ticker: upperTicker, addedAt: Date.now() },
          ],
        }));
      },

      removeFromWatchlist: (ticker) => {
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.ticker !== ticker),
        }));
      },

      reorderWatchlist: (fromIndex, toIndex) => {
        set((state) => {
          const list = [...state.watchlist];
          if (fromIndex < 0 || fromIndex >= list.length) return state;
          if (toIndex < 0 || toIndex >= list.length) return state;
          const [item] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, item);
          return { watchlist: list };
        });
      },

      setAlert: (ticker, above, below) => {
        set((state) => ({
          watchlist: state.watchlist.map((w) =>
            w.ticker === ticker
              ? {
                  ...w,
                  alertAbove: above,
                  alertBelow: below,
                  alertAboveEnabled: above !== undefined ? true : w.alertAboveEnabled,
                  alertBelowEnabled: below !== undefined ? true : w.alertBelowEnabled,
                }
              : w,
          ),
        }));
      },

      toggleAlertAbove: (ticker, enabled) => {
        set((state) => ({
          watchlist: state.watchlist.map((w) =>
            w.ticker === ticker ? { ...w, alertAboveEnabled: enabled } : w,
          ),
        }));
      },

      toggleAlertBelow: (ticker, enabled) => {
        set((state) => ({
          watchlist: state.watchlist.map((w) =>
            w.ticker === ticker ? { ...w, alertBelowEnabled: enabled } : w,
          ),
        }));
      },

      clearAlert: (ticker) => {
        set((state) => ({
          watchlist: state.watchlist.map((w) =>
            w.ticker === ticker
              ? {
                  ...w,
                  alertAbove: undefined,
                  alertBelow: undefined,
                  alertAboveEnabled: undefined,
                  alertBelowEnabled: undefined,
                }
              : w,
          ),
        }));
      },

      isWatched: (ticker) => {
        return get().watchlist.some((w) => w.ticker === ticker);
      },

      markAlertFired: (key) => {
        set((state) => {
          const next = new Set(state.firedAlerts);
          next.add(key);
          return { firedAlerts: next };
        });
      },

      hasAlertFired: (key) => {
        return get().firedAlerts.has(key);
      },
    }),
    {
      name: "alpha-deck-watchlist",
      partialize: (state) => ({
        watchlist: state.watchlist,
        // firedAlerts not persisted — resets per session so alerts re-fire next visit
      }),
    },
  ),
);
