"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  TrendingUp,
  DollarSign,
  BarChart2,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  Target,
  PieChart,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 963;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Data ───────────────────────────────────────────────────────────────────────

interface AssetAllocationItem {
  label: string;
  pcPct: number;
  lifePct: number;
  color: string;
}

const ASSET_ALLOCATION: AssetAllocationItem[] = [
  { label: "IG Bonds", pcPct: 55, lifePct: 72, color: "#6366f1" },
  { label: "Gov Bonds", pcPct: 18, lifePct: 12, color: "#8b5cf6" },
  { label: "Equities", pcPct: 14, lifePct: 4, color: "#10b981" },
  { label: "Alternatives", pcPct: 8, lifePct: 8, color: "#f59e0b" },
  { label: "Cash/ST", pcPct: 5, lifePct: 4, color: "#64748b" },
];

interface AnnuityRow {
  type: string;
  returnType: string;
  risk: string;
  liquidityRisk: string;
  taxTreatment: string;
  bestFor: string;
}

const ANNUITY_TYPES: AnnuityRow[] = [
  {
    type: "Fixed",
    returnType: "Guaranteed rate",
    risk: "Low",
    liquidityRisk: "High",
    taxTreatment: "Tax-deferred",
    bestFor: "Conservative retirees",
  },
  {
    type: "Variable",
    returnType: "Sub-account performance",
    risk: "High",
    liquidityRisk: "High",
    taxTreatment: "Tax-deferred",
    bestFor: "Growth-oriented investors",
  },
  {
    type: "Indexed (FIA)",
    returnType: "Index-linked w/ cap",
    risk: "Medium",
    liquidityRisk: "High",
    taxTreatment: "Tax-deferred",
    bestFor: "Moderate risk tolerance",
  },
  {
    type: "SPIA",
    returnType: "Fixed income stream",
    risk: "Longevity risk transfer",
    liquidityRisk: "Very High",
    taxTreatment: "Partial exclusion ratio",
    bestFor: "Retirees needing income",
  },
  {
    type: "Deferred Income",
    returnType: "Future income stream",
    risk: "Low (longevity hedge)",
    liquidityRisk: "Very High",
    taxTreatment: "Tax-deferred",
    bestFor: "Longevity insurance hedge",
  },
];

interface InsuranceStock {
  name: string;
  ticker: string;
  type: string;
  combRatio: number;
  roe: number;
  pb: number;
  rating: "Buy" | "Watch" | "Hold";
}

const INSURANCE_STOCKS: InsuranceStock[] = [
  { name: "Berkshire Hathaway", ticker: "BRK.B", type: "P&C Conglomerate", combRatio: 92.5, roe: 17.8, pb: 1.6, rating: "Buy" },
  { name: "Progressive Corp", ticker: "PGR", type: "P&C Auto", combRatio: 91.2, roe: 22.4, pb: 5.1, rating: "Buy" },
  { name: "Markel Group", ticker: "MKL", type: "P&C Specialty", combRatio: 93.8, roe: 14.2, pb: 1.5, rating: "Buy" },
  { name: "Chubb Limited", ticker: "CB", type: "P&C Commercial", combRatio: 87.6, roe: 13.9, pb: 1.7, rating: "Buy" },
  { name: "Munich Re", ticker: "MUV2", type: "Reinsurer", combRatio: 85.3, roe: 15.1, pb: 1.4, rating: "Watch" },
  { name: "MetLife", ticker: "MET", type: "Life/Annuity", combRatio: 99.1, roe: 12.2, pb: 0.9, rating: "Hold" },
];

