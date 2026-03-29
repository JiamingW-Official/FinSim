"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Search,
  AlertTriangle,
  Target,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  BarChart3,
  Layers,
  Microscope,
  Shield,
  Lightbulb,
  Activity,
  DollarSign,
  Eye,
  BookOpen,
  Network,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 945;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const _r: number[] = [];
for (let i = 0; i < 300; i++) _r.push(rand());
let _ri = 0;
const r = () => _r[_ri++ % _r.length];

// ── Types ────────────────────────────────────────────────────────────────────
interface SOTPSegment {
  name: string;
  revenue: number;
  ebitda: number;
  multiple: string;
  multipleVal: number;
  impliedValue: number;
  color: string;
  description: string;
}

interface ChannelLevel {
  name: string;
  insights: string[];
  color: string;
  icon: React.ReactNode;
}

interface ForensicFlag {
  category: string;
  flags: { label: string; severity: "high" | "medium" | "low"; detail: string }[];
}

interface ThesisStep {
  step: string;
  title: string;
  description: string;
  example: string;
  color: string;
}

interface MoatType {
  name: string;
  description: string;
  examples: string[];
  durability: number;
}

// ── SOTP Data ────────────────────────────────────────────────────────────────
const SOTP_SEGMENTS: SOTPSegment[] = [
  {
    name: "Retail Division",
    revenue: 4800,
    ebitda: 720,
    multiple: "EV/EBITDA",
    multipleVal: 12,
    impliedValue: 8640,
    color: "#3b82f6",
    description: "Consumer-facing stores + e-commerce. Cyclical, margin-compressed vs. online pure-plays.",
  },
  {
    name: "B2B Software",
    revenue: 1200,
    ebitda: 480,
    multiple: "EV/Revenue",
    multipleVal: 8,
    impliedValue: 9600,
    color: "#8b5cf6",
    description: "SaaS enterprise licenses. High recurring revenue, 40% EBITDA margin. Premium multiple justified.",
  },
  {
    name: "Real Estate",
    revenue: 680,
    ebitda: 510,
    multiple: "Cap Rate",
    multipleVal: 5.5,
    impliedValue: 9273,
    color: "#10b981",
    description: "Owned properties carried at depreciated cost. Hidden value vs. NAV. Unlocked via sale-leaseback.",
  },
  {
    name: "Financial Services",
    revenue: 920,
    ebitda: 276,
    multiple: "P/Book",
    multipleVal: 1.4,
    impliedValue: 3864,
    color: "#f59e0b",
    description: "Consumer lending + insurance. Regulated entity, lower growth, valued on book value.",
  },
];

const TOTAL_SOTP = SOTP_SEGMENTS.reduce((acc, s) => acc + s.impliedValue, 0);
const HOLDING_CO_DISCOUNT = 0.22;
const NET_DEBT = 4200;
const SHARES = 280;
const SOTP_EQUITY = TOTAL_SOTP * (1 - HOLDING_CO_DISCOUNT) - NET_DEBT;
const SOTP_PER_SHARE = SOTP_EQUITY / SHARES;
const CURRENT_PRICE = 118;

// ── Channel Check Data ───────────────────────────────────────────────────────
const CHANNEL_LEVELS: ChannelLevel[] = [
  {
    name: "Supplier",
    color: "blue",
    icon: <Layers className="w-4 h-4" />,
    insights: [
      "Lead times expanding → upstream demand",
      "Input cost pressures before P&L impact",
      "Inventory builds at manufacturer level",
      "New product pipeline 6–12 months ahead",
    ],
  },
  {
    name: "Distributor",
    color: "purple",
    icon: <Network className="w-4 h-4" />,
    insights: [
      "Sell-through vs sell-in divergence",
      "Channel inventory weeks-on-hand",
      "Promotional activity and rebates",
      "Shelf-space allocation changes",
    ],
  },
  {
    name: "Retailer",
    color: "emerald",
    icon: <BarChart3 className="w-4 h-4" />,
    insights: [
      "SKU velocity and reorder frequency",
      "Competing brand penetration",
      "Margin structure and pricing trends",
      "Return rates and customer complaints",
    ],
  },
  {
    name: "End Customer",
    color: "orange",
    icon: <Users className="w-4 h-4" />,
    insights: [
      "Net Promoter Score & satisfaction",
      "Switching costs and loyalty signals",
      "Willingness-to-pay for new features",
      "Budget cycle and purchasing authority",
    ],
  },
];

// ── Forensic Accounting Data ─────────────────────────────────────────────────
const FORENSIC_FLAGS: ForensicFlag[] = [
  {
    category: "Revenue Quality",
    flags: [
      { label: "Channel stuffing — abnormal inventory at distributors", severity: "high", detail: "Shipments to channel exceed end-market demand. Often reversed the following quarter. Cross-reference distributor sell-through data." },
      { label: "Bill-and-hold arrangements", severity: "high", detail: "Revenue recognized before delivery. Look for unusually high deferred revenue reversals and customer acceptance clauses in footnotes." },
      { label: "Round-tripping / barter transactions", severity: "high", detail: "Company A sells to B, B sells back. Revenue inflated with no cash benefit. Check for contra-revenue contra-entries." },
      { label: "Related-party revenue at above-market terms", severity: "medium", detail: "Revenue from controlled affiliates or directors' firms. Requires SEC Regulation S-K Item 404 disclosure." },
    ],
  },
  {
    category: "Cash Flow vs. Earnings",
    flags: [
      { label: "Operating CF persistently below net income", severity: "high", detail: "Accrual-based earnings exceed cash generation for 3+ years. Often preceded accounting restatements by 12–18 months." },
      { label: "Rising DSO without revenue acceleration", severity: "medium", detail: "Days Sales Outstanding expanding faster than revenue growth signals customers paying slower or fictitious receivables." },
      { label: "DIO expansion in low-growth environment", severity: "medium", detail: "Inventory Days Outstanding rising without volume buildup explanation. Can mask overproduction or obsolete inventory." },
    ],
  },
  {
    category: "Balance Sheet Signals",
    flags: [
      { label: "Goodwill impairment timing — post-CEO change", severity: "medium", detail: "New management cleans house in Year 1. Signals predecessor overpaid for acquisitions. 'Big bath' accounting." },
      { label: "Operating lease capitalization exclusion", severity: "low", detail: "Pre-ASC 842, companies kept leases off-balance-sheet. Adjust EBITDA and leverage ratios to include lease obligations." },
      { label: "Pension obligation underfunding hidden in OCI", severity: "medium", detail: "Defined benefit shortfalls run through Other Comprehensive Income, bypassing P&L. Add to enterprise debt." },
    ],
  },
  {
    category: "Non-GAAP Manipulation",
    flags: [
      { label: "Recurring 'one-time' charges every year", severity: "high", detail: "Restructuring, M&A costs, and legal settlements labeled non-recurring for 5+ consecutive years signals these are operating costs." },
      { label: "Adjusted EBITDA excluding stock-based compensation", severity: "medium", detail: "SBC is real economic dilution. Compare adjusted vs. GAAP EPS spread; widening gap is bearish for valuation." },
      { label: "Non-GAAP gross margin vs. GAAP divergence", severity: "medium", detail: "Some companies exclude COGS items from non-GAAP. Check for amortization of acquired intangibles inflating gross margin." },
    ],
  },
  {
    category: "Audit Red Flags",
    flags: [
      { label: "Auditor change — especially mid-year", severity: "high", detail: "Big 4 → smaller firm change, especially without client-cited reason, is a significant red flag. SEC requires disclosure of disagreements." },
      { label: "Audit fees rising >30% without M&A", severity: "medium", detail: "Material weakness remediation, internal controls issues, or complex transactions driving fee increases." },
      { label: "Going concern qualification", severity: "high", detail: "Auditor doubts ability to operate for 12 months. Usually late-stage distress signal; equity often worthless at this point." },
    ],
  },
];

