"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Search,
 TrendingUp,
 TrendingDown,
 Star,
 Download,
 BarChart2,
 Shield,
 DollarSign,
 Activity,
 AlertTriangle,
 CheckCircle,
 ChevronUp,
 ChevronDown,
 Filter,
 Bookmark,
 Eye,
 ArrowRight,
 Info,
 Award,
 Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 101;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function resetSeed(seed: number) {
 s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScreenerStock {
 ticker: string;
 company: string;
 sector: string;
 qualityScore: number;
 peRatio: number;
 forwardPE: number;
 revenueGrowth: number;
 grossMargin: number;
 operatingMargin: number;
 netMargin: number;
 roe: number;
 debtEquity: number;
 dividendYield: number;
 marketCap: number;
 price: number;
 eps: number;
 currentRatio: number;
 fcfYield: number;
}

interface IncomeYear {
 year: number;
 revenue: number;
 grossProfit: number;
 operatingIncome: number;
 netIncome: number;
 epsGaap: number;
 epsAdj: number;
}

interface BalanceSheetYear {
 year: number;
 cash: number;
 currentAssets: number;
 totalAssets: number;
 currentLiabilities: number;
 totalDebt: number;
 equity: number;
 goodwill: number;
 intangibles: number;
 sharesOutstanding: number;
}

interface CashFlowYear {
 year: number;
 operatingCF: number;
 capex: number;
 fcf: number;
 netIncome: number;
 dividends: number;
 buybacks: number;
 acquisitions: number;
}

interface Competitor {
 ticker: string;
 name: string;
 revenueGrowth: number;
 grossMargin: number;
 operatingMargin: number;
 roe: number;
 peRatio: number;
 evEbitda: number;
 moatScore: number;
 esgScore: number;
}

interface EarningsQualityData {
 year: number;
 netIncome: number;
 fcf: number;
 totalAssets: number;
 revenue: number;
 accountsReceivable: number;
 inventory: number;
 deferredRevenue: number;
}

// ── Stock Universe (50 stocks) ─────────────────────────────────────────────────

const SECTORS = [
 "Technology",
 "Healthcare",
 "Financials",
 "Consumer Discretionary",
 "Consumer Staples",
 "Industrials",
 "Energy",
 "Communication Services",
 "Materials",
 "Real Estate",
];

const STOCK_TEMPLATES = [
 { ticker: "VERX", company: "Vertex Analytics", sector: "Technology" },
 { ticker: "PLNK", company: "Planck Systems", sector: "Technology" },
 { ticker: "QVNT", company: "Quantive Corp", sector: "Technology" },
 { ticker: "NXGN", company: "NextGen Health", sector: "Healthcare" },
 { ticker: "DXCM", company: "Dexcom Plus", sector: "Healthcare" },
 { ticker: "CRNX", company: "Carnyx Biotech", sector: "Healthcare" },
 { ticker: "HLTH", company: "Helios Health", sector: "Healthcare" },
 { ticker: "MDPX", company: "MedPoint Pharma", sector: "Healthcare" },
 { ticker: "NGST", company: "Nightstar Bio", sector: "Healthcare" },
 { ticker: "OZRK", company: "Ozark Financial", sector: "Financials" },
 { ticker: "ATLC", company: "Atlantic Capital", sector: "Financials" },
 { ticker: "BNKR", company: "Banker Group", sector: "Financials" },
 { ticker: "FNTX", company: "Fintech X", sector: "Financials" },
 { ticker: "SMPL", company: "Simplex Retail", sector: "Consumer Discretionary" },
 { ticker: "BRNT", company: "Brentwood Retail", sector: "Consumer Discretionary" },
 { ticker: "ARCO", company: "Arco Consumer", sector: "Consumer Discretionary" },
 { ticker: "HMBL", company: "Humble Brands", sector: "Consumer Staples" },
 { ticker: "BDRY", company: "Boundary AI", sector: "Technology" },
 { ticker: "KLVR", company: "Kelver Tech", sector: "Technology" },
 { ticker: "SNPX", company: "Synapse AI", sector: "Technology" },
 { ticker: "MRVL", company: "Marvell Semi", sector: "Technology" },
 { ticker: "ARLO", company: "Arlo Technologies", sector: "Technology" },
 { ticker: "FLUX", company: "Flux Energy", sector: "Energy" },
 { ticker: "STKR", company: "Stoker Energy", sector: "Energy" },
 { ticker: "TMPR", company: "Templar Energy", sector: "Energy" },
 { ticker: "PRTO", company: "Proto Industrials", sector: "Industrials" },
 { ticker: "INDX", company: "Index Industrials", sector: "Industrials" },
 { ticker: "TRUX", company: "Trux Logistics", sector: "Industrials" },
 { ticker: "GLXY", company: "Galaxy Materials", sector: "Materials" },
 { ticker: "MRVN", company: "Marvin Materials", sector: "Materials" },
 { ticker: "WVLY", company: "Waverly Comms", sector: "Communication Services" },
 { ticker: "SPHX", company: "Sphinx Comms", sector: "Communication Services" },
 { ticker: "PXLD", company: "Pixelated Media", sector: "Communication Services" },
 { ticker: "VRTH", company: "Virtue REIT", sector: "Real Estate" },
 { ticker: "WLLS", company: "Wells Property", sector: "Real Estate" },
 { ticker: "CRWD2", company: "Crowd Digital", sector: "Technology" },
 { ticker: "CPTA", company: "Capita Health", sector: "Healthcare" },
 { ticker: "CLRX", company: "Clearex Utilities", sector: "Energy" },
 { ticker: "CXAI", company: "CortexAI", sector: "Technology" },
 { ticker: "DPTH", company: "Depth Systems", sector: "Technology" },
 { ticker: "EVOX", company: "Evo Pharma", sector: "Healthcare" },
 { ticker: "FRMR", company: "Former Capital", sector: "Financials" },
 { ticker: "GRVT", company: "Gravity Software", sector: "Technology" },
 { ticker: "HRTZ", company: "Hertz Analytics", sector: "Technology" },
 { ticker: "IQLX", company: "IQ Logistics", sector: "Industrials" },
 { ticker: "JRDN", company: "Jordan Energy", sector: "Energy" },
 { ticker: "KNTX", company: "Kento Consumer", sector: "Consumer Staples" },
 { ticker: "LQDT", company: "Liquidity Group", sector: "Financials" },
 { ticker: "MNVR", company: "Maneuver Tech", sector: "Technology" },
 { ticker: "NRGY", company: "Norgy Resources", sector: "Energy" },
];

function generateScreenerStocks(): ScreenerStock[] {
 resetSeed(202);
 return STOCK_TEMPLATES.map((t) => {
 const isTech = t.sector === "Technology";
 const isHealth = t.sector === "Healthcare";
 const isFinancial = t.sector === "Financials";
 const isEnergy = t.sector === "Energy";

 const revenueGrowth = isTech
 ? 8 + rand() * 35
 : isHealth
 ? 5 + rand() * 25
 : -2 + rand() * 20;
 const grossMargin = isTech
 ? 45 + rand() * 45
 : isHealth
 ? 40 + rand() * 40
 : 15 + rand() * 35;
 const operatingMargin = grossMargin * (0.2 + rand() * 0.5);
 const netMargin = operatingMargin * (0.5 + rand() * 0.4);
 const roe = isFinancial ? 8 + rand() * 20 : 5 + rand() * 45;
 const debtEquity = isEnergy ? 0.8 + rand() * 2 : rand() * 2;
 const dividendYield = rand() < 0.4 ? rand() * 4 : 0;
 const peRatio = 10 + rand() * 50;
 const forwardPE = peRatio * (0.7 + rand() * 0.5);
 const price = 20 + rand() * 480;
 const eps = price / peRatio;
 const currentRatio = 0.5 + rand() * 3;
 const fcfYield = 1 + rand() * 8;
 const marketCap = 0.5 + rand() * 500;

 // Quality score composite
 const roeScore = Math.min(roe / 30, 1) * 25;
 const marginScore = Math.min(netMargin / 20, 1) * 25;
 const growthScore = Math.min(revenueGrowth / 25, 1) * 20;
 const debtScore = Math.max(0, 1 - debtEquity / 3) * 15;
 const liquidityScore = Math.min(currentRatio / 2, 1) * 15;
 const qualityScore = Math.round(roeScore + marginScore + growthScore + debtScore + liquidityScore);

 return {
 ticker: t.ticker,
 company: t.company,
 sector: t.sector,
 qualityScore,
 peRatio: +peRatio.toFixed(1),
 forwardPE: +forwardPE.toFixed(1),
 revenueGrowth: +revenueGrowth.toFixed(1),
 grossMargin: +grossMargin.toFixed(1),
 operatingMargin: +operatingMargin.toFixed(1),
 netMargin: +netMargin.toFixed(1),
 roe: +roe.toFixed(1),
 debtEquity: +debtEquity.toFixed(2),
 dividendYield: +dividendYield.toFixed(2),
 marketCap: +marketCap.toFixed(1),
 price: +price.toFixed(2),
 eps: +eps.toFixed(2),
 currentRatio: +currentRatio.toFixed(2),
 fcfYield: +fcfYield.toFixed(2),
 };
 });
}

const ALL_STOCKS = generateScreenerStocks();

// ── Income Statement Data ──────────────────────────────────────────────────────

const INCOME_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "JPM", "JNJ", "XOM"];

const BASE_REVENUE: Record<string, number> = {
 AAPL: 391, MSFT: 245, GOOGL: 307, AMZN: 590, META: 134,
 NVDA: 96, TSLA: 97, JPM: 158, JNJ: 88, XOM: 398,
};

