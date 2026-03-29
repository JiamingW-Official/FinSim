"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Activity,
  Info,
  Calculator,
  Home,
  Briefcase,
  Server,
  Heart,
  Hotel,
  Warehouse,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 822;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Interfaces ────────────────────────────────────────────────────────────────

type Sector =
  | "Office"
  | "Retail"
  | "Residential"
  | "Industrial"
  | "Healthcare"
  | "Data Center"
  | "Hotel"
  | "Diversified";

interface REITEntry {
  ticker: string;
  name: string;
  sector: Sector;
  price: number;
  divYield: number;
  ffoPerShare: number;
  pFfo: number;
  navPremDisc: number; // % — negative = discount
  marketCap: number; // $B
  occupancy: number; // %
}

interface QuarterlyDividend {
  quarter: string;
  amount: number;
}

interface PortfolioHolding {
  ticker: string;
  name: string;
  sector: Sector;
  weight: number; // %
  divYield: number;
  beta: number;
}

// ── Static Data (seeded) ──────────────────────────────────────────────────────

const SECTOR_COLORS: Record<Sector, string> = {
  Office: "#6366f1",
  Retail: "#f59e0b",
  Residential: "#10b981",
  Industrial: "#3b82f6",
  Healthcare: "#ec4899",
  "Data Center": "#8b5cf6",
  Hotel: "#f97316",
  Diversified: "#64748b",
};

const SECTOR_ICONS: Record<Sector, React.ReactNode> = {
  Office: <Briefcase className="w-3.5 h-3.5" />,
  Retail: <Home className="w-3.5 h-3.5" />,
  Residential: <Building2 className="w-3.5 h-3.5" />,
  Industrial: <Warehouse className="w-3.5 h-3.5" />,
  Healthcare: <Heart className="w-3.5 h-3.5" />,
  "Data Center": <Server className="w-3.5 h-3.5" />,
  Hotel: <Hotel className="w-3.5 h-3.5" />,
  Diversified: <PieChart className="w-3.5 h-3.5" />,
};

function buildREITs(): REITEntry[] {
  const base: Array<Omit<REITEntry, "price" | "divYield" | "ffoPerShare" | "pFfo" | "navPremDisc" | "occupancy">> = [
    { ticker: "BXP",  name: "Boston Properties",    sector: "Office",       marketCap: 12.4 },
    { ticker: "SPG",  name: "Simon Property Group", sector: "Retail",       marketCap: 42.1 },
    { ticker: "AVB",  name: "AvalonBay Communities", sector: "Residential", marketCap: 28.6 },
    { ticker: "PLD",  name: "Prologis",             sector: "Industrial",   marketCap: 96.3 },
    { ticker: "WELL", name: "Welltower",             sector: "Healthcare",   marketCap: 58.7 },
    { ticker: "EQIX", name: "Equinix",               sector: "Data Center",  marketCap: 72.5 },
    { ticker: "PK",   name: "Park Hotels & Resorts", sector: "Hotel",        marketCap: 3.8  },
    { ticker: "O",    name: "Realty Income",         sector: "Diversified",  marketCap: 44.9 },
  ];

  const yieldRanges: Record<Sector, [number, number]> = {
    Office:        [4.8, 7.2],
    Retail:        [4.5, 6.5],
    Residential:   [2.8, 4.2],
    Industrial:    [2.2, 3.8],
    Healthcare:    [2.0, 3.5],
    "Data Center": [1.8, 2.8],
    Hotel:         [3.5, 6.0],
    Diversified:   [4.2, 6.0],
  };

  const pFfoRanges: Record<Sector, [number, number]> = {
    Office:        [8,  13],
    Retail:        [10, 16],
    Residential:   [18, 26],
    Industrial:    [20, 30],
    Healthcare:    [22, 32],
    "Data Center": [28, 42],
    Hotel:         [9,  16],
    Diversified:   [12, 18],
  };

  return base.map((b) => {
    const [yLo, yHi] = yieldRanges[b.sector];
    const [pLo, pHi] = pFfoRanges[b.sector];
    const divYield = yLo + rand() * (yHi - yLo);
    const pFfo = pLo + rand() * (pHi - pLo);
    const ffoPerShare = 1.5 + rand() * 14;
    const price = ffoPerShare * pFfo;
    const navPremDisc = (rand() - 0.45) * 30;
    const occupancy = 78 + rand() * 20;
    return { ...b, price, divYield, ffoPerShare, pFfo, navPremDisc, occupancy };
  });
}

