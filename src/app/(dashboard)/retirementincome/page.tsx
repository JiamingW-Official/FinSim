"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  BarChart3,
  Layers,
  Clock,
  ChevronRight,
  Landmark,
  Activity,
  Target,
  Umbrella,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG (seed 895) ────────────────────────────────────────────────────────────
let s = 895;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 895;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtUSD(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmtUSD(n);
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

// ── Normal CDF ─────────────────────────────────────────────────────────────────
function normalCDF(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741;
  const a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + (p * Math.abs(x)) / Math.SQRT2);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp((-x * x) / 2);
  return 0.5 * (1 + sign * y);
}

// ── Monte Carlo ────────────────────────────────────────────────────────────────
interface McPath {
  values: number[];
}

function generateMonteCarloPaths(
  portfolio: number,
  withdrawalRate: number,
  years: number,
  numPaths: number
): McPath[] {
  resetSeed();
  const paths: McPath[] = [];
  const annualWithdrawal = portfolio * (withdrawalRate / 100);
  const mu = 0.07;
  const sigma = 0.14;

  for (let path = 0; path < numPaths; path++) {
    const values: number[] = [portfolio];
    let val = portfolio;
    for (let y = 0; y < years; y++) {
      const u = rand();
      const r = mu + sigma * (u * 2 - 1) * 1.732;
      val = Math.max(0, val * (1 + r) - annualWithdrawal);
      values.push(val);
    }
    paths.push({ values });
  }
  return paths;
}

function getPercentilePath(paths: McPath[], pct: number): number[] {
  const years = paths[0].values.length;
  const result: number[] = [];
  for (let y = 0; y < years; y++) {
    const vals = paths.map((p) => p.values[y]).sort((a, b) => a - b);
    const idx = Math.floor((pct / 100) * (vals.length - 1));
    result.push(vals[idx]);
  }
  return result;
}

// ── Tab 1: Withdrawal Strategies ──────────────────────────────────────────────

