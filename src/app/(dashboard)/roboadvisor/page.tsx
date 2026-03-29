"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
 TrendingUp,
 DollarSign,
 Target,
 Shield,
 BarChart3,
 PieChart,
 Cpu,
 CheckCircle,
 AlertTriangle,
 Info,
 Clock,
 ArrowRight,
 Zap,
 Leaf,
 Star,
 ChevronRight,
 Users,
 Globe,
 Lock,
 RefreshCw,
 BrainCircuit,
 Lightbulb,
 TrendingDown,
 Settings,
 Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG ──────────────────────────────────────────────────────────────────────
let s = 702001;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtB(n: number): string {
 if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
 if (n >= 1) return `$${n.toFixed(0)}B`;
 return `$${(n * 1000).toFixed(0)}M`;
}

function fmtDollars(n: number): string {
 if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
 if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
 if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
 return `$${n.toFixed(0)}`;
}

function fmtPct(n: number, d = 2): string {
 return `${n.toFixed(d)}%`;
}

// ── Data ──────────────────────────────────────────────────────────────────────

interface RoboProvider {
 name: string;
 aum: number; // billions
 fee: number; // %
 min: number; // $
 taxLoss: boolean;
 directIndex: boolean;
 humanAccess: boolean;
 esg: boolean;
 color: string;
 rating: number;
 description: string;
}

const PROVIDERS: RoboProvider[] = [
 {
 name: "Betterment",
 aum: 45,
 fee: 0.25,
 min: 0,
 taxLoss: true,
 directIndex: true,
 humanAccess: true,
 esg: true,
 color: "#3b82f6",
 rating: 4.8,
 description: "Pioneer robo-advisor with goals-based investing and premium human advisor access tier.",
 },
 {
 name: "Wealthfront",
 aum: 55,
 fee: 0.25,
 min: 500,
 taxLoss: true,
 directIndex: true,
 humanAccess: false,
 esg: true,
 color: "#10b981",
 rating: 4.7,
 description: "Automation-first platform with advanced tax optimization and Self-Driving Money feature.",
 },
 {
 name: "Schwab Intelligent",
 aum: 88,
 fee: 0.0,
 min: 5000,
 taxLoss: false,
 directIndex: false,
 humanAccess: true,
 esg: false,
 color: "#f59e0b",
 rating: 4.3,
 description: "No-fee robo backed by Schwab's broad brokerage infrastructure. Cash drag is the real cost.",
 },
 {
 name: "Vanguard Digital",
 aum: 310,
 fee: 0.2,
 min: 3000,
 taxLoss: false,
 directIndex: false,
 humanAccess: true,
 esg: true,
 color: "#8b5cf6",
 rating: 4.4,
 description: "Low-cost index fund leader's robo offering with access to human CFPs for planning questions.",
 },
 {
 name: "SoFi Automated",
 aum: 8,
 fee: 0.0,
 min: 1,
 taxLoss: false,
 directIndex: false,
 humanAccess: true,
 esg: false,
 color: "#ec4899",
 rating: 4.0,
 description: "Zero-fee millennial-focused robo with certified financial planner sessions included.",
 },
];

// ── Efficient Frontier Data ────────────────────────────────────────────────────
interface FrontierPoint {
 risk: number;
 ret: number;
 label?: string;
 highlight?: boolean;
}

function buildFrontier(): FrontierPoint[] {
 const points: FrontierPoint[] = [];
 // Minimum variance at ~5% risk, max at ~18% risk
 for (let risk = 4; risk <= 19; risk += 0.5) {
 const t = (risk - 4) / 15;
 // Parabolic efficient frontier shape
 const ret = 3.5 + 6.5 * t - 1.8 * (1 - t) * (1 - t) + (rand() - 0.5) * 0.3;
 points.push({ risk, ret });
 }
 // Mark special portfolios
 points[0].label = "Min Variance";
 points[0].highlight = true;
 points[Math.floor(points.length * 0.4)].label = "Tangency";
 points[Math.floor(points.length * 0.4)].highlight = true;
 points[points.length - 1].label = "Max Return";
 points[points.length - 1].highlight = true;
 return points;
}

// Sub-optimal portfolios (below frontier)
function buildSubOptimal(): FrontierPoint[] {
 const pts: FrontierPoint[] = [];
 for (let i = 0; i < 30; i++) {
 const risk = 5 + rand() * 13;
 const t = (risk - 4) / 15;
 const frontierRet = 3.5 + 6.5 * t - 1.8 * (1 - t) * (1 - t);
 const ret = frontierRet - rand() * 3 - 0.5;
 pts.push({ risk, ret });
 }
 return pts;
}

// ── Cost Drag Data ─────────────────────────────────────────────────────────────
function computeCostDrag(
 initialAmount: number,
 annualReturn: number,
 fee: number,
 years: number
): number[] {
 const vals: number[] = [];
 let v = initialAmount;
 for (let y = 0; y <= years; y++) {
 vals.push(v);
 v = v * (1 + (annualReturn - fee) / 100);
 }
 return vals;
}

// ── Tab 1: Robo Landscape ──────────────────────────────────────────────────────

