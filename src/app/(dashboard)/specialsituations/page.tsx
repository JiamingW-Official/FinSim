"use client";

import { useState } from "react";
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Users,
  BarChart2,
  RefreshCw,
  ChevronRight,
  Info,
  Zap,
  Calculator,
  BookOpen,
  Activity,
  DollarSign,
  Award,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 872;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate values to avoid re-seeding issues
const _pregenValues: number[] = [];
for (let i = 0; i < 300; i++) _pregenValues.push(rand());
let _idx = 0;
const r = () => _pregenValues[_idx++ % _pregenValues.length];

// ── Types ─────────────────────────────────────────────────────────────────────

type RiskLevel = "Low" | "Medium" | "High" | "Very High";

interface EventType {
  id: string;
  name: string;
  description: string;
  holdingPeriodMonths: [number, number];
  typicalReturnPct: [number, number];
  riskLevel: RiskLevel;
  phases: string[];
  keyRisks: string[];
  color: string;
}

interface ActivistFund {
  name: string;
  aum: string;
  style: string;
  successRate: number;
  avgHoldMonths: number;
  notableWins: string;
}

interface DemandType {
  demand: string;
  successRate: number;
  avgReturn: number;
}

interface PostReorgData {
  period: string;
  returnPct: number;
}

interface StubTrade {
  name: string;
  parent: string;
  subsidiary: string;
  year: number;
  impliedStubValue: number;
  actualStubValue: number;
  catalyst: string;
  outcome: string;
}

// ── Event Types Data ──────────────────────────────────────────────────────────

const EVENT_TYPES: EventType[] = [
  {
    id: "merger-arb",
    name: "Merger Arbitrage",
    description:
      "Buy target at discount to deal price, short acquirer in stock deals. Captures spread between current price and announced deal value.",
    holdingPeriodMonths: [1, 6],
    typicalReturnPct: [2, 8],
    riskLevel: "Medium",
    phases: ["Announcement", "Regulatory Review", "Shareholder Vote", "Close"],
    keyRisks: ["Deal break", "Regulatory block", "Competing bid gap"],
    color: "#6366f1",
  },
  {
    id: "tender-offer",
    name: "Tender Offer",
    description:
      "Direct offer to shareholders at a premium. Often faster than mergers. Watch for partial vs full tender, proration, and condition waivers.",
    holdingPeriodMonths: [1, 3],
    typicalReturnPct: [3, 12],
    riskLevel: "Medium",
    phases: ["Announcement", "Tender Period", "Proration", "Settlement"],
    keyRisks: ["Conditions not waived", "Proration risk", "Minimum tender not met"],
    color: "#8b5cf6",
  },
  {
    id: "spinoff",
    name: "Spin-Off",
    description:
      "Parent distributes subsidiary shares to shareholders. SpinCo often sold by institutional holders at any price, creating undervaluation.",
    holdingPeriodMonths: [3, 18],
    typicalReturnPct: [10, 35],
    riskLevel: "Medium",
    phases: ["Form 10 Filing", "Record Date", "Distribution", "When-Issued Trading"],
    keyRisks: ["Debt allocation", "Customer concentration", "Parent dis-synergies"],
    color: "#a855f7",
  },
  {
    id: "stub-trade",
    name: "Stub Trade",
    description:
      "Parent trades below value of its listed subsidiary stake. Implied stub = parent market cap minus subsidiary stake value. Buy parent, short subsidiary.",
    holdingPeriodMonths: [2, 12],
    typicalReturnPct: [8, 40],
    riskLevel: "High",
    phases: ["Identify Discount", "Position Entry", "Catalyst Wait", "Convergence"],
    keyRisks: ["No catalyst", "Holding cost", "Subsidiary decline", "Margin calls"],
    color: "#ec4899",
  },
  {
    id: "liquidation",
    name: "Liquidation",
    description:
      "Company winds down and distributes assets. Net asset value vs market price. Voluntary liquidations often trade at 10–30% discount to NAV.",
    holdingPeriodMonths: [6, 36],
    typicalReturnPct: [5, 25],
    riskLevel: "Medium",
    phases: ["Announcement", "Asset Sales", "Claims Resolution", "Distributions"],
    keyRisks: ["Asset write-downs", "Litigation overhang", "Timeline slippage"],
    color: "#f59e0b",
  },
  {
    id: "rights-offering",
    name: "Rights Offering",
    description:
      "Company offers existing shareholders right to buy new shares at a discount. Tradable rights often underpriced due to complexity discount.",
    holdingPeriodMonths: [1, 2],
    typicalReturnPct: [4, 15],
    riskLevel: "Medium",
    phases: ["Record Date", "Rights Distribution", "Exercise Period", "Expiry"],
    keyRisks: ["Dilution", "Rights expiry", "Subscription price above market"],
    color: "#10b981",
  },
  {
    id: "adr",
    name: "ADR Arbitrage",
    description:
      "Price discrepancy between ADR and underlying foreign shares. Structural mispricings from currency, time-zone, or custody restrictions.",
    holdingPeriodMonths: [0, 1],
    typicalReturnPct: [1, 5],
    riskLevel: "Low",
    phases: ["Identify Gap", "ADR Conversion", "FX Execution", "Settlement"],
    keyRisks: ["Conversion restrictions", "FX moves", "Custody fees"],
    color: "#06b6d4",
  },
  {
    id: "post-reorg",
    name: "Post-Reorg Equity",
    description:
      "Equity issued to creditors in Chapter 11 reorganization. Fresh-start accounting, lean balance sheet, motivated management. Often ignored by sell-side.",
    holdingPeriodMonths: [12, 48],
    typicalReturnPct: [20, 150],
    riskLevel: "Very High",
    phases: ["Emergence", "Fresh-Start", "Price Discovery", "Re-Rating"],
    keyRisks: ["Re-filing risk", "Legacy liabilities", "Management turnover"],
    color: "#ef4444",
  },
];

