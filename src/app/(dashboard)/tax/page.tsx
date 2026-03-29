"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Calculator,
  TrendingDown,
  PiggyBank,
  BarChart3,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  DollarSign,
  Clock,
  Repeat,
  Gift,
  Building2,
} from "lucide-react";

// ── Tax bracket data ──────────────────────────────────────────────────────────

const TAX_BRACKETS = [
  { min: 0,       max: 11600,    rate: 0.10, label: "10%" },
  { min: 11600,   max: 47150,    rate: 0.12, label: "12%" },
  { min: 47150,   max: 100525,   rate: 0.22, label: "22%" },
  { min: 100525,  max: 191950,   rate: 0.24, label: "24%" },
  { min: 191950,  max: 243725,   rate: 0.32, label: "32%" },
  { min: 243725,  max: 609350,   rate: 0.35, label: "35%" },
  { min: 609350,  max: Infinity, rate: 0.37, label: "37%" },
];

const BRACKET_COLORS = [
  "#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#dc2626", "#991b1b",
];

const CAPITAL_GAINS_BRACKETS = [
  { min: 0,       max: 47025,    rate: 0.00, label: "0%" },
  { min: 47025,   max: 518900,   rate: 0.15, label: "15%" },
  { min: 518900,  max: Infinity, rate: 0.20, label: "20%" },
];

// ── Synthetic portfolio positions ─────────────────────────────────────────────

const INITIAL_POSITIONS = [
  { id: 1, ticker: "AAPL", shares: 50,  costBasis: 145.00, currentPrice: 189.50, selected: false },
  { id: 2, ticker: "NVDA", shares: 30,  costBasis: 220.00, currentPrice: 495.80, selected: false },
  { id: 3, ticker: "META", shares: 20,  costBasis: 330.00, currentPrice: 512.40, selected: false },
  { id: 4, ticker: "INTC", shares: 100, costBasis: 42.00,  currentPrice: 22.30,  selected: false },
  { id: 5, ticker: "PYPL", shares: 80,  costBasis: 118.00, currentPrice: 62.50,  selected: false },
  { id: 6, ticker: "DIS",  shares: 60,  costBasis: 180.00, currentPrice: 111.80, selected: false },
  { id: 7, ticker: "AMZN", shares: 25,  costBasis: 98.00,  currentPrice: 185.20, selected: false },
  { id: 8, ticker: "NFLX", shares: 15,  costBasis: 480.00, currentPrice: 620.00, selected: false },
];

