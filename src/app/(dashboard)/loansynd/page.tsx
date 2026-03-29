"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  BarChart3,
  Activity,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Building2,
  Percent,
  Clock,
  ArrowRight,
  Scale,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 844;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 844;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface LBOLoan {
  company: string;
  size: number; // $B
  spread: number; // bps over SOFR
  floor: number; // % SOFR floor
  oid: number; // OID in cents (e.g. 99 = 1pt OID)
  maturity: number; // years
  rating: string;
  type: "TLA" | "TLB" | "Revolver";
}

interface CovenantTest {
  name: string;
  threshold: number;
  current: number;
  cushion: number; // % headroom
  type: "maintenance" | "incurrence";
}

interface SecondaryLoanPoint {
  day: number;
  price: number;
  volume: number;
}

// ── Static Data ──────────────────────────────────────────────────────────────

const LBO_LOANS: LBOLoan[] = [
  { company: "Apex Manufacturing", size: 2.1, spread: 450, floor: 1.0, oid: 99.0, maturity: 7, rating: "B2/B", type: "TLB" },
  { company: "Crestwood Retail", size: 1.4, spread: 500, floor: 1.0, oid: 98.5, maturity: 7, rating: "B3/B-", type: "TLB" },
  { company: "Nexus Technology", size: 3.5, spread: 375, floor: 0.75, oid: 99.5, maturity: 7, rating: "B1/B+", type: "TLB" },
  { company: "Horizon Healthcare", size: 0.8, spread: 425, floor: 1.0, oid: 99.0, maturity: 5, rating: "B2/B", type: "TLA" },
  { company: "Vertex Energy Co", size: 1.75, spread: 550, floor: 1.0, oid: 97.5, maturity: 7, rating: "Caa1/CCC+", type: "TLB" },
  { company: "Meridian Logistics", size: 0.5, spread: 400, floor: 1.0, oid: 99.5, maturity: 5, rating: "B1/B+", type: "Revolver" },
];

const COVENANT_TESTS: CovenantTest[] = [
  { name: "Total Leverage Ratio", threshold: 6.5, current: 5.2, cushion: 20, type: "maintenance" },
  { name: "Interest Coverage Ratio", threshold: 2.0, current: 2.8, cushion: 40, type: "maintenance" },
  { name: "Senior Secured Leverage", threshold: 5.0, current: 4.1, cushion: 18, type: "incurrence" },
  { name: "Fixed Charge Coverage", threshold: 1.0, current: 1.35, cushion: 35, type: "incurrence" },
];

// ── Helper: generate secondary loan price series ─────────────────────────────
function generateLoanPrices(): SecondaryLoanPoint[] {
  resetSeed();
  const pts: SecondaryLoanPoint[] = [];
  let price = 99.25;
  for (let day = 1; day <= 30; day++) {
    price += (rand() - 0.5) * 0.6;
    price = Math.max(94, Math.min(101, price));
    const volume = 5 + rand() * 45; // $M
    pts.push({ day, price: parseFloat(price.toFixed(3)), volume: parseFloat(volume.toFixed(1)) });
  }
  return pts;
}

// ── Generate cov-lite trend ──────────────────────────────────────────────────
function generateCovLiteTrend(): { year: number; pct: number }[] {
  const base = [
    { year: 2015, pct: 55 },
    { year: 2016, pct: 62 },
    { year: 2017, pct: 70 },
    { year: 2018, pct: 74 },
    { year: 2019, pct: 80 },
    { year: 2020, pct: 76 },
    { year: 2021, pct: 87 },
    { year: 2022, pct: 90 },
    { year: 2023, pct: 88 },
    { year: 2024, pct: 91 },
  ];
  return base;
}

// ── Amortization schedule ────────────────────────────────────────────────────
function generateAmortization(principal: number, years: number, annualPct: number) {
  const bars: { year: number; remaining: number; payment: number }[] = [];
  let rem = principal;
  for (let y = 1; y <= years; y++) {
    const payment = y < years ? principal * (annualPct / 100) : rem;
    rem = Math.max(0, rem - principal * (annualPct / 100));
    bars.push({ year: y, remaining: rem, payment });
  }
  return bars;
}

// ── Investor breakdown ───────────────────────────────────────────────────────
const INVESTOR_MIX = [
  { label: "CLOs", pct: 65, color: "#6366f1" },
  { label: "Banks", pct: 12, color: "#22d3ee" },
  { label: "Hedge Funds", pct: 13, color: "#f59e0b" },
  { label: "Mutual Funds", pct: 10, color: "#10b981" },
];

// ── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ children, color = "default" }: { children: React.ReactNode; color?: "default" | "green" | "red" | "amber" | "blue" | "purple" }) {
  const cls = {
    default: "bg-foreground/10 text-foreground/70",
    green: "bg-emerald-500/20 text-emerald-300",
    red: "bg-red-500/20 text-red-300",
    amber: "bg-amber-500/20 text-amber-300",
    blue: "bg-primary/20 text-primary",
    purple: "bg-primary/20 text-primary",
  }[color];
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cls)}>
      {children}
    </span>
  );
}

// ── InfoCard ─────────────────────────────────────────────────────────────────
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-foreground/5 rounded-md border border-border p-4">
      <p className="text-xs font-semibold text-foreground/40 mb-3">{title}</p>
      {children}
    </div>
  );
}

// ── Expandable section ───────────────────────────────────────────────────────
function ExpandSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-foreground/5 rounded-md border border-border">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        {open ? <ChevronUp size={14} className="text-foreground/40" /> : <ChevronDown size={14} className="text-foreground/40" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-foreground/60 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Donut SVG ────────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { label: string; pct: number; color: string }[] }) {
  const cx = 80, cy = 80, r = 60, strokeWidth = 22;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const slices = data.map((d) => {
    const start = cumulative;
    cumulative += d.pct;
    return { ...d, start, dashArray: (d.pct / 100) * circumference, dashOffset: (-start / 100) * circumference };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map((sl, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={sl.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${sl.dashArray} ${circumference - sl.dashArray}`}
            strokeDashoffset={sl.dashOffset + circumference * 0.25}
            style={{ transition: "stroke-dasharray 0.4s ease" }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Investor</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">Mix</text>
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-sm text-foreground/70">{d.label}</span>
            <span className="text-sm font-semibold text-foreground ml-auto pl-4">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Amortization Bar Chart SVG ────────────────────────────────────────────────
function AmortizationChart({ bars }: { bars: { year: number; remaining: number; payment: number }[] }) {
  const W = 480, H = 140, pad = { top: 10, right: 10, bottom: 28, left: 44 };
  const inner = { w: W - pad.left - pad.right, h: H - pad.top - pad.bottom };
  const maxVal = bars[0]?.remaining + bars[0]?.payment || 100;
  const barW = inner.w / bars.length - 4;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.top + inner.h * (1 - t);
        return (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9">
              {(maxVal * t).toFixed(0)}
            </text>
          </g>
        );
      })}
      {bars.map((b, i) => {
        const x = pad.left + i * (inner.w / bars.length) + 2;
        const hRem = (b.remaining / maxVal) * inner.h;
        const hPay = (b.payment / maxVal) * inner.h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={pad.top + inner.h - hRem - hPay}
              width={barW}
              height={hPay}
              fill="#6366f1"
              rx={2}
            />
            <rect
              x={x}
              y={pad.top + inner.h - hRem}
              width={barW}
              height={hRem}
              fill="rgba(99,102,241,0.25)"
              rx={2}
            />
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
              Y{b.year}
            </text>
          </g>
        );
      })}
      <text x={8} y={pad.top + inner.h / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" transform={`rotate(-90,8,${pad.top + inner.h / 2})`}>
        $M
      </text>
    </svg>
  );
}

// ── Timeline SVG ─────────────────────────────────────────────────────────────
function SyndicationTimeline() {
  const steps = [
    { label: "Mandate", sub: "Lead arranger selected", week: "Wk 1", color: "#6366f1" },
    { label: "Info Memo", sub: "CIM distributed to investors", week: "Wk 2", color: "#8b5cf6" },
    { label: "Bookbuild", sub: "Orders collected, pricing set", week: "Wk 3–4", color: "#a78bfa" },
    { label: "Allocation", sub: "Commitments finalized", week: "Wk 5", color: "#22d3ee" },
    { label: "Closing", sub: "Loan funded, docs signed", week: "Wk 6", color: "#10b981" },
  ];
  const W = 520, H = 90;
  const nodeX = (i: number) => 48 + i * ((W - 96) / (steps.length - 1));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <line x1={48} x2={W - 48} y1={38} y2={38} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      {steps.map((st, i) => {
        const x = nodeX(i);
        return (
          <g key={i}>
            {i < steps.length - 1 && (
              <line x1={x} x2={nodeX(i + 1)} y1={38} y2={38} stroke={st.color} strokeWidth={2} strokeDasharray="4 2" />
            )}
            <circle cx={x} cy={38} r={10} fill={st.color} />
            <text x={x} y={43} textAnchor="middle" fill="white" fontSize="9" fontWeight="700">{i + 1}</text>
            <text x={x} y={62} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="600">{st.label}</text>
            <text x={x} y={74} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9">{st.week}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Leverage Gauge SVG ────────────────────────────────────────────────────────
function LeverageGauge({ test }: { test: CovenantTest }) {
  const W = 260, H = 64;
  const barW = W - 32, barH = 16, barY = 28;
  const maxX = test.type === "maintenance"
    ? test.threshold * 1.4
    : test.threshold * 1.5;
  const currentX = Math.min(test.current / maxX, 1);
  const threshX = test.threshold / maxX;
  const safe = test.current < test.threshold; // below threshold = ok for leverage; above = ok for coverage
  const isCoverage = test.name.includes("Coverage") || test.name.includes("Fixed");
  const ok = isCoverage ? test.current > test.threshold : test.current < test.threshold;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Track */}
      <rect x={16} y={barY} width={barW} height={barH} rx={4} fill="rgba(255,255,255,0.08)" />
      {/* Fill */}
      <rect x={16} y={barY} width={barW * currentX} height={barH} rx={4} fill={ok ? "#10b981" : "#ef4444"} />
      {/* Threshold line */}
      <rect x={16 + barW * threshX - 1} y={barY - 4} width={2} height={barH + 8} fill="#f59e0b" rx={1} />
      {/* Labels */}
      <text x={16} y={barY - 6} fill="rgba(255,255,255,0.5)" fontSize="9">0×</text>
      <text x={16 + barW * threshX} y={barY - 6} textAnchor="middle" fill="#f59e0b" fontSize="9">{test.threshold}× limit</text>
      <text x={W - 16} y={barY - 6} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="9">{maxX.toFixed(1)}×</text>
      {/* Current value label */}
      <text x={16 + barW * currentX} y={barY + barH + 14} textAnchor="middle" fill={ok ? "#10b981" : "#ef4444"} fontSize="10" fontWeight="700">
        {test.current}× current
      </text>
      <text x={W - 16} y={barY + barH + 14} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="9">
        {test.cushion}% cushion
      </text>
    </svg>
  );
}

// ── Cov-Lite Trend SVG ────────────────────────────────────────────────────────
function CovLiteChart({ data }: { data: { year: number; pct: number }[] }) {
  const W = 480, H = 130, pad = { top: 12, right: 16, bottom: 28, left: 40 };
  const inner = { w: W - pad.left - pad.right, h: H - pad.top - pad.bottom };
  const minPct = 40, maxPct = 100;
  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * inner.w;
  const yScale = (v: number) => pad.top + inner.h - ((v - minPct) / (maxPct - minPct)) * inner.h;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.pct)}`).join(" ");
  const areaD = `${pathD} L ${xScale(data.length - 1)} ${pad.top + inner.h} L ${xScale(0)} ${pad.top + inner.h} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[50, 60, 70, 80, 90, 100].map((v) => {
        const y = yScale(v);
        return (
          <g key={v}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9">{v}%</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="covlite-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#covlite-grad)" />
      <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(d.pct)} r={3} fill="#f59e0b" />
          <text x={xScale(i)} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">{d.year}</text>
        </g>
      ))}
      <text x={10} y={pad.top + inner.h / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9"
        transform={`rotate(-90,10,${pad.top + inner.h / 2})`}>
        % Cov-Lite
      </text>
    </svg>
  );
}

// ── Loan Price Line Chart SVG ─────────────────────────────────────────────────
function LoanPriceChart({ data }: { data: SecondaryLoanPoint[] }) {
  const W = 480, H = 140, pad = { top: 10, right: 16, bottom: 28, left: 44 };
  const inner = { w: W - pad.left - pad.right, h: H - pad.top - pad.bottom };
  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices) - 0.3;
  const maxP = Math.max(...prices) + 0.3;
  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * inner.w;
  const yScale = (v: number) => pad.top + inner.h - ((v - minP) / (maxP - minP)) * inner.h;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.price)}`).join(" ");
  const areaD = `${pathD} L ${xScale(data.length - 1)} ${pad.top + inner.h} L ${xScale(0)} ${pad.top + inner.h} Z`;

  const par = yScale(100);
  const dist = yScale(90);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid */}
      {[minP, (minP + maxP) / 2, maxP].map((v, i) => {
        const y = yScale(v);
        return (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {/* Par line at 100 */}
      {par >= pad.top && par <= pad.top + inner.h && (
        <line x1={pad.left} x2={W - pad.right} y1={par} y2={par} stroke="rgba(99,102,241,0.4)" strokeDasharray="4 3" />
      )}
      <defs>
        <linearGradient id="loanprice-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#loanprice-grad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
      {/* Day labels */}
      {[0, 9, 19, 29].map((i) => (
        <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
          D{data[i]?.day}
        </text>
      ))}
      {/* Latest price dot */}
      <circle cx={xScale(data.length - 1)} cy={yScale(data[data.length - 1].price)} r={4} fill="#6366f1" />
      <text x={W - pad.right} y={yScale(data[data.length - 1].price) - 6} textAnchor="end" fill="#6366f1" fontSize="10" fontWeight="700">
        {data[data.length - 1].price.toFixed(2)}
      </text>
    </svg>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function LoanSyndPage() {
  const [activeTab, setActiveTab] = useState("structure");
  const [selectedLoan, setSelectedLoan] = useState<LBOLoan | null>(null);

  const loanPrices = useMemo(() => generateLoanPrices(), []);
  const covLiteData = useMemo(() => generateCovLiteTrend(), []);
  const amortBars = useMemo(() => generateAmortization(100, 7, 1), []); // 1% annual amortization

  const latestPrice = loanPrices[loanPrices.length - 1].price;
  const priceChange = latestPrice - loanPrices[0].price;
  const bidAsk = 0.375; // typical bid/ask in pts

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Layers size={16} className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-semibold">Leveraged Loan Syndication</h1>
          <Pill color="purple">Leveraged Finance</Pill>
        </div>
        <p className="text-sm text-foreground/50 ml-11">
          Loan structure, arranger economics, CLO demand, covenant analysis, and secondary market trading
        </p>
      </div>

      {/* KPI strip — Hero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
        {[
          { label: "US LL Market Size", value: "$1.4T", sub: "Outstanding notional", icon: DollarSign, color: "text-indigo-400" },
          { label: "CLO Share of Demand", value: "65%", sub: "Primary market buyers", icon: Users, color: "text-muted-foreground" },
          { label: "Avg TLB Spread", value: "SOFR+450", sub: "B-rated credit", icon: Percent, color: "text-amber-400" },
          { label: "Cov-Lite Share", value: "91%", sub: "2024 new issuance", icon: Shield, color: "text-emerald-400" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-foreground/5 rounded-md border border-border p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon size={14} className={kpi.color} />
              <span className="text-xs text-foreground/40">{kpi.label}</span>
            </div>
            <p className="text-lg font-medium">{kpi.value}</p>
            <p className="text-xs text-foreground/40">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-foreground/5 border border-border mb-6 h-10">
          {[
            { id: "structure", label: "Loan Structure" },
            { id: "syndication", label: "Syndication Process" },
            { id: "covenants", label: "Covenant Analysis" },
            { id: "secondary", label: "Secondary Market" },
          ].map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-foreground/50 text-xs"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Loan Structure ──────────────────────────────────────────── */}
        <TabsContent value="structure" className="data-[state=inactive]:hidden space-y-5">
          {/* Deal terms table */}
          <div className="bg-foreground/5 rounded-md border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <FileText size={14} className="text-indigo-400" />
              <span className="text-sm font-medium">Sample LBO Loan Transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Company", "Size ($B)", "Spread (bps)", "SOFR Floor", "OID", "Maturity", "Rating", "Type"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-foreground/40 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LBO_LOANS.map((loan, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/50 cursor-pointer transition-colors",
                        selectedLoan?.company === loan.company ? "bg-indigo-500/10" : "hover:bg-muted/30"
                      )}
                      onClick={() => setSelectedLoan(selectedLoan?.company === loan.company ? null : loan)}
                    >
                      <td className="px-3 py-2 font-medium text-foreground/90 whitespace-nowrap">{loan.company}</td>
                      <td className="px-3 py-2 text-foreground/70">{loan.size.toFixed(1)}</td>
                      <td className="px-3 py-2 text-amber-300 font-mono">+{loan.spread}</td>
                      <td className="px-3 py-2 text-foreground/60">{loan.floor}%</td>
                      <td className="px-3 py-2">
                        <span className={cn("font-mono", loan.oid < 99 ? "text-red-300" : "text-foreground/70")}>
                          {loan.oid.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground/60">{loan.maturity}Y</td>
                      <td className="px-3 py-2">
                        <Pill color={loan.rating.includes("Caa") || loan.rating.includes("CCC") ? "red" : "blue"}>
                          {loan.rating}
                        </Pill>
                      </td>
                      <td className="px-3 py-2">
                        <Pill color={loan.type === "Revolver" ? "green" : loan.type === "TLA" ? "amber" : "purple"}>
                          {loan.type}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected loan detail */}
          <AnimatePresence>
            {selectedLoan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-4 overflow-hidden"
              >
                <p className="text-sm font-medium text-indigo-300 mb-2">{selectedLoan.company} — Deal Summary</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-foreground/40 mb-0.5">All-In Yield</p>
                    <p className="text-foreground font-mono font-medium">
                      {((selectedLoan.spread / 100) + selectedLoan.floor + (100 - selectedLoan.oid) / selectedLoan.maturity).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/40 mb-0.5">OID Discount</p>
                    <p className="text-foreground font-mono font-medium">{(100 - selectedLoan.oid).toFixed(2)} pts</p>
                  </div>
                  <div>
                    <p className="text-foreground/40 mb-0.5">Spread (bps)</p>
                    <p className="text-amber-300 font-mono font-medium">{selectedLoan.spread} bps</p>
                  </div>
                  <div>
                    <p className="text-foreground/40 mb-0.5">Loan Size</p>
                    <p className="text-foreground font-mono font-medium">${selectedLoan.size.toFixed(1)}B</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TLA vs TLB comparison + Amortization */}
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard title="Term Loan A vs Term Loan B">
              <div className="space-y-2 text-xs">
                {[
                  { feature: "Primary buyers", tla: "Banks / relationship", tlb: "Institutional / CLOs" },
                  { feature: "Amortization", tla: "5–7% annually", tlb: "1% annually" },
                  { feature: "Typical maturity", tla: "5 years", tlb: "7 years" },
                  { feature: "Spread premium", tla: "Lower (25–50bps)", tlb: "Higher (+50–100bps)" },
                  { feature: "Prepayment", tla: "Flexible", tlb: "Soft call 101 (6–12mo)" },
                  { feature: "Market depth", tla: "Limited", tlb: "Deep / liquid" },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50">
                    <span className="text-foreground/40">{row.feature}</span>
                    <span className="text-muted-foreground">{row.tla}</span>
                    <span className="text-primary">{row.tlb}</span>
                  </div>
                ))}
              </div>
            </InfoCard>

            <InfoCard title="TLB Amortization Schedule ($100M)">
              <AmortizationChart bars={amortBars} />
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" />Annual payment</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500/25 inline-block" />Remaining balance</div>
              </div>
            </InfoCard>
          </div>

          {/* Revolver + Security Package */}
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard title="Revolver Mechanics">
              <div className="space-y-2 text-xs text-foreground/65 leading-relaxed">
                <p>A revolving credit facility provides a borrower with a committed, drawable line of credit typically sized at 10–20% of total debt.</p>
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: "Commitment fee", val: "0.25–0.50% on undrawn amount" },
                    { label: "Drawn spread", val: "SOFR + 300–425 bps (same as TLA)" },
                    { label: "Letter of credit fee", val: "Applicable spread on face amount" },
                    { label: "Maturity", val: "5 years (springing if TLB > 91 days)" },
                    { label: "Financial covenant", val: "Springing leverage test (>35% drawn)" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 mt-1.5 flex-shrink-0" />
                      <span><span className="text-foreground/80 font-medium">{item.label}:</span> {item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Security Package">
              <div className="space-y-3 text-xs">
                {[
                  {
                    tier: "1st Lien",
                    color: "text-emerald-300",
                    bg: "bg-emerald-500/10",
                    items: ["All assets of borrower & guarantors", "Stock pledge (65% for foreign subs)", "IP/patents/trademarks", "Priority claim in bankruptcy"],
                  },
                  {
                    tier: "2nd Lien",
                    color: "text-amber-300",
                    bg: "bg-amber-500/10",
                    items: ["Junior lien on same collateral", "Higher spread (+200–400bps)", "Subordinated recovery claim", "Intercreditor agreement governs"],
                  },
                ].map((sec, i) => (
                  <div key={i} className={cn("rounded-lg p-3", sec.bg)}>
                    <p className={cn("font-medium mb-1.5", sec.color)}>{sec.tier} Senior Secured</p>
                    <ul className="space-y-1 text-foreground/60">
                      {sec.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                          <CheckCircle size={10} className={cn("mt-0.5 flex-shrink-0", sec.color)} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        </TabsContent>

        {/* ── Tab 2: Syndication Process ─────────────────────────────────────── */}
        <TabsContent value="syndication" className="data-[state=inactive]:hidden space-y-5">
          {/* Timeline */}
          <InfoCard title="Syndication Timeline">
            <SyndicationTimeline />
          </InfoCard>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Investor type donut */}
            <InfoCard title="Primary Market — Investor Mix">
              <DonutChart data={INVESTOR_MIX} />
              <div className="mt-4 text-xs text-foreground/50 leading-relaxed">
                CLOs dominate primary demand (65%), creating a structural bid for leveraged loans that supports tight spreads. CLO formation directly drives new-issue volumes.
              </div>
            </InfoCard>

            {/* Arranger economics */}
            <InfoCard title="Arranger Economics">
              <div className="space-y-2 text-xs">
                {[
                  { fee: "Upfront arrangement fee", typical: "1.5–2.5% of facility size" },
                  { fee: "Commitment fee (RCF)", typical: "0.25–0.50% per annum" },
                  { fee: "Admin agent fee", typical: "$50–150K annually" },
                  { fee: "Amendment / waiver fee", typical: "0.25–1.0% of affected amount" },
                  { fee: "Flex provision", typical: "±50–75 bps spread adjustment" },
                  { fee: "OID flex", typical: "±0.50–1.0 pts pricing flex" },
                  { fee: "Underwriting risk", typical: "Arranger holds ~5–10% if oversubscribed" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-start py-1.5 border-b border-border/50">
                    <span className="text-foreground/60">{row.fee}</span>
                    <span className="text-amber-300 font-mono text-right ml-4">{row.typical}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>

          {/* Flex mechanics + oversubscription */}
          <div className="grid md:grid-cols-2 gap-4">
            <ExpandSection title="Flex Mechanics — How Arrangers Adjust Price">
              <div className="space-y-2">
                <p>When demand is stronger than expected (oversubscribed), arrangers can <strong className="text-foreground">flex in</strong> — tighten spread, improve OID, or reduce fees — benefiting the borrower. When undersubscribed, they <strong className="text-foreground">flex out</strong>.</p>
                <ul className="space-y-1.5 mt-2">
                  {[
                    "Spread flex: ±25–75 bps within pre-agreed range",
                    "OID flex: ±0.5–1.0 pts (affects yield, not spread)",
                    "Structure flex: add call protection, tighten covenants",
                    "Reverse flex: borrower-friendly tightening on over-sub",
                    "Up-tiering / seniority changes in distressed flex situations",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight size={10} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ExpandSection>

            <ExpandSection title="Oversubscription Scenarios">
              <div className="space-y-2">
                <p>Book coverage ratio = Total orders / Deal size. Healthy books show 3–5× coverage, though CLO manager behavior (soft commits) inflates apparent demand.</p>
                <div className="mt-2 space-y-2">
                  {[
                    { cov: "1–1.5×", outcome: "Undersubscribed — arranger holds, flex out likely" },
                    { cov: "2–3×", outcome: "Healthy — price at initial guidance, pro-rata alloc" },
                    { cov: "4–6×", outcome: "Strong — reverse flex in, scale back investors" },
                    { cov: "7×+", outcome: "Hot deal — significant tightening, strategic allocation" },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="w-14 font-mono text-amber-300 flex-shrink-0">{s.cov}</span>
                      <span>{s.outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ExpandSection>
          </div>

          {/* CLO mechanics */}
          <InfoCard title="CLO Demand Engine">
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              {[
                {
                  title: "CLO Structure",
                  color: "text-primary",
                  points: [
                    "SPV holds 150–250 leveraged loans",
                    "Tranched liabilities: AAA→equity",
                    "Reinvestment period: 3–5 years",
                    "Non-call period: 1–2 years",
                  ],
                },
                {
                  title: "Arbitrage Driver",
                  color: "text-muted-foreground",
                  points: [
                    "Loan yield: SOFR + 400–500 bps",
                    "AAA CLO liability: SOFR + 130–160 bps",
                    "Arbitrage spread: ~300–350 bps gross",
                    "Equity NAV: ~10–15% target IRR",
                  ],
                },
                {
                  title: "Demand Signals",
                  color: "text-emerald-300",
                  points: [
                    "New CLO formation pace (weekly)",
                    "CLO print volumes by arranger",
                    "Reinvestment / amend-extend activity",
                    "Equity tranche demand from hedge funds",
                  ],
                },
              ].map((col, i) => (
                <div key={i}>
                  <p className={cn("font-medium mb-2", col.color)}>{col.title}</p>
                  <ul className="space-y-1.5 text-foreground/60">
                    {col.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-foreground/30 mt-1.5 flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </InfoCard>
        </TabsContent>

        {/* ── Tab 3: Covenant Analysis ───────────────────────────────────────── */}
        <TabsContent value="covenants" className="data-[state=inactive]:hidden space-y-5">
          {/* Maintenance vs Incurrence */}
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard title="Financial Maintenance Covenants">
              <div className="space-y-2 text-xs text-foreground/65 leading-relaxed">
                <p className="text-foreground/80 font-medium">Tested every quarter — breach triggers default</p>
                <ul className="space-y-2 mt-2">
                  {[
                    { name: "Total Leverage Ratio", desc: "Net Debt / EBITDA ≤ defined step-down schedule" },
                    { name: "Interest Coverage", desc: "EBITDA / Cash Interest ≥ 2.0× minimum" },
                    { name: "Fixed Charge Coverage", desc: "(EBITDA – Capex) / (Interest + Debt Service) ≥ 1.0×" },
                    { name: "Min EBITDA", desc: "Absolute floor to protect liquidity" },
                  ].map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle size={11} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><span className="text-foreground/80 font-medium">{c.name}:</span> {c.desc}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 p-2 bg-emerald-500/10 rounded-lg">
                  <p className="text-emerald-300 font-medium">Lender-friendly: regular monitoring catch issues early</p>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Incurrence Covenants (Cov-Lite)">
              <div className="space-y-2 text-xs text-foreground/65 leading-relaxed">
                <p className="text-foreground/80 font-medium">Tested only when borrower takes an action</p>
                <ul className="space-y-2 mt-2">
                  {[
                    { name: "Debt Basket", desc: "Cannot incur incremental debt unless Pro Forma leverage ≤ threshold" },
                    { name: "Restricted Payments", desc: "Dividends / distributions only if FCCR ≥ 2.0× Pro Forma" },
                    { name: "Asset Sales", desc: "Proceeds must be reinvested or used to repay debt" },
                    { name: "Investment Basket", desc: "Acquisitions tested against leverage or EBITDA builder" },
                  ].map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span><span className="text-foreground/80 font-medium">{c.name}:</span> {c.desc}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 p-2 bg-amber-500/10 rounded-lg">
                  <p className="text-amber-300 font-medium">Borrower-friendly: no ongoing default risk from operations</p>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Covenant test gauges */}
          <div className="bg-foreground/5 rounded-md border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-indigo-400" />
              <span className="text-sm font-medium">Leverage & Coverage Ratio Tests</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {COVENANT_TESTS.map((test, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground/70 font-medium">{test.name}</span>
                    <Pill color={test.type === "maintenance" ? "green" : "amber"}>
                      {test.type}
                    </Pill>
                  </div>
                  <LeverageGauge test={test} />
                </div>
              ))}
            </div>
          </div>

          {/* Cov-lite trend */}
          <InfoCard title="Cov-Lite Trend — % of New Issuance">
            <CovLiteChart data={covLiteData} />
            <p className="text-xs text-foreground/40 mt-2">
              Cov-lite loans (incurrence only) now represent 90%+ of new TLB issuance, driven by CLO demand and borrower negotiating leverage.
            </p>
          </InfoCard>

          {/* Restricted payments + EBITDA add-backs */}
          <div className="grid md:grid-cols-2 gap-4">
            <ExpandSection title="Restricted Payments Basket">
              <div className="space-y-2">
                <p>Restricted payments (RPs) include dividends, share buybacks, sponsor management fees, and inter-company transfers. Modern credit agreements contain multiple RP baskets:</p>
                <div className="mt-2 space-y-1.5">
                  {[
                    { basket: "General basket", val: "$25–50M fixed dollar" },
                    { basket: "Builder basket (Grower)", val: "50% of cumulative CNI since closing" },
                    { basket: "Ratio basket", val: "FCCR ≥ 2.0× Pro Forma test" },
                    { basket: "Available amount", val: "Retained Excess Cash Flow" },
                    { basket: "Permitted restricted payment", val: "Tax distributions, management fees" },
                  ].map((b, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span className="text-foreground/60">{b.basket}</span>
                      <span className="text-indigo-300 font-mono text-right text-xs">{b.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ExpandSection>

            <ExpandSection title="EBITDA Add-backs & Adjustments">
              <div className="space-y-2">
                <p>Modern credit agreements allow aggressive EBITDA adjustments that inflate covenant headroom and leverage calculations:</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    "Cost savings (12–24mo run-rate synergies)",
                    "Restructuring charges (no cap in cov-lite deals)",
                    "Transaction costs & fees",
                    "Non-cash compensation (SBC)",
                    "One-time / non-recurring losses",
                    "Pro forma for acquisitions (unlimited lookback)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight size={10} className="mt-0.5 text-amber-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ExpandSection>
          </div>
        </TabsContent>

        {/* ── Tab 4: Secondary Market ────────────────────────────────────────── */}
        <TabsContent value="secondary" className="data-[state=inactive]:hidden space-y-5">
          {/* Price chart */}
          <div className="bg-foreground/5 rounded-md border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-indigo-400" />
                <span className="text-sm font-medium">Secondary Loan Price — 30 Day History</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-foreground/50">Nexus Technology TLB</span>
                <span className={cn("font-mono font-medium", priceChange >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(3)} pts
                </span>
              </div>
            </div>
            <LoanPriceChart data={loanPrices} />
            <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
              <div className="text-center">
                <p className="text-foreground/40">Current Bid</p>
                <p className="text-foreground font-mono font-medium">{(latestPrice - bidAsk / 2).toFixed(3)}</p>
              </div>
              <div className="text-center">
                <p className="text-foreground/40">Current Ask</p>
                <p className="text-foreground font-mono font-medium">{(latestPrice + bidAsk / 2).toFixed(3)}</p>
              </div>
              <div className="text-center">
                <p className="text-foreground/40">Bid/Ask Spread</p>
                <p className="text-amber-300 font-mono font-medium">{bidAsk.toFixed(3)} pts</p>
              </div>
            </div>
          </div>

          {/* Par vs Distressed + LSTA conventions */}
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard title="Par vs Distressed Trading Thresholds">
              <div className="space-y-3 text-xs">
                <div className="space-y-2">
                  {[
                    { range: "98–102", label: "Par / Near-Par", color: "bg-emerald-500", note: "T+7 settlement (LSTA standard)" },
                    { range: "90–98", label: "Discount", color: "bg-cyan-500", note: "T+7, elevated bid/ask 0.5–1.0 pts" },
                    { range: "80–90", label: "Sub-par", color: "bg-amber-500", note: "Wider spreads, reduced liquidity" },
                    { range: "< 80", label: "Distressed", color: "bg-red-500", note: "Claim trading, 30–45 day settlement" },
                    { range: "< 50", label: "Deep Distressed", color: "bg-red-800", note: "Restructuring / bankruptcy risk" },
                  ].map((tier, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="font-mono text-foreground/60 w-14 flex-shrink-0">{tier.range}</span>
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", tier.color)} />
                      <span className="text-foreground/80 font-medium w-24 flex-shrink-0">{tier.label}</span>
                      <span className="text-foreground/40">{tier.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>

            <InfoCard title="LSTA Trading Conventions">
              <div className="space-y-2 text-xs">
                {[
                  { key: "Settlement", val: "T+7 business days (par), T+20+ (distressed)" },
                  { key: "Documentation", val: "LSTA Standard Terms & Conditions (STAC)" },
                  { key: "Trade date", val: "As-of date for accrued interest calculation" },
                  { key: "Funding mechanics", val: "Agent-facilitated via administrative agent" },
                  { key: "Buy/sell confirmation", val: "Electronic: Clearpar, DebtDomain" },
                  { key: "Delayed compensation", val: "Accrued interest paid for settlement delays" },
                  { key: "Minimum transfer", val: "$1M (par), $250K (distressed)" },
                  { key: "Consent requirement", val: "Borrower consent (not required for assigns > min)" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-foreground/50">{row.key}</span>
                    <span className="text-foreground/80 text-right ml-4 max-w-[55%]">{row.val}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>

          {/* TRS on loans + Indices */}
          <div className="grid md:grid-cols-2 gap-4">
            <ExpandSection title="Total Return Swap on Loans">
              <div className="space-y-2">
                <p>A Total Return Swap (TRS) on loans allows an investor to gain economic exposure to a loan's total return (interest + price change) without owning it directly, useful for:</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    "Hedge funds: leveraged long/short positions without settlement burden",
                    "Banks: regulatory capital relief by transferring economic risk",
                    "CLOs: synthetic ramp-up before loan settlement",
                    "Insurance companies: unfunded exposure for yield enhancement",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 p-2 bg-foreground/5 rounded-lg">
                  <p className="text-foreground/70 font-medium mb-1">TRS cash flows:</p>
                  <p className="text-foreground/50">Protection buyer pays SOFR + spread; receives coupon + price appreciation (or pays depreciation) on notional.</p>
                </div>
              </div>
            </ExpandSection>

            <InfoCard title="Loan Market Indices">
              <div className="space-y-3 text-xs">
                {[
                  {
                    name: "LSTA Leveraged Loan Index",
                    ticker: "LSTA LLI",
                    color: "text-indigo-300",
                    points: ["~1,400 loans, $1.2T+ market value", "Float-adjusted par-weighted", "Daily pricing from LSTA/dealer quotes", "Benchmark for CLO and fund managers"],
                  },
                  {
                    name: "S&P/LSTA LCD Loan Index",
                    ticker: "S&P LCD",
                    color: "text-primary",
                    points: ["Largest leveraged loans only (>$100M)", "Used by ETF and loan fund managers", "Total return, spread duration, OAS stats", "Subindices: BB, B, CCC/split-rated"],
                  },
                ].map((idx, i) => (
                  <div key={i} className="p-3 bg-foreground/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className={cn("font-medium", idx.color)}>{idx.name}</span>
                      <Pill color="default">{idx.ticker}</Pill>
                    </div>
                    <ul className="space-y-1 text-foreground/50">
                      {idx.points.map((pt, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-foreground/30 mt-1.5 flex-shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>

          {/* Key secondary market metrics */}
          <div className="bg-foreground/5 rounded-md border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={14} className="text-amber-400" />
              <span className="text-sm font-medium">Secondary Market Key Metrics</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: "Daily trading volume", val: "~$3–5B", sub: "LSTA reported" },
                { label: "Par bid/ask (liquid)", val: "0.125–0.375 pts", sub: "Investment grade borrowers" },
                { label: "Distressed bid/ask", val: "1–3 pts", sub: "Below 80 price" },
                { label: "Avg days to settle", val: "12 days", sub: "2024 industry avg" },
              ].map((m, i) => (
                <div key={i} className="p-3 bg-foreground/5 rounded-lg text-center">
                  <p className="text-foreground/40 mb-1">{m.label}</p>
                  <p className="text-foreground font-medium font-mono">{m.val}</p>
                  <p className="text-foreground/30 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