function generateIncomeStatement(ticker: string): IncomeYear[] {
 const base = BASE_REVENUE[ticker] ?? 100;
 resetSeed(ticker.charCodeAt(0) * 31 + ticker.charCodeAt(1) * 17);
 const years = [2020, 2021, 2022, 2023, 2024];
 return years.map((year, i) => {
 const factor = Math.pow(1 + 0.04 + rand() * 0.18, i);
 const revenue = +(base * factor * (0.7 + i * 0.06)).toFixed(1);
 const grossMarginPct = 0.35 + rand() * 0.35;
 const opMarginPct = grossMarginPct * (0.35 + rand() * 0.4);
 const netMarginPct = opMarginPct * (0.55 + rand() * 0.35);
 const grossProfit = +(revenue * grossMarginPct).toFixed(1);
 const operatingIncome = +(revenue * opMarginPct).toFixed(1);
 const netIncome = +(revenue * netMarginPct).toFixed(1);
 const shares = 15 + rand() * 10;
 const epsGaap = +(netIncome / shares).toFixed(2);
 const epsAdj = +(epsGaap * (1.05 + rand() * 0.15)).toFixed(2);
 return { year, revenue, grossProfit, operatingIncome, netIncome, epsGaap, epsAdj };
 });
}

// ── Balance Sheet Data ─────────────────────────────────────────────────────────

function generateBalanceSheet(ticker: string): BalanceSheetYear[] {
 resetSeed(ticker.charCodeAt(0) * 53 + 13);
 const years = [2020, 2021, 2022, 2023, 2024];
 let shares = 15 + rand() * 10;
 return years.map((year, i) => {
 shares *= 0.97 + rand() * 0.04;
 const cash = 20 + rand() * 80 + i * 5;
 const currentAssets = cash * (1.4 + rand() * 0.8);
 const totalAssets = currentAssets * (2.2 + rand() * 1.5);
 const currentLiabilities = currentAssets * (0.4 + rand() * 0.5);
 const totalDebt = currentLiabilities * (1.2 + rand() * 2);
 const goodwill = totalAssets * (0.05 + rand() * 0.2);
 const intangibles = totalAssets * (0.02 + rand() * 0.08);
 const equity = totalAssets - totalDebt - (goodwill * 0.3);
 return {
 year,
 cash: +cash.toFixed(1),
 currentAssets: +currentAssets.toFixed(1),
 totalAssets: +totalAssets.toFixed(1),
 currentLiabilities: +currentLiabilities.toFixed(1),
 totalDebt: +totalDebt.toFixed(1),
 equity: +Math.abs(equity).toFixed(1),
 goodwill: +goodwill.toFixed(1),
 intangibles: +intangibles.toFixed(1),
 sharesOutstanding: +shares.toFixed(2),
 };
 });
}

// ── Cash Flow Data ─────────────────────────────────────────────────────────────

function generateCashFlow(ticker: string): CashFlowYear[] {
 const base = BASE_REVENUE[ticker] ?? 100;
 resetSeed(ticker.charCodeAt(0) * 71 + 29);
 const years = [2020, 2021, 2022, 2023, 2024];
 return years.map((year, i) => {
 const revenue = base * Math.pow(1.08, i) * (0.8 + rand() * 0.4);
 const netIncome = +(revenue * (0.08 + rand() * 0.18)).toFixed(1);
 const operatingCF = +(netIncome * (1.1 + rand() * 0.5)).toFixed(1);
 const capex = +(operatingCF * (0.1 + rand() * 0.3)).toFixed(1);
 const fcf = +(operatingCF - capex).toFixed(1);
 const dividends = rand() < 0.5 ? +(fcf * 0.1 * rand()).toFixed(1) : 0;
 const buybacks = +(fcf * (0.1 + rand() * 0.4)).toFixed(1);
 const acquisitions = rand() < 0.4 ? +(fcf * rand() * 0.5).toFixed(1) : 0;
 return { year, operatingCF, capex, fcf, netIncome, dividends, buybacks, acquisitions };
 });
}

// ── Competitor Data ────────────────────────────────────────────────────────────

function generateCompetitors(ticker: string): Competitor[] {
 resetSeed(ticker.charCodeAt(0) * 43 + 7);
 const baseNames = [ticker, "COMP-A", "COMP-B", "COMP-C", "COMP-D"];
 return baseNames.map((t, i) => ({
 ticker: t,
 name: i === 0 ? ticker : `Competitor ${String.fromCharCode(65 + i - 1)}`,
 revenueGrowth: +(5 + rand() * 30).toFixed(1),
 grossMargin: +(30 + rand() * 45).toFixed(1),
 operatingMargin: +(10 + rand() * 30).toFixed(1),
 roe: +(8 + rand() * 40).toFixed(1),
 peRatio: +(12 + rand() * 45).toFixed(1),
 evEbitda: +(8 + rand() * 30).toFixed(1),
 moatScore: +(4 + rand() * 8).toFixed(1),
 esgScore: +(40 + rand() * 55).toFixed(0),
 }));
}

// ── Earnings Quality Data ──────────────────────────────────────────────────────

function generateEarningsQuality(ticker: string): EarningsQualityData[] {
 const base = BASE_REVENUE[ticker] ?? 80;
 resetSeed(ticker.charCodeAt(0) * 67 + 41);
 const years = [2020, 2021, 2022, 2023, 2024];
 return years.map((year, i) => {
 const revenue = base * Math.pow(1.08, i) * (0.85 + rand() * 0.3);
 const netIncome = +(revenue * (0.1 + rand() * 0.15)).toFixed(1);
 const fcf = +(netIncome * (0.7 + rand() * 0.6)).toFixed(1);
 const totalAssets = revenue * (1.5 + rand() * 1.5);
 const accountsReceivable = +(revenue * (0.08 + rand() * 0.12)).toFixed(1);
 const inventory = +(revenue * (0.03 + rand() * 0.1)).toFixed(1);
 const deferredRevenue = +(revenue * (0.01 + rand() * 0.06)).toFixed(1);
 return { year, netIncome, fcf, totalAssets, revenue, accountsReceivable, inventory, deferredRevenue };
 });
}

// ── SVG Chart Components ───────────────────────────────────────────────────────

function BarChart({
 data,
 width = 500,
 height = 200,
 color = "#6366f1",
 label,
 formatVal,
}: {
 data: { label: string; value: number }[];
 width?: number;
 height?: number;
 color?: string;
 label?: string;
 formatVal?: (v: number) => string;
}) {
 const max = Math.max(...data.map((d) => d.value));
 const pad = { top: 24, right: 16, bottom: 40, left: 52 };
 const chartW = width - pad.left - pad.right;
 const chartH = height - pad.top - pad.bottom;
 const barW = (chartW / data.length) * 0.6;
 const gap = chartW / data.length;

 return (
 <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
 {label && (
 <text x={width / 2} y={14} textAnchor="middle" className="fill-muted-foreground text-xs" fontSize={10}>
 {label}
 </text>
 )}
 {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
 const y = pad.top + chartH * (1 - pct);
 const val = max * pct;
 return (
 <g key={pct}>
 <line x1={pad.left} x2={pad.left + chartW} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
 <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#64748b">
 {formatVal ? formatVal(val) : val.toFixed(0)}
 </text>
 </g>
 );
 })}
 {data.map((d, i) => {
 const x = pad.left + i * gap + gap / 2 - barW / 2;
 const barH = Math.max(2, (d.value / max) * chartH);
 const y = pad.top + chartH - barH;
 return (
 <g key={i}>
 <rect x={x} y={y} width={barW} height={barH} fill={color} opacity={0.85} rx={2} />
 <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={7} fill="#94a3b8">
 {formatVal ? formatVal(d.value) : d.value.toFixed(0)}
 </text>
 <text x={x + barW / 2} y={pad.top + chartH + 14} textAnchor="middle" fontSize={8} fill="#64748b">
 {d.label}
 </text>
 </g>
 );
 })}
 </svg>
 );
}

function LineChart({
 series,
 width = 500,
 height = 200,
 formatVal,
}: {
 series: { label: string; color: string; data: { x: string; y: number }[] }[];
 width?: number;
 height?: number;
 formatVal?: (v: number) => string;
}) {
 const allY = series.flatMap((s) => s.data.map((d) => d.y));
 const minY = Math.min(...allY);
 const maxY = Math.max(...allY);
 const range = maxY - minY || 1;
 const pad = { top: 24, right: 16, bottom: 40, left: 52 };
 const chartW = width - pad.left - pad.right;
 const chartH = height - pad.top - pad.bottom;
 const xs = series[0]?.data ?? [];
 const xStep = chartW / Math.max(xs.length - 1, 1);

 return (
 <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
 {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
 const yVal = minY + range * pct;
 const y = pad.top + chartH * (1 - pct);
 return (
 <g key={pct}>
 <line x1={pad.left} x2={pad.left + chartW} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
 <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#64748b">
 {formatVal ? formatVal(yVal) : yVal.toFixed(1)}
 </text>
 </g>
 );
 })}
 {xs.map((d, i) => (
 <text key={i} x={pad.left + i * xStep} y={pad.top + chartH + 14} textAnchor="middle" fontSize={8} fill="#64748b">
 {d.x}
 </text>
 ))}
 {series.map((s) => {
 const points = s.data
 .map((d, i) => {
 const x = pad.left + i * xStep;
 const y = pad.top + chartH - ((d.y - minY) / range) * chartH;
 return `${x},${y}`;
 })
 .join("");
 return (
 <g key={s.label}>
 <polyline points={points} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
 {s.data.map((d, i) => {
 const x = pad.left + i * xStep;
 const y = pad.top + chartH - ((d.y - minY) / range) * chartH;
 return <circle key={i} cx={x} cy={y} r={3} fill={s.color} />;
 })}
 </g>
 );
 })}
 <g>
 {series.map((s, i) => (
 <g key={i} transform={`translate(${pad.left + i * 80}, ${height - 12})`}>
 <rect x={0} y={-6} width={12} height={3} fill={s.color} rx={1} />
 <text x={16} y={0} fontSize={8} fill="#94a3b8">{s.label}</text>
 </g>
 ))}
 </g>
 </svg>
 );
}

