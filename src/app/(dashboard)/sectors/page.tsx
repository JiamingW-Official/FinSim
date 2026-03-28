"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Plus,
  Info,
  LayoutGrid,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (seed=3131) ───────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTORS = [
  { name: "Technology",             etf: "XLK",  marketCapB: 14800, color: "#6366f1" },
  { name: "Healthcare",             etf: "XLV",  marketCapB: 6200,  color: "#10b981" },
  { name: "Financials",             etf: "XLF",  marketCapB: 8100,  color: "#3b82f6" },
  { name: "Consumer Discretionary", etf: "XLY",  marketCapB: 4900,  color: "#f59e0b" },
  { name: "Consumer Staples",       etf: "XLP",  marketCapB: 3400,  color: "#84cc16" },
  { name: "Industrials",            etf: "XLI",  marketCapB: 5300,  color: "#8b5cf6" },
  { name: "Energy",                 etf: "XLE",  marketCapB: 3800,  color: "#ef4444" },
  { name: "Materials",              etf: "XLB",  marketCapB: 2100,  color: "#14b8a6" },
  { name: "Real Estate",            etf: "XLRE", marketCapB: 1800,  color: "#f97316" },
  { name: "Utilities",              etf: "XLU",  marketCapB: 1600,  color: "#06b6d4" },
  { name: "Communication Services", etf: "XLC",  marketCapB: 4200,  color: "#ec4899" },
] as const;

type SectorName = (typeof SECTORS)[number]["name"];

const TOP_STOCKS: Record<SectorName, { ticker: string; name: string }[]> = {
  "Technology":             [{ ticker: "AAPL", name: "Apple" }, { ticker: "MSFT", name: "Microsoft" }, { ticker: "NVDA", name: "NVIDIA" }],
  "Healthcare":             [{ ticker: "LLY", name: "Eli Lilly" }, { ticker: "UNH", name: "UnitedHealth" }, { ticker: "JNJ", name: "J&J" }],
  "Financials":             [{ ticker: "JPM", name: "JPMorgan" }, { ticker: "BAC", name: "Bank of America" }, { ticker: "GS", name: "Goldman Sachs" }],
  "Consumer Discretionary": [{ ticker: "AMZN", name: "Amazon" }, { ticker: "TSLA", name: "Tesla" }, { ticker: "HD", name: "Home Depot" }],
  "Consumer Staples":       [{ ticker: "PG", name: "Procter & Gamble" }, { ticker: "KO", name: "Coca-Cola" }, { ticker: "WMT", name: "Walmart" }],
  "Industrials":            [{ ticker: "CAT", name: "Caterpillar" }, { ticker: "HON", name: "Honeywell" }, { ticker: "UPS", name: "UPS" }],
  "Energy":                 [{ ticker: "XOM", name: "ExxonMobil" }, { ticker: "CVX", name: "Chevron" }, { ticker: "COP", name: "ConocoPhillips" }],
  "Materials":              [{ ticker: "LIN", name: "Linde" }, { ticker: "SHW", name: "Sherwin-Williams" }, { ticker: "FCX", name: "Freeport-McMoRan" }],
  "Real Estate":            [{ ticker: "AMT", name: "American Tower" }, { ticker: "PLD", name: "Prologis" }, { ticker: "EQIX", name: "Equinix" }],
  "Utilities":              [{ ticker: "NEE", name: "NextEra Energy" }, { ticker: "DUK", name: "Duke Energy" }, { ticker: "SO", name: "Southern Co" }],
  "Communication Services": [{ ticker: "META", name: "Meta" }, { ticker: "GOOGL", name: "Alphabet" }, { ticker: "NFLX", name: "Netflix" }],
};

const FACTORS = ["Value", "Growth", "Momentum", "Quality", "Low Volatility", "Size"] as const;
type Factor = (typeof FACTORS)[number];

// ── Data generation ───────────────────────────────────────────────────────────

interface SectorPerf {
  name: string;
  etf: string;
  color: string;
  marketCapB: number;
  ret1d: number;
  ret1w: number;
  ret1m: number;
  ret3m: number;
  retYtd: number;
  ret1y: number;
  alpha: number; // vs SPY
}

interface SectorEtfData {
  etf: string;
  name: string;
  color: string;
  aumB: number;
  expenseRatio: number;
  divYield: number;
  pe: number;
  beta: number;
  ret52w: number;
  topHolding: string;
}

interface SectorFactorData {
  name: string;
  loadings: Record<Factor, number>; // -1 to 1
}

