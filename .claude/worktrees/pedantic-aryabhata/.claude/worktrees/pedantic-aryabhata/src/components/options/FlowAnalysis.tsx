"use client";

import { useState, useEffect, useRef, useId, useCallback } from "react";
import { cn } from "@/lib/utils";

// ── TypeScript Interfaces ─────────────────────────────────────────────────────

type FlowSentiment = "Bullish" | "Bearish" | "Neutral";
type FlowSide = "Buy" | "Sell";
type FlowType = "Call" | "Put";

interface FlowOrder {
 id: string;
 ticker: string;
 type: FlowType;
 strike: number;
 expiry: string;
 size: number; // contracts
 premium: number; // dollars
 side: FlowSide;
 exchange: string;
 sentiment: FlowSentiment;
 timestamp: number; // ms epoch
 isUnusual: boolean;
}

interface DarkPoolPrint {
 id: string;
 ticker: string;
 size: number; // shares
 price: number;
 bid: number;
 ask: number;
 diffLabel: "Above Ask" | "Below Bid" | "At Mid";
 diffPct: number;
 notional: number; // USD
 timestamp: number;
}

interface PcRatioPoint {
 day: number; // 0 = 30 days ago, 29 = today
 value: number; // put/call ratio
}

interface TickerPcRatio {
 ticker: string;
 ratio: number;
 callVol: number;
 putVol: number;
 largeBullish: number; // >$250K call flow
 largeBearish: number; // >$250K put flow
 retailBullish: number; // <$50K call flow
 retailBearish: number; // <$50K put flow
}

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
 let s = seed;
 return () => {
 s |= 0;
 s = (s + 0x6d2b79f5) | 0;
 let t = Math.imul(s ^ (s >>> 15), 1 | s);
 t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TICKERS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOG", "META", "JPM", "SPY", "QQQ"];
const PC_TICKERS = ["AAPL", "MSFT", "SPY", "QQQ", "TSLA", "NVDA", "AMZN", "META"];
const EXCHANGES = ["CBOE", "NYSE Arca", "MIAX", "ISE", "PHLX", "BOX", "C2", "EDGX"];
const BASE_PRICES: Record<string, number> = {
 AAPL: 182, MSFT: 415, NVDA: 875, TSLA: 245, AMZN: 196,
 GOOG: 172, META: 510, JPM: 210, SPY: 520, QQQ: 445,
};
const EXPIRIES = ["2026-04-17", "2026-04-24", "2026-05-16", "2026-06-20", "2026-09-19", "2026-12-18"];

// ── Data Generators ───────────────────────────────────────────────────────────

function generateFlowOrders(seed: number, count = 30): FlowOrder[] {
 const rand = mulberry32(seed);
 const now = Date.now();
 const orders: FlowOrder[] = [];

 for (let i = 0; i < count; i++) {
 const ticker = TICKERS[Math.floor(rand() * TICKERS.length)];
 const basePrice = BASE_PRICES[ticker] ?? 100;
 const type: FlowType = rand() < 0.52 ? "Call" : "Put";
 const strikeOffset = (Math.floor(rand() * 11) - 5) * 5;
 const strike = Math.round(basePrice + strikeOffset);
 const expiry = EXPIRIES[Math.floor(rand() * EXPIRIES.length)];
 const size = Math.floor(50 + rand() * 1450);
 const contractPremium = 0.5 + rand() * 15;
 const premium = Math.round(size * contractPremium * 100);
 const side: FlowSide = rand() < 0.55 ? "Buy" : "Sell";
 const exchange = EXCHANGES[Math.floor(rand() * EXCHANGES.length)];

 // Sentiment logic
 let sentiment: FlowSentiment;
 if (type === "Call" && side === "Buy") sentiment = "Bullish";
 else if (type === "Put" && side === "Buy") sentiment = "Bearish";
 else if (type === "Call" && side === "Sell") sentiment = rand() < 0.5 ? "Neutral" : "Bearish";
 else sentiment = rand() < 0.5 ? "Neutral" : "Bullish";

 const isUnusual = premium > 500_000 || size > 500;

 orders.push({
 id: `flow-${seed}-${i}`,
 ticker,
 type,
 strike,
 expiry,
 size,
 premium,
 side,
 exchange,
 sentiment,
 timestamp: now - Math.floor(rand() * 4 * 60 * 60 * 1000),
 isUnusual,
 });
 }

 return orders.sort((a, b) => b.premium - a.premium);
}

function generateDarkPoolPrints(seed: number, count = 20): DarkPoolPrint[] {
 const rand = mulberry32(seed + 999);
 const now = Date.now();
 const prints: DarkPoolPrint[] = [];

 for (let i = 0; i < count; i++) {
 const ticker = TICKERS[Math.floor(rand() * TICKERS.length)];
 const basePrice = BASE_PRICES[ticker] ?? 100;
 const spread = basePrice * 0.001;
 const mid = basePrice * (0.98 + rand() * 0.04);
 const bid = +(mid - spread).toFixed(2);
 const ask = +(mid + spread).toFixed(2);

 const r = rand();
 let price: number;
 let diffLabel: DarkPoolPrint["diffLabel"];
 if (r < 0.38) {
 price = +(ask + ask * rand() * 0.003).toFixed(2);
 diffLabel = "Above Ask";
 } else if (r < 0.72) {
 price = +(bid - bid * rand() * 0.003).toFixed(2);
 diffLabel = "Below Bid";
 } else {
 price = +(bid + (ask - bid) * rand()).toFixed(2);
 diffLabel = "At Mid";
 }

 const diffPct = +((price - mid) / mid * 100).toFixed(3);
 const sizeOptions = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000];
 const size = sizeOptions[Math.floor(rand() * sizeOptions.length)];
 const notional = Math.round(size * price);

 prints.push({
 id: `dp-fa-${seed}-${i}`,
 ticker,
 size,
 price,
 bid,
 ask,
 diffLabel,
 diffPct,
 notional,
 timestamp: now - Math.floor(rand() * 6 * 60 * 60 * 1000),
 });
 }

 return prints.sort((a, b) => b.timestamp - a.timestamp);
}

