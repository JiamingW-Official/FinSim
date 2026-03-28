"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Calculator,
  BookOpen,
  Home,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  Percent,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmt(n: number, d = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${fmt(n, 0)}`;
}

// ── REIT Data ─────────────────────────────────────────────────────────────────

type REITSubtype = "Diversified" | "Retail" | "Industrial" | "Data Center" | "Healthcare" | "Residential" | "Office";

interface REITDef {
  symbol: string;
  name: string;
  subtype: REITSubtype;
  basePrice: number;
  baseDivYield: number; // %
  baseFfoPerShare: number;
  basePFfo: number;
  baseOccupancy: number; // %
  baseDebtEquity: number;
}

const REIT_DEFS: REITDef[] = [
  { symbol: "VNQ",  name: "Vanguard Real Estate ETF",  subtype: "Diversified",  basePrice: 87.40,  baseDivYield: 4.1,  baseFfoPerShare: 0,     basePFfo: 0,     baseOccupancy: 0,    baseDebtEquity: 0 },
  { symbol: "O",    name: "Realty Income",              subtype: "Retail",       basePrice: 54.20,  baseDivYield: 5.8,  baseFfoPerShare: 4.12,  basePFfo: 13.2,  baseOccupancy: 98.9, baseDebtEquity: 0.82 },
  { symbol: "AMT",  name: "American Tower",             subtype: "Data Center",  basePrice: 192.30, baseDivYield: 3.1,  baseFfoPerShare: 9.84,  basePFfo: 19.5,  baseOccupancy: 97.2, baseDebtEquity: 3.45 },
  { symbol: "PLD",  name: "Prologis",                   subtype: "Industrial",   basePrice: 113.80, baseDivYield: 3.4,  baseFfoPerShare: 5.51,  basePFfo: 20.7,  baseOccupancy: 96.4, baseDebtEquity: 0.67 },
  { symbol: "SPG",  name: "Simon Property Group",       subtype: "Retail",       basePrice: 158.90, baseDivYield: 5.2,  baseFfoPerShare: 12.40, basePFfo: 12.8,  baseOccupancy: 95.8, baseDebtEquity: 2.12 },
  { symbol: "DLR",  name: "Digital Realty",             subtype: "Data Center",  basePrice: 145.60, baseDivYield: 3.3,  baseFfoPerShare: 6.82,  basePFfo: 21.4,  baseOccupancy: 83.5, baseDebtEquity: 1.24 },
  { symbol: "WELL", name: "Welltower",                  subtype: "Healthcare",   basePrice: 128.40, baseDivYield: 2.2,  baseFfoPerShare: 4.03,  basePFfo: 31.9,  baseOccupancy: 85.2, baseDebtEquity: 0.91 },
  { symbol: "PSA",  name: "Public Storage",             subtype: "Industrial",   basePrice: 293.20, baseDivYield: 4.0,  baseFfoPerShare: 16.80, basePFfo: 17.5,  baseOccupancy: 92.1, baseDebtEquity: 0.55 },
  { symbol: "EQR",  name: "Equity Residential",         subtype: "Residential",  basePrice: 68.90,  baseDivYield: 4.1,  baseFfoPerShare: 3.68,  basePFfo: 18.7,  baseOccupancy: 96.2, baseDebtEquity: 0.79 },
  { symbol: "BXP",  name: "Boston Properties",          subtype: "Office",       basePrice: 67.40,  baseDivYield: 5.6,  baseFfoPerShare: 7.12,  basePFfo: 9.5,   baseOccupancy: 89.4, baseDebtEquity: 1.86 },
];

const SUBTYPE_COLORS: Record<REITSubtype, { text: string; bg: string; border: string }> = {
  Diversified:  { text: "text-slate-300",  bg: "bg-slate-500/10",  border: "border-slate-500/30" },
  Retail:       { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30" },
  Industrial:   { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30" },
  "Data Center":{ text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  Healthcare:   { text: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30" },
  Residential:  { text: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30" },
  Office:       { text: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/30" },
};

interface REITRow extends REITDef {
  price: number;
  change1d: number;
  divYield: number;
  ffoPerShare: number;
  pFfo: number;
  occupancy: number;
  debtEquity: number;
}

function buildREITRows(): REITRow[] {
  const rng = seededRandom(dateSeed() + 9999);
  return REIT_DEFS.map((def) => {
    const jitter = 1 + (rng() - 0.5) * 0.04;
    const change = (rng() - 0.48) * 3.5;
    return {
      ...def,
      price: def.basePrice * jitter,
      change1d: change,
      divYield: def.baseDivYield + (rng() - 0.5) * 0.2,
      ffoPerShare: def.baseFfoPerShare,
      pFfo: def.basePFfo,
      occupancy: def.baseOccupancy > 0 ? Math.min(99.9, def.baseOccupancy + (rng() - 0.5) * 0.8) : 0,
      debtEquity: def.baseDebtEquity > 0 ? def.baseDebtEquity + (rng() - 0.5) * 0.05 : 0,
    };
  });
}

// ── Tab 1: REIT Market ────────────────────────────────────────────────────────

function REITMarketTab() {
  const rows = useMemo(() => buildREITRows(), []);
  const [sortKey, setSortKey] = useState<keyof REITRow>("divYield");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterSubtype, setFilterSubtype] = useState<REITSubtype | "All">("All");

  const subtypes: Array<REITSubtype | "All"> = ["All", "Diversified", "Retail", "Industrial", "Data Center", "Healthcare", "Residential", "Office"];

  const sorted = useMemo(() => {
    let filtered = rows.filter((r) => filterSubtype === "All" || r.subtype === filterSubtype);
    filtered.sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return filtered;
  }, [rows, sortKey, sortDir, filterSubtype]);

  function toggleSort(k: keyof REITRow) {
    if (k === sortKey) setSortDir((d: "asc" | "desc") => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(k); setSortDir("desc"); }
  }

  const SortHdr = ({ label, k }: { label: string; k: keyof REITRow }) => (
    <th
      className="px-3 py-2 text-right text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => toggleSort(k)}
    >
      {label}
      {sortKey === k ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Subtype filter pills */}
      <div className="flex flex-wrap gap-2">
        {subtypes.map((s) => {
          const active = filterSubtype === s;
          const colors = s !== "All" ? SUBTYPE_COLORS[s as REITSubtype] : null;
          return (
            <button
              key={s}
              onClick={() => setFilterSubtype(s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                active
                  ? s === "All"
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : cn(colors?.bg, colors?.border, colors?.text)
                  : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Div Yield", value: `${fmt(rows.filter(r => r.baseOccupancy > 0).reduce((s, r) => s + r.divYield, 0) / rows.filter(r => r.baseOccupancy > 0).length, 1)}%`, color: "text-green-400" },
          { label: "Avg P/FFO",     value: fmt(rows.filter(r => r.pFfo > 0).reduce((s, r) => s + r.pFfo, 0) / rows.filter(r => r.pFfo > 0).length, 1), color: "text-blue-400" },
          { label: "Avg Occupancy", value: `${fmt(rows.filter(r => r.baseOccupancy > 0).reduce((s, r) => s + r.occupancy, 0) / rows.filter(r => r.baseOccupancy > 0).length, 1)}%`, color: "text-amber-400" },
          { label: "REITs Listed",  value: String(rows.length), color: "text-purple-400" },
        ].map((chip) => (
          <div key={chip.label} className="bg-muted/30 border border-border/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{chip.label}</p>
            <p className={cn("text-lg font-semibold mt-0.5", chip.color)}>{chip.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                <SortHdr label="Price" k="price" />
                <SortHdr label="1D Chg" k="change1d" />
                <SortHdr label="Div Yield" k="divYield" />
                <SortHdr label="FFO/sh" k="ffoPerShare" />
                <SortHdr label="P/FFO" k="pFfo" />
                <SortHdr label="Occupancy" k="occupancy" />
                <SortHdr label="D/E" k="debtEquity" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sorted.map((r) => {
                const sc = SUBTYPE_COLORS[r.subtype];
                const isEtf = r.symbol === "VNQ";
                return (
                  <tr key={r.symbol} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground">{r.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[140px]">{r.name}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", sc.bg, sc.text, sc.border)}>
                        {r.subtype}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium">${fmt(r.price)}</td>
                    <td className={cn("px-3 py-2.5 text-right font-mono text-xs", r.change1d >= 0 ? "text-green-400" : "text-red-400")}>
                      {r.change1d >= 0 ? "+" : ""}{fmt(r.change1d, 2)}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-green-400">{fmt(r.divYield, 2)}%</td>
                    <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                      {isEtf ? "—" : `$${fmt(r.ffoPerShare)}`}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                      {isEtf ? "—" : fmt(r.pFfo, 1) + "x"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isEtf ? <span className="text-muted-foreground">—</span> : (
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", r.occupancy > 95 ? "bg-green-500" : r.occupancy > 88 ? "bg-amber-500" : "bg-red-500")}
                              style={{ width: `${r.occupancy}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{fmt(r.occupancy, 1)}%</span>
                        </div>
                      )}
                    </td>
                    <td className={cn("px-3 py-2.5 text-right font-mono text-xs", isEtf ? "text-muted-foreground" : r.debtEquity > 1.5 ? "text-red-400" : r.debtEquity > 0.8 ? "text-amber-400" : "text-green-400")}>
                      {isEtf ? "—" : fmt(r.debtEquity, 2) + "x"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>D/E: <span className="text-green-400">&lt;0.8 Low</span> / <span className="text-amber-400">0.8–1.5 Mod</span> / <span className="text-red-400">&gt;1.5 High</span></span>
        <span>Occupancy: <span className="text-green-400">&gt;95% Excellent</span> / <span className="text-amber-400">88–95% Good</span> / <span className="text-red-400">&lt;88% Watch</span></span>
        <span>FFO = Funds From Operations (REIT earnings metric)</span>
      </div>
    </div>
  );
}

