"use client";

import { useState, useMemo, useCallback } from "react";
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
  RefreshCw,
  Lock,
  Info,
  ArrowRight,
  DollarSign,
  Percent,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  GitBranch,
  Cpu,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 632001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values to avoid mutation during render
const NOISE = Array.from({ length: 200 }, () => rand());

// ── Interfaces ────────────────────────────────────────────────────────────────

interface Protocol {
  name: string;
  tvl: number;
  apy: number;
  chain: string;
  audits: number;
  category: string;
  riskScore: number;
  verified: boolean;
}

interface VaultStrategy {
  name: string;
  protocol: string;
  apy: number;
  tvl: number;
  risk: "Low" | "Medium" | "High";
  steps: string[];
}

interface RiskFactor {
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  mitigation: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const PROTOCOLS: Protocol[] = [
  { name: "Uniswap V3", tvl: 4_200_000_000, apy: 12.4, chain: "Ethereum", audits: 7, category: "AMM", riskScore: 18, verified: true },
  { name: "Aave V3", tvl: 8_600_000_000, apy: 4.8, chain: "Multi-chain", audits: 12, category: "Lending", riskScore: 12, verified: true },
  { name: "Compound III", tvl: 2_100_000_000, apy: 5.2, chain: "Ethereum", audits: 9, category: "Lending", riskScore: 15, verified: true },
  { name: "Curve Finance", tvl: 3_800_000_000, apy: 8.1, chain: "Multi-chain", audits: 8, category: "AMM", riskScore: 16, verified: true },
  { name: "Convex Finance", tvl: 2_900_000_000, apy: 14.6, chain: "Ethereum", audits: 5, category: "Yield", riskScore: 24, verified: true },
  { name: "Yearn Finance", tvl: 580_000_000, apy: 9.3, chain: "Ethereum", audits: 6, category: "Yield", riskScore: 22, verified: true },
  { name: "Balancer V2", tvl: 1_200_000_000, apy: 11.7, chain: "Multi-chain", audits: 7, category: "AMM", riskScore: 20, verified: true },
  { name: "Morpho Blue", tvl: 890_000_000, apy: 6.4, chain: "Ethereum", audits: 4, category: "Lending", riskScore: 28, verified: false },
];

const VAULT_STRATEGIES: VaultStrategy[] = [
  {
    name: "USDC Stablecoin Yield",
    protocol: "Yearn + Aave",
    apy: 8.4,
    tvl: 420_000_000,
    risk: "Low",
    steps: ["Deposit USDC into vault", "Auto-allocate to highest-yield Aave markets", "Harvest rewards weekly", "Compound back into position"],
  },
  {
    name: "ETH-USDC LP Boost",
    protocol: "Convex + Curve",
    apy: 18.2,
    tvl: 210_000_000,
    risk: "Medium",
    steps: ["Provide ETH/USDC liquidity to Curve", "Stake LP tokens in Convex", "Earn CRV + CVX rewards", "Auto-compound every 8 hours"],
  },
  {
    name: "Leveraged wstETH",
    protocol: "Aave + Yearn",
    apy: 26.7,
    tvl: 95_000_000,
    risk: "High",
    steps: ["Deposit wstETH as collateral", "Borrow USDC at 70% LTV", "Swap USDC to wstETH", "Loop up to 3x leverage"],
  },
];

const RISK_FACTORS: RiskFactor[] = [
  {
    name: "Smart Contract Exploits",
    severity: "Critical",
    description: "Bugs in contract code can allow attackers to drain funds. Over $3.8B lost in 2022 alone.",
    mitigation: "Only use protocols with 3+ independent audits from reputable firms (Trail of Bits, OpenZeppelin, Certik).",
  },
  {
    name: "Oracle Manipulation",
    severity: "Critical",
    description: "Flash loan attacks can manipulate price oracles, enabling under-collateralized borrows or artificial liquidations.",
    mitigation: "Prefer protocols using Chainlink TWAP oracles with circuit breakers and price deviation guards.",
  },
  {
    name: "Rug Pull / Exit Scam",
    severity: "High",
    description: "Malicious deployers can hold admin keys, drain liquidity, or modify token contracts post-launch.",
    mitigation: "Check multisig governance, timelocks (48h+), and audit the deployer's on-chain history.",
  },
  {
    name: "Liquidation Cascade",
    severity: "High",
    description: "Sharp price drops trigger mass liquidations which further depress prices, creating a death spiral.",
    mitigation: "Maintain health factor > 1.5x; set on-chain alerts at 1.3x; avoid correlated collateral positions.",
  },
  {
    name: "TVL Concentration",
    severity: "Medium",
    description: "Single-protocol TVL concentration amplifies systemic risk if that protocol is exploited.",
    mitigation: "Diversify across 3+ protocols with combined exposure < 20% of portfolio per protocol.",
  },
  {
    name: "Regulatory Risk",
    severity: "Medium",
    description: "DeFi protocols may face regulatory action, OFAC sanctions, or front-end shutdowns.",
    mitigation: "Use self-custody wallets; interact via direct contract calls when possible; monitor legal landscape.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}


const severityColors: Record<string, string> = {
  Critical: "text-red-400 border-red-500/40 bg-red-500/10",
  High: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  Medium: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  Low: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
};

// ── AMM Tab ───────────────────────────────────────────────────────────────────

function AMMTab() {
  const [tradeSize, setTradeSize] = useState(10);
  const [reserveX, setReserveX] = useState(1000);
  const [showV3, setShowV3] = useState(false);

  const k = reserveX * reserveX; // y = x (50/50 pool, initial price = 1)
  const reserveY = k / reserveX;
  const currentPrice = reserveY / reserveX;

  const dx = tradeSize; // buying dx tokens of X
  const newReserveX = reserveX - dx;
  const newReserveY = k / newReserveX;
  const dyCost = newReserveY - reserveY;
  const executionPrice = dyCost / dx;
  const priceImpact = ((executionPrice - currentPrice) / currentPrice) * 100;
  const slippage = priceImpact;

  // SVG constants
  const W = 380;
  const H = 220;
  const PAD = 40;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  // Constant product curve points
  const curvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const xVal = 200 + (i / 60) * 1800;
      const yVal = k / xVal;
      const px = PAD + ((xVal - 200) / 1800) * plotW;
      const py = PAD + plotH - ((yVal - 200) / 1800) * plotH;
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, [k, plotW, plotH]);

  // Current position on curve
  const curPx = PAD + ((reserveX - 200) / 1800) * plotW;
  const curPy = PAD + plotH - ((reserveY - 200) / 1800) * plotH;
  const newPx = PAD + ((newReserveX - 200) / 1800) * plotW;
  const newPy = PAD + plotH - ((newReserveY - 200) / 1800) * plotH;

  // V3 concentrated liquidity bands
  const v3Bands = useMemo(() => {
    const bands = [];
    const centers = [500, 750, 1000, 1200, 1500];
    for (let i = 0; i < centers.length; i++) {
      const c = centers[i];
      const bx = PAD + ((c - 200) / 1800) * plotW - 12;
      const height = 40 + NOISE[i * 3] * 80;
      bands.push({ bx, height, c });
    }
    return bands;
  }, [plotW]);

  return (
    <div className="space-y-4">
      {/* Header cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Constant Product", value: "x × y = k", sub: "Invariant formula" },
          { label: "Price Impact", value: fmtPct(Math.abs(priceImpact)), sub: `Trade size ${tradeSize}%` },
          { label: "Execution Price", value: fmtPct(executionPrice * 100, 4), sub: "Y per X token" },
          { label: "Pool Fee (V3)", value: "0.05% / 0.30%", sub: "Tier options" },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Liquidity curve SVG */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {showV3 ? "V3 Concentrated Liquidity" : "V2 Constant Product Curve (x·y=k)"}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground px-2"
                  onClick={() => setShowV3(!showV3)}
                >
                  {showV3 ? "Show V2" : "Show V3"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Liquidity curve chart">
                {/* Axes */}
                <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="currentColor" strokeOpacity={0.2} />
                <line x1={PAD} y1={PAD + plotH} x2={PAD + plotW} y2={PAD + plotH} stroke="currentColor" strokeOpacity={0.2} />
                <text x={PAD + plotW / 2} y={H - 4} fill="currentColor" fillOpacity={0.4} fontSize={9} textAnchor="middle">Reserve X</text>
                <text x={8} y={PAD + plotH / 2} fill="currentColor" fillOpacity={0.4} fontSize={9} textAnchor="middle" transform={`rotate(-90, 8, ${PAD + plotH / 2})`}>Reserve Y</text>

                {!showV3 ? (
                  <>
                    {/* V2 curve */}
                    <polyline points={curvePoints} fill="none" stroke="#6366f1" strokeWidth={2} />
                    {/* Current position */}
                    <line x1={curPx} y1={PAD} x2={curPx} y2={PAD + plotH} stroke="#10b981" strokeDasharray="4,3" strokeWidth={1} strokeOpacity={0.5} />
                    <line x1={PAD} y1={curPy} x2={PAD + plotW} y2={curPy} stroke="#10b981" strokeDasharray="4,3" strokeWidth={1} strokeOpacity={0.5} />
                    <circle cx={curPx} cy={curPy} r={5} fill="#10b981" />
                    <text x={curPx + 6} y={curPy - 6} fill="#10b981" fontSize={9}>Current</text>
                    {/* Post-trade position */}
                    <circle cx={newPx} cy={newPy} r={5} fill="#f59e0b" />
                    <text x={newPx + 6} y={newPy - 6} fill="#f59e0b" fontSize={9}>After Trade</text>
                    <line x1={curPx} y1={curPy} x2={newPx} y2={newPy} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,2" />
                  </>
                ) : (
                  <>
                    {/* V3 liquidity bands */}
                    {v3Bands.map((b, i) => (
                      <rect
                        key={i}
                        x={b.bx}
                        y={PAD + plotH - b.height}
                        width={24}
                        height={b.height}
                        fill="#6366f1"
                        fillOpacity={0.3 + (b.height / 120) * 0.5}
                        rx={2}
                      />
                    ))}
                    {/* Tick range indicators */}
                    <rect x={PAD + 80} y={PAD} width={plotW - 120} height={plotH} fill="#10b981" fillOpacity={0.05} rx={2} />
                    <line x1={PAD + 80} y1={PAD} x2={PAD + 80} y2={PAD + plotH} stroke="#10b981" strokeWidth={1} strokeOpacity={0.6} />
                    <line x1={PAD + plotW - 40} y1={PAD} x2={PAD + plotW - 40} y2={PAD + plotH} stroke="#10b981" strokeWidth={1} strokeOpacity={0.6} />
                    <text x={PAD + 80} y={PAD - 4} fill="#10b981" fontSize={8} textAnchor="middle">Lower Tick</text>
                    <text x={PAD + plotW - 40} y={PAD - 4} fill="#10b981" fontSize={8} textAnchor="middle">Upper Tick</text>
                    <text x={PAD + plotW / 2} y={PAD + plotH / 2 - 10} fill="#6366f1" fontSize={10} textAnchor="middle" fillOpacity={0.6}>Concentrated</text>
                    <text x={PAD + plotW / 2} y={PAD + plotH / 2 + 4} fill="#6366f1" fontSize={10} textAnchor="middle" fillOpacity={0.6}>Liquidity Range</text>
                  </>
                )}
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Price impact calculator */}
        <div>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Price Impact Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Trade Size (% of pool)</span>
                  <span className="font-mono text-foreground">{tradeSize}%</span>
                </div>
                <Slider
                  value={[tradeSize]}
                  onValueChange={([v]) => setTradeSize(v)}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Pool Reserve X</span>
                  <span className="font-mono text-foreground">{reserveX.toLocaleString()} tokens</span>
                </div>
                <Slider
                  value={[reserveX]}
                  onValueChange={([v]) => setReserveX(v)}
                  min={100}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                {[
                  { label: "Tokens In (Y)", value: fmtPct(dyCost, 2), color: "text-red-400" },
                  { label: "Tokens Out (X)", value: `${dx} tokens`, color: "text-emerald-400" },
                  { label: "Execution Price", value: fmtPct(executionPrice * 100, 4), color: "text-foreground" },
                  { label: "Price Impact", value: fmtPct(Math.abs(priceImpact)), color: priceImpact > 5 ? "text-red-400" : priceImpact > 1 ? "text-amber-400" : "text-emerald-400" },
                  { label: "Est. Slippage", value: fmtPct(Math.abs(slippage) * 0.95), color: "text-muted-foreground" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-mono font-medium ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className={`rounded-md p-3 text-xs ${Math.abs(priceImpact) > 5 ? "bg-red-500/10 border border-red-500/30 text-red-300" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"}`}>
                {Math.abs(priceImpact) > 10
                  ? "High price impact. Consider splitting the trade across multiple blocks or using a DEX aggregator."
                  : Math.abs(priceImpact) > 3
                  ? "Moderate price impact. A 2% slippage tolerance should cover this trade."
                  : "Low price impact. Trade size is well within pool depth — minimal slippage expected."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formula explainer */}
      <div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              AMM Formula Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Constant Product (V2)",
                  formula: "x · y = k",
                  note: "Pool reserves multiply to a constant k. Every trade must maintain this invariant. Price = y/x.",
                  color: "border-indigo-500/40 bg-indigo-500/5",
                },
                {
                  title: "Concentrated Liquidity (V3)",
                  formula: "(x + L/√Pb)(y + L·√Pa) = L²",
                  note: "Liquidity providers choose price ranges [Pa, Pb]. Capital efficiency improves 4–4000x vs V2.",
                  color: "border-primary/40 bg-primary/5",
                },
                {
                  title: "Stable Swap (Curve)",
                  formula: "An·Σxi + D = An·D + D^(n+1)/(n^n·Πxi)",
                  note: "Hybrid formula blending constant-sum and constant-product. Minimizes slippage for pegged assets.",
                  color: "border-pink-500/40 bg-pink-500/5",
                },
              ].map((f) => (
                <div key={f.title} className={`rounded-lg border p-4 ${f.color}`}>
                  <p className="text-xs font-medium text-foreground mb-2">{f.title}</p>
                  <code className="text-sm font-mono text-primary block mb-2 break-all">{f.formula}</code>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Lending Tab ───────────────────────────────────────────────────────────────

function LendingTab() {
  const [collateralRatio, setCollateralRatio] = useState(150);
  const [utilization, setUtilization] = useState(65);

  const W = 380;
  const H = 200;
  const PAD = 36;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  // Interest rate model: kink at 80% utilization
  const OPTIMAL_UR = 80;
  const BASE_RATE = 2;
  const SLOPE1 = 0.1; // rate per 1% utilization below kink
  const SLOPE2 = 2.5; // rate per 1% utilization above kink

  const getRate = useCallback((u: number) => {
    if (u <= OPTIMAL_UR) return BASE_RATE + u * SLOPE1;
    return BASE_RATE + OPTIMAL_UR * SLOPE1 + (u - OPTIMAL_UR) * SLOPE2;
  }, []);

  const currentRate = getRate(utilization);
  const borrowRate = currentRate * 1.1;

  // Build curve path
  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const rate = getRate(i);
      const px = PAD + (i / 100) * plotW;
      const py = PAD + plotH - (Math.min(rate, 50) / 50) * plotH;
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, [getRate, plotW, plotH]);

  const curUtilX = PAD + (utilization / 100) * plotW;
  const curRateY = PAD + plotH - (Math.min(currentRate, 50) / 50) * plotH;

  const healthFactor = collateralRatio / 100;
  const liquidationThreshold = 0.825;
  const safeHealthFactor = healthFactor * liquidationThreshold;
  const isAtRisk = safeHealthFactor < 1.1;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Supply APY", value: fmtPct(currentRate), sub: `at ${utilization}% utilization` },
          { label: "Borrow APY", value: fmtPct(borrowRate), sub: "Variable rate" },
          { label: "Collateral Factor", value: "80%", sub: "Max LTV (USDC)" },
          { label: "Liquidation Threshold", value: "82.5%", sub: "Aave V3 USDC" },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Interest rate curve */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Utilization Rate vs Interest Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Interest rate curve">
                {/* Grid */}
                {[0, 25, 50, 75, 100].map((u) => {
                  const px = PAD + (u / 100) * plotW;
                  return (
                    <g key={u}>
                      <line x1={px} y1={PAD} x2={px} y2={PAD + plotH} stroke="currentColor" strokeOpacity={0.08} />
                      <text x={px} y={PAD + plotH + 12} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle">{u}%</text>
                    </g>
                  );
                })}
                {[0, 10, 25, 50].map((r) => {
                  const py = PAD + plotH - (r / 50) * plotH;
                  return (
                    <g key={r}>
                      <line x1={PAD} y1={py} x2={PAD + plotW} y2={py} stroke="currentColor" strokeOpacity={0.08} />
                      <text x={PAD - 4} y={py + 3} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="end">{r}%</text>
                    </g>
                  );
                })}

                {/* Optimal utilization marker */}
                <line
                  x1={PAD + (OPTIMAL_UR / 100) * plotW}
                  y1={PAD}
                  x2={PAD + (OPTIMAL_UR / 100) * plotW}
                  y2={PAD + plotH}
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="4,3"
                  strokeOpacity={0.5}
                />
                <text
                  x={PAD + (OPTIMAL_UR / 100) * plotW}
                  y={PAD - 4}
                  fill="#f59e0b"
                  fontSize={8}
                  textAnchor="middle"
                  fillOpacity={0.7}
                >Kink (80%)</text>

                {/* Curve */}
                <polyline points={curvePath} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />

                {/* Current utilization */}
                <line x1={curUtilX} y1={PAD} x2={curUtilX} y2={PAD + plotH} stroke="#10b981" strokeWidth={1.5} strokeOpacity={0.6} />
                <circle cx={curUtilX} cy={curRateY} r={5} fill="#10b981" />
                <text x={curUtilX + 6} y={curRateY - 6} fill="#10b981" fontSize={9}>
                  {fmtPct(currentRate)}
                </text>

                {/* Axes labels */}
                <text x={PAD + plotW / 2} y={H - 2} fill="currentColor" fillOpacity={0.4} fontSize={9} textAnchor="middle">Utilization Rate</text>
                <text x={8} y={PAD + plotH / 2} fill="currentColor" fillOpacity={0.4} fontSize={9} textAnchor="middle" transform={`rotate(-90, 8, ${PAD + plotH / 2})`}>Interest Rate</text>
              </svg>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Simulated Utilization</span>
                  <span className="font-mono text-foreground">{utilization}%</span>
                </div>
                <Slider
                  value={[utilization]}
                  onValueChange={([v]) => setUtilization(v)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collateral & health factor */}
        <div>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Collateral Ratio & Health Factor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Collateral Ratio</span>
                  <span className="font-mono text-foreground">{collateralRatio}%</span>
                </div>
                <Slider
                  value={[collateralRatio]}
                  onValueChange={([v]) => setCollateralRatio(v)}
                  min={80}
                  max={300}
                  step={5}
                />
              </div>

              {/* Health factor gauge */}
              <div className={`rounded-lg p-4 border ${isAtRisk ? "border-red-500/40 bg-red-500/5" : "border-emerald-500/40 bg-emerald-500/5"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Health Factor</span>
                  <span className={`text-2xl font-bold tabular-nums ${isAtRisk ? "text-red-400" : "text-emerald-400"}`}>
                    {safeHealthFactor.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={Math.min((safeHealthFactor / 3) * 100, 100)}
                  className="h-2"
                />
                <p className={`text-xs mt-2 ${isAtRisk ? "text-red-300" : "text-emerald-300"}`}>
                  {isAtRisk
                    ? "At risk of liquidation. Repay debt or add collateral immediately."
                    : safeHealthFactor < 1.5
                    ? "Caution: Health factor below 1.5. Consider reducing exposure."
                    : "Healthy position. Well above liquidation threshold."}
                </p>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                {[
                  { label: "Collateral Value", value: `$${(collateralRatio * 100).toLocaleString()}` },
                  { label: "Max Borrow (80% LTV)", value: `$${(collateralRatio * 80).toLocaleString()}` },
                  { label: "Liquidation at Debt", value: `$${Math.round(collateralRatio * 100 * liquidationThreshold).toLocaleString()}` },
                  { label: "Effective LTV", value: fmtPct(100 / collateralRatio * 100) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-mono text-foreground">{r.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Protocol comparison */}
      <div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Lending Protocol Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: "Aave V3",
                  features: ["Efficiency Mode (eMode)", "Isolation Mode", "Portals cross-chain", "Siloed borrowing", "GHO stablecoin"],
                  color: "border-primary/30",
                  badge: "Most Features",
                  badgeColor: "bg-primary/20 text-primary",
                },
                {
                  name: "Compound III",
                  features: ["Single borrow asset (USDC)", "Simpler risk model", "COMP governance token", "Comet architecture", "High gas efficiency"],
                  color: "border-emerald-500/30",
                  badge: "Simplest UX",
                  badgeColor: "bg-emerald-500/20 text-emerald-300",
                },
                {
                  name: "Morpho Blue",
                  features: ["Permissionless markets", "No governance risk", "Oracle-free option", "Lending vaults (MetaMorpho)", "Max capital efficiency"],
                  color: "border-border",
                  badge: "Most Flexible",
                  badgeColor: "bg-muted text-muted-foreground",
                },
              ].map((p) => (
                <div key={p.name} className={`rounded-lg border p-4 ${p.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">{p.name}</p>
                    <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                  </div>
                  <ul className="space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Yield Optimization Tab ────────────────────────────────────────────────────

function YieldTab() {
  const [principal, setPrincipal] = useState(10000);
  const [apr, setApr] = useState(18);
  const [compoundsPerYear, setCompoundsPerYear] = useState(365);

  const apy = (Math.pow(1 + apr / 100 / compoundsPerYear, compoundsPerYear) - 1) * 100;
  const years = 5;

  // Growth curve
  const W = 380;
  const H = 200;
  const PAD = 36;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  const maxValue = principal * Math.pow(1 + apy / 100, years);

  const aprPoints = useMemo(() => {
    const pts: string[] = [];
    for (let m = 0; m <= years * 12; m++) {
      const v = principal * (1 + (apr / 100) * (m / 12));
      const px = PAD + (m / (years * 12)) * plotW;
      const py = PAD + plotH - ((v - principal) / (maxValue - principal + 1)) * plotH;
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, [principal, apr, years, maxValue, plotW, plotH]);

  const apyPoints = useMemo(() => {
    const pts: string[] = [];
    for (let m = 0; m <= years * 12; m++) {
      const v = principal * Math.pow(1 + apy / 100, m / 12);
      const px = PAD + (m / (years * 12)) * plotW;
      const py = PAD + plotH - ((v - principal) / (maxValue - principal + 1)) * plotH;
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, [principal, apy, years, maxValue, plotW, plotH]);

  const apyFinalValue = principal * Math.pow(1 + apy / 100, years);
  const aprFinalValue = principal * (1 + (apr / 100) * years);
  const compoundBonus = apyFinalValue - aprFinalValue;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "APR", value: fmtPct(apr), sub: "No compounding" },
          { label: "APY", value: fmtPct(apy, 2), sub: `${compoundsPerYear}x/year` },
          { label: "5Y APY Value", value: fmtUSD(apyFinalValue), sub: "With compound" },
          { label: "Compound Bonus", value: fmtUSD(compoundBonus), sub: "vs simple interest" },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-medium text-foreground mt-0.5">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Compound growth SVG */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                APR vs APY — 5-Year Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Compound growth chart">
                {[0, 1, 2, 3, 4, 5].map((yr) => {
                  const px = PAD + (yr / years) * plotW;
                  return (
                    <g key={yr}>
                      <line x1={px} y1={PAD} x2={px} y2={PAD + plotH} stroke="currentColor" strokeOpacity={0.07} />
                      <text x={px} y={PAD + plotH + 12} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle">Y{yr}</text>
                    </g>
                  );
                })}

                <polyline points={aprPoints} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5,3" />
                <polyline points={apyPoints} fill="none" stroke="#10b981" strokeWidth={2} />

                {/* Legend */}
                <rect x={PAD + 4} y={PAD + 4} width={8} height={2} fill="#94a3b8" opacity={0.7} />
                <text x={PAD + 16} y={PAD + 9} fill="currentColor" fillOpacity={0.5} fontSize={8}>APR (simple)</text>
                <rect x={PAD + 4} y={PAD + 16} width={8} height={2} fill="#10b981" />
                <text x={PAD + 16} y={PAD + 21} fill="currentColor" fillOpacity={0.6} fontSize={8}>APY (compound)</text>
              </svg>

              <div className="space-y-3 mt-2">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>APR (%)</span>
                    <span className="font-mono text-foreground">{apr}%</span>
                  </div>
                  <Slider value={[apr]} onValueChange={([v]) => setApr(v)} min={1} max={60} step={1} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Compounds Per Year</span>
                    <span className="font-mono text-foreground">{compoundsPerYear === 365 ? "Daily" : compoundsPerYear === 52 ? "Weekly" : compoundsPerYear === 12 ? "Monthly" : "Continuously"}</span>
                  </div>
                  <Slider
                    value={[compoundsPerYear === 12 ? 1 : compoundsPerYear === 52 ? 2 : compoundsPerYear === 365 ? 3 : 4]}
                    onValueChange={([v]) => setCompoundsPerYear([12, 52, 365, 8760][v - 1])}
                    min={1}
                    max={4}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vault strategies */}
        <div className="space-y-3">
          {VAULT_STRATEGIES.map((vs) => (
            <Card key={vs.name} className="bg-card border-border">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{vs.name}</p>
                    <p className="text-xs text-muted-foreground">{vs.protocol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-emerald-400">{fmtPct(vs.apy)} APY</p>
                    <Badge variant="outline" className={`text-xs ${vs.risk === "Low" ? "border-emerald-500/40 text-emerald-400" : vs.risk === "Medium" ? "border-amber-500/40 text-amber-400" : "border-red-500/40 text-red-400"}`}>
                      {vs.risk} Risk
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {vs.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-center text-xs leading-4 flex-shrink-0">{i + 1}</span>
                      <span>{step}</span>
                      {i < vs.steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">TVL: <span className="text-foreground">{fmtUSD(vs.tvl)}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Auto-compound math */}
      <div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              Auto-Compounding Formula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-3">
                <code className="block text-sm font-mono text-primary bg-primary/5 rounded-md p-3 border border-border">
                  APY = (1 + APR/n)^n - 1
                </code>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Where <strong className="text-foreground">n</strong> = number of compounding periods per year.
                  Yield aggregators like Yearn execute harvests every few hours, achieving near-continuous compounding.
                  The difference between APR and APY widens significantly at higher rates.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { n: "12 (monthly)", result: (Math.pow(1 + apr / 100 / 12, 12) - 1) * 100 },
                    { n: "52 (weekly)", result: (Math.pow(1 + apr / 100 / 52, 52) - 1) * 100 },
                    { n: "8760 (hourly)", result: (Math.pow(1 + apr / 100 / 8760, 8760) - 1) * 100 },
                  ].map((row) => (
                    <div key={row.n} className="text-center rounded-md border border-border p-2">
                      <p className="text-xs text-muted-foreground">{row.n}</p>
                      <p className="text-sm font-medium text-emerald-400">{fmtPct(row.result, 2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-3">Harvest Gas Cost Breakeven</p>
                {[
                  { position: "$1,000", freq: "Weekly", gasCost: "$12", breakevenApr: "62%" },
                  { position: "$10,000", freq: "Daily", gasCost: "$5", breakevenApr: "18%" },
                  { position: "$100,000", freq: "Hourly", gasCost: "$2 (L2)", breakevenApr: "1.8%" },
                  { position: "$1,000,000", freq: "Every 15m", gasCost: "$0.10 (L2)", breakevenApr: "0.35%" },
                ].map((row) => (
                  <div key={row.position} className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-1.5">
                    <span className="text-foreground w-24">{row.position}</span>
                    <span className="text-muted-foreground">{row.freq}</span>
                    <span className="text-amber-400">{row.gasCost}</span>
                    <span className="text-muted-foreground">APR min: <strong className="text-foreground">{row.breakevenApr}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Liquidity Mining Tab ──────────────────────────────────────────────────────

function LiquidityMiningTab() {
  const [priceChange, setPriceChange] = useState(-30);
  const [initialAllocation, setInitialAllocation] = useState(50);

  // Impermanent loss calculation
  const r = 1 + priceChange / 100;
  const ilPct = (2 * Math.sqrt(r) / (1 + r) - 1) * 100;

  const W = 380;
  const H = 200;
  const PAD = 36;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  // IL curve from -90% to +900% price change
  const ilCurvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const pct = -90 + i * 9.9; // -90% to +900% (log-ish spacing)
      const rVal = 1 + pct / 100;
      if (rVal <= 0) continue;
      const il = (2 * Math.sqrt(rVal) / (1 + rVal) - 1) * 100;
      const px = PAD + (i / 100) * plotW;
      const py = PAD + (Math.abs(il) / 25) * plotH; // 25% IL max display
      pts.push(`${px},${Math.min(py, PAD + plotH)}`);
    }
    return pts.join(" ");
  }, [plotW, plotH]);

  // Current price change marker
  const curIdx = Math.max(0, Math.min(100, (priceChange + 90) / 9.9));
  const curX = PAD + (curIdx / 100) * plotW;
  const curY = PAD + (Math.abs(ilPct) / 25) * plotH;

  // Emissions schedule (token emissions over 52 weeks)
  const emissionsData = useMemo(() => {
    return Array.from({ length: 52 }, (_, i) => {
      const baseEmission = 1000 * Math.pow(0.97, i); // 3% weekly decay
      const boost = i < 4 ? 1.5 : 1; // launch boost
      return baseEmission * boost + NOISE[i] * 50;
    });
  }, []);

  const maxEmission = Math.max(...emissionsData);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Price Change", value: fmtPct(priceChange), sub: "Token price vs entry" },
          { label: "Impermanent Loss", value: fmtPct(Math.abs(ilPct), 2), sub: "vs HODL" },
          { label: "Break-even Fee", value: fmtPct(Math.abs(ilPct) / 2, 2), sub: "Required LP fees" },
          { label: "Effective Return", value: fmtPct(initialAllocation * (priceChange / 100) - Math.abs(ilPct) * 0.5, 2), sub: "Rough estimate" },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-medium text-foreground mt-0.5">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* IL curve */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Impermanent Loss Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Impermanent loss curve">
                {/* Axes */}
                <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="currentColor" strokeOpacity={0.2} />
                <line x1={PAD} y1={PAD} x2={PAD + plotW} y2={PAD} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="3,2" />
                <line x1={PAD} y1={PAD + plotH} x2={PAD + plotW} y2={PAD + plotH} stroke="currentColor" strokeOpacity={0.2} />

                {/* Y-axis labels */}
                {[0, 5, 10, 15, 20, 25].map((pct) => {
                  const py = PAD + (pct / 25) * plotH;
                  return (
                    <g key={pct}>
                      <line x1={PAD} y1={py} x2={PAD + plotW} y2={py} stroke="currentColor" strokeOpacity={0.06} />
                      <text x={PAD - 4} y={py + 3} fill="currentColor" fillOpacity={0.35} fontSize={7} textAnchor="end">{pct}%</text>
                    </g>
                  );
                })}

                {/* Zero IL line */}
                <line x1={PAD} y1={PAD} x2={PAD + plotW} y2={PAD} stroke="#10b981" strokeWidth={1} strokeOpacity={0.3} strokeDasharray="4,3" />
                <text x={PAD + plotW - 2} y={PAD - 4} fill="#10b981" fontSize={8} textAnchor="end" fillOpacity={0.6}>No IL (HODL)</text>

                {/* IL curve */}
                <polyline points={ilCurvePoints} fill="none" stroke="#f43f5e" strokeWidth={2} />

                {/* Current point */}
                <circle cx={curX} cy={Math.min(curY, PAD + plotH)} r={5} fill="#f59e0b" />
                <text x={curX + 6} y={Math.min(curY, PAD + plotH) - 6} fill="#f59e0b" fontSize={8}>IL: {fmtPct(Math.abs(ilPct), 1)}</text>

                <text x={PAD + plotW / 2} y={H - 2} fill="currentColor" fillOpacity={0.4} fontSize={9} textAnchor="middle">Price Change %</text>
                <text x={8} y={PAD + plotH / 2} fill="currentColor" fillOpacity={0.4} fontSize={9} textAnchor="middle" transform={`rotate(-90, 8, ${PAD + plotH / 2})`}>IL %</text>
              </svg>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Token Price Change</span>
                  <span className={`font-mono ${priceChange < 0 ? "text-red-400" : "text-emerald-400"}`}>{fmtPct(priceChange)}</span>
                </div>
                <Slider
                  value={[priceChange]}
                  onValueChange={([v]) => setPriceChange(v)}
                  min={-90}
                  max={900}
                  step={5}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token emissions schedule */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Token Emissions Schedule (52 Weeks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Token emissions chart">
                {emissionsData.map((val, i) => {
                  const barW = plotW / 52 - 0.5;
                  const barH = (val / maxEmission) * plotH;
                  const bx = PAD + (i / 52) * plotW;
                  const by = PAD + plotH - barH;
                  const isHighlighted = i < 4;
                  return (
                    <rect
                      key={i}
                      x={bx}
                      y={by}
                      width={Math.max(barW, 1)}
                      height={barH}
                      fill={isHighlighted ? "#f59e0b" : "#6366f1"}
                      fillOpacity={0.7}
                    />
                  );
                })}
                {/* Week markers */}
                {[1, 13, 26, 39, 52].map((wk) => {
                  const px = PAD + ((wk - 1) / 52) * plotW;
                  return (
                    <text key={wk} x={px} y={PAD + plotH + 12} fill="currentColor" fillOpacity={0.4} fontSize={7} textAnchor="middle">W{wk}</text>
                  );
                })}
                <text x={PAD + plotW - 10} y={PAD + 12} fill="#f59e0b" fontSize={8} fillOpacity={0.8}>Launch Boost</text>
              </svg>

              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Initial Allocation to LPs (%)</span>
                    <span className="font-mono text-foreground">{initialAllocation}%</span>
                  </div>
                  <Slider
                    value={[initialAllocation]}
                    onValueChange={([v]) => setInitialAllocation(v)}
                    min={10}
                    max={90}
                    step={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Liquidity bootstrapping explanation */}
      <div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Liquidity Bootstrapping Mechanisms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: "LBP (Balancer)",
                  desc: "Weights shift from 90/10 token/USDC to 50/50 over time. Creates natural price discovery without whale manipulation.",
                  pro: "Fair launch, prevents front-running",
                  con: "Complex setup, requires active monitoring",
                  color: "border-indigo-500/30",
                },
                {
                  name: "Protocol-Owned Liquidity",
                  desc: "Protocol acquires its own liquidity via bonds (Olympus model). LP tokens are owned by the DAO treasury, not mercenary LPs.",
                  pro: "Permanent liquidity, no mercenary capital",
                  con: "High upfront capital requirement",
                  color: "border-emerald-500/30",
                },
                {
                  name: "ve-Tokenomics (Curve Wars)",
                  desc: "Vote-escrowed tokens earn boosted yields and governance power. Protocols bribe veCRV holders to direct emissions to their pools.",
                  pro: "Long-term alignment, reduces sell pressure",
                  con: "Complexity, plutocratic governance risk",
                  color: "border-pink-500/30",
                },
              ].map((m) => (
                <div key={m.name} className={`rounded-lg border p-4 ${m.color}`}>
                  <p className="text-sm font-medium mb-2">{m.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{m.desc}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-400 flex items-start gap-1"><CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />{m.pro}</p>
                    <p className="text-xs text-red-400 flex items-start gap-1"><XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />{m.con}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Risk Framework Tab ────────────────────────────────────────────────────────

function RiskTab() {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  const totalTVL = PROTOCOLS.reduce((sum, p) => sum + p.tvl, 0);

  return (
    <div className="space-y-4">
      {/* Risk stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "DeFi Hacks (2023)", value: "$1.8B", sub: "Total funds lost" },
          { label: "Oracle Attacks", value: "34%", sub: "Of all exploits" },
          { label: "Rug Pulls", value: "28%", sub: "By incident count" },
          { label: "Audited Protocols", value: "61%", sub: "Top 100 by TVL" },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-medium text-foreground mt-0.5">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk factors list */}
      <div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              DeFi Risk Factor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RISK_FACTORS.map((rf) => (
              <div
                key={rf.name}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-accent/30 transition-colors"
                  onClick={() => setExpandedRisk(expandedRisk === rf.name ? null : rf.name)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-xs text-muted-foreground ${severityColors[rf.severity]}`}>
                      {rf.severity}
                    </Badge>
                    <span className="text-sm font-medium">{rf.name}</span>
                  </div>
                  {expandedRisk === rf.name ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {expandedRisk === rf.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-3 pb-3 border-t border-border/50"
                  >
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{rf.description}</p>
                    <div className="mt-2 flex items-start gap-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 p-2">
                      <Shield className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-emerald-300 leading-relaxed">{rf.mitigation}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Protocol audit scores */}
      <div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Protocol Risk Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PROTOCOLS.map((p) => {
                const tvlShare = (p.tvl / totalTVL) * 100;
                const riskColor =
                  p.riskScore < 15
                    ? "text-emerald-400"
                    : p.riskScore < 25
                    ? "text-amber-400"
                    : "text-red-400";
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-28 flex-shrink-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.chain}</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground w-16 text-center justify-center">
                      {p.category}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="text-muted-foreground">{fmtUSD(p.tvl)}</span>
                        <span className="text-muted-foreground">{tvlShare.toFixed(1)}% of total</span>
                      </div>
                      <Progress value={tvlShare} className="h-1.5" />
                    </div>
                    <div className="text-center w-16 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Risk</p>
                      <p className={`text-sm font-medium ${riskColor}`}>{p.riskScore}/100</p>
                    </div>
                    <div className="text-center w-12 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Audits</p>
                      <p className="text-sm font-medium text-foreground">{p.audits}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {p.verified ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rug pull checklist */}
      <div>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              Protocol Safety Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  category: "Smart Contract Security",
                  items: [
                    { label: "3+ independent audits", green: true },
                    { label: "Bug bounty program active", green: true },
                    { label: "Verified source code on Etherscan", green: true },
                    { label: "Formal verification (critical paths)", green: false },
                    { label: "Fuzz testing with Echidna/Foundry", green: false },
                  ],
                },
                {
                  category: "Governance & Admin Keys",
                  items: [
                    { label: "Multisig (≥3/5) for admin actions", green: true },
                    { label: "48h+ timelock on upgrades", green: true },
                    { label: "No anonymous team", green: true },
                    { label: "DAO governance fully active", green: false },
                    { label: "Emergency pause with timelock", green: false },
                  ],
                },
                {
                  category: "Oracle & Price Feeds",
                  items: [
                    { label: "Chainlink TWAP oracles", green: true },
                    { label: "Circuit breakers on price deviation", green: true },
                    { label: "No single oracle dependency", green: false },
                    { label: "On-chain price manipulation resistant", green: true },
                    { label: "Emergency oracle pause mechanism", green: false },
                  ],
                },
                {
                  category: "Economic Design",
                  items: [
                    { label: "No infinite mint vulnerability", green: true },
                    { label: "Collateral factors tested under stress", green: true },
                    { label: "Liquidity depth stress tested", green: false },
                    { label: "Token vesting schedules public", green: true },
                    { label: "No unreachable contract state", green: false },
                  ],
                },
              ].map((section) => (
                <div key={section.category}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{section.category}</p>
                  <div className="space-y-1.5">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.green ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <span className={item.green ? "text-foreground" : "text-muted-foreground/60"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DeFiProtocolsPage() {
  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Header */}
      <div
        className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border border-l-4 border-l-primary"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-foreground">DeFi Protocols</h1>
              <p className="text-xs text-muted-foreground">AMM mechanics, lending, yield optimization, liquidity mining & risk</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400">
              <DollarSign className="w-3 h-3 mr-1" />
              {fmtUSD(PROTOCOLS.reduce((s, p) => s + p.tvl, 0))} TVL
            </Badge>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              <Percent className="w-3 h-3 mr-1" />
              {PROTOCOLS.length} Protocols
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-8">
        <Tabs defaultValue="amm" className="h-full flex flex-col">
          <div className="flex-shrink-0 px-6 pt-4 pb-0">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="amm" className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AMM Mechanics</span>
                <span className="sm:hidden">AMM</span>
              </TabsTrigger>
              <TabsTrigger value="lending" className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lending</span>
                <span className="sm:hidden">Lend</span>
              </TabsTrigger>
              <TabsTrigger value="yield" className="text-xs text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Yield Optimization</span>
                <span className="sm:hidden">Yield</span>
              </TabsTrigger>
              <TabsTrigger value="mining" className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Liquidity Mining</span>
                <span className="sm:hidden">Mining</span>
              </TabsTrigger>
              <TabsTrigger value="risk" className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Risk Framework</span>
                <span className="sm:hidden">Risk</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
            <TabsContent value="amm" className="mt-4 data-[state=inactive]:hidden">
              <AMMTab />
            </TabsContent>
            <TabsContent value="lending" className="mt-4 data-[state=inactive]:hidden">
              <LendingTab />
            </TabsContent>
            <TabsContent value="yield" className="mt-4 data-[state=inactive]:hidden">
              <YieldTab />
            </TabsContent>
            <TabsContent value="mining" className="mt-4 data-[state=inactive]:hidden">
              <LiquidityMiningTab />
            </TabsContent>
            <TabsContent value="risk" className="mt-4 data-[state=inactive]:hidden">
              <RiskTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
