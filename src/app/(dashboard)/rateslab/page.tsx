"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  TrendingUp,
  Globe,
  Shield,
  BarChart3,
  Info,
} from "lucide-react";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 722002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Math helpers ─────────────────────────────────────────────────────────────
function normalCDF(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * ax);
  const y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
      Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

function discountFactor(rate: number, years: number): number {
  return Math.exp(-rate * years);
}

function fmt(n: number, dec = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${fmt(n / 1_000_000, 2)}M`;
  if (Math.abs(n) >= 1_000) return `$${fmt(n / 1_000, 1)}K`;
  return `$${fmt(n, 0)}`;
}

// ── IRS Pricing ──────────────────────────────────────────────────────────────
interface IRSResult {
  npv: number;
  dv01: number;
  fixedLeg: number[];
  floatingLeg: number[];
  netFlows: number[];
  times: number[];
}

function priceIRS(
  notional: number,
  fixedRate: number,
  sofrRate: number,
  tenorYears: number,
  payFixed: boolean
): IRSResult {
  const n = Math.round(tenorYears * 4); // quarterly payments
  const dt = tenorYears / n;
  const fixedLeg: number[] = [];
  const floatingLeg: number[] = [];
  const netFlows: number[] = [];
  const times: number[] = [];
  let fixedPV = 0;
  let floatPV = 0;

  for (let i = 1; i <= n; i++) {
    const t = i * dt;
    const df = discountFactor(sofrRate + 0.005, t);
    // fixed coupon
    const fc = notional * fixedRate * dt;
    // floating coupon (approximate using SOFR flat + small spread per period)
    const fwdSOFR = sofrRate + 0.001 * Math.sin(t);
    const fl = notional * fwdSOFR * dt;
    fixedLeg.push(fc);
    floatingLeg.push(fl);
    netFlows.push(payFixed ? fl - fc : fc - fl);
    times.push(t);
    fixedPV += fc * df;
    floatPV += fl * df;
  }

  const npv = payFixed ? floatPV - fixedPV : fixedPV - floatPV;
  const bpShift = 0.0001;
  let dv01PV = 0;
  for (let i = 1; i <= n; i++) {
    const t = i * dt;
    const df2 = discountFactor(sofrRate + 0.005 + bpShift, t);
    const fwdSOFR = sofrRate + 0.001 * Math.sin(t);
    const fl = notional * fwdSOFR * dt;
    const fc = notional * fixedRate * dt;
    dv01PV += (payFixed ? fl - fc : fc - fl) * df2;
  }
  const dv01 = Math.abs(dv01PV - npv);

  return { npv, dv01, fixedLeg, floatingLeg, netFlows, times };
}

// ── Swap Curve Bootstrapping ──────────────────────────────────────────────────
const TENOR_LABELS = ["1M", "3M", "6M", "1Y", "2Y", "5Y", "10Y", "30Y"];
const TENOR_YEARS = [1 / 12, 0.25, 0.5, 1, 2, 5, 10, 30];

function generateSOFRCurve(): number[] {
  // Simulate realistic SOFR par swap rates
  const base = [5.31, 5.28, 5.20, 4.98, 4.65, 4.35, 4.42, 4.55];
  return base.map((r) => r + (rand() - 0.5) * 0.08);
}

function bootstrapZeroCurve(parRates: number[]): number[] {
  const zeros: number[] = [];
  // Short end: zero ≈ par for money market
  zeros.push(parRates[0] / 100);
  zeros.push(parRates[1] / 100);
  zeros.push(parRates[2] / 100);
  zeros.push(parRates[3] / 100);

  // Bootstrap annual tenors
  for (let i = 4; i < parRates.length; i++) {
    const T = TENOR_YEARS[i];
    const c = parRates[i] / 100;
    let sumPV = 0;
    const prevCount = Math.round(T);
    for (let j = 1; j < prevCount; j++) {
      const tJ = (j / prevCount) * T;
      // Interpolate zero for intermediate coupon
      const idx = zeros.length - 1;
      const z = zeros[Math.min(j - 1, idx)];
      sumPV += c * Math.exp(-z * tJ);
    }
    // Last cashflow = 1 + c
    const z_T = -Math.log((1 - sumPV) / (1 + c)) / T;
    zeros.push(Math.max(0.01, z_T));
  }
  return zeros;
}

function computeForwardRates(zeros: number[], tenors: number[]): number[] {
  return zeros.map((z, i) => {
    if (i === 0) return z;
    const t1 = tenors[i - 1];
    const t2 = tenors[i];
    const z1 = zeros[i - 1];
    return (z * t2 - z1 * t1) / (t2 - t1);
  });
}

// ── Black Model for Swaptions ────────────────────────────────────────────────
function blackSwaptionPrice(
  forward: number,   // forward swap rate
  strike: number,    // strike rate
  vol: number,       // lognormal vol
  T: number,         // time to expiry (years)
  annuity: number,   // swap annuity (PV01 × notional)
  isPayer: boolean   // payer swaption
): { price: number; d1: number; d2: number } {
  if (T <= 0 || vol <= 0) return { price: 0, d1: 0, d2: 0 };
  const d1 = (Math.log(forward / strike) + 0.5 * vol * vol * T) / (vol * Math.sqrt(T));
  const d2 = d1 - vol * Math.sqrt(T);
  const price = isPayer
    ? annuity * (forward * normalCDF(d1) - strike * normalCDF(d2))
    : annuity * (strike * normalCDF(-d2) - forward * normalCDF(-d1));
  return { price, d1, d2 };
}

// ── Section Card ─────────────────────────────────────────────────────────────
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#0f1117] border border-white/10 rounded-xl p-4 ${className}`}
    >
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="text-white font-mono">{format(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

function StatChip({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white/5 rounded-lg px-3 py-2 flex flex-col gap-0.5">
      <span className="text-xs text-white/40 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-sm font-mono font-semibold ${
          positive === undefined
            ? "text-white"
            : positive
            ? "text-emerald-400"
            : "text-red-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1: Swap Pricer
// ─────────────────────────────────────────────────────────────────────────────
function SwapPricerTab() {
  const [notional, setNotional] = useState(10_000_000);
  const [fixedRate, setFixedRate] = useState(4.5);
  const [tenor, setTenor] = useState(5);
  const [sofrRate, setSofrRate] = useState(5.2);
  const [payFixed, setPayFixed] = useState(true);

  const result = useMemo(
    () => priceIRS(notional, fixedRate / 100, sofrRate / 100, tenor, payFixed),
    [notional, fixedRate, tenor, sofrRate, payFixed]
  );

  // SVG cash flow timeline
  const svgW = 560;
  const svgH = 220;
  const margin = { l: 48, r: 16, t: 20, b: 40 };
  const innerW = svgW - margin.l - margin.r;
  const innerH = svgH - margin.t - margin.b;
  const maxAbs = Math.max(...result.fixedLeg, ...result.floatingLeg, 1);

  const xScale = (t: number) =>
    margin.l + (t / tenor) * innerW;
  const yScale = (v: number) =>
    margin.t + innerH / 2 - (v / maxAbs) * (innerH / 2) * 0.85;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Controls */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          IRS Parameters
        </h3>

        <SliderRow
          label="Notional"
          value={notional}
          min={1_000_000}
          max={100_000_000}
          step={1_000_000}
          format={(v) => fmtK(v)}
          onChange={setNotional}
        />
        <SliderRow
          label="Fixed Rate"
          value={fixedRate}
          min={0.5}
          max={10}
          step={0.05}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setFixedRate}
        />
        <SliderRow
          label="Tenor (years)"
          value={tenor}
          min={1}
          max={30}
          step={1}
          format={(v) => `${v}Y`}
          onChange={setTenor}
        />
        <SliderRow
          label="SOFR Rate"
          value={sofrRate}
          min={0.5}
          max={10}
          step={0.05}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setSofrRate}
        />

        <div>
          <p className="text-xs text-white/40 mb-2">Position</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPayFixed(true)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                payFixed
                  ? "bg-primary/30 text-primary border border-primary/50"
                  : "bg-white/5 text-white/40 border border-transparent"
              }`}
            >
              Pay Fixed
            </button>
            <button
              onClick={() => setPayFixed(false)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                !payFixed
                  ? "bg-primary/30 text-primary border border-primary/50"
                  : "bg-white/5 text-white/40 border border-transparent"
              }`}
            >
              Receive Fixed
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 space-y-2">
          <StatChip
            label="NPV"
            value={fmtK(result.npv)}
            positive={result.npv >= 0}
          />
          <StatChip
            label="DV01"
            value={fmtK(result.dv01)}
          />
          <StatChip
            label="Par Rate"
            value={`${sofrRate.toFixed(2)}%`}
          />
          <StatChip
            label="Spread"
            value={`${(fixedRate - sofrRate).toFixed(2)}%`}
            positive={fixedRate < sofrRate}
          />
        </div>

        <div className="bg-primary/10 border border-border rounded-lg p-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <Info className="inline w-3 h-3 mr-1 mb-0.5" />
            In an IRS, one party pays a fixed coupon while receiving SOFR-linked
            floating payments. NPV &gt; 0 means the swap has positive value to you.
          </p>
        </div>
      </Card>

      {/* Cash flow visualization */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white/80">
          Quarterly Cash Flow Timeline
        </h3>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH} className="block">
            {/* Axis */}
            <line
              x1={margin.l}
              y1={margin.t + innerH / 2}
              x2={svgW - margin.r}
              y2={margin.t + innerH / 2}
              stroke="#ffffff20"
              strokeWidth={1}
            />
            <text
              x={margin.l - 4}
              y={margin.t + innerH / 2 + 4}
              fill="#ffffff40"
              fontSize={9}
              textAnchor="end"
            >
              0
            </text>
            {/* Y labels */}
            <text
              x={margin.l - 4}
              y={margin.t + 8}
              fill="#ffffff40"
              fontSize={9}
              textAnchor="end"
            >
              +{fmtK(maxAbs * 0.85)}
            </text>
            <text
              x={margin.l - 4}
              y={margin.t + innerH - 4}
              fill="#ffffff40"
              fontSize={9}
              textAnchor="end"
            >
              -{fmtK(maxAbs * 0.85)}
            </text>
            {/* Fixed leg bars (below axis) */}
            {result.times.map((t, i) => {
              const x = xScale(t);
              const y0 = margin.t + innerH / 2;
              const fc = result.fixedLeg[i];
              const barH = (fc / maxAbs) * (innerH / 2) * 0.85;
              return (
                <g key={`f-${i}`}>
                  <rect
                    x={x - 4}
                    y={y0}
                    width={8}
                    height={barH}
                    fill="#ef444480"
                    rx={1}
                  />
                  <line x1={x} y1={y0} x2={x} y2={y0 + barH} stroke="#ef4444" strokeWidth={1} />
                </g>
              );
            })}
            {/* Floating leg bars (above axis) */}
            {result.times.map((t, i) => {
              const x = xScale(t) + 5;
              const y0 = margin.t + innerH / 2;
              const fl = result.floatingLeg[i];
              const barH = (fl / maxAbs) * (innerH / 2) * 0.85;
              return (
                <g key={`fl-${i}`}>
                  <rect
                    x={x - 4}
                    y={y0 - barH}
                    width={8}
                    height={barH}
                    fill="#22c55e80"
                    rx={1}
                  />
                </g>
              );
            })}
            {/* X tick labels */}
            {[0, 1, 2, 3, 4].map((j) => {
              const t = (j / 4) * tenor;
              return (
                <text
                  key={`xt-${j}`}
                  x={xScale(t)}
                  y={margin.t + innerH + 16}
                  fill="#ffffff50"
                  fontSize={9}
                  textAnchor="middle"
                >
                  {`Y${j === 0 ? "0" : fmt(t, 1)}`}
                </text>
              );
            })}
            {/* Legend */}
            <rect x={margin.l} y={svgH - 14} width={8} height={8} fill="#22c55e80" rx={1} />
            <text x={margin.l + 11} y={svgH - 6} fill="#ffffff60" fontSize={9}>
              Floating (receive)
            </text>
            <rect x={margin.l + 110} y={svgH - 14} width={8} height={8} fill="#ef444480" rx={1} />
            <text x={margin.l + 121} y={svgH - 6} fill="#ffffff60" fontSize={9}>
              Fixed (pay)
            </text>
          </svg>
        </div>

        {/* Net flow table */}
        <div>
          <p className="text-xs text-white/40 mb-2">Net Cash Flows (selected quarters)</p>
          <div className="grid grid-cols-5 gap-1.5">
            {result.times.slice(0, 20).map((t, i) => {
              const net = result.netFlows[i];
              return (
                <div
                  key={`nf-${i}`}
                  className={`rounded p-1.5 text-center ${
                    net >= 0
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <div className="text-[11px] text-white/40">{`Q${i + 1}`}</div>
                  <div
                    className={`text-xs font-mono font-semibold ${
                      net >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {fmtK(net)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: Swap Curve
// ─────────────────────────────────────────────────────────────────────────────
function SwapCurveTab() {
  const parRates = useMemo(() => generateSOFRCurve(), []);
  const zeros = useMemo(() => bootstrapZeroCurve(parRates), [parRates]);
  const forwards = useMemo(() => computeForwardRates(zeros, TENOR_YEARS), [zeros]);

  const svgW = 560;
  const svgH = 280;
  const margin = { l: 48, r: 24, t: 24, b: 40 };
  const innerW = svgW - margin.l - margin.r;
  const innerH = svgH - margin.t - margin.b;

  const allRates = [...parRates, ...zeros.map((z) => z * 100), ...forwards.map((f) => f * 100)];
  const minRate = Math.min(...allRates) - 0.1;
  const maxRate = Math.max(...allRates) + 0.1;

  const xScale = (i: number) =>
    margin.l + (i / (TENOR_YEARS.length - 1)) * innerW;
  const yScale = (r: number) =>
    margin.t + innerH - ((r - minRate) / (maxRate - minRate)) * innerH;

  function polyline(rates: number[], pct = false): string {
    return rates
      .map((r, i) => `${xScale(i)},${yScale(pct ? r : r * 100)}`)
      .join(" ");
  }

  const yticks = 5;

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Card>
        <h3 className="text-sm font-semibold text-white/80 mb-3">
          SOFR Swap Curve — Par / Zero / Forward
        </h3>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH}>
            {/* Grid */}
            {Array.from({ length: yticks + 1 }, (_, k) => {
              const r = minRate + (k / yticks) * (maxRate - minRate);
              const y = yScale(r);
              return (
                <g key={`yg-${k}`}>
                  <line x1={margin.l} y1={y} x2={svgW - margin.r} y2={y} stroke="#ffffff0f" strokeWidth={1} />
                  <text x={margin.l - 4} y={y + 4} fill="#ffffff40" fontSize={9} textAnchor="end">
                    {r.toFixed(1)}%
                  </text>
                </g>
              );
            })}
            {/* X labels */}
            {TENOR_LABELS.map((label, i) => (
              <text
                key={`xl-${i}`}
                x={xScale(i)}
                y={svgH - margin.b + 16}
                fill="#ffffff50"
                fontSize={9}
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
            {/* Par curve */}
            <polyline points={polyline(parRates, true)} fill="none" stroke="#60a5fa" strokeWidth={2} />
            {parRates.map((r, i) => (
              <circle key={`pc-${i}`} cx={xScale(i)} cy={yScale(r)} r={3} fill="#60a5fa" />
            ))}
            {/* Zero curve */}
            <polyline points={polyline(zeros)} fill="none" stroke="#34d399" strokeWidth={2} strokeDasharray="4 2" />
            {zeros.map((z, i) => (
              <circle key={`zc-${i}`} cx={xScale(i)} cy={yScale(z * 100)} r={3} fill="#34d399" />
            ))}
            {/* Forward curve */}
            <polyline points={polyline(forwards)} fill="none" stroke="#f472b6" strokeWidth={2} strokeDasharray="2 3" />
            {forwards.map((f, i) => (
              <circle key={`fc-${i}`} cx={xScale(i)} cy={yScale(f * 100)} r={3} fill="#f472b6" />
            ))}
            {/* Legend */}
            <line x1={margin.l} y1={svgH - 8} x2={margin.l + 20} y2={svgH - 8} stroke="#60a5fa" strokeWidth={2} />
            <text x={margin.l + 24} y={svgH - 4} fill="#ffffff70" fontSize={9}>Par</text>
            <line x1={margin.l + 60} y1={svgH - 8} x2={margin.l + 80} y2={svgH - 8} stroke="#34d399" strokeWidth={2} strokeDasharray="4 2" />
            <text x={margin.l + 84} y={svgH - 4} fill="#ffffff70" fontSize={9}>Zero</text>
            <line x1={margin.l + 120} y1={svgH - 8} x2={margin.l + 140} y2={svgH - 8} stroke="#f472b6" strokeWidth={2} strokeDasharray="2 3" />
            <text x={margin.l + 144} y={svgH - 4} fill="#ffffff70" fontSize={9}>Forward</text>
          </svg>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <h3 className="text-sm font-semibold text-white/80 mb-3">Bootstrapped Rates</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-1.5 text-white/40 font-medium">Tenor</th>
                <th className="text-right py-1.5 text-primary font-medium">Par Rate</th>
                <th className="text-right py-1.5 text-emerald-400 font-medium">Zero Rate</th>
                <th className="text-right py-1.5 text-pink-400 font-medium">Fwd Rate</th>
                <th className="text-right py-1.5 text-white/40 font-medium">Disc Factor</th>
              </tr>
            </thead>
            <tbody>
              {TENOR_LABELS.map((label, i) => (
                <tr key={`tr-${i}`} className="border-b border-white/5 hover:bg-muted/30">
                  <td className="py-1.5 font-mono text-white/70">{label}</td>
                  <td className="py-1.5 font-mono text-right text-primary">
                    {parRates[i].toFixed(3)}%
                  </td>
                  <td className="py-1.5 font-mono text-right text-emerald-300">
                    {(zeros[i] * 100).toFixed(3)}%
                  </td>
                  <td className="py-1.5 font-mono text-right text-pink-300">
                    {(forwards[i] * 100).toFixed(3)}%
                  </td>
                  <td className="py-1.5 font-mono text-right text-white/50">
                    {discountFactor(zeros[i], TENOR_YEARS[i]).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <p className="text-[11px] text-emerald-200/70 leading-relaxed">
          <Info className="inline w-3 h-3 mr-1 mb-0.5" />
          Bootstrapping extracts zero rates from par swap rates iteratively. The forward rate between
          two tenors is implied by the ratio of discount factors. An upward-sloping forward curve
          implies the market expects rates to rise.
        </p>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3: Swaption Pricing
// ─────────────────────────────────────────────────────────────────────────────
function SwaptionTab() {
  const [exerciseDate, setExerciseDate] = useState(1.0);
  const [strike, setStrike] = useState(4.5);
  const [vol, setVol] = useState(80);
  const [swapTenor, setSwapTenor] = useState(5);
  const [isPayer, setIsPayer] = useState(true);
  const [sofrFwd, setSofrFwd] = useState(4.8);

  const annuity = useMemo(() => {
    // Annuity = sum of discount factors for swap tenor (annual payments)
    const r = sofrFwd / 100;
    let a = 0;
    for (let i = 1; i <= swapTenor; i++) {
      a += discountFactor(r, i);
    }
    return a * 1_000_000; // per 1M notional
  }, [sofrFwd, swapTenor]);

  const result = useMemo(
    () =>
      blackSwaptionPrice(
        sofrFwd / 100,
        strike / 100,
        vol / 10000, // vol in bps → decimal
        exerciseDate,
        annuity,
        isPayer
      ),
    [sofrFwd, strike, vol, exerciseDate, annuity, isPayer]
  );

  // Payoff chart at various rate levels
  const svgW = 560;
  const svgH = 240;
  const margin = { l: 56, r: 16, t: 20, b: 40 };
  const innerW = svgW - margin.l - margin.r;
  const innerH = svgH - margin.t - margin.b;

  const rMin = Math.max(0.5, sofrFwd - 3);
  const rMax = sofrFwd + 3;
  const nPts = 60;
  const payoffs = Array.from({ length: nPts }, (_, i) => {
    const r = rMin + (i / (nPts - 1)) * (rMax - rMin);
    const ann = (() => {
      let a = 0;
      for (let j = 1; j <= swapTenor; j++) a += discountFactor(r / 100, j);
      return a * 1_000_000;
    })();
    const payoff = isPayer
      ? Math.max(0, (r / 100 - strike / 100) * ann)
      : Math.max(0, (strike / 100 - r / 100) * ann);
    return { r, payoff };
  });

  const maxPayoff = Math.max(...payoffs.map((p) => p.payoff), result.price * 2, 1);
  const xScale = (r: number) =>
    margin.l + ((r - rMin) / (rMax - rMin)) * innerW;
  const yScale = (v: number) =>
    margin.t + innerH - (v / maxPayoff) * innerH * 0.9;

  const payoffPath = payoffs
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.r)},${yScale(p.payoff)}`)
    .join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Controls */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pink-400" />
          Swaption Parameters
        </h3>

        <SliderRow
          label="Exercise Date (years)"
          value={exerciseDate}
          min={0.25}
          max={5}
          step={0.25}
          format={(v) => `${v.toFixed(2)}Y`}
          onChange={setExerciseDate}
        />
        <SliderRow
          label="Underlying Swap Tenor"
          value={swapTenor}
          min={1}
          max={30}
          step={1}
          format={(v) => `${v}Y`}
          onChange={setSwapTenor}
        />
        <SliderRow
          label="Strike Rate"
          value={strike}
          min={1}
          max={10}
          step={0.05}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setStrike}
        />
        <SliderRow
          label="Fwd SOFR Swap Rate"
          value={sofrFwd}
          min={1}
          max={10}
          step={0.05}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setSofrFwd}
        />
        <SliderRow
          label="Implied Vol (bps/yr)"
          value={vol}
          min={20}
          max={300}
          step={5}
          format={(v) => `${v} bps`}
          onChange={setVol}
        />

        <div>
          <p className="text-xs text-white/40 mb-2">Swaption Type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPayer(true)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                isPayer
                  ? "bg-pink-500/30 text-pink-300 border border-pink-500/50"
                  : "bg-white/5 text-white/40 border border-transparent"
              }`}
            >
              Payer
            </button>
            <button
              onClick={() => setIsPayer(false)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                !isPayer
                  ? "bg-primary/30 text-primary border border-primary/50"
                  : "bg-white/5 text-white/40 border border-transparent"
              }`}
            >
              Receiver
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 space-y-2">
          <StatChip label="Swaption Price" value={fmtK(result.price)} positive={result.price > 0} />
          <StatChip label="Annuity" value={fmtK(annuity)} />
          <StatChip label="d1" value={result.d1.toFixed(4)} />
          <StatChip label="d2" value={result.d2.toFixed(4)} />
        </div>

        <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
          <p className="text-[11px] text-pink-200/70 leading-relaxed">
            <Info className="inline w-3 h-3 mr-1 mb-0.5" />
            The Black model prices swaptions using the forward swap rate as the
            underlying. A payer swaption profits when rates rise above the strike.
          </p>
        </div>
      </Card>

      {/* Payoff chart */}
      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-white/80">
          Payoff at Expiry vs Rate Level
        </h3>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const y = margin.t + innerH * (1 - frac * 0.9);
              const v = frac * maxPayoff;
              return (
                <g key={`ygrid-${frac}`}>
                  <line x1={margin.l} y1={y} x2={svgW - margin.r} y2={y} stroke="#ffffff0f" strokeWidth={1} />
                  <text x={margin.l - 4} y={y + 4} fill="#ffffff40" fontSize={9} textAnchor="end">
                    {fmtK(v)}
                  </text>
                </g>
              );
            })}
            {/* X axis */}
            <line
              x1={margin.l}
              y1={margin.t + innerH}
              x2={svgW - margin.r}
              y2={margin.t + innerH}
              stroke="#ffffff20"
              strokeWidth={1}
            />
            {[rMin, sofrFwd - 1, sofrFwd, sofrFwd + 1, rMax].map((r) => (
              <text
                key={`xr-${r}`}
                x={xScale(r)}
                y={margin.t + innerH + 16}
                fill="#ffffff50"
                fontSize={9}
                textAnchor="middle"
              >
                {r.toFixed(1)}%
              </text>
            ))}
            {/* Strike line */}
            <line
              x1={xScale(strike)}
              y1={margin.t}
              x2={xScale(strike)}
              y2={margin.t + innerH}
              stroke="#f59e0b60"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
            <text
              x={xScale(strike) + 4}
              y={margin.t + 12}
              fill="#f59e0b80"
              fontSize={9}
            >
              K={strike.toFixed(2)}%
            </text>
            {/* Forward line */}
            <line
              x1={xScale(sofrFwd)}
              y1={margin.t}
              x2={xScale(sofrFwd)}
              y2={margin.t + innerH}
              stroke="#60a5fa60"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
            <text
              x={xScale(sofrFwd) + 4}
              y={margin.t + 24}
              fill="#60a5fa80"
              fontSize={9}
            >
              F={sofrFwd.toFixed(2)}%
            </text>
            {/* Payoff area */}
            <path
              d={`${payoffPath} L${xScale(rMax)},${margin.t + innerH} L${xScale(rMin)},${margin.t + innerH} Z`}
              fill={isPayer ? "#f472b620" : "#a78bfa20"}
            />
            <path d={payoffPath} fill="none" stroke={isPayer ? "#f472b6" : "#a78bfa"} strokeWidth={2} />
            {/* Premium line */}
            <line
              x1={margin.l}
              y1={yScale(result.price)}
              x2={svgW - margin.r}
              y2={yScale(result.price)}
              stroke="#34d39960"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text x={svgW - margin.r - 2} y={yScale(result.price) - 3} fill="#34d39980" fontSize={9} textAnchor="end">
              Premium
            </text>
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="bg-white/5 rounded p-2">
            <div className="text-white/40 mb-1">Moneyness</div>
            <div className={`font-mono font-semibold ${
              isPayer
                ? sofrFwd > strike ? "text-emerald-400" : "text-red-400"
                : sofrFwd < strike ? "text-emerald-400" : "text-red-400"
            }`}>
              {isPayer
                ? sofrFwd > strike ? "ITM" : sofrFwd === strike ? "ATM" : "OTM"
                : sofrFwd < strike ? "ITM" : sofrFwd === strike ? "ATM" : "OTM"}
            </div>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="text-white/40 mb-1">Intrinsic</div>
            <div className="font-mono font-semibold text-amber-400">
              {fmtK(Math.max(0, isPayer
                ? (sofrFwd / 100 - strike / 100) * annuity
                : (strike / 100 - sofrFwd / 100) * annuity))}
            </div>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="text-white/40 mb-1">Time Value</div>
            <div className="font-mono font-semibold text-primary">
              {fmtK(Math.max(0, result.price - Math.max(0, isPayer
                ? (sofrFwd / 100 - strike / 100) * annuity
                : (strike / 100 - sofrFwd / 100) * annuity)))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4: Cross-Currency Swaps
// ─────────────────────────────────────────────────────────────────────────────
function CrossCurrencyTab() {
  const [notionalUSD, setNotionalUSD] = useState(10_000_000);
  const [eurusd, setEurusd] = useState(1.085);
  const [usdRate, setUsdRate] = useState(5.2);
  const [eurRate, setEurRate] = useState(3.8);
  const [basisSpread, setBasisSpread] = useState(-15);
  const [tenor, setTenor] = useState(5);

  const notionalEUR = notionalUSD / eurusd;
  const effectiveEURRate = eurRate / 100 + basisSpread / 10000;

  // Semi-annual coupons
  const periods = tenor * 2;
  const dt = 0.5;

  interface CashFlow {
    t: number;
    usdFlow: number;
    eurFlow: number;
  }

  const cashFlows: CashFlow[] = useMemo(() => {
    const flows: CashFlow[] = [];
    for (let i = 1; i <= periods; i++) {
      const t = i * dt;
      const usdFlow = notionalUSD * (usdRate / 100) * dt;
      const eurFlow = -notionalEUR * effectiveEURRate * dt;
      flows.push({ t, usdFlow, eurFlow: eurFlow * eurusd }); // convert EUR flows to USD for comparison
    }
    // Add principal exchange at start and end
    return flows;
  }, [notionalUSD, usdRate, notionalEUR, effectiveEURRate, eurusd, periods]);

  // Approximate NPV
  const npv = useMemo(() => {
    let pv = 0;
    cashFlows.forEach(({ t, usdFlow, eurFlow }) => {
      const df = discountFactor(usdRate / 100, t);
      pv += (usdFlow + eurFlow) * df;
    });
    return pv;
  }, [cashFlows, usdRate]);

  // SVG cash flow diagram
  const svgW = 560;
  const svgH = 260;
  const midY = svgH / 2;
  const boxW = 100;
  const boxH = 40;

  const periods5 = [0, tenor * 0.25, tenor * 0.5, tenor * 0.75, tenor];
  const innerSvgW = svgW - 32;
  const xPos = (t: number) => 16 + (t / tenor) * innerSvgW;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Controls */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          Cross-Currency Swap
        </h3>

        <SliderRow
          label="Notional (USD)"
          value={notionalUSD}
          min={1_000_000}
          max={50_000_000}
          step={1_000_000}
          format={(v) => fmtK(v)}
          onChange={setNotionalUSD}
        />
        <SliderRow
          label="EUR/USD Rate"
          value={eurusd}
          min={0.9}
          max={1.3}
          step={0.001}
          format={(v) => v.toFixed(3)}
          onChange={setEurusd}
        />
        <SliderRow
          label="USD SOFR Rate"
          value={usdRate}
          min={0.5}
          max={10}
          step={0.1}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setUsdRate}
        />
        <SliderRow
          label="EUR €STR Rate"
          value={eurRate}
          min={0.5}
          max={8}
          step={0.1}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setEurRate}
        />
        <SliderRow
          label="Basis Spread (bps)"
          value={basisSpread}
          min={-60}
          max={20}
          step={1}
          format={(v) => `${v > 0 ? "+" : ""}${v} bps`}
          onChange={setBasisSpread}
        />
        <SliderRow
          label="Tenor (years)"
          value={tenor}
          min={1}
          max={10}
          step={1}
          format={(v) => `${v}Y`}
          onChange={setTenor}
        />

        <div className="pt-2 border-t border-white/10 space-y-2">
          <StatChip label="EUR Notional" value={`€${fmtK(notionalEUR).slice(1)}`} />
          <StatChip label="Eff. EUR Rate" value={`${(effectiveEURRate * 100).toFixed(3)}%`} />
          <StatChip label="Swap NPV" value={fmtK(npv)} positive={npv >= 0} />
          <StatChip label="Rate Differential" value={`${(usdRate - eurRate - basisSpread / 100).toFixed(2)}%`} />
        </div>
      </Card>

      {/* Diagram */}
      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-white/80">
          Cash Flow Structure
        </h3>

        {/* Schematic */}
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH}>
            {/* Timeline */}
            <line x1={30} y1={midY} x2={svgW - 30} y2={midY} stroke="#ffffff30" strokeWidth={1} />
            {/* Boxes at key dates */}
            {periods5.map((t, i) => {
              const x = xPos(t);
              return (
                <g key={`box-${i}`}>
                  <rect
                    x={x - boxW / 2}
                    y={midY - boxH / 2}
                    width={boxW}
                    height={boxH}
                    fill={i === 0 || i === 4 ? "#1e3a5f" : "#1a1f2e"}
                    rx={6}
                    stroke={i === 0 || i === 4 ? "#60a5fa50" : "#ffffff15"}
                    strokeWidth={1}
                  />
                  <text x={x} y={midY - 8} fill="#ffffff80" fontSize={9} textAnchor="middle">
                    {i === 0 ? "Start" : i === 4 ? "Maturity" : `Y${t.toFixed(0)}`}
                  </text>
                  <text x={x} y={midY + 4} fill="#60a5fa" fontSize={8} textAnchor="middle">
                    USD {fmtK(notionalUSD * (i === 0 || i === 4 ? 1 : (usdRate / 100) * dt * (tenor * 0.25)))}
                  </text>
                  <text x={x} y={midY + 14} fill="#34d399" fontSize={8} textAnchor="middle">
                    EUR {fmtK(notionalEUR * (i === 0 || i === 4 ? 1 : effectiveEURRate * dt * (tenor * 0.25))).slice(1)}
                  </text>
                </g>
              );
            })}
            {/* USD arrow top */}
            {periods5.slice(0, 4).map((t, i) => {
              const x1 = xPos(t) + boxW / 2 + 2;
              const x2 = xPos(periods5[i + 1]) - boxW / 2 - 2;
              const y = midY - boxH / 2 - 16;
              return (
                <g key={`ua-${i}`}>
                  <line x1={x1} y1={y} x2={x2} y2={y} stroke="#60a5fa80" strokeWidth={1.5} markerEnd="url(#arrowBlue)" />
                </g>
              );
            })}
            {/* EUR arrow bottom */}
            {periods5.slice(0, 4).map((t, i) => {
              const x1 = xPos(periods5[i + 1]) - boxW / 2 - 2;
              const x2 = xPos(t) + boxW / 2 + 2;
              const y = midY + boxH / 2 + 16;
              return (
                <g key={`ea-${i}`}>
                  <line x1={x1} y1={y} x2={x2} y2={y} stroke="#34d39980" strokeWidth={1.5} />
                </g>
              );
            })}
            {/* Arrow markers */}
            <defs>
              <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa80" />
              </marker>
            </defs>
            {/* Labels */}
            <text x={svgW / 2} y={midY - boxH / 2 - 24} fill="#60a5fa80" fontSize={9} textAnchor="middle">
              USD payments (pay SOFR + spread)
            </text>
            <text x={svgW / 2} y={midY + boxH / 2 + 30} fill="#34d39980" fontSize={9} textAnchor="middle">
              EUR payments (receive €STR + basis)
            </text>
          </svg>
        </div>

        {/* Cash flow table */}
        <div>
          <p className="text-xs text-white/40 mb-2">Semi-Annual Cash Flows (USD equivalent)</p>
          <div className="grid grid-cols-4 gap-1.5">
            {cashFlows.slice(0, 12).map(({ t, usdFlow, eurFlow }, i) => {
              const net = usdFlow + eurFlow;
              return (
                <div
                  key={`cf-${i}`}
                  className={`rounded p-1.5 ${
                    net >= 0
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <div className="text-[11px] text-white/40">{`Y${t.toFixed(1)}`}</div>
                  <div className="text-[11px] text-primary">{fmtK(usdFlow)}</div>
                  <div className="text-[11px] text-emerald-300">{fmtK(eurFlow)}</div>
                  <div className={`text-xs font-mono font-semibold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtK(net)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 5: Duration Hedging
// ─────────────────────────────────────────────────────────────────────────────
function DurationHedgingTab() {
  const [swapNotional, setSwapNotional] = useState(50_000_000);
  const [swapTenor, setSwapTenor] = useState(10);
  const [swapFixedRate, setSwapFixedRate] = useState(4.5);
  const [sofrRate, setSofrRate] = useState(5.0);
  const [futuresCtv, setFuturesCtv] = useState(100_000);
  const [futuresDuration, setFuturesDuration] = useState(6.5);
  const [basisRisk, setBasisRisk] = useState(0.85);

  // DV01 of swap: approximate as modified duration × notional × 0.0001
  // For IRS, fixed leg drives duration; mod_dur ≈ tenor * 0.9 (simplified)
  const swapDV01 = useMemo(() => {
    const modDur = swapTenor * 0.88; // approximate
    return swapNotional * modDur * 0.0001;
  }, [swapNotional, swapTenor]);

  // DV01 per Treasury futures contract
  const futuresDV01 = futuresCtv * futuresDuration * 0.0001;

  // Hedge ratio (number of futures contracts)
  const hedgeRatio = (swapDV01 / futuresDV01) * basisRisk;
  const hedgeContracts = Math.round(hedgeRatio);

  // P&L for parallel shift
  const scenarios = useMemo(() => {
    return [-100, -50, -25, -10, -5, 0, 5, 10, 25, 50, 100].map((shift) => {
      const swapPnL = -swapDV01 * shift; // pay-fixed: positive when rates fall... wait
      // If holding a receive-fixed swap, DV01 is positive — rates up → negative PnL
      const swapPnLRcvFixed = -swapDV01 * shift;
      // Short futures hedge: futures price falls when rates rise → profit from short
      const futuresPnL = hedgeContracts * futuresDV01 * -shift; // short hedge
      const netPnL = swapPnLRcvFixed + futuresPnL * basisRisk;
      return { shift, swapPnL: swapPnLRcvFixed, futuresPnL, netPnL };
    });
  }, [swapDV01, futuresDV01, hedgeContracts, basisRisk]);

  // SVG P&L chart
  const svgW = 560;
  const svgH = 240;
  const margin = { l: 72, r: 16, t: 20, b: 40 };
  const innerW = svgW - margin.l - margin.r;
  const innerH = svgH - margin.t - margin.b;
  const maxPnL = Math.max(...scenarios.map((s) => Math.abs(s.swapPnL)), 1);

  const xScale = (i: number) =>
    margin.l + (i / (scenarios.length - 1)) * innerW;
  const yScale = (v: number) =>
    margin.t + innerH / 2 - (v / maxPnL) * (innerH / 2) * 0.88;

  function makeLine(getter: (s: typeof scenarios[0]) => number): string {
    return scenarios.map((s, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(getter(s))}`).join(" ");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Controls */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Hedge Parameters
        </h3>

        <div className="text-xs text-white/40 uppercase tracking-wide">Swap Portfolio</div>
        <SliderRow
          label="Swap Notional"
          value={swapNotional}
          min={5_000_000}
          max={200_000_000}
          step={5_000_000}
          format={(v) => fmtK(v)}
          onChange={setSwapNotional}
        />
        <SliderRow
          label="Swap Tenor (Y)"
          value={swapTenor}
          min={1}
          max={30}
          step={1}
          format={(v) => `${v}Y`}
          onChange={setSwapTenor}
        />
        <SliderRow
          label="Fixed Rate"
          value={swapFixedRate}
          min={1}
          max={10}
          step={0.1}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setSwapFixedRate}
        />
        <SliderRow
          label="SOFR Rate"
          value={sofrRate}
          min={0.5}
          max={10}
          step={0.1}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setSofrRate}
        />

        <div className="text-xs text-white/40 uppercase tracking-wide pt-2 border-t border-white/10">Treasury Futures</div>
        <SliderRow
          label="Contract Value ($)"
          value={futuresCtv}
          min={50_000}
          max={200_000}
          step={10_000}
          format={(v) => fmtK(v)}
          onChange={setFuturesCtv}
        />
        <SliderRow
          label="Futures Duration"
          value={futuresDuration}
          min={2}
          max={15}
          step={0.5}
          format={(v) => `${v.toFixed(1)}`}
          onChange={setFuturesDuration}
        />
        <SliderRow
          label="Basis Risk (ρ)"
          value={basisRisk}
          min={0.5}
          max={1.0}
          step={0.01}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          onChange={setBasisRisk}
        />

        <div className="pt-2 border-t border-white/10 space-y-2">
          <StatChip label="Swap DV01" value={fmtK(swapDV01)} />
          <StatChip label="Futures DV01" value={`$${fmt(futuresDV01, 0)}`} />
          <StatChip label="Hedge Ratio" value={`${hedgeContracts} contracts`} />
          <StatChip label="Hedge Eff." value={`${(basisRisk * 100).toFixed(0)}%`} />
        </div>
      </Card>

      {/* P&L analysis */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white/80">
          P&amp;L Sensitivity — Parallel Rate Shift
        </h3>

        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const v = (frac - 0.5) * maxPnL * 1.76;
              const y = yScale(v);
              return (
                <g key={`hg-${frac}`}>
                  <line x1={margin.l} y1={y} x2={svgW - margin.r} y2={y} stroke="#ffffff0f" strokeWidth={1} />
                  <text x={margin.l - 4} y={y + 4} fill="#ffffff40" fontSize={9} textAnchor="end">
                    {fmtK(v)}
                  </text>
                </g>
              );
            })}
            {/* Zero line */}
            <line
              x1={margin.l}
              y1={margin.t + innerH / 2}
              x2={svgW - margin.r}
              y2={margin.t + innerH / 2}
              stroke="#ffffff20"
              strokeWidth={1}
            />
            {/* X axis labels */}
            {scenarios.map((s, i) => (
              <text
                key={`xs-${i}`}
                x={xScale(i)}
                y={margin.t + innerH + 16}
                fill="#ffffff40"
                fontSize={8}
                textAnchor="middle"
              >
                {s.shift > 0 ? `+${s.shift}` : s.shift}
              </text>
            ))}
            <text
              x={xScale(scenarios.length / 2)}
              y={svgH - 4}
              fill="#ffffff30"
              fontSize={9}
              textAnchor="middle"
            >
              Rate shift (bps)
            </text>
            {/* Swap P&L line */}
            <path
              d={makeLine((s) => s.swapPnL)}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
            />
            {/* Futures P&L line */}
            <path
              d={makeLine((s) => s.futuresPnL)}
              fill="none"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
            {/* Net P&L line */}
            <path
              d={makeLine((s) => s.netPnL)}
              fill="none"
              stroke="#34d399"
              strokeWidth={2.5}
            />
            {/* Legend */}
            <line x1={margin.l} y1={svgH - 8} x2={margin.l + 20} y2={svgH - 8} stroke="#ef4444" strokeWidth={2} />
            <text x={margin.l + 24} y={svgH - 4} fill="#ffffff60" fontSize={9}>Swap</text>
            <line x1={margin.l + 70} y1={svgH - 8} x2={margin.l + 90} y2={svgH - 8} stroke="#60a5fa" strokeWidth={2} strokeDasharray="4 2" />
            <text x={margin.l + 94} y={svgH - 4} fill="#ffffff60" fontSize={9}>Futures</text>
            <line x1={margin.l + 150} y1={svgH - 8} x2={margin.l + 170} y2={svgH - 8} stroke="#34d399" strokeWidth={2.5} />
            <text x={margin.l + 174} y={svgH - 4} fill="#ffffff60" fontSize={9}>Net</text>
          </svg>
        </div>

        {/* Scenario table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-1 text-white/40">Shift (bps)</th>
                <th className="text-right py-1 text-red-400">Swap P&L</th>
                <th className="text-right py-1 text-primary">Futures P&L</th>
                <th className="text-right py-1 text-emerald-400">Net P&L</th>
                <th className="text-right py-1 text-white/40">Residual %</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.filter((_, i) => i % 2 === 0).map((s, i) => (
                <tr key={`sr-${i}`} className="border-b border-white/5 hover:bg-muted/30">
                  <td className="py-1 font-mono text-white/70">
                    {s.shift > 0 ? `+${s.shift}` : s.shift} bps
                  </td>
                  <td className={`py-1 font-mono text-right ${s.swapPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtK(s.swapPnL)}
                  </td>
                  <td className={`py-1 font-mono text-right ${s.futuresPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtK(s.futuresPnL)}
                  </td>
                  <td className={`py-1 font-mono text-right ${s.netPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtK(s.netPnL)}
                  </td>
                  <td className="py-1 font-mono text-right text-white/50">
                    {s.swapPnL !== 0 ? `${fmt(Math.abs(s.netPnL / s.swapPnL) * 100, 1)}%` : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-[11px] text-amber-200/70 leading-relaxed">
            <Info className="inline w-3 h-3 mr-1 mb-0.5" />
            DV01 (Dollar Value of a Basis Point) measures P&amp;L for a 1 bps rate move.
            The hedge ratio = Swap DV01 / Futures DV01 × ρ, where ρ captures basis risk
            (imperfect correlation between swap rates and Treasury futures).
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function RatesLabPage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-border flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-white">Rates Lab</h1>
              <Badge variant="outline" className="text-xs border-border text-primary">
                Interest Rate Derivatives
              </Badge>
            </div>
            <p className="text-sm text-white/40 ml-11">
              Interactive IRS pricing, swap curve bootstrapping, swaptions, cross-currency swaps &amp; duration hedging
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="swap-pricer" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="swap-pricer" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <ArrowLeftRight className="w-3 h-3 mr-1.5" />
              Swap Pricer
            </TabsTrigger>
            <TabsTrigger value="swap-curve" className="text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <TrendingUp className="w-3 h-3 mr-1.5" />
              Swap Curve
            </TabsTrigger>
            <TabsTrigger value="swaption" className="text-xs data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300">
              <BarChart3 className="w-3 h-3 mr-1.5" />
              Swaption Pricing
            </TabsTrigger>
            <TabsTrigger value="xccy" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-muted-foreground">
              <Globe className="w-3 h-3 mr-1.5" />
              Cross-Currency
            </TabsTrigger>
            <TabsTrigger value="hedging" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Shield className="w-3 h-3 mr-1.5" />
              Duration Hedging
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap-pricer" className="mt-0">
            <SwapPricerTab />
          </TabsContent>
          <TabsContent value="swap-curve" className="mt-0">
            <SwapCurveTab />
          </TabsContent>
          <TabsContent value="swaption" className="mt-0">
            <SwaptionTab />
          </TabsContent>
          <TabsContent value="xccy" className="mt-0">
            <CrossCurrencyTab />
          </TabsContent>
          <TabsContent value="hedging" className="mt-0">
            <DurationHedgingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