// ── Tab 2: REIT Calculator ────────────────────────────────────────────────────

const CALC_REITS = REIT_DEFS.filter((r) => r.symbol !== "VNQ");

interface CalcResult {
  totalWithDrip: number[];
  totalNoDrip: number[];
  divIncomeNoDrip: number[];
  divIncomeWithDrip: number[];
  dripShares: number[];
  finalTotalWithDrip: number;
  finalTotalNoDrip: number;
  totalDivNoDrip: number;
  totalDivWithDrip: number;
  dripSharesAccum: number;
  portfolio6040Return: number[];
}

function computeREITCalc(
  investment: number,
  reit: REITDef,
  years: number,
  drip: boolean
): CalcResult {
  const annualDivRate = reit.baseDivYield / 100;
  const priceAppreciation = 0.04; // assumed 4% annual price appreciation
  const portfolio6040Rate = 0.07; // assumed 7% annual return for 60/40

  const totalWithDrip: number[] = [investment];
  const totalNoDrip: number[] = [investment];
  const divIncomeNoDrip: number[] = [0];
  const divIncomeWithDrip: number[] = [0];
  const dripShares: number[] = [investment / reit.basePrice];
  const portfolio6040Return: number[] = [investment];

  let sharesHeld = investment / reit.basePrice;
  let currentPrice = reit.basePrice;
  let cashDivAccum = 0;
  let reinvestedDiv = 0;

  for (let y = 1; y <= years; y++) {
    currentPrice *= 1 + priceAppreciation;
    const divPerShare = currentPrice * annualDivRate;

    // No DRIP: dividends paid as cash
    const divCashYear = sharesHeld * divPerShare;
    cashDivAccum += divCashYear;
    divIncomeNoDrip.push(divCashYear);
    totalNoDrip.push(sharesHeld * currentPrice + cashDivAccum);

    // DRIP: dividends reinvested into new shares
    const dripDivYear = (sharesHeld + reinvestedDiv / currentPrice) * divPerShare;
    reinvestedDiv += dripDivYear;
    const dripSharesTotal = sharesHeld + reinvestedDiv / currentPrice;
    dripShares.push(dripSharesTotal);
    divIncomeWithDrip.push(dripDivYear);
    totalWithDrip.push(dripSharesTotal * currentPrice);

    // 60/40 comparison
    portfolio6040Return.push(investment * Math.pow(1 + portfolio6040Rate, y));
  }

  return {
    totalWithDrip,
    totalNoDrip,
    divIncomeNoDrip,
    divIncomeWithDrip,
    dripShares,
    finalTotalWithDrip: totalWithDrip[years],
    finalTotalNoDrip: totalNoDrip[years],
    totalDivNoDrip: cashDivAccum,
    totalDivWithDrip: reinvestedDiv,
    dripSharesAccum: dripShares[years] - investment / reit.basePrice,
    portfolio6040Return,
  };
}

