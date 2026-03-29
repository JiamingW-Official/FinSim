"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Calculator,
  ShieldCheck,
  BarChart3,
  Activity,
  Globe,
  DollarSign,
  Percent,
  RefreshCw,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 843;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_VALUES: number[] = [];
for (let i = 0; i < 3000; i++) {
  RAND_VALUES.push(rand());
}
let randIdx = 0;
const rng = () => RAND_VALUES[randIdx++ % RAND_VALUES.length];

// ── TIPS / Linker math helpers ────────────────────────────────────────────────

function adjPrincipal(par: number, cpiRatio: number): number {
  return Math.max(par, par * cpiRatio); // deflation floor at par
}

function couponPayment(par: number, couponRate: number, cpiRatio: number): number {
  return (adjPrincipal(par, cpiRatio) * couponRate) / 2; // semi-annual
}

function realDuration(nominalDuration: number, inflation: number): number {
  // Real duration ≈ nominal duration / (1 + expected inflation)
  return nominalDuration / (1 + inflation / 100);
}

function fisherRealRate(nominalRate: number, inflation: number): number {
  return ((1 + nominalRate / 100) / (1 + inflation / 100) - 1) * 100;
}

function breakevenInflation(nominalYield: number, realYield: number): number {
  return nominalYield - realYield;
}

// ── Static data ───────────────────────────────────────────────────────────────

const GLOBAL_LINKER_MARKETS = [
  {
    country: "United States",
    instrument: "TIPS",
    marketSize: "$1.9T",
    realYield: 2.18,
    breakeven: 2.35,
    maturityRange: "5–30y",
    couponFreq: "Semi-annual",
    deflationProtection: true,
    flag: "🇺🇸",
  },
  {
    country: "United Kingdom",
    instrument: "Index-Linked Gilts",
    marketSize: "£590B",
    realYield: 0.72,
    breakeven: 3.45,
    maturityRange: "2–50y",
    couponFreq: "Semi-annual",
    deflationProtection: false,
    flag: "🇬🇧",
  },
  {
    country: "Eurozone",
    instrument: "OATi / Bund Linker",
    marketSize: "€800B",
    realYield: 0.41,
    breakeven: 2.81,
    maturityRange: "5–30y",
    couponFreq: "Annual",
    deflationProtection: true,
    flag: "🇪🇺",
  },
  {
    country: "Canada",
    instrument: "Real Return Bonds",
    marketSize: "C$90B",
    realYield: 1.64,
    breakeven: 2.12,
    maturityRange: "10–30y",
    couponFreq: "Semi-annual",
    deflationProtection: true,
    flag: "🇨🇦",
  },
  {
    country: "Australia",
    instrument: "Treasury Indexed Bonds",
    marketSize: "A$50B",
    realYield: 1.89,
    breakeven: 2.58,
    maturityRange: "5–25y",
    couponFreq: "Quarterly",
    deflationProtection: false,
    flag: "🇦🇺",
  },
];

// Generate nominal vs real yield series (40 periods)
const YIELD_SERIES = (() => {
  const points: { period: number; nominal: number; real: number; breakeven: number }[] = [];
  let nominal = 4.5;
  let real = 1.8;
  for (let i = 0; i < 40; i++) {
    nominal += (rng() - 0.48) * 0.25;
    real += (rng() - 0.49) * 0.18;
    nominal = Math.max(0.5, Math.min(7.5, nominal));
    real = Math.max(-1.5, Math.min(4.0, real));
    points.push({
      period: i,
      nominal: +nominal.toFixed(3),
      real: +real.toFixed(3),
      breakeven: +(nominal - real).toFixed(3),
    });
  }
  return points;
})();

// Real yield history since 2000 (24 data points ~ yearly)
const REAL_YIELD_HISTORY = (() => {
  const years: { year: number; real: number }[] = [];
  const startYear = 2000;
  let val = 3.8;
  for (let i = 0; i < 25; i++) {
    val += (rng() - 0.52) * 0.65;
    val = Math.max(-1.8, Math.min(4.5, val));
    years.push({ year: startYear + i, real: +val.toFixed(2) });
  }
  return years;
})();

// Inflation beta by asset class
const INFLATION_BETA_TABLE = [
  { asset: "TIPS / Linkers", beta: 0.92, correlation: 0.88, description: "Direct CPI linkage" },
  { asset: "Commodities", beta: 1.45, correlation: 0.72, description: "Lead indicator" },
  { asset: "REITs", beta: 0.68, correlation: 0.51, description: "Rent indexation" },
  { asset: "Equities (S&P 500)", beta: 0.21, correlation: 0.18, description: "Diluted by growth" },
  { asset: "Nominal Bonds", beta: -0.38, correlation: -0.41, description: "Negative real return risk" },
  { asset: "Gold", beta: 0.83, correlation: 0.61, description: "Store of value" },
  { asset: "Infrastructure", beta: 0.74, correlation: 0.59, description: "CPI-linked revenues" },
  { asset: "Cash / T-Bills", beta: 0.35, correlation: 0.29, description: "Lagging repricing" },
];

// Hedging effectiveness heat table
const HEDGING_SCENARIOS = ["Low (<2%)", "Moderate (2–3%)", "High (3–6%)", "Stagflation"];
const HEDGING_ASSETS = ["TIPS", "Commodities", "REITs", "Equities", "Nominals", "Gold"];
// Effectiveness scores 0–10
const HEDGING_MATRIX: number[][] = [
  [6, 4, 5, 7, 7, 4],  // Low inflation
  [8, 7, 7, 6, 5, 6],  // Moderate
  [9, 9, 7, 4, 2, 8],  // High
  [8, 6, 3, 2, 1, 9],  // Stagflation
];

// ── SVG helpers ───────────────────────────────────────────────────────────────

