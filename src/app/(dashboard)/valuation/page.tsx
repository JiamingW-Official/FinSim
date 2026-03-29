"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  Layers,
  Percent,
  Activity,
  Target,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 57;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 57;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface CompanyData {
  pe: number;
  ps: number;
  pb: number;
  evEbitda: number;
  evRev: number;
  peg: number;
  fwdPE: number;
  growth: number; // %
  price: number;
  marketCap: number; // B
  revenue: number; // B
  ebitda: number; // B
  dividendYield: number; // %
  beta: number;
  sector: string;
}

interface SOTPSegment {
  id: string;
  name: string;
  revenue: number;
  multiple: number;
  multipleType: string;
}

// ── Static data ────────────────────────────────────────────────────────────────
const COMPANIES: Record<string, CompanyData> = {
  AAPL: {
    pe: 33.2, ps: 8.9, pb: 48.6, evEbitda: 25.1, evRev: 8.5,
    peg: 2.7, fwdPE: 29.4, growth: 12.3, price: 222, marketCap: 3400,
    revenue: 391, ebitda: 130, dividendYield: 0.44, beta: 1.24, sector: "Technology",
  },
  MSFT: {
    pe: 37.1, ps: 13.2, pb: 14.8, evEbitda: 27.3, evRev: 13.9,
    peg: 2.1, fwdPE: 33.1, growth: 17.6, price: 415, marketCap: 3080,
    revenue: 230, ebitda: 113, dividendYield: 0.72, beta: 0.91, sector: "Technology",
  },
  GOOGL: {
    pe: 23.1, ps: 6.4, pb: 7.2, evEbitda: 17.8, evRev: 6.1,
    peg: 1.5, fwdPE: 20.8, growth: 15.2, price: 178, marketCap: 2200,
    revenue: 339, ebitda: 123, dividendYield: 0.0, beta: 1.05, sector: "Technology",
  },
  AMZN: {
    pe: 43.2, ps: 3.5, pb: 10.1, evEbitda: 22.4, evRev: 3.8,
    peg: 1.8, fwdPE: 34.7, growth: 24.1, price: 194, marketCap: 2050,
    revenue: 575, ebitda: 91, dividendYield: 0.0, beta: 1.31, sector: "Consumer Discretionary",
  },
  META: {
    pe: 28.4, ps: 9.8, pb: 9.4, evEbitda: 19.2, evRev: 9.4,
    peg: 1.2, fwdPE: 24.1, growth: 23.7, price: 555, marketCap: 1420,
    revenue: 145, ebitda: 74, dividendYield: 0.31, beta: 1.28, sector: "Technology",
  },
  NVDA: {
    pe: 68.4, ps: 32.1, pb: 52.3, evEbitda: 62.7, evRev: 31.5,
    peg: 1.4, fwdPE: 44.8, growth: 122.4, price: 875, marketCap: 2150,
    revenue: 66, ebitda: 34, dividendYield: 0.03, beta: 1.69, sector: "Technology",
  },
  TSLA: {
    pe: 71.5, ps: 8.1, pb: 15.7, evEbitda: 48.2, evRev: 8.4,
    peg: 3.2, fwdPE: 58.9, growth: 22.1, price: 248, marketCap: 791,
    revenue: 97, ebitda: 16, dividendYield: 0.0, beta: 2.31, sector: "Consumer Discretionary",
  },
  JPM: {
    pe: 12.1, ps: 3.8, pb: 2.1, evEbitda: 9.4, evRev: 3.5,
    peg: 1.4, fwdPE: 11.3, growth: 8.7, price: 213, marketCap: 614,
    revenue: 162, ebitda: 65, dividendYield: 2.34, beta: 1.12, sector: "Financials",
  },
  JNJ: {
    pe: 15.4, ps: 4.1, pb: 5.8, evEbitda: 12.3, evRev: 4.3,
    peg: 2.8, fwdPE: 14.6, growth: 5.4, price: 147, marketCap: 354,
    revenue: 85, ebitda: 29, dividendYield: 3.07, beta: 0.56, sector: "Healthcare",
  },
  XOM: {
    pe: 13.2, ps: 1.4, pb: 2.4, evEbitda: 7.8, evRev: 1.6,
    peg: 1.9, fwdPE: 12.8, growth: 4.2, price: 116, marketCap: 458,
    revenue: 398, ebitda: 59, dividendYield: 3.52, beta: 0.93, sector: "Energy",
  },
};

const SECTOR_MEDIANS: Record<string, Partial<CompanyData>> = {
  Technology: { pe: 28.1, ps: 6.2, pb: 9.4, evEbitda: 22.0, evRev: 6.0 },
  "Consumer Discretionary": { pe: 24.5, ps: 1.8, pb: 6.1, evEbitda: 14.2, evRev: 2.1 },
  Financials: { pe: 11.8, ps: 2.9, pb: 1.7, evEbitda: 8.4, evRev: 2.8 },
  Healthcare: { pe: 16.2, ps: 3.5, pb: 4.2, evEbitda: 11.5, evRev: 3.8 },
  Energy: { pe: 12.1, ps: 1.3, pb: 2.1, evEbitda: 6.9, evRev: 1.4 },
};

const SP500_MEDIANS = { pe: 20.4, ps: 2.8, pb: 4.1, evEbitda: 14.2, evRev: 2.7 };

// ── Utility helpers ────────────────────────────────────────────────────────────
function fmt2(n: number) {
  return n.toFixed(2);
}
function fmtK(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
  return `$${n.toFixed(0)}B`;
}
function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const prob = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x) * poly;
  return x >= 0 ? prob : 1 - prob;
}

