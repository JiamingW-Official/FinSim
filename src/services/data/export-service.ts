import type { TradeRecord } from "@/types/trading";
import type { LessonScoreBreakdown } from "@/types/game";

export interface LearnProgressExport {
  completedLessons: string[];
  lessonScores: Record<string, LessonScoreBreakdown>;
  learningStreak: number;
  lastLearnDate: string;
  dailyGoal: number;
  exportedAt: string;
}

export interface GameStateExport {
  xp: number;
  level: number;
  title: string;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    xp?: number;
    unlockedAt: number;
  }>;
  stats: Record<string, unknown>;
  exportedAt: string;
}

export interface TradingStateExport {
  cash: number;
  portfolioValue: number;
  tradeHistory: TradeRecord[];
  equityHistory: Array<{
    timestamp: number;
    portfolioValue: number;
    cash: number;
    positionsValue: number;
  }>;
  exportedAt: string;
}

export interface FullExport {
  version: 1;
  exportedAt: string;
  appName: "FinSim";
  game: GameStateExport;
  learn: LearnProgressExport;
  trading: TradingStateExport;
}

/**
 * Serializes all Zustand persisted stores to a single JSON string.
 * Reads directly from localStorage keys to capture exactly what is persisted.
 */
export function exportAllData(): string {
  const gameRaw = localStorage.getItem("alpha-deck-game");
  const learnRaw = localStorage.getItem("alpha-deck-learn");
  const tradingRaw = localStorage.getItem("alpha-deck-trading");

  const gameState = gameRaw ? (JSON.parse(gameRaw) as { state: Record<string, unknown> }).state : {};
  const learnState = learnRaw ? (JSON.parse(learnRaw) as { state: Record<string, unknown> }).state : {};
  const tradingState = tradingRaw ? (JSON.parse(tradingRaw) as { state: Record<string, unknown> }).state : {};

  const now = new Date().toISOString();

  const payload: FullExport = {
    version: 1,
    exportedAt: now,
    appName: "FinSim",
    game: {
      xp: (gameState.xp as number) ?? 0,
      level: (gameState.level as number) ?? 1,
      title: (gameState.title as string) ?? "Rookie",
      achievements: (gameState.achievements as GameStateExport["achievements"]) ?? [],
      stats: (gameState.stats as Record<string, unknown>) ?? {},
      exportedAt: now,
    },
    learn: {
      completedLessons: (learnState.completedLessons as string[]) ?? [],
      lessonScores: (learnState.lessonScores as Record<string, LessonScoreBreakdown>) ?? {},
      learningStreak: (learnState.learningStreak as number) ?? 0,
      lastLearnDate: (learnState.lastLearnDate as string) ?? "",
      dailyGoal: (learnState.dailyGoal as number) ?? 3,
      exportedAt: now,
    },
    trading: {
      cash: (tradingState.cash as number) ?? 100000,
      portfolioValue: (tradingState.portfolioValue as number) ?? 100000,
      tradeHistory: (tradingState.tradeHistory as TradeRecord[]) ?? [],
      equityHistory: (tradingState.equityHistory as TradingStateExport["equityHistory"]) ?? [],
      exportedAt: now,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Serializes trade history to CSV format.
 * Columns: Date, Ticker, Direction, Entry Price, Exit Price, Shares, P&L ($), P&L (%), Duration (bars)
 *
 * Note: TradeRecord stores individual fills (buy/sell), not round-trip trades.
 * Only records with a non-zero realizedPnL (i.e., closing fills) are included
 * in the CSV since those represent completed trade legs with a meaningful P&L.
 */
export function exportTradeHistory(tradeHistory: TradeRecord[]): string {
  const header = "Date,Ticker,Direction,Entry Price,Exit Price,Shares,P&L ($),P&L (%),Duration (bars)";

  // Filter to closing fills that have realized P&L
  const closingTrades = tradeHistory.filter((t) => t.realizedPnL !== 0);

  if (closingTrades.length === 0) {
    return header + "\n";
  }

  // Build a buy-record lookup keyed by ticker so we can pair entry prices.
  // Walk from oldest to newest (reverse, since history is newest-first).
  const chronological = [...tradeHistory].reverse();
  const entryPriceByTicker: Record<string, number> = {};
  const entryBarByTicker: Record<string, number> = {};

  const rows: string[] = [];

  for (const trade of chronological) {
    if (trade.side === "buy" && trade.realizedPnL === 0) {
      // Opening long — record entry
      entryPriceByTicker[trade.ticker] = trade.price;
      entryBarByTicker[trade.ticker] = trade.simulationDate;
    } else if (trade.realizedPnL !== 0) {
      // Closing fill
      const entryPrice = entryPriceByTicker[trade.ticker] ?? trade.price;
      const entryBar = entryBarByTicker[trade.ticker] ?? trade.simulationDate;

      const direction = trade.side === "sell" ? "Long" : "Short";
      const date = new Date(trade.simulationDate).toISOString().slice(0, 10);
      const exitPrice = trade.price;
      const shares = trade.quantity;
      const pnlDollar = trade.realizedPnL;
      const pnlPct =
        entryPrice > 0
          ? direction === "Long"
            ? ((exitPrice - entryPrice) / entryPrice) * 100
            : ((entryPrice - exitPrice) / entryPrice) * 100
          : 0;

      // Duration: difference in simulationDate ms divided by a day in ms, then rounded.
      // simulationDate is a Unix ms timestamp of the bar date.
      const durationMs = trade.simulationDate - entryBar;
      const durationBars = Math.max(1, Math.round(durationMs / (24 * 60 * 60 * 1000)));

      rows.push(
        [
          date,
          trade.ticker,
          direction,
          entryPrice.toFixed(2),
          exitPrice.toFixed(2),
          shares,
          pnlDollar.toFixed(2),
          pnlPct.toFixed(2),
          durationBars,
        ].join(","),
      );

      // Clear entry after close
      delete entryPriceByTicker[trade.ticker];
      delete entryBarByTicker[trade.ticker];
    }
  }

  // Reverse rows so most recent trades appear at the top
  return [header, ...rows.reverse()].join("\n");
}

/**
 * Serializes lesson progress to JSON.
 */
export function exportLearnProgress(
  completedLessons: string[],
  lessonScores: Record<string, LessonScoreBreakdown>,
  learningStreak: number,
  lastLearnDate: string,
): string {
  const payload: LearnProgressExport = {
    completedLessons,
    lessonScores,
    learningStreak,
    lastLearnDate,
    dailyGoal: 3,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Triggers a browser file download for the given content.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Returns a rough byte-size estimate of all persisted store data in localStorage.
 */
export function estimateDataSize(): number {
  const keys = ["alpha-deck-game", "alpha-deck-learn", "alpha-deck-trading"];
  return keys.reduce((total, key) => {
    const raw = localStorage.getItem(key);
    return total + (raw ? new TextEncoder().encode(raw).byteLength : 0);
  }, 0);
}

/**
 * Formats a byte count as a human-readable string (KB / MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
