"use client";

import { useState, useMemo } from "react";
import {
 TrendingDown,
 TrendingUp,
 AlertTriangle,
 Shield,
 BarChart3,
 BookOpen,
 Zap,
 Info,
 ChevronDown,
 ChevronRight,
 Activity,
 Scale,
 Target,
 DollarSign,
} from "lucide-react";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
} from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 682008;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
function resetSeed() {
 s = 682008;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SqueezePoint {
 bar: number;
 price: number;
 shortInterest: number;
 phase: "accumulation" | "squeeze" | "blowoff" | "normalization";
}

interface ThesisCriterion {
 category: string;
 signal: string;
 weight: number;
 description: string;
}

interface FamousShort {
 name: string;
 ticker: string;
 year: string;
 activist: string;
 thesis: string;
 outcome: string;
 returnPct: number;
 lesson: string;
 color: string;
}

interface EMHForm {
 form: string;
 definition: string;
 implication: string;
 evidence: string;
 counterEvidence: string;
}

// ── Short Squeeze Data (GME case study) ──────────────────────────────────────
function generateSqueezeData(): SqueezePoint[] {
 resetSeed();
 const points: SqueezePoint[] = [];
 let price = 20;
 let shortInterest = 140;

 for (let bar = 0; bar < 60; bar++) {
 let phase: SqueezePoint["phase"];
 if (bar < 15) phase = "accumulation";
 else if (bar < 35) phase = "squeeze";
 else if (bar < 45) phase = "blowoff";
 else phase = "normalization";

 if (phase === "accumulation") {
 price *= 1 + (rand() - 0.45) * 0.04;
 shortInterest += (rand() - 0.3) * 3;
 } else if (phase === "squeeze") {
 price *= 1 + (rand() * 0.12 + 0.04);
 shortInterest -= rand() * 6 + 2;
 } else if (phase === "blowoff") {
 if (bar < 38) {
 price *= 1 + rand() * 0.15;
 } else {
 price *= 1 - rand() * 0.12;
 }
 shortInterest -= rand() * 4;
 } else {
 price *= 1 + (rand() - 0.6) * 0.06;
 shortInterest += (rand() - 0.5) * 2;
 }

 price = Math.max(price, 5);
 shortInterest = Math.max(Math.min(shortInterest, 150), 20);
 points.push({ bar, price, shortInterest, phase });
 }
 return points;
}

// ── Thesis Scoring Rubric ────────────────────────────────────────────────────
const THESIS_CRITERIA: ThesisCriterion[] = [
 {
 category: "Accounting",
 signal: "Revenue recognition issues",
 weight: 20,
 description: "Channel stuffing, aggressive booking, round-trip transactions",
 },
 {
 category: "Accounting",
 signal: "Auditor red flags",
 weight: 15,
 description: "Frequent auditor changes, going concern, restatements",
 },
 {
 category: "Business Model",
 signal: "Unit economics deteriorating",
 weight: 18,
 description: "CAC rising, LTV falling, gross margins compressing",
 },
 {
 category: "Business Model",
 signal: "Customer concentration",
 weight: 10,
 description: "Top 3 customers >50% revenue, churn accelerating",
 },
 {
 category: "Competitive",
 signal: "Disruption underway",
 weight: 15,
 description: "New entrant with 10x better product at lower cost",
 },
 {
 category: "Competitive",
 signal: "Moat erosion",
 weight: 12,
 description: "Patent expiry, regulatory change, commoditization",
 },
 {
 category: "Valuation",
 signal: "Extreme premium vs peers",
 weight: 10,
 description: "EV/Revenue > 5x sector average with slowing growth",
 },
];

// ── Famous Shorts ─────────────────────────────────────────────────────────────
const FAMOUS_SHORTS: FamousShort[] = [
 {
 name: "Enron",
 ticker: "ENE",
 year: "2001",
 activist: "Jim Chanos",
 thesis:
 "Special Purpose Entities hiding debt, mark-to-market manipulation, return on capital below cost of capital",
 outcome: "Bankrupt Dec 2001, stock went from $90 to $0",
 returnPct: 98,
 lesson:
 "Cash flow that never materializes despite reported profits is the clearest fraud signal",
 color: "red",
 },
 {
 name: "Lehman Brothers",
 ticker: "LEH",
 year: "2008",
 activist: "David Einhorn",
 thesis:
 "Real estate exposure understated, Level 3 assets marked at fantasy prices, leverage 30:1",
 outcome: "Bankrupt Sep 2008, largest in US history at $600B",
 returnPct: 97,
 lesson:
 "When management refuses to answer direct questions about asset quality, that IS the answer",
 color: "amber",
 },
 {
 name: "Wirecard",
 ticker: "WDI",
 year: "2020",
 activist: "FT / Fraser Perring",
 thesis:
 "€1.9B in escrow accounts that did not exist, Asian operations fabricated, auditors complicit",
 outcome: "Insolvent Jun 2020, CEO arrested, $24B market cap destroyed",
 returnPct: 99,
 lesson:
 "When regulators attack the short sellers instead of investigating the allegations, a massive fraud is likely underway",
 color: "red",
 },
 {
 name: "Archegos",
 ticker: "Various",
 year: "2021",
 activist: "Risk managers at prime brokers",
 thesis:
 "Concentrated leveraged positions via Total Return Swaps created hidden systemic risk",
 outcome: "Forced liquidation wiped $30B+, banks lost billions",
 returnPct: 85,
 lesson:
 "Swap-based leverage can hide true ownership concentration — always check prime broker exposure",
 color: "purple",
 },
 {
 name: "Nikola",
 ticker: "NKLA",
 year: "2020",
 activist: "Hindenburg Research",
 thesis:
 "Trucks had no working powertrains, hydrogen station vaporware, founder misrepresented technology",
 outcome: "Founder indicted, stock fell 90%+ from highs",
 returnPct: 89,
 lesson:
 "When a company films its product rolling downhill to simulate driving, that's a short",
 color: "amber",
 },
];

// ── EMH Forms ─────────────────────────────────────────────────────────────────
const EMH_FORMS: EMHForm[] = [
 {
 form: "Weak Form",
 definition: "Prices reflect all historical trading information",
 implication: "Technical analysis cannot generate alpha consistently",
 evidence: "Random walk tests, autocorrelation near zero in liquid markets",
 counterEvidence: "Momentum anomaly (12-1 month), calendar effects",
 },
 {
 form: "Semi-Strong Form",
 definition: "Prices reflect all publicly available information",
 implication:
 "Fundamental analysis cannot generate alpha consistently either",
 evidence: "Rapid post-announcement price adjustment, most funds underperform",
 counterEvidence:
 "Post-earnings drift (PEAD), value premium, quality factor",
 },
 {
 form: "Strong Form",
 definition: "Prices reflect all information including insider knowledge",
 implication: "Even insiders cannot consistently profit",
 evidence: "—",
 counterEvidence:
 "Insider trading is illegal but profitable (SEC enforcement data)",
 },
];

// ── Color helpers ─────────────────────────────────────────────────────────────
const phaseColor: Record<SqueezePoint["phase"], string> = {
 accumulation: "#6366f1",
 squeeze: "#f59e0b",
 blowoff: "#ef4444",
 normalization: "#22c55e",
};

// ── Short Squeeze SVG Diagram ─────────────────────────────────────────────────
function SqueezeChart({ data }: { data: SqueezePoint[] }) {
 const W = 560;
 const H = 260;
 const PAD = { top: 18, right: 20, bottom: 44, left: 52 };

 const prices = data.map((d) => d.price);
 const minP = Math.min(...prices);
 const maxP = Math.max(...prices);
 const sis = data.map((d) => d.shortInterest);
 const minSI = Math.min(...sis);
 const maxSI = Math.max(...sis);

 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 const toX = (bar: number) =>
 PAD.left + (bar / (data.length - 1)) * chartW;
 const toYPrice = (p: number) =>
 PAD.top + chartH - ((p - minP) / (maxP - minP + 0.001)) * chartH;
 const toYSI = (si: number) =>
 PAD.top + chartH - ((si - minSI) / (maxSI - minSI + 0.001)) * chartH;

 const pricePath = data
 .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.bar).toFixed(1)},${toYPrice(d.price).toFixed(1)}`)
 .join(" ");

 const siPath = data
 .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.bar).toFixed(1)},${toYSI(d.shortInterest).toFixed(1)}`)
 .join(" ");

 // Phase background bands
 const phases: Array<{ from: number; to: number; phase: SqueezePoint["phase"] }> = [
 { from: 0, to: 15, phase: "accumulation" },
 { from: 15, to: 35, phase: "squeeze" },
 { from: 35, to: 45, phase: "blowoff" },
 { from: 45, to: 60, phase: "normalization" },
 ];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px]">
 <defs>
 <clipPath id="chartClip">
 <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} />
 </clipPath>
 </defs>

 {/* Phase bands */}
 {phases.map((ph) => (
 <rect
 key={ph.phase}
 x={toX(ph.from)}
 y={PAD.top}
 width={toX(ph.to) - toX(ph.from)}
 height={chartH}
 fill={phaseColor[ph.phase]}
 opacity={0.08}
 />
 ))}

 {/* Phase labels */}
 {phases.map((ph) => (
 <text
 key={`lbl-${ph.phase}`}
 x={(toX(ph.from) + toX(ph.to)) / 2}
 y={PAD.top + 11}
 textAnchor="middle"
 fontSize={9}
 fill={phaseColor[ph.phase]}
 opacity={0.9}
 fontWeight={600}
 >
 {ph.phase.charAt(0).toUpperCase() + ph.phase.slice(1)}
 </text>
 ))}

 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1].map((t) => {
 const y = PAD.top + t * chartH;
 return (
 <line
 key={`grid-${t}`}
 x1={PAD.left}
 x2={W - PAD.right}
 y1={y}
 y2={y}
 stroke="#ffffff12"
 strokeWidth={1}
 />
 );
 })}

 {/* SI line (dashed) */}
 <path
 d={siPath}
 fill="none"
 stroke="#6366f1"
 strokeWidth={1.5}
 strokeDasharray="4 3"
 clipPath="url(#chartClip)"
 opacity={0.7}
 />

 {/* Price line */}
 <path
 d={pricePath}
 fill="none"
 stroke="#f59e0b"
 strokeWidth={2.5}
 clipPath="url(#chartClip)"
 />

 {/* Axes */}
 <line
 x1={PAD.left}
 x2={PAD.left}
 y1={PAD.top}
 y2={PAD.top + chartH}
 stroke="#ffffff30"
 strokeWidth={1}
 />
 <line
 x1={PAD.left}
 x2={W - PAD.right}
 y1={PAD.top + chartH}
 y2={PAD.top + chartH}
 stroke="#ffffff30"
 strokeWidth={1}
 />

 {/* Y axis labels */}
 {[minP, (minP + maxP) / 2, maxP].map((v, i) => (
 <text
 key={`yp-${i}`}
 x={PAD.left - 6}
 y={toYPrice(v) + 4}
 textAnchor="end"
 fontSize={9}
 fill="#ffffff60"
 >
 ${Math.round(v)}
 </text>
 ))}

 {/* X axis bar labels */}
 {[0, 15, 30, 45, 59].map((bar) => (
 <text
 key={`xbar-${bar}`}
 x={toX(bar)}
 y={H - 10}
 textAnchor="middle"
 fontSize={9}
 fill="#ffffff50"
 >
 Bar {bar + 1}
 </text>
 ))}

 {/* Legend */}
 <line x1={W - 120} x2={W - 105} y1={H - 28} y2={H - 28} stroke="#f59e0b" strokeWidth={2.5} />
 <text x={W - 102} y={H - 24} fontSize={9} fill="#f59e0b">Price</text>
 <line x1={W - 72} x2={W - 57} y1={H - 28} y2={H - 28} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" />
 <text x={W - 54} y={H - 24} fontSize={9} fill="#6366f1">SI%</text>
 </svg>
 );
}

