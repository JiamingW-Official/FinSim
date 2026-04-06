"use client";

import { useState, useMemo } from "react";
import {
 AlertTriangle,
 TrendingDown,
 TrendingUp,
 Shield,
 Layers,
 FileText,
 BarChart3,
 Clock,
 DollarSign,
 Target,
 Zap,
 ChevronDown,
 ChevronUp,
 Info,
 Building2,
 Activity,
 Scale,
 Gavel,
 ArrowRight,
} from "lucide-react";
import {
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 816;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate pool
const POOL: number[] = [];
for (let i = 0; i < 400; i++) POOL.push(rand());
let pi = 0;
const r = () => POOL[pi++ % POOL.length];

// ── Types ─────────────────────────────────────────────────────────────────────

type CreditRating = "CCC" | "CC" | "C" | "D";

type TradeBadge =
 | "Loan-to-Own"
 | "Fulcrum Security"
 | "Capital Structure Arb"
 | "DIP Financing"
 | "Credit Catalyst"
 | "Liquidation Play";

interface DistressedIssuer {
 id: string;
 company: string;
 sector: string;
 rating: CreditRating;
 priceCtsDollar: number; // cents on dollar
 ytm: number; // %
 defaultProbability: number; // %
 recoveryEstimate: number; // cents on dollar
 badge: TradeBadge;
 debtToEbitda: number;
 interestCoverage: number;
 totalDebt: number; // $B
}

interface WaterfallTranche {
 name: string;
 amount: number; // $M
 color: string;
 priority: number;
}

interface CapitalStructureLayer {
 tranche: string;
 amount: number; // $M
 coupon: string;
 maturity: string;
 seniority: number; // 1 = most senior
 isFulcrum: boolean;
 oid: number; // original issue discount / current price
 yield: number; // %
 relativeValue: "Rich" | "Fair" | "Cheap";
 color: string;
}

interface BankruptcyPhase {
 phase: string;
 duration: string;
 icon: React.ElementType;
 description: string;
 keyEvents: string[];
 color: string;
}

interface PlanScenario {
 name: string;
 description: string;
 seniorRecovery: number;
 unsecuredRecovery: number;
 equityRecovery: number;
 timeToEmerge: number; // months
 probability: number; // %
 color: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TRADE_BADGES: TradeBadge[] = [
 "Loan-to-Own",
 "Fulcrum Security",
 "Capital Structure Arb",
 "DIP Financing",
 "Credit Catalyst",
 "Liquidation Play",
];

const SECTORS = [
 "Retail",
 "Energy",
 "Healthcare",
 "Telecom",
 "Industrials",
 "Real Estate",
 "Gaming",
 "Airlines",
];

const COMPANY_NAMES = [
 "Horizon Retail Group",
 "Vanguard Energy Corp",
 "MedCore Holdings",
 "ConnectNet Telecom",
 "Apex Industries",
 "Clearwater RE",
];

function generateIssuers(): DistressedIssuer[] {
 const ratings: CreditRating[] = ["CCC", "CC", "C", "D"];
 return COMPANY_NAMES.map((company, i) => {
 const price = Math.round(20 + r() * 65); // 20–85 cents
 const ytm = 12 + r() * 48; // 12–60%
 const defProb = 15 + r() * 75; // 15–90%
 const recovery = Math.round(15 + r() * 55); // 15–70 cents
 return {
 id: `issuer-${i}`,
 company,
 sector: SECTORS[i % SECTORS.length],
 rating: ratings[Math.floor(r() * ratings.length)],
 priceCtsDollar: price,
 ytm: parseFloat(ytm.toFixed(1)),
 defaultProbability: parseFloat(defProb.toFixed(1)),
 recoveryEstimate: recovery,
 badge: TRADE_BADGES[i % TRADE_BADGES.length],
 debtToEbitda: parseFloat((4 + r() * 10).toFixed(1)),
 interestCoverage: parseFloat((0.3 + r() * 2.2).toFixed(2)),
 totalDebt: parseFloat((0.8 + r() * 8).toFixed(1)),
 };
 });
}

function generateWaterfallTranches(): WaterfallTranche[] {
 return [
 { name: "Senior Secured", amount: Math.round(300 + r() * 400), color: "#22c55e", priority: 1 },
 { name: "Senior Unsecured", amount: Math.round(200 + r() * 300), color: "#3b82f6", priority: 2 },
 { name: "Sub / Mezzanine", amount: Math.round(100 + r() * 200), color: "#f59e0b", priority: 3 },
 { name: "Equity", amount: Math.round(50 + r() * 150), color: "#ef4444", priority: 4 },
 ];
}

function generateCapitalStructure(): CapitalStructureLayer[] {
 const layers: CapitalStructureLayer[] = [
 {
 tranche: "1L Term Loan",
 amount: Math.round(350 + r() * 200),
 coupon: `L+${Math.round(300 + r() * 200)}`,
 maturity: "2026",
 seniority: 1,
 isFulcrum: false,
 oid: Math.round(82 + r() * 15),
 yield: parseFloat((6 + r() * 4).toFixed(1)),
 relativeValue: "Rich",
 color: "#22c55e",
 },
 {
 tranche: "1.5L Notes",
 amount: Math.round(150 + r() * 100),
 coupon: `${Math.round(7 + r() * 3)}%`,
 maturity: "2027",
 seniority: 2,
 isFulcrum: false,
 oid: Math.round(65 + r() * 15),
 yield: parseFloat((12 + r() * 6).toFixed(1)),
 relativeValue: "Fair",
 color: "#3b82f6",
 },
 {
 tranche: "2L Term Loan",
 amount: Math.round(200 + r() * 150),
 coupon: `L+${Math.round(600 + r() * 300)}`,
 maturity: "2027",
 seniority: 3,
 isFulcrum: true,
 oid: Math.round(35 + r() * 20),
 yield: parseFloat((22 + r() * 12).toFixed(1)),
 relativeValue: "Cheap",
 color: "#f59e0b",
 },
 {
 tranche: "Senior Unsecured",
 amount: Math.round(300 + r() * 200),
 coupon: `${Math.round(8 + r() * 4)}%`,
 maturity: "2028",
 seniority: 4,
 isFulcrum: false,
 oid: Math.round(18 + r() * 15),
 yield: parseFloat((38 + r() * 20).toFixed(1)),
 relativeValue: "Cheap",
 color: "#ef4444",
 },
 {
 tranche: "PIK Toggle Notes",
 amount: Math.round(100 + r() * 80),
 coupon: `${Math.round(11 + r() * 4)}% PIK`,
 maturity: "2029",
 seniority: 5,
 isFulcrum: false,
 oid: Math.round(5 + r() * 12),
 yield: parseFloat((65 + r() * 25).toFixed(1)),
 relativeValue: "Fair",
 color: "#a855f7",
 },
 {
 tranche: "Common Equity",
 amount: Math.round(50 + r() * 80),
 coupon: "—",
 maturity: "—",
 seniority: 6,
 isFulcrum: false,
 oid: Math.round(1 + r() * 8),
 yield: 0,
 relativeValue: "Cheap",
 color: "#6b7280",
 },
 ];
 return layers;
}

const BANKRUPTCY_PHASES: BankruptcyPhase[] = [
 {
 phase: "Pre-Filing",
 duration: "3–12 mo",
 icon: AlertTriangle,
 description: "Distress emerges, advisors retained, restructuring negotiations begin",
 keyEvents: [
 "Hire restructuring counsel & financial advisors",
 "Engage creditor groups",
 "Negotiate forbearance agreements",
 "Explore out-of-court options",
 ],
 color: "#f59e0b",
 },
 {
 phase: "Chapter 11 Filing",
 duration: "Day 1",
 icon: Gavel,
 description: "Voluntary petition filed; automatic stay halts creditor actions",
 keyEvents: [
 "First-day motions (wages, critical vendors)",
 "DIP financing approval",
 "Case management conference",
 "Creditors committee formed",
 ],
 color: "#ef4444",
 },
 {
 phase: "DIP Period",
 duration: "3–18 mo",
 icon: DollarSign,
 description: "Debtor-in-possession operates; plan of reorganization negotiated",
 keyEvents: [
 "DIP budget & milestones set",
 "Claims bar date established",
 "Section 363 asset sales possible",
 "Exclusivity period for plan filing",
 ],
 color: "#3b82f6",
 },
 {
 phase: "Plan Confirmation",
 duration: "1–3 mo",
 icon: FileText,
 description: "Disclosure statement approved; creditors vote on plan",
 keyEvents: [
 "Disclosure statement hearing",
 "Solicitation of plan votes",
 "Confirmation hearing",
 "Cramdown if necessary",
 ],
 color: "#8b5cf6",
 },
 {
 phase: "Emergence",
 duration: "Effective date",
 icon: TrendingUp,
 description: "Plan goes effective; new equity issued, claims settled",
 keyEvents: [
 "New equity / debt issued",
 "Old equity cancelled",
 "Management incentive plan",
 "Post-emergence monitoring",
 ],
 color: "#22c55e",
 },
];

function generatePlanScenarios(): PlanScenario[] {
 return [
 {
 name: "Liquidation",
 description: "363 asset sale; company sold in parts",
 seniorRecovery: Math.round(55 + r() * 25),
 unsecuredRecovery: Math.round(5 + r() * 20),
 equityRecovery: 0,
 timeToEmerge: Math.round(6 + r() * 6),
 probability: Math.round(15 + r() * 15),
 color: "#ef4444",
 },
 {
 name: "Standalone Reorg",
 description: "Restructured balance sheet, same business",
 seniorRecovery: Math.round(75 + r() * 20),
 unsecuredRecovery: Math.round(20 + r() * 30),
 equityRecovery: Math.round(0 + r() * 15),
 timeToEmerge: Math.round(12 + r() * 12),
 probability: Math.round(35 + r() * 20),
 color: "#3b82f6",
 },
 {
 name: "Sale as Going Concern",
 description: "Strategic buyer acquires entire company",
 seniorRecovery: Math.round(85 + r() * 10),
 unsecuredRecovery: Math.round(35 + r() * 35),
 equityRecovery: Math.round(5 + r() * 20),
 timeToEmerge: Math.round(8 + r() * 8),
 probability: Math.round(30 + r() * 20),
 color: "#22c55e",
 },
 {
 name: "Pre-pack / Pre-arranged",
 description: "Deal agreed before filing; expedited process",
 seniorRecovery: Math.round(90 + r() * 8),
 unsecuredRecovery: Math.round(40 + r() * 40),
 equityRecovery: Math.round(10 + r() * 25),
 timeToEmerge: Math.round(3 + r() * 5),
 probability: Math.round(10 + r() * 20),
 color: "#f59e0b",
 },
 ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPct(n: number, d = 1) {
 return `${n.toFixed(d)}%`;
}

function fmtB(n: number) {
 return `$${n.toFixed(1)}B`;
}

function ratingColor(rating: CreditRating) {
 if (rating === "D") return "bg-red-500/20 text-red-400 border-red-500/30";
 if (rating === "C") return "bg-rose-500/20 text-rose-400 border-rose-500/30";
 if (rating === "CC") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
 return "bg-amber-500/20 text-amber-400 border-amber-500/30";
}

function badgeColor(badge: TradeBadge) {
 const map: Record<TradeBadge, string> = {
 "Loan-to-Own": "bg-primary/20 text-primary border-border",
 "Fulcrum Security": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
 "Capital Structure Arb": "bg-cyan-500/20 text-muted-foreground border-cyan-500/30",
 "DIP Financing": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
 "Credit Catalyst": "bg-primary/20 text-primary border-border",
 "Liquidation Play": "bg-red-500/20 text-red-300 border-red-500/30",
 };
 return map[badge];
}

function rvColor(rv: CapitalStructureLayer["relativeValue"]) {
 if (rv === "Cheap") return "text-emerald-400";
 if (rv === "Rich") return "text-red-400";
 return "text-amber-400";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
 label,
 value,
 sub,
 highlight,
 icon: Icon,
}: {
 label: string;
 value: string;
 sub?: string;
 highlight?: "pos" | "neg" | "neutral";
 icon?: React.ElementType;
}) {
 const valClass =
 highlight === "pos"
 ? "text-emerald-400"
 : highlight === "neg"
 ? "text-rose-400"
 : "text-foreground";
 return (
 <div className="rounded-lg border border-border bg-foreground/5 p-3">
 <div className="flex items-center gap-1.5 mb-1">
 {Icon && <Icon className="h-3.5 w-3.5 text-foreground/40" />}
 <span className="text-xs text-foreground/50">{label}</span>
 </div>
 <div className={cn("text-xl font-bold", valClass)}>{value}</div>
 {sub && <div className="text-xs text-foreground/40 mt-0.5">{sub}</div>}
 </div>
 );
}

// ── Opportunities Tab ─────────────────────────────────────────────────────────

function OpportunitiesTab({ issuers }: { issuers: DistressedIssuer[] }) {
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const selected = issuers.find((i) => i.id === selectedId) ?? null;

 const totalDebt = issuers.reduce((a, b) => a + b.totalDebt, 0);
 const avgYTM = issuers.reduce((a, b) => a + b.ytm, 0) / issuers.length;
 const avgPrice = issuers.reduce((a, b) => a + b.priceCtsDollar, 0) / issuers.length;
 const defaultedCount = issuers.filter((i) => i.rating === "D").length;

 return (
 <div className="space-y-4">
 {/* Summary row */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <MetricCard label="Opportunity Set" value={`${issuers.length} issuers`} icon={Building2} highlight="neutral" />
 <MetricCard label="Avg Price" value={`${avgPrice.toFixed(0)}¢`} sub="cents on dollar" icon={DollarSign} highlight="neg" />
 <MetricCard label="Avg YTM" value={fmtPct(avgYTM)} sub="yield to maturity" icon={TrendingUp} highlight="pos" />
 <MetricCard label="In Default" value={`${defaultedCount} / ${issuers.length}`} sub={`$${totalDebt.toFixed(1)}B total`} icon={AlertTriangle} highlight="neg" />
 </div>

 {/* Table */}
 <div className="rounded-lg border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="text-left py-2.5 px-3 text-foreground/50 font-medium text-xs">Company</th>
 <th className="text-left py-2.5 px-3 text-foreground/50 font-medium text-xs">Sector</th>
 <th className="text-center py-2.5 px-3 text-foreground/50 font-medium text-xs">Rating</th>
 <th className="text-right py-2.5 px-3 text-foreground/50 font-medium text-xs">Price (¢)</th>
 <th className="text-right py-2.5 px-3 text-foreground/50 font-medium text-xs">YTM%</th>
 <th className="text-right py-2.5 px-3 text-foreground/50 font-medium text-xs">Def. Prob%</th>
 <th className="text-right py-2.5 px-3 text-foreground/50 font-medium text-xs">Recovery (¢)</th>
 <th className="text-left py-2.5 px-3 text-foreground/50 font-medium text-xs">Thesis</th>
 </tr>
 </thead>
 <tbody>
 {issuers.map((issuer) => (
 <tr
 key={issuer.id}
 onClick={() => setSelectedId(issuer.id === selectedId ? null : issuer.id)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 issuer.id === selectedId
 ? "bg-foreground/10"
 : "hover:bg-muted/30"
 )}
 >
 <td className="py-2.5 px-3 font-medium text-foreground">{issuer.company}</td>
 <td className="py-2.5 px-3 text-foreground/60">{issuer.sector}</td>
 <td className="py-2.5 px-3 text-center">
 <Badge className={cn("text-xs text-muted-foreground border", ratingColor(issuer.rating))}>
 {issuer.rating}
 </Badge>
 </td>
 <td className="py-2.5 px-3 text-right font-mono text-rose-400">{issuer.priceCtsDollar}¢</td>
 <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{fmtPct(issuer.ytm)}</td>
 <td className="py-2.5 px-3 text-right font-mono text-amber-400">{fmtPct(issuer.defaultProbability)}</td>
 <td className="py-2.5 px-3 text-right font-mono text-foreground/70">{issuer.recoveryEstimate}¢</td>
 <td className="py-2.5 px-3">
 <Badge className={cn("text-xs text-muted-foreground border whitespace-nowrap", badgeColor(issuer.badge))}>
 {issuer.badge}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Selected detail */}
 
 {selected && (
 <div
 key={selected.id}
 className="rounded-lg border border-border bg-foreground/5 p-4 space-y-4"
 >
 <div className="flex items-center justify-between flex-wrap gap-2">
 <div>
 <h3 className="text-lg font-bold text-foreground">{selected.company}</h3>
 <p className="text-sm text-foreground/50">{selected.sector} · Total Debt {fmtB(selected.totalDebt)}</p>
 </div>
 <Badge className={cn("text-sm border px-3 py-1", badgeColor(selected.badge))}>
 {selected.badge}
 </Badge>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <MetricCard label="Debt / EBITDA" value={`${selected.debtToEbitda}×`} highlight="neg" icon={TrendingDown} />
 <MetricCard label="Interest Coverage" value={`${selected.interestCoverage}×`} highlight={selected.interestCoverage < 1 ? "neg" : "neutral"} icon={Activity} />
 <MetricCard label="Price vs Recovery" value={`${selected.priceCtsDollar}¢ / ${selected.recoveryEstimate}¢`} highlight={selected.priceCtsDollar < selected.recoveryEstimate ? "pos" : "neg"} icon={Target} />
 <MetricCard label="Expected Return" value={fmtPct(selected.ytm * (1 - selected.defaultProbability / 100) + selected.recoveryEstimate * selected.defaultProbability / 100 / selected.priceCtsDollar * 100 - 100)} highlight="pos" icon={Zap} sub="risk-adj. est." />
 </div>
 <div className="p-3 rounded border border-border bg-black/20">
 <p className="text-xs text-foreground/50 mb-1 font-medium">Investment Thesis</p>
 <p className="text-sm text-foreground/80">
 {selected.badge === "Loan-to-Own" && "Acquire debt at distressed levels to take ownership control through the restructuring process. Thesis hinges on enterprise value exceeding face value of senior secured claims."}
 {selected.badge === "Fulcrum Security" && "The fulcrum tranche is the pivot point in the capital structure — likely to receive new equity upon emergence. Risk/reward is asymmetric if purchased below implied reorganization value."}
 {selected.badge === "Capital Structure Arb" && "Long senior secured vs. short unsecured (or equity) to capture mispricing across the capital structure. Pure credit relative value with bounded downside."}
 {selected.badge === "DIP Financing" && "Provide debtor-in-possession financing with super-priority status, high coupon, and favorable roll-over provisions. Protected by priming liens above all pre-petition debt."}
 {selected.badge === "Credit Catalyst" && "Upcoming catalyst (asset sale, refinancing, earnings recovery) expected to compress spreads and reprice bonds toward par within 12 months."}
 {selected.badge === "Liquidation Play" && "Business is non-viable as a going concern. Play focuses on liquidation value of tangible assets exceeding current bond prices after full recovery waterfall analysis."}
 </p>
 </div>
 </div>
 )}
 
 </div>
 );
}

// ── Recovery Model Tab ────────────────────────────────────────────────────────

function RecoveryModelTab({ tranches: initialTranches }: { tranches: WaterfallTranche[] }) {
 const [evSlider, setEvSlider] = useState([650]); // $M
 const ev = evSlider[0];
 const tranches = initialTranches;

 const waterfallResults = useMemo(() => {
 let remaining = ev;
 return tranches.map((t) => {
 const recovered = Math.min(remaining, t.amount);
 const recoveryRate = (recovered / t.amount) * 100;
 remaining = Math.max(0, remaining - t.amount);
 return { ...t, recovered, recoveryRate };
 });
 }, [ev, tranches]);

 const totalClaims = tranches.reduce((a, b) => a + b.amount, 0);
 const totalHeight = 240;
 const totalWidth = 340;
 const barWidth = 60;

 // SVG stacked bar
 const segments = tranches.map((t) => ({
 ...t,
 heightPx: (t.amount / totalClaims) * totalHeight,
 }));

 let yOffset = 0;
 const stackedSegments = [...segments].reverse().map((seg) => {
 const y = yOffset;
 yOffset += seg.heightPx;
 return { ...seg, y };
 });

 const evLineY = totalHeight - (ev / totalClaims) * totalHeight;

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <MetricCard label="Enterprise Value" value={`$${ev}M`} highlight="neutral" icon={Building2} />
 <MetricCard label="Total Claims" value={`$${totalClaims}M`} highlight="neutral" icon={Layers} />
 <MetricCard label="Coverage Ratio" value={fmtPct((ev / totalClaims) * 100)} highlight={ev >= totalClaims ? "pos" : "neg"} icon={Shield} />
 <MetricCard label="Impaired Tranches" value={`${waterfallResults.filter((t) => t.recoveryRate < 100).length}`} sub="below par" highlight="neg" icon={AlertTriangle} />
 </div>

 {/* EV Slider */}
 <div className="rounded-lg border border-border bg-foreground/5 p-4">
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm font-medium text-foreground">Enterprise Value Slider</span>
 <span className="text-sm font-mono text-emerald-400">${ev}M</span>
 </div>
 <Slider
 value={evSlider}
 onValueChange={setEvSlider}
 min={100}
 max={1400}
 step={25}
 className="mb-2"
 />
 <div className="flex justify-between text-xs text-foreground/40">
 <span>$100M (distressed)</span>
 <span>$1,400M (full recovery)</span>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* SVG Waterfall */}
 <div className="rounded-lg border border-border bg-foreground/5 p-4">
 <h3 className="text-sm font-medium text-foreground mb-4">Recovery Waterfall</h3>
 <div className="flex items-end gap-8 justify-center">
 {/* Capital Structure Bar */}
 <div>
 <p className="text-xs text-foreground/40 text-center mb-2">Capital Stack</p>
 <svg width={barWidth + 80} height={totalHeight + 20}>
 {stackedSegments.map((seg) => (
 <g key={seg.name}>
 <rect
 x={10}
 y={seg.y}
 width={barWidth}
 height={seg.heightPx}
 fill={seg.color}
 fillOpacity={0.4}
 stroke={seg.color}
 strokeWidth={1}
 />
 {seg.heightPx > 18 && (
 <text
 x={10 + barWidth / 2}
 y={seg.y + seg.heightPx / 2 + 4}
 textAnchor="middle"
 fill={seg.color}
 fontSize={10}
 fontWeight={600}
 >
 ${seg.amount}M
 </text>
 )}
 </g>
 ))}
 {/* EV line */}
 <line
 x1={0}
 y1={evLineY}
 x2={barWidth + 20}
 y2={evLineY}
 stroke="#fff"
 strokeWidth={2}
 strokeDasharray="4 2"
 />
 <text x={barWidth + 22} y={evLineY + 4} fill="#fff" fontSize={9} opacity={0.7}>
 EV
 </text>
 </svg>
 </div>
 {/* Legend */}
 <div className="space-y-2">
 {[...tranches].reverse().map((t) => (
 <div key={t.name} className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: t.color, opacity: 0.8 }} />
 <span className="text-xs text-foreground/60">{t.name}</span>
 </div>
 ))}
 <div className="flex items-center gap-2 mt-1 pt-1 border-t border-border">
 <div className="w-3 h-0.5 bg-foreground/70 flex-shrink-0" />
 <span className="text-xs text-foreground/60">Enterprise Value</span>
 </div>
 </div>
 </div>
 </div>

 {/* Recovery Rate by Tranche */}
 <div className="rounded-lg border border-border bg-foreground/5 p-4">
 <h3 className="text-sm font-medium text-foreground mb-4">Recovery Rate by Tranche</h3>
 <div className="space-y-3">
 {waterfallResults.map((t) => (
 <div key={t.name}>
 <div className="flex items-center justify-between mb-1">
 <div className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
 <span className="text-xs text-foreground/70">{t.name}</span>
 </div>
 <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
 <span className="text-foreground/50">${t.recovered}M / ${t.amount}M</span>
 <span
 className="font-medium w-12 text-right"
 style={{ color: t.color }}
 >
 {fmtPct(t.recoveryRate, 0)}
 </span>
 </div>
 </div>
 <Progress
 value={Math.min(100, t.recoveryRate)}
 className="h-2"
 style={{ "--progress-color": t.color } as React.CSSProperties}
 />
 </div>
 ))}
 </div>
 <div className="mt-4 p-2 rounded bg-foreground/5 border border-border">
 <p className="text-xs text-foreground/50">
 <span className="font-medium text-foreground/70">Fulcrum Security:</span>{" "}
 The tranche with partial recovery ({">"}0% but {"<"}100%) is the pivot point of the restructuring — likely to receive new equity.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

// ── Capital Structure Tab ─────────────────────────────────────────────────────

function CapitalStructureTab({ layers }: { layers: CapitalStructureLayer[] }) {
 const [selected, setSelected] = useState<CapitalStructureLayer | null>(null);
 const maxAmount = Math.max(...layers.map((l) => l.amount));
 const fulcrum = layers.find((l) => l.isFulcrum);

 // SVG capital structure diagram
 const diagramH = layers.length * 52 + 16;

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <MetricCard label="Tranches" value={`${layers.length}`} icon={Layers} highlight="neutral" />
 <MetricCard label="Fulcrum" value={fulcrum?.tranche ?? "None"} icon={Target} highlight="neutral" />
 <MetricCard
 label="Total Debt"
 value={`$${layers.filter((l) => l.seniority < 6).reduce((a, b) => a + b.amount, 0)}M`}
 icon={DollarSign}
 highlight="neg"
 />
 <MetricCard label="Cheap Tranches" value={`${layers.filter((l) => l.relativeValue === "Cheap").length}`} icon={TrendingDown} highlight="pos" sub="relative value" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* SVG Diagram */}
 <div className="rounded-lg border border-border bg-foreground/5 p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Capital Structure Diagram</h3>
 <p className="text-xs text-foreground/40 mb-3">Click a tranche for details</p>
 <svg width="100%" viewBox={`0 0 320 ${diagramH}`}>
 {layers.map((layer, i) => {
 const y = i * 52 + 8;
 const barW = Math.max(40, (layer.amount / maxAmount) * 260);
 const isSelected = selected?.tranche === layer.tranche;
 return (
 <g
 key={layer.tranche}
 onClick={() => setSelected(isSelected ? null : layer)}
 style={{ cursor: "pointer" }}
 >
 <rect
 x={0}
 y={y}
 width={barW}
 height={40}
 rx={4}
 fill={layer.color}
 fillOpacity={isSelected ? 0.5 : 0.25}
 stroke={layer.color}
 strokeWidth={isSelected ? 1.5 : 0.8}
 />
 {/* Fulcrum indicator */}
 {layer.isFulcrum && (
 <g>
 <circle cx={barW + 12} cy={y + 20} r={7} fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth={1} />
 <text x={barW + 12} y={y + 24} textAnchor="middle" fill="#f59e0b" fontSize={8} fontWeight={700}>F</text>
 </g>
 )}
 <text x={8} y={y + 16} fill={layer.color} fontSize={11} fontWeight={600}>{layer.tranche}</text>
 <text x={8} y={y + 30} fill="rgba(255,255,255,0.5)" fontSize={9}>${layer.amount}M · {layer.coupon} · {layer.oid}¢</text>
 </g>
 );
 })}
 </svg>
 </div>

 {/* Tranche detail / relative value */}
 <div className="space-y-3">
 
 {selected ? (
 <div
 key={selected.tranche}
 className="rounded-lg border border-border bg-foreground/5 p-4 space-y-3"
 >
 <div className="flex items-center justify-between">
 <h3 className="text-base font-medium text-foreground">{selected.tranche}</h3>
 {selected.isFulcrum && (
 <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs border">
 Fulcrum Security
 </Badge>
 )}
 </div>
 <div className="grid grid-cols-2 gap-2 text-sm">
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Amount</span>
 <span className="text-foreground font-mono">${selected.amount}M</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Coupon</span>
 <span className="text-foreground font-mono">{selected.coupon}</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Maturity</span>
 <span className="text-foreground font-mono">{selected.maturity}</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Market Price</span>
 <span className="font-mono" style={{ color: selected.color }}>{selected.oid}¢</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Current Yield</span>
 <span className="text-foreground font-mono">{selected.yield > 0 ? fmtPct(selected.yield) : "—"}</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Rel. Value</span>
 <span className={cn("font-medium", rvColor(selected.relativeValue))}>{selected.relativeValue}</span>
 </div>
 </div>
 {selected.isFulcrum && (
 <div className="rounded p-2 bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-200">
 This is the <strong>fulcrum security</strong> — the tranche most likely to receive new equity in restructuring. Investors acquiring this tranche gain the most leverage in plan negotiations.
 </div>
 )}
 </div>
 ) : (
 <div
 key="placeholder"
 className="rounded-lg border border-border bg-foreground/5 p-4 flex items-center justify-center h-48"
 >
 <p className="text-sm text-foreground/30 text-center">
 Click a tranche in the diagram<br />to view details & relative value
 </p>
 </div>
 )}
 

 {/* Relative value table */}
 <div className="rounded-lg border border-border bg-foreground/5 p-3">
 <h4 className="text-xs font-medium text-foreground/50 mb-2">Relative Value Summary</h4>
 <div className="space-y-1.5">
 {layers.map((layer) => (
 <div key={layer.tranche} className="flex items-center justify-between text-xs text-muted-foreground">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
 <span className="text-foreground/70">{layer.tranche}</span>
 {layer.isFulcrum && <span className="text-yellow-400 text-xs font-medium">[F]</span>}
 </div>
 <div className="flex items-center gap-4">
 <span className="text-foreground/40 font-mono">{layer.oid}¢</span>
 <span className={cn("font-medium w-10 text-right", rvColor(layer.relativeValue))}>
 {layer.relativeValue}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Inter-creditor dynamics */}
 <div className="rounded-lg border border-border bg-foreground/5 p-3">
 <h4 className="text-xs font-medium text-foreground/50 mb-2">Inter-Creditor Dynamics</h4>
 <div className="space-y-1.5 text-xs text-foreground/60">
 <div className="flex items-start gap-2">
 <ArrowRight className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
 <span>Senior secured lenders control DIP financing and sale process timing</span>
 </div>
 <div className="flex items-start gap-2">
 <ArrowRight className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
 <span>Fulcrum security holders negotiate the plan of reorganization terms</span>
 </div>
 <div className="flex items-start gap-2">
 <ArrowRight className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
 <span>Intercreditor agreements may restrict junior lien enforcement</span>
 </div>
 <div className="flex items-start gap-2">
 <ArrowRight className="h-3 w-3 text-rose-400 flex-shrink-0 mt-0.5" />
 <span>Equity committee formed only when material equity value is plausible</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

// ── Bankruptcy Tab ─────────────────────────────────────────────────────────────

function BankruptcyTab({ scenarios }: { scenarios: PlanScenario[] }) {
 const [expanded, setExpanded] = useState<number | null>(0);
 const [dipRate, setDipRate] = useState([12]);
 const [dipSize, setDipSize] = useState([150]);

 const totalProb = scenarios.reduce((a, b) => a + b.probability, 0);
 const weightedTime = scenarios.reduce((a, b) => a + (b.timeToEmerge * b.probability) / 100, 0);

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <MetricCard label="Scenarios" value={`${scenarios.length}`} icon={FileText} highlight="neutral" />
 <MetricCard label="Est. Time to Emerge" value={`${weightedTime.toFixed(0)} mo`} sub="probability-weighted" icon={Clock} highlight="neutral" />
 <MetricCard label="DIP Rate" value={fmtPct(dipRate[0])} sub="annualized cost" icon={DollarSign} highlight="neg" />
 <MetricCard label="DIP Size" value={`$${dipSize[0]}M`} sub="super-priority" icon={Shield} highlight="neutral" />
 </div>

 {/* Chapter 11 Timeline */}
 <div className="rounded-lg border border-border bg-foreground/5 p-4">
 <h3 className="text-sm font-medium text-foreground mb-4">Chapter 11 Process Timeline</h3>
 {/* SVG flowchart */}
 <div className="overflow-x-auto">
 <svg width={Math.max(600, BANKRUPTCY_PHASES.length * 120)} height={130}>
 {BANKRUPTCY_PHASES.map((phase, i) => {
 const x = i * 120 + 20;
 const PhaseIcon = phase.icon;
 return (
 <g key={phase.phase}>
 {/* Connector */}
 {i < BANKRUPTCY_PHASES.length - 1 && (
 <line
 x1={x + 80}
 y1={40}
 x2={x + 120}
 y2={40}
 stroke="rgba(255,255,255,0.2)"
 strokeWidth={1.5}
 strokeDasharray="3 2"
 />
 )}
 {/* Arrow head */}
 {i < BANKRUPTCY_PHASES.length - 1 && (
 <polygon
 points={`${x + 118},36 ${x + 118},44 ${x + 123},40`}
 fill="rgba(255,255,255,0.3)"
 />
 )}
 {/* Box */}
 <rect
 x={x}
 y={14}
 width={80}
 height={52}
 rx={6}
 fill={phase.color}
 fillOpacity={0.15}
 stroke={phase.color}
 strokeWidth={1}
 />
 <text x={x + 40} y={32} textAnchor="middle" fill={phase.color} fontSize={10} fontWeight={700}>
 {phase.phase.split(" ")[0]}
 </text>
 {phase.phase.split(" ").length > 1 && (
 <text x={x + 40} y={44} textAnchor="middle" fill={phase.color} fontSize={10} fontWeight={700}>
 {phase.phase.split(" ").slice(1).join(" ")}
 </text>
 )}
 <text x={x + 40} y={58} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
 {phase.duration}
 </text>
 {/* Step number */}
 <circle cx={x + 40} cy={90} r={11} fill={phase.color} fillOpacity={0.2} stroke={phase.color} strokeWidth={1} />
 <text x={x + 40} y={94} textAnchor="middle" fill={phase.color} fontSize={10} fontWeight={700}>{i + 1}</text>
 </g>
 );
 })}
 </svg>
 </div>
 </div>

 {/* Phases detail */}
 <div className="space-y-2">
 {BANKRUPTCY_PHASES.map((phase, i) => (
 <div
 key={phase.phase}
 className="rounded-lg border border-border overflow-hidden"
 >
 <button
 onClick={() => setExpanded(expanded === i ? null : i)}
 className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
 >
 <div className="flex items-center gap-3">
 <div
 className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
 style={{ backgroundColor: `${phase.color}25`, border: `1px solid ${phase.color}60` }}
 >
 <phase.icon className="h-3.5 w-3.5" style={{ color: phase.color }} />
 </div>
 <div className="text-left">
 <span className="text-sm font-medium text-foreground">{phase.phase}</span>
 <span className="text-xs text-foreground/40 ml-2">{phase.duration}</span>
 </div>
 </div>
 {expanded === i ? (
 <ChevronUp className="h-4 w-4 text-foreground/40" />
 ) : (
 <ChevronDown className="h-4 w-4 text-foreground/40" />
 )}
 </button>
 
 {expanded === i && (
 <div
 style={{ overflow: "hidden" }}
 >
 <div className="px-4 pb-3 border-t border-border">
 <p className="text-sm text-foreground/60 my-2">{phase.description}</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <p className="text-xs text-foreground/40 mb-1.5">Key Events</p>
 <ul className="space-y-1">
 {phase.keyEvents.map((e) => (
 <li key={e} className="flex items-start gap-1.5 text-xs text-foreground/60">
 <span style={{ color: phase.color }} className="mt-0.5 flex-shrink-0">▸</span>
 {e}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </div>
 )}
 
 </div>
 ))}
 </div>

 {/* DIP Financing */}
 <div className="rounded-lg border border-border bg-foreground/5 p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">DIP Financing Terms</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm text-foreground/60">DIP Rate (all-in)</span>
 <span className="text-sm font-mono text-amber-400">{fmtPct(dipRate[0])}</span>
 </div>
 <Slider value={dipRate} onValueChange={setDipRate} min={5} max={25} step={0.5} className="mb-4" />
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm text-foreground/60">DIP Facility Size</span>
 <span className="text-sm font-mono text-primary">${dipSize[0]}M</span>
 </div>
 <Slider value={dipSize} onValueChange={setDipSize} min={25} max={500} step={25} />
 </div>
 <div className="space-y-2 text-xs text-muted-foreground">
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Lien Priority</span>
 <span className="text-emerald-400 font-medium">Super-Priority / Priming</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Annual Cost</span>
 <span className="text-foreground font-mono">${((dipRate[0] / 100) * dipSize[0]).toFixed(1)}M</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Typical Tenor</span>
 <span className="text-foreground">12–18 months</span>
 </div>
 <div className="flex justify-between border-b border-border pb-1">
 <span className="text-foreground/50">Roll-over Option</span>
 <span className="text-foreground">Yes (first-out)</span>
 </div>
 <div className="flex justify-between">
 <span className="text-foreground/50">Budget Milestones</span>
 <span className="text-amber-400">Covenant-linked</span>
 </div>
 </div>
 </div>
 </div>

 {/* Plan scenarios */}
 <div className="rounded-lg border border-border bg-foreground/5 p-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-sm font-medium text-foreground">Plan of Reorganization Scenarios</h3>
 <span className="text-xs text-foreground/40">Probability total: {totalProb}%</span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {scenarios.map((sc) => (
 <div
 key={sc.name}
 className="rounded-lg border p-3 space-y-2"
 style={{ borderColor: `${sc.color}40`, backgroundColor: `${sc.color}08` }}
 >
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-foreground">{sc.name}</span>
 <Badge className="text-xs border" style={{ borderColor: `${sc.color}50`, color: sc.color, backgroundColor: `${sc.color}15` }}>
 {sc.probability}% prob.
 </Badge>
 </div>
 <p className="text-xs text-foreground/50">{sc.description}</p>
 <div className="space-y-1.5">
 <div>
 <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
 <span className="text-foreground/40">Senior Recovery</span>
 <span className="text-emerald-400 font-mono">{sc.seniorRecovery}¢</span>
 </div>
 <Progress value={sc.seniorRecovery} className="h-1.5" />
 </div>
 <div>
 <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
 <span className="text-foreground/40">Unsecured Recovery</span>
 <span className="text-amber-400 font-mono">{sc.unsecuredRecovery}¢</span>
 </div>
 <Progress value={sc.unsecuredRecovery} className="h-1.5" />
 </div>
 <div>
 <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
 <span className="text-foreground/40">Equity Recovery</span>
 <span className="text-rose-400 font-mono">{sc.equityRecovery}¢</span>
 </div>
 <Progress value={sc.equityRecovery} className="h-1.5" />
 </div>
 </div>
 <div className="flex items-center gap-1.5 text-xs text-foreground/50 pt-1 border-t border-border">
 <Clock className="h-3 w-3" />
 Time to emerge: <span className="text-foreground">{sc.timeToEmerge} months</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DistressedDebtPage() {
 const issuers = useMemo(() => generateIssuers(), []);
 const tranches = useMemo(() => generateWaterfallTranches(), []);
 const capitalLayers = useMemo(() => generateCapitalStructure(), []);
 const planScenarios = useMemo(() => generatePlanScenarios(), []);

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Distressed Debt</h1>
 <p className="text-sm text-muted-foreground mb-6">RESTRUCTURING · RECOVERY · SPECIAL SITUATIONS</p>

 {/* Key metrics */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
 <MetricCard
 label="Market Size"
 value="$1.2T"
 sub="global distressed debt"
 icon={BarChart3}
 highlight="neutral"
 />
 <MetricCard
 label="Avg Recovery Rate"
 value="41¢"
 sub="senior unsecured, historical"
 icon={Shield}
 highlight="neutral"
 />
 <MetricCard
 label="Typical IRR Target"
 value="18–25%"
 sub="distressed fund hurdle"
 icon={TrendingUp}
 highlight="pos"
 />
 <MetricCard
 label="Avg Chapter 11 Duration"
 value="16 mo"
 sub="pre-packaged: 3–4 mo"
 icon={Clock}
 highlight="neutral"
 />
 </div>

 <div className="border-t border-border mb-6" />

 {/* Tabs */}
 <Tabs defaultValue="opportunities">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="opportunities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Opportunities
 </TabsTrigger>
 <TabsTrigger value="recovery" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Recovery Model
 </TabsTrigger>
 <TabsTrigger value="capital" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Capital Structure
 </TabsTrigger>
 <TabsTrigger value="bankruptcy" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Bankruptcy
 </TabsTrigger>
 </TabsList>

 <TabsContent value="opportunities" className="mt-4">
 <OpportunitiesTab issuers={issuers} />
 </TabsContent>
 <TabsContent value="recovery" className="mt-4">
 <RecoveryModelTab tranches={tranches} />
 </TabsContent>
 <TabsContent value="capital" className="mt-4">
 <CapitalStructureTab layers={capitalLayers} />
 </TabsContent>
 <TabsContent value="bankruptcy" className="mt-4">
 <BankruptcyTab scenarios={planScenarios} />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