const COMBINED_RATIO_DATA = [
  { year: "2019", industry: 99.1, berkshire: 93.2, progressive: 95.8 },
  { year: "2020", industry: 101.4, berkshire: 95.7, progressive: 92.9 },
  { year: "2021", industry: 100.2, berkshire: 92.5, progressive: 96.1 },
  { year: "2022", industry: 102.8, berkshire: 91.8, progressive: 103.4 },
  { year: "2023", industry: 101.6, berkshire: 90.9, progressive: 94.7 },
  { year: "2024", industry: 98.3, berkshire: 92.5, progressive: 91.2 },
];

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function AssetAllocationChart() {
  const W = 520;
  const H = 220;
  const PAD = { l: 44, r: 16, t: 24, b: 40 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const barCount = ASSET_ALLOCATION.length;
  const groupW = chartW / barCount;
  const barW = (groupW - 12) / 2;
  const maxVal = 80;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
      <defs>
        <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="lifeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {[0, 20, 40, 60, 80].map((v) => {
        const y = PAD.t + chartH - (v / maxVal) * chartH;
        return (
          <g key={`gl-${v}`}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#27272a" strokeWidth="1" />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fill="#71717a" fontSize="9">{v}%</text>
          </g>
        );
      })}
      {ASSET_ALLOCATION.map((d, i) => {
        const gx = PAD.l + i * groupW;
        const bx1 = gx + 4;
        const bx2 = bx1 + barW + 4;
        const h1 = (d.pcPct / maxVal) * chartH;
        const h2 = (d.lifePct / maxVal) * chartH;
        const y1 = PAD.t + chartH - h1;
        const y2 = PAD.t + chartH - h2;
        return (
          <g key={`bar-${i}`}>
            <rect x={bx1} y={y1} width={barW} height={h1} rx="2" fill="url(#pcGrad)" />
            <rect x={bx2} y={y2} width={barW} height={h2} rx="2" fill="url(#lifeGrad)" />
            <text x={gx + groupW / 2} y={H - PAD.b + 14} textAnchor="middle" fill="#a1a1aa" fontSize="9">{d.label}</text>
          </g>
        );
      })}
      <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + chartH} y2={PAD.t + chartH} stroke="#3f3f46" strokeWidth="1" />
      {/* Legend */}
      <rect x={PAD.l} y={H - 10} width={10} height={7} rx="1" fill="#6366f1" />
      <text x={PAD.l + 13} y={H - 4} fill="#a1a1aa" fontSize="9">P&C Insurer</text>
      <rect x={PAD.l + 80} y={H - 10} width={10} height={7} rx="1" fill="#10b981" />
      <text x={PAD.l + 93} y={H - 4} fill="#a1a1aa" fontSize="9">Life Insurer</text>
    </svg>
  );
}

