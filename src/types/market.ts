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

export type Timeframe = "1d" | "1wk" | "1mo";

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

export const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: "1d", label: "1D" },
  { value: "1wk", label: "1W" },
  { value: "1mo", label: "1M" },
];
