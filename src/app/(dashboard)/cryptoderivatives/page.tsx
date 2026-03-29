"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Zap,
  Shield,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  Globe,
  Lock,
  Unlock,
  DollarSign,
  Layers,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 970;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-consume PRNG values into stable data arrays
const _r = Array.from({ length: 200 }, () => rand());
let _ri = 0;
const r = () => _r[_ri++ % _r.length];

// ── Helper formatters ──────────────────────────────────────────────────────────
function fmtUSD(n: number, decimals = 2): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtPct(n: number, digits = 4): string {
  return (n >= 0 ? "+" : "") + n.toFixed(digits) + "%";
}
function posColor(v: number): string {
  return v >= 0 ? "text-emerald-400" : "text-red-400";
}

// ── Perpetuals Data ────────────────────────────────────────────────────────────
interface PerpContract {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  nextFunding: string;
  openInterest: number;
  volume24h: number;
  change24h: number;
}

const BTC_MARK = 67840 + r() * 200 - 100;
const ETH_MARK = 3521 + r() * 40 - 20;

const PERPS: PerpContract[] = [
  {
    symbol: "BTC-PERP",
    markPrice: BTC_MARK,
    indexPrice: BTC_MARK + (r() * 20 - 10),
    fundingRate: (r() * 0.02 - 0.005),
    nextFunding: "02:14:33",
    openInterest: 4_820_000_000 + r() * 100_000_000,
    volume24h: 12_400_000_000 + r() * 500_000_000,
    change24h: r() * 6 - 2,
  },
  {
    symbol: "ETH-PERP",
    markPrice: ETH_MARK,
    indexPrice: ETH_MARK + (r() * 4 - 2),
    fundingRate: (r() * 0.015 - 0.003),
    nextFunding: "02:14:33",
    openInterest: 2_140_000_000 + r() * 50_000_000,
    volume24h: 5_800_000_000 + r() * 200_000_000,
    change24h: r() * 8 - 3,
  },
];

// ── Funding Rate History ───────────────────────────────────────────────────────
const FUNDING_HISTORY_BTC = Array.from({ length: 8 }, (_, i) => ({
  period: `-${(8 - i) * 8}h`,
  rate: r() * 0.04 - 0.01,
}));
const FUNDING_HISTORY_ETH = Array.from({ length: 8 }, (_, i) => ({
  period: `-${(8 - i) * 8}h`,
  rate: r() * 0.035 - 0.008,
}));

// ── Options Chain ──────────────────────────────────────────────────────────────
interface OptionRow {
  strike: number;
  callBid: number;
  callAsk: number;
  callIV: number;
  callDelta: number;
  callOI: number;
  putBid: number;
  putAsk: number;
  putIV: number;
  putDelta: number;
  putOI: number;
  isATM: boolean;
}

const ATM_STRIKE = Math.round(BTC_MARK / 1000) * 1000;
const STRIKES = [
  Math.round(ATM_STRIKE * 0.9 / 500) * 500,
  ATM_STRIKE,
  Math.round(ATM_STRIKE * 1.1 / 500) * 500,
  Math.round(ATM_STRIKE * 1.2 / 500) * 500,
];

function buildOptionRow(strike: number): OptionRow {
  const moneyness = BTC_MARK / strike;
  const baseIV = 0.55 + (1 - moneyness) * (1 - moneyness) * 3 + r() * 0.05;
  const callIV = baseIV + r() * 0.02;
  const putIV = baseIV + r() * 0.02 + 0.01;
  const T = 14 / 365;
  const d1 = (Math.log(BTC_MARK / strike) + 0.5 * callIV * callIV * T) / (callIV * Math.sqrt(T));
  const callDelta = Math.max(0.01, Math.min(0.99, 0.5 + d1 * 0.4));
  const callMid = Math.max(10, BTC_MARK * callIV * Math.sqrt(T) * 0.4 * (callDelta));
  const putMid = Math.max(10, strike * callIV * Math.sqrt(T) * 0.4 * (1 - callDelta));
  const spread = callMid * 0.04 + 10;
  return {
    strike,
    callBid: callMid - spread / 2,
    callAsk: callMid + spread / 2,
    callIV: callIV * 100,
    callDelta,
    callOI: Math.round((r() * 2000 + 200) * 10) * 10,
    putBid: putMid - spread / 2,
    putAsk: putMid + spread / 2,
    putIV: putIV * 100,
    putDelta: -(1 - callDelta),
    putOI: Math.round((r() * 2500 + 300) * 10) * 10,
    isATM: strike === ATM_STRIKE,
  };
}

const OPTIONS_CHAIN: OptionRow[] = STRIKES.map(buildOptionRow);

