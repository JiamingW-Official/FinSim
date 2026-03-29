"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe,
  Smartphone,
  Shield,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Percent,
  Building,
  Heart,
  BookOpen,
  Wifi,
  CreditCard,
  MapPin,
  Clock,
  RefreshCw,
  Calculator,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 865;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const NOISE = Array.from({ length: 300 }, () => rand());

// ── Interfaces ────────────────────────────────────────────────────────────────

interface MFIType {
  type: string;
  description: string;
  regulated: boolean;
  avgLoanSize: number;
  clients: string;
  profitMotif: boolean;
}

interface RegionLoanData {
  region: string;
  avgLoanUSD: number;
  color: string;
}

interface MFIComparison {
  name: string;
  country: string;
  par30: number;
  par90: number;
  oss: number;
  yieldOnPortfolio: number;
  costOfFunds: number;
  costPerBorrower: number;
  activeClients: number;
}

interface ImpactMetric {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}

interface MPesaDataPoint {
  year: number;
  penetration: number;
  users: number;
}

interface RTCEvidence {
  study: string;
  location: string;
  finding: string;
  positive: boolean;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const MFI_TYPES: MFIType[] = [
  {
    type: "NGO-MFI",
    description: "Non-profit focused on mission; subsidized by donors",
    regulated: false,
    avgLoanSize: 420,
    clients: "Ultra-poor, first-time borrowers",
    profitMotif: false,
  },
  {
    type: "NBFI",
    description: "Non-bank financial institution; deposit-taking in some countries",
    regulated: true,
    avgLoanSize: 1200,
    clients: "Micro-entrepreneurs, small businesses",
    profitMotif: true,
  },
  {
    type: "Commercial Bank",
    description: "Downscaled bank with dedicated microfinance window",
    regulated: true,
    avgLoanSize: 3500,
    clients: "Small & medium enterprises (SMEs)",
    profitMotif: true,
  },
  {
    type: "Cooperative / Credit Union",
    description: "Member-owned, democratic governance, reinvests surplus",
    regulated: false,
    avgLoanSize: 650,
    clients: "Rural farmers, informal workers",
    profitMotif: false,
  },
];

const REGION_LOAN_DATA: RegionLoanData[] = [
  { region: "Sub-Saharan Africa", avgLoanUSD: 310, color: "#f59e0b" },
  { region: "South Asia", avgLoanUSD: 185, color: "#10b981" },
  { region: "East Asia & Pacific", avgLoanUSD: 2100, color: "#3b82f6" },
  { region: "Latin America", avgLoanUSD: 1850, color: "#8b5cf6" },
  { region: "MENA", avgLoanUSD: 790, color: "#ef4444" },
  { region: "Eastern Europe", avgLoanUSD: 3200, color: "#06b6d4" },
];

const MFI_TABLE: MFIComparison[] = [
  {
    name: "Grameen Bank",
    country: "Bangladesh",
    par30: 3.2,
    par90: 1.1,
    oss: 112,
    yieldOnPortfolio: 18.5,
    costOfFunds: 7.2,
    costPerBorrower: 28,
    activeClients: 9400000,
  },
  {
    name: "BRAC",
    country: "Bangladesh",
    par30: 2.7,
    par90: 0.9,
    oss: 118,
    yieldOnPortfolio: 22.0,
    costOfFunds: 8.1,
    costPerBorrower: 32,
    activeClients: 7200000,
  },
  {
    name: "BancoSol",
    country: "Bolivia",
    par30: 4.5,
    par90: 2.0,
    oss: 135,
    yieldOnPortfolio: 28.0,
    costOfFunds: 10.5,
    costPerBorrower: 95,
    activeClients: 320000,
  },
  {
    name: "Compartamos",
    country: "Mexico",
    par30: 5.1,
    par90: 2.4,
    oss: 162,
    yieldOnPortfolio: 68.0,
    costOfFunds: 12.0,
    costPerBorrower: 110,
    activeClients: 3100000,
  },
  {
    name: "FINCA International",
    country: "Global",
    par30: 6.2,
    par90: 3.1,
    oss: 104,
    yieldOnPortfolio: 32.0,
    costOfFunds: 9.8,
    costPerBorrower: 78,
    activeClients: 1800000,
  },
  {
    name: "ASA",
    country: "Bangladesh",
    par30: 1.8,
    par90: 0.6,
    oss: 125,
    yieldOnPortfolio: 19.0,
    costOfFunds: 6.5,
    costPerBorrower: 22,
    activeClients: 5600000,
  },
  {
    name: "SKS / Bharat Financial",
    country: "India",
    par30: 8.9,
    par90: 5.3,
    oss: 98,
    yieldOnPortfolio: 24.5,
    costOfFunds: 11.2,
    costPerBorrower: 55,
    activeClients: 4200000,
  },
  {
    name: "LAPO MFB",
    country: "Nigeria",
    par30: 7.4,
    par90: 3.8,
    oss: 109,
    yieldOnPortfolio: 44.0,
    costOfFunds: 14.0,
    costPerBorrower: 48,
    activeClients: 980000,
  },
];

const MPESA_DATA: MPesaDataPoint[] = [
  { year: 2007, penetration: 2, users: 0.5 },
  { year: 2008, penetration: 10, users: 5.0 },
  { year: 2009, penetration: 22, users: 9.5 },
  { year: 2010, penetration: 38, users: 14.0 },
  { year: 2011, penetration: 51, users: 17.0 },
  { year: 2012, penetration: 62, users: 19.5 },
  { year: 2013, penetration: 68, users: 22.0 },
  { year: 2014, penetration: 73, users: 24.0 },
  { year: 2015, penetration: 78, users: 26.0 },
  { year: 2016, penetration: 80, users: 27.5 },
  { year: 2017, penetration: 82, users: 29.0 },
  { year: 2018, penetration: 84, users: 31.0 },
  { year: 2019, penetration: 86, users: 33.5 },
  { year: 2020, penetration: 84, users: 38.0 },
  { year: 2021, penetration: 87, users: 42.0 },
  { year: 2022, penetration: 89, users: 45.0 },
  { year: 2023, penetration: 91, users: 49.0 },
  { year: 2024, penetration: 92, users: 52.0 },
];

const RCT_EVIDENCE: RTCEvidence[] = [
  {
    study: "Banerjee & Duflo (2015) — Hyderabad",
    location: "India",
    finding: "Modest income gains for business-owning households; no average consumption lift",
    positive: false,
  },
  {
    study: "Crépon et al. (2015) — Morocco",
    location: "Morocco",
    finding: "Business investment and assets rose; consumption unchanged; repayment reliable",
    positive: true,
  },
  {
    study: "Karlan & Zinman (2008) — South Africa",
    location: "South Africa",
    finding: "Consumer credit reduced hunger and depression; small business impact mixed",
    positive: true,
  },
  {
    study: "Angelucci et al. (2015) — Mexico",
    location: "Mexico",
    finding: "No average effect on income or consumption; high heterogeneity across households",
    positive: false,
  },
  {
    study: "Tarozzi et al. (2015) — Ethiopia",
    location: "Ethiopia",
    finding: "Livestock assets increased; sustained over 3 years; women empowerment gains",
    positive: true,
  },
  {
    study: "Dupas & Robinson (2013) — Kenya",
    location: "Kenya",
    finding: "Savings accounts alone (not credit) improved health outcomes and investment",
    positive: true,
  },
];

// ── OSS Calculator ─────────────────────────────────────────────────────────────

function OSSCalculator() {
  const [revenue, setRevenue] = useState<number>(800);
  const [expenses, setExpenses] = useState<number>(680);

  const oss = useMemo(() => {
    if (expenses === 0) return 0;
    return (revenue / expenses) * 100;
  }, [revenue, expenses]);

  const ossColor =
    oss >= 120 ? "#10b981" : oss >= 100 ? "#f59e0b" : "#ef4444";
  const ossLabel =
    oss >= 120
      ? "Fully Self-Sufficient"
      : oss >= 100
      ? "Operationally Viable"
      : "Subsidy Dependent";

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          Operational Self-Sufficiency (OSS) Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total Revenue (USD thousands)</span>
            <span className="text-foreground font-mono">${revenue}k</span>
          </div>
          <Slider
            min={200}
            max={2000}
            step={50}
            value={[revenue]}
            onValueChange={(v) => setRevenue(v[0])}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total Expenses (USD thousands)</span>
            <span className="text-foreground font-mono">${expenses}k</span>
          </div>
          <Slider
            min={200}
            max={2000}
            step={50}
            value={[expenses]}
            onValueChange={(v) => setExpenses(v[0])}
          />
        </div>

        {/* OSS Gauge */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <svg width="200" height="110" viewBox="0 0 200 110">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#27272a"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Colored fill arc */}
            {(() => {
              const clampedOSS = Math.min(Math.max(oss, 50), 200);
              const fraction = (clampedOSS - 50) / 150;
              const angle = Math.PI * fraction;
              const ex = 100 - 80 * Math.cos(angle);
              const ey = 100 - 80 * Math.sin(angle);
              const largeArc = fraction > 0.5 ? 1 : 0;
              return (
                <path
                  d={`M 20 100 A 80 80 0 ${largeArc} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`}
                  fill="none"
                  stroke={ossColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              );
            })()}
            {/* 100% marker */}
            <line
              x1="100"
              y1="22"
              x2="100"
              y2="34"
              stroke="#71717a"
              strokeWidth="2"
            />
            <text x="100" y="48" textAnchor="middle" fill="#71717a" fontSize="9">
              100%
            </text>
            {/* Labels */}
            <text x="14" y="112" textAnchor="middle" fill="#71717a" fontSize="9">
              50%
            </text>
            <text x="186" y="112" textAnchor="middle" fill="#71717a" fontSize="9">
              200%
            </text>
            {/* Value */}
            <text
              x="100"
              y="88"
              textAnchor="middle"
              fill={ossColor}
              fontSize="26"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {oss.toFixed(0)}%
            </text>
          </svg>
          <Badge
            style={{ backgroundColor: ossColor + "22", color: ossColor, borderColor: ossColor + "44" }}
            className="border text-xs"
          >
            {ossLabel}
          </Badge>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            OSS = Revenue / (Financial Expenses + Loan Loss Provisions + Operating Expenses). Above 100% means the MFI covers all costs without donor subsidy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── PAR Gauge ─────────────────────────────────────────────────────────────────

function PARGauge({
  par30,
  par90,
  name,
}: {
  par30: number;
  par90: number;
  name: string;
}) {
  const par30Color =
    par30 < 5 ? "#10b981" : par30 < 10 ? "#f59e0b" : "#ef4444";
  const par90Color =
    par90 < 3 ? "#10b981" : par90 < 6 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <p className="text-xs font-medium text-muted-foreground">{name}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">PAR 30</span>
          <span style={{ color: par30Color }} className="font-mono font-bold">
            {par30.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${Math.min(par30 * 5, 100)}%`, backgroundColor: par30Color }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">PAR 90</span>
          <span style={{ color: par90Color }} className="font-mono font-bold">
            {par90.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${Math.min(par90 * 5, 100)}%`, backgroundColor: par90Color }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Borrower Demographics Donut ───────────────────────────────────────────────

function BorrowerDonut() {
  const segments = [
    { label: "Women", pct: 68, color: "#ec4899" },
    { label: "Rural", pct: 58, color: "#10b981" },
    { label: "First-Time", pct: 42, color: "#f59e0b" },
    { label: "Below Poverty Line", pct: 35, color: "#3b82f6" },
  ];

  const cx = 100;
  const cy = 100;
  const r = 70;
  const innerR = 42;

  // Build donut for "Women" and "Men" only (single donut split)
  const womenPct = 68;
  const menPct = 32;
  const totalArc = 2 * Math.PI;
  const womenAngle = (womenPct / 100) * totalArc;

  const px1 = cx + r * Math.cos(-Math.PI / 2);
  const py1 = cy + r * Math.sin(-Math.PI / 2);
  const px2 = cx + r * Math.cos(-Math.PI / 2 + womenAngle);
  const py2 = cy + r * Math.sin(-Math.PI / 2 + womenAngle);
  const ix1 = cx + innerR * Math.cos(-Math.PI / 2 + womenAngle);
  const iy1 = cy + innerR * Math.sin(-Math.PI / 2 + womenAngle);
  const ix2 = cx + innerR * Math.cos(-Math.PI / 2);
  const iy2 = cy + innerR * Math.sin(-Math.PI / 2);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
          <PieChart className="w-4 h-4 text-pink-400" />
          Borrower Demographics (Global MFI Average)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        {/* Donut: Women vs Men */}
        <div className="flex flex-col items-center gap-2">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Women slice */}
            <path
              d={`M ${px1.toFixed(1)} ${py1.toFixed(1)} A ${r} ${r} 0 ${womenPct > 50 ? 1 : 0} 1 ${px2.toFixed(1)} ${py2.toFixed(1)} L ${ix1.toFixed(1)} ${iy1.toFixed(1)} A ${innerR} ${innerR} 0 ${womenPct > 50 ? 1 : 0} 0 ${ix2.toFixed(1)} ${iy2.toFixed(1)} Z`}
              fill="#ec4899"
              opacity={0.85}
            />
            {/* Men slice */}
            <path
              d={`M ${px2.toFixed(1)} ${py2.toFixed(1)} A ${r} ${r} 0 ${menPct > 50 ? 1 : 0} 1 ${px1.toFixed(1)} ${py1.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${innerR} ${innerR} 0 ${menPct > 50 ? 1 : 0} 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z`}
              fill="#3b82f6"
              opacity={0.85}
            />
            {/* Center label */}
            <text x="100" y="95" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">
              68%
            </text>
            <text x="100" y="112" textAnchor="middle" fill="#ec4899" fontSize="10">
              Women
            </text>
          </svg>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-muted-foreground">Women 68%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Men 32%</span>
            </div>
          </div>
        </div>

        {/* Other demographics */}
        <div className="flex-1 space-y-3 w-full">
          {segments.map((seg) => (
            <div key={seg.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{seg.label}</span>
                <span className="font-mono" style={{ color: seg.color }}>
                  {seg.pct}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${seg.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
              </div>
            </div>
          ))}
          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p>Source: MIX Market / CGAP 2023 aggregates across 1,400+ MFIs</p>
            <p>Targeting women borrowers correlates with higher repayment rates and stronger household welfare outcomes in most RCT studies.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── M-Pesa SVG Chart ──────────────────────────────────────────────────────────

function MPesaChart() {
  const W = 560;
  const H = 220;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const years = MPESA_DATA.map((d) => d.year);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);

  const penPoints = MPESA_DATA.map((d, i) => {
    const x = padL + ((d.year - minY) / (maxY - minY)) * chartW;
    const y = padT + chartH - (d.penetration / 100) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const userPoints = MPESA_DATA.map((d) => {
    const x = padL + ((d.year - minY) / (maxY - minY)) * chartW;
    const y = padT + chartH - (d.users / 55) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  // Area fill for penetration
  const firstX = padL;
  const lastX = padL + chartW;
  const baseY = padT + chartH;
  const areaPath =
    `M ${firstX} ${baseY} ` +
    MPESA_DATA.map((d) => {
      const x = padL + ((d.year - minY) / (maxY - minY)) * chartW;
      const y = padT + chartH - (d.penetration / 100) * chartH;
      return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") +
    ` L ${lastX} ${baseY} Z`;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-green-400" />
          M-Pesa Kenya: Mobile Money Penetration 2007–2024
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="min-w-[400px]">
            <defs>
              <linearGradient id="mfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = padT + chartH - (pct / 100) * chartH;
              return (
                <g key={pct}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={W - padR}
                    y2={y}
                    stroke="#27272a"
                    strokeWidth="1"
                  />
                  <text x={padL - 4} y={y + 4} textAnchor="end" fill="#71717a" fontSize="9">
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="url(#mfAreaGrad)" />

            {/* Penetration line */}
            <polyline
              points={penPoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Users line */}
            <polyline
              points={userPoints}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5 3"
              strokeLinejoin="round"
            />

            {/* Year labels */}
            {[2007, 2010, 2013, 2016, 2019, 2022, 2024].map((yr) => {
              const x = padL + ((yr - minY) / (maxY - minY)) * chartW;
              return (
                <text
                  key={yr}
                  x={x}
                  y={H - 6}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="9"
                >
                  {yr}
                </text>
              );
            })}

            {/* Legend */}
            <line x1={padL + 8} y1={padT + 10} x2={padL + 28} y2={padT + 10} stroke="#10b981" strokeWidth="2.5" />
            <text x={padL + 32} y={padT + 14} fill="#10b981" fontSize="10">Penetration %</text>
            <line x1={padL + 140} y1={padT + 10} x2={padL + 160} y2={padT + 10} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
            <text x={padL + 164} y={padT + 14} fill="#f59e0b" fontSize="10">Users (M)</text>
          </svg>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "2007 Launch", value: "500K users", color: "text-muted-foreground" },
            { label: "2024 Users", value: "52 million", color: "text-green-400" },
            { label: "Penetration", value: "92% adults", color: "text-green-400" },
            { label: "GDP via M-Pesa", value: "~45% Kenya GDP", color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted rounded p-3 text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-sm font-medium mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Grameen Group Lending SVG ─────────────────────────────────────────────────

function GrameenFlowDiagram() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          Grameen Bank Group Lending Model
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          width="100%"
          viewBox="0 0 560 280"
          className="overflow-visible"
        >
          {/* MFI Box */}
          <rect x="220" y="10" width="120" height="50" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="280" y="30" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">MFI Branch</text>
          <text x="280" y="48" textAnchor="middle" fill="#60a5fa" fontSize="9">Loan Officer</text>

          {/* Center Groups */}
          {[0, 1, 2].map((i) => {
            const cx = 100 + i * 180;
            const cy = 140;
            return (
              <g key={i}>
                <line x1="280" y1="60" x2={cx} y2={cy - 20} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2" />
                <rect x={cx - 55} y={cy - 20} width="110" height="40" rx="6" fill="#1a2d1f" stroke="#10b981" strokeWidth="1.5" />
                <text x={cx} y={cy - 2} textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">Group {i + 1}</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fill="#34d399" fontSize="9">5 Members</text>
              </g>
            );
          })}

          {/* Individual borrowers */}
          {[0, 1, 2].map((gi) => {
            const gx = 100 + gi * 180;
            return [0, 1, 2, 3, 4].map((bi) => {
              const bx = gx - 40 + bi * 20;
              const by = 205;
              return (
                <g key={`${gi}-${bi}`}>
                  <line x1={gx} y1={120} x2={bx} y2={by - 10} stroke="#10b981" strokeWidth="0.8" opacity={0.5} />
                  <circle cx={bx} cy={by} r={8} fill="#14532d" stroke="#22c55e" strokeWidth="1.2" />
                  <text x={bx} y={by + 4} textAnchor="middle" fill="#86efac" fontSize="7">B</text>
                </g>
              );
            });
          })}

          {/* Joint liability label */}
          <rect x="10" y="240" width="540" height="28" rx="6" fill="#1c1917" stroke="#78716c" strokeWidth="1" />
          <text x="280" y="252" textAnchor="middle" fill="#a8a29e" fontSize="10" fontWeight="bold">
            Joint Liability — if one member defaults, the group is responsible
          </text>
          <text x="280" y="264" textAnchor="middle" fill="#78716c" fontSize="9">
            Social pressure replaces collateral; weekly meetings enforce discipline
          </text>
        </svg>

        {/* Solidarity vs Individual comparison */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              <Users className="w-3 h-3" /> Group / Solidarity Lending
            </p>
            {[
              "No collateral required",
              "Joint liability creates peer monitoring",
              "Smaller initial loans ($50–500)",
              "Weekly group meetings mandatory",
              "Higher admin cost per loan",
              "Default rate typically 1–4%",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-primary flex items-center gap-1">
              <Building className="w-3 h-3" /> Individual Lending
            </p>
            {[
              "Collateral or credit score required",
              "Higher loan sizes ($500–50,000)",
              "Quicker disbursement process",
              "No group meeting overhead",
              "Serves more established MSMEs",
              "Higher risk of moral hazard",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Interest Rate Controversy ─────────────────────────────────────────────────

function InterestRateExplainer() {
  const reasons = [
    {
      label: "High Operating Costs",
      detail: "Serving dispersed rural clients requires many loan officers; cost-per-loan can be $50–120 even on a $200 loan.",
      icon: MapPin,
      color: "text-amber-400",
    },
    {
      label: "No Collateral Risk Premium",
      detail: "Without assets to seize, lenders price in default risk of borrowers with no credit history.",
      icon: Shield,
      color: "text-red-400",
    },
    {
      label: "Small Loan Sizes",
      detail: "Fixed origination costs are spread over tiny principal; 2% fixed cost on $200 = 1% APR just for paperwork.",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Inflation & FX in Frontier Markets",
      detail: "High local inflation (10–30%) requires nominal rates to maintain real return; USD loans add FX risk premium.",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Funding Cost of MFI Capital",
      detail: "MFIs borrow at 8–15%; must charge spread to cover cost of capital, provisions, and overhead.",
      icon: Percent,
      color: "text-primary",
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Why Microfinance Interest Rates Are High (20–80% APR)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reasons.map((r) => (
          <div key={r.label} className="flex gap-3 bg-muted rounded-lg p-3">
            <r.icon className={`w-4 h-4 mt-0.5 shrink-0 ${r.color}`} />
            <div>
              <p className={`text-xs font-semibold ${r.color}`}>{r.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.detail}</p>
            </div>
          </div>
        ))}
        <div className="bg-muted rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Info className="w-3 h-3 text-primary" />
            Controversy
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Critics like Muhammad Yunus argue commercial MFIs (e.g., Compartamos charging 68% APR) exploit vulnerable borrowers. Defenders note rates are still far below informal moneylenders (200–500%) and enable access otherwise unavailable. The debate drives regulation: many countries now cap MFI rates at 24–36% APR.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MicrofinancepagePage() {
  const [selectedMFI, setSelectedMFI] = useState<MFIComparison>(MFI_TABLE[0]);

  const impactMetrics: ImpactMetric[] = [
    {
      label: "Global Microfinance Clients",
      value: "140 million+",
      trend: "up",
      icon: Users,
    },
    {
      label: "% Women Borrowers",
      value: "68%",
      trend: "up",
      icon: Heart,
    },
    {
      label: "Avg Business Survival (3yr)",
      value: "61%",
      trend: "neutral",
      icon: Activity,
    },
    {
      label: "Income Lift (meta-analysis)",
      value: "+12–22%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      label: "Households Exiting Poverty",
      value: "Mixed evidence",
      trend: "neutral",
      icon: BookOpen,
    },
    {
      label: "Mission Drift Cases",
      value: "Growing concern",
      trend: "down",
      icon: AlertTriangle,
    },
  ];

  const digitalFeatures = [
    {
      title: "Digital Lending Algorithms",
      desc: "ML models score borrowers using phone usage patterns, app data, and social graphs instead of credit bureau scores. Enables instant sub-$50 loans.",
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Agent Banking Networks",
      desc: "Human agents (shopkeepers, pharmacists) act as mini-bank branches in remote areas — deposit, withdraw, and repay loans without traveling to a city.",
      icon: Building,
      color: "text-green-400",
    },
    {
      title: "Cross-Border Remittances",
      desc: "Mobile money slashes remittance fees from 7–10% to under 1%; workers sending money home can now do so instantly at near-zero cost.",
      icon: Globe,
      color: "text-primary",
    },
    {
      title: "CBDC for Financial Inclusion",
      desc: "Central Bank Digital Currencies with offline capability could reach the 1.4B still unbanked; programmable money can enforce conditional grants.",
      icon: CreditCard,
      color: "text-amber-400",
    },
    {
      title: "Fintech–MFI Partnerships",
      desc: "Fintechs (Tala, Branch, Kiva) originate loans digitally then sell portfolios to MFIs; separates technology from balance-sheet risk.",
      icon: Wifi,
      color: "text-muted-foreground",
    },
  ];

  const challenges = [
    {
      label: "Over-indebtedness",
      detail: "Multiple loans from competing MFIs can trap borrowers in debt cycles; Andhra Pradesh 2010 crisis saw 57 suicides attributed to aggressive collections.",
      severity: "Critical" as const,
    },
    {
      label: "Data Privacy",
      detail: "Digital MFIs harvest extensive personal data; weak regulatory frameworks in frontier markets create exploitation risks.",
      severity: "High" as const,
    },
    {
      label: "Predatory Digital Lending",
      detail: "Ultra-short-term digital loans (7-day at 300% APR) target vulnerable populations who misunderstand true cost.",
      severity: "Critical" as const,
    },
    {
      label: "Mission Drift",
      detail: "Commercial MFIs shift to wealthier clients ('mission creep') as investor pressure demands returns.",
      severity: "High" as const,
    },
    {
      label: "Currency Risk for International MFIs",
      detail: "MFIs borrowing in USD but lending in local currencies face mismatch when local currency depreciates.",
      severity: "Medium" as const,
    },
  ];

  const severityColor = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/40",
    High: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    Low: "bg-green-500/20 text-green-400 border-green-500/40",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-foreground">
                Microfinance &amp; Financial Inclusion
              </h1>
              <p className="text-xs text-muted-foreground">
                Microloan models · MFI financial health · Impact evidence · Mobile money innovation
              </p>
            </div>
          </div>

          {/* Top KPI chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { label: "Unbanked Adults", value: "1.4B" },
              { label: "Global MFI Portfolio", value: "$124B" },
              { label: "Avg Interest Rate", value: "20–68%" },
              { label: "Mobile Money Users", value: "1.75B" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="bg-card border border-border rounded-full px-3 py-1 flex items-center gap-2"
              >
                <span className="text-xs text-muted-foreground">{chip.label}</span>
                <span className="text-xs font-medium text-foreground">{chip.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero */}
        <div className="rounded-xl border border-border bg-card border-l-4 border-l-primary p-6">
          <h2 className="text-lg font-medium text-foreground mb-1">Microfinance Research Hub</h2>
          <p className="text-sm text-muted-foreground">Microloan models, MFI financial health analysis, impact evidence, and mobile money innovation.</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="models" className="mt-8">
          <TabsList className="bg-card border border-border flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="models" className="text-xs data-[state=active]:bg-muted">
              Microfinance Models
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs data-[state=active]:bg-muted">
              MFI Financial Health
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs data-[state=active]:bg-muted">
              Impact Metrics
            </TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs data-[state=active]:bg-muted">
              Mobile Money &amp; Innovation
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Microfinance Models ─────────────────────────────────────── */}
          <TabsContent value="models" className="data-[state=inactive]:hidden space-y-6 mt-4">
            <GrameenFlowDiagram />

            {/* MFI Types */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  MFI Types Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Type", "Regulated", "Avg Loan", "Clients", "Profit Motive", "Description"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left py-2 px-3 text-muted-foreground font-medium"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {MFI_TYPES.map((mfi, i) => (
                        <tr
                          key={mfi.type}
                          className={`border-b border-border/50 ${i % 2 === 0 ? "bg-card/50" : ""}`}
                        >
                          <td className="py-2 px-3 font-medium text-foreground">{mfi.type}</td>
                          <td className="py-2 px-3">
                            {mfi.regulated ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-amber-400">
                            ${mfi.avgLoanSize.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">{mfi.clients}</td>
                          <td className="py-2 px-3">
                            {mfi.profitMotif ? (
                              <Badge className="bg-primary/20 text-primary border-primary/40 text-xs">
                                Commercial
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
                                Mission
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground max-w-xs">{mfi.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Average Loan Size by Region */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Average Loan Size by Region (USD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {REGION_LOAN_DATA.sort((a, b) => b.avgLoanUSD - a.avgLoanUSD).map((r) => {
                    const maxVal = 3200;
                    return (
                      <div key={r.region} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-44 shrink-0">{r.region}</span>
                        <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(r.avgLoanUSD / maxVal) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-5 rounded-full flex items-center justify-end pr-2"
                            style={{ backgroundColor: r.color + "44", border: `1px solid ${r.color}` }}
                          >
                            <span
                              className="text-xs font-mono font-medium"
                              style={{ color: r.color }}
                            >
                              ${r.avgLoanUSD.toLocaleString()}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Large regional variance reflects GDP per capita, regulatory maturity, and target client segment. Eastern Europe MFIs primarily serve SMEs while South Asia targets ultra-poor households.
                </p>
              </CardContent>
            </Card>

            <InterestRateExplainer />
          </TabsContent>

          {/* ── Tab 2: MFI Financial Health ───────────────────────────────────── */}
          <TabsContent value="health" className="data-[state=inactive]:hidden space-y-6 mt-4">
            {/* PAR overview grid */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  Portfolio at Risk (PAR) — Select MFI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {MFI_TABLE.map((mfi) => (
                    <button
                      key={mfi.name}
                      onClick={() => setSelectedMFI(mfi)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        selectedMFI.name === mfi.name
                          ? "bg-primary text-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {mfi.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PARGauge
                    par30={selectedMFI.par30}
                    par90={selectedMFI.par90}
                    name={`${selectedMFI.name} (${selectedMFI.country})`}
                  />
                  <div className="space-y-3">
                    {[
                      {
                        label: "OSS",
                        value: `${selectedMFI.oss}%`,
                        desc: "Operational Self-Sufficiency",
                        color: selectedMFI.oss >= 110 ? "#10b981" : selectedMFI.oss >= 100 ? "#f59e0b" : "#ef4444",
                      },
                      {
                        label: "Yield on Portfolio",
                        value: `${selectedMFI.yieldOnPortfolio}%`,
                        desc: "Interest income / gross loan portfolio",
                        color: "#3b82f6",
                      },
                      {
                        label: "Cost of Funds",
                        value: `${selectedMFI.costOfFunds}%`,
                        desc: "Interest expense / average assets",
                        color: "#ef4444",
                      },
                      {
                        label: "Net Spread",
                        value: `${(selectedMFI.yieldOnPortfolio - selectedMFI.costOfFunds).toFixed(1)}%`,
                        desc: "Yield minus cost of funds",
                        color: "#8b5cf6",
                      },
                      {
                        label: "Cost per Borrower",
                        value: `$${selectedMFI.costPerBorrower}`,
                        desc: "Total operating cost / active clients",
                        color: "#f59e0b",
                      },
                      {
                        label: "Active Clients",
                        value: `${(selectedMFI.activeClients / 1e6).toFixed(1)}M`,
                        desc: "Total active borrowers",
                        color: "#10b981",
                      },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="flex items-center justify-between bg-muted rounded px-3 py-2"
                      >
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                          <p className="text-xs text-muted-foreground">{metric.desc}</p>
                        </div>
                        <span
                          className="text-sm font-medium font-mono"
                          style={{ color: metric.color }}
                        >
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <OSSCalculator />

            {/* Full MFI comparison table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  8-MFI Financial Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {[
                          "MFI",
                          "Country",
                          "PAR30",
                          "PAR90",
                          "OSS",
                          "Yield %",
                          "CoF %",
                          "Cost/Borrow",
                          "Clients",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2 px-2 text-muted-foreground font-medium whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MFI_TABLE.map((mfi, i) => (
                        <tr
                          key={mfi.name}
                          className={`border-b border-border/50 cursor-pointer hover:bg-muted/60 ${
                            selectedMFI.name === mfi.name ? "bg-muted/40" : i % 2 === 0 ? "bg-card/40" : ""
                          }`}
                          onClick={() => setSelectedMFI(mfi)}
                        >
                          <td className="py-2 px-2 font-medium text-foreground whitespace-nowrap">{mfi.name}</td>
                          <td className="py-2 px-2 text-muted-foreground">{mfi.country}</td>
                          <td
                            className="py-2 px-2 font-mono"
                            style={{ color: mfi.par30 < 5 ? "#10b981" : mfi.par30 < 10 ? "#f59e0b" : "#ef4444" }}
                          >
                            {mfi.par30}%
                          </td>
                          <td
                            className="py-2 px-2 font-mono"
                            style={{ color: mfi.par90 < 3 ? "#10b981" : mfi.par90 < 6 ? "#f59e0b" : "#ef4444" }}
                          >
                            {mfi.par90}%
                          </td>
                          <td
                            className="py-2 px-2 font-mono"
                            style={{ color: mfi.oss >= 120 ? "#10b981" : mfi.oss >= 100 ? "#f59e0b" : "#ef4444" }}
                          >
                            {mfi.oss}%
                          </td>
                          <td className="py-2 px-2 font-mono text-primary">{mfi.yieldOnPortfolio}%</td>
                          <td className="py-2 px-2 font-mono text-red-400">{mfi.costOfFunds}%</td>
                          <td className="py-2 px-2 font-mono text-amber-400">${mfi.costPerBorrower}</td>
                          <td className="py-2 px-2 font-mono text-green-400">
                            {mfi.activeClients >= 1e6
                              ? `${(mfi.activeClients / 1e6).toFixed(1)}M`
                              : `${(mfi.activeClients / 1000).toFixed(0)}K`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {[
                    {
                      label: "PAR30 Benchmark",
                      value: "< 5%",
                      note: "Healthy portfolio",
                      color: "text-green-400",
                    },
                    {
                      label: "PAR90 Benchmark",
                      value: "< 3%",
                      note: "Likely write-off territory",
                      color: "text-amber-400",
                    },
                    {
                      label: "OSS Benchmark",
                      value: "> 110%",
                      note: "Sustainable without subsidy",
                      color: "text-primary",
                    },
                    {
                      label: "Cost/Borrower",
                      value: "< $60",
                      note: "Efficient for micro-lending",
                      color: "text-primary",
                    },
                  ].map((b) => (
                    <div key={b.label} className="bg-muted rounded p-3">
                      <p className="text-xs text-muted-foreground">{b.label}</p>
                      <p className={`text-lg font-medium font-mono mt-1 ${b.color}`}>{b.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: Impact Metrics ──────────────────────────────────────────── */}
          <TabsContent value="impact" className="data-[state=inactive]:hidden space-y-6 mt-4">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {impactMetrics.map((m) => (
                <Card key={m.label} className="bg-card border-border">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <m.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p
                        className={`text-sm font-medium mt-0.5 ${
                          m.trend === "up"
                            ? "text-green-400"
                            : m.trend === "down"
                            ? "text-red-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {m.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <BorrowerDonut />

            {/* Social Performance Framework */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Social Performance Standards (SPTF / CERISE)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      pillar: "Intent & Design",
                      indicators: [
                        "Clear social mission statement",
                        "Products designed for target clients",
                        "Poverty measurement tool (PPI/PAT)",
                      ],
                      score: 72,
                    },
                    {
                      pillar: "Client Protection",
                      indicators: [
                        "Transparent pricing (APR disclosed)",
                        "Responsible collections policy",
                        "Complaints resolution mechanism",
                      ],
                      score: 65,
                    },
                    {
                      pillar: "Outreach & Services",
                      indicators: [
                        "% clients below $3.10/day poverty line",
                        "% women served",
                        "Rural / remote coverage",
                      ],
                      score: 81,
                    },
                    {
                      pillar: "Staff Treatment",
                      indicators: [
                        "Living wage compliance",
                        "Staff turnover rate < 20%",
                        "Anti-harassment policy",
                      ],
                      score: 58,
                    },
                  ].map((pillar) => (
                    <div key={pillar.pillar} className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-muted-foreground">{pillar.pillar}</p>
                        <span
                          className={`text-xs font-mono font-medium ${
                            pillar.score >= 75
                              ? "text-green-400"
                              : pillar.score >= 60
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {pillar.score}/100
                        </span>
                      </div>
                      <Progress value={pillar.score} className="h-1.5" />
                      <ul className="space-y-1">
                        {pillar.indicators.map((ind) => (
                          <li key={ind} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                            {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Mission Drift Concern
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As MFIs commercialize and pursue investor returns, evidence shows gradual upscaling to wealthier clients. The Andhra Pradesh, India crisis (2010) illustrates how aggressive commercialization — with multiple competing lenders per borrower and bonus-driven collections — can cause harm at scale. SPTF standards aim to codify responsible practice, but enforcement is voluntary for most MFIs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* RCT Evidence */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Randomized Control Trial (RCT) Evidence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {RCT_EVIDENCE.map((study) => (
                    <div
                      key={study.study}
                      className={`flex gap-3 rounded-lg p-3 ${
                        study.positive
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-muted border border-border"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {study.positive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{study.study}</p>
                        <p className="text-xs text-muted-foreground mb-1">{study.location}</p>
                        <p className="text-xs text-muted-foreground">{study.finding}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-muted rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground">Meta-Analytic Consensus</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Banerjee et al. (2015) synthesized 6 RCTs and found: microfinance expands business investment but has no average effect on consumption or income poverty. Effects are highly heterogeneous — existing entrepreneurs benefit most; pure subsistence households see little change. Access to savings products and insurance may be more powerful poverty-reduction tools than credit alone.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 4: Mobile Money & Innovation ─────────────────────────────── */}
          <TabsContent value="mobile" className="data-[state=inactive]:hidden space-y-6 mt-4">
            <MPesaChart />

            {/* Digital features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {digitalFeatures.map((feat) => (
                <Card key={feat.title} className="bg-card border-border">
                  <CardContent className="p-4 space-y-2">
                    <feat.icon className={`w-5 h-5 ${feat.color}`} />
                    <p className="text-xs font-medium text-foreground">{feat.title}</p>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Agent banking network SVG */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  Agent Banking Network Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg width="100%" viewBox="0 0 560 200" className="overflow-visible">
                  {/* Central bank */}
                  <rect x="220" y="10" width="120" height="48" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="280" y="30" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold">
                    Central Bank / MFI
                  </text>
                  <text x="280" y="46" textAnchor="middle" fill="#818cf8" fontSize="9">
                    Mobile Money Switch
                  </text>

                  {/* Agent nodes */}
                  {[
                    { label: "Shopkeeper", x: 60, icon: "S" },
                    { label: "Pharmacist", x: 160, icon: "P" },
                    { label: "Airtime Agent", x: 280, icon: "A" },
                    { label: "Post Office", x: 400, icon: "PO" },
                    { label: "Gas Station", x: 500, icon: "G" },
                  ].map((agent) => (
                    <g key={agent.label}>
                      <line
                        x1="280"
                        y1="58"
                        x2={agent.x}
                        y2="120"
                        stroke="#4f46e5"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                        opacity={0.6}
                      />
                      <circle cx={agent.x} cy="132" r="18" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                      <text x={agent.x} y="136" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontWeight="bold">
                        {agent.icon}
                      </text>
                      <text x={agent.x} y="160" textAnchor="middle" fill="#6b7280" fontSize="8">
                        {agent.label}
                      </text>
                    </g>
                  ))}

                  {/* End users */}
                  {[60, 160, 280, 400, 500].map((x, i) => (
                    <g key={i}>
                      <line x1={x} y1="150" x2={x} y2="178" stroke="#4f46e5" strokeWidth="0.8" opacity={0.4} />
                      <circle cx={x} cy="186" r="8" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                      <text x={x} y="190" textAnchor="middle" fill="#6ee7b7" fontSize="7">
                        U
                      </text>
                    </g>
                  ))}

                  <text x="280" y="200" textAnchor="middle" fill="#52525b" fontSize="9">
                    End users — deposit, withdraw, repay loans through local agents without bank branches
                  </text>
                </svg>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Kenya M-Pesa Agents", value: "500,000+", color: "text-green-400" },
                    { label: "Bangladesh bKash", value: "300,000+", color: "text-primary" },
                    { label: "India Business Corr.", value: "1.2M+", color: "text-amber-400" },
                    { label: "Africa Total Agents", value: "3.7M+", color: "text-primary" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted rounded p-3 text-center">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-sm font-medium mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Key Challenges &amp; Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenges.map((ch) => (
                  <div key={ch.label} className="flex gap-3 bg-muted rounded-lg p-3">
                    <Badge
                      className={`text-xs border shrink-0 mt-0.5 ${severityColor[ch.severity]}`}
                    >
                      {ch.severity}
                    </Badge>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{ch.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ch.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CBDC opportunity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  CBDC Opportunity for Financial Inclusion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-green-400">Opportunities</p>
                    {[
                      "Offline NFC payments reach rural areas with no internet",
                      "Programmable conditional transfers (gov't subsidies directly to poor)",
                      "Interoperability: one wallet works across all MFIs",
                      "Lower cost than card rails; no Visa/Mastercard fees",
                      "Identity layer via digital ID reduces KYC costs",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-red-400">Risks</p>
                    {[
                      "Disintermediates MFIs — deposits flee to CBDC wallets",
                      "Surveillance risk: all transactions visible to government",
                      "Requires smartphone + electricity — excludes poorest",
                      "Cybersecurity risk for central bank systems",
                      "Regulatory fragmentation across jurisdictions",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 bg-primary/10 border border-border rounded-lg p-3">
                  <p className="text-xs font-medium text-primary">Live CBDC Inclusion Programs</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nigeria eNaira (2021): 13M wallets registered, though adoption lagged. Bahamas Sand Dollar: offline card enables reaching remote Out Islands. India Digital Rupee pilot (2022–): RBI targeting financial inclusion via offline CBDC in UP and Bihar states. Most experts view tiered CBDC (small wallets = no KYC) as the best path to serving the unbanked.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
