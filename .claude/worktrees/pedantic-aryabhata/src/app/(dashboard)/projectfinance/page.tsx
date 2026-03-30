"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Building2,
 TrendingUp,
 TrendingDown,
 DollarSign,
 BarChart3,
 Shield,
 FileText,
 AlertTriangle,
 CheckCircle,
 Layers,
 Target,
 ArrowRight,
 Info,
 Percent,
 Activity,
 Globe,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 845;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

const RAND_POOL: number[] = [];
for (let i = 0; i < 300; i++) RAND_POOL.push(rand());
let randIdx = 0;
const r = () => RAND_POOL[randIdx++ % RAND_POOL.length];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtM(n: number): string {
 if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}B`;
 return `$${n.toFixed(0)}M`;
}

function fmtPct(n: number, d = 1): string {
 return `${n.toFixed(d)}%`;
}

function fmtX(n: number): string {
 return `${n.toFixed(2)}x`;
}

// ── Shared UI components ──────────────────────────────────────────────────────

function StatCard({
 label,
 value,
 sub,
 highlight,
}: {
 label: string;
 value: string;
 sub?: string;
 highlight?: "pos" | "neg" | "neutral";
}) {
 const valClass =
 highlight === "pos"
 ? "text-emerald-400"
 : highlight === "neg"
 ? "text-rose-400"
 : "text-foreground";
 return (
 <div className="rounded-md border border-border bg-foreground/5 p-4 flex flex-col gap-1">
 <span className="text-xs text-muted-foreground">{label}</span>
 <span className={cn("text-xl font-semibold", valClass)}>{value}</span>
 {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
 </div>
 );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
 return (
 <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
 {children}
 </h3>
 );
}

function InfoBox({
 children,
 variant = "blue",
}: {
 children: React.ReactNode;
 variant?: "blue" | "amber" | "emerald" | "violet";
}) {
 const colors = {
 blue: "bg-muted/10 border-border text-foreground",
 amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
 emerald: "bg-emerald-500/5 border-emerald-500/30 text-emerald-200",
 violet: "bg-muted/10 border-border text-foreground",
 };
 return (
 <div className={cn("rounded-lg border p-3 text-xs text-muted-foreground leading-relaxed", colors[variant])}>
 {children}
 </div>
 );
}

function SliderInput({
 label,
 value,
 min,
 max,
 step,
 onChange,
 format,
}: {
 label: string;
 value: number;
 min: number;
 max: number;
 step: number;
 onChange: (v: number) => void;
 format: (v: number) => string;
}) {
 return (
 <div className="flex flex-col gap-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{label}</span>
 <span className="text-foreground font-medium">{format(value)}</span>
 </div>
 <input
 type="range"
 min={min}
 max={max}
 step={step}
 value={value}
 onChange={(e) => onChange(parseFloat(e.target.value))}
 className="w-full accent-cyan-500"
 />
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — SPV Structure
// ══════════════════════════════════════════════════════════════════════════════

const PROJECT_SECTORS = [
 {
 name: "Offshore Wind",
 capex: 4200,
 tenor: 18,
 debtPct: 75,
 equity: 25,
 irr: 9.2,
 color: "#22d3ee",
 },
 {
 name: "Toll Road",
 capex: 1800,
 tenor: 25,
 debtPct: 70,
 equity: 30,
 irr: 8.7,
 color: "#a78bfa",
 },
 {
 name: "Airport PPP",
 capex: 3100,
 tenor: 30,
 debtPct: 65,
 equity: 35,
 irr: 10.1,
 color: "#34d399",
 },
 {
 name: "Gas Power Plant",
 capex: 950,
 tenor: 15,
 debtPct: 80,
 equity: 20,
 irr: 11.4,
 color: "#fb923c",
 },
 {
 name: "Solar Farm",
 capex: 720,
 tenor: 20,
 debtPct: 78,
 equity: 22,
 irr: 8.4,
 color: "#facc15",
 },
 {
 name: "LNG Terminal",
 capex: 6500,
 tenor: 20,
 debtPct: 70,
 equity: 30,
 irr: 13.2,
 color: "#f472b6",
 },
];

const CONTRACTUAL_FRAMEWORK = [
 {
 contract: "Concession Agreement",
 counterparty: "Government / Authority",
 purpose: "Right to build, operate, and collect revenues",
 term: "20–35 yrs",
 },
 {
 contract: "EPC Contract",
 counterparty: "EPC Contractor",
 purpose: "Fixed-price, date-certain construction obligation",
 term: "3–5 yrs",
 },
 {
 contract: "O&M Agreement",
 counterparty: "O&M Operator",
 purpose: "Ongoing operations & maintenance performance guarantee",
 term: "5–10 yrs",
 },
 {
 contract: "PPA / Offtake",
 counterparty: "Utility / Corporate",
 purpose: "Long-term revenue certainty at contracted price",
 term: "15–25 yrs",
 },
 {
 contract: "Loan Agreement",
 counterparty: "Senior Lenders",
 purpose: "Non-recourse project financing covenants",
 term: "Debt tenor",
 },
 {
 contract: "Equity Bridge Loan",
 counterparty: "Banks",
 purpose: "Bridge equity injection during construction phase",
 term: "1–2 yrs",
 },
];

function SPVDiagram() {
 const W = 700;
 const H = 420;

 // Node positions
 const nodes = {
 spv: { x: 350, y: 210, w: 110, h: 48, label: "SPV / ProjectCo", color: "#22d3ee" },
 sponsor1: { x: 110, y: 80, w: 100, h: 40, label: "Sponsor A", color: "#a78bfa" },
 sponsor2: { x: 230, y: 80, w: 100, h: 40, label: "Sponsor B", color: "#a78bfa" },
 lender: { x: 110, y: 340, w: 110, h: 40, label: "Senior Lenders", color: "#34d399" },
 govt: { x: 460, y: 80, w: 110, h: 40, label: "Government", color: "#fb923c" },
 offtaker: { x: 580, y: 200, w: 110, h: 40, label: "Offtaker / PPA", color: "#facc15" },
 epc: { x: 460, y: 340, w: 110, h: 40, label: "EPC Contractor", color: "#f472b6" },
 om: { x: 580, y: 340, w: 100, h: 40, label: "O&M Operator", color: "#e879f9" },
 };

 type NodeKey = keyof typeof nodes;

 const cx = (k: NodeKey) => nodes[k].x + nodes[k].w / 2;
 const cy = (k: NodeKey) => nodes[k].y + nodes[k].h / 2;

 const edges: Array<{ from: NodeKey; to: NodeKey; label: string; color: string; dashed?: boolean }> = [
 { from: "sponsor1", to: "spv", label: "Equity", color: "#a78bfa" },
 { from: "sponsor2", to: "spv", label: "Equity", color: "#a78bfa" },
 { from: "lender", to: "spv", label: "Non-recourse Debt", color: "#34d399" },
 { from: "spv", to: "govt", label: "Concession", color: "#fb923c" },
 { from: "spv", to: "offtaker", label: "Offtake Revenue", color: "#facc15" },
 { from: "spv", to: "epc", label: "EPC Contract", color: "#f472b6" },
 { from: "spv", to: "om", label: "O&M Contract", color: "#e879f9", dashed: true },
 ];

 return (
 <div className="overflow-x-auto">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto" style={{ minWidth: 420 }}>
 <defs>
 <marker id="arrowC" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
 <path d="M0,0 L0,6 L8,3 z" fill="#71717a" />
 </marker>
 {Object.entries(nodes).map(([k, n]) => (
 <marker
 key={k}
 id={`arrow-${k}`}
 markerWidth="8"
 markerHeight="8"
 refX="6"
 refY="3"
 orient="auto"
 >
 <path d="M0,0 L0,6 L8,3 z" fill={n.color} />
 </marker>
 ))}
 </defs>

 {/* Edges */}
 {edges.map((e, i) => {
 const x1 = cx(e.from);
 const y1 = cy(e.from);
 const x2 = cx(e.to);
 const y2 = cy(e.to);
 const mx = (x1 + x2) / 2;
 const my = (y1 + y2) / 2;
 return (
 <g key={i}>
 <line
 x1={x1}
 y1={y1}
 x2={x2}
 y2={y2}
 stroke={e.color}
 strokeWidth={1.5}
 strokeOpacity={0.6}
 strokeDasharray={e.dashed ? "4 3" : undefined}
 markerEnd={`url(#arrow-${e.to})`}
 />
 <text x={mx} y={my - 5} textAnchor="middle" fontSize={9} fill={e.color} opacity={0.85}>
 {e.label}
 </text>
 </g>
 );
 })}

 {/* Nodes */}
 {(Object.entries(nodes) as Array<[NodeKey, (typeof nodes)[NodeKey]]>).map(([k, n]) => (
 <g key={k}>
 <rect
 x={n.x}
 y={n.y}
 width={n.w}
 height={n.h}
 rx={8}
 fill={n.color + "22"}
 stroke={n.color}
 strokeWidth={1.5}
 />
 <text
 x={n.x + n.w / 2}
 y={n.y + n.h / 2 + 4}
 textAnchor="middle"
 fontSize={11}
 fontWeight="600"
 fill={n.color}
 >
 {n.label}
 </text>
 </g>
 ))}
 </svg>
 </div>
 );
}

