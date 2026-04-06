"use client";

import { useState, useMemo } from "react";
import {
 TrendingUp,
 TrendingDown,
 ChevronRight,
 AlertTriangle,
 BarChart2,
 DollarSign,
 Globe,
 Zap,
 RefreshCw,
 Calculator,
 Activity,
 Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number) {
 let s = seed >>> 0;
 return () => {
 s += 0x6d2b79f5;
 let t = s;
 t = Math.imul(t ^ (t >>> 15), t | 1);
 t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

function hashStr(str: string): number {
 let h = 5381;
 for (let i = 0; i < str.length; i++) {
 h = ((h << 5) + h + str.charCodeAt(i)) & 0xffffffff;
 }
 return h >>> 0;
}

const RNG = mulberry32(4242);

// ── Format helpers ─────────────────────────────────────────────────────────────

function fmt(n: number, d = 2): string {
 return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtLarge(n: number): string {
 if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
 if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
 return n.toFixed(0);
}

function fmtPrice(n: number): string {
 if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
 if (n >= 100) return n.toFixed(2);
 if (n >= 1) return n.toFixed(3);
 return n.toFixed(5);
}

// ── Color helpers ──────────────────────────────────────────────────────────────

const up = (v: number) => v >= 0;
const chgCls = (v: number) => (up(v) ? "text-emerald-400" : "text-red-400");
const chgBg = (v: number) => (up(v) ? "bg-emerald-500/5" : "bg-red-500/5");

// ── Types ─────────────────────────────────────────────────────────────────────

interface IndexFuture {
 symbol: string;
 name: string;
 exchange: string;
 spotPrice: number;
 futuresPrice: number;
 fairValue: number;
 premium: number;
 volume: number;
 oi: number;
 expiry: string;
 rollSpread: number;
 region: "US" | "EU" | "Asia" | "Sector";
}

interface SSF {
 ticker: string;
 spotPrice: number;
 futuresPrice: number;
 premium: number;
 volume: number;
 expiry: string;
}

interface IRFuture {
 symbol: string;
 name: string;
 price: number;
 yield_: number;
 dv01: number;
 duration: number;
 change: number;
 oi: number;
}

interface SOFRPoint {
 label: string;
 impliedRate: number;
}

interface FOMCMeeting {
 date: string;
 impliedRate: number;
 probHike: number;
 probCut: number;
 probHold: number;
}

interface IntlIRFuture {
 symbol: string;
 name: string;
 country: string;
 price: number;
 yield_: number;
 change: number;
}

interface FXFuture {
 symbol: string;
 pair: string;
 price: number;
 change: number;
 volume: number;
 rollCost: number;
 forwardRate: number;
 expiry: string;
}

interface CryptoFuture {
 symbol: string;
 name: string;
 spotPrice: number;
 perpPrice: number;
 q1Price: number;
 q2Price: number;
 fundingRate8h: number;
 fundingAnnualized: number;
 basis: number;
}

interface VIXFuture {
 month: string;
 label: string;
 price: number;
 change: number;
 oi: number;
}

interface VarianceSwap {
 tenor: string;
 impliedVar: number;
 realizedVar: number;
 impliedVol: number;
 realizedVol: number;
 spread: number;
}

interface HistVIXBar {
 range: string;
 count: number;
 pct: number;
}

interface ContractSpec {
 symbol: string;
 name: string;
 exchange: string;
 tickSize: number;
 tickValue: number;
 contractSize: number;
 sizeUnit: string;
 initialMargin: number;
 maintenanceMargin: number;
 dayTradingMargin: number;
 overnightMargin: number;
}

// ── Data generation ────────────────────────────────────────────────────────────

function genIndexFutures(): IndexFuture[] {
 const defs = [
 { symbol: "ES", name: "S&P 500 E-mini", exchange: "CME", spot: 5210, region: "US" as const },
 { symbol: "NQ", name: "Nasdaq 100 E-mini", exchange: "CME", spot: 18240, region: "US" as const },
 { symbol: "YM", name: "Dow Jones E-mini", exchange: "CBOT", spot: 39180, region: "US" as const },
 { symbol: "RTY", name: "Russell 2000 E-mini", exchange: "CME", spot: 2084, region: "US" as const },
 { symbol: "FESX", name: "Euro Stoxx 50", exchange: "EUREX", spot: 4820, region: "EU" as const },
 { symbol: "Z", name: "FTSE 100", exchange: "ICE", spot: 7680, region: "EU" as const },
 { symbol: "NKD", name: "Nikkei 225", exchange: "CME", spot: 38420, region: "Asia" as const },
 { symbol: "HSI", name: "Hang Seng Index", exchange: "HKEX", spot: 17840, region: "Asia" as const },
 { symbol: "XBI", name: "Biotech Sector", exchange: "CME", spot: 92.4, region: "Sector" as const },
 { symbol: "XLF", name: "Financials Sector", exchange: "CME", spot: 40.18, region: "Sector" as const },
 { symbol: "XLE", name: "Energy Sector", exchange: "CME", spot: 88.72, region: "Sector" as const },
 { symbol: "GDX", name: "Gold Miners", exchange: "CME", spot: 31.45, region: "Sector" as const },
 ];
 const months = ["Mar 25", "Jun 25", "Sep 25", "Dec 25"];
 return defs.map((d, i) => {
 const rng = mulberry32(hashStr(d.symbol) ^ 4242);
 const chgPct = (rng() - 0.48) * 2.4;
 const futuresPrice = d.spot * (1 + chgPct / 100);
 const fairValue = d.spot * (1 + (rng() * 0.003 - 0.001));
 const premium = futuresPrice - fairValue;
 const volume = Math.floor(50000 + rng() * 500000);
 const oi = Math.floor(volume * (1.5 + rng() * 3));
 const rollSpread = -(rng() * 8 + 1) * (d.spot > 1000 ? 0.5 : 0.02);
 return {
 symbol: d.symbol,
 name: d.name,
 exchange: d.exchange,
 spotPrice: d.spot,
 futuresPrice,
 fairValue,
 premium,
 volume,
 oi,
 expiry: months[i % 4],
 rollSpread,
 region: d.region,
 };
 });
}

function genSSFs(): SSF[] {
 const tickers = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "GOOGL", "NFLX", "BABA", "TSM"];
 const spots: Record<string, number> = {
 AAPL: 178.5, MSFT: 415.2, NVDA: 882.4, TSLA: 182.6, AMZN: 185.4,
 META: 492.8, GOOGL: 162.3, NFLX: 612.4, BABA: 72.8, TSM: 142.6,
 };
 const months = ["Mar 25", "Jun 25"];
 return tickers.map((t, i) => {
 const rng = mulberry32(hashStr(t) ^ 4242);
 const spot = spots[t];
 const chgPct = (rng() - 0.48) * 3.2;
 const futuresPrice = spot * (1 + chgPct / 100 + 0.003);
 const premium = futuresPrice - spot;
 return {
 ticker: t,
 spotPrice: spot,
 futuresPrice,
 premium,
 volume: Math.floor(1000 + rng() * 25000),
 expiry: months[i % 2],
 };
 });
}

function genIRFutures(): IRFuture[] {
 const defs = [
 { symbol: "ZT", name: "2Y T-Note", basePrice: 101.42, baseYield: 4.72, dur: 1.84, dv01: 37.5 },
 { symbol: "ZF", name: "5Y T-Note", basePrice: 105.18, baseYield: 4.38, dur: 4.21, dv01: 85.2 },
 { symbol: "ZN", name: "10Y T-Note", basePrice: 108.34, baseYield: 4.24, dur: 8.46, dv01: 169.4 },
 { symbol: "ZB", name: "30Y T-Bond", basePrice: 118.26, baseYield: 4.41, dur: 19.2, dv01: 384.8 },
 { symbol: "UB", name: "Ultra Bond", basePrice: 125.14, baseYield: 4.62, dur: 25.8, dv01: 512.6 },
 ];
 return defs.map((d) => {
 const rng = mulberry32(hashStr(d.symbol) ^ 4242);
 const chg = (rng() - 0.5) * 0.8;
 return {
 symbol: d.symbol,
 name: d.name,
 price: d.basePrice + chg * 0.1,
 yield_: d.baseYield + (rng() - 0.5) * 0.12,
 dv01: d.dv01,
 duration: d.dur,
 change: chg,
 oi: Math.floor(200000 + rng() * 800000),
 };
 });
}

function genSOFRStrip(): SOFRPoint[] {
 const labels = ["1M", "3M", "6M", "12M"];
 const baseRates = [5.28, 5.12, 4.88, 4.52];
 return labels.map((label, i) => {
 const rng = mulberry32(4242 + i * 100);
 return { label, impliedRate: baseRates[i] + (rng() - 0.5) * 0.08 };
 });
}

function genFOMCPath(): FOMCMeeting[] {
 const meetings = [
 { date: "May 7", rate: 5.33 }, { date: "Jun 18", rate: 5.22 },
 { date: "Jul 30", rate: 5.10 }, { date: "Sep 17", rate: 4.97 },
 { date: "Oct 29", rate: 4.85 }, { date: "Dec 10", rate: 4.72 },
 { date: "Jan 28", rate: 4.62 }, { date: "Mar 18", rate: 4.52 },
 ];
 return meetings.map((m, i) => {
 const rng = mulberry32(4242 + i * 77);
 const probCut = Math.min(0.95, 0.1 + i * 0.1 + rng() * 0.15);
 const probHike = Math.max(0, 0.05 - i * 0.005);
 return {
 date: m.date,
 impliedRate: m.rate + (rng() - 0.5) * 0.06,
 probHike,
 probCut,
 probHold: Math.max(0, 1 - probCut - probHike),
 };
 });
}

function genIntlIR(): IntlIRFuture[] {
 const defs = [
 { symbol: "FGBL", name: "Bund 10Y", country: "DE", price: 132.84, yield_: 2.48 },
 { symbol: "FGBM", name: "Bobl 5Y", country: "DE", price: 118.42, yield_: 2.86 },
 { symbol: "Z", name: "Gilt 10Y", country: "GB", price: 96.28, yield_: 4.12 },
 { symbol: "JGB", name: "JGB 10Y", country: "JP", price: 147.18, yield_: 0.74 },
 { symbol: "OAT", name: "OAT 10Y", country: "FR", price: 128.64, yield_: 3.02 },
 { symbol: "BTP", name: "BTP 10Y", country: "IT", price: 122.16, yield_: 3.74 },
 ];
 return defs.map((d) => {
 const rng = mulberry32(hashStr(d.symbol + "intl") ^ 4242);
 return {
 symbol: d.symbol,
 name: d.name,
 country: d.country,
 price: d.price + (rng() - 0.5) * 0.8,
 yield_: d.yield_ + (rng() - 0.5) * 0.12,
 change: (rng() - 0.5) * 0.4,
 };
 });
}

function genFXFutures(): FXFuture[] {
 const defs = [
 { symbol: "6E", pair: "EUR/USD", price: 1.0842, rollCost: -0.00023 },
 { symbol: "6B", pair: "GBP/USD", price: 1.2618, rollCost: -0.00041 },
 { symbol: "6J", pair: "USD/JPY", price: 149.82, rollCost: 0.18 },
 { symbol: "6S", pair: "USD/CHF", price: 0.8964, rollCost: -0.00018 },
 { symbol: "6A", pair: "AUD/USD", price: 0.6542, rollCost: -0.00031 },
 { symbol: "6C", pair: "USD/CAD", price: 1.3618, rollCost: 0.00028 },
 { symbol: "6N", pair: "NZD/USD", price: 0.6012, rollCost: -0.00022 },
 { symbol: "6M", pair: "USD/MXN", price: 16.82, rollCost: 0.042 },
 ];
 const months = ["Mar 25", "Jun 25"];
 return defs.map((d, i) => {
 const rng = mulberry32(hashStr(d.symbol) ^ 4242);
 const chgPct = (rng() - 0.5) * 0.8;
 const change = d.price * chgPct / 100;
 const fwdAdj = (rng() - 0.48) * 0.0015;
 return {
 symbol: d.symbol,
 pair: d.pair,
 price: d.price + change,
 change,
 volume: Math.floor(10000 + rng() * 90000),
 rollCost: d.rollCost,
 forwardRate: d.price + fwdAdj,
 expiry: months[i % 2],
 };
 });
}

function genCryptoFutures(): CryptoFuture[] {
 const rngBTC = mulberry32(4242 + 1);
 const rngETH = mulberry32(4242 + 2);
 const btcSpot = 67420 + (rngBTC() - 0.5) * 2000;
 const ethSpot = 3480 + (rngETH() - 0.5) * 200;
 const btcFundingRaw = (rngBTC() - 0.45) * 0.002;
 const ethFundingRaw = (rngETH() - 0.45) * 0.0025;
 return [
 {
 symbol: "BTC", name: "Bitcoin",
 spotPrice: btcSpot,
 perpPrice: btcSpot * (1 + btcFundingRaw * 2),
 q1Price: btcSpot * (1 + 0.018 + rngBTC() * 0.005),
 q2Price: btcSpot * (1 + 0.036 + rngBTC() * 0.008),
 fundingRate8h: btcFundingRaw,
 fundingAnnualized: btcFundingRaw * 3 * 365,
 basis: btcFundingRaw * 2 * 100,
 },
 {
 symbol: "ETH", name: "Ethereum",
 spotPrice: ethSpot,
 perpPrice: ethSpot * (1 + ethFundingRaw * 2),
 q1Price: ethSpot * (1 + 0.022 + rngETH() * 0.006),
 q2Price: ethSpot * (1 + 0.044 + rngETH() * 0.009),
 fundingRate8h: ethFundingRaw,
 fundingAnnualized: ethFundingRaw * 3 * 365,
 basis: ethFundingRaw * 2 * 100,
 },
 ];
}

function genVIXFutures(): VIXFuture[] {
 const baseVIX = 16.8;
 const labels = ["M1 (Apr)", "M2 (May)", "M3 (Jun)", "M4 (Jul)", "M5 (Aug)", "M6 (Sep)"];
 const rng = mulberry32(4242 + 10);
 return labels.map((label, i) => {
 const contango = 0.8 + i * 0.5 + (rng() - 0.5) * 0.3;
 return {
 month: `M${i + 1}`,
 label,
 price: baseVIX + contango,
 change: (rng() - 0.5) * 1.2,
 oi: Math.floor(50000 + rng() * 200000),
 };
 });
}

function genVarianceSwaps(): VarianceSwap[] {
 const tenors = ["1M", "3M", "6M", "1Y"];
 const rng = mulberry32(4242 + 20);
 return tenors.map((tenor, i) => {
 const impliedVol = 17.2 + i * 0.8 + (rng() - 0.5) * 1.5;
 const realizedVol = 14.6 + i * 0.6 + (rng() - 0.5) * 2.0;
 const impliedVar = (impliedVol / 100) ** 2 * 252;
 const realizedVar = (realizedVol / 100) ** 2 * 252;
 return {
 tenor,
 impliedVar: impliedVar * 10000,
 realizedVar: realizedVar * 10000,
 impliedVol,
 realizedVol,
 spread: impliedVol - realizedVol,
 };
 });
}

function genHistVIX(): HistVIXBar[] {
 const ranges = ["9-12", "12-15", "15-18", "18-21", "21-25", "25-30", "30-40", "40+"];
 const weights = [0.04, 0.18, 0.28, 0.22, 0.12, 0.08, 0.05, 0.03];
 const rng = mulberry32(4242 + 30);
 const total = 504; // 2 years of trading days
 return ranges.map((range, i) => {
 const noise = (rng() - 0.5) * 0.02;
 const pct = Math.max(0.01, weights[i] + noise);
 return { range, count: Math.round(total * pct), pct };
 });
}

const CONTRACT_SPECS: ContractSpec[] = [
 { symbol: "ES", name: "E-mini S&P 500", exchange: "CME", tickSize: 0.25, tickValue: 12.50, contractSize: 50, sizeUnit: "× index", initialMargin: 12650, maintenanceMargin: 11500, dayTradingMargin: 3163, overnightMargin: 12650 },
 { symbol: "NQ", name: "E-mini Nasdaq-100", exchange: "CME", tickSize: 0.25, tickValue: 5.00, contractSize: 20, sizeUnit: "× index", initialMargin: 19800, maintenanceMargin: 18000, dayTradingMargin: 4950, overnightMargin: 19800 },
 { symbol: "YM", name: "E-mini Dow Jones", exchange: "CBOT", tickSize: 1.0, tickValue: 5.00, contractSize: 5, sizeUnit: "× index", initialMargin: 9350, maintenanceMargin: 8500, dayTradingMargin: 2338, overnightMargin: 9350 },
 { symbol: "RTY", name: "E-mini Russell 2000", exchange: "CME", tickSize: 0.1, tickValue: 5.00, contractSize: 50, sizeUnit: "× index", initialMargin: 7260, maintenanceMargin: 6600, dayTradingMargin: 1815, overnightMargin: 7260 },
 { symbol: "ZN", name: "10Y T-Note", exchange: "CBOT", tickSize: 0.015625,tickValue: 15.625, contractSize: 100000,sizeUnit: "face value", initialMargin: 1980, maintenanceMargin: 1800, dayTradingMargin: 495, overnightMargin: 1980 },
 { symbol: "ZB", name: "30Y T-Bond", exchange: "CBOT", tickSize: 0.03125, tickValue: 31.25, contractSize: 100000,sizeUnit: "face value", initialMargin: 3520, maintenanceMargin: 3200, dayTradingMargin: 880, overnightMargin: 3520 },
 { symbol: "6E", name: "Euro FX", exchange: "CME", tickSize: 0.00005, tickValue: 6.25, contractSize: 125000,sizeUnit: "EUR", initialMargin: 2310, maintenanceMargin: 2100, dayTradingMargin: 578, overnightMargin: 2310 },
 { symbol: "6J", name: "Japanese Yen", exchange: "CME", tickSize: 0.0000001,tickValue: 1.25, contractSize: 12500000,sizeUnit: "JPY", initialMargin: 3080, maintenanceMargin: 2800, dayTradingMargin: 770, overnightMargin: 3080 },
 { symbol: "BTC", name: "Bitcoin", exchange: "CME", tickSize: 5.0, tickValue: 25.00, contractSize: 5, sizeUnit: "BTC", initialMargin: 73260, maintenanceMargin: 66600, dayTradingMargin: 18315,overnightMargin: 73260 },
 { symbol: "ETH", name: "Ether", exchange: "CME", tickSize: 0.5, tickValue: 25.00, contractSize: 50, sizeUnit: "ETH", initialMargin: 17050, maintenanceMargin: 15500, dayTradingMargin: 4263, overnightMargin: 17050 },
];

// ── Reusable sub-components ────────────────────────────────────────────────────

function ChgBadge({ v, suffix = "%" }: { v: number; suffix?: string }) {
 return (
 <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-muted-foreground font-semibold tabular-nums", chgCls(v), chgBg(v))}>
 {up(v) ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
 {up(v) ? "+" : ""}{v.toFixed(2)}{suffix}
 </span>
 );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
 return <h3 className="text-sm font-semibold text-foreground mb-2">{children}</h3>;
}

function DataRow({ label, value, valueClass }: { label: string; value: string | React.ReactNode; valueClass?: string }) {
 return (
 <div className="flex justify-between items-center py-0.5">
 <span className="text-xs text-muted-foreground">{label}</span>
 <span className={cn("text-xs text-muted-foreground font-medium tabular-nums", valueClass)}>{value}</span>
 </div>
 );
}

// ── Tab 1: Equity & Index Futures ──────────────────────────────────────────────

function EquityFuturesTab() {
 const indexFutures = useMemo(genIndexFutures, []);
 const ssfs = useMemo(genSSFs, []);
 const [regionFilter, setRegionFilter] = useState<"All" | "US" | "EU" | "Asia" | "Sector">("All");
 const [selectedFuture, setSelectedFuture] = useState<IndexFuture | null>(null);

 const filtered = regionFilter === "All" ? indexFutures : indexFutures.filter((f) => f.region === regionFilter);

 const regionColors: Record<string, string> = {
 US: "text-foreground", EU: "text-yellow-400", Asia: "text-red-400", Sector: "text-foreground",
 };

 return (
 <div className="flex flex-col gap-4">
 {/* Region filter */}
 <div className="flex flex-wrap gap-1.5">
 {(["All", "US", "EU", "Asia", "Sector"] as const).map((r) => (
 <button
 key={r}
 onClick={() => setRegionFilter(r)}
 className={cn(
 "rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground font-medium transition-colors",
 regionFilter === r
 ? "border-primary bg-muted/10 text-foreground"
 : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
 )}
 >
 {r}
 </button>
 ))}
 </div>

 {/* Index Futures Table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-semibold flex items-center gap-2">
 Index Futures
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 {["Symbol", "Name", "Region", "Spot", "Futures", "Fair Value", "Premium", "Volume", "OI", "Expiry", "Roll Spread"].map((h) => (
 <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((f) => {
 const premPct = (f.premium / f.spotPrice) * 100;
 return (
 <tr
 key={f.symbol}
 className="border-b border-border hover:bg-muted/20 cursor-pointer transition-colors"
 onClick={() => setSelectedFuture(selectedFuture?.symbol === f.symbol ? null : f)}
 >
 <td className="px-3 py-2.5">
 <span className={cn("font-semibold text-xs", regionColors[f.region] ?? "text-foreground")}>{f.symbol}</span>
 </td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[160px] truncate">{f.name}</td>
 <td className="px-3 py-2.5">
 <Badge variant="outline" className="text-xs text-muted-foreground py-0">{f.region}</Badge>
 </td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground font-medium">{fmtPrice(f.spotPrice)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs font-medium text-foreground">{fmtPrice(f.futuresPrice)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">{fmtPrice(f.fairValue)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">
 <span className={cn("font-medium", chgCls(f.premium))}>
 {up(f.premium) ? "+" : ""}{fmt(premPct, 3)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">{fmtLarge(f.volume)}</td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">{fmtLarge(f.oi)}</td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground">{f.expiry}</td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">
 <span className="text-amber-400">{f.rollSpread > 0 ? "+" : ""}{f.rollSpread.toFixed(2)}</span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Basis/Roll Calendar */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 Basis & Roll Calendar — Front Month vs Next Month
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 {indexFutures.slice(0, 8).map((f) => (
 <div key={f.symbol} className="rounded-lg border border-border bg-muted/20 p-2.5">
 <div className="flex items-center justify-between mb-1">
 <span className={cn("text-xs font-semibold", regionColors[f.region] ?? "text-foreground")}>{f.symbol}</span>
 <Badge variant="outline" className="text-xs text-muted-foreground py-0">{f.expiry}</Badge>
 </div>
 <div className="text-xs text-muted-foreground">Roll spread</div>
 <div className="text-sm font-medium tabular-nums text-amber-400">
 {f.rollSpread > 0 ? "+" : ""}{f.rollSpread.toFixed(2)}
 </div>
 <div className="text-xs text-muted-foreground mt-0.5">
 {f.rollSpread < 0 ? "Backwardation" : "Contango"}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Single Stock Futures */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 Single Stock Futures (SSF)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 {["Ticker", "Spot", "Futures", "Premium", "Vol", "Expiry"].map((h) => (
 <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {ssfs.map((s) => {
 const premPct = (s.premium / s.spotPrice) * 100;
 return (
 <tr key={s.ticker} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="px-3 py-2.5 font-medium text-xs text-foreground">{s.ticker}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground font-medium">{fmtPrice(s.spotPrice)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs font-medium text-foreground">{fmtPrice(s.futuresPrice)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">
 <span className={cn("font-medium", chgCls(premPct))}>{up(premPct) ? "+" : ""}{premPct.toFixed(3)}%</span>
 </td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">{fmtLarge(s.volume)}</td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground">{s.expiry}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 <p className="text-xs text-muted-foreground/50 text-center">
 All prices are simulated for educational purposes. Premium = Futures − Fair Value.
 </p>
 </div>
 );
}

// ── Tab 2: Interest Rate Futures ───────────────────────────────────────────────

function InterestRateFuturesTab() {
 const irFutures = useMemo(genIRFutures, []);
 const sofr = useMemo(genSOFRStrip, []);
 const fomc = useMemo(genFOMCPath, []);
 const intl = useMemo(genIntlIR, []);

 // Yield curve SVG from treasury futures
 const curveData = irFutures.map((f, i) => ({ tenor: [2, 5, 10, 30, 30][i] ?? 30, yield_: f.yield_ }));

 const minYield = Math.min(...curveData.map((d) => d.yield_)) - 0.1;
 const maxYield = Math.max(...curveData.map((d) => d.yield_)) + 0.1;
 const svgW = 320, svgH = 100;
 const xScale = (tenor: number) => ((tenor - 2) / (30 - 2)) * (svgW - 40) + 20;
 const yScale = (y: number) => svgH - 16 - ((y - minYield) / (maxYield - minYield)) * (svgH - 24);
 const curvePts = curveData.map((d) => `${xScale(d.tenor)},${yScale(d.yield_)}`).join("");

 return (
 <div className="flex flex-col gap-4">
 {/* US Treasury Futures */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 US Treasury Futures
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 {["Symbol", "Name", "Price", "Yield", "Chg (pts)", "Duration", "DV01/Contract", "OI"].map((h) => (
 <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {irFutures.map((f) => (
 <tr key={f.symbol} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="px-3 py-2.5 font-medium text-xs text-green-400">{f.symbol}</td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground">{f.name}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs font-medium text-foreground">{f.price.toFixed(3)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">
 <span className={chgCls(-f.yield_)}>{f.yield_.toFixed(3)}%</span>
 </td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">
 <ChgBadge v={f.change} suffix=" pts" />
 </td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">{f.duration.toFixed(1)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-amber-400">${f.dv01.toFixed(1)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">{fmtLarge(f.oi)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Yield Curve + SOFR Strip */}
 <div className="grid gap-4 sm:grid-cols-2">
 {/* Yield Curve from Futures */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">Yield Curve (from Futures)</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
 <line key={i} x1={20} y1={8 + p * (svgH - 24)} x2={svgW - 20} y2={8 + p * (svgH - 24)}
 stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
 ))}
 {/* Curve fill */}
 <polygon
 points={`20,${svgH - 8} ${curvePts} ${xScale(30)},${svgH - 8}`}
 fill="rgba(34,197,94,0.08)"
 />
 {/* Curve line */}
 <polyline points={curvePts} fill="none" stroke="#22c55e" strokeWidth={1.5} />
 {/* Dots */}
 {curveData.map((d, i) => (
 <circle key={i} cx={xScale(d.tenor)} cy={yScale(d.yield_)} r={3} fill="#22c55e" />
 ))}
 {/* Labels */}
 {[{ t: 2, label: "2Y" }, { t: 5, label: "5Y" }, { t: 10, label: "10Y" }, { t: 30, label: "30Y" }].map((l) => (
 <text key={l.label} x={xScale(l.t)} y={svgH - 1} textAnchor="middle" fontSize={8} fill="#9ca3af">{l.label}</text>
 ))}
 {curveData.map((d, i) => (
 <text key={i} x={xScale(d.tenor)} y={yScale(d.yield_) - 5} textAnchor="middle" fontSize={7} fill="#6ee7b7">
 {d.yield_.toFixed(2)}%
 </text>
 ))}
 </svg>
 </CardContent>
 </Card>

 {/* SOFR Strip */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">SOFR Futures — Implied Rate Strip</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 flex flex-col gap-2">
 {sofr.map((s) => (
 <div key={s.label} className="flex items-center gap-3">
 <span className="w-8 text-xs font-medium text-foreground">{s.label}</span>
 <Progress value={(s.impliedRate / 6.5) * 100} className="h-2 flex-1" />
 <span className="text-xs font-medium tabular-nums text-foreground w-14 text-right">{s.impliedRate.toFixed(3)}%</span>
 </div>
 ))}
 <p className="text-xs text-muted-foreground mt-1">Implied overnight rate from SOFR futures pricing</p>
 </CardContent>
 </Card>
 </div>

 {/* FOMC Path */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 Fed Funds Futures — Market-Implied FOMC Path
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Meeting", "Implied Rate", "P(Hike)", "P(Hold)", "P(Cut)"].map((h) => (
 <th key={h} className="pb-2 text-left font-medium text-muted-foreground pr-4 whitespace-nowrap">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {fomc.map((m, i) => (
 <tr key={i} className="border-b border-border">
 <td className="py-2 pr-4 font-medium text-foreground">{m.date}</td>
 <td className="py-2 pr-4 tabular-nums text-amber-400 font-medium">{m.impliedRate.toFixed(2)}%</td>
 <td className="py-2 pr-4">
 <span className="text-red-400">{(m.probHike * 100).toFixed(0)}%</span>
 </td>
 <td className="py-2 pr-4">
 <div className="flex items-center gap-1">
 <Progress value={m.probHold * 100} className="h-1.5 w-16" />
 <span className="text-muted-foreground">{(m.probHold * 100).toFixed(0)}%</span>
 </div>
 </td>
 <td className="py-2">
 <span className="text-emerald-400">{(m.probCut * 100).toFixed(0)}%</span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* International Rate Futures */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 International Rate Futures
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 {["Symbol", "Name", "Country", "Price", "Yield", "Change"].map((h) => (
 <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {intl.map((f) => (
 <tr key={f.symbol + f.country} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="px-3 py-2.5 font-medium text-xs text-foreground">{f.symbol}</td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground">{f.name}</td>
 <td className="px-3 py-2.5">
 <Badge variant="outline" className="text-xs text-muted-foreground py-0">{f.country}</Badge>
 </td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground font-medium">{f.price.toFixed(3)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-amber-400">{f.yield_.toFixed(3)}%</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">
 <ChgBadge v={f.change} suffix=" pts" />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 3: Currency & Crypto Futures ──────────────────────────────────────────

function CurrencyCryptoTab() {
 const fxFutures = useMemo(genFXFutures, []);
 const cryptoFutures = useMemo(genCryptoFutures, []);

 // EUR/USD implied cross rates
 const eurUsd = fxFutures.find((f) => f.pair === "EUR/USD")?.price ?? 1.0842;
 const gbpUsd = fxFutures.find((f) => f.pair === "GBP/USD")?.price ?? 1.2618;
 const eurGbp = eurUsd / gbpUsd;
 const usdJpy = fxFutures.find((f) => f.pair === "USD/JPY")?.price ?? 149.82;
 const eurJpy = eurUsd * usdJpy;
 const gbpJpy = gbpUsd * usdJpy;
 const audUsd = fxFutures.find((f) => f.pair === "AUD/USD")?.price ?? 0.6542;

 const crossRates = [
 { pair: "EUR/GBP", rate: eurGbp },
 { pair: "EUR/JPY", rate: eurJpy },
 { pair: "GBP/JPY", rate: gbpJpy },
 { pair: "AUD/JPY", rate: audUsd * usdJpy },
 ];

 return (
 <div className="flex flex-col gap-4">
 {/* FX Futures Table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 FX Futures (CME)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 {["Symbol", "Pair", "Futures Price", "Change", "Volume", "Roll Cost", "Forward Rate", "Expiry"].map((h) => (
 <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {fxFutures.map((f) => (
 <tr key={f.symbol} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="px-3 py-2.5 font-medium text-xs text-foreground">{f.symbol}</td>
 <td className="px-3 py-2.5 text-xs font-medium text-foreground">{f.pair}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs font-medium text-foreground">{fmtPrice(f.price)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">
 <span className={chgCls(f.change)}>
 {up(f.change) ? "+" : ""}{fmtPrice(Math.abs(f.change))}
 </span>
 </td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">{fmtLarge(f.volume)}</td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">
 <span className={cn("text-xs", f.rollCost < 0 ? "text-emerald-400" : "text-red-400")}>
 {f.rollCost > 0 ? "+" : ""}{fmtPrice(f.rollCost)}
 </span>
 </td>
 <td className="px-3 py-2.5 tabular-nums text-xs text-muted-foreground">{fmtPrice(f.forwardRate)}</td>
 <td className="px-3 py-2.5 text-xs text-muted-foreground">{f.expiry}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Implied Cross Rates */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">Implied Cross Rates (from Futures)</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 {crossRates.map((c) => (
 <div key={c.pair} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
 <div className="text-xs text-muted-foreground mb-1">{c.pair}</div>
 <div className="text-sm font-medium tabular-nums text-foreground">{fmtPrice(c.rate)}</div>
 <div className="text-xs text-muted-foreground mt-0.5">Implied from futures</div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Cross rates derived from: EUR/GBP = EUR/USD ÷ GBP/USD. Covered Interest Parity: F = S × (1+r_d)/(1+r_f)
 </p>
 </CardContent>
 </Card>

 {/* Crypto Futures */}
 {cryptoFutures.map((c) => (
 <Card key={c.symbol} className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Zap className="h-4 w-4 text-orange-400" /> {c.name} ({c.symbol}) — Futures Structure
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-3">
 <div className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="text-xs text-muted-foreground mb-1">Spot Price</div>
 <div className="text-sm font-medium tabular-nums">${fmtLarge(c.spotPrice)}</div>
 </div>
 <div className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="text-xs text-muted-foreground mb-1">Perpetual</div>
 <div className="text-sm font-medium tabular-nums text-amber-400">${fmtLarge(c.perpPrice)}</div>
 <div className="text-xs text-muted-foreground">
 Basis: <span className={chgCls(c.basis)}>{c.basis > 0 ? "+" : ""}{c.basis.toFixed(3)}%</span>
 </div>
 </div>
 <div className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="text-xs text-muted-foreground mb-1">Q1 (Jun 25)</div>
 <div className="text-sm font-medium tabular-nums text-foreground">${fmtLarge(c.q1Price)}</div>
 </div>
 <div className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="text-xs text-muted-foreground mb-1">Q2 (Sep 25)</div>
 <div className="text-sm font-medium tabular-nums text-foreground">${fmtLarge(c.q2Price)}</div>
 </div>
 </div>
 {/* Funding Rate */}
 <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <div>
 <div className="text-xs text-muted-foreground mb-0.5">8-Hour Funding Rate</div>
 <div className={cn("text-lg font-medium tabular-nums", chgCls(c.fundingRate8h))}>
 {c.fundingRate8h > 0 ? "+" : ""}{(c.fundingRate8h * 100).toFixed(4)}%
 </div>
 </div>
 <div className="text-right">
 <div className="text-xs text-muted-foreground mb-0.5">Annualized</div>
 <div className={cn("text-sm font-medium tabular-nums", chgCls(c.fundingAnnualized))}>
 {c.fundingAnnualized > 0 ? "+" : ""}{(c.fundingAnnualized * 100).toFixed(2)}%
 </div>
 </div>
 <div className="text-right">
 <div className="text-xs text-muted-foreground mb-0.5">Next Funding</div>
 <div className="text-xs font-medium text-foreground">in ~4h 22m</div>
 </div>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 {c.fundingRate8h > 0
 ? "Positive funding: longs pay shorts. Signals over-leveraged long positioning."
 : "Negative funding: shorts pay longs. Signals over-leveraged short positioning."}
 </p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 );
}

// ── Tab 4: Volatility Products ────────────────────────────────────────────────

function VolatilityTab() {
 const vixSpot = 16.8;
 const vvix = 88.4;
 const vixFutures = useMemo(genVIXFutures, []);
 const varSwaps = useMemo(genVarianceSwaps, []);
 const histVIX = useMemo(genHistVIX, []);

 // VIX term structure SVG
 const svgW = 360, svgH = 120;
 const prices = vixFutures.map((f) => f.price);
 const minP = Math.min(vixSpot, ...prices) - 1;
 const maxP = Math.max(...prices) + 1;
 const pts = [
 { x: 30, y: svgH - 20 - ((vixSpot - minP) / (maxP - minP)) * (svgH - 30) },
 ...vixFutures.map((f, i) => ({
 x: 30 + (i + 1) * ((svgW - 40) / 7),
 y: svgH - 20 - ((f.price - minP) / (maxP - minP)) * (svgH - 30),
 })),
 ];
 const polyPts = pts.map((p) => `${p.x},${p.y}`).join("");
 const fillPts = `${pts[0].x},${svgH - 20} ${polyPts} ${pts[pts.length - 1].x},${svgH - 20}`;
 const isContango = vixFutures[vixFutures.length - 1].price > vixSpot;

 // Hist VIX histogram SVG
 const maxCount = Math.max(...histVIX.map((b) => b.count));
 const histW = 360, histH = 100;
 const barW = (histW - 40) / histVIX.length;

 // VIX options chain (synthetic)
 const vixStrikeRange = [12, 14, 16, 18, 20, 22, 25];
 const vixOptRng = mulberry32(4242 + 50);
 const vixOpts = vixStrikeRange.map((k) => {
 const moneyness = (k - vixSpot) / vixSpot;
 const iv = 85 + Math.abs(moneyness) * 40 + vixOptRng() * 8;
 const callPrice = Math.max(0.05, vixSpot - k + vixOptRng() * 0.8);
 const putPrice = Math.max(0.05, k - vixSpot + vixOptRng() * 0.8);
 return { strike: k, iv, callPrice: callPrice > 0 ? callPrice : 0.05, putPrice: putPrice > 0 ? putPrice : 0.05 };
 });

 return (
 <div className="flex flex-col gap-4">
 {/* VIX Header Cards */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <div className="text-xs text-muted-foreground mb-1">VIX Spot</div>
 <div className={cn("text-2xl font-semibold tabular-nums", vixSpot < 20 ? "text-emerald-400" : vixSpot < 30 ? "text-amber-400" : "text-red-400")}>
 {vixSpot.toFixed(2)}
 </div>
 <div className="text-xs text-muted-foreground mt-0.5">
 {vixSpot < 20 ? "Low fear" : vixSpot < 30 ? "Moderate" : "High fear"}
 </div>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <div className="text-xs text-muted-foreground mb-1">VVIX (Vol of Vol)</div>
 <div className={cn("text-lg font-medium tabular-nums", vvix < 100 ? "text-emerald-400" : "text-amber-400")}>
 {vvix.toFixed(1)}
 </div>
 <div className="text-xs text-muted-foreground mt-0.5">VIX of VIX options</div>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <div className="text-xs text-muted-foreground mb-1">UVXY (2× VIX)</div>
 <div className="text-lg font-medium tabular-nums text-red-400">8.42</div>
 <ChgBadge v={-3.2} />
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <div className="text-xs text-muted-foreground mb-1">SVIX (Short VIX)</div>
 <div className="text-lg font-medium tabular-nums text-emerald-400">42.18</div>
 <ChgBadge v={1.4} />
 </CardContent>
 </Card>
 </div>

 {/* VIX Futures + Term Structure */}
 <div className="grid gap-4 sm:grid-cols-2">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 VIX Futures Strip (M1–M6)
 <Badge variant="outline" className={cn("text-xs", isContango ? "text-orange-400 border-orange-400/30" : "text-emerald-400 border-emerald-400/30")}>
 {isContango ? "Contango" : "Backwardation"}
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 {["Contract", "Price", "Chg", "OI"].map((h) => (
 <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {[{ month: "Spot", label: "VIX Spot", price: vixSpot, change: 0, oi: 0 }, ...vixFutures].map((f) => (
 <tr key={f.month} className="border-b border-border hover:bg-muted/20">
 <td className="px-3 py-2 font-medium text-foreground">{f.label ?? f.month}</td>
 <td className="px-3 py-2 tabular-nums font-medium text-amber-400">{f.price.toFixed(2)}</td>
 <td className="px-3 py-2 tabular-nums">
 {f.change !== 0 ? <ChgBadge v={f.change} suffix="" /> : <span className="text-muted-foreground">—</span>}
 </td>
 <td className="px-3 py-2 tabular-nums text-muted-foreground">
 {"oi" in f && (f as VIXFuture).oi > 0 ? fmtLarge((f as VIXFuture).oi) : "—"}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>

 {/* Term Structure SVG */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">VIX Term Structure</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
 {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
 <line key={i} x1={30} y1={10 + p * (svgH - 30)} x2={svgW - 10} y2={10 + p * (svgH - 30)}
 stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
 ))}
 <polygon points={fillPts} fill={isContango ? "rgba(251,146,60,0.1)" : "rgba(34,197,94,0.1)"} />
 <polyline points={polyPts} fill="none" stroke={isContango ? "#fb923c" : "#22c55e"} strokeWidth={1.5} />
 {pts.map((p, i) => (
 <circle key={i} cx={p.x} cy={p.y} r={3} fill={isContango ? "#fb923c" : "#22c55e"} />
 ))}
 {["Spot", ...vixFutures.map((f) => f.month)].map((label, i) => (
 <text key={i} x={pts[i]?.x ?? 0} y={svgH - 5} textAnchor="middle" fontSize={8} fill="#9ca3af">{label}</text>
 ))}
 {pts.map((p, i) => {
 const val = i === 0 ? vixSpot : vixFutures[i - 1].price;
 return (
 <text key={`val-${i}`} x={p.x} y={p.y - 5} textAnchor="middle" fontSize={7} fill={isContango ? "#fb923c" : "#22c55e"}>
 {val.toFixed(1)}
 </text>
 );
 })}
 </svg>
 </CardContent>
 </Card>
 </div>

 {/* VIX Options Chain */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">VIX Options Chain (Near-Term)</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 <th className="px-3 py-2 text-left font-medium text-muted-foreground" colSpan={2}>Call</th>
 <th className="px-3 py-2 text-center font-medium text-muted-foreground">Strike</th>
 <th className="px-3 py-2 text-right font-medium text-muted-foreground" colSpan={2}>Put</th>
 </tr>
 <tr className="border-b border-border">
 <th className="px-3 py-1.5 text-left text-xs text-muted-foreground">Price</th>
 <th className="px-3 py-1.5 text-left text-xs text-muted-foreground">IV</th>
 <th className="px-3 py-1.5 text-center text-xs font-medium text-foreground">Strike</th>
 <th className="px-3 py-1.5 text-right text-xs text-muted-foreground">IV</th>
 <th className="px-3 py-1.5 text-right text-xs text-muted-foreground">Price</th>
 </tr>
 </thead>
 <tbody>
 {vixOpts.map((o) => {
 const atm = Math.abs(o.strike - vixSpot) < 2;
 return (
 <tr key={o.strike} className={cn("border-b border-border", atm && "bg-amber-500/5")}>
 <td className="px-3 py-2 tabular-nums text-emerald-400 font-medium">{o.callPrice.toFixed(2)}</td>
 <td className="px-3 py-2 tabular-nums text-muted-foreground">{o.iv.toFixed(1)}%</td>
 <td className={cn("px-3 py-2 text-center font-medium", atm ? "text-amber-400" : "text-foreground")}>{o.strike}</td>
 <td className="px-3 py-2 tabular-nums text-muted-foreground text-right">{o.iv.toFixed(1)}%</td>
 <td className="px-3 py-2 tabular-nums text-red-400 font-medium text-right">{o.putPrice.toFixed(2)}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Variance Swaps */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">Variance Swaps — Implied vs Realized Variance</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 flex flex-col gap-3">
 {varSwaps.map((v) => (
 <div key={v.tenor} className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-medium text-foreground">{v.tenor} Variance Swap</span>
 <Badge variant="outline" className={cn("text-xs", v.spread > 0 ? "text-orange-400 border-orange-400/30" : "text-emerald-400 border-emerald-400/30")}>
 Spread: {v.spread > 0 ? "+" : ""}{v.spread.toFixed(2)} vol pts
 </Badge>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <div className="text-xs text-muted-foreground mb-1">Implied Variance (var vega × 10k)</div>
 <Progress value={(v.impliedVar / 80)} className="h-2 mb-1" />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Implied Vol: {v.impliedVol.toFixed(2)}%</span>
 <span className="text-amber-400">{v.impliedVar.toFixed(1)} vv</span>
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground mb-1">Realized Variance</div>
 <Progress value={(v.realizedVar / 80)} className="h-2 mb-1" />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Realized Vol: {v.realizedVol.toFixed(2)}%</span>
 <span className="text-emerald-400">{v.realizedVar.toFixed(1)} vv</span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Historical VIX Histogram */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">Historical VIX Distribution — Last 2 Years (504 sessions)</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <svg viewBox={`0 0 ${histW} ${histH}`} className="w-full h-auto">
 {histVIX.map((b, i) => {
 const barH = ((b.count / maxCount) * (histH - 30));
 const x = 20 + i * barW + 2;
 const y = histH - 20 - barH;
 const isHighFear = b.range.startsWith("30") || b.range.startsWith("40");
 const isMod = b.range.startsWith("21") || b.range.startsWith("25");
 const color = isHighFear ? "#f87171" : isMod ? "#fbbf24" : "#22c55e";
 return (
 <g key={b.range}>
 <rect x={x} y={y} width={barW - 4} height={barH} fill={color} fillOpacity={0.7} rx={1} />
 <text x={x + (barW - 4) / 2} y={histH - 8} textAnchor="middle" fontSize={7} fill="#9ca3af">{b.range}</text>
 <text x={x + (barW - 4) / 2} y={y - 2} textAnchor="middle" fontSize={7} fill="#e5e7eb">{b.count}</text>
 </g>
 );
 })}
 <line x1={20} y1={histH - 20} x2={histW - 10} y2={histH - 20} stroke="#374151" strokeWidth={1} />
 </svg>
 <p className="text-xs text-muted-foreground mt-2">
 Distribution of daily VIX closes. VIX &lt; 20 = low fear (green), 20-30 = moderate (amber), &gt; 30 = elevated (red).
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 5: Futures Order & Margin ─────────────────────────────────────────────

function MarginOrderTab() {
 const [selectedSpec, setSelectedSpec] = useState<ContractSpec>(CONTRACT_SPECS[0]);
 const [numContracts, setNumContracts] = useState(1);
 const [accountSize, setAccountSize] = useState(50000);
 const [entryPrice, setEntryPrice] = useState(selectedSpec.initialMargin > 0 ? 5210 : 100);
 const [side, setSide] = useState<"long" | "short">("long");
 const [priceMoveVal, setPriceMoveVal] = useState([10]);
 const [marginAcctPositions, setMarginAcctPositions] = useState<Array<{ spec: ContractSpec; qty: number }>>([]);

 // Derived calcs
 const notional = entryPrice * selectedSpec.contractSize * numContracts;
 const initMarginReq = selectedSpec.initialMargin * numContracts;
 const maintMarginReq = selectedSpec.maintenanceMargin * numContracts;
 const dayTradeMarginReq = selectedSpec.dayTradingMargin * numContracts;
 const marginCallPrice = side === "long"
 ? entryPrice - (initMarginReq - maintMarginReq) / (selectedSpec.contractSize * numContracts)
 : entryPrice + (initMarginReq - maintMarginReq) / (selectedSpec.contractSize * numContracts);

 const ticksPerMove = priceMoveVal[0] / selectedSpec.tickSize;
 const pnlPerContract = ticksPerMove * selectedSpec.tickValue;
 const totalPnl = pnlPerContract * numContracts * (side === "long" ? 1 : -1);

 // Portfolio margin
 const portfolioMargin = marginAcctPositions.reduce((sum, p) => sum + p.spec.initialMargin * p.qty, 0);
 const portfolioMarginPct = portfolioMargin / accountSize * 100;
 const marginBuffer = accountSize - portfolioMargin;

 function addPosition() {
 const existing = marginAcctPositions.find((p) => p.spec.symbol === selectedSpec.symbol);
 if (existing) {
 setMarginAcctPositions(marginAcctPositions.map((p) =>
 p.spec.symbol === selectedSpec.symbol ? { ...p, qty: p.qty + 1 } : p
 ));
 } else {
 setMarginAcctPositions([...marginAcctPositions, { spec: selectedSpec, qty: 1 }]);
 }
 }

 function removePosition(symbol: string) {
 setMarginAcctPositions(marginAcctPositions.filter((p) => p.spec.symbol !== symbol));
 }

 // Handle contract change
 function handleContractChange(spec: ContractSpec) {
 setSelectedSpec(spec);
 // Set a reasonable entry price based on spec
 const priceMap: Record<string, number> = {
 ES: 5210, NQ: 18240, YM: 39180, RTY: 2084,
 ZN: 108.34, ZB: 118.26, "6E": 1.0842, "6J": 0.00668,
 BTC: 67420, ETH: 3480,
 };
 setEntryPrice(priceMap[spec.symbol] ?? 100);
 setPriceMoveVal([spec.tickSize * 10]);
 }

 return (
 <div className="flex flex-col gap-4">
 {/* Contract Selector */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 Select Contract
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="flex flex-wrap gap-1.5">
 {CONTRACT_SPECS.map((spec) => (
 <button
 key={spec.symbol}
 onClick={() => handleContractChange(spec)}
 className={cn(
 "rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground font-medium transition-colors",
 selectedSpec.symbol === spec.symbol
 ? "border-primary bg-muted/10 text-foreground"
 : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
 )}
 >
 {spec.symbol}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Contract Specs */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium">
 Contract Specifications — {selectedSpec.name} ({selectedSpec.symbol})
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
 <DataRow label="Exchange" value={selectedSpec.exchange} />
 <DataRow label="Tick Size" value={selectedSpec.tickSize.toString()} />
 <DataRow label="Tick Value" value={`$${selectedSpec.tickValue.toFixed(2)}`} valueClass="text-amber-400" />
 <DataRow label="Contract Size" value={`${selectedSpec.contractSize.toLocaleString()} ${selectedSpec.sizeUnit}`} />
 <DataRow label="Initial Margin" value={`$${selectedSpec.initialMargin.toLocaleString()}`} valueClass="text-red-400" />
 <DataRow label="Maintenance Margin" value={`$${selectedSpec.maintenanceMargin.toLocaleString()}`} valueClass="text-orange-400" />
 <DataRow label="Day Trading Margin" value={`$${selectedSpec.dayTradingMargin.toLocaleString()}`} valueClass="text-emerald-400" />
 <DataRow label="Overnight Margin" value={`$${selectedSpec.overnightMargin.toLocaleString()}`} valueClass="text-red-400" />
 <DataRow label="Day/Overnight Ratio" value={`${((selectedSpec.dayTradingMargin / selectedSpec.overnightMargin) * 100).toFixed(0)}%`} />
 </div>
 </CardContent>
 </Card>

 {/* P&L Tick Tracker */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 P&L Tick Tracker
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 flex flex-col gap-3">
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <div>
 <label className="text-xs text-muted-foreground block mb-1">Contracts</label>
 <div className="flex items-center gap-1">
 <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setNumContracts(Math.max(1, numContracts - 1))}>−</Button>
 <span className="flex-1 text-center text-sm font-medium tabular-nums">{numContracts}</span>
 <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setNumContracts(numContracts + 1)}>+</Button>
 </div>
 </div>
 <div>
 <label className="text-xs text-muted-foreground block mb-1">Side</label>
 <div className="flex rounded-lg border border-border overflow-hidden h-7">
 <button
 className={cn("flex-1 text-xs font-medium transition-colors", side === "long" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:bg-muted/20")}
 onClick={() => setSide("long")}
 >Long</button>
 <button
 className={cn("flex-1 text-xs font-medium transition-colors", side === "short" ? "bg-red-500/20 text-red-400" : "text-muted-foreground hover:bg-muted/20")}
 onClick={() => setSide("short")}
 >Short</button>
 </div>
 </div>
 <div className="col-span-2">
 <label className="text-xs text-muted-foreground block mb-1">
 Price Move: {priceMoveVal[0].toFixed(selectedSpec.tickSize < 0.01 ? 5 : selectedSpec.tickSize < 1 ? 2 : 0)} pts
 ({(priceMoveVal[0] / selectedSpec.tickSize).toFixed(0)} ticks)
 </label>
 <Slider
 value={priceMoveVal}
 onValueChange={setPriceMoveVal}
 min={selectedSpec.tickSize}
 max={Math.max(selectedSpec.tickSize * 200, entryPrice * 0.05)}
 step={selectedSpec.tickSize}
 className="mt-1"
 />
 </div>
 </div>

 {/* Results */}
 <div className="rounded-lg border border-border bg-muted/20 p-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
 <div>
 <div className="text-xs text-muted-foreground">P&L per Contract</div>
 <div className={cn("text-sm font-medium tabular-nums", chgCls(pnlPerContract))}>
 {pnlPerContract > 0 ? "+" : ""}${pnlPerContract.toFixed(2)}
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Total P&L ({numContracts} ct)</div>
 <div className={cn("text-sm font-medium tabular-nums", chgCls(totalPnl))}>
 {totalPnl > 0 ? "+" : ""}${totalPnl.toFixed(2)}
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Notional Value</div>
 <div className="text-sm font-medium tabular-nums">${fmtLarge(notional)}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Return on Margin</div>
 <div className={cn("text-sm font-medium tabular-nums", chgCls(totalPnl))}>
 {initMarginReq > 0 ? `${((totalPnl / initMarginReq) * 100).toFixed(2)}%` : "N/A"}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Margin Account Simulator */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 Margin Account Simulator
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 flex flex-col gap-3">
 <div className="flex items-center gap-3 flex-wrap">
 <div>
 <label className="text-xs text-muted-foreground block mb-1">Account Size</label>
 <div className="flex gap-1">
 {[25000, 50000, 100000, 250000].map((amt) => (
 <button
 key={amt}
 onClick={() => setAccountSize(amt)}
 className={cn(
 "rounded border px-2 py-0.5 text-xs text-muted-foreground font-medium transition-colors",
 accountSize === amt ? "border-primary bg-muted/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40",
 )}
 >
 ${fmtLarge(amt)}
 </button>
 ))}
 </div>
 </div>
 <Button size="sm" variant="outline" className="h-7 text-xs text-muted-foreground mt-4" onClick={addPosition}>
 + Add {selectedSpec.symbol}
 </Button>
 </div>

 {/* Margin progress */}
 <div>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className="text-muted-foreground">Portfolio Margin Used</span>
 <span className={cn("font-medium", portfolioMarginPct > 80 ? "text-red-400" : portfolioMarginPct > 50 ? "text-amber-400" : "text-emerald-400")}>
 ${portfolioMargin.toLocaleString()} / ${accountSize.toLocaleString()} ({portfolioMarginPct.toFixed(1)}%)
 </span>
 </div>
 <Progress
 value={Math.min(100, portfolioMarginPct)}
 className="h-3"
 />
 {portfolioMarginPct > 80 && (
 <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
 Margin usage exceeds 80% — margin call risk!
 </div>
 )}
 </div>

 {/* Position list */}
 {marginAcctPositions.length === 0 ? (
 <p className="text-xs text-muted-foreground text-center py-4">
 Add positions using the button above to see portfolio margin requirements.
 </p>
 ) : (
 <div className="rounded-lg border border-border overflow-hidden">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-muted/20">
 {["Contract", "Qty", "Init Margin", "Maint Margin", "Margin Call @ Price", ""].map((h) => (
 <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {marginAcctPositions.map((p) => {
 const priceMap: Record<string, number> = {
 ES: 5210, NQ: 18240, YM: 39180, RTY: 2084,
 ZN: 108.34, ZB: 118.26, "6E": 1.0842, "6J": 0.00668,
 BTC: 67420, ETH: 3480,
 };
 const ep = priceMap[p.spec.symbol] ?? 100;
 const marginCallP = ep - (p.spec.initialMargin - p.spec.maintenanceMargin) / p.spec.contractSize;
 const posInitMargin = p.spec.initialMargin * p.qty;
 const posMaintMargin = p.spec.maintenanceMargin * p.qty;
 return (
 <tr key={p.spec.symbol} className="border-b border-border hover:bg-muted/20">
 <td className="px-3 py-2.5 font-medium text-foreground">{p.spec.symbol}</td>
 <td className="px-3 py-2.5 tabular-nums">{p.qty}</td>
 <td className="px-3 py-2.5 tabular-nums text-red-400">${posInitMargin.toLocaleString()}</td>
 <td className="px-3 py-2.5 tabular-nums text-orange-400">${posMaintMargin.toLocaleString()}</td>
 <td className="px-3 py-2.5 tabular-nums text-amber-400">{fmtPrice(marginCallP)}</td>
 <td className="px-3 py-2.5">
 <button onClick={() => removePosition(p.spec.symbol)} className="text-muted-foreground hover:text-red-400 transition-colors">
 ×
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 <tfoot>
 <tr className="bg-muted/30">
 <td className="px-3 py-2 font-medium text-foreground" colSpan={2}>Total</td>
 <td className="px-3 py-2 tabular-nums font-medium text-red-400">${portfolioMargin.toLocaleString()}</td>
 <td className="px-3 py-2 tabular-nums font-medium text-orange-400">
 ${marginAcctPositions.reduce((s, p) => s + p.spec.maintenanceMargin * p.qty, 0).toLocaleString()}
 </td>
 <td colSpan={2} className="px-3 py-2">
 <span className={cn("text-xs font-medium", marginBuffer >= 0 ? "text-emerald-400" : "text-red-400")}>
 Buffer: ${marginBuffer.toLocaleString()}
 </span>
 </td>
 </tr>
 </tfoot>
 </table>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Margin Call Scenario */}
 <Card className="bg-card border-border border-orange-500/20">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-400">
 Margin Call Scenario — {selectedSpec.symbol}
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 flex flex-col gap-2">
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <div className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
 <div className="text-sm font-medium tabular-nums">{fmtPrice(entryPrice)}</div>
 </div>
 <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
 <div className="text-xs text-muted-foreground mb-1">Margin Call Price</div>
 <div className="text-sm font-medium tabular-nums text-orange-400">{fmtPrice(marginCallPrice)}</div>
 </div>
 <div className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="text-xs text-muted-foreground mb-1">Move to Call</div>
 <div className={cn("text-sm font-medium tabular-nums", chgCls(marginCallPrice - entryPrice))}>
 {((marginCallPrice - entryPrice) / entryPrice * 100).toFixed(2)}%
 </div>
 </div>
 <div className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="text-xs text-muted-foreground mb-1">Excess Margin (1 ct)</div>
 <div className="text-sm font-medium tabular-nums text-emerald-400">
 ${(initMarginReq - maintMarginReq).toLocaleString()}
 </div>
 </div>
 </div>
 <div className="rounded-lg border border-border bg-muted/10 p-3">
 <p className="text-xs text-muted-foreground leading-relaxed">
 <span className="font-medium text-foreground">How it works:</span> Your broker will issue a margin call if your account equity
 falls below the maintenance margin of ${selectedSpec.maintenanceMargin.toLocaleString()} per contract.
 For a {side === "long" ? "long" : "short"} position of {numContracts} contract(s) entered at {fmtPrice(entryPrice)},
 the margin call is triggered at {fmtPrice(marginCallPrice)} — a move of&nbsp;
 {Math.abs(((marginCallPrice - entryPrice) / entryPrice) * 100).toFixed(2)}% against your position.
 Day trading margin ({((selectedSpec.dayTradingMargin / selectedSpec.overnightMargin) * 100).toFixed(0)}% of overnight)
 applies only while the position is opened and closed intraday.
 </p>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FuturesPage() {
 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Page hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Futures Markets</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">INDICES · RATES · COMMODITIES · FX</p>

 {/* Tabs */}
 <Tabs defaultValue="equity" className="w-full">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 {[
 { value: "equity", label: "Equity & Index" },
 { value: "rates", label: "Interest Rates" },
 { value: "currency", label: "Currency & Crypto" },
 { value: "vol", label: "Volatility" },
 { value: "margin", label: "Order & Margin" },
 ].map((t) => (
 <TabsTrigger
 key={t.value}
 value={t.value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-[11px] text-muted-foreground data-[state=active]:text-foreground"
 >
 <span className="hidden sm:inline">{t.label}</span>
 </TabsTrigger>
 ))}
 </TabsList>

 
 <TabsContent value="equity" className="mt-4 data-[state=inactive]:hidden">
 <div>
 <EquityFuturesTab />
 </div>
 </TabsContent>

 <TabsContent value="rates" className="mt-4 data-[state=inactive]:hidden">
 <div>
 <InterestRateFuturesTab />
 </div>
 </TabsContent>

 <TabsContent value="currency" className="mt-4 data-[state=inactive]:hidden">
 <div>
 <CurrencyCryptoTab />
 </div>
 </TabsContent>

 <TabsContent value="vol" className="mt-4 data-[state=inactive]:hidden">
 <div>
 <VolatilityTab />
 </div>
 </TabsContent>

 <TabsContent value="margin" className="mt-4 data-[state=inactive]:hidden">
 <div>
 <MarginOrderTab />
 </div>
 </TabsContent>
 
 </Tabs>
 </div>
 </div>
 );
}
