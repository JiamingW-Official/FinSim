"use client";

import { useState, useMemo } from "react";
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Layers,
  PieChart,
  Zap,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  DollarSign,
  Cpu,
  Globe,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CryptoMarketIntelligence from "@/components/crypto/CryptoMarketIntelligence";

// ── Seeded PRNG (seed=3333) ───────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface IndicatorData {
  name: string;
  shortName: string;
  value: number;
  displayValue: string;
  status: "undervalued" | "fair" | "overvalued" | "neutral";
  description: string;
  interpretation: string;
  sparkline: number[];
  color: string;
}

interface ExchangeFlowData {
  label: string;
  value: number; // BTC, negative = outflow (accumulation)
  sparkline: number[];
}

interface HodlerData {
  period: string;
  pct: number;
}

interface MiningMetric {
  label: string;
  value: string;
  change: number;
  unit: string;
}

interface WhaleData {
  label: string;
  value: number;
  trend: "accumulating" | "distributing" | "neutral";
}

interface PerpData {
  pair: string;
  fundingRate: number; // %
  markPrice: number;
  spotPrice: number;
  openInterest: number; // billions USD
  oiChange24h: number;
}

interface LiqHeatmapBar {
  price: number;
  longLiq: number; // millions USD
  shortLiq: number;
}

interface OptionStrike {
  strike: number;
  callOI: number;
  putOI: number;
}

interface DcaDataPoint {
  year: number;
  dcaValue: number;
  lumpSumValue: number;
  btcPrice: number;
}

