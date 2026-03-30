"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
 TrendingUp, TrendingDown, BarChart2, RefreshCw,
 Zap, Shield, ChevronDown, ChevronUp, Info, DollarSign,
 Target, Activity, BookOpen, Layers,
} from "lucide-react";

// ─── Black-Scholes Math ───────────────────────────────────────────────────────

function normalCDF(x: number): number {
 const t = 1 / (1 + 0.2316419 * Math.abs(x));
 const poly =
 t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
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
}

function bsCall(S: number, K: number, T: number, sigma: number, r = 0.05): BSResult {
 const Ty = Math.max(T / 365, 0.001);
 const sqrtT = Math.sqrt(Ty);
 const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * sqrtT);
 const d2 = d1 - sigma * sqrtT;
 const price = S * normalCDF(d1) - K * Math.exp(-r * Ty) * normalCDF(d2);
 const delta = normalCDF(d1);
 const gamma = normalPDF(d1) / (S * sigma * sqrtT);
 const theta = (-(S * normalPDF(d1) * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * Ty) * normalCDF(d2)) / 365;
 const vega = S * sqrtT * normalPDF(d1) / 100;
 return { price, delta, gamma, theta, vega };
}

function bsPut(S: number, K: number, T: number, sigma: number, r = 0.05): BSResult {
 const Ty = Math.max(T / 365, 0.001);
 const sqrtT = Math.sqrt(Ty);
 const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * sqrtT);
 const d2 = d1 - sigma * sqrtT;
 const price = K * Math.exp(-r * Ty) * normalCDF(-d2) - S * normalCDF(-d1);
 const delta = normalCDF(d1) - 1;
 const gamma = normalPDF(d1) / (S * sigma * sqrtT);
 const theta = (-(S * normalPDF(d1) * sigma) / (2 * sqrtT) + r * K * Math.exp(-r * Ty) * normalCDF(-d2)) / 365;
 const vega = S * sqrtT * normalPDF(d1) / 100;
 return { price, delta, gamma, theta, vega };
}

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 79;
const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionType = "call" | "put";
type LegDirection = "long" | "short";

interface Leg {
 id: string;
 direction: LegDirection;
 type: OptionType;
 strike: number;
 expiry: number; // days to expiry
 qty: number;
 iv: number;
 premium: number;
}

interface StrategyInfo {
 id: string;
 name: string;
 category: "directional" | "income" | "volatility" | "defensive";
 description: string;
 idealConditions: string;
 maxProfit: string;
 maxLoss: string;
 impliedMoveNeeded: string;
 legs: Omit<Leg, "id" | "premium">[];
}

// ─── SVG Helpers ─────────────────────────────────────────────────────────────

const W = 400;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

function xScale(val: number, min: number, max: number) {
 return PAD.left + ((val - min) / (max - min)) * CW;
}
function yScale(val: number, min: number, max: number) {
 return PAD.top + CH - ((val - min) / (max - min)) * CH;
}

// ─── Payoff calculation ───────────────────────────────────────────────────────

function calcLegPayoff(leg: Leg, underlyingAtExpiry: number): number {
 let intrinsic = 0;
 if (leg.type === "call") {
 intrinsic = Math.max(0, underlyingAtExpiry - leg.strike);
 } else {
 intrinsic = Math.max(0, leg.strike - underlyingAtExpiry);
 }
 const sign = leg.direction === "long" ? 1 : -1;
 return sign * (intrinsic - leg.premium) * leg.qty * 100;
}

function calcTotalPayoff(legs: Leg[], price: number): number {
 return legs.reduce((sum, leg) => sum + calcLegPayoff(leg, price), 0);
}

function buildPayoffPoints(legs: Leg[], spot: number): [number, number][] {
 const lo = spot * 0.6;
 const hi = spot * 1.4;
 const steps = 80;
 const pts: [number, number][] = [];
 for (let i = 0; i <= steps; i++) {
 const price = lo + (i / steps) * (hi - lo);
 pts.push([price, calcTotalPayoff(legs, price)]);
 }
 return pts;
}

function findBreakevens(legs: Leg[], spot: number): number[] {
 const pts = buildPayoffPoints(legs, spot);
 const bes: number[] = [];
 for (let i = 1; i < pts.length; i++) {
 const [x0, y0] = pts[i - 1];
 const [x1, y1] = pts[i];
 if ((y0 < 0 && y1 >= 0) || (y0 >= 0 && y1 < 0)) {
 const be = x0 + (0 - y0) * ((x1 - x0) / (y1 - y0));
 bes.push(be);
 }
 }
 return bes;
}

// ─── PayoffSVG Component ──────────────────────────────────────────────────────

