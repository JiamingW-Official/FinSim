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
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG (seed 821) ─────────────────────────────────────────────────────
function makeRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface FactorCard {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  sharpe: number;
  maxDrawdown: number;
  annualReturn: number;
  volatility: number;
  corrMatrix: number[][]; // 3×3 snippet vs [Market, Momentum, Value]
}

interface StockScore {
  ticker: string;
  company: string;
  value: number;
  momentum: number;
  quality: number;
  lowVol: number;
  size: number;
  composite: number;
  signal: "Strong Buy" | "Buy" | "Hold" | "Sell";
}

// ── Generate data with seeded PRNG ─────────────────────────────────────────────

function generateAllData() {
  const rand = makeRand(821);

  // 7 factor definitions (static metadata + seeded quantitative fields)
  const factors: FactorCard[] = [
    {
      id: "market",
      name: "Market Beta",
      subtitle: "CAPM / Systematic Risk",
      description:
        "Excess return of the broad equity market over the risk-free rate. The fundamental source of equity risk premium, compensating investors for bearing undiversifiable systematic risk. Pioneered by Sharpe (1964) through the Capital Asset Pricing Model.",
      icon: <BarChart3 size={20} />,
      color: "#6366f1",
      bgColor: "bg-indigo-500/10",
      sharpe: 0.38 + rand() * 0.18,
      maxDrawdown: -(0.48 + rand() * 0.12),
      annualReturn: 7 + rand() * 3,
      volatility: 15 + rand() * 3,
      corrMatrix: [
        [1, 0.12 + rand() * 0.1, 0.18 + rand() * 0.1],
        [0.12 + rand() * 0.1, 1, -0.08 + rand() * 0.1],
        [0.18 + rand() * 0.1, -0.08 + rand() * 0.1, 1],
      ],
    },
    {
      id: "size",
      name: "Size (SMB)",
      subtitle: "Small Minus Big",
      description:
        "Small-cap stocks have historically outperformed large-cap stocks on a risk-adjusted basis. The SMB factor, introduced by Fama & French (1992), captures this premium. Often attributed to higher distress risk, lower analyst coverage, and an illiquidity premium in smaller names.",
      icon: <Layers size={20} />,
      color: "#10b981",
      bgColor: "bg-emerald-500/10",
      sharpe: 0.22 + rand() * 0.12,
      maxDrawdown: -(0.42 + rand() * 0.15),
      annualReturn: 2.5 + rand() * 2,
      volatility: 11 + rand() * 3,
      corrMatrix: [
        [1, 0.05 + rand() * 0.08, -0.02 + rand() * 0.08],
        [0.05 + rand() * 0.08, 1, -0.14 + rand() * 0.1],
        [-0.02 + rand() * 0.08, -0.14 + rand() * 0.1, 1],
      ],
    },
    {
      id: "value",
      name: "Value (HML)",
      subtitle: "High Minus Low",
      description:
        "Stocks trading at low multiples (high book-to-market, earnings yield, or cash-flow yield) outperform expensive growth stocks over long periods. The HML factor from Fama & French (1992) captures this. Behaviorally linked to investor overextrapolation of growth and cognitive biases.",
      icon: <DollarSign size={20} />,
      color: "#f59e0b",
      bgColor: "bg-amber-500/10",
      sharpe: 0.28 + rand() * 0.14,
      maxDrawdown: -(0.44 + rand() * 0.13),
      annualReturn: 3.2 + rand() * 2.5,
      volatility: 12 + rand() * 3,
      corrMatrix: [
        [1, -0.18 + rand() * 0.1, 0.08 + rand() * 0.1],
        [-0.18 + rand() * 0.1, 1, 0.04 + rand() * 0.08],
        [0.08 + rand() * 0.1, 0.04 + rand() * 0.08, 1],
      ],
    },
    {
      id: "momentum",
      name: "Momentum",
      subtitle: "12-1 Month Return",
      description:
        "Stocks that have outperformed in the past 6–12 months (skipping the most recent month) continue to outperform in the near term. Documented by Jegadeesh & Titman (1993). Widely attributed to investor underreaction, herding, and the gradual diffusion of information across market participants.",
      icon: <TrendingUp size={20} />,
      color: "#ef4444",
      bgColor: "bg-red-500/10",
      sharpe: 0.44 + rand() * 0.18,
      maxDrawdown: -(0.62 + rand() * 0.14),
      annualReturn: 6.5 + rand() * 3,
      volatility: 18 + rand() * 4,
      corrMatrix: [
        [1, 0.22 + rand() * 0.1, -0.15 + rand() * 0.1],
        [0.22 + rand() * 0.1, 1, -0.08 + rand() * 0.08],
        [-0.15 + rand() * 0.1, -0.08 + rand() * 0.08, 1],
      ],
    },
    {
      id: "quality",
      name: "Quality",
      subtitle: "Profitability + Safety",
      description:
        "High-quality companies — characterized by high ROE, low debt, stable earnings growth, and strong cash conversion — earn superior risk-adjusted returns. Formalized by Asness, Frazzini & Pedersen (2013). Quality firms are particularly defensive during recessions and credit-stress environments.",
      icon: <Shield size={20} />,
      color: "#8b5cf6",
      bgColor: "bg-violet-500/10",
      sharpe: 0.52 + rand() * 0.16,
      maxDrawdown: -(0.32 + rand() * 0.1),
      annualReturn: 5.8 + rand() * 2.5,
      volatility: 10 + rand() * 2.5,
      corrMatrix: [
        [1, -0.12 + rand() * 0.08, 0.14 + rand() * 0.08],
        [-0.12 + rand() * 0.08, 1, -0.06 + rand() * 0.06],
        [0.14 + rand() * 0.08, -0.06 + rand() * 0.06, 1],
      ],
    },
    {
      id: "lowvol",
      name: "Low Volatility",
      subtitle: "BAB / Min-Variance",
      description:
        "Low-beta and low-volatility stocks deliver better risk-adjusted returns than high-volatility counterparts — contradicting the classical risk-return trade-off. The Betting-Against-Beta (BAB) strategy by Frazzini & Pedersen (2014) exploits leverage constraints and investors' preference for lottery-like high-beta stocks.",
      icon: <Activity size={20} />,
      color: "#06b6d4",
      bgColor: "bg-cyan-500/10",
      sharpe: 0.61 + rand() * 0.15,
      maxDrawdown: -(0.26 + rand() * 0.1),
      annualReturn: 4.8 + rand() * 2,
      volatility: 8.5 + rand() * 2,
      corrMatrix: [
        [1, 0.08 + rand() * 0.06, -0.22 + rand() * 0.08],
        [0.08 + rand() * 0.06, 1, -0.04 + rand() * 0.06],
        [-0.22 + rand() * 0.08, -0.04 + rand() * 0.06, 1],
      ],
    },
    {
      id: "dividend",
      name: "Dividend Yield",
      subtitle: "Income Premium",
      description:
        "High-dividend-yield stocks have historically delivered a return premium, particularly in mature market phases and rising-rate environments. Studied by Litzenberger & Ramaswamy (1979). The yield acts as a valuation floor, attracting income-oriented institutional investors and limiting downside.",
      icon: <Zap size={20} />,
      color: "#ec4899",
      bgColor: "bg-pink-500/10",
      sharpe: 0.35 + rand() * 0.14,
      maxDrawdown: -(0.38 + rand() * 0.12),
      annualReturn: 3.8 + rand() * 2,
      volatility: 11 + rand() * 2.5,
      corrMatrix: [
        [1, -0.08 + rand() * 0.06, 0.32 + rand() * 0.1],
        [-0.08 + rand() * 0.06, 1, -0.12 + rand() * 0.08],
        [0.32 + rand() * 0.1, -0.12 + rand() * 0.08, 1],
      ],
    },
  ];

  // 60-period cumulative return series for 5 factors
  const CHART_FACTORS = ["Market Beta", "Momentum", "Quality", "Low Volatility", "Value (HML)"];
  const CHART_COLORS = ["#6366f1", "#ef4444", "#8b5cf6", "#06b6d4", "#f59e0b"];

  const cumulativeSeries: number[][] = CHART_FACTORS.map((_, fi) => {
    const baseVol = [0.045, 0.065, 0.038, 0.028, 0.052][fi];
    const drift = [0.007, 0.009, 0.008, 0.006, 0.005][fi];
    const series: number[] = [100];
    for (let i = 1; i < 60; i++) {
      const prev = series[i - 1];
      const ret = (rand() - 0.48) * baseVol * 2 + drift;
      series.push(prev * (1 + ret));
    }
    return series;
  });

  // Drawdown series derived from cumulative
  const drawdownSeries: number[][] = cumulativeSeries.map((series) => {
    const dd: number[] = [];
    let peak = series[0];
    for (const v of series) {
      if (v > peak) peak = v;
      dd.push(((v - peak) / peak) * 100);
    }
    return dd;
  });

  // Rolling 12-month Sharpe heatmap: 5 factors × 12 windows (months 1..12 of last year)
  const rollingSharpe: number[][] = CHART_FACTORS.map(() =>
    Array.from({ length: 12 }, () => -1.5 + rand() * 3)
  );

  // 10 stocks with factor scores
  const TICKERS = [
    ["AAPL", "Apple Inc."],
    ["MSFT", "Microsoft Corp."],
    ["NVDA", "NVIDIA Corp."],
    ["JPM", "JPMorgan Chase"],
    ["JNJ", "Johnson & Johnson"],
    ["XOM", "ExxonMobil Corp."],
    ["AMZN", "Amazon.com Inc."],
    ["BRK", "Berkshire Hathaway"],
    ["PG", "Procter & Gamble"],
    ["META", "Meta Platforms"],
  ];

  const stocks: StockScore[] = TICKERS.map(([ticker, company]) => {
    const value = rand() * 100;
    const momentum = rand() * 100;
    const quality = rand() * 100;
    const lowVol = rand() * 100;
    const size = rand() * 100;
    const composite = (value * 0.2 + momentum * 0.25 + quality * 0.25 + lowVol * 0.2 + size * 0.1);
    let signal: StockScore["signal"] = "Hold";
    if (composite >= 70) signal = "Strong Buy";
    else if (composite >= 55) signal = "Buy";
    else if (composite < 35) signal = "Sell";

    return {
      ticker,
      company,
      value: Math.round(value),
      momentum: Math.round(momentum),
      quality: Math.round(quality),
      lowVol: Math.round(lowVol),
      size: Math.round(size),
      composite: Math.round(composite),
      signal,
    };
  });

  // Sort stocks by composite descending
  stocks.sort((a, b) => b.composite - a.composite);

  return { factors, cumulativeSeries, drawdownSeries, rollingSharpe, CHART_FACTORS, CHART_COLORS, stocks };
}

