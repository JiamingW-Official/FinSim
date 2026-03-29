"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Calendar,
  Table2,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

// ─── Black-Scholes helpers ────────────────────────────────────────────────────
function normalCDF(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  return 0.5 * (1 + sign * (1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)));
}

function bsCall(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return Math.max(S - K, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

function bsPut(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return Math.max(K - S, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

function bsCallDelta(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return S > K ? 1 : 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return normalCDF(d1);
}

function bsTheta(S: number, K: number, T: number, r: number, sigma: number, isCall: boolean): number {
  if (T <= 0) return 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const nd1 = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1);
  const theta = (-S * nd1 * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (isCall ? normalCDF(d2) : -normalCDF(-d2));
  return theta / 365;
}

function probOTM(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return S < K ? 1 : 0;
  const d2 = (Math.log(S / K) + (r - 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return normalCDF(-d2);
}

// ─── Seeded PRNG (seed 672005) ────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────
const W = 480;
const H = 220;
const PAD = { top: 16, right: 24, bottom: 40, left: 56 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function toSvg(val: number, min: number, max: number, axis: "x" | "y"): number {
  if (axis === "x") return PAD.left + ((val - min) / (max - min)) * INNER_W;
  return PAD.top + INNER_H - ((val - min) / (max - min)) * INNER_H;
}

interface PayoffPoint {
  price: number;
  pnl: number;
}

function PayoffSVG({ points, breakevens }: { points: PayoffPoint[]; breakevens: number[] }) {
  const pnls = points.map((p) => p.pnl);
  const prices = points.map((p) => p.price);
  const rawMin = Math.min(...pnls);
  const rawMax = Math.max(...pnls);
  const pad = Math.max(Math.abs(rawMax - rawMin) * 0.1, 5);
  const pnlMin = rawMin - pad;
  const pnlMax = rawMax + pad;
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);

  const pathD = points
    .map((p, i) => {
      const x = toSvg(p.price, priceMin, priceMax, "x");
      const y = toSvg(p.pnl, pnlMin, pnlMax, "y");
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const zeroY = toSvg(0, pnlMin, pnlMax, "y");

  // Positive fill
  const posPath =
    points
      .filter((p: { price: number; pnl: number }) => p.pnl >= 0)
      .length > 0
      ? `${pathD} L${toSvg(priceMax, priceMin, priceMax, "x").toFixed(1)},${zeroY.toFixed(1)} L${PAD.left.toFixed(1)},${zeroY.toFixed(1)} Z`
      : "";

  const yTicks = [pnlMin, 0, pnlMax].map((v) => ({
    val: v,
    y: toSvg(v, pnlMin, pnlMax, "y"),
    label: v === 0 ? "0" : `${v > 0 ? "+" : ""}${v.toFixed(0)}`,
  }));

  const xTicks = [priceMin, (priceMin + priceMax) / 2, priceMax].map((v) => ({
    val: v,
    x: toSvg(v, priceMin, priceMax, "x"),
    label: `$${v.toFixed(0)}`,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Grid */}
      {yTicks.map((t) => (
        <line
          key={t.val}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={t.y}
          y2={t.y}
          stroke={t.val === 0 ? "#6b7280" : "#374151"}
          strokeWidth={t.val === 0 ? 1 : 0.5}
          strokeDasharray={t.val === 0 ? "none" : "3 3"}
        />
      ))}
      {/* Positive fill */}
      <clipPath id="pos-clip">
        <rect x={PAD.left} y={PAD.top} width={INNER_W} height={zeroY - PAD.top} />
      </clipPath>
      <clipPath id="neg-clip">
        <rect x={PAD.left} y={zeroY} width={INNER_W} height={PAD.top + INNER_H - zeroY} />
      </clipPath>
      <path d={pathD + ` L${toSvg(priceMax, priceMin, priceMax, "x").toFixed(1)},${zeroY.toFixed(1)} L${PAD.left.toFixed(1)},${zeroY.toFixed(1)} Z`} fill="#22c55e" fillOpacity={0.15} clipPath="url(#pos-clip)" />
      <path d={pathD + ` L${toSvg(priceMax, priceMin, priceMax, "x").toFixed(1)},${zeroY.toFixed(1)} L${PAD.left.toFixed(1)},${zeroY.toFixed(1)} Z`} fill="#ef4444" fillOpacity={0.15} clipPath="url(#neg-clip)" />
      {/* Main path */}
      <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth={2} />
      {/* Breakevens */}
      {breakevens.map((be, i) => {
        const bx = toSvg(be, priceMin, priceMax, "x");
        return (
          <g key={i}>
            <line x1={bx} x2={bx} y1={PAD.top} y2={PAD.top + INNER_H} stroke="#fbbf24" strokeWidth={1} strokeDasharray="4 3" />
            <text x={bx + 3} y={PAD.top + 12} fill="#fbbf24" fontSize={9} fontFamily="monospace">
              BE${be.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* Axes labels */}
      {yTicks.map((t) => (
        <text key={t.val} x={PAD.left - 4} y={t.y + 4} textAnchor="end" fill="#9ca3af" fontSize={9} fontFamily="monospace">
          {t.label}
        </text>
      ))}
      {xTicks.map((t) => (
        <text key={t.val} x={t.x} y={H - 6} textAnchor="middle" fill="#9ca3af" fontSize={9} fontFamily="monospace">
          {t.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Reusable metric chip ─────────────────────────────────────────────────────
function Metric({ label, value, sub, color = "default" }: { label: string; value: string; sub?: string; color?: "green" | "red" | "amber" | "default" }) {
  const colors: Record<string, string> = {
    green: "border-green-500/30 bg-green-500/5 text-green-400",
    red: "border-red-500/30 bg-red-500/5 text-red-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    default: "border-border bg-muted/50 text-foreground",
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-mono font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-border bg-primary/5 p-3 text-sm text-primary">
      <Info size={14} className="mt-0.5 shrink-0 text-primary" />
      <div>{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-muted-foreground mb-3">{children}</h3>;
}

// ─── COVERED CALL TAB ─────────────────────────────────────────────────────────
function CoveredCallTab() {
  const [spotPrice, setSpotPrice] = useState(150);
  const [strikeOTM, setStrikeOTM] = useState(5); // % OTM
  const [iv, setIv] = useState(30); // %
  const [dte, setDte] = useState(30);
  const [shares, setShares] = useState(100);
  const r = 0.05;

  const K = useMemo(() => spotPrice * (1 + strikeOTM / 100), [spotPrice, strikeOTM]);
  const T = dte / 365;
  const sigma = iv / 100;

  const premium = useMemo(() => bsCall(spotPrice, K, T, r, sigma), [spotPrice, K, T, sigma]);
  const delta = useMemo(() => bsCallDelta(spotPrice, K, T, r, sigma), [spotPrice, K, T, sigma]);
  const theta = useMemo(() => bsTheta(spotPrice, K, T, r, sigma, true), [spotPrice, K, T, sigma]);
  const annualizedYield = useMemo(() => (premium / spotPrice) * (365 / dte) * 100, [premium, spotPrice, dte]);
  const assignmentProb = useMemo(() => 1 - probOTM(spotPrice, K, T, r, sigma), [spotPrice, K, T, sigma]);
  const maxProfit = (K - spotPrice + premium) * shares;
  const maxLoss = (spotPrice - premium) * shares;
  const breakeven = spotPrice - premium;

  const points: PayoffPoint[] = useMemo(() => {
    const low = spotPrice * 0.7;
    const high = spotPrice * 1.3;
    return Array.from({ length: 80 }, (_, i) => {
      const price = low + (i / 79) * (high - low);
      const stockPnl = price - spotPrice;
      const callPnl = premium - Math.max(price - K, 0);
      return { price, pnl: (stockPnl + callPnl) * shares };
    });
  }, [spotPrice, K, premium, shares]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <InfoBox>
        A <strong>Covered Call</strong> means you own 100 shares and sell a call option against them. You collect premium
        upfront, capping your upside at the strike price but reducing your cost basis.
      </InfoBox>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <SectionTitle>Parameters</SectionTitle>
          {[
            { label: `Spot Price: $${spotPrice}`, min: 50, max: 500, val: spotPrice, set: setSpotPrice, step: 1 },
            { label: `Strike OTM: ${strikeOTM}%`, min: 0, max: 20, val: strikeOTM, set: setStrikeOTM, step: 1 },
            { label: `IV: ${iv}%`, min: 10, max: 80, val: iv, set: setIv, step: 1 },
            { label: `DTE: ${dte} days`, min: 7, max: 90, val: dte, set: setDte, step: 1 },
            { label: `Shares: ${shares}`, min: 100, max: 1000, val: shares, set: setShares, step: 100 },
          ].map(({ label, min, max, val, set, step }) => (
            <div key={label.split(":")[0]}>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{label}</span>
              </div>
              <Slider min={min} max={max} step={step} value={[val]} onValueChange={([v]) => set(v)} className="w-full" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Call Premium" value={`$${premium.toFixed(2)}`} color="green" />
            <Metric label="Annualized Yield" value={`${annualizedYield.toFixed(1)}%`} color="green" />
            <Metric label="Assignment Prob" value={`${(assignmentProb * 100).toFixed(0)}%`} color={assignmentProb > 0.5 ? "amber" : "default"} />
            <Metric label="Delta (short)" value={`-${delta.toFixed(2)}`} color="default" />
            <Metric label="Max Profit" value={`$${maxProfit.toFixed(0)}`} sub={`at $${K.toFixed(2)}+`} color="green" />
            <Metric label="Downside Basis" value={`$${breakeven.toFixed(2)}`} sub="breakeven" color="default" />
            <Metric label="Daily Theta" value={`+$${Math.abs(theta * 100).toFixed(2)}`} sub="per contract" color="green" />
            <Metric label="Max Loss" value={`-$${maxLoss.toFixed(0)}`} sub="if stock → 0" color="red" />
          </div>
        </div>
      </div>

      {/* Payoff */}
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle>Payoff at Expiration</SectionTitle>
        <PayoffSVG points={points} breakevens={[breakeven]} />
        <div className="flex gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
          <span className="text-green-400">— Covered Call P&L</span>
          <span className="text-amber-400">- - Breakeven ${breakeven.toFixed(2)}</span>
          <span>Strike ${K.toFixed(2)} | {dte}DTE | IV {iv}%</span>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
          <div className="flex items-center gap-1.5 text-green-400 font-medium mb-1.5">
            <CheckCircle2 size={13} /> Best Conditions
          </div>
          <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside">
            <li>Mildly bullish or neutral outlook</li>
            <li>High IV environment (sell expensive premium)</li>
            <li>Stock you're comfortable holding long-term</li>
            <li>Choose 30–45 DTE for optimal theta decay</li>
          </ul>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm">
          <div className="flex items-center gap-1.5 text-red-400 font-medium mb-1.5">
            <AlertTriangle size={13} /> Assignment Risk
          </div>
          <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside">
            <li>Shares called away if price exceeds strike at expiry</li>
            <li>Early assignment risk near ex-dividend dates</li>
            <li>Roll the call up/out to avoid assignment</li>
            <li>Tax event triggered on assignment of long shares</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CASH-SECURED PUT TAB ─────────────────────────────────────────────────────
function CashSecuredPutTab() {
  const [spotPrice, setSpotPrice] = useState(150);
  const [strikeOTM, setStrikeOTM] = useState(5);
  const [iv, setIv] = useState(30);
  const [dte, setDte] = useState(30);
  const r = 0.05;

  const K = useMemo(() => spotPrice * (1 - strikeOTM / 100), [spotPrice, strikeOTM]);
  const T = dte / 365;
  const sigma = iv / 100;

  const premium = useMemo(() => bsPut(spotPrice, K, T, r, sigma), [spotPrice, K, T, sigma]);
  const theta = useMemo(() => bsTheta(spotPrice, K, T, r, sigma, false), [spotPrice, K, T, sigma]);
  const annualizedYield = useMemo(() => (premium / K) * (365 / dte) * 100, [premium, K, dte]);
  const effectivePurchasePrice = K - premium;
  const assignmentProb = useMemo(() => 1 - probOTM(spotPrice, K, T, r, sigma), [spotPrice, K, T, sigma]);
  const marginRequired = K * 100;
  const breakeven = K - premium;

  const points: PayoffPoint[] = useMemo(() => {
    const low = spotPrice * 0.6;
    const high = spotPrice * 1.2;
    return Array.from({ length: 80 }, (_, i) => {
      const price = low + (i / 79) * (high - low);
      const putPnl = premium - Math.max(K - price, 0);
      return { price, pnl: putPnl * 100 };
    });
  }, [spotPrice, K, premium]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <InfoBox>
        A <strong>Cash-Secured Put</strong> sells a put option while holding enough cash to buy 100 shares if assigned.
        Part of the <strong>Wheel Strategy</strong>: CSP → assignment → Covered Call → repeat.
      </InfoBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <SectionTitle>Parameters</SectionTitle>
          {[
            { label: `Spot Price: $${spotPrice}`, min: 50, max: 500, val: spotPrice, set: setSpotPrice, step: 1 },
            { label: `Strike OTM: ${strikeOTM}%`, min: 0, max: 20, val: strikeOTM, set: setStrikeOTM, step: 1 },
            { label: `IV: ${iv}%`, min: 10, max: 80, val: iv, set: setIv, step: 1 },
            { label: `DTE: ${dte} days`, min: 7, max: 90, val: dte, set: setDte, step: 1 },
          ].map(({ label, min, max, val, set, step }) => (
            <div key={label.split(":")[0]}>
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <Slider min={min} max={max} step={step} value={[val]} onValueChange={([v]) => set(v)} className="w-full" />
            </div>
          ))}

          <div className="mt-4 p-3 rounded border border-border bg-primary/5 text-xs text-primary space-y-1">
            <div className="font-semibold text-primary">Wheel Strategy Flow</div>
            <div>1. Sell CSP → collect premium</div>
            <div>2. If assigned → own shares at effective price</div>
            <div>3. Sell Covered Call against shares</div>
            <div>4. If called away → restart with CSP</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Put Premium" value={`$${premium.toFixed(2)}`} color="green" />
            <Metric label="Annualized Yield" value={`${annualizedYield.toFixed(1)}%`} color="green" />
            <Metric label="Strike Price" value={`$${K.toFixed(2)}`} color="default" />
            <Metric label="Effective Buy Price" value={`$${effectivePurchasePrice.toFixed(2)}`} sub={`${((1 - effectivePurchasePrice / spotPrice) * 100).toFixed(1)}% discount`} color="green" />
            <Metric label="Cash Required" value={`$${marginRequired.toFixed(0)}`} sub="per contract" color="default" />
            <Metric label="Assignment Prob" value={`${(assignmentProb * 100).toFixed(0)}%`} color={assignmentProb > 0.5 ? "amber" : "default"} />
            <Metric label="Daily Theta" value={`+$${Math.abs(theta * 100).toFixed(2)}`} sub="per contract" color="green" />
            <Metric label="Breakeven" value={`$${breakeven.toFixed(2)}`} color="default" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle>Payoff at Expiration</SectionTitle>
        <PayoffSVG points={points} breakevens={[breakeven]} />
        <div className="flex gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
          <span className="text-green-400">— CSP P&L</span>
          <span className="text-amber-400">- - Breakeven ${breakeven.toFixed(2)}</span>
          <span>Strike ${K.toFixed(2)} | {dte}DTE | IV {iv}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
          <div className="flex items-center gap-1.5 text-green-400 font-medium text-sm mb-1.5">
            <CheckCircle2 size={13} /> Best Conditions
          </div>
          <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside">
            <li>Bullish or neutral on the underlying</li>
            <li>Willing to buy shares at the strike price</li>
            <li>High IV for maximum premium collection</li>
            <li>30–45 DTE sweet spot for theta decay</li>
          </ul>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium text-sm mb-1.5">
            <AlertTriangle size={13} /> Margin Considerations
          </div>
          <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside">
            <li>Must hold full cash amount (${marginRequired.toFixed(0)}) in account</li>
            <li>Some brokers allow margin → reduces capital tie-up</li>
            <li>ROC is higher with margin (but risk increases)</li>
            <li>IRA accounts: cash-secured only, no margin</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// ─── IRON CONDOR TAB ─────────────────────────────────────────────────────────
function IronCondorTab() {
  const [spotPrice, setSpotPrice] = useState(150);
  const [putWingWidth, setPutWingWidth] = useState(5);
  const [callWingWidth, setCallWingWidth] = useState(5);
  const [wingSpread, setWingSpread] = useState(10);
  const [iv, setIv] = useState(30);
  const [dte, setDte] = useState(45);
  const r = 0.05;

  const shortPutK = useMemo(() => spotPrice * (1 - wingSpread / 200), [spotPrice, wingSpread]);
  const longPutK = useMemo(() => shortPutK - putWingWidth, [shortPutK, putWingWidth]);
  const shortCallK = useMemo(() => spotPrice * (1 + wingSpread / 200), [spotPrice, wingSpread]);
  const longCallK = useMemo(() => shortCallK + callWingWidth, [shortCallK, callWingWidth]);
  const T = dte / 365;
  const sigma = iv / 100;

  const shortPutPrem = useMemo(() => bsPut(spotPrice, shortPutK, T, r, sigma), [spotPrice, shortPutK, T, sigma]);
  const longPutPrem = useMemo(() => bsPut(spotPrice, longPutK, T, r, sigma), [spotPrice, longPutK, T, sigma]);
  const shortCallPrem = useMemo(() => bsCall(spotPrice, shortCallK, T, r, sigma), [spotPrice, shortCallK, T, sigma]);
  const longCallPrem = useMemo(() => bsCall(spotPrice, longCallK, T, r, sigma), [spotPrice, longCallK, T, sigma]);

  const netCredit = useMemo(() => shortPutPrem - longPutPrem + shortCallPrem - longCallPrem, [shortPutPrem, longPutPrem, shortCallPrem, longCallPrem]);
  const maxLoss = useMemo(() => Math.max(putWingWidth, callWingWidth) - netCredit, [putWingWidth, callWingWidth, netCredit]);
  const maxProfit = netCredit;
  const lowerBE = shortPutK - netCredit;
  const upperBE = shortCallK + netCredit;
  const probOfProfit = useMemo(() => {
    const probAboveLower = 1 - probOTM(spotPrice, lowerBE, T, r, sigma);
    const probBelowUpper = probOTM(spotPrice, upperBE, T, r, sigma);
    return Math.max(0, probAboveLower + probBelowUpper - 1);
  }, [spotPrice, lowerBE, upperBE, T, sigma]);

  const rrRatio = maxProfit / Math.max(maxLoss, 0.01);

  const points: PayoffPoint[] = useMemo(() => {
    const low = spotPrice * 0.7;
    const high = spotPrice * 1.3;
    return Array.from({ length: 100 }, (_, i) => {
      const price = low + (i / 99) * (high - low);
      let pnl = netCredit;
      if (price < longPutK) pnl = netCredit - (shortPutK - longPutK);
      else if (price < shortPutK) pnl = netCredit - (shortPutK - price);
      if (price > longCallK) pnl = Math.min(pnl, netCredit - (longCallK - shortCallK));
      else if (price > shortCallK) pnl = Math.min(pnl, netCredit - (price - shortCallK));
      return { price, pnl: pnl * 100 };
    });
  }, [spotPrice, longPutK, shortPutK, shortCallK, longCallK, netCredit]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <InfoBox>
        An <strong>Iron Condor</strong> sells an OTM put spread + OTM call spread. You profit if the stock stays
        within a range, collecting both premiums as credit. Defined risk on both sides.
      </InfoBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <SectionTitle>Parameters</SectionTitle>
          {[
            { label: `Spot Price: $${spotPrice}`, min: 50, max: 500, val: spotPrice, set: setSpotPrice, step: 1 },
            { label: `Wing Spread: ±${wingSpread / 2}% (${wingSpread}% total)`, min: 4, max: 30, val: wingSpread, set: setWingSpread, step: 1 },
            { label: `Put Wing Width: $${putWingWidth}`, min: 2, max: 20, val: putWingWidth, set: setPutWingWidth, step: 1 },
            { label: `Call Wing Width: $${callWingWidth}`, min: 2, max: 20, val: callWingWidth, set: setCallWingWidth, step: 1 },
            { label: `IV: ${iv}%`, min: 10, max: 80, val: iv, set: setIv, step: 1 },
            { label: `DTE: ${dte} days`, min: 14, max: 90, val: dte, set: setDte, step: 1 },
          ].map(({ label, min, max, val, set, step }) => (
            <div key={label.split(":")[0]}>
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <Slider min={min} max={max} step={step} value={[val]} onValueChange={([v]) => set(v)} className="w-full" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {/* 4-leg breakdown */}
          <div className="rounded-lg border border-border bg-card p-3">
            <SectionTitle>4-Leg Breakdown</SectionTitle>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { action: "BUY", type: "PUT", strike: longPutK, premium: longPutPrem, dir: -1 },
                { action: "SELL", type: "PUT", strike: shortPutK, premium: shortPutPrem, dir: 1 },
                { action: "SELL", type: "CALL", strike: shortCallK, premium: shortCallPrem, dir: 1 },
                { action: "BUY", type: "CALL", strike: longCallK, premium: longCallPrem, dir: -1 },
              ].map((leg) => (
                <div key={`${leg.action}-${leg.type}-${leg.strike.toFixed(0)}`} className="flex justify-between items-center">
                  <Badge variant="outline" className={`text-xs ${leg.action === "SELL" ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"}`}>
                    {leg.action}
                  </Badge>
                  <span className="text-muted-foreground">{leg.type} ${leg.strike.toFixed(1)}</span>
                  <span className={leg.dir > 0 ? "text-green-400" : "text-red-400"}>
                    {leg.dir > 0 ? "+" : "-"}${leg.premium.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
                <span className="text-muted-foreground">Net Credit</span>
                <span className="text-green-400">+${netCredit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Max Profit" value={`$${(maxProfit * 100).toFixed(0)}`} color="green" />
            <Metric label="Max Loss" value={`-$${(maxLoss * 100).toFixed(0)}`} color="red" />
            <Metric label="Lower BE" value={`$${lowerBE.toFixed(2)}`} color="default" />
            <Metric label="Upper BE" value={`$${upperBE.toFixed(2)}`} color="default" />
            <Metric label="Prob of Profit" value={`${(probOfProfit * 100).toFixed(0)}%`} color={probOfProfit > 0.6 ? "green" : "amber"} />
            <Metric label="R:R Ratio" value={`${rrRatio.toFixed(2)}x`} color="default" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle>Payoff at Expiration</SectionTitle>
        <PayoffSVG points={points} breakevens={[lowerBE, upperBE]} />
        <div className="flex gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
          <span className="text-green-400">— Iron Condor P&L</span>
          <span className="text-amber-400">- - Breakevens</span>
          <span>Profit zone: ${lowerBE.toFixed(1)} – ${upperBE.toFixed(1)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-muted-foreground font-medium mb-1.5">Adjustment: IV Spike</div>
          <div className="text-muted-foreground space-y-1">
            <div>• Buy back the short option in the threatened wing</div>
            <div>• Roll the wing further OTM for credit if possible</div>
            <div>• Consider closing entire condor at 2× credit</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-muted-foreground font-medium mb-1.5">Management Rules</div>
          <div className="text-muted-foreground space-y-1">
            <div>• Close at 50% of max profit (take the win)</div>
            <div>• Stop loss at 2× the credit received</div>
            <div>• Consider rolling 21 DTE if untested</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-muted-foreground font-medium mb-1.5">Best Conditions</div>
          <div className="text-muted-foreground space-y-1">
            <div>• High IV with range-bound price action</div>
            <div>• Post-earnings, post-event environment</div>
            <div>• VIX elevated (20+) for fatter premiums</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CALENDAR SPREAD TAB ─────────────────────────────────────────────────────
function CalendarSpreadTab() {
  const [spotPrice, setSpotPrice] = useState(150);
  const [strikePct, setStrikePct] = useState(0); // % from spot
  const [frontIv, setFrontIv] = useState(35);
  const [backIv, setBackIv] = useState(28);
  const [frontDte, setFrontDte] = useState(14);
  const [backDte, setBackDte] = useState(45);
  const [isCall, setIsCall] = useState(true);
  const r = 0.05;

  const K = useMemo(() => spotPrice * (1 + strikePct / 100), [spotPrice, strikePct]);
  const T1 = frontDte / 365;
  const T2 = backDte / 365;
  const sigma1 = frontIv / 100;
  const sigma2 = backIv / 100;

  const frontPrem = useMemo(
    () => (isCall ? bsCall(spotPrice, K, T1, r, sigma1) : bsPut(spotPrice, K, T1, r, sigma1)),
    [spotPrice, K, T1, sigma1, isCall]
  );
  const backPrem = useMemo(
    () => (isCall ? bsCall(spotPrice, K, T2, r, sigma2) : bsPut(spotPrice, K, T2, r, sigma2)),
    [spotPrice, K, T2, sigma2, isCall]
  );

  const netDebit = backPrem - frontPrem;
  const ivDiff = frontIv - backIv;
  const isContango = frontIv > backIv;

  const frontTheta = useMemo(() => bsTheta(spotPrice, K, T1, r, sigma1, isCall), [spotPrice, K, T1, sigma1, isCall]);
  const backTheta = useMemo(() => bsTheta(spotPrice, K, T2, r, sigma2, isCall), [spotPrice, K, T2, sigma2, isCall]);
  const netTheta = backTheta - frontTheta;

  const frontDelta = useMemo(
    () => (isCall ? bsCallDelta(spotPrice, K, T1, r, sigma1) : bsCallDelta(spotPrice, K, T1, r, sigma1) - 1),
    [spotPrice, K, T1, sigma1, isCall]
  );
  const backDelta = useMemo(
    () => (isCall ? bsCallDelta(spotPrice, K, T2, r, sigma2) : bsCallDelta(spotPrice, K, T2, r, sigma2) - 1),
    [spotPrice, K, T2, sigma2, isCall]
  );
  const netDelta = backDelta - frontDelta;

  // Approximate payoff at front expiry (back month keeps time value)
  const points: PayoffPoint[] = useMemo(() => {
    const low = spotPrice * 0.8;
    const high = spotPrice * 1.2;
    const T2remaining = (backDte - frontDte) / 365;
    return Array.from({ length: 80 }, (_, i) => {
      const price = low + (i / 79) * (high - low);
      const shortPnl = frontPrem - (isCall ? Math.max(price - K, 0) : Math.max(K - price, 0));
      const longRemaining = isCall ? bsCall(price, K, T2remaining, r, sigma2) : bsPut(price, K, T2remaining, r, sigma2);
      const longPnl = longRemaining - backPrem;
      return { price, pnl: (shortPnl + longPnl) * 100 };
    });
  }, [spotPrice, K, frontPrem, backPrem, frontDte, backDte, sigma2, isCall]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <InfoBox>
        A <strong>Calendar Spread</strong> sells a near-term option and buys a longer-dated option at the same strike.
        You profit from the front month decaying faster (theta) and IV differences between months (contango).
      </InfoBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Parameters</SectionTitle>
            <div className="flex gap-1">
              {["Call", "Put"].map((t) => (
                <button
                  key={t}
                  onClick={() => setIsCall(t === "Call")}
                  className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                    (t === "Call") === isCall
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {[
            { label: `Spot Price: $${spotPrice}`, min: 50, max: 500, val: spotPrice, set: setSpotPrice, step: 1 },
            { label: `Strike: ${strikePct > 0 ? "+" : ""}${strikePct}% (${K.toFixed(1)})`, min: -10, max: 10, val: strikePct, set: setStrikePct, step: 1 },
            { label: `Front Month IV: ${frontIv}%`, min: 15, max: 80, val: frontIv, set: setFrontIv, step: 1 },
            { label: `Back Month IV: ${backIv}%`, min: 10, max: 60, val: backIv, set: setBackIv, step: 1 },
            { label: `Front DTE: ${frontDte} days`, min: 7, max: 30, val: frontDte, set: setFrontDte, step: 1 },
            { label: `Back DTE: ${backDte} days`, min: 30, max: 120, val: backDte, set: setBackDte, step: 1 },
          ].map(({ label, min, max, val, set, step }) => (
            <div key={label.split(":")[0]}>
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <Slider min={min} max={max} step={step} value={[val]} onValueChange={([v]) => set(v)} className="w-full" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <SectionTitle>Leg Breakdown</SectionTitle>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-red-400">SELL {frontDte}DTE {isCall ? "Call" : "Put"} ${K.toFixed(1)}</span>
                <span className="text-green-400">+${frontPrem.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">BUY {backDte}DTE {isCall ? "Call" : "Put"} ${K.toFixed(1)}</span>
                <span className="text-red-400">-${backPrem.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
                <span className="text-muted-foreground">Net Debit</span>
                <span className="text-red-400">-${netDebit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Net Debit" value={`-$${netDebit.toFixed(2)}`} sub="max loss (approx)" color="red" />
            <Metric label="IV Differential" value={`${ivDiff > 0 ? "+" : ""}${ivDiff.toFixed(0)}%`} sub={isContango ? "Front > Back (good)" : "Back > Front"} color={isContango ? "green" : "amber"} />
            <Metric label="Net Theta/day" value={`${netTheta.toFixed(4)}`} sub={netTheta > 0 ? "Time works for you" : "Theta negative"} color={netTheta > 0 ? "green" : "red"} />
            <Metric label="Net Delta" value={netDelta.toFixed(3)} sub="near-neutral" color={Math.abs(netDelta) < 0.05 ? "green" : "amber"} />
          </div>

          <div className={`rounded-lg border p-3 text-xs ${isContango ? "border-green-500/20 bg-green-500/5 text-green-300" : "border-amber-500/20 bg-amber-500/5 text-amber-300"}`}>
            <div className="font-semibold mb-1">
              {isContango ? "Front IV > Back IV — Ideal contango structure" : "Back IV > Front IV — Consider waiting for event"}
            </div>
            <div className="text-muted-foreground">
              {isContango
                ? "Front month is pricing in a near-term event. Selling elevated front IV while holding cheaper back month enhances profitability."
                : "IV term structure is inverted. The trade still works but requires more price stability."}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle>Estimated Payoff at Front Expiry</SectionTitle>
        <PayoffSVG points={points} breakevens={[]} />
        <div className="flex gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
          <span className="text-green-400">— Calendar P&L at front expiry</span>
          <span>Strike ${K.toFixed(1)} | Front {frontDte}DTE IV {frontIv}% | Back {backDte}DTE IV {backIv}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-muted-foreground font-medium mb-1.5">Adjustment Mechanics</div>
          <div className="text-muted-foreground space-y-1">
            <div>• Roll short strike if price moves 1 SD away</div>
            <div>• Convert to diagonal: move short strike directionally</div>
            <div>• Add a second calendar at different strike (double calendar)</div>
            <div>• Close and re-establish after front expiry</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-muted-foreground font-medium mb-1.5">Delta Neutral Maintenance</div>
          <div className="text-muted-foreground space-y-1">
            <div>• Net delta ≈ 0 when ATM — ideal entry</div>
            <div>• As stock moves, position gains directionality</div>
            <div>• Hedge with shares or micro-futures to stay neutral</div>
            <div>• Re-center calendar if delta exceeds ±0.10</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── STRATEGY COMPARISON TAB ──────────────────────────────────────────────────
interface StrategyRow {
  name: string;
  iv: number;
  annualYield: number;
  pop: number;
  maxLossMultiple: number;
  deltaExposure: string;
  bestFor: string;
  greeks: { delta: string; theta: string; vega: string; gamma: string };
}

function StrategyComparisonTab() {
  const [spotPrice] = useState(150);
  const [selectedIvScenario, setSelectedIvScenario] = useState<"low" | "med" | "high">("med");
  const r = 0.05;
  const dte = 30;
  const T = dte / 365;

  const ivMap = { low: 20, med: 35, high: 55 };
  const iv = ivMap[selectedIvScenario];
  const sigma = iv / 100;

  const strategies: StrategyRow[] = useMemo(() => {
    // Covered Call: sell 5% OTM call
    const ccK = spotPrice * 1.05;
    const ccPrem = bsCall(spotPrice, ccK, T, r, sigma);
    const ccYield = (ccPrem / spotPrice) * (365 / dte) * 100;
    const ccPop = probOTM(spotPrice, ccK, T, r, sigma) * 100;
    const ccDelta = bsCallDelta(spotPrice, ccK, T, r, sigma);

    // CSP: sell 5% OTM put
    const cspK = spotPrice * 0.95;
    const cspPrem = bsPut(spotPrice, cspK, T, r, sigma);
    const cspYield = (cspPrem / cspK) * (365 / dte) * 100;
    const cspPop = (1 - probOTM(spotPrice, cspK, T, r, sigma)) * 100;

    // Iron Condor: ±5% short strikes, $5 wings
    const icShortPut = spotPrice * 0.95;
    const icLongPut = icShortPut - 5;
    const icShortCall = spotPrice * 1.05;
    const icLongCall = icShortCall + 5;
    const icCredit = bsPut(spotPrice, icShortPut, T, r, sigma) - bsPut(spotPrice, icLongPut, T, r, sigma) + bsCall(spotPrice, icShortCall, T, r, sigma) - bsCall(spotPrice, icLongCall, T, r, sigma);
    const icYield = (icCredit / 5) * (365 / dte) * 100;
    const icPop = Math.max(0, (probOTM(spotPrice, icShortCall, T, r, sigma) + (1 - probOTM(spotPrice, icShortPut, T, r, sigma)) - 1) * 100);

    // Calendar: sell 14DTE, buy 45DTE ATM
    const calFront = bsCall(spotPrice, spotPrice, 14 / 365, r, sigma * 1.15);
    const calBack = bsCall(spotPrice, spotPrice, 45 / 365, r, sigma);
    const calDebit = calBack - calFront;
    const calYield = (calFront / calDebit) * (365 / 14) * 100;

    return [
      {
        name: "Covered Call",
        iv,
        annualYield: ccYield,
        pop: ccPop,
        maxLossMultiple: 1,
        deltaExposure: `+${(1 - ccDelta).toFixed(2)}`,
        bestFor: "Neutral–Bullish",
        greeks: {
          delta: `+${(1 - ccDelta).toFixed(2)}`,
          theta: `+${Math.abs(bsTheta(spotPrice, ccK, T, r, sigma, true) * 100).toFixed(2)}`,
          vega: `-${(spotPrice * sigma * Math.sqrt(T) * 0.01).toFixed(2)}`,
          gamma: `-${(0.015 * (1 / (sigma * spotPrice * Math.sqrt(T)))).toFixed(4)}`,
        },
      },
      {
        name: "Cash-Secured Put",
        iv,
        annualYield: cspYield,
        pop: 100 - cspPop,
        maxLossMultiple: 1,
        deltaExposure: `+${(bsCallDelta(spotPrice, cspK, T, r, sigma) - 1 + 1).toFixed(2)}`,
        bestFor: "Neutral–Bullish",
        greeks: {
          delta: `+${(bsCallDelta(spotPrice, cspK, T, r, sigma)).toFixed(2)}`,
          theta: `+${Math.abs(bsTheta(spotPrice, cspK, T, r, sigma, false) * 100).toFixed(2)}`,
          vega: `-${(cspK * sigma * Math.sqrt(T) * 0.01).toFixed(2)}`,
          gamma: `-${(0.012).toFixed(4)}`,
        },
      },
      {
        name: "Iron Condor",
        iv,
        annualYield: icYield,
        pop: icPop,
        maxLossMultiple: 0.5,
        deltaExposure: "~0.00",
        bestFor: "Neutral / Range-Bound",
        greeks: {
          delta: "~0.00",
          theta: `+${(Math.abs(bsTheta(spotPrice, icShortPut, T, r, sigma, false)) * 100 * 0.4).toFixed(2)}`,
          vega: `-${(spotPrice * sigma * Math.sqrt(T) * 0.006).toFixed(2)}`,
          gamma: `-${(0.009).toFixed(4)}`,
        },
      },
      {
        name: "Calendar Spread",
        iv,
        annualYield: Math.max(calYield, 0),
        pop: 55 + (iv - 20) * 0.3,
        maxLossMultiple: 0.3,
        deltaExposure: "~0.00",
        bestFor: "Neutral + IV Expansion",
        greeks: {
          delta: "~0.00",
          theta: `+${(Math.abs(bsTheta(spotPrice, spotPrice, 14 / 365, r, sigma, true)) * 100 * 0.6).toFixed(2)}`,
          vega: `+${(spotPrice * sigma * 0.005).toFixed(2)}`,
          gamma: "~0.000",
        },
      },
    ];
  }, [spotPrice, iv, T, sigma, dte, r]);

  const ivScenarios: { key: "low" | "med" | "high"; label: string; desc: string }[] = [
    { key: "low", label: "Low IV (20%)", desc: "Post-earnings, calm markets" },
    { key: "med", label: "Med IV (35%)", desc: "Normal market conditions" },
    { key: "high", label: "High IV (55%)", desc: "Elevated fear, events upcoming" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <InfoBox>
        Compare annualized yields, probability of profit, and risk profiles across all four income strategies at
        different IV levels. Higher IV = fatter premiums but also larger expected moves.
      </InfoBox>

      {/* IV Scenario Toggle */}
      <div className="flex gap-2 flex-wrap">
        {ivScenarios.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedIvScenario(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              selectedIvScenario === s.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
            <span className="ml-1.5 text-muted-foreground">{s.desc}</span>
          </button>
        ))}
      </div>

      {/* Annual Yield Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border text-sm font-medium text-muted-foreground">
          Annual Yield Comparison — IV {iv}% | {dte} DTE | ${spotPrice} Spot
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">Strategy</th>
                <th className="text-right px-4 py-2 font-medium">Annual Yield</th>
                <th className="text-right px-4 py-2 font-medium">Prob of Profit</th>
                <th className="text-right px-4 py-2 font-medium">Max Loss</th>
                <th className="text-right px-4 py-2 font-medium">Delta</th>
                <th className="text-left px-4 py-2 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((s, i) => (
                <motion.tr
                  key={s.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-mono font-semibold ${s.annualYield > 20 ? "text-green-400" : s.annualYield > 10 ? "text-green-300" : "text-muted-foreground"}`}>
                      {s.annualYield.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(s.pop, 100)}%` }} />
                      </div>
                      <span className="font-mono text-muted-foreground">{s.pop.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-red-400">
                    {s.maxLossMultiple < 1 ? `~${(s.maxLossMultiple * 100).toFixed(0)}% capital` : "Full position"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{s.deltaExposure}</td>
                  <td className="px-4 py-2.5 text-left">
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                      {s.bestFor}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Greeks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strategies.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="text-sm font-medium text-foreground mb-3">{s.name} — Greeks</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Delta", val: s.greeks.delta, color: parseFloat(s.greeks.delta) > 0 ? "text-green-400" : "text-muted-foreground" },
                { label: "Theta/day", val: s.greeks.theta, color: "text-green-400" },
                { label: "Vega", val: s.greeks.vega, color: s.greeks.vega.startsWith("+") ? "text-green-400" : "text-red-400" },
                { label: "Gamma", val: s.greeks.gamma, color: s.greeks.gamma.startsWith("-") ? "text-red-400" : "text-muted-foreground" },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center">
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  <div className={`text-xs font-mono font-semibold ${color}`}>{val}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conditions Guide */}
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle>When to Use Each Strategy</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              name: "Covered Call",
              icon: <TrendingUp size={13} className="text-primary" />,
              conditions: ["Own 100+ shares already", "Neutral to mildly bullish", "Want income without buying more", "IV ≥ 25% for meaningful premium"],
            },
            {
              name: "Cash-Secured Put",
              icon: <TrendingDown size={13} className="text-primary" />,
              conditions: ["Want to acquire shares at a discount", "Bullish long-term, neutral short-term", "Have cash available to deploy", "Prefer defined-risk income"],
            },
            {
              name: "Iron Condor",
              icon: <BarChart2 size={13} className="text-orange-400" />,
              conditions: ["Expect stock to stay range-bound", "Post-event, low expected move", "High IV rank (IVR > 50)", "Want delta-neutral premium income"],
            },
            {
              name: "Calendar Spread",
              icon: <Calendar size={13} className="text-green-400" />,
              conditions: ["Expect near-term event with vol crush", "Want minimal directional exposure", "Front month IV elevated vs back", "Looking for cheap gamma long position"],
            },
          ].map((s) => (
            <div key={s.name} className="rounded border border-border p-3">
              <div className="flex items-center gap-1.5 font-medium text-foreground mb-1.5">
                {s.icon} {s.name}
              </div>
              <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                {s.conditions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OptionsIncomePage() {
  const [activeTab, setActiveTab] = useState("covered-call");

  const rng = useMemo(() => seededRng(672005), []);
  // consume a few values from seeded rng for future use
  const _seed1 = useMemo(() => rng(), [rng]);
  const _seed2 = useMemo(() => rng(), [rng]);

  const tabs = [
    { id: "covered-call", label: "Covered Call", icon: <TrendingUp size={13} /> },
    { id: "cash-secured-put", label: "Cash-Secured Put", icon: <TrendingDown size={13} /> },
    { id: "iron-condor", label: "Iron Condor", icon: <BarChart2 size={13} /> },
    { id: "calendar", label: "Calendar Spread", icon: <Calendar size={13} /> },
    { id: "comparison", label: "Strategy Comparison", icon: <Table2 size={13} /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Options Income Strategies</h1>
              <p className="text-sm text-muted-foreground">Education & simulator for premium-selling strategies</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
          <TabsList className="flex gap-1 p-1 bg-card border border-border rounded-xl h-auto w-full">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="flex-1 flex items-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="pt-5">
            <TabsContent value="covered-call" className="m-0 data-[state=inactive]:hidden">
              <CoveredCallTab />
            </TabsContent>
            <TabsContent value="cash-secured-put" className="m-0 data-[state=inactive]:hidden">
              <CashSecuredPutTab />
            </TabsContent>
            <TabsContent value="iron-condor" className="m-0 data-[state=inactive]:hidden">
              <IronCondorTab />
            </TabsContent>
            <TabsContent value="calendar" className="m-0 data-[state=inactive]:hidden">
              <CalendarSpreadTab />
            </TabsContent>
            <TabsContent value="comparison" className="m-0 data-[state=inactive]:hidden">
              <StrategyComparisonTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
