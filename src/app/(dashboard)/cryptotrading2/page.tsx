"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Shield,
  AlertTriangle,
  ArrowUpDown,
  Layers,
  Info,
  ChevronRight,
  Bitcoin,
  DollarSign,
  RefreshCw,
  Database,
  Lock,
  Globe,
  Percent,
  Scale,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG (seed=722008) ─────────────────────────────────────────────────
let s = 722008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 722008;
}

// ── Interfaces ────────────────────────────────────────────────────────────────

interface FundingRatePoint {
  hour: number;
  rate: number; // annualized %
}

interface PerpMarket {
  pair: string;
  fundingRate: number;
  markPrice: number;
  indexPrice: number;
  basis: number;
  openInterest: number; // USD millions
  volume24h: number;
  trend: "bullish" | "bearish" | "neutral";
}

interface OnChainSignal {
  name: string;
  category: string;
  value: string;
  signal: "bullish" | "bearish" | "neutral";
  strength: number; // 0-100
  description: string;
}

interface ArbitrageOpportunity {
  name: string;
  type: string;
  annualizedReturn: number;
  risk: "low" | "medium" | "high";
  capital: string;
  description: string;
  mechanics: string[];
}

interface CryptoRisk {
  name: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  probability: number;
  mitigation: string;
  description: string;
}

interface VolSurfaceCell {
  strike: number; // % of spot
  expiry: string;
  iv: number; // %
}

// ── Data Generation ───────────────────────────────────────────────────────────

function generateFundingHistory(): FundingRatePoint[] {
  resetSeed();
  const points: FundingRatePoint[] = [];
  let rate = 0.01; // start near 0.01% per 8h
  for (let i = 0; i < 72; i++) {
    rate += (rand() - 0.5) * 0.008;
    rate = Math.max(-0.05, Math.min(0.1, rate));
    points.push({ hour: i, rate: rate * 3 * 365 }); // annualize
  }
  return points;
}

function generatePerpMarkets(): PerpMarket[] {
  resetSeed();
  const pairs = ["BTC-PERP", "ETH-PERP", "SOL-PERP", "BNB-PERP", "AVAX-PERP", "ARB-PERP"];
  const basePrices = [67420, 3480, 142, 385, 34.5, 1.12];
  return pairs.map((pair, i) => {
    const price = basePrices[i] * (1 + (rand() - 0.5) * 0.02);
    const basisPct = (rand() - 0.4) * 0.3;
    const mark = price * (1 + basisPct / 100);
    const fr = (rand() - 0.3) * 0.05;
    const oi = 200 + rand() * 2000;
    const vol = oi * (0.5 + rand() * 2);
    const trend = fr > 0.01 ? "bullish" : fr < -0.005 ? "bearish" : "neutral";
    return {
      pair,
      fundingRate: parseFloat(fr.toFixed(4)),
      markPrice: parseFloat(mark.toFixed(2)),
      indexPrice: parseFloat(price.toFixed(2)),
      basis: parseFloat(basisPct.toFixed(4)),
      openInterest: parseFloat(oi.toFixed(1)),
      volume24h: parseFloat(vol.toFixed(1)),
      trend,
    };
  });
}

function generateOnChainSignals(): OnChainSignal[] {
  resetSeed();
  return [
    {
      name: "Exchange Net Flow (BTC)",
      category: "Exchange Flow",
      value: `-${(rand() * 5000 + 1000).toFixed(0)} BTC/day`,
      signal: "bullish",
      strength: Math.floor(rand() * 30 + 65),
      description: "Net outflow from exchanges indicates holders moving to cold storage — bullish accumulation.",
    },
    {
      name: "Miner Selling Pressure",
      category: "Mining",
      value: `${(rand() * 20 + 5).toFixed(1)}% of daily issuance`,
      signal: "neutral",
      strength: Math.floor(rand() * 20 + 40),
      description: "Miner-to-exchange flows are below historical average, reducing sell-side pressure.",
    },
    {
      name: "Whale Accumulation (>1000 BTC)",
      category: "Whale Activity",
      value: `+${(rand() * 300 + 50).toFixed(0)} addresses`,
      signal: "bullish",
      strength: Math.floor(rand() * 25 + 70),
      description: "Wallets holding 1000+ BTC have been growing for 14 consecutive days.",
    },
    {
      name: "SOPR (Spent Output Profit Ratio)",
      category: "On-Chain Profit",
      value: (rand() * 0.3 + 1.05).toFixed(3),
      signal: "bullish",
      strength: Math.floor(rand() * 20 + 55),
      description: "SOPR > 1 means on-chain transactions are on average in profit, indicating healthy market.",
    },
    {
      name: "NUPL (Net Unrealized P/L)",
      category: "Market Sentiment",
      value: (rand() * 0.2 + 0.45).toFixed(3),
      signal: "neutral",
      strength: Math.floor(rand() * 20 + 50),
      description: "In 'Belief' zone (0.5–0.75). Approaching optimism territory but not euphoria.",
    },
    {
      name: "Stablecoin Supply Ratio",
      category: "Liquidity",
      value: (rand() * 0.01 + 0.005).toFixed(4),
      signal: "bullish",
      strength: Math.floor(rand() * 25 + 60),
      description: "Lower SSR means more stablecoin buying power relative to BTC market cap.",
    },
    {
      name: "Hash Rate Momentum",
      category: "Mining",
      value: `${(rand() * 30 + 580).toFixed(0)} EH/s`,
      signal: "bullish",
      strength: Math.floor(rand() * 20 + 65),
      description: "Hash rate at all-time highs signals miner confidence in long-term price prospects.",
    },
    {
      name: "Long-Term Holder Supply",
      category: "HODLer Behavior",
      value: `${(rand() * 2 + 70).toFixed(1)}% of supply`,
      signal: "bullish",
      strength: Math.floor(rand() * 15 + 70),
      description: "Record % of BTC unmoved for 1+ year, reducing available circulating supply.",
    },
  ];
}