function buildDividendHistory(): QuarterlyDividend[] {
  const quarters: string[] = [];
  const now = new Date(2026, 2, 1);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
    quarters.push(`Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`);
  }
  let base = 0.52;
  return quarters.map((q) => {
    base = base * (1 + (rand() - 0.35) * 0.04);
    return { quarter: q, amount: Math.max(0.3, base) };
  });
}

function buildPortfolio(): PortfolioHolding[] {
  const holdings: Array<Omit<PortfolioHolding, "weight" | "divYield" | "beta">> = [
    { ticker: "PLD",  name: "Prologis",             sector: "Industrial"  },
    { ticker: "WELL", name: "Welltower",             sector: "Healthcare"  },
    { ticker: "EQIX", name: "Equinix",               sector: "Data Center" },
    { ticker: "O",    name: "Realty Income",         sector: "Diversified" },
    { ticker: "AVB",  name: "AvalonBay Communities", sector: "Residential" },
  ];
  const rawWeights = holdings.map(() => 0.1 + rand() * 0.9);
  const total = rawWeights.reduce((a, b) => a + b, 0);
  return holdings.map((h, i) => ({
    ...h,
    weight: (rawWeights[i] / total) * 100,
    divYield: 2.0 + rand() * 4.0,
    beta: 0.5 + rand() * 0.8,
  }));
}

// ── Pre-compute all data at module level (seeded, stable) ─────────────────────
const REITS = buildREITs();
const DIVIDEND_HISTORY = buildDividendHistory();
const PORTFOLIO = buildPortfolio();

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, d = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtB(n: number): string {
  return `$${n.toFixed(1)}B`;
}

// ── Tab 1: REIT Universe ──────────────────────────────────────────────────────