function blackScholes(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0 || sigma <= 0) return Math.max(S - K, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

// ────────────────────────────────────────────────────────────────────────────────
// Tab 1: Relative Valuation
// ────────────────────────────────────────────────────────────────────────────────
const METRICS = [
  { key: "pe" as const, label: "P/E", desc: "Price-to-Earnings" },
  { key: "ps" as const, label: "P/S", desc: "Price-to-Sales" },
  { key: "pb" as const, label: "P/B", desc: "Price-to-Book" },
  { key: "evEbitda" as const, label: "EV/EBITDA", desc: "Enterprise Value / EBITDA" },
  { key: "evRev" as const, label: "EV/Rev", desc: "Enterprise Value / Revenue" },
];

function RelativeValuationTab() {
  const [ticker, setTicker] = useState("AAPL");
  const co = COMPANIES[ticker];
  const sector = COMPANIES[ticker].sector;
  const sectorMed = SECTOR_MEDIANS[sector] || SP500_MEDIANS;

  // Historical P/E — 10 years of synthetic data with trend + noise
  const historicalPE = useMemo(() => {
    resetSeed();
    const years = Array.from({ length: 10 }, (_, i) => 2015 + i);
    const base = [18, 19, 20, 22, 24, 21, 26, 28, 31, co.pe];
    return years.map((y, i) => ({
      year: y,
      pe: base[i] + (rand() - 0.5) * 3,
      recession: y === 2020,
    }));
  }, [co.pe]);

  const minPE = Math.min(...historicalPE.map((d) => d.pe)) - 2;
  const maxPE = Math.max(...historicalPE.map((d) => d.pe)) + 2;
  const peRange = maxPE - minPE;
  const chartW = 560;
  const chartH = 160;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 12;
  const padBottom = 28;
  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  function xPos(i: number) {
    return padLeft + (i / (historicalPE.length - 1)) * innerW;
  }
  function yPos(v: number) {
    return padTop + innerH - ((v - minPE) / peRange) * innerH;
  }

  const polyline = historicalPE.map((d, i) => `${xPos(i)},${yPos(d.pe)}`).join(" ");

  // Multiple expansion model
  const expansionScenarios = useMemo(() => {
    const baseEPS = co.price / co.pe;
    const scenarios = [
      { label: "Bear: Compression 20%", newPE: co.pe * 0.8, epsGrowth: 0.05 },
      { label: "Base: Flat Multiple", newPE: co.pe, epsGrowth: co.growth / 100 },
      { label: "Bull: Expansion 20%", newPE: co.pe * 1.2, epsGrowth: co.growth / 100 },
    ];
    return scenarios.map((s) => {
      const newEPS = baseEPS * (1 + s.epsGrowth);
      const newPrice = newEPS * s.newPE;
      const ret = (newPrice - co.price) / co.price;
      return { ...s, newPrice, ret };
    });
  }, [co]);

  const pegStatus =
    co.peg < 1.0
      ? { label: "Undervalued", color: "text-emerald-400", bg: "bg-emerald-400/10" }
      : co.peg < 2.0
      ? { label: "Fair Value", color: "text-amber-400", bg: "bg-amber-400/10" }
      : { label: "Expensive", color: "text-red-400", bg: "bg-red-400/10" };

  return (
    <div className="space-y-4">
      {/* Company selector */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(COMPANIES).map((t) => (
          <button
            key={t}
            onClick={() => setTicker(t)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-mono font-semibold transition-colors",
              ticker === t
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Multiples comparison */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          Valuation Multiples — {ticker}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                <th className="text-right py-2 font-semibold">{ticker}</th>
                <th className="text-right py-2 text-muted-foreground">Sector Med.</th>
                <th className="text-right py-2 text-muted-foreground">S&P 500</th>
                <th className="text-right py-2">vs Sector</th>
                <th className="text-right py-2">vs S&P</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const val = co[m.key] as number;
                const sec = (sectorMed[m.key] as number) ?? 0;
                const sp = SP500_MEDIANS[m.key as keyof typeof SP500_MEDIANS] ?? 0;
                const vsSec = sec > 0 ? ((val - sec) / sec) * 100 : 0;
                const vsSP = sp > 0 ? ((val - sp) / sp) * 100 : 0;
                return (
                  <tr key={m.key} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5">
                      <span className="font-medium">{m.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{m.desc}</span>
                    </td>
                    <td className="text-right py-2.5 font-mono font-medium">{fmt2(val)}x</td>
                    <td className="text-right py-2.5 font-mono text-muted-foreground">{fmt2(sec)}x</td>
                    <td className="text-right py-2.5 font-mono text-muted-foreground">{fmt2(sp)}x</td>
                    <td className="text-right py-2.5 font-mono">
                      <span className={cn("text-xs", vsSec > 0 ? "text-red-400" : "text-emerald-400")}>
                        {fmtPct(vsSec)}
                      </span>
                    </td>
                    <td className="text-right py-2.5 font-mono">
                      <span className={cn("text-xs", vsSP > 0 ? "text-red-400" : "text-emerald-400")}>
                        {fmtPct(vsSP)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical P/E chart */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">10-Year P/E Trend</h3>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
          {/* Recession shading 2020 */}
          {historicalPE.map((d, i) =>
            d.recession ? (
              <rect
                key={`rec-${i}`}
                x={xPos(i) - innerW / (historicalPE.length - 1) / 2}
                y={padTop}
                width={innerW / (historicalPE.length - 1)}
                height={innerH}
                fill="rgba(239,68,68,0.08)"
              />
            ) : null,
          )}
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padTop + innerH * (1 - t);
            const v = minPE + t * peRange;
            return (
              <g key={t}>
                <line x1={padLeft} y1={y} x2={padLeft + innerW} y2={y} stroke="rgba(255,255,255,0.06)" />
                <text x={padLeft - 4} y={y + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.4)">
                  {v.toFixed(0)}
                </text>
              </g>
            );
          })}
          {/* Line */}
          <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
          {/* Dots */}
          {historicalPE.map((d, i) => (
            <circle key={i} cx={xPos(i)} cy={yPos(d.pe)} r={3} fill="#6366f1" />
          ))}
          {/* X axis labels */}
          {historicalPE.map((d, i) => (
            <text
              key={i}
              x={xPos(i)}
              y={chartH - 4}
              textAnchor="middle"
              fontSize={9}
              fill="rgba(255,255,255,0.4)"
            >
              {d.year}
            </text>
          ))}
          {/* Recession label */}
          <text x={xPos(5)} y={padTop + 8} textAnchor="middle" fontSize={8} fill="rgba(239,68,68,0.7)">
            COVID
          </text>
          {/* Average line */}
          {(() => {
            const avg = historicalPE.reduce((a, d) => a + d.pe, 0) / historicalPE.length;
            return (
              <>
                <line
                  x1={padLeft}
                  y1={yPos(avg)}
                  x2={padLeft + innerW}
                  y2={yPos(avg)}
                  stroke="rgba(251,191,36,0.5)"
                  strokeDasharray="4 3"
                />
                <text x={padLeft + innerW + 2} y={yPos(avg) + 4} fontSize={8} fill="rgba(251,191,36,0.7)">
                  Avg
                </text>
              </>
            );
          })()}
        </svg>
      </div>

      {/* PEG ratio + Multiple expansion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">PEG Ratio Analysis</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-semibold font-mono">{fmt2(co.peg)}</span>
            <span className={cn("px-2 py-1 rounded-md text-xs text-muted-foreground font-medium", pegStatus.bg, pegStatus.color)}>
              {pegStatus.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>P/E Ratio</span>
              <span className="font-mono text-foreground">{fmt2(co.pe)}x</span>
            </div>
            <div className="flex justify-between">
              <span>Expected EPS Growth</span>
              <span className="font-mono text-foreground">{fmt2(co.growth)}%</span>
            </div>
            <div className="flex justify-between">
              <span>PEG = P/E ÷ Growth</span>
              <span className="font-mono text-foreground">{fmt2(co.peg)}x</span>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground">
            <Info className="inline w-3 h-3 mr-1" />
            PEG &lt; 1.0 historically signals undervaluation relative to growth; &gt; 2.0 suggests premium pricing.
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Multiple Expansion / Compression</h3>
          <div className="space-y-2">
            {expansionScenarios.map((sc) => (
              <div key={sc.label} className="flex items-center justify-between text-sm p-2 rounded-lg bg-secondary/20">
                <span className="text-muted-foreground text-xs">{sc.label}</span>
                <div className="flex gap-3 font-mono text-xs text-muted-foreground">
                  <span>${sc.newPrice.toFixed(0)}</span>
                  <span className={sc.ret >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {fmtPct(sc.ret * 100)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Based on 1-year EPS growth at {co.growth.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Tab 2: DCF Calculator
// ────────────────────────────────────────────────────────────────────────────────
function DCFTab() {
  const [revenue, setRevenue] = useState(391); // B
  const [revGrowth, setRevGrowth] = useState(12); // %
  const [termGrowth, setTermGrowth] = useState(3); // %
  const [wacc, setWacc] = useState(9); // %
  const [ebitdaMargin, setEbitdaMargin] = useState(33); // %
  const [taxRate] = useState(21); // %
  const [capexPct] = useState(3); // % of revenue
  const [sharesOut] = useState(15.33); // B
  const [netCash] = useState(-49); // B
  const marketPrice = 222;

  const projections = useMemo(() => {
    const rows = [];
    let rev = revenue;
    let totalPV = 0;
    const discountRate = wacc / 100;
    for (let yr = 1; yr <= 5; yr++) {
      rev = rev * (1 + revGrowth / 100);
      const ebitda = rev * (ebitdaMargin / 100);
      const nopat = ebitda * (1 - taxRate / 100);
      const capex = rev * (capexPct / 100);
      const fcf = nopat - capex;
      const pv = fcf / Math.pow(1 + discountRate, yr);
      totalPV += pv;
      rows.push({ yr, rev, ebitda, nopat, capex, fcf, pv });
    }
    const terminalFCF = rows[4].fcf * (1 + termGrowth / 100);
    const terminalValue = terminalFCF / (discountRate - termGrowth / 100);
    const pvTerminal = terminalValue / Math.pow(1 + discountRate, 5);
    const enterpriseValue = totalPV + pvTerminal;
    const equityValue = enterpriseValue + netCash;
    const intrinsic = equityValue / sharesOut;
    const mos = ((intrinsic - marketPrice) / intrinsic) * 100;
    return { rows, totalPV, pvTerminal, enterpriseValue, equityValue, intrinsic, mos };
  }, [revenue, revGrowth, termGrowth, wacc, ebitdaMargin, taxRate, capexPct, sharesOut, netCash]);

  // Sensitivity table: WACC rows × terminal growth cols
  const waccRange = [7, 8, 9, 10, 11];
  const tgRange = [1.5, 2, 2.5, 3, 3.5];
  const sensTable = useMemo(() => {
    return waccRange.map((w) =>
      tgRange.map((tg) => {
        let rev2 = revenue;
        let totalPV2 = 0;
        const dr = w / 100;
        for (let yr = 1; yr <= 5; yr++) {
          rev2 = rev2 * (1 + revGrowth / 100);
          const fcf2 = rev2 * (ebitdaMargin / 100) * (1 - taxRate / 100) - rev2 * (capexPct / 100);
          totalPV2 += fcf2 / Math.pow(1 + dr, yr);
        }
        const tv = (totalPV2 / waccRange.indexOf(w) || 1) * 1; // placeholder recompute
        // properly compute
        let r2 = revenue;
        let tPV = 0;
        for (let yr = 1; yr <= 5; yr++) {
          r2 = r2 * (1 + revGrowth / 100);
          const fcf3 = r2 * (ebitdaMargin / 100) * (1 - taxRate / 100) - r2 * (capexPct / 100);
          tPV += fcf3 / Math.pow(1 + dr, yr);
        }
        const lastFCF = r2 * (ebitdaMargin / 100) * (1 - taxRate / 100) - r2 * (capexPct / 100);
        const termV = (lastFCF * (1 + tg / 100)) / (dr - tg / 100);
        const pvTerm = termV / Math.pow(1 + dr, 5);
        const iv = (tPV + pvTerm + netCash) / sharesOut;
        void tv;
        void totalPV2;
        return iv;
      }),
    );
  }, [revenue, revGrowth, ebitdaMargin, taxRate, capexPct, netCash, sharesOut]);

  // Monte Carlo
  const monteCarlo = useMemo(() => {
    resetSeed();
    const results: number[] = [];
    for (let i = 0; i < 500; i++) {
      const rg = revGrowth + (rand() - 0.5) * 10;
      const tg = termGrowth + (rand() - 0.5) * 2;
      const w = wacc + (rand() - 0.5) * 4;
      const em = ebitdaMargin + (rand() - 0.5) * 8;
      let r = revenue;
      let pv = 0;
      const dr = w / 100;
      for (let yr = 1; yr <= 5; yr++) {
        r = r * (1 + rg / 100);
        const fcf = r * (em / 100) * (1 - taxRate / 100) - r * (capexPct / 100);
        pv += fcf / Math.pow(1 + dr, yr);
      }
      const lastRev = r;
      const lastFCF = lastRev * (em / 100) * (1 - taxRate / 100) - lastRev * (capexPct / 100);
      const termV = (lastFCF * (1 + tg / 100)) / (dr - tg / 100);
      const pvT = termV / Math.pow(1 + dr, 5);
      const iv = (pv + pvT + netCash) / sharesOut;
      if (iv > 0 && iv < 1500) results.push(iv);
    }
    results.sort((a, b) => a - b);
    return results;
  }, [revenue, revGrowth, termGrowth, wacc, ebitdaMargin, taxRate, capexPct, netCash, sharesOut]);

  // Histogram
  const histMin = monteCarlo[0] || 0;
  const histMax = monteCarlo[monteCarlo.length - 1] || 500;
  const bins = 30;
  const binSize = (histMax - histMin) / bins;
  const counts = Array(bins).fill(0) as number[];
  monteCarlo.forEach((v) => {
    const idx = Math.min(Math.floor((v - histMin) / binSize), bins - 1);
    counts[idx]++;
  });
  const maxCount = Math.max(...counts);
  const histW = 540;
  const histH = 120;
  const p10 = monteCarlo[Math.floor(monteCarlo.length * 0.1)];
  const p50 = monteCarlo[Math.floor(monteCarlo.length * 0.5)];
  const p90 = monteCarlo[Math.floor(monteCarlo.length * 0.9)];

  const mosColor =
    projections.mos > 20
      ? "text-emerald-400"
      : projections.mos > 0
      ? "text-amber-400"
      : "text-red-400";
  const mosLabel =
    projections.mos > 20 ? "Strong Buy" : projections.mos > 0 ? "Fair Value" : "Overvalued";

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">DCF Model Inputs</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Revenue ($B)", value: revenue, setter: setRevenue, min: 10, max: 1000, step: 10 },
            { label: "Revenue Growth (%)", value: revGrowth, setter: setRevGrowth, min: 0, max: 50, step: 0.5 },
            { label: "EBITDA Margin (%)", value: ebitdaMargin, setter: setEbitdaMargin, min: 5, max: 60, step: 1 },
            { label: "WACC (%)", value: wacc, setter: setWacc, min: 5, max: 20, step: 0.5 },
            { label: "Terminal Growth (%)", value: termGrowth, setter: setTermGrowth, min: 0.5, max: 5, step: 0.5 },
          ].map((inp) => (
            <div key={inp.label}>
              <label className="text-xs text-muted-foreground mb-1 block">{inp.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={inp.min}
                  max={inp.max}
                  step={inp.step}
                  value={inp.value}
                  onChange={(e) => inp.setter(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-primary"
                />
                <span className="font-mono text-sm w-14 text-right">{inp.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FCF Projection */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">FCF Projection ($B)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground font-mono">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2">Year</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">EBITDA</th>
                <th className="text-right py-2">NOPAT</th>
                <th className="text-right py-2">CapEx</th>
                <th className="text-right py-2">FCF</th>
                <th className="text-right py-2">PV of FCF</th>
              </tr>
            </thead>
            <tbody>
              {projections.rows.map((r) => (
                <tr key={r.yr} className="border-b border-border/20 hover:bg-secondary/20">
                  <td className="py-2">Year {r.yr}</td>
                  <td className="text-right py-2">{r.rev.toFixed(1)}</td>
                  <td className="text-right py-2">{r.ebitda.toFixed(1)}</td>
                  <td className="text-right py-2">{r.nopat.toFixed(1)}</td>
                  <td className="text-right py-2 text-red-400">({r.capex.toFixed(1)})</td>
                  <td className="text-right py-2 text-emerald-400">{r.fcf.toFixed(1)}</td>
                  <td className="text-right py-2">{r.pv.toFixed(1)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-border/60 text-muted-foreground">
                <td className="py-2 text-xs text-muted-foreground">Terminal Value</td>
                <td colSpan={5} />
                <td className="text-right py-2">{projections.pvTerminal.toFixed(1)}</td>
              </tr>
              <tr className="font-medium border-t border-primary/40">
                <td className="py-2">Enterprise Value</td>
                <td colSpan={5} />
                <td className="text-right py-2 text-primary">{projections.enterpriseValue.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Intrinsic Value + MoS gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Intrinsic Value vs Market Price</h3>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <div className="text-xs text-muted-foreground">Intrinsic Value</div>
              <div className="text-lg font-medium font-mono">${projections.intrinsic.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Market Price</div>
              <div className="text-lg font-medium font-mono text-muted-foreground">${marketPrice}</div>
            </div>
          </div>
          {/* Gauge bar */}
          <div className="relative h-8 rounded-full bg-secondary/40 overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-colors duration-300"
              style={{
                width: `${Math.min(Math.max((marketPrice / (projections.intrinsic * 1.5)) * 100, 5), 95)}%`,
                background: projections.mos > 20 ? "#10b981" : projections.mos > 0 ? "#f59e0b" : "#ef4444",
              }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-foreground/80"
              style={{
                left: `${Math.min((projections.intrinsic / (projections.intrinsic * 1.5)) * 100, 95)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span className={cn("font-medium", mosColor)}>{mosLabel} ({projections.mos.toFixed(1)}% MoS)</span>
            <span>${(projections.intrinsic * 1.5).toFixed(0)}</span>
          </div>
        </div>

        {/* Sensitivity table */}
        <div className="rounded-md border border-border bg-card p-5 overflow-x-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Sensitivity: WACC × Terminal Growth</h3>
          <table className="text-xs text-muted-foreground font-mono w-full">
            <thead>
              <tr>
                <th className="text-left py-1 text-muted-foreground">WACC \ TG</th>
                {tgRange.map((tg) => (
                  <th key={tg} className="text-right py-1 text-muted-foreground">{tg}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {waccRange.map((w, wi) => (
                <tr key={w} className="border-b border-border/20">
                  <td className="py-1.5 text-muted-foreground">{w}%</td>
                  {tgRange.map((tg, ti) => {
                    const val = sensTable[wi][ti];
                    const isBase = w === wacc && tg === termGrowth;
                    const color = val > marketPrice * 1.2 ? "text-emerald-400" : val > marketPrice ? "text-emerald-300/70" : "text-red-400";
                    return (
                      <td
                        key={tg}
                        className={cn("text-right py-1.5 px-1", color, isBase && "ring-1 ring-primary/50 rounded bg-muted/10")}
                      >
                        ${val.toFixed(0)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monte Carlo histogram */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Monte Carlo DCF — 500 Simulations
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Randomizing revenue growth ±5%, terminal growth ±1%, WACC ±2%, EBITDA margin ±4%
        </p>
        <svg width="100%" viewBox={`0 0 ${histW} ${histH + 30}`}>
          {counts.map((c, i) => {
            const barW = (histW / bins) * 0.85;
            const barH = (c / maxCount) * histH;
            const x = (i / bins) * histW;
            const midVal = histMin + (i + 0.5) * binSize;
            const fill = midVal < marketPrice ? "#ef4444" : "#10b981";
            return (
              <rect
                key={i}
                x={x}
                y={histH - barH}
                width={barW}
                height={barH}
                fill={fill}
                opacity={0.75}
              />
            );
          })}
          {/* Market price line */}
          {(() => {
            const mpX = ((marketPrice - histMin) / (histMax - histMin)) * histW;
            return (
              <g>
                <line x1={mpX} y1={0} x2={mpX} y2={histH} stroke="white" strokeWidth={1.5} strokeDasharray="4 3" />
                <text x={mpX + 3} y={10} fontSize={9} fill="white">Market ${marketPrice}</text>
              </g>
            );
          })()}
          {/* Percentile labels */}
          <text x={((p10 - histMin) / (histMax - histMin)) * histW} y={histH + 14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.5)">
            P10: ${p10?.toFixed(0)}
          </text>
          <text x={((p50 - histMin) / (histMax - histMin)) * histW} y={histH + 14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.7)">
            P50: ${p50?.toFixed(0)}
          </text>
          <text x={((p90 - histMin) / (histMax - histMin)) * histW} y={histH + 14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.5)">
            P90: ${p90?.toFixed(0)}
          </text>
          <text x={0} y={histH + 26} fontSize={8} fill="rgba(255,255,255,0.3)">${histMin.toFixed(0)}</text>
          <text x={histW} y={histH + 26} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.3)">${histMax.toFixed(0)}</text>
        </svg>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Tab 3: Sum of Parts
// ────────────────────────────────────────────────────────────────────────────────
const ALPHABET_SEGMENTS: SOTPSegment[] = [
  { id: "search", name: "Google Search", revenue: 175, multiple: 18, multipleType: "EV/EBITDA" },
  { id: "youtube", name: "YouTube Ads", revenue: 31, multiple: 12, multipleType: "EV/Revenue" },
  { id: "cloud", name: "Google Cloud", revenue: 33, multiple: 15, multipleType: "EV/Revenue" },
  { id: "other", name: "Other Bets", revenue: 1.7, multiple: 5, multipleType: "EV/Revenue" },
  { id: "cash", name: "Net Cash", revenue: 108, multiple: 1, multipleType: "$ direct" },
];

const MULTIPLE_OPTIONS = [
  "EV/EBITDA", "EV/Revenue", "P/E", "P/S", "$ direct",
];

function SOTPTab() {
  const [segments, setSegments] = useState<SOTPSegment[]>(ALPHABET_SEGMENTS);
  const [discount, setDiscount] = useState(25);
  const marketCap = 2200; // Alphabet market cap in B
  const shares = 12.3; // B

  const totalSOTP = segments.reduce((acc, seg) => acc + seg.revenue * seg.multiple, 0);
  const discountedSOTP = totalSOTP * (1 - discount / 100);
  const pricePerShare = discountedSOTP / shares;
  const implied = marketCap / shares;
  const premium = ((implied / pricePerShare) - 1) * 100;

  const addSegment = useCallback(() => {
    setSegments((prev) => [
      ...prev,
      {
        id: `seg-${Date.now()}`,
        name: "New Segment",
        revenue: 10,
        multiple: 8,
        multipleType: "EV/Revenue",
      },
    ]);
  }, []);

  const removeSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSegment = useCallback(
    (id: string, field: keyof SOTPSegment, value: string | number) => {
      setSegments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  // Waterfall SVG
  const chartW = 560;
  const chartH = 160;
  const barW = Math.min(64, (chartW - 40) / (segments.length + 2));
  const maxVal = totalSOTP * 1.1;

  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#84cc16", "#ec4899"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Sum of the Parts — Alphabet (GOOGL)</h3>
          <button
            onClick={addSegment}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Segment
          </button>
        </div>

        {/* Segment table */}
        <div className="space-y-2 mb-4">
          {segments.map((seg, idx) => (
            <div key={seg.id} className="grid grid-cols-12 gap-2 items-center text-sm">
              <div
                className="w-3 h-3 rounded-sm col-span-0"
                style={{ background: colors[idx % colors.length] }}
              />
              <input
                className="col-span-3 bg-secondary/30 rounded px-2 py-1 text-xs text-muted-foreground"
                value={seg.name}
                onChange={(e) => updateSegment(seg.id, "name", e.target.value)}
              />
              <div className="col-span-2 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">$</span>
                <input
                  type="number"
                  className="w-full bg-secondary/30 rounded px-2 py-1 text-xs text-muted-foreground font-mono"
                  value={seg.revenue}
                  onChange={(e) => updateSegment(seg.id, "revenue", Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">B</span>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  className="w-full bg-secondary/30 rounded px-2 py-1 text-xs text-muted-foreground font-mono"
                  value={seg.multiple}
                  onChange={(e) => updateSegment(seg.id, "multiple", Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">x</span>
              </div>
              <select
                className="col-span-3 bg-secondary/30 rounded px-2 py-1 text-xs text-muted-foreground"
                value={seg.multipleType}
                onChange={(e) => updateSegment(seg.id, "multipleType", e.target.value)}
              >
                {MULTIPLE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <div className="col-span-1 font-mono text-xs text-muted-foreground text-right">
                ${(seg.revenue * seg.multiple).toFixed(0)}B
              </div>
              <button
                onClick={() => removeSegment(seg.id)}
                className="col-span-1 text-muted-foreground hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Conglomerate discount slider */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/20">
          <span className="text-xs text-muted-foreground w-36">Conglomerate Discount:</span>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="flex-1 h-1.5 accent-primary"
          />
          <span className="font-mono text-sm w-8">{discount}%</span>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sum-of-Parts Total", value: `$${totalSOTP.toFixed(0)}B`, color: "text-primary" },
            { label: `After ${discount}% Discount`, value: `$${discountedSOTP.toFixed(0)}B`, color: "text-amber-400" },
            { label: "Implied Price/Share", value: `$${pricePerShare.toFixed(0)}`, color: "text-emerald-400" },
            {
              label: "Market vs SOTP",
              value: `${premium > 0 ? "+" : ""}${premium.toFixed(1)}%`,
              color: premium > 0 ? "text-red-400" : "text-emerald-400",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-secondary/30 p-3 text-center">
              <div className={cn("text-xl font-medium font-mono", item.color)}>{item.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Waterfall bar chart */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">SOTP Waterfall Chart ($B)</h3>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 40}`}>
          {segments.map((seg, i) => {
            const val = seg.revenue * seg.multiple;
            const x = 20 + i * (barW + 8);
            const h = (val / maxVal) * chartH;
            return (
              <g key={seg.id}>
                <rect x={x} y={chartH - h} width={barW} height={h} fill={colors[i % colors.length]} rx={2} opacity={0.85} />
                <text x={x + barW / 2} y={chartH - h - 4} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.8)">
                  ${val.toFixed(0)}B
                </text>
                <text x={x + barW / 2} y={chartH + 12} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.5)">
                  {seg.name.split(" ").slice(0, 2).join(" ")}
                </text>
              </g>
            );
          })}
          {/* Total bar */}
          {(() => {
            const x = 20 + segments.length * (barW + 8);
            const h = (totalSOTP / maxVal) * chartH;
            return (
              <g>
                <rect x={x} y={chartH - h} width={barW} height={h} fill="#6366f1" rx={2} opacity={0.5} strokeDasharray="4 2" stroke="#6366f1" />
                <text x={x + barW / 2} y={chartH - h - 4} textAnchor="middle" fontSize={8} fill="white">
                  ${totalSOTP.toFixed(0)}B
                </text>
                <text x={x + barW / 2} y={chartH + 12} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.7)">
                  Total SOTP
                </text>
              </g>
            );
          })()}
          {/* Market cap line */}
          {(() => {
            const y = chartH - (marketCap / maxVal) * chartH;
            return (
              <g>
                <line x1={0} y1={y} x2={chartW} y2={y} stroke="rgba(251,191,36,0.6)" strokeDasharray="5 3" />
                <text x={chartW - 2} y={y - 3} textAnchor="end" fontSize={8} fill="rgba(251,191,36,0.8)">
                  Market Cap ${marketCap}B
                </text>
              </g>
            );
          })()}
          {/* Baseline */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="rgba(255,255,255,0.1)" />
        </svg>
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" />
          Conglomerates often trade at a 20–30% discount to SOTP due to complexity, cross-subsidies, and management focus.
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Tab 4: Dividend Discount Model
// ────────────────────────────────────────────────────────────────────────────────
function DDMTab() {
  const [ticker, setTicker] = useState<"JNJ" | "XOM" | "JPM">("JNJ");
  const [dividend, setDividend] = useState(4.76); // annual $
  const [g1, setG1] = useState(6.0); // high growth phase %
  const [g2, setG2] = useState(3.0); // terminal growth %
  const [r, setR] = useState(8.5); // discount rate %

  const presets: Record<string, { dividend: number; g1: number; g2: number; r: number; payoutRatio: number; fcfCoverage: number; debtLevel: string }> = {
    JNJ: { dividend: 4.76, g1: 6.0, g2: 3.0, r: 8.5, payoutRatio: 44, fcfCoverage: 2.3, debtLevel: "Low" },
    XOM: { dividend: 3.64, g1: 4.0, g2: 2.5, r: 9.0, payoutRatio: 36, fcfCoverage: 1.8, debtLevel: "Moderate" },
    JPM: { dividend: 4.60, g1: 7.5, g2: 3.5, r: 10.5, payoutRatio: 28, fcfCoverage: 3.1, debtLevel: "Low" },
  };

  const loadPreset = (t: "JNJ" | "XOM" | "JPM") => {
    const p = presets[t];
    setTicker(t);
    setDividend(p.dividend);
    setG1(p.g1);
    setG2(p.g2);
    setR(p.r);
  };

  // Two-stage DDM
  const gordonValue = useMemo(() => dividend * (1 + g2 / 100) / (r / 100 - g2 / 100), [dividend, r, g2]);

  const twoStageValue = useMemo(() => {
    let pv = 0;
    let d = dividend;
    for (let yr = 1; yr <= 5; yr++) {
      d = d * (1 + g1 / 100);
      pv += d / Math.pow(1 + r / 100, yr);
    }
    const terminalDiv = d * (1 + g2 / 100);
    const terminalValue = terminalDiv / (r / 100 - g2 / 100);
    const pvTerminal = terminalValue / Math.pow(1 + r / 100, 5);
    return pv + pvTerminal;
  }, [dividend, g1, g2, r]);

  const marketPrices: Record<string, number> = { JNJ: 147, XOM: 116, JPM: 213 };
  const price = marketPrices[ticker];

  // Sensitivity table: g rows × r cols
  const gRange = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  const rRange = [7.0, 7.5, 8.0, 8.5, 9.0, 9.5];
  const sensGrid = gRange.map((g) =>
    rRange.map((dr) => {
      if (dr <= g) return null;
      return dividend * (1 + g / 100) / (dr / 100 - g / 100);
    }),
  );

  const preset = presets[ticker];

  const sustainabilityStatus =
    preset.fcfCoverage > 2
      ? { label: "Sustainable", color: "text-emerald-400", icon: CheckCircle2 }
      : preset.fcfCoverage > 1.2
      ? { label: "Adequate", color: "text-amber-400", icon: AlertTriangle }
      : { label: "At Risk", color: "text-red-400", icon: AlertTriangle };

  return (
    <div className="space-y-4">
      {/* Ticker presets */}
      <div className="flex gap-2">
        {(["JNJ", "XOM", "JPM"] as const).map((t) => (
          <button
            key={t}
            onClick={() => loadPreset(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-mono font-medium transition-colors",
              ticker === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
        <span className="text-xs text-muted-foreground self-center ml-2">Dividend payers: utilities, consumer staples, REITs</span>
      </div>

      {/* Inputs */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">DDM Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Annual Dividend ($)", value: dividend, setter: setDividend, min: 0.5, max: 15, step: 0.1 },
            { label: "High Growth g1 (%)", value: g1, setter: setG1, min: 1, max: 20, step: 0.5 },
            { label: "Terminal Growth g2 (%)", value: g2, setter: setG2, min: 0.5, max: 5, step: 0.5 },
            { label: "Discount Rate r (%)", value: r, setter: setR, min: 5, max: 15, step: 0.5 },
          ].map((inp) => (
            <div key={inp.label}>
              <label className="text-xs text-muted-foreground mb-1 block">{inp.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={inp.min}
                  max={inp.max}
                  step={inp.step}
                  value={inp.value}
                  onChange={(e) => inp.setter(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-primary"
                />
                <span className="font-mono text-sm w-12 text-right">{inp.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Gordon Growth Model", value: gordonValue, formula: "V = D₁ / (r − g)", desc: "Single-stage perpetuity" },
          { label: "Two-Stage DDM", value: twoStageValue, formula: "5yr + terminal", desc: `g₁=${g1}% → g₂=${g2}%` },
          { label: "Market Price", value: price, formula: "Current", desc: `${twoStageValue > price ? "Undervalued" : "Overvalued"} by ${Math.abs((twoStageValue - price) / price * 100).toFixed(1)}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
            <div className="text-lg font-medium font-mono mb-1">${item.value.toFixed(0)}</div>
            <div className="text-xs text-primary font-mono mb-0.5">{item.formula}</div>
            <div className="text-xs text-muted-foreground">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Sustainability */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Dividend Sustainability Analysis — {ticker}</h3>
        <div className="grid grid-cols-3 gap-4 mb-3">
          {[
            { label: "Payout Ratio", value: `${preset.payoutRatio}%`, warn: preset.payoutRatio > 70 },
            { label: "FCF Coverage", value: `${preset.fcfCoverage.toFixed(1)}x`, warn: preset.fcfCoverage < 1.3 },
            { label: "Debt Level", value: preset.debtLevel, warn: preset.debtLevel === "High" },
          ].map((m) => (
            <div key={m.label} className="text-center p-3 rounded-lg bg-secondary/20">
              <div className={cn("text-xl font-medium font-mono", m.warn ? "text-amber-400" : "text-emerald-400")}>
                {m.value}
              </div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
        <div className={cn("flex items-center gap-2 text-sm font-medium", sustainabilityStatus.color)}>
          <sustainabilityStatus.icon className="w-4 h-4" />
          Dividend Assessment: {sustainabilityStatus.label}
        </div>
      </div>

      {/* Sensitivity grid */}
      <div className="rounded-md border border-border bg-card p-5 overflow-x-auto">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Gordon Growth Model — g vs r Sensitivity ($)</h3>
        <table className="text-xs text-muted-foreground font-mono w-full">
          <thead>
            <tr>
              <th className="text-left py-1.5 text-muted-foreground">g \ r</th>
              {rRange.map((dr) => (
                <th key={dr} className="text-right py-1.5 text-muted-foreground">{dr}%</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gRange.map((g, gi) => (
              <tr key={g} className="border-b border-border/20">
                <td className="py-1.5 text-muted-foreground">{g}%</td>
                {rRange.map((dr, ri) => {
                  const val = sensGrid[gi][ri];
                  const isBase = Math.abs(g - g2) < 0.01 && Math.abs(dr - r) < 0.01;
                  return (
                    <td
                      key={dr}
                      className={cn(
                        "text-right py-1.5 px-1",
                        val === null ? "text-muted-foreground/30" : val > price ? "text-emerald-400" : "text-red-400",
                        isBase && "ring-1 ring-primary/50 rounded bg-muted/10",
                      )}
                    >
                      {val === null ? "—" : `$${val.toFixed(0)}`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-muted-foreground">
          Current market price: ${price} | Green = above market, Red = below market
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Tab 5: Real Options Valuation
// ────────────────────────────────────────────────────────────────────────────────
const DRUG_PIPELINE = [
  { name: "Phase III — Oncology", S: 800, K: 400, T: 3, sigma: 0.55, r: 0.05, prob: 0.6 },
  { name: "Phase II — Cardiovascular", S: 450, K: 300, T: 5, sigma: 0.65, r: 0.05, prob: 0.35 },
  { name: "Phase I — Neurology", S: 280, K: 200, T: 8, sigma: 0.80, r: 0.05, prob: 0.12 },
  { name: "Preclinical — Rare Disease", S: 120, K: 150, T: 10, sigma: 0.90, r: 0.05, prob: 0.05 },
];

function RealOptionsTab() {
  const [selectedOption, setSelectedOption] = useState<"expand" | "abandon" | "delay">("expand");
  const [S, setS] = useState(500);
  const [K, setK] = useState(300);
  const [T, setT] = useState(3);
  const [sigma, setSigma] = useState(40);
  const [optR] = useState(5);

  const callValue = blackScholes(S, K, T, optR / 100, sigma / 100);

  const optionTypes = {
    expand: {
      label: "Option to Expand",
      icon: TrendingUp,
      color: "text-emerald-400",
      desc: "A growth company holds an option to enter new markets. The investment needed (K) is the exercise price; current PV of the expanded business is S.",
      mapS: "PV of expanded business",
      mapK: "Investment required",
      mapT: "Window of opportunity (yrs)",
      mapSigma: "Uncertainty in future value",
      example: "Tesla: option to scale FSD + Robotaxi is like owning call options on massive future revenue streams.",
    },
    abandon: {
      label: "Option to Abandon",
      icon: TrendingDown,
      color: "text-red-400",
      desc: "Management can exit a project for its salvage value. Modeled as a put option on the project value.",
      mapS: "PV of future cash flows",
      mapK: "Salvage / abandonment value",
      mapT: "Decision horizon (yrs)",
      mapSigma: "Cash flow uncertainty",
      example: "Mining company: can sell the mine for scrap if commodity prices fall far enough.",
    },
    delay: {
      label: "Option to Delay",
      icon: Activity,
      color: "text-amber-400",
      desc: "Waiting for uncertainty to resolve before committing capital. Value of waiting increases with volatility.",
      mapS: "PV of project if started now",
      mapK: "Investment cost",
      mapT: "Deferral window (yrs)",
      mapSigma: "Underlying asset volatility",
      example: "Oil producer: delay drilling an identified field until oil prices recover above breakeven.",
    },
  };

  const opt = optionTypes[selectedOption];

  const pharmaTotal = DRUG_PIPELINE.reduce((acc, d) => {
    const bsVal = blackScholes(d.S, d.K, d.T, d.r, d.sigma);
    return acc + bsVal * d.prob;
  }, 0);

  // Sensitivity: sigma vs T
  const sigRange = [20, 30, 40, 50, 60, 70];
  const tRange = [1, 2, 3, 4, 5];
  const realOptSens = sigRange.map((sig) =>
    tRange.map((t) => blackScholes(S, K, t, optR / 100, sig / 100)),
  );

  return (
    <div className="space-y-4">
      {/* Option type selector */}
      <div className="flex gap-2">
        {(Object.keys(optionTypes) as Array<"expand" | "abandon" | "delay">).map((key) => {
          const ot = optionTypes[key];
          return (
            <button
              key={key}
              onClick={() => setSelectedOption(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedOption === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <ot.icon className="w-4 h-4" />
              {ot.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedOption}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-md border border-border bg-card p-5">
            <div className="flex items-start gap-3 mb-5">
              <opt.icon className={cn("w-5 h-5 mt-0.5", opt.color)} />
              <div>
                <h3 className={cn("font-medium", opt.color)}>{opt.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: `S — ${opt.mapS}`, value: S, setter: setS, min: 50, max: 2000, step: 50 },
                { label: `K — ${opt.mapK}`, value: K, setter: setK, min: 50, max: 2000, step: 50 },
                { label: `T — ${opt.mapT}`, value: T, setter: setT, min: 0.5, max: 15, step: 0.5 },
                { label: `σ — ${opt.mapSigma} (%)`, value: sigma, setter: setSigma, min: 10, max: 120, step: 5 },
              ].map((inp) => (
                <div key={inp.label}>
                  <label className="text-xs text-muted-foreground mb-1 block leading-tight">{inp.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={inp.min}
                      max={inp.max}
                      step={inp.step}
                      value={inp.value}
                      onChange={(e) => inp.setter(Number(e.target.value))}
                      className="flex-1 h-1.5 accent-primary"
                    />
                    <span className="font-mono text-sm w-14 text-right">{inp.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-secondary/30 p-4 text-center">
                <div className="text-lg font-medium font-mono text-primary">${callValue.toFixed(1)}M</div>
                <div className="text-xs text-muted-foreground mt-1">Option Value (Black-Scholes)</div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-4 text-center">
                <div className="text-lg font-medium font-mono text-amber-400">{(callValue / S * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Option as % of Asset</div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-4 text-center">
                <div className={cn("text-lg font-medium font-mono", S > K ? "text-emerald-400" : "text-red-400")}>
                  {S > K ? "In the Money" : "Out of Money"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Intrinsic Status</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300">
              <strong>Example:</strong> {opt.example}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Sigma × Time sensitivity */}
      <div className="rounded-md border border-border bg-card p-5 overflow-x-auto">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Option Value — Volatility × Time ($M)</h3>
        <table className="text-xs text-muted-foreground font-mono w-full">
          <thead>
            <tr>
              <th className="text-left py-1.5 text-muted-foreground">σ \ T</th>
              {tRange.map((t) => (
                <th key={t} className="text-right py-1.5 text-muted-foreground">{t}yr</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sigRange.map((sig, si) => (
              <tr key={sig} className="border-b border-border/20">
                <td className="py-1.5 text-muted-foreground">{sig}%</td>
                {tRange.map((t, ti) => {
                  const val = realOptSens[si][ti];
                  const isBase = sig === sigma && t === T;
                  return (
                    <td
                      key={t}
                      className={cn("text-right py-1.5 px-1 text-emerald-400", isBase && "ring-1 ring-primary/50 rounded bg-muted/10")}
                    >
                      ${val.toFixed(0)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-1 text-xs text-muted-foreground">Higher volatility and longer time increase real option value — unlike traditional NPV which penalizes uncertainty.</div>
      </div>

      {/* Pharma pipeline case study */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Case Study: Pharma Drug Pipeline as Option Portfolio</h3>
        <div className="space-y-2 mb-4">
          {DRUG_PIPELINE.map((d) => {
            const bsVal = blackScholes(d.S, d.K, d.T, d.r, d.sigma);
            const riskedVal = bsVal * d.prob;
            return (
              <div key={d.name} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-secondary/20">
                <div className="flex-1">
                  <div className="font-medium text-xs text-muted-foreground">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    S=${d.S}M · K=${d.K}M · T={d.T}yr · σ={Math.round(d.sigma * 100)}% · PoS={Math.round(d.prob * 100)}%
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-muted-foreground">BS Value</div>
                  <div className="text-primary font-medium">${bsVal.toFixed(0)}M</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-muted-foreground">Risk-Adj</div>
                  <div className="text-emerald-400 font-medium">${riskedVal.toFixed(0)}M</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/10 border border-primary/20">
          <span className="font-medium text-sm">Total Pipeline Value (Risk-Adjusted)</span>
          <span className="text-lg font-medium font-mono text-primary">${pharmaTotal.toFixed(0)}M</span>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-secondary/20 text-xs text-muted-foreground">
          <AlertTriangle className="inline w-3 h-3 mr-1 text-amber-400" />
          <strong>Limitations:</strong> Real options are often not perfectly replicable (no traded underlying), discontinuous payoffs differ from financial options, and management may not act optimally.
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Tab 6: Valuation Synthesis
// ────────────────────────────────────────────────────────────────────────────────
interface ValuationRange {
  method: string;
  low: number;
  mid: number;
  high: number;
  weight: number;
  color: string;
}

const DEFAULT_RANGES: ValuationRange[] = [
  { method: "Relative (P/E)", low: 180, mid: 210, high: 250, weight: 25, color: "#6366f1" },
  { method: "DCF", low: 160, mid: 230, high: 320, weight: 35, color: "#8b5cf6" },
  { method: "Sum of Parts", low: 200, mid: 240, high: 290, weight: 15, color: "#06b6d4" },
  { method: "DDM", low: 0, mid: 0, high: 0, weight: 5, color: "#10b981" },
  { method: "Real Options", low: 190, mid: 260, high: 380, weight: 20, color: "#f59e0b" },
];

const CATALYSTS_BULL = [
  "AI integration drives Services attach rates above 30%",
  "China recovery — reversal of export restriction headwinds",
  "VR/AR headset ecosystem matures to critical mass",
];
const CATALYSTS_BASE = [
  "iPhone upgrade cycle stays consistent, Services grows 15%+",
  "Cost discipline drives margin expansion 50-100bps/year",
  "Buyback program maintains EPS growth despite flat revenue",
];
const CATALYSTS_BEAR = [
  "Regulatory action in EU/US forces App Store restructuring",
  "Macro downturn compresses premium device demand",
  "Competitive pressure from AI-native alternatives",
];

function SynthesisTab() {
  const [ranges, setRanges] = useState<ValuationRange[]>(DEFAULT_RANGES);
  const [scenario, setScenario] = useState<"bull" | "base" | "bear">("base");
  const [upside, setUpside] = useState(15);
  const [downside, setDownside] = useState(20);
  const marketPrice = 222;

  const totalWeight = ranges.reduce((a, r) => a + r.weight, 0);

  const weightedMid = ranges.reduce((acc, r) => {
    if (r.mid === 0) return acc;
    return acc + (r.mid * r.weight) / totalWeight;
  }, 0);

  const weightedLow = ranges.reduce((acc, r) => {
    if (r.low === 0) return acc;
    return acc + (r.low * r.weight) / totalWeight;
  }, 0);

  const weightedHigh = ranges.reduce((acc, r) => {
    if (r.high === 0) return acc;
    return acc + (r.high * r.weight) / totalWeight;
  }, 0);

  const mos = ((weightedMid - marketPrice) / weightedMid) * 100;
  const grade =
    mos > 25
      ? { label: "Strong Buy", color: "text-emerald-400", bg: "bg-emerald-400/10" }
      : mos > 10
      ? { label: "Buy", color: "text-emerald-300", bg: "bg-emerald-300/10" }
      : mos > -5
      ? { label: "Hold", color: "text-amber-400", bg: "bg-amber-400/10" }
      : mos > -20
      ? { label: "Sell", color: "text-red-400", bg: "bg-red-400/10" }
      : { label: "Strong Sell", color: "text-red-500", bg: "bg-red-500/5" };

  const updateWeight = useCallback((idx: number, val: number) => {
    setRanges((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], weight: val };
      return next;
    });
  }, []);

  // Football field chart
  const ffW = 560;
  const ffH = ranges.length * 36 + 20;
  const allVals = ranges.flatMap((r) => [r.low, r.mid, r.high]).filter((v) => v > 0);
  const ffMin = Math.min(...allVals, marketPrice) * 0.85;
  const ffMax = Math.max(...allVals, marketPrice) * 1.1;
  const ffRange = ffMax - ffMin;
  const padL = 120;
  const padR = 20;
  const innerFF = ffW - padL - padR;

  function ffX(val: number) {
    return padL + ((val - ffMin) / ffRange) * innerFF;
  }

  const riskReward = upside / downside;

  const scenarioCatalysts = { bull: CATALYSTS_BULL, base: CATALYSTS_BASE, bear: CATALYSTS_BEAR };
  const scenarioColors = { bull: "text-emerald-400", base: "text-amber-400", bear: "text-red-400" };

  return (
    <div className="space-y-4">
      {/* Football field */}
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Football Field Chart — All Methods</h3>
          <div className={cn("px-3 py-1 rounded-md text-sm font-medium", grade.bg, grade.color)}>
            {grade.label}
          </div>
        </div>
        <svg width="100%" viewBox={`0 0 ${ffW} ${ffH + 30}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const x = padL + t * innerFF;
            const v = ffMin + t * ffRange;
            return (
              <g key={t}>
                <line x1={x} y1={0} x2={x} y2={ffH} stroke="rgba(255,255,255,0.06)" />
                <text x={x} y={ffH + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
                  ${v.toFixed(0)}
                </text>
              </g>
            );
          })}
          {/* Bars */}
          {ranges.map((r, i) => {
            if (r.low === 0 && r.mid === 0) return null;
            const y = 10 + i * 36;
            const x1 = ffX(r.low || r.mid * 0.9);
            const x2 = ffX(r.high || r.mid * 1.1);
            const xm = ffX(r.mid);
            return (
              <g key={r.method}>
                <text x={padL - 6} y={y + 12} textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.7)">
                  {r.method}
                </text>
                <rect x={x1} y={y} width={x2 - x1} height={20} fill={r.color} rx={3} opacity={0.25} />
                <rect x={x1} y={y} width={x2 - x1} height={20} fill={r.color} rx={3} opacity={0} stroke={r.color} strokeWidth={1} />
                <line x1={xm} y1={y - 2} x2={xm} y2={y + 22} stroke={r.color} strokeWidth={2} />
                <text x={xm} y={y + 32} textAnchor="middle" fontSize={8} fill={r.color}>
                  ${r.mid}
                </text>
              </g>
            );
          })}
          {/* Market price line */}
          {(() => {
            const x = ffX(marketPrice);
            return (
              <g>
                <line x1={x} y1={0} x2={x} y2={ffH} stroke="white" strokeWidth={1.5} strokeDasharray="5 3" />
                <text x={x + 3} y={8} fontSize={9} fill="white">Market ${marketPrice}</text>
              </g>
            );
          })()}
          {/* Weighted avg */}
          {(() => {
            const x = ffX(weightedMid);
            return (
              <g>
                <line x1={x} y1={0} x2={x} y2={ffH} stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" />
                <text x={x + 3} y={16} fontSize={9} fill="#f59e0b">Wtd Avg ${weightedMid.toFixed(0)}</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Weight assignment */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Weight Assignment</h3>
        <div className="space-y-3">
          {ranges.map((r, i) => (
            <div key={r.method} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: r.color }} />
              <span className="text-sm w-32">{r.method}</span>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={r.weight}
                onChange={(e) => updateWeight(i, Number(e.target.value))}
                className="flex-1 h-1.5 accent-primary"
              />
              <span className="font-mono text-sm w-8 text-right">{r.weight}%</span>
            </div>
          ))}
          <div className="text-xs text-muted-foreground text-right">
            Total: {totalWeight}% {totalWeight !== 100 && <span className="text-amber-400">(should sum to 100%)</span>}
          </div>
        </div>
      </div>

      {/* Bull / Base / Bear scenarios + Risk/Reward */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex gap-2 mb-4">
            {(["bull", "base", "bear"] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setScenario(sc)}
                className={cn(
                  "capitalize px-3 py-1.5 rounded-md text-xs text-muted-foreground font-medium transition-colors",
                  scenario === sc
                    ? sc === "bull"
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30"
                      : sc === "base"
                      ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/30"
                      : "bg-red-500/20 text-red-400 ring-1 ring-red-400/30"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {sc}
              </button>
            ))}
          </div>
          <div className="space-y-2 mb-3">
            {[
              { label: "Bull Target", value: weightedHigh, color: "text-emerald-400" },
              { label: "Base Target", value: weightedMid, color: "text-amber-400" },
              { label: "Bear Target", value: weightedLow, color: "text-red-400" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={cn("font-mono font-medium", item.color)}>
                  ${item.value.toFixed(0)} ({fmtPct(((item.value - marketPrice) / marketPrice) * 100)})
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/20 pt-3">
            <h4 className={cn("text-xs text-muted-foreground font-medium mb-2 capitalize", scenarioColors[scenario])}>
              {scenario} Case Catalysts
            </h4>
            <ul className="space-y-1">
              {scenarioCatalysts[scenario].map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="mt-0.5 text-primary">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Risk / Reward Asymmetry</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Upside Potential (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={upside}
                  onChange={(e) => setUpside(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-emerald-500"
                />
                <span className="font-mono text-sm w-10 text-emerald-400">+{upside}%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Downside Risk (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={downside}
                  onChange={(e) => setDownside(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-red-500"
                />
                <span className="font-mono text-sm w-10 text-red-400">-{downside}%</span>
              </div>
            </div>
          </div>
          {/* Asymmetry visual */}
          <div className="relative h-16 flex items-center justify-center mb-3">
            <div className="relative w-full h-8 flex rounded-lg overflow-hidden">
              <div
                className="bg-emerald-500/30 transition-colors duration-300"
                style={{ width: `${(upside / (upside + downside)) * 100}%` }}
              />
              <div
                className="bg-red-500/30 transition-colors duration-300"
                style={{ width: `${(downside / (upside + downside)) * 100}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-lg font-medium">
              {riskReward.toFixed(2)}:1
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mb-3">Risk/Reward Ratio</div>
          <div
            className={cn(
              "text-center text-sm font-medium p-2 rounded-lg",
              riskReward >= 3 ? "text-emerald-400 bg-emerald-400/10" : riskReward >= 2 ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10",
            )}
          >
            {riskReward >= 3
              ? "Excellent asymmetry — favorable entry"
              : riskReward >= 2
              ? "Acceptable risk/reward"
              : "Poor asymmetry — wait for better entry"}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="p-2 rounded bg-secondary/30 font-mono">
              <div className="text-muted-foreground">Bull Target</div>
              <div className="text-emerald-400">${(marketPrice * (1 + upside / 100)).toFixed(0)}</div>
            </div>
            <div className="p-2 rounded bg-secondary/30 font-mono">
              <div className="text-muted-foreground">Bear Target</div>
              <div className="text-red-400">${(marketPrice * (1 - downside / 100)).toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "relative", label: "Relative", icon: BarChart3 },
  { id: "dcf", label: "DCF", icon: Calculator },
  { id: "sotp", label: "Sum of Parts", icon: Layers },
  { id: "ddm", label: "DDM", icon: Percent },
  { id: "real-options", label: "Real Options", icon: Activity },
  { id: "synthesis", label: "Synthesis", icon: Scale },
];

export default function ValuationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-muted/10">
              <Scale className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div>
              <h1 className="text-xl font-medium">Stock Valuation Methodologies</h1>
              <p className="text-sm text-muted-foreground">
                6 professional frameworks — Relative, DCF, SOTP, DDM, Real Options, Synthesis
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="relative" className="mt-8">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6 bg-secondary/40 p-1 rounded-md">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="relative" className="mt-0 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <RelativeValuationTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="dcf" className="mt-0 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <DCFTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="sotp" className="mt-0 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <SOTPTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="ddm" className="mt-0 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <DDMTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="real-options" className="mt-0 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <RealOptionsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="synthesis" className="mt-0 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <SynthesisTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
