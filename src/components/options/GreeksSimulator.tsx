"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import {
  Activity,
  BarChart2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
  DollarSign,
  Shuffle,
} from "lucide-react";

// ─── Math Utilities ───────────────────────────────────────────────────────────

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const poly =
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - pdf * poly;
  return x >= 0 ? cdf : 1 - cdf;
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

interface BSResult {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  d1: number;
  d2: number;
}

function bsPrice(
  S: number,
  K: number,
  T: number, // days
  sigma: number,
  r: number,
  isCall: boolean
): BSResult {
  const Ty = Math.max(T / 365, 1e-6);
  const sqrtT = Math.sqrt(Ty);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  const Nnd1 = normalCDF(-d1);
  const Nnd2 = normalCDF(-d2);
  const disc = K * Math.exp(-r * Ty);

  const price = isCall ? S * Nd1 - disc * Nd2 : disc * Nnd2 - S * Nnd1;
  const delta = isCall ? Nd1 : Nd1 - 1;
  const gamma = normalPDF(d1) / (S * sigma * sqrtT);
  const thetaRaw = isCall
    ? -(S * normalPDF(d1) * sigma) / (2 * sqrtT) - r * disc * Nd2
    : -(S * normalPDF(d1) * sigma) / (2 * sqrtT) + r * disc * Nnd2;
  const theta = thetaRaw / 365;
  const vega = (S * sqrtT * normalPDF(d1)) / 100;
  const rhoRaw = isCall ? disc * Ty * Nd2 : -disc * Ty * Nnd2;
  const rho = rhoRaw / 100;

  return { price, delta, gamma, theta, vega, rho, d1, d2 };
}

// mulberry32 seeded PRNG
function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

function ivToColor(iv: number, minIV: number, maxIV: number): string {
  const t = Math.max(0, Math.min(1, (iv - minIV) / (maxIV - minIV)));
  // blue → cyan → green → yellow → red
  if (t < 0.25) {
    const u = t / 0.25;
    return `rgb(${Math.round(u * 0)},${Math.round(100 + u * 155)},${Math.round(220 - u * 20)})`;
  } else if (t < 0.5) {
    const u = (t - 0.25) / 0.25;
    return `rgb(${Math.round(u * 50)},${Math.round(255)},${Math.round(200 - u * 200)})`;
  } else if (t < 0.75) {
    const u = (t - 0.5) / 0.25;
    return `rgb(${Math.round(50 + u * 205)},${Math.round(255 - u * 105)},0)`;
  } else {
    const u = (t - 0.75) / 0.25;
    return `rgb(255,${Math.round(150 - u * 150)},0)`;
  }
}

// ─── Section 1: 3D Vol Surface ────────────────────────────────────────────────

const STRIKES_RATIO = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
const EXPIRIES_DAYS = [7, 14, 30, 60, 90, 180];
const SPOT = 100;

type SurfaceMode = "call" | "put" | "skew";

function generateIVSurface(mode: SurfaceMode): number[][] {
  // Returns [expiry][strike] IV grid with put skew
  const rng = mulberry32(1337);
  return EXPIRIES_DAYS.map((_t, ti) => {
    return STRIKES_RATIO.map((_kr, ki) => {
      const moneyness = STRIKES_RATIO[ki]; // < 1 = OTM put / ITM call
      // Base IV rises with time (term structure)
      const baseIV = 0.18 + ti * 0.012 + rng() * 0.02;
      // Put skew: OTM puts have higher IV
      const skewBump = Math.max(0, (1 - moneyness) * 0.25);
      const callIV = baseIV + rng() * 0.01;
      const putIV = baseIV + skewBump + rng() * 0.015;
      if (mode === "call") return Math.min(0.8, callIV);
      if (mode === "put") return Math.min(0.8, putIV);
      return putIV - callIV; // skew: positive means puts richer
    });
  });
}

interface IsoPoint {
  sx: number;
  sy: number;
}

function toIso(xi: number, yi: number, zi: number, angle: number): IsoPoint {
  // xi, yi: grid indices (0..1 normalised), zi: 0..1 height
  const rad = (angle * Math.PI) / 180;
  // isometric projection
  const gx = xi * Math.cos(rad) - yi * Math.sin(rad);
  const gy = xi * Math.sin(rad) + yi * Math.cos(rad);
  const sx = 200 + gx * 120;
  const sy = 250 - gy * 90 - zi * 130;
  return { sx, sy };
}

