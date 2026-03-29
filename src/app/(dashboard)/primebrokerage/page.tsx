"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  DollarSign,
  Layers,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Lock,
  Unlock,
  RefreshCw,
  Scale,
  FileText,
  Users,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 840;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 840;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface LendableSecurity {
  ticker: string;
  name: string;
  sector: string;
  borrowRate: number; // annualized bps
  availability: "Easy" | "Hard" | "Scarce";
  utilizationPct: number;
  shortInterestPct: number;
  collateralType: "GC" | "HTB";
}

interface HaircutRow {
  assetClass: string;
  haircut: number;
  liquidityScore: number;
  typicalTenor: string;
  notes: string;
}

interface PBService {
  name: string;
  category: string;
  score: number; // 0-100
  description: string;
  icon: React.ReactNode;
}

interface FeeBreakdown {
  label: string;
  pct: number;
  color: string;
}

interface PBComparison {
  feature: string;
  prime: string;
  miniPrime: string;
  primePositive: boolean;
}

interface ODDItem {
  category: string;
  items: string[];
  passed: boolean;
}

// ── Static data generation (seeded) ───────────────────────────────────────────

function generateLendableInventory(): LendableSecurity[] {
  resetSeed();
  const securities: LendableSecurity[] = [
    {
      ticker: "GME",
      name: "GameStop Corp",
      sector: "Consumer Discretionary",
      borrowRate: Math.round(800 + rand() * 4200),
      availability: "Scarce",
      utilizationPct: 85 + rand() * 12,
      shortInterestPct: 18 + rand() * 6,
      collateralType: "HTB",
    },
    {
      ticker: "BBBY",
      name: "Bed Bath & Beyond",
      sector: "Consumer Staples",
      borrowRate: Math.round(500 + rand() * 3000),
      availability: "Hard",
      utilizationPct: 70 + rand() * 20,
      shortInterestPct: 14 + rand() * 8,
      collateralType: "HTB",
    },
    {
      ticker: "AMC",
      name: "AMC Entertainment",
      sector: "Communication Services",
      borrowRate: Math.round(400 + rand() * 2500),
      availability: "Hard",
      utilizationPct: 65 + rand() * 18,
      shortInterestPct: 12 + rand() * 7,
      collateralType: "HTB",
    },
    {
      ticker: "AAPL",
      name: "Apple Inc",
      sector: "Technology",
      borrowRate: Math.round(5 + rand() * 20),
      availability: "Easy",
      utilizationPct: 10 + rand() * 15,
      shortInterestPct: 0.5 + rand() * 1.5,
      collateralType: "GC",
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corp",
      sector: "Technology",
      borrowRate: Math.round(5 + rand() * 18),
      availability: "Easy",
      utilizationPct: 8 + rand() * 12,
      shortInterestPct: 0.4 + rand() * 1.2,
      collateralType: "GC",
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc",
      sector: "Consumer Discretionary",
      borrowRate: Math.round(80 + rand() * 300),
      availability: "Hard",
      utilizationPct: 40 + rand() * 25,
      shortInterestPct: 4 + rand() * 5,
      collateralType: "HTB",
    },
    {
      ticker: "SPY",
      name: "SPDR S&P 500 ETF",
      sector: "ETF",
      borrowRate: Math.round(3 + rand() * 8),
      availability: "Easy",
      utilizationPct: 5 + rand() * 8,
      shortInterestPct: 0.2 + rand() * 0.8,
      collateralType: "GC",
    },
    {
      ticker: "NVDA",
      name: "Nvidia Corp",
      sector: "Technology",
      borrowRate: Math.round(20 + rand() * 80),
      availability: "Easy",
      utilizationPct: 15 + rand() * 20,
      shortInterestPct: 1.5 + rand() * 3,
      collateralType: "GC",
    },
    {
      ticker: "RIVN",
      name: "Rivian Automotive",
      sector: "Consumer Discretionary",
      borrowRate: Math.round(300 + rand() * 1200),
      availability: "Hard",
      utilizationPct: 55 + rand() * 22,
      shortInterestPct: 8 + rand() * 6,
      collateralType: "HTB",
    },
    {
      ticker: "TLT",
      name: "iShares 20Y Treasury ETF",
      sector: "Fixed Income",
      borrowRate: Math.round(3 + rand() * 6),
      availability: "Easy",
      utilizationPct: 6 + rand() * 9,
      shortInterestPct: 0.3 + rand() * 0.9,
      collateralType: "GC",
    },
  ];
  return securities;
}

