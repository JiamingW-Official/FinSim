"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  Shield,
  DollarSign,
  Activity,
  Landmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 982;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
// consume seed to stabilise derived values used later
const _vals = Array.from({ length: 500 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];
void sv;

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtPct(n: number, decimals = 1): string {
  return n.toFixed(decimals) + "%";
}
function fmtBps(n: number): string {
  return n.toFixed(0) + " bps";
}
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-rose-400");

// ── Shared small stat chip ─────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className={cn("text-xl font-bold", color)}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── InfoCard ──────────────────────────────────────────────────────────────────
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm font-semibold text-zinc-200 mb-3">{title}</p>
      <div className="text-xs space-y-1.5">{children}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════════════════

interface SovereignBond {
  country: string;
  iso: string;
  usdYield: number;
  localYield: number;
  spreadUST: number;
  cdsBps: number;
  rating: string;
  ratingColor: string;
  debtGDP: number;
  currentAccount: number;
}

const SOVEREIGN_BONDS: SovereignBond[] = [
  {
    country: "Brazil",
    iso: "BRL",
    usdYield: 6.42,
    localYield: 13.15,
    spreadUST: 215,
    cdsBps: 172,
    rating: "BB",
    ratingColor: "text-amber-400",
    debtGDP: 88.6,
    currentAccount: -2.3,
  },
  {
    country: "Mexico",
    iso: "MXN",
    usdYield: 5.71,
    localYield: 10.82,
    spreadUST: 148,
    cdsBps: 118,
    rating: "BBB",
    ratingColor: "text-blue-400",
    debtGDP: 52.8,
    currentAccount: -0.9,
  },
  {
    country: "Indonesia",
    iso: "IDR",
    usdYield: 5.62,
    localYield: 7.04,
    spreadUST: 135,
    cdsBps: 98,
    rating: "BBB",
    ratingColor: "text-blue-400",
    debtGDP: 39.4,
    currentAccount: -1.7,
  },
  {
    country: "Turkey",
    iso: "TRY",
    usdYield: 7.88,
    localYield: 43.5,
    spreadUST: 362,
    cdsBps: 288,
    rating: "B+",
    ratingColor: "text-rose-400",
    debtGDP: 32.5,
    currentAccount: -4.1,
  },
  {
    country: "South Africa",
    iso: "ZAR",
    usdYield: 7.14,
    localYield: 10.62,
    spreadUST: 288,
    cdsBps: 233,
    rating: "BB-",
    ratingColor: "text-amber-400",
    debtGDP: 74.1,
    currentAccount: -2.8,
  },
  {
    country: "Poland",
    iso: "PLN",
    usdYield: 4.88,
    localYield: 5.72,
    spreadUST: 62,
    cdsBps: 48,
    rating: "A-",
    ratingColor: "text-emerald-400",
    debtGDP: 49.6,
    currentAccount: 0.4,
  },
  {
    country: "India",
    iso: "INR",
    usdYield: 5.14,
    localYield: 7.12,
    spreadUST: 88,
    cdsBps: 72,
    rating: "BBB-",
    ratingColor: "text-blue-400",
    debtGDP: 83.2,
    currentAccount: -1.5,
  },
  {
    country: "Colombia",
    iso: "COP",
    usdYield: 6.82,
    localYield: 12.44,
    spreadUST: 258,
    cdsBps: 208,
    rating: "BB+",
    ratingColor: "text-amber-400",
    debtGDP: 55.3,
    currentAccount: -3.4,
  },
];

// ── Crisis history ─────────────────────────────────────────────────────────────
interface Crisis {
  year: string;
  name: string;
  countries: string;
  trigger: string;
  peakSpread: number;
  gdpDrop: string;
  lesson: string;
  color: string;
}
const CRISES: Crisis[] = [
  {
    year: "1994",
    name: "Tequila Crisis",
    countries: "Mexico",
    trigger: "Sudden MXN devaluation, FX reserves exhausted; peso peg abandoned Dec 20",
    peakSpread: 1680,
    gdpDrop: "-6.2%",
    lesson: "Pegged exchange rates with large CA deficits are unstable; contagion spreads via EM asset class.",
    color: "#f59e0b",
  },
  {
    year: "1997",
    name: "Asian Financial Crisis",
    countries: "Thailand, Korea, Indonesia, Malaysia",
    trigger: "USD peg stress + corporate FX mismatches + hot money outflows triggered baht float",
    peakSpread: 820,
    gdpDrop: "-7% to -13%",
    lesson: "Short-term USD debt with FX mismatches creates fragility. IMF structural programs were painful.",
    color: "#f87171",
  },
  {
    year: "1998",
    name: "Russia Default & LTCM",
    countries: "Russia (+ contagion globally)",
    trigger: "Oil price collapse → fiscal stress → GKO (ruble T-bill) default + ruble devaluation",
    peakSpread: 3700,
    gdpDrop: "-5.3%",
    lesson: "Commodity dependence + leverage amplifies crisis. Sovereign domestic default is possible.",
    color: "#ef4444",
  },
  {
    year: "2001",
    name: "Argentine Default",
    countries: "Argentina",
    trigger: "Currency board collapse, $100B sovereign default, peso convertibility abandoned",
    peakSpread: 5500,
    gdpDrop: "-10.9%",
    lesson: "Hard pegs cannot substitute for fiscal discipline. Restructuring negotiations are prolonged.",
    color: "#dc2626",
  },
  {
    year: "2018",
    name: "Turkey & Argentina Stress",
    countries: "Turkey, Argentina",
    trigger: "TRY -40% (USD borrowing + inflation + political tensions); ARS crisis returned to IMF",
    peakSpread: 800,
    gdpDrop: "-2% to -4%",
    lesson: "Policy credibility crises can occur in isolation. Contagion limited when fundamentals diverge.",
    color: "#a855f7",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — SOVEREIGN BOND DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function SovereignTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = SOVEREIGN_BONDS.find((b) => b.country === selected);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Avg EMBI Spread" value="185 bps" sub="vs 2023 avg 230 bps" color="text-amber-400" />
        <StatChip label="EM FX YTD" value="-3.2%" sub="Broad EM currency index" color="text-rose-400" />
        <StatChip label="EMBI Total Return" value="+4.8%" sub="Year-to-date 2026" color="text-emerald-400" />
        <StatChip label="GBI-EM Yield" value="6.88%" sub="Local currency index" color="text-blue-400" />
      </div>

      {/* Main table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            EM Sovereign Bond Monitor — click a row for detail
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">Country</th>
                <th className="text-right py-2 px-3 font-medium">USD Yield</th>
                <th className="text-right py-2 px-3 font-medium">Local Yield</th>
                <th className="text-right py-2 px-3 font-medium">Spread/UST</th>
                <th className="text-right py-2 px-3 font-medium">CDS</th>
                <th className="text-center py-2 px-3 font-medium">Rating</th>
                <th className="text-right py-2 px-3 font-medium">Debt/GDP</th>
                <th className="text-right py-2 px-3 font-medium">CA Bal</th>
              </tr>
            </thead>
            <tbody>
              {SOVEREIGN_BONDS.map((b) => (
                <tr
                  key={b.country}
                  onClick={() => setSelected(selected === b.country ? null : b.country)}
                  className={cn(
                    "border-b border-zinc-800/60 cursor-pointer transition-colors",
                    selected === b.country ? "bg-blue-900/20" : "hover:bg-zinc-800/40"
                  )}
                >
                  <td className="py-2 px-3 text-zinc-200 font-medium">
                    {b.country}
                    <span className="ml-1.5 text-zinc-500">{b.iso}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-300">{fmtPct(b.usdYield, 2)}</td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-300">{fmtPct(b.localYield, 2)}</td>
                  <td className="py-2 px-3 text-right font-mono text-amber-400">{fmtBps(b.spreadUST)}</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-400">{fmtBps(b.cdsBps)}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={cn("font-bold", b.ratingColor)}>{b.rating}</span>
                  </td>
                  <td className="py-2 px-3 text-right text-zinc-400">{fmtPct(b.debtGDP)}%</td>
                  <td className={cn("py-2 px-3 text-right font-mono", posColor(b.currentAccount))}>
                    {b.currentAccount >= 0 ? "+" : ""}
                    {fmtPct(b.currentAccount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Expanded detail */}
      {sel && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="bg-zinc-900 border-blue-700/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">
                {sel.country} — Debt Profile Detail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                <div className="bg-zinc-800 rounded p-3">
                  <div className="text-zinc-400 mb-1">Basis (Local − USD)</div>
                  <div className="text-white font-mono text-lg font-bold">
                    +{fmtPct(sel.localYield - sel.usdYield, 2)}
                  </div>
                  <div className="text-zinc-500">FX risk premium</div>
                </div>
                <div className="bg-zinc-800 rounded p-3">
                  <div className="text-zinc-400 mb-1">CDS / Spread Basis</div>
                  <div className={cn("font-mono text-lg font-bold", sel.cdsBps < sel.spreadUST ? "text-emerald-400" : "text-rose-400")}>
                    {sel.spreadUST - sel.cdsBps > 0 ? "+" : ""}
                    {fmtBps(sel.spreadUST - sel.cdsBps)}
                  </div>
                  <div className="text-zinc-500">Cash vs synthetic</div>
                </div>
                <div className="bg-zinc-800 rounded p-3">
                  <div className="text-zinc-400 mb-1">Debt/GDP</div>
                  <div className={cn("font-mono text-lg font-bold", sel.debtGDP > 70 ? "text-rose-400" : "text-amber-400")}>
                    {fmtPct(sel.debtGDP)}%
                  </div>
                  <div className="text-zinc-500">{sel.debtGDP > 70 ? "Elevated" : "Moderate"} burden</div>
                </div>
                <div className="bg-zinc-800 rounded p-3">
                  <div className="text-zinc-400 mb-1">Current Account</div>
                  <div className={cn("font-mono text-lg font-bold", posColor(sel.currentAccount))}>
                    {sel.currentAccount >= 0 ? "+" : ""}{fmtPct(sel.currentAccount)} GDP
                  </div>
                  <div className="text-zinc-500">{sel.currentAccount < -3 ? "Significant deficit" : sel.currentAccount < 0 ? "Mild deficit" : "Surplus"}</div>
                </div>
              </div>
              {/* Spread bar */}
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Spread to UST vs EM peers (max 600 bps)</span>
                  <span className="text-amber-400 font-mono">{fmtBps(sel.spreadUST)}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((sel.spreadUST / 600) * 100, 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Spread bar chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Spread to US Treasuries (bps) — sorted by risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpreadBarChart />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Reading EM Spreads">
          <p className="text-zinc-400">
            The spread over US Treasuries compensates investors for default risk, liquidity risk, and EM risk premium.
            CDS spreads reflect pure default risk in the derivatives market.
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between"><span className="text-zinc-500">0-100 bps</span><span className="text-emerald-400">Investment grade, low risk</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">100-250 bps</span><span className="text-amber-400">Mid-grade, some fiscal stress</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">250-500 bps</span><span className="text-orange-400">Sub-investment grade</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">500+ bps</span><span className="text-rose-400">Distressed / pre-default</span></div>
          </div>
        </InfoCard>
        <InfoCard title="EM Sovereign Rating Factors">
          <div className="space-y-1.5 text-zinc-400">
            <div><span className="text-zinc-200 font-medium">Fiscal space:</span> Debt/GDP ratio, primary balance, interest burden</div>
            <div><span className="text-zinc-200 font-medium">External position:</span> Current account, FX reserves cover, external debt</div>
            <div><span className="text-zinc-200 font-medium">Growth outlook:</span> Real GDP growth, per capita income trajectory</div>
            <div><span className="text-zinc-200 font-medium">Monetary credibility:</span> CB independence, inflation history, FX regime</div>
            <div><span className="text-zinc-200 font-medium">Political risk:</span> Governance, institutional quality, geopolitical exposure</div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

function SpreadBarChart() {
  const sorted = [...SOVEREIGN_BONDS].sort((a, b) => a.spreadUST - b.spreadUST);
  const W = 520;
  const H = 200;
  const PAD = { l: 90, r: 16, t: 14, b: 20 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxSpread = 420;
  const barH = Math.floor(chartH / sorted.length) - 3;

  const spreadColor = (bps: number) => {
    if (bps < 100) return "#34d399";
    if (bps < 250) return "#f59e0b";
    if (bps < 400) return "#f97316";
    return "#f87171";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      {sorted.map((b, i) => {
        const y = PAD.t + i * (barH + 3);
        const barW = (b.spreadUST / maxSpread) * chartW;
        return (
          <g key={b.country}>
            <text x={PAD.l - 6} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize="9" textAnchor="end">
              {b.country}
            </text>
            <rect x={PAD.l} y={y} width={barW} height={barH} rx="2" fill={spreadColor(b.spreadUST)} opacity="0.8" />
            <text x={PAD.l + barW + 4} y={y + barH / 2 + 4} fill="#d4d4d8" fontSize="9">
              {b.spreadUST}
            </text>
          </g>
        );
      })}
      <text x={PAD.l} y={H - 4} fill="#71717a" fontSize="8">0</text>
      <text x={PAD.l + chartW / 2} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">210</text>
      <text x={PAD.l + chartW} y={H - 4} fill="#71717a" fontSize="8" textAnchor="end">{maxSpread} bps</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — HARD vs LOCAL CURRENCY
// ══════════════════════════════════════════════════════════════════════════════

function HardLocalTab() {
  const embiFunds = [
    { name: "EMBI Global Diversified", yield: 6.42, duration: 7.3, assets: "$820B", focus: "USD sovereign bonds" },
    { name: "EMBI Global", yield: 6.28, duration: 7.1, assets: "$1.1T", focus: "Broad USD sovereign" },
    { name: "GBI-EM Global Diversified", yield: 6.88, duration: 5.2, assets: "$240B", focus: "Local currency sovereign" },
    { name: "CEMBI Broad", yield: 6.12, duration: 4.6, assets: "$475B", focus: "EM corporate USD bonds" },
  ];

  const fxCarry = [
    { country: "Brazil", localYield: 13.15, hedgeCost: 6.4, realYield: 3.8, netCarry: 6.75 },
    { country: "Mexico", localYield: 10.82, hedgeCost: 5.1, realYield: 4.2, netCarry: 5.72 },
    { country: "Indonesia", localYield: 7.04, hedgeCost: 2.8, realYield: 3.8, netCarry: 4.24 },
    { country: "Turkey", localYield: 43.5, hedgeCost: 28.6, realYield: 8.3, netCarry: 14.9 },
    { country: "South Africa", localYield: 10.62, hedgeCost: 5.8, realYield: 4.1, netCarry: 4.82 },
    { country: "India", localYield: 7.12, hedgeCost: 2.2, realYield: 3.4, netCarry: 4.92 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="EMBI+ Spread" value="185 bps" sub="Hard currency benchmark" color="text-blue-400" />
        <StatChip label="GBI-EM Avg Yield" value="6.88%" sub="Local currency bonds" color="text-amber-400" />
        <StatChip label="EM Corp Spread" value="235 bps" sub="CEMBI vs UST" color="text-violet-400" />
        <StatChip label="EM Real Yield" value="3.9%" sub="Avg local less inflation" color="text-emerald-400" />
      </div>

      {/* EMBI vs GBI comparison */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Major EM Debt Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">Index</th>
                <th className="text-right py-2 px-3 font-medium">Yield</th>
                <th className="text-right py-2 px-3 font-medium">Duration</th>
                <th className="text-right py-2 px-3 font-medium">AUM</th>
                <th className="text-left py-2 px-3 font-medium">Focus</th>
              </tr>
            </thead>
            <tbody>
              {embiFunds.map((f, i) => (
                <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="py-2 px-3 text-blue-400 font-medium">{f.name}</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">{fmtPct(f.yield, 2)}</td>
                  <td className="py-2 px-3 text-right text-zinc-300">{f.duration} yr</td>
                  <td className="py-2 px-3 text-right text-zinc-400">{f.assets}</td>
                  <td className="py-2 px-3 text-zinc-400">{f.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* FX carry table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Local Currency Bond — Hedged Carry Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-zinc-500 mb-3">
            Net carry = local yield − USD hedging cost (3m FX forward cross-currency basis). Real yield shown before hedging.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left py-2 px-3 font-medium">Country</th>
                  <th className="text-right py-2 px-3 font-medium">Local Yield</th>
                  <th className="text-right py-2 px-3 font-medium">Hedge Cost</th>
                  <th className="text-right py-2 px-3 font-medium">Real Yield</th>
                  <th className="text-right py-2 px-3 font-medium">Net Carry</th>
                  <th className="py-2 px-3 font-medium">Attractiveness</th>
                </tr>
              </thead>
              <tbody>
                {fxCarry.map((c) => (
                  <tr key={c.country} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                    <td className="py-2 px-3 text-zinc-200 font-medium">{c.country}</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-300">{fmtPct(c.localYield, 2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-400">−{fmtPct(c.hedgeCost, 1)}</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-400">{fmtPct(c.realYield, 1)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                      {fmtPct(c.netCarry, 2)}
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden w-24">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min((c.netCarry / 18) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hard vs Local comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Hard Currency (USD) Bonds — Pros & Cons">
          <div className="space-y-1.5">
            <div className="text-emerald-400 font-semibold mb-1">Advantages</div>
            <div className="text-zinc-400">No FX risk — returns in USD; familiar currency for DM investors</div>
            <div className="text-zinc-400">Deeper liquidity; part of widely-tracked EMBI benchmarks</div>
            <div className="text-zinc-400">Sovereign covenants under NY / English law (easier enforcement)</div>
            <div className="mt-2 text-rose-400 font-semibold mb-1">Risks</div>
            <div className="text-zinc-400">Duration risk from US rate movements (positive correlation with UST)</div>
            <div className="text-zinc-400">Country must generate USD via exports or FX reserves to service debt</div>
            <div className="text-zinc-400">US Fed tightening = wider spreads + principal losses</div>
          </div>
        </InfoCard>
        <InfoCard title="Local Currency Bonds — Pros & Cons">
          <div className="space-y-1.5">
            <div className="text-emerald-400 font-semibold mb-1">Advantages</div>
            <div className="text-zinc-400">Higher nominal yields; no original sin (country borrows in own currency)</div>
            <div className="text-zinc-400">Diversification from DM rates; local CB policy drives pricing</div>
            <div className="text-zinc-400">FX appreciation adds to USD total return</div>
            <div className="mt-2 text-rose-400 font-semibold mb-1">Risks</div>
            <div className="text-zinc-400">FX depreciation can wipe out high nominal yield</div>
            <div className="text-zinc-400">Liquidity can dry up in stress; exit timing critical</div>
            <div className="text-zinc-400">Hedging cost erodes carry in high-differential markets</div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — SPREAD DECOMPOSITION + RISK HEATMAP
// ══════════════════════════════════════════════════════════════════════════════

function SpreadDecompositionTab() {
  // Waterfall: EMBI avg spread decomposition
  const waterfallBars = [
    { label: "US Base Rate", value: 427, cumFrom: 0, color: "#6366f1", isBase: true },
    { label: "+ EM Risk Premium", value: 95, cumFrom: 427, color: "#f59e0b" },
    { label: "+ Country Risk", value: 52, cumFrom: 522, color: "#f87171" },
    { label: "+ Liquidity Premium", value: 38, cumFrom: 574, color: "#a855f7" },
  ];

  // Country risk heatmap data: 6 countries × 4 risk types
  const heatmapCountries = ["Brazil", "Mexico", "Indonesia", "Turkey", "South Africa", "Poland"];
  const riskTypes = ["Political", "External", "Fiscal", "Monetary"];
  // scores 0-100, higher = riskier
  const heatmapScores: number[][] = [
    [62, 55, 72, 48],  // Brazil
    [50, 42, 44, 40],  // Mexico
    [45, 58, 32, 38],  // Indonesia
    [78, 80, 30, 85],  // Turkey
    [70, 65, 68, 52],  // South Africa
    [28, 22, 38, 30],  // Poland
  ];

  const heatColor = (score: number): string => {
    if (score < 30) return "#22c55e";
    if (score < 50) return "#84cc16";
    if (score < 65) return "#f59e0b";
    if (score < 80) return "#f97316";
    return "#ef4444";
  };

  // SVG waterfall dimensions
  const WW = 500;
  const WH = 200;
  const WPAD = { l: 110, r: 20, t: 16, b: 36 };
  const wcW = WW - WPAD.l - WPAD.r;
  const wcH = WH - WPAD.t - WPAD.b;
  const maxVal = 650;
  const toWX = (v: number) => WPAD.l + (v / maxVal) * wcW;
  const barH = 28;
  const barGap = 6;

  // SVG heatmap dimensions
  const HW = 520;
  const HH = 220;
  const HPAD = { l: 90, r: 12, t: 28, b: 12 };
  const cellW = (HW - HPAD.l - HPAD.r) / riskTypes.length;
  const cellH = (HH - HPAD.t - HPAD.b) / heatmapCountries.length;

  return (
    <div className="space-y-6">
      {/* Waterfall */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            EMBI Spread Decomposition — bps added to USD yield
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${WW} ${WH}`} className="w-full" style={{ height: 200 }}>
            {/* Grid lines */}
            {[0, 150, 300, 450, 600].map((v) => (
              <line key={`wg-${v}`} x1={toWX(v)} x2={toWX(v)} y1={WPAD.t} y2={WH - WPAD.b} stroke="#27272a" strokeWidth="1" />
            ))}
            {[0, 150, 300, 450, 600].map((v) => (
              <text key={`wx-${v}`} x={toWX(v)} y={WH - 4} fill="#71717a" fontSize="9" textAnchor="middle">{v}</text>
            ))}
            {waterfallBars.map((bar, i) => {
              const y = WPAD.t + i * (barH + barGap);
              const x1 = toWX(bar.cumFrom);
              const bw = toWX(bar.value + bar.cumFrom) - toWX(bar.cumFrom);
              return (
                <g key={bar.label}>
                  <text x={WPAD.l - 6} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize="9" textAnchor="end">
                    {bar.label}
                  </text>
                  <rect x={x1} y={y} width={bw} height={barH} rx="2" fill={bar.color} opacity="0.75" />
                  <text x={x1 + bw / 2} y={y + barH / 2 + 4} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {bar.value} bps
                  </text>
                  {!bar.isBase && (
                    <text x={toWX(bar.cumFrom + bar.value) + 4} y={y + barH / 2 + 4} fill="#71717a" fontSize="8">
                      ={bar.cumFrom + bar.value}
                    </text>
                  )}
                </g>
              );
            })}
            <line
              x1={toWX(waterfallBars.reduce((s, b) => Math.max(s, b.cumFrom + b.value), 0))}
              x2={toWX(waterfallBars.reduce((s, b) => Math.max(s, b.cumFrom + b.value), 0))}
              y1={WPAD.t}
              y2={WH - WPAD.b}
              stroke="#34d399"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
          </svg>
          <p className="text-xs text-zinc-500 mt-1">
            Total avg EM yield ≈ {fmtPct(427 / 100 + 6.12, 2)} (US risk-free {fmtPct(4.27, 2)} + EM spread 612 bps for illustrative EMBI blend)
          </p>
        </CardContent>
      </Card>

      {/* Country Risk Heatmap */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            Country Risk Heatmap — score 0 (green) to 100 (red)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${HW} ${HH}`} className="w-full" style={{ height: 220 }}>
            {/* Column headers */}
            {riskTypes.map((rt, j) => (
              <text
                key={`rh-${j}`}
                x={HPAD.l + j * cellW + cellW / 2}
                y={HPAD.t - 6}
                fill="#a1a1aa"
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
              >
                {rt}
              </text>
            ))}
            {/* Row labels + cells */}
            {heatmapCountries.map((country, i) => (
              <g key={country}>
                <text
                  x={HPAD.l - 6}
                  y={HPAD.t + i * cellH + cellH / 2 + 4}
                  fill="#d4d4d8"
                  fontSize="9"
                  textAnchor="end"
                >
                  {country}
                </text>
                {riskTypes.map((_, j) => {
                  const score = heatmapScores[i][j];
                  const cx = HPAD.l + j * cellW;
                  const cy = HPAD.t + i * cellH;
                  return (
                    <g key={`cell-${i}-${j}`}>
                      <rect
                        x={cx + 2}
                        y={cy + 2}
                        width={cellW - 4}
                        height={cellH - 4}
                        rx="3"
                        fill={heatColor(score)}
                        opacity="0.7"
                      />
                      <text
                        x={cx + cellW / 2}
                        y={cy + cellH / 2 + 4}
                        fill="#fff"
                        fontSize="9"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {score}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}
          </svg>
          {/* Legend */}
          <div className="flex gap-4 mt-2 text-xs justify-center flex-wrap">
            {[
              { label: "Low risk (<30)", color: "#22c55e" },
              { label: "Moderate (30–50)", color: "#84cc16" },
              { label: "Elevated (50–65)", color: "#f59e0b" },
              { label: "High (65–80)", color: "#f97316" },
              { label: "Critical (80+)", color: "#ef4444" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color }} />
                <span className="text-zinc-400">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Spread Driver: US Rates (Base)">
          <p className="text-zinc-400">
            EM USD bonds are priced as spread over US Treasuries. When the Fed raises rates, UST yields rise and EM USD bond
            prices fall — this is duration risk entirely driven by DM monetary policy.
          </p>
          <p className="text-zinc-500 mt-2">
            Historical note: 2013 Taper Tantrum sent EMBI spreads +150 bps in weeks; 2022 Fed hiking cycle
            added 180 bps to avg EMBI spread.
          </p>
        </InfoCard>
        <InfoCard title="Spread Driver: Country-Specific">
          <p className="text-zinc-400">
            Idiosyncratic factors: election uncertainty, political interference with CB, sudden fiscal deterioration,
            commodity price shocks (for commodity exporters), or bank/corporate stress that threatens fiscal outlays.
          </p>
          <p className="text-zinc-500 mt-2">
            Country-specific spread can widen independently of broader EM move — Turkey 2018 is the textbook example.
          </p>
        </InfoCard>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — EM CURRENCY IMPACT
// ══════════════════════════════════════════════════════════════════════════════

function CurrencyImpactTab() {
  const fxScenarios = [
    {
      country: "Brazil",
      iso: "BRL",
      localYield: 13.15,
      fxBase: 0,
      fxBull: 8.0,
      fxBear: -12.0,
      fxStress: -25.0,
    },
    {
      country: "Mexico",
      iso: "MXN",
      localYield: 10.82,
      fxBase: 0,
      fxBull: 5.0,
      fxBear: -8.0,
      fxStress: -18.0,
    },
    {
      country: "Indonesia",
      iso: "IDR",
      localYield: 7.04,
      fxBase: 0,
      fxBull: 4.0,
      fxBear: -7.0,
      fxStress: -15.0,
    },
    {
      country: "Turkey",
      iso: "TRY",
      localYield: 43.5,
      fxBase: 0,
      fxBull: 5.0,
      fxBear: -20.0,
      fxStress: -45.0,
    },
    {
      country: "South Africa",
      iso: "ZAR",
      localYield: 10.62,
      fxBase: 0,
      fxBull: 6.0,
      fxBear: -10.0,
      fxStress: -22.0,
    },
    {
      country: "India",
      iso: "INR",
      localYield: 7.12,
      fxBase: 0,
      fxBull: 2.0,
      fxBear: -4.0,
      fxStress: -9.0,
    },
    {
      country: "Colombia",
      iso: "COP",
      localYield: 12.44,
      fxBase: 0,
      fxBull: 6.0,
      fxBear: -11.0,
      fxStress: -20.0,
    },
  ];

  // USD total return = local yield + FX move (simplified, 1-year horizon)
  const totalReturn = (localYield: number, fxMove: number) => localYield + fxMove;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="DXY YTD" value="+2.8%" sub="USD strength vs EM basket" color="text-amber-400" />
        <StatChip label="EM FX Vol (1m)" value="8.4%" sub="Avg implied vol" color="text-rose-400" />
        <StatChip label="TRY/USD 1Y fwd" value="-28%" sub="Carry-implied depreciation" color="text-red-400" />
        <StatChip label="BRL Real Rate" value="+6.7%" sub="Nominal − CPI ex-ante" color="text-emerald-400" />
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            USD Total Return by FX Scenario (1-Year Horizon)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">Country</th>
                <th className="text-right py-2 px-3 font-medium">Local Yield</th>
                <th className="text-right py-2 px-3 font-medium text-emerald-400">Bull (+FX)</th>
                <th className="text-right py-2 px-3 font-medium text-zinc-300">Base (flat)</th>
                <th className="text-right py-2 px-3 font-medium text-amber-400">Bear (-FX)</th>
                <th className="text-right py-2 px-3 font-medium text-rose-400">Stress (-FX)</th>
              </tr>
            </thead>
            <tbody>
              {fxScenarios.map((sc) => (
                <tr key={sc.country} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="py-2 px-3 text-zinc-200 font-medium">
                    {sc.country}
                    <span className="ml-1.5 text-zinc-500 text-xs">{sc.iso}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-300">{fmtPct(sc.localYield, 2)}</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400">
                    +{fmtPct(totalReturn(sc.localYield, sc.fxBull), 1)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-300">
                    +{fmtPct(totalReturn(sc.localYield, sc.fxBase), 1)}
                  </td>
                  <td className={cn("py-2 px-3 text-right font-mono", posColor(totalReturn(sc.localYield, sc.fxBear)))}>
                    {totalReturn(sc.localYield, sc.fxBear) >= 0 ? "+" : ""}
                    {fmtPct(totalReturn(sc.localYield, sc.fxBear), 1)}
                  </td>
                  <td className={cn("py-2 px-3 text-right font-mono font-bold", posColor(totalReturn(sc.localYield, sc.fxStress)))}>
                    {totalReturn(sc.localYield, sc.fxStress) >= 0 ? "+" : ""}
                    {fmtPct(totalReturn(sc.localYield, sc.fxStress), 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-zinc-500 px-3 py-2">
            Simplified: USD return ≈ local yield + FX % change. Duration effect on price excluded. Turkey shows how even 43% yield can be negative in USD on FX stress.
          </p>
        </CardContent>
      </Card>

      {/* FX visual chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300">FX Break-Even Analysis — Yield vs Depreciation Tolerance</CardTitle>
        </CardHeader>
        <CardContent>
          <FxBreakevenChart data={fxScenarios} />
          <p className="text-xs text-zinc-500 mt-2">
            Break-even depreciation = local yield (flat FX = full carry earned). Turkey needs 43.5% FX depreciation to
            wipe out carry. India only tolerates 7.1% drop. Volatility risk is asymmetric.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Key FX Risk Drivers in EM">
          <div className="space-y-1.5 text-zinc-400">
            <div><span className="text-zinc-200 font-medium">Fed Policy:</span> USD strengthens when Fed hikes or signals hawkish tightening; EM currencies and spreads both widen</div>
            <div><span className="text-zinc-200 font-medium">Commodity Prices:</span> Commodity-exporter currencies (BRL, ZAR, COP) correlate with oil/metals prices</div>
            <div><span className="text-zinc-200 font-medium">Current Account:</span> Persistent deficits require FX financing; vulnerable to sudden stops</div>
            <div><span className="text-zinc-200 font-medium">CB Credibility:</span> Inflation-fighting track record supports carry; rate cuts that are behind-the-curve cause FX weakness</div>
            <div><span className="text-zinc-200 font-medium">Risk Appetite:</span> VIX spikes → EM outflows → FX depreciation regardless of fundamentals</div>
          </div>
        </InfoCard>
        <InfoCard title="Hedging Local Currency EM Bonds">
          <div className="space-y-1.5 text-zinc-400">
            <div><span className="text-zinc-200 font-medium">Cross-Currency Swap:</span> Exchange local rate cash flows for USD SOFR + spread. Full hedge but expensive for high-yielders.</div>
            <div><span className="text-zinc-200 font-medium">FX Forward:</span> Sell local currency forward. Cost = interest rate differential (covered interest parity). Brazil hedge ≈ 6.4% p.a.</div>
            <div><span className="text-zinc-200 font-medium">Options:</span> Buy USD call / local currency put for downside protection. Pays up front; retains upside FX.</div>
            <div><span className="text-zinc-200 font-medium">Natural hedge:</span> Hold local currency bonds alongside commodity export equity positions with opposing FX exposures.</div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

function FxBreakevenChart({ data }: { data: { country: string; localYield: number; fxStress: number }[] }) {
  const W = 520;
  const H = 180;
  const PAD = { l: 90, r: 16, t: 14, b: 30 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxYield = 50;
  const barH = Math.floor(cH / data.length) - 3;

  const yieldColor = (y: number) => {
    if (y < 8) return "#6366f1";
    if (y < 15) return "#f59e0b";
    return "#f87171";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {[0, 10, 20, 30, 40, 50].map((v) => (
        <line key={`fbg-${v}`} x1={PAD.l + (v / maxYield) * cW} x2={PAD.l + (v / maxYield) * cW} y1={PAD.t} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
      ))}
      {[0, 10, 20, 30, 40, 50].map((v) => (
        <text key={`fbx-${v}`} x={PAD.l + (v / maxYield) * cW} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">{v}%</text>
      ))}
      {data.map((d, i) => {
        const y = PAD.t + i * (barH + 3);
        const bw = (d.localYield / maxYield) * cW;
        return (
          <g key={d.country}>
            <text x={PAD.l - 6} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize="9" textAnchor="end">{d.country}</text>
            <rect x={PAD.l} y={y} width={bw} height={barH} rx="2" fill={yieldColor(d.localYield)} opacity="0.7" />
            <text x={PAD.l + bw + 3} y={y + barH / 2 + 4} fill="#d4d4d8" fontSize="8">{d.localYield.toFixed(1)}%</text>
          </g>
        );
      })}
      <text x={W / 2} y={PAD.t + 8} fill="#71717a" fontSize="8" textAnchor="middle">
        Bar = local yield = max FX depreciation tolerable before USD return turns negative
      </text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — CRISIS HISTORY
// ══════════════════════════════════════════════════════════════════════════════

function CrisisHistoryTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Timeline SVG: horizontal bar chart of peak spreads
  const W = 500;
  const H = 180;
  const PAD = { l: 60, r: 20, t: 20, b: 30 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxSpread = 6000;
  const barH = Math.floor(cH / CRISES.length) - 4;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Worst Peak Spread" value="5,500 bps" sub="Argentina 2001 default" color="text-rose-400" />
        <StatChip label="Average Recovery" value="3–4 yrs" sub="Spread normalisation" color="text-amber-400" />
        <StatChip label="EM Crises 1990–2026" value="12+" sub="Sovereign/currency crises" color="text-zinc-300" />
        <StatChip label="Post-Crisis Return" value="+38% avg" sub="3yr after stress peak" color="text-emerald-400" />
      </div>

      {/* Timeline peak spread chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Peak Spread at Crisis Apex (bps) — EMBI or country equivalent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
            {[0, 1500, 3000, 4500, 6000].map((v) => (
              <line key={`cg-${v}`} x1={PAD.l + (v / maxSpread) * cW} x2={PAD.l + (v / maxSpread) * cW} y1={PAD.t} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
            ))}
            {[0, 1500, 3000, 4500, 6000].map((v) => (
              <text key={`cx-${v}`} x={PAD.l + (v / maxSpread) * cW} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">{v}</text>
            ))}
            {CRISES.map((c, i) => {
              const y = PAD.t + i * (barH + 4);
              const bw = (c.peakSpread / maxSpread) * cW;
              return (
                <g key={c.year}>
                  <text x={PAD.l - 6} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize="9" textAnchor="end">{c.year}</text>
                  <rect x={PAD.l} y={y} width={bw} height={barH} rx="2" fill={c.color} opacity="0.75" />
                  <text x={PAD.l + bw + 4} y={y + barH / 2 + 4} fill="#d4d4d8" fontSize="9">{c.peakSpread.toLocaleString()} bps</text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Crisis cards — expandable */}
      <div className="space-y-3">
        {CRISES.map((c) => (
          <div
            key={c.year}
            className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden cursor-pointer"
            onClick={() => setExpanded(expanded === c.year ? null : c.year)}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-2 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-zinc-400">{c.year}</span>
                  <span className="text-sm font-semibold text-zinc-100">{c.name}</span>
                  <Badge className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700">{c.countries}</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{c.trigger}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-mono font-bold text-rose-400">{c.peakSpread.toLocaleString()} bps</div>
                <div className="text-xs text-zinc-500">GDP: {c.gdpDrop}</div>
              </div>
            </div>
            {expanded === c.year && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-zinc-800 px-4 py-3 bg-zinc-950/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-zinc-400 font-semibold mb-1">Crisis Trigger</div>
                    <p className="text-zinc-300">{c.trigger}</p>
                  </div>
                  <div>
                    <div className="text-zinc-400 font-semibold mb-1">Key Lesson</div>
                    <p className="text-zinc-300">{c.lesson}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="text-xs">
                    <span className="text-zinc-500">Peak Spread: </span>
                    <span className="text-rose-400 font-mono font-bold">{c.peakSpread.toLocaleString()} bps</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-zinc-500">GDP Impact: </span>
                    <span className="text-rose-400 font-mono font-bold">{c.gdpDrop}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Common Precursors to EM Debt Crises">
          <div className="space-y-1.5 text-zinc-400">
            <div><span className="text-zinc-200 font-medium">1. FX peg + large CA deficit:</span> Requires constant capital inflows to sustain; vulnerable to sentiment shift</div>
            <div><span className="text-zinc-200 font-medium">2. Short-term FX debt mismatches:</span> Borrowing USD short-term to finance local LT assets creates rollover risk</div>
            <div><span className="text-zinc-200 font-medium">3. Commodity dependency + price collapse:</span> Export revenue falls → fiscal gap → sudden stop</div>
            <div><span className="text-zinc-200 font-medium">4. CB independence compromised:</span> Politicised rate decisions → inflation spiral → FX collapse</div>
            <div><span className="text-zinc-200 font-medium">5. Contagion:</span> Asset class sell-off affects fundamentally sound countries via EM ETF flows</div>
          </div>
        </InfoCard>
        <InfoCard title="Post-Crisis Restructuring Playbook">
          <div className="space-y-1.5 text-zinc-400">
            <div><span className="text-zinc-200 font-medium">IMF Program:</span> Balance of payments support in exchange for fiscal adjustment (austerity). SBA, EFF, or FCL facilities.</div>
            <div><span className="text-zinc-200 font-medium">Brady Bonds:</span> 1989 mechanism converting defaulted bank loans to tradable USD bonds — created the EM bond market.</div>
            <div><span className="text-zinc-200 font-medium">PSI (Private Sector Involvement):</span> Voluntary haircuts by creditors — Greece 2012 is a DM example; EM more aggressive.</div>
            <div><span className="text-zinc-200 font-medium">Paris Club:</span> Multilateral coordination of bilateral official creditor claims — supplements IMF program.</div>
            <div><span className="text-zinc-200 font-medium">Common Framework:</span> G20 post-COVID framework for low-income EM debt; slow progress on Zambia, Ethiopia, Ghana.</div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export default function EmDebtPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Landmark className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Emerging Markets Debt</h1>
            <p className="text-sm text-zinc-500">
              Sovereign bonds, hard vs local currency, spread decomposition, crisis history
            </p>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Badge className="bg-blue-900/40 text-blue-400 border-blue-700 text-xs">EMBI +185 bps</Badge>
            <Badge className="bg-amber-900/40 text-amber-400 border-amber-700 text-xs">GBI-EM 6.88%</Badge>
            <Badge className="bg-rose-900/40 text-rose-400 border-rose-700 text-xs">EM FX -3.2% YTD</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sovereign">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger
            value="sovereign"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-3 py-1.5"
          >
            <Globe className="w-3 h-3 mr-1" />
            Sovereign Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="hardlocal"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs px-3 py-1.5"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Hard vs Local
          </TabsTrigger>
          <TabsTrigger
            value="spread"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs px-3 py-1.5"
          >
            <Activity className="w-3 h-3 mr-1" />
            Spread &amp; Risk
          </TabsTrigger>
          <TabsTrigger
            value="fx"
            className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-xs px-3 py-1.5"
          >
            <TrendingDown className="w-3 h-3 mr-1" />
            Currency Impact
          </TabsTrigger>
          <TabsTrigger
            value="crisis"
            className="data-[state=active]:bg-red-700 data-[state=active]:text-white text-xs px-3 py-1.5"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Crisis History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sovereign" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <SovereignTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="hardlocal" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <HardLocalTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="spread" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <SpreadDecompositionTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="fx" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <CurrencyImpactTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="crisis" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <CrisisHistoryTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
