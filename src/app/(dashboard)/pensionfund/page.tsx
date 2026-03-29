"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Building2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Target,
  Layers,
  Scale,
  Activity,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 771;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 771;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface AssetClass {
  name: string;
  allocation: number;
  expectedReturn: number;
  duration: number;
  liabilityHedgeRatio: number;
  color: string;
}

interface StressScenario {
  name: string;
  description: string;
  rateShock: number;
  equityShock: number;
  inflationShock: number;
  fundedRatioImpact: number;
  icon: React.ReactNode;
  severity: "low" | "medium" | "high";
}

interface YearData {
  year: number;
  assets: number;
  liabilities: number;
  fundedRatio: number;
}

// ── Static Data ────────────────────────────────────────────────────────────────

resetSeed();

const ASSET_CLASSES: AssetClass[] = [
  { name: "Long-Duration Gov Bonds", allocation: 28, expectedReturn: 4.2, duration: 18.5, liabilityHedgeRatio: 0.85, color: "#3b82f6" },
  { name: "Investment Grade Corp Bonds", allocation: 15, expectedReturn: 5.1, duration: 12.3, liabilityHedgeRatio: 0.60, color: "#6366f1" },
  { name: "Global Equities", allocation: 22, expectedReturn: 7.8, duration: 2.1, liabilityHedgeRatio: 0.05, color: "#10b981" },
  { name: "Domestic Equities", allocation: 12, expectedReturn: 7.5, duration: 1.8, liabilityHedgeRatio: 0.04, color: "#22c55e" },
  { name: "Real Estate", allocation: 8, expectedReturn: 6.4, duration: 8.0, liabilityHedgeRatio: 0.30, color: "#f59e0b" },
  { name: "Infrastructure", allocation: 6, expectedReturn: 6.1, duration: 14.2, liabilityHedgeRatio: 0.45, color: "#f97316" },
  { name: "Private Credit", allocation: 5, expectedReturn: 7.2, duration: 5.5, liabilityHedgeRatio: 0.20, color: "#8b5cf6" },
  { name: "Cash & Equivalents", allocation: 4, expectedReturn: 5.0, duration: 0.3, liabilityHedgeRatio: 0.01, color: "#6b7280" },
];

const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: "Rate Shock (+200bps)",
    description: "Parallel upward shift of 200bps across the yield curve, increasing discount rates and reducing liability PV",
    rateShock: 2.0,
    equityShock: -8,
    inflationShock: 0.5,
    fundedRatioImpact: +4.2,
    icon: <TrendingUp className="w-4 h-4" />,
    severity: "medium",
  },
  {
    name: "Rate Shock (-150bps)",
    description: "Parallel downward shift of 150bps, increasing liability present value significantly",
    rateShock: -1.5,
    equityShock: +5,
    inflationShock: -0.3,
    fundedRatioImpact: -9.8,
    icon: <TrendingDown className="w-4 h-4" />,
    severity: "high",
  },
  {
    name: "Equity Crash (-35%)",
    description: "Global equity markets decline 35%, similar to 2008-09 or 2020 drawdowns",
    rateShock: -0.5,
    equityShock: -35,
    inflationShock: -0.8,
    fundedRatioImpact: -11.2,
    icon: <TrendingDown className="w-4 h-4" />,
    severity: "high",
  },
  {
    name: "Stagflation",
    description: "High inflation (CPI +5%) with stagnant growth, equity underperformance and rising rates",
    rateShock: 1.5,
    equityShock: -15,
    inflationShock: 3.0,
    fundedRatioImpact: -6.7,
    icon: <AlertTriangle className="w-4 h-4" />,
    severity: "high",
  },
  {
    name: "Credit Spread Widening",
    description: "Investment grade spreads widen 150bps, high yield widens 400bps",
    rateShock: 0.2,
    equityShock: -10,
    inflationShock: 0.2,
    fundedRatioImpact: -3.4,
    icon: <Activity className="w-4 h-4" />,
    severity: "medium",
  },
  {
    name: "Combined Tail Risk",
    description: "Simultaneous equity crash (-25%), rate drop (-100bps), and credit spread widening",
    rateShock: -1.0,
    equityShock: -25,
    inflationShock: -0.5,
    fundedRatioImpact: -15.6,
    icon: <AlertTriangle className="w-4 h-4" />,
    severity: "high",
  },
];

