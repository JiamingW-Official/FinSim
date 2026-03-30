"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";
import { LEVEL_THRESHOLDS, getXPForNextLevel } from "@/types/game";
import { cn } from "@/lib/utils";

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── XP bar chart (last 14 days, seeded synthetic data) ──────────────────────
function XPBarChart({ totalXP }: { totalXP: number }) {
  const bars = useMemo(() => {
    const rand = mulberry32(totalXP ^ 0xdeadbeef);
    const result: { label: string; xp: number }[] = [];
    const now = new Date("2026-03-27");
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      // XP between 0 and ~200 per day, seeded
      const xp = Math.round(rand() * 180 + rand() * 40);
      result.push({ label, xp });
    }
    return result;
  }, [totalXP]);

  const maxXP = Math.max(...bars.map((b) => b.xp), 1);
  const BAR_H = 80;
  const thisWeek = bars.slice(-7).reduce((s, b) => s + b.xp, 0);
  const thisMonth = bars.reduce((s, b) => s + b.xp, 0); // 14-day proxy

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-card/50 p-2.5">
          <p className="text-[9px] text-muted-foreground">Total XP</p>
          <p className="text-sm font-black tabular-nums">{totalXP.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-2.5">
          <p className="text-[9px] text-muted-foreground">This Week</p>
          <p className="text-sm font-black tabular-nums">{thisWeek.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-2.5">
          <p className="text-[9px] text-muted-foreground">Last 14 Days</p>
          <p className="text-sm font-black tabular-nums">{thisMonth.toLocaleString()}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div
        className="flex items-end gap-0.5 px-1"
        style={{ height: BAR_H + 16 }}
        aria-label="XP per day (last 14 days)"
      >
        {bars.map((b, i) => {
          const heightPct = b.xp / maxXP;
          const barH = Math.max(heightPct * BAR_H, 2);
          const isToday = i === bars.length - 1;
          return (
            <div
              key={b.label}
              className="flex flex-1 flex-col items-center gap-0.5"
              title={`${b.label}: ${b.xp} XP`}
            >
              <div
                className={cn(
                  "w-full rounded-sm transition-all",
                  isToday ? "bg-primary" : "bg-primary/40",
                )}
                style={{ height: barH }}
              />
              {i % 2 === 0 && (
                <span className="text-[7px] text-muted-foreground tabular-nums">
                  {b.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Circular progress ring ───────────────────────────────────────────────────
function LevelRing({
  level,
  xp,
}: {
  level: number;
  xp: number;
}) {
  const xpForCurrent = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const xpForNext = getXPForNextLevel(level);
  const xpIntoLevel = xp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  const pct = Math.min((xpIntoLevel / Math.max(xpNeeded, 1)) * 100, 100);

  const R = 36;
  const STROKE = 5;
  const circumference = 2 * Math.PI * R;
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={88} height={88} viewBox="0 0 88 88" aria-label={`Level ${level} progress`}>
        {/* Track */}
        <circle
          cx={44}
          cy={44}
          r={R}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <circle
          cx={44}
          cy={44}
          r={R}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={0}
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        {/* Center text */}
        <text
          x={44}
          y={40}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="900"
          fill="hsl(var(--foreground))"
          fontFamily="system-ui"
        >
          {level}
        </text>
        <text
          x={44}
          y={55}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fill="hsl(var(--muted-foreground))"
          fontFamily="system-ui"
        >
          LEVEL
        </text>
      </svg>
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
        </p>
        <p className="text-[9px] text-muted-foreground/60">
          {(xpNeeded - xpIntoLevel).toLocaleString()} to next level
        </p>
      </div>
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export function XPHistory() {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);

  return (
    <div className="space-y-5">
      {/* Level ring + bar chart side by side */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-6">
          <LevelRing level={level} xp={xp} />
          <div className="flex-1 min-w-0">
            <p className="mb-3 text-xs font-bold text-muted-foreground">XP Earned (last 14 days)</p>
            <XPBarChart totalXP={xp} />
          </div>
        </div>
      </div>
    </div>
  );
}