function generateArbitrageOpps(): ArbitrageOpportunity[] {
  resetSeed();
  return [
    {
      name: "Cash-and-Carry Arbitrage",
      type: "Basis Trade",
      annualizedReturn: parseFloat((rand() * 8 + 5).toFixed(1)),
      risk: "low",
      capital: "$50K+",
      description: "Buy spot BTC while shorting equivalent BTC futures. Lock in the futures premium as risk-free yield.",
      mechanics: [
        "1. Buy 1 BTC spot on exchange",
        "2. Short 1 BTC perpetual or dated futures",
        "3. Collect funding/basis as delta-neutral yield",
        "4. Unwind when basis collapses or at expiry",
      ],
    },
    {
      name: "Funding Rate Farming",
      type: "Perpetual Funding",
      annualizedReturn: parseFloat((rand() * 20 + 15).toFixed(1)),
      risk: "medium",
      capital: "$10K+",
      description: "When funding is persistently positive, go spot long + perp short. Earn funding every 8 hours.",
      mechanics: [
        "1. Identify perpetuals with high funding (>0.05%/8h)",
        "2. Open delta-neutral: long spot, short perp",
        "3. Receive funding payments every 8 hours",
        "4. Monitor for funding regime change — exit when negative",
      ],
    },
    {
      name: "Cross-Exchange Arbitrage",
      type: "Price Discrepancy",
      annualizedReturn: parseFloat((rand() * 30 + 20).toFixed(1)),
      risk: "medium",
      capital: "$100K+",
      description: "Exploit temporary price discrepancies across exchanges. Requires low-latency infrastructure.",
      mechanics: [
        "1. Monitor price feeds from 5+ exchanges simultaneously",
        "2. When spread > fees + slippage, execute instantly",
        "3. Buy on cheaper exchange, sell on expensive",
        "4. Transfer crypto to rebalance positions periodically",
      ],
    },
    {
      name: "Liquidation Cascade Hunting",
      type: "Event-Driven",
      annualizedReturn: parseFloat((rand() * 40 + 30).toFixed(1)),
      risk: "high",
      capital: "$5K+",
      description: "Anticipate and trade around liquidation cascades. High risk — requires deep order book understanding.",
      mechanics: [
        "1. Track large open interest concentrations via OI heatmaps",
        "2. Identify liquidation price clusters (often at round numbers)",
        "3. Position ahead of cascading liquidations",
        "4. Tight stops required — cascades can reverse sharply",
      ],
    },
  ];
}

