/**
 * GET /api/game-time
 *
 * Authoritative server-side game clock endpoint.
 * Returns the current server UTC timestamp so the client can compute
 * the correct EST-anchored game time without relying on the potentially
 * manipulated client clock.
 *
 * Response is lightweight (<100 bytes) and cached for 1 second.
 */

import { NextResponse } from "next/server";

// EST = UTC-5 (no DST adjustment for simplicity — consistent with client)
const EST_OFFSET_MS = 5 * 60 * 60 * 1000;

export const revalidate = 0; // never cache — always fresh

export async function GET() {
  const nowUtcMs = Date.now();

  // Compute last midnight EST as UTC ms
  const nowESTMs = nowUtcMs - EST_OFFSET_MS;
  const lastMidnightESTasUTC =
    Math.floor(nowESTMs / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000) + EST_OFFSET_MS;

  // Elapsed real ms since last midnight EST
  const elapsedRealMs = nowUtcMs - lastMidnightESTasUTC;

  // Game day index (0 = Day 1 = 0:00-4:00 AM EST, 5 = Day 6 = 8:00-11:59 PM EST)
  const MS_PER_GAME_DAY = 4 * 60 * 60 * 1000; // 4 real hours
  const gameDayInCycle = Math.floor(elapsedRealMs / MS_PER_GAME_DAY); // 0-5

  // Game time of day in minutes (0 = midnight, 570 = 9:30 AM, 960 = 4:00 PM)
  const elapsedInDayMs = elapsedRealMs % MS_PER_GAME_DAY;
  const gameMinutesElapsed = Math.floor((elapsedInDayMs * 6) / 60000);
  const gameHour = Math.floor(gameMinutesElapsed / 60);
  const gameMinute = gameMinutesElapsed % 60;

  return NextResponse.json(
    {
      serverUtcMs: nowUtcMs,
      lastMidnightESTasUTC,
      gameDayInCycle,      // 0-5 (Day 1 through Day 6)
      gameHour,            // 0-23 (game time of day)
      gameMinute,          // 0-59
      estHour: Math.floor(((nowUtcMs - EST_OFFSET_MS) % (24 * 60 * 60 * 1000)) / 3600000),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
