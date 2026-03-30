"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// ── PRNG ───────────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Instrument {
  symbol: string;
  name: string;
  price: number;
  change: number;    // absolute
  changePct: number; // percent
  sparkline: number[]; // 20 points
}

type MarketTabId = "us" | "futures" | "forex" | "crypto";

// ── Instrument definitions ─────────────────────────────────────────────────────

const US_EQUITIES = [
  { symbol: "SPY",   name: "S&P 500 ETF",       basePrice: 548.20 },
  { symbol: "QQQ",   name: "Nasdaq 100 ETF",     basePrice: 472.55 },
  { symbol: "DIA",   name: "Dow Jones ETF",      basePrice: 399.10 },
  { symbol: "IWM",   name: "Russell 2000 ETF",   basePrice: 207.40 },
  { symbol: "VIX",   name: "CBOE Volatility",    basePrice: 17.85 },
  { symbol: "AAPL",  name: "Apple Inc.",          basePrice: 189.30 },
  { symbol: "MSFT",  name: "Microsoft Corp.",     basePrice: 424.80 },
  { symbol: "NVDA",  name: "NVIDIA Corp.",        basePrice: 875.60 },
  { symbol: "TSLA",  name: "Tesla Inc.",          basePrice: 178.90 },
  { symbol: "AMZN",  name: "Amazon.com Inc.",     basePrice: 192.20 },
];

const FUTURES = [
  { symbol: "ES=F",  name: "S&P 500 Futures",    basePrice: 5485.25 },
  { symbol: "NQ=F",  name: "Nasdaq Futures",      basePrice: 19320.50 },
  { symbol: "YM=F",  name: "Dow Futures",         basePrice: 40140.00 },
  { symbol: "RTY=F", name: "Russell Futures",     basePrice: 2070.80 },
  { symbol: "CL=F",  name: "Crude Oil WTI",       basePrice: 81.55 },
  { symbol: "GC=F",  name: "Gold",                basePrice: 2350.40 },
  { symbol: "SI=F",  name: "Silver",              basePrice: 28.15 },
  { symbol: "NG=F",  name: "Natural Gas",         basePrice: 2.84 },
  { symbol: "ZC=F",  name: "Corn",                basePrice: 450.75 },
  { symbol: "ZW=F",  name: "Wheat",               basePrice: 562.25 },
];

const FOREX = [
  { symbol: "EURUSD", name: "Euro / US Dollar",       basePrice: 1.0842 },
  { symbol: "GBPUSD", name: "Pound / US Dollar",      basePrice: 1.2634 },
  { symbol: "USDJPY", name: "US Dollar / Yen",        basePrice: 151.78 },
  { symbol: "AUDUSD", name: "Australian / US Dollar", basePrice: 0.6491 },
  { symbol: "USDCAD", name: "US Dollar / CAD",        basePrice: 1.3558 },
  { symbol: "USDCHF", name: "US Dollar / CHF",        basePrice: 0.9012 },
  { symbol: "NZDUSD", name: "New Zealand / US Dollar",basePrice: 0.5998 },
  { symbol: "USDCNY", name: "US Dollar / CNY",        basePrice: 7.2341 },
  { symbol: "USDINR", name: "US Dollar / INR",        basePrice: 83.47 },
  { symbol: "USDMXN", name: "US Dollar / MXN",        basePrice: 17.13 },
];

const CRYPTO = [
  { symbol: "BTC",   name: "Bitcoin",        basePrice: 67420.00 },
  { symbol: "ETH",   name: "Ethereum",       basePrice: 3580.50 },
  { symbol: "BNB",   name: "BNB Chain",      basePrice: 594.20 },
  { symbol: "SOL",   name: "Solana",         basePrice: 175.80 },
  { symbol: "XRP",   name: "XRP",            basePrice: 0.5421 },
  { symbol: "DOGE",  name: "Dogecoin",       basePrice: 0.1824 },
  { symbol: "ADA",   name: "Cardano",        basePrice: 0.4952 },
  { symbol: "AVAX",  name: "Avalanche",      basePrice: 38.90 },
  { symbol: "LINK",  name: "Chainlink",      basePrice: 17.65 },
  { symbol: "DOT",   name: "Polkadot",       basePrice: 7.82 },
];

// ── Data generation ────────────────────────────────────────────────────────────

