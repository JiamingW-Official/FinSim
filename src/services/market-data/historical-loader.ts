import type { OHLCVBar, Timeframe } from "@/types/market";
import { INTRADAY_TIMEFRAMES } from "@/types/market";
import { generateIntradayBars } from "@/services/market-data/intraday-generator";
import { getVisibleBarCount } from "@/services/market-data/bar-scheduler";

// ── In-memory caches ──────────────────────────────────────────────────────────

/** Daily bars cache: ticker -> OHLCVBar[] */
const dailyCache = new Map<string, OHLCVBar[]>();

/** Daily bar index: ticker -> Map<dateISO, OHLCVBar> for O(1) date lookup */
const dailyIndex = new Map<string, Map<string, OHLCVBar>>();

/** Intraday bar cache: `${ticker}:${dateISO}:${timeframe}` -> OHLCVBar[] */
const intradayCache = new Map<string, OHLCVBar[]>();

/** Track in-flight fetches to avoid duplicate requests */
const pendingFetches = new Map<string, Promise<OHLCVBar[]>>();

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 2);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function cacheKey(ticker: string, dateISO: string, timeframe: Timeframe): string {
  return `${ticker}:${dateISO}:${timeframe}`;
}

/**
 * Build a date-indexed lookup map from daily bars for fast access.
 */
