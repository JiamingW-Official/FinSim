"use client";

import { useState, useMemo } from "react";
import {
 Building2,
 TrendingUp,
 BarChart3,
 Shield,
 BookOpen,
 Target,
 DollarSign,
 Scale,
 AlertTriangle,
 CheckCircle,
 Info,
 Layers,
 Globe,
 PieChart,
 Activity,
 Lock,
} from "lucide-react";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 880;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface ModelAllocation {
 name: string;
 shortName: string;
 color: string;
 aum: string;
 annualReturn: number;
 volatility: number;
 publicEquity: number;
 fixedIncome: number;
 privateEquity: number;
 hedgeFunds: number;
 realAssets: number;
 cash: number;
 keyPrinciple: string;
 founded: string;
}

interface ReturnPoint {
 year: number;
 yale: number;
 harvard: number;
 norway: number;
 calpers: number;
 sixtyForty: number;
}

interface EndowmentAssetClass {
 label: string;
 pct: number;
 color: string;
 illiquid: boolean;
 expectedReturn: number;
 description: string;
}

interface SpendingPoint {
 year: number;
 portfolioValue: number;
 spending: number;
 inflation: number;
 netReturn: number;
}

interface LiquidityTier {
 tier: string;
 label: string;
 assets: string[];
 pct: number;
 timeToLiquid: string;
 color: string;
}

interface PensionFundingPoint {
 year: number;
 assets: number;
 liabilities: number;
 fundingRatio: number;
}

