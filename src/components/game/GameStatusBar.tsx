"use client";

import { useClockStore } from "@/stores/clock-store";
import { useMarketCountdown } from "@/hooks/useMarketCountdown";
import { cn } from "@/lib/utils";

const SESSION_STYLES: Record<string, { label: string; color: string; dot: string }> = {
  "pre-market":  { label: "Pre-Market",  color: "text-amber-400/80",       dot: "bg-amber-400" },
  open:          { label: "Market Open", color: "text-emerald-400/90",      dot: "bg-emerald-400" },
  "after-hours": { label: "After Hours", color: "text-sky-400/70",          dot: "bg-sky-400" },
  closed:        { label: "Closed",      color: "text-muted-foreground/40", dot: "bg-muted-foreground/30" },
};

function formatGameDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).toUpperCase();
}

export function GameStatusBar() {
  const gameDate        = useClockStore((s) => s.gameDate);
  const gameTimeDisplay = useClockStore((s) => s.gameTimeDisplay);
  const marketSession   = useClockStore((s) => s.marketSession);
  const tradingDayIndex = useClockStore((s) => s.tradingDayIndex);
  const isSeasonOver    = useClockStore((s) => s.isSeasonOver);

  const countdown = useMarketCountdown();
  const session   = SESSION_STYLES[marketSession] ?? SESSION_STYLES.closed;

  return (
    <div className="h-9 shrink-0 border-t border-border/30 bg-background flex items-center px-3">

      {/* ── LEFT: LIVE pill ── */}
      <div className="flex items-center gap-2 w-[88px] shrink-0">
        {isSeasonOver ? (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-rose-400/80">
            ENDED
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400" />
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-400/90">LIVE</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/30">6×</span>
          </>
        )}
      </div>

      <span className="h-3 w-px bg-border/40 mx-2 shrink-0" />

      {/* ── CENTER: date · time (the most prominent element) ── */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground/40">
          {formatGameDate(gameDate)}
        </span>
        <span className="text-border/60">·</span>
        <span className="font-mono text-[14px] font-bold tabular-nums text-foreground/85 tracking-tight">
          {gameTimeDisplay}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/25 mt-px">ET</span>
      </div>

      <span className="h-3 w-px bg-border/40 mx-2 shrink-0" />

      {/* ── RIGHT: countdown + day + session ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Countdown chip — only when season active and we have a value */}
        {!isSeasonOver && countdown.display && countdown.display !== "--:--" && (
          <div className={cn(
            "flex items-center gap-1.5 rounded px-2 py-0.5",
            "font-mono text-[10px] tabular-nums ring-1 ring-inset",
            countdown.urgent
              ? "bg-amber-400/10 text-amber-400/90 ring-amber-400/25 animate-pulse"
              : countdown.target === "close"
                ? "bg-rose-500/[0.07] text-rose-400/65 ring-rose-500/10"
                : "bg-emerald-500/[0.07] text-emerald-400/60 ring-emerald-500/10",
          )}>
            <span className="opacity-60">{countdown.label}</span>
            <span className="font-semibold">{countdown.display}</span>
          </div>
        )}

        {/* Day counter */}
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/35 tabular-nums">
          Day {tradingDayIndex + 1}
        </span>

        {/* Session badge */}
        {isSeasonOver ? (
          <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ring-1 ring-inset ring-current/20 text-rose-400/70">
            Final
          </span>
        ) : (
          <span className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5",
            "font-mono text-[10px] font-medium ring-1 ring-inset ring-current/20",
            session.color,
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", session.dot,
              marketSession === "open" && "animate-pulse")} />
            {session.label}
          </span>
        )}
      </div>
    </div>
  );
}