const DATA = generateAllData();

// ── Sub-components ─────────────────────────────────────────────────────────────

function FactorZooTab({ factors }: { factors: FactorCard[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {factors.map((f) => (
        <motion.div
          key={f.id}
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="bg-neutral-900 border-neutral-800 cursor-pointer hover:border-neutral-600 transition-colors"
            onClick={() => setExpanded(expanded === f.id ? null : f.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: f.color + "20", color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-white">{f.name}</CardTitle>
                    <p className="text-xs text-neutral-500 mt-0.5">{f.subtitle}</p>
                  </div>
                </div>
                <Info size={14} className="text-neutral-600 shrink-0 mt-1" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key metrics row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Sharpe</p>
                  <p className="text-lg font-bold" style={{ color: f.color }}>
                    {f.sharpe.toFixed(2)}
                  </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Max DD</p>
                  <p className="text-lg font-bold text-red-400">
                    {(f.maxDrawdown * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Ann. Ret</p>
                  <p className="text-lg font-bold text-green-400">
                    {f.annualReturn.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Volatility</p>
                  <p className="text-lg font-bold text-neutral-300">
                    {f.volatility.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                {f.description}
              </p>

              {/* Correlation snippet (expanded) */}
              {expanded === f.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">
                    Correlation Snippet (vs Market / Mom / Value)
                  </p>
                  <div className="text-xs font-mono">
                    {["Market", "Mom", "Value"].map((label, row) => (
                      <div key={label} className="flex gap-2 items-center mb-1">
                        <span className="w-12 text-neutral-500">{label}</span>
                        {f.corrMatrix[row].map((c, col) => (
                          <span
                            key={col}
                            className="w-10 text-center rounded px-1"
                            style={{
                              backgroundColor:
                                c > 0.3
                                  ? "#10b98120"
                                  : c < -0.1
                                  ? "#ef444420"
                                  : "#52525b20",
                              color:
                                c > 0.3
                                  ? "#10b981"
                                  : c < -0.1
                                  ? "#ef4444"
                                  : "#a1a1aa",
                            }}
                          >
                            {c.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <p className="text-[10px] text-neutral-600">
                {expanded === f.id ? "Click to collapse" : "Click to expand correlation matrix"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function FactorReturnsTab({
  cumulativeSeries,
  drawdownSeries,
  rollingSharpe,
  factorNames,
  factorColors,
}: {
  cumulativeSeries: number[][];
  drawdownSeries: number[][];
  rollingSharpe: number[][];
  factorNames: string[];
  factorColors: string[];
}) {
  const W = 600;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const periods = 60;

  // Cumulative chart bounds
  const allVals = cumulativeSeries.flat();
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  const xScale = (i: number) => PAD.left + (i / (periods - 1)) * chartW;
  const yScale = (v: number) =>
    PAD.top + ((maxVal - v) / (maxVal - minVal)) * chartH;

  const makePath = (series: number[]) =>
    series
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`)
      .join(" ");

  // Drawdown chart bounds
  const allDD = drawdownSeries.flat();
  const minDD = Math.min(...allDD);

  const ddYScale = (v: number) =>
    PAD.top + ((0 - v) / (0 - minDD)) * chartH;

  const makeDDPath = (series: number[]) =>
    series
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${ddYScale(v).toFixed(1)}`)
      .join(" ");

  // Sharpe heatmap
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cellW = 36;
  const cellH = 26;
  const heatPad = { left: 72, top: 24 };

  const sharpeColor = (v: number) => {
    if (v >= 1.2) return "#10b981";
    if (v >= 0.6) return "#6ee7b7";
    if (v >= 0) return "#fbbf24";
    if (v >= -0.6) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="space-y-6">
      {/* Cumulative Returns */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-neutral-300">Cumulative Factor Returns (60 Periods)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={W} height={H} className="block">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = PAD.top + t * chartH;
                const val = maxVal - t * (maxVal - minVal);
                return (
                  <g key={t}>
                    <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#27272a" strokeDasharray="4 4" />
                    <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#71717a">
                      {val.toFixed(0)}
                    </text>
                  </g>
                );
              })}
              {/* Period labels */}
              {[0, 15, 30, 45, 59].map((i) => (
                <text key={i} x={xScale(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="#71717a">
                  T{i + 1}
                </text>
              ))}
              {/* Factor lines */}
              {cumulativeSeries.map((series, fi) => (
                <path
                  key={fi}
                  d={makePath(series)}
                  fill="none"
                  stroke={factorColors[fi]}
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  opacity={0.85}
                />
              ))}
            </svg>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-2">
            {factorNames.map((name, fi) => (
              <div key={fi} className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded" style={{ backgroundColor: factorColors[fi] }} />
                <span className="text-xs text-neutral-400">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drawdown Chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-neutral-300">Rolling Drawdown (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={W} height={H} className="block">
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = PAD.top + t * chartH;
                const val = 0 - t * Math.abs(minDD);
                return (
                  <g key={t}>
                    <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#27272a" strokeDasharray="4 4" />
                    <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#71717a">
                      {val.toFixed(0)}%
                    </text>
                  </g>
                );
              })}
              {[0, 15, 30, 45, 59].map((i) => (
                <text key={i} x={xScale(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="#71717a">
                  T{i + 1}
                </text>
              ))}
              {/* Zero line */}
              <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top} y2={PAD.top} stroke="#52525b" strokeWidth={1} />
              {drawdownSeries.map((series, fi) => (
                <path
                  key={fi}
                  d={makeDDPath(series)}
                  fill="none"
                  stroke={factorColors[fi]}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  opacity={0.75}
                />
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Rolling 12-Month Sharpe Heatmap */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-neutral-300">Rolling 12-Month Sharpe Ratio Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={heatPad.left + 12 * cellW + 16} height={heatPad.top + factorNames.length * cellH + 16} className="block">
              {/* Month headers */}
              {months.map((m, mi) => (
                <text
                  key={mi}
                  x={heatPad.left + mi * cellW + cellW / 2}
                  y={heatPad.top - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#71717a"
                >
                  {m}
                </text>
              ))}
              {factorNames.map((fname, fi) => (
                <g key={fi}>
                  {/* Factor label */}
                  <text
                    x={heatPad.left - 6}
                    y={heatPad.top + fi * cellH + cellH / 2 + 4}
                    textAnchor="end"
                    fontSize={9}
                    fill="#a1a1aa"
                  >
                    {fname.length > 9 ? fname.slice(0, 9) + "…" : fname}
                  </text>
                  {rollingSharpe[fi].map((v, mi) => (
                    <g key={mi}>
                      <rect
                        x={heatPad.left + mi * cellW + 1}
                        y={heatPad.top + fi * cellH + 1}
                        width={cellW - 2}
                        height={cellH - 2}
                        rx={3}
                        fill={sharpeColor(v) + "33"}
                        stroke={sharpeColor(v) + "66"}
                        strokeWidth={0.5}
                      />
                      <text
                        x={heatPad.left + mi * cellW + cellW / 2}
                        y={heatPad.top + fi * cellH + cellH / 2 + 4}
                        textAnchor="middle"
                        fontSize={8}
                        fill={sharpeColor(v)}
                      >
                        {v.toFixed(1)}
                      </text>
                    </g>
                  ))}
                </g>
              ))}
            </svg>
          </div>
          {/* Sharpe legend */}
          <div className="flex gap-4 mt-2 flex-wrap">
            {[
              { label: "≥ 1.2", color: "#10b981" },
              { label: "0.6–1.2", color: "#6ee7b7" },
              { label: "0–0.6", color: "#fbbf24" },
              { label: "-0.6–0", color: "#f97316" },
              { label: "< -0.6", color: "#ef4444" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color + "33", border: `1px solid ${item.color}66` }} />
                <span className="text-[10px] text-neutral-500">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const FACTOR_SLIDER_DEFS = [
  { id: "market", label: "Market Beta", color: "#6366f1", baseReturn: 7.2, baseVol: 15.8 },
  { id: "size", label: "Size (SMB)", color: "#10b981", baseReturn: 2.4, baseVol: 11.2 },
  { id: "value", label: "Value (HML)", color: "#f59e0b", baseReturn: 3.1, baseVol: 12.4 },
  { id: "momentum", label: "Momentum", color: "#ef4444", baseReturn: 6.8, baseVol: 17.6 },
  { id: "quality", label: "Quality", color: "#8b5cf6", baseReturn: 5.4, baseVol: 9.8 },
];

function PortfolioBuilderTab() {
  const [exposures, setExposures] = useState<Record<string, number>>({
    market: 1.0,
    size: 0.2,
    value: 0.3,
    momentum: 0.2,
    quality: 0.4,
  });

  const { expectedReturn, expectedVol, sharpe } = useMemo(() => {
    let ret = 1.5; // risk-free base
    let varSum = 0;
    for (const f of FACTOR_SLIDER_DEFS) {
      ret += exposures[f.id] * f.baseReturn;
      varSum += Math.pow(exposures[f.id] * f.baseVol, 2);
    }
    // Add cross-correlation noise (simplified)
    varSum += exposures.momentum * exposures.market * 2 * 0.2 * 17.6 * 15.8 * 0.18;
    varSum += exposures.value * exposures.momentum * 2 * (-0.15) * 12.4 * 17.6;
    const vol = Math.sqrt(Math.max(varSum, 1));
    const sr = (ret - 1.5) / vol;
    return { expectedReturn: ret, expectedVol: vol, sharpe: sr };
  }, [exposures]);

  // Benchmark (60/40-like): market=1, quality=0.1
  const benchReturn = 1.5 + 1.0 * 7.2 + 0.1 * 5.4;
  const benchVol = Math.sqrt(Math.pow(15.8, 2) + Math.pow(0.1 * 9.8, 2));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sliders */}
      <div className="lg:col-span-2 space-y-5">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-neutral-300">Factor Exposure Tilts</CardTitle>
            <p className="text-xs text-neutral-500">Drag sliders to set factor loading (−2× to +2×)</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {FACTOR_SLIDER_DEFS.map((f) => {
              const v = exposures[f.id];
              return (
                <div key={f.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                      <span className="text-sm text-neutral-300">{f.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">
                        Contrib: {(v * f.baseReturn).toFixed(1)}%
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs min-w-[48px] text-center"
                        style={{ borderColor: f.color + "60", color: f.color }}
                      >
                        {v >= 0 ? "+" : ""}{v.toFixed(2)}×
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    min={-200}
                    max={200}
                    step={5}
                    value={[Math.round(v * 100)]}
                    onValueChange={([val]) =>
                      setExposures((prev) => ({ ...prev, [f.id]: val / 100 }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-600">
                    <span>−2×</span>
                    <span>0×</span>
                    <span>+2×</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-neutral-300">Expected Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-neutral-800/60 rounded-xl p-4 text-center">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Expected Return</p>
              <p className={`text-3xl font-bold ${expectedReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                {expectedReturn.toFixed(1)}%
              </p>
            </div>
            <div className="bg-neutral-800/60 rounded-xl p-4 text-center">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Expected Volatility</p>
              <p className="text-3xl font-bold text-neutral-300">{expectedVol.toFixed(1)}%</p>
            </div>
            <div className="bg-neutral-800/60 rounded-xl p-4 text-center">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Sharpe Ratio</p>
              <p
                className="text-3xl font-bold"
                style={{ color: sharpe >= 0.5 ? "#10b981" : sharpe >= 0.2 ? "#fbbf24" : "#ef4444" }}
              >
                {sharpe.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* vs Benchmark */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-300">vs Benchmark</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Alpha (Return)",
                val: expectedReturn - benchReturn,
                unit: "%",
                decimals: 1,
              },
              {
                label: "Tracking Vol",
                val: Math.abs(expectedVol - benchVol),
                unit: "%",
                decimals: 1,
              },
              {
                label: "Info Ratio",
                val: (expectedReturn - benchReturn) / Math.max(Math.abs(expectedVol - benchVol), 0.5),
                unit: "",
                decimals: 2,
              },
            ].map((m) => (
              <div key={m.label} className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">{m.label}</span>
                <span
                  className={`text-sm font-semibold ${
                    m.val > 0 ? "text-green-400" : m.val < 0 ? "text-red-400" : "text-neutral-300"
                  }`}
                >
                  {m.val >= 0 && m.unit !== "%" ? "+" : ""}
                  {m.val >= 0 && m.unit === "%" ? "+" : ""}
                  {m.val.toFixed(m.decimals)}{m.unit}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Factor tilt bar chart */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-300">Factor Tilt vs Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <svg width="100%" viewBox="0 0 220 130" className="block">
              {FACTOR_SLIDER_DEFS.map((f, i) => {
                const benchExp = f.id === "market" ? 1.0 : f.id === "quality" ? 0.1 : 0;
                const tilt = exposures[f.id] - benchExp;
                const barW = Math.min(Math.abs(tilt) * 40, 80);
                const y = 10 + i * 22;
                return (
                  <g key={f.id}>
                    <text x={72} y={y + 10} textAnchor="end" fontSize={9} fill="#a1a1aa">
                      {f.label.slice(0, 10)}
                    </text>
                    {/* Zero line */}
                    <line x1={80} x2={80} y1={4} y2={126} stroke="#3f3f46" strokeWidth={1} />
                    {tilt !== 0 && (
                      <rect
                        x={tilt > 0 ? 80 : 80 - barW}
                        y={y + 2}
                        width={barW}
                        height={14}
                        rx={2}
                        fill={tilt > 0 ? f.color + "80" : "#ef444480"}
                      />
                    )}
                    <text
                      x={tilt >= 0 ? 80 + barW + 3 : 80 - barW - 3}
                      y={y + 12}
                      textAnchor={tilt >= 0 ? "start" : "end"}
                      fontSize={8}
                      fill={tilt > 0 ? f.color : "#ef4444"}
                    >
                      {tilt >= 0 ? "+" : ""}{tilt.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          onClick={() =>
            setExposures({ market: 1.0, size: 0.2, value: 0.3, momentum: 0.2, quality: 0.4 })
          }
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
}

const SIGNAL_CONFIG: Record<StockScore["signal"], { bg: string; text: string; border: string }> = {
  "Strong Buy": { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/40" },
  Buy: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  Hold: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  Sell: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-neutral-400 w-6 text-right">{value}</span>
    </div>
  );
}

function LiveScoringTab({ stocks }: { stocks: StockScore[] }) {
  const [sortKey, setSortKey] = useState<keyof StockScore>("composite");

  const sorted = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return bv - av;
      return String(av).localeCompare(String(bv));
    });
  }, [stocks, sortKey]);

  const headers: { key: keyof StockScore; label: string; color: string }[] = [
    { key: "ticker", label: "Ticker", color: "#ffffff" },
    { key: "value", label: "Value", color: "#f59e0b" },
    { key: "momentum", label: "Mom.", color: "#ef4444" },
    { key: "quality", label: "Quality", color: "#8b5cf6" },
    { key: "lowVol", label: "Low Vol", color: "#06b6d4" },
    { key: "size", label: "Size", color: "#10b981" },
    { key: "composite", label: "Composite", color: "#6366f1" },
    { key: "signal", label: "Signal", color: "#ffffff" },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm text-neutral-300">Factor Score Ranking</CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                10 stocks scored across 5 factors. Composite = weighted average. Click header to sort.
              </p>
            </div>
            <Target size={16} className="text-neutral-600" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="px-4 py-2 text-left text-[10px] text-neutral-500 uppercase tracking-wide w-6">#</th>
                  {headers.map((h) => (
                    <th
                      key={String(h.key)}
                      className="px-3 py-2 text-left text-[10px] uppercase tracking-wide cursor-pointer hover:text-neutral-200 transition-colors"
                      style={{ color: sortKey === h.key ? h.color : "#71717a" }}
                      onClick={() => setSortKey(h.key)}
                    >
                      {h.label}
                      {sortKey === h.key && <span className="ml-0.5">↓</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((stock, rank) => {
                  const sc = SIGNAL_CONFIG[stock.signal];
                  return (
                    <motion.tr
                      key={stock.ticker}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-neutral-600">{rank + 1}</td>
                      <td className="px-3 py-3">
                        <div>
                          <span className="font-semibold text-white">{stock.ticker}</span>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{stock.company}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <ScoreBar value={stock.value} color="#f59e0b" />
                      </td>
                      <td className="px-3 py-3">
                        <ScoreBar value={stock.momentum} color="#ef4444" />
                      </td>
                      <td className="px-3 py-3">
                        <ScoreBar value={stock.quality} color="#8b5cf6" />
                      </td>
                      <td className="px-3 py-3">
                        <ScoreBar value={stock.lowVol} color="#06b6d4" />
                      </td>
                      <td className="px-3 py-3">
                        <ScoreBar value={stock.size} color="#10b981" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${stock.composite}%`,
                                backgroundColor:
                                  stock.composite >= 70
                                    ? "#10b981"
                                    : stock.composite >= 55
                                    ? "#6ee7b7"
                                    : stock.composite >= 35
                                    ? "#fbbf24"
                                    : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-white font-semibold w-8">{stock.composite}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${sc.bg} ${sc.text} ${sc.border}`}
                        >
                          {stock.signal}
                        </Badge>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Score legend */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">Factor Weights (Composite)</p>
              <div className="flex gap-4 flex-wrap">
                {[
                  { label: "Momentum", w: "25%", color: "#ef4444" },
                  { label: "Quality", w: "25%", color: "#8b5cf6" },
                  { label: "Value", w: "20%", color: "#f59e0b" },
                  { label: "Low Vol", w: "20%", color: "#06b6d4" },
                  { label: "Size", w: "10%", color: "#10b981" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-neutral-400">{item.label} ({item.w})</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">Signal Thresholds</p>
              <div className="flex gap-4 flex-wrap">
                {(Object.entries(SIGNAL_CONFIG) as [StockScore["signal"], typeof SIGNAL_CONFIG[StockScore["signal"]]][]).map(
                  ([sig, cfg]) => (
                    <Badge
                      key={sig}
                      variant="outline"
                      className={`text-[10px] ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {sig}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function FactorInvestingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={22} className="text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Factor Investing Deep Dive</h1>
          </div>
          <p className="text-sm text-neutral-400 max-w-2xl">
            Explore Fama-French factors, momentum, quality, and low-volatility premiums. Build multi-factor
            portfolios and score stocks across all dimensions — from academic theory to live implementation.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {["5F Model", "AQR", "MSCI", "S&P"].map((tag) => (
            <Badge key={tag} variant="outline" className="border-neutral-700 text-neutral-400 text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Summary stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Factors Covered", value: "7", icon: <Layers size={14} />, color: "text-indigo-400" },
          { label: "Avg Factor Sharpe", value: "0.43", icon: <Activity size={14} />, color: "text-emerald-400" },
          { label: "Stocks Scored", value: "10", icon: <Target size={14} />, color: "text-violet-400" },
          { label: "Backtest Periods", value: "60", icon: <TrendingDown size={14} />, color: "text-cyan-400" },
        ].map((chip) => (
          <Card key={chip.label} className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <div className={chip.color}>{chip.icon}</div>
              <div>
                <p className="text-lg font-bold text-white">{chip.value}</p>
                <p className="text-[10px] text-neutral-500">{chip.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="zoo" className="space-y-4">
        <TabsList className="bg-neutral-900 border border-neutral-800">
          <TabsTrigger value="zoo" className="text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
            Factor Zoo
          </TabsTrigger>
          <TabsTrigger value="returns" className="text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
            Factor Returns
          </TabsTrigger>
          <TabsTrigger value="builder" className="text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
            Portfolio Builder
          </TabsTrigger>
          <TabsTrigger value="scoring" className="text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
            Live Scoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zoo" className="data-[state=inactive]:hidden">
          <FactorZooTab factors={DATA.factors} />
        </TabsContent>

        <TabsContent value="returns" className="data-[state=inactive]:hidden">
          <FactorReturnsTab
            cumulativeSeries={DATA.cumulativeSeries}
            drawdownSeries={DATA.drawdownSeries}
            rollingSharpe={DATA.rollingSharpe}
            factorNames={DATA.CHART_FACTORS}
            factorColors={DATA.CHART_COLORS}
          />
        </TabsContent>

        <TabsContent value="builder" className="data-[state=inactive]:hidden">
          <PortfolioBuilderTab />
        </TabsContent>

        <TabsContent value="scoring" className="data-[state=inactive]:hidden">
          <LiveScoringTab stocks={DATA.stocks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