function generateSectorData(): { perfs: SectorPerf[]; etfs: SectorEtfData[]; factors: SectorFactorData[] } {
  const rng = seededRng(3131);

  const perfs: SectorPerf[] = SECTORS.map((s) => {
    const ret1d   = (rng() - 0.5) * 4;
    const ret1w   = (rng() - 0.5) * 10;
    const ret1m   = (rng() - 0.5) * 18;
    const ret3m   = (rng() - 0.5) * 30;
    const retYtd  = (rng() - 0.5) * 40;
    const ret1y   = (rng() - 0.5) * 50;
    const alpha   = ret1y - 24.5; // vs "SPY" 24.5%
    return { ...s, ret1d, ret1w, ret1m, ret3m, retYtd, ret1y, alpha };
  });

  const etfStaticData: Record<string, { aumB: number; expenseRatio: number; divYield: number; pe: number; beta: number; topHolding: string }> = {
    XLK:  { aumB: 58.4, expenseRatio: 0.09, divYield: 0.72, pe: 32.1, beta: 1.22, topHolding: "AAPL" },
    XLV:  { aumB: 37.2, expenseRatio: 0.09, divYield: 1.54, pe: 22.6, beta: 0.72, topHolding: "LLY" },
    XLF:  { aumB: 43.8, expenseRatio: 0.09, divYield: 1.84, pe: 16.9, beta: 1.12, topHolding: "JPM" },
    XLY:  { aumB: 21.3, expenseRatio: 0.09, divYield: 0.66, pe: 28.4, beta: 1.34, topHolding: "AMZN" },
    XLP:  { aumB: 16.7, expenseRatio: 0.09, divYield: 2.71, pe: 20.2, beta: 0.61, topHolding: "PG" },
    XLI:  { aumB: 22.5, expenseRatio: 0.09, divYield: 1.48, pe: 24.8, beta: 1.05, topHolding: "CAT" },
    XLE:  { aumB: 31.4, expenseRatio: 0.09, divYield: 3.42, pe: 13.1, beta: 0.93, topHolding: "XOM" },
    XLB:  { aumB: 8.9,  expenseRatio: 0.09, divYield: 1.62, pe: 21.3, beta: 1.01, topHolding: "LIN" },
    XLRE: { aumB: 6.2,  expenseRatio: 0.09, divYield: 3.18, pe: 38.4, beta: 0.82, topHolding: "AMT" },
    XLU:  { aumB: 12.4, expenseRatio: 0.09, divYield: 2.94, pe: 18.7, beta: 0.51, topHolding: "NEE" },
    XLC:  { aumB: 19.8, expenseRatio: 0.09, divYield: 0.88, pe: 24.1, beta: 1.08, topHolding: "META" },
  };

  const etfs: SectorEtfData[] = SECTORS.map((s) => {
    const perf = perfs.find((p) => p.etf === s.etf)!;
    const stat = etfStaticData[s.etf];
    return {
      etf: s.etf,
      name: s.name,
      color: s.color,
      ret52w: perf.ret1y,
      ...stat,
    };
  });

  const factorLoadingSeeds: Record<SectorName, Record<Factor, number>> = {
    "Technology":             { Value: -0.6, Growth: 0.9, Momentum: 0.7, Quality: 0.6, "Low Volatility": -0.4, Size: 0.8 },
    "Healthcare":             { Value: -0.1, Growth: 0.5, Momentum: 0.3, Quality: 0.7, "Low Volatility": 0.4, Size: 0.4 },
    "Financials":             { Value: 0.6, Growth: 0.2, Momentum: 0.4, Quality: 0.3, "Low Volatility": -0.1, Size: 0.6 },
    "Consumer Discretionary": { Value: -0.2, Growth: 0.6, Momentum: 0.5, Quality: 0.2, "Low Volatility": -0.5, Size: 0.3 },
    "Consumer Staples":       { Value: 0.3, Growth: -0.1, Momentum: -0.2, Quality: 0.8, "Low Volatility": 0.8, Size: 0.2 },
    "Industrials":            { Value: 0.2, Growth: 0.3, Momentum: 0.4, Quality: 0.5, "Low Volatility": 0.1, Size: 0.1 },
    "Energy":                 { Value: 0.8, Growth: -0.3, Momentum: 0.2, Quality: -0.1, "Low Volatility": -0.2, Size: 0.2 },
    "Materials":              { Value: 0.4, Growth: 0.1, Momentum: 0.3, Quality: 0.1, "Low Volatility": -0.1, Size: -0.2 },
    "Real Estate":            { Value: 0.1, Growth: -0.2, Momentum: -0.3, Quality: 0.2, "Low Volatility": 0.6, Size: -0.3 },
    "Utilities":              { Value: 0.2, Growth: -0.4, Momentum: -0.5, Quality: 0.4, "Low Volatility": 0.9, Size: -0.4 },
    "Communication Services": { Value: -0.3, Growth: 0.7, Momentum: 0.6, Quality: 0.4, "Low Volatility": -0.3, Size: 0.5 },
  };

  const factors: SectorFactorData[] = SECTORS.map((s) => ({
    name: s.name,
    loadings: factorLoadingSeeds[s.name],
  }));

  return { perfs, etfs, factors };
}

// ── Correlation matrix generation ─────────────────────────────────────────────

function generateCorrelations(): number[][] {
  const rng = seededRng(3131 + 99);
  const n = SECTORS.length;
  const mat: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    mat[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const base = 0.4 + rng() * 0.5; // 0.4 to 0.9
      const c = Math.round((base - 0.1) * 100) / 100;
      mat[i][j] = c;
      mat[j][i] = c;
    }
  }
  return mat;
}

// ── Factor quarter returns ─────────────────────────────────────────────────────

function generateFactorReturns(): Record<Factor, number> {
  const rng = seededRng(3131 + 77);
  return {
    Value:          (rng() - 0.4) * 20,
    Growth:         (rng() - 0.35) * 25,
    Momentum:       (rng() - 0.4) * 22,
    Quality:        (rng() - 0.45) * 15,
    "Low Volatility": (rng() - 0.5) * 12,
    Size:           (rng() - 0.5) * 18,
  };
}

// ── Utility helpers ───────────────────────────────────────────────────────────

function fmt(v: number, digits = 1): string {
  return (v > 0 ? "+" : "") + v.toFixed(digits) + "%";
}

function retColor(v: number): string {
  if (v > 3) return "text-emerald-400";
  if (v > 0) return "text-emerald-600";
  if (v > -3) return "text-red-600";
  return "text-red-400";
}

function heatmapColor(v: number, min: number, max: number): string {
  const t = (v - min) / (max - min); // 0 to 1
  if (t > 0.6) {
    const g = Math.round(120 + t * 100);
    return `rgb(20,${g},80)`;
  } else if (t < 0.4) {
    const r = Math.round(140 + (1 - t) * 80);
    return `rgb(${r},30,40)`;
  }
  return "rgb(50,50,60)";
}

function corrColor(c: number): string {
  // 0.4..1.0 range expected
  const t = (c - 0.3) / 0.7; // normalized 0..1
  const r = Math.round(20 + (1 - t) * 180);
  const g = Math.round(20 + t * 160);
  return `rgb(${r},${g},30)`;
}

function loadingColor(v: number): string {
  if (v >= 0.6) return "bg-emerald-500/30 text-emerald-300";
  if (v >= 0.2) return "bg-emerald-500/15 text-emerald-500";
  if (v <= -0.6) return "bg-red-500/30 text-red-300";
  if (v <= -0.2) return "bg-red-500/15 text-red-500";
  return "bg-muted/40 text-muted-foreground";
}

// ── Treemap layout ────────────────────────────────────────────────────────────

