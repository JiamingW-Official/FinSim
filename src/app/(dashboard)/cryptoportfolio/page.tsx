"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  DollarSign,
  BarChart2,
  Activity,
  Layers,
  FileText,
  Zap,
  Info,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 83;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Reset seed to produce deterministic output
function resetSeed() {
  s = 83;
}

// ── Data Types ─────────────────────────────────────────────────────────────────

interface CryptoAsset {
  symbol: string;
  name: string;
  holdings: number;
  avgCost: number;
  currentPrice: number;
  color: string;
}

interface YieldOpportunity {
  protocol: string;
  asset: string;
  apy: number;
  tvl: number;
  riskScore: number;
  type: "lending" | "LP" | "staking";
  chain: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const CRYPTO_ASSETS: CryptoAsset[] = [
  { symbol: "BTC",  name: "Bitcoin",      holdings: 0.52,  avgCost: 38000,  currentPrice: 67400, color: "#f7931a" },
  { symbol: "ETH",  name: "Ethereum",     holdings: 4.2,   avgCost: 2100,   currentPrice: 3520,  color: "#627eea" },
  { symbol: "SOL",  name: "Solana",       holdings: 18.5,  avgCost: 95,     currentPrice: 178,   color: "#9945ff" },
  { symbol: "BNB",  name: "BNB",          holdings: 3.1,   avgCost: 280,    currentPrice: 412,   color: "#f3ba2f" },
  { symbol: "XRP",  name: "XRP",          holdings: 1200,  avgCost: 0.52,   currentPrice: 0.71,  color: "#346aa9" },
  { symbol: "AVAX", name: "Avalanche",    holdings: 22,    avgCost: 28,     currentPrice: 41,    color: "#e84142" },
  { symbol: "DOGE", name: "Dogecoin",     holdings: 8500,  avgCost: 0.065,  currentPrice: 0.18,  color: "#c2a633" },
  { symbol: "LINK", name: "Chainlink",    holdings: 45,    avgCost: 12.5,   currentPrice: 19.8,  color: "#2a5ada" },
  { symbol: "UNI",  name: "Uniswap",      holdings: 60,    avgCost: 7.2,    currentPrice: 10.4,  color: "#ff007a" },
  { symbol: "MATIC",name: "Polygon",      holdings: 900,   avgCost: 0.72,   currentPrice: 1.05,  color: "#8247e5" },
];

const YIELD_OPPORTUNITIES: YieldOpportunity[] = [
  { protocol: "Aave",         asset: "ETH",   apy: 4.1,  tvl: 12.4, riskScore: 2, type: "lending",  chain: "Ethereum"  },
  { protocol: "Lido",         asset: "ETH",   apy: 3.9,  tvl: 28.2, riskScore: 2, type: "staking",  chain: "Ethereum"  },
  { protocol: "Compound",     asset: "USDC",  apy: 5.8,  tvl: 3.1,  riskScore: 2, type: "lending",  chain: "Ethereum"  },
  { protocol: "Uniswap V3",   asset: "ETH/USDC", apy: 12.4, tvl: 1.8, riskScore: 5, type: "LP",    chain: "Ethereum"  },
  { protocol: "Marinade",     asset: "SOL",   apy: 6.8,  tvl: 2.9,  riskScore: 3, type: "staking",  chain: "Solana"    },
  { protocol: "Raydium",      asset: "SOL/USDC", apy: 18.2, tvl: 0.4, riskScore: 6, type: "LP",    chain: "Solana"    },
  { protocol: "PancakeSwap",  asset: "BNB/BUSD", apy: 9.7, tvl: 1.2, riskScore: 4, type: "LP",    chain: "BSC"       },
  { protocol: "Venus",        asset: "BNB",   apy: 5.1,  tvl: 0.9,  riskScore: 4, type: "staking",  chain: "BSC"       },
  { protocol: "BENQI",        asset: "AVAX",  apy: 8.2,  tvl: 0.6,  riskScore: 3, type: "staking",  chain: "Avalanche" },
  { protocol: "Trader Joe",   asset: "AVAX/USDC", apy: 22.5, tvl: 0.3, riskScore: 7, type: "LP",   chain: "Avalanche" },
  { protocol: "Curve",        asset: "3pool", apy: 3.2,  tvl: 4.5,  riskScore: 2, type: "LP",       chain: "Ethereum"  },
  { protocol: "Convex",       asset: "CVX",   apy: 7.6,  tvl: 2.1,  riskScore: 4, type: "staking",  chain: "Ethereum"  },
];

const CORRELATION_MATRIX = [
  [1.00, 0.82, 0.74, 0.77, 0.61, 0.69, 0.55, 0.71, 0.66, 0.70],
  [0.82, 1.00, 0.79, 0.72, 0.58, 0.73, 0.52, 0.76, 0.80, 0.75],
  [0.74, 0.79, 1.00, 0.68, 0.53, 0.70, 0.48, 0.69, 0.74, 0.72],
  [0.77, 0.72, 0.68, 1.00, 0.55, 0.65, 0.50, 0.64, 0.61, 0.66],
  [0.61, 0.58, 0.53, 0.55, 1.00, 0.49, 0.44, 0.51, 0.48, 0.52],
  [0.69, 0.73, 0.70, 0.65, 0.49, 1.00, 0.46, 0.66, 0.68, 0.67],
  [0.55, 0.52, 0.48, 0.50, 0.44, 0.46, 1.00, 0.47, 0.45, 0.49],
  [0.71, 0.76, 0.69, 0.64, 0.51, 0.66, 0.47, 1.00, 0.72, 0.68],
  [0.66, 0.80, 0.74, 0.61, 0.48, 0.68, 0.45, 0.72, 1.00, 0.71],
  [0.70, 0.75, 0.72, 0.66, 0.52, 0.67, 0.49, 0.68, 0.71, 1.00],
];

const SYMBOLS = CRYPTO_ASSETS.map(a => a.symbol);

// ── Helper Functions ───────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(decimals)}`;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function corrColor(v: number): string {
  if (v >= 0.8) return "#ef4444";
  if (v >= 0.65) return "#f97316";
  if (v >= 0.5) return "#eab308";
  return "#22c55e";
}

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 100, cy = 100, r = 75, ir = 48;
  let angle = -Math.PI / 2;
  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const xi1 = cx + ir * Math.cos(angle);
    const yi1 = cy + ir * Math.sin(angle);
    const xi2 = cx + ir * Math.cos(angle - sweep);
    const yi2 = cy + ir * Math.sin(angle - sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi2} ${yi2} Z`;
    return { path, color: d.color, label: d.label, pct: ((d.value / total) * 100).toFixed(1) };
  });
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[220px]">
      {slices.map((sl, i) => (
        <path key={i} d={sl.path} fill={sl.color} opacity={0.9} stroke="#111" strokeWidth={1} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#e5e7eb" fontSize={11} fontWeight={600}>Portfolio</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize={9}>Allocation</text>
    </svg>
  );
}

function LineChartSVG({
  data,
  width = 420,
  height = 110,
  color = "#6366f1",
  fill = false,
  label,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  label?: string;
}) {
  const pad = { t: 12, b: 18, l: 10, r: 10 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * w,
    y: pad.t + (1 - (v - min) / range) * h,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${pad.t + h} L ${pts[0].x} ${pad.t + h} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {fill && (
        <defs>
          <linearGradient id={`lg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#lg-${color.replace("#","")})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {label && (
        <text x={pad.l} y={height - 2} fill="#6b7280" fontSize={9}>{label}</text>
      )}
    </svg>
  );
}

