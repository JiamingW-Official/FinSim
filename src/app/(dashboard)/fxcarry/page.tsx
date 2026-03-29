"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  AlertTriangle,
  Activity,
  Globe,
  Target,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 783;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface CarryPosition {
  symbol: string;
  side: "long" | "short";
  longCcy: string;
  shortCcy: string;
  longRate: number;
  shortRate: number;
  differential: number;
  carryIncomeAnnual: number;
  spotReturnYtd: number;
  totalReturnYtd: number;
  flag1: string;
  flag2: string;
}

interface G10Currency {
  code: string;
  name: string;
  policyRate: number;
  flag: string;
  central_bank: string;
}

interface ScatterPoint {
  label: string;
  volRegime: "low" | "high";
  carryReturn: number;
  x: number;
  y: number;
}

interface BacktestPoint {
  year: number;
  carryBasket: number;
  eurusd: number;
}

interface RiskMetric {
  label: string;
  value: number;
  unit: string;
  color: string;
  description: string;
  icon: React.ReactNode;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const G10_CURRENCIES: G10Currency[] = [
  { code: "JPY", name: "Japanese Yen", policyRate: -0.1, flag: "JP", central_bank: "Bank of Japan" },
  { code: "CHF", name: "Swiss Franc", policyRate: 0.25, flag: "CH", central_bank: "SNB" },
  { code: "EUR", name: "Euro", policyRate: 3.15, flag: "EU", central_bank: "ECB" },
  { code: "GBP", name: "British Pound", policyRate: 5.25, flag: "GB", central_bank: "Bank of England" },
  { code: "CAD", name: "Canadian Dollar", policyRate: 4.75, flag: "CA", central_bank: "Bank of Canada" },
  { code: "USD", name: "US Dollar", policyRate: 5.33, flag: "US", central_bank: "Federal Reserve" },
  { code: "NOK", name: "Norwegian Krone", policyRate: 4.5, flag: "NO", central_bank: "Norges Bank" },
  { code: "SEK", name: "Swedish Krona", policyRate: 4.0, flag: "SE", central_bank: "Riksbank" },
  { code: "AUD", name: "Australian Dollar", policyRate: 4.35, flag: "AU", central_bank: "RBA" },
  { code: "NZD", name: "New Zealand Dollar", policyRate: 5.5, flag: "NZ", central_bank: "RBNZ" },
];

const CARRY_BASKET: CarryPosition[] = [
  {
    symbol: "NZD/JPY",
    side: "long",
    longCcy: "NZD",
    shortCcy: "JPY",
    longRate: 5.5,
    shortRate: -0.1,
    differential: 5.6,
    carryIncomeAnnual: 5.6,
    spotReturnYtd: 3.2,
    totalReturnYtd: 8.8,
    flag1: "NZ",
    flag2: "JP",
  },
  {
    symbol: "AUD/JPY",
    side: "long",
    longCcy: "AUD",
    shortCcy: "JPY",
    longRate: 4.35,
    shortRate: -0.1,
    differential: 4.45,
    carryIncomeAnnual: 4.45,
    spotReturnYtd: 2.1,
    totalReturnYtd: 6.55,
    flag1: "AU",
    flag2: "JP",
  },
  {
    symbol: "USD/JPY",
    side: "long",
    longCcy: "USD",
    shortCcy: "JPY",
    longRate: 5.33,
    shortRate: -0.1,
    differential: 5.43,
    carryIncomeAnnual: 5.43,
    spotReturnYtd: 4.8,
    totalReturnYtd: 10.23,
    flag1: "US",
    flag2: "JP",
  },
  {
    symbol: "GBP/CHF",
    side: "long",
    longCcy: "GBP",
    shortCcy: "CHF",
    longRate: 5.25,
    shortRate: 0.25,
    differential: 5.0,
    carryIncomeAnnual: 5.0,
    spotReturnYtd: -0.8,
    totalReturnYtd: 4.2,
    flag1: "GB",
    flag2: "CH",
  },
  {
    symbol: "NZD/CHF",
    side: "long",
    longCcy: "NZD",
    shortCcy: "CHF",
    longRate: 5.5,
    shortRate: 0.25,
    differential: 5.25,
    carryIncomeAnnual: 5.25,
    spotReturnYtd: 1.5,
    totalReturnYtd: 6.75,
    flag1: "NZ",
    flag2: "CH",
  },
  {
    symbol: "USD/CHF",
    side: "long",
    longCcy: "USD",
    shortCcy: "CHF",
    longRate: 5.33,
    shortRate: 0.25,
    differential: 5.08,
    carryIncomeAnnual: 5.08,
    spotReturnYtd: -1.2,
    totalReturnYtd: 3.88,
    flag1: "US",
    flag2: "CH",
  },
];

const STRATEGY_TYPES = [
  {
    name: "Classic Carry",
    description:
      "Long high-yield G10 vs short low-yield G10. Harvests interest rate differential with daily rollover income.",
    pros: ["Daily carry income", "Systematic & scalable", "Positive carry in trending markets"],
    cons: ["Crash risk in risk-off events", "Crowding during long bull cycles", "JPY squeeze risk"],
    sharpe: 0.62,
    maxDD: -34,
    ytd: 7.2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
  {
    name: "Carry + Momentum",
    description:
      "Carry trade filtered by 3-month currency momentum. Only enter carry position when momentum confirms direction.",
    pros: ["Reduces crash risk", "Better risk-adjusted returns", "Trend confirmation filter"],
    cons: ["Lower carry income in range markets", "Timing lag on entries", "Higher turnover costs"],
    sharpe: 0.89,
    maxDD: -18,
    ytd: 9.4,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-border",
  },
  {
    name: "Vol-Targeted Carry",
    description:
      "Scale position size inversely to rolling 20-day FX volatility. Reduce exposure when vol spikes.",
    pros: ["Dynamic risk management", "Lower drawdown profile", "Adapts to vol regimes"],
    cons: ["Complex execution", "Requires daily rebalancing", "Lower absolute returns in calm markets"],
    sharpe: 0.95,
    maxDD: -12,
    ytd: 6.8,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-border",
  },
  {
    name: "EM Carry",
    description:
      "Long emerging market high-yield currencies vs short USD/EUR. Higher carry income but elevated tail risk.",
    pros: ["Higher differential (8–15%)", "Diversification vs G10", "EM growth exposure"],
    cons: ["Political & sovereign risk", "Illiquidity in stress", "Currency controls risk"],
    sharpe: 0.48,
    maxDD: -52,
    ytd: 11.3,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
];

// ── Utility ───────────────────────────────────────────────────────────────────

function FlagEmoji({ code }: { code: string }) {
  const flags: Record<string, string> = {
    NZ: "🇳🇿", AU: "🇦🇺", US: "🇺🇸", GB: "🇬🇧", EU: "🇪🇺",
    JP: "🇯🇵", CH: "🇨🇭", CA: "🇨🇦", NO: "🇳🇴", SE: "🇸🇪",
  };
  return <span className="text-base">{flags[code] ?? "🌐"}</span>;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  positive,
  icon,
  delay,
}: {
  label: string;
  value: string;
  sub: string;
  positive: boolean;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="text-muted-foreground">{icon}</div>
          </div>
          <div
            className={cn(
              "text-2xl font-bold",
              positive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {value}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{sub}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Rate Differential Bar Chart ───────────────────────────────────────────────

function RateDifferentialChart() {
  const sorted = [...G10_CURRENCIES].sort((a, b) => a.policyRate - b.policyRate);
  const minRate = -0.5;
  const maxRate = 6.0;
  const range = maxRate - minRate;
  const chartW = 520;
  const chartH = 280;
  const padL = 52;
  const padR = 16;
  const padT = 20;
  const padB = 28;
  const barH = 18;
  const gap = (chartH - padT - padB - sorted.length * barH) / (sorted.length - 1);

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full h-auto"
      aria-label="G10 policy rate bar chart"
    >
      {/* zero line */}
      <line
        x1={padL + ((-minRate) / range) * (chartW - padL - padR)}
        y1={padT}
        x2={padL + ((-minRate) / range) * (chartW - padL - padR)}
        y2={chartH - padB}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeDasharray="3 3"
        className="text-border"
      />
      {sorted.map((ccy, i) => {
        const y = padT + i * (barH + gap);
        const zeroX = padL + ((-minRate) / range) * (chartW - padL - padR);
        const valX = padL + ((ccy.policyRate - minRate) / range) * (chartW - padL - padR);
        const barW = Math.abs(valX - zeroX);
        const barX = ccy.policyRate >= 0 ? zeroX : valX;
        const isHighYield = ccy.policyRate >= 4.0;
        const isLowYield = ccy.policyRate <= 0.5;
        const barColor = isHighYield ? "#34d399" : isLowYield ? "#f87171" : "#60a5fa";
        return (
          <g key={ccy.code}>
            <text
              x={padL - 4}
              y={y + barH / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              opacity={0.7}
              className="font-mono"
            >
              {ccy.code}
            </text>
            <rect
              x={barX}
              y={y}
              width={Math.max(barW, 2)}
              height={barH}
              fill={barColor}
              fillOpacity={0.8}
              rx={2}
            />
            <text
              x={valX + (ccy.policyRate >= 0 ? 4 : -4)}
              y={y + barH / 2 + 4}
              textAnchor={ccy.policyRate >= 0 ? "start" : "end"}
              fontSize={9}
              fill={barColor}
              fontWeight="600"
            >
              {ccy.policyRate.toFixed(2)}%
            </text>
          </g>
        );
      })}
      {/* x-axis labels */}
      {[-0.5, 0, 1, 2, 3, 4, 5, 6].map((v) => {
        const x = padL + ((v - minRate) / range) * (chartW - padL - padR);
        return (
          <text key={v} x={x} y={chartH - padB + 14} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.5}>
            {v}%
          </text>
        );
      })}
    </svg>
  );
}

// ── Carry vs Vol Scatter Chart ────────────────────────────────────────────────

function CarryVolScatter() {
  // Synthetic data: carry returns in low vol (VIX<15) vs high vol (VIX>20)
  const scatterData = useMemo<ScatterPoint[]>(() => {
    const pts: ScatterPoint[] = [];
    const pairs = ["NZD/JPY", "AUD/JPY", "USD/JPY", "GBP/CHF", "NZD/CHF", "USD/CHF"];
    pairs.forEach((label) => {
      // low vol region: vol 8–15, positive carry returns
      for (let i = 0; i < 8; i++) {
        pts.push({
          label,
          volRegime: "low",
          carryReturn: rand() * 12 + 2,
          x: rand() * 7 + 8,
          y: 0,
        });
      }
      // high vol region: vol 20–40, negative/mixed carry returns
      for (let i = 0; i < 6; i++) {
        pts.push({
          label,
          volRegime: "high",
          carryReturn: rand() * 20 - 18,
          x: rand() * 20 + 20,
          y: 0,
        });
      }
    });
    return pts.map((p) => ({ ...p, y: p.carryReturn }));
  }, []);

  const chartW = 480;
  const chartH = 260;
  const padL = 46;
  const padR = 16;
  const padT = 20;
  const padB = 30;
  const xMin = 5, xMax = 45;
  const yMin = -22, yMax = 16;

  function toX(v: number) {
    return padL + ((v - xMin) / (xMax - xMin)) * (chartW - padL - padR);
  }
  function toY(v: number) {
    return padT + ((yMax - v) / (yMax - yMin)) * (chartH - padT - padB);
  }

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" aria-label="Carry vs volatility scatter">
      {/* zero line */}
      <line x1={padL} y1={toY(0)} x2={chartW - padR} y2={toY(0)} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="3 3" className="text-border" />
      {/* vix-20 divider */}
      <line x1={toX(20)} y1={padT} x2={toX(20)} y2={chartH - padB} stroke="#f59e0b" strokeOpacity={0.3} strokeDasharray="4 2" />
      <text x={toX(20) + 4} y={padT + 12} fontSize={8} fill="#f59e0b" opacity={0.8}>VIX 20</text>
      {/* labels */}
      <text x={padL + 8} y={padT + 14} fontSize={8} fill="#34d399" opacity={0.7}>Low Vol Zone</text>
      <text x={toX(28)} y={padT + 14} fontSize={8} fill="#f87171" opacity={0.7}>High Vol Zone</text>

      {scatterData.map((pt, i) => (
        <circle
          key={i}
          cx={toX(pt.x)}
          cy={toY(pt.y)}
          r={4}
          fill={pt.volRegime === "low" ? "#34d399" : "#f87171"}
          fillOpacity={0.65}
          stroke={pt.volRegime === "low" ? "#34d399" : "#f87171"}
          strokeWidth={0.5}
        />
      ))}
      {/* axes */}
      {[10, 20, 30, 40].map((v) => (
        <text key={v} x={toX(v)} y={chartH - padB + 14} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.5}>
          {v}
        </text>
      ))}
      {[-20, -10, 0, 10].map((v) => (
        <text key={v} x={padL - 4} y={toY(v) + 4} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
          {v}%
        </text>
      ))}
      <text x={(padL + chartW - padR) / 2} y={chartH} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4}>
        Implied Volatility (VIX proxy)
      </text>
    </svg>
  );
}

// ── Backtest Equity Curve ─────────────────────────────────────────────────────

function BacktestEquityCurve() {
  const data = useMemo<BacktestPoint[]>(() => {
    const pts: BacktestPoint[] = [];
    let carry = 100;
    let eurusd = 100;
    for (let year = 2010; year <= 2026; year++) {
      const r = rand();
      const carryAnnual = r * 0.28 - 0.06; // -6% to +22%
      const eurusdAnnual = rand() * 0.22 - 0.10;
      carry *= 1 + carryAnnual;
      eurusd *= 1 + eurusdAnnual;
      pts.push({ year, carryBasket: carry, eurusd });
    }
    return pts;
  }, []);

  const chartW = 560;
  const chartH = 240;
  const padL = 52;
  const padR = 16;
  const padT = 20;
  const padB = 30;

  const allVals = data.flatMap((d) => [d.carryBasket, d.eurusd]);
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.05;

  function toX(i: number) {
    return padL + (i / (data.length - 1)) * (chartW - padL - padR);
  }
  function toY(v: number) {
    return padT + ((maxV - v) / (maxV - minV)) * (chartH - padT - padB);
  }

  const carryPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.carryBasket)}`).join(" ");
  const eurusdPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.eurusd)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" aria-label="Backtest equity curve">
      <path d={carryPath} fill="none" stroke="#34d399" strokeWidth={2} />
      <path d={eurusdPath} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2" />
      {/* legend */}
      <circle cx={padL + 8} cy={padT + 10} r={4} fill="#34d399" />
      <text x={padL + 16} y={padT + 14} fontSize={9} fill="#34d399">Carry Basket</text>
      <circle cx={padL + 100} cy={padT + 10} r={4} fill="#60a5fa" />
      <text x={padL + 108} y={padT + 14} fontSize={9} fill="#60a5fa">EUR/USD</text>
      {/* x-axis */}
      {data.filter((_, i) => i % 3 === 0).map((d, i) => (
        <text key={i} x={toX(i * 3)} y={chartH - padB + 14} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.5}>
          {d.year}
        </text>
      ))}
      {/* y-axis */}
      {[100, 150, 200, 250].map((v) => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={chartW - padR} y2={toY(v)} stroke="currentColor" strokeOpacity={0.08} />
          <text x={padL - 4} y={toY(v) + 4} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
            {v}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Risk Metrics Panel ────────────────────────────────────────────────────────

function RiskMetricsPanel() {
  const metrics: RiskMetric[] = [
    {
      label: "Skewness (3yr)",
      value: -1.82,
      unit: "",
      color: "text-rose-400",
      description: "Negative skew signals crash risk: carry returns have fat left tails during sudden risk-off events.",
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    },
    {
      label: "Crowding Score",
      value: 73,
      unit: "/100",
      color: "text-amber-400",
      description: "High crowding increases unwind risk. A score above 70 suggests positioning is stretched.",
      icon: <Layers className="w-4 h-4 text-amber-400" />,
    },
    {
      label: "VaR 1-day (95%)",
      value: -1.4,
      unit: "%",
      color: "text-amber-400",
      description: "On a typical bad day (top 5%), the basket could lose ~1.4% of NAV.",
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
    },
    {
      label: "Max Drawdown",
      value: -24.3,
      unit: "%",
      color: "text-rose-400",
      description: "Historical peak-to-trough drawdown, typically occurring during risk-off crashes (2008, 2020).",
      icon: <TrendingDown className="w-4 h-4 text-rose-400" />,
    },
    {
      label: "Unwind Scenario",
      value: -18.5,
      unit: "%",
      color: "text-rose-400",
      description: "Simulated loss if positioning unwinds 30% in 5 days — a 2008/COVID-style stress event.",
      icon: <Activity className="w-4 h-4 text-rose-400" />,
    },
    {
      label: "Sharpe Ratio",
      value: 0.68,
      unit: "",
      color: "text-emerald-400",
      description: "Risk-adjusted return vs rolling T-bill rate. > 0.5 considered acceptable for FX strategies.",
      icon: <Target className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
        >
          <Card className="border-border bg-card h-full">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                {m.icon}
              </div>
              <div className={cn("text-lg font-medium", m.color)}>
                {m.value}
                <span className="text-sm font-normal">{m.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FXCarryPage() {
  const [activeTab, setActiveTab] = useState("portfolio");

  const sortedG10 = useMemo(
    () => [...G10_CURRENCIES].sort((a, b) => b.policyRate - a.policyRate),
    []
  );

  const g10CarryReturn = 7.4;
  const carryYtd = 8.2;
  const avgDifferential = 4.96;
  const basketVol = 6.1;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-7 h-7 text-emerald-400" />
          <h1 className="text-lg font-medium">FX Carry Trade &amp; Currency Strategies</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Exploit interest rate differentials across G10 currencies. Monitor carry basket performance,
          rate spreads, volatility regimes, and tail risk in a systematic carry portfolio.
        </p>
      </motion.div>

      {/* Key Metrics — Hero */}
      <div className="border-l-4 border-l-primary rounded-lg bg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="G10 Carry Index (1yr)"
          value={`+${g10CarryReturn}%`}
          sub="Total return incl. carry income"
          positive={true}
          icon={<TrendingUp className="w-4 h-4" />}
          delay={0.05}
        />
        <MetricCard
          label="Carry Basket YTD"
          value={`+${carryYtd}%`}
          sub="6-pair equal-weight basket"
          positive={true}
          icon={<BarChart2 className="w-4 h-4" />}
          delay={0.1}
        />
        <MetricCard
          label="Avg Rate Differential"
          value={`${avgDifferential}%`}
          sub="Long vs short legs spread"
          positive={true}
          icon={<DollarSign className="w-4 h-4" />}
          delay={0.15}
        />
        <MetricCard
          label="Basket Realized Vol"
          value={`${basketVol}%`}
          sub="30-day annualized"
          positive={true}
          icon={<Activity className="w-4 h-4" />}
          delay={0.2}
        />
      </div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mt-8"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="portfolio">Carry Portfolio</TabsTrigger>
            <TabsTrigger value="rates">Interest Rate Differentials</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="strategies">Strategy Types</TabsTrigger>
          </TabsList>

          {/* ── Tab: Carry Portfolio ── */}
          <TabsContent value="portfolio" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Carry Basket Composition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="px-4 py-2 text-left">Pair</th>
                        <th className="px-4 py-2 text-right">Long Rate</th>
                        <th className="px-4 py-2 text-right">Short Rate</th>
                        <th className="px-4 py-2 text-right">Differential</th>
                        <th className="px-4 py-2 text-right">Carry p.a.</th>
                        <th className="px-4 py-2 text-right">Spot YTD</th>
                        <th className="px-4 py-2 text-right">Total YTD</th>
                        <th className="px-4 py-2 text-center">Side</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CARRY_BASKET.map((pos, i) => (
                        <motion.tr
                          key={pos.symbol}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.06 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FlagEmoji code={pos.flag1} />
                              <FlagEmoji code={pos.flag2} />
                              <span className="font-mono font-semibold text-foreground">{pos.symbol}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-400">
                            {pos.longRate.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-rose-400">
                            {pos.shortRate.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-primary font-semibold">
                            {pos.differential.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-400">
                            +{pos.carryIncomeAnnual.toFixed(2)}%
                          </td>
                          <td className={cn("px-4 py-3 text-right font-mono", pos.spotReturnYtd >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {pos.spotReturnYtd >= 0 ? "+" : ""}
                            {pos.spotReturnYtd.toFixed(2)}%
                          </td>
                          <td className={cn("px-4 py-3 text-right font-mono font-medium", pos.totalReturnYtd >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            +{pos.totalReturnYtd.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/30 text-xs">
                              LONG
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Carry Basket vs EUR/USD — Equity Curve (2010–2026)</CardTitle>
              </CardHeader>
              <CardContent>
                <BacktestEquityCurve />
                <p className="text-xs text-muted-foreground mt-2">
                  Simulated equal-weight carry basket (6 pairs, daily roll). Starting value = 100. Past performance is for educational purposes only.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Interest Rate Differentials ── */}
          <TabsContent value="rates" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  G10 Policy Rates — Sorted by Rate Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RateDifferentialChart />
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400/80" />
                    High yield (&ge;4%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm bg-primary/80" />
                    Mid yield
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm bg-rose-400/80" />
                    Low / negative yield
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedG10.map((ccy, i) => (
                <motion.div
                  key={ccy.code}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="border-border bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FlagEmoji code={ccy.flag} />
                        <div>
                          <div className="font-medium text-sm">{ccy.code}</div>
                          <div className="text-xs text-muted-foreground">{ccy.central_bank}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-lg font-medium font-mono",
                            ccy.policyRate >= 4 ? "text-emerald-400" : ccy.policyRate <= 0.5 ? "text-rose-400" : "text-primary"
                          )}
                        >
                          {ccy.policyRate.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">{ccy.name}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab: Risk Analysis ── */}
          <TabsContent value="risk" className="space-y-4">
            <RiskMetricsPanel />

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Carry Returns vs Volatility Regime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CarryVolScatter />
                <p className="text-xs text-muted-foreground mt-2">
                  Each dot represents a monthly observation. Green = low-vol period (VIX &lt; 20), Red = high-vol period (VIX &ge; 20).
                  Note the classic pattern: carry profits in calm markets, sharp losses during stress.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Sudden Unwind Scenario Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Carry trades are vulnerable to sudden reversals. When risk appetite collapses, all participants
                  rush to unwind simultaneously — amplifying losses. The table below shows simulated 5-day unwind
                  scenarios under different shock intensities.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="px-3 py-2 text-left">Scenario</th>
                        <th className="px-3 py-2 text-right">Unwind %</th>
                        <th className="px-3 py-2 text-right">NZD/JPY Loss</th>
                        <th className="px-3 py-2 text-right">AUD/JPY Loss</th>
                        <th className="px-3 py-2 text-right">Basket Loss</th>
                        <th className="px-3 py-2 text-center">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { scenario: "Mild Risk-Off", unwind: 10, nzdjpy: -2.4, audjpy: -2.1, basket: -1.8, severity: "Low" },
                        { scenario: "VIX Spike (>25)", unwind: 20, nzdjpy: -5.8, audjpy: -5.2, basket: -4.6, severity: "Medium" },
                        { scenario: "2008-Style Shock", unwind: 40, nzdjpy: -14.2, audjpy: -12.8, basket: -11.3, severity: "High" },
                        { scenario: "Flash Crash (1hr)", unwind: 30, nzdjpy: -8.6, audjpy: -7.9, basket: -7.1, severity: "High" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2 font-medium">{row.scenario}</td>
                          <td className="px-3 py-2 text-right font-mono text-amber-400">{row.unwind}%</td>
                          <td className="px-3 py-2 text-right font-mono text-rose-400">{row.nzdjpy}%</td>
                          <td className="px-3 py-2 text-right font-mono text-rose-400">{row.audjpy}%</td>
                          <td className="px-3 py-2 text-right font-mono text-rose-400 font-medium">{row.basket}%</td>
                          <td className="px-3 py-2 text-center">
                            <Badge
                              className={cn(
                                "text-xs text-muted-foreground",
                                row.severity === "Low"
                                  ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                                  : row.severity === "Medium"
                                  ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                                  : "bg-rose-400/10 text-rose-400 border-rose-400/30"
                              )}
                            >
                              {row.severity}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Strategy Types ── */}
          <TabsContent value="strategies" className="space-y-4">
            {STRATEGY_TYPES.map((strat, i) => (
              <motion.div
                key={strat.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <Card className={cn("border bg-card", strat.border)}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={cn("text-base font-medium", strat.color)}>{strat.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{strat.description}</p>
                      </div>
                      <div className="flex gap-3 shrink-0 text-center">
                        <div>
                          <div className={cn("text-lg font-medium", strat.color)}>{strat.sharpe}</div>
                          <div className="text-xs text-muted-foreground">Sharpe</div>
                        </div>
                        <div>
                          <div className="text-lg font-medium text-rose-400">{strat.maxDD}%</div>
                          <div className="text-xs text-muted-foreground">Max DD</div>
                        </div>
                        <div>
                          <div className={cn("text-lg font-medium", strat.color)}>+{strat.ytd}%</div>
                          <div className="text-xs text-muted-foreground">YTD</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-emerald-400 mb-1">Advantages</h4>
                        <ul className="space-y-1">
                          {strat.pros.map((p) => (
                            <li key={p} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-emerald-400 mt-0.5">+</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-rose-400 mb-1">Risks</h4>
                        <ul className="space-y-1">
                          {strat.cons.map((c) => (
                            <li key={c} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-rose-400 mt-0.5">-</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-medium text-sm">Educational Note: The Carry Trade Paradox</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Uncovered interest rate parity (UIP) predicts that high-yielding currencies should depreciate
                  enough to offset the rate advantage — but empirically, they often do not (the &quot;forward premium puzzle&quot;).
                  This is why carry trades can be consistently profitable in calm markets. However, the excess returns
                  may partly compensate for the crash risk embedded in the negative-skew return distribution.
                  Carry traders are, in effect, &quot;picking up nickels in front of a steamroller.&quot;
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
                    Learn UIP Theory
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
                    Forward Premium Puzzle
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
                    Risk-Off Dynamics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
