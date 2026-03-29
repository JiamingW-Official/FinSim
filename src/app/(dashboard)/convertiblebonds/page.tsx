"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart2,
  Layers,
  DollarSign,
  Activity,
  RefreshCw,
  Info,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 981;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface ConvertibleBond {
  id: number;
  issuer: string;
  ticker: string;
  maturity: string;
  coupon: number;
  conversionPrice: number;
  stockPrice: number;
  bondPrice: number;
  par: number;
  creditSpread: number;
  iv: number;
}

interface MandatoryConvert {
  structure: string;
  fullName: string;
  issuer: string;
  mandatoryDate: string;
  lowerStrike: number;
  upperStrike: number;
  currentStock: number;
  coupon: number;
  description: string;
}

interface ArbScenario {
  stockMove: number;
  cbPnl: number;
  hedgePnl: number;
  netPnl: number;
}

// ── Data Generation (seeded) ───────────────────────────────────────────────────

function genConvertibles(): ConvertibleBond[] {
  const issuers = [
    { name: "Palantir Technologies", ticker: "PLTR" },
    { name: "Snap Inc.", ticker: "SNAP" },
    { name: "Lucid Group", ticker: "LCID" },
    { name: "Coinbase Global", ticker: "COIN" },
    { name: "Block Inc.", ticker: "SQ" },
    { name: "Rivian Automotive", ticker: "RIVN" },
  ];
  const maturities = ["2026-03", "2027-06", "2028-09", "2029-12", "2027-03", "2028-06"];

  return issuers.map((iss, i) => {
    const stockPrice = 8 + rand() * 140;
    const premium = 0.15 + rand() * 0.30;
    const conversionPrice = stockPrice * (1 + premium);
    const coupon = 0.25 + rand() * 2.5;
    const creditSpread = 150 + rand() * 350;
    const iv = 30 + rand() * 50;
    const bondPrice = 95 + rand() * 20;
    return {
      id: i,
      issuer: iss.name,
      ticker: iss.ticker,
      maturity: maturities[i],
      coupon,
      conversionPrice,
      stockPrice,
      bondPrice,
      par: 100,
      creditSpread,
      iv,
    };
  });
}

const CONVERTIBLES = genConvertibles();

function computeDerivedFields(cb: ConvertibleBond) {
  const parity = (cb.stockPrice / cb.conversionPrice) * cb.par;
  const conversionPremium = ((cb.bondPrice - parity) / parity) * 100;
  const years = 2.5 + rand() * 2;
  const riskFreeRate = 0.045;
  const sigma = cb.iv / 100;
  const d1 =
    (Math.log(cb.stockPrice / cb.conversionPrice) +
      (riskFreeRate + 0.5 * sigma * sigma) * years) /
    (sigma * Math.sqrt(years));
  const normalCDF = (x: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const p =
      1 -
      ((((1.330274429 * t - 1.821255978) * t + 1.781477937) * t - 0.356563782) * t +
        0.319381530) *
        t *
        Math.exp(-0.5 * x * x) *
        0.39894228;
    return x >= 0 ? p : 1 - p;
  };
  const delta = normalCDF(d1);
  const d2 = d1 - sigma * Math.sqrt(years);
  const gamma =
    Math.exp(-0.5 * d1 * d1) /
    (0.39894228 * cb.stockPrice * sigma * Math.sqrt(years));
  const vega = (cb.stockPrice * Math.sqrt(years) * Math.exp(-0.5 * d1 * d1)) / (0.39894228 * 100);
  const theta =
    -(cb.stockPrice * sigma * Math.exp(-0.5 * d1 * d1)) /
    (2 * 0.39894228 * Math.sqrt(years) * 365);
  // Investment value: straight bond floor using simple discount
  const cf = cb.coupon;
  const discountRate = riskFreeRate + cb.creditSpread / 10000;
  let investmentValue = 0;
  for (let t = 1; t <= Math.round(years); t++) {
    investmentValue += cf / Math.pow(1 + discountRate, t);
  }
  investmentValue += cb.par / Math.pow(1 + discountRate, Math.round(years));

  let classification: "busted" | "balanced" | "equity-like";
  if (cb.stockPrice / cb.conversionPrice < 0.75) classification = "busted";
  else if (cb.stockPrice / cb.conversionPrice > 1.10) classification = "equity-like";
  else classification = "balanced";

  return { parity, conversionPremium, delta, gamma, vega, theta, investmentValue, classification, d2 };
}

const DERIVED = CONVERTIBLES.map(computeDerivedFields);

