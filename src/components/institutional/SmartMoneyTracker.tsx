"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 131;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 131;
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtB(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtPct(v: number, sign = true): string {
  const s2 = sign && v > 0 ? "+" : "";
  return `${s2}${v.toFixed(1)}%`;
}

function fmtDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Section 1: 13F Filing Tracker ─────────────────────────────────────────────

const FUND_NAMES = [
  "Berkshire Hathaway",
  "Renaissance Technologies",
  "Bridgewater Associates",
  "Soros Fund Mgmt",
  "Tiger Global Mgmt",
  "Citadel Advisors",
  "D.E. Shaw",
  "Viking Global Investors",
  "Third Point",
  "Pershing Square",
  "Baupost Group",
  "Lone Pine Capital",
  "Coatue Management",
  "Greenlight Capital",
  "Appaloosa Management",
];

const STOCK_UNIVERSE = [
  "AAPL", "MSFT", "NVDA", "AMZN", "GOOG", "META", "TSLA", "JPM",
  "V", "UNH", "BRK.B", "LLY", "XOM", "AVGO", "HD", "MRK", "CVX",
  "PEP", "ORCL", "COST", "BAC", "KO", "MCD", "WMT", "ABBV", "CRM",
  "TMO", "ACN", "NKE", "NFLX", "ADBE", "INTC", "AMD", "QCOM", "TXN",
];

type QtrChange = "new" | "added" | "reduced" | "sold" | "unchanged";

interface Holding {
  ticker: string;
  value: number;
  pctPortfolio: number;
  qtrChange: QtrChange;
  changePct: number;
}

interface Fund13F {
  name: string;
  aum: number;
  filingDate: string;
  quarterEnd: string;
  holdings: Holding[];
  topHolding: string;
  newPositions: number;
  soldPositions: number;
}

function generate13FData(): Fund13F[] {
  resetSeed();
  return FUND_NAMES.map((name) => {
    const aum = (10 + rand() * 190) * 1e9;
    const numHoldings = Math.floor(rand() * 10) + 3;
    const shuffled = [...STOCK_UNIVERSE].sort(() => rand() - 0.5);
    const tickers = shuffled.slice(0, numHoldings);
    const weights = tickers.map(() => rand());
    const totalW = weights.reduce((a, b) => a + b, 0);
    const changes: QtrChange[] = ["new", "added", "reduced", "sold", "unchanged"];
    const holdings: Holding[] = tickers.map((ticker, i) => {
      const pct = (weights[i] / totalW) * 100;
      const qtrChange = changes[Math.floor(rand() * changes.length)];
      const changePct = qtrChange === "new" ? 100
        : qtrChange === "sold" ? -100
        : qtrChange === "added" ? +(rand() * 60 + 5).toFixed(1)
        : qtrChange === "reduced" ? -(rand() * 50 + 5).toFixed(1)
        : 0;
      return {
        ticker,
        value: aum * (pct / 100),
        pctPortfolio: +pct.toFixed(1),
        qtrChange,
        changePct: +changePct,
      };
    }).sort((a, b) => b.pctPortfolio - a.pctPortfolio).slice(0, 5);

    const quarterEnd = fmtDate(45 + Math.floor(rand() * 15));
    const filingDate = fmtDate(Math.floor(rand() * 10) + 5);
    const newPositions = holdings.filter((h) => h.qtrChange === "new").length;
    const soldPositions = holdings.filter((h) => h.qtrChange === "sold").length;

    return {
      name, aum, filingDate, quarterEnd,
      holdings,
      topHolding: holdings[0]?.ticker ?? "—",
      newPositions, soldPositions,
    };
  });
}

const QTR_CHANGE_STYLE: Record<QtrChange, string> = {
  new: "bg-emerald-500/15 text-emerald-400",
  added: "bg-sky-500/15 text-sky-400",
  reduced: "bg-amber-500/15 text-amber-400",
  sold: "bg-red-500/15 text-red-400",
  unchanged: "bg-muted/40 text-muted-foreground",
};

function FilingTracker() {
  const funds = useMemo(() => generate13FData(), []);
  const [selected, setSelected] = useState<Fund13F | null>(null);

  // Copycat alpha bar chart — SVG showing filing-to-return analysis
  const copycatData = useMemo(() => {
    let ls = 999;
    const r = () => {
      ls = (ls * 1103515245 + 12345) & 0x7fffffff;
      return ls / 0x7fffffff;
    };
    return ["1M", "3M", "6M", "12M"].map((label) => ({
      label,
      alpha: (r() * 8 - 2).toFixed(2),
      spReturn: (r() * 12 + 4).toFixed(2),
    }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Education banner */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs font-medium text-amber-400">13F Filing Lag</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          13F filings report holdings with a <span className="text-foreground font-medium">45-day delay</span> after
          each quarter end. Institutions often exit positions before public disclosure — use 13F data for
          long-term conviction signals, not short-term momentum.
        </p>
      </div>

      {/* Copycat alpha chart */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-1">Copycat Return Analysis vs. S&amp;P 500</p>
        <p className="text-xs text-muted-foreground mb-3">Alpha generated by copying top-10 13F filings (simulated)</p>
        <svg viewBox="0 0 480 80" className="w-full" aria-label="Copycat alpha chart">
          {copycatData.map((d, i) => {
            const x = 30 + i * 110;
            const spH = Math.min((parseFloat(d.spReturn) / 18) * 60, 60);
            const alphaH = Math.abs(parseFloat(d.alpha));
            const isPos = parseFloat(d.alpha) >= 0;
            return (
              <g key={d.label}>
                {/* S&P bar */}
                <rect x={x} y={75 - spH} width={22} height={spH} rx={2} fill="hsl(220 70% 45%)" opacity={0.7} />
                {/* Alpha bar */}
                <rect
                  x={x + 26}
                  y={isPos ? 75 - (alphaH / 18) * 60 : 75}
                  width={22}
                  height={Math.max((alphaH / 18) * 60, 2)}
                  rx={2}
                  fill={isPos ? "hsl(142 55% 40%)" : "hsl(0 60% 45%)"}
                  opacity={0.85}
                />
                <text x={x + 24} y={78} textAnchor="middle" fontSize="8" fill="hsl(220 13% 55%)">{d.label}</text>
                <text x={x + 13} y={Math.max(75 - spH - 3, 8)} textAnchor="middle" fontSize="7" fill="hsl(220 70% 65%)">{d.spReturn}%</text>
                <text
                  x={x + 37}
                  y={isPos ? Math.max(75 - (alphaH / 18) * 60 - 3, 8) : 75 + (alphaH / 18) * 60 + 10}
                  textAnchor="middle" fontSize="7"
                  fill={isPos ? "hsl(142 55% 60%)" : "hsl(0 60% 60%)"}
                >
                  {isPos ? "+" : ""}{d.alpha}%
                </text>
              </g>
            );
          })}
          {/* Legend */}
          <rect x={380} y={4} width={8} height={8} rx={1} fill="hsl(220 70% 45%)" opacity={0.7} />
          <text x={392} y={11} fontSize="7" fill="hsl(220 13% 55%)">S&amp;P 500</text>
          <rect x={380} y={16} width={8} height={8} rx={1} fill="hsl(142 55% 40%)" opacity={0.85} />
          <text x={392} y={23} fontSize="7" fill="hsl(220 13% 55%)">Alpha</text>
        </svg>
      </div>

      {/* Fund list */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {funds.map((fund) => (
          <motion.button
            key={fund.name}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelected(selected?.name === fund.name ? null : fund)}
            className={cn(
              "text-left rounded-lg border bg-card p-3 transition-colors",
              selected?.name === fund.name
                ? "border-primary/60 bg-primary/5"
                : "border-border/60 hover:border-border"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{fund.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">AUM {fmtB(fund.aum)} · Filed {fund.filingDate}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {fund.newPositions > 0 && (
                  <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-400">
                    {fund.newPositions} NEW
                  </span>
                )}
                {fund.soldPositions > 0 && (
                  <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-red-500/15 text-red-400">
                    {fund.soldPositions} SOLD
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Top: <span className="text-foreground font-medium">{fund.topHolding}</span>
              <span className="mx-1.5 opacity-40">·</span>
              Q-end: {fund.quarterEnd}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-primary/30 bg-card overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Top 5 Holdings · Q-end {selected.quarterEnd}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[420px]">
                <thead>
                  <tr className="border-b border-border/20 text-xs text-muted-foreground">
                    <th className="text-left p-2.5 font-medium">Ticker</th>
                    <th className="text-right p-2.5 font-medium">Value</th>
                    <th className="text-right p-2.5 font-medium">% Portfolio</th>
                    <th className="text-right p-2.5 font-medium">Qtr Action</th>
                    <th className="text-right p-2.5 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.holdings.map((h) => (
                    <tr key={h.ticker} className="border-b border-border/20 last:border-0">
                      <td className="p-2.5 font-semibold text-foreground">{h.ticker}</td>
                      <td className="p-2.5 text-right text-muted-foreground">{fmtB(h.value)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmtPct(h.pctPortfolio, false)}</td>
                      <td className="p-2.5 text-right">
                        <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium capitalize", QTR_CHANGE_STYLE[h.qtrChange])}>
                          {h.qtrChange}
                        </span>
                      </td>
                      <td className={cn("p-2.5 text-right font-medium text-xs",
                        h.changePct > 0 ? "text-emerald-400" : h.changePct < 0 ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {h.changePct !== 0 ? fmtPct(h.changePct) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section 2: Guru Stock Picks ───────────────────────────────────────────────

const GURU_NAMES = [
  "Warren Buffett", "Michael Burry", "David Tepper",
  "Bill Ackman", "Seth Klarman", "George Soros",
  "Stanley Druckenmiller", "Howard Marks", "David Einhorn", "Cathie Wood",
];

interface GuruPick {
  ticker: string;
  action: "buy" | "sell" | "new";
  conviction: number; // % of portfolio
  date: string;
}

interface GuruData {
  name: string;
  style: string;
  picks: GuruPick[];
  perf1yr: number;
  perf3yr: number;
  perf5yr: number;
  sp1yr: number;
  sp3yr: number;
  sp5yr: number;
}

function generateGuruData(): GuruData[] {
  let ls = 42;
  const r = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  const styles = ["Value", "Macro", "Growth", "Quant", "Activist", "Deep Value"];
  const sp = { yr1: 24.8, yr3: 10.2, yr5: 14.6 };

  return GURU_NAMES.map((name) => {
    const numPicks = Math.floor(r() * 4) + 3;
    const pickedTickers = [...STOCK_UNIVERSE].sort(() => r() - 0.5).slice(0, numPicks);
    const actions: GuruPick["action"][] = ["buy", "sell", "new"];
    const picks: GuruPick[] = pickedTickers.map((ticker) => ({
      ticker,
      action: actions[Math.floor(r() * actions.length)],
      conviction: +(r() * 15 + 1).toFixed(1),
      date: fmtDate(Math.floor(r() * 60) + 5),
    }));

    return {
      name,
      style: styles[Math.floor(r() * styles.length)],
      picks,
      perf1yr: +(sp.yr1 + (r() * 30 - 12)).toFixed(1),
      perf3yr: +(sp.yr3 + (r() * 14 - 5)).toFixed(1),
      perf5yr: +(sp.yr5 + (r() * 12 - 4)).toFixed(1),
      sp1yr: sp.yr1,
      sp3yr: sp.yr3,
      sp5yr: sp.yr5,
    };
  });
}

function computeOverlap(gurus: GuruData[]): { ticker: string; count: number; guruNames: string[] }[] {
  const map = new Map<string, string[]>();
  gurus.forEach((g) => {
    g.picks.filter((p) => p.action !== "sell").forEach((p) => {
      if (!map.has(p.ticker)) map.set(p.ticker, []);
      map.get(p.ticker)!.push(g.name.split(" ")[1]);
    });
  });
  return [...map.entries()]
    .filter(([, ns]) => ns.length >= 2)
    .map(([ticker, guruNames]) => ({ ticker, count: guruNames.length, guruNames }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function GuroPicks() {
  const gurus = useMemo(() => generateGuruData(), []);
  const overlap = useMemo(() => computeOverlap(gurus), [gurus]);
  const [selectedGuru, setSelectedGuru] = useState<GuruData | null>(null);

  return (
    <div className="space-y-4">
      {/* Consensus picks */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-0.5">Consensus Picks</p>
        <p className="text-xs text-muted-foreground mb-3">Stocks owned by 2+ gurus (highest conviction)</p>
        <div className="flex flex-wrap gap-2">
          {overlap.map((item) => (
            <div key={item.ticker} className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
              <p className="text-xs font-semibold text-foreground">{item.ticker}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.count} gurus · {item.guruNames.join(", ")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guru list */}
      <div className="space-y-2">
        {gurus.map((guru) => {
          const isOpen = selectedGuru?.name === guru.name;
          const alpha1 = guru.perf1yr - guru.sp1yr;
          return (
            <div key={guru.name} className="rounded-lg border border-border/60 bg-card overflow-hidden">
              <button
                onClick={() => setSelectedGuru(isOpen ? null : guru)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{guru.name}</p>
                  <p className="text-xs text-muted-foreground">{guru.style} Investor</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">1yr Alpha</p>
                    <p className={cn("text-xs font-semibold", alpha1 >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {alpha1 >= 0 ? "+" : ""}{alpha1.toFixed(1)}%
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border/20"
                  >
                    <div className="px-4 py-3 space-y-3">
                      {/* Track record bars */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "1yr Return", guru: guru.perf1yr, sp: guru.sp1yr },
                          { label: "3yr Return", guru: guru.perf3yr, sp: guru.sp3yr },
                          { label: "5yr Return", guru: guru.perf5yr, sp: guru.sp5yr },
                        ].map((row) => {
                          const max = Math.max(Math.abs(row.guru), Math.abs(row.sp), 1) * 1.2;
                          const guruW = Math.abs(row.guru) / max * 100;
                          const spW = Math.abs(row.sp) / max * 100;
                          return (
                            <div key={row.label}>
                              <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 h-3 bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${guruW}%` }}
                                      className={cn("h-full rounded-full", row.guru >= 0 ? "bg-emerald-500" : "bg-red-500")}
                                    />
                                  </div>
                                  <span className={cn("text-xs font-medium", row.guru >= 0 ? "text-emerald-400" : "text-red-400")}>
                                    {fmtPct(row.guru)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 h-3 bg-muted/30 rounded-full overflow-hidden">
                                    <div style={{ width: `${spW}%` }} className="h-full bg-sky-500 rounded-full" />
                                  </div>
                                  <span className="text-xs text-sky-400">{fmtPct(row.sp)} SPX</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Picks table */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Recent Positions</p>
                        <div className="space-y-1">
                          {guru.picks.map((p) => (
                            <div key={p.ticker + p.date} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.5 text-xs font-semibold",
                                    p.action === "new" ? "bg-emerald-500/15 text-emerald-400"
                                      : p.action === "buy" ? "bg-sky-500/15 text-sky-400"
                                      : "bg-red-500/15 text-red-400"
                                  )}
                                >
                                  {p.action === "new" ? "NEW" : p.action === "buy" ? "BUY" : "SELL"}
                                </span>
                                <span className="text-xs font-semibold text-foreground">{p.ticker}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{p.conviction}% portfolio</span>
                                <span>{p.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section 3: Congressional Trading Tracker ──────────────────────────────────

const CONGRESS_MEMBERS = [
  "N. Pelosi", "M. McCaul", "T. Cotton", "J. Collins", "R. Burr",
  "D. Loebsack", "K. Armstrong", "B. Donalds", "T. Suozzi", "M. Salazar",
  "P. Sessions", "A. Mace", "D. Crenshaw", "M. Garcia", "M. Lee",
  "J. Duncan", "R. Torres", "C. Bost", "B. Griffith", "H. Hageman",
];

const CONGRESS_SECTORS = ["Tech", "Defense", "Healthcare", "Energy", "Finance", "Pharma"];

interface CongressTrade {
  id: string;
  rep: string;
  chamber: "House" | "Senate";
  ticker: string;
  sector: string;
  txType: "Purchase" | "Sale";
  amount: string;
  dateFiled: string;
  abnormalReturn: number;
}

const AMOUNT_RANGES = ["$1K–$15K", "$15K–$50K", "$50K–$100K", "$100K–$250K", "$250K–$500K", "$500K–$1M"];

function generateCongressTrades(): CongressTrade[] {
  let ls = 77;
  const r = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  return Array.from({ length: 20 }, (_, i) => {
    const rep = CONGRESS_MEMBERS[i];
    const ticker = STOCK_UNIVERSE[Math.floor(r() * STOCK_UNIVERSE.length)];
    const sector = CONGRESS_SECTORS[Math.floor(r() * CONGRESS_SECTORS.length)];
    const txType = r() < 0.6 ? "Purchase" : "Sale";
    return {
      id: `ct-${i}`,
      rep,
      chamber: r() < 0.5 ? "House" : "Senate",
      ticker,
      sector,
      txType,
      amount: AMOUNT_RANGES[Math.floor(r() * AMOUNT_RANGES.length)],
      dateFiled: fmtDate(Math.floor(r() * 45) + 1),
      abnormalReturn: +(r() * 18 - 4).toFixed(2),
    };
  });
}

function CongressTracker() {
  const trades = useMemo(() => generateCongressTrades(), []);
  const [sectorFilter, setSectorFilter] = useState<string>("All");

  const sectorCounts = useMemo(() => {
    const map: Record<string, number> = { All: trades.length };
    trades.forEach((t) => {
      map[t.sector] = (map[t.sector] ?? 0) + 1;
    });
    return map;
  }, [trades]);

  const filtered = sectorFilter === "All" ? trades : trades.filter((t) => t.sector === sectorFilter);

  const avgAbnormal = useMemo(() => {
    const buys = trades.filter((t) => t.txType === "Purchase");
    if (!buys.length) return 0;
    return buys.reduce((s, t) => s + t.abnormalReturn, 0) / buys.length;
  }, [trades]);

  // SVG sector pie chart
  const pieData = useMemo(() => {
    const sectors = Object.entries(sectorCounts).filter(([k]) => k !== "All");
    const total = sectors.reduce((s, [, v]) => s + v, 0);
    let cumAngle = -Math.PI / 2;
    const colors = ["hsl(220 70% 55%)", "hsl(38 80% 50%)", "hsl(142 55% 45%)",
      "hsl(280 55% 55%)", "hsl(0 60% 50%)", "hsl(180 55% 45%)"];
    return sectors.map(([label, count], i) => {
      const angle = (count / total) * 2 * Math.PI;
      const x1 = 40 + 36 * Math.cos(cumAngle);
      const y1 = 40 + 36 * Math.sin(cumAngle);
      cumAngle += angle;
      const x2 = 40 + 36 * Math.cos(cumAngle);
      const y2 = 40 + 36 * Math.sin(cumAngle);
      const large = angle > Math.PI ? 1 : 0;
      return { label, count, pct: ((count / total) * 100).toFixed(0), x1, y1, x2, y2, large, color: colors[i % colors.length] };
    });
  }, [sectorCounts]);

  return (
    <div className="space-y-4">
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Trades", value: trades.length.toString(), color: "text-foreground" },
          { label: "Purchases", value: trades.filter((t) => t.txType === "Purchase").length.toString(), color: "text-emerald-400" },
          { label: "Avg Abnormal Return", value: fmtPct(avgAbnormal), color: avgAbnormal >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/60 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={cn("text-lg font-semibold mt-0.5", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sector breakdown */}
      <div className="rounded-lg border border-border/60 bg-card p-4 flex flex-col sm:flex-row items-start gap-4">
        <div className="shrink-0">
          <p className="text-xs font-semibold text-foreground mb-2">Sector Breakdown</p>
          <svg width="80" height="80" viewBox="0 0 80 80">
            {pieData.map((slice) => (
              <path
                key={slice.label}
                d={`M 40 40 L ${slice.x1.toFixed(2)} ${slice.y1.toFixed(2)} A 36 36 0 ${slice.large} 1 ${slice.x2.toFixed(2)} ${slice.y2.toFixed(2)} Z`}
                fill={slice.color}
                stroke="hsl(220 13% 10%)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {pieData.map((slice) => (
            <div key={slice.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: slice.color }} />
              <span className="text-xs text-muted-foreground">{slice.label} ({slice.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {["All", ...CONGRESS_SECTORS].map((sec) => (
          <button
            key={sec}
            onClick={() => setSectorFilter(sec)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sectorFilter === sec
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
          >
            {sec} ({sectorCounts[sec] ?? 0})
          </button>
        ))}
      </div>

      {/* Trades table */}
      <div className="rounded-lg border border-border/60 bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="border-b border-border/20 text-xs text-muted-foreground">
              <th className="text-left p-2.5 font-medium">Representative</th>
              <th className="text-left p-2.5 font-medium">Ticker</th>
              <th className="text-left p-2.5 font-medium">Type</th>
              <th className="text-right p-2.5 font-medium">Amount</th>
              <th className="text-right p-2.5 font-medium">Filed</th>
              <th className="text-right p-2.5 font-medium">Abnormal Ret</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => (
              <tr key={trade.id} className="border-b border-border/20 last:border-0">
                <td className="p-2.5">
                  <p className="font-medium text-foreground">{trade.rep}</p>
                  <p className="text-xs text-muted-foreground">{trade.chamber}</p>
                </td>
                <td className="p-2.5 font-semibold text-foreground">{trade.ticker}</td>
                <td className="p-2.5">
                  <span className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-medium",
                    trade.txType === "Purchase" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                  )}>
                    {trade.txType}
                  </span>
                </td>
                <td className="p-2.5 text-right text-muted-foreground text-xs">{trade.amount}</td>
                <td className="p-2.5 text-right text-muted-foreground text-xs">{trade.dateFiled}</td>
                <td className={cn(
                  "p-2.5 text-right font-medium",
                  trade.abnormalReturn >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {fmtPct(trade.abnormalReturn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legislative calendar note */}
      <div className="rounded-lg border border-border/60 bg-card p-3">
        <p className="text-xs text-muted-foreground mb-2">Upcoming Legislative Catalysts</p>
        <div className="space-y-1.5">
          {[
            { bill: "CHIPS Act Funding Round 2", date: "Apr 15, 2026", sectors: ["Semi", "Tech"] },
            { bill: "Drug Pricing Reform Bill", date: "May 2, 2026", sectors: ["Pharma", "Healthcare"] },
            { bill: "Energy Transition Package", date: "May 20, 2026", sectors: ["Energy"] },
            { bill: "Defense Authorization FY27", date: "Jun 10, 2026", sectors: ["Defense"] },
          ].map((item) => (
            <div key={item.bill} className="flex items-center justify-between">
              <div>
                <span className="text-xs text-foreground font-medium">{item.bill}</span>
                <div className="flex gap-1 mt-0.5">
                  {item.sectors.map((sec) => (
                    <span key={sec} className="text-xs bg-muted/40 text-muted-foreground rounded px-1 py-0.5">{sec}</span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-3">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section 4: Short Interest Analysis ────────────────────────────────────────

interface ShortData {
  ticker: string;
  name: string;
  shortFloat: number;
  daysToCover: number;
  borrowRate: number;
  shortChange: number;
  ftd: number;
  painMeter: number;
}

const SHORT_NAMES: Record<string, string> = {
  GME: "GameStop", AMC: "AMC Entertainment", BBBY: "Bed Bath & Beyond",
  RIVN: "Rivian Automotive", LCID: "Lucid Group", BYND: "Beyond Meat",
  NKLA: "Nikola Corp", SPCE: "Virgin Galactic", WKHS: "Workhorse Group",
  WISH: "ContextLogic", CLOV: "Clover Health", EXPR: "Express Inc",
  BBAI: "BigBear.ai", LMND: "Lemonade Inc", MVIS: "MicroVision",
};

function generateShortData(): ShortData[] {
  let ls = 555;
  const r = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  return Object.keys(SHORT_NAMES).map((ticker) => {
    const shortFloat = +(15 + r() * 60).toFixed(1);
    const daysToCover = +(1 + r() * 14).toFixed(1);
    const borrowRate = +(5 + r() * 150).toFixed(1);
    const shortChange = +(r() * 20 - 8).toFixed(1);
    const ftd = Math.floor(r() * 1000000);
    const painMeter = +(daysToCover * (borrowRate / 10)).toFixed(1);
    return { ticker, name: SHORT_NAMES[ticker], shortFloat, daysToCover, borrowRate, shortChange, ftd, painMeter };
  }).sort((a, b) => b.shortFloat - a.shortFloat);
}

const SHORT_SELLERS = [
  { name: "Hindenburg Research", target: "NKLA", date: "Mar 2, 2026", impact: "-42%" },
  { name: "Citron Research", target: "LCID", date: "Feb 18, 2026", impact: "-18%" },
  { name: "Carson Block (Muddy Waters)", target: "WISH", date: "Jan 25, 2026", impact: "-31%" },
];

const HISTORICAL_SQUEEZES = [
  { ticker: "GME", peak: "+1,741%", catalyst: "Reddit WallStreetBets coordinated buy + short ratio > 140%" },
  { ticker: "AMC", peak: "+595%", catalyst: "Retail momentum after GME, high borrow rate feedback loop" },
  { ticker: "BBBY", peak: "+280%", catalyst: "Ryan Cohen stake + social media amplification" },
];

function ShortInterest() {
  const data = useMemo(() => generateShortData(), []);
  const [sortBy, setSortBy] = useState<"shortFloat" | "painMeter" | "borrowRate">("shortFloat");

  const sorted = useMemo(
    () => [...data].sort((a, b) => b[sortBy] - a[sortBy]),
    [data, sortBy]
  );

  const maxPain = Math.max(...data.map((d) => d.painMeter));

  return (
    <div className="space-y-4">
      {/* Educational callout */}
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
        <p className="text-xs font-medium text-red-400">Short Squeeze Pain Meter</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          <span className="text-foreground font-medium">Pain Meter = Days-to-Cover × (Borrow Rate / 10)</span>
          {" "}— High scores indicate elevated short-squeeze risk. Short sellers pay the borrow rate daily, creating
          pressure to cover when the stock moves against them.
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        {(["shortFloat", "painMeter", "borrowRate"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sortBy === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
          >
            {key === "shortFloat" ? "Short Float" : key === "painMeter" ? "Pain Meter" : "Borrow Rate"}
          </button>
        ))}
      </div>

      {/* Short interest table with inline mini pain bar */}
      <div className="rounded-lg border border-border/60 bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="border-b border-border/20 text-xs text-muted-foreground">
              <th className="text-left p-2.5 font-medium">Ticker</th>
              <th className="text-right p-2.5 font-medium">Short Float</th>
              <th className="text-right p-2.5 font-medium">Days Cover</th>
              <th className="text-right p-2.5 font-medium">Borrow %</th>
              <th className="text-right p-2.5 font-medium">Chg 4W</th>
              <th className="text-right p-2.5 font-medium">FTD</th>
              <th className="text-left p-2.5 font-medium w-24">Pain</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const painW = (row.painMeter / maxPain) * 100;
              const painColor = painW > 70 ? "bg-red-500" : painW > 40 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <tr key={row.ticker} className="border-b border-border/20 last:border-0">
                  <td className="p-2.5">
                    <p className="font-semibold text-foreground">{row.ticker}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[90px]">{row.name}</p>
                  </td>
                  <td className="p-2.5 text-right">
                    <span className={cn("font-medium", row.shortFloat >= 40 ? "text-red-400" : row.shortFloat >= 20 ? "text-amber-400" : "text-foreground")}>
                      {fmtPct(row.shortFloat, false)}
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-muted-foreground">{row.daysToCover}d</td>
                  <td className="p-2.5 text-right text-amber-400 font-medium">{row.borrowRate}%</td>
                  <td className={cn("p-2.5 text-right font-medium", row.shortChange >= 0 ? "text-red-400" : "text-emerald-400")}>
                    {fmtPct(row.shortChange)}
                  </td>
                  <td className="p-2.5 text-right text-muted-foreground text-xs">
                    {row.ftd >= 1e6 ? `${(row.ftd / 1e6).toFixed(1)}M` : `${(row.ftd / 1e3).toFixed(0)}K`}
                  </td>
                  <td className="p-2.5">
                    <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-colors", painColor)} style={{ width: `${painW}%` }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{row.painMeter.toFixed(1)}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Short seller reports */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Recent Short Seller Reports</p>
        <div className="space-y-2">
          {SHORT_SELLERS.map((r2) => (
            <div key={r2.name + r2.date} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">{r2.name}</p>
                <p className="text-xs text-muted-foreground">Target: <span className="text-amber-400 font-medium">{r2.target}</span> · {r2.date}</p>
              </div>
              <span className="text-red-400 font-semibold text-xs">{r2.impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical squeezes */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Historical Short Squeezes</p>
        <div className="space-y-3">
          {HISTORICAL_SQUEEZES.map((sq) => (
            <div key={sq.ticker} className="flex items-start gap-3">
              <span className="text-lg font-semibold text-foreground shrink-0 w-12">{sq.ticker}</span>
              <div>
                <p className="text-emerald-400 font-semibold text-xs">{sq.peak}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sq.catalyst}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section 5: Options Activity by Institutions ───────────────────────────────

interface InstitutionalOption {
  id: string;
  institution: string;
  ticker: string;
  sector: string;
  callPut: "call" | "put";
  strike: number;
  expiry: string;
  contracts: number;
  premium: number;
  isLeap: boolean;
  isEarningsStraddle: boolean;
  repeatCount: number;
  note: string;
}

const INSTITUTION_NAMES = [
  "Citadel LLC", "Millennium Mgmt", "Point72", "Two Sigma",
  "Jane Street", "Susquehanna Intl", "Jump Trading", "Virtu Financial",
  "HRT Financial", "Flow Traders",
];

const OPTION_SECTORS: Record<string, string> = {
  AAPL: "Tech", MSFT: "Tech", NVDA: "Semi", TSLA: "Auto",
  AMZN: "Retail", GOOG: "Tech", META: "Social", JPM: "Finance",
  V: "Finance", UNH: "Healthcare", LLY: "Pharma", XOM: "Energy",
};

const OPTION_EXPIRIES = [
  "2026-04-17", "2026-05-15", "2026-06-19",
  "2026-09-18", "2026-12-18", "2027-01-15", "2027-06-18", "2028-01-20",
];

function generateInstitutionalOptions(): InstitutionalOption[] {
  let ls = 888;
  const r = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  const tickers = Object.keys(OPTION_SECTORS);
  return Array.from({ length: 20 }, (_, i) => {
    const institution = INSTITUTION_NAMES[Math.floor(r() * INSTITUTION_NAMES.length)];
    const ticker = tickers[Math.floor(r() * tickers.length)];
    const sector = OPTION_SECTORS[ticker] ?? "Other";
    const callPut: "call" | "put" = r() < 0.6 ? "call" : "put";
    const basePrice = 100 + Math.floor(r() * 800);
    const strike = Math.round(basePrice * (0.9 + r() * 0.2) / 5) * 5;
    const expiry = OPTION_EXPIRIES[Math.floor(r() * OPTION_EXPIRIES.length)];
    const contracts = Math.floor(r() * 5000 + 500);
    const optPx = +(1 + r() * 30).toFixed(2);
    const premium = Math.round(contracts * optPx * 100);
    const isLeap = expiry >= "2027-01-01";
    const isEarningsStraddle = r() < 0.15;
    const repeatCount = Math.floor(r() * 4) + 1;
    const notes = [
      "Sweep across 3 exchanges",
      "Block trade at ask",
      "Part of ratio spread structure",
      "Paired with stock position",
      "OI exceeds average daily volume",
      "Far-OTM strike = tail hedge",
    ];
    return {
      id: `io-${i}`,
      institution, ticker, sector, callPut, strike, expiry,
      contracts, premium, isLeap, isEarningsStraddle,
      repeatCount, note: notes[Math.floor(r() * notes.length)],
    };
  });
}

function InstitutionalOptions() {
  const trades = useMemo(() => generateInstitutionalOptions(), []);
  const [filter, setFilter] = useState<"all" | "leaps" | "earnings" | "repeat">("all");

  const filtered = useMemo(() => {
    if (filter === "leaps") return trades.filter((t) => t.isLeap);
    if (filter === "earnings") return trades.filter((t) => t.isEarningsStraddle);
    if (filter === "repeat") return trades.filter((t) => t.repeatCount >= 2);
    return trades;
  }, [trades, filter]);

  // Sector concentration bar chart
  const sectorConc = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      map[t.sector] = (map[t.sector] ?? 0) + t.premium;
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return entries.map(([sector, premium]) => ({
      sector, premium, pct: (premium / total) * 100,
    }));
  }, [trades]);

  const maxSectorPct = Math.max(...sectorConc.map((s) => s.pct));

  return (
    <div className="space-y-4">
      {/* Sector concentration */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Institutional Options: Sector Concentration (by Premium $)</p>
        <div className="space-y-2">
          {sectorConc.map((item) => (
            <div key={item.sector} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{item.sector}</span>
              <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.pct / maxSectorPct) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.05 * sectorConc.indexOf(item) }}
                  className="h-full bg-primary/70 rounded"
                />
              </div>
              <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                {fmtB(item.premium)} ({item.pct.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Educational callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
          <p className="text-xs font-semibold text-sky-400 mb-1">LEAP Conviction Signal</p>
          <p className="text-xs text-muted-foreground">
            Far-dated options (1–2yr expiry) indicate long-term positioning. Institutions buying
            LEAPs are expressing multi-quarter directional conviction, not hedging near-term events.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary mb-1">Earnings Straddling</p>
          <p className="text-xs text-muted-foreground">
            Simultaneous call + put purchase around earnings dates. Institutions hedge binary
            outcomes without directional bias — large straddle purchases amplify post-earnings moves.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "leaps", "earnings", "repeat"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
          >
            {f === "all" ? `All (${trades.length})` :
              f === "leaps" ? `LEAPs (${trades.filter((t) => t.isLeap).length})` :
              f === "earnings" ? `Earnings Straddles (${trades.filter((t) => t.isEarningsStraddle).length})` :
              `Repeat Pattern (${trades.filter((t) => t.repeatCount >= 2).length})`}
          </button>
        ))}
      </div>

      {/* Options table */}
      <div className="rounded-lg border border-border/60 bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-border/20 text-xs text-muted-foreground">
              <th className="text-left p-2.5 font-medium">Institution</th>
              <th className="text-left p-2.5 font-medium">Ticker</th>
              <th className="text-left p-2.5 font-medium">Contract</th>
              <th className="text-right p-2.5 font-medium">Contracts</th>
              <th className="text-right p-2.5 font-medium">Premium</th>
              <th className="text-right p-2.5 font-medium">Rpt</th>
              <th className="text-left p-2.5 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => (
              <tr key={trade.id} className="border-b border-border/20 last:border-0">
                <td className="p-2.5">
                  <p className="font-medium text-foreground text-[11px]">{trade.institution}</p>
                  <p className="text-xs text-muted-foreground">{trade.sector}</p>
                </td>
                <td className="p-2.5 font-semibold text-foreground">{trade.ticker}</td>
                <td className="p-2.5">
                  <span className={cn(
                    "font-medium text-xs",
                    trade.callPut === "call" ? "text-emerald-400" : "text-red-400"
                  )}>
                    {trade.callPut.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground ml-1">${trade.strike} · {trade.expiry}</span>
                </td>
                <td className="p-2.5 text-right text-muted-foreground">{trade.contracts.toLocaleString()}</td>
                <td className="p-2.5 text-right font-medium text-foreground">{fmtB(trade.premium)}</td>
                <td className="p-2.5 text-right">
                  {trade.repeatCount >= 2 ? (
                    <span className="rounded px-1 py-0.5 bg-primary/15 text-primary text-xs font-medium">
                      ×{trade.repeatCount}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="p-2.5">
                  <div className="flex gap-1 flex-wrap">
                    {trade.isLeap && (
                      <span className="rounded px-1.5 py-0.5 bg-sky-500/15 text-sky-400 text-[11px] font-medium">LEAP</span>
                    )}
                    {trade.isEarningsStraddle && (
                      <span className="rounded px-1.5 py-0.5 bg-amber-500/15 text-amber-400 text-[11px] font-medium">STRDL</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes column explanation */}
      <div className="rounded-lg border border-border/60 bg-card p-3">
        <p className="text-xs text-muted-foreground mb-1.5">Pattern Glossary</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {[
            { key: "LEAP", desc: "Expiry > 12 months — long-term conviction" },
            { key: "STRDL", desc: "Earnings straddle — binary event hedge" },
            { key: "×N", desc: "Repeat pattern — same strike/expiry N sessions" },
            { key: "Sweep", desc: "Filled across multiple exchanges simultaneously" },
          ].map((item) => (
            <div key={item.key} className="flex items-start gap-2 text-xs">
              <span className="text-foreground font-semibold shrink-0 w-12">{item.key}</span>
              <span className="text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root Component ─────────────────────────────────────────────────────────────

export default function SmartMoneyTracker() {
  const [activeTab, setActiveTab] = useState("13f");

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Smart Money Tracker</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Institutional flows · Congressional trades · Short interest · Options activity
            </p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            Data as of {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Badge>
        </div>
      </motion.div>

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-4">
          {[
            { value: "13f", label: "13F Filings" },
            { value: "gurus", label: "Guru Picks" },
            { value: "congress", label: "Congress" },
            { value: "short", label: "Short Interest" },
            { value: "options", label: "Inst. Options" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="13f" className="mt-0 data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "13f" && (
              <motion.div key="13f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <FilingTracker />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="gurus" className="mt-0 data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "gurus" && (
              <motion.div key="gurus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <GuroPicks />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="congress" className="mt-0 data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "congress" && (
              <motion.div key="congress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <CongressTracker />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="short" className="mt-0 data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "short" && (
              <motion.div key="short" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <ShortInterest />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="options" className="mt-0 data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "options" && (
              <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <InstitutionalOptions />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