// ── Activist Data ─────────────────────────────────────────────────────────────

const ACTIVIST_FUNDS: ActivistFund[] = [
  {
    name: "Elliott Management",
    aum: "$65B",
    style: "Aggressive / Multi-tactic",
    successRate: 72,
    avgHoldMonths: 28,
    notableWins: "AT&T, Twitter, SAP, BHP",
  },
  {
    name: "Icahn Enterprises",
    aum: "$18B",
    style: "Board Control / Governance",
    successRate: 68,
    avgHoldMonths: 34,
    notableWins: "Dell, Motorola, Apple, Herbalife",
  },
  {
    name: "ValueAct Capital",
    aum: "$14B",
    style: "Collaborative / Strategic",
    successRate: 78,
    avgHoldMonths: 42,
    notableWins: "Microsoft, Seagate, Willis Towers",
  },
  {
    name: "Jana Partners",
    aum: "$8B",
    style: "Operational / ESG-focused",
    successRate: 61,
    avgHoldMonths: 22,
    notableWins: "Whole Foods, Whole Foods, CalAmp, AIM",
  },
];

const DEMAND_TYPES: DemandType[] = [
  { demand: "CEO Replacement", successRate: 58, avgReturn: 18 },
  { demand: "Strategic Sale / M&A", successRate: 71, avgReturn: 32 },
  { demand: "Board Seats", successRate: 66, avgReturn: 14 },
  { demand: "Capital Return / Buyback", successRate: 74, avgReturn: 22 },
  { demand: "Spin-off / Separation", successRate: 63, avgReturn: 28 },
  { demand: "Cost Cuts / Restructuring", successRate: 55, avgReturn: 12 },
];

// ── Post-Reorg Historical Returns ─────────────────────────────────────────────

const POST_REORG_DATA: PostReorgData[] = [
  { period: "0–3m", returnPct: 8 },
  { period: "3–6m", returnPct: 22 },
  { period: "6–12m", returnPct: 41 },
  { period: "12–18m", returnPct: 67 },
  { period: "18–24m", returnPct: 95 },
  { period: "24–36m", returnPct: 128 },
  { period: "36–48m", returnPct: 158 },
];

// ── Stub Trades Data ──────────────────────────────────────────────────────────

