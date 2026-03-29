"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  TrendingUp,
  Shield,
  Zap,
  AlertTriangle,
  BarChart3,
  Calculator,
  Layers,
  Lock,
  ArrowRight,
  DollarSign,
  Percent,
  Activity,
  RefreshCw,
  Globe,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 775;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate noise to avoid mutation during render
const NOISE = Array.from({ length: 300 }, () => rand());

// ── Types ─────────────────────────────────────────────────────────────────────
interface Protocol {
  name: string;
  type: "DEX" | "Lending" | "Aggregator" | "Staking";
  tvl: number;
  apyLow: number;
  apyHigh: number;
  risk: "Low" | "Medium" | "High" | "Very High";
  chain: string;
  token: string;
  audited: boolean;
}

interface YieldPoint {
  month: number;
  staking: number;
  lp: number;
  lending: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────
const PROTOCOLS: Protocol[] = [
  { name: "Aave", type: "Lending", tvl: 12.4, apyLow: 2.1, apyHigh: 8.5, risk: "Low", chain: "Ethereum", token: "AAVE", audited: true },
  { name: "Uniswap V3", type: "DEX", tvl: 5.8, apyLow: 5.0, apyHigh: 45.0, risk: "Medium", chain: "Ethereum", token: "UNI", audited: true },
  { name: "Curve Finance", type: "DEX", tvl: 4.2, apyLow: 3.5, apyHigh: 12.0, risk: "Low", chain: "Ethereum", token: "CRV", audited: true },
  { name: "Compound", type: "Lending", tvl: 3.1, apyLow: 1.8, apyHigh: 6.2, risk: "Low", chain: "Ethereum", token: "COMP", audited: true },
  { name: "Yearn Finance", type: "Aggregator", tvl: 0.9, apyLow: 4.0, apyHigh: 18.5, risk: "Medium", chain: "Ethereum", token: "YFI", audited: true },
  { name: "Lido", type: "Staking", tvl: 22.1, apyLow: 3.8, apyHigh: 4.2, risk: "Low", chain: "Ethereum", token: "LDO", audited: true },
  { name: "Convex Finance", type: "Aggregator", tvl: 3.6, apyLow: 6.0, apyHigh: 22.0, risk: "Medium", chain: "Ethereum", token: "CVX", audited: true },
  { name: "PancakeSwap", type: "DEX", tvl: 2.3, apyLow: 8.0, apyHigh: 60.0, risk: "High", chain: "BNB Chain", token: "CAKE", audited: true },
  { name: "Balancer", type: "DEX", tvl: 1.1, apyLow: 4.5, apyHigh: 25.0, risk: "Medium", chain: "Ethereum", token: "BAL", audited: true },
  { name: "Alpaca Finance", type: "Aggregator", tvl: 0.4, apyLow: 15.0, apyHigh: 85.0, risk: "Very High", chain: "BNB Chain", token: "ALPACA", audited: false },
];

const RISK_COLORS: Record<string, string> = {
  Low: "text-emerald-400",
  Medium: "text-yellow-400",
  High: "text-orange-400",
  "Very High": "text-red-400",
};

const RISK_BG: Record<string, string> = {
  Low: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  Medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  High: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  "Very High": "bg-red-400/10 text-red-400 border-red-400/20",
};

const TYPE_COLORS: Record<string, string> = {
  DEX: "bg-primary/10 text-primary border-border",
  Lending: "bg-primary/10 text-primary border-border",
  Aggregator: "bg-cyan-400/10 text-muted-foreground border-cyan-400/20",
  Staking: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

// ── Yield simulation helper ───────────────────────────────────────────────────
function simulateYield(principal: number, months: number): YieldPoint[] {
  const stakingAPY = 0.042;
  const lpAPY = 0.22;
  const lendingAPY = 0.065;
  const points: YieldPoint[] = [];
  for (let m = 0; m <= months; m++) {
    const t = m / 12;
    points.push({
      month: m,
      staking: principal * Math.pow(1 + stakingAPY, t),
      lp: principal * Math.pow(1 + lpAPY, t),
      lending: principal * Math.pow(1 + lendingAPY, t),
    });
  }
  return points;
}

// ── Impermanent Loss formula ──────────────────────────────────────────────────
function calcIL(priceRatio: number): number {
  // IL = 2*sqrt(r)/(1+r) - 1
  const r = priceRatio;
  return (2 * Math.sqrt(r)) / (1 + r) - 1;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="border-border bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Protocol Table ────────────────────────────────────────────────────────────
function ProtocolTable() {
  const [sortKey, setSortKey] = useState<keyof Protocol>("tvl");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...PROTOCOLS].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [sortKey, sortAsc]);

  function handleSort(k: keyof Protocol) {
    if (k === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(k); setSortAsc(false); }
  }

  function SortIcon({ k }: { k: keyof Protocol }) {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="inline w-3 h-3 ml-1" /> : <ChevronDown className="inline w-3 h-3 ml-1" />;
  }

  const maxTvl = Math.max(...PROTOCOLS.map((p) => p.tvl));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Protocol Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                {(
                  [
                    ["name", "Protocol"],
                    ["type", "Type"],
                    ["tvl", "TVL ($B)"],
                    ["apyLow", "APY Range"],
                    ["risk", "Risk"],
                    ["chain", "Chain"],
                  ] as [keyof Protocol, string][]
                ).map(([k, label]) => (
                  <th
                    key={k}
                    className="px-4 py-3 text-left cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort(k)}
                  >
                    {label}
                    <SortIcon k={k} />
                  </th>
                ))}
                <th className="px-4 py-3 text-left">Audited</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr
                  key={p.name}
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs ${TYPE_COLORS[p.type]}`}>
                      {p.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-semibold">${p.tvl.toFixed(1)}B</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(p.tvl / maxTvl) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.apyLow}% – {p.apyHigh}%
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs ${RISK_BG[p.risk]}`}>
                      {p.risk}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {p.chain}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.audited ? (
                      <span className="text-emerald-400 text-xs font-medium">✓ Yes</span>
                    ) : (
                      <span className="text-red-400 text-xs font-medium">✗ No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Strategies Tab ─────────────────────────────────────────────────────────────
function StrategiesTab() {
  const [principal, setPrincipal] = useState(10000);
  const months = 24;
  const points = useMemo(() => simulateYield(principal, months), [principal]);

  const W = 560;
  const H = 240;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;

  const allVals = points.flatMap((p) => [p.staking, p.lp, p.lending]);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);

  function xPos(m: number) {
    return padL + ((m / months) * (W - padL - padR));
  }
  function yPos(v: number) {
    return padT + ((1 - (v - minV) / (maxV - minV)) * (H - padT - padB));
  }
  function toPath(vals: number[]) {
    return vals
      .map((v, i) => `${i === 0 ? "M" : "L"}${xPos(i)},${yPos(v)}`)
      .join(" ");
  }

  const lastStaking = points[months].staking;
  const lastLp = points[months].lp;
  const lastLending = points[months].lending;

  const yTicks = 5;
  const yStep = (maxV - minV) / yTicks;

  // Flow diagram steps
  const flowSteps = [
    { icon: DollarSign, label: "Acquire\nAssets", color: "bg-primary/20 border-primary/40 text-primary" },
    { icon: Lock, label: "Deposit to\nProtocol", color: "bg-primary/20 border-primary/40 text-primary" },
    { icon: RefreshCw, label: "Earn\nRewards", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" },
    { icon: Zap, label: "Compound\nYield", color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" },
    { icon: TrendingUp, label: "Reinvest\nProfits", color: "bg-cyan-500/20 border-cyan-500/40 text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      {/* Simulator */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Yield Strategy Simulator (24 months)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Principal slider */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground w-28">Principal:</span>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-semibold text-foreground w-24 text-right">
              ${principal.toLocaleString()}
            </span>
          </div>

          {/* Legend */}
          <div className="flex gap-6 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" /> ETH Staking (4.2%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> LP Farming (22%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Lending (6.5%)</span>
          </div>

          {/* SVG line chart */}
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" style={{ height: H }}>
              {/* Grid */}
              {Array.from({ length: yTicks + 1 }, (_, i) => {
                const val = minV + i * yStep;
                const y = yPos(val);
                return (
                  <g key={i}>
                    <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#ffffff15" strokeWidth="1" />
                    <text x={padL - 6} y={y + 4} textAnchor="end" fill="#888" fontSize="9">
                      ${(val / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}
              {/* X axis ticks */}
              {[0, 6, 12, 18, 24].map((m) => (
                <g key={m}>
                  <line x1={xPos(m)} y1={H - padB} x2={xPos(m)} y2={H - padB + 4} stroke="#555" strokeWidth="1" />
                  <text x={xPos(m)} y={H - padB + 14} textAnchor="middle" fill="#888" fontSize="9">
                    {m}m
                  </text>
                </g>
              ))}
              {/* Axis lines */}
              <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#444" strokeWidth="1" />
              <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#444" strokeWidth="1" />

              {/* Lines */}
              <path d={toPath(points.map((p) => p.staking))} fill="none" stroke="#34d399" strokeWidth="2" />
              <path d={toPath(points.map((p) => p.lp))} fill="none" stroke="#a78bfa" strokeWidth="2" />
              <path d={toPath(points.map((p) => p.lending))} fill="none" stroke="#60a5fa" strokeWidth="2" />

              {/* End dots */}
              <circle cx={xPos(months)} cy={yPos(lastStaking)} r="4" fill="#34d399" />
              <circle cx={xPos(months)} cy={yPos(lastLp)} r="4" fill="#a78bfa" />
              <circle cx={xPos(months)} cy={yPos(lastLending)} r="4" fill="#60a5fa" />
            </svg>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "ETH Staking", val: lastStaking, color: "text-emerald-400", pct: ((lastStaking / principal - 1) * 100).toFixed(1) },
              { label: "LP Farming", val: lastLp, color: "text-primary", pct: ((lastLp / principal - 1) * 100).toFixed(1) },
              { label: "Lending", val: lastLending, color: "text-primary", pct: ((lastLending / principal - 1) * 100).toFixed(1) },
            ].map(({ label, val, color, pct }) => (
              <div key={label} className="bg-muted/20 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>${Math.round(val).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">+{pct}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Yield Farming Flow Diagram */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Yield Farming Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`border rounded-xl p-3 text-center min-w-[80px] ${step.color}`}>
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs font-medium whitespace-pre-line leading-tight">{step.label}</p>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {[
              { title: "Liquidity Mining", desc: "Provide token pairs to DEX pools and earn trading fees + protocol tokens as rewards. High APY but exposed to impermanent loss.", color: "border-border" },
              { title: "Yield Aggregators", desc: "Auto-compound strategies across multiple protocols. Saves gas, maximizes compounding frequency, managed risk.", color: "border-cyan-400/30" },
              { title: "Lending Protocols", desc: "Supply assets to earn interest from borrowers. Lower risk than LP, predictable yield, no IL exposure.", color: "border-border" },
            ].map(({ title, desc, color }) => (
              <div key={title} className={`border ${color} rounded-lg p-3 bg-muted/10`}>
                <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Risk Analysis Tab ─────────────────────────────────────────────────────────
function RiskAnalysisTab() {
  // IL Calculator
  const [priceChange, setPriceChange] = useState(50); // % change

  const ratio = (100 + priceChange) / 100;
  const ilPct = Math.abs(calcIL(ratio) * 100);
  const hodlVal = (1 + priceChange / 100) * 5000 + 5000; // 50/50 split of $10k
  const lpVal = hodlVal * (1 - ilPct / 100);
  const ilDollar = hodlVal - lpVal;

  // IL chart
  const ilPoints: { x: number; y: number }[] = [];
  for (let pct = -90; pct <= 400; pct += 10) {
    const r = (100 + pct) / 100;
    if (r <= 0) continue;
    const il = Math.abs(calcIL(r) * 100);
    ilPoints.push({ x: pct, y: il });
  }
  const ILW = 480, ILH = 200, ILP = { l: 50, r: 20, t: 15, b: 35 };
  const xMin = -90, xMax = 400, yMin = 0, yMax = 50;
  const ilXPos = (v: number) => ILP.l + ((v - xMin) / (xMax - xMin)) * (ILW - ILP.l - ILP.r);
  const ilYPos = (v: number) => ILP.t + ((1 - v / yMax) * (ILH - ILP.t - ILP.b));
  const ilPath = ilPoints.map((p, i) => `${i === 0 ? "M" : "L"}${ilXPos(p.x)},${ilYPos(p.y)}`).join(" ");
  const currentX = ilXPos(priceChange);
  const currentY = ilYPos(ilPct);

  // Risk Radar
  const strategies = [
    { name: "ETH Staking", sc: 20, liq: 10, reg: 30, il: 0, apy: 4.2 },
    { name: "Stablecoin LP", sc: 35, liq: 15, reg: 40, il: 5, apy: 8.0 },
    { name: "ETH/USDC LP", sc: 45, liq: 25, reg: 40, il: 35, apy: 22.0 },
    { name: "Leveraged Farm", sc: 55, liq: 75, reg: 50, il: 50, apy: 45.0 },
  ];
  const [selectedStrat, setSelectedStrat] = useState(0);
  const strat = strategies[selectedStrat];

  const radarCategories = [
    { label: "Smart Contract", value: strat.sc },
    { label: "Liquidation", value: strat.liq },
    { label: "Regulatory", value: strat.reg },
    { label: "IL Risk", value: strat.il },
  ];

  const RW = 260, RH = 260;
  const cx = RW / 2, cy = RH / 2, maxR = 95;
  const numAxes = radarCategories.length;
  function radarPoint(idx: number, val: number) {
    const angle = (idx / numAxes) * 2 * Math.PI - Math.PI / 2;
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }
  const radarPolygon = radarCategories
    .map((c, i) => {
      const p = radarPoint(i, c.value);
      return `${p.x},${p.y}`;
    })
    .join(" ");
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="space-y-6">
      {/* IL Calculator */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" /> Impermanent Loss Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground w-40">Token A price change:</span>
            <input
              type="range"
              min={-80}
              max={400}
              step={5}
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-semibold text-foreground w-16 text-right">
              {priceChange > 0 ? "+" : ""}{priceChange}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">IL %</p>
              <p className="text-xl font-bold text-red-400">-{ilPct.toFixed(2)}%</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">HODL Value</p>
              <p className="text-xl font-bold text-foreground">${Math.round(hodlVal).toLocaleString()}</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">LP Loss vs HODL</p>
              <p className="text-xl font-bold text-orange-400">-${Math.round(ilDollar).toLocaleString()}</p>
            </div>
          </div>

          {/* IL SVG chart */}
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${ILW} ${ILH}`} style={{ height: ILH }} className="w-full max-w-xl">
              {/* Grid lines */}
              {[0, 10, 20, 30, 40, 50].map((v) => (
                <g key={v}>
                  <line x1={ILP.l} y1={ilYPos(v)} x2={ILW - ILP.r} y2={ilYPos(v)} stroke="#ffffff12" strokeWidth="1" />
                  <text x={ILP.l - 6} y={ilYPos(v) + 4} textAnchor="end" fill="#777" fontSize="9">{v}%</text>
                </g>
              ))}
              {[-80, -50, 0, 100, 200, 300, 400].map((v) => (
                <g key={v}>
                  <line x1={ilXPos(v)} y1={ILP.t} x2={ilXPos(v)} y2={ILH - ILP.b} stroke="#ffffff10" strokeWidth="1" />
                  <text x={ilXPos(v)} y={ILH - ILP.b + 14} textAnchor="middle" fill="#777" fontSize="8">{v}%</text>
                </g>
              ))}
              {/* Axes */}
              <line x1={ILP.l} y1={ILP.t} x2={ILP.l} y2={ILH - ILP.b} stroke="#444" strokeWidth="1" />
              <line x1={ILP.l} y1={ILH - ILP.b} x2={ILW - ILP.r} y2={ILH - ILP.b} stroke="#444" strokeWidth="1" />
              {/* Zero price line */}
              <line x1={ilXPos(0)} y1={ILP.t} x2={ilXPos(0)} y2={ILH - ILP.b} stroke="#ffffff30" strokeWidth="1" strokeDasharray="3,3" />
              {/* IL curve */}
              <path d={ilPath} fill="none" stroke="#f97316" strokeWidth="2" />
              {/* Shaded area */}
              <path
                d={`${ilPath} L${ilXPos(ilPoints[ilPoints.length - 1].x)},${ilYPos(0)} L${ilXPos(ilPoints[0].x)},${ilYPos(0)} Z`}
                fill="rgba(249,115,22,0.08)"
              />
              {/* Current point */}
              {priceChange >= -80 && priceChange <= 400 && (
                <>
                  <line x1={currentX} y1={ILP.t} x2={currentX} y2={ILH - ILP.b} stroke="#f97316" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                  <circle cx={currentX} cy={currentY} r="5" fill="#f97316" />
                  <rect x={currentX + 6} y={currentY - 14} width={52} height={16} rx="3" fill="#1a1a1a" />
                  <text x={currentX + 32} y={currentY - 3} textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="bold">IL: {ilPct.toFixed(1)}%</text>
                </>
              )}
              {/* Labels */}
              <text x={(ILW + ILP.l) / 2} y={ILH - 2} textAnchor="middle" fill="#666" fontSize="9">Token Price Change (%)</text>
              <text x={8} y={ILH / 2} textAnchor="middle" fill="#666" fontSize="9" transform={`rotate(-90, 8, ${ILH / 2})`}>IL (%)</text>
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on 50/50 ETH/USDC pool. IL is only realized when you withdraw. Fees can often offset IL at sufficient trading volume.
          </p>
        </CardContent>
      </Card>

      {/* Risk Radar */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Risk Radar by Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            {strategies.map((st, i) => (
              <Button
                key={st.name}
                variant={selectedStrat === i ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrat(i)}
                className="text-xs"
              >
                {st.name}
              </Button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <svg viewBox={`0 0 ${RW} ${RH}`} style={{ width: RW, height: RH }} className="shrink-0">
              {/* Grid rings */}
              {gridLevels.map((level) => {
                const pts = radarCategories
                  .map((_, i) => {
                    const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
                    const r = (level / 100) * maxR;
                    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                  })
                  .join(" ");
                return (
                  <polygon key={level} points={pts} fill="none" stroke="#333" strokeWidth="1" />
                );
              })}
              {/* Axis lines */}
              {radarCategories.map((_, i) => {
                const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={cx + maxR * Math.cos(angle)}
                    y2={cy + maxR * Math.sin(angle)}
                    stroke="#444"
                    strokeWidth="1"
                  />
                );
              })}
              {/* Data polygon */}
              <polygon points={radarPolygon} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="2" />
              {radarCategories.map((c, i) => {
                const p = radarPoint(i, c.value);
                return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ef4444" />;
              })}
              {/* Labels */}
              {radarCategories.map((c, i) => {
                const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
                const labelR = maxR + 16;
                const lx = cx + labelR * Math.cos(angle);
                const ly = cy + labelR * Math.sin(angle);
                return (
                  <text
                    key={i}
                    x={lx}
                    y={ly + 4}
                    textAnchor="middle"
                    fill="#aaa"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {c.label}
                  </text>
                );
              })}
              {/* Level labels */}
              {gridLevels.map((level) => (
                <text key={level} x={cx + 3} y={cy - (level / 100) * maxR - 2} fill="#555" fontSize="7">
                  {level}
                </text>
              ))}
            </svg>

            <div className="flex-1 space-y-3">
              <p className="text-sm font-semibold text-foreground">{strat.name}</p>
              <div className="text-2xl font-bold text-emerald-400">{strat.apy}% APY</div>
              {radarCategories.map((c) => (
                <div key={c.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{c.label} Risk</span>
                    <span className={c.value > 60 ? "text-red-400" : c.value > 35 ? "text-yellow-400" : "text-emerald-400"}>
                      {c.value}/100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${c.value > 60 ? "bg-red-400" : c.value > 35 ? "bg-yellow-400" : "bg-emerald-400"}`}
                      style={{ width: `${c.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Yield Calculator Tab ───────────────────────────────────────────────────────
function YieldCalculatorTab() {
  const [amount, setAmount] = useState(5000);
  const [apy, setApy] = useState(12);
  const [compoundFreq, setCompoundFreq] = useState(12); // monthly
  const [years, setYears] = useState(3);

  const n = compoundFreq;
  const r = apy / 100;
  const t = years;
  const compounded = amount * Math.pow(1 + r / n, n * t);
  const simple = amount * (1 + r * t);
  const compoundGain = compounded - amount;
  const simpleGain = simple - amount;
  const extraFromCompounding = compounded - simple;

  // Bar chart: yearly breakdown
  const yearlyData = Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    return {
      year: y,
      compounded: amount * Math.pow(1 + r / n, n * y),
      simple: amount * (1 + r * y),
    };
  });

  const BW = 480, BH = 200;
  const BPAD = { l: 60, r: 20, t: 15, b: 35 };
  const maxBarVal = Math.max(...yearlyData.map((d) => d.compounded));
  const barWidth = ((BW - BPAD.l - BPAD.r) / years) * 0.35;
  const barGap = ((BW - BPAD.l - BPAD.r) / years) * 0.05;
  const groupWidth = (BW - BPAD.l - BPAD.r) / years;

  function barX(i: number, offset: number) {
    return BPAD.l + i * groupWidth + offset;
  }
  function barY(v: number) {
    return BH - BPAD.b - ((v - amount) / (maxBarVal - amount)) * (BH - BPAD.t - BPAD.b);
  }
  function barH(v: number) {
    return BH - BPAD.b - barY(v);
  }

  const freqLabels: Record<number, string> = { 1: "Annual", 4: "Quarterly", 12: "Monthly", 365: "Daily" };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" /> DeFi Yield Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Initial Investment", val: amount, min: 500, max: 500000, step: 500, set: setAmount, fmt: (v: number) => `$${v.toLocaleString()}` },
              { label: "APY (%)", val: apy, min: 1, max: 200, step: 1, set: setApy, fmt: (v: number) => `${v}%` },
              { label: "Time Horizon (years)", val: years, min: 1, max: 10, step: 1, set: setYears, fmt: (v: number) => `${v}yr` },
            ].map(({ label, val, min, max, step, set, fmt }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-semibold">{fmt(val)}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            ))}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Compound Frequency</p>
              <div className="flex gap-2">
                {[1, 4, 12, 365].map((f) => (
                  <button
                    key={f}
                    onClick={() => setCompoundFreq(f)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${compoundFreq === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    {freqLabels[f]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Compounded Value", val: `$${Math.round(compounded).toLocaleString()}`, color: "text-emerald-400" },
              { label: "Simple Interest", val: `$${Math.round(simple).toLocaleString()}`, color: "text-primary" },
              { label: "Compound Gain", val: `+$${Math.round(compoundGain).toLocaleString()}`, color: "text-primary" },
              { label: "Compounding Bonus", val: `+$${Math.round(extraFromCompounding).toLocaleString()}`, color: "text-yellow-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-muted/20 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-base font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Yearly Growth Comparison</p>
            <div className="flex gap-4 text-xs mb-2">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-400/70 rounded inline-block" /> Compounded</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary/50 rounded inline-block" /> Simple</span>
            </div>
            <svg viewBox={`0 0 ${BW} ${BH}`} style={{ height: BH }} className="w-full max-w-xl">
              {[0, 25, 50, 75, 100].map((pct) => {
                const val = amount + (pct / 100) * (maxBarVal - amount);
                const y = barY(val);
                return (
                  <g key={pct}>
                    <line x1={BPAD.l} y1={y} x2={BW - BPAD.r} y2={y} stroke="#ffffff10" strokeWidth="1" />
                    <text x={BPAD.l - 5} y={y + 4} textAnchor="end" fill="#666" fontSize="8">
                      ${(val / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}
              <line x1={BPAD.l} y1={BPAD.t} x2={BPAD.l} y2={BH - BPAD.b} stroke="#444" strokeWidth="1" />
              <line x1={BPAD.l} y1={BH - BPAD.b} x2={BW - BPAD.r} y2={BH - BPAD.b} stroke="#444" strokeWidth="1" />
              {yearlyData.map((d, i) => (
                <g key={i}>
                  {/* Simple bar */}
                  <rect
                    x={barX(i, barGap)}
                    y={barY(d.simple)}
                    width={barWidth}
                    height={barH(d.simple)}
                    fill="rgba(96,165,250,0.5)"
                    rx="2"
                  />
                  {/* Compounded bar */}
                  <rect
                    x={barX(i, barGap + barWidth + 2)}
                    y={barY(d.compounded)}
                    width={barWidth}
                    height={barH(d.compounded)}
                    fill="rgba(52,211,153,0.7)"
                    rx="2"
                  />
                  <text
                    x={barX(i, groupWidth / 2)}
                    y={BH - BPAD.b + 14}
                    textAnchor="middle"
                    fill="#777"
                    fontSize="9"
                  >
                    Yr {d.year}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Tips */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-primary mb-1">DeFi Compounding Tips</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Auto-compounding vaults (Yearn, Beefy) reinvest rewards multiple times per day</li>
              <li>• Higher frequency compounding significantly boosts returns above 20% APY</li>
              <li>• Always account for gas fees — daily compounding may not be cost-efficient on Ethereum mainnet</li>
              <li>• Layer 2 networks (Arbitrum, Optimism) offer similar yields with near-zero gas costs</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Protocol yield comparison heatmap */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Protocol Yield Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {PROTOCOLS.map((p, i) => {
              const midApy = (p.apyLow + p.apyHigh) / 2;
              const intensity = Math.min(midApy / 50, 1);
              const r = Math.round(20 + intensity * 35);
              const g = Math.round(211 * (1 - intensity * 0.6));
              const b = Math.round(153 * (1 - intensity * 0.8));
              const bg = `rgba(${r},${g},${b},0.15)`;
              const border = `rgba(${r},${g},${b},0.4)`;
              return (
                <div
                  key={p.name}
                  className="rounded-lg p-3 text-center border"
                  style={{ backgroundColor: bg, borderColor: border }}
                >
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: `rgb(${r},${g},${b})` }}>
                    {midApy.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{p.type}</p>
                  <div
                    className={`mt-1 text-xs px-1.5 py-0.5 rounded-full border inline-block ${RISK_BG[p.risk]}`}
                  >
                    {p.risk}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DeFiYieldPage() {
  // Memoized key metrics from NOISE
  const metrics = useMemo(
    () => ({
      totalTVL: (55 + NOISE[0] * 15).toFixed(1),
      stablecoinAPY: (8 + NOISE[1] * 7).toFixed(1),
      ethStakingYield: (3.8 + NOISE[2] * 0.6).toFixed(2),
      bestOpportunity: "Convex Finance — 22% APY",
    }),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">DeFi Yield Strategies</h1>
              <p className="text-sm text-muted-foreground">
                Liquidity mining, lending protocols, yield aggregators — maximize returns in decentralized finance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={DollarSign}
            label="Total Value Locked"
            value={`$${metrics.totalTVL}B`}
            sub="Across all DeFi protocols"
            color="bg-primary/10 text-primary"
            delay={0.05}
          />
          <MetricCard
            icon={Percent}
            label="Avg Stablecoin APY"
            value={`${metrics.stablecoinAPY}%`}
            sub="USDC/DAI lending pools"
            color="bg-emerald-400/10 text-emerald-400"
            delay={0.1}
          />
          <MetricCard
            icon={Lock}
            label="ETH Staking Yield"
            value={`${metrics.ethStakingYield}%`}
            sub="Lido / native staking"
            color="bg-primary/10 text-primary"
            delay={0.15}
          />
          <MetricCard
            icon={Zap}
            label="Best Opportunity"
            value="22% APY"
            sub={metrics.bestOpportunity}
            color="bg-yellow-400/10 text-yellow-400"
            delay={0.2}
          />
        </div>

        {/* Alert bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-2 bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-4 py-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-200/80">
            <span className="font-semibold text-yellow-400">Risk Reminder:</span> DeFi protocols carry smart contract risk, impermanent loss, and regulatory uncertainty. Never invest more than you can afford to lose.
          </p>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="protocols">
            <TabsList className="mb-4">
              <TabsTrigger value="protocols" className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Protocols
              </TabsTrigger>
              <TabsTrigger value="strategies" className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Strategies
              </TabsTrigger>
              <TabsTrigger value="risk" className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Risk Analysis
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" /> Yield Calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="protocols" className="data-[state=inactive]:hidden">
              <ProtocolTable />
            </TabsContent>

            <TabsContent value="strategies" className="data-[state=inactive]:hidden">
              <StrategiesTab />
            </TabsContent>

            <TabsContent value="risk" className="data-[state=inactive]:hidden">
              <RiskAnalysisTab />
            </TabsContent>

            <TabsContent value="calculator" className="data-[state=inactive]:hidden">
              <YieldCalculatorTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
