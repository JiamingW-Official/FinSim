/**
 * Core Game Clock Engine
 *
 * 4 real hours = 1 game day (6x time compression)
 * Game simulates historical market from 2023-01-01 to 2026-03-01
 * Pure functions — no side effects, no state.
 */

export {
  GAME_START_DATE,
  SEASON_END_DATE,
  TIME_MULTIPLIER,
  MS_PER_GAME_DAY,
} from "./constants";

import {
  GAME_START_DATE,
  SEASON_END_DATE,
  TIME_MULTIPLIER,
} from "./constants";

import {
  isMarketDay,
  getTradingDayIndex,
  TOTAL_TRADING_DAYS,
} from "./trading-calendar";

/** Total game-time milliseconds in the season */
const TOTAL_SEASON_MS =
  SEASON_END_DATE.getTime() - GAME_START_DATE.getTime();

export type MarketSession = "pre-market" | "open" | "after-hours" | "closed";

export interface GameClockState {
  /** Current simulated date/time */
  gameDate: Date;
  /** Seconds into the current game day (0-86399) */
  gameTimeOfDay: number;
  /** Hour of the game day (0-23) */
  gameHour: number;
  /** Minute of the game day (0-59) */
  gameMinute: number;
  /** Current market session */
  marketSession: MarketSession;
  /** 0-based trading day index (only counts market days) */
  tradingDayIndex: number;
  /** 0-1 progress through the entire season */
  seasonProgress: number;
  /** Whether the current game date is a market day */
  isMarketDay: boolean;
  /** Whether the season has ended */
  isSeasonOver: boolean;
  /** Total trading days in the season */
  totalTradingDays: number;
}

/**
 * Determine the market session based on hour and minute.
 *
 * Pre-market:   04:00 - 09:29
 * Open:         09:30 - 15:59
 * After-hours:  16:00 - 19:59
 * Closed:       20:00 - 03:59
 */
export function getMarketSession(hour: number, minute: number): MarketSession {
  const timeInMinutes = hour * 60 + minute;

  if (timeInMinutes >= 240 && timeInMinutes < 570) {
    return "pre-market";
  }
  if (timeInMinutes >= 570 && timeInMinutes < 960) {
    return "open";
  }
  if (timeInMinutes >= 960 && timeInMinutes < 1200) {
    return "after-hours";
  }
  return "closed";
}

/**
 * Compute the full game clock state from the season start real time.
 *
 * Core formula:
 *   elapsedRealMs = now - seasonStartRealMs
 *   elapsedGameMs = elapsedRealMs * TIME_MULTIPLIER
 *   gameDate = GAME_START_DATE + elapsedGameMs
 */
export function getGameTime(
  seasonStartRealMs: number,
  nowRealMs?: number
): GameClockState {
  const now = nowRealMs ?? Date.now();
  const elapsedRealMs = Math.max(0, now - seasonStartRealMs);
  const elapsedGameMs = elapsedRealMs * TIME_MULTIPLIER;

  const gameDateMs = GAME_START_DATE.getTime() + elapsedGameMs;
  const isSeasonOver = gameDateMs >= SEASON_END_DATE.getTime();

  // Clamp to season end
  const clampedMs = Math.min(gameDateMs, SEASON_END_DATE.getTime());
  let gameDate = new Date(clampedMs);

  let gameHour = gameDate.getUTCHours();
  let gameMinute = gameDate.getUTCMinutes();
  const gameSecond = gameDate.getUTCSeconds();

  // --- Skip dead zones so the clock always shows an active trading window ---

  // 1. Before pre-market (midnight–3:59 AM) → snap to 4:00 AM on the same day
  if (gameHour < 4) {
    gameDate.setUTCHours(4, 0, 0, 0);
    gameHour = 4;
    gameMinute = 0;
  }

  // 2. After after-hours end (8:00 PM+) → advance to next trading day at 4:00 AM
  if (gameHour >= 20) {
    const next = new Date(gameDate.getTime());
    next.setUTCDate(next.getUTCDate() + 1);
    while (!isMarketDay(next)) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    next.setUTCHours(4, 0, 0, 0);
    gameDate = next;
    gameHour = 4;
    gameMinute = 0;
  }

  // 3. Weekend / holiday → advance to the next trading day at 4:00 AM
  if (!isMarketDay(gameDate)) {
    const next = new Date(gameDate.getTime());
    // start search from the same date (it may already be a non-trading day)
    while (!isMarketDay(next)) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    next.setUTCHours(4, 0, 0, 0);
    gameDate = next;
    gameHour = 4;
    gameMinute = 0;
  }

  const gameTimeOfDay = gameHour * 3600 + gameMinute * 60 + gameSecond;

  const isMarketDayResult = isMarketDay(gameDate);
  const marketSession = isMarketDayResult
    ? getMarketSession(gameHour, gameMinute)
    : "closed";

  const tradingDayIndex = getTradingDayIndex(gameDate);

  const seasonProgress = Math.min(
    1,
    Math.max(0, (clampedMs - GAME_START_DATE.getTime()) / TOTAL_SEASON_MS)
  );

  return {
    gameDate,
    gameTimeOfDay,
    gameHour,
    gameMinute,
    marketSession,
    tradingDayIndex,
    seasonProgress,
    isMarketDay: isMarketDayResult,
    isSeasonOver,
    totalTradingDays: TOTAL_TRADING_DAYS,
  };
}

/**
 * Convert a game date + time-of-day into a real timestamp.
 * Useful for scheduling future events.
 */
export function gameTimeToRealMs(
  gameDate: Date,
  gameTimeSeconds: number,
  seasonStartRealMs: number
): number {
  const targetDate = new Date(gameDate);
  targetDate.setUTCHours(0, 0, 0, 0);
  const targetMs = targetDate.getTime() + gameTimeSeconds * 1000;

  const elapsedGameMs = targetMs - GAME_START_DATE.getTime();
  const elapsedRealMs = elapsedGameMs / TIME_MULTIPLIER;
  return seasonStartRealMs + elapsedRealMs;
}

/**
 * Get the number of elapsed game days since season start.
 */
export function getElapsedGameDays(
  seasonStartRealMs: number,
  nowRealMs?: number
): number {
  const now = nowRealMs ?? Date.now();
  const elapsedRealMs = Math.max(0, now - seasonStartRealMs);
  const elapsedGameMs = elapsedRealMs * TIME_MULTIPLIER;
  return elapsedGameMs / (24 * 60 * 60 * 1000);
}
