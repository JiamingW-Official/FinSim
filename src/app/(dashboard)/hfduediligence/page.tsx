"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  BarChart3,
  Activity,
  Users,
  FileText,
  Scale,
  Search,
  Lock,
  Eye,
  Layers,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 790;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate deterministic data pools
const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let rIdx = 0;
const r = () => RAND_POOL[rIdx++ % RAND_POOL.length];

// ── Types ─────────────────────────────────────────────────────────────────────

interface DdItem {
  id: string;
  category: "investment" | "risk" | "operations" | "legal";
  label: string;
  status: "pass" | "warn" | "fail" | "pending";
  note: string;
}

interface TrackRecord {
  period: string;
  return1y: number;
  return3y: number;
  return5y: number;
  vol1y: number;
  vol3y: number;
  vol5y: number;
  sharpe1y: number;
  sharpe3y: number;
  sharpe5y: number;
}

interface FundScatter {
  name: string;
  sharpe: number;
  maxDD: number;
  strategy: string;
  color: string;
}

interface AttributionPoint {
  period: string;
  alpha: number;
  beta: number;
  total: number;
}

interface RedFlag {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  detected: boolean;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const KEY_METRICS = [
  { label: "Fund AUM", value: "$4.2B", sub: "As of Q1 2026", icon: DollarSign, highlight: "neutral" as const },
  { label: "Sharpe Ratio (3Y)", value: "1.47", sub: "vs 0.89 benchmark", icon: TrendingUp, highlight: "pos" as const },
  { label: "Max Drawdown", value: "-8.3%", sub: "Peak-to-trough (5Y)", icon: TrendingDown, highlight: "neg" as const },
  { label: "Corr. to S&P 500", value: "0.31", sub: "Low market beta", icon: Activity, highlight: "neutral" as const },
];

const DD_CHECKLIST: DdItem[] = [
  // Investment Process
  { id: "ip1", category: "investment", label: "Investment thesis clearly articulated", status: "pass", note: "Documented edge in L/S equity small-cap" },
  { id: "ip2", category: "investment", label: "Portfolio construction process defined", status: "pass", note: "Factor exposure limits per sector" },
  { id: "ip3", category: "investment", label: "Idea generation & sourcing edge", status: "warn", note: "Partially reliant on single data vendor" },
  { id: "ip4", category: "investment", label: "Exit strategy & position sizing rules", status: "pass", note: "Stop-loss at 8%, trailing take-profit" },
  { id: "ip5", category: "investment", label: "Research team depth & analyst coverage", status: "pass", note: "6 analysts, avg 14 yrs experience" },
  // Risk Management
  { id: "rm1", category: "risk", label: "VaR limits and stress test framework", status: "pass", note: "Daily 99% VaR monitored vs NAV" },
  { id: "rm2", category: "risk", label: "Liquidity risk management policy", status: "warn", note: "3% in illiquid structures — borderline" },
  { id: "rm3", category: "risk", label: "Counterparty & prime broker limits", status: "pass", note: "Tri-party with GS, MS, JPM" },
  { id: "rm4", category: "risk", label: "Leverage policy & margin monitoring", status: "pass", note: "Max 2.5x gross, 1.0x net" },
  { id: "rm5", category: "risk", label: "Tail risk hedging program", status: "warn", note: "OTM puts only in high-vol regimes" },
  // Operations
  { id: "op1", category: "operations", label: "Independent fund administrator", status: "pass", note: "SS&C GlobeOp — Tier 1" },
  { id: "op2", category: "operations", label: "Third-party auditor (Big 4)", status: "pass", note: "PwC, clean audit 5 consecutive years" },
  { id: "op3", category: "operations", label: "Cybersecurity & data protection", status: "pass", note: "SOC 2 Type II certified" },
  { id: "op4", category: "operations", label: "Business continuity plan tested", status: "warn", note: "BCP last tested 18 months ago" },
  { id: "op5", category: "operations", label: "Key-person insurance coverage", status: "fail", note: "No insurance on lead PM — HIGH RISK" },
  // Legal
  { id: "lg1", category: "legal", label: "Regulatory registrations (SEC/FCA)", status: "pass", note: "SEC-registered RIA, FCA approved" },
  { id: "lg2", category: "legal", label: "Clean compliance history (past 5Y)", status: "pass", note: "Zero material enforcement actions" },
  { id: "lg3", category: "legal", label: "Side pocket & gate provisions", status: "warn", note: "Up to 20% gate on redemptions" },
  { id: "lg4", category: "legal", label: "LP reporting frequency & transparency", status: "pass", note: "Monthly NAV, quarterly letter, annual audit" },
  { id: "lg5", category: "legal", label: "Preferential treatment / most-favored-nation", status: "fail", note: "Side letters with 3 LPs granting fee breaks" },
];

const TRACK_RECORD: TrackRecord[] = [
  { period: "2021", return1y: 18.4, return3y: 12.1, return5y: 10.8, vol1y: 9.2, vol3y: 8.7, vol5y: 9.1, sharpe1y: 1.83, sharpe3y: 1.28, sharpe5y: 1.09 },
  { period: "2022", return1y: -3.1, return3y: 9.4, return5y: 9.2, vol1y: 11.4, vol3y: 9.1, vol5y: 9.3, sharpe1y: -0.43, sharpe3y: 0.94, sharpe5y: 0.90 },
  { period: "2023", return1y: 22.7, return3y: 11.8, return5y: 11.2, vol1y: 8.8, vol3y: 9.4, vol5y: 9.0, sharpe1y: 2.41, sharpe3y: 1.14, sharpe5y: 1.13 },
  { period: "2024", return1y: 14.9, return3y: 15.8, return5y: 12.6, vol1y: 9.1, vol3y: 9.0, vol5y: 9.2, sharpe1y: 1.50, sharpe3y: 1.62, sharpe5y: 1.26 },
  { period: "2025", return1y: 11.2, return3y: 16.1, return5y: 13.4, vol1y: 8.6, vol3y: 8.8, vol5y: 9.1, sharpe1y: 1.19, sharpe3y: 1.68, sharpe5y: 1.36 },
];

const RED_FLAGS: RedFlag[] = [
  { id: "rf1", title: "Style Drift", description: "Fund migrating from stated long/short equity into concentrated macro bets without LP notification.", severity: "critical", detected: false },
  { id: "rf2", title: "AUM Bloat", description: "Rapid AUM growth from $0.8B to $4.2B in 3 years may erode alpha in small-cap universe.", severity: "high", detected: true },
  { id: "rf3", title: "Key Person Risk", description: "CIO accounts for 85% of investment decisions; departure would materially impair strategy.", severity: "critical", detected: true },
  { id: "rf4", title: "Concentrated Positions", description: "Top 10 positions represent 68% of long book — exceeds internal policy of 50% maximum.", severity: "high", detected: true },
  { id: "rf5", title: "High Redemption Gates", description: "20% quarterly gate restricts LP liquidity, mismatched with stated monthly liquidity.", severity: "high", detected: false },
  { id: "rf6", title: "Auditor Rotation Avoidance", description: "Same auditor retained for 8+ years; independence concerns may arise.", severity: "medium", detected: false },
  { id: "rf7", title: "Related Party Transactions", description: "PM's family office receives discounted fees via undisclosed side letter.", severity: "critical", detected: false },
  { id: "rf8", title: "Soft Dollar Abuses", description: "Soft dollar credits used for non-research expenses (travel, entertainment).", severity: "medium", detected: false },
  { id: "rf9", title: "Returns Smoothing", description: "Illiquid positions marked at cost rather than fair value — inflating Sharpe.", severity: "high", detected: false },
  { id: "rf10", title: "Leverage Creep", description: "Gross leverage has trended from 1.8x to 2.9x over 18 months without LP disclosure.", severity: "high", detected: false },
];

// ── Computed Chart Data ────────────────────────────────────────────────────────

function buildAttributionData(): AttributionPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((m) => {
    const alpha = (r() - 0.42) * 3.2;
    const beta = (r() - 0.5) * 2.1;
    return { period: m, alpha, beta, total: alpha + beta };
  });
}