// Beneish M-Score variables
const BENEISH_VARS = [
  { abbrev: "DSRI", name: "Days Sales Receivable Index", threshold: ">1.465", interpretation: "Receivables growing faster than revenue → possible revenue inflation" },
  { abbrev: "GMI", name: "Gross Margin Index", threshold: ">1.193", interpretation: "Gross margin deteriorating → pressure on future earnings" },
  { abbrev: "AQI", name: "Asset Quality Index", threshold: ">1.254", interpretation: "Off-balance-sheet asset growth → capitalization of period costs" },
  { abbrev: "SGI", name: "Sales Growth Index", threshold: ">1.607", interpretation: "High sales growth → companies in growth phase manipulate more" },
  { abbrev: "DEPI", name: "Depreciation Index", threshold: ">1.082", interpretation: "Slowing depreciation → extending useful life to boost earnings" },
  { abbrev: "SGAI", name: "SG&A Index", threshold: ">1.041", interpretation: "Overhead growing faster than revenue → efficiency deterioration" },
  { abbrev: "LVGI", name: "Leverage Index", threshold: ">1.111", interpretation: "Rising debt-to-assets → debt covenant pressure drives manipulation" },
  { abbrev: "TATA", name: "Total Accruals to Assets", threshold: ">0.031", interpretation: "High accruals vs. assets → earnings not backed by cash flow" },
];

// ── Thesis Construction Data ─────────────────────────────────────────────────
const THESIS_STEPS: ThesisStep[] = [
  {
    step: "01",
    title: "Identify Consensus View",
    description: "Understand what the market currently believes and has priced in. Street estimates, sentiment surveys, options skew, and positioning data all reveal the consensus.",
    example: "Consensus: \"Mature company, single-digit growth, 18× PE is fair.\"",
    color: "blue",
  },
  {
    step: "02",
    title: "Define Your Variant Perception",
    description: "Howard Marks: you must disagree with consensus AND be right. Simply being contrarian is not an edge. Identify a specific misperception in timing, magnitude, or direction.",
    example: "Variant: \"Software segment will reach 40% of revenue in 2 years vs. consensus 25%. Market applying conglomerate discount to a business mix that is rapidly improving.\"",
    color: "purple",
  },
  {
    step: "03",
    title: "Identify the Catalyst",
    description: "Why will the market re-rate the stock in your time horizon? Without a catalyst, a cheap stock stays cheap. Catalysts include spin-offs, earnings beats, contract wins, re-rating events.",
    example: "Catalyst: Analyst Day in Q3 where management will separately segment B2B revenue; potential spin-off announcement.",
    color: "emerald",
  },
  {
    step: "04",
    title: "Stress-Test the Thesis",
    description: "Explicitly write down what would prove you wrong. If you cannot articulate the bear case clearly, you do not understand the investment. This prevents anchoring bias.",
    example: "Bear case: SaaS churn accelerates above 15%, enterprise budget freeze delays pipeline conversion, multiple compression to 10× EV/EBITDA on software segment.",
    color: "orange",
  },
  {
    step: "05",
    title: "Size the Position",
    description: "Kelly Criterion-inspired sizing: larger position when edge is high, variance is low, and correlation to portfolio is low. Liquidity-adjusted: can you exit in 10 days without moving the market?",
    example: "2% base case; 4% if catalyst confirmed; stop-loss at -20% from entry or thesis invalidation, whichever comes first.",
    color: "red",
  },
  {
    step: "06",
    title: "Monitor & Know When to Sell",
    description: "Set up a thesis monitoring dashboard: key KPIs, leading indicators, quarterly milestones. Sell when: thesis plays out (price reaches target), thesis breaks, or better opportunity identified.",
    example: "Monitor: B2B ARR quarterly, NRR trend, software segment disclosure, spin-off timeline. Sell trigger: ARR growth below 20% or spin-off cancelled.",
    color: "cyan",
  },
];

const MOAT_TYPES: MoatType[] = [
  {
    name: "Network Effect",
    description: "Each additional user increases value for all users. Winner-takes-most dynamics. Extremely durable once critical mass reached.",
    examples: ["Visa/Mastercard", "Airbnb", "LinkedIn"],
    durability: 92,
  },
  {
    name: "Switching Costs",
    description: "High cost (financial, operational, psychological) to change vendors. Embeds the company in customer workflows. Pricing power over time.",
    examples: ["Oracle ERP", "Veeva", "Salesforce"],
    durability: 78,
  },
  {
    name: "Cost Advantage",
    description: "Structural lower cost of production or distribution vs. peers. Can be driven by scale, process, location, or proprietary access to inputs.",
    examples: ["Costco", "Amazon Fulfillment", "BHP"],
    durability: 65,
  },
  {
    name: "Intangible Assets",
    description: "Brands, patents, regulatory licenses, or proprietary data that competitors cannot replicate. Enables pricing above cost of goods.",
    examples: ["Coca-Cola", "Pfizer IP", "MSCI"],
    durability: 70,
  },
];