function VolSurface3D() {
  const [mode, setMode] = useState<SurfaceMode>("put");
  const [angle, setAngle] = useState(30);

  const surface = useMemo(() => generateIVSurface(mode), [mode]);
  const nExp = EXPIRIES_DAYS.length;
  const nStr = STRIKES_RATIO.length;

  const allVals = surface.flat();
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  // Build cells sorted back-to-front for painter's algorithm
  const cells = useMemo(() => {
    const result: {
      key: string;
      pts: IsoPoint[];
      iv: number;
      fill: string;
    }[] = [];
    for (let ti = 0; ti < nExp; ti++) {
      for (let ki = 0; ki < nStr; ki++) {
        const iv = surface[ti][ki];
        const zi = (iv - minVal) / (maxVal - minVal + 0.001);
        const xiNorm = ki / (nStr - 1);
        const yiNorm = ti / (nExp - 1);
        const p00 = toIso(xiNorm, yiNorm, zi, angle);
        const p10 = toIso((ki + 1) / (nStr - 1), yiNorm, zi, angle);
        const p11 = toIso((ki + 1) / (nStr - 1), (ti + 1) / (nExp - 1), zi, angle);
        const p01 = toIso(xiNorm, (ti + 1) / (nExp - 1), zi, angle);
        // clamp out-of-bounds cells
        if (ki === nStr - 1 || ti === nExp - 1) continue;
        const fill = mode === "skew" ? ivToColor(iv, minVal, maxVal) : ivToColor(iv, 0.1, 0.6);
        result.push({ key: `${ti}-${ki}`, pts: [p00, p10, p11, p01], iv, fill });
      }
    }
    // Sort by painter (cells further away drawn first)
    result.sort((a, b) => Math.min(...a.pts.map((p) => p.sy)) - Math.min(...b.pts.map((p) => p.sy)));
    return result;
  }, [surface, angle, minVal, maxVal, nExp, nStr, mode]);

  const modeLabels: { id: SurfaceMode; label: string }[] = [
    { id: "call", label: "Call IV" },
    { id: "put", label: "Put IV" },
    { id: "skew", label: "Skew (P-C)" },
  ];

  return (
    <div className="rounded-md border border-border/20 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">3D Volatility Surface</p>
          <p className="text-xs text-muted-foreground">Implied vol across strikes & expiries</p>
        </div>
        <div className="flex gap-1">
          {modeLabels.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG isometric surface */}
      <svg
        viewBox="0 0 400 340"
        className="w-full"
        style={{ maxHeight: 280 }}
      >
        {/* Grid cells */}
        {cells.map((c) => (
          <polygon
            key={c.key}
            points={c.pts.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ")}
            fill={c.fill}
            fillOpacity={0.82}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
          />
        ))}
        {/* X-axis labels (strikes) */}
        {STRIKES_RATIO.map((kr, ki) => {
          const p = toIso(ki / (nStr - 1), 0, 0, angle);
          return (
            <text
              key={`sk-${ki}`}
              x={p.sx}
              y={p.sy + 14}
              fill="rgba(255,255,255,0.5)"
              fontSize={8}
              textAnchor="middle"
            >
              {kr === 1.0 ? "ATM" : `${(kr * 100).toFixed(0)}`}
            </text>
          );
        })}
        {/* Y-axis labels (expiries) */}
        {EXPIRIES_DAYS.map((d, ti) => {
          const p = toIso(0, ti / (nExp - 1), 0, angle);
          return (
            <text
              key={`exp-${ti}`}
              x={p.sx - 14}
              y={p.sy + 3}
              fill="rgba(255,255,255,0.5)"
              fontSize={8}
              textAnchor="end"
            >
              {d}d
            </text>
          );
        })}
        {/* Legend */}
        <defs>
          <linearGradient id="ivGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(0,100,220)" />
            <stop offset="50%" stopColor="rgb(0,255,0)" />
            <stop offset="100%" stopColor="rgb(255,0,0)" />
          </linearGradient>
        </defs>
        <rect x={310} y={20} width={70} height={8} fill="url(#ivGrad)" rx={2} />
        <text x={310} y={36} fill="rgba(255,255,255,0.5)" fontSize={7}>
          {mode === "skew" ? `${(minVal * 100).toFixed(1)}%` : "Low IV"}
        </text>
        <text x={380} y={36} fill="rgba(255,255,255,0.5)" fontSize={7} textAnchor="end">
          {mode === "skew" ? `${(maxVal * 100).toFixed(1)}%` : "High IV"}
        </text>
      </svg>

      {/* Rotation slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-20">Rotation: {angle}°</span>
        <div className="flex-1">
          <Slider
            min={0}
            max={90}
            step={1}
            value={[angle]}
            onValueChange={([v]) => setAngle(v)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Greeks P&L Attribution ───────────────────────────────────────

function PnlAttribution() {
  const [spotMove, setSpotMove] = useState(0);   // % (-20 to +20)
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [ivChange, setIvChange] = useState(0);   // % change in IV (-50 to +100)

  const S0 = 100;
  const K = 100;
  const T0 = 30;
  const sigma0 = 0.30;
  const r = 0.05;

  const base = useMemo(() => bsPrice(S0, K, T0, sigma0, r, true), []);

  const newS = S0 * (1 + spotMove / 100);
  const newT = Math.max(1, T0 - daysElapsed);
  const newSigma = Math.max(0.05, sigma0 * (1 + ivChange / 100));

  const actual = useMemo(
    () => bsPrice(newS, K, newT, newSigma, r, true),
    [newS, newT, newSigma]
  );

  const dS = newS - S0;
  const dT = -(daysElapsed);
  const dSigmaPct = (newSigma - sigma0) * 100; // in percentage points

  // P&L attribution (per share, 1 option contract = 100 shares but we keep per-share here)
  const deltaPnl = base.delta * dS;
  const gammaPnl = 0.5 * base.gamma * dS * dS;
  const thetaPnl = base.theta * daysElapsed;
  const vegaPnl = base.vega * dSigmaPct;

  // Second-order
  const bump = 0.001;
  const sigUp = bsPrice(S0, K, T0, sigma0 + bump, r, true);
  const vanna = (sigUp.delta - base.delta) / (bump * 100); // per 1% sig
  const volga = (sigUp.vega - base.vega) / (bump * 100);   // per 1% sig
  const vannaPnl = vanna * dS * dSigmaPct;
  const volgaPnl = 0.5 * volga * dSigmaPct * dSigmaPct;
  const charmPnl = daysElapsed > 0
    ? (bsPrice(S0, K, Math.max(1, T0 - 1), sigma0, r, true).delta - base.delta) * dS * daysElapsed
    : 0;

  const totalExplained = deltaPnl + gammaPnl + thetaPnl + vegaPnl + vannaPnl + volgaPnl + charmPnl;
  const actualPnl = actual.price - base.price;
  const residual = actualPnl - totalExplained;

  const bars: { label: string; value: number; color: string }[] = [
    { label: "Delta", value: deltaPnl, color: "#60a5fa" },
    { label: "Gamma", value: gammaPnl, color: "#34d399" },
    { label: "Theta", value: thetaPnl, color: "#f87171" },
    { label: "Vega", value: vegaPnl, color: "#a78bfa" },
    { label: "Vanna", value: vannaPnl, color: "#fb923c" },
    { label: "Volga", value: volgaPnl, color: "#fbbf24" },
    { label: "Charm", value: charmPnl, color: "#38bdf8" },
  ];

  const maxAbs = Math.max(0.01, ...bars.map((b) => Math.abs(b.value)), Math.abs(residual));
  const W = 320;
  const zero = W / 2;

  return (
    <div className="rounded-md border border-border/20 bg-card p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Greeks P&L Attribution</p>
        <p className="text-xs text-muted-foreground">Long 1 ATM call (S=$100, K=$100, 30DTE, σ=30%)</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: `Spot Move: ${spotMove > 0 ? "+" : ""}${spotMove}%`,
            value: spotMove,
            min: -20,
            max: 20,
            step: 1,
            set: setSpotMove,
          },
          {
            label: `Days Elapsed: ${daysElapsed}d`,
            value: daysElapsed,
            min: 0,
            max: 29,
            step: 1,
            set: setDaysElapsed,
          },
          {
            label: `IV Change: ${ivChange > 0 ? "+" : ""}${ivChange}%`,
            value: ivChange,
            min: -50,
            max: 100,
            step: 5,
            set: setIvChange,
          },
        ].map((s) => (
          <div key={s.label} className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <Slider
              min={s.min}
              max={s.max}
              step={s.step}
              value={[s.value]}
              onValueChange={([v]) => s.set(v)}
            />
          </div>
        ))}
      </div>

      {/* Waterfall SVG */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W + 80} ${bars.length * 28 + 60}`} className="w-full" style={{ maxHeight: 280 }}>
          {/* Zero line */}
          <line x1={zero + 40} y1={10} x2={zero + 40} y2={bars.length * 28 + 10} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3,3" />
          <text x={zero + 40} y={bars.length * 28 + 26} fill="rgba(255,255,255,0.4)" fontSize={8} textAnchor="middle">$0</text>

          {bars.map((b, i) => {
            const barW = (Math.abs(b.value) / maxAbs) * (W / 2 - 4);
            const bx = b.value >= 0 ? zero + 40 : zero + 40 - barW;
            const by = 14 + i * 28;
            return (
              <g key={b.label}>
                <text x={36} y={by + 9} fill="rgba(255,255,255,0.6)" fontSize={9} textAnchor="end">
                  {b.label}
                </text>
                <rect x={bx} y={by} width={Math.max(1, barW)} height={16} fill={b.color} fillOpacity={0.8} rx={2} />
                <text
                  x={b.value >= 0 ? bx + barW + 3 : bx - 3}
                  y={by + 10}
                  fill="rgba(255,255,255,0.7)"
                  fontSize={8}
                  textAnchor={b.value >= 0 ? "start" : "end"}
                >
                  {b.value >= 0 ? "+" : ""}
                  {b.value.toFixed(3)}
                </text>
              </g>
            );
          })}

          {/* Residual row */}
          {(() => {
            const i = bars.length;
            const barW = (Math.abs(residual) / maxAbs) * (W / 2 - 4);
            const bx = residual >= 0 ? zero + 40 : zero + 40 - barW;
            const by = 14 + i * 28;
            return (
              <g>
                <text x={36} y={by + 9} fill="rgba(255,255,255,0.4)" fontSize={9} textAnchor="end">Resid.</text>
                <rect x={bx} y={by} width={Math.max(1, barW)} height={16} fill="#6b7280" fillOpacity={0.6} rx={2} />
                <text
                  x={residual >= 0 ? bx + barW + 3 : bx - 3}
                  y={by + 10}
                  fill="rgba(255,255,255,0.5)"
                  fontSize={8}
                  textAnchor={residual >= 0 ? "start" : "end"}
                >
                  {residual.toFixed(3)}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: "Option P&L", value: actualPnl, fmt: (v: number) => `${v >= 0 ? "+" : ""}$${v.toFixed(3)}` },
          { label: "Explained", value: totalExplained, fmt: (v: number) => `${v >= 0 ? "+" : ""}$${v.toFixed(3)}` },
          { label: "New Price", value: actual.price, fmt: (v: number) => `$${v.toFixed(3)}` },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
            <span className="text-muted-foreground">{c.label}:</span>
            <span className={`font-mono font-semibold ${c.value >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {c.fmt(c.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Delta Hedging Simulation ──────────────────────────────────────

const HEDGE_STEPS = 20;
const HEDGE_S0 = 100;
const HEDGE_K = 100;
const HEDGE_T0 = 30;
const HEDGE_SIGMA = 0.30;
const HEDGE_R = 0.05;
const N_CONTRACTS = 10; // long 10 calls = 1000 delta equivalent
const DAILY_REHEDGE_COST = 0.02; // $0.02 per share per trade

function generateHedgePath(seed: number, threshold: number) {
  const rng = mulberry32(seed);
  const dt = HEDGE_T0 / HEDGE_STEPS; // days per step
  const drift = (HEDGE_R - 0.5 * HEDGE_SIGMA * HEDGE_SIGMA) * (dt / 365);
  const diffusion = HEDGE_SIGMA * Math.sqrt(dt / 365);

  const prices: number[] = [HEDGE_S0];
  for (let i = 1; i <= HEDGE_STEPS; i++) {
    const z = normalCDFInverse(rng());
    prices.push(prices[i - 1] * Math.exp(drift + diffusion * z));
  }

  // Box-Muller for z
  function normalCDFInverse(u: number): number {
    // Rational approx
    if (u <= 0) return -5;
    if (u >= 1) return 5;
    const a = [0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
    const b = [0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
    const plo = 0.02425, phi = 1 - plo;
    if (u < plo) {
      const q = Math.sqrt(-2 * Math.log(u));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (u <= phi) {
      const q = u - 0.5, r = q * q;
      return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
        (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - u));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
  }

  // Delta hedge simulation
  const T_remaining = (t: number) => HEDGE_T0 - t * dt;
  let sharePosition = 0; // shares held (hedge)
  let cashPnl = 0;       // cumulative P&L from hedge trades
  let txCost = 0;
  let gammaPnlAcc = 0;
  const hedgeData: {
    step: number;
    S: number;
    delta: number;
    hedgeAdj: number;
    optionValue: number;
    hedgePnl: number;
    gammaPnl: number;
    txCost: number;
    rehedged: boolean;
  }[] = [];

  for (let i = 0; i <= HEDGE_STEPS; i++) {
    const S = prices[i];
    const T = Math.max(1, T_remaining(i));
    const g = bsPrice(S, HEDGE_K, T, HEDGE_SIGMA, HEDGE_R, true);
    const targetShares = -(g.delta * N_CONTRACTS * 100); // short shares to hedge long calls
    const adj = targetShares - sharePosition;
    const doDeltaRehedge = i === 0 || Math.abs(adj) > threshold * N_CONTRACTS * 100;

    if (i === 0) {
      // Initial hedge
      sharePosition = targetShares;
      cashPnl -= targetShares * S; // pay to buy shares
      txCost += Math.abs(targetShares) * DAILY_REHEDGE_COST;
    } else {
      // Option value change
      const prevS = prices[i - 1];
      const prevT = Math.max(1, T_remaining(i - 1));
      const prevG = bsPrice(prevS, HEDGE_K, prevT, HEDGE_SIGMA, HEDGE_R, true);

      // Gamma P&L from price move
      const dS = S - prevS;
      gammaPnlAcc += 0.5 * prevG.gamma * N_CONTRACTS * 100 * dS * dS;

      // Hedge P&L: short shares profited when price fell
      cashPnl += sharePosition * (S - prevS); // wrong sign: we're short so flip
      cashPnl = cashPnl; // already correct: short shares → negative position × price change

      if (doDeltaRehedge) {
        const tx = Math.abs(adj) * DAILY_REHEDGE_COST;
        txCost += tx;
        cashPnl -= adj * S; // pay for rehedge
        sharePosition = targetShares;
      }
    }

    hedgeData.push({
      step: i,
      S,
      delta: g.delta,
      hedgeAdj: doDeltaRehedge && i > 0 ? (targetShares - sharePosition + (targetShares - sharePosition)) : 0,
      optionValue: g.price * N_CONTRACTS * 100,
      hedgePnl: cashPnl,
      gammaPnl: gammaPnlAcc,
      txCost,
      rehedged: doDeltaRehedge && i > 0,
    });
  }

  return { prices, hedgeData };
}

function DeltaHedgingSimulator() {
  const [seed, setSeed] = useState(1337);
  const [threshold, setThreshold] = useState(0.05); // rehedge when delta drifts > 5%

  const { prices, hedgeData } = useMemo(
    () => generateHedgePath(seed, threshold),
    [seed, threshold]
  );

  const minS = Math.min(...prices) * 0.99;
  const maxS = Math.max(...prices) * 1.01;
  const steps = hedgeData.length;

  const svgW = 380;
  const svgH = 200;
  const padL = 50, padR = 16, padT = 16, padB = 32;
  const cW = svgW - padL - padR;
  const cH = svgH - padT - padB;

  function sx(i: number) { return padL + (i / (steps - 1)) * cW; }
  function syS(v: number) { return padT + cH - ((v - minS) / (maxS - minS)) * cH; }

  // Gamma P&L range
  const gammaPnls = hedgeData.map((d) => d.gammaPnl);
  const txCosts = hedgeData.map((d) => -d.txCost);
  const minPnl = Math.min(...gammaPnls, ...txCosts, -1);
  const maxPnl = Math.max(...gammaPnls, ...txCosts, 1);

  function syPnl(v: number) {
    return padT + cH - ((v - minPnl) / (maxPnl - minPnl)) * cH;
  }

  const lastData = hedgeData[hedgeData.length - 1];
  const rehedgeCount = hedgeData.filter((d) => d.rehedged).length;

  return (
    <div className="rounded-md border border-border/20 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Delta Hedging Simulation</p>
          <p className="text-xs text-muted-foreground">Long 10 ATM calls, dynamic delta hedge over {HEDGE_STEPS} steps</p>
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="size-3" />
          New Path
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">Rehedge threshold: {(threshold * 100).toFixed(0)}% delta drift</p>
          <Slider
            min={0.01}
            max={0.20}
            step={0.01}
            value={[threshold]}
            onValueChange={([v]) => setThreshold(v)}
          />
        </div>
      </div>

      {/* Price path SVG */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">Price path & rehedge points</p>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 180 }}>
          {/* Grid */}
          {[minS, (minS + maxS) / 2, maxS].map((v, i) => (
            <g key={i}>
              <line x1={padL} y1={syS(v)} x2={svgW - padR} y2={syS(v)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={padL - 4} y={syS(v) + 3} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="end">
                {v.toFixed(0)}
              </text>
            </g>
          ))}
          {/* Price polyline */}
          <polyline
            points={prices.map((p, i) => `${sx(i)},${syS(p)}`).join(" ")}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={1.5}
          />
          {/* Rehedge dots */}
          {hedgeData.filter((d) => d.rehedged).map((d) => (
            <circle
              key={d.step}
              cx={sx(d.step)}
              cy={syS(prices[d.step])}
              r={3}
              fill="#fbbf24"
            />
          ))}
          {/* HEDGE_K line */}
          <line
            x1={padL}
            y1={syS(HEDGE_K)}
            x2={svgW - padR}
            y2={syS(HEDGE_K)}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <text x={svgW - padR} y={syS(HEDGE_K) - 3} fill="rgba(255,255,255,0.4)" fontSize={7} textAnchor="end">K=100</text>
          <text x={padL} y={padT - 3} fill="rgba(255,255,255,0.4)" fontSize={8}>Price</text>
        </svg>
      </div>

      {/* Gamma P&L vs Tx cost SVG */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">Cumulative Gamma P&L vs Transaction Costs</p>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 160 }}>
          {/* Zero line */}
          <line x1={padL} y1={syPnl(0)} x2={svgW - padR} y2={syPnl(0)} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <text x={padL - 4} y={syPnl(0) + 3} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="end">$0</text>
          {/* Gamma P&L line */}
          <polyline
            points={hedgeData.map((d, i) => `${sx(i)},${syPnl(d.gammaPnl)}`).join(" ")}
            fill="none"
            stroke="#34d399"
            strokeWidth={1.5}
          />
          {/* Tx cost line (negative) */}
          <polyline
            points={hedgeData.map((d, i) => `${sx(i)},${syPnl(-d.txCost)}`).join(" ")}
            fill="none"
            stroke="#f87171"
            strokeWidth={1.5}
          />
          {/* Legend */}
          <line x1={padL} y1={padT} x2={padL + 16} y2={padT} stroke="#34d399" strokeWidth={1.5} />
          <text x={padL + 20} y={padT + 3} fill="rgba(255,255,255,0.6)" fontSize={8}>Gamma P&L</text>
          <line x1={padL + 80} y1={padT} x2={padL + 96} y2={padT} stroke="#f87171" strokeWidth={1.5} />
          <text x={padL + 100} y={padT + 3} fill="rgba(255,255,255,0.6)" fontSize={8}>Tx Cost</text>
        </svg>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: "Gamma P&L", value: `$${lastData.gammaPnl.toFixed(2)}`, pos: lastData.gammaPnl >= 0 },
          { label: "Tx Costs", value: `-$${lastData.txCost.toFixed(2)}`, pos: false },
          { label: "Net", value: `$${(lastData.gammaPnl - lastData.txCost).toFixed(2)}`, pos: lastData.gammaPnl > lastData.txCost },
          { label: "Rehedges", value: `${rehedgeCount}x`, pos: true },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
            <span className="text-muted-foreground">{c.label}:</span>
            <span className={`font-mono font-semibold ${c.pos ? "text-emerald-500" : "text-red-500"}`}>{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 4: Volatility Trading Mechanics ──────────────────────────────────

type VolRegime = "low" | "normal" | "high" | "crisis";

const VOL_REGIMES: Record<VolRegime, { iv: number; rv: number; label: string; color: string }> = {
  low: { iv: 0.12, rv: 0.08, label: "Low Vol", color: "#60a5fa" },
  normal: { iv: 0.25, rv: 0.22, label: "Normal", color: "#34d399" },
  high: { iv: 0.40, rv: 0.38, label: "High Vol", color: "#fbbf24" },
  crisis: { iv: 0.75, rv: 0.65, label: "Crisis", color: "#f87171" },
};

function VolTradingMechanics() {
  const [regime, setRegime] = useState<VolRegime>("normal");
  const [spotMovePct, setSpotMovePct] = useState(0);

  const S = 100;
  const K = 100;
  const T = 30;
  const r = 0.05;
  const { iv, rv } = VOL_REGIMES[regime];

  const call = useMemo(() => bsPrice(S * (1 + spotMovePct / 100), K, T, iv, r, true), [iv, spotMovePct]);
  const put = useMemo(() => bsPrice(S * (1 + spotMovePct / 100), K, T, iv, r, false), [iv, spotMovePct]);
  const baseCall = useMemo(() => bsPrice(S, K, T, iv, r, true), [iv]);
  const basePut = useMemo(() => bsPrice(S, K, T, iv, r, false), [iv]);

  const straddlePrice = baseCall.price + basePut.price;
  // Daily break-even move
  const dailyBE = straddlePrice / (S * Math.sqrt(T));
  // Annualised realized vol implied by straddle
  const stradIV = iv;
  // Theta of straddle (daily)
  const stradTheta = (baseCall.theta + basePut.theta); // per day
  // Gamma of straddle
  const stradGamma = baseCall.gamma + basePut.gamma;
  // Vol P&L per day at current realized vol
  const dailyGammaPnl = 0.5 * stradGamma * Math.pow(S * rv / Math.sqrt(252), 2);
  const volEdge = dailyGammaPnl + stradTheta; // theta negative, so this is net

  // Straddle P&L at new spot
  const newStraddle = call.price + put.price;
  const straddlePnl = newStraddle - straddlePrice;

  // Historical vol calculations (use seeded random path)
  const rvCalcs: { label: string; rv: number }[] = useMemo(() => {
    function calcRV(window: number) {
      const rng = mulberry32(regime === "low" ? 42 : regime === "normal" ? 100 : regime === "high" ? 200 : 999);
      const prices: number[] = [S];
      for (let i = 0; i < window + 5; i++) {
        const ret = (rng() - 0.5) * rv * 2 * Math.sqrt(1 / 252);
        prices.push(prices[prices.length - 1] * (1 + ret));
      }
      const logRets = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
      const mean = logRets.reduce((a, b) => a + b, 0) / logRets.length;
      const variance = logRets.reduce((a, r) => a + (r - mean) ** 2, 0) / (logRets.length - 1);
      return Math.sqrt(variance * 252);
    }
    return [
      { label: "5d HV", rv: calcRV(5) },
      { label: "10d HV", rv: calcRV(10) },
      { label: "30d HV", rv: calcRV(30) },
    ];
  }, [regime, rv]);

  return (
    <div className="rounded-md border border-border/20 bg-card p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Volatility Trading Mechanics</p>
        <p className="text-xs text-muted-foreground">Long straddle (ATM call + put) — how realized vs implied vol drives P&L</p>
      </div>

      {/* Regime selector */}
      <div className="flex gap-1.5 flex-wrap">
        {(Object.entries(VOL_REGIMES) as [VolRegime, typeof VOL_REGIMES[VolRegime]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setRegime(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              regime === key
                ? "bg-card border-border text-foreground"
                : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
            }`}
            style={regime === key ? { borderColor: cfg.color, color: cfg.color } : {}}
          >
            {cfg.label} (IV {(cfg.iv * 100).toFixed(0)}%)
          </button>
        ))}
      </div>

      {/* Spot move */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Spot move: {spotMovePct > 0 ? "+" : ""}{spotMovePct}%</p>
        <Slider min={-20} max={20} step={1} value={[spotMovePct]} onValueChange={([v]) => setSpotMovePct(v)} />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Straddle Price", value: `$${straddlePrice.toFixed(2)}`, neutral: true },
          { label: "Daily Break-Even", value: `${(dailyBE * 100).toFixed(2)}%`, neutral: true },
          { label: "IV vs RV", value: `${(stradIV * 100).toFixed(0)}% vs ${(rv * 100).toFixed(0)}%`, neutral: stradIV - rv < 0.02 },
          { label: "Straddle P&L", value: `${straddlePnl >= 0 ? "+" : ""}$${straddlePnl.toFixed(2)}`, pos: straddlePnl >= 0 },
          { label: "Daily Vol Edge", value: `${volEdge >= 0 ? "+" : ""}$${volEdge.toFixed(3)}`, pos: volEdge >= 0 },
          { label: "Straddle Theta/d", value: `$${stradTheta.toFixed(3)}`, pos: stradTheta >= 0 },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-muted p-2.5">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className={`text-sm font-mono font-semibold mt-0.5 ${
              m.neutral ? "text-foreground" : m.pos ? "text-emerald-500" : "text-red-500"
            }`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Historical vol dashboard */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Historical Volatility Dashboard</p>
        <div className="flex gap-2">
          {rvCalcs.map((c) => (
            <div key={c.label} className="flex-1 rounded-lg bg-muted p-2 text-center">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={`text-sm font-mono font-semibold ${c.rv < iv ? "text-emerald-500" : "text-red-500"}`}>
                {(c.rv * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">{c.rv < iv ? "< IV" : "> IV"}</p>
            </div>
          ))}
          <div className="flex-1 rounded-lg bg-muted p-2 text-center">
            <p className="text-xs text-muted-foreground">Straddle Gamma</p>
            <p className="text-sm font-mono font-semibold text-foreground">{(stradGamma * 100).toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 5: Risk Reversal & Skew Trading ──────────────────────────────────

function SkewTradingPanel() {
  const [scenario, setScenario] = useState<"neutral" | "volUp" | "volDown" | "priceUp" | "priceDown">("neutral");

  const S = 100;
  const T = 30;
  const r = 0.05;
  const atmIV = 0.25;

  // Simulate skew: 25-delta put & call IVs across different skew environments
  const skewData = useMemo(() => {
    const rng = mulberry32(1337);
    // 7 strike moneyness points from OTM put to OTM call
    const moneyness = [0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10];
    return moneyness.map((m) => {
      const K = S * m;
      // Put skew: OTM puts get a premium
      const skewPremium = Math.max(0, (1 - m) * 0.28 + rng() * 0.02);
      const callDiscount = Math.max(0, (m - 1) * 0.12 + rng() * 0.01);
      const iv = atmIV + skewPremium - callDiscount;
      const opt = bsPrice(S, K, T, iv, r, m < 1);
      return { m, K, iv, delta: opt.delta, price: opt.price };
    });
  }, []);

  // Find 25-delta strikes
  const put25 = skewData.reduce((best, d) =>
    d.m < 1 && Math.abs(Math.abs(d.delta) - 0.25) < Math.abs(Math.abs(best.delta) - 0.25) ? d : best
  );
  const call25 = skewData.reduce((best, d) =>
    d.m > 1 && Math.abs(d.delta - 0.25) < Math.abs(best.delta - 0.25) ? d : best
  );

  const riskReversalIV = put25.iv - call25.iv; // typically positive (puts richer)

  // Scenario P&L for a risk reversal (sell put, buy call)
  const scenarios: Record<string, { spotShift: number; ivShift: number; label: string; color: string }> = {
    neutral: { spotShift: 0, ivShift: 0, label: "Neutral", color: "#9ca3af" },
    volUp: { spotShift: 0, ivShift: 0.10, label: "Vol Spike +10%", color: "#f87171" },
    volDown: { spotShift: 0, ivShift: -0.08, label: "Vol Crush -8%", color: "#34d399" },
    priceUp: { spotShift: 10, ivShift: -0.05, label: "Price Up +10%", color: "#60a5fa" },
    priceDown: { spotShift: -10, ivShift: 0.15, label: "Price Down -10%", color: "#f87171" },
  };

  const sc = scenarios[scenario];
  const newS = S + sc.spotShift;
  const newPut25IV = Math.max(0.05, put25.iv + sc.ivShift);
  const newCall25IV = Math.max(0.05, call25.iv + sc.ivShift * 0.7); // calls less reactive

  const initPutEntry = bsPrice(S, put25.K, T, put25.iv, r, false);
  const initCallEntry = bsPrice(S, call25.K, T, call25.iv, r, true);
  const newPutVal = bsPrice(newS, put25.K, Math.max(1, T - 2), newPut25IV, r, false);
  const newCallVal = bsPrice(newS, call25.K, Math.max(1, T - 2), newCall25IV, r, true);

  // Risk reversal: sell 25Δ put, buy 25Δ call
  const initRRCost = initCallEntry.price - initPutEntry.price;
  const newRRValue = newCallVal.price - newPutVal.price;
  const rrPnl = newRRValue - initRRCost;

  // Smile SVG data
  const svgW = 340;
  const svgH = 140;
  const padL = 40, padR = 16, padT = 16, padB = 28;
  const cW = svgW - padL - padR;
  const cH = svgH - padT - padB;
  const ivMin = Math.min(...skewData.map((d) => d.iv)) * 0.95;
  const ivMax = Math.max(...skewData.map((d) => d.iv)) * 1.05;

  function smileSx(i: number) { return padL + (i / (skewData.length - 1)) * cW; }
  function smileSy(iv: number) { return padT + cH - ((iv - ivMin) / (ivMax - ivMin)) * cH; }

  return (
    <div className="rounded-md border border-border/20 bg-card p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Risk Reversal & Skew Trading</p>
        <p className="text-xs text-muted-foreground">25-delta risk reversal: sell OTM put, buy OTM call</p>
      </div>

      {/* Vol Smile SVG */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">Volatility Smile (IV vs Moneyness)</p>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 140 }}>
          {/* Grid */}
          {[ivMin, (ivMin + ivMax) / 2, ivMax].map((v, i) => (
            <g key={i}>
              <line x1={padL} y1={smileSy(v)} x2={svgW - padR} y2={smileSy(v)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={padL - 4} y={smileSy(v) + 3} fill="rgba(255,255,255,0.3)" fontSize={7} textAnchor="end">
                {(v * 100).toFixed(0)}%
              </text>
            </g>
          ))}
          {/* Smile polyline */}
          <polyline
            points={skewData.map((d, i) => `${smileSx(i)},${smileSy(d.iv)}`).join(" ")}
            fill="none"
            stroke="#a78bfa"
            strokeWidth={2}
          />
          {/* Data dots */}
          {skewData.map((d, i) => (
            <circle key={i} cx={smileSx(i)} cy={smileSy(d.iv)} r={3} fill="#a78bfa" />
          ))}
          {/* Highlight 25Δ strikes */}
          <circle cx={smileSx(skewData.indexOf(put25))} cy={smileSy(put25.iv)} r={5} fill="none" stroke="#f87171" strokeWidth={1.5} />
          <circle cx={smileSx(skewData.indexOf(call25))} cy={smileSy(call25.iv)} r={5} fill="none" stroke="#34d399" strokeWidth={1.5} />
          <text x={smileSx(skewData.indexOf(put25))} y={smileSy(put25.iv) - 7} fill="#f87171" fontSize={7} textAnchor="middle">25Δ P</text>
          <text x={smileSx(skewData.indexOf(call25))} y={smileSy(call25.iv) - 7} fill="#34d399" fontSize={7} textAnchor="middle">25Δ C</text>
          {/* X-axis labels */}
          {skewData.map((d, i) => (
            <text key={i} x={smileSx(i)} y={svgH - 4} fill="rgba(255,255,255,0.3)" fontSize={6} textAnchor="middle">
              {d.m === 1.0 ? "ATM" : `${(d.m * 100).toFixed(0)}`}
            </text>
          ))}
          {/* ATM line */}
          <line
            x1={smileSx(skewData.findIndex((d) => d.m === 1.0))}
            y1={padT}
            x2={smileSx(skewData.findIndex((d) => d.m === 1.0))}
            y2={svgH - padB}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        </svg>
      </div>

      {/* Skew metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {[
          { label: "25Δ Put IV", value: `${(put25.iv * 100).toFixed(1)}%`, color: "#f87171" },
          { label: "25Δ Call IV", value: `${(call25.iv * 100).toFixed(1)}%`, color: "#34d399" },
          { label: "Risk Reversal", value: `${(riskReversalIV * 100).toFixed(1)}%`, color: "#a78bfa" },
          { label: "RR Entry Cost", value: `$${initRRCost.toFixed(2)}`, color: "#fbbf24" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-muted p-2 text-center">
            <p className="text-muted-foreground">{m.label}</p>
            <p className="font-mono font-semibold mt-0.5" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Scenario selector */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Scenario P&L (sell 25Δ put, buy 25Δ call)</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(scenarios) as [string, typeof scenarios[string]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setScenario(key as typeof scenario)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                scenario === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* P&L summary */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: "Call Leg P&L", value: newCallVal.price - initCallEntry.price },
          { label: "Put Leg P&L", value: -(newPutVal.price - initPutEntry.price) },
          { label: "Total RR P&L", value: rrPnl },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
            <span className="text-muted-foreground">{c.label}:</span>
            <span className={`font-mono font-semibold ${c.value >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {c.value >= 0 ? "+" : ""}${c.value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main GreeksSimulator ─────────────────────────────────────────────────────

type SimSection = "surface" | "attribution" | "hedging" | "voltrading" | "skew";

interface SectionConfig {
  id: SimSection;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const SECTIONS: SectionConfig[] = [
  { id: "surface", label: "Vol Surface", icon: <Layers className="size-3.5" />, description: "3D Implied Volatility Surface" },
  { id: "attribution", label: "P&L Attribution", icon: <BarChart2 className="size-3.5" />, description: "Greeks-based P&L Decomposition" },
  { id: "hedging", label: "Delta Hedging", icon: <Activity className="size-3.5" />, description: "Dynamic Delta Hedge Simulation" },
  { id: "voltrading", label: "Vol Trading", icon: <TrendingUp className="size-3.5" />, description: "Straddle & Volatility Mechanics" },
  { id: "skew", label: "Skew Trading", icon: <Shuffle className="size-3.5" />, description: "Risk Reversal & Vol Smile" },
];

export default function GreeksSimulator() {
  const [active, setActive] = useState<SimSection>("surface");

  return (
    <div className="space-y-4">
      {/* Section nav */}
      <div className="rounded-md border border-border/20 bg-card p-1 flex flex-wrap gap-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              active === s.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Active section description */}
      <div className="flex items-center gap-2 px-1">
        <DollarSign className="size-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {SECTIONS.find((s) => s.id === active)?.description}
        </p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {active === "surface" && <VolSurface3D />}
          {active === "attribution" && <PnlAttribution />}
          {active === "hedging" && <DeltaHedgingSimulator />}
          {active === "voltrading" && <VolTradingMechanics />}
          {active === "skew" && <SkewTradingPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
