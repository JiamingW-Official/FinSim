"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Shield,
  BarChart3,
  Layers,
  Thermometer,
  Calculator,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 23;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 23;
}

// ── Math helpers ─────────────────────────────────────────────────────────────

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2315419 * Math.abs(x));
  const d = 0.3989422820 * Math.exp(-0.5 * x * x);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return x >= 0 ? 1 - p : p;
}

function discountFactor(rate: number, years: number): number {
  return Math.exp(-rate * years);
}

// IRS helpers
function swapNPV(
  notional: number,
  fixedRate: number,
  floatingRate: number,
  tenor: number,
  payFixed: boolean,
): number {
  // simplified: PV of fixed leg minus PV of floating leg
  const periods = tenor;
  let pvFixed = 0;
  let pvFloat = 0;
  for (let t = 1; t <= periods; t++) {
    const r_disc = floatingRate / 100;
    const df = discountFactor(r_disc, t);
    pvFixed += (notional * (fixedRate / 100)) * df;
    pvFloat += (notional * (floatingRate / 100)) * df;
  }
  pvFixed += notional * discountFactor(floatingRate / 100, tenor);
  pvFloat += notional * discountFactor(floatingRate / 100, tenor);
  const netPV = pvFixed - pvFloat;
  return payFixed ? -netPV : netPV;
}

function computeDV01(notional: number, tenor: number, rate: number): number {
  // DV01 = -dPV/dr * 0.0001
  let pv = 0;
  const bpUp = (rate + 0.01) / 100;
  const bpDn = (rate - 0.01) / 100;
  for (let t = 1; t <= tenor; t++) {
    pv += (notional * (rate / 100)) * discountFactor(rate / 100, t);
  }
  pv += notional * discountFactor(rate / 100, tenor);
  let pvUp = 0;
  for (let t = 1; t <= tenor; t++) {
    pvUp += (notional * (rate / 100)) * discountFactor(bpUp, t);
  }
  pvUp += notional * discountFactor(bpUp, tenor);
  let pvDn = 0;
  for (let t = 1; t <= tenor; t++) {
    pvDn += (notional * (rate / 100)) * discountFactor(bpDn, t);
  }
  pvDn += notional * discountFactor(bpDn, tenor);
  return Math.abs((pvUp - pvDn) / 2);
}

function parRate(floatingRate: number, tenor: number): number {
  // fixed rate where swap NPV = 0
  const r = floatingRate / 100;
  let annuityFactor = 0;
  for (let t = 1; t <= tenor; t++) {
    annuityFactor += discountFactor(r, t);
  }
  const parR = (1 - discountFactor(r, tenor)) / annuityFactor;
  return parR * 100;
}

// Black-76 swaption
function black76Swaption(
  F: number,   // forward swap rate
  K: number,   // strike
  T: number,   // expiry (years)
  vol: number, // annualized vol
  annuity: number,
  isPayer: boolean,
): number {
  if (T <= 0 || vol <= 0) return Math.max(0, isPayer ? (F - K) * annuity : (K - F) * annuity);
  const d1 = (Math.log(F / K) + 0.5 * vol * vol * T) / (vol * Math.sqrt(T));
  const d2 = d1 - vol * Math.sqrt(T);
  if (isPayer) {
    return annuity * (F * normalCDF(d1) - K * normalCDF(d2));
  } else {
    return annuity * (K * normalCDF(-d2) - F * normalCDF(-d1));
  }
}

