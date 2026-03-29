"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Zap,
  TrendingUp,
  Shield,
  DollarSign,
  Percent,
  Activity,
  Globe,
  BarChart3,
  Wifi,
  Truck,
  Plane,
  Droplets,
  Server,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 792;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssetType {
  name: string;
  icon: React.ReactNode;
  risk: "Core" | "Core+" | "Value-Add" | "Opportunistic";
  yieldPct: number;
  totalReturn: number;
  inflationLink: "Strong" | "Moderate" | "Weak";
  regulated: boolean;
  monopoly: boolean;
  cashFlowVis: "Very High" | "High" | "Medium" | "Low";
  description: string;
  examples: string;
}

interface ValuationMethod {
  name: string;
  shortName: string;
  typical: string;
  description: string;
  pros: string;
  cons: string;
  usedFor: string[];
}

interface CorrelationEntry {
  asset: string;
  correlation: number;
  color: string;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const ASSET_TYPES: AssetType[] = [
  {
    name: "Regulated Utilities",
    icon: <Zap size={18} />,
    risk: "Core",
    yieldPct: 4.2,
    totalReturn: 7.1,
    inflationLink: "Strong",
    regulated: true,
    monopoly: true,
    cashFlowVis: "Very High",
    description: "Electric, gas, and water utilities with rate-of-return regulation. Revenues tied to regulated asset base (RAB).",
    examples: "National Grid, American Electric Power, Eversource",
  },
  {
    name: "Toll Roads",
    icon: <Truck size={18} />,
    risk: "Core",
    yieldPct: 3.8,
    totalReturn: 8.4,
    inflationLink: "Strong",
    regulated: false,
    monopoly: true,
    cashFlowVis: "Very High",
    description: "Concession-based roads with long-term contracts. Traffic volume drives revenue; toll escalators often linked to CPI.",
    examples: "Transurban, Atlas Arteria, Abertis",
  },
  {
    name: "Airports",
    icon: <Plane size={18} />,
    risk: "Core+",
    yieldPct: 3.1,
    totalReturn: 9.2,
    inflationLink: "Moderate",
    regulated: true,
    monopoly: true,
    cashFlowVis: "High",
    description: "Aeronautical and commercial revenue streams. Regulated aero charges; commercial revenues more cyclical.",
    examples: "Sydney Airport, Zurich Airport, AENA",
  },
  {
    name: "Water & Wastewater",
    icon: <Droplets size={18} />,
    risk: "Core",
    yieldPct: 4.5,
    totalReturn: 6.8,
    inflationLink: "Strong",
    regulated: true,
    monopoly: true,
    cashFlowVis: "Very High",
    description: "Essential municipal service with regulated returns. Very low demand elasticity; capital-intensive upgrade cycles.",
    examples: "American Water Works, Veolia, Pennon Group",
  },
  {
    name: "Pipelines & Midstream",
    icon: <Activity size={18} />,
    risk: "Core+",
    yieldPct: 5.6,
    totalReturn: 9.8,
    inflationLink: "Moderate",
    regulated: false,
    monopoly: false,
    cashFlowVis: "High",
    description: "Fee-based contracts for gas and liquids transport. Volumes more stable than commodity prices; contract duration key.",
    examples: "Enterprise Products, Kinder Morgan, TC Energy",
  },
  {
    name: "Data Centers",
    icon: <Server size={18} />,
    risk: "Value-Add",
    yieldPct: 3.4,
    totalReturn: 13.5,
    inflationLink: "Weak",
    regulated: false,
    monopoly: false,
    cashFlowVis: "High",
    description: "Digital infrastructure with long-term leases (10–20 yr). Power-hungry; location, fiber density, and latency are moats.",
    examples: "Equinix, Digital Realty, Iron Mountain",
  },
  {
    name: "Ports & Terminals",
    icon: <Globe size={18} />,
    risk: "Core+",
    yieldPct: 3.6,
    totalReturn: 8.9,
    inflationLink: "Moderate",
    regulated: false,
    monopoly: false,
    cashFlowVis: "High",
    description: "Container and bulk handling concessions. Throughput linked to global trade; strategic location creates barriers to entry.",
    examples: "APM Terminals, DP World, Hutchison Ports",
  },
  {
    name: "Telecom Towers",
    icon: <Wifi size={18} />,
    risk: "Core+",
    yieldPct: 2.9,
    totalReturn: 11.2,
    inflationLink: "Moderate",
    regulated: false,
    monopoly: false,
    cashFlowVis: "Very High",
    description: "Long-term leases to MNOs (10–30 yr). Escalators typically 2–3% per annum; tower density and 5G rollout drive demand.",
    examples: "American Tower, Crown Castle, SBA Communications",
  },
];

const VALUATION_METHODS: ValuationMethod[] = [
  {
    name: "Discounted Cash Flow",
    shortName: "DCF",
    typical: "Discount rate: 6–9%",
    description: "Forecast long-duration free cash flows and discount at WACC reflecting infrastructure risk premium. Terminal value captures perpetuity nature.",
    pros: "Captures long concession life; flexible for complex cash flow profiles",
    cons: "Sensitive to discount rate assumption; terminal value dominates",
    usedFor: ["Airports", "Toll Roads", "Utilities"],
  },
  {
    name: "EV / EBITDA Multiple",
    shortName: "EV/EBITDA",
    typical: "15×–25× for core",
    description: "Enterprise value relative to earnings before interest, taxes, depreciation, amortization. EBITDA margin for regulated assets is typically 55–75%.",
    pros: "Simple comparison across listed peers; market-tested",
    cons: "Misses capex intensity; EBITDA inflated by high D&A",
    usedFor: ["Data Centers", "Pipelines", "Towers"],
  },
  {
    name: "Regulated Asset Base",
    shortName: "RAB Multiple",
    typical: "1.1×–1.5× RAB",
    description: "Price paid relative to the regulated book value of assets. Regulators set allowed return on RAB; premium above 1× reflects outperformance potential.",
    pros: "Directly reflects regulatory framework; intuitive floor value",
    cons: "Only applicable to regulated assets; RAB can be disputed",
    usedFor: ["Utilities", "Water", "Gas Networks"],
  },
  {
    name: "Dividend Discount Model",
    shortName: "DDM",
    typical: "Yield + growth: 7–9%",
    description: "Present value of forecast dividends. Infrastructure companies often adopt explicit dividend growth policies (CPI+1–2%).",
    pros: "Intuitive for income-oriented investors; easy to stress-test",
    cons: "Dividend policy choices distort; ignores balance sheet",
    usedFor: ["Listed Utilities", "Listed Airports", "REITs"],
  },
];

const RISK_COLORS: Record<string, string> = {
  Core: "#22c55e",
  "Core+": "#3b82f6",
  "Value-Add": "#f59e0b",
  Opportunistic: "#ef4444",
};

// ── Subcomponents ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-start gap-3">
          <div
            className="rounded-lg p-2 flex items-center justify-center"
            style={{ background: color + "22" }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Risk-Return Spectrum SVG ───────────────────────────────────────────────────

function RiskReturnChart() {
  const W = 560;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 48, left: 52 };

  const xMin = 2;
  const xMax = 18;
  const yMin = 3;
  const yMax = 17;

  const toX = (risk: number) =>
    PAD.left + ((risk - xMin) / (xMax - xMin)) * (W - PAD.left - PAD.right);
  const toY = (ret: number) =>
    H - PAD.bottom - ((ret - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);

  // risk (x-axis volatility proxy 2–18%), return (y-axis total %)
  const points: { label: string; x: number; y: number; color: string }[] = [
    { label: "Regulated Utilities", x: 4, y: 7.1, color: RISK_COLORS["Core"] },
    { label: "Toll Roads", x: 5, y: 8.4, color: RISK_COLORS["Core"] },
    { label: "Water/Wastewater", x: 3.5, y: 6.8, color: RISK_COLORS["Core"] },
    { label: "Airports", x: 7, y: 9.2, color: RISK_COLORS["Core+"] },
    { label: "Pipelines", x: 8, y: 9.8, color: RISK_COLORS["Core+"] },
    { label: "Telecom Towers", x: 6, y: 11.2, color: RISK_COLORS["Core+"] },
    { label: "Ports", x: 9, y: 8.9, color: RISK_COLORS["Core+"] },
    { label: "Data Centers", x: 12, y: 13.5, color: RISK_COLORS["Value-Add"] },
    { label: "Opportunistic Infra", x: 16, y: 15.5, color: RISK_COLORS["Opportunistic"] },
    { label: "Global Equities", x: 15, y: 10.5, color: "#94a3b8" },
    { label: "IG Bonds", x: 3, y: 4.5, color: "#94a3b8" },
  ];

  const xTicks = [4, 6, 8, 10, 12, 14, 16];
  const yTicks = [4, 6, 8, 10, 12, 14, 16];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid lines */}
      {xTicks.map((v) => (
        <line
          key={`xg-${v}`}
          x1={toX(v)}
          y1={PAD.top}
          x2={toX(v)}
          y2={H - PAD.bottom}
          stroke="#334155"
          strokeWidth={0.5}
        />
      ))}
      {yTicks.map((v) => (
        <line
          key={`yg-${v}`}
          x1={PAD.left}
          y1={toY(v)}
          x2={W - PAD.right}
          y2={toY(v)}
          stroke="#334155"
          strokeWidth={0.5}
        />
      ))}

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#475569" strokeWidth={1} />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#475569" strokeWidth={1} />

      {/* Axis labels */}
      {xTicks.map((v) => (
        <text key={`xl-${v}`} x={toX(v)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill="#64748b">
          {v}%
        </text>
      ))}
      {yTicks.map((v) => (
        <text key={`yl-${v}`} x={PAD.left - 8} y={toY(v) + 3} textAnchor="end" fontSize={9} fill="#64748b">
          {v}%
        </text>
      ))}

      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#94a3b8">
        Risk (Volatility proxy)
      </text>
      <text
        x={12}
        y={H / 2}
        textAnchor="middle"
        fontSize={10}
        fill="#94a3b8"
        transform={`rotate(-90, 12, ${H / 2})`}
      >
        Expected Return
      </text>

      {/* Efficient frontier curve */}
      <path
        d={`M ${toX(3)} ${toY(5.5)} Q ${toX(8)} ${toY(9)} ${toX(16)} ${toY(15.5)}`}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.5}
        strokeDasharray="5 3"
        opacity={0.4}
      />

      {/* Data points */}
      {points.map((pt) => (
        <g key={pt.label}>
          <circle
            cx={toX(pt.x)}
            cy={toY(pt.y)}
            r={5}
            fill={pt.color}
            opacity={0.85}
          />
          <text
            x={toX(pt.x) + 7}
            y={toY(pt.y) + 4}
            fontSize={8}
            fill="#cbd5e1"
          >
            {pt.label}
          </text>
        </g>
      ))}

      {/* Legend */}
      {(["Core", "Core+", "Value-Add", "Opportunistic"] as const).map((r, i) => (
        <g key={r} transform={`translate(${PAD.left + i * 130}, ${H - 8})`}>
          <circle cx={0} cy={0} r={4} fill={RISK_COLORS[r]} />
          <text x={7} y={4} fontSize={8} fill="#94a3b8">
            {r}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Cash Flow Stability SVG ────────────────────────────────────────────────────

function CashFlowStabilityChart() {
  const W = 520;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 48, left: 52 };

  const categories = [
    { label: "Regulated\nUtilities", vol: 5.2, color: "#22c55e" },
    { label: "Toll\nRoads", vol: 7.8, color: "#22c55e" },
    { label: "Airports", vol: 14.5, color: "#3b82f6" },
    { label: "Data\nCenters", vol: 18.2, color: "#f59e0b" },
    { label: "Pipelines", vol: 11.1, color: "#3b82f6" },
    { label: "IG\nBonds", vol: 5.9, color: "#94a3b8" },
    { label: "Global\nEquities", vol: 16.8, color: "#94a3b8" },
    { label: "Commodities", vol: 23.4, color: "#94a3b8" },
  ];

  const maxVol = 25;
  const barW = (W - PAD.left - PAD.right) / categories.length - 6;

  const toH = (v: number) =>
    ((v / maxVol) * (H - PAD.top - PAD.bottom));

  const yTicks = [0, 5, 10, 15, 20, 25];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {yTicks.map((v) => (
        <line
          key={`yg-${v}`}
          x1={PAD.left}
          y1={H - PAD.bottom - (v / maxVol) * (H - PAD.top - PAD.bottom)}
          x2={W - PAD.right}
          y2={H - PAD.bottom - (v / maxVol) * (H - PAD.top - PAD.bottom)}
          stroke="#334155"
          strokeWidth={0.5}
        />
      ))}

      {/* Y-axis ticks */}
      {yTicks.map((v) => (
        <text
          key={`yl-${v}`}
          x={PAD.left - 6}
          y={H - PAD.bottom - (v / maxVol) * (H - PAD.top - PAD.bottom) + 3}
          textAnchor="end"
          fontSize={9}
          fill="#64748b"
        >
          {v}%
        </text>
      ))}

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#475569" strokeWidth={1} />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#475569" strokeWidth={1} />

      {/* Bars */}
      {categories.map((cat, i) => {
        const x = PAD.left + i * ((W - PAD.left - PAD.right) / categories.length) + 3;
        const barHeight = toH(cat.vol);
        const y = H - PAD.bottom - barHeight;
        return (
          <g key={cat.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barHeight}
              fill={cat.color}
              opacity={0.75}
              rx={2}
            />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={8} fill="#e2e8f0">
              {cat.vol}%
            </text>
            {cat.label.split("\n").map((line, li) => (
              <text
                key={li}
                x={x + barW / 2}
                y={H - PAD.bottom + 12 + li * 10}
                textAnchor="middle"
                fontSize={8}
                fill="#94a3b8"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Y-axis label */}
      <text
        x={12}
        y={H / 2}
        textAnchor="middle"
        fontSize={9}
        fill="#94a3b8"
        transform={`rotate(-90, 12, ${H / 2})`}
      >
        Annualised Volatility
      </text>
    </svg>
  );
}

// ── Correlation Matrix SVG ─────────────────────────────────────────────────────

function CorrelationMatrix() {
  const assets = ["Infra", "Equities", "Bonds", "REITs", "Commodities", "PrivEq"];
  const matrix = [
    [1.00,  0.42,  0.18,  0.55,  0.28,  0.38],
    [0.42,  1.00,  -0.10, 0.62,  0.35,  0.71],
    [0.18, -0.10,  1.00,  0.14, -0.05,  0.05],
    [0.55,  0.62,  0.14,  1.00,  0.24,  0.52],
    [0.28,  0.35, -0.05,  0.24,  1.00,  0.31],
    [0.38,  0.71,  0.05,  0.52,  0.31,  1.00],
  ];

  const cellSize = 68;
  const labelW = 62;
  const W = labelW + assets.length * cellSize + 10;
  const H = labelW + assets.length * cellSize + 10;

  const getColor = (v: number) => {
    if (v >= 0.9) return "#1e3a5f";
    if (v >= 0.6) return "#1d4ed8";
    if (v >= 0.4) return "#3b82f6";
    if (v >= 0.2) return "#60a5fa";
    if (v >= 0) return "#bfdbfe";
    if (v >= -0.1) return "#fef3c7";
    return "#fca5a5";
  };

  const getTextColor = (v: number) => (v >= 0.4 ? "#ffffff" : "#1e293b");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxWidth: 480 }}>
      {/* Column headers */}
      {assets.map((a, j) => (
        <text
          key={`ch-${j}`}
          x={labelW + j * cellSize + cellSize / 2}
          y={labelW - 6}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
          fontWeight={500}
        >
          {a}
        </text>
      ))}
      {/* Row headers */}
      {assets.map((a, i) => (
        <text
          key={`rh-${i}`}
          x={labelW - 6}
          y={labelW + i * cellSize + cellSize / 2 + 4}
          textAnchor="end"
          fontSize={10}
          fill="#94a3b8"
          fontWeight={500}
        >
          {a}
        </text>
      ))}
      {/* Cells */}
      {matrix.map((row, i) =>
        row.map((val, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={labelW + j * cellSize + 1}
              y={labelW + i * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              fill={getColor(val)}
              rx={3}
            />
            <text
              x={labelW + j * cellSize + cellSize / 2}
              y={labelW + i * cellSize + cellSize / 2 + 4}
              textAnchor="middle"
              fontSize={10}
              fill={getTextColor(val)}
              fontWeight={600}
            >
              {val.toFixed(2)}
            </text>
          </g>
        ))
      )}
    </svg>
  );
}

// ── Yield vs Duration SVG ─────────────────────────────────────────────────────

function YieldDurationChart() {
  const W = 480;
  const H = 220;
  const PAD = { top: 16, right: 20, bottom: 40, left: 44 };

  // [concession years, current yield %]
  const points = [
    { label: "Water", x: 50, y: 4.5, color: "#22c55e" },
    { label: "Regulated Util.", x: 30, y: 4.2, color: "#22c55e" },
    { label: "Toll Road", x: 25, y: 3.8, color: "#3b82f6" },
    { label: "Airport", x: 20, y: 3.1, color: "#3b82f6" },
    { label: "Pipeline", x: 20, y: 5.6, color: "#f59e0b" },
    { label: "Towers", x: 15, y: 2.9, color: "#f59e0b" },
    { label: "Data Center", x: 12, y: 3.4, color: "#ef4444" },
    { label: "Port", x: 18, y: 3.6, color: "#3b82f6" },
  ];

  const xMin = 8;
  const xMax = 55;
  const yMin = 2;
  const yMax = 6.5;

  const toX = (v: number) => PAD.left + ((v - xMin) / (xMax - xMin)) * (W - PAD.left - PAD.right);
  const toY = (v: number) => H - PAD.bottom - ((v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);

  const xTicks = [10, 20, 30, 40, 50];
  const yTicks = [2.5, 3.5, 4.5, 5.5];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {xTicks.map((v) => (
        <line key={`xg-${v}`} x1={toX(v)} y1={PAD.top} x2={toX(v)} y2={H - PAD.bottom} stroke="#334155" strokeWidth={0.5} />
      ))}
      {yTicks.map((v) => (
        <line key={`yg-${v}`} x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="#334155" strokeWidth={0.5} />
      ))}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#475569" strokeWidth={1} />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#475569" strokeWidth={1} />
      {xTicks.map((v) => (
        <text key={`xl-${v}`} x={toX(v)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill="#64748b">{v}yr</text>
      ))}
      {yTicks.map((v) => (
        <text key={`yl-${v}`} x={PAD.left - 6} y={toY(v) + 3} textAnchor="end" fontSize={9} fill="#64748b">{v}%</text>
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">Concession / Asset Life (years)</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(-90, 10, ${H / 2})`}>Current Yield</text>
      {points.map((pt) => (
        <g key={pt.label}>
          <circle cx={toX(pt.x)} cy={toY(pt.y)} r={5} fill={pt.color} opacity={0.85} />
          <text x={toX(pt.x) + 7} y={toY(pt.y) + 4} fontSize={8} fill="#cbd5e1">{pt.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InfrastructurePage() {
  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [selectedValuation, setSelectedValuation] = useState<ValuationMethod | null>(null);

  // Use rand() to generate slight per-session variation in a metric
  const _unusedRand = useMemo(() => rand(), []);

  const riskBadgeColor: Record<string, string> = {
    Core: "bg-green-500/20 text-green-400 border-green-500/30",
    "Core+": "bg-primary/20 text-primary border-border",
    "Value-Add": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Opportunistic: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const inflinkBadge: Record<string, string> = {
    Strong: "bg-green-500/15 text-green-400",
    Moderate: "bg-amber-500/15 text-amber-400",
    Weak: "bg-red-500/15 text-red-400",
  };

  const cfvisBadge: Record<string, string> = {
    "Very High": "bg-emerald-500/15 text-emerald-400",
    High: "bg-primary/15 text-primary",
    Medium: "bg-amber-500/15 text-amber-400",
    Low: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 size={24} className="text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Real Assets &amp; Infrastructure
            </h1>
            <p className="text-sm text-muted-foreground">
              Airports, toll roads, utilities, data centers — long-duration, inflation-linked cash flows
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Key Metrics — Hero ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
        <MetricCard
          icon={<DollarSign size={18} />}
          label="Global Infra AUM"
          value="$1.3T"
          sub="Listed + unlisted (2025)"
          color="#3b82f6"
        />
        <MetricCard
          icon={<Percent size={18} />}
          label="Avg Core Yield"
          value="4.1%"
          sub="Dividend / distribution yield"
          color="#22c55e"
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Inflation Correlation"
          value="+0.68"
          sub="vs CPI over 20yr rolling"
          color="#f59e0b"
        />
        <MetricCard
          icon={<Shield size={18} />}
          label="Equity Beta"
          value="0.55"
          sub="Listed infra vs MSCI World"
          color="#a855f7"
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="asset-types">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="asset-types">Asset Types</TabsTrigger>
          <TabsTrigger value="return-profile">Return Profile</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="portfolio-role">Portfolio Role</TabsTrigger>
        </TabsList>

        {/* ── Tab: Asset Types ── */}
        <TabsContent value="asset-types" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Infrastructure Universe — Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Asset Class</th>
                      <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">Risk</th>
                      <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">Yield</th>
                      <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">Total Ret.</th>
                      <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">Inflation Link</th>
                      <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">Regulated</th>
                      <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">CF Visibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ASSET_TYPES.map((asset, i) => (
                      <tr
                        key={asset.name}
                        className={`border-b border-border/50 cursor-pointer transition-colors ${selectedAsset?.name === asset.name ? "bg-primary/10" : i % 2 === 0 ? "bg-transparent" : "bg-muted/10"} hover:bg-muted/20`}
                        onClick={() => setSelectedAsset(selectedAsset?.name === asset.name ? null : asset)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{asset.icon}</span>
                            <span className="font-medium text-foreground">{asset.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded-full border font-medium ${riskBadgeColor[asset.risk]}`}>
                            {asset.risk}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-foreground">{asset.yieldPct.toFixed(1)}%</td>
                        <td className="px-3 py-3 text-center font-mono text-green-400">{asset.totalReturn.toFixed(1)}%</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded-full ${inflinkBadge[asset.inflationLink]}`}>
                            {asset.inflationLink}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs font-medium ${asset.regulated ? "text-green-400" : "text-muted-foreground"}`}>
                            {asset.regulated ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded-full ${cfvisBadge[asset.cashFlowVis]}`}>
                            {asset.cashFlowVis}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expandable detail panel */}
          {selectedAsset && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="bg-muted/40 border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{selectedAsset.icon}</span>
                    <h3 className="font-semibold text-foreground">{selectedAsset.name}</h3>
                    <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded-full border ${riskBadgeColor[selectedAsset.risk]}`}>
                      {selectedAsset.risk}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedAsset.description}</p>
                  <p className="text-xs text-primary">
                    <span className="font-medium">Listed examples:</span> {selectedAsset.examples}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                    <span>Monopoly characteristics: <strong className={selectedAsset.monopoly ? "text-green-400" : "text-amber-400"}>{selectedAsset.monopoly ? "Yes" : "Partial"}</strong></span>
                    <span>Yield: <strong className="text-foreground">{selectedAsset.yieldPct.toFixed(1)}%</strong></span>
                    <span>Total Return: <strong className="text-green-400">{selectedAsset.totalReturn.toFixed(1)}%</strong></span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* ── Tab: Return Profile ── */}
        <TabsContent value="return-profile" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Risk-Return Spectrum</CardTitle>
                  <p className="text-xs text-muted-foreground">Volatility proxy vs expected total return (annualised)</p>
                </CardHeader>
                <CardContent>
                  <RiskReturnChart />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cash Flow Volatility Comparison</CardTitle>
                  <p className="text-xs text-muted-foreground">Annualised volatility of underlying revenues / cash flows</p>
                </CardHeader>
                <CardContent>
                  <CashFlowStabilityChart />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Yield vs Concession Life</CardTitle>
                <p className="text-xs text-muted-foreground">Longer asset life generally supports lower yield (bond-like pricing)</p>
              </CardHeader>
              <CardContent>
                <YieldDurationChart />
              </CardContent>
            </Card>
          </motion.div>

          {/* Return decomposition cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Income Return",
                value: "~4%",
                desc: "Stable dividend / distribution yield from long-term contracted or regulated revenues.",
                color: "#22c55e",
              },
              {
                title: "Capital Growth",
                value: "~3–5%",
                desc: "Driven by RAB growth (capex), traffic/volume growth, and re-rating as interest rates fall.",
                color: "#3b82f6",
              },
              {
                title: "Inflation Uplift",
                value: "+CPI link",
                desc: "Most core infra revenues are contractually or regulatorily linked to CPI or PPI escalators.",
                color: "#f59e0b",
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-4">
                    <div className="text-lg font-medium mb-1" style={{ color: card.color }}>
                      {card.value}
                    </div>
                    <div className="font-medium text-sm text-foreground mb-1">{card.title}</div>
                    <p className="text-xs text-muted-foreground">{card.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Valuation ── */}
        <TabsContent value="valuation" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VALUATION_METHODS.map((vm) => (
                <Card
                  key={vm.name}
                  className={`bg-card border-border cursor-pointer transition-all ${selectedValuation?.name === vm.name ? "ring-1 ring-blue-500" : "hover:border-muted-foreground/40"}`}
                  onClick={() => setSelectedValuation(selectedValuation?.name === vm.name ? null : vm)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={16} className="text-muted-foreground/50" />
                        <span className="font-semibold text-foreground">{vm.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs text-muted-foreground font-mono">{vm.shortName}</Badge>
                    </div>
                    <p className="text-xs text-amber-400 font-medium">{vm.typical}</p>
                    <p className="text-xs text-muted-foreground">{vm.description}</p>
                    {selectedValuation?.name === vm.name && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="pt-2 space-y-2 border-t border-border"
                      >
                        <div>
                          <span className="text-xs font-medium text-green-400">Pros: </span>
                          <span className="text-xs text-muted-foreground">{vm.pros}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-red-400">Cons: </span>
                          <span className="text-xs text-muted-foreground">{vm.cons}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {vm.usedFor.map((u) => (
                            <span key={u} className="text-xs bg-muted/40 px-2 py-0.5 rounded text-muted-foreground">{u}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* RAB explainer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-amber-950/20 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-400">Regulated Asset Base (RAB) — Deep Dive</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  The RAB is the book value of capital employed that a regulator recognises for the purpose of setting
                  allowed revenues. Investors pay a <strong className="text-foreground">RAB multiple</strong> to acquire regulated
                  infrastructure — typically 1.1–1.5× depending on the quality of the regulatory framework, asset age,
                  and potential to grow the RAB through capital expenditure.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Allowed Revenue",
                      formula: "WACC × RAB + OpEx + Depreciation + Tax",
                      color: "#22c55e",
                    },
                    {
                      label: "RAB Growth",
                      formula: "RAB(t+1) = RAB(t) + CapEx − Depreciation ± Inflation indexation",
                      color: "#3b82f6",
                    },
                    {
                      label: "Equity Value",
                      formula: "RAB × Multiple − Net Debt",
                      color: "#f59e0b",
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-card p-3 border border-border">
                      <p className="text-xs font-medium mb-1" style={{ color: item.color }}>{item.label}</p>
                      <p className="text-xs font-mono text-foreground/80">{item.formula}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* EV/EBITDA benchmarks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">EV/EBITDA Benchmark Multiples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: "Regulated Utilities", range: "14×–18×", color: "#22c55e", pct: 72 },
                  { name: "Water/Wastewater", range: "16×–22×", color: "#22c55e", pct: 80 },
                  { name: "Toll Roads", range: "18×–25×", color: "#3b82f6", pct: 88 },
                  { name: "Airports", range: "15×–20×", color: "#3b82f6", pct: 76 },
                  { name: "Telecom Towers", range: "22×–30×", color: "#f59e0b", pct: 95 },
                  { name: "Data Centers", range: "20×–28×", color: "#ef4444", pct: 92 },
                  { name: "Pipelines", range: "10×–15×", color: "#a855f7", pct: 56 },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-40 shrink-0">{item.name}</span>
                    <div className="flex-1 bg-muted/30 rounded-full h-2.5 relative overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, background: item.color, opacity: 0.7 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-foreground w-20 text-right">{item.range}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab: Portfolio Role ── */}
        <TabsContent value="portfolio-role" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Correlation Matrix</CardTitle>
                  <p className="text-xs text-muted-foreground">Infrastructure vs other asset classes (20-year estimates)</p>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CorrelationMatrix />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-card border-border h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Portfolio Construction Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      role: "Inflation Hedge",
                      detail: "CPI-linked revenues protect purchasing power. Core infra historically delivered +0.68 correlation to realised CPI over 20-year periods.",
                      color: "#f59e0b",
                      icon: <TrendingUp size={14} />,
                    },
                    {
                      role: "Yield Enhancement",
                      detail: "4–5% distribution yield from long-duration assets, typically partially franked or tax-advantaged via depreciation flows.",
                      color: "#22c55e",
                      icon: <Percent size={14} />,
                    },
                    {
                      role: "Diversification",
                      detail: "Low equity beta (~0.55) and modest bond correlation reduces portfolio drawdowns. Especially valuable in stagflationary environments.",
                      color: "#3b82f6",
                      icon: <Shield size={14} />,
                    },
                    {
                      role: "Illiquidity Premium",
                      detail: "Unlisted infra assets earn 100–250 bps over listed equivalents by locking up capital for 10–20 year fund horizons.",
                      color: "#a855f7",
                      icon: <DollarSign size={14} />,
                    },
                    {
                      role: "Defensive Growth",
                      detail: "RAB growth + capex recycling strategies deliver 6–9% total returns with low drawdown risk — a 'growth with protection' profile.",
                      color: "#ec4899",
                      icon: <Activity size={14} />,
                    },
                  ].map((item) => (
                    <div key={item.role} className="flex gap-3 items-start">
                      <div
                        className="mt-0.5 p-1.5 rounded-md"
                        style={{ background: item.color + "22" }}
                      >
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.role}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Allocation comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Typical Institutional Allocations to Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: "Sovereign Wealth Fund", alloc: 12, note: "Long liabilities match long-duration infra assets" },
                  { type: "Defined Benefit Pension", alloc: 9, note: "Liability-hedging income + real return mandate" },
                  { type: "Endowment / Foundation", alloc: 7, note: "Perpetual capital supports illiquid exposure" },
                  { type: "Insurance Company", alloc: 5, note: "Duration matching + stable income for reserves" },
                  { type: "Retail / HNWI", alloc: 3, note: "Via listed infra funds or unlisted feeder vehicles" },
                ].map((row) => (
                  <div key={row.type} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-44 shrink-0">{row.type}</span>
                    <div className="flex-1 bg-muted/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(row.alloc / 15) * 100}%`, opacity: 0.7 }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-8 text-right">{row.alloc}%</span>
                    <span className="text-xs text-muted-foreground hidden md:block ml-2">{row.note}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Key risks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Key Risks to Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      risk: "Interest Rate Sensitivity",
                      detail: "As bond proxies, infra prices fall when rates rise. Duration can be 15–20+ years for core assets.",
                      severity: "High",
                    },
                    {
                      risk: "Regulatory Reset Risk",
                      detail: "Regulators can reduce allowed returns at 5-year review cycles. Framework quality varies by jurisdiction.",
                      severity: "Medium",
                    },
                    {
                      risk: "Political / Nationalisation",
                      detail: "Governments may renationalise assets, especially utilities and water in fiscal stress.",
                      severity: "Medium",
                    },
                    {
                      risk: "Technology Disruption",
                      detail: "Data centers face power availability constraints; toll roads face EV/AV uncertainty; airports face SAF cost pressures.",
                      severity: "Low–Medium",
                    },
                    {
                      risk: "Currency Risk (international)",
                      detail: "Overseas infra assets expose investors to FX translation risk unless hedged.",
                      severity: "Medium",
                    },
                    {
                      risk: "Leverage / Refinancing Risk",
                      detail: "Infrastructure is typically 50–70% debt-funded. Rising rates at refinancing increase WACC and dilute equity returns.",
                      severity: "High",
                    },
                  ].map((item) => (
                    <div
                      key={item.risk}
                      className="rounded-lg bg-muted/20 border border-border p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{item.risk}</span>
                        <Badge
                          variant="outline"
                          className={
                            item.severity === "High"
                              ? "border-red-500/40 text-red-400 text-xs"
                              : item.severity === "Medium"
                              ? "border-amber-500/40 text-amber-400 text-xs"
                              : "border-green-500/40 text-green-400 text-xs"
                          }
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Footer action ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-end"
      >
        <Button variant="outline" size="sm" className="text-xs text-muted-foreground border-border">
          <Globe size={13} className="mr-1.5" />
          Data: MSCI, OECD Infrastructure Hub, GRESB 2025
        </Button>
      </motion.div>
    </div>
  );
}
