"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  BarChart3,
  Building2,
  TrendingUp,
  DollarSign,
  Layers,
  Target,
  CheckCircle,
  ChevronRight,
  Star,
  AlertTriangle,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Shield,
  Users,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 642002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 642002;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ValuationMethod {
  name: string;
  low: number;
  high: number;
  mid: number;
  color: string;
  description: string;
}

interface CompanyComp {
  name: string;
  ticker: string;
  ev: number; // $B
  revenue: number; // $B
  ebitda: number; // $B
  netIncome: number; // $B
  evRevenue: number;
  evEbitda: number;
  pe: number;
  sector: string;
}

interface SynergyItem {
  category: string;
  type: "Revenue" | "Cost";
  year1: number;
  year2: number;
  year3: number;
  fullyLoaded: number;
  confidence: "High" | "Medium" | "Low";
}

interface DebtTranche {
  name: string;
  amount: number; // $M
  rate: number; // %
  spread: number; // bps over SOFR
  maturity: number; // years
  rating: string;
}

// ── Data Generation ────────────────────────────────────────────────────────────

resetSeed();

const VALUATION_METHODS: ValuationMethod[] = [
  {
    name: "DCF Analysis",
    low: 48.2,
    high: 67.8,
    mid: 57.4,
    color: "#3b82f6",
    description: "10-yr FCF projection, WACC 8.5–10.5%, terminal growth 2.5–3.5%",
  },
  {
    name: "Public Comps (EV/EBITDA)",
    low: 52.0,
    high: 71.5,
    mid: 61.2,
    color: "#8b5cf6",
    description: "8.5x–11.5x NTM EBITDA; median peer at 10.1x",
  },
  {
    name: "Precedent Transactions",
    low: 58.5,
    high: 82.0,
    mid: 70.3,
    color: "#10b981",
    description: "Includes 25–35% control premium; 12–16x EBITDA",
  },
  {
    name: "LBO Analysis",
    low: 44.0,
    high: 59.5,
    mid: 51.8,
    color: "#f59e0b",
    description: "25% IRR hurdle; 5x leverage; 5-yr hold; 8–9x exit multiple",
  },
  {
    name: "52-Week Trading Range",
    low: 38.7,
    high: 56.2,
    mid: 47.5,
    color: "#6b7280",
    description: "Current price: $47.50; 52W high: $56.20; 52W low: $38.70",
  },
];

const COMPS_TABLE: CompanyComp[] = [
  { name: "Nexus Technologies", ticker: "NXTS", ev: 18.4, revenue: 2.1, ebitda: 0.52, netIncome: 0.31, evRevenue: 8.8, evEbitda: 35.4, pe: 41.2, sector: "Software" },
  { name: "Orbis Solutions", ticker: "ORBS", ev: 24.7, revenue: 3.4, ebitda: 0.89, netIncome: 0.58, evRevenue: 7.3, evEbitda: 27.8, pe: 32.6, sector: "Software" },
  { name: "Vertex Analytics", ticker: "VRTX", ev: 11.2, revenue: 1.6, ebitda: 0.41, netIncome: 0.22, evRevenue: 7.0, evEbitda: 27.3, pe: 35.8, sector: "Software" },
  { name: "Cascade Platforms", ticker: "CASC", ev: 31.5, revenue: 4.2, ebitda: 1.18, netIncome: 0.74, evRevenue: 7.5, evEbitda: 26.7, pe: 29.4, sector: "Software" },
  { name: "Meridian Systems", ticker: "MRID", ev: 8.9, revenue: 1.1, ebitda: 0.28, netIncome: 0.14, evRevenue: 8.1, evEbitda: 31.8, pe: 44.1, sector: "Software" },
  { name: "Apex Cloud Corp", ticker: "APXC", ev: 42.1, revenue: 5.8, ebitda: 1.67, netIncome: 1.02, evRevenue: 7.3, evEbitda: 25.2, pe: 27.3, sector: "Software" },
  { name: "Stratos Digital", ticker: "STRD", ev: 15.6, revenue: 1.9, ebitda: 0.47, netIncome: 0.26, evRevenue: 8.2, evEbitda: 33.2, pe: 39.5, sector: "Software" },
  { name: "Luminary Tech", ticker: "LMRY", ev: 27.3, revenue: 3.7, ebitda: 1.02, netIncome: 0.65, evRevenue: 7.4, evEbitda: 26.8, pe: 30.9, sector: "Software" },
];

const SYNERGIES: SynergyItem[] = [
  { category: "Cross-sell / Upsell Revenue", type: "Revenue", year1: 12, year2: 28, year3: 45, fullyLoaded: 55, confidence: "Medium" },
  { category: "New Market Penetration", type: "Revenue", year1: 5, year2: 15, year3: 30, fullyLoaded: 40, confidence: "Low" },
  { category: "Headcount Reduction", type: "Cost", year1: 35, year2: 40, year3: 42, fullyLoaded: 45, confidence: "High" },
  { category: "Procurement / Vendor Savings", type: "Cost", year1: 8, year2: 12, year3: 15, fullyLoaded: 18, confidence: "High" },
  { category: "Facility Consolidation", type: "Cost", year1: 6, year2: 10, year3: 13, fullyLoaded: 14, confidence: "Medium" },
  { category: "Technology Integration Savings", type: "Cost", year1: 4, year2: 9, year3: 12, fullyLoaded: 15, confidence: "Medium" },
];

