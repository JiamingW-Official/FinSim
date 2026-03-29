"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  BarChart3,
  DollarSign,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Target,
  Activity,
  Layers,
  Clock,
  Users,
  Eye,
  Zap,
  Scale,
  Minus,
  Calculator,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 662006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 662006;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface CompData {
  ticker: string;
  name: string;
  marketCap: number;
  ev: number;
  ebitda: number;
  evEbitda: number;
  revenue: number;
  evRev: number;
  pe: number;
  growth: number;
  margin: number;
  rating: "Buy" | "Hold" | "Sell";
}

interface SensitivityCell {
  wacc: number;
  growth: number;
  value: number;
}

interface ProcessStep {
  id: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface AnalystRating {
  firm: string;
  analyst: string;
  rating: "Buy" | "Hold" | "Sell" | "Strong Buy";
  priceTarget: number;
  date: string;
  accuracy: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const TICKER = "NVDA";
const CURRENT_PRICE = 875.4;
const BASE_PT = 1020;

const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    label: "Idea Generation",
    description: "Screen for candidates, track news flow, monitor insider activity, sector rotation signals",
    icon: <Search size={18} />,
    color: "#6366f1",
  },
  {
    id: 2,
    label: "Thesis Development",
    description: "Define the key investment thesis — why will the stock outperform over 12-24 months?",
    icon: <Zap size={18} />,
    color: "#8b5cf6",
  },
  {
    id: 3,
    label: "Financial Modeling",
    description: "Build 3-statement model, run DCF, conduct scenario analysis, stress test assumptions",
    icon: <BarChart3 size={18} />,
    color: "#06b6d4",
  },
  {
    id: 4,
    label: "Qualitative Analysis",
    description: "Assess management quality, competitive moats, industry dynamics, regulatory environment",
    icon: <Users size={18} />,
    color: "#10b981",
  },
  {
    id: 5,
    label: "Risk Assessment",
    description: "Identify key risks: execution, macro, regulatory, competitive; size position accordingly",
    icon: <AlertTriangle size={18} />,
    color: "#f59e0b",
  },
  {
    id: 6,
    label: "Valuation",
    description: "Triangulate value using DCF, comps, precedent transactions; establish price target range",
    icon: <DollarSign size={18} />,
    color: "#ef4444",
  },
  {
    id: 7,
    label: "Report Writing",
    description: "Draft investment report with clear thesis, catalysts, risks, and actionable recommendation",
    icon: <FileText size={18} />,
    color: "#ec4899",
  },
  {
    id: 8,
    label: "Monitoring",
    description: "Track catalyst progress, revise model on earnings, reassess thesis on material events",
    icon: <Eye size={18} />,
    color: "#14b8a6",
  },
];

const DRIVER_ASSUMPTIONS = [
  { driver: "Revenue Growth (Y1)", base: "38%", bull: "52%", bear: "24%", sensitivity: "High" },
  { driver: "Revenue Growth (Y2)", base: "28%", bull: "40%", bear: "16%", sensitivity: "High" },
  { driver: "Gross Margin", base: "73.5%", bull: "76%", bear: "70%", sensitivity: "Medium" },
  { driver: "EBITDA Margin", base: "57%", bull: "62%", bear: "50%", sensitivity: "Medium" },
  { driver: "CapEx / Revenue", base: "3.2%", bull: "2.8%", bear: "4.5%", sensitivity: "Low" },
  { driver: "Terminal Growth", base: "3.5%", bull: "4.5%", bear: "2.5%", sensitivity: "High" },
  { driver: "WACC", base: "10.5%", bull: "9.0%", bear: "12.0%", sensitivity: "High" },
  { driver: "Tax Rate", base: "12%", bull: "10%", bear: "15%", sensitivity: "Low" },
];

const COMPS_DATA: CompData[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp",
    marketCap: 2160,
    ev: 2135,
    ebitda: 82,
    evEbitda: 26.0,
    revenue: 112,
    evRev: 19.1,
    pe: 38,
    growth: 122,
    margin: 73,
    rating: "Buy",
  },
  {
    ticker: "AMD",
    name: "Adv Micro Devices",
    marketCap: 248,
    ev: 243,
    ebitda: 8.2,
    evEbitda: 29.6,
    revenue: 22.7,
    evRev: 10.7,
    pe: 44,
    growth: 14,
    margin: 47,
    rating: "Buy",
  },
  {
    ticker: "INTC",
    name: "Intel Corp",
    marketCap: 103,
    ev: 128,
    ebitda: 12.1,
    evEbitda: 10.6,
    revenue: 53.1,
    evRev: 2.4,
    pe: 18,
    growth: -8,
    margin: 41,
    rating: "Hold",
  },
  {
    ticker: "QCOM",
    name: "Qualcomm",
    marketCap: 188,
    ev: 194,
    ebitda: 14.8,
    evEbitda: 13.1,
    revenue: 38.9,
    evRev: 5.0,
    pe: 16,
    growth: 11,
    margin: 58,
    rating: "Hold",
  },
  {
    ticker: "AVGO",
    name: "Broadcom Inc",
    marketCap: 871,
    ev: 1020,
    ebitda: 38.5,
    evEbitda: 26.5,
    revenue: 51.6,
    evRev: 19.8,
    pe: 34,
    growth: 51,
    margin: 68,
    rating: "Buy",
  },
  {
    ticker: "MRVL",
    name: "Marvell Technology",
    marketCap: 73,
    ev: 80,
    ebitda: 4.1,
    evEbitda: 19.5,
    revenue: 5.8,
    evRev: 13.8,
    pe: 62,
    growth: 45,
    margin: 52,
    rating: "Buy",
  },
  {
    ticker: "MPWR",
    name: "Monolithic Power",
    marketCap: 26,
    ev: 25,
    ebitda: 1.4,
    evEbitda: 17.9,
    revenue: 2.2,
    evRev: 11.4,
    pe: 48,
    growth: 21,
    margin: 55,
    rating: "Hold",
  },
  {
    ticker: "ON",
    name: "ON Semiconductor",
    marketCap: 24,
    ev: 27,
    ebitda: 3.6,
    evEbitda: 7.5,
    revenue: 7.0,
    evRev: 3.9,
    pe: 11,
    growth: -9,
    margin: 46,
    rating: "Sell",
  },
];