function DurationMatchingChart() {
  const W = 520;
  const H = 180;
  const PAD = { l: 60, r: 16, t: 24, b: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  // Stylized duration mismatch bars
  const items = [
    { label: "P&C Assets", dur: 2.5, col: "#6366f1" },
    { label: "P&C Liabilities", dur: 1.8, col: "#8b5cf6" },
    { label: "Life Assets", dur: 18, col: "#10b981" },
    { label: "Life Liabilities", dur: 24, col: "#34d399" },
  ];
  const maxDur = 28;
  const bH = chartH / items.length - 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {[0, 7, 14, 21, 28].map((v) => {
        const x = PAD.l + (v / maxDur) * chartW;
        return (
          <g key={`vg-${v}`}>
            <line x1={x} x2={x} y1={PAD.t} y2={PAD.t + chartH} stroke="#27272a" strokeWidth="1" />
            <text x={x} y={PAD.t + chartH + 14} textAnchor="middle" fill="#71717a" fontSize="9">{v}yr</text>
          </g>
        );
      })}
      {items.map((item, i) => {
        const y = PAD.t + i * (bH + 6);
        const bw = (item.dur / maxDur) * chartW;
        return (
          <g key={`dur-${i}`}>
            <text x={PAD.l - 6} y={y + bH / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize="9">{item.label}</text>
            <rect x={PAD.l} y={y} width={bw} height={bH} rx="2" fill={item.col} fillOpacity="0.7" />
            <text x={PAD.l + bw + 4} y={y + bH / 2 + 4} fill={item.col} fontSize="9" fontWeight="600">{item.dur}yr</text>
          </g>
        );
      })}
    </svg>
  );
}

function CombinedRatioChart() {
  const W = 520;
  const H = 200;
  const PAD = { l: 44, r: 16, t: 24, b: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const minY = 84;
  const maxY = 106;
  const toX = (i: number) => PAD.l + (i / (COMBINED_RATIO_DATA.length - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - ((v - minY) / (maxY - minY)) * chartH;

  const lines = [
    { key: "industry" as const, color: "#f59e0b", label: "Industry Avg" },
    { key: "berkshire" as const, color: "#6366f1", label: "Berkshire" },
    { key: "progressive" as const, color: "#10b981", label: "Progressive" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <defs>
        <line id="profitLine" />
      </defs>
      {[86, 90, 94, 98, 102, 106].map((v) => {
        const y = toY(v);
        return (
          <g key={`hl-${v}`}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y}
              stroke={v === 100 ? "#ef4444" : "#27272a"}
              strokeWidth={v === 100 ? 1.5 : 1}
              strokeDasharray={v === 100 ? "4,3" : "none"} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fill={v === 100 ? "#ef4444" : "#71717a"} fontSize="9">{v}</text>
          </g>
        );
      })}
      <text x={W - PAD.r} y={toY(100) - 4} textAnchor="end" fill="#ef4444" fontSize="8">Breakeven</text>
      {COMBINED_RATIO_DATA.map((d, i) => (
        <text key={`xl-${i}`} x={toX(i)} y={PAD.t + chartH + 16} textAnchor="middle" fill="#71717a" fontSize="9">{d.year}</text>
      ))}
      {lines.map(({ key, color, label }, li) => {
        const pts = COMBINED_RATIO_DATA.map((d, i) => `${toX(i)},${toY(d[key])}`).join(" ");
        return (
          <g key={`line-${li}`}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            {COMBINED_RATIO_DATA.map((d, i) => (
              <circle key={`dot-${li}-${i}`} cx={toX(i)} cy={toY(d[key])} r="2.5" fill={color} />
            ))}
            <text x={W - PAD.r + 2} y={toY(COMBINED_RATIO_DATA[COMBINED_RATIO_DATA.length - 1][key]) + 4} fill={color} fontSize="8">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ILSMarketChart() {
  const W = 480;
  const H = 160;
  const PAD = { l: 44, r: 16, t: 20, b: 32 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const data = [
    { year: "2015", size: 22 },
    { year: "2016", size: 26 },
    { year: "2017", size: 30 },
    { year: "2018", size: 38 },
    { year: "2019", size: 48 },
    { year: "2020", size: 58 },
    { year: "2021", size: 72 },
    { year: "2022", size: 88 },
    { year: "2023", size: 100 },
    { year: "2024", size: 112 },
  ];
  const maxVal = 120;
  const toX = (i: number) => PAD.l + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / maxVal) * chartH;
  const area = [
    `${toX(0)},${PAD.t + chartH}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.size)}`),
    `${toX(data.length - 1)},${PAD.t + chartH}`,
  ].join(" ");
  const line = data.map((d, i) => `${toX(i)},${toY(d.size)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="ilsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 30, 60, 90, 120].map((v) => {
        const y = toY(v);
        return (
          <g key={`hl-${v}`}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#27272a" strokeWidth="1" />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fill="#71717a" fontSize="9">${v}B</text>
          </g>
        );
      })}
      {data.filter((_, i) => i % 2 === 0).map((d, j) => {
        const i = j * 2;
        return (
          <text key={`xl-${i}`} x={toX(i)} y={PAD.t + chartH + 14} textAnchor="middle" fill="#71717a" fontSize="8">{d.year}</text>
        );
      })}
      <polygon points={area} fill="url(#ilsGrad)" />
      <polyline points={line} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={`pt-${i}`} cx={toX(i)} cy={toY(d.size)} r="2.5" fill="#f59e0b" />
      ))}
      <text x={toX(data.length - 1)} y={toY(112) - 6} textAnchor="end" fill="#f59e0b" fontSize="10" fontWeight="700">$112B</text>
    </svg>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "text-indigo-400" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/40">
      <div className={cn("text-xl font-bold", color)}>{value}</div>
      <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Info Row ───────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, title, body }: {
  icon: React.ElementType; title: string; body: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/30">
      <Icon className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
      <div>
        <div className="text-xs font-semibold text-zinc-200">{title}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{body}</div>
      </div>
    </div>
  );
}

// ── Tab 1: Insurance Company Portfolios ───────────────────────────────────────
function PortfoliosTab() {
  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="IG Bond Allocation" value="70–80%" sub="Life insurer avg" color="text-indigo-400" />
        <StatCard label="P&C Portfolio Duration" value="1–3yr" sub="Short-dated claims" color="text-emerald-400" />
        <StatCard label="Life Insurer Duration" value="15–25yr" sub="30yr liability matching" color="text-violet-400" />
        <StatCard label="Float Return (BRK)" value="~1–2%" sub="Cost-free leverage" color="text-amber-400" />
      </div>

      {/* Asset Allocation SVG */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Asset Allocation: P&C vs Life Insurer</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetAllocationChart />
          <p className="text-xs text-zinc-500 mt-2">Life insurers hold 70–80% investment-grade bonds to match long-duration liabilities. P&C insurers favor shorter maturities aligned with 1–3yr claims payable cycles.</p>
        </CardContent>
      </Card>

      {/* Duration Matching */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Duration Matching (ALM)</CardTitle>
        </CardHeader>
        <CardContent>
          <DurationMatchingChart />
          <p className="text-xs text-zinc-500 mt-2">Life insurers deliberately mismatch assets slightly shorter than liabilities to pick up spread. P&C insurers maintain near-matched duration given unpredictable short-term claims.</p>
        </CardContent>
      </Card>

      {/* Dual Profit Centers */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Dual Profit Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-indigo-500/20">
              <div className="text-xs font-semibold text-indigo-400 mb-2">Underwriting Income</div>
              <div className="text-xs text-zinc-300 space-y-1">
                <div className="flex justify-between"><span>Premiums collected</span><span className="text-emerald-400">$100</span></div>
                <div className="flex justify-between"><span>— Losses paid</span><span className="text-red-400">−$60</span></div>
                <div className="flex justify-between"><span>— Expenses</span><span className="text-red-400">−$30</span></div>
                <div className="border-t border-zinc-700 pt-1 flex justify-between font-semibold"><span>Underwriting profit</span><span className="text-emerald-400">$10</span></div>
              </div>
              <div className="text-xs text-zinc-500 mt-2">Combined ratio = 90% (profitable)</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-emerald-500/20">
              <div className="text-xs font-semibold text-emerald-400 mb-2">Investment Income</div>
              <div className="text-xs text-zinc-300 space-y-1">
                <div className="flex justify-between"><span>Float (reserve pool)</span><span className="text-zinc-300">$500</span></div>
                <div className="flex justify-between"><span>× Investment yield</span><span className="text-zinc-300">4.5%</span></div>
                <div className="border-t border-zinc-700 pt-1 flex justify-between font-semibold"><span>Investment income</span><span className="text-emerald-400">$22.5</span></div>
              </div>
              <div className="text-xs text-zinc-500 mt-2">Berkshire model: even CR&gt;100 is fine if float generates returns</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/20">
            <span className="text-amber-400 font-semibold">Combined Ratio = </span>
            Loss Ratio + Expense Ratio. Below 100% = underwriting profit. The float (premiums held before claims paid) is invested, creating a second profit engine independent of underwriting results.
          </div>
        </CardContent>
      </Card>

      {/* Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoRow icon={Layers} title="Float-Funded Returns (Berkshire Model)" body="Berkshire collects premiums, invests the float in equities and subsidiaries, pays claims later. At CR=92%, they earn 8% on float plus investment returns — effectively free leverage." />
        <InfoRow icon={Activity} title="Spread Lending in Insurance" body="Life insurers borrow via annuities at ~3.5% (crediting rate) and invest in corporate bonds at ~5.5%, pocketing the ~2% spread. This is fundamental to life insurer profitability." />
        <InfoRow icon={TrendingUp} title="ALM (Asset-Liability Management)" body="Life companies match bond duration to liability duration to minimize interest rate risk. A 100bps rate rise that raises asset values by 8% but liability PV by 10% creates a mismatch." />
        <InfoRow icon={Target} title="Yield Enhancement via Alternatives" body="Apollo, KKR, and Blackstone now own life insurers (Athene, Global Atlantic, F&G) to invest premium float into private credit and PE — capturing 150–200bps over public bonds." />
      </div>
    </div>
  );
}

// ── Tab 2: Annuities ───────────────────────────────────────────────────────────
function AnnuitiesTab() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const details: string[] = [
    "Fixed annuities offer a guaranteed interest rate (e.g., 5.1% for 5 years). Principal protection with no market exposure. Surrender charges of 6–10% in early years restrict liquidity. Best for conservative retirees seeking CD-like certainty with tax deferral.",
    "Variable annuities invest in sub-accounts (mutual fund equivalents). Returns fluctuate with markets. Living benefits (GMWB, GLWB) add guaranteed withdrawal floors but cost 0.5–1.5% annually. M&E charges of 1–2%/yr make them expensive vehicles.",
    "Fixed Indexed Annuities link credits to an index (S&P 500) with a cap (e.g., 10%) and 0% floor. A 'participation rate' of 80% means you get 80% of index gains up to the cap. Complex crediting methods obscure true return potential.",
    "SPIAs convert a lump sum into an immediate income stream for life. A 70-year-old male might receive $625/month per $100k. Pricing embeds mortality tables and current interest rates. The 'exclusion ratio' makes a portion of income tax-free return of principal.",
    "DIAs/QLACs defer income start (e.g., to age 80). Lower initial premium for the same future income. Acts as pure longevity insurance. QLACs can be funded up to $200k from IRA assets, reducing RMDs in the interim years.",
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="US Annuity Market" value="$3.7T" sub="Total assets in-force" color="text-violet-400" />
        <StatCard label="SPIA Payout (70M)" value="~7.5%" sub="Per $100k, annual income" color="text-emerald-400" />
        <StatCard label="FIA Cap Rate (avg)" value="8–12%" sub="S&P 500 indexed" color="text-indigo-400" />
        <StatCard label="Surrender Charge" value="7–10yr" sub="Typical illiquidity period" color="text-red-400" />
      </div>

      {/* Comparison Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Annuity Type Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-700">
                  {["Type", "Return", "Risk", "Liquidity Risk", "Tax", "Best For"].map((h) => (
                    <th key={h} className="text-left py-2 pr-3 text-zinc-400 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ANNUITY_TYPES.map((row, i) => (
                  <React.Fragment key={`frag-${i}`}>
                    <tr
                      className="border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    >
                      <td className="py-2 pr-3 font-semibold text-zinc-200">{row.type}</td>
                      <td className="py-2 pr-3 text-zinc-300">{row.returnType}</td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline" className={cn("text-[10px]",
                          row.risk === "Low" || row.risk.includes("Low") ? "border-emerald-500/40 text-emerald-400" :
                          row.risk === "High" ? "border-red-500/40 text-red-400" :
                          "border-amber-500/40 text-amber-400"
                        )}>{row.risk}</Badge>
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]">{row.liquidityRisk}</Badge>
                      </td>
                      <td className="py-2 pr-3 text-zinc-400">{row.taxTreatment}</td>
                      <td className="py-2 pr-3 text-zinc-400">{row.bestFor}</td>
                    </tr>
                    <AnimatePresence>
                      {expandedRow === i && (
                        <tr key={`exp-${i}`}>
                          <td colSpan={6} className="pb-2">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-3 py-2 bg-zinc-800/40 rounded-lg text-xs text-zinc-400 border-l-2 border-indigo-500/40"
                            >
                              {details[i]}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Click any row for details.</p>
        </CardContent>
      </Card>

      {/* Living Benefits */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Living Benefits Explained</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: "GMWB", full: "Guaranteed Minimum Withdrawal Benefit", desc: "Guarantees you can withdraw a % of original premium (e.g., 5%/yr) regardless of account performance, until original benefit base is recovered. Cost: 0.5–0.75%/yr." },
              { name: "GLWB", full: "Guaranteed Lifetime Withdrawal Benefit", desc: "Like GMWB but extends for life. If account depletes, insurer continues payments. Annual step-up provisions ratchet the benefit base higher. Cost: 0.75–1.5%/yr." },
              { name: "GMAB", full: "Guaranteed Minimum Accumulation Benefit", desc: "Guarantees account value equals or exceeds a specified amount (e.g., original premium) at a specific future date. Protects against poor market performance over a defined term." },
            ].map((b) => (
              <div key={b.name} className="bg-zinc-800/50 rounded-xl p-3 border border-violet-500/20">
                <div className="text-xs font-bold text-violet-400">{b.name}</div>
                <div className="text-xs text-zinc-400 mt-0.5 mb-2">{b.full}</div>
                <div className="text-xs text-zinc-300">{b.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Annuity vs Bond Ladder */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Annuity vs Bond Ladder: Key Trade-offs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-indigo-400 mb-2">SPIA Advantages</div>
              <div className="space-y-1">
                {[
                  "Longevity risk pooling — mortality credits increase payout",
                  "Simplicity — no reinvestment decisions after purchase",
                  "Mortality-weighted returns exceed comparable bond yields",
                  "Cannot outlive the income stream",
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 text-xs text-zinc-300">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-400 mb-2">Bond Ladder Advantages</div>
              <div className="space-y-1">
                {[
                  "Full liquidity — bonds can be sold or passed to heirs",
                  "Transparent pricing — no insurance company markup",
                  "Flexibility to adjust for changing spending needs",
                  "No counterparty risk beyond FDIC/SIPC limits",
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 text-xs text-zinc-300">
                    <CheckCircle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-zinc-800/30 rounded-lg border border-zinc-700/20">
            <div className="text-xs text-zinc-400">
              <span className="text-zinc-300 font-semibold">1035 Exchange: </span>
              IRS allows annuity-to-annuity transfers without triggering taxable events. Enables switching to better-priced products while preserving tax-deferred status. Used to avoid surrender charges by waiting for charge-free windows.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Life Settlements & ILS ──────────────────────────────────────────────
function SettlementsILSTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Life Settlement Market" value="$4B/yr" sub="Secondary policy sales" color="text-indigo-400" />
        <StatCard label="ILS Market Size" value="$112B+" sub="Outstanding notional" color="text-amber-400" />
        <StatCard label="Cat Bond Avg Spread" value="~5–8%" sub="Over risk-free rate" color="text-emerald-400" />
        <StatCard label="ILS/Equity Correlation" value="~0.05" sub="Near-zero diversifier" color="text-violet-400" />
      </div>

      {/* Life Settlement Mechanics */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Life Settlement Mechanics</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Flow diagram via SVG */}
          <svg viewBox="0 0 520 100" className="w-full h-24 mb-3">
            {/* Boxes */}
            {[
              { x: 10, label: "Policy Owner", sub: "Sells policy", col: "#6366f1" },
              { x: 160, label: "Life Settlement", sub: "Broker/Provider", col: "#8b5cf6" },
              { x: 310, label: "Institutional", sub: "Investor", col: "#10b981" },
              { x: 420, label: "Death Benefit", sub: "Paid at death", col: "#f59e0b" },
            ].map((box, i) => (
              <g key={`box-${i}`}>
                <rect x={box.x} y={20} width={100} height={50} rx="6" fill={box.col} fillOpacity="0.12" stroke={box.col} strokeOpacity="0.4" strokeWidth="1" />
                <text x={box.x + 50} y={42} textAnchor="middle" fill="#e4e4e7" fontSize="9" fontWeight="600">{box.label}</text>
                <text x={box.x + 50} y={58} textAnchor="middle" fill="#a1a1aa" fontSize="8">{box.sub}</text>
              </g>
            ))}
            {/* Arrows */}
            {[{ x1: 110, x2: 158 }, { x1: 260, x2: 308 }, { x1: 410, x2: 418 }].map((arr, i) => (
              <line key={`arr-${i}`} x1={arr.x1} y1={45} x2={arr.x2} y2={45} stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arr)" />
            ))}
            <defs>
              <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#71717a" />
              </marker>
            </defs>
            {/* Cash label */}
            <text x={130} y={36} textAnchor="middle" fill="#10b981" fontSize="8">Cash</text>
            <text x={280} y={36} textAnchor="middle" fill="#6366f1" fontSize="8">Policy</text>
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/30">
              <div className="text-xs font-semibold text-indigo-400 mb-2">Pricing Formula</div>
              <div className="font-mono text-xs text-zinc-200 bg-zinc-900/60 p-2 rounded">
                Value ≈ Face × P(death&lt;n) / (1+r)^LE
              </div>
              <div className="text-xs text-zinc-400 mt-2">Where LE = life expectancy (years), r = discount rate (10–15%), P(death&lt;n) = actuarial probability from mortality tables. Typical purchase price: 15–35% of face value.</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/30">
              <div className="text-xs font-semibold text-amber-400 mb-2">Key Risks</div>
              <div className="space-y-1">
                {[
                  { risk: "Longevity Extension", desc: "Insured lives longer than LE estimate — premiums continue eating returns" },
                  { risk: "LE Underestimate", desc: "Medical advances systematically extend life beyond model predictions" },
                  { risk: "Premium Drag", desc: "Ongoing premiums must be paid or policy lapses (investor loses all)" },
                  { risk: "Regulatory Risk", desc: "Some states restrict life settlement transactions" },
                ].map((r, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-amber-400 font-semibold">{r.risk}: </span>
                    <span className="text-zinc-400">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2 bg-zinc-800/30 rounded-lg border border-zinc-700/20 text-xs text-zinc-400">
            <span className="text-red-400 font-semibold">Viatical vs Life Settlement: </span>
            Viatical settlements involve terminally ill policyholders (life expectancy &lt;2yr), with payouts of 50–80% of face value. Life settlements involve senior (65+) policyholders with chronic (not terminal) illness. Ethical concerns center on whether financial incentives conflict with appropriate end-of-life care.
          </div>
        </CardContent>
      </Card>

      {/* ILS Market */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Insurance-Linked Securities (ILS) Market Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ILSMarketChart />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {[
              { name: "Cat Bonds", desc: "SPV issues bonds; investors lose principal if a defined catastrophe triggers. Typical triggers: industry loss index, parametric (wind speed), indemnity. Spreads: 5–12% over Treasuries.", color: "text-amber-400" },
              { name: "Sidecars", desc: "Quota-share arrangements where outside capital participates in a reinsurer's book. Rapid deployment post-catastrophe when reinsurance prices spike. Typical 1-3yr life.", color: "text-indigo-400" },
              { name: "Collateralized Re", desc: "Private, fully collateralized reinsurance contract. Higher returns (8–15%) but less liquid than cat bonds. Forms largest segment of ILS market.", color: "text-violet-400" },
            ].map((t) => (
              <div key={t.name} className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/30">
                <div className={cn("text-xs font-semibold mb-1", t.color)}>{t.name}</div>
                <div className="text-xs text-zinc-400">{t.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PRT */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Pension Risk Transfer (PRT)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { type: "Buy-In", desc: "Pension fund purchases annuity from insurer to cover a subset of liabilities. Pension fund remains the counterparty to members. Insurer becomes an asset of the pension fund.", badge: "Partial" },
              { type: "Buyout", desc: "Full transfer of pension liabilities and assets to insurer. Members become direct policyholders of the insurer. Pension fund extinguished. Typical cost: 102–110% of liability value.", badge: "Full" },
              { type: "Longevity Swap", desc: "Pension fund pays fixed payments; insurer pays actual pension costs. Pension retains investment risk, transfers only longevity risk. Most capital-efficient PRT structure.", badge: "Risk only" },
            ].map((p, i) => (
              <div key={i} className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-zinc-200">{p.type}</span>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[10px]">{p.badge}</Badge>
                </div>
                <div className="text-xs text-zinc-400">{p.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Insurance Stock Analysis ───────────────────────────────────────────
function StockAnalysisTab() {
  return (
    <div className="space-y-6">
      {/* Screening Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="CR Screen Threshold" value="&lt;95%" sub="Profitable underwriting" color="text-emerald-400" />
        <StatCard label="ROE Screen" value="&gt;12%" sub="Above cost of capital" color="text-indigo-400" />
        <StatCard label="P/B Range (P&C)" value="1.0–2.5×" sub="ROE drives premium" color="text-violet-400" />
        <StatCard label="EV Discount (Life)" value="10–20%" sub="Typical trading range" color="text-amber-400" />
      </div>

      {/* Combined Ratio Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Combined Ratio Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <CombinedRatioChart />
          <p className="text-xs text-zinc-500 mt-2">Red dashed line at 100% = underwriting breakeven. Below 100% means the insurer profits before any investment income. Berkshire and Progressive consistently maintain CR 90–96%, generating both underwriting and investment profits.</p>
        </CardContent>
      </Card>

      {/* Stock Screener Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Insurance Stock Screening</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-700">
                  {["Company", "Ticker", "Type", "Comb. Ratio", "ROE", "P/B", "Rating"].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 text-zinc-400 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INSURANCE_STOCKS.map((stock, i) => (
                  <tr key={i} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2 pr-4 font-semibold text-zinc-200">{stock.name}</td>
                    <td className="py-2 pr-4 text-indigo-400 font-mono">{stock.ticker}</td>
                    <td className="py-2 pr-4 text-zinc-400">{stock.type}</td>
                    <td className={cn("py-2 pr-4 font-semibold", stock.combRatio < 95 ? "text-emerald-400" : stock.combRatio < 100 ? "text-amber-400" : "text-red-400")}>
                      {stock.combRatio.toFixed(1)}%
                    </td>
                    <td className={cn("py-2 pr-4 font-semibold", stock.roe > 12 ? "text-emerald-400" : "text-amber-400")}>
                      {stock.roe.toFixed(1)}%
                    </td>
                    <td className="py-2 pr-4 text-zinc-300">{stock.pb.toFixed(1)}×</td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline" className={cn("text-[10px]",
                        stock.rating === "Buy" ? "border-emerald-500/40 text-emerald-400" :
                        stock.rating === "Watch" ? "border-amber-500/40 text-amber-400" :
                        "border-zinc-500/40 text-zinc-400"
                      )}>{stock.rating}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-2">CR &lt;95% highlighted green. ROE &gt;12% highlighted green. P/B reflects ROE quality premium.</p>
        </CardContent>
      </Card>

      {/* Valuation Framework */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">P/B vs ROE Valuation Framework</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simple SVG scatter plot */}
          <svg viewBox="0 0 480 200" className="w-full h-48 mb-3">
            <defs>
              <linearGradient id="pbGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.06" />
              </linearGradient>
            </defs>
            {/* Axes */}
            <line x1={50} y1={20} x2={50} y2={165} stroke="#3f3f46" strokeWidth="1" />
            <line x1={50} y1={165} x2={460} y2={165} stroke="#3f3f46" strokeWidth="1" />
            <text x={250} y={192} textAnchor="middle" fill="#71717a" fontSize="10">ROE (%)</text>
            <text x={14} y={95} textAnchor="middle" fill="#71717a" fontSize="10" transform="rotate(-90,14,95)">P/B (×)</text>
            {/* Grid lines */}
            {[10, 14, 18, 22].map((r) => {
              const x = 50 + ((r - 8) / 16) * 410;
              return <g key={`rx-${r}`}><line x1={x} y1={20} x2={x} y2={165} stroke="#27272a" strokeWidth="1" /><text x={x} y={178} textAnchor="middle" fill="#71717a" fontSize="8">{r}%</text></g>;
            })}
            {[0.5, 1.5, 2.5, 3.5, 5.5].map((p) => {
              const y = 165 - ((p - 0.5) / 5) * 145;
              return <g key={`py-${p}`}><line x1={50} x2={460} y1={y} y2={y} stroke="#27272a" strokeWidth="1" /><text x={44} y={y + 4} textAnchor="end" fill="#71717a" fontSize="8">{p.toFixed(1)}</text></g>;
            })}
            {/* Fair value line */}
            <line x1={50} y1={165} x2={460} y2={20} stroke="#6366f1" strokeWidth="1" strokeDasharray="5,3" strokeOpacity="0.4" />
            <text x={420} y={30} fill="#6366f1" fontSize="8" fillOpacity="0.6">Fair Value Line</text>
            {/* Data points */}
            {INSURANCE_STOCKS.map((st) => {
              const x = 50 + ((st.roe - 8) / 16) * 410;
              const y = 165 - ((st.pb - 0.5) / 5) * 145;
              return (
                <g key={st.ticker}>
                  <circle cx={x} cy={y} r="5" fill={st.rating === "Buy" ? "#10b981" : st.rating === "Watch" ? "#f59e0b" : "#71717a"} fillOpacity="0.8" />
                  <text x={x + 7} y={y + 4} fill="#e4e4e7" fontSize="8">{st.ticker}</text>
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-zinc-500">Stocks above the fair value line trade at a P/B premium to ROE — typically justified by franchise quality, reserve consistency, and growth outlook. Berkshire's low P/B despite high ROE reflects insurance earnings discounted by conglomerate structure.</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoRow icon={BarChart2} title="Reserve Development" body="Favorable reserve development (prior year losses lower than reserved) boosts earnings and signals conservative reserving culture. Adverse development signals underestimation — a major red flag. Watch the Schedule P in annual reports." />
        <InfoRow icon={AlertTriangle} title="Catastrophe Exposure (PML)" body="Probable Maximum Loss at 1-in-100yr event. Insurers with PML &gt;25% of equity are heavily exposed. Reinsurance purchases cap net PML. Post-cat quarters can show CR &gt;120%." />
        <InfoRow icon={Activity} title="Interest Rate Sensitivity (Life)" body="Life insurers' investment portfolios mark-to-market when rates rise, but liabilities also shrink in PV terms. Net impact depends on ALM quality. Spread compression risk when rates fall." />
        <InfoRow icon={Lock} title="Embedded Value (Life EV)" body="EV = net asset value + present value of in-force business. Trades at 0.8–1.2× EV for most life insurers. New business value (VNB) drives growth. EV per share growth is the key performance metric." />
        <InfoRow icon={Shield} title="Reinsurance Dependency" body="High reinsurance dependency (gross written premium / net written premium &gt;3×) means thin net premium base but lower volatility. Check reinsurance counterparty credit quality — typically only A-rated+" />
        <InfoRow icon={PieChart} title="Investment Portfolio Sensitivity" body="A 100bps rise in rates: unrealized bond losses hit book value but future investment income rises. Long-duration portfolios (life) have 8–15% book value sensitivity per 100bps. P&C portfolios: 2–4%." />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function InsuranceInvestingPage() {
  const [activeTab, setActiveTab] = useState("portfolios");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Insurance as Investment</h1>
              <p className="text-sm text-zinc-400">Portfolios • Annuities • Life Settlements & ILS • Stock Analysis</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { icon: DollarSign, label: "$3.7T annuity market", color: "text-indigo-400" },
              { icon: TrendingUp, label: "Float-funded returns", color: "text-emerald-400" },
              { icon: Activity, label: "$112B+ ILS outstanding", color: "text-amber-400" },
              { icon: BookOpen, label: "Berkshire float model", color: "text-violet-400" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-xs">
                <Icon className={cn("w-3 h-3", color)} />
                <span className="text-zinc-300">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-zinc-900 border border-zinc-800 mb-6 h-auto p-1 gap-1">
            {[
              { value: "portfolios", label: "Insurer Portfolios", icon: PieChart },
              { value: "annuities", label: "Annuities", icon: DollarSign },
              { value: "ils", label: "Settlements & ILS", icon: Activity },
              { value: "stocks", label: "Stock Analysis", icon: BarChart2 },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 text-xs py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <TabsContent value="portfolios" className="data-[state=inactive]:hidden">
                <PortfoliosTab />
              </TabsContent>
              <TabsContent value="annuities" className="data-[state=inactive]:hidden">
                <AnnuitiesTab />
              </TabsContent>
              <TabsContent value="ils" className="data-[state=inactive]:hidden">
                <SettlementsILSTab />
              </TabsContent>
              <TabsContent value="stocks" className="data-[state=inactive]:hidden">
                <StockAnalysisTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