// ── P&L Payoff SVG ────────────────────────────────────────────────────────────
function ShortPnLChart() {
 const W = 420;
 const H = 220;
 const PAD = { top: 20, right: 20, bottom: 40, left: 52 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 const entryPrice = 100;
 const prices = Array.from({ length: 41 }, (_, i) => i * 5 + 20); // 20 to 220
 const pnls = prices.map((p) => entryPrice - p); // short P&L = entry - current

 const minPnl = Math.min(...pnls);
 const maxPnl = Math.max(...pnls);
 const minP = prices[0];
 const maxP = prices[prices.length - 1];

 const toX = (price: number) =>
 PAD.left + ((price - minP) / (maxP - minP)) * chartW;
 const toY = (pnl: number) =>
 PAD.top + chartH - ((pnl - minPnl) / (maxPnl - minPnl)) * chartH;

 const profitPath = prices
 .filter((p) => p <= entryPrice)
 .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p).toFixed(1)},${toY(entryPrice - p).toFixed(1)}`)
 .join(" ");

 const lossPath = prices
 .filter((p) => p >= entryPrice)
 .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p).toFixed(1)},${toY(entryPrice - p).toFixed(1)}`)
 .join(" ");

 const fullPath = prices
 .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p).toFixed(1)},${toY(entryPrice - p).toFixed(1)}`)
 .join(" ");

 const zeroY = toY(0);
 const entryX = toX(entryPrice);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px]">
 {/* Loss fill */}
 <clipPath id="lossClip">
 <rect x={entryX} y={PAD.top} width={W - PAD.right - entryX} height={chartH} />
 </clipPath>
 {/* Profit fill area */}
 <clipPath id="profitClip">
 <rect x={PAD.left} y={PAD.top} width={entryX - PAD.left} height={chartH} />
 </clipPath>

 {/* Zero line */}
 <line x1={PAD.left} x2={W - PAD.right} y1={zeroY} y2={zeroY} stroke="#ffffff25" strokeDasharray="4 3" />
 <text x={PAD.left - 4} y={zeroY + 4} fontSize={8} fill="#ffffff40" textAnchor="end">0</text>

 {/* Profit shading */}
 <path
 d={`${profitPath} L${entryX},${zeroY} L${toX(minP)},${zeroY} Z`}
 fill="#22c55e"
 opacity={0.15}
 />
 {/* Loss shading */}
 <path
 d={`${lossPath} L${toX(maxP)},${zeroY} L${entryX},${zeroY} Z`}
 fill="#ef4444"
 opacity={0.15}
 />

 {/* Main P&L line */}
 <path d={fullPath} fill="none" stroke="#6366f1" strokeWidth={2.5} />

 {/* Entry marker */}
 <circle cx={entryX} cy={zeroY} r={4} fill="#f59e0b" />
 <text x={entryX} y={zeroY - 8} textAnchor="middle" fontSize={9} fill="#f59e0b">
 Entry $100
 </text>

 {/* Axes */}
 <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + chartH} stroke="#ffffff30" />
 <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + chartH} y2={PAD.top + chartH} stroke="#ffffff30" />

 {/* Y labels */}
 {[minPnl, 0, maxPnl].map((v, i) => (
 <text key={`y-${i}`} x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill={v > 0 ? "#22c55e" : v < 0 ? "#ef4444" : "#ffffff60"}>
 {v > 0 ? "+" : ""}{Math.round(v)}
 </text>
 ))}

 {/* X labels */}
 {[20, 60, 100, 140, 180, 220].map((p) => (
 <text key={`x-${p}`} x={toX(p)} y={H - 10} textAnchor="middle" fontSize={9} fill="#ffffff50">
 ${p}
 </text>
 ))}

 {/* Annotations */}
 <text x={PAD.left + 10} y={PAD.top + 16} fontSize={9} fill="#22c55e" fontWeight={600}>Profit Zone</text>
 <text x={W - PAD.right - 5} y={PAD.top + 16} fontSize={9} fill="#ef4444" fontWeight={600} textAnchor="end">Unlimited Loss</text>
 </svg>
 );
}

// ── Scoring rubric component ──────────────────────────────────────────────────
function RubricRow({ criterion }: { criterion: ThesisCriterion }) {
 const [expanded, setExpanded] = useState(false);
 return (
 <div className="border-b border-border last:border-0">
 <button
 onClick={() => setExpanded(!expanded)}
 className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
 >
 <div
 className="w-1.5 h-1.5 rounded-full shrink-0"
 style={{ backgroundColor: criterion.category === "Accounting" ? "#ef4444" : criterion.category === "Business Model" ? "#f59e0b" : criterion.category === "Competitive" ? "#6366f1" : "#22c55e" }}
 />
 <span className="text-xs text-muted-foreground w-24 shrink-0">{criterion.category}</span>
 <span className="text-sm text-foreground flex-1">{criterion.signal}</span>
 <Badge variant="outline" className="text-xs text-muted-foreground shrink-0 border-border">
 {criterion.weight}pts
 </Badge>
 {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
 </button>
 
 {expanded && (
 <div
 className="overflow-hidden"
 >
 <p className="px-4 pb-3 pl-12 text-xs text-muted-foreground">{criterion.description}</p>
 </div>
 )}
 
 </div>
 );
}

// ── Famous short case card ────────────────────────────────────────────────────
function FamousShortCard({ short }: { short: FamousShort }) {
 const [expanded, setExpanded] = useState(false);
 const colorMap: Record<string, string> = {
 red: "border-red-500/30 bg-red-500/5",
 amber: "border-amber-500/30 bg-amber-500/5",
 purple: "border-border bg-primary/5",
 green: "border-green-500/30 bg-green-500/5",
 };
 const badgeColorMap: Record<string, string> = {
 red: "bg-red-500/20 text-red-300 border-red-500/30",
 amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
 purple: "bg-primary/20 text-primary border-border",
 green: "bg-green-500/20 text-green-300 border-green-500/30",
 };

 return (
 <div
 className={`rounded-md border p-4 cursor-pointer transition-colors hover:bg-muted/30 ${colorMap[short.color] ?? colorMap.amber}`}
 onClick={() => setExpanded(!expanded)}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="font-semibold text-foreground">{short.name}</span>
 <Badge variant="outline" className={`text-xs text-muted-foreground ${badgeColorMap[short.color] ?? ""}`}>
 {short.ticker}
 </Badge>
 <span className="text-xs text-muted-foreground">{short.year}</span>
 </div>
 <p className="text-xs text-muted-foreground mt-0.5">by {short.activist}</p>
 </div>
 <div className="text-right shrink-0">
 <div className="text-lg font-bold text-green-400">+{short.returnPct}%</div>
 <div className="text-xs text-muted-foreground">gain</div>
 </div>
 </div>

 
 {expanded && (
 <div
 className="overflow-hidden"
 >
 <div className="mt-4 space-y-3">
 <div>
 <p className="text-xs text-muted-foreground font-semibold mb-1">Thesis</p>
 <p className="text-sm text-muted-foreground">{short.thesis}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground font-semibold mb-1">Outcome</p>
 <p className="text-sm text-muted-foreground">{short.outcome}</p>
 </div>
 <div className="rounded-lg bg-foreground/5 p-3 border border-border">
 <div className="flex gap-2">
 <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
 <p className="text-xs text-muted-foreground">{short.lesson}</p>
 </div>
 </div>
 </div>
 </div>
 )}
 

 <div className="mt-2 flex justify-end">
 {expanded ? (
 <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
 ) : (
 <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
 )}
 </div>
 </div>
 );
}

// ── EMH Form Card ─────────────────────────────────────────────────────────────
function EMHCard({ form, idx }: { form: EMHForm; idx: number }) {
 const colors = ["indigo", "violet", "purple"] as const;
 const color = colors[idx % colors.length];
 const borderMap = { indigo: "border-indigo-500/30", violet: "border-border", purple: "border-border" };
 const bgMap = { indigo: "bg-indigo-500/5", violet: "bg-primary/5", purple: "bg-primary/5" };
 const titleMap = { indigo: "text-indigo-300", violet: "text-primary", purple: "text-primary" };

 return (
 <Card className={`border ${borderMap[color]} ${bgMap[color]} bg-transparent`}>
 <CardHeader className="pb-3">
 <CardTitle className={`text-base ${titleMap[color]}`}>{form.form}</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-sm">
 <div>
 <span className="text-xs text-muted-foreground font-medium">Definition</span>
 <p className="text-muted-foreground mt-1">{form.definition}</p>
 </div>
 <div>
 <span className="text-xs text-muted-foreground font-medium">Implication</span>
 <p className="text-muted-foreground mt-1">{form.implication}</p>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2">
 <p className="text-xs text-green-400 font-medium mb-1">Supporting</p>
 <p className="text-xs text-muted-foreground">{form.evidence}</p>
 </div>
 <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
 <p className="text-xs text-red-400 font-medium mb-1">Anomalies</p>
 <p className="text-xs text-muted-foreground">{form.counterEvidence}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value, sub }: { label: string; value: string; sub?: string }) {
 return (
 <div className="rounded-md border border-border bg-foreground/5 px-4 py-3 text-center">
 <div className="text-lg font-bold text-foreground">{value}</div>
 <div className="text-xs text-muted-foreground">{label}</div>
 {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ShortSellingPage() {
 const [activeTab, setActiveTab] = useState("mechanics");
 const [selectedThesisScore, setSelectedThesisScore] = useState<number[]>([]);

 const squeezeData = useMemo(() => generateSqueezeData(), []);

 const thesisScore = useMemo(() => {
 if (selectedThesisScore.length === 0) return 0;
 return selectedThesisScore.reduce((sum, idx) => sum + (THESIS_CRITERIA[idx]?.weight ?? 0), 0);
 }, [selectedThesisScore]);

 const toggleThesis = (idx: number) => {
 setSelectedThesisScore((prev) =>
 prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
 );
 };

 const conviction =
 thesisScore >= 60
 ? { label: "High Conviction", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" }
 : thesisScore >= 35
 ? { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" }
 : { label: "Weak / Pass", color: "text-muted-foreground", bg: "bg-muted-foreground/20 border-muted-foreground/30" };

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Short Selling</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">BORROW · SQUEEZE · CATALYSTS · CONVICTION</p>

 {/* Stats row */}
 <div className="grid grid-cols-3 gap-3 mb-6">
 <StatChip label="Avg SI (S&P 500)" value="2.4%" sub="% float" />
 <StatChip label="GME Peak SI" value="140%" sub="Jan 2021" />
 <StatChip label="Borrow Rate Range" value="0.3–85%" sub="annualized" />
 </div>

 <div className="border-t border-border mb-6" />

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 {[
 { value: "mechanics", label: "Short Mechanics", icon: Activity },
 { value: "thesis", label: "Thesis Framework", icon: Target },
 { value: "risk", label: "Risk Management", icon: Shield },
 { value: "famous", label: "Famous Shorts", icon: BookOpen },
 { value: "emh", label: "Market Efficiency", icon: Scale },
 ].map(({ value, label, icon: Icon }) => (
 <TabsTrigger
 key={value}
 value={value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground flex items-center gap-1.5"
 >
 <Icon className="w-3.5 h-3.5" />
 {label}
 </TabsTrigger>
 ))}
 </TabsList>

 {/* ── TAB 1: Short Mechanics ─────────────────────────────────── */}
 <TabsContent value="mechanics" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 {/* Process flow */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <Activity className="w-4 h-4 text-indigo-400" />
 Borrow & Locate Process
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 {
 step: "1",
 title: "Locate",
 desc: "Broker confirms shares available to borrow from institutional holders or other clients",
 color: "border-indigo-500/30 text-indigo-300",
 bg: "bg-indigo-500/5",
 },
 {
 step: "2",
 title: "Borrow",
 desc: "Shares are transferred to short seller's account. Borrow rate accrues daily (0.3%–85% p.a.)",
 color: "border-border text-primary",
 bg: "bg-primary/5",
 },
 {
 step: "3",
 title: "Sell",
 desc: "Short seller sells borrowed shares into the market at current market price",
 color: "border-amber-500/30 text-amber-300",
 bg: "bg-amber-500/5",
 },
 {
 step: "4",
 title: "Cover",
 desc: "Buy-back shares at (hopefully) lower price, return to lender, profit = entry − exit − borrow cost",
 color: "border-green-500/30 text-green-300",
 bg: "bg-green-500/5",
 },
 ].map((item) => (
 <div key={item.step} className={`rounded-md border ${item.color} ${item.bg} p-4`}>
 <div className={`text-2xl font-bold mb-1 ${item.color.split(" ")[1]}`}>{item.step}</div>
 <div className={`font-medium text-sm mb-1.5 ${item.color.split(" ")[1]}`}>{item.title}</div>
 <p className="text-xs text-muted-foreground">{item.desc}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Short interest metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <BarChart3 className="w-4 h-4 text-amber-400" />
 Short Interest Metrics
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {[
 {
 metric: "Short Interest % Float",
 formula: "Shorted Shares / Float",
 interpretation: "< 5% normal; 10–20% elevated; > 25% extreme squeeze risk",
 alert: "> 25%",
 },
 {
 metric: "Days to Cover (DTC)",
 formula: "Short Interest / Avg Daily Volume",
 interpretation: "How many days it would take all shorts to cover. DTC > 5 = squeeze risk",
 alert: "> 5",
 },
 {
 metric: "Borrow Rate",
 formula: "Annualized cost to maintain short",
 interpretation: "Hard-to-borrow names can cost 50–85% p.a. — a significant headwind",
 alert: "> 30%",
 },
 {
 metric: "Cost-to-Borrow Trend",
 formula: "Rate change week-over-week",
 interpretation: "Rising borrow rate signals increasing demand to short or depleting supply",
 alert: "Rising fast",
 },
 ].map((row) => (
 <div key={row.metric} className="rounded-lg bg-foreground/5 border border-border p-3">
 <div className="flex items-center justify-between mb-1">
 <span className="text-sm font-medium text-foreground">{row.metric}</span>
 <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
 Watch: {row.alert}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground font-mono mb-1">{row.formula}</p>
 <p className="text-xs text-muted-foreground">{row.interpretation}</p>
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Squeeze diagram */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <Zap className="w-4 h-4 text-red-400" />
 Short Squeeze Anatomy — GME Case Study
 </CardTitle>
 <p className="text-xs text-muted-foreground mt-1">
 Price (amber) vs short interest % (indigo dashed). Jan 2021: SI peaked at 140% of float — an unprecedented level that triggered a historic squeeze.
 </p>
 </CardHeader>
 <CardContent>
 <SqueezeChart data={squeezeData} />
 <div className="mt-4 grid grid-cols-2 gap-2">
 {(Object.entries(phaseColor) as Array<[SqueezePoint["phase"], string]>).map(([phase, color]) => (
 <div key={phase} className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
 <span className="text-xs text-muted-foreground capitalize">{phase}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* P&L diagram */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <DollarSign className="w-4 h-4 text-green-400" />
 Short Seller P&L Profile
 </CardTitle>
 <p className="text-xs text-muted-foreground mt-1">
 Unlike a long position (max loss = cost), a short has theoretically unlimited downside. Profit is capped at 100% (stock goes to zero), but losses are unbounded.
 </p>
 </CardHeader>
 <CardContent className="flex flex-col md:flex-row items-start gap-3">
 <ShortPnLChart />
 <div className="space-y-3 flex-1">
 <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
 <p className="text-xs text-green-400 font-medium mb-1">Maximum Profit</p>
 <p className="text-sm text-muted-foreground">100% — only if stock goes to zero (rare). Entry price × shares = max gain.</p>
 </div>
 <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
 <p className="text-xs text-red-400 font-medium mb-1">Unlimited Loss</p>
 <p className="text-sm text-muted-foreground">No theoretical ceiling. A stock at $10 can go to $1,000. This is the fundamental asymmetry of shorting.</p>
 </div>
 <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
 <p className="text-xs text-amber-400 font-medium mb-1">Additional Costs</p>
 <p className="text-sm text-muted-foreground">Borrow fees, dividends passed through to lender, margin interest, and potential forced buy-ins.</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 2: Thesis Framework ────────────────────────────────── */}
 <TabsContent value="thesis" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Accounting Fraud Signals",
 icon: AlertTriangle,
 color: "text-red-400",
 border: "border-red-500/30",
 bg: "bg-red-500/5",
 items: [
 "Revenue recognized before delivery",
 "Gross margin inconsistent with peers",
 "Receivables growing faster than revenue",
 "Inventory build with flat/falling revenue",
 "Related-party transactions off-balance-sheet",
 "Management selling shares aggressively",
 ],
 },
 {
 title: "Business Model Deterioration",
 icon: TrendingDown,
 color: "text-amber-400",
 border: "border-amber-500/30",
 bg: "bg-amber-500/5",
 items: [
 "CAC rising, payback period lengthening",
 "Net revenue retention below 100%",
 "Key customer churn accelerating",
 "Gross margin compression multi-quarter",
 "Headcount growth outpacing revenue",
 "Free cash flow burn accelerating",
 ],
 },
 {
 title: "Overvaluation Signals",
 icon: BarChart3,
 color: "text-indigo-400",
 border: "border-indigo-500/30",
 bg: "bg-indigo-500/5",
 items: [
 "EV/Revenue > 5x peers with slowing growth",
 "TAM assumption requires 100% market share",
 "Stock price outrunning any fundamental model",
 "Analyst price targets require heroic assumptions",
 "Multiple expansion in tightening rate environment",
 "Heavily promoted on retail social platforms",
 ],
 },
 ].map((section) => (
 <Card key={section.title} className={`border ${section.border} ${section.bg} bg-transparent`}>
 <CardHeader className="pb-3">
 <CardTitle className={`flex items-center gap-2 text-sm ${section.color}`}>
 <section.icon className="w-4 h-4" />
 {section.title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-1.5">
 {section.items.map((item) => (
 <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
 <div className="w-1 h-1 rounded-full bg-muted mt-1.5 shrink-0" />
 {item}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Scoring rubric */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2 text-base">
 <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
 Interactive Conviction Scorer
 </CardTitle>
 <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${conviction.bg} ${conviction.color}`}>
 {thesisScore}/100 — {conviction.label}
 </div>
 </div>
 <p className="text-xs text-muted-foreground mt-1">Check the signals present in your short thesis to calculate conviction score</p>
 </CardHeader>
 <CardContent className="p-0">
 {THESIS_CRITERIA.map((criterion, idx) => (
 <div key={idx} className="border-b border-border last:border-0">
 <button
 onClick={() => toggleThesis(idx)}
 className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
 >
 <div
 className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
 selectedThesisScore.includes(idx)
 ? "bg-indigo-500 border-indigo-500"
 : "border-border"
 }`}
 >
 {selectedThesisScore.includes(idx) && (
 <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
 <path d="M1 4l3 3 5-6" stroke="white" strokeWidth={1.5} fill="none" strokeLinecap="round" />
 </svg>
 )}
 </div>
 <div
 className="w-1.5 h-1.5 rounded-full shrink-0"
 style={{
 backgroundColor:
 criterion.category === "Accounting"
 ? "#ef4444"
 : criterion.category === "Business Model"
 ? "#f59e0b"
 : criterion.category === "Competitive"
 ? "#6366f1"
 : "#22c55e",
 }}
 />
 <span className="text-xs text-muted-foreground w-24 shrink-0">{criterion.category}</span>
 <span className="text-sm text-foreground flex-1">{criterion.signal}</span>
 <Badge variant="outline" className="text-xs text-muted-foreground shrink-0 border-border">
 {criterion.weight}pts
 </Badge>
 </button>
 <p className="px-4 pb-2 pl-[3.5rem] text-xs text-muted-foreground">{criterion.description}</p>
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Catalysts */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <Zap className="w-4 h-4 text-amber-400" />
 Timing Catalysts — "The Thesis Needs a Trigger"
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { catalyst: "Earnings Miss", desc: "Guidance cut reveals deterioration the market hadn't priced", urgency: "High" },
 { catalyst: "Regulatory Action", desc: "SEC investigation, DOJ subpoena, or class-action filing", urgency: "High" },
 { catalyst: "Credit Downgrade", desc: "Rating cut triggers debt covenant violations or margin calls", urgency: "Medium" },
 { catalyst: "Insider Exit", desc: "CFO/CEO resignation, large block secondary, lockup expiry", urgency: "Medium" },
 ].map((c) => (
 <div key={c.catalyst} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
 <div className="flex items-center justify-between mb-1">
 <span className="text-sm font-medium text-amber-300">{c.catalyst}</span>
 <Badge variant="outline" className={`text-xs ${c.urgency === "High" ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-400"}`}>
 {c.urgency}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">{c.desc}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 3: Risk Management ─────────────────────────────────── */}
 <TabsContent value="risk" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 {/* Unlimited upside warning */}
 <div className="rounded-md border border-red-500/30 bg-red-500/8 p-5 flex gap-4">
 <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
 <div>
 <p className="font-medium text-red-300 mb-1">The Fundamental Asymmetry</p>
 <p className="text-sm text-muted-foreground">
 A long position can lose 100%. A short position can lose 1,000%+ if the stock rises 10x. This unlimited upside risk is what makes short selling categorically different from buying stocks — and why position sizing is more critical than any thesis.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {/* Position sizing */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <Target className="w-4 h-4 text-indigo-400" />
 Position Sizing Rules
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {[
 {
 rule: "Max Gross Short Exposure",
 value: "2–5% per position",
 rationale: "High-conviction shorts rarely exceed 5% of book; fraud shorts sometimes 3%",
 color: "indigo",
 },
 {
 rule: "Portfolio Gross Short Cap",
 value: "30–50% of NAV",
 rationale: "Gross short > 50% creates unacceptable aggregate squeeze risk in rallies",
 color: "violet",
 },
 {
 rule: "Kelly Criterion (short-adjusted)",
 value: "f = (p/l) − ((1−p)/g)",
 rationale: "l = max loss (unlimited), so Kelly recommends very small fractions",
 color: "purple",
 },
 {
 rule: "Hard Stop Loss",
 value: "20–30% adverse move",
 rationale: "Shorts should have predefined stops — unlike longs, momentum can be vicious",
 color: "amber",
 },
 ].map((item) => (
 <div key={item.rule} className="flex gap-3 items-start">
 <div className={`w-1 self-stretch rounded-full`} style={{
 background: item.color === "indigo" ? "#6366f1" : item.color === "violet" ? "#8b5cf6" : item.color === "purple" ? "#a855f7" : "#f59e0b"
 }} />
 <div className="flex-1">
 <div className="flex items-center justify-between">
 <span className="text-sm text-foreground font-medium">{item.rule}</span>
 <Badge variant="outline" className="text-xs text-muted-foreground border-border">{item.value}</Badge>
 </div>
 <p className="text-xs text-muted-foreground mt-0.5">{item.rationale}</p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Pairs trade */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <TrendingDown className="w-4 h-4 text-green-400" />
 Pairs Trade — Hedged Short
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 mb-4">
 <p className="text-sm text-muted-foreground">
 Pair a weak name (short) against a strong name (long) in the same sector to isolate idiosyncratic risk while hedging macro/sector beta.
 </p>
 </div>
 <div className="space-y-2">
 {[
 { long: "AAPL", short: "NOK", sector: "Tech", thesis: "Smartphone leader vs legacy", longBeta: 1.1, shortBeta: 0.9 },
 { long: "JPM", short: "CS", sector: "Banks", thesis: "Best-in-class vs troubled", longBeta: 1.2, shortBeta: 1.4 },
 { long: "TSLA", short: "RIVN", sector: "EV", thesis: "Scale vs cash burn", longBeta: 1.6, shortBeta: 1.8 },
 ].map((pair) => (
 <div key={pair.thesis} className="flex items-center gap-2 bg-foreground/5 rounded-lg p-3">
 <Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">{pair.long}</Badge>
 <TrendingUp className="w-3 h-3 text-green-400" />
 <span className="text-xs text-muted-foreground">vs</span>
 <Badge variant="outline" className="border-red-500/30 text-red-300 text-xs">{pair.short}</Badge>
 <TrendingDown className="w-3 h-3 text-red-400" />
 <span className="text-xs text-muted-foreground flex-1 text-right">{pair.thesis}</span>
 </div>
 ))}
 </div>
 <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
 <div className="flex gap-2">
 <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
 <p className="text-xs text-muted-foreground">Beta-match the pair: if long 1.0x, short 1.0x beta-adjusted to achieve truly market-neutral exposure.</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Timing challenges */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <AlertTriangle className="w-4 h-4 text-amber-400" />
 The Timing Challenge — "Being Early = Being Wrong"
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 challenge: "Irrational Exuberance",
 desc: "A stock can stay overvalued for years. Keynes: 'The market can remain irrational longer than you can remain solvent.'",
 example: "GME short sellers were right about fundamentals — but early shorts got destroyed before the thesis played out",
 color: "red",
 },
 {
 challenge: "Carry Cost Accumulation",
 desc: "At 50% annual borrow rate, you need 50% decline in one year just to break even before transaction costs.",
 example: "Overvalued biotech with 80% borrow: correct thesis still loses money if stock grinds sideways for 18 months",
 color: "amber",
 },
 {
 challenge: "Forced Buy-In Risk",
 desc: "Prime broker can recall shares at any time if the original lender needs them back. You may be forced to cover at the worst price.",
 example: "Hard-to-borrow names during squeezes: prime brokers recall shares when borrow demand exceeds available supply",
 color: "indigo",
 },
 ].map((c) => {
 const borderMap: Record<string, string> = { red: "border-red-500/30", amber: "border-amber-500/30", indigo: "border-indigo-500/30" };
 const bgMap: Record<string, string> = { red: "bg-red-500/5", amber: "bg-amber-500/5", indigo: "bg-indigo-500/5" };
 const titleMap: Record<string, string> = { red: "text-red-300", amber: "text-amber-300", indigo: "text-indigo-300" };
 return (
 <div key={c.challenge} className={`rounded-md border ${borderMap[c.color]} ${bgMap[c.color]} p-4`}>
 <p className={`font-medium text-sm mb-2 ${titleMap[c.color]}`}>{c.challenge}</p>
 <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
 <div className="rounded bg-foreground/5 p-2">
 <p className="text-xs text-muted-foreground italic">{c.example}</p>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 4: Famous Shorts ───────────────────────────────────── */}
 <TabsContent value="famous" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 <div className="rounded-lg border border-border bg-card/50 p-4">
 <div className="flex items-start gap-3">
 <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
 <p className="text-sm text-muted-foreground">
 The most famous short sellers in history share a common trait: they read financial statements obsessively and were willing to be early, undeterred by social pressure. Click any card to expand the full case study.
 </p>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {FAMOUS_SHORTS.map((short) => (
 <FamousShortCard key={short.name} short={short} />
 ))}
 </div>

 {/* Hall of Fame stats */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="text-sm text-muted-foreground">Notable Short-Seller Firms</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 {["Firm", "Founded", "Notable", "Style", "Avg Gain Per Short"].map((h) => (
 <th key={h} className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {[
 { firm: "Kynikos Associates", founded: "1985", notable: "Enron, Tyco, Worldcom", style: "Fundamental fraud", avg: "40–95%" },
 { firm: "Greenlight Capital", founded: "1996", notable: "Lehman, Allied Capital", style: "Deep value analysis", avg: "35–97%" },
 { firm: "Hindenburg Research", founded: "2017", notable: "NKLA, Adani, Clover", style: "Forensic / activist", avg: "25–90%" },
 { firm: "Muddy Waters", founded: "2010", notable: "Sino-Forest, Luckin Coffee", style: "China frauds", avg: "30–99%" },
 { firm: "Citron Research", founded: "2001", notable: "Valeant, MOXC", style: "Consumer expose", avg: "20–80%" },
 ].map((row) => (
 <tr key={row.firm} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-3 py-2.5 text-foreground font-medium">{row.firm}</td>
 <td className="px-3 py-2.5 text-muted-foreground">{row.founded}</td>
 <td className="px-3 py-2.5 text-muted-foreground">{row.notable}</td>
 <td className="px-3 py-2.5">
 <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-300">{row.style}</Badge>
 </td>
 <td className="px-3 py-2.5 text-green-400 font-medium">{row.avg}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 5: Market Efficiency ───────────────────────────────── */}
 <TabsContent value="emh" className="data-[state=inactive]:hidden">
 <div className="space-y-4">
 {/* EMH overview */}
 <div className="rounded-md border border-indigo-500/30 bg-indigo-500/5 p-5">
 <div className="flex items-start gap-3">
 <Scale className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
 <div>
 <p className="font-medium text-indigo-300 mb-1">Efficient Market Hypothesis (Fama, 1970)</p>
 <p className="text-sm text-muted-foreground">
 In an efficient market, security prices at any time fully reflect all available information. If EMH holds in its strongest form, no consistent alpha is achievable — short selling is just as futile as long-side stock picking. However, short sellers argue their activity IS what makes markets more efficient by correcting overpriced stocks.
 </p>
 </div>
 </div>
 </div>

 {/* Three forms */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {EMH_FORMS.map((form, idx) => (
 <EMHCard key={form.form} form={form} idx={idx} />
 ))}
 </div>

 {/* Anomalies vs efficiency debate */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <Activity className="w-4 h-4 text-amber-400" />
 Anomalies vs Efficiency Debate
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <p className="text-sm font-medium text-muted-foreground mb-3">Documented Anomalies (Alpha Sources)</p>
 <div className="space-y-2">
 {[
 { anomaly: "Momentum (12-1)", desc: "Past 12-month winners outperform. Jegadeesh & Titman 1993.", strength: "Strong" },
 { anomaly: "Value Premium", desc: "Low P/B stocks outperform — Fama-French 1992.", strength: "Moderate" },
 { anomaly: "Post-Earnings Drift", desc: "Prices drift in earnings direction for 60+ days.", strength: "Moderate" },
 { anomaly: "Quality Factor", desc: "High-profitability firms generate positive alpha.", strength: "Moderate" },
 { anomaly: "Short-Side Overvaluation", desc: "High-short-interest stocks underperform by 1.5%/month on average.", strength: "Strong" },
 ].map((item) => (
 <div key={item.anomaly} className="flex gap-2 p-2.5 rounded-lg bg-foreground/5 border border-border">
 <Badge
 variant="outline"
 className={`text-xs shrink-0 h-fit ${item.strength === "Strong" ? "border-green-500/30 text-green-400" : "border-amber-500/30 text-amber-400"}`}
 >
 {item.strength}
 </Badge>
 <div>
 <p className="text-xs font-medium text-muted-foreground">{item.anomaly}</p>
 <p className="text-xs text-muted-foreground">{item.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 <div>
 <p className="text-sm font-medium text-muted-foreground mb-3">Limits to Arbitrage (Why Anomalies Persist)</p>
 <div className="space-y-2">
 {[
 { limit: "Noise Trader Risk", desc: "Mispricing can worsen before correcting — rational arb can lose before being right." },
 { limit: "Synchronization Risk", desc: "Multiple arbitrageurs needed simultaneously; if each waits for others, correction delays." },
 { limit: "Fundamental Risk", desc: "The 'substitute' security may not perfectly hedge idiosyncratic risk." },
 { limit: "Short Selling Constraints", desc: "Borrow cost, buy-in risk, and margin requirements limit short-side arbitrage capacity." },
 { limit: "Implementation Shortfall", desc: "Transaction costs, market impact, and slippage erode anomaly profits in practice." },
 ].map((item) => (
 <div key={item.limit} className="flex gap-2 p-2.5 rounded-lg bg-foreground/5 border border-border">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500/80 shrink-0 mt-1.5" />
 <div>
 <p className="text-xs font-medium text-muted-foreground">{item.limit}</p>
 <p className="text-xs text-muted-foreground">{item.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Short selling's role in price discovery */}
 <Card className="border-border bg-card/50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-base">
 <TrendingDown className="w-4 h-4 text-green-400" />
 Short Selling's Role in Price Discovery
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Negative Information Incorporation",
 desc: "Without short sellers, only optimists can express views. Long-only bias creates persistent overvaluation — short sellers bring negative information to prices faster.",
 stat: "~30% faster",
 statLabel: "price correction speed with short selling",
 positive: true,
 },
 {
 title: "Fraud Detection & Deterrence",
 desc: "Activist short sellers (Chanos, Hindenburg) expose accounting frauds that regulators miss. The threat of public short reports disciplines management.",
 stat: "100+",
 statLabel: "major frauds exposed since 2000",
 positive: true,
 },
 {
 title: "Liquidity & Market Making",
 desc: "Short sellers provide liquidity by selling into buying pressure and covering into selling pressure. Restricting shorting (e.g., 2008 financials ban) worsened bid-ask spreads.",
 stat: "40–60%",
 statLabel: "wider spreads during short-selling bans",
 positive: false,
 },
 ].map((item) => (
 <div key={item.title} className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-sm font-medium text-foreground mb-2">{item.title}</p>
 <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
 <div className={`rounded-lg p-2.5 ${item.positive ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/5 border border-red-500/20"}`}>
 <div className={`text-xl font-medium ${item.positive ? "text-green-400" : "text-red-400"}`}>{item.stat}</div>
 <div className="text-xs text-muted-foreground">{item.statLabel}</div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Academic consensus summary */}
 <div className="rounded-md border border-border bg-card/50 p-5">
 <p className="text-sm font-medium text-muted-foreground mb-3">Academic Consensus</p>
 <div className="space-y-2">
 {[
 { point: "Markets are largely efficient in weak and semi-strong forms for large-cap liquid stocks traded by sophisticated investors." },
 { point: "Small-cap, illiquid, or information-opaque markets show more persistent mispricings — creating opportunities for skilled short sellers." },
 { point: "Short selling constraints are a primary explanation for why overvaluation persists longer than undervaluation." },
 { point: "Active short selling improves price efficiency — studies show higher short interest predicts future underperformance with statistical significance." },
 ].map((item, idx) => (
 <div key={idx} className="flex gap-2 text-xs text-muted-foreground">
 <div className="w-4 h-4 rounded-full border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
 <span className="text-indigo-400 text-xs">{idx + 1}</span>
 </div>
 {item.point}
 </div>
 ))}
 </div>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
