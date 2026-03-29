"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  CloudLightning,
  Waves,
  Mountain,
  TrendingUp,
  BarChart2,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Target,
  Layers,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 990;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _precomputed = Array.from({ length: 3000 }, () => rand());
let _idx = 0;
const sv = () => _precomputed[_idx++ % _precomputed.length];
void sv;

// ── CAT Bond Data ──────────────────────────────────────────────────────────────
interface CatBond {
  id: string;
  issuer: string;
  name: string;
  peril: "Hurricane" | "Earthquake" | "Flood";
  trigger: "Indemnity" | "PCS Index" | "Parametric";
  sofr: number;
  spread: number;
  expectedLoss: number;
  attachment: number;
  exhaustion: number;
  outstanding: number;
  rating: string;
}

const CAT_BONDS: CatBond[] = [
  {
    id: "cb1",
    issuer: "Swiss Re",
    name: "Matterhorn Re 2024-1",
    peril: "Hurricane",
    trigger: "Parametric",
    sofr: 5.33,
    spread: 6.25,
    expectedLoss: 1.8,
    attachment: 50,
    exhaustion: 200,
    outstanding: 400,
    rating: "BB+",
  },
  {
    id: "cb2",
    issuer: "Munich Re",
    name: "Galileo Re 2024-2",
    peril: "Earthquake",
    trigger: "PCS Index",
    sofr: 5.33,
    spread: 7.50,
    expectedLoss: 2.4,
    attachment: 80,
    exhaustion: 300,
    outstanding: 275,
    rating: "BB",
  },
  {
    id: "cb3",
    issuer: "Zurich Insurance",
    name: "Vitality Re 2024-1",
    peril: "Flood",
    trigger: "Indemnity",
    sofr: 5.33,
    spread: 5.00,
    expectedLoss: 1.2,
    attachment: 120,
    exhaustion: 250,
    outstanding: 150,
    rating: "BBB-",
  },
  {
    id: "cb4",
    issuer: "Berkshire Hathaway",
    name: "KAMP Re 2024-1",
    peril: "Hurricane",
    trigger: "Indemnity",
    sofr: 5.33,
    spread: 9.00,
    expectedLoss: 3.1,
    attachment: 30,
    exhaustion: 150,
    outstanding: 500,
    rating: "B+",
  },
  {
    id: "cb5",
    issuer: "Tokio Marine",
    name: "Nakama Re 2024-1",
    peril: "Earthquake",
    trigger: "Parametric",
    sofr: 5.33,
    spread: 8.25,
    expectedLoss: 2.8,
    attachment: 60,
    exhaustion: 200,
    outstanding: 200,
    rating: "BB-",
  },
  {
    id: "cb6",
    issuer: "Lloyd's of London",
    name: "Thames Re 2024-1",
    peril: "Flood",
    trigger: "PCS Index",
    sofr: 5.33,
    spread: 4.75,
    expectedLoss: 0.9,
    attachment: 200,
    exhaustion: 400,
    outstanding: 325,
    rating: "BBB",
  },
];

const PERIL_ICONS: Record<string, React.ReactNode> = {
  Hurricane: <CloudLightning className="h-4 w-4" />,
  Earthquake: <Mountain className="h-4 w-4" />,
  Flood: <Waves className="h-4 w-4" />,
};

const PERIL_COLORS: Record<string, string> = {
  Hurricane: "text-amber-400",
  Earthquake: "text-orange-400",
  Flood: "text-blue-400",
};

