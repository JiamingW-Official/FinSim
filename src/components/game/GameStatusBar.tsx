"use client";

import { useClockStore } from "@/stores/clock-store";
import { cn } from "@/lib/utils";

const SESSION_LABELS: Record<string, { label: string; color: string }> = {
  "pre-market": { label: "Pre-Market", color: "text-amber-400/80" },
  open: { label: "Market Open", color: "text-emerald-400/80" },
  "after-hours": { label: "After Hours", color: "text-sky-400/70" },
  closed: { label: "Market Closed", color: "text-muted-foreground/40" },
};

function formatGameDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function GameStatusBar() {
  // Read-only: clock is driven exclusively by useGameClock (setInterval 100ms).
  // This component NEVER calls tick() or setInterval.
  const gameDate = useClockStore((s) => s.gameDate);
  const gameTimeDisplay = useClockStore((s) => s.gameTimeDisplay);
  const marketSession = useClockStore((s) => s.marketSession);
  const tradingDayIndex = useClockStore((s) => s.tradingDayIndex);
  const isSeasonOver = useClockStore((s) => s.isSeasonOver);

  const session = SESSION_LABELS[marketSession] ?? SESSION_LABELS.closed;
  const dayLabel = `Day ${tradingDayIndex + 1}`;

  return (
    <div className="h-9 shrink-0 border-t border-border/30 bg-background flex items-center justify-between px-3">
      {/* Left: LIVE badge + speed, or SEASON ENDED */}
      <div className="flex items-center gap-2">
        {isSeasonOver ? (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-rose-400/80">
            SEASON ENDED
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-400/90">
                LIVE
              </span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">6&times; SPEED</span>
          </>
        )}
      </div>

      {/* Center: game date + time */}
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
        <span>{formatGameDate(gameDate)}</span>
        <span className="text-muted-foreground/25">·</span>
        <span className="tabular-nums text-foreground/70">{gameTimeDisplay}</span>
      </div>

      {/* Right: day counter + session pill */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">{dayLabel}</span>
        {isSeasonOver ? (
          <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ring-1 ring-inset ring-current/20 text-rose-400/70">
            Final
          </span>
        ) : (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ring-1 ring-inset ring-current/20",
              session.color,
            )}
          >
            {session.label}
          </span>
        )}
      </div>
    </div>
  );
}
