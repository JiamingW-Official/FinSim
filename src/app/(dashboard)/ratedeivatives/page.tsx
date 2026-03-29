"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Calculator,
  ArrowLeftRight,
  Layers,
  Thermometer,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Percent,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 824;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed = 824) {
  s = seed;
}

// ── Math helpers ──────────────────────────────────────────────────────────────

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

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function discountFactor(rate: number, years: number): number {
  return Math.exp(-rate * years);
}

// Par swap rate: rate at which fixed leg PV = floating leg PV
function parSwapRate(curveRate: number, tenor: number): number {
  const r = curveRate / 100;
  let annuity = 0;
  for (let t = 1; t <= tenor; t++) {
    annuity += discountFactor(r, t);
  }
  const par = (1 - discountFactor(r, tenor)) / annuity;
  return par * 100;
}

// Swap NPV (from receiver perspective: receive fixed, pay floating)
function swapNPV(
  notional: number,
  fixedRate: number,
  currentRate: number,
  tenor: number,
  payFixed: boolean
): number {
  const r = currentRate / 100;
  const fR = fixedRate / 100;
  let pvFixed = 0;
  let pvFloat = 0;
  for (let t = 1; t <= tenor; t++) {
    const df = discountFactor(r, t);
    pvFixed += notional * fR * df;
    pvFloat += notional * r * df;
  }
  pvFixed += notional * discountFactor(r, tenor);
  pvFloat += notional * discountFactor(r, tenor);
  const netPV = pvFixed - pvFloat;
  return payFixed ? -netPV : netPV;
}

// DV01: dollar value of 1 basis point (sensitivity to +1bp)
function computeDV01(notional: number, tenor: number, rate: number): number {
  const r = rate / 100;
  const rUp = (rate + 0.01) / 100;
  const rDn = (rate - 0.01) / 100;
  let pvUp = 0;
  let pvDn = 0;
  for (let t = 1; t <= tenor; t++) {
    pvUp += notional * r * discountFactor(rUp, t);
    pvDn += notional * r * discountFactor(rDn, t);
  }
  pvUp += notional * discountFactor(rUp, tenor);
  pvDn += notional * discountFactor(rDn, tenor);
  return Math.abs((pvUp - pvDn) / 2);
}

// Black-76 swaption pricing
function black76Swaption(
  F: number,
  K: number,
  T: number,
  vol: number,
  annuity: number,
  isPayer: boolean
): number {
  if (T <= 0 || vol <= 0 || F <= 0 || K <= 0)
    return Math.max(0, isPayer ? (F - K) * annuity : (K - F) * annuity);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(F / K) + 0.5 * vol * vol * T) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  if (isPayer) {
    return annuity * (F * normalCDF(d1) - K * normalCDF(d2));
  } else {
    return annuity * (K * normalCDF(-d2) - F * normalCDF(-d1));
  }
}

// Black-76 caplet/floorlet pricing
function black76Caplet(
  F: number,
  K: number,
  T: number,
  vol: number,
  df: number,
  tau: number,
  isCap: boolean
): number {
  if (T <= 0 || vol <= 0 || F <= 0 || K <= 0)
    return Math.max(0, isCap ? F - K : K - F) * df * tau;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(F / K) + 0.5 * vol * vol * T) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  if (isCap) {
    return df * tau * (F * normalCDF(d1) - K * normalCDF(d2));
  } else {
    return df * tau * (K * normalCDF(-d2) - F * normalCDF(-d1));
  }
}

// Swaption delta (dPrice/dF)
function swaptionDelta(
  F: number,
  K: number,
  T: number,
  vol: number,
  annuity: number,
  isPayer: boolean
): number {
  if (T <= 0 || vol <= 0 || F <= 0 || K <= 0) return isPayer ? 1 : -1;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(F / K) + 0.5 * vol * vol * T) / (vol * sqrtT);
  return isPayer ? annuity * normalCDF(d1) : -annuity * normalCDF(-d1);
}

// Swaption vega (dPrice/dvol)
function swaptionVega(
  F: number,
  K: number,
  T: number,
  vol: number,
  annuity: number
): number {
  if (T <= 0 || vol <= 0 || F <= 0 || K <= 0) return 0;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(F / K) + 0.5 * vol * vol * T) / (vol * sqrtT);
  return annuity * F * normalPDF(d1) * sqrtT;
}

// SABR vol approximation (Hagan et al.)
function sabrVol(
  F: number,
  K: number,
  T: number,
  alpha: number,
  beta: number,
  rho: number,
  nu: number
): number {
  if (T <= 0) return alpha;
  const eps = 1e-7;
  const FK = Math.max(F * K, eps);
  const FKb = Math.pow(FK, (1 - beta) / 2);

  let z: number;
  let xz: number;

  if (Math.abs(F - K) < eps) {
    // ATM approximation
    const A = FKb;
    const B =
      1 +
      ((1 - beta) * (1 - beta) / 24) * (alpha * alpha) / (FKb * FKb) +
      (rho * beta * nu * alpha) / (4 * FKb) +
      ((2 - 3 * rho * rho) / 24) * nu * nu;
    return (alpha / A) * B;
  }

  z = (nu / alpha) * FKb * Math.log(F / K);
  const sqrtZ = Math.sqrt(1 - 2 * rho * z + z * z);
  xz = Math.log((sqrtZ + z - rho) / (1 - rho));

  const logFK = Math.log(F / K);
  const A = FKb * (1 + ((1 - beta) * (1 - beta) / 24) * logFK * logFK + ((1 - beta) ** 4 / 1920) * logFK ** 4);
  const B =
    1 +
    ((1 - beta) * (1 - beta) / 24) * (alpha * alpha) / (FKb * FKb) +
    (rho * beta * nu * alpha) / (4 * FKb) +
    ((2 - 3 * rho * rho) / 24) * nu * nu;

  return Math.max(0.001, (alpha / A) * (z / (xz || 1)) * B);
}

// ── Data generation ───────────────────────────────────────────────────────────

interface RateCurvePoint {
  tenor: string;
  years: number;
  rate: number;
}

function generateRateCurve(): RateCurvePoint[] {
  resetSeed(824);
  const base = [
    { tenor: "1Y", years: 1 },
    { tenor: "2Y", years: 2 },
    { tenor: "3Y", years: 3 },
    { tenor: "5Y", years: 5 },
    { tenor: "7Y", years: 7 },
    { tenor: "10Y", years: 10 },
    { tenor: "15Y", years: 15 },
    { tenor: "20Y", years: 20 },
    { tenor: "30Y", years: 30 },
  ];
  // Normal upward sloping curve from ~4.2% to ~5.1%
  return base.map((b) => ({
    ...b,
    rate: 4.2 + (b.years / 30) * 0.9 + (rand() - 0.5) * 0.1,
  }));
}

interface TreasuryCurvePoint {
  tenor: string;
  years: number;
  treasuryRate: number;
  swapRate: number;
  spread: number;
}