const TRIGGER_COLORS: Record<string, string> = {
  Indemnity: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "PCS Index": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Parametric: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

// ── Loss Exceedance Curve ──────────────────────────────────────────────────────
const EXCEEDANCE_POINTS: { returnPeriod: number; loss: number; annualProb: number }[] = [
  { returnPeriod: 10, loss: 15, annualProb: 10.0 },
  { returnPeriod: 25, loss: 38, annualProb: 4.0 },
  { returnPeriod: 50, loss: 72, annualProb: 2.0 },
  { returnPeriod: 100, loss: 125, annualProb: 1.0 },
  { returnPeriod: 150, loss: 168, annualProb: 0.67 },
  { returnPeriod: 200, loss: 210, annualProb: 0.5 },
  { returnPeriod: 250, loss: 258, annualProb: 0.4 },
  { returnPeriod: 500, loss: 380, annualProb: 0.2 },
  { returnPeriod: 1000, loss: 520, annualProb: 0.1 },
];

function LossExceedanceCurve() {
  const W = 520;
  const H = 200;
  const PAD = { l: 50, r: 20, t: 16, b: 40 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxLoss = 600;
  const maxRP = 1000;

  const toX = (rp: number) => PAD.l + (Math.log10(rp) / Math.log10(maxRP)) * cW;
  const toY = (loss: number) => PAD.t + cH - (loss / maxLoss) * cH;

  const pathD = EXCEEDANCE_POINTS.map((p, i) =>
    `${i === 0 ? "M" : "L"}${toX(p.returnPeriod)},${toY(p.loss)}`
  ).join(" ");

  const areaD =
    pathD +
    ` L${toX(EXCEEDANCE_POINTS[EXCEEDANCE_POINTS.length - 1].returnPeriod)},${PAD.t + cH}` +
    ` L${toX(EXCEEDANCE_POINTS[0].returnPeriod)},${PAD.t + cH} Z`;

  const yGrids = [0, 100, 200, 300, 400, 500];
  const rpLabels = [10, 25, 100, 250, 500, 1000];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <defs>
        <linearGradient id="excGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {yGrids.map((v) => (
        <line key={`yg-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {yGrids.map((v) => (
        <text key={`yl-${v}`} x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
          ${v}B
        </text>
      ))}
      {rpLabels.map((rp) => (
        <text key={`xl-${rp}`} x={toX(rp)} y={H - PAD.b + 14} textAnchor="middle" fontSize="9" fill="#71717a">
          {rp}yr
        </text>
      ))}
      <path d={areaD} fill="url(#excGrad)" />
      <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
      {EXCEEDANCE_POINTS.filter((p) => [100, 250, 500].includes(p.returnPeriod)).map((p) => (
        <g key={`dot-${p.returnPeriod}`}>
          <circle cx={toX(p.returnPeriod)} cy={toY(p.loss)} r="4" fill="#f59e0b" />
          <text x={toX(p.returnPeriod)} y={toY(p.loss) - 8} textAnchor="middle" fontSize="9" fill="#fbbf24">
            ${p.loss}B
          </text>
        </g>
      ))}
      <text x={PAD.l + cW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#71717a">
        Return Period (years, log scale)
      </text>
    </svg>
  );
}

// ── ILS vs Reinsurance Chart ───────────────────────────────────────────────────
function ILSComparisonChart() {
  const W = 440;
  const H = 180;
  const PAD = { l: 50, r: 20, t: 20, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const metrics = [
    { label: "Correlation\nto S&P 500", ils: 0.03, reins: 0.35, max: 1.0 },
    { label: "Spread vs\nRisk-Free", ils: 0.65, reins: 0.38, max: 1.0 },
    { label: "Capital\nEfficiency", ils: 0.82, reins: 0.55, max: 1.0 },
    { label: "Speed of\nSettlement", ils: 0.45, reins: 0.75, max: 1.0 },
  ];

  const barW = (cW / metrics.length) * 0.35;
  const gap = (cW / metrics.length) * 0.1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
        <line key={`hg-${v}`} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + cH - v * cH} y2={PAD.t + cH - v * cH} stroke="#27272a" strokeWidth="1" />
      ))}
      {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
        <text key={`hgl-${v}`} x={PAD.l - 6} y={PAD.t + cH - v * cH + 4} textAnchor="end" fontSize="9" fill="#71717a">
          {v.toFixed(2)}
        </text>
      ))}
      {metrics.map((m, i) => {
        const cx = PAD.l + (i + 0.5) * (cW / metrics.length);
        const ilsH = m.ils * cH;
        const reinsH = m.reins * cH;
        return (
          <g key={`bar-${i}`}>
            <rect x={cx - barW - gap / 2} y={PAD.t + cH - ilsH} width={barW} height={ilsH} fill="#34d399" opacity="0.8" rx="2" />
            <rect x={cx + gap / 2} y={PAD.t + cH - reinsH} width={barW} height={reinsH} fill="#60a5fa" opacity="0.8" rx="2" />
            {m.label.split("\n").map((line, li) => (
              <text key={`xl-${i}-${li}`} x={cx} y={H - PAD.b + 12 + li * 10} textAnchor="middle" fontSize="8" fill="#71717a">
                {line}
              </text>
            ))}
          </g>
        );
      })}
      <rect x={PAD.l + cW - 80} y={PAD.t} width="10" height="10" fill="#34d399" opacity="0.8" rx="1" />
      <text x={PAD.l + cW - 66} y={PAD.t + 8} fontSize="9" fill="#a1a1aa">ILS</text>
      <rect x={PAD.l + cW - 40} y={PAD.t} width="10" height="10" fill="#60a5fa" opacity="0.8" rx="1" />
      <text x={PAD.l + cW - 26} y={PAD.t + 8} fontSize="9" fill="#a1a1aa">Trad. Re</text>
    </svg>
  );
}

// ── Portfolio Scatter Chart ────────────────────────────────────────────────────
function PortfolioScatterChart() {
  const W = 480;
  const H = 220;
  const PAD = { l: 50, r: 20, t: 20, b: 40 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const points: { label: string; risk: number; ret: number; color: string; size: number }[] = [
    { label: "HUR CAT Bond", risk: 8.2, ret: 11.6, color: "#f59e0b", size: 7 },
    { label: "EQ CAT Bond", risk: 9.8, ret: 12.8, color: "#f97316", size: 7 },
    { label: "FL CAT Bond", risk: 6.5, ret: 10.1, color: "#60a5fa", size: 7 },
    { label: "ILS Portfolio", risk: 7.1, ret: 11.2, color: "#34d399", size: 9 },
    { label: "60/40 Portfolio", risk: 12.4, ret: 8.5, color: "#a78bfa", size: 8 },
    { label: "60/40 + ILS", risk: 10.2, ret: 9.8, color: "#f472b6", size: 9 },
    { label: "Corp Bonds", risk: 5.8, ret: 6.2, color: "#71717a", size: 6 },
    { label: "Equities", risk: 18.5, ret: 10.5, color: "#ef4444", size: 7 },
  ];

  const maxRisk = 22;
  const minRisk = 4;
  const minRet = 5;
  const maxRet = 14;

  const toX = (r: number) => PAD.l + ((r - minRisk) / (maxRisk - minRisk)) * cW;
  const toY = (ret: number) => PAD.t + cH - ((ret - minRet) / (maxRet - minRet)) * cH;

  const xGrids = [5, 10, 15, 20];
  const yGrids = [6, 8, 10, 12, 14];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
      {xGrids.map((v) => (
        <line key={`xg-${v}`} x1={toX(v)} x2={toX(v)} y1={PAD.t} y2={PAD.t + cH} stroke="#27272a" strokeWidth="1" />
      ))}
      {yGrids.map((v) => (
        <line key={`yg-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {xGrids.map((v) => (
        <text key={`xgl-${v}`} x={toX(v)} y={PAD.t + cH + 14} textAnchor="middle" fontSize="9" fill="#71717a">
          {v}%
        </text>
      ))}
      {yGrids.map((v) => (
        <text key={`ygl-${v}`} x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
          {v}%
        </text>
      ))}
      <text x={PAD.l + cW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#71717a">Volatility (Risk)</text>
      <text x={12} y={PAD.t + cH / 2} textAnchor="middle" fontSize="9" fill="#71717a" transform={`rotate(-90, 12, ${PAD.t + cH / 2})`}>Return</text>
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={toX(p.risk)} cy={toY(p.ret)} r={p.size} fill={p.color} opacity="0.85" />
          <text x={toX(p.risk) + p.size + 3} y={toY(p.ret) + 4} fontSize="8" fill="#a1a1aa">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Weather Derivatives Chart ──────────────────────────────────────────────────
function WeatherDerivativesChart() {
  const W = 480;
  const H = 180;
  const PAD = { l: 46, r: 20, t: 16, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const actualTemp = [32, 35, 45, 56, 66, 75, 82, 80, 72, 60, 48, 37];
  const normalTemp = [34, 37, 47, 58, 68, 76, 81, 79, 71, 59, 47, 38];
  const baseline = 65;

  const minT = 25;
  const maxT = 90;
  const toX = (i: number) => PAD.l + (i / (months.length - 1)) * cW;
  const toY = (t: number) => PAD.t + cH - ((t - minT) / (maxT - minT)) * cH;

  const actualPath = actualTemp.map((t, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(t)}`).join(" ");
  const normalPath = normalTemp.map((t, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(t)}`).join(" ");

  const hddMonths = actualTemp.filter((t) => t < baseline).length;
  const cddMonths = actualTemp.filter((t) => t > baseline).length;
  void hddMonths; void cddMonths;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {[30, 45, 60, 75, 90].map((v) => (
        <line key={`tg-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {[30, 45, 60, 75, 90].map((v) => (
        <text key={`tgl-${v}`} x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
          {v}°F
        </text>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={toY(baseline)} y2={toY(baseline)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" />
      <text x={W - PAD.r + 2} y={toY(baseline) + 4} fontSize="8" fill="#f59e0b">65°F</text>
      <path d={normalPath} fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="6,3" />
      <path d={actualPath} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
      {months.map((m, i) => (
        <text key={`ml-${i}`} x={toX(i)} y={H - PAD.b + 14} textAnchor="middle" fontSize="8" fill="#71717a">
          {m}
        </text>
      ))}
      <rect x={PAD.l + cW - 120} y={PAD.t} width="8" height="8" fill="#34d399" rx="1" />
      <text x={PAD.l + cW - 108} y={PAD.t + 7} fontSize="8" fill="#a1a1aa">Actual</text>
      <line x1={PAD.l + cW - 68} y1={PAD.t + 4} x2={PAD.l + cW - 58} y2={PAD.t + 4} stroke="#52525b" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={PAD.l + cW - 53} y={PAD.t + 7} fontSize="8" fill="#a1a1aa">30yr Avg</text>
    </svg>
  );
}

// ── Trigger Type Cards ─────────────────────────────────────────────────────────
const TRIGGER_TYPES = [
  {
    type: "Indemnity",
    color: "purple",
    description: "Payout triggered by the actual losses of the sponsoring insurer.",
    pros: ["No basis risk", "Aligns with insurer's actual exposure", "Most natural hedge"],
    cons: ["Moral hazard concerns", "Long claims settlement period (2–4 yrs)", "Complex auditing required"],
    basisRisk: "None",
    moralHazard: "High",
    settleTime: "24–48 months",
  },
  {
    type: "PCS Index",
    color: "blue",
    description: "Payout based on industry-wide loss indices (e.g. PCS, PERILS, SIGMA).",
    pros: ["Transparent, third-party data", "Faster settlement (6–18 mo)", "Standardized, tradable"],
    cons: ["Basis risk vs sponsor losses", "Index may not reflect portfolio", "Limited perils/regions"],
    basisRisk: "Moderate",
    moralHazard: "Low",
    settleTime: "6–18 months",
  },
  {
    type: "Parametric",
    color: "emerald",
    description: "Payout triggered by physical parameters (wind speed, magnitude, rainfall).",
    pros: ["Fastest settlement (days–weeks)", "Zero moral hazard", "Fully transparent trigger"],
    cons: ["Highest basis risk", "Parameter may not correlate with loss", "Location-specific limits"],
    basisRisk: "High",
    moralHazard: "None",
    settleTime: "Days–weeks",
  },
];

// ── ILS vs Traditional Reinsurance Table ──────────────────────────────────────
const ILS_COMPARISON = [
  { metric: "Market Correlation", ils: "~0.0 (uncorrelated)", trad: "0.25–0.45 (moderate)" },
  { metric: "Collateral", ils: "Fully collateralized", trad: "Partial / rated balance sheet" },
  { metric: "Credit Risk", ils: "Negligible (SPV structure)", trad: "Counterparty credit risk" },
  { metric: "Basis Risk", ils: "Varies by trigger type", trad: "Low (indemnity standard)" },
  { metric: "Capital Relief", ils: "100% Solvency II relief", trad: "Partial, subject to rating" },
  { metric: "Pricing Transparency", ils: "Market-driven, spread quoted", trad: "Negotiated, less transparent" },
  { metric: "Investor Universe", ils: "Capital market investors", trad: "Reinsurers only" },
  { metric: "Settlement Speed", ils: "Variable by trigger", trad: "Indemnity: 1–3 years" },
];

// ── Page Component ─────────────────────────────────────────────────────────────
export default function InsuranceDerivativesPage() {
  const [selectedBond, setSelectedBond] = useState<string | null>(null);

  const bond = CAT_BONDS.find((b) => b.id === selectedBond);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-400" />
            Insurance-Linked Securities & CAT Bonds
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Catastrophe bond market, ILS structures, trigger types, and weather derivatives
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-amber-400 border-amber-400/30">
            ILS Market ~$105B
          </Badge>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
            Uncorrelated Alpha
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="market">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="market">CAT Bond Market</TabsTrigger>
          <TabsTrigger value="risk">Risk Modeling</TabsTrigger>
          <TabsTrigger value="ils">ILS vs Reinsurance</TabsTrigger>
          <TabsTrigger value="triggers">Trigger Types</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="weather">Weather Derivatives</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: CAT Bond Market ── */}
        <TabsContent value="market" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-zinc-500">Total ILS Market</p>
                <p className="text-2xl font-semibold text-white mt-1">$105.4B</p>
                <p className="text-xs text-emerald-400 mt-1">+12% YoY</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-zinc-500">Avg CAT Bond Spread</p>
                <p className="text-2xl font-semibold text-white mt-1">SOFR + 6.8%</p>
                <p className="text-xs text-amber-400 mt-1">Near 10yr highs</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-zinc-500">Active Issuances (2024)</p>
                <p className="text-2xl font-semibold text-white mt-1">48 Tranches</p>
                <p className="text-xs text-blue-400 mt-1">$16.2B new issuance</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Active CAT Bonds</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left text-zinc-500 px-4 py-2 font-medium">Bond</th>
                          <th className="text-left text-zinc-500 px-4 py-2 font-medium">Peril</th>
                          <th className="text-left text-zinc-500 px-4 py-2 font-medium">Trigger</th>
                          <th className="text-right text-zinc-500 px-4 py-2 font-medium">Coupon</th>
                          <th className="text-right text-zinc-500 px-4 py-2 font-medium">EL%</th>
                          <th className="text-right text-zinc-500 px-4 py-2 font-medium">Size ($M)</th>
                          <th className="text-center text-zinc-500 px-4 py-2 font-medium">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CAT_BONDS.map((b) => (
                          <tr
                            key={b.id}
                            onClick={() => setSelectedBond(b.id === selectedBond ? null : b.id)}
                            className={cn(
                              "border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/40 transition-colors",
                              selectedBond === b.id && "bg-zinc-800/60"
                            )}
                          >
                            <td className="px-4 py-2.5">
                              <p className="text-white font-medium">{b.name}</p>
                              <p className="text-zinc-500">{b.issuer}</p>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={cn("flex items-center gap-1", PERIL_COLORS[b.peril])}>
                                {PERIL_ICONS[b.peril]}
                                {b.peril}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className={cn("text-xs", TRIGGER_COLORS[b.trigger])}>
                                {b.trigger}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-right text-emerald-400">
                              {(b.sofr + b.spread).toFixed(2)}%
                            </td>
                            <td className="px-4 py-2.5 text-right text-amber-400">{b.expectedLoss.toFixed(1)}%</td>
                            <td className="px-4 py-2.5 text-right text-white">${b.outstanding}</td>
                            <td className="px-4 py-2.5 text-center">
                              <Badge variant="outline" className="text-xs text-zinc-300 border-zinc-700">
                                {b.rating}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Bond Detail */}
            <div>
              {bond ? (
                <Card className="bg-zinc-900 border-zinc-800 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-300">{bond.name}</CardTitle>
                    <p className="text-xs text-zinc-500">{bond.issuer}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-800/60 rounded p-2">
                        <p className="text-zinc-500">Coupon</p>
                        <p className="text-emerald-400 font-medium text-base">
                          {(bond.sofr + bond.spread).toFixed(2)}%
                        </p>
                        <p className="text-zinc-600">SOFR+{bond.spread}%</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded p-2">
                        <p className="text-zinc-500">Expected Loss</p>
                        <p className="text-amber-400 font-medium text-base">{bond.expectedLoss.toFixed(1)}%</p>
                        <p className="text-zinc-600">Annual</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-500">Attachment / Exhaustion Layer</p>
                      <div className="relative h-6 bg-zinc-800 rounded overflow-hidden">
                        <div
                          className="absolute h-full bg-amber-500/40 border-l-2 border-r-2 border-amber-500"
                          style={{
                            left: `${(bond.attachment / 500) * 100}%`,
                            width: `${((bond.exhaustion - bond.attachment) / 500) * 100}%`,
                          }}
                        />
                        <span className="absolute left-1 top-1 text-zinc-400 text-xs">${bond.attachment}M</span>
                        <span className="absolute right-1 top-1 text-zinc-400 text-xs">${bond.exhaustion}M</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: "Peril", value: bond.peril },
                        { label: "Trigger", value: bond.trigger },
                        { label: "Size", value: `$${bond.outstanding}M` },
                        { label: "Rating", value: bond.rating },
                        { label: "Multiples on EL", value: `${(bond.spread / bond.expectedLoss).toFixed(1)}×` },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between">
                          <span className="text-zinc-500">{r.label}</span>
                          <span className="text-zinc-200">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900 border-zinc-800 h-full flex items-center justify-center">
                  <div className="text-center p-6">
                    <Shield className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">Select a bond</p>
                    <p className="text-zinc-600 text-xs mt-1">Click any row for details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Risk Modeling ── */}
        <TabsContent value="risk" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  Loss Exceedance Probability Curve
                </CardTitle>
                <p className="text-xs text-zinc-500">Probability of exceeding a given industry loss level</p>
              </CardHeader>
              <CardContent>
                <LossExceedanceCurve />
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  X-axis: Return period (log scale) — Y-axis: Gross industry loss ($B)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-blue-400" />
                  Return Period Event Loss Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-zinc-500 py-2 font-medium">Return Period</th>
                      <th className="text-left text-zinc-500 py-2 font-medium">Annual Prob.</th>
                      <th className="text-right text-zinc-500 py-2 font-medium">Industry Loss</th>
                      <th className="text-right text-zinc-500 py-2 font-medium">CAT Bond Layer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXCEEDANCE_POINTS.map((p) => (
                      <tr key={p.returnPeriod} className="border-b border-zinc-800/50">
                        <td className="py-2 text-white font-medium">{p.returnPeriod}-year</td>
                        <td className="py-2 text-zinc-400">{p.annualProb.toFixed(2)}%</td>
                        <td className="py-2 text-right text-amber-400">${p.loss}B</td>
                        <td className="py-2 text-right">
                          {p.loss >= 80 ? (
                            <span className="text-red-400">At risk</span>
                          ) : p.loss >= 50 ? (
                            <span className="text-amber-400">Attachment zone</span>
                          ) : (
                            <span className="text-emerald-400">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                label: "100-Year Event Loss",
                value: "$125B",
                sub: "1% annual exceedance",
                color: "text-amber-400",
                icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
              },
              {
                label: "250-Year Event Loss",
                value: "$258B",
                sub: "0.4% annual exceedance",
                color: "text-orange-400",
                icon: <Target className="h-5 w-5 text-orange-400" />,
              },
              {
                label: "500-Year Event Loss",
                value: "$380B",
                sub: "0.2% annual exceedance",
                color: "text-red-400",
                icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
              },
            ].map((item) => (
              <Card key={item.label} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    {item.icon}
                    <div>
                      <p className="text-xs text-zinc-500">{item.label}</p>
                      <p className={cn("text-2xl font-semibold mt-1", item.color)}>{item.value}</p>
                      <p className="text-xs text-zinc-500 mt-1">{item.sub}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">Catastrophe Risk Model Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { stage: "Hazard Module", desc: "Physical characteristics of the event (wind speed, PGA, surge height)", color: "border-blue-500/30 bg-blue-500/5" },
                  { stage: "Vulnerability Module", desc: "Damage functions mapping hazard intensity to mean damage ratios by construction type", color: "border-amber-500/30 bg-amber-500/5" },
                  { stage: "Exposure Module", desc: "Geo-coded insured values, occupancy types, policy terms and conditions", color: "border-purple-500/30 bg-purple-500/5" },
                  { stage: "Financial Module", desc: "Applies policy terms, reinsurance structure, occurrence and aggregate limits", color: "border-emerald-500/30 bg-emerald-500/5" },
                ].map((s) => (
                  <div key={s.stage} className={cn("rounded-lg border p-3", s.color)}>
                    <p className="text-white font-medium mb-1">{s.stage}</p>
                    <p className="text-zinc-400">{s.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: ILS vs Reinsurance ── */}
        <TabsContent value="ils" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300">ILS vs Traditional Reinsurance</CardTitle>
              </CardHeader>
              <CardContent>
                <ILSComparisonChart />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
                    <p className="text-emerald-300 font-medium">ILS Advantage</p>
                    <p className="text-zinc-400 mt-1">Near-zero correlation to equities makes ILS a powerful diversifier in multi-asset portfolios.</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                    <p className="text-blue-300 font-medium">Reinsurance Advantage</p>
                    <p className="text-zinc-400 mt-1">Long-standing relationships, broader peril coverage, and established claims handling expertise.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300">Comparison Table</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-zinc-500 px-4 py-2 font-medium">Metric</th>
                      <th className="text-left text-emerald-500 px-4 py-2 font-medium">ILS / CAT Bond</th>
                      <th className="text-left text-blue-500 px-4 py-2 font-medium">Traditional Re</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ILS_COMPARISON.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-800/50">
                        <td className="px-4 py-2 text-zinc-400">{row.metric}</td>
                        <td className="px-4 py-2 text-emerald-300">{row.ils}</td>
                        <td className="px-4 py-2 text-blue-300">{row.trad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">CAT Bond SPV Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 text-xs overflow-x-auto pb-2">
                {[
                  { label: "Cedent\n(Sponsor)", sub: "Insurance / Re co.", color: "bg-blue-500/20 border-blue-500/40" },
                  { label: "Reinsurance\nAgreement", sub: "Premium payments", color: "bg-zinc-800 border-zinc-700", arrow: true },
                  { label: "SPV\n(Special Purpose Vehicle)", sub: "Cayman / Bermuda", color: "bg-amber-500/20 border-amber-500/40" },
                  { label: "CAT Bond\nIssuance", sub: "Principal proceeds", color: "bg-zinc-800 border-zinc-700", arrow: true },
                  { label: "Capital Market\nInvestors", sub: "Hedge funds, pension, ILS funds", color: "bg-emerald-500/20 border-emerald-500/40" },
                ].map((node, i) => (
                  <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    {node.arrow ? (
                      <div className="flex flex-col items-center text-zinc-500 px-1">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                    ) : null}
                    <div className={cn("rounded-lg border p-2.5 text-center min-w-[90px]", node.color)}>
                      {node.label.split("\n").map((l, li) => (
                        <p key={li} className={cn("font-medium", li === 0 ? "text-white" : "text-white")}>{l}</p>
                      ))}
                      <p className="text-zinc-500 text-xs mt-0.5">{node.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Collateral held in AAA-rated money market funds or US Treasuries in the SPV. Loss payments flow from SPV to cedent; surviving principal returned to investors at maturity.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Trigger Types ── */}
        <TabsContent value="triggers" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRIGGER_TYPES.map((t) => (
              <Card key={t.type} className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", TRIGGER_COLORS[t.type])}>
                      {t.type}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-zinc-400 mt-2">{t.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-emerald-400 font-medium mb-1.5">Advantages</p>
                    <ul className="space-y-1">
                      {t.pros.map((p) => (
                        <li key={p} className="flex items-start gap-1.5 text-xs text-zinc-300">
                          <CheckCircle className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 font-medium mb-1.5">Disadvantages</p>
                    <ul className="space-y-1">
                      {t.cons.map((c) => (
                        <li key={c} className="flex items-start gap-1.5 text-xs text-zinc-300">
                          <XCircle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-zinc-800 pt-2 space-y-1 text-xs">
                    {[
                      { label: "Basis Risk", value: t.basisRisk },
                      { label: "Moral Hazard", value: t.moralHazard },
                      { label: "Settlement", value: t.settleTime },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between">
                        <span className="text-zinc-500">{r.label}</span>
                        <span className="text-zinc-200">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">Basis Risk vs Moral Hazard Trade-off</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-24 bg-zinc-800/40 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-between px-6">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Moral Hazard</p>
                    <div className="flex gap-1.5 mt-2 items-end">
                      {[
                        { label: "Indemnity", h: 80, color: "bg-purple-500" },
                        { label: "PCS", h: 35, color: "bg-blue-500" },
                        { label: "Parametric", h: 8, color: "bg-emerald-500" },
                      ].map((b) => (
                        <div key={b.label} className="flex flex-col items-center gap-1">
                          <div className={cn("w-8 rounded-sm", b.color)} style={{ height: `${b.h * 0.5}px` }} />
                          <p className="text-xs text-zinc-500">{b.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-center px-8 text-xs text-zinc-400">
                    <p className="text-amber-400 font-medium">Key Trade-off</p>
                    <p className="mt-1">Reducing moral hazard introduces basis risk — the mismatch between trigger payment and actual loss.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Basis Risk</p>
                    <div className="flex gap-1.5 mt-2 items-end">
                      {[
                        { label: "Indemnity", h: 5, color: "bg-purple-500" },
                        { label: "PCS", h: 45, color: "bg-blue-500" },
                        { label: "Parametric", h: 85, color: "bg-emerald-500" },
                      ].map((b) => (
                        <div key={b.label} className="flex flex-col items-center gap-1">
                          <div className={cn("w-8 rounded-sm", b.color)} style={{ height: `${b.h * 0.5}px` }} />
                          <p className="text-xs text-zinc-500">{b.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Portfolio Construction ── */}
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  Risk / Return by Peril Type
                </CardTitle>
                <p className="text-xs text-zinc-500">CAT bonds vs traditional assets — annualized</p>
              </CardHeader>
              <CardContent>
                <PortfolioScatterChart />
                <div className="flex gap-4 mt-2 text-xs text-zinc-500 justify-center">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Hurricane</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Earthquake</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Flood</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400 inline-block" />60/40+ILS</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300">Portfolio Diversification Benefit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "60/40 Sharpe Ratio", value: "0.68", note: "Without ILS", color: "text-zinc-300" },
                    { label: "60/40 + 10% ILS Sharpe", value: "0.84", note: "+24% improvement", color: "text-emerald-400" },
                    { label: "ILS Correlation to S&P 500", value: "0.03", note: "Near-zero", color: "text-blue-400" },
                    { label: "ILS Correlation to AGG", value: "-0.02", note: "Slightly negative", color: "text-purple-400" },
                  ].map((m) => (
                    <div key={m.label} className="bg-zinc-800/60 rounded p-2.5">
                      <p className="text-zinc-500">{m.label}</p>
                      <p className={cn("text-xl font-semibold mt-1", m.color)}>{m.value}</p>
                      <p className="text-zinc-500 mt-0.5">{m.note}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-zinc-800 rounded-lg p-3 space-y-2 text-xs">
                  <p className="text-zinc-300 font-medium">Why ILS Diversifies</p>
                  <p className="text-zinc-400">
                    CAT bond returns are driven by natural catastrophe occurrence — entirely uncorrelated with interest rates, credit cycles, equity valuations, or GDP growth. A hurricane does not care about Fed policy.
                  </p>
                  <p className="text-zinc-400">
                    This makes ILS one of the few genuinely uncorrelated return streams available to institutional investors, alongside commodities and certain private credit strategies.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { label: "Optimal Allocation", value: "10–15%", color: "text-emerald-400" },
                    { label: "Min Portfolio Size", value: "$50M+", color: "text-blue-400" },
                    { label: "Typical Liquidity", value: "Secondary mkt", color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-800/40 rounded p-2 text-center">
                      <p className={cn("font-semibold", s.color)}>{s.value}</p>
                      <p className="text-zinc-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">Peril Correlation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="text-xs w-full max-w-md">
                  <thead>
                    <tr>
                      <th className="text-left text-zinc-500 py-1.5 pr-4 font-medium" />
                      {["US Hurricane", "US Earthquake", "EU Flood", "JP Typhoon", "US Equities"].map((h) => (
                        <th key={h} className="text-center text-zinc-500 py-1.5 px-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { row: "US Hurricane", vals: [1.00, 0.02, 0.01, 0.05, 0.03] },
                      { row: "US Earthquake", vals: [0.02, 1.00, 0.01, 0.08, 0.02] },
                      { row: "EU Flood", vals: [0.01, 0.01, 1.00, 0.02, 0.01] },
                      { row: "JP Typhoon", vals: [0.05, 0.08, 0.02, 1.00, 0.02] },
                      { row: "US Equities", vals: [0.03, 0.02, 0.01, 0.02, 1.00] },
                    ].map((r) => (
                      <tr key={r.row} className="border-b border-zinc-800/50">
                        <td className="text-zinc-400 py-1.5 pr-4">{r.row}</td>
                        {r.vals.map((v, i) => (
                          <td
                            key={i}
                            className={cn(
                              "text-center py-1.5 px-2 font-mono",
                              v === 1.0 ? "text-zinc-500" : v < 0.1 ? "text-emerald-400" : "text-amber-400"
                            )}
                          >
                            {v.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Near-zero correlations across all peril pairs confirm the diversification benefits of a multi-peril ILS portfolio.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 6: Weather Derivatives ── */}
        <TabsContent value="weather" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                label: "HDD Contract",
                value: "Heating Degree Days",
                desc: "Max(0, 65°F – Avg daily temp). Energy demand proxy in winter months.",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
                icon: <Thermometer className="h-5 w-5 text-blue-400" />,
              },
              {
                label: "CDD Contract",
                value: "Cooling Degree Days",
                desc: "Max(0, Avg daily temp – 65°F). Summer cooling demand proxy for utilities.",
                color: "text-orange-400",
                bg: "bg-orange-500/10 border-orange-500/20",
                icon: <Thermometer className="h-5 w-5 text-orange-400" />,
              },
              {
                label: "Precipitation",
                value: "Rainfall Swap",
                desc: "Fixed vs floating rainfall mm. Agriculture, hydro power, construction sectors.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10 border-cyan-500/20",
                icon: <Waves className="h-5 w-5 text-cyan-400" />,
              },
            ].map((item) => (
              <Card key={item.label} className={cn("border", item.bg.replace("bg-", "bg-").split(" ")[0], item.bg.split(" ")[1])}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-2">
                    {item.icon}
                    <div>
                      <p className={cn("font-semibold text-sm", item.color)}>{item.label}</p>
                      <p className="text-white text-xs font-medium mt-0.5">{item.value}</p>
                      <p className="text-zinc-400 text-xs mt-1">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-amber-400" />
                  Temperature vs 30-Year Average
                </CardTitle>
                <p className="text-xs text-zinc-500">Basis for HDD/CDD settlement — 65°F reference</p>
              </CardHeader>
              <CardContent>
                <WeatherDerivativesChart />
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Temperature Swap Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="border border-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-300 font-medium mb-2">Example: HDD Swap — Chicago Winter</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Reference Station", value: "Chicago O'Hare (ORD)" },
                      { label: "Contract Period", value: "Nov 1 – Mar 31" },
                      { label: "Strike (Fixed HDD)", value: "2,850 HDD" },
                      { label: "Tick Size", value: "$5,000 per HDD" },
                      { label: "Max Payout", value: "$10M (cap at 2,000 HDD)" },
                      { label: "Settlement", value: "Cash, 30 days post-period" },
                    ].map((r) => (
                      <div key={r.label}>
                        <p className="text-zinc-500">{r.label}</p>
                        <p className="text-zinc-200">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-300 font-medium mb-1">Payoff Formula</p>
                  <p className="text-zinc-400 font-mono bg-zinc-800/60 rounded p-2 text-xs">
                    Payoff = (Actual HDD − Strike) × $5,000<br />
                    Capped at max payout; floored at zero for buyer
                  </p>
                  <p className="text-zinc-500 mt-2">A utility expecting high heating demand buys HDDs to hedge revenue risk from a warm winter.</p>
                </div>

                <div>
                  <p className="text-zinc-400 font-medium mb-2">Agriculture Risk Hedging Applications</p>
                  <div className="space-y-1.5">
                    {[
                      { crop: "Corn / Soybeans", weather: "Growing season rainfall", hedge: "Precipitation swap (buy rain)" },
                      { crop: "Citrus / Stone Fruit", weather: "Late spring frost events", hedge: "Temperature put options" },
                      { crop: "Wheat", weather: "Drought risk index", hedge: "PDSI-linked derivative" },
                      { crop: "Wine Grapes", weather: "Harvest temp & moisture", hedge: "Custom parametric structure" },
                    ].map((r) => (
                      <div key={r.crop} className="flex items-center gap-2 bg-zinc-800/40 rounded p-2">
                        <span className="text-zinc-300 w-28 flex-shrink-0">{r.crop}</span>
                        <span className="text-zinc-500 flex-1">{r.weather}</span>
                        <span className="text-emerald-400">{r.hedge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">Weather Derivatives Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { label: "Annual Market Size", value: "~$3–5B", sub: "Notional outstanding", color: "text-amber-400" },
                  { label: "CME Listed Contracts", value: "24 Cities", sub: "US, EU, Asia-Pacific", color: "text-blue-400" },
                  { label: "Primary Users", value: "Energy Utilities", sub: "+ Agriculture & Tourism", color: "text-emerald-400" },
                  { label: "OTC vs Exchange", value: "~70% OTC", sub: "Custom structures dominate", color: "text-purple-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-800/40 rounded-lg p-3">
                    <p className="text-zinc-500">{s.label}</p>
                    <p className={cn("text-xl font-semibold mt-1", s.color)}>{s.value}</p>
                    <p className="text-zinc-500 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