// ── Liquidation Heatmap ────────────────────────────────────────────────────────
interface LiqLevel {
  price: number;
  longLiq: number;
  shortLiq: number;
}

const LIQ_LEVELS: LiqLevel[] = [
  { price: ATM_STRIKE - 10000, longLiq: 890 + r() * 200, shortLiq: 40 + r() * 30 },
  { price: ATM_STRIKE - 7000,  longLiq: 1240 + r() * 300, shortLiq: 65 + r() * 40 },
  { price: ATM_STRIKE - 5000,  longLiq: 2100 + r() * 400, shortLiq: 90 + r() * 50 },
  { price: ATM_STRIKE - 3000,  longLiq: 3400 + r() * 600, shortLiq: 130 + r() * 60 },
  { price: ATM_STRIKE - 1500,  longLiq: 5800 + r() * 800, shortLiq: 220 + r() * 80 },
  { price: ATM_STRIKE,         longLiq: 0, shortLiq: 0 },
  { price: ATM_STRIKE + 1500,  longLiq: 180 + r() * 60, shortLiq: 4200 + r() * 700 },
  { price: ATM_STRIKE + 3000,  longLiq: 95 + r() * 40, shortLiq: 2800 + r() * 500 },
  { price: ATM_STRIKE + 5000,  longLiq: 55 + r() * 30, shortLiq: 1600 + r() * 300 },
  { price: ATM_STRIKE + 7000,  longLiq: 30 + r() * 20, shortLiq: 950 + r() * 200 },
  { price: ATM_STRIKE + 10000, longLiq: 20 + r() * 15, shortLiq: 420 + r() * 100 },
];

// ── DeFi Perps Comparison ──────────────────────────────────────────────────────
interface DefiRow {
  name: string;
  type: "CEX" | "DEX";
  takerFee: string;
  makerFee: string;
  maxLeverage: string;
  settlementToken: string;
  tvl: string;
  liquidationMechanism: string;
}

