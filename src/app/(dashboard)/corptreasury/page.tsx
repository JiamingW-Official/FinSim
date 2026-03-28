"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingDown,
  Percent,
  Globe,
  Shield,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  CreditCard,
  PieChart,
  Calendar,
  Building2,
  Layers,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 774;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface CashFlowPoint {
  month: string;
  operating: number;
  investing: number;
  financing: number;
  net: number;
}

interface DebtMaturity {
  year: string;
  amount: number;
  type: "Senior Notes" | "Term Loan" | "Revolving Credit" | "Commercial Paper";
}

interface FXHedge {
  currency: string;
  exposure: number; // USD millions
  hedgeRatio: number; // percent
  instrument: "Forward" | "Option" | "Cross-Currency Swap";
  maturity: string;
  unrealizedPnl: number; // USD millions
}

interface CapitalAlloc {
  quarter: string;
  capex: number;
  buybacks: number;
  dividends: number;
  ma: number;
}

interface CreditMetric {
  name: string;
  value: string;
  threshold: string;
  status: "ok" | "warning" | "breach";
  description: string;
}

// ── Data Generation ───────────────────────────────────────────────────────────

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const cashFlowData: CashFlowPoint[] = MONTHS.map((month) => {
  const operating = 180 + (rand() - 0.5) * 80;
  const investing = -(60 + rand() * 40);
  const financing = -(20 + rand() * 30);
  return {
    month,
    operating: Math.round(operating),
    investing: Math.round(investing),
    financing: Math.round(financing),
    net: Math.round(operating + investing + financing),
  };
});

const debtMaturities: DebtMaturity[] = [
  { year: "2025", amount: 500, type: "Commercial Paper" },
  { year: "2026", amount: 1200, type: "Term Loan" },
  { year: "2027", amount: 750, type: "Senior Notes" },
  { year: "2028", amount: 300, type: "Revolving Credit" },
  { year: "2029", amount: 1500, type: "Senior Notes" },
  { year: "2030", amount: 800, type: "Term Loan" },
  { year: "2031+", amount: 2200, type: "Senior Notes" },
];

const fxHedges: FXHedge[] = [
  { currency: "EUR", exposure: 2400, hedgeRatio: 75, instrument: "Forward", maturity: "6M", unrealizedPnl: 18.4 },
  { currency: "GBP", exposure: 1100, hedgeRatio: 60, instrument: "Option", maturity: "3M", unrealizedPnl: -5.2 },
  { currency: "JPY", exposure: 980, hedgeRatio: 85, instrument: "Cross-Currency Swap", maturity: "2Y", unrealizedPnl: 31.7 },
  { currency: "CNY", exposure: 650, hedgeRatio: 40, instrument: "Forward", maturity: "3M", unrealizedPnl: -2.8 },
  { currency: "BRL", exposure: 420, hedgeRatio: 30, instrument: "Option", maturity: "6M", unrealizedPnl: 8.1 },
  { currency: "AUD", exposure: 310, hedgeRatio: 55, instrument: "Forward", maturity: "12M", unrealizedPnl: -1.4 },
];

const capitalAllocData: CapitalAlloc[] = [
  { quarter: "Q1 '25", capex: 420, buybacks: 500, dividends: 280, ma: 0 },
  { quarter: "Q2 '25", capex: 380, buybacks: 600, dividends: 280, ma: 1200 },
  { quarter: "Q3 '25", capex: 510, buybacks: 450, dividends: 290, ma: 0 },
  { quarter: "Q4 '25", capex: 460, buybacks: 700, dividends: 290, ma: 0 },
  { quarter: "Q1 '26", capex: 490, buybacks: 550, dividends: 300, ma: 800 },
  { quarter: "Q2 '26", capex: 440, buybacks: 600, dividends: 300, ma: 0 },
];