function BitcoinDominanceGauge({ pct }: { pct: number }) {
  const r = 70, cx = 90, cy = 90;
  const startA = Math.PI;
  const endA = Math.PI + (pct / 100) * Math.PI;
  const x1 = cx + r * Math.cos(startA);
  const y1 = cy + r * Math.sin(startA);
  const x2 = cx + r * Math.cos(endA);
  const y2 = cy + r * Math.sin(endA);
  const large = pct > 50 ? 1 : 0;
  const bgX2 = cx + r * Math.cos(Math.PI * 2);
  const bgY2 = cy + r * Math.sin(Math.PI * 2);
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${bgX2} ${bgY2}`}
        fill="none" stroke="#374151" strokeWidth={14} strokeLinecap="round"
      />
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        fill="none" stroke="#f7931a" strokeWidth={14} strokeLinecap="round"
      />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#f7931a" fontSize={22} fontWeight={700}>{pct}%</text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#9ca3af" fontSize={9}>BTC Dominance</text>
      <text x={20} y={98} fill="#9ca3af" fontSize={8}>0%</text>
      <text x={155} y={98} fill="#9ca3af" fontSize={8}>100%</text>
    </svg>
  );
}

function AreaChartSVG({
  series,
  width = 480,
  height = 120,
  months,
}: {
  series: { data: number[]; color: string; label: string }[];
  width?: number;
  height?: number;
  months?: string[];
}) {
  const pad = { t: 14, b: 22, l: 12, r: 12 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const allVals = series.flatMap(s => s.data);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const n = series[0].data.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        {series.map(s => (
          <linearGradient key={s.label} id={`ag-${s.label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
          </linearGradient>
        ))}
      </defs>
      {series.map(s => {
        const pts = s.data.map((v, i) => ({
          x: pad.l + (i / (n - 1)) * w,
          y: pad.t + (1 - (v - min) / range) * h,
        }));
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        const area = `${line} L ${pts[n - 1].x} ${pad.t + h} L ${pts[0].x} ${pad.t + h} Z`;
        return (
          <g key={s.label}>
            <path d={area} fill={`url(#ag-${s.label})`} />
            <path d={line} fill="none" stroke={s.color} strokeWidth={1.8} strokeLinejoin="round" />
          </g>
        );
      })}
      {months && months.map((m, i) => {
        if (i % Math.ceil(n / 6) !== 0) return null;
        const x = pad.l + (i / (n - 1)) * w;
        return <text key={i} x={x} y={height - 4} textAnchor="middle" fill="#6b7280" fontSize={8}>{m}</text>;
      })}
    </svg>
  );
}

