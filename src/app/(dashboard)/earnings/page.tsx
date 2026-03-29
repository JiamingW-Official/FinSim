"use client";

import { useState, useMemo } from "react";
import { Calendar, TrendingUp, Star, BookOpen, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EarningsDeepDive from "@/components/earnings/EarningsDeepDive";

// ── mulberry32 seeded PRNG (seed=7654) ────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(7654);

// ── Types ─────────────────────────────────────────────────────────────────────

interface UpcomingEarning {
  ticker: string;
  company: string;
  date: string;
  day: string;
  time: "BMO" | "AMC";
  epsEstimate: number;
  lastEPS: number;
  whisperEPS: number;
  impliedMove: number;
  beatRate: number; // 0-100%
  category: "large-cap" | "high-vol" | "beat-history";
}

interface CalendarCell {
  date: string;
  day: number;
  events: { ticker: string; category: "large-cap" | "high-vol" | "beat-history" }[];
}

interface EarningsHistoryRow {
  quarter: string;
  expectedEPS: number;
  actualEPS: number;
  surprisePct: number;
  revenue: number; // $B
  reaction: number; // 1-day %
}

interface AnalystRatingRow {
  ticker: string;
  company: string;
  consensus: "Strong Buy" | "Buy" | "Hold" | "Sell";
  analysts: number;
  priceTarget: number;
  currentPrice: number;
  upsidePct: number;
  lastChange: string;
  buyCount: number;
  holdCount: number;
  sellCount: number;
}

interface RatingChange {
  date: string;
  firm: string;
  ticker: string;
  oldRating: string;
  newRating: string;
  oldTarget: number;
  newTarget: number;
}

interface EarningsStrategy {
  name: string;
  description: string;
  setup: string;
  winRate: number;
  riskReward: string;
  bestFor: string;
  riskWarning: string;
}

// ── Ticker data ───────────────────────────────────────────────────────────────

const TICKERS = [
  { ticker: "AAPL", company: "Apple Inc.", price: 227.5 },
  { ticker: "MSFT", company: "Microsoft Corp.", price: 418.3 },
  { ticker: "GOOGL", company: "Alphabet Inc.", price: 176.2 },
  { ticker: "AMZN", company: "Amazon.com Inc.", price: 203.4 },
  { ticker: "NVDA", company: "NVIDIA Corp.", price: 875.6 },
  { ticker: "META", company: "Meta Platforms Inc.", price: 564.1 },
  { ticker: "TSLA", company: "Tesla Inc.", price: 248.9 },
  { ticker: "JPM", company: "JPMorgan Chase & Co.", price: 198.7 },
  { ticker: "JNJ", company: "Johnson & Johnson", price: 147.3 },
  { ticker: "XOM", company: "Exxon Mobil Corp.", price: 112.8 },
];

// ── Pre-generate all seeded data ───────────────────────────────────────────────

function generateUpcomingEarnings(): UpcomingEarning[] {
  const localRng = mulberry32(7654);
  const days = ["Mon Mar 30", "Tue Apr 1", "Wed Apr 2", "Thu Apr 3", "Fri Apr 4"];
  const items: UpcomingEarning[] = [
    {
      ticker: "JNJ",
      company: "Johnson & Johnson",
      date: "2026-03-30",
      day: days[0],
      time: "BMO",
      epsEstimate: 2.57,
      lastEPS: 2.49,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "large-cap",
    },
    {
      ticker: "XOM",
      company: "Exxon Mobil Corp.",
      date: "2026-03-30",
      day: days[0],
      time: "BMO",
      epsEstimate: 1.83,
      lastEPS: 1.91,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "large-cap",
    },
    {
      ticker: "JPM",
      company: "JPMorgan Chase & Co.",
      date: "2026-04-01",
      day: days[1],
      time: "BMO",
      epsEstimate: 4.61,
      lastEPS: 4.44,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "beat-history",
    },
    {
      ticker: "MSFT",
      company: "Microsoft Corp.",
      date: "2026-04-02",
      day: days[2],
      time: "AMC",
      epsEstimate: 3.21,
      lastEPS: 3.04,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "large-cap",
    },
    {
      ticker: "NVDA",
      company: "NVIDIA Corp.",
      date: "2026-04-02",
      day: days[2],
      time: "AMC",
      epsEstimate: 0.88,
      lastEPS: 0.76,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "high-vol",
    },
    {
      ticker: "META",
      company: "Meta Platforms Inc.",
      date: "2026-04-03",
      day: days[3],
      time: "AMC",
      epsEstimate: 5.47,
      lastEPS: 5.16,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "beat-history",
    },
    {
      ticker: "TSLA",
      company: "Tesla Inc.",
      date: "2026-04-03",
      day: days[3],
      time: "AMC",
      epsEstimate: 0.62,
      lastEPS: 0.58,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "high-vol",
    },
    {
      ticker: "AAPL",
      company: "Apple Inc.",
      date: "2026-04-04",
      day: days[4],
      time: "AMC",
      epsEstimate: 1.58,
      lastEPS: 1.53,
      whisperEPS: 0,
      impliedMove: 0,
      beatRate: 0,
      category: "large-cap",
    },
  ];
  return items.map((item) => ({
    ...item,
    whisperEPS: Math.round((item.epsEstimate * (1 + (localRng() * 0.04 + 0.01))) * 100) / 100,
    impliedMove: Math.round((localRng() * 8 + 3) * 10) / 10,
    beatRate: Math.round(localRng() * 40 + 55),
  }));
}

function generateCalendarData(): { march: CalendarCell[]; april: CalendarCell[] } {
  const localRng = mulberry32(7654 + 1);
  const allTickers = TICKERS.map((t) => t.ticker);

  function buildMonth(year: number, month: number): CalendarCell[] {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: CalendarCell[] = [];

    // padding
    for (let i = 0; i < firstDay; i++) {
      cells.push({ date: "", day: 0, events: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month - 1, d).getDay();
      const isWeekend = dow === 0 || dow === 6;
      const events: { ticker: string; category: "large-cap" | "high-vol" | "beat-history" }[] = [];
      if (!isWeekend && localRng() > 0.6) {
        const count = Math.floor(localRng() * 3) + 1;
        const shuffled = [...allTickers].sort(() => localRng() - 0.5);
        for (let k = 0; k < Math.min(count, shuffled.length); k++) {
          const cats: ("large-cap" | "high-vol" | "beat-history")[] = ["large-cap", "high-vol", "beat-history"];
          events.push({ ticker: shuffled[k], category: cats[Math.floor(localRng() * 3)] });
        }
      }
      cells.push({
        date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        events,
      });
    }
    return cells;
  }

  return {
    march: buildMonth(2026, 3),
    april: buildMonth(2026, 4),
  };
}

function generateEarningsHistory(ticker: string): EarningsHistoryRow[] {
  let seed = 7654;
  for (let i = 0; i < ticker.length; i++) seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
  const localRng = mulberry32(Math.abs(seed));

  const quarters = ["Q3 2024", "Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"];
  return quarters.map((q) => {
    const expectedEPS = Math.round((localRng() * 3 + 0.5) * 100) / 100;
    const surprisePct = (localRng() - 0.3) * 25;
    const actualEPS = Math.round(expectedEPS * (1 + surprisePct / 100) * 100) / 100;
    const revenue = Math.round((localRng() * 80 + 10) * 10) / 10;
    const reaction = Math.round((surprisePct * 0.4 + (localRng() - 0.5) * 8) * 10) / 10;
    return { quarter: q, expectedEPS, actualEPS, surprisePct: Math.round(surprisePct * 10) / 10, revenue, reaction };
  });
}

function generateAnalystRatings(): AnalystRatingRow[] {
  const localRng = mulberry32(7654 + 2);
  const ratings: ("Strong Buy" | "Buy" | "Hold" | "Sell")[] = ["Strong Buy", "Buy", "Buy", "Hold", "Hold", "Sell"];

  return TICKERS.map(({ ticker, company, price }) => {
    const analysts = Math.floor(localRng() * 20 + 15);
    const buyCount = Math.floor(localRng() * analysts * 0.7);
    const sellCount = Math.floor(localRng() * (analysts - buyCount) * 0.3);
    const holdCount = analysts - buyCount - sellCount;
    const buyPct = buyCount / analysts;
    let consensus: "Strong Buy" | "Buy" | "Hold" | "Sell" = "Hold";
    if (buyPct > 0.7) consensus = "Strong Buy";
    else if (buyPct > 0.5) consensus = "Buy";
    else if (sellCount / analysts > 0.3) consensus = "Sell";

    const upside = (localRng() - 0.2) * 40;
    const priceTarget = Math.round(price * (1 + upside / 100));
    const months = ["Jan", "Feb", "Mar"];
    const lastChange = `${months[Math.floor(localRng() * 3)]} ${Math.floor(localRng() * 28) + 1}, 2026`;

    return {
      ticker,
      company,
      consensus,
      analysts,
      priceTarget,
      currentPrice: price,
      upsidePct: Math.round(upside * 10) / 10,
      lastChange,
      buyCount,
      holdCount,
      sellCount,
    };
  });
}

function generateRatingChanges(): RatingChange[] {
  const localRng = mulberry32(7654 + 3);
  const firms = ["Goldman Sachs", "Morgan Stanley", "JPMorgan", "BofA", "Citi", "UBS", "Barclays", "Wells Fargo", "Jefferies", "Piper Sandler"];
  const allRatings = ["Strong Buy", "Buy", "Hold", "Sell", "Underperform", "Outperform", "Neutral"];
  const allTickers = TICKERS.map((t) => t.ticker);
  const prices: Record<string, number> = Object.fromEntries(TICKERS.map((t) => [t.ticker, t.price]));

  const changes: RatingChange[] = [];
  const dates = ["Mar 25, 2026", "Mar 24, 2026", "Mar 21, 2026", "Mar 20, 2026", "Mar 18, 2026", "Mar 17, 2026", "Mar 14, 2026", "Mar 12, 2026", "Mar 10, 2026", "Mar 7, 2026", "Mar 5, 2026", "Mar 3, 2026", "Feb 28, 2026", "Feb 26, 2026", "Feb 24, 2026"];

  for (let i = 0; i < 15; i++) {
    const ticker = allTickers[Math.floor(localRng() * allTickers.length)];
    const price = prices[ticker];
    const firmIdx = Math.floor(localRng() * firms.length);
    const oldRatingIdx = Math.floor(localRng() * allRatings.length);
    let newRatingIdx = Math.floor(localRng() * allRatings.length);
    while (newRatingIdx === oldRatingIdx) newRatingIdx = Math.floor(localRng() * allRatings.length);
    const oldTarget = Math.round(price * (0.85 + localRng() * 0.3));
    const newTarget = Math.round(price * (0.85 + localRng() * 0.35));
    changes.push({
      date: dates[i],
      firm: firms[firmIdx],
      ticker,
      oldRating: allRatings[oldRatingIdx],
      newRating: allRatings[newRatingIdx],
      oldTarget,
      newTarget,
    });
  }
  return changes;
}

const EARNINGS_STRATEGIES: EarningsStrategy[] = [
  {
    name: "Long Straddle Before Earnings",
    description: "Buy both a call and a put at the same strike (ATM) before the earnings announcement. Profits if the stock moves significantly in either direction.",
    setup: "Buy 1 ATM call + 1 ATM put, same expiry (nearest weekly). Enter 1–2 weeks before earnings, exit same day or next day after announcement.",
    winRate: Math.round(mulberry32(7654 + 10)() * 15 + 35),
    riskReward: "Unlimited upside / limited downside (premium paid)",
    bestFor: "High-IV crush expected, but uncertainty is extreme (e.g., FDA/DOJ event)",
    riskWarning: "IV crush after earnings often destroys premium value even if the stock moves as expected. Time decay (theta) works against you. Win rate is often below 50% historically.",
  },
  {
    name: "Iron Condor for Range-Bound Stocks",
    description: "Sell a call spread + sell a put spread around the expected move. Collect premium if the stock stays within a defined range after earnings.",
    setup: "Sell OTM call + buy further OTM call; sell OTM put + buy further OTM put. Structure around ±1σ expected move.",
    winRate: Math.round(mulberry32(7654 + 11)() * 10 + 60),
    riskReward: "Limited profit (premium) / limited loss (spread width - premium)",
    bestFor: "Stocks with historically stable earnings reactions and high IV rank",
    riskWarning: "A large gap beyond your short strikes wipes out multiple premium collections. Requires precise strike selection.",
  },
  {
    name: "Earnings Momentum (Buy After Positive Surprise)",
    description: "Wait for confirmed beat + positive guidance, then enter long the next morning. Ride momentum continuation.",
    setup: "Watch pre-market reaction. If gap-up >2% on strong beat + guidance raise, buy at open or slight pullback. Target 3–5 day hold.",
    winRate: Math.round(mulberry32(7654 + 12)() * 10 + 55),
    riskReward: "Avg winner +6–12% / avg loser -4–6%",
    bestFor: "Growth stocks with accelerating revenue and strong forward guidance",
    riskWarning: "Buying gaps requires accepting you already missed the initial move. Broader market weakness can override single-stock momentum.",
  },
  {
    name: "Fade the Gap (Counter-Trend)",
    description: "Fade extreme over-reactions by shorting large gap-ups or buying large gap-downs, expecting mean reversion within 1–3 days.",
    setup: "Identify gaps >8% that appear outsized vs. actual results. Enter counter-direction within first 30 minutes with tight stop at gap extreme.",
    winRate: Math.round(mulberry32(7654 + 13)() * 10 + 48),
    riskReward: "Risk ~2–3% / target reversion of ~4–6%",
    bestFor: "Mature large-caps that historically show gap fill patterns",
    riskWarning: "Fading strong momentum can lead to large losses if the move sustains. Only use with strict stop-losses and small position sizes.",
  },
  {
    name: "Covered Call Into Earnings",
    description: "If you own the stock, sell an OTM call before earnings to collect elevated IV premium. Reduces cost basis; caps upside.",
    setup: "Sell 1 OTM call (strike ~5–10% above current price) with earnings expiry. If assigned, sell shares at premium strike.",
    winRate: Math.round(mulberry32(7654 + 14)() * 10 + 65),
    riskReward: "Keep premium (1–3% of stock price) but cap upside gain",
    bestFor: "Investors who own stock and are willing to sell at a price premium",
    riskWarning: "If stock surges past your strike, you give up additional gains. If stock crashes, premium only partially offsets losses.",
  },
];

// ── Category color helpers ─────────────────────────────────────────────────────

function catColor(cat: "large-cap" | "high-vol" | "beat-history") {
  if (cat === "large-cap") return "bg-primary/20 text-primary border border-border";
  if (cat === "high-vol") return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
}

function ratingColor(rating: string) {
  if (rating === "Strong Buy" || rating === "Outperform") return "text-emerald-400";
  if (rating === "Buy") return "text-emerald-400";
  if (rating === "Hold" || rating === "Neutral") return "text-amber-400";
  return "text-red-400";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

// ── Tab 1: Earnings Calendar ──────────────────────────────────────────────────

function CalendarTab() {
  const upcoming = useMemo(() => generateUpcomingEarnings(), []);
  const { march, april } = useMemo(() => generateCalendarData(), []);
  const [showMonth, setShowMonth] = useState<"march" | "april">("march");

  const calendarCells = showMonth === "march" ? march : april;
  const monthLabel = showMonth === "march" ? "March 2026" : "April 2026";
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-8">
      {/* HERO — Next Earnings Event */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-border bg-card border-l-4 border-l-primary p-6 space-y-3">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Next Earnings Event
          </h2>
          {(() => {
            const e = upcoming[0];
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={cn("px-3 py-1 rounded-md text-sm font-bold", catColor(e.category))}>
                    {e.ticker}
                  </div>
                  <div>
                    <div className="text-base font-medium text-foreground">{e.company}</div>
                    <div className="text-xs text-muted-foreground">{e.day} &middot; {e.time === "BMO" ? "Before Market Open" : "After Market Close"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Est. EPS", value: `$${e.epsEstimate.toFixed(2)}`, color: "" },
                    { label: "Whisper", value: `$${e.whisperEPS.toFixed(2)}`, color: "text-emerald-400" },
                    { label: "Last EPS", value: `$${e.lastEPS.toFixed(2)}`, color: "" },
                    { label: "Impl. Move", value: `\u00B1${e.impliedMove}%`, color: "text-amber-400" },
                    { label: "Beat Rate", value: `${e.beatRate}%`, color: e.beatRate >= 70 ? "text-emerald-400" : e.beatRate >= 55 ? "text-amber-400" : "text-red-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                      <p className={cn("text-sm font-medium font-mono tabular-nums", color)}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Compact list — Remaining Upcoming Earnings (crushed) */}
      {upcoming.length > 1 && (
        <div>
          <h2 className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Other Upcoming Earnings
          </h2>
          <div className="space-y-0.5">
            {upcoming.slice(1).map((e, i) => (
              <div
                key={i}
                className="bg-card/50 border border-border/50 rounded px-2.5 py-1.5 flex items-center gap-2.5 text-[11px]"
              >
                <div className={cn("px-1.5 py-0.5 rounded text-[11px] font-medium", catColor(e.category))}>
                  {e.ticker}
                </div>
                <span className="text-muted-foreground truncate flex-1">{e.company}</span>
                <span className="text-[11px] text-muted-foreground">{e.day}</span>
                <span className="text-[11px] text-muted-foreground">{e.time === "BMO" ? "BMO" : "AMC"}</span>
                <span className="font-mono text-muted-foreground">Est ${e.epsEstimate.toFixed(2)}</span>
                <span className="font-mono text-amber-400/70">&plusmn;{e.impliedMove}%</span>
                <span className={cn("font-mono", e.beatRate >= 70 ? "text-emerald-400/70" : e.beatRate >= 55 ? "text-amber-400/70" : "text-red-400/70")}>
                  {e.beatRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {monthLabel} Earnings Calendar
          </h2>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setShowMonth("march")}
              className={cn("px-3 py-1 rounded transition-colors", showMonth === "march" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              March
            </button>
            <button
              onClick={() => setShowMonth("april")}
              className={cn("px-3 py-1 rounded transition-colors", showMonth === "april" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              April
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mb-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Large Cap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-muted-foreground">High Vol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground">Beat History</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={cn(
                  "min-h-[80px] border-b border-r border-border/50 p-1.5",
                  idx % 7 === 6 && "border-r-0",
                  !cell.day && "bg-muted/20",
                )}
              >
                {cell.day > 0 && (
                  <>
                    <div className="text-xs font-medium text-muted-foreground mb-1">{cell.day}</div>
                    <div className="flex flex-wrap gap-0.5">
                      {cell.events.map((ev, ei) => (
                        <div
                          key={ei}
                          className={cn(
                            "text-[11px] font-semibold px-1 py-0.5 rounded",
                            ev.category === "large-cap" ? "bg-primary/20 text-primary" :
                            ev.category === "high-vol" ? "bg-amber-500/20 text-amber-400" :
                            "bg-emerald-500/20 text-emerald-400",
                          )}
                        >
                          {ev.ticker}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Earnings Analysis ──────────────────────────────────────────────────

function EarningsBarChart({ data }: { data: EarningsHistoryRow[] }) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.surprisePct)), 5);
  const W = 480, H = 160, PAD = { top: 10, bottom: 28, left: 40, right: 10 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const barW = (innerW / data.length) * 0.6;
  const barSpacing = innerW / data.length;
  const midY = PAD.top + innerH / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Zero line */}
      <line x1={PAD.left} y1={midY} x2={W - PAD.right} y2={midY} stroke="currentColor" className="text-border" strokeWidth={1} />

      {data.map((d, i) => {
        const cx = PAD.left + i * barSpacing + barSpacing / 2;
        const pxPerPct = (innerH / 2) / maxAbs;
        const barH = Math.abs(d.surprisePct) * pxPerPct;
        const barY = d.surprisePct >= 0 ? midY - barH : midY;
        const fill = d.surprisePct >= 0 ? "#10b981" : "#ef4444";

        return (
          <g key={i}>
            <rect
              x={cx - barW / 2}
              y={barY}
              width={barW}
              height={barH}
              fill={fill}
              opacity={0.8}
              rx={2}
            />
            <text
              x={cx}
              y={H - 8}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              className="text-muted-foreground"
            >
              {d.quarter.replace(" ", "\n").split(" ").map((t, ti) => (
                <tspan key={ti} x={cx} dy={ti === 0 ? 0 : 10}>{t}</tspan>
              ))}
            </text>
            <text
              x={cx}
              y={d.surprisePct >= 0 ? barY - 3 : barY + barH + 10}
              textAnchor="middle"
              fontSize={8}
              fill={fill}
            >
              {d.surprisePct > 0 ? "+" : ""}{d.surprisePct.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {/* Y-axis labels */}
      {[-maxAbs, 0, maxAbs].map((v, i) => {
        const yPos = i === 0 ? PAD.top + innerH : i === 1 ? midY : PAD.top;
        return (
          <text key={i} x={PAD.left - 5} y={yPos + 4} textAnchor="end" fontSize={9} fill="currentColor" className="text-muted-foreground">
            {v > 0 ? "+" : ""}{v.toFixed(0)}%
          </text>
        );
      })}
    </svg>
  );
}

function EarningsScatterPlot({ data }: { data: EarningsHistoryRow[] }) {
  const W = 320, H = 200, PAD = { top: 15, bottom: 30, left: 40, right: 15 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxX = Math.max(...data.map((d) => Math.abs(d.surprisePct)), 10);
  const maxY = Math.max(...data.map((d) => Math.abs(d.reaction)), 8);

  const toX = (v: number) => PAD.left + ((v + maxX) / (2 * maxX)) * innerW;
  const toY = (v: number) => PAD.top + innerH - ((v + maxY) / (2 * maxY)) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Axes */}
      <line x1={PAD.left} y1={toY(0)} x2={W - PAD.right} y2={toY(0)} stroke="currentColor" className="text-border" strokeWidth={1} strokeDasharray="3,3" />
      <line x1={toX(0)} y1={PAD.top} x2={toX(0)} y2={PAD.top + innerH} stroke="currentColor" className="text-border" strokeWidth={1} strokeDasharray="3,3" />

      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="currentColor" className="text-muted-foreground">EPS Surprise %</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={9} fill="currentColor" className="text-muted-foreground" transform={`rotate(-90, 10, ${H / 2})`}>1D Return %</text>

      {/* Points */}
      {data.map((d, i) => {
        const x = toX(d.surprisePct);
        const y = toY(d.reaction);
        const fill = d.surprisePct >= 0 && d.reaction >= 0 ? "#10b981" :
                     d.surprisePct < 0 && d.reaction < 0 ? "#ef4444" : "#f59e0b";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill={fill} opacity={0.8} />
            <text x={x + 6} y={y + 4} fontSize={8} fill="currentColor" className="text-muted-foreground">{d.quarter.slice(0, 2)}{d.quarter.slice(-2)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function EarningsAnalysisTab() {
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const history = useMemo(() => generateEarningsHistory(selectedTicker), [selectedTicker]);

  const beatCount = history.filter((h) => h.surprisePct > 0).length;
  const avgSurprise = history.reduce((s, h) => s + h.surprisePct, 0) / history.length;
  const avgReaction = history.reduce((s, h) => s + h.reaction, 0) / history.length;
  const consistencyScore = Math.round((beatCount / history.length) * 100);
  const revGrowth = ((history[history.length - 1].revenue - history[0].revenue) / history[0].revenue) * 100;

  const qualityScore = Math.round((consistencyScore * 0.5 + Math.min(100, Math.max(0, avgSurprise * 5 + 50)) * 0.3 + Math.min(100, Math.max(0, revGrowth + 50)) * 0.2));
  const stratSuggestion = avgSurprise > 5
    ? "Earnings Momentum — strong historical beats suggest buying post-announcement gap-ups."
    : beatCount < 4
    ? "Short Straddle — inconsistent beats with high IV crush potential; sell premium pre-earnings."
    : "Iron Condor — moderate beat history; collect range-bound premium around ±implied move.";

  return (
    <div className="space-y-6">
      {/* Ticker selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Select ticker:</span>
        <div className="flex flex-wrap gap-1.5">
          {TICKERS.map(({ ticker }) => (
            <button
              key={ticker}
              onClick={() => setSelectedTicker(ticker)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold transition-colors",
                selectedTicker === ticker ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Earnings history table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">{selectedTicker} — 8-Quarter Earnings History</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Quarter</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Est. EPS</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Actual EPS</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Surprise %</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Revenue ($B)</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">1D Reaction</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-medium text-foreground">{row.quarter}</td>
                  <td className="px-3 py-2 text-right font-mono">${row.expectedEPS.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono">${row.actualEPS.toFixed(2)}</td>
                  <td className={cn("px-3 py-2 text-right font-mono font-semibold", row.surprisePct >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {row.surprisePct > 0 ? "+" : ""}{row.surprisePct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{row.revenue.toFixed(1)}</td>
                  <td className={cn("px-3 py-2 text-right font-mono font-semibold", row.reaction >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {row.reaction > 0 ? "+" : ""}{row.reaction.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs font-semibold text-foreground mb-2">EPS Surprise per Quarter</div>
          <EarningsBarChart data={history} />
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs font-semibold text-foreground mb-2">Surprise vs 1D Reaction</div>
          <EarningsScatterPlot data={history} />
        </div>
      </div>

      {/* Earnings quality + strategy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div className="border-l-4 border-l-primary bg-card rounded-lg p-4 space-y-2">
          <div className="text-xs font-medium text-foreground">Earnings Quality Score</div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-2xl font-bold tabular-nums",
              qualityScore >= 70 ? "text-emerald-400" : qualityScore >= 50 ? "text-amber-400" : "text-red-400"
            )}>
              {qualityScore}
            </div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Beat consistency</span>
              <span className="font-mono text-foreground">{beatCount}/8 quarters</span>
            </div>
            <div className="flex justify-between">
              <span>Avg EPS surprise</span>
              <span className={cn("font-mono", avgSurprise >= 0 ? "text-emerald-400" : "text-red-400")}>
                {avgSurprise > 0 ? "+" : ""}{avgSurprise.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg 1D reaction</span>
              <span className={cn("font-mono", avgReaction >= 0 ? "text-emerald-400" : "text-red-400")}>
                {avgReaction > 0 ? "+" : ""}{avgReaction.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Revenue growth (8Q)</span>
              <span className={cn("font-mono", revGrowth >= 0 ? "text-emerald-400" : "text-red-400")}>
                {revGrowth > 0 ? "+" : ""}{revGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-primary" />
            Suggested Post-Earnings Strategy
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{stratSuggestion}</p>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Analyst Ratings ─────────────────────────────────────────────────────

function RatingHeatmap({ ratings }: { ratings: AnalystRatingRow[] }) {
  const W = 520, H = ratings.length * 28 + 30;
  const labelW = 60, barW = W - labelW - 20;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text x={labelW + barW * 0} y={16} fontSize={9} fill="currentColor" className="text-muted-foreground">Buy</text>
      <text x={labelW + barW * 0.5} y={16} textAnchor="middle" fontSize={9} fill="currentColor" className="text-muted-foreground">Hold</text>
      <text x={labelW + barW} y={16} textAnchor="end" fontSize={9} fill="currentColor" className="text-muted-foreground">Sell</text>

      {ratings.map((r, i) => {
        const y = 26 + i * 28;
        const buyW = (r.buyCount / r.analysts) * barW;
        const holdW = (r.holdCount / r.analysts) * barW;
        const sellW = (r.sellCount / r.analysts) * barW;
        return (
          <g key={i}>
            <text x={labelW - 4} y={y + 12} textAnchor="end" fontSize={9} fill="currentColor" className="text-muted-foreground">{r.ticker}</text>
            <rect x={labelW} y={y} width={buyW} height={18} fill="#10b981" opacity={0.8} rx={2} />
            <rect x={labelW + buyW} y={y} width={holdW} height={18} fill="#f59e0b" opacity={0.8} />
            <rect x={labelW + buyW + holdW} y={y} width={sellW} height={18} fill="#ef4444" opacity={0.8} rx={2} />
            <text x={labelW + buyW / 2} y={y + 12} textAnchor="middle" fontSize={8} fill="white">
              {r.buyCount > 0 ? r.buyCount : ""}
            </text>
            <text x={labelW + buyW + holdW / 2} y={y + 12} textAnchor="middle" fontSize={8} fill="white">
              {r.holdCount > 0 ? r.holdCount : ""}
            </text>
            <text x={labelW + buyW + holdW + sellW / 2} y={y + 12} textAnchor="middle" fontSize={8} fill="white">
              {r.sellCount > 0 ? r.sellCount : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AnalystRatingsTab() {
  const ratings = useMemo(() => generateAnalystRatings(), []);
  const ratingChanges = useMemo(() => generateRatingChanges(), []);

  const contrarian = ratings.filter((r) => r.sellCount / r.analysts > 0.4 && r.upsidePct > 0);

  return (
    <div className="space-y-6">
      {/* Consensus table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-xs font-medium text-foreground">Analyst Consensus — All Tickers</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Ticker</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Consensus</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Analysts</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Price Target</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Current</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Upside</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Distribution</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Last Change</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-semibold text-foreground">{r.ticker}</td>
                  <td className={cn("px-3 py-2 font-semibold", ratingColor(r.consensus))}>{r.consensus}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">{r.analysts}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">${r.priceTarget}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">${r.currentPrice}</td>
                  <td className={cn("px-3 py-2 text-right font-mono font-semibold", r.upsidePct >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {r.upsidePct > 0 ? "+" : ""}{r.upsidePct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex h-2 w-24 rounded-full overflow-hidden">
                      <div className="bg-emerald-500" style={{ width: `${(r.buyCount / r.analysts) * 100}%` }} />
                      <div className="bg-amber-500" style={{ width: `${(r.holdCount / r.analysts) * 100}%` }} />
                      <div className="bg-red-500" style={{ width: `${(r.sellCount / r.analysts) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{r.lastChange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap + contrarian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs font-semibold text-foreground mb-2">Rating Distribution Heatmap</div>
          <RatingHeatmap ratings={ratings} />
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Contrarian Opportunities
          </div>
          {contrarian.length === 0 ? (
            <p className="text-xs text-muted-foreground">No contrarian setups currently.</p>
          ) : (
            <div className="space-y-2">
              {contrarian.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-foreground w-12">{r.ticker}</span>
                  <span className="text-red-400">{Math.round((r.sellCount / r.analysts) * 100)}% Sell</span>
                  <span className="text-emerald-400">+{r.upsidePct.toFixed(1)}% upside</span>
                  <span className="text-muted-foreground text-xs">Possible short squeeze / beaten-down value</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating changes feed */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-xs font-medium text-foreground">Recent Rating Changes</span>
        </div>
        <div className="divide-y divide-border/50">
          {ratingChanges.map((rc, i) => {
            const isUpgrade = ["Strong Buy", "Buy", "Outperform"].includes(rc.newRating) &&
                              !["Strong Buy", "Buy", "Outperform"].includes(rc.oldRating);
            const isDowngrade = ["Sell", "Underperform"].includes(rc.newRating) &&
                                !["Sell", "Underperform"].includes(rc.oldRating);
            return (
              <div key={i} className="px-3 py-2 flex items-center gap-3 text-xs hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground w-24 shrink-0">{rc.date}</span>
                <span className="font-semibold text-foreground w-12 shrink-0">{rc.ticker}</span>
                <span className="text-muted-foreground flex-1 truncate">{rc.firm}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("font-medium", ratingColor(rc.oldRating))}>{rc.oldRating}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className={cn("font-semibold", ratingColor(rc.newRating))}>{rc.newRating}</span>
                </div>
                {isUpgrade && <span className="text-emerald-400 text-xs font-semibold shrink-0">UPGRADE</span>}
                {isDowngrade && <span className="text-red-400 text-xs font-semibold shrink-0">DOWNGRADE</span>}
                <span className="text-muted-foreground shrink-0 font-mono">PT: ${rc.oldTarget}→${rc.newTarget}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Earnings Strategies ────────────────────────────────────────────────

type RouletteState = "idle" | "revealed";

interface RouletteResult {
  ticker: string;
  guess: "beat" | "miss";
  actual: "beat" | "miss";
  surprisePct: number;
  reaction: number;
  pnl: number;
}

function EarningsStrategiesTab() {
  const [expandedStrategy, setExpandedStrategy] = useState<number | null>(null);
  const [rouletteTicker, setRouletteTicker] = useState("AAPL");
  const [rouletteGuess, setRouletteGuess] = useState<"beat" | "miss">("beat");
  const [rouletteState, setRouletteState] = useState<RouletteState>("idle");
  const [rouletteResult, setRouletteResult] = useState<RouletteResult | null>(null);

  const rouletteLocalRng = useMemo(() => mulberry32(7654 + 99 + rouletteTicker.charCodeAt(0)), [rouletteTicker]);

  function playRoulette() {
    const r1 = rouletteLocalRng();
    const r2 = rouletteLocalRng();
    const r3 = rouletteLocalRng();
    const actual: "beat" | "miss" = r1 > 0.35 ? "beat" : "miss";
    const surprisePct = actual === "beat" ? r2 * 15 + 1 : -(r2 * 10 + 1);
    const correct = rouletteGuess === actual;
    const reaction = surprisePct * 0.3 + (r3 - 0.5) * 8;
    const pnl = correct ? Math.abs(reaction) * 100 : -Math.abs(reaction) * 60;

    setRouletteResult({
      ticker: rouletteTicker,
      guess: rouletteGuess,
      actual,
      surprisePct: Math.round(surprisePct * 10) / 10,
      reaction: Math.round(reaction * 10) / 10,
      pnl: Math.round(pnl),
    });
    setRouletteState("revealed");
  }

  return (
    <div className="space-y-4">
      {/* Strategies list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          5 Common Earnings Trading Strategies
        </h2>

        {EARNINGS_STRATEGIES.map((strat, i) => {
          const isOpen = expandedStrategy === i;
          return (
            <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedStrategy(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{strat.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Win rate: <span className={cn("font-mono font-semibold", strat.winRate >= 60 ? "text-emerald-400" : strat.winRate >= 50 ? "text-amber-400" : "text-red-400")}>{strat.winRate}%</span>
                      {" · "}R/R: <span className="font-mono text-foreground">{strat.riskReward}</span>
                    </div>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{strat.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-muted/30 rounded p-2.5">
                      <div className="text-muted-foreground font-medium mb-1">Setup</div>
                      <div className="text-foreground leading-relaxed">{strat.setup}</div>
                    </div>
                    <div className="bg-muted/30 rounded p-2.5">
                      <div className="text-muted-foreground font-medium mb-1">Best For</div>
                      <div className="text-foreground leading-relaxed">{strat.bestFor}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded p-2.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-400/90 leading-relaxed">{strat.riskWarning}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Earnings Roulette */}
      <div className="bg-card border border-primary/20 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-primary/20">
          <div className="text-sm font-semibold text-foreground">Earnings Roulette</div>
          <div className="text-xs text-muted-foreground mt-0.5">Pick a ticker, guess Beat or Miss, then reveal the result.</div>
        </div>
        <div className="p-4 space-y-4">
          {rouletteState === "idle" ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Ticker</div>
                  <div className="flex flex-wrap gap-1">
                    {TICKERS.map(({ ticker }) => (
                      <button
                        key={ticker}
                        onClick={() => setRouletteTicker(ticker)}
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-semibold transition-colors",
                          rouletteTicker === ticker ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {ticker}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Your Guess</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRouletteGuess("beat")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors",
                        rouletteGuess === "beat" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Beat
                    </button>
                    <button
                      onClick={() => setRouletteGuess("miss")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors",
                        rouletteGuess === "miss" ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Miss
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={playRoulette}
                className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reveal Result
              </button>
            </>
          ) : rouletteResult && (
            <div className="space-y-3">
              <div className={cn(
                "text-center py-4 rounded-lg",
                rouletteResult.guess === rouletteResult.actual ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"
              )}>
                <div className="text-2xl font-bold mb-1">
                  {rouletteResult.guess === rouletteResult.actual
                    ? <span className="text-emerald-400">You got it right!</span>
                    : <span className="text-red-400">Wrong guess!</span>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {rouletteResult.ticker} reported a <span className={rouletteResult.actual === "beat" ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>{rouletteResult.actual.toUpperCase()}</span>
                  {" "}({rouletteResult.surprisePct > 0 ? "+" : ""}{rouletteResult.surprisePct}% surprise)
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Stock reacted: <span className={cn("font-mono font-semibold", rouletteResult.reaction >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {rouletteResult.reaction > 0 ? "+" : ""}{rouletteResult.reaction}%
                  </span>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Simulated P&amp;L (100 shares)</div>
                <div className={cn("text-xl font-bold font-mono", rouletteResult.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {rouletteResult.pnl >= 0 ? "+" : ""}${rouletteResult.pnl.toLocaleString()}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-400/90">
                    <strong>Risk Warning:</strong> Earnings are binary events. Even with correct directional guesses, IV crush, gap-and-reverse, and poor guidance can result in significant losses. Never size earnings trades larger than 1–2% of your portfolio.
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setRouletteState("idle"); setRouletteResult(null); }}
                className="w-full py-2 border border-border text-muted-foreground text-sm rounded-lg hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* General risk warning */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-400 mb-1">Important Risk Disclosure</div>
            <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
              <p>Earnings trading involves significant binary risk. Even professional traders with perfect information frequently lose money on earnings plays due to unpredictable market dynamics.</p>
              <p>Key risks: IV crush destroys option premium even on correct directional moves. Guidance matters more than results. Broad market conditions override single-stock catalysts. Liquidity gaps at open can cause severe slippage.</p>
              <p>Past earnings patterns are NOT predictive of future results. All simulated data on this page is for educational purposes only.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EarningsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-medium text-foreground">Earnings Calendar</h1>
          <p className="text-[11px] text-muted-foreground">Calendar, analyst ratings, earnings history &amp; trading strategies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="calendar" className="flex flex-col h-full">
          <TabsList className="shrink-0 mx-4 mt-3 mb-0 w-auto justify-start">
            <TabsTrigger value="calendar" className="text-xs gap-1.5">
              <Calendar className="h-3 w-3" />
              Earnings Calendar
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Earnings Analysis
            </TabsTrigger>
            <TabsTrigger value="ratings" className="text-xs gap-1.5">
              <Star className="h-3 w-3" />
              Analyst Ratings
            </TabsTrigger>
            <TabsTrigger value="strategies" className="text-xs gap-1.5">
              <BookOpen className="h-3 w-3" />
              Strategies
            </TabsTrigger>
            <TabsTrigger value="deepdive" className="text-xs gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Deep Dive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="flex-1 overflow-y-auto px-4 py-4 data-[state=inactive]:hidden">
            <CalendarTab />
          </TabsContent>
          <TabsContent value="analysis" className="flex-1 overflow-y-auto px-4 py-4 data-[state=inactive]:hidden">
            <EarningsAnalysisTab />
          </TabsContent>
          <TabsContent value="ratings" className="flex-1 overflow-y-auto px-4 py-4 data-[state=inactive]:hidden">
            <AnalystRatingsTab />
          </TabsContent>
          <TabsContent value="strategies" className="flex-1 overflow-y-auto px-4 py-4 data-[state=inactive]:hidden">
            <EarningsStrategiesTab />
          </TabsContent>
          <TabsContent value="deepdive" className="flex-1 overflow-y-auto px-4 py-4 data-[state=inactive]:hidden">
            <EarningsDeepDive />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
