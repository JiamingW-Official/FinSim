"use client";

import { useClockStore } from "@/stores/clock-store";
import type { MarketSession } from "@/services/game-clock/engine";

const SESSION_CONFIG: Record<
  MarketSession,
  { label: string; className: string }
> = {
  "pre-market": {
    label: "PRE-MKT",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  open: {
    label: "OPEN",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  "after-hours": {
    label: "AFTER-HRS",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  closed: {
    label: "CLOSED",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatGameDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00Z");
  const day = DAY_NAMES[d.getUTCDay()];
  const month = MONTH_NAMES[d.getUTCMonth()];
  const date = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${day}, ${month} ${date} ${year}`;
}

export function GameClockDisplay() {
  const gameDate = useClockStore((s) => s.gameDate);
  const gameTimeDisplay = useClockStore((s) => s.gameTimeDisplay);
  const marketSession = useClockStore((s) => s.marketSession);
  const tradingDayIndex = useClockStore((s) => s.tradingDayIndex);
  const totalTradingDays = useClockStore((s) => s.totalTradingDays);
  const seasonProgress = useClockStore((s) => s.seasonProgress);
  const seasonStartRealMs = useClockStore((s) => s.seasonStartRealMs);

  if (seasonStartRealMs === null) return null;

  const session = SESSION_CONFIG[marketSession];

  return (
    <div className="flex items-center gap-3">
      {/* Date + Time */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
          {formatGameDate(gameDate)}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums tracking-wider text-foreground">
          {gameTimeDisplay}
        </span>
      </div>

      {/* Session Badge */}
      <span
        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest ${session.className}`}
      >
        {session.label}
      </span>

      {/* Day Counter */}
      <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
        DAY {tradingDayIndex + 1}
        <span className="text-muted-foreground/50">
          {" "}
          / {totalTradingDays}
        </span>
      </span>

      {/* Season Progress Bar */}
      <div className="relative h-1 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/60 transition-all duration-300"
          style={{ width: `${seasonProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
