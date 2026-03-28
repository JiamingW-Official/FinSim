import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Alert types ──────────────────────────────────────────────────────────────

export type AlertType = "above" | "below" | "pct_move";
export type AlertExpiry = "one_time" | "recurring";

export interface PriceAlert {
  id: string;
  type: AlertType;
  value: number;      // price level or % (for pct_move)
  expiry: AlertExpiry;
  enabled: boolean;
  createdAt: number;
}

export interface AlertHistoryEntry {
  alertId: string;
  ticker: string;
  type: AlertType;
  value: number;
  triggeredAt: number;
  price: number;  // price when triggered
}

// ─── Watchlist item ───────────────────────────────────────────────────────────

export interface WatchlistItem {
  ticker: string;
  addedAt: number;
  // Legacy single-alert fields (kept for backwards compat)
  alertAbove?: number;
  alertBelow?: number;
  alertAboveEnabled?: boolean;
  alertBelowEnabled?: boolean;
  // New multi-alert
  alerts?: PriceAlert[];
  // Note
  notes?: string;
}

// ─── Named list ───────────────────────────────────────────────────────────────

export interface WatchlistList {
  id: string;
  name: string;
  tickers: string[];
}

// ─── Column config ────────────────────────────────────────────────────────────

export type ColumnId =
  | "price"
  | "changePct"
  | "volume"
  | "marketCap"
  | "peRatio"
  | "rsi"
  | "week52Pos"
  | "taSummary";

export interface ColumnConfig {
  id: ColumnId;
  label: string;
  enabled: boolean;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "price",     label: "Price",     enabled: true },
  { id: "changePct", label: "Chg%",      enabled: true },
  { id: "volume",    label: "Volume",    enabled: false },
  { id: "marketCap", label: "Mkt Cap",   enabled: false },
  { id: "peRatio",   label: "P/E",       enabled: false },
  { id: "rsi",       label: "RSI",       enabled: false },
  { id: "week52Pos", label: "52W",       enabled: false },
  { id: "taSummary", label: "TA",        enabled: true },
];

// ─── State ────────────────────────────────────────────────────────────────────

interface WatchlistState {
  // Items master list (keyed by ticker, shared across lists)
  watchlist: WatchlistItem[];

  // Named lists
  lists: WatchlistList[];
  activeListId: string;

  // Column customization
  columns: ColumnConfig[];

  // Alert history
  alertHistory: AlertHistoryEntry[];

  // Legacy fired alerts set (session-only)
  firedAlerts: Set<string>;

  // ─── Actions: watchlist items ───────────────────────────────────────────

  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  reorderWatchlist: (fromIndex: number, toIndex: number) => void;

  // Legacy alert actions (kept for backwards compat)
  setAlert: (ticker: string, above?: number, below?: number) => void;
  toggleAlertAbove: (ticker: string, enabled: boolean) => void;
  toggleAlertBelow: (ticker: string, enabled: boolean) => void;
  clearAlert: (ticker: string) => void;

  // Multi-alert actions
  addAlert: (ticker: string, alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  removeAlert: (ticker: string, alertId: string) => void;
  toggleAlert: (ticker: string, alertId: string, enabled: boolean) => void;
  recordAlertFired: (entry: Omit<AlertHistoryEntry, "triggeredAt">) => void;

  // Notes
  setNote: (ticker: string, note: string) => void;

  // ─── Actions: lists ──────────────────────────────────────────────────────

  createList: (name: string) => void;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string) => void;
  addTickerToList: (listId: string, ticker: string) => void;
  removeTickerFromList: (listId: string, ticker: string) => void;
  reorderListTickers: (listId: string, fromIndex: number, toIndex: number) => void;

  // ─── Actions: columns ────────────────────────────────────────────────────

  setColumns: (columns: ColumnConfig[]) => void;
  toggleColumn: (id: ColumnId) => void;
  moveColumnUp: (id: ColumnId) => void;
  moveColumnDown: (id: ColumnId) => void;

  // ─── Queries ─────────────────────────────────────────────────────────────

  isWatched: (ticker: string) => boolean;
  markAlertFired: (key: string) => void;
  hasAlertFired: (key: string) => boolean;

  // Active list derived helpers
  getActiveList: () => WatchlistList;
  getActiveWatchlist: () => WatchlistItem[];
}