const FAMOUS_STUBS: StubTrade[] = [
  {
    name: "Palm / 3Com",
    parent: "3Com",
    subsidiary: "Palm",
    year: 2000,
    impliedStubValue: -63,
    actualStubValue: 0,
    catalyst: "Full spin-off completion",
    outcome: "3Com traded at negative implied value; arb paid +180% on convergence",
  },
  {
    name: "VW / Porsche",
    parent: "Porsche SE",
    subsidiary: "Volkswagen",
    year: 2008,
    impliedStubValue: -22000,
    actualStubValue: 0,
    catalyst: "VW short squeeze → Porsche unwind",
    outcome: "Porsche corner caused VW to briefly become world's largest cap company",
  },
  {
    name: "Altria / PM Intl",
    parent: "Altria Group",
    subsidiary: "Philip Morris Intl",
    year: 2010,
    impliedStubValue: -8,
    actualStubValue: 12,
    catalyst: "Domestic tobacco re-rating",
    outcome: "Stub compressed; Altria re-rated +40% over 3 years",
  },
  {
    name: "Liberty / Live Nation",
    parent: "Liberty Media",
    subsidiary: "Live Nation",
    year: 2016,
    impliedStubValue: 4,
    actualStubValue: 18,
    catalyst: "SiriusXM consolidation clarity",
    outcome: "Stub discount narrowed from 35% to 8% over 18 months",
  },
];

// ── Helper Components ─────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  High: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Very High": "text-red-400 bg-red-400/10 border-red-400/20",
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-muted-foreground font-medium border",
        RISK_COLORS[level]
      )}
    >
      <Shield className="w-3 h-3" />
      {level}
    </span>
  );
}

// ── Event Lifecycle SVG ───────────────────────────────────────────────────────

