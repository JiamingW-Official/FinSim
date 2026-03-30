"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 TrendingUp,
 TrendingDown,
 ChevronUp,
 ChevronDown,
 Filter,
 Search,
 BarChart3,
 Star,
 Zap,
 Shield,
 Sliders,
 ArrowUpDown,
 CheckCircle2,
 AlertTriangle,
 Info,
 RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 632008;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function resetSeed() {
 s = 632008;
}

// ── Types ──────────────────────────────────────────────────────────────────────
type Sector =
 | "Technology"
 | "Healthcare"
 | "Finance"
 | "Consumer"
 | "Energy"
 | "Industrials"
 | "Materials"
 | "Utilities";

type SortField =
 | "ticker"
 | "sector"
 | "marketCap"
 | "pe"
 | "pb"
 | "revenueGrowth"
 | "roe"
 | "debtEquity"
 | "dividendYield";

type SortDir = "asc" | "desc";

interface Stock {
 ticker: string;
 name: string;
 sector: Sector;
 marketCap: number; // billions
 price: number;
 pe: number;
 pb: number;
 ps: number;
 evEbitda: number;
 revenueGrowth: number; // %
 epsGrowth: number; // %
 roe: number; // %
 roic: number; // %
 debtEquity: number;
 currentRatio: number;
 dividendYield: number; // %
 grossMargin: number; // %
 operatingMargin: number; // %
 netMargin: number; // %
 fcfYield: number; // %
 shortFloat: number; // %
 beta: number;
 revenueAccel: number; // acceleration %pts
 earningsQuality: number; // 0–100 score
 balanceStrength: number; // 0–100 score
}

// ── Synthetic Data ─────────────────────────────────────────────────────────────
const SECTOR_LIST: Sector[] = [
 "Technology",
 "Healthcare",
 "Finance",
 "Consumer",
 "Energy",
 "Industrials",
 "Materials",
 "Utilities",
];