function generateSwapSpreads(curve: RateCurvePoint[]): TreasuryCurvePoint[] {
  return curve.map((c) => {
    const treasuryRate = c.rate - (0.05 + rand() * 0.25); // swap spread
    return {
      tenor: c.tenor,
      years: c.years,
      treasuryRate,
      swapRate: c.rate,
      spread: Math.round((c.rate - treasuryRate) * 100),
    };
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CashflowBar {
  period: number;
  fixed: number;
  floating: number;
  net: number;
}

interface SwaptionGridCell {
  expiry: number;
  tenor: number;
  vol: number;
  price: number;
}

interface CapletBar {
  period: number;
  t: number;
  forwardRate: number;
  capletPV: number;
  floorletPV: number;
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className="bg-muted/60 border border-border/50 rounded-md p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div
        className={`text-xl font-semibold tabular-nums ${
          positive === undefined
            ? "text-foreground"
            : positive
            ? "text-emerald-400"
            : "text-red-400"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-muted-foreground text-xs">{sub}</div>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-muted-foreground mb-3 mt-1">
      {children}
    </div>
  );
}

function fmtNum(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// ── Cashflow Timeline SVG ─────────────────────────────────────────────────────

function CashflowTimeline({
  bars,
  payFixed,
}: {
  bars: CashflowBar[];
  payFixed: boolean;
}) {
  const W = 600;
  const H = 180;
  const PAD = { top: 20, bottom: 40, left: 50, right: 20 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxAbs = Math.max(...bars.map((b) => Math.max(Math.abs(b.fixed), Math.abs(b.floating))), 1);
  const midY = PAD.top + innerH / 2;
  const barW = Math.max(6, innerW / bars.length - 8);

  const scaleY = (v: number) => midY - (v / maxAbs) * (innerH / 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Axes */}
      <line x1={PAD.left} y1={midY} x2={W - PAD.right} y2={midY} stroke="#52525b" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />

      {/* Y labels */}
      <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" fill="#71717a" fontSize="9">+max</text>
      <text x={PAD.left - 6} y={H - PAD.bottom - 2} textAnchor="end" fill="#71717a" fontSize="9">-max</text>
      <text x={PAD.left - 6} y={midY + 4} textAnchor="end" fill="#71717a" fontSize="9">0</text>

      {bars.map((bar, i) => {
        const x = PAD.left + (i / bars.length) * innerW + (innerW / bars.length) * 0.15;
        const fixedH = Math.abs(bar.fixed / maxAbs) * (innerH / 2);
        const floatH = Math.abs(bar.floating / maxAbs) * (innerH / 2);

        const fixedIsInflow = payFixed ? bar.fixed < 0 : bar.fixed > 0;
        const floatIsInflow = payFixed ? bar.floating > 0 : bar.floating < 0;

        return (
          <g key={i}>
            {/* Fixed leg bar */}
            <rect
              x={x}
              y={fixedIsInflow ? midY - fixedH : midY}
              width={barW / 2 - 1}
              height={fixedH}
              fill={fixedIsInflow ? "#34d399" : "#f87171"}
              opacity={0.85}
              rx={1}
            />
            {/* Floating leg bar */}
            <rect
              x={x + barW / 2}
              y={floatIsInflow ? midY - floatH : midY}
              width={barW / 2 - 1}
              height={floatH}
              fill={floatIsInflow ? "#60a5fa" : "#fb923c"}
              opacity={0.85}
              rx={1}
            />
            {/* Period label */}
            <text
              x={x + barW / 2}
              y={H - PAD.bottom + 14}
              textAnchor="middle"
              fill="#71717a"
              fontSize="8"
            >
              Y{bar.period}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={PAD.left + 2} y={PAD.top - 14} width={8} height={8} fill="#34d399" rx={1} />
      <text x={PAD.left + 14} y={PAD.top - 7} fill="#a1a1aa" fontSize="8">Fixed In</text>
      <rect x={PAD.left + 64} y={PAD.top - 14} width={8} height={8} fill="#60a5fa" rx={1} />
      <text x={PAD.left + 76} y={PAD.top - 7} fill="#a1a1aa" fontSize="8">Float In</text>
      <rect x={PAD.left + 128} y={PAD.top - 14} width={8} height={8} fill="#f87171" rx={1} />
      <text x={PAD.left + 140} y={PAD.top - 7} fill="#a1a1aa" fontSize="8">Fixed Out</text>
      <rect x={PAD.left + 196} y={PAD.top - 14} width={8} height={8} fill="#fb923c" rx={1} />
      <text x={PAD.left + 208} y={PAD.top - 7} fill="#a1a1aa" fontSize="8">Float Out</text>
    </svg>
  );
}

// ── MTM vs Shift chart ────────────────────────────────────────────────────────

function MTMChart({
  notional,
  fixedRate,
  currentRate,
  tenor,
  payFixed,
}: {
  notional: number;
  fixedRate: number;
  currentRate: number;
  tenor: number;
  payFixed: boolean;
}) {
  const W = 560;
  const H = 180;
  const PAD = { top: 20, bottom: 36, left: 62, right: 20 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const shifts = Array.from({ length: 41 }, (_, i) => (i - 20) * 25); // -500 to +500 bps
  const pvs = shifts.map((sh) => swapNPV(notional, fixedRate, currentRate + sh / 100, tenor, payFixed));
  const minPV = Math.min(...pvs);
  const maxPV = Math.max(...pvs);
  const range = maxPV - minPV || 1;

  const scaleX = (i: number) => PAD.left + (i / (shifts.length - 1)) * innerW;
  const scaleY = (v: number) => PAD.top + innerH - ((v - minPV) / range) * innerH;

  const zeroY = scaleY(0);
  const pathPoints = shifts.map((_, i) => `${scaleX(i)},${scaleY(pvs[i])}`).join(" ");
  const polyline = `M ${pathPoints.replace(/ /g, " L ")}`;

  // area fill
  const areaPoints = `${scaleX(0)},${zeroY} ` + shifts.map((_, i) => `${scaleX(i)},${scaleY(pvs[i])}`).join(" ") + ` ${scaleX(shifts.length - 1)},${zeroY}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* zero line */}
      <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />
      {/* axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />

      {/* area */}
      <polygon points={areaPoints} fill="url(#mtmGrad)" opacity="0.25" />
      <defs>
        <linearGradient id="mtmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* line */}
      <path d={pathPoints.length > 0 ? "M " + pathPoints.replace(/ /g, " L ") : ""} stroke="#818cf8" strokeWidth="2" fill="none" />

      {/* current marker */}
      {(() => {
        const midI = 20;
        const cx = scaleX(midI);
        const cy = scaleY(pvs[midI]);
        return (
          <>
            <circle cx={cx} cy={cy} r={4} fill="#a78bfa" stroke="#1e1b4b" strokeWidth="1.5" />
            <text x={cx + 6} y={cy - 4} fill="#c4b5fd" fontSize="9">Current</text>
          </>
        );
      })()}

      {/* X axis labels */}
      {[-500, -250, 0, 250, 500].map((bps) => {
        const idx = shifts.indexOf(bps);
        if (idx < 0) return null;
        const x = scaleX(idx);
        return (
          <text key={bps} x={x} y={H - PAD.bottom + 14} textAnchor="middle" fill="#71717a" fontSize="9">
            {bps > 0 ? "+" : ""}{bps}
          </text>
        );
      })}
      <text x={(PAD.left + W - PAD.right) / 2} y={H - 2} textAnchor="middle" fill="#52525b" fontSize="8">
        Rate Shift (bps)
      </text>

      {/* Y axis labels */}
      {[minPV, 0, maxPV].map((v, ii) => (
        <text key={ii} x={PAD.left - 4} y={scaleY(v) + 4} textAnchor="end" fill="#71717a" fontSize="8">
          {fmtK(v)}
        </text>
      ))}
    </svg>
  );
}

// ── Swaption Expiry×Tenor Grid ────────────────────────────────────────────────

function SwaptionGrid({
  cells,
  selectedExpiry,
  selectedTenor,
  onSelect,
}: {
  cells: SwaptionGridCell[];
  selectedExpiry: number;
  selectedTenor: number;
  onSelect: (exp: number, ten: number) => void;
}) {
  const expiries = [...new Set(cells.map((c) => c.expiry))].sort((a, b) => a - b);
  const tenors = [...new Set(cells.map((c) => c.tenor))].sort((a, b) => a - b);
  const maxVol = Math.max(...cells.map((c) => c.vol));
  const minVol = Math.min(...cells.map((c) => c.vol));

  function volColor(v: number): string {
    const t = (v - minVol) / (maxVol - minVol || 1);
    // blue (low) → purple → red (high)
    const r = Math.round(59 + t * 196);
    const g = Math.round(130 - t * 90);
    const b = Math.round(246 - t * 186);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs text-muted-foreground border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-muted-foreground text-left pr-3 pb-2 font-normal">Exp\Tenor</th>
            {tenors.map((t) => (
              <th key={t} className="text-muted-foreground font-semibold pb-2 text-center w-14">
                {t}Y
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {expiries.map((exp) => (
            <tr key={exp}>
              <td className="text-muted-foreground font-medium pr-3 text-right">{exp}Y</td>
              {tenors.map((ten) => {
                const cell = cells.find((c) => c.expiry === exp && c.tenor === ten);
                if (!cell) return <td key={ten} />;
                const isSelected = exp === selectedExpiry && ten === selectedTenor;
                return (
                  <td key={ten}>
                    <button
                      onClick={() => onSelect(exp, ten)}
                      className={`w-14 h-10 rounded flex flex-col items-center justify-center transition-all ${
                        isSelected ? "ring-2 ring-foreground/60" : ""
                      }`}
                      style={{ backgroundColor: volColor(cell.vol) + (isSelected ? "" : "bb") }}
                    >
                      <span className="text-foreground font-bold text-xs leading-none">{cell.vol.toFixed(1)}%</span>
                      <span className="text-foreground/70 text-[11px] leading-none mt-0.5">{fmtK(cell.price)}</span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Caplet Waterfall SVG ──────────────────────────────────────────────────────

function CapletWaterfall({ bars, isCap }: { bars: CapletBar[]; isCap: boolean }) {
  const W = 580;
  const H = 180;
  const PAD = { top: 24, bottom: 36, left: 54, right: 16 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...bars.map((b) => (isCap ? b.capletPV : b.floorletPV)), 0.001);
  const barW = Math.max(6, innerW / bars.length - 6);

  const scaleY = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  let cumX = PAD.left;
  const baseX = (i: number) => PAD.left + (i / bars.length) * innerW + (innerW / bars.length) * 0.1;

  // cumulative sum for staircase
  let runningSum = 0;
  const cumulativePositions: number[] = [];
  bars.forEach((b) => {
    cumulativePositions.push(runningSum);
    runningSum += isCap ? b.capletPV : b.floorletPV;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />

      {bars.map((bar, i) => {
        const pv = isCap ? bar.capletPV : bar.floorletPV;
        const x = baseX(i);
        const h = Math.max(2, (pv / maxVal) * innerH);
        const y = H - PAD.bottom - h;
        const hue = isCap ? "#34d399" : "#60a5fa";
        const intensity = 0.4 + (pv / maxVal) * 0.6;

        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={hue} opacity={intensity} rx={2} />
            {/* forward rate label on top of taller bars */}
            {pv / maxVal > 0.15 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill="#a1a1aa" fontSize="7.5">
                {bar.forwardRate.toFixed(2)}%
              </text>
            )}
            <text x={x + barW / 2} y={H - PAD.bottom + 13} textAnchor="middle" fill="#71717a" fontSize="8">
              Y{bar.period}
            </text>
          </g>
        );
      })}

      {/* Y labels */}
      <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fill="#71717a" fontSize="8">
        {fmtK(maxVal)}
      </text>
      <text x={PAD.left - 4} y={H - PAD.bottom} textAnchor="end" fill="#71717a" fontSize="8">
        $0
      </text>
      <text x={(PAD.left + W - PAD.right) / 2} y={H - 2} textAnchor="middle" fill="#52525b" fontSize="8">
        Caplet PV by Payment Period (notional $1M)
      </text>
    </svg>
  );
}

// ── SABR Vol Surface (SVG Heatmap) ────────────────────────────────────────────

function VolSurfaceHeatmap({
  tenors,
  strikes,
  volMatrix,
  selectedTenorIdx,
  onSelectTenor,
}: {
  tenors: number[];
  strikes: number[];
  volMatrix: number[][];
  selectedTenorIdx: number;
  onSelectTenor: (i: number) => void;
}) {
  const cellW = 52;
  const cellH = 28;
  const labelW = 40;
  const labelH = 24;
  const W = labelW + tenors.length * cellW + 16;
  const H = labelH + strikes.length * cellH + 16;

  const allVols = volMatrix.flat();
  const minV = Math.min(...allVols);
  const maxV = Math.max(...allVols);

  function heatColor(v: number): string {
    const t = (v - minV) / (maxV - minV || 1);
    // cool (blue) to warm (red)
    const r = Math.round(30 + t * 210);
    const g = Math.round(100 - t * 50);
    const b = Math.round(200 - t * 155);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-full">
      {/* Tenor headers */}
      {tenors.map((ten, ti) => (
        <g key={ti} style={{ cursor: "pointer" }} onClick={() => onSelectTenor(ti)}>
          <rect
            x={labelW + ti * cellW}
            y={0}
            width={cellW - 2}
            height={labelH - 2}
            fill={ti === selectedTenorIdx ? "#4f46e5" : "#27272a"}
            rx={3}
          />
          <text
            x={labelW + ti * cellW + (cellW - 2) / 2}
            y={labelH - 8}
            textAnchor="middle"
            fill={ti === selectedTenorIdx ? "#fff" : "#a1a1aa"}
            fontSize="10"
            fontWeight={ti === selectedTenorIdx ? "700" : "400"}
          >
            {ten}Y
          </text>
        </g>
      ))}

      {/* Strike labels */}
      {strikes.map((k, ki) => (
        <text
          key={ki}
          x={labelW - 4}
          y={labelH + ki * cellH + cellH / 2 + 4}
          textAnchor="end"
          fill="#71717a"
          fontSize="9"
        >
          {k.toFixed(2)}%
        </text>
      ))}

      {/* Heatmap cells */}
      {volMatrix.map((row, ki) =>
        row.map((v, ti) => {
          const isSelectedCol = ti === selectedTenorIdx;
          return (
            <g key={`${ki}-${ti}`} style={{ cursor: "pointer" }} onClick={() => onSelectTenor(ti)}>
              <rect
                x={labelW + ti * cellW}
                y={labelH + ki * cellH}
                width={cellW - 2}
                height={cellH - 2}
                fill={heatColor(v)}
                opacity={isSelectedCol ? 1 : 0.75}
                rx={2}
              />
              <text
                x={labelW + ti * cellW + (cellW - 2) / 2}
                y={labelH + ki * cellH + cellH / 2 + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="8.5"
                fontWeight="500"
              >
                {v.toFixed(1)}%
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ── Vol Smile SVG ─────────────────────────────────────────────────────────────

function VolSmileChart({
  strikes,
  logNormalVols,
  normalVols,
  showNormal,
  atmStrike,
}: {
  strikes: number[];
  logNormalVols: number[];
  normalVols: number[];
  showNormal: boolean;
  atmStrike: number;
}) {
  const W = 480;
  const H = 200;
  const PAD = { top: 20, bottom: 40, left: 54, right: 20 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const vols = showNormal ? normalVols : logNormalVols;
  const minV = Math.min(...vols) * 0.95;
  const maxV = Math.max(...vols) * 1.05;
  const minK = Math.min(...strikes);
  const maxK = Math.max(...strikes);

  const scaleX = (k: number) => PAD.left + ((k - minK) / (maxK - minK || 1)) * innerW;
  const scaleY = (v: number) => PAD.top + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;

  const linePoints = strikes.map((k, i) => `${scaleX(k)},${scaleY(vols[i])}`).join(" L ");
  const areaPoints =
    `${scaleX(strikes[0])},${PAD.top + innerH} ` +
    strikes.map((k, i) => `${scaleX(k)},${scaleY(vols[i])}`).join(" ") +
    ` ${scaleX(strikes[strikes.length - 1])},${PAD.top + innerH}`;

  const atmX = scaleX(atmStrike);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="smileGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />

      {/* ATM line */}
      <line x1={atmX} y1={PAD.top} x2={atmX} y2={H - PAD.bottom} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
      <text x={atmX + 3} y={PAD.top + 10} fill="#818cf8" fontSize="8">ATM</text>

      {/* area + line */}
      <polygon points={areaPoints} fill="url(#smileGrad)" />
      <polyline points={linePoints} fill="none" stroke="#a78bfa" strokeWidth="2.5" />

      {/* dots */}
      {strikes.map((k, i) => (
        <circle key={i} cx={scaleX(k)} cy={scaleY(vols[i])} r={3} fill="#c4b5fd" />
      ))}

      {/* X ticks */}
      {strikes.map((k, i) => (
        <text key={i} x={scaleX(k)} y={H - PAD.bottom + 14} textAnchor="middle" fill="#71717a" fontSize="8.5">
          {k.toFixed(2)}
        </text>
      ))}
      <text x={(PAD.left + W - PAD.right) / 2} y={H - 4} textAnchor="middle" fill="#52525b" fontSize="8">
        Strike Rate (%)
      </text>

      {/* Y ticks */}
      {[minV, (minV + maxV) / 2, maxV].map((v, ii) => (
        <text key={ii} x={PAD.left - 4} y={scaleY(v) + 4} textAnchor="end" fill="#71717a" fontSize="8">
          {v.toFixed(1)}%
        </text>
      ))}
      <text
        x={10}
        y={(PAD.top + H - PAD.bottom) / 2}
        textAnchor="middle"
        fill="#52525b"
        fontSize="8"
        transform={`rotate(-90, 10, ${(PAD.top + H - PAD.bottom) / 2})`}
      >
        {showNormal ? "Normal Vol (bp/yr)" : "Log-Normal Vol (%)"}
      </text>
    </svg>
  );
}

// ── Cap vs Collar comparison bar chart ───────────────────────────────────────

function CapCollarChart({
  capPremium,
  floorPremium,
  collarCost,
}: {
  capPremium: number;
  floorPremium: number;
  collarCost: number;
}) {
  const W = 380;
  const H = 140;
  const PAD = { top: 16, bottom: 36, left: 60, right: 16 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const items = [
    { label: "Cap", value: capPremium, color: "#34d399" },
    { label: "Floor", value: floorPremium, color: "#60a5fa" },
    { label: "Collar (net)", value: collarCost, color: collarCost >= 0 ? "#fb923c" : "#a78bfa" },
  ];
  const maxAbs = Math.max(...items.map((it) => Math.abs(it.value)), 1);
  const midY = PAD.top + innerH / 2;
  const barW = 60;
  const gap = (innerW - items.length * barW) / (items.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={PAD.left} y1={midY} x2={W - PAD.right} y2={midY} stroke="#52525b" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />

      {items.map((it, i) => {
        const x = PAD.left + gap + i * (barW + gap);
        const barH = Math.abs(it.value / maxAbs) * (innerH / 2);
        const isPositive = it.value >= 0;
        return (
          <g key={i}>
            <rect
              x={x}
              y={isPositive ? midY - barH : midY}
              width={barW}
              height={barH}
              fill={it.color}
              opacity={0.85}
              rx={3}
            />
            <text x={x + barW / 2} y={H - PAD.bottom + 14} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="500">
              {it.label}
            </text>
            <text
              x={x + barW / 2}
              y={isPositive ? midY - barH - 4 : midY + barH + 12}
              textAnchor="middle"
              fill="#e4e4e7"
              fontSize="9"
            >
              {fmtK(it.value)}
            </text>
          </g>
        );
      })}

      <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fill="#71717a" fontSize="8">+cost</text>
      <text x={PAD.left - 4} y={H - PAD.bottom - 2} textAnchor="end" fill="#71717a" fontSize="8">-recv</text>
    </svg>
  );
}

// ── Swap Spread Chart ─────────────────────────────────────────────────────────

function SwapSpreadChart({ data }: { data: TreasuryCurvePoint[] }) {
  const W = 540;
  const H = 170;
  const PAD = { top: 20, bottom: 36, left: 52, right: 20 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allRates = [...data.map((d) => d.treasuryRate), ...data.map((d) => d.swapRate)];
  const minR = Math.min(...allRates) - 0.1;
  const maxR = Math.max(...allRates) + 0.1;

  const scaleX = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const scaleY = (r: number) => PAD.top + innerH - ((r - minR) / (maxR - minR || 1)) * innerH;

  const trsyPts = data.map((d, i) => `${scaleX(i)},${scaleY(d.treasuryRate)}`).join(" L ");
  const swapPts = data.map((d, i) => `${scaleX(i)},${scaleY(d.swapRate)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />

      {/* area between */}
      <defs>
        <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Treasury line */}
      <polyline points={trsyPts} fill="none" stroke="#fbbf24" strokeWidth="2" />
      {/* Swap line */}
      <polyline points={swapPts} fill="none" stroke="#818cf8" strokeWidth="2" />

      {/* X ticks */}
      {data.map((d, i) => (
        <text key={i} x={scaleX(i)} y={H - PAD.bottom + 14} textAnchor="middle" fill="#71717a" fontSize="8.5">
          {d.tenor}
        </text>
      ))}

      {/* Y ticks */}
      {[minR, (minR + maxR) / 2, maxR].map((r, ii) => (
        <text key={ii} x={PAD.left - 4} y={scaleY(r) + 4} textAnchor="end" fill="#71717a" fontSize="8">
          {r.toFixed(2)}%
        </text>
      ))}

      {/* dots on swap */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={scaleX(i)} cy={scaleY(d.swapRate)} r={3} fill="#818cf8" />
          <circle cx={scaleX(i)} cy={scaleY(d.treasuryRate)} r={3} fill="#fbbf24" />
        </g>
      ))}

      {/* Legend */}
      <line x1={PAD.left + 4} y1={PAD.top - 6} x2={PAD.left + 20} y2={PAD.top - 6} stroke="#fbbf24" strokeWidth="2" />
      <text x={PAD.left + 24} y={PAD.top - 2} fill="#fbbf24" fontSize="9">Treasury</text>
      <line x1={PAD.left + 80} y1={PAD.top - 6} x2={PAD.left + 96} y2={PAD.top - 6} stroke="#818cf8" strokeWidth="2" />
      <text x={PAD.left + 100} y={PAD.top - 2} fill="#818cf8" fontSize="9">Swap</text>
    </svg>
  );
}

// ── Exercise Boundary SVG ─────────────────────────────────────────────────────

function ExerciseBoundaryChart({
  isPayer,
  fwdSwapRate,
  strike,
  vol,
  tenor,
}: {
  isPayer: boolean;
  fwdSwapRate: number;
  strike: number;
  vol: number;
  tenor: number;
}) {
  const W = 460;
  const H = 190;
  const PAD = { top: 20, bottom: 36, left: 54, right: 20 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const expiryTs = Array.from({ length: 30 }, (_, i) => (i + 1) * 0.1);
  const annuity = tenor * discountFactor(fwdSwapRate / 100, tenor / 2);

  const prices = expiryTs.map((T) => {
    const p = black76Swaption(fwdSwapRate / 100, strike / 100, T, vol / 100, annuity, isPayer);
    return p * 10000; // scaled for display
  });
  const intrinsics = expiryTs.map(() => {
    const iv = isPayer
      ? Math.max(0, (fwdSwapRate - strike) / 100 * annuity)
      : Math.max(0, (strike - fwdSwapRate) / 100 * annuity);
    return iv * 10000;
  });
  const timeValues = prices.map((p, i) => p - intrinsics[i]);

  const maxP = Math.max(...prices, 1);

  const scaleX = (t: number) => PAD.left + ((t - 0.1) / (3.0 - 0.1)) * innerW;
  const scaleY = (v: number) => PAD.top + innerH - (v / maxP) * innerH;

  const pricePath = expiryTs.map((t, i) => `${scaleX(t)},${scaleY(prices[i])}`).join(" L ");
  const intrinsicPath = expiryTs.map((t, i) => `${scaleX(t)},${scaleY(intrinsics[i])}`).join(" L ");
  const tvPath = expiryTs.map((t, i) => `${scaleX(t)},${scaleY(timeValues[i])}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#52525b" strokeWidth="1" />

      <polyline points={intrinsicPath} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="5 3" />
      <polyline points={tvPath} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
      <polyline points={pricePath} fill="none" stroke="#34d399" strokeWidth="2.5" />

      {/* X ticks */}
      {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((t) => (
        <text key={t} x={scaleX(t)} y={H - PAD.bottom + 14} textAnchor="middle" fill="#71717a" fontSize="8.5">
          {t.toFixed(1)}Y
        </text>
      ))}
      <text x={(PAD.left + W - PAD.right) / 2} y={H - 3} textAnchor="middle" fill="#52525b" fontSize="8">
        Time to Expiry
      </text>

      {/* Legend */}
      <line x1={PAD.left + 4} y1={PAD.top - 6} x2={PAD.left + 18} y2={PAD.top - 6} stroke="#34d399" strokeWidth="2.5" />
      <text x={PAD.left + 22} y={PAD.top - 2} fill="#34d399" fontSize="8">Total</text>
      <line x1={PAD.left + 56} y1={PAD.top - 6} x2={PAD.left + 70} y2={PAD.top - 6} stroke="#f87171" strokeWidth="1.5" strokeDasharray="5 3" />
      <text x={PAD.left + 74} y={PAD.top - 2} fill="#f87171" fontSize="8">Intrinsic</text>
      <line x1={PAD.left + 126} y1={PAD.top - 6} x2={PAD.left + 140} y2={PAD.top - 6} stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={PAD.left + 144} y={PAD.top - 2} fill="#60a5fa" fontSize="8">Time Value</text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RateDerivativesPage() {
  // ── Shared state ────────────────────────────────────────────────────────────
  const rateCurve = useMemo(() => generateRateCurve(), []);
  const swapSpreads = useMemo(() => generateSwapSpreads(rateCurve), [rateCurve]);

  // ── Swap state ──────────────────────────────────────────────────────────────
  const [notional, setNotional] = useState(10_000_000);
  const [swapTenor, setSwapTenor] = useState(5);
  const [fixedRate, setFixedRate] = useState(4.65);
  const [payFixed, setPayFixed] = useState(true);
  const [curveShift, setCurveShift] = useState(0); // bps

  const baseRate = useMemo(() => {
    const pt = rateCurve.find((c) => c.years === swapTenor) ?? rateCurve[3];
    return pt.rate;
  }, [rateCurve, swapTenor]);

  const currentRate = baseRate + curveShift / 100;

  const swapMetrics = useMemo(() => {
    const npv = swapNPV(notional, fixedRate, currentRate, swapTenor, payFixed);
    const dv01 = computeDV01(notional, swapTenor, currentRate);
    const par = parSwapRate(currentRate, swapTenor);
    const treasuryPt = swapSpreads.find((d) => d.years === swapTenor) ?? swapSpreads[3];
    const spread = treasuryPt.spread;
    return { npv, dv01, par, spread };
  }, [notional, fixedRate, currentRate, swapTenor, payFixed, swapSpreads]);

  const cashflows = useMemo((): CashflowBar[] => {
    const r = currentRate / 100;
    return Array.from({ length: swapTenor }, (_, i) => {
      const t = i + 1;
      const df = discountFactor(r, t);
      const fixed = notional * (fixedRate / 100) * df;
      const floating = notional * r * df;
      return { period: t, fixed, floating, net: fixed - floating };
    });
  }, [notional, fixedRate, currentRate, swapTenor]);

  // ── Swaption state ──────────────────────────────────────────────────────────
  const [swaptionType, setSwaptionType] = useState<"payer" | "receiver">("payer");
  const [swaptionExpiry, setSwaptionExpiry] = useState(1);
  const [swaptionTenor, setSwaptionTenor] = useState(5);
  const [swaptionStrike, setSwaptionStrike] = useState(4.75);
  const [swaptionVol, setSwaptionVol] = useState(22);
  const [selectedGridExpiry, setSelectedGridExpiry] = useState(1);
  const [selectedGridTenor, setSelectedGridTenor] = useState(5);

  const swaptionGrid = useMemo((): SwaptionGridCell[] => {
    resetSeed(824);
    const expiries = [1, 2, 3, 5];
    const tenors = [2, 5, 10, 20];
    const baseVol = 0.20;
    return expiries.flatMap((exp) =>
      tenors.map((ten) => {
        const volAdj = baseVol + (rand() - 0.3) * 0.08 + (exp / 10) * 0.02;
        const F = parSwapRate(baseRate, ten) / 100;
        const K = F + (rand() - 0.5) * 0.005;
        const annuity = ten * discountFactor(F, ten / 2);
        const price = black76Swaption(F, K, exp, volAdj, annuity, true);
        return {
          expiry: exp,
          tenor: ten,
          vol: volAdj * 100,
          price: price * notional,
        };
      })
    );
  }, [baseRate, notional]);

  const swaptionMetrics = useMemo(() => {
    const F = parSwapRate(baseRate, swaptionTenor) / 100;
    const K = swaptionStrike / 100;
    const T = swaptionExpiry;
    const vol = swaptionVol / 100;
    const annuity = swaptionTenor * discountFactor(F, swaptionTenor / 2);
    const isPayer = swaptionType === "payer";
    const price = black76Swaption(F, K, T, vol, annuity, isPayer) * notional;
    const delta = swaptionDelta(F, K, T, vol, annuity, isPayer);
    const vega = swaptionVega(F, K, T, vol, annuity);
    const moneyness = isPayer ? (F - K) * 10000 : (K - F) * 10000;
    return { price, delta, vega, moneyness, F: F * 100, annuity };
  }, [baseRate, swaptionTenor, swaptionStrike, swaptionExpiry, swaptionVol, swaptionType, notional]);

  // ── Cap/Floor state ─────────────────────────────────────────────────────────
  const [capTenor, setCapTenor] = useState(5);
  const [capStrike, setCapStrike] = useState(5.0);
  const [floorStrike, setFloorStrike] = useState(3.5);
  const [capVol, setCapVol] = useState(25);
  const [showCap, setShowCap] = useState(true);

  const capletBars = useMemo((): CapletBar[] => {
    const r = currentRate / 100;
    return Array.from({ length: capTenor }, (_, i) => {
      const t = i + 1;
      const df = discountFactor(r, t);
      const forwardRate = r * (1 + 0.02 * (t - 1));
      const K_cap = capStrike / 100;
      const K_floor = floorStrike / 100;
      const vol = capVol / 100;
      const capletPV = black76Caplet(forwardRate, K_cap, t - 0.5, vol, df, 1.0, true) * 1_000_000;
      const floorletPV = black76Caplet(forwardRate, K_floor, t - 0.5, vol, df, 1.0, false) * 1_000_000;
      return { period: t, t, forwardRate: forwardRate * 100, capletPV, floorletPV };
    });
  }, [currentRate, capTenor, capStrike, floorStrike, capVol]);

  const capMetrics = useMemo(() => {
    const totalCap = capletBars.reduce((s, b) => s + b.capletPV, 0);
    const totalFloor = capletBars.reduce((s, b) => s + b.floorletPV, 0);
    const collarCost = totalCap - totalFloor; // buy cap, sell floor
    const breakEven = capStrike + (totalCap / (notional * capTenor)) * 100;
    return { totalCap, totalFloor, collarCost, breakEven };
  }, [capletBars, capStrike, notional, capTenor]);

  // ── Rate Vol state ──────────────────────────────────────────────────────────
  const [showNormalVol, setShowNormalVol] = useState(false);
  const [selectedVolTenorIdx, setSelectedVolTenorIdx] = useState(2);

  const volTenors = [1, 2, 5, 10, 20, 30];
  const volStrikes = useMemo(() => {
    const atm = baseRate;
    return [-150, -100, -50, -25, 0, 25, 50, 100, 150].map((offset) => atm + offset / 100);
  }, [baseRate]);

  // SABR parameters per tenor (slightly different for each)
  const sabrParams = useMemo(() => {
    resetSeed(824);
    return volTenors.map((ten) => ({
      alpha: 0.025 + rand() * 0.015 + ten * 0.0003,
      beta: 0.5,
      rho: -0.2 - rand() * 0.2,
      nu: 0.35 + rand() * 0.15,
    }));
  }, []);

  const volMatrix = useMemo((): number[][] => {
    return volStrikes.map((k) =>
      volTenors.map((ten, ti) => {
        const { alpha, beta, rho, nu } = sabrParams[ti];
        const F = baseRate / 100;
        const T = ten;
        const v = sabrVol(F, k / 100, T, alpha, beta, rho, nu);
        return v * 100;
      })
    );
  }, [volStrikes, sabrParams, baseRate]);

  const smileVols = useMemo(() => {
    const { alpha, beta, rho, nu } = sabrParams[selectedVolTenorIdx];
    const F = baseRate / 100;
    const T = volTenors[selectedVolTenorIdx];
    const logNormal = volStrikes.map((k) => sabrVol(F, k / 100, T, alpha, beta, rho, nu) * 100);
    // Normal vol approx: sigma_normal ≈ sigma_LN * F (for ATM)
    const normal = logNormal.map((lnv, i) => {
      const Fmid = (F + volStrikes[i] / 100) / 2;
      return lnv * Fmid * 100; // in bps (per year)
    });
    return { logNormal, normal };
  }, [sabrParams, selectedVolTenorIdx, volStrikes, baseRate]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interest Rate Derivatives</h1>
            <p className="text-muted-foreground text-sm">IRS · Swaptions · Caps & Floors · Vol Surface</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-xs">
            Black-76
          </Badge>
          <Badge variant="outline" className="border-primary/40 text-primary text-xs">
            SABR
          </Badge>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-xs">
            DV01
          </Badge>
          <div className="text-xs text-muted-foreground border border-border/50 rounded px-2 py-1">
            Base 5Y: <span className="text-foreground font-medium">{baseRate.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="swaps" className="space-y-4">
        <TabsList className="bg-card border border-border p-1 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="swaps" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Swaps
          </TabsTrigger>
          <TabsTrigger value="swaptions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Swaptions
          </TabsTrigger>
          <TabsTrigger value="caps" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Caps & Floors
          </TabsTrigger>
          <TabsTrigger value="ratevol" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm gap-1.5">
            <Thermometer className="w-3.5 h-3.5" />
            Rate Vol
          </TabsTrigger>
        </TabsList>

        {/* ══════════════ TAB 1: SWAPS ══════════════ */}
        <TabsContent value="swaps" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Builder panel */}
            <Card className="bg-card border-border border-l-4 border-l-primary lg:col-span-1">
              <CardHeader className="pb-3 p-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  IRS Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Notional */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Notional</label>
                    <span className="text-xs text-foreground font-medium">{fmtK(notional)}</span>
                  </div>
                  <Slider
                    min={1_000_000}
                    max={100_000_000}
                    step={1_000_000}
                    value={[notional]}
                    onValueChange={([v]) => setNotional(v)}
                    className="[&_[role=slider]]:bg-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$1M</span><span>$100M</span>
                  </div>
                </div>

                {/* Tenor */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Tenor</label>
                    <span className="text-xs text-foreground font-medium">{swapTenor}Y</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 3, 5, 7, 10].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSwapTenor(t)}
                        className={`px-2.5 py-1 rounded text-xs text-muted-foreground font-medium transition-colors ${
                          swapTenor === t
                            ? "bg-indigo-600 text-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}Y
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fixed Rate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Fixed Rate</label>
                    <span className="text-xs text-foreground font-medium">{fixedRate.toFixed(2)}%</span>
                  </div>
                  <Slider
                    min={200}
                    max={800}
                    step={1}
                    value={[Math.round(fixedRate * 100)]}
                    onValueChange={([v]) => setFixedRate(v / 100)}
                    className="[&_[role=slider]]:bg-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2.00%</span><span>8.00%</span>
                  </div>
                </div>

                {/* Curve Shift */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Curve Shift</label>
                    <span className={`text-xs font-medium ${curveShift > 0 ? "text-red-400" : curveShift < 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {curveShift > 0 ? "+" : ""}{curveShift} bps
                    </span>
                  </div>
                  <Slider
                    min={-300}
                    max={300}
                    step={25}
                    value={[curveShift]}
                    onValueChange={([v]) => setCurveShift(v)}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-300 bps</span><span>+300 bps</span>
                  </div>
                </div>

                {/* Pay/Receive toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPayFixed(true)}
                    className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                      payFixed
                        ? "bg-red-600/80 text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pay Fixed
                  </button>
                  <button
                    onClick={() => setPayFixed(false)}
                    className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                      !payFixed
                        ? "bg-emerald-600/80 text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Receive Fixed
                  </button>
                </div>

                {/* Info box */}
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Current Rate ({swapTenor}Y)</span>
                    <span className="text-foreground">{currentRate.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Par Swap Rate</span>
                    <span className="text-emerald-400">{swapMetrics.par.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed vs Par</span>
                    <span className={fixedRate > swapMetrics.par ? "text-red-400" : "text-emerald-400"}>
                      {(fixedRate - swapMetrics.par > 0 ? "+" : "")}{(fixedRate - swapMetrics.par).toFixed(3)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics + charts */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  label="MTM P&L"
                  value={fmtK(swapMetrics.npv)}
                  sub="vs par"
                  positive={swapMetrics.npv >= 0}
                  icon={DollarSign}
                />
                <MetricCard
                  label="DV01"
                  value={fmtK(swapMetrics.dv01)}
                  sub="per bp"
                  icon={Activity}
                />
                <MetricCard
                  label="Par Rate"
                  value={`${swapMetrics.par.toFixed(3)}%`}
                  sub="current fair"
                  icon={Percent}
                />
                <MetricCard
                  label="Swap Spread"
                  value={`${swapMetrics.spread} bps`}
                  sub="vs Treasury"
                  icon={TrendingUp}
                />
              </div>

              {/* MTM Chart */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">MTM P&L vs Rate Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <MTMChart
                    notional={notional}
                    fixedRate={fixedRate}
                    currentRate={currentRate}
                    tenor={swapTenor}
                    payFixed={payFixed}
                  />
                </CardContent>
              </Card>

              {/* Cashflow Timeline */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Cashflow Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <CashflowTimeline bars={cashflows} payFixed={payFixed} />
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {cashflows.slice(0, 4).map((cf) => (
                      <div key={cf.period} className="bg-muted/50 rounded p-2 flex justify-between">
                        <span className="text-muted-foreground">Year {cf.period}</span>
                        <span className={cf.net >= 0 ? "text-emerald-400" : "text-red-400"}>
                          {fmtK(cf.net)} net
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Swap spread chart */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Swap Spread to Treasury</CardTitle>
                </CardHeader>
                <CardContent>
                  <SwapSpreadChart data={swapSpreads} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {swapSpreads.map((d) => (
                      <span key={d.tenor} className="text-xs text-muted-foreground bg-muted/60 border border-border/50 rounded px-2 py-0.5">
                        <span className="text-muted-foreground">{d.tenor}: </span>
                        <span className="text-indigo-300 font-medium">{d.spread} bps</span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════ TAB 2: SWAPTIONS ══════════════ */}
        <TabsContent value="swaptions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Swaption Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Payer/Receiver */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSwaptionType("payer")}
                    className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                      swaptionType === "payer"
                        ? "bg-red-600/80 text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Payer
                  </button>
                  <button
                    onClick={() => setSwaptionType("receiver")}
                    className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                      swaptionType === "receiver"
                        ? "bg-emerald-600/80 text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Receiver
                  </button>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/40 rounded p-2">
                  {swaptionType === "payer"
                    ? "Right to enter a swap paying fixed. Benefits when rates rise."
                    : "Right to enter a swap receiving fixed. Benefits when rates fall."}
                </div>

                {/* Expiry */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Option Expiry</label>
                    <span className="text-xs text-foreground font-medium">{swaptionExpiry}Y</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 5].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSwaptionExpiry(t)}
                        className={`flex-1 py-1.5 rounded text-xs text-muted-foreground font-medium transition-colors ${
                          swaptionExpiry === t
                            ? "bg-primary text-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}Y
                      </button>
                    ))}
                  </div>
                </div>

                {/* Underlying tenor */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Underlying Tenor</label>
                    <span className="text-xs text-foreground font-medium">{swaptionTenor}Y</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[2, 5, 10, 20].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSwaptionTenor(t)}
                        className={`flex-1 py-1.5 rounded text-xs text-muted-foreground font-medium transition-colors ${
                          swaptionTenor === t
                            ? "bg-primary text-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}Y
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strike */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Strike Rate</label>
                    <span className="text-xs text-foreground font-medium">{swaptionStrike.toFixed(2)}%</span>
                  </div>
                  <Slider
                    min={200}
                    max={800}
                    step={5}
                    value={[Math.round(swaptionStrike * 100)]}
                    onValueChange={([v]) => setSwaptionStrike(v / 100)}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2.00%</span><span>8.00%</span>
                  </div>
                </div>

                {/* Vol */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Implied Vol</label>
                    <span className="text-xs text-foreground font-medium">{swaptionVol}%</span>
                  </div>
                  <Slider
                    min={5}
                    max={60}
                    step={1}
                    value={[swaptionVol]}
                    onValueChange={([v]) => setSwaptionVol(v)}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5%</span><span>60%</span>
                  </div>
                </div>

                {/* Greeks */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Greeks</div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Δ Delta</span>
                    <span className="text-amber-400 font-medium">{fmtNum(swaptionMetrics.delta, 4)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">ν Vega (per 1% vol)</span>
                    <span className="text-sky-400 font-medium">{fmtNum(swaptionMetrics.vega * notional * 0.01, 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Moneyness</span>
                    <span className={swaptionMetrics.moneyness > 0 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                      {swaptionMetrics.moneyness > 0 ? "+" : ""}{swaptionMetrics.moneyness.toFixed(1)} bps
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Fwd Swap Rate</span>
                    <span className="text-foreground font-medium">{swaptionMetrics.F.toFixed(3)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard
                  label="Swaption Price"
                  value={fmtK(swaptionMetrics.price)}
                  sub={`${swaptionExpiry}Yx${swaptionTenor}Y ${swaptionType}`}
                  positive={true}
                  icon={DollarSign}
                />
                <MetricCard
                  label="Delta"
                  value={fmtNum(swaptionMetrics.delta, 3)}
                  sub="dPrice/dF"
                  icon={TrendingUp}
                />
                <MetricCard
                  label="Vega"
                  value={fmtK(swaptionMetrics.vega * notional * 0.01)}
                  sub="per 1% vol"
                  icon={Zap}
                />
              </div>

              {/* Grid */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Expiry × Tenor Vol/Price Grid</CardTitle>
                  <p className="text-xs text-muted-foreground">Click a cell to highlight (notional {fmtK(notional)})</p>
                </CardHeader>
                <CardContent>
                  <SwaptionGrid
                    cells={swaptionGrid}
                    selectedExpiry={selectedGridExpiry}
                    selectedTenor={selectedGridTenor}
                    onSelect={(exp, ten) => {
                      setSelectedGridExpiry(exp);
                      setSelectedGridTenor(ten);
                    }}
                  />
                </CardContent>
              </Card>

              {/* Exercise boundary */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Exercise Boundary (Value Decomposition)</CardTitle>
                  <p className="text-xs text-muted-foreground">Total vs Intrinsic vs Time Value across expiry</p>
                </CardHeader>
                <CardContent>
                  <ExerciseBoundaryChart
                    isPayer={swaptionType === "payer"}
                    fwdSwapRate={swaptionMetrics.F}
                    strike={swaptionStrike}
                    vol={swaptionVol}
                    tenor={swaptionTenor}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════ TAB 3: CAPS & FLOORS ══════════════ */}
        <TabsContent value="caps" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Cap / Floor Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Show cap/floor toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCap(true)}
                    className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                      showCap
                        ? "bg-emerald-600/80 text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Cap
                  </button>
                  <button
                    onClick={() => setShowCap(false)}
                    className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                      !showCap
                        ? "bg-sky-600/80 text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Floor
                  </button>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/40 rounded p-2">
                  {showCap
                    ? "An interest rate cap pays when floating rate exceeds the cap strike. Protects floating-rate borrowers."
                    : "An interest rate floor pays when floating rate falls below the floor strike. Protects floating-rate lenders."}
                </div>

                {/* Cap tenor */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Cap Tenor</label>
                    <span className="text-xs text-foreground font-medium">{capTenor}Y</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[2, 3, 5, 7, 10].map((t) => (
                      <button
                        key={t}
                        onClick={() => setCapTenor(t)}
                        className={`flex-1 py-1.5 rounded text-xs text-muted-foreground font-medium transition-colors ${
                          capTenor === t
                            ? "bg-emerald-600 text-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}Y
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cap Strike */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Cap Strike</label>
                    <span className="text-xs text-foreground font-medium">{capStrike.toFixed(2)}%</span>
                  </div>
                  <Slider
                    min={250}
                    max={800}
                    step={10}
                    value={[Math.round(capStrike * 100)]}
                    onValueChange={([v]) => setCapStrike(v / 100)}
                    className="[&_[role=slider]]:bg-emerald-500"
                  />
                </div>

                {/* Floor Strike */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Floor Strike</label>
                    <span className="text-xs text-foreground font-medium">{floorStrike.toFixed(2)}%</span>
                  </div>
                  <Slider
                    min={100}
                    max={500}
                    step={10}
                    value={[Math.round(floorStrike * 100)]}
                    onValueChange={([v]) => setFloorStrike(v / 100)}
                    className="[&_[role=slider]]:bg-sky-500"
                  />
                </div>

                {/* Cap Vol */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground font-medium">Implied Vol</label>
                    <span className="text-xs text-foreground font-medium">{capVol}%</span>
                  </div>
                  <Slider
                    min={5}
                    max={60}
                    step={1}
                    value={[capVol]}
                    onValueChange={([v]) => setCapVol(v)}
                    className="[&_[role=slider]]:bg-emerald-500"
                  />
                </div>

                {/* Metrics */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Pricing</div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Cap Premium</span>
                    <span className="text-emerald-400 font-medium">{fmtK(capMetrics.totalCap)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Floor Premium</span>
                    <span className="text-sky-400 font-medium">{fmtK(capMetrics.totalFloor)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Collar Net Cost</span>
                    <span className={capMetrics.collarCost >= 0 ? "text-orange-400 font-medium" : "text-primary font-medium"}>
                      {fmtK(capMetrics.collarCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Break-even Rate</span>
                    <span className="text-foreground font-medium">{capMetrics.breakEven.toFixed(3)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  label={showCap ? "Cap Premium" : "Floor Premium"}
                  value={fmtK(showCap ? capMetrics.totalCap : capMetrics.totalFloor)}
                  sub="$1M notional"
                  positive={false}
                  icon={DollarSign}
                />
                <MetricCard
                  label="Collar Net"
                  value={fmtK(capMetrics.collarCost)}
                  sub="buy cap, sell floor"
                  positive={capMetrics.collarCost < 0}
                  icon={ArrowLeftRight}
                />
                <MetricCard
                  label="Break-even"
                  value={`${capMetrics.breakEven.toFixed(2)}%`}
                  sub="all-in rate"
                  icon={Percent}
                />
                <MetricCard
                  label="# Caplets"
                  value={String(capTenor)}
                  sub={`${capTenor} annual resets`}
                  icon={Layers}
                />
              </div>

              {/* Caplet waterfall */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {showCap ? "Caplet" : "Floorlet"} PV Decomposition
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Each bar = discounted {showCap ? "caplet" : "floorlet"} value ($1M notional)
                  </p>
                </CardHeader>
                <CardContent>
                  <CapletWaterfall bars={capletBars} isCap={showCap} />
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs text-muted-foreground">
                    {capletBars.slice(0, 5).map((b) => (
                      <div key={b.period} className="bg-muted/50 rounded p-1.5 text-center">
                        <div className="text-muted-foreground">Y{b.period}</div>
                        <div className="text-foreground font-medium">{b.forwardRate.toFixed(2)}%</div>
                        <div className={showCap ? "text-emerald-400" : "text-sky-400"}>
                          {fmtK(showCap ? b.capletPV : b.floorletPV)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cap vs Collar */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Cap vs Floor vs Collar Comparison</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Collar = Buy Cap at {capStrike.toFixed(2)}% + Sell Floor at {floorStrike.toFixed(2)}%
                  </p>
                </CardHeader>
                <CardContent>
                  <CapCollarChart
                    capPremium={capMetrics.totalCap}
                    floorPremium={capMetrics.totalFloor}
                    collarCost={capMetrics.collarCost}
                  />
                  <div className="mt-3 bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <div className="font-medium text-muted-foreground mb-1">Break-even Analysis</div>
                    <div>
                      A collar at these strikes costs{" "}
                      <span className={capMetrics.collarCost >= 0 ? "text-orange-400 font-medium" : "text-primary font-medium"}>
                        {fmtK(Math.abs(capMetrics.collarCost))}
                      </span>{" "}
                      {capMetrics.collarCost >= 0 ? "net premium" : "net received"}.
                    </div>
                    <div>
                      Cap becomes valuable above{" "}
                      <span className="text-emerald-400 font-medium">{capStrike.toFixed(2)}%</span>; Floor
                      protects below{" "}
                      <span className="text-sky-400 font-medium">{floorStrike.toFixed(2)}%</span>.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════ TAB 4: RATE VOL SURFACE ══════════════ */}
        <TabsContent value="ratevol" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  SABR Vol Surface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3 space-y-1">
                  <div className="font-medium text-muted-foreground mb-1">SABR Model</div>
                  <div>Stochastic Alpha Beta Rho model by Hagan et al.</div>
                  <div>Parameters: α (vol of spot), β (CEV exponent), ρ (correlation), ν (vol of vol)</div>
                </div>

                {/* Vol convention toggle */}
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-2">Vol Convention</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNormalVol(false)}
                      className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                        !showNormalVol
                          ? "bg-orange-600/80 text-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Log-Normal
                    </button>
                    <button
                      onClick={() => setShowNormalVol(true)}
                      className={`flex-1 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
                        showNormalVol
                          ? "bg-orange-600/80 text-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Normal (bp)
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 bg-muted/30 rounded p-2">
                    {showNormalVol
                      ? "Normal vol (Bachelier): σ_N in bp/yr. Preferred for near-zero or negative rates."
                      : "Log-normal vol (Black): σ_LN as %. Standard for positive-rate environments."}
                  </div>
                </div>

                {/* Selected tenor info */}
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-2">Selected Tenor</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {volTenors.map((ten, ti) => (
                      <button
                        key={ten}
                        onClick={() => setSelectedVolTenorIdx(ti)}
                        className={`px-2.5 py-1.5 rounded text-xs text-muted-foreground font-medium transition-colors ${
                          ti === selectedVolTenorIdx
                            ? "bg-orange-600 text-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {ten}Y
                      </button>
                    ))}
                  </div>
                </div>

                {/* SABR params display */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    SABR Params ({volTenors[selectedVolTenorIdx]}Y)
                  </div>
                  {(["alpha", "beta", "rho", "nu"] as const).map((param) => (
                    <div key={param} className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-muted-foreground capitalize">{param} ({param === "alpha" ? "α" : param === "beta" ? "β" : param === "rho" ? "ρ" : "ν"})</span>
                      <span className="text-orange-300 font-medium">
                        {sabrParams[selectedVolTenorIdx][param].toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ATM vol at each tenor */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">ATM Vol by Tenor</div>
                  {volTenors.map((ten, ti) => {
                    const atmIdx = Math.floor(volStrikes.length / 2);
                    const v = volMatrix[atmIdx]?.[ti] ?? 0;
                    return (
                      <div key={ten} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-muted-foreground w-8">{ten}Y</span>
                        <div className="flex-1 bg-muted/50 rounded h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded"
                            style={{ width: `${Math.min(100, (v / 40) * 100)}%` }}
                          />
                        </div>
                        <span className="text-orange-300 font-medium w-12 text-right">{v.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="lg:col-span-2 space-y-4">
              {/* Heatmap */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Vol Surface — Strike × Tenor Heatmap
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Click column to select tenor for smile view. Rows = strike offset from ATM ({baseRate.toFixed(2)}%).
                  </p>
                </CardHeader>
                <CardContent>
                  <VolSurfaceHeatmap
                    tenors={volTenors}
                    strikes={volStrikes}
                    volMatrix={volMatrix}
                    selectedTenorIdx={selectedVolTenorIdx}
                    onSelectTenor={setSelectedVolTenorIdx}
                  />
                </CardContent>
              </Card>

              {/* Vol Smile */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">
                      Vol Smile — {volTenors[selectedVolTenorIdx]}Y Tenor
                    </CardTitle>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground">Convention:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs text-muted-foreground cursor-pointer ${
                          showNormalVol
                            ? "border-orange-500/50 text-orange-300"
                            : "border-primary/50 text-primary"
                        }`}
                        onClick={() => setShowNormalVol((v) => !v)}
                      >
                        {showNormalVol ? "Normal (bp)" : "Log-Normal (%)"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <VolSmileChart
                    strikes={volStrikes}
                    logNormalVols={smileVols.logNormal}
                    normalVols={smileVols.normal}
                    showNormal={showNormalVol}
                    atmStrike={baseRate}
                  />
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {volStrikes.map((k, i) => (
                      <span key={i} className="bg-muted/50 border border-border/50 rounded px-2 py-0.5">
                        <span className="text-muted-foreground">{k.toFixed(2)}%:</span>{" "}
                        <span className="text-orange-300 font-medium">
                          {showNormalVol
                            ? smileVols.normal[i].toFixed(1) + "bp"
                            : smileVols.logNormal[i].toFixed(1) + "%"}
                        </span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Term structure table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Vol Term Structure Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-muted-foreground">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-muted-foreground font-medium py-2 pr-3">Tenor</th>
                          <th className="text-right text-muted-foreground font-medium py-2 px-2">α</th>
                          <th className="text-right text-muted-foreground font-medium py-2 px-2">ρ</th>
                          <th className="text-right text-muted-foreground font-medium py-2 px-2">ν</th>
                          <th className="text-right text-muted-foreground font-medium py-2 px-2">ATM LN Vol</th>
                          <th className="text-right text-muted-foreground font-medium py-2 px-2">ATM N Vol</th>
                          <th className="text-right text-muted-foreground font-medium py-2 pl-2">Skew</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volTenors.map((ten, ti) => {
                          const p = sabrParams[ti];
                          const atmIdx = Math.floor(volStrikes.length / 2);
                          const atmLN = volMatrix[atmIdx]?.[ti] ?? 0;
                          const atmN = (atmLN / 100) * (baseRate / 100) * 10000; // bps
                          const lo = volMatrix[atmIdx - 2]?.[ti] ?? 0;
                          const hi = volMatrix[atmIdx + 2]?.[ti] ?? 0;
                          const skew = hi - lo;
                          const isSelected = ti === selectedVolTenorIdx;
                          return (
                            <tr
                              key={ten}
                              className={`border-b border-border/50 cursor-pointer ${
                                isSelected ? "bg-orange-600/10" : "hover:bg-muted/40"
                              }`}
                              onClick={() => setSelectedVolTenorIdx(ti)}
                            >
                              <td className="py-2 pr-3">
                                <span className={`font-medium ${isSelected ? "text-orange-400" : "text-muted-foreground"}`}>
                                  {ten}Y
                                </span>
                              </td>
                              <td className="text-right py-2 px-2 text-muted-foreground">{p.alpha.toFixed(3)}</td>
                              <td className="text-right py-2 px-2 text-muted-foreground">{p.rho.toFixed(3)}</td>
                              <td className="text-right py-2 px-2 text-muted-foreground">{p.nu.toFixed(3)}</td>
                              <td className="text-right py-2 px-2 font-medium text-orange-300">{atmLN.toFixed(1)}%</td>
                              <td className="text-right py-2 px-2 font-medium text-sky-300">{atmN.toFixed(1)} bp</td>
                              <td className={`text-right py-2 pl-2 font-medium ${skew < 0 ? "text-red-400" : "text-emerald-400"}`}>
                                {skew > 0 ? "+" : ""}{skew.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