const ANALYST_RATINGS: AnalystRating[] = [
  { firm: "Morgan Stanley", analyst: "J. Moore", rating: "Strong Buy", priceTarget: 1100, date: "Feb 26", accuracy: 74 },
  { firm: "Goldman Sachs", analyst: "T. Chen", rating: "Buy", priceTarget: 1050, date: "Feb 21", accuracy: 68 },
  { firm: "JP Morgan", analyst: "H. Rakesh", rating: "Buy", priceTarget: 1000, date: "Mar 4", accuracy: 71 },
  { firm: "Bank of America", analyst: "V. Singh", rating: "Buy", priceTarget: 980, date: "Mar 1", accuracy: 65 },
  { firm: "Citi", analyst: "A. Patel", rating: "Buy", priceTarget: 950, date: "Feb 28", accuracy: 62 },
  { firm: "Wells Fargo", analyst: "B. Kim", rating: "Hold", priceTarget: 900, date: "Feb 19", accuracy: 58 },
  { firm: "UBS", analyst: "C. Nguyen", rating: "Buy", priceTarget: 1080, date: "Mar 7", accuracy: 69 },
  { firm: "Deutsche Bank", analyst: "R. Muller", rating: "Hold", priceTarget: 850, date: "Feb 15", accuracy: 55 },
  { firm: "Barclays", analyst: "S. Hawkins", rating: "Buy", priceTarget: 1020, date: "Mar 3", accuracy: 67 },
  { firm: "RBC Capital", analyst: "M. Davis", rating: "Sell", priceTarget: 750, date: "Feb 10", accuracy: 44 },
];

const CATALYSTS = [
  { date: "Apr 23", event: "Q1 FY2026 Earnings", type: "earnings", impact: "High" },
  { date: "May 14", event: "GTC Keynote Livestream", type: "event", impact: "Medium" },
  { date: "Jun 3", event: "Computex AI GPU Showcase", type: "event", impact: "Medium" },
  { date: "Jul 24", event: "Q2 FY2026 Earnings", type: "earnings", impact: "High" },
  { date: "Aug 15", event: "Blackwell Ultra Sampling", type: "product", impact: "High" },
  { date: "Sep 10", event: "Export Control Review", type: "regulatory", impact: "High" },
  { date: "Oct 22", event: "Q3 FY2026 Earnings", type: "earnings", impact: "High" },
  { date: "Nov 18", event: "Supercomputing 2026", type: "event", impact: "Low" },
];

// ── DCF Sensitivity Matrix ─────────────────────────────────────────────────────
function buildSensitivityMatrix(): SensitivityCell[] {
  resetSeed();
  const waccRange = [8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0];
  const growthRange = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const cells: SensitivityCell[] = [];

  // Approximate intrinsic value using Gordon Growth style
  const baseRevenue = 112; // $B
  const fcfMargin = 0.42;
  const baseFCF = baseRevenue * fcfMargin;

  for (const wacc of waccRange) {
    for (const g of growthRange) {
      const w = wacc / 100;
      const gr = g / 100;
      // Terminal value dominates; rough DCF: PV = FCF*(1+g)/(WACC-g) / shares
      const shares = 2.46; // B shares
      const tv = gr >= w ? 0 : baseFCF * (1 + gr) / (w - gr);
      // Add 5-year explicit PV
      let explicitPV = 0;
      let fcf = baseFCF;
      for (let y = 1; y <= 5; y++) {
        fcf *= 1 + 0.22 - y * 0.03; // declining growth
        explicitPV += fcf / Math.pow(1 + w, y);
      }
      const equity = (tv + explicitPV) * 0.88; // net debt adj
      const perShare = equity / shares;
      cells.push({ wacc, growth: g, value: Math.max(400, Math.min(1800, perShare)) });
    }
  }
  return cells;
}