function EventLifecycleSVG({
  phases,
  color,
}: {
  phases: string[];
  color: string;
}) {
  const w = 320;
  const h = 48;
  const nodeSpacing = w / (phases.length - 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xs h-12">
      {/* Connecting line */}
      <line x1={0} y1={24} x2={w} y2={24} stroke="#374151" strokeWidth={2} />
      {phases.map((phase, i) => {
        const x = i * nodeSpacing;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={24}
              r={6}
              fill={color}
              opacity={0.9}
            />
            <text
              x={x}
              y={44}
              textAnchor="middle"
              fontSize={8}
              fill="#9ca3af"
              fontFamily="sans-serif"
            >
              {phase.length > 10 ? phase.slice(0, 9) + "…" : phase}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Return Profile SVG ────────────────────────────────────────────────────────

function ReturnProfileSVG({
  min,
  max,
  color,
}: {
  min: number;
  max: number;
  color: string;
}) {
  const w = 120;
  const h = 24;
  const scale = (v: number) => (v / 200) * w;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-28 h-6">
      <rect x={0} y={8} width={w} height={8} rx={4} fill="#1f2937" />
      <rect
        x={scale(min)}
        y={8}
        width={scale(max - min)}
        height={8}
        rx={4}
        fill={color}
        opacity={0.8}
      />
      <text x={scale(min)} y={7} fontSize={7} fill="#9ca3af" textAnchor="middle">
        {min}%
      </text>
      <text x={scale(max)} y={7} fontSize={7} fill="#9ca3af" textAnchor="middle">
        {max}%
      </text>
    </svg>
  );
}

// ── Activist Campaign SVG ─────────────────────────────────────────────────────

function ActivistCampaignSVG() {
  const steps = [
    { label: "13D Filing", sub: "5% threshold", color: "#6366f1" },
    { label: "Public Letter", sub: "Demands issued", color: "#8b5cf6" },
    { label: "Proxy Fight", sub: "Slate nominated", color: "#a855f7" },
    { label: "Resolution", sub: "Board seat / Sale", color: "#ec4899" },
  ];

  const w = 500;
  const h = 100;
  const spacing = w / (steps.length - 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
      {/* Arrow line */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
        </marker>
      </defs>
      <line
        x1={20}
        y1={50}
        x2={w - 20}
        y2={50}
        stroke="#374151"
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
      />
      {steps.map((step, i) => {
        const x = i * spacing;
        return (
          <g key={i}>
            <circle cx={x} cy={50} r={10} fill={step.color} opacity={0.9} />
            <text
              x={x}
              y={30}
              textAnchor="middle"
              fontSize={9}
              fill="#e5e7eb"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              {step.label}
            </text>
            <text
              x={x}
              y={78}
              textAnchor="middle"
              fontSize={8}
              fill="#6b7280"
              fontFamily="sans-serif"
            >
              {step.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Success Rate Bar ──────────────────────────────────────────────────────────

function SuccessRateBar({
  demand,
  rate,
  avgReturn,
}: {
  demand: string;
  rate: number;
  avgReturn: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs text-muted-foreground w-44 shrink-0">{demand}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
      </div>
      <span className="text-xs text-indigo-400 w-8 text-right">{rate}%</span>
      <span className="text-xs text-emerald-400 w-12 text-right">+{avgReturn}% avg</span>
    </div>
  );
}

// ── Post-Reorg Return SVG ─────────────────────────────────────────────────────

function PostReorgReturnSVG() {
  const data = POST_REORG_DATA;
  const w = 480;
  const h = 160;
  const padL = 40;
  const padB = 30;
  const padT = 16;
  const padR = 16;
  const chartW = w - padL - padR;
  const chartH = h - padB - padT;
  const maxVal = 170;

  const xStep = chartW / (data.length - 1);
  const yScale = (v: number) => chartH - (v / maxVal) * chartH;

  const points = data
    .map((d, i) => `${padL + i * xStep},${padT + yScale(d.returnPct)}`)
    .join(" ");

  const areaPoints =
    `${padL},${padT + chartH} ` +
    data.map((d, i) => `${padL + i * xStep},${padT + yScale(d.returnPct)}`).join(" ") +
    ` ${padL + (data.length - 1) * xStep},${padT + chartH}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <defs>
        <linearGradient id="reorgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 50, 100, 150].map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={padT + yScale(v)}
            x2={w - padR}
            y2={padT + yScale(v)}
            stroke="#1f2937"
            strokeWidth={1}
          />
          <text x={padL - 4} y={padT + yScale(v) + 4} fontSize={8} fill="#6b7280" textAnchor="end">
            {v}%
          </text>
        </g>
      ))}

      {/* Area fill */}
      <polygon points={areaPoints} fill="url(#reorgGrad)" />

      {/* Line */}
      <polyline points={points} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Dots & labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle
            cx={padL + i * xStep}
            cy={padT + yScale(d.returnPct)}
            r={4}
            fill="#ef4444"
          />
          <text
            x={padL + i * xStep}
            y={h - 6}
            textAnchor="middle"
            fontSize={8}
            fill="#9ca3af"
          >
            {d.period}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Stub Discount SVG ─────────────────────────────────────────────────────────

function StubDiscountSVG() {
  // Simulate stub discount over 24 months converging
  const months = 24;
  const discountData: number[] = [];
  let discount = -45;
  for (let i = 0; i <= months; i++) {
    discountData.push(discount);
    discount += (r() - 0.4) * 4;
    if (i > 18) discount = discount * 0.85; // convergence
  }

  const w = 480;
  const h = 160;
  const padL = 44;
  const padB = 30;
  const padT = 16;
  const padR = 16;
  const chartW = w - padL - padR;
  const chartH = h - padB - padT;
  const minV = -60;
  const maxV = 20;
  const range = maxV - minV;

  const xStep = chartW / months;
  const yScale = (v: number) => chartH - ((v - minV) / range) * chartH;

  const points = discountData
    .map((d, i) => `${padL + i * xStep},${padT + yScale(d)}`)
    .join(" ");

  const zeroY = padT + yScale(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      {/* Zero line */}
      <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="4,3" />
      <text x={padL - 4} y={zeroY + 4} fontSize={8} fill="#6b7280" textAnchor="end">0%</text>

      {/* Grid */}
      {[-60, -40, -20, 0, 20].map((v) => (
        <g key={v}>
          <line x1={padL} y1={padT + yScale(v)} x2={w - padR} y2={padT + yScale(v)} stroke="#1f2937" strokeWidth={1} />
          <text x={padL - 4} y={padT + yScale(v) + 4} fontSize={8} fill="#6b7280" textAnchor="end">{v}%</text>
        </g>
      ))}

      {/* Area below zero */}
      <clipPath id="discountClip">
        <rect x={padL} y={zeroY} width={chartW} height={chartH - yScale(0)} />
      </clipPath>

      {/* Line */}
      <polyline points={points} fill="none" stroke="#ec4899" strokeWidth={2.5} strokeLinejoin="round" />

      {/* X labels */}
      {[0, 6, 12, 18, 24].map((m) => (
        <text
          key={m}
          x={padL + m * xStep}
          y={h - 6}
          textAnchor="middle"
          fontSize={8}
          fill="#9ca3af"
        >
          m{m}
        </text>
      ))}

      {/* Discount label */}
      <text x={padL + 8} y={padT + yScale(-45) - 6} fontSize={8} fill="#ec4899">Stub Discount</text>
    </svg>
  );
}

// ── Stub Value Calculator ─────────────────────────────────────────────────────

function StubCalculator() {
  const [parentPrice, setParentPrice] = useState(85);
  const [subPrice, setSubPrice] = useState(60);
  const [stakePercent, setStakePercent] = useState(80);
  const [sharesRatio, setSharesRatio] = useState(0.5);
  const parentShares = 200; // millions (fixed for display purposes)

  const subStakeValue = (subPrice * sharesRatio * stakePercent) / 100;
  const impliedStub = parentPrice - subStakeValue;
  const subMarketCap = subPrice * (parentShares * sharesRatio) * (stakePercent / 100);
  const parentMarketCap = parentPrice * parentShares;
  const stubMarketCap = parentMarketCap - subMarketCap;


  return (
    <div className="bg-card rounded-md border border-border p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-foreground">Implied Stub Value Calculator</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(
          [
            { label: "Parent Price ($)", value: parentPrice, setter: setParentPrice, min: 1, max: 500, step: 1 },
            { label: "Subsidiary Price ($)", value: subPrice, setter: setSubPrice, min: 1, max: 500, step: 1 },
            { label: "Parent's Stake in Sub (%)", value: stakePercent, setter: setStakePercent, min: 10, max: 100, step: 1 },
            { label: "Sub Shares per Parent Share", value: sharesRatio, setter: setSharesRatio, min: 0.1, max: 5, step: 0.1 },
          ] as Array<{ label: string; value: number; setter: (v: number) => void; min: number; max: number; step: number }>
        ).map(({ label, value, setter, min, max, step }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs text-muted-foreground">{label}</label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => setter(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="text-sm font-mono text-foreground text-right">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
        {[
          { label: "Sub Stake Value", value: `$${subStakeValue.toFixed(2)}`, color: "text-primary" },
          { label: "Implied Stub Value", value: `$${impliedStub.toFixed(2)}`, color: impliedStub < 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Stub Mkt Cap ($M)", value: `$${(stubMarketCap / 1).toFixed(0)}M`, color: stubMarketCap < 0 ? "text-red-400" : "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className={cn("text-base font-semibold font-mono", color)}>{value}</div>
          </div>
        ))}
      </div>

      {impliedStub < 0 && (
        <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">
            Negative stub: parent trades below the value of its subsidiary stake alone — classic stub trade setup. Buy parent, short subsidiary.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tab 1: Event Catalog ──────────────────────────────────────────────────────

function EventCatalogTab() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedEvent = EVENT_TYPES.find((e) => e.id === selected) ?? null;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-md p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">8 Core Special Situations</h3>
        <p className="text-xs text-muted-foreground">
          Event-driven investing exploits mispricings caused by corporate actions. Each event type has distinct mechanics, holding periods, and risk profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EVENT_TYPES.map((evt) => (
          <motion.div
            key={evt.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelected(selected === evt.id ? null : evt.id)}
            className={cn(
              "bg-card border rounded-md p-4 cursor-pointer transition-colors",
              selected === evt.id ? "border-indigo-500/60" : "border-border hover:border-border"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: evt.color }}
                />
                <span className="text-sm font-semibold text-foreground">{evt.name}</span>
              </div>
              <RiskBadge level={evt.riskLevel} />
            </div>

            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{evt.description}</p>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {evt.holdingPeriodMonths[0]}–{evt.holdingPeriodMonths[1]} months
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">
                  {evt.typicalReturnPct[0]}–{evt.typicalReturnPct[1]}% typical
                </span>
              </div>
            </div>

            <EventLifecycleSVG phases={evt.phases} color={evt.color} />

            <AnimatePresence>
              {selected === evt.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-border overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Return Profile</div>
                    <ReturnProfileSVG
                      min={evt.typicalReturnPct[0]}
                      max={evt.typicalReturnPct[1]}
                      color={evt.color}
                    />
                    <div className="mt-2">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Key Risks</div>
                      {evt.keyRisks.map((risk, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Activist Strategies ────────────────────────────────────────────────

function ActivistTab() {
  const [showShort, setShowShort] = useState(false);

  const targetCriteria = [
    { criterion: "Undervaluation vs. Peers", weight: "High", detail: "EV/EBITDA 30%+ below sector median" },
    { criterion: "Poor Capital Allocation", weight: "High", detail: "Excess cash, dilutive M&A, no buybacks" },
    { criterion: "Weak Governance", weight: "Medium", detail: "Classified board, dual-class shares, entrenched CEO" },
    { criterion: "Conglomerate Discount", weight: "High", detail: "Sum-of-parts > current market cap by 20%+" },
    { criterion: "Management Underperformance", weight: "Medium", detail: "TSR 3yr below peers, margin compression" },
    { criterion: "Ownership Fragmentation", weight: "Low", detail: "No dominant long-term holders; passive-heavy register" },
  ];

  return (
    <div className="space-y-5">
      {/* Campaign Phases */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Activist Campaign Phases</h3>
        <p className="text-xs text-muted-foreground mb-4">
          From initial 13D filing to resolution — each phase has distinct price dynamics and investor behavior.
        </p>
        <ActivistCampaignSVG />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { phase: "13D Filing", note: "Share price typically +5–15% on day of filing", icon: <FileText className="w-4 h-4 text-indigo-400" /> },
            { phase: "Public Letter", note: "Detailed demands; management responds within 30 days", icon: <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50" /> },
            { phase: "Proxy Fight", note: "Costly; ~60% of contested elections settle before vote", icon: <Users className="w-4 h-4 text-fuchsia-400" /> },
            { phase: "Resolution", note: "Board seat, strategic review, or sale announcement", icon: <CheckCircle2 className="w-4 h-4 text-pink-400" /> },
          ].map(({ phase, note, icon }) => (
            <div key={phase} className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-xs font-medium text-foreground">{phase}</span>
              </div>
              <p className="text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Activist Funds */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Top Activist Funds</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["Fund", "AUM", "Style", "Success Rate", "Avg Hold", "Notable Wins"].map((h) => (
                  <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVIST_FUNDS.map((fund) => (
                <tr key={fund.name} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{fund.name}</td>
                  <td className="py-2.5 pr-4 text-indigo-400">{fund.aum}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{fund.style}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${fund.successRate}%` }}
                        />
                      </div>
                      <span className="text-emerald-400">{fund.successRate}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{fund.avgHoldMonths}mo</td>
                  <td className="py-2.5 text-muted-foreground text-xs">{fund.notableWins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Rate by Demand Type */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Success Rate by Demand Type</h3>
        <div className="space-y-1">
          {DEMAND_TYPES.map((d) => (
            <SuccessRateBar
              key={d.demand}
              demand={d.demand}
              rate={d.successRate}
              avgReturn={d.avgReturn}
            />
          ))}
        </div>
      </div>

      {/* Short Activism Toggle */}
      <div className="bg-card border border-border rounded-md p-5">
        <button
          onClick={() => setShowShort(!showShort)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-foreground">Short Activism Model</span>
            <span className="text-xs text-muted-foreground">(Hindenburg / Muddy Waters)</span>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", showShort && "rotate-90")} />
        </button>

        <AnimatePresence>
          {showShort && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Research Process</h4>
                  {[
                    "12–18 month deep investigation",
                    "On-the-ground channel checks",
                    "FOIA requests & court filings",
                    "Former employee interviews",
                    "Forensic accounting review",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-4 h-4 rounded-full bg-red-900/50 flex items-center justify-center text-red-400 text-xs font-semibold">
                        {i + 1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Common Targets</h4>
                  {[
                    "Chinese reverse-merger companies",
                    "Companies with related-party transactions",
                    "Aggressive revenue recognition",
                    "Frequent auditor changes",
                    "Unusually high short interest",
                  ].map((target, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                      {target}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                <p className="text-xs text-red-300">
                  Legal risk: Allegations must be factually grounded. Coordinating with other short sellers or trading on material non-public information constitutes market manipulation.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Target Selection Criteria */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Target Selection Criteria</h3>
        <div className="space-y-2">
          {targetCriteria.map(({ criterion, weight, detail }) => (
            <div key={criterion} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
              <span
                className={cn(
                  "text-xs text-muted-foreground px-1.5 py-0.5 rounded font-medium shrink-0",
                  weight === "High" ? "bg-red-900/40 text-red-400" :
                  weight === "Medium" ? "bg-amber-900/40 text-amber-400" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {weight}
              </span>
              <div>
                <div className="text-xs font-medium text-foreground">{criterion}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Post-Reorg Equity ──────────────────────────────────────────────────

function PostReorgTab() {
  const keyInsights = [
    {
      title: "Fresh-Start Accounting",
      icon: <RefreshCw className="w-3.5 h-3.5 text-muted-foreground/50" />,
      description:
        "Assets re-valued to fair value on emergence. Goodwill written off. New entity = clean balance sheet with no legacy write-downs.",
    },
    {
      title: "Capital Structure Analysis",
      icon: <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />,
      description:
        "New equity issued to former creditors (often at 6–8× EBITDA). Management gets 5–10% equity kicker. Debt load reduced 60–80%.",
    },
    {
      title: "Management Alignment",
      icon: <Award className="w-4 h-4 text-amber-400" />,
      description:
        "Management equity grants vest over 3–5 years, tied to value creation. Misaligned management replaced in most reorgs.",
    },
    {
      title: "Exit Timing",
      icon: <Clock className="w-4 h-4 text-emerald-400" />,
      description:
        "Optimal exit: 18–36 months post-emergence when sell-side initiates coverage, index inclusion, and creditor forced selling abates.",
    },
  ];

  const riskFactors = [
    { risk: "Re-filing risk", detail: "Company enters Chapter 11 again within 3 years (~15% of cases)" },
    { risk: "Legacy liabilities", detail: "Environmental, pension, or asbestos claims survive reorganization" },
    { risk: "Creditor overhang", detail: "Creditors sell equity at any price; no bottom-up research" },
    { risk: "Management continuity", detail: "CEO replaced on emergence; new team learning curve" },
    { risk: "Complexity discount", detail: "No analyst coverage, complex disclosures, institutional avoidance" },
  ];

  return (
    <div className="space-y-5">
      {/* Why Undervalued */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-2">Why Post-Reorg Equity Outperforms</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Studies show post-reorganization equities outperform the market by 40–60% over the first 3 years. The reasons are structural: creditors receive equity they didn&apos;t want, institutional investors can&apos;t hold below-investment-grade equity, and sell-side analysts don&apos;t cover companies without revenue from banking relationships.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {keyInsights.map(({ title, icon, description }) => (
            <div key={title} className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                {icon}
                <span className="text-xs font-medium text-foreground">{title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Returns Chart */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Historical Post-Reorg Equity Returns</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Median cumulative return vs. S&P 500, equal-weighted basket of 200 post-reorg equities (2000–2024)
        </p>
        <PostReorgReturnSVG />
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "12-Month Median", value: "+41%", sub: "vs. S&P +12%" },
            { label: "36-Month Median", value: "+128%", sub: "vs. S&P +38%" },
            { label: "Re-Filing Rate", value: "15%", sub: "Within 3 years" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="text-base font-medium text-red-400 font-mono mt-1">{value}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Risks */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Key Risks in Post-Reorg Equity</h3>
        <div className="space-y-2">
          {riskFactors.map(({ risk, detail }) => (
            <div key={risk} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-medium text-foreground">{risk}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Due Diligence Checklist */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Due Diligence Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Read Plan of Reorganization (POR) in full",
            "Review fresh-start balance sheet footnotes",
            "Assess management incentive grant structure",
            "Identify legacy claimant selling pressure",
            "Model 3-year free cash flow to new equity",
            "Check for unresolved environmental / legal claims",
            "Evaluate competitive position post-emergence",
            "Monitor 13F filings for smart money accumulation",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Stub Trades ────────────────────────────────────────────────────────

function StubTradesTab() {
  const [selectedStub, setSelectedStub] = useState<number | null>(null);

  const mechanicsSteps = [
    {
      step: "1",
      title: "Identify Parent-Subsidiary Structure",
      detail: "Parent owns 50–80%+ of publicly traded subsidiary. Parent trades at discount to its stake in sub alone.",
    },
    {
      step: "2",
      title: "Calculate Implied Stub Value",
      detail: "Implied Stub = Parent Price − (Sub Price × Shares Per Parent Share × Ownership %)",
    },
    {
      step: "3",
      title: "Assess Stub Economics",
      detail: "What does parent own besides the sub stake? Other assets, cash, debt. Stub = everything else.",
    },
    {
      step: "4",
      title: "Execute Pair Trade",
      detail: "Buy parent shares. Short subsidiary in ratio matching the stub hedge. Position is market-neutral.",
    },
    {
      step: "5",
      title: "Wait for Catalyst",
      detail: "Spin-off of parent's other assets, sub acquisition, parent share buyback, or re-rating narrows discount.",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Mechanics */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-2">Stub Trade Mechanics</h3>
        <p className="text-xs text-muted-foreground mb-4">
          A stub trade profits when a parent company trades at a discount to the market value of its publicly-listed subsidiary stake. The &quot;stub&quot; represents the residual value of the parent after subtracting its subsidiary holding.
        </p>
        <div className="space-y-3">
          {mechanicsSteps.map(({ step, title, detail }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-medium text-indigo-400 shrink-0">
                {step}
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculator */}
      <StubCalculator />

      {/* Stub Discount Historical */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Stub Discount / Premium Historical Pattern</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Simulated stub discount trajectory — starts at deep discount, converges toward fair value on catalyst
        </p>
        <StubDiscountSVG />
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "Avg Entry Discount", value: "−38%", color: "text-red-400" },
            { label: "Catalyst Timeline", value: "12–18mo", color: "text-amber-400" },
            { label: "Avg Convergence", value: "+62%", color: "text-emerald-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className={cn("text-base font-medium font-mono mt-1", color)}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Famous Stub Trades */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Famous Stub Trades</h3>
        <div className="space-y-2">
          {FAMOUS_STUBS.map((stub, i) => (
            <div key={stub.name} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedStub(selectedStub === i ? null : i)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-indigo-400 w-4">{stub.year}</div>
                  <span className="text-sm font-medium text-foreground">{stub.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {stub.parent} / {stub.subsidiary}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs text-muted-foreground font-mono",
                      stub.impliedStubValue < 0 ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    Implied Stub: ${stub.impliedStubValue}
                  </span>
                  <ChevronRight
                    className={cn("w-4 h-4 text-muted-foreground transition-transform", selectedStub === i && "rotate-90")}
                  />
                </div>
              </button>
              <AnimatePresence>
                {selectedStub === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-lg p-2.5">
                          <div className="text-xs text-muted-foreground mb-0.5">Catalyst</div>
                          <div className="text-xs text-foreground">{stub.catalyst}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5">
                          <div className="text-xs text-muted-foreground mb-0.5">Outcome</div>
                          <div className="text-xs text-foreground">{stub.outcome}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Pair Trade Setup */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Pair Trade Setup & Sizing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-emerald-400">Long Leg (Parent)</h4>
            {[
              "Buy parent shares proportional to stub discount",
              "Size = conviction × portfolio allocation (2–5%)",
              "Set stop-loss if stub widens beyond -60%",
              "Monitor parent's non-sub assets for deterioration",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-red-400">Short Leg (Subsidiary)</h4>
            {[
              "Short sub shares to neutralize sub price exposure",
              "Ratio = parent shares × (sub held per parent share × ownership %)",
              "Borrowing costs can erode returns — check borrow rate",
              "Watch for squeeze risk if sub is heavily shorted",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <TrendingDown className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200">
              Stub trades can remain dislocated for years. The trade is not self-correcting — a catalyst is required for convergence. Carry costs (short borrow, opportunity cost) can destroy alpha even when the thesis is correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SpecialSituationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {/* Header */}
        <div className="space-y-1 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-medium text-foreground">Special Situations Investing</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Event-driven strategies — merger arbitrage, activist campaigns, post-reorganization equity, and stub trades
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
          {[
            { label: "Avg Merger Arb Spread", value: "3–6%", sub: "Annualized", icon: <Activity className="w-4 h-4 text-indigo-400" /> },
            { label: "Post-Reorg 3yr Median", value: "+128%", sub: "vs market +38%", icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
            { label: "Activist Success Rate", value: "66%", sub: "Demand met", icon: <Target className="w-3.5 h-3.5 text-muted-foreground/50" /> },
            { label: "Stub Avg Entry Discount", value: "−38%", sub: "To fair value", icon: <DollarSign className="w-4 h-4 text-pink-400" /> },
          ].map(({ label, value, sub, icon }) => (
            <div key={label} className="bg-card border border-border rounded-md p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div className="text-lg font-medium font-mono text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="events" className="mt-8">
          <TabsList className="bg-card border border-border w-full grid grid-cols-4">
            <TabsTrigger value="events" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              Event Catalog
            </TabsTrigger>
            <TabsTrigger value="activist" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              Activist
            </TabsTrigger>
            <TabsTrigger value="postreorg" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              Post-Reorg Equity
            </TabsTrigger>
            <TabsTrigger value="stub" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
              Stub Trades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-4 data-[state=inactive]:hidden">
            <EventCatalogTab />
          </TabsContent>

          <TabsContent value="activist" className="mt-4 data-[state=inactive]:hidden">
            <ActivistTab />
          </TabsContent>

          <TabsContent value="postreorg" className="mt-4 data-[state=inactive]:hidden">
            <PostReorgTab />
          </TabsContent>

          <TabsContent value="stub" className="mt-4 data-[state=inactive]:hidden">
            <StubTradesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