function REITCalculatorTab() {
  const [investment, setInvestment] = useState(10000);
  const [selectedSymbol, setSelectedSymbol] = useState("O");
  const [years, setYears] = useState(10);
  const [drip, setDrip] = useState(true);

  const reit = useMemo(() => CALC_REITS.find((r) => r.symbol === selectedSymbol)!, [selectedSymbol]);
  const result = useMemo(() => computeREITCalc(investment, reit, years, drip), [investment, reit, years, drip]);

  // SVG chart dimensions
  const W = 560;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 32, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const allValues = [...result.totalWithDrip, ...result.totalNoDrip, ...result.portfolio6040Return];
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(investment * 0.9, ...allValues);

  function toX(i: number) { return PAD.left + (i / years) * cW; }
  function toY(v: number) { return PAD.top + cH - ((v - minVal) / (maxVal - minVal)) * cH; }

  function makePath(data: number[]) {
    return data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  }

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minVal + ((maxVal - minVal) * i) / yTicks);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Investment Amount */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Investment Amount</label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">$</span>
            <input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Math.max(100, Number(e.target.value)))}
              className="flex-1 bg-muted/40 border border-border/40 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-primary/50"
            />
          </div>
          <Slider value={[investment]} onValueChange={([v]) => setInvestment(v)} min={1000} max={500000} step={1000} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$1K</span><span>$500K</span>
          </div>
        </div>

        {/* REIT Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Select REIT</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full bg-muted/40 border border-border/40 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary/50"
          >
            {CALC_REITS.map((r) => (
              <option key={r.symbol} value={r.symbol}>{r.symbol} — {r.name}</option>
            ))}
          </select>
          <div className="flex gap-2 flex-wrap">
            <span className={cn("px-2 py-0.5 rounded text-xs border", SUBTYPE_COLORS[reit.subtype].bg, SUBTYPE_COLORS[reit.subtype].text, SUBTYPE_COLORS[reit.subtype].border)}>{reit.subtype}</span>
            <span className="px-2 py-0.5 rounded text-xs border border-green-500/30 bg-green-500/10 text-green-400">{fmt(reit.baseDivYield, 1)}% yield</span>
          </div>
        </div>

        {/* Hold Years */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Hold Period: <span className="text-foreground">{years} years</span></label>
          <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={1} max={30} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 yr</span><span>30 yrs</span>
          </div>
        </div>

        {/* DRIP Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Dividend Reinvestment (DRIP)</label>
          <div className="flex items-center gap-3 mt-2">
            <Switch checked={drip} onCheckedChange={setDrip} />
            <span className={cn("text-sm font-medium", drip ? "text-green-400" : "text-muted-foreground")}>
              {drip ? "DRIP On" : "DRIP Off"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {drip ? "Dividends automatically reinvested into more shares" : "Dividends paid as cash income"}
          </p>
        </div>
      </div>

      {/* Output metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Final Value (DRIP)", value: fmtCurrency(result.finalTotalWithDrip), color: "text-green-400", sub: `+${fmt((result.finalTotalWithDrip / investment - 1) * 100, 1)}%` },
          { label: "Final Value (No DRIP)", value: fmtCurrency(result.finalTotalNoDrip), color: "text-blue-400", sub: `+${fmt((result.finalTotalNoDrip / investment - 1) * 100, 1)}%` },
          { label: "Total Dividends (DRIP)", value: fmtCurrency(result.totalDivWithDrip), color: "text-amber-400", sub: "Reinvested" },
          { label: "DRIP Shares Gained", value: fmt(result.dripSharesAccum, 1), color: "text-purple-400", sub: `@ ~$${fmt(reit.basePrice * Math.pow(1.04, years), 0)}` },
        ].map((m) => (
          <div key={m.label} className="bg-muted/30 border border-border/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className={cn("text-base font-semibold mt-0.5", m.color)}>{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Growth Over Time vs 60/40 Portfolio</h3>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px]" style={{ minWidth: 320 }}>
            {/* Grid lines */}
            {yTickValues.map((v, i) => (
              <g key={i}>
                <line
                  x1={PAD.left} x2={W - PAD.right}
                  y1={toY(v)} y2={toY(v)}
                  stroke="currentColor" strokeOpacity={0.08} strokeWidth={1}
                />
                <text
                  x={PAD.left - 4} y={toY(v) + 4}
                  textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.5}
                >
                  {v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`}
                </text>
              </g>
            ))}

            {/* X axis labels */}
            {Array.from({ length: Math.min(years, 10) + 1 }, (_, i) => Math.round((i * years) / Math.min(years, 10))).map((yr, i) => (
              <text key={i} x={toX(yr)} y={H - 4} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>
                Yr {yr}
              </text>
            ))}

            {/* 60/40 portfolio line */}
            <path d={makePath(result.portfolio6040Return)} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 3" />

            {/* No DRIP line */}
            <path d={makePath(result.totalNoDrip)} fill="none" stroke="#60a5fa" strokeWidth={2} />

            {/* DRIP line */}
            <path d={makePath(result.totalWithDrip)} fill="none" stroke="#34d399" strokeWidth={2.5} />

            {/* Area under DRIP */}
            <path
              d={`${makePath(result.totalWithDrip)} L${toX(years)},${PAD.top + cH} L${PAD.left},${PAD.top + cH} Z`}
              fill="#34d399" fillOpacity={0.06}
            />
          </svg>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2 text-xs">
          {[
            { color: "#34d399", label: `REIT with DRIP: ${fmtCurrency(result.finalTotalWithDrip)}`, dash: false },
            { color: "#60a5fa", label: `REIT no DRIP: ${fmtCurrency(result.finalTotalNoDrip)}`, dash: false },
            { color: "#6b7280", label: `60/40 Portfolio: ${fmtCurrency(result.portfolio6040Return[years])}`, dash: true },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <svg width={24} height={8}>
                <line x1={0} y1={4} x2={24} y2={4} stroke={l.color} strokeWidth={2} strokeDasharray={l.dash ? "4 3" : undefined} />
              </svg>
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dividend income bars */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Annual Dividend Income by Year</h3>
        <div className="overflow-x-auto">
          {(() => {
            const maxDiv = Math.max(...result.divIncomeWithDrip, ...result.divIncomeNoDrip, 1);
            const barW = Math.max(8, Math.min(24, Math.floor(480 / (years + 1) / 2) - 2));
            const svgW = Math.max(400, (years + 1) * (barW * 2 + 6) + 60);
            const svgH = 140;
            const bPad = { top: 10, right: 10, bottom: 24, left: 50 };
            const bH = svgH - bPad.top - bPad.bottom;
            return (
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ minWidth: 300 }}>
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <g key={i}>
                    <line x1={bPad.left} x2={svgW - bPad.right} y1={bPad.top + bH * (1 - t)} y2={bPad.top + bH * (1 - t)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
                    <text x={bPad.left - 4} y={bPad.top + bH * (1 - t) + 4} textAnchor="end" fontSize={8} fill="currentColor" fillOpacity={0.5}>
                      {fmtCurrency(maxDiv * t)}
                    </text>
                  </g>
                ))}
                {result.divIncomeWithDrip.slice(1).map((vDrip, i) => {
                  const vNo = result.divIncomeNoDrip[i + 1];
                  const x = bPad.left + i * (barW * 2 + 6) + 3;
                  const hDrip = (vDrip / maxDiv) * bH;
                  const hNo = (vNo / maxDiv) * bH;
                  return (
                    <g key={i}>
                      <rect x={x} y={bPad.top + bH - hNo} width={barW} height={hNo} fill="#60a5fa" fillOpacity={0.7} rx={2} />
                      <rect x={x + barW + 1} y={bPad.top + bH - hDrip} width={barW} height={hDrip} fill="#34d399" fillOpacity={0.7} rx={2} />
                      {i % Math.max(1, Math.floor(years / 8)) === 0 && (
                        <text x={x + barW} y={svgH - 6} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.5}>
                          Yr{i + 1}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            );
          })()}
        </div>
        <div className="flex gap-4 text-xs mt-1">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-400/70" /><span className="text-muted-foreground">Without DRIP</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-400/70" /><span className="text-muted-foreground">With DRIP</span></div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Real Estate 101 ────────────────────────────────────────────────────

const EDU_CARDS = [
  {
    id: "what-reits",
    icon: Building2,
    title: "What are REITs?",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    points: [
      "Real Estate Investment Trusts own income-producing real estate or mortgages.",
      "Must distribute at least 90% of taxable income as dividends to shareholders.",
      "Trade on major exchanges like stocks — liquid unlike direct real estate.",
      "Give retail investors access to institutional-quality real estate.",
      "No corporate income tax at REIT level when distribution requirement met.",
    ],
  },
  {
    id: "ffo-vs-eps",
    icon: DollarSign,
    title: "FFO vs EPS",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    points: [
      "Earnings Per Share (EPS) deducts depreciation — misleading for real estate.",
      "Buildings rarely depreciate in value; GAAP EPS understates REIT earnings.",
      "Funds From Operations (FFO) = Net Income + Depreciation − Gains on Sales.",
      "Adjusted FFO (AFFO) further subtracts capital expenditures for maintenance.",
      "P/FFO is the primary valuation metric — equivalent to P/E for regular stocks.",
    ],
  },
  {
    id: "sectors",
    icon: BarChart3,
    title: "REIT Sectors",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    points: [
      "Office: premium depends on work-from-home trends; under pressure post-2020.",
      "Industrial/Logistics: booming from e-commerce growth (Prologis, PSA).",
      "Data Centers: highest growth; AI infrastructure demand (AMT, DLR).",
      "Healthcare: senior living and medical facilities; demographic tailwind.",
      "Retail: malls (SPG) face headwinds; net-lease (O) more defensive.",
      "Residential: apartment REITs benefit from housing unaffordability.",
    ],
  },
  {
    id: "rate-sensitivity",
    icon: Percent,
    title: "Interest Rate Sensitivity",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    points: [
      "REITs are rate-sensitive: higher rates raise borrowing costs, compress valuations.",
      "When 10Y Treasury yield rises, REIT dividend yields look less attractive.",
      "Long-duration assets (data centers, net lease) are most rate-sensitive.",
      "Rate sensitivity cuts both ways: falling rates are a powerful tailwind.",
      "Net Lease REITs often have CPI-linked rent escalators for inflation protection.",
    ],
  },
  {
    id: "evaluation",
    icon: TrendingUp,
    title: "How to Evaluate REITs",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    points: [
      "P/FFO: lower = potentially undervalued vs sector peers.",
      "Dividend Yield: high yield can signal distress — check payout ratio vs AFFO.",
      "Occupancy Rate: >95% is excellent; declining trend is a warning sign.",
      "Debt/Equity: REITs use leverage; compare to sector norms.",
      "Same-store NOI growth: organic growth excluding acquisitions.",
      "Cap Rate spread: property cap rate minus cost of debt = value creation margin.",
    ],
  },
];

function CapRateCalc() {
  const [noi, setNoi] = useState(120000);
  const [capRate, setCapRate] = useState(5.5);
  const propertyValue = noi / (capRate / 100);
  const noiRange = [50000, 100000, 150000, 200000, 250000, 300000];
  const capRange = [3, 4, 5, 6, 7, 8];

  return (
    <div className="bg-muted/20 border border-border/40 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Calculator className="w-4 h-4 text-amber-400" />
        Cap Rate Calculator
      </h3>
      <p className="text-xs text-muted-foreground">Property Value = NOI / Cap Rate</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Net Operating Income (NOI): <span className="text-foreground font-mono">{fmtCurrency(noi)}</span></label>
          <Slider value={[noi]} onValueChange={([v]) => setNoi(v)} min={10000} max={1000000} step={5000} />
          <div className="flex justify-between text-xs text-muted-foreground"><span>$10K</span><span>$1M</span></div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Cap Rate: <span className="text-foreground font-mono">{fmt(capRate, 1)}%</span></label>
          <Slider value={[capRate]} onValueChange={([v]) => setCapRate(v)} min={2} max={12} step={0.1} />
          <div className="flex justify-between text-xs text-muted-foreground"><span>2%</span><span>12%</span></div>
        </div>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
        <p className="text-xs text-muted-foreground">Implied Property Value</p>
        <p className="text-2xl font-bold text-amber-400 font-mono">{fmtCurrency(propertyValue)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          ${fmtCurrency(noi)} NOI @ {fmt(capRate, 1)}% cap rate
        </p>
      </div>

      {/* Cap Rate sensitivity table */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Property Value Sensitivity Table</p>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left text-muted-foreground px-2 py-1">NOI \ Cap Rate</th>
                {capRange.map((c) => (
                  <th key={c} className={cn("text-center px-2 py-1 text-muted-foreground", c === Math.round(capRate) && "text-amber-400 font-bold")}>{c}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {noiRange.map((n) => (
                <tr key={n} className={cn("border-t border-border/20", n === Math.round(noi / 50000) * 50000 && "bg-amber-500/5")}>
                  <td className="px-2 py-1 text-muted-foreground">{fmtCurrency(n)}</td>
                  {capRange.map((c) => {
                    const v = n / (c / 100);
                    const isHighlight = Math.abs(n - noi) < 30000 && Math.abs(c - capRate) < 0.75;
                    return (
                      <td key={c} className={cn("text-center px-2 py-1 font-mono", isHighlight ? "text-amber-400 font-bold" : "text-muted-foreground")}>
                        {v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DCFCalc() {
  const [noi, setNoi] = useState(200000);
  const [growthRate, setGrowthRate] = useState(3);
  const [discountRate, setDiscountRate] = useState(8);
  const [terminalCapRate, setTerminalCapRate] = useState(5.5);
  const [holdYears, setHoldYears] = useState(10);

  const cashFlows = useMemo(() => {
    const cfs: number[] = [];
    for (let y = 1; y <= holdYears; y++) {
      cfs.push(noi * Math.pow(1 + growthRate / 100, y));
    }
    return cfs;
  }, [noi, growthRate, holdYears]);

  const terminalNOI = noi * Math.pow(1 + growthRate / 100, holdYears + 1);
  const terminalValue = terminalNOI / (terminalCapRate / 100);
  const pvCFs = cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + discountRate / 100, i + 1), 0);
  const pvTerminal = terminalValue / Math.pow(1 + discountRate / 100, holdYears);
  const totalPV = pvCFs + pvTerminal;

  const maxCF = Math.max(...cashFlows, pvTerminal / holdYears);
  const barH = 80;

  return (
    <div className="bg-muted/20 border border-border/40 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-purple-400" />
        DCF for Real Estate
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Starting NOI", value: noi, setter: setNoi, min: 10000, max: 2000000, step: 10000, fmt: (v: number) => fmtCurrency(v) },
          { label: "NOI Growth Rate", value: growthRate, setter: setGrowthRate, min: 0, max: 10, step: 0.5, fmt: (v: number) => `${fmt(v, 1)}%` },
          { label: "Discount Rate", value: discountRate, setter: setDiscountRate, min: 3, max: 15, step: 0.5, fmt: (v: number) => `${fmt(v, 1)}%` },
          { label: "Terminal Cap Rate", value: terminalCapRate, setter: setTerminalCapRate, min: 3, max: 10, step: 0.25, fmt: (v: number) => `${fmt(v, 2)}%` },
          { label: "Hold Years", value: holdYears, setter: setHoldYears, min: 3, max: 20, step: 1, fmt: (v: number) => `${v} yrs` },
        ].map((ctrl) => (
          <div key={ctrl.label} className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{ctrl.label}: <span className="text-foreground font-mono">{ctrl.fmt(ctrl.value)}</span></label>
            <Slider value={[ctrl.value]} onValueChange={([v]) => ctrl.setter(v)} min={ctrl.min} max={ctrl.max} step={ctrl.step} />
          </div>
        ))}
      </div>

      {/* Mini bar chart of cash flows */}
      <svg viewBox={`0 0 ${Math.max(300, holdYears * 28 + 40)} ${barH + 24}`} className="w-full">
        {cashFlows.map((cf, i) => {
          const bH = (cf / maxCF) * barH;
          const x = 20 + i * 28;
          return (
            <g key={i}>
              <rect x={x} y={barH - bH} width={20} height={bH} fill="#a78bfa" fillOpacity={0.6} rx={2} />
              {i === holdYears - 1 && (
                <rect x={x} y={0} width={20} height={barH} fill="#a78bfa" fillOpacity={0.15} rx={2} />
              )}
              <text x={x + 10} y={barH + 14} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.5}>
                {i + 1}
              </text>
            </g>
          );
        })}
        <line x1={20} x2={20 + holdYears * 28} y1={barH} y2={barH} stroke="currentColor" strokeOpacity={0.2} />
      </svg>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "PV of Cash Flows", value: fmtCurrency(pvCFs), color: "text-purple-400" },
          { label: "PV of Terminal Value", value: fmtCurrency(pvTerminal), color: "text-blue-400" },
          { label: "Total DCF Value", value: fmtCurrency(totalPV), color: "text-green-400" },
        ].map((m) => (
          <div key={m.label} className="bg-muted/30 rounded-lg p-2.5 text-center">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className={cn("text-sm font-bold font-mono mt-0.5", m.color)}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealEstate101Tab() {
  const [expandedCard, setExpandedCard] = useState<string | null>("what-reits");

  return (
    <div className="space-y-4">
      {/* Educational cards */}
      <div className="grid grid-cols-1 gap-3">
        {EDU_CARDS.map((card) => {
          const Icon = card.icon;
          const expanded = expandedCard === card.id;
          return (
            <div
              key={card.id}
              className={cn("border rounded-lg overflow-hidden transition-all cursor-pointer", card.border, expanded ? card.bg : "border-border/40 bg-muted/10 hover:bg-muted/20")}
              onClick={() => setExpandedCard(expanded ? null : card.id)}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={cn("p-1.5 rounded-md", card.bg)}>
                  <Icon className={cn("w-4 h-4", card.color)} />
                </div>
                <h3 className={cn("text-sm font-semibold flex-1", expanded ? card.color : "text-foreground")}>{card.title}</h3>
                <span className="text-muted-foreground text-xs">{expanded ? "▲" : "▼"}</span>
              </div>
              {expanded && (
                <div className="px-4 pb-3 space-y-1.5">
                  {card.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className={cn("mt-0.5 flex-shrink-0", card.color)}>•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cap Rate Calculator */}
      <CapRateCalc />

      {/* DCF Calculator */}
      <DCFCalc />
    </div>
  );
}

// ── Tab 4: Mortgage Calculator ────────────────────────────────────────────────

interface MortgageInputs {
  homePrice: number;
  downPctg: number;
  rate: number;
  termYears: number;
  propTaxRate: number;
  insuranceRate: number;
  monthlyRent: number;
  annualRentGrowth: number;
  investReturnRate: number;
}

interface MortgageResult {
  loanAmount: number;
  monthlyPrincipalInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  totalMonthly: number;
  amortization: Array<{ month: number; principal: number; interest: number; balance: number; cumPrincipal: number; cumInterest: number }>;
  breakEvenMonth: number | null;
  buyTotalCost: number[];
  rentTotalCost: number[];
}

function computeMortgage(inp: MortgageInputs): MortgageResult {
  const { homePrice, downPctg, rate, termYears, propTaxRate, insuranceRate, monthlyRent, annualRentGrowth, investReturnRate } = inp;
  const downAmt = homePrice * (downPctg / 100);
  const loanAmount = homePrice - downAmt;
  const monthlyRate = rate / 100 / 12;
  const n = termYears * 12;

  // Monthly P&I
  const monthlyPI = loanAmount > 0 && monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    : loanAmount / n;

  const monthlyTax = (homePrice * (propTaxRate / 100)) / 12;
  const monthlyIns = (homePrice * (insuranceRate / 100)) / 12;
  const monthlyPmi = downPctg < 20 ? loanAmount * 0.008 / 12 : 0;
  const totalMonthly = monthlyPI + monthlyTax + monthlyIns + monthlyPmi;

  // Amortization (first n months)
  const amortization: MortgageResult["amortization"] = [];
  let balance = loanAmount;
  let cumPrincipal = 0;
  let cumInterest = 0;
  for (let m = 1; m <= Math.min(n, 360); m++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPI - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    cumPrincipal += principalPayment;
    cumInterest += interestPayment;
    amortization.push({ month: m, principal: principalPayment, interest: interestPayment, balance, cumPrincipal, cumInterest });
  }

  // Rent vs Buy comparison (year-by-year total outlay)
  const buyTotalCost: number[] = [downAmt]; // upfront costs
  const rentTotalCost: number[] = [0];
  let buyRunning = downAmt;
  let rentRunning = 0;
  let currentRent = monthlyRent;
  let downPaymentInvestment = downAmt;
  let breakEvenMonth: number | null = null;

  for (let y = 1; y <= 30; y++) {
    // Buy side: mortgage + tax + insurance - equity buildup
    const yearMortgageCost = totalMonthly * 12;
    const equityBuilt = (amortization[Math.min(y * 12 - 1, amortization.length - 1)]?.cumPrincipal ?? 0);
    buyRunning += yearMortgageCost - equityBuilt / y; // rough yearly cost
    buyTotalCost.push(buyRunning);

    // Rent side: rent + opportunity cost of down payment
    const yearRentCost = currentRent * 12;
    downPaymentInvestment *= 1 + investReturnRate / 100;
    rentRunning += yearRentCost - (downPaymentInvestment - downAmt) / y;
    rentTotalCost.push(rentRunning);
    currentRent *= 1 + annualRentGrowth / 100;

    if (breakEvenMonth === null && buyRunning < rentRunning) {
      breakEvenMonth = y;
    }
  }

  return {
    loanAmount,
    monthlyPrincipalInterest: monthlyPI,
    monthlyTax,
    monthlyInsurance: monthlyIns,
    monthlyPmi,
    totalMonthly,
    amortization,
    breakEvenMonth,
    buyTotalCost,
    rentTotalCost,
  };
}

function MortgageCalculatorTab() {
  const [homePrice, setHomePrice] = useState(450000);
  const [downPctg, setDownPctg] = useState(20);
  const [rate, setRate] = useState(6.75);
  const [termYears, setTermYears] = useState(30);
  const [propTaxRate, setPropTaxRate] = useState(1.2);
  const [insuranceRate, setInsuranceRate] = useState(0.5);
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [annualRentGrowth, setAnnualRentGrowth] = useState(3);
  const [investReturnRate, setInvestReturnRate] = useState(7);
  const [showAmort, setShowAmort] = useState(false);

  const result = useMemo(() => computeMortgage({
    homePrice, downPctg, rate, termYears, propTaxRate, insuranceRate,
    monthlyRent, annualRentGrowth, investReturnRate
  }), [homePrice, downPctg, rate, termYears, propTaxRate, insuranceRate, monthlyRent, annualRentGrowth, investReturnRate]);

  // SVG amortization chart (full term, year summaries)
  const W = 540;
  const H = 180;
  const PAD = { top: 12, right: 12, bottom: 28, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const yearlyData = useMemo(() => {
    const years: Array<{ year: number; principal: number; interest: number; balance: number }> = [];
    for (let y = 0; y < termYears; y++) {
      const startIdx = y * 12;
      const endIdx = Math.min((y + 1) * 12 - 1, result.amortization.length - 1);
      if (startIdx >= result.amortization.length) break;
      const principal = result.amortization[endIdx].cumPrincipal - (startIdx > 0 ? result.amortization[startIdx - 1].cumPrincipal : 0);
      const interest = result.amortization[endIdx].cumInterest - (startIdx > 0 ? result.amortization[startIdx - 1].cumInterest : 0);
      years.push({ year: y + 1, principal, interest, balance: result.amortization[endIdx].balance });
    }
    return years;
  }, [result.amortization, termYears]);

  const maxStacked = Math.max(...yearlyData.map((d) => d.principal + d.interest));
  const maxBalance = result.loanAmount;

  function xPos(i: number) { return PAD.left + (i / (yearlyData.length - 1)) * cW; }
  function yBalance(v: number) { return PAD.top + cH - (v / maxBalance) * cH; }

  const balancePath = yearlyData.map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)},${yBalance(d.balance).toFixed(1)}`).join(" ");

  // Rent vs Buy chart
  const maxRvB = Math.max(...result.buyTotalCost, ...result.rentTotalCost);

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Home Price", value: homePrice, setter: setHomePrice, min: 100000, max: 5000000, step: 5000, display: fmtCurrency(homePrice) },
          { label: `Down Payment (${downPctg}%)`, value: downPctg, setter: setDownPctg, min: 3, max: 50, step: 1, display: `${downPctg}% = ${fmtCurrency(homePrice * downPctg / 100)}` },
          { label: "Interest Rate", value: rate, setter: setRate, min: 2, max: 12, step: 0.125, display: `${fmt(rate, 3)}%` },
          { label: "Loan Term", value: termYears, setter: setTermYears, min: 10, max: 30, step: 5, display: `${termYears} years` },
          { label: "Property Tax Rate", value: propTaxRate, setter: setPropTaxRate, min: 0.3, max: 3, step: 0.1, display: `${fmt(propTaxRate, 1)}%/yr` },
          { label: "Insurance Rate", value: insuranceRate, setter: setInsuranceRate, min: 0.2, max: 1.5, step: 0.1, display: `${fmt(insuranceRate, 1)}%/yr` },
        ].map((ctrl) => (
          <div key={ctrl.label} className="space-y-2">
            <label className="text-xs text-muted-foreground">{ctrl.label}: <span className="text-foreground font-mono text-xs">{ctrl.display}</span></label>
            <Slider value={[ctrl.value]} onValueChange={([v]) => ctrl.setter(v)} min={ctrl.min} max={ctrl.max} step={ctrl.step} />
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Payment Breakdown</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Donut chart SVG */}
          {(() => {
            const segments = [
              { label: "Principal & Interest", value: result.monthlyPrincipalInterest, color: "#60a5fa" },
              { label: "Property Tax", value: result.monthlyTax, color: "#f59e0b" },
              { label: "Insurance", value: result.monthlyInsurance, color: "#34d399" },
              ...(result.monthlyPmi > 0 ? [{ label: "PMI", value: result.monthlyPmi, color: "#f87171" }] : []),
            ];
            const total = segments.reduce((s, sg) => s + sg.value, 0);
            const R = 52;
            const r = 32;
            const cx = 64;
            const cy = 64;
            let angle = -Math.PI / 2;
            const arcs = segments.map((sg) => {
              const slice = (sg.value / total) * 2 * Math.PI;
              const x1 = cx + R * Math.cos(angle);
              const y1 = cy + R * Math.sin(angle);
              angle += slice;
              const x2 = cx + R * Math.cos(angle);
              const y2 = cy + R * Math.sin(angle);
              const x1i = cx + r * Math.cos(angle - slice);
              const y1i = cy + r * Math.sin(angle - slice);
              const x2i = cx + r * Math.cos(angle);
              const y2i = cy + r * Math.sin(angle);
              const large = slice > Math.PI ? 1 : 0;
              return {
                ...sg,
                d: `M${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${x2i.toFixed(1)},${y2i.toFixed(1)} A${r},${r} 0 ${large},0 ${x1i.toFixed(1)},${y1i.toFixed(1)} Z`,
              };
            });
            return (
              <div className="flex items-start gap-4">
                <svg viewBox="0 0 128 128" className="w-24 h-24 flex-shrink-0">
                  {arcs.map((arc) => (
                    <path key={arc.label} d={arc.d} fill={arc.color} fillOpacity={0.85} />
                  ))}
                  <text x={cx} y={cy - 4} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.7}>Total</text>
                  <text x={cx} y={cy + 8} textAnchor="middle" fontSize={10} fontWeight="bold" fill="currentColor">{fmtCurrency(total)}</text>
                  <text x={cx} y={cy + 19} textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.5}>/month</text>
                </svg>
                <div className="space-y-2 flex-1">
                  {segments.map((sg) => (
                    <div key={sg.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sg.color }} />
                        <span className="text-muted-foreground">{sg.label}</span>
                      </div>
                      <span className="font-mono text-foreground">{fmtCurrency(sg.value)}/mo</span>
                    </div>
                  ))}
                  <div className="border-t border-border/30 pt-1 flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Total Monthly</span>
                    <span className="text-blue-400 font-mono">{fmtCurrency(result.totalMonthly)}/mo</span>
                  </div>
                  {result.monthlyPmi > 0 && (
                    <p className="text-xs text-amber-400">PMI required (down &lt; 20%). Drops when equity reaches 20%.</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Amortization chart */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Amortization Schedule</h3>
          <button
            onClick={() => setShowAmort((s) => !s)}
            className="text-xs text-muted-foreground hover:text-foreground border border-border/40 rounded px-2 py-0.5 transition-colors"
          >
            {showAmort ? "Hide table" : "Show first 12 months"}
          </button>
        </div>

        {/* Full amortization SVG (stacked bar by year) */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <g key={i}>
                <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + cH * (1 - t)} y2={PAD.top + cH * (1 - t)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
                <text x={PAD.left - 4} y={PAD.top + cH * (1 - t) + 4} textAnchor="end" fontSize={8} fill="currentColor" fillOpacity={0.5}>
                  {fmtCurrency(maxStacked * t)}
                </text>
              </g>
            ))}

            {yearlyData.map((d, i) => {
              const x = PAD.left + (i / yearlyData.length) * cW;
              const bW = Math.max(2, cW / yearlyData.length - 1);
              const hPrincipal = (d.principal / maxStacked) * cH;
              const hInterest = (d.interest / maxStacked) * cH;
              const showLabel = i === 0 || i === yearlyData.length - 1 || (i + 1) % 5 === 0;
              return (
                <g key={d.year}>
                  <rect x={x} y={PAD.top + cH - hPrincipal - hInterest} width={bW} height={hInterest} fill="#f87171" fillOpacity={0.7} />
                  <rect x={x} y={PAD.top + cH - hPrincipal} width={bW} height={hPrincipal} fill="#60a5fa" fillOpacity={0.7} />
                  {showLabel && (
                    <text x={x + bW / 2} y={H - 6} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.5}>
                      Y{d.year}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Balance line overlay */}
            <path d={balancePath} fill="none" stroke="#34d399" strokeWidth={1.5} strokeDasharray="3 2" />
          </svg>
        </div>
        <div className="flex flex-wrap gap-4 text-xs mt-1">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400/70" /><span className="text-muted-foreground">Interest</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-400/70" /><span className="text-muted-foreground">Principal</span></div>
          <div className="flex items-center gap-1.5">
            <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke="#34d399" strokeWidth={1.5} strokeDasharray="3 2" /></svg>
            <span className="text-muted-foreground">Remaining Balance</span>
          </div>
        </div>

        {/* First 12 months table */}
        {showAmort && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  {["Month", "Payment", "Principal", "Interest", "Balance"].map((h) => (
                    <th key={h} className="text-right px-2 py-1.5 text-muted-foreground font-medium first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {result.amortization.slice(0, 12).map((row) => (
                  <tr key={row.month} className="hover:bg-muted/20">
                    <td className="px-2 py-1.5 text-muted-foreground">{row.month}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmtCurrency(result.monthlyPrincipalInterest)}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-blue-400">{fmtCurrency(row.principal)}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-red-400">{fmtCurrency(row.interest)}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-muted-foreground">{fmtCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rent vs Buy */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Rent vs Buy Comparison</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Monthly Rent", value: monthlyRent, setter: setMonthlyRent, min: 500, max: 10000, step: 100, display: fmtCurrency(monthlyRent) },
            { label: "Annual Rent Growth", value: annualRentGrowth, setter: setAnnualRentGrowth, min: 0, max: 8, step: 0.5, display: `${fmt(annualRentGrowth, 1)}%/yr` },
            { label: "Investment Return (if renting)", value: investReturnRate, setter: setInvestReturnRate, min: 2, max: 12, step: 0.5, display: `${fmt(investReturnRate, 1)}%/yr` },
          ].map((ctrl) => (
            <div key={ctrl.label} className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{ctrl.label}: <span className="text-foreground font-mono">{ctrl.display}</span></label>
              <Slider value={[ctrl.value]} onValueChange={([v]) => ctrl.setter(v)} min={ctrl.min} max={ctrl.max} step={ctrl.step} />
            </div>
          ))}
        </div>

        {result.breakEvenMonth !== null ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Buying becomes cheaper than renting after</p>
            <p className="text-xl font-bold text-green-400">Year {result.breakEvenMonth}</p>
            <p className="text-xs text-muted-foreground">Based on current assumptions (simplified model)</p>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-400">Renting may be more cost-effective under these assumptions over 30 years. Consider adjusting inputs.</p>
          </div>
        )}

        {/* Rent vs Buy line chart */}
        <div className="overflow-x-auto">
          {(() => {
            const RvBW = 540;
            const RvBH = 160;
            const rPad = { top: 12, right: 12, bottom: 28, left: 60 };
            const rcW = RvBW - rPad.left - rPad.right;
            const rcH = RvBH - rPad.top - rPad.bottom;
            const years30 = 30;
            const rMaxVal = Math.max(...result.buyTotalCost.slice(0, 31), ...result.rentTotalCost.slice(0, 31));
            const rMinVal = 0;

            function rX(i: number) { return rPad.left + (i / years30) * rcW; }
            function rY(v: number) { return rPad.top + rcH - ((v - rMinVal) / (rMaxVal - rMinVal)) * rcH; }

            const buyPath = result.buyTotalCost.slice(0, 31).map((v, i) => `${i === 0 ? "M" : "L"}${rX(i).toFixed(1)},${rY(v).toFixed(1)}`).join(" ");
            const rentPath = result.rentTotalCost.slice(0, 31).map((v, i) => `${i === 0 ? "M" : "L"}${rX(i).toFixed(1)},${rY(v).toFixed(1)}`).join(" ");

            const yTickVals = [0, 0.25, 0.5, 0.75, 1].map((t) => rMaxVal * t);

            return (
              <svg viewBox={`0 0 ${RvBW} ${RvBH}`} className="w-full" style={{ minWidth: 300 }}>
                {yTickVals.map((v, i) => (
                  <g key={i}>
                    <line x1={rPad.left} x2={RvBW - rPad.right} y1={rY(v)} y2={rY(v)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
                    <text x={rPad.left - 4} y={rY(v) + 4} textAnchor="end" fontSize={8} fill="currentColor" fillOpacity={0.5}>
                      {fmtCurrency(v)}
                    </text>
                  </g>
                ))}
                {[0, 5, 10, 15, 20, 25, 30].map((yr) => (
                  <text key={yr} x={rX(yr)} y={RvBH - 6} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.5}>Yr{yr}</text>
                ))}
                <path d={rentPath} fill="none" stroke="#f59e0b" strokeWidth={2} />
                <path d={buyPath} fill="none" stroke="#60a5fa" strokeWidth={2} />
                {result.breakEvenMonth !== null && (
                  <line
                    x1={rX(result.breakEvenMonth)} x2={rX(result.breakEvenMonth)}
                    y1={rPad.top} y2={rPad.top + rcH}
                    stroke="#34d399" strokeWidth={1} strokeDasharray="3 2"
                  />
                )}
              </svg>
            );
          })()}
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke="#60a5fa" strokeWidth={2} /></svg>
            <span className="text-muted-foreground">Buying</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke="#f59e0b" strokeWidth={2} /></svg>
            <span className="text-muted-foreground">Renting (net of investment gains)</span>
          </div>
          {result.breakEvenMonth !== null && (
            <div className="flex items-center gap-1.5">
              <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke="#34d399" strokeWidth={1} strokeDasharray="3 2" /></svg>
              <span className="text-muted-foreground">Break-even (Yr {result.breakEvenMonth})</span>
            </div>
          )}
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: "Total Interest Paid", value: fmtCurrency(result.amortization[result.amortization.length - 1]?.cumInterest ?? 0), color: "text-red-400" },
            { label: "Total Cost of Home", value: fmtCurrency((result.amortization[result.amortization.length - 1]?.cumInterest ?? 0) + homePrice), color: "text-foreground" },
            { label: "Down Payment", value: fmtCurrency(homePrice * downPctg / 100), color: "text-amber-400" },
          ].map((m) => (
            <div key={m.label} className="bg-muted/30 rounded-lg p-2.5">
              <p className="text-muted-foreground">{m.label}</p>
              <p className={cn("font-mono font-semibold text-sm mt-0.5", m.color)}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function REITsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Building2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Real Estate & REITs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explore REITs, calculate mortgage payments, and learn real estate investing fundamentals
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="market">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="market" className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            REIT Market
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            REIT Calculator
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Real Estate 101
          </TabsTrigger>
          <TabsTrigger value="mortgage" className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" />
            Mortgage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="mt-4 data-[state=inactive]:hidden">
          <REITMarketTab />
        </TabsContent>
        <TabsContent value="calculator" className="mt-4 data-[state=inactive]:hidden">
          <REITCalculatorTab />
        </TabsContent>
        <TabsContent value="education" className="mt-4 data-[state=inactive]:hidden">
          <RealEstate101Tab />
        </TabsContent>
        <TabsContent value="mortgage" className="mt-4 data-[state=inactive]:hidden">
          <MortgageCalculatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
