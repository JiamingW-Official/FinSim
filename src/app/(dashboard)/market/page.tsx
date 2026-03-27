"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useMarketData } from "@/hooks/useMarketData";
import { WATCHLIST_STOCKS } from "@/types/market";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { cn } from "@/lib/utils";
import NewsFeed from "@/components/market/NewsFeed";
import InsiderTradingPanel from "@/components/market/InsiderTradingPanel";
import InstitutionalHoldingsPanel from "@/components/market/InstitutionalHoldingsPanel";
import { ScreenerPanel } from "@/components/market/ScreenerPanel";
import { MacroDashboard } from "@/components/market/MacroDashboard";
import { OptionsFlowPanel } from "@/components/market/OptionsFlowPanel";
import { WatchlistPanel } from "@/components/trading/WatchlistPanel";
import { EarningsPanel } from "@/components/market/EarningsPanel";
import { generateInsiderTrades } from "@/services/market/insider-trading";
import { generateInstitutionalHoldings } from "@/services/market/institutional-holdings";
import { generateOptionsFlow } from "@/services/market/options-flow";

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "watchlist", label: "Watchlist" },
  { id: "news", label: "News" },
  { id: "screener", label: "Screener" },
  { id: "calendar", label: "Calendar" },
  { id: "insider", label: "Insider Trading" },
  { id: "institutional", label: "Institutional" },
  { id: "options-flow", label: "Options Flow" },
  { id: "crypto", label: "Crypto" },
  { id: "macro", label: "Macro" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const INDEX_DATA = [
  { ticker: "SPY", name: "S&P 500 ETF", seed: 1001 },
  { ticker: "QQQ", name: "Nasdaq 100 ETF", seed: 1002 },
  { ticker: "IWM", name: "Russell 2000 ETF", seed: 1003 },
  { ticker: "DIA", name: "Dow Jones ETF", seed: 1004 },
];

const BASE_INDEX_PRICES: Record<string, number> = {
  SPY: 548.32,
  QQQ: 468.75,
  IWM: 212.4,
  DIA: 444.18,
};

const SECTORS = [
  { name: "Technology", seed: 2001 },
  { name: "Healthcare", seed: 2002 },
  { name: "Financials", seed: 2003 },
  { name: "Energy", seed: 2004 },
  { name: "Industrials", seed: 2005 },
  { name: "Consumer Disc.", seed: 2006 },
  { name: "Consumer Staples", seed: 2007 },
  { name: "Utilities", seed: 2008 },
  { name: "Materials", seed: 2009 },
  { name: "Real Estate", seed: 2010 },
  { name: "Comm. Services", seed: 2011 },
];

function getChangePct(seed: number, range = 4): number {
  const rand = seededRandom(seed + Math.floor(Date.now() / 86400000));
  return (rand() - 0.45) * range; // slight positive bias
}

function MarketStatusBadge() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const totalMin = utcHour * 60 + utcMin;
  // US Eastern market hours: 14:30–21:00 UTC Mon–Fri
  const day = now.getUTCDay();
  const isWeekday = day >= 1 && day <= 5;
  const isMarketOpen = isWeekday && totalMin >= 870 && totalMin < 1260;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isMarketOpen ? "bg-emerald-500" : "bg-muted-foreground/40",
        )}
      />
      <span
        className={cn(
          "text-xs font-medium",
          isMarketOpen ? "text-emerald-500" : "text-muted-foreground",
        )}
      >
        Market {isMarketOpen ? "Open" : "Closed"}
      </span>
    </div>
  );
}

function IndexCard({ ticker, name, seed }: { ticker: string; name: string; seed: number }) {
  const basePrice = BASE_INDEX_PRICES[ticker] ?? 100;
  const changePct = getChangePct(seed);
  const price = basePrice * (1 + changePct / 100);
  const isPos = changePct >= 0;
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold font-mono">{ticker}</span>
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded",
            isPos ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
          )}
        >
          {isPos ? "+" : ""}
          {changePct.toFixed(2)}%
        </span>
      </div>
      <p className="font-mono tabular-nums text-base font-semibold">
        ${price.toFixed(2)}
      </p>
      <p className="text-[10px] text-muted-foreground truncate">{name}</p>
    </div>
  );
}