function generateCryptoRisks(): CryptoRisk[] {
  resetSeed();
  return [
    {
      name: "Exchange Insolvency",
      category: "Counterparty",
      severity: "critical",
      probability: Math.floor(rand() * 10 + 5),
      mitigation: "Use self-custody; spread across 3+ reputable CEXs; track proof-of-reserves",
      description: "Exchange collapses (FTX, Celsius) have wiped out billions. Not covered by any deposit insurance.",
    },
    {
      name: "Smart Contract Exploit",
      category: "Protocol",
      severity: "critical",
      probability: Math.floor(rand() * 15 + 8),
      mitigation: "Audit-verified protocols only; diversify DeFi positions; monitor tvl.wtf",
      description: "Unaudited or novel protocols can be drained in minutes. $2B+ lost to exploits in 2023 alone.",
    },
    {
      name: "Regulatory Crackdown",
      category: "Regulatory",
      severity: "high",
      probability: Math.floor(rand() * 20 + 15),
      mitigation: "Geo-diversify; use compliant platforms; maintain tax records; avoid unregistered securities",
      description: "SEC/CFTC actions, exchange bans, or outright bans in key markets create sudden liquidity crises.",
    },
    {
      name: "Liquidation Cascade",
      category: "Market",
      severity: "high",
      probability: Math.floor(rand() * 25 + 20),
      mitigation: "Keep leverage below 3x; maintain margin buffer; set stop-losses before entry",
      description: "Leveraged positions create downward spirals. $1B+ liquidated in hours during volatile moves.",
    },
    {
      name: "Oracle Manipulation",
      category: "Protocol",
      severity: "high",
      probability: Math.floor(rand() * 10 + 5),
      mitigation: "Use protocols with Chainlink/Pyth oracles; avoid protocols with single-source price feeds",
      description: "Flash loan attacks manipulate on-chain price oracles enabling instant large-scale arbitrage attacks.",
    },
    {
      name: "Network Congestion / MEV",
      category: "Infrastructure",
      severity: "medium",
      probability: Math.floor(rand() * 30 + 30),
      mitigation: "Use MEV-protected RPCs (Flashbots Protect); limit orders via DEX aggregators",
      description: "MEV bots frontrun transactions; network congestion during crashes means exits cost 10–100x normal.",
    },
    {
      name: "BTC Correlation Collapse",
      category: "Market",
      severity: "medium",
      probability: Math.floor(rand() * 20 + 15),
      mitigation: "Maintain BTC/ETH core; diversify into uncorrelated assets (real world assets, stablecoins)",
      description: "During market stress, crypto assets converge to near 1.0 correlation with BTC, eliminating diversification.",
    },
  ];
}

function generateVolSurface(): VolSurfaceCell[] {
  resetSeed();
  const strikes = [70, 80, 85, 90, 95, 100, 105, 110, 115, 120, 130];
  const expiries = ["1W", "2W", "1M", "2M", "3M", "6M"];
  const cells: VolSurfaceCell[] = [];
  for (const expiry of expiries) {
    for (const strike of strikes) {
      const atmBase = 55 + rand() * 10; // ATM IV baseline
      const skew = (100 - strike) * 0.4; // put skew
      const termAdj = expiries.indexOf(expiry) * 2.5; // term structure upward slope
      const smileAdj = Math.abs(strike - 100) * 0.15;
      const iv = atmBase + skew + termAdj + smileAdj + (rand() - 0.5) * 3;
      cells.push({ strike, expiry, iv: parseFloat(Math.max(20, iv).toFixed(1)) });
    }
  }
  return cells;
}

// ── Helper functions ──────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "red" | "amber" | "blue" | "purple" | "muted";
}) {
  const colorMap: Record<string, string> = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-primary/10 text-primary border-border",
    purple: "bg-primary/10 text-primary border-border",
    muted: "bg-foreground/5 text-foreground/60 border-border",
  };
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center", colorMap[color])}>
      <div className="text-xs text-foreground/50 mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-foreground/50 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── SVG: Funding Rate History Chart ──────────────────────────────────────────

function FundingRateChart({ data }: { data: FundingRatePoint[] }) {
  const W = 700;
  const H = 160;
  const PAD = { t: 12, r: 16, b: 32, l: 52 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const minRate = Math.min(...data.map((d) => d.rate));
  const maxRate = Math.max(...data.map((d) => d.rate));
  const range = maxRate - minRate || 1;
  const zero = ((0 - minRate) / range) * chartH;
  const zeroY = PAD.t + chartH - zero;

  const xScale = (i: number) => PAD.l + (i / (data.length - 1)) * chartW;
  const yScale = (v: number) => PAD.t + chartH - ((v - minRate) / range) * chartH;

  const posPath = data
    .map((d, i) => {
      if (d.rate < 0) return null;
      const x = xScale(i);
      const y = yScale(d.rate);
      return i === 0 || data[i - 1].rate < 0 ? `M${x},${Math.min(y, zeroY)} L${x},${y}` : `L${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.rate)}`).join(" ");

  const yLabels = [-20, 0, 10, 20, 30, 40];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Grid */}
      {yLabels.map((v) => {
        if (v < minRate - 5 || v > maxRate + 5) return null;
        const y = yScale(v);
        return (
          <g key={v}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.4)">
              {v}%
            </text>
          </g>
        );
      })}

      {/* Zero line */}
      <line
        x1={PAD.l}
        y1={zeroY}
        x2={W - PAD.r}
        y2={zeroY}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      {/* Area fill */}
      <defs>
        <linearGradient id="fundingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="fundingNegGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Positive area */}
      <path
        d={`${linePath} L${xScale(data.length - 1)},${zeroY} L${xScale(0)},${zeroY} Z`}
        fill="url(#fundingGrad)"
        clipPath="url(#aboveZero)"
      />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="1.5" />

      {/* X-axis labels */}
      {[0, 12, 24, 36, 48, 60, 71].map((i) => (
        <text key={i} x={xScale(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
          -{Math.floor((71 - i) / 24) === 0 ? "now" : `${Math.floor((71 - i) / 24)}d`}
        </text>
      ))}

      <text x={W / 2} y={H - 0} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">
        Annualized Funding Rate (%) — last 72 hours
      </text>
    </svg>
  );
}

