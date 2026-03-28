"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { EARNINGS_CALENDAR, type EarningsEvent } from "@/data/earnings-calendar";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed & 0x7fffffff;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function tickerSeed(ticker: string): number {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) {
    h = (h * 31 + ticker.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CallTime = "BMO" | "AMC" | "TBD";

interface CalendarEarningsEvent {
  ticker: string;
  companyName: string;
  date: string; // "YYYY-MM-DD"
  callTime: CallTime;
  epsEstimate: number;
  prevEPS: number;
  revenueEstimate: number; // billions
  prevRevenue: number; // billions
  beatHistory: ("beat" | "miss" | "in-line")[]; // last 4 quarters, newest first
  ivRank: number; // 0–100
  expectedMove: number; // % either direction
  analystRating: string;
  priceTarget: number;
}

// ─── Generate synthetic calendar for current month ───────────────────────────

const EARNINGS_TICKERS = [
  { ticker: "AAPL", companyName: "Apple Inc." },
  { ticker: "MSFT", companyName: "Microsoft Corp." },
  { ticker: "GOOG", companyName: "Alphabet Inc." },
  { ticker: "AMZN", companyName: "Amazon.com Inc." },
  { ticker: "NVDA", companyName: "NVIDIA Corp." },
  { ticker: "TSLA", companyName: "Tesla Inc." },
  { ticker: "META", companyName: "Meta Platforms Inc." },
  { ticker: "JPM", companyName: "JPMorgan Chase & Co." },
];

function generateCalendarEvents(year: number, month: number): CalendarEarningsEvent[] {
  const events: CalendarEarningsEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (const { ticker, companyName } of EARNINGS_TICKERS) {
    const seed = tickerSeed(ticker) ^ (year * 12 + month);
    const rand = seededRandom(seed);

    // Pick a weekday in the month
    let day = 3 + Math.floor(rand() * (daysInMonth - 6));
    // Adjust to nearest weekday
    const candidateDate = new Date(year, month, day);
    const weekday = candidateDate.getDay();
    if (weekday === 0) day += 1;
    else if (weekday === 6) day += 2;
    day = Math.min(day, daysInMonth);

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const callTime: CallTime = rand() > 0.55 ? "AMC" : rand() > 0.3 ? "BMO" : "TBD";

    const fund = FUNDAMENTALS[ticker];
    const baseEPS = fund?.epsEstimate ?? rand() * 3 + 0.5;
    const epsEstimate = parseFloat((baseEPS * (0.9 + rand() * 0.2)).toFixed(2));
    const prevEPS = parseFloat((epsEstimate * (0.85 + rand() * 0.3)).toFixed(2));
    const revenueEstimate = parseFloat((fund?.revenueEstimate ?? (rand() * 50 + 10)).toFixed(1));
    const prevRevenue = parseFloat((revenueEstimate * (0.9 + rand() * 0.2)).toFixed(1));

    // Beat history last 4 quarters
    const beatHistory: ("beat" | "miss" | "in-line")[] = Array.from({ length: 4 }, () => {
      const v = rand();
      return v > 0.65 ? "beat" : v > 0.2 ? "miss" : "in-line";
    });

    // IV Rank 30–85
    const ivRank = Math.round(30 + rand() * 55);
    // Expected move scales with IV rank: ~3–12%
    const expectedMove = parseFloat((2 + (ivRank / 100) * 10).toFixed(1));

    const rating = fund?.analystRating ?? "Hold";
    const priceTarget = fund?.priceTarget ?? Math.round(50 + rand() * 250);

    events.push({
      ticker,
      companyName,
      date: dateStr,
      callTime,
      epsEstimate,
      prevEPS,
      revenueEstimate,
      prevRevenue,
      beatHistory,
      ivRank,
      expectedMove,
      analystRating: rating,
      priceTarget,
    });
  }

  // Sort by date
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

// ─── Strategy suggestion ──────────────────────────────────────────────────────

function earningsPlayStrategy(event: CalendarEarningsEvent): {
  name: string;
  rationale: string;
  riskLabel: string;
  color: string;
} {
  const fund = FUNDAMENTALS[event.ticker];
  const sentiment = fund?.analystRating;
  const bullish = sentiment === "Strong Buy" || sentiment === "Buy";

  if (event.ivRank >= 65) {
    return {
      name: "Long Straddle",
      rationale: `High IV Rank (${event.ivRank}) prices in a ±${event.expectedMove}% move. Buy ATM call + put to profit from any large move.`,
      riskLabel: "Premium risk",
      color: "text-purple-500 bg-purple-500/10",
    };
  }
  if (bullish && event.beatHistory.filter((h) => h === "beat").length >= 3) {
    return {
      name: "Bull Call Spread",
      rationale: `${event.ticker} beat estimates in ${event.beatHistory.filter((h) => h === "beat").length}/4 recent quarters with ${sentiment} consensus. Buy ATM call, sell OTM call.`,
      riskLabel: "Defined risk",
      color: "text-emerald-500 bg-emerald-500/10",
    };
  }
  if (!bullish && sentiment !== "N/A") {
    return {
      name: "Bear Put Spread",
      rationale: `${sentiment} analyst consensus + lower beat rate. Buy ATM put, sell OTM put to cap cost.`,
      riskLabel: "Defined risk",
      color: "text-red-500 bg-red-500/10",
    };
  }
  return {
    name: "Iron Condor",
    rationale: `Neutral setup — sell OTM call + put spreads to collect premium if stock stays within ±${(event.expectedMove * 0.7).toFixed(1)}% range.`,
    riskLabel: "Defined risk",
    color: "text-amber-500 bg-amber-500/10",
  };
}

// ─── Beat/Miss squares ────────────────────────────────────────────────────────

function BeatSquares({ history }: { history: CalendarEarningsEvent["beatHistory"] }) {
  return (
    <div className="flex gap-0.5">
      {history.map((result, i) => (
        <div
          key={i}
          title={result}
          className={cn(
            "w-3 h-3 rounded-sm",
            result === "beat"
              ? "bg-emerald-500"
              : result === "miss"
                ? "bg-red-500"
                : "bg-amber-400",
          )}
        />
      ))}
    </div>
  );
}

// ─── IV Rank bar ──────────────────────────────────────────────────────────────

function IVRankBar({ ivRank }: { ivRank: number }) {
  const color =
    ivRank >= 65
      ? "bg-red-500"
      : ivRank >= 40
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${ivRank}%` }}
        />
      </div>
      <span className="font-mono tabular-nums text-[10px] w-6 text-right">{ivRank}</span>
    </div>
  );
}

// ─── Analyst Rating chip ──────────────────────────────────────────────────────

function RatingChip({ rating }: { rating: string }) {
  const colors: Record<string, string> = {
    "Strong Buy": "bg-emerald-500/15 text-emerald-500",
    Buy: "bg-emerald-500/10 text-emerald-400",
    Hold: "bg-amber-500/10 text-amber-500",
    Sell: "bg-red-500/10 text-red-500",
    "Strong Sell": "bg-red-500/15 text-red-500",
    "N/A": "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", colors[rating] ?? colors["N/A"])}>
      {rating}
    </span>
  );
}

// ─── Upcoming Earnings Strip ──────────────────────────────────────────────────

function UpcomingStrip({
  events,
  today,
  onSelect,
}: {
  events: CalendarEarningsEvent[];
  today: string;
  onSelect: (ticker: string) => void;
}) {
  const next5 = events.slice(0, 5);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
      {next5.map((ev) => {
        const isToday = ev.date === today;
        const d = new Date(ev.date + "T12:00:00Z");
        const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return (
          <button
            key={ev.ticker}
            onClick={() => onSelect(ev.ticker)}
            className={cn(
              "shrink-0 rounded-lg border p-3 text-left space-y-1 min-w-[140px] hover:bg-muted/30 transition-colors",
              isToday ? "border-primary bg-primary/5" : "bg-card",
            )}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-xs font-semibold">{ev.ticker}</span>
              {isToday && (
                <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                  TODAY
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{ev.companyName}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
              <span
                className={cn(
                  "text-[9px] font-medium px-1 py-0.5 rounded",
                  ev.callTime === "BMO"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : ev.callTime === "AMC"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {ev.callTime}
              </span>
            </div>
            <p className="text-[10px] font-mono tabular-nums">
              EPS est. <span className="font-semibold">${ev.epsEstimate.toFixed(2)}</span>
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─── Monthly Calendar Grid ────────────────────────────────────────────────────

interface DayCell {
  day: number;
  isCurrentMonth: boolean;
  dateStr: string;
  events: CalendarEarningsEvent[];
}

function buildCalendarGrid(year: number, month: number, events: CalendarEarningsEvent[]): DayCell[][] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const eventByDate = new Map<string, CalendarEarningsEvent[]>();
  for (const ev of events) {
    const arr = eventByDate.get(ev.date) ?? [];
    arr.push(ev);
    eventByDate.set(ev.date, arr);
  }

  const cells: DayCell[] = [];

  // Previous month padding
  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrevMonth - firstDay + 1 + i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, isCurrentMonth: false, dateStr, events: [] });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      day: d,
      isCurrentMonth: true,
      dateStr,
      events: eventByDate.get(dateStr) ?? [],
    });
  }

  // Next month padding to fill 6 rows
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    cells.push({ day: i, isCurrentMonth: false, dateStr, events: [] });
  }

  // Chunk into weeks
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function CalendarGrid({
  year,
  month,
  events,
  today,
  selectedTicker,
  onSelectTicker,
}: {
  year: number;
  month: number;
  events: CalendarEarningsEvent[];
  today: string;
  selectedTicker: string | null;
  onSelectTicker: (ticker: string) => void;
}) {
  const weeks = useMemo(() => buildCalendarGrid(year, month, events), [year, month, events]);
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-border/30">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border/20 last:border-0">
          {week.map((cell) => {
            const isToday = cell.dateStr === today;
            const isWeekend = new Date(cell.dateStr + "T12:00:00Z").getDay() % 6 === 0;
            return (
              <div
                key={cell.dateStr}
                className={cn(
                  "min-h-[72px] border-r border-border/20 last:border-0 p-1.5 space-y-0.5",
                  !cell.isCurrentMonth && "bg-muted/20",
                  isWeekend && cell.isCurrentMonth && "bg-muted/10",
                )}
              >
                {/* Day number */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : cell.isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/40",
                  )}
                >
                  {cell.day}
                </div>

                {/* Earnings chips */}
                {cell.events.map((ev) => (
                  <button
                    key={ev.ticker}
                    onClick={() => onSelectTicker(ev.ticker)}
                    className={cn(
                      "w-full text-left rounded px-1 py-0.5 text-[9px] font-semibold font-mono transition-colors truncate",
                      ev.callTime === "BMO"
                        ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                        : ev.callTime === "AMC"
                          ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25"
                          : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25",
                      selectedTicker === ev.ticker && "ring-1 ring-primary",
                    )}
                  >
                    {ev.ticker}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-2 border-t border-border/20 bg-muted/10">
        <span className="text-[9px] text-muted-foreground">Key:</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40" />
          <span className="text-[9px] text-muted-foreground">BMO</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/40" />
          <span className="text-[9px] text-muted-foreground">AMC</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/40" />
          <span className="text-[9px] text-muted-foreground">TBD</span>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function EarningsDetailPanel({
  event,
  onClose,
}: {
  event: CalendarEarningsEvent;
  onClose: () => void;
}) {
  const strategy = earningsPlayStrategy(event);
  const d = new Date(event.date + "T12:00:00Z");
  const dateLabel = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const beatCount = event.beatHistory.filter((h) => h === "beat").length;
  const beatRate = Math.round((beatCount / event.beatHistory.length) * 100);

  const epsChange = event.prevEPS !== 0
    ? ((event.epsEstimate - event.prevEPS) / Math.abs(event.prevEPS)) * 100
    : 0;
  const revChange = event.prevRevenue !== 0
    ? ((event.revenueEstimate - event.prevRevenue) / event.prevRevenue) * 100
    : 0;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          {/* Logo placeholder */}
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-bold font-mono">{event.ticker.slice(0, 2)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{event.ticker}</span>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded",
                  event.callTime === "BMO"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : event.callTime === "AMC"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {event.callTime === "BMO" ? "Before Open" : event.callTime === "AMC" ? "After Close" : "TBD"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">{event.companyName}</p>
            <p className="text-[10px] text-muted-foreground">{dateLabel}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          aria-label="Close panel"
        >
          &times;
        </button>
      </div>

      {/* EPS estimate */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          EPS Estimates
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/40 p-2.5">
            <p className="text-[9px] text-muted-foreground">Expected</p>
            <p className="font-mono tabular-nums text-sm font-bold">${event.epsEstimate.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2.5">
            <p className="text-[9px] text-muted-foreground">Previous</p>
            <div className="flex items-center gap-1.5">
              <p className="font-mono tabular-nums text-sm font-bold">${event.prevEPS.toFixed(2)}</p>
              <span
                className={cn(
                  "text-[9px] font-medium",
                  epsChange >= 0 ? "text-emerald-500" : "text-red-500",
                )}
              >
                {epsChange >= 0 ? "+" : ""}{epsChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue estimate */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Revenue Estimates
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/40 p-2.5">
            <p className="text-[9px] text-muted-foreground">Expected</p>
            <p className="font-mono tabular-nums text-sm font-bold">${event.revenueEstimate.toFixed(1)}B</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2.5">
            <p className="text-[9px] text-muted-foreground">Previous</p>
            <div className="flex items-center gap-1.5">
              <p className="font-mono tabular-nums text-sm font-bold">${event.prevRevenue.toFixed(1)}B</p>
              <span
                className={cn(
                  "text-[9px] font-medium",
                  revChange >= 0 ? "text-emerald-500" : "text-red-500",
                )}
              >
                {revChange >= 0 ? "+" : ""}{revChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Beat/Miss history */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Beat/Miss History (Last 4Q)
          </p>
          <span className={cn(
            "text-[10px] font-semibold",
            beatRate >= 75 ? "text-emerald-500" : beatRate >= 50 ? "text-amber-500" : "text-red-500",
          )}>
            {beatRate}% beat rate
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BeatSquares history={event.beatHistory} />
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
              Beat
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />
              Miss
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
              In-line
            </span>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">Newest first (left to right)</p>
      </div>

      {/* IV Rank + Expected Move */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Options Pricing
        </p>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">IV Rank</span>
              <span className={cn(
                "text-[10px] font-medium",
                event.ivRank >= 65 ? "text-red-500" : event.ivRank >= 40 ? "text-amber-500" : "text-emerald-500",
              )}>
                {event.ivRank >= 65 ? "Elevated" : event.ivRank >= 40 ? "Moderate" : "Low"}
              </span>
            </div>
            <IVRankBar ivRank={event.ivRank} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
            <span className="text-[10px] text-muted-foreground">Expected Move</span>
            <span className="font-mono tabular-nums text-sm font-bold">
              ±{event.expectedMove}%
            </span>
          </div>
        </div>
      </div>

      {/* Analyst consensus */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Analyst Consensus
        </p>
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <RatingChip rating={event.analystRating} />
          {event.priceTarget > 0 && (
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground">Price Target</p>
              <p className="font-mono tabular-nums text-xs font-semibold">${event.priceTarget}</p>
            </div>
          )}
        </div>
      </div>

      {/* Earnings Play Idea */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Earnings Play Idea
        </p>
        <div className="rounded-lg border bg-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", strategy.color)}>
              {strategy.name}
            </span>
            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {strategy.riskLabel}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{strategy.rationale}</p>
          <p className="text-[9px] text-muted-foreground/60 italic">
            Educational only — not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Earnings Play Ideas Section ──────────────────────────────────────────────

function EarningsPlayIdeas({ events }: { events: CalendarEarningsEvent[] }) {
  const next4 = events.slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Earnings Play Ideas</h3>
        <span className="text-[10px] text-muted-foreground">Next {next4.length} events</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {next4.map((ev) => {
          const strategy = earningsPlayStrategy(ev);
          const d = new Date(ev.date + "T12:00:00Z");
          const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <div key={ev.ticker} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold">{ev.ticker}</span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">{dateLabel}</span>
                </div>
                <span
                  className={cn(
                    "text-[9px] font-medium px-1.5 py-0.5 rounded",
                    ev.callTime === "BMO"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : ev.callTime === "AMC"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {ev.callTime}
                </span>
              </div>
              <div>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", strategy.color)}>
                  {strategy.name}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
                {strategy.rationale}
              </p>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/30 pt-2">
                <span>IV Rank: <span className="font-semibold text-foreground">{ev.ivRank}</span></span>
                <span>Exp. Move: <span className="font-semibold text-foreground">±{ev.expectedMove}%</span></span>
                <span className="bg-muted px-1 py-0.5 rounded">{strategy.riskLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EarningsCalendar() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const events = useMemo(
    () => generateCalendarEvents(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const selectedEvent = selectedTicker ? events.find((e) => e.ticker === selectedTicker) ?? null : null;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedTicker(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedTicker(null);
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Merge with static EARNINGS_CALENDAR data to enrich detail panel if available
  const earningsMap = useMemo(() => {
    const m = new Map<string, EarningsEvent>();
    for (const ev of EARNINGS_CALENDAR) {
      m.set(ev.ticker, ev);
    }
    return m;
  }, []);

  // Enrich events with static data where available (EPS history)
  const enrichedEvents = useMemo(() => {
    return events.map((ev) => {
      const staticData = earningsMap.get(ev.ticker);
      if (!staticData) return ev;
      return {
        ...ev,
        epsEstimate: staticData.epsEstimate,
        prevEPS: staticData.previousEPS,
        revenueEstimate: staticData.revenueEstimate,
        prevRevenue: staticData.previousRevenue,
        callTime: staticData.time === "BMO" ? ("BMO" as CallTime) : ("AMC" as CallTime),
        beatHistory: staticData.surpriseHistory.map((h) =>
          h.epsSurprise > 2 ? ("beat" as const) : h.epsSurprise < -2 ? ("miss" as const) : ("in-line" as const)
        ),
      };
    });
  }, [events, earningsMap]);

  const enrichedSelectedEvent = selectedTicker
    ? enrichedEvents.find((e) => e.ticker === selectedTicker) ?? null
    : null;

  return (
    <div className="space-y-4">
      {/* Upcoming Strip */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Upcoming Earnings
        </p>
        <UpcomingStrip
          events={enrichedEvents}
          today={todayStr}
          onSelect={(t) => setSelectedTicker(t === selectedTicker ? null : t)}
        />
      </div>

      {/* Calendar + Detail Panel */}
      <div className={cn("grid gap-4", selectedTicker ? "grid-cols-1 xl:grid-cols-[1fr_320px]" : "grid-cols-1")}>
        {/* Left: Calendar */}
        <div className="space-y-3 min-w-0">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors font-medium"
            >
              &larr; Prev
            </button>
            <h2 className="text-sm font-semibold">{monthLabel}</h2>
            <button
              onClick={nextMonth}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors font-medium"
            >
              Next &rarr;
            </button>
          </div>

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            events={enrichedEvents}
            today={todayStr}
            selectedTicker={selectedTicker}
            onSelectTicker={(t) => setSelectedTicker(t === selectedTicker ? null : t)}
          />
        </div>

        {/* Right: Detail Panel (slides in) */}
        {enrichedSelectedEvent && (
          <div className="xl:sticky xl:top-0 xl:self-start">
            <EarningsDetailPanel
              event={enrichedSelectedEvent}
              onClose={() => setSelectedTicker(null)}
            />
          </div>
        )}
      </div>

      {/* Earnings Play Ideas */}
      <EarningsPlayIdeas events={enrichedEvents} />
    </div>
  );
}
