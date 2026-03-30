/**
 * Game Clock Constants
 * Shared between engine and trading-calendar to avoid circular dependencies.
 */

/** Game season start date: market open on the first trading day */
export const GAME_START_DATE = new Date("2023-01-01T09:30:00Z");

/** Game season end date */
export const SEASON_END_DATE = new Date("2026-03-01T00:00:00Z");

/** Time compression factor: 6x speed */
export const TIME_MULTIPLIER = 6;

/** Milliseconds per game day in real time: 24h / 6 = 4 real hours */
export const MS_PER_GAME_DAY = (24 * 60 * 60 * 1000) / TIME_MULTIPLIER;
