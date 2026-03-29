"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Zap,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart2,
  Globe,
  Layers,
  Database,
  Activity,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG (seed 860) ───────────────────────────────────────────────────────────
let s = 860;
const rand = (): number => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values for charts
const RAND_VALS = Array.from({ length: 120 }, () => rand());

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "business" | "parametric" | "ai" | "market";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "business", label: "Business Models", icon: <Layers className="h-3.5 w-3.5" /> },
  { value: "parametric", label: "Parametric Insurance", icon: <Zap className="h-3.5 w-3.5" /> },
  { value: "ai", label: "AI & Data", icon: <Brain className="h-3.5 w-3.5" /> },
  { value: "market", label: "Market Dynamics", icon: <TrendingUp className="h-3.5 w-3.5" /> },
];

// ── Business Models data ──────────────────────────────────────────────────────
interface InsurtechCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
  fundingBn: number; // cumulative 2018-2024 in $B
  disruptionLevel: "low" | "medium" | "high" | "extreme";
  color: string;
}

const INSURTECH_CATEGORIES: InsurtechCategory[] = [
  {
    id: "parametric",
    name: "Parametric Insurance",
    description: "Pays out automatically when pre-defined triggers (weather, seismic, price indices) are met—no loss adjustment required.",
    examples: ["Arbol", "Etherisc", "FloodFlash", "Descartes"],
    fundingBn: 3.2,
    disruptionLevel: "extreme",
    color: "text-primary",
  },
  {
    id: "p2p",
    name: "Peer-to-Peer (P2P)",
    description: "Groups pool premiums; claims paid from shared pot. Surplus returned to members, aligning incentives against fraud.",
    examples: ["Lemonade", "Friendsurance", "Teambrella", "Besure"],
    fundingBn: 5.8,
    disruptionLevel: "high",
    color: "text-primary",
  },
  {
    id: "embedded",
    name: "Embedded Insurance",
    description: "Insurance sold at point of purchase within non-insurance products (e-commerce, travel, fintech apps).",
    examples: ["Cover Genius", "Boost", "Qover", "Bsurance"],
    fundingBn: 7.1,
    disruptionLevel: "high",
    color: "text-emerald-400",
  },
  {
    id: "mga",
    name: "MGA / Program Business",
    description: "Managing General Agents use tech to underwrite niche lines faster and cheaper than traditional carriers.",
    examples: ["Pie Insurance", "Coalition", "Cowbell", "Vouch"],
    fundingBn: 9.4,
    disruptionLevel: "medium",
    color: "text-amber-400",
  },
  {
    id: "fullstack",
    name: "Full-Stack Carrier",
    description: "Fully licensed carriers building on modern tech stacks—no legacy system constraints.",
    examples: ["Root", "Hippo", "Branch", "Kin"],
    fundingBn: 12.6,
    disruptionLevel: "extreme",
    color: "text-pink-400",
  },
  {
    id: "reinsurtech",
    name: "Reinsurtech",
    description: "Tech-driven reinsurance platforms enabling ILS, cat bond tokenisation, and algorithmic risk transfer.",
    examples: ["Nephila", "Stable", "Supercede", "Ledger Investing"],
    fundingBn: 4.1,
    disruptionLevel: "medium",
    color: "text-muted-foreground",
  },
];

// Funding bar chart data (2018–2024 global InsurTech funding $B)
const FUNDING_BY_YEAR: { year: number; funding: number }[] = [
  { year: 2018, funding: 4.2 },
  { year: 2019, funding: 6.4 },
  { year: 2020, funding: 7.1 },
  { year: 2021, funding: 15.8 },
  { year: 2022, funding: 8.3 },
  { year: 2023, funding: 4.9 },
  { year: 2024, funding: 5.7 },
];

const INCUMBENT_VS_CHALLENGER: {
  dimension: string;
  incumbent: string;
  challenger: string;
  winner: "incumbent" | "challenger" | "tie";
}[] = [
  { dimension: "Underwriting speed", incumbent: "Days–weeks", challenger: "Seconds (API)", winner: "challenger" },
  { dimension: "Data sources", incumbent: "Credit / claims history", challenger: "Telematics / IoT / satellite", winner: "challenger" },
  { dimension: "Claims settlement", incumbent: "Weeks (manual)", challenger: "Instant (parametric)", winner: "challenger" },
  { dimension: "Distribution cost", incumbent: "20–30% of premium", challenger: "5–12% (digital)", winner: "challenger" },
  { dimension: "Brand trust", incumbent: "High (decades)", challenger: "Low–medium (new)", winner: "incumbent" },
  { dimension: "Regulatory capital", incumbent: "Existing licenses", challenger: "Costly to obtain", winner: "incumbent" },
  { dimension: "Reinsurance access", incumbent: "Established treaties", challenger: "Constrained (costly)", winner: "incumbent" },
  { dimension: "Product breadth", incumbent: "Full suite", challenger: "Niche focus", winner: "tie" },
];

// ── Parametric data ───────────────────────────────────────────────────────────
interface WeatherTrigger {
  peril: string;
  parameter: string;
  trigger: string;
  payout: string;
  basisRisk: string;
}

const WEATHER_TRIGGERS: WeatherTrigger[] = [
  {
    peril: "Drought",
    parameter: "Rainfall (mm)",
    trigger: "< 50mm in 60 days",
    payout: "100% at 30mm, pro-rata 30–50mm",
    basisRisk: "Medium — rainfall gauge may differ from farm",
  },
  {
    peril: "Hurricane",
    parameter: "Wind speed (mph)",
    trigger: "> 74 mph at landfall",
    payout: "$1M per 10 mph above trigger",
    basisRisk: "Low — wind at station ≈ exposure",
  },
  {
    peril: "Heat wave",
    parameter: "Cooling Degree Days",
    trigger: "> 450 CDD in summer",
    payout: "Fixed $500K per 50 CDD above trigger",
    basisRisk: "Medium — CDD index vs actual energy demand",
  },
  {
    peril: "Frost",
    parameter: "Temperature (°C)",
    trigger: "< –2°C for 3 consecutive days",
    payout: "Tiered: 75% at –5°C, 100% at –8°C",
    basisRisk: "High — station temp vs microclimate",
  },
];

