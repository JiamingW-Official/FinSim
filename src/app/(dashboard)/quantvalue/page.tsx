"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Filter,
  Star,
  Award,
  Target,
  Layers,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 742005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function rng(min: number, max: number) {
  return min + rand() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ValueStock {
  ticker: string;
  company: string;
  sector: string;
  price: number;
  bookValue: number;
  eps: number;
  ebit: number;
  ev: number;
  fcf: number;
  marketCap: number;
  netCurrentAssets: number;
  totalDebt: number;
  cash: number;
  roic: number;
  roe: number;
  fScore: number;
  earningsStability: number;
  // computed
  pb: number;
  pe: number;
  evEbit: number;
  fcfYield: number;
  grahamNumber: number;
  isNetNet: boolean;
  evEbitda: number;
  operatingEarnings: number;
  acquirerMultiple: number;
}

interface YearReturn {
  year: number;
  valueReturn: number;
  marketReturn: number;
  spread: number;
  drawdown: number;
}

// ── Data Generation ───────────────────────────────────────────────────────────

const TICKERS = [
  ["VRNT", "Verint Systems", "Technology"],
  ["BGFV", "Big 5 Sporting", "Consumer"],
  ["PRTY", "Party City", "Retail"],
  ["NXST", "Nexstar Media", "Media"],
  ["GFF", "Griffon Corp", "Industrial"],
  ["MATX", "Matson Inc", "Transport"],
  ["LBRT", "Liberty Oilfield", "Energy"],
  ["PRMW", "Primo Water", "Consumer"],
  ["WNC", "Wabash National", "Industrial"],
  ["SXI", "Standex Intl", "Industrial"],
  ["QUAD", "Quad/Graphics", "Media"],
  ["CMRE", "Costamare Inc", "Shipping"],
  ["HCCI", "Heritage Crystal", "Industrial"],
  ["SPTN", "SpartanNash", "Retail"],
  ["AMWD", "American Woodmark", "Construction"],
  ["BOOT", "Boot Barn", "Retail"],
  ["PATK", "Patrick Indus", "Construction"],
  ["KELYA", "Kelly Services", "Staffing"],
  ["TBI", "TrueBlue Inc", "Staffing"],
  ["PFGC", "Performance Food", "Distribution"],
  ["ACCO", "ACCO Brands", "Office"],
  ["DXPE", "DXP Enterprises", "Industrial"],
  ["KFY", "Korn Ferry", "Professional"],
  ["FWRD", "Forward Air", "Logistics"],
  ["BCPC", "Balchem Corp", "Specialty Chem"],
] as const;

function generateStocks(): ValueStock[] {
  return TICKERS.map(([ticker, company, sector]) => {
    const price = rng(8, 85);
    const eps = rng(0.5, 8);
    const bookValue = rng(5, 60);
    const pe = price / eps;
    const pb = price / bookValue;
    const grahamNumber = Math.sqrt(22.5 * eps * bookValue);
    const marketCap = rng(300, 4000);
    const totalDebt = rng(50, 800);
    const cash = rng(20, 300);
    const ev = marketCap + totalDebt - cash;
    const ebit = rng(30, 500);
    const evEbit = ev / ebit;
    const fcf = rng(20, 400);
    const fcfYield = (fcf / marketCap) * 100;
    const netCurrentAssets = rng(-50, 200);
    const isNetNet = netCurrentAssets > marketCap * 0.8;
    const evEbitda = ev / (ebit * rng(1.1, 1.5));
    const operatingEarnings = ebit * rng(0.85, 0.98);
    const acquirerMultiple = ev / operatingEarnings;
    const roic = rng(5, 40);
    const roe = rng(8, 45);
    const fScore = Math.floor(rng(3, 9.9));
    const earningsStability = rng(0.3, 1.0);

    return {
      ticker,
      company,
      sector,
      price,
      bookValue,
      eps,
      ebit,
      ev,
      fcf,
      marketCap,
      netCurrentAssets,
      totalDebt,
      cash,
      roic,
      roe,
      fScore,
      earningsStability,
      pb,
      pe,
      evEbit,
      fcfYield,
      grahamNumber,
      isNetNet,
      evEbitda,
      operatingEarnings,
      acquirerMultiple,
    };
  });
}

function generateYearlyReturns(): YearReturn[] {
  const years: YearReturn[] = [];
  let peak = 100;
  let nav = 100;
  for (let i = 0; i < 20; i++) {
    const year = 2006 + i;
    const valueReturn = rng(-28, 42);
    const marketReturn = rng(-38, 35);
    const spread = valueReturn - marketReturn;
    nav *= 1 + valueReturn / 100;
    peak = Math.max(peak, nav);
    const drawdown = ((nav - peak) / peak) * 100;
    years.push({ year, valueReturn, marketReturn, spread, drawdown });
  }
  return years;
}

const ALL_STOCKS = generateStocks();
const YEARLY_RETURNS = generateYearlyReturns();

// ── Sort Helpers ──────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";

function useSortedData<T>(data: T[], defaultKey: keyof T, defaultDir: SortDir = "asc") {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [data, sortKey, sortDir]);

  function handleSort(key: keyof T) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return { sorted, sortKey, sortDir, handleSort };
}

