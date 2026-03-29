"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 TrendingUp,
 TrendingDown,
 AlertTriangle,
 CheckCircle2,
 ChevronUp,
 ChevronDown,
 BarChart3,
 Activity,
 Search,
 Info,
 ShieldAlert,
 DollarSign,
 Layers,
 Filter,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 732005;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
function resetSeed() {
 s = 732005;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScreenerStock {
 ticker: string;
 name: string;
 sector: string;
 accrualRatio: number; // % of assets — lower is better
 revenueQuality: number; // 0–100
 expenseRecognition: number; // 0–100
 fcfNiDivergence: number; // FCF/NI ratio — >1 is good
 overallScore: number; // 0–100
 marketCap: number; // B
 netIncome: number; // M
 fcf: number; // M
 flag: "high" | "medium" | "low";
}

interface PiotroskiCompany {
 ticker: string;
 name: string;
 // Profitability (4 factors)
 roa: number; // 1 if positive
 ocf: number; // 1 if positive
 deltaRoa: number; // 1 if improving
 accrual: number; // 1 if OCF > ROA
 // Leverage (3 factors)
 deltaLeverage: number;// 1 if leverage decreased
 deltaLiquidity: number;// 1 if current ratio improved
 noShares: number; // 1 if no dilution
 // Efficiency (2 factors)
 deltaMargin: number; // 1 if gross margin improved
 deltaTurnover: number;// 1 if asset turnover improved
 fscore: number;
 // For radar
 rawaRoa: number;
 rawOcf: number;
 rawLev: number;
 rawLiq: number;
 rawMargin: number;
}

interface BeneishVar {
 ticker: string;
 name: string;
 dsri: number; // Days Sales in Receivables Index
 gmi: number; // Gross Margin Index
 aqi: number; // Asset Quality Index
 sgi: number; // Sales Growth Index
 depi: number; // Depreciation Index
 sgai: number; // SG&A Index
 lvgi: number; // Leverage Index
 tata: number; // Total Accruals to Total Assets
 mScore: number;
 risk: "high" | "medium" | "low";
}

interface CashFlowStock {
 ticker: string;
 name: string;
 ocfNiRatio: number;
 capexIntensity: number; // capex / revenue
 maintenanceCapex: number; // %
 growthCapex: number; // %
 fcfYield: number; // %
 earningsYield: number; // %
 divergence: number; // earnings yield - fcf yield
 alert: boolean;
}

type SortKey = keyof Pick<ScreenerStock, "accrualRatio" | "revenueQuality" | "expenseRecognition" | "fcfNiDivergence" | "overallScore" | "marketCap">;
type SortDir = "asc" | "desc";

// ── Data Generation ───────────────────────────────────────────────────────────
function generateScreenerData(): ScreenerStock[] {
 resetSeed();
 const tickers = [
 { t: "MSFT", n: "Microsoft Corp", s: "Technology" },
 { t: "AAPL", n: "Apple Inc", s: "Technology" },
 { t: "AMZN", n: "Amazon.com Inc", s: "Consumer Discretionary" },
 { t: "GOOGL", n: "Alphabet Inc", s: "Technology" },
 { t: "NVDA", n: "NVIDIA Corp", s: "Technology" },
 { t: "META", n: "Meta Platforms", s: "Technology" },
 { t: "BRK.B", n: "Berkshire Hathaway", s: "Financials" },
 { t: "JPM", n: "JPMorgan Chase", s: "Financials" },
 { t: "GE", n: "GE Aerospace", s: "Industrials" },
 { t: "PFE", n: "Pfizer Inc", s: "Healthcare" },
 { t: "NKE", n: "Nike Inc", s: "Consumer Discretionary" },
 { t: "INTC", n: "Intel Corp", s: "Technology" },
 { t: "BA", n: "Boeing Co", s: "Industrials" },
 { t: "WMT", n: "Walmart Inc", s: "Consumer Staples" },
 { t: "XOM", n: "ExxonMobil Corp", s: "Energy" },
 { t: "CVX", n: "Chevron Corp", s: "Energy" },
 { t: "JNJ", n: "Johnson & Johnson", s: "Healthcare" },
 { t: "UNH", n: "UnitedHealth Group", s: "Healthcare" },
 { t: "HD", n: "Home Depot Inc", s: "Consumer Discretionary" },
 { t: "V", n: "Visa Inc", s: "Financials" },
 ];

 return tickers.map(({ t, n, s }) => {
 const accrualRatio = (rand() * 12 - 4);
 const revenueQuality = Math.round(40 + rand() * 55);
 const expenseRecognition = Math.round(35 + rand() * 60);
 const fcfNiDivergence = 0.3 + rand() * 2.2;
 const overallScore = Math.round(
 (revenueQuality * 0.3 +
 expenseRecognition * 0.25 +
 Math.max(0, Math.min(100, fcfNiDivergence * 40)) * 0.3 +
 Math.max(0, Math.min(100, (4 - accrualRatio) * 8)) * 0.15)
 );
 const flag: "high" | "medium" | "low" = overallScore >= 70 ? "high" : overallScore >= 45 ? "medium" : "low";
 const marketCap = 50 + rand() * 3500;
 const netIncome = 500 + rand() * 30000;
 const fcf = netIncome * fcfNiDivergence * (0.8 + rand() * 0.4);
 return { ticker: t, name: n, sector: s, accrualRatio, revenueQuality, expenseRecognition, fcfNiDivergence, overallScore, marketCap, netIncome, fcf, flag };
 });
}

function generatePiotroskiData(): PiotroskiCompany[] {
 resetSeed();
 const companies = [
 { t: "MSFT", n: "Microsoft" },
 { t: "BA", n: "Boeing" },
 { t: "INTC", n: "Intel" },
 { t: "PFE", n: "Pfizer" },
 { t: "AMZN", n: "Amazon" },
 ];

 return companies.map(({ t, n }) => {
 const roa = rand() > 0.3 ? 1 : 0;
 const ocf = rand() > 0.2 ? 1 : 0;
 const deltaRoa = rand() > 0.45 ? 1 : 0;
 const accrual = rand() > 0.35 ? 1 : 0;
 const deltaLeverage = rand() > 0.4 ? 1 : 0;
 const deltaLiquidity = rand() > 0.4 ? 1 : 0;
 const noShares = rand() > 0.5 ? 1 : 0;
 const deltaMargin = rand() > 0.45 ? 1 : 0;
 const deltaTurnover = rand() > 0.45 ? 1 : 0;
 const fscore = roa + ocf + deltaRoa + accrual + deltaLeverage + deltaLiquidity + noShares + deltaMargin + deltaTurnover;
 // Raw values for radar (0–1 normalized)
 const rawaRoa = 0.2 + rand() * 0.6;
 const rawOcf = 0.3 + rand() * 0.6;
 const rawLev = 0.2 + rand() * 0.7;
 const rawLiq = 0.2 + rand() * 0.7;
 const rawMargin = 0.2 + rand() * 0.7;
 return { ticker: t, name: n, roa, ocf, deltaRoa, accrual, deltaLeverage, deltaLiquidity, noShares, deltaMargin, deltaTurnover, fscore, rawaRoa, rawOcf, rawLev, rawLiq, rawMargin };
 });
}

function generateBeneishData(): BeneishVar[] {
 resetSeed();
 const companies = [
 { t: "ENRN", n: "Enron Corp (2001)", preset: true },
 { t: "WCOM", n: "WorldCom Inc", preset: false },
 { t: "LHMK", n: "LightmarkCo", preset: false },
 { t: "PRXA", n: "ProxaCorp", preset: false },
 { t: "STLQ", n: "SteelQuad Inc", preset: false },
 { t: "NXTF", n: "NextFlow Corp", preset: false },
 { t: "CRVT", n: "Corvette Finl", preset: false },
 ];

 return companies.map(({ t, n, preset }, i) => {
 let dsri: number, gmi: number, aqi: number, sgi: number, depi: number, sgai: number, lvgi: number, tata: number;
 if (preset && i === 0) {
 // Enron-like values — highly manipulated
 dsri = 1.92; gmi = 1.45; aqi = 1.25; sgi = 1.60;
 depi = 0.94; sgai = 0.71; lvgi = 1.43; tata = 0.17;
 } else {
 dsri = 0.6 + rand() * 1.2;
 gmi = 0.7 + rand() * 0.8;
 aqi = 0.8 + rand() * 0.7;
 sgi = 0.9 + rand() * 0.9;
 depi = 0.7 + rand() * 0.6;
 sgai = 0.6 + rand() * 0.7;
 lvgi = 0.7 + rand() * 0.8;
 tata = -0.05 + rand() * 0.2;
 }
 const mScore = -4.84 + 0.92 * dsri + 0.528 * gmi + 0.404 * aqi + 0.892 * sgi + 0.115 * depi - 0.172 * sgai + 4.679 * tata - 0.327 * lvgi;
 const risk: "high" | "medium" | "low" = mScore > -1.78 ? "high" : mScore > -2.22 ? "medium" : "low";
 return { ticker: t, name: n, dsri, gmi, aqi, sgi, depi, sgai, lvgi, tata, mScore, risk };
 });
}

function generateCashFlowData(): CashFlowStock[] {
 resetSeed();
 const tickers = [
 { t: "MSFT", n: "Microsoft" },
 { t: "AAPL", n: "Apple" },
 { t: "AMZN", n: "Amazon" },
 { t: "INTC", n: "Intel" },
 { t: "BA", n: "Boeing" },
 { t: "PFE", n: "Pfizer" },
 { t: "GE", n: "GE Aerospace" },
 { t: "NKE", n: "Nike" },
 { t: "WMT", n: "Walmart" },
 { t: "XOM", n: "ExxonMobil" },
 ];

 return tickers.map(({ t, n }) => {
 const ocfNiRatio = 0.4 + rand() * 2.2;
 const capexIntensity = 0.02 + rand() * 0.18;
 const maintenancePct = 30 + rand() * 40;
 const growthCapex = 100 - maintenancePct;
 const earningsYield = 1 + rand() * 6;
 const fcfYield = earningsYield * ocfNiRatio * (0.6 + rand() * 0.8);
 const divergence = earningsYield - fcfYield;
 const alert = Math.abs(divergence) > 2.5;
 return {
 ticker: t,
 name: n,
 ocfNiRatio,
 capexIntensity,
 maintenanceCapex: maintenancePct,
 growthCapex,
 fcfYield,
 earningsYield,
 divergence,
 alert,
 };
 });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
 const color = score >= 70 ? "text-emerald-400 bg-emerald-400/10" : score >= 45 ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10";
 return (
 <span className={cn("inline-flex items-center justify-center rounded px-2 py-0.5 text-xs text-muted-foreground font-semibold tabular-nums", color)}>
 {score}
 </span>
 );
}

function FlagBadge({ flag }: { flag: "high" | "medium" | "low" }) {
 const map = {
 high: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
 medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
 low: "text-red-400 bg-red-400/10 border-red-400/20",
 };
 const labels = { high: "High Quality", medium: "Medium", low: "Low Quality" };
 return (
 <span className={cn("inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs text-muted-foreground font-medium", map[flag])}>
 {flag === "high" ? <CheckCircle2 size={10} /> : flag === "medium" ? <Info size={10} /> : <AlertTriangle size={10} />}
 {labels[flag]}
 </span>
 );
}

function RiskBadge({ risk }: { risk: "high" | "medium" | "low" }) {
 const map = {
 high: "text-red-400 bg-red-400/10 border-red-400/20",
 medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
 low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
 };
 const labels = { high: "High Risk", medium: "Med Risk", low: "Low Risk" };
 return (
 <span className={cn("inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs text-muted-foreground font-medium", map[risk])}>
 {risk === "high" ? <ShieldAlert size={10} /> : risk === "medium" ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
 {labels[risk]}
 </span>
 );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
 const pct = Math.max(0, Math.min(100, (value / max) * 100));
 return (
 <div className="flex items-center gap-2">
 <div className="h-1.5 w-20 rounded-full bg-foreground/5">
 <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
 </div>
 <span className="text-xs tabular-nums text-muted-foreground">{value.toFixed(0)}</span>
 </div>
 );
}

// ── Score Distribution SVG ────────────────────────────────────────────────────
function ScoreDistributionChart({ stocks }: { stocks: ScreenerStock[] }) {
 const buckets = Array.from({ length: 10 }, (_, i) => ({
 label: `${i * 10}–${(i + 1) * 10}`,
 count: stocks.filter(s => s.overallScore >= i * 10 && s.overallScore < (i + 1) * 10).length,
 }));
 const maxCount = Math.max(...buckets.map(b => b.count), 1);
 const W = 400, H = 120, PAD = 30;
 const barW = (W - PAD * 2) / buckets.length - 4;

 return (
 <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full max-w-md">
 {buckets.map((b, i) => {
 const barH = (b.count / maxCount) * H;
 const x = PAD + i * ((W - PAD * 2) / buckets.length);
 const y = H - barH;
 const color = i >= 7 ? "#34d399" : i >= 4 ? "#fbbf24" : "#f87171";
 return (
 <g key={i}>
 <rect x={x} y={y} width={barW} height={barH} fill={color} opacity={0.85} rx={2} />
 {b.count > 0 && (
 <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill="#a1a1aa" fontSize={9}>{b.count}</text>
 )}
 <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="#71717a" fontSize={7}>{b.label}</text>
 </g>
 );
 })}
 <line x1={PAD} y1={H} x2={W - PAD} y2={H} stroke="#3f3f46" strokeWidth={1} />
 </svg>
 );
}

// ── Decile Return Chart ───────────────────────────────────────────────────────
function DecileReturnChart() {
 resetSeed();
 // Low accrual (high quality) decile 1 → best returns; high accrual decile 10 → worst
 const returns = Array.from({ length: 10 }, (_, i) => {
 const base = 18 - i * 2.8;
 return base + (rand() - 0.5) * 4;
 });
 const maxR = Math.max(...returns);
 const minR = Math.min(...returns);
 const range = maxR - minR || 1;
 const W = 420, H = 140, PAD = 40;
 const barW = (W - PAD * 2) / 10 - 5;

 return (
 <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full max-w-lg">
 <text x={W / 2} y={12} textAnchor="middle" fill="#a1a1aa" fontSize={10}>Annual Return by Accrual Decile (%)</text>
 {returns.map((r, i) => {
 const barH = Math.max(2, ((r - minR) / range) * (H - 20));
 const x = PAD + i * ((W - PAD * 2) / 10);
 const y = H - barH;
 const color = i < 3 ? "#34d399" : i < 7 ? "#94a3b8" : "#f87171";
 return (
 <g key={i}>
 <rect x={x} y={y} width={barW} height={barH} fill={color} opacity={0.85} rx={2} />
 <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill="#a1a1aa" fontSize={8}>{r.toFixed(1)}%</text>
 <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="#71717a" fontSize={8}>D{i + 1}</text>
 </g>
 );
 })}
 <line x1={PAD} y1={H} x2={W - PAD} y2={H} stroke="#3f3f46" strokeWidth={1} />
 <text x={4} y={H / 2} textAnchor="middle" fill="#71717a" fontSize={8} transform={`rotate(-90, 10, ${H / 2})`}>Return</text>
 </svg>
 );
}

// ── Piotroski Radar Chart ─────────────────────────────────────────────────────
function RadarChart({ company }: { company: PiotroskiCompany }) {
 const axes = [
 { label: "ROA", value: company.rawaRoa },
 { label: "OCF", value: company.rawOcf },
 { label: "Leverage", value: company.rawLev },
 { label: "Liquidity", value: company.rawLiq },
 { label: "Margin", value: company.rawMargin },
 ];
 const N = axes.length;
 const CX = 80, CY = 75, R = 55;

 const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;

 const points = axes.map((a, i) => ({
 x: CX + Math.cos(angle(i)) * R * a.value,
 y: CY + Math.sin(angle(i)) * R * a.value,
 }));

 const polygon = points.map(p => `${p.x},${p.y}`).join("");

 const gridLevels = [0.25, 0.5, 0.75, 1.0];

 return (
 <svg viewBox="0 0 160 150" className="w-28 h-28">
 {gridLevels.map(lvl => {
 const gp = axes.map((_, i) => {
 const x = CX + Math.cos(angle(i)) * R * lvl;
 const y = CY + Math.sin(angle(i)) * R * lvl;
 return `${x},${y}`;
 }).join("");
 return <polygon key={lvl} points={gp} fill="none" stroke="#3f3f46" strokeWidth={0.8} />;
 })}
 {axes.map((_, i) => (
 <line key={i} x1={CX} y1={CY} x2={CX + Math.cos(angle(i)) * R} y2={CY + Math.sin(angle(i)) * R} stroke="#52525b" strokeWidth={0.8} />
 ))}
 <polygon points={polygon} fill="#6366f1" fillOpacity={0.25} stroke="#6366f1" strokeWidth={1.5} />
 {axes.map((a, i) => {
 const lx = CX + Math.cos(angle(i)) * (R + 14);
 const ly = CY + Math.sin(angle(i)) * (R + 14);
 return (
 <text key={i} x={lx} y={ly + 3} textAnchor="middle" fill="#a1a1aa" fontSize={8}>{a.label}</text>
 );
 })}
 </svg>
 );
}

// ── FCF vs NI Divergence Bar ──────────────────────────────────────────────────
function DivergenceBar({ fcfYield, earningsYield }: { fcfYield: number; earningsYield: number }) {
 const max = Math.max(fcfYield, earningsYield, 0.1);
 const fcfW = (fcfYield / max) * 80;
 const niW = (earningsYield / max) * 80;
 return (
 <div className="flex flex-col gap-0.5">
 <div className="flex items-center gap-1.5">
 <span className="w-6 text-right text-xs text-muted-foreground">FCF</span>
 <div className="h-2 rounded" style={{ width: `${fcfW}px`, background: "#34d399" }} />
 <span className="text-xs tabular-nums text-muted-foreground">{fcfYield.toFixed(1)}%</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="w-6 text-right text-xs text-muted-foreground">EPS</span>
 <div className="h-2 rounded" style={{ width: `${niW}px`, background: "#6366f1" }} />
 <span className="text-xs tabular-nums text-muted-foreground">{earningsYield.toFixed(1)}%</span>
 </div>
 </div>
 );
}

// ── Beneish Variable Bar ──────────────────────────────────────────────────────
function BeneishVarBar({ value, threshold, label }: { value: number; threshold: number; label: string }) {
 const danger = value > threshold;
 const pct = Math.min(100, (value / (threshold * 2)) * 100);
 return (
 <div className="flex items-center gap-2">
 <span className="w-10 text-right text-xs text-muted-foreground">{label}</span>
 <div className="h-1.5 w-32 rounded-full bg-foreground/5">
 <div
 className={cn("h-full rounded-full transition-colors", danger ? "bg-red-400" : "bg-emerald-400")}
 style={{ width: `${pct}%` }}
 />
 </div>
 <span className={cn("text-xs tabular-nums", danger ? "text-red-400" : "text-muted-foreground")}>{value.toFixed(2)}</span>
 {danger && <AlertTriangle size={10} className="text-red-400" />}
 </div>
 );
}

// ── Tab 1: Earnings Quality Screener ─────────────────────────────────────────
function ScreenerTab() {
 const [sortKey, setSortKey] = useState<SortKey>("overallScore");
 const [sortDir, setSortDir] = useState<SortDir>("desc");
 const [search, setSearch] = useState("");
 const [filterFlag, setFilterFlag] = useState<"all" | "high" | "medium" | "low">("all");

 const stocks = useMemo(() => generateScreenerData(), []);

 const sorted = useMemo(() => {
 let list = [...stocks];
 if (search) {
 const q = search.toUpperCase();
 list = list.filter(s => s.ticker.includes(q) || s.name.toUpperCase().includes(q));
 }
 if (filterFlag !== "all") {
 list = list.filter(s => s.flag === filterFlag);
 }
 list.sort((a, b) => {
 const av = a[sortKey] as number;
 const bv = b[sortKey] as number;
 return sortDir === "asc" ? av - bv : bv - av;
 });
 return list;
 }, [stocks, sortKey, sortDir, search, filterFlag]);

 const handleSort = (key: SortKey) => {
 if (key === sortKey) {
 setSortDir(d => (d === "asc" ? "desc" : "asc"));
 } else {
 setSortKey(key);
 setSortDir("desc");
 }
 };

 const SortIcon = ({ col }: { col: SortKey }) =>
 sortKey === col ? (
 sortDir === "desc" ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />
 ) : null;

 return (
 <div className="space-y-4">
 {/* Header row */}
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <h2 className="text-base font-semibold text-foreground">Earnings Quality Screener</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Scores companies across four accounting-quality dimensions. Higher scores indicate more reliable, sustainable earnings.
 </p>
 </div>
 <ScoreDistributionChart stocks={stocks} />
 </div>

 {/* Score key */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 {[
 { label: "Accruals Ratio", desc: "Low % of accruals to assets signals cash-backed earnings", icon: <Activity size={14} /> },
 { label: "Revenue Quality", desc: "Persistence & recurrence of revenue streams", icon: <TrendingUp size={14} /> },
 { label: "Expense Recognition", desc: "Conservative expense timing reduces earnings inflation", icon: <Layers size={14} /> },
 { label: "FCF vs Net Income", desc: "FCF/NI > 1 shows earnings backed by real cash flows", icon: <DollarSign size={14} /> },
 ].map(item => (
 <div key={item.label} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-3">
 <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">{item.icon}<span className="text-xs font-medium">{item.label}</span></div>
 <p className="text-xs text-muted-foreground">{item.desc}</p>
 </div>
 ))}
 </div>

 {/* Controls */}
 <div className="flex flex-wrap gap-2">
 <div className="relative flex-1 min-w-32">
 <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input
 value={search}
 onChange={e => setSearch(e.target.value)}
 placeholder="Search ticker or name…"
 className="w-full rounded border border-border bg-foreground/5 py-1.5 pl-7 pr-3 text-xs text-muted-foreground placeholder-muted-foreground outline-none focus:border-border"
 />
 </div>
 <div className="flex items-center gap-1">
 <Filter size={12} className="text-muted-foreground" />
 {(["all", "high", "medium", "low"] as const).map(f => (
 <button
 key={f}
 onClick={() => setFilterFlag(f)}
 className={cn("rounded px-2 py-1 text-xs capitalize", filterFlag === f ? "bg-indigo-600 text-foreground" : "text-muted-foreground hover:text-foreground")}
 >
 {f}
 </button>
 ))}
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full min-w-[700px] text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border/20">
 {[
 { key: null, label: "Ticker" },
 { key: "overallScore" as SortKey, label: "Score" },
 { key: "flag" as SortKey, label: "Quality" },
 { key: "accrualRatio" as SortKey, label: "Accruals %" },
 { key: "revenueQuality" as SortKey, label: "Rev Quality" },
 { key: "expenseRecognition" as SortKey, label: "Exp Recog" },
 { key: "fcfNiDivergence" as SortKey, label: "FCF/NI" },
 { key: "marketCap" as SortKey, label: "Mkt Cap (B)" },
 ].map(col => (
 <th
 key={col.label}
 className={cn("pb-2 pr-3 text-left font-medium text-muted-foreground", col.key ? "cursor-pointer hover:text-muted-foreground" : "")}
 onClick={() => col.key && handleSort(col.key)}
 >
 {col.label} {col.key && <SortIcon col={col.key} />}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {sorted.map((stock, i) => (
 <motion.tr
 key={stock.ticker}
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.02 }}
 className="border-b border-border/20 hover:bg-muted/30"
 >
 <td className="py-2 pr-3">
 <div className="font-semibold text-foreground">{stock.ticker}</div>
 <div className="text-muted-foreground">{stock.name}</div>
 </td>
 <td className="py-2 pr-3"><ScoreBadge score={stock.overallScore} /></td>
 <td className="py-2 pr-3"><FlagBadge flag={stock.flag} /></td>
 <td className={cn("py-2 pr-3 tabular-nums", Math.abs(stock.accrualRatio) > 6 ? "text-red-400" : "text-muted-foreground")}>
 {stock.accrualRatio.toFixed(1)}%
 </td>
 <td className="py-2 pr-3">
 <MiniBar value={stock.revenueQuality} max={100} color="bg-indigo-500" />
 </td>
 <td className="py-2 pr-3">
 <MiniBar value={stock.expenseRecognition} max={100} color="bg-primary" />
 </td>
 <td className={cn("py-2 pr-3 tabular-nums font-medium", stock.fcfNiDivergence >= 1 ? "text-emerald-400" : "text-amber-400")}>
 {stock.fcfNiDivergence.toFixed(2)}x
 </td>
 <td className="py-2 tabular-nums text-muted-foreground">${stock.marketCap.toFixed(0)}B</td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Legend */}
 <div className="rounded-lg border border-border/20 bg-foreground/[0.02] p-3 text-xs text-muted-foreground leading-relaxed">
 <strong className="text-muted-foreground">Score methodology:</strong> Weighted composite — Revenue Quality (30%) + Expense Recognition (25%) + FCF/NI alignment (30%) + Accruals penalty (15%). Scores 70+ indicate high-quality earnings; below 45 suggest significant accounting risk.
 </div>
 </div>
 );
}

// ── Tab 2: Accrual Analysis ────────────────────────────────────────────────────
function AccrualTab() {
 const [view, setView] = useState<"balance" | "cf">("balance");

 return (
 <div className="space-y-4">
 <div>
 <h2 className="text-base font-medium text-foreground">Accrual Analysis</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Accruals measure the gap between reported earnings and cash flows. Companies with high accruals tend to underperform by 10–18% annually.
 </p>
 </div>

 {/* Formula cards */}
 <div className="flex gap-2">
 <button onClick={() => setView("balance")} className={cn("rounded px-3 py-1.5 text-xs font-medium", view === "balance" ? "bg-indigo-600 text-foreground" : "text-muted-foreground border border-border hover:text-foreground")}>
 Balance Sheet Method
 </button>
 <button onClick={() => setView("cf")} className={cn("rounded px-3 py-1.5 text-xs font-medium", view === "cf" ? "bg-indigo-600 text-foreground" : "text-muted-foreground border border-border hover:text-foreground")}>
 Cash Flow Method
 </button>
 </div>

 <AnimatePresence mode="wait">
 {view === "balance" ? (
 <motion.div key="balance" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5 space-y-4">
 <h3 className="text-sm font-medium text-foreground">Balance Sheet Accruals (Sloan, 1996)</h3>
 <div className="rounded-lg bg-card p-4 font-mono text-xs text-muted-foreground space-y-1">
 <div>ΔOperating Assets = ΔTotal Assets − ΔCash − ΔShort-term Investments</div>
 <div>ΔOperating Liabilities = ΔTotal Liabilities − ΔDebt − ΔDividends Payable</div>
 <div className="mt-2 text-indigo-400 font-medium">Accruals = ΔOperating Assets − ΔOperating Liabilities</div>
 <div className="mt-2 text-muted-foreground">Accrual Ratio = Accruals / Average Net Operating Assets</div>
 </div>
 <div className="grid grid-cols-3 gap-3">
 {[
 { label: "Low Accrual Ratio", range: "< −2%", interpretation: "Earnings are well-supported by cash. Historically bullish signal.", color: "text-emerald-400" },
 { label: "Neutral Range", range: "−2% to +2%", interpretation: "Typical for well-run companies. No strong signal.", color: "text-muted-foreground" },
 { label: "High Accrual Ratio", range: "> +5%", interpretation: "Earnings running ahead of cash. Mean reversion likely.", color: "text-red-400" },
 ].map(item => (
 <div key={item.label} className="rounded-lg border border-border/20 bg-foreground/[0.02] p-3">
 <div className={cn("text-xs text-muted-foreground font-medium mb-1", item.color)}>{item.label}</div>
 <div className="text-xs text-muted-foreground mb-1">{item.range}</div>
 <div className="text-xs text-muted-foreground">{item.interpretation}</div>
 </div>
 ))}
 </div>
 </div>
 </motion.div>
 ) : (
 <motion.div key="cf" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5 space-y-4">
 <h3 className="text-sm font-medium text-foreground">Cash Flow Accruals (Dechow et al., 1998)</h3>
 <div className="rounded-lg bg-card p-4 font-mono text-xs text-muted-foreground space-y-1">
 <div>CF-Accruals = Net Income − Operating Cash Flow − Investing Cash Flow</div>
 <div className="mt-2 text-indigo-400 font-medium">CF Accrual Ratio = CF-Accruals / Average Net Operating Assets</div>
 <div className="mt-2 text-muted-foreground">Preferred by practitioners — avoids balance sheet restatement issues</div>
 </div>
 <div className="text-xs text-muted-foreground leading-relaxed">
 The cash-flow based measure directly compares earnings to cash generation, making it more robust to balance sheet management.
 Academic studies find the CF accrual ratio predicts future returns with a 5-factor alpha of approximately 7% per year when going long low-accrual and short high-accrual deciles.
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Decile return chart */}
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5">
 <h3 className="mb-1 text-sm font-medium text-foreground">Historical Decile Returns by Accrual Level</h3>
 <p className="mb-4 text-xs text-muted-foreground">D1 = lowest accruals (highest quality). D10 = highest accruals. Annual return spread ~15pp.</p>
 <div className="flex justify-center">
 <DecileReturnChart />
 </div>
 <div className="mt-3 flex gap-4 justify-center text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-emerald-400 opacity-85" /><span className="text-muted-foreground">Low accrual (quality)</span></div>
 <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground" /><span className="text-muted-foreground">Mid deciles</span></div>
 <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-red-400 opacity-85" /><span className="text-muted-foreground">High accrual (risk)</span></div>
 </div>
 </div>

 {/* Key insight */}
 <div className="rounded-lg border-l-2 border-indigo-500 bg-indigo-500/5 p-4 text-xs text-muted-foreground leading-relaxed">
 <strong className="text-foreground">Why do accruals predict returns?</strong> High-accrual companies have earnings that are partly "paper profits" — unrealized revenue recognition, deferred expense booking, or aggressive working capital management. As the accounting headwinds unwind over 1–3 years, earnings disappoint and stock prices correct. Investors who identify this early can build a durable quality premium.
 </div>
 </div>
 );
}

// ── Tab 3: Piotroski F-Score ───────────────────────────────────────────────────
function PiotroskiTab() {
 const [selectedIdx, setSelectedIdx] = useState(0);
 const companies = useMemo(() => generatePiotroskiData(), []);
 const company = companies[selectedIdx];

 const factorGroups = [
 {
 group: "Profitability",
 color: "text-emerald-400",
 factors: [
 { label: "ROA > 0", value: company.roa, desc: "Positive return on assets" },
 { label: "OCF > 0", value: company.ocf, desc: "Positive operating cash flow" },
 { label: "ΔROA > 0", value: company.deltaRoa, desc: "Improving ROA year-over-year" },
 { label: "Accrual Quality", value: company.accrual, desc: "OCF/Assets > ROA (cash > paper earnings)" },
 ],
 },
 {
 group: "Leverage / Liquidity",
 color: "text-amber-400",
 factors: [
 { label: "ΔLeverage < 0", value: company.deltaLeverage, desc: "Long-term debt ratio decreased" },
 { label: "ΔLiquidity > 0", value: company.deltaLiquidity, desc: "Current ratio improved" },
 { label: "No Dilution", value: company.noShares, desc: "No new shares issued" },
 ],
 },
 {
 group: "Operating Efficiency",
 color: "text-indigo-400",
 factors: [
 { label: "ΔGross Margin > 0", value: company.deltaMargin, desc: "Gross margin expanded" },
 { label: "ΔAsset Turnover > 0", value: company.deltaTurnover, desc: "Asset utilization improved" },
 ],
 },
 ];

 const fscoreColor = company.fscore >= 7 ? "text-emerald-400" : company.fscore >= 4 ? "text-amber-400" : "text-red-400";

 return (
 <div className="space-y-4">
 <div>
 <h2 className="text-base font-medium text-foreground">Piotroski F-Score</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 9-factor scoring system (0–9) measuring financial health across profitability, leverage, and efficiency. F-Score ≥ 7 = strong; ≤ 2 = weak.
 </p>
 </div>

 {/* Company selector */}
 <div className="flex flex-wrap gap-2">
 {companies.map((c, i) => (
 <button
 key={c.ticker}
 onClick={() => setSelectedIdx(i)}
 className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors", selectedIdx === i ? "bg-indigo-600 text-foreground" : "border border-border text-muted-foreground hover:text-foreground")}
 >
 {c.ticker}
 </button>
 ))}
 </div>

 <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
 {/* F-Score summary */}
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5 flex flex-col items-center justify-center gap-2">
 <RadarChart company={company} />
 <div className={cn("text-2xl font-semibold tabular-nums", fscoreColor)}>{company.fscore}</div>
 <div className="text-xs text-muted-foreground">{company.ticker} F-Score (out of 9)</div>
 <div className={cn("text-xs text-muted-foreground font-medium", fscoreColor)}>
 {company.fscore >= 7 ? "Strong — Long Candidate" : company.fscore >= 4 ? "Neutral — Monitor" : "Weak — Potential Short"}
 </div>
 </div>

 {/* Factor breakdown */}
 <div className="col-span-2 space-y-4">
 {factorGroups.map(group => (
 <div key={group.group} className="rounded-md border border-border/20 bg-foreground/[0.03] p-4">
 <h3 className={cn("mb-3 text-xs text-muted-foreground font-medium ", group.color)}>{group.group}</h3>
 <div className="space-y-2">
 {group.factors.map(factor => (
 <div key={factor.label} className="flex items-center gap-3">
 <div className={cn("h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-muted-foreground font-semibold",
 factor.value === 1 ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/10 text-red-400"
 )}>
 {factor.value === 1 ? "1" : "0"}
 </div>
 <div className="flex-1">
 <div className="text-xs font-medium text-muted-foreground">{factor.label}</div>
 <div className="text-xs text-muted-foreground">{factor.desc}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Score interpretation */}
 <div className="grid grid-cols-3 gap-3">
 {[
 { range: "8–9", label: "Strong Buy", color: "border-emerald-500/30 bg-emerald-500/5", textColor: "text-emerald-400", desc: "All signals aligned. Statistically high probability of outperformance." },
 { range: "4–7", label: "Neutral", color: "border-amber-500/30 bg-amber-500/5", textColor: "text-amber-400", desc: "Mixed signals. Research further before acting." },
 { range: "0–3", label: "Avoid / Short", color: "border-red-500/30 bg-red-500/5", textColor: "text-red-400", desc: "Deteriorating fundamentals. High distress risk." },
 ].map(item => (
 <div key={item.range} className={cn("rounded-lg border p-3", item.color)}>
 <div className={cn("text-sm font-medium mb-0.5", item.textColor)}>F-Score {item.range}</div>
 <div className={cn("text-xs text-muted-foreground font-medium mb-1", item.textColor)}>{item.label}</div>
 <div className="text-xs text-muted-foreground">{item.desc}</div>
 </div>
 ))}
 </div>
 </div>
 );
}

// ── Tab 4: Beneish M-Score ────────────────────────────────────────────────────
function BeneishTab() {
 const [selectedIdx, setSelectedIdx] = useState(0);
 const companies = useMemo(() => generateBeneishData(), []);
 const company = companies[selectedIdx];

 const variables = [
 { key: "dsri" as const, label: "DSRI", name: "Days Sales Receivables Index", threshold: 1.465, desc: "Spike signals accelerated revenue recognition" },
 { key: "gmi" as const, label: "GMI", name: "Gross Margin Index", threshold: 1.193, desc: ">1 means deteriorating margins — pressure to manipulate" },
 { key: "aqi" as const, label: "AQI", name: "Asset Quality Index", threshold: 1.254, desc: "Increase in non-current assets signals deferred costs" },
 { key: "sgi" as const, label: "SGI", name: "Sales Growth Index", threshold: 1.607, desc: "High growth companies face more manipulation incentives" },
 { key: "depi" as const, label: "DEPI", name: "Depreciation Index", threshold: 1.077, desc: ">1 signals slower depreciation (earnings inflation)" },
 { key: "sgai" as const, label: "SGAI", name: "SG&A Index", threshold: 1.041, desc: "Rising SG&A relative to sales signals cost deterioration" },
 { key: "lvgi" as const, label: "LVGI", name: "Leverage Index", threshold: 1.111, desc: "Higher leverage increases manipulation incentives" },
 { key: "tata" as const, label: "TATA", name: "Total Accruals / Total Assets", threshold: 0.031, desc: "Positive TATA indicates accruals-driven earnings" },
 ];

 const mScoreColor = company.mScore > -1.78 ? "text-red-400" : company.mScore > -2.22 ? "text-amber-400" : "text-emerald-400";

 return (
 <div className="space-y-4">
 <div>
 <h2 className="text-base font-medium text-foreground">Beneish M-Score</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 8-variable model developed by Messod Beneish (1999) to detect earnings manipulation. M-Score &gt; −1.78 indicates likely manipulation.
 </p>
 </div>

 {/* M-Score formula */}
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5">
 <h3 className="mb-3 text-xs font-medium text-muted-foreground ">M-Score Formula</h3>
 <div className="rounded-lg bg-card p-4 font-mono text-xs text-muted-foreground leading-relaxed">
 <span className="text-indigo-400">M-Score</span> = −4.84 + 0.92(DSRI) + 0.528(GMI) + 0.404(AQI) + 0.892(SGI)<br />
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 0.115(DEPI) − 0.172(SGAI) + 4.679(TATA) − 0.327(LVGI)
 </div>
 <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5"><div className="h-2 w-8 rounded bg-red-400/70" /><span className="text-muted-foreground">&gt; −1.78: Likely manipulator</span></div>
 <div className="flex items-center gap-1.5"><div className="h-2 w-8 rounded bg-amber-400/70" /><span className="text-muted-foreground">−2.22 to −1.78: Gray zone</span></div>
 <div className="flex items-center gap-1.5"><div className="h-2 w-8 rounded bg-emerald-400/70" /><span className="text-muted-foreground">&lt; −2.22: Unlikely manipulator</span></div>
 </div>
 </div>

 {/* Company selector */}
 <div className="flex flex-wrap gap-2">
 {companies.map((c, i) => (
 <button
 key={c.ticker}
 onClick={() => setSelectedIdx(i)}
 className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors", selectedIdx === i ? "bg-indigo-600 text-foreground" : "border border-border text-muted-foreground hover:text-foreground")}
 >
 {c.ticker} {c.risk === "high" && <AlertTriangle size={9} className="inline text-red-400" />}
 </button>
 ))}
 </div>

 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 {/* Variable bars */}
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5 space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-medium text-foreground">{company.name}</h3>
 <RiskBadge risk={company.risk} />
 </div>
 <div className={cn("text-lg font-medium tabular-nums", mScoreColor)}>{company.mScore.toFixed(3)}</div>
 <div className="text-xs text-muted-foreground">M-Score (threshold: −1.78)</div>
 <div className="mt-4 space-y-2.5">
 {variables.map(v => (
 <BeneishVarBar key={v.key} value={company[v.key]} threshold={v.threshold} label={v.label} />
 ))}
 </div>
 </div>

 {/* Variable descriptions */}
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5 space-y-3">
 <h3 className="text-sm font-medium text-foreground">Variable Interpretation</h3>
 <div className="space-y-2.5">
 {variables.map(v => (
 <div key={v.key} className="flex gap-2">
 <span className="w-10 flex-shrink-0 text-xs font-mono font-medium text-indigo-400">{v.label}</span>
 <div>
 <div className="text-xs font-medium text-muted-foreground">{v.name}</div>
 <div className="text-xs text-muted-foreground">{v.desc}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Enron case study */}
 <div className="rounded-md border border-red-500/20 bg-red-500/5 p-5 space-y-3">
 <div className="flex items-center gap-2">
 <ShieldAlert size={16} className="text-red-400" />
 <h3 className="text-sm font-medium text-red-400">Case Study: Enron Corp (2001)</h3>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Enron's 2000 annual report produced an M-Score of approximately <strong className="text-red-400">−1.37</strong>, well above the −1.78 danger threshold.
 Key red flags included a DSRI of 1.92 (receivables growing far faster than revenue), SGI of 1.60 (unsustainable revenue growth),
 and a TATA of +0.17 (massive accruals relative to assets). In hindsight, the model correctly identified the manipulation
 one full year before the company's collapse in December 2001.
 </p>
 <div className="flex flex-wrap gap-3">
 {[
 { label: "M-Score", value: "−1.37", danger: true },
 { label: "DSRI", value: "1.92", danger: true },
 { label: "SGI", value: "1.60", danger: true },
 { label: "TATA", value: "0.17", danger: true },
 ].map(item => (
 <div key={item.label} className="rounded border border-red-500/20 bg-red-500/5 px-3 py-1.5">
 <div className="text-xs text-muted-foreground">{item.label}</div>
 <div className="text-sm font-medium text-red-400">{item.value}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ── Tab 5: Cash Flow Quality ───────────────────────────────────────────────────
function CashFlowTab() {
 const stocks = useMemo(() => generateCashFlowData(), []);
 const [sortKey, setSortKey] = useState<keyof CashFlowStock>("divergence");
 const [sortDir, setSortDir] = useState<SortDir>("desc");

 const sorted = useMemo(() => {
 return [...stocks].sort((a, b) => {
 const av = a[sortKey] as number;
 const bv = b[sortKey] as number;
 return sortDir === "asc" ? av - bv : bv - av;
 });
 }, [stocks, sortKey, sortDir]);

 const handleSort = (key: keyof CashFlowStock) => {
 if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
 else { setSortKey(key); setSortDir("desc"); }
 };

 const SortIcon = ({ col }: { col: keyof CashFlowStock }) =>
 sortKey === col ? (sortDir === "desc" ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />) : null;

 // SVG: OCF/NI ratio distribution
 const ocfValues = stocks.map(s => s.ocfNiRatio).sort((a, b) => a - b);
 const maxOcf = Math.max(...ocfValues);
 const W = 380, H = 80, PAD = 20;

 return (
 <div className="space-y-4">
 <div>
 <h2 className="text-base font-medium text-foreground">Cash Flow Quality</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Measures how well reported earnings translate into real cash. OCF/NI &gt; 1 is the gold standard; divergences signal accounting risk.
 </p>
 </div>

 {/* Key metrics explainer */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 {[
 { label: "OCF/NI Ratio", formula: "OCF ÷ Net Income", ideal: "> 1.0", color: "text-emerald-400" },
 { label: "Capex Intensity", formula: "Capex ÷ Revenue", ideal: "< 10% typical", color: "text-amber-400" },
 { label: "FCF Yield", formula: "FCF ÷ Market Cap", ideal: "> 4% attractive", color: "text-indigo-400" },
 { label: "Divergence", formula: "EPS Yield − FCF Yield", ideal: "< 1% is healthy", color: "text-muted-foreground" },
 ].map(item => (
 <div key={item.label} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-3">
 <div className={cn("text-xs text-muted-foreground font-medium mb-1", item.color)}>{item.label}</div>
 <div className="font-mono text-xs text-muted-foreground mb-1">{item.formula}</div>
 <div className="text-xs text-muted-foreground">Ideal: {item.ideal}</div>
 </div>
 ))}
 </div>

 {/* OCF/NI Distribution */}
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5">
 <h3 className="mb-3 text-sm font-medium text-foreground">OCF/NI Distribution Across Sample</h3>
 <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full max-w-md">
 {ocfValues.map((v, i) => {
 const x = PAD + (i / (ocfValues.length - 1)) * (W - PAD * 2);
 const barH = (v / maxOcf) * (H - 10);
 const color = v >= 1 ? "#34d399" : v >= 0.7 ? "#fbbf24" : "#f87171";
 return (
 <g key={i}>
 <rect x={x - 8} y={H - barH} width={16} height={barH} fill={color} opacity={0.8} rx={2} />
 <text x={x} y={H + 14} textAnchor="middle" fill="#71717a" fontSize={7}>{ocfValues[i].toFixed(1)}x</text>
 </g>
 );
 })}
 <line x1={PAD} y1={H} x2={W - PAD} y2={H} stroke="#3f3f46" strokeWidth={1} />
 {/* 1.0 reference line */}
 <line x1={PAD} y1={H - (1 / maxOcf) * (H - 10)} x2={W - PAD} y2={H - (1 / maxOcf) * (H - 10)} stroke="#6366f1" strokeWidth={1} strokeDasharray="4,3" />
 <text x={W - PAD - 2} y={H - (1 / maxOcf) * (H - 10) - 3} textAnchor="end" fill="#6366f1" fontSize={8}>1.0x threshold</text>
 </svg>
 <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-emerald-400" /><span className="text-muted-foreground">OCF/NI ≥ 1.0</span></div>
 <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-amber-400" /><span className="text-muted-foreground">0.7–1.0</span></div>
 <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-red-400" /><span className="text-muted-foreground">&lt; 0.7</span></div>
 </div>
 </div>

 {/* Divergence alert table */}
 <div className="rounded-md border border-border/20 bg-foreground/[0.03] p-5">
 <div className="mb-3 flex items-center justify-between">
 <h3 className="text-sm font-medium text-foreground">FCF vs Earnings Yield Divergence Table</h3>
 <div className="flex items-center gap-1 text-xs text-amber-400">
 <AlertTriangle size={12} />
 <span>{stocks.filter(s => s.alert).length} divergence alerts</span>
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full min-w-[600px] text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border/20">
 {[
 { key: "ticker" as keyof CashFlowStock, label: "Company" },
 { key: "ocfNiRatio" as keyof CashFlowStock, label: "OCF/NI" },
 { key: "capexIntensity" as keyof CashFlowStock, label: "Capex/Rev" },
 { key: "fcfYield" as keyof CashFlowStock, label: "FCF Yield" },
 { key: "earningsYield" as keyof CashFlowStock, label: "EPS Yield" },
 { key: "divergence" as keyof CashFlowStock, label: "Divergence" },
 { key: "alert" as keyof CashFlowStock, label: "Alert" },
 ].map(col => (
 <th
 key={col.label}
 className="cursor-pointer pb-2 pr-3 text-left font-medium text-muted-foreground hover:text-muted-foreground"
 onClick={() => handleSort(col.key)}
 >
 {col.label} <SortIcon col={col.key} />
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {sorted.map((stock, i) => (
 <motion.tr key={stock.ticker} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={cn("border-b border-border/20", stock.alert ? "bg-amber-500/5" : "hover:bg-muted/30")}>
 <td className="py-2 pr-3">
 <div className="font-medium text-foreground">{stock.ticker}</div>
 <div className="text-muted-foreground">{stock.name}</div>
 </td>
 <td className={cn("py-2 pr-3 tabular-nums font-medium", stock.ocfNiRatio >= 1 ? "text-emerald-400" : stock.ocfNiRatio >= 0.7 ? "text-amber-400" : "text-red-400")}>
 {stock.ocfNiRatio.toFixed(2)}x
 </td>
 <td className="py-2 pr-3 tabular-nums text-muted-foreground">{(stock.capexIntensity * 100).toFixed(1)}%</td>
 <td className="py-2 pr-3">
 <DivergenceBar fcfYield={stock.fcfYield} earningsYield={stock.earningsYield} />
 </td>
 <td className="py-2 pr-3 tabular-nums text-muted-foreground">{stock.earningsYield.toFixed(1)}%</td>
 <td className={cn("py-2 pr-3 tabular-nums font-medium", Math.abs(stock.divergence) > 2.5 ? "text-amber-400" : "text-muted-foreground")}>
 {stock.divergence > 0 ? "+" : ""}{stock.divergence.toFixed(1)}pp
 </td>
 <td className="py-2">
 {stock.alert ? (
 <span className="flex items-center gap-1 text-amber-400 text-xs"><AlertTriangle size={11} />Divergence</span>
 ) : (
 <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={11} />OK</span>
 )}
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Capex breakdown note */}
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <div className="rounded-lg border border-border/20 bg-foreground/[0.03] p-4">
 <h4 className="mb-2 text-xs font-medium text-muted-foreground">Maintenance vs Growth Capex</h4>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Maintenance capex keeps existing assets functional (essential, non-discretionary). Growth capex expands capacity or enters new markets.
 High maintenance capex relative to total capex signals a capital-heavy, low-growth business — often with lower FCF quality.
 </p>
 <div className="mt-3 font-mono text-xs text-indigo-400">
 Maintenance Capex ≈ D&A × (1 − Revenue Growth Rate)<br />
 True FCF = OCF − Maintenance Capex
 </div>
 </div>
 <div className="rounded-lg border border-border/20 bg-foreground/[0.03] p-4">
 <h4 className="mb-2 text-xs font-medium text-muted-foreground">Why FCF Yield Beats Earnings Yield</h4>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Earnings are subject to accrual accounting, timing adjustments, and management discretion. FCF yield strips these away —
 what remains is the cash actually generated per dollar of market value.
 A persistent gap where earnings yield far exceeds FCF yield is a classic warning sign of deteriorating earnings quality.
 </p>
 </div>
 </div>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EarningsQualityPage() {
 return (
 <div className="min-h-screen bg-background text-foreground">
 <div className="mx-auto max-w-6xl px-4 py-8">
 {/* Page header */}
 <div className="mb-6">
 <div className="flex items-center gap-2 mb-2">
 <BarChart3 size={20} className="text-indigo-400" />
 <h1 className="text-xl font-medium text-foreground">Earnings Quality Analysis</h1>
 </div>
 <p className="text-sm text-muted-foreground max-w-2xl">
 Accounting-based stock screening using accruals analysis, Piotroski F-Score, Beneish M-Score, and cash flow quality metrics.
 Identify companies with sustainable earnings versus those at risk of accounting manipulation or deterioration.
 </p>
 </div>

 {/* Quick stat strip — Hero */}
 <div className="border-l-4 border-l-primary rounded-lg bg-card p-6 mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
 {[
 { label: "Accrual Anomaly", value: "~10%", subLabel: "Annual alpha, low vs high", icon: <Activity size={14} className="text-indigo-400" />, color: "text-indigo-400" },
 { label: "F-Score Spread", value: "~23%", subLabel: "Strong vs weak portfolios", icon: <TrendingUp size={14} className="text-emerald-400" />, color: "text-emerald-400" },
 { label: "M-Score Accuracy", value: "76%", subLabel: "Manipulation detection rate", icon: <ShieldAlert size={14} className="text-amber-400" />, color: "text-amber-400" },
 { label: "FCF Premium", value: "~7%", subLabel: "High vs low FCF quality", icon: <DollarSign size={14} className="text-muted-foreground/50" />, color: "text-foreground" },
 ].map(stat => (
 <div key={stat.label} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-3 flex items-start gap-3">
 <div className="mt-0.5">{stat.icon}</div>
 <div>
 <div className={cn("text-lg font-medium tabular-nums", stat.color)}>{stat.value}</div>
 <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
 <div className="text-xs text-muted-foreground">{stat.subLabel}</div>
 </div>
 </div>
 ))}
 </div>

 {/* Tabs */}
 <Tabs defaultValue="screener">
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-6">
 {[
 { value: "screener", label: "Screener", icon: <Filter size={13} /> },
 { value: "accruals", label: "Accrual Analysis", icon: <Activity size={13} /> },
 { value: "piotroski", label: "Piotroski F-Score", icon: <Layers size={13} /> },
 { value: "beneish", label: "Beneish M-Score", icon: <ShieldAlert size={13} /> },
 { value: "cashflow", label: "Cash Flow Quality", icon: <DollarSign size={13} /> },
 ].map(tab => (
 <TabsTrigger
 key={tab.value}
 value={tab.value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 {tab.icon}{tab.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="screener" className="data-[state=inactive]:hidden">
 <ScreenerTab />
 </TabsContent>
 <TabsContent value="accruals" className="data-[state=inactive]:hidden">
 <AccrualTab />
 </TabsContent>
 <TabsContent value="piotroski" className="data-[state=inactive]:hidden">
 <PiotroskiTab />
 </TabsContent>
 <TabsContent value="beneish" className="data-[state=inactive]:hidden">
 <BeneishTab />
 </TabsContent>
 <TabsContent value="cashflow" className="data-[state=inactive]:hidden">
 <CashFlowTab />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