// ── SVG Components ────────────────────────────────────────────────────────────

function SOTPWaterfallSVG() {
  const W = 620;
  const H = 320;
  const pad = { l: 60, r: 30, t: 30, b: 50 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  // Bars: 4 segments + holding co discount bar + net debt bar + equity value
  const maxVal = TOTAL_SOTP * 1.05;
  const scale = chartH / maxVal;

  type WBar = {
    label: string;
    value: number;
    start: number;
    color: string;
    isNeg?: boolean;
  };

  const bars: WBar[] = [
    ...SOTP_SEGMENTS.map((seg) => ({ label: seg.name.split(" ")[0], value: seg.impliedValue, start: 0, color: seg.color })),
    { label: "HC Disc.", value: TOTAL_SOTP * HOLDING_CO_DISCOUNT, start: 0, color: "#ef4444", isNeg: true },
    { label: "Net Debt", value: NET_DEBT, start: 0, color: "#f97316", isNeg: true },
  ];

  // Compute running total for waterfall
  let running = 0;
  const positioned: (WBar & { y: number; h: number })[] = [];
  for (const bar of bars) {
    if (bar.isNeg) {
      const h = bar.value * scale;
      const y = (maxVal - running) * scale;
      positioned.push({ ...bar, y, h });
      running -= bar.value;
    } else {
      const h = bar.value * scale;
      const y = (maxVal - running - bar.value) * scale;
      positioned.push({ ...bar, y, h });
      running += bar.value;
    }
  }

  // Final equity bar
  const eqH = Math.max(running * scale, 2);
  const eqY = (maxVal - running) * scale;

  const barW = chartW / (bars.length + 2) - 6;
  const stepX = chartW / (bars.length + 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" style={{ height: 260 }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const yy = pad.t + chartH * (1 - t);
        return (
          <g key={i}>
            <line x1={pad.l} y1={yy} x2={pad.l + chartW} y2={yy} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={pad.l - 6} y={yy + 4} textAnchor="end" fontSize={9} fill="#6b7280">
              {Math.round((maxVal * t) / 1000)}k
            </text>
          </g>
        );
      })}

      {/* Connector lines */}
      {positioned.map((bar, i) => {
        if (i === 0) return null;
        const prevBar = positioned[i - 1];
        const x1 = pad.l + i * stepX + barW / 2;
        const x0 = pad.l + (i - 1) * stepX + barW / 2 + barW / 2;
        const prevBottom = prevBar.isNeg ? pad.t + prevBar.y : pad.t + prevBar.y + prevBar.h;
        return (
          <line
            key={`conn-${i}`}
            x1={x0}
            y1={pad.t + prevBottom - pad.t}
            x2={x1}
            y2={pad.t + (bar.isNeg ? bar.y : bar.y)}
            stroke="#4b5563"
            strokeWidth={0.8}
            strokeDasharray="2,2"
          />
        );
      })}

      {/* Bars */}
      {positioned.map((bar, i) => (
        <g key={`bar-${i}`}>
          <rect
            x={pad.l + i * stepX}
            y={pad.t + bar.y}
            width={barW}
            height={bar.h}
            rx={3}
            fill={bar.color}
            opacity={bar.isNeg ? 0.75 : 0.85}
          />
          <text
            x={pad.l + i * stepX + barW / 2}
            y={pad.t + bar.y - 4}
            textAnchor="middle"
            fontSize={8}
            fill={bar.isNeg ? "#fca5a5" : "#d1d5db"}
          >
            {bar.isNeg ? "-" : ""}
            {Math.round(bar.value / 100) / 10}k
          </text>
          <text
            x={pad.l + i * stepX + barW / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize={7.5}
            fill="#9ca3af"
          >
            {bar.label}
          </text>
        </g>
      ))}

      {/* Equity value bar */}
      <rect
        x={pad.l + bars.length * stepX}
        y={pad.t + eqY}
        width={barW}
        height={eqH}
        rx={3}
        fill="#22d3ee"
        opacity={0.9}
      />
      <text
        x={pad.l + bars.length * stepX + barW / 2}
        y={pad.t + eqY - 4}
        textAnchor="middle"
        fontSize={8.5}
        fill="#67e8f9"
        fontWeight="bold"
      >
        ${Math.round(SOTP_PER_SHARE)}
      </text>
      <text
        x={pad.l + bars.length * stepX + barW / 2}
        y={H - 10}
        textAnchor="middle"
        fontSize={7.5}
        fill="#67e8f9"
        fontWeight="bold"
      >
        Equity
      </text>

      {/* X axis */}
      <line x1={pad.l} y1={pad.t + chartH} x2={pad.l + chartW} y2={pad.t + chartH} stroke="#374151" strokeWidth={1} />

      {/* Title */}
      <text x={W / 2} y={14} textAnchor="middle" fontSize={10} fill="#9ca3af" fontWeight="bold">
        SOTP Waterfall — Implied Equity Value per Share
      </text>
    </svg>
  );
}

function InfoPyramidSVG() {
  const W = 400;
  const H = 280;
  const levels = [
    { label: "Company IR / Filings", sublabel: "Low edge — widely accessible", color: "#6b7280", width: 320 },
    { label: "Industry Experts (GLG / Tegus)", sublabel: "Moderate edge — costs $$", color: "#3b82f6", width: 240 },
    { label: "Customers & Competitors", sublabel: "High edge — requires effort", color: "#8b5cf6", width: 160 },
    { label: "Regulatory & Alt Data", sublabel: "Highest edge — scarce signal", color: "#10b981", width: 80 },
  ];
  const sliceH = 48;
  const startY = 30;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" style={{ height: 240 }}>
      <text x={W / 2} y={18} textAnchor="middle" fontSize={10} fill="#9ca3af" fontWeight="bold">
        Information Advantage Pyramid
      </text>
      {levels.map((lv, i) => {
        const y = startY + i * (sliceH + 4);
        const x = (W - lv.width) / 2;
        return (
          <g key={i}>
            <rect x={x} y={y} width={lv.width} height={sliceH - 2} rx={4} fill={lv.color} opacity={0.8} />
            <text x={W / 2} y={y + 17} textAnchor="middle" fontSize={10} fill="#f9fafb" fontWeight="bold">
              {lv.label}
            </text>
            <text x={W / 2} y={y + 31} textAnchor="middle" fontSize={8.5} fill="#d1d5db">
              {lv.sublabel}
            </text>
          </g>
        );
      })}
      {/* Arrow */}
      <text x={W - 24} y={startY + 2 * (sliceH + 4) + sliceH / 2} textAnchor="middle" fontSize={9} fill="#f59e0b">
        Edge
      </text>
      <line
        x1={W - 26}
        y1={startY + 10}
        x2={W - 26}
        y2={startY + 3 * (sliceH + 4) + sliceH - 10}
        stroke="#f59e0b"
        strokeWidth={1.5}
        markerEnd="url(#arrowDown)"
      />
      <defs>
        <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
          <path d="M0,0 L3,6 L6,0" fill="#f59e0b" />
        </marker>
      </defs>
    </svg>
  );
}