// ── Projection Data (seeded) ──────────────────────────────────────────────────

const BASE_ASSETS = 8.4; // $B
const BASE_LIABILITIES = 9.66; // $B => 87% funded ratio

function generateProjectionData(): YearData[] {
  resetSeed();
  const data: YearData[] = [];
  let assets = BASE_ASSETS;
  let liabilities = BASE_LIABILITIES;

  for (let i = 0; i <= 10; i++) {
    const year = 2025 + i;
    if (i > 0) {
      const assetReturn = 0.065 + (rand() - 0.5) * 0.04;
      const contributions = 0.18; // $B annual contributions
      const benefits = 0.22 + rand() * 0.02;
      assets = assets * (1 + assetReturn) + contributions - benefits;

      const discountRateDrift = -0.002 + (rand() - 0.5) * 0.001;
      const benefitGrowth = 0.025 + rand() * 0.01;
      liabilities = liabilities * (1 + benefitGrowth - discountRateDrift);
    }
    data.push({
      year,
      assets: Math.max(assets, 0),
      liabilities,
      fundedRatio: (assets / liabilities) * 100,
    });
  }
  return data;
}

// ── Key Metrics ────────────────────────────────────────────────────────────────

const FUNDED_RATIO = 87.0;
const ASSET_DURATION = 9.2;
const LIABILITY_DURATION = 14.8;
const DURATION_GAP = LIABILITY_DURATION - ASSET_DURATION;
const CONTRIBUTION_RATE = 18.5; // % of payroll
const PBO = 9.66; // $B projected benefit obligation
const PLAN_ASSETS = 8.4; // $B
const DISCOUNT_RATE = 5.25; // %
const ACTUARIAL_RETURN_ASSUMPTION = 7.0; // %

// ── Funded Ratio Gauge SVG ──────────────────────────────────────────────────────

function FundedRatioGauge({ ratio }: { ratio: number }) {
  const cx = 120;
  const cy = 110;
  const r = 85;
  const startAngle = Math.PI;
  const endAngle = 0;
  const toRad = (pct: number) =>
    startAngle + (endAngle - startAngle) * (pct / 100);

  const arc = (pct: number) => {
    const angle = toRad(pct);
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    };
  };

  const zones = [
    { from: 0, to: 60, color: "#ef4444" },
    { from: 60, to: 80, color: "#f59e0b" },
    { from: 80, to: 100, color: "#22c55e" },
  ];

  const arcPath = (from: number, to: number) => {
    const s = arc(from);
    const e = arc(to);
    const large = to - from > 50 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  };

  const needleAngle = toRad(Math.min(ratio, 100));
  const needleLen = 68;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-xs mx-auto">
      {zones.map((z) => (
        <path
          key={z.from}
          d={arcPath(z.from, z.to)}
          fill="none"
          stroke={z.color}
          strokeWidth={14}
          strokeLinecap="butt"
          opacity={0.25}
        />
      ))}
      {/* filled arc up to ratio */}
      <path
        d={arcPath(0, Math.min(ratio, 100))}
        fill="none"
        stroke={ratio >= 80 ? "#22c55e" : ratio >= 60 ? "#f59e0b" : "#ef4444"}
        strokeWidth={14}
        strokeLinecap="butt"
      />
      {/* tick marks */}
      {[0, 25, 50, 75, 100].map((v) => {
        const a = toRad(v);
        const inner = r - 8;
        const outer = r + 4;
        return (
          <line
            key={v}
            x1={cx + inner * Math.cos(a)}
            y1={cy - inner * Math.sin(a)}
            x2={cx + outer * Math.cos(a)}
            y2={cy - outer * Math.sin(a)}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        );
      })}
      {[0, 60, 80, 100].map((v) => {
        const a = toRad(v);
        const lx = cx + (r + 16) * Math.cos(a);
        const ly = cy - (r + 16) * Math.sin(a);
        return (
          <text
            key={v}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="currentColor"
            className="text-muted-foreground"
          >
            {v}%
          </text>
        );
      })}
      {/* needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e2e8f0" strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="#e2e8f0" />
      {/* center text */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={20} fontWeight="700" fill={ratio >= 80 ? "#22c55e" : ratio >= 60 ? "#f59e0b" : "#ef4444"}>
        {ratio.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 38} textAnchor="middle" fontSize={8} fill="currentColor" className="text-muted-foreground">
        Funded Ratio
      </text>
    </svg>
  );
}