const creditMetrics: CreditMetric[] = [
  {
    name: "Net Leverage (Net Debt / EBITDA)",
    value: "2.4x",
    threshold: "≤ 3.5x",
    status: "ok",
    description: "Measures financial leverage relative to earnings; covenant max 3.5x",
  },
  {
    name: "Interest Coverage (EBIT / Interest)",
    value: "8.2x",
    threshold: "≥ 3.0x",
    status: "ok",
    description: "Ability to service interest payments from operating earnings",
  },
  {
    name: "Liquidity Ratio (Cash + Revolver / 12M Maturities)",
    value: "1.9x",
    threshold: "≥ 1.2x",
    status: "ok",
    description: "Short-term liquidity cushion relative to near-term debt obligations",
  },
  {
    name: "Fixed Charge Coverage",
    value: "4.1x",
    threshold: "≥ 2.5x",
    status: "ok",
    description: "Covers all fixed obligations including leases and preferred dividends",
  },
  {
    name: "Secured Debt / Total Assets",
    value: "18%",
    threshold: "≤ 25%",
    status: "ok",
    description: "Proportion of assets encumbered by secured lenders",
  },
  {
    name: "Restricted Payments Basket",
    value: "$2.1B",
    threshold: "Min $500M",
    status: "warning",
    description: "Basket has declined toward threshold after recent buybacks and M&A",
  },
];

// ── Metric Cards ──────────────────────────────────────────────────────────────

const keyMetrics = [
  {
    label: "Cash & Equivalents",
    value: "$8.4B",
    sub: "+$0.6B YoY",
    positive: true,
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-emerald-400",
  },
  {
    label: "Net Debt / EBITDA",
    value: "2.4x",
    sub: "Investment grade",
    positive: true,
    icon: <TrendingDown className="w-5 h-5" />,
    color: "text-blue-400",
  },
  {
    label: "Wtd. Avg. Cost of Debt",
    value: "4.18%",
    sub: "Fixed: 72% | Float: 28%",
    positive: null,
    icon: <Percent className="w-5 h-5" />,
    color: "text-amber-400",
  },
  {
    label: "Total FX Exposure",
    value: "$5.86B",
    sub: "Avg hedge ratio 63%",
    positive: null,
    icon: <Globe className="w-5 h-5" />,
    color: "text-violet-400",
  },
];

// ── SVG helpers ───────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// ── Cash Flow Forecast Chart ──────────────────────────────────────────────────

function CashFlowChart() {
  const W = 600;
  const H = 220;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = cashFlowData.length;

  const allVals = cashFlowData.flatMap((d) => [d.operating, d.investing, d.net]);
  const minV = Math.min(...allVals) - 20;
  const maxV = Math.max(...allVals) + 20;

  const xOf = (i: number) => padL + (i / (n - 1)) * chartW;
  const yOf = (v: number) => padT + chartH - lerp(v, minV, maxV, 0, chartH);

  const zero = yOf(0);

  const buildLine = (key: keyof CashFlowPoint) => {
    const points = cashFlowData.map((d, i) => `${xOf(i)},${yOf(d[key] as number)}`);
    return `M ${points.join(" L ")}`;
  };

  const gridLines = [-100, 0, 100, 200];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {gridLines.map((g) => {
        const y = yOf(g);
        if (y < padT || y > padT + chartH) return null;
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">
              {g >= 0 ? `+${g}` : g}
            </text>
          </g>
        );
      })}
      {/* Zero line */}
      <line x1={padL} y1={zero} x2={W - padR} y2={zero} stroke="hsl(var(--border))" strokeWidth="1.5" />

      {/* Operating CF area */}
      <path
        d={`${buildLine("operating")} L ${xOf(n - 1)},${zero} L ${xOf(0)},${zero} Z`}
        fill="hsl(142 76% 36%)"
        fillOpacity="0.15"
      />
      <path d={buildLine("operating")} fill="none" stroke="hsl(142 76% 36%)" strokeWidth="2" strokeLinejoin="round" />

      {/* Investing CF */}
      <path d={buildLine("investing")} fill="none" stroke="hsl(217 91% 60%)" strokeWidth="1.5" strokeDasharray="5 3" strokeLinejoin="round" />

      {/* Net CF */}
      <path d={buildLine("net")} fill="none" stroke="hsl(38 92% 50%)" strokeWidth="2" strokeLinejoin="round" />

      {/* Dots net */}
      {cashFlowData.map((d, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(d.net)} r="3" fill="hsl(38 92% 50%)" />
      ))}

      {/* X labels */}
      {cashFlowData.map((d, i) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
          {d.month}
        </text>
      ))}

      {/* Legend */}
      <g transform={`translate(${padL + 4}, ${padT + 4})`}>
        <rect width="10" height="10" rx="2" fill="hsl(142 76% 36%)" opacity="0.8" />
        <text x="14" y="9" fontSize="10" fill="hsl(var(--foreground))">Operating</text>
        <rect x="80" width="10" height="10" rx="2" fill="hsl(217 91% 60%)" opacity="0.8" />
        <text x="94" y="9" fontSize="10" fill="hsl(var(--foreground))">Investing</text>
        <rect x="162" width="10" height="10" rx="2" fill="hsl(38 92% 50%)" opacity="0.8" />
        <text x="176" y="9" fontSize="10" fill="hsl(var(--foreground))">Net FCF</text>
      </g>
    </svg>
  );
}

