import type { BarGenConfig } from "@/data/lessons/practice-data";

/**
 * Curated bar generation configs that mimic real historical market patterns.
 * Each config is carefully tuned with drift, volatility, mean reversion,
 * support/resistance, consolidation zones, and pattern injections to
 * produce charts that look and feel like real stock charts.
 */

export interface ArenaPatternConfig {
 id: string;
 name: string;
 description: string;
 /** Returns a BarGenConfig for a given seed and bar count */
 getConfig: (seed: number, barCount: number) => Omit<BarGenConfig, "count" | "seed">;
}

// ── Pattern 1: Bull Rally ────────────────────────────────────
// Inspired by TSLA 2020 — strong uptrend with pullbacks, momentum bursts

const BULL_RALLY: ArenaPatternConfig = {
 id: "bull_rally",
 name: "Bull Rally",
 description: "Strong uptrend with pullbacks and momentum bursts",
 getConfig: (_seed, barCount) => ({
 startPrice: 100,
 drift: 0.005,
 volatility: 0.016,
 meanReversion: 0.015,
 target: 145,
 momentumBias: 0.68,
 consolidation: [
 { start: Math.floor(barCount * 0.25), end: Math.floor(barCount * 0.32), tightness: 0.35 },
 { start: Math.floor(barCount * 0.55), end: Math.floor(barCount * 0.62), tightness: 0.4 },
 ],
 support: [97, 108, 120],
 resistance: [115, 130, 145],
 patterns: [
 { bar: Math.floor(barCount * 0.1), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.25), type: "doji" as const },
 { bar: Math.floor(barCount * 0.33), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.48), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.55), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.63), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.78), type: "doji" as const },
 { bar: Math.floor(barCount * 0.85), type: "shooting-star" as const },
 ],
 baseVolume: 80000,
 }),
};

// ── Pattern 2: Flash Crash ───────────────────────────────────
// Inspired by COVID March 2020 — sharp drop then V-shaped recovery

const FLASH_CRASH: ArenaPatternConfig = {
 id: "flash_crash",
 name: "Flash Crash",
 description: "Sharp market crash followed by V-shaped recovery",
 getConfig: (_seed, barCount) => {
 const crashStart = Math.floor(barCount * 0.15);
 const crashEnd = Math.floor(barCount * 0.35);
 const recoveryMid = Math.floor(barCount * 0.55);
 return {
 startPrice: 120,
 drift: -0.001,
 volatility: 0.028,
 meanReversion: 0.025,
 target: 115,
 momentumBias: 0.55,
 consolidation: [
 // Pre-crash calm
 { start: 0, end: crashStart - 5, tightness: 0.4 },
 // Post-recovery calm
 { start: Math.floor(barCount * 0.7), end: Math.floor(barCount * 0.8), tightness: 0.5 },
 ],
 support: [88, 95, 105],
 resistance: [118, 125],
 patterns: [
 { bar: crashStart, type: "bearish-engulfing" as const },
 { bar: crashStart + 3, type: "bearish-engulfing" as const },
 { bar: crashEnd - 2, type: "hammer" as const },
 { bar: crashEnd, type: "bullish-engulfing" as const },
 { bar: recoveryMid, type: "doji" as const },
 { bar: Math.floor(barCount * 0.65), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.82), type: "shooting-star" as const },
 ],
 baseVolume: 100000,
 };
 },
};

// ── Pattern 3: Sideways Chop ─────────────────────────────────
// Range-bound market with tight oscillation between support/resistance

const SIDEWAYS_CHOP: ArenaPatternConfig = {
 id: "sideways_chop",
 name: "Sideways Chop",
 description: "Range-bound market oscillating between support and resistance",
 getConfig: (_seed, barCount) => ({
 startPrice: 100,
 drift: 0.0003,
 volatility: 0.013,
 meanReversion: 0.10,
 target: 101,
 momentumBias: 0.42,
 consolidation: [
 { start: Math.floor(barCount * 0.3), end: Math.floor(barCount * 0.4), tightness: 0.5 },
 { start: Math.floor(barCount * 0.6), end: Math.floor(barCount * 0.7), tightness: 0.45 },
 ],
 support: [96, 98],
 resistance: [103, 105],
 patterns: [
 { bar: Math.floor(barCount * 0.08), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.16), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.28), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.38), type: "doji" as const },
 { bar: Math.floor(barCount * 0.48), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.58), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.68), type: "doji" as const },
 { bar: Math.floor(barCount * 0.78), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.88), type: "hammer" as const },
 ],
 baseVolume: 55000,
 }),
};

// ── Pattern 4: Double Top ────────────────────────────────────
// Rise to resistance, rejection, second attempt fails, breakdown

const DOUBLE_TOP: ArenaPatternConfig = {
 id: "double_top",
 name: "Double Top",
 description: "Classic double top reversal pattern with breakdown",
 getConfig: (_seed, barCount) => {
 const firstPeak = Math.floor(barCount * 0.3);
 const valley = Math.floor(barCount * 0.5);
 const secondPeak = Math.floor(barCount * 0.65);
 return {
 startPrice: 95,
 drift: 0.001,
 volatility: 0.017,
 meanReversion: 0.04,
 target: 100,
 momentumBias: 0.52,
 consolidation: [
 // First consolidation at peak
 { start: firstPeak - 5, end: firstPeak + 5, tightness: 0.5 },
 // Second consolidation at peak
 { start: secondPeak - 5, end: secondPeak + 5, tightness: 0.45 },
 ],
 support: [92, 96],
 resistance: [108, 110],
 patterns: [
 { bar: Math.floor(barCount * 0.12), type: "bullish-engulfing" as const },
 { bar: firstPeak, type: "shooting-star" as const },
 { bar: firstPeak + 2, type: "bearish-engulfing" as const },
 { bar: valley, type: "hammer" as const },
 { bar: valley + 1, type: "bullish-engulfing" as const },
 { bar: secondPeak, type: "shooting-star" as const },
 { bar: secondPeak + 2, type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.8), type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.92), type: "doji" as const },
 ],
 baseVolume: 70000,
 };
 },
};