const WASH_SALE_ALTERNATIVES: Record<string, string[]> = {
  INTC: ["SOXX", "SMH"],
  PYPL: ["SQ", "FIS"],
  DIS:  ["PARA", "WBD"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

function computeTax(income: number): {
  breakdown: { bracket: (typeof TAX_BRACKETS)[number]; taxed: number; tax: number }[];
  total: number;
} {
  let remaining = income;
  let total = 0;
  const breakdown: { bracket: (typeof TAX_BRACKETS)[number]; taxed: number; tax: number }[] = [];
  for (const b of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const range = b.max === Infinity ? remaining : Math.min(remaining, b.max - b.min);
    const taxed = Math.min(remaining, range);
    const tax = taxed * b.rate;
    breakdown.push({ bracket: b, taxed, tax });
    total += tax;
    remaining -= taxed;
  }
  return { breakdown, total };
}

function capitalGainsRate(income: number): number {
  for (const b of CAPITAL_GAINS_BRACKETS) {
    if (income <= b.max) return b.rate;
  }
  return 0.20;
}

function marginalRate(income: number): number {
  for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
    if (income > TAX_BRACKETS[i].min) return TAX_BRACKETS[i].rate;
  }
  return 0.10;
}

// ── Tab 1: Tax Overview Dashboard ─────────────────────────────────────────────

function TaxOverviewTab() {
  const [income, setIncome] = useState(85000);

  const { breakdown, total } = useMemo(() => computeTax(income), [income]);
  const effectiveRate = income > 0 ? total / income : 0;
  const marginal = useMemo(() => marginalRate(income), [income]);
  const cgRate = capitalGainsRate(income);

  // SVG staircase chart
  const chartW = 480;
  const chartH = 150;
  const maxRate = 0.37;
  const totalRange = 250000;

  const bars = TAX_BRACKETS.slice(0, 6).map((b, i) => {
    const x1 = (b.min / totalRange) * chartW;
    const x2 = (Math.min(b.max, totalRange) / totalRange) * chartW;
    const barH = (b.rate / maxRate) * (chartH - 20);
    return { x1, x2, barH, color: BRACKET_COLORS[i], label: b.label, rate: b.rate, min: b.min };
  });

  const markerX = Math.min(income / totalRange, 1) * chartW;

  return (
    <div className="space-y-4">
      {/* Quick calculator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-3.5 w-3.5 text-muted-foreground/50" />
            Federal Income Tax Calculator (2024, Single Filer)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Annual Taxable Income</span>
            <span className="text-lg font-bold text-foreground">{formatCurrency(income)}</span>
          </div>
          <Slider
            min={0}
            max={500000}
            step={1000}
            value={[income]}
            onValueChange={([v]) => setIncome(v)}
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Tax</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground">Effective Rate</p>
              <p className="text-lg font-medium text-primary">{formatPct(effectiveRate)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground">Marginal Rate</p>
              <p className="text-lg font-medium text-orange-400">{formatPct(marginal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staircase SVG chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tax Bracket Waterfall Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full max-w-2xl" style={{ height: 200 }}>
              {bars.map((b, i) => (
                <g key={i}>
                  <rect
                    x={b.x1}
                    y={chartH - b.barH}
                    width={Math.max(0, b.x2 - b.x1 - 1)}
                    height={b.barH}
                    fill={b.color}
                    opacity={income > b.min ? 1 : 0.25}
                    rx={2}
                  />
                  <text
                    x={(b.x1 + b.x2) / 2}
                    y={chartH - b.barH - 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill={income > b.min ? b.color : "#6b7280"}
                  >
                    {b.label}
                  </text>
                </g>
              ))}
              {/* Income marker */}
              <line x1={markerX} y1={0} x2={markerX} y2={chartH} stroke="#a855f7" strokeWidth={2} strokeDasharray="4,3" />
              <text x={markerX + 4} y={14} fontSize={9} fill="#a855f7">Your income</text>
              {/* X axis labels */}
              {[0, 50000, 100000, 150000, 200000, 250000].map((v, i) => (
                <text key={i} x={(v / totalRange) * chartW} y={chartH + 16} fontSize={8} fill="#6b7280" textAnchor="middle">
                  {v === 0 ? "$0" : `$${v / 1000}k`}
                </text>
              ))}
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
              <p className="text-xs font-semibold text-orange-400">Marginal Rate: {formatPct(marginal)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Rate applied to your last dollar. Applies to your next raise or bonus.
              </p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
              <p className="text-xs font-semibold text-primary">Effective Rate: {formatPct(effectiveRate)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total tax ÷ total income. Always lower than marginal rate due to progressive brackets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bracket breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bracket-by-Bracket Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {breakdown.map((row, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2 bg-muted/20">
                <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: BRACKET_COLORS[i] }} />
                <span className="text-xs text-muted-foreground w-16 shrink-0">{row.bracket.label} bracket</span>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: income > 0 ? `${(row.taxed / income) * 100}%` : "0%",
                        backgroundColor: BRACKET_COLORS[i],
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
                  {formatCurrency(row.taxed)} taxed
                </span>
                <span className="text-xs text-muted-foreground font-semibold w-20 text-right shrink-0">
                  = {formatCurrency(row.tax)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-border px-3">
              <span className="text-sm font-medium">Total Federal Tax</span>
              <span className="text-sm font-medium text-destructive">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capital gains rates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Long-Term Capital Gains Rates (2024, Single)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {CAPITAL_GAINS_BRACKETS.map((b, i) => {
              const active =
                income <= b.max && (i === 0 || income > CAPITAL_GAINS_BRACKETS[i - 1].max);
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 opacity-60"
                  }`}
                >
                  <p className="text-2xl font-bold text-foreground">{b.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {b.max === Infinity
                      ? `Income > $${(CAPITAL_GAINS_BRACKETS[i - 1]?.max / 1000).toFixed(0)}k`
                      : `Income $0 – $${(b.max / 1000).toFixed(0)}k`}
                  </p>
                  {active && (
                    <Badge className="mt-2 text-[11px]" variant="default">Your Rate</Badge>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
            At {formatCurrency(income)} income your LT cap gains rate is{" "}
            <strong className="text-foreground">{formatPct(cgRate)}</strong>. Short-term gains taxed as ordinary income
            ({formatPct(marginal)} marginal).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Tax-Loss Harvesting ────────────────────────────────────────────────

function TaxLossHarvestingTab() {
  const [positions, setPositions] = useState(INITIAL_POSITIONS.map((p) => ({ ...p })));
  const [washSaleDay, setWashSaleDay] = useState(15);
  const [taxRate, setTaxRate] = useState(0.15);

  const togglePosition = (id: number) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const stats = useMemo(() => {
    const gains = positions.filter((p) => p.currentPrice > p.costBasis);
    const losses = positions.filter((p) => p.currentPrice < p.costBasis);
    const totalGains = gains.reduce((s, p) => s + (p.currentPrice - p.costBasis) * p.shares, 0);
    const totalLosses = losses.reduce((s, p) => s + (p.currentPrice - p.costBasis) * p.shares, 0);
    const selectedLosses = positions
      .filter((p) => p.selected && p.currentPrice < p.costBasis)
      .reduce((s, p) => s + (p.currentPrice - p.costBasis) * p.shares, 0);
    const netGain = totalGains + selectedLosses;
    const taxSavings = Math.abs(selectedLosses) * taxRate;
    return { totalGains, totalLosses, selectedLosses, netGain, taxSavings };
  }, [positions, taxRate]);

  const lossPositions = positions.filter((p) => p.currentPrice < p.costBasis);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Realized Gains</p>
            <p className="text-lg font-medium text-green-400">{formatCurrency(stats.totalGains)}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/30">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Selected Losses</p>
            <p className="text-lg font-medium text-red-400">{formatCurrency(stats.selectedLosses)}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/40">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Net Taxable Gain</p>
            <p className={`text-lg font-medium ${stats.netGain > 0 ? "text-orange-400" : "text-green-400"}`}>
              {formatCurrency(stats.netGain)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Tax Savings</p>
            <p className="text-lg font-medium text-primary">{formatCurrency(stats.taxSavings)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax rate selector */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Capital Gains Tax Rate</span>
            <span className="text-sm font-medium">{formatPct(taxRate)}</span>
          </div>
          <Slider min={0} max={0.37} step={0.01} value={[taxRate]} onValueChange={([v]) => setTaxRate(v)} />
          <p className="text-xs text-muted-foreground font-mono bg-muted/30 rounded px-2 py-1.5">
            Tax savings = Harvested Losses × Rate = {formatCurrency(Math.abs(stats.selectedLosses))} × {formatPct(taxRate)} ={" "}
            <strong className="text-foreground">{formatCurrency(stats.taxSavings)}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Portfolio positions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Portfolio Positions — Click Losers to Harvest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {positions.map((p) => {
              const pnl = (p.currentPrice - p.costBasis) * p.shares;
              const pnlPct = (p.currentPrice - p.costBasis) / p.costBasis;
              const isLoss = pnl < 0;

              return (
                <motion.div
                  key={p.id}
                  layout
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    isLoss
                      ? p.selected
                        ? "border-primary bg-primary/10"
                        : "border-red-500/30 bg-red-500/5 hover:border-red-500/60"
                      : "border-green-500/20 bg-green-500/5 cursor-default"
                  }`}
                  onClick={() => isLoss && togglePosition(p.id)}
                >
                  <div
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      isLoss
                        ? p.selected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                        : "border-green-500/30"
                    }`}
                  >
                    {(p.selected || !isLoss) && <CheckCircle2 className="h-3 w-3 text-foreground" />}
                  </div>
                  <span className="font-mono text-sm font-medium w-12 shrink-0">{p.ticker}</span>
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{p.shares} shares</span>
                  <span className="text-xs text-muted-foreground w-24 shrink-0">
                    Cost: {formatCurrency(p.costBasis)}
                  </span>
                  <span className="text-xs text-muted-foreground w-24 shrink-0">
                    Now: {formatCurrency(p.currentPrice)}
                  </span>
                  <span className={`text-sm font-medium ml-auto ${isLoss ? "text-red-400" : "text-green-400"}`}>
                    {isLoss ? "" : "+"}{formatCurrency(pnl)}
                  </span>
                  <Badge
                    variant={isLoss ? "destructive" : "default"}
                    className={`text-[11px] shrink-0 ${!isLoss ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}`}
                  >
                    {isLoss ? "" : "+"}{formatPct(pnlPct)}
                  </Badge>
                </motion.div>
              );
            })}
          </div>

          {/* Replacement suggestions */}
          {lossPositions.some((p) => p.selected) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4"
            >
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Repeat className="h-3.5 w-3.5 text-muted-foreground/50" />
                Replacement Suggestions (Similar ETFs — Avoid Wash Sale)
              </p>
              <div className="space-y-1.5">
                {lossPositions
                  .filter((p) => p.selected && WASH_SALE_ALTERNATIVES[p.ticker])
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono font-medium w-12">{p.ticker}</span>
                      <span className="text-muted-foreground">replace with</span>
                      {WASH_SALE_ALTERNATIVES[p.ticker].map((alt) => (
                        <Badge key={alt} variant="outline" className="text-[11px]">{alt}</Badge>
                      ))}
                    </div>
                  ))}
                {lossPositions
                  .filter((p) => p.selected && !WASH_SALE_ALTERNATIVES[p.ticker])
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className="font-mono font-medium w-12">{p.ticker}</span>
                      <span>— wait 31 days before repurchasing same security</span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Wash sale rule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Wash Sale Rule — 30-Day Window Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            IRS disallows the loss if you buy the <strong className="text-foreground">same or substantially identical</strong> security within 30 days before or after the sale.
          </p>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Days after selling before repurchase</span>
            <span className="font-medium">{washSaleDay} days</span>
          </div>
          <Slider min={1} max={60} step={1} value={[washSaleDay]} onValueChange={([v]) => setWashSaleDay(v)} />

          <svg viewBox="0 0 480 64" className="w-full" style={{ height: 64 }}>
            <line x1={40} y1={32} x2={440} y2={32} stroke="#374151" strokeWidth={2} />
            {/* 30-day wash window shaded area */}
            <rect x={160} y={20} width={120} height={24} fill="#ef4444" opacity={0.15} rx={2} />
            <text x={220} y={14} textAnchor="middle" fontSize={8} fill="#ef4444">30-day wash window</text>
            {/* Sale marker */}
            <circle cx={160} cy={32} r={8} fill="#ef4444" />
            <text x={160} y={56} textAnchor="middle" fontSize={9} fill="#ef4444">Sell (Day 0)</text>
            {/* Day 31 safe marker */}
            <circle cx={280} cy={32} r={4} fill="#6b7280" />
            <text x={280} y={56} textAnchor="middle" fontSize={8} fill="#6b7280">Day 31</text>
            {/* Repurchase marker */}
            <circle
              cx={160 + 240 * (washSaleDay / 60)}
              cy={32}
              r={7}
              fill={washSaleDay < 31 ? "#ef4444" : "#22c55e"}
            />
            <text
              x={160 + 240 * (washSaleDay / 60)}
              y={56}
              textAnchor="middle"
              fontSize={9}
              fill={washSaleDay < 31 ? "#ef4444" : "#22c55e"}
            >
              {washSaleDay < 31 ? "Wash Sale!" : "Safe Buy"}
            </text>
          </svg>

          <div
            className={`rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2 ${
              washSaleDay < 31
                ? "bg-red-500/5 border border-red-500/30"
                : "bg-green-500/10 border border-green-500/30"
            }`}
          >
            {washSaleDay < 31 ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-red-300">
                  Day {washSaleDay} triggers the wash sale rule. The loss is disallowed and added to the replacement's cost basis. Wait until day 31.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-green-300">
                  Day {washSaleDay} is safe. You can repurchase the same security and claim the loss deduction.
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Account Type Optimizer ─────────────────────────────────────────────

const ASSET_LOCATION = [
  {
    account: "Taxable Brokerage",
    color: "#6366f1",
    ideal: ["Municipal Bonds (federal tax-exempt)", "Broad Index ETFs", "Tax-Managed Funds", "Long-Term Growth Stocks"],
    avoid: ["REITs (high ordinary dividends)", "High-Yield Bonds", "Actively Managed Funds"],
    reason: "Place tax-efficient assets here. Muni bonds are already federal tax-exempt; index ETFs have low turnover and qualified dividends.",
  },
  {
    account: "Traditional IRA / 401k",
    color: "#f97316",
    ideal: ["REITs", "Bonds & Bond Funds", "High-Yield Funds", "Dividend-Heavy Stocks"],
    avoid: ["Municipal Bonds (wasted tax benefit)", "Tax-Managed Funds"],
    reason: "Pre-tax contributions compound tax-deferred. High-income-generating assets shine here — tax is deferred until withdrawal.",
  },
  {
    account: "Roth IRA / 401k",
    color: "#22c55e",
    ideal: ["Small-Cap Growth Stocks", "International Equities", "Individual High-Growth Stocks", "Speculative Assets"],
    avoid: ["Low-growth stable assets", "Bonds (wasting tax-free potential)"],
    reason: "Tax-free growth forever. Your highest-expected-return assets belong here to maximize the tax-free compounding benefit.",
  },
];

function AccountOptimizerTab() {
  const [traditionalBalance, setTraditionalBalance] = useState(150000);
  const [currentIncome, setCurrentIncome] = useState(85000);
  const [conversionAmount, setConversionAmount] = useState(20000);
  const [taxableBalance, setTaxableBalance] = useState(50000);
  const [dividendYield, setDividendYield] = useState(0.03);

  const { total: taxBefore } = useMemo(() => computeTax(currentIncome), [currentIncome]);
  const { total: taxAfterConversion } = useMemo(
    () => computeTax(currentIncome + conversionAmount),
    [currentIncome, conversionAmount]
  );
  const conversionTaxCost = taxAfterConversion - taxBefore;
  const conversionEffectiveRate = conversionAmount > 0 ? conversionTaxCost / conversionAmount : 0;

  const cgRate = capitalGainsRate(currentIncome);
  const annualTaxDrag = taxableBalance * dividendYield * cgRate;

  // 20-year projections (7% growth)
  const YEARS = 20;
  const GROWTH = 0.07;
  const traditionalFinal = traditionalBalance * Math.pow(1 + GROWTH, YEARS);
  // withdrawal rate assumed, tax at current ordinary rate approximation
  const withdrawalTaxRate = marginalRate(currentIncome + traditionalFinal * 0.04);
  const traditionalAfterTax = traditionalFinal * (1 - withdrawalTaxRate);
  // Roth: invest after-tax amount = balance - conversion tax, grows tax free
  const rothStarting = traditionalBalance - conversionTaxCost;
  const rothFinal = rothStarting > 0 ? rothStarting * Math.pow(1 + GROWTH, YEARS) : 0;

  return (
    <div className="space-y-4">
      {/* Asset location grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Asset Location Strategy — What Goes Where</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ASSET_LOCATION.map((acct) => (
              <div key={acct.account} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: acct.color }} />
                  <span className="text-sm font-medium">{acct.account}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Best Fit</p>
                  <div className="space-y-1">
                    {acct.ideal.map((a) => (
                      <div key={a} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Avoid</p>
                  <div className="space-y-1">
                    {acct.avoid.map((a) => (
                      <div key={a} className="flex items-start gap-1.5 text-xs text-muted-foreground/70">
                        <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground border-t border-border pt-2 leading-relaxed">
                  {acct.reason}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax drag calculator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-red-400" />
            Taxable Account Tax Drag Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Balance</span>
                <span className="font-medium">{formatCurrency(taxableBalance)}</span>
              </div>
              <Slider min={10000} max={500000} step={5000} value={[taxableBalance]} onValueChange={([v]) => setTaxableBalance(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Annual Dividend Yield</span>
                <span className="font-medium">{formatPct(dividendYield)}</span>
              </div>
              <Slider min={0.005} max={0.08} step={0.005} value={[dividendYield]} onValueChange={([v]) => setDividendYield(v)} />
            </div>
          </div>
          <div className="rounded-lg bg-red-500/5 border border-red-500/30 p-4 space-y-2">
            <p className="text-xs text-muted-foreground">Annual Tax Drag Formula</p>
            <p className="font-mono text-sm">
              {formatCurrency(taxableBalance)} × {formatPct(dividendYield)} × {formatPct(cgRate)}{" "}
              = <strong className="text-red-400">{formatCurrency(annualTaxDrag)}/yr</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Over 20 years (7% growth), this drag costs approximately{" "}
              <strong className="text-foreground">{formatCurrency(annualTaxDrag * 20 * 1.8)}</strong> in lost compounding.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Roth conversion analyzer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Repeat className="h-3.5 w-3.5 text-muted-foreground/50" />
            Roth Conversion Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Traditional IRA Balance</span>
                <span className="font-medium">{formatCurrency(traditionalBalance)}</span>
              </div>
              <Slider min={10000} max={1000000} step={5000} value={[traditionalBalance]} onValueChange={([v]) => setTraditionalBalance(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Income</span>
                <span className="font-medium">{formatCurrency(currentIncome)}</span>
              </div>
              <Slider min={20000} max={400000} step={5000} value={[currentIncome]} onValueChange={([v]) => setCurrentIncome(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversion Amount</span>
                <span className="font-medium">{formatCurrency(conversionAmount)}</span>
              </div>
              <Slider
                min={1000}
                max={Math.max(1000, Math.min(traditionalBalance, 100000))}
                step={1000}
                value={[Math.min(conversionAmount, traditionalBalance)]}
                onValueChange={([v]) => setConversionAmount(v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Conversion Tax Cost</p>
              <p className="text-lg font-medium text-red-400">{formatCurrency(conversionTaxCost)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {formatPct(conversionEffectiveRate)} effective rate on conversion
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-center">
              <p className="text-xs text-muted-foreground">Traditional (20yr)</p>
              <p className="text-lg font-medium text-orange-400">{formatCurrency(traditionalAfterTax)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">After est. withdrawal taxes</p>
            </div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
              <p className="text-xs text-muted-foreground">Roth (20yr)</p>
              <p className="text-lg font-medium text-green-400">{formatCurrency(rothFinal)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">100% tax-free growth</p>
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs text-muted-foreground">
            <strong className="text-primary">Rule of thumb:</strong>{" "}
            <span className="text-muted-foreground">
              Convert when current tax rate &lt; expected retirement rate. Best in low-income years: career transitions, sabbaticals, early retirement before Social Security begins.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Capital Gains Planner ──────────────────────────────────────────────

interface CGPosition {
  id: number;
  ticker: string;
  purchaseDate: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
}

const CG_POSITIONS: CGPosition[] = [
  { id: 1, ticker: "AAPL",  purchaseDate: "2023-06-15", shares: 50,  costBasis: 185.00, currentPrice: 189.50 },
  { id: 2, ticker: "NVDA",  purchaseDate: "2024-01-10", shares: 30,  costBasis: 495.00, currentPrice: 495.80 },
  { id: 3, ticker: "GOOGL", purchaseDate: "2023-02-20", shares: 10,  costBasis: 88.00,  currentPrice: 175.40 },
  { id: 4, ticker: "MSFT",  purchaseDate: "2024-08-01", shares: 20,  costBasis: 415.00, currentPrice: 420.00 },
  { id: 5, ticker: "TSLA",  purchaseDate: "2023-11-05", shares: 40,  costBasis: 230.00, currentPrice: 175.00 },
];

function holdingDays(purchaseDate: string): number {
  const purchase = new Date(purchaseDate);
  const now = new Date("2026-03-27");
  return Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
}

function CapitalGainsPlannerTab() {
  const [income, setIncome] = useState(95000);

  const stRate = useMemo(() => marginalRate(income), [income]);
  const ltRate = useMemo(() => capitalGainsRate(income), [income]);

  const positions = useMemo(
    () =>
      CG_POSITIONS.map((p) => {
        const days = holdingDays(p.purchaseDate);
        const isLT = days >= 365;
        const pnl = (p.currentPrice - p.costBasis) * p.shares;
        const taxST = pnl > 0 ? pnl * stRate : 0;
        const taxLT = pnl > 0 ? pnl * ltRate : 0;
        const savings = taxST - taxLT;
        return { ...p, days, isLT, pnl, taxST, taxLT, savings };
      }),
    [stRate, ltRate]
  );

  const totalBill = positions.reduce((s, p) => s + (p.isLT ? p.taxLT : p.taxST), 0);
  const ifAllST = positions.reduce((s, p) => s + (p.pnl > 0 ? p.pnl * stRate : 0), 0);
  const ltSavings = ifAllST - totalBill;

  return (
    <div className="space-y-4">
      {/* Income input */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Ordinary Income</span>
            <div className="flex gap-4">
              <span className="text-xs text-muted-foreground">
                ST Rate: <strong className="text-orange-400">{formatPct(stRate)}</strong>
              </span>
              <span className="text-xs text-muted-foreground">
                LT Rate: <strong className="text-green-400">{formatPct(ltRate)}</strong>
              </span>
            </div>
          </div>
          <Slider min={20000} max={400000} step={5000} value={[income]} onValueChange={([v]) => setIncome(v)} />
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">{formatCurrency(income)}</span>
            <span className="text-green-400 text-xs">
              LT vs ST savings on this portfolio: <strong>{formatCurrency(ltSavings)}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Positions table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Holding Period Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs text-muted-foreground min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  {["Ticker", "Purchase Date", "Days Held", "Gain / Loss", "Type", "Tax Owed", "LT Savings"].map((h) => (
                    <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="py-2.5 px-2 font-mono font-medium">{p.ticker}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{p.purchaseDate}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5">
                        {p.days}d
                        {!p.isLT && p.pnl > 0 && (
                          <span className="text-amber-400 text-[11px]">({365 - p.days}d to LT)</span>
                        )}
                      </div>
                    </td>
                    <td className={`py-2.5 px-2 font-medium ${p.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {p.pnl >= 0 ? "+" : ""}{formatCurrency(p.pnl)}
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${p.isLT ? "border-green-500/40 text-green-400" : "border-orange-500/40 text-orange-400"}`}
                      >
                        {p.isLT ? "Long-Term" : "Short-Term"}
                      </Badge>
                    </td>
                    <td className={`py-2.5 px-2 font-medium ${p.pnl < 0 ? "text-muted-foreground" : p.isLT ? "text-green-400" : "text-orange-400"}`}>
                      {p.pnl < 0 ? "—" : formatCurrency(p.isLT ? p.taxLT : p.taxST)}
                    </td>
                    <td className="py-2.5 px-2 text-green-400 font-medium">
                      {!p.isLT && p.pnl > 0 ? formatCurrency(p.savings) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/10">
                  <td colSpan={5} className="py-2.5 px-2 font-medium text-sm">
                    Estimated Year-End Tax Bill
                  </td>
                  <td className="py-2.5 px-2 font-medium text-destructive">{formatCurrency(totalBill)}</td>
                  <td className="py-2.5 px-2 font-medium text-green-400">{formatCurrency(ltSavings)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Qualified dividends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Qualified vs Ordinary Dividends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Qualified Dividends</span>
              </div>
              <p className="text-xs text-muted-foreground">
                US corporations or qualifying foreign companies; held 61+ days around ex-dividend date.
              </p>
              <div className="rounded bg-green-500/20 px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">Tax rate</p>
                <p className="text-lg font-medium text-green-400">{formatPct(ltRate)}</p>
                <p className="text-xs text-muted-foreground">Same as long-term capital gains</p>
              </div>
            </div>
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Ordinary Dividends</span>
              </div>
              <p className="text-xs text-muted-foreground">
                REITs, MLPs, money market funds, dividends from stocks held under 60 days.
              </p>
              <div className="rounded bg-orange-500/20 px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">Tax rate</p>
                <p className="text-lg font-medium text-orange-400">{formatPct(stRate)}</p>
                <p className="text-xs text-muted-foreground">Same as ordinary income</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
            At your income, qualified dividends save{" "}
            <strong className="text-foreground">{formatPct(stRate - ltRate)}</strong> per dollar vs ordinary dividends.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: Estate & Gift Planning ─────────────────────────────────────────────

function EstateGiftTab() {
  const [estateValue, setEstateValue] = useState(5000000);
  const [recipientCount, setRecipientCount] = useState(3);
  const [assetBasis, setAssetBasis] = useState(200000);
  const [assetFMV, setAssetFMV] = useState(800000);
  const [charitableAmount, setCharitableAmount] = useState(10000);
  const income = 120000;

  const GIFT_EXCLUSION = 18000;
  const ESTATE_EXEMPTION = 13610000;
  const ESTATE_TAX_RATE = 0.40;

  const totalAnnualGifts = recipientCount * GIFT_EXCLUSION;
  const taxableEstate = Math.max(0, estateValue - ESTATE_EXEMPTION);
  const estateTax = taxableEstate * ESTATE_TAX_RATE;
  const stepUpGain = assetFMV - assetBasis;
  const cgRate = capitalGainsRate(income);
  const stepUpSaving = stepUpGain * cgRate;

  const stRate = marginalRate(income);
  const dafDeduction = Math.min(charitableAmount, income * 0.60);
  const dafTaxSaving = dafDeduction * stRate;

  const milestones = [
    { year: "Now",    label: "Annual Gifting",     desc: `$${GIFT_EXCLUSION.toLocaleString()}/recipient`, color: "#6366f1" },
    { year: "5–10yr", label: "Irrevoc. Trust",     desc: "Remove assets from estate",                   color: "#f97316" },
    { year: "65+",   label: "QCD from IRA",        desc: "Up to $105k/yr tax-free",                     color: "#22c55e" },
    { year: "70+",   label: "RMD Planning",        desc: "Required Minimum Distributions",              color: "#a855f7" },
    { year: "Estate", label: "Step-Up in Basis",   desc: "Heirs receive FMV basis",                     color: "#ec4899" },
  ];

  return (
    <div className="space-y-4">
      {/* Key 2024 numbers */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Gift className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">Annual Gift Exclusion</p>
            </div>
            <p className="text-xl font-medium text-primary">$18,000</p>
            <p className="text-xs text-muted-foreground">Per recipient, 2024</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/40">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Estate Tax Exemption</p>
            </div>
            <p className="text-xl font-medium text-foreground">$13.61M</p>
            <p className="text-xs text-muted-foreground">Federal 2024 (sunsets 2026)</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <p className="text-xs text-muted-foreground">Estate Tax Rate</p>
            </div>
            <p className="text-xl font-medium text-red-400">40%</p>
            <p className="text-xs text-muted-foreground">On taxable estate amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Gift tax strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-3.5 w-3.5 text-muted-foreground/50" />
            Annual Gift Tax Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of Recipients</span>
              <span className="font-medium">{recipientCount}</span>
            </div>
            <Slider min={1} max={20} step={1} value={[recipientCount]} onValueChange={([v]) => setRecipientCount(v)} />
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax-free gifts this year</span>
              <span className="font-medium text-primary">{formatCurrency(totalAnnualGifts)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-muted-foreground">10-year cumulative</span>
              <span className="font-medium">{formatCurrency(totalAnnualGifts * 10)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-muted-foreground">Estate tax saved (10yr @ 40%)</span>
              <span className="font-medium text-green-400">
                {formatCurrency(totalAnnualGifts * 10 * ESTATE_TAX_RATE)}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
            Married couples can gift <strong className="text-foreground">$36,000/recipient</strong> via gift-splitting.
            No gift tax return (Form 709) required below the annual exclusion.
          </p>
        </CardContent>
      </Card>

      {/* Estate tax calculator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Estate Tax Estimator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Estate Value</span>
              <span className="font-medium">{formatCurrency(estateValue)}</span>
            </div>
            <Slider min={500000} max={50000000} step={100000} value={[estateValue]} onValueChange={([v]) => setEstateValue(v)} />
          </div>

          {/* SVG bar chart */}
          <svg viewBox="0 0 480 48" className="w-full" style={{ height: 48 }}>
            <rect x={0} y={12} width={480} height={24} rx={4} fill="#1f2937" />
            <rect
              x={0}
              y={12}
              width={Math.min(480, (ESTATE_EXEMPTION / Math.max(estateValue, ESTATE_EXEMPTION)) * 480)}
              height={24}
              rx={4}
              fill="#6366f1"
              opacity={0.8}
            />
            {estateValue > ESTATE_EXEMPTION && (
              <rect
                x={(ESTATE_EXEMPTION / estateValue) * 480}
                y={12}
                width={480 - (ESTATE_EXEMPTION / estateValue) * 480}
                height={24}
                fill="#ef4444"
                opacity={0.7}
              />
            )}
            <text x={8} y={28} fontSize={9} fill="white">
              Exempt: {formatCurrency(Math.min(estateValue, ESTATE_EXEMPTION))}
            </text>
            {estateValue > ESTATE_EXEMPTION && (
              <text x={472} y={28} textAnchor="end" fontSize={9} fill="white">
                Taxable: {formatCurrency(taxableEstate)}
              </text>
            )}
          </svg>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Exemption Used</p>
              <p className="text-sm font-medium text-indigo-400">
                {formatCurrency(Math.min(estateValue, ESTATE_EXEMPTION))}
              </p>
            </div>
            <div className={`rounded-lg p-3 text-center ${taxableEstate > 0 ? "bg-red-500/5" : "bg-muted/30"}`}>
              <p className="text-xs text-muted-foreground">Taxable Estate</p>
              <p className={`text-sm font-medium ${taxableEstate > 0 ? "text-red-400" : "text-green-400"}`}>
                {formatCurrency(taxableEstate)}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 text-center ${estateTax > 0 ? "bg-red-500/5 border border-red-500/30" : "bg-green-500/10"}`}
            >
              <p className="text-xs text-muted-foreground">Estate Tax (40%)</p>
              <p className={`text-sm font-medium ${estateTax > 0 ? "text-red-400" : "text-green-400"}`}>
                {estateTax > 0 ? formatCurrency(estateTax) : "None"}
              </p>
            </div>
          </div>

          {estateValue > ESTATE_EXEMPTION * 0.75 && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Your estate is approaching or exceeding the 2024 exemption. The TCJA provisions sunset after 2025, potentially halving the exemption to ~$7M. Consider irrevocable trust or accelerated gifting strategy.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step-up in basis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Step-Up in Basis — The Hidden Inheritance Benefit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When you inherit an asset, your cost basis "steps up" to the fair market value at the date of death — eliminating the embedded capital gain entirely.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Cost Basis</span>
                <span className="font-medium">{formatCurrency(assetBasis)}</span>
              </div>
              <Slider min={10000} max={500000} step={5000} value={[assetBasis]} onValueChange={([v]) => setAssetBasis(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fair Market Value (Now)</span>
                <span className="font-medium">{formatCurrency(assetFMV)}</span>
              </div>
              <Slider
                min={Math.max(assetBasis, 10000)}
                max={5000000}
                step={10000}
                value={[Math.max(assetFMV, assetBasis)]}
                onValueChange={([v]) => setAssetFMV(v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-red-500/5 border border-red-500/30 p-4">
              <p className="text-xs font-medium text-red-400 mb-2">Without Step-Up (You Sell Now)</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Embedded gain</span>
                  <span>{formatCurrency(stepUpGain)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capital gains tax</span>
                  <span className="text-red-400">{formatCurrency(stepUpSaving)}</span>
                </div>
                <div className="flex justify-between font-medium border-t border-red-500/30 pt-1 mt-1">
                  <span>Net proceeds</span>
                  <span>{formatCurrency(assetFMV - stepUpSaving)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
              <p className="text-xs font-medium text-green-400 mb-2">With Step-Up (Inherited)</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New basis (FMV at death)</span>
                  <span>{formatCurrency(assetFMV)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capital gains tax</span>
                  <span className="text-green-400">$0</span>
                </div>
                <div className="flex justify-between font-medium border-t border-green-500/30 pt-1 mt-1">
                  <span>Net proceeds</span>
                  <span className="text-green-400">{formatCurrency(assetFMV)}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-primary">
            Step-up saves: {formatCurrency(stepUpSaving)} in capital gains tax
          </p>
        </CardContent>
      </Card>

      {/* Charitable strategies */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-pink-400" />
            Charitable Giving Strategies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Charitable Contribution</span>
              <span className="font-medium">{formatCurrency(charitableAmount)}</span>
            </div>
            <Slider min={500} max={50000} step={500} value={[charitableAmount]} onValueChange={([v]) => setCharitableAmount(v)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-3">
              <p className="text-xs font-medium text-primary">Donor Advised Fund (DAF)</p>
              <p className="text-xs text-muted-foreground">
                Contribute now, invest tax-free, grant to charities at any time. Immediate deduction up to 60% of AGI.
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deductible amount</span>
                  <span>{formatCurrency(dafDeduction)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Tax saving</span>
                  <span className="text-primary">{formatCurrency(dafTaxSaving)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground border-t border-border pt-2">
                Power move: contribute appreciated stock to avoid capital gains AND get the full deduction.
              </p>
            </div>

            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-3">
              <p className="text-xs font-medium text-green-400">Qualified Charitable Distribution (QCD)</p>
              <p className="text-xs text-muted-foreground">
                Age 70.5+: Transfer up to $105,000/yr from IRA directly to charity. Counts as RMD and excluded from income.
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2024 max QCD</span>
                  <span>$105,000</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Income excluded</span>
                  <span className="text-green-400">{formatCurrency(Math.min(charitableAmount, 105000))}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground border-t border-border pt-2">
                Unlike regular deductions, QCDs benefit you even if you take the standard deduction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estate planning timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estate Planning Milestones Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 540 90" className="w-full" style={{ height: 90 }}>
            <line x1={40} y1={50} x2={500} y2={50} stroke="#374151" strokeWidth={2} />
            {milestones.map((m, i) => {
              const x = 40 + (i / (milestones.length - 1)) * 460;
              const above = i % 2 === 0;
              return (
                <g key={i}>
                  <circle cx={x} cy={50} r={7} fill={m.color} />
                  {above ? (
                    <>
                      <text x={x} y={36} textAnchor="middle" fontSize={7.5} fill={m.color} fontWeight="bold">{m.year}</text>
                      <text x={x} y={26} textAnchor="middle" fontSize={7} fill="#9ca3af">{m.label}</text>
                    </>
                  ) : (
                    <>
                      <text x={x} y={66} textAnchor="middle" fontSize={7.5} fill={m.color} fontWeight="bold">{m.year}</text>
                      <text x={x} y={76} textAnchor="middle" fontSize={7} fill="#9ca3af">{m.label}</text>
                    </>
                  )}
                  <text x={x} y={above ? 15 : 87} textAnchor="middle" fontSize={6} fill="#6b7280">{m.desc}</text>
                </g>
              );
            })}
          </svg>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground">Core Estate Documents</p>
              {[
                ["Will & Living Trust", "Directs asset distribution, avoids probate"],
                ["Durable Power of Attorney", "Financial decisions if incapacitated"],
                ["Healthcare Directive / Living Will", "Medical decisions and end-of-life wishes"],
                ["Beneficiary Designations", "Override wills for IRAs, 401k, life insurance"],
              ].map(([doc, desc]) => (
                <div key={doc} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">{doc}:</strong>{" "}
                    <span className="text-muted-foreground">{desc}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-amber-400 mb-1.5">2026 Exemption Sunset Warning</p>
              <p className="text-muted-foreground leading-relaxed">
                The Tax Cuts and Jobs Act (TCJA) estate tax provisions expire after 2025. The federal exemption may drop from $13.61M to approximately $7M per person. Estates between $7M–$13.61M should consult an estate attorney before December 31, 2025.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TaxPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      <div className="flex-1 p-4 md:p-4 space-y-4 max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">Tax Optimization & Planning</h1>
            <p className="text-sm text-muted-foreground mt-1">
              2024 US federal tax reference — brackets, capital gains, harvesting, and estate planning
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs text-muted-foreground">2024 Tax Year</Badge>
            <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Educational Only</span>
          </div>
        </motion.div>

        {/* Quick-glance stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
        >
          {[
            { icon: BarChart3,    label: "Tax Brackets",     value: "7",       sub: "Federal 2024",          color: "text-primary"    },
            { icon: TrendingDown, label: "LT Cap Gains Max", value: "20%",     sub: "vs 37% short-term",     color: "text-green-400"  },
            { icon: PiggyBank,    label: "401k Limit",       value: "$23,000", sub: "2024 contribution",     color: "text-indigo-400" },
            { icon: Gift,         label: "Gift Exclusion",   value: "$18,000", sub: "Per recipient 2024",    color: "text-pink-400"   },
            { icon: DollarSign,   label: "Estate Exemption", value: "$13.61M", sub: "Federal 2024",          color: "text-orange-400" },
          ].map((s, i) => (
            <Card key={i} className="bg-muted/30">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className={`text-lg font-medium ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 flex items-center gap-2"
        >
          <Info className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-amber-400">Educational simulator only.</strong> Tax law is complex and varies by situation. Consult a qualified CPA or tax advisor before making tax decisions.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Tabs defaultValue="overview">
            <TabsList className="flex h-auto flex-wrap gap-1 bg-muted/30 p-1 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="harvesting" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" />
                Tax-Loss Harvesting
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <PiggyBank className="h-3.5 w-3.5" />
                Account Optimizer
              </TabsTrigger>
              <TabsTrigger value="capgains" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Capital Gains
              </TabsTrigger>
              <TabsTrigger value="estate" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                Estate & Gifts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview"   className="mt-0"><TaxOverviewTab /></TabsContent>
            <TabsContent value="harvesting" className="mt-0"><TaxLossHarvestingTab /></TabsContent>
            <TabsContent value="accounts"   className="mt-0"><AccountOptimizerTab /></TabsContent>
            <TabsContent value="capgains"   className="mt-0"><CapitalGainsPlannerTab /></TabsContent>
            <TabsContent value="estate"     className="mt-0"><EstateGiftTab /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