// Cat bond spread data (illustrative, via PRNG)
const CAT_BOND_DATA = Array.from({ length: 7 }, (_, i) => ({
  year: 2018 + i,
  spread: 3.2 + RAND_VALS[i + 10] * 4.5,
  issuance: 9 + RAND_VALS[i + 17] * 8,
}));

// ── AI & Data ─────────────────────────────────────────────────────────────────
interface MLInput {
  source: string;
  features: string;
  liftPct: number;
  category: "telematics" | "social" | "iot" | "claims";
}

const ML_INPUTS: MLInput[] = [
  { source: "Telematics", features: "Braking, acceleration, cornering, speed", liftPct: 34, category: "telematics" },
  { source: "IoT / Smart Home", features: "Smoke/leak sensors, smart locks, alarm uptime", liftPct: 22, category: "iot" },
  { source: "Claims History", features: "Frequency, severity, FNOL timing, fraud flags", liftPct: 18, category: "claims" },
  { source: "Social / Behavioral", features: "App usage, payment punctuality, lifestyle signals", liftPct: 12, category: "social" },
  { source: "Satellite / Aerial", features: "Roof condition, land use, flood plain proximity", liftPct: 28, category: "telematics" },
  { source: "Weather Feed", features: "Historical peril exposure, climate trend indices", liftPct: 16, category: "iot" },
];

// UBI pricing curve: miles driven bins
const UBI_MILES = [2000, 4000, 6000, 8000, 10000, 12000, 15000, 18000, 20000];
const UBI_PREMIUM = [580, 640, 720, 810, 920, 1040, 1220, 1410, 1540];
const UBI_TRADITIONAL = UBI_MILES.map(() => 1100);

// Fraud detection data
const FRAUD_METRICS = [
  { metric: "False positive rate", traditional: 12.4, ml: 4.1, unit: "%" },
  { metric: "Detection rate", traditional: 61, ml: 89, unit: "%" },
  { metric: "Avg investigation cost", traditional: 8400, ml: 2100, unit: "$" },
  { metric: "Annual fraud savings", traditional: 1.2, ml: 4.8, unit: "$B" },
];

// ── Market Dynamics data ──────────────────────────────────────────────────────
// Global InsurTech funding line (quarterly, 2020 Q1 – 2024 Q4)
const QUARTERLY_FUNDING = Array.from({ length: 20 }, (_, i) => {
  const base = i < 8 ? 1.8 + i * 0.45 : i < 12 ? 5.2 - (i - 8) * 0.62 : 2.4 + (i - 12) * 0.12;
  return { q: i, funding: Math.max(0.8, base + (RAND_VALS[i + 40] - 0.5) * 0.4) };
});

const COMBINED_RATIO_DATA: { company: string; ratio2021: number; ratio2023: number; type: "insurtech" | "incumbent" }[] = [
  { company: "Root", ratio2021: 142, ratio2023: 118, type: "insurtech" },
  { company: "Lemonade", ratio2021: 121, ratio2023: 102, type: "insurtech" },
  { company: "Hippo", ratio2021: 156, ratio2023: 128, type: "insurtech" },
  { company: "Branch", ratio2021: 138, ratio2023: 112, type: "insurtech" },
  { company: "Allstate", ratio2021: 99, ratio2023: 103, type: "incumbent" },
  { company: "Progressive", ratio2021: 91, ratio2023: 96, type: "incumbent" },
  { company: "GEICO", ratio2021: 98, ratio2023: 105, type: "incumbent" },
];

const MA_ACTIVITY: { year: number; acquirer: string; target: string; value: string; type: "acquisition" | "partnership" | "investment" }[] = [
  { year: 2021, acquirer: "Munich Re", target: "NextGate", value: "$400M", type: "acquisition" },
  { year: 2021, acquirer: "Allianz", target: "Simplesurance", value: "$150M", type: "acquisition" },
  { year: 2022, acquirer: "Zurich", target: "Cover Genius", value: "$200M", type: "investment" },
  { year: 2022, acquirer: "AXA", target: "Descartes Underwriting", value: "$120M", type: "investment" },
  { year: 2023, acquirer: "Liberty Mutual", target: "Openly", value: "$250M", type: "acquisition" },
  { year: 2024, acquirer: "Swiss Re", target: "iptiQ", value: "Internal spinout", type: "partnership" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVG helper components
// ─────────────────────────────────────────────────────────────────────────────

function FundingBarChart() {
  const maxFunding = Math.max(...FUNDING_BY_YEAR.map((d) => d.funding));
  const W = 560;
  const H = 160;
  const pad = { top: 16, right: 16, bottom: 28, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = chartW / FUNDING_BY_YEAR.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Y grid lines */}
      {[0, 5, 10, 15, 20].map((v) => {
        const y = pad.top + chartH - (v / maxFunding) * chartH;
        if (v > maxFunding) return null;
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y} stroke="#334155" strokeWidth={0.5} />
            <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#64748b">${v}B</text>
          </g>
        );
      })}
      {/* Bars */}
      {FUNDING_BY_YEAR.map((d, i) => {
        const barH = (d.funding / maxFunding) * chartH;
        const x = pad.left + i * barW + barW * 0.15;
        const y = pad.top + chartH - barH;
        const isHighest = d.year === 2021;
        return (
          <g key={d.year}>
            <rect
              x={x}
              y={y}
              width={barW * 0.7}
              height={barH}
              rx={2}
              fill={isHighest ? "#8b5cf6" : "#3b82f6"}
              opacity={0.85}
            />
            <text x={x + barW * 0.35} y={pad.top + chartH + 14} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {d.year}
            </text>
            <text x={x + barW * 0.35} y={y - 3} textAnchor="middle" fontSize={7} fill="#94a3b8">
              ${d.funding}B
            </text>
          </g>
        );
      })}
      {/* Axis */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
    </svg>
  );
}

