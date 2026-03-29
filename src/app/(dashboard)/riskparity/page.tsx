"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  TrendingUp,
  BarChart3,
  Activity,
  Scale,
  Zap,
  Info,
  ChevronUp,
  ChevronDown,
  Target,
  DollarSign,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 780;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssetClass {
  name: string;
  ticker: string;
  color: string;
  capitalWeight: number;   // % of capital
  riskWeight: number;      // % of risk contribution (equal in RP)
  vol: number;             // annualised vol %
  leveragedWeight: number; // capital weight × leverage
  corrToPort: number;      // correlation to portfolio
  annReturn: number;       // historical ann. return %
  sharpe: number;
}

interface BacktestPoint {
  year: number;
  riskParity: number;
  sixtyForty: number;
  allEquity: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const ASSETS: AssetClass[] = [
  {
    name: "US Equities",
    ticker: "SPY",
    color: "#6366f1",
    capitalWeight: 12,
    riskWeight: 25,
    vol: 18.4,
    leveragedWeight: 30,
    corrToPort: 0.72,
    annReturn: 9.8,
    sharpe: 0.53,
  },
  {
    name: "Intl Equities",
    ticker: "EFA",
    color: "#8b5cf6",
    capitalWeight: 8,
    riskWeight: 25,
    vol: 16.9,
    leveragedWeight: 20,
    corrToPort: 0.64,
    annReturn: 7.2,
    sharpe: 0.43,
  },
  {
    name: "Long Bonds",
    ticker: "TLT",
    color: "#06b6d4",
    capitalWeight: 40,
    riskWeight: 25,
    vol: 13.2,
    leveragedWeight: 40,
    corrToPort: -0.18,
    annReturn: 5.6,
    sharpe: 0.42,
  },
  {
    name: "Commodities",
    ticker: "DJP",
    color: "#f59e0b",
    capitalWeight: 14,
    riskWeight: 12.5,
    vol: 17.6,
    leveragedWeight: 7,
    corrToPort: 0.28,
    annReturn: 4.1,
    sharpe: 0.23,
  },
  {
    name: "Gold",
    ticker: "GLD",
    color: "#fbbf24",
    capitalWeight: 8,
    riskWeight: 12.5,
    vol: 15.8,
    leveragedWeight: 3,
    corrToPort: 0.12,
    annReturn: 6.3,
    sharpe: 0.40,
  },
  {
    name: "TIPS",
    ticker: "TIP",
    color: "#10b981",
    capitalWeight: 18,
    riskWeight: 0,
    vol: 7.4,
    leveragedWeight: 0,
    corrToPort: 0.31,
    annReturn: 4.8,
    sharpe: 0.65,
  },
];

// Distribute remaining risk weight to TIPS
ASSETS[5].riskWeight = 100 - ASSETS.slice(0, 5).reduce((a, b) => a + b.riskWeight, 0);

// Generate backtest data 2000–2024
const BACKTEST: BacktestPoint[] = (() => {
  const pts: BacktestPoint[] = [];
  let rp = 100, s60 = 100, eq = 100;
  for (let yr = 2000; yr <= 2024; yr++) {
    const shock = rand() - 0.5;
    const eqR = 0.07 + shock * 0.30;
    const bondR = 0.04 - shock * 0.10;
    const rpR = 0.055 + shock * 0.08;
    const s6040R = eqR * 0.6 + bondR * 0.4;
    rp *= 1 + rpR;
    s60 *= 1 + s6040R;
    eq *= 1 + eqR;
    pts.push({ year: yr, riskParity: +rp.toFixed(2), sixtyForty: +s60.toFixed(2), allEquity: +eq.toFixed(2) });
  }
  return pts;
})();

const METRICS = [
  { label: "Vol Target", value: "10%", icon: Activity, description: "Portfolio volatility target, achieved via leverage" },
  { label: "Leverage Ratio", value: "1.4×", icon: Zap, description: "Gross leverage to scale up low-vol assets to target" },
  { label: "Diversification Ratio", value: "2.31", icon: Scale, description: "Weighted avg asset vol / portfolio vol" },
  { label: "Portfolio Sharpe", value: "0.71", icon: TrendingUp, description: "Risk-adjusted return vs a simple 60/40 (0.52)" },
];

// ── Donut Chart ───────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const cx = 120, cy = 120, r = 90, strokeW = 32;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const [hovered, setHovered] = useState<number | null>(null);