function generatePcHistory(seed: number): PcRatioPoint[] {
 const rand = mulberry32(seed + 555);
 const points: PcRatioPoint[] = [];
 let val = 0.85 + rand() * 0.3;
 for (let i = 0; i < 30; i++) {
 val = Math.max(0.4, Math.min(2.2, val + (rand() - 0.5) * 0.15));
 points.push({ day: i, value: +val.toFixed(3) });
 }
 return points;
}

function generateTickerPcRatios(seed: number): TickerPcRatio[] {
 const rand = mulberry32(seed + 111);
 return PC_TICKERS.map((ticker) => {
 const callVol = Math.floor(5000 + rand() * 95000);
 const putVol = Math.floor(3000 + rand() * 80000);
 const ratio = +(putVol / callVol).toFixed(3);
 return {
 ticker,
 ratio,
 callVol,
 putVol,
 largeBullish: Math.floor(rand() * 20),
 largeBearish: Math.floor(rand() * 15),
 retailBullish: Math.floor(rand() * 200),
 retailBearish: Math.floor(rand() * 180),
 };
 });
}

// ── Format helpers ─────────────────────────────────────────────────────────────

function fmtPremium(n: number): string {
 if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
 if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
 return `$${n.toFixed(0)}`;
}

function fmtShares(n: number): string {
 if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
 if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
 return n.toLocaleString();
}

function fmtNotional(n: number): string {
 if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
 if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
 return `$${(n / 1_000).toFixed(0)}K`;
}

function relTime(ts: number): string {
 const mins = Math.floor((Date.now() - ts) / 60000);
 if (mins < 1) return "just now";
 if (mins < 60) return `${mins}m ago`;
 return `${Math.floor(mins / 60)}h ago`;
}

