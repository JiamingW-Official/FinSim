"use client";

import { useState, useMemo } from "react";
import {
 BarChart3,
 TrendingUp,
 TrendingDown,
 Info,
 ArrowRight,
 Shield,
 Zap,
 Globe,
 Layers,
 BookOpen,
 Activity,
 AlertTriangle,
 CheckCircle,
 Scale,
 Network,
 Eye,
 EyeOff,
 Clock,
 DollarSign,
 RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 127;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate random values to avoid re-seeding issues
const _r: number[] = [];
for (let i = 0; i < 200; i++) _r.push(rand());
let _ri = 0;
const rnd = () => _r[_ri++ % _r.length];

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderType {
 name: string;
 abbr: string;
 definition: string;
 whenToUse: string;
 pros: string[];
 cons: string[];
 risk: "Low" | "Medium" | "High";
}

interface Exchange {
 name: string;
 abbr: string;
 country: string;
 marketCap: string;
 hours: string;
 type: string;
 color: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const US_EXCHANGES = [
 { name: "NYSE", share: 23.4, color: "#3b82f6" },
 { name: "NASDAQ", share: 19.8, color: "#8b5cf6" },
 { name: "CBOE BZX", share: 14.2, color: "#06b6d4" },
 { name: "CBOE EDGX", share: 8.7, color: "#10b981" },
 { name: "IEX", share: 2.3, color: "#f59e0b" },
 { name: "MEMX", share: 4.1, color: "#ef4444" },
 { name: "Nasdaq PSX", share: 3.2, color: "#ec4899" },
 { name: "Dark Pools", share: 13.8, color: "#6b7280" },
 { name: "Internalized", share: 8.4, color: "#9ca3af" },
 { name: "Other ATS", share: 2.1, color: "#d1d5db" },
];

const GLOBAL_EXCHANGES: Exchange[] = [
 { name: "New York Stock Exchange", abbr: "NYSE", country: "USA", marketCap: "$27.2T", hours: "9:30–16:00 ET", type: "Hybrid", color: "#3b82f6" },
 { name: "NASDAQ", abbr: "NASDAQ", country: "USA", marketCap: "$21.4T", hours: "9:30–16:00 ET", type: "Electronic", color: "#8b5cf6" },
 { name: "Shanghai Stock Exchange", abbr: "SSE", country: "China", marketCap: "$7.4T", hours: "9:30–15:00 CST", type: "Electronic", color: "#ef4444" },
 { name: "Tokyo Stock Exchange", abbr: "TSE", country: "Japan", marketCap: "$5.8T", hours: "9:00–15:30 JST", type: "Electronic", color: "#f59e0b" },
 { name: "Euronext", abbr: "ENX", country: "EU", marketCap: "$5.2T", hours: "9:00–17:30 CET", type: "Electronic", color: "#10b981" },
 { name: "London Stock Exchange", abbr: "LSE", country: "UK", marketCap: "$3.8T", hours: "8:00–16:30 GMT", type: "Electronic", color: "#06b6d4" },
 { name: "Hong Kong Stock Exchange", abbr: "HKEX", country: "HK", marketCap: "$3.6T", hours: "9:30–16:00 HKT", type: "Electronic", color: "#ec4899" },
 { name: "Shenzhen Stock Exchange", abbr: "SZSE", country: "China", marketCap: "$3.1T", hours: "9:30–15:00 CST", type: "Electronic", color: "#f97316" },
];

const EXCHANGE_REVENUE = [
 { source: "Transaction Fees", pct: 34, color: "#3b82f6" },
 { source: "Market Data", pct: 29, color: "#8b5cf6" },
 { source: "Listing Fees", pct: 18, color: "#10b981" },
 { source: "Colocation/Tech", pct: 12, color: "#f59e0b" },
 { source: "Index Licensing", pct: 7, color: "#ef4444" },
];

const ORDER_TYPES: OrderType[] = [
 {
 name: "Market Order",
 abbr: "MKT",
 definition: "Buy or sell immediately at the best available price.",
 whenToUse: "When execution certainty is more important than price precision.",
 pros: ["Guaranteed fill", "Immediate execution", "Simple"],
 cons: ["Price uncertainty", "Slippage in illiquid markets"],
 risk: "Medium",
 },
 {
 name: "Limit Order",
 abbr: "LMT",
 definition: "Execute only at a specified price or better.",
 whenToUse: "When price precision matters more than certainty of execution.",
 pros: ["Price control", "No slippage", "Can provide liquidity"],
 cons: ["May not fill", "Partial fills possible"],
 risk: "Low",
 },
 {
 name: "Stop Order",
 abbr: "STP",
 definition: "Becomes a market order once a trigger price is reached.",
 whenToUse: "Stop-loss protection or breakout entry triggers.",
 pros: ["Automates exit strategy", "Limits downside"],
 cons: ["Gap risk", "May fill far from stop price"],
 risk: "Medium",
 },
 {
 name: "Stop-Limit",
 abbr: "STP-LMT",
 definition: "Becomes a limit order once trigger price is hit.",
 whenToUse: "Precise risk management with price floor protection.",
 pros: ["Combines stop + limit", "Avoids gap slippage"],
 cons: ["May not fill if price gaps through limit"],
 risk: "Low",
 },
 {
 name: "Market-on-Close",
 abbr: "MOC",
 definition: "Execute at the official closing price via closing auction.",
 whenToUse: "Index tracking, end-of-day rebalancing.",
 pros: ["Participates in closing auction liquidity", "Official close price"],
 cons: ["No price certainty", "Deadline to enter"],
 risk: "Medium",
 },
 {
 name: "Limit-on-Close",
 abbr: "LOC",
 definition: "Limit order that only executes in the closing auction.",
 whenToUse: "Index funds needing close price with some protection.",
 pros: ["Close price with floor", "Auction participation"],
 cons: ["May not fill if close is above limit"],
 risk: "Low",
 },
 {
 name: "Immediate-or-Cancel",
 abbr: "IOC",
 definition: "Fill as much as possible immediately; cancel the rest.",
 whenToUse: "Fast-moving markets where partial fills are acceptable.",
 pros: ["No resting exposure", "Fast execution"],
 cons: ["Partial fills", "Missed liquidity"],
 risk: "Low",
 },
 {
 name: "Fill-or-Kill",
 abbr: "FOK",
 definition: "Fill entire order immediately or cancel completely.",
 whenToUse: "Large institutional orders needing guaranteed full size.",
 pros: ["All-or-nothing certainty"],
 cons: ["Often fails to fill", "Misses partial liquidity"],
 risk: "Low",
 },
 {
 name: "Hidden Order",
 abbr: "HID",
 definition: "Limit order whose size is not displayed on the order book.",
 whenToUse: "Large orders where revealing size would move the market.",
 pros: ["Minimizes market impact", "Anonymity"],
 cons: ["Lower priority than displayed orders at same price"],
 risk: "Low",
 },
 {
 name: "Iceberg Order",
 abbr: "ICE",
 definition: "Large order with only a small 'tip' displayed; refills as filled.",
 whenToUse: "Large size with liquidity gradual absorption.",
 pros: ["Reduces information leakage", "Maintains queue position"],
 cons: ["Still detectable by algorithms", "Slower execution"],
 risk: "Low",
 },
 {
 name: "TWAP",
 abbr: "TWAP",
 definition: "Time-Weighted Average Price — slice order evenly over time.",
 whenToUse: "Executing large orders without moving market.",
 pros: ["Predictable execution", "Low market impact"],
 cons: ["Telegraphs intent to HFT", "Not optimal in trending markets"],
 risk: "Low",
 },
 {
 name: "VWAP",
 abbr: "VWAP",
 definition: "Volume-Weighted Average Price — execute proportional to market volume.",
 whenToUse: "Benchmark execution, institutional order management.",
 pros: ["Tracks market volume", "Standard benchmark"],
 cons: ["Performance tied to volume prediction accuracy"],
 risk: "Low",
 },
 {
 name: "Peg Order",
 abbr: "PEG",
 definition: "Automatically adjusts price to track the NBBO bid or offer.",
 whenToUse: "Passive execution that stays at top of book.",
 pros: ["Maintains competitive price", "Auto-adjusting"],
 cons: ["Complex interaction with NBBO updates"],
 risk: "Low",
 },
 {
 name: "Snap Order",
 abbr: "SNAP",
 definition: "Pegged to near side of spread, snaps to far side to guarantee fill.",
 whenToUse: "Ensuring execution while starting passively.",
 pros: ["Attempts passive fill first", "Guarantees fill via snap"],
 cons: ["May cross spread if aggressive snap"],
 risk: "Medium",
 },
 {
 name: "Conditional Order",
 abbr: "COND",
 definition: "Order contingent on another security's price or event trigger.",
 whenToUse: "Pairs trades, hedging, strategy automation.",
 pros: ["Automates complex strategies", "Reduces manual monitoring"],
 cons: ["Routing complexity", "Not all venues support"],
 risk: "Medium",
 },
];

const CIRCUIT_BREAKERS = [
 { level: "Level 1", trigger: "7% drop from prior close", halt: "15-minute halt", resumption: "Trading resumes unless after 3:25 PM" },
 { level: "Level 2", trigger: "13% drop from prior close", halt: "15-minute halt", resumption: "Trading resumes unless after 3:25 PM" },
 { level: "Level 3", trigger: "20% drop from prior close", halt: "Remainder of trading day", resumption: "Next trading day" },
];

const LULD_BANDS = [
 { tier: "Tier 1 (S&P 500, Russell 1000)", normal: "5%", open15min: "10%", exNormal: "20%" },
 { tier: "Tier 2 (Other NMS Stocks > $3)", normal: "10%", open15min: "20%", exNormal: "40%" },
 { tier: "Tier 2 (NMS Stocks $0.75–$3)", normal: "20%", open15min: "40%", exNormal: "100%" },
];

const MARKET_QUALITY = [
 { venue: "NYSE", effectiveSpread: 0.028, priceImpact: 0.012, fillRate: 94.2, color: "#3b82f6" },
 { venue: "NASDAQ", effectiveSpread: 0.031, priceImpact: 0.014, fillRate: 92.8, color: "#8b5cf6" },
 { venue: "IEX", effectiveSpread: 0.041, priceImpact: 0.008, fillRate: 88.4, color: "#f59e0b" },
 { venue: "Dark Pool", effectiveSpread: 0.015, priceImpact: 0.004, fillRate: 61.2, color: "#6b7280" },
 { venue: "Wholesale", effectiveSpread: 0.019, priceImpact: 0.006, fillRate: 99.1, color: "#10b981" },
];

const REG_TIMELINE = [
 { year: "2005", event: "Reg NMS adopted", description: "Order protection, access, sub-penny rules" },
 { year: "2007", event: "Reg NMS effective", description: "NBBO protection across all venues required" },
 { year: "2012", event: "JOBS Act", description: "Relaxed IPO rules; emerging growth companies" },
 { year: "2014", event: "IEX launches", description: "Speed bump (350 μs delay) controversy" },
 { year: "2016", event: "Tick Size Pilot", description: "2-year SEC pilot — 5¢ tick for small caps" },
 { year: "2022", event: "CAT goes live", description: "Consolidated Audit Trail tracks all US equity trades" },
 { year: "2024", event: "T+1 settlement", description: "US equities moved from T+2 to T+1" },
 { year: "2024", event: "SEC Market Structure Reform", description: "PFOF ban proposal, order competition rule" },
];

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────
function HorizontalBarChart({
 data,
 valueKey = "share",
 labelKey = "name",
 colorKey = "color",
 unit = "%",
 height = 260,
}: {
 data: Record<string, unknown>[];
 valueKey?: string;
 labelKey?: string;
 colorKey?: string;
 unit?: string;
 height?: number;
}) {
 const maxVal = Math.max(...data.map((d) => d[valueKey] as number));
 const rowH = Math.floor(height / data.length);
 const barH = Math.max(14, rowH - 10);
 const svgH = data.length * rowH + 10;
 const labelW = 110;
 const valW = 52;

 return (
 <svg width="100%" viewBox={`0 0 500 ${svgH}`} className="w-full">
 {data.map((d, i) => {
 const val = d[valueKey] as number;
 const barMaxW = 500 - labelW - valW - 8;
 const barW = (val / maxVal) * barMaxW;
 const y = i * rowH + (rowH - barH) / 2;
 return (
 <g key={i}>
 <text x={labelW - 6} y={i * rowH + rowH / 2 + 4} textAnchor="end" className="fill-muted-foreground text-[11px]" fontSize={11}>
 {d[labelKey] as string}
 </text>
 <rect x={labelW} y={y} width={barW} height={barH} rx={3} fill={d[colorKey] as string} opacity={0.85} />
 <text x={labelW + barW + 6} y={i * rowH + rowH / 2 + 4} className="fill-muted-foreground" fontSize={11}>
 {(val as number).toFixed(1)}{unit}
 </text>
 </g>
 );
 })}
 </svg>
 );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { source: string; pct: number; color: string }[] }) {
 const r = 72;
 const cx = 90;
 const cy = 90;
 const total = data.reduce((a, b) => a + b.pct, 0);
 let cumAngle = -90;
 const slices = data.map((d) => {
 const angle = (d.pct / total) * 360;
 const start = cumAngle;
 cumAngle += angle;
 return { ...d, startAngle: start, endAngle: cumAngle - 0.5 };
 });

 function polarToXY(angle: number, radius: number) {
 const rad = (angle * Math.PI) / 180;
 return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
 }

 function arcPath(startAngle: number, endAngle: number, inner = 44, outer = r) {
 const s = polarToXY(startAngle, outer);
 const e = polarToXY(endAngle, outer);
 const si = polarToXY(startAngle, inner);
 const ei = polarToXY(endAngle, inner);
 const largeArc = endAngle - startAngle > 180 ? 1 : 0;
 return `M ${s.x} ${s.y} A ${outer} ${outer} 0 ${largeArc} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${inner} ${inner} 0 ${largeArc} 0 ${si.x} ${si.y} Z`;
 }

 return (
 <div className="flex items-center gap-3">
 <svg width={180} height={180} viewBox="0 0 180 180">
 {slices.map((s, i) => (
 <path key={i} d={arcPath(s.startAngle, s.endAngle)} fill={s.color} opacity={0.9} />
 ))}
 <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white" fontSize={13} fontWeight="bold">Revenue</text>
 <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>Mix</text>
 </svg>
 <div className="flex flex-col gap-1.5">
 {data.map((d, i) => (
 <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
 <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: d.color }} />
 <span>{d.source}</span>
 <span className="ml-auto font-mono text-foreground pl-3">{d.pct}%</span>
 </div>
 ))}
 </div>
 </div>
 );
}

