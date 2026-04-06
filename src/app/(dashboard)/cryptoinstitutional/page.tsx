"use client";

import { useState } from "react";
import {
 Bitcoin,
 BarChart2,
 Shield,
 Activity,
 TrendingUp,
 TrendingDown,
 DollarSign,
 Globe,
 AlertTriangle,
 ChevronDown,
 ChevronUp,
 Layers,
 Database,
 Lock,
 Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 955;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtB(n: number): string {
 if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
 return `$${n.toFixed(0)}B`;
}
void fmtB;

// ── StatChip ───────────────────────────────────────────────────────────────────
function StatChip({
 label,
 value,
 sub,
 color,
}: {
 label: string;
 value: string;
 sub: string;
 color: string;
}) {
 return (
 <Card className="bg-card border-border">
 <CardContent className="pt-4 pb-3">
 <div className={cn("text-xl font-semibold font-mono", color)}>{value}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
 <div className="text-xs text-muted-foreground">{sub}</div>
 </CardContent>
 </Card>
 );
}

// ── CollapsibleCard ────────────────────────────────────────────────────────────
function CollapsibleCard({
 title,
 icon,
 children,
 defaultOpen = true,
}: {
 title: string;
 icon: React.ReactNode;
 children: React.ReactNode;
 defaultOpen?: boolean;
}) {
 const [open, setOpen] = useState(defaultOpen);
 return (
 <Card className="bg-card border-border">
 <CardHeader
 className="pb-2 cursor-pointer select-none"
 onClick={() => setOpen((o) => !o)}
 >
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 {title}
 <span className="ml-auto text-muted-foreground">
 {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </span>
 </CardTitle>
 </CardHeader>
 
 {open && (
 <div
 className="overflow-hidden"
 >
 <CardContent className="pt-0">{children}</CardContent>
 </div>
 )}
 
 </Card>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: Bitcoin & Ether ETFs
// ═══════════════════════════════════════════════════════════════════════════════

interface EtfShare {
 name: string;
 ticker: string;
 aum: number;
 color: string;
}
const ETF_SHARES: EtfShare[] = [
 { name: "BlackRock IBIT", ticker: "IBIT", aum: 52.4, color: "#6366f1" },
 { name: "Fidelity FBTC", ticker: "FBTC", aum: 18.9, color: "#22c55e" },
 { name: "Grayscale GBTC", ticker: "GBTC", aum: 14.2, color: "#f59e0b" },
 { name: "ARK 21Shares ARKB", ticker: "ARKB", aum: 4.8, color: "#06b6d4" },
 { name: "Bitwise BITB", ticker: "BITB", aum: 3.1, color: "#a855f7" },
 { name: "Others", ticker: "—", aum: 6.6, color: "#71717a" },
];

function EtfShareChart() {
 const W = 480;
 const H = 200;
 const PAD = { l: 130, r: 60, t: 16, b: 24 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxAum = 60;
 const rowH = chartH / ETF_SHARES.length;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
 {[0, 15, 30, 45, 60].map((v) => {
 const x = PAD.l + (v / maxAum) * chartW;
 return (
 <g key={`eg-${v}`}>
 <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
 <text x={x} y={H - 8} fill="#71717a" fontSize="9" textAnchor="middle">
 ${v}B
 </text>
 </g>
 );
 })}
 {ETF_SHARES.map((etf, i) => {
 const y = PAD.t + i * rowH;
 const barW = (etf.aum / maxAum) * chartW;
 return (
 <g key={`eb-${i}`}>
 <text x={PAD.l - 6} y={y + rowH / 2 + 4} fill="#a1a1aa" fontSize="9" textAnchor="end">
 {etf.ticker}
 </text>
 <rect
 x={PAD.l}
 y={y + rowH * 0.2}
 width={barW}
 height={rowH * 0.6}
 fill={etf.color}
 fillOpacity="0.75"
 rx="2"
 />
 <text x={PAD.l + barW + 4} y={y + rowH / 2 + 4} fill={etf.color} fontSize="8">
 ${etf.aum}B
 </text>
 </g>
 );
 })}
 </svg>
 );
}

interface AumPoint {
 month: string;
 aum: number;
}
const BTC_ETF_AUM: AumPoint[] = [
 { month: "Jan", aum: 2 },
 { month: "Feb", aum: 8 },
 { month: "Mar", aum: 28 },
 { month: "Apr", aum: 52 },
 { month: "May", aum: 58 },
 { month: "Jun", aum: 62 },
 { month: "Jul", aum: 60 },
 { month: "Aug", aum: 57 },
 { month: "Sep", aum: 63 },
 { month: "Oct", aum: 72 },
 { month: "Nov", aum: 92 },
 { month: "Dec", aum: 100 },
];

function BtcAumChart() {
 const W = 480;
 const H = 160;
 const PAD = { l: 42, r: 16, t: 16, b: 28 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxV = 110;
 const toX = (i: number) => PAD.l + (i / (BTC_ETF_AUM.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - (v / maxV) * chartH;
 const pts = BTC_ETF_AUM.map((d, i) => `${toX(i)},${toY(d.aum)}`).join("");
 const area = [
 `${toX(0)},${PAD.t + chartH}`,
 ...BTC_ETF_AUM.map((d, i) => `${toX(i)},${toY(d.aum)}`),
 `${toX(BTC_ETF_AUM.length - 1)},${PAD.t + chartH}`,
 ].join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <defs>
 <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
 <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {[0, 25, 50, 75, 100].map((v) => (
 <line key={`ag-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 ))}
 {[0, 25, 50, 75, 100].map((v) => (
 <text key={`ay-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
 ${v}B
 </text>
 ))}
 <polygon points={area} fill="url(#aumGrad)" />
 <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
 {BTC_ETF_AUM.map((d, i) => (
 <circle key={`ad-${i}`} cx={toX(i)} cy={toY(d.aum)} r="3" fill="#6366f1" />
 ))}
 {BTC_ETF_AUM.map((d, i) => (
 <text key={`ax-${i}`} x={toX(i)} y={H - 6} fill="#71717a" fontSize="8" textAnchor="middle">
 {d.month}
 </text>
 ))}
 </svg>
 );
}

function EtfMechanismSVG() {
 return (
 <svg viewBox="0 0 480 150" className="w-full h-36">
 <defs>
 <marker id="emA1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
 </marker>
 <marker id="emA2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
 </marker>
 <marker id="emA3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
 </marker>
 </defs>
 <rect x="10" y="50" width="90" height="50" rx="6" fill="#1e1e2e" stroke="#6366f1" strokeWidth="1.5" />
 <text x="55" y="72" fill="#a5b4fc" fontSize="9" textAnchor="middle" fontWeight="bold">AUTH. PART.</text>
 <text x="55" y="85" fill="#a5b4fc" fontSize="8" textAnchor="middle">(Market Maker)</text>
 <text x="55" y="96" fill="#a5b4fc" fontSize="8" textAnchor="middle">AP / Dealer</text>
 <rect x="190" y="40" width="100" height="70" rx="6" fill="#1e1e2e" stroke="#22c55e" strokeWidth="1.5" />
 <text x="240" y="62" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">ETF ISSUER</text>
 <text x="240" y="76" fill="#6ee7b7" fontSize="8" textAnchor="middle">BlackRock /</text>
 <text x="240" y="88" fill="#6ee7b7" fontSize="8" textAnchor="middle">Fidelity</text>
 <text x="240" y="100" fill="#6ee7b7" fontSize="8" textAnchor="middle">Custodian: CB</text>
 <rect x="370" y="50" width="100" height="50" rx="6" fill="#1e1e2e" stroke="#f59e0b" strokeWidth="1.5" />
 <text x="420" y="72" fill="#fcd34d" fontSize="9" textAnchor="middle" fontWeight="bold">COINBASE</text>
 <text x="420" y="85" fill="#fcd34d" fontSize="8" textAnchor="middle">Prime Custody</text>
 <text x="420" y="96" fill="#fcd34d" fontSize="8" textAnchor="middle">BTC Cold Store</text>
 <line x1="100" y1="68" x2="186" y2="68" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#emA1)" />
 <text x="143" y="62" fill="#a5b4fc" fontSize="7.5" textAnchor="middle">Cash (Creation)</text>
 <line x1="186" y1="82" x2="100" y2="82" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#emA2)" />
 <text x="143" y="94" fill="#6ee7b7" fontSize="7.5" textAnchor="middle">ETF Shares</text>
 <line x1="290" y1="75" x2="368" y2="75" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#emA3)" />
 <text x="329" y="67" fill="#fcd34d" fontSize="7.5" textAnchor="middle">BTC Purchase</text>
 <text x="240" y="130" fill="#52525b" fontSize="8" textAnchor="middle">
 Creation: AP delivers cash, issuer buys spot BTC; Redemption: reverse flow
 </text>
 </svg>
 );
}

interface EtfInfo {
 name: string;
 type: string;
 er: number;
 note: string;
 color: string;
}
const ETF_EXPENSE_DATA: EtfInfo[] = [
 { name: "IBIT (BlackRock)", type: "Spot BTC", er: 0.25, note: "0.12% first yr then 0.25%", color: "#6366f1" },
 { name: "FBTC (Fidelity)", type: "Spot BTC", er: 0.25, note: "Fee waiver ended Aug 2024", color: "#22c55e" },
 { name: "GBTC (Grayscale)", type: "Spot BTC", er: 1.5, note: "Converted from trust 2024", color: "#f59e0b" },
 { name: "BTC Mini Trust", type: "Spot BTC", er: 0.15, note: "Lowest-cost option", color: "#06b6d4" },
 { name: "BITO (ProShares)", type: "Futures BTC", er: 0.95, note: "+contango drag ~5-10%/yr", color: "#f87171" },
 { name: "EFUT (ETF Mgrs)", type: "Futures ETH", er: 0.72, note: "Futures roll cost adds up", color: "#fb923c" },
 { name: "ETHA (BlackRock)", type: "Spot ETH", er: 0.25, note: "No staking included", color: "#a855f7" },
];

function ExpenseRatioChart() {
 const W = 480;
 const H = 220;
 const PAD = { l: 150, r: 60, t: 16, b: 24 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxER = 1.8;
 const rowH = chartH / ETF_EXPENSE_DATA.length;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
 {[0, 0.5, 1.0, 1.5].map((v) => {
 const x = PAD.l + (v / maxER) * chartW;
 return (
 <g key={`xg-${v}`}>
 <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
 <text x={x} y={H - 8} fill="#71717a" fontSize="9" textAnchor="middle">
 {v}%
 </text>
 </g>
 );
 })}
 {ETF_EXPENSE_DATA.map((etf, i) => {
 const y = PAD.t + i * rowH;
 const barW = (etf.er / maxER) * chartW;
 return (
 <g key={`xb-${i}`}>
 <text x={PAD.l - 6} y={y + rowH / 2 + 4} fill="#a1a1aa" fontSize="8.5" textAnchor="end">
 {etf.name}
 </text>
 <rect
 x={PAD.l}
 y={y + rowH * 0.2}
 width={barW}
 height={rowH * 0.6}
 fill={etf.color}
 fillOpacity="0.75"
 rx="2"
 />
 <text x={PAD.l + barW + 4} y={y + rowH / 2 + 4} fill={etf.color} fontSize="8">
 {etf.er}%
 </text>
 </g>
 );
 })}
 </svg>
 );
}

function BasisTradeSVG() {
 return (
 <svg viewBox="0 0 480 130" className="w-full h-32">
 <defs>
 <marker id="btA1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
 </marker>
 <marker id="btA2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
 </marker>
 </defs>
 <rect x="10" y="40" width="110" height="50" rx="6" fill="#1e1e2e" stroke="#22c55e" strokeWidth="1.5" />
 <text x="65" y="60" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">LONG ETF</text>
 <text x="65" y="74" fill="#6ee7b7" fontSize="8" textAnchor="middle">(Spot Exposure)</text>
 <text x="65" y="86" fill="#6ee7b7" fontSize="8" textAnchor="middle">IBIT / FBTC</text>
 <rect x="185" y="30" width="110" height="70" rx="6" fill="#1e1e2e" stroke="#f87171" strokeWidth="1.5" />
 <text x="240" y="52" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">SHORT FUTURES</text>
 <text x="240" y="66" fill="#fca5a5" fontSize="8" textAnchor="middle">CME BTC Front</text>
 <text x="240" y="80" fill="#fca5a5" fontSize="8" textAnchor="middle">Month Contract</text>
 <text x="240" y="92" fill="#fca5a5" fontSize="8" textAnchor="middle">Cash-settled</text>
 <rect x="360" y="35" width="115" height="60" rx="6" fill="#1e1e2e" stroke="#f59e0b" strokeWidth="1.5" />
 <text x="417" y="55" fill="#fcd34d" fontSize="9" textAnchor="middle" fontWeight="bold">BASIS PROFIT</text>
 <text x="417" y="68" fill="#fcd34d" fontSize="8" textAnchor="middle">Futures Premium</text>
 <text x="417" y="81" fill="#fcd34d" fontSize="8" textAnchor="middle">~10-20% annlzd</text>
 <text x="417" y="91" fill="#fcd34d" fontSize="8" textAnchor="middle">bull market</text>
 <line x1="120" y1="65" x2="181" y2="65" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#btA1)" />
 <line x1="295" y1="65" x2="356" y2="65" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#btA2)" />
 </svg>
 );
}

function Tab1EtfContent() {
 const etherTimeline = [
 { date: "May 2024", event: "VanEck, ARK files for spot ETH ETF", status: "Filed" },
 { date: "May 23, 2024", event: "SEC approves 19b-4 for 8 issuers (surprise decision)", status: "Approved" },
 { date: "Jul 23, 2024", event: "Spot ETH ETFs begin trading — no staking allowed", status: "Live" },
 { date: "Aug 2024", event: "SEC blocks staking inclusion; Grayscale ETHE sees $3B outflows", status: "Controversy" },
 { date: "2025", event: "Industry lobbies for staking approval; SEC signals openness", status: "Pending" },
 ];

 const allocationData = [
 { tier: "Traditional 60/40", crypto: 0, note: "No crypto allocation" },
 { tier: "Conservative Instit.", crypto: 0.5, note: "Risk-budget constrained" },
 { tier: "Moderate Instit.", crypto: 1.5, note: "1-3% considered standard" },
 { tier: "Aggressive Endowment", crypto: 3.0, note: "Yale/Harvard-style" },
 { tier: "Crypto-native Fund", crypto: 25, note: "Digital assets focus" },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="Spot BTC ETF AUM" value="$100B" sub="Dec 2024 total" color="text-indigo-400" />
 <StatChip label="Spot ETH ETF AUM" value="$12B" sub="8 issuers combined" color="text-foreground" />
 <StatChip label="IBIT Daily Volume" value="$1.8B" sub="Largest by AUM" color="text-emerald-400" />
 <StatChip label="GBTC Discount 2023" value="-49%" sub="Pre-conversion peak" color="text-amber-400" />
 </div>

 <CollapsibleCard
 title="ETF Creation/Redemption Mechanism"
 icon={<Layers className="w-4 h-4 text-indigo-400" />}
 >
 <EtfMechanismSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Authorized Participants (large broker-dealers) interact directly with the ETF issuer to create and redeem
 large blocks (creation units). Cash creations mean the AP delivers dollars; the issuer then purchases
 spot BTC through a custodian (Coinbase Prime for most US spot ETFs). This arbitrage keeps ETF price close to NAV.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="ETF Market Share — Bitcoin Spot ETFs (Dec 2024)"
 icon={<BarChart2 className="w-4 h-4 text-emerald-400" />}
 >
 <EtfShareChart />
 <p className="text-xs text-muted-foreground mt-2">
 BlackRock IBIT dominated inflows, reaching $52B AUM within 11 months — fastest ETF to $50B ever.
 Grayscale GBTC suffered continuous outflows after conversion from trust as investors switched to lower-fee
 alternatives. Fidelity FBTC established a strong second place driven by direct institutional relationships.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Bitcoin Spot ETF AUM Growth — 2024"
 icon={<TrendingUp className="w-4 h-4 text-indigo-400" />}
 >
 <BtcAumChart />
 <p className="text-xs text-muted-foreground mt-2">
 Spot Bitcoin ETFs launched January 11, 2024. AUM crossed $50B by April and $100B by year-end, driven by
 rising BTC prices and steady institutional accumulation. ETF flows became a key institutional demand signal
 tracked by market participants — sustained daily inflows indicate institutional buying pressure.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Expense Ratio Comparison — Spot vs Futures ETFs"
 icon={<DollarSign className="w-4 h-4 text-amber-400" />}
 >
 <ExpenseRatioChart />
 <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-300 space-y-1">
 <div className="font-medium">Futures ETF Contango Drag</div>
 <div className="text-amber-400/80">
 Futures-based ETFs must roll contracts monthly. When futures trade at a premium to spot (contango),
 rolling from near-month to next month incurs a cost. In BTC this can total 5-10% annually,
 significantly eroding returns vs spot price performance.
 </div>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Spot ETFs eliminated the contango drag problem. Grayscale GBTC at 1.5% remains expensive but holds
 legacy investors with embedded gains. The BTC Mini Trust at 0.15% is the lowest-cost option available.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Ether ETF Timeline & Staking Exclusion Controversy"
 icon={<Activity className="w-3.5 h-3.5 text-muted-foreground/50" />}
 defaultOpen={false}
 >
 <div className="space-y-2">
 {etherTimeline.map((ev, i) => {
 const borderCol =
 ev.status === "Approved"
 ? "border-emerald-800"
 : ev.status === "Controversy"
 ? "border-amber-800"
 : ev.status === "Live"
 ? "border-border"
 : ev.status === "Pending"
 ? "border-border"
 : "border-border";
 const badgeColor =
 ev.status === "Approved"
 ? "#22c55e"
 : ev.status === "Live"
 ? "#3b82f6"
 : ev.status === "Controversy"
 ? "#f59e0b"
 : "#8b5cf6";
 return (
 <div key={i} className={cn("border rounded p-2 text-xs text-muted-foreground", borderCol)}>
 <div className="flex items-center gap-2">
 <span className="font-mono text-muted-foreground">{ev.date}</span>
 <Badge
 className="text-xs text-muted-foreground"
 style={{
 backgroundColor: `${badgeColor}22`,
 color: badgeColor,
 borderColor: `${badgeColor}44`,
 }}
 >
 {ev.status}
 </Badge>
 </div>
 <div className="text-muted-foreground mt-1">{ev.event}</div>
 </div>
 );
 })}
 </div>
 <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded text-xs text-red-300">
 <span className="font-medium">Staking Exclusion Impact: </span>
 ETH staking earns ~3-4% annual yield. SEC required all spot ETH ETFs to exclude staking,
 meaning ETH ETF holders forgo this yield — a significant drag vs direct ETH ownership.
 Industry advocates argue staking distributions should qualify as non-securities returns.
 </div>
 </CollapsibleCard>

 <CollapsibleCard
 title="Basis Trade: Spot ETF vs CME Futures"
 icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
 defaultOpen={false}
 >
 <BasisTradeSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Institutional traders exploit the premium between CME BTC futures and spot price. Long spot ETF,
 short CME futures locks in the futures premium. During bull markets, annualized basis ranged 10-20%.
 Risk: futures premium collapses in bear markets, turning the trade negative. ETF liquidity made this
 trade accessible at scale — previously required OTC spot and futures accounts simultaneously.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Institutional Crypto Allocation Sizing"
 icon={<Shield className="w-3.5 h-3.5 text-muted-foreground/50" />}
 defaultOpen={false}
 >
 <div className="space-y-3">
 {allocationData.map((row) => (
 <div key={row.tier} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{row.tier}</span>
 <span className="text-muted-foreground">{row.note}</span>
 </div>
 <div className="h-2 bg-muted rounded-full overflow-hidden">
 <div
 style={{ width: `${Math.min(row.crypto * 4, 100)}%` }}
 className="h-full rounded-full bg-indigo-500"
 />
 </div>
 <div className="text-xs text-indigo-400">{row.crypto}% crypto allocation</div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Industry consensus has coalesced around 1-3% Bitcoin allocation as the &quot;meaningful but not reckless&quot;
 range. Fidelity Digital Assets research suggests even 1% BTC improved the Sharpe ratio of 60/40 portfolios
 over 2014-2023. ETF wrapper removed custody/operational barriers for conservative institutions.
 </p>
 </CollapsibleCard>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: Stablecoin Ecosystem
// ═══════════════════════════════════════════════════════════════════════════════

function StablecoinTaxonomySVG() {
 const types = [
 { label: "Fiat-Backed", sub: "USDT / USDC", desc: "1:1 cash & equivalents", color: "#22c55e", x: 60 },
 { label: "Crypto-Backed", sub: "DAI / LUSD", desc: "Over-collateralised", color: "#6366f1", x: 180 },
 { label: "Algorithmic", sub: "UST (defunct)", desc: "Seigniorage peg", color: "#f87171", x: 300 },
 { label: "Yield-Bearing", sub: "USDY / sDAI", desc: "Tokenized T-bills / RWA", color: "#f59e0b", x: 420 },
 ];
 return (
 <svg viewBox="0 0 480 140" className="w-full h-36">
 {types.map((t) => (
 <g key={t.label}>
 <rect x={t.x - 55} y="20" width="110" height="80" rx="8" fill="#18181b" stroke={t.color} strokeWidth="1.5" />
 <text x={t.x} y="43" fill={t.color} fontSize="9.5" textAnchor="middle" fontWeight="bold">
 {t.label}
 </text>
 <text x={t.x} y="58" fill="#a1a1aa" fontSize="8.5" textAnchor="middle">
 {t.sub}
 </text>
 <text x={t.x} y="72" fill="#71717a" fontSize="7.5" textAnchor="middle">
 {t.desc}
 </text>
 <rect
 x={t.x - 32}
 y="108"
 width="64"
 height="14"
 rx="3"
 fill={`${t.color}22`}
 stroke={`${t.color}44`}
 strokeWidth="1"
 />
 <text x={t.x} y="119" fill={t.color} fontSize="7.5" textAnchor="middle">
 {t.label === "Algorithmic"
 ? "HIGH RISK"
 : t.label === "Yield-Bearing"
 ? "GROWING"
 : t.label === "Fiat-Backed"
 ? "DOMINANT"
 : "RESILIENT"}
 </text>
 </g>
 ))}
 </svg>
 );
}

interface ScapPoint {
 year: string;
 mcap: number;
}
const STABLE_MCAP: ScapPoint[] = [
 { year: "Q1 20", mcap: 8 },
 { year: "Q3 20", mcap: 18 },
 { year: "Q1 21", mcap: 38 },
 { year: "Q3 21", mcap: 110 },
 { year: "Q1 22", mcap: 180 },
 { year: "Q3 22", mcap: 145 },
 { year: "Q1 23", mcap: 140 },
 { year: "Q3 23", mcap: 130 },
 { year: "Q1 24", mcap: 148 },
 { year: "Q3 24", mcap: 165 },
];

function StablecoinGrowthChart() {
 const W = 480;
 const H = 160;
 const PAD = { l: 42, r: 16, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxV = 200;
 const toX = (i: number) => PAD.l + (i / (STABLE_MCAP.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - (v / maxV) * chartH;
 const pts = STABLE_MCAP.map((d, i) => `${toX(i)},${toY(d.mcap)}`).join("");
 const area = [
 `${toX(0)},${PAD.t + chartH}`,
 ...STABLE_MCAP.map((d, i) => `${toX(i)},${toY(d.mcap)}`),
 `${toX(STABLE_MCAP.length - 1)},${PAD.t + chartH}`,
 ].join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <defs>
 <linearGradient id="sgGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {[0, 50, 100, 150, 200].map((v) => (
 <line key={`sgg-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 ))}
 {[0, 50, 100, 150, 200].map((v) => (
 <text key={`sgy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
 ${v}B
 </text>
 ))}
 <polygon points={area} fill="url(#sgGrad)" />
 <polyline points={pts} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
 {STABLE_MCAP.map((d, i) => (
 <circle key={`sgd-${i}`} cx={toX(i)} cy={toY(d.mcap)} r="3" fill="#22c55e" />
 ))}
 {STABLE_MCAP.map((d, i) => (
 <text key={`sgx-${i}`} x={toX(i)} y={H - 8} fill="#71717a" fontSize="7.5" textAnchor="middle">
 {d.year}
 </text>
 ))}
 </svg>
 );
}

interface ReserveSlice {
 name: string;
 usdt: number;
 usdc: number;
 color: string;
}
const RESERVE_DATA: ReserveSlice[] = [
 { name: "US Treasuries", usdt: 65, usdc: 80, color: "#22c55e" },
 { name: "Cash & Deposits", usdt: 12, usdc: 15, color: "#6366f1" },
 { name: "MMF / Repos", usdt: 8, usdc: 5, color: "#06b6d4" },
 { name: "Corporate Bonds", usdt: 6, usdc: 0, color: "#f59e0b" },
 { name: "Other / Loans", usdt: 9, usdc: 0, color: "#f87171" },
];

function ReserveChart() {
 const W = 480;
 const H = 170;
 const PAD = { l: 120, r: 100, t: 24, b: 24 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const rowH = chartH / RESERVE_DATA.length;
 const barH = rowH * 0.35;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
 <text x={PAD.l + chartW * 0.25} y="14" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">
 USDT
 </text>
 <text x={PAD.l + chartW * 0.75} y="14" fill="#6366f1" fontSize="9" textAnchor="middle" fontWeight="bold">
 USDC
 </text>
 {[0, 25, 50, 75, 100].map((v) => {
 const x = PAD.l + (v / 100) * chartW;
 return (
 <line key={`rv-${v}`} x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="#1f1f23" strokeWidth="1" />
 );
 })}
 {RESERVE_DATA.map((r, i) => {
 const y = PAD.t + i * rowH;
 const w1 = (r.usdt / 100) * chartW * 0.48;
 const w2 = (r.usdc / 100) * chartW * 0.48;
 const x1 = PAD.l;
 const x2 = PAD.l + chartW * 0.52;
 return (
 <g key={`rv-${i}`}>
 <text x={PAD.l - 6} y={y + rowH / 2 + 4} fill="#a1a1aa" fontSize="8.5" textAnchor="end">
 {r.name}
 </text>
 {r.usdt > 0 && (
 <rect x={x1} y={y + rowH * 0.15} width={w1} height={barH} fill={r.color} fillOpacity="0.7" rx="2" />
 )}
 {r.usdt > 0 && (
 <text x={x1 + w1 + 3} y={y + rowH / 2 + 4} fill={r.color} fontSize="7.5">
 {r.usdt}%
 </text>
 )}
 {r.usdc > 0 && (
 <rect x={x2} y={y + rowH * 0.15} width={w2} height={barH} fill={r.color} fillOpacity="0.7" rx="2" />
 )}
 {r.usdc > 0 && (
 <text x={x2 + w2 + 3} y={y + rowH / 2 + 4} fill={r.color} fontSize="7.5">
 {r.usdc}%
 </text>
 )}
 </g>
 );
 })}
 </svg>
 );
}

function Tab2StablecoinContent() {
 const depegEvents = [
 {
 coin: "USDC",
 date: "Mar 2023",
 depeg: "-8.5%",
 cause: "Circle disclosed $3.3B held at Silicon Valley Bank during SVB collapse",
 recovery: "48h — Federal backstop announcement",
 severity: "Moderate",
 color: "#f59e0b",
 },
 {
 coin: "TerraUSD (UST)",
 date: "May 2022",
 depeg: "-99%",
 cause: "Algorithmic peg broke as LUNA hyperinflated; $50B+ wiped in days. Death spiral dynamic.",
 recovery: "Never recovered — full collapse",
 severity: "Catastrophic",
 color: "#f87171",
 },
 {
 coin: "BUSD",
 date: "Feb 2023",
 depeg: "0%",
 cause: "NYDFS ordered Paxos to stop minting BUSD — not a depeg, but market cap fell $16B to $1B",
 recovery: "Orderly wind-down over 12 months",
 severity: "Regulatory",
 color: "#a855f7",
 },
 ];

 const yieldStables = [
 { name: "USDY (Ondo)", mechanism: "Tokenized US T-bills", yield: "~4.5%", chain: "Ethereum / Solana", note: "KYC required" },
 { name: "USDM (Mountain)", mechanism: "Short-term Treasuries", yield: "~4.5%", chain: "Multi-chain", note: "Permissioned" },
 { name: "sDAI (Maker)", mechanism: "DAI Savings Rate (DSR)", yield: "~5-8%", chain: "Ethereum", note: "Permissionless" },
 { name: "OUSD (Origin)", mechanism: "DeFi yield strategies", yield: "~4-6%", chain: "Ethereum", note: "Variable yield" },
 { name: "PYUSD (PayPal)", mechanism: "Short-term UST + deposits", yield: "0%", chain: "Ethereum / Solana", note: "Payments focused" },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="Total Stablecoin M.Cap" value="$165B" sub="Sep 2024" color="text-emerald-400" />
 <StatChip label="USDT Dominance" value="71%" sub="Of stablecoin supply" color="text-amber-400" />
 <StatChip label="DEX Vol Stablecoin" value="80%+" sub="Stablecoins in DEX volume" color="text-foreground" />
 <StatChip label="Daily Stablecoin Vol" value="$40B" sub="Cross-chain transfers" color="text-foreground" />
 </div>

 <CollapsibleCard
 title="Stablecoin Taxonomy"
 icon={<Layers className="w-4 h-4 text-emerald-400" />}
 >
 <StablecoinTaxonomySVG />
 <p className="text-xs text-muted-foreground mt-2">
 Four distinct models exist. Fiat-backed (USDT, USDC) hold 1:1 reserves in cash/equivalents — dominant
 but requires trust in issuer. Crypto-backed (DAI) over-collateralise with on-chain assets (150%+).
 Algorithmic stables (UST) proved catastrophically fragile. Yield-bearing stables tokenize real-world
 assets like T-bills, growing rapidly as rates rose above zero.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Stablecoin Market Cap Growth 2020-2024"
 icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
 >
 <StablecoinGrowthChart />
 <p className="text-xs text-muted-foreground mt-2">
 Stablecoin market cap grew from ~$10B in early 2020 to a peak of ~$180B in early 2022 fueled by DeFi
 summer and institutional adoption. The May 2022 UST collapse and 2022 bear market caused a retrenchment
 to $130B. Recovery through 2024 driven by payments adoption and yield-bearing stablecoins.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Reserve Composition: USDT vs USDC"
 icon={<Shield className="w-3.5 h-3.5 text-muted-foreground/50" />}
 >
 <ReserveChart />
 <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
 <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded">
 <div className="font-medium text-amber-300 mb-1">Tether (USDT)</div>
 <div className="text-muted-foreground">
 Historically opaque; now publishes quarterly attestations (not full audits). Holds ~$65B in T-bills.
 Tether Inc. is among the most profitable companies per employee — earns full T-bill yield on reserves.
 </div>
 </div>
 <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded">
 <div className="font-medium text-indigo-300 mb-1">Circle (USDC)</div>
 <div className="text-muted-foreground">
 Monthly attestations by major accounting firms. Reserves held in segregated accounts at regulated
 US banks and BNY Mellon. More transparent but suffered the March 2023 SVB scare.
 </div>
 </div>
 </div>
 </CollapsibleCard>

 <CollapsibleCard
 title="Depeg Events Analysis"
 icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
 >
 <div className="space-y-3">
 {depegEvents.map((ev) => (
 <div key={ev.coin} className="border border-border rounded p-3 space-y-2">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-sm font-semibold text-foreground">{ev.coin}</span>
 <span className="font-mono text-xs text-muted-foreground">{ev.date}</span>
 <span
 className={cn(
 "font-mono font-medium text-sm ml-auto",
 ev.severity === "Catastrophic"
 ? "text-red-400"
 : ev.severity === "Regulatory"
 ? "text-foreground"
 : "text-amber-400"
 )}
 >
 {ev.depeg}
 </span>
 <Badge
 className="text-xs text-muted-foreground"
 style={{
 backgroundColor: `${ev.color}22`,
 color: ev.color,
 borderColor: `${ev.color}44`,
 }}
 >
 {ev.severity}
 </Badge>
 </div>
 <div className="text-xs text-muted-foreground">{ev.cause}</div>
 <div className="text-xs text-muted-foreground">Recovery: {ev.recovery}</div>
 </div>
 ))}
 </div>
 </CollapsibleCard>

 <CollapsibleCard
 title="Yield-Bearing Stablecoins"
 icon={<DollarSign className="w-4 h-4 text-amber-400" />}
 defaultOpen={false}
 >
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Stablecoin", "Mechanism", "Yield", "Chain", "Access"].map((h) => (
 <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {yieldStables.map((row, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30">
 <td className="py-2 px-3 text-amber-400 font-medium">{row.name}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.mechanism}</td>
 <td className="py-2 px-3 text-emerald-400 font-mono">{row.yield}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.chain}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.note}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 With risk-free rates above 4%, yield-bearing stablecoins became the fastest growing stablecoin segment.
 Tokenized T-bill products (USDY, USDM) offer compliant access to institutional-grade yield on-chain.
 sDAI uses MakerDAO&apos;s DSR which routes DAI collateral into real-world assets.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Stablecoin Regulation: EU MiCA & US GENIUS Act"
 icon={<Globe className="w-4 h-4 text-indigo-400" />}
 defaultOpen={false}
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
 <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded space-y-2">
 <div className="font-medium text-indigo-300">EU MiCA — Asset-Referenced Tokens</div>
 <ul className="space-y-1 text-muted-foreground">
 <li>• Issuers must be authorized as credit/e-money institutions</li>
 <li>• 1:1 reserve requirement, minimum own funds EUR 350K</li>
 <li>• &quot;Significant&quot; stablecoins (&gt;10M users or &gt;EUR 5B) face stricter rules</li>
 <li>• Tether under scrutiny — may exit EU rather than comply</li>
 <li>• MiCA fully in force June 2024</li>
 </ul>
 </div>
 <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded space-y-2">
 <div className="font-medium text-emerald-300">US GENIUS Act (2025 proposed)</div>
 <ul className="space-y-1 text-muted-foreground">
 <li>• Requires 1:1 backing with USD, T-bills, or insured deposits</li>
 <li>• Monthly public reserve disclosure required</li>
 <li>• Federal charter for issuers above $10B market cap</li>
 <li>• State-level licensing for smaller issuers</li>
 <li>• Prohibits algorithmic stablecoins without full collateral</li>
 </ul>
 </div>
 </div>
 </CollapsibleCard>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: Crypto Prime Brokerage
// ═══════════════════════════════════════════════════════════════════════════════

function CryptoPBServicesSVG() {
 const services = [
 { label: "Custody", sub: "Cold/warm wallet", color: "#6366f1", x: 80, y: 60 },
 { label: "OTC Desk", sub: "Block execution", color: "#22c55e", x: 200, y: 30 },
 { label: "Prime Finance", sub: "Margin / Leverage", color: "#f59e0b", x: 320, y: 60 },
 { label: "Sec. Lending", sub: "Token lending", color: "#06b6d4", x: 400, y: 105 },
 { label: "Reporting", sub: "Tax / PnL", color: "#a855f7", x: 80, y: 120 },
 { label: "Multi-venue", sub: "Best execution", color: "#f87171", x: 240, y: 115 },
 ];
 return (
 <svg viewBox="0 0 480 160" className="w-full h-40">
 <rect x="190" y="55" width="100" height="50" rx="8" fill="#18181b" stroke="#ffffff22" strokeWidth="1.5" />
 <text x="240" y="76" fill="#e4e4e7" fontSize="9.5" textAnchor="middle" fontWeight="bold">
 CRYPTO PB
 </text>
 <text x="240" y="90" fill="#71717a" fontSize="8" textAnchor="middle">
 Coinbase / Galaxy
 </text>
 <text x="240" y="102" fill="#71717a" fontSize="8" textAnchor="middle">
 BitGo / Copper
 </text>
 {services.map((svc) => (
 <g key={svc.label}>
 <rect
 x={svc.x - 45}
 y={svc.y - 18}
 width="90"
 height="36"
 rx="6"
 fill="#1e1e2e"
 stroke={svc.color}
 strokeWidth="1.3"
 />
 <text x={svc.x} y={svc.y - 3} fill={svc.color} fontSize="8.5" textAnchor="middle" fontWeight="bold">
 {svc.label}
 </text>
 <text x={svc.x} y={svc.y + 11} fill="#71717a" fontSize="7.5" textAnchor="middle">
 {svc.sub}
 </text>
 <line
 x1={svc.x < 200 ? svc.x + 45 : svc.x > 280 ? svc.x - 45 : svc.x}
 y1={svc.y < 80 ? svc.y + 18 : svc.y - 18}
 x2={svc.x < 200 ? 190 : svc.x > 280 ? 290 : 240}
 y2={svc.y < 80 ? 55 : 105}
 stroke={svc.color}
 strokeWidth="1"
 strokeDasharray="3,2"
 opacity="0.6"
 />
 </g>
 ))}
 </svg>
 );
}

function FtxImpactSVG() {
 const events = [
 { x: 50, label: "FTX peak", sub: "$32B valuation", color: "#22c55e", above: true },
 { x: 160, label: "Alameda leak", sub: "Balance exposed", color: "#f59e0b", above: false },
 { x: 270, label: "Bank run", sub: "$6B in 72h", color: "#f87171", above: true },
 { x: 380, label: "Bankruptcy", sub: "Nov 11, 2022", color: "#f87171", above: false },
 { x: 490, label: "Contagion", sub: "BlockFi, Genesis", color: "#f87171", above: true },
 ];
 return (
 <svg viewBox="0 0 540 100" className="w-full h-24">
 <line x1="30" y1="50" x2="520" y2="50" stroke="#3f3f46" strokeWidth="1.5" />
 {events.map((ev, i) => (
 <g key={i}>
 <circle cx={ev.x} cy="50" r="5" fill={ev.color} />
 <line
 x1={ev.x}
 y1={ev.above ? 45 : 55}
 x2={ev.x}
 y2={ev.above ? 22 : 78}
 stroke={ev.color}
 strokeWidth="1"
 strokeDasharray="2,2"
 />
 <text x={ev.x} y={ev.above ? 18 : 90} fill={ev.color} fontSize="8" textAnchor="middle" fontWeight="bold">
 {ev.label}
 </text>
 <text x={ev.x} y={ev.above ? 28 : 100} fill="#71717a" fontSize="7" textAnchor="middle">
 {ev.sub}
 </text>
 </g>
 ))}
 </svg>
 );
}

function Tab3PrimeBrokerageContent() {
 const pbProviders = [
 {
 name: "Coinbase Prime",
 strengths: "Largest regulated custodian; direct BTC ETF custody",
 custody: true,
 otc: true,
 lending: true,
 margin: true,
 },
 {
 name: "Galaxy Digital",
 strengths: "Deep institutional OTC desk, M&A advisory, multi-strategy",
 custody: false,
 otc: true,
 lending: true,
 margin: true,
 },
 {
 name: "BitGo",
 strengths: "Multi-sig custody pioneer, SOC 2 Type II, broad token support",
 custody: true,
 otc: false,
 lending: true,
 margin: false,
 },
 {
 name: "Copper",
 strengths: "ClearLoop settlement (no on-exchange custody risk), EU focus",
 custody: true,
 otc: true,
 lending: false,
 margin: false,
 },
 {
 name: "FalconX",
 strengths: "Prime brokerage + advanced algo trading, institutional APIs",
 custody: false,
 otc: true,
 lending: true,
 margin: true,
 },
 ];

 const marginData = [
 { asset: "Bitcoin (BTC)", ltv: 50, note: "Industry standard", color: "#f59e0b" },
 { asset: "Ethereum (ETH)", ltv: 50, note: "Similar to BTC", color: "#6366f1" },
 { asset: "Large-cap alts", ltv: 30, note: "Higher volatility", color: "#06b6d4" },
 { asset: "Mid-cap tokens", ltv: 15, note: "Liquidity risk premium", color: "#a855f7" },
 { asset: "Stablecoins", ltv: 90, note: "Near-cash treatment", color: "#22c55e" },
 ];

 const riskTypes = [
 {
 risk: "24/7 Market Risk",
 desc: "Markets never close — margin calls and liquidations occur overnight, weekends, holidays. No circuit breakers exist.",
 },
 {
 risk: "Fork & Airdrop Risk",
 desc: "Hard forks create duplicate assets (Bitcoin Cash from BTC). Custodian must handle fork tokens; policies vary widely.",
 },
 {
 risk: "Smart Contract Risk",
 desc: "DeFi collateral or yield sources may have exploitable code. $3B+ stolen from DeFi protocols in 2022 alone.",
 },
 {
 risk: "Rehypothecation Risk",
 desc: "Pre-FTX, customer assets were routinely rehypothecated by exchanges. Now discouraged; segregated custody is the new standard.",
 },
 {
 risk: "Counterparty Credit",
 desc: "Crypto lending counterparties less creditworthy than TradFi. No SIPC/FDIC insurance for most crypto accounts.",
 },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="Coinbase Prime AUM" value="$250B+" sub="Custodied institutional" color="text-foreground" />
 <StatChip label="OTC Block Min. Size" value=">$500K" sub="Typical minimum" color="text-emerald-400" />
 <StatChip label="BTC Lending LTV" value="50%" sub="Standard margin rate" color="text-amber-400" />
 <StatChip label="FTX Claims Paid" value="$16B" sub="Nov 2024 bankruptcy plan" color="text-foreground" />
 </div>

 <CollapsibleCard
 title="Crypto Prime Brokerage Services Overview"
 icon={<Layers className="w-4 h-4 text-indigo-400" />}
 >
 <CryptoPBServicesSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Crypto prime brokers offer a full suite mirroring traditional prime brokerage: custody, OTC execution,
 margin lending, securities lending, reporting, and multi-venue best execution. Unlike TradFi PBs,
 crypto PBs must operate 24/7 and handle blockchain-native assets including NFTs and DeFi tokens.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Margin Lending: Collateral LTV Ratios"
 icon={<DollarSign className="w-4 h-4 text-amber-400" />}
 >
 <div className="space-y-3">
 {marginData.map((row) => (
 <div key={row.asset} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{row.asset}</span>
 <span className="text-muted-foreground">{row.note}</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
 <div
 style={{ width: `${row.ltv}%` }}
 className="h-full rounded-full"
 />
 </div>
 <span className="text-xs font-mono font-medium" style={{ color: row.color }}>
 {row.ltv}% LTV
 </span>
 </div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 LTV (loan-to-value) limits how much can be borrowed against collateral. BTC at 50% LTV means $1M BTC
 collateral supports a max $500K loan. Crypto LTVs are far lower than TradFi equity margins (typically
 70-80%) due to higher price volatility and thinner liquidation markets.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Institutional Crypto PB Landscape"
 icon={<Globe className="w-4 h-4 text-emerald-400" />}
 >
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Provider", "Key Strengths", "Cust.", "OTC", "Lend", "Margin"].map((h) => (
 <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {pbProviders.map((pb, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30">
 <td className="py-2 px-3 text-foreground font-medium">{pb.name}</td>
 <td className="py-2 px-3 text-muted-foreground">{pb.strengths}</td>
 {([pb.custody, pb.otc, pb.lending, pb.margin] as boolean[]).map((has, j) => (
 <td key={j} className="py-2 px-3 text-center">
 <span className={has ? "text-emerald-400" : "text-muted-foreground/50"}>{has ? "✓" : "—"}</span>
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CollapsibleCard>

 <CollapsibleCard
 title="FTX Collapse — Impact on Crypto Credit Ecosystem"
 icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
 defaultOpen={false}
 >
 <FtxImpactSVG />
 <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
 <div className="p-3 bg-red-500/5 border border-red-500/20 rounded space-y-1">
 <div className="font-medium text-red-300">Immediate Impact</div>
 <ul className="text-muted-foreground space-y-0.5">
 <li>• BlockFi files Chapter 11 (had FTX credit exposure)</li>
 <li>• Genesis halts withdrawals, later files for bankruptcy</li>
 <li>• Voyager Digital had already failed pre-FTX</li>
 <li>• ~$8B estimated institutional losses across ecosystem</li>
 </ul>
 </div>
 <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded space-y-1">
 <div className="font-medium text-emerald-300">Structural Changes Post-FTX</div>
 <ul className="text-muted-foreground space-y-0.5">
 <li>• Segregated custody became non-negotiable requirement</li>
 <li>• Proof-of-reserves audits now expected from all exchanges</li>
 <li>• Rehypothecation practices heavily scrutinized</li>
 <li>• Regulated custodians (Coinbase Prime, BNY Mellon Digital) gained share</li>
 </ul>
 </div>
 </div>
 </CollapsibleCard>

 <CollapsibleCard
 title="Crypto-Specific Risk Framework"
 icon={<Shield className="w-3.5 h-3.5 text-muted-foreground/50" />}
 defaultOpen={false}
 >
 <div className="space-y-3">
 {riskTypes.map((r, i) => (
 <div key={i} className="flex gap-3 text-xs text-muted-foreground">
 <div>
 <div className="text-foreground font-medium">{r.risk}</div>
 <div className="text-muted-foreground">{r.desc}</div>
 </div>
 </div>
 ))}
 </div>
 </CollapsibleCard>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: On-Chain Analytics
// ═══════════════════════════════════════════════════════════════════════════════

interface ResPoint {
 month: string;
 reserves: number;
}
const EXCHANGE_RESERVES: ResPoint[] = [
 { month: "Jan 22", reserves: 3200 },
 { month: "Apr 22", reserves: 2900 },
 { month: "Jul 22", reserves: 2700 },
 { month: "Oct 22", reserves: 2550 },
 { month: "Jan 23", reserves: 2400 },
 { month: "Apr 23", reserves: 2250 },
 { month: "Jul 23", reserves: 2200 },
 { month: "Oct 23", reserves: 2100 },
 { month: "Jan 24", reserves: 1950 },
 { month: "Apr 24", reserves: 1820 },
 { month: "Jul 24", reserves: 1780 },
 { month: "Oct 24", reserves: 1720 },
];

function ExchangeReservesChart() {
 const W = 480;
 const H = 160;
 const PAD = { l: 42, r: 16, t: 16, b: 28 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const minV = 1600;
 const maxV = 3400;
 const range = maxV - minV;
 const toX = (i: number) => PAD.l + (i / (EXCHANGE_RESERVES.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - ((v - minV) / range) * chartH;
 const pts = EXCHANGE_RESERVES.map((d, i) => `${toX(i)},${toY(d.reserves)}`).join("");
 const area = [
 `${toX(0)},${PAD.t + chartH}`,
 ...EXCHANGE_RESERVES.map((d, i) => `${toX(i)},${toY(d.reserves)}`),
 `${toX(EXCHANGE_RESERVES.length - 1)},${PAD.t + chartH}`,
 ].join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <defs>
 <linearGradient id="exGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
 <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {[1800, 2200, 2600, 3000].map((v) => (
 <line
 key={`exg-${v}`}
 x1={PAD.l}
 x2={W - PAD.r}
 y1={toY(v)}
 y2={toY(v)}
 stroke="#27272a"
 strokeWidth="1"
 />
 ))}
 {[1800, 2200, 2600, 3000].map((v) => (
 <text key={`exy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="8" textAnchor="end">
 {(v / 1000).toFixed(1)}k
 </text>
 ))}
 <polygon points={area} fill="url(#exGrad)" />
 <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
 {EXCHANGE_RESERVES.map((d, i) => (
 <circle key={`exd-${i}`} cx={toX(i)} cy={toY(d.reserves)} r="2.5" fill="#f59e0b" />
 ))}
 {EXCHANGE_RESERVES.filter((_, i) => i % 3 === 0).map((d, i) => (
 <text key={`exx-${i}`} x={toX(i * 3)} y={H - 8} fill="#71717a" fontSize="8" textAnchor="middle">
 {d.month}
 </text>
 ))}
 <text x={W - 20} y={toY(1720) - 8} fill="#22c55e" fontSize="8" textAnchor="end">
 Declining = Bullish
 </text>
 </svg>
 );
}

interface MvrvPoint {
 month: string;
 mvrv: number;
}
const MVRV_DATA: MvrvPoint[] = [
 { month: "Jan", mvrv: 0.8 },
 { month: "Feb", mvrv: 1.1 },
 { month: "Mar", mvrv: 1.4 },
 { month: "Apr", mvrv: 2.3 },
 { month: "May", mvrv: 3.1 },
 { month: "Jun", mvrv: 2.6 },
 { month: "Jul", mvrv: 2.0 },
 { month: "Aug", mvrv: 1.9 },
 { month: "Sep", mvrv: 2.2 },
 { month: "Oct", mvrv: 2.8 },
 { month: "Nov", mvrv: 3.6 },
 { month: "Dec", mvrv: 2.9 },
];

function MvrvChart() {
 const W = 480;
 const H = 160;
 const PAD = { l: 32, r: 16, t: 16, b: 28 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxV = 4.5;
 const toX = (i: number) => PAD.l + (i / (MVRV_DATA.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - (v / maxV) * chartH;
 const pts = MVRV_DATA.map((d, i) => `${toX(i)},${toY(d.mvrv)}`).join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <rect x={PAD.l} y={toY(1)} width={chartW} height={toY(0) - toY(1)} fill="#22c55e" fillOpacity="0.08" />
 <rect x={PAD.l} y={PAD.t} width={chartW} height={toY(3.5) - PAD.t} fill="#f87171" fillOpacity="0.08" />
 {([1, 2, 3, 3.5] as number[]).map((v) => (
 <g key={`mvg-${v}`}>
 <line
 x1={PAD.l}
 x2={W - PAD.r}
 y1={toY(v)}
 y2={toY(v)}
 stroke={v === 1 ? "#22c55e44" : v === 3.5 ? "#f8717144" : "#27272a"}
 strokeWidth="1"
 strokeDasharray={v === 1 || v === 3.5 ? "4,3" : undefined}
 />
 <text
 x={PAD.l - 4}
 y={toY(v) + 4}
 fill={v === 1 ? "#22c55e" : v === 3.5 ? "#f87171" : "#71717a"}
 fontSize="8"
 textAnchor="end"
 >
 {v}
 </text>
 </g>
 ))}
 <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
 {MVRV_DATA.map((d, i) => (
 <circle
 key={`mvd-${i}`}
 cx={toX(i)}
 cy={toY(d.mvrv)}
 r="3"
 fill={d.mvrv < 1 ? "#22c55e" : d.mvrv > 3.5 ? "#f87171" : "#6366f1"}
 />
 ))}
 {MVRV_DATA.map((d, i) => (
 <text key={`mvx-${i}`} x={toX(i)} y={H - 8} fill="#71717a" fontSize="8" textAnchor="middle">
 {d.month}
 </text>
 ))}
 <text x={W - 18} y={toY(3.5) - 4} fill="#f87171" fontSize="7.5" textAnchor="end">
 Overheated &gt;3.5
 </text>
 <text x={W - 18} y={toY(1) + 14} fill="#22c55e" fontSize="7.5" textAnchor="end">
 Undervalued &lt;1
 </text>
 </svg>
 );
}

const HODL_BANDS = [
 { label: "1d-1w", pct: 5, color: "#f87171" },
 { label: "1w-1m", pct: 8, color: "#fb923c" },
 { label: "1m-3m", pct: 10, color: "#f59e0b" },
 { label: "3m-6m", pct: 8, color: "#a3e635" },
 { label: "6m-1y", pct: 14, color: "#22c55e" },
 { label: "1y-2y", pct: 18, color: "#06b6d4" },
 { label: "2y-3y", pct: 12, color: "#6366f1" },
 { label: "3y-5y", pct: 13, color: "#8b5cf6" },
 { label: "5y+", pct: 12, color: "#a855f7" },
];

function HodlWavesSVG() {
 const W = 480;
 const H = 80;
 const total = HODL_BANDS.reduce((acc, b) => acc + b.pct, 0);
 const chartW = 450;
 let cx = 30;
 const bands = HODL_BANDS.map((band) => {
 const bw = (band.pct / total) * chartW;
 const result = { ...band, bw, cx };
 cx += bw;
 return result;
 });
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
 {bands.map((band) => (
 <g key={band.label}>
 <rect x={band.cx} y="10" width={band.bw} height="40" fill={band.color} fillOpacity="0.7" />
 {band.bw > 25 && (
 <text x={band.cx + band.bw / 2} y="35" fill="#fff" fontSize="7.5" textAnchor="middle">
 {band.label}
 </text>
 )}
 <text x={band.cx + band.bw / 2} y="65" fill={band.color} fontSize="7" textAnchor="middle">
 {band.pct}%
 </text>
 </g>
 ))}
 </svg>
 );
}

function Tab4OnchainContent() {
 const keyMetrics = [
 {
 metric: "Active Addresses",
 interpretation: "Daily/monthly active addresses. Rising = network adoption growing. BTC avg ~900K/day in 2024.",
 signal: "Rising trend bullish",
 color: "#22c55e",
 },
 {
 metric: "Exchange Reserve Flows",
 interpretation: "BTC moving to exchanges suggests selling intent. BTC leaving exchanges = self-custody = bullish.",
 signal: "Outflows = bullish",
 color: "#f59e0b",
 },
 {
 metric: "Miner Revenue",
 interpretation: "Miners are natural sellers. Post-halving revenue decline can signal selling pressure reduction.",
 signal: "Stable/rising = support",
 color: "#f87171",
 },
 {
 metric: "Funding Rate",
 interpretation: "Positive = longs pay shorts (bullish sentiment). Extremely positive = over-leveraged = risk of flush.",
 signal: "Extreme >0.1% = caution",
 color: "#a855f7",
 },
 {
 metric: "Stablecoin Supply Ratio (SSR)",
 interpretation: "Low SSR = large stablecoin buying power relative to BTC market cap = potential inflows.",
 signal: "Low SSR = bullish",
 color: "#06b6d4",
 },
 {
 metric: "OI vs Spot Ratio",
 interpretation: "High derivatives OI vs spot volume indicates leverage buildup = higher volatility risk.",
 signal: "High ratio = leverage risk",
 color: "#6366f1",
 },
 ];

 const platforms = [
 {
 name: "Glassnode",
 specialty: "Deepest BTC/ETH on-chain data, HODL waves, MVRV, realized cap metrics",
 tier: "Premium",
 color: "#6366f1",
 },
 {
 name: "CryptoQuant",
 specialty: "Exchange flows, miner data, funding rates, derivatives OI data",
 tier: "Premium",
 color: "#22c55e",
 },
 {
 name: "Nansen",
 specialty: "Smart money wallet tracking, NFT analytics, DeFi flows by entity label",
 tier: "Premium",
 color: "#f59e0b",
 },
 {
 name: "Dune Analytics",
 specialty: "SQL queries on raw blockchain data, community-built dashboards",
 tier: "Freemium",
 color: "#a855f7",
 },
 {
 name: "IntoTheBlock",
 specialty: "ML signals, IOMAP (in/out of money at price), network analysis",
 tier: "Premium",
 color: "#06b6d4",
 },
 {
 name: "DefiLlama",
 specialty: "TVL tracking across all DeFi protocols, free and fully open-source",
 tier: "Free",
 color: "#f87171",
 },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="BTC Exchange Reserves" value="1.72M" sub="Multi-year lows (Oct 24)" color="text-amber-400" />
 <StatChip label="Whale Wallets >1K BTC" value="~2,100" sub="Address count" color="text-indigo-400" />
 <StatChip label="MVRV Ratio (Oct 24)" value="2.4x" sub="Market / Realized cap" color="text-emerald-400" />
 <StatChip label="LTH Supply" value="70%+" sub="Long-term holders (>155d)" color="text-foreground" />
 </div>

 <CollapsibleCard
 title="Exchange Reserve Depletion — Multi-Year Bullish Signal"
 icon={<TrendingDown className="w-4 h-4 text-amber-400" />}
 >
 <ExchangeReservesChart />
 <p className="text-xs text-muted-foreground mt-2">
 Bitcoin exchange reserves have been in a multi-year decline as holders self-custody via hardware wallets
 and institutional custodians. Lower exchange-held supply reduces instant selling capacity. Glassnode data
 shows exchange reserves at lowest since 2017. Institutions buying via spot ETFs bypass exchanges entirely,
 accelerating the structural supply depletion trend.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="MVRV Ratio — Market vs Realized Cap Cycle Timing"
 icon={<Activity className="w-4 h-4 text-indigo-400" />}
 >
 <MvrvChart />
 <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
 <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
 <div className="font-medium text-emerald-300">MVRV &lt; 1 — Accumulation Zone</div>
 <div className="text-muted-foreground mt-1">
 Realized cap exceeds market cap, meaning the average holder is underwater. Historically excellent
 buying zone. Occurred in Dec 2018, Mar 2020, and late 2022.
 </div>
 </div>
 <div className="p-2 bg-red-500/5 border border-red-500/20 rounded">
 <div className="font-medium text-red-300">MVRV &gt; 3.5 — Distribution Risk</div>
 <div className="text-muted-foreground mt-1">
 Market cap is 3.5x realized cap — average holder has large unrealized gains and incentive to sell.
 BTC cycle peaks have historically occurred at MVRV of 3.5-4+.
 </div>
 </div>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Realized Cap aggregates the value of each BTC at the price it last moved on-chain — a proxy for the
 aggregate cost basis of all holders. MVRV = Market Cap / Realized Cap. Values above 2 signal caution
 and the ratio is one of the most reliable cycle timing tools in crypto.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="HODL Waves — Bitcoin Supply by Coin Age"
 icon={<Database className="w-3.5 h-3.5 text-muted-foreground/50" />}
 >
 <HodlWavesSVG />
 <p className="text-xs text-muted-foreground mt-2">
 HODL waves classify BTC supply by how long coins have been dormant. During bull markets, older coins
 (2y+) begin moving as long-term holders take profits — visible as old bands shrinking and young bands
 growing. Currently ~70%+ of supply has not moved in over one year, indicating strong conviction holding.
 This supply illiquidity is a structural price support factor.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Key On-Chain Metrics Reference"
 icon={<Eye className="w-3.5 h-3.5 text-muted-foreground/50" />}
 defaultOpen={false}
 >
 <div className="space-y-3">
 {keyMetrics.map((m, i) => (
 <div key={i} className="border border-border rounded p-3 space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-foreground">{m.metric}</span>
 <Badge
 className="text-xs text-muted-foreground ml-auto"
 style={{
 backgroundColor: `${m.color}22`,
 color: m.color,
 borderColor: `${m.color}44`,
 }}
 >
 {m.signal}
 </Badge>
 </div>
 <div className="text-xs text-muted-foreground">{m.interpretation}</div>
 </div>
 ))}
 </div>
 </CollapsibleCard>

 <CollapsibleCard
 title="On-Chain Analytics Platforms"
 icon={<Globe className="w-4 h-4 text-emerald-400" />}
 defaultOpen={false}
 >
 <div className="space-y-2">
 {platforms.map((p, i) => (
 <div key={i} className="flex gap-3 items-start text-xs text-muted-foreground border border-border rounded p-3">
 <div className="shrink-0">
 <Badge
 className="text-xs text-muted-foreground"
 style={{
 backgroundColor: `${p.color}22`,
 color: p.color,
 borderColor: `${p.color}44`,
 }}
 >
 {p.tier}
 </Badge>
 </div>
 <div>
 <div className="text-foreground font-medium">{p.name}</div>
 <div className="text-muted-foreground mt-0.5">{p.specialty}</div>
 </div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 On-chain analytics has matured into a distinct alternative data category. Institutional desks at
 Fidelity Digital Assets, Galaxy Digital, and major macro funds use Glassnode and CryptoQuant as standard
 tooling alongside traditional technical and fundamental analysis.
 </p>
 </CollapsibleCard>

 <CollapsibleCard
 title="Whale Wallet Tracking & Limitations"
 icon={<Lock className="w-4 h-4 text-amber-400" />}
 defaultOpen={false}
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
 <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded space-y-2">
 <div className="font-medium text-amber-300">1,000+ BTC Wallets (~2,100 addresses)</div>
 <ul className="text-muted-foreground space-y-1">
 <li>• Combined holdings represent ~40% of circulating BTC</li>
 <li>• Includes exchanges, custodians, ETF cold wallets</li>
 <li>• Accumulation by this cohort historically precedes rallies</li>
 <li>• Nansen &quot;smart money&quot; labels known institutional wallets</li>
 </ul>
 </div>
 <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded space-y-2">
 <div className="font-medium text-indigo-300">Limitations of Wallet Analysis</div>
 <ul className="text-muted-foreground space-y-1">
 <li>• Exchange wallets aggregate many users into one address</li>
 <li>• Entity clustering errors can misclassify wallets</li>
 <li>• Privacy tools (CoinJoin, Lightning) obscure flows</li>
 <li>• Institutional custodians use distributed cold wallet clusters</li>
 </ul>
 </div>
 </div>
 <div className="mt-3 p-3 bg-muted/10 border border-border rounded text-xs text-muted-foreground">
 <div className="font-medium text-foreground mb-1">Nansen Smart Money Labels</div>
 <div className="text-muted-foreground">
 Nansen&apos;s entity database labels ~200M wallets including exchanges, protocols, VC funds (a16z, Paradigm),
 and known traders. Tracking when labeled &quot;smart money&quot; wallets accumulate a token has predictive value —
 though front-running activity has reduced the edge over time as the approach became widely known.
 </div>
 </div>
 </CollapsibleCard>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CryptoInstitutionalPage() {
 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* HERO Header */}
 <div className="mb-6">
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Institutional Crypto</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">CUSTODY · PRIME · COMPLIANCE · SCALE</p>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="etfs">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger
 value="etfs"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 Bitcoin &amp; Ether ETFs
 </TabsTrigger>
 <TabsTrigger
 value="stablecoins"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 Stablecoin Ecosystem
 </TabsTrigger>
 <TabsTrigger
 value="prime"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 Crypto Prime Brokerage
 </TabsTrigger>
 <TabsTrigger
 value="onchain"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 On-Chain Analytics
 </TabsTrigger>
 </TabsList>

 <TabsContent value="etfs" className="mt-4">
 <Tab1EtfContent />
 </TabsContent>
 <TabsContent value="stablecoins" className="mt-4">
 <Tab2StablecoinContent />
 </TabsContent>
 <TabsContent value="prime" className="mt-4">
 <Tab3PrimeBrokerageContent />
 </TabsContent>
 <TabsContent value="onchain" className="mt-4">
 <Tab4OnchainContent />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
