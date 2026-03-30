/**
 * US Market Trading Calendar 2023-2026
 * NYSE holidays + weekend detection
 */

import { GAME_START_DATE, SEASON_END_DATE } from "./constants";

// NYSE holidays as "YYYY-MM-DD" strings for O(1) lookup
const NYSE_HOLIDAYS: ReadonlySet<string> = new Set([
  // 2023
  "2023-01-02", // New Year's (observed)
  "2023-01-16", // MLK Jr. Day
  "2023-02-20", // Presidents' Day
  "2023-04-07", // Good Friday
  "2023-05-29", // Memorial Day
  "2023-06-19", // Juneteenth
  "2023-07-04", // Independence Day
  "2023-09-04", // Labor Day
  "2023-11-23", // Thanksgiving
  "2023-12-25", // Christmas
  // 2024
  "2024-01-01", // New Year's Day
  "2024-01-15", // MLK Jr. Day
  "2024-02-19", // Presidents' Day
  "2024-03-29", // Good Friday
  "2024-05-27", // Memorial Day
  "2024-06-19", // Juneteenth
  "2024-07-04", // Independence Day
  "2024-09-02", // Labor Day
  "2024-11-28", // Thanksgiving
  "2024-12-25", // Christmas
  // 2025
  "2025-01-01", // New Year's Day
  "2025-01-20", // MLK Jr. Day
  "2025-02-17", // Presidents' Day
  "2025-04-18", // Good Friday
  "2025-05-26", // Memorial Day
  "2025-06-19", // Juneteenth
  "2025-07-04", // Independence Day
  "2025-09-01", // Labor Day
  "2025-11-27", // Thanksgiving
  "2025-12-25", // Christmas
  // 2026
  "2026-01-01", // New Year's Day
  "2026-01-19", // MLK Jr. Day
  "2026-02-16", // Presidents' Day
  "2026-04-03", // Good Friday
  "2026-05-25", // Memorial Day
  "2026-06-19", // Juneteenth
  "2026-07-03", // Independence Day (observed, Jul 4 = Saturday)
  "2026-09-07", // Labor Day
  "2026-11-26", // Thanksgiving
  "2026-12-25", // Christmas
]);

/** Format a Date as "YYYY-MM-DD" in UTC */
function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Check if a given date is a market trading day (not weekend, not holiday) */
export function isMarketDay(date: Date): boolean {
  const dow = date.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  return !NYSE_HOLIDAYS.has(toDateKey(date));
}

/** Get the next trading day after the given date */
export function getNextTradingDay(date: Date): Date {
  const next = new Date(date);
  do {
    next.setUTCDate(next.getUTCDate() + 1);
  } while (!isMarketDay(next));
  return next;
}

// Pre-compute trading day index lookup for the entire season
const tradingDayIndexMap = new Map<string, number>();
const tradingDayByIndexArr: Date[] = [];

function buildTradingDayIndex(): void {
  if (tradingDayIndexMap.size > 0) return;

  const cursor = new Date(GAME_START_DATE);
  cursor.setUTCHours(0, 0, 0, 0);

  let idx = 0;
  while (cursor <= SEASON_END_DATE) {
    if (isMarketDay(cursor)) {
      const key = toDateKey(cursor);
      tradingDayIndexMap.set(key, idx);
      tradingDayByIndexArr.push(new Date(cursor));
      idx++;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

buildTradingDayIndex();

/** Total number of trading days in the season */
export const TOTAL_TRADING_DAYS: number = tradingDayByIndexArr.length;

/**
 * Get the 0-based trading day index for a given date.
 * For non-trading days, returns the index of the most recent trading day.
 */
export function getTradingDayIndex(date: Date): number {
  const key = toDateKey(date);
  const exact = tradingDayIndexMap.get(key);
  if (exact !== undefined) return exact;

  // For weekends/holidays, find the most recent trading day
  const search = new Date(date);
  search.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < 10; i++) {
    search.setUTCDate(search.getUTCDate() - 1);
    const k = toDateKey(search);
    const idx = tradingDayIndexMap.get(k);
    if (idx !== undefined) return idx;
  }
  return 0;
}

/**
 * Get the Date of a trading day by its 0-based index.
 * Returns undefined if index is out of range.
 */
export function getTradingDayByIndex(index: number): Date | undefined {
  return tradingDayByIndexArr[index];
}
