"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Activity,
  Layers,
  Target,
  ArrowUpDown,
  Scale,
  Building2,
  Landmark,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 874;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-warm PRNG (values used for deterministic data seeding)
for (let i = 0; i < 200; i++) rand();

// ── Static Data ───────────────────────────────────────────────────────────────

interface BondMarket {
  name: string;
  size: number; // $T
  color: string;
  pct: number;
}

const BOND_MARKETS: BondMarket[] = [
  { name: "United States", size: 51.3, color: "#3b82f6", pct: 39.8 },
  { name: "Eurozone", size: 24.7, color: "#8b5cf6", pct: 19.2 },
  { name: "Japan", size: 16.2, color: "#ec4899", pct: 12.6 },
  { name: "United Kingdom", size: 7.8, color: "#f59e0b", pct: 6.1 },
  { name: "Emerging Markets", size: 15.9, color: "#10b981", pct: 12.4 },
  { name: "Other DM", size: 12.8, color: "#6b7280", pct: 9.9 },
];

interface YieldRow {
  country: string;
  flag: string;
  rating: string;
  yield10y: number;
  change1m: number;
  duration: number;
  currency: string;
}

const YIELD_TABLE: YieldRow[] = [
  { country: "United States", flag: "🇺🇸", rating: "AA+", yield10y: 4.28, change1m: -0.12, duration: 8.4, currency: "USD" },
  { country: "Germany", flag: "🇩🇪", rating: "AAA", yield10y: 2.41, change1m: -0.08, duration: 8.9, currency: "EUR" },
  { country: "United Kingdom", flag: "🇬🇧", rating: "AA", yield10y: 4.52, change1m:  0.07, duration: 8.1, currency: "GBP" },
  { country: "Japan", flag: "🇯🇵", rating: "A+", yield10y: 1.54, change1m:  0.18, duration: 9.2, currency: "JPY" },
  { country: "France", flag: "🇫🇷", rating: "AA-", yield10y: 3.12, change1m: -0.05, duration: 8.6, currency: "EUR" },
  { country: "Italy", flag: "🇮🇹", rating: "BBB", yield10y: 3.78, change1m: -0.03, duration: 8.3, currency: "EUR" },
  { country: "Canada", flag: "🇨🇦", rating: "AAA", yield10y: 3.61, change1m: -0.09, duration: 8.2, currency: "CAD" },
  { country: "Australia", flag: "🇦🇺", rating: "AAA", yield10y: 4.38, change1m:  0.04, duration: 8.0, currency: "AUD" },
  { country: "Switzerland", flag: "🇨🇭", rating: "AAA", yield10y: 0.89, change1m:  0.02, duration: 9.1, currency: "CHF" },
  { country: "Brazil", flag: "🇧🇷", rating: "BB", yield10y: 12.8, change1m:  0.42, duration: 5.2, currency: "BRL" },
  { country: "Mexico", flag: "🇲🇽", rating: "BBB", yield10y: 9.42, change1m: -0.21, duration: 6.1, currency: "MXN" },
  { country: "India", flag: "🇮🇳", rating: "BBB-", yield10y: 6.91, change1m: -0.08, duration: 6.8, currency: "INR" },
  { country: "Indonesia", flag: "🇮🇩", rating: "BBB", yield10y: 6.78, change1m:  0.11, duration: 6.4, currency: "IDR" },
  { country: "South Africa", flag: "🇿🇦", rating: "BB-", yield10y: 11.2, change1m:  0.33, duration: 5.8, currency: "ZAR" },
  { country: "Turkey", flag: "🇹🇷", rating: "B+", yield10y: 28.4, change1m: -1.2, duration: 3.9, currency: "TRY" },
];

// Negative yield history data (2016–2026): Japan and EU
const NEG_YIELD_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const NEG_YIELD_JP  = [-0.06, -0.05, 0.02, -0.02, 0.01, 0.05, 0.12, 0.63, 1.06, 1.38, 1.54];
const NEG_YIELD_DE  = [-0.17, -0.33, 0.24, -0.19, -0.45, -0.18, 2.57, 2.54, 2.38, 2.28, 2.41];

// Bloomberg Global Agg composition
const GLOBAL_AGG = [
  { label: "US Treasury", pct: 22.4, color: "#3b82f6" },
  { label: "US Corporate IG", pct: 12.1, color: "#60a5fa" },
  { label: "US Agency/MBS", pct: 9.8, color: "#93c5fd" },
  { label: "Euro Govt", pct: 18.3, color: "#8b5cf6" },
  { label: "Euro Corporate", pct: 7.6, color: "#a78bfa" },
  { label: "Japan Govt", pct: 13.9, color: "#ec4899" },
  { label: "UK Gilts", pct: 5.2, color: "#f59e0b" },
  { label: "EM (Hard CCY)", pct: 6.4, color: "#10b981" },
  { label: "Other", pct: 4.3, color: "#6b7280" },
];

// ── EM Bond Data ───────────────────────────────────────────────────────────────

interface EMCountry {
  name: string;
  flag: string;
  rating: string;
  spreadHC: number; // hard currency spread vs UST, bps
  spreadLC: number; // local currency yield
  currency: string;
  indexWeight: number; // EMBI weight %
  inGBI: boolean;
}

const EM_COUNTRIES: EMCountry[] = [
  { name: "Brazil", flag: "🇧🇷", rating: "BB", spreadHC: 218, spreadLC: 12.80, currency: "BRL", indexWeight: 8.4, inGBI: true },
  { name: "Mexico", flag: "🇲🇽", rating: "BBB", spreadHC: 142, spreadLC: 9.42, currency: "MXN", indexWeight: 7.1, inGBI: true },
  { name: "Colombia", flag: "🇨🇴", rating: "BB+", spreadHC: 265, spreadLC: 11.8, currency: "COP", indexWeight: 4.2, inGBI: true },
  { name: "Indonesia", flag: "🇮🇩", rating: "BBB", spreadHC: 148, spreadLC: 6.78, currency: "IDR", indexWeight: 6.3, inGBI: true },
  { name: "India", flag: "🇮🇳", rating: "BBB-", spreadHC: 135, spreadLC: 6.91, currency: "INR", indexWeight: 3.8, inGBI: true },
  { name: "South Africa", flag: "🇿🇦", rating: "BB-", spreadHC: 334, spreadLC: 11.2, currency: "ZAR", indexWeight: 5.6, inGBI: true },
  { name: "Turkey", flag: "🇹🇷", rating: "B+", spreadHC: 478, spreadLC: 28.4, currency: "TRY", indexWeight: 4.1, inGBI: false },
  { name: "Egypt", flag: "🇪🇬", rating: "B-", spreadHC: 692, spreadLC: 24.9, currency: "EGP", indexWeight: 2.3, inGBI: false },
  { name: "Nigeria", flag: "🇳🇬", rating: "B", spreadHC: 582, spreadLC: 19.7, currency: "NGN", indexWeight: 1.8, inGBI: false },
  { name: "Ukraine", flag: "🇺🇦", rating: "CCC+", spreadHC: 1248, spreadLC: 0, currency: "UAH", indexWeight: 0.4, inGBI: false },
];

