"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Activity,
  Layers,
  Target,
  ShieldAlert,
  Scale,
  RefreshCw,
  AlertTriangle,
  Info,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 905;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 905;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PortfolioStock {
  ticker: string;
  name: string;
  weight: number; // % of NAV, positive = long, negative = short
  beta: number;
  sector: string;
  side: "long" | "short";
}

interface PairsBar {
  bar: number;
  spread: number;
  zscore: number;
  position: "long" | "short" | "none";
}

interface HFRIPoint {
  year: string;
  hfri: number;
  sp500: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const LONG_BOOK: PortfolioStock[] = [
  { ticker: "AAPL", name: "Apple", weight: 14, beta: 1.22, sector: "Tech", side: "long" },
  { ticker: "MSFT", name: "Microsoft", weight: 13, beta: 0.95, sector: "Tech", side: "long" },
  { ticker: "JPM", name: "JPMorgan", weight: 12, beta: 1.18, sector: "Financials", side: "long" },
  { ticker: "UNH", name: "UnitedHealth", weight: 11, beta: 0.62, sector: "Healthcare", side: "long" },
  { ticker: "AMZN", name: "Amazon", weight: 10, beta: 1.35, sector: "Consumer", side: "long" },
  { ticker: "XOM", name: "Exxon", weight: 10, beta: 0.88, sector: "Energy", side: "long" },
  { ticker: "V", name: "Visa", weight: 9, beta: 0.93, sector: "Financials", side: "long" },
  { ticker: "PG", name: "P&G", weight: 8, beta: 0.52, sector: "Staples", side: "long" },
  { ticker: "NVDA", name: "Nvidia", weight: 7, beta: 1.71, sector: "Tech", side: "long" },
  { ticker: "HD", name: "Home Depot", weight: 6, beta: 1.05, sector: "Consumer", side: "long" },
];

const SHORT_BOOK: PortfolioStock[] = [
  { ticker: "GME", name: "GameStop", weight: -12, beta: 1.85, sector: "Consumer", side: "short" },
  { ticker: "AMC", name: "AMC Ent.", weight: -10, beta: 1.62, sector: "Consumer", side: "short" },
  { ticker: "BBBY", name: "Bed Bath", weight: -9, beta: 1.44, sector: "Consumer", side: "short" },
  { ticker: "RIDE", name: "Lordstown", weight: -8, beta: 1.33, sector: "Auto", side: "short" },
  { ticker: "SPCE", name: "Virgin Galactic", weight: -7, beta: 1.52, sector: "Aerospace", side: "short" },
];

const SHORT_BORROW_RATES: { sector: string; rate: number; htb: boolean }[] = [
  { sector: "Large-Cap Tech", rate: 0.3, htb: false },
  { sector: "S&P 500 ETF", rate: 0.25, htb: false },
  { sector: "Mid-Cap Growth", rate: 1.2, htb: false },
  { sector: "Small-Cap Value", rate: 2.8, htb: false },
  { sector: "Biotech / Spec.", rate: 8.5, htb: true },
  { sector: "Meme Stocks", rate: 32.0, htb: true },
  { sector: "Recent IPOs", rate: 18.5, htb: true },
  { sector: "Micro-Cap", rate: 45.0, htb: true },
];

const HFRI_DATA: HFRIPoint[] = [
  { year: "2014", hfri: 2.0, sp500: 13.7 },
  { year: "2015", hfri: -1.1, sp500: 1.4 },
  { year: "2016", hfri: 5.4, sp500: 12.0 },
  { year: "2017", hfri: 13.3, sp500: 21.8 },
  { year: "2018", hfri: -4.1, sp500: -4.4 },
  { year: "2019", hfri: 13.6, sp500: 31.5 },
  { year: "2020", hfri: 17.7, sp500: 18.4 },
  { year: "2021", hfri: 14.4, sp500: 28.7 },
  { year: "2022", hfri: -8.0, sp500: -18.1 },
  { year: "2023", hfri: 11.2, sp500: 26.3 },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function generatePairsBars(): PairsBar[] {
  resetSeed();
  const bars: PairsBar[] = [];
  let spread = 0;
  let pos: "long" | "short" | "none" = "none";
  for (let i = 0; i < 50; i++) {
    // mean-reverting random walk
    spread = spread * 0.85 + (rand() - 0.5) * 2.5;
    const mean = 0;
    const std = 1.2;
    const z = (spread - mean) / std;
    if (z > 2.0 && pos !== "short") pos = "short";
    else if (z < -2.0 && pos !== "long") pos = "long";
    else if (Math.abs(z) < 0.3) pos = "none";
    bars.push({ bar: i, spread, zscore: z, position: pos });
  }
  return bars;
}

// ── Sub-Components ─────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  positive,
  neutral,
}: {
  label: string;
  value: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="bg-muted/60 rounded-lg px-3 py-2 flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold",
          neutral ? "text-foreground" : positive ? "text-emerald-400" : "text-red-400"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground mb-3">
      {children}
    </h3>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 1 — L/S Portfolio Structure
// ══════════════════════════════════════════════════════════════════════════════

function PortfolioStructureTab() {
  const longWeight = LONG_BOOK.reduce((a, s) => a + s.weight, 0); // 100
  const shortWeight = Math.abs(SHORT_BOOK.reduce((a, s) => a + s.weight, 0)); // 46
  const gross = longWeight + shortWeight; // 146
  const net = longWeight - shortWeight; // 54

  const longBetaContrib = LONG_BOOK.reduce((a, s) => a + (s.weight / 100) * s.beta, 0);
  const shortBetaContrib = SHORT_BOOK.reduce((a, s) => a + (Math.abs(s.weight) / 100) * s.beta, 0);
  const netBeta = longBetaContrib - shortBetaContrib;

  // Sector exposure
  const sectorMap: Record<string, { long: number; short: number }> = {};
  LONG_BOOK.forEach((s) => {
    if (!sectorMap[s.sector]) sectorMap[s.sector] = { long: 0, short: 0 };
    sectorMap[s.sector].long += s.weight;
  });
  SHORT_BOOK.forEach((s) => {
    if (!sectorMap[s.sector]) sectorMap[s.sector] = { long: 0, short: 0 };
    sectorMap[s.sector].short += Math.abs(s.weight);
  });

  const sectors = Object.entries(sectorMap);

  // SVG exposure decomposition
  const svgW = 460;
  const svgH = 160;
  const barH = 32;
  const barY = (svgH - barH) / 2;

  const maxBar = 140;
  const bookTypes = [
    { label: "130/30", long: 130, short: 30, net: 100, color: "#6366f1" },
    { label: "Market Neutral", long: 100, short: 100, net: 0, color: "#22c55e" },
    { label: "Long-Biased (80/20)", long: 80, short: 20, net: 60, color: "#f59e0b" },
    { label: "This Portfolio", long: 100, short: 46, net: 54, color: "#38bdf8" },
  ];

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Gross Exposure" value={`${gross}%`} neutral />
        <StatChip label="Net Exposure" value={`${net}%`} positive />
        <StatChip label="Long Book" value={`${longWeight}%`} positive />
        <StatChip label="Short Book" value={`${shortWeight}%`} positive={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatChip label="Long Beta Contrib" value={longBetaContrib.toFixed(2)} positive />
        <StatChip label="Short Beta Contrib" value={shortBetaContrib.toFixed(2)} positive={false} />
        <StatChip label="Net Portfolio Beta" value={netBeta.toFixed(2)} neutral />
      </div>

      {/* Exposure decomposition SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Book Structure Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH + 40}`} className="w-full" style={{ maxHeight: 200 }}>
            {bookTypes.map((bt, i) => {
              const y = 10 + i * 38;
              const longW = (bt.long / 150) * maxBar;
              const shortW = (bt.short / 150) * maxBar;
              const netX = 330 + (bt.net / 150) * 60;
              return (
                <g key={bt.label}>
                  <text x={0} y={y + 10} fontSize={9} fill="#9ca3af">
                    {bt.label}
                  </text>
                  {/* Long bar */}
                  <rect x={160} y={y} width={longW} height={14} fill="#22c55e" opacity={0.7} rx={2} />
                  <text x={162 + longW} y={y + 10} fontSize={8} fill="#22c55e">
                    L:{bt.long}%
                  </text>
                  {/* Short bar */}
                  <rect x={160} y={y + 16} width={shortW} height={10} fill="#ef4444" opacity={0.7} rx={2} />
                  <text x={162 + shortW} y={y + 24} fontSize={8} fill="#ef4444">
                    S:{bt.short}%
                  </text>
                  {/* Net dot */}
                  <circle cx={netX} cy={y + 13} r={5} fill={bt.color} />
                  <text x={netX + 8} y={y + 17} fontSize={8} fill={bt.color}>
                    Net {bt.net}%
                  </text>
                </g>
              );
            })}
            {/* Axis */}
            <line x1={160} y1={0} x2={160} y2={svgH} stroke="#374151" strokeWidth={1} />
            <text x={160} y={svgH + 14} fontSize={8} fill="#6b7280" textAnchor="middle">
              0%
            </text>
            <text x={160 + (150 / 150) * maxBar} y={svgH + 14} fontSize={8} fill="#6b7280" textAnchor="middle">
              150%
            </text>
          </svg>
        </CardContent>
      </Card>

      {/* Portfolio table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Long book */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Long Book (10 positions)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-muted-foreground">Ticker</th>
                  <th className="text-right px-3 py-2 text-muted-foreground">Weight</th>
                  <th className="text-right px-3 py-2 text-muted-foreground">Beta</th>
                  <th className="text-left px-3 py-2 text-muted-foreground">Sector</th>
                </tr>
              </thead>
              <tbody>
                {LONG_BOOK.map((st) => (
                  <tr key={st.ticker} className="border-b border-border hover:bg-muted/40">
                    <td className="px-3 py-1.5 font-semibold text-foreground">{st.ticker}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-400">+{st.weight}%</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{st.beta.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{st.sector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Short book */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Short Book (5 positions)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-muted-foreground">Ticker</th>
                  <th className="text-right px-3 py-2 text-muted-foreground">Weight</th>
                  <th className="text-right px-3 py-2 text-muted-foreground">Beta</th>
                  <th className="text-left px-3 py-2 text-muted-foreground">Sector</th>
                </tr>
              </thead>
              <tbody>
                {SHORT_BOOK.map((st) => (
                  <tr key={st.ticker} className="border-b border-border hover:bg-muted/40">
                    <td className="px-3 py-1.5 font-medium text-foreground">{st.ticker}</td>
                    <td className="px-3 py-1.5 text-right text-red-400">{st.weight}%</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{st.beta.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{st.sector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-3 border-t border-border space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">Net Beta Contribution</span>
                <span className="text-sky-400 font-medium">{netBeta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">Effective Market Sensitivity</span>
                <span className="text-foreground">
                  {netBeta > 0.3
                    ? "Long-Biased"
                    : netBeta > -0.1
                    ? "Near-Neutral"
                    : "Short-Biased"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector neutralization */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            Sector Exposure (Net = Long − Short)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sectors.map(([sector, { long: l, short: sh }]) => {
              const net = l - sh;
              const maxNet = 30;
              const pct = Math.min(Math.abs(net) / maxNet, 1) * 100;
              return (
                <div key={sector} className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="w-28 text-muted-foreground shrink-0">{sector}</span>
                  <span className="w-10 text-right text-emerald-400">+{l}%</span>
                  <span className="w-10 text-right text-red-400">{sh > 0 ? `-${sh}%` : "—"}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        net > 5
                          ? "bg-emerald-500"
                          : net < -5
                          ? "bg-red-500"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "w-12 text-right font-medium",
                      net > 5 ? "text-emerald-400" : net < -5 ? "text-red-400" : "text-amber-400"
                    )}
                  >
                    {net > 0 ? "+" : ""}
                    {net}%
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Factor neutralization targets: market beta &lt;0.3, sector tilt &lt;10%, style (value/growth) &lt;15%.
            Residual idiosyncratic exposure drives alpha.
          </p>
        </CardContent>
      </Card>

      {/* Risk budget */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Risk Budget Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Idiosyncratic", pct: 55, color: "bg-indigo-500" },
              { label: "Sector/Style", pct: 20, color: "bg-amber-500" },
              { label: "Market Beta", pct: 15, color: "bg-sky-500" },
              { label: "Liquidity Risk", pct: 10, color: "bg-rose-500" },
            ].map((rb) => (
              <div key={rb.label} className="bg-muted/60 rounded-lg p-3 flex flex-col gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{rb.label}</span>
                <div className="h-2 bg-muted rounded-full">
                  <div className={`h-full rounded-full ${rb.color}`} style={{ width: `${rb.pct}%` }} />
                </div>
                <span className="text-sm font-bold text-foreground">{rb.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 2 — Short Selling
// ══════════════════════════════════════════════════════════════════════════════

function ShortSellingTab() {
  const [squeezeStep, setSqueezeStep] = useState(0);

  const squeezeSteps = [
    { label: "High Short Interest", detail: "Short float >30%. Many investors betting against the stock.", price: 4, color: "#ef4444" },
    { label: "Positive Catalyst", detail: "Surprise earnings / Reddit buzz creates buying pressure.", price: 7, color: "#f59e0b" },
    { label: "Price Rises", detail: "Stock jumps — shorts are now losing money rapidly.", price: 18, color: "#f59e0b" },
    { label: "Forced Covering", detail: "Brokers issue margin calls. Shorts must buy to close positions.", price: 42, color: "#22c55e" },
    { label: "Peak Squeeze", detail: "Buying avalanche pushes price to extremes. (GME: $4 → $483)", price: 483, color: "#a78bfa" },
    { label: "Unwind", detail: "Squeeze exhausts. Price reverts as retail exits.", price: 48, color: "#6b7280" },
  ];

  // SVG borrow rates chart
  const maxRate = 50;
  const barWidth = 42;
  const chartH = 120;

  // GME squeeze SVG path
  const squeezePoints = [4, 4.5, 5, 5.8, 7, 8, 12, 18, 28, 42, 80, 150, 280, 483, 350, 200, 120, 80, 60, 48];
  const sqW = 400;
  const sqH = 130;
  const sqMaxP = 500;
  const toX = (i: number) => 20 + (i / (squeezePoints.length - 1)) * (sqW - 40);
  const toY = (p: number) => sqH - 15 - ((p / sqMaxP) * (sqH - 30));
  const sqPath = squeezePoints.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p)}`).join(" ");

  return (
    <div className="space-y-4">
      {/* Borrow mechanics flow */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-sky-400" />
            Short Sale Mechanics — Step-by-Step
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { step: "1", label: "Locate", desc: "Prime broker finds shares to borrow from lending desk or custodians" },
              { step: "2", label: "Borrow", desc: "Fund pays borrow fee (annualized %). Borrower posts 102% margin as collateral" },
              { step: "3", label: "Short Sell", desc: "Fund sells borrowed shares in open market, receives cash proceeds" },
              { step: "4", label: "Price Decline", desc: "Target stock falls as anticipated — unrealized gain grows" },
              { step: "5", label: "Buy-to-Cover", desc: "Fund purchases shares back in market at lower price" },
              { step: "6", label: "Return Shares", desc: "Borrowed shares returned to lender. Collateral released. Profit = entry − exit − borrow costs" },
            ].map((item, idx) => (
              <div key={item.step} className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[11px] font-bold text-sky-400">
                    {item.step}
                  </div>
                  {idx < 5 && (
                    <div className="w-0.5 h-3 bg-muted" />
                  )}
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1 min-w-[160px] max-w-[220px] mb-2">
                  <div className="text-xs font-medium text-foreground mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Borrow rates by sector */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Hard-to-Borrow (HTB) Rates by Segment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            viewBox={`0 0 ${SHORT_BORROW_RATES.length * (barWidth + 8) + 60} ${chartH + 50}`}
            className="w-full"
            style={{ maxHeight: 200 }}
          >
            {/* Grid lines */}
            {[0, 10, 20, 30, 40, 50].map((v) => {
              const y = chartH - (v / maxRate) * chartH + 5;
              return (
                <g key={v}>
                  <line x1={50} x2={SHORT_BORROW_RATES.length * (barWidth + 8) + 50} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
                  <text x={45} y={y + 3} fontSize={8} fill="#6b7280" textAnchor="end">{v}%</text>
                </g>
              );
            })}
            {SHORT_BORROW_RATES.map((b, i) => {
              const barH2 = (b.rate / maxRate) * chartH;
              const x = 55 + i * (barWidth + 8);
              const y = chartH - barH2 + 5;
              const barColor = b.htb ? "#ef4444" : "#22c55e";
              return (
                <g key={b.sector}>
                  <rect x={x} y={y} width={barWidth} height={barH2} fill={barColor} opacity={0.75} rx={3} />
                  <text x={x + barWidth / 2} y={y - 3} fontSize={8} fill={barColor} textAnchor="middle" fontWeight="600">
                    {b.rate}%
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={chartH + 14}
                    fontSize={7.5}
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    {b.sector.split(" ").map((w, wi) => (
                      <tspan key={wi} x={x + barWidth / 2} dy={wi === 0 ? 0 : 9}>
                        {w}
                      </tspan>
                    ))}
                  </text>
                  {b.htb && (
                    <text x={x + barWidth / 2} y={y - 11} fontSize={7} fill="#f87171" textAnchor="middle">
                      HTB
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500" />Easy borrow
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded bg-red-500" />Hard to borrow (HTB)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Short squeeze interactive */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Short Squeeze Mechanics — GME 2021 (Jan)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {squeezeSteps.map((st, i) => (
              <button
                key={i}
                onClick={() => setSqueezeStep(i)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs text-muted-foreground font-medium border transition-all",
                  squeezeStep === i
                    ? "bg-muted border-muted-foreground text-foreground"
                    : "bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={squeezeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 bg-muted/50 rounded-lg p-3"
            >
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: squeezeSteps[squeezeStep].color }}
              >
                ${squeezeSteps[squeezeStep].price.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{squeezeSteps[squeezeStep].detail}</p>
            </motion.div>
          </AnimatePresence>

          <svg viewBox={`0 0 ${sqW} ${sqH}`} className="w-full" style={{ maxHeight: 160 }}>
            <defs>
              <linearGradient id="sqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={sqPath + ` L${toX(squeezePoints.length - 1)},${sqH - 15} L${toX(0)},${sqH - 15} Z`} fill="url(#sqGrad)" />
            <path d={sqPath} stroke="#a78bfa" strokeWidth={2} fill="none" />
            {/* Annotations */}
            <text x={toX(0)} y={toY(4) - 6} fontSize={8} fill="#9ca3af">$4</text>
            <text x={toX(13) - 6} y={toY(483) - 6} fontSize={8} fill="#a78bfa" fontWeight="bold">$483</text>
            <circle cx={toX(13)} cy={toY(483)} r={4} fill="#a78bfa" />
            <line x1={20} y1={sqH - 15} x2={sqW - 20} y2={sqH - 15} stroke="#374151" strokeWidth={0.5} />
          </svg>
        </CardContent>
      </Card>

      {/* Short seller risks */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            Short Seller Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Unlimited Loss Potential", desc: "A stock can rise 100× but can only fall 100%. Asymmetric risk profile — long P&L bounded at -100%, short P&L unbounded.", severity: "critical" },
              { title: "Borrow Recall", desc: "Lender can recall shares at any time, forcing immediate buy-to-cover regardless of position conviction or market conditions.", severity: "high" },
              { title: "Dividend Obligation", desc: "Short seller must pay dividends to the lender of shares. Ex-dividend dates add unexpected cash obligations.", severity: "medium" },
              { title: "Crowded Short Risk", desc: "When many funds short the same stock, any positive news triggers simultaneous covering, amplifying losses.", severity: "high" },
              { title: "Short Rebate Economics", desc: "Easy-borrow: lender pays rebate (Fed Funds − fee) to short seller. HTB: short seller pays premium to lender. Negative carry erodes returns.", severity: "medium" },
              { title: "Uptick Rule / Naked Short Ban", desc: "SEC Rule 201 prevents shorting on downticks >10% intraday. Naked shorts (selling without locating borrows) are illegal.", severity: "medium" },
            ].map((risk) => (
              <div
                key={risk.title}
                className={cn(
                  "rounded-lg p-3 border",
                  risk.severity === "critical"
                    ? "bg-red-950/30 border-red-800/40"
                    : risk.severity === "high"
                    ? "bg-orange-950/30 border-orange-800/40"
                    : "bg-amber-950/20 border-amber-800/30"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={cn(
                      "text-[11px] px-1.5",
                      risk.severity === "critical"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : risk.severity === "high"
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    )}
                    variant="outline"
                  >
                    {risk.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-medium text-foreground">{risk.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{risk.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 3 — Pairs Trading
// ══════════════════════════════════════════════════════════════════════════════

function PairsTradingTab() {
  const pairsBars = useMemo(() => {
    resetSeed();
    return generatePairsBars();
  }, []);

  const svgW = 500;
  const svgH = 150;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;

  const minZ = Math.min(...pairsBars.map((b) => b.zscore));
  const maxZ = Math.max(...pairsBars.map((b) => b.zscore));
  const zRange = Math.max(Math.abs(minZ), Math.abs(maxZ), 3) * 1.1;

  const toX2 = (i: number) => padL + (i / (pairsBars.length - 1)) * innerW;
  const toY2 = (z: number) => padT + ((zRange - z) / (2 * zRange)) * innerH;

  const zPath = pairsBars.map((b, i) => `${i === 0 ? "M" : "L"}${toX2(i)},${toY2(b.zscore)}`).join(" ");

  // Shade long zones (z < -2)
  const longZones: { x1: number; x2: number }[] = [];
  const shortZones: { x1: number; x2: number }[] = [];
  let cur: { type: string; start: number } | null = null;
  pairsBars.forEach((b, i) => {
    const type = b.zscore < -2 ? "long" : b.zscore > 2 ? "short" : null;
    if (type !== (cur?.type ?? null)) {
      if (cur) {
        (cur.type === "long" ? longZones : shortZones).push({ x1: toX2(cur.start), x2: toX2(i) });
      }
      cur = type ? { type, start: i } : null;
    }
  });
  if (cur) {
    const finalCur = cur as { type: string; start: number };
    (finalCur.type === "long" ? longZones : shortZones).push({ x1: toX2(finalCur.start), x2: toX2(pairsBars.length - 1) });
  }

  const y0 = toY2(0);
  const yPos2 = toY2(2);
  const yNeg2 = toY2(-2);

  return (
    <div className="space-y-4">
      {/* Cointegration concept */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Cointegration vs Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3">
              <div className="text-xs font-medium text-amber-400 mb-1">Correlation</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Two series move together on a short-term basis. Can break down permanently.
                AAPL and MSFT are correlated (r ≈ 0.85) but their spread can diverge indefinitely.
              </p>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-3">
              <div className="text-xs font-medium text-emerald-400 mb-1">Cointegration</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A linear combination of two non-stationary series is stationary.
                Spread = P_A − β × P_B is mean-reverting with half-life τ. This is what pairs trading exploits.
              </p>
            </div>
          </div>
          <div className="mt-3 bg-muted/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Engle-Granger test: regress P_A on P_B → residuals ε_t. Run ADF on ε_t.
              If ADF t-stat &lt; critical value (−3.37 at 5%), series are cointegrated.
              Mean-reversion half-life: τ = −ln(2) / ln(ρ) where ρ = AR(1) coefficient on spread.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Spread Z-score SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            AAPL / MSFT Spread Z-Score — 50 Bars (Simulated, seed 905)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 190 }}>
            {/* Shading */}
            {longZones.map((z, i) => (
              <rect key={`l${i}`} x={z.x1} y={yNeg2} width={z.x2 - z.x1} height={svgH - padB - yNeg2} fill="#22c55e" opacity={0.08} />
            ))}
            {shortZones.map((z, i) => (
              <rect key={`s${i}`} x={z.x1} y={padT} width={z.x2 - z.x1} height={yPos2 - padT} fill="#ef4444" opacity={0.08} />
            ))}
            {/* Bands */}
            <line x1={padL} x2={svgW - padR} y1={yPos2} y2={yPos2} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
            <line x1={padL} x2={svgW - padR} y1={yNeg2} y2={yNeg2} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
            <line x1={padL} x2={svgW - padR} y1={y0} y2={y0} stroke="#6b7280" strokeWidth={1} strokeDasharray="2 3" />
            {/* Labels */}
            <text x={svgW - padR + 2} y={yPos2 + 3} fontSize={8} fill="#ef4444">+2σ</text>
            <text x={svgW - padR + 2} y={yNeg2 + 3} fontSize={8} fill="#22c55e">-2σ</text>
            <text x={svgW - padR + 2} y={y0 + 3} fontSize={8} fill="#6b7280">0</text>
            {/* Z-score path */}
            <path d={zPath} stroke="#818cf8" strokeWidth={1.5} fill="none" />
            {/* Entry/exit dots */}
            {pairsBars.map((b, i) => {
              const wasNone = i === 0 ? true : pairsBars[i - 1].position === "none";
              const isEntry = b.position !== "none" && wasNone;
              const isExit = b.position === "none" && !wasNone;
              if (!isEntry && !isExit) return null;
              return (
                <circle
                  key={i}
                  cx={toX2(i)}
                  cy={toY2(b.zscore)}
                  r={4}
                  fill={isEntry ? (b.position === "long" ? "#22c55e" : "#ef4444") : "#f59e0b"}
                  opacity={0.9}
                />
              );
            })}
            {/* X axis */}
            <line x1={padL} x2={svgW - padR} y1={svgH - padB} y2={svgH - padB} stroke="#374151" strokeWidth={0.5} />
            {[0, 10, 20, 30, 40, 49].map((idx) => (
              <text key={idx} x={toX2(idx)} y={svgH - padB + 10} fontSize={8} fill="#6b7280" textAnchor="middle">
                {idx}
              </text>
            ))}
          </svg>
          <div className="flex gap-4 flex-wrap mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-emerald-500" />Entry long spread (z &lt; -2σ)</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-red-500" />Entry short spread (z &gt; +2σ)</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-amber-500" />Exit (z → 0)</div>
          </div>
        </CardContent>
      </Card>

      {/* P&L simulation */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Pairs P&amp;L Simulation — Cumulative (seed 905)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PairsPnLChart bars={pairsBars} />
        </CardContent>
      </Card>

      {/* Risks */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            Convergence vs Divergence Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-3">
              <div className="text-xs font-medium text-emerald-400 mb-1">Convergence (Expected)</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spread reverts to mean. Both legs profit — long leg rises and short leg falls.
                Half-life typically 5–20 days for sector pairs. Alpha = spread width − transaction costs − borrow.
              </p>
            </div>
            <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-3">
              <div className="text-xs font-medium text-red-400 mb-1">Divergence (Tail Risk)</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spread widens further after entry (structural break, M&amp;A, earnings shock).
                Both legs lose simultaneously. Cointegration can break permanently — use stop-loss at ±3σ.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PairsPnLChart({ bars }: { bars: PairsBar[] }) {
  // Simulate P&L: +spread when long, -spread when short per bar
  let cumPnL = 0;
  const pnlSeries: { bar: number; pnl: number }[] = [];
  bars.forEach((b, i) => {
    if (i === 0) {
      pnlSeries.push({ bar: 0, pnl: 0 });
      return;
    }
    const prev = bars[i - 1];
    if (prev.position === "long") cumPnL += -(b.zscore - prev.zscore) * 0.5;
    else if (prev.position === "short") cumPnL += (b.zscore - prev.zscore) * 0.5;
    pnlSeries.push({ bar: i, pnl: cumPnL });
  });

  const svgW = 460;
  const svgH = 120;
  const padL = 42;
  const padR = 15;
  const padT = 15;
  const padB = 25;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;

  const minP = Math.min(...pnlSeries.map((p) => p.pnl));
  const maxP = Math.max(...pnlSeries.map((p) => p.pnl));
  const pRange = Math.max(Math.abs(minP), Math.abs(maxP), 0.5) * 1.2;

  const tx = (i: number) => padL + (i / (pnlSeries.length - 1)) * innerW;
  const ty = (p: number) => padT + ((pRange - p) / (2 * pRange)) * innerH;
  const y0 = ty(0);

  const linePath = pnlSeries.map((pt, i) => `${i === 0 ? "M" : "L"}${tx(i)},${ty(pt.pnl)}`).join(" ");
  const areaPath = linePath + ` L${tx(pnlSeries.length - 1)},${y0} L${tx(0)},${y0} Z`;

  const finalPnL = pnlSeries[pnlSeries.length - 1].pnl;

  return (
    <div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 150 }}>
        <defs>
          <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={finalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0.25} />
            <stop offset="100%" stopColor={finalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pnlGrad)" />
        <path d={linePath} stroke={finalPnL >= 0 ? "#22c55e" : "#ef4444"} strokeWidth={1.5} fill="none" />
        <line x1={padL} x2={svgW - padR} y1={y0} y2={y0} stroke="#374151" strokeWidth={0.5} strokeDasharray="3 3" />
        {[-2, -1, 0, 1, 2].map((v) => {
          const actualV = (v / 2) * pRange;
          return (
            <text key={v} x={padL - 4} y={ty(actualV) + 3} fontSize={8} fill="#6b7280" textAnchor="end">
              {actualV.toFixed(1)}
            </text>
          );
        })}
        {[0, 10, 20, 30, 40, 49].map((idx) => (
          <text key={idx} x={tx(idx)} y={svgH - padB + 12} fontSize={8} fill="#6b7280" textAnchor="middle">{idx}</text>
        ))}
        <text x={svgW - padR} y={ty(finalPnL) - 4} fontSize={8} fill={finalPnL >= 0 ? "#22c55e" : "#ef4444"} textAnchor="end">
          {finalPnL >= 0 ? "+" : ""}{finalPnL.toFixed(2)}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground mt-1">
        Cumulative P&L units (normalized spread). Entry ±2σ, exit at 0σ. Positive = profitable mean reversion.
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 4 — Fund Economics
// ══════════════════════════════════════════════════════════════════════════════

function FundEconomicsTab() {
  // High watermark SVG data
  const hwmYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const hwmNAV = [100, 118, 145, 125, 152, 168, 180];
  const hwmHWM = [100, 118, 145, 145, 152, 168, 180];
  const hwmPerfFee = hwmNAV.map((nav, i) => {
    const hwm = hwmHWM[i];
    const prev = i === 0 ? 100 : hwmNAV[i - 1];
    const gain = Math.max(0, nav - Math.max(hwm, prev));
    return gain * 0.2;
  });

  const svgW = 460;
  const svgH = 150;
  const padL = 45;
  const padR = 15;
  const padT = 15;
  const padB = 30;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;
  const minV = 80;
  const maxV = 200;
  const toXh = (i: number) => padL + (i / (hwmYears.length - 1)) * innerW;
  const toYh = (v: number) => padT + ((maxV - v) / (maxV - minV)) * innerH;

  const navPath = hwmNAV.map((v, i) => `${i === 0 ? "M" : "L"}${toXh(i)},${toYh(v)}`).join(" ");
  const hwmPath = hwmHWM.map((v, i) => `${i === 0 ? "M" : "L"}${toXh(i)},${toYh(v)}`).join(" ");

  // HFRI vs S&P SVG
  const hSvgW = 460;
  const hSvgH = 160;
  const hPadL = 40;
  const hPadT = 15;
  const hPadB = 30;
  const hInnerW = hSvgW - hPadL - 20;
  const hInnerH = hSvgH - hPadT - hPadB;
  const barW = hInnerW / HFRI_DATA.length / 2.2;
  const maxAbs = Math.max(...HFRI_DATA.flatMap((d) => [Math.abs(d.hfri), Math.abs(d.sp500)]));
  const toBarX = (i: number) => hPadL + i * (hInnerW / HFRI_DATA.length);
  const toBarH = (v: number) => (Math.abs(v) / (maxAbs * 1.1)) * (hInnerH / 2);
  const zeroY = hPadT + hInnerH / 2;

  return (
    <div className="space-y-4">
      {/* 2 and 20 */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" />
            The "2 and 20" Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-lg font-medium text-amber-400 mb-1">2%</div>
              <div className="text-xs font-medium text-foreground mb-1">Management Fee</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Annual fee on AUM (gross assets). Paid monthly regardless of performance.
                On a $1B fund = $20M/yr. Covers salaries, research, prime brokerage, overhead.
                Incentive: grow AUM. Risk: misalignment if returns are poor.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-lg font-medium text-indigo-400 mb-1">20%</div>
              <div className="text-xs font-medium text-foreground mb-1">Performance Fee (Carry)</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                20% of profits above hurdle rate (typically LIBOR/SOFR + 200bps or 8%).
                Only charged when fund exceeds high watermark. Aligns manager with investor
                returns. Best-in-class funds: 1.5/15 or 1/10.
              </p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <SectionLabel>Alpha Math: What Net Returns Actually Look Like</SectionLabel>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-muted-foreground">
                <thead>
                  <tr className="border-b border-border">
                    {["Gross Alpha", "Mgmt Fee", "Trading Costs", "Perf Fee (20%)", "Net Alpha"].map((h) => (
                      <th key={h} className="px-2 py-1.5 text-muted-foreground text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { gross: 15, mgmt: 2, trading: 1, hurdle: 8 },
                    { gross: 10, mgmt: 2, trading: 1, hurdle: 8 },
                    { gross: 6, mgmt: 2, trading: 1, hurdle: 8 },
                    { gross: 2, mgmt: 2, trading: 1, hurdle: 8 },
                  ].map((row) => {
                    const aboveHurdle = Math.max(0, row.gross - row.mgmt - row.trading - row.hurdle);
                    const perfFee = aboveHurdle * 0.2;
                    const net = row.gross - row.mgmt - row.trading - perfFee;
                    return (
                      <tr key={row.gross} className="border-b border-border">
                        <td className="px-2 py-1.5 text-emerald-400 font-medium">+{row.gross}%</td>
                        <td className="px-2 py-1.5 text-red-400">−{row.mgmt}%</td>
                        <td className="px-2 py-1.5 text-orange-400">−{row.trading}%</td>
                        <td className="px-2 py-1.5 text-amber-400">−{perfFee.toFixed(1)}%</td>
                        <td className={cn("px-2 py-1.5 font-medium", net >= 5 ? "text-emerald-400" : net >= 0 ? "text-amber-400" : "text-red-400")}>
                          {net >= 0 ? "+" : ""}{net.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High watermark SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            High Watermark &amp; Hurdle Rate Mechanics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 190 }}>
            {/* Grid */}
            {[100, 125, 150, 175, 200].map((v) => (
              <g key={v}>
                <line x1={padL} x2={svgW - padR} y1={toYh(v)} y2={toYh(v)} stroke="#1f2937" strokeWidth={0.5} />
                <text x={padL - 4} y={toYh(v) + 3} fontSize={8} fill="#6b7280" textAnchor="end">${v}</text>
              </g>
            ))}
            {/* Fill below NAV-HWM difference */}
            {hwmYears.map((_, i) => {
              if (i === 0 || hwmNAV[i] >= hwmHWM[i]) return null;
              // Drawdown period
              return (
                <rect
                  key={i}
                  x={toXh(i - 0.5)}
                  y={toYh(hwmHWM[i - 1])}
                  width={toXh(i) - toXh(i - 1)}
                  height={toYh(hwmNAV[i]) - toYh(hwmHWM[i - 1])}
                  fill="#ef4444"
                  opacity={0.15}
                />
              );
            })}
            {/* HWM line */}
            <path d={hwmPath} stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="5 3" />
            {/* NAV line */}
            <path d={navPath} stroke="#38bdf8" strokeWidth={2} fill="none" />
            {/* Performance fee markers */}
            {hwmPerfFee.map((fee, i) => {
              if (fee <= 0) return null;
              return (
                <g key={i}>
                  <circle cx={toXh(i)} cy={toYh(hwmNAV[i])} r={4} fill="#a78bfa" />
                  <text x={toXh(i)} y={toYh(hwmNAV[i]) - 7} fontSize={7} fill="#a78bfa" textAnchor="middle">
                    +${fee.toFixed(0)}M
                  </text>
                </g>
              );
            })}
            {/* Year labels */}
            {hwmYears.map((yr, i) => (
              <text key={yr} x={toXh(i)} y={svgH - padB + 12} fontSize={8} fill="#6b7280" textAnchor="middle">{yr}</text>
            ))}
            {/* Legend */}
            <line x1={padL} x2={padL + 20} y1={svgH - 5} y2={svgH - 5} stroke="#38bdf8" strokeWidth={1.5} />
            <text x={padL + 24} y={svgH - 2} fontSize={8} fill="#38bdf8">NAV</text>
            <line x1={padL + 60} x2={padL + 80} y1={svgH - 5} y2={svgH - 5} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={padL + 84} y={svgH - 2} fontSize={8} fill="#f59e0b">HWM</text>
            <circle cx={padL + 130} cy={svgH - 6} r={4} fill="#a78bfa" />
            <text x={padL + 138} y={svgH - 2} fontSize={8} fill="#a78bfa">Perf. Fee Event</text>
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            In 2022 (drawdown year), NAV falls below HWM. No performance fee charged. Manager must recover losses before
            earning carry again — aligns long-term interests with investors.
          </p>
        </CardContent>
      </Card>

      {/* HFRI vs S&P */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            HFRI L/S Index vs S&amp;P 500 — Annual Returns (2014–2023)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${hSvgW} ${hSvgH}`} className="w-full" style={{ maxHeight: 200 }}>
            <line x1={hPadL} x2={hSvgW - 20} y1={zeroY} y2={zeroY} stroke="#374151" strokeWidth={0.5} />
            {[-20, -10, 0, 10, 20, 30].map((v) => {
              const y = zeroY - (v / (maxAbs * 1.1)) * (hInnerH / 2);
              return (
                <g key={v}>
                  <line x1={hPadL} x2={hSvgW - 20} y1={y} y2={y} stroke="#1f2937" strokeWidth={0.5} />
                  <text x={hPadL - 4} y={y + 3} fontSize={8} fill="#6b7280" textAnchor="end">{v}%</text>
                </g>
              );
            })}
            {HFRI_DATA.map((d, i) => {
              const x = toBarX(i);
              const hfriH = toBarH(d.hfri);
              const spH = toBarH(d.sp500);
              return (
                <g key={d.year}>
                  {/* HFRI bar */}
                  <rect
                    x={x}
                    y={d.hfri >= 0 ? zeroY - hfriH : zeroY}
                    width={barW}
                    height={hfriH}
                    fill={d.hfri >= 0 ? "#22c55e" : "#ef4444"}
                    opacity={0.8}
                    rx={1}
                  />
                  {/* S&P bar */}
                  <rect
                    x={x + barW + 2}
                    y={d.sp500 >= 0 ? zeroY - spH : zeroY}
                    width={barW}
                    height={spH}
                    fill={d.sp500 >= 0 ? "#38bdf8" : "#f87171"}
                    opacity={0.6}
                    rx={1}
                  />
                  <text x={x + barW} y={hSvgH - hPadB + 12} fontSize={7.5} fill="#9ca3af" textAnchor="middle">
                    {d.year}
                  </text>
                </g>
              );
            })}
            {/* Legend */}
            <rect x={hPadL} y={hSvgH - 8} width={8} height={6} fill="#22c55e" opacity={0.8} />
            <text x={hPadL + 11} y={hSvgH - 2} fontSize={8} fill="#22c55e">HFRI L/S</text>
            <rect x={hPadL + 70} y={hSvgH - 8} width={8} height={6} fill="#38bdf8" opacity={0.8} />
            <text x={hPadL + 83} y={hSvgH - 2} fontSize={8} fill="#38bdf8">S&P 500</text>
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            Key observation: HFRI L/S typically delivers lower returns in strong bull markets (2017, 2019, 2021)
            but protects capital in down markets (2018, 2022). Sharpe ratios can be comparable despite lower gross returns.
          </p>
        </CardContent>
      </Card>

      {/* Capacity constraints + Sharpe decomposition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Capacity Constraints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <span className="text-rose-400 font-medium">Market impact:</span> Large orders move prices against the fund.
                A $10B L/S fund trading 1,000 names needs liquidity — alpha erodes at scale.
              </p>
              <p>
                <span className="text-amber-400 font-medium">Crowding:</span> As more capital chases statistical arbitrage,
                spreads compress. The alpha edge narrows — "capacity constrained" strategies may close to new investors.
              </p>
              <p>
                <span className="text-sky-400 font-medium">Fund of Funds fee drag:</span> Adding a FoF layer costs another
                1/10 (1% mgmt + 10% perf). Net-net investors may pay 3.5% annual drag before net alpha.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Sharpe Ratio Decomposition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Gross Alpha", value: "+15%", color: "text-emerald-400" },
                { label: "− Management Fee (2%)", value: "−2%", color: "text-red-400" },
                { label: "− Trading Costs (1%)", value: "−1%", color: "text-orange-400" },
                { label: "− Performance Fee (20% of 6%)", value: "−1.2%", color: "text-amber-400" },
                { label: "= Net Alpha to Investor", value: "+10.8%", color: "text-sky-400 font-medium" },
                { label: "Portfolio Volatility (σ)", value: "12%", color: "text-muted-foreground" },
                { label: "Net Sharpe ≈ (10.8 − 5) / 12", value: "≈ 0.48", color: "text-indigo-400 font-medium" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center text-xs text-muted-foreground border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={row.color}>{row.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════

export default function EquityLongShortPage() {
  const [activeTab, setActiveTab] = useState("portfolio");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 border-l-4 border-l-primary rounded-lg bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Scale className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-foreground">Equity Long/Short Strategies</h1>
            <p className="text-xs text-muted-foreground">
              Fundamental L/S · Pairs Trading · Short Selling · Hedge Fund Alpha Economics
            </p>
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
            130/30 · Market Neutral · Long-Biased
          </Badge>
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
            Net Beta Management
          </Badge>
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10">
            Cointegration-Based Pairs
          </Badge>
          <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-400 bg-rose-500/10">
            2 &amp; 20 Fee Structure
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 p-1 mb-6">
          {[
            { value: "portfolio", label: "L/S Portfolio Structure", icon: Layers },
            { value: "short", label: "Short Selling", icon: TrendingDown },
            { value: "pairs", label: "Pairs Trading", icon: Activity },
            { value: "economics", label: "Fund Economics", icon: DollarSign },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md transition-all data-[state=active]:bg-muted data-[state=active]:text-foreground",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5 inline-block" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <TabsContent value="portfolio" className="mt-0 data-[state=inactive]:hidden">
              <PortfolioStructureTab />
            </TabsContent>
            <TabsContent value="short" className="mt-0 data-[state=inactive]:hidden">
              <ShortSellingTab />
            </TabsContent>
            <TabsContent value="pairs" className="mt-0 data-[state=inactive]:hidden">
              <PairsTradingTab />
            </TabsContent>
            <TabsContent value="economics" className="mt-0 data-[state=inactive]:hidden">
              <FundEconomicsTab />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
