"use client";

import { useState, useMemo } from "react";
import {
 Shield,
 DollarSign,
 BarChart3,
 Activity,
 AlertTriangle,
 CheckCircle,
 Info,
 TrendingUp,
 TrendingDown,
 Percent,
 Building2,
 Layers,
 Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 31;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function resetSeed(seed: number = 31) {
 s = seed;
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
 return (
 <div className="mb-5">
 <h2 className="text-lg font-semibold text-foreground">{title}</h2>
 {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
 </div>
 );
}

function StatChip({
 label,
 value,
 color = "default",
}: {
 label: string;
 value: string;
 color?: "green" | "red" | "amber" | "blue" | "purple" | "default";
}) {
 const cls = {
 green: "bg-green-500/10 text-green-400 border-green-500/20",
 red: "bg-red-500/5 text-red-400 border-red-500/20",
 amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
 blue: "bg-muted/10 text-foreground border-border",
 purple: "bg-muted/10 text-foreground border-border",
 default: "bg-muted text-muted-foreground border-border",
 }[color];
 return (
 <div className={cn("rounded-lg border px-3 py-2 text-center", cls)}>
 <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
 <div className="text-sm font-semibold">{value}</div>
 </div>
 );
}

function InfoBox({
 title,
 children,
 variant = "default",
}: {
 title: string;
 children: React.ReactNode;
 variant?: "default" | "green" | "amber" | "blue" | "purple";
}) {
 const border = {
 default: "border-border",
 green: "border-green-500/30 bg-green-500/5",
 amber: "border-amber-500/30 bg-amber-500/5",
 blue: "border-border bg-muted/5",
 purple: "border-border bg-muted/5",
 }[variant];
 return (
 <div className={cn("rounded-lg border p-4", border)}>
 <div className="text-xs font-semibold text-muted-foreground mb-2">
 {title}
 </div>
 <div className="text-sm text-foreground leading-relaxed">{children}</div>
 </div>
 );
}

// ── TAB 1: Insurance Fundamentals ─────────────────────────────────────────────

function LawOfLargeNumbersSVG() {
 resetSeed(31);
 const W = 540;
 const H = 180;
 const PAD = { t: 16, r: 16, b: 36, l: 54 };
 const iW = W - PAD.l - PAD.r;
 const iH = H - PAD.t - PAD.b;

 // Simulate variance of loss ratio shrinking as pool size grows
 const sizes = [10, 50, 100, 500, 1000, 5000, 10000];
 // theoretical std dev of loss ratio ~ 1/sqrt(n) * 50%
 const series = sizes.map((n) => ({
 n,
 mean: 0.6,
 upper: 0.6 + 50 / Math.sqrt(n) / 100,
 lower: Math.max(0, 0.6 - 50 / Math.sqrt(n) / 100),
 }));

 const minY = 0;
 const maxY = 1.2;
 const rangeY = maxY - minY;
 const maxX = Math.log10(10000);
 const minX = Math.log10(10);

 const toSvg = (n: number, y: number) => ({
 sx: PAD.l + ((Math.log10(n) - minX) / (maxX - minX)) * iW,
 sy: PAD.t + ((maxY - y) / rangeY) * iH,
 });

 const meanPath = series
 .map(({ n, mean }, i) => {
 const { sx, sy } = toSvg(n, mean);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 })
 .join("");

 const upperPath = series.map(({ n, upper }, i) => {
 const { sx, sy } = toSvg(n, upper);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 }).join("");

 const lowerPath = series.map(({ n, lower }, i) => {
 const { sx, sy } = toSvg(n, lower);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 }).join("");

 // Confidence band
 const bandPath =
 series.map(({ n, upper }, i) => {
 const { sx, sy } = toSvg(n, upper);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 }).join("") +
 "" +
 [...series].reverse().map(({ n, lower }) => {
 const { sx, sy } = toSvg(n, lower);
 return `L ${sx} ${sy}`;
 }).join("") +
 " Z";

 const yTicks = [0, 0.3, 0.6, 0.9, 1.2];
 const xLabels = [
 { n: 10, label: "10" },
 { n: 100, label: "100" },
 { n: 1000, label: "1K" },
 { n: 10000, label: "10K" },
 ];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* y-grid */}
 {yTicks.map((y) => {
 const sy = PAD.t + ((maxY - y) / rangeY) * iH;
 return (
 <g key={y}>
 <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="#ffffff10" strokeWidth={1} />
 <text x={PAD.l - 6} y={sy + 4} fontSize={9} fill="#888" textAnchor="end">
 {(y * 100).toFixed(0)}%
 </text>
 </g>
 );
 })}
 {/* x-labels */}
 {xLabels.map(({ n, label }) => {
 const { sx } = toSvg(n, 0);
 return (
 <text key={n} x={sx} y={H - 6} fontSize={9} fill="#888" textAnchor="middle">
 {label}
 </text>
 );
 })}
 <text x={W / 2} y={H - 0} fontSize={9} fill="#666" textAnchor="middle">
 Pool Size (# Policyholders)
 </text>
 {/* confidence band */}
 <path d={bandPath} fill="#3b82f620" />
 {/* upper/lower */}
 <path d={upperPath} stroke="#3b82f640" strokeWidth={1} fill="none" strokeDasharray="3 2" />
 <path d={lowerPath} stroke="#3b82f640" strokeWidth={1} fill="none" strokeDasharray="3 2" />
 {/* mean */}
 <path d={meanPath} stroke="#22c55e" strokeWidth={2} fill="none" />
 {/* legend */}
 <line x1={PAD.l + 4} y1={PAD.t + 8} x2={PAD.l + 24} y2={PAD.t + 8} stroke="#22c55e" strokeWidth={2} />
 <text x={PAD.l + 28} y={PAD.t + 12} fontSize={9} fill="#22c55e">
 Actual Loss Ratio
 </text>
 <rect x={PAD.l + 90} y={PAD.t + 2} width={16} height={12} fill="#3b82f620" />
 <text x={PAD.l + 110} y={PAD.t + 12} fontSize={9} fill="#3b82f6">
 95% Confidence Band
 </text>
 </svg>
 );
}

function CombinedRatioSVG() {
 const companies = [
 { name: "Geico", lossRatio: 72, expenseRatio: 15 },
 { name: "Progressive", lossRatio: 68, expenseRatio: 18 },
 { name: "Allstate", lossRatio: 74, expenseRatio: 21 },
 { name: "State Farm", lossRatio: 76, expenseRatio: 20 },
 { name: "Chubb", lossRatio: 62, expenseRatio: 28 },
 ];

 const W = 500;
 const H = 200;
 const PAD = { t: 16, r: 100, b: 36, l: 80 };
 const barH = 22;
 const gap = 10;
 const iW = W - PAD.l - PAD.r;

 const scale = (v: number) => (v / 120) * iW;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* 100% line */}
 <line
 x1={PAD.l + scale(100)}
 y1={PAD.t - 4}
 x2={PAD.l + scale(100)}
 y2={H - PAD.b + 4}
 stroke="#f59e0b"
 strokeWidth={1.5}
 strokeDasharray="4 2"
 />
 <text
 x={PAD.l + scale(100)}
 y={PAD.t - 7}
 fontSize={9}
 fill="#f59e0b"
 textAnchor="middle"
 >
 100% (breakeven)
 </text>

 {companies.map(({ name, lossRatio, expenseRatio }, i) => {
 const combined = lossRatio + expenseRatio;
 const y = PAD.t + i * (barH + gap);
 const profitable = combined < 100;
 return (
 <g key={name}>
 <text x={PAD.l - 6} y={y + barH / 2 + 4} fontSize={10} fill="#aaa" textAnchor="end">
 {name}
 </text>
 {/* loss ratio bar */}
 <rect x={PAD.l} y={y} width={scale(lossRatio)} height={barH} fill="#ef444460" rx={3} />
 <text
 x={PAD.l + scale(lossRatio) / 2}
 y={y + barH / 2 + 4}
 fontSize={8}
 fill="#ef4444"
 textAnchor="middle"
 >
 {lossRatio}%
 </text>
 {/* expense ratio bar */}
 <rect
 x={PAD.l + scale(lossRatio)}
 y={y}
 width={scale(expenseRatio)}
 height={barH}
 fill="#3b82f660"
 rx={3}
 />
 <text
 x={PAD.l + scale(lossRatio) + scale(expenseRatio) / 2}
 y={y + barH / 2 + 4}
 fontSize={8}
 fill="#3b82f6"
 textAnchor="middle"
 >
 {expenseRatio}%
 </text>
 {/* combined label */}
 <text
 x={PAD.l + scale(combined) + 6}
 y={y + barH / 2 + 4}
 fontSize={10}
 fill={profitable ? "#22c55e" : "#ef4444"}
 fontWeight="600"
 >
 {combined}
 </text>
 {profitable && (
 <text x={PAD.l + scale(combined) + 32} y={y + barH / 2 + 4} fontSize={9} fill="#22c55e">
 ✓
 </text>
 )}
 </g>
 );
 })}

 {/* x-axis */}
 {[0, 25, 50, 75, 100].map((v) => (
 <text key={v} x={PAD.l + scale(v)} y={H - PAD.b + 14} fontSize={8} fill="#666" textAnchor="middle">
 {v}%
 </text>
 ))}

 {/* legend */}
 <rect x={PAD.l} y={H - 14} width={12} height={8} fill="#ef444460" rx={2} />
 <text x={PAD.l + 16} y={H - 7} fontSize={8} fill="#ef4444">
 Loss Ratio
 </text>
 <rect x={PAD.l + 80} y={H - 14} width={12} height={8} fill="#3b82f660" rx={2} />
 <text x={PAD.l + 96} y={H - 7} fontSize={8} fill="#3b82f6">
 Expense Ratio
 </text>
 </svg>
 );
}