function genArbScenarios(cb: ConvertibleBond, delta: number): ArbScenario[] {
  const moves = [-20, -10, -5, 0, 5, 10, 20];
  return moves.map((move) => {
    const newStock = cb.stockPrice * (1 + move / 100);
    const newParity = (newStock / cb.conversionPrice) * cb.par;
    const cbPnl = newParity > cb.bondPrice ? (newParity - cb.bondPrice) * 0.8 : -(cb.bondPrice - Math.max(newParity, 88)) * 0.3;
    const hedgePnl = -delta * (newStock - cb.stockPrice) * (cb.par / cb.conversionPrice);
    const netPnl = cbPnl + hedgePnl;
    return { stockMove: move, cbPnl: +cbPnl.toFixed(2), hedgePnl: +hedgePnl.toFixed(2), netPnl: +netPnl.toFixed(2) };
  });
}

const MANDATORY_CONVERTS: MandatoryConvert[] = [
  {
    structure: "PRCS",
    fullName: "Preferred Redeemable Increased Dividend Equity Security",
    issuer: "FinTech Capital Inc.",
    mandatoryDate: "2027-06",
    lowerStrike: 42.0,
    upperStrike: 50.4,
    currentStock: 45.5,
    coupon: 6.5,
    description: "Converts to shares at maturity. Upside capped above upper strike, 1:1 below lower strike.",
  },
  {
    structure: "DECS",
    fullName: "Dividend Enhanced Convertible Security",
    issuer: "MegaCorp Energy Ltd.",
    mandatoryDate: "2026-12",
    lowerStrike: 28.0,
    upperStrike: 33.6,
    currentStock: 31.2,
    coupon: 7.25,
    description: "High coupon with mandatory equity conversion. Investor bears downside below lower strike.",
  },
  {
    structure: "ACES",
    fullName: "Automatically Convertible Equity Security",
    issuer: "BioSynth Pharma Corp.",
    mandatoryDate: "2028-03",
    lowerStrike: 95.0,
    upperStrike: 114.0,
    currentStock: 101.0,
    coupon: 5.75,
    description: "Between strikes, conversion ratio adjusts. Issuer retains upside above upper strike.",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt2(n: number): string {
  return n.toFixed(2);
}

function classBadge(c: "busted" | "balanced" | "equity-like") {
  if (c === "busted") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (c === "equity-like") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  return "bg-amber-500/20 text-amber-400 border-amber-500/30";
}

function pnlColor(v: number) {
  return v >= 0 ? "text-emerald-400" : "text-rose-400";
}

// ── Parity & Premium Chart ─────────────────────────────────────────────────────

function ParityPremiumChart({ cb }: { cb: ConvertibleBond }) {
  const W = 520;
  const H = 220;
  const PAD = { l: 48, r: 20, t: 24, b: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const sMin = cb.conversionPrice * 0.3;
  const sMax = cb.conversionPrice * 2.2;
  const steps = 60;
  const stockPoints: number[] = Array.from({ length: steps + 1 }, (_, i) => sMin + (i / steps) * (sMax - sMin));

  // Investment value floor (approximate)
  const investmentFloor = 88 + rand() * 8;

  const parityPts = stockPoints.map((sp) => (sp / cb.conversionPrice) * cb.par);
  const bondPricePts = stockPoints.map((sp) => {
    const p = (sp / cb.conversionPrice) * cb.par;
    return Math.max(investmentFloor, p * 0.9 + investmentFloor * 0.1 + (p > cb.par ? (p - cb.par) * 0.85 : 0));
  });

  const allY = [...parityPts, ...bondPricePts, investmentFloor];
  const yMax = Math.max(...allY) * 1.05;
  const yMin = Math.min(0, Math.min(...allY) * 0.95);

  const toX = (sp: number) => PAD.l + ((sp - sMin) / (sMax - sMin)) * chartW;
  const toY = (v: number) => PAD.t + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const parityPath = stockPoints.map((sp, i) => `${i === 0 ? "M" : "L"}${toX(sp)},${toY(parityPts[i])}`).join(" ");
  const bondPath = stockPoints.map((sp, i) => `${i === 0 ? "M" : "L"}${toX(sp)},${toY(bondPricePts[i])}`).join(" ");
  const floorY = toY(investmentFloor);

  // Current stock vertical
  const currentX = toX(cb.stockPrice);

  const yTicks = [0, 25, 50, 75, 100, 125, 150].filter((v) => v >= yMin && v <= yMax);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
      <defs>
        <linearGradient id="cbBondGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yTicks.map((v) => (
        <line key={`gl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {yTicks.map((v) => (
        <text key={`gy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
          {v}
        </text>
      ))}
      {/* Investment floor line */}
      <line x1={PAD.l} x2={W - PAD.r} y1={floorY} y2={floorY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,4" />
      <text x={W - PAD.r - 2} y={floorY - 4} fill="#f59e0b" fontSize="8" textAnchor="end">Investment Floor</text>
      {/* Parity line */}
      <path d={parityPath} fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6,3" />
      {/* Bond price curve */}
      <path d={bondPath + ` L${toX(sMax)},${PAD.t + chartH} L${PAD.l},${PAD.t + chartH} Z`} fill="url(#cbBondGrad)" />
      <path d={bondPath} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" />
      {/* Current stock price line */}
      <line x1={currentX} x2={currentX} y1={PAD.t} y2={PAD.t + chartH} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
      <text x={currentX + 3} y={PAD.t + 12} fill="#e2e8f0" fontSize="8">Stock now</text>
      {/* Axes labels */}
      <text x={PAD.l + chartW / 2} y={H - 4} fill="#71717a" fontSize="9" textAnchor="middle">Stock Price ($)</text>
      <text x={10} y={PAD.t + chartH / 2} fill="#71717a" fontSize="9" textAnchor="middle" transform={`rotate(-90,10,${PAD.t + chartH / 2})`}>
        Value ($)
      </text>
      {/* Legend */}
      <line x1={PAD.l} x2={PAD.l + 22} y1={PAD.t - 8} y2={PAD.t - 8} stroke="#818cf8" strokeWidth="2" />
      <text x={PAD.l + 26} y={PAD.t - 4} fill="#a5b4fc" fontSize="8">CB Price</text>
      <line x1={PAD.l + 80} x2={PAD.l + 102} y1={PAD.t - 8} y2={PAD.t - 8} stroke="#34d399" strokeWidth="1.5" strokeDasharray="5,3" />
      <text x={PAD.l + 106} y={PAD.t - 4} fill="#6ee7b7" fontSize="8">Parity</text>
    </svg>
  );
}

// ── Greeks Dashboard ──────────────────────────────────────────────────────────

function GreekBar({ label, value, max, color, desc }: { label: string; value: number; max: number; color: string; desc: string }) {
  const pct = Math.min(Math.abs(value) / max, 1) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground/80">{label}</span>
        <span className={cn("text-sm font-mono font-bold", color)}>{value >= 0 ? "+" : ""}{value.toFixed(4)}</span>
      </div>
      <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color.replace("text-", "bg-"))} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground/60">{desc}</p>
    </div>
  );
}