const DEBT_TRANCHES: DebtTranche[] = [
  { name: "Revolving Credit Facility", amount: 500, rate: 6.85, spread: 175, maturity: 5, rating: "BBB" },
  { name: "Term Loan A (TLA)", amount: 1200, rate: 7.10, spread: 200, maturity: 5, rating: "BBB" },
  { name: "Term Loan B (TLB)", amount: 2500, rate: 7.60, spread: 250, maturity: 7, rating: "BB+" },
  { name: "Senior Secured Notes", amount: 1500, rate: 8.25, spread: 315, maturity: 8, rating: "BB+" },
  { name: "Senior Unsecured Notes", amount: 800, rate: 9.50, spread: 440, maturity: 10, rating: "BB-" },
  { name: "Mezzanine / PIK Notes", amount: 400, rate: 12.50, spread: 740, maturity: 7, rating: "B+" },
];

// ── Stat helpers ───────────────────────────────────────────────────────────────

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function median(arr: number[]): number {
  return percentile(arr, 50);
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ── Football Field Chart ───────────────────────────────────────────────────────

function FootballFieldChart() {
  const chartWidth = 680;
  const chartHeight = 56 * VALUATION_METHODS.length + 60;
  const leftPad = 185;
  const rightPad = 24;
  const plotW = chartWidth - leftPad - rightPad;
  const barH = 28;
  const rowH = 56;

  const allVals = VALUATION_METHODS.flatMap((m) => [m.low, m.high]);
  const minVal = Math.min(...allVals) - 5;
  const maxVal = Math.max(...allVals) + 5;
  const range = maxVal - minVal;

  const toX = (v: number) => ((v - minVal) / range) * plotW;

  // Current price line
  const currentPrice = 47.5;
  const priceX = toX(currentPrice);

  // X-axis tick labels
  const ticks = [35, 45, 55, 65, 75, 85];

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="overflow-visible"
    >
      {/* Background grid */}
      {ticks.map((t) => {
        const x = leftPad + toX(t);
        return (
          <line
            key={t}
            x1={x}
            y1={16}
            x2={x}
            y2={chartHeight - 28}
            stroke="#374151"
            strokeWidth={1}
            strokeDasharray="4,3"
          />
        );
      })}

      {/* Bars */}
      {VALUATION_METHODS.map((m, i) => {
        const y = 20 + i * rowH;
        const bx = leftPad + toX(m.low);
        const bw = toX(m.high) - toX(m.low);
        const mx = leftPad + toX(m.mid);

        return (
          <g key={m.name}>
            {/* Label */}
            <text
              x={leftPad - 8}
              y={y + barH / 2 + 5}
              textAnchor="end"
              fontSize={11}
              fill="#d1d5db"
              fontFamily="Inter, sans-serif"
            >
              {m.name}
            </text>

            {/* Bar background */}
            <rect
              x={bx}
              y={y}
              width={bw}
              height={barH}
              rx={4}
              fill={m.color}
              opacity={0.25}
            />
            {/* Bar main */}
            <rect
              x={bx}
              y={y + 4}
              width={bw}
              height={barH - 8}
              rx={3}
              fill={m.color}
              opacity={0.75}
            />

            {/* Low label */}
            <text
              x={bx - 3}
              y={y + barH / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill={m.color}
              fontFamily="monospace"
            >
              ${m.low.toFixed(1)}
            </text>

            {/* High label */}
            <text
              x={bx + bw + 3}
              y={y + barH / 2 + 4}
              textAnchor="start"
              fontSize={10}
              fill={m.color}
              fontFamily="monospace"
            >
              ${m.high.toFixed(1)}
            </text>

            {/* Mid tick */}
            <line
              x1={mx}
              y1={y}
              x2={mx}
              y2={y + barH}
              stroke="#fff"
              strokeWidth={2}
              opacity={0.8}
            />
          </g>
        );
      })}

      {/* Current price line */}
      <line
        x1={leftPad + priceX}
        y1={16}
        x2={leftPad + priceX}
        y2={chartHeight - 28}
        stroke="#f59e0b"
        strokeWidth={2}
        strokeDasharray="6,3"
      />
      <text
        x={leftPad + priceX}
        y={12}
        textAnchor="middle"
        fontSize={10}
        fill="#f59e0b"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
      >
        Current ${currentPrice}
      </text>

      {/* X-axis labels */}
      {ticks.map((t) => (
        <text
          key={t}
          x={leftPad + toX(t)}
          y={chartHeight - 8}
          textAnchor="middle"
          fontSize={10}
          fill="#9ca3af"
          fontFamily="monospace"
        >
          ${t}
        </text>
      ))}

      {/* Axis label */}
      <text
        x={chartWidth / 2}
        y={chartHeight - 8}
        textAnchor="middle"
        fontSize={9}
        fill="#6b7280"
        fontFamily="Inter, sans-serif"
      >
        Implied Share Price (USD)
      </text>
    </svg>
  );
}

// ── Pitch Structure Tab ────────────────────────────────────────────────────────

const PITCH_SECTIONS = [
  {
    id: 1,
    title: "Executive Summary",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10 border-border",
    status: "complete",
    keyPoints: [
      "Transformational combination creating $8.2B market leader in enterprise SaaS",
      "Implied offer price of $72.50/share (52% premium to 30-day VWAP)",
      "Estimated $170M+ run-rate synergies within 36 months",
      "EPS accretive in Year 2 on a cash basis; Year 3 on a GAAP basis",
    ],
    owner: "Goldman Sachs — M&A Advisory",
    confidence: 95,
  },
  {
    id: 2,
    title: "Situation Overview",
    icon: Activity,
    color: "text-primary",
    bg: "bg-primary/10 border-border",
    status: "complete",
    keyPoints: [
      "Target: Stratos Digital (STRD) — $15.6B enterprise value, growing 22% YoY",
      "Acquirer: Nexus Technologies (NXTS) — strategic desire to expand into mid-market segment",
      "STRD trading at trough valuation; integration risk priced in after CTO departure",
      "Board has received preliminary indication of interest at $65–$72 per share",
    ],
    owner: "Sector Coverage — TMT",
    confidence: 88,
  },
  {
    id: 3,
    title: "Strategic Alternatives",
    icon: Scale,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    status: "in-progress",
    keyPoints: [
      "Status Quo: Organic growth path; risks missing revenue target; lowest long-term value",
      "Partial Sale / Carve-Out: Monetize data analytics division at ~14x EBITDA",
      "Strategic Merger (Recommended): Full combination with NXTS; highest synergy capture",
      "Financial Sponsor Buyout: LBO viable at 5–5.5x leverage; 22–26% IRR at $62–68/share",
    ],
    owner: "Restructuring + M&A",
    confidence: 72,
  },
  {
    id: 4,
    title: "Board Recommendation",
    icon: CheckCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    status: "pending",
    keyPoints: [
      "RECOMMEND: Strategic merger with NXTS at $72.50/share (cash + stock consideration)",
      "Consideration: $43.50 cash + 0.412 NXTS shares per STRD share",
      "Definitive agreement to be signed subject to Board approval and regulatory clearance",
      "Go-shop period: 35 days; termination fee: 3.0% of transaction value",
    ],
    owner: "Board of Directors",
    confidence: 60,
  },
];

function PitchStructureTab() {
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const active = PITCH_SECTIONS.find((s) => s.id === selectedSection)!;

  const statusColor = (st: string) =>
    st === "complete"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : st === "in-progress"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-muted/50 text-muted-foreground border-border";

  const statusLabel = (st: string) =>
    st === "complete" ? "Complete" : st === "in-progress" ? "In Progress" : "Pending";

  return (
    <div className="space-y-6">
      {/* Deal header card */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transaction</p>
                <p className="text-sm font-semibold text-white">NXTS Acquires STRD</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 ml-auto">
              {[
                { label: "Deal Value", value: "$8.2B" },
                { label: "Premium", value: "52%" },
                { label: "Offer Price", value: "$72.50" },
                { label: "Structure", value: "Cash + Stock" },
              ].map((item) => (
                <div key={item.label} className="text-center px-3 py-1 rounded-lg bg-muted border border-border">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitch outline steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {PITCH_SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          const isActive = section.id === selectedSection;
          return (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSection(section.id)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? section.bg + " ring-1 ring-current"
                  : "bg-card border-border hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-muted-foreground">0{idx + 1}</span>
                <Icon className={`w-4 h-4 ${isActive ? section.color : "text-muted-foreground"}`} />
                {idx < PITCH_SECTIONS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                )}
              </div>
              <p className={`text-xs font-semibold ${isActive ? "text-white" : "text-muted-foreground"}`}>
                {section.title}
              </p>
              <div className="mt-2">
                <Badge className={`text-xs px-1.5 py-0 border ${statusColor(section.status)}`}>
                  {statusLabel(section.status)}
                </Badge>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Section detail */}
      <motion.div
        key={selectedSection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <active.icon className={`w-5 h-5 ${active.color}`} />
                {active.title}
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Advisor: {active.owner}</span>
                <Badge className={`text-xs border ${statusColor(active.status)}`}>
                  {statusLabel(active.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Section Completion</span>
                <span className="text-xs font-mono text-muted-foreground">{active.confidence}%</span>
              </div>
              <Progress value={active.confidence} className="h-1.5" />
            </div>
            <ul className="space-y-3">
              {active.keyPoints.map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-mono text-muted-foreground mt-0.5">
                    {i + 1}
                  </span>
                  {point}
                </motion.li>
              ))}
            </ul>

            {/* Action row */}
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="text-xs border-border text-muted-foreground hover:bg-muted">
                <FileText className="w-3 h-3 mr-1" /> Edit Section
              </Button>
              <Button size="sm" variant="outline" className="text-xs border-border text-muted-foreground hover:bg-muted">
                <CheckCircle className="w-3 h-3 mr-1" /> Mark Complete
              </Button>
              <Button size="sm" variant="outline" className="text-xs border-border text-muted-foreground hover:bg-muted">
                <Users className="w-3 h-3 mr-1" /> Assign Reviewer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* IB process timeline */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Deal Process Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {[
              { phase: "Mandate", date: "Jan 8", done: true },
              { phase: "Due Diligence", date: "Jan–Feb", done: true },
              { phase: "Pitch Book", date: "Feb 14", done: true },
              { phase: "Board Presentation", date: "Mar 3", done: false },
              { phase: "LOI / MOU", date: "Mar 15", done: false },
              { phase: "Definitive Agmt.", date: "Apr 1", done: false },
              { phase: "Regulatory Filing", date: "Apr–Jun", done: false },
              { phase: "Close", date: "Jul 1", done: false },
            ].map((step, i, arr) => (
              <div key={step.phase} className="flex items-center flex-shrink-0">
                <div className="text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                      step.done
                        ? "bg-primary border-primary text-white"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap w-20 text-center">{step.phase}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{step.date}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className={`h-px w-6 mx-1 mt-[-18px] ${step.done ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Valuation Summary Tab ──────────────────────────────────────────────────────

function ValuationSummaryTab() {
  const [selectedMethod, setSelectedMethod] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Football field chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white">Football Field — Implied Share Price</CardTitle>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              Offer: $72.50
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            STRD valuation range across 5 methodologies | Current price: $47.50
          </p>
        </CardHeader>
        <CardContent>
          <FootballFieldChart />
        </CardContent>
      </Card>

      {/* Method cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {VALUATION_METHODS.map((m, i) => (
          <motion.button
            key={m.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod(i)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedMethod === i
                ? "border-muted-foreground bg-muted ring-1 ring-muted-foreground"
                : "border-border bg-card hover:border-border"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: m.color, opacity: 0.8 }}
              />
              <span className="text-xs font-semibold text-white">{m.name}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold" style={{ color: m.color }}>
                ${m.mid.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground mb-1">mid</span>
            </div>
            <div className="text-xs text-muted-foreground">
              ${m.low.toFixed(1)} – ${m.high.toFixed(1)}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected method description */}
      <motion.div
        key={selectedMethod}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div
                className="w-2 rounded-full mt-1 self-stretch"
                style={{ backgroundColor: VALUATION_METHODS[selectedMethod].color }}
              />
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  {VALUATION_METHODS[selectedMethod].name} — Methodology Notes
                </p>
                <p className="text-sm text-muted-foreground">
                  {VALUATION_METHODS[selectedMethod].description}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: "Floor", value: `$${VALUATION_METHODS[selectedMethod].low.toFixed(1)}` },
                    { label: "Mid-Point", value: `$${VALUATION_METHODS[selectedMethod].mid.toFixed(1)}` },
                    { label: "Ceiling", value: `$${VALUATION_METHODS[selectedMethod].high.toFixed(1)}` },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p
                        className="text-base font-bold"
                        style={{ color: VALUATION_METHODS[selectedMethod].color }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sensitivity table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">DCF Sensitivity — Share Price vs WACC &amp; Terminal Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-muted-foreground font-medium text-left p-2">WACC \ TGR</th>
                  {["2.0%", "2.5%", "3.0%", "3.5%", "4.0%"].map((tgr) => (
                    <th key={tgr} className="text-muted-foreground font-semibold text-center p-2">{tgr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[8.0, 8.5, 9.0, 9.5, 10.0, 10.5].map((wacc, wi) => (
                  <tr key={wacc} className="border-t border-border">
                    <td className="text-muted-foreground font-semibold p-2">{wacc.toFixed(1)}%</td>
                    {[2.0, 2.5, 3.0, 3.5, 4.0].map((tgr, ti) => {
                      // Synthetic price: base 57.4, adjust by wacc/tgr
                      const base = 57.4;
                      const val = base + (5 - wi) * 2.8 + (ti - 2) * 3.2;
                      const isMiddle = wi === 2 && ti === 2;
                      const isHigh = val > 70;
                      const isLow = val < 45;
                      return (
                        <td
                          key={tgr}
                          className={`text-center p-2 font-mono ${
                            isMiddle
                              ? "bg-primary/20 text-primary font-bold"
                              : isHigh
                              ? "text-emerald-400"
                              : isLow
                              ? "text-red-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          ${val.toFixed(1)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Comparable Companies Tab ───────────────────────────────────────────────────

function ComparableCompaniesTab() {
  const [sortField, setSortField] = useState<keyof CompanyComp>("evEbitda");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    return [...COMPS_TABLE].sort((a, b) => {
      const av = a[sortField] as number;
      const bv = b[sortField] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [sortField, sortDir]);

  const toggleSort = (field: keyof CompanyComp) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const evRevVals = COMPS_TABLE.map((c) => c.evRevenue);
  const evEbVals = COMPS_TABLE.map((c) => c.evEbitda);
  const peVals = COMPS_TABLE.map((c) => c.pe);

  const stats = [
    {
      label: "EV/Revenue",
      p25: percentile(evRevVals, 25),
      median: median(evRevVals),
      mean: mean(evRevVals),
      p75: percentile(evRevVals, 75),
    },
    {
      label: "EV/EBITDA",
      p25: percentile(evEbVals, 25),
      median: median(evEbVals),
      mean: mean(evEbVals),
      p75: percentile(evEbVals, 75),
    },
    {
      label: "P/E",
      p25: percentile(peVals, 25),
      median: median(peVals),
      mean: mean(peVals),
      p75: percentile(peVals, 75),
    },
  ];

  const cols: Array<{ label: string; field: keyof CompanyComp; fmt: (v: number) => string }> = [
    { label: "EV ($B)", field: "ev", fmt: (v) => `$${v.toFixed(1)}B` },
    { label: "Revenue ($B)", field: "revenue", fmt: (v) => `$${v.toFixed(1)}B` },
    { label: "EBITDA ($B)", field: "ebitda", fmt: (v) => `$${v.toFixed(2)}B` },
    { label: "EV/Rev", field: "evRevenue", fmt: (v) => `${v.toFixed(1)}x` },
    { label: "EV/EBITDA", field: "evEbitda", fmt: (v) => `${v.toFixed(1)}x` },
    { label: "P/E", field: "pe", fmt: (v) => `${v.toFixed(1)}x` },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((st) => (
          <Card key={st.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-3">{st.label} — Peer Group Statistics</p>
              <div className="space-y-2">
                {[
                  { k: "25th Pct.", v: st.p25, color: "text-muted-foreground" },
                  { k: "Median", v: st.median, color: "text-primary" },
                  { k: "Mean", v: st.mean, color: "text-muted-foreground" },
                  { k: "75th Pct.", v: st.p75, color: "text-emerald-400" },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{row.k}</span>
                    <span className={`text-sm font-bold font-mono ${row.color}`}>
                      {row.v.toFixed(1)}x
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comps table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Enterprise Software Peer Group (n=8)</CardTitle>
            <Badge className="bg-muted text-muted-foreground border-border text-xs">NTM Estimates</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground font-medium">Company</th>
                  <th className="text-left p-2 text-muted-foreground font-medium">Ticker</th>
                  {cols.map((col) => (
                    <th
                      key={col.field}
                      className="text-right p-2 text-muted-foreground font-medium cursor-pointer hover:text-muted-foreground select-none"
                      onClick={() => toggleSort(col.field)}
                    >
                      {col.label}
                      {sortField === col.field && (
                        <span className="ml-1 text-primary">
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((comp, i) => (
                  <motion.tr
                    key={comp.ticker}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-2 text-foreground font-medium">{comp.name}</td>
                    <td className="p-2">
                      <Badge className="bg-muted text-muted-foreground border-border text-xs font-mono">
                        {comp.ticker}
                      </Badge>
                    </td>
                    {cols.map((col) => {
                      const val = comp[col.field] as number;
                      const isEv = col.field === "evEbitda";
                      const isMed = isEv && Math.abs(val - median(evEbVals)) < 1.5;
                      return (
                        <td
                          key={col.field}
                          className={`p-2 text-right font-mono ${
                            isMed ? "text-primary font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {col.fmt(val)}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
                {/* Median row */}
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="p-2 text-primary font-bold" colSpan={2}>Median</td>
                  {cols.map((col) => {
                    const vals = COMPS_TABLE.map((c) => c[col.field] as number);
                    const med = median(vals);
                    const isNum = ["ev", "revenue", "ebitda"].includes(col.field);
                    return (
                      <td key={col.field} className="p-2 text-right font-mono text-primary font-bold">
                        {isNum ? `$${med.toFixed(1)}B` : `${med.toFixed(1)}x`}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Target implied value */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Implied Target Value — Applied Peer Multiples to STRD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "EV/Revenue (7.5x median)", implied: "$14.3B", share: "$54.2", delta: "+14.1%" },
              { label: "EV/EBITDA (29.5x median)", implied: "$13.9B", share: "$52.6", delta: "+10.7%" },
              { label: "P/E (34.2x median)", implied: "$8.9B", share: "$58.4", delta: "+22.9%" },
            ].map((row) => (
              <div key={row.label} className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground mb-2">{row.label}</p>
                <p className="text-lg font-bold text-white">{row.share}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{row.implied} EV</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                    {row.delta}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── M&A Accretion/Dilution Tab ─────────────────────────────────────────────────

function MAndAAccretionTab() {
  const [synergyCapture, setSynergyCapture] = useState<number>(75);
  const [debtFinancing, setDebtFinancing] = useState<number>(60);

  const totalSynergies = SYNERGIES.reduce((sum, s) => sum + s.fullyLoaded, 0);
  const capturedSynergies = totalSynergies * (synergyCapture / 100);

  // Pro forma EPS
  const acquirerEPS = 3.82;
  const targetEPS = 1.24;
  const combinedEPS = acquirerEPS + targetEPS * 0.412; // stock exchange ratio
  const synergyEPSBenefit = (capturedSynergies * 0.75) / 1000 / 520; // after tax, per diluted share
  const dilutionCost = 0.18; // integration costs, D&A step-up
  const proFormaY1EPS = combinedEPS + synergyEPSBenefit * 0.3 - dilutionCost;
  const proFormaY2EPS = combinedEPS + synergyEPSBenefit * 0.7 - dilutionCost * 0.5;
  const proFormaY3EPS = combinedEPS + synergyEPSBenefit - dilutionCost * 0.2;

  const accretionY1 = ((proFormaY1EPS - acquirerEPS) / acquirerEPS) * 100;
  const accretionY2 = ((proFormaY2EPS - acquirerEPS) / acquirerEPS) * 100;
  const accretionY3 = ((proFormaY3EPS - acquirerEPS) / acquirerEPS) * 100;

  const accretionColor = (val: number) =>
    val >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Model Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Synergy Capture Rate</span>
              <span className="text-sm font-bold text-primary">{synergyCapture}%</span>
            </div>
            <Slider
              value={[synergyCapture]}
              onValueChange={([v]) => setSynergyCapture(v)}
              min={25}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Conservative (25%)</span>
              <span>Full Capture (100%)</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Debt Financing Mix</span>
              <span className="text-sm font-bold text-primary">{debtFinancing}% Debt / {100 - debtFinancing}% Equity</span>
            </div>
            <Slider
              value={[debtFinancing]}
              onValueChange={([v]) => setDebtFinancing(v)}
              min={20}
              max={80}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Equity-heavy (20/80)</span>
              <span>Debt-heavy (80/20)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EPS Accretion summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { year: "Year 1", eps: proFormaY1EPS, acc: accretionY1, basis: "GAAP (diluted)" },
          { year: "Year 2", eps: proFormaY2EPS, acc: accretionY2, basis: "GAAP (diluted)" },
          { year: "Year 3", eps: proFormaY3EPS, acc: accretionY3, basis: "GAAP (diluted)" },
        ].map((row) => (
          <Card key={row.year} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground">{row.year}</span>
                <Badge className="text-xs bg-muted border-border text-muted-foreground">{row.basis}</Badge>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-white">${row.eps.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground mb-1">Pro Forma EPS</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${accretionColor(row.acc)}`}>
                {row.acc >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(row.acc).toFixed(1)}%{" "}
                {row.acc >= 0 ? "Accretive" : "Dilutive"}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                vs. Standalone ${acquirerEPS.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Synergies table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Synergy Assumptions ($M)</CardTitle>
            <div className="text-xs text-muted-foreground">
              Captured: <span className="text-primary font-bold">${capturedSynergies.toFixed(0)}M</span>{" "}
              of <span className="text-muted-foreground">${totalSynergies}M</span> total
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground">Category</th>
                  <th className="text-center p-2 text-muted-foreground">Type</th>
                  <th className="text-right p-2 text-muted-foreground">Yr 1</th>
                  <th className="text-right p-2 text-muted-foreground">Yr 2</th>
                  <th className="text-right p-2 text-muted-foreground">Yr 3</th>
                  <th className="text-right p-2 text-muted-foreground">Run-Rate</th>
                  <th className="text-center p-2 text-muted-foreground">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {SYNERGIES.map((syn, i) => {
                  const confColor =
                    syn.confidence === "High"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : syn.confidence === "Medium"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30";
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-2 text-muted-foreground">{syn.category}</td>
                      <td className="p-2 text-center">
                        <Badge
                          className={`text-xs ${
                            syn.type === "Revenue"
                              ? "bg-primary/20 text-primary border-border"
                              : "bg-primary/20 text-primary border-border"
                          }`}
                        >
                          {syn.type}
                        </Badge>
                      </td>
                      <td className="p-2 text-right font-mono text-muted-foreground">${syn.year1}M</td>
                      <td className="p-2 text-right font-mono text-muted-foreground">${syn.year2}M</td>
                      <td className="p-2 text-right font-mono text-muted-foreground">${syn.year3}M</td>
                      <td className="p-2 text-right font-mono text-emerald-400 font-bold">${syn.fullyLoaded}M</td>
                      <td className="p-2 text-center">
                        <Badge className={`text-xs border ${confColor}`}>{syn.confidence}</Badge>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="p-2 text-white font-bold">Total Synergies</td>
                  <td />
                  <td className="p-2 text-right font-mono text-white font-bold">
                    ${SYNERGIES.reduce((s, r) => s + r.year1, 0)}M
                  </td>
                  <td className="p-2 text-right font-mono text-white font-bold">
                    ${SYNERGIES.reduce((s, r) => s + r.year2, 0)}M
                  </td>
                  <td className="p-2 text-right font-mono text-white font-bold">
                    ${SYNERGIES.reduce((s, r) => s + r.year3, 0)}M
                  </td>
                  <td className="p-2 text-right font-mono text-emerald-400 font-bold">
                    ${totalSynergies}M
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pro forma combined financials */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Pro Forma Combined Financials ($M)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground">Metric</th>
                  <th className="text-right p-2 text-muted-foreground">NXTS Standalone</th>
                  <th className="text-right p-2 text-muted-foreground">STRD Standalone</th>
                  <th className="text-right p-2 text-muted-foreground">Synergies</th>
                  <th className="text-right p-2 text-muted-foreground">Pro Forma</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Revenue", nxts: 2100, strd: 1900, syn: 17, pf: 4017 },
                  { label: "Gross Profit", nxts: 1512, strd: 1387, syn: 17, pf: 2916 },
                  { label: "EBITDA", nxts: 520, strd: 470, syn: 114, pf: 1104 },
                  { label: "EBIT", nxts: 384, strd: 310, syn: 114, pf: 808 },
                  { label: "Net Income", nxts: 310, strd: 260, syn: 86, pf: 610 },
                  { label: "EPS (diluted)", nxts: 3.82, strd: 1.24, syn: null, pf: 4.18 },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="p-2 text-muted-foreground font-medium">{row.label}</td>
                    <td className="p-2 text-right font-mono text-muted-foreground">
                      {row.label === "EPS (diluted)" ? `$${row.nxts.toFixed(2)}` : `$${row.nxts.toLocaleString()}M`}
                    </td>
                    <td className="p-2 text-right font-mono text-muted-foreground">
                      {row.label === "EPS (diluted)" ? `$${row.strd.toFixed(2)}` : `$${row.strd.toLocaleString()}M`}
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-400">
                      {row.syn !== null ? `+$${row.syn.toLocaleString()}M` : "—"}
                    </td>
                    <td className="p-2 text-right font-mono text-white font-bold">
                      {row.label === "EPS (diluted)" ? `$${row.pf.toFixed(2)}` : `$${row.pf.toLocaleString()}M`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Financing Structure Tab ────────────────────────────────────────────────────

function FinancingStructureTab() {
  const [leverage, setLeverage] = useState<number>(4.5);

  const totalDebt = DEBT_TRANCHES.reduce((s, t) => s + t.amount, 0);
  const equity = 8200 - totalDebt;
  const debtPct = (totalDebt / 8200) * 100;
  const equityPct = 100 - debtPct;

  const ebitda = 1104;
  const ebit = 808;
  const interestExpense = DEBT_TRANCHES.reduce((s, t) => s + (t.amount * t.rate) / 100, 0);
  const leverageRatio = leverage;
  const interestCoverage = ebit / interestExpense;
  const debtToEbitda = totalDebt / ebitda;

  // Rating
  const getRating = (lev: number) => {
    if (lev < 2.5) return { rating: "BBB+", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" };
    if (lev < 3.5) return { rating: "BBB", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" };
    if (lev < 4.5) return { rating: "BB+", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" };
    if (lev < 5.5) return { rating: "BB", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" };
    return { rating: "B+", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" };
  };

  const ratingInfo = getRating(leverage);

  // Capital structure pie SVG
  const pieRadius = 60;
  const pieCenter = 70;
  const debtAngle = (debtPct / 100) * 2 * Math.PI;
  const debtPath = [
    `M ${pieCenter} ${pieCenter}`,
    `L ${pieCenter + pieRadius} ${pieCenter}`,
    `A ${pieRadius} ${pieRadius} 0 ${debtPct > 50 ? 1 : 0} 1 ${pieCenter + pieRadius * Math.cos(debtAngle)} ${pieCenter - pieRadius * Math.sin(debtAngle)}`,
    "Z",
  ].join(" ");
  const equityPath = [
    `M ${pieCenter} ${pieCenter}`,
    `L ${pieCenter + pieRadius * Math.cos(debtAngle)} ${pieCenter - pieRadius * Math.sin(debtAngle)}`,
    `A ${pieRadius} ${pieRadius} 0 ${equityPct > 50 ? 1 : 0} 1 ${pieCenter + pieRadius} ${pieCenter}`,
    "Z",
  ].join(" ");

  return (
    <div className="space-y-6">
      {/* Leverage slider */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Optimal Capital Structure Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Target Leverage (Debt / EBITDA)</span>
              <span className="text-sm font-bold text-primary">{leverage.toFixed(1)}x</span>
            </div>
            <Slider
              value={[leverage * 10]}
              onValueChange={([v]) => setLeverage(v / 10)}
              min={10}
              max={70}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Conservative (1.0x)</span>
              <span>Aggressive (7.0x)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: "Net Debt", value: `$${(leverage * ebitda / 1000).toFixed(1)}B`, icon: DollarSign, color: "text-primary" },
              { label: "Leverage Ratio", value: `${leverageRatio.toFixed(1)}x`, icon: Layers, color: "text-primary" },
              { label: "Interest Coverage", value: `${interestCoverage.toFixed(1)}x`, icon: Shield, color: "text-emerald-400" },
              { label: "Agency Rating", value: ratingInfo.rating, icon: Target, color: ratingInfo.color },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-3 rounded-lg bg-muted border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3 h-3 ${item.color}`} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Capital structure visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Sources &amp; Uses ($M)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Pie */}
              <svg width={140} height={140} viewBox={`0 0 ${pieCenter * 2} ${pieCenter * 2}`}>
                <path d={debtPath} fill="#8b5cf6" opacity={0.8} />
                <path d={equityPath} fill="#3b82f6" opacity={0.8} />
                <circle cx={pieCenter} cy={pieCenter} r={32} fill="#18181b" />
                <text x={pieCenter} y={pieCenter - 4} textAnchor="middle" fontSize={9} fill="#d1d5db">
                  $8.2B
                </text>
                <text x={pieCenter} y={pieCenter + 9} textAnchor="middle" fontSize={8} fill="#9ca3af">
                  Total
                </text>
              </svg>

              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">Debt Financing</span>
                    <span className="text-xs font-bold text-primary ml-auto">{debtPct.toFixed(0)}%</span>
                  </div>
                  <p className="text-sm font-bold text-primary pl-5">${totalDebt.toLocaleString()}M</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">Equity Financing</span>
                    <span className="text-xs font-bold text-primary ml-auto">{equityPct.toFixed(0)}%</span>
                  </div>
                  <p className="text-sm font-bold text-primary pl-5">${equity.toLocaleString()}M</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Transaction</span>
                    <span className="font-bold text-white">$8,200M</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Fees &amp; Expenses</span>
                    <span className="font-bold text-muted-foreground">$185M</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating agency view */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rating Agency View</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { agency: "S&P Global", rating: ratingInfo.rating, outlook: "Stable", metricFocus: "Debt/EBITDA, FCF conversion" },
              { agency: "Moody's", rating: ratingInfo.rating, outlook: "Negative", metricFocus: "Interest coverage, capex needs" },
              { agency: "Fitch Ratings", rating: ratingInfo.rating, outlook: "Stable", metricFocus: "Liquidity, near-term maturities" },
            ].map((agency) => (
              <div key={agency.agency} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                <div className={`w-10 h-10 rounded-lg border ${ratingInfo.bg} flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${ratingInfo.color}`}>{agency.rating}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{agency.agency}</span>
                    <Badge className={`text-xs ${
                      agency.outlook === "Stable"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      {agency.outlook}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{agency.metricFocus}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Debt tranches table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Proposed Debt Financing Structure</CardTitle>
            <span className="text-xs text-muted-foreground">
              Blended Rate:{" "}
              <span className="text-white font-bold">
                {(
                  DEBT_TRANCHES.reduce((s, t) => s + t.amount * t.rate, 0) / totalDebt
                ).toFixed(2)}
                %
              </span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground">Instrument</th>
                  <th className="text-right p-2 text-muted-foreground">Amount</th>
                  <th className="text-right p-2 text-muted-foreground">Rate</th>
                  <th className="text-right p-2 text-muted-foreground">Spread</th>
                  <th className="text-right p-2 text-muted-foreground">Maturity</th>
                  <th className="text-center p-2 text-muted-foreground">Rating</th>
                  <th className="text-right p-2 text-muted-foreground">Ann. Interest</th>
                </tr>
              </thead>
              <tbody>
                {DEBT_TRANCHES.map((t, i) => {
                  const annInt = (t.amount * t.rate) / 100;
                  const ratingCol =
                    t.rating.startsWith("BBB")
                      ? "text-emerald-400"
                      : t.rating.startsWith("BB+")
                      ? "text-amber-400"
                      : t.rating.startsWith("BB")
                      ? "text-amber-300"
                      : "text-red-400";
                  return (
                    <motion.tr
                      key={t.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/20"
                    >
                      <td className="p-2 text-muted-foreground font-medium">{t.name}</td>
                      <td className="p-2 text-right font-mono text-muted-foreground">${t.amount.toLocaleString()}M</td>
                      <td className="p-2 text-right font-mono text-primary">{t.rate.toFixed(2)}%</td>
                      <td className="p-2 text-right font-mono text-muted-foreground">S+{t.spread}bps</td>
                      <td className="p-2 text-right font-mono text-muted-foreground">{t.maturity}yr</td>
                      <td className={`p-2 text-center font-bold ${ratingCol}`}>{t.rating}</td>
                      <td className="p-2 text-right font-mono text-amber-400">${annInt.toFixed(0)}M</td>
                    </motion.tr>
                  );
                })}
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="p-2 text-white font-bold">Total Debt</td>
                  <td className="p-2 text-right font-mono text-white font-bold">${totalDebt.toLocaleString()}M</td>
                  <td className="p-2 text-right font-mono text-primary font-bold">
                    {(DEBT_TRANCHES.reduce((s, t) => s + t.amount * t.rate, 0) / totalDebt).toFixed(2)}%
                  </td>
                  <td colSpan={3} />
                  <td className="p-2 text-right font-mono text-amber-400 font-bold">
                    ${DEBT_TRANCHES.reduce((s, t) => s + (t.amount * t.rate) / 100, 0).toFixed(0)}M
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Credit metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
            {[
              { label: "Debt / EBITDA", value: `${debtToEbitda.toFixed(1)}x`, status: debtToEbitda < 4 ? "ok" : debtToEbitda < 5 ? "warn" : "bad" },
              { label: "Interest Coverage", value: `${interestCoverage.toFixed(1)}x`, status: interestCoverage > 3 ? "ok" : interestCoverage > 2 ? "warn" : "bad" },
              { label: "Debt / Equity", value: `${(totalDebt / equity).toFixed(1)}x`, status: totalDebt / equity < 2 ? "ok" : totalDebt / equity < 3 ? "warn" : "bad" },
              { label: "FCF / Debt Service", value: "1.8x", status: "ok" },
            ].map((metric) => {
              const col =
                metric.status === "ok"
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  : metric.status === "warn"
                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                  : "text-red-400 border-red-500/30 bg-red-500/10";
              return (
                <div key={metric.label} className={`p-2 rounded-lg border ${col}`}>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className={`text-base font-bold ${col.split(" ")[0]}`}>{metric.value}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {metric.status === "ok" ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : metric.status === "warn" ? (
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {metric.status === "ok" ? "Investment grade" : metric.status === "warn" ? "Monitor" : "High yield"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PitchbookPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-primary/20 border border-border flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Pitch Book Builder</h1>
                <p className="text-xs text-muted-foreground">Investment Banking — M&amp;A Advisory</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/20 text-primary border-border text-xs">
              <Building2 className="w-3 h-3 mr-1" /> NXTS / STRD
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
              <DollarSign className="w-3 h-3 mr-1" /> $8.2B Deal
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" /> 52% Premium
            </Badge>
            <Badge className="bg-primary/20 text-primary border-border text-xs">
              <Percent className="w-3 h-3 mr-1" /> Cash + Stock
            </Badge>
          </div>
        </div>

        {/* Quick stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-4"
        >
          {[
            { label: "Transaction Value", value: "$8.2B", icon: DollarSign, color: "text-primary" },
            { label: "Offer Per Share", value: "$72.50", icon: Target, color: "text-emerald-400" },
            { label: "Premium to VWAP", value: "52.0%", icon: TrendingUp, color: "text-emerald-400" },
            { label: "EV / NTM EBITDA", value: "14.2x", icon: BarChart3, color: "text-primary" },
            { label: "Revenue Synergies", value: "$95M", icon: ArrowUpRight, color: "text-primary" },
            { label: "Cost Synergies", value: "$92M", icon: Layers, color: "text-amber-400" },
            { label: "Year 2 Accretion", value: "+9.4%", icon: CheckCircle, color: "text-emerald-400" },
            { label: "Pro Forma Leverage", value: "4.5x", icon: Scale, color: "text-primary" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-2 text-center">
                <Icon className={`w-3 h-3 mx-auto mb-1 ${stat.color}`} />
                <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Tabs defaultValue="pitch" className="space-y-4">
          <TabsList className="bg-card border border-border p-1 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="pitch" className="data-[state=active]:bg-muted text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Pitch Structure
            </TabsTrigger>
            <TabsTrigger value="valuation" className="data-[state=active]:bg-muted text-xs gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Valuation Summary
            </TabsTrigger>
            <TabsTrigger value="comps" className="data-[state=active]:bg-muted text-xs gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Comparable Companies
            </TabsTrigger>
            <TabsTrigger value="mna" className="data-[state=active]:bg-muted text-xs gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> M&amp;A Accretion/Dilution
            </TabsTrigger>
            <TabsTrigger value="financing" className="data-[state=active]:bg-muted text-xs gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Financing Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pitch" className="data-[state=inactive]:hidden">
            <PitchStructureTab />
          </TabsContent>
          <TabsContent value="valuation" className="data-[state=inactive]:hidden">
            <ValuationSummaryTab />
          </TabsContent>
          <TabsContent value="comps" className="data-[state=inactive]:hidden">
            <ComparableCompaniesTab />
          </TabsContent>
          <TabsContent value="mna" className="data-[state=inactive]:hidden">
            <MAndAAccretionTab />
          </TabsContent>
          <TabsContent value="financing" className="data-[state=inactive]:hidden">
            <FinancingStructureTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