function GaugeChart({ value, min, max, label, color }: { value: number; min: number; max: number; label: string; color: string }) {
 const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
 const angle = -180 + pct * 180;
 const rad = (angle * Math.PI) / 180;
 const cx = 60, cy = 60, r = 44;
 const nx = cx + r * Math.cos(rad);
 const ny = cy + r * Math.sin(rad);

 return (
 <svg viewBox="0 0 120 80" className="w-28 h-20">
 <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1e293b" strokeWidth={10} />
 <path
 d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${nx} ${ny}`}
 fill="none"
 stroke={color}
 strokeWidth={10}
 strokeLinecap="round"
 />
 <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="white" strokeWidth={2} strokeLinecap="round" />
 <circle cx={cx} cy={cy} r={4} fill="white" />
 <text x={cx} y={cy + 18} textAnchor="middle" fontSize={11} fill="white" fontWeight="bold">
 {value.toFixed(2)}
 </text>
 <text x={cx} y={cy + 30} textAnchor="middle" fontSize={7} fill="#64748b">
 {label}
 </text>
 </svg>
 );
}

function PieChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
 const total = slices.reduce((a, b) => a + b.value, 0) || 1;
 const cx = 70, cy = 70, r = 55;
 let cumAngle = -Math.PI / 2;
 const arcs = slices.map((s) => {
 const fraction = s.value / total;
 const startAngle = cumAngle;
 const endAngle = cumAngle + fraction * 2 * Math.PI;
 cumAngle = endAngle;
 const x1 = cx + r * Math.cos(startAngle);
 const y1 = cy + r * Math.sin(startAngle);
 const x2 = cx + r * Math.cos(endAngle);
 const y2 = cy + r * Math.sin(endAngle);
 const large = fraction > 0.5 ? 1 : 0;
 const midAngle = startAngle + (fraction * 2 * Math.PI) / 2;
 const lx = cx + (r + 14) * Math.cos(midAngle);
 const ly = cy + (r + 14) * Math.sin(midAngle);
 return { ...s, x1, y1, x2, y2, large, lx, ly, pct: (fraction * 100).toFixed(0) };
 });

 return (
 <svg viewBox="0 0 200 140" className="w-full max-w-[200px]">
 {arcs.map((a, i) => (
 <g key={i}>
 <path d={`M ${cx} ${cy} L ${a.x1} ${a.y1} A ${r} ${r} 0 ${a.large} 1 ${a.x2} ${a.y2} Z`} fill={a.color} opacity={0.85} />
 {parseFloat(a.pct) > 8 && (
 <text x={a.lx} y={a.ly} textAnchor="middle" fontSize={7} fill="white">{a.pct}%</text>
 )}
 </g>
 ))}
 <g transform="translate(0, 100)">
 {arcs.map((a, i) => (
 <g key={i} transform={`translate(${i * 48}, 0)`}>
 <rect x={0} y={0} width={8} height={8} fill={a.color} rx={1} />
 <text x={11} y={7} fontSize={7} fill="#94a3b8">{a.label}</text>
 </g>
 ))}
 </g>
 </svg>
 );
}

function StackedBarChart({
 data,
 width = 500,
 height = 200,
}: {
 data: { label: string; segments: { name: string; value: number; color: string }[] }[];
 width?: number;
 height?: number;
}) {
 const totals = data.map((d) => d.segments.reduce((a, s) => a + s.value, 0));
 const max = Math.max(...totals) || 1;
 const pad = { top: 16, right: 16, bottom: 36, left: 52 };
 const chartW = width - pad.left - pad.right;
 const chartH = height - pad.top - pad.bottom;
 const barW = (chartW / data.length) * 0.55;
 const gap = chartW / data.length;

 return (
 <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
 {[0, 0.5, 1].map((pct) => {
 const y = pad.top + chartH * (1 - pct);
 return (
 <g key={pct}>
 <line x1={pad.left} x2={pad.left + chartW} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
 <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#64748b">
 {(max * pct).toFixed(0)}
 </text>
 </g>
 );
 })}
 {data.map((d, i) => {
 const x = pad.left + i * gap + gap / 2 - barW / 2;
 let yOff = 0;
 return (
 <g key={i}>
 {d.segments.map((seg, j) => {
 const h = (seg.value / max) * chartH;
 const y = pad.top + chartH - yOff - h;
 yOff += h;
 return <rect key={j} x={x} y={y} width={barW} height={Math.max(0, h)} fill={seg.color} opacity={0.85} rx={j === 0 ? 2 : 0} />;
 })}
 <text x={x + barW / 2} y={pad.top + chartH + 14} textAnchor="middle" fontSize={8} fill="#64748b">{d.label}</text>
 </g>
 );
 })}
 <g>
 {(data[0]?.segments ?? []).map((seg, i) => (
 <g key={i} transform={`translate(${pad.left + i * 70}, ${height - 10})`}>
 <rect x={0} y={-6} width={10} height={6} fill={seg.color} rx={1} />
 <text x={13} y={0} fontSize={7} fill="#94a3b8">{seg.name}</text>
 </g>
 ))}
 </g>
 </svg>
 );
}

function BenfordChart({ data }: { data: number[] }) {
 const counts = Array.from({ length: 9 }, (_, i) => i + 1).map((d) => {
 const cnt = data.filter((v) => {
 const str = Math.abs(v).toString().replace(".", "");
 const first = str.replace(/^0+/, "")[0];
 return first === String(d);
 }).length;
 return { digit: d, actual: data.length > 0 ? cnt / data.length : 0, expected: Math.log10(1 + 1 / d) };
 });

 const max = 0.35;
 const pad = { top: 16, right: 16, bottom: 32, left: 40 };
 const width = 380, height = 180;
 const chartW = width - pad.left - pad.right;
 const chartH = height - pad.top - pad.bottom;
 const gap = chartW / 9;
 const barW = gap * 0.35;

 return (
 <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
 {[0, 0.1, 0.2, 0.3].map((v) => {
 const y = pad.top + chartH * (1 - v / max);
 return (
 <g key={v}>
 <line x1={pad.left} x2={pad.left + chartW} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
 <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={7} fill="#64748b">{(v * 100).toFixed(0)}%</text>
 </g>
 );
 })}
 {counts.map((c, i) => {
 const x = pad.left + i * gap + gap / 2;
 const actH = (c.actual / max) * chartH;
 const expH = (c.expected / max) * chartH;
 const actY = pad.top + chartH - actH;
 const expY = pad.top + chartH - expH;
 const deviation = Math.abs(c.actual - c.expected) > 0.04;
 return (
 <g key={i}>
 <rect x={x - barW - 1} y={actY} width={barW} height={actH} fill={deviation ? "#ef4444" : "#6366f1"} opacity={0.8} rx={1} />
 <rect x={x + 1} y={expY} width={barW} height={expH} fill="#22c55e" opacity={0.5} rx={1} />
 <text x={x} y={pad.top + chartH + 12} textAnchor="middle" fontSize={8} fill="#64748b">{c.digit}</text>
 </g>
 );
 })}
 <g transform={`translate(${pad.left}, ${height - 10})`}>
 <rect x={0} y={-6} width={8} height={6} fill="#6366f1" rx={1} />
 <text x={11} y={0} fontSize={7} fill="#94a3b8">Actual</text>
 <rect x={50} y={-6} width={8} height={6} fill="#22c55e" opacity={0.6} rx={1} />
 <text x={61} y={0} fontSize={7} fill="#94a3b8">Benford</text>
 <rect x={110} y={-6} width={8} height={6} fill="#ef4444" rx={1} />
 <text x={121} y={0} fontSize={7} fill="#94a3b8">Anomaly</text>
 </g>
 </svg>
 );
}

// ── Sorting helper ─────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";

// ── Color helpers ──────────────────────────────────────────────────────────────

function scoreColor(s: number) {
 if (s >= 70) return "text-emerald-400";
 if (s >= 45) return "text-amber-400";
 return "text-red-400";
}

function metricColor(v: number, good: "high" | "low") {
 if (good === "high") {
 if (v >= 20) return "text-emerald-400";
 if (v >= 10) return "text-amber-400";
 return "text-red-400";
 } else {
 if (v <= 1) return "text-emerald-400";
 if (v <= 2) return "text-amber-400";
 return "text-red-400";
 }
}

// ── Presets ────────────────────────────────────────────────────────────────────

type Preset = {
 name: string;
 icon: React.ReactNode;
 filters: {
 peMin: number; peMax: number;
 revenueGrowthMin: number;
 netMarginMin: number;
 roeMin: number;
 debtMax: number;
 dividendMin: number;
 };
};

const PRESETS: Preset[] = [
 {
 name: "High Quality Growth",
 icon: <Zap size={12} />,
 filters: { peMin: 0, peMax: 60, revenueGrowthMin: 15, netMarginMin: 15, roeMin: 20, debtMax: 2, dividendMin: 0 },
 },
 {
 name: "Value",
 icon: <DollarSign size={12} />,
 filters: { peMin: 0, peMax: 18, revenueGrowthMin: 0, netMarginMin: 5, roeMin: 8, debtMax: 3, dividendMin: 0 },
 },
 {
 name: "Dividend",
 icon: <Award size={12} />,
 filters: { peMin: 0, peMax: 40, revenueGrowthMin: 0, netMarginMin: 8, roeMin: 10, debtMax: 2.5, dividendMin: 2 },
 },
];

// ── Tab 1: Quality Screener ────────────────────────────────────────────────────

function QualityScreener() {
 const [peMin, setPeMin] = useState(0);
 const [peMax, setPeMax] = useState(100);
 const [revenueGrowthMin, setRevenueGrowthMin] = useState(0);
 const [netMarginMin, setNetMarginMin] = useState(0);
 const [roeMin, setRoeMin] = useState(0);
 const [debtMax, setDebtMax] = useState(5);
 const [dividendMin, setDividendMin] = useState(0);
 const [sectorFilter, setSectorFilter] = useState("All");
 const [searchQ, setSearchQ] = useState("");
 const [sortKey, setSortKey] = useState<keyof ScreenerStock>("qualityScore");
 const [sortDir, setSortDir] = useState<SortDir>("desc");
 const [savedScreens, setSavedScreens] = useState<string[]>([]);
 const [exportMsg, setExportMsg] = useState("");

 const applyPreset = useCallback((p: Preset) => {
 setPeMin(p.filters.peMin);
 setPeMax(p.filters.peMax);
 setRevenueGrowthMin(p.filters.revenueGrowthMin);
 setNetMarginMin(p.filters.netMarginMin);
 setRoeMin(p.filters.roeMin);
 setDebtMax(p.filters.debtMax);
 setDividendMin(p.filters.dividendMin);
 }, []);

 const filtered = useMemo(() => {
 return ALL_STOCKS.filter((s) => {
 if (s.peRatio < peMin || s.peRatio > peMax) return false;
 if (s.revenueGrowth < revenueGrowthMin) return false;
 if (s.netMargin < netMarginMin) return false;
 if (s.roe < roeMin) return false;
 if (s.debtEquity > debtMax) return false;
 if (s.dividendYield < dividendMin) return false;
 if (sectorFilter !== "All" && s.sector !== sectorFilter) return false;
 if (searchQ && !s.ticker.toLowerCase().includes(searchQ.toLowerCase()) && !s.company.toLowerCase().includes(searchQ.toLowerCase()))
 return false;
 return true;
 });
 }, [peMin, peMax, revenueGrowthMin, netMarginMin, roeMin, debtMax, dividendMin, sectorFilter, searchQ]);

 const sorted = useMemo(() => {
 return [...filtered].sort((a, b) => {
 const av = a[sortKey] as number;
 const bv = b[sortKey] as number;
 return sortDir === "asc" ? av - bv : bv - av;
 });
 }, [filtered, sortKey, sortDir]);

 function toggleSort(k: keyof ScreenerStock) {
 if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 else { setSortKey(k); setSortDir("desc"); }
 }

 function SortIcon({ k }: { k: keyof ScreenerStock }) {
 if (sortKey !== k) return <ChevronDown size={10} className="opacity-30" />;
 return sortDir === "desc" ? <ChevronDown size={10} className="text-indigo-400" /> : <ChevronUp size={10} className="text-indigo-400" />;
 }

 const handleExport = () => {
 setExportMsg(`${sorted.length} stocks added to watchlist`);
 setTimeout(() => setExportMsg(""), 2000);
 };

 const handleSave = () => {
 const name = `Screen ${savedScreens.length + 1}`;
 setSavedScreens((prev) => [...prev, name]);
 };

 return (
 <div className="space-y-4">
 {/* Presets */}
 <div className="flex gap-2 flex-wrap">
 {PRESETS.map((p) => (
 <button
 key={p.name}
 onClick={() => applyPreset(p)}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border hover:border-indigo-500 rounded-lg text-xs text-muted-foreground transition-colors"
 >
 {p.icon}
 {p.name}
 </button>
 ))}
 {savedScreens.map((name) => (
 <span key={name} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950 border border-indigo-700 rounded-lg text-xs text-indigo-300">
 <Bookmark size={10} />
 {name}
 </span>
 ))}
 </div>

 {/* Filters */}
 <div className="bg-card border border-border rounded-md p-4">
 <div className="flex items-center gap-2 mb-3">
 <Filter size={14} className="text-muted-foreground" />
 <span className="text-sm font-medium text-muted-foreground">Filters</span>
 <span className="ml-auto text-xs text-muted-foreground">{sorted.length} / {ALL_STOCKS.length} stocks</span>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">P/E Range</label>
 <div className="flex gap-1">
 <input type="number" value={peMin} onChange={(e) => setPeMin(+e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground" placeholder="Min" />
 <input type="number" value={peMax} onChange={(e) => setPeMax(+e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground" placeholder="Max" />
 </div>
 </div>
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">Rev Growth Min %</label>
 <input type="number" value={revenueGrowthMin} onChange={(e) => setRevenueGrowthMin(+e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground" />
 </div>
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">Net Margin Min %</label>
 <input type="number" value={netMarginMin} onChange={(e) => setNetMarginMin(+e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground" />
 </div>
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">ROE Min %</label>
 <input type="number" value={roeMin} onChange={(e) => setRoeMin(+e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground" />
 </div>
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">Debt/Equity Max</label>
 <input type="number" value={debtMax} step="0.1" onChange={(e) => setDebtMax(+e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground" />
 </div>
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">Dividend Yield Min %</label>
 <input type="number" value={dividendMin} step="0.1" onChange={(e) => setDividendMin(+e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground" />
 </div>
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">Sector</label>
 <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground">
 <option>All</option>
 {SECTORS.map((s) => <option key={s}>{s}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">Search</label>
 <div className="relative">
 <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Ticker / Name" className="w-full bg-muted border border-border rounded pl-6 pr-2 py-1 text-xs text-foreground" />
 </div>
 </div>
 </div>
 <div className="flex gap-2 mt-3">
 <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs text-foreground transition-colors">
 <Download size={12} />
 Export to Watchlist
 </button>
 <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border hover:border-border rounded-lg text-xs text-muted-foreground transition-colors">
 <Bookmark size={12} />
 Save Screen
 </button>
 {exportMsg && <span className="text-xs text-emerald-400 self-center">{exportMsg}</span>}
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead className="bg-card border-b border-border sticky top-0">
 <tr>
 {([
 ["ticker", "Ticker"],
 ["sector", "Sector"],
 ["qualityScore", "Quality"],
 ["peRatio", "P/E"],
 ["forwardPE", "Fwd P/E"],
 ["revenueGrowth", "Rev Gr%"],
 ["netMargin", "Net Mgn%"],
 ["roe", "ROE%"],
 ["debtEquity", "D/E"],
 ["dividendYield", "Div%"],
 ["fcfYield", "FCF Yld%"],
 ["marketCap", "MktCap$B"],
 ] as [keyof ScreenerStock, string][]).map(([k, label]) => (
 <th
 key={k}
 onClick={() => k !== "ticker" && k !== "sector" && toggleSort(k as keyof ScreenerStock)}
 className="px-3 py-2 text-left text-muted-foreground font-medium cursor-pointer hover:text-foreground whitespace-nowrap"
 >
 <span className="inline-flex items-center gap-1">
 {label}
 {k !== "ticker" && k !== "sector" && <SortIcon k={k as keyof ScreenerStock} />}
 </span>
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
 transition={{ delay: i * 0.015 }}
 className="border-b border-border/60 hover:bg-muted/40 transition-colors"
 >
 <td className="px-3 py-2 font-mono font-semibold text-foreground">{stock.ticker}</td>
 <td className="px-3 py-2 text-muted-foreground">{stock.sector}</td>
 <td className="px-3 py-2">
 <span className={cn("font-semibold", scoreColor(stock.qualityScore))}>{stock.qualityScore}</span>
 <div className="w-12 h-1 bg-muted rounded-full mt-0.5">
 <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stock.qualityScore}%` }} />
 </div>
 </td>
 <td className="px-3 py-2 text-muted-foreground">{stock.peRatio}×</td>
 <td className="px-3 py-2 text-muted-foreground">{stock.forwardPE}×</td>
 <td className={cn("px-3 py-2 font-medium", stock.revenueGrowth >= 15 ? "text-emerald-400" : stock.revenueGrowth >= 5 ? "text-amber-400" : "text-red-400")}>{stock.revenueGrowth}%</td>
 <td className={cn("px-3 py-2", metricColor(stock.netMargin, "high"))}>{stock.netMargin}%</td>
 <td className={cn("px-3 py-2", metricColor(stock.roe, "high"))}>{stock.roe}%</td>
 <td className={cn("px-3 py-2", metricColor(stock.debtEquity, "low"))}>{stock.debtEquity}</td>
 <td className="px-3 py-2 text-muted-foreground">{stock.dividendYield > 0 ? `${stock.dividendYield}%` : "—"}</td>
 <td className="px-3 py-2 text-muted-foreground">{stock.fcfYield}%</td>
 <td className="px-3 py-2 text-muted-foreground">${stock.marketCap}B</td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 {sorted.length === 0 && (
 <div className="text-center py-10 text-muted-foreground text-sm">No stocks match the current filters.</div>
 )}
 </div>
 </div>
 );
}