interface PortfolioStrategy {
  name: string;
  description: string;
  annualReturn: number;
  sharpe: number;
  maxDrawdown: number;
  allocation: { asset: string; pct: number; color: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtB(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
  return `$${n.toFixed(1)}B`;
}

function fmtK(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
}

function statusColor(s: IndicatorData["status"]): string {
  switch (s) {
    case "undervalued": return "text-emerald-400";
    case "overvalued":  return "text-red-400";
    case "fair":        return "text-amber-400";
    default:            return "text-muted-foreground";
  }
}

function statusBg(s: IndicatorData["status"]): string {
  switch (s) {
    case "undervalued": return "bg-emerald-400/10 text-emerald-400 border-emerald-400/30";
    case "overvalued":  return "bg-red-400/10 text-red-400 border-red-400/30";
    case "fair":        return "bg-amber-400/10 text-amber-400 border-amber-400/30";
    default:            return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30";
  }
}

// ── SVG Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({
  data,
  width = 200,
  height = 60,
  color = "#6366f1",
  showArea = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;
  const W = width - pad * 2;
  const H = height - pad * 2;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * W;
    const y = pad + H - ((v - min) / range) * H;
    return `${x},${y}`;
  });

  const polyline = pts.join(" ");
  const first = pts[0].split(",");
  const last = pts[pts.length - 1].split(",");
  const areaPath = `M${first[0]},${height - pad} L${polyline.replace(/,/g, " ").split(" ").join(",")} L${last[0]},${height - pad}Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {showArea && (
        <path d={`M ${first[0]} ${height - pad} L ${pts.join(" L ")} L ${last[0]} ${height - pad} Z`}
          fill={color} fillOpacity={0.12} />
      )}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────

function MiniBarChart({
  data,
  width = 200,
  height = 60,
  positiveColor = "#10b981",
  negativeColor = "#ef4444",
}: {
  data: number[];
  width?: number;
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
}) {
  const max = Math.max(...data.map(Math.abs));
  const barW = Math.floor(width / data.length) - 2;
  const midY = height / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const x = i * (barW + 2) + 1;
        const barH = (Math.abs(v) / max) * (midY - 2);
        const y = v >= 0 ? midY - barH : midY;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            fill={v >= 0 ? positiveColor : negativeColor}
            fillOpacity={0.8}
            rx={1}
          />
        );
      })}
      <line x1={0} y1={midY} x2={width} y2={midY} stroke="#334155" strokeWidth={1} />
    </svg>
  );
}

// ── Stacked Bar Chart ─────────────────────────────────────────────────────────

function StackedBarChart({
  bars,
  width = 280,
  height = 120,
}: {
  bars: { label: string; positive: number; negative: number }[];
  width?: number;
  height?: number;
}) {
  const maxVal = Math.max(...bars.map((b) => Math.max(b.positive, b.negative))) * 1.1;
  const barW = Math.floor(width / bars.length) - 4;
  const midY = height / 2;

  return (
    <svg width={width} height={height + 20} viewBox={`0 0 ${width} ${height + 20}`}>
      {bars.map((b, i) => {
        const x = i * (barW + 4) + 2;
        const posH = (b.positive / maxVal) * (midY - 4);
        const negH = (b.negative / maxVal) * (midY - 4);
        return (
          <g key={i}>
            <rect x={x} y={midY - posH} width={barW} height={posH} fill="#10b981" fillOpacity={0.8} rx={1} />
            <rect x={x} y={midY} width={barW} height={negH} fill="#ef4444" fillOpacity={0.8} rx={1} />
            <text x={x + barW / 2} y={height + 16} textAnchor="middle" fontSize={8} fill="#64748b">{b.label}</text>
          </g>
        );
      })}
      <line x1={0} y1={midY} x2={width} y2={midY} stroke="#334155" strokeWidth={1} />
    </svg>
  );
}

// ── Data Generation ───────────────────────────────────────────────────────────

function generateIndicators(rng: () => number): IndicatorData[] {
  // Generate sparklines of 30 points
  const makeSparkline = (base: number, volatility: number, n = 30) => {
    const pts: number[] = [base];
    for (let i = 1; i < n; i++) {
      pts.push(pts[i - 1] * (1 + (rng() - 0.5) * volatility));
    }
    return pts;
  };

  // Stock-to-Flow: scarcity ratio, ideal ~3.6 → log model ~$100K
  const s2fValue = 50 + rng() * 30; // ratio
  const s2fModelPrice = Math.pow(10, (Math.log10(s2fValue) * 3.3) - 0.5);
  const s2fSparkline = makeSparkline(55, 0.04);

  // NVT: network value to transactions — below 65 undervalued, above 150 overvalued
  const nvtValue = 80 + rng() * 80;
  const nvtSparkline = makeSparkline(nvtValue, 0.05);

  // MVRV: below 1 = undervalued, 1–2 = fair, >3.5 = overvalued
  const mvrvValue = 1.4 + rng() * 2.0;
  const mvrvSparkline = makeSparkline(mvrvValue, 0.03);

  // Puell Multiple: below 0.5 = buy zone, 0.5–2 = fair, >4 = sell zone
  const puellValue = 0.6 + rng() * 2.8;
  const puellSparkline = makeSparkline(puellValue, 0.06);

  // Pi Cycle: 111DMA vs 2x350DMA — ratio near 1.0 signals cycle top
  const piRatio = 0.6 + rng() * 0.5;
  const piSparkline = makeSparkline(piRatio, 0.02);

  const s2fStatus = s2fModelPrice > 95000 ? "overvalued" : s2fModelPrice < 60000 ? "undervalued" : "fair";

  return [
    {
      name: "Stock-to-Flow Model",
      shortName: "S2F",
      value: s2fValue,
      displayValue: `${s2fValue.toFixed(1)}x`,
      status: s2fStatus,
      description: "Scarcity ratio: total supply / annual new supply. Higher = scarcer = higher fair value.",
      interpretation: `S2F ratio of ${s2fValue.toFixed(1)} implies a model price of ~$${(s2fModelPrice / 1000).toFixed(0)}K. ${s2fStatus === "overvalued" ? "BTC trading above model — historically precedes corrections." : s2fStatus === "undervalued" ? "BTC below model price — historically a buying opportunity." : "BTC tracking model price fairly."}`,
      sparkline: s2fSparkline,
      color: "#f59e0b",
    },
    {
      name: "NVT Ratio",
      shortName: "NVT",
      value: nvtValue,
      displayValue: `${nvtValue.toFixed(0)}`,
      status: nvtValue < 65 ? "undervalued" : nvtValue > 150 ? "overvalued" : "fair",
      description: "Network Value to Transactions — crypto's P/E. Price / on-chain transaction volume.",
      interpretation: `NVT of ${nvtValue.toFixed(0)}. ${nvtValue < 65 ? "Low NVT: network is processing high value relative to market cap — bullish." : nvtValue > 150 ? "High NVT: market cap outpacing actual usage — bearish signal." : "NVT in normal range — network activity supports current valuation."}`,
      sparkline: nvtSparkline,
      color: "#6366f1",
    },
    {
      name: "MVRV Ratio",
      shortName: "MVRV",
      value: mvrvValue,
      displayValue: `${mvrvValue.toFixed(2)}`,
      status: mvrvValue < 1 ? "undervalued" : mvrvValue > 3.5 ? "overvalued" : "fair",
      description: "Market Value / Realized Value. Compares current price to average on-chain cost basis.",
      interpretation: `MVRV of ${mvrvValue.toFixed(2)}. ${mvrvValue < 1 ? "Below 1: average holder is at a loss — historically strong buy zone." : mvrvValue > 3.5 ? "Above 3.5: significant unrealized profit — distribution pressure likely." : "Holders in moderate profit — healthy market conditions."}`,
      sparkline: mvrvSparkline,
      color: "#10b981",
    },
    {
      name: "Puell Multiple",
      shortName: "Puell",
      value: puellValue,
      displayValue: `${puellValue.toFixed(2)}`,
      status: puellValue < 0.5 ? "undervalued" : puellValue > 4 ? "overvalued" : "fair",
      description: "Daily miner issuance value / 365-day MA. Captures miner profitability cycles.",
      interpretation: `Puell of ${puellValue.toFixed(2)}. ${puellValue < 0.5 ? "Miners stressed — historically precedes price bottoms." : puellValue > 4 ? "Miners extremely profitable — historically precedes price tops." : "Miner revenue in normal range — no extreme signal."}`,
      sparkline: puellSparkline,
      color: "#ec4899",
    },
    {
      name: "Pi Cycle Top",
      shortName: "Pi",
      value: piRatio,
      displayValue: `${(piRatio * 100).toFixed(1)}%`,
      status: piRatio > 0.95 ? "overvalued" : piRatio < 0.7 ? "undervalued" : "neutral",
      description: "111DMA proximity to 2×350DMA. When they cross, historically marks cycle tops.",
      interpretation: `111DMA is at ${(piRatio * 100).toFixed(1)}% of 2×350DMA. ${piRatio > 0.95 ? "ALERT: Indicators converging — cycle top signal may be imminent!" : piRatio < 0.7 ? "Well below convergence — likely early-to-mid cycle." : "Moderate convergence — monitor closely for top signal."}`,
      sparkline: piSparkline,
      color: "#ef4444",
    },
  ];
}

function generateOnChainData(rng: () => number) {
  const makeSparkline = (base: number, volatility: number, n = 24) => {
    const pts: number[] = [base];
    for (let i = 1; i < n; i++) {
      pts.push(pts[i - 1] + (rng() - 0.5) * volatility);
    }
    return pts;
  };

  const exchangeFlows: ExchangeFlowData[] = [
    { label: "Exchange Net Flow (24h)", value: -(2000 + rng() * 8000), sparkline: makeSparkline(-3000, 2000) },
    { label: "Exchange Net Flow (7d)", value: -(15000 + rng() * 30000), sparkline: makeSparkline(-20000, 8000) },
    { label: "Exchange Net Flow (30d)", value: 5000 + rng() * 40000, sparkline: makeSparkline(10000, 15000) },
  ];

  const hodlerData: HodlerData[] = [
    { period: "1yr+", pct: 62 + rng() * 10 },
    { period: "2yr+", pct: 40 + rng() * 10 },
    { period: "3yr+", pct: 28 + rng() * 8 },
  ];

  const miningMetrics: MiningMetric[] = [
    { label: "Hash Rate", value: `${(580 + rng() * 60).toFixed(0)} EH/s`, change: (rng() - 0.4) * 5, unit: "7d" },
    { label: "Miner Revenue (24h)", value: `$${(28 + rng() * 14).toFixed(1)}M`, change: (rng() - 0.5) * 8, unit: "24h" },
    { label: "Difficulty (next adj)", value: `${(rng() > 0.5 ? "+" : "-")}${(rng() * 4).toFixed(1)}%`, change: 0, unit: "~${Math.floor(rng()*8+1)}d" },
    { label: "Block Subsidy", value: "3.125 BTC", change: 0, unit: "since Apr '24" },
  ];

  const whaleData: WhaleData[] = [
    { label: "Wallets >1000 BTC", value: Math.floor(2200 + rng() * 300), trend: rng() > 0.5 ? "accumulating" : "neutral" },
    { label: "Wallets >100 BTC", value: Math.floor(16000 + rng() * 2000), trend: rng() > 0.6 ? "accumulating" : "distributing" },
    { label: "Exchange Whale Ratio", value: parseFloat((0.3 + rng() * 0.4).toFixed(2)), trend: rng() > 0.5 ? "neutral" : "distributing" },
  ];

  const stablecoinRatio = parseFloat((0.08 + rng() * 0.12).toFixed(3));

  return { exchangeFlows, hodlerData, miningMetrics, whaleData, stablecoinRatio };
}

function generateDerivativesData(rng: () => number) {
  const btcSpot = 68000 + (rng() - 0.5) * 8000;
  const ethSpot = 3400 + (rng() - 0.5) * 400;
  const solSpot = 145 + (rng() - 0.5) * 20;

  const perps: PerpData[] = [
    {
      pair: "BTC-PERP",
      fundingRate: (rng() - 0.4) * 0.12,
      markPrice: btcSpot * (1 + (rng() - 0.5) * 0.002),
      spotPrice: btcSpot,
      openInterest: 8 + rng() * 8,
      oiChange24h: (rng() - 0.5) * 20,
    },
    {
      pair: "ETH-PERP",
      fundingRate: (rng() - 0.4) * 0.15,
      markPrice: ethSpot * (1 + (rng() - 0.5) * 0.002),
      spotPrice: ethSpot,
      openInterest: 4 + rng() * 4,
      oiChange24h: (rng() - 0.5) * 25,
    },
    {
      pair: "SOL-PERP",
      fundingRate: (rng() - 0.35) * 0.18,
      markPrice: solSpot * (1 + (rng() - 0.5) * 0.003),
      spotPrice: solSpot,
      openInterest: 0.8 + rng() * 1.2,
      oiChange24h: (rng() - 0.5) * 30,
    },
    {
      pair: "BNB-PERP",
      fundingRate: (rng() - 0.45) * 0.10,
      markPrice: 410 + (rng() - 0.5) * 30,
      spotPrice: 410 + (rng() - 0.5) * 30,
      openInterest: 0.5 + rng() * 0.8,
      oiChange24h: (rng() - 0.5) * 15,
    },
  ];

  // Liquidation heatmap around BTC price
  const liqBars: LiqHeatmapBar[] = Array.from({ length: 10 }, (_, i) => {
    const price = Math.round((btcSpot * (0.85 + i * 0.035)) / 100) * 100;
    return {
      price,
      longLiq: rng() * 120,
      shortLiq: rng() * 90,
    };
  });

  // Options strikes around BTC spot
  const strikes = [-30, -20, -10, -5, 0, 5, 10, 20, 30];
  const optionStrikes: OptionStrike[] = strikes.map((pct) => {
    const strike = Math.round((btcSpot * (1 + pct / 100)) / 1000) * 1000;
    const isOtm = pct !== 0;
    const callOI = isOtm && pct > 0 ? rng() * 5000 : rng() * 2000;
    const putOI = isOtm && pct < 0 ? rng() * 4000 : rng() * 1500;
    return { strike, callOI, putOI };
  });

  // Max pain = strike with max combined OI expiry worthless
  const maxPainStrike = optionStrikes.reduce((best, s) => {
    const total = s.callOI + s.putOI;
    return total > best.total ? { strike: s.strike, total } : best;
  }, { strike: 0, total: 0 });

  const basis = ((perps[0].markPrice - btcSpot) / btcSpot) * 100;

  return { perps, liqBars, optionStrikes, maxPainStrike: maxPainStrike.strike, basis, btcSpot };
}

function generateDcaData(rng: () => number): DcaDataPoint[] {
  // Simulate BTC price from 2022 to 2026
  const startPrice = 47000;
  const endPrice = 68000 + (rng() - 0.5) * 10000;
  const points: DcaDataPoint[] = [];
  const years = [2022, 2023, 2024, 2025, 2026];
  const btcPrices = [47000, 16000, 42000, 58000, endPrice];

  const monthlyDca = 500; // $500/month
  const lumpSum = 24000;  // $24K invested at start
  let dcaUnits = 0;
  let lumpSumUnits = lumpSum / btcPrices[0];

  years.forEach((yr, i) => {
    // Accumulate DCA purchases at each year's price
    const monthsInPeriod = 12;
    for (let m = 0; m < monthsInPeriod; m++) {
      const interpolatedPrice = btcPrices[i] + ((btcPrices[Math.min(i + 1, 4)] - btcPrices[i]) * (m / 12));
      dcaUnits += monthlyDca / interpolatedPrice;
    }
    const currentPrice = btcPrices[i];
    points.push({
      year: yr,
      dcaValue: dcaUnits * currentPrice,
      lumpSumValue: lumpSumUnits * currentPrice,
      btcPrice: currentPrice,
    });
  });

  return points;
}

function generatePortfolioStrategies(rng: () => number): PortfolioStrategy[] {
  return [
    {
      name: "Pure HODLer",
      description: "100% BTC, never sell. Optimal for long time horizons (4+ year cycles).",
      annualReturn: 45 + rng() * 20,
      sharpe: 0.9 + rng() * 0.4,
      maxDrawdown: -(70 + rng() * 10),
      allocation: [
        { asset: "BTC", pct: 100, color: "#f59e0b" },
      ],
    },
    {
      name: "Barbell Strategy",
      description: "80% BTC/ETH (safe) + 20% high-risk altcoins. Risk-adjusted crypto exposure.",
      annualReturn: 52 + rng() * 25,
      sharpe: 1.1 + rng() * 0.3,
      maxDrawdown: -(65 + rng() * 12),
      allocation: [
        { asset: "BTC", pct: 55, color: "#f59e0b" },
        { asset: "ETH", pct: 25, color: "#6366f1" },
        { asset: "Altcoins", pct: 20, color: "#ec4899" },
      ],
    },
    {
      name: "Cross-Chain Diversified",
      description: "Ethereum + Solana + Bitcoin ecosystems. Protocol-level diversification.",
      annualReturn: 48 + rng() * 22,
      sharpe: 1.0 + rng() * 0.3,
      maxDrawdown: -(60 + rng() * 10),
      allocation: [
        { asset: "BTC Ecosystem", pct: 35, color: "#f59e0b" },
        { asset: "ETH Ecosystem", pct: 35, color: "#6366f1" },
        { asset: "SOL Ecosystem", pct: 20, color: "#10b981" },
        { asset: "Stablecoins", pct: 10, color: "#64748b" },
      ],
    },
    {
      name: "Trad + 5% Crypto",
      description: "Traditional 60/40 portfolio with 5% BTC allocation. Improves Sharpe by ~0.15.",
      annualReturn: 12 + rng() * 5,
      sharpe: 0.78 + rng() * 0.2,
      maxDrawdown: -(22 + rng() * 8),
      allocation: [
        { asset: "Equities", pct: 55, color: "#3b82f6" },
        { asset: "Bonds", pct: 40, color: "#10b981" },
        { asset: "BTC", pct: 5, color: "#f59e0b" },
      ],
    },
  ];
}

// ── Sub-Components ─────────────────────────────────────────────────────────────

function IndicatorCard({ ind }: { ind: IndicatorData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-muted/60 border border-border/50 rounded-md p-4 cursor-pointer hover:border-border transition-colors"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{ind.shortName}</span>
            <span
              className={cn(
                "text-xs text-muted-foreground px-2 py-0.5 rounded border font-medium",
                statusBg(ind.status)
              )}
            >
              {ind.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{ind.name}</p>
          <p className={cn("text-2xl font-bold mt-1", statusColor(ind.status))}>{ind.displayValue}</p>
        </div>
        <div className="flex-shrink-0">
          <Sparkline data={ind.sparkline} width={120} height={50} color={ind.color} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ind.description}</p>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">{ind.interpretation}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-1">{expanded ? "Click to collapse" : "Click for interpretation"}</p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  change,
  unit,
}: {
  label: string;
  value: string;
  change?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-semibold text-foreground">{value}</span>
        {change !== undefined && change !== 0 && (
          <span className={cn("text-xs font-medium", change >= 0 ? "text-emerald-400" : "text-red-400")}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        )}
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: WhaleData["trend"] }) {
  if (trend === "accumulating") return (
    <span className="text-xs px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 font-medium">
      Accumulating
    </span>
  );
  if (trend === "distributing") return (
    <span className="text-xs px-2 py-0.5 rounded bg-red-400/10 text-red-400 border border-red-400/30 font-medium">
      Distributing
    </span>
  );
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">
      Neutral
    </span>
  );
}

function FundingBadge({ rate }: { rate: number }) {
  const pct = rate * 100;
  const color = pct > 0.02 ? "text-emerald-400" : pct < -0.02 ? "text-red-400" : "text-muted-foreground";
  const bg = pct > 0.02 ? "bg-emerald-400/10 border-emerald-400/30" : pct < -0.02 ? "bg-red-400/10 border-red-400/30" : "bg-muted border-border";
  return (
    <span className={cn("text-xs text-muted-foreground font-mono px-2 py-0.5 rounded border font-medium", color, bg)}>
      {pct >= 0 ? "+" : ""}{pct.toFixed(4)}%
    </span>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default function CryptoTradingPage() {
  const rng = useMemo(() => mulberry32(3333), []);

  const indicators = useMemo(() => generateIndicators(rng), [rng]);
  const onChain = useMemo(() => generateOnChainData(rng), [rng]);
  const derivatives = useMemo(() => generateDerivativesData(rng), [rng]);
  const dcaData = useMemo(() => generateDcaData(rng), [rng]);
  const portfolioStrategies = useMemo(() => generatePortfolioStrategies(rng), [rng]);

  const fundingSparklines = useMemo(() => {
    return derivatives.perps.map((p) => {
      const pts: number[] = [];
      const localRng = mulberry32(3333 + p.pair.charCodeAt(0));
      for (let i = 0; i < 24; i++) {
        pts.push((localRng() - 0.4) * 0.12);
      }
      return pts;
    });
  }, [derivatives.perps]);

  const exchangeFlowBars = useMemo(() => {
    const localRng = mulberry32(3333 + 99);
    return Array.from({ length: 30 }, () => (localRng() - 0.5) * 6000);
  }, []);

  // ── Tab 1: Crypto Technical Analysis ────────────────────────────────────────

  const renderTechAnalysis = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-400/10">
          <Activity className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Crypto-Specific Indicators</h2>
          <p className="text-xs text-muted-foreground">On-chain and cycle metrics unique to Bitcoin &amp; crypto markets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.shortName} ind={ind} />
        ))}
      </div>

      {/* S2F Historical Chart */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">S2F Model: BTC Price vs Model (2020–2026)</h3>
        <p className="text-xs text-muted-foreground mb-4">Actual BTC price (white) vs S2F model price (amber) — halvings drive supply shocks</p>
        <S2FChart rng={mulberry32(3333 + 7)} />
      </div>

      {/* Indicator Glossary */}
      <div className="bg-muted/40 border border-border/30 rounded-md p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Important Caveats
        </h3>
        <div className="space-y-2">
          {[
            "S2F is a contested model — many economists dispute its predictive validity after 2022.",
            "NVT can be distorted by Layer-2 volume moving off-chain, understating network usage.",
            "MVRV requires accurate realized price data — on-chain analytics can be imprecise.",
            "All indicators are backward-looking. No model guarantees future performance.",
          ].map((text, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
              {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tab 2: On-Chain Analytics ────────────────────────────────────────────────

  const renderOnChain = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">On-Chain Analytics</h2>
          <p className="text-xs text-muted-foreground">Blockchain-native data that reveals real market participant behavior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exchange Flows */}
        <div className="bg-muted/60 border border-border/50 rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-muted-foreground">Exchange Net Flows</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Negative = BTC leaving exchanges (accumulation). Positive = deposits (selling pressure).</p>
          <div className="space-y-1">
            {onChain.exchangeFlows.map((f) => (
              <div key={f.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <span className="text-xs text-muted-foreground">{f.label}</span>
                <span className={cn("text-sm font-mono font-medium", f.value < 0 ? "text-emerald-400" : "text-red-400")}>
                  {f.value < 0 ? "-" : "+"}{Math.abs(f.value / 1000).toFixed(1)}K BTC
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <MiniBarChart data={exchangeFlowBars} width={280} height={60} />
            <p className="text-xs text-muted-foreground mt-1">30-day daily exchange flow (BTC)</p>
          </div>
        </div>

        {/* HODLer Behavior */}
        <div className="bg-muted/60 border border-border/50 rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-medium text-muted-foreground">HODLer Behavior</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">% of circulating supply unmoved — the "diamond hands" metric.</p>
          <div className="space-y-3">
            {onChain.hodlerData.map((h) => (
              <div key={h.period}>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="text-muted-foreground">Unmoved {h.period}</span>
                  <span className="text-indigo-400 font-medium">{h.pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${h.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-indigo-400/5 border border-indigo-400/20 rounded-lg">
            <p className="text-xs text-indigo-300">
              High long-term holder supply signals conviction. Historically, HODL waves contracting precedes bull market peaks.
            </p>
          </div>
        </div>

        {/* Mining Metrics */}
        <div className="bg-muted/60 border border-border/50 rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Mining Metrics</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Network security and miner economics.</p>
          <div className="space-y-0">
            {onChain.miningMetrics.map((m) => (
              <MetricRow key={m.label} label={m.label} value={m.value} change={m.change !== 0 ? m.change : undefined} unit={m.unit} />
            ))}
          </div>
          <div className="mt-3">
            <MiningHashrateChart rng={mulberry32(3333 + 11)} />
            <p className="text-xs text-muted-foreground mt-1">Hash rate trend (90 days)</p>
          </div>
        </div>

        {/* Whale Activity */}
        <div className="bg-muted/60 border border-border/50 rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-muted-foreground">Whale Activity</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Large wallet movements — smart money behavior.</p>
          <div className="space-y-3">
            {onChain.whaleData.map((w) => (
              <div key={w.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-xs text-muted-foreground">{w.label}</p>
                  <p className="text-sm font-mono font-medium text-foreground">
                    {typeof w.value === "number" && w.value > 100 ? fmtK(w.value) : w.value}
                  </p>
                </div>
                <TrendBadge trend={w.trend} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stablecoin Supply Ratio */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-muted-foreground">Stablecoin Supply Ratio (SSR)</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">USDT + USDC market cap vs BTC market cap. Low SSR = lots of dry powder to buy BTC.</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-lg font-medium text-green-400 font-mono">{onChain.stablecoinRatio.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {onChain.stablecoinRatio < 0.1
                ? "Low SSR — stablecoins have high buying power relative to BTC. Bullish."
                : onChain.stablecoinRatio > 0.15
                  ? "High SSR — market cap parity suggests potential sell pressure."
                  : "Moderate SSR — balanced stablecoin / BTC market dynamics."}
            </p>
          </div>
          <div>
            <Sparkline
              data={Array.from({ length: 30 }, (_, i) => {
                const localRng = mulberry32(3333 + i * 7);
                return 0.08 + localRng() * 0.12;
              })}
              width={140}
              height={55}
              color="#10b981"
            />
            <p className="text-xs text-muted-foreground text-center">SSR (30d)</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Tab 3: Crypto Derivatives ────────────────────────────────────────────────

  const renderDerivatives = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">Crypto Derivatives</h2>
          <p className="text-xs text-muted-foreground">Perpetual futures, options, and leverage positioning data</p>
        </div>
      </div>

      {/* Perpetual Futures */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Perpetual Futures</h3>
        <p className="text-xs text-muted-foreground mb-3">Funding rate: positive = longs pay shorts (bullish sentiment), negative = shorts pay longs (bearish).</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border/50">
                {["Pair", "Funding Rate", "Mark Price", "Spot Price", "Open Interest", "OI Chg 24h"].map((h) => (
                  <th key={h} className="text-left text-muted-foreground font-medium pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {derivatives.perps.map((p, i) => (
                <tr key={p.pair} className="border-b border-border/20 last:border-0">
                  <td className="py-2 pr-4 font-mono font-medium text-foreground">{p.pair}</td>
                  <td className="py-2 pr-4"><FundingBadge rate={p.fundingRate} /></td>
                  <td className="py-2 pr-4 font-mono text-muted-foreground">${fmt(p.markPrice, 0)}</td>
                  <td className="py-2 pr-4 font-mono text-muted-foreground">${fmt(p.spotPrice, 0)}</td>
                  <td className="py-2 pr-4 font-mono text-muted-foreground">{fmtB(p.openInterest)}</td>
                  <td className={cn("py-2 pr-4 font-mono font-medium", p.oiChange24h >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {p.oiChange24h >= 0 ? "+" : ""}{p.oiChange24h.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {derivatives.perps.slice(0, 2).map((p, i) => (
            <div key={p.pair}>
              <p className="text-xs text-muted-foreground mb-1">{p.pair} — 24h Funding Rate History</p>
              <Sparkline data={fundingSparklines[i]} width={200} height={45} color={p.fundingRate >= 0 ? "#10b981" : "#ef4444"} />
            </div>
          ))}
        </div>
      </div>

      {/* Liquidation Heatmap */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Liquidation Heatmap</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Where leveraged positions are concentrated. Green = long liquidations, Red = short liquidations.
          Current BTC spot: <span className="font-mono text-amber-400">${fmt(derivatives.btcSpot, 0)}</span>
        </p>
        <LiqHeatmapChart bars={derivatives.liqBars} spotPrice={derivatives.btcSpot} />
      </div>

      {/* Options Market */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">BTC Options — OI by Strike</h3>
        <p className="text-xs text-muted-foreground mb-1">
          Max Pain: <span className="font-mono text-amber-400">${fmtK(derivatives.maxPainStrike)}K</span>
          {"  ·  "}
          Put/Call Skew: <span className={cn("font-mono", derivatives.btcSpot > 65000 ? "text-emerald-400" : "text-red-400")}>
            {derivatives.btcSpot > 65000 ? "Call skew (bullish)" : "Put skew (bearish)"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mb-3">Blue = Call OI, Pink = Put OI. Market tends to pin near max pain at expiry.</p>
        <OptionsOIChart strikes={derivatives.optionStrikes} />
      </div>

      {/* Basis Trade */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Cash &amp; Carry (Basis Trade)</h3>
          <span className={cn(
            "text-xs text-muted-foreground font-mono px-2 py-0.5 rounded border",
            derivatives.basis > 0
              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
              : "bg-red-400/10 text-red-400 border-red-400/30"
          )}>
            Basis: {derivatives.basis >= 0 ? "+" : ""}{derivatives.basis.toFixed(3)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Basis = (Futures − Spot) / Spot × 100. Positive basis (contango) allows{" "}
          <strong className="text-muted-foreground">cash-and-carry arbitrage</strong>: buy spot BTC + short futures to lock in the spread risk-free.
          Annualized yield: <span className="font-mono text-emerald-400">{(Math.abs(derivatives.basis) * (365 / 90)).toFixed(1)}% APY</span> (rough estimate).
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label: "Spot BTC", value: `$${fmt(derivatives.btcSpot, 0)}`, color: "text-amber-400" },
            { label: "Futures Mark", value: `$${fmt(derivatives.perps[0].markPrice, 0)}`, color: "text-indigo-400" },
            { label: "Annualized Carry", value: `${(Math.abs(derivatives.basis) * 4).toFixed(1)}%`, color: "text-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={cn("text-sm font-mono font-medium", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tab 4: Crypto Portfolio Strategies ────────────────────────────────────────

  const renderPortfolioStrategies = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-400/10">
          <PieChart className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">Crypto Portfolio Strategies</h2>
          <p className="text-xs text-muted-foreground">DCA, HODLing, diversification, and tax-efficient approaches</p>
        </div>
      </div>

      {/* DCA vs Lump Sum */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">DCA vs Lump Sum — 4-Year BTC Simulation</h3>
        <p className="text-xs text-muted-foreground mb-3">
          $500/month DCA (blue) vs $24,000 lump sum at start (amber). DCA reduces timing risk during volatile drawdowns.
        </p>
        <DcaChart data={dcaData} />
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">DCA Final Value</p>
            <p className="text-sm font-mono font-medium text-primary">${fmtK(dcaData[dcaData.length - 1].dcaValue)}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Lump Sum Final</p>
            <p className="text-sm font-mono font-medium text-amber-400">${fmtK(dcaData[dcaData.length - 1].lumpSumValue)}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">BTC Price Now</p>
            <p className="text-sm font-mono font-medium text-emerald-400">${fmtK(dcaData[dcaData.length - 1].btcPrice)}</p>
          </div>
        </div>
      </div>

      {/* Portfolio Strategies */}
      <div className="space-y-4">
        {portfolioStrategies.map((strategy) => (
          <div key={strategy.name} className="bg-muted/60 border border-border/50 rounded-md p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">{strategy.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{strategy.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center flex-shrink-0">
                <div>
                  <p className="text-xs text-muted-foreground">Return</p>
                  <p className="text-xs font-medium text-emerald-400">{strategy.annualReturn.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sharpe</p>
                  <p className="text-xs font-medium text-indigo-400">{strategy.sharpe.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">MaxDD</p>
                  <p className="text-xs font-medium text-red-400">{strategy.maxDrawdown.toFixed(0)}%</p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <AllocationBar allocation={strategy.allocation} />
              <div className="flex flex-wrap gap-2 mt-2">
                {strategy.allocation.map((a) => (
                  <div key={a.asset} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-xs text-muted-foreground">{a.asset} <span className="font-medium text-muted-foreground">{a.pct}%</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tax-Loss Harvesting */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-muted-foreground">Tax-Loss Harvesting in Crypto</h3>
        </div>
        <div className="p-3 bg-amber-400/5 border border-amber-400/20 rounded-lg mb-3">
          <p className="text-xs text-amber-300 font-medium">
            As of 2026: The wash-sale rule does NOT apply to cryptocurrency in the US.
          </p>
        </div>
        <div className="space-y-2">
          {[
            {
              step: "1",
              title: "Identify unrealized losses",
              desc: "Scan positions for assets down significantly from cost basis.",
            },
            {
              step: "2",
              title: "Sell to realize the loss",
              desc: "Lock in the capital loss, which can offset other gains (up to $3K/year against ordinary income).",
            },
            {
              step: "3",
              title: "Immediately rebuy (no wait required)",
              desc: "Unlike stocks, crypto isn't subject to the 30-day wash-sale window. You can sell ETH, harvest the loss, and buy back immediately.",
            },
            {
              step: "4",
              title: "Carry forward unused losses",
              desc: "Capital losses carry forward indefinitely — valuable for offsetting future bull market gains.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium mt-0.5">
                {item.step}
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5% BTC in Traditional Portfolio */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Adding 5% BTC to a 60/40 Portfolio</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Academic research suggests a small BTC allocation can improve risk-adjusted returns due to low correlation with traditional assets.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Traditional 60/40",
              sharpe: "0.61",
              return: "8.2%",
              volatility: "11.4%",
              maxDD: "-24%",
            },
            {
              label: "60/40 + 5% BTC",
              sharpe: "0.76",
              return: "10.8%",
              volatility: "13.1%",
              maxDD: "-27%",
            },
          ].map((col, i) => (
            <div key={col.label} className={cn(
              "rounded-lg p-3 border",
              i === 1 ? "bg-emerald-400/5 border-emerald-400/20" : "bg-muted/30 border-border/30"
            )}>
              <p className={cn("text-xs font-medium mb-2", i === 1 ? "text-emerald-400" : "text-muted-foreground")}>{col.label}</p>
              {[
                ["Sharpe Ratio", col.sharpe],
                ["Ann. Return", col.return],
                ["Volatility", col.volatility],
                ["Max Drawdown", col.maxDD],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs text-muted-foreground py-1 border-b border-border/20 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-card">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* HERO Header */}
        <div className="flex items-center gap-3 mb-8 border-l-4 border-l-primary rounded-md bg-card p-6">
          <div className="p-2.5 rounded-md bg-amber-400/10 border border-amber-400/20">
            <Bitcoin className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Advanced Crypto Trading</h1>
            <p className="text-sm text-muted-foreground">
              On-chain analytics · Derivatives · Cycle indicators · Portfolio strategies
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border">
              Synthetic data · Seed 3333
            </span>
          </div>
        </div>

        {/* Market Summary Strip */}
        <MarketSummaryStrip rng={mulberry32(3333 + 1)} />

        {/* Tabs */}
        <Tabs defaultValue="technical" className="mt-6">
          <TabsList className="grid grid-cols-5 mb-6 bg-muted/60 border border-border/50 p-1 rounded-md h-auto">
            <TabsTrigger value="technical" className="text-xs py-2 rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Tech Analysis
            </TabsTrigger>
            <TabsTrigger value="onchain" className="text-xs py-2 rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              On-Chain
            </TabsTrigger>
            <TabsTrigger value="derivatives" className="text-xs py-2 rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Derivatives
            </TabsTrigger>
            <TabsTrigger value="strategies" className="text-xs py-2 rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground">
              <PieChart className="w-3.5 h-3.5 mr-1.5" />
              Strategies
            </TabsTrigger>
            <TabsTrigger value="marketintel" className="text-xs py-2 rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground">
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
              Market Intel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical">{renderTechAnalysis()}</TabsContent>
          <TabsContent value="onchain">{renderOnChain()}</TabsContent>
          <TabsContent value="derivatives">{renderDerivatives()}</TabsContent>
          <TabsContent value="strategies">{renderPortfolioStrategies()}</TabsContent>
          <TabsContent value="marketintel"><CryptoMarketIntelligence /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Inline Chart Components ────────────────────────────────────────────────────

function S2FChart({ rng }: { rng: () => number }) {
  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
  const modelPrices = [10000, 55000, 55000, 55000, 120000, 150000, 180000];
  const actualPrices: number[] = [];
  let price = 7000;

  const seed2: number[] = [];
  for (let i = 0; i < 84; i++) seed2.push(rng());

  const monthlyPrices: number[] = [price];
  const monthVariance = [
    [0.8, 2.0, 1.5, 2.8, 5.0, 4.5, 3.2, 2.5, 1.8, 1.2, 2.0, 3.5], // 2020
    [4.0, 5.5, 6.0, 3.5, 2.0, 1.5, 1.2, 1.8, 2.2, 2.8, 4.0, 4.8], // 2021
    [2.5, 1.8, 1.5, 1.2, 0.8, 0.6, 0.7, 0.9, 1.1, 1.0, 0.9, 0.8], // 2022
    [0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.0, 2.2], // 2023
    [2.5, 3.0, 3.5, 4.0, 3.5, 3.0, 2.8, 3.2, 3.5, 3.8, 4.2, 4.5], // 2024
    [4.0, 3.8, 3.5, 3.2, 3.0, 3.5, 4.0, 4.5, 4.2, 4.0, 3.8, 4.5], // 2025
    [4.8, 5.0, 4.5], // 2026 partial
  ];

  const yearlyActual: number[] = [];
  let idx = 0;
  let p = 7000;
  monthVariance.forEach((yearMths) => {
    yearMths.forEach((mult) => {
      p = p * (1 + (seed2[idx++ % seed2.length] - 0.45) * 0.15 * mult);
    });
    yearlyActual.push(p);
  });

  const allPrices = [...yearlyActual, ...modelPrices];
  const maxP = Math.max(...allPrices);
  const minP = 1000;
  const W = 520;
  const H = 140;
  const pad = { top: 10, right: 20, bottom: 30, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / (years.length - 1)) * chartW;
  const yScale = (v: number) => pad.top + chartH - ((Math.log(v) - Math.log(minP)) / (Math.log(maxP) - Math.log(minP))) * chartH;

  const actualPath = yearlyActual.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)},${yScale(v)}`).join(" ");
  const modelPath = modelPrices.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)},${yScale(v)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid lines */}
      {[10000, 50000, 100000, 200000].map((v) => {
        const y = yScale(v);
        if (y < pad.top || y > H - pad.bottom) return null;
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.left - 4} y={y + 4} fontSize={8} fill="#475569" textAnchor="end">
              ${v >= 1000 ? `${v / 1000}K` : v}
            </text>
          </g>
        );
      })}
      {/* X axis labels */}
      {years.map((yr, i) => (
        <text key={yr} x={xScale(i)} y={H - 4} fontSize={8} fill="#475569" textAnchor="middle">{yr}</text>
      ))}
      {/* Halving markers */}
      {[2, 4].map((i) => (
        <line key={i} x1={xScale(i)} y1={pad.top} x2={xScale(i)} y2={H - pad.bottom} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
      ))}
      {/* Model price */}
      <path d={modelPath} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
      {/* Actual price */}
      <path d={actualPath} fill="none" stroke="#e2e8f0" strokeWidth={1.5} />
      {/* Dots */}
      {yearlyActual.map((v, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(v)} r={2.5} fill="#e2e8f0" />
      ))}
      {/* Legend */}
      <g transform={`translate(${pad.left}, ${pad.top})`}>
        <line x1={0} y1={6} x2={14} y2={6} stroke="#e2e8f0" strokeWidth={1.5} />
        <text x={17} y={10} fontSize={8} fill="#94a3b8">Actual</text>
        <line x1={60} y1={6} x2={74} y2={6} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
        <text x={77} y={10} fontSize={8} fill="#94a3b8">S2F Model</text>
        <line x1={140} y1={0} x2={140} y2={12} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
        <text x={143} y={10} fontSize={8} fill="#f59e0b" opacity={0.8}>Halvings</text>
      </g>
    </svg>
  );
}