interface DefaultEvent {
  country: string;
  flag: string;
  year: number;
  instrument: string;
  amount: string;
  recovery: string;
  outcome: string;
}

const DEFAULT_HISTORY: DefaultEvent[] = [
  { country: "Argentina", flag: "🇦🇷", year: 2020, instrument: "Sovereign Eurobond", amount: "$65B", recovery: "55¢", outcome: "Restructured — 3-year moratorium, haircut ~45%" },
  { country: "Ecuador", flag: "🇪🇨", year: 2020, instrument: "Sovereign Bond", amount: "$17.4B", recovery: "59¢", outcome: "Restructured — extended maturities, reduced coupons" },
  { country: "Lebanon", flag: "🇱🇧", year: 2020, instrument: "Eurobond", amount: "$30B", recovery: "15¢", outcome: "Ongoing — deepest restructuring in EM history" },
  { country: "Zambia", flag: "🇿🇲", year: 2020, instrument: "Eurobond", amount: "$3B", recovery: "63¢", outcome: "Restructured 2023 — first G20 Common Framework deal" },
  { country: "Ghana", flag: "🇬🇭", year: 2022, instrument: "Eurobond + Domestic", amount: "$13B", recovery: "40¢", outcome: "Domestic exchange completed 2023; external ongoing" },
  { country: "Pakistan", flag: "🇵🇰", year: 2023, instrument: "IMF-Supported Restructuring", amount: "$3B", recovery: "IMF SBA", outcome: "Avoided default via $3B IMF Stand-By Arrangement" },
  { country: "Sri Lanka", flag: "🇱🇰", year: 2022, instrument: "Sovereign Bond", amount: "$12.6B", recovery: "55¢", outcome: "Restructured 2024 under G20 Common Framework" },
];

// ── Currency Hedging Data ──────────────────────────────────────────────────────

interface HedgeRow {
  pair: string;
  rateDiff: number; // % pa (foreign - USD)
  hedgeCost: number; // % pa
  unhedgedRet: number;
  hedgedRet: number;
}

const HEDGE_TABLE: HedgeRow[] = [
  { pair: "EUR/USD", rateDiff: -1.75, hedgeCost: -1.69, unhedgedRet: 2.41, hedgedRet: 4.09 },
  { pair: "GBP/USD", rateDiff:  0.27, hedgeCost:  0.31, unhedgedRet: 4.52, hedgedRet: 4.21 },
  { pair: "JPY/USD", rateDiff: -2.74, hedgeCost: -2.68, unhedgedRet: 1.54, hedgedRet: 4.18 },
  { pair: "AUD/USD", rateDiff:  0.10, hedgeCost:  0.12, unhedgedRet: 4.38, hedgedRet: 4.24 },
  { pair: "CAD/USD", rateDiff: -0.67, hedgeCost: -0.62, unhedgedRet: 3.61, hedgedRet: 4.25 },
  { pair: "CHF/USD", rateDiff: -3.39, hedgeCost: -3.35, unhedgedRet: 0.89, hedgedRet: 4.21 },
  { pair: "BRL/USD", rateDiff:  8.52, hedgeCost:  8.79, unhedgedRet: 12.8, hedgedRet: 4.06 },
  { pair: "MXN/USD", rateDiff:  5.14, hedgeCost:  5.28, unhedgedRet: 9.42, hedgedRet: 4.18 },
];

// ── Portfolio Construction Data ───────────────────────────────────────────────

interface PortfolioPoint {
  label: string;
  vol: number;
  ret: number;
  color: string;
  radius: number;
}

const PORTFOLIO_POINTS: PortfolioPoint[] = [
  { label: "US Only",          vol: 4.8,  ret: 3.9,  color: "#3b82f6", radius: 7 },
  { label: "+ Global DM",      vol: 4.2,  ret: 4.1,  color: "#8b5cf6", radius: 7 },
  { label: "+ EM Hard CCY",    vol: 4.6,  ret: 4.8,  color: "#10b981", radius: 7 },
  { label: "+ EM Local CCY",   vol: 5.8,  ret: 5.6,  color: "#f59e0b", radius: 7 },
  { label: "Unhedged Global",  vol: 7.1,  ret: 5.2,  color: "#ef4444", radius: 6 },
  { label: "Hedged Global",    vol: 3.9,  ret: 4.7,  color: "#22c55e", radius: 8 },
  { label: "Global AGG",       vol: 4.3,  ret: 4.3,  color: "#ec4899", radius: 7 },
  { label: "EM Diversified",   vol: 7.4,  ret: 6.1,  color: "#f97316", radius: 6 },
];

// Correlation matrix
const CORR_LABELS = ["US Tsy", "EU Govt", "EM HC", "JPY Bonds", "GBP Gilts", "EM LC"];
const CORR_MATRIX = [
  [1.00,  0.62,  0.41,  0.38,  0.57,  0.18],
  [0.62,  1.00,  0.47,  0.52,  0.71,  0.29],
  [0.41,  0.47,  1.00,  0.25,  0.44,  0.58],
  [0.38,  0.52,  0.25,  1.00,  0.49,  0.21],
  [0.57,  0.71,  0.44,  0.49,  1.00,  0.32],
  [0.18,  0.29,  0.58,  0.21,  0.32,  1.00],
];