// ── Shared Components ─────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="w-3 h-3 opacity-20" />;
  return dir === "asc" ? (
    <ChevronUp className="w-3 h-3 text-primary" />
  ) : (
    <ChevronDown className="w-3 h-3 text-primary" />
  );
}

function Th({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  right,
}: {
  label: string;
  col: string;
  sortKey: string;
  sortDir: SortDir;
  onSort: (k: string) => void;
  right?: boolean;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap",
        right ? "text-right" : "text-left"
      )}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon active={sortKey === col} dir={sortDir} />
      </span>
    </th>
  );
}

function Num({ v, decimals = 1, suffix = "", prefix = "", colorize = false }: {
  v: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  colorize?: boolean;
}) {
  const formatted = `${prefix}${Math.abs(v).toFixed(decimals)}${suffix}`;
  if (!colorize) return <span>{formatted}</span>;
  return (
    <span className={v >= 0 ? "text-emerald-400" : "text-red-400"}>
      {v >= 0 ? "+" : "-"}{Math.abs(v).toFixed(decimals)}{suffix}
    </span>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-xs text-muted-foreground font-medium", color)}>
      {label}
    </span>
  );
}

// ── Tab 1: Deep Value Screen ──────────────────────────────────────────────────

function DeepValueScreen() {
  const [filter, setFilter] = useState<"all" | "netnets" | "deepvalue">("all");
  const [showInfo, setShowInfo] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "netnets") return ALL_STOCKS.filter((s) => s.isNetNet);
    if (filter === "deepvalue") return ALL_STOCKS.filter((s) => s.pb < 1.5 && s.pe < 12);
    return ALL_STOCKS;
  }, [filter]);

  const { sorted, sortKey, sortDir, handleSort } = useSortedData(filtered, "pb" as keyof ValueStock);

  // SVG valuation distribution
  const bins = useMemo(() => {
    const buckets: number[] = Array(8).fill(0);
    ALL_STOCKS.forEach((s) => {
      const idx = Math.min(7, Math.floor(s.pb / 0.75));
      buckets[idx]++;
    });
    return buckets;
  }, []);

  const maxBin = Math.max(...bins);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Deep Value Screener</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Graham number, net-nets, and deep value metrics across 25 synthetic stocks</p>
        </div>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1"
        >
          <Info className="w-3.5 h-3.5" />
          Methodology
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p><span className="text-primary font-medium">Graham Number</span> = √(22.5 × EPS × Book Value per share). A stock trading below its Graham number is considered undervalued by Benjamin Graham's classic formula.</p>
              <p><span className="text-primary font-medium">Net-Net</span> = stocks where market cap &lt; net current assets (current assets − all liabilities). Graham's most conservative value criterion.</p>
              <p><span className="text-primary font-medium">EV/EBIT</span> is a capital-structure-neutral valuation ratio; values below 8× historically outperform.</p>
              <p><span className="text-primary font-medium">FCF Yield</span> = free cash flow / market cap. A yield above 8% signals potential undervaluation.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "netnets", "deepvalue"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded text-xs text-muted-foreground font-medium transition-colors",
              filter === f
                ? "bg-primary text-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {f === "all" ? "All Stocks (25)" : f === "netnets" ? "Net-Nets" : "Deep Value (P/B<1.5 P/E<12)"}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground self-center">{sorted.length} results</span>
      </div>

      {/* SVG Distribution */}
      <div className="bg-card border border-border border-l-4 border-l-primary rounded-lg p-6">
        <p className="text-lg text-muted-foreground mb-3">P/B Ratio Distribution</p>
        <svg width="100%" height="80" viewBox="0 0 420 80" preserveAspectRatio="none">
          {bins.map((count, i) => {
            const barH = maxBin > 0 ? (count / maxBin) * 60 : 0;
            const x = i * 52 + 2;
            const isDeep = i < 2;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={70 - barH}
                  width={46}
                  height={barH}
                  rx={3}
                  fill={isDeep ? "#3b82f6" : "#374151"}
                  opacity={0.85}
                />
                <text x={x + 23} y={78} textAnchor="middle" fontSize={8} fill="#6b7280">
                  {(i * 0.75).toFixed(1)}–{((i + 1) * 0.75).toFixed(1)}
                </text>
              </g>
            );
          })}
          <text x={0} y={8} fontSize={9} fill="#3b82f6">Deep value zone</text>
        </svg>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <Th label="Ticker" col="ticker" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} />
              <Th label="Company" col="company" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} />
              <Th label="Price" col="price" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="Graham#" col="grahamNumber" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="P/B" col="pb" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="P/E" col="pe" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="EV/EBIT" col="evEbit" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="FCF Yield" col="fcfYield" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">Flags</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((st, idx) => {
              const belowGraham = st.price < st.grahamNumber;
              return (
                <tr
                  key={st.ticker}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/40 transition-colors",
                    idx % 2 === 0 ? "bg-card/30" : ""
                  )}
                >
                  <td className="px-3 py-2 font-mono text-primary font-medium">{st.ticker}</td>
                  <td className="px-3 py-2 text-muted-foreground">{st.company}</td>
                  <td className="px-3 py-2 text-right text-foreground">${st.price.toFixed(2)}</td>
                  <td className={cn("px-3 py-2 text-right font-medium", belowGraham ? "text-emerald-400" : "text-muted-foreground")}>
                    ${st.grahamNumber.toFixed(2)}
                  </td>
                  <td className={cn("px-3 py-2 text-right", st.pb < 1.5 ? "text-emerald-400" : "text-muted-foreground")}>
                    {st.pb.toFixed(2)}x
                  </td>
                  <td className={cn("px-3 py-2 text-right", st.pe < 12 ? "text-emerald-400" : "text-muted-foreground")}>
                    {st.pe.toFixed(1)}x
                  </td>
                  <td className={cn("px-3 py-2 text-right", st.evEbit < 8 ? "text-emerald-400" : "text-muted-foreground")}>
                    {st.evEbit.toFixed(1)}x
                  </td>
                  <td className={cn("px-3 py-2 text-right", st.fcfYield > 8 ? "text-emerald-400" : "text-muted-foreground")}>
                    {st.fcfYield.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {st.isNetNet && <Badge label="NET-NET" color="bg-muted text-primary" />}
                      {belowGraham && <Badge label="<Graham" color="bg-emerald-900/60 text-emerald-300" />}
                      {st.evEbit < 8 && <Badge label="EV<8x" color="bg-muted text-primary" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 2: Magic Formula ──────────────────────────────────────────────────────

interface MagicStock extends ValueStock {
  roicRank: number;
  eyRank: number;
  combinedRank: number;
  earningsYield: number;
}

function MagicFormula() {
  const ranked = useMemo<MagicStock[]>(() => {
    const withEY = ALL_STOCKS.map((s) => ({
      ...s,
      earningsYield: (s.ebit / s.ev) * 100,
      roicRank: 0,
      eyRank: 0,
      combinedRank: 0,
    }));

    const byROIC = [...withEY].sort((a, b) => b.roic - a.roic);
    byROIC.forEach((s, i) => { s.roicRank = i + 1; });

    const byEY = [...withEY].sort((a, b) => b.earningsYield - a.earningsYield);
    byEY.forEach((s, i) => { s.eyRank = i + 1; });

    return withEY
      .map((s) => ({ ...s, combinedRank: s.roicRank + s.eyRank }))
      .sort((a, b) => a.combinedRank - b.combinedRank);
  }, []);

  const { sorted, sortKey, sortDir, handleSort } = useSortedData(ranked, "combinedRank" as keyof MagicStock);

  // SVG scatter plot
  const W = 400, H = 200;
  const padX = 40, padY = 20;
  const maxRank = 25;
  const scatterStocks = ranked.slice(0, 20);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Magic Formula — Joel Greenblatt</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ranks by <span className="text-primary">Return on Invested Capital</span> + <span className="text-amber-400">Earnings Yield</span> (EBIT/EV). Lower combined rank = better opportunity.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Top Pick", value: ranked[0]?.ticker, sub: `Combined rank: ${ranked[0]?.combinedRank}`, color: "text-emerald-400" },
          { label: "Avg ROIC (Top 10)", value: `${(ranked.slice(0,10).reduce((a,b) => a+b.roic, 0)/10).toFixed(1)}%`, sub: "High quality threshold", color: "text-primary" },
          { label: "Avg EY (Top 10)", value: `${(ranked.slice(0,10).reduce((a,b) => a+b.earningsYield, 0)/10).toFixed(1)}%`, sub: "Above market average", color: "text-amber-400" },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={cn("text-xl font-bold mt-1", c.color)}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Scatter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-2">ROIC Rank vs Earnings Yield Rank (top 20 — lower-left is best)</p>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* Axes */}
          <line x1={padX} y1={H - padY} x2={W - 10} y2={H - padY} stroke="#374151" strokeWidth={1} />
          <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="#374151" strokeWidth={1} />
          <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">ROIC Rank →</text>
          <text x={10} y={H / 2} textAnchor="middle" fontSize={9} fill="#6b7280" transform={`rotate(-90, 10, ${H/2})`}>EY Rank →</text>
          {/* Quadrant */}
          <rect
            x={padX} y={padY}
            width={(W - padX - 10) / 2} height={(H - padY * 2) / 2}
            fill="#16a34a" opacity={0.05} rx={2}
          />
          <text x={padX + 10} y={padY + 14} fontSize={8} fill="#16a34a" opacity={0.6}>Best Zone</text>
          {scatterStocks.map((st) => {
            const cx = padX + ((st.roicRank - 1) / (maxRank - 1)) * (W - padX - 10);
            const cy = (H - padY) - ((st.eyRank - 1) / (maxRank - 1)) * (H - padY * 2);
            const isTop5 = st.combinedRank <= 5;
            return (
              <g key={st.ticker}>
                <circle cx={cx} cy={cy} r={isTop5 ? 5 : 4} fill={isTop5 ? "#f59e0b" : "#3b82f6"} opacity={0.8} />
                {isTop5 && (
                  <text x={cx + 7} y={cy + 4} fontSize={7} fill="#f59e0b">{st.ticker}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <Th label="Rank" col="combinedRank" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="Ticker" col="ticker" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} />
              <Th label="Company" col="company" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} />
              <Th label="ROIC" col="roic" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="ROIC Rank" col="roicRank" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="EY" col="earningsYield" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="EY Rank" col="eyRank" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
              <Th label="Combined" col="combinedRank" sortKey={String(sortKey)} sortDir={sortDir} onSort={handleSort as (k: string) => void} right />
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 15).map((st, idx) => (
              <tr
                key={st.ticker}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/40 transition-colors",
                  idx % 2 === 0 ? "bg-card/30" : ""
                )}
              >
                <td className="px-3 py-2 text-right">
                  {st.combinedRank <= 5 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">{idx + 1}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">{idx + 1}</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-primary font-medium">{st.ticker}</td>
                <td className="px-3 py-2 text-muted-foreground">{st.company}</td>
                <td className="px-3 py-2 text-right text-emerald-400">{st.roic.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-muted-foreground">#{st.roicRank}</td>
                <td className="px-3 py-2 text-right text-amber-400">{st.earningsYield.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-muted-foreground">#{st.eyRank}</td>
                <td className="px-3 py-2 text-right font-medium text-foreground">#{st.combinedRank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Acquirer's Multiple ────────────────────────────────────────────────

function AcquirersMultiple() {
  const sorted = useMemo(() =>
    [...ALL_STOCKS].sort((a, b) => a.acquirerMultiple - b.acquirerMultiple),
    []
  );

  const cheapDecile = sorted.slice(0, 5);
  const avgAM = cheapDecile.reduce((a, b) => a + b.acquirerMultiple, 0) / cheapDecile.length;
  const avgPE = cheapDecile.reduce((a, b) => a + b.pe, 0) / cheapDecile.length;

  // SVG bar comparison
  const W = 420, H = 160, padL = 60, padB = 20;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">The Acquirer&apos;s Multiple</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          EV / Operating Earnings — the metric used by activist investors. Removes accounting distortions that inflate P/E ratios.
        </p>
      </div>

      <div className="bg-muted/40 border border-border rounded-lg p-3 text-sm text-muted-foreground">
        <span className="text-amber-400 font-medium">Key insight: </span>
        The Acquirer&apos;s Multiple often reveals deeper cheapness than P/E because it uses enterprise value (includes debt) and operating earnings (removes interest/tax manipulation). Historically, the cheapest decile by AM has outperformed by 4–7% annually.
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Cheapest AM</p>
          <p className="text-xl font-medium text-emerald-400 mt-1">{sorted[0]?.acquirerMultiple.toFixed(1)}x</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sorted[0]?.ticker}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Avg AM (top 5)</p>
          <p className="text-xl font-medium text-primary mt-1">{avgAM.toFixed(1)}x</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cheapest decile</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Avg P/E (top 5)</p>
          <p className="text-xl font-medium text-amber-400 mt-1">{avgPE.toFixed(1)}x</p>
          <p className="text-xs text-muted-foreground mt-0.5">P/E by comparison</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">AM/PE Divergence</p>
          <p className={cn("text-xl font-medium mt-1", avgPE - avgAM > 3 ? "text-red-400" : "text-muted-foreground")}>
            {(avgPE - avgAM).toFixed(1)}x
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Debt burden signal</p>
        </div>
      </div>

      {/* Comparison bar chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-2">AM vs P/E Comparison — Top 10 (blue = AM, amber = P/E)</p>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {sorted.slice(0, 10).map((st, i) => {
            const maxVal = 30;
            const amW = Math.min((st.acquirerMultiple / maxVal) * (W - padL - 10), W - padL - 10);
            const peW = Math.min((st.pe / maxVal) * (W - padL - 10), W - padL - 10);
            const rowH = 13;
            const y = padB + i * (rowH * 2 + 4);
            return (
              <g key={st.ticker}>
                <text x={padL - 4} y={y + rowH - 2} textAnchor="end" fontSize={8} fill="#9ca3af">{st.ticker}</text>
                <rect x={padL} y={y} width={amW} height={rowH} rx={2} fill="#3b82f6" opacity={0.8} />
                <text x={padL + amW + 3} y={y + rowH - 2} fontSize={7} fill="#3b82f6">{st.acquirerMultiple.toFixed(1)}x</text>
                <rect x={padL} y={y + rowH + 1} width={peW} height={rowH} rx={2} fill="#f59e0b" opacity={0.6} />
                <text x={padL + peW + 3} y={y + rowH * 2} fontSize={7} fill="#f59e0b">{st.pe.toFixed(1)}x</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Rank</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Ticker</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Company</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Sector</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">EV ($M)</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Op. Earnings</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Acq. Multiple</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">P/E</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Δ vs P/E</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((st, idx) => {
              const delta = st.pe - st.acquirerMultiple;
              const isTopDecile = idx < 3;
              return (
                <tr
                  key={st.ticker}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/40 transition-colors",
                    isTopDecile ? "bg-emerald-950/20" : idx % 2 === 0 ? "bg-card/30" : ""
                  )}
                >
                  <td className="px-3 py-2 text-muted-foreground text-xs">{idx + 1}</td>
                  <td className="px-3 py-2 font-mono text-primary font-medium">{st.ticker}</td>
                  <td className="px-3 py-2 text-muted-foreground">{st.company}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{st.sector}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">${st.ev.toFixed(0)}M</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">${st.operatingEarnings.toFixed(0)}M</td>
                  <td className={cn("px-3 py-2 text-right font-medium", isTopDecile ? "text-emerald-400" : "text-muted-foreground")}>
                    {st.acquirerMultiple.toFixed(1)}x
                  </td>
                  <td className="px-3 py-2 text-right text-amber-400">{st.pe.toFixed(1)}x</td>
                  <td className={cn("px-3 py-2 text-right text-xs", delta > 5 ? "text-red-400" : delta < 0 ? "text-emerald-400" : "text-muted-foreground")}>
                    {delta > 0 ? "+" : ""}{delta.toFixed(1)}x
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Quality Value Blend ────────────────────────────────────────────────

interface QVStock extends ValueStock {
  valueScore: number;
  qualityScore: number;
  compositeScore: number;
}

function QualityValueBlend() {
  const stocks = useMemo<QVStock[]>(() => {
    const pb_values = ALL_STOCKS.map((s) => s.pb);
    const evEbitda_values = ALL_STOCKS.map((s) => s.evEbitda);
    const roic_values = ALL_STOCKS.map((s) => s.roic);
    const fScore_values = ALL_STOCKS.map((s) => s.fScore);
    const es_values = ALL_STOCKS.map((s) => s.earningsStability);

    const normalize = (val: number, arr: number[], lower = true) => {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const norm = (val - min) / (max - min);
      return lower ? 1 - norm : norm;
    };

    return ALL_STOCKS.map((s) => {
      const valueScore =
        (normalize(s.pb, pb_values, true) * 50 +
          normalize(s.evEbitda, evEbitda_values, true) * 50);
      const qualityScore =
        (normalize(s.roic, roic_values, false) * 40 +
          normalize(s.fScore, fScore_values, false) * 30 +
          normalize(s.earningsStability, es_values, false) * 30);
      const compositeScore = valueScore * 0.5 + qualityScore * 0.5;
      return { ...s, valueScore, qualityScore, compositeScore };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }, []);

  const [selected, setSelected] = useState<string | null>(null);
  const selectedStock = stocks.find((s) => s.ticker === selected);

  // SVG quadrant
  const W = 380, H = 220, pad = 40;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Quality-Value Blend</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Composite score combining value (P/B, EV/EBITDA) with quality (ROIC, Piotroski F-Score, earnings stability).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Quadrant chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Quality-Value Quadrant (click to select)</p>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            <line x1={pad} y1={(H - pad) / 2 + 10} x2={W - 10} y2={(H - pad) / 2 + 10} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
            <line x1={(W - pad) / 2 + 20} y1={10} x2={(W - pad) / 2 + 20} y2={H - pad} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
            {/* Axes */}
            <line x1={pad} y1={H - pad} x2={W - 10} y2={H - pad} stroke="#4b5563" strokeWidth={1} />
            <line x1={pad} y1={10} x2={pad} y2={H - pad} stroke="#4b5563" strokeWidth={1} />
            {/* Labels */}
            <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">Value Score →</text>
            <text x={10} y={H / 2} textAnchor="middle" fontSize={9} fill="#6b7280" transform={`rotate(-90, 10, ${H/2})`}>Quality Score →</text>
            {/* Quadrant labels */}
            <text x={W - 65} y={22} fontSize={7} fill="#16a34a" opacity={0.7}>Quality+Value</text>
            <text x={pad + 4} y={22} fontSize={7} fill="#3b82f6" opacity={0.7}>Quality only</text>
            <text x={W - 65} y={H - pad - 10} fontSize={7} fill="#f59e0b" opacity={0.7}>Value only</text>
            <text x={pad + 4} y={H - pad - 10} fontSize={7} fill="#6b7280" opacity={0.7}>Avoid</text>
            {stocks.map((st) => {
              const cx = pad + (st.valueScore / 100) * (W - pad - 10);
              const cy = (H - pad) - (st.qualityScore / 100) * (H - pad - 10);
              const isTop = stocks.indexOf(st) < 5;
              const isSel = st.ticker === selected;
              return (
                <g key={st.ticker} onClick={() => setSelected(isSel ? null : st.ticker)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={cx} cy={cy} r={isSel ? 7 : isTop ? 5 : 4}
                    fill={isSel ? "#f59e0b" : isTop ? "#16a34a" : "#3b82f6"}
                    opacity={isSel ? 1 : 0.7}
                    stroke={isSel ? "#fbbf24" : "none"}
                    strokeWidth={1.5}
                  />
                  {(isTop || isSel) && (
                    <text x={cx + 7} y={cy + 4} fontSize={7} fill={isSel ? "#fbbf24" : "#4ade80"}>{st.ticker}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected detail or top list */}
        <div className="bg-card border border-border rounded-lg p-4">
          {selectedStock ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-primary font-medium text-lg">{selectedStock.ticker}</span>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-muted-foreground text-xs">✕ close</button>
              </div>
              <p className="text-sm text-muted-foreground">{selectedStock.company}</p>
              <div className="space-y-2">
                {[
                  { label: "Composite Score", value: selectedStock.compositeScore.toFixed(1), color: "text-amber-400" },
                  { label: "Value Score", value: selectedStock.valueScore.toFixed(1), color: "text-primary" },
                  { label: "Quality Score", value: selectedStock.qualityScore.toFixed(1), color: "text-emerald-400" },
                  { label: "P/B Ratio", value: `${selectedStock.pb.toFixed(2)}x`, color: "text-foreground" },
                  { label: "EV/EBITDA", value: `${selectedStock.evEbitda.toFixed(1)}x`, color: "text-foreground" },
                  { label: "ROIC", value: `${selectedStock.roic.toFixed(1)}%`, color: "text-foreground" },
                  { label: "F-Score", value: `${selectedStock.fScore}/9`, color: selectedStock.fScore >= 7 ? "text-emerald-400" : selectedStock.fScore < 5 ? "text-red-400" : "text-foreground" },
                  { label: "Earnings Stability", value: `${(selectedStock.earningsStability * 100).toFixed(0)}%`, color: "text-foreground" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={cn("font-medium", row.color)}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-3">Top 10 Quality-Value Stocks</p>
              <div className="space-y-1.5">
                {stocks.slice(0, 10).map((st, idx) => (
                  <div
                    key={st.ticker}
                    onClick={() => setSelected(st.ticker)}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer group"
                  >
                    <span className="w-5 text-center text-xs text-muted-foreground">{idx + 1}</span>
                    <span className="font-mono text-primary text-sm w-14">{st.ticker}</span>
                    <div className="flex-1">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${st.compositeScore}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 w-8 text-right">{st.compositeScore.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Rank</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Ticker</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Company</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Value Score</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Quality Score</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Composite</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">P/B</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">EV/EBITDA</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">ROIC</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">F-Score</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((st, idx) => (
              <tr
                key={st.ticker}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer",
                  selected === st.ticker ? "bg-amber-950/20" : idx % 2 === 0 ? "bg-card/30" : ""
                )}
                onClick={() => setSelected(st.ticker === selected ? null : st.ticker)}
              >
                <td className="px-3 py-2 text-muted-foreground text-xs">{idx + 1}</td>
                <td className="px-3 py-2 font-mono text-primary font-medium">{st.ticker}</td>
                <td className="px-3 py-2 text-muted-foreground">{st.company}</td>
                <td className="px-3 py-2 text-right text-primary">{st.valueScore.toFixed(1)}</td>
                <td className="px-3 py-2 text-right text-emerald-400">{st.qualityScore.toFixed(1)}</td>
                <td className="px-3 py-2 text-right font-medium text-amber-400">{st.compositeScore.toFixed(1)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{st.pb.toFixed(2)}x</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{st.evEbitda.toFixed(1)}x</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{st.roic.toFixed(1)}%</td>
                <td className={cn("px-3 py-2 text-right font-medium", st.fScore >= 7 ? "text-emerald-400" : st.fScore < 5 ? "text-red-400" : "text-muted-foreground")}>
                  {st.fScore}/9
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 5: Backtested Performance ─────────────────────────────────────────────

function BacktestedPerformance() {
  const [showDrawdown, setShowDrawdown] = useState(false);

  const cumulativeValue = useMemo(() => {
    let vNav = 100, mNav = 100;
    return YEARLY_RETURNS.map((yr) => {
      vNav *= 1 + yr.valueReturn / 100;
      mNav *= 1 + yr.marketReturn / 100;
      return { ...yr, vNav, mNav };
    });
  }, []);

  const totalValueReturn = cumulativeValue[cumulativeValue.length - 1]?.vNav ?? 100;
  const totalMarketReturn = cumulativeValue[cumulativeValue.length - 1]?.mNav ?? 100;
  const avgAnnualValue = YEARLY_RETURNS.reduce((a, b) => a + b.valueReturn, 0) / YEARLY_RETURNS.length;
  const avgAnnualMarket = YEARLY_RETURNS.reduce((a, b) => a + b.marketReturn, 0) / YEARLY_RETURNS.length;
  const maxDrawdown = Math.min(...YEARLY_RETURNS.map((y) => y.drawdown));

  const W = 520, H = 180, padL = 45, padB = 25, padR = 15, padT = 15;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allNavs = [...cumulativeValue.map((d) => d.vNav), ...cumulativeValue.map((d) => d.mNav)];
  const navMin = Math.min(...allNavs) * 0.95;
  const navMax = Math.max(...allNavs) * 1.02;

  function navToY(nav: number) {
    return padT + chartH - ((nav - navMin) / (navMax - navMin)) * chartH;
  }

  const vPoints = cumulativeValue.map((d, i) =>
    `${padL + (i / (cumulativeValue.length - 1)) * chartW},${navToY(d.vNav)}`
  ).join(" ");

  const mPoints = cumulativeValue.map((d, i) =>
    `${padL + (i / (cumulativeValue.length - 1)) * chartW},${navToY(d.mNav)}`
  ).join(" ");

  // Drawdown chart
  const ddMin = Math.min(...YEARLY_RETURNS.map((y) => y.drawdown));
  const ddPoints = YEARLY_RETURNS.map((d, i) =>
    `${padL + (i / (YEARLY_RETURNS.length - 1)) * chartW},${padT + chartH - ((d.drawdown - ddMin) / (0 - ddMin)) * chartH}`
  ).join(" ");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Backtested Value Factor Performance</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Simulated 20-year performance of quantitative value strategy vs. market. Seeded PRNG, illustrative only.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "20Y Total Return (Value)", value: `${(totalValueReturn - 100).toFixed(0)}%`, color: "text-emerald-400" },
          { label: "20Y Total Return (Mkt)", value: `${(totalMarketReturn - 100).toFixed(0)}%`, color: "text-primary" },
          { label: "Avg Annual Spread", value: `+${(avgAnnualValue - avgAnnualMarket).toFixed(1)}%`, color: "text-amber-400" },
          { label: "Max Drawdown", value: `${maxDrawdown.toFixed(1)}%`, color: "text-red-400" },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={cn("text-xl font-medium mt-1", k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Chart toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowDrawdown(false)}
          className={cn("px-3 py-1 text-xs rounded", !showDrawdown ? "bg-primary text-foreground" : "bg-muted text-muted-foreground")}
        >
          NAV Growth
        </button>
        <button
          onClick={() => setShowDrawdown(true)}
          className={cn("px-3 py-1 text-xs rounded", showDrawdown ? "bg-red-700 text-foreground" : "bg-muted text-muted-foreground")}
        >
          Drawdown Profile
        </button>
      </div>

      {/* Line chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <AnimatePresence mode="wait">
          {!showDrawdown ? (
            <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-400 inline-block" /> Value Strategy</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-primary inline-block" /> Market</span>
              </div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
                {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                  const nav = navMin + t * (navMax - navMin);
                  const y = navToY(nav);
                  return (
                    <g key={t}>
                      <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="2,2" />
                      <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#6b7280">{nav.toFixed(0)}</text>
                    </g>
                  );
                })}
                {cumulativeValue.map((d, i) => {
                  if (i % 4 === 0) {
                    const x = padL + (i / (cumulativeValue.length - 1)) * chartW;
                    return <text key={d.year} x={x} y={H - 6} textAnchor="middle" fontSize={8} fill="#6b7280">{d.year}</text>;
                  }
                  return null;
                })}
                {/* Area fill */}
                <polyline points={vPoints} fill="none" stroke="#4ade80" strokeWidth={1.5} />
                <polyline points={mPoints} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4,2" />
                {/* End labels */}
                <text x={W - padR + 2} y={navToY(cumulativeValue[cumulativeValue.length - 1]?.vNav ?? 100) + 4} fontSize={8} fill="#4ade80">
                  {(cumulativeValue[cumulativeValue.length - 1]?.vNav ?? 100).toFixed(0)}
                </text>
                <text x={W - padR + 2} y={navToY(cumulativeValue[cumulativeValue.length - 1]?.mNav ?? 100) + 4} fontSize={8} fill="#60a5fa">
                  {(cumulativeValue[cumulativeValue.length - 1]?.mNav ?? 100).toFixed(0)}
                </text>
              </svg>
            </motion.div>
          ) : (
            <motion.div key="dd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs text-muted-foreground mb-2">Drawdown from peak (%)</p>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
                {/* Zero line */}
                <line x1={padL} y1={padT} x2={W - padR} y2={padT} stroke="#374151" strokeWidth={0.5} />
                <text x={padL - 4} y={padT + 4} textAnchor="end" fontSize={8} fill="#6b7280">0%</text>
                <text x={padL - 4} y={padT + chartH + 4} textAnchor="end" fontSize={8} fill="#6b7280">{ddMin.toFixed(0)}%</text>
                {YEARLY_RETURNS.map((d, i) => {
                  if (i % 4 === 0) {
                    const x = padL + (i / (YEARLY_RETURNS.length - 1)) * chartW;
                    return <text key={d.year} x={x} y={H - 6} textAnchor="middle" fontSize={8} fill="#6b7280">{d.year}</text>;
                  }
                  return null;
                })}
                <polyline points={ddPoints} fill="none" stroke="#f87171" strokeWidth={1.5} />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Annual return table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-left">Year</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Value Return</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Market Return</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Spread</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Drawdown</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Value NAV</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Mkt NAV</th>
            </tr>
          </thead>
          <tbody>
            {cumulativeValue.map((yr, idx) => (
              <tr
                key={yr.year}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/40 transition-colors",
                  idx % 2 === 0 ? "bg-card/30" : ""
                )}
              >
                <td className="px-3 py-2 font-medium text-muted-foreground">{yr.year}</td>
                <td className={cn("px-3 py-2 text-right font-medium", yr.valueReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                  <Num v={yr.valueReturn} suffix="%" colorize />
                </td>
                <td className={cn("px-3 py-2 text-right", yr.marketReturn >= 0 ? "text-primary" : "text-red-400")}>
                  <Num v={yr.marketReturn} suffix="%" colorize />
                </td>
                <td className={cn("px-3 py-2 text-right text-xs", yr.spread >= 0 ? "text-amber-400" : "text-muted-foreground")}>
                  {yr.spread >= 0 ? "+" : ""}{yr.spread.toFixed(1)}%
                </td>
                <td className={cn("px-3 py-2 text-right text-xs", yr.drawdown < -15 ? "text-red-400" : "text-muted-foreground")}>
                  {yr.drawdown.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">{yr.vNav.toFixed(1)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{yr.mNav.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Disclaimer: All data is synthetically generated using seeded PRNG for educational purposes only. Past performance of simulated strategies is not indicative of future results.
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function QuantValuePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-4">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/20 border border-border">
            <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quantitative Value Investing</h1>
            <p className="text-sm text-muted-foreground">Deep value analysis: Graham, Magic Formula, Acquirer&apos;s Multiple, Quality-Value blend</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mt-3">
          {[
            { icon: <Star className="w-3.5 h-3.5" />, label: "Graham Number", color: "text-amber-400 bg-amber-900/20 border-amber-800/40" },
            { icon: <Award className="w-3.5 h-3.5" />, label: "Magic Formula", color: "text-emerald-400 bg-emerald-900/20 border-emerald-800/40" },
            { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Acquirer's Multiple", color: "text-primary bg-muted/40 border-border" },
            { icon: <Layers className="w-3.5 h-3.5" />, label: "Quality-Value Blend", color: "text-primary bg-muted/40 border-border" },
            { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "20Y Backtest", color: "text-rose-400 bg-rose-900/20 border-rose-800/40" },
          ].map((chip) => (
            <span
              key={chip.label}
              className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-muted-foreground border", chip.color)}
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deepvalue">
        <TabsList className="bg-card border border-border mb-4 h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="deepvalue" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Deep Value
          </TabsTrigger>
          <TabsTrigger value="magic" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Magic Formula
          </TabsTrigger>
          <TabsTrigger value="acquirers" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Acquirer&apos;s Multiple
          </TabsTrigger>
          <TabsTrigger value="qualityvalue" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Quality-Value
          </TabsTrigger>
          <TabsTrigger value="backtest" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Backtest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deepvalue" className="data-[state=inactive]:hidden">
          <DeepValueScreen />
        </TabsContent>
        <TabsContent value="magic" className="data-[state=inactive]:hidden">
          <MagicFormula />
        </TabsContent>
        <TabsContent value="acquirers" className="data-[state=inactive]:hidden">
          <AcquirersMultiple />
        </TabsContent>
        <TabsContent value="qualityvalue" className="data-[state=inactive]:hidden">
          <QualityValueBlend />
        </TabsContent>
        <TabsContent value="backtest" className="data-[state=inactive]:hidden">
          <BacktestedPerformance />
        </TabsContent>
      </Tabs>

      {/* Footer note */}
      <div className="mt-8 flex items-start gap-2 p-3 bg-card/50 border border-border rounded-lg">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          All stock data is synthetically generated using a seeded PRNG (seed 742005) for educational and simulation purposes.
          Tickers represent real company names for context but figures do not reflect actual market data.
          Quantitative value investing has empirical academic support (Fama-French, Greenblatt, Tobias Carlisle) but involves significant risk and is not investment advice.
        </p>
      </div>
    </div>
  );
}