const STOCK_DEFINITIONS: { ticker: string; name: string; sector: Sector }[] = [
 { ticker: "NVDA", name: "Nvidia Corp", sector: "Technology" },
 { ticker: "MSFT", name: "Microsoft Corp", sector: "Technology" },
 { ticker: "AAPL", name: "Apple Inc", sector: "Technology" },
 { ticker: "META", name: "Meta Platforms", sector: "Technology" },
 { ticker: "GOOGL", name: "Alphabet Inc", sector: "Technology" },
 { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
 { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
 { ticker: "LLY", name: "Eli Lilly & Co", sector: "Healthcare" },
 { ticker: "ABBV", name: "AbbVie Inc", sector: "Healthcare" },
 { ticker: "JPM", name: "JPMorgan Chase", sector: "Finance" },
 { ticker: "BAC", name: "Bank of America", sector: "Finance" },
 { ticker: "GS", name: "Goldman Sachs", sector: "Finance" },
 { ticker: "BRK", name: "Berkshire Hathaway", sector: "Finance" },
 { ticker: "AMZN", name: "Amazon.com Inc", sector: "Consumer" },
 { ticker: "TSLA", name: "Tesla Inc", sector: "Consumer" },
 { ticker: "NKE", name: "Nike Inc", sector: "Consumer" },
 { ticker: "XOM", name: "ExxonMobil Corp", sector: "Energy" },
 { ticker: "CVX", name: "Chevron Corp", sector: "Energy" },
 { ticker: "COP", name: "ConocoPhillips", sector: "Energy" },
 { ticker: "CAT", name: "Caterpillar Inc", sector: "Industrials" },
 { ticker: "HON", name: "Honeywell Intl", sector: "Industrials" },
 { ticker: "LIN", name: "Linde PLC", sector: "Materials" },
 { ticker: "FCX", name: "Freeport-McMoRan", sector: "Materials" },
 { ticker: "NEE", name: "NextEra Energy", sector: "Utilities" },
 { ticker: "DUK", name: "Duke Energy Corp", sector: "Utilities" },
];

function generateStocks(): Stock[] {
 resetSeed();
 return STOCK_DEFINITIONS.map((def) => {
 const isGrowth =
 def.sector === "Technology" || def.ticker === "LLY" || def.ticker === "AMZN";
 const isValue =
 def.sector === "Finance" ||
 def.sector === "Energy" ||
 def.sector === "Utilities";
 const isQuality = def.ticker === "MSFT" || def.ticker === "JPM" || def.ticker === "LIN";

 const mcBase = isGrowth
 ? 400 + rand() * 2600
 : isValue
 ? 80 + rand() * 500
 : 100 + rand() * 800;

 const peBase = isGrowth
 ? 20 + rand() * 60
 : isValue
 ? 8 + rand() * 14
 : 14 + rand() * 22;

 const revenueGrowth = isGrowth
 ? 12 + rand() * 38
 : isValue
 ? -2 + rand() * 14
 : 4 + rand() * 16;

 const epsGrowth = revenueGrowth * (0.8 + rand() * 0.8);

 const roeBase = isQuality
 ? 20 + rand() * 25
 : isGrowth
 ? 15 + rand() * 30
 : 8 + rand() * 18;

 const roicBase = roeBase * (0.65 + rand() * 0.3);

 const deBase = isValue
 ? 0.3 + rand() * 1.4
 : isGrowth
 ? 0.1 + rand() * 0.9
 : 0.2 + rand() * 1.2;

 const divYield =
 def.sector === "Utilities"
 ? 2.5 + rand() * 2
 : def.sector === "Energy"
 ? 2 + rand() * 3.5
 : def.sector === "Finance"
 ? 1 + rand() * 3
 : rand() * 1.5;

 const grossMargin = isGrowth
 ? 45 + rand() * 40
 : isValue
 ? 15 + rand() * 35
 : 25 + rand() * 30;

 const opMargin = grossMargin * (0.3 + rand() * 0.4);
 const netMargin = opMargin * (0.55 + rand() * 0.3);

 return {
 ticker: def.ticker,
 name: def.name,
 sector: def.sector,
 marketCap: parseFloat(mcBase.toFixed(1)),
 price: parseFloat((50 + rand() * 450).toFixed(2)),
 pe: parseFloat(peBase.toFixed(1)),
 pb: parseFloat((1 + rand() * 12).toFixed(1)),
 ps: parseFloat((0.8 + rand() * 8).toFixed(1)),
 evEbitda: parseFloat((6 + rand() * 28).toFixed(1)),
 revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
 epsGrowth: parseFloat(epsGrowth.toFixed(1)),
 roe: parseFloat(roeBase.toFixed(1)),
 roic: parseFloat(roicBase.toFixed(1)),
 debtEquity: parseFloat(deBase.toFixed(2)),
 currentRatio: parseFloat((0.8 + rand() * 2.5).toFixed(2)),
 dividendYield: parseFloat(divYield.toFixed(2)),
 grossMargin: parseFloat(grossMargin.toFixed(1)),
 operatingMargin: parseFloat(opMargin.toFixed(1)),
 netMargin: parseFloat(netMargin.toFixed(1)),
 fcfYield: parseFloat((1 + rand() * 6).toFixed(1)),
 shortFloat: parseFloat((1 + rand() * 12).toFixed(1)),
 beta: parseFloat((0.4 + rand() * 1.6).toFixed(2)),
 revenueAccel: parseFloat((-5 + rand() * 15).toFixed(1)),
 earningsQuality: Math.round(30 + rand() * 70),
 balanceStrength: Math.round(20 + rand() * 80),
 };
 });
}

const ALL_STOCKS = generateStocks();

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtCap(b: number): string {
 if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
 return `$${b.toFixed(0)}B`;
}

function fmtPct(v: number): string {
 return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function metricColor(value: number, good: "high" | "low"): string {
 if (good === "high") {
 if (value >= 20) return "text-emerald-400";
 if (value >= 10) return "text-yellow-400";
 return "text-rose-400";
 } else {
 if (value <= 1) return "text-emerald-400";
 if (value <= 2) return "text-yellow-400";
 return "text-rose-400";
 }
}

function scoreBar(score: number) {
 const color =
 score >= 70
 ? "bg-emerald-500"
 : score >= 50
 ? "bg-yellow-500"
 : "bg-rose-500";
 return (
 <div className="flex items-center gap-2">
 <div className="w-16 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
 <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
 </div>
 <span className="text-xs text-foreground/60">{score}</span>
 </div>
 );
}

// ── Sort utility ──────────────────────────────────────────────────────────────
function sortStocks(stocks: Stock[], field: SortField, dir: SortDir): Stock[] {
 return [...stocks].sort((a, b) => {
 const av = a[field];
 const bv = b[field];
 if (typeof av === "string" && typeof bv === "string") {
 return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
 }
 const an = av as number;
 const bn = bv as number;
 return dir === "asc" ? an - bn : bn - an;
 });
}

// ── Column header with sort ────────────────────────────────────────────────────
interface ColHeaderProps {
 label: string;
 field: SortField;
 sortField: SortField;
 sortDir: SortDir;
 onSort: (f: SortField) => void;
 align?: "left" | "right";
}

function ColHeader({ label, field, sortField, sortDir, onSort, align = "right" }: ColHeaderProps) {
 const active = sortField === field;
 return (
 <th
 className={cn(
 "px-3 py-2 text-xs font-medium text-foreground/50 cursor-pointer select-none whitespace-nowrap hover:text-foreground/80 transition-colors",
 align === "right" ? "text-right" : "text-left"
 )}
 onClick={() => onSort(field)}
 >
 <span className="inline-flex items-center gap-1">
 {label}
 {active ? (
 sortDir === "asc" ? (
 <ChevronUp size={12} className="text-muted-foreground/50" />
 ) : (
 <ChevronDown size={12} className="text-muted-foreground/50" />
 )
 ) : (
 <ArrowUpDown size={10} className="opacity-30" />
 )}
 </span>
 </th>
 );
}

// ── Sector badge ──────────────────────────────────────────────────────────────
const SECTOR_COLORS: Record<Sector, string> = {
 Technology: "bg-muted/10 text-foreground",
 Healthcare: "bg-emerald-500/20 text-emerald-300",
 Finance: "bg-amber-500/20 text-amber-300",
 Consumer: "bg-muted/10 text-foreground",
 Energy: "bg-orange-500/20 text-orange-300",
 Industrials: "bg-cyan-500/20 text-muted-foreground",
 Materials: "bg-lime-500/20 text-lime-300",
 Utilities: "bg-rose-500/20 text-rose-300",
};

function SectorBadge({ sector }: { sector: Sector }) {
 return (
 <span
 className={cn(
 "inline-block text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded",
 SECTOR_COLORS[sector]
 )}
 >
 {sector}
 </span>
 );
}

// ── Mini sparkline SVG ─────────────────────────────────────────────────────────
function MiniSparkline({ value, width = 48, height = 20 }: { value: number; width?: number; height?: number }) {
 resetSeed();
 const points = Array.from({ length: 8 }, (_, i) => {
 const noise = (rand() - 0.5) * 20;
 return noise + (value / 40) * i;
 });
 const min = Math.min(...points);
 const max = Math.max(...points);
 const range = max - min || 1;
 const xs = points.map((_, i) => (i / (points.length - 1)) * width);
 const ys = points.map((p) => height - ((p - min) / range) * height);
 const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join("");
 const color = value >= 0 ? "#34d399" : "#f87171";
 return (
 <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
 <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 );
}

// ── Distribution bar SVG ───────────────────────────────────────────────────────
function DistributionBar({
 stocks,
 field,
 label,
}: {
 stocks: Stock[];
 field: keyof Pick<Stock, "pe" | "revenueGrowth" | "roe" | "dividendYield">;
 label: string;
}) {
 const values = stocks.map((s) => s[field] as number);
 const max = Math.max(...values);
 const min = Math.min(...values);
 const range = max - min || 1;
 const bucketCount = 10;
 const buckets = Array.from({ length: bucketCount }, () => 0);
 values.forEach((v) => {
 const idx = Math.min(bucketCount - 1, Math.floor(((v - min) / range) * bucketCount));
 buckets[idx]++;
 });
 const bMax = Math.max(...buckets);
 const w = 200;
 const h = 40;
 const bw = w / bucketCount;
 return (
 <div>
 <p className="text-xs text-foreground/50 mb-1">{label}</p>
 <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
 {buckets.map((count, i) => {
 const barH = (count / bMax) * (h - 4);
 return (
 <rect
 key={i}
 x={i * bw + 1}
 y={h - barH}
 width={bw - 2}
 height={barH}
 rx={1}
 fill="#3b82f6"
 opacity={0.6 + 0.4 * (count / bMax)}
 />
 );
 })}
 </svg>
 <div className="flex justify-between text-xs text-foreground/30 mt-0.5">
 <span>{min.toFixed(1)}</span>
 <span>{max.toFixed(1)}</span>
 </div>
 </div>
 );
}

// ── Screener Tab ───────────────────────────────────────────────────────────────
function ScreenerTab() {
 const [sortField, setSortField] = useState<SortField>("marketCap");
 const [sortDir, setSortDir] = useState<SortDir>("desc");
 const [search, setSearch] = useState("");
 const [sectorFilter, setSectorFilter] = useState<Sector | "All">("All");

 const handleSort = (field: SortField) => {
 if (field === sortField) {
 setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 } else {
 setSortField(field);
 setSortDir("desc");
 }
 };

 const filtered = useMemo(() => {
 let list = ALL_STOCKS;
 if (search) {
 const q = search.toUpperCase();
 list = list.filter((s) => s.ticker.includes(q) || s.name.toUpperCase().includes(q));
 }
 if (sectorFilter !== "All") {
 list = list.filter((s) => s.sector === sectorFilter);
 }
 return sortStocks(list, sortField, sortDir);
 }, [search, sectorFilter, sortField, sortDir]);

 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-4"
 >
 {/* Controls */}
 <div className="flex flex-wrap gap-3 items-center">
 <div className="relative">
 <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
 <input
 className="bg-foreground/5 border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 w-48"
 placeholder="Search ticker..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 <div className="flex gap-1.5 flex-wrap">
 {(["All", ...SECTOR_LIST] as (Sector | "All")[]).map((sec) => (
 <button
 key={sec}
 onClick={() => setSectorFilter(sec)}
 className={cn(
 "text-xs text-muted-foreground px-2.5 py-1 rounded-lg border transition-colors",
 sectorFilter === sec
 ? "bg-primary border-primary text-foreground"
 : "bg-foreground/5 border-border text-foreground/50 hover:text-foreground/80"
 )}
 >
 {sec}
 </button>
 ))}
 </div>
 <span className="text-xs text-foreground/40 ml-auto">{filtered.length} stocks</span>
 </div>

 {/* Distribution charts */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-foreground/[0.03] rounded-md border border-border">
 <DistributionBar stocks={filtered.length > 0 ? filtered : ALL_STOCKS} field="pe" label="P/E Distribution" />
 <DistributionBar stocks={filtered.length > 0 ? filtered : ALL_STOCKS} field="revenueGrowth" label="Revenue Growth %" />
 <DistributionBar stocks={filtered.length > 0 ? filtered : ALL_STOCKS} field="roe" label="ROE %" />
 <DistributionBar stocks={filtered.length > 0 ? filtered : ALL_STOCKS} field="dividendYield" label="Dividend Yield %" />
 </div>

 {/* Table */}
 <div className="overflow-x-auto rounded-md border border-border bg-foreground/[0.02]">
 <table className="w-full text-sm">
 <thead className="border-b border-border">
 <tr>
 <ColHeader label="Ticker" field="ticker" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="left" />
 <th className="px-3 py-2 text-xs font-medium text-foreground/50 text-left">Name</th>
 <ColHeader label="Sector" field="sector" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="left" />
 <ColHeader label="Mkt Cap" field="marketCap" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
 <ColHeader label="P/E" field="pe" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
 <ColHeader label="P/B" field="pb" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
 <ColHeader label="Rev Growth" field="revenueGrowth" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
 <ColHeader label="ROE %" field="roe" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
 <ColHeader label="D/E" field="debtEquity" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
 <ColHeader label="Div Yield" field="dividendYield" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
 </tr>
 </thead>
 <tbody>
 <AnimatePresence>
 {filtered.map((stock, i) => (
 <motion.tr
 key={stock.ticker}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ delay: i * 0.02 }}
 className="border-b border-border hover:bg-muted/30 transition-colors"
 >
 <td className="px-3 py-2.5 font-semibold text-foreground">{stock.ticker}</td>
 <td className="px-3 py-2.5 text-foreground/60 whitespace-nowrap max-w-[140px] truncate">{stock.name}</td>
 <td className="px-3 py-2.5"><SectorBadge sector={stock.sector} /></td>
 <td className="px-3 py-2.5 text-right text-foreground/80">{fmtCap(stock.marketCap)}</td>
 <td className="px-3 py-2.5 text-right text-foreground/80">{stock.pe.toFixed(1)}</td>
 <td className="px-3 py-2.5 text-right text-foreground/80">{stock.pb.toFixed(1)}</td>
 <td className={cn("px-3 py-2.5 text-right font-medium", stock.revenueGrowth >= 0 ? "text-emerald-400" : "text-rose-400")}>
 {fmtPct(stock.revenueGrowth)}
 </td>
 <td className={cn("px-3 py-2.5 text-right font-medium", metricColor(stock.roe, "high"))}>
 {stock.roe.toFixed(1)}%
 </td>
 <td className={cn("px-3 py-2.5 text-right font-medium", metricColor(stock.debtEquity, "low"))}>
 {stock.debtEquity.toFixed(2)}
 </td>
 <td className="px-3 py-2.5 text-right text-amber-400">{stock.dividendYield.toFixed(2)}%</td>
 </motion.tr>
 ))}
 </AnimatePresence>
 {filtered.length === 0 && (
 <tr>
 <td colSpan={10} className="px-3 py-8 text-center text-foreground/30 text-sm">
 No stocks match the current filters
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </motion.div>
 );
}

// ── Value Screen Tab ───────────────────────────────────────────────────────────
interface ValueScreen {
 id: string;
 name: string;
 description: string;
 icon: React.ReactNode;
 filter: (s: Stock) => boolean;
 metrics: (keyof Stock)[];
}

const VALUE_SCREENS: ValueScreen[] = [
 {
 id: "graham",
 name: "Graham Net-Net",
 description: "Low P/E + P/B, strong balance sheet — classic deep value",
 icon: <Shield size={16} />,
 filter: (s) => s.pe < 18 && s.pb < 2.5 && s.debtEquity < 1 && s.currentRatio >= 1.5,
 metrics: ["pe", "pb", "debtEquity", "currentRatio", "dividendYield"],
 },
 {
 id: "greenblatt",
 name: "Greenblatt Magic Formula",
 description: "High ROIC + high earnings yield (low EV/EBITDA)",
 icon: <Star size={16} />,
 filter: (s) => s.roic > 15 && s.evEbitda < 15 && s.pe < 25,
 metrics: ["roic", "evEbitda", "pe", "roe", "fcfYield"],
 },
 {
 id: "deepvalue",
 name: "Deep Value",
 description: "Depressed multiples with positive FCF yield",
 icon: <BarChart3 size={16} />,
 filter: (s) => s.pe < 12 && s.ps < 1.5 && s.fcfYield > 4 && s.pb < 2,
 metrics: ["pe", "ps", "pb", "fcfYield", "dividendYield"],
 },
];

function ValueScreenTab() {
 const [activeScreen, setActiveScreen] = useState<string>("graham");

 const screen = VALUE_SCREENS.find((v) => v.id === activeScreen)!;
 const results = useMemo(() => ALL_STOCKS.filter(screen.filter), [activeScreen, screen.filter]);

 const METRIC_LABELS: Partial<Record<keyof Stock, string>> = {
 pe: "P/E",
 pb: "P/B",
 ps: "P/S",
 debtEquity: "D/E",
 currentRatio: "Curr. Ratio",
 dividendYield: "Div Yield",
 roic: "ROIC %",
 roe: "ROE %",
 evEbitda: "EV/EBITDA",
 fcfYield: "FCF Yield %",
 };

 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-4"
 >
 {/* Screen selector */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {VALUE_SCREENS.map((vs) => (
 <button
 key={vs.id}
 onClick={() => setActiveScreen(vs.id)}
 className={cn(
 "text-left p-4 rounded-md border transition-colors",
 activeScreen === vs.id
 ? "bg-muted/10 border-primary/50"
 : "bg-foreground/[0.03] border-border hover:bg-muted/30"
 )}
 >
 <div className="flex items-center gap-2 mb-1 text-foreground">{vs.icon}</div>
 <p className="font-semibold text-foreground text-sm">{vs.name}</p>
 <p className="text-xs text-foreground/50 mt-0.5">{vs.description}</p>
 </button>
 ))}
 </div>

 {/* Results */}
 <Card className="bg-foreground/[0.02] border-border">
 <CardHeader className="py-3 px-4 border-b border-border">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-semibold text-foreground">
 {screen.name} — {results.length} matches
 </CardTitle>
 <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
 {results.length > 5 ? "Strong signal" : results.length > 0 ? "Few matches" : "No matches"}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="px-4 py-2 text-left text-xs font-medium text-foreground/40">Ticker</th>
 <th className="px-4 py-2 text-left text-xs font-medium text-foreground/40">Sector</th>
 {screen.metrics.map((m) => (
 <th key={String(m)} className="px-4 py-2 text-right text-xs font-medium text-foreground/40">
 {METRIC_LABELS[m] ?? String(m)}
 </th>
 ))}
 <th className="px-4 py-2 text-center text-xs font-medium text-foreground/40">Trend</th>
 </tr>
 </thead>
 <tbody>
 {results.length === 0 && (
 <tr>
 <td colSpan={screen.metrics.length + 3} className="px-4 py-8 text-center text-foreground/30 text-sm">
 No stocks pass this screen currently
 </td>
 </tr>
 )}
 {results.map((stock) => (
 <tr key={stock.ticker} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-2.5">
 <span className="font-semibold text-foreground">{stock.ticker}</span>
 <span className="block text-[11px] text-foreground/40">{stock.name}</span>
 </td>
 <td className="px-4 py-2.5"><SectorBadge sector={stock.sector} /></td>
 {screen.metrics.map((m) => {
 const val = stock[m] as number;
 return (
 <td key={String(m)} className="px-4 py-2.5 text-right text-foreground/80">
 {m === "dividendYield" || m === "roic" || m === "roe" || m === "fcfYield"
 ? `${val.toFixed(1)}%`
 : val.toFixed(2)}
 </td>
 );
 })}
 <td className="px-4 py-2.5 flex justify-center">
 <MiniSparkline value={stock.revenueGrowth} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}

// ── Growth Screen Tab ──────────────────────────────────────────────────────────
interface GrowthScreen {
 id: string;
 name: string;
 description: string;
 color: string;
 filter: (s: Stock) => boolean;
}

const GROWTH_SCREENS: GrowthScreen[] = [
 {
 id: "garp",
 name: "GARP",
 description: "Growth at a reasonable price — PEG-like quality",
 color: "blue",
 filter: (s) => s.revenueGrowth > 10 && s.pe < 35 && s.epsGrowth > 8,
 },
 {
 id: "highgrowth",
 name: "High Growth",
 description: "High revenue + EPS acceleration, any price",
 color: "purple",
 filter: (s) => s.revenueGrowth > 20 && s.epsGrowth > 20 && s.revenueAccel > 0,
 },
 {
 id: "momentumquality",
 name: "Momentum Quality",
 description: "Strong earnings quality + positive revenue acceleration",
 color: "emerald",
 filter: (s) => s.earningsQuality >= 60 && s.revenueAccel > 3 && s.roe > 15,
 },
];

function GrowthScreenTab() {
 const [activeScreen, setActiveScreen] = useState<string>("garp");

 const screen = GROWTH_SCREENS.find((g) => g.id === activeScreen)!;
 const results = useMemo(() => ALL_STOCKS.filter(screen.filter), [activeScreen, screen.filter]);

 const colorMap: Record<string, string> = {
 blue: "bg-muted/10 border-primary/50 text-foreground",
 purple: "bg-muted/10 border-primary/50 text-foreground",
 emerald: "bg-emerald-600/20 border-emerald-500/50 text-emerald-400",
 };

 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-4"
 >
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {GROWTH_SCREENS.map((gs) => (
 <button
 key={gs.id}
 onClick={() => setActiveScreen(gs.id)}
 className={cn(
 "text-left p-4 rounded-md border transition-colors",
 activeScreen === gs.id
 ? colorMap[gs.color]
 : "bg-foreground/[0.03] border-border hover:bg-muted/30"
 )}
 >
 <div className="flex items-center gap-2 mb-1">
 <TrendingUp size={16} className="text-current" />
 </div>
 <p className="font-semibold text-foreground text-sm">{gs.name}</p>
 <p className="text-xs text-foreground/50 mt-0.5">{gs.description}</p>
 </button>
 ))}
 </div>

 <Card className="bg-foreground/[0.02] border-border">
 <CardHeader className="py-3 px-4 border-b border-border">
 <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
 <span>{screen.name} Results — {results.length} matches</span>
 <Zap size={14} className="text-yellow-400" />
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 {["Ticker", "Sector", "Rev Growth", "EPS Growth", "Rev Accel", "P/E", "ROE %", "Earn. Quality"].map((h) => (
 <th key={h} className={cn("px-4 py-2 text-xs font-medium text-foreground/40", h === "Ticker" || h === "Sector" ? "text-left" : "text-right")}>
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {results.length === 0 && (
 <tr>
 <td colSpan={8} className="px-4 py-8 text-center text-foreground/30 text-sm">
 No stocks pass this screen
 </td>
 </tr>
 )}
 {results.map((stock) => (
 <tr key={stock.ticker} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-2.5">
 <span className="font-medium text-foreground">{stock.ticker}</span>
 <span className="block text-[11px] text-foreground/40">{stock.name}</span>
 </td>
 <td className="px-4 py-2.5"><SectorBadge sector={stock.sector} /></td>
 <td className={cn("px-4 py-2.5 text-right font-medium", stock.revenueGrowth >= 20 ? "text-emerald-400" : "text-foreground")}>
 {fmtPct(stock.revenueGrowth)}
 </td>
 <td className={cn("px-4 py-2.5 text-right font-medium", stock.epsGrowth >= 20 ? "text-emerald-400" : "text-foreground")}>
 {fmtPct(stock.epsGrowth)}
 </td>
 <td className={cn("px-4 py-2.5 text-right font-medium", stock.revenueAccel > 0 ? "text-emerald-400" : "text-rose-400")}>
 {stock.revenueAccel > 0 ? "+" : ""}{stock.revenueAccel.toFixed(1)}pp
 </td>
 <td className="px-4 py-2.5 text-right text-foreground/80">{stock.pe.toFixed(1)}</td>
 <td className={cn("px-4 py-2.5 text-right font-medium", metricColor(stock.roe, "high"))}>
 {stock.roe.toFixed(1)}%
 </td>
 <td className="px-4 py-2.5 text-right">{scoreBar(stock.earningsQuality)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}

// ── Quality Screen Tab ─────────────────────────────────────────────────────────
interface QualityScreen {
 id: string;
 name: string;
 description: string;
 filter: (s: Stock) => boolean;
}

const QUALITY_SCREENS: QualityScreen[] = [
 {
 id: "roic",
 name: "ROIC Leaders",
 description: "ROIC > 20% — capital efficient compounders",
 filter: (s) => s.roic > 20 && s.roe > 18,
 },
 {
 id: "fcfyield",
 name: "FCF Yield",
 description: "High free cash flow yield with low debt",
 filter: (s) => s.fcfYield > 4 && s.debtEquity < 1.2 && s.netMargin > 10,
 },
 {
 id: "earningsquality",
 name: "Earnings Quality",
 description: "Consistent, high-quality earnings with low leverage",
 filter: (s) => s.earningsQuality >= 65 && s.balanceStrength >= 60,
 },
 {
 id: "lowleverage",
 name: "Low Leverage",
 description: "Strong balance sheets, current ratio > 2",
 filter: (s) => s.debtEquity < 0.5 && s.currentRatio > 2 && s.balanceStrength >= 55,
 },
];

function QualityScreenTab() {
 const [activeScreen, setActiveScreen] = useState<string>("roic");

 const screen = QUALITY_SCREENS.find((q) => q.id === activeScreen)!;
 const results = useMemo(() => ALL_STOCKS.filter(screen.filter), [activeScreen, screen.filter]);

 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-4"
 >
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {QUALITY_SCREENS.map((qs) => (
 <button
 key={qs.id}
 onClick={() => setActiveScreen(qs.id)}
 className={cn(
 "text-left p-3 rounded-md border transition-colors",
 activeScreen === qs.id
 ? "bg-emerald-600/20 border-emerald-500/50"
 : "bg-foreground/[0.03] border-border hover:bg-muted/30"
 )}
 >
 <Shield size={14} className={activeScreen === qs.id ? "text-emerald-400 mb-1" : "text-foreground/30 mb-1"} />
 <p className="font-medium text-foreground text-xs">{qs.name}</p>
 <p className="text-[11px] text-foreground/40 mt-0.5">{qs.description}</p>
 </button>
 ))}
 </div>

 {/* Summary stats */}
 {results.length > 0 && (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { label: "Avg ROIC", value: (results.reduce((a, s) => a + s.roic, 0) / results.length).toFixed(1) + "%" },
 { label: "Avg D/E", value: (results.reduce((a, s) => a + s.debtEquity, 0) / results.length).toFixed(2) },
 { label: "Avg FCF Yield", value: (results.reduce((a, s) => a + s.fcfYield, 0) / results.length).toFixed(1) + "%" },
 { label: "Avg Bal. Strength", value: Math.round(results.reduce((a, s) => a + s.balanceStrength, 0) / results.length) + "/100" },
 ].map((stat) => (
 <Card key={stat.label} className="bg-foreground/[0.03] border-border">
 <CardContent className="p-3">
 <p className="text-xs text-foreground/40">{stat.label}</p>
 <p className="text-lg font-medium text-foreground mt-0.5">{stat.value}</p>
 </CardContent>
 </Card>
 ))}
 </div>
 )}

 <Card className="bg-foreground/[0.02] border-border">
 <CardHeader className="py-3 px-4 border-b border-border">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <CheckCircle2 size={14} className="text-emerald-400" />
 {screen.name} — {results.length} stocks
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 {["Ticker", "Sector", "ROIC %", "ROE %", "FCF Yield", "D/E", "Curr. Ratio", "Earn. Quality", "Bal. Strength"].map((h) => (
 <th key={h} className={cn("px-4 py-2 text-xs font-medium text-foreground/40", h === "Ticker" || h === "Sector" ? "text-left" : "text-right")}>
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {results.length === 0 && (
 <tr>
 <td colSpan={9} className="px-4 py-8 text-center text-foreground/30 text-sm">
 No stocks pass this quality screen
 </td>
 </tr>
 )}
 {results.map((stock) => (
 <tr key={stock.ticker} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-2.5">
 <span className="font-medium text-foreground">{stock.ticker}</span>
 <span className="block text-[11px] text-foreground/40">{stock.name}</span>
 </td>
 <td className="px-4 py-2.5"><SectorBadge sector={stock.sector} /></td>
 <td className={cn("px-4 py-2.5 text-right font-medium", stock.roic >= 20 ? "text-emerald-400" : "text-foreground")}>
 {stock.roic.toFixed(1)}%
 </td>
 <td className={cn("px-4 py-2.5 text-right font-medium", metricColor(stock.roe, "high"))}>
 {stock.roe.toFixed(1)}%
 </td>
 <td className="px-4 py-2.5 text-right text-foreground/80">{stock.fcfYield.toFixed(1)}%</td>
 <td className={cn("px-4 py-2.5 text-right font-medium", metricColor(stock.debtEquity, "low"))}>
 {stock.debtEquity.toFixed(2)}
 </td>
 <td className={cn("px-4 py-2.5 text-right", stock.currentRatio >= 2 ? "text-emerald-400" : stock.currentRatio >= 1 ? "text-yellow-400" : "text-rose-400")}>
 {stock.currentRatio.toFixed(2)}
 </td>
 <td className="px-4 py-2.5 text-right">{scoreBar(stock.earningsQuality)}</td>
 <td className="px-4 py-2.5 text-right">{scoreBar(stock.balanceStrength)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}

// ── Custom Screen Tab ──────────────────────────────────────────────────────────
interface FilterState {
 peMin: number;
 peMax: number;
 minROE: number;
 maxDE: number;
 minRevGrowth: number;
 minFCFYield: number;
 minGrossMargin: number;
 maxBeta: number;
 sectors: Set<Sector>;
}

const DEFAULT_FILTERS: FilterState = {
 peMin: 0,
 peMax: 80,
 minROE: 0,
 maxDE: 5,
 minRevGrowth: -10,
 minFCFYield: 0,
 minGrossMargin: 0,
 maxBeta: 3,
 sectors: new Set(SECTOR_LIST),
};

function CustomScreenTab() {
 const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, sectors: new Set(SECTOR_LIST) });

 const results = useMemo(() => {
 return ALL_STOCKS.filter(
 (s) =>
 s.pe >= filters.peMin &&
 s.pe <= filters.peMax &&
 s.roe >= filters.minROE &&
 s.debtEquity <= filters.maxDE &&
 s.revenueGrowth >= filters.minRevGrowth &&
 s.fcfYield >= filters.minFCFYield &&
 s.grossMargin >= filters.minGrossMargin &&
 s.beta <= filters.maxBeta &&
 filters.sectors.has(s.sector)
 );
 }, [filters]);

 const toggleSector = (sec: Sector) => {
 setFilters((prev) => {
 const next = new Set(prev.sectors);
 if (next.has(sec)) next.delete(sec);
 else next.add(sec);
 return { ...prev, sectors: next };
 });
 };

 const resetFilters = () => setFilters({ ...DEFAULT_FILTERS, sectors: new Set(SECTOR_LIST) });

 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-4"
 >
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {/* Filter panel */}
 <Card className="bg-foreground/[0.02] border-border lg:col-span-1">
 <CardHeader className="py-3 px-4 border-b border-border">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Sliders size={14} className="text-muted-foreground/50" />
 Filter Controls
 </CardTitle>
 <Button size="sm" variant="ghost" className="h-7 text-xs text-foreground/50 hover:text-foreground" onClick={resetFilters}>
 <RefreshCw size={11} className="mr-1" /> Reset
 </Button>
 </div>
 </CardHeader>
 <CardContent className="p-4 space-y-5">
 {/* P/E Range */}
 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="text-xs text-foreground/60">P/E Range</label>
 <span className="text-xs text-foreground font-mono">{filters.peMin}–{filters.peMax}</span>
 </div>
 <div className="space-y-2">
 <Slider
 min={0} max={80} step={1}
 value={[filters.peMin]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, peMin: Math.min(v, f.peMax - 1) }))}
 className="cursor-pointer"
 />
 <Slider
 min={0} max={80} step={1}
 value={[filters.peMax]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, peMax: Math.max(v, f.peMin + 1) }))}
 className="cursor-pointer"
 />
 </div>
 </div>

 {/* Min ROE */}
 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="text-xs text-foreground/60">Min ROE %</label>
 <span className="text-xs text-emerald-400 font-mono">{filters.minROE}%</span>
 </div>
 <Slider
 min={0} max={50} step={1}
 value={[filters.minROE]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, minROE: v }))}
 />
 </div>

 {/* Max D/E */}
 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="text-xs text-foreground/60">Max Debt/Equity</label>
 <span className="text-xs text-rose-400 font-mono">{filters.maxDE.toFixed(1)}</span>
 </div>
 <Slider
 min={0} max={5} step={0.1}
 value={[filters.maxDE]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, maxDE: v }))}
 />
 </div>

 {/* Min Revenue Growth */}
 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="text-xs text-foreground/60">Min Revenue Growth %</label>
 <span className="text-xs text-foreground font-mono">{filters.minRevGrowth}%</span>
 </div>
 <Slider
 min={-10} max={50} step={1}
 value={[filters.minRevGrowth]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, minRevGrowth: v }))}
 />
 </div>

 {/* Min FCF Yield */}
 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="text-xs text-foreground/60">Min FCF Yield %</label>
 <span className="text-xs text-amber-400 font-mono">{filters.minFCFYield}%</span>
 </div>
 <Slider
 min={0} max={8} step={0.5}
 value={[filters.minFCFYield]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, minFCFYield: v }))}
 />
 </div>

 {/* Min Gross Margin */}
 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="text-xs text-foreground/60">Min Gross Margin %</label>
 <span className="text-xs text-foreground font-mono">{filters.minGrossMargin}%</span>
 </div>
 <Slider
 min={0} max={80} step={5}
 value={[filters.minGrossMargin]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, minGrossMargin: v }))}
 />
 </div>

 {/* Max Beta */}
 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="text-xs text-foreground/60">Max Beta</label>
 <span className="text-xs text-muted-foreground font-mono">{filters.maxBeta.toFixed(1)}</span>
 </div>
 <Slider
 min={0.2} max={3} step={0.1}
 value={[filters.maxBeta]}
 onValueChange={([v]) => setFilters((f) => ({ ...f, maxBeta: v }))}
 />
 </div>

 {/* Sector toggles */}
 <div>
 <label className="text-xs text-foreground/60 mb-2 block">Sectors</label>
 <div className="flex flex-wrap gap-1.5">
 {SECTOR_LIST.map((sec) => (
 <button
 key={sec}
 onClick={() => toggleSector(sec)}
 className={cn(
 "text-[11px] px-2 py-0.5 rounded border transition-colors",
 filters.sectors.has(sec)
 ? SECTOR_COLORS[sec] + " border-current"
 : "bg-foreground/5 border-border text-foreground/30"
 )}
 >
 {sec}
 </button>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Results panel */}
 <div className="lg:col-span-2 space-y-3">
 {/* Match summary */}
 <div className="grid grid-cols-3 gap-3">
 <Card className="bg-foreground/[0.03] border-border">
 <CardContent className="p-3">
 <p className="text-xs text-foreground/40">Matches</p>
 <p className="text-2xl font-semibold text-foreground">{results.length}</p>
 <p className="text-xs text-foreground/30">of 25 stocks</p>
 </CardContent>
 </Card>
 <Card className="bg-foreground/[0.03] border-border">
 <CardContent className="p-3">
 <p className="text-xs text-foreground/40">Avg P/E</p>
 <p className="text-lg font-medium text-foreground">
 {results.length > 0 ? (results.reduce((a, s) => a + s.pe, 0) / results.length).toFixed(1) : "—"}
 </p>
 </CardContent>
 </Card>
 <Card className="bg-foreground/[0.03] border-border">
 <CardContent className="p-3">
 <p className="text-xs text-foreground/40">Avg ROE</p>
 <p className="text-lg font-medium text-emerald-400">
 {results.length > 0 ? (results.reduce((a, s) => a + s.roe, 0) / results.length).toFixed(1) + "%" : "—"}
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Match progress bar */}
 <div className="p-3 bg-foreground/[0.03] rounded-md border border-border">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs text-foreground/50">Filter match rate</span>
 <span className="text-xs font-mono text-foreground/70">{results.length}/25</span>
 </div>
 <Progress value={(results.length / 25) * 100} className="h-2" />
 </div>

 {/* Results table */}
 <Card className="bg-foreground/[0.02] border-border">
 <CardHeader className="py-3 px-4 border-b border-border">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Filter size={14} className="text-muted-foreground/50" />
 Custom Screen Results
 {results.length === 0 && (
 <Badge className="bg-rose-500/20 text-rose-300 text-xs ml-auto">
 <AlertTriangle size={10} className="mr-1 inline" /> No matches
 </Badge>
 )}
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
 <table className="w-full text-sm">
 <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
 <tr className="border-b border-border">
 {["Ticker", "Sector", "P/E", "ROE %", "D/E", "Rev Growth", "FCF Yield", "Gross Margin", "Beta"].map((h) => (
 <th key={h} className={cn("px-3 py-2 text-xs font-medium text-foreground/40", h === "Ticker" || h === "Sector" ? "text-left" : "text-right")}>
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 <AnimatePresence>
 {results.map((stock, i) => (
 <motion.tr
 key={stock.ticker}
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 8 }}
 transition={{ delay: i * 0.03 }}
 className="border-b border-border hover:bg-muted/30 transition-colors"
 >
 <td className="px-3 py-2.5 font-medium text-foreground">{stock.ticker}</td>
 <td className="px-3 py-2.5"><SectorBadge sector={stock.sector} /></td>
 <td className="px-3 py-2.5 text-right text-foreground/80">{stock.pe.toFixed(1)}</td>
 <td className={cn("px-3 py-2.5 text-right font-medium", metricColor(stock.roe, "high"))}>
 {stock.roe.toFixed(1)}%
 </td>
 <td className={cn("px-3 py-2.5 text-right font-medium", metricColor(stock.debtEquity, "low"))}>
 {stock.debtEquity.toFixed(2)}
 </td>
 <td className={cn("px-3 py-2.5 text-right font-medium", stock.revenueGrowth >= 0 ? "text-emerald-400" : "text-rose-400")}>
 {fmtPct(stock.revenueGrowth)}
 </td>
 <td className="px-3 py-2.5 text-right text-amber-400">{stock.fcfYield.toFixed(1)}%</td>
 <td className="px-3 py-2.5 text-right text-foreground/70">{stock.grossMargin.toFixed(1)}%</td>
 <td className={cn("px-3 py-2.5 text-right", stock.beta < 1 ? "text-foreground" : stock.beta < 1.5 ? "text-yellow-400" : "text-rose-400")}>
 {stock.beta.toFixed(2)}
 </td>
 </motion.tr>
 ))}
 </AnimatePresence>
 {results.length === 0 && (
 <tr>
 <td colSpan={9} className="px-4 py-10 text-center">
 <div className="flex flex-col items-center gap-2 text-foreground/30">
 <Info size={24} />
 <p className="text-sm">Adjust filters to find matching stocks</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </motion.div>
 );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function StockScreenerPage() {
 return (
 <div className="min-h-screen bg-background text-foreground p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="mb-6"
 >
 <div className="flex items-center gap-3 mb-1">
 <div className="w-8 h-8 rounded-lg bg-primary/30 border border-border flex items-center justify-center">
 <BarChart3 size={16} className="text-muted-foreground/50" />
 </div>
 <h1 className="text-xl font-semibold text-foreground">Stock Screener</h1>
 </div>
 <p className="text-sm text-foreground/40 ml-11">
 Fundamental + technical filters across 25 synthetic stocks in 8 sectors
 </p>
 </motion.div>

 {/* Summary chips */}
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1, duration: 0.4 }}
 className="flex flex-wrap gap-2 mb-6 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
 >
 {[
 { icon: <BarChart3 size={12} />, label: "25 Stocks", color: "text-foreground bg-muted/10 border-border" },
 { icon: <Layers size={12} />, label: "8 Sectors", color: "text-foreground bg-muted/10 border-border" },
 { icon: <Star size={12} />, label: "Value Screens", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
 { icon: <TrendingUp size={12} />, label: "Growth Screens", color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
 { icon: <Shield size={12} />, label: "Quality Screens", color: "text-muted-foreground bg-cyan-500/10 border-cyan-500/20" },
 { icon: <Sliders size={12} />, label: "Custom Filters", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
 ].map((chip) => (
 <span
 key={chip.label}
 className={cn(
 "inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full border font-medium",
 chip.color
 )}
 >
 {chip.icon}
 {chip.label}
 </span>
 ))}
 </motion.div>

 {/* Tabs */}
 <Tabs defaultValue="screener">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 <TabsTrigger value="screener" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <BarChart3 size={12} className="mr-1.5" /> Screener
 </TabsTrigger>
 <TabsTrigger value="value" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Star size={12} className="mr-1.5" /> Value Screen
 </TabsTrigger>
 <TabsTrigger value="growth" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <TrendingUp size={12} className="mr-1.5" /> Growth Screen
 </TabsTrigger>
 <TabsTrigger value="quality" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Shield size={12} className="mr-1.5" /> Quality Screen
 </TabsTrigger>
 <TabsTrigger value="custom" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Sliders size={12} className="mr-1.5" /> Custom Screen
 </TabsTrigger>
 </TabsList>

 <TabsContent value="screener" className="data-[state=inactive]:hidden mt-0">
 <ScreenerTab />
 </TabsContent>
 <TabsContent value="value" className="data-[state=inactive]:hidden mt-0">
 <ValueScreenTab />
 </TabsContent>
 <TabsContent value="growth" className="data-[state=inactive]:hidden mt-0">
 <GrowthScreenTab />
 </TabsContent>
 <TabsContent value="quality" className="data-[state=inactive]:hidden mt-0">
 <QualityScreenTab />
 </TabsContent>
 <TabsContent value="custom" className="data-[state=inactive]:hidden mt-0">
 <CustomScreenTab />
 </TabsContent>
 </Tabs>
 </div>
 );
}

// Missing import shim
function Layers(props: { size: number }) {
 return (
 <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
 <polygon points="12 2 2 7 12 12 22 7 12 2" />
 <polyline points="2 17 12 22 22 17" />
 <polyline points="2 12 12 17 22 12" />
 </svg>
 );
}