function WaterfallBar({
 label,
 value,
 maxValue,
 color,
 sub,
}: {
 label: string;
 value: number;
 maxValue: number;
 color: string;
 sub?: string;
}) {
 const pct = Math.min(100, (value / maxValue) * 100);
 return (
 <div className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground w-36 shrink-0 text-right">{label}</span>
 <div className="flex-1 h-6 rounded bg-foreground/5 overflow-hidden">
 <div
 className="h-full rounded transition-colors duration-300"
 style={{ width: `${pct}%`, background: color }}
 />
 </div>
 <span className="text-xs font-medium w-20 text-right" style={{ color }}>
 {sub ?? fmtM(value)}
 </span>
 </div>
 );
}

function TabSPVStructure() {
 const [selectedSector, setSelectedSector] = useState(0);
 const sec = PROJECT_SECTORS[selectedSector];
 const debtAmt = (sec.capex * sec.debtPct) / 100;
 const equityAmt = (sec.capex * sec.equity) / 100;

 return (
 <div className="space-y-4">
 {/* Hero stats */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatCard label="Typical CAPEX" value={fmtM(sec.capex)} sub="Total project cost" />
 <StatCard label="Debt Tranche" value={fmtPct(sec.debtPct)} sub={fmtM(debtAmt)} highlight="pos" />
 <StatCard label="Equity Tranche" value={fmtPct(sec.equity)} sub={fmtM(equityAmt)} />
 <StatCard label="Project IRR" value={fmtPct(sec.irr)} sub={`${sec.tenor}-yr tenor`} highlight="pos" />
 </div>

 {/* Sector selector */}
 <div>
 <SectionTitle>
 <Building2 size={14} />
 Select Project Sector
 </SectionTitle>
 <div className="flex flex-wrap gap-2">
 {PROJECT_SECTORS.map((ps, i) => (
 <button
 key={ps.name}
 onClick={() => setSelectedSector(i)}
 className={cn(
 "px-3 py-1.5 rounded-full text-xs text-muted-foreground font-medium border transition-colors",
 selectedSector === i
 ? "border-cyan-500 bg-cyan-500/20 text-muted-foreground"
 : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
 )}
 >
 {ps.name}
 </button>
 ))}
 </div>
 </div>

 {/* SPV Diagram */}
 <div>
 <SectionTitle>
 <Layers size={14} />
 SPV / ProjectCo Structure
 </SectionTitle>
 <div className="rounded-md border border-border border-l-4 border-l-primary bg-foreground/5 p-6">
 <SPVDiagram />
 </div>
 </div>

 {/* Equity vs Debt Waterfall */}
 <div>
 <SectionTitle>
 <DollarSign size={14} />
 Capital Structure Waterfall
 </SectionTitle>
 <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-3">
 <WaterfallBar label="Total CAPEX" value={sec.capex} maxValue={sec.capex} color="#71717a" />
 <WaterfallBar label="Senior Debt" value={debtAmt} maxValue={sec.capex} color="#34d399" />
 <WaterfallBar label="Equity (Sponsors)" value={equityAmt} maxValue={sec.capex} color="#a78bfa" />
 <WaterfallBar
 label="Equity IRR Target"
 value={equityAmt}
 maxValue={sec.capex}
 color="#22d3ee"
 sub={`${fmtPct(sec.irr + 3.5)} target`}
 />
 </div>
 </div>

 {/* Contractual Framework */}
 <div>
 <SectionTitle>
 <FileText size={14} />
 Contractual Framework
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="px-4 py-2 text-left text-muted-foreground font-medium">Contract</th>
 <th className="px-4 py-2 text-left text-muted-foreground font-medium">Counterparty</th>
 <th className="px-4 py-2 text-left text-muted-foreground font-medium">Purpose</th>
 <th className="px-4 py-2 text-left text-muted-foreground font-medium">Typical Term</th>
 </tr>
 </thead>
 <tbody>
 {CONTRACTUAL_FRAMEWORK.map((row, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-2 text-muted-foreground font-medium">{row.contract}</td>
 <td className="px-4 py-2 text-muted-foreground">{row.counterparty}</td>
 <td className="px-4 py-2 text-muted-foreground">{row.purpose}</td>
 <td className="px-4 py-2 text-emerald-400 font-medium">{row.term}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <InfoBox variant="blue">
 <strong>Non-Recourse Structure:</strong> Lenders have recourse only to the project assets and cash flows — not to sponsors&apos; balance sheets. This isolates project risk and allows sponsors to pursue multiple projects simultaneously without cross-contamination of credit risk.
 </InfoBox>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Cash Flow Model
// ══════════════════════════════════════════════════════════════════════════════

function generateProjectCashFlows(utilization: number) {
 // 20-year project: years 1-3 construction, 4-23 operations
 const years: Array<{
 year: number;
 revenue: number;
 opex: number;
 ebitda: number;
 debtService: number;
 dscr: number;
 equityCF: number;
 phase: "construction" | "ramp" | "steady" | "tail";
 }> = [];

 const baseRevenue = 280; // $280M at 100% utilization
 const annualOpex = 55; // $55M fixed opex
 const annualDebtService = 68; // $68M annual debt service
 const rampYears = 3; // years 4-6 ramp up

 for (let y = 1; y <= 20; y++) {
 let phase: "construction" | "ramp" | "steady" | "tail";
 let revenue = 0;
 let opex = 0;
 let debtService = 0;

 if (y <= 3) {
 phase = "construction";
 revenue = 0;
 opex = 15 + y * 5; // construction costs
 debtService = 0;
 } else if (y <= 6) {
 phase = "ramp";
 const rampFactor = (y - 3) / rampYears;
 revenue = baseRevenue * (utilization / 100) * (0.55 + rampFactor * 0.45);
 opex = annualOpex * 0.85;
 debtService = annualDebtService * 0.7;
 } else if (y <= 17) {
 phase = "steady";
 // Add slight growth
 const growthFactor = 1 + (y - 6) * 0.012;
 revenue = baseRevenue * (utilization / 100) * growthFactor;
 opex = annualOpex * (1 + (y - 6) * 0.015);
 debtService = annualDebtService;
 } else {
 phase = "tail";
 revenue = baseRevenue * (utilization / 100) * 1.14;
 opex = annualOpex * 1.25;
 debtService = annualDebtService * 0.4; // debt mostly repaid
 }

 const ebitda = revenue - opex;
 const dscr = debtService > 0 ? ebitda / debtService : 0;
 const equityCF = Math.max(0, ebitda - debtService);

 years.push({ year: y, revenue, opex, ebitda, debtService, dscr, equityCF, phase });
 }

 return years;
}

function CashFlowWaterfallSVG({
 data,
}: {
 data: ReturnType<typeof generateProjectCashFlows>;
}) {
 const W = 660;
 const H = 200;
 const PAD = { top: 16, right: 12, bottom: 30, left: 48 };
 const innerW = W - PAD.left - PAD.right;
 const innerH = H - PAD.top - PAD.bottom;

 const barW = innerW / data.length - 2;
 const maxVal = Math.max(...data.map((d) => d.revenue), 320);

 const yScale = (v: number) => innerH - (v / maxVal) * innerH;

 const yGridLines = [0, 100, 200, 300];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
 {/* Grid */}
 {yGridLines.map((v) => (
 <g key={v}>
 <line
 x1={PAD.left}
 y1={PAD.top + yScale(v)}
 x2={PAD.left + innerW}
 y2={PAD.top + yScale(v)}
 stroke="#ffffff15"
 strokeWidth={1}
 />
 <text x={PAD.left - 4} y={PAD.top + yScale(v) + 4} textAnchor="end" fontSize={9} fill="#71717a">
 ${v}M
 </text>
 </g>
 ))}

 {/* Bars */}
 {data.map((d, i) => {
 const x = PAD.left + i * (innerW / data.length) + 1;
 const revH = (d.revenue / maxVal) * innerH;
 const opexH = (d.opex / maxVal) * innerH;
 const dsH = (d.debtService / maxVal) * innerH;
 const eqH = Math.max(0, (d.equityCF / maxVal) * innerH);

 return (
 <g key={d.year}>
 {/* Revenue bar */}
 {d.revenue > 0 && (
 <rect
 x={x}
 y={PAD.top + innerH - revH}
 width={barW * 0.95}
 height={revH}
 fill="#22d3ee33"
 stroke="#22d3ee"
 strokeWidth={0.5}
 rx={1}
 />
 )}
 {/* OPEX overlay */}
 {d.opex > 0 && (
 <rect
 x={x}
 y={PAD.top + innerH - opexH}
 width={barW * 0.95}
 height={opexH}
 fill="#f472b644"
 rx={1}
 />
 )}
 {/* Debt service */}
 {d.debtService > 0 && (
 <rect
 x={x + barW * 0.3}
 y={PAD.top + innerH - (opexH + dsH)}
 width={barW * 0.25}
 height={dsH}
 fill="#fb923c88"
 rx={1}
 />
 )}
 {/* Equity CF */}
 {eqH > 0 && (
 <rect
 x={x + barW * 0.6}
 y={PAD.top + innerH - eqH}
 width={barW * 0.3}
 height={eqH}
 fill="#34d39988"
 rx={1}
 />
 )}
 {/* Year label */}
 <text
 x={x + barW / 2}
 y={H - 6}
 textAnchor="middle"
 fontSize={8}
 fill="#71717a"
 >
 {d.year}
 </text>
 </g>
 );
 })}

 {/* Legend */}
 {[
 { color: "#22d3ee", label: "Revenue" },
 { color: "#f472b6", label: "OpEx" },
 { color: "#fb923c", label: "Debt Service" },
 { color: "#34d399", label: "Equity CF" },
 ].map((l, i) => (
 <g key={l.label} transform={`translate(${PAD.left + i * 118}, 4)`}>
 <rect width={10} height={8} fill={l.color} rx={1} />
 <text x={13} y={8} fontSize={9} fill="#a1a1aa">
 {l.label}
 </text>
 </g>
 ))}
 </svg>
 );
}

function DSCRBarChart({
 data,
}: {
 data: ReturnType<typeof generateProjectCashFlows>;
}) {
 const W = 660;
 const H = 160;
 const PAD = { top: 12, right: 12, bottom: 28, left: 40 };
 const innerW = W - PAD.left - PAD.right;
 const innerH = H - PAD.top - PAD.bottom;

 const opData = data.filter((d) => d.dscr > 0);
 const barW = innerW / opData.length - 2;
 const maxDSCR = 4;

 const yScale = (v: number) => innerH - Math.min(1, v / maxDSCR) * innerH;

 // DSCR covenant line at 1.20
 const covenantY = PAD.top + yScale(1.2);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
 {/* Grid lines */}
 {[1.0, 1.2, 2.0, 3.0].map((v) => (
 <g key={v}>
 <line
 x1={PAD.left}
 y1={PAD.top + yScale(v)}
 x2={PAD.left + innerW}
 y2={PAD.top + yScale(v)}
 stroke={v === 1.2 ? "#fb923c66" : "#ffffff10"}
 strokeWidth={v === 1.2 ? 1.5 : 1}
 strokeDasharray={v === 1.2 ? "4 3" : undefined}
 />
 <text x={PAD.left - 4} y={PAD.top + yScale(v) + 4} textAnchor="end" fontSize={8} fill="#71717a">
 {v.toFixed(1)}x
 </text>
 </g>
 ))}

 {/* Covenant label */}
 <text x={PAD.left + innerW - 2} y={covenantY - 3} textAnchor="end" fontSize={8} fill="#fb923c">
 Min DSCR 1.20x
 </text>

 {/* Bars */}
 {opData.map((d, i) => {
 const clampedDSCR = Math.min(d.dscr, maxDSCR);
 const barH = (clampedDSCR / maxDSCR) * innerH;
 const isLow = d.dscr < 1.2;
 const color = isLow ? "#f87171" : d.dscr >= 2 ? "#34d399" : "#22d3ee";
 const x = PAD.left + i * (innerW / opData.length) + 1;

 return (
 <g key={d.year}>
 <rect
 x={x}
 y={PAD.top + innerH - barH}
 width={barW * 0.85}
 height={barH}
 fill={color + "55"}
 stroke={color}
 strokeWidth={0.5}
 rx={1}
 />
 <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={8} fill="#71717a">
 {d.year}
 </text>
 </g>
 );
 })}

 <text x={PAD.left} y={8} fontSize={9} fill="#a1a1aa">
 DSCR by Year (operations)
 </text>
 </svg>
 );
}

function TabCashFlowModel() {
 const [utilization, setUtilization] = useState(85);

 const cashFlows = useMemo(() => generateProjectCashFlows(utilization), [utilization]);

 const operatingYears = cashFlows.filter((d) => d.phase !== "construction");
 const avgDSCR =
 operatingYears.filter((d) => d.dscr > 0).reduce((a, b) => a + b.dscr, 0) /
 operatingYears.filter((d) => d.dscr > 0).length;
 const totalEquityCF = operatingYears.reduce((a, b) => a + b.equityCF, 0);
 const minDSCR = Math.min(...operatingYears.filter((d) => d.dscr > 0).map((d) => d.dscr));
 const peakRevenue = Math.max(...cashFlows.map((d) => d.revenue));

 return (
 <div className="space-y-4">
 {/* Slider controls */}
 <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-4">
 <SectionTitle>
 <Activity size={14} />
 Model Inputs
 </SectionTitle>
 <SliderInput
 label="Capacity Utilization"
 value={utilization}
 min={50}
 max={100}
 step={1}
 onChange={setUtilization}
 format={(v) => `${v.toFixed(0)}%`}
 />
 </div>

 {/* Key metrics */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatCard
 label="Avg DSCR"
 value={fmtX(avgDSCR)}
 sub="Operations period"
 highlight={avgDSCR >= 1.4 ? "pos" : "neg"}
 />
 <StatCard
 label="Min DSCR"
 value={fmtX(minDSCR)}
 sub="Worst year"
 highlight={minDSCR >= 1.2 ? "pos" : "neg"}
 />
 <StatCard label="Peak Revenue" value={fmtM(peakRevenue)} sub="Steady state" />
 <StatCard label="Total Equity CF" value={fmtM(totalEquityCF)} sub="20-year cumulative" highlight="pos" />
 </div>

 {/* Cash flow waterfall SVG */}
 <div>
 <SectionTitle>
 <BarChart3 size={14} />
 20-Year Cash Flow Projection
 </SectionTitle>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <CashFlowWaterfallSVG data={cashFlows} />
 </div>
 </div>

 {/* DSCR chart */}
 <div>
 <SectionTitle>
 <TrendingUp size={14} />
 DSCR Coverage by Year
 </SectionTitle>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <DSCRBarChart data={cashFlows} />
 </div>
 </div>

 {/* Year-by-year table (abridged) */}
 <div>
 <SectionTitle>
 <FileText size={14} />
 Annual Cash Flow Summary
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="px-3 py-2 text-left text-muted-foreground">Year</th>
 <th className="px-3 py-2 text-right text-muted-foreground">Phase</th>
 <th className="px-3 py-2 text-right text-muted-foreground">Revenue</th>
 <th className="px-3 py-2 text-right text-muted-foreground">OpEx</th>
 <th className="px-3 py-2 text-right text-muted-foreground">EBITDA</th>
 <th className="px-3 py-2 text-right text-muted-foreground">Debt Svc</th>
 <th className="px-3 py-2 text-right text-muted-foreground">DSCR</th>
 <th className="px-3 py-2 text-right text-muted-foreground">Equity CF</th>
 </tr>
 </thead>
 <tbody>
 {cashFlows.map((row) => (
 <tr key={row.year} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-3 py-1.5 text-muted-foreground font-medium">Y{row.year}</td>
 <td className="px-3 py-1.5 text-right">
 <Badge
 className={cn(
 "text-xs text-muted-foreground capitalize",
 row.phase === "construction"
 ? "bg-amber-500/20 text-amber-300"
 : row.phase === "ramp"
 ? "bg-muted/10 text-foreground"
 : row.phase === "tail"
 ? "bg-muted-foreground/20 text-muted-foreground"
 : "bg-cyan-500/20 text-muted-foreground"
 )}
 >
 {row.phase}
 </Badge>
 </td>
 <td className="px-3 py-1.5 text-right text-muted-foreground">{row.revenue > 0 ? fmtM(row.revenue) : "—"}</td>
 <td className="px-3 py-1.5 text-right text-rose-400">{fmtM(row.opex)}</td>
 <td className="px-3 py-1.5 text-right text-muted-foreground">{row.ebitda > 0 ? fmtM(row.ebitda) : "—"}</td>
 <td className="px-3 py-1.5 text-right text-orange-400">
 {row.debtService > 0 ? fmtM(row.debtService) : "—"}
 </td>
 <td
 className={cn(
 "px-3 py-1.5 text-right font-medium",
 row.dscr === 0 ? "text-muted-foreground" : row.dscr < 1.2 ? "text-rose-400" : "text-emerald-400"
 )}
 >
 {row.dscr > 0 ? fmtX(row.dscr) : "—"}
 </td>
 <td className="px-3 py-1.5 text-right text-emerald-400">
 {row.equityCF > 0 ? fmtM(row.equityCF) : "—"}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <InfoBox variant="emerald">
 <strong>DSCR Covenant:</strong> Lenders typically require a minimum DSCR of 1.20x–1.30x throughout the debt tenor. A cash sweep mechanism captures excess cash above a target DSCR (e.g., 1.40x) into a debt service reserve account (DSRA), typically sized at 6 months of debt service.
 </InfoBox>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Risk Allocation
// ══════════════════════════════════════════════════════════════════════════════

const RISK_MATRIX = [
 {
 category: "Construction Risk",
 risks: ["Cost overrun", "Schedule delay", "Design defect", "Force majeure"],
 mitigant: "Fixed-price EPC contract, performance bonds, delay LDs, advance payment guarantees",
 bearer: "EPC Contractor",
 severity: "high",
 mitigation: 80,
 },
 {
 category: "Operational Risk",
 risks: ["Underperformance", "Equipment failure", "Unplanned outage", "O&M cost escalation"],
 mitigant: "O&M contract with performance guarantees, equipment warranties, planned maintenance reserves",
 bearer: "O&M Operator",
 severity: "medium",
 mitigation: 70,
 },
 {
 category: "Market / Revenue Risk",
 risks: ["Volume shortfall", "Price decline", "Offtaker default", "Merchant price volatility"],
 mitigant: "Long-term PPA/offtake agreement, take-or-pay clauses, creditworthy offtaker, hedging",
 bearer: "Offtaker / Sponsors",
 severity: "high",
 mitigation: 65,
 },
 {
 category: "Regulatory Risk",
 risks: ["Permit withdrawal", "Environmental changes", "Tariff regulation", "Policy reversal"],
 mitigant: "Stability clause in concession, change-in-law provisions, government support agreement",
 bearer: "Government / Shared",
 severity: "medium",
 mitigation: 55,
 },
 {
 category: "Force Majeure",
 risks: ["Natural disaster", "War / civil unrest", "Pandemic", "Grid collapse"],
 mitigant: "Political risk insurance (MIGA/OPIC), business interruption insurance, relief event clauses",
 bearer: "Insurers / Shared",
 severity: "low",
 mitigation: 60,
 },
 {
 category: "Refinancing Risk",
 risks: ["Market conditions", "Rating downgrade", "Covenant breach", "Tenor mismatch"],
 mitigant: "Cash sweep, DSRA, sculpted amortization, refinancing lock mechanism at financial close",
 bearer: "Sponsors / Lenders",
 severity: "medium",
 mitigation: 50,
 },
];

const POLITICAL_RISK_TOOLS = [
 {
 org: "MIGA",
 fullName: "Multilateral Investment Guarantee Agency",
 coverage: ["Expropriation", "Transfer restriction", "War & civil disturbance", "Breach of contract"],
 maxTenor: "Up to 20 years",
 note: "World Bank Group member; enhances lender comfort in emerging markets",
 },
 {
 org: "DFI / OPIC",
 fullName: "Development Finance Institutions (DFC/OPIC)",
 coverage: ["Political risk insurance", "Direct loans", "Equity investment", "Investment guarantees"],
 maxTenor: "Up to 25 years",
 note: "US DFC, UKEF, JBIC, KfW: bilateral DFI support critical for frontier markets",
 },
 {
 org: "Export Credit",
 fullName: "Export Credit Agencies (ECAs)",
 coverage: ["Buyer credit", "Supplier credit", "Tied aid", "Untied loans"],
 maxTenor: "Up to 18 years",
 note: "Hermes (Germany), COFACE (France), SINOSURE (China) — often attached to equipment supply",
 },
];

function RiskMeter({ value, max = 100 }: { value: number; max?: number }) {
 const pct = Math.min(100, (value / max) * 100);
 const color = pct >= 70 ? "#34d399" : pct >= 50 ? "#facc15" : "#f87171";
 return (
 <div className="flex items-center gap-2">
 <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
 <div
 className="h-full rounded-full transition-colors duration-300"
 style={{ width: `${pct}%`, background: color }}
 />
 </div>
 <span className="text-xs font-medium w-8 text-right" style={{ color }}>
 {value}%
 </span>
 </div>
 );
}

function TabRiskAllocation() {
 const [expanded, setExpanded] = useState<number | null>(null);

 return (
 <div className="space-y-4">
 {/* Risk matrix */}
 <div>
 <SectionTitle>
 <AlertTriangle size={14} />
 Risk Allocation Matrix
 </SectionTitle>
 <div className="space-y-2">
 {RISK_MATRIX.map((row, i) => (
 <motion.div
 key={row.category}
 className="rounded-md border border-border bg-foreground/5 overflow-hidden cursor-pointer"
 onClick={() => setExpanded(expanded === i ? null : i)}
 >
 <div className="flex items-center gap-3 px-4 py-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-sm font-medium text-foreground">{row.category}</span>
 <Badge
 className={cn(
 "text-xs text-muted-foreground",
 row.severity === "high"
 ? "bg-rose-500/20 text-rose-300"
 : row.severity === "medium"
 ? "bg-amber-500/20 text-amber-300"
 : "bg-emerald-500/20 text-emerald-300"
 )}
 >
 {row.severity}
 </Badge>
 <Badge className="bg-muted/10 text-foreground text-xs">{row.bearer}</Badge>
 </div>
 <RiskMeter value={row.mitigation} />
 </div>
 <span className="text-muted-foreground text-sm">{expanded === i ? "▲" : "▼"}</span>
 </div>
 <AnimatePresence>
 {expanded === i && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="border-t border-border px-4 py-3 space-y-3"
 >
 <div>
 <span className="text-xs text-muted-foreground font-medium ">Key Risks</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {row.risks.map((rk) => (
 <span
 key={rk}
 className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs"
 >
 {rk}
 </span>
 ))}
 </div>
 </div>
 <div>
 <span className="text-xs text-muted-foreground font-medium ">Mitigants</span>
 <p className="text-xs text-muted-foreground mt-1">{row.mitigant}</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 ))}
 </div>
 </div>

 {/* Political risk insurance */}
 <div>
 <SectionTitle>
 <Globe size={14} />
 Political Risk Insurance & DFI Support
 </SectionTitle>
 <div className="space-y-3">
 {POLITICAL_RISK_TOOLS.map((tool) => (
 <div key={tool.org} className="rounded-md border border-border bg-foreground/5 p-4">
 <div className="flex items-start justify-between mb-2">
 <div>
 <span className="text-sm font-semibold text-muted-foreground">{tool.org}</span>
 <span className="text-xs text-muted-foreground ml-2">{tool.fullName}</span>
 </div>
 <span className="text-xs text-emerald-400 font-medium">{tool.maxTenor}</span>
 </div>
 <div className="flex flex-wrap gap-1 mb-2">
 {tool.coverage.map((c) => (
 <span
 key={c}
 className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-muted-foreground text-xs"
 >
 {c}
 </span>
 ))}
 </div>
 <p className="text-xs text-muted-foreground">{tool.note}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Completion guarantees */}
 <div>
 <SectionTitle>
 <Shield size={14} />
 Completion Guarantees
 </SectionTitle>
 <div className="grid sm:grid-cols-3 gap-3">
 {[
 {
 title: "Sponsor Completion Guarantee",
 desc: "Sponsors agree to inject additional equity if project cannot complete with existing resources. Removed at mechanical completion.",
 color: "#a78bfa",
 },
 {
 title: "Performance Bond",
 desc: "EPC contractor posts bond (typically 10% of contract value) callable on failure to meet completion tests. Provides liquidity during disputes.",
 color: "#34d399",
 },
 {
 title: "Liquidated Damages (LDs)",
 desc: "Pre-agreed daily damages for delay and performance shortfall. Typically: delay LDs = projected lost revenue, performance LDs = NPV of projected shortfall.",
 color: "#22d3ee",
 },
 ].map((item) => (
 <div
 key={item.title}
 className="rounded-md border border-border bg-foreground/5 p-4"
 style={{ borderTopColor: item.color, borderTopWidth: 2 }}
 >
 <h4 className="text-sm font-semibold mb-2" style={{ color: item.color }}>
 {item.title}
 </h4>
 <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>

 <InfoBox variant="amber">
 <strong>Risk Allocation Principle:</strong> In project finance, each risk should be borne by the party best positioned to manage it. Construction risks → EPC contractor. Operations risks → O&M operator. Market risks → offtaker via long-term contracts. Residual/political risks → government guarantees or insurance.
 </InfoBox>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Deal Metrics
// ══════════════════════════════════════════════════════════════════════════════

const SECTOR_DEBT_TABLE = [
 { sector: "Offshore Wind", tenor: "18–20 yrs", margin: "180–220 bps", ltv: "70–75%", minDSCR: "1.25x" },
 { sector: "Toll Road", tenor: "22–28 yrs", margin: "120–160 bps", ltv: "65–72%", minDSCR: "1.20x" },
 { sector: "Airport PPP", tenor: "25–30 yrs", margin: "100–140 bps", ltv: "60–68%", minDSCR: "1.15x" },
 { sector: "Gas Power", tenor: "12–15 yrs", margin: "200–280 bps", ltv: "75–82%", minDSCR: "1.30x" },
 { sector: "Solar / Wind", tenor: "18–22 yrs", margin: "140–190 bps", ltv: "73–78%", minDSCR: "1.25x" },
 { sector: "LNG / Pipeline", tenor: "15–20 yrs", margin: "150–200 bps", ltv: "65–72%", minDSCR: "1.30x" },
];

const PPP_VS_MERCHANT = [
 { metric: "Revenue certainty", ppp: "High (contracted)", merchant: "Low (market price)" },
 { metric: "DSCR range", ppp: "1.20–1.40x", merchant: "1.50–2.00x+" },
 { metric: "Leverage", ppp: "70–80%", merchant: "50–65%" },
 { metric: "Project IRR", ppp: "8–11%", merchant: "12–18%" },
 { metric: "Equity IRR", ppp: "10–14%", merchant: "15–22%" },
 { metric: "Rating", ppp: "Investment grade (BBB)", merchant: "Sub-investment grade" },
 { metric: "EPC risk", ppp: "Shared / covered", merchant: "Sponsor bears" },
 { metric: "Typical sector", ppp: "Regulated utilities, roads", merchant: "Merchant power, commodities" },
];

function GaugeSVG({
 value,
 min,
 max,
 label,
 unit,
 color,
}: {
 value: number;
 min: number;
 max: number;
 label: string;
 unit: string;
 color: string;
}) {
 const W = 140;
 const H = 100;
 const cx = W / 2;
 const cy = 82;
 const r = 56;

 // Arc: semicircle from 180° to 0° (left to right)
 const startAngle = Math.PI; // 180°
 const endAngle = 0; // 0°
 const range = endAngle - startAngle; // -π
 const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
 const currentAngle = startAngle + range * pct; // note: range is negative, goes clockwise

 // Arc path
 const toXY = (angle: number, radius: number) => ({
 x: cx + radius * Math.cos(angle),
 y: cy + radius * Math.sin(angle),
 });

 const bgStart = toXY(Math.PI, r);
 const bgEnd = toXY(0, r);
 const valEnd = toXY(currentAngle, r);

 const largeArcFlag = Math.abs(currentAngle - Math.PI) > Math.PI ? 1 : 0;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[140px]">
 {/* Background arc */}
 <path
 d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
 fill="none"
 stroke="#ffffff15"
 strokeWidth={10}
 strokeLinecap="round"
 />
 {/* Value arc */}
 {pct > 0 && (
 <path
 d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${valEnd.x} ${valEnd.y}`}
 fill="none"
 stroke={color}
 strokeWidth={10}
 strokeLinecap="round"
 />
 )}
 {/* Needle dot */}
 <circle cx={valEnd.x} cy={valEnd.y} r={4} fill={color} />
 {/* Value */}
 <text x={cx} y={cy - 10} textAnchor="middle" fontSize={18} fontWeight="700" fill="white">
 {typeof value === "number" && !Number.isInteger(value)
 ? value.toFixed(2)
 : value}
 {unit}
 </text>
 {/* Label */}
 <text x={cx} y={cy + 8} textAnchor="middle" fontSize={9} fill="#71717a">
 {label}
 </text>
 {/* Min/Max */}
 <text x={cx - r + 4} y={cy + 16} textAnchor="middle" fontSize={8} fill="#52525b">
 {min}{unit}
 </text>
 <text x={cx + r - 4} y={cy + 16} textAnchor="middle" fontSize={8} fill="#52525b">
 {max}{unit}
 </text>
 </svg>
 );
}

function RefinancingAnalysisSVG() {
 const W = 560;
 const H = 180;
 const PAD = { top: 20, right: 20, bottom: 30, left: 60 };
 const innerW = W - PAD.left - PAD.right;
 const innerH = H - PAD.top - PAD.bottom;

 // Before/after refinancing debt service profile
 const years = Array.from({ length: 15 }, (_, i) => i + 1);
 const beforeDS = years.map((y) => (y <= 10 ? 68 : 72)); // original: higher early service
 const afterDS = years.map((y) => (y <= 3 ? 68 : y <= 12 ? 52 : 40)); // refi: lower after yr3

 const maxDS = 80;
 const yScale = (v: number) => innerH - (v / maxDS) * innerH;
 const xScale = (i: number) => PAD.left + (i / (years.length - 1)) * innerW;

 const beforePath = years
 .map((_, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${PAD.top + yScale(beforeDS[i])}`)
 .join("");
 const afterPath = years
 .map((_, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${PAD.top + yScale(afterDS[i])}`)
 .join("");

 // Savings area
 const savingsArea =
 years
 .map(
 (_, i) =>
 `${i === 0 ? "M" : "L"} ${xScale(i)} ${PAD.top + yScale(afterDS[i])}`
 )
 .join("") +
 "" +
 [...years]
 .reverse()
 .map((_, ri) => {
 const i = years.length - 1 - ri;
 return `L ${xScale(i)} ${PAD.top + yScale(beforeDS[i])}`;
 })
 .join("") +
 " Z";

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
 {/* Grid */}
 {[20, 40, 60, 80].map((v) => (
 <g key={v}>
 <line
 x1={PAD.left}
 y1={PAD.top + yScale(v)}
 x2={PAD.left + innerW}
 y2={PAD.top + yScale(v)}
 stroke="#ffffff10"
 strokeWidth={1}
 />
 <text x={PAD.left - 4} y={PAD.top + yScale(v) + 4} textAnchor="end" fontSize={9} fill="#71717a">
 ${v}M
 </text>
 </g>
 ))}

 {/* Savings fill */}
 <path d={savingsArea} fill="#34d39915" />

 {/* Before line */}
 <path d={beforePath} fill="none" stroke="#f472b6" strokeWidth={2} strokeDasharray="5 3" />

 {/* After line */}
 <path d={afterPath} fill="none" stroke="#34d399" strokeWidth={2} />

 {/* X axis labels */}
 {years.map((y, i) => (
 <text key={y} x={xScale(i)} y={H - 8} textAnchor="middle" fontSize={8} fill="#71717a">
 Y{y}
 </text>
 ))}

 {/* Legend */}
 <g transform={`translate(${PAD.left}, 4)`}>
 <line x1={0} y1={6} x2={16} y2={6} stroke="#f472b6" strokeWidth={2} strokeDasharray="5 3" />
 <text x={20} y={10} fontSize={9} fill="#a1a1aa">
 Original Debt Service
 </text>
 <line x1={130} y1={6} x2={146} y2={6} stroke="#34d399" strokeWidth={2} />
 <text x={150} y={10} fontSize={9} fill="#a1a1aa">
 Post-Refi Service
 </text>
 <rect x={250} y={0} width={12} height={12} fill="#34d39915" />
 <text x={265} y={10} fontSize={9} fill="#a1a1aa">
 Refinancing Gain
 </text>
 </g>
 </svg>
 );
}

function TabDealMetrics() {
 const metrics = useMemo(() => {
 // Deterministic values from seed
 return {
 projectIRR: 9.4 + r() * 2.2,
 equityIRR: 13.8 + r() * 3.4,
 dscr: 1.38 + r() * 0.42,
 llcr: 1.52 + r() * 0.38,
 plcr: 1.71 + r() * 0.44,
 debtTenor: 18 + Math.floor(r() * 7),
 refiGain: 85 + r() * 65,
 };
 }, []);

 return (
 <div className="space-y-4">
 {/* Gauge displays */}
 <div>
 <SectionTitle>
 <Target size={14} />
 Key Project Finance Metrics
 </SectionTitle>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 justify-items-center">
 <div className="text-center">
 <GaugeSVG value={metrics.projectIRR} min={6} max={16} label="Project IRR" unit="%" color="#22d3ee" />
 </div>
 <div className="text-center">
 <GaugeSVG value={metrics.equityIRR} min={8} max={25} label="Equity IRR" unit="%" color="#a78bfa" />
 </div>
 <div className="text-center">
 <GaugeSVG value={metrics.dscr} min={1.0} max={2.5} label="Avg DSCR" unit="x" color="#34d399" />
 </div>
 <div className="text-center">
 <GaugeSVG value={metrics.llcr} min={1.0} max={2.5} label="LLCR" unit="x" color="#fb923c" />
 </div>
 <div className="text-center">
 <GaugeSVG value={metrics.plcr} min={1.0} max={3.0} label="PLCR" unit="x" color="#f472b6" />
 </div>
 </div>
 <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
 {[
 { label: "Project IRR", desc: "Return on total capital" },
 { label: "Equity IRR", desc: "Return on equity invested" },
 { label: "Avg DSCR", desc: "EBITDA / Debt Service" },
 { label: "LLCR", desc: "NPV(CF) / Outstanding debt" },
 { label: "PLCR", desc: "NPV(CF) / Total project debt" },
 ].map((m) => (
 <div key={m.label} className="text-center">
 <div className="text-xs font-medium text-muted-foreground">{m.label}</div>
 <div className="text-xs text-muted-foreground">{m.desc}</div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Debt pricing by sector */}
 <div>
 <SectionTitle>
 <Percent size={14} />
 Typical Debt Tenor &amp; Pricing by Sector
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="px-4 py-2 text-left text-muted-foreground">Sector</th>
 <th className="px-4 py-2 text-right text-muted-foreground">Debt Tenor</th>
 <th className="px-4 py-2 text-right text-muted-foreground">Margin (bps)</th>
 <th className="px-4 py-2 text-right text-muted-foreground">LTV / Gearing</th>
 <th className="px-4 py-2 text-right text-muted-foreground">Min DSCR</th>
 </tr>
 </thead>
 <tbody>
 {SECTOR_DEBT_TABLE.map((row, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-2 text-muted-foreground font-medium">{row.sector}</td>
 <td className="px-4 py-2 text-right text-muted-foreground">{row.tenor}</td>
 <td className="px-4 py-2 text-right text-amber-400">{row.margin}</td>
 <td className="px-4 py-2 text-right text-emerald-400">{row.ltv}</td>
 <td className="px-4 py-2 text-right text-foreground">{row.minDSCR}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Refinancing gain */}
 <div>
 <SectionTitle>
 <TrendingDown size={14} />
 Refinancing Gain Analysis
 </SectionTitle>
 <div className="grid sm:grid-cols-3 gap-3 mb-4">
 <StatCard label="Refi Gain (NPV)" value={fmtM(metrics.refiGain)} sub="Margin compression benefit" highlight="pos" />
 <StatCard label="Debt Tenor" value={`${metrics.debtTenor} yrs`} sub="Post-refi extension" />
 <StatCard label="Equity Uplift" value={fmtPct((metrics.refiGain / 600) * 100)} sub="IRR improvement" highlight="pos" />
 </div>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <RefinancingAnalysisSVG />
 </div>
 </div>

 {/* PPP vs Merchant */}
 <div>
 <SectionTitle>
 <ArrowRight size={14} />
 PPP vs Merchant Project Comparison
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="px-4 py-2 text-left text-muted-foreground">Metric</th>
 <th className="px-4 py-2 text-center text-muted-foreground">PPP / Contracted</th>
 <th className="px-4 py-2 text-center text-amber-400">Merchant / Market</th>
 </tr>
 </thead>
 <tbody>
 {PPP_VS_MERCHANT.map((row, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-2 text-muted-foreground">{row.metric}</td>
 <td className="px-4 py-2 text-center text-muted-foreground">{row.ppp}</td>
 <td className="px-4 py-2 text-center text-amber-300">{row.merchant}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <InfoBox variant="violet">
 <strong>LLCR vs PLCR:</strong> Loan Life Coverage Ratio (LLCR) measures NPV of project cash flows over the remaining loan life divided by outstanding debt. Project Life Coverage Ratio (PLCR) uses the full project life — always higher than LLCR. Lenders typically covenant LLCR ≥ 1.30x and PLCR ≥ 1.50x.
 </InfoBox>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// Page root
// ══════════════════════════════════════════════════════════════════════════════

export default function ProjectFinancePage() {
 return (
 <div className="min-h-screen bg-background text-foreground p-4 sm:p-4 space-y-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-1"
 >
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-md bg-cyan-500/15 border border-cyan-500/30">
 <Building2 size={22} className="text-muted-foreground" />
 </div>
 <div>
 <h1 className="text-2xl font-semibold text-foreground">Project Finance</h1>
 <p className="text-sm text-muted-foreground">
 SPV structure · Non-recourse debt · Infrastructure cash flows · DSCR modeling · Concession agreements
 </p>
 </div>
 </div>
 </motion.div>

 {/* Tabs */}
 <Tabs defaultValue="spv" className="space-y-4">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="spv" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Layers size={14} className="mr-1.5" />
 SPV Structure
 </TabsTrigger>
 <TabsTrigger value="cashflow" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <BarChart3 size={14} className="mr-1.5" />
 Cash Flow Model
 </TabsTrigger>
 <TabsTrigger value="risk" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Shield size={14} className="mr-1.5" />
 Risk Allocation
 </TabsTrigger>
 <TabsTrigger value="metrics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 <Target size={14} className="mr-1.5" />
 Deal Metrics
 </TabsTrigger>
 </TabsList>

 <AnimatePresence mode="wait">
 <TabsContent value="spv" className="data-[state=inactive]:hidden">
 <motion.div
 key="spv"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.25 }}
 >
 <TabSPVStructure />
 </motion.div>
 </TabsContent>

 <TabsContent value="cashflow" className="data-[state=inactive]:hidden">
 <motion.div
 key="cashflow"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.25 }}
 >
 <TabCashFlowModel />
 </motion.div>
 </TabsContent>

 <TabsContent value="risk" className="data-[state=inactive]:hidden">
 <motion.div
 key="risk"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.25 }}
 >
 <TabRiskAllocation />
 </motion.div>
 </TabsContent>

 <TabsContent value="metrics" className="data-[state=inactive]:hidden">
 <motion.div
 key="metrics"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.25 }}
 >
 <TabDealMetrics />
 </motion.div>
 </TabsContent>
 </AnimatePresence>
 </Tabs>
 </div>
 );
}