function SectorHeatmap() {
  const sectors = SECTORS.map((s) => ({
    ...s,
    changePct: getChangePct(s.seed, 5),
  }));

  const maxAbs = Math.max(...sectors.map((s) => Math.abs(s.changePct)));

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">Sector Performance</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
        {sectors.map((s) => {
          const intensity = Math.min(Math.abs(s.changePct) / maxAbs, 1);
          const isPos = s.changePct >= 0;
          // Pure SVG color approach via opacity on a colored rect
          return (
            <div
              key={s.name}
              className={cn(
                "rounded-md p-2 text-center border",
                isPos
                  ? "border-emerald-500/20"
                  : "border-red-500/20",
              )}
              style={{
                backgroundColor: isPos
                  ? `rgba(16,185,129,${0.05 + intensity * 0.25})`
                  : `rgba(239,68,68,${0.05 + intensity * 0.25})`,
              }}
            >
              <p className="text-[9px] text-muted-foreground truncate leading-tight">
                {s.name}
              </p>
              <p
                className={cn(
                  "font-mono tabular-nums text-[11px] font-semibold mt-0.5",
                  isPos ? "text-emerald-500" : "text-red-500",
                )}
              >
                {isPos ? "+" : ""}
                {s.changePct.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MoverStock {
  ticker: string;
  name: string;
  price: number;
  changePct: number;
}

function generateMovers(): { gainers: MoverStock[]; losers: MoverStock[] } {
  const rand = seededRandom(9999 + Math.floor(Date.now() / 86400000));
  const pool = [
    { ticker: "NVDA", name: "Nvidia Corp" },
    { ticker: "TSLA", name: "Tesla Inc" },
    { ticker: "AMD", name: "Advanced Micro Devices" },
    { ticker: "NFLX", name: "Netflix Inc" },
    { ticker: "SNOW", name: "Snowflake Inc" },
    { ticker: "CRM", name: "Salesforce Inc" },
    { ticker: "PANW", name: "Palo Alto Networks" },
    { ticker: "SHOP", name: "Shopify Inc" },
    { ticker: "COIN", name: "Coinbase Global" },
    { ticker: "RBLX", name: "Roblox Corp" },
    { ticker: "RIVN", name: "Rivian Automotive" },
    { ticker: "PLTR", name: "Palantir Technologies" },
    { ticker: "DKNG", name: "DraftKings Inc" },
    { ticker: "SOFI", name: "SoFi Technologies" },
    { ticker: "UPST", name: "Upstart Holdings" },
    { ticker: "SMCI", name: "Super Micro Computer" },
    { ticker: "ARM", name: "ARM Holdings" },
    { ticker: "DDOG", name: "Datadog Inc" },
    { ticker: "NET", name: "Cloudflare Inc" },
    { ticker: "ZS", name: "Zscaler Inc" },
  ];

  const withChanges = pool.map((s) => {
    const r = rand();
    return { ...s, price: 50 + rand() * 300, changePct: (r - 0.5) * 15 };
  });

  const sorted = [...withChanges].sort((a, b) => b.changePct - a.changePct);
  return {
    gainers: sorted.slice(0, 10),
    losers: sorted.slice(-10).reverse(),
  };
}

function VixIndicator() {
  const rand = seededRandom(7777 + Math.floor(Date.now() / 86400000));
  const vix = 15 + rand() * 15; // 15–30
  const trend = rand() > 0.5 ? "Rising" : "Falling";
  const isRising = trend === "Rising";
  const fearLevel =
    vix < 18 ? "Low Fear" : vix < 24 ? "Moderate" : "High Fear";
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">VIX — Volatility Index</h3>
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded",
            isRising ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500",
          )}
        >
          {trend}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <span className="font-mono tabular-nums text-2xl font-bold">
          {vix.toFixed(2)}
        </span>
        <span className="text-xs text-muted-foreground mb-1">{fearLevel}</span>
      </div>
      {/* VIX range bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-muted overflow-hidden relative">
          {/* color zones */}
          <svg className="w-full h-full" viewBox="0 0 100 8" preserveAspectRatio="none">
            <rect x="0" y="0" width="30" height="8" fill="rgba(16,185,129,0.4)" />
            <rect x="30" y="0" width="30" height="8" fill="rgba(234,179,8,0.4)" />
            <rect x="60" y="0" width="40" height="8" fill="rgba(239,68,68,0.4)" />
          </svg>
          <div
            className="absolute top-0 h-full w-1 bg-foreground rounded-full"
            style={{ left: `${Math.min(((vix - 10) / 40) * 100, 95)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>10 (Low)</span>
          <span>25</span>
          <span>50+ (Fear)</span>
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const movers = useMemo(() => generateMovers(), []);

  return (
    <div className="space-y-4">
      {/* Index row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INDEX_DATA.map((idx) => (
          <IndexCard key={idx.ticker} {...idx} />
        ))}
      </div>

      {/* Sector heatmap */}
      <SectorHeatmap />

      {/* Gainers / Losers + VIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gainers */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-emerald-500">Top Gainers</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b">
                <th className="text-left py-1 font-medium">Ticker</th>
                <th className="text-right py-1 font-medium">Price</th>
                <th className="text-right py-1 font-medium">% Chg</th>
              </tr>
            </thead>
            <tbody>
              {movers.gainers.map((s) => (
                <tr key={s.ticker} className="border-b border-border/20 last:border-0">
                  <td className="py-1 font-mono font-semibold">{s.ticker}</td>
                  <td className="py-1 text-right font-mono tabular-nums">
                    ${s.price.toFixed(2)}
                  </td>
                  <td className="py-1 text-right font-mono tabular-nums text-emerald-500">
                    +{s.changePct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Losers */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-500">Top Losers</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b">
                <th className="text-left py-1 font-medium">Ticker</th>
                <th className="text-right py-1 font-medium">Price</th>
                <th className="text-right py-1 font-medium">% Chg</th>
              </tr>
            </thead>
            <tbody>
              {movers.losers.map((s) => (
                <tr key={s.ticker} className="border-b border-border/20 last:border-0">
                  <td className="py-1 font-mono font-semibold">{s.ticker}</td>
                  <td className="py-1 text-right font-mono tabular-nums">
                    ${s.price.toFixed(2)}
                  </td>
                  <td className="py-1 text-right font-mono tabular-nums text-red-500">
                    {s.changePct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIX */}
        <VixIndicator />
      </div>
    </div>
  );
}

// ─── News Tab ─────────────────────────────────────────────────────────────────

function NewsTab({ ticker }: { ticker: string }) {
  return (
    <div className="max-w-3xl">
      <NewsFeed ticker={ticker} />
    </div>
  );
}

// ─── Screener Tab ─────────────────────────────────────────────────────────────

function ScreenerTab({ onSelectTicker }: { onSelectTicker: (t: string) => void }) {
  return <ScreenerPanel onSelectTicker={onSelectTicker} />;
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

type EventType = "Earnings" | "FOMC" | "CPI" | "NFP" | "GDP" | "PMI";
type ImpactLevel = "High" | "Medium" | "Low";

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  name: string;
  type: EventType;
  impact: ImpactLevel;
  expected: string;
  previous: string;
}

function generateCalendarEvents(): CalendarEvent[] {
  const rand = seededRandom(5555);
  const today = new Date("2026-03-27");
  const events: CalendarEvent[] = [];

  const eventTemplates: {
    name: string;
    type: EventType;
    impact: ImpactLevel;
    expected: string;
    previous: string;
  }[] = [
    { name: "CPI (YoY)", type: "CPI", impact: "High", expected: "3.1%", previous: "3.2%" },
    { name: "Core CPI (MoM)", type: "CPI", impact: "High", expected: "0.3%", previous: "0.4%" },
    { name: "FOMC Rate Decision", type: "FOMC", impact: "High", expected: "5.25%", previous: "5.25%" },
    { name: "Non-Farm Payrolls", type: "NFP", impact: "High", expected: "185K", previous: "203K" },
    { name: "GDP Growth Rate (QoQ)", type: "GDP", impact: "High", expected: "2.1%", previous: "3.3%" },
    { name: "ISM Manufacturing PMI", type: "PMI", impact: "Medium", expected: "49.5", previous: "47.8" },
    { name: "Initial Jobless Claims", type: "NFP", impact: "Medium", expected: "215K", previous: "218K" },
    { name: "ISM Services PMI", type: "PMI", impact: "Medium", expected: "52.4", previous: "53.4" },
    { name: "Retail Sales (MoM)", type: "GDP", impact: "Medium", expected: "0.3%", previous: "-0.9%" },
    { name: "PPI (MoM)", type: "CPI", impact: "Medium", expected: "0.2%", previous: "0.3%" },
    { name: "Consumer Confidence", type: "PMI", impact: "Low", expected: "98.5", previous: "104.1" },
    { name: "Housing Starts", type: "GDP", impact: "Low", expected: "1.42M", previous: "1.38M" },
    { name: "FOMC Minutes", type: "FOMC", impact: "High", expected: "—", previous: "—" },
    { name: "Unemployment Rate", type: "NFP", impact: "High", expected: "3.7%", previous: "3.7%" },
  ];

  const earningsTickers = [
    { ticker: "AAPL", name: "Apple Inc Earnings" },
    { ticker: "MSFT", name: "Microsoft Earnings" },
    { ticker: "GOOG", name: "Alphabet Earnings" },
    { ticker: "AMZN", name: "Amazon Earnings" },
    { ticker: "META", name: "Meta Platforms Earnings" },
    { ticker: "NVDA", name: "Nvidia Earnings" },
  ];

  // Spread events over 14 days
  for (let day = 0; day < 14; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().slice(0, 10);
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) continue; // skip weekends

    const dayEvents = Math.floor(rand() * 3) + 1;
    for (let e = 0; e < dayEvents; e++) {
      const tmpl = eventTemplates[Math.floor(rand() * eventTemplates.length)];
      const hours = 8 + Math.floor(rand() * 10);
      const mins = rand() > 0.5 ? "30" : "00";
      events.push({
        id: `cal-${day}-${e}`,
        date: dateStr,
        time: `${hours.toString().padStart(2, "0")}:${mins} ET`,
        name: tmpl.name,
        type: tmpl.type,
        impact: tmpl.impact,
        expected: tmpl.expected,
        previous: tmpl.previous,
      });
    }

    // Add an earnings event some days
    if (rand() > 0.6) {
      const earn = earningsTickers[Math.floor(rand() * earningsTickers.length)];
      const afterClose = rand() > 0.5;
      events.push({
        id: `earn-${day}`,
        date: dateStr,
        time: afterClose ? "After Close" : "Before Open",
        name: earn.name,
        type: "Earnings",
        impact: "High",
        expected: `EPS $${(rand() * 3 + 0.5).toFixed(2)}`,
        previous: `EPS $${(rand() * 3 + 0.5).toFixed(2)}`,
      });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

const IMPACT_STYLES: Record<ImpactLevel, string> = {
  High: "bg-red-500/10 text-red-500",
  Medium: "bg-amber-500/10 text-amber-500",
  Low: "bg-muted text-muted-foreground",
};

const TYPE_STYLES: Record<EventType, string> = {
  Earnings: "bg-blue-500/10 text-blue-500",
  FOMC: "bg-purple-500/10 text-purple-500",
  CPI: "bg-orange-500/10 text-orange-500",
  NFP: "bg-emerald-500/10 text-emerald-500",
  GDP: "bg-teal-500/10 text-teal-500",
  PMI: "bg-sky-500/10 text-sky-500",
};

function CalendarTab() {
  const [impactFilter, setImpactFilter] = useState<ImpactLevel | "All">("All");
  const events = useMemo(() => generateCalendarEvents(), []);

  const filtered =
    impactFilter === "All" ? events : events.filter((e) => e.impact === impactFilter);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of filtered) {
      const arr = map.get(ev.date) ?? [];
      arr.push(ev);
      map.set(ev.date, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Impact:</span>
        {(["All", "High", "Medium", "Low"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setImpactFilter(level)}
            className={cn(
              "text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors",
              impactFilter === level
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Calendar groups */}
      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([date, dayEvents]) => {
          const d = new Date(date + "T12:00:00Z");
          const label = d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
          return (
            <div key={date} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
              </h3>
              <div className="rounded-lg border bg-card overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {dayEvents.map((ev) => (
                      <tr
                        key={ev.id}
                        className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap w-28">
                          {ev.time}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {ev.name}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-medium",
                              TYPE_STYLES[ev.type],
                            )}
                          >
                            {ev.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-medium",
                              IMPACT_STYLES[ev.impact],
                            )}
                          >
                            {ev.impact}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground text-[10px]">
                          <span className="text-foreground font-mono">{ev.expected}</span>
                          <span className="ml-1 text-muted-foreground/60">est.</span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground text-[10px]">
                          <span className="font-mono">{ev.previous}</span>
                          <span className="ml-1 text-muted-foreground/60">prev.</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Insider Trading Tab ──────────────────────────────────────────────────────

function InsiderTab({ ticker }: { ticker: string }) {
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const data = useMemo(() => generateInsiderTrades(ticker), [ticker]);

  const filtered =
    filter === "all" ? data.trades : data.trades.filter((t) => t.type === filter);

  function formatValue(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }

  function formatShares(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  const LARGE_THRESHOLD = 500_000;

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Activity</p>
          <p
            className={cn(
              "text-lg font-semibold font-mono tabular-nums mt-1",
              data.netBuying > 0 ? "text-emerald-500" : "text-red-500",
            )}
          >
            {data.netBuying > 0 ? "+" : ""}
            {formatValue(data.netBuying)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Buying</p>
          <p className="text-lg font-semibold font-mono tabular-nums mt-1 text-emerald-500">
            {formatValue(data.totalBuyValue)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Selling</p>
          <p className="text-lg font-semibold font-mono tabular-nums mt-1 text-red-500">
            {formatValue(data.totalSellValue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "buy", "sell"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "text-[10px] font-medium px-2.5 py-1 rounded-lg capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "all" ? "All" : f === "buy" ? "Purchases" : "Sales"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-3 font-medium">Company</th>
              <th className="text-left p-3 font-medium">Insider</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-center p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Shares</th>
              <th className="text-right p-3 font-medium">Value</th>
              <th className="text-right p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => {
              const isLarge = trade.value >= LARGE_THRESHOLD;
              return (
                <tr
                  key={trade.id}
                  className={cn(
                    "border-b border-border/20 last:border-0",
                    trade.type === "buy" ? "bg-emerald-500/[0.03]" : "bg-red-500/[0.03]",
                    isLarge && "ring-1 ring-inset ring-amber-500/20",
                  )}
                >
                  <td className="p-3 font-mono font-semibold">{ticker}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {isLarge && (
                        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded">
                          LARGE
                        </span>
                      )}
                      <span className="font-medium">{trade.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{trade.title}</td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded",
                        trade.type === "buy"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500",
                      )}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">
                    {formatShares(trade.shares)}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums font-medium">
                    {formatValue(trade.value)}
                  </td>
                  <td className="p-3 text-right text-muted-foreground">{trade.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Institutional Tab ────────────────────────────────────────────────────────

function InstitutionalTab({ ticker }: { ticker: string }) {
  const data = useMemo(() => generateInstitutionalHoldings(ticker), [ticker]);

  function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${(v / 1_000).toFixed(1)}K`;
  }

  function formatShares(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  // Classify quarterly change into action
  function getAction(chg: number): { label: string; cls: string } {
    if (chg > 5) return { label: "New/Increased", cls: "bg-emerald-500/10 text-emerald-500" };
    if (chg > 0) return { label: "Increased", cls: "bg-emerald-500/10 text-emerald-500" };
    if (chg < -5) return { label: "Sold Out/Decreased", cls: "bg-red-500/10 text-red-500" };
    if (chg < 0) return { label: "Decreased", cls: "bg-red-500/10 text-red-500" };
    return { label: "Unchanged", cls: "bg-muted text-muted-foreground" };
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Ownership bar */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Total Institutional Ownership — {ticker}</h3>
          <span className="font-mono tabular-nums text-lg font-bold">
            {data.totalInstitutionalOwnership.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${Math.min(data.totalInstitutionalOwnership, 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Increased</p>
            <p className="text-sm font-semibold text-emerald-500">
              {data.holders.filter((h) => h.quarterlyChange > 0).length}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Decreased</p>
            <p className="text-sm font-semibold text-red-500">
              {data.holders.filter((h) => h.quarterlyChange < 0).length}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Unchanged</p>
            <p className="text-sm font-semibold text-muted-foreground">
              {data.holders.filter((h) => h.quarterlyChange === 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-3 font-medium">Institution</th>
              <th className="text-right p-3 font-medium">Shares</th>
              <th className="text-right p-3 font-medium">Value</th>
              <th className="text-right p-3 font-medium">% Outstanding</th>
              <th className="text-right p-3 font-medium">Qtr Chg</th>
              <th className="text-center p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.holders.map((holder, i) => {
              const action = getAction(holder.quarterlyChange);
              return (
                <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{holder.name}</td>
                  <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">
                    {formatShares(holder.shares)}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">
                    {formatValue(holder.value)}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {holder.pctOutstanding}%
                  </td>
                  <td
                    className={cn(
                      "p-3 text-right font-mono tabular-nums font-medium",
                      holder.quarterlyChange > 0
                        ? "text-emerald-500"
                        : holder.quarterlyChange < 0
                          ? "text-red-500"
                          : "text-muted-foreground",
                    )}
                  >
                    {holder.quarterlyChange > 0 ? "+" : ""}
                    {holder.quarterlyChange}%
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", action.cls)}>
                      {action.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Options Flow Tab ─────────────────────────────────────────────────────────

function OptionsFlowTab({ ticker, currentPrice }: { ticker: string; currentPrice: number }) {
  const [typeFilter, setTypeFilter] = useState<"all" | "call" | "put">("all");
  const [sentFilter, setSentFilter] = useState<"all" | "bullish" | "bearish">("all");

  const flows = useMemo(
    () => generateOptionsFlow(ticker, currentPrice || 150, 0.3),
    [ticker, currentPrice],
  );

  const filtered = useMemo(() => {
    return flows.filter((f) => {
      if (typeFilter !== "all" && f.type !== typeFilter) return false;
      if (sentFilter !== "all" && f.sentiment !== sentFilter) return false;
      return true;
    });
  }, [flows, typeFilter, sentFilter]);

  function formatPremium(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }

  const WHALE_THRESHOLD = 500_000;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Type:</span>
          {(["all", "call", "put"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded capitalize transition-colors",
                typeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Sentiment:</span>
          {(["all", "bullish", "bearish"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setSentFilter(f)}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded capitalize transition-colors",
                sentFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {filtered.length} trades
        </span>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[680px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-3 font-medium">Ticker</th>
              <th className="text-left p-3 font-medium">Expiry</th>
              <th className="text-right p-3 font-medium">Strike</th>
              <th className="text-center p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Volume</th>
              <th className="text-right p-3 font-medium">OI</th>
              <th className="text-right p-3 font-medium">IV</th>
              <th className="text-right p-3 font-medium">Premium</th>
              <th className="text-center p-3 font-medium">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map((flow, i) => {
              const totalPremium = flow.premium * flow.size * 100;
              const isWhale = totalPremium >= WHALE_THRESHOLD;
              return (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors",
                    isWhale && "bg-amber-500/[0.04]",
                  )}
                >
                  <td className="p-3 font-mono font-semibold">
                    <div className="flex items-center gap-1.5">
                      {isWhale && (
                        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded">
                          WHALE
                        </span>
                      )}
                      {ticker}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{flow.expiry}</td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    ${flow.strike.toFixed(0)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        flow.type === "call"
                          ? "text-emerald-500 bg-emerald-500/10"
                          : "text-red-500 bg-red-500/10",
                      )}
                    >
                      {flow.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {flow.size.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">
                    {(flow.size * (1 + Math.random() * 3)).toFixed(0)}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {(flow.iv * 100).toFixed(0)}%
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums font-medium">
                    {formatPremium(totalPremium)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize",
                        flow.sentiment === "bullish"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : flow.sentiment === "bearish"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {flow.sentiment}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Crypto Tab ───────────────────────────────────────────────────────────────

interface CryptoAsset {
  symbol: string;
  name: string;
  basePrice: number;
  seed: number;
  mcapB: number; // market cap in billions
}

const CRYPTO_ASSETS: CryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", basePrice: 67200, seed: 3001, mcapB: 1321 },
  { symbol: "ETH", name: "Ethereum", basePrice: 3480, seed: 3002, mcapB: 418 },
  { symbol: "SOL", name: "Solana", basePrice: 172, seed: 3003, mcapB: 77 },
  { symbol: "ADA", name: "Cardano", basePrice: 0.48, seed: 3004, mcapB: 17 },
  { symbol: "DOT", name: "Polkadot", basePrice: 7.8, seed: 3005, mcapB: 11 },
  { symbol: "AVAX", name: "Avalanche", basePrice: 38.5, seed: 3006, mcapB: 16 },
  { symbol: "LINK", name: "Chainlink", basePrice: 14.2, seed: 3007, mcapB: 8.3 },
  { symbol: "UNI", name: "Uniswap", basePrice: 10.4, seed: 3008, mcapB: 6.2 },
  { symbol: "AAVE", name: "Aave", basePrice: 98.5, seed: 3009, mcapB: 1.4 },
  { symbol: "MATIC", name: "Polygon", basePrice: 0.72, seed: 3010, mcapB: 7.1 },
];

function FearGreedGauge({ value }: { value: number }) {
  // Semicircle gauge, pure SVG
  const angle = (value / 100) * 180; // 0..180 degrees
  const r = 60;
  const cx = 80;
  const cy = 80;
  // arc from 180deg to 0deg (left to right)
  function polarToCartesian(angleDeg: number) {
    const rad = ((180 - angleDeg) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    };
  }
  const start = polarToCartesian(0);
  const end = polarToCartesian(180);
  const needle = polarToCartesian(angle);

  const label =
    value < 20
      ? "Extreme Fear"
      : value < 40
        ? "Fear"
        : value < 60
          ? "Neutral"
          : value < 80
            ? "Greed"
            : "Extreme Greed";

  const labelColor =
    value < 40 ? "text-red-500" : value < 60 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <h3 className="text-sm font-semibold">Fear &amp; Greed Index</h3>
      <div className="flex flex-col items-center gap-1">
        <svg width="160" height="90" viewBox="0 0 160 90">
          {/* Background arc */}
          <path
            d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
            fill="none"
            stroke="rgb(63 63 70 / 0.5)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Fear zone: red */}
          <path
            d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${polarToCartesian(60).x} ${polarToCartesian(60).y}`}
            fill="none"
            stroke="rgb(239,68,68,0.7)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Neutral zone: amber */}
          <path
            d={`M ${polarToCartesian(60).x} ${polarToCartesian(60).y} A ${r} ${r} 0 0 1 ${polarToCartesian(120).x} ${polarToCartesian(120).y}`}
            fill="none"
            stroke="rgb(234,179,8,0.7)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Greed zone: green */}
          <path
            d={`M ${polarToCartesian(120).x} ${polarToCartesian(120).y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
            fill="none"
            stroke="rgb(16,185,129,0.7)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needle.x}
            y2={needle.y}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="4" fill="white" />
          {/* Value text */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-foreground"
            fontSize="18"
            fontWeight="bold"
            fill="currentColor"
          >
            {value}
          </text>
        </svg>
        <span className={cn("text-xs font-semibold", labelColor)}>{label}</span>
      </div>
    </div>
  );
}

function CryptoTab() {
  const rand = seededRandom(4444 + Math.floor(Date.now() / 86400000));
  const assets = CRYPTO_ASSETS.map((asset) => {
    const assetRand = seededRandom(asset.seed + Math.floor(Date.now() / 86400000));
    const change24h = (assetRand() - 0.45) * 12;
    const price = asset.basePrice * (1 + change24h / 100);
    const vol24hB = asset.mcapB * (0.03 + assetRand() * 0.05);
    return { ...asset, price, change24h, vol24hB };
  });

  const fearGreed = Math.floor(30 + rand() * 55); // 30..85
  const btcDominance = 52 + rand() * 8; // 52..60%

  const formatPrice = (p: number) =>
    p >= 1000
      ? `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : p >= 1
        ? `$${p.toFixed(2)}`
        : `$${p.toFixed(4)}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FearGreedGauge value={fearGreed} />

        {/* BTC Dominance */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">BTC Dominance</h3>
          <div className="flex items-end gap-2">
            <span className="font-mono tabular-nums text-2xl font-bold">
              {btcDominance.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground mb-1">of total crypto market cap</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${btcDominance}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Crypto table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-3 font-medium">#</th>
              <th className="text-left p-3 font-medium">Asset</th>
              <th className="text-right p-3 font-medium">Price</th>
              <th className="text-right p-3 font-medium">24h %</th>
              <th className="text-right p-3 font-medium">Volume 24h</th>
              <th className="text-right p-3 font-medium">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, i) => (
              <tr key={asset.symbol} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-3 text-muted-foreground">{i + 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground w-14">{asset.symbol}</span>
                    <span className="text-muted-foreground text-[10px]">{asset.name}</span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono tabular-nums font-medium">
                  {formatPrice(asset.price)}
                </td>
                <td
                  className={cn(
                    "p-3 text-right font-mono tabular-nums font-semibold",
                    asset.change24h >= 0 ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {asset.change24h >= 0 ? "+" : ""}
                  {asset.change24h.toFixed(2)}%
                </td>
                <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">
                  ${asset.vol24hB.toFixed(2)}B
                </td>
                <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">
                  ${asset.mcapB.toFixed(1)}B
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Macro Tab ────────────────────────────────────────────────────────────────

function MacroTab() {
  return <MacroDashboard />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketIntelligencePage() {
  useMarketData();

  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const currentTicker = useChartStore((s) => s.currentTicker);
  const setTicker = useChartStore((s) => s.setTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const currentPrice = useMemo(() => {
    if (allData.length === 0 || revealedCount === 0) return 0;
    return allData[Math.min(revealedCount - 1, allData.length - 1)]?.close ?? 0;
  }, [allData, revealedCount]);

  const handleSelectTicker = useCallback(
    (ticker: string) => {
      setTicker(ticker);
    },
    [setTicker],
  );

  return (
    <div className="flex flex-col gap-0 max-w-[1400px] mx-auto">
      {/* Top bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 pt-4 pb-3 border-b border-border/40">
        <div>
          <h1 className="text-lg font-semibold">Market Terminal</h1>
          <p className="text-xs text-muted-foreground">
            Bloomberg-style market intelligence &amp; data
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MarketStatusBadge />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ticker:</span>
            <select
              value={currentTicker}
              onChange={(e) => setTicker(e.target.value)}
              aria-label="Select ticker"
              className="text-xs font-mono bg-muted border rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {WATCHLIST_STOCKS.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker}
                </option>
              ))}
            </select>
            {currentPrice > 0 && (
              <span className="font-mono tabular-nums text-sm font-semibold">
                ${currentPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="Market sections" className="flex items-center gap-0 border-b border-border/40 overflow-x-auto px-4 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "watchlist" && (
          <div className="max-w-sm">
            <WatchlistPanel />
          </div>
        )}
        {activeTab === "news" && <NewsTab ticker={currentTicker} />}
        {activeTab === "screener" && <ScreenerTab onSelectTicker={handleSelectTicker} />}
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "insider" && <InsiderTab ticker={currentTicker} />}
        {activeTab === "institutional" && <InstitutionalTab ticker={currentTicker} />}
        {activeTab === "options-flow" && (
          <OptionsFlowTab ticker={currentTicker} currentPrice={currentPrice} />
        )}
        {activeTab === "crypto" && <CryptoTab />}
        {activeTab === "macro" && <MacroTab />}
      </div>
    </div>
  );
}