// ── Reusable UI primitives ───────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-1">
      <span className="text-[11px] text-white/40 uppercase tracking-wide">{label}</span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          positive === true && "text-emerald-400",
          positive === false && "text-red-400",
          positive === undefined && "text-white",
        )}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-white/40">{sub}</span>}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg bg-sky-500/10 border border-sky-500/20 p-3 text-sm text-sky-300">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-white/70 mb-3">
      {children}
    </h3>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/50">{label}</label>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 h-9 gap-1">
        {prefix && <span className="text-white/40 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="bg-transparent flex-1 text-sm text-white outline-none w-full tabular-nums"
        />
        {suffix && <span className="text-white/40 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/50">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-sm text-white outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Tab 1: IRS Swap Pricer ──────────────────────────────────────────────────

function IRSPricer() {
  const [notional, setNotional] = useState(10_000_000);
  const [fixedRate, setFixedRate] = useState(4.5);
  const [floatingRate, setFloatingRate] = useState(5.2);
  const [tenor, setTenor] = useState(5);
  const [floatIndex, setFloatIndex] = useState("SOFR");
  const [payFixed, setPayFixed] = useState(true);
  const [marketShift, setMarketShift] = useState(0);

  const results = useMemo(() => {
    const mktFloat = floatingRate + marketShift / 100;
    const npv = swapNPV(notional, fixedRate, mktFloat, tenor, payFixed);
    const dv01 = computeDV01(notional, tenor, fixedRate);
    const par = parRate(mktFloat, tenor);

    // Duration of swap: duration_fixed - duration_float
    // Float leg resets: near-zero duration (approx 0.5 periods)
    let fixedLegDur = 0;
    let fixedLegPV = 0;
    const r = mktFloat / 100;
    for (let t = 1; t <= tenor; t++) {
      const cf = t === tenor ? notional * (fixedRate / 100) + notional : notional * (fixedRate / 100);
      const pv = cf * discountFactor(r, t);
      fixedLegDur += t * pv;
      fixedLegPV += pv;
    }
    const macFixedDur = fixedLegPV > 0 ? fixedLegDur / fixedLegPV : 0;
    const modFixedDur = macFixedDur / (1 + r);
    const floatDur = 0.5; // floating leg resets to par each period, duration ≈ next reset
    const swapDur = payFixed ? floatDur - modFixedDur : modFixedDur - floatDur;

    // cash flows for 10 periods (capped)
    const cfPeriods = Math.min(tenor, 10);
    const cashFlows = Array.from({ length: cfPeriods }, (_, i) => {
      const t = i + 1;
      const df = discountFactor(r, t);
      const fixed = notional * (fixedRate / 100) * df;
      const floating = notional * (mktFloat / 100) * df;
      return { t, fixed, floating, net: floating - fixed };
    });

    return { npv, dv01, par, swapDur, modFixedDur, cashFlows, mktFloat };
  }, [notional, fixedRate, floatingRate, tenor, payFixed, marketShift]);

  const maxCF = useMemo(() => {
    return Math.max(...results.cashFlows.map((c) => Math.max(c.fixed, c.floating)));
  }, [results.cashFlows]);

  const W = 520;
  const H = 160;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const barArea = W - pad.l - pad.r;
  const barH = H - pad.t - pad.b;
  const groupW = barArea / results.cashFlows.length;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <NumberInput
          label="Notional ($)"
          value={notional}
          onChange={setNotional}
          min={100000}
          step={1000000}
          prefix="$"
        />
        <NumberInput
          label="Fixed Rate (%)"
          value={fixedRate}
          onChange={setFixedRate}
          min={0.01}
          max={20}
          step={0.05}
          suffix="%"
        />
        <NumberInput
          label="Floating Rate (%)"
          value={floatingRate}
          onChange={setFloatingRate}
          min={0.01}
          max={20}
          step={0.05}
          suffix="%"
        />
        <NumberInput
          label="Tenor (years)"
          value={tenor}
          onChange={(v) => setTenor(Math.max(1, Math.min(30, v)))}
          min={1}
          max={30}
        />
        <SelectInput
          label="Float Index"
          value={floatIndex}
          onChange={setFloatIndex}
          options={[
            { value: "SOFR", label: "SOFR" },
            { value: "LIBOR3M", label: "LIBOR 3M (legacy)" },
            { value: "EURIBOR", label: "EURIBOR" },
          ]}
        />
        <SelectInput
          label="Position"
          value={payFixed ? "pay" : "receive"}
          onChange={(v) => setPayFixed(v === "pay")}
          options={[
            { value: "pay", label: "Pay Fixed" },
            { value: "receive", label: "Receive Fixed" },
          ]}
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="NPV"
          value={`$${results.npv >= 0 ? "+" : ""}${(results.npv / 1000).toFixed(1)}K`}
          sub="Net present value"
          positive={results.npv >= 0}
        />
        <MetricCard
          label="DV01"
          value={`$${(results.dv01).toFixed(0)}`}
          sub="$ value of 1 bp"
        />
        <MetricCard
          label="Par Rate"
          value={`${results.par.toFixed(3)}%`}
          sub="NPV-neutral fixed rate"
        />
        <MetricCard
          label="Swap Duration"
          value={`${results.swapDur.toFixed(2)} yrs`}
          sub={`Fixed leg mod dur: ${results.modFixedDur.toFixed(2)}`}
        />
      </div>

      {/* Market shift / MtM */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>Mark-to-Market Sensitivity</SectionTitle>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/50 w-32">Rate shift (bps)</span>
          <input
            type="range"
            min={-200}
            max={200}
            step={10}
            value={marketShift}
            onChange={(e) => setMarketShift(Number(e.target.value))}
            className="flex-1 accent-sky-500"
          />
          <span
            className={cn(
              "text-sm font-mono w-16 text-right",
              marketShift > 0 ? "text-emerald-400" : marketShift < 0 ? "text-red-400" : "text-white/60",
            )}
          >
            {marketShift > 0 ? "+" : ""}
            {marketShift} bps
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Floating Rate (after shift)"
            value={`${results.mktFloat.toFixed(3)}%`}
          />
          <MetricCard
            label="P&amp;L from Rate Move"
            value={`$${((results.dv01 * marketShift) >= 0 ? "+" : "")}${((results.dv01 * marketShift) / 1000).toFixed(1)}K`}
            positive={(results.dv01 * marketShift) >= 0 ? (payFixed ? marketShift < 0 : marketShift > 0) : undefined}
          />
        </div>
        <InfoBox>
          {payFixed
            ? `Pay-fixed: you pay ${fixedRate}% and receive ${results.mktFloat.toFixed(2)}% ${floatIndex}. Rising rates benefit you — floating receipts increase.`
            : `Receive-fixed: you receive ${fixedRate}% and pay ${results.mktFloat.toFixed(2)}% ${floatIndex}. Falling rates benefit you — floating payments decrease.`}
        </InfoBox>
      </div>

      {/* Cash Flow Schedule SVG */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>Cash Flow Schedule (PV, first {results.cashFlows.length} periods)</SectionTitle>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H + 20}`}
          className="overflow-visible"
        >
          {/* Zero line */}
          <line
            x1={pad.l}
            y1={pad.t + barH / 2}
            x2={W - pad.r}
            y2={pad.t + barH / 2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
          {results.cashFlows.map((cf, i) => {
            const cx = pad.l + i * groupW + groupW / 2;
            const scale = (barH / 2) / (maxCF || 1);
            const midY = pad.t + barH / 2;
            const fixH = cf.fixed * scale;
            const floatH = cf.floating * scale;
            return (
              <g key={i}>
                {/* Fixed bar — blue, downward */}
                <motion.rect
                  initial={{ height: 0 }}
                  animate={{ height: fixH }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  x={cx - groupW * 0.35}
                  y={midY}
                  width={groupW * 0.32}
                  height={fixH}
                  fill="rgba(59,130,246,0.7)"
                  rx={2}
                />
                {/* Floating bar — green, upward */}
                <motion.rect
                  initial={{ height: 0 }}
                  animate={{ height: floatH }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  x={cx + groupW * 0.03}
                  y={midY - floatH}
                  width={groupW * 0.32}
                  height={floatH}
                  fill="rgba(52,211,153,0.7)"
                  rx={2}
                />
                {/* Period label */}
                <text
                  x={cx}
                  y={H - 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize={9}
                >
                  Y{cf.t}
                </text>
              </g>
            );
          })}
          {/* Legend */}
          <rect x={pad.l} y={2} width={10} height={8} fill="rgba(59,130,246,0.7)" rx={1} />
          <text x={pad.l + 13} y={9} fill="rgba(255,255,255,0.5)" fontSize={9}>
            Fixed (down = you pay)
          </text>
          <rect x={pad.l + 130} y={2} width={10} height={8} fill="rgba(52,211,153,0.7)" rx={1} />
          <text x={pad.l + 143} y={9} fill="rgba(255,255,255,0.5)" fontSize={9}>
            Floating (up = you receive)
          </text>
        </svg>
      </div>
    </div>
  );
}

// ── Tab 2: Swap Curve Builder ───────────────────────────────────────────────

const SOFR_TENORS = [
  { label: "1M", years: 1 / 12, rate: 5.31 },
  { label: "3M", years: 0.25, rate: 5.29 },
  { label: "6M", years: 0.5, rate: 5.22 },
  { label: "1Y", years: 1, rate: 5.05 },
  { label: "2Y", years: 2, rate: 4.68 },
  { label: "5Y", years: 5, rate: 4.41 },
  { label: "10Y", years: 10, rate: 4.35 },
  { label: "30Y", years: 30, rate: 4.42 },
];

function SwapCurveBuilder() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const discountFactors = useMemo(() => {
    return SOFR_TENORS.map((t) => ({
      ...t,
      df: discountFactor(t.rate / 100, t.years),
    }));
  }, []);

  const forwardRates = useMemo(() => {
    return discountFactors.map((t, i) => {
      if (i === 0)
        return { ...t, fwd: t.rate, fwdLabel: `0→${t.label}` };
      const prev = discountFactors[i - 1];
      // f(T1,T2) = (ln(df(T1)) - ln(df(T2))) / (T2 - T1)
      const fwd =
        ((Math.log(prev.df) - Math.log(t.df)) / (t.years - prev.years)) * 100;
      return { ...t, fwd, fwdLabel: `${prev.label}→${t.label}` };
    });
  }, [discountFactors]);

  const W = 560;
  const H = 180;
  const pad = { l: 40, r: 16, t: 16, b: 30 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const minRate = 4.1;
  const maxRate = 5.5;

  const points = SOFR_TENORS.map((t, i) => {
    const x = pad.l + (i / (SOFR_TENORS.length - 1)) * chartW;
    const y =
      pad.t + chartH - ((t.rate - minRate) / (maxRate - minRate)) * chartH;
    return { x, y, ...t };
  });

  const fwdPoints = forwardRates.map((t, i) => {
    const x = pad.l + (i / (forwardRates.length - 1)) * chartW;
    const y =
      pad.t + chartH - ((t.fwd - minRate) / (maxRate - minRate)) * chartH;
    return { x, y, ...t };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const fwdPathD = fwdPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const basisSpreads = [
    { label: "3M SOFR vs 1M SOFR", spread: 2 },
    { label: "LIBOR-OIS (hist.)", spread: 12 },
    { label: "USD/EUR Cross-Ccy Basis", spread: -18 },
    { label: "3M EURIBOR vs SOFR", spread: -8 },
  ];

  return (
    <div className="space-y-6">
      {/* Curve SVG */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>SOFR OIS Curve + Implied Forwards</SectionTitle>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          {/* Grid lines */}
          {[4.2, 4.5, 4.8, 5.1, 5.4].map((r) => {
            const y =
              pad.t + chartH - ((r - minRate) / (maxRate - minRate)) * chartH;
            return (
              <g key={r}>
                <line
                  x1={pad.l}
                  y1={y}
                  x2={W - pad.r}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={1}
                />
                <text x={pad.l - 4} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={8}>
                  {r.toFixed(1)}
                </text>
              </g>
            );
          })}
          {/* Forward path */}
          <path
            d={fwdPathD}
            fill="none"
            stroke="rgba(52,211,153,0.5)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {/* SOFR curve path */}
          <path d={pathD} fill="none" stroke="rgba(59,130,246,0.9)" strokeWidth={2} />
          {/* Points */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={selectedIdx === i ? 7 : 5}
                fill={selectedIdx === i ? "rgb(59,130,246)" : "rgba(59,130,246,0.6)"}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1}
              />
              <text
                x={p.x}
                y={H - 4}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize={9}
              >
                {p.label}
              </text>
            </g>
          ))}
          {/* Legend */}
          <line x1={pad.l} y1={10} x2={pad.l + 20} y2={10} stroke="rgba(59,130,246,0.9)" strokeWidth={2} />
          <text x={pad.l + 24} y={13} fill="rgba(255,255,255,0.5)" fontSize={9}>SOFR OIS</text>
          <line x1={pad.l + 90} y1={10} x2={pad.l + 110} y2={10} stroke="rgba(52,211,153,0.5)" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={pad.l + 114} y={13} fill="rgba(255,255,255,0.5)" fontSize={9}>Implied Forward</text>
        </svg>

        {/* Detail on click */}
        <AnimatePresence>
          {selectedIdx !== null && (
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <MetricCard
                label="Tenor"
                value={SOFR_TENORS[selectedIdx].label}
                sub={`${SOFR_TENORS[selectedIdx].years} years`}
              />
              <MetricCard
                label="OIS Rate"
                value={`${SOFR_TENORS[selectedIdx].rate.toFixed(2)}%`}
              />
              <MetricCard
                label="Discount Factor"
                value={discountFactors[selectedIdx].df.toFixed(6)}
                sub="e^(-r×T)"
              />
              <MetricCard
                label="Implied Fwd"
                value={`${forwardRates[selectedIdx].fwd.toFixed(2)}%`}
                sub={forwardRates[selectedIdx].fwdLabel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bootstrap table */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3 overflow-x-auto">
        <SectionTitle>Bootstrapped Discount Factors</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase">
              <th className="text-left py-1 pr-4">Tenor</th>
              <th className="text-right py-1 pr-4">OIS Quote</th>
              <th className="text-right py-1 pr-4">Disc. Factor</th>
              <th className="text-right py-1">Fwd Rate</th>
            </tr>
          </thead>
          <tbody>
            {forwardRates.map((r, i) => (
              <tr
                key={i}
                className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
              >
                <td className="py-1.5 pr-4 text-white/80 font-medium">{r.label}</td>
                <td className="py-1.5 pr-4 text-right tabular-nums text-sky-300">
                  {r.rate.toFixed(2)}%
                </td>
                <td className="py-1.5 pr-4 text-right tabular-nums text-white/60">
                  {r.df.toFixed(6)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-emerald-300">
                  {r.fwd.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Basis spreads */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>Basis Swap Spreads (bps)</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {basisSpreads.map((b, i) => (
            <MetricCard
              key={i}
              label={b.label}
              value={`${b.spread > 0 ? "+" : ""}${b.spread} bps`}
              positive={b.spread > 0}
            />
          ))}
        </div>
        <InfoBox>
          The 3M vs 1M SOFR basis reflects term premium. The LIBOR-OIS spread
          historically spiked during crises (e.g. 364 bps in Oct 2008), signaling
          bank credit stress. Cross-currency basis shows the premium to swap USD
          into EUR funding.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 3: CDS Pricer ────────────────────────────────────────────────────────

function CDSPricer() {
  const [spread, setSpread] = useState(150);
  const [recovery, setRecovery] = useState(40);
  const [maturity, setMaturity] = useState(5);
  const [entity, setEntity] = useState("IG Corp");
  const [spreadShift, setSpreadShift] = useState(0);

  const results = useMemo(() => {
    const lg = (1 - recovery / 100);
    const hazard = (spread / 10000) / lg; // annual hazard rate
    // Survival probability curve
    const tenors = [1, 2, 3, 4, 5, 7, 10];
    const survivalCurve = tenors.map((t) => ({
      t,
      prob: Math.exp(-hazard * t),
    }));

    // CDS premium leg PV = spread * annuity
    let annuity = 0;
    for (let t = 1; t <= maturity; t++) {
      annuity += Math.exp(-hazard * t) * discountFactor(0.045, t);
    }
    const premiumLegPV = (spread / 10000) * annuity * 1_000_000;
    const protectionLegPV = lg * (1 - Math.exp(-hazard * maturity)) * discountFactor(0.045, maturity / 2) * 1_000_000;
    const npv = protectionLegPV - premiumLegPV;

    // P&L when spread widens
    const newSpread = spread + spreadShift;
    const newHazard = (newSpread / 10000) / lg;
    let newAnnuity = 0;
    for (let t = 1; t <= maturity; t++) {
      newAnnuity += Math.exp(-newHazard * t) * discountFactor(0.045, t);
    }
    const newPremiumPV = (newSpread / 10000) * newAnnuity * 1_000_000;
    const newProtectionPV = lg * (1 - Math.exp(-newHazard * maturity)) * discountFactor(0.045, maturity / 2) * 1_000_000;
    const buyerPnL = (newProtectionPV - newPremiumPV) - npv;

    // CDX index
    const cdxIG = { spread: 108, constituents: 125, avgSpread: 108 };
    const cdxHY = { spread: 450, constituents: 100, avgSpread: 450 };

    return {
      hazard: hazard * 100,
      annualDefault: (1 - Math.exp(-hazard)) * 100,
      survivalCurve,
      premiumLegPV,
      protectionLegPV,
      npv,
      buyerPnL,
      cdxIG,
      cdxHY,
      zspreadBasis: spread - (spread * 0.92), // CDS vs Z-spread basis
    };
  }, [spread, recovery, maturity, spreadShift]);

  const W = 520;
  const H = 150;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const maxT = 10;

  const survPts = results.survivalCurve.map((p) => {
    const x = pad.l + (p.t / maxT) * chartW;
    const y = pad.t + chartH - p.prob * chartH;
    return { x, y, ...p };
  });
  const survPath = survPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SelectInput
          label="Reference Entity"
          value={entity}
          onChange={setEntity}
          options={[
            { value: "IG Corp", label: "IG Corp" },
            { value: "HY Corp", label: "HY Corp" },
            { value: "EM Sovereign", label: "EM Sovereign" },
            { value: "Bank", label: "Bank" },
          ]}
        />
        <NumberInput
          label="CDS Spread (bps)"
          value={spread}
          onChange={setSpread}
          min={1}
          max={5000}
          step={5}
        />
        <NumberInput
          label="Recovery Rate (%)"
          value={recovery}
          onChange={setRecovery}
          min={0}
          max={90}
          step={5}
          suffix="%"
        />
        <NumberInput
          label="Maturity (years)"
          value={maturity}
          onChange={setMaturity}
          min={1}
          max={10}
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Hazard Rate"
          value={`${results.hazard.toFixed(3)}%`}
          sub="Annual default intensity"
        />
        <MetricCard
          label="Annual Default Prob"
          value={`${results.annualDefault.toFixed(2)}%`}
          sub="1 - e^(-λ)"
        />
        <MetricCard
          label="5Y Survival Prob"
          value={`${(results.survivalCurve.find((s) => s.t === 5)?.prob ?? 0 * 100).toFixed(1)}%`}
          positive={(results.survivalCurve.find((s) => s.t === 5)?.prob ?? 0) > 0.8}
        />
        <MetricCard
          label="CDS Basis vs Z-spread"
          value={`${results.zspreadBasis.toFixed(0)} bps`}
          sub="Positive = cheap protection"
          positive={results.zspreadBasis > 0}
        />
      </div>

      {/* Survival Probability Curve */}
      <div className="bg-white/5 rounded-xl p-4 space-y-2">
        <SectionTitle>Survival Probability Curve</SectionTitle>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {/* Grid */}
          {[0.25, 0.5, 0.75, 1.0].map((p) => {
            const y = pad.t + chartH - p * chartH;
            return (
              <g key={p}>
                <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={pad.l - 4} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={8}>
                  {(p * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
          {/* Axes */}
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          {/* Fill area */}
          <path
            d={`${survPath} L ${survPts[survPts.length - 1].x} ${H - pad.b} L ${pad.l} ${H - pad.b} Z`}
            fill="rgba(239,68,68,0.1)"
          />
          {/* Survival curve */}
          <path d={survPath} fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth={2} />
          {/* X-axis labels */}
          {survPts.map((p, i) => (
            <text key={i} x={p.x} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
              {p.t}Y
            </text>
          ))}
          {/* Dots */}
          {survPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill="rgba(239,68,68,0.9)" />
          ))}
        </svg>
        <div className="flex items-center gap-2 text-xs text-red-300">
          <span>Default region (shaded) = cumulative default probability</span>
        </div>
      </div>

      {/* P&L Slider */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>CDS P&amp;L — Spread Widening/Tightening</SectionTitle>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/50 w-36">Spread shift (bps)</span>
          <input
            type="range"
            min={-100}
            max={200}
            step={5}
            value={spreadShift}
            onChange={(e) => setSpreadShift(Number(e.target.value))}
            className="flex-1 accent-rose-500"
          />
          <span className={cn("text-sm font-mono w-20 text-right", spreadShift > 0 ? "text-red-400" : "text-emerald-400")}>
            {spreadShift > 0 ? "+" : ""}{spreadShift} bps
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Protection Buyer P&amp;L (per $1M)"
            value={`${results.buyerPnL >= 0 ? "+" : ""}$${(results.buyerPnL / 1000).toFixed(1)}K`}
            positive={results.buyerPnL >= 0}
          />
          <MetricCard
            label="Protection Seller P&amp;L (per $1M)"
            value={`${-results.buyerPnL >= 0 ? "+" : ""}$${(-results.buyerPnL / 1000).toFixed(1)}K`}
            positive={-results.buyerPnL >= 0}
          />
        </div>
        <InfoBox>
          When spreads widen (credit deteriorates), protection buyers gain and sellers lose. Hazard rate
          formula: λ = CDS_spread / (1 − Recovery). Default probability = 1 − e^(−λT).
        </InfoBox>
      </div>

      {/* CDX indices */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>CDX Index Snapshot</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-1">
            <div className="text-xs text-white/40 uppercase">CDX.NA.IG (125 names)</div>
            <div className="text-2xl font-bold text-emerald-400">108 bps</div>
            <div className="text-xs text-white/50">Investment Grade — avg per-name: 0.86 bps</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 space-y-1">
            <div className="text-xs text-white/40 uppercase">CDX.NA.HY (100 names)</div>
            <div className="text-2xl font-bold text-rose-400">450 bps</div>
            <div className="text-xs text-white/50">High Yield — avg per-name: 4.5 bps</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Total Return Swaps ─────────────────────────────────────────────

function TRSPage() {
  const [notional, setNotional] = useState(10_000_000);
  const [margin, setMargin] = useState(1_000_000);
  const [sofrSpread, setSofrSpread] = useState(50);
  const [bondReturn, setBondReturn] = useState(3.2);
  const [sofrRate, setSofrRate] = useState(5.31);
  const [useEquity, setUseEquity] = useState(false);
  const [sp500Return, setSp500Return] = useState(8.5);

  const results = useMemo(() => {
    const leverage = notional / margin;
    const fundingCost = sofrRate + sofrSpread / 100;
    const assetReturn = useEquity ? sp500Return : bondReturn;
    const netReturn = assetReturn - fundingCost;
    const leveragedReturn = netReturn * leverage;
    const absolutePnL = notional * (assetReturn / 100);
    const fundingPaid = notional * (fundingCost / 100);
    const netPnL = absolutePnL - fundingPaid;
    return { leverage, fundingCost, assetReturn, netReturn, leveragedReturn, absolutePnL, fundingPaid, netPnL };
  }, [notional, margin, sofrSpread, bondReturn, sofrRate, useEquity, sp500Return]);

  const scenarios = useMemo(() => {
    return [-15, -10, -5, 0, 5, 10, 15].map((ret) => {
      const fundingCost = sofrRate + sofrSpread / 100;
      const lev = notional / margin;
      const grossPnL = notional * (ret / 100);
      const fundingPaid = notional * (fundingCost / 100);
      const netPnL = grossPnL - fundingPaid;
      const levReturn = (netPnL / margin) * 100;
      return { ret, netPnL, levReturn };
    });
  }, [notional, margin, sofrSpread, sofrRate]);

  const W = 520;
  const H = 140;
  const pad = { l: 16, r: 16, t: 16, b: 28 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const maxPnL = Math.max(...scenarios.map((s) => Math.abs(s.netPnL)));
  const midY = pad.t + chartH / 2;
  const barW = chartW / scenarios.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumberInput
          label="TRS Notional ($)"
          value={notional}
          onChange={setNotional}
          min={100000}
          step={1000000}
          prefix="$"
        />
        <NumberInput
          label="Margin Posted ($)"
          value={margin}
          onChange={setMargin}
          min={100000}
          step={500000}
          prefix="$"
        />
        <NumberInput
          label="SOFR Rate (%)"
          value={sofrRate}
          onChange={setSofrRate}
          min={0}
          max={15}
          step={0.05}
          suffix="%"
        />
        <NumberInput
          label="SOFR Spread (bps)"
          value={sofrSpread}
          onChange={setSofrSpread}
          min={0}
          max={500}
          step={5}
        />
        {useEquity ? (
          <NumberInput
            label="S&P 500 Return (%)"
            value={sp500Return}
            onChange={setSp500Return}
            min={-50}
            max={50}
            step={0.5}
            suffix="%"
          />
        ) : (
          <NumberInput
            label="Bond Total Return (%)"
            value={bondReturn}
            onChange={setBondReturn}
            min={-20}
            max={20}
            step={0.1}
            suffix="%"
          />
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Underlying Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setUseEquity(false)}
              className={cn(
                "flex-1 h-9 rounded-lg text-sm transition-colors",
                !useEquity ? "bg-sky-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10",
              )}
            >
              Fixed Income
            </button>
            <button
              onClick={() => setUseEquity(true)}
              className={cn(
                "flex-1 h-9 rounded-lg text-sm transition-colors",
                useEquity ? "bg-sky-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10",
              )}
            >
              Equity TRS
            </button>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Leverage"
          value={`${results.leverage.toFixed(1)}×`}
          sub={`$${(notional / 1e6).toFixed(1)}M / $${(margin / 1e6).toFixed(1)}M margin`}
        />
        <MetricCard
          label="Funding Cost"
          value={`${results.fundingCost.toFixed(2)}%`}
          sub={`SOFR ${sofrRate}% + ${sofrSpread}bps`}
        />
        <MetricCard
          label="Net P&amp;L (annual)"
          value={`${results.netPnL >= 0 ? "+" : ""}$${(results.netPnL / 1000).toFixed(0)}K`}
          positive={results.netPnL >= 0}
        />
        <MetricCard
          label="Leveraged Return on Margin"
          value={`${((results.netPnL / margin) * 100).toFixed(1)}%`}
          positive={results.netPnL >= 0}
        />
      </div>

      {/* P&L scenarios chart */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>Leveraged P&amp;L by Asset Return Scenario</SectionTitle>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          <line x1={pad.l} y1={midY} x2={W - pad.r} y2={midY} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          {scenarios.map((sc, i) => {
            const x = pad.l + i * barW + barW * 0.1;
            const bw = barW * 0.8;
            const barPx = Math.abs((sc.netPnL / maxPnL) * (chartH / 2 - 4));
            const isPos = sc.netPnL >= 0;
            return (
              <g key={i}>
                <motion.rect
                  initial={{ height: 0, y: midY }}
                  animate={{ height: barPx, y: isPos ? midY - barPx : midY }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  x={x}
                  width={bw}
                  fill={isPos ? "rgba(52,211,153,0.7)" : "rgba(239,68,68,0.7)"}
                  rx={2}
                />
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
                  {sc.ret > 0 ? "+" : ""}{sc.ret}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Structure explanation */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>TRS Structure &amp; Regulatory Context</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div className="space-y-2">
            <p className="font-medium text-white">Economic Exposure vs Legal Ownership</p>
            <p>The Total Return Payer (e.g. prime broker) holds the bond legally but transfers all economic exposure (coupon + price change) to the receiver (hedge fund).</p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Prime Brokerage Leverage</p>
            <p>${(notional / 1e6).toFixed(1)}M TRS with ${(margin / 1e6).toFixed(1)}M initial margin = {results.leverage.toFixed(1)}× leverage. The fund controls large notional with limited capital.</p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Regulatory Treatment (pre-Basel III)</p>
            <p>Pre-2008 TRS were off-balance-sheet for the receiver. Post-Dodd-Frank, large TRS positions require disclosure (e.g. Archegos 2021 caused $10B+ losses when positions unwound).</p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Equity TRS (S&P 500)</p>
            <p>Hedge funds use equity TRS to gain index exposure without owning shares — avoiding stamp duty and benefiting from synthetic repo financing at near-SOFR rates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Swaptions ─────────────────────────────────────────────────────────

resetSeed();
const VOL_SURFACE: number[][] = Array.from({ length: 5 }, () =>
  Array.from({ length: 6 }, () => 0.15 + rand() * 0.25),
);

const EXPIRIES = ["1M", "3M", "6M", "1Y", "2Y"];
const SWAP_TENORS = ["1Y", "2Y", "5Y", "10Y", "15Y", "30Y"];

function SwaptionsPage() {
  const [isPayer, setIsPayer] = useState(true);
  const [fwdRate, setFwdRate] = useState(4.5);
  const [strike, setStrike] = useState(4.75);
  const [expiry, setExpiry] = useState(1);
  const [swapTenor, setSwapTenor] = useState(10);
  const [vol, setVol] = useState(25);
  const [notional, setNotional] = useState(10_000_000);

  const results = useMemo(() => {
    const F = fwdRate / 100;
    const K = strike / 100;
    const T = expiry;
    const sigma = vol / 100;
    // Annuity: approximate as sum of discount factors over swap tenor
    let annuity = 0;
    const r = F;
    for (let t = 1; t <= swapTenor; t++) {
      annuity += discountFactor(r, t);
    }

    const price = black76Swaption(F, K, T, sigma, annuity, isPayer);
    const priceTotal = price * notional;

    // Delta (dPrice/dF ≈ +/-N(d1) * annuity * notional)
    const h = 0.0001;
    const priceUp = black76Swaption(F + h, K, T, sigma, annuity, isPayer);
    const priceDn = black76Swaption(F - h, K, T, sigma, annuity, isPayer);
    const delta = ((priceUp - priceDn) / (2 * h)) * notional;
    const vega = ((black76Swaption(F, K, T, sigma + 0.01, annuity, isPayer) - price) / 0.01) * notional;

    // Breakeven vol (implicit — use input vol)
    const impliedBreakeven = K + price / (annuity * discountFactor(r, T));

    return { price, priceTotal, delta, vega, impliedBreakeven, annuity };
  }, [isPayer, fwdRate, strike, expiry, swapTenor, vol, notional]);

  // Heatmap
  const minVol = 0.15;
  const maxVol = 0.40;
  const cellW = 62;
  const cellH = 28;

  function volColor(v: number): string {
    const t = (v - minVol) / (maxVol - minVol);
    const r = Math.round(59 + t * 180);
    const g = Math.round(130 - t * 100);
    const b = Math.round(246 - t * 150);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Swaption Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPayer(true)}
              className={cn("flex-1 h-9 rounded-lg text-sm", isPayer ? "bg-sky-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10")}
            >
              Payer
            </button>
            <button
              onClick={() => setIsPayer(false)}
              className={cn("flex-1 h-9 rounded-lg text-sm", !isPayer ? "bg-sky-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10")}
            >
              Receiver
            </button>
          </div>
        </div>
        <NumberInput
          label="Forward Swap Rate (%)"
          value={fwdRate}
          onChange={setFwdRate}
          min={0.01}
          max={20}
          step={0.05}
          suffix="%"
        />
        <NumberInput
          label="Strike Rate (%)"
          value={strike}
          onChange={setStrike}
          min={0.01}
          max={20}
          step={0.05}
          suffix="%"
        />
        <NumberInput
          label="Expiry (years)"
          value={expiry}
          onChange={setExpiry}
          min={0.083}
          max={5}
          step={0.25}
        />
        <NumberInput
          label="Swap Tenor (years)"
          value={swapTenor}
          onChange={setSwapTenor}
          min={1}
          max={30}
        />
        <NumberInput
          label="Implied Vol (%)"
          value={vol}
          onChange={setVol}
          min={1}
          max={100}
          step={0.5}
          suffix="%"
        />
        <NumberInput
          label="Notional ($)"
          value={notional}
          onChange={setNotional}
          min={100000}
          step={1000000}
          prefix="$"
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Swaption Premium"
          value={`${(results.price * 10000).toFixed(1)} bps`}
          sub={`$${(results.priceTotal / 1000).toFixed(0)}K on $${(notional / 1e6).toFixed(0)}M`}
        />
        <MetricCard
          label="Delta"
          value={`$${(results.delta / 1000).toFixed(0)}K / bp`}
          sub="dValue / dFwdRate"
        />
        <MetricCard
          label="Vega"
          value={`$${(results.vega / 1000).toFixed(0)}K / vol-pt`}
          sub="dValue / d(vol)"
        />
        <MetricCard
          label="Breakeven Fwd Rate"
          value={`${(results.impliedBreakeven * 100).toFixed(3)}%`}
          sub="Forward rate where premium = payoff"
        />
      </div>

      {/* Vol surface heatmap */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3 overflow-x-auto">
        <SectionTitle>Implied Swaption Vol Surface (%)</SectionTitle>
        <svg
          width={SWAP_TENORS.length * cellW + 60}
          height={EXPIRIES.length * cellH + 40}
          className="overflow-visible"
        >
          {/* Column headers */}
          {SWAP_TENORS.map((t, j) => (
            <text
              key={j}
              x={60 + j * cellW + cellW / 2}
              y={14}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize={9}
            >
              {t}
            </text>
          ))}
          {/* Row headers + cells */}
          {EXPIRIES.map((exp, i) => (
            <g key={i}>
              <text
                x={54}
                y={30 + i * cellH + cellH / 2}
                textAnchor="end"
                fill="rgba(255,255,255,0.5)"
                fontSize={9}
                dominantBaseline="middle"
              >
                {exp}
              </text>
              {SWAP_TENORS.map((_, j) => {
                const v = VOL_SURFACE[i][j];
                return (
                  <g key={j}>
                    <rect
                      x={60 + j * cellW + 1}
                      y={22 + i * cellH + 1}
                      width={cellW - 2}
                      height={cellH - 2}
                      fill={volColor(v)}
                      fillOpacity={0.6}
                      rx={3}
                    />
                    <text
                      x={60 + j * cellW + cellW / 2}
                      y={22 + i * cellH + cellH / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={9}
                      fontWeight="500"
                    >
                      {(v * 100).toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
          {/* Axis labels */}
          <text
            x={60 + (SWAP_TENORS.length * cellW) / 2}
            y={EXPIRIES.length * cellH + 38}
            textAnchor="middle"
            fill="rgba(255,255,255,0.3)"
            fontSize={8}
          >
            Swap Tenor →
          </text>
        </svg>
        <p className="text-xs text-white/40">
          Expiry (rows) × Swap Tenor (cols) — darker blue = higher vol. Blue=low, red=high implied vol.
          SABR model calibrates α (vol level), β (backbone), ρ (skew), ν (vol-of-vol) to fit surface.
        </p>
      </div>

      <InfoBox>
        <strong>Black-76 model:</strong> V = A × [F·N(d₁) − K·N(d₂)] for payer swaption, where A = annuity
        factor, d₁ = [ln(F/K) + ½σ²T] / (σ√T). A <strong>Bermudan swaption</strong> grants the right to
        enter the swap on multiple exercise dates — used to model callable bond optionality. The SABR model
        (Hagan 2002) extends Black-76 with stochastic volatility to capture the vol smile.
      </InfoBox>
    </div>
  );
}

// ── Tab 6: Inflation Swaps ────────────────────────────────────────────────

const INFL_TENORS = [
  { label: "1Y", years: 1, rate: 2.45 },
  { label: "2Y", years: 2, rate: 2.52 },
  { label: "3Y", years: 3, rate: 2.58 },
  { label: "5Y", years: 5, rate: 2.65 },
  { label: "7Y", years: 7, rate: 2.71 },
  { label: "10Y", years: 10, rate: 2.78 },
  { label: "20Y", years: 20, rate: 2.85 },
  { label: "30Y", years: 30, rate: 2.88 },
];

const TIPS_DATA = [
  { label: "5Y", tipsYield: 1.85, nominalYield: 4.50 },
  { label: "10Y", tipsYield: 1.82, nominalYield: 4.35 },
  { label: "20Y", tipsYield: 2.05, nominalYield: 4.62 },
  { label: "30Y", tipsYield: 2.10, nominalYield: 4.42 },
];

function InflationSwapsPage() {
  const [tenor, setTenor] = useState(5);
  const [fixedRate, setFixedRate] = useState(2.65);
  const [realizedCPI, setRealizedCPI] = useState(3.2);
  const [notional, setNotional] = useState(5_000_000);
  const [capStrike, setCapStrike] = useState(4.0);
  const [floorStrike, setFloorStrike] = useState(1.5);

  const results = useMemo(() => {
    // Zero-coupon inflation swap: fixed leg vs realized CPI compounded
    const fixedLeg = notional * (Math.pow(1 + fixedRate / 100, tenor) - 1);
    const inflLeg = notional * (Math.pow(1 + realizedCPI / 100, tenor) - 1);
    const npv = inflLeg - fixedLeg;

    // YoY swap: annual CPI payments
    const yoyPayments = Array.from({ length: tenor }, (_, i) => {
      const t = i + 1;
      const cpiReturn = realizedCPI / 100;
      const payment = notional * cpiReturn * discountFactor(0.045, t);
      return { t, payment };
    });

    // Inflation cap/floor value (simplified Black)
    const vol = 0.012;
    const fwd = realizedCPI / 100;
    const capPV = tenor > 0
      ? black76Swaption(fwd, capStrike / 100, 1, vol, notional, true) * tenor
      : 0;
    const floorPV = tenor > 0
      ? black76Swaption(fwd, floorStrike / 100, 1, vol, notional, false) * tenor
      : 0;

    return { fixedLeg, inflLeg, npv, yoyPayments, capPV, floorPV };
  }, [tenor, fixedRate, realizedCPI, notional, capStrike, floorStrike]);

  const W = 520;
  const H = 160;
  const pad = { l: 36, r: 16, t: 16, b: 28 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  // Inflation swap curve chart
  const minR = 2.3;
  const maxR = 3.0;
  const inflPts = INFL_TENORS.map((t, i) => {
    const x = pad.l + (i / (INFL_TENORS.length - 1)) * chartW;
    const y = pad.t + chartH - ((t.rate - minR) / (maxR - minR)) * chartH;
    return { x, y, ...t };
  });
  const inflPath = inflPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumberInput
          label="Tenor (years)"
          value={tenor}
          onChange={(v) => setTenor(Math.max(1, Math.min(30, v)))}
          min={1}
          max={30}
        />
        <NumberInput
          label="Fixed (ZC) Rate (%)"
          value={fixedRate}
          onChange={setFixedRate}
          min={0}
          max={10}
          step={0.05}
          suffix="%"
        />
        <NumberInput
          label="Realized CPI (%/yr)"
          value={realizedCPI}
          onChange={setRealizedCPI}
          min={-5}
          max={15}
          step={0.1}
          suffix="%"
        />
        <NumberInput
          label="Notional ($)"
          value={notional}
          onChange={setNotional}
          min={100000}
          step={1000000}
          prefix="$"
        />
        <NumberInput
          label="Inflation Cap Strike (%)"
          value={capStrike}
          onChange={setCapStrike}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
        />
        <NumberInput
          label="Inflation Floor Strike (%)"
          value={floorStrike}
          onChange={setFloorStrike}
          min={0}
          max={5}
          step={0.1}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Fixed Leg Payment"
          value={`$${(results.fixedLeg / 1000).toFixed(0)}K`}
          sub={`${fixedRate}% compounded × ${tenor}Y`}
        />
        <MetricCard
          label="Inflation Leg Payment"
          value={`$${(results.inflLeg / 1000).toFixed(0)}K`}
          sub={`Realized CPI ${realizedCPI}% × ${tenor}Y`}
        />
        <MetricCard
          label="ZC Swap NPV"
          value={`${results.npv >= 0 ? "+" : ""}$${(results.npv / 1000).toFixed(0)}K`}
          sub="Inflation receiver P&L"
          positive={results.npv >= 0}
        />
        <MetricCard
          label="Real vs Fixed Spread"
          value={`${(realizedCPI - fixedRate) >= 0 ? "+" : ""}${(realizedCPI - fixedRate).toFixed(2)}%`}
          sub="CPI outperformance"
          positive={realizedCPI > fixedRate}
        />
      </div>

      {/* Inflation cap/floor */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="text-xs text-white/40 uppercase tracking-wide">Inflation Cap (≥{capStrike}% CPI)</div>
          <div className="text-xl font-bold text-amber-300">
            ${(results.capPV / 1000).toFixed(0)}K
          </div>
          <p className="text-xs text-white/50">Protects against CPI above {capStrike}% — e.g. pension paying real benefits</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="text-xs text-white/40 uppercase tracking-wide">Inflation Floor (≤{floorStrike}% CPI)</div>
          <div className="text-xl font-bold text-sky-300">
            ${(results.floorPV / 1000).toFixed(0)}K
          </div>
          <p className="text-xs text-white/50">Protects against CPI below {floorStrike}% — e.g. inflation-linked bond issuer</p>
        </div>
      </div>

      {/* Inflation swap curve */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <SectionTitle>Market-Implied Inflation Expectations Curve</SectionTitle>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {[2.4, 2.6, 2.8, 3.0].map((r) => {
            const y = pad.t + chartH - ((r - minR) / (maxR - minR)) * chartH;
            return (
              <g key={r}>
                <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={pad.l - 4} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={8}>
                  {r.toFixed(1)}%
                </text>
              </g>
            );
          })}
          {/* Fed 2% target line */}
          {(() => {
            const targetY = pad.t + chartH - ((2.0 - minR) / (maxR - minR)) * chartH;
            return (
              <line
                x1={pad.l}
                y1={targetY + chartH * 0.6}
                x2={W - pad.r}
                y2={targetY + chartH * 0.6}
                stroke="rgba(239,68,68,0.4)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            );
          })()}
          <path d={inflPath} fill="none" stroke="rgba(251,191,36,0.9)" strokeWidth={2} />
          {inflPts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="rgba(251,191,36,0.8)" />
              <text x={p.x} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* TIPS breakeven */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3 overflow-x-auto">
        <SectionTitle>TIPS Breakeven Inflation (nominal − TIPS yield)</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase">
              <th className="text-left py-1 pr-4">Tenor</th>
              <th className="text-right py-1 pr-4">TIPS Real Yield</th>
              <th className="text-right py-1 pr-4">Nominal Yield</th>
              <th className="text-right py-1 pr-4">Breakeven Infl.</th>
              <th className="text-right py-1">vs Swap</th>
            </tr>
          </thead>
          <tbody>
            {TIPS_DATA.map((row, i) => {
              const breakeven = row.nominalYield - row.tipsYield;
              const swapRate = INFL_TENORS.find((t) => t.label === row.label)?.rate ?? breakeven;
              const basis = breakeven - swapRate;
              return (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-1.5 pr-4 text-white/80 font-medium">{row.label}</td>
                  <td className="py-1.5 pr-4 text-right tabular-nums text-sky-300">{row.tipsYield.toFixed(2)}%</td>
                  <td className="py-1.5 pr-4 text-right tabular-nums text-white/60">{row.nominalYield.toFixed(2)}%</td>
                  <td className="py-1.5 pr-4 text-right tabular-nums text-amber-300">{breakeven.toFixed(2)}%</td>
                  <td className={cn("py-1.5 text-right tabular-nums text-xs", basis > 0 ? "text-emerald-400" : "text-red-400")}>
                    {basis >= 0 ? "+" : ""}{(basis * 100).toFixed(0)} bps
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <InfoBox>
          Breakeven inflation = Nominal Treasury yield − TIPS real yield. If breakeven &gt; inflation swap
          rate, TIPS are relatively cheap vs swaps (positive basis = buy TIPS / pay swap arbitrage).
          Real rate = nominal yield − inflation expectations.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "irs", label: "IRS Pricer", icon: ArrowLeftRight },
  { id: "curve", label: "Swap Curve", icon: TrendingUp },
  { id: "cds", label: "CDS", icon: Shield },
  { id: "trs", label: "TRS", icon: Layers },
  { id: "swaptions", label: "Swaptions", icon: BarChart3 },
  { id: "inflation", label: "Inflation Swaps", icon: Thermometer },
];

export default function SwapsPage() {
  const [activeTab, setActiveTab] = useState("irs");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/60 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Interest Rate Swaps &amp; Fixed Income Derivatives</h1>
            <p className="text-xs text-white/40">
              IRS · Swap Curves · CDS · Total Return Swaps · Swaptions · Inflation Derivatives
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 p-1 flex-wrap h-auto gap-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-white/50 flex items-center gap-1.5 px-3 py-1.5 text-sm"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="irs" className="data-[state=inactive]:hidden mt-4">
            <motion.div
              key="irs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <IRSPricer />
            </motion.div>
          </TabsContent>

          <TabsContent value="curve" className="data-[state=inactive]:hidden mt-4">
            <motion.div
              key="curve"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SwapCurveBuilder />
            </motion.div>
          </TabsContent>

          <TabsContent value="cds" className="data-[state=inactive]:hidden mt-4">
            <motion.div
              key="cds"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CDSPricer />
            </motion.div>
          </TabsContent>

          <TabsContent value="trs" className="data-[state=inactive]:hidden mt-4">
            <motion.div
              key="trs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <TRSPage />
            </motion.div>
          </TabsContent>

          <TabsContent value="swaptions" className="data-[state=inactive]:hidden mt-4">
            <motion.div
              key="swaptions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SwaptionsPage />
            </motion.div>
          </TabsContent>

          <TabsContent value="inflation" className="data-[state=inactive]:hidden mt-4">
            <motion.div
              key="inflation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <InflationSwapsPage />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