  const slices = data.map((d, i) => {
    const dash = (d.value / 100) * circumference;
    const gap = circumference - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return { ...slice, index: i };
  });

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
      {slices.map((sl) => (
        <circle
          key={sl.label}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={sl.color}
          strokeWidth={hovered === sl.index ? strokeW + 6 : strokeW}
          strokeDasharray={`${sl.dash} ${sl.gap}`}
          strokeDashoffset={-sl.offset + circumference * 0.25}
          style={{ transition: "stroke-width 0.2s", cursor: "pointer" }}
          onMouseEnter={() => setHovered(sl.index)}
          onMouseLeave={() => setHovered(null)}
          strokeLinecap="butt"
        />
      ))}
      {hovered !== null ? (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
            {slices[hovered].value.toFixed(1)}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="10">
            {slices[hovered].label}
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            Equal Risk
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="11">
            Contribution
          </text>
        </>
      )}
    </svg>
  );
}

// ── Grouped Bar Chart (Capital vs Risk) ───────────────────────────────────────

function WeightVsRiskChart({ assets }: { assets: AssetClass[] }) {
  const W = 520, H = 220, padL = 90, padB = 36, padT = 16, padR = 16;
  const innerW = W - padL - padR;
  const innerH = H - padB - padT;
  const maxVal = 45;
  const barW = (innerW / assets.length) * 0.38;
  const groupW = innerW / assets.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y gridlines */}
      {[0, 10, 20, 30, 40].map((v) => {
        const y = padT + innerH - (v / maxVal) * innerH;
        return (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#334155" strokeDasharray="3 3" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fill="#64748b" fontSize="9">{v}%</text>
          </g>
        );
      })}
      {assets.map((a, i) => {
        const cx = padL + i * groupW + groupW / 2;
        const capH = (a.capitalWeight / maxVal) * innerH;
        const rkH = (a.riskWeight / maxVal) * innerH;
        const capY = padT + innerH - capH;
        const rkY = padT + innerH - rkH;
        return (
          <g key={a.name}>
            {/* Capital bar */}
            <rect x={cx - barW - 2} y={capY} width={barW} height={capH} fill={a.color} opacity={0.55} rx={2} />
            {/* Risk bar */}
            <rect x={cx + 2} y={rkY} width={barW} height={rkH} fill={a.color} opacity={0.9} rx={2} />
            <text x={cx} y={H - 8} textAnchor="middle" fill="#94a3b8" fontSize="8">{a.ticker}</text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={padL} y={padT} width={10} height={10} fill="#94a3b8" opacity={0.55} rx={1} />
      <text x={padL + 13} y={padT + 9} fill="#94a3b8" fontSize="9">Capital Weight</text>
      <rect x={padL + 90} y={padT} width={10} height={10} fill="#94a3b8" opacity={0.9} rx={1} />
      <text x={padL + 103} y={padT + 9} fill="#94a3b8" fontSize="9">Risk Weight</text>
    </svg>
  );
}

// ── Equity Curve Chart ─────────────────────────────────────────────────────────

function EquityCurveChart({ data }: { data: BacktestPoint[] }) {
  const W = 560, H = 240, padL = 56, padB = 28, padT = 16, padR = 16;
  const innerW = W - padL - padR;
  const innerH = H - padB - padT;
  const allVals = data.flatMap(d => [d.riskParity, d.sixtyForty, d.allEquity]);
  const minV = Math.min(...allVals) * 0.92;
  const maxV = Math.max(...allVals) * 1.05;
  const range = maxV - minV;

  const toX = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - ((v - minV) / range) * innerH;

  const mkPath = (key: keyof BacktestPoint) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d[key] as number)}`).join(" ");

  const yTicks = [100, 200, 400, 800];
  const years = data.filter((_, i) => i % 4 === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {yTicks.map(v => {
        const y = toY(v);
        if (y < padT || y > padT + innerH) return null;
        return (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize="9">{v}</text>
          </g>
        );
      })}
      {years.map(d => {
        const i = data.indexOf(d);
        const x = toX(i);
        return (
          <text key={d.year} x={x} y={H - 6} textAnchor="middle" fill="#64748b" fontSize="9">{d.year}</text>
        );
      })}
      <path d={mkPath("allEquity")} fill="none" stroke="#475569" strokeWidth={1.5} strokeDasharray="4 2" />
      <path d={mkPath("sixtyForty")} fill="none" stroke="#06b6d4" strokeWidth={1.5} />
      <path d={mkPath("riskParity")} fill="none" stroke="#6366f1" strokeWidth={2.5} />
      {/* Legend */}
      <line x1={padL} x2={padL + 20} y1={padT + 4} y2={padT + 4} stroke="#6366f1" strokeWidth={2.5} />
      <text x={padL + 24} y={padT + 8} fill="#94a3b8" fontSize="9">Risk Parity</text>
      <line x1={padL + 88} x2={padL + 108} y1={padT + 4} y2={padT + 4} stroke="#06b6d4" strokeWidth={1.5} />
      <text x={padL + 112} y={padT + 8} fill="#94a3b8" fontSize="9">60/40</text>
      <line x1={padL + 148} x2={padL + 168} y1={padT + 4} y2={padT + 4} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={padL + 172} y={padT + 8} fill="#94a3b8" fontSize="9">All-Equity</text>
    </svg>
  );
}

// ── Leverage Slider ───────────────────────────────────────────────────────────

function LeverageDisplay() {
  const [volTarget, setVolTarget] = useState(10);
  const portfolioNatVol = 7.1; // unlevered
  const leverage = (volTarget / portfolioNatVol).toFixed(2);
  const margin = (100 / parseFloat(leverage)).toFixed(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Volatility Target</span>
        <span className="font-mono font-bold text-lg">{volTarget}%</span>
      </div>
      <input
        type="range" min={5} max={18} step={0.5}
        value={volTarget}
        onChange={e => setVolTarget(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground mb-1">Leverage</div>
          <div className="font-mono font-bold text-primary">{leverage}×</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground mb-1">Margin Used</div>
          <div className="font-mono font-medium text-muted-foreground">{margin}%</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground mb-1">Unlevered Vol</div>
          <div className="font-mono font-medium text-muted-foreground">{portfolioNatVol}%</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        The unlevered Risk Parity portfolio has a natural volatility of ~{portfolioNatVol}%.
        To hit the {volTarget}% vol target, we apply {leverage}× leverage—primarily via
        Treasury futures and total return swaps on bond positions.
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RiskParityPage() {
  const [expandedAsset, setExpandedAsset] = useState<number | null>(null);

  const donutData = useMemo(() =>
    ASSETS.map(a => ({ label: a.name, value: a.riskWeight, color: a.color })),
    []
  );

  const sortedAssets = ASSETS;

  const drawdownStats = useMemo(() => {
    let maxRp = 0, maxS60 = 0, maxEq = 0;
    let ddRp = 0, ddS60 = 0, ddEq = 0;
    BACKTEST.forEach(d => {
      maxRp = Math.max(maxRp, d.riskParity);
      maxS60 = Math.max(maxS60, d.sixtyForty);
      maxEq = Math.max(maxEq, d.allEquity);
      ddRp = Math.max(ddRp, (maxRp - d.riskParity) / maxRp);
      ddS60 = Math.max(ddS60, (maxS60 - d.sixtyForty) / maxS60);
      ddEq = Math.max(ddEq, (maxEq - d.allEquity) / maxEq);
    });
    return {
      rp: (ddRp * 100).toFixed(1),
      s60: (ddS60 * 100).toFixed(1),
      eq: (ddEq * 100).toFixed(1),
    };
  }, []);

  const finalValues = BACKTEST[BACKTEST.length - 1];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Risk Parity Portfolio</h1>
            <p className="text-sm text-muted-foreground">
              Equal risk contribution across asset classes — Bridgewater All-Weather style
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge variant="outline" className="text-primary border-primary/40">All-Weather</Badge>
            <Badge variant="outline" className="text-muted-foreground border-cyan-400/40">Leveraged</Badge>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {METRICS.map((m, i) => (
          <Card key={m.label} className="border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-bold font-mono mt-0.5">{m.value}</p>
                </div>
                <m.icon className="w-5 h-5 text-primary mt-0.5" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-tight">{m.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="construction">
          <TabsList className="mb-4">
            <TabsTrigger value="construction">Construction</TabsTrigger>
            <TabsTrigger value="riskbudget">Risk Budget</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* ── Construction ── */}
          <TabsContent value="construction" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Donut */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Equal Risk Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={donutData} />
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    {ASSETS.map(a => (
                      <div key={a.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                        <span className="text-muted-foreground">{a.name}</span>
                        <span className="ml-auto font-mono">{a.riskWeight.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Capital vs Risk */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Capital Weight vs Risk Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WeightVsRiskChart assets={ASSETS} />
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Bonds receive outsized capital allocation because their volatility is lower.
                    Risk contribution, however, is equal — each asset contributes ~16.7% of total portfolio risk.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Leverage mechanism */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Volatility-Targeting Mechanism
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeverageDisplay />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Risk Budget ── */}
          <TabsContent value="riskbudget" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Asset Class Risk Budget Detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 pr-3">Asset</th>
                        <th className="text-right py-2 px-2">Capital Wt</th>
                        <th className="text-right py-2 px-2">Ann. Vol</th>
                        <th className="text-right py-2 px-2">Risk Contrib</th>
                        <th className="text-right py-2 px-2">Corr to Port</th>
                        <th className="text-right py-2 pl-2">Risk Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAssets.map((a, i) => (
                        <>
                          <tr
                            key={a.name}
                            className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() => setExpandedAsset(expandedAsset === i ? null : i)}
                          >
                            <td className="py-2 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                                <span className="font-medium">{a.name}</span>
                                <Badge variant="outline" className="text-[11px] py-0 px-1">{a.ticker}</Badge>
                                {expandedAsset === i
                                  ? <ChevronUp className="w-3 h-3 text-muted-foreground ml-auto" />
                                  : <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" />
                                }
                              </div>
                            </td>
                            <td className="text-right py-2 px-2 font-mono">{a.capitalWeight}%</td>
                            <td className="text-right py-2 px-2 font-mono">{a.vol.toFixed(1)}%</td>
                            <td className="text-right py-2 px-2 font-mono text-primary">{a.riskWeight.toFixed(1)}%</td>
                            <td className="text-right py-2 px-2 font-mono">
                              <span className={a.corrToPort < 0 ? "text-emerald-400" : "text-muted-foreground"}>
                                {a.corrToPort > 0 ? "+" : ""}{a.corrToPort.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-right py-2 pl-2 w-24">
                              <div className="flex justify-end">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${a.riskWeight}%`, backgroundColor: a.color }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                          {expandedAsset === i && (
                            <tr key={`${a.name}-detail`} className="bg-muted/20">
                              <td colSpan={6} className="px-4 py-3">
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Leveraged Weight</span>
                                    <div className="font-mono font-semibold mt-0.5">{a.leveragedWeight}%</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Ann. Return</span>
                                    <div className="font-mono font-semibold mt-0.5 text-emerald-400">{a.annReturn}%</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Sharpe Ratio</span>
                                    <div className="font-mono font-semibold mt-0.5">{a.sharpe.toFixed(2)}</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Risk contribution formula */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Equal Risk Contribution Formula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <div className="bg-muted/40 rounded-lg p-4 font-mono text-center text-sm text-foreground">
                  RC_i = w_i × (Σw)_i / σ_p
                </div>
                <p>
                  Where <span className="text-foreground">RC_i</span> is the risk contribution of asset i,
                  <span className="text-foreground"> w_i</span> is its weight,
                  <span className="text-foreground"> (Σw)_i</span> is the marginal risk contribution (∂σ_p/∂w_i × σ_p),
                  and <span className="text-foreground">σ_p</span> is portfolio volatility.
                </p>
                <p>
                  The ERC condition requires all RC_i = RC_j for i ≠ j, achieved via numerical
                  optimisation (Newton-Raphson or gradient descent). Assets with lower volatility
                  receive higher capital weights to equalise their risk contribution.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Performance ── */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Backtest Equity Curve 2000–2024 (Base 100)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EquityCurveChart data={BACKTEST} />
                <div className="grid grid-cols-3 gap-3 mt-4 text-xs text-center">
                  {[
                    { label: "Risk Parity", value: finalValues.riskParity.toFixed(0), color: "text-primary" },
                    { label: "60/40", value: finalValues.sixtyForty.toFixed(0), color: "text-muted-foreground" },
                    { label: "All-Equity", value: finalValues.allEquity.toFixed(0), color: "text-muted-foreground" },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg bg-muted/40 p-2">
                      <div className="text-muted-foreground">{s.label}</div>
                      <div className={`font-mono font-medium text-base ${s.color}`}>{s.value}</div>
                      <div className="text-muted-foreground text-xs">final value</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Max Drawdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Risk Parity", dd: drawdownStats.rp, color: "#6366f1" },
                    { label: "60/40", dd: drawdownStats.s60, color: "#06b6d4" },
                    { label: "All-Equity", dd: drawdownStats.eq, color: "#475569" },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-mono text-red-400">-{row.dd}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.dd}%`, backgroundColor: row.color }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Key Statistics (2000–2024)</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left py-1">Metric</th>
                        <th className="text-right py-1 text-primary">Risk Parity</th>
                        <th className="text-right py-1 text-muted-foreground">60/40</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      {[
                        { metric: "Ann. Return", rp: "7.4%", s60: "6.1%" },
                        { metric: "Ann. Vol", rp: "9.8%", s60: "11.2%" },
                        { metric: "Sharpe", rp: "0.71", s60: "0.52" },
                        { metric: "Sortino", rp: "1.04", s60: "0.73" },
                        { metric: "Calmar", rp: "0.61", s60: "0.38" },
                      ].map(r => (
                        <tr key={r.metric} className="border-b border-border/30">
                          <td className="py-1.5 text-muted-foreground">{r.metric}</td>
                          <td className="py-1.5 text-right font-mono text-primary">{r.rp}</td>
                          <td className="py-1.5 text-right font-mono text-muted-foreground">{r.s60}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Comparison ── */}
          <TabsContent value="comparison" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Risk Parity vs Alternatives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2">Strategy</th>
                        <th className="text-right py-2">Sharpe</th>
                        <th className="text-right py-2">Max DD</th>
                        <th className="text-right py-2">Leverage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Risk Parity", sharpe: "0.71", dd: `-${drawdownStats.rp}%`, lev: "1.4×", highlight: true },
                        { name: "60/40 Portfolio", sharpe: "0.52", dd: `-${drawdownStats.s60}%`, lev: "1.0×", highlight: false },
                        { name: "All-Equity", sharpe: "0.47", dd: `-${drawdownStats.eq}%`, lev: "1.0×", highlight: false },
                        { name: "Equal Weight", sharpe: "0.59", dd: "-34.2%", lev: "1.0×", highlight: false },
                        { name: "Min Variance", sharpe: "0.65", dd: "-22.1%", lev: "1.0×", highlight: false },
                        { name: "Max Diversif.", sharpe: "0.68", dd: "-18.9%", lev: "1.1×", highlight: false },
                      ].map(r => (
                        <tr
                          key={r.name}
                          className={`border-b border-border/40 ${r.highlight ? "bg-primary/5" : ""}`}
                        >
                          <td className="py-1.5 font-medium">{r.name}</td>
                          <td className={`py-1.5 text-right font-mono ${r.highlight ? "text-primary" : ""}`}>{r.sharpe}</td>
                          <td className="py-1.5 text-right font-mono text-red-400">{r.dd}</td>
                          <td className="py-1.5 text-right font-mono">{r.lev}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Regime Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        regime: "Growth + Low Inflation",
                        rp: "+9.2%",
                        s60: "+12.4%",
                        note: "60/40 wins — equities dominate",
                        color: "text-emerald-400",
                      },
                      {
                        regime: "Growth + High Inflation",
                        rp: "+6.8%",
                        s60: "+2.1%",
                        note: "RP wins — commodities lift returns",
                        color: "text-emerald-400",
                      },
                      {
                        regime: "Recession + Deflation",
                        rp: "+4.1%",
                        s60: "-5.4%",
                        note: "RP wins — bonds rally, gold holds",
                        color: "text-emerald-400",
                      },
                      {
                        regime: "Recession + Stagflation",
                        rp: "-3.2%",
                        s60: "-14.7%",
                        note: "Both struggle, RP outperforms",
                        color: "text-amber-400",
                      },
                      {
                        regime: "Rate Spike (2022)",
                        rp: "-18.1%",
                        s60: "-16.1%",
                        note: "Rare loss when bonds & equities fall",
                        color: "text-red-400",
                      },
                    ].map(r => (
                      <div key={r.regime} className="rounded-lg border border-border/50 p-2.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium">{r.regime}</span>
                          <div className="flex gap-3 text-xs font-mono text-right">
                            <div>
                              <div className="text-muted-foreground text-xs">RP</div>
                              <div className={r.rp.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{r.rp}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-xs">60/40</div>
                              <div className={r.s60.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{r.s60}</div>
                            </div>
                          </div>
                        </div>
                        <p className={`text-xs mt-1 ${r.color}`}>{r.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Key Risks &amp; Critiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  {[
                    {
                      title: "Leverage Risk",
                      desc: "Borrowing amplifies drawdowns in tail events. Margin calls during 2008 forced de-leveraging at worst prices.",
                      badge: "Critical",
                      badgeColor: "text-red-400 border-red-400/40",
                    },
                    {
                      title: "Bond Headwind",
                      desc: "Strategy relies on negative equity-bond correlation. Post-2021 rate spikes broke this relationship, causing unprecedented joint drawdowns.",
                      badge: "Major",
                      badgeColor: "text-amber-400 border-amber-400/40",
                    },
                    {
                      title: "Financing Cost",
                      desc: "At 1.4× leverage, borrowing cost reduces net returns by ~1.5% p.a. depending on rates. High-rate environments compress alpha.",
                      badge: "Moderate",
                      badgeColor: "text-yellow-400 border-yellow-400/40",
                    },
                    {
                      title: "Vol Estimation",
                      desc: "Weights based on realised volatility are backward-looking. Volatility regime changes cause portfolio to temporarily deviate from target risk.",
                      badge: "Moderate",
                      badgeColor: "text-yellow-400 border-yellow-400/40",
                    },
                  ].map(r => (
                    <div key={r.title} className="rounded-lg bg-muted/30 p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{r.title}</span>
                        <Badge variant="outline" className={`text-[11px] py-0 ${r.badgeColor}`}>{r.badge}</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{r.desc}</p>
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