// ─── Default lists ────────────────────────────────────────────────────────────

const DEFAULT_LIST_ID = "main";

function makeDefaultLists(): WatchlistList[] {
  return [
    { id: "main", name: "Main", tickers: [] },
    { id: "options-plays", name: "Options Plays", tickers: [] },
    { id: "swing-trades", name: "Swing Trades", tickers: [] },
  ];
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      lists: makeDefaultLists(),
      activeListId: DEFAULT_LIST_ID,
      columns: DEFAULT_COLUMNS,
      alertHistory: [],
      firedAlerts: new Set<string>(),

      // ── Watchlist item actions ──────────────────────────────────────────

      addToWatchlist: (ticker) => {
        const state = get();
        const upper = ticker.trim().toUpperCase();
        if (!upper) return;

        // Ensure item exists in master list
        const alreadyInMaster = state.watchlist.some((w) => w.ticker === upper);
        if (!alreadyInMaster) {
          set((s) => ({
            watchlist: [...s.watchlist, { ticker: upper, addedAt: Date.now(), alerts: [] }],
          }));
        }

        // Add to active list if not already there
        const activeList = state.lists.find((l) => l.id === state.activeListId);
        if (activeList && !activeList.tickers.includes(upper)) {
          set((s) => ({
            lists: s.lists.map((l) =>
              l.id === s.activeListId
                ? { ...l, tickers: [...l.tickers, upper] }
                : l,
            ),
          }));
        }
      },

      removeFromWatchlist: (ticker) => {
        const { activeListId } = get();
        // Remove from active list only
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === activeListId
              ? { ...l, tickers: l.tickers.filter((t) => t !== ticker) }
              : l,
          ),
        }));
      },

      reorderWatchlist: (fromIndex, toIndex) => {
        const { activeListId } = get();
        set((s) => {
          const list = s.lists.find((l) => l.id === activeListId);
          if (!list) return s;
          const tickers = [...list.tickers];
          if (fromIndex < 0 || fromIndex >= tickers.length) return s;
          if (toIndex < 0 || toIndex >= tickers.length) return s;
          const [item] = tickers.splice(fromIndex, 1);
          tickers.splice(toIndex, 0, item);
          return {
            lists: s.lists.map((l) =>
              l.id === activeListId ? { ...l, tickers } : l,
            ),
          };
        });
      },

      // ── Legacy alert actions ────────────────────────────────────────────

      setAlert: (ticker, above, below) => {
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
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
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
            w.ticker === ticker ? { ...w, alertAboveEnabled: enabled } : w,
          ),
        }));
      },

      toggleAlertBelow: (ticker, enabled) => {
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
            w.ticker === ticker ? { ...w, alertBelowEnabled: enabled } : w,
          ),
        }));
      },

      clearAlert: (ticker) => {
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
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

      // ── Multi-alert actions ─────────────────────────────────────────────

      addAlert: (ticker, alertData) => {
        const newAlert: PriceAlert = {
          ...alertData,
          id: generateId(),
          createdAt: Date.now(),
        };
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
            w.ticker === ticker
              ? { ...w, alerts: [...(w.alerts ?? []), newAlert] }
              : w,
          ),
        }));
      },

      removeAlert: (ticker, alertId) => {
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
            w.ticker === ticker
              ? { ...w, alerts: (w.alerts ?? []).filter((a) => a.id !== alertId) }
              : w,
          ),
        }));
      },

      toggleAlert: (ticker, alertId, enabled) => {
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
            w.ticker === ticker
              ? {
                  ...w,
                  alerts: (w.alerts ?? []).map((a) =>
                    a.id === alertId ? { ...a, enabled } : a,
                  ),
                }
              : w,
          ),
        }));
      },

      recordAlertFired: (entry) => {
        const historyEntry: AlertHistoryEntry = {
          ...entry,
          triggeredAt: Date.now(),
        };
        set((s) => ({
          alertHistory: [historyEntry, ...s.alertHistory].slice(0, 10),
        }));
      },

      // ── Notes ───────────────────────────────────────────────────────────

      setNote: (ticker, note) => {
        set((s) => ({
          watchlist: s.watchlist.map((w) =>
            w.ticker === ticker ? { ...w, notes: note } : w,
          ),
        }));
      },

      // ── List actions ────────────────────────────────────────────────────

      createList: (name) => {
        const newList: WatchlistList = {
          id: generateId(),
          name: name.trim() || "New List",
          tickers: [],
        };
        set((s) => ({
          lists: [...s.lists, newList],
          activeListId: newList.id,
        }));
      },

      renameList: (id, name) => {
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === id ? { ...l, name: name.trim() || l.name } : l,
          ),
        }));
      },

      deleteList: (id) => {
        const { lists, activeListId } = get();
        if (lists.length <= 1) return; // cannot delete last list
        const remaining = lists.filter((l) => l.id !== id);
        const newActive =
          activeListId === id ? remaining[0].id : activeListId;
        set({ lists: remaining, activeListId: newActive });
      },

      setActiveList: (id) => {
        set({ activeListId: id });
      },

      addTickerToList: (listId, ticker) => {
        const upper = ticker.trim().toUpperCase();
        if (!upper) return;
        const { watchlist } = get();
        const alreadyInMaster = watchlist.some((w) => w.ticker === upper);
        if (!alreadyInMaster) {
          set((s) => ({
            watchlist: [...s.watchlist, { ticker: upper, addedAt: Date.now(), alerts: [] }],
          }));
        }
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId && !l.tickers.includes(upper)
              ? { ...l, tickers: [...l.tickers, upper] }
              : l,
          ),
        }));
      },

      removeTickerFromList: (listId, ticker) => {
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, tickers: l.tickers.filter((t) => t !== ticker) }
              : l,
          ),
        }));
      },

      reorderListTickers: (listId, fromIndex, toIndex) => {
        set((s) => {
          const list = s.lists.find((l) => l.id === listId);
          if (!list) return s;
          const tickers = [...list.tickers];
          if (fromIndex < 0 || fromIndex >= tickers.length) return s;
          if (toIndex < 0 || toIndex >= tickers.length) return s;
          const [item] = tickers.splice(fromIndex, 1);
          tickers.splice(toIndex, 0, item);
          return {
            lists: s.lists.map((l) => (l.id === listId ? { ...l, tickers } : l)),
          };
        });
      },

      // ── Column actions ──────────────────────────────────────────────────

      setColumns: (columns) => {
        set({ columns });
      },

      toggleColumn: (id) => {
        set((s) => ({
          columns: s.columns.map((c) =>
            c.id === id ? { ...c, enabled: !c.enabled } : c,
          ),
        }));
      },

      moveColumnUp: (id) => {
        set((s) => {
          const idx = s.columns.findIndex((c) => c.id === id);
          if (idx <= 0) return s;
          const cols = [...s.columns];
          [cols[idx - 1], cols[idx]] = [cols[idx], cols[idx - 1]];
          return { columns: cols };
        });
      },

      moveColumnDown: (id) => {
        set((s) => {
          const idx = s.columns.findIndex((c) => c.id === id);
          if (idx < 0 || idx >= s.columns.length - 1) return s;
          const cols = [...s.columns];
          [cols[idx], cols[idx + 1]] = [cols[idx + 1], cols[idx]];
          return { columns: cols };
        });
      },

      // ── Queries ─────────────────────────────────────────────────────────

      isWatched: (ticker) => {
        const { lists, activeListId } = get();
        const list = lists.find((l) => l.id === activeListId);
        return list ? list.tickers.includes(ticker) : false;
      },

      markAlertFired: (key) => {
        set((s) => {
          const next = new Set(s.firedAlerts);
          next.add(key);
          return { firedAlerts: next };
        });
      },

      hasAlertFired: (key) => {
        return get().firedAlerts.has(key);
      },

      getActiveList: () => {
        const { lists, activeListId } = get();
        return lists.find((l) => l.id === activeListId) ?? lists[0];
      },

      getActiveWatchlist: () => {
        const { lists, activeListId, watchlist } = get();
        const list = lists.find((l) => l.id === activeListId) ?? lists[0];
        return list.tickers
          .map((ticker) => watchlist.find((w) => w.ticker === ticker))
          .filter((w): w is WatchlistItem => w !== undefined);
      },
    }),
    {
      name: "alpha-deck-watchlist-v2",
      partialize: (state) => ({
        watchlist: state.watchlist,
        lists: state.lists,
        activeListId: state.activeListId,
        columns: state.columns,
        alertHistory: state.alertHistory,
        // firedAlerts not persisted — resets per session
      }),
    },
  ),
);
