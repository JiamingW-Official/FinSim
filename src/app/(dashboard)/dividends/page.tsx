"use client";

import { useState, useMemo } from "react";
import {
 DollarSign,
 TrendingUp,
 Calendar,
 BarChart3,
 Award,
 Crown,
 Star,
 ChevronUp,
 ChevronDown,
 Info,
 AlertTriangle,
 CheckCircle2,
 Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { DividendIncomeTracker } from "@/components/dividends/DividendIncomeTracker";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
 let s = seed >>> 0;
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

function dateSeed(): number {
 const d = new Date();
 return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmt(n: number, d = 2): string {
 return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtK(n: number): string {
 if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
 if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
 return `$${fmt(n, 0)}`;
}

// ── Dividend Stock Data ───────────────────────────────────────────────────────

type SortKey = "yield" | "growthRate" | "score" | "baseDivPerShare" | "payoutRatio" | "consecutiveYears";

interface DivStockDef {
 ticker: string;
 name: string;
 sector: string;
 basePrice: number;
 baseYield: number; // %
 baseDivPerShare: number; // annual
 payoutRatio: number; // %
 growthRate: number; // 5Y CAGR %
 consecutiveYears: number;
 exDivMonth: number; // 1-12
 exDivDay: number;
 paymentMonth: number;
 paymentDay: number;
 // For Tab 4 history generation
 baseDiv2015: number;
 fcfPerShare: number;
 debtToEquity: number;
}

const DIV_STOCKS: DivStockDef[] = [
 { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", basePrice: 158.40, baseYield: 3.1, baseDivPerShare: 4.76, payoutRatio: 68, growthRate: 5.9, consecutiveYears: 62, exDivMonth: 2, exDivDay: 20, paymentMonth: 3, paymentDay: 12, baseDiv2015: 2.95, fcfPerShare: 8.20, debtToEquity: 0.52 },
 { ticker: "PG", name: "Procter & Gamble", sector: "Consumer", basePrice: 164.90, baseYield: 2.3, baseDivPerShare: 3.76, payoutRatio: 61, growthRate: 5.4, consecutiveYears: 68, exDivMonth: 1, exDivDay: 18, paymentMonth: 2, paymentDay: 15, baseDiv2015: 2.59, fcfPerShare: 5.50, debtToEquity: 0.71 },
 { ticker: "KO", name: "Coca-Cola", sector: "Consumer", basePrice: 62.30, baseYield: 3.1, baseDivPerShare: 1.94, payoutRatio: 73, growthRate: 4.8, consecutiveYears: 62, exDivMonth: 3, exDivDay: 14, paymentMonth: 4, paymentDay: 1, baseDiv2015: 1.32, fcfPerShare: 2.10, debtToEquity: 1.68 },
 { ticker: "MCD", name: "McDonald's", sector: "Consumer", basePrice: 300.50, baseYield: 2.3, baseDivPerShare: 6.68, payoutRatio: 67, growthRate: 8.5, consecutiveYears: 48, exDivMonth: 2, exDivDay: 28, paymentMonth: 3, paymentDay: 17, baseDiv2015: 3.40, fcfPerShare: 9.20, debtToEquity: 3.45 },
 { ticker: "T", name: "AT&T", sector: "Telecom", basePrice: 19.80, baseYield: 6.7, baseDivPerShare: 1.11, payoutRatio: 52, growthRate: 1.0, consecutiveYears: 3, exDivMonth: 1, exDivDay: 9, paymentMonth: 2, paymentDay: 1, baseDiv2015: 1.84, fcfPerShare: 3.20, debtToEquity: 1.48 },
 { ticker: "VZ", name: "Verizon", sector: "Telecom", basePrice: 41.20, baseYield: 6.2, baseDivPerShare: 2.66, payoutRatio: 61, growthRate: 1.8, consecutiveYears: 18, exDivMonth: 4, exDivDay: 9, paymentMonth: 5, paymentDay: 1, baseDiv2015: 2.23, fcfPerShare: 4.80, debtToEquity: 1.62 },
 { ticker: "XOM", name: "ExxonMobil", sector: "Energy", basePrice: 112.40, baseYield: 3.4, baseDivPerShare: 3.80, payoutRatio: 44, growthRate: 3.6, consecutiveYears: 42, exDivMonth: 2, exDivDay: 12, paymentMonth: 3, paymentDay: 10, baseDiv2015: 2.94, fcfPerShare: 9.70, debtToEquity: 0.22 },
 { ticker: "CVX", name: "Chevron", sector: "Energy", basePrice: 158.20, baseYield: 4.1, baseDivPerShare: 6.52, payoutRatio: 56, growthRate: 6.2, consecutiveYears: 37, exDivMonth: 2, exDivDay: 15, paymentMonth: 3, paymentDay: 10, baseDiv2015: 4.28, fcfPerShare: 11.80, debtToEquity: 0.18 },
 { ticker: "WMT", name: "Walmart", sector: "Retail", basePrice: 90.20, baseYield: 1.2, baseDivPerShare: 0.83, payoutRatio: 35, growthRate: 3.6, consecutiveYears: 51, exDivMonth: 3, exDivDay: 14, paymentMonth: 4, paymentDay: 2, baseDiv2015: 0.49, fcfPerShare: 5.80, debtToEquity: 0.65 },
 { ticker: "HD", name: "Home Depot", sector: "Retail", basePrice: 388.80, baseYield: 2.2, baseDivPerShare: 8.90, payoutRatio: 56, growthRate: 13.2, consecutiveYears: 15, exDivMonth: 3, exDivDay: 5, paymentMonth: 3, paymentDay: 27, baseDiv2015: 2.36, fcfPerShare: 17.20, debtToEquity: 2.84 },
 { ticker: "O", name: "Realty Income", sector: "Real Estate", basePrice: 54.20, baseYield: 5.8, baseDivPerShare: 3.09, payoutRatio: 75, growthRate: 3.1, consecutiveYears: 30, exDivMonth: 4, exDivDay: 30, paymentMonth: 5, paymentDay: 15, baseDiv2015: 2.28, fcfPerShare: 3.50, debtToEquity: 0.82 },
 { ticker: "PEP", name: "PepsiCo", sector: "Consumer", basePrice: 178.90, baseYield: 3.0, baseDivPerShare: 5.06, payoutRatio: 69, growthRate: 7.1, consecutiveYears: 52, exDivMonth: 3, exDivDay: 7, paymentMonth: 3, paymentDay: 31, baseDiv2015: 2.81, fcfPerShare: 6.20, debtToEquity: 2.28 },
];

// ── Sector colors ─────────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, { text: string; bg: string; border: string }> = {
 Healthcare: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
 Consumer: { text: "text-primary", bg: "bg-primary/10", border: "border-border" },
 Telecom: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
 Energy: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
 Retail: { text: "text-muted-foreground", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
 "Real Estate": { text: "text-primary", bg: "bg-primary/10", border: "border-border" },
};

// ── Computed stock rows ───────────────────────────────────────────────────────

interface DivStockRow extends DivStockDef {
 price: number;
 change1d: number;
 yield: number;
 score: number; // yield * growthRate
 exDivDate: string;
 paymentDate: string;
 isDividendAristocrat: boolean;
 isDividendKing: boolean;
}

function buildStockRows(): DivStockRow[] {
 const rng = seededRandom(dateSeed() + 8888);
 return DIV_STOCKS.map((def) => {
 const jitter = 1 + (rng() - 0.5) * 0.03;
 const change = (rng() - 0.48) * 2.8;
 const divYield = def.baseYield + (rng() - 0.5) * 0.15;
 const year = 2026;
 return {
 ...def,
 price: def.basePrice * jitter,
 change1d: change,
 yield: divYield,
 score: divYield * def.growthRate,
 exDivDate: `${year}-${String(def.exDivMonth).padStart(2, "0")}-${String(def.exDivDay).padStart(2, "0")}`,
 paymentDate: `${year}-${String(def.paymentMonth).padStart(2, "0")}-${String(def.paymentDay).padStart(2, "0")}`,
 isDividendAristocrat: def.consecutiveYears >= 25 && def.consecutiveYears < 50,
 isDividendKing: def.consecutiveYears >= 50,
 };
 });
}

// ── Tab 1: Dividend Stocks ────────────────────────────────────────────────────

function DividendStocksTab() {
 const rows = useMemo(() => buildStockRows(), []);
 const [sortKey, setSortKey] = useState<SortKey>("yield");
 const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

 const sorted = useMemo(() => {
 const copy = [...rows];
 copy.sort((a, b) => {
 const av = a[sortKey as keyof DivStockRow] as number;
 const bv = b[sortKey as keyof DivStockRow] as number;
 return sortDir === "desc" ? bv - av : av - bv;
 });
 return copy;
 }, [rows, sortKey, sortDir]);

 function toggleSort(k: SortKey) {
 if (k === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
 else { setSortKey(k); setSortDir("desc"); }
 }

 const SortHdr = ({ label, k }: { label: string; k: SortKey }) => (
 <th
 className="px-3 py-2 text-right text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
 onClick={() => toggleSort(k)}
 >
 {label}
 {sortKey === k ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
 </th>
 );

 // Summary chips
 const avgYield = rows.reduce((s, r) => s + r.yield, 0) / rows.length;
 const kings = rows.filter((r) => r.isDividendKing).length;
 const aristocrats = rows.filter((r) => r.isDividendAristocrat).length;
 const avgGrowth = rows.reduce((s, r) => s + r.growthRate, 0) / rows.length;

 return (
 <div className="space-y-4">
 {/* Summary chips */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label: "Avg Yield", value: `${fmt(avgYield, 2)}%`, color: "text-green-400" },
 { label: "Avg 5Y Growth", value: `${fmt(avgGrowth, 1)}%`, color: "text-primary" },
 { label: "Dividend Kings", value: String(kings), color: "text-yellow-400" },
 { label: "Aristocrats", value: String(aristocrats), color: "text-primary" },
 ].map((chip) => (
 <div key={chip.label} className="bg-muted/30 border border-border rounded-lg p-3">
 <p className="text-xs text-muted-foreground">{chip.label}</p>
 <p className={cn("text-lg font-semibold mt-0.5", chip.color)}>{chip.value}</p>
 </div>
 ))}
 </div>

 {/* Sort shortcuts */}
 <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
 <span>Sort by:</span>
 {(["yield", "growthRate", "score"] as const).map((k) => (
 <button
 key={k}
 onClick={() => toggleSort(k)}
 className={cn(
 "px-3 py-1 rounded-full border text-xs text-muted-foreground font-medium transition-all",
 sortKey === k
 ? "bg-primary/20 border-primary/50 text-primary"
 : "border-border text-muted-foreground hover:border-border hover:text-foreground"
 )}
 >
 {k === "yield" ? "Yield" : k === "growthRate" ? "5Y Growth" : "Yield \u00d7 Growth Score"}
 </button>
 ))}
 </div>

 {/* Table */}
 <div className="rounded-lg border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-muted/30">
 <tr>
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Ticker / Name</th>
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Sector</th>
 <SortHdr label="Yield" k="yield" />
 <SortHdr label="Div/Share" k="baseDivPerShare" />
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">Ex-Div Date</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">Pay Date</th>
 <SortHdr label="Payout" k="payoutRatio" />
 <SortHdr label="5Y CAGR" k="growthRate" />
 <SortHdr label="Consec. Yrs" k="consecutiveYears" />
 <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/30">
 {sorted.map((r) => {
 const sc = SECTOR_COLORS[r.sector] ?? SECTOR_COLORS["Consumer"];
 return (
 <tr key={r.ticker} className="hover:bg-muted/20 transition-colors">
 <td className="px-3 py-2.5">
 <div className="font-semibold text-foreground">{r.ticker}</div>
 <div className="text-xs text-muted-foreground truncate max-w-[140px]">{r.name}</div>
 </td>
 <td className="px-3 py-2.5">
 <span className={cn("px-2 py-0.5 rounded text-xs text-muted-foreground font-medium border", sc.bg, sc.text, sc.border)}>
 {r.sector}
 </span>
 </td>
 <td className="px-3 py-2.5 text-right font-mono text-green-400 font-medium">{fmt(r.yield, 2)}%</td>
 <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">${fmt(r.baseDivPerShare, 2)}</td>
 <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">{r.exDivDate}</td>
 <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">{r.paymentDate}</td>
 <td className="px-3 py-2.5 text-right">
 <div className="flex items-center justify-end gap-1.5">
 <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
 <div
 className={cn("h-full rounded-full", r.payoutRatio > 80 ? "bg-red-500" : r.payoutRatio > 65 ? "bg-amber-500" : "bg-green-500")}
 style={{ width: `${Math.min(r.payoutRatio, 100)}%` }}
 />
 </div>
 <span className={cn("text-xs font-mono", r.payoutRatio > 80 ? "text-red-400" : r.payoutRatio > 65 ? "text-amber-400" : "text-green-400")}>
 {r.payoutRatio}%
 </span>
 </div>
 </td>
 <td className={cn("px-3 py-2.5 text-right font-mono text-xs", r.growthRate > 7 ? "text-primary" : r.growthRate > 4 ? "text-muted-foreground" : "text-muted-foreground")}>
 +{fmt(r.growthRate, 1)}%
 </td>
 <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground">{r.consecutiveYears}y</td>
 <td className="px-3 py-2.5 text-center">
 {r.isDividendKing ? (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
 <Crown className="w-3 h-3" /> King
 </span>
 ) : r.isDividendAristocrat ? (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 border border-border text-primary text-xs font-medium">
 <Award className="w-3 h-3" /> Aristocrat
 </span>
 ) : (
 <span className="text-xs text-muted-foreground">—</span>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 {/* Legend */}
 <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
 <span className="inline-flex items-center gap-1"><Crown className="w-3 h-3 text-yellow-400" /> Dividend King = 50+ consecutive years of growth</span>
 <span className="inline-flex items-center gap-1"><Award className="w-3 h-3 text-primary" /> Dividend Aristocrat = 25+ consecutive years of growth</span>
 <span>Payout: <span className="text-green-400">&lt;65% Healthy</span> / <span className="text-amber-400">65–80% Watch</span> / <span className="text-red-400">&gt;80% Risk</span></span>
 </div>
 </div>
 );
}

// ── Tab 2: Income Calculator ──────────────────────────────────────────────────

interface CalcYear {
 year: number;
 portfolioValue: number;
 annualIncome: number;
 cumulativeIncome: number;
}

function computeIncome(
 investment: number,
 yieldPct: number,
 growthPct: number,
 years: number,
 drip: boolean,
): CalcYear[] {
 const result: CalcYear[] = [];
 let portfolioValue = investment;
 let divRate = yieldPct / 100;
 let cumulativeIncome = 0;

 for (let y = 0; y <= years; y++) {
 const annualIncome = portfolioValue * divRate;
 result.push({ year: y, portfolioValue, annualIncome, cumulativeIncome });
 cumulativeIncome += annualIncome;
 const priceAppreciation = 0.035; // assumed 3.5% price appreciation
 if (drip) {
 portfolioValue = (portfolioValue + annualIncome) * (1 + priceAppreciation);
 } else {
 portfolioValue = portfolioValue * (1 + priceAppreciation);
 }
 divRate = divRate * (1 + growthPct / 100);
 }
 return result;
}

function IncomeCalculatorTab() {
 const [investment, setInvestment] = useState(50000);
 const [divYield, setDivYield] = useState(3.5);
 const [divGrowth, setDivGrowth] = useState(6);
 const [years, setYears] = useState(20);
 const [drip, setDrip] = useState(true);

 const data = useMemo(() => computeIncome(investment, divYield, divGrowth, years, drip), [investment, divYield, divGrowth, years, drip]);

 const finalYear = data[data.length - 1];
 const year0 = data[0];
 const totalIncome = finalYear.cumulativeIncome;
 const finalPortfolio = finalYear.portfolioValue;
 const finalIncome = finalYear.annualIncome;

 // Milestones
 const milestone1k = data.find((d) => d.annualIncome >= 12000);
 const milestone5k = data.find((d) => d.annualIncome >= 60000);

 // SVG chart — portfolio value + income growth
 const W = 600, H = 220, padL = 56, padR = 20, padT = 20, padB = 32;

 const maxPort = Math.max(...data.map((d) => d.portfolioValue));
 const maxInc = Math.max(...data.map((d) => d.annualIncome));
 const maxVal = Math.max(maxPort, 1);

 const toX = (yr: number) => padL + (yr / years) * (W - padL - padR);
 const toYPort = (v: number) => padT + ((maxVal - v) / maxVal) * (H - padT - padB);
 const toYInc = (v: number) => padT + ((maxInc - v) / Math.max(maxInc, 1)) * (H - padT - padB);

 const portPoints = data.map((d) => `${toX(d.year)},${toYPort(d.portfolioValue)}`).join(" ");
 const incPoints = data.map((d) => `${toX(d.year)},${toYInc(d.annualIncome)}`).join(" ");

 // Area path for portfolio
 const portArea = `M ${toX(0)},${toYPort(0)} L ${portPoints.split(" ").join(" L ")} L ${toX(years)},${H - padB} L ${toX(0)},${H - padB} Z`;
 const incArea = `M ${toX(0)},${toYInc(0)} L ${incPoints.split(" ").join(" L ")} L ${toX(years)},${H - padB} L ${toX(0)},${H - padB} Z`;

 // Y ticks for portfolio axis
 const portStep = maxVal / 4;
 const portTicks = [0, 1, 2, 3, 4].map((i) => portStep * i);

 return (
 <div className="space-y-4">
 {/* Inputs */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {/* Investment */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Investment Amount</label>
 <div className="flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-muted-foreground" />
 <input
 type="number"
 value={investment}
 onChange={(e) => setInvestment(Math.max(1000, Number(e.target.value)))}
 className="flex-1 bg-muted/30 border border-border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
 />
 </div>
 <Slider value={[investment]} min={5000} max={500000} step={5000} onValueChange={(v) => setInvestment(v[0])} />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>$5K</span><span>$500K</span>
 </div>
 </div>

 {/* Dividend Yield */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Dividend Yield (%)</label>
 <div className="bg-muted/30 border border-border rounded px-3 py-1.5 text-sm font-mono font-medium text-green-400">
 {fmt(divYield, 1)}%
 </div>
 <Slider value={[divYield]} min={0.5} max={10} step={0.1} onValueChange={(v) => setDivYield(v[0])} />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>0.5%</span><span>10%</span>
 </div>
 </div>

 {/* Dividend Growth Rate */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Dividend Growth Rate (%/yr)</label>
 <div className="bg-muted/30 border border-border rounded px-3 py-1.5 text-sm font-mono font-medium text-primary">
 {fmt(divGrowth, 1)}%
 </div>
 <Slider value={[divGrowth]} min={0} max={15} step={0.5} onValueChange={(v) => setDivGrowth(v[0])} />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>0%</span><span>15%</span>
 </div>
 </div>

 {/* Years */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Years to Hold</label>
 <div className="bg-muted/30 border border-border rounded px-3 py-1.5 text-sm font-mono font-medium">
 {years} years
 </div>
 <Slider value={[years]} min={1} max={40} step={1} onValueChange={(v) => setYears(v[0])} />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>1yr</span><span>40yrs</span>
 </div>
 </div>

 {/* DRIP toggle */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Reinvest Dividends (DRIP)</label>
 <div className="flex items-center gap-3 bg-muted/30 border border-border rounded px-3 py-2">
 <Switch checked={drip} onCheckedChange={setDrip} />
 <span className={cn("text-sm font-medium", drip ? "text-green-400" : "text-muted-foreground")}>
 {drip ? "DRIP On" : "DRIP Off"}
 </span>
 </div>
 <p className="text-xs text-muted-foreground">Reinvest dividends automatically to compound growth</p>
 </div>
 </div>

 {/* Output chips */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label: "Annual Income (Now)", value: fmtK(year0.annualIncome), color: "text-green-400", sub: `${fmt(year0.annualIncome / 12, 0)}/mo` },
 { label: `Annual Income (Yr ${years})`, value: fmtK(finalIncome), color: "text-primary", sub: `${fmtK(finalIncome / 12)}/mo` },
 { label: "Total Income Collected", value: fmtK(totalIncome), color: "text-amber-400", sub: `over ${years} years` },
 { label: "Final Portfolio Value", value: fmtK(finalPortfolio), color: "text-primary", sub: drip ? "with DRIP" : "no DRIP" },
 ].map((chip) => (
 <div key={chip.label} className="bg-muted/30 border border-border rounded-lg p-3">
 <p className="text-xs text-muted-foreground">{chip.label}</p>
 <p className={cn("text-lg font-semibold mt-0.5", chip.color)}>{chip.value}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{chip.sub}</p>
 </div>
 ))}
 </div>

 {/* SVG Chart */}
 <div className="bg-muted/20 border border-border rounded-lg p-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-sm font-medium">Portfolio Value vs Annual Income</h3>
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <span className="inline-flex items-center gap-1.5">
 <span className="w-3 h-0.5 bg-primary inline-block" /> Portfolio Value
 </span>
 <span className="inline-flex items-center gap-1.5">
 <span className="w-3 h-0.5 bg-green-400 inline-block" /> Annual Income
 </span>
 </div>
 </div>
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
 {/* Grid lines */}
 {portTicks.map((v, i) => (
 <line key={i} x1={padL} y1={toYPort(v)} x2={W - padR} y2={toYPort(v)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
 ))}
 {/* Y axis labels */}
 {portTicks.map((v, i) => (
 <text key={i} x={padL - 6} y={toYPort(v) + 4} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="end">
 {v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v.toFixed(0)}`}
 </text>
 ))}
 {/* X axis labels */}
 {[0, Math.floor(years / 4), Math.floor(years / 2), Math.floor((3 * years) / 4), years].map((yr) => (
 <text key={yr} x={toX(yr)} y={H - padB + 14} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="middle">
 Yr {yr}
 </text>
 ))}
 {/* Portfolio area */}
 <path d={portArea} fill="rgb(96,165,250)" fillOpacity={0.12} />
 <polyline points={portPoints} fill="none" stroke="rgb(96,165,250)" strokeWidth={2} />
 {/* Income area */}
 <path d={incArea} fill="rgb(74,222,128)" fillOpacity={0.15} />
 <polyline points={incPoints} fill="none" stroke="rgb(74,222,128)" strokeWidth={2} />
 {/* Milestone lines */}
 {milestone1k && (
 <>
 <line x1={toX(milestone1k.year)} y1={padT} x2={toX(milestone1k.year)} y2={H - padB} stroke="rgb(251,191,36)" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.7} />
 <text x={toX(milestone1k.year) + 3} y={padT + 14} fontSize={8} fill="rgb(251,191,36)" fillOpacity={0.9}>$1K/mo</text>
 </>
 )}
 {milestone5k && (
 <>
 <line x1={toX(milestone5k.year)} y1={padT} x2={toX(milestone5k.year)} y2={H - padB} stroke="rgb(196,181,253)" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.7} />
 <text x={toX(milestone5k.year) + 3} y={padT + 26} fontSize={8} fill="rgb(196,181,253)" fillOpacity={0.9}>$5K/mo</text>
 </>
 )}
 </svg>
 </div>

 {/* Milestones */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className={cn("rounded-lg border p-3", milestone1k ? "bg-amber-500/5 border-amber-500/30" : "bg-muted/20 border-border")}>
 <div className="flex items-center gap-2 mb-1">
 <Star className={cn("w-4 h-4", milestone1k ? "text-amber-400" : "text-muted-foreground")} />
 <span className="text-sm font-medium">$1,000/month Passive Income</span>
 </div>
 {milestone1k ? (
 <p className="text-sm text-amber-400">Reached in Year {milestone1k.year} — portfolio {fmtK(milestone1k.portfolioValue)}</p>
 ) : (
 <p className="text-sm text-muted-foreground">Not reached within {years} years — increase investment or yield</p>
 )}
 </div>
 <div className={cn("rounded-lg border p-3", milestone5k ? "bg-primary/5 border-border" : "bg-muted/20 border-border")}>
 <div className="flex items-center gap-2 mb-1">
 <Crown className={cn("w-4 h-4", milestone5k ? "text-primary" : "text-muted-foreground")} />
 <span className="text-sm font-medium">$5,000/month Passive Income</span>
 </div>
 {milestone5k ? (
 <p className="text-sm text-primary">Reached in Year {milestone5k.year} — portfolio {fmtK(milestone5k.portfolioValue)}</p>
 ) : (
 <p className="text-sm text-muted-foreground">Not reached within {years} years — increase investment or years</p>
 )}
 </div>
 </div>
 </div>
 );
}

// ── Tab 3: Ex-Dividend Calendar ───────────────────────────────────────────────

function ExDividendCalendarTab() {
 const rows = useMemo(() => buildStockRows(), []);
 const today = new Date("2026-03-27");
 const todayStr = "2026-03-27";

 // Upcoming ex-div dates (next 60 days)
 const upcoming = rows
 .map((r) => ({ ...r, date: new Date(r.exDivDate) }))
 .filter((r) => r.date >= today)
 .sort((a, b) => a.date.getTime() - b.date.getTime())
 .slice(0, 8);

 // Build calendar for current month (March 2026) + next month
 const months = [
 { year: 2026, month: 3, name: "March 2026" },
 { year: 2026, month: 4, name: "April 2026" },
 ];

 function getDaysInMonth(year: number, month: number) {
 return new Date(year, month, 0).getDate();
 }

 function getFirstDayOfWeek(year: number, month: number) {
 return new Date(year, month - 1, 1).getDay();
 }

 function getExDivOnDay(year: number, month: number, day: number): DivStockRow[] {
 const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
 return rows.filter((r) => r.exDivDate === dateStr);
 }

 function getPayOnDay(year: number, month: number, day: number): DivStockRow[] {
 const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
 return rows.filter((r) => r.paymentDate === dateStr);
 }

 // T+1 settlement: must own by (ex-div date - 1 business day)
 function mustOwnBefore(exDivDate: string): string {
 const d = new Date(exDivDate);
 d.setDate(d.getDate() - 1);
 // skip weekends
 if (d.getDay() === 0) d.setDate(d.getDate() - 2);
 if (d.getDay() === 6) d.setDate(d.getDate() - 1);
 return d.toISOString().split("T")[0];
 }

 return (
 <div className="space-y-4">
 {/* Upcoming strip */}
 <div className="bg-muted/20 border border-border rounded-lg p-4">
 <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
 <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
 Upcoming Ex-Dividend Dates (Next 60 Days)
 </h3>
 <div className="space-y-2">
 {upcoming.map((r) => {
 const mob = mustOwnBefore(r.exDivDate);
 const daysAway = Math.round((r.date.getTime() - today.getTime()) / 86400000);
 return (
 <div key={r.ticker} className="flex items-center gap-3 text-sm">
 <span className="font-mono font-medium w-12 text-foreground">{r.ticker}</span>
 <span className={cn(
 "px-2 py-0.5 rounded text-xs text-muted-foreground font-medium border",
 SECTOR_COLORS[r.sector]?.bg,
 SECTOR_COLORS[r.sector]?.text,
 SECTOR_COLORS[r.sector]?.border,
 )}>
 {r.exDivDate}
 </span>
 <span className="text-xs text-muted-foreground">
 {daysAway === 0 ? "Today!" : `in ${daysAway}d`}
 </span>
 <span className="text-xs text-muted-foreground">Must own by <span className="text-amber-400">{mob}</span></span>
 <span className="text-xs text-muted-foreground ml-auto">Pay: {r.paymentDate}</span>
 <span className="text-xs text-green-400 font-mono">${fmt(r.baseDivPerShare / 4, 2)}/sh</span>
 </div>
 );
 })}
 {upcoming.length === 0 && (
 <p className="text-sm text-muted-foreground">No upcoming ex-dividend dates in the next 60 days.</p>
 )}
 </div>
 </div>

 {/* Calendar grids */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {months.map(({ year, month, name }) => {
 const daysInMonth = getDaysInMonth(year, month);
 const firstDay = getFirstDayOfWeek(year, month);
 const cells: (number | null)[] = [];
 for (let i = 0; i < firstDay; i++) cells.push(null);
 for (let d = 1; d <= daysInMonth; d++) cells.push(d);

 return (
 <div key={name} className="bg-muted/20 border border-border rounded-lg p-4">
 <h4 className="text-sm font-medium mb-3">{name}</h4>
 <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-muted-foreground mb-1">
 {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
 <div key={d} className="text-muted-foreground py-1 font-medium">{d}</div>
 ))}
 </div>
 <div className="grid grid-cols-7 gap-0.5">
 {cells.map((day, i) => {
 if (!day) return <div key={i} />;
 const exDivStocks = getExDivOnDay(year, month, day);
 const payStocks = getPayOnDay(year, month, day);
 const isToday = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` === todayStr;
 return (
 <div
 key={i}
 className={cn(
 "rounded p-0.5 min-h-[44px] text-xs text-muted-foreground",
 isToday ? "bg-primary/20 border border-primary/40" : "hover:bg-muted/30",
 (exDivStocks.length > 0 || payStocks.length > 0) ? "bg-muted/20" : ""
 )}
 >
 <div className={cn("font-medium mb-0.5", isToday ? "text-primary" : "text-muted-foreground")}>{day}</div>
 {exDivStocks.map((s) => (
 <div key={s.ticker} className="bg-amber-500/20 text-amber-400 rounded px-0.5 truncate mb-0.5" title={`${s.ticker} ex-div`}>
 {s.ticker}
 </div>
 ))}
 {payStocks.map((s) => (
 <div key={s.ticker} className="bg-green-500/15 text-green-400 rounded px-0.5 truncate mb-0.5" title={`${s.ticker} pays`}>
 {s.ticker}$
 </div>
 ))}
 </div>
 );
 })}
 </div>
 <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
 <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500/40 inline-block" /> Ex-Div</span>
 <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500/30 inline-block" /> Pay Date</span>
 </div>
 </div>
 );
 })}
 </div>

 {/* T+1 note */}
 <div className="bg-primary/5 border border-border rounded-lg p-3 flex gap-2">
 <Info className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
 <p className="text-xs text-muted-foreground">
 <strong className="text-primary">T+1 Settlement:</strong> To receive the dividend, you must own shares by market close on the business day before the ex-dividend date. Buying on the ex-dividend date itself means you will NOT receive the upcoming dividend payment.
 </p>
 </div>
 </div>
 );
}

// ── Tab 4: Dividend Growth Analysis ──────────────────────────────────────────

function buildDivHistory(def: DivStockDef): { year: number; div: number; payout: number; fcfCoverage: number }[] {
 // Interpolate from baseDiv2015 to baseDivPerShare over 2015–2025
 const years = 11;
 const result = [];
 const rng = seededRandom(def.ticker.charCodeAt(0) * 31 + def.ticker.charCodeAt(1));
 let div = def.baseDiv2015;
 for (let i = 0; i < years; i++) {
 const yr = 2015 + i;
 const growthVariance = (rng() - 0.3) * 2; // slight bias upward
 const targetGrowth = def.growthRate / 100 + growthVariance / 100;
 div = div * (1 + Math.max(0, targetGrowth));
 const payout = Math.min(95, def.payoutRatio + (rng() - 0.5) * 10);
 const fcf = def.fcfPerShare * (1 + (rng() - 0.4) * 0.3);
 const fcfCoverage = fcf > 0 && div > 0 ? fcf / div : 0;
 result.push({ year: yr, div, payout, fcfCoverage });
 }
 return result;
}

function computeDivSafetyScore(def: DivStockDef): { score: number; details: string[] } {
 const details: string[] = [];
 let score = 0;

 // Payout ratio (max 4 pts)
 if (def.payoutRatio < 40) { score += 4; details.push("Very low payout ratio (<40%) — highly sustainable"); }
 else if (def.payoutRatio < 60) { score += 3; details.push("Healthy payout ratio (40–60%)"); }
 else if (def.payoutRatio < 75) { score += 2; details.push("Moderate payout ratio (60–75%) — watch for increases"); }
 else if (def.payoutRatio < 90) { score += 1; details.push("High payout ratio (75–90%) — limited room for growth"); }
 else { score += 0; details.push("Very high payout ratio (>90%) — dividend at risk"); }

 // FCF coverage (max 3 pts)
 const fcfCoverage = def.fcfPerShare / (def.baseDivPerShare || 1);
 if (fcfCoverage > 2.5) { score += 3; details.push(`Strong FCF coverage (${fmt(fcfCoverage, 1)}x) — dividends well covered by free cash flow`); }
 else if (fcfCoverage > 1.5) { score += 2; details.push(`Good FCF coverage (${fmt(fcfCoverage, 1)}x)`); }
 else if (fcfCoverage > 1.0) { score += 1; details.push(`Adequate FCF coverage (${fmt(fcfCoverage, 1)}x) — narrow margin`); }
 else { score += 0; details.push(`Weak FCF coverage (${fmt(fcfCoverage, 1)}x) — dividends may exceed free cash flow`); }

 // Debt level (max 2 pts)
 if (def.debtToEquity < 0.5) { score += 2; details.push("Low debt (D/E < 0.5x) — strong balance sheet"); }
 else if (def.debtToEquity < 1.2) { score += 1; details.push("Moderate debt (D/E 0.5–1.2x)"); }
 else { score += 0; details.push(`High debt (D/E ${fmt(def.debtToEquity, 1)}x) — leverage risk to dividend`); }

 // Growth streak (max 1 pt)
 if (def.consecutiveYears >= 25) { score += 1; details.push(`${def.consecutiveYears} consecutive years of growth — proven track record`); }

 return { score, details };
}

function DividendGrowthTab() {
 const [selectedTicker, setSelectedTicker] = useState<string>("JNJ");

 const def = DIV_STOCKS.find((d) => d.ticker === selectedTicker) ?? DIV_STOCKS[0];
 const history = useMemo(() => buildDivHistory(def), [def]);
 const { score, details } = useMemo(() => computeDivSafetyScore(def), [def]);

 // SVG bar chart for dividend history
 const W = 560, H = 180, padL = 52, padR = 16, padT = 20, padB = 36;
 const maxDiv = Math.max(...history.map((h) => h.div)) * 1.15;
 const barW = Math.floor((W - padL - padR) / history.length) - 3;

 const toX = (i: number) => padL + i * ((W - padL - padR) / history.length) + 2;
 const toY = (v: number) => padT + ((maxDiv - v) / maxDiv) * (H - padT - padB);

 // Payout ratio SVG
 const pH = 120, pPadL = 44, pPadR = 16, pPadT = 12, pPadB = 28;
 const payoutPoints = history.map((h, i) => `${toX(i) + barW / 2},${pPadT + ((100 - h.payout) / 100) * (pH - pPadT - pPadB)}`).join(" ");

 // FCF coverage SVG
 const maxFcf = Math.max(...history.map((h) => h.fcfCoverage)) * 1.2;
 const fcfPoints = history.map((h, i) => `${toX(i) + barW / 2},${pPadT + ((maxFcf - h.fcfCoverage) / Math.max(maxFcf, 1)) * (pH - pPadT - pPadB)}`).join(" ");

 const scoreColor =
 score >= 8 ? "text-green-400" :
 score >= 6 ? "text-muted-foreground" :
 score >= 4 ? "text-amber-400" :
 "text-red-400";

 const scoreBg =
 score >= 8 ? "bg-green-500/10 border-green-500/30" :
 score >= 6 ? "bg-cyan-500/10 border-cyan-500/30" :
 score >= 4 ? "bg-amber-500/10 border-amber-500/30" :
 "bg-red-500/5 border-red-500/30";

 return (
 <div className="space-y-5">
 {/* Ticker selector */}
 <div className="flex flex-wrap gap-2">
 {DIV_STOCKS.map((d) => (
 <button
 key={d.ticker}
 onClick={() => setSelectedTicker(d.ticker)}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-medium border transition-all",
 selectedTicker === d.ticker
 ? "bg-primary/20 border-primary/50 text-primary"
 : "border-border text-muted-foreground hover:border-border hover:text-foreground"
 )}
 >
 {d.ticker}
 </button>
 ))}
 </div>

 {/* Header */}
 <div className="flex items-start justify-between">
 <div>
 <h3 className="text-base font-medium">{def.name} ({def.ticker})</h3>
 <p className="text-sm text-muted-foreground">{def.sector} · {def.consecutiveYears} consecutive years of dividend growth</p>
 </div>
 {def.consecutiveYears >= 50 ? (
 <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium">
 <Crown className="w-4 h-4" /> Dividend King
 </span>
 ) : def.consecutiveYears >= 25 ? (
 <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 border border-border text-primary text-sm font-medium">
 <Award className="w-4 h-4" /> Dividend Aristocrat
 </span>
 ) : null}
 </div>

 {/* 10-year dividend history bar chart */}
 <div className="bg-muted/20 border border-border rounded-lg p-4">
 <h4 className="text-sm font-medium mb-3">10-Year Dividend History (Annual $/share)</h4>
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
 const v = maxDiv * frac;
 const y = toY(v);
 return (
 <g key={i}>
 <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
 <text x={padL - 5} y={y + 4} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="end">
 ${fmt(v, 2)}
 </text>
 </g>
 );
 })}
 {/* Bars */}
 {history.map((h, i) => {
 const x = toX(i);
 const y = toY(h.div);
 const barH = H - padB - y;
 return (
 <g key={h.year}>
 <rect x={x} y={y} width={barW} height={Math.max(barH, 0)} rx={2}
 fill="rgb(96,165,250)" fillOpacity={0.7}
 />
 <text x={x + barW / 2} y={H - padB + 14} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="middle">
 {h.year}
 </text>
 <text x={x + barW / 2} y={y - 3} fontSize={8} fill="rgb(96,165,250)" textAnchor="middle" fillOpacity={0.9}>
 ${fmt(h.div, 2)}
 </text>
 </g>
 );
 })}
 </svg>
 </div>

 {/* Payout ratio + FCF coverage */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="bg-muted/20 border border-border rounded-lg p-4">
 <h4 className="text-sm font-medium mb-3">Payout Ratio Trend (%)</h4>
 <svg viewBox={`0 0 ${W} ${pH}`} className="w-full" style={{ height: pH }}>
 {[0, 25, 50, 75, 100].map((v) => {
 const y = pPadT + ((100 - v) / 100) * (pH - pPadT - pPadB);
 return (
 <g key={v}>
 <line x1={pPadL} y1={y} x2={W - pPadR} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
 <text x={pPadL - 4} y={y + 3} fontSize={8} fill="currentColor" fillOpacity={0.4} textAnchor="end">{v}%</text>
 </g>
 );
 })}
 {/* Warning zone 75%+ */}
 <rect x={pPadL} y={pPadT + ((100 - 100) / 100) * (pH - pPadT - pPadB)} width={W - pPadL - pPadR} height={(25 / 100) * (pH - pPadT - pPadB)}
 fill="rgb(239,68,68)" fillOpacity={0.05}
 />
 <polyline points={payoutPoints} fill="none" stroke="rgb(251,191,36)" strokeWidth={2} strokeLinejoin="round" />
 {history.map((h, i) => (
 <circle key={i} cx={toX(i) + barW / 2} cy={pPadT + ((100 - h.payout) / 100) * (pH - pPadT - pPadB)} r={3}
 fill={h.payout > 75 ? "rgb(239,68,68)" : "rgb(251,191,36)"} />
 ))}
 {history.map((h, i) => (
 <text key={i} x={toX(i) + barW / 2} y={pH - pPadB + 12} fontSize={8} fill="currentColor" fillOpacity={0.35} textAnchor="middle">
 {h.year}
 </text>
 ))}
 </svg>
 </div>

 <div className="bg-muted/20 border border-border rounded-lg p-4">
 <h4 className="text-sm font-medium mb-3">FCF Coverage Ratio (FCF / Dividend)</h4>
 <svg viewBox={`0 0 ${W} ${pH}`} className="w-full" style={{ height: pH }}>
 {[0, 1, 2, 3, 4].filter((v) => v <= maxFcf * 1.1).map((v) => {
 const y = pPadT + ((maxFcf - v) / Math.max(maxFcf, 1)) * (pH - pPadT - pPadB);
 return (
 <g key={v}>
 <line x1={pPadL} y1={y} x2={W - pPadR} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
 <text x={pPadL - 4} y={y + 3} fontSize={8} fill="currentColor" fillOpacity={0.4} textAnchor="end">{v}x</text>
 </g>
 );
 })}
 {/* 1x safety line */}
 {(() => {
 const safeY = pPadT + ((maxFcf - 1) / Math.max(maxFcf, 1)) * (pH - pPadT - pPadB);
 return <line x1={pPadL} y1={safeY} x2={W - pPadR} y2={safeY} stroke="rgb(239,68,68)" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.5} />;
 })()}
 <polyline points={fcfPoints} fill="none" stroke="rgb(52,211,153)" strokeWidth={2} strokeLinejoin="round" />
 {history.map((h, i) => (
 <circle key={i} cx={toX(i) + barW / 2} cy={pPadT + ((maxFcf - h.fcfCoverage) / Math.max(maxFcf, 1)) * (pH - pPadT - pPadB)} r={3}
 fill={h.fcfCoverage < 1 ? "rgb(239,68,68)" : "rgb(52,211,153)"} />
 ))}
 {history.map((h, i) => (
 <text key={i} x={toX(i) + barW / 2} y={pH - pPadB + 12} fontSize={8} fill="currentColor" fillOpacity={0.35} textAnchor="middle">
 {h.year}
 </text>
 ))}
 </svg>
 </div>
 </div>

 {/* Dividend Safety Score */}
 <div className={cn("rounded-lg border p-4", scoreBg)}>
 <div className="flex items-start justify-between mb-3">
 <div>
 <h4 className="text-sm font-medium">Dividend Safety Score</h4>
 <p className="text-xs text-muted-foreground mt-0.5">Based on payout ratio, FCF coverage, debt levels, and growth track record</p>
 </div>
 <div className="text-right">
 <div className={cn("text-2xl font-bold", scoreColor)}>{score}<span className="text-sm text-muted-foreground">/10</span></div>
 <div className={cn("text-xs text-muted-foreground font-medium", scoreColor)}>
 {score >= 8 ? "Excellent" : score >= 6 ? "Good" : score >= 4 ? "Fair" : "Caution"}
 </div>
 </div>
 </div>
 {/* Score bar */}
 <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
 <div
 className={cn("h-full rounded-full transition-all", score >= 8 ? "bg-green-500" : score >= 6 ? "bg-cyan-500" : score >= 4 ? "bg-amber-500" : "bg-red-500")}
 style={{ width: `${(score / 10) * 100}%` }}
 />
 </div>
 {/* Details */}
 <div className="space-y-1.5">
 {details.map((d, i) => {
 const isPositive = d.includes("Low") || d.includes("Strong") || d.includes("Good") || d.includes("Very low") || d.includes("Healthy") || d.includes("proven");
 const isNegative = d.includes("risk") || d.includes("Risk") || d.includes("High") || d.includes("Weak") || d.includes("exceed");
 return (
 <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
 {isNegative ? (
 <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
 ) : isPositive ? (
 <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
 ) : (
 <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
 )}
 <span className="text-muted-foreground">{d}</span>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DividendsPage() {
 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Dividends</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">YIELD · GROWTH · PAYOUT · REINVESTMENT</p>

 <div className="border-t border-border my-6" />

 {/* Tabs */}
 <Tabs defaultValue="stocks">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 <TabsTrigger value="stocks" className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <TrendingUp className="w-3.5 h-3.5" />
 Dividend Stocks
 </TabsTrigger>
 <TabsTrigger value="calculator" className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <DollarSign className="w-3.5 h-3.5" />
 Income Calculator
 </TabsTrigger>
 <TabsTrigger value="calendar" className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Calendar className="w-3.5 h-3.5" />
 Ex-Div Calendar
 </TabsTrigger>
 <TabsTrigger value="analysis" className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <BarChart3 className="w-3.5 h-3.5" />
 Growth Analysis
 </TabsTrigger>
 <TabsTrigger value="tracker" className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Activity className="w-3.5 h-3.5" />
 Income Tracker
 </TabsTrigger>
 </TabsList>

 <TabsContent value="stocks" className="mt-4">
 <DividendStocksTab />
 </TabsContent>
 <TabsContent value="calculator" className="mt-4">
 <IncomeCalculatorTab />
 </TabsContent>
 <TabsContent value="calendar" className="mt-4">
 <ExDividendCalendarTab />
 </TabsContent>
 <TabsContent value="analysis" className="mt-4">
 <DividendGrowthTab />
 </TabsContent>
 <TabsContent value="tracker" className="mt-4">
 <DividendIncomeTracker />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
