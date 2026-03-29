"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  BarChart2,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (seed=9753) ───────────────────────────────────────────────────

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

function fmtM(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}B`;
  return `$${n.toFixed(0)}M`;
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────────

function LineChart({
  data,
  width = 400,
  height = 80,
  color = "#6366f1",
  showArea = true,
  showGrid = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
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

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {showGrid && [0.25, 0.5, 0.75].map((t, i) => (
        <line key={i} x1={pad} y1={pad + H * t} x2={width - pad} y2={pad + H * t}
          stroke="#1e293b" strokeWidth={1} strokeDasharray="4 4" />
      ))}
      {showArea && (
        <path
          d={`M ${first[0]} ${height - pad} L ${pts.join(" L ")} L ${last[0]} ${height - pad} Z`}
          fill={color} fillOpacity={0.12}
        />
      )}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Semicircle Gauge ──────────────────────────────────────────────────────────

function SemicircleGauge({
  value,
  label,
  size = 180,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size * 0.38;
  const strokeW = size * 0.07;

  // Arc from 180° to 0° (left to right)
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + ((180 - value) / 100) * Math.PI;
  const needleX = cx + r * Math.cos(Math.PI - (value / 100) * Math.PI);
  const needleY = cy - r * Math.sin((value / 100) * Math.PI);

  function arcPath(startA: number, endA: number, color: string, pct: number) {
    const sa = Math.PI - startA * Math.PI;
    const ea = Math.PI - endA * Math.PI;
    const x1 = cx + r * Math.cos(sa);
    const y1 = cy - r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea);
    const y2 = cy - r * Math.sin(ea);
    const large = endA - startA > 0.5 ? 1 : 0;
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color };
  }

  const segments = [
    arcPath(0, 0.2, "#ef4444", 0.2),   // Extreme Fear
    arcPath(0.2, 0.4, "#f97316", 0.2), // Fear
    arcPath(0.4, 0.6, "#eab308", 0.2), // Neutral
    arcPath(0.6, 0.8, "#84cc16", 0.2), // Greed
    arcPath(0.8, 1.0, "#22c55e", 0.2), // Extreme Greed
  ];

  function getColor(v: number) {
    if (v < 20) return "#ef4444";
    if (v < 40) return "#f97316";
    if (v < 60) return "#eab308";
    if (v < 80) return "#84cc16";
    return "#22c55e";
  }

  const valColor = getColor(value);

  // Needle endpoint
  const nAngle = Math.PI - (value / 100) * Math.PI;
  const nx = cx + r * Math.cos(nAngle);
  const ny = cy - r * Math.sin(nAngle);

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#1e293b" strokeWidth={strokeW} strokeLinecap="round"
      />
      {/* Colored segments */}
      {segments.map((seg, i) => (
        <path key={i} d={seg.d} fill="none" stroke={seg.color}
          strokeWidth={strokeW} strokeLinecap="butt" opacity={0.7} />
      ))}
      {/* Value arc overlay */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${nx} ${ny}`}
        fill="none" stroke={valColor} strokeWidth={strokeW}
        strokeLinecap="round" opacity={0.95}
      />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny}
        stroke="white" strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="white" />
      {/* Value text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={valColor}
        fontSize={size * 0.12} fontWeight="700">{value}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8"
        fontSize={size * 0.065}>{label}</text>
    </svg>
  );
}

// ── Horizontal Bar ─────────────────────────────────────────────────────────────

function HBar({
  value,
  max,
  color,
  label,
  subLabel,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  subLabel?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-right text-xs text-muted-foreground shrink-0">{label}</div>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      {subLabel && <div className="w-16 text-xs text-muted-foreground shrink-0">{subLabel}</div>}
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-muted/40 border border-border/50 rounded-md p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}>
      {label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CryptoMarketIntelligence() {
  const rng = useMemo(() => mulberry32(9753), []);

  // ── Section 1: Fear & Greed ────────────────────────────────────────────────

  const fearGreedValue = 65;
  const fearGreedLabel = "Greed";

  const subIndicators = useMemo(() => [
    { name: "Price Volatility (30d)", value: 58, icon: Activity },
    { name: "Market Momentum (BTC Dom)", value: 71, icon: TrendingUp },
    { name: "Social Media Sentiment", value: 69, icon: Globe },
    { name: "Bitcoin Dominance", value: 52, icon: BarChart2 },
    { name: "Google Trends (Bitcoin)", value: 74, icon: TrendingUp },
  ], []);

  const fearGreedHistory = useMemo(() => {
    const hist: number[] = [42];
    for (let i = 1; i < 30; i++) {
      hist.push(Math.max(15, Math.min(90, hist[hist.length - 1] + (rng() - 0.5) * 14)));
    }
    hist[29] = fearGreedValue;
    return hist;
  }, [rng]);

  function fgColor(v: number) {
    if (v < 25) return "#ef4444";
    if (v < 45) return "#f97316";
    if (v < 55) return "#eab308";
    if (v < 75) return "#84cc16";
    return "#22c55e";
  }

  function fgLabel(v: number) {
    if (v < 25) return "Extreme Fear";
    if (v < 45) return "Fear";
    if (v < 55) return "Neutral";
    if (v < 75) return "Greed";
    return "Extreme Greed";
  }

  // ── Section 2: Market Cycle ────────────────────────────────────────────────

  const rainbowBands = [
    { label: "Deep Value", color: "#1d4ed8", range: "< $10K" },
    { label: "HODL", color: "#0ea5e9", range: "$10K–$30K" },
    { label: "Accumulate", color: "#22c55e", range: "$30K–$60K" },
    { label: "Buy", color: "#84cc16", range: "$60K–$90K" },
    { label: "FOMO", color: "#eab308", range: "$90K–$120K" },
    { label: "Sell / Distribute", color: "#f97316", range: "$120K–$150K" },
    { label: "Maximum Risk", color: "#ef4444", range: "$150K–$200K" },
    { label: "Bubble Burst", color: "#7c3aed", range: "> $200K" },
  ];
  const currentBTCBand = 3; // "Buy" band (price ~$84K synthetic)

  const halvingDates = [
    { year: 2016, label: "Halving 1", daysPast: 3588 },
    { year: 2020, label: "Halving 2", daysPast: 2188 },
    { year: 2024, label: "Halving 3", daysPast: 340 },
  ];

  const btcCycleData = useMemo(() => {
    const data: number[] = [];
    const base = [7000, 18000, 65000, 47000, 29000, 43000, 72000, 84000];
    for (let i = 0; i < 90; i++) {
      const bIdx = Math.floor((i / 90) * (base.length - 1));
      const t = (i / 90) * (base.length - 1) - bIdx;
      const v = base[bIdx] * (1 - t) + base[Math.min(bIdx + 1, base.length - 1)] * t;
      data.push(v + (rng() - 0.5) * v * 0.05);
    }
    return data;
  }, [rng]);

  const totalMarketData = useMemo(() => {
    const data: number[] = [];
    let val = 1.1; // Trillion
    for (let i = 0; i < 90; i++) {
      val += (rng() - 0.42) * 0.08;
      val = Math.max(0.7, val);
      data.push(val);
    }
    data[89] = 2.85;
    return data;
  }, [rng]);

  const altcoinSeasonIndex = 42;

  // ── Section 3: Whale Activity ──────────────────────────────────────────────

  const exchangeTypes = ["Binance", "Coinbase", "Kraken", "OKX", "Unknown Wallet", "OTC Desk", "Bybit", "Whale Wallet"];
  const assetTypes = ["BTC", "ETH", "USDT", "SOL", "BNB", "XRP"];
  const txTypes = [
    { label: "Exchange Inflow", color: "#ef4444" },
    { label: "Exchange Outflow", color: "#22c55e" },
    { label: "OTC Trade", color: "#60a5fa" },
    { label: "Wallet Transfer", color: "#94a3b8" },
  ];

  const whaleTxs = useMemo(() => {
    const txs = [];
    const now = Date.now();
    for (let i = 0; i < 15; i++) {
      const hoursAgo = rng() * 23;
      const mins = Math.floor(rng() * 60);
      const from = exchangeTypes[Math.floor(rng() * exchangeTypes.length)];
      const toPool = exchangeTypes.filter((e) => e !== from);
      const to = toPool[Math.floor(rng() * toPool.length)];
      const asset = assetTypes[Math.floor(rng() * assetTypes.length)];
      const typeIdx = Math.floor(rng() * txTypes.length);
      const amount = (rng() * 95 + 5) * 1_000_000;
      txs.push({
        timeLabel: `${Math.floor(hoursAgo)}h ${mins}m ago`,
        from,
        to,
        asset,
        amount,
        type: txTypes[typeIdx],
      });
    }
    return txs.sort((a, b) => parseFloat(a.timeLabel) - parseFloat(b.timeLabel));
  }, [rng]);

  const exchangeReserves = useMemo(() => [
    { name: "Binance", btc: 540000, change: -2.3 },
    { name: "Coinbase", btc: 320000, change: 1.1 },
    { name: "Kraken", btc: 88000, change: -0.7 },
    { name: "OKX", btc: 110000, change: -3.4 },
    { name: "Bybit", btc: 74000, change: 0.5 },
  ], []);

  const whaleAccumulationScore = 67; // out of 100 (high = accumulating)

  const whaleHistory = useMemo(() => {
    const data: number[] = [60];
    for (let i = 1; i < 30; i++) {
      data.push(Math.max(20, Math.min(90, data[data.length - 1] + (rng() - 0.48) * 8)));
    }
    data[29] = whaleAccumulationScore;
    return data;
  }, [rng]);

  // ── Section 4: DeFi Dashboard ──────────────────────────────────────────────

  const tvlByChain = [
    { chain: "Ethereum", tvl: 28, color: "#6366f1" },
    { chain: "Tron", tvl: 7, color: "#ef4444" },
    { chain: "BNB Chain", tvl: 4, color: "#eab308" },
    { chain: "Solana", tvl: 3, color: "#22c55e" },
    { chain: "Avalanche", tvl: 1.5, color: "#f97316" },
    { chain: "Arbitrum", tvl: 1.2, color: "#60a5fa" },
    { chain: "Others", tvl: 0.9, color: "#94a3b8" },
  ];

  const topDefiProtocols = useMemo(() => [
    { name: "Lido", chain: "ETH", tvl: 14.2, change: 1.3, token: "LDO", apy: "3.8%" },
    { name: "AAVE v3", chain: "ETH", tvl: 7.8, change: -0.5, token: "AAVE", apy: "5.2%" },
    { name: "Uniswap v3", chain: "ETH", tvl: 5.1, change: 2.1, token: "UNI", apy: "12–40%" },
    { name: "MakerDAO", chain: "ETH", tvl: 4.9, change: -1.2, token: "MKR", apy: "6.1%" },
    { name: "Curve", chain: "ETH", tvl: 3.6, change: 0.4, token: "CRV", apy: "4.7%" },
    { name: "PancakeSwap", chain: "BNB", tvl: 2.8, change: 3.2, token: "CAKE", apy: "18–80%" },
    { name: "GMX", chain: "ARB", tvl: 1.9, change: -2.0, token: "GMX", apy: "22%" },
    { name: "dYdX", chain: "ETH", tvl: 1.4, change: 1.8, token: "DYDX", apy: "N/A" },
    { name: "Compound", chain: "ETH", tvl: 1.2, change: -0.3, token: "COMP", apy: "3.4%" },
    { name: "Convex", chain: "ETH", tvl: 1.0, change: 0.9, token: "CVX", apy: "8.1%" },
  ], []);

  const dexVolumes = useMemo(() => [
    { name: "Uniswap v3", vol: 4.2, color: "#f97316" },
    { name: "Curve", vol: 1.8, color: "#60a5fa" },
    { name: "PancakeSwap", vol: 1.5, color: "#eab308" },
    { name: "GMX", vol: 0.9, color: "#22c55e" },
    { name: "dYdX", vol: 0.7, color: "#a78bfa" },
    { name: "Others", vol: 0.6, color: "#94a3b8" },
  ], []);

  const totalDexVol = dexVolumes.reduce((s, d) => s + d.vol, 0);

  const stablecoins = [
    { name: "USDT", cap: 98.3, color: "#22c55e" },
    { name: "USDC", cap: 34.1, color: "#60a5fa" },
    { name: "DAI", cap: 8.2, color: "#f97316" },
    { name: "FRAX", cap: 1.4, color: "#a78bfa" },
    { name: "BUSD", cap: 0.9, color: "#eab308" },
  ];

  const gasData = useMemo(() => {
    const data: number[] = [18];
    for (let i = 1; i < 30; i++) {
      data.push(Math.max(5, Math.min(120, data[data.length - 1] + (rng() - 0.5) * 15)));
    }
    data[29] = 24;
    return data;
  }, [rng]);

  const currentGas = 24;

  // ── Section 5: On-Chain Metrics ────────────────────────────────────────────

  const onChainBTC = {
    dailyActiveAddresses: "1.02M",
    txVolume: "$28.4B",
    minerRevenue: "$42.1M",
    hashRate: "618 EH/s",
    mvrvRatio: 1.87,
    sopr: 1.043,
    realizedCap: 418.2,
    marketCap: 1640,
  };

  const onChainETH = {
    dailyActiveAddresses: "620K",
    txVolume: "$12.1B",
    minerRevenue: "N/A",
    stakingAPR: "3.8%",
    mvrvRatio: 1.34,
    sopr: 1.012,
    realizedCap: 227.4,
    marketCap: 392,
  };

  const lthSupplyPct = 68.4; // Long-term holders %
  const sthSupplyPct = 100 - lthSupplyPct;
  const stablecoinSupplyRatio = 14.2; // % of market cap — higher = more buying power

  const realizedCapHistory = useMemo(() => {
    const data: number[] = [280];
    for (let i = 1; i < 60; i++) {
      data.push(data[data.length - 1] + (rng() - 0.4) * 5);
    }
    data[59] = onChainBTC.realizedCap;
    return data;
  }, [rng]);

  const marketCapHistory = useMemo(() => {
    const data: number[] = [950];
    for (let i = 1; i < 60; i++) {
      const delta = (rng() - 0.42) * 40;
      data.push(Math.max(600, data[data.length - 1] + delta));
    }
    data[59] = onChainBTC.marketCap;
    return data;
  }, [rng]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ─── Section 1: Fear & Greed Index ──────────────────────────────────── */}
      <SectionCard title="Crypto Fear & Greed Index" icon={Activity}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gauge */}
          <div className="flex flex-col items-center gap-4">
            <SemicircleGauge value={fearGreedValue} label={fearGreedLabel} size={200} />
            <div className="flex gap-3 flex-wrap justify-center text-xs">
              {[
                { label: "Extreme Fear", color: "#ef4444", range: "0–24" },
                { label: "Fear", color: "#f97316", range: "25–44" },
                { label: "Neutral", color: "#eab308", range: "45–55" },
                { label: "Greed", color: "#84cc16", range: "56–75" },
                { label: "Extreme Greed", color: "#22c55e", range: "76–100" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-muted-foreground/70">({item.range})</span>
                </div>
              ))}
            </div>
            {/* 30-day history */}
            <div className="w-full">
              <p className="text-xs text-muted-foreground mb-1">30-Day History</p>
              <LineChart data={fearGreedHistory} width={300} height={60} color={fgColor(fearGreedValue)} showArea />
              <div className="flex justify-between text-xs text-muted-foreground/70 mt-1">
                <span>30d ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Sub-indicators */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium mb-3">Component Breakdown</p>
            {subIndicators.map((ind) => {
              const c = fgColor(ind.value);
              return (
                <div key={ind.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{ind.name}</span>
                    <span className="text-xs font-semibold" style={{ color: c }}>
                      {ind.value} — {fgLabel(ind.value)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${ind.value}%`, backgroundColor: c }} />
                  </div>
                </div>
              );
            })}

            {/* Composite reading */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-amber-400">Composite Reading:</span>{" "}
                Market sentiment leans{" "}
                <span className="text-lime-400 font-semibold">Greed (65)</span>, with strong social
                momentum and Google Trends driving the signal. Bitcoin dominance at 54% rising = early
                rotation caution. Watch for divergence between social and on-chain metrics.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ─── Section 2: Market Cycle Indicators ──────────────────────────────── */}
      <SectionCard title="Bitcoin Market Cycle" icon={TrendingUp}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Rainbow bands */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Rainbow Chart Bands</p>
            {rainbowBands.map((band, i) => (
              <div
                key={band.label}
                className={cn(
                  "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all",
                  i === currentBTCBand
                    ? "ring-1 ring-foreground/30 bg-foreground/5 font-semibold"
                    : "opacity-60"
                )}
                style={{ borderLeft: `3px solid ${band.color}` }}
              >
                <span style={{ color: band.color }}>{band.label}</span>
                <span className="text-muted-foreground">{band.range}</span>
                {i === currentBTCBand && (
                  <span className="ml-1 text-xs bg-foreground/10 px-1.5 py-0.5 rounded text-foreground">Now</span>
                )}
              </div>
            ))}
          </div>

          {/* BTC cycle price chart */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-1">90-Day BTC Price</p>
            <div className="relative w-full">
              <LineChart data={btcCycleData} width={320} height={100} color="#f59e0b" showArea showGrid />
              {/* Halving markers */}
              <div className="flex gap-4 mt-2 flex-wrap">
                {halvingDates.map((h) => (
                  <div key={h.year} className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-sm bg-amber-400" />
                    <span className="text-muted-foreground">{h.label}</span>
                    <span className="text-muted-foreground/70">({h.daysPast}d ago)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Days since last halving */}
            <div className="p-3 bg-amber-400/5 border border-amber-400/20 rounded-lg">
              <p className="text-xs text-amber-400 font-semibold">Days Since Last Halving (Apr 2024)</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">340 days</p>
              <p className="text-xs text-muted-foreground mt-1">Historically: peak occurs 12–18 months post-halving</p>
            </div>
          </div>

          {/* Altcoin season + total market cap */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Altcoin Season Index</p>
              <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="h-full" style={{ width: "50%", background: "linear-gradient(to right, #f59e0b, #eab308)" }} />
                  <div className="h-full" style={{ width: "50%", background: "linear-gradient(to right, #22c55e, #10b981)" }} />
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full shadow-sm"
                  style={{ left: `calc(${altcoinSeasonIndex}% - 6px)` }} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-amber-400">Bitcoin Season</span>
                <span className="text-muted-foreground font-semibold">{altcoinSeasonIndex}/100</span>
                <span className="text-emerald-400">Altcoin Season</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">BTC dominant phase — altcoins lagging</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Crypto Market Cap (90d)</p>
              <LineChart data={totalMarketData} width={280} height={70} color="#818cf8" showArea />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground/70">90d ago</span>
                <span className="text-foreground font-semibold">$2.85T</span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ─── Section 3: Whale Activity Monitor ───────────────────────────────── */}
      <SectionCard title="Whale Activity Monitor" icon={Database}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Whale transactions table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-3">Large Transactions — Last 24h</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  {["Time", "From", "To", "Asset", "Amount", "Type"].map((h) => (
                    <th key={h} className="text-left pb-2 pr-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {whaleTxs.map((tx, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{tx.timeLabel}</td>
                    <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{tx.from}</td>
                    <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{tx.to}</td>
                    <td className="py-2 pr-3 font-semibold text-foreground">{tx.asset}</td>
                    <td className="py-2 pr-3 text-foreground whitespace-nowrap">{fmtM(tx.amount)}</td>
                    <td className="py-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ color: tx.type.color, backgroundColor: `${tx.type.color}20` }}
                      >
                        {tx.type.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Legend */}
            <div className="flex gap-4 mt-3 flex-wrap">
              {txTypes.map((t) => (
                <div key={t.label} className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-muted-foreground">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Exchange reserves */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Exchange BTC Reserves</p>
              <div className="space-y-2">
                {exchangeReserves.map((ex) => (
                  <div key={ex.name} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground w-20">{ex.name}</span>
                    <div className="flex-1 mx-2 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(ex.btc / 600000) * 100}%` }} />
                    </div>
                    <span className="text-muted-foreground w-16 text-right">{(ex.btc / 1000).toFixed(0)}K BTC</span>
                    <span className={cn("w-12 text-right ml-1", ex.change < 0 ? "text-emerald-400" : "text-red-400")}>
                      {ex.change > 0 ? "+" : ""}{ex.change}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70 mt-2">
                ↓ Outflows (green %) = accumulation signal; ↑ Inflows = potential sell pressure
              </p>
            </div>

            {/* Whale accumulation score */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Whale Wallet Accumulation Score (30d)</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-emerald-400">{whaleAccumulationScore}</span>
                <span className="text-xs text-muted-foreground mb-1">/ 100</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${whaleAccumulationScore}%` }} />
              </div>
              <LineChart data={whaleHistory} width={200} height={40} color="#34d399" showArea={false} />
              <p className="text-xs text-emerald-400/80 mt-1">Net positive: 1k–10k BTC wallets growing</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ─── Section 4: DeFi Dashboard ────────────────────────────────────────── */}
      <SectionCard title="DeFi Dashboard" icon={Layers}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* TVL by Chain */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">TVL by Chain</p>
            <div className="space-y-2">
              {tvlByChain.map((chain) => (
                <HBar
                  key={chain.chain}
                  label={chain.chain}
                  value={chain.tvl}
                  max={tvlByChain[0].tvl}
                  color={chain.color}
                  subLabel={fmtB(chain.tvl)}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total TVL: <span className="text-foreground font-semibold">{fmtB(tvlByChain.reduce((s, c) => s + c.tvl, 0))}</span>
            </p>
          </div>

          {/* DEX Volume pie */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">DEX Volume (24h)</p>
            <div className="flex items-center gap-4">
              {/* Simple pie SVG */}
              <svg width={100} height={100} viewBox="0 0 100 100">
                {(() => {
                  let startAngle = -Math.PI / 2;
                  return dexVolumes.map((d, i) => {
                    const slice = (d.vol / totalDexVol) * 2 * Math.PI;
                    const x1 = 50 + 45 * Math.cos(startAngle);
                    const y1 = 50 + 45 * Math.sin(startAngle);
                    const x2 = 50 + 45 * Math.cos(startAngle + slice);
                    const y2 = 50 + 45 * Math.sin(startAngle + slice);
                    const largeArc = slice > Math.PI ? 1 : 0;
                    const path = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    startAngle += slice;
                    return <path key={i} d={path} fill={d.color} opacity={0.85} stroke="#0f172a" strokeWidth={1} />;
                  });
                })()}
                <circle cx={50} cy={50} r={18} fill="#0f172a" />
                <text x={50} y={54} textAnchor="middle" fill="#94a3b8" fontSize={8}>DEX Vol</text>
              </svg>
              <div className="space-y-1.5 flex-1">
                {dexVolumes.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-muted-foreground">{fmtB(d.vol)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stablecoin market caps */}
            <p className="text-xs text-muted-foreground mt-4 mb-2">Stablecoin Supply</p>
            <div className="space-y-1.5">
              {stablecoins.map((sc) => (
                <HBar
                  key={sc.name}
                  label={sc.name}
                  value={sc.cap}
                  max={stablecoins[0].cap}
                  color={sc.color}
                  subLabel={`$${sc.cap.toFixed(1)}B`}
                />
              ))}
            </div>
          </div>

          {/* Top DeFi protocols + Gas */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Top DeFi Protocols</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Protocol", "Chain", "TVL", "24h", "APY"].map((h) => (
                        <th key={h} className="text-left pb-1.5 pr-2 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {topDefiProtocols.map((p) => (
                      <tr key={p.name} className="hover:bg-muted/20">
                        <td className="py-1.5 pr-2 font-medium text-foreground">{p.name}</td>
                        <td className="py-1.5 pr-2 text-muted-foreground">{p.chain}</td>
                        <td className="py-1.5 pr-2 text-muted-foreground">{fmtB(p.tvl)}</td>
                        <td className={cn("py-1.5 pr-2", p.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {p.change >= 0 ? "+" : ""}{p.change}%
                        </td>
                        <td className="py-1.5 text-indigo-400">{p.apy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gas tracker */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">ETH Gas Tracker</p>
              <div className="flex gap-3 mb-2">
                {[
                  { label: "Slow", gwei: 18, color: "#22c55e" },
                  { label: "Normal", gwei: currentGas, color: "#eab308" },
                  { label: "Fast", gwei: 38, color: "#ef4444" },
                ].map((tier) => (
                  <div key={tier.label} className="flex-1 text-center p-1.5 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">{tier.label}</p>
                    <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.gwei}</p>
                    <p className="text-xs text-muted-foreground/70">Gwei</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70 mb-1">30-Day Gas History</p>
              <LineChart data={gasData} width={220} height={40} color="#eab308" showArea />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ─── Section 5: On-Chain Metrics Deep Dive ───────────────────────────── */}
      <SectionCard title="On-Chain Metrics Deep Dive" icon={Globe}>

        {/* BTC + ETH side by side scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* BTC scorecard */}
          <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">₿</span>
              <h4 className="text-sm font-semibold text-amber-300">Bitcoin Network Health</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Active Addresses", value: onChainBTC.dailyActiveAddresses },
                { label: "Tx Volume (24h)", value: onChainBTC.txVolume },
                { label: "Miner Revenue", value: onChainBTC.minerRevenue },
                { label: "Hash Rate", value: onChainBTC.hashRate },
                { label: "MVRV Ratio", value: fmt(onChainBTC.mvrvRatio) },
                { label: "SOPR", value: fmt(onChainBTC.sopr, 3) },
              ].map((metric) => (
                <div key={metric.label} className="p-2 bg-muted/60 rounded-lg">
                  <p className="text-muted-foreground mb-0.5">{metric.label}</p>
                  <p className="font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ETH scorecard */}
          <div className="p-4 bg-indigo-400/5 border border-indigo-400/20 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">Ξ</span>
              <h4 className="text-sm font-semibold text-indigo-300">Ethereum Network Health</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Active Addresses", value: onChainETH.dailyActiveAddresses },
                { label: "Tx Volume (24h)", value: onChainETH.txVolume },
                { label: "Staking APR", value: onChainETH.stakingAPR },
                { label: "Validators", value: "1.06M" },
                { label: "MVRV Ratio", value: fmt(onChainETH.mvrvRatio) },
                { label: "SOPR", value: fmt(onChainETH.sopr, 3) },
              ].map((metric) => (
                <div key={metric.label} className="p-2 bg-muted/60 rounded-lg">
                  <p className="text-muted-foreground mb-0.5">{metric.label}</p>
                  <p className="font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Realized cap vs market cap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <p className="text-xs text-muted-foreground mb-2">
              BTC Market Cap vs Realized Cap (60 days, $B)
            </p>
            <div className="relative">
              {/* Stacked line chart */}
              <svg width="100%" height={100} viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full">
                {/* Market cap line */}
                {(() => {
                  const data = marketCapHistory;
                  const min = Math.min(...data, ...realizedCapHistory);
                  const max = Math.max(...data, ...realizedCapHistory);
                  const range = max - min;
                  const pts = data.map((v, i) => {
                    const x = (i / (data.length - 1)) * 500;
                    const y = 100 - ((v - min) / range) * 90 - 5;
                    return `${x},${y}`;
                  }).join(" ");
                  const rcPts = realizedCapHistory.map((v, i) => {
                    const x = (i / (realizedCapHistory.length - 1)) * 500;
                    const y = 100 - ((v - min) / range) * 90 - 5;
                    return `${x},${y}`;
                  }).join(" ");
                  return (
                    <>
                      <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" />
                      <polyline points={rcPts} fill="none" stroke="#818cf8" strokeWidth={2} strokeLinejoin="round" strokeDasharray="4 2" />
                    </>
                  );
                })()}
              </svg>
              <div className="flex gap-4 mt-1 text-xs">
                <div className="flex items-center gap-1"><span className="w-4 h-px bg-amber-400 inline-block" /> <span className="text-muted-foreground">Market Cap</span></div>
                <div className="flex items-center gap-1"><span className="w-4 h-px bg-indigo-400 inline-block border-t border-dashed border-indigo-400" /> <span className="text-muted-foreground">Realized Cap</span></div>
              </div>
            </div>
            <div className="mt-2 flex gap-3 text-xs">
              <div className="p-2 bg-muted/30 rounded flex-1">
                <span className="text-muted-foreground">Market Cap</span>
                <p className="font-bold text-amber-400">${fmt(onChainBTC.marketCap, 0)}B</p>
              </div>
              <div className="p-2 bg-muted/30 rounded flex-1">
                <span className="text-muted-foreground">Realized Cap</span>
                <p className="font-bold text-indigo-400">${fmt(onChainBTC.realizedCap, 1)}B</p>
              </div>
              <div className="p-2 bg-muted/30 rounded flex-1">
                <span className="text-muted-foreground">MVRV</span>
                <p className="font-bold text-foreground">{fmt(onChainBTC.mvrvRatio)}x</p>
                <p className="text-muted-foreground/70 text-xs">Slight overvaluation vs cost basis</p>
              </div>
            </div>
          </div>

          {/* Holder distribution + SSR */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">LTH vs STH Supply</p>
              {/* Stacked horizontal bar */}
              <div className="h-6 w-full rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${lthSupplyPct}%` }} />
                <div className="h-full bg-rose-500" style={{ width: `${sthSupplyPct}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">LTH {lthSupplyPct}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-muted-foreground">STH {sthSupplyPct.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">
                High LTH ratio = holder conviction, less liquid supply
              </p>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Stablecoin Supply Ratio (SSR)</p>
              <p className="text-xl font-bold text-foreground">{fmt(stablecoinSupplyRatio, 1)}%</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div className="h-full rounded-full bg-sky-400" style={{ width: `${(stablecoinSupplyRatio / 25) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stablecoinSupplyRatio > 12
                  ? "High stablecoin supply — significant buying power on sidelines"
                  : "Low stablecoin supply — capital already deployed"}
              </p>
            </div>

            <div className="p-3 bg-emerald-400/5 border border-emerald-400/20 rounded-lg">
              <p className="text-xs text-emerald-400 font-semibold mb-1">SOPR Signal</p>
              <div className="flex gap-2">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-amber-300">1.043</p>
                  <p className="text-xs text-muted-foreground">BTC SOPR</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-indigo-300">1.012</p>
                  <p className="text-xs text-muted-foreground">ETH SOPR</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">
                SOPR &gt; 1.0 = coins moved at profit (healthy uptrend)
              </p>
            </div>
          </div>
        </div>

        {/* Educational footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 border-t border-border/50 pt-4">
          {[
            {
              icon: CheckCircle,
              color: "text-emerald-400",
              label: "Bullish Signals",
              items: ["MVRV < 2.5 (not overbought)", "LTH supply at 68% (conviction high)", "Whale accumulation score 67/100", "Stablecoin sidelines: $14.2% of mktcap"],
            },
            {
              icon: AlertTriangle,
              color: "text-amber-400",
              label: "Watch",
              items: ["Exchange reserves trending mixed", "SOPR > 1 = mild profit taking", "340d post-halving (peak window approaching)", "BTC dominance rising = altcoin caution"],
            },
            {
              icon: Zap,
              color: "text-sky-400",
              label: "Key Metrics to Monitor",
              items: ["NVT ratio (network value vs. transactions)", "Puell Multiple (miner revenue vs. 365d avg)", "Exchange net flows (daily BTC in/out)", "NUPL (Net Unrealized P&L)"],
            },
          ].map((col) => (
            <div key={col.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <col.icon className={cn("w-3.5 h-3.5", col.color)} />
                <span className={cn("text-xs font-semibold", col.color)}>{col.label}</span>
              </div>
              {col.items.map((item) => (
                <p key={item} className="text-xs text-muted-foreground leading-relaxed">• {item}</p>
              ))}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