// ── Helper: fade-in card ───────────────────────────────────────────────────────

function FadeCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("rounded-xl border border-white/10 bg-white/5 p-4", className)}
    >
      {children}
    </motion.div>
  );
}

// ── Tab 1: Market Overview ─────────────────────────────────────────────────────

function MarketOverviewTab() {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const total = BOND_MARKETS.reduce((a, b) => a + b.size, 0);

  // Donut arcs
  const donutArcs = useMemo(() => {
    const cx = 120, cy = 120, R = 90, r = 52;
    let cumAngle = -Math.PI / 2;
    return BOND_MARKETS.map((m) => {
      const angle = (m.pct / 100) * 2 * Math.PI;
      const x1 = cx + R * Math.cos(cumAngle);
      const y1 = cy + R * Math.sin(cumAngle);
      const x2 = cx + R * Math.cos(cumAngle + angle);
      const y2 = cy + R * Math.sin(cumAngle + angle);
      const ix1 = cx + r * Math.cos(cumAngle);
      const iy1 = cy + r * Math.sin(cumAngle);
      const ix2 = cx + r * Math.cos(cumAngle + angle);
      const iy2 = cy + r * Math.sin(cumAngle + angle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const midAngle = cumAngle + angle / 2;
      const lx = cx + (R + 16) * Math.cos(midAngle);
      const ly = cy + (R + 16) * Math.sin(midAngle);
      cumAngle += angle;
      return { ...m, x1, y1, x2, y2, ix1, iy1, ix2, iy2, largeArc, lx, ly, midAngle };
    });
  }, []);

  // Negative yield line chart
  const negYieldChart = useMemo(() => {
    const W = 560, H = 160, PAD = 40;
    const minY = -0.6, maxY = 3.0;
    const scaleX = (i: number) => PAD + (i / (NEG_YIELD_YEARS.length - 1)) * (W - PAD * 2);
    const scaleY = (v: number) => PAD + ((maxY - v) / (maxY - minY)) * (H - PAD * 2);
    const jpPath = NEG_YIELD_JP.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`).join(" ");
    const dePath = NEG_YIELD_DE.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`).join(" ");
    const zeroY = scaleY(0);
    return { W, H, PAD, scaleX, scaleY, jpPath, dePath, zeroY };
  }, []);

  // Global Agg bars
  const aggWidth = 420;

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Global Bond Market", value: `$${total.toFixed(0)}T`, sub: "Total outstanding", icon: Globe, color: "text-primary" },
          { label: "Negative Yield Debt", value: "$1.2T", sub: "Down from $18T peak", icon: TrendingDown, color: "text-red-400" },
          { label: "Avg. Global Duration", value: "7.8 yrs", sub: "Bloomberg Global AGG", icon: Activity, color: "text-primary" },
          { label: "Countries in Index", value: "70+", sub: "Bloomberg Global AGG", icon: Landmark, color: "text-emerald-400" },
        ].map((s) => (
          <FadeCard key={s.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <s.icon size={14} className={s.color} />
              <span className="text-xs text-white/50">{s.label}</span>
            </div>
            <span className="text-2xl font-bold text-white">{s.value}</span>
            <span className="text-xs text-white/40">{s.sub}</span>
          </FadeCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Donut chart */}
        <FadeCard>
          <h3 className="mb-3 text-sm font-semibold text-white/80">Global Bond Market by Region ($128T)</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <svg width={240} height={240} viewBox="0 0 240 240">
              {donutArcs.map((arc) => {
                const isSelected = selectedMarket === arc.name;
                const d = `M${arc.x1},${arc.y1} A90,90 0 ${arc.largeArc},1 ${arc.x2},${arc.y2} L${arc.ix2},${arc.iy2} A52,52 0 ${arc.largeArc},0 ${arc.ix1},${arc.iy1} Z`;
                return (
                  <path
                    key={arc.name}
                    d={d}
                    fill={arc.color}
                    opacity={isSelected ? 1 : 0.75}
                    stroke="#0f172a"
                    strokeWidth={2}
                    className="cursor-pointer transition-opacity"
                    onClick={() => setSelectedMarket(isSelected ? null : arc.name)}
                  />
                );
              })}
              <text x={120} y={115} textAnchor="middle" fill="white" fontSize={18} fontWeight={700}>
                $128T
              </text>
              <text x={120} y={132} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10}>
                global bonds
              </text>
            </svg>
            <div className="flex flex-col gap-2">
              {BOND_MARKETS.map((m) => (
                <button
                  key={m.name}
                  className="flex items-center gap-2 text-left"
                  onClick={() => setSelectedMarket(selectedMarket === m.name ? null : m.name)}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  <span className={cn("text-xs", selectedMarket === m.name ? "text-white font-medium" : "text-white/60")}>
                    {m.name}
                  </span>
                  <span className="ml-auto text-xs text-white/40">${m.size}T</span>
                  <span className="text-xs font-medium" style={{ color: m.color }}>{m.pct}%</span>
                </button>
              ))}
            </div>
          </div>
        </FadeCard>

        {/* Global Agg composition */}
        <FadeCard>
          <h3 className="mb-4 text-sm font-semibold text-white/80">Bloomberg Global Aggregate Index Composition</h3>
          <div className="space-y-2">
            {GLOBAL_AGG.map((g) => (
              <div key={g.label} className="flex items-center gap-2">
                <span className="w-28 text-xs text-white/60">{g.label}</span>
                <div className="relative flex-1 h-4 rounded bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.pct / 22.5) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="absolute inset-y-0 left-0 rounded"
                    style={{ background: g.color, opacity: 0.75 }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-white">{g.pct}%</span>
              </div>
            ))}
          </div>
        </FadeCard>
      </div>

      {/* Yield comparison table */}
      <FadeCard>
        <h3 className="mb-3 text-sm font-semibold text-white/80">10-Year Government Bond Yields — 15 Countries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="pb-2 text-left font-medium">Country</th>
                <th className="pb-2 text-left font-medium">Rating</th>
                <th className="pb-2 text-right font-medium">Yield</th>
                <th className="pb-2 text-right font-medium">1M Chg</th>
                <th className="pb-2 text-right font-medium">Duration (yr)</th>
                <th className="pb-2 text-left font-medium pl-3">Ccy</th>
              </tr>
            </thead>
            <tbody>
              {YIELD_TABLE.map((row) => (
                <tr key={row.country} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-1.5 font-medium text-white">
                    {row.flag} {row.country}
                  </td>
                  <td className="py-1.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-medium",
                        row.rating.startsWith("AA") || row.rating === "AAA"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : row.rating.startsWith("A")
                          ? "bg-primary/20 text-primary"
                          : row.rating.startsWith("BBB")
                          ? "bg-yellow-500/20 text-yellow-300"
                          : row.rating.startsWith("BB")
                          ? "bg-orange-500/20 text-orange-300"
                          : "bg-red-500/20 text-red-300"
                      )}
                    >
                      {row.rating}
                    </span>
                  </td>
                  <td className="py-1.5 text-right font-mono font-semibold text-white">
                    {row.yield10y.toFixed(2)}%
                  </td>
                  <td className={cn("py-1.5 text-right font-mono", row.change1m >= 0 ? "text-red-400" : "text-emerald-400")}>
                    {row.change1m >= 0 ? "+" : ""}{row.change1m.toFixed(2)}%
                  </td>
                  <td className="py-1.5 text-right text-white/60">{row.duration.toFixed(1)}</td>
                  <td className="py-1.5 pl-3 text-white/40">{row.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeCard>

      {/* Negative yield history */}
      <FadeCard>
        <h3 className="mb-3 text-sm font-semibold text-white/80">10Y Yield History — Japan &amp; Germany (2016–2026)</h3>
        <p className="mb-3 text-xs text-white/40">
          Both countries had extended periods of negative yields. Japan maintained negative rates until 2024; Germany peaked at −0.45% in 2020.
        </p>
        <svg width="100%" viewBox={`0 0 ${negYieldChart.W} ${negYieldChart.H}`} className="overflow-visible">
          {/* Zero line */}
          <line
            x1={negYieldChart.PAD}
            y1={negYieldChart.zeroY}
            x2={negYieldChart.W - negYieldChart.PAD}
            y2={negYieldChart.zeroY}
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.5}
          />
          <text x={negYieldChart.W - negYieldChart.PAD + 4} y={negYieldChart.zeroY + 4} fill="#ef444480" fontSize={9}>0%</text>

          {/* Y gridlines */}
          {[-0.5, 0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((v) => {
            const y = negYieldChart.scaleY(v);
            return (
              <g key={v}>
                <line x1={negYieldChart.PAD} y1={y} x2={negYieldChart.W - negYieldChart.PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <text x={negYieldChart.PAD - 4} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="end">{v.toFixed(1)}%</text>
              </g>
            );
          })}

          {/* X labels */}
          {NEG_YIELD_YEARS.map((yr, i) => (
            <text key={yr} x={negYieldChart.scaleX(i)} y={negYieldChart.H - 6} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="middle">
              {yr}
            </text>
          ))}

          {/* Lines */}
          <path d={negYieldChart.jpPath} fill="none" stroke="#ec4899" strokeWidth={2} />
          <path d={negYieldChart.dePath} fill="none" stroke="#8b5cf6" strokeWidth={2} />

          {/* Dots */}
          {NEG_YIELD_JP.map((v, i) => (
            <circle key={`jp${i}`} cx={negYieldChart.scaleX(i)} cy={negYieldChart.scaleY(v)} r={3} fill="#ec4899" />
          ))}
          {NEG_YIELD_DE.map((v, i) => (
            <circle key={`de${i}`} cx={negYieldChart.scaleX(i)} cy={negYieldChart.scaleY(v)} r={3} fill="#8b5cf6" />
          ))}

          {/* Legend */}
          <circle cx={negYieldChart.PAD + 10} cy={15} r={4} fill="#ec4899" />
          <text x={negYieldChart.PAD + 18} y={19} fill="rgba(255,255,255,0.7)" fontSize={10}>Japan (JPY 10Y)</text>
          <circle cx={negYieldChart.PAD + 130} cy={15} r={4} fill="#8b5cf6" />
          <text x={negYieldChart.PAD + 138} y={19} fill="rgba(255,255,255,0.7)" fontSize={10}>Germany (EUR 10Y)</text>
        </svg>
      </FadeCard>
    </div>
  );
}

// ── Tab 2: EM Bonds ────────────────────────────────────────────────────────────

function EMBondsTab() {
  const [view, setView] = useState<"hard" | "local">("hard");

  const barMax = view === "hard" ? 1300 : 30;
  const barVals = EM_COUNTRIES.map((c) => (view === "hard" ? c.spreadHC : c.spreadLC));

  return (
    <div className="space-y-6">
      {/* Explainer cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FadeCard className="border-border bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Hard Currency (HC) Bonds</span>
          </div>
          <ul className="space-y-1 text-xs text-white/60">
            <li>• Denominated in USD (or EUR/GBP) — eliminates local FX risk</li>
            <li>• Included in JPMorgan EMBI Global index</li>
            <li>• Typical issuers: sovereigns, quasi-sovereigns, corporates</li>
            <li>• Return driver: US Treasury yield + EM credit spread</li>
            <li>• Lower yield but more stable for risk-off environments</li>
          </ul>
        </FadeCard>
        <FadeCard className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">Local Currency (LC) Bonds</span>
          </div>
          <ul className="space-y-1 text-xs text-white/60">
            <li>• Denominated in local currency — adds FX exposure</li>
            <li>• Included in JPMorgan GBI-EM Global Diversified index</li>
            <li>• Return driver: local yield + FX return vs USD</li>
            <li>• Higher yield reflects inflation + FX depreciation risk</li>
            <li>• Greater diversification vs developed market bonds</li>
          </ul>
        </FadeCard>
      </div>

      {/* Spread bar chart */}
      <FadeCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/80">
            {view === "hard" ? "Hard Currency Spread vs US Treasuries (bps)" : "Local Currency 10Y Yield (%)"}
          </h3>
          <div className="flex gap-1">
            {(["hard", "local"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  view === v ? "bg-primary/30 text-primary" : "text-white/40 hover:text-white/60"
                )}
              >
                {v === "hard" ? "Hard CCY" : "Local CCY"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {EM_COUNTRIES.map((c, i) => {
            const val = barVals[i];
            const widthPct = (val / barMax) * 100;
            const color =
              val > (view === "hard" ? 600 : 20)
                ? "#ef4444"
                : val > (view === "hard" ? 300 : 12)
                ? "#f59e0b"
                : "#10b981";
            return (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-24 text-xs text-white/70">
                  {c.flag} {c.name}
                </span>
                <div className="relative flex-1 h-5 rounded bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(widthPct, 100)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="absolute inset-y-0 left-0 rounded"
                    style={{ background: color, opacity: 0.7 }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-xs font-medium text-white">
                  {view === "hard" ? `${val}bps` : `${val.toFixed(2)}%`}
                </span>
                <span
                  className={cn(
                    "w-12 text-right text-xs",
                    c.rating.startsWith("BBB") ? "text-yellow-300" : c.rating.startsWith("BB") ? "text-orange-300" : "text-red-300"
                  )}
                >
                  {c.rating}
                </span>
              </div>
            );
          })}
        </div>
      </FadeCard>

      {/* Default history */}
      <FadeCard>
        <h3 className="mb-3 text-sm font-semibold text-white/80">EM Sovereign Default &amp; Restructuring History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="pb-2 text-left font-medium">Country</th>
                <th className="pb-2 text-left font-medium">Year</th>
                <th className="pb-2 text-left font-medium">Instrument</th>
                <th className="pb-2 text-right font-medium">Amount</th>
                <th className="pb-2 text-right font-medium">Recovery</th>
                <th className="pb-2 text-left font-medium pl-3">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_HISTORY.map((d) => (
                <tr key={`${d.country}-${d.year}`} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-2 font-medium text-white">{d.flag} {d.country}</td>
                  <td className="py-2 text-white/60">{d.year}</td>
                  <td className="py-2 text-white/50">{d.instrument}</td>
                  <td className="py-2 text-right font-mono text-white">{d.amount}</td>
                  <td className="py-2 text-right font-mono text-yellow-300">{d.recovery}</td>
                  <td className="py-2 pl-3 text-white/50">{d.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeCard>

      {/* IMF + index inclusion */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FadeCard>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-primary" />
            <h3 className="text-sm font-semibold text-white/80">IMF Program Mechanics</h3>
          </div>
          <div className="space-y-2 text-xs text-white/60">
            <div className="flex gap-2">
              <span className="text-primary font-semibold w-20 shrink-0">SBA</span>
              <span>Stand-By Arrangement: short-term 12–24 month support; conditionality includes fiscal consolidation, FX flexibility</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold w-20 shrink-0">EFF</span>
              <span>Extended Fund Facility: 3-year structural reform programs for deeper imbalances</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold w-20 shrink-0">RSF</span>
              <span>Resilience &amp; Sustainability Facility: new climate/pandemic resilience instrument</span>
            </div>
            <div className="rounded bg-white/5 p-2 mt-2">
              <p className="text-white/50">IMF programs signal willingness to reform, often catalyzing private market access. Bond prices typically rally 10–30% on IMF approval.</p>
            </div>
          </div>
        </FadeCard>

        <FadeCard>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-primary" />
            <h3 className="text-sm font-semibold text-white/80">JPMorgan Index Inclusion Criteria</h3>
          </div>
          <div className="space-y-3 text-xs text-white/60">
            <div>
              <p className="text-primary font-semibold mb-1">EMBI Global (Hard Currency)</p>
              <ul className="space-y-0.5">
                <li>• Min outstanding $500M per bond</li>
                <li>• Residual maturity &gt; 2.5 years</li>
                <li>• Not World Bank high-income classification</li>
                <li>• Must be liquid and tradable</li>
              </ul>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold mb-1">GBI-EM Global Diversified (Local Currency)</p>
              <ul className="space-y-0.5">
                <li>• Market accessible to foreign investors</li>
                <li>• Min market cap $25B</li>
                <li>• 9-month minimum market access history</li>
                <li>• Countries capped at 10% weight</li>
              </ul>
            </div>
          </div>
        </FadeCard>
      </div>
    </div>
  );
}

// ── Tab 3: Currency Hedging ────────────────────────────────────────────────────

function CurrencyHedgingTab() {
  const [selectedPair, setSelectedPair] = useState<string>("JPY/USD");

  const selected = HEDGE_TABLE.find((h) => h.pair === selectedPair) ?? HEDGE_TABLE[0];

  // Bar chart: hedged vs unhedged
  const chartH = 180;
  const chartW = 580;
  const barW = 38;
  const gap = 20;
  const groupW = barW * 2 + 8;
  const totalGroupW = groupW + gap;
  const maxY = Math.max(...HEDGE_TABLE.map((h) => Math.max(h.unhedgedRet, h.hedgedRet))) + 2;

  const scaleY = (v: number) => chartH - 20 - (v / maxY) * (chartH - 40);

  return (
    <div className="space-y-6">
      {/* Concept cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Covered Interest Parity",
            icon: Scale,
            color: "text-primary",
            body: "F/S = (1 + r_d) / (1 + r_f) — forward exchange rate reflects interest rate differential. Hedge cost ≈ rate differential between two countries.",
          },
          {
            title: "Cross-Currency Basis Swap",
            icon: ArrowUpDown,
            color: "text-primary",
            body: "Exchange floating rate cashflows in different currencies. Basis = deviation from covered interest parity. Negative EUR/USD basis means USD demand premium.",
          },
          {
            title: "Duration-Matching Hedge",
            icon: Target,
            color: "text-emerald-400",
            body: "Match FX forward maturity to bond duration. Rolling 3-month forwards for long-dated bonds introduces roll risk. Some managers use swaps for longer tenors.",
          },
        ].map((c) => (
          <FadeCard key={c.title} className="border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={14} className={c.color} />
              <span className="text-sm font-semibold text-white/80">{c.title}</span>
            </div>
            <p className="text-xs text-white/50">{c.body}</p>
          </FadeCard>
        ))}
      </div>

      {/* Hedged vs unhedged bar chart */}
      <FadeCard>
        <h3 className="mb-4 text-sm font-semibold text-white/80">Hedged vs Unhedged Return by Currency Pair (vs USD baseline ~4.25%)</h3>
        <div className="overflow-x-auto">
          <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
            {/* Gridlines */}
            {[0, 3, 6, 9, 12, 15].map((v) => {
              const y = scaleY(v);
              if (y < 0) return null;
              return (
                <g key={v}>
                  <line x1={30} y1={y} x2={chartW - 10} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                  <text x={26} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="end">{v}%</text>
                </g>
              );
            })}

            {HEDGE_TABLE.map((h, i) => {
              const x = 35 + i * totalGroupW;
              const unhedgedBarH = ((h.unhedgedRet / maxY) * (chartH - 40));
              const hedgedBarH = ((h.hedgedRet / maxY) * (chartH - 40));
              return (
                <g key={h.pair}>
                  {/* Unhedged bar */}
                  <rect
                    x={x}
                    y={scaleY(h.unhedgedRet)}
                    width={barW}
                    height={unhedgedBarH}
                    fill="#ef4444"
                    opacity={0.65}
                    rx={2}
                    className="cursor-pointer"
                    onClick={() => setSelectedPair(h.pair)}
                  />
                  {/* Hedged bar */}
                  <rect
                    x={x + barW + 8}
                    y={scaleY(h.hedgedRet)}
                    width={barW}
                    height={hedgedBarH}
                    fill="#22c55e"
                    opacity={0.65}
                    rx={2}
                    className="cursor-pointer"
                    onClick={() => setSelectedPair(h.pair)}
                  />
                  {/* Label */}
                  <text
                    x={x + barW + 4}
                    y={chartH - 4}
                    fill={selectedPair === h.pair ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
                    fontSize={8}
                    textAnchor="middle"
                  >
                    {h.pair.split("/")[0]}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <rect x={35} y={8} width={10} height={8} fill="#ef4444" opacity={0.65} rx={1} />
            <text x={50} y={16} fill="rgba(255,255,255,0.6)" fontSize={9}>Unhedged</text>
            <rect x={110} y={8} width={10} height={8} fill="#22c55e" opacity={0.65} rx={1} />
            <text x={125} y={16} fill="rgba(255,255,255,0.6)" fontSize={9}>Hedged</text>
          </svg>
        </div>
      </FadeCard>

      {/* Hedge cost table */}
      <FadeCard>
        <h3 className="mb-3 text-sm font-semibold text-white/80">FX Hedging Cost by Currency Pair</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="pb-2 text-left font-medium">Pair</th>
                <th className="pb-2 text-right font-medium">Rate Diff (vs USD)</th>
                <th className="pb-2 text-right font-medium">Hedge Cost p.a.</th>
                <th className="pb-2 text-right font-medium">Unhedged Ret</th>
                <th className="pb-2 text-right font-medium">Hedged Ret</th>
                <th className="pb-2 text-right font-medium">Net Benefit</th>
              </tr>
            </thead>
            <tbody>
              {HEDGE_TABLE.map((h) => {
                const netBenefit = h.hedgedRet - h.unhedgedRet;
                const isSelected = selectedPair === h.pair;
                return (
                  <tr
                    key={h.pair}
                    className={cn(
                      "border-b border-white/5 cursor-pointer transition-colors",
                      isSelected ? "bg-primary/10" : "hover:bg-white/3"
                    )}
                    onClick={() => setSelectedPair(h.pair)}
                  >
                    <td className="py-1.5 font-semibold text-white">{h.pair}</td>
                    <td className={cn("py-1.5 text-right font-mono", h.rateDiff < 0 ? "text-red-400" : "text-emerald-400")}>
                      {h.rateDiff > 0 ? "+" : ""}{h.rateDiff.toFixed(2)}%
                    </td>
                    <td className={cn("py-1.5 text-right font-mono", h.hedgeCost < 0 ? "text-red-400" : "text-emerald-400")}>
                      {h.hedgeCost > 0 ? "+" : ""}{h.hedgeCost.toFixed(2)}%
                    </td>
                    <td className="py-1.5 text-right font-mono text-white">{h.unhedgedRet.toFixed(2)}%</td>
                    <td className="py-1.5 text-right font-mono text-white">{h.hedgedRet.toFixed(2)}%</td>
                    <td className={cn("py-1.5 text-right font-mono font-semibold", netBenefit >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {netBenefit >= 0 ? "+" : ""}{netBenefit.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </FadeCard>

      {/* Selected pair detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPair}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <FadeCard className="border-border bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown size={14} className="text-primary" />
              <h3 className="text-sm font-semibold text-primary">{selected.pair} Hedge Analysis</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div>
                <p className="text-white/40 mb-0.5">Interest Rate Diff</p>
                <p className={cn("font-semibold", selected.rateDiff < 0 ? "text-red-300" : "text-emerald-300")}>
                  {selected.rateDiff > 0 ? "+" : ""}{selected.rateDiff.toFixed(2)}% p.a.
                </p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Hedging Cost</p>
                <p className={cn("font-semibold", selected.hedgeCost < 0 ? "text-red-300" : "text-yellow-300")}>
                  {selected.hedgeCost > 0 ? "+" : ""}{selected.hedgeCost.toFixed(2)}% p.a.
                </p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Unhedged Return</p>
                <p className="font-semibold text-white">{selected.unhedgedRet.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Hedged Return</p>
                <p className={cn("font-semibold", selected.hedgedRet > selected.unhedgedRet ? "text-emerald-300" : "text-white")}>
                  {selected.hedgedRet.toFixed(2)}%
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/40">
              {selected.hedgeCost < 0
                ? `${selected.pair.split("/")[0]} rates are lower than USD, so hedging into USD generates a positive carry of ${Math.abs(selected.hedgeCost).toFixed(2)}% — making foreign bonds more attractive on a hedged basis.`
                : `${selected.pair.split("/")[0]} rates are higher than USD, so hedging back to USD costs ${selected.hedgeCost.toFixed(2)}% p.a. via forward discount, reducing yield advantage.`}
            </p>
          </FadeCard>
        </motion.div>
      </AnimatePresence>

      {/* Strategic vs tactical */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FadeCard>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-sm font-semibold text-white/80">Strategic Currency Exposure</span>
          </div>
          <ul className="space-y-1 text-xs text-white/50">
            <li>• Fully hedge developed market bonds to remove FX noise</li>
            <li>• EUR, GBP, JPY often hedged — rate differentials predictable</li>
            <li>• Swiss Franc hedge is expensive due to very low CHF rates</li>
            <li>• Many pension funds benchmark to hedged global bond indices</li>
            <li>• Reduces volatility by ~30–40% vs unhedged for JPY bonds</li>
          </ul>
        </FadeCard>
        <FadeCard>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-yellow-400" />
            <span className="text-sm font-semibold text-white/80">Tactical Currency Overlay</span>
          </div>
          <ul className="space-y-1 text-xs text-white/50">
            <li>• Active managers may leave EM currencies unhedged for alpha</li>
            <li>• EM hedging expensive: BRL/USD cost can exceed 8% p.a.</li>
            <li>• Carry strategies: borrow low-yield, invest high-yield currencies</li>
            <li>• Momentum and valuation signals used for currency timing</li>
            <li>• Options overlays (collars) limit downside at lower cost</li>
          </ul>
        </FadeCard>
      </div>
    </div>
  );
}

// ── Tab 4: Portfolio Construction ─────────────────────────────────────────────

function PortfolioConstructionTab() {
  const [highlightPoint, setHighlightPoint] = useState<string | null>(null);

  // Efficient frontier SVG
  const efW = 380, efH = 220;
  const padL = 40, padB = 30, padR = 20, padT = 20;
  const plotW = efW - padL - padR;
  const plotH = efH - padT - padB;

  const minVol = 3.5, maxVol = 8.0, minRet = 3.5, maxRet = 6.5;
  const scaleEfX = (v: number) => padL + ((v - minVol) / (maxVol - minVol)) * plotW;
  const scaleEfY = (v: number) => padT + plotH - ((v - minRet) / (maxRet - minRet)) * plotH;

  // Frontier curve points (parametric)
  const frontierPts = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const vol = 3.8 + t * 3.8;
      const ret = -0.3 * vol * vol + 3.8 * vol - 5.2;
      const clampedRet = Math.max(minRet, Math.min(maxRet, ret));
      pts.push(`${scaleEfX(vol)},${scaleEfY(clampedRet)}`);
    }
    return "M" + pts.join(" L");
  }, []);

  // Correlation matrix cell color
  const corrColor = (v: number) => {
    if (v >= 0.9) return "#ef4444";
    if (v >= 0.7) return "#f97316";
    if (v >= 0.5) return "#f59e0b";
    if (v >= 0.3) return "#84cc16";
    return "#22c55e";
  };

  return (
    <div className="space-y-6">
      {/* Efficient frontier + correlation side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Efficient frontier */}
        <FadeCard>
          <h3 className="mb-2 text-sm font-semibold text-white/80">Efficient Frontier — Global Bond Portfolios</h3>
          <p className="mb-3 text-xs text-white/40">Expected 5Y return vs annualized volatility. Hedged global diversification improves Sharpe ratio.</p>
          <svg width="100%" viewBox={`0 0 ${efW} ${efH}`} className="overflow-visible">
            {/* Grid */}
            {[4.0, 4.5, 5.0, 5.5, 6.0].map((v) => {
              const y = scaleEfY(v);
              return (
                <g key={v}>
                  <line x1={padL} y1={y} x2={efW - padR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <text x={padL - 4} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="end">{v}%</text>
                </g>
              );
            })}
            {[4, 5, 6, 7, 8].map((v) => {
              const x = scaleEfX(v);
              return (
                <g key={v}>
                  <line x1={x} y1={padT} x2={x} y2={efH - padB} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <text x={x} y={efH - padB + 12} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="middle">{v}%</text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text x={efW / 2} y={efH - 2} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="middle">Volatility (σ)</text>
            <text x={10} y={efH / 2} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="middle" transform={`rotate(-90, 10, ${efH / 2})`}>Return</text>

            {/* Frontier curve */}
            <path d={frontierPts} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />

            {/* Points */}
            {PORTFOLIO_POINTS.map((p) => {
              const cx = scaleEfX(p.vol);
              const cy = scaleEfY(p.ret);
              const isHL = highlightPoint === p.label;
              return (
                <g
                  key={p.label}
                  className="cursor-pointer"
                  onMouseEnter={() => setHighlightPoint(p.label)}
                  onMouseLeave={() => setHighlightPoint(null)}
                >
                  <circle cx={cx} cy={cy} r={isHL ? p.radius + 3 : p.radius} fill={p.color} opacity={isHL ? 1 : 0.75} />
                  {isHL && (
                    <>
                      <rect x={cx + 6} y={cy - 18} width={p.label.length * 5.5 + 8} height={16} rx={3} fill="#1e293b" />
                      <text x={cx + 10} y={cy - 6} fill="white" fontSize={9}>{p.label}</text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
          {/* Legend */}
          <div className="mt-2 grid grid-cols-2 gap-1">
            {PORTFOLIO_POINTS.map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-1.5 cursor-pointer"
                onMouseEnter={() => setHighlightPoint(p.label)}
                onMouseLeave={() => setHighlightPoint(null)}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                <span className="text-xs text-white/50">{p.label}</span>
              </div>
            ))}
          </div>
        </FadeCard>

        {/* Correlation matrix */}
        <FadeCard>
          <h3 className="mb-3 text-sm font-semibold text-white/80">Correlation Matrix — Global Bond Sectors</h3>
          <p className="mb-3 text-xs text-white/40">Lower correlations improve portfolio efficiency. EM Local Currency adds most diversification.</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="pb-1 pr-2 text-right text-white/30 text-xs font-normal w-20"></th>
                  {CORR_LABELS.map((l) => (
                    <th key={l} className="pb-1 px-1 text-center text-white/40 font-normal text-xs w-14">
                      <span className="block truncate w-14">{l}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CORR_MATRIX.map((row, ri) => (
                  <tr key={ri}>
                    <td className="py-0.5 pr-2 text-right text-white/60 text-xs whitespace-nowrap">{CORR_LABELS[ri]}</td>
                    {row.map((val, ci) => (
                      <td key={ci} className="py-0.5 px-0.5">
                        <div
                          className="w-12 h-8 rounded flex items-center justify-center text-xs font-mono font-medium"
                          style={{
                            background: ri === ci ? "rgba(255,255,255,0.15)" : `${corrColor(val)}20`,
                            color: ri === ci ? "white" : corrColor(val),
                            border: `1px solid ${corrColor(val)}30`,
                          }}
                        >
                          {val.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeCard>
      </div>

      {/* Duration strategies */}
      <FadeCard>
        <h3 className="mb-4 text-sm font-semibold text-white/80">Duration Strategy Comparison — Ladder vs Barbell vs Bullet</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              name: "Ladder",
              color: "#3b82f6",
              bars: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
              pros: ["Consistent reinvestment", "Lower roll risk", "Diversified maturity exposure"],
              cons: ["Average yield (no curve positioning)", "Inefficient if yield curve is steep"],
            },
            {
              name: "Barbell",
              color: "#8b5cf6",
              bars: [90, 85, 0, 0, 0, 0, 0, 0, 85, 90],
              pros: ["Captures both short-end yield and long-end duration", "Outperforms in flattening environments"],
              cons: ["Underperforms in steep curves", "Higher convexity drag if rates stable"],
            },
            {
              name: "Bullet",
              color: "#10b981",
              bars: [0, 0, 0, 85, 90, 90, 85, 0, 0, 0],
              pros: ["Maximizes exposure to target maturity", "Best for liability matching"],
              cons: ["Concentrated roll risk at maturity", "High reinvestment risk at maturity"],
            },
          ].map((strat) => (
            <div key={strat.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-sm mb-3" style={{ color: strat.color }}>{strat.name}</p>
              {/* Mini bar chart */}
              <div className="flex items-end gap-0.5 h-10 mb-3">
                {strat.bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: strat.color,
                      opacity: h > 0 ? 0.7 : 0,
                    }}
                  />
                ))}
              </div>
              <div className="space-y-1 text-xs">
                {strat.pros.map((p) => (
                  <div key={p} className="flex gap-1.5">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    <span className="text-white/50">{p}</span>
                  </div>
                ))}
                {strat.cons.map((c) => (
                  <div key={c} className="flex gap-1.5">
                    <span className="text-red-400 mt-0.5">−</span>
                    <span className="text-white/50">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FadeCard>

      {/* Liquidity tiers + ESG */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FadeCard>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-yellow-400" />
            <h3 className="text-sm font-semibold text-white/80">Liquidity Tiers in Global Fixed Income</h3>
          </div>
          <div className="space-y-2">
            {[
              { tier: "Tier 1", label: "On-the-run US Treasuries, German Bunds, JGBs", bid_ask: "0.5–2bps", color: "#22c55e" },
              { tier: "Tier 2", label: "Off-the-run govts, G10 covered bonds, IG corporates", bid_ask: "5–20bps", color: "#84cc16" },
              { tier: "Tier 3", label: "EM hard currency sovereign, high-yield IG crossover", bid_ask: "20–80bps", color: "#f59e0b" },
              { tier: "Tier 4", label: "EM local currency, frontier market bonds", bid_ask: "80–200bps", color: "#f97316" },
              { tier: "Tier 5", label: "Distressed/defaulted bonds, illiquid EM", bid_ask: "200bps+", color: "#ef4444" },
            ].map((t) => (
              <div key={t.tier} className="flex items-start gap-2">
                <span className="rounded px-1.5 py-0.5 text-xs font-bold mt-0.5" style={{ background: `${t.color}25`, color: t.color }}>
                  {t.tier}
                </span>
                <div className="flex-1 text-xs text-white/50">{t.label}</div>
                <span className="text-xs font-mono text-white/40 whitespace-nowrap">{t.bid_ask}</span>
              </div>
            ))}
          </div>
        </FadeCard>

        <FadeCard>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={14} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white/80">ESG Integration in Fixed Income</h3>
          </div>
          <div className="space-y-3 text-xs text-white/50">
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Green / Social / Sustainability Bonds</p>
              <p>Use-of-proceeds bonds with ring-fenced ESG projects. Now $4T+ market. "Greenium" of 3–8bps vs conventional bonds for AAA issuers.</p>
            </div>
            <div>
              <p className="text-primary font-semibold mb-1">ESG-Integrated Scoring</p>
              <p>MSCI, Sustainalytics, ISS ratings applied to bond issuers. Higher ESG scores correlate with lower default probability and credit spread tightening.</p>
            </div>
            <div>
              <p className="text-yellow-300 font-semibold mb-1">Sovereign ESG Factors</p>
              <p>Governance quality (rule of law, corruption), environmental exposure (climate vulnerability), social metrics (inequality, labor) integrated into EM sovereign analysis.</p>
            </div>
            <div>
              <p className="text-primary font-semibold mb-1">Multi-Currency Benchmark Tracking</p>
              <p>Managers track Bloomberg Global AGG or FTSE WGBI. Currency, duration, and sector buckets all managed vs benchmark weights with ±20–30% active share limits.</p>
            </div>
          </div>
        </FadeCard>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function GlobalFixedIncomePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Market Overview", icon: Globe },
    { id: "em", label: "EM Bonds", icon: TrendingUp },
    { id: "hedging", label: "Currency Hedging", icon: ArrowUpDown },
    { id: "portfolio", label: "Portfolio Construction", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/15 p-2">
              <Globe size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Global Fixed Income</h1>
              <p className="text-sm text-white/50">
                Cross-border bond investing, sovereign &amp; corporate credit, EM bonds, FX hedging, and portfolio construction
              </p>
            </div>
            <Badge variant="outline" className="ml-auto border-border text-primary text-xs">
              Professional
            </Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex h-auto flex-wrap gap-1 bg-white/5 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 rounded px-3 py-2 text-sm data-[state=active]:bg-primary/25 data-[state=active]:text-primary"
              >
                <tab.icon size={13} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="data-[state=inactive]:hidden">
              <MarketOverviewTab />
            </TabsContent>
            <TabsContent value="em" className="data-[state=inactive]:hidden">
              <EMBondsTab />
            </TabsContent>
            <TabsContent value="hedging" className="data-[state=inactive]:hidden">
              <CurrencyHedgingTab />
            </TabsContent>
            <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
              <PortfolioConstructionTab />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
