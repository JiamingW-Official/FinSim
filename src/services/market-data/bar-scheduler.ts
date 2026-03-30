import type { Timeframe } from "@/types/market";

// Market hours: 9:30 AM - 4:00 PM ET = 390 minutes
const MARKET_OPEN_HOUR = 9;
const MARKET_OPEN_MINUTE = 30;
const MARKET_CLOSE_HOUR = 16;
const MARKET_CLOSE_MINUTE = 0;
const MARKET_MINUTES = 390; // 6.5 hours

export interface BarSchedule {
  timeframe: Timeframe;
  /** Number of bars generated per trading day */
  barsPerDay: number;
  /** How many game-minutes each bar represents */
  gameMinutesPerBar: number;
  /** At 6x speed, how many real seconds per bar */
  realSecondsPerBar: number;
}

const SCHEDULES: Record<string, BarSchedule> = {
  "5m": {
    timeframe: "5m",
    barsPerDay: 78,
    gameMinutesPerBar: 5,
    realSecondsPerBar: 50, // 300s game / 6x
  },
  "15m": {
    timeframe: "15m",
    barsPerDay: 26,
    gameMinutesPerBar: 15,
    realSecondsPerBar: 150, // 900s game / 6x
  },
  "1h": {
    timeframe: "1h",
    barsPerDay: 7,
    gameMinutesPerBar: 60,
    realSecondsPerBar: 600, // 3600s game / 6x
  },
  "1d": {
    timeframe: "1d",
    barsPerDay: 1,
    gameMinutesPerBar: 390,
    realSecondsPerBar: 3900, // full day / 6x
  },
  "1wk": {
    timeframe: "1wk",
    barsPerDay: 0, // weekly bars aren't revealed per-day in the same sense
    gameMinutesPerBar: 1950, // 5 trading days
    realSecondsPerBar: 19500,
  },
};

/**
 * Get the bar schedule configuration for a given timeframe.
 */
export function getBarSchedule(timeframe: Timeframe): BarSchedule {
  return SCHEDULES[timeframe] ?? SCHEDULES["1d"];
}

/**
 * Convert game hour/minute to minutes since market open.
 * Returns negative if before open, or > 390 if after close.
 */
function minutesSinceOpen(gameHour: number, gameMinute: number): number {
  return (gameHour - MARKET_OPEN_HOUR) * 60 + (gameMinute - MARKET_OPEN_MINUTE);
}

/**
 * Check if the given game time falls within market hours (9:30-16:00).
 */
export function isMarketOpen(gameHour: number, gameMinute: number): boolean {
  const mins = minutesSinceOpen(gameHour, gameMinute);
  return mins >= 0 && mins < MARKET_MINUTES;
}

/**
 * Get the 0-based index of the current bar given game time and timeframe.
 * Returns -1 if market is closed (before 9:30 or after 16:00).
 *
 * For 5m: bar 0 covers 9:30-9:35, bar 1 covers 9:35-9:40, etc.
 * For 1h: bar 0 covers 9:30-10:30, bar 1 covers 10:30-11:30, etc.
 * For 1d: bar 0 is the single daily bar, available only after close.
 */
export function getCurrentBarIndex(
  gameHour: number,
  gameMinute: number,
  timeframe: Timeframe,
): number {
  const mins = minutesSinceOpen(gameHour, gameMinute);

  // Before market open or after close
  if (mins < 0 || mins >= MARKET_MINUTES) return -1;

  const schedule = getBarSchedule(timeframe);

  if (timeframe === "1d") {
    // Daily bar is only "current" during market hours; index is always 0
    return 0;
  }

  return Math.min(
    Math.floor(mins / schedule.gameMinutesPerBar),
    schedule.barsPerDay - 1,
  );
}

/**
 * Get the unix timestamp (milliseconds) for a specific bar on a trading date.
 *
 * @param tradingDate - The trading date (Date object, only year/month/day used)
 * @param barIndex - 0-based bar index within the day
 * @param timeframe - The timeframe
 * @returns Unix timestamp in milliseconds
 */
export function getBarTimestamp(
  tradingDate: Date,
  barIndex: number,
  timeframe: Timeframe,
): number {
  const schedule = getBarSchedule(timeframe);

  // Start of day in UTC
  const dayStartMs = Date.UTC(
    tradingDate.getFullYear(),
    tradingDate.getMonth(),
    tradingDate.getDate(),
  );

  if (timeframe === "1d" || timeframe === "1wk") {
    // Daily/weekly bars use day-start timestamp (matching existing convention)
    return dayStartMs;
  }

  // Intraday: market open is 14:30 UTC (9:30 ET, approximation used by existing code)
  const marketOpenMs = 14.5 * 60 * 60 * 1000; // 14:30 UTC in ms from midnight
  const barOffsetMs = barIndex * schedule.gameMinutesPerBar * 60 * 1000;

  return dayStartMs + marketOpenMs + barOffsetMs;
}

/**
 * How many bars of the given timeframe should be visible so far today,
 * given the current game time.
 *
 * - Before market open: 0
 * - During market hours: 1..barsPerDay (completed bars + current partial bar)
 * - After market close: barsPerDay (all bars visible)
 *
 * For daily timeframe:
 * - Before close: 0 (daily bar not yet formed)
 * - At/after close: 1
 */
export function getVisibleBarCount(
  gameHour: number,
  gameMinute: number,
  timeframe: Timeframe,
): number {
  const mins = minutesSinceOpen(gameHour, gameMinute);
  const schedule = getBarSchedule(timeframe);

  if (timeframe === "1d") {
    // Daily bar is revealed only at market close
    const closeMinutes =
      (MARKET_CLOSE_HOUR - MARKET_OPEN_HOUR) * 60 +
      (MARKET_CLOSE_MINUTE - MARKET_OPEN_MINUTE);
    return mins >= closeMinutes ? 1 : 0;
  }

  if (timeframe === "1wk") {
    // Weekly bars: same logic as daily — revealed at end of week
    return 0;
  }

  // Before market open
  if (mins < 0) return 0;

  // After market close — all bars visible
  if (mins >= MARKET_MINUTES) return schedule.barsPerDay;

  // During market hours: completed bars + 1 (the currently forming bar)
  const completedBars = Math.floor(mins / schedule.gameMinutesPerBar);
  return Math.min(completedBars + 1, schedule.barsPerDay);
}

/**
 * Get the fractional progress within the current bar (0.0 to 1.0).
 * Useful for interpolating price within a bar.
 * Returns 1.0 if market is closed.
 */
export function getSubBarProgress(
  gameHour: number,
  gameMinute: number,
  timeframe: Timeframe,
): number {
  const mins = minutesSinceOpen(gameHour, gameMinute);
  const schedule = getBarSchedule(timeframe);

  if (mins < 0 || mins >= MARKET_MINUTES) return 1.0;

  const withinBar = mins % schedule.gameMinutesPerBar;
  return withinBar / schedule.gameMinutesPerBar;
}
