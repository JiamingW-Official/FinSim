"use client";

import { useState, useMemo, useCallback } from "react";

import {
 Landmark,
 TrendingUp,
 TrendingDown,
 AlertTriangle,
 Info,
 Calculator,
 ShieldCheck,
 BarChart3,
 PlusCircle,
 Trash2,
 ChevronDown,
 ChevronUp,
 RefreshCw,
 Target,
 DollarSign,
 Percent,
 Activity,
 Scale,
 Globe,
 Building2,
 ArrowUpDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 139;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate all random values deterministically
const RAND_VALUES: number[] = [];
for (let i = 0; i < 2000; i++) {
 RAND_VALUES.push(rand());
}
let randIdx = 0;
const seededRand = () => RAND_VALUES[randIdx++ % RAND_VALUES.length];

// ── Bond math helpers ─────────────────────────────────────────────────────────

function bondPrice(
 couponRate: number,
 maturityYears: number,
 ytm: number,
 freq = 2
): number {
 const periods = maturityYears * freq;
 const coupon = (1000 * (couponRate / 100)) / freq;
 const r = ytm / 100 / freq;
 if (r === 0) return 1000 + coupon * periods;
 return (
 (coupon * (1 - Math.pow(1 + r, -periods))) / r +
 1000 / Math.pow(1 + r, periods)
 );
}

function macaulayDuration(
 couponRate: number,
 maturityYears: number,
 ytm: number,
 freq = 2
): number {
 const periods = maturityYears * freq;
 const coupon = (1000 * (couponRate / 100)) / freq;
 const r = ytm / 100 / freq;
 let weightedSum = 0;
 let price = 0;
 for (let t = 1; t <= periods; t++) {
 const cf = t === periods ? coupon + 1000 : coupon;
 const pv = cf / Math.pow(1 + r, t);
 weightedSum += (t / freq) * pv;
 price += pv;
 }
 return price > 0 ? weightedSum / price : 0;
}

function modifiedDuration(mac: number, ytm: number, freq = 2): number {
 return mac / (1 + ytm / 100 / freq);
}

function convexity(
 couponRate: number,
 maturityYears: number,
 ytm: number,
 freq = 2
): number {
 const periods = maturityYears * freq;
 const coupon = (1000 * (couponRate / 100)) / freq;
 const r = ytm / 100 / freq;
 let sum = 0;
 let price = 0;
 for (let t = 1; t <= periods; t++) {
 const cf = t === periods ? coupon + 1000 : coupon;
 const pv = cf / Math.pow(1 + r, t);
 sum += (t * (t + 1) * pv) / Math.pow(1 + r, 2);
 price += pv;
 }
 return price > 0 ? sum / (price * freq * freq) : 0;
}

function priceChange(
 price: number,
 modDur: number,
 conv: number,
 deltaYtm: number
): number {
 const dy = deltaYtm / 100;
 return price * (-modDur * dy + 0.5 * conv * dy * dy);
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPct(n: number, d = 2): string {
 return `${n.toFixed(d)}%`;
}

function fmtUSD(n: number, decimals = 0): string {
 return n.toLocaleString("en-US", {
 style: "currency",
 currency: "USD",
 minimumFractionDigits: decimals,
 maximumFractionDigits: decimals,
 });
}

function fmtM(n: number): string {
 if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
 if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
 return fmtUSD(n);
}

// ── Bond Universe Data ────────────────────────────────────────────────────────

type BondSector =
 | "US Treasury"
 | "TIPS"
 | "IG Corporate"
 | "High Yield"
 | "Emerging Market"
 | "Municipal"
 | "Convertible";

type CreditRating =
 | "AAA"
 | "AA+"
 | "AA"
 | "AA-"
 | "A+"
 | "A"
 | "A-"
 | "BBB+"
 | "BBB"
 | "BBB-"
 | "BB+"
 | "BB"
 | "BB-"
 | "B+"
 | "B"
 | "B-"
 | "CCC";

interface Bond {
 id: string;
 name: string;
 issuer: string;
 sector: BondSector;
 coupon: number;
 maturity: number; // years to maturity
 price: number;
 ytm: number;
 duration: number;
 modDur: number;
 convexity: number;
 rating: CreditRating;
 spreadBps: number;
 callable: boolean;
 putable: boolean;
 faceValue: number;
}

function isInvestmentGrade(r: CreditRating): boolean {
 return ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-"].includes(r);
}

function isHighYield(r: CreditRating): boolean {
 return ["BB+", "BB", "BB-", "B+", "B", "B-"].includes(r);
}

function isDistressed(r: CreditRating): boolean {
 return r === "CCC";
}

function ratingColor(r: CreditRating): string {
 if (isDistressed(r)) return "text-red-400";
 if (isHighYield(r)) return "text-amber-400";
 return "text-emerald-400";
}

function ratingBg(r: CreditRating): string {
 if (isDistressed(r)) return "bg-red-500/20 text-red-400 border-red-500/30";
 if (isHighYield(r)) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
 return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
}

const RAW_BONDS: Omit<Bond, "price" | "duration" | "modDur" | "convexity">[] = [
 { id: "tsy2", name: "US Treasury 2Y", issuer: "US Government", sector: "US Treasury", coupon: 4.85, maturity: 2, ytm: 4.85, rating: "AAA", spreadBps: 0, callable: false, putable: false, faceValue: 1000 },
 { id: "tsy5", name: "US Treasury 5Y", issuer: "US Government", sector: "US Treasury", coupon: 4.45, maturity: 5, ytm: 4.45, rating: "AAA", spreadBps: 0, callable: false, putable: false, faceValue: 1000 },
 { id: "tsy10", name: "US Treasury 10Y", issuer: "US Government", sector: "US Treasury", coupon: 4.25, maturity: 10, ytm: 4.25, rating: "AAA", spreadBps: 0, callable: false, putable: false, faceValue: 1000 },
 { id: "tsy30", name: "US Treasury 30Y", issuer: "US Government", sector: "US Treasury", coupon: 4.50, maturity: 30, ytm: 4.50, rating: "AAA", spreadBps: 0, callable: false, putable: false, faceValue: 1000 },
 { id: "tips5", name: "TIPS 5Y", issuer: "US Government", sector: "TIPS", coupon: 1.85, maturity: 5, ytm: 2.10, rating: "AAA", spreadBps: -235, callable: false, putable: false, faceValue: 1000 },
 { id: "tips10", name: "TIPS 10Y", issuer: "US Government", sector: "TIPS", coupon: 1.65, maturity: 10, ytm: 2.05, rating: "AAA", spreadBps: -220, callable: false, putable: false, faceValue: 1000 },
 { id: "ms5", name: "Morgan Stanley 5Y", issuer: "Morgan Stanley", sector: "IG Corporate", coupon: 5.20, maturity: 5, ytm: 5.20, rating: "A", spreadBps: 75, callable: false, putable: false, faceValue: 1000 },
 { id: "jpm7", name: "JPMorgan 7Y", issuer: "JPMorgan Chase", sector: "IG Corporate", coupon: 5.35, maturity: 7, ytm: 5.35, rating: "AA-", spreadBps: 65, callable: false, putable: false, faceValue: 1000 },
 { id: "aapl10", name: "Apple 10Y", issuer: "Apple Inc", sector: "IG Corporate", coupon: 4.90, maturity: 10, ytm: 4.90, rating: "AA+", spreadBps: 55, callable: false, putable: false, faceValue: 1000 },
 { id: "ba7", name: "Boeing 7Y", issuer: "Boeing Co", sector: "IG Corporate", coupon: 5.85, maturity: 7, ytm: 5.85, rating: "BBB-", spreadBps: 140, callable: false, putable: false, faceValue: 1000 },
 { id: "ford5", name: "Ford Motor 5Y", issuer: "Ford Motor", sector: "High Yield", coupon: 7.45, maturity: 5, ytm: 7.45, rating: "BB+", spreadBps: 260, callable: true, putable: false, faceValue: 1000 },
 { id: "crft8", name: "Craft Brew 8Y", issuer: "Craft Brewing Co", sector: "High Yield", coupon: 8.75, maturity: 8, ytm: 8.75, rating: "B+", spreadBps: 430, callable: true, putable: false, faceValue: 1000 },
 { id: "ret6", name: "Retail REIT 6Y", issuer: "Mall Holdings", sector: "High Yield", coupon: 9.50, maturity: 6, ytm: 11.20, rating: "CCC", spreadBps: 695, callable: true, putable: false, faceValue: 1000 },
 { id: "brazil10", name: "Brazil 10Y", issuer: "Republic of Brazil", sector: "Emerging Market", coupon: 6.85, maturity: 10, ytm: 6.85, rating: "BB-", spreadBps: 260, callable: false, putable: false, faceValue: 1000 },
 { id: "india7", name: "India 7Y", issuer: "Republic of India", sector: "Emerging Market", coupon: 6.20, maturity: 7, ytm: 6.20, rating: "BBB-", spreadBps: 175, callable: false, putable: false, faceValue: 1000 },
 { id: "nyc10", name: "NYC GO Bond 10Y", issuer: "New York City", sector: "Municipal", coupon: 3.45, maturity: 10, ytm: 3.45, rating: "AA", spreadBps: -80, callable: false, putable: true, faceValue: 1000 },
 { id: "ca15", name: "California 15Y", issuer: "State of California", sector: "Municipal", coupon: 3.85, maturity: 15, ytm: 3.85, rating: "AA-", spreadBps: -60, callable: true, putable: false, faceValue: 1000 },
 { id: "chi20", name: "Chicago Rev Bond 20Y", issuer: "City of Chicago", sector: "Municipal", coupon: 4.20, maturity: 20, ytm: 4.20, rating: "BBB", spreadBps: -5, callable: true, putable: false, faceValue: 1000 },
 { id: "tsla5cv", name: "EV Corp Convertible 5Y", issuer: "EV Corp", sector: "Convertible", coupon: 2.50, maturity: 5, ytm: 2.50, rating: "BB", spreadBps: -195, callable: true, putable: true, faceValue: 1000 },
 { id: "tech3cv", name: "CloudTech Convertible 3Y", issuer: "CloudTech Inc", sector: "Convertible", coupon: 1.75, maturity: 3, ytm: 1.75, rating: "BB+", spreadBps: -270, callable: false, putable: false, faceValue: 1000 },
];

const BONDS: Bond[] = RAW_BONDS.map((b) => {
 const mac = macaulayDuration(b.coupon, b.maturity, b.ytm);
 const modDur = modifiedDuration(mac, b.ytm);
 const conv = convexity(b.coupon, b.maturity, b.ytm);
 const price = bondPrice(b.coupon, b.maturity, b.ytm);
 return { ...b, price, duration: mac, modDur, convexity: conv };
});

// ── Yield Curve Data ──────────────────────────────────────────────────────────

const TENORS = [
 { label: "1M", years: 1 / 12 },
 { label: "3M", years: 3 / 12 },
 { label: "6M", years: 6 / 12 },
 { label: "1Y", years: 1 },
 { label: "2Y", years: 2 },
 { label: "5Y", years: 5 },
 { label: "7Y", years: 7 },
 { label: "10Y", years: 10 },
 { label: "20Y", years: 20 },
 { label: "30Y", years: 30 },
];

// Today's curve (roughly realistic 2026 inverted/normalizing shape)
const CURVE_TODAY = [5.35, 5.28, 5.20, 4.95, 4.85, 4.45, 4.38, 4.25, 4.42, 4.50];
// 6M ago: flatter/more inverted
const CURVE_6M = [5.55, 5.50, 5.45, 5.40, 5.30, 5.00, 4.92, 4.80, 4.95, 5.05];
// 1Y ago: more inverted
const CURVE_1Y = [5.45, 5.42, 5.40, 5.35, 5.20, 4.75, 4.65, 4.55, 4.70, 4.80];
// 2Y ago: steep normal
const CURVE_2Y = [3.85, 4.10, 4.30, 4.45, 4.50, 4.20, 4.10, 3.95, 4.05, 4.10];

function curveShape(curve: number[]): string {
 const short = curve[3]; // 1Y
 const mid = curve[7]; // 10Y
 const long = curve[9]; // 30Y
 const spread = mid - short;
 const butterfly = mid - (short + long) / 2;
 if (spread < -0.20) return "Inverted";
 if (Math.abs(spread) <= 0.20) return "Flat";
 if (butterfly > 0.15) return "Humped";
 return "Normal";
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PortfolioBond {
 bond: Bond;
 notional: number; // dollar amount
 units: number;
}

// ── Tab 1: Bond Universe ──────────────────────────────────────────────────────

type SortField = "ytm" | "duration" | "spreadBps" | "rating";
type SortDir = "asc" | "desc";
type RatingFilter = "all" | "ig" | "hy" | "distressed";

function BondUniverseTab({
 onAddBond,
}: {
 onAddBond: (bond: Bond) => void;
}) {
 const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
 const [sectorFilter, setSectorFilter] = useState<string>("all");
 const [callableFilter, setCallableFilter] = useState<"all" | "callable" | "putable">("all");
 const [sortField, setSortField] = useState<SortField>("ytm");
 const [sortDir, setSortDir] = useState<SortDir>("desc");
 const [selectedBond, setSelectedBond] = useState<Bond | null>(null);

 const sectors = useMemo(
 () => ["all", ...Array.from(new Set(BONDS.map((b) => b.sector)))],
 []
 );

 const filtered = useMemo(() => {
 let list = [...BONDS];
 if (ratingFilter === "ig") list = list.filter((b) => isInvestmentGrade(b.rating));
 else if (ratingFilter === "hy") list = list.filter((b) => isHighYield(b.rating));
 else if (ratingFilter === "distressed") list = list.filter((b) => isDistressed(b.rating));
 if (sectorFilter !== "all") list = list.filter((b) => b.sector === sectorFilter);
 if (callableFilter === "callable") list = list.filter((b) => b.callable);
 else if (callableFilter === "putable") list = list.filter((b) => b.putable);
 list.sort((a, b) => {
 let va: number, vb: number;
 if (sortField === "rating") {
 const order = ["AAA","AA+","AA","AA-","A+","A","A-","BBB+","BBB","BBB-","BB+","BB","BB-","B+","B","B-","CCC"];
 va = order.indexOf(a.rating);
 vb = order.indexOf(b.rating);
 } else {
 va = a[sortField] as number;
 vb = b[sortField] as number;
 }
 return sortDir === "asc" ? va - vb : vb - va;
 });
 return list;
 }, [ratingFilter, sectorFilter, callableFilter, sortField, sortDir]);

 const toggleSort = useCallback(
 (field: SortField) => {
 if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 else { setSortField(field); setSortDir("desc"); }
 },
 [sortField]
 );

 return (
 <div className="space-y-4">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Bond Universe</h2>
 {/* Filters */}
 <div className="flex flex-wrap gap-3 items-center">
 <div className="flex gap-1">
 {(["all", "ig", "hy", "distressed"] as RatingFilter[]).map((f) => (
 <button
 key={f}
 onClick={() => setRatingFilter(f)}
 className={cn(
 "px-3 py-1 rounded text-xs text-muted-foreground font-medium transition-colors",
 ratingFilter === f
 ? "bg-primary text-foreground"
 : "bg-muted text-muted-foreground hover:bg-muted"
 )}
 >
 {f === "all" ? "All Ratings" : f === "ig" ? "Inv. Grade" : f === "hy" ? "High Yield" : "Distressed"}
 </button>
 ))}
 </div>
 <div className="flex gap-1 flex-wrap">
 {sectors.map((s) => (
 <button
 key={s}
 onClick={() => setSectorFilter(s)}
 className={cn(
 "px-3 py-1 rounded text-xs text-muted-foreground font-medium transition-colors",
 sectorFilter === s
 ? "bg-indigo-600 text-foreground"
 : "bg-muted text-muted-foreground hover:bg-muted"
 )}
 >
 {s === "all" ? "All Sectors" : s}
 </button>
 ))}
 </div>
 <div className="flex gap-1">
 {(["all", "callable", "putable"] as const).map((f) => (
 <button
 key={f}
 onClick={() => setCallableFilter(f)}
 className={cn(
 "px-3 py-1 rounded text-xs text-muted-foreground font-medium transition-colors",
 callableFilter === f
 ? "bg-primary text-foreground"
 : "bg-muted text-muted-foreground hover:bg-muted"
 )}
 >
 {f === "all" ? "All Types" : f.charAt(0).toUpperCase() + f.slice(1)}
 </button>
 ))}
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto rounded-lg border border-border bg-card">
 <table className="w-full text-xs text-muted-foreground">
 <thead className="bg-muted text-muted-foreground">
 <tr>
 <th className="text-left px-3 py-2">Bond / Issuer</th>
 <th className="text-left px-3 py-2">Sector</th>
 <th className="px-3 py-2 text-right">Coupon</th>
 <th className="px-3 py-2 text-right">Maturity</th>
 <th className="px-3 py-2 text-right">Price</th>
 <th
 className="px-3 py-2 text-right cursor-pointer hover:text-foreground"
 onClick={() => toggleSort("ytm")}
 >
 <span className="flex items-center justify-end gap-1">
 YTM <ArrowUpDown className="w-3 h-3" />
 </span>
 </th>
 <th
 className="px-3 py-2 text-right cursor-pointer hover:text-foreground"
 onClick={() => toggleSort("duration")}
 >
 <span className="flex items-center justify-end gap-1">
 Dur. <ArrowUpDown className="w-3 h-3" />
 </span>
 </th>
 <th className="px-3 py-2 text-right">Convex.</th>
 <th
 className="px-3 py-2 text-right cursor-pointer hover:text-foreground"
 onClick={() => toggleSort("rating")}
 >
 <span className="flex items-center justify-end gap-1">
 Rating <ArrowUpDown className="w-3 h-3" />
 </span>
 </th>
 <th
 className="px-3 py-2 text-right cursor-pointer hover:text-foreground"
 onClick={() => toggleSort("spreadBps")}
 >
 <span className="flex items-center justify-end gap-1">
 Spread <ArrowUpDown className="w-3 h-3" />
 </span>
 </th>
 <th className="px-3 py-2 text-center">Type</th>
 <th className="px-3 py-2 text-center">Add</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((bond, i) => (
 <tr
 key={bond.id}
 className={cn(
 "border-t border-border hover:bg-muted/50 cursor-pointer transition-colors",
 selectedBond?.id === bond.id && "bg-muted"
 )}
 onClick={() => setSelectedBond(bond.id === selectedBond?.id ? null : bond)}
 >
 <td className="px-3 py-2">
 <div className="font-medium text-foreground">{bond.name}</div>
 <div className="text-muted-foreground">{bond.issuer}</div>
 </td>
 <td className="px-3 py-2 text-muted-foreground">{bond.sector}</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{fmtPct(bond.coupon)}</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{bond.maturity}Y</td>
 <td className="px-3 py-2 text-right text-muted-foreground">${bond.price.toFixed(2)}</td>
 <td className="px-3 py-2 text-right font-semibold text-foreground">{fmtPct(bond.ytm)}</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{bond.modDur.toFixed(2)}</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{bond.convexity.toFixed(2)}</td>
 <td className="px-3 py-2 text-right">
 <span className={cn("text-xs text-muted-foreground font-semibold px-1.5 py-0.5 rounded border", ratingBg(bond.rating))}>
 {bond.rating}
 </span>
 </td>
 <td className={cn("px-3 py-2 text-right font-medium", bond.spreadBps > 200 ? "text-red-400" : bond.spreadBps > 100 ? "text-amber-400" : "text-emerald-400")}>
 {bond.spreadBps > 0 ? `+${bond.spreadBps}` : bond.spreadBps}bps
 </td>
 <td className="px-3 py-2 text-center">
 <div className="flex gap-1 justify-center">
 {bond.callable && <span className="text-xs px-1 bg-orange-500/20 text-orange-400 rounded">CALL</span>}
 {bond.putable && <span className="text-xs px-1 bg-muted text-muted-foreground rounded">PUT</span>}
 {!bond.callable && !bond.putable && <span className="text-xs text-muted-foreground">—</span>}
 </div>
 </td>
 <td className="px-3 py-2 text-center">
 <button
 onClick={(e) => { e.stopPropagation(); onAddBond(bond); }}
 className="p-1 rounded hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors"
 >
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Detail Panel */}
 
 {selectedBond && (
 <div
 className="overflow-hidden"
 >
 <div className="rounded-lg border border-border bg-muted/30 p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Macaulay Duration</div>
 <div className="text-foreground font-mono tabular-nums font-semibold">{selectedBond.duration.toFixed(3)} yrs</div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Modified Duration</div>
 <div className="text-foreground font-mono tabular-nums font-medium">{selectedBond.modDur.toFixed(3)} yrs</div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Convexity</div>
 <div className="text-foreground font-mono tabular-nums font-medium">{selectedBond.convexity.toFixed(4)}</div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">DV01 (per $1M face)</div>
 <div className="text-foreground font-mono tabular-nums font-medium">{fmtUSD(selectedBond.modDur * selectedBond.price * 1000 * 0.0001, 2)}</div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Price (par = 1000)</div>
 <div className="text-foreground font-mono tabular-nums font-medium">${selectedBond.price.toFixed(4)}</div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">+100bps price chg</div>
 <div className="text-red-400 font-mono tabular-nums font-medium">
 {priceChange(selectedBond.price, selectedBond.modDur, selectedBond.convexity, 1.0).toFixed(2)}
 </div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">-100bps price chg</div>
 <div className="text-emerald-400 font-mono tabular-nums font-medium">
 +{Math.abs(priceChange(selectedBond.price, selectedBond.modDur, selectedBond.convexity, -1.0)).toFixed(2)}
 </div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Spread to Treasury</div>
 <div className={cn("font-mono tabular-nums font-medium", selectedBond.spreadBps > 200 ? "text-red-400" : selectedBond.spreadBps > 100 ? "text-amber-400" : "text-emerald-400")}>
 {selectedBond.spreadBps > 0 ? `+${selectedBond.spreadBps}` : selectedBond.spreadBps} bps
 </div>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
}

// ── Tab 2: Yield Curve Navigator ──────────────────────────────────────────────

function YieldCurveTab() {
 const [selectedTenorIdx, setSelectedTenorIdx] = useState<number | null>(7); // default 10Y
 const [showOverlays, setShowOverlays] = useState({ "6M ago": true, "1Y ago": false, "2Y ago": false });

 const curves = [
 { label: "Today", data: CURVE_TODAY, color: "#60a5fa" },
 { label: "6M ago", data: CURVE_6M, color: "#34d399" },
 { label: "1Y ago", data: CURVE_1Y, color: "#f59e0b" },
 { label: "2Y ago", data: CURVE_2Y, color: "#f87171" },
 ];

 const visibleCurves = curves.filter(
 (c) => c.label === "Today" || showOverlays[c.label as keyof typeof showOverlays]
 );

 // SVG dimensions
 const W = 540, H = 220;
 const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 const allVals = visibleCurves.flatMap((c) => c.data);
 const minY = Math.floor(Math.min(...allVals) * 10) / 10 - 0.1;
 const maxY = Math.ceil(Math.max(...allVals) * 10) / 10 + 0.1;

 const xScale = (i: number) => (i / (TENORS.length - 1)) * chartW;
 const yScale = (v: number) => chartH - ((v - minY) / (maxY - minY)) * chartH;

 const makePath = (data: number[]) =>
 data
 .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`)
 .join("");

 const shape = curveShape(CURVE_TODAY);
 const spread2s10s = (CURVE_TODAY[7] - CURVE_TODAY[4]).toFixed(2);
 const spread3m10y = (CURVE_TODAY[7] - CURVE_TODAY[1]).toFixed(2);
 const spread5s30s = (CURVE_TODAY[9] - CURVE_TODAY[5]).toFixed(2);

 const selectedBond2 = selectedTenorIdx !== null ? {
 tenor: TENORS[selectedTenorIdx],
 ytm: CURVE_TODAY[selectedTenorIdx],
 } : null;

 // For the selected tenor, calculate approximate duration and convexity
 const approxDuration = selectedBond2 ? Math.min(selectedBond2.tenor.years * 0.92, selectedBond2.tenor.years) : 0;
 const approxConvexity = selectedBond2 ? approxDuration * approxDuration / 100 : 0;
 const approxPrice = selectedBond2 ? bondPrice(selectedBond2.ytm, Math.max(selectedBond2.tenor.years, 0.1), selectedBond2.ytm) : 100;

 return (
 <div className="space-y-4">
 {/* Key Spreads */}
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Yield Curve Overview</h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
 {[
 { label: "Curve Shape", value: shape, color: shape === "Inverted" ? "text-red-400" : shape === "Normal" ? "text-emerald-400" : "text-amber-400" },
 { label: "2s/10s Spread", value: `${Number(spread2s10s) > 0 ? "+" : ""}${spread2s10s}%`, color: Number(spread2s10s) < 0 ? "text-red-400" : "text-emerald-400" },
 { label: "3M/10Y Spread", value: `${Number(spread3m10y) > 0 ? "+" : ""}${spread3m10y}%`, color: Number(spread3m10y) < 0 ? "text-red-400" : "text-emerald-400" },
 { label: "5s/30s Spread", value: `${Number(spread5s30s) > 0 ? "+" : ""}${spread5s30s}%`, color: Number(spread5s30s) > 0 ? "text-emerald-400" : "text-amber-400" },
 ].map((item) => (
 <div key={item.label} className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{item.label}</div>
 <div className={cn("text-lg font-mono tabular-nums font-semibold", item.color)}>{item.value}</div>
 </div>
 ))}
 </div>
 <div className="rounded-lg border border-border bg-card p-4 mb-2">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Fed Dots Terminal</div>
 <div className="text-lg font-mono tabular-nums font-semibold text-foreground">3.75%</div>
 </div>

 <div className="border-t border-border my-6" />

 {/* Chart + overlays */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-xl font-serif tracking-tight text-foreground">Treasury Yield Curve</h2>
 <div className="flex gap-2">
 {(["6M ago", "1Y ago", "2Y ago"] as const).map((label) => {
 const c = curves.find((x) => x.label === label)!;
 return (
 <button
 key={label}
 onClick={() => setShowOverlays((p) => ({ ...p, [label]: !p[label] }))}
 className={cn(
 "flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 rounded transition-colors",
 showOverlays[label] ? "opacity-100" : "opacity-40"
 )}
 style={{ color: c.color, background: c.color }}
 >
 <span className="w-4 h-0.5 inline-block"  />
 {label}
 </button>
 );
 })}
 </div>
 </div>
 <div className="overflow-x-auto">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl">
 <g transform={`translate(${PAD.left},${PAD.top})`}>
 {/* Grid lines */}
 {[minY + 0.5, minY + 1.0, minY + 1.5, minY + 2.0, minY + 2.5].map((v) => {
 if (v > maxY) return null;
 return (
 <g key={v}>
 <line
 x1={0} y1={yScale(v)} x2={chartW} y2={yScale(v)}
 stroke="#334155" strokeWidth={0.5}
 />
 <text x={-6} y={yScale(v)} textAnchor="end" fill="#64748b" fontSize={9} dominantBaseline="middle">
 {v.toFixed(1)}%
 </text>
 </g>
 );
 })}
 {/* Tenor labels */}
 {TENORS.map((t, i) => (
 <text
 key={t.label}
 x={xScale(i)} y={chartH + 15}
 textAnchor="middle" fill="#64748b" fontSize={9}
 >
 {t.label}
 </text>
 ))}
 {/* Curves */}
 {visibleCurves.map((c) => (
 <g key={c.label}>
 <path
 d={makePath(c.data)}
 fill="none"
 stroke={c.color}
 strokeWidth={c.label === "Today" ? 2 : 1}
 strokeDasharray={c.label === "Today" ? "none" : "4 2"}
 opacity={c.label === "Today" ? 1 : 0.7}
 />
 {c.label === "Today" &&
 c.data.map((v, i) => (
 <circle
 key={i}
 cx={xScale(i)} cy={yScale(v)} r={selectedTenorIdx === i ? 5 : 3}
 fill={selectedTenorIdx === i ? "#ffffff" : c.color}
 stroke={selectedTenorIdx === i ? c.color : "none"}
 strokeWidth={2}
 className="cursor-pointer"
 onClick={() => setSelectedTenorIdx(i === selectedTenorIdx ? null : i)}
 />
 ))}
 </g>
 ))}
 </g>
 </svg>
 </div>
 </div>

 {/* Selected tenor detail */}
 
 {selectedBond2 && (
 <div>
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">
 {selectedBond2.tenor.label} Treasury — YTM {fmtPct(selectedBond2.ytm)} — Price Sensitivity
 </h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {[
 { label: "+50bps", bps: 0.5, color: "text-red-400" },
 { label: "+100bps", bps: 1.0, color: "text-red-500" },
 { label: "-50bps", bps: -0.5, color: "text-emerald-400" },
 { label: "-100bps", bps: -1.0, color: "text-emerald-500" },
 ].map((sc) => {
 const chg = priceChange(approxPrice, approxDuration, approxConvexity, sc.bps);
 const pct = (chg / approxPrice) * 100;
 return (
 <div key={sc.label} className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{sc.label} shift</div>
 <div className={cn("text-base font-mono tabular-nums font-semibold", sc.color)}>
 {chg > 0 ? "+" : ""}{chg.toFixed(3)}
 </div>
 <div className={cn("text-xs font-mono tabular-nums", sc.color)}>
 ({pct > 0 ? "+" : ""}{pct.toFixed(3)}%)
 </div>
 </div>
 );
 })}
 </div>
 <div className="mt-3 text-xs text-muted-foreground">
 Approx. Modified Duration: <span className="font-mono tabular-nums">{approxDuration.toFixed(2)}</span> yrs | Convexity: <span className="font-mono tabular-nums">{approxConvexity.toFixed(4)}</span>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
}

// ── Tab 3: Portfolio Builder ──────────────────────────────────────────────────

function PortfolioBuilderTab({
 portfolio,
 onRemove,
 onAddBond,
}: {
 portfolio: PortfolioBond[];
 onRemove: (id: string) => void;
 onAddBond: () => void;
}) {
 const [targetDuration, setTargetDuration] = useState(6.0);
 const [allocationMode, setAllocationMode] = useState<"barbell" | "bullet" | "ladder">("ladder");

 const totalNotional = portfolio.reduce((s, p) => s + p.notional, 0);

 const stats = useMemo(() => {
 if (portfolio.length === 0) return null;
 const waDuration = portfolio.reduce((s, p) => s + p.bond.modDur * (p.notional / totalNotional), 0);
 const waYtm = portfolio.reduce((s, p) => s + p.bond.ytm * (p.notional / totalNotional), 0);
 const waConvexity = portfolio.reduce((s, p) => s + p.bond.convexity * (p.notional / totalNotional), 0);
 const igWeight = portfolio.filter((p) => isInvestmentGrade(p.bond.rating)).reduce((s, p) => s + p.notional, 0) / totalNotional;
 const dv01 = (waDuration * totalNotional * 0.0001);
 return { waDuration, waYtm, waConvexity, igWeight, dv01 };
 }, [portfolio, totalNotional]);

 // Illustrative strategies
 const strategies = useMemo(() => {
 const shortBonds = BONDS.filter((b) => b.maturity <= 3);
 const midBonds = BONDS.filter((b) => b.maturity > 3 && b.maturity <= 10);
 const longBonds = BONDS.filter((b) => b.maturity > 10);
 return {
 barbell: [
 shortBonds[0] && { bond: shortBonds[0], weight: 0.35 },
 shortBonds[1] && { bond: shortBonds[1], weight: 0.15 },
 longBonds[0] && { bond: longBonds[0], weight: 0.35 },
 longBonds[1] && { bond: longBonds[1], weight: 0.15 },
 ].filter(Boolean),
 bullet: [
 midBonds[0] && { bond: midBonds[0], weight: 0.30 },
 midBonds[1] && { bond: midBonds[1], weight: 0.30 },
 midBonds[2] && { bond: midBonds[2], weight: 0.25 },
 midBonds[3] && { bond: midBonds[3], weight: 0.15 },
 ].filter(Boolean),
 ladder: [
 shortBonds[0] && { bond: shortBonds[0], weight: 0.20 },
 midBonds[0] && { bond: midBonds[0], weight: 0.20 },
 midBonds[1] && { bond: midBonds[1], weight: 0.20 },
 midBonds[2] && { bond: midBonds[2], weight: 0.20 },
 longBonds[0] && { bond: longBonds[0], weight: 0.20 },
 ].filter(Boolean),
 };
 }, []);

 return (
 <div className="space-y-5">
 {/* Stats row */}
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Portfolio Summary</h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {[
 { label: "Total Allocated", value: fmtM(totalNotional), color: "text-foreground" },
 { label: "Cash Remaining", value: fmtM(Math.max(0, 1_000_000 - totalNotional)), color: totalNotional > 1_000_000 ? "text-red-400" : "text-emerald-400" },
 { label: "Wtd. Avg. Duration", value: stats ? `${stats.waDuration.toFixed(2)}y` : "—", color: "text-foreground" },
 { label: "Wtd. Avg. YTM", value: stats ? fmtPct(stats.waYtm) : "—", color: "text-foreground" },
 ].map((s) => (
 <div key={s.label} className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{s.label}</div>
 <div className={cn("text-lg font-mono tabular-nums font-semibold", s.color)}>{s.value}</div>
 </div>
 ))}
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Portfolio DV01</div>
 <div className="text-lg font-mono tabular-nums font-semibold text-amber-400">{stats ? fmtUSD(stats.dv01, 0) : "—"}</div>
 </div>

 <div className="border-t border-border my-6" />

 {/* Target duration */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-xl font-serif tracking-tight text-foreground">Duration Target</h2>
 <span className="text-xs text-muted-foreground">
 Gap: {stats ? `${(stats.waDuration - targetDuration).toFixed(2)}y` : "—"}
 </span>
 </div>
 <div className="flex items-center gap-4">
 <input
 type="range" min={0.5} max={20} step={0.5}
 value={targetDuration}
 onChange={(e) => setTargetDuration(parseFloat(e.target.value))}
 className="flex-1 accent-primary"
 />
 <span className="text-foreground font-medium w-16 text-right">{targetDuration.toFixed(1)}y</span>
 </div>
 {stats && (
 <div className="mt-2">
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span>0y</span>
 <span>Portfolio {stats.waDuration.toFixed(2)}y</span>
 <span>Target {targetDuration.toFixed(1)}y</span>
 <span>20y</span>
 </div>
 <div className="relative h-3 bg-muted rounded-full">
 <div
 className="absolute h-3 bg-primary/30 rounded-full"
 style={{ width: `${(stats.waDuration / 20) * 100}%` }}
 />
 <div
 className="absolute top-0 h-3 w-1 bg-amber-400 rounded"
 style={{ left: `${(targetDuration / 20) * 100}%` }}
 />
 </div>
 </div>
 )}
 </div>

 {/* Strategy comparison */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center gap-3 mb-4">
 <h2 className="text-xl font-serif tracking-tight text-foreground">Strategy Templates</h2>
 <div className="flex gap-1">
 {(["barbell", "bullet", "ladder"] as const).map((m) => (
 <button
 key={m}
 onClick={() => setAllocationMode(m)}
 className={cn(
 "px-3 py-1 rounded text-xs text-muted-foreground font-medium transition-colors capitalize",
 allocationMode === m ? "bg-primary text-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
 )}
 >
 {m}
 </button>
 ))}
 </div>
 </div>
 <div className="space-y-2">
 {strategies[allocationMode].map((item) => {
 if (!item) return null;
 const pct = (item.weight * 100).toFixed(0);
 return (
 <div key={item.bond.id} className="flex items-center gap-3">
 <div className="w-28 text-xs text-muted-foreground truncate">{item.bond.name}</div>
 <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
 <div
 className="h-full bg-primary/60 rounded"
 style={{ width: `${item.weight * 100}%` }}
 />
 </div>
 <div className="w-10 text-xs text-right text-foreground">{pct}%</div>
 <div className="w-16 text-xs text-right text-muted-foreground">{item.bond.modDur.toFixed(1)}y dur</div>
 </div>
 );
 })}
 </div>
 <div className="mt-3 text-xs text-muted-foreground">
 {allocationMode === "barbell" ? "Concentrates in short and long ends — benefits from twist flattener, exposed to parallel shifts." :
 allocationMode === "bullet" ? "Clusters around a single maturity — lower reinvestment risk, higher convexity focus." :
 "Evenly distributes across maturities — provides steady cash flows and predictable duration."}
 </div>
 </div>

 {/* Portfolio holdings */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-serif tracking-tight text-foreground">Current Holdings</h2>
 <button
 onClick={onAddBond}
 className="flex items-center gap-1 text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-foreground rounded transition-colors"
 >
 Add from Universe
 </button>
 </div>
 {portfolio.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 <p className="text-sm">No bonds added yet. Go to Bond Universe tab to add bonds.</p>
 </div>
 ) : (
 <div className="space-y-2">
 {portfolio.map((p) => (
 <div
 key={p.bond.id}
 className="flex items-center gap-3 bg-muted/40 rounded px-3 py-2"
 >
 <div className="flex-1">
 <div className="text-xs font-medium text-foreground">{p.bond.name}</div>
 <div className="text-xs text-muted-foreground">{p.bond.rating} · {fmtPct(p.bond.ytm)} YTM · {p.bond.modDur.toFixed(1)}y dur</div>
 </div>
 <div className="text-right">
 <div className="text-xs font-medium text-foreground">{fmtM(p.notional)}</div>
 <div className="text-xs text-muted-foreground">{((p.notional / Math.max(totalNotional, 1)) * 100).toFixed(1)}%</div>
 </div>
 <button
 onClick={() => onRemove(p.bond.id)}
 className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
 >
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}

// ── Tab 4: Duration & Convexity Risk ─────────────────────────────────────────

function DurationRiskTab({ portfolio }: { portfolio: PortfolioBond[] }) {
 const [selectedShift, setSelectedShift] = useState<-200 | -100 | -50 | 50 | 100 | 200>(100);

 const totalNotional = portfolio.reduce((s, p) => s + p.notional, 0);

 const stats = useMemo(() => {
 if (portfolio.length === 0) return null;
 const waDuration = portfolio.reduce((s, p) => s + p.bond.modDur * (p.notional / totalNotional), 0);
 const waConvexity = portfolio.reduce((s, p) => s + p.bond.convexity * (p.notional / totalNotional), 0);
 const dv01 = waDuration * totalNotional * 0.0001;
 const hedgeRatio = dv01 / 85; // 85 = approx DV01 per TY futures contract ($100k notional, 6.5y dur)
 return { waDuration, waConvexity, dv01, hedgeRatio };
 }, [portfolio, totalNotional]);

 const scenarios = useMemo(() => {
 return [-200, -100, -50, 50, 100, 200].map((bps) => {
 const totalChg = portfolio.reduce((s, p) => {
 const chg = priceChange(p.bond.price, p.bond.modDur, p.bond.convexity, bps / 100);
 const units = p.notional / p.bond.price;
 return s + chg * units;
 }, 0);
 return { bps, totalChg, pct: (totalChg / Math.max(totalNotional, 1)) * 100 };
 });
 }, [portfolio, totalNotional]);

 // Duration contribution chart
 const maxDurContrib = Math.max(...portfolio.map((p) => p.bond.modDur * (p.notional / Math.max(totalNotional, 1))), 0.01);

 // Non-parallel shifts (approximate, use KRD proxy)
 const nonParallelScenarios = [
 { name: "Steepener", desc: "2Y +50bps, 10Y -25bps", change: portfolio.reduce((s, p) => {
 const isShort = p.bond.maturity <= 3;
 const isLong = p.bond.maturity >= 7;
 const shift = isShort ? 0.5 : isLong ? -0.25 : 0;
 const chg = priceChange(p.bond.price, p.bond.modDur, p.bond.convexity, shift);
 return s + chg * (p.notional / p.bond.price);
 }, 0)
 },
 { name: "Flattener", desc: "2Y -50bps, 10Y +25bps", change: portfolio.reduce((s, p) => {
 const isShort = p.bond.maturity <= 3;
 const isLong = p.bond.maturity >= 7;
 const shift = isShort ? -0.5 : isLong ? 0.25 : 0;
 const chg = priceChange(p.bond.price, p.bond.modDur, p.bond.convexity, shift);
 return s + chg * (p.notional / p.bond.price);
 }, 0)
 },
 { name: "Butterfly", desc: "2Y/30Y -25bps, 5Y/10Y +40bps", change: portfolio.reduce((s, p) => {
 const isBelly = p.bond.maturity >= 4 && p.bond.maturity <= 12;
 const shift = isBelly ? 0.4 : -0.25;
 const chg = priceChange(p.bond.price, p.bond.modDur, p.bond.convexity, shift);
 return s + chg * (p.notional / p.bond.price);
 }, 0)
 },
 ];

 if (portfolio.length === 0) {
 return (
 <div className="text-center py-16 text-muted-foreground">
 <p>Add bonds to your portfolio first to see risk analysis.</p>
 </div>
 );
 }

 return (
 <div className="space-y-5">
 {/* Summary cards */}
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Risk Metrics</h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {[
 { label: "Portfolio Mod. Duration", value: stats ? `${stats.waDuration.toFixed(3)}y` : "—", color: "text-foreground" },
 { label: "Portfolio Convexity", value: stats ? stats.waConvexity.toFixed(4) : "—", color: "text-foreground" },
 { label: "DV01 (PVBP)", value: stats ? fmtUSD(stats.dv01, 0) : "—", color: "text-amber-400" },
 { label: "TY Futures Hedge", value: stats ? `${stats.hedgeRatio.toFixed(0)} contracts` : "—", color: "text-foreground" },
 ].map((s) => (
 <div key={s.label} className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{s.label}</div>
 <div className={cn("text-lg font-mono tabular-nums font-semibold", s.color)}>{s.value}</div>
 </div>
 ))}
 </div>

 <div className="border-t border-border my-6" />

 {/* Duration contribution bar chart */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Duration Contribution by Bond</h2>
 <div className="space-y-2">
 {portfolio.map((p) => {
 const contrib = p.bond.modDur * (p.notional / totalNotional);
 const pct = contrib / maxDurContrib;
 return (
 <div key={p.bond.id} className="flex items-center gap-3">
 <div className="w-36 text-xs text-muted-foreground truncate">{p.bond.name}</div>
 <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
 <div
 className="h-full bg-primary/70 rounded"
 style={{ width: `${pct * 100}%` }}
 />
 </div>
 <div className="w-16 text-xs text-right text-foreground">{contrib.toFixed(3)}y</div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Parallel shift scenarios */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Parallel Rate Shift Scenarios</h2>
 <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
 {scenarios.map((sc) => (
 <button
 key={sc.bps}
 onClick={() => setSelectedShift(sc.bps as -200 | -100 | -50 | 50 | 100 | 200)}
 className={cn(
 "rounded-lg p-3 border transition-colors text-center",
 selectedShift === sc.bps ? "border-primary bg-muted/10" : "border-border bg-muted/30 hover:bg-muted/50"
 )}
 >
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{sc.bps > 0 ? "+" : ""}{sc.bps}bps</div>
 <div className={cn("text-sm font-mono tabular-nums font-semibold", sc.totalChg >= 0 ? "text-emerald-400" : "text-red-400")}>
 {sc.totalChg >= 0 ? "+" : ""}{fmtM(sc.totalChg)}
 </div>
 <div className={cn("text-xs font-mono tabular-nums", sc.pct >= 0 ? "text-emerald-500" : "text-red-500")}>
 {sc.pct.toFixed(2)}%
 </div>
 </button>
 ))}
 </div>
 {/* Convexity benefit explanation */}
 <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300">
 <span className="font-medium">Convexity benefit:</span> For large moves, convexity means the portfolio gains more when rates fall than it loses when rates rise by the same amount. Portfolio convexity {stats?.waConvexity.toFixed(4)} provides an extra cushion at ±200bps.
 </div>
 </div>

 {/* Non-parallel shifts */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Non-Parallel Shift Analysis</h2>
 <div className="grid grid-cols-3 gap-3">
 {nonParallelScenarios.map((sc) => (
 <div key={sc.name} className="bg-muted/40 rounded-lg p-3">
 <div className="text-sm font-medium text-foreground mb-1">{sc.name}</div>
 <div className="text-xs text-muted-foreground mb-2">{sc.desc}</div>
 <div className={cn("text-base font-medium", sc.change >= 0 ? "text-emerald-400" : "text-red-400")}>
 {sc.change >= 0 ? "+" : ""}{fmtM(sc.change)}
 </div>
 </div>
 ))}
 </div>
 <div className="mt-3 text-xs text-muted-foreground">
 Key Rate Duration (KRD) analysis shows sensitivity to individual points on the curve. Barbell portfolios benefit from steepeners; bullet portfolios suffer from butterfly twists.
 </div>
 </div>
 </div>
 );
}

// ── Tab 5: Credit Analysis ────────────────────────────────────────────────────

const IG_SPREAD_HISTORY = Array.from({ length: 24 }, (_, i) => {
 const base = 90;
 const v = base + Math.sin(i * 0.4) * 20 + (RAND_VALUES[i] - 0.5) * 15;
 return Math.round(v);
});
const HY_SPREAD_HISTORY = Array.from({ length: 24 }, (_, i) => {
 const base = 380;
 const v = base + Math.sin(i * 0.35) * 60 + (RAND_VALUES[i + 24] - 0.5) * 50;
 return Math.round(v);
});

function CreditAnalysisTab() {
 const [selectedBond3, setSelectedBond3] = useState<Bond | null>(BONDS[6]);

 const igSpread = IG_SPREAD_HISTORY[IG_SPREAD_HISTORY.length - 1];
 const hySpread = HY_SPREAD_HISTORY[HY_SPREAD_HISTORY.length - 1];
 const igAvg = Math.round(IG_SPREAD_HISTORY.reduce((a, b) => a + b) / IG_SPREAD_HISTORY.length);
 const hyAvg = Math.round(HY_SPREAD_HISTORY.reduce((a, b) => a + b) / HY_SPREAD_HISTORY.length);

 const W2 = 400, H2 = 100;

 const makePath2 = (data: number[], minV: number, maxV: number) => {
 const chartW2 = W2 - 10;
 const chartH2 = H2 - 10;
 return data
 .map((v, i) => {
 const x = 5 + (i / (data.length - 1)) * chartW2;
 const y = 5 + (1 - (v - minV) / (maxV - minV)) * chartH2;
 return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
 })
 .join("");
 };

 // Credit scorecard for selected bond
 const scorecard = useMemo(() => {
 if (!selectedBond3) return null;
 const ratingMap: Record<CreditRating, number> = {
 AAA: 100, "AA+": 95, AA: 90, "AA-": 85, "A+": 80, A: 75, "A-": 70,
 "BBB+": 65, BBB: 60, "BBB-": 55, "BB+": 48, BB: 42, "BB-": 36,
 "B+": 28, B: 22, "B-": 16, CCC: 8,
 };
 const score = ratingMap[selectedBond3.rating];
 const pd = Math.max(0, (100 - score) * 0.002); // rough PD
 const lgd = 0.4; // standard LGD for seniors
 const expectedLoss = pd * lgd * 100;
 const spreadDuration = selectedBond3.modDur * 0.95; // approx = rate duration for fixed-rate
 return { score, pd: pd * 100, lgd: lgd * 100, expectedLoss, spreadDuration };
 }, [selectedBond3]);

 // Fallen angel candidates: BBB- rated bonds
 const fallenAngels = BONDS.filter((b) => b.rating === "BBB-" || b.rating === "BBB");

 // Relative value: for each sector, sort by spread
 const relativeValue = useMemo(() => {
 const igCorps = BONDS.filter((b) => b.sector === "IG Corporate");
 const median = igCorps.sort((a, b) => a.spreadBps - b.spreadBps)[Math.floor(igCorps.length / 2)]?.spreadBps ?? 75;
 return igCorps.map((b) => ({
 bond: b,
 vsMedian: b.spreadBps - median,
 label: b.spreadBps > median + 20 ? "Wide" : b.spreadBps < median - 20 ? "Tight" : "Fair",
 }));
 }, []);

 return (
 <div className="space-y-5">
 {/* IG/HY spread monitor */}
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Credit Spread Monitor</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {[
 { label: "IG Corporate Spread", spread: igSpread, avg: igAvg, history: IG_SPREAD_HISTORY, color: "#60a5fa" },
 { label: "HY Corporate Spread", spread: hySpread, avg: hyAvg, history: HY_SPREAD_HISTORY, color: "#f59e0b" },
 ].map((item) => {
 const min2 = Math.min(...item.history) - 10;
 const max2 = Math.max(...item.history) + 10;
 return (
 <div key={item.label} className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center justify-between mb-2">
 <h2 className="text-xl font-serif tracking-tight text-foreground">{item.label}</h2>
 <span className="text-xl font-mono tabular-nums font-semibold" style={{ color: item.color }}>{item.spread}bps</span>
 </div>
 <div className="flex gap-4 text-xs text-muted-foreground mb-2">
 <span className="text-muted-foreground">24M avg: <span className="text-muted-foreground">{item.avg}bps</span></span>
 <span className={item.spread > item.avg ? "text-amber-400" : "text-emerald-400"}>
 vs avg: {item.spread > item.avg ? "+" : ""}{item.spread - item.avg}bps
 </span>
 </div>
 <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-16">
 <path d={makePath2(item.history, min2, max2)} fill="none" stroke={item.color} strokeWidth={1.5} />
 <line
 x1={5} y1={5 + (1 - (item.avg - min2) / (max2 - min2)) * (H2 - 10)}
 x2={W2 - 5} y2={5 + (1 - (item.avg - min2) / (max2 - min2)) * (H2 - 10)}
 stroke={item.color} strokeWidth={0.5} strokeDasharray="3 2" opacity={0.5}
 />
 </svg>
 </div>
 );
 })}
 </div>

 <div className="border-t border-border my-6" />

 {/* Credit scorecard */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-serif tracking-tight text-foreground">Credit Scorecard</h2>
 <select
 className="bg-muted border border-border text-muted-foreground text-xs rounded px-2 py-1"
 value={selectedBond3?.id ?? ""}
 onChange={(e) => setSelectedBond3(BONDS.find((b) => b.id === e.target.value) ?? null)}
 >
 {BONDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
 </select>
 </div>
 {selectedBond3 && scorecard && (
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {[
 { label: "Credit Score", value: `${scorecard.score}/100`, color: scorecard.score >= 60 ? "text-emerald-400" : scorecard.score >= 35 ? "text-amber-400" : "text-red-400" },
 { label: "Prob. of Default (1Y)", value: fmtPct(scorecard.pd, 3), color: scorecard.pd < 0.5 ? "text-emerald-400" : scorecard.pd < 2 ? "text-amber-400" : "text-red-400" },
 { label: "Loss Given Default", value: fmtPct(scorecard.lgd, 0), color: "text-muted-foreground" },
 { label: "Expected Loss", value: fmtPct(scorecard.expectedLoss, 4), color: scorecard.expectedLoss < 0.1 ? "text-emerald-400" : "text-amber-400" },
 { label: "Spread Duration", value: `${scorecard.spreadDuration.toFixed(2)}y`, color: "text-foreground" },
 ].map((m) => (
 <div key={m.label} className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{m.label}</div>
 <div className={cn("text-base font-mono tabular-nums font-semibold", m.color)}>{m.value}</div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Relative value */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">IG Corporate Relative Value</h2>
 <div className="space-y-2">
 {relativeValue.map((rv) => (
 <div key={rv.bond.id} className="flex items-center gap-3">
 <div className="w-36 text-xs text-muted-foreground truncate">{rv.bond.name}</div>
 <div className="w-12 text-xs text-right text-muted-foreground">{rv.bond.spreadBps}bps</div>
 <div className="flex-1 h-4 bg-muted rounded overflow-hidden relative">
 <div className="absolute top-0 bottom-0 w-px bg-muted-foreground" style={{ left: "50%" }} />
 <div
 style={{
 width: `${Math.min(Math.abs(rv.vsMedian) / 50 * 50, 50)}%`,
 left: rv.vsMedian > 0 ? "50%" : `${50 - Math.min(Math.abs(rv.vsMedian) / 50 * 50, 50)}%`
 }}
 className={cn("absolute top-0 h-full rounded", rv.vsMedian > 0 ? "bg-amber-500/40" : "bg-emerald-500/40")}
 />
 </div>
 <span className={cn("text-xs text-muted-foreground w-16 text-right font-medium",
 rv.label === "Wide" ? "text-amber-400" : rv.label === "Tight" ? "text-emerald-400" : "text-muted-foreground"
 )}>
 {rv.label} {rv.vsMedian > 0 ? "+" : ""}{rv.vsMedian}bps
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Fallen angel tracker */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center gap-2 mb-4">
 <h2 className="text-xl font-serif tracking-tight text-foreground">Fallen Angel Watch</h2>
 <span className="text-xs text-muted-foreground">— IG bonds at risk of HY downgrade</span>
 </div>
 <div className="space-y-2">
 {fallenAngels.map((b) => (
 <div key={b.id} className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded px-3 py-2">
 <div className="flex-1">
 <span className="text-xs font-medium text-foreground">{b.name}</span>
 <span className="text-xs text-muted-foreground ml-2">{b.issuer}</span>
 </div>
 <span className={cn("text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded border", ratingBg(b.rating))}>{b.rating}</span>
 <span className="text-xs text-amber-400">+{b.spreadBps}bps</span>
 <span className="text-xs text-muted-foreground">Watch</span>
 </div>
 ))}
 </div>
 <div className="mt-2 text-xs text-muted-foreground">
 Fallen angels often see sharp spread widening as HY funds cannot hold IG mandates, creating forced selling.
 </div>
 </div>
 </div>
 );
}

// ── Tab 6: Taxable vs Tax-Exempt ─────────────────────────────────────────────

const TAX_BRACKETS = [22, 24, 32, 35, 37];

interface MuniBond {
 name: string;
 type: "GO" | "Revenue" | "BAB" | "Private Activity";
 state: string;
 coupon: number;
 maturity: number;
 rating: CreditRating;
 amt: boolean;
 tripleExempt: boolean;
 description: string;
}

const MUNI_BONDS: MuniBond[] = [
 { name: "NYC General Obligation", type: "GO", state: "NY", coupon: 3.45, maturity: 10, rating: "AA", amt: false, tripleExempt: false, description: "General obligation of New York City backed by full faith and credit." },
 { name: "California State GO", type: "GO", state: "CA", coupon: 3.85, maturity: 15, rating: "AA-", amt: false, tripleExempt: false, description: "State of California GO bond, strong credit supported by diversified tax base." },
 { name: "Chicago Rev Bond", type: "Revenue", state: "IL", coupon: 4.20, maturity: 20, rating: "BBB", amt: false, tripleExempt: false, description: "Revenue bond secured by Chicago infrastructure project cash flows." },
 { name: "TX Airport Revenue", type: "Revenue", state: "TX", coupon: 3.65, maturity: 12, rating: "A", amt: true, tripleExempt: false, description: "Private activity bond — subject to AMT for some investors." },
 { name: "NY Build America Bond", type: "BAB", state: "NY", coupon: 5.25, maturity: 20, rating: "AA", amt: false, tripleExempt: false, description: "Taxable muni with 35% federal subsidy on interest payments." },
 { name: "NJ Hospital Revenue", type: "Revenue", state: "NJ", coupon: 4.05, maturity: 18, rating: "A-", amt: true, tripleExempt: false, description: "Private activity bond funding NJ hospital expansion, AMT exposure." },
 { name: "CA In-State GO", type: "GO", state: "CA", coupon: 3.60, maturity: 10, rating: "AA-", amt: false, tripleExempt: true, description: "Triple tax-exempt for CA residents: federal + state + local exemption." },
];

function TaxExemptTab() {
 const [marginalRate, setMarginalRate] = useState(32);
 const [stateRate, setStateRate] = useState(9.3);
 const [selectedMuni, setSelectedMuni] = useState<MuniBond | null>(MUNI_BONDS[0]);
 const [inState, setInState] = useState(false);

 function taxEqYield(muniYield: number, fedRate: number, stRate: number, isTriple: boolean, isBab: boolean): number {
 if (isBab) {
 // BABs are taxable but have 35% federal subsidy
 const subsidy = 0.35;
 const netCoupon = muniYield * (1 - subsidy);
 return netCoupon / (1 - fedRate / 100); // simplified
 }
 if (isTriple) return muniYield / (1 - (fedRate + stRate) / 100);
 return muniYield / (1 - fedRate / 100);
 }

 function afterTaxYield(
 bond: { coupon: number; sector?: string; type?: string },
 fedRate: number,
 stRate: number,
 isMuni: boolean,
 isTriple: boolean,
 isBab: boolean
 ): number {
 if (isBab) {
 // Taxable, but subsidized — investor receives net coupon
 return bond.coupon * (1 - fedRate / 100);
 }
 if (isMuni) {
 if (isTriple) return bond.coupon; // no tax
 return bond.coupon; // federal exempt
 }
 return bond.coupon * (1 - fedRate / 100);
 }

 // Comparison table: same maturity Treasury vs IG Corp vs Muni
 const comparisonBonds = [
 { label: "10Y Treasury", coupon: 4.25, taxable: true, isBab: false },
 { label: "10Y IG Corporate (A)", coupon: 4.90, taxable: true, isBab: false },
 { label: "10Y Muni GO (AA)", coupon: 3.45, taxable: false, isBab: false },
 { label: "10Y Muni (Triple Exempt)", coupon: 3.60, taxable: false, isBab: false, tripleExempt: true },
 { label: "20Y BAB (taxable muni)", coupon: 5.25, taxable: true, isBab: true },
 ];

 return (
 <div className="space-y-5">
 {/* Tax rate inputs */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Tax Parameters</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <div className="flex justify-between mb-2">
 <label className="text-xs text-muted-foreground">Federal Marginal Rate</label>
 <span className="text-foreground font-medium text-sm">{marginalRate}%</span>
 </div>
 <div className="flex gap-2">
 {TAX_BRACKETS.map((r) => (
 <button
 key={r}
 onClick={() => setMarginalRate(r)}
 className={cn(
 "flex-1 py-1 rounded text-xs text-muted-foreground font-medium transition-colors",
 marginalRate === r ? "bg-primary text-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
 )}
 >
 {r}%
 </button>
 ))}
 </div>
 </div>
 <div>
 <div className="flex justify-between mb-2">
 <label className="text-xs text-muted-foreground">State Income Tax Rate</label>
 <span className="text-indigo-400 font-medium text-sm">{stateRate}%</span>
 </div>
 <input
 type="range" min={0} max={13.3} step={0.1}
 value={stateRate}
 onChange={(e) => setStateRate(parseFloat(e.target.value))}
 className="w-full accent-indigo-500"
 />
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span>0% (TX/FL)</span>
 <span>9.3% (CA)</span>
 <span>13.3% (CA top)</span>
 </div>
 </div>
 </div>
 <div className="mt-3 flex items-center gap-2">
 <input
 type="checkbox" id="instate" checked={inState}
 onChange={(e) => setInState(e.target.checked)}
 className="accent-primary"
 />
 <label htmlFor="instate" className="text-xs text-muted-foreground">
 In-state resident (qualifies for triple tax-exempt on in-state munis)
 </label>
 </div>
 </div>

 <div className="border-t border-border my-6" />

 {/* After-tax comparison table */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">After-Tax Return Comparison</h2>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead className="text-muted-foreground border-b border-border">
 <tr>
 <th className="text-left py-2">Bond Type</th>
 <th className="text-right py-2">Coupon</th>
 <th className="text-right py-2">Tax Status</th>
 <th className="text-right py-2">After-Tax Yield</th>
 <th className="text-right py-2">Tax-Eq Yield</th>
 <th className="text-right py-2">vs Treasury</th>
 </tr>
 </thead>
 <tbody>
 {comparisonBonds.map((b) => {
 const isTriple = ("tripleExempt" in b && b.tripleExempt && inState) ?? false;
 const afterTax = b.taxable
 ? b.coupon * (1 - marginalRate / 100) * (b.isBab ? 0.65 : 1)
 : b.coupon;
 const teYield = b.taxable
 ? b.coupon
 : taxEqYield(b.coupon, marginalRate, stateRate, isTriple, b.isBab);
 const tsyAfterTax = 4.25 * (1 - marginalRate / 100);
 const vs = afterTax - tsyAfterTax;
 return (
 <tr key={b.label} className="border-b border-border hover:bg-muted/20">
 <td className="py-2 text-foreground">{b.label}</td>
 <td className="py-2 text-right text-muted-foreground">{b.coupon.toFixed(2)}%</td>
 <td className="py-2 text-right">
 <span className={cn(
 "px-1.5 py-0.5 rounded text-xs text-muted-foreground",
 b.taxable ? "bg-red-500/20 text-red-400" : isTriple ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"
 )}>
 {b.taxable ? (b.isBab ? "BAB (taxable)" : "Taxable") : isTriple ? "Triple Exempt" : "Tax-Exempt"}
 </span>
 </td>
 <td className="py-2 text-right font-medium text-foreground">{afterTax.toFixed(3)}%</td>
 <td className="py-2 text-right text-muted-foreground">{teYield.toFixed(3)}%</td>
 <td className={cn("py-2 text-right font-medium", vs > 0 ? "text-emerald-400" : "text-red-400")}>
 {vs > 0 ? "+" : ""}{vs.toFixed(3)}%
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <div className="mt-2 text-xs text-muted-foreground">
 At {marginalRate}% federal + {stateRate}% state tax. Tax-equivalent yield = muni yield / (1 - marginal rate).
 </div>
 </div>

 {/* Muni bond detail list */}
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Municipal Bond Universe</h2>
 <div className="space-y-2">
 {MUNI_BONDS.map((b) => {
 const isTriple = b.tripleExempt && inState;
 const teYield = taxEqYield(b.coupon, marginalRate, stateRate, isTriple, b.type === "BAB");
 const isSelected = selectedMuni?.name === b.name;
 return (
 <div
 key={b.name}
 className={cn(
 "rounded-lg border p-3 cursor-pointer transition-colors",
 isSelected ? "border-primary/50 bg-muted/5" : "border-border hover:border-border hover:bg-muted/30"
 )}
 onClick={() => setSelectedMuni(isSelected ? null : b)}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-foreground">{b.name}</span>
 <span className="text-xs text-muted-foreground">{b.state} · {b.type}</span>
 {b.amt && <span className="text-xs px-1 bg-red-500/20 text-red-400 rounded">AMT</span>}
 {isTriple && <span className="text-xs px-1 bg-orange-500/20 text-orange-400 rounded">3x Exempt</span>}
 </div>
 <div className="flex items-center gap-3">
 <span className={cn("text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded border", ratingBg(b.rating))}>{b.rating}</span>
 <span className="text-xs text-muted-foreground">{b.coupon.toFixed(2)}%</span>
 <span className="text-xs font-medium text-foreground">TEY: {teYield.toFixed(2)}%</span>
 </div>
 </div>
 
 {isSelected && (
 <div
 className="overflow-hidden"
 >
 <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
 {b.description}
 <div className="mt-2 grid grid-cols-3 gap-2">
 <div><span className="text-muted-foreground">Maturity:</span> <span className="text-muted-foreground">{b.maturity}Y</span></div>
 <div><span className="text-muted-foreground">Fed Exempt:</span> <span className="text-emerald-400">Yes</span></div>
 <div><span className="text-muted-foreground">AMT Risk:</span> <span className={b.amt ? "text-red-400" : "text-emerald-400"}>{b.amt ? "Yes" : "No"}</span></div>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
 })}
 </div>
 </div>

 <div className="border-t border-border my-6" />

 {/* AMT/BAB explainer */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center gap-2 mb-2">
 <h2 className="text-xl font-serif tracking-tight text-foreground">AMT Private Activity Bonds</h2>
 </div>
 <p className="text-xs text-muted-foreground">
 Private Activity Bonds finance private projects (airports, hospitals, stadiums) using municipal credit. While federally tax-exempt for most investors, AMT taxpayers must include this income in AMT calculations. Always check your AMT exposure before buying PABs.
 </p>
 </div>
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <div className="flex items-center gap-2 mb-2">
 <h2 className="text-xl font-serif tracking-tight text-foreground">Build America Bonds (BABs)</h2>
 </div>
 <p className="text-xs text-muted-foreground">
 Introduced in 2009 stimulus, BABs are taxable municipal bonds where the federal government subsidizes 35% of the interest cost. Issuers get lower borrowing rates; investors get higher taxable yields. They trade in both institutional and retail markets and can offer attractive after-tax returns vs Treasuries.
 </p>
 </div>
 </div>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FixedIncomePage() {
 const [portfolio, setPortfolio] = useState<PortfolioBond[]>([]);
 const [activeTab, setActiveTab] = useState("universe");

 const handleAddBond = useCallback((bond: Bond) => {
 setPortfolio((prev) => {
 const existing = prev.find((p) => p.bond.id === bond.id);
 if (existing) {
 return prev.map((p) =>
 p.bond.id === bond.id
 ? { ...p, notional: p.notional + 100_000, units: (p.notional + 100_000) / bond.price }
 : p
 );
 }
 const notional = 100_000;
 return [...prev, { bond, notional, units: notional / bond.price }];
 });
 }, []);

 const handleRemoveBond = useCallback((id: string) => {
 setPortfolio((prev) => prev.filter((p) => p.bond.id !== id));
 }, []);

 const handleGoToUniverse = useCallback(() => {
 setActiveTab("universe");
 }, []);

 const totalNotional = portfolio.reduce((s, p) => s + p.notional, 0);
 const portfolioCount = portfolio.length;

 return (
 <div className="max-w-5xl px-6 py-8 mx-auto space-y-6">
 {/* Page hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Fixed Income</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">BONDS · DURATION · CREDIT RISK · YIELD</p>

 {/* Portfolio summary chips */}
 {portfolioCount > 0 && (
 <div className="flex items-center gap-4 mb-6">
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Portfolio Value</div>
 <div className="text-lg font-mono tabular-nums font-semibold text-foreground">{fmtM(totalNotional)}</div>
 </div>
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Bonds Held</div>
 <div className="text-lg font-mono tabular-nums font-semibold text-foreground">{portfolioCount}</div>
 </div>
 </div>
 )}

 <div className="border-t border-border mb-6" />

 {/* Tabs */}
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 {[
 { value: "universe", label: "Bond Universe" },
 { value: "yieldcurve", label: "Yield Curve" },
 { value: "portfolio", label: "Portfolio Builder" },
 { value: "duration", label: "Duration & Convexity" },
 { value: "credit", label: "Credit Analysis" },
 { value: "tax", label: "Taxable vs Tax-Exempt" },
 ].map(({ value, label }) => (
 <TabsTrigger
 key={value}
 value={value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 {label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="universe" className="data-[state=inactive]:hidden">
 <BondUniverseTab onAddBond={handleAddBond} />
 </TabsContent>
 <TabsContent value="yieldcurve" className="data-[state=inactive]:hidden">
 <YieldCurveTab />
 </TabsContent>
 <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
 <PortfolioBuilderTab
 portfolio={portfolio}
 onRemove={handleRemoveBond}
 onAddBond={handleGoToUniverse}
 />
 </TabsContent>
 <TabsContent value="duration" className="data-[state=inactive]:hidden">
 <DurationRiskTab portfolio={portfolio} />
 </TabsContent>
 <TabsContent value="credit" className="data-[state=inactive]:hidden">
 <CreditAnalysisTab />
 </TabsContent>
 <TabsContent value="tax" className="data-[state=inactive]:hidden">
 <TaxExemptTab />
 </TabsContent>
 </Tabs>
 </div>
 );
}