function ValueChainSVG() {
  const nodes = [
    { label: "Product Design", x: 60, disrupted: true },
    { label: "Underwriting", x: 180, disrupted: true },
    { label: "Distribution", x: 300, disrupted: true },
    { label: "Policy Admin", x: 420, disrupted: false },
    { label: "Claims", x: 540, disrupted: true },
    { label: "Reinsurance", x: 660, disrupted: false },
  ];
  const W = 720;
  const H = 110;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Connector line */}
      <line x1={60} y1={50} x2={660} y2={50} stroke="#334155" strokeWidth={1.5} strokeDasharray="4 2" />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={50} r={18} fill={n.disrupted ? "#7c3aed" : "#1e293b"} stroke={n.disrupted ? "#8b5cf6" : "#475569"} strokeWidth={1.5} />
          {n.disrupted && (
            <circle cx={n.x} cy={50} r={22} fill="none" stroke="#8b5cf6" strokeWidth={0.8} opacity={0.5} />
          )}
          <text x={n.x} y={53} textAnchor="middle" fontSize={8} fill={n.disrupted ? "#c4b5fd" : "#64748b"} fontWeight="600">
            {n.label.split(" ").map((w, wi) => (
              <tspan key={wi} x={n.x} dy={wi === 0 ? -4 : 9}>{w}</tspan>
            ))}
          </text>
          <text x={n.x} y={82} textAnchor="middle" fontSize={7} fill={n.disrupted ? "#a78bfa" : "#475569"}>
            {n.disrupted ? "Disrupted" : "Legacy"}
          </text>
        </g>
      ))}
      {/* Legend */}
      <circle cx={20} cy={98} r={5} fill="#7c3aed" />
      <text x={30} y={101} fontSize={7} fill="#a78bfa">Disrupted by InsurTech</text>
      <circle cx={140} cy={98} r={5} fill="#1e293b" stroke="#475569" strokeWidth={1} />
      <text x={150} y={101} fontSize={7} fill="#64748b">Legacy stronghold</text>
    </svg>
  );
}