function generateHaircutTable(): HaircutRow[] {
  return [
    { assetClass: "US Treasuries (< 1Y)", haircut: 2, liquidityScore: 99, typicalTenor: "O/N – 1M", notes: "Near-zero counterparty risk" },
    { assetClass: "US Treasuries (> 10Y)", haircut: 5, liquidityScore: 95, typicalTenor: "1D – 3M", notes: "Duration adds price risk" },
    { assetClass: "Investment-Grade Corp", haircut: 10, liquidityScore: 78, typicalTenor: "1D – 2W", notes: "Spread widening risk" },
    { assetClass: "High-Yield Corp", haircut: 25, liquidityScore: 52, typicalTenor: "1D – 1W", notes: "Liquidity premium required" },
    { assetClass: "Large-Cap Equities", haircut: 15, liquidityScore: 85, typicalTenor: "1D – 1M", notes: "Volatility-adjusted margin" },
    { assetClass: "Small-Cap Equities", haircut: 30, liquidityScore: 45, typicalTenor: "O/N – 3D", notes: "Elevated liquidation risk" },
    { assetClass: "Agency MBS", haircut: 5, liquidityScore: 88, typicalTenor: "1D – 2W", notes: "Prepayment optionality" },
    { assetClass: "EM Sovereign Bonds", haircut: 20, liquidityScore: 58, typicalTenor: "O/N – 1W", notes: "Country risk premium" },
  ];
}

function generatePBServices(): PBService[] {
  return [
    { name: "Execution & Agency", category: "Trading", score: 88, description: "DMA, algos, care orders across 80+ venues", icon: <Activity className="w-4 h-4" /> },
    { name: "Clearing & Settlement", category: "Operations", score: 95, description: "T+1 settlement, fail management, DVP", icon: <CheckCircle className="w-4 h-4" /> },
    { name: "Custody & Safekeeping", category: "Operations", score: 92, description: "Segregated accounts, daily NAV reconciliation", icon: <Lock className="w-4 h-4" /> },
    { name: "Regulatory Reporting", category: "Compliance", score: 90, description: "AIFMD, Form PF, CPO-PQR, EMIR Trade Reporting", icon: <FileText className="w-4 h-4" /> },
    { name: "Capital Introduction", category: "Business Dev", score: 72, description: "LP roadshows, allocator matching, IR support", icon: <Users className="w-4 h-4" /> },
    { name: "Risk & Margin Analytics", category: "Risk", score: 85, description: "Real-time risk, stress testing, VaR dashboards", icon: <ShieldCheck className="w-4 h-4" /> },
    { name: "Securities Lending", category: "Financing", score: 91, description: "HTB inventory, synthetic prime, collateral opt.", icon: <RefreshCw className="w-4 h-4" /> },
    { name: "Global Markets Access", category: "Trading", score: 83, description: "140+ markets, FX overlay, multi-currency margin", icon: <Globe className="w-4 h-4" /> },
  ];
}

function generateFeeBreakdown(): FeeBreakdown[] {
  return [
    { label: "Financing / Margin Interest", pct: 38, color: "#6366f1" },
    { label: "Securities Lending Revenue", pct: 27, color: "#22d3ee" },
    { label: "Execution Commissions", pct: 18, color: "#f59e0b" },
    { label: "Custody & Admin Fees", pct: 9, color: "#10b981" },
    { label: "Technology & Reporting", pct: 5, color: "#f43f5e" },
    { label: "Other (Cap Intro, etc.)", pct: 3, color: "#8b5cf6" },
  ];
}

function generatePBComparison(): PBComparison[] {
  return [
    { feature: "Minimum AUM", prime: "$500M+", miniPrime: "$10M+", primePositive: false },
    { feature: "Financing Rates", prime: "SOFR + 50–150bps", miniPrime: "SOFR + 150–350bps", primePositive: true },
    { feature: "Securities Lending Inventory", prime: "Vast (incl. HTB)", miniPrime: "Limited GC focus", primePositive: true },
    { feature: "Technology Platform", prime: "Proprietary, full API", miniPrime: "Third-party aggregated", primePositive: true },
    { feature: "Capital Introduction", prime: "Institutional LP network", miniPrime: "Limited or none", primePositive: true },
    { feature: "Reporting & Analytics", prime: "Real-time, custom", miniPrime: "Standard T+1 reports", primePositive: true },
    { feature: "Regulatory Support", prime: "Dedicated compliance team", miniPrime: "Self-serve documentation", primePositive: true },
    { feature: "Multi-Asset Coverage", prime: "Equities, FI, FX, Derivatives", miniPrime: "Primarily equities", primePositive: true },
    { feature: "Portability", prime: "Low (switching costs)", miniPrime: "Higher flexibility", primePositive: false },
  ];
}