// ── Capital Structure SVG ──────────────────────────────────────────────────────

function CapitalStructureSVG() {
  const layers = [
    { label: "Senior Secured Debt", risk: 10, ret: 5, color: "#6366f1", desc: "Lowest risk, first claim on assets" },
    { label: "Senior Unsecured Debt", risk: 20, ret: 7, color: "#8b5cf6", desc: "Second priority claim" },
    { label: "Subordinated Debt", risk: 35, ret: 10, color: "#a78bfa", desc: "Mezzanine layer" },
    { label: "Convertible Bonds", risk: 55, ret: 15, color: "#f59e0b", desc: "Hybrid: debt floor + equity upside" },
    { label: "Preferred Equity", risk: 70, ret: 20, color: "#fb923c", desc: "Dividend preference, no voting" },
    { label: "Common Equity", risk: 90, ret: 30, color: "#f87171", desc: "Highest risk, residual claimant" },
  ];
  const W = 500;
  const H = 280;
  const barH = 28;
  const gap = 10;
  const maxBarW = 320;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-72">
      <text x={10} y={16} fill="#71717a" fontSize="9" fontWeight="bold">RISK</text>
      <text x={W - 10} y={16} fill="#71717a" fontSize="9" fontWeight="bold" textAnchor="end">RETURN</text>
      {layers.map((l, i) => {
        const y = 24 + i * (barH + gap);
        const barW = (l.risk / 100) * maxBarW;
        const highlight = l.label === "Convertible Bonds";
        return (
          <g key={l.label}>
            <rect
              x={10}
              y={y}
              width={barW}
              height={barH}
              rx="4"
              fill={l.color}
              opacity={highlight ? 1 : 0.55}
              stroke={highlight ? "#fbbf24" : "none"}
              strokeWidth={highlight ? 2 : 0}
            />
            <text x={14} y={y + 11} fill="#fff" fontSize="8.5" fontWeight={highlight ? "bold" : "normal"}>
              {l.label}
            </text>
            <text x={14} y={y + 22} fill="rgba(255,255,255,0.65)" fontSize="7.5">
              {l.desc}
            </text>
            <text x={barW + 14} y={y + 16} fill={l.color} fontSize="9" fontWeight="bold">
              ~{l.ret}% target
            </text>
          </g>
        );
      })}
      <text x={10} y={H - 6} fill="#71717a" fontSize="8">Bar width = relative risk level. Convertible bonds highlighted.</text>
    </svg>
  );
}

// ── Mandatory Convert Payoff SVG ───────────────────────────────────────────────

