"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Globe,
 TrendingUp,
 TrendingDown,
 ArrowUpDown,
 DollarSign,
 Activity,
 BarChart3,
 Landmark,
 AlertTriangle,
 Info,
 ShieldCheck,
 Percent,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 672001;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate deterministic values
const RAND_VALUES: number[] = [];
for (let i = 0; i < 3000; i++) {
 RAND_VALUES.push(rand());
}
let ri = 0;
const r = () => RAND_VALUES[ri++ % RAND_VALUES.length];

// ── Types ─────────────────────────────────────────────────────────────────────

interface SovereignBond {
 country: string;
 code: string;
 flag: string;
 yield10Y: number;
 yield2Y: number;
 yield5Y: number;
 yield30Y: number;
 rating: string;
 ratingClass: "aaa" | "aa" | "a" | "bbb" | "bb" | "b";
 debtGDP: number;
 inflation: number;
 change1D: number;
 region: string;
}

interface EMBond {
 country: string;
 flag: string;
 hardCurrencyYield: number;
 localCurrencyYield: number;
 embiSpread: number;
 creditRating: string;
 ratingClass: "bbb" | "bb" | "b" | "ccc";
 currency: string;
 fxChangeYTD: number;
 debtGDP: number;
}

interface CentralBank {
 name: string;
 country: string;
 flag: string;
 policyRate: number;
 prevRate: number;
 lastMeeting: string;
 nextMeeting: string;
 stance: "hawkish" | "neutral" | "dovish";
 qeStatus: "QT" | "QE" | "Hold" | "None";
 balanceSheetTrillion: number;
 inflationTarget: number;
 currentInflation: number;
}