function DrawdownBubbleChart() {
  const events = [
    { year: "2011", drawdown: -93, label: "Mt.Gox hack" },
    { year: "2014", drawdown: -86, label: "Mt.Gox collapse" },
    { year: "2018", drawdown: -83, label: "Bear market" },
    { year: "2020", drawdown: -53, label: "COVID crash" },
    { year: "2022", drawdown: -77, label: "FTX/Luna" },
    { year: "2022", drawdown: -99, label: "Luna -99%" },
  ];
  const w = 400, h = 180, pad = { t: 20, b: 30, l: 40, r: 10 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const years = ["2011","2012","2014","2016","2018","2020","2022","2024"];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[-25, -50, -75, -100].map(v => {
        const y = pad.t + ((Math.abs(v) - 0) / 100) * ih;
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#1f2937" strokeDasharray="3,3" />
            <text x={pad.l - 4} y={y + 3} textAnchor="end" fill="#6b7280" fontSize={8}>{v}%</text>
          </g>
        );
      })}
      {years.map((yr, i) => {
        const x = pad.l + (i / (years.length - 1)) * iw;
        return <text key={yr} x={x} y={h - 4} textAnchor="middle" fill="#6b7280" fontSize={8}>{yr}</text>;
      })}
      {events.map((e, i) => {
        const xIdx = years.indexOf(e.year) / (years.length - 1);
        const xJitter = (i % 2) * 0.04 - 0.02;
        const x = pad.l + (xIdx + xJitter) * iw;
        const y = pad.t + (Math.abs(e.drawdown) / 100) * ih;
        const r = Math.abs(e.drawdown) / 14;
        const c = e.drawdown <= -80 ? "#ef4444" : e.drawdown <= -60 ? "#f97316" : "#eab308";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={c} fillOpacity={0.25} stroke={c} strokeWidth={1.5} />
            <text x={x} y={y + 3} textAnchor="middle" fill={c} fontSize={7} fontWeight={600}>{e.drawdown}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Helper to generate seeded series ──────────────────────────────────────────

function genSeries(n: number, start: number, vol: number, trend: number): number[] {
  const arr: number[] = [start];
  for (let i = 1; i < n; i++) {
    arr.push(arr[i - 1] * (1 + trend + (rand() - 0.5) * vol));
  }
  return arr;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className={cn("text-xl font-bold", positive === undefined ? "text-white" : positive ? "text-emerald-400" : "text-red-400")}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ── Risk Bar ───────────────────────────────────────────────────────────────────

function RiskBar({ score }: { score: number }) {
  const c = score <= 3 ? "bg-emerald-500" : score <= 5 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className={cn("h-1.5 rounded-full", c)} style={{ width: `${(score / 10) * 100}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-4">{score}</span>
    </div>
  );
}

// ── CorrelationMatrix Component ────────────────────────────────────────────────

function CorrelationMatrix() {
  const size = SYMBOLS.length;
  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-10 h-7" />
            {SYMBOLS.map(s => (
              <th key={s} className="w-9 h-7 text-center text-muted-foreground font-medium">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SYMBOLS.map((rowS, ri) => (
            <tr key={rowS}>
              <td className="text-muted-foreground font-medium pr-2 text-right">{rowS}</td>
              {SYMBOLS.map((colS, ci) => {
                const v = CORRELATION_MATRIX[ri][ci];
                const bg = ri === ci ? "#1f2937" : `${corrColor(v)}22`;
                const fg = ri === ci ? "#6b7280" : corrColor(v);
                return (
                  <td key={colS} className="w-9 h-7 text-center rounded" style={{ backgroundColor: bg, color: fg }}>
                    {v.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── IL Calculator ──────────────────────────────────────────────────────────────

function ILCalculator() {
  const [priceChange, setPriceChange] = useState(50);
  const ratio = (priceChange + 100) / 100;
  const il = (2 * Math.sqrt(ratio) / (1 + ratio) - 1) * 100;
  const hodlValue = 100 + priceChange / 2;
  const lpValue = hodlValue + il;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Token A price change: <span className="text-white font-medium">{priceChange > 0 ? "+" : ""}{priceChange}%</span></label>
        <input
          type="range"
          min={-80}
          max={300}
          step={5}
          value={priceChange}
          onChange={e => setPriceChange(Number(e.target.value))}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
          <span>-80%</span><span>+300%</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs text-muted-foreground mb-1">IL</div>
          <div className="text-lg font-bold text-red-400">{il.toFixed(2)}%</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs text-muted-foreground mb-1">HODL Value</div>
          <div className="text-lg font-bold text-primary">${hodlValue.toFixed(1)}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs text-muted-foreground mb-1">LP Value</div>
          <div className="text-lg font-bold text-primary">${lpValue.toFixed(1)}</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Starting from $100 HODL equivalent. IL increases when token prices diverge.
        LP fees may offset IL — compare APY vs expected IL for your timeframe.
      </p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CryptoPortfolioPage() {
  resetSeed();

  const [activeTab, setActiveTab] = useState("portfolio");
  const [costMethod, setCostMethod] = useState<"FIFO" | "HIFO" | "SPECIFIC">("FIFO");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // ── Compute portfolio stats ──────────────────────────────────────────────────
  const portfolioData = useMemo(() => {
    const assets = CRYPTO_ASSETS.map(a => {
      const currentValue = a.holdings * a.currentPrice;
      const costBasis = a.holdings * a.avgCost;
      const pnl = currentValue - costBasis;
      const pnlPct = (pnl / costBasis) * 100;
      return { ...a, currentValue, costBasis, pnl, pnlPct };
    });
    const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
    const totalCost  = assets.reduce((s, a) => s + a.costBasis, 0);
    const totalPnl   = totalValue - totalCost;
    const totalPnlPct = (totalPnl / totalCost) * 100;
    const best  = assets.reduce((a, b) => a.pnlPct > b.pnlPct ? a : b);
    const worst = assets.reduce((a, b) => a.pnlPct < b.pnlPct ? a : b);
    const donutData = assets.map(a => ({ label: a.symbol, value: a.currentValue, color: a.color }));

    // Tax impact by method
    const gains = assets.map(a => ({
      symbol: a.symbol,
      fifoGain: a.pnl * 0.92, // FIFO: slightly higher gains (oldest lots)
      hifoGain: a.pnl * 0.71, // HIFO: minimize gains using highest cost lots
      specificGain: a.pnl * 0.81,
    }));
    const fifoTotal   = gains.reduce((s, g) => s + g.fifoGain, 0);
    const hifoTotal   = gains.reduce((s, g) => s + g.hifoGain, 0);
    const specificTotal = gains.reduce((s, g) => s + g.specificGain, 0);

    // Heat score: average correlation × concentration HHI
    const weights = assets.map(a => a.currentValue / totalValue);
    const hhi = weights.reduce((s, w) => s + w * w, 0); // 0=diversified, 1=concentrated
    const avgCorr = 0.68; // from matrix
    const heatScore = Math.round(avgCorr * hhi * 1000 * 10) / 10;

    return { assets, totalValue, totalCost, totalPnl, totalPnlPct, best, worst, donutData, fifoTotal, hifoTotal, specificTotal, heatScore, weights };
  }, []);

  // ── Market Analysis data ─────────────────────────────────────────────────────
  const marketData = useMemo(() => {
    resetSeed();
    const months24 = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(2024, 2, 1);
      d.setMonth(d.getMonth() + i - 22);
      return d.toLocaleDateString("en", { month: "short", year: "2-digit" });
    });
    const btcEthRatio = genSeries(24, 18, 0.12, 0.005);
    const altcoinIndex = genSeries(24, 40, 0.18, 0.008);
    const globalMcap36 = genSeries(36, 900, 0.10, 0.015);
    const months36 = Array.from({ length: 36 }, (_, i) => {
      const d = new Date(2024, 2, 1);
      d.setMonth(d.getMonth() + i - 35);
      return d.toLocaleDateString("en", { month: "short", year: "2-digit" });
    });
    const altcoinIndexCurrent = altcoinIndex[altcoinIndex.length - 1];
    return { btcEthRatio, altcoinIndex, altcoinIndexCurrent, globalMcap36, months24, months36 };
  }, []);

  // ── On-Chain data ─────────────────────────────────────────────────────────────
  const onChainData = useMemo(() => {
    resetSeed();
    const mvrvSeries = genSeries(30, 1.8, 0.06, 0.012);
    const soprSeries = genSeries(30, 0.98, 0.04, 0.003);
    const netflowSeries = genSeries(30, -800, 0.3, 0.005).map(v => v - 400);
    const activeAddrSeries = genSeries(30, 820000, 0.08, 0.008);
    const hashRateSeries = genSeries(30, 580, 0.06, 0.01);
    const whaleCountSeries = genSeries(30, 2280, 0.03, 0.002);
    const mvrv = mvrvSeries[mvrvSeries.length - 1];
    const sopr = soprSeries[soprSeries.length - 1];
    const netflow = netflowSeries[netflowSeries.length - 1];
    return { mvrvSeries, soprSeries, netflowSeries, activeAddrSeries, hashRateSeries, whaleCountSeries, mvrv, sopr, netflow };
  }, []);

  // ── DeFi TVL series ───────────────────────────────────────────────────────────
  const defiTVLSeries = useMemo(() => {
    resetSeed();
    return genSeries(12, 42, 0.12, 0.02);
  }, []);

  // ── Risk data ─────────────────────────────────────────────────────────────────
  const riskData = useMemo(() => {
    resetSeed();
    const dailyReturns = genSeries(252, 1, 0.04, 0).map((v, i, arr) => i === 0 ? 0 : (v - arr[i - 1]) / arr[i - 1]);
    const sorted = [...dailyReturns].sort((a, b) => a - b);
    const var95 = sorted[Math.floor(252 * 0.05)];
    const portfolioVal = portfolioData.totalValue;
    const varDollar = portfolioVal * Math.abs(var95);

    // Kelly criterion
    const expectedReturn = 0.65; // win rate
    const avgWin = 0.45;
    const avgLoss = 0.30;
    const kelly = (expectedReturn / avgLoss) - ((1 - expectedReturn) / avgWin);
    const kellyAdj = kelly * 0.25; // quarter kelly for crypto vol

    return { var95: var95 * 100, varDollar, kelly, kellyAdj };
  }, [portfolioData.totalValue]);

  const tabs = [
    { id: "portfolio",  label: "Portfolio",      icon: BarChart2   },
    { id: "market",     label: "Market Analysis", icon: TrendingUp  },
    { id: "onchain",    label: "On-Chain",        icon: Activity    },
    { id: "defi",       label: "DeFi Yield",      icon: Zap         },
    { id: "risk",       label: "Risk Mgmt",       icon: Shield      },
    { id: "tax",        label: "Tax & Compliance",icon: FileText     },
  ];

  const toggle = (key: string) => setExpandedSection(prev => prev === key ? null : key);

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bitcoin className="w-6 h-6 text-orange-400" />
            Crypto Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Advanced analytics, on-chain insights, DeFi yields & tax optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total Value</div>
            <div className="text-xl font-bold text-white">{fmt(portfolioData.totalValue)}</div>
          </div>
          <div className={cn("text-right", portfolioData.totalPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
            <div className="text-xs text-muted-foreground">Total P&L</div>
            <div className="text-lg font-semibold">{fmtPct(portfolioData.totalPnlPct)}</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 bg-transparent h-auto p-0">
          {tabs.map(t => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                data-[state=active]:bg-primary data-[state=active]:text-white
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
                data-[state=inactive]:bg-white/5 transition-colors"
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Portfolio Tracker ─────────────────────────────────────────── */}
        <TabsContent value="portfolio" className="mt-4 space-y-6 data-[state=inactive]:hidden">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Value"   value={fmt(portfolioData.totalValue)}   icon={DollarSign} />
            <StatCard label="Total P&L"     value={fmt(portfolioData.totalPnl)}     positive={portfolioData.totalPnl >= 0} icon={TrendingUp} />
            <StatCard label="Best Performer" value={portfolioData.best.symbol}      sub={fmtPct(portfolioData.best.pnlPct)} positive icon={ChevronUp} />
            <StatCard label="Worst Performer" value={portfolioData.worst.symbol}    sub={fmtPct(portfolioData.worst.pnlPct)} positive={false} icon={ChevronDown} />
          </div>

          {/* Donut + Holdings table */}
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
            <div className="flex flex-col items-center gap-2">
              <DonutChart data={portfolioData.donutData} />
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {portfolioData.assets.map(a => (
                  <div key={a.symbol} className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                    <span className="text-muted-foreground">{a.symbol}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-white/8">
                    <th className="text-left py-2 pr-4">Asset</th>
                    <th className="text-right py-2 pr-3">Holdings</th>
                    <th className="text-right py-2 pr-3">Avg Cost</th>
                    <th className="text-right py-2 pr-3">Price</th>
                    <th className="text-right py-2 pr-3">Value</th>
                    <th className="text-right py-2 pr-3">P&L $</th>
                    <th className="text-right py-2 pr-3">P&L %</th>
                    <th className="text-right py-2">Alloc</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.assets.map(a => (
                    <tr key={a.symbol} className="border-b border-white/4 hover:bg-muted/30 transition-colors">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                          <span className="font-medium">{a.symbol}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">{a.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-2 pr-3 text-muted-foreground tabular-nums">{a.holdings.toLocaleString()}</td>
                      <td className="text-right py-2 pr-3 text-muted-foreground tabular-nums">${a.avgCost.toLocaleString()}</td>
                      <td className="text-right py-2 pr-3 text-white tabular-nums">${a.currentPrice.toLocaleString()}</td>
                      <td className="text-right py-2 pr-3 tabular-nums">{fmt(a.currentValue)}</td>
                      <td className={cn("text-right py-2 pr-3 tabular-nums", a.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(a.pnl)}</td>
                      <td className={cn("text-right py-2 pr-3 tabular-nums font-medium", a.pnlPct >= 0 ? "text-emerald-400" : "text-red-400")}>{fmtPct(a.pnlPct)}</td>
                      <td className="text-right py-2 text-muted-foreground tabular-nums">{((a.currentValue / portfolioData.totalValue) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost basis methods + Heat score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Cost Basis Method — Tax Impact</h3>
              <div className="flex gap-2">
                {(["FIFO","HIFO","SPECIFIC"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setCostMethod(m)}
                    className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                      costMethod === m ? "bg-primary text-white" : "bg-white/8 text-muted-foreground hover:text-white")}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { m: "FIFO",     v: portfolioData.fifoTotal,    label: "First In, First Out" },
                  { m: "HIFO",     v: portfolioData.hifoTotal,    label: "Highest Cost First" },
                  { m: "SPECIFIC", v: portfolioData.specificTotal,label: "Specific ID" },
                ].map(row => (
                  <div key={row.m} className={cn("rounded-lg p-3 border", costMethod === row.m ? "border-primary bg-primary/10" : "border-white/8 bg-white/4")}>
                    <div className="text-xs text-muted-foreground mb-1">{row.m}</div>
                    <div className={cn("font-bold text-sm", row.v >= 0 ? "text-orange-400" : "text-emerald-400")}>{fmt(row.v)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                HIFO minimizes taxable gains by using the highest-cost lots first. Savings vs FIFO: <span className="text-emerald-400">{fmt(portfolioData.fifoTotal - portfolioData.hifoTotal)}</span>
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-orange-400" />Portfolio Heat Score</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full">
                    <circle cx={40} cy={40} r={32} fill="none" stroke="#1f2937" strokeWidth={8} />
                    <circle cx={40} cy={40} r={32} fill="none"
                      stroke={portfolioData.heatScore < 20 ? "#22c55e" : portfolioData.heatScore < 40 ? "#eab308" : "#ef4444"}
                      strokeWidth={8} strokeLinecap="round"
                      strokeDasharray={`${(portfolioData.heatScore / 100) * 201} 201`}
                      transform="rotate(-90 40 40)"
                    />
                    <text x={40} y={44} textAnchor="middle" fill="white" fontSize={14} fontWeight={700}>{portfolioData.heatScore}</text>
                  </svg>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-sm font-medium">
                    {portfolioData.heatScore < 20 ? "Low Concentration Risk" : portfolioData.heatScore < 40 ? "Moderate Correlation Risk" : "High Cluster Risk"}
                  </div>
                  <p className="text-xs text-muted-foreground">Measures correlation-weighted concentration. A high score means your assets tend to move together — limited diversification benefit.</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-muted-foreground">Avg Corr: <span className="text-white">0.68</span></span>
                    <span className="text-muted-foreground">HHI: <span className="text-white">{portfolioData.weights.reduce((s, w) => s + w * w, 0).toFixed(3)}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Market Analysis ────────────────────────────────────────────── */}
        <TabsContent value="market" className="mt-4 space-y-6 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="BTC Dominance" value="52%" sub="↑ 1.2% this week" icon={Bitcoin} />
            <StatCard label="Altcoin Season" value={`${Math.round(marketData.altcoinIndexCurrent)}`} sub="Score 0-100 (>75 = Alt Season)" />
            <StatCard label="Total Market Cap" value="$2.41T" sub="+3.2% (7d)" positive />
            <StatCard label="Market Structure" value="Bull Market" sub="Accumulation phase" positive />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BTC Dominance Gauge */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Bitcoin className="w-4 h-4 text-orange-400" />Bitcoin Dominance</h3>
              <div className="flex justify-center">
                <BitcoinDominanceGauge pct={52} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Low (<40%)", desc: "Alt season", c: "text-primary" },
                  { label: "Normal (40-60%)", desc: "Balanced", c: "text-primary" },
                  { label: "High (>60%)", desc: "BTC season", c: "text-orange-400" },
                ].map(row => (
                  <div key={row.label} className="rounded-lg bg-white/5 p-2 text-center">
                    <div className={row.c}>{row.label}</div>
                    <div className="text-muted-foreground mt-0.5">{row.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Altcoin Season Index */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
              <h3 className="font-semibold text-sm">Altcoin Season Index (24m)</h3>
              <LineChartSVG data={marketData.altcoinIndex} color="#8b5cf6" fill height={110} label="0 = BTC Season  →  100 = Alt Season" />
              <div className="flex gap-2 text-xs">
                <div className="flex-1 rounded bg-orange-500/15 border border-orange-500/30 p-2 text-center">
                  <div className="text-orange-400 font-medium">0–25</div>
                  <div className="text-muted-foreground">BTC Season</div>
                </div>
                <div className="flex-1 rounded bg-primary/15 border border-border p-2 text-center">
                  <div className="text-primary font-medium">25–75</div>
                  <div className="text-muted-foreground">Mixed</div>
                </div>
                <div className="flex-1 rounded bg-primary/15 border border-border p-2 text-center">
                  <div className="text-primary font-medium">75–100</div>
                  <div className="text-muted-foreground">Alt Season</div>
                </div>
              </div>
            </div>
          </div>

          {/* BTC/ETH Ratio */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />BTC/ETH Ratio — 24 Months</h3>
            <p className="text-xs text-muted-foreground">Higher ratio = BTC outperforming ETH. Watch for reversal signals when ETH leads innovation cycles.</p>
            <LineChartSVG data={marketData.btcEthRatio} color="#3b82f6" fill height={100} />
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span>Current: <span className="text-white">{marketData.btcEthRatio[marketData.btcEthRatio.length - 1].toFixed(1)}x</span></span>
              <span>12m Avg: <span className="text-white">{(marketData.btcEthRatio.slice(-12).reduce((s, v) => s + v, 0) / 12).toFixed(1)}x</span></span>
              <span>Interpretation: <span className="text-orange-400">BTC Season</span></span>
            </div>
          </div>

          {/* Global Market Cap */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-emerald-400" />Global Crypto Market Cap — 36 Months ($B)</h3>
            <AreaChartSVG
              series={[{ data: marketData.globalMcap36, color: "#10b981", label: "Market Cap" }]}
              height={120}
              months={marketData.months36}
            />
          </div>

          {/* Correlation Matrix */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              Correlation Matrix — Cluster Risk
            </h3>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-400">Red (&gt;0.8)</span> = highly correlated (limited diversification) •{" "}
              <span className="text-emerald-400">Green (&lt;0.5)</span> = low correlation (good diversifier)
            </p>
            <CorrelationMatrix />
          </div>
        </TabsContent>

        {/* ── Tab 3: On-Chain Metrics ───────────────────────────────────────────── */}
        <TabsContent value="onchain" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="MVRV Ratio"
              value={onChainData.mvrv.toFixed(2)}
              sub={onChainData.mvrv > 3.5 ? "Overbought" : onChainData.mvrv < 1 ? "Oversold" : "Neutral zone"}
              positive={onChainData.mvrv < 3.5 && onChainData.mvrv > 1}
              icon={Activity}
            />
            <StatCard
              label="SOPR"
              value={onChainData.sopr.toFixed(3)}
              sub={onChainData.sopr > 1 ? "Selling at profit" : "Selling at loss"}
              positive={onChainData.sopr > 1}
              icon={TrendingUp}
            />
            <StatCard
              label="Exchange Netflow"
              value={`${onChainData.netflow > 0 ? "+" : ""}${(onChainData.netflow / 1000).toFixed(0)}K BTC`}
              sub={onChainData.netflow < 0 ? "Net outflow (bullish)" : "Net inflow (bearish)"}
              positive={onChainData.netflow < 0}
              icon={onChainData.netflow < 0 ? TrendingUp : TrendingDown}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              { label: "MVRV Ratio (30d)", data: onChainData.mvrvSeries, color: "#f59e0b",
                info: "MVRV > 3.5 = historically overbought (previous cycle tops). MVRV < 1 = market below realized value (strong buy signal)." },
              { label: "SOPR — 30 Days", data: onChainData.soprSeries, color: "#6366f1",
                info: "SOPR > 1: holders selling at profit. SOPR < 1: holders selling at loss. Reset to 1 after bear market = bullish support." },
              { label: "Exchange Netflow (30d, BTC)", data: onChainData.netflowSeries, color: "#ef4444",
                info: "Negative netflow = more BTC leaving exchanges (accumulation, bullish). Positive = BTC moving to exchanges (potential selling)." },
              { label: "Active Addresses (30d)", data: onChainData.activeAddrSeries, color: "#22c55e",
                info: "Rising active addresses = growing network usage. 30-day MA smooths daily volatility. Bull markets show consistent growth." },
              { label: "Hash Rate — Mining Health", data: onChainData.hashRateSeries, color: "#3b82f6",
                info: "Hash rate proxy for miner confidence. Rising hash rate = miners expect higher future prices. Drop can signal stress." },
              { label: "Whale Addresses (>100 BTC)", data: onChainData.whaleCountSeries, color: "#8b5cf6",
                info: "Increasing whale count = accumulation by large holders. Declining count = whales distributing to retail." },
            ].map(chart => (
              <div key={chart.label} className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-2">
                <h3 className="font-semibold text-sm">{chart.label}</h3>
                <LineChartSVG data={chart.data} color={chart.color} fill height={90} />
                <p className="text-xs text-muted-foreground">{chart.info}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 4: DeFi Yield ─────────────────────────────────────────────────── */}
        <TabsContent value="defi" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="ETH Staking" value="3.9% APY" sub="Lido / Rocket Pool" positive icon={Zap} />
            <StatCard label="SOL Staking" value="6.8% APY" sub="Marinade / Jito" positive icon={Zap} />
            <StatCard label="AVAX Staking" value="8.2% APY" sub="Native staking" positive icon={Zap} />
            <StatCard label="BNB Staking" value="5.1% APY" sub="Auto-compounding" positive icon={Zap} />
          </div>

          {/* Yield table */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-yellow-400" />12 Live Yield Opportunities</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-white/8">
                    <th className="text-left py-2 pr-4">Protocol</th>
                    <th className="text-left py-2 pr-3">Asset</th>
                    <th className="text-center py-2 pr-3">Type</th>
                    <th className="text-right py-2 pr-3">APY</th>
                    <th className="text-right py-2 pr-3">TVL ($B)</th>
                    <th className="text-left py-2 pr-3">Risk (1-10)</th>
                    <th className="text-left py-2">Chain</th>
                  </tr>
                </thead>
                <tbody>
                  {YIELD_OPPORTUNITIES.map((y, i) => {
                    const typeColor = y.type === "staking" ? "text-emerald-400 bg-emerald-400/10" : y.type === "lending" ? "text-primary bg-primary/10" : "text-primary bg-primary/10";
                    return (
                      <tr key={i} className="border-b border-white/4 hover:bg-muted/30 transition-colors">
                        <td className="py-2 pr-4 font-medium">{y.protocol}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{y.asset}</td>
                        <td className="py-2 pr-3 text-center">
                          <span className={cn("text-xs px-1.5 py-0.5 rounded", typeColor)}>{y.type}</span>
                        </td>
                        <td className="text-right py-2 pr-3 text-yellow-400 font-semibold">{y.apy.toFixed(1)}%</td>
                        <td className="text-right py-2 pr-3 text-muted-foreground">${y.tvl.toFixed(1)}B</td>
                        <td className="py-2 pr-3">
                          <RiskBar score={y.riskScore} />
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">{y.chain}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yield comparison + IL calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* DeFi vs TradFi comparison */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" />DeFi vs Traditional Finance Yields</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Bank Savings",        apy: 0.5,  color: "#6b7280",  type: "TradFi" },
                  { label: "US T-Bills (3m)",      apy: 5.3,  color: "#3b82f6",  type: "TradFi" },
                  { label: "HY Corp Bonds",        apy: 7.2,  color: "#8b5cf6",  type: "TradFi" },
                  { label: "ETH Staking",          apy: 3.9,  color: "#627eea",  type: "DeFi"   },
                  { label: "SOL Staking",          apy: 6.8,  color: "#9945ff",  type: "DeFi"   },
                  { label: "AVAX Staking",         apy: 8.2,  color: "#e84142",  type: "DeFi"   },
                  { label: "Aave USDC",            apy: 5.8,  color: "#b6509e",  type: "DeFi"   },
                  { label: "Curve 3pool",          apy: 3.2,  color: "#3c3c3c",  type: "DeFi"   },
                  { label: "Uniswap ETH/USDC",     apy: 12.4, color: "#ff007a",  type: "DeFi"   },
                ].map(row => (
                  <div key={row.label} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs px-1 py-0.5 rounded text-white", row.type === "TradFi" ? "bg-primary/50" : "bg-primary/50")}>{row.type}</span>
                        <span className="text-muted-foreground">{row.label}</span>
                      </div>
                      <span className="text-yellow-400 font-medium">{row.apy}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full" style={{ width: `${(row.apy / 15) * 100}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IL Calculator */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" />Impermanent Loss Calculator</h3>
              <p className="text-xs text-muted-foreground">Model the IL for a 50/50 LP position when one token's price changes vs entry.</p>
              <ILCalculator />
            </div>
          </div>

          {/* DeFi TVL trend */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" />Total DeFi TVL — 12 Months ($B)</h3>
            <LineChartSVG data={defiTVLSeries} color="#10b981" fill height={100} />
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span>Current TVL: <span className="text-white">${defiTVLSeries[defiTVLSeries.length - 1].toFixed(0)}B</span></span>
              <span>12m Growth: <span className="text-emerald-400">{(((defiTVLSeries[defiTVLSeries.length - 1] / defiTVLSeries[0]) - 1) * 100).toFixed(0)}%</span></span>
            </div>
          </div>

          {/* Risk framework */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-red-400" />DeFi Risk Framework</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: "Smart Contract Risk", icon: "🔐", items: ["Unaudited code vulnerability", "Reentrancy attacks", "Oracle manipulation", "Admin key compromise"], color: "border-red-500/30 bg-red-500/5" },
                { title: "Liquidity Risk", icon: "💧", items: ["Low TVL = price impact", "Protocol insolvency", "Liquidity provider exit", "Market depth issues"], color: "border-orange-500/30 bg-orange-500/5" },
                { title: "Impermanent Loss", icon: "📉", items: ["Price divergence loss", "Magnified in volatile pairs", "Offset by trading fees", "Calculate before entering LP"], color: "border-yellow-500/30 bg-yellow-500/5" },
              ].map(r => (
                <div key={r.title} className={cn("rounded-xl border p-3 space-y-2", r.color)}>
                  <div className="font-medium text-sm">{r.icon} {r.title}</div>
                  <ul className="space-y-1">
                    {r.items.map(item => (
                      <li key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-muted-foreground mt-0.5">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Risk Management ────────────────────────────────────────────── */}
        <TabsContent value="risk" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="1-Day VaR (95%)" value={fmtPct(riskData.var95)} sub={`~${fmt(riskData.varDollar)} at risk`} positive={false} icon={Shield} />
            <StatCard label="Kelly Criterion" value={`${(riskData.kelly * 100).toFixed(0)}%`} sub={`Adj: ${(riskData.kellyAdj * 100).toFixed(0)}% (¼ Kelly)`} icon={BarChart2} />
            <StatCard label="Max BTC Drawdown" value="-93%" sub="2011 Mt.Gox era" positive={false} icon={TrendingDown} />
            <StatCard label="Portfolio Beta" value="1.24x" sub="vs. global equities" icon={Activity} />
          </div>

          {/* BTC Drawdown Analysis */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-400" />BTC Historical Drawdowns — Bubble Size = Severity</h3>
            <DrawdownBubbleChart />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-red-500/10 border border-red-500/20 p-2 text-center">
                <div className="text-red-400 font-medium">-90%+ Events</div>
                <div className="text-muted-foreground">Typical bear mkt</div>
              </div>
              <div className="rounded bg-orange-500/10 border border-orange-500/20 p-2 text-center">
                <div className="text-orange-400 font-medium">-60 to -80%</div>
                <div className="text-muted-foreground">Significant correction</div>
              </div>
              <div className="rounded bg-yellow-500/10 border border-yellow-500/20 p-2 text-center">
                <div className="text-yellow-400 font-medium">-30 to -60%</div>
                <div className="text-muted-foreground">Mid-cycle correction</div>
              </div>
            </div>
          </div>

          {/* Cross-asset correlation */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />Crypto vs Traditional Assets — Different Regimes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-white/8">
                    <th className="text-left py-2 pr-4">Regime</th>
                    <th className="text-right py-2 pr-3">BTC/SPY</th>
                    <th className="text-right py-2 pr-3">BTC/GLD</th>
                    <th className="text-right py-2 pr-3">BTC/TLT</th>
                    <th className="text-left py-2">Insight</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { regime: "Bull (Risk-On)",    btcSpy: 0.62,  btcGld: 0.28,  btcTlt: -0.31, insight: "Correlates with equities in risk-on" },
                    { regime: "Bear (Risk-Off)",   btcSpy: 0.78,  btcGld: 0.15,  btcTlt: -0.12, insight: "High corr — crypto sold with equities" },
                    { regime: "Inflation Spike",   btcSpy: 0.41,  btcGld: 0.52,  btcTlt: -0.55, insight: "Acts more like gold vs equities" },
                    { regime: "Bank Crisis (SVB)", btcSpy: -0.18, btcGld: 0.45,  btcTlt:  0.22, insight: "Decoupled — seen as safe haven briefly" },
                    { regime: "Crypto-Specific",   btcSpy: 0.12,  btcGld: 0.08,  btcTlt:  0.04, insight: "Macro events dominate crypto moves" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/4 hover:bg-muted/30">
                      <td className="py-2 pr-4 font-medium text-sm">{row.regime}</td>
                      <td className={cn("text-right py-2 pr-3 tabular-nums", Math.abs(row.btcSpy) > 0.6 ? "text-red-400" : "text-muted-foreground")}>{row.btcSpy.toFixed(2)}</td>
                      <td className={cn("text-right py-2 pr-3 tabular-nums", Math.abs(row.btcGld) > 0.6 ? "text-red-400" : "text-muted-foreground")}>{row.btcGld.toFixed(2)}</td>
                      <td className={cn("text-right py-2 pr-3 tabular-nums", Math.abs(row.btcTlt) > 0.6 ? "text-red-400" : "text-muted-foreground")}>{row.btcTlt.toFixed(2)}</td>
                      <td className="py-2 text-xs text-muted-foreground">{row.insight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Position sizing + Stop loss */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-yellow-400" />Kelly Criterion — Crypto Position Sizing</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Win Rate",         value: "65%" },
                    { label: "Avg Win",          value: "45%" },
                    { label: "Avg Loss",         value: "30%" },
                    { label: "Full Kelly",        value: `${(riskData.kelly * 100).toFixed(0)}%` },
                    { label: "¼ Kelly (Adj)",     value: `${(riskData.kellyAdj * 100).toFixed(0)}%` },
                    { label: "Rec. Risk/Trade",  value: `${(riskData.kellyAdj * 100).toFixed(0)}% of capital` },
                  ].map(r => (
                    <div key={r.label} className="rounded bg-white/5 p-2">
                      <div className="text-muted-foreground">{r.label}</div>
                      <div className="font-medium text-white">{r.value}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Full Kelly is too aggressive for crypto's high volatility. Use ¼ Kelly to cap max drawdown while still benefiting from edge.
                  With ${(portfolioData.totalValue * riskData.kellyAdj / 1000).toFixed(0)}K capital, risk <span className="text-yellow-400">${(portfolioData.totalValue * riskData.kellyAdj / 1000).toFixed(0)}K</span> per trade.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Stop Loss Strategy — High Volatility Assets</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { type: "Fixed Stop",      pros: "Simple, removes emotion", cons: "Stopped out by normal volatility spikes", rec: "Use 15-20% for BTC/ETH" },
                  { type: "Trailing Stop",   pros: "Locks in profits on runs", cons: "Whipsaws in sideways markets", rec: "Trail 2× ATR for crypto" },
                  { type: "Time Stop",       pros: "Exits if thesis not playing out", cons: "Ignores price levels", rec: "Exit if no move in 30 days" },
                  { type: "ATR Stop",        pros: "Adapts to current volatility", cons: "Complex to implement", rec: "1.5-2× daily ATR below entry" },
                ].map(row => (
                  <div key={row.type} className="rounded-lg bg-white/5 p-3">
                    <div className="font-medium text-foreground mb-1">{row.type}</div>
                    <div className="flex flex-wrap gap-x-4">
                      <span className="text-emerald-400">+ {row.pros}</span>
                      <span className="text-red-400">- {row.cons}</span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">Rec: {row.rec}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Black Swan scenarios */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" />Black Swan Scenarios — Portfolio Impact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { event: "Mt. Gox Repayment Sell", year: "2024", impact: -22, detail: "141K BTC creditor distribution. Market absorbed better than feared.", color: "border-orange-500/30 bg-orange-500/5" },
                { event: "FTX Collapse Contagion", year: "2022", impact: -77, detail: "FTX/Alameda $8B hole. Broader crypto confidence crisis. 3 months to bottom.", color: "border-red-500/30 bg-red-500/5" },
                { event: "Luna/UST Death Spiral",  year: "2022", impact: -99, detail: "Algorithmic stablecoin collapse. $40B wiped in days. LUNA → near zero.", color: "border-red-600/40 bg-red-600/8" },
                { event: "Exchange Hack (Large)",  year: "Ongoing", impact: -15, detail: "Industry-wide confidence loss. Bitcoin typically recovers in 1-3 months.", color: "border-yellow-500/30 bg-yellow-500/5" },
                { event: "Regulatory Ban",         year: "Hypothetical", impact: -55, detail: "China-style ban in G7 country. Temporary panic — network continues.", color: "border-border bg-primary/5" },
                { event: "Interest Rate Shock",    year: "2022", impact: -65, detail: "Fed 75bp hikes drained risk appetite. Crypto correlated with NASDAQ.", color: "border-border bg-primary/5" },
              ].map(sc => {
                const portfolioImpact = (portfolioData.totalValue * sc.impact) / 100;
                return (
                  <div key={sc.event} className={cn("rounded-xl border p-3 space-y-2", sc.color)}>
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm leading-tight">{sc.event}</div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{sc.year}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="text-red-400 font-bold">{sc.impact}%</span>
                      <span className="text-red-300 text-xs">≈ {fmt(portfolioImpact)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{sc.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 6: Tax & Compliance ───────────────────────────────────────────── */}
        <TabsContent value="tax" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Estimated Tax (FIFO)" value={fmt(portfolioData.fifoTotal * 0.28)} sub="28% blended rate" positive={false} icon={FileText} />
            <StatCard label="HIFO Savings" value={fmt((portfolioData.fifoTotal - portfolioData.hifoTotal) * 0.28)} sub="vs FIFO method" positive icon={TrendingUp} />
            <StatCard label="LTCG Eligible" value="72%" sub="Held >1 year" positive icon={Shield} />
            <StatCard label="ST → LT Rate Diff" value="17-20pp" sub="37% → 20% savings" positive icon={DollarSign} />
          </div>

          {/* Cost basis tracker */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Cost Basis Methods — Tax Comparison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { method: "FIFO", icon: "1️⃣", gains: portfolioData.fifoTotal, tax: portfolioData.fifoTotal * 0.28, desc: "First In, First Out. IRS default. Uses oldest lots first. Often highest taxable gain in rising markets.", badge: "Default" },
                { method: "HIFO", icon: "📉", gains: portfolioData.hifoTotal, tax: portfolioData.hifoTotal * 0.28, desc: "Highest Cost First. Minimizes current-year taxable gains. Must track each lot individually. Allowed by IRS via Specific ID.", badge: "Tax Optimal" },
                { method: "Specific ID", icon: "🎯", gains: portfolioData.specificTotal, tax: portfolioData.specificTotal * 0.28, desc: "Choose exactly which lot to sell. Maximum control. Good for harvesting losses or qualifying for LTCG rates.", badge: "Most Flexible" },
              ].map(m => (
                <div key={m.method} className="rounded-xl border border-white/8 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/40 text-primary">{m.badge}</span>
                  </div>
                  <div className="font-semibold">{m.method}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Taxable Gains:</span><span className="text-orange-400 font-medium">{fmt(m.gains)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Est. Tax:</span><span className="text-red-400 font-medium">{fmt(m.tax)}</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wash sale + LTCG */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-emerald-400"><Info className="w-4 h-4" />Wash Sale Rules — Crypto Opportunity</h3>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <div className="font-medium text-emerald-300 mb-1">Current Law: Crypto NOT Subject to Wash Sale</div>
                  <p className="text-xs text-muted-foreground">
                    Wash sale rules (IRC §1091) apply to "securities." Crypto is currently classified as property, not securities — meaning you can sell BTC at a loss, immediately rebuy, and still claim the tax loss.
                  </p>
                </div>
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                  <div className="font-medium text-orange-300 mb-1">Warning: Proposed Legislation</div>
                  <p className="text-xs text-muted-foreground">
                    Congress has proposed extending wash sale rules to crypto. This strategy window may close. Monitor regulatory changes (CFTC/SEC jurisdiction battles ongoing).
                  </p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="font-medium text-foreground">Tax Loss Harvesting Strategy:</div>
                  {[
                    "Sell BTC at loss in December to realize capital loss",
                    "Immediately repurchase BTC (no 30-day wait required)",
                    "Loss offsets other capital gains (up to $3K ordinary income/yr)",
                    "Carry forward remaining losses to future years",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-primary/5 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-primary"><Shield className="w-4 h-4" />Long vs Short Term Capital Gains</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-muted-foreground border-b border-white/8">
                      <th className="text-left py-2 pr-3">Income Bracket</th>
                      <th className="text-right py-2 pr-3">STCG Rate</th>
                      <th className="text-right py-2 pr-3">LTCG Rate</th>
                      <th className="text-right py-2">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { bracket: "$0-44K",     stcg: 10,  ltcg: 0,   savings: 10 },
                      { bracket: "$44-89K",    stcg: 12,  ltcg: 0,   savings: 12 },
                      { bracket: "$89-190K",   stcg: 22,  ltcg: 15,  savings: 7  },
                      { bracket: "$190-553K",  stcg: 32,  ltcg: 15,  savings: 17 },
                      { bracket: "$553K+",     stcg: 37,  ltcg: 20,  savings: 17 },
                    ].map(r => (
                      <tr key={r.bracket} className="border-b border-white/4">
                        <td className="py-2 pr-3 text-muted-foreground">{r.bracket}</td>
                        <td className="text-right py-2 pr-3 text-red-400">{r.stcg}%</td>
                        <td className="text-right py-2 pr-3 text-emerald-400">{r.ltcg}%</td>
                        <td className="text-right py-2 text-primary font-medium">{r.savings}pp</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">Hold crypto &gt;1 year to qualify for LTCG rates. On {fmt(portfolioData.totalPnl)} gain, holding qualifies saves <span className="text-primary">{fmt(portfolioData.totalPnl * 0.17)}</span> in taxes (17pp).</p>
            </div>
          </div>

          {/* DeFi Tax complexity */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" />DeFi Tax Complexity — Each Action is a Taxable Event</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { event: "Mining Income",      treatment: "Ordinary Income",  timing: "At receipt (FMV on date mined)",    complexity: "Medium", example: "Mine 0.01 BTC when BTC = $65K → report $650 income" },
                { event: "Staking Rewards",    treatment: "Ordinary Income",  timing: "At receipt (FMV on award date)",    complexity: "Medium", example: "Receive 0.1 ETH staking → report FMV as income immediately" },
                { event: "LP Token Entry",     treatment: "Disposal Event",   timing: "Token swap at entry",               complexity: "High",   example: "Adding ETH/USDC to Uniswap triggers ETH disposal (capital gain/loss)" },
                { event: "LP Token Exit",      treatment: "Disposal Event",   timing: "Token swap at exit + accrued fees", complexity: "High",   example: "Remove LP position → two disposals + fee income recognition" },
                { event: "Yield Farming",      treatment: "Ordinary Income",  timing: "Each reward harvest event",         complexity: "Very High", example: "Claim CRV rewards daily → potentially hundreds of taxable events/year" },
                { event: "Airdrops",           treatment: "Ordinary Income",  timing: "When you can exercise dominion",    complexity: "High",   example: "Receive UNI airdrop 2020 → report ~$1,200 as ordinary income" },
                { event: "Crypto-to-Crypto",   treatment: "Capital Gain/Loss",timing: "At time of exchange",              complexity: "Medium", example: "Swap ETH for SOL = dispose ETH (report gain/loss vs cost basis)" },
                { event: "NFT Purchase",       treatment: "Capital Gain",     timing: "ETH disposal at purchase",          complexity: "High",   example: "Buy NFT for 1 ETH = ETH disposal event, gain = (FMV ETH - cost basis)" },
                { event: "Wrapped Tokens",     treatment: "Unclear",          timing: "IRS guidance pending",              complexity: "Very High", example: "ETH → WETH: likely taxable disposal but IRS hasn't clarified" },
              ].map(e => (
                <div key={e.event} className="rounded-lg bg-white/5 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{e.event}</div>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded",
                      e.complexity === "Very High" ? "bg-red-500/20 text-red-400" :
                      e.complexity === "High" ? "bg-orange-500/20 text-orange-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    )}>{e.complexity}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Treatment: </span>
                    <span className="text-primary">{e.treatment}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{e.timing}</div>
                  <div className="text-xs text-muted-foreground italic">{e.example}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form 8949 Preview */}
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Form 8949 Preview — Simplified Gain/Loss Report</h3>
            <p className="text-xs text-muted-foreground mb-2">Simplified illustration. Consult a tax professional or crypto tax software (Koinly, TaxBit, CoinTracker) for actual filing.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse font-mono">
                <thead>
                  <tr className="text-muted-foreground border-b border-white/8 text-left">
                    <th className="py-2 pr-3">Description</th>
                    <th className="py-2 pr-3">Date Acq.</th>
                    <th className="py-2 pr-3">Date Sold</th>
                    <th className="text-right py-2 pr-3">Proceeds</th>
                    <th className="text-right py-2 pr-3">Cost Basis</th>
                    <th className="text-right py-2 pr-3">Gain/(Loss)</th>
                    <th className="py-2">Term</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { desc: "0.10 BTC", acq: "01/15/23", sold: "03/10/24", proceeds: 6740,  basis: 3800,  term: "L" },
                    { desc: "1.00 ETH", acq: "06/20/23", sold: "02/28/24", proceeds: 3520,  basis: 2100,  term: "S" },
                    { desc: "50 SOL",   acq: "11/03/22", sold: "01/15/24", proceeds: 8900,  basis: 4750,  term: "L" },
                    { desc: "200 DOGE", acq: "04/18/23", sold: "03/01/24", proceeds:    36, basis:    13,  term: "S" },
                    { desc: "10 LINK",  acq: "09/12/22", sold: "03/20/24", proceeds:   198, basis:   125,  term: "L" },
                  ].map((row, i) => {
                    const gl = row.proceeds - row.basis;
                    return (
                      <tr key={i} className="border-b border-white/4 hover:bg-muted/30">
                        <td className="py-2 pr-3 text-foreground">{row.desc}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{row.acq}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{row.sold}</td>
                        <td className="text-right py-2 pr-3 text-foreground">${row.proceeds.toLocaleString()}</td>
                        <td className="text-right py-2 pr-3 text-muted-foreground">${row.basis.toLocaleString()}</td>
                        <td className={cn("text-right py-2 pr-3 font-medium", gl >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {gl >= 0 ? "+" : ""}${gl.toLocaleString()}
                        </td>
                        <td className={cn("py-2 text-xs font-bold", row.term === "L" ? "text-primary" : "text-orange-400")}>
                          {row.term === "L" ? "LT" : "ST"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-white/20 font-medium">
                    <td colSpan={5} className="py-2 pr-3 text-muted-foreground">Total Net Gain</td>
                    <td className="text-right py-2 pr-3 text-emerald-400">+$12,829</td>
                    <td className="py-2 text-xs text-muted-foreground">Mixed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
              <span className="text-primary font-medium">LT</span> = Long-term (&gt;1 yr) → LTCG rates
              <span className="text-orange-400 font-medium ml-2">ST</span> = Short-term (≤1 yr) → Ordinary income rates
            </div>
          </div>

          {/* Mining / Staking income */}
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-yellow-400 flex items-center gap-2"><Zap className="w-4 h-4" />Mining & Staking Income — Taxed as Ordinary Income</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="font-medium text-foreground">Mining Income</div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Taxable when received at fair market value</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Deduct mining expenses: electricity, hardware (Schedule C)</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Hardware depreciation over 5 years (Section 179 available)</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Self-employment tax may apply (15.3% on net)</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Cost basis = FMV at time of mining for future sale calc</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-foreground">Staking Rewards</div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Jarrett v. IRS (2021): taxpayer argued not taxable until sold</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>IRS current position: taxable at receipt (Rev. Rul. 2023-14)</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Track each reward event: amount + FMV + date</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Liquid staking (stETH) adds complexity — consult CPA</li>
                  <li className="flex gap-2"><span className="text-yellow-400">→</span>Cost basis = FMV at reward receipt for future sale</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-muted-foreground border-t border-white/5 pt-4"
      >
        Educational simulation only. Not financial or tax advice. Prices and data are illustrative. Consult a CPA or financial advisor for actual decisions.
      </motion.div>
    </div>
  );
}