function MoatRadarSVG({ moats }: { moats: MoatType[] }) {
  const cx = 160;
  const cy = 130;
  const R = 90;
  const n = moats.length;
  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

  const pts = moats.map((m, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const rr = (m.durability / 100) * R;
    return { x: cx + Math.cos(angle) * rr, y: cy + Math.sin(angle) * rr };
  });

  const polygon = pts.map((p) => `${p.x},${p.y}`).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox="0 0 320 260" className="w-full max-w-xs" style={{ height: 220 }}>
      <text x={160} y={14} textAnchor="middle" fontSize={10} fill="#9ca3af" fontWeight="bold">
        Moat Durability Index
      </text>

      {/* Grid circles */}
      {gridLevels.map((t, i) => (
        <circle key={i} cx={cx} cy={cy} r={t * R} fill="none" stroke="#374151" strokeWidth={0.6} />
      ))}

      {/* Axis lines */}
      {moats.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * R}
            y2={cy + Math.sin(angle) * R}
            stroke="#374151"
            strokeWidth={0.8}
          />
        );
      })}

      {/* Data polygon */}
      <polygon points={polygon} fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={1.5} />

      {/* Data points */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={colors[i]} opacity={0.9} />
      ))}

      {/* Axis labels */}
      {moats.map((m, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (R + 22);
        const ly = cy + Math.sin(angle) * (R + 22);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" fontSize={8.5} fill={colors[i]} fontWeight="bold">
            {m.name}
          </text>
        );
      })}

      {/* Durability values */}
      {moats.map((m, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const rr = (m.durability / 100) * R;
        const vx = cx + Math.cos(angle) * (rr - 14);
        const vy = cy + Math.sin(angle) * (rr - 14);
        return (
          <text key={i} x={vx} y={vy + 4} textAnchor="middle" fontSize={8} fill="#f9fafb" fontWeight="bold">
            {m.durability}
          </text>
        );
      })}
    </svg>
  );
}

// ── Section Components ────────────────────────────────────────────────────────