// ── Asset vs Liability Bar Chart ─────────────────────────────────────────────

function AssetLiabilityChart({ data }: { data: YearData[] }) {
  const W = 520;
  const H = 200;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.flatMap((d) => [d.assets, d.liabilities])) * 1.1;
  const toY = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const barWidth = chartW / data.length;
  const groupWidth = barWidth * 0.7;
  const singleW = groupWidth / 2 - 2;

  const yTicks = [0, 5, 10, 15, 20];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* grid */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={toY(v)}
            x2={W - padR}
            y2={toY(v)}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
          <text x={padL - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="currentColor" className="text-muted-foreground">
            ${v}B
          </text>
        </g>
      ))}
      {/* bars */}
      {data.map((d, i) => {
        const bx = padL + i * barWidth + (barWidth - groupWidth) / 2;
        return (
          <g key={d.year}>
            {/* assets */}
            <rect
              x={bx}
              y={toY(d.assets)}
              width={singleW}
              height={chartH - (toY(d.assets) - padT)}
              fill="#3b82f6"
              opacity={0.85}
              rx={2}
            />
            {/* liabilities */}
            <rect
              x={bx + singleW + 2}
              y={toY(d.liabilities)}
              width={singleW}
              height={chartH - (toY(d.liabilities) - padT)}
              fill="#ef4444"
              opacity={0.65}
              rx={2}
            />
            <text
              x={bx + groupWidth / 2}
              y={H - padB + 14}
              textAnchor="middle"
              fontSize={8}
              fill="currentColor"
              className="text-muted-foreground"
            >
              {d.year}
            </text>
          </g>
        );
      })}
      {/* legend */}
      <rect x={padL} y={padT - 2} width={8} height={8} fill="#3b82f6" opacity={0.85} rx={1} />
      <text x={padL + 11} y={padT + 4} fontSize={8} fill="currentColor" className="text-muted-foreground" dominantBaseline="middle">Assets</text>
      <rect x={padL + 55} y={padT - 2} width={8} height={8} fill="#ef4444" opacity={0.65} rx={1} />
      <text x={padL + 66} y={padT + 4} fontSize={8} fill="currentColor" className="text-muted-foreground" dominantBaseline="middle">Liabilities</text>
    </svg>
  );
}

// ── Funded Ratio Line Chart ───────────────────────────────────────────────────

function FundedRatioTrend({ data }: { data: YearData[] }) {
  const W = 520;
  const H = 140;
  const padL = 44;
  const padR = 16;
  const padT = 12;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const minR = 70;
  const maxR = 105;
  const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minR) / (maxR - minR)) * chartH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.fundedRatio)}`).join(" ");

  const fillPoints = [
    `${padL},${padT + chartH}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.fundedRatio)}`),
    `${padL + chartW},${padT + chartH}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* 100% line */}
      <line
        x1={padL}
        y1={toY(100)}
        x2={W - padR}
        y2={toY(100)}
        stroke="#22c55e"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.5}
      />
      {/* 80% threshold */}
      <line
        x1={padL}
        y1={toY(80)}
        x2={W - padR}
        y2={toY(80)}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.5}
      />
      <text x={W - padR + 2} y={toY(80)} fontSize={8} fill="#f59e0b" dominantBaseline="middle">80%</text>
      <text x={W - padR + 2} y={toY(100)} fontSize={8} fill="#22c55e" dominantBaseline="middle">100%</text>

      {/* fill */}
      <polygon points={fillPoints} fill="#3b82f6" opacity={0.1} />
      {/* line */}
      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
      {/* dots */}
      {data.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.fundedRatio)} r={3} fill="#3b82f6" />
      ))}
      {/* y-axis */}
      {[75, 80, 85, 90, 95, 100].map((v) => (
        <text key={v} x={padL - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="currentColor" className="text-muted-foreground">
          {v}%
        </text>
      ))}
      {/* x-axis labels */}
      {data.filter((_, i) => i % 2 === 0).map((d, i) => {
        const origIdx = i * 2;
        return (
          <text key={d.year} x={toX(origIdx)} y={H - padB + 14} textAnchor="middle" fontSize={8} fill="currentColor" className="text-muted-foreground">
            {d.year}
          </text>
        );
      })}
    </svg>
  );
}

