"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShieldAlert,
  RefreshCw,
  Info,
  DollarSign,
  Percent,
  Activity,
  Target,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 672008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 672008;
}

// ── Math helpers ─────────────────────────────────────────────────────────────
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2315419 * Math.abs(x));
  const d = 0.3989422820 * Math.exp(-0.5 * x * x);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return x >= 0 ? 1 - p : p;
}

function blackScholes(S: number, K: number, T: number, r: number, sigma: number): {
  call: number; delta: number; gamma: number; vega: number; rho: number;
} {
  if (T <= 0) {
    const call = Math.max(S - K, 0);
    return { call, delta: S > K ? 1 : 0, gamma: 0, vega: 0, rho: 0 };
  }
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  const nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
  const call = S * Nd1 - K * Math.exp(-r * T) * Nd2;
  const delta = Nd1;
  const gamma = nd1 / (S * sigma * Math.sqrt(T));
  const vega = S * nd1 * Math.sqrt(T) / 100;
  const rho = K * T * Math.exp(-r * T) * Nd2 / 100;
  return { call, delta, gamma, vega, rho };
}

function bondPV(face: number, coupon: number, ytm: number, years: number): number {
  let pv = 0;
  for (let t = 1; t <= years * 2; t++) {
    pv += (coupon * face / 2) / Math.pow(1 + ytm / 2, t);
  }
  pv += face / Math.pow(1 + ytm / 2, years * 2);
  return pv;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConvertibleParams {
  faceValue: number;
  couponRate: number;
  conversionRatio: number;
  stockPrice: number;
  creditSpread: number;
  riskFreeRate: number;
  volatility: number;
  yearsToMaturity: number;
}

interface MarketIssuer {
  name: string;
  ticker: string;
  sector: string;
  outstanding: number; // $B
  coupon: number;
  premium: number;
  rating: string;
}

interface SectorData {
  name: string;
  pct: number;
  color: string;
}

// ── Derived computations ──────────────────────────────────────────────────────
function computeConvertible(p: ConvertibleParams) {
  const conversionPrice = p.faceValue / p.conversionRatio;
  const conversionPremium = (conversionPrice / p.stockPrice - 1) * 100;
  const parityValue = p.stockPrice * p.conversionRatio;
  const ytm = p.riskFreeRate / 100 + p.creditSpread / 100;
  const bondFloor = bondPV(p.faceValue, p.couponRate / 100, ytm, p.yearsToMaturity);
  const bs = blackScholes(
    p.stockPrice,
    conversionPrice,
    p.yearsToMaturity,
    p.riskFreeRate / 100,
    p.volatility / 100,
  );
  const optionValue = bs.call * p.conversionRatio;
  const theoreticalValue = bondFloor + optionValue;
  const premium = ((theoreticalValue / p.faceValue) - 1) * 100;
  return {
    conversionPrice,
    conversionPremium,
    parityValue,
    bondFloor,
    optionValue,
    theoreticalValue,
    premium,
    delta: bs.delta,
    gamma: bs.gamma,
    vega: bs.vega,
    rho: bs.rho,
    ytm: ytm * 100,
  };
}

// ── Static data ──────────────────────────────────────────────────────────────
resetSeed();

const TOP_ISSUERS: MarketIssuer[] = [
  { name: "MicroStrategy", ticker: "MSTR", sector: "Technology", outstanding: 8.2, coupon: 0.625, premium: 35.4, rating: "CCC+" },
  { name: "Ford Motor", ticker: "F", sector: "Auto", outstanding: 6.1, coupon: 0.0, premium: 28.7, rating: "BB+" },
  { name: "Snap Inc.", ticker: "SNAP", sector: "Technology", outstanding: 3.75, coupon: 0.125, premium: 42.1, rating: "B-" },
  { name: "Carnival Corp", ticker: "CCL", sector: "Consumer", outstanding: 3.0, coupon: 5.75, premium: 15.2, rating: "B+" },
  { name: "Palo Alto Networks", ticker: "PANW", sector: "Technology", outstanding: 2.0, coupon: 0.375, premium: 52.8, rating: "BB+" },
  { name: "Datadog", ticker: "DDOG", sector: "Technology", outstanding: 1.5, coupon: 0.125, premium: 38.6, rating: "BB" },
  { name: "Block Inc.", ticker: "SQ", sector: "Fintech", outstanding: 2.3, coupon: 0.25, premium: 31.4, rating: "BB-" },
  { name: "Airbnb", ticker: "ABNB", sector: "Consumer", outstanding: 2.0, coupon: 0.0, premium: 47.3, rating: "BB" },
];

const SECTOR_DATA: SectorData[] = [
  { name: "Technology", pct: 38, color: "#6366f1" },
  { name: "Healthcare", pct: 18, color: "#22c55e" },
  { name: "Consumer Disc.", pct: 14, color: "#f59e0b" },
  { name: "Financials", pct: 11, color: "#3b82f6" },
  { name: "Energy", pct: 8, color: "#ec4899" },
  { name: "Industrials", pct: 7, color: "#14b8a6" },
  { name: "Other", pct: 4, color: "#94a3b8" },
];

const ISSUANCE_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const ISSUANCE_AMOUNTS = [55, 62, 103, 157, 48, 72, 89, 94]; // $B

// ── Sub-components ───────────────────────────────────────────────────────────

function StatChip({
  label, value, sub, color = "indigo",
}: { label: string; value: string; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    blue: "bg-primary/10 border-border text-primary",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    teal: "bg-teal-500/10 border-teal-500/20 text-emerald-400",
  };
  return (
    <div className={cn("rounded-lg border px-4 py-3", colorMap[color] ?? colorMap.indigo)}>
      <div className="text-xs opacity-70 mb-1">{label}</div>
      <div className="text-lg font-bold font-mono">{value}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Tab 1: Convertible Mechanics ─────────────────────────────────────────────

function ConvertibleMechanicsTab() {
  const [params, setParams] = useState<ConvertibleParams>({
    faceValue: 1000,
    couponRate: 0.5,
    conversionRatio: 20,
    stockPrice: 45,
    creditSpread: 3.5,
    riskFreeRate: 4.5,
    volatility: 35,
    yearsToMaturity: 5,
  });

  const metrics = useMemo(() => computeConvertible(params), [params]);

  // Payoff profile: stock prices from 0 to 150
  const payoffData = useMemo(() => {
    const points: { stock: number; convertible: number; bondFloor: number; parity: number }[] = [];
    for (let sp = 0; sp <= 150; sp += 2) {
      const p2: ConvertibleParams = { ...params, stockPrice: Math.max(sp, 1) };
      const m = computeConvertible(p2);
      points.push({
        stock: sp,
        convertible: Math.min(m.theoreticalValue, 2200),
        bondFloor: Math.min(m.bondFloor, 2200),
        parity: sp * params.conversionRatio,
      });
    }
    return points;
  }, [params]);

  const svgW = 480, svgH = 220, padL = 50, padR = 20, padT = 16, padB = 36;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const maxY = 2200;
  const maxX = 150;

  const toX = (v: number) => padL + (v / maxX) * plotW;
  const toY = (v: number) => padT + plotH - (v / maxY) * plotH;

  const lineOf = (key: "convertible" | "bondFloor" | "parity") =>
    payoffData
      .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.stock).toFixed(1)},${toY(d[key]).toFixed(1)}`)
      .join(" ");

  function setParam<K extends keyof ConvertibleParams>(k: K, v: ConvertibleParams[K]) {
    setParams((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <div className="space-y-6">
      {/* Top stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatChip label="Bond Floor" value={`$${metrics.bondFloor.toFixed(0)}`} sub="Investment value" color="blue" />
        <StatChip label="Parity" value={`$${metrics.parityValue.toFixed(0)}`} sub={`${params.conversionRatio} × $${params.stockPrice}`} color="green" />
        <StatChip label="Conv. Price" value={`$${metrics.conversionPrice.toFixed(2)}`} sub="Face / Ratio" color="indigo" />
        <StatChip label="Conv. Premium" value={`${metrics.conversionPremium.toFixed(1)}%`} sub="Over parity" color="amber" />
        <StatChip label="Option Value" value={`$${metrics.optionValue.toFixed(0)}`} sub="Embedded call" color="teal" />
        <StatChip label="Fair Value" value={`$${metrics.theoreticalValue.toFixed(0)}`} sub={`${metrics.premium > 0 ? "+" : ""}${metrics.premium.toFixed(1)}% to par`} color="indigo" />
      </div>

      {/* Payoff SVG */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Convertible Bond Payoff Profile</div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* Grid */}
          {[0, 500, 1000, 1500, 2000].map((y) => (
            <line key={y} x1={padL} y1={toY(y)} x2={svgW - padR} y2={toY(y)}
              stroke="#27272a" strokeWidth={1} />
          ))}
          {[0, 30, 60, 90, 120, 150].map((x) => (
            <line key={x} x1={toX(x)} y1={padT} x2={toX(x)} y2={padT + plotH}
              stroke="#27272a" strokeWidth={1} />
          ))}
          {/* Y axis labels */}
          {[0, 500, 1000, 1500, 2000].map((y) => (
            <text key={y} x={padL - 6} y={toY(y) + 4} textAnchor="end"
              fontSize={9} fill="#71717a">${y === 0 ? "0" : `${y / 1000}k`}</text>
          ))}
          {/* X axis labels */}
          {[0, 30, 60, 90, 120, 150].map((x) => (
            <text key={x} x={toX(x)} y={padT + plotH + 14} textAnchor="middle"
              fontSize={9} fill="#71717a">${x}</text>
          ))}
          <text x={padL + plotW / 2} y={svgH} textAnchor="middle" fontSize={9} fill="#52525b">Stock Price ($)</text>
          {/* Parity line */}
          <path d={lineOf("parity")} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" />
          {/* Bond floor */}
          <path d={lineOf("bondFloor")} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" />
          {/* Convertible */}
          <path d={lineOf("convertible")} fill="none" stroke="#a78bfa" strokeWidth={2.5} />
          {/* Current stock marker */}
          <line x1={toX(params.stockPrice)} y1={padT} x2={toX(params.stockPrice)} y2={padT + plotH}
            stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" />
          <text x={toX(params.stockPrice) + 3} y={padT + 12} fontSize={9} fill="#f59e0b">S={params.stockPrice}</text>
          {/* Legend */}
          {[
            { color: "#a78bfa", label: "Convertible Value" },
            { color: "#3b82f6", label: "Bond Floor" },
            { color: "#22c55e", label: "Parity" },
          ].map((l, i) => (
            <g key={l.label} transform={`translate(${padL + i * 130}, ${padT})`}>
              <line x1={0} y1={8} x2={16} y2={8} stroke={l.color} strokeWidth={2} />
              <text x={20} y={12} fontSize={9} fill="#a1a1aa">{l.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Stock Price ($)", key: "stockPrice" as keyof ConvertibleParams, min: 10, max: 150, step: 1 },
          { label: "Volatility (%)", key: "volatility" as keyof ConvertibleParams, min: 10, max: 80, step: 1 },
          { label: "Credit Spread (%)", key: "creditSpread" as keyof ConvertibleParams, min: 0.5, max: 10, step: 0.5 },
          { label: "Years to Maturity", key: "yearsToMaturity" as keyof ConvertibleParams, min: 1, max: 10, step: 1 },
        ].map(({ label, key, min, max, step }) => (
          <div key={key} className="bg-card border border-border rounded-lg p-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{label}</span>
              <span className="font-mono text-foreground">{params[key]}</span>
            </div>
            <input
              type="range" min={min} max={max} step={step}
              value={params[key] as number}
              onChange={(e) => setParam(key, parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        ))}
      </div>

      {/* Explainer cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: "Conversion Ratio & Price",
            icon: <Percent size={16} className="text-indigo-400" />,
            body: `The conversion ratio (${params.conversionRatio}x) defines how many shares you receive per bond. The conversion price ($${metrics.conversionPrice.toFixed(2)}) = Face Value / Ratio. Holders convert when the stock exceeds the conversion price — currently ${params.stockPrice >= metrics.conversionPrice ? "IN the money" : "OUT of the money"} by ${Math.abs(((params.stockPrice / metrics.conversionPrice) - 1) * 100).toFixed(1)}%.`,
          },
          {
            title: "Bond Floor & Investment Value",
            icon: <DollarSign size={16} className="text-primary" />,
            body: `The bond floor ($${metrics.bondFloor.toFixed(0)}) is the straight-debt value — what the bond is worth ignoring conversion. It uses a yield of ${metrics.ytm.toFixed(2)}% (risk-free ${params.riskFreeRate}% + spread ${params.creditSpread}%). This provides downside protection: the convertible should rarely trade below this floor.`,
          },
          {
            title: "Parity Value",
            icon: <Activity size={16} className="text-green-400" />,
            body: `Parity ($${metrics.parityValue.toFixed(0)}) = Stock Price × Conversion Ratio. When the convertible trades above parity, the excess is the conversion premium — currently ${metrics.conversionPremium.toFixed(1)}%. Deep in-the-money converts trade near parity; deep out-of-the-money bonds trade near the floor.`,
          },
          {
            title: "Embedded Option Value",
            icon: <Target size={16} className="text-emerald-400" />,
            body: `The embedded call option is worth $${metrics.optionValue.toFixed(0)} using Black-Scholes with ${params.volatility}% vol and ${params.yearsToMaturity}yr tenor. Total fair value = Bond Floor + Option = $${metrics.theoreticalValue.toFixed(0)}, implying ${metrics.premium > 0 ? "a premium of" : "a discount of"} ${Math.abs(metrics.premium).toFixed(1)}% to par.`,
          },
        ].map((card) => (
          <div key={card.title} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
              {card.icon}{card.title}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Greeks & Sensitivity ───────────────────────────────────────────────

function GreeksSensitivityTab() {
  const [vol, setVol] = useState(35);
  const [tenor, setTenor] = useState(5);
  const [spread, setSpread] = useState(3.5);

  const BASE_CONV_PRICE = 55;
  const RF = 4.5 / 100;
  const RATIO = 18;

  const greekSeries = useMemo(() => {
    const rows: { stock: number; delta: number; gamma: number; vega: number; rho: number; convValue: number; bondFloor: number }[] = [];
    for (let sp = 10; sp <= 130; sp += 2) {
      const ytm = RF + spread / 100;
      const bf = bondPV(1000, 0.005, ytm, tenor);
      const bs = blackScholes(sp, BASE_CONV_PRICE, tenor, RF, vol / 100);
      rows.push({
        stock: sp,
        delta: bs.delta,
        gamma: bs.gamma * 100,
        vega: bs.vega,
        rho: bs.rho,
        convValue: Math.min(bf + bs.call * RATIO, 2500),
        bondFloor: bf,
      });
    }
    return rows;
  }, [vol, tenor, spread]);

  const svgW = 500, svgH = 200, padL = 52, padR = 16, padT = 14, padB = 32;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  function makeLine(
    data: { stock: number; val: number }[],
    minY: number, maxY: number,
    color: string, sw = 2
  ): string {
    const rangeY = maxY - minY || 1;
    return data
      .map((d, i) => {
        const x = padL + ((d.stock - 10) / 120) * plotW;
        const y = padT + plotH - ((d.val - minY) / rangeY) * plotH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${Math.max(padT, Math.min(padT + plotH, y)).toFixed(1)}`;
      })
      .join(" ");
  }

  const deltaLine = makeLine(greekSeries.map((d) => ({ stock: d.stock, val: d.delta })), 0, 1, "#6366f1");
  const gammaLine = makeLine(greekSeries.map((d) => ({ stock: d.stock, val: d.gamma })), 0, Math.max(...greekSeries.map((d) => d.gamma)) + 0.01, "#22c55e");
  const vegaLine = makeLine(greekSeries.map((d) => ({ stock: d.stock, val: d.vega })), 0, Math.max(...greekSeries.map((d) => d.vega)) + 0.01, "#f59e0b");

  const currentMetrics = useMemo(() => {
    const sp = 45;
    const bs = blackScholes(sp, BASE_CONV_PRICE, tenor, RF, vol / 100);
    const ytm = RF + spread / 100;
    const bf = bondPV(1000, 0.005, ytm, tenor);
    return { bs, bf, convVal: bf + bs.call * RATIO };
  }, [vol, tenor, spread]);

  return (
    <div className="space-y-6">
      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Delta (Δ)" value={currentMetrics.bs.delta.toFixed(3)} sub="Equity sensitivity" color="indigo" />
        <StatChip label="Gamma (Γ)" value={(currentMetrics.bs.gamma * 100).toFixed(4)} sub="Delta rate of change ×100" color="green" />
        <StatChip label="Vega (ν)" value={`$${currentMetrics.bs.vega.toFixed(3)}`} sub="Per 1% vol change" color="amber" />
        <StatChip label="Rho (ρ)" value={`$${currentMetrics.bs.rho.toFixed(3)}`} sub="Per 1% rate change" color="blue" />
      </div>

      {/* Delta chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-1">Greeks vs. Stock Price</div>
        <div className="text-xs text-muted-foreground mb-3">Conv. Price = ${BASE_CONV_PRICE} | Vol = {vol}% | Tenor = {tenor}yr</div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {[0, 0.25, 0.5, 0.75, 1.0].map((y) => (
            <line key={y} x1={padL} y1={padT + plotH * (1 - y)} x2={svgW - padR} y2={padT + plotH * (1 - y)}
              stroke="#27272a" strokeWidth={1} />
          ))}
          {[10, 30, 50, 70, 90, 110, 130].map((x) => {
            const px = padL + ((x - 10) / 120) * plotW;
            return (
              <g key={x}>
                <line x1={px} y1={padT} x2={px} y2={padT + plotH} stroke="#27272a" strokeWidth={1} />
                <text x={px} y={padT + plotH + 14} textAnchor="middle" fontSize={9} fill="#71717a">${x}</text>
              </g>
            );
          })}
          {[0, 0.25, 0.5, 0.75, 1.0].map((y) => (
            <text key={y} x={padL - 4} y={padT + plotH * (1 - y) + 4} textAnchor="end" fontSize={9} fill="#71717a">{y}</text>
          ))}
          <path d={deltaLine} fill="none" stroke="#6366f1" strokeWidth={2.5} />
          <path d={gammaLine} fill="none" stroke="#22c55e" strokeWidth={2} />
          <path d={vegaLine} fill="none" stroke="#f59e0b" strokeWidth={2} />
          {/* Conv price marker */}
          <line x1={padL + ((BASE_CONV_PRICE - 10) / 120) * plotW} y1={padT}
            x2={padL + ((BASE_CONV_PRICE - 10) / 120) * plotW} y2={padT + plotH}
            stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />
          <text x={padL + ((BASE_CONV_PRICE - 10) / 120) * plotW + 3} y={padT + 12} fontSize={9} fill="#94a3b8">ATM</text>
          {/* Legend */}
          {[
            { color: "#6366f1", label: "Delta (0–1)" },
            { color: "#22c55e", label: "Gamma ×100" },
            { color: "#f59e0b", label: "Vega / 1% vol" },
          ].map((l, i) => (
            <g key={l.label} transform={`translate(${padL + i * 140}, ${padT})`}>
              <line x1={0} y1={8} x2={16} y2={8} stroke={l.color} strokeWidth={2} />
              <text x={20} y={12} fontSize={9} fill="#a1a1aa">{l.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Volatility (%)", value: vol, set: setVol, min: 10, max: 80 },
          { label: "Years to Maturity", value: tenor, set: setTenor, min: 1, max: 10 },
          { label: "Credit Spread (%)", value: spread, set: setSpread, min: 0.5, max: 10, step: 0.5 },
        ].map(({ label, value, set, min, max, step = 1 }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{label}</span>
              <span className="font-mono text-foreground">{value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={(e) => set(parseFloat(e.target.value))}
              className="w-full accent-indigo-500" />
          </div>
        ))}
      </div>

      {/* Greek definitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            greek: "Delta (Δ)", color: "text-indigo-400",
            body: "Measures how much the convertible's value changes for a $1 move in the stock. Ranges from 0 (pure bond) to 1 (pure equity). At-the-money convertibles typically have delta near 0.5, making them balanced hybrid instruments.",
          },
          {
            greek: "Gamma (Γ)", color: "text-green-400",
            body: "The rate at which delta changes per $1 stock move. Highest near the conversion price — meaning the bond becomes increasingly equity-sensitive as the stock rises toward conversion. Positive gamma is favorable for long holders.",
          },
          {
            greek: "Vega (ν)", color: "text-amber-400",
            body: "Sensitivity to implied volatility. Convertible holders are long vega — they benefit from rising vol because the embedded call becomes more valuable. This makes convertibles natural volatility instruments for arb funds.",
          },
          {
            greek: "Rho (ρ)", color: "text-primary",
            body: "Sensitivity to interest rates. The bond floor falls when rates rise (negative duration), while the embedded call value decreases (negative rho). Net rho of a convertible is typically negative — they underperform in rising-rate environments.",
          },
        ].map((g) => (
          <div key={g.greek} className="bg-card border border-border rounded-xl p-4">
            <div className={cn("text-sm font-semibold mb-2", g.color)}>{g.greek}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{g.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Market Overview ─────────────────────────────────────────────────────

function MarketOverviewTab() {
  const svgW = 500, svgH = 200, padL = 50, padR = 20, padT = 14, padB = 32;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const maxAmt = Math.max(...ISSUANCE_AMOUNTS);
  const barW = plotW / ISSUANCE_AMOUNTS.length - 6;

  // Pie chart for sectors
  const cx = 100, cy = 75, r = 60;
  let startAngle = -Math.PI / 2;
  const slices = SECTOR_DATA.map((s) => {
    const angle = (s.pct / 100) * 2 * Math.PI;
    const end = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const mid = startAngle + angle / 2;
    const lx = cx + (r + 14) * Math.cos(mid);
    const ly = cy + (r + 14) * Math.sin(mid);
    const path = `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
    startAngle = end;
    return { ...s, path, lx, ly, mid };
  });

  return (
    <div className="space-y-6">
      {/* Market stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Market Size" value="$320B+" sub="Global outstanding" color="indigo" />
        <StatChip label="US Market" value="$185B" sub="Largest market" color="blue" />
        <StatChip label="Avg Coupon" value="0.8%" sub="Near-zero coupons common" color="green" />
        <StatChip label="YTD Issuance" value="$94B" sub="2025 pace" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector donut */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-sm font-semibold text-foreground mb-3">Market by Sector</div>
          <svg viewBox="0 0 300 160" className="w-full">
            {slices.map((sl) => (
              <path key={sl.name} d={sl.path} fill={sl.color} stroke="#18181b" strokeWidth={2} />
            ))}
            {/* Legend */}
            {SECTOR_DATA.map((s, i) => (
              <g key={s.name} transform={`translate(175, ${12 + i * 19})`}>
                <rect x={0} y={0} width={10} height={10} rx={2} fill={s.color} />
                <text x={14} y={9} fontSize={10} fill="#d4d4d8">{s.name}</text>
                <text x={130} y={9} fontSize={10} fill="#a1a1aa" textAnchor="end">{s.pct}%</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Issuance bar chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-sm font-semibold text-foreground mb-1">Global Issuance ($B)</div>
          <div className="text-xs text-muted-foreground mb-2">Annual convertible issuance 2018–2025</div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
            {[0, 50, 100, 150].map((y) => (
              <line key={y} x1={padL} y1={padT + plotH - (y / maxAmt) * plotH} x2={svgW - padR} y2={padT + plotH - (y / maxAmt) * plotH}
                stroke="#27272a" strokeWidth={1} />
            ))}
            {ISSUANCE_YEARS.map((yr, i) => {
              const x = padL + i * (plotW / ISSUANCE_AMOUNTS.length) + 3;
              const h = (ISSUANCE_AMOUNTS[i] / maxAmt) * plotH;
              const isHighlight = ISSUANCE_AMOUNTS[i] === maxAmt;
              return (
                <g key={yr}>
                  <rect x={x} y={padT + plotH - h} width={barW} height={h}
                    fill={isHighlight ? "#6366f1" : "#4c1d95"} rx={3} />
                  <text x={x + barW / 2} y={padT + plotH - h - 4} textAnchor="middle"
                    fontSize={9} fill={isHighlight ? "#a5b4fc" : "#71717a"}>{ISSUANCE_AMOUNTS[i]}</text>
                  <text x={x + barW / 2} y={padT + plotH + 14} textAnchor="middle"
                    fontSize={9} fill="#71717a">{yr}</text>
                </g>
              );
            })}
            {[0, 50, 100, 150].map((y) => (
              <text key={y} x={padL - 4} y={padT + plotH - (y / maxAmt) * plotH + 4}
                textAnchor="end" fontSize={9} fill="#71717a">{y}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Top issuers table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-sm font-semibold text-foreground">Top Convertible Issuers</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                {["Issuer", "Ticker", "Sector", "Outstanding ($B)", "Coupon (%)", "Conv. Premium", "Rating"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_ISSUERS.map((iss, i) => (
                <tr key={iss.ticker}
                  className={cn("border-t border-border/50 hover:bg-muted/30 transition-colors",
                    i % 2 === 0 ? "" : "bg-card/50")}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{iss.name}</td>
                  <td className="px-4 py-2.5 font-mono text-indigo-400">{iss.ticker}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{iss.sector}</td>
                  <td className="px-4 py-2.5 font-mono text-foreground">${iss.outstanding.toFixed(2)}</td>
                  <td className="px-4 py-2.5 font-mono text-green-400">{iss.coupon.toFixed(3)}%</td>
                  <td className="px-4 py-2.5 font-mono text-amber-400">{iss.premium.toFixed(1)}%</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium",
                      iss.rating.startsWith("BB") ? "bg-amber-500/10 text-amber-400" :
                      iss.rating.startsWith("B+") || iss.rating === "B" ? "bg-orange-500/10 text-orange-400" :
                      "bg-red-500/10 text-red-400"
                    )}>{iss.rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market context */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Zero-Coupon Trend",
            icon: <TrendingDown size={16} className="text-amber-400" />,
            body: "High-growth tech issuers routinely issue 0.0–0.5% coupon convertibles, relying on conversion optionality to attract investors. This keeps cash interest near zero while providing equity-upside sharing.",
          },
          {
            title: "2021 Issuance Record",
            icon: <TrendingUp size={16} className="text-green-400" />,
            body: "Record $157B issued in 2021 driven by SPAC-era companies, EV, and biotech needing capital without dilutive equity. Low rates made bond floors attractive, option value very high.",
          },
          {
            title: "Asia Pacific Growth",
            icon: <BarChart3 size={16} className="text-indigo-400" />,
            body: "Asia Pacific now accounts for ~30% of global issuance, with Japan, China, and South Korea driving growth. Mandatory convertibles and exchangeable bonds are more common in this region.",
          },
        ].map((c) => (
          <div key={c.title} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              {c.icon}{c.title}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: Investment Strategies ──────────────────────────────────────────────

interface StrategyDef {
  name: string;
  icon: React.ReactNode;
  profile: string;
  mechanics: string;
  pros: string[];
  cons: string[];
  targetReturn: string;
  horizon: string;
  color: string;
}

function InvestmentStrategiesTab() {
  const [selected, setSelected] = useState(0);

  const strategies: StrategyDef[] = [
    {
      name: "Outright Long",
      icon: <Layers size={18} />,
      profile: "Balanced: equity upside + bond floor protection",
      mechanics: "Buy convertible bonds outright. Profit if stock rises (convert to shares) or hold to maturity for par + coupons. Protected by bond floor if equity story disappoints.",
      pros: ["Equity upside with defined downside", "Bond floor provides cushion", "Positive carry (coupon)", "Long volatility"],
      cons: ["Underperforms pure equity in bull runs", "Negative rho (rate sensitive)", "Dilution risk for equity holders", "Lower yield than straight debt"],
      targetReturn: "8–15%",
      horizon: "2–5 years",
      color: "indigo",
    },
    {
      name: "Convertible Arbitrage",
      icon: <Activity size={18} />,
      profile: "Delta-neutral: long convert, short stock",
      mechanics: "Buy undervalued convert, hedge equity risk by shorting shares (delta-adjusted). Profit from mispriced optionality, volatility expansion, or spread compression. Rebalance delta as stock moves.",
      pros: ["Market-neutral", "Captures volatility premium", "Low correlation to equity market", "Consistent returns"],
      cons: ["Crowded trade — forced unwinds dangerous", "Short borrow costs", "Gamma scalping requires active management", "Liquidity risk in stress"],
      targetReturn: "6–12%",
      horizon: "6–18 months",
      color: "teal",
    },
    {
      name: "Busted Converts",
      icon: <ShieldAlert size={18} />,
      profile: "Credit-focused: deeply out-of-the-money",
      mechanics: "Buy converts trading near or below bond floor when equity is far below conversion price. These 'busted' converts trade like distressed bonds. Profit from credit recovery or M&A event.",
      pros: ["Bond-like downside protection", "Potential for credit recovery upside", "Free option if equity rebounds", "Low correlation to equity markets"],
      cons: ["Significant credit risk", "Illiquid secondary market", "Complex restructuring scenarios", "Requires credit expertise"],
      targetReturn: "12–20%",
      horizon: "1–3 years",
      color: "amber",
    },
    {
      name: "Equity Substitution",
      icon: <TrendingUp size={18} />,
      profile: "High-delta: near or in-the-money",
      mechanics: "Use deeply in-the-money converts as equity substitutes. Near-unity delta provides equity-like performance with some downside cushion. Lower notional required vs. direct equity exposure.",
      pros: ["Equity-like upside with some floor", "Lower initial outlay vs. stock", "Coupon income", "Potential tax efficiency"],
      cons: ["Call risk — issuer may force conversion", "Trades at premium to parity", "Still subject to dilution", "Liquidity often worse than equity"],
      targetReturn: "Market + alpha",
      horizon: "1–3 years",
      color: "green",
    },
  ];

  const s = strategies[selected];

  const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
    indigo: { border: "border-indigo-500/40", bg: "bg-indigo-500/10", text: "text-indigo-400" },
    teal: { border: "border-teal-500/40", bg: "bg-teal-500/10", text: "text-emerald-400" },
    amber: { border: "border-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-400" },
    green: { border: "border-green-500/40", bg: "bg-green-500/10", text: "text-green-400" },
  };

  return (
    <div className="space-y-6">
      {/* Strategy selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {strategies.map((st, i) => {
          const cc = colorClasses[st.color];
          return (
            <button
              key={st.name}
              onClick={() => setSelected(i)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                selected === i ? `${cc.border} ${cc.bg}` : "border-border bg-card hover:border-border",
              )}
            >
              <div className={cn("mb-1", selected === i ? cc.text : "text-muted-foreground")}>{st.icon}</div>
              <div className={cn("text-sm font-semibold", selected === i ? cc.text : "text-muted-foreground")}>{st.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{st.profile}</div>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className={cn("rounded-xl border p-5", colorClasses[s.color].border, colorClasses[s.color].bg)}>
            <div className={cn("flex items-center gap-2 text-base font-bold mb-2", colorClasses[s.color].text)}>
              {s.icon} {s.name}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.mechanics}</p>
            <div className="flex gap-4 mt-3">
              <div className="text-xs text-muted-foreground">Target Return: <span className={cn("font-mono font-semibold", colorClasses[s.color].text)}>{s.targetReturn}</span></div>
              <div className="text-xs text-muted-foreground">Horizon: <span className={cn("font-mono font-semibold", colorClasses[s.color].text)}>{s.horizon}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-1.5">
                <TrendingUp size={13} /> Advantages
              </div>
              <ul className="space-y-2">
                {s.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-green-400 mt-0.5 shrink-0">+</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-1.5">
                <TrendingDown size={13} /> Risks & Drawbacks
              </div>
              <ul className="space-y-2">
                {s.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-red-400 mt-0.5 shrink-0">−</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Comparative table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-semibold text-foreground">
          Strategy Comparison
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                {["Strategy", "Delta", "Vega", "Credit", "Liquidity", "Complexity", "Target Return"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Outright Long", delta: "0.3–0.7", vega: "Long", credit: "Med", liq: "Med", cx: "Low", ret: "8–15%" },
                { name: "Conv. Arbitrage", delta: "Neutral", vega: "Long", credit: "Low", liq: "Med", cx: "High", ret: "6–12%" },
                { name: "Busted Converts", delta: "0.0–0.2", vega: "Low", credit: "High", liq: "Low", cx: "High", ret: "12–20%" },
                { name: "Equity Sub.", delta: "0.7–1.0", vega: "Low", credit: "Med", liq: "Med", cx: "Low", ret: "Market+" },
              ].map((r, i) => (
                <tr key={r.name} className={cn("border-t border-border/50 hover:bg-muted/30 transition-colors",
                  i === selected ? "bg-indigo-900/10" : "")}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-2.5 font-mono text-indigo-400">{r.delta}</td>
                  <td className="px-4 py-2.5 text-emerald-400">{r.vega}</td>
                  <td className={cn("px-4 py-2.5", r.credit === "High" ? "text-red-400" : r.credit === "Low" ? "text-green-400" : "text-amber-400")}>{r.credit}</td>
                  <td className={cn("px-4 py-2.5", r.liq === "Low" ? "text-red-400" : "text-amber-400")}>{r.liq}</td>
                  <td className={cn("px-4 py-2.5", r.cx === "High" ? "text-red-400" : "text-green-400")}>{r.cx}</td>
                  <td className="px-4 py-2.5 font-mono text-green-400">{r.ret}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Risk Analysis ───────────────────────────────────────────────────────

interface RiskItem {
  name: string;
  severity: number; // 0–10
  likelihood: number; // 0–10
  color: string;
  description: string;
  mitigation: string;
}

function RiskAnalysisTab() {
  const risks: RiskItem[] = [
    {
      name: "Credit Risk",
      severity: 8, likelihood: 4,
      color: "#ef4444",
      description: "Issuer default or credit deterioration causes bond floor to collapse. High-yield issuers (CCC/B rated) face meaningful default probability over 5-year tenors.",
      mitigation: "Focus on BB/BB+ issuers, diversify across sectors, monitor credit spreads, use CDS to hedge credit exposure.",
    },
    {
      name: "Equity Risk",
      severity: 7, likelihood: 6,
      color: "#f97316",
      description: "Stock price decline reduces conversion option value. Deep OTM converts may lose most option premium without credit compensation if the stock falls 50%+.",
      mitigation: "Hold diversified portfolio, buy puts on underlying, use delta hedging for arb strategies, avoid single-name concentration.",
    },
    {
      name: "Dilution Risk",
      severity: 5, likelihood: 8,
      color: "#f59e0b",
      description: "Conversion of bonds into equity dilutes existing shareholders. Large convert overhangs can suppress stock price, creating circular pressure on conversion economics.",
      mitigation: "Analyze convert overhang as % of float, assess company cash generation to support buybacks, prefer cash-settlement converts.",
    },
    {
      name: "Call Risk",
      severity: 6, likelihood: 5,
      color: "#8b5cf6",
      description: "Issuers often include hard-call provisions allowing forced conversion when stock exceeds 130% of conversion price for 20/30 days. This caps upside for equity substitution strategies.",
      mitigation: "Review call schedules carefully, assess call probability, demand higher yield for shorter call protection, monitor trigger levels.",
    },
    {
      name: "Liquidity Risk",
      severity: 7, likelihood: 5,
      color: "#06b6d4",
      description: "Convertible market is over-the-counter with limited secondary liquidity. During stress events (2008, 2020), bid-ask spreads widen dramatically, forcing arb funds to deleverage.",
      mitigation: "Focus on larger issues ($500M+), maintain liquidity reserves, avoid leverage during periods of market stress.",
    },
    {
      name: "Interest Rate Risk",
      severity: 5, likelihood: 7,
      color: "#22c55e",
      description: "Rising rates compress bond floors, reducing downside protection. Low-coupon converts are especially rate-sensitive. Duration of bond floor component can be 3–6 years.",
      mitigation: "Short duration exposure via rate swaps, prefer shorter tenors, higher coupon bonds, or floating-rate converts when available.",
    },
  ];

  const svgW = 500, svgH = 260, padL = 50, padR = 30, padT = 20, padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Risk matrix SVG */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-sm font-semibold text-foreground mb-1">Risk Matrix</div>
        <div className="text-xs text-muted-foreground mb-3">Bubble size = severity × likelihood</div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* Grid zones */}
          <rect x={padL} y={padT} width={plotW / 2} height={plotH / 2} fill="#22c55e08" />
          <rect x={padL + plotW / 2} y={padT} width={plotW / 2} height={plotH / 2} fill="#f59e0b08" />
          <rect x={padL} y={padT + plotH / 2} width={plotW / 2} height={plotH / 2} fill="#f59e0b08" />
          <rect x={padL + plotW / 2} y={padT + plotH / 2} width={plotW / 2} height={plotH / 2} fill="#ef444408" />
          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle" fontSize={10} fill="#52525b">Likelihood →</text>
          <text x={14} y={padT + plotH / 2} textAnchor="middle" fontSize={10} fill="#52525b"
            transform={`rotate(-90, 14, ${padT + plotH / 2})`}>Severity →</text>
          {/* Grid lines */}
          {[2, 4, 6, 8, 10].map((v) => {
            const x = padL + (v / 10) * plotW;
            const y = padT + plotH - (v / 10) * plotH;
            return (
              <g key={v}>
                <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#27272a" strokeWidth={1} />
                <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#27272a" strokeWidth={1} />
                <text x={x} y={padT + plotH + 14} textAnchor="middle" fontSize={9} fill="#52525b">{v}</text>
                <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#52525b">{v}</text>
              </g>
            );
          })}
          {/* Risk bubbles */}
          {risks.map((rk) => {
            const cx = padL + (rk.likelihood / 10) * plotW;
            const cy = padT + plotH - (rk.severity / 10) * plotH;
            const radius = 6 + Math.sqrt(rk.severity * rk.likelihood) * 2.2;
            const isH = hovered === rk.name;
            return (
              <g key={rk.name}
                onMouseEnter={() => setHovered(rk.name)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}>
                <circle cx={cx} cy={cy} r={radius} fill={rk.color} opacity={isH ? 0.85 : 0.5} />
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke={rk.color} strokeWidth={isH ? 2 : 1} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight={600}
                  style={{ pointerEvents: "none" }}>
                  {rk.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
          {/* Quadrant labels */}
          <text x={padL + 6} y={padT + 14} fontSize={9} fill="#22c55e" opacity={0.5}>LOW RISK</text>
          <text x={padL + plotW - 6} y={padT + plotH - 6} fontSize={9} fill="#ef4444" opacity={0.5} textAnchor="end">HIGH RISK</text>
        </svg>
      </div>

      {/* Risk cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {risks.map((rk) => (
          <motion.div
            key={rk.name}
            whileHover={{ scale: 1.01 }}
            className={cn(
              "bg-card border rounded-xl p-4 transition-colors cursor-pointer",
              hovered === rk.name ? "border-border" : "border-border",
            )}
            onMouseEnter={() => setHovered(rk.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} style={{ color: rk.color }} />
                <span className="text-sm font-semibold text-foreground">{rk.name}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded font-mono" style={{ background: `${rk.color}20`, color: rk.color }}>
                  Sev {rk.severity}/10
                </span>
                <span className="px-2 py-0.5 rounded font-mono bg-muted text-muted-foreground">
                  Lkly {rk.likelihood}/10
                </span>
              </div>
            </div>
            {/* Severity bar */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Severity</div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${rk.severity * 10}%`, background: rk.color }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Likelihood</div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-muted-foreground transition-all" style={{ width: `${rk.likelihood * 10}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{rk.description}</p>
            <div className="border-t border-border pt-2">
              <span className="text-xs text-muted-foreground">Mitigation: </span>
              <span className="text-xs text-muted-foreground">{rk.mitigation}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Risk summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <BookOpen size={15} className="text-indigo-400" /> Risk Management Framework
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div>
            <div className="text-foreground font-medium mb-1">Position Sizing</div>
            Limit individual convertible positions to 2–5% of portfolio. Cap aggregate convert exposure at 20–30% of fixed income allocation. Higher limits for investment-grade issuers.
          </div>
          <div>
            <div className="text-foreground font-medium mb-1">Hedging Tools</div>
            Delta hedge with short stock or put options. Use CDS for credit protection on high-yield issuers. Rate swaps to manage duration exposure. Options to cap equity risk in arb books.
          </div>
          <div>
            <div className="text-foreground font-medium mb-1">Monitoring Metrics</div>
            Track daily: delta, conversion premium, bond floor vs. price, credit spread. Weekly: implied vol changes, call trigger proximity, issuer earnings risk. Monthly: portfolio convexity and vega.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ConvertiblesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers size={22} className="text-indigo-400" />
              <h1 className="text-xl font-bold text-foreground">Convertible Bonds & Hybrid Securities</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Bonds with embedded equity options — $320B+ global market bridging debt and equity
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              Bond + Option
            </span>
            <span className="px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium">
              $320B Market
            </span>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatChip label="Global Market" value="$320B+" sub="Outstanding notional" color="indigo" />
          <StatChip label="Avg Duration" value="3.8yr" sub="Weighted avg maturity" color="blue" />
          <StatChip label="Avg IV Rank" value="42%" sub="Embedded option vol" color="teal" />
          <StatChip label="YTD Return" value="+7.4%" sub="ICE Convert Index" color="green" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mechanics" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-card border border-border h-auto p-1 gap-1">
            {[
              { value: "mechanics", label: "Mechanics", icon: <Layers size={13} /> },
              { value: "greeks", label: "Greeks", icon: <Activity size={13} /> },
              { value: "market", label: "Market", icon: <BarChart3 size={13} /> },
              { value: "strategies", label: "Strategies", icon: <Target size={13} /> },
              { value: "risk", label: "Risk", icon: <ShieldAlert size={13} /> },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground rounded-md py-1.5"
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="mechanics" className="data-[state=inactive]:hidden mt-0">
              <ConvertibleMechanicsTab />
            </TabsContent>
            <TabsContent value="greeks" className="data-[state=inactive]:hidden mt-0">
              <GreeksSensitivityTab />
            </TabsContent>
            <TabsContent value="market" className="data-[state=inactive]:hidden mt-0">
              <MarketOverviewTab />
            </TabsContent>
            <TabsContent value="strategies" className="data-[state=inactive]:hidden mt-0">
              <InvestmentStrategiesTab />
            </TabsContent>
            <TabsContent value="risk" className="data-[state=inactive]:hidden mt-0">
              <RiskAnalysisTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
