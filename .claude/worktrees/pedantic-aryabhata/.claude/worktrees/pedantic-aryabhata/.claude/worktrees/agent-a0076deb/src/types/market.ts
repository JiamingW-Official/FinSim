export interface OHLCVBar {
  timestamp: number; // Unix milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  ticker: string;
  timeframe: Timeframe;
}

export type Timeframe = "5m" | "15m" | "1h" | "1d" | "1wk";

export const INTRADAY_TIMEFRAMES = new Set<Timeframe>(["5m", "15m", "1h"]);

export const INTRADAY_BARS_PER_DAY: Partial<Record<Timeframe, number>> = {
  "5m": 78,
  "15m": 26,
  "1h": 7,
};

export const INTRADAY_INTERVAL_MS: Partial<Record<Timeframe, number>> = {
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
};

// 9:30 AM ET = 14:30 UTC (EST offset; close enough for simulation)
export const MARKET_OPEN_OFFSET_MS = 14.5 * 60 * 60 * 1000;

export interface WatchlistStock {
  ticker: string;
  name: string;
  sector: string;
}

export const WATCHLIST_STOCKS: WatchlistStock[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { ticker: "GOOG", name: "Alphabet Inc.", sector: "Technology" },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer" },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financial" },
  { ticker: "SPY", name: "S&P 500 ETF", sector: "ETF" },
  { ticker: "QQQ", name: "Nasdaq 100 ETF", sector: "ETF" },
  { ticker: "META", name: "Meta Platforms", sector: "Technology" },
];

export const TIMEFRAME_OPTIONS: { value: Timeframe; label: string; group: "intraday" | "daily" }[] = [
  { value: "5m", label: "5m", group: "intraday" },
  { value: "15m", label: "15m", group: "intraday" },
  { value: "1h", label: "1h", group: "intraday" },
  { value: "1d", label: "1D", group: "daily" },
  { value: "1wk", label: "1W", group: "daily" },
];