function MiningHashrateChart({ rng }: { rng: () => number }) {
  const data: number[] = [500];
  for (let i = 1; i < 90; i++) {
    data.push(data[i - 1] * (1 + (rng() - 0.47) * 0.02));
  }
  return <Sparkline data={data} width={280} height={50} color="#06b6d4" />;
}

function LiqHeatmapChart({ bars, spotPrice }: { bars: LiqHeatmapBar[]; spotPrice: number }) {
  const maxVal = Math.max(...bars.map((b) => Math.max(b.longLiq, b.shortLiq)));
  const W = 460;
  const H = 160;
  const pad = { top: 10, right: 20, bottom: 30, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barGroupW = chartW / bars.length;
  const barW = barGroupW * 0.35;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {bars.map((b, i) => {
        const x = pad.left + i * barGroupW;
        const longH = (b.longLiq / maxVal) * (chartH - 4);
        const shortH = (b.shortLiq / maxVal) * (chartH - 4);
        const isNearSpot = Math.abs(b.price - spotPrice) / spotPrice < 0.03;
        return (
          <g key={i}>
            <rect x={x + barGroupW * 0.08} y={H - pad.bottom - longH} width={barW} height={longH}
              fill="#10b981" fillOpacity={isNearSpot ? 1 : 0.6} rx={1} />
            <rect x={x + barGroupW * 0.08 + barW + 2} y={H - pad.bottom - shortH} width={barW} height={shortH}
              fill="#ef4444" fillOpacity={isNearSpot ? 1 : 0.6} rx={1} />
            <text x={x + barGroupW * 0.5} y={H - 6} fontSize={7} fill="#475569" textAnchor="middle">
              ${(b.price / 1000).toFixed(0)}K
            </text>
            {isNearSpot && (
              <line x1={x + barGroupW * 0.5} y1={pad.top} x2={x + barGroupW * 0.5} y2={H - pad.bottom}
                stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,2" />
            )}
          </g>
        );
      })}
      {/* Axis */}
      <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#334155" strokeWidth={1} />
      {/* Y labels */}
      {[0, maxVal * 0.5, maxVal].map((v) => {
        const y = H - pad.bottom - (v / maxVal) * (chartH - 4);
        return (
          <text key={v} x={pad.left - 4} y={y + 3} fontSize={7} fill="#475569" textAnchor="end">
            ${v.toFixed(0)}M
          </text>
        );
      })}
      {/* Legend */}
      <rect x={pad.left} y={pad.top} width={8} height={8} fill="#10b981" fillOpacity={0.8} />
      <text x={pad.left + 11} y={pad.top + 7} fontSize={8} fill="#94a3b8">Long Liq</text>
      <rect x={pad.left + 65} y={pad.top} width={8} height={8} fill="#ef4444" fillOpacity={0.8} />
      <text x={pad.left + 76} y={pad.top + 7} fontSize={8} fill="#94a3b8">Short Liq</text>
      <line x1={pad.left + 135} y1={pad.top} x2={pad.left + 135} y2={pad.top + 8} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,2" />
      <text x={pad.left + 139} y={pad.top + 7} fontSize={8} fill="#f59e0b">Spot</text>
    </svg>
  );
}