// ── Duration Gap Visual ───────────────────────────────────────────────────────

function DurationGapBar({ assetDur, liabilityDur }: { assetDur: number; liabilityDur: number }) {
  const maxDur = 20;
  const aWidth = (assetDur / maxDur) * 100;
  const lWidth = (liabilityDur / maxDur) * 100;
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Asset Duration</span>
          <span className="font-semibold text-primary">{assetDur.toFixed(1)} yrs</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${aWidth}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Liability Duration</span>
          <span className="font-semibold text-red-400">{liabilityDur.toFixed(1)} yrs</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${lWidth}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-amber-300">
          Duration gap of <strong>{(liabilityDur - assetDur).toFixed(1)} years</strong> creates interest rate risk. A 100bps rate drop increases liabilities by ~{(liabilityDur * 1).toFixed(1)}% but assets by only ~{(assetDur * 1).toFixed(1)}%.
        </span>
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────

export default function PensionFundPage() {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [selectedLDIStrategy, setSelectedLDIStrategy] = useState<"partial" | "full" | "overlay">("partial");

  const projectionData = useMemo(() => generateProjectionData(), []);

  const weightedAssetDuration = useMemo(() => {
    const total = ASSET_CLASSES.reduce((sum, a) => sum + a.allocation * a.duration, 0);
    const weight = ASSET_CLASSES.reduce((sum, a) => sum + a.allocation, 0);
    return total / weight;
  }, []);

  const weightedHedgeRatio = useMemo(() => {
    const total = ASSET_CLASSES.reduce((sum, a) => sum + a.allocation * a.liabilityHedgeRatio, 0);
    const weight = ASSET_CLASSES.reduce((sum, a) => sum + a.allocation, 0);
    return (total / weight) * 100;
  }, []);

  const ldiStrategies = {
    partial: {
      label: "Partial Hedge (50%)",
      hedgeRatio: 50,
      costBasis: "Low",
      description:
        "Hedge 50% of interest rate exposure using long-duration bonds. Retains growth potential while reducing tail risk.",
      instruments: ["Long-duration Treasuries", "Long-duration IG Corp Bonds", "Interest Rate Swaps (receive fixed)"],
      pros: ["Lower cost", "Retains return potential", "Flexibility to increase over time"],
      cons: ["Still exposed to 50% of rate moves", "Higher funded-ratio volatility"],
    },
    full: {
      label: "Full Hedge (100%)",
      hedgeRatio: 100,
      costBasis: "High",
      description:
        "Fully immunize the portfolio by matching asset and liability duration. Eliminates interest rate risk but constrains returns.",
      instruments: [
        "Treasury Strips (STRIPS)",
        "Long-dated Government Bonds",
        "Liability-Driven Bond Funds",
        "Interest Rate Swaps",
      ],
      pros: ["Eliminates rate risk entirely", "Funded ratio stability", "Regulatory capital benefits"],
      cons: ["Very high cost", "Sacrifices return potential", "Requires frequent rebalancing"],
    },
    overlay: {
      label: "Derivatives Overlay",
      hedgeRatio: 75,
      costBasis: "Medium",
      description:
        "Use interest rate swaps and swaptions as an overlay on a diversified growth portfolio. Efficient use of capital.",
      instruments: ["Interest Rate Swaps (pay float/receive fixed)", "Swaptions", "Treasury Futures", "Interest Rate Options"],
      pros: ["Capital efficient", "Adjustable hedge ratio", "Separates return-seeking from hedging"],
      cons: ["Counterparty risk", "Margin/collateral requirements", "Complexity"],
    },
  };

  const currentLDI = ldiStrategies[selectedLDIStrategy];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div {...fadeIn} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-border">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pension Fund Management</h1>
            <p className="text-muted-foreground text-sm">
              Liability-driven investing, asset-liability matching, actuarial concepts &amp; funded status analysis
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Funded Ratio",
            value: `${FUNDED_RATIO}%`,
            sub: "Assets / PBO",
            icon: <Scale className="w-4 h-4" />,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
            trend: { dir: "down" as const, val: "–2.1pp YoY" },
          },
          {
            label: "Duration Gap",
            value: `${DURATION_GAP.toFixed(1)} yrs`,
            sub: `Asset: ${ASSET_DURATION}y | Liab: ${LIABILITY_DURATION}y`,
            icon: <Activity className="w-4 h-4" />,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
            trend: { dir: "up" as const, val: "+0.3y vs prior yr" },
          },
          {
            label: "Contribution Rate",
            value: `${CONTRIBUTION_RATE}%`,
            sub: "of pensionable payroll",
            icon: <DollarSign className="w-4 h-4" />,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20",
            trend: { dir: "up" as const, val: "+1.5pp mandated" },
          },
          {
            label: "Proj. Benefit Oblig.",
            value: `$${PBO.toFixed(2)}B`,
            sub: `Assets: $${PLAN_ASSETS.toFixed(1)}B`,
            icon: <Target className="w-4 h-4" />,
            color: "text-primary",
            bg: "bg-primary/10 border-border",
            trend: { dir: "up" as const, val: "+$0.4B from aging" },
          },
        ].map((m) => (
          <Card key={m.label} className={cn("border", m.bg)}>
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs text-muted-foreground")}>{m.label}</span>
                <span className={m.color}>{m.icon}</span>
              </div>
              <div className={cn("text-xl font-bold", m.color)}>{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.sub}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {m.trend.dir === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-red-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-green-400" />
                )}
                <span>{m.trend.val}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Tabs */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="funded">
          <TabsList className="mb-4">
            <TabsTrigger value="funded">Funded Status</TabsTrigger>
            <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
            <TabsTrigger value="ldi">LDI Strategy</TabsTrigger>
            <TabsTrigger value="stress">Stress Tests</TabsTrigger>
          </TabsList>

          {/* ── Tab: Funded Status ─────────────────────────────────────────── */}
          <TabsContent value="funded" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border border-l-4 border-l-primary">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    Funded Ratio Gauge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FundedRatioGauge ratio={FUNDED_RATIO} />
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    {[
                      { label: "Critical", range: "<60%", color: "text-red-400" },
                      { label: "At-Risk", range: "60–80%", color: "text-amber-400" },
                      { label: "Healthy", range: ">80%", color: "text-green-400" },
                    ].map((z) => (
                      <div key={z.label} className="text-xs space-y-0.5">
                        <div className={cn("font-semibold", z.color)}>{z.label}</div>
                        <div className="text-muted-foreground">{z.range}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
                    <p><strong className="text-foreground">Actuarial Assumptions:</strong></p>
                    <p>Discount rate: <span className="text-primary">{DISCOUNT_RATE}%</span> (7Y AA Corp Bond yield)</p>
                    <p>Expected return: <span className="text-green-400">{ACTUARIAL_RETURN_ASSUMPTION}%</span> (geometric mean)</p>
                    <p>Salary growth: <span className="text-primary">3.5%</span> | Mortality: SOA PRI-2012</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    10-Year Funded Ratio Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FundedRatioTrend data={projectionData} />
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>
                      At current contribution levels and {ACTUARIAL_RETURN_ASSUMPTION}% return assumption, funded ratio
                      is projected to reach{" "}
                      <span className="text-green-400 font-medium">
                        {projectionData[projectionData.length - 1]?.fundedRatio.toFixed(1)}%
                      </span>{" "}
                      by 2035.
                    </p>
                    <p className="text-amber-300">
                      Dashed amber line = 80% threshold requiring mandatory corrective action.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-400" />
                  Assets vs. Liabilities — 10-Year Projection ($B)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AssetLiabilityChart data={projectionData} />
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  {[
                    { label: "Current Assets", val: `$${PLAN_ASSETS.toFixed(1)}B`, color: "text-primary" },
                    { label: "Current PBO", val: `$${PBO.toFixed(2)}B`, color: "text-red-400" },
                    { label: "Funding Gap", val: `$${(PBO - PLAN_ASSETS).toFixed(2)}B`, color: "text-amber-400" },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-2 rounded-lg bg-muted/50">
                      <div className={cn("font-medium text-base", item.color)}>{item.val}</div>
                      <div className="text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Asset Allocation ──────────────────────────────────────── */}
          <TabsContent value="allocation" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Asset Class Breakdown — Allocation, Return &amp; Hedge Characteristics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="text-left py-2 pr-4">Asset Class</th>
                        <th className="text-right py-2 px-3">Alloc %</th>
                        <th className="text-right py-2 px-3">Exp. Return</th>
                        <th className="text-right py-2 px-3">Duration</th>
                        <th className="text-right py-2 px-3">Hedge Ratio</th>
                        <th className="text-left py-2 pl-4">Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ASSET_CLASSES.map((a) => (
                        <tr key={a.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: a.color }} />
                              <span className="font-medium">{a.name}</span>
                            </div>
                          </td>
                          <td className="text-right px-3 font-medium">{a.allocation}%</td>
                          <td className="text-right px-3 text-green-400">{a.expectedReturn.toFixed(1)}%</td>
                          <td className="text-right px-3 text-primary">{a.duration.toFixed(1)}y</td>
                          <td className="text-right px-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                a.liabilityHedgeRatio >= 0.6
                                  ? "border-green-500/50 text-green-400"
                                  : a.liabilityHedgeRatio >= 0.3
                                  ? "border-amber-500/50 text-amber-400"
                                  : "border-red-500/50 text-red-400"
                              )}
                            >
                              {(a.liabilityHedgeRatio * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="pl-4 py-2.5 w-32">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${a.allocation * 2.5}%`,
                                  backgroundColor: a.color,
                                  opacity: 0.85,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border font-medium text-xs text-muted-foreground bg-muted/20">
                        <td className="py-2 pr-4">Portfolio Weighted Average</td>
                        <td className="text-right px-3">100%</td>
                        <td className="text-right px-3 text-green-400">
                          {(
                            ASSET_CLASSES.reduce((s, a) => s + a.allocation * a.expectedReturn, 0) / 100
                          ).toFixed(2)}%
                        </td>
                        <td className="text-right px-3 text-primary">{weightedAssetDuration.toFixed(1)}y</td>
                        <td className="text-right px-3">
                          <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                            {weightedHedgeRatio.toFixed(0)}%
                          </Badge>
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 border border-border text-xs space-y-1">
                    <p className="font-medium text-primary flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Liability Hedge Ratio
                    </p>
                    <p className="text-muted-foreground">
                      Measures how well each asset class hedges liability movements. Long-duration bonds have high hedge
                      ratios (0.6–0.85) because they respond similarly to interest rate changes as liabilities.
                      Equities have near-zero hedge ratios.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs space-y-1">
                    <p className="font-medium text-green-300 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Return vs. Hedging Tradeoff
                    </p>
                    <p className="text-muted-foreground">
                      High hedge assets (bonds) have lower expected returns. The portfolio balances growth assets
                      (equities, PE) for return generation with liability-hedging assets (long bonds) for risk
                      reduction — known as the &ldquo;two-portfolio approach&rdquo;.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: LDI Strategy ─────────────────────────────────────────── */}
          <TabsContent value="ldi" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Duration Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DurationGapBar assetDur={weightedAssetDuration} liabilityDur={LIABILITY_DURATION} />
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  LDI Strategy Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ldiStrategies) as Array<keyof typeof ldiStrategies>).map((key) => (
                    <Button
                      key={key}
                      variant={selectedLDIStrategy === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLDIStrategy(key)}
                      className="text-xs"
                    >
                      {ldiStrategies[key].label}
                    </Button>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{currentLDI.label}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                        Hedge: {currentLDI.hedgeRatio}%
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          currentLDI.costBasis === "Low"
                            ? "border-green-500/50 text-green-400"
                            : currentLDI.costBasis === "Medium"
                            ? "border-amber-500/50 text-amber-400"
                            : "border-red-500/50 text-red-400"
                        )}
                      >
                        Cost: {currentLDI.costBasis}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentLDI.description}</p>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Instruments Used:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentLDI.instruments.map((inst) => (
                        <Badge key={inst} variant="secondary" className="text-xs">
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-green-400 mb-1">Advantages</p>
                      <ul className="space-y-0.5">
                        {currentLDI.pros.map((p) => (
                          <li key={p} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-green-400 mt-0.5">✓</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-400 mb-1">Limitations</p>
                      <ul className="space-y-0.5">
                        {currentLDI.cons.map((c) => (
                          <li key={c} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-red-400 mt-0.5">✗</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Interest rate sensitivity table */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Interest Rate Sensitivity — Funded Ratio Impact
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-1.5 pr-4">Rate Change</th>
                          <th className="text-right px-3">No Hedge</th>
                          <th className="text-right px-3">50% Hedge</th>
                          <th className="text-right px-3">75% Hedge</th>
                          <th className="text-right px-3">100% Hedge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { shock: "+200bps", noHedge: +5.8, h50: +2.9, h75: +1.5, h100: 0.0 },
                          { shock: "+100bps", noHedge: +2.9, h50: +1.5, h75: +0.7, h100: 0.0 },
                          { shock: "No Change", noHedge: 0.0, h50: 0.0, h75: 0.0, h100: 0.0 },
                          { shock: "–100bps", noHedge: -5.6, h50: -2.8, h75: -1.4, h100: 0.0 },
                          { shock: "–200bps", noHedge: -11.2, h50: -5.6, h75: -2.8, h100: 0.0 },
                        ].map((row) => (
                          <tr key={row.shock} className="border-b border-border/50">
                            <td className="py-1.5 pr-4 font-medium">{row.shock}</td>
                            {[row.noHedge, row.h50, row.h75, row.h100].map((v, i) => (
                              <td
                                key={i}
                                className={cn(
                                  "text-right px-3",
                                  v > 0 ? "text-green-400" : v < 0 ? "text-red-400" : "text-muted-foreground"
                                )}
                              >
                                {v > 0 ? "+" : ""}
                                {v.toFixed(1)}pp
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Stress Tests ─────────────────────────────────────────── */}
          <TabsContent value="stress" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STRESS_SCENARIOS.map((sc, i) => (
                <motion.div
                  key={sc.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card
                    className={cn(
                      "border cursor-pointer transition-all hover:border-primary/50",
                      activeScenario === i
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                    onClick={() => setActiveScenario(activeScenario === i ? null : i)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              sc.severity === "high"
                                ? "text-red-400"
                                : sc.severity === "medium"
                                ? "text-amber-400"
                                : "text-green-400"
                            )}
                          >
                            {sc.icon}
                          </span>
                          <span className="text-sm font-medium">{sc.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize",
                            sc.severity === "high"
                              ? "border-red-500/50 text-red-400"
                              : sc.severity === "medium"
                              ? "border-amber-500/50 text-amber-400"
                              : "border-green-500/50 text-green-400"
                          )}
                        >
                          {sc.severity}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">{sc.description}</div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <div className="text-xs text-muted-foreground mb-0.5">Rate Shock</div>
                          <div className={cn("text-sm font-medium", sc.rateShock >= 0 ? "text-amber-400" : "text-primary")}>
                            {sc.rateShock > 0 ? "+" : ""}
                            {sc.rateShock.toFixed(0) === "0" ? "—" : `${sc.rateShock * 100}bps`}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <div className="text-xs text-muted-foreground mb-0.5">Equity Shock</div>
                          <div className={cn("text-sm font-medium", sc.equityShock >= 0 ? "text-green-400" : "text-red-400")}>
                            {sc.equityShock > 0 ? "+" : ""}
                            {sc.equityShock}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/60 border border-border">
                        <span className="text-xs text-muted-foreground">Funded Ratio Impact</span>
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "text-lg font-medium",
                              sc.fundedRatioImpact > 0 ? "text-green-400" : "text-red-400"
                            )}
                          >
                            {sc.fundedRatioImpact > 0 ? "+" : ""}
                            {sc.fundedRatioImpact.toFixed(1)}pp
                          </span>
                          <span className="text-xs text-muted-foreground">
                            → {(FUNDED_RATIO + sc.fundedRatioImpact).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Summary Table */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-400" />
                  Stress Test Summary — Funded Ratio Under Each Scenario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "Base Case", ratio: FUNDED_RATIO, isBase: true },
                    ...STRESS_SCENARIOS.map((sc) => ({
                      label: sc.name,
                      ratio: FUNDED_RATIO + sc.fundedRatioImpact,
                      isBase: false,
                      severity: sc.severity,
                    })),
                  ].map((row) => {
                    const barWidth = Math.max(0, Math.min(100, row.ratio));
                    return (
                      <div key={row.label} className="flex items-center gap-3 text-xs">
                        <div className="w-44 shrink-0 text-muted-foreground truncate">{row.label}</div>
                        <div className="flex-1 h-5 bg-muted rounded overflow-hidden relative">
                          <div
                            className={cn(
                              "h-full rounded transition-all",
                              row.isBase
                                ? "bg-primary"
                                : row.ratio >= 80
                                ? "bg-green-500"
                                : row.ratio >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                            )}
                            style={{ width: `${barWidth}%`, opacity: 0.75 }}
                          />
                          {/* 80% marker */}
                          <div className="absolute top-0 bottom-0 w-px bg-amber-500/60" style={{ left: "80%" }} />
                        </div>
                        <div
                          className={cn(
                            "w-12 text-right font-medium",
                            row.isBase
                              ? "text-primary"
                              : row.ratio >= 80
                              ? "text-green-400"
                              : row.ratio >= 60
                              ? "text-amber-400"
                              : "text-red-400"
                          )}
                        >
                          {row.ratio.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Amber vertical line marks 80% funded — plans below this threshold typically face mandatory corrective
                  action plans under ERISA and similar frameworks.
                </p>
              </CardContent>
            </Card>

            {/* Actuarial concepts */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Key Actuarial Concepts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      term: "Projected Benefit Obligation (PBO)",
                      def: "PV of all future benefits earned to date, assuming future salary growth. The most comprehensive liability measure under GAAP/IFRS.",
                    },
                    {
                      term: "Accumulated Benefit Obligation (ABO)",
                      def: "PV of benefits based on current salary only — no future wage increases assumed. Lower than PBO for active employees.",
                    },
                    {
                      term: "Asset-Liability Matching (ALM)",
                      def: "Portfolio construction technique that aligns asset cash flows and duration with liability cash flows to minimize surplus volatility.",
                    },
                    {
                      term: "Immunization",
                      def: "Setting asset duration equal to liability duration so that changes in interest rates have equal but offsetting effects on assets and liabilities.",
                    },
                    {
                      term: "Surplus / Deficit",
                      def: "Plan Assets minus PBO. A surplus (positive) means the plan is overfunded. A deficit (negative) means underfunded and may require additional contributions.",
                    },
                    {
                      term: "Normal Cost",
                      def: "The present value of benefits earned by employees in the current year. Represents the ongoing annual accrual of pension liability.",
                    },
                  ].map((item) => (
                    <div key={item.term} className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                      <p className="text-xs font-medium text-foreground">{item.term}</p>
                      <p className="text-xs text-muted-foreground">{item.def}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
