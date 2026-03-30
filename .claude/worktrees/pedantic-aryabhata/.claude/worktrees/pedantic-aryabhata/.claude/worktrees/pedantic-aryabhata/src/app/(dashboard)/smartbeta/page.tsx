"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Target,
  Shield,
  Zap,
  DollarSign,
  PieChart,
  Filter,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 762;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface FactorMetric {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  annualReturn: number;
  volatility: number;
  sharpe: number;
  maxDD: number;
  description: string;
}

interface ETFRow {
  ticker: string;
  name: string;
  factor: string;
  expenseRatio: number;
  aumB: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  color: string;
}

interface PortfolioHolding {
  ticker: string;
  weight: number;
}

// ── Static Data ────────────────────────────────────────────────────────────────
const FACTORS: FactorMetric[] = [
  {
    id: "value",
    name: "Value",
    color: "#f59e0b",
    icon: <DollarSign className="h-4 w-4" />,
    annualReturn: 4.2,
    volatility: 16.8,
    sharpe: 0.25,
    maxDD: -52.3,
    description: "Cheap stocks relative to fundamentals (P/B, P/E, P/CF)",
  },
  {
    id: "momentum",
    name: "Momentum",
    color: "#10b981",
    icon: <TrendingUp className="h-4 w-4" />,
    annualReturn: 7.8,
    volatility: 19.4,
    sharpe: 0.40,
    maxDD: -65.1,
    description: "Stocks with strong recent 12-month price performance",
  },
  {
    id: "quality",
    name: "Quality",
    color: "#6366f1",
    icon: <Shield className="h-4 w-4" />,
    annualReturn: 5.9,
    volatility: 14.2,
    sharpe: 0.42,
    maxDD: -38.7,
    description: "High ROE, stable earnings, low leverage companies",
  },
  {
    id: "lowvol",
    name: "Low Vol",
    color: "#8b5cf6",
    icon: <Activity className="h-4 w-4" />,
    annualReturn: 3.8,
    volatility: 11.6,
    sharpe: 0.33,
    maxDD: -30.2,
    description: "Stocks with below-average price volatility",
  },
  {
    id: "size",
    name: "Size",
    color: "#ec4899",
    icon: <Layers className="h-4 w-4" />,
    annualReturn: 3.2,
    volatility: 20.1,
    sharpe: 0.16,
    maxDD: -55.6,
    description: "Small cap premium — small stocks outperform large over time",
  },
  {
    id: "market",
    name: "Market (Cap-Wt)",
    color: "#64748b",
    icon: <PieChart className="h-4 w-4" />,
    annualReturn: 5.3,
    volatility: 15.0,
    sharpe: 0.35,
    maxDD: -50.9,
    description: "Traditional market-cap weighted index benchmark",
  },
];

const ETF_DATA: ETFRow[] = [
  { ticker: "VLUE", name: "iShares MSCI USA Value Factor ETF", factor: "Value", expenseRatio: 0.15, aumB: 6.8, ytdReturn: 2.4, oneYearReturn: 8.1, threeYearReturn: 4.7, color: "#f59e0b" },
  { ticker: "MTUM", name: "iShares MSCI USA Momentum Factor ETF", factor: "Momentum", expenseRatio: 0.15, aumB: 12.3, ytdReturn: 6.8, oneYearReturn: 22.4, threeYearReturn: 11.2, color: "#10b981" },
  { ticker: "QUAL", name: "iShares MSCI USA Quality Factor ETF", factor: "Quality", expenseRatio: 0.15, aumB: 29.1, ytdReturn: 4.2, oneYearReturn: 18.7, threeYearReturn: 12.8, color: "#6366f1" },
  { ticker: "USMV", name: "iShares MSCI USA Min Vol Factor ETF", factor: "Low Vol", expenseRatio: 0.15, aumB: 26.4, ytdReturn: 1.8, oneYearReturn: 11.3, threeYearReturn: 7.9, color: "#8b5cf6" },
  { ticker: "SIZE", name: "iShares MSCI USA Size Factor ETF", factor: "Size", expenseRatio: 0.15, aumB: 0.3, ytdReturn: 3.1, oneYearReturn: 14.2, threeYearReturn: 8.1, color: "#ec4899" },
  { ticker: "DFLV", name: "Dimensional US Large Value ETF", factor: "Value", expenseRatio: 0.22, aumB: 14.7, ytdReturn: 1.9, oneYearReturn: 7.3, threeYearReturn: 5.2, color: "#f59e0b" },
  { ticker: "AVUS", name: "Avantis US Equity ETF", factor: "Multi-Factor", expenseRatio: 0.15, aumB: 8.9, ytdReturn: 4.6, oneYearReturn: 17.8, threeYearReturn: 10.4, color: "#06b6d4" },
  { ticker: "QMOM", name: "Alpha Architect US Quantitative Momentum", factor: "Momentum", expenseRatio: 0.49, aumB: 1.4, ytdReturn: 8.2, oneYearReturn: 28.6, threeYearReturn: 13.7, color: "#10b981" },
  { ticker: "SPHQ", name: "Invesco S&P 500 Quality ETF", factor: "Quality", expenseRatio: 0.15, aumB: 6.2, ytdReturn: 3.9, oneYearReturn: 17.1, threeYearReturn: 11.9, color: "#6366f1" },
  { ticker: "SPLV", name: "Invesco S&P 500 Low Volatility ETF", factor: "Low Vol", expenseRatio: 0.25, aumB: 9.7, ytdReturn: 1.5, oneYearReturn: 10.8, threeYearReturn: 6.4, color: "#8b5cf6" },
];