function buildScatterFunds(): FundScatter[] {
  const strategies = ["L/S Equity", "Global Macro", "Event Driven", "Market Neutral", "CTA/Trend", "Credit L/S"];
  const colors = ["#60a5fa", "#34d399", "#fb923c", "#a78bfa", "#f472b6", "#fbbf24"];
  const names = [
    "Meridian Capital", "Apex Global", "Vertex Event", "Neutral Alpha", "Trend Force",
    "Credit Edge", "Sigma Partners", "Quant Alpha", "Macro Vision", "Alpha Bridge",
  ];
  return names.map((name, i) => ({
    name,
    sharpe: 0.5 + r() * 1.8,
    maxDD: -(5 + r() * 20),
    strategy: strategies[i % strategies.length],
    color: colors[i % colors.length],
  }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon: Icon, highlight,
}: {
  label: string; value: string; sub: string; icon: React.ElementType;
  highlight: "pos" | "neg" | "neutral";
}) {
  const valClass = highlight === "pos" ? "text-emerald-400" : highlight === "neg" ? "text-rose-400" : "text-foreground";
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className={cn("text-xl font-semibold", valClass)}>{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: DdItem["status"] }) {
  if (status === "pass") return <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  if (status === "fail") return <XCircle className="h-4 w-4 text-rose-400 shrink-0" />;
  return <Eye className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function StatusBadge({ status }: { status: DdItem["status"] }) {
  if (status === "pass") return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">PASS</Badge>;
  if (status === "warn") return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs">WARN</Badge>;
  if (status === "fail") return <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-xs">FAIL</Badge>;
  return <Badge className="bg-muted text-muted-foreground text-xs">PENDING</Badge>;
}

function SeverityBadge({ severity }: { severity: RedFlag["severity"] }) {
  if (severity === "critical") return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">CRITICAL</Badge>;
  if (severity === "high") return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">HIGH</Badge>;
  return <Badge className="bg-muted/10 text-primary border-border text-xs">MEDIUM</Badge>;
}

// ── SVG: Performance Attribution Chart ───────────────────────────────────────

function AttributionChart({ data }: { data: AttributionPoint[] }) {
  const W = 580;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 32, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => [d.alpha, d.beta, d.total]);
  const minV = Math.min(...allVals) - 0.5;
  const maxV = Math.max(...allVals) + 0.5;

  const xStep = chartW / (data.length - 1);
  const yScale = (v: number) => PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const zeroY = yScale(0);

  const alphaPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${PAD.left + i * xStep},${yScale(d.alpha)}`).join(" ");
  const betaPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${PAD.left + i * xStep},${yScale(d.beta)}`).join(" ");
  const totalPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${PAD.left + i * xStep},${yScale(d.total)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[-2, -1, 0, 1, 2, 3].map((v) => {
        const y = yScale(v);
        if (y < PAD.top || y > H - PAD.bottom) return null;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#374151" strokeWidth={v === 0 ? 1.5 : 0.5} strokeDasharray={v === 0 ? "none" : "3,3"} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">{v}%</text>
          </g>
        );
      })}
      {/* Zero line */}
      <line x1={PAD.left} x2={W - PAD.right} y1={zeroY} y2={zeroY} stroke="#4b5563" strokeWidth={1} />
      {/* Bars: alpha contribution */}
      {data.map((d, i) => {
        const barW = xStep * 0.35;
        const x = PAD.left + i * xStep - barW / 2;
        const y = d.alpha >= 0 ? yScale(d.alpha) : zeroY;
        const h = Math.abs(yScale(d.alpha) - zeroY);
        return <rect key={i} x={x} y={y} width={barW} height={Math.max(h, 1)} fill={d.alpha >= 0 ? "#34d39955" : "#f8717155"} />;
      })}
      {/* Lines */}
      <path d={betaPath} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4,2" />
      <path d={alphaPath} fill="none" stroke="#34d399" strokeWidth={2} />
      <path d={totalPath} fill="none" stroke="#f59e0b" strokeWidth={2} />
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={PAD.left + i * xStep} y={H - 6} textAnchor="middle" fontSize={9} fill="#6b7280">{d.period}</text>
      ))}
      {/* Legend */}
      <g transform={`translate(${PAD.left + 4}, ${PAD.top + 4})`}>
        <rect width={6} height={6} fill="#34d399" rx={1} />
        <text x={9} y={6} fontSize={8} fill="#9ca3af">Alpha</text>
        <rect x={46} width={6} height={6} fill="#60a5fa" rx={1} />
        <text x={55} y={6} fontSize={8} fill="#9ca3af">Beta</text>
        <rect x={83} width={6} height={6} fill="#f59e0b" rx={1} />
        <text x={92} y={6} fontSize={8} fill="#9ca3af">Total</text>
      </g>
    </svg>
  );
}