function ParametricFlowSVG() {
  const W = 660;
  const H = 120;
  const steps = [
    { label: "Trigger Event\nOccurs", x: 60, icon: "⚡" },
    { label: "Data Source\nVerifies Index", x: 200, icon: "📡" },
    { label: "Smart Contract\nEvaluates", x: 340, icon: "⚙️" },
    { label: "Automatic\nPayout", x: 480, icon: "💸" },
    { label: "No Loss\nAdjustment", x: 610, icon: "✓" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Arrows */}
      {steps.slice(0, -1).map((step, i) => (
        <g key={`arrow-${i}`}>
          <line
            x1={step.x + 32}
            y1={48}
            x2={steps[i + 1].x - 32}
            y2={48}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#arrowhead)"
          />
        </g>
      ))}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
        </marker>
      </defs>
      {/* Nodes */}
      {steps.map((step, i) => (
        <g key={step.label}>
          <rect
            x={step.x - 30}
            y={28}
            width={60}
            height={40}
            rx={6}
            fill={i === 3 ? "#065f46" : "#1e293b"}
            stroke={i === 3 ? "#10b981" : "#334155"}
            strokeWidth={1}
          />
          <text x={step.x} y={52} textAnchor="middle" fontSize={7} fill={i === 3 ? "#6ee7b7" : "#94a3b8"}>
            {step.label.split("\n").map((line, li) => (
              <tspan key={li} x={step.x} dy={li === 0 ? -7 : 9}>{line}</tspan>
            ))}
          </text>
          <text x={step.x} y={80} textAnchor="middle" fontSize={11}>
            {step.icon}
          </text>
          <text x={step.x} y={110} textAnchor="middle" fontSize={7} fill="#64748b">
            Step {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

function UBIPricingCurveSVG() {
  const W = 520;
  const H = 180;
  const pad = { top: 16, right: 24, bottom: 40, left: 52 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxMiles = 20000;
  const maxPremium = 1600;

  const toX = (miles: number) => pad.left + (miles / maxMiles) * chartW;
  const toY = (premium: number) => pad.top + chartH - (premium / maxPremium) * chartH;

  const ubiPath = UBI_MILES.map((m, i) => `${i === 0 ? "M" : "L"}${toX(m)},${toY(UBI_PREMIUM[i])}`).join(" ");
  const tradPath = UBI_MILES.map((m) => `L${toX(m)},${toY(UBI_TRADITIONAL[0])}`).join(" ");
  const tradPathFull = `M${toX(UBI_MILES[0])},${toY(UBI_TRADITIONAL[0])} ${tradPath}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {[400, 600, 800, 1000, 1200, 1400, 1600].map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y} stroke="#1e293b" strokeWidth={0.5} />
            <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={7} fill="#64748b">${v}</text>
          </g>
        );
      })}
      {/* X axis labels */}
      {[0, 5000, 10000, 15000, 20000].map((m) => (
        <text key={m} x={toX(m)} y={H - 8} textAnchor="middle" fontSize={7} fill="#64748b">
          {(m / 1000).toFixed(0)}k
        </text>
      ))}
      {/* Traditional line */}
      <path d={tradPathFull} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 2" />
      {/* UBI line */}
      <path d={ubiPath} fill="none" stroke="#10b981" strokeWidth={2} />
      {/* Area under UBI */}
      <path
        d={`${ubiPath} L${toX(20000)},${pad.top + chartH} L${toX(2000)},${pad.top + chartH} Z`}
        fill="#10b981"
        opacity={0.08}
      />
      {/* Savings annotation */}
      <line x1={toX(8000)} y1={toY(1100)} x2={toX(8000)} y2={toY(810)} stroke="#f59e0b" strokeWidth={1} strokeDasharray="2 2" />
      <text x={toX(8000) + 4} y={toY(960)} fontSize={7} fill="#f59e0b">$290 savings</text>
      {/* Labels */}
      <text x={pad.left + chartW - 4} y={toY(UBI_TRADITIONAL[0]) - 4} textAnchor="end" fontSize={7} fill="#94a3b8">Traditional flat rate</text>
      <text x={pad.left + chartW - 4} y={toY(UBI_PREMIUM[UBI_PREMIUM.length - 1]) + 10} textAnchor="end" fontSize={7} fill="#10b981">UBI (pay-per-mile)</text>
      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
      {/* Axis titles */}
      <text x={pad.left + chartW / 2} y={H - 1} textAnchor="middle" fontSize={7} fill="#64748b">Miles Driven / Year</text>
      <text x={10} y={pad.top + chartH / 2} textAnchor="middle" fontSize={7} fill="#64748b" transform={`rotate(-90, 10, ${pad.top + chartH / 2})`}>Annual Premium ($)</text>
    </svg>
  );
}

function MLAccuracySVG() {
  const categories = [
    { label: "Actuarial\n(Traditional)", accuracy: 68, color: "#64748b" },
    { label: "GLM\n(Basic ML)", accuracy: 76, color: "#3b82f6" },
    { label: "Gradient\nBoost", accuracy: 84, color: "#8b5cf6" },
    { label: "Deep Learning\n+ Telematics", accuracy: 91, color: "#10b981" },
  ];
  const W = 380;
  const H = 160;
  const pad = { top: 16, right: 16, bottom: 40, left: 16 };
  const chartH = H - pad.top - pad.bottom;
  const barW = (W - pad.left - pad.right) / categories.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[50, 60, 70, 80, 90, 100].map((v) => {
        const y = pad.top + chartH - ((v - 50) / 50) * chartH;
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#1e293b" strokeWidth={0.5} />
            <text x={pad.left} y={y - 2} fontSize={7} fill="#475569">{v}%</text>
          </g>
        );
      })}
      {categories.map((c, i) => {
        const barH = ((c.accuracy - 50) / 50) * chartH;
        const x = pad.left + i * barW + barW * 0.2;
        const y = pad.top + chartH - barH;
        return (
          <g key={c.label}>
            <rect x={x} y={y} width={barW * 0.6} height={barH} rx={2} fill={c.color} opacity={0.85} />
            <text x={x + barW * 0.3} y={pad.top + chartH + 12} textAnchor="middle" fontSize={6.5} fill="#94a3b8">
              {c.label.split("\n").map((line, li) => (
                <tspan key={li} x={x + barW * 0.3} dy={li === 0 ? 0 : 9}>{line}</tspan>
              ))}
            </text>
            <text x={x + barW * 0.3} y={y - 3} textAnchor="middle" fontSize={8} fill={c.color} fontWeight="700">
              {c.accuracy}%
            </text>
          </g>
        );
      })}
      <line x1={pad.left} y1={pad.top + chartH} x2={W - pad.right} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
    </svg>
  );
}

function QuarterlyFundingLineSVG() {
  const W = 560;
  const H = 160;
  const pad = { top: 16, right: 20, bottom: 28, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxF = 6;

  const toX = (q: number) => pad.left + (q / (QUARTERLY_FUNDING.length - 1)) * chartW;
  const toY = (f: number) => pad.top + chartH - (f / maxF) * chartH;

  const linePath = QUARTERLY_FUNDING.map((d, i) =>
    `${i === 0 ? "M" : "L"}${toX(d.q)},${toY(d.funding)}`
  ).join(" ");

  const areaPath =
    linePath +
    ` L${toX(QUARTERLY_FUNDING.length - 1)},${pad.top + chartH} L${toX(0)},${pad.top + chartH} Z`;

  const quarterLabels = ["Q1'20", "Q3'20", "Q1'21", "Q3'21", "Q1'22", "Q3'22", "Q1'23", "Q3'23", "Q1'24", "Q4'24"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 2, 4, 6].map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y} stroke="#1e293b" strokeWidth={0.5} />
            <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={7} fill="#64748b">${v}B</text>
          </g>
        );
      })}
      <path d={areaPath} fill="#3b82f6" opacity={0.1} />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {QUARTERLY_FUNDING.filter((_, i) => i % 2 === 0).map((d) => (
        <circle key={d.q} cx={toX(d.q)} cy={toY(d.funding)} r={2.5} fill="#3b82f6" />
      ))}
      {quarterLabels.map((label, i) => {
        const q = i * 2;
        if (q >= QUARTERLY_FUNDING.length) return null;
        return (
          <text key={label} x={toX(q)} y={H - 4} textAnchor="middle" fontSize={6.5} fill="#64748b">{label}</text>
        );
      })}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
      {/* Peak annotation */}
      <circle cx={toX(4)} cy={toY(QUARTERLY_FUNDING[4].funding)} r={4} fill="none" stroke="#f59e0b" strokeWidth={1} />
      <text x={toX(4) + 6} y={toY(QUARTERLY_FUNDING[4].funding) - 4} fontSize={7} fill="#f59e0b">Peak 2021</text>
    </svg>
  );
}

function CombinedRatioSVG() {
  const W = 480;
  const H = 180;
  const pad = { top: 16, right: 16, bottom: 56, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxR = 160;
  const minR = 85;

  const toX = (v: number) => pad.left + ((v - minR) / (maxR - minR)) * chartW;
  const rowH = chartH / COMBINED_RATIO_DATA.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Break-even line at 100 */}
      <line
        x1={toX(100)}
        y1={pad.top}
        x2={toX(100)}
        y2={pad.top + chartH}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <text x={toX(100)} y={pad.top - 4} textAnchor="middle" fontSize={7} fill="#f59e0b">Break-even (100)</text>

      {/* X axis labels */}
      {[90, 100, 110, 120, 130, 140, 150].map((v) => (
        <text key={v} x={toX(v)} y={pad.top + chartH + 12} textAnchor="middle" fontSize={6.5} fill="#64748b">{v}</text>
      ))}

      {/* Bars */}
      {COMBINED_RATIO_DATA.map((d, i) => {
        const y = pad.top + i * rowH + rowH * 0.1;
        const h = rowH * 0.8;
        const isInsurtech = d.type === "insurtech";
        return (
          <g key={d.company}>
            <text x={pad.left - 4} y={y + h / 2 + 3} textAnchor="end" fontSize={7.5} fill={isInsurtech ? "#a78bfa" : "#94a3b8"}>
              {d.company}
            </text>
            {/* 2021 bar (faded) */}
            <rect
              x={toX(Math.min(d.ratio2021, d.ratio2023))}
              y={y}
              width={Math.abs(toX(d.ratio2021) - toX(d.ratio2023))}
              height={h / 2 - 1}
              rx={1}
              fill={isInsurtech ? "#7c3aed" : "#1e40af"}
              opacity={0.4}
            />
            {/* 2023 bar */}
            <rect
              x={toX(minR)}
              y={y + h / 2}
              width={toX(d.ratio2023) - toX(minR)}
              height={h / 2 - 1}
              rx={1}
              fill={isInsurtech ? "#8b5cf6" : "#3b82f6"}
              opacity={0.85}
            />
            <text x={toX(d.ratio2023) + 2} y={y + h - 2} fontSize={6.5} fill={isInsurtech ? "#c4b5fd" : "#93c5fd"}>
              {d.ratio2023}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={pad.left} y={H - 22} width={8} height={6} rx={1} fill="#7c3aed" opacity={0.4} />
      <text x={pad.left + 11} y={H - 17} fontSize={7} fill="#64748b">2021 ratio (lighter)</text>
      <rect x={pad.left + 100} y={H - 22} width={8} height={6} rx={1} fill="#8b5cf6" opacity={0.85} />
      <text x={pad.left + 111} y={H - 17} fontSize={7} fill="#64748b">2023 ratio</text>

      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="#475569" strokeWidth={1} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab sections
// ─────────────────────────────────────────────────────────────────────────────

function BusinessModelsTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedCategory = INSURTECH_CATEGORIES.find((c) => c.id === selected);

  const disruptionBadge = (level: InsurtechCategory["disruptionLevel"]) => {
    const styles: Record<InsurtechCategory["disruptionLevel"], string> = {
      low: "bg-muted-foreground/20 text-muted-foreground",
      medium: "bg-amber-500/20 text-amber-400",
      high: "bg-primary/20 text-primary",
      extreme: "bg-primary/20 text-primary",
    };
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", styles[level])}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INSURTECH_CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelected(selected === cat.id ? null : cat.id)}
            className={cn(
              "text-left rounded-md border p-4 transition-colors",
              selected === cat.id
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card hover:border-border/80",
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={cn("text-sm font-semibold", cat.color)}>{cat.name}</span>
              {disruptionBadge(cat.disruptionLevel)}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{cat.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {cat.examples.map((ex) => (
                <span key={ex} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{ex}</span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(cat.fundingBn / 13) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-mono">${cat.fundingBn}B raised</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail panel for selected category */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            key={selectedCategory.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md border border-primary/20 bg-primary/5 p-4"
          >
            <h3 className={cn("text-sm font-semibold mb-1", selectedCategory.color)}>{selectedCategory.name} — Deep Dive</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{selectedCategory.description}</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategory.examples.map((ex) => (
                <span key={ex} className="rounded-full border border-primary/30 px-2.5 py-1 text-xs text-primary">{ex}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Funding chart */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">Global InsurTech Funding 2018–2024 ($B)</h3>
        <p className="text-xs text-muted-foreground mb-3">2021 ZIRP boom drove record $15.8B; normalization since</p>
        <FundingBarChart />
      </div>

      {/* Value chain disruption map */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">Insurance Value Chain — Disruption Map</h3>
        <p className="text-xs text-muted-foreground mb-3">Purple = actively disrupted by InsurTech entrants</p>
        <ValueChainSVG />
      </div>

      {/* Comparison table */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-3">Incumbent vs. Challenger Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1.5 pr-4 text-left text-muted-foreground font-medium">Dimension</th>
                <th className="py-1.5 pr-4 text-left text-muted-foreground font-medium">Incumbent</th>
                <th className="py-1.5 pr-4 text-left text-muted-foreground font-medium">Challenger</th>
                <th className="py-1.5 text-left text-muted-foreground font-medium">Edge</th>
              </tr>
            </thead>
            <tbody>
              {INCUMBENT_VS_CHALLENGER.map((row, i) => (
                <tr key={row.dimension} className={cn("border-b border-border/40", i % 2 === 0 ? "bg-muted/10" : "")}>
                  <td className="py-1.5 pr-4 font-medium text-foreground">{row.dimension}</td>
                  <td className={cn("py-1.5 pr-4", row.winner === "incumbent" ? "text-primary font-medium" : "text-muted-foreground")}>
                    {row.incumbent}
                  </td>
                  <td className={cn("py-1.5 pr-4", row.winner === "challenger" ? "text-emerald-400 font-medium" : "text-muted-foreground")}>
                    {row.challenger}
                  </td>
                  <td className="py-1.5">
                    {row.winner === "challenger" && (
                      <span className="text-[11px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 font-medium">Challenger</span>
                    )}
                    {row.winner === "incumbent" && (
                      <span className="text-[11px] rounded-full bg-primary/20 text-primary px-2 py-0.5 font-medium">Incumbent</span>
                    )}
                    {row.winner === "tie" && (
                      <span className="text-[11px] rounded-full bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 font-medium">Tie</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ParametricTab() {
  const [droughtSeverity, setDroughtSeverity] = useState(50);

  // Payout calculation based on drought severity (0–100 scale)
  // Trigger at 40, full payout at 80
  const computePayout = (severity: number): number => {
    if (severity < 40) return 0;
    if (severity >= 80) return 500000;
    return Math.round(((severity - 40) / 40) * 500000);
  };

  const payout = computePayout(droughtSeverity);
  const isTriggered = droughtSeverity >= 40;

  return (
    <div className="space-y-5">
      {/* How it works */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">How Parametric Insurance Works</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Payouts are based on a pre-agreed index or trigger (e.g., rainfall levels, wind speed, seismic magnitude)
          rather than actual losses. When the index crosses the trigger threshold, payment is made automatically.
          No claims adjuster. No loss verification. Settles in hours.
        </p>
        <ParametricFlowSVG />
      </div>

      {/* Weather trigger table */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-3">Weather Trigger Examples</h3>
        <div className="space-y-2">
          {WEATHER_TRIGGERS.map((wt) => (
            <div key={wt.peril} className="rounded-lg border border-border/60 bg-muted/10 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-medium text-foreground">{wt.peril}</span>
                <span className="text-xs text-muted-foreground">— {wt.parameter}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-muted-foreground">
                <div>
                  <span className="text-muted-foreground">Trigger: </span>
                  <span className="text-amber-300">{wt.trigger}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payout: </span>
                  <span className="text-emerald-400">{wt.payout}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Basis Risk: </span>
                  <span className="text-primary">{wt.basisRisk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basis risk explanation */}
      <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-medium text-amber-400 mb-1">Basis Risk — The Key Limitation</h3>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Basis risk occurs when the trigger index does not perfectly correlate with the insured's actual losses.
              Example: a wind station measures 73 mph (just below the 74 mph trigger) while a nearby farm suffers
              severe damage at 78 mph winds. The farmer suffers a loss but receives no payout. Parametric products
              must be carefully designed to minimize this gap using dense sensor networks and hyper-local indices.
            </p>
          </div>
        </div>
      </div>

      {/* Agricultural parametric simulator */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">Agricultural Parametric Simulator — Drought Coverage</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Coverage: $500,000. Trigger: Drought Severity Index &gt; 40. Full payout at index &gt; 80.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">Drought Severity Index</span>
              <span className="text-sm font-mono font-bold tabular-nums text-foreground">{droughtSeverity}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={droughtSeverity}
              onChange={(e) => setDroughtSeverity(Number(e.target.value))}
              className="w-full h-2 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>0 — No drought</span>
              <span className="text-amber-400">40 — Trigger threshold</span>
              <span className="text-red-400">100 — Extreme drought</span>
            </div>
          </div>

          {/* Payout meter */}
          <div className="rounded-lg bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">Automatic Payout</span>
              <span
                className={cn(
                  "text-[11px] rounded-full px-2 py-0.5 font-medium",
                  isTriggered ? "bg-emerald-500/20 text-emerald-400" : "bg-muted-foreground/20 text-muted-foreground",
                )}
              >
                {isTriggered ? "TRIGGERED" : "NOT TRIGGERED"}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                ${payout.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground mb-1">
                / $500,000 max
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                animate={{ width: `${(payout / 500000) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>
            {!isTriggered && droughtSeverity > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Trigger requires Drought Severity Index &ge; 40 (current: {droughtSeverity}). No payout until threshold crossed.
              </p>
            )}
            {isTriggered && (
              <p className="text-xs text-emerald-400 mt-2">
                Threshold exceeded. Settlement initiated automatically via smart contract. No claims process required.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cat bond connection */}
      <div className="rounded-md border border-border bg-primary/5 p-4">
        <div className="flex gap-2.5">
          <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-medium text-primary mb-1">Cat Bond Connection</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              Catastrophe bonds (cat bonds) are the capital markets cousin of parametric insurance. Insurers/reinsurers
              transfer extreme-tail risk to investors via ILS (Insurance-Linked Securities). Bonds pay above-market coupons;
              principal is at risk only if a parametric trigger (e.g., hurricane category 4+ landfall in Florida) is breached.
              2024 issuance: $17.7B — a record year as investors seek uncorrelated returns.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CAT_BOND_DATA.slice(-3).map((d) => (
                <div key={d.year} className="text-center">
                  <div className="text-sm font-medium font-mono text-primary">${d.issuance.toFixed(1)}B</div>
                  <div className="text-[11px] text-muted-foreground">issuance {d.year}</div>
                  <div className="text-xs text-primary font-mono">+{d.spread.toFixed(1)}% spread</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIDataTab() {
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const categoryColor: Record<MLInput["category"], string> = {
    telematics: "text-primary bg-primary/10 border-border",
    social: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    iot: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    claims: "text-primary bg-primary/10 border-border",
  };

  const categoryIcon: Record<MLInput["category"], React.ReactNode> = {
    telematics: <Activity className="h-3.5 w-3.5" />,
    social: <Globe className="h-3.5 w-3.5" />,
    iot: <Database className="h-3.5 w-3.5" />,
    claims: <Shield className="h-3.5 w-3.5" />,
  };

  return (
    <div className="space-y-5">
      {/* ML inputs grid */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">ML Underwriting Model Inputs</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Lift = incremental accuracy improvement over baseline actuarial model. Click a card to expand.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ML_INPUTS.map((inp) => (
            <motion.button
              key={inp.source}
              whileHover={{ scale: 1.01 }}
              onClick={() => setActiveInput(activeInput === inp.source ? null : inp.source)}
              className={cn(
                "text-left rounded-lg border p-3 transition-all",
                categoryColor[inp.category],
                activeInput === inp.source ? "ring-1 ring-inset ring-current" : "",
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {categoryIcon[inp.category]}
                <span className="text-[11px] font-medium">{inp.source}</span>
                <span className="ml-auto text-xs text-muted-foreground font-mono font-medium">+{inp.liftPct}% lift</span>
              </div>
              <div className="h-1 bg-current/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-current"
                  style={{ width: `${(inp.liftPct / 40) * 100}%`, opacity: 0.7 }}
                />
              </div>
              <AnimatePresence>
                {activeInput === inp.source && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-muted-foreground mt-2 leading-relaxed opacity-80 overflow-hidden"
                  >
                    {inp.features}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accuracy comparison */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">Underwriting Accuracy: ML vs. Traditional Actuarial</h3>
        <p className="text-xs text-muted-foreground mb-3">Gini coefficient on holdout test set (%)</p>
        <MLAccuracySVG />
        <p className="text-[11px] text-muted-foreground mt-2">
          Deep learning models with telematics achieve ~91% accuracy vs. 68% for traditional GLMs.
          Gap narrows on sparse data segments (new drivers, rare perils).
        </p>
      </div>

      {/* UBI pricing curve */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">Usage-Based Insurance (UBI) Pricing Curve</h3>
        <p className="text-xs text-muted-foreground mb-3">
          UBI (pay-per-mile) vs. traditional flat-rate auto premium — low-mileage drivers save significantly
        </p>
        <UBIPricingCurveSVG />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {[
            { label: "Low mileage (<5k mi)", saving: "Up to 47% savings", color: "text-emerald-400" },
            { label: "Average (10k mi)", saving: "~16% savings", color: "text-primary" },
            { label: "High mileage (15k mi)", saving: "11% premium", color: "text-amber-400" },
            { label: "Very high (>18k mi)", saving: "28% premium", color: "text-red-400" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/20 p-2.5 text-center">
              <div className={cn("text-xs text-muted-foreground font-medium", item.color)}>{item.saving}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fraud detection */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-3">Fraud Detection — ML vs. Traditional</h3>
        <div className="space-y-2">
          {FRAUD_METRICS.map((fm) => {
            const isBetter = fm.ml > fm.traditional;
            const mlWin = (fm.metric === "False positive rate") ? fm.ml < fm.traditional : fm.ml > fm.traditional;
            const maxVal = Math.max(fm.traditional, fm.ml);
            return (
              <div key={fm.metric} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                <span className="text-[11px] text-muted-foreground">{fm.metric}</span>
                <div className="flex items-center gap-2 min-w-[160px]">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-muted-foreground"
                      style={{ width: `${(fm.traditional / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-14 text-right">
                    {fm.unit === "$B" ? `$${fm.traditional}B` : fm.unit === "$" ? `$${fm.traditional.toLocaleString()}` : `${fm.traditional}${fm.unit}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-[160px]">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", mlWin ? "bg-emerald-500" : "bg-red-500")}
                      style={{ width: `${(fm.ml / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className={cn("text-xs font-mono font-medium w-14 text-right", mlWin ? "text-emerald-400" : "text-red-400")}>
                    {fm.unit === "$B" ? `$${fm.ml}B` : fm.unit === "$" ? `$${fm.ml.toLocaleString()}` : `${fm.ml}${fm.unit}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-5 rounded-full bg-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Traditional</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-muted-foreground">ML Model</span>
          </div>
        </div>
      </div>

      {/* Real-time pricing engine */}
      <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex gap-2.5">
          <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-medium text-emerald-400 mb-1">Real-Time Pricing Engine</h3>
            <p className="text-[11px] text-emerald-300/80 leading-relaxed">
              Modern InsurTech carriers use streaming ML pipelines that reprice risk continuously as new data arrives.
              Telematics transmit driving events every 30 seconds; IoT sensors push home risk signals hourly.
              Combined with real-time weather feeds and satellite imagery, carriers can reprice individual policies
              intraday. This creates a flywheel: better pricing → adverse selection advantage → lower loss ratios
              → more capital for product expansion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketDynamicsTab() {
  return (
    <div className="space-y-5">
      {/* Quarterly funding line chart */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">Global InsurTech Funding — Quarterly ($B)</h3>
        <p className="text-xs text-muted-foreground mb-3">2020 Q1 through 2024 Q4 — from boom to reset</p>
        <QuarterlyFundingLineSVG />
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "Peak quarter (Q2 2021)", value: "$5.4B", color: "text-primary" },
            { label: "2023 trough", value: "$1.1B/qtr", color: "text-red-400" },
            { label: "2024 recovery", value: "$1.4B/qtr", color: "text-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/20 p-2.5 text-center">
              <div className={cn("text-sm font-medium font-mono", item.color)}>{item.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Combined ratio */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-1">Combined Ratio Improvement 2021 → 2023</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Combined ratio &gt; 100 = underwriting loss. InsurTech carriers improving but still above break-even.
        </p>
        <CombinedRatioSVG />
        <div className="flex gap-2.5 mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            InsurTech carriers have improved rapidly (avg −22 pts) but remain above 100 in most cases.
            Traditional incumbents run closer to break-even due to decades of actuarial refinement.
            Path to profitability requires either scale (law of large numbers) or niche underwriting moats.
          </p>
        </div>
      </div>

      {/* M&A / partnership activity */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-3">Incumbent M&A & Partnership Activity</h3>
        <div className="space-y-2">
          {MA_ACTIVITY.map((deal) => (
            <div key={`${deal.acquirer}-${deal.target}`} className="flex items-center gap-3 rounded-lg bg-muted/10 border border-border/40 p-2.5">
              <span className="text-xs text-muted-foreground font-mono shrink-0">{deal.year}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-foreground">{deal.acquirer}</span>
                <span className="text-[11px] text-muted-foreground"> → </span>
                <span className="text-[11px] text-primary">{deal.target}</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 shrink-0">{deal.value}</span>
              <span className={cn(
                "text-[11px] rounded-full px-2 py-0.5 font-medium shrink-0",
                deal.type === "acquisition" ? "bg-primary/20 text-primary"
                  : deal.type === "investment" ? "bg-primary/20 text-primary"
                  : "bg-amber-500/20 text-amber-400",
              )}>
                {deal.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory sandbox */}
      <div className="rounded-md border border-border bg-primary/5 p-4">
        <div className="flex gap-2.5">
          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-medium text-primary mb-1">Regulatory Sandbox Participation</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              Regulators across 50+ jurisdictions have created innovation sandboxes allowing InsurTech companies to
              test new products without full compliance requirements. Key jurisdictions: UK FCA, Singapore MAS,
              UAE ADGM, Arizona, Hawaii, and EU DORA framework.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Active sandboxes", value: "54" },
                { label: "Companies enrolled", value: "890+" },
                { label: "Products tested", value: "2,100+" },
                { label: "Conversion to licensed", value: "61%" },
              ].map((item) => (
                <div key={item.label} className="rounded bg-primary/10 p-2 text-center">
                  <div className="text-sm font-medium font-mono text-primary">{item.value}</div>
                  <div className="text-[11px] text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profitability challenge & path to sustainability */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground font-medium mb-3">Profitability Challenge — Path to Sustainability</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide">Loss Ratio Struggles</h4>
            {[
              "Adverse selection: early tech adopters are often better risks; as scale grows, pool quality regresses",
              "Reinsurance cost: new carriers pay 40–60% more for reinsurance than incumbents with track records",
              "CAT exposure mispricing: first-loss property books often underestimate tail risk",
              "Leaky unit economics: growth marketing at $200–400 CAC vs. $900 LTV creates negative contribution margin",
            ].map((point, i) => (
              <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Paths to Sustainability</h4>
            {[
              "Embedded insurance: near-zero distribution cost when bundled into existing platforms",
              "Data flywheel: more policies → better ML → lower loss ratio → competitive pricing moat",
              "Specialty/niche underwriting: cyber, parametric, gig economy risks legacy carriers avoid",
              "Capital markets access: ILS/cat bond programs reduce reinsurance dependency at scale",
            ].map((point, i) => (
              <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key metrics summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Global InsurTech market", value: "$142B", sub: "2024 market size", icon: <DollarSign className="h-4 w-4" />, color: "text-primary" },
          { label: "Premium digitized", value: "18%", sub: "vs. 3% in 2018", icon: <BarChart2 className="h-4 w-4" />, color: "text-primary" },
          { label: "Avg combined ratio", value: "112", sub: "InsurTech 2024", icon: <Activity className="h-4 w-4" />, color: "text-amber-400" },
          { label: "Blockchain claims", value: "4min", sub: "avg settlement time", icon: <Zap className="h-4 w-4" />, color: "text-emerald-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-border bg-card p-4">
            <div className={cn("mb-2", item.color)}>{item.icon}</div>
            <div className={cn("text-xl font-medium font-mono tabular-nums", item.color)}>{item.value}</div>
            <div className="text-[11px] font-medium text-foreground mt-0.5">{item.label}</div>
            <div className="text-[11px] text-muted-foreground">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function InsurtechPage() {
  const [tab, setTab] = useState<Tab>("business");

  const tabContent = useMemo(() => {
    switch (tab) {
      case "business": return <BusinessModelsTab />;
      case "parametric": return <ParametricTab />;
      case "ai": return <AIDataTab />;
      case "market": return <MarketDynamicsTab />;
    }
  }, [tab]);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-medium tracking-tight">InsurTech</h1>
          <p className="text-xs text-muted-foreground">
            Parametric insurance, AI underwriting, usage-based pricing, and blockchain claims disrupting a $6T industry
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] rounded-full bg-primary/20 text-primary px-2 py-0.5 font-medium uppercase tracking-wide">
            Sector Analysis
          </span>
          <span className="text-[11px] rounded-full bg-primary/20 text-primary px-2 py-0.5 font-medium uppercase tracking-wide">
            Interactive
          </span>
        </div>
      </div>

      {/* Callout — Hero */}
      <div className="flex gap-2.5 rounded-lg border border-primary/20 bg-primary/5 border-l-4 border-l-primary p-6">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground/70 leading-relaxed">
          <span className="font-medium text-primary">What is InsurTech?</span>{" "}
          InsurTech (Insurance Technology) applies AI, IoT, parametric triggers, and digital distribution to redesign
          how risk is assessed, priced, and transferred. From pay-per-mile auto insurance to satellite-triggered
          drought payouts, InsurTech is compressing the time between trigger and claim settlement from weeks to minutes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-border overflow-x-auto whitespace-nowrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground font-medium border-b-2 transition-colors -mb-px shrink-0",
              tab === t.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tabContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