const DEFI_TABLE: DefiRow[] = [
  {
    name: "Binance",
    type: "CEX",
    takerFee: "0.040%",
    makerFee: "0.020%",
    maxLeverage: "125×",
    settlementToken: "USDT/BUSD",
    tvl: "$4.8B OI",
    liquidationMechanism: "Insurance fund + ADL",
  },
  {
    name: "Bybit",
    type: "CEX",
    takerFee: "0.055%",
    makerFee: "0.020%",
    maxLeverage: "100×",
    settlementToken: "USDT/USDC",
    tvl: "$2.1B OI",
    liquidationMechanism: "Insurance fund",
  },
  {
    name: "dYdX v4",
    type: "DEX",
    takerFee: "0.050%",
    makerFee: "0.000%",
    maxLeverage: "20×",
    settlementToken: "USDC",
    tvl: "$380M OI",
    liquidationMechanism: "On-chain liquidators",
  },
  {
    name: "GMX v2",
    type: "DEX",
    takerFee: "0.050%",
    makerFee: "0.020%",
    maxLeverage: "50×",
    settlementToken: "USDC/ETH/BTC",
    tvl: "$520M OI",
    liquidationMechanism: "GLP pool absorbs losses",
  },
  {
    name: "Hyperliquid",
    type: "DEX",
    takerFee: "0.035%",
    makerFee: "0.010%",
    maxLeverage: "50×",
    settlementToken: "USDC",
    tvl: "$1.2B OI",
    liquidationMechanism: "HLP vault + liquidators",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function FundingSparkline({ data, color }: { data: { period: string; rate: number }[]; color: string }) {
  const W = 260;
  const H = 60;
  const pad = { l: 4, r: 4, t: 8, b: 8 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const rates = data.map((d) => d.rate);
  const minR = Math.min(...rates, -0.005);
  const maxR = Math.max(...rates, 0.005);
  const rangeR = maxR - minR || 0.01;
  const toX = (i: number) => pad.l + (i / (data.length - 1)) * cw;
  const toY = (v: number) => pad.t + ch - ((v - minR) / rangeR) * ch;
  const zeroY = toY(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14">
      <line x1={pad.l} x2={W - pad.r} y1={zeroY} y2={zeroY} stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 2" />
      {data.map((d, i) => {
        if (i === 0) return null;
        const x1 = toX(i - 1);
        const x2 = toX(i);
        const y1 = toY(data[i - 1].rate);
        const y2 = toY(d.rate);
        return (
          <line key={`fl-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" />
        );
      })}
      {data.map((d, i) => (
        <circle key={`fc-${i}`} cx={toX(i)} cy={toY(d.rate)} r="2.5" fill={d.rate >= 0 ? "#34d399" : "#f87171"} />
      ))}
    </svg>
  );
}

function LiquidationHeatmap() {
  const W = 560;
  const H = 240;
  const pad = { l: 72, r: 16, t: 12, b: 32 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const maxVal = Math.max(...LIQ_LEVELS.map((d) => Math.max(d.longLiq, d.shortLiq)));
  const barH = ch / LIQ_LEVELS.length - 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-60">
      <defs>
        <linearGradient id="liqLong" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="liqShort" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {LIQ_LEVELS.map((d, i) => {
        const y = pad.t + i * (ch / LIQ_LEVELS.length);
        const isCurrentPrice = d.price === ATM_STRIKE;
        const longW = (d.longLiq / maxVal) * cw;
        const shortW = (d.shortLiq / maxVal) * cw;
        return (
          <g key={`liq-${i}`}>
            {isCurrentPrice && (
              <rect x={pad.l} y={y} width={cw} height={barH + 2} fill="#fbbf24" fillOpacity="0.06" />
            )}
            {d.longLiq > 0 && (
              <rect x={pad.l} y={y + 1} width={longW} height={barH / 2 - 1} fill="url(#liqLong)" rx="2" />
            )}
            {d.shortLiq > 0 && (
              <rect x={pad.l} y={y + barH / 2 + 1} width={shortW} height={barH / 2 - 1} fill="url(#liqShort)" rx="2" />
            )}
            <text
              x={pad.l - 6}
              y={y + barH / 2 + 4}
              textAnchor="end"
              fontSize="9"
              fill={isCurrentPrice ? "#fbbf24" : "#71717a"}
            >
              {isCurrentPrice ? `▶ ${fmtUSD(d.price, 0)}` : fmtUSD(d.price, 0)}
            </text>
          </g>
        );
      })}
      <text x={pad.l + 4} y={H - 4} fontSize="8" fill="#f87171">Long liquidations</text>
      <text x={pad.l + 90} y={H - 4} fontSize="8" fill="#34d399">Short liquidations</text>
    </svg>
  );
}

function OptionsChainTable() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th colSpan={5} className="text-center text-emerald-400 pb-2 font-medium text-xs">— CALLS —</th>
            <th className="text-center pb-2 text-muted-foreground font-medium">STRIKE</th>
            <th colSpan={5} className="text-center text-red-400 pb-2 font-medium text-xs">— PUTS —</th>
          </tr>
          <tr className="border-b border-border/50 text-muted-foreground">
            <th className="text-right py-1.5 pr-2 font-normal">OI</th>
            <th className="text-right py-1.5 pr-2 font-normal">IV</th>
            <th className="text-right py-1.5 pr-2 font-normal">Δ</th>
            <th className="text-right py-1.5 pr-2 font-normal">Bid</th>
            <th className="text-right py-1.5 pr-4 font-normal">Ask</th>
            <th className="text-center py-1.5 px-3 font-normal text-foreground">Strike</th>
            <th className="text-left py-1.5 pl-4 font-normal">Bid</th>
            <th className="text-left py-1.5 pl-2 font-normal">Ask</th>
            <th className="text-left py-1.5 pl-2 font-normal">Δ</th>
            <th className="text-left py-1.5 pl-2 font-normal">IV</th>
            <th className="text-left py-1.5 pl-2 font-normal">OI</th>
          </tr>
        </thead>
        <tbody>
          {OPTIONS_CHAIN.map((row) => (
            <tr
              key={row.strike}
              className={`border-b border-border/30 cursor-pointer transition-colors ${
                selected === row.strike
                  ? "bg-primary/10"
                  : row.isATM
                  ? "bg-amber-500/5"
                  : "hover:bg-muted/30"
              }`}
              onClick={() => setSelected(selected === row.strike ? null : row.strike)}
            >
              <td className="text-right py-2 pr-2 text-muted-foreground">{row.callOI.toLocaleString()}</td>
              <td className="text-right py-2 pr-2 text-sky-400">{row.callIV.toFixed(1)}%</td>
              <td className="text-right py-2 pr-2 text-emerald-400">{row.callDelta.toFixed(2)}</td>
              <td className="text-right py-2 pr-2 text-emerald-400">{fmtUSD(row.callBid, 0)}</td>
              <td className="text-right py-2 pr-4 text-emerald-400">{fmtUSD(row.callAsk, 0)}</td>
              <td className="text-center py-2 px-3">
                <span className={`font-semibold ${row.isATM ? "text-amber-400" : "text-foreground"}`}>
                  {row.isATM && <span className="text-[11px] mr-1 text-amber-400">ATM</span>}
                  {fmtUSD(row.strike, 0)}
                </span>
              </td>
              <td className="text-left py-2 pl-4 text-red-400">{fmtUSD(row.putBid, 0)}</td>
              <td className="text-left py-2 pl-2 text-red-400">{fmtUSD(row.putAsk, 0)}</td>
              <td className="text-left py-2 pl-2 text-red-400">{row.putDelta.toFixed(2)}</td>
              <td className="text-left py-2 pl-2 text-sky-400">{row.putIV.toFixed(1)}%</td>
              <td className="text-left py-2 pl-2 text-muted-foreground">{row.putOI.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground mt-2">
        Expiry: 14 days • Underlying: BTC Spot • Settlement: USDC
      </p>
    </div>
  );
}

function MarginToggle() {
  const [mode, setMode] = useState<"cross" | "isolated">("cross");
  const [leverage, setLeverage] = useState(10);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => setMode("cross")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors ${
            mode === "cross"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          <Unlock className="w-4 h-4" />
          Cross Margin
        </button>
        <button
          onClick={() => setMode("isolated")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors ${
            mode === "isolated"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="w-4 h-4" />
          Isolated Margin
        </button>
      </div>

      <div className={`rounded-lg border p-4 ${mode === "cross" ? "border-primary/30 bg-primary/5" : "border-amber-500/30 bg-amber-500/5"}`}>
        {mode === "cross" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              <Unlock className="w-4 h-4" />
              Cross Margin Mode
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All available balance is used as collateral across all positions. Higher liquidation resilience — losses in one position can be offset by gains in another. Risk: a large adverse move can liquidate your entire portfolio.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Collateral scope</p>
                <p className="font-medium text-foreground mt-0.5">Entire account</p>
              </div>
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Liquidation price</p>
                <p className="font-medium text-emerald-400 mt-0.5">More favorable</p>
              </div>
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Max loss</p>
                <p className="font-medium text-red-400 mt-0.5">Full balance</p>
              </div>
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Best for</p>
                <p className="font-medium text-foreground mt-0.5">Hedging</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
              <Lock className="w-4 h-4" />
              Isolated Margin Mode
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each position has its own dedicated margin. If liquidated, only that position&apos;s margin is lost — protecting the rest of your account. You can manually top-up margin to avoid liquidation.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Collateral scope</p>
                <p className="font-medium text-foreground mt-0.5">Per position</p>
              </div>
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Liquidation price</p>
                <p className="font-medium text-amber-400 mt-0.5">Fixed at open</p>
              </div>
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Max loss</p>
                <p className="font-medium text-emerald-400 mt-0.5">Capped at margin</p>
              </div>
              <div className="bg-background/60 rounded p-2">
                <p className="text-muted-foreground">Best for</p>
                <p className="font-medium text-foreground mt-0.5">Speculative bets</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leverage slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Leverage</span>
          <span className="font-semibold text-foreground">{leverage}×</span>
        </div>
        <input
          type="range"
          min={1}
          max={mode === "cross" ? 125 : 50}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full accent-primary h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1×</span>
          <span>{mode === "cross" ? "125×" : "50×"}</span>
        </div>
        {leverage >= 20 && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-400/10 rounded px-2 py-1.5 mt-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            High leverage significantly increases liquidation risk
          </div>
        )}
      </div>

      {/* Estimated liquidation */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 rounded-lg p-3">
        <div>
          <p className="text-muted-foreground">Est. Liq. (Long)</p>
          <p className="font-medium text-red-400 mt-0.5">
            {fmtUSD(BTC_MARK * (1 - 1 / leverage * 0.9), 0)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Est. Liq. (Short)</p>
          <p className="font-medium text-red-400 mt-0.5">
            {fmtUSD(BTC_MARK * (1 + 1 / leverage * 0.9), 0)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Required Margin</p>
          <p className="font-medium text-foreground mt-0.5">{(100 / leverage).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">Maintenance Margin</p>
          <p className="font-medium text-foreground mt-0.5">{(50 / leverage).toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}

function DefiComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-3 font-medium">Platform</th>
            <th className="text-left py-2 pr-3 font-medium">Type</th>
            <th className="text-right py-2 pr-3 font-medium">Taker Fee</th>
            <th className="text-right py-2 pr-3 font-medium">Maker Fee</th>
            <th className="text-right py-2 pr-3 font-medium">Max Lev.</th>
            <th className="text-left py-2 pr-3 font-medium">Settlement</th>
            <th className="text-right py-2 pr-3 font-medium">Scale</th>
            <th className="text-left py-2 font-medium">Liquidation</th>
          </tr>
        </thead>
        <tbody>
          {DEFI_TABLE.map((row) => (
            <tr key={row.name} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
              <td className="py-2.5 pr-3 font-medium text-foreground">{row.name}</td>
              <td className="py-2.5 pr-3">
                <Badge
                  className={`text-[11px] px-1.5 py-0 ${
                    row.type === "CEX"
                      ? "bg-sky-400/10 text-sky-400 border-sky-400/20"
                      : "bg-primary/10 text-primary border-border"
                  }`}
                  variant="outline"
                >
                  {row.type}
                </Badge>
              </td>
              <td className="py-2.5 pr-3 text-right text-red-400">{row.takerFee}</td>
              <td className="py-2.5 pr-3 text-right text-emerald-400">{row.makerFee}</td>
              <td className="py-2.5 pr-3 text-right font-medium text-foreground">{row.maxLeverage}</td>
              <td className="py-2.5 pr-3 text-muted-foreground">{row.settlementToken}</td>
              <td className="py-2.5 pr-3 text-right text-foreground">{row.tvl}</td>
              <td className="py-2.5 text-muted-foreground">{row.liquidationMechanism}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-sky-400/5 border border-sky-400/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-medium mb-1.5">
            <Globe className="w-3.5 h-3.5" />
            CEX Advantages
          </div>
          <ul className="text-[11px] text-muted-foreground space-y-1">
            <li>• Deepest liquidity, tightest spreads</li>
            <li>• Higher leverage available</li>
            <li>• Insurance fund protection</li>
            <li>• Advanced order types (TWAP, OCO)</li>
          </ul>
        </div>
        <div className="bg-primary/5 border border-border rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-primary text-xs font-medium mb-1.5">
            <Zap className="w-3.5 h-3.5" />
            DEX Advantages
          </div>
          <ul className="text-[11px] text-muted-foreground space-y-1">
            <li>• Non-custodial, self-sovereign</li>
            <li>• No KYC required</li>
            <li>• Transparent on-chain settlement</li>
            <li>• Earn yield as liquidity provider</li>
          </ul>
        </div>
        <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Key Risks
          </div>
          <ul className="text-[11px] text-muted-foreground space-y-1">
            <li>• CEX: counterparty/custodial risk</li>
            <li>• DEX: smart contract exploits</li>
            <li>• Oracle manipulation attacks</li>
            <li>• Funding rate divergence</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CryptoDerivativesPage() {
  const [activePerp, setActivePerp] = useState<"BTC" | "ETH">("BTC");

  const perp = PERPS[activePerp === "BTC" ? 0 : 1];
  const fundingHistory = activePerp === "BTC" ? FUNDING_HISTORY_BTC : FUNDING_HISTORY_ETH;
  const basis = perp.markPrice - perp.indexPrice;
  const basisPct = (basis / perp.indexPrice) * 100;
  const fundingColor = perp.fundingRate >= 0 ? "text-red-400" : "text-emerald-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Crypto Derivatives
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Perpetual futures, options chains, liquidation maps, and DeFi perps comparison
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5 border border-border/50">
          <RefreshCw className="w-3 h-3" />
          Simulated data — educational only
        </div>
      </div>

      {/* Perp Selector & Stats Bar */}
      <div className="flex gap-2">
        {(["BTC", "ETH"] as const).map((sym) => (
          <Button
            key={sym}
            variant={activePerp === sym ? "default" : "outline"}
            size="sm"
            onClick={() => setActivePerp(sym)}
            className="font-mono text-xs"
          >
            {sym}-PERP
          </Button>
        ))}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Mark Price",
            value: fmtUSD(perp.markPrice, 2),
            sub: null,
            icon: <DollarSign className="w-3.5 h-3.5" />,
            valueClass: "text-foreground",
          },
          {
            label: "Index Price",
            value: fmtUSD(perp.indexPrice, 2),
            sub: null,
            icon: <BarChart2 className="w-3.5 h-3.5" />,
            valueClass: "text-foreground",
          },
          {
            label: "Basis",
            value: fmtUSD(Math.abs(basis), 2),
            sub: fmtPct(basisPct, 3),
            icon: <ArrowUpDown className="w-3.5 h-3.5" />,
            valueClass: posColor(basis),
          },
          {
            label: "Funding Rate",
            value: fmtPct(perp.fundingRate, 4),
            sub: `next in ${perp.nextFunding}`,
            icon: <RefreshCw className="w-3.5 h-3.5" />,
            valueClass: fundingColor,
          },
          {
            label: "Open Interest",
            value: `$${(perp.openInterest / 1e9).toFixed(2)}B`,
            sub: null,
            icon: <Layers className="w-3.5 h-3.5" />,
            valueClass: "text-foreground",
          },
          {
            label: "24h Volume",
            value: `$${(perp.volume24h / 1e9).toFixed(2)}B`,
            sub: fmtPct(perp.change24h, 2),
            icon: <TrendingUp className="w-3.5 h-3.5" />,
            valueClass: posColor(perp.change24h),
          },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                {stat.icon}
                {stat.label}
              </div>
              <p className={`text-sm font-bold font-mono ${stat.valueClass}`}>{stat.value}</p>
              {stat.sub && (
                <p className={`text-xs mt-0.5 font-mono ${stat.valueClass}`}>{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funding rate explanation banner */}
      <div className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2.5 border ${
        perp.fundingRate >= 0
          ? "bg-red-400/5 border-red-400/20 text-red-400"
          : "bg-emerald-400/5 border-emerald-400/20 text-emerald-400"
      }`}>
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          {perp.fundingRate >= 0
            ? `Positive funding rate: longs pay shorts ${fmtPct(perp.fundingRate, 4)} every 8h. Market is in contango — bullish sentiment is crowded.`
            : `Negative funding rate: shorts pay longs ${fmtPct(Math.abs(perp.fundingRate), 4)} every 8h. Market is in backwardation — bearish sentiment is crowded.`}
        </span>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="perps">
        <TabsList className="mb-4">
          <TabsTrigger value="perps">Perpetual Futures</TabsTrigger>
          <TabsTrigger value="options">Options Chain</TabsTrigger>
          <TabsTrigger value="liquidations">Liquidation Map</TabsTrigger>
          <TabsTrigger value="defi">DeFi vs CEX</TabsTrigger>
        </TabsList>

        {/* ── Perpetuals Tab ── */}
        <TabsContent value="perps" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Funding Rate History */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  Funding Rate History — {activePerp}-PERP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FundingSparkline
                  data={fundingHistory}
                  color={perp.fundingRate >= 0 ? "#f87171" : "#34d399"}
                />
                <div className="grid grid-cols-4 gap-1 mt-3">
                  {fundingHistory.map((d) => (
                    <div key={d.period} className="text-center">
                      <p className={`text-[11px] font-mono ${d.rate >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {fmtPct(d.rate, 4)}
                      </p>
                      <p className="text-[8px] text-muted-foreground">{d.period}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Longs pay shorts</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Shorts pay longs</span>
                </div>
              </CardContent>
            </Card>

            {/* Mark vs Index Price Detail */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-primary" />
                  Mark vs Index Price
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: "Mark Price", value: fmtUSD(perp.markPrice), desc: "Fair value used for P&L and liquidations" },
                    { label: "Index Price", value: fmtUSD(perp.indexPrice), desc: "Weighted avg of spot prices across exchanges" },
                    { label: "Basis", value: `${basis >= 0 ? "+" : ""}${fmtUSD(basis)} (${basisPct.toFixed(4)}%)`, desc: "Mark minus Index — indicates market sentiment" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <p className={`text-sm font-mono font-bold ${item.label === "Basis" ? posColor(basis) : "text-foreground"}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/20 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1.5">
                  <p className="font-medium text-foreground text-xs">How perpetuals work</p>
                  <p>Perpetual futures have no expiry. The funding rate mechanism keeps the mark price anchored to spot. When mark &gt; index, longs pay shorts; when mark &lt; index, shorts pay longs.</p>
                  <p>Open interest ({`$${(perp.openInterest / 1e9).toFixed(2)}B`}) reflects total capital at risk in open positions.</p>
                </div>
              </CardContent>
            </Card>

            {/* Both Perps Overview */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  All Perpetuals Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-1.5 font-normal">Symbol</th>
                      <th className="text-right py-1.5 font-normal">Mark Price</th>
                      <th className="text-right py-1.5 font-normal">Index Price</th>
                      <th className="text-right py-1.5 font-normal">Basis</th>
                      <th className="text-right py-1.5 font-normal">Funding (8h)</th>
                      <th className="text-right py-1.5 font-normal">Open Interest</th>
                      <th className="text-right py-1.5 font-normal">24h Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERPS.map((p) => {
                      const b = p.markPrice - p.indexPrice;
                      const bp = (b / p.indexPrice) * 100;
                      return (
                        <tr key={p.symbol} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="py-2.5 font-mono font-semibold text-foreground">{p.symbol}</td>
                          <td className="py-2.5 text-right font-mono">{fmtUSD(p.markPrice)}</td>
                          <td className="py-2.5 text-right font-mono text-muted-foreground">{fmtUSD(p.indexPrice)}</td>
                          <td className={`py-2.5 text-right font-mono ${posColor(b)}`}>{bp >= 0 ? "+" : ""}{bp.toFixed(4)}%</td>
                          <td className={`py-2.5 text-right font-mono ${p.fundingRate >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {fmtPct(p.fundingRate, 4)}
                          </td>
                          <td className="py-2.5 text-right text-muted-foreground">${(p.openInterest / 1e9).toFixed(2)}B</td>
                          <td className={`py-2.5 text-right font-mono ${posColor(p.change24h)}`}>{fmtPct(p.change24h, 2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Options Tab ── */}
        <TabsContent value="options" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    BTC Options Chain — 14 Day Expiry
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">Spot: {fmtUSD(BTC_MARK)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OptionsChainTable />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Implied Volatility Smile</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const W = 220;
                    const H = 120;
                    const pad = { l: 32, r: 8, t: 12, b: 24 };
                    const cw = W - pad.l - pad.r;
                    const ch = H - pad.t - pad.b;
                    const ivs = OPTIONS_CHAIN.map((o) => o.callIV);
                    const minIV = Math.min(...ivs) - 2;
                    const maxIV = Math.max(...ivs) + 2;
                    const toX = (i: number) => pad.l + (i / (OPTIONS_CHAIN.length - 1)) * cw;
                    const toY = (v: number) => pad.t + ch - ((v - minIV) / (maxIV - minIV)) * ch;
                    const pts = OPTIONS_CHAIN.map((o, i) => `${toX(i)},${toY(o.callIV)}`).join(" ");
                    const area = [
                      `${toX(0)},${pad.t + ch}`,
                      ...OPTIONS_CHAIN.map((o, i) => `${toX(i)},${toY(o.callIV)}`),
                      `${toX(OPTIONS_CHAIN.length - 1)},${pad.t + ch}`,
                    ].join(" ");
                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
                        <defs>
                          <linearGradient id="ivSmile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <polygon points={area} fill="url(#ivSmile)" />
                        <polyline points={pts} fill="none" stroke="#38bdf8" strokeWidth="2" />
                        {OPTIONS_CHAIN.map((o, i) => (
                          <g key={`iv-${i}`}>
                            <circle cx={toX(i)} cy={toY(o.callIV)} r="3" fill={o.isATM ? "#fbbf24" : "#38bdf8"} />
                            <text x={toX(i)} y={H - 4} textAnchor="middle" fontSize="7" fill="#71717a">
                              {(o.strike / 1000).toFixed(0)}k
                            </text>
                          </g>
                        ))}
                        {[55, 65, 75, 85].map((v) => (
                          <text key={`iv-y-${v}`} x={pad.l - 4} y={toY(v) + 3} textAnchor="end" fontSize="7" fill="#71717a">
                            {v}%
                          </text>
                        ))}
                      </svg>
                    );
                  })()}
                  <p className="text-xs text-muted-foreground mt-1">
                    OTM options command higher IV — the &quot;volatility smile&quot;
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Options Education</CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-muted-foreground space-y-2">
                  <div className="flex gap-2">
                    <span className="text-sky-400 font-semibold shrink-0">IV:</span>
                    <span>Implied Volatility — market&apos;s forecast of future price movement. Higher IV = more expensive options.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-semibold shrink-0">Delta:</span>
                    <span>Rate of change of option price per $1 move in underlying. Call deltas: 0–1; Put deltas: -1–0.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-semibold shrink-0">ATM:</span>
                    <span>At-The-Money — strike closest to current spot price. Highest time value, delta ≈ 0.50.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary font-semibold shrink-0">OI:</span>
                    <span>Open Interest — total outstanding contracts. High OI signals where market participants have conviction.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Liquidations Tab ── */}
        <TabsContent value="liquidations" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  BTC Liquidation Heatmap
                  <Badge className="text-[11px] bg-amber-400/10 text-amber-400 border-amber-400/20" variant="outline">
                    Estimated
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LiquidationHeatmap />
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Each row = liquidation cluster at that price level. Current mark price highlighted in gold.</p>
                  <p className="mt-1">Top bar = long liquidations (red). Bottom bar = short liquidations (green). Values in $M notional.</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Largest Clusters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {LIQ_LEVELS
                      .filter((d) => d.price !== ATM_STRIKE)
                      .sort((a, b) => (b.longLiq + b.shortLiq) - (a.longLiq + a.shortLiq))
                      .slice(0, 5)
                      .map((d) => {
                        const isBelow = d.price < ATM_STRIKE;
                        return (
                          <div key={d.price} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {isBelow ? (
                                <TrendingDown className="w-3 h-3 text-red-400" />
                              ) : (
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                              )}
                              <span className="font-mono text-foreground">{fmtUSD(d.price, 0)}</span>
                            </div>
                            <div className="text-right">
                              <span className={`font-mono font-medium ${isBelow ? "text-red-400" : "text-emerald-400"}`}>
                                ${((d.longLiq + d.shortLiq)).toFixed(0)}M
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    How to Use This
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-muted-foreground space-y-2">
                  <p>Liquidation heatmaps show where forced selling (long liq) or forced buying (short liq) may cascade if price reaches those levels.</p>
                  <p>Large liquidation clusters can act as:</p>
                  <ul className="space-y-1 ml-2">
                    <li>• <span className="text-red-400">Long liq below</span> = support below (price bounce)</li>
                    <li>• <span className="text-emerald-400">Short liq above</span> = resistance above (short squeeze fuel)</li>
                  </ul>
                  <p className="text-amber-400 mt-2">Note: data is estimated. Actual liquidations depend on leverage and position sizes.</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Margin Toggle & Leverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarginToggle />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── DeFi Tab ── */}
        <TabsContent value="defi" className="data-[state=inactive]:hidden space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                CEX vs DEX Perpetuals Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DefiComparisonTable />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">DeFi Perps Market Share</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const items = [
                    { name: "Binance + Bybit (CEX)", share: 68, color: "#38bdf8" },
                    { name: "Hyperliquid", share: 14, color: "#a78bfa" },
                    { name: "GMX v2", share: 9, color: "#34d399" },
                    { name: "dYdX v4", share: 5, color: "#fbbf24" },
                    { name: "Other DEX", share: 4, color: "#f87171" },
                  ];
                  let cumulative = 0;
                  const W = 200;
                  const CX = 100;
                  const CY = 85;
                  const R = 70;
                  const IR = 35;
                  const segments = items.map((item) => {
                    const start = cumulative;
                    cumulative += item.share;
                    const startAngle = (start / 100) * 2 * Math.PI - Math.PI / 2;
                    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
                    const x1 = CX + R * Math.cos(startAngle);
                    const y1 = CY + R * Math.sin(startAngle);
                    const x2 = CX + R * Math.cos(endAngle);
                    const y2 = CY + R * Math.sin(endAngle);
                    const ix1 = CX + IR * Math.cos(startAngle);
                    const iy1 = CY + IR * Math.sin(startAngle);
                    const ix2 = CX + IR * Math.cos(endAngle);
                    const iy2 = CY + IR * Math.sin(endAngle);
                    const largeArc = item.share > 50 ? 1 : 0;
                    return { ...item, path: `M ${ix1} ${iy1} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${IR} ${IR} 0 ${largeArc} 0 ${ix1} ${iy1} Z` };
                  });
                  return (
                    <div className="flex items-center gap-4">
                      <svg viewBox={`0 0 ${W} 170`} className="w-40 shrink-0">
                        {segments.map((seg) => (
                          <path key={seg.name} d={seg.path} fill={seg.color} fillOpacity="0.85" stroke="#09090b" strokeWidth="1.5" />
                        ))}
                        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="9" fill="#71717a">Total</text>
                        <text x={CX} y={CY + 9} textAnchor="middle" fontSize="11" fill="#e4e4e7" fontWeight="600">Perps</text>
                        <text x={CX} y={CY + 22} textAnchor="middle" fontSize="8" fill="#71717a">Market</text>
                        {items.map((item, i) => (
                          <text key={`lbl-${i}`} x={CX} y={145 + i * 0} textAnchor="middle" fontSize="7" fill="#52525b" />
                        ))}
                      </svg>
                      <div className="space-y-1.5 flex-1">
                        {items.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-mono font-medium text-foreground">{item.share}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  DeFi Perps: How They Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[11px] text-muted-foreground">
                <div className="bg-primary/5 border border-border rounded p-2.5">
                  <p className="text-primary font-medium text-xs mb-1">Virtual AMM (vAMM) — dYdX style</p>
                  <p>Uses an off-chain order book on a sovereign blockchain (Cosmos). Funds stay in smart contracts, matching happens in a decentralized validator set. Near-CEX speed.</p>
                </div>
                <div className="bg-emerald-400/5 border border-emerald-400/20 rounded p-2.5">
                  <p className="text-emerald-400 font-medium text-xs mb-1">LP-backed Pool — GMX style</p>
                  <p>Traders take the other side against a multi-asset liquidity pool (GLP/GM). LPs earn fees but take on counterparty risk. Oracle-based pricing with no slippage.</p>
                </div>
                <div className="bg-amber-400/5 border border-amber-400/20 rounded p-2.5">
                  <p className="text-amber-400 font-medium text-xs mb-1">HyperCore — Hyperliquid style</p>
                  <p>Custom L1 with on-chain order book. Fully on-chain matching engine at ~100k TPS. HLP vault acts as backstop market maker and insurance fund.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