// ── SVG: Scatter Plot ─────────────────────────────────────────────────────────

function ScatterPlot({ funds }: { funds: FundScatter[] }) {
  const W = 580;
  const H = 240;
  const PAD = { top: 20, right: 20, bottom: 40, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minX = -25;
  const maxX = 0;
  const minY = 0.3;
  const maxY = 2.5;

  const xS = (v: number) => PAD.left + ((v - minX) / (maxX - minX)) * chartW;
  const yS = (v: number) => PAD.top + chartH - ((v - minY) / (maxY - minY)) * chartH;

  // Target fund is always in position 0 (Meridian Capital)
  const targetFund = { ...funds[0], name: "Meridian Capital", sharpe: 1.47, maxDD: -8.3, color: "#f59e0b" };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[-5, -10, -15, -20].map((v) => (
        <g key={v}>
          <line x1={xS(v)} x2={xS(v)} y1={PAD.top} y2={H - PAD.bottom} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={xS(v)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill="#6b7280">{v}%</text>
        </g>
      ))}
      {[0.5, 1.0, 1.5, 2.0].map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yS(v)} y2={yS(v)} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={PAD.left - 6} y={yS(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">{v.toFixed(1)}</text>
        </g>
      ))}
      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#6b7280">Max Drawdown (%)</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={10} fill="#6b7280" transform={`rotate(-90, 10, ${H / 2})`}>Sharpe Ratio</text>
      {/* Fund dots */}
      {funds.slice(1).map((f, i) => (
        <g key={i}>
          <circle cx={xS(f.maxDD)} cy={yS(f.sharpe)} r={6} fill={f.color} fillOpacity={0.6} />
          <text x={xS(f.maxDD)} y={yS(f.sharpe) - 9} textAnchor="middle" fontSize={7.5} fill="#9ca3af">{f.name.split(" ")[0]}</text>
        </g>
      ))}
      {/* Target fund highlighted */}
      <circle cx={xS(targetFund.maxDD)} cy={yS(targetFund.sharpe)} r={8} fill="#f59e0b" fillOpacity={0.9} stroke="#f59e0b" strokeWidth={2} />
      <text x={xS(targetFund.maxDD)} y={yS(targetFund.sharpe) - 12} textAnchor="middle" fontSize={8} fill="#f59e0b" fontWeight="bold">{targetFund.name.split(" ")[0]}</text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HFDueDiligencePage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "investment" | "risk" | "operations" | "legal">("all");
  const [showDetectedOnly, setShowDetectedOnly] = useState(false);

  const attributionData = useMemo(() => buildAttributionData(), []);
  const scatterFunds = useMemo(() => buildScatterFunds(), []);

  const filteredChecklist = useMemo(() => {
    if (activeFilter === "all") return DD_CHECKLIST;
    return DD_CHECKLIST.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const checklistSummary = useMemo(() => {
    const pass = DD_CHECKLIST.filter((i) => i.status === "pass").length;
    const warn = DD_CHECKLIST.filter((i) => i.status === "warn").length;
    const fail = DD_CHECKLIST.filter((i) => i.status === "fail").length;
    return { pass, warn, fail };
  }, []);

  const filteredRedFlags = useMemo(() => {
    if (!showDetectedOnly) return RED_FLAGS;
    return RED_FLAGS.filter((f) => f.detected);
  }, [showDetectedOnly]);

  const categoryLabels: Record<string, string> = {
    investment: "Investment Process",
    risk: "Risk Management",
    operations: "Operations",
    legal: "Legal & Compliance",
  };

  const categoryIcons: Record<string, React.ElementType> = {
    investment: TrendingUp,
    risk: ShieldAlert,
    operations: Building2,
    legal: Scale,
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hedge Fund Due Diligence</h1>
            <p className="text-sm text-muted-foreground">Institutional allocator framework — quantitative &amp; operational DD on target fund</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Fund: Meridian Capital</Badge>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">L/S Equity</Badge>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
        {KEY_METRICS.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} sub={m.sub} icon={m.icon} highlight={m.highlight} />
        ))}
      </motion.div>

      {/* DD Summary Bar */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mt-8">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Checklist Summary:</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-semibold">{checklistSummary.pass} Pass</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-semibold">{checklistSummary.warn} Warn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span className="text-sm text-rose-400 font-semibold">{checklistSummary.fail} Fail</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex gap-1 h-2 w-48 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 rounded-l-full" style={{ width: `${(checklistSummary.pass / 20) * 100}%` }} />
                  <div className="bg-amber-500" style={{ width: `${(checklistSummary.warn / 20) * 100}%` }} />
                  <div className="bg-rose-500 rounded-r-full" style={{ width: `${(checklistSummary.fail / 20) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{Math.round((checklistSummary.pass / 20) * 100)}% Pass Rate</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <Tabs defaultValue="quant">
          <TabsList className="grid grid-cols-4 w-full max-w-lg mb-4">
            <TabsTrigger value="quant">Quantitative DD</TabsTrigger>
            <TabsTrigger value="operational">Operational DD</TabsTrigger>
            <TabsTrigger value="track">Track Record</TabsTrigger>
            <TabsTrigger value="redflags">Red Flags</TabsTrigger>
          </TabsList>

          {/* ── Quantitative DD ── */}
          <TabsContent value="quant" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Attribution Chart */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Alpha vs Beta Decomposition (Monthly)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Return attribution — alpha generation vs market beta contribution</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <AttributionChart data={attributionData} />
                </CardContent>
              </Card>

              {/* Scatter Plot */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Risk-Adjusted Return Comparison
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Sharpe ratio vs Max drawdown — 10 peer funds (target in amber)</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScatterPlot funds={scatterFunds} />
                </CardContent>
              </Card>
            </div>

            {/* Quant Metrics Grid */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Quantitative Metrics Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Annualized Return (5Y)", value: "13.4%", diff: "+4.2% vs peers", pos: true },
                    { label: "Annualized Volatility", value: "9.1%", diff: "-2.1% vs peers", pos: true },
                    { label: "Sortino Ratio (3Y)", value: "2.14", diff: "+0.53 vs peers", pos: true },
                    { label: "Calmar Ratio", value: "1.61", diff: "+0.38 vs peers", pos: true },
                    { label: "Beta to S&P 500", value: "0.29", diff: "Low market exposure", pos: true },
                    { label: "Omega Ratio", value: "1.87", diff: ">1 = favorable", pos: true },
                    { label: "95% Monthly VaR", value: "-2.4%", diff: "Within policy limits", pos: true },
                    { label: "Information Ratio", value: "0.91", diff: "Above 0.5 threshold", pos: true },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                      <p className="text-base font-semibold text-foreground">{m.value}</p>
                      <p className={cn("text-xs mt-0.5", m.pos ? "text-emerald-400" : "text-rose-400")}>{m.diff}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Operational DD ── */}
          <TabsContent value="operational" className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <p className="text-xs text-muted-foreground mr-1">Filter by category:</p>
              {(["all", "investment", "risk", "operations", "legal"] as const).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={activeFilter === cat ? "default" : "outline"}
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat === "all" ? "All" : categoryLabels[cat]}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredChecklist.map((item) => {
                const CatIcon = categoryIcons[item.category] ?? FileText;
                return (
                  <Card key={item.id} className={cn(
                    "bg-card border transition-colors",
                    item.status === "fail" ? "border-rose-500/30" : item.status === "warn" ? "border-amber-500/20" : "border-border"
                  )}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <StatusIcon status={item.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{item.label}</p>
                            <StatusBadge status={item.status} />
                            <Badge variant="outline" className="text-xs text-muted-foreground gap-1 border-border">
                              <CatIcon className="h-2.5 w-2.5" />
                              {categoryLabels[item.category]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Track Record ── */}
          <TabsContent value="track" className="space-y-4">
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Rolling Period Performance — Meridian Capital L/S
                </CardTitle>
                <p className="text-xs text-muted-foreground">Annual, 3-year, and 5-year rolling returns, volatility, and Sharpe ratios</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 text-muted-foreground font-medium">Year</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">1Y Return</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">3Y Return</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">5Y Return</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">1Y Vol</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">3Y Vol</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">5Y Vol</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">1Y Sharpe</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">3Y Sharpe</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">5Y Sharpe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRACK_RECORD.map((row, i) => (
                        <tr key={row.period} className={cn("border-b border-border", i % 2 === 0 ? "bg-muted/10" : "")}>
                          <td className="p-3 font-medium">{row.period}</td>
                          <td className={cn("p-3 text-right font-medium", row.return1y >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {row.return1y >= 0 ? "+" : ""}{row.return1y.toFixed(1)}%
                          </td>
                          <td className={cn("p-3 text-right", row.return3y >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {row.return3y >= 0 ? "+" : ""}{row.return3y.toFixed(1)}%
                          </td>
                          <td className={cn("p-3 text-right", row.return5y >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {row.return5y >= 0 ? "+" : ""}{row.return5y.toFixed(1)}%
                          </td>
                          <td className="p-3 text-right text-muted-foreground">{row.vol1y.toFixed(1)}%</td>
                          <td className="p-3 text-right text-muted-foreground">{row.vol3y.toFixed(1)}%</td>
                          <td className="p-3 text-right text-muted-foreground">{row.vol5y.toFixed(1)}%</td>
                          <td className={cn("p-3 text-right font-medium", row.sharpe1y >= 1 ? "text-emerald-400" : row.sharpe1y >= 0 ? "text-amber-400" : "text-rose-400")}>
                            {row.sharpe1y.toFixed(2)}
                          </td>
                          <td className={cn("p-3 text-right", row.sharpe3y >= 1 ? "text-emerald-400" : "text-amber-400")}>
                            {row.sharpe3y.toFixed(2)}
                          </td>
                          <td className={cn("p-3 text-right", row.sharpe5y >= 1 ? "text-emerald-400" : "text-amber-400")}>
                            {row.sharpe5y.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Drawdown Timeline */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  Drawdown Events (5Y)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { period: "Mar–May 2022", depth: -8.3, duration: "61 days", recovery: "47 days", cause: "Rate shock — growth factor de-rating" },
                    { period: "Aug–Sep 2023", depth: -3.1, duration: "22 days", recovery: "18 days", cause: "Credit spread widening in short book" },
                    { period: "Jan 2024", depth: -2.4, duration: "9 days", recovery: "12 days", cause: "Momentum unwind — crowded longs" },
                    { period: "Jul 2025", depth: -4.2, duration: "31 days", recovery: "28 days", cause: "AI sector correction — tech longs" },
                  ].map((dd) => (
                    <div key={dd.period} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="p-1.5 rounded bg-rose-500/10 mt-0.5">
                        <ArrowDownRight className="h-3 w-3 text-rose-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium">{dd.period}</span>
                          <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-xs">{dd.depth}%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{dd.cause}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">Duration: {dd.duration} · Recovery: {dd.recovery}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Red Flags ── */}
          <TabsContent value="redflags" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filteredRedFlags.length} warning signs identified in due diligence process</p>
              <Button
                size="sm"
                variant={showDetectedOnly ? "default" : "outline"}
                className="h-7 text-xs text-muted-foreground gap-1.5"
                onClick={() => setShowDetectedOnly((v) => !v)}
              >
                <Eye className="h-3 w-3" />
                {showDetectedOnly ? "Showing Detected" : "Show Detected Only"}
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {filteredRedFlags.map((flag) => (
                <Card key={flag.id} className={cn(
                  "bg-card border transition-colors",
                  flag.detected
                    ? flag.severity === "critical" ? "border-rose-500/50 bg-rose-500/5"
                      : flag.severity === "high" ? "border-amber-500/40 bg-amber-500/5"
                      : "border-border"
                    : "border-border opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {flag.detected
                          ? <AlertTriangle className={cn("h-4 w-4 shrink-0", flag.severity === "critical" ? "text-rose-400" : flag.severity === "high" ? "text-amber-400" : "text-primary")} />
                          : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        }
                        <span className={cn("text-sm font-medium", flag.detected ? "text-foreground" : "text-muted-foreground")}>{flag.title}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <SeverityBadge severity={flag.severity} />
                        {flag.detected && (
                          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">DETECTED</Badge>
                        )}
                      </div>
                    </div>
                    <p className={cn("text-xs leading-relaxed", flag.detected ? "text-muted-foreground" : "text-muted-foreground/50")}>{flag.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Allocation Recommendation */}
            <Card className="bg-card border-amber-500/30 border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-400" />
                  Allocator Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-sm font-medium text-amber-400">CONDITIONAL INVEST</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    Strong quantitative profile (Sharpe 1.47, low beta 0.31, clean audit history) offset by 3 detected issues: AUM bloat, key person risk, and concentrated positions.
                    Recommend a conditional allocation pending: (1) key-person insurance obtained, (2) top-10 concentration reduced below 55%, and (3) full MFN disclosure to all LPs.
                    Suggest initial 0.5% portfolio allocation with 12-month re-review.
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Score: 71 / 100
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