interface HedgingData {
 currency: string;
 flag: string;
 spotRate: number;
 fwd3M: number;
 hedgingCostAnnualized: number;
 unhedgedReturn: number;
 hedgedReturn: number;
 interestDiff: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const SOVEREIGN_BONDS: SovereignBond[] = [
 {
 country: "United States",
 code: "US",
 flag: "🇺🇸",
 yield10Y: 4.42,
 yield2Y: 4.71,
 yield5Y: 4.38,
 yield30Y: 4.68,
 rating: "AA+",
 ratingClass: "aa",
 debtGDP: 123.4,
 inflation: 3.2,
 change1D: -0.03,
 region: "G10",
 },
 {
 country: "Germany",
 code: "DE",
 flag: "🇩🇪",
 yield10Y: 2.48,
 yield2Y: 2.89,
 yield5Y: 2.52,
 yield30Y: 2.71,
 rating: "AAA",
 ratingClass: "aaa",
 debtGDP: 66.1,
 inflation: 2.3,
 change1D: -0.05,
 region: "G10",
 },
 {
 country: "Japan",
 code: "JP",
 flag: "🇯🇵",
 yield10Y: 1.51,
 yield2Y: 0.72,
 yield5Y: 1.11,
 yield30Y: 2.34,
 rating: "A+",
 ratingClass: "a",
 debtGDP: 261.3,
 inflation: 2.8,
 change1D: 0.02,
 region: "G10",
 },
 {
 country: "United Kingdom",
 code: "GB",
 flag: "🇬🇧",
 yield10Y: 4.58,
 yield2Y: 4.29,
 yield5Y: 4.37,
 yield30Y: 5.12,
 rating: "AA",
 ratingClass: "aa",
 debtGDP: 101.2,
 inflation: 3.4,
 change1D: 0.04,
 region: "G10",
 },
 {
 country: "France",
 code: "FR",
 flag: "🇫🇷",
 yield10Y: 3.12,
 yield2Y: 3.05,
 yield5Y: 3.02,
 yield30Y: 3.54,
 rating: "AA-",
 ratingClass: "aa",
 debtGDP: 112.7,
 inflation: 2.5,
 change1D: -0.02,
 region: "G10",
 },
 {
 country: "Italy",
 code: "IT",
 flag: "🇮🇹",
 yield10Y: 3.68,
 yield2Y: 3.41,
 yield5Y: 3.48,
 yield30Y: 4.22,
 rating: "BBB",
 ratingClass: "bbb",
 debtGDP: 143.8,
 inflation: 1.9,
 change1D: 0.06,
 region: "G10",
 },
 {
 country: "Canada",
 code: "CA",
 flag: "🇨🇦",
 yield10Y: 3.31,
 yield2Y: 3.58,
 yield5Y: 3.22,
 yield30Y: 3.41,
 rating: "AAA",
 ratingClass: "aaa",
 debtGDP: 106.8,
 inflation: 2.9,
 change1D: -0.04,
 region: "G10",
 },
 {
 country: "Australia",
 code: "AU",
 flag: "🇦🇺",
 yield10Y: 4.38,
 yield2Y: 4.01,
 yield5Y: 4.18,
 yield30Y: 4.72,
 rating: "AAA",
 ratingClass: "aaa",
 debtGDP: 53.7,
 inflation: 3.8,
 change1D: -0.01,
 region: "G10",
 },
 {
 country: "Switzerland",
 code: "CH",
 flag: "🇨🇭",
 yield10Y: 0.77,
 yield2Y: 0.58,
 yield5Y: 0.64,
 yield30Y: 0.98,
 rating: "AAA",
 ratingClass: "aaa",
 debtGDP: 39.2,
 inflation: 1.1,
 change1D: 0.01,
 region: "G10",
 },
 {
 country: "Norway",
 code: "NO",
 flag: "🇳🇴",
 yield10Y: 3.82,
 yield2Y: 3.94,
 yield5Y: 3.79,
 yield30Y: 3.95,
 rating: "AAA",
 ratingClass: "aaa",
 debtGDP: 40.6,
 inflation: 4.1,
 change1D: 0.02,
 region: "G10",
 },
 {
 country: "China",
 code: "CN",
 flag: "🇨🇳",
 yield10Y: 2.29,
 yield2Y: 1.77,
 yield5Y: 2.07,
 yield30Y: 2.57,
 rating: "A+",
 ratingClass: "a",
 debtGDP: 83.2,
 inflation: 0.7,
 change1D: -0.01,
 region: "EM",
 },
 {
 country: "India",
 code: "IN",
 flag: "🇮🇳",
 yield10Y: 6.88,
 yield2Y: 6.72,
 yield5Y: 6.74,
 yield30Y: 7.12,
 rating: "BBB-",
 ratingClass: "bbb",
 debtGDP: 84.1,
 inflation: 5.1,
 change1D: 0.03,
 region: "EM",
 },
 {
 country: "Brazil",
 code: "BR",
 flag: "🇧🇷",
 yield10Y: 13.41,
 yield2Y: 13.82,
 yield5Y: 13.55,
 yield30Y: 14.12,
 rating: "BB",
 ratingClass: "bb",
 debtGDP: 88.6,
 inflation: 4.8,
 change1D: 0.12,
 region: "EM",
 },
];

const EM_BONDS: EMBond[] = [
 {
 country: "Mexico",
 flag: "🇲🇽",
 hardCurrencyYield: 6.22,
 localCurrencyYield: 9.48,
 embiSpread: 178,
 creditRating: "BBB",
 ratingClass: "bbb",
 currency: "MXN",
 fxChangeYTD: -4.2,
 debtGDP: 53.8,
 },
 {
 country: "South Africa",
 flag: "🇿🇦",
 hardCurrencyYield: 7.81,
 localCurrencyYield: 10.22,
 embiSpread: 339,
 creditRating: "BB-",
 ratingClass: "bb",
 currency: "ZAR",
 fxChangeYTD: -6.8,
 debtGDP: 73.1,
 },
 {
 country: "Indonesia",
 flag: "🇮🇩",
 hardCurrencyYield: 5.44,
 localCurrencyYield: 7.12,
 embiSpread: 102,
 creditRating: "BBB",
 ratingClass: "bbb",
 currency: "IDR",
 fxChangeYTD: -3.1,
 debtGDP: 39.8,
 },
 {
 country: "Turkey",
 flag: "🇹🇷",
 hardCurrencyYield: 7.94,
 localCurrencyYield: 32.5,
 embiSpread: 351,
 creditRating: "B+",
 ratingClass: "b",
 currency: "TRY",
 fxChangeYTD: -18.4,
 debtGDP: 32.1,
 },
 {
 country: "Poland",
 flag: "🇵🇱",
 hardCurrencyYield: 4.88,
 localCurrencyYield: 5.62,
 embiSpread: 46,
 creditRating: "BBB+",
 ratingClass: "bbb",
 currency: "PLN",
 fxChangeYTD: 1.4,
 debtGDP: 49.4,
 },
 {
 country: "Colombia",
 flag: "🇨🇴",
 hardCurrencyYield: 7.12,
 localCurrencyYield: 11.84,
 embiSpread: 270,
 creditRating: "BB+",
 ratingClass: "bb",
 currency: "COP",
 fxChangeYTD: -7.3,
 debtGDP: 58.2,
 },
 {
 country: "Nigeria",
 flag: "🇳🇬",
 hardCurrencyYield: 9.22,
 localCurrencyYield: 21.4,
 embiSpread: 480,
 creditRating: "B-",
 ratingClass: "b",
 currency: "NGN",
 fxChangeYTD: -24.1,
 debtGDP: 38.4,
 },
 {
 country: "Philippines",
 flag: "🇵🇭",
 hardCurrencyYield: 5.38,
 localCurrencyYield: 6.44,
 embiSpread: 96,
 creditRating: "BBB",
 ratingClass: "bbb",
 currency: "PHP",
 fxChangeYTD: -2.7,
 debtGDP: 60.7,
 },
 {
 country: "Egypt",
 flag: "🇪🇬",
 hardCurrencyYield: 11.84,
 localCurrencyYield: 25.8,
 embiSpread: 741,
 creditRating: "B",
 ratingClass: "b",
 currency: "EGP",
 fxChangeYTD: -31.6,
 debtGDP: 92.7,
 },
 {
 country: "Chile",
 flag: "🇨🇱",
 hardCurrencyYield: 5.11,
 localCurrencyYield: 5.84,
 embiSpread: 69,
 creditRating: "A",
 ratingClass: "bbb",
 currency: "CLP",
 fxChangeYTD: -1.8,
 debtGDP: 36.2,
 },
];

const CENTRAL_BANKS: CentralBank[] = [
 {
 name: "Federal Reserve",
 country: "USA",
 flag: "🇺🇸",
 policyRate: 5.375,
 prevRate: 5.5,
 lastMeeting: "Mar 19, 2026",
 nextMeeting: "May 7, 2026",
 stance: "neutral",
 qeStatus: "QT",
 balanceSheetTrillion: 7.2,
 inflationTarget: 2.0,
 currentInflation: 3.2,
 },
 {
 name: "European Central Bank",
 country: "Eurozone",
 flag: "🇪🇺",
 policyRate: 3.15,
 prevRate: 3.4,
 lastMeeting: "Mar 6, 2026",
 nextMeeting: "Apr 17, 2026",
 stance: "dovish",
 qeStatus: "QT",
 balanceSheetTrillion: 6.4,
 inflationTarget: 2.0,
 currentInflation: 2.3,
 },
 {
 name: "Bank of Japan",
 country: "Japan",
 flag: "🇯🇵",
 policyRate: 0.5,
 prevRate: 0.25,
 lastMeeting: "Mar 18, 2026",
 nextMeeting: "Apr 30, 2026",
 stance: "hawkish",
 qeStatus: "Hold",
 balanceSheetTrillion: 5.1,
 inflationTarget: 2.0,
 currentInflation: 2.8,
 },
 {
 name: "Bank of England",
 country: "UK",
 flag: "🇬🇧",
 policyRate: 4.5,
 prevRate: 4.75,
 lastMeeting: "Mar 20, 2026",
 nextMeeting: "May 8, 2026",
 stance: "dovish",
 qeStatus: "QT",
 balanceSheetTrillion: 0.88,
 inflationTarget: 2.0,
 currentInflation: 3.4,
 },
 {
 name: "Reserve Bank of Australia",
 country: "Australia",
 flag: "🇦🇺",
 policyRate: 4.1,
 prevRate: 4.35,
 lastMeeting: "Feb 18, 2026",
 nextMeeting: "Apr 1, 2026",
 stance: "neutral",
 qeStatus: "None",
 balanceSheetTrillion: 0.41,
 inflationTarget: 2.5,
 currentInflation: 3.8,
 },
 {
 name: "People's Bank of China",
 country: "China",
 flag: "🇨🇳",
 policyRate: 3.1,
 prevRate: 3.35,
 lastMeeting: "Feb 20, 2026",
 nextMeeting: "Mar 31, 2026",
 stance: "dovish",
 qeStatus: "QE",
 balanceSheetTrillion: 7.8,
 inflationTarget: 3.0,
 currentInflation: 0.7,
 },
];

const HEDGING_DATA: HedgingData[] = [
 {
 currency: "EUR/USD",
 flag: "🇪🇺",
 spotRate: 1.0812,
 fwd3M: 1.0768,
 hedgingCostAnnualized: 1.63,
 unhedgedReturn: 2.48,
 hedgedReturn: 0.85,
 interestDiff: -1.94,
 },
 {
 currency: "GBP/USD",
 flag: "🇬🇧",
 spotRate: 1.2634,
 fwd3M: 1.2592,
 hedgingCostAnnualized: 1.33,
 unhedgedReturn: 4.58,
 hedgedReturn: 3.25,
 interestDiff: -0.17,
 },
 {
 currency: "JPY/USD",
 flag: "🇯🇵",
 spotRate: 151.42,
 fwd3M: 152.86,
 hedgingCostAnnualized: -3.81,
 unhedgedReturn: 1.51,
 hedgedReturn: 5.32,
 interestDiff: 3.92,
 },
 {
 currency: "AUD/USD",
 flag: "🇦🇺",
 spotRate: 0.6321,
 fwd3M: 0.6281,
 hedgingCostAnnualized: 2.54,
 unhedgedReturn: 4.38,
 hedgedReturn: 1.84,
 interestDiff: -0.04,
 },
 {
 currency: "CHF/USD",
 flag: "🇨🇭",
 spotRate: 0.8947,
 fwd3M: 0.8894,
 hedgingCostAnnualized: 2.38,
 unhedgedReturn: 0.77,
 hedgedReturn: -1.61,
 interestDiff: 3.65,
 },
 {
 currency: "CAD/USD",
 flag: "🇨🇦",
 spotRate: 1.3592,
 fwd3M: 1.3561,
 hedgingCostAnnualized: 0.91,
 unhedgedReturn: 3.31,
 hedgedReturn: 2.40,
 interestDiff: 1.11,
 },
];

// ── Color Helpers ─────────────────────────────────────────────────────────────

function ratingColor(rc: string): string {
 switch (rc) {
 case "aaa":
 return "text-emerald-400";
 case "aa":
 return "text-green-400";
 case "a":
 return "text-primary";
 case "bbb":
 return "text-yellow-400";
 case "bb":
 return "text-orange-400";
 case "b":
 case "ccc":
 return "text-red-400";
 default:
 return "text-muted-foreground";
 }
}

function stanceColor(s: string): string {
 if (s === "hawkish") return "bg-red-500/20 text-red-400 border-red-500/30";
 if (s === "dovish") return "bg-muted/10 text-primary border-border";
 return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
}

function yieldColor(y: number): string {
 if (y >= 8) return "text-red-400";
 if (y >= 5) return "text-orange-400";
 if (y >= 3) return "text-yellow-400";
 if (y >= 1) return "text-green-400";
 return "text-primary";
}

// ── Sub-Components ────────────────────────────────────────────────────────────

// Sovereign Yields Tab
function SovereignYieldsTab() {
 const [sortBy, setSortBy] = useState<"yield" | "rating" | "debt" | "infl">(
 "yield"
 );
 const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

 const sorted = useMemo(() => {
 const copy = [...SOVEREIGN_BONDS];
 copy.sort((a, b) => {
 let va = 0,
 vb = 0;
 if (sortBy === "yield") {
 va = a.yield10Y;
 vb = b.yield10Y;
 } else if (sortBy === "debt") {
 va = a.debtGDP;
 vb = b.debtGDP;
 } else if (sortBy === "infl") {
 va = a.inflation;
 vb = b.inflation;
 } else {
 const order: Record<string, number> = {
 aaa: 6,
 aa: 5,
 a: 4,
 bbb: 3,
 bb: 2,
 b: 1,
 };
 va = order[a.ratingClass] ?? 0;
 vb = order[b.ratingClass] ?? 0;
 }
 return sortDir === "desc" ? vb - va : va - vb;
 });
 return copy;
 }, [sortBy, sortDir]);

 const maxYield = Math.max(...SOVEREIGN_BONDS.map((b) => b.yield10Y));

 function toggle(col: typeof sortBy) {
 if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 else {
 setSortBy(col);
 setSortDir("desc");
 }
 }

 const SortBtn = ({
 col,
 label,
 }: {
 col: typeof sortBy;
 label: string;
 }) => (
 <button
 onClick={() => toggle(col)}
 className={cn(
 "flex items-center gap-1 text-xs text-muted-foreground font-medium transition-colors",
 sortBy === col ? "text-primary" : "text-muted-foreground hover:text-foreground"
 )}
 >
 {label}
 <ArrowUpDown className="w-3 h-3" />
 </button>
 );

 return (
 <div className="space-y-4">
 {/* Summary chips */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 {
 label: "Highest Yield",
 val: "Brazil 13.41%",
 icon: TrendingUp,
 color: "text-red-400",
 },
 {
 label: "Lowest Yield",
 val: "Switzerland 0.77%",
 icon: TrendingDown,
 color: "text-primary",
 },
 {
 label: "G10 Average",
 val: "3.04%",
 icon: BarChart3,
 color: "text-yellow-400",
 },
 {
 label: "US–DE Spread",
 val: "+194 bps",
 icon: Activity,
 color: "text-orange-400",
 },
 ].map((c) => (
 <div
 key={c.label}
 className="bg-muted/60 border border-border rounded-lg p-3"
 >
 <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
 <c.icon className="w-3.5 h-3.5" />
 {c.label}
 </div>
 <div className={cn("font-semibold text-sm", c.color)}>{c.val}</div>
 </div>
 ))}
 </div>

 {/* Yield Bar Chart */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-semibold text-foreground mb-4">
 10Y Sovereign Yields — Sorted by Yield
 </h3>
 <svg
 viewBox="0 0 700 300"
 className="w-full"
 aria-label="Sovereign yield bar chart"
 >
 {/* Grid lines */}
 {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => {
 const x = 80 + (v / maxYield) * 580;
 return (
 <g key={v}>
 <line
 x1={x}
 y1={10}
 x2={x}
 y2={270}
 stroke="#404040"
 strokeWidth={0.5}
 strokeDasharray="3 3"
 />
 <text x={x} y={285} textAnchor="middle" fill="#6b7280" fontSize={9}>
 {v}%
 </text>
 </g>
 );
 })}

 {[...SOVEREIGN_BONDS]
 .sort((a, b) => b.yield10Y - a.yield10Y)
 .map((bond, i) => {
 const y = 15 + i * 20;
 const barW = (bond.yield10Y / maxYield) * 580;
 const barColor =
 bond.ratingClass === "aaa" || bond.ratingClass === "aa"
 ? "#34d399"
 : bond.ratingClass === "a"
 ? "#60a5fa"
 : bond.ratingClass === "bbb"
 ? "#fbbf24"
 : "#f87171";
 return (
 <g key={bond.code}>
 <text x={75} y={y + 11} textAnchor="end" fill="#d1d5db" fontSize={10}>
 {bond.flag} {bond.code}
 </text>
 <rect
 x={80}
 y={y}
 width={barW}
 height={16}
 rx={2}
 fill={barColor}
 opacity={0.7}
 />
 <text
 x={80 + barW + 4}
 y={y + 11}
 fill="#f3f4f6"
 fontSize={9}
 >
 {bond.yield10Y.toFixed(2)}%
 </text>
 </g>
 );
 })}
 </svg>
 </div>

 {/* Table */}
 <div className="bg-muted/60 border border-border rounded-lg overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium px-4 py-3 text-xs">
 Country
 </th>
 <th className="text-right px-3 py-3">
 <SortBtn col="yield" label="10Y Yield" />
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 2Y
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 30Y
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 1D Chg
 </th>
 <th className="text-right px-3 py-3">
 <SortBtn col="rating" label="Rating" />
 </th>
 <th className="text-right px-3 py-3">
 <SortBtn col="debt" label="Debt/GDP" />
 </th>
 <th className="text-right px-3 py-3">
 <SortBtn col="infl" label="Inflation" />
 </th>
 </tr>
 </thead>
 <tbody>
 {sorted.map((bond, i) => (
 <motion.tr
 key={bond.code}
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.03 }}
 className="border-b border-border hover:bg-muted/20 transition-colors"
 >
 <td className="px-4 py-2.5">
 <div className="flex items-center gap-2">
 <span>{bond.flag}</span>
 <span className="text-foreground font-medium text-xs">
 {bond.country}
 </span>
 <Badge
 variant="outline"
 className="text-xs px-1.5 py-0 border-border text-muted-foreground"
 >
 {bond.region}
 </Badge>
 </div>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={cn("font-semibold", yieldColor(bond.yield10Y))}>
 {bond.yield10Y.toFixed(2)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {bond.yield2Y.toFixed(2)}%
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {bond.yield30Y.toFixed(2)}%
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium",
 bond.change1D > 0
 ? "text-red-400"
 : bond.change1D < 0
 ? "text-green-400"
 : "text-muted-foreground"
 )}
 >
 {bond.change1D > 0 ? "+" : ""}
 {bond.change1D.toFixed(2)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-semibold",
 ratingColor(bond.ratingClass)
 )}
 >
 {bond.rating}
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {bond.debtGDP.toFixed(1)}%
 </td>
 <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
 <span
 className={
 bond.inflation > 4 ? "text-red-400" : "text-muted-foreground"
 }
 >
 {bond.inflation.toFixed(1)}%
 </span>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

// Yield Curve Comparison Tab
function YieldCurveTab() {
 const tenors = ["2Y", "5Y", "10Y", "30Y"];
 const curves: {
 label: string;
 flag: string;
 code: string;
 data: number[];
 color: string;
 }[] = [
 {
 label: "United States",
 flag: "🇺🇸",
 code: "US",
 data: [4.71, 4.38, 4.42, 4.68],
 color: "#60a5fa",
 },
 {
 label: "Germany",
 flag: "🇩🇪",
 code: "DE",
 data: [2.89, 2.52, 2.48, 2.71],
 color: "#34d399",
 },
 {
 label: "Japan",
 flag: "🇯🇵",
 code: "JP",
 data: [0.72, 1.11, 1.51, 2.34],
 color: "#f87171",
 },
 ];

 // Compute spread analysis
 const spreadAnalysis = [
 {
 label: "US 2s10s",
 value: 4.42 - 4.71,
 insight: "Slightly inverted — recessionary signal persists",
 },
 {
 label: "DE 2s10s",
 value: 2.48 - 2.89,
 insight: "Inverted Bund curve — ECB still restrictive",
 },
 {
 label: "JP 2s10s",
 value: 1.51 - 0.72,
 insight: "Steepening — BoJ normalizing rates",
 },
 {
 label: "US–JP 10Y Spread",
 value: 4.42 - 1.51,
 insight: "Wide carry trade opportunity in USD/JPY",
 },
 {
 label: "US–DE 10Y Spread",
 value: 4.42 - 2.48,
 insight: "US outperformance premium near multi-year highs",
 },
 ];

 // SVG chart helper
 function CurveChart({
 title,
 data,
 color,
 flag,
 }: {
 title: string;
 data: number[];
 color: string;
 flag: string;
 }) {
 const minY = Math.min(...data) - 0.3;
 const maxY = Math.max(...data) + 0.3;
 const rangeY = maxY - minY;
 const W = 200,
 H = 120,
 pad = { t: 10, r: 10, b: 20, l: 36 };
 const chartW = W - pad.l - pad.r;
 const chartH = H - pad.t - pad.b;

 function toX(i: number) {
 return pad.l + (i / (data.length - 1)) * chartW;
 }
 function toY(v: number) {
 return pad.t + (1 - (v - minY) / rangeY) * chartH;
 }

 const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
 const areaPath = `M${toX(0)},${toY(data[0])} ${data
 .map((v, i) => `L${toX(i)},${toY(v)}`)
 .join(" ")} L${toX(data.length - 1)},${H - pad.b} L${toX(0)},${
 H - pad.b
 } Z`;

 const gridYs = [
 minY + rangeY * 0.25,
 minY + rangeY * 0.5,
 minY + rangeY * 0.75,
 ];

 return (
 <div className="bg-muted/60 border border-border rounded-lg p-3">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-base">{flag}</span>
 <span className="text-xs font-medium text-foreground">{title}</span>
 <span className="ml-auto text-xs text-muted-foreground">
 2Y / 5Y / 10Y / 30Y
 </span>
 </div>
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
 {/* Grid */}
 {gridYs.map((gy) => (
 <g key={gy}>
 <line
 x1={pad.l}
 y1={toY(gy)}
 x2={W - pad.r}
 y2={toY(gy)}
 stroke="#404040"
 strokeWidth={0.5}
 strokeDasharray="2 2"
 />
 <text
 x={pad.l - 3}
 y={toY(gy) + 3}
 textAnchor="end"
 fill="#6b7280"
 fontSize={7}
 >
 {gy.toFixed(1)}
 </text>
 </g>
 ))}

 {/* Tenor labels */}
 {tenors.map((t, i) => (
 <text
 key={t}
 x={toX(i)}
 y={H - 5}
 textAnchor="middle"
 fill="#6b7280"
 fontSize={7}
 >
 {t}
 </text>
 ))}

 {/* Area fill */}
 <path d={areaPath} fill={color} opacity={0.1} />

 {/* Curve line */}
 <polyline
 points={pts}
 fill="none"
 stroke={color}
 strokeWidth={1.5}
 strokeLinecap="round"
 strokeLinejoin="round"
 />

 {/* Data points */}
 {data.map((v, i) => (
 <g key={i}>
 <circle cx={toX(i)} cy={toY(v)} r={3} fill={color} />
 <text
 x={toX(i)}
 y={toY(v) - 5}
 textAnchor="middle"
 fill={color}
 fontSize={7}
 fontWeight="bold"
 >
 {v.toFixed(2)}
 </text>
 </g>
 ))}
 </svg>
 </div>
 );
 }

 // Combined overlay chart
 const allVals = curves.flatMap((c) => c.data);
 const minAllY = Math.min(...allVals) - 0.4;
 const maxAllY = Math.max(...allVals) + 0.4;
 const rangeAllY = maxAllY - minAllY;
 const CW = 560,
 CH = 200,
 cPad = { t: 16, r: 20, b: 28, l: 44 };
 const cChartW = CW - cPad.l - cPad.r;
 const cChartH = CH - cPad.t - cPad.b;

 function toXC(i: number) {
 return cPad.l + (i / 3) * cChartW;
 }
 function toYC(v: number) {
 return cPad.t + (1 - (v - minAllY) / rangeAllY) * cChartH;
 }

 const gridYVals = [1, 2, 3, 4, 5].filter(
 (v) => v >= minAllY && v <= maxAllY
 );

 return (
 <div className="space-y-4">
 {/* Individual curves */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {curves.map((c) => (
 <CurveChart
 key={c.code}
 title={c.label}
 data={c.data}
 color={c.color}
 flag={c.flag}
 />
 ))}
 </div>

 {/* Overlay chart */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">
 Yield Curve Overlay — US vs Germany vs Japan
 </h3>
 <div className="flex gap-4 mb-3">
 {curves.map((c) => (
 <div key={c.code} className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <div
 className="w-4 h-1 rounded"
 style={{ backgroundColor: c.color }}
 />
 <span className="text-muted-foreground">
 {c.flag} {c.code}
 </span>
 </div>
 ))}
 </div>
 <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full">
 {/* Grid */}
 {gridYVals.map((gy) => (
 <g key={gy}>
 <line
 x1={cPad.l}
 y1={toYC(gy)}
 x2={CW - cPad.r}
 y2={toYC(gy)}
 stroke="#404040"
 strokeWidth={0.5}
 strokeDasharray="3 3"
 />
 <text
 x={cPad.l - 4}
 y={toYC(gy) + 3}
 textAnchor="end"
 fill="#6b7280"
 fontSize={9}
 >
 {gy}%
 </text>
 </g>
 ))}

 {/* Tenor labels */}
 {tenors.map((t, i) => (
 <text
 key={t}
 x={toXC(i)}
 y={CH - 8}
 textAnchor="middle"
 fill="#6b7280"
 fontSize={9}
 >
 {t}
 </text>
 ))}

 {/* Curves */}
 {curves.map((c) => {
 const pts = c.data.map((v, i) => `${toXC(i)},${toYC(v)}`).join(" ");
 return (
 <g key={c.code}>
 <polyline
 points={pts}
 fill="none"
 stroke={c.color}
 strokeWidth={2}
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 {c.data.map((v, i) => (
 <circle
 key={i}
 cx={toXC(i)}
 cy={toYC(v)}
 r={3.5}
 fill={c.color}
 />
 ))}
 </g>
 );
 })}
 </svg>
 </div>

 {/* Spread Analysis */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">
 Curve Shape Analysis
 </h3>
 <div className="space-y-2.5">
 {spreadAnalysis.map((a) => (
 <div
 key={a.label}
 className="flex items-start gap-3 p-2.5 bg-muted/30 rounded-lg"
 >
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-xs font-medium text-foreground">{a.label}</span>
 <span
 className={cn(
 "text-xs text-muted-foreground font-semibold",
 a.value < 0 ? "text-red-400" : "text-green-400"
 )}
 >
 {a.value > 0 ? "+" : ""}
 {(a.value * 100).toFixed(0)} bps
 </span>
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground px-1.5 py-0",
 a.value < 0
 ? "border-red-500/40 text-red-400"
 : "border-green-500/40 text-green-400"
 )}
 >
 {a.value < 0 ? "Inverted" : "Normal"}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">{a.insight}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// Currency-Hedged Returns Tab
function HedgedReturnsTab() {
 return (
 <div className="space-y-4">
 {/* Info panel */}
 <div className="bg-muted/10 border border-border rounded-lg p-4 flex gap-3">
 <Info className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
 <div className="text-xs text-primary space-y-1">
 <p className="font-medium text-primary">Currency Hedging in Fixed Income</p>
 <p>
 When a US investor buys foreign bonds, currency risk can dominate
 returns. Hedging via FX forwards locks the exchange rate but incurs a
 cost equal to the interest-rate differential (covered interest rate
 parity). High-yield currencies are expensive to hedge.
 </p>
 </div>
 </div>

 {/* Summary cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 {[
 {
 label: "Best Hedged Return",
 val: "JPY +5.32%",
 sub: "Negative hedging cost (BoJ < Fed)",
 color: "text-green-400",
 },
 {
 label: "Worst Hedged Return",
 val: "CHF -1.61%",
 sub: "Hedging cost exceeds yield",
 color: "text-red-400",
 },
 {
 label: "Avg Hedging Cost",
 val: "1.73% p.a.",
 sub: "USD interest rate premium",
 color: "text-yellow-400",
 },
 ].map((c) => (
 <div
 key={c.label}
 className="bg-muted/60 border border-border rounded-lg p-3"
 >
 <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
 <div className={cn("font-medium text-sm", c.color)}>{c.val}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
 </div>
 ))}
 </div>

 {/* Table */}
 <div className="bg-muted/60 border border-border rounded-lg overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium px-4 py-3 text-xs">
 Currency Pair
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Spot
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 3M Fwd
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Hedging Cost
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Int. Diff
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Unhedged
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Hedged
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Verdict
 </th>
 </tr>
 </thead>
 <tbody>
 {HEDGING_DATA.map((h, i) => (
 <motion.tr
 key={h.currency}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: i * 0.04 }}
 className="border-b border-border hover:bg-muted/20 transition-colors"
 >
 <td className="px-4 py-2.5">
 <div className="flex items-center gap-2">
 <span>{h.flag}</span>
 <span className="text-foreground text-xs font-medium">
 {h.currency}
 </span>
 </div>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {h.spotRate.toFixed(4)}
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {h.fwd3M.toFixed(4)}
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium",
 h.hedgingCostAnnualized < 0
 ? "text-green-400"
 : "text-orange-400"
 )}
 >
 {h.hedgingCostAnnualized > 0 ? "-" : "+"}
 {Math.abs(h.hedgingCostAnnualized).toFixed(2)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground",
 h.interestDiff > 0 ? "text-green-400" : "text-red-400"
 )}
 >
 {h.interestDiff > 0 ? "+" : ""}
 {h.interestDiff.toFixed(2)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {h.unhedgedReturn.toFixed(2)}%
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium",
 h.hedgedReturn < 0 ? "text-red-400" : "text-green-400"
 )}
 >
 {h.hedgedReturn > 0 ? "+" : ""}
 {h.hedgedReturn.toFixed(2)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 h.hedgedReturn > 3
 ? "border-green-500/40 text-green-400"
 : h.hedgedReturn > 1
 ? "border-yellow-500/40 text-yellow-400"
 : "border-red-500/40 text-red-400"
 )}
 >
 {h.hedgedReturn > 3
 ? "Attractive"
 : h.hedgedReturn > 1
 ? "Neutral"
 : "Avoid"}
 </Badge>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Visual comparison bar chart */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium text-foreground mb-4">
 Unhedged vs Hedged Return Comparison
 </h3>
 <svg viewBox="0 0 600 180" className="w-full">
 {[-2, 0, 2, 4, 6].map((v) => {
 const x = 60 + ((v + 2) / 8) * 500;
 return (
 <g key={v}>
 <line
 x1={x}
 y1={10}
 x2={x}
 y2={155}
 stroke={v === 0 ? "#525252" : "#404040"}
 strokeWidth={v === 0 ? 1 : 0.5}
 strokeDasharray={v === 0 ? "none" : "3 3"}
 />
 <text
 x={x}
 y={168}
 textAnchor="middle"
 fill="#6b7280"
 fontSize={8}
 >
 {v}%
 </text>
 </g>
 );
 })}

 {HEDGING_DATA.map((h, i) => {
 const rowH = 22;
 const y = 12 + i * rowH;
 const zeroX = 60 + (2 / 8) * 500;

 const unhW = (h.unhedgedReturn / 8) * 500;
 const hedW = (Math.abs(h.hedgedReturn) / 8) * 500;
 const hedNeg = h.hedgedReturn < 0;

 return (
 <g key={h.currency}>
 <text
 x={55}
 y={y + 12}
 textAnchor="end"
 fill="#d1d5db"
 fontSize={9}
 >
 {h.flag} {h.currency.split("/")[0]}
 </text>

 {/* Unhedged bar */}
 <rect
 x={zeroX}
 y={y}
 width={unhW}
 height={8}
 rx={1}
 fill="#60a5fa"
 opacity={0.7}
 />

 {/* Hedged bar */}
 {hedNeg ? (
 <rect
 x={zeroX - hedW}
 y={y + 10}
 width={hedW}
 height={8}
 rx={1}
 fill="#f87171"
 opacity={0.7}
 />
 ) : (
 <rect
 x={zeroX}
 y={y + 10}
 width={hedW}
 height={8}
 rx={1}
 fill="#34d399"
 opacity={0.7}
 />
 )}
 </g>
 );
 })}

 {/* Legend */}
 <g>
 <rect x={60} y={162} width={10} height={5} rx={1} fill="#60a5fa" opacity={0.7} />
 <text x={74} y={168} fill="#9ca3af" fontSize={7}>
 Unhedged
 </text>
 <rect x={130} y={162} width={10} height={5} rx={1} fill="#34d399" opacity={0.7} />
 <text x={144} y={168} fill="#9ca3af" fontSize={7}>
 Hedged
 </text>
 </g>
 </svg>
 </div>
 </div>
 );
}

// EM Bonds Tab
function EMBondsTab() {
 const maxSpread = Math.max(...EM_BONDS.map((e) => e.embiSpread));

 return (
 <div className="space-y-4">
 {/* Summary */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 {
 label: "Widest Spread",
 val: "Egypt 741 bps",
 color: "text-red-400",
 icon: AlertTriangle,
 },
 {
 label: "Tightest Spread",
 val: "Poland 46 bps",
 color: "text-green-400",
 icon: ShieldCheck,
 },
 {
 label: "EM Avg Spread",
 val: "277 bps",
 color: "text-yellow-400",
 icon: BarChart3,
 },
 {
 label: "Hard vs Local",
 val: "+3.2% carry",
 color: "text-primary",
 icon: DollarSign,
 },
 ].map((c) => (
 <div
 key={c.label}
 className="bg-muted/60 border border-border rounded-lg p-3"
 >
 <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
 <c.icon className="w-3.5 h-3.5" />
 {c.label}
 </div>
 <div className={cn("font-medium text-sm", c.color)}>{c.val}</div>
 </div>
 ))}
 </div>

 {/* EMBI Spread Bar Chart */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium text-foreground mb-4">
 EMBI Spread by Country (bps over UST)
 </h3>
 <svg viewBox="0 0 680 220" className="w-full">
 {[0, 100, 200, 300, 400, 500, 600, 700].map((v) => {
 const x = 90 + (v / maxSpread) * 550;
 return (
 <g key={v}>
 <line
 x1={x}
 y1={10}
 x2={x}
 y2={195}
 stroke="#404040"
 strokeWidth={0.5}
 strokeDasharray="3 3"
 />
 <text
 x={x}
 y={210}
 textAnchor="middle"
 fill="#6b7280"
 fontSize={8}
 >
 {v}
 </text>
 </g>
 );
 })}

 {[...EM_BONDS]
 .sort((a, b) => b.embiSpread - a.embiSpread)
 .map((em, i) => {
 const y = 14 + i * 19;
 const barW = (em.embiSpread / maxSpread) * 550;
 const col =
 em.embiSpread > 500
 ? "#f87171"
 : em.embiSpread > 300
 ? "#fb923c"
 : em.embiSpread > 150
 ? "#fbbf24"
 : "#34d399";
 return (
 <g key={em.country}>
 <text
 x={85}
 y={y + 11}
 textAnchor="end"
 fill="#d1d5db"
 fontSize={9}
 >
 {em.flag} {em.country}
 </text>
 <rect
 x={90}
 y={y}
 width={barW}
 height={14}
 rx={2}
 fill={col}
 opacity={0.75}
 />
 <text
 x={90 + barW + 4}
 y={y + 10}
 fill="#f3f4f6"
 fontSize={8}
 >
 {em.embiSpread} bps
 </text>
 </g>
 );
 })}
 </svg>
 </div>

 {/* EM Table */}
 <div className="bg-muted/60 border border-border rounded-lg overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium px-4 py-3 text-xs">
 Country
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Hard CCY
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Local CCY
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 EMBI Spread
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Rating
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 FX YTD
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Debt/GDP
 </th>
 <th className="text-right text-muted-foreground font-medium px-3 py-3 text-xs">
 Risk
 </th>
 </tr>
 </thead>
 <tbody>
 {EM_BONDS.map((em, i) => (
 <motion.tr
 key={em.country}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: i * 0.04 }}
 className="border-b border-border hover:bg-muted/20 transition-colors"
 >
 <td className="px-4 py-2.5">
 <div className="flex items-center gap-2">
 <span>{em.flag}</span>
 <span className="text-foreground text-xs font-medium">
 {em.country}
 </span>
 <span className="text-muted-foreground text-xs">
 {em.currency}
 </span>
 </div>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {em.hardCurrencyYield.toFixed(2)}%
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium",
 yieldColor(em.localCurrencyYield)
 )}
 >
 {em.localCurrencyYield.toFixed(2)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium",
 em.embiSpread > 500
 ? "text-red-400"
 : em.embiSpread > 300
 ? "text-orange-400"
 : em.embiSpread > 150
 ? "text-yellow-400"
 : "text-green-400"
 )}
 >
 {em.embiSpread} bps
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium",
 ratingColor(em.ratingClass)
 )}
 >
 {em.creditRating}
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium",
 em.fxChangeYTD >= 0 ? "text-green-400" : "text-red-400"
 )}
 >
 {em.fxChangeYTD > 0 ? "+" : ""}
 {em.fxChangeYTD.toFixed(1)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
 {em.debtGDP.toFixed(1)}%
 </td>
 <td className="px-3 py-2.5 text-right">
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 em.ratingClass === "bbb"
 ? "border-yellow-500/40 text-yellow-400"
 : em.ratingClass === "bb"
 ? "border-orange-500/40 text-orange-400"
 : "border-red-500/40 text-red-400"
 )}
 >
 {em.ratingClass === "bbb"
 ? "Moderate"
 : em.ratingClass === "bb"
 ? "High"
 : "Speculative"}
 </Badge>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Hard vs Local Currency comparison note */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">
 Hard Currency vs Local Currency EM Bonds
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[
 {
 title: "Hard Currency (USD-denominated)",
 points: [
 "No currency risk for USD investors",
 "Trades on USD credit spread over UST",
 "Tracked by EMBI Global Index",
 "Lower yield, higher liquidity",
 "Vulnerable to USD strengthening",
 ],
 color: "border-primary/40 bg-muted/10",
 textColor: "text-primary",
 },
 {
 title: "Local Currency (Domestic CCY)",
 points: [
 "Higher nominal yield compensates FX risk",
 "Tracked by GBI-EM Index",
 "Requires FX overlay to manage currency",
 "Benefits from EM currency appreciation",
 "Preferred when USD weakens",
 ],
 color: "border-emerald-500/40 bg-emerald-500/5",
 textColor: "text-emerald-300",
 },
 ].map((panel) => (
 <div
 key={panel.title}
 className={cn("rounded-lg p-3 border", panel.color)}
 >
 <h4 className={cn("text-xs text-muted-foreground font-medium mb-2", panel.textColor)}>
 {panel.title}
 </h4>
 <ul className="space-y-1">
 {panel.points.map((pt) => (
 <li
 key={pt}
 className="text-xs text-muted-foreground flex items-start gap-1.5"
 >
 <span className={cn("mt-0.5", panel.textColor)}>•</span>
 {pt}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// Central Bank Divergence Tab
function CentralBankTab() {
 const maxRate = Math.max(...CENTRAL_BANKS.map((cb) => cb.policyRate));

 return (
 <div className="space-y-4">
 {/* Policy rate differential chart */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium text-foreground mb-4">
 G6 Central Bank Policy Rates
 </h3>
 <svg viewBox="0 0 680 200" className="w-full">
 {[0, 1, 2, 3, 4, 5, 6].map((v) => {
 const y = 170 - (v / maxRate) * 150;
 return (
 <g key={v}>
 <line
 x1={60}
 y1={y}
 x2={660}
 y2={y}
 stroke={v === 0 ? "#525252" : "#3a3a3a"}
 strokeWidth={v === 0 ? 1 : 0.5}
 strokeDasharray={v === 0 ? "none" : "3 3"}
 />
 <text
 x={52}
 y={y + 3}
 textAnchor="end"
 fill="#6b7280"
 fontSize={8}
 >
 {v}%
 </text>
 </g>
 );
 })}

 {CENTRAL_BANKS.map((cb, i) => {
 const xGap = 100;
 const x = 80 + i * xGap;
 const barH = (cb.policyRate / maxRate) * 150;
 const prevBarH = (cb.prevRate / maxRate) * 150;
 const barY = 170 - barH;
 const barColor =
 cb.stance === "hawkish"
 ? "#f87171"
 : cb.stance === "dovish"
 ? "#60a5fa"
 : "#fbbf24";

 return (
 <g key={cb.name}>
 {/* Previous rate ghost bar */}
 <rect
 x={x - 16}
 y={170 - prevBarH}
 width={32}
 height={prevBarH}
 rx={2}
 fill={barColor}
 opacity={0.2}
 />
 {/* Current rate bar */}
 <rect
 x={x - 16}
 y={barY}
 width={32}
 height={barH}
 rx={2}
 fill={barColor}
 opacity={0.75}
 />
 {/* Rate label */}
 <text
 x={x}
 y={barY - 4}
 textAnchor="middle"
 fill={barColor}
 fontSize={10}
 fontWeight="bold"
 >
 {cb.policyRate.toFixed(2)}%
 </text>
 {/* Country flag + label */}
 <text
 x={x}
 y={185}
 textAnchor="middle"
 fill="#d1d5db"
 fontSize={9}
 >
 {cb.flag}
 </text>
 <text
 x={x}
 y={196}
 textAnchor="middle"
 fill="#9ca3af"
 fontSize={7}
 >
 {cb.country}
 </text>
 </g>
 );
 })}

 {/* Legend */}
 <g>
 <rect x={60} y={5} width={8} height={5} rx={1} fill="#9ca3af" opacity={0.4} />
 <text x={72} y={11} fill="#6b7280" fontSize={7}>
 Previous rate (ghost)
 </text>
 </g>
 </svg>
 </div>

 {/* CB Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {CENTRAL_BANKS.map((cb, i) => {
 const rateChange = cb.policyRate - cb.prevRate;
 return (
 <motion.div
 key={cb.name}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.08 }}
 className="bg-muted/60 border border-border rounded-lg p-4 space-y-3"
 >
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-lg">{cb.flag}</span>
 <div>
 <div className="text-xs font-medium text-foreground">
 {cb.name}
 </div>
 <div className="text-xs text-muted-foreground">
 {cb.country}
 </div>
 </div>
 </div>
 </div>
 <Badge
 variant="outline"
 className={cn("text-xs text-muted-foreground border", stanceColor(cb.stance))}
 >
 {cb.stance.charAt(0).toUpperCase() + cb.stance.slice(1)}
 </Badge>
 </div>

 <div className="flex items-end gap-2">
 <span className="text-2xl font-semibold text-foreground">
 {cb.policyRate.toFixed(2)}%
 </span>
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium mb-1",
 rateChange > 0
 ? "text-red-400"
 : rateChange < 0
 ? "text-green-400"
 : "text-muted-foreground"
 )}
 >
 {rateChange !== 0
 ? `${rateChange > 0 ? "+" : ""}${(rateChange * 100).toFixed(0)} bps`
 : "Unchanged"}
 </span>
 </div>

 {/* Inflation vs Target */}
 <div>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span>Inflation</span>
 <span>
 {cb.currentInflation.toFixed(1)}% vs {cb.inflationTarget}% target
 </span>
 </div>
 <div className="h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className={cn(
 "h-full rounded-full transition-colors",
 cb.currentInflation > cb.inflationTarget + 1
 ? "bg-red-400"
 : cb.currentInflation < cb.inflationTarget - 0.5
 ? "bg-primary"
 : "bg-green-400"
 )}
 style={{
 width: `${Math.min(
 100,
 (cb.currentInflation / (cb.inflationTarget * 2)) * 100
 )}%`,
 }}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 pt-1">
 <div className="bg-muted/40 rounded p-2">
 <div className="text-[11px] text-muted-foreground">QE/QT Status</div>
 <div
 className={cn(
 "text-xs text-muted-foreground font-medium",
 cb.qeStatus === "QT"
 ? "text-red-400"
 : cb.qeStatus === "QE"
 ? "text-green-400"
 : "text-muted-foreground"
 )}
 >
 {cb.qeStatus}
 </div>
 </div>
 <div className="bg-muted/40 rounded p-2">
 <div className="text-[11px] text-muted-foreground">Balance Sheet</div>
 <div className="text-xs font-medium text-foreground">
 ${cb.balanceSheetTrillion.toFixed(1)}T
 </div>
 </div>
 </div>

 <div className="text-xs text-muted-foreground flex justify-between border-t border-border pt-2">
 <span>Last: {cb.lastMeeting}</span>
 <span>Next: {cb.nextMeeting}</span>
 </div>
 </motion.div>
 );
 })}
 </div>

 {/* Divergence Analysis */}
 <div className="bg-muted/60 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">
 Policy Divergence Implications
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 {
 title: "Fed vs ECB Divergence",
 diff: `+${(5.375 - 3.15).toFixed(2)}%`,
 desc: "Wide spread supports USD over EUR. Limits EUR bond demand from US investors on unhedged basis.",
 color: "text-primary",
 bg: "bg-muted/10 border-border",
 },
 {
 title: "Fed vs BoJ Divergence",
 diff: `+${(5.375 - 0.5).toFixed(2)}%`,
 desc: "Large carry trade dynamic. Yen suppression pressure eases as BoJ normalizes rates toward 0.75–1%.",
 color: "text-red-400",
 bg: "bg-red-500/5 border-red-500/20",
 },
 {
 title: "Global Easing Cycle",
 diff: "Fed → 4.5% est.",
 desc: "Most DM central banks entering rate-cut cycles in 2026. Favors duration in IG fixed income.",
 color: "text-green-400",
 bg: "bg-green-500/10 border-green-500/20",
 },
 ].map((p) => (
 <div key={p.title} className={cn("border rounded-lg p-3", p.bg)}>
 <div className={cn("text-xs text-muted-foreground font-medium mb-1", p.color)}>
 {p.title}
 </div>
 <div className={cn("text-lg font-medium mb-1", p.color)}>
 {p.diff}
 </div>
 <p className="text-xs text-muted-foreground">{p.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GlobalBondsPage() {
 const [activeTab, setActiveTab] = useState("sovereign");

 const tabs = [
 {
 id: "sovereign",
 label: "Sovereign Yields",
 icon: Globe,
 shortLabel: "Sovereign",
 },
 {
 id: "curves",
 label: "Yield Curves",
 icon: TrendingUp,
 shortLabel: "Curves",
 },
 {
 id: "hedged",
 label: "CCY-Hedged",
 icon: DollarSign,
 shortLabel: "Hedged",
 },
 {
 id: "em",
 label: "EM Bonds",
 icon: Activity,
 shortLabel: "EM",
 },
 {
 id: "centralbank",
 label: "Central Banks",
 icon: Landmark,
 shortLabel: "CB Divergence",
 },
 ];

 return (
 <div className="flex flex-col h-full bg-card text-foreground overflow-y-auto">
 {/* Header */}
 <div className="px-6 pt-6 pb-4 border-b border-border border-l-4 border-l-primary shrink-0">
 <div className="flex items-start justify-between gap-4">
 <div>
 <div className="flex items-center gap-2.5 mb-1">
 <div className="w-7 h-7 rounded-lg bg-muted/10 flex items-center justify-center">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 </div>
 <h1 className="text-lg font-medium text-foreground">
 Global Bond Markets
 </h1>
 </div>
 <p className="text-sm text-muted-foreground">
 Cross-country fixed income analysis — sovereign yields, yield
 curves, currency-hedged returns, EM spreads &amp; central bank
 policy
 </p>
 </div>
 <div className="flex gap-2 shrink-0">
 <Badge
 variant="outline"
 className="border-border text-muted-foreground text-xs"
 >
 <Percent className="w-3 h-3 mr-1" />
 Mar 28, 2026
 </Badge>
 <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Simulated Data</span>
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex-1 px-6 py-5 mt-8">
 <Tabs
 value={activeTab}
 onValueChange={setActiveTab}
 className="flex flex-col h-full"
 >
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 {tabs.map((tab) => (
 <TabsTrigger
 key={tab.id}
 value={tab.id}
 className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground px-3 py-1.5 rounded-md transition-colors"
 >
 <tab.icon className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">{tab.label}</span>
 <span className="sm:hidden">{tab.shortLabel}</span>
 </TabsTrigger>
 ))}
 </TabsList>

 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -6 }}
 transition={{ duration: 0.18 }}
 >
 <TabsContent value="sovereign" className="mt-0">
 <SovereignYieldsTab />
 </TabsContent>

 <TabsContent value="curves" className="mt-0">
 <YieldCurveTab />
 </TabsContent>

 <TabsContent value="hedged" className="mt-0">
 <HedgedReturnsTab />
 </TabsContent>

 <TabsContent value="em" className="mt-0">
 <EMBondsTab />
 </TabsContent>

 <TabsContent value="centralbank" className="mt-0">
 <CentralBankTab />
 </TabsContent>
 </motion.div>
 </AnimatePresence>
 </Tabs>
 </div>
 </div>
 );
}