function scaleY(value: number, min: number, max: number, height: number, padding = 0): number {
  return padding + ((max - value) / (max - min)) * (height - padding * 2);
}

function scaleX(index: number, total: number, width: number, padding = 0): number {
  return padding + (index / (total - 1)) * (width - padding * 2);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: string;
  color?: "default" | "green" | "red" | "amber" | "blue";
}) {
  const colors = {
    default: "bg-foreground/5 text-muted-foreground border-border",
    green: "bg-emerald-500/5 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/5 text-red-400 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-primary/10 text-primary border-border",
  };
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center", colors[color])}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function SectionCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="rounded-md border border-border/50 bg-foreground/[0.03] p-4">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/50" />}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ── Tab 1: TIPS Mechanics ─────────────────────────────────────────────────────

function TipsMechanicsTab() {
  const [par, setPar] = useState(1000);
  const [couponRate, setCouponRate] = useState(1.5);
  const [cpiStart, setCpiStart] = useState(300);
  const [cpiCurrent, setCpiCurrent] = useState(342);
  const [deflationMode, setDeflationMode] = useState(false);

  const cpiRatio = useMemo(() => {
    const ratio = deflationMode ? 0.92 : cpiCurrent / cpiStart;
    return +ratio.toFixed(6);
  }, [cpiCurrent, cpiStart, deflationMode]);

  const adjPar = useMemo(() => adjPrincipal(par, cpiRatio), [par, cpiRatio]);
  const coupon = useMemo(() => couponPayment(par, couponRate / 100, cpiRatio), [par, couponRate, cpiRatio]);
  const totalInflationAccrual = useMemo(() => adjPar - par, [adjPar, par]);
  const annualRealReturn = useMemo(() => couponRate, [couponRate]);

  // 10-year principal accretion (assume 2.5% annual CPI)
  const accretionData = useMemo(() => {
    const points: { year: number; principal: number; coupon: number }[] = [];
    const annualCpi = 0.025;
    for (let y = 0; y <= 10; y++) {
      const ratio = Math.pow(1 + annualCpi, y);
      points.push({
        year: y,
        principal: Math.round(par * ratio),
        coupon: +((par * ratio * (couponRate / 100)) / 2).toFixed(2),
      });
    }
    return points;
  }, [par, couponRate]);

  const maxPrincipal = Math.max(...accretionData.map((d) => d.principal));
  const W = 520;
  const H = 160;
  const PX = 40;
  const PY = 16;

  return (
    <div className="space-y-5">
      {/* Calculator */}
      <SectionCard title="TIPS Inflation Accrual Calculator" icon={Calculator}>
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Par Value ($)</label>
            <input
              type="number"
              value={par}
              onChange={(e) => setPar(Math.max(100, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Real Coupon Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={couponRate}
              onChange={(e) => setCouponRate(Math.max(0, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Base CPI</label>
            <input
              type="number"
              value={cpiStart}
              onChange={(e) => setCpiStart(Math.max(1, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Current CPI</label>
            <input
              type="number"
              value={cpiCurrent}
              onChange={(e) => setCpiCurrent(Math.max(1, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Deflation toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setDeflationMode(!deflationMode)}
            className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 rounded border transition-colors",
              deflationMode
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-foreground/5 border-border text-muted-foreground"
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            {deflationMode ? "Deflation scenario active (CPI ratio 0.92)" : "Simulate deflation scenario"}
          </button>
          {deflationMode && (
            <span className="text-xs text-amber-400">Deflation floor protects par value at ${par.toLocaleString()}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatChip label="CPI Index Ratio" value={cpiRatio.toFixed(4)} color="blue" />
          <StatChip
            label="Adjusted Principal"
            value={`$${adjPar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="green"
          />
          <StatChip
            label="Semi-Annual Coupon"
            value={`$${coupon.toFixed(2)}`}
            color={deflationMode ? "amber" : "green"}
          />
          <StatChip
            label="Inflation Accrual"
            value={`$${totalInflationAccrual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color={totalInflationAccrual > 0 ? "green" : "amber"}
          />
        </div>

        <div className="mt-3 p-3 rounded bg-primary/8 border border-border text-xs text-muted-foreground space-y-1">
          <p>
            <span className="text-primary font-medium">Formula:</span> Adjusted Principal = Par × (Current CPI / Base CPI)
          </p>
          <p>
            <span className="text-primary font-medium">Coupon:</span> Adjusted Principal × (Real Coupon Rate / 2)
          </p>
          <p>
            <span className="text-primary font-medium">Deflation floor:</span> At maturity, bondholder receives max(Adjusted Principal, Par) — never less than par.
          </p>
          <p>
            <span className="text-primary font-medium">Real annual return:</span> {annualRealReturn.toFixed(2)}% regardless of inflation
          </p>
        </div>
      </SectionCard>

      {/* 10-Year Accretion Timeline */}
      <SectionCard title="10-Year Principal Accretion (2.5% CPI assumption)" icon={TrendingUp}>
        <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full">
          <defs>
            <linearGradient id="accrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
            const y = PY + frac * (H - PY * 2);
            const val = maxPrincipal - frac * (maxPrincipal - par);
            return (
              <g key={i}>
                <line x1={PX} y1={y} x2={W - 10} y2={y} stroke="#ffffff10" strokeWidth="1" />
                <text x={PX - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
                  ${Math.round(val / 100) * 100}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={
              accretionData
                .map((d, i) => {
                  const x = scaleX(i, accretionData.length, W - PX, PX);
                  const y = scaleY(d.principal, par * 0.95, maxPrincipal * 1.02, H, PY);
                  return `${i === 0 ? "M" : "L"}${x},${y}`;
                })
                .join(" ") +
              ` L${scaleX(accretionData.length - 1, accretionData.length, W - PX, PX)},${H - PY} L${PX},${H - PY} Z`
            }
            fill="url(#accrGrad)"
          />

          {/* Line */}
          <polyline
            points={accretionData
              .map((d, i) => {
                const x = scaleX(i, accretionData.length, W - PX, PX);
                const y = scaleY(d.principal, par * 0.95, maxPrincipal * 1.02, H, PY);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Dots */}
          {accretionData.map((d, i) => {
            const x = scaleX(i, accretionData.length, W - PX, PX);
            const y = scaleY(d.principal, par * 0.95, maxPrincipal * 1.02, H, PY);
            return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" stroke="#1e293b" strokeWidth="1.5" />;
          })}

          {/* Year labels */}
          {accretionData
            .filter((_, i) => i % 2 === 0)
            .map((d, idx) => {
              const i = idx * 2;
              const x = scaleX(i, accretionData.length, W - PX, PX);
              return (
                <text key={i} x={x} y={H + 12} textAnchor="middle" fontSize="9" fill="#64748b">
                  Y{d.year}
                </text>
              );
            })}

          {/* Final value annotation */}
          {(() => {
            const last = accretionData[accretionData.length - 1];
            const x = scaleX(accretionData.length - 1, accretionData.length, W - PX, PX);
            const y = scaleY(last.principal, par * 0.95, maxPrincipal * 1.02, H, PY);
            return (
              <g>
                <text x={x - 4} y={y - 8} textAnchor="end" fontSize="10" fill="#3b82f6" fontWeight="bold">
                  ${last.principal.toLocaleString()}
                </text>
              </g>
            );
          })()}
        </svg>
        <p className="text-xs text-muted-foreground mt-1">
          Starting par ${par.toLocaleString()} accretes to ~${accretionData[10].principal.toLocaleString()} over 10 years at 2.5% annual CPI. Coupon payments also rise proportionally.
        </p>
      </SectionCard>

      {/* Global Linker Markets */}
      <SectionCard title="Global Inflation-Linked Bond Markets" icon={Globe}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="text-muted-foreground border-b border-border/50">
                <th className="text-left py-2 pr-3">Market</th>
                <th className="text-left py-2 pr-3">Instrument</th>
                <th className="text-right py-2 pr-3">Size</th>
                <th className="text-right py-2 pr-3">Real Yield</th>
                <th className="text-right py-2 pr-3">Breakeven</th>
                <th className="text-left py-2 pr-3">Maturities</th>
                <th className="text-center py-2">Deflation Floor</th>
              </tr>
            </thead>
            <tbody>
              {GLOBAL_LINKER_MARKETS.map((m) => (
                <tr key={m.country} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 text-foreground font-medium">
                    {m.flag} {m.country}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{m.instrument}</td>
                  <td className="py-2 pr-3 text-right text-muted-foreground">{m.marketSize}</td>
                  <td className={cn("py-2 pr-3 text-right font-medium", m.realYield > 0 ? "text-emerald-400" : "text-red-400")}>
                    {m.realYield > 0 ? "+" : ""}{m.realYield.toFixed(2)}%
                  </td>
                  <td className="py-2 pr-3 text-right text-amber-400">{m.breakeven.toFixed(2)}%</td>
                  <td className="py-2 pr-3 text-muted-foreground">{m.maturityRange}</td>
                  <td className="py-2 text-center">
                    {m.deflationProtection ? (
                      <span className="text-emerald-400">✓</span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Real yields and breakevens as of simulated data. UK linkers index to RPI (not CPI).</p>
      </SectionCard>
    </div>
  );
}

// ── Tab 2: Real Yields & Breakeven ────────────────────────────────────────────

function RealYieldsTab() {
  const [nominalYield, setNominalYield] = useState(4.45);
  const [tipsYield, setTipsYield] = useState(2.18);
  const [inflationExp, setInflationExp] = useState(2.35);

  const breakeven = useMemo(() => breakevenInflation(nominalYield, tipsYield), [nominalYield, tipsYield]);
  const fisherReal = useMemo(() => fisherRealRate(nominalYield, inflationExp), [nominalYield, inflationExp]);
  const fiveY5Y = useMemo(() => {
    // Simplified: 5y5y forward ≈ 2 * 10y breakeven - 5y breakeven
    const ten = breakeven * 1.05;
    const five = breakeven * 0.92;
    return +(2 * ten - five).toFixed(2);
  }, [breakeven]);

  // Dual-line chart
  const W = 520;
  const H = 180;
  const PX = 44;
  const PY = 16;
  const allYields = [...YIELD_SERIES.map((d) => d.nominal), ...YIELD_SERIES.map((d) => d.real)];
  const minY = Math.min(...allYields) - 0.3;
  const maxY = Math.max(...allYields) + 0.3;

  const nominalPath = YIELD_SERIES.map((d, i) => {
    const x = scaleX(i, YIELD_SERIES.length, W - PX, PX);
    const y = scaleY(d.nominal, minY, maxY, H, PY);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  const realPath = YIELD_SERIES.map((d, i) => {
    const x = scaleX(i, YIELD_SERIES.length, W - PX, PX);
    const y = scaleY(d.real, minY, maxY, H, PY);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  // Real yield history chart
  const W2 = 520;
  const H2 = 140;
  const minH = Math.min(...REAL_YIELD_HISTORY.map((d) => d.real)) - 0.3;
  const maxH = Math.max(...REAL_YIELD_HISTORY.map((d) => d.real)) + 0.3;

  const histPath = REAL_YIELD_HISTORY.map((d, i) => {
    const x = scaleX(i, REAL_YIELD_HISTORY.length, W2 - PX, PX);
    const y = scaleY(d.real, minH, maxH, H2, PY);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  const zeroY = scaleY(0, minH, maxH, H2, PY);

  return (
    <div className="space-y-5">
      {/* Fisher / Breakeven Calculator */}
      <SectionCard title="Breakeven Inflation & Fisher Equation" icon={Calculator}>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">10Y Nominal Yield (%)</label>
            <input
              type="number"
              step="0.05"
              value={nominalYield}
              onChange={(e) => setNominalYield(Math.max(0, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">10Y TIPS Yield (%)</label>
            <input
              type="number"
              step="0.05"
              value={tipsYield}
              onChange={(e) => setTipsYield(+e.target.value)}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Expected Inflation (%)</label>
            <input
              type="number"
              step="0.05"
              value={inflationExp}
              onChange={(e) => setInflationExp(Math.max(0, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
          <StatChip label="Breakeven Inflation" value={`${breakeven.toFixed(2)}%`} color="amber" />
          <StatChip label="Fisher Real Rate" value={`${fisherReal.toFixed(2)}%`} color={fisherReal > 0 ? "green" : "red"} />
          <StatChip label="5y5y Fwd Inflation" value={`${fiveY5Y.toFixed(2)}%`} color="blue" />
          <StatChip
            label="TIPS Attractive If"
            value={`CPI > ${breakeven.toFixed(2)}%`}
            color={breakeven < 2.5 ? "green" : "amber"}
          />
        </div>

        <div className="p-3 rounded bg-foreground/[0.04] border border-border/50 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fisher Equation:</span>
            <span className="text-foreground font-mono">(1 + r_nominal) = (1 + r_real) × (1 + inflation)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Simplified Fisher:</span>
            <span className="text-foreground font-mono">r_real ≈ r_nominal − inflation</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current breakeven:</span>
            <span className="text-amber-400 font-mono">{nominalYield.toFixed(2)}% − {tipsYield.toFixed(2)}% = {breakeven.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TIPS vs Nominal decision:</span>
            <span className={cn("font-mono", breakeven < inflationExp ? "text-emerald-400" : "text-muted-foreground")}>
              {breakeven < inflationExp
                ? `TIPS preferred (expected ${inflationExp}% > breakeven ${breakeven.toFixed(2)}%)`
                : `Nominals preferred (expected ${inflationExp}% < breakeven ${breakeven.toFixed(2)}%)`}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Dual-line chart: Nominal vs Real */}
      <SectionCard title="Nominal vs Real Yield — 40 Periods" icon={Activity}>
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
          <defs>
            <linearGradient id="nomGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[minY, (minY + maxY) / 2, maxY].map((v, i) => {
            const y = scaleY(v, minY, maxY, H, PY);
            return (
              <g key={i}>
                <line x1={PX} y1={y} x2={W - 8} y2={y} stroke="#ffffff0d" strokeWidth="1" />
                <text x={PX - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
                  {v.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Breakeven fill between lines */}
          <path
            d={
              YIELD_SERIES.map((d, i) => {
                const x = scaleX(i, YIELD_SERIES.length, W - PX, PX);
                const y = scaleY(d.nominal, minY, maxY, H, PY);
                return `${i === 0 ? "M" : "L"}${x},${y}`;
              }).join(" ") +
              " " +
              YIELD_SERIES.slice()
                .reverse()
                .map((d, i) => {
                  const origI = YIELD_SERIES.length - 1 - i;
                  const x = scaleX(origI, YIELD_SERIES.length, W - PX, PX);
                  const y = scaleY(d.real, minY, maxY, H, PY);
                  return `L${x},${y}`;
                })
                .join(" ") +
              " Z"
            }
            fill="#f59e0b"
            fillOpacity="0.07"
          />

          {/* Nominal line */}
          <path d={nominalPath} fill="none" stroke="#f59e0b" strokeWidth="2" />

          {/* Real line */}
          <path d={realPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />

          {/* Legend */}
          <g transform={`translate(${PX}, ${H + 12})`}>
            <line x1="0" y1="0" x2="16" y2="0" stroke="#f59e0b" strokeWidth="2" />
            <text x="20" y="4" fontSize="9" fill="#f59e0b">Nominal</text>
            <line x1="72" y1="0" x2="88" y2="0" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" />
            <text x="92" y="4" fontSize="9" fill="#3b82f6">Real (TIPS)</text>
            <rect x="160" y="-4" width="14" height="8" fill="#f59e0b" fillOpacity="0.2" />
            <text x="178" y="4" fontSize="9" fill="#94a3b8">= Breakeven Spread</text>
          </g>
        </svg>
      </SectionCard>

      {/* Real yield history since 2000 */}
      <SectionCard title="Real Yield History (2000–2024)" icon={TrendingUp}>
        <svg viewBox={`0 0 ${W2} ${H2 + 20}`} className="w-full">
          {/* Zero line */}
          <line x1={PX} y1={zeroY} x2={W2 - 8} y2={zeroY} stroke="#ffffff30" strokeWidth="1" strokeDasharray="3,3" />
          <text x={PX - 4} y={zeroY + 4} textAnchor="end" fontSize="9" fill="#94a3b8">0%</text>

          {/* Grid */}
          {[minH + 0.5, maxH - 0.5].map((v, i) => {
            const y = scaleY(v, minH, maxH, H2, PY);
            return (
              <g key={i}>
                <line x1={PX} y1={y} x2={W2 - 8} y2={y} stroke="#ffffff08" strokeWidth="1" />
                <text x={PX - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
                  {v.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Area below zero (negative real yields) */}
          <path
            d={
              REAL_YIELD_HISTORY.map((d, i) => {
                const x = scaleX(i, REAL_YIELD_HISTORY.length, W2 - PX, PX);
                const y = scaleY(Math.min(d.real, 0), minH, maxH, H2, PY);
                return `${i === 0 ? "M" : "L"}${x},${y}`;
              }).join(" ") +
              ` L${scaleX(REAL_YIELD_HISTORY.length - 1, REAL_YIELD_HISTORY.length, W2 - PX, PX)},${zeroY} L${PX},${zeroY} Z`
            }
            fill="#ef4444"
            fillOpacity="0.15"
          />

          {/* Main line */}
          <path d={histPath} fill="none" stroke="#10b981" strokeWidth="2" />

          {/* Dots every 5 years */}
          {REAL_YIELD_HISTORY.filter((_, i) => i % 5 === 0).map((d, idx) => {
            const i = idx * 5;
            const x = scaleX(i, REAL_YIELD_HISTORY.length, W2 - PX, PX);
            const y = scaleY(d.real, minH, maxH, H2, PY);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3" fill="#10b981" stroke="#1e293b" strokeWidth="1.5" />
                <text x={x} y={H2 + 12} textAnchor="middle" fontSize="9" fill="#64748b">{d.year}</text>
              </g>
            );
          })}

          {/* Last point */}
          {(() => {
            const last = REAL_YIELD_HISTORY[REAL_YIELD_HISTORY.length - 1];
            const x = scaleX(REAL_YIELD_HISTORY.length - 1, REAL_YIELD_HISTORY.length, W2 - PX, PX);
            const y = scaleY(last.real, minH, maxH, H2, PY);
            return (
              <g>
                <circle cx={x} cy={y} r="3" fill="#10b981" stroke="#1e293b" strokeWidth="1.5" />
                <text x={x - 4} y={y - 8} textAnchor="end" fontSize="10" fill="#10b981" fontWeight="bold">
                  {last.real.toFixed(2)}%
                </text>
                <text x={x} y={H2 + 12} textAnchor="middle" fontSize="9" fill="#64748b">{last.year}</text>
              </g>
            );
          })()}
        </svg>
        <p className="text-xs text-muted-foreground mt-1">
          Shaded red region = negative real yields (2010–2022 era of ZIRP/QE). TIPS offer a real floor.
        </p>
      </SectionCard>
    </div>
  );
}

// ── Tab 3: Duration & Risk ─────────────────────────────────────────────────────

function DurationRiskTab() {
  const [maturity, setMaturity] = useState(10);
  const [coupon, setCoupon] = useState(1.5);
  const [realYield, setRealYield] = useState(2.2);
  const [nominalYield, setNominalYield] = useState(4.45);
  const [inflation, setInflation] = useState(2.35);

  const macDur = useMemo(() => {
    // Macaulay duration approximation for TIPS
    const r = realYield / 100 / 2;
    const c = coupon / 100 / 2;
    const n = maturity * 2;
    if (r === 0) return maturity;
    const num = (1 + r) / r - n / (Math.pow(1 + r, n) - 1);
    const den = 1 + c / r * (1 - 1 / Math.pow(1 + r, n));
    return +(num / den / 2).toFixed(2);
  }, [maturity, coupon, realYield]);

  const modDur = useMemo(() => +(macDur / (1 + realYield / 100 / 2)).toFixed(2), [macDur, realYield]);
  const realDur = useMemo(() => +realDuration(modDur, inflation).toFixed(2), [modDur, inflation]);

  const dv01 = useMemo(() => +((modDur * 1000 * (realYield / 100)) / 100 * 10).toFixed(2), [modDur, realYield]);
  const inflBeta = 0.92;
  const carry = useMemo(() => +(realYield + inflation - nominalYield + 0.2).toFixed(2), [realYield, inflation, nominalYield]);

  // Correlation chart: TIPS vs equities/nominals/commodities
  const correlationData = [
    { asset: "Equities (S&P)", corr: -0.12, color: "#3b82f6" },
    { asset: "Nominal 10Y", corr: 0.71, color: "#f59e0b" },
    { asset: "Commodities", corr: 0.43, color: "#10b981" },
    { asset: "Gold", corr: 0.38, color: "#fbbf24" },
    { asset: "REITs", corr: 0.22, color: "#8b5cf6" },
    { asset: "HY Credit", corr: -0.05, color: "#f43f5e" },
  ];

  const W = 380;
  const H = 160;
  const BAR_H = 18;
  const BAR_GAP = 6;
  const LEFT = 100;
  const RIGHT = 40;
  const centerX = LEFT + (W - LEFT - RIGHT) / 2;
  const scale = (v: number) => centerX + v * ((W - LEFT - RIGHT) / 2);

  return (
    <div className="space-y-5">
      {/* Duration calculator */}
      <SectionCard title="TIPS Duration Calculator" icon={Calculator}>
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-5">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Maturity (yrs)</label>
            <input
              type="number"
              value={maturity}
              onChange={(e) => setMaturity(Math.max(1, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Real Coupon (%)</label>
            <input
              type="number"
              step="0.1"
              value={coupon}
              onChange={(e) => setCoupon(Math.max(0, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Real Yield (%)</label>
            <input
              type="number"
              step="0.05"
              value={realYield}
              onChange={(e) => setRealYield(+e.target.value)}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nominal Yield (%)</label>
            <input
              type="number"
              step="0.05"
              value={nominalYield}
              onChange={(e) => setNominalYield(+e.target.value)}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Exp. Inflation (%)</label>
            <input
              type="number"
              step="0.05"
              value={inflation}
              onChange={(e) => setInflation(Math.max(0, +e.target.value))}
              className="w-full rounded bg-foreground/5 border border-border text-foreground text-sm px-2 py-1.5 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
          <StatChip label="Macaulay Duration" value={`${macDur}y`} color="blue" />
          <StatChip label="Modified Duration" value={modDur.toFixed(2)} color="blue" />
          <StatChip label="Real Duration" value={`${realDur}y`} color="green" />
          <StatChip label="DV01 (per $1k)" value={`$${dv01.toFixed(2)}`} color="amber" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatChip label="Inflation Beta" value={inflBeta.toFixed(2)} color="green" />
          <StatChip label="Carry vs Nominal" value={`${carry > 0 ? "+" : ""}${carry.toFixed(2)}%`} color={carry > 0 ? "green" : "red"} />
          <StatChip label="Real Dur < Mod Dur" value={`${modDur - realDur > 0 ? "−" : "+"}${Math.abs(modDur - realDur).toFixed(2)}y`} color="default" />
        </div>

        <div className="mt-3 p-3 rounded bg-foreground/[0.04] border border-border/50 text-xs text-muted-foreground space-y-1">
          <p><span className="text-primary">Modified Duration</span>: sensitivity to changes in real yields. A {modDur.toFixed(1)}y ModDur means ~{modDur.toFixed(1)}% price change per 100bps real yield shift.</p>
          <p><span className="text-primary">Real Duration</span>: further adjusted for inflation expectations — TIPS have lower interest rate risk in real terms than ModDur implies.</p>
          <p><span className="text-primary">Key insight</span>: TIPS carry inflation risk on the accreted principal, but this is the risk you <em>want</em> when hedging inflation.</p>
        </div>
      </SectionCard>

      {/* Inflation Beta Table */}
      <SectionCard title="Inflation Beta by Asset Class" icon={BarChart3}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="text-muted-foreground border-b border-border/50">
                <th className="text-left py-2 pr-3">Asset</th>
                <th className="text-right py-2 pr-3">Inflation Beta</th>
                <th className="text-right py-2 pr-3">Correlation</th>
                <th className="text-left py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {INFLATION_BETA_TABLE.map((row) => (
                <tr key={row.asset} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 text-foreground font-medium">{row.asset}</td>
                  <td className={cn("py-2 pr-3 text-right font-semibold font-mono", row.beta > 0.5 ? "text-emerald-400" : row.beta < 0 ? "text-red-400" : "text-amber-400")}>
                    {row.beta > 0 ? "+" : ""}{row.beta.toFixed(2)}
                  </td>
                  <td className={cn("py-2 pr-3 text-right font-mono", row.correlation > 0.4 ? "text-emerald-400" : row.correlation < 0 ? "text-red-400" : "text-muted-foreground")}>
                    {row.correlation > 0 ? "+" : ""}{row.correlation.toFixed(2)}
                  </td>
                  <td className="py-2 text-muted-foreground">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Correlation chart */}
      <SectionCard title="TIPS Correlation to Other Asset Classes" icon={Activity}>
        <svg viewBox={`0 0 ${W} ${correlationData.length * (BAR_H + BAR_GAP) + 24}`} className="w-full max-w-md">
          {/* Center line */}
          <line x1={centerX} y1="0" x2={centerX} y2={correlationData.length * (BAR_H + BAR_GAP) + 8} stroke="#ffffff20" strokeWidth="1" strokeDasharray="3,3" />
          <text x={centerX} y={correlationData.length * (BAR_H + BAR_GAP) + 20} textAnchor="middle" fontSize="9" fill="#64748b">0</text>
          <text x={LEFT} y={correlationData.length * (BAR_H + BAR_GAP) + 20} textAnchor="middle" fontSize="9" fill="#64748b">−1</text>
          <text x={W - RIGHT} y={correlationData.length * (BAR_H + BAR_GAP) + 20} textAnchor="middle" fontSize="9" fill="#64748b">+1</text>

          {correlationData.map((d, i) => {
            const y = i * (BAR_H + BAR_GAP) + 4;
            const x1 = d.corr >= 0 ? centerX : scale(d.corr);
            const barW = Math.abs(scale(d.corr) - centerX);
            return (
              <g key={d.asset}>
                <text x={LEFT - 4} y={y + BAR_H / 2 + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{d.asset}</text>
                <rect x={x1} y={y} width={barW} height={BAR_H} rx="2" fill={d.color} fillOpacity="0.7" />
                <text
                  x={d.corr >= 0 ? x1 + barW + 3 : x1 - 3}
                  y={y + BAR_H / 2 + 4}
                  textAnchor={d.corr >= 0 ? "start" : "end"}
                  fontSize="9"
                  fill={d.color}
                  fontWeight="bold"
                >
                  {d.corr > 0 ? "+" : ""}{d.corr.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="text-xs text-muted-foreground mt-2">
          TIPS show low/negative correlation to equities and slightly positive to nominal bonds — a useful diversifier.
        </p>
      </SectionCard>
    </div>
  );
}

// ── Tab 4: Inflation Hedging ───────────────────────────────────────────────────

function InflationHedgingTab() {
  const [selectedScenario, setSelectedScenario] = useState(1);

  const heatColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500/25 text-emerald-300 border-emerald-500/30";
    if (score >= 6) return "bg-emerald-500/12 text-emerald-400/80 border-emerald-500/15";
    if (score >= 4) return "bg-amber-500/12 text-amber-400 border-amber-500/20";
    if (score >= 2) return "bg-red-500/5 text-red-400 border-red-500/15";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  const scenarioDesc = [
    "Low inflation (<2%): Central bank on-target. TIPS underperform vs nominals on carry. Equities thrive.",
    "Moderate inflation (2–3%): Ideal TIPS environment. Breakeven realized. Real yields stable.",
    "High inflation (3–6%): TIPS principal accretes rapidly. Commodities surge. Equities struggle.",
    "Stagflation: Growth falls, inflation persists. Gold and TIPS best hedges. Credit and equities hit hard.",
  ];

  const allocationRecs = [
    { scenario: "Low (<2%)", tips: 5, commodities: 5, reits: 15, equities: 60, nominals: 15, gold: 0 },
    { scenario: "Moderate (2–3%)", tips: 15, commodities: 8, reits: 12, equities: 50, nominals: 10, gold: 5 },
    { scenario: "High (3–6%)", tips: 30, commodities: 20, reits: 10, equities: 25, nominals: 5, gold: 10 },
    { scenario: "Stagflation", tips: 25, commodities: 15, reits: 5, equities: 15, nominals: 0, gold: 20 },
  ];

  const currentRec = allocationRecs[selectedScenario];

  // Bar chart data: TIPS vs commodities vs REITs vs equities expected return
  const returnData = [
    { label: "TIPS", low: 3.5, mod: 5.2, high: 7.8, stag: 5.5, color: "#3b82f6" },
    { label: "Commodities", low: -1.2, mod: 4.0, high: 18.5, stag: 8.0, color: "#f59e0b" },
    { label: "REITs", low: 6.0, mod: 7.5, high: 4.5, stag: -2.0, color: "#10b981" },
    { label: "Equities", low: 8.5, mod: 9.0, high: 2.5, stag: -5.0, color: "#8b5cf6" },
  ];

  const scenarioKeys: ("low" | "mod" | "high" | "stag")[] = ["low", "mod", "high", "stag"];
  const activeKey = scenarioKeys[selectedScenario];

  const W = 420;
  const H = 160;
  const PX = 50;
  const PY = 16;
  const barGroup = returnData.length;
  const groupW = (W - PX * 2) / barGroup;
  const barW = groupW * 0.55;
  const allVals = returnData.map((d) => d[activeKey]);
  const minV = Math.min(...allVals, -6) - 1;
  const maxV = Math.max(...allVals, 10) + 2;
  const zeroYBar = scaleY(0, minV, maxV, H, PY);

  // Regime indicator
  const inflationRegimes = [
    { label: "Disinflation", range: "<1%", active: false, color: "text-primary bg-primary/10 border-border" },
    { label: "On Target", range: "1–2%", active: false, color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { label: "Mild Overshoot", range: "2–3%", active: true, color: "text-emerald-400 bg-emerald-500/15 border-emerald-400/30" },
    { label: "Elevated", range: "3–5%", active: false, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { label: "High Inflation", range: "5–8%", active: false, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    { label: "Hyperinflation", range: ">8%", active: false, color: "text-red-400 bg-red-500/5 border-red-500/20" },
  ];

  return (
    <div className="space-y-5">
      {/* Regime indicator */}
      <SectionCard title="Inflation Regime Indicator" icon={Flame}>
        <div className="flex flex-wrap gap-2 mb-3">
          {inflationRegimes.map((r) => (
            <div
              key={r.label}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-lg border text-xs text-muted-foreground transition-all",
                r.color,
                r.active ? "ring-1 ring-current" : "opacity-60"
              )}
            >
              <span className="font-semibold">{r.label}</span>
              <span className="text-[11px] opacity-70 mt-0.5">{r.range}</span>
              {r.active && <span className="text-[11px] mt-1 font-bold uppercase tracking-wide">CURRENT</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Current regime: Mild overshoot (2–3%). Breakeven inflation at 2.35% suggests market expects modest price pressures to persist. TIPS modestly attractive vs nominals at current levels.
        </p>
      </SectionCard>

      {/* Hedging effectiveness heat table */}
      <SectionCard title="Hedging Effectiveness by Inflation Scenario (0–10)" icon={ShieldCheck}>
        <div className="flex gap-2 mb-3 flex-wrap">
          {HEDGING_SCENARIOS.map((sc, i) => (
            <button
              key={sc}
              onClick={() => setSelectedScenario(i)}
              className={cn(
                "text-xs text-muted-foreground px-3 py-1.5 rounded border transition-colors",
                selectedScenario === i
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-foreground/5 border-border text-muted-foreground hover:bg-muted/30"
              )}
            >
              {sc}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 pr-3 text-muted-foreground">Scenario</th>
                {HEDGING_ASSETS.map((a) => (
                  <th key={a} className="text-center py-2 px-2 text-muted-foreground">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEDGING_SCENARIOS.map((sc, si) => (
                <tr
                  key={sc}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    si === selectedScenario ? "bg-primary/5" : "hover:bg-muted/30"
                  )}
                >
                  <td className={cn("py-2 pr-3 font-medium", si === selectedScenario ? "text-primary" : "text-muted-foreground")}>
                    {sc}
                  </td>
                  {HEDGING_MATRIX[si].map((score, ai) => (
                    <td key={ai} className="py-2 px-2 text-center">
                      <span className={cn("inline-block w-7 h-7 rounded text-xs text-muted-foreground font-bold flex items-center justify-center border", heatColor(score))}>
                        {score}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedScenario}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-muted-foreground mt-2"
          >
            {scenarioDesc[selectedScenario]}
          </motion.p>
        </AnimatePresence>
      </SectionCard>

      {/* Comparison bar chart */}
      <SectionCard title="Expected Returns by Asset vs Inflation Scenario" icon={BarChart3}>
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["Low", "Moderate", "High", "Stagflation"] as const).map((sc, i) => (
            <button
              key={sc}
              onClick={() => setSelectedScenario(i)}
              className={cn(
                "text-xs text-muted-foreground px-3 py-1.5 rounded border transition-colors",
                selectedScenario === i
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-foreground/5 border-border text-muted-foreground hover:bg-muted/30"
              )}
            >
              {sc}
            </button>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H + 40}`} className="w-full">
          {/* Grid */}
          {[-5, 0, 5, 10, 15, 20].map((v, i) => {
            if (v < minV || v > maxV) return null;
            const y = scaleY(v, minV, maxV, H, PY);
            return (
              <g key={i}>
                <line x1={PX} y1={y} x2={W - 8} y2={y} stroke={v === 0 ? "#ffffff20" : "#ffffff08"} strokeWidth={v === 0 ? 1.5 : 1} strokeDasharray={v === 0 ? "3,3" : "0"} />
                <text x={PX - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">{v}%</text>
              </g>
            );
          })}

          {returnData.map((d, i) => {
            const val = d[activeKey];
            const cx = PX + i * groupW + groupW / 2;
            const x = cx - barW / 2;
            const yTop = scaleY(Math.max(val, 0), minV, maxV, H, PY);
            const yBot = scaleY(Math.min(val, 0), minV, maxV, H, PY);
            const bH = Math.abs(yTop - yBot);
            const isNeg = val < 0;

            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={isNeg ? zeroYBar : yTop}
                  width={barW}
                  height={bH}
                  rx="3"
                  fill={d.color}
                  fillOpacity={isNeg ? 0.4 : 0.75}
                />
                <text
                  x={cx}
                  y={isNeg ? zeroYBar + bH + 12 : yTop - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill={d.color}
                  fontWeight="bold"
                >
                  {val > 0 ? "+" : ""}{val.toFixed(1)}%
                </text>
                <text x={cx} y={H + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
              </g>
            );
          })}
        </svg>
        <p className="text-xs text-muted-foreground mt-1">Simulated annualized expected returns under each inflation scenario. TIPS are the most consistent across regimes.</p>
      </SectionCard>

      {/* Portfolio allocation recommendations */}
      <SectionCard title="Portfolio Allocation Recommendations" icon={ChevronRight}>
        <div className="flex gap-2 mb-4 flex-wrap">
          {allocationRecs.map((r, i) => (
            <button
              key={r.scenario}
              onClick={() => setSelectedScenario(i)}
              className={cn(
                "text-xs text-muted-foreground px-3 py-1.5 rounded border transition-colors",
                selectedScenario === i
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-foreground/5 border-border text-muted-foreground hover:bg-muted/30"
              )}
            >
              {r.scenario}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedScenario}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-3 gap-2 sm:grid-cols-6"
          >
            {[
              { key: "tips", label: "TIPS", color: "#3b82f6" },
              { key: "commodities", label: "Commodities", color: "#f59e0b" },
              { key: "reits", label: "REITs", color: "#10b981" },
              { key: "equities", label: "Equities", color: "#8b5cf6" },
              { key: "nominals", label: "Nominals", color: "#64748b" },
              { key: "gold", label: "Gold", color: "#fbbf24" },
            ].map(({ key, label, color }) => {
              const val = currentRec[key as keyof typeof currentRec] as number;
              return (
                <div key={key} className="rounded-lg border border-border/50 bg-foreground/[0.03] p-2 text-center">
                  <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
                  <div className="text-lg font-medium" style={{ color }}>{val}%</div>
                  <div className="w-full bg-foreground/5 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full" style={{ width: `${val}%`, backgroundColor: color, opacity: 0.8 }} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground mt-3">
          Allocations are illustrative. In stagflation, avoid long-duration nominals; overweight real assets, gold, and short-duration TIPS. In low inflation, trim TIPS and overweight equities.
        </p>
      </SectionCard>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InflationLinkedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/15 border border-border">
              <Flame className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-foreground">Inflation-Linked Bonds</h1>
              <p className="text-sm text-muted-foreground">TIPS mechanics, real yields, breakeven inflation &amp; hedging strategies</p>
            </div>
          </div>

          {/* Key stats row — Hero */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 mt-4 rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
            <StatChip label="10Y TIPS Yield" value="+2.18%" color="green" />
            <StatChip label="10Y Breakeven" value="2.35%" color="amber" />
            <StatChip label="5y5y Fwd Inflation" value="2.48%" color="amber" />
            <StatChip label="US TIPS Market" value="$1.9T" color="blue" />
            <StatChip label="Inflation Beta" value="0.92" color="green" />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="mechanics" className="mt-8">
          <TabsList className="mb-4 bg-foreground/5 border border-border p-1 rounded-lg flex-wrap h-auto gap-1">
            <TabsTrigger value="mechanics" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground rounded">
              <Calculator className="w-3 h-3 mr-1.5" />
              TIPS Mechanics
            </TabsTrigger>
            <TabsTrigger value="yields" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground rounded">
              <Activity className="w-3 h-3 mr-1.5" />
              Real Yields &amp; Breakeven
            </TabsTrigger>
            <TabsTrigger value="duration" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground rounded">
              <BarChart3 className="w-3 h-3 mr-1.5" />
              Duration &amp; Risk
            </TabsTrigger>
            <TabsTrigger value="hedging" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground rounded">
              <ShieldCheck className="w-3 h-3 mr-1.5" />
              Inflation Hedging
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="mechanics" className="data-[state=inactive]:hidden">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <TipsMechanicsTab />
              </motion.div>
            </TabsContent>
            <TabsContent value="yields" className="data-[state=inactive]:hidden">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <RealYieldsTab />
              </motion.div>
            </TabsContent>
            <TabsContent value="duration" className="data-[state=inactive]:hidden">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <DurationRiskTab />
              </motion.div>
            </TabsContent>
            <TabsContent value="hedging" className="data-[state=inactive]:hidden">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <InflationHedgingTab />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Footer disclaimer */}
        <div className="mt-8 p-3 rounded-lg border border-border/50 bg-foreground/[0.02] flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            All yield data, breakevens, and returns are simulated for educational purposes. TIPS returns depend on actual realized CPI vs breakeven at purchase. Real past performance varies; consult a financial advisor before investing in inflation-linked securities.
          </p>
        </div>
      </div>
    </div>
  );
}