// ── SVG: Vol Surface Heatmap ──────────────────────────────────────────────────

function VolSurfaceHeatmap({ data }: { data: VolSurfaceCell[] }) {
  const strikes = [70, 80, 85, 90, 95, 100, 105, 110, 115, 120, 130];
  const expiries = ["1W", "2W", "1M", "2M", "3M", "6M"];
  const W = 580;
  const H = 240;
  const PAD = { t: 24, r: 16, b: 40, l: 52 };
  const cellW = (W - PAD.l - PAD.r) / strikes.length;
  const cellH = (H - PAD.t - PAD.b) / expiries.length;

  const allIVs = data.map((d) => d.iv);
  const minIV = Math.min(...allIVs);
  const maxIV = Math.max(...allIVs);

  function ivToColor(iv: number): string {
    const t = (iv - minIV) / (maxIV - minIV);
    // Blue (low) → Green → Yellow → Red (high)
    if (t < 0.33) {
      const s = t / 0.33;
      const r = Math.round(s * 34);
      const g = Math.round(s * 197);
      const b = Math.round(211 - s * 177);
      return `rgb(${r},${g},${b})`;
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      const r = Math.round(34 + s * 220);
      const g = Math.round(197 - s * 30);
      const b = Math.round(34 - s * 20);
      return `rgb(${r},${g},${b})`;
    } else {
      const s = (t - 0.66) / 0.34;
      const r = Math.round(254 - s * 50);
      const g = Math.round(167 - s * 167);
      const b = Math.round(14 - s * 5);
      return `rgb(${r},${g},${b})`;
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 240 }}>
      {/* Column labels (strikes) */}
      {strikes.map((strike, si) => (
        <text
          key={strike}
          x={PAD.l + si * cellW + cellW / 2}
          y={PAD.t - 6}
          textAnchor="middle"
          fontSize="8.5"
          fill="rgba(255,255,255,0.5)"
        >
          {strike}%
        </text>
      ))}

      {/* Row labels (expiries) */}
      {expiries.map((exp, ei) => (
        <text
          key={exp}
          x={PAD.l - 6}
          y={PAD.t + ei * cellH + cellH / 2 + 3}
          textAnchor="end"
          fontSize="9"
          fill="rgba(255,255,255,0.5)"
        >
          {exp}
        </text>
      ))}

      {/* Cells */}
      {data.map((cell) => {
        const si = strikes.indexOf(cell.strike);
        const ei = expiries.indexOf(cell.expiry);
        const x = PAD.l + si * cellW;
        const y = PAD.t + ei * cellH;
        return (
          <g key={`${cell.strike}-${cell.expiry}`}>
            <rect
              x={x + 1}
              y={y + 1}
              width={cellW - 2}
              height={cellH - 2}
              fill={ivToColor(cell.iv)}
              rx="2"
              opacity="0.85"
            />
            <text
              x={x + cellW / 2}
              y={y + cellH / 2 + 3.5}
              textAnchor="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.85)"
              fontWeight="600"
            >
              {cell.iv.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <defs>
        <linearGradient id="legendGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(0,34,211)" />
          <stop offset="33%" stopColor="rgb(34,197,34)" />
          <stop offset="66%" stopColor="rgb(254,167,14)" />
          <stop offset="100%" stopColor="rgb(204,0,9)" />
        </linearGradient>
      </defs>
      <rect x={PAD.l} y={H - 14} width={W - PAD.l - PAD.r} height={7} rx="3" fill="url(#legendGrad)" opacity="0.8" />
      <text x={PAD.l} y={H - 0.5} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="start">
        Low IV ({minIV.toFixed(0)}%)
      </text>
      <text x={W - PAD.r} y={H - 0.5} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end">
        High IV ({maxIV.toFixed(0)}%)
      </text>
    </svg>
  );
}

// ── SVG: OI Bar Chart ─────────────────────────────────────────────────────────

function OIBarChart({ markets }: { markets: PerpMarket[] }) {
  const W = 500;
  const H = 160;
  const PAD = { t: 12, r: 16, b: 40, l: 60 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxOI = Math.max(...markets.map((m) => m.openInterest));
  const barW = (chartW / markets.length) * 0.6;
  const gap = chartW / markets.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = PAD.t + chartH - frac * chartH;
        const val = (frac * maxOI).toFixed(0);
        return (
          <g key={frac}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.l - 5} y={y + 3} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.35)">
              ${val}M
            </text>
          </g>
        );
      })}
      {markets.map((m, i) => {
        const x = PAD.l + i * gap + (gap - barW) / 2;
        const barH = (m.openInterest / maxOI) * chartH;
        const y = PAD.t + chartH - barH;
        const color = m.trend === "bullish" ? "#22c55e" : m.trend === "bearish" ? "#ef4444" : "#6366f1";
        return (
          <g key={m.pair}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2" opacity="0.8" />
            <text
              x={x + barW / 2}
              y={PAD.t + chartH + 14}
              textAnchor="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.5)"
            >
              {m.pair.replace("-PERP", "")}
            </text>
            <text
              x={x + barW / 2}
              y={y - 3}
              textAnchor="middle"
              fontSize="7.5"
              fill="rgba(255,255,255,0.6)"
            >
              ${m.openInterest.toFixed(0)}M
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CryptoTrading2Page() {
  const [activeTab, setActiveTab] = useState("market-structure");

  const fundingHistory = useMemo(() => generateFundingHistory(), []);
  const perpMarkets = useMemo(() => generatePerpMarkets(), []);
  const onChainSignals = useMemo(() => generateOnChainSignals(), []);
  const arbitrageOpps = useMemo(() => generateArbitrageOpps(), []);
  const cryptoRisks = useMemo(() => generateCryptoRisks(), []);
  const volSurface = useMemo(() => generateVolSurface(), []);

  const bullishSignals = onChainSignals.filter((s) => s.signal === "bullish").length;
  const bearishSignals = onChainSignals.filter((s) => s.signal === "bearish").length;
  const avgFunding = perpMarkets.reduce((a, m) => a + m.fundingRate, 0) / perpMarkets.length;
  const totalOI = perpMarkets.reduce((a, m) => a + m.openInterest, 0);

  const severityColor: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-green-500/15 text-green-400 border-green-500/30",
  };

  const riskColor: Record<string, string> = {
    low: "bg-green-500/15 text-green-400 border-green-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    high: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* HERO Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-primary rounded-md bg-card p-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Bitcoin className="h-6 w-6 text-amber-400" />
            Crypto Advanced Trading
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            Market microstructure, on-chain signals, derivatives &amp; risk management
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <StatChip label="Avg Funding" value={`${(avgFunding * 100).toFixed(3)}%/8h`} color={avgFunding > 0 ? "green" : "red"} />
          <StatChip label="Total OI" value={`$${(totalOI / 1000).toFixed(1)}B`} color="blue" />
          <StatChip label="On-Chain" value={`${bullishSignals}B / ${bearishSignals}Br`} color="green" />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-foreground/5 border border-border rounded-md p-1 flex flex-wrap gap-1 h-auto">
          {[
            { value: "market-structure", label: "Market Structure", icon: <BarChart3 className="h-3.5 w-3.5" /> },
            { value: "onchain", label: "On-Chain Signals", icon: <Database className="h-3.5 w-3.5" /> },
            { value: "strategies", label: "Strategies", icon: <Zap className="h-3.5 w-3.5" /> },
            { value: "risk", label: "Risk Management", icon: <Shield className="h-3.5 w-3.5" /> },
            { value: "derivatives", label: "Derivatives Deep Dive", icon: <Layers className="h-3.5 w-3.5" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-foreground/15 data-[state=active]:text-foreground text-foreground/50"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Market Structure ────────────────────────────────────────── */}
        <TabsContent value="market-structure" className="space-y-6">
          {/* Explainer row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <ArrowUpDown className="h-4 w-4 text-primary" />,
                title: "Spot vs Perpetuals",
                body: "Spot markets settle immediately; perpetual futures never expire. Perps use a funding rate mechanism to keep mark price tethered to spot — longs pay shorts when perps trade at premium.",
              },
              {
                icon: <Percent className="h-4 w-4 text-green-400" />,
                title: "Funding Rate Mechanics",
                body: "Funding is paid every 8 hours (Binance) or 1 hour (Bybit). Positive funding = market is long-biased, longs pay 0.01–0.1%. Extreme sustained funding signals crowded trades and potential squeeze.",
              },
              {
                icon: <Scale className="h-4 w-4 text-primary" />,
                title: "Basis Trade",
                body: "Basis = Futures Price − Spot Price. Positive basis (contango) is common in bull markets. Traders capture basis by buying spot and shorting futures, earning the annualized premium as delta-neutral yield.",
              },
            ].map((card) => (
              <Card key={card.title} className="bg-foreground/[0.03] border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {card.icon}
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/60 leading-relaxed">{card.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Perp Markets Table */}
          <Card className="bg-foreground/[0.03] border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Perpetual Futures Markets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Pair", "Mark Price", "Index Price", "Basis", "Funding/8h", "Open Interest", "24h Volume", "Trend"].map(
                        (h) => (
                          <th key={h} className="text-left text-foreground/40 font-medium px-4 py-3">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {perpMarkets.map((m) => (
                      <tr
                        key={m.pair}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{m.pair}</td>
                        <td className="px-4 py-3 text-foreground/80">
                          ${m.markPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-foreground/60">
                          ${m.indexPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 font-medium",
                            m.basis > 0 ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {m.basis > 0 ? "+" : ""}
                          {m.basis.toFixed(3)}%
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 font-medium",
                            m.fundingRate > 0.005 ? "text-amber-400" : m.fundingRate < 0 ? "text-red-400" : "text-foreground/60"
                          )}
                        >
                          {(m.fundingRate * 100).toFixed(4)}%
                        </td>
                        <td className="px-4 py-3 text-foreground/70">${m.openInterest.toFixed(0)}M</td>
                        <td className="px-4 py-3 text-foreground/60">${m.volume24h.toFixed(0)}M</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "text-xs capitalize",
                              m.trend === "bullish"
                                ? "bg-green-500/15 text-green-400 border-green-500/30"
                                : m.trend === "bearish"
                                ? "bg-red-500/15 text-red-400 border-red-500/30"
                                : "bg-foreground/[0.08] text-foreground/50"
                            )}
                          >
                            {m.trend}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Open Interest Chart + Funding Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-foreground/[0.03] border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Open Interest by Pair</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <OIBarChart markets={perpMarkets} />
                <p className="text-xs text-foreground/40 mt-2">
                  Bar color: green = long-biased funding, red = short-biased, purple = neutral
                </p>
              </CardContent>
            </Card>
            <Card className="bg-foreground/[0.03] border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">BTC-PERP Funding Rate History</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div style={{ height: 160 }}>
                  <FundingRateChart data={fundingHistory} />
                </div>
                <p className="text-xs text-foreground/40 mt-2">
                  Annualized rate shown. Values &gt;20% suggest crowded longs; negative rates suggest crowded shorts.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: On-Chain Signals ────────────────────────────────────────── */}
        <TabsContent value="onchain" className="space-y-6">
          {/* Summary scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatChip label="Bullish Signals" value={String(bullishSignals)} color="green" />
            <StatChip label="Bearish Signals" value={String(bearishSignals)} color="red" />
            <StatChip
              label="Neutral Signals"
              value={String(onChainSignals.length - bullishSignals - bearishSignals)}
              color="muted"
            />
            <StatChip
              label="Composite Score"
              value={`${Math.round(
                onChainSignals.reduce((a, s) => a + (s.signal === "bullish" ? s.strength : s.signal === "bearish" ? -s.strength : 0), 0) /
                  onChainSignals.length
              )}/100`}
              color="blue"
            />
          </div>

          {/* Educational overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp className="h-4 w-4 text-green-400" />,
                title: "Exchange Inflow / Outflow",
                body: "Net exchange outflows (coins leaving exchanges to wallets) are historically bullish — holders self-custodying reduces sell-side supply. Large inflows precede sell-offs.",
              },
              {
                icon: <Bitcoin className="h-4 w-4 text-amber-400" />,
                title: "Miner Selling Pressure",
                body: "Miners sell BTC to cover operational costs. High miner-to-exchange flows signal financial stress or distribution. Low miner outflows = miners are holding = confidence in price.",
              },
              {
                icon: <Globe className="h-4 w-4 text-primary" />,
                title: "Whale Accumulation",
                body: "Wallets with 1,000–10,000 BTC are tracked as whales. Increasing wallet count at these bands, especially near support levels, signals institutional accumulation.",
              },
            ].map((card) => (
              <Card key={card.title} className="bg-foreground/[0.03] border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {card.icon}
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/60 leading-relaxed">{card.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Signal Scorecard Table */}
          <Card className="bg-foreground/[0.03] border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                On-Chain Signal Scorecard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Signal", "Category", "Current Value", "Signal", "Strength", "Interpretation"].map((h) => (
                        <th key={h} className="text-left text-foreground/40 font-medium px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {onChainSignals.map((sig) => (
                      <tr key={sig.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{sig.name}</td>
                        <td className="px-4 py-3 text-foreground/50">{sig.category}</td>
                        <td className="px-4 py-3 font-mono text-foreground/80">{sig.value}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "text-xs capitalize",
                              sig.signal === "bullish"
                                ? "bg-green-500/15 text-green-400 border-green-500/30"
                                : sig.signal === "bearish"
                                ? "bg-red-500/15 text-red-400 border-red-500/30"
                                : "bg-foreground/[0.08] text-foreground/50"
                            )}
                          >
                            {sig.signal}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={sig.strength}
                              className="h-1.5 w-20 bg-foreground/10"
                            />
                            <span className="text-foreground/60 tabular-nums">{sig.strength}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground/50 max-w-xs">{sig.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Trading Strategies ──────────────────────────────────────── */}
        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arbitrageOpps.map((opp) => (
              <motion.div
                key={opp.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="bg-foreground/[0.03] border-border/50 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">{opp.name}</CardTitle>
                        <p className="text-xs text-foreground/40 mt-0.5">{opp.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={cn("text-xs capitalize", riskColor[opp.risk])}>
                          {opp.risk} risk
                        </Badge>
                        <Badge className="text-xs bg-primary/15 text-primary border-border">
                          {opp.annualizedReturn.toFixed(1)}% APY
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-foreground/60 leading-relaxed">{opp.description}</p>
                    <div className="bg-foreground/[0.04] rounded-lg p-3 space-y-1.5">
                      <p className="text-xs text-foreground/40 font-medium uppercase tracking-wide mb-2">Mechanics</p>
                      {opp.mechanics.map((step) => (
                        <div key={step} className="flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 text-foreground/30 mt-0.5 shrink-0" />
                          <p className="text-xs text-foreground/70">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/40">
                      <DollarSign className="h-3.5 w-3.5" />
                      Minimum capital: {opp.capital}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Strategy comparison table */}
          <Card className="bg-foreground/[0.03] border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Strategy Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Strategy", "Return", "Risk", "Capital Req.", "Delta Neutral", "Execution Complexity"].map(
                        (h) => (
                          <th key={h} className="text-left text-foreground/40 font-medium px-4 py-3">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Cash-and-Carry", "5–13% APY", "Low", "$50K+", "Yes", "Medium"],
                      ["Funding Farming", "15–35% APY", "Medium", "$10K+", "Yes", "Low"],
                      ["Cross-Exchange Arb", "20–50% APY", "Medium", "$100K+", "Yes", "High"],
                      ["Liquidation Hunting", "30–70% APY", "High", "$5K+", "No", "Very High"],
                    ].map(([strat, ret, risk, cap, delta, comp]) => (
                      <tr key={strat} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{strat}</td>
                        <td className="px-4 py-3 text-green-400">{ret}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "text-xs",
                              risk === "Low"
                                ? "bg-green-500/15 text-green-400 border-green-500/30"
                                : risk === "Medium"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-red-500/15 text-red-400 border-red-500/30"
                            )}
                          >
                            {risk}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-foreground/70">{cap}</td>
                        <td className="px-4 py-3 text-foreground/60">{delta}</td>
                        <td className="px-4 py-3 text-foreground/60">{comp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Risk Management ─────────────────────────────────────────── */}
        <TabsContent value="risk" className="space-y-6">
          {/* Risk overview chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatChip
              label="Critical Risks"
              value={String(cryptoRisks.filter((r) => r.severity === "critical").length)}
              color="red"
            />
            <StatChip
              label="High Risks"
              value={String(cryptoRisks.filter((r) => r.severity === "high").length)}
              color="amber"
            />
            <StatChip label="BTC Correlation" value="0.82 (crisis)" color="purple" />
            <StatChip label="Recommended Leverage" value="≤ 3x" color="muted" />
          </div>

          {/* Risk Register */}
          <Card className="bg-foreground/[0.03] border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Crypto Risk Register
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cryptoRisks.map((risk) => (
                <div
                  key={risk.name}
                  className="bg-foreground/[0.03] rounded-md p-4 border border-border/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{risk.name}</span>
                        <Badge className={cn("text-xs capitalize", severityColor[risk.severity])}>
                          {risk.severity}
                        </Badge>
                        <Badge className="text-xs bg-foreground/[0.08] text-foreground/50 border-border">
                          {risk.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/55 mt-1">{risk.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-foreground/40">Probability</p>
                      <p className="text-sm font-semibold text-foreground/80">{risk.probability}%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-foreground/[0.04] rounded-lg px-3 py-2">
                    <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground/60">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Position Sizing + Portfolio Construction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-foreground/[0.03] border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Position Sizing Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    rule: "1% Risk Per Trade",
                    detail:
                      "Never risk more than 1% of total portfolio on a single trade. With $50K portfolio: max loss = $500 per trade.",
                  },
                  {
                    rule: "Kelly Criterion (Half-Kelly)",
                    detail: "f* = (p·b - q) / b where p=win%, q=1-p, b=avg_win/avg_loss. Use half-Kelly to reduce variance.",
                  },
                  {
                    rule: "Max 20% in Altcoins",
                    detail:
                      "Altcoins carry 3–10x the volatility of BTC. Cap altcoin exposure at 20% of crypto allocation.",
                  },
                  {
                    rule: "Ladder Into Positions",
                    detail:
                      "Split entries into 3–4 tranches. Enter 25% at level, 25% on confirmation, 25% on retest, 25% in reserve.",
                  },
                ].map((item) => (
                  <div key={item.rule} className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground/85">{item.rule}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-foreground/[0.03] border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Crypto Portfolio Construction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "BTC (Store of Value Core)", weight: 50, color: "bg-amber-400" },
                  { label: "ETH (Smart Contract Layer)", weight: 25, color: "bg-primary" },
                  { label: "Large-Cap Alts (SOL, BNB)", weight: 12, color: "bg-primary" },
                  { label: "Small-Cap / DeFi", weight: 8, color: "bg-green-400" },
                  { label: "Stablecoins (Dry Powder)", weight: 5, color: "bg-foreground/[0.04]0" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/70">{item.label}</span>
                      <span className="text-foreground/60 tabular-nums">{item.weight}%</span>
                    </div>
                    <div className="h-1.5 bg-foreground/[0.08] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: `${item.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-foreground/40 pt-1">
                  Rebalance monthly. Increase stables during negative funding periods or bearish OBV.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 5: Derivatives Deep Dive ──────────────────────────────────── */}
        <TabsContent value="derivatives" className="space-y-6">
          {/* Concepts row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <RefreshCw className="h-4 w-4 text-primary" />,
                title: "Perpetual Swaps Mechanism",
                body: "Perpetuals have no expiry. Funding rate = clamp(premium_index + clamp(0.01% - premium_index, -0.05%, 0.05%)). Convergence force: if longs are paying 0.03%/8h, bears earn; crowd converges mark to index.",
              },
              {
                icon: <Lock className="h-4 w-4 text-green-400" />,
                title: "Options on Crypto (Deribit)",
                body: "Deribit dominates BTC/ETH options with 85%+ market share. Settlement in BTC/ETH (not USD). European-style, cash-settled at expiry UTC 8:00. Key use cases: covered calls, protective puts, volatility plays.",
              },
              {
                icon: <TrendingUp className="h-4 w-4 text-primary" />,
                title: "Volatility Term Structure",
                body: "Crypto IV term structure typically slopes upward (contango) in calm markets — uncertainty grows with time. It inverts (backwardation) near major events (halvings, Fed decisions) or post-crash vol spikes.",
              },
            ].map((card) => (
              <Card key={card.title} className="bg-foreground/[0.03] border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {card.icon}
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/60 leading-relaxed">{card.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vol Surface Heatmap */}
          <Card className="bg-foreground/[0.03] border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                BTC Volatility Surface — Implied Vol Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VolSurfaceHeatmap data={volSurface} />
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-foreground/50">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground/70">Put Skew:</strong> OTM puts trade at higher IV than OTM calls — demand
                    for downside hedging is persistent.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground/70">Term Structure:</strong> Longer expiries trade at higher IV due to event
                    uncertainty (halvings, regulatory, macro).
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground/70">Trading Implication:</strong> Buy backmonth vega when term structure
                    is flat; sell near-term vol when IV Rank &gt;80%.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Derivatives Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-foreground/[0.03] border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  Key Derivatives Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "BTC ATM IV (1M)", value: "62.4%", change: "+3.2", positive: false },
                  { label: "BTC 25D Risk Reversal (1M)", value: "-4.8%", change: "+0.3", positive: true },
                  { label: "ETH ATM IV (1M)", value: "71.2%", change: "+5.1", positive: false },
                  { label: "BTC IV vs RV (30d)", value: "+8.3%", change: "+1.2", positive: false },
                  { label: "Put/Call OI Ratio", value: "0.68", change: "-0.04", positive: true },
                  { label: "Max Pain (BTC, weekly)", value: "$64,000", change: "", positive: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-foreground/60">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.change && (
                        <span
                          className={cn(
                            "text-xs",
                            item.positive ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {item.change}
                        </span>
                      )}
                      <span className="text-xs font-medium text-foreground tabular-nums">{item.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-foreground/[0.03] border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  Derivatives Trading Playbook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  {
                    setup: "High IV Rank (&gt;80%)",
                    action: "Sell premium — straddles, strangles, iron condors. Theta decay accelerates.",
                    color: "text-amber-400",
                  },
                  {
                    setup: "Low IV Rank (&lt;20%)",
                    action: "Buy vol — long straddles before known events. Cheap insurance.",
                    color: "text-primary",
                  },
                  {
                    setup: "Steep Put Skew (&gt;5%)",
                    action: "Market fears downside. Consider put spreads for cheaper downside protection.",
                    color: "text-primary",
                  },
                  {
                    setup: "Inverted Term Structure",
                    action: "Short-dated IV &gt; long-dated. Sell near, buy far — calendar spread.",
                    color: "text-green-400",
                  },
                  {
                    setup: "Expiry Max Pain",
                    action: "Price gravitation toward max pain (peak OI strike) into expiry Fridays.",
                    color: "text-red-400",
                  },
                ].map((item) => (
                  <div key={item.setup} className="bg-foreground/[0.04] rounded-lg p-3 space-y-1">
                    <p className={cn("text-xs font-medium", item.color)}>
                      <span dangerouslySetInnerHTML={{ __html: item.setup }} />
                    </p>
                    <p className="text-xs text-foreground/55">{item.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
