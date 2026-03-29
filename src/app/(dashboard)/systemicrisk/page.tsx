"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Activity,
  Shield,
  BarChart3,
  GitBranch,
  Layers,
  TrendingDown,
  TrendingUp,
  Globe,
  Building2,
  Zap,
  Target,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  Scale,
  RefreshCw,
  ArrowRight,
  DollarSign,
  Banknote,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Seeded PRNG  seed = 914
// ---------------------------------------------------------------------------
let s = 914;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function rFloat(min: number, max: number) {
  return min + rand() * (max - min);
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

interface GsibRow {
  bank: string;
  country: string;
  bucket: number;
  surcharge: string;
  totalCapital: string;
  category: string;
}

const GSIBS: GsibRow[] = [
  { bank: "JPMorgan Chase", country: "US", bucket: 4, surcharge: "2.5%", totalCapital: "15.4%", category: "Bucket 4" },
  { bank: "Citigroup", country: "US", bucket: 3, surcharge: "2.0%", totalCapital: "15.8%", category: "Bucket 3" },
  { bank: "Bank of America", country: "US", bucket: 2, surcharge: "1.5%", totalCapital: "14.2%", category: "Bucket 2" },
  { bank: "Wells Fargo", country: "US", bucket: 1, surcharge: "1.0%", totalCapital: "13.8%", category: "Bucket 1" },
  { bank: "Goldman Sachs", country: "US", bucket: 2, surcharge: "1.5%", totalCapital: "14.9%", category: "Bucket 2" },
  { bank: "Morgan Stanley", country: "US", bucket: 1, surcharge: "1.0%", totalCapital: "16.1%", category: "Bucket 1" },
  { bank: "HSBC", country: "UK", bucket: 3, surcharge: "2.0%", totalCapital: "14.6%", category: "Bucket 3" },
  { bank: "BNP Paribas", country: "FR", bucket: 2, surcharge: "1.5%", totalCapital: "13.2%", category: "Bucket 2" },
  { bank: "Deutsche Bank", country: "DE", bucket: 1, surcharge: "1.0%", totalCapital: "13.5%", category: "Bucket 1" },
  { bank: "Barclays", country: "UK", bucket: 1, surcharge: "1.0%", totalCapital: "14.1%", category: "Bucket 1" },
  { bank: "UBS", country: "CH", bucket: 2, surcharge: "1.5%", totalCapital: "15.0%", category: "Bucket 2" },
  { bank: "Mitsubishi UFJ", country: "JP", bucket: 2, surcharge: "1.5%", totalCapital: "12.9%", category: "Bucket 2" },
];

interface MetricRow {
  name: string;
  symbol: string;
  description: string;
  formula: string;
  value: string;
  trend: "up" | "down" | "stable";
  riskLevel: "low" | "medium" | "high" | "critical";
}

const SRISK_METRICS: MetricRow[] = [
  {
    name: "CoVaR (ΔCoVaR)",
    symbol: "ΔCoVaR",
    description: "Change in financial system VaR conditional on an institution being in distress",
    formula: "CoVaRᵢ|ⱼ − CoVaRᵢ|median",
    value: "$142B",
    trend: "up",
    riskLevel: "high",
  },
  {
    name: "SRISK",
    symbol: "SRISK",
    description: "Expected capital shortfall of a firm conditional on a severe market decline",
    formula: "SRISK = k(Debt + Equity) − Equity × (1 − LRMES)",
    value: "$318B",
    trend: "up",
    riskLevel: "critical",
  },
  {
    name: "MES",
    symbol: "MES",
    description: "Expected equity loss when market portfolio drops by more than 2% in a day",
    formula: "MES = E[rᵢ | rm < threshold]",
    value: "−8.4%",
    trend: "up",
    riskLevel: "high",
  },
  {
    name: "Degree Centrality",
    symbol: "Cᴰ",
    description: "Number of direct counterparty connections normalized by network size",
    formula: "Cᴰ(v) = deg(v) / (n−1)",
    value: "0.72",
    trend: "stable",
    riskLevel: "medium",
  },
  {
    name: "Betweenness Centrality",
    symbol: "Cᴮ",
    description: "Fraction of shortest paths between node pairs that pass through a node",
    formula: "Cᴮ(v) = Σ σ(s,v,t)/σ(s,t)",
    value: "0.41",
    trend: "up",
    riskLevel: "high",
  },
  {
    name: "Credit-to-GDP Gap",
    symbol: "Δ(C/GDP)",
    description: "Deviation of credit-to-GDP ratio from long-run trend (BIS indicator)",
    formula: "Gap = (C/GDP)ₜ − Trend",
    value: "+7.3 pp",
    trend: "up",
    riskLevel: "high",
  },
];

interface MacroPruTool {
  name: string;
  acronym: string;
  type: string;
  targetRisk: string;
  status: string;
  description: string;
  currentValue: string;
  range: string;
}

const MACRO_PRU_TOOLS: MacroPruTool[] = [
  {
    name: "Countercyclical Capital Buffer",
    acronym: "CCyB",
    type: "Capital",
    targetRisk: "Credit cycle amplification",
    status: "Active",
    description: "Additional capital held during credit expansions, released in downturns to absorb losses and maintain lending.",
    currentValue: "1.0%",
    range: "0–2.5%",
  },
  {
    name: "Loan-to-Value Limit",
    acronym: "LTV",
    type: "Borrower",
    targetRisk: "Housing bubble / mortgage defaults",
    status: "Active",
    description: "Caps borrower loan as percentage of property value; limits mortgage credit growth in overheated housing markets.",
    currentValue: "80%",
    range: "65–90%",
  },
  {
    name: "Debt-to-Income Cap",
    acronym: "DTI",
    type: "Borrower",
    targetRisk: "Household over-leverage",
    status: "Active",
    description: "Limits total debt payments relative to borrower income, preventing excessive household leverage accumulation.",
    currentValue: "43%",
    range: "36–50%",
  },
  {
    name: "Liquidity Coverage Ratio",
    acronym: "LCR",
    type: "Liquidity",
    targetRisk: "Short-term funding stress",
    status: "Fully phased in",
    description: "Banks must hold enough high-quality liquid assets (HQLA) to survive 30-day stress scenario with net outflows.",
    currentValue: "≥100%",
    range: "≥100%",
  },
  {
    name: "Net Stable Funding Ratio",
    acronym: "NSFR",
    type: "Liquidity",
    targetRisk: "Maturity transformation risk",
    status: "Fully phased in",
    description: "Requires banks to fund long-term illiquid assets with stable funding sources over 1-year horizon.",
    currentValue: "≥100%",
    range: "≥100%",
  },
  {
    name: "Supplementary Leverage Ratio",
    acronym: "SLR",
    type: "Capital",
    targetRisk: "Excessive balance sheet growth",
    status: "Active",
    description: "Simple ratio of Tier 1 capital to total leverage exposure; backstop to risk-based capital requirements.",
    currentValue: "5%",
    range: "3–6%",
  },
];

// ---------------------------------------------------------------------------
// Generate CCyB timeline data using seeded PRNG
// ---------------------------------------------------------------------------
function generateCCyBTimeline() {
  const years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const phase = [0, 0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 0, 0, 0.5, 1.0, 1.0];
  return years.map((yr, i) => ({ year: yr, value: phase[i] }));
}

// Generate TED spread history
function generateTEDHistory() {
  const months = ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Jan", "Mar", "May", "Jul", "Sep", "Nov", "Jan", "Mar"];
  const baseValues = [0.15, 0.17, 0.18, 0.22, 0.25, 0.20, 0.18, 0.19, 0.21, 0.24, 0.20, 0.17, 0.16, 0.18];
  return months.map((m, i) => ({ month: m, value: baseValues[i] + rFloat(-0.02, 0.03) }));
}

const ccybData = generateCCyBTimeline();
const tedData = generateTEDHistory();

// FSOC heatmap data
interface HeatCell {
  category: string;
  subcategory: string;
  level: number; // 0-4: low, moderate, elevated, high, critical
  label: string;
}

const FSOC_HEATMAP: HeatCell[] = [
  { category: "Credit", subcategory: "Corporate", level: 3, label: "High" },
  { category: "Credit", subcategory: "Household", level: 2, label: "Elevated" },
  { category: "Credit", subcategory: "Sovereign", level: 2, label: "Elevated" },
  { category: "Leverage", subcategory: "Banks", level: 1, label: "Moderate" },
  { category: "Leverage", subcategory: "Non-banks", level: 3, label: "High" },
  { category: "Leverage", subcategory: "Households", level: 2, label: "Elevated" },
  { category: "Liquidity", subcategory: "Money Markets", level: 1, label: "Moderate" },
  { category: "Liquidity", subcategory: "Bond Funds", level: 2, label: "Elevated" },
  { category: "Liquidity", subcategory: "Repo Markets", level: 2, label: "Elevated" },
  { category: "Interconnectedness", subcategory: "Banks", level: 2, label: "Elevated" },
  { category: "Interconnectedness", subcategory: "CCPs", level: 1, label: "Moderate" },
  { category: "Interconnectedness", subcategory: "Cross-border", level: 3, label: "High" },
  { category: "Maturity Transform.", subcategory: "Banks", level: 1, label: "Moderate" },
  { category: "Maturity Transform.", subcategory: "MMFs", level: 2, label: "Elevated" },
  { category: "Maturity Transform.", subcategory: "Shadow Banks", level: 3, label: "High" },
];

// Early warning indicators
interface EWIRow {
  indicator: string;
  current: number;
  threshold: number;
  unit: string;
  status: "green" | "amber" | "red";
  description: string;
}

const EWI_DATA: EWIRow[] = [
  { indicator: "Credit-to-GDP Gap", current: 7.3, threshold: 10.0, unit: "pp", status: "amber", description: "BIS Basel gap; above 2pp warrants attention" },
  { indicator: "VIX", current: 18.4, threshold: 30.0, unit: "", status: "green", description: "S&P 500 implied 30-day volatility; stress > 30" },
  { indicator: "TED Spread", current: 0.19, threshold: 0.50, unit: "%", status: "green", description: "3-month LIBOR minus T-bill; credit/liquidity stress signal" },
  { indicator: "Overnight Index Spread", current: 0.12, threshold: 0.40, unit: "%", status: "green", description: "OIS spread; counterparty risk in interbank market" },
  { indicator: "Real Estate Price Growth", current: 6.8, threshold: 8.0, unit: "% YoY", status: "amber", description: "Residential prices; bubble risk above 8%" },
  { indicator: "High-Yield Spread", current: 3.90, threshold: 6.00, unit: "%", status: "green", description: "Corporate HY-Treasury spread; distress > 600bp" },
  { indicator: "Corporate Debt/GDP", current: 82.1, threshold: 90.0, unit: "%", status: "amber", description: "Non-financial corporate debt as % of GDP" },
  { indicator: "Bank Leverage Ratio", current: 9.2, threshold: 7.0, unit: "%", status: "green", description: "Tier 1 / Total Exposure; regulatory min 3%, D-SIB 5%" },
];

// 2008 crisis timeline events
interface CrisisEvent {
  date: string;
  event: string;
  severity: "moderate" | "severe" | "critical";
  xPct: number;
}

const CRISIS_2008: CrisisEvent[] = [
  { date: "Mar 08", event: "Bear Stearns rescued; Fed emergency lending", severity: "severe", xPct: 6 },
  { date: "Jul 08", event: "IndyMac bank failure; $32B assets seized", severity: "moderate", xPct: 22 },
  { date: "Sep 7", event: "Fannie Mae & Freddie Mac placed in conservatorship", severity: "critical", xPct: 38 },
  { date: "Sep 15", event: "Lehman Brothers files Chapter 11 bankruptcy", severity: "critical", xPct: 48 },
  { date: "Sep 16", event: "AIG $85B government bailout; Reserve Primary Fund breaks buck", severity: "critical", xPct: 55 },
  { date: "Sep 29", event: "TARP bill rejected by House; Dow drops 777 points", severity: "severe", xPct: 65 },
  { date: "Oct 3", event: "$700B TARP signed into law", severity: "moderate", xPct: 72 },
  { date: "Oct 08", event: "Global coordinated rate cuts by central banks", severity: "moderate", xPct: 82 },
  { date: "Nov 08", event: "Citigroup bailout; QE begins", severity: "moderate", xPct: 92 },
];

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function heatColor(level: number): string {
  const colors = ["#166534", "#15803d", "#b45309", "#b91c1c", "#7f1d1d"];
  return colors[Math.min(level, 4)];
}
function heatBg(level: number): string {
  const bgs = ["#052e16", "#14532d", "#451a03", "#450a0a", "#3b0f0f"];
  return bgs[Math.min(level, 4)];
}
function heatText(level: number): string {
  const texts = ["#86efac", "#4ade80", "#fcd34d", "#fca5a5", "#fca5a5"];
  return texts[Math.min(level, 4)];
}

function statusColor(s: string): string {
  if (s === "green") return "#4ade80";
  if (s === "amber") return "#fbbf24";
  return "#f87171";
}
function statusBg(s: string): string {
  if (s === "green") return "bg-green-950/50 border-green-800/50";
  if (s === "amber") return "bg-amber-950/50 border-amber-800/50";
  return "bg-red-950/50 border-red-800/50";
}

function bucketColor(bucket: number): string {
  const c = ["", "#4ade80", "#fbbf24", "#fb923c", "#f87171", "#f43f5e"];
  return c[bucket] ?? "#94a3b8";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// Network contagion SVG
function NetworkContagionSVG() {
  // Node positions (x,y) — static layout
  const nodes = [
    { id: "A", x: 200, y: 100, label: "Bank A", failed: true, size: 28 },
    { id: "B", x: 370, y: 80, label: "Bank B", failed: true, size: 22 },
    { id: "C", x: 500, y: 160, label: "Bank C", failed: false, size: 20 },
    { id: "D", x: 430, y: 260, label: "Insurer D", failed: false, size: 18 },
    { id: "E", x: 280, y: 230, label: "Bank E", failed: false, size: 24 },
    { id: "F", x: 130, y: 210, label: "MMF F", failed: false, size: 16 },
    { id: "G", x: 590, y: 260, label: "Hedge Fund G", failed: false, size: 15 },
    { id: "H", x: 100, y: 310, label: "Bank H", failed: false, size: 18 },
    { id: "I", x: 340, y: 340, label: "CCP I", failed: false, size: 20 },
  ];
  const edges = [
    ["A", "B"], ["A", "E"], ["A", "F"],
    ["B", "C"], ["B", "D"], ["B", "E"],
    ["C", "D"], ["C", "G"],
    ["D", "E"], ["D", "I"],
    ["E", "F"], ["E", "I"],
    ["F", "H"],
    ["G", "I"], ["H", "I"],
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg viewBox="0 0 700 420" className="w-full" style={{ maxHeight: 320 }}>
      <defs>
        <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#f87171" />
        </marker>
        <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#475569" />
        </marker>
        <radialGradient id="failGrad">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background label */}
      <text x="350" y="20" textAnchor="middle" fill="#64748b" fontSize="12">Financial Network — Failure Propagation</text>

      {/* Edges */}
      {edges.map(([a, b], i) => {
        const na = nodeMap[a];
        const nb = nodeMap[b];
        if (!na || !nb) return null;
        const failed = na.failed || nb.failed;
        return (
          <line
            key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={failed ? "#f87171" : "#334155"}
            strokeWidth={failed ? 2 : 1}
            strokeOpacity={failed ? 0.9 : 0.5}
            markerEnd={failed ? "url(#arrow-red)" : "url(#arrow-gray)"}
            strokeDasharray={failed ? "0" : "4 3"}
          />
        );
      })}

      {/* Failure halo */}
      {nodes.filter(n => n.failed).map(n => (
        <circle key={`halo-${n.id}`} cx={n.x} cy={n.y} r={n.size + 14} fill="url(#failGrad)" />
      ))}

      {/* Nodes */}
      {nodes.map(n => (
        <g key={n.id}>
          <circle
            cx={n.x} cy={n.y} r={n.size}
            fill={n.failed ? "#7f1d1d" : "#1e293b"}
            stroke={n.failed ? "#f87171" : "#3b82f6"}
            strokeWidth={n.failed ? 2.5 : 1.5}
          />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
            fill={n.failed ? "#fca5a5" : "#93c5fd"} fontSize="10" fontWeight="bold">
            {n.id}
          </text>
          <text x={n.x} y={n.y + n.size + 12} textAnchor="middle"
            fill={n.failed ? "#fca5a5" : "#64748b"} fontSize="9">
            {n.label}
          </text>
          {n.failed && (
            <text x={n.x} y={n.y - n.size - 6} textAnchor="middle"
              fill="#f87171" fontSize="10" fontWeight="bold">FAILED</text>
          )}
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(20,370)">
        <circle cx={8} cy={8} r={7} fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
        <text x={20} y={12} fill="#94a3b8" fontSize="10">Failed institution</text>
        <circle cx={120} cy={8} r={7} fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
        <text x={132} y={12} fill="#94a3b8" fontSize="10">Solvent institution</text>
        <line x1={240} y1={8} x2={268} y2={8} stroke="#f87171" strokeWidth="2" />
        <text x={274} y={12} fill="#94a3b8" fontSize="10">Contagion channel</text>
      </g>
    </svg>
  );
}

// Crisis 2008 timeline SVG
function Crisis2008SVG() {
  const W = 680;
  const lineY = 90;
  const severityY = { moderate: 140, severe: 50, critical: 30 };
  const severityColor = { moderate: "#fbbf24", severe: "#fb923c", critical: "#f87171" };

  return (
    <svg viewBox={`0 0 ${W} 220`} className="w-full" style={{ maxHeight: 220 }}>
      <text x={W / 2} y={16} textAnchor="middle" fill="#64748b" fontSize="12">2008 Financial Crisis Timeline</text>
      {/* Baseline */}
      <line x1={30} y1={lineY} x2={W - 20} y2={lineY} stroke="#334155" strokeWidth="1.5" />
      {/* Arrow */}
      <polygon points={`${W - 14},${lineY - 5} ${W - 14},${lineY + 5} ${W - 4},${lineY}`} fill="#334155" />
      <text x={W - 8} y={lineY + 14} fill="#475569" fontSize="9">Time →</text>

      {CRISIS_2008.map((evt, i) => {
        const x = 30 + (evt.xPct / 100) * (W - 50);
        const isAbove = i % 2 === 0;
        const textY = isAbove ? lineY - 36 : lineY + 50;
        const dotY = lineY;
        const lineEnd = isAbove ? lineY - 8 : lineY + 8;
        const col = severityColor[evt.severity];

        return (
          <g key={i}>
            <line x1={x} y1={dotY} x2={x} y2={lineEnd} stroke={col} strokeWidth="1" strokeDasharray="3 2" />
            <circle cx={x} cy={dotY} r={5} fill={col} opacity="0.9" />
            <text x={x} y={isAbove ? textY : textY + 14} textAnchor="middle" fill={col} fontSize="8.5" fontWeight="bold">
              {evt.date}
            </text>
            <text x={x} y={isAbove ? textY + 12 : textY + 26} textAnchor="middle" fill="#94a3b8" fontSize="7.5"
              style={{ maxWidth: 80 }}>
              {evt.event.length > 32 ? evt.event.slice(0, 32) + "…" : evt.event}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// CCyB timeline SVG
function CCyBTimelineSVG() {
  const data = ccybData;
  const W = 640;
  const H = 160;
  const pad = { left: 46, right: 20, top: 16, bottom: 36 };
  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const yScale = (v: number) => H - pad.bottom - (v / 2.5) * (H - pad.top - pad.bottom);

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(d.value).toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${xScale(data.length - 1).toFixed(1)},${(H - pad.bottom).toFixed(1)} L${xScale(0).toFixed(1)},${(H - pad.bottom).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <defs>
        <linearGradient id="ccybGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <text x={W / 2} y={12} textAnchor="middle" fill="#64748b" fontSize="11">CCyB Rate Over Time (%)</text>

      {/* Grid lines */}
      {[0, 0.5, 1.0, 1.5, 2.0, 2.5].map(v => (
        <g key={v}>
          <line x1={pad.left} y1={yScale(v)} x2={W - pad.right} y2={yScale(v)} stroke="#1e293b" strokeWidth="1" />
          <text x={pad.left - 6} y={yScale(v) + 4} textAnchor="end" fill="#475569" fontSize="9">{v.toFixed(1)}</text>
        </g>
      ))}

      {/* Area */}
      <path d={areaD} fill="url(#ccybGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />

      {/* COVID drop annotation */}
      <line x1={xScale(9)} y1={yScale(0)} x2={xScale(9)} y2={yScale(0) - 28} stroke="#f87171" strokeWidth="1" strokeDasharray="3 2" />
      <text x={xScale(9)} y={yScale(0) - 32} textAnchor="middle" fill="#f87171" fontSize="9">COVID release</text>

      {/* X labels */}
      {data.map((d, i) => (
        i % 2 === 0 ? (
          <text key={i} x={xScale(i)} y={H - pad.bottom + 14} textAnchor="middle" fill="#475569" fontSize="9">{d.year}</text>
        ) : null
      ))}

      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#334155" strokeWidth="1" />
      <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#334155" strokeWidth="1" />
    </svg>
  );
}

// Shadow banking growth SVG
function ShadowBankingGrowthSVG() {
  const years = [2000, 2003, 2006, 2008, 2010, 2013, 2016, 2019, 2022, 2024];
  const traditional = [28, 32, 38, 45, 40, 42, 45, 47, 52, 55]; // $ trillion
  const shadow = [15, 22, 35, 42, 38, 44, 52, 58, 65, 72];
  const W = 560;
  const H = 160;
  const pad = { left: 46, right: 20, top: 20, bottom: 36 };
  const maxY = 80;
  const xS = (i: number) => pad.left + (i / (years.length - 1)) * (W - pad.left - pad.right);
  const yS = (v: number) => H - pad.bottom - (v / maxY) * (H - pad.top - pad.bottom);

  const tradPath = traditional.map((v, i) => `${i === 0 ? "M" : "L"}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(" ");
  const shadPath = shadow.map((v, i) => `${i === 0 ? "M" : "L"}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <text x={W / 2} y={14} textAnchor="middle" fill="#64748b" fontSize="11">Traditional vs Shadow Banking Assets ($T)</text>

      {[20, 40, 60, 80].map(v => (
        <g key={v}>
          <line x1={pad.left} y1={yS(v)} x2={W - pad.right} y2={yS(v)} stroke="#1e293b" strokeWidth="1" />
          <text x={pad.left - 6} y={yS(v) + 4} textAnchor="end" fill="#475569" fontSize="9">${v}T</text>
        </g>
      ))}

      <path d={tradPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d={shadPath} fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="5 3" />

      {years.map((yr, i) => (
        i % 2 === 0 ? (
          <text key={i} x={xS(i)} y={H - pad.bottom + 14} textAnchor="middle" fill="#475569" fontSize="9">{yr}</text>
        ) : null
      ))}

      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#334155" strokeWidth="1" />
      <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#334155" strokeWidth="1" />

      <g transform={`translate(${W - 140}, 24)`}>
        <line x1={0} y1={6} x2={20} y2={6} stroke="#3b82f6" strokeWidth="2" />
        <text x={24} y={10} fill="#94a3b8" fontSize="9">Traditional banks</text>
        <line x1={0} y1={22} x2={20} y2={22} stroke="#fb923c" strokeWidth="2" strokeDasharray="5 3" />
        <text x={24} y={26} fill="#94a3b8" fontSize="9">Shadow banking</text>
      </g>
    </svg>
  );
}

// Bail-in vs Bailout diagram SVG
function BailInVsBailoutSVG() {
  const W = 600;
  const H = 200;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <text x={W / 2} y={16} textAnchor="middle" fill="#64748b" fontSize="12">Bail-In vs Bail-Out Comparison</text>

      {/* Bail-Out box */}
      <rect x={20} y={30} width={260} height={150} rx={8} fill="#0f172a" stroke="#f87171" strokeWidth="1.5" />
      <text x={150} y={52} textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="bold">BAIL-OUT (Pre-2010)</text>

      {/* Bail-out flow */}
      <rect x={60} y={64} width={140} height={24} rx={4} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
      <text x={130} y={80} textAnchor="middle" fill="#94a3b8" fontSize="10">Taxpayer / Government</text>
      <line x1={130} y1={88} x2={130} y2={106} stroke="#f87171" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
      <text x={150} y={100} fill="#f87171" fontSize="9">$$$</text>
      <rect x={60} y={108} width={140} height={24} rx={4} fill="#1e293b" stroke="#f87171" strokeWidth="1" />
      <text x={130} y={124} textAnchor="middle" fill="#fca5a5" fontSize="10">Failed Bank (Rescued)</text>
      <text x={130} y={162} textAnchor="middle" fill="#64748b" fontSize="9">Shareholders &amp; bondholders</text>
      <text x={130} y={174} textAnchor="middle" fill="#64748b" fontSize="9">not penalized; moral hazard</text>

      {/* Bail-In box */}
      <rect x={320} y={30} width={260} height={150} rx={8} fill="#0f172a" stroke="#4ade80" strokeWidth="1.5" />
      <text x={450} y={52} textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="bold">BAIL-IN (Post-Basel III)</text>

      {/* Bail-in flow */}
      <rect x={360} y={64} width={160} height={24} rx={4} fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
      <text x={440} y={80} textAnchor="middle" fill="#94a3b8" fontSize="10">Senior/Sub Bondholders</text>
      <line x1={440} y1={88} x2={440} y2={106} stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-bail)" />
      <text x={456} y={100} fill="#4ade80" fontSize="9">Converted</text>
      <rect x={360} y={108} width={160} height={24} rx={4} fill="#1e293b" stroke="#4ade80" strokeWidth="1" />
      <text x={440} y={124} textAnchor="middle" fill="#86efac" fontSize="10">Bank Recapitalized</text>
      <text x={440} y={162} textAnchor="middle" fill="#64748b" fontSize="9">Shareholders wiped; creditors</text>
      <text x={440} y={174} textAnchor="middle" fill="#64748b" fontSize="9">take losses; taxpayer protected</text>

      <defs>
        <marker id="arrow-bail" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#4ade80" />
        </marker>
      </defs>
    </svg>
  );
}

// FSOC Heatmap
function FSOCHeatmap() {
  const categories = ["Credit", "Leverage", "Liquidity", "Interconnectedness", "Maturity Transform."];
  const subcategories = ["Banks / Corporate", "Non-banks / Household", "Sovereign / Cross-border"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground p-2 w-32">Category</th>
            {["Sub-sector A", "Sub-sector B", "Sub-sector C"].map((s, i) => (
              <th key={i} className="text-center text-muted-foreground p-2 font-normal">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, ci) => {
            const cells = FSOC_HEATMAP.filter(c => c.category === cat);
            return (
              <tr key={ci} className="border-t border-border">
                <td className="p-2 text-muted-foreground font-medium text-xs">{cat}</td>
                {cells.map((cell, j) => (
                  <td key={j} className="p-1">
                    <div
                      className="rounded text-center py-1.5 px-2 text-xs font-semibold"
                      style={{ backgroundColor: heatBg(cell.level), color: heatText(cell.level), border: `1px solid ${heatColor(cell.level)}` }}
                    >
                      {cell.label}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex gap-3 mt-3 flex-wrap">
        {["Low", "Moderate", "Elevated", "High", "Critical"].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: heatColor(i) }} />
            <span className="text-xs" style={{ color: heatText(i) }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// EWI gauge bar
function EWIBar({ row }: { row: EWIRow }) {
  const pct = Math.min(100, (row.current / (row.threshold * 1.3)) * 100);
  const threshPct = (1 / 1.3) * 100;
  const col = statusColor(row.status);

  return (
    <div className={`rounded-lg border p-3 ${statusBg(row.status)}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-foreground">{row.indicator}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: col }}>
            {row.current}{row.unit}
          </span>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden mb-1">
        <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: col, opacity: 0.8 }} />
        <div className="absolute top-0 h-full w-0.5 bg-white/40" style={{ left: `${threshPct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{row.description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expandable info card
// ---------------------------------------------------------------------------
function InfoCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: React.ComponentType<{ className?: string }> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card/60">
      <button
        className="w-full flex items-center justify-between p-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function ContagionTab() {
  return (
    <div className="space-y-6">
      {/* Network SVG */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-red-400" />
            Interbank Network — Contagion Propagation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkContagionSVG />
          <p className="text-xs text-muted-foreground mt-2">
            When Bank A fails, losses propagate through bilateral exposures. Red edges show triggered contagion channels.
            Highly connected nodes (high degree/betweenness centrality) amplify systemic stress.
          </p>
        </CardContent>
      </Card>

      {/* Mechanisms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Bank Run Dynamics" icon={Zap}>
          <p>A bank run is a self-fulfilling prophecy: rational depositors withdraw funds when they fear others will do the same, making the bank insolvent regardless of underlying solvency.</p>
          <ul className="list-disc ml-4 space-y-1 mt-1">
            <li>Diamond-Dybvig model: multiple equilibria exist (stable vs. run equilibrium)</li>
            <li>Information cascade: early withdrawers signal distress to others</li>
            <li>Deposit insurance breaks the bad equilibrium but creates moral hazard</li>
            <li>2023: SVB failed in 48 hours as social media accelerated coordination</li>
          </ul>
        </InfoCard>

        <InfoCard title="Fire Sale Externalities" icon={TrendingDown}>
          <p>When distressed institutions sell illiquid assets, prices fall, impairing balance sheets of all holders — even solvent ones.</p>
          <ul className="list-disc ml-4 space-y-1 mt-1">
            <li>Asset price spiral: forced sales → price declines → more mark-to-market losses</li>
            <li>Negative externality: private costs of selling understate social costs</li>
            <li>Amplified in concentrated markets with few buyers (CDO tranches in 2008)</li>
            <li>Policy response: Fed asset purchase programs (TALF, PDCF) to backstop prices</li>
          </ul>
        </InfoCard>

        <InfoCard title="Liquidity Spiral Mechanism" icon={RefreshCw}>
          <p>A self-reinforcing cycle where funding stress forces deleveraging, which reduces market liquidity, raising margins and triggering further deleveraging.</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {["Losses", "→ Margin Calls", "→ Asset Sales", "→ Price Drops", "→ More Losses"].map((step, i) => (
              <span key={i} className="bg-red-950/50 text-red-300 border border-red-800/50 rounded px-2 py-1">{step}</span>
            ))}
          </div>
          <p className="mt-2">Brunnermeier & Pedersen (2009): trader funding liquidity and market liquidity are interconnected — sudden drying up of one collapses the other.</p>
        </InfoCard>

        <InfoCard title="Cross-Border Contagion Channels" icon={Globe}>
          <ul className="list-disc ml-4 space-y-1">
            <li><strong className="text-muted-foreground">Trade channel:</strong> recession in one economy reduces imports from partners</li>
            <li><strong className="text-muted-foreground">Financial channel:</strong> cross-border bank exposures transmit credit losses directly</li>
            <li><strong className="text-muted-foreground">Confidence channel:</strong> investors re-assess risk in correlated markets (flight to quality)</li>
            <li><strong className="text-muted-foreground">Currency channel:</strong> devaluations create balance-sheet crises for dollar borrowers</li>
            <li>2008: European banks held $1T+ in US structured products; immediate global transmission</li>
          </ul>
        </InfoCard>
      </div>

      {/* 2008 Crisis Timeline */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            2008 Financial Crisis — Key Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Crisis2008SVG />
          <div className="flex gap-4 mt-3 flex-wrap text-xs">
            {(["moderate", "severe", "critical"] as const).map(s => {
              const c = s === "moderate" ? "#fbbf24" : s === "severe" ? "#fb923c" : "#f87171";
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-muted-foreground capitalize">{s}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-border">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-primary">Key Insight:</strong> Contagion is non-linear. Small shocks can cascade into systemic crises when
              institutions are highly interconnected, leverage is elevated, and liquidity buffers are thin.
              The 2008 crisis spread from $500B in subprime losses to a $20T global wealth destruction event.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GSIBTab() {
  const [selectedBank, setSelectedBank] = useState<GsibRow | null>(null);
  const bucketCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    GSIBS.forEach(b => { counts[b.bucket] = (counts[b.bucket] ?? 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* G-SIB Identification Methodology */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            G-SIB Identification: 5 Indicator Categories (Basel Committee)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { name: "Size", weight: "20%", desc: "Total exposures as in the leverage ratio", icon: "📊" },
              { name: "Interconnectedness", weight: "20%", desc: "Intra-financial system assets, liabilities, WPI securities outstanding", icon: "🔗" },
              { name: "Substitutability", weight: "20%", desc: "Assets under custody, payments activity, underwriting activity", icon: "🔄" },
              { name: "Global Activity", weight: "20%", desc: "Cross-jurisdictional claims and liabilities", icon: "🌐" },
              { name: "Complexity", weight: "20%", desc: "OTC derivatives notional, Level 3 assets, trading/AFS securities", icon: "⚙️" },
            ].map((cat, i) => (
              <div key={i} className="rounded-lg bg-muted/50 border border-border p-3 text-center">
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-xs font-bold text-foreground mb-0.5">{cat.name}</div>
                <Badge variant="outline" className="text-xs border-border text-primary mb-1">{cat.weight}</Badge>
                <p className="text-xs text-muted-foreground">{cat.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Each bank receives a score for each category; scores are averaged to produce an overall systemic importance score.
            Banks above a threshold are designated G-SIBs and must hold additional Tier 1 capital (surcharges).
          </p>
        </CardContent>
      </Card>

      {/* G-SIB List */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              2024 G-SIB List — Capital Surcharges
            </CardTitle>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(b => (
                <div key={b} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bucketColor(b) }} />
                  <span className="text-xs text-muted-foreground">B{b}({bucketCounts[b] ?? 0})</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Bank", "Country", "Bucket", "Surcharge", "Total Capital", ""].map((h, i) => (
                    <th key={i} className="text-left p-2 text-muted-foreground font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GSIBS.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedBank(b => b?.bank === row.bank ? null : row)}
                  >
                    <td className="p-2 font-medium text-foreground">{row.bank}</td>
                    <td className="p-2 text-muted-foreground">{row.country}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs" style={{ borderColor: bucketColor(row.bucket), color: bucketColor(row.bucket) }}>
                        Bucket {row.bucket}
                      </Badge>
                    </td>
                    <td className="p-2 font-bold" style={{ color: bucketColor(row.bucket) }}>{row.surcharge}</td>
                    <td className="p-2 text-muted-foreground">{row.totalCapital}</td>
                    <td className="p-2 text-muted-foreground">
                      <ArrowRight className="w-3 h-3" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedBank && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-lg bg-muted/50 border border-border p-3 text-sm text-muted-foreground"
            >
              <strong className="text-foreground">{selectedBank.bank}</strong> — {selectedBank.country} |&nbsp;
              G-SIB surcharge <strong style={{ color: bucketColor(selectedBank.bucket) }}>{selectedBank.surcharge}</strong> on top of minimum 8% CET1 requirement.
              Total minimum capital: <strong className="text-primary">{selectedBank.totalCapital}</strong> (CET1 + surcharge + conservation buffer).
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* TBTF Subsidy + Bail-In/Out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              TBTF Funding Subsidy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              G-SIBs benefit from an implicit government guarantee: creditors lend at lower rates because they expect a bailout.
            </p>
            {[
              { label: "Estimated annual subsidy (US G-SIBs)", value: "$70–90B", color: "#f87171" },
              { label: "Funding cost advantage vs peers", value: "20–80 bps", color: "#fb923c" },
              { label: "Post-Dodd-Frank reduction", value: "~40%", color: "#4ade80" },
              { label: "IMF global estimate (2014)", value: "$590B/yr", color: "#f87171" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs border-b border-border pb-2">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Living wills (resolution plans) under Dodd-Frank Title I require G-SIBs to demonstrate they can fail without taxpayer assistance.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-green-400" />
              Bail-In vs Bail-Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BailInVsBailoutSVG />
            <p className="text-xs text-muted-foreground mt-2">
              Dodd-Frank Title II (Orderly Liquidation Authority) enables FDIC to resolve failing G-SIBs via bail-in:
              equity wiped, long-term debt converted to equity, no taxpayer funds used.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricsTab() {
  const [activeMetric, setActiveMetric] = useState<MetricRow | null>(null);

  const riskColors = { low: "#4ade80", medium: "#fbbf24", high: "#fb923c", critical: "#f87171" };

  return (
    <div className="space-y-6">
      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SRISK_METRICS.map((m, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01 }}
            className="rounded-lg border border-border bg-card/60 p-4 cursor-pointer"
            style={{ borderColor: activeMetric?.symbol === m.symbol ? riskColors[m.riskLevel] : undefined }}
            onClick={() => setActiveMetric(am => am?.symbol === m.symbol ? null : m)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs text-muted-foreground">{m.name}</div>
                <div className="text-lg font-bold text-foreground font-mono">{m.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold" style={{ color: riskColors[m.riskLevel] }}>{m.value}</div>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  {m.trend === "up" ? <TrendingUp className="w-3 h-3 text-red-400" /> : m.trend === "down" ? <TrendingDown className="w-3 h-3 text-green-400" /> : <Activity className="w-3 h-3 text-muted-foreground" />}
                  <Badge variant="outline" className="text-xs capitalize" style={{ borderColor: riskColors[m.riskLevel], color: riskColors[m.riskLevel] }}>
                    {m.riskLevel}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{m.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {activeMetric && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-muted/30 border-border">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">{activeMetric.name} — Technical Definition</div>
                    <div className="bg-card/60 border border-border rounded px-3 py-2 font-mono text-xs text-green-300">
                      {activeMetric.formula}
                    </div>
                    <p className="text-sm text-muted-foreground">{activeMetric.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FSOC Dashboard */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            FSOC Systemic Risk Monitoring Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FSOCHeatmap />
          <p className="text-xs text-muted-foreground mt-3">
            FSOC (Financial Stability Oversight Council) monitors 5 vulnerability categories across banking, non-banking, and cross-border sectors.
            Current stress elevated in non-bank leverage and corporate credit.
          </p>
        </CardContent>
      </Card>

      {/* Early Warning Indicators */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Early Warning Indicators Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EWI_DATA.map((row, i) => (
              <EWIBar key={i} row={row} />
            ))}
          </div>
          <div className="flex gap-3 mt-4 text-xs flex-wrap">
            {["green", "amber", "red"].map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor(s) }} />
                <span className="text-muted-foreground capitalize">{s === "green" ? "Normal" : s === "amber" ? "Elevated" : "Stress"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-950/20 border-amber-900/40">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-amber-400">Network centrality matters:</strong> A node with high eigenvector centrality is connected to other highly connected nodes.
              In 2008, AIG's centrality was not reflected in simple size metrics — it was the CDS counterparty to virtually every major dealer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MacroPruTab() {
  const [selectedTool, setSelectedTool] = useState<MacroPruTool | null>(null);

  const typeColor = (type: string): string => {
    const m: Record<string, string> = { Capital: "#60a5fa", Borrower: "#34d399", Liquidity: "#f59e0b" };
    return m[type] ?? "#94a3b8";
  };

  return (
    <div className="space-y-6">
      {/* Tool list */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Macroprudential Toolkit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MACRO_PRU_TOOLS.map((tool, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 2 }}
                className="rounded-lg border border-border bg-muted/30 p-3 cursor-pointer hover:border-border transition-colors"
                style={{ borderColor: selectedTool?.acronym === tool.acronym ? typeColor(tool.type) : undefined }}
                onClick={() => setSelectedTool(t => t?.acronym === tool.acronym ? null : tool)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="text-xs font-bold rounded px-2 py-1 font-mono"
                      style={{ backgroundColor: typeColor(tool.type) + "20", color: typeColor(tool.type), border: `1px solid ${typeColor(tool.type)}40` }}
                    >
                      {tool.acronym}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{tool.name}</div>
                      <div className="text-xs text-muted-foreground">Targets: {tool.targetRisk}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">{tool.currentValue}</div>
                    <div className="text-xs text-muted-foreground">Range: {tool.range}</div>
                    <Badge variant="outline" className="text-xs mt-1 border-green-700 text-green-400">{tool.status}</Badge>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedTool?.acronym === tool.acronym && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-muted-foreground mt-2 border-t border-border pt-2"
                    >
                      {tool.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CCyB Timeline */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Countercyclical Capital Buffer (CCyB) — Build-up and Release
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CCyBTimelineSVG />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { phase: "Build-up Phase (2013–2019)", color: "#3b82f6", desc: "Regulators raise CCyB as credit gap widens and asset prices rise" },
              { phase: "COVID Release (2020)", color: "#f87171", desc: "CCyB immediately released to 0% to maintain bank lending capacity" },
              { phase: "Re-tightening (2022+)", color: "#fbbf24", desc: "Gradual re-build as credit growth resumed post-pandemic stimulus" },
            ].map((p, i) => (
              <div key={i} className="rounded bg-muted/50 border border-border p-2">
                <div className="font-semibold mb-1" style={{ color: p.color }}>{p.phase}</div>
                <p className="text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LCR / NSFR mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Banknote className="w-4 h-4 text-amber-400" />
              LCR Mechanics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="bg-muted/50 rounded p-3 font-mono text-xs text-green-300">
              LCR = HQLA / Net Cash Outflows (30-day) ≥ 100%
            </div>
            <ul className="list-disc ml-4 space-y-1 text-xs">
              <li><strong className="text-muted-foreground">HQLA Level 1:</strong> Cash, central bank reserves, sovereign debt (0% haircut)</li>
              <li><strong className="text-muted-foreground">HQLA Level 2A:</strong> Agency/GSE debt, covered bonds (15% haircut, max 40% of HQLA)</li>
              <li><strong className="text-muted-foreground">HQLA Level 2B:</strong> Corporate bonds, equities (25–50% haircut, max 15%)</li>
              <li>Retail deposit outflow rate: 3–10% over 30 days (stable/less stable)</li>
              <li>Unsecured wholesale: 25–100% depending on counterparty type</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-green-400" />
              NSFR &amp; OTC Clearing Mandate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="bg-muted/50 rounded p-3 font-mono text-xs text-green-300">
              NSFR = Available Stable Funding / Required Stable Funding ≥ 100%
            </div>
            <ul className="list-disc ml-4 space-y-1 text-xs">
              <li>ASF: Tier 1 equity + deposits with &gt;1yr maturity (100% stable)</li>
              <li>RSF: Assets weighted by liquidity (illiquid assets require more stable funding)</li>
              <li><strong className="text-muted-foreground">OTC clearing mandate (Dodd-Frank §723):</strong> standardized derivatives must clear through central counterparties (CCPs)</li>
              <li>CCPs require initial + variation margin, reducing bilateral counterparty risk</li>
              <li>Risk: CCP becomes a new SIFI — "too central to fail" problem</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Shadow banking regulatory arbitrage */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Regulatory Arbitrage: Shadow Banking Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShadowBankingGrowthSVG />
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <p>
              Stricter bank regulation post-2008 pushed credit intermediation into the shadow banking sector —
              money market funds, hedge funds, private credit, and securitization vehicles that perform bank-like
              functions without equivalent oversight.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {[
                { label: "Global shadow banking assets (2024)", value: "$68T", color: "#fb923c" },
                { label: "Share of total financial assets", value: "~28%", color: "#fbbf24" },
                { label: "FSB monitoring universe", value: "$218T", color: "#60a5fa" },
              ].map((stat, i) => (
                <div key={i} className="rounded bg-muted/50 border border-border p-2 text-center">
                  <div className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DFAST/CCAR history */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Stress Test Evolution: DFAST &amp; CCAR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { year: "2009", name: "SCAP", desc: "Supervisory Capital Assessment Program — first US bank stress test; 19 BHCs, $75B capital shortfall identified", color: "#f87171" },
              { year: "2011", name: "CCAR", desc: "Comprehensive Capital Analysis and Review — annual; supervisory review of capital plans, distributions require Fed approval", color: "#fb923c" },
              { year: "2013", name: "DFAST", desc: "Dodd-Frank Act Stress Tests — statutory requirement; banks ≥$10B run annual adverse/severely-adverse scenarios", color: "#fbbf24" },
              { year: "2020", name: "SCB", desc: "Stress Capital Buffer — replaces fixed 2.5% conservation buffer; dynamically set based on stressed capital depletion", color: "#4ade80" },
              { year: "2023", name: "Basel III Endgame", desc: "Proposed expanded capital requirements including operational risk; revised market risk (FRTB) charges", color: "#60a5fa" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="text-xs font-bold rounded px-2 py-1 shrink-0 mt-0.5"
                  style={{ backgroundColor: item.color + "20", color: item.color, border: `1px solid ${item.color}40` }}>
                  {item.year}
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{item.name}: </span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function SystemicRiskPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-red-950/50 border border-red-900/50">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Systemic Risk &amp; Financial Stability</h1>
            <p className="text-sm text-muted-foreground">How financial crises propagate — contagion, G-SIBs, systemic metrics, macroprudential regulation</p>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "G-SIBs Monitored", value: "30+", color: "text-primary border-border bg-muted/40" },
            { label: "Global SRISK", value: "$318B", color: "text-red-400 border-red-800 bg-red-950/30" },
            { label: "CCyB (US)", value: "1.0%", color: "text-amber-400 border-amber-800 bg-amber-950/30" },
            { label: "Shadow Banking", value: "$68T", color: "text-orange-400 border-orange-800 bg-orange-950/30" },
            { label: "LCR Requirement", value: "≥100%", color: "text-green-400 border-green-800 bg-green-950/30" },
          ].map((chip, i) => (
            <div key={i} className={`rounded-full border px-3 py-1 text-xs flex items-center gap-1.5 ${chip.color}`}>
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="font-bold">{chip.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="contagion">
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          {[
            { value: "contagion", label: "Contagion Mechanisms", icon: GitBranch },
            { value: "gsibs", label: "G-SIBs & TBTF", icon: Building2 },
            { value: "metrics", label: "Systemic Risk Metrics", icon: BarChart3 },
            { value: "macropru", label: "Macroprudential Tools", icon: Shield },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground flex items-center gap-1.5 px-3 py-2"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="contagion" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ContagionTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="gsibs" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <GSIBTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="metrics" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <MetricsTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="macropru" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <MacroPruTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