function generateODDChecklist(): ODDItem[] {
  return [
    {
      category: "Legal & Structural",
      items: ["Fund formation documents reviewed", "ISDA/CSA agreements executed", "Regulatory registrations confirmed"],
      passed: true,
    },
    {
      category: "Operational Infrastructure",
      items: ["Fund admin independently appointed", "Auditor (Big 4 preferred) confirmed", "Compliance officer designated"],
      passed: true,
    },
    {
      category: "Technology & Data",
      items: ["OMS/EMS integration tested", "Risk system API connectivity", "Disaster recovery plan documented"],
      passed: true,
    },
    {
      category: "Risk Management",
      items: ["Investment guidelines in place", "VaR/stress test framework", "Counterparty exposure limits set"],
      passed: true,
    },
    {
      category: "Personnel Background",
      items: ["Background checks (all PMs/ops)", "Reference checks completed", "U4/U5 disclosures reviewed"],
      passed: false,
    },
    {
      category: "Financial Stability",
      items: ["3-year pro forma runway", "Fee structure aligned with AUM", "Seed capital verified"],
      passed: true,
    },
  ];
}

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function BorrowCostBarChart({ securities }: { securities: LendableSecurity[] }) {
  const maxRate = Math.max(...securities.map((s) => s.borrowRate));
  const W = 420;
  const H = 220;
  const barH = 22;
  const gap = 6;
  const labelW = 52;
  const chartW = W - labelW - 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Borrow cost bar chart">
      {securities.map((sec, i) => {
        const y = i * (barH + gap) + 10;
        const barWidth = (sec.borrowRate / maxRate) * chartW;
        const color = sec.availability === "Scarce" ? "#f43f5e" : sec.availability === "Hard" ? "#f59e0b" : "#22d3ee";
        return (
          <g key={sec.ticker}>
            <text x={0} y={y + barH / 2 + 4} fontSize={11} fill="#94a3b8" fontFamily="monospace">
              {sec.ticker}
            </text>
            <rect x={labelW} y={y} width={Math.max(barWidth, 2)} height={barH} rx={3} fill={color} opacity={0.85} />
            <text x={labelW + Math.max(barWidth, 2) + 4} y={y + barH / 2 + 4} fontSize={10} fill="#cbd5e1">
              {sec.borrowRate >= 100 ? `${(sec.borrowRate / 100).toFixed(0)}%` : `${sec.borrowRate}bps`}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 2} fontSize={10} fill="#64748b" textAnchor="middle">
        Annual Borrow Rate
      </text>
    </svg>
  );
}

function UtilizationGauge({ pct }: { pct: number }) {
  const R = 70;
  const cx = 100;
  const cy = 90;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const valueAngle = startAngle + (pct / 100) * Math.PI;

  function polarToXY(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const bgStart = polarToXY(startAngle, R);
  const bgEnd = polarToXY(endAngle, R);
  const valEnd = polarToXY(valueAngle, R);

  const color = pct > 80 ? "#f43f5e" : pct > 60 ? "#f59e0b" : "#22d3ee";

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[220px]" aria-label="Utilization gauge">
      {/* Background arc */}
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
        fill="none"
        stroke="#1e293b"
        strokeWidth={16}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 1 ${valEnd.x} ${valEnd.y}`}
        fill="none"
        stroke={color}
        strokeWidth={16}
        strokeLinecap="round"
      />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={valEnd.x}
        y2={valEnd.y}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      {/* Labels */}
      <text x={cx - R - 4} y={cy + 16} fontSize={10} fill="#64748b" textAnchor="middle">0%</text>
      <text x={cx + R + 4} y={cy + 16} fontSize={10} fill="#64748b" textAnchor="middle">100%</text>
      <text x={cx} y={cy - 14} fontSize={18} fontWeight="bold" fill={color} textAnchor="middle">
        {pct.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 2} fontSize={10} fill="#94a3b8" textAnchor="middle">
        Avg Utilization
      </text>
    </svg>
  );
}

function MarginCallSVG({ leverage }: { leverage: number }) {
  const W = 440;
  const H = 180;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Equity drops from 100% at x=0 to some level at x=1 as leverage increases
  // margin call at maintenance level
  const initialMargin = 100 / leverage; // as % of portfolio
  const maintenanceMargin = initialMargin * 0.65;
  const marginCallDrop = 1 - maintenanceMargin / 100;

  const points = Array.from({ length: 51 }, (_, i) => {
    const drop = (i / 50) * 0.6; // 0 to 60% drop
    const equity = Math.max(0, 100 - leverage * drop * 100);
    return { drop, equity };
  });

  const toSVG = (drop: number, equity: number) => ({
    x: padL + (drop / 0.6) * chartW,
    y: padT + ((100 - equity) / 100) * chartH,
  });

  const polyline = points.map((p) => {
    const { x, y } = toSVG(p.drop, p.equity);
    return `${x},${y}`;
  }).join(" ");

  const mcPt = toSVG(marginCallDrop, maintenanceMargin);
  const maintPt = toSVG(0.6, maintenanceMargin);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Margin call thresholds chart">
      {/* Grid */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = padT + ((100 - v) / 100) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
            <text x={padL - 4} y={y + 4} fontSize={10} fill="#64748b" textAnchor="end">{v}%</text>
          </g>
        );
      })}
      {/* Maintenance margin line */}
      <line x1={padL} y1={maintPt.y} x2={W - padR} y2={maintPt.y} stroke="#f43f5e" strokeDasharray="5 3" strokeWidth={1.5} />
      <text x={W - padR - 2} y={maintPt.y - 4} fontSize={9} fill="#f43f5e" textAnchor="end">Maint. Margin {maintenanceMargin.toFixed(1)}%</text>
      {/* Initial margin line */}
      <line x1={padL} y1={padT + ((100 - initialMargin) / 100) * chartH} x2={W - padR} y2={padT + ((100 - initialMargin) / 100) * chartH} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5} />
      <text x={W - padR - 2} y={padT + ((100 - initialMargin) / 100) * chartH - 4} fontSize={9} fill="#f59e0b" textAnchor="end">Initial Margin {initialMargin.toFixed(1)}%</text>
      {/* Equity curve */}
      <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth={2.5} />
      {/* Margin call dot */}
      <circle cx={mcPt.x} cy={mcPt.y} r={5} fill="#f43f5e" />
      <text x={mcPt.x + 6} y={mcPt.y - 4} fontSize={9} fill="#f43f5e">Margin Call</text>
      {/* X-axis label */}
      <text x={padL + chartW / 2} y={H - 4} fontSize={10} fill="#64748b" textAnchor="middle">Portfolio Value Drop →</text>
      {/* Y-axis label */}
      <text x={12} y={padT + chartH / 2} fontSize={10} fill="#64748b" textAnchor="middle" transform={`rotate(-90,12,${padT + chartH / 2})`}>Equity %</text>
    </svg>
  );
}

function CollateralChainSVG() {
  const nodes = [
    { label: "Hedge Fund\n(Client)", x: 60, y: 100, color: "#6366f1", icon: "HF" },
    { label: "Prime Broker", x: 220, y: 100, color: "#22d3ee", icon: "PB" },
    { label: "Custodian\nBank", x: 380, y: 60, color: "#f59e0b", icon: "CB" },
    { label: "Repo\nMarket", x: 380, y: 140, color: "#10b981", icon: "RP" },
  ];

  const arrows = [
    { from: 0, to: 1, label: "Collateral Posted", color: "#6366f1", dy: -14 },
    { from: 1, to: 2, label: "Re-pledged", color: "#22d3ee", dy: -12 },
    { from: 1, to: 3, label: "Repo'd Out", color: "#22d3ee", dy: 12 },
  ];

  return (
    <svg viewBox="0 0 460 200" className="w-full" aria-label="Collateral chain diagram">
      {/* Flow arrows */}
      {arrows.map((a, i) => {
        const from = nodes[a.from];
        const to = nodes[a.to];
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 + a.dy;
        return (
          <g key={i}>
            <defs>
              <marker id={`arr${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={a.color} />
              </marker>
            </defs>
            <line
              x1={from.x + 38}
              y1={from.y}
              x2={to.x - 38}
              y2={to.y}
              stroke={a.color}
              strokeWidth={2}
              markerEnd={`url(#arr${i})`}
              opacity={0.7}
            />
            <text x={mx} y={my} fontSize={9} fill={a.color} textAnchor="middle">
              {a.label}
            </text>
          </g>
        );
      })}
      {/* Nodes */}
      {nodes.map((n, i) => {
        const lines = n.label.split("\n");
        return (
          <g key={i}>
            <rect x={n.x - 38} y={n.y - 28} width={76} height={56} rx={8} fill={n.color} opacity={0.15} stroke={n.color} strokeWidth={1.5} />
            <text x={n.x} y={n.y - 8} fontSize={11} fontWeight="bold" fill={n.color} textAnchor="middle">
              {n.icon}
            </text>
            {lines.map((line, li) => (
              <text key={li} x={n.x} y={n.y + 8 + li * 12} fontSize={9} fill="#94a3b8" textAnchor="middle">
                {line}
              </text>
            ))}
          </g>
        );
      })}
      {/* Regulatory note */}
      <rect x={10} y={170} width={440} height={22} rx={4} fill="#0f172a" stroke="#1e293b" />
      <text x={230} y={184} fontSize={9} fill="#f59e0b" textAnchor="middle">
        ⚠ 140% Rehypothecation Rule: PB may re-use max 140% of client debit balance
      </text>
    </svg>
  );
}

