"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Target,
  Globe,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  PieChart,
  GitBranch,
  Gauge,
  Sigma,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 742002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 742002;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface CrisisEvent {
  year: string;
  label: string;
  ctaReturn: number;
  equityReturn: number;
  bondReturn: number;
}

interface TrendSignal {
  market: string;
  asset: string;
  category: "equity" | "bond" | "fx" | "commodity";
  ma20: number;
  ma60: number;
  signal: "long" | "short" | "flat";
  strength: number;
  momentum: number;
}

interface MarketAllocation {
  market: string;
  category: string;
  weight: number;
  vol: number;
  riskContrib: number;
}

interface AnnualReturn {
  year: number;
  cta: number;
  equity: number;
  bond: number;
  blended: number;
}

interface EquityCurvePoint {
  t: number;
  cta: number;
  equity: number;
  bond: number;
}

interface DrawdownPoint {
  t: number;
  cta: number;
  equity: number;
}

interface CorrelationRegime {
  regime: string;
  color: string;
  ctaEquityCorr: number;
  ctaBondCorr: number;
  equityBondCorr: number;
  note: string;
}

// ── Data generators ────────────────────────────────────────────────────────────

function generateCrisisData(): CrisisEvent[] {
  return [
    { year: "2000–02", label: "Dot-com Bust",    ctaReturn: 28.4,  equityReturn: -45.1, bondReturn: 18.2 },
    { year: "2008",    label: "GFC",              ctaReturn: 18.9,  equityReturn: -37.0, bondReturn: 5.2  },
    { year: "2011",    label: "Euro Crisis",      ctaReturn: -4.3,  equityReturn: -7.8,  bondReturn: 9.4  },
    { year: "2014",    label: "Oil Crash",        ctaReturn: 19.5,  equityReturn: 11.4,  bondReturn: 7.6  },
    { year: "2018",    label: "Rate Shock",       ctaReturn: -5.8,  equityReturn: -6.2,  bondReturn: -0.5 },
    { year: "2020",    label: "COVID",            ctaReturn: 12.1,  equityReturn: -19.6, bondReturn: 9.8  },
    { year: "2022",    label: "Inflation/Rate",   ctaReturn: 25.2,  equityReturn: -18.1, bondReturn: -13.0},
  ];
}

function generateTrendSignals(): TrendSignal[] {
  resetSeed();
  const markets: Array<{ market: string; asset: string; category: TrendSignal["category"] }> = [
    { market: "S&P 500",       asset: "SPX",  category: "equity"    },
    { market: "Euro Stoxx 50", asset: "SX5E", category: "equity"    },
    { market: "US 10Y",        asset: "TY",   category: "bond"      },
    { market: "Bund 10Y",      asset: "RX",   category: "bond"      },
    { market: "EUR/USD",       asset: "EC",   category: "fx"        },
    { market: "Gold",          asset: "GC",   category: "commodity" },
  ];
  return markets.map((m) => {
    const base = 100 + rand() * 50;
    const trend = (rand() - 0.4) * 20;
    const ma20 = base + trend * 0.6 + (rand() - 0.5) * 3;
    const ma60 = base + (rand() - 0.5) * 8;
    const signal: TrendSignal["signal"] = ma20 > ma60 * 1.01 ? "long" : ma20 < ma60 * 0.99 ? "short" : "flat";
    const strength = Math.min(100, Math.abs((ma20 - ma60) / ma60) * 1500 + rand() * 20);
    const momentum = (rand() - 0.5) * 2;
    return { ...m, ma20: +ma20.toFixed(2), ma60: +ma60.toFixed(2), signal, strength: +strength.toFixed(1), momentum: +momentum.toFixed(3) };
  });
}

function generateAllocations(): MarketAllocation[] {
  resetSeed();
  const markets = [
    "US Equity", "Euro Equity", "Japan Equity", "EM Equity",
    "US 10Y", "US 30Y", "Bund 10Y", "JGB 10Y", "UK Gilt",
    "EUR/USD", "USD/JPY", "GBP/USD", "AUD/USD", "USD/CAD",
    "Gold", "Crude Oil", "Nat Gas", "Copper", "Corn", "Soybeans",
  ];
  const cats = [
    "equity","equity","equity","equity",
    "bond","bond","bond","bond","bond",
    "fx","fx","fx","fx","fx",
    "commodity","commodity","commodity","commodity","commodity","commodity",
  ];
  const rawVols = markets.map(() => 0.08 + rand() * 0.12);
  const riskBudget = 1 / markets.length;
  const weights = rawVols.map((v) => riskBudget / v);
  const totalW = weights.reduce((a, b) => a + b, 0);
  const normWeights = weights.map((w) => w / totalW);
  const riskContribs = normWeights.map((w, i) => (w * rawVols[i]) / normWeights.reduce((a, b, j) => a + b * rawVols[j], 0));
  return markets.map((market, i) => ({
    market,
    category: cats[i],
    weight: +( normWeights[i] * 100).toFixed(2),
    vol: +(rawVols[i] * 100).toFixed(1),
    riskContrib: +(riskContribs[i] * 100).toFixed(2),
  }));
}