function WithdrawalStrategiesTab() {
  const [portfolioSize, setPortfolioSize] = useState(1000000);
  const [withdrawalRate, setWithdrawalRate] = useState(4.0);

  const annualIncome = portfolioSize * (withdrawalRate / 100);
  const monthlyIncome = annualIncome / 12;

  const successRates = useMemo(() => {
    return [3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map((rate) => {
      const zscore = (0.07 - rate / 100) / (0.14 / Math.sqrt(30));
      const raw = normalCDF(zscore) * 100;
      return { rate, success: Math.min(99, Math.max(20, raw)) };
    });
  }, []);

  const mcPaths = useMemo(
    () => generateMonteCarloPaths(portfolioSize, withdrawalRate, 30, 100),
    [portfolioSize, withdrawalRate]
  );

  const p90 = useMemo(() => getPercentilePath(mcPaths, 90), [mcPaths]);
  const p50 = useMemo(() => getPercentilePath(mcPaths, 50), [mcPaths]);
  const p10 = useMemo(() => getPercentilePath(mcPaths, 10), [mcPaths]);

  const maxVal = p90[0];
  const chartH = 200;
  const chartW = 520;
  const years = 30;

  const toX = (y: number) => (y / years) * chartW;
  const toY = (v: number) => chartH - (v / (maxVal * 1.1)) * chartH;

  const pathLine = (vals: number[]) =>
    vals
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`
      )
      .join(" ");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fanPaths = useMemo(
    () => mcPaths.map((p) => pathLine(p.values)),
    [mcPaths]
  );

  const closestSuccess = successRates.reduce((prev, curr) =>
    Math.abs(curr.rate - withdrawalRate) < Math.abs(prev.rate - withdrawalRate)
      ? curr
      : prev
  );
  const successPct = closestSuccess.success;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Withdrawal Strategies
          </h2>
          <p className="text-sm text-muted-foreground">
            The 4% rule (Bengen 1994), dynamic methods, and Monte Carlo
            simulation
          </p>
        </div>
      </div>

      {/* 4% Rule Explainer */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            The 4% Rule — Bengen 1994
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          William Bengen studied historical US stock/bond returns from
          1926–1992 and found that a retiree with a 50/50 portfolio could
          withdraw 4% of the initial balance (inflation-adjusted annually) for
          at least 30 years in every historical period tested.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Assumptions",
              items: [
                "50% stocks / 50% bonds allocation",
                "30-year retirement horizon",
                "Inflation-adjusted withdrawals",
                "US historical return data only",
              ],
            },
            {
              label: "Limitations",
              items: [
                "Future returns may be structurally lower",
                "Doesn't handle 35–40 year retirements",
                "Market sequence order matters greatly",
                "Ignores spending flexibility benefits",
              ],
            },
          ].map((col) => (
            <div key={col.label}>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                {col.label}
              </p>
              <ul className="space-y-1">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-xs text-foreground"
                  >
                    <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Calculator */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Safe Withdrawal Rate Calculator
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Portfolio Size
              </span>
              <span className="text-xs font-medium text-foreground">
                {fmtK(portfolioSize)}
              </span>
            </div>
            <Slider
              min={200000}
              max={5000000}
              step={50000}
              value={[portfolioSize]}
              onValueChange={([v]) => setPortfolioSize(v)}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Withdrawal Rate
              </span>
              <span className="text-xs font-medium text-foreground">
                {fmtPct(withdrawalRate)}
              </span>
            </div>
            <Slider
              min={2.0}
              max={8.0}
              step={0.1}
              value={[withdrawalRate]}
              onValueChange={([v]) => setWithdrawalRate(v)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Annual Income</p>
              <p className="text-xl font-bold text-primary">
                {fmtK(annualIncome)}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Monthly Income</p>
              <p className="text-xl font-bold text-primary">
                {fmtK(monthlyIncome)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Historical Success Rate (30yr)
            </span>
            <Badge
              className={cn(
                "text-xs",
                successPct >= 80
                  ? "bg-green-500/20 text-green-400"
                  : successPct >= 60
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {successPct.toFixed(0)}%
            </Badge>
          </div>
        </div>
      </Card>

      {/* Dynamic Strategies */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Dynamic Withdrawal Strategies
          </span>
        </div>
        <div className="space-y-3">
          {[
            {
              name: "Guardrails Method (Guyton-Klinger)",
              colorCls: "text-primary",
              bgCls: "bg-primary",
              desc: "Set upper (5.5%) and lower (3.5%) guardrails. Cut withdrawals 10% if you hit the upper; take a 10% raise if you hit the lower.",
            },
            {
              name: "RMD Method",
              colorCls: "text-primary",
              bgCls: "bg-primary",
              desc: "Withdraw portfolio / IRS life expectancy factor each year. Automatically adjusts to portfolio size — never depletes the portfolio.",
            },
            {
              name: "Floor-and-Ceiling",
              colorCls: "text-amber-400",
              bgCls: "bg-amber-500",
              desc: "Set a minimum spending floor (e.g., 3%) and maximum ceiling (e.g., 5%). Withdrawals flex within this band based on portfolio performance.",
            },
          ].map((strat) => (
            <div key={strat.name} className="flex gap-3 items-start">
              <div
                className={cn(
                  "mt-1.5 w-2 h-2 rounded-full shrink-0",
                  strat.bgCls
                )}
              />
              <div>
                <p className={cn("text-xs font-semibold", strat.colorCls)}>
                  {strat.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {strat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monte Carlo Fan Chart */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Monte Carlo Fan Chart — 100 Paths, 30 Years
          </span>
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW + 60} ${chartH + 40}`}
            className="w-full max-w-2xl"
          >
            <g transform="translate(50,10)">
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                const yPos = frac * chartH;
                const val = (1 - frac) * maxVal * 1.1;
                return (
                  <g key={frac}>
                    <line
                      x1={0}
                      y1={yPos}
                      x2={chartW}
                      y2={yPos}
                      stroke="#334155"
                      strokeWidth={0.5}
                    />
                    <text
                      x={-4}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize={8}
                      fill="#94a3b8"
                    >
                      {fmtK(val)}
                    </text>
                  </g>
                );
              })}
              {[0, 10, 20, 30].map((yr) => (
                <text
                  key={yr}
                  x={toX(yr)}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#94a3b8"
                >
                  Yr {yr}
                </text>
              ))}
              {fanPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={0.4}
                  opacity={0.15}
                />
              ))}
              <path
                d={pathLine(p90)}
                fill="none"
                stroke="#22c55e"
                strokeWidth={1.5}
              />
              <path
                d={pathLine(p50)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4,2"
              />
              <path
                d={pathLine(p10)}
                fill="none"
                stroke="#ef4444"
                strokeWidth={1.5}
              />
              <line
                x1={0}
                y1={chartH}
                x2={chartW}
                y2={chartH}
                stroke="#475569"
                strokeWidth={1}
              />
            </g>
            <g transform={`translate(${chartW - 30}, ${chartH - 40})`}>
              {[
                { color: "#22c55e", label: "90th pct" },
                { color: "#f59e0b", label: "50th pct" },
                { color: "#ef4444", label: "10th pct" },
              ].map((l, i) => (
                <g key={l.label} transform={`translate(0, ${i * 14})`}>
                  <line
                    x1={0}
                    y1={0}
                    x2={16}
                    y2={0}
                    stroke={l.color}
                    strokeWidth={1.5}
                  />
                  <text x={20} y={4} fontSize={8} fill="#94a3b8">
                    {l.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </Card>

      {/* Success Rate Chart */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Success Rate vs Withdrawal Rate
          </span>
        </div>
        <div className="space-y-2">
          {successRates.map((row) => (
            <div key={row.rate} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8">
                {fmtPct(row.rate)}
              </span>
              <div className="flex-1 bg-muted/30 rounded-full h-3 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    row.success >= 90
                      ? "bg-green-500"
                      : row.success >= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  style={{ width: `${row.success}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium w-10 text-right",
                  row.success >= 90
                    ? "text-green-400"
                    : row.success >= 70
                    ? "text-yellow-400"
                    : "text-red-400"
                )}
              >
                {row.success.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          30-year lognormal model: 7% mean real return, 14% std dev
        </p>
      </Card>
    </div>
  );
}

// ── Tab 2: Sequence of Returns Risk ───────────────────────────────────────────

function SequenceRiskTab() {
  const earlyBull: number[] = [
    0.25, 0.22, 0.18, 0.15, 0.12, 0.08, 0.05, -0.05, -0.1, -0.18, -0.12,
    -0.08, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07,
  ];
  const earlyBear: number[] = [
    -0.18, -0.12, -0.1, -0.05, 0.05, 0.08, 0.12, 0.15, 0.18, 0.22, 0.25,
    -0.08, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07,
  ];

  function simulate(
    returns: number[],
    initial: number,
    annual: number
  ): number[] {
    const vals: number[] = [initial];
    let v = initial;
    for (const r of returns) {
      v = Math.max(0, v * (1 + r) - annual);
      vals.push(v);
    }
    return vals;
  }

  const initial = 1_000_000;
  const annual = 50_000;
  const bullPath = simulate(earlyBull, initial, annual);
  const bearPath = simulate(earlyBear, initial, annual);
  const maxBull = Math.max(...bullPath);

  const chartH = 180;
  const chartW = 480;
  const yrs = earlyBull.length;

  const toX = (i: number) => (i / yrs) * chartW;
  const toY = (v: number, mx: number) =>
    chartH - (v / (mx * 1.1)) * chartH;

  const pathLine = (vals: number[], mx: number) =>
    vals
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(
            v,
            mx
          ).toFixed(1)}`
      )
      .join(" ");

  const buckets = [
    {
      label: "Cash",
      years: "1–3 years",
      alloc: 15,
      color: "#22c55e",
      desc: "HY savings, CDs, T-bills",
    },
    {
      label: "Bonds",
      years: "4–10 years",
      alloc: 35,
      color: "#3b82f6",
      desc: "Intermediate bonds, TIPS",
    },
    {
      label: "Stocks",
      years: "10+ years",
      alloc: 50,
      color: "#a855f7",
      desc: "Diversified equities, REITs",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-500/10">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Sequence of Returns Risk
          </h2>
          <p className="text-sm text-muted-foreground">
            Why the order of returns matters — not just the average — in
            decumulation
          </p>
        </div>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Why Sequence Matters
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          During accumulation, a bad early sequence is recoverable — you keep
          buying shares cheaply and time is on your side. In decumulation, you
          withdraw every year. A severe early bear market forces you to sell
          more shares at low prices to meet spending needs, permanently reducing
          the base that will benefit from the eventual recovery. The exact same
          average return produces radically different outcomes depending purely
          on sequence.
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-green-500/10 p-3">
            <p className="font-semibold text-green-400 mb-1">
              Early Bull, Late Bear
            </p>
            <p className="text-muted-foreground">
              Good gains early protect against later losses. Portfolio compounds
              before withdrawals take a heavy toll.
            </p>
          </div>
          <div className="rounded-lg bg-red-500/10 p-3">
            <p className="font-semibold text-red-400 mb-1">
              Early Bear, Late Bull
            </p>
            <p className="text-muted-foreground">
              Losses early deplete the base. Later gains apply to a smaller
              portfolio that may already be seriously reduced.
            </p>
          </div>
        </div>
      </Card>

      {/* SVG Sequence Chart */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Same Average Return — Different Sequence
          </span>
          <Badge className="text-xs bg-muted/50 text-muted-foreground">
            $1M portfolio, $50K/yr
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW + 60} ${chartH + 40}`}
            className="w-full max-w-2xl"
          >
            <g transform="translate(50,10)">
              {[0, 0.5, 1.0].map((frac) => {
                const yPos = frac * chartH;
                const val = (1 - frac) * maxBull * 1.1;
                return (
                  <g key={frac}>
                    <line
                      x1={0}
                      y1={yPos}
                      x2={chartW}
                      y2={yPos}
                      stroke="#334155"
                      strokeWidth={0.5}
                    />
                    <text
                      x={-4}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize={8}
                      fill="#94a3b8"
                    >
                      {fmtK(val)}
                    </text>
                  </g>
                );
              })}
              {[0, 5, 10, 15, 20].map((yr) => (
                <text
                  key={yr}
                  x={toX(yr)}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#94a3b8"
                >
                  Yr {yr}
                </text>
              ))}
              <path
                d={pathLine(bullPath, maxBull)}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <path
                d={pathLine(bearPath, maxBull)}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <line
                x1={0}
                y1={chartH}
                x2={chartW}
                y2={chartH}
                stroke="#475569"
                strokeWidth={1}
              />
            </g>
            <g transform={`translate(${chartW - 40}, 20)`}>
              <line
                x1={0}
                y1={0}
                x2={16}
                y2={0}
                stroke="#22c55e"
                strokeWidth={2}
              />
              <text x={20} y={4} fontSize={8} fill="#94a3b8">
                Early Bull
              </text>
              <line
                x1={0}
                y1={14}
                x2={16}
                y2={14}
                stroke="#ef4444"
                strokeWidth={2}
              />
              <text x={20} y={18} fontSize={8} fill="#94a3b8">
                Early Bear
              </text>
            </g>
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
          <div className="text-center">
            <p className="text-muted-foreground">Early Bull final value</p>
            <p className="font-semibold text-green-400">
              {fmtK(bullPath[bullPath.length - 1])}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Early Bear final value</p>
            <p
              className={cn(
                "font-semibold",
                bearPath[bearPath.length - 1] === 0
                  ? "text-red-400"
                  : "text-yellow-400"
              )}
            >
              {bearPath[bearPath.length - 1] === 0
                ? "Depleted"
                : fmtK(bearPath[bearPath.length - 1])}
            </p>
          </div>
        </div>
      </Card>

      {/* Mitigation Strategies */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Mitigation Strategies
          </span>
        </div>
        <div className="space-y-3">
          {[
            {
              name: "Cash Buffer (1–2 year)",
              colorCls: "text-green-400",
              bgCls: "bg-green-500/10",
              desc: "Hold 1–2 years of expenses in cash/CDs. Draw from this during downturns instead of selling equities. Refill when markets recover.",
            },
            {
              name: "Bond Tent (Rising equity glidepath)",
              colorCls: "text-primary",
              bgCls: "bg-primary/10",
              desc: "Enter retirement with 40% bonds, decline to 20% over the first 10 years as the sequence risk window passes. Protects early years, captures equity growth later.",
            },
            {
              name: "Dynamic Withdrawals",
              colorCls: "text-amber-400",
              bgCls: "bg-amber-500/10",
              desc: "Spend less in bad years, more in good years. Even a 10% spending cut in down years dramatically improves long-term survival rates.",
            },
          ].map((strat) => (
            <div
              key={strat.name}
              className={cn("rounded-lg p-3", strat.bgCls)}
            >
              <p className={cn("text-xs font-semibold mb-1", strat.colorCls)}>
                {strat.name}
              </p>
              <p className="text-xs text-muted-foreground">{strat.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bucket Strategy */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            The Bucket Strategy
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {buckets.map((b, i) => (
            <div key={b.years} className="text-center">
              <div
                className="rounded-lg p-3 mb-2"
                style={{
                  backgroundColor: `${b.color}20`,
                  border: `1px solid ${b.color}40`,
                }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: b.color }}
                >
                  Bucket {i + 1}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.years}
                </p>
                <p
                  className="text-lg font-bold mt-1"
                  style={{ color: b.color }}
                >
                  {b.alloc}%
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
        {/* Bucket Bar SVG */}
        <svg viewBox="0 0 400 40" className="w-full">
          {(() => {
            let offset = 0;
            return buckets.map((b) => {
              const w = (b.alloc / 100) * 400;
              const x = offset;
              offset += w;
              return (
                <g key={b.label}>
                  <rect
                    x={x}
                    y={8}
                    width={w}
                    height={24}
                    rx={4}
                    fill={b.color}
                    opacity={0.8}
                  />
                  <text
                    x={x + w / 2}
                    y={24}
                    textAnchor="middle"
                    fontSize={9}
                    fill="white"
                    fontWeight="bold"
                  >
                    {b.alloc}%
                  </text>
                </g>
              );
            });
          })()}
        </svg>
        <p className="text-xs text-muted-foreground mt-3">
          <span className="font-semibold text-foreground">
            Rebalancing rule:{" "}
          </span>
          When Bucket 1 falls below 6 months of expenses, liquidate from Bucket
          2. Refill Bucket 2 from Bucket 3 only in flat/up markets. Avoid
          selling equities in a declining market.
        </p>
      </Card>
    </div>
  );
}

// ── Tab 3: Social Security Optimization ───────────────────────────────────────

function SocialSecurityTab() {
  const monthlyBenefit62 = 1500;
  const monthlyBenefit66 = 2000;
  const monthlyBenefit70 = 2640;

  function cumulativeBenefits(
    startAge: number,
    monthly: number
  ): { age: number; cum: number }[] {
    const result: { age: number; cum: number }[] = [];
    for (let age = 62; age <= 90; age++) {
      if (age < startAge) {
        result.push({ age, cum: 0 });
      } else {
        const prevCum =
          result.length > 0 ? result[result.length - 1].cum : 0;
        result.push({ age, cum: prevCum + monthly * 12 });
      }
    }
    return result;
  }

  const cum62 = cumulativeBenefits(62, monthlyBenefit62);
  const cum66 = cumulativeBenefits(66, monthlyBenefit66);
  const cum70 = cumulativeBenefits(70, monthlyBenefit70);

  const maxCum = cum70[cum70.length - 1].cum;
  const chartH = 200;
  const chartW = 480;
  const ageRange = 90 - 62;

  const toX = (age: number) => ((age - 62) / ageRange) * chartW;
  const toY = (v: number) => chartH - (v / (maxCum * 1.05)) * chartH;

  const pathLine = (data: { age: number; cum: number }[]) =>
    data
      .map(
        (d, i) =>
          `${i === 0 ? "M" : "L"} ${toX(d.age).toFixed(1)} ${toY(
            d.cum
          ).toFixed(1)}`
      )
      .join(" ");

  // Breakeven: index in cum array where one strategy surpasses another
  const rawBe6266 = cum62.findIndex((d, i) => i > 0 && cum66[i].cum > d.cum);
  const rawBe6670 = cum66.findIndex((d, i) => i > 0 && cum70[i].cum > d.cum);
  const be6266 = rawBe6266 > 0 ? 62 + rawBe6266 : 78;
  const be6670 = rawBe6670 > 0 ? 62 + rawBe6670 : 82;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Landmark className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Social Security Optimization
          </h2>
          <p className="text-sm text-muted-foreground">
            Breakeven analysis, spousal strategies, and taxability thresholds
          </p>
        </div>
      </div>

      {/* Benefit Amount Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            age: 62,
            monthly: monthlyBenefit62,
            label: "Early",
            colorCls: "text-amber-400",
            bgCls: "bg-amber-500/10",
            reduction: "-25% vs FRA",
          },
          {
            age: 66,
            monthly: monthlyBenefit66,
            label: "Full Retirement Age",
            colorCls: "text-green-400",
            bgCls: "bg-green-500/10",
            reduction: "Baseline",
          },
          {
            age: 70,
            monthly: monthlyBenefit70,
            label: "Maximum",
            colorCls: "text-primary",
            bgCls: "bg-primary/10",
            reduction: "+32% vs FRA",
          },
        ].map((opt) => (
          <Card
            key={opt.age}
            className={cn("p-3 border-border text-center", opt.bgCls)}
          >
            <p className={cn("text-xs font-semibold", opt.colorCls)}>
              Age {opt.age}
            </p>
            <p className="text-xs text-muted-foreground">{opt.label}</p>
            <p className={cn("text-xl font-bold mt-1", opt.colorCls)}>
              {fmtK(opt.monthly)}/mo
            </p>
            <Badge
              className={cn("text-xs mt-1", opt.bgCls, opt.colorCls)}
            >
              {opt.reduction}
            </Badge>
          </Card>
        ))}
      </div>

      {/* Breakeven Crossover Chart */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Cumulative Lifetime Benefits — Breakeven Analysis
          </span>
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW + 60} ${chartH + 40}`}
            className="w-full max-w-2xl"
          >
            <g transform="translate(55,10)">
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                const yPos = frac * chartH;
                const val = (1 - frac) * maxCum * 1.05;
                return (
                  <g key={frac}>
                    <line
                      x1={0}
                      y1={yPos}
                      x2={chartW}
                      y2={yPos}
                      stroke="#334155"
                      strokeWidth={0.5}
                    />
                    <text
                      x={-4}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize={7}
                      fill="#94a3b8"
                    >
                      {fmtK(val)}
                    </text>
                  </g>
                );
              })}
              {[62, 66, 70, 75, 80, 85, 90].map((age) => (
                <text
                  key={age}
                  x={toX(age)}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#94a3b8"
                >
                  {age}
                </text>
              ))}
              <path
                d={pathLine(cum62)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
              />
              <path
                d={pathLine(cum66)}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <path
                d={pathLine(cum70)}
                fill="none"
                stroke="#a855f7"
                strokeWidth={2}
              />
              {/* Breakeven verticals */}
              <line
                x1={toX(be6266)}
                y1={0}
                x2={toX(be6266)}
                y2={chartH}
                stroke="#94a3b8"
                strokeWidth={0.8}
                strokeDasharray="3,2"
              />
              <text
                x={toX(be6266) + 2}
                y={20}
                fontSize={7}
                fill="#94a3b8"
              >
                BE {be6266}
              </text>
              <line
                x1={toX(be6670)}
                y1={0}
                x2={toX(be6670)}
                y2={chartH}
                stroke="#94a3b8"
                strokeWidth={0.8}
                strokeDasharray="3,2"
              />
              <text
                x={toX(be6670) + 2}
                y={35}
                fontSize={7}
                fill="#94a3b8"
              >
                BE {be6670}
              </text>
              <line
                x1={0}
                y1={chartH}
                x2={chartW}
                y2={chartH}
                stroke="#475569"
                strokeWidth={1}
              />
            </g>
            <g transform={`translate(${chartW - 30}, 20)`}>
              {[
                { color: "#f59e0b", label: "Age 62" },
                { color: "#22c55e", label: "Age 66" },
                { color: "#a855f7", label: "Age 70" },
              ].map((l, i) => (
                <g key={l.label} transform={`translate(0, ${i * 14})`}>
                  <line
                    x1={0}
                    y1={0}
                    x2={16}
                    y2={0}
                    stroke={l.color}
                    strokeWidth={2}
                  />
                  <text x={20} y={4} fontSize={8} fill="#94a3b8">
                    {l.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
          <div className="rounded-lg bg-muted/20 p-2">
            <p className="text-muted-foreground">62 vs 66 breakeven</p>
            <p className="font-semibold text-foreground">Age {be6266}</p>
            <p className="text-muted-foreground">
              Live past this — age 66 wins
            </p>
          </div>
          <div className="rounded-lg bg-muted/20 p-2">
            <p className="text-muted-foreground">66 vs 70 breakeven</p>
            <p className="font-semibold text-foreground">Age {be6670}</p>
            <p className="text-muted-foreground">
              Live past this — age 70 wins
            </p>
          </div>
        </div>
      </Card>

      {/* Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="font-semibold text-sm text-foreground">
              Spousal Benefit Strategies
            </span>
          </div>
          <ul className="space-y-2">
            {[
              "Lower earner can claim up to 50% of higher earner's FRA benefit",
              "Claim spousal benefit first while own benefit grows to 70",
              "Higher earner should delay to 70 to maximize survivor benefit",
              "Widow/widower receives 100% of deceased spouse's benefit",
              "Restricted application: file spousal only at FRA if born before 1954",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <ChevronRight className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm text-foreground">
              Taxability and Offsets
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <p className="font-semibold text-amber-400 mb-1">
                Taxable Thresholds
              </p>
              <p className="text-muted-foreground">
                Single: 50% taxable above $25K combined income; 85% taxable
                above $34K
              </p>
              <p className="text-muted-foreground mt-1">
                MFJ: 50% above $32K; 85% above $44K
              </p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-2">
              <p className="font-semibold text-red-400 mb-1">
                Government Pension Offset (GPO)
              </p>
              <p className="text-muted-foreground">
                Public employees with non-covered pensions: spousal SS reduced
                by 2/3 of pension. WEP reduces own SS benefit.
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2">
              <p className="font-semibold text-primary mb-1">
                Earnings Test (before FRA)
              </p>
              <p className="text-muted-foreground">
                Benefits reduced $1 for every $2 earned above $22,320 (2024).
                No earnings test after FRA.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Income Replacement Rate */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Income Replacement Rate by Claiming Strategy
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Assumes pre-retirement income of $80,000/year
        </p>
        <div className="space-y-2">
          {[
            {
              label: "Claim at 62 + portfolio draw",
              ss: monthlyBenefit62 * 12,
              portfolio: 24000,
            },
            {
              label: "Claim at 66 + portfolio draw",
              ss: monthlyBenefit66 * 12,
              portfolio: 16000,
            },
            {
              label: "Claim at 70 + bridge income",
              ss: monthlyBenefit70 * 12,
              portfolio: 8000,
            },
          ].map((row) => {
            const total = row.ss + row.portfolio;
            const pct = (total / 80000) * 100;
            return (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">
                    {fmtK(total)}/yr ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 4: Income Flooring ─────────────────────────────────────────────────────

interface AnnuityType {
  name: string;
  full: string;
  payout: number;
  flexibility: number;
  upside: number;
}

function IncomeFlooringTab() {
  const annuities: AnnuityType[] = [
    {
      name: "SPIA",
      full: "Single Premium Immediate Annuity",
      payout: 6.2,
      flexibility: 1,
      upside: 1,
    },
    {
      name: "DIA",
      full: "Deferred Income Annuity",
      payout: 8.5,
      flexibility: 1,
      upside: 1,
    },
    {
      name: "FIA",
      full: "Fixed Indexed Annuity",
      payout: 4.8,
      flexibility: 3,
      upside: 3,
    },
    {
      name: "VA",
      full: "Variable Annuity",
      payout: 4.0,
      flexibility: 4,
      upside: 5,
    },
  ];

  // Payout rate vs 10yr treasury
  const chartH = 160;
  const chartW = 400;
  const rates10yr = [2, 3, 4, 5, 6];
  const payouts = rates10yr.map((r) => ({
    r,
    spia: r + 2.0,
    dia: r + 4.0,
  }));
  const maxPayout = Math.max(...payouts.map((p) => p.dia));

  const toXP = (r: number) => ((r - 2) / 4) * chartW;
  const toYP = (p: number) => chartH - (p / (maxPayout + 1)) * chartH;

  const spiaPath = payouts
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${toXP(p.r).toFixed(1)} ${toYP(
          p.spia
        ).toFixed(1)}`
    )
    .join(" ");
  const diaPath = payouts
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${toXP(p.r).toFixed(1)} ${toYP(
          p.dia
        ).toFixed(1)}`
    )
    .join(" ");

  // Certainty vs flexibility scatter
  const tradeoff = [
    { label: "SPIA", certainty: 98, flexibility: 5 },
    { label: "DIA", certainty: 95, flexibility: 8 },
    { label: "FIA", certainty: 75, flexibility: 45 },
    { label: "VA+GLWB", certainty: 70, flexibility: 55 },
    { label: "Bond Ladder", certainty: 85, flexibility: 30 },
    { label: "Portfolio Only", certainty: 45, flexibility: 95 },
  ];
  const tW = 320;
  const tH = 160;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Umbrella className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Income Flooring
          </h2>
          <p className="text-sm text-muted-foreground">
            Guaranteed floor + growth portfolio: annuity types, longevity
            insurance, and the flexibility tradeoff
          </p>
        </div>
      </div>

      {/* Floor-Upside Framework */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Floor-and-Upside Framework
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-primary/10 border border-border p-3">
            <p className="text-xs font-semibold text-primary mb-2">
              Income Floor (Guaranteed)
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Cover essential expenses with guaranteed sources. This floor
              should never be at risk regardless of market conditions.
            </p>
            <ul className="space-y-1">
              {[
                "Social Security",
                "Defined benefit pension",
                "SPIA / DIA annuity income",
                "Bond ladder for 10–15 years",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-foreground"
                >
                  <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-primary/10 border border-border p-3">
            <p className="text-xs font-semibold text-primary mb-2">
              Upside Portfolio (Growth)
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Fund discretionary expenses, inflation, legacy, and long-term
              care from a diversified growth portfolio.
            </p>
            <ul className="space-y-1">
              {[
                "Diversified equity portfolio",
                "REITs and alternatives",
                "Inflation-linked bonds (TIPS)",
                "Flexible drawdown strategy",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-foreground"
                >
                  <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Annuity Comparison Table */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Annuity Types Comparison
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">
                  Type
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Payout Rate
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Flexibility
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Upside
                </th>
              </tr>
            </thead>
            <tbody>
              {annuities.map((ann) => (
                <tr key={ann.name} className="border-b border-border/50">
                  <td className="py-2">
                    <p className="font-semibold text-foreground">{ann.name}</p>
                    <p className="text-muted-foreground">{ann.full}</p>
                  </td>
                  <td className="py-2 text-right font-medium text-green-400">
                    {fmtPct(ann.payout)}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-sm",
                            i < ann.flexibility
                              ? "bg-primary"
                              : "bg-muted/30"
                          )}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-sm",
                            i < ann.upside ? "bg-primary" : "bg-muted/30"
                          )}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pros/Cons below table */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="font-semibold text-xs text-foreground">
                Case FOR Annuities
              </span>
            </div>
            <ul className="space-y-1">
              {[
                "Eliminates longevity risk — income for life",
                "Removes sequence-of-returns risk for floor",
                "Behavioral benefit: spending permission",
                "Mortality credits boost payout vs bonds",
                "Insurer credit risk, not market risk",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold text-xs text-foreground">
                Case AGAINST Annuities
              </span>
            </div>
            <ul className="space-y-1">
              {[
                "Irrevocable — permanent loss of liquidity",
                "Inflation erodes fixed nominal payments",
                "Insurer credit risk (check AM Best rating)",
                "No bequest value if you die early",
                "Low rates produce poor payout values",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Payout Rate vs Interest Rate Chart */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Annuity Payout Rates vs 10-Year Treasury
          </span>
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW + 60} ${chartH + 40}`}
            className="w-full max-w-xl"
          >
            <g transform="translate(45,10)">
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                const yPos = frac * chartH;
                const val = (1 - frac) * (maxPayout + 1);
                return (
                  <g key={frac}>
                    <line
                      x1={0}
                      y1={yPos}
                      x2={chartW}
                      y2={yPos}
                      stroke="#334155"
                      strokeWidth={0.5}
                    />
                    <text
                      x={-4}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize={8}
                      fill="#94a3b8"
                    >
                      {val.toFixed(1)}%
                    </text>
                  </g>
                );
              })}
              {rates10yr.map((r) => (
                <text
                  key={r}
                  x={toXP(r)}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#94a3b8"
                >
                  {r}%
                </text>
              ))}
              <text
                x={chartW / 2}
                y={chartH + 28}
                textAnchor="middle"
                fontSize={8}
                fill="#64748b"
              >
                10-Year Treasury Yield
              </text>
              <path
                d={spiaPath}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <path
                d={diaPath}
                fill="none"
                stroke="#a855f7"
                strokeWidth={2}
              />
              <line
                x1={0}
                y1={chartH}
                x2={chartW}
                y2={chartH}
                stroke="#475569"
                strokeWidth={1}
              />
            </g>
            <g transform={`translate(${chartW - 10}, 20)`}>
              {[
                { color: "#22c55e", label: "SPIA" },
                { color: "#a855f7", label: "DIA" },
              ].map((l, i) => (
                <g key={l.label} transform={`translate(0, ${i * 14})`}>
                  <line
                    x1={0}
                    y1={0}
                    x2={16}
                    y2={0}
                    stroke={l.color}
                    strokeWidth={2}
                  />
                  <text x={20} y={4} fontSize={8} fill="#94a3b8">
                    {l.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          SPIA payout ≈ Treasury + 2% (mortality credits). DIA payout ≈
          Treasury + 4% (deferral bonus). Higher rates = better annuity value.
        </p>
      </Card>

      {/* Certainty vs Flexibility Scatter */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Income Certainty vs Flexibility Tradeoff
          </span>
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${tW + 60} ${tH + 50}`}
            className="w-full max-w-lg"
          >
            <g transform="translate(40,10)">
              {[0, 0.5, 1.0].map((frac) => (
                <g key={frac}>
                  <line
                    x1={0}
                    y1={frac * tH}
                    x2={tW}
                    y2={frac * tH}
                    stroke="#334155"
                    strokeWidth={0.5}
                  />
                  <line
                    x1={frac * tW}
                    y1={0}
                    x2={frac * tW}
                    y2={tH}
                    stroke="#334155"
                    strokeWidth={0.5}
                  />
                </g>
              ))}
              <text
                x={tW / 2}
                y={tH + 28}
                textAnchor="middle"
                fontSize={8}
                fill="#64748b"
              >
                Flexibility
              </text>
              <text
                x={-28}
                y={tH / 2}
                textAnchor="middle"
                fontSize={8}
                fill="#64748b"
                transform={`rotate(-90, -28, ${tH / 2})`}
              >
                Certainty
              </text>
              {tradeoff.map((pt) => {
                const cx = (pt.flexibility / 100) * tW;
                const cy = tH - (pt.certainty / 100) * tH;
                return (
                  <g key={pt.label}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#3b82f6"
                      opacity={0.8}
                    />
                    <text x={cx + 7} y={cy + 4} fontSize={8} fill="#94a3b8">
                      {pt.label}
                    </text>
                  </g>
                );
              })}
              <line
                x1={0}
                y1={tH}
                x2={tW}
                y2={tH}
                stroke="#475569"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={tH}
                stroke="#475569"
                strokeWidth={1}
              />
            </g>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Annuities sit in the upper-left (high certainty, low flexibility).
          Portfolio-only is lower-right. The optimal solution combines a
          guaranteed floor with a flexible growth portfolio.
        </p>
      </Card>

      {/* Longevity Risk / QLAC */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Longevity Risk Insurance — Deferred Income Annuity (DIA)
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          A DIA purchased at 65 with income starting at 85 costs relatively
          little (you may not live to 85) but provides substantial income if
          you do. This pure longevity insurance lets you draw down your
          portfolio more aggressively in the 65–85 window knowing backup income
          arrives at 85.
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            {
              label: "Premium at 65",
              value: "$100,000",
              colorCls: "text-muted-foreground",
            },
            {
              label: "Income from age 85",
              value: "$2,400/mo",
              colorCls: "text-primary",
            },
            {
              label: "IRR if live to 95",
              value: "~7.8%/yr",
              colorCls: "text-green-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-muted/20 p-2 text-center"
            >
              <p className="text-muted-foreground">{stat.label}</p>
              <p className={cn("font-bold text-sm mt-0.5", stat.colorCls)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-primary/10 border border-border p-3 text-xs text-muted-foreground">
          <span className="font-semibold text-primary">
            QLAC (Qualified Longevity Annuity Contract):{" "}
          </span>
          IRS allows up to the lesser of $200,000 or 25% of IRA balance to be
          placed in a QLAC. Those funds are excluded from RMD calculations
          until income begins (max deferral age 85). Effective way to reduce
          early RMDs while securing longevity coverage.
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function RetirementIncomePage() {
  const tabs = [
    { id: "withdrawal", label: "Withdrawal Strategies", icon: TrendingUp },
    { id: "sequence", label: "Sequence of Returns", icon: AlertTriangle },
    { id: "socialsecurity", label: "Social Security", icon: Landmark },
    { id: "flooring", label: "Income Flooring", icon: Umbrella },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 pt-6 pb-4 border-b border-border shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Retirement Income Planning
            </h1>
            <p className="text-sm text-muted-foreground">
              Decumulation strategies, sequence risk, Social Security
              optimization, and income flooring
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge className="bg-primary/10 text-primary text-xs">
              Decumulation
            </Badge>
            <Badge className="bg-muted/50 text-muted-foreground text-xs">
              Advanced
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-4"
      >
        <Tabs defaultValue="withdrawal" className="w-full">
          <TabsList className="w-full mb-6 grid grid-cols-4 h-auto gap-1 bg-muted/30 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 py-2 px-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-lg transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span className="leading-tight text-center">
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent
            value="withdrawal"
            className="data-[state=inactive]:hidden"
          >
            <WithdrawalStrategiesTab />
          </TabsContent>
          <TabsContent
            value="sequence"
            className="data-[state=inactive]:hidden"
          >
            <SequenceRiskTab />
          </TabsContent>
          <TabsContent
            value="socialsecurity"
            className="data-[state=inactive]:hidden"
          >
            <SocialSecurityTab />
          </TabsContent>
          <TabsContent
            value="flooring"
            className="data-[state=inactive]:hidden"
          >
            <IncomeFlooringTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