function SOTPTab() {
  const [expandedSeg, setExpandedSeg] = useState<number | null>(null);
  const totalPct = SOTP_SEGMENTS.reduce((a, s) => a + s.impliedValue, 0);
  const upside = ((SOTP_PER_SHARE - CURRENT_PRICE) / CURRENT_PRICE) * 100;

  // Donut chart data
  const donutCx = 80;
  const donutCy = 80;
  const donutR = 55;
  const donutInner = 32;
  let cumAngle = -Math.PI / 2;

  const donutSlices = SOTP_SEGMENTS.map((seg) => {
    const pct = seg.impliedValue / totalPct;
    const startAngle = cumAngle;
    const endAngle = cumAngle + pct * 2 * Math.PI;
    cumAngle = endAngle;
    const x1 = donutCx + Math.cos(startAngle) * donutR;
    const y1 = donutCy + Math.sin(startAngle) * donutR;
    const x2 = donutCx + Math.cos(endAngle) * donutR;
    const y2 = donutCy + Math.sin(endAngle) * donutR;
    const xi1 = donutCx + Math.cos(startAngle) * donutInner;
    const yi1 = donutCy + Math.sin(startAngle) * donutInner;
    const xi2 = donutCx + Math.cos(endAngle) * donutInner;
    const yi2 = donutCy + Math.sin(endAngle) * donutInner;
    const large = pct > 0.5 ? 1 : 0;
    const d = `M${xi1},${yi1} L${x1},${y1} A${donutR},${donutR} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${donutInner},${donutInner} 0 ${large},0 ${xi1},${yi1} Z`;
    return { ...seg, d, pct };
  });

  return (
    <div className="space-y-4">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sum of Parts", value: `$${Math.round(TOTAL_SOTP / 100) / 10}B`, sub: "Gross asset value", color: "text-primary" },
          { label: "HC Discount", value: `-${Math.round(HOLDING_CO_DISCOUNT * 100)}%`, sub: "NAV discount applied", color: "text-red-400" },
          { label: "SOTP / Share", value: `$${Math.round(SOTP_PER_SHARE)}`, sub: "Post discount + debt", color: "text-muted-foreground" },
          { label: "Upside vs. Market", value: `+${Math.round(upside)}%`, sub: `Current $${CURRENT_PRICE}`, color: "text-emerald-400" },
        ].map((kpi, i) => (
          <div key={i} className="bg-muted border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className={cn("text-xl font-bold mt-0.5", kpi.color)}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Donut + Segment table */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-muted border border-border rounded-md p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            Asset Value Composition
          </h3>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 160 160" style={{ width: 140, height: 140 }}>
              {donutSlices.map((sl, i) => (
                <path key={i} d={sl.d} fill={sl.color} opacity={0.85} />
              ))}
              <text x={donutCx} y={donutCy - 5} textAnchor="middle" fontSize={9} fill="#9ca3af">
                Total
              </text>
              <text x={donutCx} y={donutCy + 8} textAnchor="middle" fontSize={10} fill="#f9fafb" fontWeight="bold">
                ${Math.round(TOTAL_SOTP / 1000)}B
              </text>
            </svg>
            <div className="space-y-2 flex-1">
              {donutSlices.map((sl, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: sl.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{sl.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{Math.round(sl.pct * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waterfall */}
        <div className="bg-muted border border-border rounded-md p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Waterfall Bridge to Equity
          </h3>
          <SOTPWaterfallSVG />
        </div>
      </div>

      {/* Segment Cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Segment Valuation Detail</h3>
        {SOTP_SEGMENTS.map((seg, i) => (
          <motion.div
            key={i}
            className="bg-muted border border-border rounded-md overflow-hidden cursor-pointer"
            onClick={() => setExpandedSeg(expandedSeg === i ? null : i)}
          >
            <div className="flex items-center gap-3 p-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-sm font-medium text-foreground flex-1">{seg.name}</span>
              <span className="text-xs text-muted-foreground mr-2">
                {seg.multiple} {seg.multipleVal}×
              </span>
              <span className="text-sm font-mono font-bold text-foreground">
                ${Math.round(seg.impliedValue / 100) / 10}B
              </span>
              <ChevronDown
                className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedSeg === i && "rotate-180")}
              />
            </div>
            <AnimatePresence>
              {expandedSeg === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 pt-1 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">{seg.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="text-muted-foreground">Revenue</span>
                        <p className="font-mono text-foreground">${seg.revenue}M</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">EBITDA</span>
                        <p className="font-mono text-foreground">${seg.ebitda}M</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin</span>
                        <p className="font-mono text-foreground">{Math.round((seg.ebitda / seg.revenue) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Holding Company Discount */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Conglomerate Discount — Causes & Unlocking Value
        </h3>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {[
            { title: "Complexity Premium", desc: "Investors cannot accurately value cross-business interactions, synergies, and capital fungibility. Discount = information asymmetry." },
            { title: "Capital Allocation Risk", desc: "HQ may subsidize weak divisions from strong ones. 'Conglomerate tax' on returns as management attention is diluted." },
            { title: "Conglomerate Discount", desc: "Historically 15–30% of gross NAV. Narrows when activists push spin-offs, when segments are disclosed, or at spin-off announcement." },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-lg p-3">
              <p className="text-xs font-medium text-amber-400 mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Discount gauge */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-28">Typical Range:</span>
          <div className="flex-1 h-4 bg-card rounded-full overflow-hidden relative">
            <div className="h-full bg-muted w-full rounded-full" />
            <div
              className="absolute top-0 h-full w-1.5 bg-amber-400 rounded-full"
              style={{ left: `${((HOLDING_CO_DISCOUNT - 0.05) / 0.35) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-amber-400 w-10">-{Math.round(HOLDING_CO_DISCOUNT * 100)}%</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5 px-32">
          <span>-5%</span>
          <span>-20%</span>
          <span>-40%</span>
        </div>

        {/* Unlocking mechanisms */}
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Value Unlocking Mechanisms</p>
          {[
            { label: "Pure-play Spin-Off", detail: "Separates high-multiple from low-multiple businesses. Parent retains some shares. Market re-rates each independently." },
            { label: "Tracking Stock", detail: "Separate share class tracking one division's economics. Avoids tax friction of full spin-off. Less clean than pure spin." },
            { label: "Sale-Leaseback (RE)", detail: "Monetizes real estate at market value, unlocking hidden NAV. Creates ongoing lease cost but frees capital for buybacks." },
            { label: "Strategic Disposal", detail: "Outright sale of non-core divisions. Maximizes proceeds but may trigger tax and transition disruption." },
          ].map((m, i) => (
            <div key={i} className="flex gap-2 items-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="font-medium">{m.label}: </span>
                {m.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Net-Net & Graham */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          Graham Net-Net & Asset-Heavy Liquidation Value
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-green-400 mb-1">Net Current Asset Value (NCAV)</p>
            <p className="text-xs text-muted-foreground mb-2">
              Graham's net-net framework: buy stocks trading below 2/3 of (Current Assets − All Liabilities). Extremely conservative; assets valued at liquidation, not going-concern.
            </p>
            <div className="font-mono text-xs text-muted-foreground space-y-0.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Assets</span>
                <span className="text-primary">+$X</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">All Liabilities</span>
                <span className="text-red-400">−$Y</span>
              </div>
              <div className="flex justify-between border-t border-border pt-0.5 mt-0.5">
                <span className="text-foreground font-medium">NCAV</span>
                <span className="text-muted-foreground font-medium">=$Z</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buy threshold</span>
                <span className="text-emerald-400">≤ 2/3 of NCAV</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-amber-400 mb-1">Berkshire-Style NAV Investing</p>
            <p className="text-xs text-muted-foreground">
              For holding companies like BRK, value = sum of operating subsidiaries at fair value + publicly-traded portfolio at market + cash − debt. Buffett explicitly tracks look-through earnings.
            </p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {[
                "Assign multiples by segment quality (ROE, reinvestment rate)",
                "Mark-to-market public equity portfolio daily",
                "Adjust for excess cash above operating needs",
                "Track book value per share as proxy between intrinsic values",
              ].map((pt, i) => (
                <div key={i} className="flex gap-1.5 items-start">
                  <ChevronRight className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimaryResearchTab() {
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [activeMethod, setActiveMethod] = useState(0);

  const altDataSources = [
    { name: "Satellite Imagery", detail: "Parking lot density → retail traffic. Oil tank float detection → inventory builds. Port activity counting.", icon: <Eye className="w-4 h-4" />, color: "blue" },
    { name: "Credit Card Data", detail: "Anonymized consumer spending at merchant level. Earliest indicator of revenue trends, 4–6 weeks ahead of earnings.", icon: <Activity className="w-4 h-4" />, color: "purple" },
    { name: "Job Postings", detail: "Headcount expansion/contraction = capex intent. Tech job growth in a division = new product investment. LinkedIn data.", icon: <Users className="w-4 h-4" />, color: "emerald" },
    { name: "Patent Filings", detail: "R&D direction and competitive focus. Patent citations reveal which companies are building on whose IP. IPC classification analysis.", icon: <FileText className="w-4 h-4" />, color: "orange" },
    { name: "Web Traffic / App Data", detail: "SimilarWeb, Sensor Tower. MAU trends, engagement depth, geographic penetration — all before reporting.", icon: <Zap className="w-4 h-4" />, color: "cyan" },
    { name: "Trade Show Intel", detail: "On-the-ground product demos, competitor booth sizing, attendance density, customer conversations. Hard to replicate.", icon: <Network className="w-4 h-4" />, color: "rose" },
  ];

  const scuttlebuttPrinciples = [
    { label: "Ask the right question", detail: "\"Would you recommend this vendor to a colleague?\" elicits more than \"How is the product?\"" },
    { label: "Triangulate sources", detail: "Same question to 5 independent sources. Outliers as interesting as consensus answers." },
    { label: "Focus on ex-employees", detail: "Former employees 3–18 months post-departure are candid without career risk. LinkedIn + Tegus transcripts." },
    { label: "Watch what they do, not say", detail: "Executive stock sales, insider purchasing, capex decisions reveal more than guidance." },
    { label: "Map the ecosystem", detail: "Build a supplier→distributor→customer map. Each node in the chain holds different information." },
    { label: "Document contradictions", detail: "When management narrative contradicts channel checks → flag as key risk in thesis." },
  ];

  const expertNetworks = [
    { name: "GLG", description: "Gerson Lehrman Group — largest expert network, 900K+ experts globally. ~$1000/hr for senior calls.", color: "blue" },
    { name: "Tegus", description: "Transcript-first model. Search historical expert calls. Flat-fee subscription vs. per-call pricing.", color: "purple" },
    { name: "AlphaSights", description: "Strong in EMEA and Asian markets. Deep science/engineering experts for deep-tech due diligence.", color: "emerald" },
    { name: "Guidepoint", description: "Public sector and government-focused experts. Healthcare, defense, and infrastructure due diligence.", color: "orange" },
  ];

  return (
    <div className="space-y-4">
      {/* Info advantage pyramid */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-muted border border-border rounded-md p-4 flex flex-col items-center">
          <InfoPyramidSVG />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Bottom layers are crowded. Alpha lives in primary research.
          </p>
        </div>

        {/* Channel framework */}
        <div className="bg-muted border border-border rounded-md p-4">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            Channel Check Framework
          </h3>
          <div className="space-y-2">
            {CHANNEL_LEVELS.map((level, i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-lg p-2.5 cursor-pointer border transition-colors",
                  activeLevel === i
                    ? "border-primary bg-muted/40"
                    : "border-border bg-card hover:border-border"
                )}
                onClick={() => setActiveLevel(activeLevel === i ? null : i)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("text-muted-foreground")}>{level.icon}</div>
                  <span className="text-sm font-medium text-foreground">{level.name}</span>
                  <ChevronDown
                    className={cn("w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform", activeLevel === i && "rotate-180")}
                  />
                </div>
                <AnimatePresence>
                  {activeLevel === i && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="mt-2 space-y-1 overflow-hidden"
                    >
                      {level.insights.map((ins, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                          <span className="text-primary mt-0.5">•</span>
                          {ins}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Expert networks */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Expert Network Landscape
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {expertNetworks.map((en, i) => (
            <div key={i} className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-foreground bg-primary px-2 py-0.5 rounded">{en.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{en.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg">
          <p className="text-xs text-amber-300 font-medium mb-1">Compliance & Mosaic Theory</p>
          <p className="text-xs text-muted-foreground">
            Expert calls are legal when experts share publicly available information or non-material opinions. Material non-public information (MNPI) from former insiders violates insider trading laws. Always use compliance-approved call protocols.
          </p>
        </div>
      </div>

      {/* Scuttlebutt */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400" />
          Scuttlebutt Investing — Phil Fisher Method
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Fisher coined &ldquo;scuttlebutt&rdquo; in 1958: systematic gathering of qualitative business intelligence from customers, suppliers, competitors, and employees before building a financial model.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {scuttlebuttPrinciples.map((pr, i) => (
            <div key={i} className="flex gap-2 items-start bg-card rounded-lg p-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">{pr.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{pr.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alt Data */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-muted-foreground" />
          Alternative Data Sources
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {altDataSources.map((src, i) => (
            <motion.div
              key={i}
              className={cn(
                "bg-card rounded-lg p-3 border cursor-pointer transition-colors",
                activeMethod === i ? "border-cyan-600" : "border-border hover:border-border"
              )}
              onClick={() => setActiveMethod(i)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="text-muted-foreground">{src.icon}</div>
                <span className="text-xs font-medium text-foreground">{src.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{src.detail}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 p-2.5 bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-muted-foreground">Proprietary Survey Design: </span>
            Consumer surveys (n=500–2000) or enterprise CIO surveys testing intent-to-purchase, Net Promoter Scores, and vendor preference shifts. Panel providers include Qualtrics, SurveyMonkey, and Dynata. Statistical significance requires careful sample design.
          </p>
        </div>
      </div>
    </div>
  );
}

function ForensicTab() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  const severityColor = (s: "high" | "medium" | "low") =>
    s === "high" ? "text-red-400 bg-red-950/40 border-red-800/50" :
    s === "medium" ? "text-amber-400 bg-amber-950/40 border-amber-800/50" :
    "text-muted-foreground bg-card border-border";

  const severityDot = (s: "high" | "medium" | "low") =>
    s === "high" ? "bg-red-500" : s === "medium" ? "bg-amber-500" : "bg-muted-foreground";

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-md p-4">
        <div className="flex gap-3 items-start">
          <Microscope className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300 mb-1">Forensic Accounting Overview</p>
            <p className="text-xs text-muted-foreground">
              Forensic accounting examines whether reported financials accurately reflect economic reality. Short sellers, credit analysts, and deep-value investors use these frameworks to detect earnings management, fraud, and distress before prices adjust. The goal is not to find fraud in every company — but to identify when the quality of reported earnings is materially lower than consensus assumes.
            </p>
          </div>
        </div>
      </div>

      {/* Flags checklist */}
      <div className="space-y-3">
        {FORENSIC_FLAGS.map((cat, i) => (
          <div key={i} className="bg-muted border border-border rounded-md overflow-hidden">
            <button
              className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left"
              onClick={() => setExpandedCategory(expandedCategory === i ? null : i)}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1">{cat.category}</span>
              <span className="text-xs text-muted-foreground mr-2">{cat.flags.length} flags</span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedCategory === i && "rotate-180")} />
            </button>
            <AnimatePresence>
              {expandedCategory === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2 border-t border-border">
                    {cat.flags.map((flag, j) => {
                      const key = `${i}-${j}`;
                      return (
                        <div key={j} className={cn("rounded-lg border p-2.5 cursor-pointer", severityColor(flag.severity))} onClick={() => setExpandedFlag(expandedFlag === key ? null : key)}>
                          <div className="flex items-start gap-2">
                            <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", severityDot(flag.severity))} />
                            <span className="text-xs text-muted-foreground font-medium flex-1">{flag.label}</span>
                            <span className={cn("text-xs font-medium uppercase px-1.5 py-0.5 rounded", flag.severity === "high" ? "bg-red-900/60 text-red-300" : flag.severity === "medium" ? "bg-amber-900/60 text-amber-300" : "bg-muted text-muted-foreground")}>
                              {flag.severity}
                            </span>
                          </div>
                          <AnimatePresence>
                            {expandedFlag === key && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="text-xs text-muted-foreground mt-1.5 ml-4 overflow-hidden"
                              >
                                {flag.detail}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Beneish M-Score */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-400" />
          Beneish M-Score — Earnings Manipulation Detection
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Eight accounting ratios combined into a single score. M-Score &gt; −1.78 suggests likely manipulation. Identified Enron before collapse.
        </p>
        <div className="grid md:grid-cols-2 gap-2">
          {BENEISH_VARS.map((v, i) => (
            <div key={i} className="bg-card rounded-lg p-2.5 border border-border">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono font-medium text-red-400">{v.abbrev}</span>
                <span className="text-xs text-muted-foreground">{v.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground italic">{v.interpretation}</span>
                <span className="text-xs font-mono text-amber-400 ml-2 flex-shrink-0">{v.threshold}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2.5 bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-red-400">Formula: </span>
            M = −4.84 + 0.92×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI + 0.115×DEPI − 0.172×SGAI + 4.679×TATA − 0.327×LVGI.
            Score above −1.78: probable manipulator. Score below −2.22: likely non-manipulator.
          </p>
        </div>
      </div>

      {/* Altman Z & Zmijewski */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-muted border border-border rounded-md p-4">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            Altman Z-Score
          </h3>
          <p className="text-xs text-muted-foreground mb-2">Predicts bankruptcy probability using 5 financial ratios. Originally for manufacturing; Z&apos; model for private, Z&ldquo; for non-manufacturers.</p>
          <div className="space-y-1 text-xs text-muted-foreground font-mono">
            {[
              { var: "X1", def: "Working Capital / Assets", wt: "×1.2" },
              { var: "X2", def: "Retained Earnings / Assets", wt: "×1.4" },
              { var: "X3", def: "EBIT / Assets", wt: "×3.3" },
              { var: "X4", def: "Market Cap / Book Liabilities", wt: "×0.6" },
              { var: "X5", def: "Revenue / Assets", wt: "×1.0" },
            ].map((row, i) => (
              <div key={i} className="flex gap-2 text-muted-foreground">
                <span className="text-orange-400 w-4">{row.var}</span>
                <span className="flex-1">{row.def}</span>
                <span className="text-muted-foreground">{row.wt}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
            <div className="flex justify-between"><span className="text-emerald-400">Z &gt; 2.99</span><span className="text-muted-foreground">Safe zone</span></div>
            <div className="flex justify-between"><span className="text-amber-400">1.81–2.99</span><span className="text-muted-foreground">Grey zone</span></div>
            <div className="flex justify-between"><span className="text-red-400">Z &lt; 1.81</span><span className="text-muted-foreground">Distress zone</span></div>
          </div>
        </div>

        <div className="bg-muted border border-border rounded-md p-4">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Short Seller Report Anatomy
          </h3>
          <p className="text-xs text-muted-foreground mb-2">Well-constructed short reports follow a predictable structure. Understanding the template helps separate signal from noise.</p>
          <div className="space-y-2">
            {[
              { section: "Executive Summary", detail: "Key allegations in 2–3 bullets. Sets the narrative before the detail." },
              { section: "Background & Business", detail: "How the company represents itself. Sets up the 'official story'." },
              { section: "The Evidence", detail: "Primary research: site visits, channel checks, regulatory filings, whistleblowers." },
              { section: "Financial Analysis", detail: "Cash flow vs. earnings, DSO analysis, non-GAAP reconciliation dissection." },
              { section: "Price Target & Thesis", detail: "Bear case valuation + what the stock is worth on honest numbers." },
            ].map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs font-mono text-primary w-5 mt-0.5">{i + 1}.</span>
                <div>
                  <p className="text-xs font-medium text-foreground">{s.section}</p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThesisTab() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeMoat, setActiveMoat] = useState<number | null>(null);

  const tamData = [
    { label: "TAM", value: 320, desc: "Total Addressable Market — if 100% market share", color: "#3b82f6" },
    { label: "SAM", value: 95, desc: "Serviceable Addressable Market — realistic segments you can sell into", color: "#8b5cf6" },
    { label: "SOM", value: 18, desc: "Serviceable Obtainable Market — near-term capture (3–5 years)", color: "#10b981" },
  ];

  const ideaGenSources = [
    { label: "13F Filings", detail: "Quarterly holdings of 100M+ institutional managers. Follow high-conviction concentrated funds. 45-day lag is the main limitation." },
    { label: "Spin-Off Watchlist", detail: "Post-spin stocks often misprice in first 6–18 months. Forced sellers (index funds, parent shareholders) create dislocation." },
    { label: "52-Week Lows", detail: "Stocks near 52-week lows with improving fundamentals offer mean reversion + fundamental catalyst combination." },
    { label: "Conference Presentations", detail: "Company and investor conference decks often reveal strategic pivots before quarterly disclosures." },
    { label: "Activist 13D Filings", detail: "Schedule 13D signals intent to influence corporate strategy. Read the accompanying letter for thesis insights." },
    { label: "Insider Purchases", detail: "Open-market purchases by CEO/CFO are the strongest insider signal — they get no discount and face six-month lockup." },
  ];

  return (
    <div className="space-y-4">
      {/* Thesis steps */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Differentiated Thesis Construction Framework
        </h3>

        {/* Step nav */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {THESIS_STEPS.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={cn(
                "text-xs text-muted-foreground px-2.5 py-1 rounded-lg font-medium transition-colors",
                activeStep === i ? "bg-primary text-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
              )}
            >
              {step.step}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="bg-card rounded-md p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground">{THESIS_STEPS[activeStep].step}</span>
              <h4 className="text-sm font-medium text-foreground">{THESIS_STEPS[activeStep].title}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{THESIS_STEPS[activeStep].description}</p>
            <div className="bg-muted/40 border border-border rounded-lg p-2.5">
              <p className="text-xs text-primary font-medium mb-0.5">Example</p>
              <p className="text-xs text-muted-foreground italic">{THESIS_STEPS[activeStep].example}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Variant perception */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Variant Perception — Howard Marks Framework
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              label: "Not enough to be right",
              desc: "If consensus is right, there is no alpha. The market already priced in the outcome. You must hold a view that is both different from consensus AND correct.",
              icon: <XCircle className="w-4 h-4 text-red-400" />,
            },
            {
              label: "Disagree AND be right",
              desc: "Contrarianism for its own sake is not an edge. Many stocks are cheap because they deserve to be. You need a specific reason why the market's estimate is wrong.",
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
            },
            {
              label: "Know what the market knows",
              desc: "Before disagreeing, understand the full bull and bear case that professionals have already debated. Consensus is not stupid — it is the weighted average of informed views.",
              icon: <BookOpen className="w-4 h-4 text-primary" />,
            },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                {item.icon}
                <p className="text-xs font-medium text-foreground">{item.label}</p>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TAM / SAM / SOM */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          TAM / SAM / SOM Market Sizing
        </h3>
        <div className="flex items-end gap-3 mb-4">
          {tamData.map((t, i) => {
            const maxH = 120;
            const barH = (t.value / 320) * maxH;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-xs font-mono font-medium" style={{ color: t.color }}>${t.value}B</span>
                <div className="w-full flex items-end justify-center">
                  <div
                    className="w-full rounded-t-md opacity-80 transition-all"
                    style={{ height: barH, backgroundColor: t.color }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: t.color }}>{t.label}</span>
                <span className="text-xs text-muted-foreground text-center">{t.desc}</span>
              </div>
            );
          })}
        </div>
        <div className="bg-card rounded-lg p-2.5 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-muted-foreground">Bottom-up vs. Top-down: </span>
            Top-down (TAM × share) is common in sell-side reports but often inflated. Bottom-up (unit volume × price × penetration by segment) is more rigorous. Always triangulate both. If the bottom-up SOM is &lt;5% of TAM, question the TAM definition.
          </p>
        </div>
      </div>

      {/* Moat radar */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-muted border border-border rounded-md p-4 flex flex-col items-center">
          <h3 className="text-sm font-medium text-foreground mb-3 w-full flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Economic Moat Durability
          </h3>
          <MoatRadarSVG moats={MOAT_TYPES} />
        </div>

        <div className="bg-muted border border-border rounded-md p-4">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Moat Classification
          </h3>
          <div className="space-y-2">
            {MOAT_TYPES.map((moat, i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-lg p-2.5 cursor-pointer border transition-colors",
                  activeMoat === i ? "border-primary bg-muted/30" : "border-border bg-card hover:border-border"
                )}
                onClick={() => setActiveMoat(activeMoat === i ? null : i)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{moat.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden ml-2">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${moat.durability}%` }} />
                  </div>
                  <span className="text-xs font-mono text-primary">{moat.durability}</span>
                </div>
                <AnimatePresence>
                  {activeMoat === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden mt-2"
                    >
                      <p className="text-xs text-muted-foreground mb-1.5">{moat.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {moat.examples.map((ex, j) => (
                          <span key={j} className="text-xs bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground">{ex}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Idea generation */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          Idea Generation Sources
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {ideaGenSources.map((src, i) => (
            <div key={i} className="flex gap-2 items-start bg-card rounded-lg p-2.5 border border-border">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">{src.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{src.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position sizing */}
      <div className="bg-muted border border-border rounded-md p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-400" />
          Position Sizing & When to Sell
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-rose-400 mb-2">Conviction-Based Sizing</p>
            <div className="space-y-1.5">
              {[
                { label: "Tier 1 — Best ideas", size: "4–8%", criteria: "High conviction, liquid, low correlation, near catalyst" },
                { label: "Tier 2 — Core holdings", size: "2–4%", criteria: "Good setup, medium conviction, monitoring phase" },
                { label: "Tier 3 — Exploratory", size: "0.5–2%", criteria: "Early research, thesis forming, position starter" },
              ].map((tier, i) => (
                <div key={i} className="flex gap-2 items-start bg-card rounded p-2">
                  <span className="text-xs font-medium text-rose-400 w-16 flex-shrink-0">{tier.size}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{tier.label}</p>
                    <p className="text-xs text-muted-foreground">{tier.criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-amber-400 mb-2">When to Sell Discipline</p>
            <div className="space-y-1.5">
              {[
                { trigger: "Thesis plays out", action: "Price reaches intrinsic value estimate. Trim or exit." },
                { trigger: "Thesis breaks", action: "Key assumption proven wrong. Sell immediately regardless of price." },
                { trigger: "Better opportunity", action: "Opportunity cost reallocation. Forced ranking of ideas." },
                { trigger: "Position risk too large", action: "Price appreciation pushes above sizing limit. Trim to cap." },
                { trigger: "Catalysts delayed repeatedly", action: "Re-evaluate time value of capital. What else could this capital do?" },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <XCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{item.trigger}: </span>
                    <span className="text-muted-foreground">{item.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EquityResearch3Page() {
  // Consume seeded random values at module level to avoid lint warnings
  void r();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {/* Header — Hero */}
        <div className="border-l-4 border-l-primary rounded-lg bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Microscope className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-primary">Advanced Equity Research</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            SOTP · Primary Research · Forensic Accounting · Thesis Construction
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Professional-grade frameworks used by top-tier buy-side analysts and fundamental short sellers.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sotp" className="w-full mt-8">
          <TabsList className="grid grid-cols-4 w-full bg-muted border border-border rounded-md p-1 h-auto">
            {[
              { value: "sotp", label: "SOTP & Conglomerates", icon: <PieChart className="w-3.5 h-3.5" /> },
              { value: "primary", label: "Primary Research", icon: <Search className="w-3.5 h-3.5" /> },
              { value: "forensic", label: "Forensic Accounting", icon: <Microscope className="w-3.5 h-3.5" /> },
              { value: "thesis", label: "Thesis Construction", icon: <Target className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs py-2 data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-lg"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="sotp" className="data-[state=inactive]:hidden">
              <SOTPTab />
            </TabsContent>
            <TabsContent value="primary" className="data-[state=inactive]:hidden">
              <PrimaryResearchTab />
            </TabsContent>
            <TabsContent value="forensic" className="data-[state=inactive]:hidden">
              <ForensicTab />
            </TabsContent>
            <TabsContent value="thesis" className="data-[state=inactive]:hidden">
              <ThesisTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