// ── Debt Maturity Chart ───────────────────────────────────────────────────────

const DEBT_COLORS: Record<DebtMaturity["type"], string> = {
  "Senior Notes": "hsl(217 91% 60%)",
  "Term Loan": "hsl(142 76% 36%)",
  "Revolving Credit": "hsl(38 92% 50%)",
  "Commercial Paper": "hsl(271 91% 65%)",
};

function DebtMaturityChart() {
  const W = 560;
  const H = 220;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxAmt = Math.max(...debtMaturities.map((d) => d.amount));
  const barW = (chartW / debtMaturities.length) * 0.6;
  const gap = chartW / debtMaturities.length;

  const gridAmounts = [0, 500, 1000, 1500, 2000];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {gridAmounts.map((g) => {
        const y = padT + chartH - (g / maxAmt) * chartH;
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">
              {g >= 1000 ? `$${g / 1000}B` : g === 0 ? "" : `$${g}M`}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {debtMaturities.map((d, i) => {
        const barH = clamp((d.amount / maxAmt) * chartH, 2, chartH);
        const x = padL + i * gap + gap / 2 - barW / 2;
        const y = padT + chartH - barH;
        return (
          <g key={d.year}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="3"
              fill={DEBT_COLORS[d.type]}
              fillOpacity="0.85"
            />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" fontWeight="600">
              ${d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}B` : `${d.amount}M`}
            </text>
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
              {d.year}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${padL}, ${padT})`}>
        {(Object.entries(DEBT_COLORS) as [DebtMaturity["type"], string][]).map(([label, color], i) => (
          <g key={label} transform={`translate(${i * 130}, 0)`}>
            <rect width="10" height="10" rx="2" fill={color} opacity="0.85" />
            <text x="14" y="9" fontSize="9" fill="hsl(var(--foreground))">{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Capital Allocation Chart ──────────────────────────────────────────────────

function CapitalAllocChart() {
  const W = 560;
  const H = 220;
  const padL = 52;
  const padR = 16;
  const padT = 24;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = capitalAllocData.length;
  const gap = chartW / n;
  const groupW = gap * 0.8;
  const barW = groupW / 4;

  const maxV = Math.max(...capitalAllocData.flatMap((d) => [d.capex, d.buybacks, d.dividends, d.ma])) + 100;
  const gridVals = [0, 400, 800, 1200];

  const colors = ["hsl(217 91% 60%)", "hsl(142 76% 36%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"];
  const labels = ["CapEx", "Buybacks", "Dividends", "M&A"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {gridVals.map((g) => {
        const y = padT + chartH - (g / maxV) * chartH;
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">
              {g === 0 ? "" : `$${g}M`}
            </text>
          </g>
        );
      })}

      {capitalAllocData.map((d, qi) => {
        const vals = [d.capex, d.buybacks, d.dividends, d.ma];
        const gx = padL + qi * gap + gap / 2 - groupW / 2;
        return (
          <g key={d.quarter}>
            {vals.map((v, bi) => {
              const barH = clamp((v / maxV) * chartH, v > 0 ? 2 : 0, chartH);
              const x = gx + bi * barW;
              const y = padT + chartH - barH;
              return (
                <rect key={bi} x={x} y={y} width={barW - 2} height={barH} rx="2" fill={colors[bi]} fillOpacity="0.85" />
              );
            })}
            <text x={gx + groupW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
              {d.quarter}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${padL}, 6)`}>
        {labels.map((label, i) => (
          <g key={label} transform={`translate(${i * 110}, 0)`}>
            <rect width="10" height="10" rx="2" fill={colors[i]} opacity="0.85" />
            <text x="14" y="9" fontSize="10" fill="hsl(var(--foreground))">{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Credit Metric Card ────────────────────────────────────────────────────────

function CovenantStatusIcon({ status }: { status: CreditMetric["status"] }) {
  if (status === "ok") return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  if (status === "warning") return <AlertTriangle className="w-5 h-5 text-amber-400" />;
  return <XCircle className="w-5 h-5 text-red-400" />;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CorpTreasuryPage() {
  const [activeTab, setActiveTab] = useState("cash");

  const totalFXExposure = useMemo(
    () => fxHedges.reduce((sum, h) => sum + h.exposure, 0),
    []
  );

  const totalUnrealized = useMemo(
    () => fxHedges.reduce((sum, h) => sum + h.unrealizedPnl, 0),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Corporate Treasury Management</h1>
            <p className="text-muted-foreground text-sm">
              Cash management · FX hedging · Debt capital markets · Capital allocation
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {keyMetrics.map((m) => (
          <Card key={m.label} className="border-border bg-card">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${m.color}`}>{m.icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{m.label}</p>
                <p className="text-xl font-bold">{m.value}</p>
                <p className={`text-xs ${m.positive === true ? "text-emerald-400" : m.positive === false ? "text-red-400" : "text-muted-foreground"}`}>
                  {m.positive === true && <span className="inline-flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{m.sub}</span>}
                  {m.positive === false && <span className="inline-flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />{m.sub}</span>}
                  {m.positive === null && m.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-card border border-border">
            <TabsTrigger value="cash" className="gap-1.5">
              <Banknote className="w-4 h-4" />Cash Management
            </TabsTrigger>
            <TabsTrigger value="fx" className="gap-1.5">
              <Globe className="w-4 h-4" />FX Hedging
            </TabsTrigger>
            <TabsTrigger value="debt" className="gap-1.5">
              <CreditCard className="w-4 h-4" />Debt Structure
            </TabsTrigger>
            <TabsTrigger value="capital" className="gap-1.5">
              <PieChart className="w-4 h-4" />Capital Allocation
            </TabsTrigger>
          </TabsList>

          {/* ── Cash Management Tab ── */}
          <TabsContent value="cash" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Cash Flow Forecast */}
              <Card className="xl:col-span-2 border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    12-Month Forward Cash Flow Projection ($M)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CashFlowChart />
                </CardContent>
              </Card>

              {/* Liquidity Overview */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Liquidity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Cash & Short-term Investments", value: "$8.4B", pct: 100 },
                    { label: "Undrawn Revolving Credit", value: "$3.0B", pct: 36 },
                    { label: "CP Program Capacity", value: "$1.5B", pct: 18 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Cash by Region</p>
                    {[
                      { region: "North America", pct: 45, color: "bg-blue-500" },
                      { region: "Europe", pct: 28, color: "bg-violet-500" },
                      { region: "Asia Pacific", pct: 18, color: "bg-emerald-500" },
                      { region: "Other", pct: 9, color: "bg-amber-500" },
                    ].map((r) => (
                      <div key={r.region} className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${r.color}`} />
                        <span className="text-xs flex-1 text-muted-foreground">{r.region}</span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-xs w-8 text-right font-medium">{r.pct}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-300">
                    Total available liquidity: <span className="font-bold">$12.9B</span> — 3.2x 12-month debt maturities
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash flow stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Avg Monthly Operating CF", value: "$165M", icon: <TrendingDown className="w-4 h-4 text-emerald-400 rotate-180" /> },
                { label: "12M CapEx Budget", value: "$1.98B", icon: <Calendar className="w-4 h-4 text-amber-400" /> },
                { label: "Cash Conversion Cycle", value: "34 days", icon: <RefreshCw className="w-4 h-4 text-blue-400" /> },
                { label: "Free Cash Flow Yield", value: "5.8%", icon: <Percent className="w-4 h-4 text-violet-400" /> },
              ].map((s) => (
                <Card key={s.label} className="border-border bg-card">
                  <CardContent className="p-3 flex items-center gap-2">
                    {s.icon}
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="font-bold">{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── FX Hedging Tab ── */}
          <TabsContent value="fx" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Summary */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-400" />
                    FX Program Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Exposure</span>
                    <span className="font-bold">${(totalFXExposure / 1000).toFixed(2)}B</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Notional Hedged</span>
                    <span className="font-bold">
                      ${(fxHedges.reduce((a, h) => a + h.exposure * h.hedgeRatio / 100, 0) / 1000).toFixed(2)}B
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Avg Hedge Ratio</span>
                    <span className="font-bold">
                      {Math.round(fxHedges.reduce((a, h) => a + h.hedgeRatio, 0) / fxHedges.length)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Unrealized P&L</span>
                    <span className={`font-bold ${totalUnrealized >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {totalUnrealized >= 0 ? "+" : ""}${totalUnrealized.toFixed(1)}M
                    </span>
                  </div>
                  <div className="pt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Instruments Used</p>
                    {["Forward", "Option", "Cross-Currency Swap"].map((inst) => {
                      const count = fxHedges.filter((h) => h.instrument === inst).length;
                      return (
                        <div key={inst} className="flex justify-between text-sm">
                          <span>{inst}</span>
                          <Badge variant="secondary" className="text-xs">{count} positions</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Hedge Table */}
              <Card className="lg:col-span-2 border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Currency Hedge Positions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-muted-foreground font-medium">CCY</th>
                          <th className="text-right p-3 text-muted-foreground font-medium">Exposure ($M)</th>
                          <th className="text-center p-3 text-muted-foreground font-medium">Hedge Ratio</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Instrument</th>
                          <th className="text-center p-3 text-muted-foreground font-medium">Maturity</th>
                          <th className="text-right p-3 text-muted-foreground font-medium">Unreal. P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fxHedges.map((h) => (
                          <tr key={h.currency} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-bold">{h.currency}</td>
                            <td className="p-3 text-right">{h.exposure.toLocaleString()}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-violet-500 rounded-full"
                                    style={{ width: `${h.hedgeRatio}%` }}
                                  />
                                </div>
                                <span className="text-xs w-8 text-right">{h.hedgeRatio}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="secondary"
                                className={
                                  h.instrument === "Forward"
                                    ? "text-blue-400 bg-blue-500/10"
                                    : h.instrument === "Option"
                                    ? "text-amber-400 bg-amber-500/10"
                                    : "text-violet-400 bg-violet-500/10"
                                }
                              >
                                {h.instrument}
                              </Badge>
                            </td>
                            <td className="p-3 text-center text-muted-foreground">{h.maturity}</td>
                            <td className={`p-3 text-right font-semibold ${h.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {h.unrealizedPnl >= 0 ? "+" : ""}${h.unrealizedPnl.toFixed(1)}M
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FX education note */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <p className="text-sm text-amber-300 font-semibold mb-1">Hedging Strategy Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The treasury uses a layered hedging approach: forwards for high-certainty transaction exposure (invoiced revenue),
                  options for uncertain balance-sheet translation risk, and cross-currency swaps to economically convert fixed-rate
                  foreign-currency debt into USD. Hedge accounting (ASC 815) is applied where documentation requirements are met,
                  deferring gains/losses in OCI until the hedged item affects earnings.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Debt Structure Tab ── */}
          <TabsContent value="debt" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2 border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Debt Maturity Profile ($M)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DebtMaturityChart />
                </CardContent>
              </Card>

              {/* Debt Composition */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    Debt Composition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {debtMaturities.map((d) => {
                    const totalDebt = debtMaturities.reduce((a, x) => a + x.amount, 0);
                    const pct = Math.round((d.amount / totalDebt) * 100);
                    return (
                      <div key={d.year} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{d.year} — {d.type}</span>
                          <span className="font-semibold">
                            ${d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}B` : `${d.amount}M`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: DEBT_COLORS[d.type] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border text-sm flex justify-between">
                    <span className="text-muted-foreground">Total Gross Debt</span>
                    <span className="font-bold">
                      ${(debtMaturities.reduce((a, d) => a + d.amount, 0) / 1000).toFixed(1)}B
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Debt stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Wtd Avg Maturity", value: "6.4 years", icon: <Calendar className="w-4 h-4 text-blue-400" /> },
                { label: "Fixed Rate Mix", value: "72%", icon: <Percent className="w-4 h-4 text-amber-400" /> },
                { label: "Credit Rating (S&P)", value: "A-", icon: <Shield className="w-4 h-4 text-emerald-400" /> },
                { label: "Nearest Maturity", value: "$500M CP (2025)", icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
              ].map((item) => (
                <Card key={item.label} className="border-border bg-card">
                  <CardContent className="p-3 flex items-center gap-2">
                    {item.icon}
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-bold text-sm">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Credit Covenants */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Credit Covenant Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-muted-foreground font-medium">Metric</th>
                        <th className="text-center p-3 text-muted-foreground font-medium">Current</th>
                        <th className="text-center p-3 text-muted-foreground font-medium">Threshold</th>
                        <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                        <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditMetrics.map((m) => (
                        <tr key={m.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{m.name}</td>
                          <td className="p-3 text-center font-bold">{m.value}</td>
                          <td className="p-3 text-center text-muted-foreground">{m.threshold}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center">
                              <CovenantStatusIcon status={m.status} />
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{m.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Capital Allocation Tab ── */}
          <TabsContent value="capital" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2 border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    Capital Allocation by Quarter ($M)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CapitalAllocChart />
                </CardContent>
              </Card>

              {/* Priority Panel */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Allocation Framework
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      rank: 1,
                      label: "Organic Investment (CapEx & R&D)",
                      target: "~$2.0B/yr",
                      color: "bg-blue-500",
                      note: "Maintain competitive moat",
                    },
                    {
                      rank: 2,
                      label: "Dividend",
                      target: "$1.16B/yr",
                      color: "bg-emerald-500",
                      note: "Progressive; 8% CAGR target",
                    },
                    {
                      rank: 3,
                      label: "Share Buyback",
                      target: "$2–3B/yr",
                      color: "bg-amber-500",
                      note: "Board authorization: $5B",
                    },
                    {
                      rank: 4,
                      label: "M&A / Strategic",
                      target: "Opportunistic",
                      color: "bg-red-500",
                      note: "IRR hurdle ≥15%; bolt-on focus",
                    },
                  ].map((item) => (
                    <div key={item.rank} className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full ${item.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                        {item.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.target} — {item.note}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-border space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">TTM Totals</p>
                    {[
                      { label: "CapEx", value: "$1.77B", color: "text-blue-400" },
                      { label: "Buybacks", value: "$2.25B", color: "text-amber-400" },
                      { label: "Dividends", value: "$1.15B", color: "text-emerald-400" },
                      { label: "M&A", value: "$2.00B", color: "text-red-400" },
                    ].map((t) => (
                      <div key={t.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.label}</span>
                        <span className={`font-semibold ${t.color}`}>{t.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
                      <span>Total Return to Shareholders</span>
                      <span>$3.40B</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Capital efficiency metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "ROIC", value: "14.2%", sub: "vs 9.1% WACC", icon: <TrendingDown className="w-4 h-4 text-emerald-400 rotate-180" /> },
                { label: "WACC", value: "9.1%", sub: "Equity 10.4% | Debt 4.2%", icon: <Percent className="w-4 h-4 text-blue-400" /> },
                { label: "Dividend Payout", value: "34%", sub: "of Net Income", icon: <DollarSign className="w-4 h-4 text-amber-400" /> },
                { label: "Buyback Yield", value: "2.8%", sub: "of mkt cap annualized", icon: <RefreshCw className="w-4 h-4 text-violet-400" /> },
              ].map((item) => (
                <Card key={item.label} className="border-border bg-card">
                  <CardContent className="p-3 flex items-center gap-2">
                    {item.icon}
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-bold">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