function RoboLandscape() {
 const [selected, setSelected] = useState<string | null>(null);
 const maxAUM = Math.max(...PROVIDERS.map((p) => p.aum));

 return (
 <div className="space-y-4">
 {/* AUM Bar Chart */}
 <Card className="p-6 bg-card border-border border-l-4 border-l-primary">
 <h3 className="text-lg font-semibold text-muted-foreground mb-4">Assets Under Management (Billions)</h3>
 <svg viewBox="0 0 620 200" className="w-full">
 {PROVIDERS.map((p, i) => {
 const barH = (p.aum / maxAUM) * 150;
 const x = 20 + i * 120;
 const y = 165 - barH;
 return (
 <g key={p.name}>
 <rect
 x={x}
 y={y}
 width={90}
 height={barH}
 rx={4}
 fill={p.color}
 opacity={selected === p.name || !selected ? 1 : 0.35}
 className="cursor-pointer transition-opacity"
 onClick={() => setSelected(selected === p.name ? null : p.name)}
 />
 <text x={x + 45} y={178} textAnchor="middle" fontSize={10} fill="#9ca3af">
 {p.name.split("")[0]}
 </text>
 <text x={x + 45} y={y - 4} textAnchor="middle" fontSize={9} fill={p.color} fontWeight="600">
 {fmtB(p.aum)}
 </text>
 </g>
 );
 })}
 </svg>
 </Card>

 {/* Comparison Table */}
 <Card className="p-5 bg-card border-border overflow-x-auto">
 <h3 className="text-sm font-semibold text-muted-foreground mb-4">Platform Comparison</h3>
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left pb-2 text-muted-foreground font-medium">Platform</th>
 <th className="text-right pb-2 text-muted-foreground font-medium">AUM</th>
 <th className="text-right pb-2 text-muted-foreground font-medium">Fee</th>
 <th className="text-right pb-2 text-muted-foreground font-medium">Min.</th>
 <th className="text-center pb-2 text-muted-foreground font-medium">TLH</th>
 <th className="text-center pb-2 text-muted-foreground font-medium">DI</th>
 <th className="text-center pb-2 text-muted-foreground font-medium">Human</th>
 <th className="text-center pb-2 text-muted-foreground font-medium">ESG</th>
 <th className="text-right pb-2 text-muted-foreground font-medium">Rating</th>
 </tr>
 </thead>
 <tbody>
 {PROVIDERS.map((p) => (
 <motion.tr
 key={p.name}
 className={cn(
 "border-b border-border/20 cursor-pointer transition-colors",
 selected === p.name ? "bg-muted/60" : "hover:bg-muted/30"
 )}
 onClick={() => setSelected(selected === p.name ? null : p.name)}
 >
 <td className="py-2.5 pr-3">
 <div className="flex items-center gap-2">
 <span
 className="w-2 h-2 rounded-full flex-shrink-0"
 style={{ backgroundColor: p.color }}
 />
 <span className="font-medium text-foreground">{p.name}</span>
 </div>
 </td>
 <td className="text-right text-muted-foreground">{fmtB(p.aum)}</td>
 <td className="text-right text-muted-foreground">{p.fee === 0 ? <Badge variant="secondary" className="text-xs">Free</Badge> : fmtPct(p.fee)}</td>
 <td className="text-right text-muted-foreground">{p.min === 0 ? "$0" : fmtDollars(p.min)}</td>
 <td className="text-center">{p.taxLoss ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground/70">—</span>}</td>
 <td className="text-center">{p.directIndex ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground/70">—</span>}</td>
 <td className="text-center">{p.humanAccess ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground/70">—</span>}</td>
 <td className="text-center">{p.esg ? <Leaf className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground/70">—</span>}</td>
 <td className="text-right">
 <span className="text-amber-400 font-semibold">{p.rating}</span>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 <p className="text-xs text-muted-foreground/70 mt-3">TLH = Tax-Loss Harvesting · DI = Direct Indexing · Human = Human Advisor Access</p>
 </Card>

 {/* Selected Provider Detail */}
 <AnimatePresence>
 {selected && (() => {
 const p = PROVIDERS.find((x) => x.name === selected);
 if (!p) return null;
 return (
 <motion.div
 key={selected}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 >
 <Card className="p-5 bg-card border-border">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h3 className="font-medium text-foreground" style={{ color: p.color }}>{p.name}</h3>
 <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
 </div>
 <Badge style={{ backgroundColor: p.color + "30", color: p.color, borderColor: p.color + "60" }} variant="outline">
 {p.rating} / 5
 </Badge>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
 {[
 { label: "AUM", val: fmtB(p.aum) },
 { label: "Annual Fee", val: p.fee === 0 ? "Free" : fmtPct(p.fee) },
 { label: "Minimum", val: p.min === 0 ? "None" : fmtDollars(p.min) },
 { label: "Features", val: [p.taxLoss && "TLH", p.directIndex && "DI", p.esg && "ESG", p.humanAccess && "Human"].filter(Boolean).join(" · ") || "—" },
 ].map(({ label, val }) => (
 <div key={label} className="bg-muted/50 rounded-lg p-3">
 <p className="text-xs text-muted-foreground">{label}</p>
 <p className="text-sm font-medium text-foreground mt-0.5">{val}</p>
 </div>
 ))}
 </div>
 </Card>
 </motion.div>
 );
 })()}
 </AnimatePresence>

 {/* Key Insights */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { icon: TrendingUp, color: "text-foreground", label: "Industry AUM", val: "$506B+", sub: "Across top 5 platforms" },
 { icon: DollarSign, color: "text-emerald-400", label: "Avg Fee", val: "0.14%", sub: "vs 1.02% human advisor" },
 { icon: Users, color: "text-foreground", label: "Users", val: "4.5M+", sub: "Active robo accounts" },
 ].map(({ icon: Icon, color, label, val, sub }) => (
 <Card key={label} className="p-4 bg-card border-border flex items-center gap-3">
 <Icon className={cn("w-8 h-8 flex-shrink-0", color)} />
 <div>
 <p className="text-xs text-muted-foreground">{label}</p>
 <p className="text-lg font-semibold text-foreground">{val}</p>
 <p className="text-xs text-muted-foreground">{sub}</p>
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
}

// ── Tab 2: Portfolio Construction ─────────────────────────────────────────────

function PortfolioConstruction() {
 const [riskTolerance, setRiskTolerance] = useState(50);

 const frontierPoints = useMemo(() => buildFrontier(), []);
 const subOptPoints = useMemo(() => buildSubOptimal(), []);

 // Map portfolio points to SVG coords
 const W = 540, H = 220;
 const padL = 45, padR = 20, padT = 20, padB = 35;
 const plotW = W - padL - padR;
 const plotH = H - padT - padB;

 const allRisk = frontierPoints.map((p) => p.risk);
 const allRet = frontierPoints.map((p) => p.ret);
 const minR = Math.min(...allRisk) - 0.5;
 const maxR = Math.max(...allRisk) + 0.5;
 const minRet = 2;
 const maxRet = Math.max(...allRet) + 0.5;

 function toX(risk: number) {
 return padL + ((risk - minR) / (maxR - minR)) * plotW;
 }
 function toY(ret: number) {
 return padT + (1 - (ret - minRet) / (maxRet - minRet)) * plotH;
 }

 const pathD = frontierPoints
 .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.risk).toFixed(1)} ${toY(p.ret).toFixed(1)}`)
 .join("");

 // Current portfolio based on risk tolerance
 const idx = Math.min(
 Math.floor((riskTolerance / 100) * (frontierPoints.length - 1)),
 frontierPoints.length - 1
 );
 const currentPortfolio = frontierPoints[idx];

 // Allocation based on risk tolerance
 const equity = Math.round(30 + riskTolerance * 0.6);
 const bonds = Math.round(50 - riskTolerance * 0.35);
 const alts = Math.round(10 + riskTolerance * 0.05);
 const cash = Math.max(0, 100 - equity - bonds - alts);

 const allocations = [
 { label: "Equity", pct: equity, color: "#3b82f6" },
 { label: "Bonds", pct: bonds, color: "#10b981" },
 { label: "Alternatives", pct: alts, color: "#f59e0b" },
 { label: "Cash", pct: cash, color: "#6b7280" },
 ];

 // Pie chart helper
 function buildPie(slices: { pct: number; color: string; label: string }[]) {
 let angle = -Math.PI / 2;
 return slices.map((sl) => {
 const sweep = (sl.pct / 100) * 2 * Math.PI;
 const x1 = 60 + 55 * Math.cos(angle);
 const y1 = 60 + 55 * Math.sin(angle);
 angle += sweep;
 const x2 = 60 + 55 * Math.cos(angle);
 const y2 = 60 + 55 * Math.sin(angle);
 const large = sweep > Math.PI ? 1 : 0;
 return { ...sl, d: `M60,60 L${x1.toFixed(1)},${y1.toFixed(1)} A55,55 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z` };
 });
 }

 const pieSlices = buildPie(allocations);

 return (
 <div className="space-y-4">
 {/* Risk Tolerance Slider */}
 <Card className="p-5 bg-card border-border">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Risk Tolerance</h3>
 <Badge variant="outline" className={cn(
 "border-current",
 riskTolerance < 33 ? "text-emerald-400" : riskTolerance < 66 ? "text-amber-400" : "text-red-400"
 )}>
 {riskTolerance < 33 ? "Conservative" : riskTolerance < 66 ? "Moderate" : "Aggressive"}
 </Badge>
 </div>
 <Slider
 value={[riskTolerance]}
 onValueChange={([v]) => setRiskTolerance(v)}
 min={0}
 max={100}
 step={1}
 className="mb-2"
 />
 <div className="flex justify-between text-xs text-muted-foreground/70">
 <span>Conservative (0%)</span>
 <span>Moderate (50%)</span>
 <span>Aggressive (100%)</span>
 </div>
 </Card>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* Efficient Frontier SVG */}
 <Card className="p-5 bg-card border-border">
 <h3 className="text-sm font-medium text-muted-foreground mb-4">Efficient Frontier (MPT)</h3>
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
 {/* Grid lines */}
 {[3, 5, 7, 9].map((ret) => (
 <line
 key={ret}
 x1={padL}
 y1={toY(ret)}
 x2={W - padR}
 y2={toY(ret)}
 stroke="#27272a"
 strokeWidth={1}
 />
 ))}
 {[5, 8, 11, 14, 17].map((risk) => (
 <line
 key={risk}
 x1={toX(risk)}
 y1={padT}
 x2={toX(risk)}
 y2={H - padB}
 stroke="#27272a"
 strokeWidth={1}
 />
 ))}

 {/* Axis labels */}
 <text x={padL - 5} y={H - padB + 15} textAnchor="middle" fontSize={9} fill="#6b7280">Risk %</text>
 {[5, 8, 11, 14, 17].map((r) => (
 <text key={r} x={toX(r)} y={H - padB + 14} textAnchor="middle" fontSize={9} fill="#6b7280">{r}</text>
 ))}
 {[3, 5, 7, 9].map((r) => (
 <text key={r} x={padL - 6} y={toY(r) + 4} textAnchor="end" fontSize={9} fill="#6b7280">{r}%</text>
 ))}
 <text x={12} y={H / 2} textAnchor="middle" fontSize={9} fill="#6b7280" transform={`rotate(-90, 12, ${H / 2})`}>Return %</text>

 {/* Sub-optimal scatter */}
 {subOptPoints.map((p, i) => (
 <circle key={i} cx={toX(p.risk)} cy={toY(p.ret)} r={3} fill="#374151" />
 ))}

 {/* Frontier curve */}
 <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} />

 {/* Frontier highlight points */}
 {frontierPoints
 .filter((p) => p.highlight)
 .map((p) => (
 <g key={p.label}>
 <circle cx={toX(p.risk)} cy={toY(p.ret)} r={5} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={2} />
 <text
 x={toX(p.risk) + (p.label === "Min Variance" ? 6 : p.label === "Max Return" ? -6 : 0)}
 y={toY(p.ret) - 7}
 textAnchor={p.label === "Max Return" ? "end" : "start"}
 fontSize={8}
 fill="#93c5fd"
 >
 {p.label}
 </text>
 </g>
 ))}

 {/* Current portfolio */}
 <circle
 cx={toX(currentPortfolio.risk)}
 cy={toY(currentPortfolio.ret)}
 r={6}
 fill="#f59e0b"
 stroke="#fbbf24"
 strokeWidth={2}
 />
 <text x={toX(currentPortfolio.risk)} y={toY(currentPortfolio.ret) - 10} textAnchor="middle" fontSize={8} fill="#fbbf24" fontWeight="600">
 Your Portfolio
 </text>
 </svg>
 <p className="text-xs text-muted-foreground/70 mt-1">Blue dots = sub-optimal. Orange dot = your current allocation.</p>
 </Card>

 {/* Allocation Pie */}
 <Card className="p-5 bg-card border-border">
 <h3 className="text-sm font-medium text-muted-foreground mb-4">Recommended Allocation</h3>
 <div className="flex items-center gap-3">
 <svg viewBox="0 0 120 120" className="w-28 h-28 flex-shrink-0">
 {pieSlices.map((sl) => (
 <path key={sl.label} d={sl.d} fill={sl.color} />
 ))}
 </svg>
 <div className="space-y-2 flex-1">
 {allocations.map((al) => (
 <div key={al.label} className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: al.color }} />
 <span className="text-sm text-muted-foreground">{al.label}</span>
 </div>
 <span className="text-sm font-medium text-foreground">{al.pct}%</span>
 </div>
 ))}
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3 mt-4">
 <div className="bg-muted/50 rounded-lg p-3">
 <p className="text-xs text-muted-foreground">Expected Return</p>
 <p className="text-base font-semibold text-emerald-400">{fmtPct(currentPortfolio.ret)}</p>
 </div>
 <div className="bg-muted/50 rounded-lg p-3">
 <p className="text-xs text-muted-foreground">Expected Risk (σ)</p>
 <p className="text-base font-medium text-amber-400">{fmtPct(currentPortfolio.risk)}</p>
 </div>
 </div>
 </Card>
 </div>

 {/* Rebalancing Rules */}
 <Card className="p-5 bg-card border-border">
 <h3 className="text-sm font-medium text-muted-foreground mb-4">Rebalancing Rules & Tax-Loss Harvesting Automation</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 {
 icon: RefreshCw,
 color: "text-foreground",
 title: "Threshold Rebalancing",
 desc: "Triggers when any asset class drifts ±5% from target. More tax-efficient than calendar-based.",
 },
 {
 icon: Lock,
 color: "text-emerald-400",
 title: "Tax-Loss Harvesting",
 desc: "Daily scan for unrealized losses. Swaps to correlated ETF to preserve exposure while booking tax alpha.",
 },
 {
 icon: Activity,
 color: "text-foreground",
 title: "Cash Flow Rebalancing",
 desc: "New deposits directed to underweight assets first, minimizing taxable rebalancing events.",
 },
 ].map(({ icon: Icon, color, title, desc }) => (
 <div key={title} className="bg-muted/50 rounded-lg p-4">
 <Icon className={cn("w-5 h-5 mb-2", color)} />
 <p className="text-sm font-medium text-foreground mb-1">{title}</p>
 <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}

// ── Tab 3: Cost Comparison ─────────────────────────────────────────────────────

function CostComparison() {
 const [initialAmount, setInitialAmount] = useState(50000);
 const [annualReturn, setAnnualReturn] = useState(7);

 const years = 30;
 const roboCost = 0.25;
 const humanCost = 1.0;
 const diyCost = 0.05;

 const roboVals = useMemo(() => computeCostDrag(initialAmount, annualReturn, roboCost, years), [initialAmount, annualReturn]);
 const humanVals = useMemo(() => computeCostDrag(initialAmount, annualReturn, humanCost, years), [initialAmount, annualReturn]);
 const diyVals = useMemo(() => computeCostDrag(initialAmount, annualReturn, diyCost, years), [initialAmount, annualReturn]);

 // SVG chart
 const W = 580, H = 220;
 const padL = 65, padR = 20, padT = 20, padB = 35;
 const plotW = W - padL - padR;
 const plotH = H - padT - padB;

 const maxVal = Math.max(...diyVals);
 const minVal = initialAmount;

 function toX(year: number) {
 return padL + (year / years) * plotW;
 }
 function toY(val: number) {
 return padT + (1 - (val - minVal) / (maxVal - minVal)) * plotH;
 }

 function makePath(vals: number[]) {
 return vals
 .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
 .join("");
 }

 const scenarios = [
 { label: "DIY (0.05%)", vals: diyVals, color: "#10b981", final: diyVals[years] },
 { label: "Robo (0.25%)", vals: roboVals, color: "#3b82f6", final: roboVals[years] },
 { label: "Human (1.00%)", vals: humanVals, color: "#f59e0b", final: humanVals[years] },
 ];

 const costDrag = diyVals[years] - humanVals[years];
 const roboSavings = humanVals[years] - roboVals[years];

 return (
 <div className="space-y-4">
 {/* Controls */}
 <Card className="p-5 bg-card border-border">
 <h3 className="text-sm font-medium text-muted-foreground mb-4">Simulation Parameters</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <div className="flex justify-between mb-2">
 <label className="text-xs text-muted-foreground">Initial Investment</label>
 <span className="text-xs font-medium text-foreground">{fmtDollars(initialAmount)}</span>
 </div>
 <Slider
 value={[initialAmount]}
 onValueChange={([v]) => setInitialAmount(v)}
 min={10000}
 max={500000}
 step={5000}
 />
 </div>
 <div>
 <div className="flex justify-between mb-2">
 <label className="text-xs text-muted-foreground">Annual Return (Gross)</label>
 <span className="text-xs font-medium text-foreground">{fmtPct(annualReturn, 1)}</span>
 </div>
 <Slider
 value={[annualReturn]}
 onValueChange={([v]) => setAnnualReturn(v)}
 min={4}
 max={12}
 step={0.5}
 />
 </div>
 </div>
 </Card>

 {/* Cost Drag Chart */}
 <Card className="p-5 bg-card border-border">
 <h3 className="text-sm font-medium text-muted-foreground mb-4">30-Year Compounding Cost Drag</h3>
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
 {/* Grid */}
 {[0.25, 0.5, 0.75, 1].map((t) => {
 const val = minVal + t * (maxVal - minVal);
 const y = toY(val);
 return (
 <g key={t}>
 <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#27272a" strokeWidth={1} />
 <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">
 {fmtDollars(val)}
 </text>
 </g>
 );
 })}
 {[0, 5, 10, 15, 20, 25, 30].map((yr) => (
 <g key={yr}>
 <line x1={toX(yr)} y1={padT} x2={toX(yr)} y2={H - padB} stroke="#27272a" strokeWidth={1} />
 <text x={toX(yr)} y={H - padB + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
 Yr {yr}
 </text>
 </g>
 ))}

 {/* Lines */}
 {scenarios.map((sc) => (
 <path key={sc.label} d={makePath(sc.vals)} fill="none" stroke={sc.color} strokeWidth={2.5} />
 ))}

 {/* End labels */}
 {scenarios.map((sc) => (
 <text
 key={sc.label}
 x={toX(years) + 4}
 y={toY(sc.final)}
 fontSize={8}
 fill={sc.color}
 dominantBaseline="middle"
 >
 {sc.label.split("")[0]}
 </text>
 ))}
 </svg>
 </Card>

 {/* Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {scenarios.map((sc) => (
 <Card key={sc.label} className="p-4 bg-card border-border">
 <div className="flex items-center gap-2 mb-2">
 <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sc.color }} />
 <p className="text-xs text-muted-foreground">{sc.label}</p>
 </div>
 <p className="text-xl font-medium text-foreground">{fmtDollars(sc.final)}</p>
 <p className="text-xs text-muted-foreground mt-1">30-year terminal value</p>
 </Card>
 ))}
 </div>

 {/* Cost Impact */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Card className="p-4 bg-red-950/30 border-red-900/40">
 <div className="flex items-center gap-2 mb-1">
 <p className="text-xs font-medium text-red-400">Human Advisor Cost Drag</p>
 </div>
 <p className="text-2xl font-semibold text-red-300">{fmtDollars(costDrag)}</p>
 <p className="text-xs text-muted-foreground mt-1">Lost to fees vs DIY over 30 years on {fmtDollars(initialAmount)} at {annualReturn}% gross</p>
 </Card>
 <Card className="p-4 bg-emerald-950/30 border-emerald-900/40">
 <div className="flex items-center gap-2 mb-1">
 <p className="text-xs font-medium text-emerald-400">Robo vs Human Savings</p>
 </div>
 <p className="text-lg font-medium text-emerald-300">{fmtDollars(roboSavings)}</p>
 <p className="text-xs text-muted-foreground mt-1">Saved by choosing robo over human advisor over 30 years</p>
 </Card>
 </div>
 </div>
 );
}

// ── Tab 4: Smart Features ──────────────────────────────────────────────────────

interface QuizQuestion {
 q: string;
 options: string[];
 scores: number[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
 {
 q: "How would you react to a 20% portfolio drop?",
 options: ["Sell everything", "Do nothing", "Buy more"],
 scores: [0, 2, 4],
 },
 {
 q: "What is your investment horizon?",
 options: ["< 2 years", "2–10 years", "> 10 years"],
 scores: [0, 2, 4],
 },
 {
 q: "What percentage of income can you invest monthly?",
 options: ["< 5%", "5–15%", "> 15%"],
 scores: [0, 2, 4],
 },
 {
 q: "Do you have 6+ months emergency fund?",
 options: ["No", "Partly", "Yes"],
 scores: [0, 2, 4],
 },
];

function SmartFeatures() {
 const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUIZ_QUESTIONS.length).fill(null));
 const [submitted, setSubmitted] = useState(false);

 const totalScore = answers.reduce<number>((acc, a, i) => {
 if (a === null) return acc;
 return acc + QUIZ_QUESTIONS[i].scores[a];
 }, 0);

 const maxScore = QUIZ_QUESTIONS.reduce((acc, q) => acc + Math.max(...q.scores), 0);
 const pct = (totalScore / maxScore) * 100;

 const riskLabel =
 pct < 30 ? { label: "Conservative", color: "text-foreground" } :
 pct < 60 ? { label: "Moderate", color: "text-amber-400" } :
 { label: "Aggressive Growth", color: "text-red-400" };

 const tlhYield = (0.3 + rand() * 0.7).toFixed(2);

 return (
 <div className="space-y-4">
 {/* Feature Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[
 {
 icon: TrendingDown,
 color: "text-emerald-400",
 bg: "bg-emerald-950/30 border-emerald-900/40",
 title: "Tax-Loss Harvesting",
 stat: `~${tlhYield}%`,
 statLabel: "Avg. annual alpha",
 desc: "Daily scan of holdings. Sells losers, buys correlated ETF to maintain exposure while booking the tax deduction. Wash-sale compliant.",
 badge: "Wealthfront · Betterment",
 },
 {
 icon: BarChart3,
 color: "text-foreground",
 bg: "bg-muted/40 border-border",
 title: "Direct Indexing",
 stat: "$100K+",
 statLabel: "Minimum account",
 desc: "Own individual stocks replicating an index. Enables hyper-customized TLH at the single-stock level, outperforming ETF-based TLH by ~0.8% annualized.",
 badge: "Wealthfront · Betterment Premium",
 },
 {
 icon: Leaf,
 color: "text-emerald-400",
 bg: "bg-teal-950/30 border-teal-900/40",
 title: "Socially Responsible (SRI/ESG)",
 stat: "1,200+",
 statLabel: "SRI-screened funds",
 desc: "ESG score-filtered portfolios. Negative screens (tobacco, weapons), positive tilts (clean energy, DEI). Similar risk-adjusted returns to broad market.",
 badge: "Betterment · Vanguard Digital",
 },
 {
 icon: Settings,
 color: "text-foreground",
 bg: "bg-muted/40 border-border",
 title: "Smart Beta & Factor Tilts",
 stat: "5 Factors",
 statLabel: "Value · Size · Momentum · Quality · Low-Vol",
 desc: "Systematic factor exposure beyond cap-weighted indexing. Betterment Smart Beta tilts toward Goldman-selected factor premiums at no extra cost.",
 badge: "Betterment · Wealthfront",
 },
 ].map(({ icon: Icon, color, bg, title, stat, statLabel, desc, badge }) => (
 <Card key={title} className={cn("p-5 border", bg)}>
 <div className="flex items-start justify-between mb-3">
 <Icon className={cn("w-6 h-6", color)} />
 <Badge variant="outline" className="text-xs border-border text-muted-foreground">{badge}</Badge>
 </div>
 <h3 className="font-medium text-foreground mb-0.5">{title}</h3>
 <div className="flex items-baseline gap-1.5 mb-2">
 <span className={cn("text-xl font-medium", color)}>{stat}</span>
 <span className="text-xs text-muted-foreground">{statLabel}</span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
 </Card>
 ))}
 </div>

 {/* Risk Questionnaire */}
 <Card className="p-5 bg-card border-border">
 <h3 className="text-sm font-medium text-muted-foreground mb-4">Risk Profile Questionnaire</h3>
 <div className="space-y-5">
 {QUIZ_QUESTIONS.map((q, qi) => (
 <div key={qi}>
 <p className="text-sm text-foreground mb-2">{qi + 1}. {q.q}</p>
 <div className="flex flex-wrap gap-2">
 {q.options.map((opt, oi) => (
 <button
 key={oi}
 onClick={() => {
 setSubmitted(false);
 const next = [...answers];
 next[qi] = oi;
 setAnswers(next);
 }}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-medium border transition-colors",
 answers[qi] === oi
 ? "bg-primary border-primary text-foreground"
 : "bg-muted border-border text-muted-foreground hover:border-border"
 )}
 >
 {opt}
 </button>
 ))}
 </div>
 </div>
 ))}
 <Button
 className="mt-2"
 onClick={() => setSubmitted(true)}
 disabled={answers.some((a) => a === null)}
 >
 Get My Risk Profile
 </Button>
 </div>

 <AnimatePresence>
 {submitted && (
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="mt-5 p-4 bg-muted/60 rounded-md border border-border"
 >
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm font-medium text-foreground">Your Risk Profile</span>
 <span className={cn("text-sm font-medium", riskLabel.color)}>{riskLabel.label}</span>
 </div>
 <div className="w-full bg-muted rounded-full h-2 mb-2">
 <motion.div
 className="h-2 rounded-full bg-primary"
 initial={{ width: 0 }}
 animate={{ width: `${pct}%` }}
 transition={{ duration: 0.8 }}
 />
 </div>
 <p className="text-xs text-muted-foreground">Score: {totalScore}/{maxScore} ({pct.toFixed(0)}%)</p>
 <p className="text-xs text-muted-foreground mt-2">
 {pct < 30
 ? "A conservative allocation (e.g., 30% equity / 60% bonds / 10% cash) suits your lower risk appetite and shorter horizon."
 : pct < 60
 ? "A moderate allocation (e.g., 60% equity / 35% bonds / 5% cash) balances growth with downside protection."
 : "An aggressive growth allocation (e.g., 90% equity / 8% bonds / 2% cash) aligns with your long horizon and high risk tolerance."}
 </p>
 </motion.div>
 )}
 </AnimatePresence>
 </Card>
 </div>
 );
}

// ── Tab 5: AI & Future ─────────────────────────────────────────────────────────

interface TimelineEvent {
 year: number;
 title: string;
 desc: string;
 status: "past" | "current" | "future";
}

const TIMELINE: TimelineEvent[] = [
 { year: 2008, title: "Betterment Founded", desc: "First true robo-advisor launches with goals-based automated portfolio management.", status: "past" },
 { year: 2011, title: "Wealthfront Launch", desc: "Software-only approach with daily TLH, direct indexing announced.", status: "past" },
 { year: 2015, title: "Schwab Intelligent", desc: "Major brokerage enters with zero-fee model; robo becomes mainstream.", status: "past" },
 { year: 2018, title: "Direct Indexing Expands", desc: "Fractional shares enable direct indexing at lower minimums. ML-driven TLH.", status: "past" },
 { year: 2022, title: "Personalization AI", desc: "LLM-augmented advice layers, natural language goals, behavioral coaching begins.", status: "past" },
 { year: 2024, title: "Hybrid Human+AI Models", desc: "AI handles routine rebalancing; CFPs focus on complex planning, estate, tax strategy.", status: "past" },
 { year: 2026, title: "Goals-Native Portfolios", desc: "Each goal (house, college, retirement) gets its own AI-managed sub-portfolio with adaptive glide paths.", status: "current" },
 { year: 2028, title: "Real-Time Tax Optimization", desc: "Sub-daily TLH, wash-sale tracking across all brokerages via open banking APIs.", status: "future" },
 { year: 2030, title: "Autonomous Financial Agent", desc: "AI manages income routing, savings, investing, insurance, and estate planning as a unified autonomous system.", status: "future" },
];

function AIAndFuture() {
 return (
 <div className="space-y-4">
 {/* Next-Gen Features */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {[
 {
 icon: BrainCircuit,
 color: "text-foreground",
 title: "LLM-Powered Personalization",
 desc: "Natural language goal setting ('I want to retire at 58 with $3M'). AI decomposes into monthly savings targets, asset mix, and milestone alerts.",
 },
 {
 icon: Target,
 color: "text-foreground",
 title: "Goals-Based Investing",
 desc: "Separate portfolios per goal with individual glide paths. Education fund de-risks as tuition date approaches. Retirement fund adjusts equity/bond split with age.",
 },
 {
 icon: Lightbulb,
 color: "text-amber-400",
 title: "Behavioral Nudges",
 desc: "AI detects panic-selling impulses and sends cooling-off prompts. Gamified savings streaks. Commitment device for irregular income (bonus capture).",
 },
 {
 icon: Users,
 color: "text-emerald-400",
 title: "Hybrid Human+AI",
 desc: "AI handles 95% of routine tasks. Human CFPs reserved for life events: marriage, inheritance, business sale, divorce. Unlimited async CFP messaging.",
 },
 {
 icon: Globe,
 color: "text-muted-foreground",
 title: "Global Tax Optimization",
 desc: "Multi-country TLH aware of local wash-sale rules. Asset location across taxable, IRA, Roth, HSA automatically optimized for after-tax returns.",
 },
 {
 icon: Zap,
 color: "text-rose-400",
 title: "Autonomous Financial OS",
 desc: "Money in bank account auto-swept to optimal vehicle. Bills paid from checking, excess to HYSA or investment portfolio based on cash flow forecast.",
 },
 ].map(({ icon: Icon, color, title, desc }) => (
 <Card key={title} className="p-4 bg-card border-border">
 <Icon className={cn("w-6 h-6 mb-2", color)} />
 <p className="text-sm font-medium text-foreground mb-1.5">{title}</p>
 <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
 </Card>
 ))}
 </div>

 {/* Adoption Timeline */}
 <Card className="p-5 bg-card border-border">
 <h3 className="text-sm font-medium text-muted-foreground mb-5">Robo-Advisor Adoption Timeline</h3>
 <div className="relative">
 {/* Spine */}
 <div className="absolute left-6 top-0 bottom-0 w-px bg-muted" />
 <div className="space-y-5">
 {TIMELINE.map((ev) => (
 <motion.div
 key={ev.year}
 className="flex gap-5 items-start"
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.3 }}
 >
 <div
 className={cn(
 "w-12 h-12 rounded-full flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0 border-2 relative z-10",
 ev.status === "past"
 ? "bg-muted border-border text-muted-foreground"
 : ev.status === "current"
 ? "bg-primary border-primary text-foreground"
 : "bg-card border-dashed border-border text-muted-foreground/70"
 )}
 >
 {ev.year}
 </div>
 <div className="flex-1 min-w-0 pt-1">
 <div className="flex items-center gap-2 flex-wrap">
 <p
 className={cn(
 "text-sm font-medium",
 ev.status === "past"
 ? "text-muted-foreground"
 : ev.status === "current"
 ? "text-foreground"
 : "text-muted-foreground/70"
 )}
 >
 {ev.title}
 </p>
 {ev.status === "current" && (
 <Badge className="text-xs bg-muted/10 text-foreground border-border">Now</Badge>
 )}
 {ev.status === "future" && (
 <Badge variant="outline" className="text-xs border-border text-muted-foreground/70">Projected</Badge>
 )}
 </div>
 <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ev.desc}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </Card>

 {/* Robo vs Human Performance Insight */}
 <Card className="p-5 bg-card border-border">
 <div className="flex items-start gap-3">
 <div>
 <h3 className="text-sm font-medium text-foreground mb-2">Research Insight: Do Robos Outperform?</h3>
 <p className="text-xs text-muted-foreground leading-relaxed">
 DALBAR research shows average investor underperforms the S&P 500 by ~1.5% annually due to behavioral errors.
 Robo-advisors eliminate panic selling and forced rebalancing, closing a significant portion of this gap.
 Vanguard's Advisor Alpha study estimates 3% annual value-add from behavioral coaching alone — the primary advantage
 of AI-driven behavioral nudges in next-gen platforms.
 </p>
 <div className="grid grid-cols-3 gap-3 mt-4">
 {[
 { label: "Avg investor gap", val: "−1.5%/yr", color: "text-red-400" },
 { label: "TLH alpha (est.)", val: "+0.5%/yr", color: "text-emerald-400" },
 { label: "Behavioral alpha", val: "+1.5%/yr", color: "text-foreground" },
 ].map(({ label, val, color }) => (
 <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
 <p className={cn("text-base font-medium", color)}>{val}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </Card>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RoboAdvisorPage() {
 const [tab, setTab] = useState("landscape");

 return (
 <div className="min-h-screen bg-background text-foreground p-4 sm:p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6"
 >
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-lg font-medium text-foreground">Robo-Advisor & Wealth Tech</h1>
 </div>
 <p className="text-sm text-muted-foreground">
 Automated investing, MPT portfolio construction, cost analysis, smart features, and the algorithmic future of wealth management.
 </p>
 </motion.div>

 {/* Tabs */}
 <Tabs value={tab} onValueChange={setTab}>
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-6">
 {[
 { value: "landscape", label: "Robo Landscape" },
 { value: "construction", label: "Portfolio Construction" },
 { value: "costs", label: "Cost Comparison" },
 { value: "smart", label: "Smart Features" },
 { value: "ai", label: "AI & Future" },
 ].map(({ value, label }) => (
 <TabsTrigger
 key={value}
 value={value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 {label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="landscape" className="data-[state=inactive]:hidden">
 <AnimatePresence mode="wait">
 <motion.div key="landscape" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 <RoboLandscape />
 </motion.div>
 </AnimatePresence>
 </TabsContent>

 <TabsContent value="construction" className="data-[state=inactive]:hidden">
 <AnimatePresence mode="wait">
 <motion.div key="construction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 <PortfolioConstruction />
 </motion.div>
 </AnimatePresence>
 </TabsContent>

 <TabsContent value="costs" className="data-[state=inactive]:hidden">
 <AnimatePresence mode="wait">
 <motion.div key="costs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 <CostComparison />
 </motion.div>
 </AnimatePresence>
 </TabsContent>

 <TabsContent value="smart" className="data-[state=inactive]:hidden">
 <AnimatePresence mode="wait">
 <motion.div key="smart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 <SmartFeatures />
 </motion.div>
 </AnimatePresence>
 </TabsContent>

 <TabsContent value="ai" className="data-[state=inactive]:hidden">
 <AnimatePresence mode="wait">
 <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 <AIAndFuture />
 </motion.div>
 </AnimatePresence>
 </TabsContent>
 </Tabs>
 </div>
 );
}