function CollateralWaterfallSVG() {
  const steps = [
    { label: "Client Posts Collateral", value: 100, color: "#6366f1" },
    { label: "Initial Haircut (avg 12%)", value: 88, color: "#8b5cf6" },
    { label: "Re-pledged to Custodian", value: 75, color: "#22d3ee" },
    { label: "Repo Margin (5%)", value: 71, color: "#0ea5e9" },
    { label: "Net Available Liquidity", value: 71, color: "#10b981" },
  ];
  const W = 400;
  const H = 180;
  const barW = 54;
  const gap = 18;
  const maxV = 110;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Collateral transformation waterfall">
      {steps.map((step, i) => {
        const barH = (step.value / maxV) * 130;
        const x = 20 + i * (barW + gap);
        const y = H - 30 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={step.color} opacity={0.8} />
            <text x={x + barW / 2} y={y - 4} fontSize={10} fontWeight="bold" fill={step.color} textAnchor="middle">
              {step.value}
            </text>
            <text x={x + barW / 2} y={H - 16} fontSize={8} fill="#64748b" textAnchor="middle">
              {step.label.split(" ").slice(0, 2).join(" ")}
            </text>
            <text x={x + barW / 2} y={H - 6} fontSize={8} fill="#64748b" textAnchor="middle">
              {step.label.split(" ").slice(2).join(" ")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PBServiceScorecard({ services }: { services: PBService[] }) {
  return (
    <div className="space-y-3">
      {services.map((svc) => (
        <div key={svc.name} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-indigo-400 shrink-0">
            {svc.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate">{svc.name}</span>
              <span className={cn("text-xs font-bold ml-2", svc.score >= 90 ? "text-emerald-400" : svc.score >= 80 ? "text-muted-foreground" : "text-amber-400")}>
                {svc.score}/100
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${svc.score}%`,
                  background: svc.score >= 90 ? "#10b981" : svc.score >= 80 ? "#22d3ee" : "#f59e0b",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeePieChart({ fees }: { fees: FeeBreakdown[] }) {
  const cx = 100;
  const cy = 100;
  const r = 70;
  let cumAngle = -Math.PI / 2;
  const slices: { d: string; color: string; label: string; pct: number; mx: number; my: number }[] = [];

  for (const fee of fees) {
    const angle = (fee.pct / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const midAngle = cumAngle - angle / 2;
    const mx = cx + (r + 22) * Math.cos(midAngle);
    const my = cy + (r + 22) * Math.sin(midAngle);
    slices.push({ d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`, color: fee.color, label: fee.label, pct: fee.pct, mx, my });
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-40 h-40 shrink-0" aria-label="Fee breakdown pie chart">
        {slices.map((sl, i) => (
          <path key={i} d={sl.d} fill={sl.color} opacity={0.85} stroke="#0f172a" strokeWidth={1.5} />
        ))}
        <circle cx={cx} cy={cy} r={36} fill="#0f172a" />
        <text x={cx} y={cy - 5} fontSize={10} fill="#94a3b8" textAnchor="middle">Revenue</text>
        <text x={cx} y={cy + 10} fontSize={10} fill="#94a3b8" textAnchor="middle">Split</text>
      </svg>
      <div className="flex flex-col gap-2 w-full">
        {fees.map((fee) => (
          <div key={fee.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: fee.color }} />
            <span className="text-xs text-muted-foreground flex-1">{fee.label}</span>
            <span className="text-xs font-bold text-foreground">{fee.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PrimeBrokeragePage() {
  const [activeTab, setActiveTab] = useState("lending");
  const [leverage, setLeverage] = useState(3);

  const securities = useMemo(() => generateLendableInventory(), []);
  const haircutTable = useMemo(() => generateHaircutTable(), []);
  const pbServices = useMemo(() => generatePBServices(), []);
  const fees = useMemo(() => generateFeeBreakdown(), []);
  const pbComparison = useMemo(() => generatePBComparison(), []);
  const oddChecklist = useMemo(() => generateODDChecklist(), []);

  const gcCount = securities.filter((s) => s.collateralType === "GC").length;
  const htbCount = securities.filter((s) => s.collateralType === "HTB").length;
  const avgUtil = securities.reduce((acc, s) => acc + s.utilizationPct, 0) / securities.length;

  const portfolioValue = 10_000_000;
  const leveragedValue = portfolioValue * leverage;
  const borrowedAmount = leveragedValue - portfolioValue;
  const initialMarginReq = leveragedValue / leverage; // same as portfolio value
  const maintenanceMarginReq = initialMarginReq * 0.65;
  const excessEquity = portfolioValue - maintenanceMarginReq;
  const marginCallDropPct = ((portfolioValue - maintenanceMarginReq) / borrowedAmount) * 100;

  const availabilityColor = (av: LendableSecurity["availability"]) =>
    av === "Easy" ? "text-emerald-400" : av === "Hard" ? "text-amber-400" : "text-rose-400";
  const availabilityBg = (av: LendableSecurity["availability"]) =>
    av === "Easy" ? "bg-emerald-400/10 text-emerald-400" : av === "Hard" ? "bg-amber-400/10 text-amber-400" : "bg-rose-400/10 text-rose-400";

  const tabVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-foreground">Prime Brokerage</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            Securities lending, margin financing, rehypothecation, custody, and institutional-grade operational services for hedge funds.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs">Institutional</Badge>
          <Badge className="bg-cyan-500/15 text-muted-foreground border border-cyan-500/30 text-xs">Prime Finance</Badge>
          <Badge className="bg-muted text-muted-foreground text-xs">Seed 840</Badge>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Lendable Inventory", value: "$4.2T", sub: "Across 12,000+ securities", icon: <Layers className="w-4 h-4 text-indigo-400" />, color: "text-indigo-400" },
          { label: "HTB Securities", value: `${htbCount} / ${securities.length}`, sub: "In demo portfolio", icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, color: "text-amber-400" },
          { label: "Avg Utilization Rate", value: `${avgUtil.toFixed(1)}%`, sub: "Weighted by borrow rate", icon: <Activity className="w-4 h-4 text-muted-foreground" />, color: "text-muted-foreground" },
          { label: "GC Securities", value: `${gcCount} / ${securities.length}`, sub: "General collateral", icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, color: "text-emerald-400" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                {kpi.icon}
                <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
              </div>
              <p className={cn("text-xl font-medium", kpi.color)}>{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border w-full flex gap-1 h-auto p-1 flex-wrap">
          {[
            { value: "lending", label: "Securities Lending", icon: <RefreshCw className="w-3.5 h-3.5" /> },
            { value: "margin", label: "Margin & Leverage", icon: <Scale className="w-3.5 h-3.5" /> },
            { value: "rehypo", label: "Rehypothecation", icon: <ArrowRight className="w-3.5 h-3.5" /> },
            { value: "services", label: "PB Services", icon: <Building2 className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground flex-1"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Securities Lending ───────────────────────────────────────── */}
        <TabsContent value="lending" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "lending" && (
              <motion.div key="lending" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Lendable Inventory Table */}
                  <Card className="bg-card border-border border-l-4 border-l-primary">
                    <CardHeader className="pb-2 p-6">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        Lendable Inventory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Ticker</th>
                              <th className="text-left px-3 py-2 text-muted-foreground font-medium hidden md:table-cell">Sector</th>
                              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Rate (bps)</th>
                              <th className="text-center px-3 py-2 text-muted-foreground font-medium">Avail.</th>
                              <th className="text-right px-3 py-2 text-muted-foreground font-medium hidden sm:table-cell">Util %</th>
                              <th className="text-center px-3 py-2 text-muted-foreground font-medium hidden md:table-cell">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {securities.map((sec, i) => (
                              <tr
                                key={sec.ticker}
                                className={cn("border-b border-border/50 hover:bg-muted/40 transition-colors", i % 2 === 0 ? "bg-card/50" : "")}
                              >
                                <td className="px-3 py-2 font-mono font-medium text-foreground">{sec.ticker}</td>
                                <td className="px-3 py-2 text-muted-foreground hidden md:table-cell truncate max-w-[100px]">{sec.sector}</td>
                                <td className="px-3 py-2 text-right font-mono text-amber-300">{sec.borrowRate.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={cn("px-1.5 py-0.5 rounded text-xs font-semibold", availabilityBg(sec.availability))}>
                                    {sec.availability}
                                  </span>
                                </td>
                                <td className={cn("px-3 py-2 text-right font-mono hidden sm:table-cell", availabilityColor(sec.availability))}>
                                  {sec.utilizationPct.toFixed(1)}%
                                </td>
                                <td className="px-3 py-2 text-center hidden md:table-cell">
                                  <Badge className={cn("text-xs px-1.5", sec.collateralType === "GC" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-rose-400/10 text-rose-400 border-rose-400/20")}>
                                    {sec.collateralType}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Borrow Cost Bar Chart */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        Borrow Cost by Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BorrowCostBarChart securities={securities} />
                      <div className="flex gap-4 mt-2 justify-center">
                        {[["#f43f5e", "Scarce (HTB)"], ["#f59e0b", "Hard (HTB)"], ["#22d3ee", "Easy (GC)"]].map(([color, label]) => (
                          <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                            {label}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* HTB vs GC Split */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Hard-to-Borrow vs General Collateral
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Hard-to-Borrow (HTB)</span>
                          <span className="font-medium text-rose-400">{htbCount} securities ({((htbCount / securities.length) * 100).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="h-2.5 rounded-full bg-rose-500" style={{ width: `${(htbCount / securities.length) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>General Collateral (GC)</span>
                          <span className="font-medium text-emerald-400">{gcCount} securities ({((gcCount / securities.length) * 100).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${(gcCount / securities.length) * 100}%` }} />
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-3 space-y-1.5 text-xs text-muted-foreground">
                        <p><span className="text-rose-400 font-medium">HTB</span> — Restricted supply; high short interest; borrow rate typically {">"}200bps. Often meme or speculative stocks.</p>
                        <p><span className="text-emerald-400 font-medium">GC</span> — Abundant supply; low borrow cost; liquid large-cap equities and ETFs. Rate typically 5–50bps.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Utilization Gauge */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        Average Utilization Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3">
                      <UtilizationGauge pct={avgUtil} />
                      <div className="w-full rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                        <p className="flex justify-between"><span>Highest Utilization</span><span className="text-rose-400 font-medium">{Math.max(...securities.map(s => s.utilizationPct)).toFixed(1)}%</span></p>
                        <p className="flex justify-between"><span>Lowest Utilization</span><span className="text-emerald-400 font-medium">{Math.min(...securities.map(s => s.utilizationPct)).toFixed(1)}%</span></p>
                        <p className="flex justify-between"><span>Securities {">"} 80% Util</span><span className="text-amber-400 font-medium">{securities.filter(s => s.utilizationPct > 80).length}</span></p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 2: Margin & Leverage ────────────────────────────────────────── */}
        <TabsContent value="margin" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "margin" && (
              <motion.div key="margin" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Leverage Slider */}
                  <Card className="bg-card border-border md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Scale className="w-4 h-4 text-indigo-400" />
                        Portfolio Margin Calculator
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                          <span>Leverage Multiplier</span>
                          <span className="text-indigo-300 font-medium text-base">{leverage}x</span>
                        </div>
                        <Slider
                          min={1}
                          max={10}
                          step={0.5}
                          value={[leverage]}
                          onValueChange={([v]) => setLeverage(v)}
                          className="cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1x (No leverage)</span>
                          <span>10x (Max)</span>
                        </div>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        {[
                          { label: "Portfolio Value (Equity)", value: `$${(portfolioValue / 1e6).toFixed(1)}M`, color: "text-foreground" },
                          { label: "Leveraged Exposure", value: `$${(leveragedValue / 1e6).toFixed(1)}M`, color: "text-indigo-300" },
                          { label: "Amount Borrowed", value: `$${(borrowedAmount / 1e6).toFixed(2)}M`, color: "text-amber-300" },
                          { label: "Initial Margin Required", value: `${(100 / leverage).toFixed(1)}%`, color: "text-muted-foreground" },
                          { label: "Maintenance Margin", value: `${(65 / leverage).toFixed(1)}%`, color: "text-yellow-300" },
                          { label: "Excess Equity", value: `$${(excessEquity / 1e6).toFixed(2)}M`, color: excessEquity > 0 ? "text-emerald-400" : "text-rose-400" },
                          { label: "Margin Call Trigger (Drop)", value: `${marginCallDropPct > 0 ? marginCallDropPct.toFixed(1) : "—"}%`, color: "text-rose-400" },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className={cn("font-mono font-medium", row.color)}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                      {leverage >= 7 && (
                        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>High leverage. A {marginCallDropPct.toFixed(1)}% portfolio drop triggers a margin call.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Margin Call Threshold SVG */}
                  <Card className="bg-card border-border md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                        Equity vs Portfolio Drop — {leverage}x Leverage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarginCallSVG leverage={leverage} />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        At {leverage}x leverage, a {(100 / leverage).toFixed(1)}% drop in asset value wipes out equity entirely.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Initial vs Maintenance Margin Comparison */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      Initial vs Maintenance Margin — Concept Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Initial Margin",
                          color: "border-indigo-500 bg-indigo-500/10",
                          titleColor: "text-indigo-300",
                          pct: `${(100 / leverage).toFixed(1)}%`,
                          desc: "The minimum equity required to open a leveraged position. Calculated as 1/leverage. Regulatory minimum is typically 50% for equities (Regulation T).",
                          bullets: [
                            "Required at position open",
                            `At ${leverage}x: need ${(100 / leverage).toFixed(1)}% equity`,
                            "Higher = lower leverage risk",
                            "PB may require more than reg minimum",
                          ],
                        },
                        {
                          title: "Maintenance Margin",
                          color: "border-amber-500 bg-amber-500/10",
                          titleColor: "text-amber-300",
                          pct: `${(65 / leverage).toFixed(1)}%`,
                          desc: "The minimum equity level to keep a position open. Typically 65-75% of initial margin. Falling below triggers a margin call requiring additional collateral or position liquidation.",
                          bullets: [
                            "Ongoing floor requirement",
                            `At ${leverage}x: minimum ${(65 / leverage).toFixed(1)}% equity`,
                            "Breach = margin call notice",
                            "PB can force-liquidate at breach",
                          ],
                        },
                      ].map((panel) => (
                        <div key={panel.title} className={cn("rounded-md border p-4 space-y-2", panel.color)}>
                          <div className="flex justify-between items-center">
                            <h3 className={cn("font-medium text-sm", panel.titleColor)}>{panel.title}</h3>
                            <span className={cn("text-xl font-medium", panel.titleColor)}>{panel.pct}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{panel.desc}</p>
                          <ul className="space-y-1">
                            {panel.bullets.map((b) => (
                              <li key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 3: Rehypothecation ──────────────────────────────────────────── */}
        <TabsContent value="rehypo" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "rehypo" && (
              <motion.div key="rehypo" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 mt-4">
                {/* Chain Diagram + Regulatory Note */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      Collateral Chain Diagram
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CollateralChainSVG />
                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      {[
                        { step: "1", title: "Client Posts Collateral", desc: "Hedge fund pledges securities or cash to PB as margin collateral for leveraged positions.", color: "border-indigo-500/40 bg-indigo-500/5" },
                        { step: "2", title: "PB Rehypothecates (140% Rule)", desc: "PB may re-use up to 140% of client debit balance. Provides PB with liquidity for own financing.", color: "border-cyan-500/40 bg-cyan-500/5" },
                        { step: "3", title: "Repo Market Funding", desc: "PB repo's collateral to banks or money market funds, generating low-cost funding for prime finance book.", color: "border-emerald-500/40 bg-emerald-500/5" },
                      ].map((s) => (
                        <div key={s.step} className={cn("rounded-lg border p-3 space-y-1", s.color)}>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center shrink-0">{s.step}</span>
                            <span className="font-medium text-foreground">{s.title}</span>
                          </div>
                          <p className="text-muted-foreground pl-7">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Haircut Table */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Haircut Table by Asset Class
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Asset Class</th>
                              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Haircut</th>
                              <th className="text-right px-3 py-2 text-muted-foreground font-medium hidden sm:table-cell">Liquidity</th>
                              <th className="text-center px-3 py-2 text-muted-foreground font-medium hidden md:table-cell">Tenor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {haircutTable.map((row, i) => (
                              <tr key={row.assetClass} className={cn("border-b border-border/50 hover:bg-muted/40 transition-colors", i % 2 === 0 ? "" : "bg-muted/20")}>
                                <td className="px-3 py-2 text-muted-foreground font-medium">{row.assetClass}</td>
                                <td className="px-3 py-2 text-right font-mono">
                                  <span className={cn("font-medium", row.haircut <= 5 ? "text-emerald-400" : row.haircut <= 15 ? "text-amber-400" : "text-rose-400")}>
                                    {row.haircut}%
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right hidden sm:table-cell">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <div className="w-14 bg-muted rounded-full h-1.5">
                                      <div
                                        className="h-1.5 rounded-full"
                                        style={{ width: `${row.liquidityScore}%`, background: row.liquidityScore > 80 ? "#10b981" : row.liquidityScore > 60 ? "#f59e0b" : "#f43f5e" }}
                                      />
                                    </div>
                                    <span className="text-muted-foreground font-mono text-xs">{row.liquidityScore}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center text-muted-foreground hidden md:table-cell font-mono text-xs">{row.typicalTenor}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Collateral Transformation Waterfall + 140% Rule */}
                  <div className="space-y-4">
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          Collateral Transformation Waterfall
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CollateralWaterfallSVG />
                        <p className="text-xs text-muted-foreground mt-1 text-center">Starting from 100 units of posted collateral</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border border-amber-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-300 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-400" />
                          Regulatory Limits — 140% Rule (UK/US)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs text-muted-foreground">
                        <p>Under <span className="text-amber-300 font-medium">UK FCA Client Money Rules</span> and the US SEC Customer Protection Rule, a prime broker may rehypothecate no more than <span className="text-amber-300 font-medium">140%</span> of a client&apos;s net debit balance.</p>
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 space-y-1">
                          <p><span className="text-amber-300 font-medium">Example:</span> If client debit balance = $10M, PB can re-use up to $14M of client collateral.</p>
                          <p><span className="text-muted-foreground font-medium">Post-MF Global:</span> Many institutional clients now restrict rehypothecation in their prime brokerage agreements.</p>
                          <p><span className="text-muted-foreground font-medium">AIFMD (EU):</span> Requires explicit client consent in each instance; much stricter than US regime.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 4: PB Services ──────────────────────────────────────────────── */}
        <TabsContent value="services" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "services" && (
              <motion.div key="services" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Service Scorecard */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Service Quality Scorecard
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PBServiceScorecard services={pbServices} />
                    </CardContent>
                  </Card>

                  {/* Fee Breakdown Pie */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        PB Revenue Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FeePieChart fees={fees} />
                      <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                        <p>Financing and securities lending together account for <span className="text-amber-300 font-medium">65%</span> of PB revenue, making the prime finance book the core profit driver.</p>
                        <p>Execution commissions have declined due to zero-commission retail brokers pressuring institutional rates.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Prime vs Mini-Prime Comparison */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Scale className="w-4 h-4 text-muted-foreground" />
                      Prime Broker vs Mini-Prime Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="text-left px-4 py-2.5 text-muted-foreground font-medium w-1/3">Feature</th>
                            <th className="text-center px-4 py-2.5 text-indigo-300 font-medium">Prime Broker</th>
                            <th className="text-center px-4 py-2.5 text-muted-foreground font-medium">Mini-Prime / Introducing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pbComparison.map((row, i) => (
                            <tr key={row.feature} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/20")}>
                              <td className="px-4 py-2.5 text-muted-foreground font-medium">{row.feature}</td>
                              <td className="px-4 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {row.primePositive ? (
                                    <TrendingUp className="w-3 h-3 text-indigo-400 shrink-0" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />
                                  )}
                                  <span className={cn("font-medium", row.primePositive ? "text-indigo-300" : "text-rose-300")}>{row.prime}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {!row.primePositive ? (
                                    <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3 text-muted-foreground shrink-0" />
                                  )}
                                  <span className={cn("font-medium", !row.primePositive ? "text-emerald-300" : "text-muted-foreground")}>{row.miniPrime}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Operational Due Diligence Checklist */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Operational Due Diligence (ODD) Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {oddChecklist.map((cat) => (
                        <div
                          key={cat.category}
                          className={cn(
                            "rounded-md border p-3 space-y-2",
                            cat.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-medium", cat.passed ? "text-emerald-300" : "text-amber-300")}>
                              {cat.category}
                            </span>
                            {cat.passed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            )}
                          </div>
                          <ul className="space-y-1.5">
                            {cat.items.map((item) => (
                              <li key={item} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                                {cat.passed ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                )}
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>ODD is conducted by institutional allocators (pensions, endowments, FoHFs) before committing capital. A failed category in <span className="text-amber-300 font-medium">Personnel Background</span> can delay or prevent allocation regardless of performance track record.</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
