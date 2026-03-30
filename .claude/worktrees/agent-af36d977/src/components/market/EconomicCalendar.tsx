"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Importance = "high" | "medium" | "low";

interface EconomicEvent {
  name: string;
  dayIndex: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  time: string;
  importance: Importance;
  expected: string;
  previous: string;
  actual: string | null; // null = not released yet
  affectedAssets: string[];
}

/* ------------------------------------------------------------------ */
/*  Static event data                                                   */
/* ------------------------------------------------------------------ */

const EVENTS: EconomicEvent[] = [
  {
    name: "Fed FOMC Meeting",
    dayIndex: 1,
    time: "2:00 PM ET",
    importance: "high",
    expected: "Unchanged",
    previous: "5.25%",
    actual: null,
    affectedAssets: ["USD", "Bonds", "Equities"],
  },
  {
    name: "CPI Release",
    dayIndex: 1,
    time: "8:30 AM ET",
    importance: "high",
    expected: "3.2%",
    previous: "3.4%",
    actual: null,
    affectedAssets: ["USD", "Gold", "TIPS"],
  },
  {
    name: "NFP Jobs Report",
    dayIndex: 4,
    time: "8:30 AM ET",
    importance: "high",
    expected: "185K",
    previous: "199K",
    actual: null,
    affectedAssets: ["USD", "Equities", "Bonds"],
  },
  {
    name: "GDP QoQ (Advance)",
    dayIndex: 2,
    time: "8:30 AM ET",
    importance: "medium",
    expected: "2.1%",
    previous: "2.4%",
    actual: null,
    affectedAssets: ["USD", "Equities"],
  },
  {
    name: "Retail Sales MoM",
    dayIndex: 0,
    time: "8:30 AM ET",
    importance: "medium",
    expected: "0.3%",
    previous: "0.6%",
    actual: null,
    affectedAssets: ["Consumer Stocks", "USD"],
  },
  {
    name: "PPI Final Demand",
    dayIndex: 2,
    time: "8:30 AM ET",
    importance: "medium",
    expected: "0.2%",
    previous: "0.3%",
    actual: null,
    affectedAssets: ["USD", "Commodities"],
  },
  {
    name: "Consumer Confidence",
    dayIndex: 1,
    time: "10:00 AM ET",
    importance: "low",
    expected: "104.5",
    previous: "102.9",
    actual: null,
    affectedAssets: ["Consumer Stocks"],
  },
  {
    name: "Initial Jobless Claims",
    dayIndex: 3,
    time: "8:30 AM ET",
    importance: "medium",
    expected: "215K",
    previous: "218K",
    actual: null,
    affectedAssets: ["USD", "Equities"],
  },
  {
    name: "ISM Manufacturing PMI",
    dayIndex: 0,
    time: "10:00 AM ET",
    importance: "medium",
    expected: "49.8",
    previous: "49.1",
    actual: null,
    affectedAssets: ["Industrials", "USD"],
  },
  {
    name: "Housing Starts",
    dayIndex: 3,
    time: "8:30 AM ET",
    importance: "low",
    expected: "1.43M",
    previous: "1.36M",
    actual: null,
    affectedAssets: ["Homebuilders", "REITs"],
  },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday;
}

function formatDate(monday: Date, dayOffset: number): string {
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayOffset);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTodayDayIndex(): number {
  const dow = new Date().getDay(); // 0=Sun,1=Mon,...,5=Sat
  if (dow === 0 || dow === 6) return -1;
  return dow - 1; // 0=Mon
}

/* ------------------------------------------------------------------ */
/*  Importance styles                                                   */
/* ------------------------------------------------------------------ */

const IMPORTANCE_STYLES: Record<Importance, { badge: string; card: string; dot: string }> = {
  high: {
    badge: "bg-red-500/15 text-red-500 border border-red-500/20",
    card: "border-red-500/20 bg-red-500/5",
    dot: "bg-red-500",
  },
  medium: {
    badge: "bg-amber-500/15 text-amber-500 border border-amber-500/20",
    card: "border-amber-500/20 bg-amber-500/5",
    dot: "bg-amber-500",
  },
  low: {
    badge: "bg-muted text-muted-foreground border border-border",
    card: "border-border bg-muted/30",
    dot: "bg-muted-foreground/50",
  },
};

/* ------------------------------------------------------------------ */
/*  Event card                                                          */
/* ------------------------------------------------------------------ */

function EventCard({ event }: { event: EconomicEvent }) {
  const styles = IMPORTANCE_STYLES[event.importance];
  return (
    <div className={cn("rounded-md border p-2 space-y-1.5", styles.card)}>
      {/* Name + importance */}
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-medium leading-tight">{event.name}</span>
        <span
          className={cn(
            "text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0",
            styles.badge,
          )}
        >
          {event.importance}
        </span>
      </div>

      {/* Time */}
      <p className="text-[10px] text-muted-foreground">{event.time}</p>

      {/* Expected / Previous */}
      <div className="flex gap-3 text-[10px]">
        <span className="text-muted-foreground">
          Exp: <span className="font-mono font-medium text-foreground">{event.expected}</span>
        </span>
        <span className="text-muted-foreground">
          Prev: <span className="font-mono font-medium text-foreground">{event.previous}</span>
        </span>
      </div>

      {/* Actual (if released) */}
      {event.actual !== null && (
        <div className="text-[10px]">
          Actual:{" "}
          <span className="font-mono font-semibold text-foreground">{event.actual}</span>
        </div>
      )}

      {/* Affected assets */}
      <div className="flex flex-wrap gap-1">
        {event.affectedAssets.map((asset) => (
          <span
            key={asset}
            className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
          >
            {asset}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function EconomicCalendar() {
  const monday = useMemo(() => getMondayOfCurrentWeek(), []);
  const todayIndex = getTodayDayIndex();

  const eventsByDay = useMemo(() => {
    const map: EconomicEvent[][] = [[], [], [], [], []];
    for (const ev of EVENTS) {
      if (ev.dayIndex >= 0 && ev.dayIndex < 5) {
        map[ev.dayIndex].push(ev);
      }
    }
    return map;
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Economic Calendar</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Week of {formatDate(monday, 0)} &ndash; {formatDate(monday, 4)}
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" />
            Low
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-5 gap-2">
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIndex;
          return (
            <div key={label} className="flex flex-col gap-1.5 min-w-0">
              {/* Day header */}
              <div
                className={cn(
                  "flex flex-col items-center py-1 rounded-md",
                  isToday
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "text-[9px]",
                    isToday ? "text-primary/80" : "text-muted-foreground/60",
                  )}
                >
                  {formatDate(monday, i)}
                </span>
              </div>

              {/* Events */}
              {eventsByDay[i].length === 0 ? (
                <div className="rounded-md border border-dashed border-border/50 p-2 text-center text-[10px] text-muted-foreground/40">
                  No events
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {eventsByDay[i].map((ev) => (
                    <EventCard key={ev.name} event={ev} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