function fmtExpiry(e: string): string {
 return e.slice(5);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ToggleButton({
 active,
 onClick,
 children,
}: {
 active: boolean;
 onClick: () => void;
 children: React.ReactNode;
}) {
 return (
 <button
 onClick={onClick}
 className={cn(
 "rounded px-2 py-1 text-xs font-medium transition-colors",
 active
 ? "border border-orange-500/30 bg-orange-500/15 text-orange-400"
 : "text-muted-foreground hover:text-foreground",
 )}
 >
 {children}
 </button>
 );
}

// ── Section 1: Live Options Flow Feed ─────────────────────────────────────────

type FlowFilter = "All" | "Calls" | "Puts" | "Unusual" | ">$1M";

interface LiveFlowFeedProps {
 baseOrders: FlowOrder[];
 onTickerExpiry?: (ticker: string, expiry: string) => void;
}

function LiveFlowFeed({ baseOrders, onTickerExpiry }: LiveFlowFeedProps) {
 const [filter, setFilter] = useState<FlowFilter>("All");
 const [orders, setOrders] = useState<FlowOrder[]>(baseOrders);
 const counterRef = useRef(0);
 const randRef = useRef(mulberry32(8765));

 // 5-second synthetic new order injection
 useEffect(() => {
 const interval = setInterval(() => {
 counterRef.current += 1;
 const rand = randRef.current;
 const ticker = TICKERS[Math.floor(rand() * TICKERS.length)];
 const basePrice = BASE_PRICES[ticker] ?? 100;
 const type: FlowType = rand() < 0.52 ? "Call" : "Put";
 const strike = Math.round(basePrice + (Math.floor(rand() * 11) - 5) * 5);
 const expiry = EXPIRIES[Math.floor(rand() * EXPIRIES.length)];
 const size = Math.floor(50 + rand() * 1450);
 const premium = Math.round(size * (0.5 + rand() * 15) * 100);
 const side: FlowSide = rand() < 0.55 ? "Buy" : "Sell";
 const exchange = EXCHANGES[Math.floor(rand() * EXCHANGES.length)];
 let sentiment: FlowSentiment;
 if (type === "Call" && side === "Buy") sentiment = "Bullish";
 else if (type === "Put" && side === "Buy") sentiment = "Bearish";
 else sentiment = "Neutral";

 const newOrder: FlowOrder = {
 id: `live-${Date.now()}-${counterRef.current}`,
 ticker, type, strike, expiry, size, premium, side, exchange, sentiment,
 timestamp: Date.now(),
 isUnusual: premium > 500_000 || size > 500,
 };

 setOrders((prev) => [newOrder, ...prev].slice(0, 60));
 }, 5000);

 return () => clearInterval(interval);
 }, []);

 const filtered = orders.filter((o) => {
 if (filter === "Calls") return o.type === "Call";
 if (filter === "Puts") return o.type === "Put";
 if (filter === "Unusual") return o.isUnusual;
 if (filter === ">$1M") return o.premium > 1_000_000;
 return true;
 });

 const filterOptions: FlowFilter[] = ["All", "Calls", "Puts", "Unusual", ">$1M"];

 return (
 <div className="flex flex-col">
 {/* Filter bar */}
 <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-3 py-1.5">
 <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
 {filterOptions.map((f) => (
 <ToggleButton key={f} active={filter === f} onClick={() => setFilter(f)}>
 {f}
 </ToggleButton>
 ))}
 </div>
 <span className="ml-auto text-xs text-muted-foreground">
 {filtered.length} orders · auto-refreshes
 </span>
 </div>

 {/* Table */}
 <div className="overflow-auto">
 <table className="w-full border-collapse text-[11px]">
 <thead className="sticky top-0 z-10 bg-card">
 <tr className="border-b border-border">
 {[
 { col: "Time", align: "text-left" },
 { col: "Ticker", align: "text-left" },
 { col: "Type", align: "text-left" },
 { col: "Strike", align: "text-right" },
 { col: "Expiry", align: "text-right" },
 { col: "Size", align: "text-right" },
 { col: "Premium", align: "text-right" },
 { col: "Side", align: "text-left" },
 { col: "Exchange", align: "text-left" },
 { col: "Sentiment", align: "text-left" },
 ].map(
 ({ col, align }, i) => (
 <th
 key={`${col}-${i}`}
 className={cn("px-3 py-2 text-[11px] font-medium text-muted-foreground", align)}
 >
 {col}
 </th>
 ),
 )}
 </tr>
 </thead>
 <tbody>
 {filtered.map((order) => {
 const isCall = order.type === "Call";
 const isBull = order.sentiment === "Bullish";
 const isBear = order.sentiment === "Bearish";
 return (
 <tr
 key={order.id}
 onClick={() => onTickerExpiry?.(order.ticker, order.expiry)}
 className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
 >
 <td className="px-3 py-2 text-muted-foreground">{relTime(order.timestamp)}</td>
 <td className="px-3 py-2 font-medium">{order.ticker}</td>
 <td className={cn("px-3 py-2 font-medium", isCall ? "text-emerald-500" : "text-red-500")}>
 {order.type}
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums">${order.strike}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{fmtExpiry(order.expiry)}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums">{order.size.toLocaleString()}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums font-medium text-orange-400">
 {fmtPremium(order.premium)}
 {order.isUnusual && (
 <span className="ml-1 rounded bg-amber-500/20 px-1 py-0.5 text-[11px] font-semibold text-amber-400">
 UNUSUAL
 </span>
 )}
 </td>
 <td className={cn("px-3 py-2 font-medium", order.side === "Buy" ? "text-emerald-500" : "text-red-500")}>
 {order.side}
 </td>
 <td className="px-3 py-2 text-muted-foreground">{order.exchange}</td>
 <td className="px-3 py-2">
 <span
 className={cn(
 "font-medium",
 isBull ? "text-emerald-500" : isBear ? "text-red-500" : "text-muted-foreground",
 )}
 >
 <span className="mr-0.5 text-[11px]">●</span>
 {order.sentiment}
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

// ── Section 2: Ticker Heatmap ──────────────────────────────────────────────────

interface TickerHeatmapProps {
 orders: FlowOrder[];
 onFilter?: (ticker: string, expiry: string) => void;
}

function TickerHeatmap({ orders, onFilter }: TickerHeatmapProps) {
 const uid = useId();
 const [tooltip, setTooltip] = useState<{
 x: number; y: number; ticker: string; expiry: string;
 callFlow: number; putFlow: number; vol: number;
 } | null>(null);

 const expiries = EXPIRIES.slice(0, 4);

 // Build grid: net call premium - put premium per cell
 type Cell = { callFlow: number; putFlow: number; net: number; vol: number };
 const grid: Record<string, Record<string, Cell>> = {};
 for (const t of TICKERS) {
 grid[t] = {};
 for (const e of expiries) grid[t][e] = { callFlow: 0, putFlow: 0, net: 0, vol: 0 };
 }

 for (const o of orders) {
 const cell = grid[o.ticker]?.[o.expiry];
 if (!cell) continue;
 const flow = o.side === "Buy" ? o.premium : -o.premium;
 if (o.type === "Call") cell.callFlow += flow;
 else cell.putFlow += flow;
 cell.vol += o.size;
 }

 let maxAbs = 1;
 let maxVol = 1;
 for (const t of TICKERS) for (const e of expiries) {
 const c = grid[t][e];
 c.net = c.callFlow + c.putFlow;
 if (Math.abs(c.net) > maxAbs) maxAbs = Math.abs(c.net);
 if (c.vol > maxVol) maxVol = c.vol;
 }

 function cellFill(net: number, vol: number): string {
 const vRatio = Math.min(1, vol / maxVol);
 const nRatio = Math.min(1, Math.abs(net) / maxAbs);
 const alpha = 0.08 + nRatio * 0.65;
 const sizeBoost = 0.7 + vRatio * 0.3;
 if (net > 100) return `rgba(52,211,153,${(alpha * sizeBoost).toFixed(2)})`;
 if (net < -100) return `rgba(251,113,133,${(alpha * sizeBoost).toFixed(2)})`;
 return "rgba(100,100,100,0.10)";
 }

 const ML = 52, MT = 28, COL_W = 72, ROW_H = 26;
 const svgW = ML + expiries.length * COL_W + 4;
 const svgH = MT + TICKERS.length * ROW_H + 32;

 return (
 <div className="relative overflow-visible">
 <svg
 width="100%"
 viewBox={`0 0 ${svgW} ${svgH}`}
 className="overflow-visible"
 onMouseLeave={() => setTooltip(null)}
 >
 <defs>
 <linearGradient id={`${uid}-hm-legend`} x1="0" x2="1" y1="0" y2="0">
 <stop offset="0%" stopColor="rgba(251,113,133,0.85)" />
 <stop offset="50%" stopColor="rgba(100,100,100,0.2)" />
 <stop offset="100%" stopColor="rgba(52,211,153,0.85)" />
 </linearGradient>
 </defs>

 {/* Expiry column headers */}
 {expiries.map((e, ci) => (
 <text key={e} x={ML + ci * COL_W + COL_W / 2} y={MT - 8}
 textAnchor="middle" fontSize={9} className="fill-muted-foreground">
 {fmtExpiry(e)}
 </text>
 ))}

 {/* Rows */}
 {TICKERS.map((ticker, ri) => {
 const rowY = MT + ri * ROW_H;
 return (
 <g key={ticker}>
 <text x={ML - 4} y={rowY + ROW_H / 2 + 4}
 textAnchor="end" fontSize={9} className="fill-muted-foreground">
 {ticker}
 </text>
 {expiries.map((expiry, ci) => {
 const cell = grid[ticker][expiry];
 const cx = ML + ci * COL_W + 2;
 const cy = rowY + 2;
 const cw = COL_W - 4;
 const ch = ROW_H - 4;
 const volRatio = maxVol > 0 ? Math.min(1, cell.vol / maxVol) : 0;
 const pad = ch * (1 - volRatio) * 0.3;
 return (
 <g
 key={expiry}
 className="cursor-pointer"
 onClick={() => onFilter?.(ticker, expiry)}
 onMouseEnter={(e) => {
 const rect = (e.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect();
 if (!rect) return;
 setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 8, ticker, expiry, callFlow: cell.callFlow, putFlow: cell.putFlow, vol: cell.vol });
 }}
 onMouseLeave={() => setTooltip(null)}
 >
 <rect x={cx} y={cy} width={cw} height={ch} fill="transparent" />
 <rect
 x={cx + pad} y={cy + pad}
 width={Math.max(4, cw - pad * 2)} height={Math.max(4, ch - pad * 2)}
 rx={3}
 fill={cellFill(cell.net, cell.vol)}
 stroke="rgba(255,255,255,0.06)" strokeWidth={0.5}
 />
 </g>
 );
 })}
 </g>
 );
 })}

 {/* Legend */}
 <rect x={ML} y={MT + TICKERS.length * ROW_H + 4} width={140} height={8} rx={3}
 fill={`url(#${uid}-hm-legend)`} />
 <text x={ML} y={MT + TICKERS.length * ROW_H + 22} fontSize={8} className="fill-muted-foreground">Put flow</text>
 <text x={ML + 70} y={MT + TICKERS.length * ROW_H + 22} textAnchor="middle" fontSize={8} className="fill-muted-foreground">Neutral</text>
 <text x={ML + 140} y={MT + TICKERS.length * ROW_H + 22} textAnchor="end" fontSize={8} className="fill-muted-foreground">Call flow</text>
 </svg>

 {tooltip && (
 <div
 className="pointer-events-none absolute z-20 rounded-md border border-border bg-popover p-2"
 style={{ left: tooltip.x + 8, top: tooltip.y - 60, minWidth: 152 }}
 >
 <div className="mb-1 flex justify-between gap-3">
 <span className="text-[11px] font-semibold">{tooltip.ticker}</span>
 <span className="text-xs text-muted-foreground">{fmtExpiry(tooltip.expiry)}</span>
 </div>
 <div className="space-y-0.5 text-xs">
 <div className="flex justify-between gap-4">
 <span className="text-muted-foreground">Call flow</span>
 <span className={tooltip.callFlow >= 0 ? "text-emerald-400" : "text-red-400"}>
 {fmtPremium(Math.abs(tooltip.callFlow))}
 </span>
 </div>
 <div className="flex justify-between gap-4">
 <span className="text-muted-foreground">Put flow</span>
 <span className={tooltip.putFlow >= 0 ? "text-emerald-400" : "text-red-400"}>
 {fmtPremium(Math.abs(tooltip.putFlow))}
 </span>
 </div>
 <div className="flex justify-between gap-4 border-t border-border pt-0.5">
 <span className="text-muted-foreground">Volume</span>
 <span>{tooltip.vol.toLocaleString()} contracts</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

// ── Section 3: Dark Pool Prints ───────────────────────────────────────────────

interface DarkPoolSectionProps {
 prints: DarkPoolPrint[];
}

function DarkPoolSection({ prints }: DarkPoolSectionProps) {
 // Detect tickers with 3+ prints in last hour
 const now = Date.now();
 const oneHourAgo = now - 3_600_000;
 const recentByTicker: Record<string, number> = {};
 for (const p of prints) {
 if (p.timestamp >= oneHourAgo) {
 recentByTicker[p.ticker] = (recentByTicker[p.ticker] ?? 0) + 1;
 }
 }
 const alertTickers = Object.entries(recentByTicker)
 .filter(([, count]) => count >= 3)
 .map(([t]) => t);

 // Volume pct per ticker (synthetic: proportional to notional)
 const tickerNotional: Record<string, number> = {};
 let totalNotional = 0;
 for (const p of prints) {
 tickerNotional[p.ticker] = (tickerNotional[p.ticker] ?? 0) + p.notional;
 totalNotional += p.notional;
 }

 return (
 <div className="flex flex-col gap-3">
 {/* Alert banners */}
 {alertTickers.length > 0 && (
 <div className="flex flex-wrap gap-2 px-1">
 {alertTickers.map((t) => (
 <div
 key={t}
 className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs"
 >
 <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
 <span className="font-semibold text-amber-400">{t}</span>
 <span className="text-amber-400/70">
 {recentByTicker[t]} dark pool prints in 1h · {((tickerNotional[t] ?? 0) / totalNotional * 100).toFixed(1)}% of volume
 </span>
 </div>
 ))}
 </div>
 )}

 {/* Educational tooltip */}
 <details className="group rounded-md border border-border bg-card/30 px-3 py-2">
 <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground hover:text-foreground">
 <span className="mr-1 text-[11px] group-open:hidden">▶</span>
 <span className="mr-1 hidden text-[11px] group-open:inline">▼</span>
 What is dark pool trading?
 </summary>
 <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
 Dark pools are private exchanges where institutional investors trade large blocks of shares away from public markets.
 They avoid price impact — a 2M share buy order on a public exchange would move the price sharply before the trade completes.
 Prints <span className="text-emerald-400">above the ask</span> signal aggressive institutional buying;
 prints <span className="text-red-400">below the bid</span> signal aggressive selling.
 Cluster activity (3+ prints on one ticker within 1 hour) often precedes price moves.
 </p>
 </details>

 {/* Prints table */}
 <div className="overflow-auto">
 <table className="w-full border-collapse text-[11px]">
 <thead className="sticky top-0 z-10 bg-card">
 <tr className="border-b border-border">
 {[
 { col: "Time", align: "text-left" },
 { col: "Ticker", align: "text-left" },
 { col: "Size", align: "text-right" },
 { col: "Price", align: "text-right" },
 { col: "Bid", align: "text-right" },
 { col: "Ask", align: "text-right" },
 { col: "vs Mkt", align: "text-left" },
 { col: "Notional", align: "text-right" },
 { col: "Dark Vol%", align: "text-right" },
 ].map(({ col, align }) => (
 <th key={col} className={cn("px-3 py-2 text-[11px] font-medium text-muted-foreground", align)}>
 {col}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {prints.map((p) => {
 const isAbove = p.diffLabel === "Above Ask";
 const isBelow = p.diffLabel === "Below Bid";
 const darkVolPct = totalNotional > 0
 ? ((tickerNotional[p.ticker] ?? 0) / totalNotional * 100).toFixed(1)
 : "0.0";
 return (
 <tr
 key={p.id}
 className="border-b border-border transition-colors hover:bg-muted/50"
 >
 <td className="px-3 py-2 text-muted-foreground">{relTime(p.timestamp)}</td>
 <td className="px-3 py-2 font-medium">{p.ticker}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">{fmtShares(p.size)}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums">${p.price.toFixed(2)}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">${p.bid.toFixed(2)}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">${p.ask.toFixed(2)}</td>
 <td className="px-3 py-2">
 <span
 className={cn(
 "rounded px-1 py-0.5 text-[11px] font-medium",
 isAbove ? "bg-emerald-500/15 text-emerald-500"
 : isBelow ? "bg-red-500/15 text-red-500"
 : "bg-muted/30 text-muted-foreground",
 )}
 >
 {p.diffLabel}
 {p.diffPct !== 0 && ` ${p.diffPct > 0 ? "+" : ""}${p.diffPct.toFixed(2)}%`}
 </span>
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums font-medium text-orange-400">
 {fmtNotional(p.notional)}
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
 {darkVolPct}%
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

// ── Section 4: Put/Call Ratio Dashboard ──────────────────────────────────────

interface PcGaugeProps {
 value: number; // 0.5 to 2.0
}

function PcGauge({ value }: PcGaugeProps) {
 const uid = useId();
 // Map 0.5–2.0 to angle -135° to +135° (270° sweep)
 const MIN = 0.5, MAX = 2.0;
 const clampedVal = Math.max(MIN, Math.min(MAX, value));
 const pct = (clampedVal - MIN) / (MAX - MIN);
 const angleDeg = -135 + pct * 270;
 const angleRad = (angleDeg * Math.PI) / 180;

 const cx = 80, cy = 80, r = 58;
 // Arc path helper
 function arcPath(startDeg: number, endDeg: number): string {
 const s = ((startDeg - 90) * Math.PI) / 180;
 const e = ((endDeg - 90) * Math.PI) / 180;
 const x1 = cx + r * Math.cos(s);
 const y1 = cy + r * Math.sin(s);
 const x2 = cx + r * Math.cos(e);
 const y2 = cy + r * Math.sin(e);
 const large = endDeg - startDeg > 180 ? 1 : 0;
 return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
 }

 // Zones: greed (0.5–0.75) green, normal (0.75–1.25) neutral, fear (1.25–2.0) red
 const greedEndPct = (0.75 - MIN) / (MAX - MIN);
 const fearStartPct = (1.25 - MIN) / (MAX - MIN);
 const greedEndDeg = -135 + greedEndPct * 270;
 const fearStartDeg = -135 + fearStartPct * 270;

 // Needle tip
 const needleLen = 44;
 const needleX = cx + needleLen * Math.cos(angleRad);
 const needleY = cy + needleLen * Math.sin(angleRad);

 let label: string;
 let labelColor: string;
 if (clampedVal <= 0.75) { label = "Extreme Greed"; labelColor = "#34d399"; }
 else if (clampedVal <= 1.0) { label = "Greed"; labelColor = "#6ee7b7"; }
 else if (clampedVal <= 1.25) { label = "Neutral"; labelColor = "#94a3b8"; }
 else if (clampedVal <= 1.6) { label = "Fear"; labelColor = "#fca5a5"; }
 else { label = "Extreme Fear"; labelColor = "#f87171"; }

 return (
 <svg width={160} height={110} viewBox="0 0 160 110">
 <defs>
 <linearGradient id={`${uid}-gauge`} x1="0" x2="1" y1="0" y2="0">
 <stop offset="0%" stopColor="#34d399" />
 <stop offset="30%" stopColor="#86efac" />
 <stop offset="55%" stopColor="#94a3b8" />
 <stop offset="75%" stopColor="#fca5a5" />
 <stop offset="100%" stopColor="#f87171" />
 </linearGradient>
 </defs>

 {/* Background arc */}
 <path d={arcPath(-135, 135)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} strokeLinecap="round" />

 {/* Greed zone */}
 <path d={arcPath(-135, greedEndDeg)} fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth={9} strokeLinecap="round" />
 {/* Normal zone */}
 <path d={arcPath(greedEndDeg, fearStartDeg)} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth={9} />
 {/* Fear zone */}
 <path d={arcPath(fearStartDeg, 135)} fill="none" stroke="rgba(251,113,133,0.5)" strokeWidth={9} strokeLinecap="round" />

 {/* Needle */}
 <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#e2e8f0" strokeWidth={2} strokeLinecap="round" />
 <circle cx={cx} cy={cy} r={4} fill="#e2e8f0" />

 {/* Value label */}
 <text x={cx} y={cy + 22} textAnchor="middle" fontSize={14} fontWeight={700} fill="#e2e8f0">
 {value.toFixed(2)}
 </text>
 <text x={cx} y={cy + 35} textAnchor="middle" fontSize={9} fill={labelColor}>
 {label}
 </text>
 <text x={14} y={99} textAnchor="middle" fontSize={8} fill="rgba(148,163,184,0.6)">0.5</text>
 <text x={145} y={99} textAnchor="middle" fontSize={8} fill="rgba(148,163,184,0.6)">2.0</text>
 </svg>
 );
}

interface PcChartProps {
 history: PcRatioPoint[];
}

function PcLineChart({ history }: PcChartProps) {
 if (history.length === 0) return null;

 const W = 320, H = 80;
 const PAD_L = 28, PAD_R = 4, PAD_T = 6, PAD_B = 18;
 const chartW = W - PAD_L - PAD_R;
 const chartH = H - PAD_T - PAD_B;

 const vals = history.map((p) => p.value);
 const yMin = 0.4, yMax = 2.2;

 function xOf(day: number) {
 return PAD_L + (day / (history.length - 1)) * chartW;
 }
 function yOf(v: number) {
 return PAD_T + (1 - (v - yMin) / (yMax - yMin)) * chartH;
 }

 // Overbought (>1.5 = high fear) and oversold (<0.65 = high greed) zones
 const fearY = yOf(1.5);
 const greedY = yOf(0.65);

 // Build polyline points
 const points = history.map((p) => `${xOf(p.day)},${yOf(p.value)}`).join(" ");

 // Current value for dot
 const last = history[history.length - 1];

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 {/* Fear zone (above 1.5) */}
 <rect
 x={PAD_L} y={PAD_T} width={chartW}
 height={Math.max(0, fearY - PAD_T)}
 fill="rgba(251,113,133,0.07)"
 />
 {/* Greed zone (below 0.65) */}
 <rect
 x={PAD_L} y={greedY} width={chartW}
 height={Math.max(0, PAD_T + chartH - greedY)}
 fill="rgba(52,211,153,0.07)"
 />

 {/* Zone labels */}
 <text x={PAD_L + 2} y={PAD_T + 9} fontSize={7} fill="rgba(251,113,133,0.6)">Fear (1.5+)</text>
 <text x={PAD_L + 2} y={PAD_T + chartH - 2} fontSize={7} fill="rgba(52,211,153,0.6)">Greed (-0.65)</text>

 {/* Neutral line at 1.0 */}
 <line x1={PAD_L} y1={yOf(1.0)} x2={W - PAD_R} y2={yOf(1.0)}
 stroke="rgba(148,163,184,0.2)" strokeWidth={1} strokeDasharray="3 3" />

 {/* P/C line */}
 <polyline points={points} fill="none" stroke="#f97316" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

 {/* Current dot */}
 <circle cx={xOf(last.day)} cy={yOf(last.value)} r={3} fill="#f97316" />

 {/* Y axis ticks */}
 {[0.5, 1.0, 1.5, 2.0].map((v) => (
 <g key={v}>
 <text x={PAD_L - 2} y={yOf(v) + 3} textAnchor="end" fontSize={7} fill="rgba(148,163,184,0.6)">
 {v.toFixed(1)}
 </text>
 <line x1={PAD_L - 1} y1={yOf(v)} x2={PAD_L} y2={yOf(v)} stroke="rgba(148,163,184,0.3)" strokeWidth={1} />
 </g>
 ))}

 {/* X axis labels */}
 <text x={PAD_L} y={H - 2} fontSize={7} fill="rgba(148,163,184,0.5)">30d ago</text>
 <text x={W - PAD_R} y={H - 2} textAnchor="end" fontSize={7} fill="rgba(148,163,184,0.5)">Today</text>
 </svg>
 );
}

interface PcDashboardProps {
 seed: number;
}

function PcDashboard({ seed }: PcDashboardProps) {
 const tickerRatios = generateTickerPcRatios(seed);
 const pcHistory = generatePcHistory(seed);
 const currentPc = pcHistory[pcHistory.length - 1]?.value ?? 1.0;

 return (
 <div className="flex flex-col gap-4 p-3">
 {/* Overall gauge + chart */}
 <div className="flex flex-wrap items-start gap-6">
 <div className="flex flex-col items-center gap-1">
 <p className="text-xs font-semibold text-muted-foreground">Market P/C Ratio</p>
 <PcGauge value={currentPc} />
 <p className="text-[11px] text-muted-foreground">Extreme Greed = 0.5 · Extreme Fear = 2.0</p>
 </div>
 <div className="min-w-[280px] flex-1">
 <p className="mb-1 text-xs font-semibold text-muted-foreground">30-Day P/C History</p>
 <PcLineChart history={pcHistory} />
 </div>
 </div>

 {/* Smart money vs retail explanation */}
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 <div className="rounded-md border border-border bg-card/30 p-2">
 <p className="text-[11px] text-muted-foreground">Smart $ Bullish</p>
 <p className="text-[11px] text-muted-foreground/60">(orders &gt;$250K calls)</p>
 <p className="mt-1 text-base font-semibold text-emerald-400">
 {tickerRatios.reduce((s, r) => s + r.largeBullish, 0)}
 </p>
 </div>
 <div className="rounded-md border border-border bg-card/30 p-2">
 <p className="text-[11px] text-muted-foreground">Smart $ Bearish</p>
 <p className="text-[11px] text-muted-foreground/60">(orders &gt;$250K puts)</p>
 <p className="mt-1 text-base font-semibold text-red-400">
 {tickerRatios.reduce((s, r) => s + r.largeBearish, 0)}
 </p>
 </div>
 <div className="rounded-md border border-border bg-card/30 p-2">
 <p className="text-[11px] text-muted-foreground">Retail Bullish</p>
 <p className="text-[11px] text-muted-foreground/60">(orders &lt;$50K calls)</p>
 <p className="mt-1 text-base font-semibold text-emerald-400/70">
 {tickerRatios.reduce((s, r) => s + r.retailBullish, 0)}
 </p>
 </div>
 <div className="rounded-md border border-border bg-card/30 p-2">
 <p className="text-[11px] text-muted-foreground">Retail Bearish</p>
 <p className="text-[11px] text-muted-foreground/60">(orders &lt;$50K puts)</p>
 <p className="mt-1 text-base font-semibold text-red-400/70">
 {tickerRatios.reduce((s, r) => s + r.retailBearish, 0)}
 </p>
 </div>
 </div>

 {/* Per-ticker P/C table */}
 <div>
 <p className="mb-1.5 text-xs font-semibold text-muted-foreground">P/C Ratio by Ticker</p>
 <div className="overflow-auto">
 <table className="w-full border-collapse text-[11px]">
 <thead className="sticky top-0 z-10 bg-card">
 <tr className="border-b border-border">
 {[
 { col: "Ticker", align: "text-left" },
 { col: "P/C Ratio", align: "text-right" },
 { col: "Call Vol", align: "text-right" },
 { col: "Put Vol", align: "text-right" },
 { col: "Smart $ Bull", align: "text-right" },
 { col: "Smart $ Bear", align: "text-right" },
 { col: "Retail Bull", align: "text-right" },
 { col: "Retail Bear", align: "text-right" },
 ].map(
 ({ col, align }, i) => (
 <th key={`${col}-${i}`} className={cn("px-3 py-2 text-[11px] font-medium text-muted-foreground", align)}>
 {col}
 </th>
 ),
 )}
 </tr>
 </thead>
 <tbody>
 {tickerRatios.map((r) => {
 const isHighFear = r.ratio > 1.5;
 const isHighGreed = r.ratio < 0.65;
 return (
 <tr key={r.ticker} className="border-b border-border transition-colors hover:bg-muted/50">
 <td className="px-3 py-2 font-medium">{r.ticker}</td>
 <td className={cn("px-3 py-2 text-right font-mono tabular-nums font-medium",
 isHighFear ? "text-red-500" : isHighGreed ? "text-emerald-500" : "text-foreground")}>
 {r.ratio.toFixed(2)}
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-500">
 {r.callVol.toLocaleString()}
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-red-500">
 {r.putVol.toLocaleString()}
 </td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-500">{r.largeBullish}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-red-500">{r.largeBearish}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-500/60">{r.retailBullish}</td>
 <td className="px-3 py-2 text-right font-mono tabular-nums text-red-500/60">{r.retailBearish}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

// ── Section tabs ──────────────────────────────────────────────────────────────

type SectionTab = "flow" | "heatmap" | "darkpool" | "pcratio";

// ── Main FlowAnalysis Component ───────────────────────────────────────────────

export function FlowAnalysis() {
 const [section, setSection] = useState<SectionTab>("flow");

 // Minute-bucket seed refreshes every minute for "live" feel
 const minuteBucket = Math.floor(Date.now() / 60_000);
 const baseSeed = 4321 + minuteBucket;

 const baseOrders = generateFlowOrders(baseSeed);
 const darkPrints = generateDarkPoolPrints(baseSeed);

 const [heatmapFilter, setHeatmapFilter] = useState<{ ticker: string; expiry: string } | null>(null);

 const handleHeatmapFilter = useCallback((ticker: string, expiry: string) => {
 setHeatmapFilter((prev) =>
 prev?.ticker === ticker && prev?.expiry === expiry ? null : { ticker, expiry },
 );
 }, []);

 const sectionTabs: { key: SectionTab; label: string }[] = [
 { key: "flow", label: "Simulated Flow Feed" },
 { key: "heatmap", label: "Ticker Heatmap" },
 { key: "darkpool", label: "Simulated Institutional Flow" },
 { key: "pcratio", label: "P/C Ratio" },
 ];

 // Filter orders by heatmap selection
 const feedOrders = heatmapFilter
 ? baseOrders.filter((o) => o.ticker === heatmapFilter.ticker && o.expiry === heatmapFilter.expiry)
 : baseOrders;

 return (
 <div className="flex flex-col gap-0">
 {/* Section tabs */}
 <div className="flex shrink-0 items-center gap-0 border-b border-border bg-card/40 px-3">
 {sectionTabs.map(({ key, label }) => (
 <button
 key={key}
 onClick={() => setSection(key)}
 className={cn(
 "border-b-2 px-3 py-2 text-xs font-medium transition-colors",
 section === key
 ? "border-orange-400 text-orange-400"
 : "border-transparent text-muted-foreground hover:text-foreground",
 )}
 >
 {label}
 </button>
 ))}
 {heatmapFilter && (
 <button
 onClick={() => setHeatmapFilter(null)}
 className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-[11px] text-amber-400 hover:bg-amber-500/10"
 >
 <span>Filtered: {heatmapFilter.ticker} / {fmtExpiry(heatmapFilter.expiry)}</span>
 <span className="text-xs">×</span>
 </button>
 )}
 </div>

 {/* Section: Live Flow Feed */}
 {section === "flow" && (
 <LiveFlowFeed
 baseOrders={feedOrders}
 onTickerExpiry={(ticker, expiry) => {
 handleHeatmapFilter(ticker, expiry);
 setSection("heatmap");
 }}
 />
 )}

 {/* Section: Ticker Heatmap */}
 {section === "heatmap" && (
 <div className="p-3">
 <p className="mb-2 text-xs text-muted-foreground">
 Net options flow per ticker and expiry. Cell size proportional to volume. Click a cell to filter the flow feed.
 </p>
 <TickerHeatmap orders={baseOrders} onFilter={handleHeatmapFilter} />
 </div>
 )}

 {/* Section: Dark Pool Prints */}
 {section === "darkpool" && (
 <div className="p-3">
 <DarkPoolSection prints={darkPrints} />
 </div>
 )}

 {/* Section: P/C Ratio */}
 {section === "pcratio" && (
 <PcDashboard seed={baseSeed} />
 )}
 </div>
 );
}