interface TmRect {
  name: string;
  etf: string;
  color: string;
  ret: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

function computeTreemap(perfs: SectorPerf[], W: number, H: number): TmRect[] {
  const total = perfs.reduce((s, p) => s + p.marketCapB, 0);
  const sorted = [...perfs].sort((a, b) => b.marketCapB - a.marketCapB);
  const rects: TmRect[] = [];

  // Simple row-based squarified approximation
  function layout(items: SectorPerf[], x: number, y: number, w: number, h: number) {
    if (items.length === 0) return;
    if (items.length === 1) {
      rects.push({ name: items[0].name, etf: items[0].etf, color: items[0].color, ret: items[0].ret1d, x, y, w, h });
      return;
    }
    // Split into two halves by market cap sum
    let sumA = 0;
    const sumAll = items.reduce((s, i) => s + i.marketCapB, 0);
    let splitIdx = 0;
    for (let i = 0; i < items.length; i++) {
      sumA += items[i].marketCapB;
      if (sumA >= sumAll / 2) { splitIdx = i + 1; break; }
    }
    if (splitIdx === 0) splitIdx = 1;
    const groupA = items.slice(0, splitIdx);
    const groupB = items.slice(splitIdx);
    const fracA = sumA / sumAll;

    if (w >= h) {
      const wA = w * fracA;
      layout(groupA, x, y, wA, h);
      layout(groupB, x + wA, y, w - wA, h);
    } else {
      const hA = h * fracA;
      layout(groupA, x, y, w, hA);
      layout(groupB, x, y + hA, w, h - hA);
    }
  }

  void total;
  layout(sorted, 0, 0, W, H);
  return rects;
}

// ── Economic cycle positions ───────────────────────────────────────────────────

const CYCLE_PHASES = [
  { label: "Early\nRecovery", angle: 45 },
  { label: "Late\nRecovery", angle: 135 },
  { label: "Early\nSlowdown", angle: 225 },
  { label: "Recession", angle: 315 },
] as const;

// Sector placement on the cycle wheel (angle in degrees)
const SECTOR_CYCLE_ANGLES: Record<SectorName, number> = {
  "Financials":             25,
  "Technology":             60,
  "Consumer Discretionary": 90,
  "Industrials":            120,
  "Materials":              155,
  "Energy":                 190,
  "Consumer Staples":       230,
  "Healthcare":             265,
  "Utilities":              295,
  "Real Estate":            330,
  "Communication Services": 355,
};

// Current phase: Early Recovery (angle ~45)
const CURRENT_PHASE_ANGLE = 45;

// Sectors highlighted in current phase (Early Recovery)
const CURRENT_LEADERS = ["Financials", "Technology", "Consumer Discretionary"];

// ── Historical rotation ────────────────────────────────────────────────────────

const HISTORICAL_CYCLES = [
  { name: "Post-COVID Recovery (2020–2021)", leaders: ["Technology", "Consumer Discretionary", "Communication Services"] },
  { name: "Post-GFC Recovery (2009–2010)",   leaders: ["Financials", "Industrials", "Consumer Discretionary"] },
  { name: "Dot-com Recovery (2003–2004)",     leaders: ["Technology", "Materials", "Industrials"] },
];

// ── Rotation scores ────────────────────────────────────────────────────────────

function computeRotationScores(perfs: SectorPerf[]): { name: string; score: number; breakdown: string }[] {
  return SECTORS.map((s) => {
    const p = perfs.find((x) => x.name === s.name)!;
    const momentum = Math.min(10, Math.max(-10, p.ret1m / 2));
    const rs       = Math.min(10, Math.max(-10, p.alpha / 5));
    const isLeader = CURRENT_LEADERS.includes(s.name);
    const cycleFit = isLeader ? 5 : -2;
    const score    = Math.round((momentum + rs + cycleFit) * 10) / 10;
    return { name: s.name, score, breakdown: `Momentum ${momentum.toFixed(1)} + RelStr ${rs.toFixed(1)} + Cycle ${cycleFit}` };
  }).sort((a, b) => b.score - a.score);
}

// ── Optimal portfolio weights ─────────────────────────────────────────────────

function computePortfolioWeights(perfs: SectorPerf[]): { name: string; etf: string; ewPct: number; momPct: number; ercPct: number }[] {
  const n = SECTORS.length;
  const ew = 100 / n;

  // Momentum weight: proportional to max(0, ret1m) + small floor
  const momRaws = SECTORS.map((s) => {
    const p = perfs.find((x) => x.name === s.name)!;
    return Math.max(0.5, p.ret1m + 10);
  });
  const momSum = momRaws.reduce((a, b) => a + b, 0);

  // ERC weight: inversely proportional to vol (use |ret1y| as proxy)
  const rng2 = seededRng(3131 + 55);
  const vols = SECTORS.map(() => 0.08 + rng2() * 0.20);
  const invVols = vols.map((v) => 1 / v);
  const invVolSum = invVols.reduce((a, b) => a + b, 0);

  return SECTORS.map((s, i) => ({
    name: s.name,
    etf: s.etf,
    ewPct:  Math.round(ew * 10) / 10,
    momPct: Math.round((momRaws[i] / momSum) * 1000) / 10,
    ercPct: Math.round((invVols[i] / invVolSum) * 1000) / 10,
  }));
}

// ── Style box SVG ─────────────────────────────────────────────────────────────

// Map sector onto value/growth (x) and large/small (y) axes
const STYLE_BOX_POSITIONS: Record<SectorName, { vg: number; ls: number }> = {
  // vg: -1=value, +1=growth; ls: -1=large, +1=small
  "Technology":             { vg:  0.7, ls: -0.6 },
  "Healthcare":             { vg:  0.2, ls: -0.2 },
  "Financials":             { vg: -0.5, ls: -0.5 },
  "Consumer Discretionary": { vg:  0.4, ls:  0.1 },
  "Consumer Staples":       { vg: -0.3, ls: -0.1 },
  "Industrials":            { vg:  0.0, ls:  0.2 },
  "Energy":                 { vg: -0.7, ls:  0.1 },
  "Materials":              { vg: -0.2, ls:  0.4 },
  "Real Estate":            { vg: -0.1, ls:  0.6 },
  "Utilities":              { vg: -0.4, ls:  0.3 },
  "Communication Services": { vg:  0.5, ls: -0.3 },
};

// ── Sector Tilt Recommendations ────────────────────────────────────────────────

function sectorTiltRecs(factorRets: Record<Factor, number>): string[] {
  const recs: string[] = [];
  if (factorRets["Momentum"] > 2)  recs.push("Momentum is outperforming → overweight Technology & Communication Services");
  if (factorRets["Value"] > 2)      recs.push("Value is outperforming → overweight Energy & Financials");
  if (factorRets["Growth"] > 2)     recs.push("Growth is outperforming → overweight Technology & Consumer Discretionary");
  if (factorRets["Quality"] > 2)    recs.push("Quality factor leading → consider Healthcare & Consumer Staples");
  if (factorRets["Low Volatility"] > 2) recs.push("Low Volatility outperforming → tilt to Utilities & Consumer Staples");
  if (factorRets["Size"] > 2)       recs.push("Size (small-cap) factor outperforming → diversify into smaller sector ETFs");
  if (recs.length === 0) recs.push("No single factor is dominant — balanced sector allocation recommended");
  return recs;
}

// ─────────────────────────────────────────────────────────────────────────────
// ── COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Return cell ───────────────────────────────────────────────────────────────

function RetCell({ v }: { v: number }) {
  return (
    <span className={cn("tabular-nums text-xs", retColor(v))}>
      {fmt(v)}
    </span>
  );
}

// ── Performance table ─────────────────────────────────────────────────────────

function PerformanceTable({
  perfs,
  selectedSector,
  onSelect,
}: {
  perfs: SectorPerf[];
  selectedSector: string;
  onSelect: (name: string) => void;
}) {
  const COLS: { key: keyof SectorPerf; label: string }[] = [
    { key: "ret1d",   label: "1D"  },
    { key: "ret1w",   label: "1W"  },
    { key: "ret1m",   label: "1M"  },
    { key: "ret3m",   label: "3M"  },
    { key: "retYtd",  label: "YTD" },
    { key: "ret1y",   label: "1Y"  },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 bg-muted/20">
            <th className="py-2 pl-3 pr-4 text-left text-xs font-semibold text-muted-foreground">Sector</th>
            {COLS.map((c) => (
              <th key={c.key} className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">{c.label}</th>
            ))}
            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">vs SPY</th>
          </tr>
        </thead>
        <tbody>
          {perfs.map((p) => (
            <tr
              key={p.name}
              onClick={() => onSelect(p.name)}
              className={cn(
                "cursor-pointer border-b border-border/20 transition-colors last:border-0",
                selectedSector === p.name ? "bg-accent/50" : "hover:bg-muted/20",
              )}
            >
              <td className="py-2 pl-3 pr-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs font-medium">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.etf}</span>
                </div>
              </td>
              {COLS.map((c) => (
                <td key={c.key} className="px-3 py-2 text-right">
                  <RetCell v={p[c.key] as number} />
                </td>
              ))}
              <td className="px-3 py-2 text-right">
                <RetCell v={p.alpha} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sector Heatmap (SVG treemap) ──────────────────────────────────────────────

function SectorHeatmap({
  perfs,
  selectedSector,
  onSelect,
}: {
  perfs: SectorPerf[];
  selectedSector: string;
  onSelect: (name: string) => void;
}) {
  const W = 680;
  const H = 260;
  const rects = useMemo(() => computeTreemap(perfs, W, H), [perfs]);
  const retValues = perfs.map((p) => p.ret1d);
  const minRet = Math.min(...retValues);
  const maxRet = Math.max(...retValues);
  const PAD = 2;

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sector Heatmap (1D, sized by Market Cap)</span>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="h-2 w-4 rounded-sm bg-red-500/60" />
          <span>Neg</span>
          <span className="ml-2 h-2 w-4 rounded-sm bg-emerald-500/60" />
          <span>Pos</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {rects.map((r) => {
          const bg = heatmapColor(r.ret, minRet, maxRet);
          const isSelected = selectedSector === r.name;
          const rx = r.x + PAD;
          const ry = r.y + PAD;
          const rw = r.w - PAD * 2;
          const rh = r.h - PAD * 2;
          if (rw < 4 || rh < 4) return null;
          return (
            <g key={r.name} onClick={() => onSelect(r.name)} className="cursor-pointer">
              <rect
                x={rx} y={ry} width={rw} height={rh}
                rx={4}
                fill={bg}
                opacity={isSelected ? 1 : 0.85}
                stroke={isSelected ? "#ffffff60" : "transparent"}
                strokeWidth={2}
              />
              {rw > 60 && rh > 30 && (
                <>
                  <text x={rx + rw / 2} y={ry + rh / 2 - 6} textAnchor="middle" fill="white" fontSize={Math.min(12, rw / 8)} fontWeight="600">
                    {r.etf}
                  </text>
                  <text x={rx + rw / 2} y={ry + rh / 2 + 10} textAnchor="middle" fill="white" fontSize={Math.min(10, rw / 10)} opacity={0.8}>
                    {fmt(r.ret)}
                  </text>
                </>
              )}
              {rw <= 60 && rw > 20 && rh > 20 && (
                <text x={rx + rw / 2} y={ry + rh / 2 + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">
                  {r.etf}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Relative Strength Bar Chart ───────────────────────────────────────────────

function RelativeStrengthChart({ perfs }: { perfs: SectorPerf[] }) {
  const sorted = [...perfs].sort((a, b) => b.alpha - a.alpha);
  const maxAbs  = Math.max(...sorted.map((p) => Math.abs(p.alpha)));
  const BAR_H   = 22;
  const W       = 340;
  const LBL_W   = 36;
  const BAR_W   = W - LBL_W - 50;
  const MID     = LBL_W + BAR_W / 2;

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Relative Strength vs S&P 500 (1Y Alpha)</div>
      <svg viewBox={`0 0 ${W} ${sorted.length * BAR_H + 10}`} className="w-full" style={{ height: sorted.length * BAR_H + 10 }}>
        {/* Zero line */}
        <line x1={MID} y1={0} x2={MID} y2={sorted.length * BAR_H + 10} stroke="#ffffff20" strokeWidth={1} />

        {sorted.map((p, i) => {
          const barLen = (Math.abs(p.alpha) / maxAbs) * (BAR_W / 2 - 4);
          const positive = p.alpha >= 0;
          const bx = positive ? MID : MID - barLen;
          const y = i * BAR_H + 4;
          return (
            <g key={p.name}>
              {/* ETF label */}
              <text x={LBL_W - 4} y={y + BAR_H / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={9}>
                {p.etf}
              </text>
              {/* Bar */}
              <rect x={bx} y={y + 3} width={barLen} height={BAR_H - 8} rx={2}
                fill={positive ? "#10b981" : "#ef4444"} opacity={0.75} />
              {/* Value */}
              <text
                x={positive ? MID + barLen + 3 : MID - barLen - 3}
                y={y + BAR_H / 2 + 4}
                textAnchor={positive ? "start" : "end"}
                fill={positive ? "#10b981" : "#ef4444"}
                fontSize={8}
              >
                {fmt(p.alpha)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Top 3 Stocks mini table ────────────────────────────────────────────────────

function TopStocksPanel({ sectorName, perfs }: { sectorName: string; perfs: SectorPerf[] }) {
  const stocks = TOP_STOCKS[sectorName as SectorName];
  const rng = useMemo(() => {
    const r = seededRng(3131 + sectorName.length * 7);
    return () => r();
  }, [sectorName]);

  const rows = useMemo(
    () =>
      stocks.map((s) => ({
        ...s,
        chg: (rng() - 0.5) * 6,
        mktCap: (10 + rng() * 990).toFixed(0),
      })),
    [stocks, rng],
  );

  if (!stocks) return null;
  const perf = perfs.find((p) => p.name === sectorName);

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Holdings — {sectorName}</span>
        {perf && (
          <span className={cn("text-xs font-medium tabular-nums", retColor(perf.ret1d))}>
            {fmt(perf.ret1d)} today
          </span>
        )}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/30">
            <th className="pb-1 text-left text-[10px] font-medium text-muted-foreground">Ticker</th>
            <th className="pb-1 text-left text-[10px] font-medium text-muted-foreground">Name</th>
            <th className="pb-1 text-right text-[10px] font-medium text-muted-foreground">1D Chg</th>
            <th className="pb-1 text-right text-[10px] font-medium text-muted-foreground">Mkt Cap ($B)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ticker} className="border-b border-border/20 last:border-0">
              <td className="py-1 font-mono font-semibold text-primary">{r.ticker}</td>
              <td className="py-1 text-muted-foreground">{r.name}</td>
              <td className="py-1 text-right">
                <RetCell v={r.chg} />
              </td>
              <td className="py-1 text-right text-muted-foreground">{r.mktCap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Economic Cycle Wheel SVG ──────────────────────────────────────────────────

function CycleWheel() {
  const CX = 250, CY = 250, R_OUTER = 200, R_INNER = 90, R_LABEL = 235;

  function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  // Needle arrow for current phase
  const needleEnd = polarToXY(CURRENT_PHASE_ANGLE, R_INNER - 10);
  const needleBase1 = polarToXY(CURRENT_PHASE_ANGLE + 90, 10);
  const needleBase2 = polarToXY(CURRENT_PHASE_ANGLE - 90, 10);

  const SECTOR_NAMES = SECTORS.map((s) => s.name);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Economic Cycle Wheel</div>
      <svg viewBox="0 0 500 500" width={440} height={440}>
        {/* Phase arcs — 4 quadrants */}
        {CYCLE_PHASES.map((phase, i) => {
          const startAngle = (i * 90 - 90) * (Math.PI / 180);
          const endAngle   = ((i + 1) * 90 - 90) * (Math.PI / 180);
          const arcColors  = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];
          const r = (R_OUTER + R_INNER) / 2;
          const cx1 = CX + R_OUTER * Math.cos(startAngle);
          const cy1 = CY + R_OUTER * Math.sin(startAngle);
          const cx2 = CX + R_OUTER * Math.cos(endAngle);
          const cy2 = CY + R_OUTER * Math.sin(endAngle);
          const ci1 = CX + R_INNER * Math.cos(endAngle);
          const ci2 = CY + R_INNER * Math.sin(endAngle);
          const ci3 = CX + R_INNER * Math.cos(startAngle);
          const ci4 = CY + R_INNER * Math.sin(startAngle);
          const mid = (startAngle + endAngle) / 2;
          const lx = CX + r * Math.cos(mid);
          const ly = CY + r * Math.sin(mid);

          const d = [
            `M ${cx1} ${cy1}`,
            `A ${R_OUTER} ${R_OUTER} 0 0 1 ${cx2} ${cy2}`,
            `L ${ci1} ${ci2}`,
            `A ${R_INNER} ${R_INNER} 0 0 0 ${ci3} ${ci4}`,
            "Z",
          ].join(" ");

          const isCurrentPhase = i === 0;
          return (
            <g key={phase.label}>
              <path d={d} fill={arcColors[i]} opacity={isCurrentPhase ? 0.4 : 0.12} />
              {isCurrentPhase && <path d={d} fill="none" stroke={arcColors[i]} strokeWidth={2} opacity={0.8} />}
              {phase.label.split("\n").map((line, li) => (
                <text
                  key={li}
                  x={lx}
                  y={ly + li * 13 - 6}
                  textAnchor="middle"
                  fill={arcColors[i]}
                  fontSize={11}
                  fontWeight="600"
                  opacity={isCurrentPhase ? 1 : 0.6}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* Dividers */}
        {[0, 90, 180, 270].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={CX + R_INNER * Math.cos(rad)}
              y1={CY + R_INNER * Math.sin(rad)}
              x2={CX + R_OUTER * Math.cos(rad)}
              y2={CY + R_OUTER * Math.sin(rad)}
              stroke="#ffffff20"
              strokeWidth={1}
            />
          );
        })}

        {/* Center circle */}
        <circle cx={CX} cy={CY} r={R_INNER - 2} fill="#0f172a" stroke="#ffffff15" strokeWidth={1} />

        {/* Sector dots + labels */}
        {SECTOR_NAMES.map((sName) => {
          const angle = SECTOR_CYCLE_ANGLES[sName as SectorName];
          const sectorDef = SECTORS.find((s) => s.name === sName)!;
          const isLeader = CURRENT_LEADERS.includes(sName);

          // Dot on the inner edge of the ring
          const dotR = R_INNER + 12;
          const { x: dx, y: dy } = polarToXY(angle, dotR);

          // Label outside
          const { x: lx, y: ly } = polarToXY(angle, R_LABEL);
          const etf = sectorDef.etf;

          return (
            <g key={sName}>
              <circle
                cx={dx} cy={dy} r={isLeader ? 5 : 3}
                fill={isLeader ? sectorDef.color : "#ffffff40"}
                stroke={isLeader ? "#fff" : "none"}
                strokeWidth={1}
              />
              <text
                x={lx} y={ly + 4}
                textAnchor="middle"
                fill={isLeader ? sectorDef.color : "#64748b"}
                fontSize={isLeader ? 10 : 9}
                fontWeight={isLeader ? "700" : "400"}
              >
                {etf}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <polygon
          points={`${needleEnd.x},${needleEnd.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill="#ffffff"
          opacity={0.9}
        />
        <circle cx={CX} cy={CY} r={6} fill="#ffffff" />
        <text x={CX} y={CY + 22} textAnchor="middle" fill="#10b981" fontSize={11} fontWeight="700">
          Early Recovery
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Early Recovery (now)</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400" />Late Recovery</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Early Slowdown</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Recession</span>
      </div>
    </div>
  );
}

// ── Factor Bar Chart SVG ──────────────────────────────────────────────────────

function FactorBarChart({ factorRets }: { factorRets: Record<Factor, number> }) {
  const entries = (Object.entries(factorRets) as [Factor, number][]).sort((a, b) => b[1] - a[1]);
  const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)));
  const W = 480, BAR_H = 28, LBL_W = 110, MID = LBL_W + 160;

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Factor Returns This Quarter</div>
      <svg viewBox={`0 0 ${W} ${entries.length * BAR_H + 16}`} className="w-full" style={{ height: entries.length * BAR_H + 16 }}>
        <line x1={MID} y1={0} x2={MID} y2={entries.length * BAR_H + 16} stroke="#ffffff18" strokeWidth={1} />
        {entries.map(([factor, val], i) => {
          const barLen = (Math.abs(val) / maxAbs) * 150;
          const pos = val >= 0;
          const bx = pos ? MID : MID - barLen;
          const y = i * BAR_H + 6;
          const isWinner = i === 0;
          return (
            <g key={factor}>
              <text x={LBL_W - 6} y={y + BAR_H / 2 + 4} textAnchor="end" fill={isWinner ? "#ffffff" : "#94a3b8"} fontSize={11} fontWeight={isWinner ? "600" : "400"}>
                {factor}
              </text>
              <rect x={bx} y={y + 4} width={barLen} height={BAR_H - 10} rx={3}
                fill={pos ? "#10b981" : "#ef4444"} opacity={isWinner ? 0.9 : 0.6} />
              {isWinner && (
                <rect x={bx - 1} y={y + 3} width={barLen + 2} height={BAR_H - 8} rx={3}
                  fill="none" stroke="#10b981" strokeWidth={1} />
              )}
              <text
                x={pos ? MID + barLen + 4 : MID - barLen - 4}
                y={y + BAR_H / 2 + 4}
                textAnchor={pos ? "start" : "end"}
                fill={pos ? "#10b981" : "#ef4444"}
                fontSize={9}
              >
                {fmt(val)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Factor loadings table ─────────────────────────────────────────────────────

function FactorLoadingsTable({ factorData }: { factorData: SectorFactorData[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 bg-muted/20">
            <th className="py-2 pl-3 pr-4 text-left text-[10px] font-semibold text-muted-foreground">Sector</th>
            {FACTORS.map((f) => (
              <th key={f} className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground">{f}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {factorData.map((row) => (
            <tr key={row.name} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
              <td className="py-1.5 pl-3 pr-4 text-xs font-medium">{row.name}</td>
              {FACTORS.map((f) => {
                const v = row.loadings[f];
                return (
                  <td key={f} className="px-2 py-1.5 text-center">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] tabular-nums font-mono", loadingColor(v))}>
                      {v >= 0 ? "+" : ""}{v.toFixed(1)}
                    </span>
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

// ── Style Box SVG ─────────────────────────────────────────────────────────────

function StyleBox() {
  const W = 320, H = 320, PAD = 40;
  const IW = W - PAD * 2, IH = H - PAD * 2;

  function toSVG(vg: number, ls: number): { x: number; y: number } {
    // vg: -1=value, +1=growth → x
    // ls: -1=large, +1=small → y (inverted: large at top)
    return {
      x: PAD + ((vg + 1) / 2) * IW,
      y: PAD + ((ls + 1) / 2) * IH,
    };
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style Box (Value/Growth × Size)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        {/* 3×3 grid */}
        {[0, 1, 2].map((ci) =>
          [0, 1, 2].map((ri) => (
            <rect
              key={`${ci}-${ri}`}
              x={PAD + ci * (IW / 3)}
              y={PAD + ri * (IH / 3)}
              width={IW / 3}
              height={IH / 3}
              fill={ci === 0 ? "#3b82f615" : ci === 2 ? "#10b98115" : "#6b728015"}
              stroke="#ffffff12"
              strokeWidth={1}
            />
          )),
        )}

        {/* Axis labels */}
        <text x={PAD} y={PAD - 8} textAnchor="middle" fill="#64748b" fontSize={9}>Value</text>
        <text x={PAD + IW / 2} y={PAD - 8} textAnchor="middle" fill="#64748b" fontSize={9}>Blend</text>
        <text x={PAD + IW} y={PAD - 8} textAnchor="middle" fill="#64748b" fontSize={9}>Growth</text>
        <text x={PAD - 8} y={PAD} textAnchor="end" fill="#64748b" fontSize={9} dominantBaseline="middle">Large</text>
        <text x={PAD - 8} y={PAD + IH / 2} textAnchor="end" fill="#64748b" fontSize={9} dominantBaseline="middle">Mid</text>
        <text x={PAD - 8} y={PAD + IH} textAnchor="end" fill="#64748b" fontSize={9} dominantBaseline="middle">Small</text>

        {/* Sector dots */}
        {SECTORS.map((s) => {
          const pos = STYLE_BOX_POSITIONS[s.name];
          const { x, y } = toSVG(pos.vg, pos.ls);
          return (
            <g key={s.name}>
              <circle cx={x} cy={y} r={6} fill={s.color} opacity={0.8} />
              <text x={x} y={y - 9} textAnchor="middle" fill={s.color} fontSize={8} fontWeight="600">
                {s.etf}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Correlation Matrix SVG ────────────────────────────────────────────────────

function CorrelationMatrix({ mat }: { mat: number[][] }) {
  const n = SECTORS.length;
  const CELL = 30;
  const LBL_W = 40;
  const W = LBL_W + n * CELL;
  const H = LBL_W + n * CELL;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 bg-card p-3">
      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sector Correlation Matrix</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: W, height: H }}>
        {/* Column headers */}
        {SECTORS.map((s, ci) => (
          <text
            key={s.etf + "-col"}
            x={LBL_W + ci * CELL + CELL / 2}
            y={LBL_W - 4}
            textAnchor="middle"
            fill="#64748b"
            fontSize={8}
            fontWeight="600"
          >
            {s.etf}
          </text>
        ))}

        {/* Row headers */}
        {SECTORS.map((s, ri) => (
          <text
            key={s.etf + "-row"}
            x={LBL_W - 4}
            y={LBL_W + ri * CELL + CELL / 2 + 3}
            textAnchor="end"
            fill="#64748b"
            fontSize={8}
            fontWeight="600"
          >
            {s.etf}
          </text>
        ))}

        {/* Cells */}
        {mat.map((row, ri) =>
          row.map((c, ci) => {
            const x = LBL_W + ci * CELL;
            const y = LBL_W + ri * CELL;
            const bg = ri === ci ? "#6366f120" : corrColor(c);
            return (
              <g key={`${ri}-${ci}`}>
                <rect x={x} y={y} width={CELL} height={CELL} fill={bg} />
                <text
                  x={x + CELL / 2} y={y + CELL / 2 + 3}
                  textAnchor="middle"
                  fill={ri === ci ? "#6366f1" : "#ffffff"}
                  fontSize={7}
                >
                  {ri === ci ? "—" : c.toFixed(2)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

// ── Portfolio Weights table ────────────────────────────────────────────────────

function PortfolioWeightsTable({
  weights,
}: {
  weights: { name: string; etf: string; ewPct: number; momPct: number; ercPct: number }[];
}) {
  const cols = [
    { key: "ewPct" as const,  label: "Equal Weight",     desc: "1/N — simple diversification" },
    { key: "momPct" as const, label: "Momentum Weight",  desc: "Proportional to recent returns" },
    { key: "ercPct" as const, label: "Risk Parity (ERC)", desc: "Equal risk contribution per sector" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 bg-muted/20">
            <th className="py-2 pl-3 pr-4 text-left text-[10px] font-semibold text-muted-foreground">Sector ETF</th>
            {cols.map((c) => (
              <th key={c.key} className="px-3 py-2 text-right text-[10px] font-semibold text-muted-foreground" title={c.desc}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weights.map((w) => (
            <tr key={w.etf} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
              <td className="py-1.5 pl-3 pr-4">
                <span className="font-mono text-xs font-semibold text-primary">{w.etf}</span>
                <span className="ml-1 text-[10px] text-muted-foreground">{w.name}</span>
              </td>
              {cols.map((c) => (
                <td key={c.key} className="px-3 py-1.5 text-right tabular-nums text-xs text-muted-foreground">
                  {w[c.key].toFixed(1)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── ETF Comparison table ──────────────────────────────────────────────────────

function EtfComparisonTable({
  etfs,
  watchlist,
  onToggleWatch,
}: {
  etfs: SectorEtfData[];
  watchlist: Set<string>;
  onToggleWatch: (etf: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 bg-muted/20">
            <th className="py-2 pl-3 pr-4 text-left text-[10px] font-semibold text-muted-foreground">ETF</th>
            <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">AUM ($B)</th>
            <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">Exp Ratio</th>
            <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">Div Yield</th>
            <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">P/E</th>
            <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">Beta</th>
            <th className="px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">52W Ret</th>
            <th className="px-2 py-2 text-left  text-[10px] font-semibold text-muted-foreground">Top Holding</th>
            <th className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground">Watch</th>
          </tr>
        </thead>
        <tbody>
          {etfs.map((e) => (
            <tr key={e.etf} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
              <td className="py-1.5 pl-3 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: e.color }} />
                  <span className="font-mono font-semibold text-primary">{e.etf}</span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">{e.name}</span>
                </div>
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">{e.aumB.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{e.expenseRatio.toFixed(2)}%</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-amber-400">{e.divYield.toFixed(2)}%</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{e.pe.toFixed(1)}x</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{e.beta.toFixed(2)}</td>
              <td className="px-2 py-1.5 text-right">
                <RetCell v={e.ret52w} />
              </td>
              <td className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground">{e.topHolding}</td>
              <td className="px-2 py-1.5 text-center">
                <button
                  type="button"
                  onClick={() => onToggleWatch(e.etf)}
                  className={cn(
                    "rounded p-1 transition-colors",
                    watchlist.has(e.etf)
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-muted-foreground/40 hover:text-muted-foreground",
                  )}
                  aria-label={watchlist.has(e.etf) ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {watchlist.has(e.etf) ? <Star className="h-3.5 w-3.5 fill-current" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function SectorsPage() {
  const [selectedSector, setSelectedSector] = useState<string>("Technology");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const { perfs, etfs, factors } = useMemo(() => generateSectorData(), []);
  const correlations = useMemo(() => generateCorrelations(), []);
  const factorRets   = useMemo(() => generateFactorReturns(), []);
  const rotScores    = useMemo(() => computeRotationScores(perfs), [perfs]);
  const portWeights  = useMemo(() => computePortfolioWeights(perfs), [perfs]);
  const tiltRecs     = useMemo(() => sectorTiltRecs(factorRets), [factorRets]);

  const winnerFactors = useMemo(
    () =>
      (Object.entries(factorRets) as [Factor, number][])
        .filter(([, v]) => v > 2)
        .map(([f]) => f),
    [factorRets],
  );

  function toggleWatch(etf: string) {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(etf)) next.delete(etf);
      else next.add(etf);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/40 px-6 py-4">
        <LayoutGrid className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-bold leading-none">Sector Analysis</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">11 GICS Sectors — Performance, Rotation, Factors & ETFs</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            EARLY RECOVERY
          </span>
          <span className="text-[10px]">Current Cycle Phase</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="performance" className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border/40 px-6">
          <TabsList className="h-9 rounded-none bg-transparent p-0 gap-0">
            {[
              { value: "performance", label: "Sector Performance" },
              { value: "rotation",    label: "Rotation Model" },
              { value: "factors",     label: "Factor Exposure" },
              { value: "etfs",        label: "Sector ETFs" },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Tab 1: Sector Performance ─────────────────────────────────────── */}
        <TabsContent value="performance" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
          <div className="mx-auto max-w-5xl space-y-4">
            {/* Heatmap */}
            <SectorHeatmap perfs={perfs} selectedSector={selectedSector} onSelect={setSelectedSector} />

            {/* Performance table + top stocks */}
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <PerformanceTable perfs={perfs} selectedSector={selectedSector} onSelect={setSelectedSector} />
              <div className="flex flex-col gap-4 min-w-[280px]">
                <TopStocksPanel sectorName={selectedSector} perfs={perfs} />
                <RelativeStrengthChart perfs={perfs} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Rotation Model ─────────────────────────────────────────── */}
        <TabsContent value="rotation" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
              {/* Cycle wheel */}
              <CycleWheel />

              {/* Right column */}
              <div className="space-y-4">
                {/* Current leaders */}
                <div className="rounded-lg border border-border/40 bg-card p-4">
                  <div className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Phase Leaders</div>
                  <div className="flex flex-wrap gap-2">
                    {CURRENT_LEADERS.map((l) => {
                      const s = SECTORS.find((x) => x.name === l)!;
                      return (
                        <span
                          key={l}
                          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                          style={{ background: s.color + "30", color: s.color, border: `1px solid ${s.color}50` }}
                        >
                          <TrendingUp className="h-3 w-3" /> {s.etf} — {l}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Rotation scores */}
                <div className="rounded-lg border border-border/40 bg-card p-4">
                  <div className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rotation Score Ranking</div>
                  <div className="space-y-1.5">
                    {rotScores.map((r, i) => {
                      const s = SECTORS.find((x) => x.name === r.name)!;
                      const maxScore = Math.max(...rotScores.map((x) => Math.abs(x.score)));
                      const pct = Math.round(((r.score + maxScore) / (maxScore * 2)) * 100);
                      return (
                        <div key={r.name} className="flex items-center gap-2">
                          <span className="w-4 text-[10px] text-muted-foreground tabular-nums">{i + 1}.</span>
                          <span className="w-10 text-[10px] font-mono font-semibold" style={{ color: s.color }}>{s.etf}</span>
                          <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color, opacity: 0.7 }} />
                          </div>
                          <span className={cn("w-12 text-right text-[10px] tabular-nums font-mono", r.score >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {r.score >= 0 ? "+" : ""}{r.score.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Historical cycles */}
            <div className="rounded-lg border border-border/40 bg-card p-4">
              <div className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Historical Rotation — Past 3 Cycles</div>
              <div className="grid gap-3 sm:grid-cols-3">
                {HISTORICAL_CYCLES.map((cyc) => (
                  <div key={cyc.name} className="rounded border border-border/30 bg-muted/10 p-3">
                    <div className="mb-2 text-[10px] font-semibold text-muted-foreground">{cyc.name}</div>
                    <div className="flex flex-col gap-1">
                      {cyc.leaders.map((l, li) => {
                        const s = SECTORS.find((x) => x.name === l)!;
                        return (
                          <span key={l} className="flex items-center gap-1.5 text-[11px]" style={{ color: s.color }}>
                            <span className="text-muted-foreground">#{li + 1}</span>
                            <span className="font-mono font-semibold">{s.etf}</span>
                            <span className="text-muted-foreground text-[10px]">{l}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Factor Exposure ────────────────────────────────────────── */}
        <TabsContent value="factors" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
          <div className="mx-auto max-w-5xl space-y-4">
            {/* Factor bar chart + style box side by side */}
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <FactorBarChart factorRets={factorRets} />
              <StyleBox />
            </div>

            {/* Factor winners badges + tilt recommendations */}
            <div className="rounded-lg border border-border/40 bg-card p-4">
              <div className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Factor Winners</div>
              <div className="mb-3 flex flex-wrap gap-2">
                {winnerFactors.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No dominant factor this quarter</span>
                ) : (
                  winnerFactors.map((f) => (
                    <span key={f} className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                      <TrendingUp className="h-3 w-3" /> {f}
                    </span>
                  ))
                )}
              </div>
              <div className="space-y-1.5">
                {tiltRecs.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Sector factor loadings table */}
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sector Factor Loadings</div>
              <div className="mb-1 flex gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded bg-emerald-500/30" /> Strong positive loading</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded bg-red-500/30" /> Strong negative loading</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded bg-muted/40" /> Neutral</span>
              </div>
              <FactorLoadingsTable factorData={factors} />
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Sector ETFs ────────────────────────────────────────────── */}
        <TabsContent value="etfs" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
          <div className="mx-auto max-w-6xl space-y-4">
            {/* ETF comparison */}
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sector ETF Comparison</div>
              <EtfComparisonTable etfs={etfs} watchlist={watchlist} onToggleWatch={toggleWatch} />
            </div>

            {/* Correlation matrix + portfolio weights */}
            <div className="grid gap-4 lg:grid-cols-2">
              <CorrelationMatrix mat={correlations} />

              <div className="space-y-3">
                <div>
                  <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Optimal Sector Portfolio</div>
                  <PortfolioWeightsTable weights={portWeights} />
                </div>
                {/* Methodology note */}
                <div className="rounded-lg border border-border/30 bg-muted/10 p-3 text-[10px] text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground/60"><Info className="h-3 w-3" /> Portfolio Construction Methods</div>
                  <div><span className="font-medium text-foreground/50">Equal Weight:</span> 1/N allocation — simple, fully diversified across all 11 sectors.</div>
                  <div><span className="font-medium text-foreground/50">Momentum Weight:</span> Higher allocation to sectors with stronger recent performance.</div>
                  <div><span className="font-medium text-foreground/50">Risk Parity (ERC):</span> Each sector contributes equal portfolio risk — overweights low-vol sectors.</div>
                </div>
              </div>
            </div>

            {/* Watchlist status */}
            {watchlist.size > 0 && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                  <span className="font-semibold text-foreground/80">Watchlist:</span>
                  <span className="font-mono text-primary">{[...watchlist].join(", ")}</span>
                  <span className="text-muted-foreground">added to your sector ETF watchlist</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
