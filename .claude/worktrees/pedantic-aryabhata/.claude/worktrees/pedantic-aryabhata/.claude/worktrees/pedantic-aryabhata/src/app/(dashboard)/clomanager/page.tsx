"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  ShieldCheck,
  BarChart3,
  RefreshCcw,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 992;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let ri = 0;
const r = () => RAND_POOL[ri++ % RAND_POOL.length];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Tranche {
  name: string;
  rating: string;
  sizeMM: number;
  pctCapital: number;
  couponLabel: string;
  spread: number; // bps over SOFR
  ocCushion: number; // pct
  color: string;
  textColor: string;
}

interface CoverageTest {
  tranche: string;
  testType: "OC" | "IC";
  current: number;
  required: number;
  pass: boolean;
}

interface Loan {
  issuer: string;
  industry: string;
  spread: number; // bps
  maturity: string;
  rating: string;
  balance: number; // $M
}

interface DefaultScenario {
  label: string;
  defaultRate: number;
  recovery: number;
  equityIRR: number;
  firstLossPct: number;
  impaired: string[];
}

// ── Static data ───────────────────────────────────────────────────────────────

const TRANCHES: Tranche[] = [
  {
    name: "AAA",
    rating: "AAA",
    sizeMM: 230,
    pctCapital: 46,
    couponLabel: "SOFR + 145",
    spread: 145,
    ocCushion: 42.3,
    color: "bg-primary/80",
    textColor: "text-primary",
  },
  {
    name: "AA",
    rating: "AA",
    sizeMM: 65,
    pctCapital: 13,
    couponLabel: "SOFR + 195",
    spread: 195,
    ocCushion: 29.8,
    color: "bg-sky-700",
    textColor: "text-sky-300",
  },
  {
    name: "A",
    rating: "A",
    sizeMM: 45,
    pctCapital: 9,
    couponLabel: "SOFR + 270",
    spread: 270,
    ocCushion: 21.5,
    color: "bg-teal-700",
    textColor: "text-emerald-300",
  },
  {
    name: "BBB",
    rating: "BBB",
    sizeMM: 35,
    pctCapital: 7,
    couponLabel: "SOFR + 360",
    spread: 360,
    ocCushion: 15.2,
    color: "bg-amber-700",
    textColor: "text-amber-300",
  },
  {
    name: "BB",
    rating: "BB",
    sizeMM: 25,
    pctCapital: 5,
    couponLabel: "SOFR + 540",
    spread: 540,
    ocCushion: 7.4,
    color: "bg-orange-700",
    textColor: "text-orange-300",
  },
  {
    name: "Equity",
    rating: "NR",
    sizeMM: 100,
    pctCapital: 20,
    couponLabel: "Residual",
    spread: 0,
    ocCushion: 0,
    color: "bg-rose-800",
    textColor: "text-rose-300",
  },
];

const TOTAL_ASSETS = 530; // $M collateral pool

const COVERAGE_TESTS: CoverageTest[] = [
  { tranche: "AAA", testType: "OC", current: 142.3, required: 123.5, pass: true },
  { tranche: "AAA", testType: "IC", current: 184.6, required: 120.0, pass: true },
  { tranche: "AA",  testType: "OC", current: 129.8, required: 117.2, pass: true },
  { tranche: "AA",  testType: "IC", current: 156.2, required: 110.0, pass: true },
  { tranche: "A",   testType: "OC", current: 121.5, required: 112.0, pass: true },
  { tranche: "A",   testType: "IC", current: 138.9, required: 105.0, pass: true },
  { tranche: "BBB", testType: "OC", current: 115.2, required: 108.5, pass: true },
  { tranche: "BBB", testType: "IC", current: 119.4, required: 102.0, pass: true },
];