function FundamentalsTab() {
 const [expanded, setExpanded] = useState<string | null>(null);

 const concepts = [
 {
 key: "pooling",
 title: "Risk Pooling",
 icon: <Layers size={14} />,
 color: "blue",
 summary:
 "By pooling many independent risks, insurers convert uncertain individual losses into predictable aggregate losses.",
 detail:
 "If each policyholder has a 1% chance of a $100K loss, pooling 10,000 policyholders produces an expected aggregate loss of $100M with very low variance. The insurer charges slightly more than expected loss per person (the actuarially fair premium plus a loading for expenses and profit).",
 },
 {
 key: "adverse",
 title: "Adverse Selection",
 icon: <AlertTriangle size={14} />,
 color: "amber",
 summary:
 "High-risk individuals are more likely to buy insurance, skewing the pool toward worse risks than the average population.",
 detail:
 "Without mandatory participation or underwriting, only the sickest people buy health insurance — causing premiums to rise, driving out healthy people, and eventually collapsing the market (Akerlof's lemons problem). Solutions: mandatory purchase (ACA individual mandate), underwriting (life/auto insurers screen applicants), group plans (employer health).",
 },
 {
 key: "moral",
 title: "Moral Hazard",
 icon: <Shield size={14} />,
 color: "amber",
 summary:
 "Once insured, people take more risk or less care because the cost of losses shifts to the insurer.",
 detail:
 "Example: Insured driver may park less carefully. Solution: deductibles make the policyholder bear the first dollar of loss, aligning incentives. Co-pays in health insurance serve the same role. Coinsurance clauses in commercial P&C require the insured to maintain coverage proportional to property value.",
 },
 {
 key: "float",
 title: "Float: Buffett's Edge",
 icon: <DollarSign size={14} />,
 color: "green",
 summary:
 "Insurance float is money collected as premiums but not yet paid out as claims — effectively an interest-free loan from policyholders.",
 detail:
 "Berkshire Hathaway's insurance operations generated ~$168B in float as of 2023. Buffett invests this float in equities and bonds. If the combined ratio < 100%, the float is free (he gets paid to hold it). Even a break-even combined ratio of 100% means the float is like a 0% loan, far cheaper than issuing bonds.",
 },
 {
 key: "actuarial",
 title: "Actuarial Pricing",
 icon: <BarChart3 size={14} />,
 color: "purple",
 summary:
 "Actuaries use statistical models to set premiums: Pure Premium = Expected Loss + Loss Adjustment. Gross Premium adds expense load and profit.",
 detail:
 'Gross premium = (Pure premium) / (1 - expense ratio - profit target). For auto: frequency × severity + LAE gives the pure premium. Credibility theory blends individual experience with industry averages: P = Z × (own experience) + (1-Z) × (industry). Z = n / (n + k) where k is a credibility constant.',
 },
 ];

 const colorMap: Record<string, string> = {
 blue: "border-border bg-muted/5",
 amber: "border-amber-500/30 bg-amber-500/5",
 green: "border-green-500/30 bg-green-500/5",
 purple: "border-border bg-muted/5",
 };
 const iconMap: Record<string, string> = {
 blue: "text-foreground",
 amber: "text-amber-400",
 green: "text-green-400",
 purple: "text-foreground",
 };

 return (
 <div className="space-y-4">
 <SectionHeader
 title="Insurance Economics"
 subtitle="How insurers pool risk, price policies, and generate returns"
 />

 {/* Law of large numbers chart */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Law of Large Numbers — Loss Ratio Variance vs Pool Size
 </div>
 <LawOfLargeNumbersSVG />
 <p className="text-xs text-muted-foreground mt-2">
 As the policyholder pool grows, actual loss ratios converge to the expected 60% with
 shrinking variance. With 10,000 policyholders, the 95% confidence band is ±1%.
 </p>
 </div>

 {/* Combined ratio */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Combined Ratio by Insurer — Combined = Loss + Expense Ratio
 </div>
 <CombinedRatioSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Combined ratio below 100% means underwriting profit. Combined ratio above 100% means the
 insurer relies on investment income to be profitable overall.
 </p>
 </div>

 {/* Key concepts */}
 <div className="space-y-2">
 {concepts.map((c) => (
 <motion.div
 key={c.key}
 layout
 className={cn("rounded-lg border p-4 cursor-pointer", colorMap[c.color])}
 onClick={() => setExpanded(expanded === c.key ? null : c.key)}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className={iconMap[c.color]}>{c.icon}</span>
 <span className="text-sm font-medium">{c.title}</span>
 </div>
 <span className="text-xs text-muted-foreground">{expanded === c.key ? "▲" : "▼"}</span>
 </div>
 <p className="text-xs text-muted-foreground mt-1">{c.summary}</p>
 {expanded === c.key && (
 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="text-xs text-foreground mt-2 leading-relaxed border-t border-border pt-2"
 >
 {c.detail}
 </motion.p>
 )}
 </motion.div>
 ))}
 </div>

 {/* Insurance types grid */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Major Insurance Sectors
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 {[
 {
 name: "P&C (Property/Casualty)",
 examples: "Auto, Home, Commercial",
 combined: "95–105%",
 float: "2–4 yrs",
 color: "blue",
 },
 {
 name: "Life Insurance",
 examples: "Term, Whole, UL",
 combined: "N/A",
 float: "20–40 yrs",
 color: "green",
 },
 {
 name: "Health Insurance",
 examples: "Medical, Dental, Vision",
 combined: "85–90%",
 float: "< 1 yr",
 color: "amber",
 },
 {
 name: "Specialty Lines",
 examples: "Marine, Aviation, D&O",
 combined: "90–100%",
 float: "1–5 yrs",
 color: "purple",
 },
 {
 name: "Reinsurance",
 examples: "Treaty, Facultative, Cat",
 combined: "90–100%",
 float: "3–10 yrs",
 color: "blue",
 },
 {
 name: "Mortgage / Bond",
 examples: "Credit enhancement",
 combined: "Varies widely",
 float: "Variable",
 color: "default",
 },
 ].map((sector) => (
 <div key={sector.name} className="rounded-md border border-border bg-muted/20 p-3">
 <div className="text-xs font-medium text-foreground">{sector.name}</div>
 <div className="text-xs text-muted-foreground mt-1">{sector.examples}</div>
 <div className="flex gap-2 mt-2 flex-wrap">
 <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
 CR: {sector.combined}
 </span>
 <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
 Float: {sector.float}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ── TAB 2: Life Insurance ─────────────────────────────────────────────────────

function TermVsWholeComparisonSVG() {
 // 20-year comparison: buy term ($30/mo) + invest difference ($270/mo)
 // vs whole life ($300/mo)
 const years = 20;
 const termPremium = 30;
 const wholePremium = 300;
 const difference = wholePremium - termPremium; // $270/mo invested
 const annualInvest = difference * 12; // $3240/yr
 const wholeAnnual = wholePremium * 12; // $3600/yr
 const marketReturn = 0.07;
 const wholeReturn = 0.03; // cash value growth

 const investPoints: { x: number; invest: number; whole: number }[] = [];
 let investVal = 0;
 let wholeVal = 0;

 for (let yr = 1; yr <= years; yr++) {
 investVal = (investVal + annualInvest) * (1 + marketReturn);
 wholeVal = (wholeVal + wholeAnnual * 0.6) * (1 + wholeReturn); // only 60% goes to cash value (rest: insurance cost + expense)
 investPoints.push({ x: yr, invest: investVal, whole: wholeVal });
 }

 const W = 520;
 const H = 200;
 const PAD = { t: 16, r: 80, b: 36, l: 60 };
 const iW = W - PAD.l - PAD.r;
 const iH = H - PAD.t - PAD.b;
 const maxV = investPoints[years - 1].invest * 1.05;

 const toSvg = (x: number, y: number) => ({
 sx: PAD.l + ((x - 1) / (years - 1)) * iW,
 sy: PAD.t + ((maxV - y) / maxV) * iH,
 });

 const investPath = investPoints
 .map(({ x, invest }, i) => {
 const { sx, sy } = toSvg(x, invest);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 })
 .join("");

 const wholePath = investPoints
 .map(({ x, whole }, i) => {
 const { sx, sy } = toSvg(x, whole);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 })
 .join("");

 const fmtK = (v: number) => `$${(v / 1000).toFixed(0)}K`;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {[0, 50000, 100000, 150000].map((v) => {
 const sy = PAD.t + ((maxV - v) / maxV) * iH;
 return (
 <g key={v}>
 <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="#ffffff10" strokeWidth={1} />
 <text x={PAD.l - 6} y={sy + 4} fontSize={9} fill="#888" textAnchor="end">
 {fmtK(v)}
 </text>
 </g>
 );
 })}
 {[1, 5, 10, 15, 20].map((yr) => {
 const { sx } = toSvg(yr, 0);
 return (
 <text key={yr} x={sx} y={H - PAD.b + 14} fontSize={9} fill="#666" textAnchor="middle">
 Yr {yr}
 </text>
 );
 })}
 <path d={investPath} stroke="#22c55e" strokeWidth={2} fill="none" />
 <path d={wholePath} stroke="#8b5cf6" strokeWidth={2} fill="none" strokeDasharray="5 3" />

 {/* end labels */}
 {(() => {
 const last = investPoints[years - 1];
 const { sx: sx1, sy: sy1 } = toSvg(years, last.invest);
 const { sx: sx2, sy: sy2 } = toSvg(years, last.whole);
 return (
 <>
 <text x={sx1 + 6} y={sy1 + 4} fontSize={9} fill="#22c55e" fontWeight="600">
 {fmtK(last.invest)}
 </text>
 <text x={sx2 + 6} y={sy2 + 4} fontSize={9} fill="#8b5cf6" fontWeight="600">
 {fmtK(last.whole)}
 </text>
 </>
 );
 })()}

 {/* legend */}
 <line x1={PAD.l} y1={PAD.t - 5} x2={PAD.l + 20} y2={PAD.t - 5} stroke="#22c55e" strokeWidth={2} />
 <text x={PAD.l + 24} y={PAD.t - 1} fontSize={9} fill="#22c55e">
 Term + Invest diff. (7% return)
 </text>
 <line
 x1={PAD.l + 160}
 y1={PAD.t - 5}
 x2={PAD.l + 180}
 y2={PAD.t - 5}
 stroke="#8b5cf6"
 strokeWidth={2}
 strokeDasharray="4 2"
 />
 <text x={PAD.l + 184} y={PAD.t - 1} fontSize={9} fill="#8b5cf6">
 Whole Life cash value (3%)
 </text>
 </svg>
 );
}

function LifeTab() {
 const [age, setAge] = useState(35);
 const [healthClass, setHealthClass] = useState<"preferred_plus" | "preferred" | "standard">(
 "preferred"
 );
 const [coverage, setCoverage] = useState(500000);

 const premiumTable = useMemo(() => {
 const baseRates: Record<string, Record<string, number>> = {
 // per $1000 coverage per year for 20-year term
 preferred_plus: { "25": 0.9, "30": 1.0, "35": 1.3, "40": 1.9, "45": 3.0, "50": 4.8 },
 preferred: { "25": 1.1, "30": 1.3, "35": 1.7, "40": 2.5, "45": 4.1, "50": 6.5 },
 standard: { "25": 1.6, "30": 1.9, "35": 2.5, "40": 3.8, "45": 6.2, "50": 10.0 },
 };
 const coverageK = coverage / 1000;
 return [10, 20, 30].map((term) => {
 const ageKey = String(Math.round(age / 5) * 5);
 const rate = (baseRates[healthClass][ageKey] ?? 2.0) * (term === 10 ? 0.85 : term === 30 ? 1.45 : 1);
 const annualPremium = rate * coverageK;
 return {
 term,
 monthly: (annualPremium / 12).toFixed(2),
 annual: annualPremium.toFixed(0),
 total: (annualPremium * term).toFixed(0),
 };
 });
 }, [age, healthClass, coverage]);

 // DIME needs analysis
 const [annualIncome, setAnnualIncome] = useState(100000);
 const [yearsNeeded, setYearsNeeded] = useState(15);
 const [debt, setDebt] = useState(50000);
 const [mortgage, setMortgage] = useState(300000);
 const [education, setEducation] = useState(100000);

 const dime = {
 D: debt,
 I: annualIncome * yearsNeeded,
 M: mortgage,
 E: education,
 total: debt + annualIncome * yearsNeeded + mortgage + education,
 };

 const products = [
 {
 name: "Term Life",
 coverage: "Death benefit only",
 premium: "Lowest",
 cashValue: "None",
 duration: "10/20/30 yr",
 pros: ["Cheapest per $1 of coverage", "Simple to understand", "Convertible to permanent"],
 cons: ["Coverage expires", "No cash value", "Premiums rise at renewal"],
 },
 {
 name: "Whole Life",
 coverage: "Death benefit + cash value",
 premium: "Highest (5–15×)",
 cashValue: "Guaranteed growth ~3–4%",
 duration: "Lifetime",
 pros: ["Permanent coverage", "Guaranteed cash value", "Tax-deferred growth"],
 cons: ["Very expensive", "Low returns vs market", "Complex surrender charges"],
 },
 {
 name: "Universal Life (IUL)",
 coverage: "Death benefit + indexed cash value",
 premium: "Flexible",
 cashValue: "Linked to index (0–12%)",
 duration: "Lifetime (if funded)",
 pros: ["Flexible premiums", "Market upside with floor", "Tax-deferred growth"],
 cons: ["Caps limit upside", "Complex fee structure", "Can lapse if underfunded"],
 },
 ];

 return (
 <div className="space-y-4">
 <SectionHeader
 title="Life Insurance Products"
 subtitle="Term, permanent, and hybrid products — finding the right fit"
 />

 {/* Product comparison */}
 <div className="overflow-x-auto rounded-lg border border-border">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/30">
 <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
 Product
 </th>
 <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
 Coverage
 </th>
 <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
 Premium
 </th>
 <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
 Cash Value
 </th>
 <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
 Duration
 </th>
 </tr>
 </thead>
 <tbody>
 {products.map((p) => (
 <tr key={p.name} className="border-b border-border hover:bg-muted/20">
 <td className="px-4 py-2 font-medium">{p.name}</td>
 <td className="px-4 py-2 text-muted-foreground text-xs">{p.coverage}</td>
 <td className="px-4 py-2 text-xs text-muted-foreground">{p.premium}</td>
 <td className="px-4 py-2 text-xs text-muted-foreground">{p.cashValue}</td>
 <td className="px-4 py-2 text-xs text-muted-foreground">{p.duration}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Premium calculator */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-4">
 Term Life Premium Estimator
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
 <div>
 <label className="text-xs text-muted-foreground block mb-1">Age: {age}</label>
 <input
 type="range"
 min={25}
 max={55}
 step={1}
 value={age}
 onChange={(e) => setAge(Number(e.target.value))}
 className="w-full accent-primary"
 />
 </div>
 <div>
 <label className="text-xs text-muted-foreground block mb-1">
 Coverage: ${(coverage / 1000).toFixed(0)}K
 </label>
 <input
 type="range"
 min={100000}
 max={2000000}
 step={50000}
 value={coverage}
 onChange={(e) => setCoverage(Number(e.target.value))}
 className="w-full accent-primary"
 />
 </div>
 <div>
 <label className="text-xs text-muted-foreground block mb-1">Health Class</label>
 <select
 value={healthClass}
 onChange={(e) =>
 setHealthClass(e.target.value as "preferred_plus" | "preferred" | "standard")
 }
 className="w-full bg-muted border border-border rounded px-2 py-1 text-sm"
 >
 <option value="preferred_plus">Preferred Plus</option>
 <option value="preferred">Preferred</option>
 <option value="standard">Standard</option>
 </select>
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left px-3 py-1.5 text-xs font-medium text-muted-foreground">
 Term
 </th>
 <th className="text-right px-3 py-1.5 text-xs font-medium text-muted-foreground">
 Monthly
 </th>
 <th className="text-right px-3 py-1.5 text-xs font-medium text-muted-foreground">
 Annual
 </th>
 <th className="text-right px-3 py-1.5 text-xs font-medium text-muted-foreground">
 Total Paid
 </th>
 </tr>
 </thead>
 <tbody>
 {premiumTable.map((row) => (
 <tr key={row.term} className="border-b border-border">
 <td className="px-3 py-1.5 font-medium">{row.term}-Year Term</td>
 <td className="px-3 py-1.5 text-right text-green-400">${row.monthly}/mo</td>
 <td className="px-3 py-1.5 text-right">${Number(row.annual).toLocaleString()}</td>
 <td className="px-3 py-1.5 text-right text-muted-foreground">
 ${Number(row.total).toLocaleString()}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Estimates only. Actual premiums depend on full medical underwriting, state, and insurer.
 </p>
 </div>

 {/* DIME calculator */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 DIME Needs Analysis — Debt + Income + Mortgage + Education
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
 {[
 { label: "Annual Income ($)", value: annualIncome, setter: setAnnualIncome, step: 5000 },
 { label: "Years to Replace", value: yearsNeeded, setter: setYearsNeeded, step: 1 },
 { label: "Total Debt ($)", value: debt, setter: setDebt, step: 5000 },
 { label: "Mortgage Balance ($)", value: mortgage, setter: setMortgage, step: 10000 },
 { label: "Education Costs ($)", value: education, setter: setEducation, step: 5000 },
 ].map(({ label, value, setter, step }) => (
 <div key={label}>
 <label className="text-xs text-muted-foreground block mb-0.5">{label}</label>
 <input
 type="number"
 value={value}
 step={step}
 onChange={(e) => setter(Number(e.target.value))}
 className="w-full bg-muted border border-border rounded px-2 py-1 text-sm"
 />
 </div>
 ))}
 </div>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
 {[
 { key: "D", label: "Debt", value: dime.D, color: "amber" as const },
 { key: "I", label: "Income", value: dime.I, color: "blue" as const },
 { key: "M", label: "Mortgage", value: dime.M, color: "purple" as const },
 { key: "E", label: "Education", value: dime.E, color: "green" as const },
 { key: "Total", label: "Coverage Needed", value: dime.total, color: "default" as const },
 ].map(({ key, label, value, color }) => (
 <StatChip key={key} label={label} value={`$${(value / 1000).toFixed(0)}K`} color={color} />
 ))}
 </div>
 </div>

 {/* Buy term + invest vs whole */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Buy Term + Invest Difference vs Whole Life — 20-Year Projection
 </div>
 <TermVsWholeComparisonSVG />
 <div className="grid grid-cols-2 gap-3 mt-3">
 <InfoBox title="Buy Term + Invest ($300/mo total)" variant="green">
 $30/mo term premium, $270/mo invested at 7% = <strong className="text-green-400">~$140K</strong> after 20 years. Death benefit: $500K throughout.
 </InfoBox>
 <InfoBox title="Whole Life ($300/mo)" variant="purple">
 All $300/mo in whole life. Cash value grows ~3%. After 20 years: <strong className="text-foreground">~$55K</strong> cash value with same death benefit.
 </InfoBox>
 </div>
 </div>
 </div>
 );
}

// ── TAB 3: P&C Insurance ──────────────────────────────────────────────────────

function PremiumFactorSVG() {
 // Bar chart showing relative premium multipliers for different risk factors
 const factors = [
 { category: "Driving Record", items: [
 { label: "Clean (3 yrs)", mult: 1.0 },
 { label: "1 Speeding Ticket", mult: 1.18 },
 { label: "At-Fault Accident", mult: 1.42 },
 { label: "DUI", mult: 2.1 },
 ]},
 { category: "Credit Score", items: [
 { label: "800+", mult: 0.85 },
 { label: "700–800", mult: 1.0 },
 { label: "600–700", mult: 1.25 },
 { label: "< 600", mult: 1.65 },
 ]},
 ];

 const W = 520;
 const H = 220;
 const PAD = { t: 16, r: 20, b: 36, l: 160 };
 const iW = W - PAD.l - PAD.r;
 const iH = H - PAD.t - PAD.b;
 const barH = 16;
 const groupGap = 12;

 const allItems = factors.flatMap((f, gi) =>
 f.items.map((item, ii) => ({ ...item, gi, ii, groupLabel: ii === 0 ? f.category : "" }))
 );
 const totalRows = allItems.length + factors.length - 1; // +gaps between groups
 const rowH = iH / totalRows;

 let rowIdx = 0;
 const rows = factors.flatMap((f, gi) => {
 const result = f.items.map((item, ii) => {
 const y = PAD.t + rowIdx * rowH;
 rowIdx++;
 return { ...item, y, groupLabel: ii === 0 ? f.category : "" };
 });
 if (gi < factors.length - 1) rowIdx += 0.6;
 return result;
 });

 const maxMult = 2.2;
 const scale = (v: number) => (v / maxMult) * iW;
 const baseLine = PAD.l + scale(1.0);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* baseline at 1.0 */}
 <line x1={baseLine} y1={PAD.t - 4} x2={baseLine} y2={H - PAD.b + 4} stroke="#ffffff25" strokeWidth={1} strokeDasharray="3 2" />
 <text x={baseLine} y={H - PAD.b + 14} fontSize={8} fill="#666" textAnchor="middle">1.0×</text>

 {rows.map(({ label, mult, y, groupLabel }) => {
 const color = mult < 1 ? "#22c55e" : mult <= 1.2 ? "#f59e0b" : mult <= 1.5 ? "#f97316" : "#ef4444";
 return (
 <g key={label}>
 {groupLabel && (
 <text x={PAD.l - 6} y={y - 2} fontSize={8} fill="#888" textAnchor="end" fontStyle="italic">
 {groupLabel}
 </text>
 )}
 <text x={PAD.l - 6} y={y + barH / 2 + 3} fontSize={9} fill="#bbb" textAnchor="end">
 {label}
 </text>
 <rect
 x={PAD.l}
 y={y}
 width={scale(mult)}
 height={barH}
 fill={color + "50"}
 rx={2}
 />
 <rect
 x={PAD.l + scale(mult) - 2}
 y={y + 2}
 width={2}
 height={barH - 4}
 fill={color}
 rx={1}
 />
 <text x={PAD.l + scale(mult) + 6} y={y + barH / 2 + 3} fontSize={9} fill={color} fontWeight="600">
 {mult.toFixed(2)}×
 </text>
 </g>
 );
 })}
 </svg>
 );
}

function PCTab() {
 const [expanded, setExpanded] = useState<string | null>("auto");

 const coverages = [
 {
 key: "auto",
 title: "Auto Insurance",
 required: true,
 sections: [
 {
 name: "Bodily Injury Liability",
 required: true,
 desc: "Pays others for injuries you cause. State minimums (e.g., 25/50K) are often insufficient — consider 100/300K or umbrella.",
 },
 {
 name: "Property Damage Liability",
 required: true,
 desc: "Pays for damage you cause to others' property. Minimum $25K rarely covers modern vehicle repairs.",
 },
 {
 name: "Collision",
 required: false,
 desc: "Pays for your vehicle damage from an accident regardless of fault. Drop when car value < 10× annual premium.",
 },
 {
 name: "Comprehensive",
 required: false,
 desc: "Covers theft, weather, animals, vandalism. Often bundled with collision. Low deductible ($250) rarely makes sense on older cars.",
 },
 {
 name: "Uninsured/Underinsured Motorist",
 required: false,
 desc: "Covers you when the at-fault driver is uninsured. ~12.6% of US drivers have no insurance — highly recommended.",
 },
 {
 name: "Medical Payments / PIP",
 required: false,
 desc: "Covers medical expenses for you/passengers regardless of fault. PIP (no-fault states) is mandatory in 12 states.",
 },
 ],
 },
 {
 key: "home",
 title: "Homeowners Insurance",
 required: false,
 sections: [
 {
 name: "Dwelling Coverage (Coverage A)",
 required: true,
 desc: "Rebuilds your home structure. Should equal replacement cost (not market value). Update annually for construction cost inflation.",
 },
 {
 name: "Personal Property (Coverage C)",
 required: false,
 desc: "Covers belongings inside your home. Actual cash value (ACV) pays depreciated value; replacement cost pays to replace new.",
 },
 {
 name: "Liability (Coverage E)",
 required: false,
 desc: "Protects if someone is injured on your property. $300K standard; consider umbrella for additional protection.",
 },
 {
 name: "Additional Living Expense (Coverage D)",
 required: false,
 desc: "Pays hotel/rental costs while home is being repaired. Critical for major losses.",
 },
 ],
 },
 {
 key: "umbrella",
 title: "Umbrella / Excess Liability",
 required: false,
 sections: [
 {
 name: "Personal Umbrella",
 required: false,
 desc: "Provides $1M–$10M+ in excess liability above your auto/home policies. Costs ~$200–400/yr per $1M. Essential for high net worth individuals, doctors, landlords.",
 },
 {
 name: "Umbrella Trigger",
 required: false,
 desc: "Activates once underlying policy limits are exhausted. Also covers some claims not in underlying policy (defamation, false arrest).",
 },
 ],
 },
 {
 key: "business",
 title: "Business Insurance",
 required: false,
 sections: [
 {
 name: "Commercial General Liability (CGL)",
 required: false,
 desc: "Covers bodily injury, property damage, and advertising injury arising from business operations.",
 },
 {
 name: "Errors & Omissions (E&O)",
 required: false,
 desc: "Professional liability — covers lawsuits arising from mistakes or negligence in professional services. Required for lawyers, doctors, financial advisors.",
 },
 {
 name: "Directors & Officers (D&O)",
 required: false,
 desc: "Protects corporate officers from personal liability for decisions made in their official capacity.",
 },
 {
 name: "Cyber Liability",
 required: false,
 desc: "Covers data breaches, ransomware, business interruption from cyber attacks. Fastest-growing line — avg breach cost $4.5M (IBM 2023).",
 },
 ],
 },
 ];

 return (
 <div className="space-y-4">
 <SectionHeader
 title="Property & Casualty Insurance"
 subtitle="Auto, home, umbrella, and commercial coverage — what to buy and why"
 />

 {/* Premium factors */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Premium Multipliers by Risk Factor (Base = Clean Record / Good Credit)
 </div>
 <PremiumFactorSVG />
 </div>

 {/* Coverage accordion */}
 <div className="space-y-2">
 {coverages.map((cov) => (
 <div key={cov.key} className="rounded-lg border border-border overflow-hidden">
 <button
 className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
 onClick={() => setExpanded(expanded === cov.key ? null : cov.key)}
 >
 <div className="flex items-center gap-2">
 <Shield size={14} className="text-muted-foreground/50" />
 <span className="text-sm font-medium">{cov.title}</span>
 {cov.required && (
 <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
 Lender Required
 </Badge>
 )}
 </div>
 <span className="text-muted-foreground text-xs">{expanded === cov.key ? "▲" : "▼"}</span>
 </button>
 {expanded === cov.key && (
 <div className="divide-y divide-border/50">
 {cov.sections.map((sec) => (
 <div key={sec.name} className="p-3 flex gap-3">
 {sec.required ? (
 <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
 ) : (
 <Info size={14} className="text-foreground flex-shrink-0 mt-0.5" />
 )}
 <div>
 <div className="text-xs text-muted-foreground font-medium">{sec.name}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{sec.desc}</div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>

 {/* ACV vs replacement cost */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoBox title="ACV (Actual Cash Value)" variant="amber">
 Pays replacement cost minus depreciation. A 5-year-old $3,000 sofa with 50% depreciation
 pays <strong>$1,500</strong>. Good for older items with significant wear.
 </InfoBox>
 <InfoBox title="Replacement Cost Value (RCV)" variant="green">
 Pays the full cost to replace with a new item of like kind and quality. Premiums run 10–15%
 higher but vastly better for major losses like roof or HVAC replacement.
 </InfoBox>
 </div>

 {/* Claims process */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Claims Process Timeline
 </div>
 <div className="flex flex-wrap gap-2 items-center">
 {[
 "Loss Occurs",
 "File Claim (24–48hrs)",
 "Adjuster Assigned",
 "Investigation",
 "Damage Assessment",
 "Settlement Offer",
 "Payment / Subrogation",
 ].map((step, i, arr) => (
 <div key={step} className="flex items-center gap-2">
 <div className="flex items-center gap-1">
 <div className="w-5 h-5 rounded-full bg-muted/10 text-foreground text-[11px] flex items-center justify-center font-semibold">
 {i + 1}
 </div>
 <span className="text-xs text-muted-foreground">{step}</span>
 </div>
 {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 <strong>Subrogation:</strong> After paying your claim, the insurer sues the at-fault party
 to recover their costs. If successful, you may receive your deductible back.
 </p>
 </div>
 </div>
 );
}

// ── TAB 4: Reinsurance & Cat Bonds ────────────────────────────────────────────

function CatBondSpreadSVG() {
 // Scatter plot: Expected Loss (x) vs Spread (y) for cat bonds
 resetSeed(42);
 const bonds = Array.from({ length: 24 }, (_, i) => ({
 el: 0.5 + rand() * 5.5, // expected loss 0.5–6%
 id: i,
 })).map((b) => ({
 ...b,
 spread: b.el * (1.8 + rand() * 0.8) + rand() * 0.5, // spread = EL * risk premium + noise
 type: rand() > 0.5 ? "Wind" : rand() > 0.5 ? "Quake" : "Multi-Peril",
 }));

 const W = 500;
 const H = 200;
 const PAD = { t: 20, r: 80, b: 40, l: 50 };
 const iW = W - PAD.l - PAD.r;
 const iH = H - PAD.t - PAD.b;
 const maxX = 7;
 const maxY = 14;

 const toSvg = (x: number, y: number) => ({
 sx: PAD.l + (x / maxX) * iW,
 sy: PAD.t + ((maxY - y) / maxY) * iH,
 });

 // Best fit line
 const n = bonds.length;
 const xMean = bonds.reduce((a, b) => a + b.el, 0) / n;
 const yMean = bonds.reduce((a, b) => a + b.spread, 0) / n;
 const slope = bonds.reduce((a, b) => a + (b.el - xMean) * (b.spread - yMean), 0) /
 bonds.reduce((a, b) => a + (b.el - xMean) ** 2, 0);
 const intercept = yMean - slope * xMean;

 const lineStart = toSvg(0, intercept);
 const lineEnd = toSvg(maxX, intercept + slope * maxX);

 const typeColors: Record<string, string> = {
 Wind: "#3b82f6",
 Quake: "#f59e0b",
 "Multi-Peril": "#a855f7",
 };

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {[0, 2, 4, 6, 8, 10, 12].map((y) => {
 const sy = PAD.t + ((maxY - y) / maxY) * iH;
 return (
 <g key={y}>
 <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="#ffffff10" strokeWidth={1} />
 <text x={PAD.l - 6} y={sy + 4} fontSize={9} fill="#888" textAnchor="end">{y}%</text>
 </g>
 );
 })}
 {[0, 1, 2, 3, 4, 5, 6, 7].map((x) => {
 const { sx } = toSvg(x, 0);
 return (
 <g key={x}>
 <line x1={sx} y1={PAD.t} x2={sx} y2={H - PAD.b} stroke="#ffffff08" strokeWidth={1} />
 <text x={sx} y={H - PAD.b + 12} fontSize={9} fill="#666" textAnchor="middle">{x}%</text>
 </g>
 );
 })}
 <text x={W / 2} y={H - 2} fontSize={9} fill="#666" textAnchor="middle">Expected Loss (%)</text>
 <text x={12} y={H / 2} fontSize={9} fill="#666" textAnchor="middle" transform={`rotate(-90, 12, ${H / 2})`}>Spread (%)</text>

 {/* best fit */}
 <line x1={lineStart.sx} y1={lineStart.sy} x2={lineEnd.sx} y2={lineEnd.sy} stroke="#ffffff30" strokeWidth={1.5} strokeDasharray="4 2" />

 {bonds.map((b) => {
 const { sx, sy } = toSvg(b.el, b.spread);
 return (
 <circle key={b.id} cx={sx} cy={sy} r={4} fill={typeColors[b.type] + "90"} stroke={typeColors[b.type]} strokeWidth={0.5} />
 );
 })}

 {/* legend */}
 {Object.entries(typeColors).map(([type, color], i) => (
 <g key={type} transform={`translate(${W - PAD.r + 8}, ${PAD.t + i * 16})`}>
 <circle cx={4} cy={4} r={4} fill={color + "90"} stroke={color} strokeWidth={0.5} />
 <text x={12} y={8} fontSize={9} fill={color}>{type}</text>
 </g>
 ))}
 </svg>
 );
}

function ReinsuranceTab() {
 const structures = [
 {
 title: "Proportional (Quota Share)",
 icon: <Percent size={14} />,
 color: "blue",
 desc: "Insurer cedes a fixed % of every risk and premium to the reinsurer. E.g., 40% quota share: reinsurer receives 40% of premiums and pays 40% of every loss. Simple, reduces capital requirements.",
 example: "Primary insurer writes $1M in homeowners policies. Under 40% quota share, reinsurer receives $400K in premiums and pays 40% of all claims.",
 },
 {
 title: "Proportional (Surplus Share)",
 icon: <Layers size={14} />,
 color: "blue",
 desc: "Insurer retains risks up to a retention limit; amounts above that are ceded proportionally. More sophisticated than quota share — allows retention of small risks while transferring large ones.",
 example: "Retention: $500K. Policy: $2M. Cession ratio = 75%. Reinsurer receives 75% of premium and pays 75% of losses.",
 },
 {
 title: "Excess of Loss (XoL)",
 icon: <BarChart3 size={14} />,
 color: "amber",
 desc: "Reinsurer pays losses above a retention threshold up to a limit. Per-risk or per-occurrence. Does not share proportionally — reinsurer only pays when loss exceeds attachment point.",
 example: "$5M xs $1M: Reinsurer pays losses between $1M–$6M. Loss of $4M: Primary pays $1M, reinsurer pays $3M. Loss of $800K: Primary pays all.",
 },
 {
 title: "Catastrophe (Cat) XoL",
 icon: <AlertTriangle size={14} />,
 color: "red",
 desc: "Covers aggregate losses from a single catastrophe event (hurricane, earthquake) above attachment. Multiple layers stacked: e.g., $100M xs $50M, $200M xs $150M.",
 example: "Hurricane causes $300M in insured losses. Layer 1 ($100M xs $50M) pays $100M. Layer 2 ($200M xs $150M) pays $150M.",
 },
 {
 title: "Facultative Reinsurance",
 icon: <Building2 size={14} />,
 color: "purple",
 desc: "One-off negotiation for specific, unusual, or large individual risks. Primary insurer selects which risks to cede; reinsurer may accept or decline each one. Higher transaction costs.",
 example: "Insuring a $2B offshore oil platform. Primary insurer retains $100M, places $1.9B through facultative reinsurance with multiple reinsurers.",
 },
 ];

 const ilsStats = [
 { label: "ILS Market Size", value: "$100B+", color: "blue" as const },
 { label: "Cat Bond Outstanding", value: "$45B", color: "green" as const },
 { label: "Avg Cat Bond Spread", value: "5–8%", color: "amber" as const },
 { label: "Corr. to S&P 500", value: "~0.0", color: "green" as const },
 { label: "Typical Trigger", value: "Parametric", color: "purple" as const },
 { label: "Maturity", value: "3–5 yrs", color: "default" as const },
 ];

 return (
 <div className="space-y-4">
 <SectionHeader
 title="Reinsurance & Catastrophe Bonds"
 subtitle="How insurers lay off risk — from quota shares to ILS markets"
 />

 {/* Reinsurance structures */}
 <div className="space-y-3">
 {structures.map((s) => {
 const borderMap: Record<string, string> = {
 blue: "border-border bg-muted/5",
 amber: "border-amber-500/30 bg-amber-500/5",
 red: "border-red-500/30 bg-red-500/5",
 purple: "border-border bg-muted/5",
 };
 const iconMap: Record<string, string> = {
 blue: "text-foreground",
 amber: "text-amber-400",
 red: "text-red-400",
 purple: "text-foreground",
 };
 return (
 <div key={s.title} className={cn("rounded-lg border p-4", borderMap[s.color])}>
 <div className="flex items-center gap-2 mb-1">
 <span className={iconMap[s.color]}>{s.icon}</span>
 <span className="text-sm font-medium">{s.title}</span>
 </div>
 <p className="text-xs text-muted-foreground mb-2">{s.desc}</p>
 <div className="bg-muted/30 rounded px-3 py-2 text-xs text-foreground/80 border border-border">
 <span className="font-medium text-muted-foreground">Example: </span>
 {s.example}
 </div>
 </div>
 );
 })}
 </div>

 {/* ILS / Cat bonds */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 ILS (Insurance-Linked Securities) — Cat Bond Spread vs Expected Loss
 </div>
 <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
 {ilsStats.map((s) => (
 <StatChip key={s.label} label={s.label} value={s.value} color={s.color} />
 ))}
 </div>
 <CatBondSpreadSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Spread ≈ Expected Loss × 2–3× (risk multiplier). Low correlation to equities makes cat bonds
 valuable portfolio diversifiers for institutional investors.
 </p>
 </div>

 {/* Cat bond triggers */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {[
 {
 title: "Indemnity Trigger",
 desc: "Pays based on actual losses to the sponsor. Best alignment but slow settlement; requires loss development.",
 pros: "Perfect hedge for sponsor",
 cons: "Moral hazard, slow settlement",
 color: "green" as const,
 },
 {
 title: "Parametric Trigger",
 desc: "Pays based on physical event parameters (wind speed, earthquake magnitude). Fast, transparent settlement.",
 pros: "Rapid payout, no moral hazard",
 cons: "Basis risk (event ≠ actual loss)",
 color: "blue" as const,
 },
 {
 title: "Industry Loss Index",
 desc: "Pays when total industry losses exceed a threshold (e.g., PCS index). Compromise between indemnity and parametric.",
 pros: "Lower basis risk than parametric",
 cons: "Correlation but not perfect hedge",
 color: "amber" as const,
 },
 ].map((t) => (
 <InfoBox key={t.title} title={t.title} variant={t.color}>
 <p className="mb-1">{t.desc}</p>
 <p className="text-green-400 text-xs">+ {t.pros}</p>
 <p className="text-red-400 text-xs">- {t.cons}</p>
 </InfoBox>
 ))}
 </div>
 </div>
 );
}

// ── TAB 5: InsurTech & Risk Analytics ─────────────────────────────────────────

function ClaimsFrequencySVG() {
 resetSeed(55);
 // Bar chart: traditional vs telematics-priced loss ratios by driver risk segment
 const segments = [
 { label: "Low Risk", traditional: 55, telematics: 48 },
 { label: "Med-Low", traditional: 68, telematics: 65 },
 { label: "Medium", traditional: 82, telematics: 80 },
 { label: "Med-High", traditional: 95, telematics: 97 },
 { label: "High Risk", traditional: 118, telematics: 132 },
 ];

 const W = 500;
 const H = 200;
 const PAD = { t: 20, r: 20, b: 50, l: 50 };
 const iW = W - PAD.l - PAD.r;
 const iH = H - PAD.t - PAD.b;
 const groupW = iW / segments.length;
 const barW = groupW * 0.35;
 const maxY = 150;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {[0, 50, 100, 150].map((y) => {
 const sy = PAD.t + ((maxY - y) / maxY) * iH;
 return (
 <g key={y}>
 <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="#ffffff10" strokeWidth={1} />
 <text x={PAD.l - 6} y={sy + 4} fontSize={9} fill="#888" textAnchor="end">{y}%</text>
 </g>
 );
 })}
 {/* 100% line */}
 {(() => {
 const sy = PAD.t + ((maxY - 100) / maxY) * iH;
 return <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="#f59e0b50" strokeWidth={1} strokeDasharray="3 2" />;
 })()}

 {segments.map(({ label, traditional, telematics }, i) => {
 const cx = PAD.l + groupW * i + groupW / 2;
 const tradH = (traditional / maxY) * iH;
 const telH = (telematics / maxY) * iH;
 return (
 <g key={label}>
 <rect
 x={cx - barW - 2}
 y={PAD.t + iH - tradH}
 width={barW}
 height={tradH}
 fill="#3b82f660"
 rx={2}
 />
 <rect
 x={cx + 2}
 y={PAD.t + iH - telH}
 width={barW}
 height={telH}
 fill="#22c55e60"
 rx={2}
 />
 <text x={cx} y={H - PAD.b + 12} fontSize={9} fill="#aaa" textAnchor="middle">{label}</text>
 <text x={cx - barW / 2 - 2} y={PAD.t + iH - tradH - 3} fontSize={8} fill="#3b82f6" textAnchor="middle">{traditional}</text>
 <text x={cx + barW / 2 + 2} y={PAD.t + iH - telH - 3} fontSize={8} fill="#22c55e" textAnchor="middle">{telematics}</text>
 </g>
 );
 })}

 {/* legend */}
 <rect x={PAD.l} y={H - 14} width={10} height={8} fill="#3b82f660" rx={1} />
 <text x={PAD.l + 14} y={H - 7} fontSize={8} fill="#3b82f6">Traditional Rating</text>
 <rect x={PAD.l + 100} y={H - 14} width={10} height={8} fill="#22c55e60" rx={1} />
 <text x={PAD.l + 114} y={H - 7} fontSize={8} fill="#22c55e">Telematics-Based</text>
 <text x={PAD.l + 210} y={H - 7} fontSize={8} fill="#f59e0b">— 100% combined breakeven</text>
 </svg>
 );
}

function InsurTechTab() {
 const trends = [
 {
 title: "Telematics / Usage-Based Insurance",
 icon: <Activity size={14} />,
 color: "blue",
 desc: "Smartphone or OBD-II device tracks miles driven, speed, braking, time-of-day. Low-mileage, safe drivers save 10–40% vs traditional rating. High-risk drivers self-select out or pay more.",
 examples: ["Progressive Snapshot", "Allstate Drivewise", "Root Insurance (telematics-first)"],
 },
 {
 title: "Parametric Insurance",
 icon: <Zap size={14} />,
 color: "amber",
 desc: "Pays automatically when a measurable trigger occurs (e.g., wind speed ≥ 120mph, earthquake ≥ 6.5 Mw). No claims adjusters needed — payout within 24–72 hours. Ideal for business interruption, agriculture, disaster relief.",
 examples: ["Swiss Re's crop insurance (NDVI satellite)", "Caribbean CCRIF", "Ariel Re FloodFlash"],
 },
 {
 title: "Predictive Modeling & ML",
 icon: <BarChart3 size={14} />,
 color: "green",
 desc: "Gradient boosting and neural networks trained on claims history, third-party data, and telematics. Predict claims frequency, severity, and fraud probability. ISO and Verisk license models; Lemonade uses AI for instant claims.",
 examples: ["XGBoost claim severity models", "Neural network fraud detection", "Computer vision for roof damage (Hover, Cape Analytics)"],
 },
 {
 title: "Cyber Insurance",
 icon: <Shield size={14} />,
 color: "red",
 desc: "Fastest-growing specialty line. Covers: data breach notification costs, ransomware payment/recovery, business interruption, third-party liability, regulatory fines. Underwriting still evolving — systemic risk (NotPetya) challenges traditional models.",
 examples: ["Coalition, At-Bay (digital-first)", "Coverage for NotPetya excluded as 'act of war'", "Lloyd's cybercrime market"],
 },
 {
 title: "Climate Risk & Uninsurability",
 icon: <AlertTriangle size={14} />,
 color: "amber",
 desc: "Remodeling of catastrophe models to account for climate change. State Farm and Allstate stopped writing new homeowners policies in California (wildfire), Florida (hurricane). UN estimates $1T annual climate losses by 2050. 'Protection gap' widening in high-risk zones.",
 examples: ["CA FAIR Plan as insurer of last resort", "Jupiter Intelligence climate risk scoring", "FEMA flood maps lag actual risk by 20+ years"],
 },
 {
 title: "InsurTech Disruptors",
 icon: <Building2 size={14} />,
 color: "purple",
 desc: "B2C: Lemonade (AI-powered renters/home/pet), Oscar Health (tech-enabled individual health). B2B: Hippo (smart home sensors), Pie Insurance (SMB workers comp). Most struggle with combined ratios > 100% and CAC. Traditional carriers often beat them on cost.",
 examples: ["Lemonade CR: 90–120% (volatile)", "Oscar Health: finally near-profitable 2023", "Many InsurTech IPOs down 70–90% from peak"],
 },
 ];

 const colorBorder: Record<string, string> = {
 blue: "border-border bg-muted/5",
 amber: "border-amber-500/30 bg-amber-500/5",
 green: "border-green-500/30 bg-green-500/5",
 red: "border-red-500/30 bg-red-500/5",
 purple: "border-border bg-muted/5",
 };
 const colorText: Record<string, string> = {
 blue: "text-foreground",
 amber: "text-amber-400",
 green: "text-green-400",
 red: "text-red-400",
 purple: "text-foreground",
 };

 return (
 <div className="space-y-4">
 <SectionHeader
 title="InsurTech & Risk Analytics"
 subtitle="Technology transforming insurance — telematics, parametric, AI, and climate risk"
 />

 {/* Telematics chart */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Traditional vs Telematics Loss Ratios by Risk Segment
 </div>
 <ClaimsFrequencySVG />
 <p className="text-xs text-muted-foreground mt-2">
 Telematics sharpens pricing: low-risk drivers see lower loss ratios (underpaid by traditional
 methods) while high-risk drivers show worse outcomes than traditional models predict.
 </p>
 </div>

 {/* Trends grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {trends.map((t) => (
 <div key={t.title} className={cn("rounded-lg border p-4", colorBorder[t.color])}>
 <div className="flex items-center gap-2 mb-2">
 <span className={colorText[t.color]}>{t.icon}</span>
 <span className="text-sm font-medium">{t.title}</span>
 </div>
 <p className="text-xs text-muted-foreground mb-2">{t.desc}</p>
 <div className="space-y-0.5">
 {t.examples.map((ex) => (
 <div key={ex} className="text-xs text-foreground/70 flex gap-1">
 <span className={colorText[t.color]}>•</span>
 <span>{ex}</span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

// ── TAB 6: Insurer Investment Portfolio ────────────────────────────────────────

function DurationMatchingSVG() {
 const W = 500;
 const H = 200;
 const PAD = { t: 20, r: 20, b: 36, l: 50 };
 const iW = W - PAD.l - PAD.r;
 const iH = H - PAD.t - PAD.b;

 // Asset and liability duration profiles
 const assetBuckets = [
 { label: "0–2yr", assetPct: 15, liabPct: 5 },
 { label: "2–5yr", assetPct: 25, liabPct: 12 },
 { label: "5–10yr", assetPct: 30, liabPct: 22 },
 { label: "10–20yr", assetPct: 20, liabPct: 31 },
 { label: "20–30yr", assetPct: 7, liabPct: 20 },
 { label: "30yr+", assetPct: 3, liabPct: 10 },
 ];

 const n = assetBuckets.length;
 const groupW = iW / n;
 const barW = groupW * 0.38;
 const maxY = 35;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {[0, 10, 20, 30].map((y) => {
 const sy = PAD.t + ((maxY - y) / maxY) * iH;
 return (
 <g key={y}>
 <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="#ffffff10" strokeWidth={1} />
 <text x={PAD.l - 6} y={sy + 4} fontSize={9} fill="#888" textAnchor="end">{y}%</text>
 </g>
 );
 })}

 {assetBuckets.map(({ label, assetPct, liabPct }, i) => {
 const cx = PAD.l + groupW * i + groupW / 2;
 const assetH = (assetPct / maxY) * iH;
 const liabH = (liabPct / maxY) * iH;
 const mismatch = Math.abs(assetPct - liabPct) > 5;
 return (
 <g key={label}>
 <rect x={cx - barW - 2} y={PAD.t + iH - assetH} width={barW} height={assetH} fill="#3b82f660" rx={2} />
 <rect x={cx + 2} y={PAD.t + iH - liabH} width={barW} height={liabH} fill="#f59e0b60" rx={2} />
 {mismatch && (
 <text x={cx} y={PAD.t + iH - Math.max(assetH, liabH) - 5} fontSize={8} fill="#ef4444" textAnchor="middle">!</text>
 )}
 <text x={cx} y={H - PAD.b + 12} fontSize={8} fill="#aaa" textAnchor="middle">{label}</text>
 </g>
 );
 })}

 {/* legend */}
 <rect x={PAD.l} y={H - 14} width={10} height={8} fill="#3b82f660" rx={1} />
 <text x={PAD.l + 14} y={H - 7} fontSize={8} fill="#3b82f6">Assets</text>
 <rect x={PAD.l + 55} y={H - 14} width={10} height={8} fill="#f59e0b60" rx={1} />
 <text x={PAD.l + 69} y={H - 7} fontSize={8} fill="#f59e0b">Liabilities</text>
 <text x={PAD.l + 130} y={H - 7} fontSize={8} fill="#ef4444">! = Duration Mismatch Risk</text>
 </svg>
 );
}

function StockPerformanceSVG() {
 resetSeed(66);
 const tickers = [
 { name: "Progressive", color: "#22c55e" },
 { name: "Berkshire B", color: "#3b82f6" },
 { name: "Travelers", color: "#a855f7" },
 { name: "S&P 500", color: "#f59e0b" },
 ];

 const years = 5;
 const bars = years * 12;

 // Generate cumulative returns
 const series = tickers.map((t) => {
 resetSeed(t.name.charCodeAt(0) * 7 + 31);
 const annualReturn = t.name === "Progressive" ? 0.20 : t.name === "Berkshire B" ? 0.14 : t.name === "Travelers" ? 0.12 : 0.11;
 const vol = t.name === "S&P 500" ? 0.15 : 0.18;
 let val = 100;
 const points = [val];
 for (let i = 0; i < bars; i++) {
 val *= 1 + annualReturn / 12 + (rand() - 0.5) * vol / Math.sqrt(12);
 points.push(val);
 }
 return { ...t, points };
 });

 const W = 520;
 const H = 200;
 const PAD = { t: 20, r: 100, b: 36, l: 50 };
 const iW = W - PAD.l - PAD.r;
 const iH = H - PAD.t - PAD.b;
 const allVals = series.flatMap((s) => s.points);
 const minV = Math.min(...allVals) * 0.95;
 const maxV = Math.max(...allVals) * 1.05;

 const toSvg = (x: number, y: number) => ({
 sx: PAD.l + (x / bars) * iW,
 sy: PAD.t + ((maxV - y) / (maxV - minV)) * iH,
 });

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {[100, 150, 200, 250].map((v) => {
 const { sy } = toSvg(0, v);
 if (v < minV || v > maxV) return null;
 return (
 <g key={v}>
 <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="#ffffff10" strokeWidth={1} />
 <text x={PAD.l - 6} y={sy + 4} fontSize={9} fill="#888" textAnchor="end">{v}</text>
 </g>
 );
 })}
 {[0, 1, 2, 3, 4, 5].map((yr) => {
 const { sx } = toSvg(yr * 12, 0);
 const label = `${2019 + yr}`;
 return (
 <text key={yr} x={sx} y={H - PAD.b + 12} fontSize={9} fill="#666" textAnchor="middle">{label}</text>
 );
 })}

 {series.map((s) => {
 const pathD = s.points
 .map((v, i) => {
 const { sx, sy } = toSvg(i, v);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 })
 .join("");
 return <path key={s.name} d={pathD} stroke={s.color} strokeWidth={1.5} fill="none" />;
 })}

 {/* legend */}
 {series.map((s, i) => {
 const lastVal = s.points[s.points.length - 1];
 return (
 <g key={s.name} transform={`translate(${W - PAD.r + 8}, ${PAD.t + i * 20})`}>
 <line x1={0} y1={5} x2={14} y2={5} stroke={s.color} strokeWidth={2} />
 <text x={18} y={9} fontSize={9} fill={s.color}>
 {s.name} ({lastVal.toFixed(0)})
 </text>
 </g>
 );
 })}
 </svg>
 );
}

function InvestmentTab() {
 const allocationData = [
 {
 type: "Life Insurer",
 bonds: 60,
 equities: 30,
 alternatives: 7,
 cash: 3,
 duration: "15–25 yrs",
 color: "blue" as const,
 },
 {
 type: "P&C Insurer",
 bonds: 80,
 equities: 15,
 alternatives: 3,
 cash: 2,
 duration: "3–7 yrs",
 color: "amber" as const,
 },
 {
 type: "Berkshire Hathaway",
 bonds: 8,
 equities: 70,
 alternatives: 2,
 cash: 20,
 duration: "Varies",
 color: "green" as const,
 },
 ];

 const naicCategories = [
 { class: "NAIC 1", desc: "Investment-grade bonds (BBB- or better)", charge: "0.3%", color: "green" as const },
 { class: "NAIC 2", desc: "Below investment grade (BB)", charge: "1.0%", color: "green" as const },
 { class: "NAIC 3", desc: "Non-investment grade (B)", charge: "2.0%", color: "amber" as const },
 { class: "NAIC 4", desc: "Highly speculative (CCC)", charge: "4.5%", color: "amber" as const },
 { class: "NAIC 5", desc: "In or near default", charge: "10.0%", color: "red" as const },
 { class: "NAIC 6", desc: "In default / no market", charge: "30.0%", color: "red" as const },
 ];

 return (
 <div className="space-y-4">
 <SectionHeader
 title="Insurer Investment Portfolio"
 subtitle="$7T in US insurance AUM — asset allocation, duration matching, and equity performance"
 />

 {/* Industry AUM stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="US Insurance AUM" value="$7.0T" color="blue" />
 <StatChip label="Life Insurer AUM" value="$5.1T" color="green" />
 <StatChip label="P&C Insurer AUM" value="$1.9T" color="amber" />
 <StatChip label="Berkshire Float" value="$168B" color="purple" />
 </div>

 {/* Asset allocation table */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Typical Asset Allocation by Insurer Type
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Type</th>
 <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Bonds</th>
 <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Equities</th>
 <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Alts</th>
 <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Cash</th>
 <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Liab. Duration</th>
 </tr>
 </thead>
 <tbody>
 {allocationData.map((r) => (
 <tr key={r.type} className="border-b border-border">
 <td className="px-3 py-2 font-medium">{r.type}</td>
 <td className="px-3 py-2 text-right text-foreground">{r.bonds}%</td>
 <td className="px-3 py-2 text-right text-green-400">{r.equities}%</td>
 <td className="px-3 py-2 text-right text-amber-400">{r.alternatives}%</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{r.cash}%</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{r.duration}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Duration matching */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Duration Matching — Life Insurer Asset vs Liability Duration Profile
 </div>
 <DurationMatchingSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Life insurers aim to match asset duration to liability duration. Mismatches create interest
 rate risk: if liabilities are longer than assets, rising rates hurt the insurer. The 10–20yr
 and 20–30yr buckets show a typical mismatch where liabilities exceed available long assets.
 </p>
 </div>

 {/* Stock performance */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 Major Insurer Stock Performance — 5-Year Rebased to 100
 </div>
 <StockPerformanceSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Progressive has outperformed by combining disciplined underwriting with telematics-driven
 pricing advantage. Berkshire's equity concentration in Apple drove outperformance 2020–2021.
 </p>
 </div>

 {/* NAIC risk-based capital */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="text-xs font-medium text-muted-foreground mb-3">
 NAIC Risk-Based Capital (RBC) Charges by Bond Quality
 </div>
 <div className="space-y-1.5">
 {naicCategories.map((n) => {
 const chargeNum = parseFloat(n.charge);
 const barW = Math.min(100, chargeNum * 3); // scale for display
 return (
 <div key={n.class} className="flex items-center gap-3">
 <div className="w-14 text-xs font-mono font-medium text-muted-foreground flex-shrink-0">
 {n.class}
 </div>
 <div className="flex-1 flex items-center gap-2">
 <div className="h-4 rounded text-[11px] flex items-center px-1.5 font-medium min-w-[2rem]"
 style={{
 width: `${barW}%`,
 backgroundColor:
 n.color === "green" ? "#22c55e30" : n.color === "amber" ? "#f59e0b30" : "#ef444430",
 color:
 n.color === "green" ? "#22c55e" : n.color === "amber" ? "#f59e0b" : "#ef4444",
 }}>
 {n.charge}
 </div>
 <span className="text-xs text-muted-foreground">{n.desc}</span>
 </div>
 </div>
 );
 })}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 RBC charges determine how much capital insurers must hold per dollar of assets. NAIC 1 bonds
 require only $0.003 of capital per $1; NAIC 6 require $0.30. This incentivizes investment-grade
 portfolios and limits equity/junk bond exposure.
 </p>
 </div>

 {/* Two income sources */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoBox title="Underwriting Income" variant="green">
 Earned when combined ratio &lt; 100%. Pure profitability from pricing risk correctly. Progressive has
 maintained combined ratio &lt; 96% consistently — a rarity in the industry. Most P&C insurers
 break even or lose money on underwriting in competitive years.
 </InfoBox>
 <InfoBox title="Investment Income" variant="blue">
 Returns on the investment portfolio funded by float. Life insurers depend heavily on investment
 income — spread between portfolio yield (e.g., 4.5%) and crediting rate on policies (e.g., 3.5%)
 is the core life insurer profit driver. Low-rate environment 2010–2021 severely compressed margins.
 </InfoBox>
 </div>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InsurancePage() {
 const tabs = [
 { value: "fundamentals", label: "Fundamentals", icon: <Shield size={13} /> },
 { value: "life", label: "Life Insurance", icon: <DollarSign size={13} /> },
 { value: "pc", label: "P&C", icon: <Building2 size={13} /> },
 { value: "reinsurance", label: "Reinsurance", icon: <Layers size={13} /> },
 { value: "insurtech", label: "InsurTech", icon: <Zap size={13} /> },
 { value: "investment", label: "Investment", icon: <TrendingUp size={13} /> },
 ];

 return (
 <div className="p-4 md:p-4 max-w-5xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 {/* Page header */}
 <div className="mb-6">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-9 h-9 rounded-lg bg-muted/10 flex items-center justify-center">
 <Shield size={18} className="text-muted-foreground/50" />
 </div>
 <div>
 <h1 className="text-2xl font-semibold">Insurance & Risk Transfer</h1>
 <p className="text-sm text-muted-foreground">
 From actuarial pricing to catastrophe bonds — the $7T industry that underlies the financial system
 </p>
 </div>
 </div>
 <div className="flex flex-wrap gap-2 mt-3">
 <Badge className="bg-muted/10 text-foreground border-border text-xs">Risk Pooling</Badge>
 <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-xs">Float Leverage</Badge>
 <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs">Combined Ratio</Badge>
 <Badge className="bg-muted/10 text-foreground border-border text-xs">Cat Bonds</Badge>
 <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/25 text-xs">ILS Market</Badge>
 </div>
 </div>

 {/* Hero */}
 <div className="rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
 <h2 className="text-lg font-medium text-foreground mb-1">Insurance Industry Deep Dive</h2>
 <p className="text-sm text-muted-foreground">Fundamentals, life insurance, P&amp;C, reinsurance, InsurTech, and investment strategies across the $7T industry.</p>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="fundamentals" className="mt-8">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 {tabs.map((tab) => (
 <TabsTrigger
 key={tab.value}
 value={tab.value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 <span className="hidden sm:inline">{tab.label}</span>
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="fundamentals" className="data-[state=inactive]:hidden">
 <FundamentalsTab />
 </TabsContent>
 <TabsContent value="life" className="data-[state=inactive]:hidden">
 <LifeTab />
 </TabsContent>
 <TabsContent value="pc" className="data-[state=inactive]:hidden">
 <PCTab />
 </TabsContent>
 <TabsContent value="reinsurance" className="data-[state=inactive]:hidden">
 <ReinsuranceTab />
 </TabsContent>
 <TabsContent value="insurtech" className="data-[state=inactive]:hidden">
 <InsurTechTab />
 </TabsContent>
 <TabsContent value="investment" className="data-[state=inactive]:hidden">
 <InvestmentTab />
 </TabsContent>
 </Tabs>
 </motion.div>
 </div>
 );
}