function generateInstruments(
  defs: { symbol: string; name: string; basePrice: number }[],
  seedOffset: number,
): Instrument[] {
  const daySeed = Math.floor(Date.now() / 86400000) + seedOffset;
  const rng = mulberry32(daySeed);

  return defs.map((def) => {
    // Daily change: -4% to +4%, slightly biased positive
    const changePct = (rng() - 0.48) * 8;
    const change = def.basePrice * (changePct / 100);
    const price = def.basePrice + change;

    // Sparkline: 20 intraday price ticks
    const spark: number[] = [];
    let cur = def.basePrice - change * 0.6;
    for (let i = 0; i < 20; i++) {
      cur += (rng() - 0.5) * def.basePrice * 0.004;
      spark.push(cur);
    }
    // End at final price
    spark[spark.length - 1] = price;

    return {
      symbol: def.symbol,
      name: def.name,
      price,
      change,
      changePct,
      sparkline: spark,
    };
  });
}

// ── Sparkline SVG ──────────────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const W = 60;
  const H = 28;
  const pad = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = positive ? "#22c55e" : "#ef4444";

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
    </svg>
  );
}

// ── Instrument row ─────────────────────────────────────────────────────────────

function formatPrice(price: number, symbol: string): string {
  if (price >= 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(4);
}

function InstrumentRow({ inst }: { inst: Instrument }) {
  const positive = inst.changePct >= 0;
  const colorClass = positive ? "text-green-500" : "text-red-500";

  return (
    <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
      <td className="py-2 pl-3 pr-2 w-[72px]">
        <span className="font-mono text-xs font-semibold text-foreground">{inst.symbol}</span>
      </td>
      <td className="py-2 pr-2 text-[11px] text-muted-foreground hidden sm:table-cell max-w-[140px] truncate">
        {inst.name}
      </td>
      <td className="py-2 pr-2 text-right">
        <span className="font-mono text-xs font-semibold tabular-nums">
          {formatPrice(inst.price, inst.symbol)}
        </span>
      </td>
      <td className={cn("py-2 pr-2 text-right font-mono text-[11px] tabular-nums", colorClass)}>
        {positive ? "+" : ""}{inst.change >= 10000
          ? inst.change.toFixed(0)
          : inst.change >= 1
            ? inst.change.toFixed(2)
            : inst.change.toFixed(4)}
      </td>
      <td className={cn("py-2 pr-2 text-right", colorClass)}>
        <span
          className={cn(
            "font-mono text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded",
            positive ? "bg-green-500/10" : "bg-red-500/10"
          )}
        >
          {positive ? "+" : ""}{inst.changePct.toFixed(2)}%
        </span>
      </td>
      <td className="py-1 pr-3 text-right">
        <Sparkline data={inst.sparkline} positive={positive} />
      </td>
    </tr>
  );
}

// ── Tab definitions ────────────────────────────────────────────────────────────

interface TabDef {
  id: MarketTabId;
  label: string;
  defs: { symbol: string; name: string; basePrice: number }[];
  seedOffset: number;
}

const TABS: TabDef[] = [
  { id: "us",      label: "US Equities", defs: US_EQUITIES, seedOffset: 1001 },
  { id: "futures", label: "Futures",     defs: FUTURES,     seedOffset: 2003 },
  { id: "forex",   label: "Forex",       defs: FOREX,       seedOffset: 3007 },
  { id: "crypto",  label: "Crypto",      defs: CRYPTO,      seedOffset: 4011 },
];

// ── Main component ─────────────────────────────────────────────────────────────

export function GlobalMarkets() {
  const [activeTab, setActiveTab] = useState<MarketTabId>("us");

  const instrumentsByTab = useMemo(() => {
    const result: Record<MarketTabId, Instrument[]> = {} as Record<MarketTabId, Instrument[]>;
    for (const tab of TABS) {
      result[tab.id] = generateInstruments(tab.defs, tab.seedOffset);
    }
    return result;
  }, []);

  const instruments = instrumentsByTab[activeTab];

  const advancing = instruments.filter((i) => i.changePct >= 0).length;
  const declining = instruments.length - advancing;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold">Global Markets</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Live quotes — seeded by date</p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-green-500 font-mono font-medium">{advancing} adv</span>
          <span className="text-red-500 font-mono font-medium">{declining} dec</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2 text-[11px] font-medium transition-colors",
              activeTab === tab.id
                ? "text-foreground border-b-2 border-primary -mb-px bg-muted/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50">
              <th className="py-1.5 pl-3 pr-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-[72px]">Symbol</th>
              <th className="py-1.5 pr-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Name</th>
              <th className="py-1.5 pr-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">Price</th>
              <th className="py-1.5 pr-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">Chg</th>
              <th className="py-1.5 pr-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">%Chg</th>
              <th className="py-1.5 pr-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">7D</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map((inst) => (
              <InstrumentRow key={inst.symbol} inst={inst} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border/40 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">Simulated data — for educational purposes</span>
        <span className="text-[9px] text-muted-foreground font-mono">{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ET</span>
      </div>
    </div>
  );
}