function OptionsOIChart({ strikes }: { strikes: OptionStrike[] }) {
  const maxOI = Math.max(...strikes.map((s) => Math.max(s.callOI, s.putOI)));
  const W = 460;
  const H = 140;
  const pad = { top: 10, right: 20, bottom: 30, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const groupW = chartW / strikes.length;
  const barW = groupW * 0.36;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {strikes.map((s, i) => {
        const x = pad.left + i * groupW;
        const callH = (s.callOI / maxOI) * (chartH - 4);
        const putH = (s.putOI / maxOI) * (chartH - 4);
        return (
          <g key={i}>
            <rect x={x + groupW * 0.06} y={H - pad.bottom - callH} width={barW} height={callH}
              fill="#6366f1" fillOpacity={0.75} rx={1} />
            <rect x={x + groupW * 0.06 + barW + 2} y={H - pad.bottom - putH} width={barW} height={putH}
              fill="#ec4899" fillOpacity={0.75} rx={1} />
            <text x={x + groupW * 0.5} y={H - 6} fontSize={7} fill="#475569" textAnchor="middle">
              {(s.strike / 1000).toFixed(0)}K
            </text>
          </g>
        );
      })}
      <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#334155" strokeWidth={1} />
      {/* Legend */}
      <rect x={pad.left} y={pad.top} width={8} height={8} fill="#6366f1" fillOpacity={0.8} />
      <text x={pad.left + 11} y={pad.top + 7} fontSize={8} fill="#94a3b8">Call OI</text>
      <rect x={pad.left + 55} y={pad.top} width={8} height={8} fill="#ec4899" fillOpacity={0.8} />
      <text x={pad.left + 66} y={pad.top + 7} fontSize={8} fill="#94a3b8">Put OI</text>
    </svg>
  );
}