function PayoffSVG({ legs, spot, compact = false }: { legs: Leg[]; spot: number; compact?: boolean }) {
 const w = compact ? 280 : W;
 const h = compact ? 140 : H;
 const cw = w - PAD.left - PAD.right;
 const ch = h - PAD.top - PAD.bottom;

 const lo = spot * 0.6;
 const hi = spot * 1.4;

 const pts = useMemo(() => {
 const steps = 60;
 const result: [number, number][] = [];
 for (let i = 0; i <= steps; i++) {
 const price = lo + (i / steps) * (hi - lo);
 result.push([price, calcTotalPayoff(legs, price)]);
 }
 return result;
 }, [legs, lo, hi]);

 const pnls = pts.map(([, y]) => y);
 const rawMin = Math.min(...pnls);
 const rawMax = Math.max(...pnls);
 const pad = Math.max((rawMax - rawMin) * 0.15, 50);
 const yMin = rawMin - pad;
 const yMax = rawMax + pad;

 const sx = (v: number) => PAD.left + ((v - lo) / (hi - lo)) * cw;
 const sy = (v: number) => PAD.top + ch - ((v - yMin) / (yMax - yMin)) * ch;

 const zeroY = sy(0);

 const profitPath = pts
 .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`)
 .join("");

 const fillProfit =
 `M ${sx(lo).toFixed(1)} ${zeroY.toFixed(1)} ` +
 pts.filter(([, y]) => y >= 0).map(([x, y]) => `L ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join("") +
 ` L ${sx(hi).toFixed(1)} ${zeroY.toFixed(1)} Z`;

 const fillLoss =
 `M ${sx(lo).toFixed(1)} ${zeroY.toFixed(1)} ` +
 pts.filter(([, y]) => y < 0).map(([x, y]) => `L ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join("") +
 ` L ${sx(hi).toFixed(1)} ${zeroY.toFixed(1)} Z`;

 const spotX = sx(spot);

 const yTicks = [yMin, 0, yMax].filter(
 (v, i, arr) => arr.filter((a) => Math.abs(a - v) < (yMax - yMin) * 0.1).length === 1
 );

 const fmt = (v: number) =>
 Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;

 return (
 <svg width={w} height={h} className="overflow-visible">
 <defs>
 <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
 <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
 </linearGradient>
 <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
 <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
 </linearGradient>
 </defs>

 {/* Grid */}
 <line x1={PAD.left} y1={zeroY} x2={w - PAD.right} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="4 4" />
 {yTicks.map((v, i) => (
 <text key={i} x={PAD.left - 4} y={sy(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
 {fmt(v)}
 </text>
 ))}

 {/* Fill areas */}
 <path d={fillProfit} fill="url(#profitGrad)" />
 <path d={fillLoss} fill="url(#lossGrad)" />

 {/* Payoff line */}
 <path d={profitPath} fill="none" stroke="#60a5fa" strokeWidth={2} />

 {/* Spot price marker */}
 <line x1={spotX} y1={PAD.top} x2={spotX} y2={h - PAD.bottom} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
 <text x={spotX} y={PAD.top - 4} textAnchor="middle" fill="#f59e0b" fontSize={9}>
 ${spot}
 </text>

 {/* X axis labels */}
 {[lo, spot, hi].map((v, i) => (
 <text key={i} x={sx(v)} y={h - PAD.bottom + 14} textAnchor="middle" fill="#6b7280" fontSize={9}>
 ${v.toFixed(0)}
 </text>
 ))}
 </svg>
 );
}

// ─── Greeks Summary ───────────────────────────────────────────────────────────

interface NetGreeks {
 delta: number;
 gamma: number;
 theta: number;
 vega: number;
}

function calcNetGreeks(legs: Leg[], spot: number): NetGreeks {
 let delta = 0, gamma = 0, theta = 0, vega = 0;
 for (const leg of legs) {
 const bs = leg.type === "call"
 ? bsCall(spot, leg.strike, leg.expiry, leg.iv)
 : bsPut(spot, leg.strike, leg.expiry, leg.iv);
 const sign = leg.direction === "long" ? 1 : -1;
 const mult = sign * leg.qty * 100;
 delta += bs.delta * mult;
 gamma += bs.gamma * mult;
 theta += bs.theta * mult;
 vega += bs.vega * mult;
 }
 return { delta, gamma, theta, vega };
}

function GreeksPill({ label, value, decimals = 2 }: { label: string; value: number; decimals?: number }) {
 const color = value > 0 ? "text-green-400" : value < 0 ? "text-red-400" : "text-muted-foreground";
 return (
 <div className="flex flex-col items-center bg-foreground/5 rounded-lg px-3 py-2 min-w-[60px]">
 <span className="text-xs text-muted-foreground ">{label}</span>
 <span className={`text-sm font-mono font-semibold ${color}`}>{value.toFixed(decimals)}</span>
 </div>
 );
}

// ─── Strategy Library Data ────────────────────────────────────────────────────

const SPOT = 100;
const DEFAULT_IV = 0.30;
const DEFAULT_T = 45;

function makePremiums(legs: Omit<Leg, "id" | "premium">[]): Leg[] {
 return legs.map((leg, i) => {
 const bs = leg.type === "call"
 ? bsCall(SPOT, leg.strike, leg.expiry, leg.iv)
 : bsPut(SPOT, leg.strike, leg.expiry, leg.iv);
 return { ...leg, id: String(i), premium: bs.price };
 });
}

const STRATEGIES: StrategyInfo[] = [
 // Directional
 {
 id: "long-call", name: "Long Call", category: "directional",
 description: "Buy a call option. Profit if stock rises above the breakeven. Limited loss (premium paid), unlimited upside.",
 idealConditions: "Strong bullish conviction, low IV environment (cheap options), clear catalyst ahead.",
 maxProfit: "Unlimited", maxLoss: "Premium paid", impliedMoveNeeded: ">+8% for ATM call",
 legs: [{ direction: "long", type: "call", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV }],
 },
 {
 id: "long-put", name: "Long Put", category: "directional",
 description: "Buy a put option. Profit if stock falls below the breakeven. Limited loss (premium paid).",
 idealConditions: "Strong bearish conviction, low IV, earnings miss risk or macro deterioration.",
 maxProfit: "Strike × 100 (stock goes to 0)", maxLoss: "Premium paid", impliedMoveNeeded: ">-8% for ATM put",
 legs: [{ direction: "long", type: "put", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV }],
 },
 {
 id: "bull-call-spread", name: "Bull Call Spread", category: "directional",
 description: "Buy a lower strike call, sell a higher strike call. Reduces cost basis vs naked call. Capped upside.",
 idealConditions: "Moderately bullish. High IV makes this attractive vs naked call.",
 maxProfit: "Width of spread − net debit", maxLoss: "Net debit paid", impliedMoveNeeded: "+5% to +15%",
 legs: [
 { direction: "long", type: "call", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "short", type: "call", strike: 110, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "bear-put-spread", name: "Bear Put Spread", category: "directional",
 description: "Buy a higher strike put, sell a lower strike put. Reduces cost of put while capping downside profit.",
 idealConditions: "Moderately bearish, elevated IV helps reduce cost.",
 maxProfit: "Spread width − net debit", maxLoss: "Net debit paid", impliedMoveNeeded: "-5% to -15%",
 legs: [
 { direction: "long", type: "put", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "short", type: "put", strike: 90, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "long-leap", name: "Long LEAP", category: "directional",
 description: "Long-dated call (1-2 years) as stock substitute. High leverage with defined risk and less time decay per day.",
 idealConditions: "Long-term bullish thesis. Use deep ITM to capture most of the delta.",
 maxProfit: "Unlimited", maxLoss: "Premium paid", impliedMoveNeeded: "+15% over 12 months",
 legs: [{ direction: "long", type: "call", strike: 95, expiry: 365, qty: 1, iv: 0.25 }],
 },
 // Income
 {
 id: "covered-call", name: "Covered Call", category: "income",
 description: "Own 100 shares. Sell OTM call to collect premium. Profit from time decay. Cap gains if stock surges.",
 idealConditions: "Flat to slightly bullish. Low IV rank — still good premium if overwriting.",
 maxProfit: "Call premium + (Strike − cost basis)", maxLoss: "Stock goes to 0 minus premium", impliedMoveNeeded: "None — benefit from stock staying flat",
 legs: [{ direction: "short", type: "call", strike: 105, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV }],
 },
 {
 id: "csp", name: "Cash-Secured Put", category: "income",
 description: "Sell an OTM put. Collect premium. Obligated to buy shares at strike if assigned. Safe entry strategy.",
 idealConditions: "Bullish to neutral. High IV rank boosts premium. Use on stocks you want to own.",
 maxProfit: "Premium collected", maxLoss: "Strike × 100 − premium (stock to zero)", impliedMoveNeeded: "Stock stays above short strike",
 legs: [{ direction: "short", type: "put", strike: 95, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV }],
 },
 {
 id: "bull-put-spread", name: "Bull Put Spread", category: "income",
 description: "Sell a put, buy a lower put for protection. Defined risk. Net credit received.",
 idealConditions: "Neutral to bullish. High IV rank for maximum premium capture.",
 maxProfit: "Net credit", maxLoss: "Spread width − credit", impliedMoveNeeded: "Stock stays above short put",
 legs: [
 { direction: "short", type: "put", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "long", type: "put", strike: 90, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "iron-condor", name: "Iron Condor", category: "income",
 description: "Sell OTM call spread + sell OTM put spread. Four legs, net credit, profits in a range.",
 idealConditions: "Low expected move. IV rank > 50. Stock in consolidation or channel.",
 maxProfit: "Net credit", maxLoss: "Wider spread width − net credit", impliedMoveNeeded: "Stay within ±8% of current price",
 legs: [
 { direction: "short", type: "put", strike: 92, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "long", type: "put", strike: 87, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "short", type: "call", strike: 108, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "long", type: "call", strike: 113, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "jade-lizard", name: "Jade Lizard", category: "income",
 description: "Sell OTM put + sell OTM call spread. Collects more credit than a strangle. No upside risk if credit > spread width.",
 idealConditions: "Neutral to slightly bullish. High IV. Collect enough credit to eliminate upside risk.",
 maxProfit: "Net credit", maxLoss: "Put strike × 100 − credit (downside)", impliedMoveNeeded: "Stay between short put and call spread",
 legs: [
 { direction: "short", type: "put", strike: 93, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "short", type: "call", strike: 107, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "long", type: "call", strike: 112, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 // Volatility
 {
 id: "long-straddle", name: "Long Straddle", category: "volatility",
 description: "Buy ATM call + ATM put, same strike/expiry. Profit from large moves in either direction.",
 idealConditions: "IV rank < 30 (cheap vol). Upcoming catalyst (earnings, FDA, FOMC).",
 maxProfit: "Unlimited (call side) / stock − 0 (put side)", maxLoss: "Combined premium", impliedMoveNeeded: ">±8%",
 legs: [
 { direction: "long", type: "call", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "long", type: "put", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "long-strangle", name: "Long Strangle", category: "volatility",
 description: "Buy OTM call + OTM put. Cheaper than straddle but needs a bigger move to profit.",
 idealConditions: "Expecting large move but direction uncertain. Cheaper than straddle.",
 maxProfit: "Unlimited / near-unlimited", maxLoss: "Net debit", impliedMoveNeeded: ">±12%",
 legs: [
 { direction: "long", type: "call", strike: 107, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "long", type: "put", strike: 93, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "short-straddle", name: "Short Straddle", category: "volatility",
 description: "Sell ATM call + put. Maximum premium collection. Profit if stock stays near strike. Unlimited risk.",
 idealConditions: "Very high IV rank > 70. Low expected move. Stable stock in tight range.",
 maxProfit: "Net credit", maxLoss: "Unlimited (call side)", impliedMoveNeeded: "Stay within ±premium/strike %",
 legs: [
 { direction: "short", type: "call", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "short", type: "put", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "calendar-spread", name: "Calendar Spread", category: "volatility",
 description: "Sell near-term option, buy same strike farther-term option. Profit from time decay differential.",
 idealConditions: "Neutral outlook. Near-term vol elevated vs back month. Stock near strike at near expiry.",
 maxProfit: "When stock near strike at front month expiry", maxLoss: "Net debit", impliedMoveNeeded: "Stock stays near strike",
 legs: [
 { direction: "short", type: "call", strike: 100, expiry: 15, qty: 1, iv: 0.35 },
 { direction: "long", type: "call", strike: 100, expiry: 60, qty: 1, iv: 0.28 },
 ],
 },
 {
 id: "ratio-spread", name: "Ratio Spread", category: "volatility",
 description: "Buy 1 ATM call, sell 2 OTM calls. Funded by excess premium. Profit in moderate move. Risk above top strike.",
 idealConditions: "Moderately bullish. High IV on OTM strikes. Expect move to OTM area.",
 maxProfit: "At upper short strike", maxLoss: "Unlimited above 2× short strike", impliedMoveNeeded: "+5% to +10%",
 legs: [
 { direction: "long", type: "call", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "short", type: "call", strike: 107, expiry: DEFAULT_T, qty: 2, iv: DEFAULT_IV },
 ],
 },
 // Defensive
 {
 id: "protective-put", name: "Protective Put", category: "defensive",
 description: "Own 100 shares + buy OTM put. Like insurance on your stock position. Limits downside while retaining upside.",
 idealConditions: "Long stock holding. Fear of near-term drawdown. Earnings or macro uncertainty.",
 maxProfit: "Unlimited (minus put cost)", maxLoss: "Stock cost − put strike + premium", impliedMoveNeeded: "Put protects if stock drops >5-10%",
 legs: [{ direction: "long", type: "put", strike: 95, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV }],
 },
 {
 id: "collar", name: "Collar", category: "defensive",
 description: "Own shares + sell call + buy put. Zero-cost if premium offsets. Capped upside + downside protection.",
 idealConditions: "Holding stock long-term. Want downside protection without paying out-of-pocket.",
 maxProfit: "Call strike − stock price + net credit/debit", maxLoss: "Stock price − put strike + net debit", impliedMoveNeeded: "Works best if stock stays in collar range",
 legs: [
 { direction: "short", type: "call", strike: 107, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "long", type: "put", strike: 93, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "married-put", name: "Married Put", category: "defensive",
 description: "Buy stock and buy ATM put simultaneously. Full downside protection. Like a synthetic long call.",
 idealConditions: "New position with defined risk tolerance. Don't want to risk more than X% on entry.",
 maxProfit: "Unlimited", maxLoss: "Premium paid (from spot down to put strike)", impliedMoveNeeded: "Stock must rise to cover put cost",
 legs: [{ direction: "long", type: "put", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV }],
 },
 {
 id: "long-put-vertical", name: "Long Put Vertical", category: "defensive",
 description: "Buy higher put, sell lower put. Defined risk bearish or hedge position. Lower cost than naked put.",
 idealConditions: "Hedging or bearish with IV concern. Reduces vega risk vs naked put.",
 maxProfit: "Spread width − debit", maxLoss: "Net debit", impliedMoveNeeded: "Stock below lower strike at expiry",
 legs: [
 { direction: "long", type: "put", strike: 100, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 { direction: "short", type: "put", strike: 92, expiry: DEFAULT_T, qty: 1, iv: DEFAULT_IV },
 ],
 },
 {
 id: "leaps-hedge", name: "LEAPS Hedge", category: "defensive",
 description: "Buy long-dated deep ITM put as portfolio hedge. Slower time decay than near-term puts. Efficient tail protection.",
 idealConditions: "Portfolio > $100k. Hedging 6-18 months. VIX < 20 for cheaper entry.",
 maxProfit: "Strike × 100 (stock to zero)", maxLoss: "Premium paid", impliedMoveNeeded: "Stock drops >15% over 12 months",
 legs: [{ direction: "long", type: "put", strike: 100, expiry: 365, qty: 1, iv: 0.25 }],
 },
];

// ─── Tab 1: Strategy Builder ──────────────────────────────────────────────────

const DEFAULT_LEG: Omit<Leg, "id" | "premium"> = {
 direction: "long", type: "call", strike: 100, expiry: 45, qty: 1, iv: 0.30,
};

function StrategyBuilderTab() {
 const [spot, setSpot] = useState(100);
 const [legs, setLegs] = useState<Leg[]>([]);

 const addLeg = useCallback(() => {
 if (legs.length >= 4) return;
 const newLeg = { ...DEFAULT_LEG, id: String(Date.now()) };
 const bs = bsCall(spot, newLeg.strike, newLeg.expiry, newLeg.iv);
 setLegs((prev) => [...prev, { ...newLeg, premium: bs.price }]);
 }, [legs.length, spot]);

 const removeLeg = useCallback((id: string) => {
 setLegs((prev) => prev.filter((l) => l.id !== id));
 }, []);

 const updateLeg = useCallback((id: string, changes: Partial<Leg>) => {
 setLegs((prev) =>
 prev.map((leg) => {
 if (leg.id !== id) return leg;
 const updated = { ...leg, ...changes };
 const bs = updated.type === "call"
 ? bsCall(spot, updated.strike, updated.expiry, updated.iv)
 : bsPut(spot, updated.strike, updated.expiry, updated.iv);
 return { ...updated, premium: bs.price };
 })
 );
 }, [spot]);

 const payoffPts = useMemo(() => buildPayoffPoints(legs, spot), [legs, spot]);
 const breakevens = useMemo(() => findBreakevens(legs, spot), [legs, spot]);
 const netGreeks = useMemo(() => calcNetGreeks(legs, spot), [legs, spot]);
 const pnlAtSpot = useMemo(() => calcTotalPayoff(legs, spot), [legs, spot]);
 const allPnls = payoffPts.map(([, y]) => y);
 const maxProfit = allPnls.length ? Math.max(...allPnls) : 0;
 const maxLoss = allPnls.length ? Math.min(...allPnls) : 0;

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* Left: Leg Builder */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-foreground">Position Legs</h3>
 <div className="flex items-center gap-3">
 <label className="text-xs text-muted-foreground">Spot: $
 <input
 type="number"
 value={spot}
 onChange={(e) => setSpot(Number(e.target.value))}
 className="ml-1 w-20 bg-foreground/10 rounded px-2 py-0.5 text-foreground text-xs"
 />
 </label>
 <button
 onClick={addLeg}
 disabled={legs.length >= 4}
 className="text-xs bg-primary hover:bg-primary disabled:opacity-40 text-foreground-foreground px-3 py-1 rounded"
 >
 + Add Leg
 </button>
 </div>
 </div>

 <AnimatePresence>
 {legs.map((leg, idx) => (
 <motion.div
 key={leg.id}
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-foreground/5 border border-border rounded-md p-4 space-y-3"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-muted-foreground">Leg {idx + 1}</span>
 <div className="flex items-center gap-2">
 <span className="text-xs text-muted-foreground">Premium: ${leg.premium.toFixed(2)}</span>
 <button onClick={() => removeLeg(leg.id)} className="text-muted-foreground hover:text-red-400 text-xs">✕</button>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 {/* Direction */}
 <div>
 <label className="text-xs text-muted-foreground ">Direction</label>
 <div className="flex gap-1 mt-1">
 {(["long", "short"] as LegDirection[]).map((d) => (
 <button
 key={d}
 onClick={() => updateLeg(leg.id, { direction: d })}
 className={`flex-1 text-xs py-1 rounded ${leg.direction === d ? (d === "long" ? "bg-green-600 text-foreground-foreground" : "bg-red-600 text-foreground-foreground") : "bg-foreground/5 text-muted-foreground hover:bg-muted/50"}`}
 >
 {d}
 </button>
 ))}
 </div>
 </div>

 {/* Type */}
 <div>
 <label className="text-xs text-muted-foreground ">Type</label>
 <div className="flex gap-1 mt-1">
 {(["call", "put"] as OptionType[]).map((t) => (
 <button
 key={t}
 onClick={() => updateLeg(leg.id, { type: t })}
 className={`flex-1 text-xs py-1 rounded ${leg.type === t ? "bg-primary text-foreground-foreground" : "bg-foreground/5 text-muted-foreground hover:bg-muted/50"}`}
 >
 {t}
 </button>
 ))}
 </div>
 </div>

 {/* Strike */}
 <div>
 <label className="text-xs text-muted-foreground ">Strike</label>
 <input
 type="number"
 value={leg.strike}
 onChange={(e) => updateLeg(leg.id, { strike: Number(e.target.value) })}
 className="mt-1 w-full bg-foreground/10 rounded px-2 py-1 text-foreground text-xs"
 />
 </div>

 {/* DTE */}
 <div>
 <label className="text-xs text-muted-foreground ">DTE</label>
 <input
 type="number"
 value={leg.expiry}
 onChange={(e) => updateLeg(leg.id, { expiry: Number(e.target.value) })}
 className="mt-1 w-full bg-foreground/10 rounded px-2 py-1 text-foreground text-xs"
 />
 </div>

 {/* Qty */}
 <div>
 <label className="text-xs text-muted-foreground ">Qty</label>
 <input
 type="number"
 min={1}
 max={10}
 value={leg.qty}
 onChange={(e) => updateLeg(leg.id, { qty: Number(e.target.value) })}
 className="mt-1 w-full bg-foreground/10 rounded px-2 py-1 text-foreground text-xs"
 />
 </div>

 {/* IV */}
 <div>
 <label className="text-xs text-muted-foreground ">IV %</label>
 <input
 type="number"
 step={1}
 value={Math.round(leg.iv * 100)}
 onChange={(e) => updateLeg(leg.id, { iv: Number(e.target.value) / 100 })}
 className="mt-1 w-full bg-foreground/10 rounded px-2 py-1 text-foreground text-xs"
 />
 </div>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>

 {legs.length === 0 && (
 <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-md">
 Click &ldquo;+ Add Leg&rdquo; to build a position
 </div>
 )}
 </div>

 {/* Right: Payoff + Stats */}
 <div className="space-y-4">
 <div className="bg-foreground/5 border border-border border-l-4 border-l-primary rounded-md p-6">
 <h3 className="text-lg font-semibold text-foreground mb-3">Payoff at Expiry</h3>
 {legs.length > 0 ? (
 <PayoffSVG legs={legs} spot={spot} />
 ) : (
 <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No legs yet</div>
 )}
 </div>

 {legs.length > 0 && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
 {/* Stats */}
 <div className="grid grid-cols-3 gap-2">
 <div className="bg-foreground/5 rounded-md p-3 text-center">
 <div className="text-xs text-muted-foreground ">Max Profit</div>
 <div className="text-sm font-medium text-green-400">
 {maxProfit >= 99999 ? "Unlimited" : `$${maxProfit.toFixed(0)}`}
 </div>
 </div>
 <div className="bg-foreground/5 rounded-md p-3 text-center">
 <div className="text-xs text-muted-foreground ">Max Loss</div>
 <div className="text-sm font-medium text-red-400">
 {maxLoss <= -99999 ? "Unlimited" : `$${maxLoss.toFixed(0)}`}
 </div>
 </div>
 <div className="bg-foreground/5 rounded-md p-3 text-center">
 <div className="text-xs text-muted-foreground ">P&L Now</div>
 <div className={`text-sm font-medium ${pnlAtSpot >= 0 ? "text-green-400" : "text-red-400"}`}>
 ${pnlAtSpot.toFixed(0)}
 </div>
 </div>
 </div>

 {/* Breakevens */}
 <div className="bg-foreground/5 rounded-md p-3">
 <div className="text-xs text-muted-foreground mb-1">Breakeven Points</div>
 {breakevens.length === 0 ? (
 <span className="text-muted-foreground text-xs">No breakeven in price range</span>
 ) : (
 <div className="flex gap-2 flex-wrap">
 {breakevens.map((be, i) => (
 <span key={i} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
 ${be.toFixed(2)}
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Greeks */}
 <div>
 <div className="text-xs text-muted-foreground mb-2">Net Position Greeks</div>
 <div className="flex gap-2 flex-wrap">
 <GreeksPill label="Δ Delta" value={netGreeks.delta} />
 <GreeksPill label="Γ Gamma" value={netGreeks.gamma} decimals={4} />
 <GreeksPill label="Θ Theta" value={netGreeks.theta} decimals={2} />
 <GreeksPill label="V Vega" value={netGreeks.vega} decimals={2} />
 </div>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 );
}

// ─── Tab 2: Strategy Library ──────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
 directional: "Directional",
 income: "Income",
 volatility: "Volatility",
 defensive: "Defensive",
};

const CAT_COLORS: Record<string, string> = {
 directional: "text-foreground bg-muted/10 border-border",
 income: "text-green-400 bg-green-500/10 border-green-500/30",
 volatility: "text-foreground bg-muted/10 border-border",
 defensive: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

function StrategyCard({ strategy }: { strategy: StrategyInfo }) {
 const [expanded, setExpanded] = useState(false);
 const legs = useMemo(() => makePremiums(strategy.legs), [strategy.legs]);
 const netGreeks = useMemo(() => calcNetGreeks(legs, SPOT), [legs]);
 const netCredit = legs.reduce((sum, l) => {
 return sum + (l.direction === "short" ? l.premium : -l.premium) * l.qty * 100;
 }, 0);

 return (
 <motion.div
 layout
 className="bg-foreground/5 border border-border rounded-md overflow-hidden"
 >
 <button
 onClick={() => setExpanded(!expanded)}
 className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
 >
 <div className="flex items-center gap-3">
 <div>
 <div className="font-medium text-sm text-foreground">{strategy.name}</div>
 <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{strategy.description.slice(0, 70)}...</div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className={`text-xs text-muted-foreground border px-2 py-0.5 rounded-full ${CAT_COLORS[strategy.category]}`}>
 {CAT_LABELS[strategy.category]}
 </span>
 <span className={`text-xs font-mono ${netCredit >= 0 ? "text-green-400" : "text-red-400"}`}>
 {netCredit >= 0 ? "+" : ""}{netCredit.toFixed(0)} cr
 </span>
 {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
 </div>
 </button>

 <AnimatePresence>
 {expanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="px-4 pb-4 border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Payoff */}
 <div>
 <div className="text-xs text-muted-foreground mb-2">Payoff Diagram (Spot=$100)</div>
 <PayoffSVG legs={legs} spot={SPOT} compact />
 </div>

 {/* Details */}
 <div className="space-y-3">
 <p className="text-xs text-muted-foreground">{strategy.description}</p>

 <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
 <div className="bg-green-500/10 rounded p-2">
 <div className="text-xs text-muted-foreground ">Max Profit</div>
 <div className="text-green-400 font-medium mt-0.5">{strategy.maxProfit}</div>
 </div>
 <div className="bg-red-500/5 rounded p-2">
 <div className="text-xs text-muted-foreground ">Max Loss</div>
 <div className="text-red-400 font-medium mt-0.5">{strategy.maxLoss}</div>
 </div>
 </div>

 <div className="bg-foreground/5 rounded p-2 text-xs text-muted-foreground">
 <div className="text-xs text-muted-foreground mb-1">Ideal Conditions</div>
 <div className="text-muted-foreground">{strategy.idealConditions}</div>
 </div>

 <div className="bg-foreground/5 rounded p-2 text-xs text-muted-foreground">
 <div className="text-xs text-muted-foreground mb-1">Implied Move Needed</div>
 <div className="text-amber-300">{strategy.impliedMoveNeeded}</div>
 </div>

 {/* Greeks */}
 <div className="flex gap-2 flex-wrap">
 <GreeksPill label="Δ" value={netGreeks.delta} />
 <GreeksPill label="Θ/day" value={netGreeks.theta} />
 <GreeksPill label="V" value={netGreeks.vega} />
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}

function StrategyLibraryTab() {
 const [category, setCategory] = useState<string>("directional");

 const filtered = STRATEGIES.filter((s) => s.category === category);

 return (
 <div className="space-y-4">
 <div className="flex gap-2">
 {(["directional", "income", "volatility", "defensive"] as const).map((cat) => (
 <button
 key={cat}
 onClick={() => setCategory(cat)}
 className={`text-xs text-muted-foreground px-4 py-2 rounded-full border transition-colors ${
 category === cat ? CAT_COLORS[cat] : "border-border text-muted-foreground hover:text-muted-foreground"
 }`}
 >
 {CAT_LABELS[cat]}
 </button>
 ))}
 </div>

 <div className="space-y-3">
 <AnimatePresence mode="wait">
 <motion.div
 key={category}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="space-y-3"
 >
 {filtered.map((s) => (
 <StrategyCard key={s.id} strategy={s} />
 ))}
 </motion.div>
 </AnimatePresence>
 </div>
 </div>
 );
}

// ─── Tab 3: Rolling Strategies ────────────────────────────────────────────────

interface RollScenario {
 title: string;
 description: string;
 original: { strike: number; expiry: number; premium: number; label: string };
 rolled: { strike: number; expiry: number; premium: number; label: string };
 creditDebit: number;
 rationale: string;
 tips: string[];
}

function buildRollScenarios(): RollScenario[] {
 const origCall = bsCall(105, 105, 7, 0.30);
 const rolledCall = bsCall(105, 107, 35, 0.28);
 const origPut = bsPut(95, 95, 7, 0.32);
 const rolledPut = bsPut(95, 92, 35, 0.30);
 const calFront = bsCall(100, 100, 7, 0.35);
 const calBack = bsCall(100, 100, 35, 0.28);
 const origCC = bsCall(100, 105, 5, 0.30);
 const rolledCC = bsCall(100, 108, 30, 0.28);
 return [
 {
 title: "Roll Covered Call Up and Out",
 description: "Stock has rallied toward your short call. Roll to a higher strike and further expiry to avoid assignment while collecting more time premium.",
 original: { strike: 105, expiry: 7, premium: origCall.price, label: "105C / 7 DTE" },
 rolled: { strike: 107, expiry: 35, premium: rolledCall.price, label: "107C / 35 DTE" },
 creditDebit: rolledCall.price - origCall.price,
 rationale: "Buy back the 105C for a loss, sell 107C further out. Net debit or small credit depending on IV.",
 tips: [
 "Only roll if you can collect a net credit or near-zero debit",
 "Rolling up increases your cap but reduces downside protection",
 "Never roll just to avoid a small loss — consider taking assignment",
 ],
 },
 {
 title: "Roll Cash-Secured Put Down and Out",
 description: "Stock has dropped below your short put. Roll down and out to reduce your effective cost basis at expiry.",
 original: { strike: 95, expiry: 7, premium: origPut.price, label: "95P / 7 DTE" },
 rolled: { strike: 92, expiry: 35, premium: rolledPut.price, label: "92P / 35 DTE" },
 creditDebit: rolledPut.price - origPut.price,
 rationale: "Buy back the 95P, sell the 92P with more time. Lower cost basis if assigned.",
 tips: [
 "Rolling down increases potential assignment loss — only do it if you still want the stock",
 "Look for a net credit roll to reduce effective entry price",
 "After 2-3 rolls, consider taking assignment or closing the position",
 ],
 },
 {
 title: "Calendar Roll (Front Month to Back Month)",
 description: "Near-expiry short front-month option rolls to the back month. Extend the trade duration and collect more premium.",
 original: { strike: 100, expiry: 7, premium: calFront.price, label: "100C / 7 DTE (front)" },
 rolled: { strike: 100, expiry: 35, premium: calBack.price, label: "100C / 35 DTE (back)" },
 creditDebit: calBack.price - calFront.price,
 rationale: "Let front month expire or buy it back cheaply, then sell the next month's option.",
 tips: [
 "Ideal when front month IV > back month IV (term structure in backwardation)",
 "Most time premium rolls happen within 7-10 DTE of front month",
 "Calendar rolls are a key income generation technique for covered call writers",
 ],
 },
 {
 title: "Covered Call — Roll for Credit vs Debit",
 description: "Understand when rolling for a debit is still valid versus when to always require a credit.",
 original: { strike: 105, expiry: 5, premium: origCC.price, label: "105C / 5 DTE" },
 rolled: { strike: 108, expiry: 30, premium: rolledCC.price, label: "108C / 30 DTE" },
 creditDebit: rolledCC.price - origCC.price,
 rationale: "If the net roll is a small debit but unlocks significantly higher upside, it may be worth it.",
 tips: [
 "Roll for credit: always preferred — extends duration, new premium > buyback cost",
 "Roll for debit: only if the strike increase more than compensates for the debit paid",
 "Rule of thumb: debit should be < 50% of the additional upside gained",
 ],
 },
 ];
}

function RollCard({ scenario }: { scenario: RollScenario }) {
 const creditColor = scenario.creditDebit >= 0 ? "text-green-400" : "text-red-400";
 const creditLabel = scenario.creditDebit >= 0
 ? `+$${(scenario.creditDebit * 100).toFixed(0)} credit`
 : `-$${(Math.abs(scenario.creditDebit) * 100).toFixed(0)} debit`;

 return (
 <div className="bg-foreground/5 border border-border rounded-md p-5 space-y-4">
 <div className="flex items-start justify-between gap-4">
 <div>
 <h4 className="font-medium text-foreground text-sm">{scenario.title}</h4>
 <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
 </div>
 <span className={`text-sm font-mono font-semibold whitespace-nowrap ${creditColor}`}>{creditLabel}</span>
 </div>

 {/* Before / After */}
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
 <div className="text-xs text-red-400 mb-1">Original Position</div>
 <div className="text-xs text-foreground font-medium">{scenario.original.label}</div>
 <div className="text-xs text-muted-foreground mt-1">Premium: ${(scenario.original.premium * 100).toFixed(0)}</div>
 </div>
 <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
 <div className="text-xs text-green-400 mb-1">Rolled Position</div>
 <div className="text-xs text-foreground font-medium">{scenario.rolled.label}</div>
 <div className="text-xs text-muted-foreground mt-1">Premium: ${(scenario.rolled.premium * 100).toFixed(0)}</div>
 </div>
 </div>

 <div className="bg-muted/10 border border-border rounded-lg p-3">
 <div className="text-xs text-foreground mb-1">Rationale</div>
 <p className="text-xs text-muted-foreground">{scenario.rationale}</p>
 </div>

 <div>
 <div className="text-xs text-muted-foreground mb-2">Key Tips</div>
 <ul className="space-y-1">
 {scenario.tips.map((tip, i) => (
 <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="text-foreground mt-0.5">•</span>
 <span>{tip}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 );
}

function RollingStrategiesTab() {
 const scenarios = useMemo(() => buildRollScenarios(), []);

 return (
 <div className="space-y-4">
 <div className="bg-foreground/5 border border-border rounded-md p-4">
 <h3 className="text-sm font-medium text-foreground mb-2">When to Roll a Position</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
 {[
 { trigger: "Short option is ITM", action: "Roll up/down and out for credit", color: "text-red-400" },
 { trigger: "7-10 DTE remaining", action: "Roll to next month (theta accelerates)", color: "text-amber-400" },
 { trigger: "50-75% max profit", action: "Close or roll to lock in gains", color: "text-green-400" },
 ].map((item, i) => (
 <div key={i} className="bg-foreground/5 rounded-lg p-3">
 <div className={`font-medium mb-1 ${item.color}`}>{item.trigger}</div>
 <div className="text-muted-foreground">{item.action}</div>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 {scenarios.map((s, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 >
 <RollCard scenario={s} />
 </motion.div>
 ))}
 </div>
 </div>
 );
}

// ─── Tab 4: Earnings Plays ────────────────────────────────────────────────────

const EARNINGS_STOCKS = [
 { ticker: "AAPL", avgMove: 4.2, ivRank: 65, straddle: 3.8, beat: "+5.1%", miss: "-4.8%" },
 { ticker: "NVDA", avgMove: 9.5, ivRank: 80, straddle: 8.9, beat: "+12.3%", miss: "-8.7%" },
 { ticker: "TSLA", avgMove: 11.2, ivRank: 75, straddle: 10.5, beat: "+9.8%", miss: "-13.4%" },
 { ticker: "MSFT", avgMove: 3.1, ivRank: 55, straddle: 2.9, beat: "+3.8%", miss: "-2.7%" },
 { ticker: "AMZN", avgMove: 5.8, ivRank: 70, straddle: 5.4, beat: "+7.2%", miss: "-5.9%" },
 { ticker: "META", avgMove: 8.3, ivRank: 78, straddle: 7.8, beat: "+11.5%", miss: "-9.1%" },
 { ticker: "GOOGL", avgMove: 4.7, ivRank: 62, straddle: 4.3, beat: "+5.9%", miss: "-4.2%" },
 { ticker: "NFLX", avgMove: 9.1, ivRank: 82, straddle: 8.7, beat: "+10.8%", miss: "-10.2%" },
 { ticker: "AMD", avgMove: 7.6, ivRank: 76, straddle: 7.1, beat: "+9.4%", miss: "-8.8%" },
 { ticker: "CRM", avgMove: 6.4, ivRank: 68, straddle: 5.9, beat: "+7.3%", miss: "-7.1%" },
];

function IVCrushViz({ ivBefore, ivAfter }: { ivBefore: number; ivAfter: number }) {
 const crushPct = ((ivBefore - ivAfter) / ivBefore) * 100;
 return (
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>IV Before: <span className="text-foreground font-medium">{ivBefore}%</span></span>
 <span>IV After: <span className="text-foreground font-medium">{ivAfter}%</span></span>
 <span className="text-red-400 font-medium">-{crushPct.toFixed(0)}% crush</span>
 </div>
 <div className="h-3 bg-foreground/5 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: "100%" }}
 animate={{ width: `${(ivAfter / ivBefore) * 100}%` }}
 transition={{ duration: 1.5, ease: "easeOut" }}
 className="h-full bg-red-500 rounded-full"
 />
 </div>
 </div>
 );
}

function EarningsPlaysTab() {
 const [selectedTicker, setSelectedTicker] = useState("AAPL");
 const stock = EARNINGS_STOCKS.find((s) => s.ticker === selectedTicker) ?? EARNINGS_STOCKS[0];

 // Simulate straddle value pre/post earnings
 const straddleSpot = 100;
 const ivBefore = 0.60;
 const ivAfter = 0.28;
 const longStraddle = [
 { direction: "long" as LegDirection, type: "call" as OptionType, strike: 100, expiry: 1, qty: 1, iv: ivBefore, id: "c", premium: bsCall(straddleSpot, 100, 1, ivBefore).price },
 { direction: "long" as LegDirection, type: "put" as OptionType, strike: 100, expiry: 1, qty: 1, iv: ivBefore, id: "p", premium: bsPut(straddleSpot, 100, 1, ivBefore).price },
 ];
 const ironCondorLegs = [
 { direction: "short" as LegDirection, type: "put" as OptionType, strike: 93, expiry: 1, qty: 1, iv: ivBefore, id: "sp", premium: bsPut(straddleSpot, 93, 1, ivBefore).price },
 { direction: "long" as LegDirection, type: "put" as OptionType, strike: 88, expiry: 1, qty: 1, iv: ivBefore, id: "lp", premium: bsPut(straddleSpot, 88, 1, ivBefore).price },
 { direction: "short" as LegDirection, type: "call" as OptionType, strike: 107, expiry: 1, qty: 1, iv: ivBefore, id: "sc", premium: bsCall(straddleSpot, 107, 1, ivBefore).price },
 { direction: "long" as LegDirection, type: "call" as OptionType, strike: 112, expiry: 1, qty: 1, iv: ivBefore, id: "lc", premium: bsCall(straddleSpot, 112, 1, ivBefore).price },
 ];

 const straddleCost = longStraddle.reduce((sum, l) => sum + l.premium, 0);
 const expectedMove = straddleCost / straddleSpot * 100;

 return (
 <div className="space-y-4">
 {/* IV Crush explainer */}
 <div className="bg-foreground/5 border border-border rounded-md p-5 space-y-4">
 <h3 className="text-sm font-medium text-foreground">IV Crush Effect After Earnings</h3>
 <IVCrushViz ivBefore={60} ivAfter={28} />
 <p className="text-xs text-muted-foreground">
 IV spikes before earnings as market prices in uncertainty. After the report, regardless of beat or miss,
 IV collapses rapidly — this is IV crush. Long options lose significant value even if the stock moves.
 </p>
 <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 {[
 { strategy: "Long Straddle", ivCrush: "Hurts (-30 to -50%)", catalyst: "Only wins with huge move" },
 { strategy: "Iron Condor", ivCrush: "Helps (+15 to +30%)", catalyst: "Profits if stock stays rangebound" },
 { strategy: "Covered Call", ivCrush: "Neutral (short already)", catalyst: "Collect premium pre-earnings" },
 ].map((row, i) => (
 <div key={i} className="bg-foreground/5 rounded-lg p-3 space-y-1">
 <div className="font-medium text-foreground">{row.strategy}</div>
 <div className="text-muted-foreground">IV Crush: {row.ivCrush}</div>
 <div className="text-muted-foreground">{row.catalyst}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Expected Move Calculator */}
 <div className="bg-foreground/5 border border-border rounded-md p-5">
 <h3 className="text-sm font-medium text-foreground mb-3">Expected Move Calculator</h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <div className="text-xs text-muted-foreground mb-2">ATM Straddle = Market&apos;s Expected Move</div>
 <div className="bg-foreground/5 rounded-lg p-3 space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">ATM Call Premium:</span>
 <span className="text-foreground">${bsCall(100, 100, 1, ivBefore).price.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">ATM Put Premium:</span>
 <span className="text-foreground">${bsPut(100, 100, 1, ivBefore).price.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground font-medium border-t border-border pt-2">
 <span className="text-muted-foreground">Total Straddle:</span>
 <span className="text-amber-400">${straddleCost.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground font-medium">
 <span className="text-muted-foreground">Expected ±Move:</span>
 <span className="text-amber-400">±{expectedMove.toFixed(1)}%</span>
 </div>
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground mb-2">Straddle vs Iron Condor Payoff</div>
 <div className="grid grid-rows-2 gap-2">
 <div>
 <div className="text-xs text-muted-foreground mb-1">Long Straddle (long vol)</div>
 <PayoffSVG legs={longStraddle} spot={straddleSpot} compact />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Historical reactions table */}
 <div className="bg-foreground/5 border border-border rounded-md overflow-hidden">
 <div className="p-4 border-b border-border">
 <h3 className="text-sm font-medium text-foreground">Historical Earnings Reactions</h3>
 <p className="text-xs text-muted-foreground mt-1">Avg move, straddle cost as % of stock price, and typical beat/miss reactions</p>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead className="bg-foreground/5">
 <tr>
 {["Ticker", "Avg Move", "IV Rank", "Straddle %", "Beat Reaction", "Miss Reaction", "Best Play"].map((h) => (
 <th key={h} className="px-4 py-2 text-left text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {EARNINGS_STOCKS.map((s, i) => {
 const bestPlay = s.ivRank > 70
 ? (s.avgMove < 5 ? "Iron Condor" : "Short Strangle")
 : (s.avgMove > 8 ? "Long Straddle" : "Long Strangle");
 return (
 <tr
 key={s.ticker}
 onClick={() => setSelectedTicker(s.ticker)}
 className={`border-t border-border cursor-pointer transition-colors ${selectedTicker === s.ticker ? "bg-muted/10" : "hover:bg-muted/30"}`}
 >
 <td className="px-4 py-2.5 font-medium text-foreground">{s.ticker}</td>
 <td className="px-4 py-2.5 text-amber-400">±{s.avgMove}%</td>
 <td className="px-4 py-2.5">
 <span className={`${s.ivRank > 70 ? "text-red-400" : s.ivRank > 50 ? "text-amber-400" : "text-green-400"}`}>{s.ivRank}</span>
 </td>
 <td className="px-4 py-2.5 text-muted-foreground">{s.straddle}%</td>
 <td className="px-4 py-2.5 text-green-400">{s.beat}</td>
 <td className="px-4 py-2.5 text-red-400">{s.miss}</td>
 <td className="px-4 py-2.5 text-foreground">{bestPlay}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 {/* IV Rank Playbook */}
 <div className="bg-foreground/5 border border-border rounded-md p-5">
 <h3 className="text-sm font-medium text-foreground mb-3">IV Rank Playbook for Earnings</h3>
 <div className="grid grid-cols-3 gap-4">
 {[
 { range: "IV Rank < 30", label: "Low IV", color: "text-green-400 bg-green-500/10", strategies: ["Long Straddle", "Long Strangle"], reason: "Options are cheap — pay for vol before IV spikes pre-earnings" },
 { range: "IV Rank 30-70", label: "Medium IV", color: "text-amber-400 bg-amber-500/10", strategies: ["Calendar Spread", "Jade Lizard"], reason: "Balanced approach — sell some IV while hedging with spreads" },
 { range: "IV Rank > 70", label: "High IV", color: "text-red-400 bg-red-500/5", strategies: ["Iron Condor", "Short Strangle"], reason: "IV crush will hurt longs — be a net seller, profit from vol collapse" },
 ].map((item) => (
 <div key={item.range} className={`rounded-md p-4 ${item.color}`}>
 <div className="text-xs text-muted-foreground font-medium mb-1">{item.range}</div>
 <div className="text-sm font-semibold mb-2">{item.label}</div>
 <div className="text-xs text-muted-foreground font-medium mb-2">{item.strategies.join(" / ")}</div>
 <p className="text-xs text-muted-foreground opacity-80">{item.reason}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ─── Tab 5: Portfolio Hedging ─────────────────────────────────────────────────

interface StockPosition {
 ticker: string;
 weight: number;
 beta: number;
 price: number;
}

const DEFAULT_POSITIONS: StockPosition[] = [
 { ticker: "AAPL", weight: 25, beta: 1.2, price: 185 },
 { ticker: "MSFT", weight: 20, beta: 1.1, price: 415 },
 { ticker: "NVDA", weight: 15, beta: 1.8, price: 875 },
 { ticker: "AMZN", weight: 15, beta: 1.3, price: 185 },
 { ticker: "JPM", weight: 10, beta: 1.0, price: 198 },
 { ticker: "BRK", weight: 15, beta: 0.7, price: 370 },
];

function PortfolioHedgingTab() {
 const [portfolioValue, setPortfolioValue] = useState(100000);
 const [positions, setPositions] = useState<StockPosition[]>(DEFAULT_POSITIONS);
 const [spxPrice] = useState(5100);
 const [putStrike, setPutStrike] = useState(0.95); // 5% OTM
 const [putDTE, setPutDTE] = useState(60);
 const [hedgeIV] = useState(0.20);

 const portfolioBeta = useMemo(() =>
 positions.reduce((sum, p) => sum + p.weight * p.beta / 100, 0),
 [positions]
 );

 // SPX put sizing
 const notionalToHedge = portfolioValue * portfolioBeta;
 const spxPutStrike = spxPrice * putStrike;
 const spxPutContract = bsPut(spxPrice, spxPutStrike, putDTE, hedgeIV);
 const contractsNeeded = Math.ceil(notionalToHedge / (spxPrice * 100));
 const hedgeCost = contractsNeeded * spxPutContract.price * 100;
 const hedgeCostPct = (hedgeCost / portfolioValue) * 100;

 // Collar cost
 const atmCall = bsCall(spxPrice, spxPrice * 1.05, putDTE, hedgeIV);
 const collarCost = spxPutContract.price - atmCall.price;
 const isZeroCost = Math.abs(collarCost) < 0.50;

 // Delta hedging explanation data
 const deltaHedgeData = useMemo(() => {
 const pts: { price: number; delta: number; shares: number }[] = [];
 for (let i = 0; i <= 20; i++) {
 const p = spxPrice * (0.9 + i * 0.01);
 const d = bsPut(spxPrice, spxPutStrike, putDTE, hedgeIV).delta;
 pts.push({ price: p, delta: d, shares: Math.abs(d) * contractsNeeded * 100 });
 }
 return pts;
 }, [spxPrice, spxPutStrike, putDTE, hedgeIV, contractsNeeded]);

 // Theta decay SVG for portfolio put
 const thetaDecayCurve = useMemo(() => {
 const pts: [number, number][] = [];
 for (let dte = putDTE; dte >= 0; dte--) {
 pts.push([dte, bsPut(spxPrice, spxPutStrike, dte, hedgeIV).price]);
 }
 return pts;
 }, [spxPrice, spxPutStrike, putDTE, hedgeIV]);

 const tdPrices = thetaDecayCurve.map(([, v]) => v);
 const tdMin = Math.min(...tdPrices);
 const tdMax = Math.max(...tdPrices);
 const tdW = 320, tdH = 120;
 const tdCW = tdW - 40 - 8;
 const tdCH = tdH - 16 - 20;
 const tdPath = thetaDecayCurve
 .map(([x, y], i) => {
 const px = 40 + ((putDTE - x) / putDTE) * tdCW;
 const py = 16 + tdCH - ((y - tdMin) / (tdMax - tdMin + 0.001)) * tdCH;
 return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
 })
 .join("");

 return (
 <div className="space-y-4">
 {/* Portfolio Beta Calculator */}
 <div className="bg-foreground/5 border border-border rounded-md p-5">
 <h3 className="text-sm font-medium text-foreground mb-3">Portfolio Beta Calculator</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs text-muted-foreground">Portfolio Value: ${portfolioValue.toLocaleString()}</span>
 <input
 type="range"
 min={10000}
 max={1000000}
 step={10000}
 value={portfolioValue}
 onChange={(e) => setPortfolioValue(Number(e.target.value))}
 className="w-32"
 />
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left py-1">Ticker</th>
 <th className="text-right py-1">Weight %</th>
 <th className="text-right py-1">Beta</th>
 <th className="text-right py-1">Beta Contribution</th>
 </tr>
 </thead>
 <tbody>
 {positions.map((p) => (
 <tr key={p.ticker} className="border-b border-border">
 <td className="py-1.5 text-foreground font-medium">{p.ticker}</td>
 <td className="text-right text-muted-foreground">{p.weight}%</td>
 <td className="text-right text-muted-foreground">{p.beta}</td>
 <td className="text-right text-amber-400">{((p.weight * p.beta) / 100).toFixed(3)}</td>
 </tr>
 ))}
 </tbody>
 <tfoot>
 <tr className="border-t border-border font-medium">
 <td className="py-2 text-muted-foreground">Total</td>
 <td className="text-right text-muted-foreground">100%</td>
 <td className="text-right text-amber-400">{portfolioBeta.toFixed(2)}</td>
 <td></td>
 </tr>
 </tfoot>
 </table>
 </div>
 </div>

 {/* Hedge Sizing */}
 <div className="space-y-3">
 <div className="bg-muted/10 border border-border rounded-lg p-3 space-y-2">
 <div className="text-xs text-foreground font-medium">Hedge Sizing</div>
 <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
 <div>
 <div className="text-muted-foreground">Notional to Hedge</div>
 <div className="text-foreground font-medium">${notionalToHedge.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
 </div>
 <div>
 <div className="text-muted-foreground">SPX Contracts Needed</div>
 <div className="text-foreground font-medium">{contractsNeeded} contracts</div>
 </div>
 <div>
 <div className="text-muted-foreground">Hedge Cost</div>
 <div className="text-red-400 font-medium">${hedgeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
 </div>
 <div>
 <div className="text-muted-foreground">As % of Portfolio</div>
 <div className="text-red-400 font-medium">{hedgeCostPct.toFixed(2)}%/yr</div>
 </div>
 </div>
 </div>

 <div className="flex gap-3">
 <div className="flex-1">
 <label className="text-xs text-muted-foreground ">Put Strike</label>
 <select
 value={putStrike}
 onChange={(e) => setPutStrike(Number(e.target.value))}
 className="mt-1 w-full bg-foreground/10 text-foreground text-xs rounded px-2 py-1"
 >
 <option value={1.0}>ATM (0%)</option>
 <option value={0.97}>3% OTM</option>
 <option value={0.95}>5% OTM</option>
 <option value={0.90}>10% OTM</option>
 <option value={0.85}>15% OTM</option>
 </select>
 </div>
 <div className="flex-1">
 <label className="text-xs text-muted-foreground ">DTE</label>
 <select
 value={putDTE}
 onChange={(e) => setPutDTE(Number(e.target.value))}
 className="mt-1 w-full bg-foreground/10 text-foreground text-xs rounded px-2 py-1"
 >
 <option value={30}>30 days</option>
 <option value={60}>60 days</option>
 <option value={90}>90 days</option>
 <option value={180}>180 days</option>
 </select>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Collar Construction */}
 <div className="bg-foreground/5 border border-border rounded-md p-5">
 <h3 className="text-sm font-medium text-foreground mb-3">Zero-Cost Collar Construction</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-foreground/5 rounded-lg p-3 space-y-2 text-xs text-muted-foreground">
 <div className="text-xs text-muted-foreground ">Buy Put (Protection)</div>
 <div>Strike: ${spxPutStrike.toFixed(0)} ({((1 - putStrike) * 100).toFixed(0)}% OTM)</div>
 <div>Cost: ${(spxPutContract.price * 100).toFixed(0)}/contract</div>
 <div>Delta: {spxPutContract.delta.toFixed(3)}</div>
 </div>
 <div className="bg-foreground/5 rounded-lg p-3 space-y-2 text-xs text-muted-foreground">
 <div className="text-xs text-muted-foreground ">Sell Call (Finance)</div>
 <div>Strike: ${(spxPrice * 1.05).toFixed(0)} (5% OTM)</div>
 <div>Credit: ${(atmCall.price * 100).toFixed(0)}/contract</div>
 <div>Delta: {atmCall.delta.toFixed(3)}</div>
 </div>
 <div className={`rounded-lg p-3 space-y-2 text-xs text-muted-foreground ${isZeroCost ? "bg-green-500/10" : collarCost > 0 ? "bg-red-500/5" : "bg-green-500/10"}`}>
 <div className="text-xs text-muted-foreground ">Net Cost</div>
 <div className={`text-lg font-medium ${isZeroCost ? "text-green-400" : collarCost > 0 ? "text-red-400" : "text-green-400"}`}>
 {isZeroCost ? "Zero Cost!" : collarCost > 0 ? `Debit $${(collarCost * 100).toFixed(0)}` : `Credit $${(Math.abs(collarCost) * 100).toFixed(0)}`}
 </div>
 <div className="text-muted-foreground">This collar {isZeroCost ? "costs nothing to implement" : collarCost > 0 ? "requires a net payment" : "generates a credit"}</div>
 </div>
 </div>
 </div>

 {/* Put decay curve */}
 <div className="bg-foreground/5 border border-border rounded-md p-5">
 <h3 className="text-sm font-medium text-foreground mb-3">Protective Put Theta Decay</h3>
 <svg width={tdW} height={tdH}>
 <path d={tdPath} fill="none" stroke="#f87171" strokeWidth={2} />
 <line x1={40} y1={16} x2={40} y2={16 + tdCH} stroke="#374151" strokeWidth={1} />
 <line x1={40} y1={16 + tdCH} x2={tdW - 8} y2={16 + tdCH} stroke="#374151" strokeWidth={1} />
 <text x={40 + tdCW / 2} y={tdH - 2} textAnchor="middle" fill="#6b7280" fontSize={9}>Days to Expiry (left = today, right = entry)</text>
 {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
 const dte = Math.round(putDTE * t);
 const px = 40 + ((putDTE - dte) / putDTE) * tdCW;
 return <text key={i} x={px} y={16 + tdCH + 12} textAnchor="middle" fill="#6b7280" fontSize={8}>{dte}d</text>;
 })}
 </svg>
 <p className="text-xs text-muted-foreground mt-2">
 Time decay accelerates in the final 30 days. Roll or replace hedges before reaching 30 DTE to avoid paying excessive theta.
 </p>
 </div>

 {/* VIX calls as tail hedge */}
 <div className="bg-foreground/5 border border-border rounded-md p-5 space-y-3">
 <h3 className="text-sm font-medium text-foreground">VIX Calls as Tail Hedge</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
 {[
 { label: "VIX Spot", value: "16.4", color: "text-green-400" },
 { label: "VIX 30C Cost", value: "$0.85", color: "text-foreground" },
 { label: "Correlation to SPX", value: "-0.78", color: "text-red-400" },
 { label: "Sizing (% of port)", value: "0.5-1%", color: "text-amber-400" },
 ].map((item, i) => (
 <div key={i} className="bg-foreground/5 rounded-lg p-3">
 <div className="text-muted-foreground">{item.label}</div>
 <div className={`text-sm font-medium mt-1 ${item.color}`}>{item.value}</div>
 </div>
 ))}
 </div>
 <div className="text-xs text-muted-foreground space-y-1">
 <p>• VIX calls spike 3-5x during market dislocations (VIX goes from 15 → 40-80)</p>
 <p>• Allocate 0.5-1% of portfolio to VIX calls to hedge tail risk cheaply</p>
 <p>• Choose 1-3 month expirations at 1.5-2x current VIX as strikes</p>
 <p>• Negative correlation to equities makes this an effective crisis hedge</p>
 </div>
 </div>
 </div>
 );
}

// ─── Tab 6: Greek Management ──────────────────────────────────────────────────

interface PortfolioPosition {
 id: string;
 ticker: string;
 strategy: string;
 delta: number;
 gamma: number;
 theta: number;
 vega: number;
 notional: number;
}

const PORTFOLIO_POSITIONS: PortfolioPosition[] = [
 { id: "1", ticker: "AAPL", strategy: "Covered Call", delta: 42.3, gamma: -1.2, theta: 18.5, vega: -8.2, notional: 18500 },
 { id: "2", ticker: "NVDA", strategy: "Bull Call Spread", delta: 28.6, gamma: 2.1, theta: -12.3, vega: 15.4, notional: 8750 },
 { id: "3", ticker: "MSFT", strategy: "Iron Condor", delta: -3.2, gamma: -0.8, theta: 22.4, vega: -18.6, notional: 12400 },
 { id: "4", ticker: "SPY", strategy: "Protective Put", delta: -28.4, gamma: 1.8, theta: -9.2, vega: 14.3, notional: 25000 },
 { id: "5", ticker: "TSLA", strategy: "Long Straddle", delta: 1.2, gamma: 3.4, theta: -28.7, vega: 32.1, notional: 9800 },
];

function ThetaDecayCurve() {
 const dteSeries = Array.from({ length: 91 }, (_, i) => i);
 const W2 = 360, H2 = 160;
 const pad = { top: 12, right: 12, bottom: 28, left: 44 };
 const cw2 = W2 - pad.left - pad.right;
 const ch2 = H2 - pad.top - pad.bottom;

 const curves = [
 { label: "ATM", K: 100, color: "#60a5fa" },
 { label: "5% OTM", K: 105, color: "#34d399" },
 { label: "10% OTM", K: 110, color: "#f59e0b" },
 ];

 const S = 100;
 const iv = 0.30;
 const r = 0.05;

 const allPrices = curves.flatMap(({ K }) =>
 dteSeries.map((dte) => {
 if (dte === 0) return 0;
 return bsCall(S, K, dte, iv, r).price;
 })
 );
 const maxVal = Math.max(...allPrices);

 const sx = (dte: number) => pad.left + ((90 - dte) / 90) * cw2;
 const sy = (v: number) => pad.top + ch2 - (v / maxVal) * ch2;

 return (
 <div className="bg-foreground/5 border border-border rounded-md p-4">
 <h4 className="text-sm font-medium text-foreground mb-3">Theta Decay Curve — ATM vs OTM</h4>
 <svg width={W2} height={H2}>
 {curves.map(({ label, K, color }) => {
 const path = dteSeries
 .map((dte, i) => {
 const price = dte === 0 ? 0 : bsCall(S, K, dte, iv, r).price;
 return `${i === 0 ? "M" : "L"} ${sx(dte).toFixed(1)} ${sy(price).toFixed(1)}`;
 })
 .join("");
 return (
 <g key={label}>
 <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
 <text x={sx(dteSeries[0]) + 4} y={sy(K === 100 ? bsCall(S, K, 1, iv).price : bsCall(S, K, 1, iv).price) - 4} fill={color} fontSize={9}>{label}</text>
 </g>
 );
 })}
 <line x1={pad.left} y1={pad.top + ch2} x2={W2 - pad.right} y2={pad.top + ch2} stroke="#374151" strokeWidth={1} />
 {[0, 30, 60, 90].map((dte) => (
 <text key={dte} x={sx(dte)} y={pad.top + ch2 + 14} textAnchor="middle" fill="#6b7280" fontSize={9}>{dte}d</text>
 ))}
 {[0, 0.5, 1].map((t) => {
 const val = t * maxVal;
 return <text key={t} x={pad.left - 4} y={sy(val) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>${val.toFixed(1)}</text>;
 })}
 </svg>
 <p className="text-xs text-muted-foreground mt-2">ATM options decay fastest in the final 30 days (convex curve). OTM options decay more linearly and retain less value at expiry.</p>
 </div>
 );
}

function GammaScalpingSim() {
 const [hedgeInterval, setHedgeInterval] = useState(5);
 const S0 = 100;
 const K = 100;
 const T = 30;
 const iv = 0.30;
 const initPrice = bsCall(S0, K, T, iv).price;
 let s2 = 79;
 const r2 = () => { s2 = (s2 * 1103515245 + 12345) & 0x7fffffff; return s2 / 0x7fffffff; };

 const simData = useMemo(() => {
 s2 = 79;
 const steps = 30;
 let S = S0;
 let cumulativePnL = 0;
 let shares = 0;
 const pts: { day: number; stockPrice: number; optionPnL: number; hedgePnL: number; totalPnL: number }[] = [];

 for (let day = 0; day < steps; day++) {
 const dte = T - day;
 const ret = (r2() - 0.5) * 0.04;
 const newS = S * (1 + ret);
 const oldBs = bsCall(S, K, dte + 1, iv);
 const newBs = dte > 0 ? bsCall(newS, K, dte, iv) : { price: Math.max(0, newS - K), delta: newS > K ? 1 : 0, gamma: 0, theta: 0, vega: 0 };

 const optionPnL = (newBs.price - initPrice) * 100;

 // Hedge P&L: short shares of stock to delta hedge
 const hedgePnLDelta = -shares * (newS - S);
 cumulativePnL += hedgePnLDelta;

 if (day % hedgeInterval === 0) {
 shares = oldBs.delta * 100;
 }

 pts.push({
 day,
 stockPrice: newS,
 optionPnL,
 hedgePnL: cumulativePnL,
 totalPnL: optionPnL + cumulativePnL,
 });
 S = newS;
 }
 return pts;
 }, [hedgeInterval]);

 const totalPnls = simData.map((d) => d.totalPnL);
 const minPnL = Math.min(...totalPnls, -50);
 const maxPnL = Math.max(...totalPnls, 50);
 const simW = 360, simH = 140;
 const simPad = { top: 12, right: 12, bottom: 20, left: 44 };
 const simCW = simW - simPad.left - simPad.right;
 const simCH = simH - simPad.top - simPad.bottom;
 const sx = (d: number) => simPad.left + (d / (simData.length - 1)) * simCW;
 const sy2 = (v: number) => simPad.top + simCH - ((v - minPnL) / (maxPnL - minPnL)) * simCH;
 const zeroY = sy2(0);

 const makePath = (key: "totalPnL" | "optionPnL" | "hedgePnL") =>
 simData.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.day).toFixed(1)} ${sy2(d[key]).toFixed(1)}`).join("");

 return (
 <div className="bg-foreground/5 border border-border rounded-md p-4 space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-medium text-foreground">Gamma Scalping Simulation</h4>
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <span className="text-muted-foreground">Hedge every</span>
 {[1, 3, 5, 10].map((n) => (
 <button
 key={n}
 onClick={() => setHedgeInterval(n)}
 className={`px-2 py-0.5 rounded ${hedgeInterval === n ? "bg-primary text-foreground-foreground" : "bg-foreground/10 text-muted-foreground"}`}
 >
 {n}d
 </button>
 ))}
 </div>
 </div>
 <svg width={simW} height={simH}>
 <line x1={simPad.left} y1={zeroY} x2={simW - simPad.right} y2={zeroY} stroke="#374151" strokeDasharray="3 3" strokeWidth={1} />
 <path d={makePath("optionPnL")} fill="none" stroke="#6b7280" strokeWidth={1} strokeDasharray="4 4" />
 <path d={makePath("hedgePnL")} fill="none" stroke="#f87171" strokeWidth={1} />
 <path d={makePath("totalPnL")} fill="none" stroke="#60a5fa" strokeWidth={2} />
 {[0, 15, 29].map((d) => (
 <text key={d} x={sx(d)} y={simH - 2} textAnchor="middle" fill="#6b7280" fontSize={9}>Day {d}</text>
 ))}
 <text x={simPad.left - 4} y={zeroY + 4} textAnchor="end" fill="#6b7280" fontSize={9}>$0</text>
 </svg>
 <div className="flex gap-4 text-xs text-muted-foreground">
 <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Total P&L</span>
 <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block" /> Hedge P&L</span>
 <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-muted-foreground inline-block border-dashed" /> Option P&L</span>
 </div>
 <p className="text-xs text-muted-foreground">
 Long gamma positions profit from large moves. Delta hedging more frequently captures more gamma scalping profit but increases transaction costs.
 Hedge every 1-3 days captures most of the benefit.
 </p>
 </div>
 );
}