// ── Tornado Data ──────────────────────────────────────────────────────────────
const TORNADO_ITEMS = [
  { label: "Terminal Growth Rate", low: -195, high: 220, base: BASE_PT },
  { label: "WACC", low: -180, high: 165, base: BASE_PT },
  { label: "Revenue Growth (Y1-2)", low: -120, high: 140, base: BASE_PT },
  { label: "EBITDA Margin", low: -95, high: 105, base: BASE_PT },
  { label: "Exit Multiple", low: -85, high: 90, base: BASE_PT },
  { label: "CapEx Intensity", low: -60, high: 55, base: BASE_PT },
  { label: "Tax Rate", low: -40, high: 35, base: BASE_PT },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function RatingBadge({ rating }: { rating: "Buy" | "Hold" | "Sell" | "Strong Buy" }) {
  const colors = {
    "Strong Buy": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Buy: "bg-green-500/20 text-green-400 border border-green-500/30",
    Hold: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Sell: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return (
    <span className={cn("text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full", colors[rating])}>
      {rating}
    </span>
  );
}

function SensitivityGrid() {
  const cells = useMemo(() => buildSensitivityMatrix(), []);
  const waccRange = [8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0];
  const growthRange = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  const getColor = (value: number) => {
    if (value >= 1400) return "#166534";
    if (value >= 1200) return "#15803d";
    if (value >= 1100) return "#16a34a";
    if (value >= 1000) return "#22c55e";
    if (value >= 900) return "#86efac";
    if (value >= BASE_PT - 20 && value <= BASE_PT + 20) return "#fde68a";
    if (value >= 800) return "#fca5a5";
    if (value >= 700) return "#f87171";
    if (value >= 600) return "#ef4444";
    if (value >= 500) return "#dc2626";
    return "#991b1b";
  };

  const getTextColor = (value: number) => {
    if (value >= 800) return "#052e16";
    if (value >= 700) return "#1c1917";
    return "#fff";
  };

  const cellW = 72;
  const cellH = 36;
  const leftPad = 56;
  const topPad = 48;
  const totalW = leftPad + waccRange.length * cellW + 4;
  const totalH = topPad + growthRange.length * cellH + 4;

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={totalH} className="font-mono text-xs text-muted-foreground">
        {/* Corner label */}
        <text x={leftPad / 2} y={topPad / 2 + 4} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          g\WACC
        </text>
        {/* WACC column headers */}
        {waccRange.map((w, i) => (
          <text
            key={`wh-${i}`}
            x={leftPad + i * cellW + cellW / 2}
            y={topPad - 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={11}
          >
            {w.toFixed(1)}%
          </text>
        ))}
        {/* Growth row headers */}
        {growthRange.map((g, j) => (
          <text
            key={`gh-${j}`}
            x={leftPad - 8}
            y={topPad + j * cellH + cellH / 2 + 4}
            textAnchor="end"
            fill="#94a3b8"
            fontSize={11}
          >
            {g.toFixed(1)}%
          </text>
        ))}
        {/* Cells */}
        {cells.map((cell, idx) => {
          const wi = waccRange.indexOf(cell.wacc);
          const gi = growthRange.indexOf(cell.growth);
          const x = leftPad + wi * cellW;
          const y = topPad + gi * cellH;
          const isBase = Math.abs(cell.wacc - 10.5) < 0.01 && Math.abs(cell.growth - 3.5) < 0.01;
          const bg = getColor(cell.value);
          const fg = getTextColor(cell.value);
          return (
            <g key={`cell-${idx}`}>
              <rect
                x={x + 1}
                y={y + 1}
                width={cellW - 2}
                height={cellH - 2}
                fill={bg}
                rx={3}
                stroke={isBase ? "#f8fafc" : "transparent"}
                strokeWidth={isBase ? 2 : 0}
              />
              <text
                x={x + cellW / 2}
                y={y + cellH / 2 + 4}
                textAnchor="middle"
                fill={fg}
                fontSize={10}
                fontWeight={isBase ? "700" : "400"}
              >
                ${Math.round(cell.value)}
              </text>
            </g>
          );
        })}
        {/* Axis labels */}
        <text x={totalW / 2} y={totalH} textAnchor="middle" fill="#64748b" fontSize={10}>
          WACC →
        </text>
        <text
          x={10}
          y={topPad + (growthRange.length * cellH) / 2}
          textAnchor="middle"
          fill="#64748b"
          fontSize={10}
          transform={`rotate(-90, 10, ${topPad + (growthRange.length * cellH) / 2})`}
        >
          Terminal Growth →
        </text>
      </svg>
      <p className="text-xs text-muted-foreground mt-2">White border = base case (WACC 10.5%, g 3.5%). Values are per-share intrinsic value ($).</p>
    </div>
  );
}

function TornadoChart() {
  const maxRange = 220;
  const barH = 28;
  const barGap = 8;
  const labelW = 180;
  const chartW = 420;
  const totalW = labelW + chartW + 8;
  const mid = chartW / 2;
  const totalH = TORNADO_ITEMS.length * (barH + barGap) + 60;

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={totalH}>
        {/* Base line */}
        <line
          x1={labelW + mid}
          y1={20}
          x2={labelW + mid}
          y2={totalH - 24}
          stroke="#475569"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
        {/* Axis label */}
        <text x={labelW + mid} y={14} textAnchor="middle" fill="#94a3b8" fontSize={11}>
          ${BASE_PT} base
        </text>
        {/* Low / High labels */}
        <text x={labelW + 8} y={totalH - 8} fill="#ef4444" fontSize={10}>Bear case</text>
        <text x={labelW + chartW - 8} y={totalH - 8} textAnchor="end" fill="#22c55e" fontSize={10}>Bull case</text>

        {TORNADO_ITEMS.map((item, i) => {
          const y = 28 + i * (barH + barGap);
          const lowPx = Math.abs(item.low / maxRange) * mid;
          const highPx = (item.high / maxRange) * mid;
          return (
            <g key={`tornado-${i}`}>
              {/* Label */}
              <text
                x={labelW - 8}
                y={y + barH / 2 + 4}
                textAnchor="end"
                fill="#cbd5e1"
                fontSize={11}
              >
                {item.label}
              </text>
              {/* Bear (left) bar */}
              <rect
                x={labelW + mid - lowPx}
                y={y}
                width={lowPx}
                height={barH}
                fill="#ef4444"
                rx={3}
                opacity={0.75}
              />
              <text
                x={labelW + mid - lowPx - 4}
                y={y + barH / 2 + 4}
                textAnchor="end"
                fill="#ef4444"
                fontSize={10}
              >
                ${BASE_PT + item.low}
              </text>
              {/* Bull (right) bar */}
              <rect
                x={labelW + mid}
                y={y}
                width={highPx}
                height={barH}
                fill="#22c55e"
                rx={3}
                opacity={0.75}
              />
              <text
                x={labelW + mid + highPx + 4}
                y={y + barH / 2 + 4}
                fill="#22c55e"
                fontSize={10}
              >
                ${BASE_PT + item.high}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ThreeStatementDiagram() {
  const w = 680;
  const h = 300;
  const boxW = 160;
  const boxH = 200;

  const boxes = [
    {
      x: 20, y: 50, label: "Income Statement",
      items: ["Revenue", "COGS", "Gross Profit", "EBITDA", "D&A", "EBIT", "Net Income"],
      color: "#6366f1",
    },
    {
      x: 260, y: 50, label: "Cash Flow Statement",
      items: ["Net Income →", "D&A →", "ΔWorking Capital", "CFO", "CapEx", "CFI", "CFF"],
      color: "#06b6d4",
    },
    {
      x: 500, y: 50, label: "Balance Sheet",
      items: ["Cash ↑", "PP&E (net)", "Total Assets", "Debt", "Equity ↑", "Retained Earnings", "Check: A=L+E"],
      color: "#10b981",
    },
  ];

  // Arrow paths
  const arrows = [
    // IS → CFS
    { x1: 20 + boxW, y1: 50 + boxH / 2, x2: 260, y2: 50 + boxH / 2, label: "Net Income" },
    // IS → CFS (D&A)
    { x1: 20 + boxW, y1: 50 + boxH / 2 + 30, x2: 260, y2: 50 + boxH / 2 + 30, label: "D&A addback" },
    // CFS → BS (Cash)
    { x1: 260 + boxW, y1: 50 + boxH / 2, x2: 500, y2: 50 + boxH / 2, label: "Ending Cash" },
    // IS → BS (Retained Earnings)
    { x1: 20 + boxW / 2, y1: 50 + boxH, x2: 500 + boxW / 2, y2: 50 + boxH, label: "Net Income → RE" },
  ];

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h}>
        {/* Draw boxes */}
        {boxes.map((box, i) => (
          <g key={`box-${i}`}>
            <rect
              x={box.x}
              y={box.y}
              width={boxW}
              height={boxH}
              fill={`${box.color}18`}
              stroke={box.color}
              strokeWidth={1.5}
              rx={8}
            />
            <text x={box.x + boxW / 2} y={box.y + 18} textAnchor="middle" fill={box.color} fontSize={11} fontWeight={700}>
              {box.label}
            </text>
            {box.items.map((item, j) => (
              <text
                key={`item-${i}-${j}`}
                x={box.x + 10}
                y={box.y + 34 + j * 22}
                fill="#94a3b8"
                fontSize={10}
              >
                {item}
              </text>
            ))}
          </g>
        ))}
        {/* Arrow IS → CFS */}
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
          </marker>
        </defs>
        <line x1={20 + boxW} y1={130} x2={258} y2={130} stroke="#475569" strokeWidth={1.5} markerEnd="url(#arr)" strokeDasharray="4 2" />
        <text x={165} y={124} textAnchor="middle" fill="#64748b" fontSize={9}>Net Income / D&A</text>
        {/* Arrow CFS → BS */}
        <line x1={260 + boxW} y1={150} x2={498} y2={150} stroke="#475569" strokeWidth={1.5} markerEnd="url(#arr)" strokeDasharray="4 2" />
        <text x={405} y={144} textAnchor="middle" fill="#64748b" fontSize={9}>Cash balance</text>
        {/* Arrow IS → BS (bottom arc) */}
        <path
          d={`M ${20 + boxW / 2} ${50 + boxH + 2} Q ${20 + boxW / 2} ${h - 8} ${500 + boxW / 2} ${h - 8} L ${500 + boxW / 2} ${50 + boxH + 2}`}
          fill="none"
          stroke="#475569"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          markerEnd="url(#arr)"
        />
        <text x={w / 2} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={9}>
          Net Income → Retained Earnings
        </text>
      </svg>
    </div>
  );
}

function ProcessFlowchart() {
  const W = 700;
  const H = 280;
  const boxW = 120;
  const boxH = 52;
  const cols = 4;
  const gap = (W - cols * boxW) / (cols + 1);

  // 8 steps in 2 rows of 4
  const positions = PROCESS_STEPS.map((_, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = gap + col * (boxW + gap);
    const y = 20 + row * (boxH + 80);
    return { x, y };
  });

  const connectors: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const from = positions[i];
    const to = positions[i + 1];
    if (i === 3) {
      // Row 1 to Row 2: down then left connector
      connectors.push({
        x1: from.x + boxW / 2,
        y1: from.y + boxH,
        x2: to.x + boxW / 2,
        y2: to.y,
      });
    } else {
      connectors.push({
        x1: from.x + boxW,
        y1: from.y + boxH / 2,
        x2: to.x,
        y2: to.y + boxH / 2,
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H}>
        <defs>
          <marker id="farr" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill="#475569" />
          </marker>
        </defs>
        {connectors.map((c, i) => (
          <line
            key={`conn-${i}`}
            x1={c.x1}
            y1={c.y1}
            x2={c.x2}
            y2={c.y2}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#farr)"
          />
        ))}
        {PROCESS_STEPS.map((step, i) => {
          const pos = positions[i];
          return (
            <g key={`step-${i}`}>
              <rect
                x={pos.x}
                y={pos.y}
                width={boxW}
                height={boxH}
                fill={`${step.color}22`}
                stroke={step.color}
                strokeWidth={1.5}
                rx={8}
              />
              {/* Step number circle */}
              <circle cx={pos.x + 14} cy={pos.y + 14} r={10} fill={step.color} />
              <text x={pos.x + 14} y={pos.y + 18} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>
                {step.id}
              </text>
              <text x={pos.x + boxW / 2} y={pos.y + 33} textAnchor="middle" fill="#e2e8f0" fontSize={9.5} fontWeight={600}>
                {step.label.split(" ")[0]}
              </text>
              <text x={pos.x + boxW / 2} y={pos.y + 46} textAnchor="middle" fill="#94a3b8" fontSize={9}>
                {step.label.split(" ").slice(1).join(" ")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RatingDistributionChart({ ratings }: { ratings: AnalystRating[] }) {
  const buy = ratings.filter((r) => r.rating === "Buy" || r.rating === "Strong Buy").length;
  const hold = ratings.filter((r) => r.rating === "Hold").length;
  const sell = ratings.filter((r) => r.rating === "Sell").length;
  const total = ratings.length;

  const buyPct = (buy / total) * 100;
  const holdPct = (hold / total) * 100;
  const sellPct = (sell / total) * 100;

  const barW = 280;
  const barH = 32;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium">Consensus Distribution ({total} analysts)</p>
      <svg width={barW + 120} height={barH + 40}>
        {/* Stacked bar */}
        <rect x={0} y={0} width={(buyPct / 100) * barW} height={barH} fill="#22c55e" rx={4} />
        <rect x={(buyPct / 100) * barW} y={0} width={(holdPct / 100) * barW} height={barH} fill="#f59e0b" />
        <rect x={((buyPct + holdPct) / 100) * barW} y={0} width={(sellPct / 100) * barW} height={barH} fill="#ef4444" rx={4} />
        {/* Labels */}
        <text x={(buyPct / 200) * barW} y={barH / 2 + 5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
          Buy {buy} ({buyPct.toFixed(0)}%)
        </text>
        <text x={((buyPct + holdPct / 2) / 100) * barW} y={barH / 2 + 5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
          Hold {hold}
        </text>
        {sell > 0 && (
          <text x={((buyPct + holdPct + sellPct / 2) / 100) * barW} y={barH / 2 + 5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
            Sell {sell}
          </text>
        )}
        {/* Avg PT arrow */}
        <text x={barW + 16} y={barH / 2 - 4} fill="#94a3b8" fontSize={10}>Avg PT</text>
        <text x={barW + 16} y={barH / 2 + 10} fill="#e2e8f0" fontSize={13} fontWeight={700}>
          ${Math.round(ratings.reduce((a, r) => a + r.priceTarget, 0) / total)}
        </text>
      </svg>

      {/* Sell-side bias note */}
      <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          <strong>Sell-side bias:</strong> Analysts at banks with investment banking relationships
          skew bullish. Studies show ~70–80% of ratings are Buy — treat consensus with skepticism.
          Focus on target revision direction, not absolute rating.
        </span>
      </div>
    </div>
  );
}

function PriceTargetAccuracyChart({ ratings }: { ratings: AnalystRating[] }) {
  const W = 400;
  const H = 180;
  const padL = 40;
  const padB = 40;
  const chartW = W - padL - 20;
  const chartH = H - padB - 20;

  const maxAcc = 80;

  return (
    <svg width={W} height={H}>
      {/* Grid lines */}
      {[0, 25, 50, 75].map((v) => {
        const y = 20 + chartH - (v / maxAcc) * chartH;
        return (
          <g key={`grid-${v}`}>
            <line x1={padL} y1={y} x2={W - 20} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>{v}%</text>
          </g>
        );
      })}
      {/* Bars */}
      {ratings.map((r, i) => {
        const barW = chartW / ratings.length - 4;
        const x = padL + i * (chartW / ratings.length) + 2;
        const bH = (r.accuracy / maxAcc) * chartH;
        const y = 20 + chartH - bH;
        const color = r.accuracy >= 65 ? "#22c55e" : r.accuracy >= 55 ? "#f59e0b" : "#ef4444";
        return (
          <g key={`bar-${i}`}>
            <rect x={x} y={y} width={barW} height={bH} fill={color} rx={3} opacity={0.8} />
            <text
              x={x + barW / 2}
              y={20 + chartH + 14}
              textAnchor="middle"
              fill="#64748b"
              fontSize={8}
              transform={`rotate(-45, ${x + barW / 2}, ${20 + chartH + 14})`}
            >
              {r.firm.split(" ")[0]}
            </text>
            <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill={color} fontSize={8}>
              {r.accuracy}%
            </text>
          </g>
        );
      })}
      {/* Axis */}
      <line x1={padL} y1={20} x2={padL} y2={20 + chartH} stroke="#334155" strokeWidth={1} />
      <text x={W / 2} y={H} textAnchor="middle" fill="#475569" fontSize={9}>12-Month Price Target Accuracy</text>
    </svg>
  );
}

// ── Tab: Research Process ──────────────────────────────────────────────────────
function ResearchProcessTab() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">The Equity Research Process</h3>
        <p className="text-xs text-muted-foreground">
          Professional equity research follows a disciplined 8-step framework from idea generation through
          ongoing monitoring. Each phase builds on the previous to create a rigorous, repeatable investment process.
        </p>
      </div>

      {/* Flowchart */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Process Flowchart</p>
        <ProcessFlowchart />
      </div>

      {/* Step cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROCESS_STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
            className="text-left rounded-md bg-muted/50 border border-border/50 p-4 hover:border-muted-foreground/60 transition-colors"
          >
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${step.color}28`, color: step.color }}
              >
                {step.icon}
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-mono">Step {step.id}</span>
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
              </div>
              <ChevronRight
                size={14}
                className={cn("ml-auto text-muted-foreground transition-transform", activeStep === step.id && "rotate-90")}
              />
            </div>
            <AnimatePresence>
              {activeStep === step.id && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-xs text-muted-foreground mt-2 overflow-hidden"
                >
                  {step.description}
                </motion.p>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      {/* Checklist */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Thesis Validation Checklist</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "Can you explain the thesis in 2 sentences?",
            "What is the key variant perception vs. consensus?",
            "What are the 3 most important risks?",
            "What catalysts will prove/disprove the thesis?",
            "What is your expected holding period?",
            "How does this fit in the portfolio (sizing)?",
            "At what price is your thesis wrong?",
            "Who is on the other side of this trade?",
          ].map((q, i) => (
            <div key={`check-${i}`} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 size={13} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Financial Modeling ────────────────────────────────────────────────────
function FinancialModelingTab() {
  return (
    <div className="space-y-4">
      {/* 3-Statement Linkage */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={15} className="text-indigo-400" />
          <p className="text-sm font-medium text-foreground">3-Statement Model Linkage</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          The three financial statements are deeply interlinked. Net income flows from the IS to the CFS and equity section of the BS.
          Cash from the CFS feeds the BS cash balance. D&A ties IS to CFS and reduces PP&E on BS.
        </p>
        <ThreeStatementDiagram />
      </div>

      {/* Key Driver Assumptions */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={15} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Key Driver Assumptions — {TICKER}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Driver</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Base</th>
                <th className="text-right py-2 px-3 text-emerald-400 font-medium">Bull</th>
                <th className="text-right py-2 px-3 text-red-400 font-medium">Bear</th>
                <th className="text-right py-2 pl-3 text-muted-foreground font-medium">Sensitivity</th>
              </tr>
            </thead>
            <tbody>
              {DRIVER_ASSUMPTIONS.map((row, i) => (
                <tr key={`driver-${i}`} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-2 pr-4 text-muted-foreground font-medium">{row.driver}</td>
                  <td className="py-2 px-3 text-right text-foreground font-mono">{row.base}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-mono">{row.bull}</td>
                  <td className="py-2 px-3 text-right text-red-400 font-mono">{row.bear}</td>
                  <td className="py-2 pl-3 text-right">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs text-muted-foreground font-medium",
                        row.sensitivity === "High"
                          ? "bg-red-500/20 text-red-400"
                          : row.sensitivity === "Medium"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {row.sensitivity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tornado Chart */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={15} className="text-primary" />
          <p className="text-sm font-medium text-foreground">Sensitivity Analysis — Tornado Chart</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Shows impact on price target from moving each assumption from base to bull/bear,
          holding all others constant. Widest bars = highest sensitivity = most critical assumptions.
        </p>
        <TornadoChart />
      </div>
    </div>
  );
}

// ── Tab: Valuation ─────────────────────────────────────────────────────────────
function ValuationTab() {
  const [sortKey, setSortKey] = useState<keyof CompData>("evEbitda");

  const sorted = useMemo(
    () => [...COMPS_DATA].sort((a, b) => (a[sortKey] as number) - (b[sortKey] as number)),
    [sortKey]
  );

  const median = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
  };

  const medEvEbitda = median(COMPS_DATA.map((c) => c.evEbitda));
  const medPE = median(COMPS_DATA.map((c) => c.pe));
  const medEvRev = median(COMPS_DATA.map((c) => c.evRev));

  const nvda = COMPS_DATA[0];

  return (
    <div className="space-y-4">
      {/* DCF Sensitivity Matrix */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator size={15} className="text-primary" />
          <p className="text-sm font-medium text-foreground">DCF Sensitivity — WACC vs Terminal Growth ($/share)</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Green = above ${BASE_PT} bull target. Yellow = near current price ${CURRENT_PRICE}. Red = downside.
          Base case (white border) assumes WACC 10.5% and terminal growth 3.5%.
        </p>
        <SensitivityGrid />
      </div>

      {/* P/E Relative Valuation */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={15} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">P/E Relative Valuation Context</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "NVDA Forward P/E", value: `${nvda.pe}x`, note: "vs peer median", delta: `+${(nvda.pe - medPE).toFixed(0)}x` },
            { label: "Sector Median P/E", value: `${medPE.toFixed(0)}x`, note: "8-company set", delta: "" },
            {
              label: "Premium to Median",
              value: `${(((nvda.pe - medPE) / medPE) * 100).toFixed(0)}%`,
              note: "justified by 122% growth",
              delta: "",
            },
          ].map((item, i) => (
            <div key={`pe-${i}`} className="rounded-lg bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              {item.note && <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>}
              {item.delta && <p className="text-xs text-amber-400 mt-0.5">{item.delta}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* EV/EBITDA Comps Table */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-emerald-400" />
            <p className="text-sm font-medium text-foreground">Semiconductor Comps Table</p>
          </div>
          <div className="flex gap-1">
            {(["evEbitda", "pe", "evRev", "growth"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className={cn(
                  "text-xs text-muted-foreground px-2 py-1 rounded-md transition-colors",
                  sortKey === k ? "bg-indigo-600 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {k === "evEbitda" ? "EV/EBITDA" : k === "evRev" ? "EV/Rev" : k === "pe" ? "P/E" : "Growth"}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Company</th>
                <th className="text-right py-2 px-2 font-medium">Mkt Cap ($B)</th>
                <th className="text-right py-2 px-2 font-medium">EV/EBITDA</th>
                <th className="text-right py-2 px-2 font-medium">EV/Rev</th>
                <th className="text-right py-2 px-2 font-medium">P/E</th>
                <th className="text-right py-2 px-2 font-medium">Rev Growth</th>
                <th className="text-right py-2 px-2 font-medium">Margin</th>
                <th className="text-right py-2 pl-2 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => {
                const isNvda = c.ticker === "NVDA";
                return (
                  <tr
                    key={`comp-${i}`}
                    className={cn(
                      "border-b border-border/30 hover:bg-muted/20",
                      isNvda && "bg-indigo-500/10"
                    )}
                  >
                    <td className="py-2 pr-3">
                      <div>
                        <span className={cn("font-bold", isNvda ? "text-indigo-300" : "text-foreground")}>
                          {c.ticker}
                        </span>
                        <span className="text-muted-foreground ml-1 text-xs">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-muted-foreground font-mono">{c.marketCap.toFixed(0)}</td>
                    <td className={cn("py-2 px-2 text-right font-mono", c.evEbitda > medEvEbitda ? "text-amber-400" : "text-muted-foreground")}>
                      {c.evEbitda.toFixed(1)}x
                    </td>
                    <td className={cn("py-2 px-2 text-right font-mono", c.evRev > medEvRev ? "text-amber-400" : "text-muted-foreground")}>
                      {c.evRev.toFixed(1)}x
                    </td>
                    <td className={cn("py-2 px-2 text-right font-mono", c.pe > medPE ? "text-amber-400" : "text-muted-foreground")}>
                      {c.pe}x
                    </td>
                    <td className={cn("py-2 px-2 text-right font-mono", c.growth >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {c.growth > 0 ? "+" : ""}{c.growth}%
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-muted-foreground">{c.margin}%</td>
                    <td className="py-2 pl-2 text-right">
                      <RatingBadge rating={c.rating} />
                    </td>
                  </tr>
                );
              })}
              {/* Median row */}
              <tr className="border-t border-border/50 bg-muted/20">
                <td className="py-2 pr-3 text-muted-foreground font-medium text-xs italic">Median</td>
                <td className="py-2 px-2 text-right text-muted-foreground font-mono">—</td>
                <td className="py-2 px-2 text-right text-muted-foreground font-mono font-medium">{medEvEbitda.toFixed(1)}x</td>
                <td className="py-2 px-2 text-right text-muted-foreground font-mono font-medium">{medEvRev.toFixed(1)}x</td>
                <td className="py-2 px-2 text-right text-muted-foreground font-mono font-medium">{medPE.toFixed(0)}x</td>
                <td className="py-2 px-2 text-right text-muted-foreground font-mono">—</td>
                <td className="py-2 px-2 text-right text-muted-foreground font-mono">—</td>
                <td className="py-2 pl-2" />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Amber = above peer median. NVDA highlighted in blue. Sort by any metric.
        </p>
      </div>
    </div>
  );
}

// ── Tab: Report Structure ──────────────────────────────────────────────────────
function ReportStructureTab() {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections = [
    {
      title: "1. Executive Summary & Recommendation",
      color: "#6366f1",
      content: [
        "One-line recommendation with rating and price target",
        "Current price vs. price target implied upside/downside",
        "3-bullet thesis summary",
        "Key catalysts and timeline",
        "Primary risks in one line",
      ],
    },
    {
      title: "2. Company Overview",
      color: "#06b6d4",
      content: [
        "Business description and segment breakdown",
        "Revenue mix by geography and product",
        "Competitive positioning and market share",
        "Management team quality and track record",
        "Ownership structure and insider alignment",
      ],
    },
    {
      title: "3. Investment Thesis",
      color: "#10b981",
      content: [
        "Variant perception: where you disagree with consensus",
        "Bull case: upside scenario with specific assumptions",
        "Base case: most likely outcome",
        "Bear case: downside scenario and tail risks",
        "Quantified target under each scenario with probability weights",
      ],
    },
    {
      title: "4. Financial Analysis",
      color: "#8b5cf6",
      content: [
        "Historical financials: 5-year income statement, balance sheet, cash flow",
        "Key ratio trend analysis (margins, returns, leverage)",
        "Model assumptions and methodology",
        "Sensitivity analysis on key drivers",
        "Quality of earnings assessment",
      ],
    },
    {
      title: "5. Valuation",
      color: "#f59e0b",
      content: [
        "DCF model with WACC/terminal growth sensitivity",
        "Trading comps: EV/EBITDA, P/E, EV/Revenue vs. peers",
        "Precedent transactions (M&A comps if applicable)",
        "Sum-of-parts if multi-segment",
        "Price target derivation and methodology weighting",
      ],
    },
    {
      title: "6. Risk Factors",
      color: "#ef4444",
      content: [
        "Execution risk: can management deliver on guidance?",
        "Competitive risk: new entrants, pricing pressure",
        "Macro risk: rates, FX, recession sensitivity",
        "Regulatory/geopolitical risk",
        "Thesis invalidation triggers: what would make you wrong",
      ],
    },
    {
      title: "7. Catalyst Calendar",
      color: "#ec4899",
      content: [
        "Upcoming earnings dates with consensus estimates",
        "Product launch or regulatory approval timelines",
        "Industry conferences and management presentations",
        "Key data releases that affect the thesis",
        "Expected timeline to thesis realization",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Report outline */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">Professional Research Report Structure</h3>
        <p className="text-xs text-muted-foreground">
          Sell-side and buy-side reports follow a consistent structure. Click each section to explore what it should contain.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((sec, i) => (
          <div
            key={`sec-${i}`}
            className="rounded-md bg-muted/50 border border-border/50 overflow-hidden"
          >
            <button
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
              onClick={() => setOpenSection(openSection === i ? null : i)}
            >
              <div
                className="w-2 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: sec.color }}
              />
              <span className="text-sm font-medium text-foreground flex-1">{sec.title}</span>
              <ChevronRight
                size={14}
                className={cn("text-muted-foreground transition-transform flex-shrink-0", openSection === i && "rotate-90")}
              />
            </button>
            <AnimatePresence>
              {openSection === i && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-1.5">
                    {sec.content.map((line, j) => (
                      <div key={`line-${i}-${j}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: sec.color }}
                        />
                        {line}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Bull/Bear Summary for NVDA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-emerald-400" />
            <p className="text-sm font-medium text-emerald-300">NVDA Bull Case — $1,250 PT</p>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {[
              "Blackwell GPU demand significantly exceeds supply through 2026",
              "Data center AI capex cycle accelerates beyond current estimates",
              "CUDA moat deepens; software stack differentiation grows",
              "Sovereign AI / government orders add incremental $8B+ revenue",
              "Margins expand as Blackwell yields improve and mix shifts",
            ].map((b, i) => (
              <li key={`bull-${i}`} className="flex items-start gap-2">
                <TrendingUp size={11} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={15} className="text-red-400" />
            <p className="text-sm font-medium text-red-300">NVDA Bear Case — $600 PT</p>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {[
              "Export restrictions expand to additional GPU products/markets",
              "Hyperscaler custom silicon (TPU, Trainium) gains significant share",
              "AI capex cycle peaks; enterprise spend disappoints in 2H 2026",
              "AMD MI400 achieves competitive performance at lower price points",
              "Inventory digestion cycle hits Q2–Q3 causing guide-down",
            ].map((b, i) => (
              <li key={`bear-${i}`} className="flex items-start gap-2">
                <TrendingDown size={11} className="text-red-400 mt-0.5 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Catalyst Calendar */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={15} className="text-amber-400" />
          <p className="text-sm font-medium text-foreground">Catalyst Calendar — {TICKER}</p>
        </div>
        <div className="space-y-2">
          {CATALYSTS.map((cat, i) => (
            <div key={`cat-${i}`} className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-muted-foreground w-14 flex-shrink-0">{cat.date}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full font-medium flex-shrink-0",
                  cat.type === "earnings"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : cat.type === "product"
                    ? "bg-primary/20 text-primary"
                    : cat.type === "regulatory"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-muted/40 text-muted-foreground"
                )}
              >
                {cat.type}
              </span>
              <span className="text-muted-foreground flex-1">{cat.event}</span>
              <span
                className={cn(
                  "font-medium flex-shrink-0",
                  cat.impact === "High" ? "text-red-400" : cat.impact === "Medium" ? "text-amber-400" : "text-muted-foreground"
                )}
              >
                {cat.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Analyst Ratings ───────────────────────────────────────────────────────
function AnalystRatingsTab() {
  const avgPT = Math.round(ANALYST_RATINGS.reduce((a, r) => a + r.priceTarget, 0) / ANALYST_RATINGS.length);
  const implied = (((avgPT - CURRENT_PRICE) / CURRENT_PRICE) * 100).toFixed(1);
  const highPT = Math.max(...ANALYST_RATINGS.map((r) => r.priceTarget));
  const lowPT = Math.min(...ANALYST_RATINGS.map((r) => r.priceTarget));

  // Earnings revision momentum (synthetic)
  const revisionData = [
    { period: "8w ago", revision: 0 },
    { period: "6w ago", revision: 2 },
    { period: "4w ago", revision: 8 },
    { period: "2w ago", revision: 14 },
    { period: "Now", revision: 18 },
  ];

  const revW = 320;
  const revH = 120;
  const revPadL = 40;
  const revPadB = 28;
  const revChartW = revW - revPadL - 16;
  const revChartH = revH - revPadB - 16;

  const revMax = 20;
  const revPoints = revisionData.map((d, i) => ({
    x: revPadL + (i / (revisionData.length - 1)) * revChartW,
    y: 16 + revChartH - (Math.max(0, d.revision) / revMax) * revChartH,
  }));
  const revPath = revPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Price Target", value: `$${avgPT}`, sub: `${implied}% upside`, color: "text-emerald-400" },
          { label: "High Target", value: `$${highPT}`, sub: "Morgan Stanley", color: "text-emerald-300" },
          { label: "Low Target", value: `$${lowPT}`, sub: "RBC Capital", color: "text-red-400" },
          { label: "Coverage", value: `${ANALYST_RATINGS.length}`, sub: "sell-side analysts", color: "text-muted-foreground" },
        ].map((stat, i) => (
          <div key={`stat-${i}`} className="rounded-md bg-muted/50 border border-border/50 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={cn("text-xl font-medium", stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Rating distribution */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <RatingDistributionChart ratings={ANALYST_RATINGS} />
      </div>

      {/* Individual ratings table */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star size={15} className="text-amber-400" />
          <p className="text-sm font-medium text-foreground">Individual Analyst Ratings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Firm</th>
                <th className="text-left py-2 px-2 font-medium">Analyst</th>
                <th className="text-center py-2 px-2 font-medium">Rating</th>
                <th className="text-right py-2 px-2 font-medium">Price Target</th>
                <th className="text-right py-2 px-2 font-medium">Implied ±</th>
                <th className="text-right py-2 px-2 font-medium">Date</th>
                <th className="text-right py-2 pl-2 font-medium">12M Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {ANALYST_RATINGS.map((r, i) => {
                const pctDiff = (((r.priceTarget - CURRENT_PRICE) / CURRENT_PRICE) * 100).toFixed(1);
                const isUp = r.priceTarget > CURRENT_PRICE;
                return (
                  <tr key={`rating-${i}`} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="py-2 pr-3 text-foreground font-medium">{r.firm}</td>
                    <td className="py-2 px-2 text-muted-foreground">{r.analyst}</td>
                    <td className="py-2 px-2 text-center">
                      <RatingBadge rating={r.rating} />
                    </td>
                    <td className="py-2 px-2 text-right text-foreground font-mono font-medium">${r.priceTarget}</td>
                    <td className={cn("py-2 px-2 text-right font-mono", isUp ? "text-emerald-400" : "text-red-400")}>
                      {isUp ? "+" : ""}{pctDiff}%
                    </td>
                    <td className="py-2 px-2 text-right text-muted-foreground">{r.date}</td>
                    <td className="py-2 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              r.accuracy >= 65 ? "bg-emerald-500" : r.accuracy >= 55 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${r.accuracy}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "font-mono",
                            r.accuracy >= 65 ? "text-emerald-400" : r.accuracy >= 55 ? "text-amber-400" : "text-red-400"
                          )}
                        >
                          {r.accuracy}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Target Accuracy chart */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-rose-400" />
          <p className="text-sm font-medium text-foreground">12-Month Price Target Accuracy by Firm</p>
        </div>
        <PriceTargetAccuracyChart ratings={ANALYST_RATINGS} />
      </div>

      {/* Earnings Revision Momentum */}
      <div className="rounded-md bg-muted/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-emerald-400" />
          <p className="text-sm font-medium text-foreground">EPS Estimate Revision Momentum</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Count of upward EPS estimate revisions minus downward revisions over rolling 8-week window. Rising = positive momentum.
        </p>
        <svg width={revW} height={revH}>
          {/* Zero line */}
          <line
            x1={revPadL}
            y1={16 + revChartH}
            x2={revW - 16}
            y2={16 + revChartH}
            stroke="#334155"
            strokeWidth={1}
          />
          {/* Y labels */}
          {[0, 10, 20].map((v) => {
            const y = 16 + revChartH - (v / revMax) * revChartH;
            return (
              <text key={`ry-${v}`} x={revPadL - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
                {v}
              </text>
            );
          })}
          {/* Fill area */}
          <path
            d={`${revPath} L ${revPoints[revPoints.length - 1].x} ${16 + revChartH} L ${revPoints[0].x} ${16 + revChartH} Z`}
            fill="#22c55e22"
          />
          {/* Line */}
          <path d={revPath} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {/* Points */}
          {revPoints.map((p, i) => (
            <circle key={`rp-${i}`} cx={p.x} cy={p.y} r={3.5} fill="#22c55e" />
          ))}
          {/* X labels */}
          {revisionData.map((d, i) => (
            <text
              key={`rx-${i}`}
              x={revPoints[i].x}
              y={16 + revChartH + 18}
              textAnchor="middle"
              fill="#64748b"
              fontSize={9}
            >
              {d.period}
            </text>
          ))}
          <text x={revW - 16} y={revPoints[revPoints.length - 1].y - 6} textAnchor="end" fill="#22c55e" fontSize={10} fontWeight={700}>
            +{revisionData[revisionData.length - 1].revision} net
          </text>
        </svg>

        {/* Contrarian note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 text-xs text-indigo-300">
          <Minus size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            <strong>Contrarian signal:</strong> When consensus is overwhelmingly bullish (80%+ Buy ratings)
            and revisions are near peak, the stock often prices in perfection. Monitor for any
            earnings miss or guide-down that could trigger a rapid de-rating. Contrarian investors
            look for stocks with 40–60% Buy ratings where the narrative is improving but not yet crowded.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function EquityResearchPage() {
  return (
    <div className="min-h-screen bg-card text-foreground p-4 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-l-4 border-l-primary rounded-lg bg-card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={20} className="text-indigo-400" />
                <h1 className="text-lg font-medium text-foreground">Equity Research</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Process, financial modeling, valuation methodology, and analyst dynamics —
                illustrated with <span className="text-indigo-300 font-medium">{TICKER}</span> as a live case study.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold text-foreground">${CURRENT_PRICE.toFixed(2)}</p>
              <p className="text-xs text-emerald-400">Avg PT: ${BASE_PT} (+{(((BASE_PT - CURRENT_PRICE) / CURRENT_PRICE) * 100).toFixed(1)}%)</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="process" className="mt-8">
          <TabsList className="bg-muted/60 border border-border/50 flex flex-wrap h-auto gap-1 p-1">
            {[
              { value: "process", label: "Research Process", icon: <Search size={13} /> },
              { value: "modeling", label: "Financial Modeling", icon: <BarChart3 size={13} /> },
              { value: "valuation", label: "Valuation", icon: <DollarSign size={13} /> },
              { value: "report", label: "Report Structure", icon: <FileText size={13} /> },
              { value: "ratings", label: "Analyst Ratings", icon: <Star size={13} /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="process" className="data-[state=inactive]:hidden">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResearchProcessTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="modeling" className="data-[state=inactive]:hidden">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FinancialModelingTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="valuation" className="data-[state=inactive]:hidden">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ValuationTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="report" className="data-[state=inactive]:hidden">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ReportStructureTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="ratings" className="data-[state=inactive]:hidden">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnalystRatingsTab />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