const LOANS: Loan[] = [
  { issuer: "Apex Software Holdings",  industry: "Technology",      spread: 525, maturity: "2028-05", rating: "B+",  balance: 72 },
  { issuer: "Cascade Healthcare Grp",  industry: "Healthcare",      spread: 480, maturity: "2027-11", rating: "B",   balance: 58 },
  { issuer: "Meridian Industrial Co",  industry: "Industrials",     spread: 550, maturity: "2029-02", rating: "B-",  balance: 65 },
  { issuer: "Stellar Retail Partners", industry: "Consumer",        spread: 600, maturity: "2027-08", rating: "CCC+",balance: 40 },
  { issuer: "Nova Energy Solutions",   industry: "Energy",          spread: 510, maturity: "2028-10", rating: "B+",  balance: 55 },
  { issuer: "Crestview Media LLC",     industry: "Media & Telecom", spread: 490, maturity: "2028-03", rating: "B",   balance: 62 },
  { issuer: "Pinnacle Auto Services",  industry: "Automotive",      spread: 575, maturity: "2027-06", rating: "B-",  balance: 48 },
  { issuer: "Harbor Logistics Corp",   industry: "Transportation",  spread: 460, maturity: "2029-09", rating: "BB-", balance: 80 },
];

const DEFAULT_SCENARIOS: DefaultScenario[] = [
  {
    label: "Base",
    defaultRate: 2,
    recovery: 65,
    equityIRR: 14.2,
    firstLossPct: 100,
    impaired: [],
  },
  {
    label: "Stress",
    defaultRate: 5,
    recovery: 55,
    equityIRR: 6.8,
    firstLossPct: 100,
    impaired: ["Equity (partial)"],
  },
  {
    label: "Severe",
    defaultRate: 8,
    recovery: 40,
    equityIRR: -4.1,
    firstLossPct: 100,
    impaired: ["Equity (full)", "BB (partial)"],
  },
];

// Pre-generate NAV curve points using PRNG (consumed at module load)
const NAV_POINTS: { quarter: number; nav: number }[] = (() => {
  const pts: { quarter: number; nav: number }[] = [];
  let nav = 100;
  for (let q = 0; q <= 20; q++) {
    if (q > 0) {
      const delta = (r() - 0.35) * 6;
      nav = Math.max(60, nav + delta);
    }
    pts.push({ quarter: q, nav: Math.round(nav * 10) / 10 });
  }
  return pts;
})();

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, dec = 1): string {
  return n.toFixed(dec);
}