// Factor leaders by year 2015-2024
const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const FACTOR_IDS = ["value", "momentum", "quality", "lowvol", "size", "market"];

// Synthetic factor performance grid (leader per year)
const CYCLE_LEADERS: Record<number, string> = {
  2015: "quality",
  2016: "value",
  2017: "momentum",
  2018: "lowvol",
  2019: "momentum",
  2020: "momentum",
  2021: "value",
  2022: "lowvol",
  2023: "momentum",
  2024: "quality",
};

// Generate factor return data for each year
function generateFactorYearReturns(): Record<string, Record<number, number>> {
  // Reset seed for deterministic data
  let localS = 762;
  const localRand = () => {
    localS = (localS * 1103515245 + 12345) & 0x7fffffff;
    return localS / 0x7fffffff;
  };

  const result: Record<string, Record<number, number>> = {};
  for (const fid of FACTOR_IDS) {
    result[fid] = {};
    for (const yr of YEARS) {
      const base = localRand() * 40 - 10; // -10 to +30
      // Leader gets a boost
      const boost = CYCLE_LEADERS[yr] === fid ? 8 + localRand() * 10 : 0;
      result[fid][yr] = Math.round((base + boost) * 10) / 10;
    }
  }
  return result;
}

const YEAR_RETURNS = generateFactorYearReturns();

// Cumulative returns (start 100 at 2014)
function buildCumulativeReturns(): Record<string, number[]> {
  const cum: Record<string, number[]> = {};
  for (const fid of FACTOR_IDS) {
    let val = 100;
    cum[fid] = [100];
    for (const yr of YEARS) {
      val = val * (1 + YEAR_RETURNS[fid][yr] / 100);
      cum[fid].push(Math.round(val * 10) / 10);
    }
  }
  return cum;
}

const CUMULATIVE = buildCumulativeReturns();

// Portfolio holdings for factor exposure
const DEFAULT_HOLDINGS: PortfolioHolding[] = [
  { ticker: "AAPL", weight: 20 },
  { ticker: "MSFT", weight: 18 },
  { ticker: "NVDA", weight: 15 },
  { ticker: "GOOGL", weight: 12 },
  { ticker: "BRK.B", weight: 10 },
  { ticker: "JPM", weight: 8 },
  { ticker: "JNJ", weight: 7 },
  { ticker: "UNH", weight: 5 },
  { ticker: "XOM", weight: 3 },
  { ticker: "PG", weight: 2 },
];

// Synthetic factor exposures for each ticker
const TICKER_EXPOSURES: Record<string, Record<string, number>> = {
  "AAPL":  { value: -0.3, momentum: 0.6, quality: 0.8, lowvol: 0.2, size: -0.9 },
  "MSFT":  { value: -0.4, momentum: 0.5, quality: 0.9, lowvol: 0.3, size: -0.95 },
  "NVDA":  { value: -0.8, momentum: 0.95, quality: 0.4, lowvol: -0.7, size: -0.7 },
  "GOOGL": { value: -0.2, momentum: 0.4, quality: 0.7, lowvol: 0.1, size: -0.85 },
  "BRK.B": { value: 0.7, momentum: 0.1, quality: 0.8, lowvol: 0.4, size: -0.6 },
  "JPM":   { value: 0.5, momentum: 0.2, quality: 0.5, lowvol: -0.2, size: -0.7 },
  "JNJ":   { value: 0.3, momentum: -0.1, quality: 0.7, lowvol: 0.7, size: -0.75 },
  "UNH":   { value: 0.1, momentum: 0.3, quality: 0.8, lowvol: 0.3, size: -0.65 },
  "XOM":   { value: 0.6, momentum: 0.0, quality: 0.3, lowvol: -0.1, size: -0.5 },
  "PG":    { value: 0.2, momentum: -0.2, quality: 0.6, lowvol: 0.8, size: -0.8 },
};