function MandatoryPayoffSVG({ mc }: { mc: MandatoryConvert }) {
  const W = 260;
  const H = 130;
  const PAD = { l: 36, r: 12, t: 12, b: 28 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const sMin = mc.lowerStrike * 0.5;
  const sMax = mc.upperStrike * 1.5;
  const steps = 50;
  const stockPoints: number[] = Array.from({ length: steps + 1 }, (_, i) => sMin + (i / steps) * (sMax - sMin));

  const payoffAt = (sp: number) => {
    if (sp <= mc.lowerStrike) return sp; // 1:1 below lower
    if (sp >= mc.upperStrike) return mc.upperStrike; // capped above upper
    // linearly between lower and upper
    const ratio = mc.lowerStrike / sp;
    return sp * ratio + (sp - mc.lowerStrike) * (1 - ratio);
  };

  const allPay = stockPoints.map(payoffAt);
  const yMax = Math.max(...allPay) * 1.1;
  const yMin = 0;

  const toX = (sp: number) => PAD.l + ((sp - sMin) / (sMax - sMin)) * chartW;
  const toY = (v: number) => PAD.t + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const path = stockPoints.map((sp, i) => `${i === 0 ? "M" : "L"}${toX(sp)},${toY(allPay[i])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      {[0, mc.lowerStrike, mc.upperStrike].map((v) => (
        <line key={`vl-${v}`} x1={toX(v)} x2={toX(v)} y1={PAD.t} y2={PAD.t + chartH} stroke="#27272a" strokeWidth="1" strokeDasharray="3,2" />
      ))}
      <text x={toX(mc.lowerStrike)} y={PAD.t + 9} fill="#71717a" fontSize="7" textAnchor="middle">Low K</text>
      <text x={toX(mc.upperStrike)} y={PAD.t + 9} fill="#71717a" fontSize="7" textAnchor="middle">High K</text>
      <path d={path} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
      {/* current stock dot */}
      <circle cx={toX(mc.currentStock)} cy={toY(payoffAt(mc.currentStock))} r="3.5" fill="#f59e0b" />
      <text x={toX(mc.currentStock) + 5} y={toY(payoffAt(mc.currentStock)) - 3} fill="#fbbf24" fontSize="7">Now</text>
      {/* x-axis labels */}
      <text x={toX(sMin)} y={H - 4} fill="#71717a" fontSize="7">${sMin.toFixed(0)}</text>
      <text x={toX(sMax)} y={H - 4} fill="#71717a" fontSize="7" textAnchor="end">${sMax.toFixed(0)}</text>
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ConvertibleBondsPage() {
  const [selectedCbId, setSelectedCbId] = useState<number>(0);
  const [expandedArb, setExpandedArb] = useState<boolean>(false);

  const selectedCb = CONVERTIBLES[selectedCbId];
  const selectedDerived = DERIVED[selectedCbId];
  const arbScenarios = genArbScenarios(selectedCb, selectedDerived.delta);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6"
    >
      {/* HERO Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 border-l-4 border-l-primary rounded-xl bg-card p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Convertible Bonds</h1>
          <p className="text-sm text-foreground/50 mt-1">Hybrid instruments combining fixed-income safety with equity upside optionality</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Market Size", value: "$600B+" },
            { label: "Avg Delta", value: "0.42" },
            { label: "Avg Premium", value: "22%" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-foreground/5 px-3 py-2 text-center">
              <div className="text-xs text-muted-foreground/60">{s.label}</div>
              <div className="text-sm font-medium text-amber-400">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scanner">
        <TabsList className="bg-foreground/5 border border-border flex-wrap h-auto gap-1 p-1">
          {[
            { value: "scanner", icon: BarChart2, label: "CB Scanner" },
            { value: "parity", icon: TrendingUp, label: "Parity Chart" },
            { value: "greeks", icon: Activity, label: "Greeks" },
            { value: "mandatory", icon: RefreshCw, label: "Mandatory CBs" },
            { value: "arb", icon: DollarSign, label: "CB Arb" },
            { value: "structure", icon: Layers, label: "Capital Structure" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-foreground/60 text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5"
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Scanner Tab ── */}
        <TabsContent value="scanner" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-foreground/5 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground/90 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                Convertible Bond Universe
              </CardTitle>
              <p className="text-xs text-muted-foreground/60">Click a row to select for detailed analysis in other tabs</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs min-w-[720px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Issuer", "Maturity", "Coupon", "Conv. Price", "Stock Price", "Premium", "Delta", "Parity", "Inv. Value", "Type"].map((h) => (
                      <th key={h} className="text-left text-muted-foreground/60 font-medium pb-2 pr-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CONVERTIBLES.map((cb, i) => {
                    const d = DERIVED[i];
                    const isSelected = selectedCbId === i;
                    return (
                      <tr
                        key={cb.id}
                        onClick={() => setSelectedCbId(i)}
                        className={cn(
                          "border-b border-border/50 cursor-pointer transition-colors",
                          isSelected ? "bg-amber-500/10" : "hover:bg-muted/30"
                        )}
                      >
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          <div className="font-semibold text-foreground/90">{cb.issuer}</div>
                          <div className="text-muted-foreground/60">{cb.ticker}</div>
                        </td>
                        <td className="py-2.5 pr-3 text-foreground/70">{cb.maturity}</td>
                        <td className="py-2.5 pr-3 text-foreground/70">{cb.coupon.toFixed(2)}%</td>
                        <td className="py-2.5 pr-3 font-mono text-foreground/80">${fmt2(cb.conversionPrice)}</td>
                        <td className="py-2.5 pr-3 font-mono text-foreground/80">${fmt2(cb.stockPrice)}</td>
                        <td className={cn("py-2.5 pr-3 font-mono font-medium", d.conversionPremium > 0 ? "text-emerald-400" : "text-rose-400")}>
                          {d.conversionPremium.toFixed(1)}%
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-sky-400">{d.delta.toFixed(2)}</td>
                        <td className="py-2.5 pr-3 font-mono text-foreground/70">{fmt2(d.parity)}</td>
                        <td className="py-2.5 pr-3 font-mono text-foreground/70">{fmt2(d.investmentValue)}</td>
                        <td className="py-2.5">
                          <Badge className={cn("text-xs border", classBadge(d.classification))}>
                            {d.classification}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: "Busted Converts", color: "text-rose-400", border: "border-rose-500/20", desc: "Stock far below conversion price. Trades as straight debt. Delta near zero. Default risk dominates." },
              { title: "Balanced Converts", color: "text-amber-400", border: "border-amber-500/20", desc: "Stock near conversion price. Hybrid behavior. Both credit and equity factors matter. Delta 0.3–0.6." },
              { title: "Equity-Like Converts", color: "text-emerald-400", border: "border-emerald-500/20", desc: "Stock well above conversion price. Converts behave like equity. High delta (0.7+). Premium collapses." },
            ].map((c) => (
              <Card key={c.title} className={cn("bg-foreground/5 border", c.border)}>
                <CardContent className="pt-4">
                  <div className={cn("font-semibold text-sm mb-1", c.color)}>{c.title}</div>
                  <p className="text-xs text-foreground/50">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Parity Chart Tab ── */}
        <TabsContent value="parity" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-foreground/5 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground/90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Parity, Investment Floor & CB Price Curve
              </CardTitle>
              <p className="text-xs text-muted-foreground/60">Selected: {selectedCb.issuer} ({selectedCb.ticker})</p>
            </CardHeader>
            <CardContent>
              <ParityPremiumChart cb={selectedCb} />
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Conversion Price", value: `$${fmt2(selectedCb.conversionPrice)}`, color: "text-foreground/80" },
                  { label: "Stock Price", value: `$${fmt2(selectedCb.stockPrice)}`, color: "text-sky-400" },
                  { label: "Parity", value: fmt2(selectedDerived.parity), color: "text-emerald-400" },
                  { label: "Investment Floor", value: fmt2(selectedDerived.investmentValue), color: "text-amber-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-foreground/5 border border-border p-3">
                    <div className="text-xs text-muted-foreground/60">{s.label}</div>
                    <div className={cn("text-lg font-medium font-mono", s.color)}>{s.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-foreground/5 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground/80 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                Reading the Chart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-foreground/60">
              <p><span className="text-primary font-medium">Purple curve</span> = CB market price. Bounded below by the investment floor and above tracks parity with a diminishing premium.</p>
              <p><span className="text-emerald-400 font-medium">Green dashed line</span> = Parity (intrinsic conversion value = stock / conv. price × par). CB trades above this by the conversion premium.</p>
              <p><span className="text-amber-400 font-medium">Amber dashed line</span> = Investment value floor (present value of bond cash flows). Acts as a downside cushion.</p>
              <p>The <span className="text-foreground/80 font-medium">convexity</span> of the CB price curve is what makes converts attractive: limited downside (floor) with equity-like upside participation.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Greeks Tab ── */}
        <TabsContent value="greeks" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="flex gap-2 flex-wrap text-xs text-foreground/50 items-center">
            <span>Analyzing:</span>
            {CONVERTIBLES.map((cb, i) => (
              <button
                key={cb.id}
                onClick={() => setSelectedCbId(i)}
                className={cn(
                  "px-2 py-1 rounded border transition-colors",
                  selectedCbId === i
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "border-border hover:border-border text-foreground/50"
                )}
              >
                {cb.ticker}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-foreground/5 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground/90 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Greeks — {selectedCb.ticker}
                </CardTitle>
                <p className="text-xs text-muted-foreground/60">
                  Classification: <span className={cn("font-medium", selectedDerived.classification === "equity-like" ? "text-emerald-400" : selectedDerived.classification === "busted" ? "text-rose-400" : "text-amber-400")}>{selectedDerived.classification}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <GreekBar
                  label="Delta (δ)"
                  value={selectedDerived.delta}
                  max={1}
                  color="text-sky-400"
                  desc="Stock-like sensitivity. CB delta < equity option delta due to credit component dampening."
                />
                <GreekBar
                  label="Gamma (γ)"
                  value={selectedDerived.gamma}
                  max={0.08}
                  color="text-primary"
                  desc="Rate of delta change per $1 stock move. Peaks near ATM conversion price."
                />
                <GreekBar
                  label="Vega (ν)"
                  value={selectedDerived.vega}
                  max={0.5}
                  color="text-emerald-400"
                  desc="Sensitivity to implied vol. Long vega — benefits from volatility expansion."
                />
                <GreekBar
                  label="Theta (θ)"
                  value={selectedDerived.theta}
                  max={0.05}
                  color="text-rose-400"
                  desc="Time decay. Negative theta is partially offset by coupon accrual. Net theta often mild."
                />
              </CardContent>
            </Card>

            <Card className="bg-foreground/5 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground/80 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  CB Greeks vs Equity Option Greeks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-foreground/60">
                <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                  <div className="text-sky-400 font-medium mb-1">Delta — Dampened</div>
                  <p>Equity call delta is purely a function of moneyness and time. CB delta is lower because the credit spread introduces a floor that reduces equity optionality when out-of-the-money.</p>
                </div>
                <div className="rounded-lg bg-primary/5 border border-border p-3">
                  <div className="text-primary font-medium mb-1">Gamma — Credit-Modified</div>
                  <p>CB gamma peaks near the conversion price but is reduced by credit risk — as the stock falls the issuer distress risk increases, compressing optionality non-linearly.</p>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3">
                  <div className="text-emerald-400 font-medium mb-1">Vega — Long Vol</div>
                  <p>CBs are naturally long volatility. Higher implied vol increases option value embedded in the convert, benefiting holders. This is the core of CB arbitrage strategies.</p>
                </div>
                <div className="rounded-lg bg-rose-500/5 border border-rose-500/15 p-3">
                  <div className="text-rose-400 font-medium mb-1">Theta — Coupon Offset</div>
                  <p>Unlike pure options, CB theta is partially offset by coupon income. Net time decay is usually mild for balanced converts with reasonable coupons.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Greek summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Delta", value: selectedDerived.delta.toFixed(3), color: "text-sky-400", sub: "Equity sensitivity" },
              { label: "Gamma", value: selectedDerived.gamma.toFixed(5), color: "text-primary", sub: "Delta velocity" },
              { label: "Vega", value: selectedDerived.vega.toFixed(4), color: "text-emerald-400", sub: "Vol sensitivity" },
              { label: "Theta", value: selectedDerived.theta.toFixed(5), color: "text-rose-400", sub: "Time decay/day" },
            ].map((g) => (
              <div key={g.label} className="rounded-xl border border-border bg-foreground/5 p-4 text-center">
                <div className="text-xs text-muted-foreground/60 mb-1">{g.label}</div>
                <div className={cn("text-xl font-medium font-mono", g.color)}>{g.value}</div>
                <div className="text-xs text-foreground/30 mt-1">{g.sub}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Mandatory Converts Tab ── */}
        <TabsContent value="mandatory" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-foreground/5 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground/90 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Mandatory Convertible Structures
              </CardTitle>
              <p className="text-xs text-muted-foreground/60">Converts that must convert to equity at maturity. High coupon compensation for capped upside.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MANDATORY_CONVERTS.map((mc) => (
                  <Card key={mc.structure} className="bg-foreground/[0.03] border-amber-500/20">
                    <CardHeader className="pb-1">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">{mc.structure}</Badge>
                        <span className="text-xs text-muted-foreground/60">{mc.mandatoryDate}</span>
                      </div>
                      <CardTitle className="text-sm text-foreground/90 mt-2">{mc.fullName}</CardTitle>
                      <p className="text-xs text-foreground/50">{mc.issuer}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <MandatoryPayoffSVG mc={mc} />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground/60">Coupon</div>
                          <div className="text-emerald-400 font-medium">{mc.coupon}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/60">Stock Now</div>
                          <div className="text-foreground/80 font-mono">${mc.currentStock}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/60">Lower Strike</div>
                          <div className="text-foreground/80 font-mono">${mc.lowerStrike}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/60">Upper Strike</div>
                          <div className="text-foreground/80 font-mono">${mc.upperStrike}</div>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/50 border-t border-border pt-2">{mc.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-foreground/5 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground/80">Structure Comparison</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Feature", "PRCS", "DECS", "ACES"].map((h) => (
                      <th key={h} className="text-left text-muted-foreground/60 font-medium pb-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Coupon vs Straight", prcs: "Higher", decs: "Highest", aces: "Moderate" },
                    { feature: "Upside participation", prcs: "None above upper K", decs: "None above upper K", aces: "None above upper K" },
                    { feature: "Downside protection", prcs: "Full downside", decs: "Full downside", aces: "Partial cushion" },
                    { feature: "Conversion ratio", prcs: "Fixed two strikes", decs: "Fixed two strikes", aces: "Variable between K" },
                    { feature: "Typical issuer", prcs: "Banks, utilities", decs: "Energy, industrials", aces: "Growth companies" },
                    { feature: "Investor appeal", prcs: "Income-focused", decs: "High income", aces: "Growth + income" },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-foreground/60">{row.feature}</td>
                      <td className="py-2 pr-4 text-amber-400/80">{row.prcs}</td>
                      <td className="py-2 pr-4 text-amber-400/80">{row.decs}</td>
                      <td className="py-2 pr-4 text-amber-400/80">{row.aces}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CB Arb Tab ── */}
        <TabsContent value="arb" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="flex gap-2 flex-wrap text-xs text-foreground/50 items-center mb-1">
            <span>Select CB:</span>
            {CONVERTIBLES.map((cb, i) => (
              <button
                key={cb.id}
                onClick={() => setSelectedCbId(i)}
                className={cn(
                  "px-2 py-1 rounded border transition-colors",
                  selectedCbId === i
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "border-border hover:border-border text-foreground/50"
                )}
              >
                {cb.ticker}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-foreground/5 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground/90 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Arb Strategy — {selectedCb.ticker}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-2">
                  <div className="font-medium text-amber-400 mb-1">Leg Structure</div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Long CB notional</span>
                    <span className="text-foreground/90 font-mono">$1,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">CB delta hedge ratio</span>
                    <span className="text-sky-400 font-mono">{selectedDerived.delta.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Short equity notional</span>
                    <span className="text-rose-400 font-mono">
                      ${(selectedDerived.delta * (1_000_000 / selectedCb.par) * selectedCb.stockPrice * (selectedCb.par / selectedCb.conversionPrice)).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-foreground/60">Net delta exposure</span>
                    <span className="text-emerald-400 font-mono">~0 (delta neutral)</span>
                  </div>
                </div>
                <p className="text-foreground/50">
                  CB arbitrage extracts the volatility premium embedded in convertibles. By going long the CB and delta-hedging the equity component, the arbitrageur isolates gamma and vega, profiting from:
                </p>
                <ul className="space-y-1 text-foreground/50 list-disc list-inside">
                  <li>Gamma scalping on large stock moves</li>
                  <li>Coupon income exceeding financing cost</li>
                  <li>IV expansion on the embedded option</li>
                  <li>Credit spread compression</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-foreground/5 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground/80 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  P&amp;L Under Stock Move Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["Stock Δ", "CB P&L", "Hedge P&L", "Net P&L"].map((h) => (
                        <th key={h} className="text-left text-muted-foreground/60 font-medium pb-2 pr-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {arbScenarios.map((sc) => (
                      <tr key={sc.stockMove} className="border-b border-border/50">
                        <td className={cn("py-2 pr-3 font-mono font-medium", sc.stockMove > 0 ? "text-emerald-400" : sc.stockMove < 0 ? "text-rose-400" : "text-foreground/50")}>
                          {sc.stockMove > 0 ? "+" : ""}{sc.stockMove}%
                        </td>
                        <td className={cn("py-2 pr-3 font-mono", pnlColor(sc.cbPnl))}>
                          {sc.cbPnl >= 0 ? "+" : ""}{sc.cbPnl.toFixed(2)}
                        </td>
                        <td className={cn("py-2 pr-3 font-mono", pnlColor(sc.hedgePnl))}>
                          {sc.hedgePnl >= 0 ? "+" : ""}{sc.hedgePnl.toFixed(2)}
                        </td>
                        <td className={cn("py-2 font-mono font-medium", pnlColor(sc.netPnl))}>
                          {sc.netPnl >= 0 ? "+" : ""}{sc.netPnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Expandable risks section */}
          <Card className="bg-foreground/5 border-border">
            <CardHeader className="pb-1">
              <button
                onClick={() => setExpandedArb(!expandedArb)}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-sm text-foreground/80 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  CB Arbitrage Risks &amp; Considerations
                </CardTitle>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground/60 transition-transform", expandedArb && "rotate-180")} />
              </button>
            </CardHeader>
            {expandedArb && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                {[
                  { title: "Credit Risk", color: "text-rose-400", desc: "If issuer credit deteriorates, investment floor drops and the hedge becomes insufficient. Credit spread widening hurts even delta-neutral books." },
                  { title: "Liquidity Risk", color: "text-amber-400", desc: "CBs trade OTC with wide bid-ask spreads. Forced liquidations during market stress can be costly. Position sizing must account for liquidity." },
                  { title: "Gamma Profile Risk", color: "text-primary", desc: "Gamma is highest near conversion price. If stock moves away, dynamic rebalancing costs eat into profits. Must rehedge frequently." },
                  { title: "Borrow Cost", color: "text-sky-400", desc: "Shorting the equity hedge requires shares to borrow. High short interest names (like many tech converts) have expensive borrow rates, eroding yield." },
                  { title: "Call Risk", color: "text-orange-400", desc: "Issuers can call CBs when stock rises significantly above conversion price, forcing conversion at par. This terminates the long-vol position at inopportune times." },
                  { title: "Correlation Breakdown", color: "text-pink-400", desc: "Delta hedge assumes stable correlation between CB price and stock. In crisis scenarios this breaks down — both can fall simultaneously (correlation to 1)." },
                ].map((r) => (
                  <div key={r.title} className="rounded-lg bg-foreground/[0.03] border border-border p-3">
                    <div className={cn("font-medium mb-1", r.color)}>{r.title}</div>
                    <p className="text-foreground/50">{r.desc}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* ── Capital Structure Tab ── */}
        <TabsContent value="structure" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-foreground/5 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground/90 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Capital Structure Waterfall
                </CardTitle>
                <p className="text-xs text-muted-foreground/60">Risk/return positioning of convertible bonds vs other instruments</p>
              </CardHeader>
              <CardContent>
                <CapitalStructureSVG />
              </CardContent>
            </Card>

            <Card className="bg-foreground/5 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground/80">Why Issue Convertibles?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-foreground/60">
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <div className="text-emerald-400 font-medium mb-1">Issuer Perspective</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Lower coupon vs straight debt (investor pays for optionality)</li>
                    <li>Avoids immediate dilution — equity issued only if stock rises</li>
                    <li>Attracts different investor base (hedge funds, arb desks)</li>
                    <li>Call provisions allow issuer to force conversion</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 p-3">
                  <div className="text-sky-400 font-medium mb-1">Investor Perspective</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Downside protection via investment floor</li>
                    <li>Equity participation if stock rises significantly</li>
                    <li>Coupon income while waiting for conversion</li>
                    <li>Long volatility position with credit hedge</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                  <div className="text-amber-400 font-medium mb-1">Market Dynamics</div>
                  <p>CB issuance tends to spike when equity volatility is high (converts are expensive = issuers pay less coupon) and during growth phases when companies prefer deferred equity dilution.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-foreground/5 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground/80">Key CB Terms Glossary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                { term: "Conversion Price", def: "The pre-set stock price at which the bond converts to shares. Set at a premium to stock price at issuance (typically 20-40%)." },
                { term: "Conversion Ratio", def: "Par value divided by conversion price. Number of shares received per bond. E.g. $1000 / $50 = 20 shares." },
                { term: "Parity / Intrinsic Value", def: "Stock price × conversion ratio. The immediate equity value if converted today. CB trades above parity by the conversion premium." },
                { term: "Conversion Premium", def: "(Bond Price − Parity) / Parity. Represents the extra cost paid for the downside protection. Shrinks as stock rises." },
                { term: "Investment Value Floor", def: "Present value of CB treating it as a straight bond (no option). Acts as a price floor. Falls as issuer credit worsens." },
                { term: "Hard Call Protection", def: "Period during which issuer cannot force redemption. Typically 3 years from issuance. Protects investors from early call." },
                { term: "Soft Call / Make-Whole", def: "Conditional call triggered when stock exceeds 130-150% of conversion price for 20+ consecutive days. Forces holders to convert." },
                { term: "Put Provision", def: "Investor's right to put bond back to issuer at par on specific dates. Provides additional downside protection against credit deterioration." },
                { term: "Delta Hedge Ratio", def: "Shares to short per CB to neutralize equity exposure. Equal to CB delta × conversion ratio. Requires dynamic rebalancing." },
              ].map((g) => (
                <div key={g.term} className="rounded-lg bg-foreground/[0.03] border border-border p-3">
                  <div className="text-amber-400 font-medium mb-1">{g.term}</div>
                  <p className="text-foreground/50">{g.def}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