function REITUniverseTab() {
  const [sortKey, setSortKey] = useState<keyof REITEntry>("divYield");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...REITS].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [sortKey, sortDir]);

  function toggleSort(k: keyof REITEntry) {
    if (k === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(k); setSortDir("desc"); }
  }

  const SortHdr = ({ label, k }: { label: string; k: keyof REITEntry }) => (
    <th
      onClick={() => toggleSort(k)}
      className="px-3 py-2 text-right text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
    >
      {label}
      {sortKey === k ? (sortDir === "desc" ? <ChevronDown className="inline w-3 h-3 ml-0.5" /> : <ChevronUp className="inline w-3 h-3 ml-0.5" />) : ""}
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Div Yield", value: `${fmt(REITS.reduce((a, r) => a + r.divYield, 0) / REITS.length, 1)}%`, icon: <Percent className="w-4 h-4 text-emerald-400" /> },
          { label: "Avg P/FFO",     value: fmt(REITS.reduce((a, r) => a + r.pFfo, 0) / REITS.length, 1) + "x",     icon: <Calculator className="w-4 h-4 text-blue-400" /> },
          { label: "Avg Occupancy", value: `${fmt(REITS.reduce((a, r) => a + r.occupancy, 0) / REITS.length, 1)}%`, icon: <Building2 className="w-4 h-4 text-purple-400" /> },
          { label: "Total Mkt Cap", value: fmtB(REITS.reduce((a, r) => a + r.marketCap, 0)),                        icon: <DollarSign className="w-4 h-4 text-amber-400" /> },
        ].map((s) => (
          <Card key={s.label} className="bg-card/60 border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted/50">{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            REIT Universe — 8 REITs across 8 Sectors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Ticker / Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Sector</th>
                  <SortHdr label="Price"     k="price" />
                  <SortHdr label="Div Yield" k="divYield" />
                  <SortHdr label="FFO/Share" k="ffoPerShare" />
                  <SortHdr label="P/FFO"     k="pFfo" />
                  <SortHdr label="NAV Prem/Disc" k="navPremDisc" />
                  <SortHdr label="Mkt Cap"   k="marketCap" />
                  <SortHdr label="Occupancy" k="occupancy" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const color = SECTOR_COLORS[r.sector];
                  const isPrem = r.navPremDisc >= 0;
                  return (
                    <motion.tr
                      key={r.ticker}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-foreground">{r.ticker}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[160px]">{r.name}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          className="text-xs font-medium gap-1"
                          style={{ backgroundColor: `${color}22`, color, borderColor: `${color}44`, border: "1px solid" }}
                        >
                          {SECTOR_ICONS[r.sector]}
                          {r.sector}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">${fmt(r.price, 2)}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-400 font-semibold">{fmt(r.divYield, 2)}%</td>
                      <td className="px-3 py-2.5 text-right font-mono">${fmt(r.ffoPerShare, 2)}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{fmt(r.pFfo, 1)}x</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={isPrem ? "text-rose-400" : "text-emerald-400"}>
                          {isPrem ? "+" : ""}{fmt(r.navPremDisc, 1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtB(r.marketCap)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{fmt(r.occupancy, 1)}%</span>
                          <div className="w-12">
                            <Progress value={r.occupancy} className="h-1" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sector Legend */}
      <Card className="bg-card/60 border-border/50">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> NAV Premium/Discount = (Market Price − NAV per share) / NAV per share × 100
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SECTOR_COLORS) as Sector[]).map((sec) => (
              <div key={sec} className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTOR_COLORS[sec] }} />
                {sec}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Valuation ──────────────────────────────────────────────────────────

function ValuationTab() {
  const [capRate, setCapRate] = useState(5.5);
  const [noi, setNoi] = useState(12_500_000);

  const nav = useMemo(() => noi / (capRate / 100), [noi, capRate]);
  const sharesOut = 50_000_000;
  const navPerShare = nav / sharesOut;

  // FFO vs AFFO waterfall data (static seeded values)
  const ffoItems = useMemo(() => [
    { label: "Net Income",          value: 3.82,  isBase: true },
    { label: "+ Depreciation",      value: 4.12,  isBase: false },
    { label: "+ Amortization",      value: 0.68,  isBase: false },
    { label: "= FFO/Share",         value: 8.62,  isBase: true },
    { label: "− Recurring CapEx",   value: -0.74, isBase: false },
    { label: "− Straight-line Rent",value: -0.38, isBase: false },
    { label: "+ Stock Comp",        value: 0.22,  isBase: false },
    { label: "= AFFO/Share",        value: 7.72,  isBase: true },
  ], []);

  // P/FFO historical comparison (12 data points)
  const pFfoHistory = useMemo(() => {
    const pts: Array<{ label: string; current: number; avg: number }> = [];
    const sectors: Sector[] = ["Office", "Retail", "Residential", "Industrial", "Healthcare", "Data Center", "Hotel", "Diversified"];
    const avgBase = [11, 14, 22, 24, 27, 34, 12, 15];
    sectors.forEach((sec, i) => {
      const reit = REITS.find((r) => r.sector === sec);
      pts.push({
        label: sec,
        current: reit ? reit.pFfo : avgBase[i] * (0.9 + rand() * 0.2),
        avg: avgBase[i],
      });
    });
    return pts;
  }, []);

  const maxPFfo = Math.max(...pFfoHistory.map((p) => Math.max(p.current, p.avg)));
  const svgW = 560;
  const svgH = 200;
  const barW = 28;
  const gap = 12;
  const groupW = barW * 2 + gap;
  const leftPad = 40;
  const topPad = 16;
  const bottomPad = 60;
  const chartH = svgH - topPad - bottomPad;

  return (
    <div className="space-y-4">
      {/* NAV Calculator */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            NAV Calculator — Cap Rate Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Cap Rate</label>
                  <span className="text-xs font-semibold text-primary">{capRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={3} max={12} step={0.1}
                  value={capRate}
                  onChange={(e) => setCapRate(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>3% (Premium)</span><span>12% (Distressed)</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Annual NOI ($)</label>
                <input
                  type="number"
                  value={noi}
                  onChange={(e) => setNoi(Number(e.target.value))}
                  className="w-full bg-muted/40 border border-border/50 rounded-md px-3 py-1.5 text-sm font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Property Value (NAV)", value: `$${(nav / 1e6).toFixed(2)}M`,   highlight: true },
                { label: "NAV per Share",         value: `$${navPerShare.toFixed(2)}`,    highlight: false },
                { label: "Implied Yield",         value: `${capRate.toFixed(1)}%`,         highlight: false },
                { label: "Shares Outstanding",   value: "50,000,000",                     highlight: false },
              ].map((s) => (
                <Card key={s.label} className={`border-border/40 ${s.highlight ? "bg-primary/10 border-primary/30" : "bg-muted/30"}`}>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-base font-bold font-mono ${s.highlight ? "text-primary" : ""}`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            NAV = NOI ÷ Cap Rate. A lower cap rate reflects higher property values in prime markets; higher cap rates indicate more distressed or secondary markets.
          </p>
        </CardContent>
      </Card>

      {/* FFO vs AFFO Waterfall */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            FFO vs AFFO Waterfall (per share)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-1.5 min-w-[320px]">
              {ffoItems.map((item, i) => {
                const isNeg = item.value < 0;
                const abs = Math.abs(item.value);
                const maxVal = 8.62;
                const pct = (abs / maxVal) * 100;
                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-44 shrink-0 text-right text-muted-foreground">{item.label}</div>
                    <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className={`h-full rounded ${
                          item.isBase
                            ? "bg-primary/70"
                            : isNeg
                            ? "bg-rose-500/60"
                            : "bg-emerald-500/60"
                        }`}
                      />
                    </div>
                    <div className={`w-14 text-right font-mono font-semibold shrink-0 ${
                      item.isBase ? "text-primary" : isNeg ? "text-rose-400" : "text-emerald-400"
                    }`}>
                      {isNeg ? "-" : item.isBase ? "" : "+"}{fmt(abs, 2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            AFFO (Adjusted FFO) is a cleaner measure of cash available for dividends — it adjusts for recurring capital expenditures and non-cash items.
          </p>
        </CardContent>
      </Card>

      {/* P/FFO vs Historical Average */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            P/FFO vs Historical Average by Sector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[420px]">
              {/* Y grid */}
              {[0, 10, 20, 30, 40].map((v) => {
                const y = topPad + chartH - (v / maxPFfo) * chartH;
                if (v > maxPFfo) return null;
                return (
                  <g key={v}>
                    <line x1={leftPad} x2={svgW - 8} y1={y} y2={y} stroke="#334155" strokeWidth={0.5} strokeDasharray="3,3" />
                    <text x={leftPad - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#64748b">{v}x</text>
                  </g>
                );
              })}
              {pFfoHistory.map((d, i) => {
                const x = leftPad + i * (groupW + 16) + 8;
                const curH = (d.current / maxPFfo) * chartH;
                const avgH = (d.avg / maxPFfo) * chartH;
                const curY = topPad + chartH - curH;
                const avgY = topPad + chartH - avgH;
                const overvalued = d.current > d.avg;
                return (
                  <g key={d.label}>
                    {/* Current bar */}
                    <rect
                      x={x} y={curY} width={barW} height={curH}
                      fill={overvalued ? "#f59e0b88" : "#6366f188"}
                      rx={2}
                    />
                    {/* Avg bar */}
                    <rect
                      x={x + barW + 4} y={avgY} width={barW} height={avgH}
                      fill="#475569aa"
                      rx={2}
                    />
                    {/* Values */}
                    <text x={x + barW / 2} y={curY - 3} textAnchor="middle" fontSize={7.5} fill={overvalued ? "#f59e0b" : "#818cf8"}>
                      {d.current.toFixed(1)}x
                    </text>
                    <text x={x + barW + 4 + barW / 2} y={avgY - 3} textAnchor="middle" fontSize={7.5} fill="#94a3b8">
                      {d.avg.toFixed(1)}x
                    </text>
                    {/* X label */}
                    <text x={x + groupW / 2 + 2} y={svgH - bottomPad + 14} textAnchor="middle" fontSize={7} fill="#94a3b8"
                      transform={`rotate(-35 ${x + groupW / 2 + 2} ${svgH - bottomPad + 14})`}
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
              {/* Legend */}
              <rect x={svgW - 130} y={topPad} width={10} height={8} fill="#f59e0b88" rx={1} />
              <text x={svgW - 116} y={topPad + 7} fontSize={8} fill="#94a3b8">Current (above avg)</text>
              <rect x={svgW - 130} y={topPad + 14} width={10} height={8} fill="#6366f188" rx={1} />
              <text x={svgW - 116} y={topPad + 21} fontSize={8} fill="#94a3b8">Current (below avg)</text>
              <rect x={svgW - 130} y={topPad + 28} width={10} height={8} fill="#475569aa" rx={1} />
              <text x={svgW - 116} y={topPad + 35} fontSize={8} fill="#94a3b8">Historical Avg</text>
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Dividends ──────────────────────────────────────────────────────────

function DividendsTab() {
  const [selected, setSelected] = useState<string | null>(null);

  // Pick one REIT for detail view (default: Realty Income)
  const focusReit = REITS.find((r) => r.ticker === "O") ?? REITS[0];

  const divHistory = DIVIDEND_HISTORY;
  const maxAmt = Math.max(...divHistory.map((d) => d.amount));
  const latestAmt = divHistory[divHistory.length - 1].amount;
  const firstAmt = divHistory[0].amount;
  const totalGrowth = ((latestAmt - firstAmt) / firstAmt) * 100;
  const cagr = (Math.pow(latestAmt / firstAmt, 4 / 11) - 1) * 100; // 11 quarters ≈ 2.75y → annualize
  const payoutRatio = (focusReit.divYield / 100 * focusReit.price) / focusReit.ffoPerShare * 100;
  const affoPayout = payoutRatio * 0.88; // AFFO ≈ 88% of FFO
  const sustainScore = Math.min(100, Math.max(0, 120 - affoPayout));

  const svgW = 520;
  const svgH = 160;
  const leftPad = 36;
  const topPad = 12;
  const bottomPad = 32;
  const chartH = svgH - topPad - bottomPad;
  const barW = (svgW - leftPad - 8) / divHistory.length - 3;

  return (
    <div className="space-y-4">
      {/* REIT selector chips */}
      <Card className="bg-card/60 border-border/50">
        <CardContent className="p-3 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground my-auto">Viewing:</span>
          {REITS.map((r) => (
            <Button
              key={r.ticker}
              size="sm"
              variant={selected === r.ticker ? "default" : "outline"}
              className="h-6 text-xs px-2"
              onClick={() => setSelected(r.ticker === selected ? null : r.ticker)}
            >
              {r.ticker}
            </Button>
          ))}
          <span className="text-xs text-muted-foreground my-auto ml-1">(using {focusReit.ticker} data for illustration)</span>
        </CardContent>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Latest Quarterly Div", value: `$${fmt(latestAmt, 3)}`,           icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
          { label: "3Y Div CAGR",          value: `${cagr.toFixed(1)}%`,             icon: <TrendingUp className="w-4 h-4 text-blue-400" /> },
          { label: "AFFO Payout Ratio",    value: `${fmt(affoPayout, 1)}%`,          icon: <Percent className="w-4 h-4 text-amber-400" /> },
          { label: "Sustainability Score", value: `${sustainScore.toFixed(0)} / 100`, icon: <Activity className="w-4 h-4 text-purple-400" /> },
        ].map((s) => (
          <Card key={s.label} className="bg-card/60 border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted/50">{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dividend history bar chart */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Dividend History — 12 Quarters ({focusReit.ticker})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[380px]">
              {/* Y grid */}
              {[0, 0.2, 0.4, 0.6, 0.8].map((v) => {
                const scaleV = v * (maxAmt / 0.8);
                if (scaleV > maxAmt * 1.05) return null;
                const y = topPad + chartH - (scaleV / maxAmt) * chartH;
                return (
                  <g key={v}>
                    <line x1={leftPad} x2={svgW - 4} y1={y} y2={y} stroke="#1e293b" strokeWidth={0.6} />
                    <text x={leftPad - 3} y={y + 3} textAnchor="end" fontSize={7.5} fill="#64748b">${scaleV.toFixed(2)}</text>
                  </g>
                );
              })}
              {/* Bars */}
              {divHistory.map((d, i) => {
                const x = leftPad + i * (barW + 3);
                const h = (d.amount / maxAmt) * chartH;
                const y = topPad + chartH - h;
                const isLast = i === divHistory.length - 1;
                return (
                  <g key={d.quarter}>
                    <rect
                      x={x} y={y} width={barW} height={h}
                      fill={isLast ? "#10b981" : "#10b98160"}
                      rx={1.5}
                    />
                    <text
                      x={x + barW / 2}
                      y={svgH - bottomPad + 12}
                      textAnchor="middle"
                      fontSize={6.5}
                      fill="#64748b"
                      transform={`rotate(-40 ${x + barW / 2} ${svgH - bottomPad + 12})`}
                    >
                      {d.quarter}
                    </text>
                  </g>
                );
              })}
              {/* Growth trend line */}
              {(() => {
                const pts = divHistory.map((d, i) => {
                  const x = leftPad + i * (barW + 3) + barW / 2;
                  const y = topPad + chartH - (d.amount / maxAmt) * chartH;
                  return `${x},${y}`;
                });
                return <polyline points={pts.join(" ")} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3,2" opacity={0.7} />;
              })()}
            </svg>
          </div>
          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
            <span>Total growth over period: <span className={totalGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}>{totalGrowth >= 0 ? "+" : ""}{totalGrowth.toFixed(1)}%</span></span>
            <span>Annualized CAGR: <span className="text-blue-400">{cagr.toFixed(2)}%</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Sustainability Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Dividend Sustainability Gauge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <svg viewBox="0 0 200 130" className="w-full max-w-xs">
                {/* Arc background */}
                {[
                  { color: "#ef4444", from: 180, to: 240 },
                  { color: "#f59e0b", from: 120, to: 180 },
                  { color: "#10b981", from: 60, to: 120 },
                ].map((arc, i) => {
                  const toRad = (deg: number) => (deg * Math.PI) / 180;
                  const cx = 100; const cy = 100; const r = 70;
                  const x1 = cx + r * Math.cos(toRad(arc.from));
                  const y1 = cy + r * Math.sin(toRad(arc.from));
                  const x2 = cx + r * Math.cos(toRad(arc.to));
                  const y2 = cy + r * Math.sin(toRad(arc.to));
                  return (
                    <path
                      key={i}
                      d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                      fill="none" stroke={arc.color} strokeWidth={14} strokeLinecap="round" opacity={0.25}
                    />
                  );
                })}
                {/* Needle arc (score 0-100 maps to 180→0 degrees) */}
                {(() => {
                  const toRad = (deg: number) => (deg * Math.PI) / 180;
                  const cx = 100; const cy = 100; const r = 70;
                  const angleDeg = 180 - (sustainScore / 100) * 120;
                  const nx = cx + 58 * Math.cos(toRad(angleDeg));
                  const ny = cy + 58 * Math.sin(toRad(angleDeg));
                  const needleColor = sustainScore >= 67 ? "#10b981" : sustainScore >= 33 ? "#f59e0b" : "#ef4444";
                  return (
                    <>
                      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={needleColor} strokeWidth={2.5} strokeLinecap="round" />
                      <circle cx={cx} cy={cy} r={5} fill={needleColor} />
                      <text x={cx} y={cy - 20} textAnchor="middle" fontSize={22} fontWeight="bold" fill={needleColor}>
                        {sustainScore.toFixed(0)}
                      </text>
                      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={8} fill="#94a3b8">/ 100</text>
                    </>
                  );
                })()}
                {/* Labels */}
                <text x={28} y={108} fontSize={8} fill="#ef4444">Risky</text>
                <text x={82} y={35} fontSize={8} fill="#f59e0b">Caution</text>
                <text x={150} y={108} fontSize={8} fill="#10b981">Safe</text>
              </svg>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">AFFO Payout Ratio</span>
                <span className={affoPayout > 90 ? "text-rose-400" : affoPayout > 75 ? "text-amber-400" : "text-emerald-400"}>
                  {fmt(affoPayout, 1)}%
                </span>
              </div>
              <Progress value={affoPayout} className="h-1.5" />
              <p className="text-muted-foreground">
                Payout ratios below 80% AFFO are generally considered sustainable for REITs. Above 90% signals risk.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Dividend Analysis — Key Concepts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {[
              { term: "FFO Payout Ratio", desc: "Dividends paid as % of FFO. REITs must distribute 90%+ of taxable income to maintain REIT status.", value: `${fmt(payoutRatio, 1)}%` },
              { term: "AFFO Payout Ratio", desc: "More conservative; uses AFFO (after maintenance CapEx). Better indicator of long-term sustainability.", value: `${fmt(affoPayout, 1)}%` },
              { term: "Dividend CAGR",     desc: "Compound annual growth rate of dividends over the trailing period.", value: `${cagr.toFixed(2)}%/yr` },
              { term: "Coverage Ratio",    desc: "AFFO per share ÷ Annual dividend per share. >1.0x means dividend is covered.", value: `${fmt(100 / affoPayout, 2)}x` },
            ].map((item) => (
              <div key={item.term} className="p-2 bg-muted/20 rounded-md">
                <div className="flex justify-between mb-0.5">
                  <span className="font-medium text-foreground">{item.term}</span>
                  <span className="font-mono text-primary">{item.value}</span>
                </div>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 4: Portfolio ──────────────────────────────────────────────────────────

function PortfolioTab() {
  const portfolio = PORTFOLIO;
  const blendedYield = portfolio.reduce((a, h) => a + (h.weight / 100) * h.divYield, 0);
  const blendedBeta  = portfolio.reduce((a, h) => a + (h.weight / 100) * h.beta, 0);

  // Donut SVG
  const donutCx = 80;
  const donutCy = 80;
  const donutR = 62;
  const donutInner = 38;

  function sectorArc(startAngle: number, endAngle: number, cx: number, cy: number, ro: number, ri: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + ro * Math.cos(toRad(startAngle));
    const y1 = cy + ro * Math.sin(toRad(startAngle));
    const x2 = cx + ro * Math.cos(toRad(endAngle));
    const y2 = cy + ro * Math.sin(toRad(endAngle));
    const x3 = cx + ri * Math.cos(toRad(endAngle));
    const y3 = cy + ri * Math.sin(toRad(endAngle));
    const x4 = cx + ri * Math.cos(toRad(startAngle));
    const y4 = cy + ri * Math.sin(toRad(startAngle));
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${ro} ${ro} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ri} ${ri} 0 ${large} 0 ${x4} ${y4} Z`;
  }

  let cumAngle = -90;
  const arcs = portfolio.map((h) => {
    const span = (h.weight / 100) * 360;
    const start = cumAngle;
    const end = cumAngle + span;
    cumAngle = end;
    return { ...h, start, end };
  });

  // Correlation / sensitivity table
  const corrData = [
    { factor: "S&P 500 (Equity)",     corr: 0.62,  note: "Moderate positive — REITs are equities" },
    { factor: "Agg Bond Index",        corr: -0.18, note: "Slight negative — interest rate sensitivity" },
    { factor: "Inflation (CPI)",       corr: 0.41,  note: "Positive — leases often include CPI escalators" },
    { factor: "10Y Treasury Yield",    corr: -0.55, note: "Negative — higher rates compress valuations" },
  ];

  const rateSensData = [
    { label: "−200 bps", impact: +18.4 },
    { label: "−100 bps", impact: +9.1 },
    { label: "Flat",     impact: 0 },
    { label: "+100 bps", impact: -8.6 },
    { label: "+200 bps", impact: -16.3 },
    { label: "+300 bps", impact: -23.1 },
  ];

  const maxRateImpact = Math.max(...rateSensData.map((d) => Math.abs(d.impact)));

  return (
    <div className="space-y-4">
      {/* Portfolio summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Holdings",        value: `${portfolio.length} REITs`,     icon: <Building2 className="w-4 h-4 text-primary" /> },
          { label: "Blended Yield",   value: `${blendedYield.toFixed(2)}%`,  icon: <Percent className="w-4 h-4 text-emerald-400" /> },
          { label: "Portfolio Beta",  value: blendedBeta.toFixed(2),          icon: <Activity className="w-4 h-4 text-amber-400" /> },
          { label: "Sector Spread",   value: `${portfolio.length} Sectors`,  icon: <PieChart className="w-4 h-4 text-purple-400" /> },
        ].map((s) => (
          <Card key={s.label} className="bg-card/60 border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted/50">{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sector allocation donut */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Sector Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0">
                {arcs.map((arc) => (
                  <path
                    key={arc.ticker}
                    d={sectorArc(arc.start, arc.end, donutCx, donutCy, donutR, donutInner)}
                    fill={SECTOR_COLORS[arc.sector]}
                    opacity={0.85}
                    stroke="#0f172a"
                    strokeWidth={1.5}
                  />
                ))}
                <text x={donutCx} y={donutCy - 5} textAnchor="middle" fontSize={9} fill="#94a3b8">Blended</text>
                <text x={donutCx} y={donutCy + 8} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#f1f5f9">
                  {blendedYield.toFixed(1)}%
                </text>
                <text x={donutCx} y={donutCy + 19} textAnchor="middle" fontSize={8} fill="#64748b">yield</text>
              </svg>
              <div className="space-y-1.5 flex-1">
                {portfolio.map((h) => (
                  <div key={h.ticker} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SECTOR_COLORS[h.sector] }} />
                    <span className="font-medium w-10">{h.ticker}</span>
                    <div className="flex-1 h-1.5 bg-muted/30 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${h.weight}%`, backgroundColor: SECTOR_COLORS[h.sector] }}
                      />
                    </div>
                    <span className="text-muted-foreground w-10 text-right">{h.weight.toFixed(1)}%</span>
                    <span className="text-emerald-400 w-10 text-right">{h.divYield.toFixed(1)}%</span>
                  </div>
                ))}
                <div className="pt-1 flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-2 h-1.5 bg-muted/50 rounded" /> Weight</span>
                  <span className="text-emerald-400">% = Div Yield</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Correlation table */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Portfolio Correlations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {corrData.map((c) => {
                const isPos = c.corr >= 0;
                const pct = Math.abs(c.corr) * 100;
                return (
                  <div key={c.factor} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{c.factor}</span>
                      <span className={isPos ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                        {isPos ? "+" : ""}{c.corr.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted/20 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded ${isPos ? "bg-emerald-500/60" : "bg-rose-500/60"}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{c.note}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interest rate sensitivity */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            Interest Rate Sensitivity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg viewBox="0 0 520 120" className="w-full min-w-[380px]">
              {/* Zero line */}
              <line x1={40} x2={512} y1={60} y2={60} stroke="#334155" strokeWidth={0.8} />
              <text x={36} y={63} textAnchor="end" fontSize={8} fill="#64748b">0</text>

              {/* Y grid */}
              {[-20, -10, 10, 20].map((v) => {
                const y = 60 - (v / maxRateImpact) * 50;
                return (
                  <g key={v}>
                    <line x1={40} x2={512} y1={y} y2={y} stroke="#1e293b" strokeWidth={0.5} strokeDasharray="2,3" />
                    <text x={36} y={y + 3} textAnchor="end" fontSize={7.5} fill="#64748b">{v > 0 ? "+" : ""}{v}%</text>
                  </g>
                );
              })}

              {/* Bars */}
              {rateSensData.map((d, i) => {
                const bw = 52;
                const x = 48 + i * (bw + 14);
                const isPos = d.impact >= 0;
                const h = Math.abs(d.impact / maxRateImpact) * 50;
                const y = isPos ? 60 - h : 60;
                return (
                  <g key={d.label}>
                    <motion.rect
                      initial={{ height: 0, y: 60 }}
                      animate={{ height: h, y }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      x={x} width={bw} rx={2}
                      fill={isPos ? "#10b98180" : "#ef444480"}
                    />
                    <text x={x + bw / 2} y={isPos ? y - 3 : y + h + 10} textAnchor="middle" fontSize={8}
                      fill={isPos ? "#10b981" : "#ef4444"}>
                      {d.impact > 0 ? "+" : ""}{d.impact.toFixed(1)}%
                    </text>
                    <text x={x + bw / 2} y={108} textAnchor="middle" fontSize={8} fill="#94a3b8">{d.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            Estimated portfolio NAV impact based on duration-adjusted rate sensitivity. REITs with long-term fixed-rate debt are less sensitive to rate moves than those with floating-rate obligations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default function REITsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            REIT Analysis & Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real Estate Investment Trust valuation, sector analysis, dividend sustainability, and portfolio construction
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live Sim
          </Badge>
          <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
            8 REITs
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="universe">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="universe" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            REIT Universe
          </TabsTrigger>
          <TabsTrigger value="valuation" className="text-xs gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            Valuation
          </TabsTrigger>
          <TabsTrigger value="dividends" className="text-xs gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Dividends
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs gap-1.5">
            <PieChart className="w-3.5 h-3.5" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universe" className="mt-4 data-[state=inactive]:hidden">
          <REITUniverseTab />
        </TabsContent>
        <TabsContent value="valuation" className="mt-4 data-[state=inactive]:hidden">
          <ValuationTab />
        </TabsContent>
        <TabsContent value="dividends" className="mt-4 data-[state=inactive]:hidden">
          <DividendsTab />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-4 data-[state=inactive]:hidden">
          <PortfolioTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
