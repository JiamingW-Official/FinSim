"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Activity,
  BarChart2,
  Layers,
  Shield,
  Zap,
  Clock,
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 941;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtPct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — MERGER ARBITRAGE
// ═══════════════════════════════════════════════════════════════════════════════

// Arb spread behavior over deal lifecycle
const ARB_SPREAD_DATA: { label: string; spread: number; note: string }[] = [
  { label: "Pre-Ann.", spread: 0, note: "No deal" },
  { label: "Announce", spread: 2.8, note: "Initial discount" },
  { label: "HSR Filed", spread: 2.1, note: "Narrowing" },
  { label: "DOJ/FTC", spread: 4.6, note: "Risk event" },
  { label: "CFIUS", spread: 3.8, note: "Widening risk" },
  { label: "Shareholder", spread: 1.9, note: "Vote pending" },
  { label: "Close", spread: 0, note: "Converge" },
];

function ArbSpreadChart() {
  const W = 500;
  const H = 160;
  const PAD = { l: 36, r: 16, t: 16, b: 40 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxSpread = 6;
  const toX = (i: number) => PAD.l + (i / (ARB_SPREAD_DATA.length - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / maxSpread) * chartH;
  const linePts = ARB_SPREAD_DATA.map((d, i) => `${toX(i)},${toY(d.spread)}`).join(" ");
  const areaPts = [
    `${toX(0)},${PAD.t + chartH}`,
    ...ARB_SPREAD_DATA.map((d, i) => `${toX(i)},${toY(d.spread)}`),
    `${toX(ARB_SPREAD_DATA.length - 1)},${PAD.t + chartH}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="arbGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 2, 4, 6].map((v) => (
        <line key={`ag-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {[0, 2, 4, 6].map((v) => (
        <text key={`ay-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
          {v}%
        </text>
      ))}
      <polygon points={areaPts} fill="url(#arbGrad)" />
      <polyline points={linePts} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" />
      {ARB_SPREAD_DATA.map((d, i) => (
        <circle key={`adc-${i}`} cx={toX(i)} cy={toY(d.spread)} r="3.5" fill={d.spread > 3.5 ? "#f87171" : "#818cf8"} />
      ))}
      {ARB_SPREAD_DATA.map((d, i) => (
        <text key={`axl-${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">
          {d.label}
        </text>
      ))}
      <text x={W / 2} y={14} fill="#52525b" fontSize="8" textAnchor="middle">
        Arb Spread (%) — widens on regulatory risk events
      </text>
    </svg>
  );
}

interface DealRow {
  target: string;
  acquirer: string;
  dealPrice: number;
  currentPrice: number;
  dealType: string;
  breakProb: number;
  status: string;
}

const DEAL_TABLE: DealRow[] = [
  { target: "Activision", acquirer: "Microsoft", dealPrice: 95.0, currentPrice: 93.2, dealType: "Cash", breakProb: 8, status: "Closed" },
  { target: "Figma", acquirer: "Adobe", dealPrice: 200, currentPrice: 160, dealType: "Cash+Stock", breakProb: 55, status: "Terminated" },
  { target: "Hess", acquirer: "Chevron", dealPrice: 171, currentPrice: 166.4, dealType: "Stock", breakProb: 12, status: "Pending" },
  { target: "Spirit", acquirer: "Frontier", dealPrice: 25.83, currentPrice: 22.1, dealType: "Cash+Stock", breakProb: 28, status: "Terminated" },
  { target: "US Foods", acquirer: "Sysco", dealPrice: 33, currentPrice: 29.5, dealType: "Cash", breakProb: 35, status: "Terminated" },
];

interface RiskFactor {
  name: string;
  description: string;
  severity: "high" | "medium" | "low";
}

const RISK_FACTORS: RiskFactor[] = [
  { name: "Regulatory / Antitrust", description: "DOJ, FTC, EU EC, CFIUS review — has increased 2022–2024", severity: "high" },
  { name: "Financing Risk", description: "LBO deals contingent on debt markets; MAC clause if markets deteriorate", severity: "high" },
  { name: "Material Adverse Change", description: "Target operationally deteriorates post-signing, acquirer can walk", severity: "medium" },
  { name: "Shareholder Vote", description: "Target or acquirer shareholders reject deal (<5% of cash deals break here)", severity: "medium" },
  { name: "Counter-bid / Topping Offer", description: "Third party emerges, current arb spread widens, deal price rises", severity: "low" },
];

const severityColor = (s: RiskFactor["severity"]) =>
  s === "high" ? "bg-red-900/40 text-red-300 border border-red-800" :
  s === "medium" ? "bg-amber-900/40 text-amber-300 border border-amber-800" :
  "bg-emerald-900/40 text-emerald-300 border border-emerald-800";

function MergerArbitrageTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Historical Completion Rate", value: "95.1%", color: "text-emerald-400" },
          { label: "Avg. Deal Duration", value: "6–9 mo", color: "text-indigo-400" },
          { label: "Avg. Annualized Return", value: "8–12%", color: "text-sky-400" },
          { label: "2022–24 Break Rate", value: "~7%", color: "text-amber-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Arb formula */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-400" />
            Arb Spread & Expected Value Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/60 p-4 font-mono text-sm space-y-2">
            <p className="text-indigo-300">Gross Spread = Deal Price − Current Price</p>
            <p className="text-indigo-300">Annualized Return = (Gross Spread / Current Price) × (365 / Days to Close)</p>
            <p className="text-amber-300 mt-2">EV = (p × Gross Spread) − ((1−p) × Break Loss)</p>
            <p className="text-muted-foreground text-xs mt-1">where p = deal completion probability, Break Loss = Current − Unaffected Price</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Example Calculation</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Deal Price:</span> <span className="text-foreground">$50.00</span></div>
              <div><span className="text-muted-foreground">Current Price:</span> <span className="text-foreground">$48.50</span></div>
              <div><span className="text-muted-foreground">Gross Spread:</span> <span className="text-emerald-400">$1.50 (3.1%)</span></div>
              <div><span className="text-muted-foreground">Days to Close:</span> <span className="text-foreground">120</span></div>
              <div><span className="text-muted-foreground">Annualized Return:</span> <span className="text-emerald-400">9.4%</span></div>
              <div><span className="text-muted-foreground">Break Loss (unaffected $38):</span> <span className="text-red-400">−$10.50</span></div>
              <div><span className="text-muted-foreground">Completion Prob:</span> <span className="text-foreground">92%</span></div>
              <div><span className="text-muted-foreground">EV per Share:</span> <span className="text-emerald-400">$0.54</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arb spread chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Arb Spread Behavior — Deal Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ArbSpreadChart />
          <p className="text-xs text-muted-foreground mt-2">
            Spreads narrow post-announcement as deal certainty rises, widen on regulatory risk events (DOJ/CFIUS), then converge to zero at close.
          </p>
        </CardContent>
      </Card>

      {/* Cash vs Stock deal treatment */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Deal Structure Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              type: "Cash Deal",
              color: "text-emerald-400",
              desc: "Fixed dollar amount per share. Arb risk is pure deal completion. No acquirer stock risk. Most common for smaller deals.",
              mechanics: "Buy target at discount to deal price. P&L = spread if deal closes; large loss if deal breaks.",
            },
            {
              type: "Stock Deal",
              color: "text-sky-400",
              desc: "Fixed exchange ratio: X acquirer shares per target share. Arb must hedge acquirer exposure by shorting acquirer stock.",
              mechanics: "Long target + short acquirer at ratio. Spread = target implied value − deal value. Both legs move with market.",
            },
            {
              type: "Collar Deal",
              color: "text-amber-400",
              desc: "Exchange ratio floats within a price collar. If acquirer stock stays in collar, fixed ratio applies; outside collar, consideration adjusts.",
              mechanics: "Complex payoff: analyze floor/cap bands. Typically more arb spread than pure cash or stock deals.",
            },
            {
              type: "Cash + Stock (Mixed)",
              color: "text-primary",
              desc: "Target holders receive part cash, part stock. Hedge stock component proportionally. CVRs may be issued for contingent payments.",
              mechanics: "Allocate capital proportionally. Consider CVR value independently (binary outcomes, milestone-based).",
            },
          ].map((d) => (
            <div key={d.type} className="rounded-lg bg-muted/60 p-3">
              <p className={cn("text-sm font-semibold mb-1", d.color)}>{d.type}</p>
              <p className="text-xs text-muted-foreground mb-1">{d.desc}</p>
              <p className="text-xs text-muted-foreground italic">{d.mechanics}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk factors */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Deal Break Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RISK_FACTORS.map((rf, i) => (
            <motion.div key={rf.name} className="rounded-lg bg-muted/40 p-3 cursor-pointer"
              onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", severityColor(rf.severity))}>
                    {rf.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-foreground">{rf.name}</span>
                </div>
                {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
              <AnimatePresence>
                {expanded === i && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="text-xs text-muted-foreground mt-2 overflow-hidden">
                    {rf.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Deal table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Notable M&A Deals 2022–2024 (Illustrative)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Target", "Acquirer", "Deal $", "Mkt $", "Type", "Break %", "Outcome"].map((h) => (
                    <th key={h} className="text-left text-muted-foreground pb-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {DEAL_TABLE.map((row) => (
                    <tr key={row.target} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 pr-3 text-foreground font-medium">{row.target}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.acquirer}</td>
                      <td className="py-2 pr-3 text-foreground">${row.dealPrice}</td>
                      <td className="py-2 pr-3 text-foreground">${row.currentPrice}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.dealType}</td>
                      <td className={cn("py-2 pr-3", row.breakProb > 30 ? "text-red-400" : "text-amber-400")}>{row.breakProb}%</td>
                      <td className="py-2 pr-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs",
                          row.status === "Closed" ? "bg-emerald-900/40 text-emerald-300" :
                          row.status === "Terminated" ? "bg-red-900/40 text-red-300" :
                          "bg-amber-900/40 text-amber-300")}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2022-2024 regulatory environment */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            2022–2024 Regulatory Environment Shift
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "FTC and DOJ adopted aggressive posture under Lina Khan and Jonathan Kanter, challenging deals previously considered routine.",
            "Multiple high-profile deal abandonments: Adobe/Figma ($20B), NVIDIA/ARM ($40B), JetBlue/Spirit — regulators prevailed.",
            "CFIUS scrutiny expanded to technology, semiconductors, biotech deals involving non-US acquirers.",
            "EU EC also blocked several mega-deals and imposed unprecedented remedies (Booking/eTraveli rejected).",
            "Arb community priced wider spreads across entire deal pipeline, raising cost of deal uncertainty (+1–2% average spread widening).",
          ].map((pt, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">{pt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — ACTIVISM & SPECIAL SITUATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function ActivistPlaybookSVG() {
  const steps = [
    { label: "Build 5%+\nStake", color: "#6366f1" },
    { label: "13D\nFiling", color: "#8b5cf6" },
    { label: "Public\nDemands", color: "#a855f7" },
    { label: "Proxy\nContest", color: "#f59e0b" },
    { label: "Settlement\n/ Win", color: "#34d399" },
  ];
  const W = 500;
  const H = 110;
  const boxW = 74;
  const boxH = 44;
  const gap = (W - steps.length * boxW) / (steps.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
      <defs>
        {steps.map((_, i) => (
          <marker key={`apa-${i}`} id={`apA${i}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={steps[i + 1]?.color ?? "#34d399"} />
          </marker>
        ))}
      </defs>
      {steps.map((st, i) => {
        const x = gap + i * (boxW + gap);
        const y = (H - boxH) / 2;
        const lines = st.label.split("\n");
        return (
          <g key={`apg-${i}`}>
            <rect x={x} y={y} width={boxW} height={boxH} rx="6" fill="#18181b" stroke={st.color} strokeWidth="1.5" />
            {lines.map((ln, li) => (
              <text key={`apl-${i}-${li}`} x={x + boxW / 2} y={y + boxH / 2 - 5 + li * 14} fill={st.color}
                fontSize="9" textAnchor="middle" fontWeight="bold">{ln}</text>
            ))}
            {i < steps.length - 1 && (
              <line
                x1={x + boxW} y1={H / 2} x2={x + boxW + gap}
                y2={H / 2} stroke={steps[i + 1].color} strokeWidth="1.5"
                markerEnd={`url(#apA${i})`} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

interface ActivistFund {
  name: string;
  aum: string;
  style: string;
  wins: string;
  notable: string;
}

const ACTIVIST_FUNDS: ActivistFund[] = [
  { name: "Elliott Management", aum: "$65B+", style: "Aggressive / Multi-asset", wins: "AT&T, Salesforce, Twitter/X", notable: "Paul Singer; often targets underperformers; runs proxy fights" },
  { name: "Starboard Value", aum: "$7B", style: "Operational activism", wins: "AOL, Papa John's, Darden", notable: "Jeff Smith; focuses on operational improvement, board replacement" },
  { name: "Icahn Enterprises", aum: "$~7B", style: "Corporate governance", wins: "Apple buybacks, Dell, Herbalife", notable: "Carl Icahn; uses media extensively; board seats key" },
  { name: "ValueAct Capital", aum: "$14B", style: "Collaborative / Quiet", wins: "Microsoft, Seagen, Disney", notable: "Mason Morfit; prefers board seat to public campaign" },
];

const VALUE_LEVERS = [
  { icon: DollarSign, label: "Share Buybacks", desc: "Return excess capital; EPS accretive if ROE > cost of equity" },
  { icon: Layers, label: "Divestitures", desc: "Sell non-core units; eliminate conglomerate discount; use proceeds for buybacks" },
  { icon: TrendingDown, label: "Cost Reduction", desc: "Headcount, real estate, vendor renegotiation; improve operating margins" },
  { icon: Users, label: "CEO / Board Change", desc: "Replace underperforming management; install value-focused board members" },
  { icon: ArrowRight, label: "Spin-off / Carve-out", desc: "Separate business units to unlock focus premium and standalone valuation" },
  { icon: Target, label: "Strategic Review / Sale", desc: "Put company in play; invite competing bids; maximize takeover premium" },
];

const POISON_PILL_DEFENSES = [
  { name: "Shareholder Rights Plan (Poison Pill)", desc: "Allows existing shareholders to buy discounted shares if anyone acquires >15–20%; dilutes hostile acquirer" },
  { name: "Staggered Board", desc: "Only 1/3 of board elected each year; takes 2–3 years to gain full control via proxy contest" },
  { name: "White Knight", desc: "Invite a friendly acquirer at higher price to outbid hostile raider" },
  { name: "Golden Parachute", desc: "Expensive change-of-control payments make acquisition more costly for raider" },
  { name: "Pac-Man Defense", desc: "Target turns around and bids for the acquirer; rare but occasionally effective" },
];

function ActivismTab() {
  const [showFunds, setShowFunds] = useState(false);

  return (
    <div className="space-y-6">
      {/* Playbook SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Activist Investor Playbook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivistPlaybookSVG />
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            <p><span className="text-primary font-medium">13D filing:</span> Required within 10 days of crossing 5% beneficial ownership threshold; discloses intent (Schedule 13D for active intent vs 13G for passive).</p>
            <p><span className="text-amber-300 font-medium">Wolf pack tactics:</span> Multiple funds coordinate near-simultaneously without formal agreement; each stays below 5% to delay disclosure.</p>
            <p><span className="text-emerald-300 font-medium">Settlement rate:</span> ~70% of campaigns settle before annual meeting; board seats granted without full proxy fight.</p>
          </div>
        </CardContent>
      </Card>

      {/* Value creation levers */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Value Creation Levers
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VALUE_LEVERS.map((lv) => (
            <div key={lv.label} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <lv.icon className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">{lv.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{lv.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activist funds */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowFunds(!showFunds)}>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Major Activist Hedge Funds
            </span>
            {showFunds ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {showFunds && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <CardContent className="space-y-3">
                {ACTIVIST_FUNDS.map((f) => (
                  <div key={f.name} className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">{f.name}</p>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">{f.aum}</Badge>
                    </div>
                    <p className="text-xs text-indigo-300 mb-1">{f.style}</p>
                    <p className="text-xs text-muted-foreground mb-1"><span className="text-muted-foreground">Notable wins: </span>{f.wins}</p>
                    <p className="text-xs text-muted-foreground italic">{f.notable}</p>
                  </div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Rights offerings */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            Rights Offerings & Dutch Tender Mechanics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-sky-300 mb-2">Rights Offering</p>
            <p className="text-xs text-muted-foreground">Company offers existing shareholders right to buy new shares at discount (typ. 15–25%) to market price. Non-transferable (basic) or tradeable (renounceable). Theoretical ex-rights price (TERP) = (Shares × Price + New Shares × Offer Price) / Total Shares.</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-amber-300 mb-2">Dutch Auction Tender</p>
            <p className="text-xs text-muted-foreground">Company specifies range (e.g., $45–$50). Shareholders tender shares at price they will accept. Company buys at lowest clearing price that lets it purchase target quantity. All successful tenderers receive the same clearing price. Favors price discovery over fixed-price tender.</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-primary mb-2">Odd-Lot Tender Premium</p>
            <p className="text-xs text-muted-foreground">Shareholders with fewer than 100 shares (odd lots) often get priority or slight premium in tender offers. Retail arb: buy &lt;100 share lots to participate without proration — especially valuable in heavily oversubscribed deals.</p>
          </div>
        </CardContent>
      </Card>

      {/* Poison pill defenses */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            Takeover Defenses (Activist Defense Checklist)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {POISON_PILL_DEFENSES.map((d) => (
            <div key={d.name} className="flex items-start gap-2 rounded-lg bg-muted/40 p-2">
              <Shield className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — SPIN-OFFS & CORPORATE ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function SpinoffComparisonSVG() {
  const types = [
    {
      name: "Spin-off",
      color: "#6366f1",
      steps: ["Parent distributes\nshares pro-rata", "Tax-free under\nIRC §355", "Parent retains\nno stake"],
    },
    {
      name: "Split-off",
      color: "#f59e0b",
      steps: ["Shareholders\nexchange parent", "for subsidiary\nshares", "Reduces parent\nshare count"],
    },
    {
      name: "Carve-out (IPO)",
      color: "#34d399",
      steps: ["IPO of minority\nstake to public", "Parent retains\nmajority control", "Cash proceeds\nto parent"],
    },
  ];
  const W = 500;
  const H = 160;
  const colW = W / 3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {types.map((t, ci) => {
        const cx = ci * colW + colW / 2;
        return (
          <g key={`sc-${ci}`}>
            <rect x={ci * colW + 6} y={4} width={colW - 12} height={H - 8} rx="8"
              fill="#18181b" stroke={t.color} strokeWidth="1.5" strokeOpacity="0.6" />
            <text x={cx} y={24} fill={t.color} fontSize="11" textAnchor="middle" fontWeight="bold">{t.name}</text>
            {t.steps.map((step, si) => {
              const lines = step.split("\n");
              const y0 = 48 + si * 38;
              return (
                <g key={`scs-${ci}-${si}`}>
                  {lines.map((ln, li) => (
                    <text key={`scl-${ci}-${si}-${li}`} x={cx} y={y0 + li * 12} fill="#a1a1aa" fontSize="8.5" textAnchor="middle">{ln}</text>
                  ))}
                  {si < t.steps.length - 1 && (
                    <line x1={cx} y1={y0 + 18} x2={cx} y2={y0 + 26} stroke={t.color} strokeWidth="1" strokeOpacity="0.5" />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// Post-spin performance data (illustrative)
const SPIN_PERF_DATA: { name: string; parentReturn: number; spinReturn: number; year: number }[] = [
  { name: "GE / GE HealthCare", parentReturn: 28, spinReturn: 42, year: 2023 },
  { name: "J&J / Kenvue", parentReturn: 4, spinReturn: -12, year: 2023 },
  { name: "IBM / Kyndryl", parentReturn: 8, spinReturn: -55, year: 2022 },
  { name: "Honeywell / Resideo", parentReturn: -3, spinReturn: -32, year: 2019 },
  { name: "eBay / PayPal", parentReturn: 12, spinReturn: 105, year: 2016 },
  { name: "Hewlett-Packard Split", parentReturn: 22, spinReturn: 44, year: 2016 },
];

function SpinoffPerfChart() {
  const W = 480;
  const H = 180;
  const PAD = { l: 100, r: 20, t: 16, b: 24 };
  const chartW = W - PAD.l - PAD.r;
  const barH = 14;
  const rowH = (H - PAD.t - PAD.b) / SPIN_PERF_DATA.length;
  const minV = -60;
  const maxV = 120;
  const range = maxV - minV;
  const zero = PAD.l + (-minV / range) * chartW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      <line x1={zero} y1={PAD.t} x2={zero} y2={H - PAD.b} stroke="#3f3f46" strokeWidth="1" />
      {[-50, 0, 50, 100].map((v) => {
        const x = PAD.l + ((v - minV) / range) * chartW;
        return (
          <g key={`spg-${v}`}>
            <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
            <text x={x} y={H - PAD.b + 12} fill="#71717a" fontSize="8" textAnchor="middle">{v}%</text>
          </g>
        );
      })}
      {SPIN_PERF_DATA.map((d, i) => {
        const y = PAD.t + i * rowH;
        const pW = (Math.abs(d.parentReturn) / range) * chartW;
        const sW = (Math.abs(d.spinReturn) / range) * chartW;
        const pX = d.parentReturn >= 0 ? zero : zero - pW;
        const sX = d.spinReturn >= 0 ? zero : zero - sW;
        return (
          <g key={`sp-${i}`}>
            <text x={PAD.l - 4} y={y + rowH / 2 + 2} fill="#a1a1aa" fontSize="7.5" textAnchor="end">{d.name}</text>
            <rect x={pX} y={y + rowH / 2 - barH} width={pW} height={barH - 2} rx="2" fill={d.parentReturn >= 0 ? "#4f46e5" : "#7f1d1d"} opacity="0.7" />
            <rect x={sX} y={y + rowH / 2} width={sW} height={barH - 2} rx="2" fill={d.spinReturn >= 0 ? "#059669" : "#991b1b"} opacity="0.8" />
          </g>
        );
      })}
      <rect x={PAD.l + 4} y={H - PAD.b - 28} width={10} height={8} rx="2" fill="#4f46e5" opacity="0.7" />
      <text x={PAD.l + 18} y={H - PAD.b - 22} fill="#a1a1aa" fontSize="8">Parent (1Y post-spin)</text>
      <rect x={PAD.l + 110} y={H - PAD.b - 28} width={10} height={8} rx="2" fill="#059669" opacity="0.8" />
      <text x={PAD.l + 124} y={H - PAD.b - 22} fill="#a1a1aa" fontSize="8">SpinCo (1Y post-spin)</text>
    </svg>
  );
}

function SpinoffsTab() {
  return (
    <div className="space-y-6">
      {/* Comparison SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Spin-off vs Split-off vs Carve-out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpinoffComparisonSVG />
        </CardContent>
      </Card>

      {/* Value creation */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            When Do Spin-offs Create Value?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { title: "Conglomerate Discount Elimination", desc: "Multi-business parents often trade at 10–20% discount to sum-of-parts; spinning creates standalone valuations at sector multiples." },
            { title: "Management Focus Premium", desc: "SpinCo management aligns incentives with single business; parent management freed to focus on core — both benefit." },
            { title: "Index Inclusion", desc: "SpinCo added to relevant sector indices creates forced buying from passive funds (often within 1–3 months post-spin)." },
            { title: "Separate Capital Allocation", desc: "SpinCo can pursue acquisitions or capex independent of parent's conservatism; access own debt markets at appropriate leverage." },
            { title: "Tax-Free to Shareholders", desc: "IRC §355 allows tax-free distribution if company holds SpinCo ≥5 years post-spin; no capital gains on distribution." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Form 10-12B timeline */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Spin-off Execution Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { phase: "Announcement", time: "Day 0", desc: "Board approves spin; Form 8-K filed; investor day outlining rationale" },
              { phase: "SEC Form 10-12B", time: "Month 1–3", desc: "SpinCo registration statement; audited financials, management discussion, pro-forma balance sheet" },
              { phase: "SEC Review / Comments", time: "Month 3–5", desc: "SEC comment letters; SpinCo amends filing; typically 2–4 rounds of comments" },
              { phase: "Record Date Set", time: "Month 5–6", desc: "Board declares record date; shareholders on record receive SpinCo shares" },
              { phase: "When-Issued Trading", time: "~2 weeks pre-spin", desc: "WI shares trade conditionally; price discovery before full distribution" },
              { phase: "Distribution / Ex-Date", time: "Day 0 (SpinCo)", desc: "SpinCo shares distributed; parent stock adjusts downward by SpinCo value" },
              { phase: "Post-Spin Selling Pressure", time: "Weeks 1–8", desc: "Index funds, parent shareholders not wanting SpinCo exposure sell; creates buying opportunity" },
            ].map((ph) => (
              <div key={ph.phase} className="flex items-start gap-3">
                <div className="w-20 flex-shrink-0">
                  <span className="text-xs text-amber-400 font-medium">{ph.time}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{ph.phase}</p>
                  <p className="text-xs text-muted-foreground">{ph.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            Post-Spin Performance (Illustrative 1-Year Returns)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpinoffPerfChart />
          <p className="text-xs text-muted-foreground mt-2">Academically, spin-offs have outperformed parents by 5–10% on average in year 1, though high variance. Forced selling by index funds post-distribution creates entry opportunities.</p>
        </CardContent>
      </Card>

      {/* Morris Trust */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Morris Trust & Reverse Morris Trust
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-primary mb-1">Morris Trust</p>
            <p className="text-xs text-muted-foreground">Parent spins off unwanted subsidiary tax-free, then the subsidiary merges with an acquirer. The parent's shareholders must receive ≥50% of the combined entity. Used to divest divisions without triggering gain on sale.</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-indigo-300 mb-1">Reverse Morris Trust</p>
            <p className="text-xs text-muted-foreground">The acquirer is the SpinCo in a Reverse Morris Trust — the buyer merges with the spun-off entity and the target company's shareholders own &lt;50%. Allows buyer to acquire a business tax-free by pairing acquisition with target's spin-off.</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-amber-300 mb-1">Insider Selling Post-Spin</p>
            <p className="text-xs text-muted-foreground">Officers and directors often receive SpinCo grants aligned to parent tenure. Many sell immediately post-distribution (restricted window opens). Monitor 144/4 filings in first 90 days; heavy insider selling can signal weak SpinCo fundamentals.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — DISTRESSED EVENTS & SPACs
// ═══════════════════════════════════════════════════════════════════════════════

function SPACLifecycleSVG() {
  const stages = [
    { label: "SPAC IPO\n(Blank Check)", color: "#6366f1", sub: "Trust ~$200M" },
    { label: "Search\nPeriod", color: "#8b5cf6", sub: "18–24 mo" },
    { label: "DA\nAnnounced", color: "#a855f7", sub: "Target found" },
    { label: "Shareholder\nVote", color: "#f59e0b", sub: "Redeem or hold" },
    { label: "De-SPAC\nClose", color: "#34d399", sub: "Combined Co." },
  ];
  const W = 500;
  const H = 120;
  const boxW = 78;
  const boxH = 56;
  const gap = (W - stages.length * boxW) / (stages.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      <defs>
        {stages.map((_, i) => (
          <marker key={`spa-${i}`} id={`spA${i}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={stages[Math.min(i + 1, stages.length - 1)].color} />
          </marker>
        ))}
      </defs>
      {stages.map((st, i) => {
        const x = gap + i * (boxW + gap);
        const y = (H - boxH) / 2;
        const lines = st.label.split("\n");
        return (
          <g key={`spg-${i}`}>
            <rect x={x} y={y} width={boxW} height={boxH} rx="6" fill="#18181b" stroke={st.color} strokeWidth="1.5" />
            {lines.map((ln, li) => (
              <text key={`spl-${i}-${li}`} x={x + boxW / 2} y={y + 18 + li * 13} fill={st.color}
                fontSize="9" textAnchor="middle" fontWeight="bold">{ln}</text>
            ))}
            <text x={x + boxW / 2} y={y + boxH - 8} fill="#71717a" fontSize="7.5" textAnchor="middle">{st.sub}</text>
            {i < stages.length - 1 && (
              <line x1={x + boxW} y1={H / 2} x2={x + boxW + gap} y2={H / 2}
                stroke={stages[i + 1].color} strokeWidth="1.5" markerEnd={`url(#spA${i})`} />
            )}
          </g>
        );
      })}
      {/* Redemption branch */}
      <text x={W - 40} y={H - 6} fill="#f87171" fontSize="7.5" textAnchor="middle">or Redeem</text>
      <text x={W - 40} y={H - 16} fill="#f87171" fontSize="7.5" textAnchor="middle">@ Trust NAV</text>
    </svg>
  );
}

function DistressedTimelineSVG() {
  const events = [
    { label: "Liquidity\nCrisis", color: "#f87171", x: 30 },
    { label: "Credit\nDefault", color: "#fb923c", x: 110 },
    { label: "Ch.11\nFiling", color: "#fbbf24", x: 190 },
    { label: "Plan of\nReorg.", color: "#a3e635", x: 280 },
    { label: "Emergence\n/ Liquidation", color: "#34d399", x: 380 },
  ];
  const W = 490;
  const H = 110;
  const lineY = 55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
      <line x1={20} y1={lineY} x2={W - 10} y2={lineY} stroke="#3f3f46" strokeWidth="2" />
      {events.map((ev, i) => {
        const lines = ev.label.split("\n");
        const above = i % 2 === 0;
        return (
          <g key={`dev-${i}`}>
            <circle cx={ev.x} cy={lineY} r="5" fill={ev.color} />
            {lines.map((ln, li) => (
              <text key={`devl-${i}-${li}`} x={ev.x} y={above ? lineY - 18 + li * 12 : lineY + 20 + li * 12}
                fill={ev.color} fontSize="8.5" textAnchor="middle" fontWeight="bold">{ln}</text>
            ))}
          </g>
        );
      })}
      <text x={W / 2} y={H - 4} fill="#52525b" fontSize="7.5" textAnchor="middle">
        Equity typically zero in plan; distressed debt → fulcrum security
      </text>
    </svg>
  );
}

const SPAC_PERF_DATA: { era: string; count: number; avgReturn: number; note: string }[] = [
  { era: "2019", count: 59, avgReturn: 18, note: "Pre-boom, smaller deals, curated targets" },
  { era: "2020", count: 248, avgReturn: 12, note: "Boom begins; ZIRP, retail frenzy" },
  { era: "2021", count: 613, avgReturn: -24, note: "Peak frenzy; oversaturation; poor targets" },
  { era: "2022", count: 86, avgReturn: -38, note: "Rate hikes; bust begins; redemptions surge" },
  { era: "2023", count: 31, avgReturn: -31, note: "SEC SPAC rules 2024 rule proposal dampens" },
];

function SPACReturnChart() {
  const W = 460;
  const H = 160;
  const PAD = { l: 40, r: 16, t: 16, b: 28 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const minV = -45;
  const maxV = 25;
  const range = maxV - minV;
  const zeroY = PAD.t + ((maxV) / range) * chartH;
  const barW = chartW / SPAC_PERF_DATA.length - 8;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {[-40, -20, 0, 20].map((v) => {
        const y = PAD.t + ((maxV - v) / range) * chartH;
        return (
          <g key={`spcg-${v}`}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={v === 0 ? "#52525b" : "#27272a"} strokeWidth={v === 0 ? 1.5 : 1} />
            <text x={PAD.l - 4} y={y + 4} fill="#71717a" fontSize="9" textAnchor="end">{v}%</text>
          </g>
        );
      })}
      {SPAC_PERF_DATA.map((d, i) => {
        const x = PAD.l + i * (chartW / SPAC_PERF_DATA.length) + 4;
        const barH = Math.abs(d.avgReturn / range) * chartH;
        const barY = d.avgReturn >= 0 ? zeroY - barH : zeroY;
        const color = d.avgReturn >= 0 ? "#4ade80" : "#f87171";
        return (
          <g key={`spcb-${i}`}>
            <rect x={x} y={barY} width={barW} height={barH} rx="3" fill={color} opacity="0.8" />
            <text x={x + barW / 2} y={H - 4} fill="#71717a" fontSize="8.5" textAnchor="middle">{d.era}</text>
            <text x={x + barW / 2} y={d.avgReturn >= 0 ? barY - 3 : barY + barH + 10} fill={color}
              fontSize="8" textAnchor="middle" fontWeight="bold">{d.avgReturn}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function DistressedSPACTab() {
  const [showRegs, setShowRegs] = useState(false);

  return (
    <div className="space-y-6">
      {/* Distressed timeline */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Credit Event / Bankruptcy Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DistressedTimelineSVG />
          <div className="mt-3 space-y-2">
            {[
              { term: "Fulcrum Security", desc: "The security class that receives equity in reorganization — neither paid in full nor wiped out; typically where new equity is issued." },
              { term: "Equity Stub Trading", desc: "Post-petition equity can trade as a lottery ticket if plan shows excess value; historically >90% of Chapter 11 equities go to zero in the plan." },
              { term: "DIP Financing", desc: "Debtor-in-possession lenders get super-priority claim; high yield to compensate for risk; often a form of loan-to-own strategy." },
              { term: "Cramdown", desc: "Court confirms plan over objection of a class; senior creditors can cram down junior classes as long as plan is fair and equitable." },
            ].map((item) => (
              <div key={item.term} className="rounded-lg bg-muted/40 p-2">
                <p className="text-xs font-semibold text-foreground">{item.term}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SPAC lifecycle */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            SPAC Lifecycle & Arbitrage Mechanics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SPACLifecycleSVG />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              {
                label: "Downside Protection",
                color: "text-emerald-400",
                desc: "Trust NAV (typically $10.00/share) redeemable if you vote against deal or no deal found within deadline. Near risk-free if bought at or below $10.",
              },
              {
                label: "Upside from Warrants",
                color: "text-sky-400",
                desc: "Units contain warrants (1/2 or 1 warrant/unit) exercisable post-merger at $11.50. Potential asymmetric upside on good deal.",
              },
              {
                label: "Extension Votes",
                color: "text-amber-400",
                desc: "If no DA in time, sponsor can extend (often pays ~$0.033–0.10/share into trust per extension). Arbitrageurs earn extra return while waiting.",
              },
              {
                label: "Redemption Dynamics",
                color: "text-primary",
                desc: "In 2021–22, many SPAC shareholders redeemed 80–95% of shares at trust NAV before vote; sponsors unable to fund de-SPAC without PIPE financing.",
              },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/50 p-3">
                <p className={cn("text-xs font-semibold mb-1", m.color)}>{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SPAC performance */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            SPAC Post-Merger Average Returns by Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SPACReturnChart />
          <div className="mt-3 space-y-1">
            {SPAC_PERF_DATA.map((d) => (
              <div key={d.era} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8">{d.era}</span>
                <span className="text-xs text-muted-foreground">({d.count} deals)</span>
                <span className={cn("text-xs font-medium ml-auto", d.avgReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {fmtPct(d.avgReturn)}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">{d.note}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* De-SPAC vs IPO */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            De-SPAC vs Traditional IPO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground pb-2 pr-4">Dimension</th>
                  <th className="text-left text-muted-foreground pb-2 pr-4">De-SPAC</th>
                  <th className="text-left text-muted-foreground pb-2">Traditional IPO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[
                  ["Timeline", "3–5 months post-DA", "12–18 months"],
                  ["Projections", "Forward guidance allowed (PSLRA safe harbor*)", "No projections in S-1"],
                  ["Price certainty", "Negotiated with target", "Book-build risk"],
                  ["Regulatory scrutiny", "High (post-2021 SEC focus)", "Standard"],
                  ["Dilution", "Sponsor promotes (20% founder shares)", "Underwriter discount (5–7%)"],
                  ["Lock-up", "Typically 6 months", "180 days standard"],
                  ["Average post-deal return", "−30% (2020–2024)", "+5% first day"],
                ].map(([dim, spac, ipo]) => (
                  <tr key={dim} className="hover:bg-muted/20">
                    <td className="py-2 pr-4 text-muted-foreground font-medium">{dim}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{spac}</td>
                    <td className="py-2 text-muted-foreground">{ipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">*PSLRA safe harbor for projections was removed by SEC SPAC rules 2024 for de-SPAC transactions.</p>
        </CardContent>
      </Card>

      {/* SEC 2024 rules */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowRegs(!showRegs)}>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              SEC Blank Check Regulations (2024 SPAC Rules)
            </span>
            {showRegs ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {showRegs && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <CardContent className="space-y-2">
                {[
                  "De-SPAC transactions now classified as registered offerings — target company becomes a co-registrant on Form S-4/F-4.",
                  "Removed PSLRA safe harbor for projections in de-SPAC transactions; forward guidance subject to fraud liability.",
                  "Enhanced disclosures required: sponsor compensation, conflicts of interest, dilution from warrants and promote.",
                  "Investment Company Act analysis codified — SPACs with no identified target after 18 months may qualify as investment companies.",
                  "Underwriters of SPAC IPO deemed underwriters of the de-SPAC transaction — significantly increased legal liability.",
                  "Effect: SPAC issuance collapsed 80%+ in 2023–24; banks reduced SPAC underwriting; market nearly dormant by 2025.",
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{pt}</p>
                  </div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Warrant pricing */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            SPAC Warrant Pricing & Arbitrage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-mono text-amber-300 mb-1">Warrant Strike = $11.50 | Maturity = 5 years post-merger</p>
            <p className="text-xs text-muted-foreground">Public warrants (1/2 unit) trade on exchange; redeem for $0.01 if stock &gt;$18 for 20/30 days (cashless redemption). Black-Scholes inputs: high vol (60–90%), long maturity → substantial time value even for deeply OTM warrants.</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-sky-300 mb-1">Unit Decomposition Arb</p>
            <p className="text-xs text-muted-foreground">Units typically split into shares + warrants after 52 days. If unit trades below theoretical (share + warrant) value, buy units and split → arbitrage. Common in first few months post-IPO; gap typically closes within days.</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-semibold text-primary mb-1">Pure Arb Strategy (Pre-Deal)</p>
            <p className="text-xs text-muted-foreground">Buy SPAC at or below $10.00 trust NAV; hold for trust interest (3–5% annualized in 2022–24 high-rate environment); redeem at NAV if bad deal announced. Collect warrants as free option. Low-risk carry trade during search period.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function EventDrivenPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-900/40 border border-indigo-800/50">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Event-Driven Investment Strategies</h1>
            <p className="text-sm text-muted-foreground">Merger arb · Activism · Spin-offs · Distressed · SPACs</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Strategy Type", value: "Event-Driven / Special Situations", color: "text-indigo-400" },
            { label: "Return Driver", value: "Corporate Events → Price Convergence", color: "text-emerald-400" },
            { label: "Time Horizon", value: "Days to 18 Months", color: "text-amber-400" },
          ].map((chip) => (
            <div key={chip.label} className="flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1">
              <span className="text-xs text-muted-foreground">{chip.label}:</span>
              <span className={cn("text-xs font-medium", chip.color)}>{chip.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="merger" className="w-full">
        <TabsList className="grid grid-cols-2 gap-1 sm:grid-cols-4 bg-card border border-border rounded-lg p-1 h-auto mb-6">
          {[
            { value: "merger", label: "Merger Arb", icon: TrendingUp },
            { value: "activism", label: "Activism", icon: Users },
            { value: "spinoffs", label: "Spin-offs", icon: Layers },
            { value: "distressed", label: "Distressed & SPACs", icon: AlertTriangle },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}
              className="flex items-center gap-1.5 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-2 py-1.5 rounded-md transition-colors">
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="merger" className="data-[state=inactive]:hidden mt-0">
          <AnimatePresence mode="wait">
            <motion.div key="merger" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <MergerArbitrageTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="activism" className="data-[state=inactive]:hidden mt-0">
          <AnimatePresence mode="wait">
            <motion.div key="activism" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <ActivismTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="spinoffs" className="data-[state=inactive]:hidden mt-0">
          <AnimatePresence mode="wait">
            <motion.div key="spinoffs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <SpinoffsTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="distressed" className="data-[state=inactive]:hidden mt-0">
          <AnimatePresence mode="wait">
            <motion.div key="distressed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <DistressedSPACTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