interface SWFProfile {
 name: string;
 country: string;
 aum: string;
 mandate: string;
 governance: string;
 equities: number;
 fixedIncome: number;
 realAssets: number;
 alternatives: number;
 cash: number;
 color: string;
 highlight: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const MODELS: ModelAllocation[] = [
 {
 name: "Yale Endowment",
 shortName: "Yale",
 color: "#4f8ef7",
 aum: "$41.4B",
 annualReturn: 13.7,
 volatility: 11.2,
 publicEquity: 2,
 fixedIncome: 4,
 privateEquity: 41,
 hedgeFunds: 23,
 realAssets: 17,
 cash: 13,
 keyPrinciple: "Swensen Unconventional: maximize illiquidity premium via PE/VC/real assets; minimize public equities & bonds",
 founded: "1985 (Swensen era)",
 },
 {
 name: "Harvard Endowment",
 shortName: "Harvard",
 color: "#e05c5c",
 aum: "$50.9B",
 annualReturn: 9.6,
 volatility: 12.8,
 publicEquity: 14,
 fixedIncome: 5,
 privateEquity: 39,
 hedgeFunds: 32,
 realAssets: 7,
 cash: 3,
 keyPrinciple: "Diversified alternatives with external managers; historically higher hedge fund exposure than Yale",
 founded: "1974 (HMC)",
 },
 {
 name: "Norway GPFG",
 shortName: "Norway",
 color: "#4ec9a0",
 aum: "$1,650B",
 annualReturn: 6.3,
 volatility: 14.1,
 publicEquity: 71,
 fixedIncome: 27,
 privateEquity: 0,
 hedgeFunds: 0,
 realAssets: 2,
 cash: 0,
 keyPrinciple: "Passive index-tilted equity/bond; ethical exclusions; no private equity — transparency & simplicity at scale",
 founded: "1996 (NBIM)",
 },
 {
 name: "CalPERS",
 shortName: "CalPERS",
 color: "#f59e0b",
 aum: "$502B",
 annualReturn: 7.1,
 volatility: 12.4,
 publicEquity: 50,
 fixedIncome: 28,
 privateEquity: 13,
 hedgeFunds: 0,
 realAssets: 9,
 cash: 0,
 keyPrinciple: "LDI-focused pension: liability-matching fixed income + return-seeking equity; exited hedge funds 2014",
 founded: "1932",
 },
 {
 name: "60/40 Portfolio",
 shortName: "60/40",
 color: "#9b8fe8",
 aum: "Benchmark",
 annualReturn: 8.2,
 volatility: 10.1,
 publicEquity: 60,
 fixedIncome: 40,
 privateEquity: 0,
 hedgeFunds: 0,
 realAssets: 0,
 cash: 0,
 keyPrinciple: "Traditional balanced portfolio: 60% global equities, 40% investment-grade bonds. Simple, liquid, transparent",
 founded: "N/A",
 },
];

const SWENSEN_PRINCIPLES = [
 {
 icon: "illiquidity",
 title: "Harvest the Illiquidity Premium",
 body: "Patient investors accept lock-up periods of 7–12 years in PE/VC to earn 3–5% annual premium over public markets.",
 },
 {
 icon: "alternatives",
 title: "Non-Correlated Alternatives",
 body: "Absolute return strategies, real assets, and private markets diversify beyond the equity/bond correlation structure.",
 },
 {
 icon: "equity",
 title: "Equity Orientation",
 body: "Long time horizons justify heavy equity exposure. Bonds' real returns are poor; cash is a drag. Own equity claims on productive assets.",
 },
 {
 icon: "active",
 title: "Active Management in Inefficient Markets",
 body: "Private markets and niche hedge fund strategies offer genuine alpha. In public equities, passive indexing is preferred.",
 },
 {
 icon: "global",
 title: "Global Diversification",
 body: "International equity and EM exposure reduces home-country bias and captures growth in developing economies.",
 },
 {
 icon: "rebalance",
 title: "Disciplined Rebalancing",
 body: "Systematic rebalancing to target weights forces contrarian selling of winners and buying of underperformers.",
 },
];

const ENDOWMENT_ASSET_CLASSES: EndowmentAssetClass[] = [
 {
 label: "Private Equity",
 pct: 35,
 color: "#4f8ef7",
 illiquid: true,
 expectedReturn: 14.5,
 description: "LBO, growth equity, venture capital — 10-year lock-ups; top-quartile manager selection critical",
 },
 {
 label: "Hedge Funds",
 pct: 22,
 color: "#e05c5c",
 illiquid: false,
 expectedReturn: 8.2,
 description: "Absolute return: L/S equity, macro, event-driven; low market beta, diversifying",
 },
 {
 label: "Real Assets",
 pct: 18,
 color: "#4ec9a0",
 illiquid: true,
 expectedReturn: 9.8,
 description: "Timber, oil & gas royalties, infrastructure, farmland — inflation hedge + cash yield",
 },
 {
 label: "Real Estate",
 pct: 10,
 color: "#f59e0b",
 illiquid: true,
 expectedReturn: 8.5,
 description: "Core + value-add real estate funds; 7-year life; leverage enhances returns",
 },
 {
 label: "Public Equity",
 pct: 7,
 color: "#9b8fe8",
 illiquid: false,
 expectedReturn: 7.8,
 description: "Residual public equity; used for liquidity management and tactical rebalancing",
 },
 {
 label: "Fixed Income",
 pct: 5,
 color: "#64748b",
 illiquid: false,
 expectedReturn: 4.2,
 description: "Investment-grade bonds; used primarily as liquidity reserve for spending needs",
 },
 {
 label: "Cash",
 pct: 3,
 color: "#374151",
 illiquid: false,
 expectedReturn: 5.1,
 description: "Near-term spending liquidity; minimized due to return drag",
 },
];

const LIQUIDITY_TIERS: LiquidityTier[] = [
 {
 tier: "1",
 label: "Immediate (0–3 months)",
 assets: ["Cash & T-Bills", "Investment-Grade Bonds", "Public Equity"],
 pct: 15,
 timeToLiquid: "< 1 day",
 color: "#4ec9a0",
 },
 {
 tier: "2",
 label: "Short-Term (3–18 months)",
 assets: ["Hedge Funds (open-end)", "Listed REITs", "High-Yield Bonds"],
 pct: 20,
 timeToLiquid: "30–90 days",
 color: "#4f8ef7",
 },
 {
 tier: "3",
 label: "Medium (1–5 years)",
 assets: ["Closed-End Hedge Funds", "Core Real Estate", "Infrastructure"],
 pct: 30,
 timeToLiquid: "1–3 years",
 color: "#f59e0b",
 },
 {
 tier: "4",
 label: "Illiquid (5–12 years)",
 assets: ["PE / LBO Funds", "VC Funds", "Timber & Farmland"],
 pct: 35,
 timeToLiquid: "5–10 years",
 color: "#e05c5c",
 },
];

const SWF_PROFILES: SWFProfile[] = [
 {
 name: "Norway GPFG",
 country: "Norway",
 aum: "$1,650B",
 mandate: "Savings / Intergenerational",
 governance: "NBIM (Norges Bank) + Ethics Council; full transparency; detailed annual report; 9,000+ holdings",
 equities: 71,
 fixedIncome: 27,
 realAssets: 2,
 alternatives: 0,
 cash: 0,
 color: "#4ec9a0",
 highlight: "World's largest SWF; 1.5% of global equities; excludes ~170 companies on ethical grounds",
 },
 {
 name: "GIC (Singapore)",
 country: "Singapore",
 aum: "$770B",
 mandate: "Savings / Returns Maximization",
 governance: "GIC Pte Ltd; government-owned; moderate transparency; benchmarks against 20-year CPI+4% real target",
 equities: 38,
 fixedIncome: 35,
 realAssets: 13,
 alternatives: 11,
 cash: 3,
 color: "#4f8ef7",
 highlight: "Achieves 6.9% real annualized over 20yr; targets 4%+ real return with diversified alternative sleeve",
 },
 {
 name: "ADIA (Abu Dhabi)",
 country: "UAE",
 aum: "$700B",
 mandate: "Savings / Stabilization",
 governance: "Abu Dhabi ruling family; low transparency; 60% externally managed; benchmark: 70% equities/30% bonds",
 equities: 55,
 fixedIncome: 25,
 realAssets: 5,
 alternatives: 12,
 cash: 3,
 color: "#f59e0b",
 highlight: "70% externally managed; CIO structure with sector-specialist internal teams for alternatives",
 },
 {
 name: "CIC (China)",
 country: "China",
 aum: "$1,240B",
 mandate: "Savings / Strategic Reserves",
 governance: "State-owned; quasi-sovereign dual mandate; holds domestic (Central Huijin) + overseas portfolios",
 equities: 43,
 fixedIncome: 18,
 realAssets: 10,
 alternatives: 22,
 cash: 7,
 color: "#e05c5c",
 highlight: "Unique dual structure: overseas investments + domestic bank recapitalization via Central Huijin",
 },
];

// ── PRNG-seeded return history ─────────────────────────────────────────────────
function generateReturnHistory(): ReturnPoint[] {
 const points: ReturnPoint[] = [];
 let cYale = 100, cHarvard = 100, cNorway = 100, cCalpers = 100, c6040 = 100;
 for (let year = 2005; year <= 2024; year++) {
 const mkt = (rand() - 0.45) * 24;
 const yaleR = mkt * 0.55 + (rand() - 0.3) * 18 + 3;
 const harvR = mkt * 0.6 + (rand() - 0.32) * 16 + 1.8;
 const norR = mkt * 0.75 + (rand() - 0.5) * 20 - 0.5;
 const calR = mkt * 0.6 + (rand() - 0.48) * 14 + 0.8;
 const sixR = mkt * 0.65 + (rand() - 0.5) * 12 + 0.5;
 cYale = cYale * (1 + yaleR / 100);
 cHarvard = cHarvard * (1 + harvR / 100);
 cNorway = cNorway * (1 + norR / 100);
 cCalpers = cCalpers * (1 + calR / 100);
 c6040 = c6040 * (1 + sixR / 100);
 points.push({
 year,
 yale: +cYale.toFixed(1),
 harvard: +cHarvard.toFixed(1),
 norway: +cNorway.toFixed(1),
 calpers: +cCalpers.toFixed(1),
 sixtyForty: +c6040.toFixed(1),
 });
 }
 return points;
}

function generateSpendingHistory(): SpendingPoint[] {
 const pts: SpendingPoint[] = [];
 let portfolio = 1000;
 for (let year = 2000; year <= 2024; year++) {
 const ret = 7 + (rand() - 0.5) * 16;
 const inflation = 2.2 + (rand() - 0.5) * 2;
 const spending = portfolio * 0.05;
 portfolio = portfolio * (1 + ret / 100) - spending;
 pts.push({
 year,
 portfolioValue: +portfolio.toFixed(1),
 spending: +spending.toFixed(1),
 inflation: +inflation.toFixed(2),
 netReturn: +ret.toFixed(2),
 });
 }
 return pts;
}

function generatePensionFunding(): PensionFundingPoint[] {
 const pts: PensionFundingPoint[] = [];
 let assets = 820, liabilities = 1000;
 for (let year = 2005; year <= 2024; year++) {
 const assetRet = 7 + (rand() - 0.5) * 14;
 const liabChg = 3.5 + (rand() - 0.5) * 6;
 const contributions = liabilities * 0.04;
 assets = assets * (1 + assetRet / 100) + contributions;
 liabilities = liabilities * (1 + liabChg / 100);
 pts.push({
 year,
 assets: +assets.toFixed(1),
 liabilities: +liabilities.toFixed(1),
 fundingRatio: +(assets / liabilities * 100).toFixed(1),
 });
 }
 return pts;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function pct(n: number) { return `${n.toFixed(1)}%`; }

// ── Sub-Components ─────────────────────────────────────────────────────────────

function StackedBarChart({ models }: { models: ModelAllocation[] }) {
 const segments = [
 { key: "publicEquity" as const, label: "Public Equity", color: "#9b8fe8" },
 { key: "fixedIncome" as const, label: "Fixed Income", color: "#64748b" },
 { key: "privateEquity" as const, label: "Private Equity", color: "#4f8ef7" },
 { key: "hedgeFunds" as const, label: "Hedge Funds", color: "#e05c5c" },
 { key: "realAssets" as const, label: "Real Assets", color: "#4ec9a0" },
 { key: "cash" as const, label: "Cash/Other", color: "#374151" },
 ];

 const W = 640, H = 280, PL = 70, PT = 30, PB = 50, BAR_W = 72, GAP = 18;

 return (
 <div className="overflow-x-auto">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto">
 {/* Y axis labels */}
 {[0, 25, 50, 75, 100].map((v) => {
 const y = PT + (H - PT - PB) * (1 - v / 100);
 return (
 <g key={v}>
 <line x1={PL} x2={W - 10} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
 <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}%</text>
 </g>
 );
 })}
 {/* Bars */}
 {models.map((m, mi) => {
 const x = PL + mi * (BAR_W + GAP) + GAP;
 let cumY = H - PB;
 return (
 <g key={m.shortName}>
 {segments.map((seg) => {
 const val = m[seg.key];
 if (val === 0) return null;
 const barH = ((H - PT - PB) * val) / 100;
 const y = cumY - barH;
 cumY = y;
 return (
 <rect key={seg.key} x={x} y={y} width={BAR_W} height={barH} fill={seg.color} opacity={0.9} rx={1}>
 <title>{seg.label}: {val}%</title>
 </rect>
 );
 })}
 {/* Bar label */}
 <text x={x + BAR_W / 2} y={H - PB + 14} textAnchor="middle" fontSize={10} fill="#e5e7eb" fontWeight="600">
 {m.shortName}
 </text>
 <text x={x + BAR_W / 2} y={H - PB + 26} textAnchor="middle" fontSize={9} fill="#6b7280">
 {m.aum}
 </text>
 </g>
 );
 })}
 {/* Legend */}
 {segments.map((seg, i) => (
 <g key={seg.key} transform={`translate(${PL + i * 96}, ${H - 6})`}>
 <rect width={10} height={10} y={-10} fill={seg.color} rx={2} />
 <text x={13} y={0} fontSize={8} fill="#9ca3af">{seg.label}</text>
 </g>
 ))}
 </svg>
 </div>
 );
}

function ReturnLineChart({ data }: { data: ReturnPoint[] }) {
 const W = 640, H = 260, PL = 50, PT = 20, PB = 40, PR = 20;
 const allVals = data.flatMap((d) => [d.yale, d.harvard, d.norway, d.calpers, d.sixtyForty]);
 const minV = Math.min(...allVals) * 0.95;
 const maxV = Math.max(...allVals) * 1.03;
 const scaleY = (v: number) => PT + (H - PT - PB) * (1 - (v - minV) / (maxV - minV));
 const scaleX = (i: number) => PL + (i / (data.length - 1)) * (W - PL - PR);

 const lines = [
 { key: "yale" as const, color: "#4f8ef7", label: "Yale" },
 { key: "harvard" as const, color: "#e05c5c", label: "Harvard" },
 { key: "norway" as const, color: "#4ec9a0", label: "Norway" },
 { key: "calpers" as const, color: "#f59e0b", label: "CalPERS" },
 { key: "sixtyForty" as const, color: "#9b8fe8", label: "60/40" },
 ];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto">
 {/* Grid */}
 {[100, 150, 200, 250, 300].map((v) => {
 const y = scaleY(v);
 if (y < PT || y > H - PB) return null;
 return (
 <g key={v}>
 <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.8} />
 <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">{v}</text>
 </g>
 );
 })}
 {/* X labels */}
 {data.filter((_, i) => i % 4 === 0).map((d, i) => {
 const x = scaleX(i * 4);
 return (
 <text key={d.year} x={x} y={H - PB + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
 {d.year}
 </text>
 );
 })}
 {/* Lines */}
 {lines.map((line) => {
 const d = data.map((pt, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(pt[line.key]).toFixed(1)}`).join(" ");
 return <path key={line.key} d={d} fill="none" stroke={line.color} strokeWidth={1.8} opacity={0.9} />;
 })}
 {/* Legend */}
 {lines.map((line, i) => (
 <g key={line.key} transform={`translate(${PL + i * 100}, ${H - 6})`}>
 <line x1={0} x2={14} y1={-5} y2={-5} stroke={line.color} strokeWidth={2} />
 <text x={17} y={0} fontSize={9} fill="#9ca3af">{line.label}</text>
 </g>
 ))}
 </svg>
 );
}

function SpendingChart({ data }: { data: SpendingPoint[] }) {
 const W = 640, H = 240, PL = 55, PT = 20, PB = 36, PR = 20;
 const maxPV = Math.max(...data.map((d) => d.portfolioValue)) * 1.05;
 const minPV = Math.min(...data.map((d) => d.portfolioValue)) * 0.95;
 const scaleY = (v: number) => PT + (H - PT - PB) * (1 - (v - minPV) / (maxPV - minPV));
 const scaleX = (i: number) => PL + (i / (data.length - 1)) * (W - PL - PR);
 const pvPath = data.map((pt, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(pt.portfolioValue).toFixed(1)}`).join(" ");
 const pvFill = pvPath + ` L${scaleX(data.length - 1)},${H - PB} L${scaleX(0)},${H - PB} Z`;

 const maxSpend = Math.max(...data.map((d) => d.spending));
 const scaleSpendY = (v: number) => PT + (H - PT - PB) * (1 - v / (maxSpend * 1.2));
 const spendPath = data.map((pt, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleSpendY(pt.spending).toFixed(1)}`).join(" ");

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto">
 {/* Grid */}
 {[0.25, 0.5, 0.75, 1].map((frac) => {
 const v = minPV + frac * (maxPV - minPV);
 const y = scaleY(v);
 return (
 <g key={frac}>
 <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.7} />
 <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">{v.toFixed(0)}</text>
 </g>
 );
 })}
 {/* Portfolio area */}
 <path d={pvFill} fill="#4f8ef7" opacity={0.1} />
 <path d={pvPath} fill="none" stroke="#4f8ef7" strokeWidth={2} />
 {/* Spending line */}
 <path d={spendPath} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
 {/* X axis */}
 {data.filter((_, i) => i % 5 === 0).map((d, i) => (
 <text key={d.year} x={scaleX(i * 5)} y={H - PB + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
 {d.year}
 </text>
 ))}
 {/* Legend */}
 <g transform={`translate(${PL}, ${H - 6})`}>
 <line x1={0} x2={14} y1={-5} y2={-5} stroke="#4f8ef7" strokeWidth={2} />
 <text x={17} y={0} fontSize={9} fill="#9ca3af">Portfolio Value ($M)</text>
 <line x1={110} x2={124} y1={-5} y2={-5} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4,3" />
 <text x={127} y={0} fontSize={9} fill="#9ca3af">Annual Spending</text>
 </g>
 </svg>
 );
}

function FundingRatioGauge({ ratio }: { ratio: number }) {
 const cx = 120, cy = 100, r = 75;
 const startAngle = -Math.PI * 0.85;
 const endAngle = Math.PI * 0.85;
 const totalAngle = endAngle - startAngle;

 const zones = [
 { label: "Critical\n<70%", min: 0, max: 70, color: "#dc2626" },
 { label: "At Risk\n70–85%", min: 70, max: 85, color: "#f59e0b" },
 { label: "Adequate\n85–100%", min: 85, max: 100, color: "#4f8ef7" },
 { label: "Surplus\n>100%", min: 100, max: 130, color: "#4ec9a0" },
 ];

 const valToAngle = (v: number) => startAngle + (Math.min(v, 130) / 130) * totalAngle;
 const needleAngle = valToAngle(ratio);
 const needleX = cx + (r - 10) * Math.cos(needleAngle);
 const needleY = cy + (r - 10) * Math.sin(needleAngle);

 const arcPath = (minV: number, maxV: number) => {
 const a1 = valToAngle(minV);
 const a2 = valToAngle(maxV);
 const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
 const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
 const x1i = cx + (r - 18) * Math.cos(a1), y1i = cy + (r - 18) * Math.sin(a1);
 const x2i = cx + (r - 18) * Math.cos(a2), y2i = cy + (r - 18) * Math.sin(a2);
 return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x2i.toFixed(2)},${y2i.toFixed(2)} A${r - 18},${r - 18} 0 0,0 ${x1i.toFixed(2)},${y1i.toFixed(2)} Z`;
 };

 const statusColor = ratio >= 100 ? "#4ec9a0" : ratio >= 85 ? "#4f8ef7" : ratio >= 70 ? "#f59e0b" : "#dc2626";
 const statusLabel = ratio >= 100 ? "Surplus" : ratio >= 85 ? "Adequate" : ratio >= 70 ? "At Risk" : "Critical";

 return (
 <svg viewBox="0 0 240 140" className="w-full max-w-xs mx-auto">
 {zones.map((z) => (
 <path key={z.label} d={arcPath(z.min, z.max)} fill={z.color} opacity={0.75} />
 ))}
 <line x1={cx} y1={cy} x2={needleX.toFixed(2)} y2={needleY.toFixed(2)} stroke="#f1f5f9" strokeWidth={2.5} strokeLinecap="round" />
 <circle cx={cx} cy={cy} r={5} fill="#f1f5f9" />
 <text x={cx} y={cy + 22} textAnchor="middle" fontSize={15} fontWeight="bold" fill={statusColor}>
 {ratio.toFixed(1)}%
 </text>
 <text x={cx} y={cy + 35} textAnchor="middle" fontSize={9} fill="#9ca3af">{statusLabel}</text>
 <text x={18} y={cy + 8} textAnchor="middle" fontSize={7} fill="#6b7280">0%</text>
 <text x={222} y={cy + 8} textAnchor="middle" fontSize={7} fill="#6b7280">130%</text>
 </svg>
 );
}

function PensionFundingChart({ data }: { data: PensionFundingPoint[] }) {
 const W = 620, H = 240, PL = 55, PT = 20, PB = 36, PR = 20;
 const allVals = data.flatMap((d) => [d.assets, d.liabilities]);
 const minV = Math.min(...allVals) * 0.95;
 const maxV = Math.max(...allVals) * 1.03;
 const scaleY = (v: number) => PT + (H - PT - PB) * (1 - (v - minV) / (maxV - minV));
 const scaleX = (i: number) => PL + (i / (data.length - 1)) * (W - PL - PR);

 const assetPath = data.map((pt, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(pt.assets).toFixed(1)}`).join(" ");
 const liabPath = data.map((pt, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(pt.liabilities).toFixed(1)}`).join(" ");

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto">
 {[0.25, 0.5, 0.75, 1].map((frac) => {
 const v = minV + frac * (maxV - minV);
 const y = scaleY(v);
 return (
 <g key={frac}>
 <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.7} />
 <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">{v.toFixed(0)}</text>
 </g>
 );
 })}
 <path d={assetPath} fill="none" stroke="#4ec9a0" strokeWidth={2} />
 <path d={liabPath} fill="none" stroke="#e05c5c" strokeWidth={2} strokeDasharray="5,3" />
 {data.filter((_, i) => i % 4 === 0).map((d, i) => (
 <text key={d.year} x={scaleX(i * 4)} y={H - PB + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
 {d.year}
 </text>
 ))}
 <g transform={`translate(${PL}, ${H - 5})`}>
 <line x1={0} x2={14} y1={-5} y2={-5} stroke="#4ec9a0" strokeWidth={2} />
 <text x={17} y={0} fontSize={9} fill="#9ca3af">Assets</text>
 <line x1={70} x2={84} y1={-5} y2={-5} stroke="#e05c5c" strokeWidth={2} strokeDasharray="5,3" />
 <text x={87} y={0} fontSize={9} fill="#9ca3af">Liabilities</text>
 </g>
 </svg>
 );
}

function SWFReturnContributionChart({ profile }: { profile: SWFProfile }) {
 const W = 320, H = 180, PL = 10, PT = 20, PB = 30;
 const classes = [
 { label: "Equity", pct: profile.equities, ret: 8.2, color: "#4f8ef7" },
 { label: "FI", pct: profile.fixedIncome, ret: 3.1, color: "#64748b" },
 { label: "Real", pct: profile.realAssets, ret: 7.5, color: "#4ec9a0" },
 { label: "Alt", pct: profile.alternatives, ret: 9.8, color: "#e05c5c" },
 { label: "Cash", pct: profile.cash, ret: 4.8, color: "#374151" },
 ].filter((c) => c.pct > 0);

 const contributions = classes.map((c) => ({ ...c, contrib: (c.pct / 100) * c.ret }));
 const totalContrib = contributions.reduce((a, c) => a + c.contrib, 0);
 const maxContrib = Math.max(...contributions.map((c) => c.contrib));
 const barW = (W - PL * 2) / classes.length;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
 {[0, maxContrib / 2, maxContrib].map((v, i) => {
 const y = PT + (H - PT - PB) * (1 - v / (maxContrib * 1.1));
 return (
 <g key={i}>
 <line x1={PL} x2={W - PL} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.6} />
 <text x={PL - 2} y={y + 3} textAnchor="end" fontSize={8} fill="#6b7280">{v.toFixed(1)}%</text>
 </g>
 );
 })}
 {contributions.map((c, i) => {
 const bh = ((H - PT - PB) * c.contrib) / (maxContrib * 1.1);
 const x = PL + i * barW + 6;
 const y = PT + (H - PT - PB) * (1 - c.contrib / (maxContrib * 1.1));
 return (
 <g key={c.label}>
 <rect x={x} y={y} width={barW - 12} height={bh} fill={c.color} opacity={0.85} rx={2} />
 <text x={x + (barW - 12) / 2} y={H - PB + 12} textAnchor="middle" fontSize={9} fill="#9ca3af">{c.label}</text>
 <text x={x + (barW - 12) / 2} y={y - 3} textAnchor="middle" fontSize={8} fill="#e5e7eb">{c.contrib.toFixed(1)}%</text>
 </g>
 );
 })}
 <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">
 Total: {totalContrib.toFixed(2)}% weighted return contribution
 </text>
 </svg>
 );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function InstitutionalAllocPage() {
 const [activeModel, setActiveModel] = useState<string>("Yale");
 const [activeSWF, setActiveSWF] = useState<string>("Norway GPFG");
 const [fundingRatio, setFundingRatio] = useState<number>(87.4);

 const returnHistory = useMemo(() => generateReturnHistory(), []);
 const spendingHistory = useMemo(() => generateSpendingHistory(), []);
 const pensionFunding = useMemo(() => generatePensionFunding(), []);

 const selectedModel = MODELS.find((m) => m.shortName === activeModel) ?? MODELS[0];
 const selectedSWF = SWF_PROFILES.find((s) => s.name === activeSWF) ?? SWF_PROFILES[0];

 const latestFundingRatio = pensionFunding[pensionFunding.length - 1].fundingRatio;

 return (
 <div className="max-w-5xl px-6 py-8 mx-auto space-y-6">
  {/* Hero */}
  <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Institutional Allocation</h1>
  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">ENDOWMENTS · PENSIONS · SOVEREIGN WEALTH</p>

  {/* Tabs */}
  <Tabs defaultValue="models" className="mt-8">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="models" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Models Comparison</TabsTrigger>
 <TabsTrigger value="endowment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Endowment Model</TabsTrigger>
 <TabsTrigger value="pension" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Pension LDI</TabsTrigger>
 <TabsTrigger value="swf" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">SWF Strategies</TabsTrigger>
 </TabsList>

 {/* ── Tab 1: Models Comparison ── */}
 <TabsContent value="models" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 {/* Stats row */}
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
 {MODELS.map((m) => (
 <button
 key={m.shortName}
 onClick={() => setActiveModel(m.shortName)}
 className={`rounded-md border p-3 text-left transition-colors ${activeModel === m.shortName ? "border-primary bg-muted/10" : "border-border bg-card/60 hover:border-border"}`}
 >
 <div className="text-xs text-muted-foreground mb-1 truncate">{m.name}</div>
 <div className="text-lg font-semibold" style={{ color: m.color }}>
 {m.annualReturn.toFixed(1)}%
 </div>
 <div className="text-xs text-muted-foreground">10yr ann.</div>
 <div className="text-xs text-muted-foreground mt-1">{m.aum}</div>
 </button>
 ))}
 </div>

 {/* Stacked bar */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <PieChart className="w-3.5 h-3.5 text-muted-foreground/50" />
 Asset Allocation Comparison — 5 Institutional Models
 </CardTitle>
 </CardHeader>
 <CardContent>
 <StackedBarChart models={MODELS} />
 </CardContent>
 </Card>

 {/* Return history */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-green-400" />
 Cumulative Return Index (2005 = 100)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ReturnLineChart data={returnHistory} />
 </CardContent>
 </Card>

 {/* Selected model detail */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
 {selectedModel.name} — Key Principles
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground mb-4">{selectedModel.keyPrinciple}</p>
 <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
 {[
 { label: "Ann. Return", val: pct(selectedModel.annualReturn) },
 { label: "Volatility", val: pct(selectedModel.volatility) },
 { label: "Public Eq.", val: pct(selectedModel.publicEquity) },
 { label: "Fixed Inc.", val: pct(selectedModel.fixedIncome) },
 { label: "Private Eq.", val: pct(selectedModel.privateEquity) },
 { label: "Real Assets", val: pct(selectedModel.realAssets) },
 ].map((s) => (
 <div key={s.label} className="bg-muted/60 rounded-lg p-2 text-center">
 <div className="text-sm font-medium text-foreground">{s.val}</div>
 <div className="text-xs text-muted-foreground">{s.label}</div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground">Founded: {selectedModel.founded}</p>
 </CardContent>
 </Card>

 {/* Swensen Principles */}
 <div>
 <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
 <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50" />
 Swensen&apos;s Unconventional Portfolio Principles
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {SWENSEN_PRINCIPLES.map((p) => (
 <Card key={p.title} className="rounded-lg border border-border bg-card">
 <CardContent className="pt-4 pb-4">
 <div className="text-xs font-semibold text-primary mb-1">{p.title}</div>
 <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 </div>
 </TabsContent>

 {/* ── Tab 2: Endowment Model ── */}
 <TabsContent value="endowment" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 {/* Illiquidity premium theory */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
 Illiquidity Premium Theory
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
 Endowments with perpetual time horizons can tolerate multi-year lock-up periods in exchange for
 a structural return premium. The <span className="text-primary font-medium">illiquidity premium</span> is
 estimated at 3–5% per annum over equivalent public market exposures. This advantage is only realizable
 by investors who: (1) do not face forced selling, (2) have stable spending needs, and (3) can sustain
 capital calls over 5–10 year fund life cycles.
 </p>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label: "PE vs Public Equity Premium", val: "+3.8%", color: "#4f8ef7" },
 { label: "VC vs S&P 500 Premium", val: "+6.2%", color: "#4ec9a0" },
 { label: "Private Real Estate vs REITs", val: "+2.4%", color: "#f59e0b" },
 { label: "Infrastructure vs IG Bonds", val: "+3.1%", color: "#9b8fe8" },
 ].map((s) => (
 <div key={s.label} className="bg-muted/60 rounded-lg p-3 text-center">
 <div className="text-base font-medium" style={{ color: s.color }}>{s.val}</div>
 <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Asset class breakdown */}
 <div>
 <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
 <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
 Typical Endowment Asset Class Breakdown
 </h3>
 <div className="space-y-2">
 {ENDOWMENT_ASSET_CLASSES.map((ac) => (
 <div key={ac.label} className="rounded-lg border border-border bg-card p-3 flex items-center gap-4">
 <div className="w-24 text-xs font-medium text-foreground shrink-0">{ac.label}</div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <div className="flex-1 bg-muted rounded-full h-2">
 <div
 className="h-2 rounded-full transition-colors"
 style={{ width: `${ac.pct}%`, backgroundColor: ac.color }}
 />
 </div>
 <span className="text-sm font-medium text-foreground w-10 text-right">{ac.pct}%</span>
 <Badge
 variant="outline"
 className="text-xs text-muted-foreground shrink-0"
 style={{ borderColor: ac.illiquid ? "#f59e0b55" : "#4ec9a055", color: ac.illiquid ? "#f59e0b" : "#4ec9a0" }}
 >
 {ac.illiquid ? "Illiquid" : "Liquid"}
 </Badge>
 <span className="text-xs text-muted-foreground w-20 text-right shrink-0">Exp: {ac.expectedReturn}%/yr</span>
 </div>
 <p className="text-xs text-muted-foreground">{ac.description}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Spending rule */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-green-400" />
 Spending Rule Mechanics — 5% Rule vs Hybrid Rule
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
 <div className="bg-muted/60 rounded-lg p-3">
 <div className="text-xs font-medium text-primary mb-2">Simple 5% Rule</div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Spend exactly 5% of trailing 12-month portfolio value each year. Pro: simple. Con: highly procyclical —
 spending collapses after market crashes precisely when budget needs are highest.
 </p>
 <div className="mt-2 text-xs text-muted-foreground">
 <span className="font-mono bg-muted px-1 rounded">Spending = 5% × AUM(t)</span>
 </div>
 </div>
 <div className="bg-muted/60 rounded-lg p-3">
 <div className="text-xs font-medium text-green-400 mb-2">Yale Hybrid Rule</div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Blends last year&apos;s spending (70% weight) with target rate applied to current AUM (30% weight). Provides
 budget stability while still adjusting to portfolio growth over time.
 </p>
 <div className="mt-2 text-xs text-muted-foreground">
 <span className="font-mono bg-muted px-1 rounded">S(t) = 0.7×S(t-1) + 0.3×(5%×AUM(t))</span>
 </div>
 </div>
 </div>
 <SpendingChart data={spendingHistory} />
 </CardContent>
 </Card>

 {/* Liquidity ladder */}
 <div>
 <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 Liquidity Ladder — Endowment Structure
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 {LIQUIDITY_TIERS.map((tier) => (
 <Card key={tier.tier} className="rounded-lg border border-border bg-card">
 <CardContent className="pt-4 pb-4">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-foreground" style={{ backgroundColor: tier.color + "33", border: `1px solid ${tier.color}` }}>
 {tier.tier}
 </div>
 <span className="text-xs font-medium text-foreground">{pct(tier.pct)}</span>
 </div>
 <div className="text-xs font-medium mb-1" style={{ color: tier.color }}>{tier.label}</div>
 <div className="text-xs text-muted-foreground mb-2">Liquidation: {tier.timeToLiquid}</div>
 <ul className="space-y-0.5">
 {tier.assets.map((a) => (
 <li key={a} className="text-xs text-muted-foreground flex items-start gap-1">
 <span style={{ color: tier.color }}>•</span> {a}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 </div>
 </TabsContent>

 {/* ── Tab 3: Pension LDI ── */}
 <TabsContent value="pension" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 {/* LDI basics */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Scale className="w-3.5 h-3.5 text-muted-foreground/50" />
 Liability-Driven Investing (LDI) Basics
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
 LDI inverts traditional asset-only thinking: a pension fund&apos;s <span className="text-primary font-medium">primary risk is underfunding</span> —
 the gap between present value of liabilities (future benefit payments discounted at corporate bond yields)
 and plan assets. The liability portfolio behaves like a long-duration fixed income portfolio; duration
 mismatch creates funding ratio volatility even when assets perform well.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 {
 title: "Duration Matching",
 icon: <Target className="w-3.5 h-3.5 text-muted-foreground/50" />,
 body: "Matching asset duration to liability duration (often 14–20 years) neutralizes interest rate risk. A 1% rate rise increases PV of liabilities — but also asset values if duration-matched.",
 },
 {
 title: "Glide Path Strategy",
 icon: <TrendingUp className="w-4 h-4 text-green-400" />,
 body: "As funding ratio improves (underfunded → fully funded), de-risk by shifting from return-seeking assets (equities) to liability-matching assets (long-duration bonds, LDI funds).",
 },
 {
 title: "Interest Rate Hedging",
 icon: <Shield className="w-4 h-4 text-amber-400" />,
 body: "Overlay of interest rate swaps (pay fixed/receive floating) extends effective duration without selling equities. CDS/swaptions used for convexity adjustment near funded status.",
 },
 ].map((c) => (
 <Card key={c.title} className="bg-muted/50 border-border">
 <CardContent className="pt-4 pb-4">
 <div className="flex items-center gap-2 mb-2">
 {c.icon}
 <span className="text-xs font-medium text-foreground">{c.title}</span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
 </CardContent>
 </Card>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Assets vs liabilities chart */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
 PV of Assets vs PV of Liabilities (Simulated Pension Plan, $B)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <PensionFundingChart data={pensionFunding} />
 </CardContent>
 </Card>

 {/* Funding ratio gauge */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 Funding Ratio Gauge
 </CardTitle>
 </CardHeader>
 <CardContent>
 <FundingRatioGauge ratio={latestFundingRatio} />
 <div className="mt-3 space-y-1">
 {[
 { range: "< 70%", label: "Critical", color: "#dc2626", action: "Emergency contributions; PBGC scrutiny; benefit restrictions may apply" },
 { range: "70–85%", label: "At Risk", color: "#f59e0b", action: "Accelerated contributions; restrict benefit improvements; high LDI hedge ratio" },
 { range: "85–100%", label: "Adequate", color: "#4f8ef7", action: "Target 100%; grow LDI sleeve; partial equity de-risking" },
 { range: "> 100%", label: "Surplus", color: "#4ec9a0", action: "Annuitize liabilities; consider risk transfer; contribution holiday possible" },
 ].map((z) => (
 <div key={z.range} className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="font-mono w-16 shrink-0" style={{ color: z.color }}>{z.range}</span>
 <span className="font-medium w-16 shrink-0" >{z.label}</span>
 <span className="text-muted-foreground">{z.action}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Glide path */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-green-400" />
 LDI Glide Path — Asset Allocation by Funding Ratio
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {[
 { fr: "< 80%", eq: 65, ldi: 35, label: "Return-seeking heavy" },
 { fr: "80–90%", eq: 50, ldi: 50, label: "Balanced" },
 { fr: "90–100%", eq: 35, ldi: 65, label: "LDI-tilted" },
 { fr: "100–110%", eq: 20, ldi: 80, label: "Near-immunized" },
 { fr: "> 110%", eq: 5, ldi: 95, label: "Full immunization" },
 ].map((g) => (
 <div key={g.fr} className="bg-muted/60 rounded-lg p-2.5">
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-xs font-medium text-foreground">Funding: {g.fr}</span>
 <span className="text-xs text-muted-foreground">{g.label}</span>
 </div>
 <div className="flex rounded overflow-hidden h-3 gap-0.5">
 <div className="h-full bg-primary transition-colors" style={{ width: `${g.eq}%` }} title={`Equities ${g.eq}%`} />
 <div className="h-full bg-emerald-500 transition-colors" style={{ width: `${g.ldi}%` }} title={`LDI ${g.ldi}%`} />
 </div>
 <div className="flex justify-between mt-1">
 <span className="text-xs text-primary">Eq {g.eq}%</span>
 <span className="text-xs text-emerald-400">LDI {g.ldi}%</span>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
 <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
 Glide path triggers are pre-committed rules, not discretionary — removes behavioral bias at critical moments
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Swap overlay */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
 Interest Rate Hedge via Swaps — Mechanics
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <div className="text-xs font-medium text-primary mb-2">Pay-Fixed Receiver Swap</div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Pension pays fixed rate (e.g., 4.5%), receives floating SOFR. When rates fall, the swap gains
 value (matching liability increase). Notional can be sized to achieve target duration extension
 without selling equity portfolio.
 </p>
 </div>
 <div>
 <div className="text-xs font-medium text-amber-400 mb-2">LDI Fund Overlay</div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Pooled LDI funds offer leveraged exposure to long-duration gilts/Treasuries. £1 of collateral
 can control £3–5 of liability hedging. Risk: collateral calls during rate spikes (UK LDI crisis
 Oct 2022) can force fire-sale of return assets.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Tab 4: SWF Strategies ── */}
 <TabsContent value="swf" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 {/* Mandate types */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 {
 type: "Stabilization Fund",
 examples: "Russia NWF, Kuwait GRF buffer",
 color: "#f59e0b",
 icon: <Shield className="w-4 h-4" />,
 desc: "Buffer against commodity revenue volatility. Conservative allocation: primarily USD/EUR bonds and cash. Fiscal backstop — can be drawn down during downturns.",
 },
 {
 type: "Savings Fund",
 examples: "Norway GPFG, Abu Dhabi ADIA",
 color: "#4ec9a0",
 icon: <DollarSign className="w-4 h-4" />,
 desc: "Transfer wealth across generations by investing natural resource windfalls in diversified global portfolios. Long time horizon enables equity-heavy allocation.",
 },
 {
 type: "Development Fund",
 examples: "Malaysia Khazanah, Temasek",
 color: "#4f8ef7",
 icon: <Building2 className="w-4 h-4" />,
 desc: "State capitalism vehicle: invest in strategic domestic industries + international diversification. Dual mandate of commercial returns + policy objectives.",
 },
 ].map((m) => (
 <Card key={m.type} className="rounded-lg border border-border bg-card">
 <CardContent className="pt-4 pb-4">
 <div className="flex items-center gap-2 mb-2" style={{ color: m.color }}>
 {m.icon}
 <span className="text-sm font-medium">{m.type}</span>
 </div>
 <div className="text-xs text-muted-foreground mb-2 italic">{m.examples}</div>
 <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* SWF selector */}
 <div className="flex gap-2 flex-wrap">
 {SWF_PROFILES.map((swf) => (
 <button
 key={swf.name}
 onClick={() => setActiveSWF(swf.name)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activeSWF === swf.name ? "text-foreground border-primary bg-muted/10" : "text-muted-foreground border-border hover:border-border"}`}
 >
 {swf.name}
 </button>
 ))}
 </div>

 {/* Selected SWF detail */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Globe className="w-4 h-4" style={{ color: selectedSWF.color }} />
 {selectedSWF.name} ({selectedSWF.country})
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid grid-cols-2 gap-2">
 <div className="bg-muted/60 rounded p-2">
 <div className="text-xs text-muted-foreground">AUM</div>
 <div className="text-sm font-medium text-foreground">{selectedSWF.aum}</div>
 </div>
 <div className="bg-muted/60 rounded p-2">
 <div className="text-xs text-muted-foreground">Mandate</div>
 <div className="text-xs font-medium text-foreground">{selectedSWF.mandate}</div>
 </div>
 </div>
 <div className="bg-muted/40 rounded-lg p-3">
 <div className="text-xs font-medium text-muted-foreground mb-1">Governance</div>
 <p className="text-xs text-muted-foreground leading-relaxed">{selectedSWF.governance}</p>
 </div>
 <div className="bg-muted/10 border border-border rounded-lg p-3">
 <div className="flex items-start gap-2">
 <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
 <p className="text-xs text-primary">{selectedSWF.highlight}</p>
 </div>
 </div>
 {/* Allocation bars */}
 <div className="space-y-2">
 {[
 { label: "Equities", val: selectedSWF.equities, color: "#4f8ef7" },
 { label: "Fixed Income", val: selectedSWF.fixedIncome, color: "#64748b" },
 { label: "Real Assets", val: selectedSWF.realAssets, color: "#4ec9a0" },
 { label: "Alternatives", val: selectedSWF.alternatives, color: "#e05c5c" },
 { label: "Cash", val: selectedSWF.cash, color: "#374151" },
 ].filter((a) => a.val > 0).map((a) => (
 <div key={a.label} className="flex items-center gap-2">
 <span className="text-xs text-muted-foreground w-20 shrink-0">{a.label}</span>
 <div className="flex-1 bg-muted rounded-full h-2">
 <div className="h-2 rounded-full" style={{ width: `${a.val}%`, backgroundColor: a.color }} />
 </div>
 <span className="text-xs font-medium text-foreground w-8 text-right">{a.val}%</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Return Contribution by Asset Class
 </CardTitle>
 </CardHeader>
 <CardContent>
 <SWFReturnContributionChart profile={selectedSWF} />
 <div className="mt-3 text-xs text-muted-foreground">
 Contribution = allocation weight × expected asset class return. Higher-equity SWFs generate more return
 from equities; alternatives-heavy funds from illiquid premiums.
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Norway GPFG deep-dive */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <BookOpen className="w-4 h-4 text-green-400" />
 Norway GPFG — Governance & Ethics Council Model
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {[
 {
 title: "NBIM Structure",
 color: "#4ec9a0",
 body: "Managed by Norges Bank Investment Management (NBIM), a division of the central bank. Ministry of Finance sets the mandate; Storting (parliament) provides oversight. CIO has operational independence within strict risk limits.",
 },
 {
 title: "Ethics Council",
 color: "#4f8ef7",
 body: "Independent 5-person council investigates companies for ethical violations: weapons of mass destruction, severe human rights violations, environmental damage, corruption. ~170 companies excluded as of 2025.",
 },
 {
 title: "Benchmark Composition",
 color: "#9b8fe8",
 body: "Equity benchmark: FTSE Global All Cap (71% weight). Bond benchmark: Bloomberg Barclays Global Aggregate (27%). Active share kept low — fund is too large to take significant active positions without market impact.",
 },
 {
 title: "Real Estate Sleeve",
 color: "#f59e0b",
 body: "2% unlisted real estate (added 2010) in prime commercial properties: Paris, London, New York, Berlin. Infrastructure was approved for 2% but implementation paused due to governance complexity.",
 },
 {
 title: "Transparency Model",
 color: "#e05c5c",
 body: "Full public disclosure of all holdings quarterly. Annual report with complete attribution analysis. Voting decisions published. World's most transparent large SWF — sets global standard for disclosure.",
 },
 {
 title: "Spending Rule",
 color: "#64748b",
 body: "Norwegian parliament withdraws 3% of fund value per year (revised from 4% in 2017). In practice, the fund has grown faster than withdrawals. The 3% spending rate approximates expected long-run real return.",
 },
 ].map((c) => (
 <div key={c.title} className="bg-muted/60 rounded-lg p-3">
 <div className="text-xs font-medium mb-1" style={{ color: c.color }}>{c.title}</div>
 <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Benchmark hugging vs high-conviction */}
 <Card className="rounded-lg border border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
 Benchmark Hugging vs High-Conviction — SWF Spectrum
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <div className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
 <CheckCircle className="w-3.5 h-3.5" /> Benchmark Hugger (Norway GPFG)
 </div>
 <ul className="space-y-1">
 {[
 "Very low tracking error (< 0.5% vs benchmark)",
 "Minimal active positions — size prevents meaningful alpha",
 "Low fee drag; high transparency",
 "AUM growth driven by returns + oil revenue deposits",
 "Reputational risk from controversy > alpha opportunity",
 ].map((pt) => (
 <li key={pt} className="text-xs text-muted-foreground flex items-start gap-1.5">
 <span className="text-green-400 mt-0.5">•</span> {pt}
 </li>
 ))}
 </ul>
 </div>
 <div>
 <div className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
 <AlertTriangle className="w-3.5 h-3.5" /> High-Conviction (GIC, ADIA, CIC)
 </div>
 <ul className="space-y-1">
 {[
 "Target 4%+ real return with diversified alternatives",
 "PE/VC/infrastructure direct investments at scale",
 "Co-investment alongside GPs reduces fee load",
 "Long-term anchor investor in strategic sectors",
 "Lower disclosure; governance complexity higher",
 ].map((pt) => (
 <li key={pt} className="text-xs text-muted-foreground flex items-start gap-1.5">
 <span className="text-primary mt-0.5">•</span> {pt}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