function GreekManagementTab() {
 const totals = PORTFOLIO_POSITIONS.reduce(
 (acc, p) => ({
 delta: acc.delta + p.delta,
 gamma: acc.gamma + p.gamma,
 theta: acc.theta + p.theta,
 vega: acc.vega + p.vega,
 }),
 { delta: 0, gamma: 0, theta: 0, vega: 0 }
 );

 const vegaImpact = useMemo(() => {
 const pts: [number, number][] = [];
 for (let ivChg = -0.20; ivChg <= 0.20; ivChg += 0.01) {
 pts.push([ivChg * 100, totals.vega * ivChg * 100]);
 }
 return pts;
 }, [totals.vega]);

 const vegaPnls = vegaImpact.map(([, v]) => v);
 const vegaMin = Math.min(...vegaPnls);
 const vegaMax = Math.max(...vegaPnls);
 const vegaW = 320, vegaH = 120;
 const vegaPad = { top: 10, right: 8, bottom: 20, left: 44 };
 const vegaCW = vegaW - vegaPad.left - vegaPad.right;
 const vegaCH = vegaH - vegaPad.top - vegaPad.bottom;
 const vegaSX = (v: number) => vegaPad.left + ((v + 20) / 40) * vegaCW;
 const vegaSY = (v: number) => vegaPad.top + vegaCH - ((v - vegaMin) / (vegaMax - vegaMin + 0.001)) * vegaCH;
 const vegaZeroY = vegaSY(0);
 const vegaPath = vegaImpact.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${vegaSX(x).toFixed(1)} ${vegaSY(y).toFixed(1)}`).join("");

 return (
 <div className="space-y-4">
 {/* Risk Dashboard */}
 <div className="bg-foreground/5 border border-border rounded-md p-5">
 <h3 className="text-sm font-medium text-foreground mb-4">Portfolio Greeks Risk Dashboard</h3>

 <div className="overflow-x-auto mb-4">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 {["Position", "Strategy", "Delta", "Gamma", "Theta/day", "Vega/1%"].map((h) => (
 <th key={h} className="text-left py-1.5 px-2">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {PORTFOLIO_POSITIONS.map((p) => (
 <tr key={p.id} className="border-b border-border">
 <td className="py-2 px-2 text-foreground font-medium">{p.ticker}</td>
 <td className="py-2 px-2 text-muted-foreground">{p.strategy}</td>
 <td className={`py-2 px-2 font-mono ${p.delta > 0 ? "text-green-400" : "text-red-400"}`}>{p.delta > 0 ? "+" : ""}{p.delta.toFixed(1)}</td>
 <td className={`py-2 px-2 font-mono ${p.gamma > 0 ? "text-green-400" : "text-red-400"}`}>{p.gamma > 0 ? "+" : ""}{p.gamma.toFixed(2)}</td>
 <td className={`py-2 px-2 font-mono ${p.theta > 0 ? "text-green-400" : "text-red-400"}`}>{p.theta > 0 ? "+" : ""}{p.theta.toFixed(1)}</td>
 <td className={`py-2 px-2 font-mono ${p.vega > 0 ? "text-green-400" : "text-red-400"}`}>{p.vega > 0 ? "+" : ""}{p.vega.toFixed(1)}</td>
 </tr>
 ))}
 </tbody>
 <tfoot>
 <tr className="border-t border-border font-medium text-foreground">
 <td className="py-2 px-2" colSpan={2}>NET PORTFOLIO</td>
 <td className={`py-2 px-2 font-mono ${totals.delta > 0 ? "text-green-400" : "text-red-400"}`}>{totals.delta > 0 ? "+" : ""}{totals.delta.toFixed(1)}</td>
 <td className={`py-2 px-2 font-mono ${totals.gamma > 0 ? "text-green-400" : "text-red-400"}`}>{totals.gamma > 0 ? "+" : ""}{totals.gamma.toFixed(2)}</td>
 <td className={`py-2 px-2 font-mono ${totals.theta > 0 ? "text-green-400" : "text-red-400"}`}>{totals.theta > 0 ? "+" : ""}{totals.theta.toFixed(1)}</td>
 <td className={`py-2 px-2 font-mono ${totals.vega > 0 ? "text-green-400" : "text-red-400"}`}>{totals.vega > 0 ? "+" : ""}{totals.vega.toFixed(1)}</td>
 </tr>
 </tfoot>
 </table>
 </div>

 {/* Greeks bar chart SVG */}
 <div className="grid grid-cols-4 gap-3">
 {(["delta", "gamma", "theta", "vega"] as const).map((greek) => {
 const positions_sorted = [...PORTFOLIO_POSITIONS].sort((a, b) => Math.abs(b[greek]) - Math.abs(a[greek]));
 const maxVal = Math.max(...PORTFOLIO_POSITIONS.map((p) => Math.abs(p[greek])));
 return (
 <div key={greek} className="bg-foreground/5 rounded-lg p-3">
 <div className="text-xs text-muted-foreground mb-2 capitalize">{greek} by Position</div>
 {positions_sorted.map((p) => {
 const barWidth = (Math.abs(p[greek]) / maxVal) * 100;
 const isPos = p[greek] >= 0;
 return (
 <div key={p.id} className="mb-1">
 <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
 <span className="text-muted-foreground">{p.ticker}</span>
 <span className={isPos ? "text-green-400" : "text-red-400"}>{p[greek].toFixed(1)}</span>
 </div>
 <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full ${isPos ? "bg-green-500" : "bg-red-500"}`}
 style={{ width: `${barWidth}%` }}
 />
 </div>
 </div>
 );
 })}
 </div>
 );
 })}
 </div>
 </div>

 {/* Delta neutral explainer */}
 <div className="bg-foreground/5 border border-border rounded-md p-5 space-y-3">
 <h3 className="text-sm font-medium text-foreground">Delta Neutral Strategies</h3>
 <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 {[
 {
 name: "Stock + Short Call",
 delta: "+100 (stock) − 40 (call delta × 100) = +60",
 adjust: "Sell more calls or buy puts to neutralize",
 use: "Covered call writers who want reduced directionality",
 },
 {
 name: "Long Straddle",
 delta: "~0 at initiation (call delta + put delta ≈ 0)",
 adjust: "Rebalance as stock moves (gamma trading)",
 use: "Volatility traders who want pure vega exposure",
 },
 {
 name: "Iron Condor",
 delta: "Near 0 — balanced put spread + call spread",
 adjust: "If breached, can buy/sell stock to re-center",
 use: "Premium sellers wanting market-neutral income",
 },
 ].map((item, i) => (
 <div key={i} className="bg-foreground/5 rounded-lg p-3 space-y-2">
 <div className="font-medium text-foreground">{item.name}</div>
 <div>
 <div className="text-xs text-muted-foreground ">Delta Equation</div>
 <div className="text-muted-foreground mt-0.5">{item.delta}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground ">Adjust By</div>
 <div className="text-muted-foreground mt-0.5">{item.adjust}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground ">Best For</div>
 <div className="text-muted-foreground mt-0.5">{item.use}</div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Vega Risk Chart */}
 <div className="bg-foreground/5 border border-border rounded-md p-4">
 <h4 className="text-sm font-medium text-foreground mb-3">Portfolio Vega Risk: P&L vs IV Change</h4>
 <svg width={vegaW} height={vegaH}>
 <line x1={vegaPad.left} y1={vegaZeroY} x2={vegaW - vegaPad.right} y2={vegaZeroY} stroke="#374151" strokeDasharray="3 3" strokeWidth={1} />
 <path d={vegaPath} fill="none" stroke={totals.vega >= 0 ? "#34d399" : "#f87171"} strokeWidth={2} />
 {[-20, -10, 0, 10, 20].map((v) => (
 <text key={v} x={vegaSX(v)} y={vegaH - 2} textAnchor="middle" fill="#6b7280" fontSize={9}>{v > 0 ? "+" : ""}{v}%</text>
 ))}
 <text x={vegaPad.left - 4} y={vegaZeroY + 4} textAnchor="end" fill="#6b7280" fontSize={9}>$0</text>
 <text x={vegaW / 2} y={vegaH - 2} textAnchor="middle" fill="#6b7280" fontSize={9} dy={10}>IV Change</text>
 </svg>
 <p className="text-xs text-muted-foreground mt-2">
 Net portfolio vega is <span className={totals.vega >= 0 ? "text-green-400" : "text-red-400"}>{totals.vega >= 0 ? "positive" : "negative"} {totals.vega.toFixed(1)}</span>.
 {totals.vega >= 0
 ? " Portfolio profits when IV rises. Consider selling vol spreads to reduce vega exposure."
 : " Portfolio profits when IV falls (IV crush). Risk if volatility spikes unexpectedly."}
 </p>
 </div>

 {/* Theta decay and Gamma scalp */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <ThetaDecayCurve />
 <GammaScalpingSim />
 </div>
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
 { id: "builder", label: "Strategy Builder" },
 { id: "library", label: "Strategy Library" },
 { id: "rolling", label: "Rolling" },
 { id: "earnings", label: "Earnings Plays" },
 { id: "hedging", label: "Portfolio Hedging" },
 { id: "greeks", label: "Greek Management" },
];

export default function OptionsStrategiesPage() {
 const [activeTab, setActiveTab] = useState("builder");

 return (
 <div className="min-h-screen bg-background text-foreground">
 <div className="max-w-7xl mx-auto px-4 py-6">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6"
 >
 <div className="flex items-center gap-3 mb-1">
 <div className="w-8 h-8 rounded-lg bg-muted/10 flex items-center justify-center">
 </div>
 <h1 className="text-xl font-medium text-foreground">Options Strategies</h1>
 </div>
 <p className="text-sm text-muted-foreground ml-11">
 Advanced simulator — build positions, explore 20 strategies, master Greeks and portfolio hedging
 </p>
 </motion.div>

 {/* Tab navigation */}
 <div className="flex gap-1 flex-wrap mb-6 bg-foreground/5 rounded-md p-1">
 {TABS.map(({ id, label }) => (
 <button
 key={id}
 onClick={() => setActiveTab(id)}
 className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
 activeTab === id
 ? "bg-primary text-foreground-foreground"
 : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
 }`}
 >
 {label}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.15 }}
 >
 {activeTab === "builder" && <StrategyBuilderTab />}
 {activeTab === "library" && <StrategyLibraryTab />}
 {activeTab === "rolling" && <RollingStrategiesTab />}
 {activeTab === "earnings" && <EarningsPlaysTab />}
 {activeTab === "hedging" && <PortfolioHedgingTab />}
 {activeTab === "greeks" && <GreekManagementTab />}
 </motion.div>
 </AnimatePresence>
 </div>
 </div>
 );
}