function DcaChart({ data }: { data: DcaDataPoint[] }) {
  const allValues = data.flatMap((d) => [d.dcaValue, d.lumpSumValue]);
  const maxV = Math.max(...allValues) * 1.05;
  const minV = 0;
  const W = 480;
  const H = 140;
  const pad = { top: 10, right: 20, bottom: 30, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const yScale = (v: number) => pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const dcaPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)},${yScale(d.dcaValue)}`).join(" ");
  const lsPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)},${yScale(d.lumpSumValue)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid */}
      {[10000, 30000, 50000, 70000].map((v) => {
        const y = yScale(v);
        if (y < pad.top || y > H - pad.bottom) return null;
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.left - 4} y={y + 4} fontSize={8} fill="#475569" textAnchor="end">
              ${v >= 1000 ? `${v / 1000}K` : v}
            </text>
          </g>
        );
      })}
      {/* Paths */}
      <path d={lsPath} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      <path d={dcaPath} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      {/* Dots */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(d.dcaValue)} r={3} fill="#3b82f6" />
          <circle cx={xScale(i)} cy={yScale(d.lumpSumValue)} r={3} fill="#f59e0b" />
          <text x={xScale(i)} y={H - 5} fontSize={8} fill="#475569" textAnchor="middle">{d.year}</text>
        </g>
      ))}
      {/* Legend */}
      <line x1={pad.left} y1={pad.top + 6} x2={pad.left + 16} y2={pad.top + 6} stroke="#3b82f6" strokeWidth={1.5} />
      <text x={pad.left + 19} y={pad.top + 10} fontSize={8} fill="#94a3b8">DCA $500/mo</text>
      <line x1={pad.left + 90} y1={pad.top + 6} x2={pad.left + 106} y2={pad.top + 6} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={pad.left + 109} y={pad.top + 10} fontSize={8} fill="#94a3b8">Lump Sum $24K</text>
    </svg>
  );
}

function AllocationBar({ allocation }: { allocation: { asset: string; pct: number; color: string }[] }) {
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
      {allocation.map((a) => (
        <div
          key={a.asset}
          style={{ width: `${a.pct}%`, backgroundColor: a.color }}
          className="h-full first:rounded-l-full last:rounded-r-full"
        />
      ))}
    </div>
  );
}

function MarketSummaryStrip({ rng }: { rng: () => number }) {
  const assets = [
    { symbol: "BTC", name: "Bitcoin", base: 68000 },
    { symbol: "ETH", name: "Ethereum", base: 3400 },
    { symbol: "SOL", name: "Solana", base: 145 },
    { symbol: "BNB", name: "BNB", base: 410 },
    { symbol: "TOTAL", name: "Crypto Market Cap", base: 2600 },
    { symbol: "FEAR/GREED", name: "Fear & Greed Index", base: 65 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {assets.map((a) => {
        const change = (rng() - 0.45) * 8;
        const price = a.base * (1 + change / 100);
        const isPositive = change >= 0;
        const isFG = a.symbol === "FEAR/GREED";
        const fgLabel = price > 75 ? "Extreme Greed" : price > 55 ? "Greed" : price > 45 ? "Neutral" : price > 25 ? "Fear" : "Extreme Fear";
        const fgColor = price > 75 ? "text-red-400" : price > 55 ? "text-amber-400" : "text-muted-foreground";

        return (
          <div key={a.symbol} className="bg-muted/60 border border-border/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground truncate">{a.name}</p>
            <p className="text-sm font-mono font-medium text-foreground mt-0.5">
              {isFG
                ? price.toFixed(0)
                : a.symbol === "TOTAL"
                  ? `$${(price / 1000).toFixed(2)}T`
                  : price > 1000
                    ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    : `$${price.toFixed(2)}`}
            </p>
            {isFG ? (
              <p className={cn("text-xs text-muted-foreground font-medium", fgColor)}>{fgLabel}</p>
            ) : (
              <p className={cn("text-xs font-medium flex items-center gap-0.5", isPositive ? "text-emerald-400" : "text-red-400")}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isPositive ? "+" : ""}{change.toFixed(2)}%
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