function buildDailyIndex(ticker: string, bars: OHLCVBar[]): void {
  const index = new Map<string, OHLCVBar>();
  for (const bar of bars) {
    const dateKey = new Date(bar.timestamp).toISOString().slice(0, 10);
    index.set(dateKey, bar);
  }
  dailyIndex.set(ticker, index);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch all daily bars for a ticker from the API. Results are cached in memory.
 * Subsequent calls return the cached data without re-fetching.
 */
export async function loadDailyBars(ticker: string): Promise<OHLCVBar[]> {
  // Return cached data if available
  const cached = dailyCache.get(ticker);
  if (cached) return cached;

  // Deduplicate in-flight requests
  const pending = pendingFetches.get(ticker);
  if (pending) return pending;

  const { from, to } = getDateRange();
  const params = new URLSearchParams({
    ticker,
    timeframe: "1d",
    from,
    to,
  });

  const fetchPromise = fetch(`/api/market-data?${params}`)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch daily bars for ${ticker}: ${res.statusText}`);
      }
      const bars: OHLCVBar[] = await res.json();
      dailyCache.set(ticker, bars);
      buildDailyIndex(ticker, bars);
      pendingFetches.delete(ticker);
      return bars;
    })
    .catch((err) => {
      pendingFetches.delete(ticker);
      throw err;
    });

  pendingFetches.set(ticker, fetchPromise);
  return fetchPromise;
}

/**
 * Get the daily bar for a specific date. Returns null if no data exists
 * (weekends, holidays, dates outside data range).
 *
 * Requires `loadDailyBars()` to have been called first for this ticker.
 */
export function getDailyBar(ticker: string, gameDate: string): OHLCVBar | null {
  const index = dailyIndex.get(ticker);
  if (!index) return null;
  return index.get(gameDate) ?? null;
}

/**
 * Generate intraday bars for a specific ticker, date, and timeframe.
 * Uses the existing Brownian bridge generator seeded deterministically
 * by ticker + date. Results are cached.
 *
 * Returns an empty array if there is no daily bar for the given date.
 */
export function getIntradayBars(
  ticker: string,
  gameDate: string,
  timeframe: Timeframe,
): OHLCVBar[] {
  if (!INTRADAY_TIMEFRAMES.has(timeframe)) return [];

  const key = cacheKey(ticker, gameDate, timeframe);
  const cached = intradayCache.get(key);
  if (cached) return cached;

  const daily = getDailyBar(ticker, gameDate);
  if (!daily) return [];

  // Generate intraday bars from the single daily bar.
  // generateIntradayBars expects an array; we pass a single-element array.
  // The generator seeds from (timestamp, ticker), which is deterministic per date.
  const bars = generateIntradayBars([daily], timeframe);

  intradayCache.set(key, bars);
  return bars;
}

/**
 * Get only the bars that should be visible given the current game time.
 * Uses bar-scheduler to determine how many bars to reveal.
 *
 * For intraday timeframes: returns a slice of the generated intraday bars.
 * For daily: returns the daily bar only if market has closed.
 */
export function getVisibleBars(
  ticker: string,
  gameDate: string,
  gameHour: number,
  gameMinute: number,
  timeframe: Timeframe,
): OHLCVBar[] {
  const visibleCount = getVisibleBarCount(gameHour, gameMinute, timeframe);

  if (timeframe === "1d") {
    if (visibleCount === 0) return [];
    const daily = getDailyBar(ticker, gameDate);
    return daily ? [daily] : [];
  }

  if (INTRADAY_TIMEFRAMES.has(timeframe)) {
    const allBars = getIntradayBars(ticker, gameDate, timeframe);
    return allBars.slice(0, visibleCount);
  }

  // Weekly — not applicable for single-day visibility
  return [];
}

/**
 * Get historical bars ending at (and including) the given date.
 *
 * For daily timeframe: returns the last `count` daily bars up to `upToDate`.
 * For intraday: returns bars from previous trading days + current day,
 * totaling approximately `count` bars.
 *
 * Requires `loadDailyBars()` to have been called first.
 */
export function getHistoricalBars(
  ticker: string,
  upToDate: string,
  timeframe: Timeframe,
  count: number,
): OHLCVBar[] {
  const allDaily = dailyCache.get(ticker);
  if (!allDaily || allDaily.length === 0) return [];

  // Find the index of upToDate (or the closest earlier date)
  let endIdx = -1;
  for (let i = allDaily.length - 1; i >= 0; i--) {
    const dateKey = new Date(allDaily[i].timestamp).toISOString().slice(0, 10);
    if (dateKey <= upToDate) {
      endIdx = i;
      break;
    }
  }

  if (endIdx < 0) return [];

  if (timeframe === "1d") {
    const startIdx = Math.max(0, endIdx - count + 1);
    return allDaily.slice(startIdx, endIdx + 1);
  }

  if (timeframe === "1wk") {
    // For weekly, slice daily bars and let the caller aggregate if needed
    const startIdx = Math.max(0, endIdx - count * 5 + 1); // ~5 trading days per week
    return allDaily.slice(startIdx, endIdx + 1);
  }

  // Intraday: collect bars from multiple days
  const result: OHLCVBar[] = [];
  let collected = 0;

  for (let dayIdx = endIdx; dayIdx >= 0 && collected < count; dayIdx--) {
    const dayBar = allDaily[dayIdx];
    const dateKey = new Date(dayBar.timestamp).toISOString().slice(0, 10);
    const dayBars = getIntradayBars(ticker, dateKey, timeframe);

    if (dayBars.length === 0) continue;

    // How many bars we still need
    const needed = count - collected;
    if (dayBars.length <= needed) {
      result.unshift(...dayBars);
      collected += dayBars.length;
    } else {
      // Take only the last `needed` bars from this day
      result.unshift(...dayBars.slice(dayBars.length - needed));
      collected += needed;
    }
  }

  return result;
}

/**
 * Get all trading dates available for a ticker, sorted ascending.
 * Requires `loadDailyBars()` to have been called first.
 */
export function getTradingDates(ticker: string): string[] {
  const index = dailyIndex.get(ticker);
  if (!index) return [];
  return Array.from(index.keys()).sort();
}

/**
 * Check if a given date is a trading day for the ticker.
 */
export function isTradingDay(ticker: string, dateISO: string): boolean {
  const index = dailyIndex.get(ticker);
  if (!index) return false;
  return index.has(dateISO);
}

/**
 * Clear all caches. Useful for testing or when switching game sessions.
 */
export function clearCaches(): void {
  dailyCache.clear();
  dailyIndex.clear();
  intradayCache.clear();
  pendingFetches.clear();
}