const FACTOR_DISPLAY_NAMES: Record<string, string> = {
  value: "Value",
  momentum: "Momentum",
  quality: "Quality",
  lowvol: "Low Vol",
  size: "Size",
};

// ── Helper Utilities ───────────────────────────────────────────────────────────
function getFactor(id: string): FactorMetric | undefined {
  return FACTORS.find((f) => f.id === id);
}

function getFactorColor(id: string): string {
  return getFactor(id)?.color ?? "#64748b";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

// Metric Card
function FactorCard({ factor, rank }: { factor: FactorMetric; rank: number }) {
  const isMarket = factor.id === "market";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
    >
      <Card className={cn("border-border", isMarket && "opacity-70")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ color: factor.color }}>{factor.icon}</span>
              <span className="font-semibold text-sm">{factor.name}</span>
            </div>
            {isMarket ? (
              <Badge variant="outline" className="text-xs text-muted-foreground">Benchmark</Badge>
            ) : (
              <Badge className="text-xs" style={{ backgroundColor: factor.color + "22", color: factor.color, border: `1px solid ${factor.color}44` }}>
                Premium
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{factor.description}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Ann. Return</p>
              <p className={cn("text-sm font-semibold", factor.annualReturn >= 5.3 ? "text-emerald-400" : "text-foreground")}>
                {factor.annualReturn > 0 ? "+" : ""}{factor.annualReturn}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sharpe</p>
              <p className="text-sm font-semibold">{factor.sharpe.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Volatility</p>
              <p className="text-sm font-medium">{factor.volatility}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Max DD</p>
              <p className="text-sm font-medium text-red-400">{factor.maxDD}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Cumulative Returns SVG Chart
function CumulativeReturnsChart() {
  const W = 700, H = 280;
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allVals = Object.values(CUMULATIVE).flat();
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.02;
  const xLabels = ["2014", ...YEARS.map(String)];

  const xScale = (i: number) => (i / (xLabels.length - 1)) * innerW;
  const yScale = (v: number) => innerH - ((v - minV) / (maxV - minV)) * innerH;

  // y-axis ticks
  const yTicks = [100, 150, 200, 250, 300, 350].filter(v => v >= minV && v <= maxV);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }}>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Grid lines */}
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={0} x2={innerW} y1={yScale(v)} y2={yScale(v)} stroke="#334155" strokeDasharray="3,3" strokeWidth={0.5} />
              <text x={-6} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize={10}>{v}</text>
            </g>
          ))}
          {/* X axis labels */}
          {xLabels.map((lbl, i) => (
            i % 2 === 0 ? (
              <text key={lbl} x={xScale(i)} y={innerH + 18} textAnchor="middle" fill="#64748b" fontSize={10}>{lbl}</text>
            ) : null
          ))}
          {/* Factor lines */}
          {FACTOR_IDS.map((fid) => {
            const vals = CUMULATIVE[fid];
            const pts = vals.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
            return (
              <polyline
                key={fid}
                points={pts}
                fill="none"
                stroke={getFactorColor(fid)}
                strokeWidth={fid === "market" ? 1.5 : 2.5}
                strokeDasharray={fid === "market" ? "6,4" : undefined}
                opacity={0.9}
              />
            );
          })}
          {/* Dots at end */}
          {FACTOR_IDS.map((fid) => {
            const vals = CUMULATIVE[fid];
            const lastV = vals[vals.length - 1];
            const xi = xScale(vals.length - 1);
            const yi = yScale(lastV);
            return (
              <g key={`dot-${fid}`}>
                <circle cx={xi} cy={yi} r={4} fill={getFactorColor(fid)} />
                <text x={xi + 6} y={yi + 4} fill={getFactorColor(fid)} fontSize={9} fontWeight="bold">{lastV.toFixed(0)}</text>
              </g>
            );
          })}
          {/* Y axis */}
          <line x1={0} x2={0} y1={0} y2={innerH} stroke="#334155" strokeWidth={1} />
          {/* X axis */}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#334155" strokeWidth={1} />
        </g>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-2">
        {FACTOR_IDS.map((fid) => {
          const f = getFactor(fid);
          return (
            <div key={fid} className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-0.5 rounded" style={{ backgroundColor: getFactorColor(fid), border: fid === "market" ? "none" : "none" }} />
              <span className="text-xs text-muted-foreground">{f?.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Factor Cycle Heatmap
function FactorCycleHeatmap() {
  const displayFactors = FACTOR_IDS.filter(f => f !== "market");

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-muted-foreground border-separate border-spacing-1" style={{ minWidth: 500 }}>
        <thead>
          <tr>
            <th className="text-left text-muted-foreground font-medium p-1 w-24">Factor</th>
            {YEARS.map((y) => (
              <th key={y} className="text-center text-muted-foreground font-medium p-1">{y}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayFactors.map((fid) => {
            const f = getFactor(fid);
            const returns = YEAR_RETURNS[fid];
            // Compute rank across factors for each year
            return (
              <tr key={fid}>
                <td className="p-1 font-semibold" style={{ color: getFactorColor(fid) }}>{f?.name}</td>
                {YEARS.map((yr) => {
                  const ret = returns[yr];
                  const isLeader = CYCLE_LEADERS[yr] === fid;
                  const bg = isLeader
                    ? getFactorColor(fid) + "55"
                    : ret > 15
                    ? "#10b98133"
                    : ret > 5
                    ? "#10b98111"
                    : ret > 0
                    ? "#1e293b"
                    : ret > -5
                    ? "#ef444422"
                    : "#ef444444";
                  return (
                    <td
                      key={yr}
                      className="text-center rounded p-1 font-mono font-medium"
                      style={{ backgroundColor: bg, color: ret >= 0 ? "#10b981" : "#ef4444", border: isLeader ? `1px solid ${getFactorColor(fid)}88` : "1px solid transparent" }}
                    >
                      {ret > 0 ? "+" : ""}{ret}%
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground mt-2">Highlighted cells = top-performing factor that year</p>
    </div>
  );
}

// ETF Comparison Table
function ETFComparisonTable() {
  const [sortKey, setSortKey] = useState<keyof ETFRow>("aumB");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...ETF_DATA].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortAsc ? av - bv : bv - av;
    });
  }, [sortKey, sortAsc]);

  const handleSort = (key: keyof ETFRow) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortBtn = ({ label, k }: { label: string; k: keyof ETFRow }) => (
    <button
      onClick={() => handleSort(k)}
      className={cn("text-xs font-medium", sortKey === k ? "text-primary" : "text-muted-foreground")}
    >
      {label} {sortKey === k ? (sortAsc ? "▲" : "▼") : ""}
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: 700 }}>
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 text-muted-foreground font-medium">Ticker</th>
            <th className="text-left p-2 text-muted-foreground font-medium">Name</th>
            <th className="text-left p-2"><SortBtn label="Factor" k="factor" /></th>
            <th className="text-right p-2"><SortBtn label="Expense" k="expenseRatio" /></th>
            <th className="text-right p-2"><SortBtn label="AUM ($B)" k="aumB" /></th>
            <th className="text-right p-2"><SortBtn label="YTD" k="ytdReturn" /></th>
            <th className="text-right p-2"><SortBtn label="1Y" k="oneYearReturn" /></th>
            <th className="text-right p-2"><SortBtn label="3Y Ann" k="threeYearReturn" /></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((etf, idx) => (
            <motion.tr
              key={etf.ticker}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="border-b border-border hover:bg-muted/30 transition-colors"
            >
              <td className="p-2 font-medium font-mono" style={{ color: etf.color }}>{etf.ticker}</td>
              <td className="p-2 text-xs text-muted-foreground max-w-[200px] truncate">{etf.name}</td>
              <td className="p-2">
                <Badge variant="outline" className="text-xs" style={{ color: etf.color, borderColor: etf.color + "66" }}>{etf.factor}</Badge>
              </td>
              <td className="p-2 text-right font-mono text-xs text-muted-foreground">{(etf.expenseRatio * 100).toFixed(2)}%</td>
              <td className="p-2 text-right font-mono">${etf.aumB.toFixed(1)}B</td>
              <td className={cn("p-2 text-right font-mono font-semibold", etf.ytdReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                {etf.ytdReturn > 0 ? "+" : ""}{etf.ytdReturn}%
              </td>
              <td className={cn("p-2 text-right font-mono font-medium", etf.oneYearReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                {etf.oneYearReturn > 0 ? "+" : ""}{etf.oneYearReturn}%
              </td>
              <td className={cn("p-2 text-right font-mono font-medium", etf.threeYearReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                {etf.threeYearReturn > 0 ? "+" : ""}{etf.threeYearReturn}%
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Factor Exposure Analyzer
function FactorExposureAnalyzer() {
  const [selectedHoldings] = useState<PortfolioHolding[]>(DEFAULT_HOLDINGS);
  const exposureFactors = ["value", "momentum", "quality", "lowvol", "size"];

  // Compute weighted portfolio exposure
  const portfolioExposure = useMemo(() => {
    const result: Record<string, number> = {};
    for (const fid of exposureFactors) {
      let wExp = 0;
      for (const h of selectedHoldings) {
        const exp = TICKER_EXPOSURES[h.ticker]?.[fid] ?? 0;
        wExp += (h.weight / 100) * exp;
      }
      result[fid] = Math.round(wExp * 100) / 100;
    }
    return result;
  }, [selectedHoldings]);

  const barW = 240;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Holdings list */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground/50" />
              Sample Portfolio Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedHoldings.map((h) => (
                <div key={h.ticker} className="flex items-center gap-3">
                  <span className="font-mono font-medium text-xs w-14 text-primary">{h.ticker}</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary/70" style={{ width: `${h.weight * 4}px` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{h.weight}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Factor tilts */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-muted-foreground/50" />
              Portfolio Factor Tilts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exposureFactors.map((fid) => {
                const exp = portfolioExposure[fid];
                const pct = Math.min(Math.abs(exp) / 1.0, 1) * 100;
                const isPos = exp >= 0;
                return (
                  <div key={fid}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: getFactorColor(fid) }}>
                        {FACTOR_DISPLAY_NAMES[fid]}
                      </span>
                      <span className={cn("text-xs font-mono font-medium", isPos ? "text-emerald-400" : "text-red-400")}>
                        {isPos ? "+" : ""}{exp.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted/30 rounded-full" style={{ width: "100%" }}>
                      <div
                        className="absolute top-0 h-2 rounded-full transition-colors"
                        style={{
                          left: isPos ? "50%" : `${50 - pct / 2}%`,
                          width: `${pct / 2}%`,
                          backgroundColor: isPos ? getFactorColor(fid) : "#ef4444",
                        }}
                      />
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>Underweight</span>
                      <span>Overweight</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Exposure score: -1 (max underweight) to +1 (max overweight) vs market cap weight
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-ticker factor grid */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Individual Security Factor Scores</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground" style={{ minWidth: 500 }}>
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground">Ticker</th>
                {exposureFactors.map((fid) => (
                  <th key={fid} className="text-center p-2" style={{ color: getFactorColor(fid) }}>
                    {FACTOR_DISPLAY_NAMES[fid]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedHoldings.map((h) => (
                <tr key={h.ticker} className="border-b border-border hover:bg-muted/20">
                  <td className="p-2 font-mono font-medium text-primary">{h.ticker}</td>
                  {exposureFactors.map((fid) => {
                    const v = TICKER_EXPOSURES[h.ticker]?.[fid] ?? 0;
                    const bg = v > 0.5 ? getFactorColor(fid) + "33" : v < -0.5 ? "#ef444422" : "";
                    return (
                      <td key={fid} className="text-center p-2 font-mono" style={{ backgroundColor: bg, color: v >= 0 ? "#10b981" : "#ef4444" }}>
                        {v >= 0 ? "+" : ""}{v.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// Rolling Correlation SVG Chart
function RollingCorrelationChart() {
  // Generate synthetic 3-year rolling correlation data between factor pairs
  const periods = 36; // months
  const pairs: { label: string; colorA: string; colorB: string }[] = [
    { label: "Value vs Momentum", colorA: "#f59e0b", colorB: "#10b981" },
    { label: "Quality vs Low Vol", colorA: "#6366f1", colorB: "#8b5cf6" },
    { label: "Momentum vs Market", colorA: "#10b981", colorB: "#64748b" },
    { label: "Value vs Market", colorA: "#f59e0b", colorB: "#64748b" },
  ];

  // Deterministic correlation series
  function buildCorrelationSeries(baseCorr: number, noise: number): number[] {
    let localS = 762 + Math.floor(baseCorr * 100);
    const lr = () => { localS = (localS * 1103515245 + 12345) & 0x7fffffff; return localS / 0x7fffffff; };
    const series: number[] = [];
    let val = baseCorr;
    for (let i = 0; i < periods; i++) {
      val += (lr() - 0.5) * noise;
      val = Math.max(-1, Math.min(1, val));
      series.push(Math.round(val * 100) / 100);
    }
    return series;
  }

  const seriesData = [
    buildCorrelationSeries(-0.3, 0.15),
    buildCorrelationSeries(0.65, 0.1),
    buildCorrelationSeries(0.55, 0.12),
    buildCorrelationSeries(-0.1, 0.14),
  ];

  const W = 640, H = 220;
  const PAD = { top: 16, right: 20, bottom: 36, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xScale = (i: number) => (i / (periods - 1)) * innerW;
  const yScale = (v: number) => innerH - ((v + 1) / 2) * innerH;

  const xTicks = [0, 6, 12, 18, 24, 30, 35].map((i) => ({
    i,
    label: `M${i + 1}`,
  }));

  const CORR_COLORS = ["#f59e0b", "#6366f1", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }}>
          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {/* Horizontal reference lines */}
            {[-1, -0.5, 0, 0.5, 1].map((v) => (
              <g key={v}>
                <line x1={0} x2={innerW} y1={yScale(v)} y2={yScale(v)} stroke={v === 0 ? "#475569" : "#1e293b"} strokeWidth={v === 0 ? 1 : 0.5} strokeDasharray={v === 0 ? undefined : "3,3"} />
                <text x={-6} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize={10}>{v.toFixed(1)}</text>
              </g>
            ))}
            {/* X ticks */}
            {xTicks.map(({ i, label }) => (
              <text key={label} x={xScale(i)} y={innerH + 18} textAnchor="middle" fill="#64748b" fontSize={10}>{label}</text>
            ))}
            {/* Lines */}
            {seriesData.map((series, si) => {
              const pts = series.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
              return (
                <polyline
                  key={si}
                  points={pts}
                  fill="none"
                  stroke={CORR_COLORS[si]}
                  strokeWidth={2}
                  opacity={0.85}
                />
              );
            })}
            {/* Axes */}
            <line x1={0} x2={0} y1={0} y2={innerH} stroke="#334155" />
            <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#334155" />
          </g>
        </svg>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 px-2">
        {pairs.map((p, i) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5 rounded" style={{ backgroundColor: CORR_COLORS[i] }} />
            <span className="text-xs text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        <Card className="border-border bg-muted/20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-400">Value-Momentum Diversification</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Value and Momentum have historically been negatively correlated (-0.3 avg), making them powerful complements in a multi-factor portfolio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-muted/20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary">Quality-Low Vol Overlap</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quality and Low Vol tend to move together (0.65 correlation), especially during market stress, reducing diversification benefit of combining them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SmartBetaPage() {
  const [activeTab, setActiveTab] = useState("returns");

  // Reset seed on render (deterministic)
  void rand; // ensure rand is referenced so linter doesn't complain

  const nonMarketFactors = FACTORS.filter((f) => f.id !== "market");
  const marketFactor = FACTORS.find((f) => f.id === "market")!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted/10">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Smart Beta & Factor ETFs</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Rules-based systematic exposure to return premia — between passive and active
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs text-muted-foreground">5 Factors</Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">10 ETFs</Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">2015–2024</Badge>
            </div>
          </div>
        </motion.div>

        {/* Intro blurb */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border bg-muted/20 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">What is Smart Beta?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Smart beta ETFs use alternative index construction rules (factor tilts) instead of pure market-cap weighting to systematically capture documented return premia.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Factor Premia</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Academic research (Fama-French, Carhart) identified persistent return premia: value, size, momentum, quality, and low volatility — each with distinct economic rationale.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Factor Cyclicality</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No single factor wins every year. Factors rotate with economic regimes — diversifying across factors smooths the performance cycle.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Factor metrics grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Factor Premium Summary (Long-Run)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {nonMarketFactors.map((f, i) => (
              <FactorCard key={f.id} factor={f} rank={i} />
            ))}
          </div>
          <div className="mt-2">
            <FactorCard factor={marketFactor} rank={5} />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
              <TabsTrigger value="returns" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Factor Returns</TabsTrigger>
              <TabsTrigger value="etfs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">ETF Comparison</TabsTrigger>
              <TabsTrigger value="exposure" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Factor Exposure</TabsTrigger>
              <TabsTrigger value="backtester" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Backtester</TabsTrigger>
            </TabsList>

            {/* Tab 1: Factor Returns */}
            <TabsContent value="returns" className="mt-4 space-y-4 data-[state=inactive]:hidden">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
                    Cumulative Factor Returns (2014 = 100)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CumulativeReturnsChart />
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
                    Factor Performance Cycle (2015–2024)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FactorCycleHeatmap />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: ETF Comparison */}
            <TabsContent value="etfs" className="mt-4 data-[state=inactive]:hidden">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground/50" />
                    Popular Factor ETFs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ETFComparisonTable />
                </CardContent>
              </Card>
              {/* Key metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Avg Expense Ratio</p>
                    <p className="text-xl font-medium text-primary mt-1">0.20%</p>
                    <p className="text-xs text-muted-foreground mt-1">vs 0.03% for plain market ETFs</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Total AUM Tracked</p>
                    <p className="text-xl font-medium text-emerald-400 mt-1">$115.8B</p>
                    <p className="text-xs text-muted-foreground mt-1">across 10 factor ETFs shown</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Best 1Y Return</p>
                    <p className="text-xl font-medium text-amber-400 mt-1">+28.6%</p>
                    <p className="text-xs text-muted-foreground mt-1">QMOM (Momentum)</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 3: Factor Exposure */}
            <TabsContent value="exposure" className="mt-4 data-[state=inactive]:hidden">
              <FactorExposureAnalyzer />
            </TabsContent>

            {/* Tab 4: Backtester */}
            <TabsContent value="backtester" className="mt-4 data-[state=inactive]:hidden">
              <FactorBacktester />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Rolling Correlations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />
                Rolling Factor Correlations (36-Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RollingCorrelationChart />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// ── Backtester Component (defined after page for clarity) ─────────────────────
function FactorBacktester() {
  const allFactorIds = ["value", "momentum", "quality", "lowvol", "size"];
  const [weights, setWeights] = useState<Record<string, number>>({
    value: 20,
    momentum: 20,
    quality: 20,
    lowvol: 20,
    size: 20,
  });
  const [rebalance, setRebalance] = useState<"annual" | "quarterly">("annual");

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const setWeight = (fid: string, val: number) => {
    setWeights((prev) => ({ ...prev, [fid]: val }));
  };

  const equalWeight = () => {
    setWeights({ value: 20, momentum: 20, quality: 20, lowvol: 20, size: 20 });
  };

  // Compute blended portfolio returns
  const portfolioReturns = useMemo(() => {
    if (total === 0) return null;
    let cumVal = 100;
    const cumPts: number[] = [100];
    for (const yr of YEARS) {
      let blended = 0;
      for (const fid of allFactorIds) {
        blended += (weights[fid] / total) * YEAR_RETURNS[fid][yr];
      }
      // rebalance bonus/cost (very small synthetic)
      const rCost = rebalance === "quarterly" ? -0.05 : -0.02;
      cumVal = cumVal * (1 + (blended + rCost) / 100);
      cumPts.push(Math.round(cumVal * 10) / 10);
    }
    return { cumPts, finalVal: cumVal };
  }, [weights, total, rebalance]);

  const marketFinalVal = CUMULATIVE["market"][CUMULATIVE["market"].length - 1];

  // SVG for mini chart
  const W = 480, H = 180;
  const PAD2 = { top: 12, right: 16, bottom: 32, left: 44 };
  const iW = W - PAD2.left - PAD2.right;
  const iH = H - PAD2.top - PAD2.bottom;
  const allVals2 = portfolioReturns
    ? [...portfolioReturns.cumPts, ...CUMULATIVE["market"]]
    : CUMULATIVE["market"];
  const minV2 = Math.min(...allVals2) * 0.95;
  const maxV2 = Math.max(...allVals2) * 1.03;
  const xS2 = (i: number) => (i / (YEARS.length)) * iW;
  const yS2 = (v: number) => iH - ((v - minV2) / (maxV2 - minV2)) * iH;
  const mktPts = CUMULATIVE["market"].map((v, i) => `${xS2(i)},${yS2(v)}`).join(" ");
  const portPts = portfolioReturns?.cumPts.map((v, i) => `${xS2(i)},${yS2(v)}`).join(" ") ?? "";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Weight sliders */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Factor Allocation</CardTitle>
              <Button size="sm" variant="outline" className="text-xs text-muted-foreground h-7" onClick={equalWeight}>Equal Weight</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {allFactorIds.map((fid) => {
              const f = getFactor(fid);
              return (
                <div key={fid}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: getFactorColor(fid) }}>{f?.name}</span>
                    <span className="text-xs text-muted-foreground font-mono font-medium">{weights[fid]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={weights[fid]}
                    onChange={(e) => setWeight(fid, Number(e.target.value))}
                    className="w-full h-1.5 accent-primary cursor-pointer"
                  />
                </div>
              );
            })}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total allocation</span>
                <span className={cn("text-xs font-medium", total === 100 ? "text-emerald-400" : "text-amber-400")}>
                  {total}%
                </span>
              </div>
              {total !== 100 && (
                <p className="text-xs text-amber-400 mt-1">Weights will be normalized to 100%</p>
              )}
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Rebalance Frequency</p>
              <div className="flex gap-2">
                {(["annual", "quarterly"] as const).map((r) => (
                  <Button
                    key={r}
                    size="sm"
                    variant={rebalance === r ? "default" : "outline"}
                    className="text-xs text-muted-foreground h-7 flex-1"
                    onClick={() => setRebalance(r)}
                  >
                    {r === "annual" ? "Annual" : "Quarterly"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Backtest Results (2014–2024)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto mb-3">
              <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 320 }} className="w-full">
                <g transform={`translate(${PAD2.left},${PAD2.top})`}>
                  {/* Grid */}
                  {[100, 150, 200, 250].filter(v => v >= minV2 && v <= maxV2).map((v) => (
                    <g key={v}>
                      <line x1={0} x2={iW} y1={yS2(v)} y2={yS2(v)} stroke="#334155" strokeDasharray="3,3" strokeWidth={0.5} />
                      <text x={-4} y={yS2(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>{v}</text>
                    </g>
                  ))}
                  {/* X labels */}
                  {[0, 5, 10].map((i) => (
                    <text key={i} x={xS2(i)} y={iH + 18} textAnchor="middle" fill="#64748b" fontSize={9}>
                      {i === 0 ? "2014" : i === 5 ? "2019" : "2024"}
                    </text>
                  ))}
                  {/* Market line */}
                  <polyline points={mktPts} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
                  {/* Portfolio line */}
                  {portPts && (
                    <polyline points={portPts} fill="none" stroke="#6366f1" strokeWidth={2.5} opacity={0.95} />
                  )}
                  {/* Axes */}
                  <line x1={0} x2={0} y1={0} y2={iH} stroke="#334155" />
                  <line x1={0} x2={iW} y1={iH} y2={iH} stroke="#334155" />
                </g>
              </svg>
            </div>
            <div className="flex gap-4 justify-center mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-0.5" style={{ backgroundColor: "#6366f1" }} />
                <span className="text-muted-foreground">Your Portfolio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-0.5 border-t border-dashed border-muted-foreground" />
                <span className="text-muted-foreground">Market Cap (Benchmark)</span>
              </div>
            </div>
            {portfolioReturns && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Portfolio Final Value</p>
                  <p className="text-lg font-medium text-primary">{portfolioReturns.finalVal.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Starting 100</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">vs Benchmark</p>
                  <p className={cn("text-lg font-medium", portfolioReturns.finalVal >= marketFinalVal ? "text-emerald-400" : "text-red-400")}>
                    {portfolioReturns.finalVal >= marketFinalVal ? "+" : ""}
                    {(portfolioReturns.finalVal - marketFinalVal).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Alpha vs market</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Annualized Return</p>
                  <p className="text-lg font-medium">
                    {((Math.pow(portfolioReturns.finalVal / 100, 1 / 10) - 1) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Rebalance</p>
                  <p className="text-lg font-medium capitalize">{rebalance}</p>
                  <p className="text-xs text-muted-foreground">
                    Cost est: {rebalance === "quarterly" ? "0.05" : "0.02"}%/yr
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-border bg-muted/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Backtester Notes</p>
              <p className="text-xs text-muted-foreground">
                Returns are simulated based on historical factor premium research data. Past factor premiums do not guarantee future results. Transaction costs, taxes, and factor crowding effects are not fully modeled. The backtest assumes perfect rebalancing execution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