// ── Infocard ──────────────────────────────────────────────────────────────────
function InfoCard({ title, children, icon: Icon, accent = "#3b82f6" }: {
 title: string;
 children: React.ReactNode;
 icon?: React.ComponentType<{ className?: string; size?: number }>;
 accent?: string;
}) {
 return (
 <div
 className="rounded-md border border-border bg-muted/50 p-4"
 style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
 >
 {Icon && (
 <div className="flex items-center gap-2 mb-3">
 <Icon size={16} className="text-muted-foreground" />
 <span className="text-sm font-semibold text-foreground">{title}</span>
 </div>
 )}
 {!Icon && <div className="text-sm font-semibold text-foreground mb-3">{title}</div>}
 <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">{children}</div>
 </div>
 );
}

// ── Risk Badge ────────────────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" }) {
 const map = { Low: "bg-emerald-900/50 text-emerald-300 border-emerald-700", Medium: "bg-amber-900/50 text-amber-300 border-amber-700", High: "bg-rose-900/50 text-rose-300 border-rose-700" };
 return <span className={cn("text-xs text-muted-foreground px-2 py-0.5 rounded border font-medium", map[risk])}>{risk} Risk</span>;
}

// ── Tab 1: Exchange Landscape ─────────────────────────────────────────────────
function ExchangeLandscapeTab() {
 const [selectedGlobal, setSelectedGlobal] = useState<Exchange | null>(null);

 return (
 <div className="space-y-4">
 {/* Market Share */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
 <BarChart3 size={15} className="text-muted-foreground/50" />
 US Equity Market Share (2024)
 </h3>
 <HorizontalBarChart data={US_EXCHANGES} height={280} />
 </div>

 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
 <DollarSign size={15} className="text-muted-foreground/50" />
 Exchange Revenue Model
 </h3>
 <DonutChart data={EXCHANGE_REVENUE} />
 <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
 <p><span className="text-muted-foreground font-medium">Transaction Fees:</span> Per-share or per-order fees; maker-taker or taker-maker rebate models.</p>
 <p><span className="text-muted-foreground font-medium">Market Data:</span> Fastest-growing segment — SIPs, proprietary feeds, depth-of-book.</p>
 <p><span className="text-muted-foreground font-medium">Listing Fees:</span> Annual and one-time fees from listed companies.</p>
 </div>
 </div>
 </div>

 {/* Exchange Types */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
 {[
 {
 title: "Lit Markets",
 icon: Eye,
 color: "#3b82f6",
 desc: "Orders displayed on public order book. Price transparency, Reg NMS protected. NYSE, NASDAQ, CBOE — price-time priority. All bids/asks visible to participants.",
 examples: "NYSE, NASDAQ, CBOE BZX, IEX",
 },
 {
 title: "Dark Pools",
 icon: EyeOff,
 color: "#6b7280",
 desc: "Anonymous venues where orders are hidden. Ideal for large institutional blocks. No pre-trade transparency — reduces market impact for large orders.",
 examples: "Liquidnet, IEX Dark, Goldman Sigma X",
 },
 {
 title: "ATS (Alt Trading Systems)",
 icon: Network,
 color: "#10b981",
 desc: "Broker-operated trading venues that must register with FINRA. Must report volume. Cannot display quotes to public like exchanges.",
 examples: "Instinet, Luminex, ITG POSIT",
 },
 {
 title: "Internalization",
 icon: RefreshCw,
 color: "#f59e0b",
 desc: "Broker fills retail order against own inventory or wholesaler. PFOF model — Robinhood sends orders to Citadel/Virtu for execution. Controversial.",
 examples: "Citadel Securities, Virtu, Two Sigma",
 },
 ].map((t, i) => (
 <div
 key={i}
 className="rounded-md border border-border bg-muted/50 p-4"
 style={{ borderTopColor: t.color, borderTopWidth: 2 }}
 >
 <div className="flex items-center gap-2 mb-2">
 <t.icon size={14} style={{ color: t.color }} />
 <span className="text-sm font-medium text-foreground">{t.title}</span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed mb-2">{t.desc}</p>
 <div className="text-xs text-muted-foreground font-medium">{t.examples}</div>
 </div>
 ))}
 </div>

 {/* NYSE vs NASDAQ */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4">NYSE vs NASDAQ: Structural Differences</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Dimension</th>
 <th className="text-left py-2 pr-4 text-primary font-medium">NYSE</th>
 <th className="text-left py-2 text-primary font-medium">NASDAQ</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40">
 {[
 ["Model", "Hybrid (floor + electronic)", "Fully electronic"],
 ["Market Makers", "Designated Market Makers (DMMs)", "Market Makers (MMs) — no designation"],
 ["DMM Role", "Assigned one stock; maintain fair/orderly markets", "No single designated MM per stock"],
 ["Listing Standards", "Stricter: $40M revenue, $400M mkt cap", "More flexible: $1M net income or $750M rev"],
 ["Auction Mechanism", "Opening/closing auction with DMM facilitation", "Electronic auction, no floor involvement"],
 ["Price Discovery", "DMM can delay open to clear imbalance", "Purely algorithmic price discovery"],
 ["Order Types", "More floor-specific order types", "Standard electronic order types"],
 ["Typical Listings", "Large-cap, blue chip, industrials, financials", "Tech, biotech, growth companies"],
 ].map(([dim, nyse, nsdq], i) => (
 <tr key={i} className="hover:bg-muted/20">
 <td className="py-2 pr-4 text-muted-foreground font-medium">{dim}</td>
 <td className="py-2 pr-4 text-muted-foreground">{nyse}</td>
 <td className="py-2 text-muted-foreground">{nsdq}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Global Exchanges */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
 <Globe size={15} className="text-muted-foreground" />
 Global Exchanges by Market Cap
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
 {GLOBAL_EXCHANGES.map((ex, i) => (
 <div
 key={i}
 onClick={() => setSelectedGlobal(selectedGlobal?.abbr === ex.abbr ? null : ex)}
 className={cn("rounded-lg border p-3 cursor-pointer transition-colors", selectedGlobal?.abbr === ex.abbr ? "border-primary bg-muted/40" : "border-border hover:border-border bg-card/40")}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs font-semibold text-foreground">{ex.abbr}</span>
 <Badge variant="outline" className="text-xs px-1.5 py-0 border-border text-muted-foreground">{ex.country}</Badge>
 </div>
 <div className="text-lg font-semibold" style={{ color: ex.color }}>{ex.marketCap}</div>
 <div className="text-xs text-muted-foreground mt-1">{ex.hours}</div>
 </div>
 ))}
 </div>
 
 {selectedGlobal && (
 <div
 className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground"
 >
 <div className="font-medium text-foreground mb-1">{selectedGlobal.name}</div>
 <div className="grid grid-cols-3 gap-4 text-muted-foreground">
 <div><span className="text-muted-foreground">Type:</span> {selectedGlobal.type}</div>
 <div><span className="text-muted-foreground">Market Cap:</span> {selectedGlobal.marketCap}</div>
 <div><span className="text-muted-foreground">Hours:</span> {selectedGlobal.hours}</div>
 </div>
 </div>
 )}
 
 </div>

 {/* Exchange Competition */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Fee Competition",
 icon: DollarSign,
 accent: "#10b981",
 content: [
 "Maker-taker: exchanges pay rebates to liquidity providers, charge takers",
 "Taker-maker (inverted): IEX model — charge makers, rebate takers",
 "Exchange fee wars compress margins to fractions of a penny per share",
 "NYSE Group: ~$0.0030/share take, $0.0020/share make rebate",
 ],
 },
 {
 title: "Latency Competition",
 icon: Zap,
 accent: "#f59e0b",
 content: [
 "Colocation: HFT firms pay to place servers in exchange data centers",
 "Proximity services generate significant exchange revenue",
 "IEX speed bump: 350-microsecond delay to deter HFT latency arbitrage",
 "Fiber vs microwave vs laser — sub-millisecond routing between NYSE and CME",
 ],
 },
 {
 title: "Order Type Innovation",
 icon: Layers,
 accent: "#8b5cf6",
 content: [
 "Exchanges compete by creating proprietary order types favored by HFT",
 "'Hide-and-slide' orders — complex instructions that benefit certain participants",
 "SEC has scrutinized complex order types as potentially unfair",
 "IEX D-Peg: midpoint peg that fades during quote instability",
 ],
 },
 ].map((card, i) => (
 <InfoCard key={i} title={card.title} icon={card.icon} accent={card.accent}>
 <ul className="space-y-1.5">
 {card.content.map((c, j) => (
 <li key={j} className="flex gap-1.5">
 <span className="text-muted-foreground mt-0.5">•</span>
 {c}
 </li>
 ))}
 </ul>
 </InfoCard>
 ))}
 </div>
 </div>
 );
}

// ── Tab 2: Order Types ─────────────────────────────────────────────────────────
function OrderTypesTab() {
 const [selected, setSelected] = useState<OrderType | null>(ORDER_TYPES[0]);
 const [filter, setFilter] = useState<"All" | "Low" | "Medium" | "High">("All");

 const filtered = useMemo(() => filter === "All" ? ORDER_TYPES : ORDER_TYPES.filter((o) => o.risk === filter), [filter]);

 return (
 <div className="space-y-4">
 {/* Order type grid */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
 <h3 className="text-sm font-medium text-foreground">15 Order Types</h3>
 <div className="flex gap-2">
 {(["All", "Low", "Medium", "High"] as const).map((f) => (
 <button
 key={f}
 onClick={() => setFilter(f)}
 className={cn("text-xs px-3 py-1 rounded-md border transition-colors", filter === f ? "bg-primary border-primary text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground")}
 >
 {f}
 </button>
 ))}
 </div>
 </div>
 <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
 {filtered.map((o, i) => (
 <button
 key={o.abbr}
 onClick={() => setSelected(selected?.abbr === o.abbr ? null : o)}
 className={cn(
 "rounded-lg border p-2.5 text-left transition-colors",
 selected?.abbr === o.abbr ? "border-primary bg-muted/40" : "border-border hover:border-border bg-card/40"
 )}
 >
 <div className="text-xs font-medium text-foreground mb-0.5">{o.abbr}</div>
 <div className="text-xs text-muted-foreground leading-tight">{o.name}</div>
 </button>
 ))}
 </div>
 </div>

 {/* Detail panel */}
 
 {selected && (
 <div
 key={selected.abbr}
 className="rounded-md border border-border bg-muted/50 p-5"
 >
 <div className="flex items-start justify-between mb-3">
 <div>
 <div className="text-base font-medium text-foreground">{selected.name}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{selected.definition}</div>
 </div>
 <RiskBadge risk={selected.risk} />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
 <div className="bg-card/40 rounded-lg p-3">
 <div className="text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" />When to Use</div>
 <p className="text-muted-foreground">{selected.whenToUse}</p>
 </div>
 <div className="bg-card/40 rounded-lg p-3">
 <div className="text-emerald-400 font-medium mb-1.5">Pros</div>
 <ul className="space-y-1 text-muted-foreground">
 {selected.pros.map((p, i) => <li key={i}>+ {p}</li>)}
 </ul>
 </div>
 <div className="bg-card/40 rounded-lg p-3">
 <div className="text-rose-400 font-medium mb-1.5">Cons</div>
 <ul className="space-y-1 text-muted-foreground">
 {selected.cons.map((c, i) => <li key={i}>− {c}</li>)}
 </ul>
 </div>
 </div>
 </div>
 )}
 

 {/* Order Book Mechanics */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4">Order Book: Price-Time Priority</h3>
 <div className="space-y-1 text-xs text-muted-foreground mb-3">
 {/* Simplified order book visual */}
 <div className="grid grid-cols-3 text-muted-foreground text-xs font-medium border-b border-border pb-1 mb-2">
 <span>Size</span><span className="text-center">Price</span><span className="text-right">Side</span>
 </div>
 {[
 { size: "200", price: "182.15", side: "Ask", color: "text-rose-400" },
 { size: "500", price: "182.10", side: "Ask", color: "text-rose-400" },
 { size: "1200", price: "182.05", side: "Ask", color: "text-rose-400" },
 { size: "800", price: "182.00", side: "Ask", color: "text-rose-400" },
 ].map((row, i) => (
 <div key={i} className="grid grid-cols-3 text-xs text-muted-foreground py-0.5">
 <span className="text-muted-foreground">{row.size}</span>
 <span className={cn("text-center font-mono font-medium", row.color)}>${row.price}</span>
 <span className={cn("text-right", row.color)}>{row.side}</span>
 </div>
 ))}
 <div className="grid grid-cols-3 text-xs text-muted-foreground py-1 bg-muted/30 rounded px-1">
 <span className="text-muted-foreground">Spread</span>
 <span className="text-center text-amber-300 font-mono font-medium">$0.05</span>
 <span></span>
 </div>
 {[
 { size: "900", price: "181.95", side: "Bid", color: "text-emerald-400" },
 { size: "600", price: "181.90", side: "Bid", color: "text-emerald-400" },
 { size: "1500", price: "181.85", side: "Bid", color: "text-emerald-400" },
 { size: "300", price: "181.80", side: "Bid", color: "text-emerald-400" },
 ].map((row, i) => (
 <div key={i} className="grid grid-cols-3 text-xs text-muted-foreground py-0.5">
 <span className="text-muted-foreground">{row.size}</span>
 <span className={cn("text-center font-mono font-medium", row.color)}>${row.price}</span>
 <span className={cn("text-right", row.color)}>{row.side}</span>
 </div>
 ))}
 </div>
 <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
 <p><span className="text-muted-foreground">Price Priority:</span> Best price always executes first.</p>
 <p><span className="text-muted-foreground">Time Priority:</span> At same price, earliest order executes first.</p>
 <p><span className="text-muted-foreground">Pro-rata:</span> Some markets allocate fills proportionally by size.</p>
 </div>
 </div>

 <div className="space-y-4">
 <InfoCard title="Order Routing: How Brokers Decide" icon={Network} accent="#8b5cf6">
 <ul className="space-y-1.5">
 <li><span className="text-muted-foreground">1. Internalization check</span> — can wholesaler fill at NBBO?</li>
 <li><span className="text-muted-foreground">2. Dark pool sweep</span> — check for block liquidity at mid</li>
 <li><span className="text-muted-foreground">3. Smart order routing (SOR)</span> — scan lit venues for best price</li>
 <li><span className="text-muted-foreground">4. Reg NMS compliance</span> — must trade-through NBBO protected quotes</li>
 <li><span className="text-muted-foreground">5. Venue selection</span> — latency, fill rate, rebate optimization</li>
 </ul>
 </InfoCard>

 <InfoCard title="PFOF: Payment for Order Flow" icon={DollarSign} accent="#ef4444">
 <ul className="space-y-1.5">
 <li><span className="text-muted-foreground">Model:</span> Brokers (Robinhood) receive payment from wholesalers (Citadel) for routing retail orders.</li>
 <li><span className="text-muted-foreground">Revenue:</span> Citadel earned ~$6.7B from market making in 2020 (COVID volatility).</li>
 <li><span className="text-muted-foreground">Controversy:</span> Critics argue retail gets suboptimal prices; proponents say spreads are tight.</li>
 <li><span className="text-muted-foreground">2024 Reform:</span> SEC proposed eliminating PFOF for exchange-listed equities.</li>
 <li><span className="text-muted-foreground">EU/Canada:</span> Already banned — UK phased out in 2012.</li>
 </ul>
 </InfoCard>

 <InfoCard title="Reg NMS: Best Execution" icon={Scale} accent="#10b981">
 <ul className="space-y-1.5">
 <li><span className="text-muted-foreground">Order Protection Rule:</span> Cannot trade-through a protected quote at another venue.</li>
 <li><span className="text-muted-foreground">Access Rule:</span> Fair access to protected quotes; max $0.003/share fee.</li>
 <li><span className="text-muted-foreground">Sub-penny Rule:</span> No quoting in sub-penny increments for stocks over $1.</li>
 <li><span className="text-muted-foreground">Market Data Rules:</span> SIPS must disseminate consolidated best bid/offer.</li>
 </ul>
 </InfoCard>
 </div>
 </div>
 </div>
 );
}

// ── Tab 3: Price Discovery ─────────────────────────────────────────────────────
function PriceDiscoveryTab() {
 // Simulated opening auction imbalance chart
 const auctionData = useMemo(() => {
 const times = ["9:25", "9:26", "9:27", "9:28", "9:29", "9:30"];
 return times.map((t, i) => ({
 time: t,
 indicative: 180 + (rnd() - 0.5) * 4,
 imbalance: (rnd() - 0.5) * 500000,
 }));
 }, []);

 return (
 <div className="space-y-4">
 {/* Pre/Post market + auctions */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <InfoCard title="Pre-Market Trading (4–9:30 AM ET)" icon={Clock} accent="#f59e0b">
 <ul className="space-y-1.5">
 <li>Executed on ECNs (INET, Arca, EDGX) — not exchange floor</li>
 <li>Lower liquidity: spreads 3–10x wider than regular session</li>
 <li>Institutional and news-driven activity (earnings, macro)</li>
 <li>Most retail brokers allow pre-market from 4:00 AM</li>
 <li>Volume: ~3–5% of daily volume on average days</li>
 </ul>
 </InfoCard>
 <InfoCard title="Regular Session (9:30 AM–4:00 PM)" icon={Activity} accent="#3b82f6">
 <ul className="space-y-1.5">
 <li>Opening auction determines official open price</li>
 <li>First 30 and last 30 minutes: highest volume periods (U-shape)</li>
 <li>NBBO protection in full effect across all venues</li>
 <li>Continuous double auction — orders match in real time</li>
 <li>Circuit breakers active; LULD bands enforced</li>
 </ul>
 </InfoCard>
 <InfoCard title="After-Hours (4:00–8:00 PM ET)" icon={Clock} accent="#8b5cf6">
 <ul className="space-y-1.5">
 <li>Same ECN infrastructure as pre-market</li>
 <li>Critical for earnings releases (most companies report AH)</li>
 <li>No NBBO protection — venues operate independently</li>
 <li>Slippage risk highest: 1,000-share orders can move price 1%+</li>
 <li>Market orders not recommended; use limit orders</li>
 </ul>
 </InfoCard>
 </div>

 {/* Opening auction */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-1">Opening Auction Mechanics</h3>
 <p className="text-xs text-muted-foreground mb-4">NYSE/NASDAQ calculate an indicative match price in the minutes before 9:30 AM. Largest imbalance side triggers DMM facilitation.</p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 {
 step: "1",
 title: "Order Accumulation",
 desc: "Market-on-Open (MOO) and Limit-on-Open (LOO) orders queue from previous night. No executions yet.",
 color: "#3b82f6",
 },
 {
 step: "2",
 title: "Indicative Price Publication",
 desc: "Exchange publishes indicative match price and imbalance direction every 15 seconds starting 9:28 AM. Market can respond.",
 color: "#f59e0b",
 },
 {
 step: "3",
 title: "Auction Execution at 9:30",
 desc: "At 9:30:00 exactly, exchange calculates maximized match volume. DMM may facilitate by trading against imbalance from own inventory.",
 color: "#10b981",
 },
 ].map((s, i) => (
 <div
 key={i}
 className="rounded-lg bg-card/50 border border-border p-4"
 >
 <div className="flex items-center gap-2 mb-2">
 <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-foreground" style={{ background: s.color }}>
 {s.step}
 </div>
 <span className="text-xs font-medium text-foreground">{s.title}</span>
 </div>
 <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
 </div>
 ))}
 </div>

 {/* Indicative open SVG */}
 <div className="mt-4">
 <div className="text-xs text-muted-foreground mb-2">Indicative Open Price — Final 5 Minutes Before Open</div>
 <svg width="100%" viewBox="0 0 520 80" className="w-full">
 {auctionData.map((d, i) => {
 const x = 40 + i * 80;
 const minP = Math.min(...auctionData.map((a) => a.indicative));
 const maxP = Math.max(...auctionData.map((a) => a.indicative));
 const range = maxP - minP || 1;
 const y = 10 + (1 - (d.indicative - minP) / range) * 55;
 return (
 <g key={i}>
 {i > 0 && (() => {
 const prev = auctionData[i - 1];
 const px = 40 + (i - 1) * 80;
 const py = 10 + (1 - (prev.indicative - minP) / range) * 55;
 return <line x1={px} y1={py} x2={x} y2={y} stroke="#3b82f6" strokeWidth={2} />;
 })()}
 <circle cx={x} cy={y} r={i === auctionData.length - 1 ? 6 : 4} fill={i === auctionData.length - 1 ? "#f59e0b" : "#3b82f6"} />
 <text x={x} y={72} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>{d.time}</text>
 <text x={x} y={y - 8} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>${d.indicative.toFixed(2)}</text>
 </g>
 );
 })}
 <text x={10} y={15} className="fill-muted-foreground" fontSize={9} textAnchor="middle" transform="rotate(-90, 10, 40)">Price</text>
 </svg>
 </div>
 </div>

 {/* Closing auction */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-3">Closing Auction — Most Important Price of the Day</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-3 text-xs text-muted-foreground">
 <p>The closing price determines index values, ETF NAVs, margin calculations, derivatives settlements, and portfolio benchmarks. <span className="text-muted-foreground">30–40% of total daily volume</span> trades in the closing auction on S&P 500 stocks.</p>
 <div className="bg-card/50 rounded-lg p-3 space-y-1.5">
 <div className="text-muted-foreground font-medium">Closing Auction Timeline (NYSE/NASDAQ)</div>
 <div className="flex gap-2"><span className="text-amber-400 font-mono w-14">3:45 PM</span><span>MOC order entry opens; imbalance published</span></div>
 <div className="flex gap-2"><span className="text-amber-400 font-mono w-14">3:50 PM</span><span>LOC order entry opens</span></div>
 <div className="flex gap-2"><span className="text-amber-400 font-mono w-14">3:58 PM</span><span>Offset period begins — opposite-side orders can offset imbalance</span></div>
 <div className="flex gap-2"><span className="text-amber-400 font-mono w-14">4:00 PM</span><span>Auction executes; official close price determined</span></div>
 </div>
 </div>
 <div className="space-y-3">
 <InfoCard title="Why Closing Auction Matters" accent="#8b5cf6">
 <ul className="space-y-1">
 <li>Index funds must buy/sell at close to track benchmarks accurately</li>
 <li>Quarterly rebalance days (especially index additions/deletions) see enormous volume</li>
 <li>Options expiration: pinning effect near round numbers near close</li>
 <li>ETF creation/redemption uses closing price for NAV calculation</li>
 </ul>
 </InfoCard>
 </div>
 </div>
 </div>

 {/* Index rebalancing + ETF + circuit breakers */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <InfoCard title="Index Rebalancing" icon={RefreshCw} accent="#10b981">
 <ul className="space-y-1.5">
 <li><span className="text-muted-foreground">S&P 500:</span> Quarterly; additions/deletions announced 1 week in advance</li>
 <li><span className="text-muted-foreground">Arbitrage:</span> Predictable index fund flows create front-running opportunity</li>
 <li><span className="text-muted-foreground">Russell:</span> Annual reconstitution in June — largest single-day rebalance event</li>
 <li><span className="text-muted-foreground">Impact:</span> Added stocks often rise 3–8%; removed stocks decline</li>
 </ul>
 </InfoCard>
 <InfoCard title="ETF Creation/Redemption" icon={Layers} accent="#f59e0b">
 <ul className="space-y-1.5">
 <li><span className="text-muted-foreground">APs</span> (BlackRock, Vanguard, Citadel) create/redeem 50,000-share blocks</li>
 <li><span className="text-muted-foreground">Creation:</span> Deliver basket of underlying stocks → receive ETF shares</li>
 <li><span className="text-muted-foreground">Redemption:</span> Return ETF shares → receive underlying basket</li>
 <li><span className="text-muted-foreground">Arbitrage:</span> This mechanism keeps ETF price within ~1bp of NAV</li>
 <li><span className="text-muted-foreground">Implied liquidity:</span> ETF can be more liquid than its underlying basket</li>
 </ul>
 </InfoCard>
 <div className="rounded-md border border-border bg-muted/50 p-4">
 <div className="flex items-center gap-2 mb-3">
 <AlertTriangle size={14} className="text-rose-400" />
 <span className="text-sm font-medium text-foreground">Circuit Breakers</span>
 </div>
 <div className="space-y-2">
 {CIRCUIT_BREAKERS.map((cb, i) => (
 <div key={i} className="text-xs text-muted-foreground bg-card/50 rounded-lg p-2.5 border border-border">
 <div className="flex items-center justify-between mb-1">
 <span className="text-muted-foreground font-medium">{cb.level}</span>
 <span className={cn("text-xs font-mono", i === 2 ? "text-rose-400" : i === 1 ? "text-amber-400" : "text-yellow-400")}>{cb.trigger}</span>
 </div>
 <div className="text-muted-foreground">{cb.halt} — {cb.resumption}</div>
 </div>
 ))}
 <div className="mt-2 text-xs text-muted-foreground">
 <div className="font-medium text-muted-foreground mb-1">LULD Bands (Limit Up-Limit Down)</div>
 {LULD_BANDS.map((l, i) => (
 <div key={i} className="flex justify-between py-0.5 border-b border-border">
 <span className="truncate pr-2">{l.tier.split("(")[0]}</span>
 <span className="text-amber-400">{l.normal}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

// ── Tab 4: Fragmentation & Liquidity ──────────────────────────────────────────
function FragmentationTab() {
 // Fragmentation donut
 const fragmentData = [
 { source: "NYSE Group", pct: 26, color: "#3b82f6" },
 { source: "NASDAQ Group", pct: 23, color: "#8b5cf6" },
 { source: "CBOE Group", pct: 22, color: "#06b6d4" },
 { source: "Dark Pools", pct: 14, color: "#6b7280" },
 { source: "Wholesalers", pct: 8, color: "#10b981" },
 { source: "Other ATS/ECN", pct: 7, color: "#f59e0b" },
 ];

 return (
 <div className="space-y-4">
 {/* Overview */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
 <Network size={14} className="text-muted-foreground" />
 US Equity Fragmentation (2024)
 </h3>
 <DonutChart data={fragmentData} />
 <div className="mt-4 text-xs text-muted-foreground space-y-1">
 <p>US equities now trade across <span className="text-muted-foreground font-medium">60+ distinct venues</span> — 16 registered exchanges, ~30 dark pools, and ~15 other ATS.</p>
 <p>The US is the most fragmented equity market in the world. European markets consolidated under MiFID II.</p>
 </div>
 </div>

 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
 <BarChart3 size={14} className="text-green-400" />
 Market Quality Metrics by Venue
 </h3>
 <div className="space-y-3">
 <div className="grid grid-cols-4 text-xs text-muted-foreground font-medium border-b border-border pb-1">
 <span>Venue</span>
 <span className="text-center">Eff. Spread</span>
 <span className="text-center">Price Impact</span>
 <span className="text-right">Fill Rate</span>
 </div>
 {MARKET_QUALITY.map((v, i) => (
 <div
 key={i}
 className="grid grid-cols-4 text-xs text-muted-foreground items-center"
 >
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: v.color }} />
 <span className="text-muted-foreground">{v.venue}</span>
 </div>
 <div className="text-center font-mono text-muted-foreground">${v.effectiveSpread.toFixed(3)}</div>
 <div className="text-center font-mono text-muted-foreground">${v.priceImpact.toFixed(3)}</div>
 <div className="text-right">
 <span className={cn("font-mono", v.fillRate >= 90 ? "text-emerald-400" : v.fillRate >= 70 ? "text-amber-400" : "text-rose-400")}>
 {v.fillRate.toFixed(1)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
 <div className="bg-card/40 rounded p-2"><span className="text-muted-foreground font-medium">Eff. Spread</span><br />Actual cost relative to midpoint</div>
 <div className="bg-card/40 rounded p-2"><span className="text-muted-foreground font-medium">Price Impact</span><br />Market move after execution</div>
 <div className="bg-card/40 rounded p-2"><span className="text-muted-foreground font-medium">Fill Rate</span><br />% of orders fully executed</div>
 </div>
 </div>
 </div>

 {/* NBBO + SOR */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="NBBO: National Best Bid & Offer" icon={Scale} accent="#3b82f6">
 <ul className="space-y-1.5">
 <li><span className="text-muted-foreground">Definition:</span> Best displayed bid and offer across all protected exchanges, calculated by SIPs in real time.</li>
 <li><span className="text-muted-foreground">SIPs:</span> Securities Information Processors (CT Plan, UTP Plan) aggregate and disseminate quotes.</li>
 <li><span className="text-muted-foreground">Protection:</span> Reg NMS requires orders to be filled at NBBO or better — no trade-through allowed.</li>
 <li><span className="text-muted-foreground">Limitation:</span> NBBO only captures top-of-book; depth not protected. Dark pools not included.</li>
 <li><span className="text-muted-foreground">Latency:</span> SIP quotes arrive ~1ms after direct feeds — HFT exploits this gap.</li>
 </ul>
 </InfoCard>
 <InfoCard title="Smart Order Routing (SOR)" icon={Zap} accent="#f59e0b">
 <ul className="space-y-1.5">
 <li><span className="text-muted-foreground">Function:</span> Algorithms route order slices across venues to minimize execution cost.</li>
 <li><span className="text-muted-foreground">Logic:</span> Compare venue liquidity, fee structure, historical fill rates, current order book depth.</li>
 <li><span className="text-muted-foreground">Speed:</span> SOR decisions made in microseconds; re-route if venue depleted.</li>
 <li><span className="text-muted-foreground">Dark first:</span> Most SOR algorithms check dark pools for price improvement before lit venues.</li>
 <li><span className="text-muted-foreground">Adaptive:</span> Machine learning models continuously optimize routing based on market conditions.</li>
 </ul>
 </InfoCard>
 </div>

 {/* Dark pools */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
 <EyeOff size={14} className="text-muted-foreground" />
 Dark Pools: Anatomy and Use Cases
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Why Institutions Use Dark Pools",
 items: [
 "Large block orders (50,000+ shares) would move the market if shown publicly",
 "Information leakage: rivals can front-run large displayed orders",
 "Mid-point execution: often better than NBBO by 50% of spread",
 "Reduce market impact cost by 40–60% vs lit venue block trades",
 ],
 },
 {
 title: "Types of Dark Pools",
 items: [
 "Broker-dealer (Goldman Sigma X, MS MS Pool): match own client flow",
 "Independent (Liquidnet, ITG): buy-side only, no HFT allowed",
 "Exchange-sponsored (NYSE Arca Dark, NASDAQ Dark): exchange-operated",
 "Consortium (BIDS): multiple broker routing to single venue",
 ],
 },
 {
 title: "Risks and Controversies",
 items: [
 "Information leakage: trading against dark pool operators with prop desks",
 "Internalization: wholesalers may not provide true price improvement",
 "'Dark pool abuse': SEC fined Barclays LX $70M for misleading clients",
 "Fragmentation harms price discovery: lit markets get smaller NBBO liquidity",
 ],
 },
 ].map((col, i) => (
 <div key={i} className="bg-card/40 rounded-lg p-4">
 <div className="text-xs font-medium text-muted-foreground mb-2">{col.title}</div>
 <ul className="space-y-1.5 text-[11px] text-muted-foreground">
 {col.items.map((item, j) => (
 <li key={j} className="flex gap-1.5">
 <span className="text-muted-foreground mt-0.5 flex-shrink-0">•</span>
 {item}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>

 {/* Retail liquidity */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4">Retail Liquidity: Wholesalers vs Exchange Execution</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="bg-card/40 rounded-lg p-4 text-xs text-muted-foreground">
 <div className="text-emerald-400 font-medium mb-2">Wholesaler Model (Citadel, Virtu, Two Sigma)</div>
 <ul className="space-y-1.5 text-muted-foreground">
 <li>Receive order flow from brokers via PFOF arrangements</li>
 <li>Fill retail orders from own inventory at NBBO or better</li>
 <li>Profit: capture spread between inventory cost and execution price</li>
 <li>Price improvement: retailers often get ~$0.001–0.002/share better than NBBO</li>
 <li>Citadel Securities: executes ~28% of all US equity volume</li>
 </ul>
 </div>
 <div className="bg-card/40 rounded-lg p-4 text-xs text-muted-foreground">
 <div className="text-primary font-medium mb-2">Exchange Execution (Fidelity, Interactive Brokers)</div>
 <ul className="space-y-1.5 text-muted-foreground">
 <li>Orders sent directly to exchanges — compete with all market participants</li>
 <li>Potential for better price discovery in volatile conditions</li>
 <li>No PFOF: broker's incentive aligned with best execution</li>
 <li>IBKR SmartRouting: proprietary SOR that seeks price improvement</li>
 <li>Studies show exchange-routed orders can see better fills in fast markets</li>
 </ul>
 </div>
 </div>
 </div>
 </div>
 );
}

// ── Tab 5: Regulation ─────────────────────────────────────────────────────────
function RegulationTab() {
 return (
 <div className="space-y-4">
 {/* Timeline */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
 <BookOpen size={14} className="text-muted-foreground" />
 US Market Structure Regulatory Timeline
 </h3>
 <div className="relative">
 <div className="absolute left-10 top-0 bottom-0 w-px bg-muted" />
 <div className="space-y-4">
 {REG_TIMELINE.map((item, i) => (
 <div
 key={i}
 className="flex gap-4 items-start"
 >
 <div className="w-20 flex-shrink-0 text-right">
 <span className="text-xs font-mono font-medium text-primary">{item.year}</span>
 </div>
 <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0 mt-0.5 relative z-10" />
 <div className="pb-2">
 <div className="text-xs font-medium text-foreground">{item.event}</div>
 <div className="text-[11px] text-muted-foreground mt-0.5">{item.description}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Key regulations */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {[
 {
 title: "Reg NMS (2005/2007)",
 accent: "#3b82f6",
 icon: Scale,
 content: [
 { label: "Order Protection Rule", desc: "Trading centers must route to the venue displaying the best price — prevents 'trading through' a better quote." },
 { label: "Access Rule", desc: "Automated quotes must be accessible; maximum fee of $0.003/share for accessing a protected quote." },
 { label: "Sub-Penny Rule", desc: "Cannot quote in increments less than $0.01 for stocks priced over $1 — prevents gaming queue position." },
 { label: "Market Data Rules", desc: "Consolidated SIPs must disseminate best bid/offer to all participants on equal terms." },
 ],
 },
 {
 title: "T+1 Settlement (May 2024)",
 accent: "#10b981",
 icon: Clock,
 content: [
 { label: "Change", desc: "US equities, ETFs, corporate/muni bonds moved from T+2 to T+1 settlement. Canada moved simultaneously." },
 { label: "Impact on Brokers", desc: "Shorter settlement reduces counterparty risk and capital requirements for clearing houses like DTCC." },
 { label: "Operational Challenges", desc: "Compressed trade affirmation timeline — confirmation, allocation, and affirmation must complete same day." },
 { label: "International Mismatch", desc: "European markets still on T+2 — creates FX settlement mismatch for cross-border trades." },
 ],
 },
 {
 title: "Consolidated Audit Trail (CAT)",
 accent: "#8b5cf6",
 icon: Activity,
 content: [
 { label: "Purpose", desc: "Comprehensive tracking of all orders and executions across all US equity and options markets." },
 { label: "Scale", desc: "58+ billion records per day — largest financial database ever built. Managed by FINRA." },
 { label: "Participants", desc: "All broker-dealers must report all orders, routes, modifications, cancellations, and executions." },
 { label: "Surveillance", desc: "Enables SEC/FINRA to reconstruct any trade event and detect manipulation, layering, spoofing." },
 ],
 },
 {
 title: "2023-2024 SEC Reform Proposals",
 accent: "#ef4444",
 icon: AlertTriangle,
 content: [
 { label: "Order Competition Rule", desc: "Require retail orders to be exposed to competition before internalization — meaningful price improvement required." },
 { label: "PFOF Ban Proposal", desc: "Proposed elimination of payment for order flow for NMS securities — still pending finalization." },
 { label: "Tick Size Rules", desc: "Variable tick sizes: smaller ticks for liquid stocks, larger for illiquid — improve market quality." },
 { label: "Best Execution Rule", desc: "Updated best execution obligations — brokers must consider more execution quality factors." },
 ],
 },
 ].map((reg, i) => (
 <div
 key={i}
 className="rounded-md border border-border bg-muted/50 p-5"
 style={{ borderTopColor: reg.accent, borderTopWidth: 2 }}
 >
 <div className="flex items-center gap-2 mb-4">
 <reg.icon size={15} style={{ color: reg.accent }} />
 <span className="text-sm font-medium text-foreground">{reg.title}</span>
 </div>
 <div className="space-y-3">
 {reg.content.map((item, j) => (
 <div key={j} className="text-xs text-muted-foreground">
 <span className="text-muted-foreground font-medium">{item.label}: </span>
 <span className="text-muted-foreground">{item.desc}</span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 {/* Tick size pilot */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-3">Tick Size Pilot (2016–2018) & Ongoing Debates</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
 <div className="space-y-2">
 <div className="text-muted-foreground font-medium">What Was Tested</div>
 <p>The SEC ran a 2-year pilot widening tick sizes to $0.05 for ~1,200 small-cap stocks (less than $3B market cap). The goal: improve market quality and increase analyst coverage of small companies.</p>
 <div className="text-muted-foreground font-medium mt-3">Results Were Mixed</div>
 <ul className="space-y-1">
 <li>+ Increased market depth at top of book</li>
 <li>+ Modest improvement in analyst coverage</li>
 <li>− Transaction costs increased for retail investors</li>
 <li>− No meaningful improvement in IPO activity or capital formation</li>
 </ul>
 </div>
 <div className="space-y-2">
 <div className="text-muted-foreground font-medium">International Comparison</div>
 <div className="space-y-2">
 {[
 { region: "EU (MiFID II)", desc: "Dark pool volume caps (4% per venue, 8% system-wide). More restrictive than US." },
 { region: "UK", desc: "Post-Brexit: exploring divergence from MiFID II. FCA reviewing market structure." },
 { region: "Japan (JPX)", desc: "Tokyo PRO Market for sophisticated investors. Arrowhead system upgrade: <1ms latency." },
 { region: "Canada", desc: "T+1 aligned with US. Investment Industry Regulatory Organization (CIRO) oversight." },
 ].map((r, i) => (
 <div key={i} className="bg-card/40 rounded p-2.5">
 <span className="text-muted-foreground font-medium">{r.region}: </span>
 {r.desc}
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Key concepts summary */}
 <div className="rounded-md border border-border bg-muted/50 p-5">
 <h3 className="text-sm font-medium text-foreground mb-4">Key Regulatory Concepts</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
 {[
 { term: "Trade-Through", def: "Executing at inferior price when better price exists at another venue", color: "#ef4444" },
 { term: "NBBO", def: "National Best Bid and Offer — consolidated top-of-book across all exchanges", color: "#3b82f6" },
 { term: "Intermarket Sweep", def: "Order that sweeps multiple venues simultaneously to execute large size", color: "#8b5cf6" },
 { term: "Locked Market", def: "Bid = Ask across venues — normally indicates routing or quoting anomaly", color: "#f59e0b" },
 { term: "Crossed Market", def: "Bid > Ask across venues — indicates latency or erroneous quote condition", color: "#ef4444" },
 { term: "Manning Rule", def: "FINRA rule: broker cannot trade for own account at better price than customer limit order", color: "#10b981" },
 ].map((item, i) => (
 <div
 key={i}
 className="rounded-lg bg-card/50 border border-border p-3"
 style={{ borderTopColor: item.color, borderTopWidth: 2 }}
 >
 <div className="text-xs font-medium text-foreground mb-1">{item.term}</div>
 <div className="text-xs text-muted-foreground leading-relaxed">{item.def}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MarketStructurePage() {
 return (
 <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
 {/* Header */}
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <div className="p-2 rounded-lg bg-muted/10 border border-border">
 <Network size={20} className="text-muted-foreground/50" />
 </div>
 <h1 className="text-2xl font-semibold text-foreground">Market Structure</h1>
 </div>
 <p className="text-sm text-muted-foreground">How trading venues, order types, price discovery, liquidity, and regulation shape every trade</p>
 </div>
 <div className="flex flex-wrap gap-2">
 {[
 { label: "60+ Venues", color: "bg-muted/60 text-primary border-border" },
 { label: "T+1 Settlement", color: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50" },
 { label: "PFOF Reform", color: "bg-amber-900/40 text-amber-300 border-amber-700/50" },
 ].map((b, i) => (
 <Badge key={i} variant="outline" className={cn("text-xs text-muted-foreground", b.color)}>{b.label}</Badge>
 ))}
 </div>
 </div>

 {/* Stat pills — Hero */}
 <div
 className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-md border border-border bg-card border-l-4 border-l-primary p-6"
 >
 {[
 { label: "Daily US Equity Volume", value: "$420B+", sub: "avg notional traded", icon: Activity, color: "#3b82f6" },
 { label: "Registered Exchanges", value: "16", sub: "US national exchanges", icon: Globe, color: "#10b981" },
 { label: "Dark Pool Count", value: "30+", sub: "operator-run ATSs", icon: EyeOff, color: "#6b7280" },
 { label: "Closing Auction Share", value: "~35%", sub: "of daily volume at 4 PM", icon: Clock, color: "#f59e0b" },
 ].map((stat, i) => (
 <div
 key={i}
 className="rounded-md border border-border bg-muted/50 p-4"
 >
 <div className="flex items-center gap-2 mb-2">
 <stat.icon size={14} style={{ color: stat.color }} />
 <span className="text-[11px] text-muted-foreground">{stat.label}</span>
 </div>
 <div className="text-xl font-medium" style={{ color: stat.color }}>{stat.value}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
 </div>
 ))}
 </div>

 {/* Tabs */}
 <Tabs defaultValue="exchanges" className="space-y-4">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 {[
 { value: "exchanges", label: "Exchange Landscape", icon: Globe },
 { value: "orders", label: "Order Types", icon: BookOpen },
 { value: "discovery", label: "Price Discovery", icon: TrendingUp },
 { value: "fragmentation", label: "Fragmentation & Liquidity", icon: Layers },
 { value: "regulation", label: "Regulation & Reform", icon: Shield },
 ].map((tab) => (
 <TabsTrigger
 key={tab.value}
 value={tab.value}
 className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground"
 >
 <tab.icon size={12} />
 {tab.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="exchanges" className="mt-0 data-[state=inactive]:hidden">
 <ExchangeLandscapeTab />
 </TabsContent>
 <TabsContent value="orders" className="mt-0 data-[state=inactive]:hidden">
 <OrderTypesTab />
 </TabsContent>
 <TabsContent value="discovery" className="mt-0 data-[state=inactive]:hidden">
 <PriceDiscoveryTab />
 </TabsContent>
 <TabsContent value="fragmentation" className="mt-0 data-[state=inactive]:hidden">
 <FragmentationTab />
 </TabsContent>
 <TabsContent value="regulation" className="mt-0 data-[state=inactive]:hidden">
 <RegulationTab />
 </TabsContent>
 </Tabs>
 </div>
 );
}