// ── Pattern 5: Bear Flag ─────────────────────────────────────
// Steady decline with short relief rallies (bear flags)

const BEAR_FLAG: ArenaPatternConfig = {
 id: "bear_flag",
 name: "Bear Flag",
 description: "Steady decline with brief relief rallies",
 getConfig: (_seed, barCount) => ({
 startPrice: 130,
 drift: -0.004,
 volatility: 0.019,
 meanReversion: 0.02,
 target: 95,
 momentumBias: 0.58,
 consolidation: [
 // Relief rally zones (flag portions)
 { start: Math.floor(barCount * 0.2), end: Math.floor(barCount * 0.27), tightness: 0.35 },
 { start: Math.floor(barCount * 0.45), end: Math.floor(barCount * 0.52), tightness: 0.3 },
 { start: Math.floor(barCount * 0.7), end: Math.floor(barCount * 0.76), tightness: 0.35 },
 ],
 support: [95, 105, 115],
 resistance: [125, 132],
 patterns: [
 { bar: Math.floor(barCount * 0.05), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.08), type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.2), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.28), type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.45), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.53), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.54), type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.7), type: "doji" as const },
 { bar: Math.floor(barCount * 0.77), type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.9), type: "hammer" as const },
 ],
 baseVolume: 90000,
 }),
};

// ── Pattern 6: Breakout Rally ────────────────────────────────
// Long consolidation then explosive breakout upward

const BREAKOUT_RALLY: ArenaPatternConfig = {
 id: "breakout_rally",
 name: "Breakout Rally",
 description: "Extended consolidation followed by explosive breakout",
 getConfig: (_seed, barCount) => ({
 startPrice: 100,
 drift: 0.003,
 volatility: 0.015,
 meanReversion: 0.06,
 target: 120,
 momentumBias: 0.6,
 consolidation: [
 // Long squeeze period
 { start: 5, end: Math.floor(barCount * 0.45), tightness: 0.25 },
 ],
 support: [97, 100],
 resistance: [104, 108],
 patterns: [
 { bar: Math.floor(barCount * 0.15), type: "doji" as const },
 { bar: Math.floor(barCount * 0.3), type: "doji" as const },
 { bar: Math.floor(barCount * 0.44), type: "doji" as const },
 { bar: Math.floor(barCount * 0.46), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.55), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.65), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.8), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.85), type: "hammer" as const },
 ],
 baseVolume: 65000,
 }),
};

// ── Pattern 7: Whipsaw ───────────────────────────────────────
// Multiple false breakouts in both directions — traps bulls and bears

const WHIPSAW: ArenaPatternConfig = {
 id: "whipsaw",
 name: "Whipsaw",
 description: "Multiple false breakouts trapping traders in both directions",
 getConfig: (_seed, barCount) => ({
 startPrice: 100,
 drift: 0.0005,
 volatility: 0.022,
 meanReversion: 0.07,
 target: 101,
 momentumBias: 0.48,
 support: [94, 97],
 resistance: [104, 107],
 patterns: [
 { bar: Math.floor(barCount * 0.1), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.15), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.22), type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.3), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.38), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.45), type: "shooting-star" as const },
 { bar: Math.floor(barCount * 0.52), type: "bearish-engulfing" as const },
 { bar: Math.floor(barCount * 0.6), type: "hammer" as const },
 { bar: Math.floor(barCount * 0.7), type: "doji" as const },
 { bar: Math.floor(barCount * 0.78), type: "bullish-engulfing" as const },
 { bar: Math.floor(barCount * 0.88), type: "bearish-engulfing" as const },
 ],
 baseVolume: 75000,
 }),
};

// ── Export all patterns ──────────────────────────────────────

export const ARENA_PATTERNS: ArenaPatternConfig[] = [
 BULL_RALLY,
 FLASH_CRASH,
 SIDEWAYS_CHOP,
 DOUBLE_TOP,
 BEAR_FLAG,
 BREAKOUT_RALLY,
 WHIPSAW,
];

export const ARENA_PATTERNS_BY_ID = Object.fromEntries(
 ARENA_PATTERNS.map((p) => [p.id, p]),
) as Record<string, ArenaPatternConfig>;

/**
 * Map arena type IDs to suitable patterns.
 * During match setup, one pattern is randomly selected from the suitable list.
 */
export const ARENA_TYPE_PATTERNS: Record<string, string[]> = {
 speed_trading: ["bull_rally", "flash_crash", "whipsaw", "breakout_rally", "sideways_chop"],
 trend_catching: ["bull_rally", "bear_flag", "breakout_rally"],
 risk_control: ["flash_crash", "bear_flag", "whipsaw"],
 reversal_hunter: ["double_top", "flash_crash", "sideways_chop", "whipsaw"],
 scalp_master: ["sideways_chop", "whipsaw", "double_top", "breakout_rally"],
};