function fmtMM(n: number): string {
  return `$${n}M`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-foreground/5 p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-bold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function PassBadge({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs font-medium text-emerald-300">
      <CheckCircle className="h-3 w-3" /> PASS
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-900/50 px-2 py-0.5 text-xs font-medium text-rose-300">
      <XCircle className="h-3 w-3" /> FAIL
    </span>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  const cls =
    rating === "AAA"
      ? "bg-muted/70 text-primary"
      : rating === "AA"
      ? "bg-sky-900/50 text-sky-300"
      : rating === "A"
      ? "bg-teal-900/50 text-emerald-300"
      : rating === "BBB"
      ? "bg-amber-900/50 text-amber-300"
      : rating === "BB" || rating === "BB-"
      ? "bg-orange-900/50 text-orange-300"
      : rating === "NR"
      ? "bg-muted text-muted-foreground"
      : "bg-rose-900/50 text-rose-300";
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs text-muted-foreground font-medium", cls)}>
      {rating}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — CLO STRUCTURE
// ══════════════════════════════════════════════════════════════════════════════

function StructureTab() {
  const totalSize = TRANCHES.reduce((s, t) => s + t.sizeMM, 0);
  const was = useMemo(() => {
    const totalBal = LOANS.reduce((a, l) => a + l.balance, 0);
    const weightedSpread = LOANS.reduce((a, l) => a + l.spread * l.balance, 0);
    return weightedSpread / totalBal;
  }, []);

  const wal = 3.8; // fixed computed
  const divScore = 72;

  // Waterfall SVG dimensions
  const W = 560;
  const H = 320;
  const barX = 60;
  const barW = 200;
  const labelX = barX + barW + 16;

  const cumPcts: number[] = [];
  let cum = 0;
  TRANCHES.forEach((t) => {
    cumPcts.push(cum);
    cum += t.pctCapital;
  });

  return (
    <div className="space-y-4">
      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total CLO Size" value="$500M" sub="6 tranches" />
        <StatCard label="Collateral Pool" value={fmtMM(TOTAL_ASSETS)} sub={`${LOANS.length} loans`} />
        <StatCard label="WAS" value={`${fmt(was, 0)} bps`} sub="Weighted avg spread" highlight="pos" />
        <StatCard label="WAL" value={`${wal}yr`} sub={`Diversity ${divScore}`} />
      </div>

      {/* Waterfall SVG */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Capital Structure Waterfall" sub="Senior to junior priority of payments" />
        <div className="overflow-x-auto">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="text-foreground">
            {TRANCHES.map((t, i) => {
              const yPct = cumPcts[i] / 100;
              const hPct = t.pctCapital / 100;
              const y = yPct * (H - 20) + 10;
              const h = Math.max(hPct * (H - 20), 20);
              return (
                <g key={t.name}>
                  {/* Tranche bar */}
                  <rect
                    x={barX}
                    y={y}
                    width={barW}
                    height={h - 2}
                    rx={3}
                    className={t.color}
                    opacity={0.85}
                  />
                  {/* Tranche label inside bar */}
                  {h >= 18 && (
                    <text
                      x={barX + barW / 2}
                      y={y + h / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                      fontWeight="600"
                      fill="white"
                    >
                      {t.name}
                    </text>
                  )}
                  {/* Right-side info */}
                  <text x={labelX} y={y + h / 2 - 7} fontSize={11} fill="#e4e4e7" fontWeight="500">
                    {fmtMM(t.sizeMM)} ({t.pctCapital}%)
                  </text>
                  <text x={labelX} y={y + h / 2 + 7} fontSize={10} fill="#a1a1aa">
                    {t.couponLabel}
                    {t.ocCushion > 0 ? `  ·  OC cushion ${fmt(t.ocCushion)}%` : "  ·  First loss"}
                  </text>
                  {/* Left side — rating */}
                  <text x={barX - 8} y={y + h / 2} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#a1a1aa">
                    {t.rating}
                  </text>
                </g>
              );
            })}
            {/* Assets bar on left */}
            <rect x={8} y={10} width={40} height={H - 20} rx={3} fill="#3f3f46" opacity={0.5} />
            <text x={28} y={H / 2 - 12} textAnchor="middle" fontSize={9} fill="#a1a1aa">Assets</text>
            <text x={28} y={H / 2} textAnchor="middle" fontSize={9} fill="#a1a1aa">{fmtMM(TOTAL_ASSETS)}</text>
          </svg>
        </div>
      </div>

      {/* Tranche detail table */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Tranche Summary" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-left">Tranche</th>
                <th className="py-2 text-right">Size</th>
                <th className="py-2 text-right">% Capital</th>
                <th className="py-2 text-right">Coupon</th>
                <th className="py-2 text-right">Rating</th>
                <th className="py-2 text-right">OC Cushion</th>
              </tr>
            </thead>
            <tbody>
              {TRANCHES.map((t) => (
                <tr key={t.name} className="border-b border-border hover:bg-muted/30">
                  <td className="py-2 font-semibold">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2", t.color)} />
                    {t.name}
                  </td>
                  <td className="py-2 text-right text-foreground">{fmtMM(t.sizeMM)}</td>
                  <td className="py-2 text-right text-foreground">{t.pctCapital}%</td>
                  <td className="py-2 text-right text-muted-foreground">{t.couponLabel}</td>
                  <td className="py-2 text-right"><RatingBadge rating={t.rating} /></td>
                  <td className={cn("py-2 text-right", t.ocCushion > 0 ? "text-emerald-400" : "text-muted-foreground")}>
                    {t.ocCushion > 0 ? `${fmt(t.ocCushion)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — COVERAGE TESTS
// ══════════════════════════════════════════════════════════════════════════════

function CoverageTab() {
  const ocTests = COVERAGE_TESTS.filter((t) => t.testType === "OC");
  const icTests = COVERAGE_TESTS.filter((t) => t.testType === "IC");

  function TestGroup({ tests, title }: { tests: CoverageTest[]; title: string }) {
    return (
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title={title} />
        <div className="space-y-4">
          {tests.map((t) => {
            const pct = Math.min((t.current / (t.required * 1.5)) * 100, 100);
            const reqPct = (t.required / (t.required * 1.5)) * 100;
            return (
              <div key={`${t.tranche}-${t.testType}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{t.tranche} Note</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {fmt(t.current)}% vs min {fmt(t.required)}%
                    </span>
                    <PassBadge pass={t.pass} />
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  {/* Required min marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                    style={{ left: `${reqPct}%` }}
                  />
                  {/* Current value bar */}
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      t.pass ? "bg-emerald-500" : "bg-rose-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <span className="text-xs text-muted-foreground">Required min</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const allPass = COVERAGE_TESTS.every((t) => t.pass);

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div
        className={cn(
          "rounded-md border p-4 flex items-center gap-3",
          allPass
            ? "border-emerald-500/30 bg-emerald-900/20"
            : "border-rose-500/30 bg-rose-900/20"
        )}
      >
        {allPass ? (
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
        )}
        <div>
          <p className={cn("text-sm font-semibold", allPass ? "text-emerald-300" : "text-rose-300")}>
            {allPass ? "All Coverage Tests Passing" : "Coverage Test Breach Detected"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allPass
              ? "CLO is in compliance. No diversion of interest or principal required."
              : "Interest diversion triggers active. Cash flow redirected to senior notes."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TestGroup tests={ocTests} title="Overcollateralization (OC) Tests" />
        <TestGroup tests={icTests} title="Interest Coverage (IC) Tests" />
      </div>

      {/* Glossary */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Test Mechanics" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { term: "OC Test", desc: "Collateral par value ÷ outstanding note balance. Breach redirects principal to senior." },
            { term: "IC Test", desc: "Interest income ÷ interest due on senior notes. Breach diverts coupon from junior tranches." },
            { term: "Reinvestment Trigger", desc: "If OC test fails, manager cannot reinvest proceeds — must pay down notes sequentially." },
            { term: "Cure Period", desc: "Manager has limited time to restore compliance by selling assets or buying premium loans." },
          ].map((item) => (
            <div key={item.term} className="rounded-lg bg-foreground/5 p-3">
              <p className="text-xs font-medium text-foreground mb-1">{item.term}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — PORTFOLIO ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

function PortfolioTab() {
  const totalBal = LOANS.reduce((a, l) => a + l.balance, 0);
  const was = LOANS.reduce((a, l) => a + l.spread * l.balance, 0) / totalBal;
  const wal = 3.8;
  const divScore = 72;
  const avgRating = "B / B+";

  // Industry distribution for donut
  const industries: Record<string, number> = {};
  LOANS.forEach((l) => {
    industries[l.industry] = (industries[l.industry] ?? 0) + l.balance;
  });
  const indEntries = Object.entries(industries).sort((a, b) => b[1] - a[1]);
  const COLORS = ["#3b82f6", "#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#f97316", "#6366f1"];

  // Simple bar chart
  const maxBal = Math.max(...LOANS.map((l) => l.balance));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Pool Balance" value={`$${totalBal}M`} />
        <StatCard label="WAS" value={`${fmt(was, 0)} bps`} highlight="pos" sub="Wt. avg spread" />
        <StatCard label="WAL" value={`${wal}yr`} sub="Wt. avg life" />
        <StatCard label="Diversity Score" value={`${divScore}`} sub={`Avg rating ${avgRating}`} />
      </div>

      {/* Loan table */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Collateral Pool" sub="8 loan positions" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-left">Issuer</th>
                <th className="py-2 text-left">Industry</th>
                <th className="py-2 text-right">Spread (bps)</th>
                <th className="py-2 text-right">Maturity</th>
                <th className="py-2 text-right">Rating</th>
                <th className="py-2 text-right">Balance</th>
                <th className="py-2 text-right">% Pool</th>
              </tr>
            </thead>
            <tbody>
              {LOANS.map((l) => (
                <tr key={l.issuer} className="border-b border-border hover:bg-muted/30">
                  <td className="py-2 font-medium text-foreground max-w-[140px] truncate">{l.issuer}</td>
                  <td className="py-2 text-muted-foreground">{l.industry}</td>
                  <td className="py-2 text-right text-emerald-400 font-mono">{l.spread}</td>
                  <td className="py-2 text-right text-muted-foreground font-mono">{l.maturity}</td>
                  <td className="py-2 text-right"><RatingBadge rating={l.rating} /></td>
                  <td className="py-2 text-right text-foreground">{fmtMM(l.balance)}</td>
                  <td className="py-2 text-right text-muted-foreground">{fmt((l.balance / totalBal) * 100)}%</td>
                </tr>
              ))}
              <tr className="border-t border-border font-medium text-foreground">
                <td className="py-2 text-left" colSpan={2}>Totals / Averages</td>
                <td className="py-2 text-right text-emerald-400 font-mono">{fmt(was, 0)}</td>
                <td className="py-2 text-right text-muted-foreground">{wal}yr WAL</td>
                <td className="py-2 text-right text-muted-foreground">{avgRating}</td>
                <td className="py-2 text-right">{fmtMM(totalBal)}</td>
                <td className="py-2 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Loan balance bars */}
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <SectionHeading title="Position Size" sub="$M balance" />
          <div className="space-y-2">
            {[...LOANS].sort((a, b) => b.balance - a.balance).map((l) => (
              <div key={l.issuer} className="flex items-center gap-2">
                <span className="w-32 text-xs text-muted-foreground truncate">{l.issuer.split(" ")[0]}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(l.balance / maxBal) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{fmtMM(l.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry distribution */}
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <SectionHeading title="Industry Concentration" sub="% of pool balance" />
          <div className="space-y-2">
            {indEntries.map(([ind, bal], idx) => (
              <div key={ind} className="flex items-center gap-2">
                <span className="w-28 text-xs text-muted-foreground truncate">{ind}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(bal / totalBal) * 100}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{fmt((bal / totalBal) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — REINVESTMENT PERIOD SIMULATOR
// ══════════════════════════════════════════════════════════════════════════════

function ReinvestmentTab() {
  const [reinvestSpread, setReinvestSpread] = useState(480);
  const [reinvestPeriod, setReinvestPeriod] = useState(4); // years
  const [prepayRate, setPrepayRate] = useState(15); // % per year

  // Derived equity IRR based on slider inputs
  const baseIRR = 14.2;
  const spreadAdj = ((reinvestSpread - 480) / 100) * 1.8;
  const periodAdj = (reinvestPeriod - 4) * 0.6;
  const prepayAdj = (prepayRate - 15) * -0.12;
  const equityIRR = Math.max(0, baseIRR + spreadAdj + periodAdj + prepayAdj);

  // Note repayment schedule
  const schedule = useMemo(() => {
    const years = [1, 2, 3, 4, 5, 6, 7];
    return years.map((yr) => {
      const prepaid = yr <= reinvestPeriod ? 0 : prepayRate;
      const aaaPay = yr <= reinvestPeriod ? 0 : Math.min(25 * ((yr - reinvestPeriod) / 3), 25);
      return {
        yr,
        prepaid: Math.round(prepaid),
        aaaPay: Math.round(aaaPay * 10) / 10,
        equityCF: yr > reinvestPeriod ? fmt(equityIRR * 0.8 + (yr - reinvestPeriod) * 0.5) : "0.0",
      };
    });
  }, [reinvestPeriod, prepayRate, equityIRR]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Equity IRR (est.)" value={`${fmt(equityIRR)}%`} highlight={equityIRR >= 12 ? "pos" : equityIRR >= 8 ? "neutral" : "neg"} />
        <StatCard label="Reinvestment Period" value={`${reinvestPeriod}yr`} sub="Manager can reinvest" />
        <StatCard label="Prepayment Rate" value={`${prepayRate}%/yr`} sub="Post-reinvestment" />
      </div>

      {/* Sliders */}
      <div className="rounded-md border border-border bg-foreground/5 p-4 space-y-5">
        <SectionHeading title="Reinvestment Assumptions" sub="Adjust to see impact on returns" />

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Reinvestment Spread</span>
            <span className="text-xs font-mono text-foreground">{reinvestSpread} bps</span>
          </div>
          <Slider
            value={[reinvestSpread]}
            onValueChange={([v]) => setReinvestSpread(v)}
            min={300}
            max={650}
            step={10}
            className="my-1"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">300 bps (tight)</span>
            <span className="text-xs text-muted-foreground">650 bps (wide)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Reinvestment Period Length</span>
            <span className="text-xs font-mono text-foreground">{reinvestPeriod} years</span>
          </div>
          <Slider
            value={[reinvestPeriod]}
            onValueChange={([v]) => setReinvestPeriod(v)}
            min={2}
            max={6}
            step={1}
            className="my-1"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">2 yr (short)</span>
            <span className="text-xs text-muted-foreground">6 yr (long)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Annual Prepayment Rate (post-reinvestment)</span>
            <span className="text-xs font-mono text-foreground">{prepayRate}%</span>
          </div>
          <Slider
            value={[prepayRate]}
            onValueChange={([v]) => setPrepayRate(v)}
            min={5}
            max={40}
            step={1}
            className="my-1"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">5% (slow)</span>
            <span className="text-xs text-muted-foreground">40% (fast)</span>
          </div>
        </div>
      </div>

      {/* Note repayment schedule table */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Projected Cash Flow Schedule" sub="Simplified illustration" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-left">Year</th>
                <th className="py-2 text-center">Phase</th>
                <th className="py-2 text-right">Prepay Rate</th>
                <th className="py-2 text-right">AAA Repay ($M)</th>
                <th className="py-2 text-right">Equity CF Est.</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.yr} className="border-b border-border hover:bg-muted/30">
                  <td className="py-2 font-mono text-muted-foreground">Yr {row.yr}</td>
                  <td className="py-2 text-center">
                    <Badge variant="outline" className={cn("text-xs", row.yr <= reinvestPeriod ? "border-primary/40 text-primary" : "border-amber-500/40 text-amber-400")}>
                      {row.yr <= reinvestPeriod ? "Reinvest" : "Amort"}
                    </Badge>
                  </td>
                  <td className="py-2 text-right text-muted-foreground font-mono">
                    {row.yr <= reinvestPeriod ? "—" : `${row.prepaid}%`}
                  </td>
                  <td className="py-2 text-right text-primary font-mono">
                    {row.aaaPay > 0 ? fmtMM(row.aaaPay) : "—"}
                  </td>
                  <td className="py-2 text-right text-emerald-400 font-mono">
                    {row.equityCF !== "0.0" ? `$${row.equityCF}M` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — DEFAULT SCENARIO ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

function DefaultScenariosTab() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const scen = DEFAULT_SCENARIOS[selectedScenario];

  const lossGivenDefault = (1 - scen.recovery / 100) * scen.defaultRate / 100;
  const lossAmt = lossGivenDefault * TOTAL_ASSETS;

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div className="grid grid-cols-3 gap-3">
        {DEFAULT_SCENARIOS.map((sc, idx) => (
          <button
            key={sc.label}
            onClick={() => setSelectedScenario(idx)}
            className={cn(
              "rounded-md border p-4 text-left transition-all",
              selectedScenario === idx
                ? "border-primary/60 bg-muted/40"
                : "border-border bg-foreground/5 hover:bg-muted/50"
            )}
          >
            <p className="text-sm font-medium text-foreground mb-1">{sc.label}</p>
            <p className="text-xs text-muted-foreground">Default: {sc.defaultRate}% · Recovery: {sc.recovery}%</p>
            <p className={cn(
              "text-sm font-bold mt-2",
              sc.equityIRR >= 10 ? "text-emerald-400" : sc.equityIRR >= 0 ? "text-amber-400" : "text-rose-400"
            )}>
              Equity IRR: {sc.equityIRR >= 0 ? "+" : ""}{sc.equityIRR}%
            </p>
          </button>
        ))}
      </div>

      {/* Selected scenario details */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Default Rate" value={`${scen.defaultRate}%`} highlight={scen.defaultRate <= 2 ? "pos" : scen.defaultRate <= 5 ? "neutral" : "neg"} />
        <StatCard label="Recovery Rate" value={`${scen.recovery}%`} />
        <StatCard label="Loss Amount" value={`$${fmt(lossAmt)}M`} highlight={lossAmt < 10 ? "pos" : lossAmt < 25 ? "neutral" : "neg"} sub={`${fmt(lossGivenDefault * 100, 2)}% of pool`} />
        <StatCard label="Equity IRR" value={`${scen.equityIRR >= 0 ? "+" : ""}${scen.equityIRR}%`} highlight={scen.equityIRR >= 10 ? "pos" : scen.equityIRR >= 0 ? "neutral" : "neg"} />
      </div>

      {/* Tranche impairment table */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Tranche Impairment Analysis" sub={`Scenario: ${scen.label} (${scen.defaultRate}% default, ${scen.recovery}% recovery)`} />
        <div className="space-y-3">
          {TRANCHES.map((t) => {
            const impaired = scen.impaired.some((i) => i.startsWith(t.name));
            const partial = scen.impaired.some((i) => i.includes(t.name) && i.includes("partial"));
            const status = impaired ? (partial ? "partial" : "full") : "intact";
            return (
              <div key={t.name} className="flex items-center gap-3">
                <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", t.color)} />
                <span className="w-16 text-sm font-medium text-foreground">{t.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      status === "intact" ? "bg-emerald-500" : status === "partial" ? "bg-amber-500" : "bg-rose-600"
                    )}
                    style={{ width: status === "full" ? "100%" : status === "partial" ? "50%" : "0%" }}
                  />
                </div>
                <span className={cn(
                  "w-24 text-xs text-muted-foreground text-right",
                  status === "intact" ? "text-emerald-400" : status === "partial" ? "text-amber-400" : "text-rose-400"
                )}>
                  {status === "intact" ? "Intact" : status === "partial" ? "Partial loss" : "Impaired"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Equity tranche absorbs first losses. Notes only impaired after equity is exhausted.
        </p>
      </div>

      {/* Scenario comparison */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Cross-Scenario Comparison" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-left">Scenario</th>
                <th className="py-2 text-right">Default Rate</th>
                <th className="py-2 text-right">Recovery</th>
                <th className="py-2 text-right">Loss ($M)</th>
                <th className="py-2 text-right">Equity IRR</th>
                <th className="py-2 text-right">First Loss</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_SCENARIOS.map((sc) => {
                const lgd = (1 - sc.recovery / 100) * sc.defaultRate / 100;
                const loss = lgd * TOTAL_ASSETS;
                return (
                  <tr key={sc.label} className="border-b border-border hover:bg-muted/30">
                    <td className="py-2 font-medium text-foreground">{sc.label}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">{sc.defaultRate}%</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">{sc.recovery}%</td>
                    <td className="py-2 text-right font-mono text-rose-400">${fmt(loss)}M</td>
                    <td className={cn("py-2 text-right font-mono font-medium", sc.equityIRR >= 10 ? "text-emerald-400" : sc.equityIRR >= 0 ? "text-amber-400" : "text-rose-400")}>
                      {sc.equityIRR >= 0 ? "+" : ""}{sc.equityIRR}%
                    </td>
                    <td className="py-2 text-right text-muted-foreground">{sc.firstLossPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 6 — CLO EQUITY RETURNS
// ══════════════════════════════════════════════════════════════════════════════

function EquityReturnsTab() {
  // Fee structure
  const seniorMgmtFee = 0.15; // % of AUM
  const subMgmtFee = 0.35;
  const incentiveFee = 20; // % of equity returns above 12% hurdle

  // NAV SVG chart
  const W = 520;
  const H = 160;
  const PAD = { l: 42, r: 16, t: 16, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxNav = Math.max(...NAV_POINTS.map((p) => p.nav));
  const minNav = Math.min(...NAV_POINTS.map((p) => p.nav));
  const navRange = maxNav - minNav || 1;

  const points = NAV_POINTS.map((p) => {
    const x = PAD.l + (p.quarter / 20) * cW;
    const y = PAD.t + (1 - (p.nav - minNav) / navRange) * cH;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = [
    `${PAD.l},${PAD.t + cH}`,
    ...NAV_POINTS.map((p) => {
      const x = PAD.l + (p.quarter / 20) * cW;
      const y = PAD.t + (1 - (p.nav - minNav) / navRange) * cH;
      return `${x},${y}`;
    }),
    `${PAD.l + cW},${PAD.t + cH}`,
  ].join(" ");

  // IRR waterfall by scenario (SVG bars)
  const irrData = DEFAULT_SCENARIOS.map((sc) => ({ label: sc.label, irr: sc.equityIRR }));
  const irrMax = 20;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Base Case IRR" value="+14.2%" highlight="pos" sub="Equity tranche" />
        <StatCard label="Senior Mgmt Fee" value={`${seniorMgmtFee}%`} sub="Of total AUM" />
        <StatCard label="Sub Mgmt Fee" value={`${subMgmtFee}%`} sub="Of total AUM" />
        <StatCard label="Incentive Fee" value={`${incentiveFee}%`} sub="Above 12% hurdle" />
      </div>

      {/* NAV chart */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Equity NAV Over Time" sub="Indexed to 100 at closing (20 quarters)" />
        <div className="overflow-x-auto">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD.t + t * cH;
              const val = maxNav - t * navRange;
              return (
                <g key={t}>
                  <line x1={PAD.l} y1={y} x2={PAD.l + cW} y2={y} stroke="#27272a" strokeWidth={1} />
                  <text x={PAD.l - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#71717a">
                    {Math.round(val)}
                  </text>
                </g>
              );
            })}
            {/* X-axis labels */}
            {[0, 4, 8, 12, 16, 20].map((q) => (
              <text key={q} x={PAD.l + (q / 20) * cW} y={H - 6} textAnchor="middle" fontSize={9} fill="#71717a">
                Q{q}
              </text>
            ))}
            {/* Area fill */}
            <polygon points={areaPoints} fill="url(#navGrad)" />
            {/* Line */}
            <polyline points={points} fill="none" stroke="#10b981" strokeWidth={2} />
            {/* Dots */}
            {NAV_POINTS.filter((p) => p.quarter % 4 === 0).map((p) => {
              const x = PAD.l + (p.quarter / 20) * cW;
              const y = PAD.t + (1 - (p.nav - minNav) / navRange) * cH;
              return <circle key={p.quarter} cx={x} cy={y} r={3} fill="#10b981" />;
            })}
          </svg>
        </div>
      </div>

      {/* IRR by scenario bars */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="IRR Waterfall by Scenario" sub="Equity tranche returns" />
        <div className="flex items-end gap-3 h-32 px-4">
          {irrData.map((d) => {
            const pct = Math.max(0, (d.irr / irrMax) * 100);
            const isNeg = d.irr < 0;
            return (
              <div key={d.label} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className={cn("text-xs font-medium mb-1", isNeg ? "text-rose-400" : d.irr >= 10 ? "text-emerald-400" : "text-amber-400")}>
                  {d.irr >= 0 ? "+" : ""}{d.irr}%
                </span>
                <div
                  className={cn("w-full rounded-t-md", isNeg ? "bg-rose-600" : d.irr >= 10 ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                <span className="text-xs text-muted-foreground mt-1">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fee structure breakdown */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <SectionHeading title="Fee Structure" sub="CLO manager compensation" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { name: "Senior Management Fee", rate: `${seniorMgmtFee}% p.a.`, desc: "Paid quarterly on total AUM. Top of the waterfall, senior to all note interest.", color: "text-primary" },
            { name: "Subordinate Management Fee", rate: `${subMgmtFee}% p.a.`, desc: "Paid after coverage tests pass. Junior to note coupons but senior to equity.", color: "text-amber-300" },
            { name: "Incentive / Performance Fee", rate: `${incentiveFee}% above 12% hurdle`, desc: "Aligns manager with equity. Only earned once equity IRR exceeds the hurdle rate.", color: "text-emerald-300" },
          ].map((fee) => (
            <div key={fee.name} className="rounded-lg bg-foreground/5 p-3">
              <p className={cn("text-xs text-muted-foreground font-medium mb-1", fee.color)}>{fee.name}</p>
              <p className="text-sm font-medium text-foreground mb-1">{fee.rate}</p>
              <p className="text-xs text-muted-foreground">{fee.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: "structure",    label: "Structure",    icon: Layers },
  { id: "coverage",     label: "Coverage",     icon: ShieldCheck },
  { id: "portfolio",    label: "Portfolio",    icon: BarChart3 },
  { id: "reinvestment", label: "Reinvestment", icon: RefreshCcw },
  { id: "defaults",     label: "Defaults",     icon: AlertTriangle },
  { id: "equity",       label: "Equity",       icon: TrendingUp },
];

export default function CLOManagerPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* HERO Header */}
      <div className="border-b border-border border-l-4 border-l-primary bg-card/60 px-6 py-6">
        <div className="flex items-center gap-3 mb-1">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">CLO Manager</h1>
          <Badge variant="outline" className="border-primary/40 text-primary text-xs">
            $500M CLO
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Collateralized Loan Obligation — full lifecycle simulation: structure, coverage tests, portfolio analytics, reinvestment, default scenarios, and equity returns.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <Tabs defaultValue="structure">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6 bg-card/60 border border-border p-1 rounded-md">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="structure" className="data-[state=inactive]:hidden">
            <StructureTab />
          </TabsContent>
          <TabsContent value="coverage" className="data-[state=inactive]:hidden">
            <CoverageTab />
          </TabsContent>
          <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
            <PortfolioTab />
          </TabsContent>
          <TabsContent value="reinvestment" className="data-[state=inactive]:hidden">
            <ReinvestmentTab />
          </TabsContent>
          <TabsContent value="defaults" className="data-[state=inactive]:hidden">
            <DefaultScenariosTab />
          </TabsContent>
          <TabsContent value="equity" className="data-[state=inactive]:hidden">
            <EquityReturnsTab />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
