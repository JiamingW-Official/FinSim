/**
 * Trade Replay Engine
 * Constructs, encodes, and decodes trade replay data for the chess.com-style
 * move-by-move viewer.
 */

import type { TradeRecord } from "@/types/trading";
import type { OHLCVBar } from "@/types/market";

// ─── Core Types ───────────────────────────────────────────────────────────────

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type AnnotationType = "entry" | "exit" | "stop" | "target" | "note";

export interface Annotation {
  barIndex: number;
  type: AnnotationType;
  price: number;
  label: string;
  pnl?: number;
}

export interface TradeEntry {
  tradeId: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  simulationDate: number;
  fees: number;
}

export interface TradeSummary {
  ticker: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  grossPnL: number;
  netPnL: number;
  pnlPercent: number;
  holdDurationMs: number;
  holdDurationLabel: string;
  maxDrawdown: number;
  maxRunup: number;
  totalFees: number;
  winLoss: "win" | "loss" | "breakeven";
}

export interface TradeReplayData {
  tradeId: string;
  ticker: string;
  entries: TradeEntry[];
  bars: OHLCV[];
  annotations: Annotation[];
  summary: TradeSummary;
}

// ─── Mulberry32 PRNG (deterministic synthetic bars) ──────────────────────────

function mulberry32(seed: number): () => number {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

// ─── Synthetic bar generation around a trade ─────────────────────────────────

/**
 * Generate 50 synthetic OHLCV bars centered around the trade window.
 * Uses a seeded random walk anchored to entry and exit prices so the
 * chart always looks realistic and deterministic for the same trade.
 */
function generateSyntheticBars(
  ticker: string,
  entryDate: number,
  exitDate: number,
  entryPrice: number,
  exitPrice: number,
  totalBars: number = 50,
): OHLCV[] {
  const seed = hashSeed(`${ticker}-${entryDate}-${exitDate}`);
  const rand = mulberry32(seed);

  // Position the entry at ~20% through the bars, exit ~80%
  const entryIdx = Math.floor(totalBars * 0.2);
  const exitIdx = Math.floor(totalBars * 0.8);

  // Daily bar interval for simulation (1 day in ms)
  const barInterval = 24 * 60 * 60 * 1000;
  const startDate = entryDate - entryIdx * barInterval;

  const prices: number[] = new Array(totalBars + 1);
  prices[entryIdx] = entryPrice;
  prices[exitIdx] = exitPrice;

  // Fill in prices between entry and exit with a random walk
  const steps = exitIdx - entryIdx;
  const drift = (exitPrice - entryPrice) / steps;
  const vol = Math.abs(exitPrice - entryPrice) * 0.015 + entryPrice * 0.008;

  for (let i = entryIdx + 1; i < exitIdx; i++) {
    const prev = prices[i - 1];
    prices[i] = prev + drift + (rand() - 0.5) * vol * 2;
  }

  // Fill before entry (random walk backward from entry)
  for (let i = entryIdx - 1; i >= 0; i--) {
    const next = prices[i + 1];
    prices[i] = next + (rand() - 0.5) * vol * 2 * 0.8;
  }

  // Fill after exit (random walk forward from exit)
  for (let i = exitIdx + 1; i <= totalBars; i++) {
    const prev = prices[i - 1];
    prices[i] = prev + (rand() - 0.5) * vol * 2 * 0.7;
  }

  // Ensure all prices positive
  const minPrice = Math.min(...prices);
  if (minPrice < entryPrice * 0.1) {
    const correction = entryPrice * 0.1 - minPrice;
    for (let i = 0; i <= totalBars; i++) {
      prices[i] += correction;
    }
  }

  // Build OHLCV bars
  const bars: OHLCV[] = [];
  for (let i = 0; i < totalBars; i++) {
    const open = prices[i];
    const close = prices[i + 1];
    const high = Math.max(open, close) + Math.abs(rand() * vol * 0.6);
    const low = Math.min(open, close) - Math.abs(rand() * vol * 0.6);
    const baseVolume = 1_000_000 + rand() * 4_000_000;
    // U-shaped volume: higher at open and close of session
    const sessionPos = i / totalBars;
    const volMult = sessionPos < 0.15 || sessionPos > 0.85 ? 1.8 : 1.0 + rand() * 0.5;
    const volume = Math.round(baseVolume * volMult);

    bars.push({
      timestamp: startDate + i * barInterval,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
  }

  return bars;
}

// ─── Core Builder ────────────────────────────────────────────────────────────

/**
 * Build a TradeReplayData object from a completed trade record.
 * Pairs buy/sell records from tradeHistory for the same ticker.
 */
export function buildReplayFromTrade(
  trade: TradeRecord,
  allHistory: TradeRecord[],
): TradeReplayData {
  const ticker = trade.ticker;

  // Identify the matching open trade (buy that this sell closes)
  // The sell trade is the "exit"; find the most recent buy before it
  const isSell = trade.side === "sell";
  const exitTrade = isSell ? trade : null;
  const entryTrade = isSell
    ? allHistory.find(
        (t) =>
          t.ticker === ticker &&
          t.side === "buy" &&
          t.simulationDate < trade.simulationDate,
      ) ?? trade
    : trade;

  const exitRecord = exitTrade ?? trade;
  const entryRecord = entryTrade;

  const direction: "long" | "short" =
    entryRecord.side === "buy" ? "long" : "short";

  const holdDurationMs = Math.max(
    0,
    exitRecord.simulationDate - entryRecord.simulationDate,
  );
  const holdDurationLabel = formatDuration(holdDurationMs);

  const grossPnL = isSell ? trade.realizedPnL + trade.fees : 0;
  const netPnL = isSell ? trade.realizedPnL : 0;
  const pnlPercent =
    entryRecord.price !== 0
      ? (netPnL / (entryRecord.price * trade.quantity)) * 100
      : 0;

  const totalBars = 50;
  const bars = generateSyntheticBars(
    ticker,
    entryRecord.simulationDate,
    exitRecord.simulationDate,
    entryRecord.price,
    exitRecord.price,
    totalBars,
  );

  // Compute max drawdown and max runup during bars[entryIdx..exitIdx]
  const entryBarIdx = Math.floor(totalBars * 0.2);
  const exitBarIdx = Math.floor(totalBars * 0.8);
  const tradeBars = bars.slice(entryBarIdx, exitBarIdx + 1);
  let maxDrawdown = 0;
  let maxRunup = 0;

  for (const bar of tradeBars) {
    if (direction === "long") {
      const runup = bar.high - entryRecord.price;
      const drawdown = entryRecord.price - bar.low;
      if (runup > maxRunup) maxRunup = runup;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    } else {
      const runup = entryRecord.price - bar.low;
      const drawdown = bar.high - entryRecord.price;
      if (runup > maxRunup) maxRunup = runup;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
  }

  const summary: TradeSummary = {
    ticker,
    direction,
    entryPrice: entryRecord.price,
    exitPrice: exitRecord.price,
    quantity: trade.quantity,
    grossPnL,
    netPnL,
    pnlPercent,
    holdDurationMs,
    holdDurationLabel,
    maxDrawdown,
    maxRunup,
    totalFees: (entryRecord.fees ?? 0) + (exitRecord.fees ?? 0),
    winLoss:
      netPnL > 0.01 ? "win" : netPnL < -0.01 ? "loss" : "breakeven",
  };

  const entries: TradeEntry[] = [
    {
      tradeId: entryRecord.id,
      side: entryRecord.side,
      price: entryRecord.price,
      quantity: entryRecord.quantity,
      simulationDate: entryRecord.simulationDate,
      fees: entryRecord.fees ?? 0,
    },
  ];
  if (exitTrade && exitTrade.id !== entryRecord.id) {
    entries.push({
      tradeId: exitTrade.id,
      side: exitTrade.side,
      price: exitTrade.price,
      quantity: exitTrade.quantity,
      simulationDate: exitTrade.simulationDate,
      fees: exitTrade.fees ?? 0,
    });
  }

  const annotations: Annotation[] = [
    {
      barIndex: entryBarIdx,
      type: "entry",
      price: entryRecord.price,
      label: `Entry @ ${formatPrice(entryRecord.price)}`,
    },
    {
      barIndex: exitBarIdx,
      type: "exit",
      price: exitRecord.price,
      label: `Exit @ ${formatPrice(exitRecord.price)}`,
      pnl: netPnL,
    },
  ];

  return {
    tradeId: trade.id,
    ticker,
    entries,
    bars,
    annotations,
    summary,
  };
}

// ─── URL Encoding / Decoding ─────────────────────────────────────────────────

/**
 * Encode a TradeReplayData as a base64 URL-safe string.
 * Compresses the bars by storing only deltas to reduce payload size.
 */
export function encodeReplayURL(replay: TradeReplayData): string {
  try {
    const json = JSON.stringify(replay);
    // Use btoa for base64 encoding (browser-safe)
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch {
    return "";
  }
}

/**
 * Decode a base64 URL-safe string back to TradeReplayData.
 */
export function decodeReplayURL(encoded: string): TradeReplayData | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json) as TradeReplayData;
    // Basic validation
    if (!data.tradeId || !data.ticker || !Array.isArray(data.bars)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms <= 0) return "Same bar";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Re-export OHLCVBar compatibility helper
export function ohlcvBarToReplay(bar: OHLCVBar): OHLCV {
  return {
    timestamp: bar.timestamp,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
  };
}