// ── Tab 2: Income Statement Analyzer ──────────────────────────────────────────

function IncomeStatementAnalyzer() {
 const [ticker, setTicker] = useState("AAPL");
 const data = useMemo(() => generateIncomeStatement(ticker), [ticker]);

 const revData = data.map((d) => ({ label: String(d.year), value: d.revenue }));
 const growthRates = data.map((d, i) =>
 i === 0 ? 0 : +((d.revenue / data[i - 1].revenue - 1) * 100).toFixed(1)
 );

 const marginSeries = [
 {
 label: "Gross Margin",
 color: "#6366f1",
 data: data.map((d) => ({ x: String(d.year), y: +((d.grossProfit / d.revenue) * 100).toFixed(1) })),
 },
 {
 label: "Operating Margin",
 color: "#22c55e",
 data: data.map((d) => ({ x: String(d.year), y: +((d.operatingIncome / d.revenue) * 100).toFixed(1) })),
 },
 {
 label: "Net Margin",
 color: "#f59e0b",
 data: data.map((d) => ({ x: String(d.year), y: +((d.netIncome / d.revenue) * 100).toFixed(1) })),
 },
 ];

 const epsSeries = [
 { label: "GAAP EPS", color: "#6366f1", data: data.map((d) => ({ x: String(d.year), y: d.epsGaap })) },
 { label: "Adj EPS", color: "#22c55e", data: data.map((d) => ({ x: String(d.year), y: d.epsAdj })) },
 ];

 // Segment data (synthetic)
 resetSeed(ticker.charCodeAt(0) * 11 + 5);
 const segments = ["Core Product", "Services", "Cloud", "Other"].map((name, i) => ({
 name,
 color: ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"][i],
 }));

 const segmentData = data.map((d) => {
 resetSeed(d.year + ticker.charCodeAt(0));
 const parts = segments.map(() => rand());
 const total = parts.reduce((a, b) => a + b, 0);
 return {
 label: String(d.year),
 segments: segments.map((seg, i) => ({
 name: seg.name,
 value: +(d.revenue * (parts[i] / total)).toFixed(1),
 color: seg.color,
 })),
 };
 });

 // Revenue quality
 resetSeed(ticker.charCodeAt(0) * 19 + 3);
 const recurringPct = 50 + rand() * 40;

 return (
 <div className="space-y-4">
 {/* Ticker selector */}
 <div className="flex gap-2 flex-wrap">
 {INCOME_TICKERS.map((t) => (
 <button
 key={t}
 onClick={() => setTicker(t)}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-mono font-medium transition-colors",
 ticker === t
 ? "bg-indigo-600 text-foreground"
 : "bg-muted border border-border text-muted-foreground hover:text-foreground"
 )}
 >
 {t}
 </button>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* Revenue Trend */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-semibold text-foreground mb-1">Revenue Trend ($B)</h3>
 <p className="text-xs text-muted-foreground mb-3">5-year top-line growth</p>
 <BarChart data={revData} height={180} color="#6366f1" formatVal={(v) => `$${v.toFixed(0)}`} />
 <div className="flex gap-2 mt-2">
 {growthRates.slice(1).map((g, i) => (
 <span key={i} className={cn("text-xs px-2 py-0.5 rounded-full", g >= 0 ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400")}>
 {g >= 0 ? "+" : ""}{g}%
 </span>
 ))}
 </div>
 </div>

 {/* Margin Trends */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-semibold text-foreground mb-1">Margin Trends</h3>
 <p className="text-xs text-muted-foreground mb-3">Gross / Operating / Net (%)</p>
 <LineChart series={marginSeries} height={180} formatVal={(v) => `${v.toFixed(0)}%`} />
 </div>

 {/* EPS Growth */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-semibold text-foreground mb-1">EPS Growth</h3>
 <p className="text-xs text-muted-foreground mb-3">GAAP vs Adjusted EPS</p>
 <LineChart series={epsSeries} height={180} formatVal={(v) => `$${v.toFixed(2)}`} />
 <div className="mt-3 p-3 bg-muted/60 rounded-lg">
 <p className="text-xs text-muted-foreground">
 <span className="text-amber-400 font-medium">Adj vs GAAP spread: </span>
 {((data[4].epsAdj / data[4].epsGaap - 1) * 100).toFixed(1)}% — higher spread may indicate aggressive non-GAAP adjustments.
 </p>
 </div>
 </div>

 {/* Revenue Quality */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Revenue Quality</h3>
 <p className="text-xs text-muted-foreground mb-3">Recurring vs one-time revenue breakdown</p>
 <div className="flex items-center gap-4 mt-4">
 <PieChart slices={[
 { label: "Recurring", value: recurringPct, color: "#6366f1" },
 { label: "One-time", value: 100 - recurringPct, color: "#f59e0b" },
 ]} />
 <div className="space-y-2">
 <div className="p-3 bg-muted rounded-lg">
 <p className="text-xs text-muted-foreground">Recurring Revenue</p>
 <p className="text-xl font-medium text-indigo-400">{recurringPct.toFixed(1)}%</p>
 <p className="text-xs text-muted-foreground mt-1">
 {recurringPct >= 60 ? "High quality — predictable, sticky revenue" : recurringPct >= 40 ? "Moderate — mix of recurring and project-based" : "Lower quality — more one-time transactional"}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Segment Analysis */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Segment Revenue Breakdown ($B)</h3>
 <p className="text-xs text-muted-foreground mb-3">Revenue by business segment — 5 years</p>
 <StackedBarChart data={segmentData} height={200} />
 </div>
 </div>
 );
}

// ── Tab 3: Balance Sheet Health ────────────────────────────────────────────────

function BalanceSheetHealth() {
 const [ticker, setTicker] = useState("AAPL");
 const data = useMemo(() => generateBalanceSheet(ticker), [ticker]);
 const latest = data[data.length - 1];

 const currentRatio = +(latest.currentAssets / latest.currentLiabilities).toFixed(2);
 const quickRatio = +((latest.currentAssets - latest.currentAssets * 0.15) / latest.currentLiabilities).toFixed(2);
 const cashRatio = +(latest.cash / latest.currentLiabilities).toFixed(2);

 const goodwillPct = +((latest.goodwill / latest.totalAssets) * 100).toFixed(1);
 const intangiblesPct = +(((latest.goodwill + latest.intangibles) / latest.totalAssets) * 100).toFixed(1);

 // Debt maturity schedule
 resetSeed(ticker.charCodeAt(0) * 37 + 11);
 const debtMaturity = [2025, 2026, 2027, 2028, 2029].map((y) => ({
 label: String(y),
 value: +(latest.totalDebt * (0.05 + rand() * 0.3)).toFixed(1),
 }));

 // Net debt / EBITDA trend
 const netDebtEbitda = data.map((d) => {
 const netDebt = d.totalDebt - d.cash;
 const ebitda = d.equity * 0.25 + rand() * 5;
 return { x: String(d.year), y: +(netDebt / ebitda).toFixed(2) };
 });

 // Working capital
 const dso = +((latest.currentAssets * 0.3) / (latest.totalAssets * 0.15) * 30).toFixed(0);
 const dio = +((latest.currentAssets * 0.1) / (latest.totalAssets * 0.08) * 30).toFixed(0);
 const dpo = +((latest.currentLiabilities * 0.4) / (latest.totalAssets * 0.12) * 30).toFixed(0);
 const ccc = dso + dio - dpo;

 return (
 <div className="space-y-4">
 {/* Ticker */}
 <div className="flex gap-2 flex-wrap">
 {INCOME_TICKERS.map((t) => (
 <button key={t} onClick={() => setTicker(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors", ticker === t ? "bg-indigo-600 text-foreground" : "bg-muted border border-border text-muted-foreground hover:text-foreground")}>
 {t}
 </button>
 ))}
 </div>

 {/* Liquidity Gauges */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Liquidity Ratios</h3>
 <p className="text-xs text-muted-foreground mb-4">Current, Quick, Cash ratio — higher is stronger</p>
 <div className="flex gap-3 flex-wrap justify-center">
 <div className="text-center">
 <GaugeChart value={currentRatio} min={0} max={4} label="Current" color={currentRatio >= 1.5 ? "#22c55e" : currentRatio >= 1 ? "#f59e0b" : "#ef4444"} />
 <p className="text-xs text-muted-foreground mt-1">Current ≥ 1.5 healthy</p>
 </div>
 <div className="text-center">
 <GaugeChart value={quickRatio} min={0} max={3} label="Quick" color={quickRatio >= 1 ? "#22c55e" : quickRatio >= 0.7 ? "#f59e0b" : "#ef4444"} />
 <p className="text-xs text-muted-foreground mt-1">Quick ≥ 1.0 healthy</p>
 </div>
 <div className="text-center">
 <GaugeChart value={cashRatio} min={0} max={2} label="Cash" color={cashRatio >= 0.5 ? "#22c55e" : cashRatio >= 0.2 ? "#f59e0b" : "#ef4444"} />
 <p className="text-xs text-muted-foreground mt-1">Cash ≥ 0.5 healthy</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* Debt Maturity Schedule */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Debt Maturity Schedule ($B)</h3>
 <p className="text-xs text-muted-foreground mb-3">Principal maturities by year — refinancing risk</p>
 <BarChart data={debtMaturity} height={180} color="#f59e0b" formatVal={(v) => `$${v.toFixed(1)}`} />
 <p className="text-xs text-muted-foreground mt-2">
 Total debt: <span className="text-foreground font-medium">${latest.totalDebt.toFixed(1)}B</span> — watch for back-loaded maturities.
 </p>
 </div>

 {/* Net Debt / EBITDA */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Net Debt / EBITDA Trend</h3>
 <p className="text-xs text-muted-foreground mb-3">Leverage trajectory — lower is safer</p>
 <LineChart series={[{ label: "Net D/EBITDA", color: "#ec4899", data: netDebtEbitda }]} height={180} formatVal={(v) => v.toFixed(2)} />
 <div className="flex gap-2 mt-2">
 <span className="text-xs px-2 py-0.5 bg-emerald-900/40 text-emerald-400 rounded-full">≤2× safe</span>
 <span className="text-xs px-2 py-0.5 bg-amber-900/40 text-amber-400 rounded-full">2–4× watch</span>
 <span className="text-xs px-2 py-0.5 bg-red-900/40 text-red-400 rounded-full">&gt;4× risky</span>
 </div>
 </div>
 </div>

 {/* Working Capital */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Working Capital Efficiency</h3>
 <p className="text-xs text-muted-foreground mb-4">Cash Conversion Cycle — lower CCC = more efficient cash management</p>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 { label: "Days Sales Outstanding", value: dso, unit: "days", desc: "Time to collect payment", good: "low" as const },
 { label: "Days Inventory Outstanding", value: dio, unit: "days", desc: "Time to sell inventory", good: "low" as const },
 { label: "Days Payable Outstanding", value: dpo, unit: "days", desc: "Time to pay suppliers", good: "high" as const },
 { label: "Cash Conversion Cycle", value: ccc, unit: "days", desc: "DSO + DIO − DPO", good: "low" as const },
 ].map((m) => (
 <div key={m.label} className="p-3 bg-muted rounded-md">
 <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
 <p className={cn("text-2xl font-semibold", m.good === "low" ? (m.value < 40 ? "text-emerald-400" : m.value < 70 ? "text-amber-400" : "text-red-400") : (m.value > 45 ? "text-emerald-400" : m.value > 25 ? "text-amber-400" : "text-red-400"))}>
 {m.value}
 </p>
 <p className="text-xs text-muted-foreground">{m.unit}</p>
 <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Goodwill & Intangibles */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Goodwill & Intangibles Risk</h3>
 <p className="text-xs text-muted-foreground mb-4">High goodwill as % of assets signals M&A integration risk and potential impairment</p>
 <div className="flex items-center gap-3 flex-wrap">
 <div className="flex-1 min-w-[200px]">
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className="text-muted-foreground">Goodwill</span>
 <span className={cn("font-medium", goodwillPct > 30 ? "text-red-400" : goodwillPct > 15 ? "text-amber-400" : "text-emerald-400")}>{goodwillPct}%</span>
 </div>
 <div className="h-2 bg-muted rounded-full">
 <div className={cn("h-full rounded-full", goodwillPct > 30 ? "bg-red-500" : goodwillPct > 15 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(goodwillPct, 100)}%` }} />
 </div>
 <div className="flex justify-between text-xs text-muted-foreground mb-1 mt-2">
 <span className="text-muted-foreground">Total Intangibles</span>
 <span className={cn("font-medium", intangiblesPct > 40 ? "text-red-400" : intangiblesPct > 20 ? "text-amber-400" : "text-emerald-400")}>{intangiblesPct}%</span>
 </div>
 <div className="h-2 bg-muted rounded-full">
 <div className={cn("h-full rounded-full", intangiblesPct > 40 ? "bg-red-500" : intangiblesPct > 20 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(intangiblesPct, 100)}%` }} />
 </div>
 </div>
 <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground space-y-1">
 <p className="text-muted-foreground font-medium">Goodwill: <span className="text-foreground">${latest.goodwill.toFixed(1)}B</span></p>
 <p className="text-muted-foreground font-medium">Intangibles: <span className="text-foreground">${latest.intangibles.toFixed(1)}B</span></p>
 <p className="text-muted-foreground font-medium">Total Assets: <span className="text-foreground">${latest.totalAssets.toFixed(1)}B</span></p>
 </div>
 </div>
 </div>

 {/* Share Count Trend */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Share Count Trend (Buybacks vs Dilution)</h3>
 <p className="text-xs text-muted-foreground mb-3">Declining share count = shareholder-friendly buybacks; rising = dilution risk</p>
 <LineChart
 series={[{ label: "Shares Outstanding (B)", color: "#6366f1", data: data.map((d) => ({ x: String(d.year), y: d.sharesOutstanding })) }]}
 height={160}
 formatVal={(v) => `${v.toFixed(2)}B`}
 />
 <div className="mt-2 text-xs text-muted-foreground">
 {data[4].sharesOutstanding < data[0].sharesOutstanding
 ? <span className="text-emerald-400">Buyback program: {(((data[0].sharesOutstanding - data[4].sharesOutstanding) / data[0].sharesOutstanding) * 100).toFixed(1)}% shares retired over 5 years</span>
 : <span className="text-amber-400">Share dilution: +{(((data[4].sharesOutstanding - data[0].sharesOutstanding) / data[0].sharesOutstanding) * 100).toFixed(1)}% shares issued over 5 years</span>
 }
 </div>
 </div>
 </div>
 );
}

// ── Tab 4: Cash Flow Analysis ──────────────────────────────────────────────────

function CashFlowAnalysis() {
 const [ticker, setTicker] = useState("AAPL");
 const data = useMemo(() => generateCashFlow(ticker), [ticker]);
 const latest = data[data.length - 1];

 // OCF vs Net Income
 const ocfVsNiSeries = [
 { label: "Operating CF", color: "#6366f1", data: data.map((d) => ({ x: String(d.year), y: d.operatingCF })) },
 { label: "Net Income", color: "#f59e0b", data: data.map((d) => ({ x: String(d.year), y: d.netIncome })) },
 ];

 // FCF margin
 const incomeData = useMemo(() => generateIncomeStatement(ticker), [ticker]);
 const fcfMarginSeries = [{
 label: "FCF Margin",
 color: "#22c55e",
 data: data.map((d, i) => {
 const rev = incomeData[i]?.revenue ?? 1;
 return { x: String(d.year), y: +((d.fcf / rev) * 100).toFixed(1) };
 }),
 }];

 // FCF Yield (FCF per $100 market cap)
 resetSeed(ticker.charCodeAt(0) * 23 + 7);
 const mcap = 200 + rand() * 2000;
 const fcfYieldCurrent = +((latest.fcf / mcap) * 100).toFixed(2);

 // Capital allocation
 const totalAlloc = latest.capex + latest.dividends + latest.buybacks + latest.acquisitions || 1;
 const capAllocSlices = [
 { label: "CapEx", value: latest.capex, color: "#6366f1" },
 { label: "Dividends", value: latest.dividends, color: "#22c55e" },
 { label: "Buybacks", value: latest.buybacks, color: "#f59e0b" },
 { label: "Acquisitions", value: latest.acquisitions, color: "#ec4899" },
 ].filter((s) => s.value > 0);

 // FCF conversion
 const fcfConversion = data.map((d) => +((d.fcf / (d.netIncome || 1)) * 100).toFixed(1));
 const avgFcfConversion = +(fcfConversion.reduce((a, b) => a + b, 0) / fcfConversion.length).toFixed(1);

 // Reinvestment rate
 const reinvestmentRate = data.map((d) => +((d.capex / (d.operatingCF || 1)) * 100).toFixed(1));

 return (
 <div className="space-y-4">
 <div className="flex gap-2 flex-wrap">
 {INCOME_TICKERS.map((t) => (
 <button key={t} onClick={() => setTicker(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors", ticker === t ? "bg-indigo-600 text-foreground" : "bg-muted border border-border text-muted-foreground hover:text-foreground")}>
 {t}
 </button>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* OCF vs Net Income */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Operating CF vs Net Income</h3>
 <p className="text-xs text-muted-foreground mb-3">Divergence signals earnings quality issues</p>
 <LineChart series={ocfVsNiSeries} height={180} formatVal={(v) => `$${v.toFixed(0)}`} />
 <div className="mt-2 p-2 bg-muted/60 rounded-lg">
 <p className="text-xs text-muted-foreground">
 {latest.operatingCF > latest.netIncome
 ? <><span className="text-emerald-400 font-medium">Positive signal:</span> OCF exceeds Net Income — strong earnings quality, cash-rich operations</>
 : <><span className="text-red-400 font-medium">Watch:</span> Net Income exceeds OCF — possible aggressive accruals or one-time items inflating earnings</>
 }
 </p>
 </div>
 </div>

 {/* FCF Margin Trend */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">FCF Margin Trend</h3>
 <p className="text-xs text-muted-foreground mb-3">FCF / Revenue — expanding margin is bullish</p>
 <LineChart series={fcfMarginSeries} height={180} formatVal={(v) => `${v.toFixed(1)}%`} />
 <div className="mt-2 text-xs text-muted-foreground">
 {fcfMarginSeries[0].data[4].y > fcfMarginSeries[0].data[0].y
 ? <span className="text-emerald-400">Expanding FCF margins (+{(fcfMarginSeries[0].data[4].y - fcfMarginSeries[0].data[0].y).toFixed(1)}pp over 5yr)</span>
 : <span className="text-amber-400">Contracting FCF margins ({(fcfMarginSeries[0].data[4].y - fcfMarginSeries[0].data[0].y).toFixed(1)}pp over 5yr)</span>
 }
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* FCF Yield */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">FCF Yield vs Historical</h3>
 <p className="text-xs text-muted-foreground mb-3">FCF / Market Cap — higher = better value proposition</p>
 <div className="flex items-center gap-4 mt-2">
 <div className="text-center">
 <p className="text-lg font-medium text-indigo-400">{fcfYieldCurrent}%</p>
 <p className="text-xs text-muted-foreground mt-1">Current FCF Yield</p>
 <p className="text-xs text-muted-foreground mt-2 px-2 py-1 rounded-full bg-muted">
 {fcfYieldCurrent >= 5 ? <span className="text-emerald-400">Attractive (&ge;5%)</span>
 : fcfYieldCurrent >= 3 ? <span className="text-amber-400">Fair (3–5%)</span>
 : <span className="text-red-400">Expensive (&lt;3%)</span>}
 </p>
 </div>
 <div className="flex-1">
 <LineChart
 series={[{
 label: "FCF Yield",
 color: "#6366f1",
 data: data.map((d, i) => {
 const estMcap = mcap * Math.pow(0.95 + (i / 4) * 0.1, i);
 return { x: String(d.year), y: +((d.fcf / estMcap) * 100).toFixed(2) };
 }),
 }]}
 height={140}
 formatVal={(v) => `${v.toFixed(1)}%`}
 />
 </div>
 </div>
 </div>

 {/* Capital Allocation Pie */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Capital Allocation</h3>
 <p className="text-xs text-muted-foreground mb-3">How management deploys cash — {new Date().getFullYear()} most recent year</p>
 <div className="flex items-center gap-4">
 <PieChart slices={capAllocSlices} />
 <div className="space-y-2">
 {capAllocSlices.map((s) => (
 <div key={s.label} className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
 <span className="text-xs text-muted-foreground">{s.label}: <span className="text-foreground font-medium">${s.value.toFixed(1)}B</span></span>
 </div>
 ))}
 <p className="text-xs text-muted-foreground mt-2">Total deployed: ${totalAlloc.toFixed(1)}B</p>
 </div>
 </div>
 </div>
 </div>

 {/* FCF Conversion & Reinvestment */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">FCF Conversion & Reinvestment Rate</h3>
 <p className="text-xs text-muted-foreground mb-4">FCF Conversion = FCF/Net Income (%); Reinvestment = CapEx/Operating CF (%)</p>
 <div className="grid grid-cols-5 gap-2">
 {data.map((d, i) => (
 <div key={d.year} className="bg-muted rounded-lg p-3 text-center">
 <p className="text-xs text-muted-foreground mb-1">{d.year}</p>
 <p className={cn("text-sm font-medium", fcfConversion[i] >= 80 ? "text-emerald-400" : fcfConversion[i] >= 60 ? "text-amber-400" : "text-red-400")}>{fcfConversion[i]}%</p>
 <p className="text-xs text-muted-foreground">FCF Conv.</p>
 <div className="border-t border-border mt-2 pt-2">
 <p className={cn("text-sm font-medium", reinvestmentRate[i] <= 20 ? "text-emerald-400" : reinvestmentRate[i] <= 40 ? "text-amber-400" : "text-amber-300")}>{reinvestmentRate[i]}%</p>
 <p className="text-xs text-muted-foreground">Reinvest</p>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-3 p-3 bg-muted/60 rounded-lg">
 <p className="text-xs text-muted-foreground">
 <span className="text-foreground font-medium">5yr avg FCF conversion: {avgFcfConversion}%</span> —
 {avgFcfConversion >= 80 ? " excellent earnings quality — cash nearly matches reported profits." :
 avgFcfConversion >= 60 ? " acceptable conversion — some accruals present, watch for deterioration." :
 " low conversion — significant gap between reported earnings and cash generation, investigate accruals."}
 </p>
 </div>
 </div>
 </div>
 );
}

// ── Tab 5: Competitive Analysis ────────────────────────────────────────────────

const MOAT_FACTORS = [
 { key: "pricing", label: "Pricing Power", icon: <DollarSign size={12} />, desc: "Ability to raise prices without losing customers" },
 { key: "switching", label: "Switching Costs", icon: <Shield size={12} />, desc: "Cost/friction for customers to move to competitors" },
 { key: "network", label: "Network Effects", icon: <Activity size={12} />, desc: "Product improves as more people use it" },
 { key: "cost", label: "Cost Advantage", icon: <TrendingDown size={12} />, desc: "Structural cost benefits vs competitors" },
];

function CompetitiveAnalysis() {
 const [ticker, setTicker] = useState("AAPL");
 const competitors = useMemo(() => generateCompetitors(ticker), [ticker]);

 resetSeed(ticker.charCodeAt(0) * 59 + 3);
 const moatScores: Record<string, number> = {
 pricing: Math.floor(rand() * 4),
 switching: Math.floor(rand() * 4),
 network: Math.floor(rand() * 4),
 cost: Math.floor(rand() * 4),
 };
 const totalMoat = Object.values(moatScores).reduce((a, b) => a + b, 0);

 // Historical margin expansion
 const marginHistory = [2020, 2021, 2022, 2023, 2024].map((year, i) => {
 resetSeed(year + ticker.charCodeAt(0) * 7);
 const base = 15 + rand() * 20;
 return { x: String(year), y: +(base + i * (rand() > 0.5 ? 1.2 : -0.4)).toFixed(1) };
 });

 // ESG scores
 const compWithESG = competitors.map((c) => ({
 ...c,
 envScore: Math.floor(30 + Math.random() * 65),
 govScore: Math.floor(40 + Math.random() * 55),
 }));

 const metrics: { key: keyof Competitor; label: string; better: "high" | "low" }[] = [
 { key: "revenueGrowth", label: "Revenue Growth%", better: "high" },
 { key: "grossMargin", label: "Gross Margin%", better: "high" },
 { key: "operatingMargin", label: "Operating Margin%", better: "high" },
 { key: "roe", label: "ROE%", better: "high" },
 { key: "peRatio", label: "P/E Ratio", better: "low" },
 { key: "evEbitda", label: "EV/EBITDA", better: "low" },
 ];

 function rankColor(rank: number, total: number, better: "high" | "low") {
 const effectiveRank = better === "high" ? rank : total - rank - 1;
 if (effectiveRank === 0) return "text-emerald-400 font-medium";
 if (effectiveRank === 1) return "text-amber-400";
 return "text-muted-foreground";
 }

 return (
 <div className="space-y-4">
 <div className="flex gap-2 flex-wrap">
 {INCOME_TICKERS.map((t) => (
 <button key={t} onClick={() => setTicker(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors", ticker === t ? "bg-indigo-600 text-foreground" : "bg-muted border border-border text-muted-foreground hover:text-foreground")}>
 {t}
 </button>
 ))}
 </div>

 {/* Competitor comparison table */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">5-Company Comparison</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">Company</th>
 {metrics.map((m) => (
 <th key={m.key} className="px-3 py-2 text-right text-muted-foreground font-medium whitespace-nowrap">{m.label}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {competitors.map((comp, ci) => {
 return (
 <tr key={comp.ticker} className={cn("border-b border-border/60 hover:bg-muted/30", ci === 0 && "bg-indigo-950/30")}>
 <td className="px-3 py-2">
 <span className={cn("font-mono font-medium", ci === 0 ? "text-indigo-400" : "text-muted-foreground")}>{comp.ticker}</span>
 {ci === 0 && <span className="ml-2 text-xs bg-indigo-900/50 text-indigo-400 px-1.5 py-0.5 rounded">Selected</span>}
 </td>
 {metrics.map((m) => {
 const vals = competitors.map((c) => c[m.key] as number);
 const sorted = [...vals].sort((a, b) => b - a);
 const rank = sorted.indexOf(comp[m.key] as number);
 return (
 <td key={m.key} className={cn("px-3 py-2 text-right", rankColor(rank, competitors.length, m.better))}>
 {(comp[m.key] as number).toFixed(1)}{m.key === "revenueGrowth" || m.key === "grossMargin" || m.key === "operatingMargin" || m.key === "roe" ? "%" : "×"}
 {rank === 0 && m.better === "high" && <span className="ml-1 text-emerald-400">↑</span>}
 {rank === competitors.length - 1 && m.better === "high" && <span className="ml-1 text-red-400">↓</span>}
 </td>
 );
 })}
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* Moat Assessment */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Moat Assessment</h3>
 <p className="text-xs text-muted-foreground mb-4">Competitive advantages scored 0–3 each (12 max)</p>
 <div className="space-y-3">
 {MOAT_FACTORS.map((f) => {
 const score = moatScores[f.key];
 return (
 <div key={f.key}>
 <div className="flex items-center justify-between mb-1">
 <span className="flex items-center gap-1.5 text-xs text-muted-foreground">{f.icon}{f.label}</span>
 <span className={cn("text-xs font-medium", score === 3 ? "text-emerald-400" : score === 2 ? "text-amber-400" : score === 1 ? "text-orange-400" : "text-red-400")}>{score}/3</span>
 </div>
 <div className="flex gap-1">
 {[0, 1, 2].map((n) => (
 <div key={n} className={cn("h-1.5 flex-1 rounded-full", score > n ? (score === 3 ? "bg-emerald-500" : score === 2 ? "bg-amber-500" : "bg-orange-500") : "bg-muted")} />
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
 </div>
 );
 })}
 </div>
 <div className="mt-4 p-3 bg-muted rounded-md">
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Total Moat Score</span>
 <span className={cn("text-xl font-medium", totalMoat >= 9 ? "text-emerald-400" : totalMoat >= 6 ? "text-amber-400" : "text-red-400")}>{totalMoat}/12</span>
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {totalMoat >= 9 ? "Wide moat — durable competitive advantage" : totalMoat >= 6 ? "Narrow moat — some advantages, competitive pressure exists" : "No/minimal moat — commodity business, price-driven competition"}
 </p>
 </div>
 </div>

 {/* Historical Moat Stability */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Historical Margin Stability</h3>
 <p className="text-xs text-muted-foreground mb-3">Operating margin trend — expanding = moat strengthening</p>
 <LineChart
 series={[{ label: "Op Margin", color: "#6366f1", data: marginHistory }]}
 height={160}
 formatVal={(v) => `${v.toFixed(1)}%`}
 />
 <div className="mt-2">
 {marginHistory[4].y > marginHistory[0].y
 ? <p className="text-xs text-emerald-400">Expanding margins (+{(marginHistory[4].y - marginHistory[0].y).toFixed(1)}pp) — moat is strengthening</p>
 : <p className="text-xs text-amber-400">Contracting margins ({(marginHistory[4].y - marginHistory[0].y).toFixed(1)}pp) — moat may be eroding</p>
 }
 </div>
 </div>
 </div>

 {/* ESG Comparison */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">ESG Comparison vs Peers</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">Company</th>
 <th className="px-3 py-2 text-center text-muted-foreground font-medium">Environmental Score</th>
 <th className="px-3 py-2 text-center text-muted-foreground font-medium">Governance Score</th>
 <th className="px-3 py-2 text-center text-muted-foreground font-medium">Overall ESG</th>
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">Bar</th>
 </tr>
 </thead>
 <tbody>
 {compWithESG.map((c, i) => {
 const overall = Math.round((c.envScore + c.govScore) / 2);
 return (
 <tr key={c.ticker} className={cn("border-b border-border/60", i === 0 && "bg-indigo-950/30")}>
 <td className={cn("px-3 py-2 font-mono font-medium", i === 0 ? "text-indigo-400" : "text-muted-foreground")}>{c.ticker}</td>
 <td className="px-3 py-2 text-center text-muted-foreground">{c.envScore}</td>
 <td className="px-3 py-2 text-center text-muted-foreground">{c.govScore}</td>
 <td className={cn("px-3 py-2 text-center font-medium", overall >= 70 ? "text-emerald-400" : overall >= 50 ? "text-amber-400" : "text-red-400")}>{overall}</td>
 <td className="px-3 py-2">
 <div className="w-24 h-1.5 bg-muted rounded-full">
 <div className={cn("h-full rounded-full", overall >= 70 ? "bg-emerald-500" : overall >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${overall}%` }} />
 </div>
 </td>
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

// ── Tab 6: Earnings Quality ────────────────────────────────────────────────────

function EarningsQualityTab() {
 const [ticker, setTicker] = useState("AAPL");
 const data = useMemo(() => generateEarningsQuality(ticker), [ticker]);
 const latest = data[data.length - 1];

 // Accruals ratio
 const accrualsRatios = data.map((d, i) => {
 const avgAssets = i === 0 ? d.totalAssets : (d.totalAssets + data[i - 1].totalAssets) / 2;
 return +((d.netIncome - d.fcf) / avgAssets).toFixed(3);
 });
 const avgAccruals = +(accrualsRatios.reduce((a, b) => a + b, 0) / accrualsRatios.length).toFixed(3);

 // AR days increase (red flag if growing faster than revenue)
 const arGrowth = data.map((d, i) => i === 0 ? 0 : +((d.accountsReceivable / data[i - 1].accountsReceivable - 1) * 100).toFixed(1));
 const revGrowth = data.map((d, i) => i === 0 ? 0 : +((d.revenue / data[i - 1].revenue - 1) * 100).toFixed(1));

 // Inventory vs Revenue growth
 const invGrowth = data.map((d, i) => i === 0 ? 0 : +((d.inventory / data[i - 1].inventory - 1) * 100).toFixed(1));

 // Channel stuffing signal
 const channelStuffingFlags = data.slice(1).map((_, i) => {
 const arFaster = arGrowth[i + 1] > revGrowth[i + 1] + 5;
 const invFaster = invGrowth[i + 1] > revGrowth[i + 1] + 5;
 return { year: data[i + 1].year, arFaster, invFaster, flag: arFaster && invFaster };
 });

 // Related party / Auditor (synthetic)
 resetSeed(ticker.charCodeAt(0) * 83 + 17);
 const hasRelatedParty = rand() < 0.3;
 const auditorYears = Math.floor(3 + rand() * 12);
 const auditorOpinion = rand() < 0.85 ? "Clean (Unqualified)" : "Modified — Going Concern Note";
 const isClean = auditorOpinion.startsWith("Clean");

 // Benford's Law data
 const benfordValues = data.flatMap((d) => [
 d.revenue, d.netIncome, d.fcf, d.accountsReceivable, d.inventory, d.totalAssets, d.deferredRevenue,
 ]).filter((v) => v > 0);

 return (
 <div className="space-y-4">
 <div className="flex gap-2 flex-wrap">
 {INCOME_TICKERS.map((t) => (
 <button key={t} onClick={() => setTicker(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors", ticker === t ? "bg-indigo-600 text-foreground" : "bg-muted border border-border text-muted-foreground hover:text-foreground")}>
 {t}
 </button>
 ))}
 </div>

 {/* Summary Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-card border border-border rounded-md p-3">
 <p className="text-xs text-muted-foreground">Avg Accruals Ratio</p>
 <p className={cn("text-xl font-medium mt-1", Math.abs(avgAccruals) < 0.03 ? "text-emerald-400" : Math.abs(avgAccruals) < 0.07 ? "text-amber-400" : "text-red-400")}>{avgAccruals}</p>
 <p className="text-xs text-muted-foreground mt-1">{Math.abs(avgAccruals) < 0.03 ? "High quality" : Math.abs(avgAccruals) < 0.07 ? "Moderate" : "Low quality"}</p>
 </div>
 <div className="bg-card border border-border rounded-md p-3">
 <p className="text-xs text-muted-foreground">Channel Stuffing Flags</p>
 <p className={cn("text-xl font-medium mt-1", channelStuffingFlags.filter((f) => f.flag).length === 0 ? "text-emerald-400" : "text-red-400")}>
 {channelStuffingFlags.filter((f) => f.flag).length}
 </p>
 <p className="text-xs text-muted-foreground mt-1">of {channelStuffingFlags.length} years</p>
 </div>
 <div className="bg-card border border-border rounded-md p-3">
 <p className="text-xs text-muted-foreground">Auditor Opinion</p>
 <div className="flex items-center gap-1.5 mt-1">
 {isClean ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-red-400" />}
 <p className={cn("text-xs font-medium", isClean ? "text-emerald-400" : "text-red-400")}>{isClean ? "Clean" : "Modified"}</p>
 </div>
 <p className="text-xs text-muted-foreground mt-1">Same auditor {auditorYears}yr</p>
 </div>
 <div className="bg-card border border-border rounded-md p-3">
 <p className="text-xs text-muted-foreground">Related Party Risk</p>
 <div className="flex items-center gap-1.5 mt-1">
 {!hasRelatedParty ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
 <p className={cn("text-xs font-medium", !hasRelatedParty ? "text-emerald-400" : "text-amber-400")}>{hasRelatedParty ? "Disclosed" : "None detected"}</p>
 </div>
 <p className="text-xs text-muted-foreground mt-1">5yr scan</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* Accruals Ratio Trend */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Accruals Ratio Trend</h3>
 <p className="text-xs text-muted-foreground mb-3">(Net Income − FCF) / Avg Assets — lower = higher quality earnings</p>
 <LineChart
 series={[{ label: "Accruals Ratio", color: "#f59e0b", data: data.map((d, i) => ({ x: String(d.year), y: accrualsRatios[i] })) }]}
 height={160}
 formatVal={(v) => v.toFixed(3)}
 />
 <div className="flex gap-2 mt-2">
 <span className="text-xs px-2 py-0.5 bg-emerald-900/40 text-emerald-400 rounded-full">|x| &lt; 0.03 high quality</span>
 <span className="text-xs px-2 py-0.5 bg-red-900/40 text-red-400 rounded-full">|x| &gt; 0.07 concern</span>
 </div>
 </div>

 {/* AR & Revenue Growth */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Revenue Recognition Red Flags</h3>
 <p className="text-xs text-muted-foreground mb-3">AR days growing faster than revenue = aggressive recognition risk</p>
 <LineChart
 series={[
 { label: "AR Growth%", color: "#ef4444", data: data.slice(1).map((d, i) => ({ x: String(d.year), y: arGrowth[i + 1] })) },
 { label: "Revenue Growth%", color: "#22c55e", data: data.slice(1).map((d, i) => ({ x: String(d.year), y: revGrowth[i + 1] })) },
 ]}
 height={160}
 formatVal={(v) => `${v.toFixed(1)}%`}
 />
 <div className="mt-2 text-xs text-muted-foreground">
 <Info size={11} className="inline mr-1" />
 Red flag: AR growth consistently exceeds revenue growth by &gt;5pp
 </div>
 </div>
 </div>

 {/* Channel Stuffing Signal */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Channel Stuffing Detection</h3>
 <p className="text-xs text-muted-foreground mb-4">Triggered when both AR and Inventory grow significantly faster than Revenue</p>
 <div className="grid grid-cols-4 gap-2">
 {channelStuffingFlags.map((yr) => (
 <div key={yr.year} className={cn("p-3 rounded-md border", yr.flag ? "border-red-700 bg-red-950/30" : "border-border bg-card")}>
 <p className="text-xs text-muted-foreground mb-1">{yr.year}</p>
 <div className="space-y-1">
 <div className="flex items-center gap-1.5">
 {yr.arFaster ? <AlertTriangle size={10} className="text-red-400" /> : <CheckCircle size={10} className="text-emerald-400" />}
 <span className={cn("text-xs", yr.arFaster ? "text-red-400" : "text-muted-foreground")}>AR spike</span>
 </div>
 <div className="flex items-center gap-1.5">
 {yr.invFaster ? <AlertTriangle size={10} className="text-amber-400" /> : <CheckCircle size={10} className="text-emerald-400" />}
 <span className={cn("text-xs", yr.invFaster ? "text-amber-400" : "text-muted-foreground")}>Inv spike</span>
 </div>
 {yr.flag && <p className="text-xs text-red-400 font-medium mt-1">FLAG</p>}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Auditor Detail */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">Auditor Assessment</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-3 bg-muted rounded-md">
 <p className="text-xs text-muted-foreground mb-1">Auditor Opinion</p>
 <div className="flex items-center gap-2">
 {isClean ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-red-400" />}
 <span className={cn("text-sm font-medium", isClean ? "text-emerald-400" : "text-red-400")}>{auditorOpinion}</span>
 </div>
 </div>
 <div className="p-3 bg-muted rounded-md">
 <p className="text-xs text-muted-foreground mb-1">Auditor Tenure</p>
 <p className="text-xl font-medium text-foreground">{auditorYears} years</p>
 <p className="text-xs text-muted-foreground">{auditorYears > 10 ? "Long tenure — risk of familiarity bias" : "Reasonable tenure"}</p>
 </div>
 <div className="p-3 bg-muted rounded-md">
 <p className="text-xs text-muted-foreground mb-1">Deferred Revenue (latest)</p>
 <p className="text-xl font-medium text-foreground">${latest.deferredRevenue.toFixed(1)}B</p>
 <p className="text-xs text-muted-foreground">
 {(latest.deferredRevenue / latest.revenue * 100).toFixed(1)}% of revenue — {latest.deferredRevenue / latest.revenue > 0.05 ? "elevated, watch for recognition timing" : "normal levels"}
 </p>
 </div>
 </div>
 </div>

 {/* Benford's Law */}
 <div className="bg-card border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Benford's Law — First Digit Analysis</h3>
 <p className="text-xs text-muted-foreground mb-4">
 Natural financial data follows Benford's distribution. Red bars (actual) diverging significantly from green (expected) can indicate data manipulation.
 </p>
 <BenfordChart data={benfordValues} />
 <div className="mt-3 p-3 bg-muted/60 rounded-lg">
 <p className="text-xs text-muted-foreground">
 <span className="text-foreground font-medium">Analysis:</span> Based on {benfordValues.length} financial data points across 5 years.
 Significant deviations in digits 1–3 (highest frequency digits) are most meaningful for fraud detection.
 This is one indicator among many — always combine with qualitative review.
 </p>
 </div>
 </div>
 </div>
 );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function FundamentalsPage() {
 return (
 <div className="min-h-screen bg-background p-4 md:p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6 border-l-4 border-l-primary rounded-lg bg-card p-6"
 >
 <div className="flex items-center gap-3 mb-1">
 <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
 <BarChart2 size={16} className="text-foreground" />
 </div>
 <h1 className="text-lg font-medium text-foreground">Fundamental Analysis</h1>
 <span className="text-xs bg-indigo-900/60 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800">Pro</span>
 </div>
 <p className="text-sm text-muted-foreground ml-11">Deep-dive screening, income/balance sheet analysis, cash flow, competitive positioning, and earnings quality</p>
 </motion.div>

 <Tabs defaultValue="screener" className="mt-8">
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-6">
 <TabsTrigger value="screener" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Search size={12} className="mr-1.5" />
 Quality Screener
 </TabsTrigger>
 <TabsTrigger value="income" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <TrendingUp size={12} className="mr-1.5" />
 Income Statement
 </TabsTrigger>
 <TabsTrigger value="balance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Shield size={12} className="mr-1.5" />
 Balance Sheet
 </TabsTrigger>
 <TabsTrigger value="cashflow" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <DollarSign size={12} className="mr-1.5" />
 Cash Flow
 </TabsTrigger>
 <TabsTrigger value="competitive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Eye size={12} className="mr-1.5" />
 Competitive
 </TabsTrigger>
 <TabsTrigger value="quality" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Star size={12} className="mr-1.5" />
 Earnings Quality
 </TabsTrigger>
 </TabsList>

 <AnimatePresence mode="wait">
 <TabsContent value="screener" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <QualityScreener />
 </motion.div>
 </TabsContent>
 <TabsContent value="income" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <IncomeStatementAnalyzer />
 </motion.div>
 </TabsContent>
 <TabsContent value="balance" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <BalanceSheetHealth />
 </motion.div>
 </TabsContent>
 <TabsContent value="cashflow" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <CashFlowAnalysis />
 </motion.div>
 </TabsContent>
 <TabsContent value="competitive" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <CompetitiveAnalysis />
 </motion.div>
 </TabsContent>
 <TabsContent value="quality" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <EarningsQualityTab />
 </motion.div>
 </TabsContent>
 </AnimatePresence>
 </Tabs>
 </div>
 );
}