function generateAnnualReturns(): AnnualReturn[] {
  resetSeed();
  const years = Array.from({ length: 10 }, (_, i) => 2015 + i);
  return years.map((year) => {
    const cta    = (rand() - 0.38) * 40;
    const equity = (rand() - 0.33) * 45;
    const bond   = (rand() - 0.42) * 20;
    const blended = cta * 0.2 + equity * 0.6 + bond * 0.2;
    return { year, cta: +cta.toFixed(2), equity: +equity.toFixed(2), bond: +bond.toFixed(2), blended: +blended.toFixed(2) };
  });
}

function generateEquityCurves(): { curve: EquityCurvePoint[]; drawdown: DrawdownPoint[] } {
  resetSeed();
  const n = 120; // months
  let cta = 100, equity = 100, bond = 100;
  let ctaPeak = 100, equityPeak = 100;
  const curve: EquityCurvePoint[] = [];
  const drawdown: DrawdownPoint[] = [];
  for (let t = 0; t <= n; t++) {
    curve.push({ t, cta: +cta.toFixed(2), equity: +equity.toFixed(2), bond: +bond.toFixed(2) });
    const ctaDD = (cta - ctaPeak) / ctaPeak * 100;
    const eqDD  = (equity - equityPeak) / equityPeak * 100;
    drawdown.push({ t, cta: +ctaDD.toFixed(2), equity: +eqDD.toFixed(2) });
    const ctaRet    = (rand() - 0.45) * 0.04;
    const equityRet = (rand() - 0.42) * 0.06;
    const bondRet   = (rand() - 0.45) * 0.025;
    cta    *= (1 + ctaRet);
    equity *= (1 + equityRet);
    bond   *= (1 + bondRet);
    if (cta    > ctaPeak)    ctaPeak    = cta;
    if (equity > equityPeak) equityPeak = equity;
  }
  return { curve, drawdown };
}

