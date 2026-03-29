"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Zap,
  BarChart3,
  Calculator,
  Layers,
  RefreshCw,
  Info,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  DollarSign,
  Percent,
  Activity,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Flame,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 113;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtUSD(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number, d = 2): string {
  return `${n.toFixed(d)}%`;
}

function fmtB(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return fmtUSD(n);
}

function fmtM(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmtUSD(n);
}

// ── Shared UI Components ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral" | "warn";
  icon?: React.ReactNode;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : highlight === "warn"
      ? "text-amber-400"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-foreground/5 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-xl font-bold", valClass)}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "rose";
}) {
  const colors = {
    blue: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  if (score <= 3)
    return (
      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
        Low Risk
      </Badge>
    );
  if (score <= 6)
    return (
      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
        Medium Risk
      </Badge>
    );
  return (
    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">
      High Risk
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    lending: "bg-primary/20 text-primary border-border",
    lp: "bg-primary/20 text-primary border-border",
    staking: "bg-cyan-500/20 text-muted-foreground border-cyan-500/30",
    vault: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return (
    <Badge className={cn("text-xs", map[type] ?? "bg-muted-foreground/20 text-muted-foreground")}>
      {type.toUpperCase()}
    </Badge>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Yield Dashboard
// ══════════════════════════════════════════════════════════════════════════════

interface DefiOpportunity {
  id: string;
  protocol: string;
  pair: string;
  baseAPY: number;
  rewardAPY: number;
  tvl: number;
  riskScore: number;
  type: "lending" | "lp" | "staking" | "vault";
  audited: boolean;
  ageMonths: number;
  ilRisk: number; // 0-10
  liquidityRisk: number; // 0-10
}

const DEFI_OPPORTUNITIES: DefiOpportunity[] = [
  { id: "1", protocol: "Aave V3", pair: "USDC", baseAPY: 4.2, rewardAPY: 1.8, tvl: 5_800_000_000, riskScore: 2, type: "lending", audited: true, ageMonths: 36, ilRisk: 0, liquidityRisk: 1 },
  { id: "2", protocol: "Aave V3", pair: "ETH", baseAPY: 1.9, rewardAPY: 0.5, tvl: 3_200_000_000, riskScore: 2, type: "lending", audited: true, ageMonths: 36, ilRisk: 0, liquidityRisk: 1 },
  { id: "3", protocol: "Compound V3", pair: "USDC", baseAPY: 3.8, rewardAPY: 2.1, tvl: 2_400_000_000, riskScore: 2, type: "lending", audited: true, ageMonths: 30, ilRisk: 0, liquidityRisk: 1 },
  { id: "4", protocol: "Uniswap V3", pair: "ETH/USDC", baseAPY: 8.4, rewardAPY: 0, tvl: 1_900_000_000, riskScore: 5, type: "lp", audited: true, ageMonths: 24, ilRisk: 7, liquidityRisk: 2 },
  { id: "5", protocol: "Uniswap V3", pair: "BTC/ETH", baseAPY: 5.6, rewardAPY: 0, tvl: 980_000_000, riskScore: 4, type: "lp", audited: true, ageMonths: 24, ilRisk: 5, liquidityRisk: 2 },
  { id: "6", protocol: "Curve Finance", pair: "3pool (USDC/USDT/DAI)", baseAPY: 2.8, rewardAPY: 4.5, tvl: 4_100_000_000, riskScore: 3, type: "lp", audited: true, ageMonths: 42, ilRisk: 1, liquidityRisk: 1 },
  { id: "7", protocol: "Curve Finance", pair: "stETH/ETH", baseAPY: 3.9, rewardAPY: 3.2, tvl: 2_700_000_000, riskScore: 3, type: "lp", audited: true, ageMonths: 36, ilRisk: 1, liquidityRisk: 2 },
  { id: "8", protocol: "Convex Finance", pair: "CRV/CVX Boost", baseAPY: 6.1, rewardAPY: 8.3, tvl: 1_400_000_000, riskScore: 5, type: "vault", audited: true, ageMonths: 30, ilRisk: 2, liquidityRisk: 3 },
  { id: "9", protocol: "Lido", pair: "stETH", baseAPY: 3.9, rewardAPY: 0, tvl: 28_000_000_000, riskScore: 2, type: "staking", audited: true, ageMonths: 36, ilRisk: 0, liquidityRisk: 1 },
  { id: "10", protocol: "Rocket Pool", pair: "rETH", baseAPY: 3.7, rewardAPY: 0.3, tvl: 4_200_000_000, riskScore: 2, type: "staking", audited: true, ageMonths: 24, ilRisk: 0, liquidityRisk: 1 },
  { id: "11", protocol: "Yearn Finance", pair: "USDC Vault", baseAPY: 5.8, rewardAPY: 1.2, tvl: 800_000_000, riskScore: 4, type: "vault", audited: true, ageMonths: 36, ilRisk: 0, liquidityRisk: 2 },
  { id: "12", protocol: "Yearn Finance", pair: "ETH Vault", baseAPY: 4.3, rewardAPY: 0.8, tvl: 560_000_000, riskScore: 4, type: "vault", audited: true, ageMonths: 36, ilRisk: 0, liquidityRisk: 2 },
  { id: "13", protocol: "Balancer V2", pair: "ETH/BTC/USDC (50/25/25)", baseAPY: 7.2, rewardAPY: 4.8, tvl: 420_000_000, riskScore: 5, type: "lp", audited: true, ageMonths: 24, ilRisk: 5, liquidityRisk: 3 },
  { id: "14", protocol: "GMX", pair: "GLP (Multi-asset)", baseAPY: 11.4, rewardAPY: 7.6, tvl: 680_000_000, riskScore: 7, type: "lp", audited: true, ageMonths: 18, ilRisk: 6, liquidityRisk: 4 },
  { id: "15", protocol: "Pendle Finance", pair: "stETH PT/YT", baseAPY: 9.8, rewardAPY: 12.4, tvl: 320_000_000, riskScore: 7, type: "vault", audited: true, ageMonths: 12, ilRisk: 3, liquidityRisk: 5 },
  { id: "16", protocol: "Radiant Capital", pair: "USDC/ETH Loop", baseAPY: 14.2, rewardAPY: 22.8, tvl: 180_000_000, riskScore: 8, type: "lending", audited: false, ageMonths: 9, ilRisk: 0, liquidityRisk: 6 },
  { id: "17", protocol: "Pancake Swap", pair: "BNB/CAKE", baseAPY: 18.6, rewardAPY: 42.1, tvl: 240_000_000, riskScore: 8, type: "lp", audited: true, ageMonths: 30, ilRisk: 8, liquidityRisk: 5 },
  { id: "18", protocol: "Osmosis", pair: "OSMO/ATOM", baseAPY: 12.8, rewardAPY: 18.4, tvl: 95_000_000, riskScore: 7, type: "lp", audited: true, ageMonths: 18, ilRisk: 7, liquidityRisk: 5 },
  { id: "19", protocol: "Anchor Protocol", pair: "UST Savings", baseAPY: 0, rewardAPY: 0, tvl: 0, riskScore: 10, type: "lending", audited: true, ageMonths: 48, ilRisk: 0, liquidityRisk: 10 },
  { id: "20", protocol: "JOE XYZ", pair: "JOE/AVAX Degen", baseAPY: 48.2, rewardAPY: 85.7, tvl: 28_000_000, riskScore: 10, type: "lp", audited: false, ageMonths: 4, ilRisk: 9, liquidityRisk: 9 },
];

// Generate TVL trend data (12 months)
const TVL_TREND = (() => {
  let base = 80_000_000_000;
  return Array.from({ length: 12 }, (_, i) => {
    base = base * (0.9 + rand() * 0.2);
    return { month: i, tvl: base };
  });
})();

function YieldDashboard() {
  const [filterProtocol, setFilterProtocol] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterAPY, setFilterAPY] = useState("All");
  const [realYield, setRealYield] = useState(false);

  const protocols = useMemo(() => {
    const set = new Set(DEFI_OPPORTUNITIES.map((d) => d.protocol));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return DEFI_OPPORTUNITIES.filter((d) => {
      if (filterProtocol !== "All" && d.protocol !== filterProtocol) return false;
      if (filterType !== "All" && d.type !== filterType) return false;
      if (filterRisk === "Low" && d.riskScore > 3) return false;
      if (filterRisk === "Medium" && (d.riskScore < 4 || d.riskScore > 6)) return false;
      if (filterRisk === "High" && d.riskScore < 7) return false;
      const totalAPY = realYield ? d.baseAPY : d.baseAPY + d.rewardAPY;
      if (filterAPY === "<5%" && totalAPY >= 5) return false;
      if (filterAPY === "5-20%" && (totalAPY < 5 || totalAPY > 20)) return false;
      if (filterAPY === ">20%" && totalAPY <= 20) return false;
      return true;
    });
  }, [filterProtocol, filterType, filterRisk, filterAPY, realYield]);

  // TVL chart dimensions
  const chartW = 600;
  const chartH = 80;
  const maxTVL = Math.max(...TVL_TREND.map((d) => d.tvl));
  const minTVL = Math.min(...TVL_TREND.map((d) => d.tvl));
  const pathPoints = TVL_TREND.map((d, i) => {
    const x = (i / (TVL_TREND.length - 1)) * chartW;
    const y = chartH - ((d.tvl - minTVL) / (maxTVL - minTVL)) * chartH;
    return `${x},${y}`;
  });
  const totalEcosystemTVL = DEFI_OPPORTUNITIES.reduce((a, b) => a + b.tvl, 0);
  const avgAPY = filtered.length
    ? filtered.reduce((a, b) => a + b.baseAPY + (realYield ? 0 : b.rewardAPY), 0) / filtered.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="DeFi TVL (ecosystem)" value={fmtB(totalEcosystemTVL)} sub="Tracked protocols" highlight="pos" icon={<DollarSign size={14} />} />
        <StatCard label="Avg APY (filtered)" value={fmtPct(avgAPY)} sub={realYield ? "Real yield only" : "Inc. token rewards"} highlight="pos" icon={<Percent size={14} />} />
        <StatCard label="Opportunities" value={`${filtered.length} / ${DEFI_OPPORTUNITIES.length}`} sub="Matching filters" icon={<Activity size={14} />} />
        <StatCard label="Audited %" value={fmtPct((DEFI_OPPORTUNITIES.filter((d) => d.audited).length / DEFI_OPPORTUNITIES.length) * 100, 0)} sub="With audit" highlight="pos" icon={<Shield size={14} />} />
      </div>

      {/* TVL trend chart */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>DeFi Ecosystem TVL — 12 Months</SectionTitle>
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH + 10}`} className="w-full h-20">
          <defs>
            <linearGradient id="tvl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M ${pathPoints.join(" L ")} L ${chartW},${chartH + 10} L 0,${chartH + 10} Z`}
            fill="url(#tvl-grad)"
          />
          <polyline
            points={pathPoints.join(" ")}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
          />
          {TVL_TREND.map((d, i) => (
            <circle
              key={i}
              cx={(i / (TVL_TREND.length - 1)) * chartW}
              cy={chartH - ((d.tvl - minTVL) / (maxTVL - minTVL)) * chartH}
              r="3"
              fill="#818cf8"
            />
          ))}
        </svg>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          {["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Protocol:</span>
        {["All", "Aave V3", "Curve Finance", "Uniswap V3", "Lido"].map((p) => (
          <button
            key={p}
            onClick={() => setFilterProtocol(p)}
            className={cn(
              "px-2 py-1 rounded text-xs border transition-colors",
              filterProtocol === p
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
            )}
          >
            {p}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">Type:</span>
        {["All", "lending", "lp", "staking", "vault"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              "px-2 py-1 rounded text-xs border transition-colors",
              filterType === t
                ? "border-primary bg-primary/20 text-primary"
                : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
            )}
          >
            {t.toUpperCase()}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">APY:</span>
        {["All", "<5%", "5-20%", ">20%"].map((a) => (
          <button
            key={a}
            onClick={() => setFilterAPY(a)}
            className={cn(
              "px-2 py-1 rounded text-xs border transition-colors",
              filterAPY === a
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
            )}
          >
            {a}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">Risk:</span>
        {["All", "Low", "Medium", "High"].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRisk(r)}
            className={cn(
              "px-2 py-1 rounded text-xs border transition-colors",
              filterRisk === r
                ? "border-rose-500 bg-rose-500/20 text-rose-300"
                : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
            )}
          >
            {r}
          </button>
        ))}
        <button
          onClick={() => setRealYield(!realYield)}
          className={cn(
            "px-3 py-1 rounded text-xs border transition-colors ml-2",
            realYield
              ? "border-amber-500 bg-amber-500/20 text-amber-300"
              : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
          )}
        >
          {realYield ? "Real Yield ON" : "Real Yield OFF"}
        </button>
      </div>

      {/* Opportunities table */}
      <div className="rounded-xl border border-border bg-foreground/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left p-3">Protocol</th>
              <th className="text-left p-3">Pair</th>
              <th className="text-left p-3">Type</th>
              <th className="text-right p-3">Base APY</th>
              <th className="text-right p-3">Reward APY</th>
              <th className="text-right p-3">Total APY</th>
              <th className="text-right p-3">TVL</th>
              <th className="text-left p-3">Risk</th>
              <th className="text-center p-3">Audited</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((opp, idx) => {
              const totalAPY = opp.baseAPY + (realYield ? 0 : opp.rewardAPY);
              return (
                <motion.tr
                  key={opp.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 font-medium text-foreground">{opp.protocol}</td>
                  <td className="p-3 text-muted-foreground">{opp.pair}</td>
                  <td className="p-3"><TypeBadge type={opp.type} /></td>
                  <td className="p-3 text-right text-emerald-400">{fmtPct(opp.baseAPY)}</td>
                  <td className={cn("p-3 text-right", realYield ? "text-muted-foreground line-through" : "text-amber-400")}>
                    {fmtPct(opp.rewardAPY)}
                  </td>
                  <td className={cn("p-3 text-right font-bold", totalAPY >= 20 ? "text-rose-400" : totalAPY >= 10 ? "text-amber-400" : "text-emerald-400")}>
                    {fmtPct(totalAPY)}
                  </td>
                  <td className="p-3 text-right text-muted-foreground">{fmtB(opp.tvl)}</td>
                  <td className="p-3"><RiskBadge score={opp.riskScore} /></td>
                  <td className="p-3 text-center">
                    {opp.audited ? (
                      <CheckCircle size={14} className="text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle size={14} className="text-rose-400 mx-auto" />
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <InfoBox variant="amber">
        <strong>Real Yield toggle</strong> — When ON, token reward APYs are excluded. High APYs driven purely by inflationary token emissions are unsustainable; real yield (from protocol fees) is a more durable return metric. Anchor Protocol&#39;s 20% APY was entirely subsidized — it collapsed in May 2022.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Liquidity Pool Simulator
// ══════════════════════════════════════════════════════════════════════════════

const LP_PAIRS = [
  { label: "ETH/USDC", vol: 0.85, fee: 0.003, initialPrice: 3200 },
  { label: "BTC/ETH", vol: 0.65, fee: 0.003, initialPrice: 18.5 },
  { label: "SOL/USDC", vol: 1.2, fee: 0.003, initialPrice: 168 },
  { label: "AVAX/USDC", vol: 1.1, fee: 0.003, initialPrice: 38 },
  { label: "MATIC/USDC", vol: 0.95, fee: 0.003, initialPrice: 0.92 },
  { label: "ATOM/USDC", vol: 0.9, fee: 0.003, initialPrice: 9.4 },
];

function calcIL(priceRatio: number): number {
  // IL = 2*sqrt(r)/(1+r) - 1
  return (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
}

function LiquidityPoolSimulator() {
  const [selectedPair, setSelectedPair] = useState(0);
  const [lpAmount, setLpAmount] = useState(10000);
  const [v3Mode, setV3Mode] = useState(false);
  const [rangeLow, setRangeLow] = useState(0.8);
  const [rangeHigh, setRangeHigh] = useState(1.25);

  const pair = LP_PAIRS[selectedPair];

  const scenarios = useMemo(() => {
    const ratios = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0];
    const dailyVolume = lpAmount * pair.vol;
    const annualFeeIncome = dailyVolume * pair.fee * 365;
    const dailyFee = dailyVolume * pair.fee;
    return ratios.map((r) => {
      const il = calcIL(r);
      const ilDollars = Math.abs(il) * lpAmount;
      const daysToBreakeven = dailyFee > 0 ? ilDollars / dailyFee : Infinity;
      const v3Efficiency = v3Mode ? 1 / (rangeHigh - rangeLow) : 1;
      const v3AdjFee = dailyFee * Math.min(v3Efficiency, 4);
      const inRange = r >= rangeLow && r <= rangeHigh;
      return {
        ratio: r,
        il,
        ilDollars,
        feeDollarsAnnual: annualFeeIncome,
        daysToBreakeven: v3Mode && !inRange ? Infinity : daysToBreakeven,
        v3InRange: inRange,
        v3AdjFeeDailyAnnual: v3AdjFee * 365,
      };
    });
  }, [lpAmount, pair, v3Mode, rangeLow, rangeHigh]);

  // IL curve for SVG
  const ilCurveW = 400;
  const ilCurveH = 100;
  const ratioMin = 0.1;
  const ratioMax = 4.0;
  const ilPoints = Array.from({ length: 60 }, (_, i) => {
    const r = ratioMin + (i / 59) * (ratioMax - ratioMin);
    const il = calcIL(r) * 100; // as percentage
    const x = ((r - ratioMin) / (ratioMax - ratioMin)) * ilCurveW;
    const y = ilCurveH - ((il + 50) / 50) * ilCurveH * 0.5; // scale -50% to 0
    return `${x},${Math.max(0, Math.min(ilCurveH, y))}`;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="rounded-xl border border-border bg-foreground/5 p-4 space-y-4">
          <SectionTitle>LP Configuration</SectionTitle>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Token Pair</label>
            <div className="flex flex-wrap gap-2">
              {LP_PAIRS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setSelectedPair(i)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                    selectedPair === i
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                      : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">LP Deposit Amount</label>
            <div className="flex gap-2 flex-wrap">
              {[1000, 5000, 10000, 50000, 100000].map((v) => (
                <button
                  key={v}
                  onClick={() => setLpAmount(v)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                    lpAmount === v
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
                  )}
                >
                  {fmtUSD(v, 0)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setV3Mode(!v3Mode)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                v3Mode
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
              )}
            >
              {v3Mode ? "Uniswap V3 (Concentrated)" : "Uniswap V2 (Full Range)"}
            </button>
          </div>
          {v3Mode && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price Range Low (ratio vs current): {rangeLow.toFixed(2)}x</label>
                <input
                  type="range"
                  min={0.1}
                  max={0.95}
                  step={0.05}
                  value={rangeLow}
                  onChange={(e) => setRangeLow(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price Range High (ratio vs current): {rangeHigh.toFixed(2)}x</label>
                <input
                  type="range"
                  min={1.05}
                  max={4}
                  step={0.05}
                  value={rangeHigh}
                  onChange={(e) => setRangeHigh(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <InfoBox variant="blue">
                V3 capital efficiency: <strong>{(1 / (rangeHigh - rangeLow)).toFixed(1)}x</strong> vs V2 — but position earns 0 fees when price exits range.
              </InfoBox>
            </motion.div>
          )}
        </div>

        {/* IL Formula Visualization */}
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>IL Formula: IL = 2√r/(1+r) - 1</SectionTitle>
          <svg viewBox={`0 0 ${ilCurveW} ${ilCurveH + 20}`} className="w-full h-36">
            {/* Zero line */}
            <line x1="0" y1={ilCurveH} x2={ilCurveW} y2={ilCurveH} stroke="#3f3f46" strokeDasharray="4,4" />
            {/* IL curve */}
            <polyline points={ilPoints.join(" ")} fill="none" stroke="#f43f5e" strokeWidth="2" />
            {/* Current price marker at r=1 */}
            <line
              x1={((1 - ratioMin) / (ratioMax - ratioMin)) * ilCurveW}
              y1={0}
              x2={((1 - ratioMin) / (ratioMax - ratioMin)) * ilCurveW}
              y2={ilCurveH + 20}
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            {/* X labels */}
            {[0.5, 1, 2, 3, 4].map((r) => (
              <text
                key={r}
                x={((r - ratioMin) / (ratioMax - ratioMin)) * ilCurveW}
                y={ilCurveH + 15}
                textAnchor="middle"
                fontSize="8"
                fill="#71717a"
              >
                {r}x
              </text>
            ))}
            <text x={((1 - ratioMin) / (ratioMax - ratioMin)) * ilCurveW} y={12} textAnchor="middle" fontSize="8" fill="#22d3ee">
              current
            </text>
          </svg>
          <p className="text-xs text-muted-foreground mt-1">
            r = price ratio (new/original). IL = 0 at r=1. Symmetric: 2x up = 2x down IL.
          </p>
        </div>
      </div>

      {/* Scenario table */}
      <div className="rounded-xl border border-border bg-foreground/5 overflow-x-auto">
        <div className="p-4 border-b border-border">
          <SectionTitle>Price Change Scenarios — {pair.label} @ {fmtUSD(lpAmount, 0)} Deposit</SectionTitle>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase">
              <th className="text-left p-3">Price Change</th>
              <th className="text-right p-3">IL %</th>
              <th className="text-right p-3">IL (USD)</th>
              <th className="text-right p-3">Annual Fee</th>
              <th className="text-right p-3">Days to Breakeven</th>
              {v3Mode && <th className="text-center p-3">In Range</th>}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((sc) => (
              <tr key={sc.ratio} className="border-b border-border/50 hover:bg-muted/30">
                <td className="p-3">
                  <span className={cn("font-medium", sc.ratio < 1 ? "text-rose-400" : sc.ratio > 1 ? "text-emerald-400" : "text-muted-foreground")}>
                    {sc.ratio === 1 ? "No change" : sc.ratio > 1 ? `+${((sc.ratio - 1) * 100).toFixed(0)}%` : `-${((1 - sc.ratio) * 100).toFixed(0)}%`}
                  </span>
                </td>
                <td className="p-3 text-right text-rose-400">{fmtPct(sc.il * 100)}</td>
                <td className="p-3 text-right text-rose-400">{fmtUSD(sc.ilDollars, 0)}</td>
                <td className="p-3 text-right text-emerald-400">{fmtUSD(sc.feeDollarsAnnual, 0)}</td>
                <td className="p-3 text-right text-muted-foreground">
                  {sc.daysToBreakeven === Infinity ? "Never" : `${sc.daysToBreakeven.toFixed(0)}d`}
                </td>
                {v3Mode && (
                  <td className="p-3 text-center">
                    {sc.v3InRange ? (
                      <CheckCircle size={14} className="text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle size={14} className="text-rose-400 mx-auto" />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox variant="amber">
        <strong>Impermanent Loss (IL)</strong> occurs when the relative price of your pooled assets changes vs. when you deposited. It&#39;s &quot;impermanent&quot; because it reverses if the price returns to your entry price. However, it becomes permanent when you withdraw. At 2x price move: IL ≈ 5.7%. At 4x: IL ≈ 20%.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Staking Calculator
// ══════════════════════════════════════════════════════════════════════════════

interface StakingOption {
  symbol: string;
  name: string;
  baseAPY: number;
  liquidStaking?: { token: string; discount: number };
  minStake: number;
  lockupDays: number;
  slashingRisk: number; // 0-10
  description: string;
}

const STAKING_OPTIONS: StakingOption[] = [
  { symbol: "ETH", name: "Ethereum", baseAPY: 3.9, liquidStaking: { token: "stETH", discount: 0.05 }, minStake: 32, lockupDays: 0, slashingRisk: 2, description: "PoS consensus since Sep 2022 Merge" },
  { symbol: "SOL", name: "Solana", baseAPY: 6.8, liquidStaking: { token: "mSOL", discount: 0.1 }, minStake: 0.01, lockupDays: 3, slashingRisk: 1, description: "High-performance L1, 432-validator epochs" },
  { symbol: "AVAX", name: "Avalanche", baseAPY: 8.2, liquidStaking: { token: "sAVAX", discount: 0.15 }, minStake: 25, lockupDays: 14, slashingRisk: 1, description: "Subnet validator, 2-week minimum lock" },
  { symbol: "ATOM", name: "Cosmos Hub", baseAPY: 18.0, liquidStaking: { token: "stATOM", discount: 0.2 }, minStake: 1, lockupDays: 21, slashingRisk: 3, description: "21-day unbonding, high inflation model" },
  { symbol: "DOT", name: "Polkadot", baseAPY: 12.0, liquidStaking: { token: "LDOT", discount: 0.15 }, minStake: 10, lockupDays: 28, slashingRisk: 4, description: "NPoS, 28-day unbonding, parachain staking" },
  { symbol: "ADA", name: "Cardano", baseAPY: 4.0, liquidStaking: undefined, minStake: 10, lockupDays: 5, slashingRisk: 1, description: "Epoch-based, no slashing risk, liquid staking available" },
];

const ALTERNATIVES = [
  { label: "ETH Staking", apy: 3.9, risk: "Low" },
  { label: "USDC (Aave)", apy: 4.2, risk: "Low-Med" },
  { label: "3-Month T-Bill", apy: 5.3, risk: "Zero" },
  { label: "HYSA", apy: 4.8, risk: "Zero" },
  { label: "S&P 500 Div.", apy: 1.5, risk: "Market" },
];

function StakingCalculator() {
  const [selectedAsset, setSelectedAsset] = useState(0);
  const [amount, setAmount] = useState(10000);
  const [compoundFreq, setCompoundFreq] = useState<"monthly" | "annual">("monthly");
  const [years, setYears] = useState(3);
  const [useLiquidStaking, setUseLiquidStaking] = useState(false);

  const asset = STAKING_OPTIONS[selectedAsset];
  const effectiveAPY = useLiquidStaking && asset.liquidStaking
    ? asset.baseAPY * (1 - asset.liquidStaking.discount / 100)
    : asset.baseAPY;

  // Compound calculator
  const compoundData = useMemo(() => {
    const monthlyRate = effectiveAPY / 100 / 12;
    const annualRate = effectiveAPY / 100;
    return Array.from({ length: years * 12 + 1 }, (_, m) => {
      const monthly = amount * Math.pow(1 + monthlyRate, m);
      const annual = amount * Math.pow(1 + annualRate, Math.floor(m / 12)) * (1 + (m % 12) * monthlyRate);
      return { month: m, monthly, annual };
    });
  }, [amount, effectiveAPY, years]);

  const finalMonthly = compoundData[compoundData.length - 1]?.monthly ?? amount;
  const finalAnnual = compoundData[compoundData.length - 1]?.annual ?? amount;
  const compoundBenefit = finalMonthly - finalAnnual;

  // SVG chart
  const chartW = 500;
  const chartH = 100;
  const maxVal = Math.max(...compoundData.map((d) => d.monthly));
  const minVal = amount;

  const monthlyPath = compoundData
    .map((d, i) => {
      const x = (i / (compoundData.length - 1)) * chartW;
      const y = chartH - ((d.monthly - minVal) / (maxVal - minVal + 1)) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const annualPath = compoundData
    .map((d, i) => {
      const x = (i / (compoundData.length - 1)) * chartW;
      const y = chartH - ((d.annual - minVal) / (maxVal - minVal + 1)) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const slashScenarios = [
    { behavior: "Double-signing (equivocation)", probability: "0.01%/yr", slash: "100%" },
    { behavior: "Extended downtime (>1 epoch)", probability: "1-5%/yr", slash: "0.5-3%" },
    { behavior: "Correlation penalty (multiple validators down)", probability: "0.1%/yr", slash: "Up to 33%" },
  ];

  return (
    <div className="space-y-6">
      {/* Asset selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {STAKING_OPTIONS.map((opt, i) => (
          <button
            key={opt.symbol}
            onClick={() => { setSelectedAsset(i); setUseLiquidStaking(false); }}
            className={cn(
              "p-3 rounded-xl border text-left transition-colors",
              selectedAsset === i
                ? "border-indigo-500 bg-indigo-500/20"
                : "border-border bg-foreground/5 hover:border-border"
            )}
          >
            <div className="font-medium text-sm text-foreground">{opt.symbol}</div>
            <div className="text-xs text-emerald-400">{fmtPct(opt.baseAPY)} APY</div>
            <div className="text-xs text-muted-foreground">{opt.lockupDays === 0 ? "No lock" : `${opt.lockupDays}d lock`}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Config */}
        <div className="rounded-xl border border-border bg-foreground/5 p-4 space-y-4">
          <SectionTitle>Staking Configuration</SectionTitle>
          <div className="p-3 rounded-lg bg-foreground/5 border border-border">
            <p className="text-sm font-medium text-foreground">{asset.name} ({asset.symbol})</p>
            <p className="text-xs text-muted-foreground mt-1">{asset.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <span className="text-muted-foreground">Min stake: <span className="text-muted-foreground">{asset.minStake} {asset.symbol}</span></span>
              <span className="text-muted-foreground">Lockup: <span className="text-muted-foreground">{asset.lockupDays === 0 ? "None" : `${asset.lockupDays} days`}</span></span>
              <span className="text-muted-foreground">Slash risk: <span className={cn(asset.slashingRisk <= 2 ? "text-emerald-400" : asset.slashingRisk <= 3 ? "text-amber-400" : "text-rose-400")}>{asset.slashingRisk}/10</span></span>
              <span className="text-muted-foreground">Base APY: <span className="text-emerald-400">{fmtPct(asset.baseAPY)}</span></span>
            </div>
          </div>

          {asset.liquidStaking && (
            <button
              onClick={() => setUseLiquidStaking(!useLiquidStaking)}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-colors",
                useLiquidStaking
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-border bg-foreground/5 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {useLiquidStaking ? <Unlock size={14} className="inline mr-1 text-muted-foreground" /> : <Lock size={14} className="inline mr-1 text-muted-foreground" />}
                  Liquid Staking ({asset.liquidStaking.token})
                </span>
                <span className="text-xs text-muted-foreground">-{asset.liquidStaking.discount}% fee</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Earn yield while maintaining liquidity to use in DeFi</p>
            </button>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Investment Amount</label>
            <div className="flex gap-2 flex-wrap">
              {[1000, 5000, 10000, 50000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs border transition-colors",
                    amount === v
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
                  )}
                >
                  {fmtUSD(v, 0)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Time Horizon: {years} years</label>
            <input
              type="range"
              min={1}
              max={10}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Monthly Compound" value={fmtUSD(finalMonthly, 0)} sub={`${years}yr growth`} highlight="pos" />
            <StatCard label="Annual Compound" value={fmtUSD(finalAnnual, 0)} sub={`${years}yr growth`} highlight="pos" />
            <StatCard label="Compound Benefit" value={fmtUSD(compoundBenefit, 0)} sub="Monthly vs Annual" highlight={compoundBenefit > 0 ? "pos" : "neutral"} />
            <StatCard label="Effective APY" value={fmtPct(effectiveAPY)} sub={useLiquidStaking ? "Liquid staking" : "Direct staking"} highlight="pos" />
          </div>
          <InfoBox variant="blue">
            Monthly compounding gives <strong>{fmtUSD(compoundBenefit, 0)}</strong> extra over {years} years vs annual compounding, due to interest-on-interest effects.
          </InfoBox>
        </div>
      </div>

      {/* Compound chart */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>Monthly vs Annual Compounding — {years} Year Projection</SectionTitle>
        <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full h-32">
          <defs>
            <linearGradient id="monthly-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={annualPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6,3" />
          <polyline points={monthlyPath} fill="none" stroke="#22c55e" strokeWidth="2" />
          <text x={8} y={12} fontSize="8" fill="#22c55e">Monthly</text>
          <text x={8} y={22} fontSize="8" fill="#f59e0b">Annual</text>
        </svg>
      </div>

      {/* Alternatives */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>Staking vs Alternatives ({fmtUSD(amount, 0)} Investment)</SectionTitle>
        <div className="space-y-2">
          {ALTERNATIVES.map((alt) => {
            const finalValue = amount * Math.pow(1 + alt.apy / 100, years);
            const gain = finalValue - amount;
            const barW = Math.min((alt.apy / 20) * 100, 100);
            return (
              <div key={alt.label} className="flex items-center gap-3">
                <span className="w-32 text-xs text-muted-foreground shrink-0">{alt.label}</span>
                <div className="flex-1 bg-foreground/5 rounded h-5 relative overflow-hidden">
                  <div
                    className="h-full bg-indigo-500/40 rounded"
                    style={{ width: `${barW}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs text-muted-foreground">
                    {fmtPct(alt.apy)} APY — +{fmtUSD(gain, 0)} ({years}yr)
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">{alt.risk}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slashing risk */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle><AlertTriangle size={14} className="text-amber-400" /> Slashing Risk Scenarios</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase">
                <th className="text-left p-2">Behavior</th>
                <th className="text-right p-2">Probability</th>
                <th className="text-right p-2">Slash %</th>
              </tr>
            </thead>
            <tbody>
              {slashScenarios.map((sc) => (
                <tr key={sc.behavior} className="border-t border-border/50">
                  <td className="p-2 text-muted-foreground">{sc.behavior}</td>
                  <td className="p-2 text-right text-amber-400">{sc.probability}</td>
                  <td className="p-2 text-right text-rose-400">{sc.slash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Lending Protocol Analyzer
// ══════════════════════════════════════════════════════════════════════════════

interface LendingMarket {
  protocol: string;
  asset: string;
  supplyRate: number;
  borrowRate: number;
  utilization: number;
  kink: number;
  totalSupply: number;
  totalBorrow: number;
}

const LENDING_MARKETS: LendingMarket[] = [
  { protocol: "Aave V3", asset: "USDC", supplyRate: 4.2, borrowRate: 5.8, utilization: 72, kink: 80, totalSupply: 2_800_000_000, totalBorrow: 2_016_000_000 },
  { protocol: "Aave V3", asset: "ETH", supplyRate: 1.9, borrowRate: 2.8, utilization: 68, kink: 80, totalSupply: 1_600_000_000, totalBorrow: 1_088_000_000 },
  { protocol: "Aave V3", asset: "WBTC", supplyRate: 0.8, borrowRate: 1.4, utilization: 57, kink: 70, totalSupply: 980_000_000, totalBorrow: 558_600_000 },
  { protocol: "Compound V3", asset: "USDC", supplyRate: 3.8, borrowRate: 5.2, utilization: 73, kink: 80, totalSupply: 1_200_000_000, totalBorrow: 876_000_000 },
  { protocol: "Compound V3", asset: "ETH", supplyRate: 1.6, borrowRate: 2.4, utilization: 67, kink: 80, totalSupply: 820_000_000, totalBorrow: 549_400_000 },
  { protocol: "Euler V1", asset: "USDC", supplyRate: 4.6, borrowRate: 6.1, utilization: 75, kink: 85, totalSupply: 380_000_000, totalBorrow: 285_000_000 },
];

const PROTOCOL_HACKS = [
  { protocol: "Euler Finance", date: "Mar 2023", amount: 197_000_000, recovered: true, pct: 197 },
  { protocol: "Cream Finance", date: "Oct 2021", amount: 130_000_000, recovered: false, pct: 130 },
  { protocol: "Compound (bug)", date: "Oct 2021", amount: 80_000_000, recovered: false, pct: 80 },
  { protocol: "Badger DAO", date: "Dec 2021", amount: 120_000_000, recovered: false, pct: 120 },
  { protocol: "Inverse Finance", date: "Apr 2022", amount: 15_600_000, recovered: false, pct: 15.6 },
];

function LendingAnalyzer() {
  const [selectedMarket, setSelectedMarket] = useState(0);
  const [collateral, setCollateral] = useState(10000);
  const [borrowAmount, setBorrowAmount] = useState(5000);
  const [loopLeverage, setLoopLeverage] = useState(2);

  const market = LENDING_MARKETS[selectedMarket];
  const healthFactor = collateral / borrowAmount;
  const liquidationThreshold = 0.8;
  const liquidationPrice = borrowAmount / (collateral * liquidationThreshold);

  // Utilization rate curve
  const utilizationCurveW = 400;
  const utilizationCurveH = 80;
  const utilPoints = Array.from({ length: 100 }, (_, i) => {
    const u = i / 99;
    let rate: number;
    const kinkFrac = market.kink / 100;
    if (u <= kinkFrac) {
      rate = (u / kinkFrac) * market.borrowRate * 0.6;
    } else {
      rate = market.borrowRate * 0.6 + ((u - kinkFrac) / (1 - kinkFrac)) * market.borrowRate * 5;
    }
    const x = u * utilizationCurveW;
    const y = utilizationCurveH - (Math.min(rate, market.borrowRate * 4) / (market.borrowRate * 4)) * utilizationCurveH;
    return `${x},${Math.max(0, y)}`;
  });

  // Current utilization marker
  const currUtilX = (market.utilization / 100) * utilizationCurveW;
  const kinkX = (market.kink / 100) * utilizationCurveW;

  // Loop leverage APY
  const depositRate = market.supplyRate;
  const borrowRate = market.borrowRate;
  const loopNetAPY = depositRate * loopLeverage - borrowRate * (loopLeverage - 1);

  return (
    <div className="space-y-6">
      {/* Market selector */}
      <div className="flex flex-wrap gap-2">
        {LENDING_MARKETS.map((m, i) => (
          <button
            key={`${m.protocol}-${m.asset}`}
            onClick={() => setSelectedMarket(i)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs border transition-colors",
              selectedMarket === i
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
            )}
          >
            {m.protocol} — {m.asset}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Supply Rate" value={fmtPct(market.supplyRate)} highlight="pos" icon={<TrendingUp size={14} />} />
        <StatCard label="Borrow Rate" value={fmtPct(market.borrowRate)} highlight="warn" icon={<TrendingDown size={14} />} />
        <StatCard label="Utilization" value={fmtPct(market.utilization, 0)} highlight={market.utilization > market.kink ? "neg" : "neutral"} icon={<Activity size={14} />} />
        <StatCard label="Total Supplied" value={fmtB(market.totalSupply)} icon={<DollarSign size={14} />} />
      </div>

      {/* Utilization rate model */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>Utilization Rate Model — {market.protocol} {market.asset}</SectionTitle>
        <svg viewBox={`0 0 ${utilizationCurveW} ${utilizationCurveH + 20}`} className="w-full h-32">
          {/* Kink line */}
          <line x1={kinkX} y1={0} x2={kinkX} y2={utilizationCurveH} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,2" />
          <text x={kinkX + 4} y={10} fontSize="8" fill="#f59e0b">Kink ({market.kink}%)</text>
          {/* Rate curve */}
          <polyline points={utilPoints.join(" ")} fill="none" stroke="#818cf8" strokeWidth="2" />
          {/* Current utilization */}
          <line x1={currUtilX} y1={0} x2={currUtilX} y2={utilizationCurveH} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x={currUtilX + 4} y={22} fontSize="8" fill="#22d3ee">Current ({market.utilization}%)</text>
          {/* X labels */}
          {[0, 25, 50, 75, 100].map((u) => (
            <text key={u} x={(u / 100) * utilizationCurveW} y={utilizationCurveH + 14} textAnchor="middle" fontSize="8" fill="#71717a">
              {u}%
            </text>
          ))}
          <text x={0} y={utilizationCurveH + 14} fontSize="7" fill="#71717a" textAnchor="start">0% util</text>
        </svg>
        <p className="text-xs text-muted-foreground mt-1">
          When utilization &gt; kink ({market.kink}%), borrow rates spike dramatically to incentivize repayments and new deposits.
        </p>
      </div>

      {/* Health factor calculator */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle><Calculator size={14} /> Health Factor Calculator</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Collateral Value (USD)</label>
              <div className="flex gap-2 flex-wrap">
                {[5000, 10000, 25000, 50000].map((v) => (
                  <button key={v} onClick={() => setCollateral(v)} className={cn("px-2 py-1 rounded text-xs border transition-colors", collateral === v ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-border bg-foreground/5 text-muted-foreground")}>
                    {fmtUSD(v, 0)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Borrow Amount (USD)</label>
              <div className="flex gap-2 flex-wrap">
                {[1000, 3000, 5000, 7000].map((v) => (
                  <button key={v} onClick={() => setBorrowAmount(v)} className={cn("px-2 py-1 rounded text-xs border transition-colors", borrowAmount === v ? "border-rose-500 bg-rose-500/20 text-rose-300" : "border-border bg-foreground/5 text-muted-foreground")}>
                    {fmtUSD(v, 0)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border bg-foreground/5">
              <div className="text-xs text-muted-foreground mb-1">Health Factor</div>
              <div className={cn("text-2xl font-bold", healthFactor >= 2 ? "text-emerald-400" : healthFactor >= 1.3 ? "text-amber-400" : "text-rose-400")}>
                {healthFactor.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Liquidation at HF &lt; 1.0 — Current: {healthFactor < 1 ? "LIQUIDATABLE" : healthFactor < 1.3 ? "Danger zone" : healthFactor < 2 ? "Caution" : "Safe"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">Loan-to-Value: </span>{fmtPct((borrowAmount / collateral) * 100, 1)}
              &nbsp;&nbsp;
              <span className="text-muted-foreground">Liquidation threshold: </span>{fmtPct(liquidationPrice * 100, 1)} drop
            </div>
          </div>
        </div>
      </div>

      {/* Recursive lending */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle><RefreshCw size={14} /> Recursive Lending (Leverage Loop)</SectionTitle>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Leverage Loops: {loopLeverage}x</label>
            <input type="range" min={1} max={5} step={0.5} value={loopLeverage} onChange={(e) => setLoopLeverage(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Deposit Rate" value={fmtPct(depositRate)} highlight="pos" />
            <StatCard label="Borrow Rate" value={fmtPct(borrowRate)} highlight="warn" />
            <StatCard label="Net APY (looped)" value={fmtPct(loopNetAPY)} highlight={loopNetAPY > 0 ? "pos" : "neg"} />
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Example with {fmtUSD(10000, 0)} and {loopLeverage}x leverage:</p>
            {Array.from({ length: Math.min(Math.ceil(loopLeverage), 5) }, (_, i) => {
              const depositAmt = 10000 * Math.pow(0.75, i);
              const borrowAmt = depositAmt * 0.75;
              return (
                <p key={i} className="text-muted-foreground">
                  Loop {i + 1}: Deposit <span className="text-emerald-400">{fmtUSD(depositAmt, 0)}</span> → Borrow <span className="text-rose-400">{fmtUSD(borrowAmt, 0)}</span>
                </p>
              );
            })}
          </div>
          <InfoBox variant="rose">
            <strong>Risk:</strong> Recursive lending amplifies liquidation risk. A price drop affects all loops simultaneously. Use carefully — a 20% collateral drop with 3x leverage can trigger cascading liquidations.
          </InfoBox>
        </div>
      </div>

      {/* Flash loans */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle><Zap size={14} className="text-yellow-400" /> Flash Loan Mechanics</SectionTitle>
        <p className="text-xs text-muted-foreground mb-3">
          Flash loans are uncollateralized loans that must be borrowed and repaid within a single transaction block. If repayment fails, the entire transaction reverts.
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { step: "1", action: "Borrow $10M USDC (0% collateral)", color: "text-primary" },
            { step: "2", action: "Buy asset on DEX A (artificially low price)", color: "text-emerald-300" },
            { step: "3", action: "Sell asset on DEX B (higher price = arbitrage profit)", color: "text-emerald-300" },
            { step: "4", action: "Repay $10M + 0.09% fee = $9,000 fee", color: "text-amber-300" },
            { step: "5", action: "Keep arbitrage profit (all in 1 transaction)", color: "text-primary" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground/10 text-muted-foreground flex items-center justify-center shrink-0">{s.step}</span>
              <span className={s.color}>{s.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol hacks */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle><AlertTriangle size={14} className="text-rose-400" /> Historical Protocol Hacks</SectionTitle>
        <div className="space-y-2">
          {PROTOCOL_HACKS.map((hack) => (
            <div key={hack.protocol} className="flex items-center gap-3 p-2 rounded-lg border border-border/50">
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">{hack.protocol}</span>
                <span className="text-xs text-muted-foreground ml-2">{hack.date}</span>
              </div>
              <span className="text-rose-400 font-medium text-sm">{fmtB(hack.amount)}</span>
              {hack.recovered ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">Recovered</Badge>
              ) : (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">Lost</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Yield Strategy Builder
// ══════════════════════════════════════════════════════════════════════════════

interface YieldStrategy {
  name: string;
  label: string;
  description: string;
  color: string;
  steps: Array<{ action: string; protocol: string; apy: number; risk: number; allocation: number }>;
  totalAPY: number;
  sharpe: number;
  gasTransactionsPerYear: number;
}

const PRESET_STRATEGIES: YieldStrategy[] = [
  {
    name: "safe",
    label: "Safe (Stablecoin)",
    description: "Stablecoin lending + liquid staking, minimal IL/volatility",
    color: "emerald",
    steps: [
      { action: "USDC Supply", protocol: "Aave V3", apy: 4.2, risk: 2, allocation: 50 },
      { action: "USDT Supply", protocol: "Compound V3", apy: 3.8, risk: 2, allocation: 30 },
      { action: "3pool LP", protocol: "Curve Finance", apy: 7.3, risk: 3, allocation: 20 },
    ],
    totalAPY: 5.1,
    sharpe: 1.8,
    gasTransactionsPerYear: 12,
  },
  {
    name: "balanced",
    label: "Balanced",
    description: "Mix of ETH staking, stablecoin yield, and small LP positions",
    color: "blue",
    steps: [
      { action: "ETH Staking (stETH)", protocol: "Lido", apy: 3.9, risk: 2, allocation: 30 },
      { action: "USDC Supply", protocol: "Aave V3", apy: 4.2, risk: 2, allocation: 30 },
      { action: "ETH/USDC LP", protocol: "Uniswap V3", apy: 8.4, risk: 5, allocation: 25 },
      { action: "ETH Vault", protocol: "Yearn", apy: 5.1, risk: 4, allocation: 15 },
    ],
    totalAPY: 5.8,
    sharpe: 1.4,
    gasTransactionsPerYear: 20,
  },
  {
    name: "growth",
    label: "Growth",
    description: "Higher APY with moderate risk: LP positions + DeFi composability",
    color: "indigo",
    steps: [
      { action: "ETH/USDC Conc. LP", protocol: "Uniswap V3", apy: 18.2, risk: 6, allocation: 35 },
      { action: "CRV/CVX Boost", protocol: "Convex", apy: 14.4, risk: 5, allocation: 30 },
      { action: "stETH Leverage Loop", protocol: "Aave V3", apy: 8.9, risk: 5, allocation: 25 },
      { action: "USDC Vault", protocol: "Yearn", apy: 7.0, risk: 4, allocation: 10 },
    ],
    totalAPY: 13.2,
    sharpe: 0.9,
    gasTransactionsPerYear: 48,
  },
  {
    name: "degen",
    label: "Degen",
    description: "Max APY with high volatility and IL risk — not for the faint hearted",
    color: "rose",
    steps: [
      { action: "GLP Multi-asset LP", protocol: "GMX", apy: 19.0, risk: 7, allocation: 30 },
      { action: "JOE/AVAX Farm", protocol: "JOE XYZ", apy: 133.9, risk: 10, allocation: 20 },
      { action: "PENDLE YT Farm", protocol: "Pendle", apy: 22.2, risk: 7, allocation: 25 },
      { action: "USDC Loop 3x", protocol: "Radiant", apy: 37.0, risk: 8, allocation: 25 },
    ],
    totalAPY: 48.6,
    sharpe: 0.3,
    gasTransactionsPerYear: 96,
  },
  {
    name: "delta-neutral",
    label: "Delta-Neutral",
    description: "Market-neutral yield: long spot + short perp hedge, earn funding rate",
    color: "purple",
    steps: [
      { action: "ETH Long (stETH)", protocol: "Lido", apy: 3.9, risk: 2, allocation: 50 },
      { action: "ETH Short Perp (fund.)", protocol: "dYdX", apy: 12.0, risk: 5, allocation: 50 },
    ],
    totalAPY: 7.95,
    sharpe: 2.1,
    gasTransactionsPerYear: 24,
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500 bg-emerald-500/20 text-emerald-300",
  blue: "border-primary bg-primary/20 text-primary",
  indigo: "border-indigo-500 bg-indigo-500/20 text-indigo-300",
  rose: "border-rose-500 bg-rose-500/20 text-rose-300",
  purple: "border-primary bg-primary/20 text-primary",
};

function YieldStrategyBuilder() {
  const [selected, setSelected] = useState(0);
  const [investment, setInvestment] = useState(50000);
  const [years, setYears] = useState(3);

  const strategy = PRESET_STRATEGIES[selected];
  const finalValue = investment * Math.pow(1 + strategy.totalAPY / 100, years);
  const gasCostAnnual = strategy.gasTransactionsPerYear * 50;
  const gasCostTotal = gasCostAnnual * years;
  const netFinalValue = finalValue - gasCostTotal;
  const taxEstimate = (finalValue - investment) * 0.3 * 0.15; // simplified 15% cap gains on 30%

  // Bar chart for strategy comparison
  const chartW = 500;
  const chartH = 80;
  const maxAPY = 50;

  return (
    <div className="space-y-6">
      {/* Strategy selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {PRESET_STRATEGIES.map((st, i) => (
          <button
            key={st.name}
            onClick={() => setSelected(i)}
            className={cn(
              "p-3 rounded-xl border text-left transition-colors",
              selected === i ? COLOR_MAP[st.color] : "border-border bg-foreground/5 hover:border-border"
            )}
          >
            <div className="font-medium text-xs text-foreground">{st.label}</div>
            <div className="text-xs text-emerald-400 mt-1">{fmtPct(st.totalAPY)} APY</div>
            <div className="text-xs text-muted-foreground">Sharpe: {st.sharpe.toFixed(1)}</div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Projected APY" value={fmtPct(strategy.totalAPY)} highlight="pos" />
        <StatCard label={`${years}yr Final Value`} value={fmtUSD(netFinalValue, 0)} sub="After gas costs" highlight="pos" />
        <StatCard label="Annual Gas Cost" value={fmtUSD(gasCostAnnual, 0)} sub={`${strategy.gasTransactionsPerYear} txns/yr @ $50`} highlight="warn" />
        <StatCard label="Tax Estimate" value={fmtUSD(taxEstimate, 0)} sub="Simplified 15% LT cap gains" highlight="warn" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategy steps */}
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>{strategy.label} — Strategy Steps</SectionTitle>
          <p className="text-xs text-muted-foreground mb-4">{strategy.description}</p>
          <div className="space-y-3">
            {strategy.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-foreground/5 border border-border/50"
              >
                <span className="w-6 h-6 rounded-full bg-foreground/10 text-muted-foreground text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{step.action}</div>
                  <div className="text-xs text-muted-foreground">{step.protocol}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-400">{fmtPct(step.apy)} APY</div>
                  <div className="text-xs text-muted-foreground">{step.allocation}% alloc</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 p-2 rounded-lg bg-foreground/5 border border-border text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk-Adj. Return (Sharpe-equiv)</span>
              <span className={cn("font-medium", strategy.sharpe >= 1.5 ? "text-emerald-400" : strategy.sharpe >= 0.8 ? "text-amber-400" : "text-rose-400")}>
                {strategy.sharpe.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* APY comparison bars */}
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>Strategy APY Comparison</SectionTitle>
          <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full h-28">
            {PRESET_STRATEGIES.map((st, i) => {
              const barH = Math.min((st.totalAPY / maxAPY) * chartH, chartH);
              const x = (i / PRESET_STRATEGIES.length) * chartW + 20;
              const w = chartW / PRESET_STRATEGIES.length - 40;
              const colors: Record<string, string> = {
                emerald: "#10b981",
                blue: "#3b82f6",
                indigo: "#6366f1",
                rose: "#f43f5e",
                purple: "#a855f7",
              };
              return (
                <g key={st.name}>
                  <rect
                    x={x}
                    y={chartH - barH}
                    width={w}
                    height={barH}
                    fill={colors[st.color]}
                    opacity={selected === i ? 1 : 0.4}
                    rx={3}
                  />
                  <text x={x + w / 2} y={chartH - barH - 4} textAnchor="middle" fontSize="8" fill={colors[st.color]}>
                    {fmtPct(st.totalAPY, 0)}
                  </text>
                  <text x={x + w / 2} y={chartH + 12} textAnchor="middle" fontSize="7" fill="#71717a">
                    {st.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Investment: {fmtUSD(investment, 0)}</label>
              <div className="flex gap-2 flex-wrap">
                {[10000, 50000, 100000, 500000].map((v) => (
                  <button key={v} onClick={() => setInvestment(v)} className={cn("px-2 py-1 rounded text-xs border transition-colors", investment === v ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-border bg-foreground/5 text-muted-foreground")}>
                    {fmtB(v)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Years: {years}</label>
              <input type="range" min={1} max={10} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      <InfoBox variant="amber">
        <strong>Tax implication:</strong> Every time you harvest rewards, it is a taxable event. Reinvesting (auto-compounding) staking rewards immediately creates a cost basis issue. Consider a tax-advantaged account structure and consult a tax professional specializing in DeFi. Annual gas costs of {fmtUSD(gasCostAnnual, 0)} ({strategy.gasTransactionsPerYear} txns) reduce net yield significantly for smaller positions.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 6 — Protocol Rankings
// ══════════════════════════════════════════════════════════════════════════════

interface ProtocolRanking {
  rank: number;
  name: string;
  tvl: number;
  tvlChange30d: number;
  rev30d: number;
  revChange30d: number;
  token: string;
  tokenPrice: number;
  pe: number;
  revTVL: number;
  moat: string;
  category: string;
}

const PROTOCOL_RANKINGS: ProtocolRanking[] = [
  { rank: 1, name: "Lido", tvl: 28_000_000_000, tvlChange30d: 4.2, rev30d: 38_000_000, revChange30d: 2.1, token: "LDO", tokenPrice: 1.82, pe: 42, revTVL: 0.14, moat: "Liquid staking network effect, stETH integrations", category: "Staking" },
  { rank: 2, name: "Aave V3", tvl: 12_000_000_000, tvlChange30d: 8.1, rev30d: 22_000_000, revChange30d: 5.3, token: "AAVE", tokenPrice: 162, pe: 38, revTVL: 0.18, moat: "Brand trust, multi-chain, safety module", category: "Lending" },
  { rank: 3, name: "Uniswap V3", tvl: 4_800_000_000, tvlChange30d: -2.3, rev30d: 48_000_000, revChange30d: -1.2, token: "UNI", tokenPrice: 7.8, pe: 28, revTVL: 1.0, moat: "Liquidity depth, concentrated positions, fee revenue", category: "DEX" },
  { rank: 4, name: "Curve Finance", tvl: 4_200_000_000, tvlChange30d: -4.1, rev30d: 14_000_000, revChange30d: -3.8, token: "CRV", tokenPrice: 0.48, pe: 55, revTVL: 0.33, moat: "Stablecoin flywheel, vote-escrowed model", category: "DEX" },
  { rank: 5, name: "EigenLayer", tvl: 3_800_000_000, tvlChange30d: 22.4, rev30d: 4_000_000, revChange30d: 18.2, token: "EIGEN", tokenPrice: 3.2, pe: 120, revTVL: 0.11, moat: "Restaking primitive, first-mover AVS", category: "Restaking" },
  { rank: 6, name: "MakerDAO", tvl: 8_600_000_000, tvlChange30d: 1.8, rev30d: 32_000_000, revChange30d: 0.9, token: "MKR", tokenPrice: 1820, pe: 15, revTVL: 0.37, moat: "DAI stablecoin, stability module, brand", category: "Stablecoin" },
  { rank: 7, name: "Compound V3", tvl: 2_400_000_000, tvlChange30d: -1.2, rev30d: 9_000_000, revChange30d: 0.5, token: "COMP", tokenPrice: 52, pe: 48, revTVL: 0.38, moat: "Permissionless markets, COMP governance", category: "Lending" },
  { rank: 8, name: "Convex Finance", tvl: 1_400_000_000, tvlChange30d: -5.8, rev30d: 7_500_000, revChange30d: -4.2, token: "CVX", tokenPrice: 2.8, pe: 22, revTVL: 0.54, moat: "Curve flywheel boost, cvxCRV liquid wrapper", category: "Yield" },
  { rank: 9, name: "GMX V2", tvl: 680_000_000, tvlChange30d: 12.3, rev30d: 11_000_000, revChange30d: 8.1, token: "GMX", tokenPrice: 24, pe: 18, revTVL: 1.62, moat: "GLP model, zero-price-impact trades, Arbitrum", category: "Perps DEX" },
  { rank: 10, name: "Pendle Finance", tvl: 320_000_000, tvlChange30d: 38.2, rev30d: 2_800_000, revChange30d: 34.1, token: "PENDLE", tokenPrice: 3.4, pe: 32, revTVL: 0.88, moat: "Yield tokenization primitive, PT/YT markets", category: "Yield" },
  { rank: 11, name: "Balancer V2", tvl: 890_000_000, tvlChange30d: -3.4, rev30d: 5_200_000, revChange30d: -2.1, token: "BAL", tokenPrice: 2.9, pe: 68, revTVL: 0.58, moat: "Weighted pools, boosted pools, veBAL", category: "DEX" },
  { rank: 12, name: "Rocket Pool", tvl: 4_200_000_000, tvlChange30d: 6.8, rev30d: 8_500_000, revChange30d: 5.2, token: "RPL", tokenPrice: 18.4, pe: 28, revTVL: 0.20, moat: "Decentralized node operators, rETH as DeFi collateral", category: "Staking" },
  { rank: 13, name: "Frax Finance", tvl: 680_000_000, tvlChange30d: -8.2, rev30d: 3_200_000, revChange30d: -6.8, token: "FXS", tokenPrice: 3.2, pe: 35, revTVL: 0.47, moat: "Fractional-algo stablecoin, frxETH ecosystem", category: "Stablecoin" },
  { rank: 14, name: "dYdX V4", tvl: 420_000_000, tvlChange30d: 14.6, rev30d: 6_800_000, revChange30d: 12.4, token: "DYDX", tokenPrice: 1.2, pe: 22, revTVL: 1.62, moat: "Cosmos appchain, order book DEX, DYDX staking", category: "Perps DEX" },
  { rank: 15, name: "Morpho Blue", tvl: 560_000_000, tvlChange30d: 28.4, rev30d: 1_800_000, revChange30d: 24.2, token: "MORPHO", tokenPrice: 0.8, pe: 95, revTVL: 0.32, moat: "Peer-to-peer lending optimization layer on Aave", category: "Lending" },
];

const DEFI_VS_CEFI = [
  { product: "Stablecoin Savings", defiRate: 4.2, cefiRate: 4.8, cefiPlatform: "HYSA/CDs", edge: "CeFi" },
  { product: "ETH Yield", defiRate: 3.9, cefiRate: 0, cefiPlatform: "N/A", edge: "DeFi" },
  { product: "BTC Yield", defiRate: 0.8, cefiRate: 1.5, cefiPlatform: "BlockFi/Nexo (defunct)", edge: "CeFi (but risky)" },
  { product: "Leveraged Yield (USDC)", defiRate: 14.2, cefiRate: 0, cefiPlatform: "N/A", edge: "DeFi" },
  { product: "Equity Lending", defiRate: 0, cefiRate: 8.0, cefiPlatform: "Prime brokers", edge: "CeFi" },
  { product: "Perps Funding Rate", defiRate: 12.0, cefiRate: 12.0, cefiPlatform: "Binance/Bybit", edge: "Comparable" },
  { product: "T-Bill Equivalent", defiRate: 5.0, cefiRate: 5.3, cefiPlatform: "3-month T-bill", edge: "CeFi" },
];

function ProtocolRankings() {
  const [sortBy, setSortBy] = useState<"tvl" | "rev" | "pe" | "revTVL">("tvl");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const sorted = useMemo(() => {
    return [...PROTOCOL_RANKINGS].sort((a, b) => {
      if (sortBy === "tvl") return b.tvl - a.tvl;
      if (sortBy === "rev") return b.rev30d - a.rev30d;
      if (sortBy === "pe") return a.pe - b.pe;
      return b.revTVL - a.revTVL;
    });
  }, [sortBy]);

  const maxTVL = Math.max(...PROTOCOL_RANKINGS.map((p) => p.tvl));
  const maxRev = Math.max(...PROTOCOL_RANKINGS.map((p) => p.rev30d));

  // Revenue by category SVG
  const categoryRevs: Record<string, number> = {};
  PROTOCOL_RANKINGS.forEach((p) => {
    categoryRevs[p.category] = (categoryRevs[p.category] ?? 0) + p.rev30d;
  });
  const cats = Object.entries(categoryRevs).sort((a, b) => b[1] - a[1]);
  const maxCatRev = cats[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        {[
          { key: "tvl" as const, label: "TVL" },
          { key: "rev" as const, label: "Revenue (30d)" },
          { key: "pe" as const, label: "P/E (lowest first)" },
          { key: "revTVL" as const, label: "Rev/TVL ratio" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={cn(
              "px-3 py-1.5 rounded text-xs border transition-colors",
              sortBy === s.key
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* TVL leaderboard */}
      <div className="rounded-xl border border-border bg-foreground/5 overflow-x-auto">
        <div className="p-4 border-b border-border">
          <SectionTitle>DeFi Protocol Leaderboard — Top 15 by TVL</SectionTitle>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase">
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Protocol</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">TVL</th>
              <th className="text-right p-3">30d %</th>
              <th className="text-right p-3">Rev (30d)</th>
              <th className="text-right p-3">P/E</th>
              <th className="text-right p-3">Rev/TVL</th>
              <th className="text-center p-3">Info</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => (
              <>
                <tr
                  key={p.name}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                >
                  <td className="p-3 text-muted-foreground font-mono">{p.rank}</td>
                  <td className="p-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.token}</div>
                  </td>
                  <td className="p-3">
                    <Badge className="bg-foreground/10 text-muted-foreground border-border text-xs">{p.category}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="text-foreground">{fmtB(p.tvl)}</div>
                    <div className="w-full bg-foreground/5 h-1 rounded mt-1">
                      <div className="h-full bg-indigo-500/60 rounded" style={{ width: `${(p.tvl / maxTVL) * 100}%` }} />
                    </div>
                  </td>
                  <td className={cn("p-3 text-right text-xs", p.tvlChange30d >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {p.tvlChange30d >= 0 ? "+" : ""}{fmtPct(p.tvlChange30d, 1)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="text-foreground">{fmtB(p.rev30d)}</div>
                    <div className="w-full bg-foreground/5 h-1 rounded mt-1">
                      <div className="h-full bg-emerald-500/60 rounded" style={{ width: `${(p.rev30d / maxRev) * 100}%` }} />
                    </div>
                  </td>
                  <td className={cn("p-3 text-right font-mono text-xs", p.pe <= 25 ? "text-emerald-400" : p.pe <= 50 ? "text-amber-400" : "text-muted-foreground")}>
                    {p.pe}x
                  </td>
                  <td className="p-3 text-right text-xs text-muted-foreground font-mono">
                    {(p.revTVL).toFixed(2)}%
                  </td>
                  <td className="p-3 text-center">
                    {expandedRow === idx ? (
                      <ChevronUp size={14} className="text-muted-foreground mx-auto" />
                    ) : (
                      <ChevronDown size={14} className="text-muted-foreground mx-auto" />
                    )}
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedRow === idx && (
                    <motion.tr
                      key={`${p.name}-detail`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={9} className="px-6 py-3 bg-foreground/5">
                        <p className="text-xs text-muted-foreground">
                          <span className="text-muted-foreground font-medium">Protocol Moat: </span>{p.moat}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Token <span className="text-muted-foreground">{p.token}</span> @ ${p.tokenPrice} &nbsp;|&nbsp;
                          30d Rev change: <span className={p.revChange30d >= 0 ? "text-emerald-400" : "text-rose-400"}>{p.revChange30d >= 0 ? "+" : ""}{fmtPct(p.revChange30d, 1)}</span>
                        </p>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revenue by category */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>Revenue by Category (30 days)</SectionTitle>
        <div className="space-y-2">
          {cats.map(([cat, rev]) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-28 text-xs text-muted-foreground shrink-0">{cat}</span>
              <div className="flex-1 bg-foreground/5 rounded h-5 relative overflow-hidden">
                <div
                  className="h-full bg-indigo-500/40 rounded transition-all"
                  style={{ width: `${(rev / maxCatRev) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-xs text-muted-foreground">
                  {fmtB(rev)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DeFi vs CeFi comparison */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>DeFi vs CeFi Rate Comparison</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                <th className="text-left p-2">Product</th>
                <th className="text-right p-2">DeFi Rate</th>
                <th className="text-right p-2">CeFi Rate</th>
                <th className="text-left p-2">CeFi Platform</th>
                <th className="text-center p-2">Edge</th>
              </tr>
            </thead>
            <tbody>
              {DEFI_VS_CEFI.map((row) => (
                <tr key={row.product} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-2 text-foreground">{row.product}</td>
                  <td className="p-2 text-right">
                    {row.defiRate > 0 ? (
                      <span className="text-indigo-400">{fmtPct(row.defiRate)}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    {row.cefiRate > 0 ? (
                      <span className="text-emerald-400">{fmtPct(row.cefiRate)}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="p-2 text-muted-foreground text-xs">{row.cefiPlatform}</td>
                  <td className="p-2 text-center">
                    <Badge
                      className={cn(
                        "text-xs",
                        row.edge === "DeFi" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" :
                        row.edge === "CeFi" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                        "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      )}
                    >
                      {row.edge}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox variant="blue">
        <strong>Protocol P/E Ratio:</strong> Similar to stocks, we can calculate a DeFi protocol&#39;s P/E by dividing fully-diluted market cap by annualized revenue. GMX at 18x P/E and MakerDAO at 15x are considered cheap vs. early-stage protocols like EigenLayer at 120x. However, DeFi protocols can grow revenue 10x+ in a bull cycle, making growth-adjusted metrics (PEG equivalent) more relevant.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════

export default function DefiPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-l-4 border-l-primary rounded-lg bg-card p-6 flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Droplets size={20} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DeFi Simulator</h1>
                <p className="text-sm text-muted-foreground">Yield Farming, Staking & Liquidity Protocol Lab</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              <Activity size={10} className="mr-1" />
              Live Data
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <Flame size={10} className="mr-1" />
              DeFi Summer
            </Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="yield" className="mt-8">
          <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 p-1">
            {[
              { value: "yield", label: "Yield Dashboard", icon: <BarChart3 size={13} /> },
              { value: "lp", label: "LP Simulator", icon: <Droplets size={13} /> },
              { value: "staking", label: "Staking Calc", icon: <Lock size={13} /> },
              { value: "lending", label: "Lending Analyzer", icon: <Layers size={13} /> },
              { value: "strategy", label: "Strategy Builder", icon: <Award size={13} /> },
              { value: "rankings", label: "Protocol Rankings", icon: <TrendingUp size={13} /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground flex items-center gap-1.5 text-xs px-3 py-2"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="yield" className="mt-4 data-[state=inactive]:hidden">
            <YieldDashboard />
          </TabsContent>
          <TabsContent value="lp" className="mt-4 data-[state=inactive]:hidden">
            <LiquidityPoolSimulator />
          </TabsContent>
          <TabsContent value="staking" className="mt-4 data-[state=inactive]:hidden">
            <StakingCalculator />
          </TabsContent>
          <TabsContent value="lending" className="mt-4 data-[state=inactive]:hidden">
            <LendingAnalyzer />
          </TabsContent>
          <TabsContent value="strategy" className="mt-4 data-[state=inactive]:hidden">
            <YieldStrategyBuilder />
          </TabsContent>
          <TabsContent value="rankings" className="mt-4 data-[state=inactive]:hidden">
            <ProtocolRankings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