function generateCorrelationRegimes(): CorrelationRegime[] {
  return [
    { regime: "Bull Market",   color: "#22c55e", ctaEquityCorr: 0.15,  ctaBondCorr: -0.05, equityBondCorr: -0.10, note: "CTA lags in trending up markets; low correlation is diversifying" },
    { regime: "Bear Market",   color: "#ef4444", ctaEquityCorr: -0.42, ctaBondCorr:  0.28, equityBondCorr: -0.35, note: "Crisis alpha: CTA strongly negative corr with equities in drawdowns" },
    { regime: "High Vol",      color: "#f59e0b", ctaEquityCorr: -0.31, ctaBondCorr:  0.12, equityBondCorr: -0.22, note: "Trend signals activate strongly in high-vol dislocations" },
    { regime: "Low Vol",       color: "#3b82f6", ctaEquityCorr:  0.22, ctaBondCorr:  0.08, equityBondCorr:  0.05, note: "Choppy, trendless conditions reduce CTA edge" },
    { regime: "Inflation",     color: "#a855f7", ctaEquityCorr: -0.18, ctaBondCorr: -0.25, equityBondCorr:  0.40, note: "CTA diversifies both equity and bond risk in inflation regimes (2022)" },
    { regime: "Deflation",     color: "#06b6d4", ctaEquityCorr: -0.38, ctaBondCorr:  0.45, equityBondCorr: -0.55, note: "Flight-to-quality: bonds rally, CTA captures both commodity and equity trends" },
  ];
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function normY(val: number, min: number, max: number, height: number) {
  return height - ((val - min) / (max - min)) * height;
}

function polyline(points: Array<[number, number]>) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CrisisChart({ data }: { data: CrisisEvent[] }) {
  const W = 640, H = 260, PAD = { top: 20, right: 20, bottom: 50, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const allVals = data.flatMap((d) => [d.ctaReturn, d.equityReturn, d.bondReturn]);
  const minV = Math.min(...allVals) - 5;
  const maxV = Math.max(...allVals) + 5;
  const barW = (chartW / data.length) * 0.28;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-64">
      <defs>
        <linearGradient id="ctaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[-40, -20, 0, 20, 40].map((v) => {
        const y = PAD.top + normY(v, minV, maxV, chartH);
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke={v === 0 ? "#6b7280" : "#374151"} strokeWidth={v === 0 ? 1.5 : 0.5} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v}%</text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const slotW = chartW / data.length;
        const xCenter = PAD.left + slotW * i + slotW / 2;
        const zero = PAD.top + normY(0, minV, maxV, chartH);
        const draws = [
          { val: d.ctaReturn,    color: "#22c55e", offset: -barW - 1 },
          { val: d.equityReturn, color: "#ef4444", offset: 0 },
          { val: d.bondReturn,   color: "#3b82f6", offset: barW + 1 },
        ];
        return (
          <g key={i}>
            {draws.map(({ val, color, offset }, bi) => {
              const y = PAD.top + normY(val, minV, maxV, chartH);
              const barH = Math.abs(zero - y);
              return (
                <rect
                  key={bi}
                  x={xCenter + offset - barW / 2}
                  y={val >= 0 ? y : zero}
                  width={barW}
                  height={barH}
                  fill={color}
                  opacity={0.85}
                  rx={1}
                />
              );
            })}
            <text x={xCenter} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={8} fill="#9ca3af">{d.year}</text>
            <text x={xCenter} y={H - PAD.bottom + 24} textAnchor="middle" fontSize={7} fill="#6b7280">{d.label}</text>
          </g>
        );
      })}
      {/* Legend */}
      {[["CTA","#22c55e"], ["Equity","#ef4444"], ["Bond","#3b82f6"]].map(([lbl, col], i) => (
        <g key={i} transform={`translate(${PAD.left + i * 90}, ${H - 5})`}>
          <rect width={10} height={10} fill={col} rx={2} />
          <text x={14} y={9} fontSize={9} fill="#d1d5db">{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

function SignalChart({ signals }: { signals: TrendSignal[] }) {
  const W = 640, H = 220, PAD = { top: 20, right: 20, bottom: 40, left: 80 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const rowH = chartH / signals.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-56">
      {signals.map((sig, i) => {
        const y = PAD.top + i * rowH;
        const midY = y + rowH / 2;
        const barMaxW = chartW * 0.6;
        const barW = (sig.strength / 100) * barMaxW;
        const color = sig.signal === "long" ? "#22c55e" : sig.signal === "short" ? "#ef4444" : "#6b7280";
        const xBar = PAD.left + chartW * 0.25;
        const arrowX = PAD.left + chartW * 0.88;
        return (
          <g key={i}>
            {i > 0 && <line x1={PAD.left - 10} x2={W - PAD.right} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.5} />}
            <text x={PAD.left - 6} y={midY + 4} textAnchor="end" fontSize={9} fill="#d1d5db">{sig.market}</text>
            {/* MA bar comparison */}
            <rect x={PAD.left} y={midY - rowH * 0.28} width={chartW * 0.2} height={rowH * 0.56} fill="#1f2937" rx={2} />
            <rect x={PAD.left} y={midY - rowH * 0.28}
              width={((sig.ma20 - 80) / 90) * chartW * 0.2}
              height={rowH * 0.56} fill="#6366f1" rx={2} opacity={0.7} />
            {/* Strength bar */}
            <rect x={xBar} y={midY - rowH * 0.22} width={barMaxW} height={rowH * 0.44} fill="#111827" rx={2} />
            <rect x={xBar} y={midY - rowH * 0.22} width={barW} height={rowH * 0.44} fill={color} rx={2} opacity={0.8} />
            <text x={xBar + barW + 4} y={midY + 4} fontSize={8} fill={color}>{sig.strength.toFixed(0)}%</text>
            {/* Signal label */}
            <text x={arrowX} y={midY + 4} textAnchor="middle" fontSize={9} fill={color} fontWeight="bold">
              {sig.signal.toUpperCase()}
            </text>
          </g>
        );
      })}
      <text x={PAD.left} y={PAD.top - 4} fontSize={8} fill="#6b7280">MA20 (norm)</text>
      <text x={PAD.left + chartW * 0.25} y={PAD.top - 4} fontSize={8} fill="#6b7280">Signal Strength</text>
      <text x={PAD.left + chartW * 0.88} y={PAD.top - 4} textAnchor="middle" fontSize={8} fill="#6b7280">Signal</text>
    </svg>
  );
}

function AllocationHeatmap({ allocations }: { allocations: MarketAllocation[] }) {
  const W = 640, H = 240;
  const cats = ["equity", "bond", "fx", "commodity"] as const;
  const catColors: Record<string, string> = { equity: "#6366f1", bond: "#3b82f6", fx: "#f59e0b", commodity: "#22c55e" };
  const catLabels: Record<string, string> = { equity: "Equity", bond: "Bond", fx: "FX", commodity: "Commodity" };
  const grouped: Record<string, MarketAllocation[]> = {};
  cats.forEach((c) => { grouped[c] = allocations.filter((a) => a.category === c); });
  const colW = W / cats.length;
  const rowH = (H - 40) / 5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-60">
      {cats.map((cat, ci) => {
        const items = grouped[cat] || [];
        const color = catColors[cat];
        return (
          <g key={cat}>
            <text x={ci * colW + colW / 2} y={16} textAnchor="middle" fontSize={10} fill={color} fontWeight="bold">{catLabels[cat]}</text>
            {items.map((item, ri) => {
              const intensity = item.riskContrib / 8;
              const cellH = rowH * 0.82;
              return (
                <g key={ri}>
                  <rect
                    x={ci * colW + 4}
                    y={24 + ri * rowH}
                    width={colW - 8}
                    height={cellH}
                    fill={color}
                    opacity={Math.min(0.9, 0.15 + intensity)}
                    rx={3}
                  />
                  <text x={ci * colW + colW / 2} y={24 + ri * rowH + cellH / 2 - 3} textAnchor="middle" fontSize={8} fill="#f1f5f9">{item.market}</text>
                  <text x={ci * colW + colW / 2} y={24 + ri * rowH + cellH / 2 + 8} textAnchor="middle" fontSize={7} fill="#94a3b8">{item.weight.toFixed(1)}% | RC:{item.riskContrib.toFixed(1)}%</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function EquityCurveSVG({ curve }: { curve: EquityCurvePoint[] }) {
  const W = 640, H = 220, PAD = { top: 16, right: 16, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const vals = curve.flatMap((p) => [p.cta, p.equity, p.bond]);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const xScale = (t: number) => PAD.left + (t / (curve.length - 1)) * chartW;
  const yScale = (v: number) => PAD.top + normY(v, minV, maxV, chartH);
  const series = [
    { key: "cta" as const,    color: "#22c55e", label: "CTA" },
    { key: "equity" as const, color: "#ef4444", label: "Equity" },
    { key: "bond" as const,   color: "#3b82f6", label: "Bond" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-56">
      {[minV, (minV+maxV)/2, maxV].map((v) => {
        const y = yScale(v);
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.5} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v.toFixed(0)}</text>
          </g>
        );
      })}
      {series.map(({ key, color, label }, si) => {
        const pts: Array<[number, number]> = curve.map((p) => [xScale(p.t), yScale(p[key])]);
        return (
          <g key={key}>
            <polyline points={polyline(pts)} fill="none" stroke={color} strokeWidth={1.5} opacity={0.85} />
            <text x={W - PAD.right + 2} y={yScale(curve[curve.length - 1][key]) + 4} fontSize={8} fill={color}>{label}</text>
          </g>
        );
      })}
      {/* X-axis year labels */}
      {[0, 24, 48, 72, 96, 120].map((t) => (
        <text key={t} x={xScale(t)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={8} fill="#6b7280">{2015 + Math.floor(t / 12)}</text>
      ))}
    </svg>
  );
}

function DrawdownSVG({ drawdown }: { drawdown: DrawdownPoint[] }) {
  const W = 640, H = 160, PAD = { top: 12, right: 16, bottom: 28, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const allDD = drawdown.flatMap((p) => [p.cta, p.equity]);
  const minDD = Math.min(...allDD) - 2;
  const xScale = (t: number) => PAD.left + (t / (drawdown.length - 1)) * chartW;
  const yScale = (v: number) => PAD.top + normY(v, minDD, 0, chartH);
  const series = [
    { key: "cta" as const,    color: "#22c55e", fill: "#22c55e22" },
    { key: "equity" as const, color: "#ef4444", fill: "#ef444422" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-44">
      <line x1={PAD.left} x2={W - PAD.right} y1={yScale(0)} y2={yScale(0)} stroke="#6b7280" strokeWidth={1} />
      {[-10,-20,-30,-40].map((v) => {
        const y = yScale(v);
        if (y < PAD.top || y > H - PAD.bottom) return null;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.5} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v}%</text>
          </g>
        );
      })}
      {series.map(({ key, color, fill }) => {
        const pts: Array<[number, number]> = drawdown.map((p) => [xScale(p.t), yScale(p[key])]);
        const areaPath = `M ${xScale(0)},${yScale(0)} ` +
          pts.map(([x, y]) => `L ${x},${y}`).join(" ") +
          ` L ${xScale(drawdown.length - 1)},${yScale(0)} Z`;
        return (
          <g key={key}>
            <path d={areaPath} fill={fill} />
            <polyline points={polyline(pts)} fill="none" stroke={color} strokeWidth={1.2} />
          </g>
        );
      })}
      {[0,24,48,72,96,120].map((t) => (
        <text key={t} x={xScale(t)} y={H - PAD.bottom + 12} textAnchor="middle" fontSize={8} fill="#6b7280">{2015 + Math.floor(t / 12)}</text>
      ))}
      {[["CTA","#22c55e"],["Equity","#ef4444"]].map(([lbl, col], i) => (
        <g key={i} transform={`translate(${PAD.left + i * 80}, ${H - 2})`}>
          <rect width={10} height={6} fill={col} rx={1} />
          <text x={13} y={6} fontSize={8} fill="#d1d5db">{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

function RollingCorrSVG({ regimes }: { regimes: CorrelationRegime[] }) {
  const W = 640, H = 200, PAD = { top: 16, right: 20, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW = chartW / (regimes.length * 3 + regimes.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-52">
      {[-0.6,-0.3,0,0.3,0.6].map((v) => {
        const y = PAD.top + normY(v, -0.7, 0.7, chartH);
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={v === 0 ? "#6b7280" : "#1f2937"} strokeWidth={v === 0 ? 1 : 0.5} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {regimes.map((r, ri) => {
        const groupW = chartW / regimes.length;
        const xBase = PAD.left + ri * groupW + barW * 0.5;
        const zero = PAD.top + normY(0, -0.7, 0.7, chartH);
        const bars = [
          { val: r.ctaEquityCorr, color: r.color },
          { val: r.ctaBondCorr,   color: "#3b82f6" },
          { val: r.equityBondCorr,color: "#a855f7" },
        ];
        return (
          <g key={ri}>
            {bars.map(({ val, color }, bi) => {
              const y = PAD.top + normY(val, -0.7, 0.7, chartH);
              const h = Math.abs(zero - y);
              return (
                <rect
                  key={bi}
                  x={xBase + bi * (barW + 2)}
                  y={val >= 0 ? y : zero}
                  width={barW}
                  height={h}
                  fill={color}
                  opacity={0.8}
                  rx={1}
                />
              );
            })}
            <text x={xBase + barW * 1.5} y={H - PAD.bottom + 12} textAnchor="middle" fontSize={8} fill="#9ca3af">{r.regime.split(" ")[0]}</text>
          </g>
        );
      })}
      {[["CTA/EQ","#22c55e"],["CTA/BD","#3b82f6"],["EQ/BD","#a855f7"]].map(([lbl, col], i) => (
        <g key={i} transform={`translate(${PAD.left + i * 110}, ${H - 4})`}>
          <rect width={10} height={6} fill={col} rx={1} />
          <text x={13} y={6} fontSize={8} fill="#d1d5db">{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({ label, value, sub, color = "text-foreground" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted/60 border border-border/40">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CTASimulatorPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [volTarget, setVolTarget] = useState(11);

  const crisisData    = useMemo(() => generateCrisisData(),       []);
  const trendSignals  = useMemo(() => generateTrendSignals(),     []);
  const allocations   = useMemo(() => generateAllocations(),      []);
  const annualReturns = useMemo(() => generateAnnualReturns(),    []);
  const { curve: equityCurve, drawdown } = useMemo(() => generateEquityCurves(), []);
  const corrRegimes   = useMemo(() => generateCorrelationRegimes(), []);

  const perf = useMemo(() => {
    const ctaReturns = annualReturns.map((r) => r.cta / 100);
    const mean = ctaReturns.reduce((a, b) => a + b, 0) / ctaReturns.length;
    const std  = Math.sqrt(ctaReturns.map((r) => (r - mean) ** 2).reduce((a, b) => a + b, 0) / ctaReturns.length);
    const sharpe = mean / std;
    const maxDD = Math.min(...drawdown.map((d) => d.cta));
    const wins  = ctaReturns.filter((r) => r > 0).length;
    return {
      cagr:   (((equityCurve[equityCurve.length - 1].cta / 100) ** (1 / 10)) - 1) * 100,
      sharpe,
      maxDD,
      winRate: (wins / ctaReturns.length) * 100,
      std:     std * 100,
    };
  }, [annualReturns, drawdown, equityCurve]);

  const categoryWeights = useMemo(() => {
    const cats: Record<string, number> = {};
    allocations.forEach((a) => {
      cats[a.category] = (cats[a.category] || 0) + a.weight;
    });
    return cats;
  }, [allocations]);

  const TABS = [
    { id: "overview",     label: "CTA Overview",      icon: Globe },
    { id: "signals",      label: "Trend Signals",     icon: Activity },
    { id: "portfolio",    label: "Portfolio",          icon: PieChart },
    { id: "backtest",     label: "Backtest",           icon: BarChart3 },
    { id: "correlations", label: "Correlations",       icon: GitBranch },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* HERO Header */}
      <div className="mb-8 border-l-4 border-l-primary rounded-xl bg-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Sigma className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">CTA Strategy Simulator</h1>
            <p className="text-sm text-muted-foreground">Systematic macro & commodity trading advisor strategies</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Managed Futures</Badge>
            <Badge className="bg-primary/10 text-primary border-border text-xs">Live Signals</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto bg-card/60 border border-border/40 p-1 mb-6 rounded-xl">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: CTA Overview ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {/* KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatChip label="Global CTA AUM" value="$358B+" sub="Managed Futures Industry" color="text-emerald-400" />
                <StatChip label="Strategy Types" value="4 Core" sub="Trend / Counter-Trend / Carry / Vol" color="text-primary" />
                <StatChip label="Crisis Alpha Events" value="7 Major" sub="Since 2000" color="text-amber-400" />
                <StatChip label="Avg Vol Target" value="10–12%" sub="Annualized Portfolio Vol" color="text-primary" />
              </div>

              {/* Strategy overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    title: "Trend Following",
                    icon: TrendingUp,
                    color: "emerald",
                    pct: 65,
                    desc: "The dominant CTA approach. Uses moving-average crossovers, breakouts and time-series momentum. Holds positions for weeks to months across 50–150 liquid futures markets. Best in sustained macro trends (inflation, growth cycles).",
                    signals: ["MA crossover", "Channel breakout", "Time-series momentum", "Trend strength filter"],
                  },
                  {
                    title: "Counter-Trend",
                    icon: RefreshCw,
                    color: "amber",
                    pct: 15,
                    desc: "Fades overbought/oversold extremes via RSI, Bollinger Band reversals and mean reversion in range-bound markets. Complements trend systems; performs well in choppy, low-vol environments.",
                    signals: ["RSI extremes", "Bollinger Band reversion", "Z-score mean reversion", "Volatility breakout fade"],
                  },
                  {
                    title: "Carry",
                    icon: Layers,
                    color: "blue",
                    pct: 12,
                    desc: "Captures the carry premium across rates, FX, commodities and credit. Long high-yielding, short low-yielding assets. Risk controlled by correlation-adjusted position sizing and vol targeting.",
                    signals: ["FX carry (interest differential)", "Commodity term structure", "Yield curve roll", "Vol carry (realized vs implied)"],
                  },
                  {
                    title: "Volatility Targeting",
                    icon: Gauge,
                    color: "purple",
                    pct: 8,
                    desc: "Dynamic position sizing that scales exposure inversely with recent realized volatility. Maintains constant portfolio-level risk. Reduces drawdowns in high-vol regimes and increases allocation in low-vol environments.",
                    signals: ["Realized vol EWMA", "Inverse-vol position sizing", "Sector vol budgeting", "Correlation-adjusted ERC"],
                  },
                ].map(({ title, icon: Icon, color, pct, desc, signals }) => (
                  <Card key={title} className="bg-card/60 border-border/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${color}-400`} />
                          <span className="text-sm text-foreground">{title}</span>
                        </div>
                        <Badge className={`bg-${color}-500/10 text-${color}-400 border-${color}-500/20 text-xs`}>{pct}% of CTAs</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {signals.map((sig) => (
                          <span key={sig} className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-border/30">{sig}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Crisis alpha chart */}
              <Card className="bg-card/60 border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Crisis Alpha: CTA vs Equity vs Bond Returns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CrisisChart data={crisisData} />
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { year: "2008 GFC", cta: "+18.9%", note: "Long bonds/short equities captured the disinflationary trend" },
                      { year: "2022 Inflation", cta: "+25.2%", note: "Long commodities/short bonds tracked the inflation regime shift" },
                      { year: "2020 COVID", cta: "+12.1%", note: "Fast-moving trends in rates and commodities provided strong signals" },
                    ].map(({ year, cta, note }) => (
                      <div key={year} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{year}</span>
                          <span className="text-sm font-bold text-emerald-400">{cta}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 2: Trend Signal Builder ─────────────────────────────────────── */}
        <TabsContent value="signals" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div key="signals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Long Signals",  value: trendSignals.filter(s => s.signal === "long").length.toString(),  color: "text-emerald-400" },
                  { label: "Short Signals", value: trendSignals.filter(s => s.signal === "short").length.toString(), color: "text-red-400"     },
                  { label: "Flat",          value: trendSignals.filter(s => s.signal === "flat").length.toString(),  color: "text-muted-foreground"   },
                  { label: "Avg Strength",  value: (trendSignals.reduce((a, b) => a + b.strength, 0) / trendSignals.length).toFixed(1) + "%", color: "text-primary" },
                ].map(({ label, value, color }) => (
                  <StatChip key={label} label={label} value={value} color={color} />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-primary" />
                      Signal Strength by Market
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SignalChart signals={trendSignals} />
                  </CardContent>
                </Card>

                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <SlidersHorizontal className="w-4 h-4 text-primary" />
                      Signal Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/40">
                            {["Market", "Category", "MA20", "MA60", "Signal", "Strength"].map((h) => (
                              <th key={h} className="text-left py-1.5 px-2 text-muted-foreground font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {trendSignals.map((sig, i) => (
                            <tr
                              key={i}
                              className={`border-b border-border/60 cursor-pointer transition-colors ${selectedMarket === sig.market ? "bg-muted/30" : "hover:bg-muted/40"}`}
                              onClick={() => setSelectedMarket(selectedMarket === sig.market ? null : sig.market)}
                            >
                              <td className="py-1.5 px-2 text-foreground font-medium">{sig.market}</td>
                              <td className="py-1.5 px-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  sig.category === "equity" ? "bg-indigo-500/15 text-indigo-300" :
                                  sig.category === "bond"   ? "bg-primary/15 text-primary"    :
                                  sig.category === "fx"     ? "bg-amber-500/15 text-amber-300"  :
                                  "bg-emerald-500/15 text-emerald-300"
                                }`}>{sig.category}</span>
                              </td>
                              <td className="py-1.5 px-2 text-muted-foreground">{sig.ma20}</td>
                              <td className="py-1.5 px-2 text-muted-foreground">{sig.ma60}</td>
                              <td className="py-1.5 px-2">
                                <span className={`font-semibold ${sig.signal === "long" ? "text-emerald-400" : sig.signal === "short" ? "text-red-400" : "text-muted-foreground"}`}>
                                  {sig.signal === "long" ? "↑ LONG" : sig.signal === "short" ? "↓ SHORT" : "— FLAT"}
                                </span>
                              </td>
                              <td className="py-1.5 px-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-16">
                                    <div className={`h-full rounded-full ${sig.signal === "long" ? "bg-emerald-500" : sig.signal === "short" ? "bg-red-500" : "bg-muted-foreground"}`}
                                      style={{ width: `${sig.strength}%` }} />
                                  </div>
                                  <span className="text-muted-foreground w-8">{sig.strength}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* MA crossover explanation */}
              <Card className="mt-4 bg-card/60 border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Moving Average Crossover Logic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <p className="font-medium text-emerald-400 mb-1">Long Signal (Bullish)</p>
                      <p>MA(20) &gt; MA(60) × 1.01 — fast MA is 1%+ above slow MA. Strength proportional to percentage divergence. Enter long futures position sized by inverse vol.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                      <p className="font-medium text-red-400 mb-1">Short Signal (Bearish)</p>
                      <p>MA(20) &lt; MA(60) × 0.99 — fast MA is 1%+ below slow MA. Enter short futures position. Stop-loss at 2× ATR. Daily rebalance of position size to maintain vol target.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <p className="font-medium text-muted-foreground mb-1">Flat (No Signal)</p>
                      <p>MA(20) within ±1% band of MA(60). Market in consolidation or regime transition. Position reduced to zero or held at minimal size to avoid whipsaw losses in choppy periods.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 3: Portfolio Construction ──────────────────────────────────── */}
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div key="portfolio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatChip label="Markets" value="20" sub="Diversified futures universe" color="text-emerald-400" />
                <StatChip label="Vol Target" value={`${volTarget}%`} sub="Annualized portfolio vol" color="text-primary" />
                <StatChip label="ERC Method" value="Equal Risk" sub="Risk contribution per market" color="text-primary" />
                <StatChip label="Rebalance" value="Daily" sub="Position size adjustment" color="text-amber-400" />
              </div>

              {/* Vol target slider */}
              <Card className="mb-4 bg-card/60 border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Gauge className="w-4 h-4 text-primary" />
                    Volatility Target: {volTarget}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="range" min={6} max={20} value={volTarget}
                    onChange={(e) => setVolTarget(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>6% (Conservative)</span>
                    <span>13% (Typical CTA)</span>
                    <span>20% (Aggressive)</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: "Expected Annual Return", value: `${(volTarget * 0.6).toFixed(1)}%`, color: "text-emerald-400" },
                      { label: "Expected Max Drawdown",  value: `-${(volTarget * 1.5).toFixed(1)}%`, color: "text-red-400" },
                      { label: "Estimated Sharpe",       value: "0.55–0.75", color: "text-primary" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-2 rounded bg-muted/60 border border-border/30">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className={`text-sm font-semibold ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Heatmap */}
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <PieChart className="w-4 h-4 text-emerald-400" />
                      Allocation Heatmap (ERC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AllocationHeatmap allocations={allocations} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(categoryWeights).map(([cat, w]) => {
                        const colors: Record<string, string> = { equity: "indigo", bond: "blue", fx: "amber", commodity: "emerald" };
                        const c = colors[cat] || "slate";
                        return (
                          <span key={cat} className={`px-2 py-0.5 rounded text-xs bg-${c}-500/10 text-${c}-400 border border-${c}-500/20`}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}: {w.toFixed(1)}%
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* ERC explanation + table */}
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Layers className="w-4 h-4 text-primary" />
                      Equal Risk Contribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      Each market contributes equally to total portfolio risk (1/N ≈ 5% each for 20 markets). Position size = (vol target × budget) / (market vol × √252). Daily rebalancing maintains the risk budget as volatilities shift.
                    </p>
                    <div className="overflow-auto max-h-48">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/40">
                            {["Market", "Weight", "Ann.Vol", "Risk Contrib"].map((h) => (
                              <th key={h} className="text-left py-1 px-1.5 text-muted-foreground font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {allocations.slice(0, 12).map((a, i) => (
                            <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
                              <td className="py-1 px-1.5 text-foreground">{a.market}</td>
                              <td className="py-1 px-1.5 text-primary">{a.weight.toFixed(2)}%</td>
                              <td className="py-1 px-1.5 text-amber-300">{a.vol.toFixed(1)}%</td>
                              <td className="py-1 px-1.5 text-primary">{a.riskContrib.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 4: Backtest Results ──────────────────────────────────────────── */}
        <TabsContent value="backtest" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div key="backtest" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <StatChip label="CAGR (10Y)"   value={`${perf.cagr.toFixed(1)}%`}  color={perf.cagr >= 0 ? "text-emerald-400" : "text-red-400"} />
                <StatChip label="Sharpe Ratio" value={perf.sharpe.toFixed(2)}       color="text-primary" />
                <StatChip label="Max Drawdown"  value={`${perf.maxDD.toFixed(1)}%`}  color="text-red-400" />
                <StatChip label="Win Rate"     value={`${perf.winRate.toFixed(0)}%`} color="text-amber-400" />
                <StatChip label="Ann. Volatility" value={`${perf.std.toFixed(1)}%`} color="text-primary" />
              </div>

              {/* Equity curve */}
              <Card className="mb-4 bg-card/60 border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Simulated Equity Curve (2015–2024, $100 base)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EquityCurveSVG curve={equityCurve} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Annual returns table */}
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Annual Returns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/40">
                          {["Year", "CTA", "Equity", "60/40"].map((h) => (
                            <th key={h} className="text-left py-1.5 px-2 text-muted-foreground font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {annualReturns.map((r) => (
                          <tr key={r.year} className="border-b border-border/40 hover:bg-muted/30">
                            <td className="py-1.5 px-2 text-muted-foreground font-medium">{r.year}</td>
                            <td className={`py-1.5 px-2 font-semibold ${r.cta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {r.cta >= 0 ? "+" : ""}{r.cta.toFixed(1)}%
                            </td>
                            <td className={`py-1.5 px-2 ${r.equity >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                              {r.equity >= 0 ? "+" : ""}{r.equity.toFixed(1)}%
                            </td>
                            <td className={`py-1.5 px-2 ${r.blended >= 0 ? "text-primary" : "text-orange-300"}`}>
                              {r.blended >= 0 ? "+" : ""}{r.blended.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Drawdown chart */}
                <Card className="bg-card/60 border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      Drawdown Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DrawdownSVG drawdown={drawdown} />
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs text-muted-foreground">CTA Max DD</p>
                        <p className="text-sm font-medium text-emerald-400">{Math.min(...drawdown.map((d) => d.cta)).toFixed(1)}%</p>
                      </div>
                      <div className="p-2 rounded bg-red-500/5 border border-red-500/20">
                        <p className="text-xs text-muted-foreground">Equity Max DD</p>
                        <p className="text-sm font-medium text-red-400">{Math.min(...drawdown.map((d) => d.equity)).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 5: Correlations ─────────────────────────────────────────────── */}
        <TabsContent value="correlations" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div key="correlations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatChip label="Long-run CTA/EQ Corr" value="-0.08" sub="Near zero on average" color="text-emerald-400" />
                <StatChip label="Crisis Corr (CTA/EQ)" value="-0.42" sub="Negative in drawdowns" color="text-emerald-400" />
                <StatChip label="Diversification Benefit" value="~18%" sub="Sharpe improvement vs 60/40" color="text-primary" />
                <StatChip label="Tail Dependency" value="Low" sub="Not co-crashing with risk assets" color="text-primary" />
              </div>

              {/* Rolling correlation chart */}
              <Card className="mb-4 bg-card/60 border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <GitBranch className="w-4 h-4 text-primary" />
                    Correlation by Market Regime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RollingCorrSVG regimes={corrRegimes} />
                </CardContent>
              </Card>

              {/* Regime detail cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {corrRegimes.map((r) => (
                  <Card key={r.regime} className="bg-card/60 border-border/40">
                    <CardContent className="pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-sm font-medium text-foreground">{r.regime}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {[
                          { label: "CTA/EQ", val: r.ctaEquityCorr },
                          { label: "CTA/BD", val: r.ctaBondCorr },
                          { label: "EQ/BD",  val: r.equityBondCorr },
                        ].map(({ label, val }) => (
                          <div key={label} className="text-center">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className={`text-sm font-medium ${val < -0.1 ? "text-emerald-400" : val > 0.1 ? "text-red-400" : "text-muted-foreground"}`}>
                              {val > 0 ? "+" : ""}{val.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{r.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Portfolio benefit */}
              <Card className="bg-card/60 border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-amber-400" />
                    Portfolio Diversification Benefit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { portfolio: "60/40 Portfolio", sharpe: 0.52, cagr: 7.8, maxDD: -28.4, color: "blue" },
                      { portfolio: "55/35/10 + CTA", sharpe: 0.61, cagr: 8.1, maxDD: -22.7, color: "purple" },
                      { portfolio: "50/30/20 + CTA", sharpe: 0.67, cagr: 8.4, maxDD: -19.2, color: "emerald" },
                    ].map(({ portfolio, sharpe, cagr, maxDD, color }) => (
                      <div key={portfolio} className={`p-3 rounded-lg bg-${color}-500/5 border border-${color}-500/20`}>
                        <p className={`text-xs font-medium text-${color}-400 mb-2`}>{portfolio}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Sharpe Ratio</span>
                            <span className={`font-semibold text-${color}-300`}>{sharpe}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">CAGR</span>
                            <span className="text-foreground">{cagr}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Max Drawdown</span>
                            <span className="text-red-300">{maxDD}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Adding a 20% CTA allocation (rebalanced from equity) historically improved Sharpe by ~0.15 and reduced max drawdown by ~9pp due to crisis alpha in stress periods. The benefit is most pronounced in inflation regimes (2022) and deflationary busts (2008) where equity-bond correlation turns positive and traditional diversification fails.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Footer disclaimer */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        Simulated data for educational purposes only. Past performance of CTA strategies does not guarantee future results. Seed 742002.
      </p>
    </div>
  );
}
