"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
import {
 TrendingUp,
 TrendingDown,
 Activity,
 DollarSign,
 BarChart2,
 Layers,
 RefreshCw,
 Info,
} from "lucide-react";

// ---------------------------------------------------------------------------
// PRNG
// ---------------------------------------------------------------------------
function makePrng(seed: number) {
 let s = seed;
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

const rand = makePrng(971);

// Generate a fixed array of random numbers so the layout is stable
const R: number[] = Array.from({ length: 500 }, () => rand());
let ri = 0;
function r(): number {
 return R[ri++ % R.length];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SpotRate {
 pair: string;
 bid: number;
 ask: number;
 change: number;
 changePct: number;
}

interface OptionRow {
 strike: number;
 expiry: string;
 callDelta: number;
 callGamma: number;
 callVega: number;
 callIV: number;
 callBid: number;
 callAsk: number;
 putDelta: number;
 putGamma: number;
 putVega: number;
 putIV: number;
 putBid: number;
 putAsk: number;
}

interface RRButterfly {
 expiry: string;
 rr25: number;
 bf25: number;
 atm: number;
}

interface CarryTrade {
 pair: string;
 longCcy: string;
 shortCcy: string;
 longRate: number;
 shortRate: number;
 differential: number;
 expectedCarry: number;
 annualizedRisk: number;
 sharpe: number;
 trend: "positive" | "negative";
}

interface GKInputs {
 spot: number;
 strike: number;
 rd: number;
 rf: number;
 sigma: number;
 T: number;
 optionType: "call" | "put";
}

// ---------------------------------------------------------------------------
// Data generation (seeded)
// ---------------------------------------------------------------------------
const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF"];
const BASE_PRICES = [1.0842, 1.2634, 149.72, 0.6521, 0.9018];

const spotRates: SpotRate[] = PAIRS.map((pair, i) => {
 const base = BASE_PRICES[i];
 const spread = pair === "USD/JPY" ? 0.03 : 0.0003 + r() * 0.0002;
 const chg = (r() - 0.5) * base * 0.008;
 return {
 pair,
 bid: parseFloat((base - spread / 2).toFixed(pair === "USD/JPY" ? 3 : 5)),
 ask: parseFloat((base + spread / 2).toFixed(pair === "USD/JPY" ? 3 : 5)),
 change: parseFloat(chg.toFixed(pair === "USD/JPY" ? 3 : 5)),
 changePct: parseFloat(((chg / base) * 100).toFixed(3)),
 };
});

const EXPIRIES = ["1W", "1M", "3M", "6M", "1Y"];
const EXPIRY_T: Record<string, number> = {
 "1W": 7 / 365,
 "1M": 30 / 365,
 "3M": 91 / 365,
 "6M": 182 / 365,
 "1Y": 365 / 365,
};

// Normal CDF approximation (Abramowitz & Stegun)
function normalCDF(x: number): number {
 const a1 = 0.254829592,
 a2 = -0.284496736,
 a3 = 1.421413741,
 a4 = -1.453152027,
 a5 = 1.061405429,
 p = 0.3275911;
 const sign = x < 0 ? -1 : 1;
 const t = 1.0 / (1.0 + p * Math.abs(x));
 const y =
 1 -
 ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
 return 0.5 * (1 + sign * y);
}

function normalPDF(x: number): number {
 return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Garman-Kohlhagen pricing
function gkPrice(inputs: GKInputs): {
 price: number;
 delta: number;
 gamma: number;
 vega: number;
 d1: number;
 d2: number;
} {
 const { spot, strike, rd, rf, sigma, T, optionType } = inputs;
 if (T <= 0 || sigma <= 0) return { price: 0, delta: 0, gamma: 0, vega: 0, d1: 0, d2: 0 };
 const d1 =
 (Math.log(spot / strike) + (rd - rf + 0.5 * sigma * sigma) * T) /
 (sigma * Math.sqrt(T));
 const d2 = d1 - sigma * Math.sqrt(T);
 const erf = Math.exp(-rf * T);
 const erd = Math.exp(-rd * T);

 let price: number;
 let delta: number;
 if (optionType === "call") {
 price = spot * erf * normalCDF(d1) - strike * erd * normalCDF(d2);
 delta = erf * normalCDF(d1);
 } else {
 price = strike * erd * normalCDF(-d2) - spot * erf * normalCDF(-d1);
 delta = -erf * normalCDF(-d1);
 }
 const gamma = (erf * normalPDF(d1)) / (spot * sigma * Math.sqrt(T));
 const vega = (spot * erf * normalPDF(d1) * Math.sqrt(T)) / 100;
 return { price, delta, gamma, vega, d1, d2 };
}

// Build options chain for EUR/USD
const spot = spotRates[0].ask; // EUR/USD
const RD = 0.0525;
const RF = 0.04;
const BASE_IV = 0.072;

function buildChain(expiry: string): OptionRow[] {
 const T = EXPIRY_T[expiry];
 const atmStrike = Math.round(spot * 10000) / 10000;
 const strikeDelta = 0.005;
 const strikes = [-3, -2, -1, 0, 1, 2, 3].map(
 (i) => Math.round((atmStrike + i * strikeDelta) * 10000) / 10000
 );
 return strikes.map((strike) => {
 const moneyness = Math.abs(Math.log(spot / strike));
 const ivSkew = -0.002 * ((strike - atmStrike) / strikeDelta);
 const iv = Math.max(0.04, BASE_IV + ivSkew * 0.5 + moneyness * 0.05 + r() * 0.005);
 const callGK = gkPrice({ spot, strike, rd: RD, rf: RF, sigma: iv, T, optionType: "call" });
 const putGK = gkPrice({ spot, strike, rd: RD, rf: RF, sigma: iv, T, optionType: "put" });
 const spread = 0.0002 + r() * 0.0001;
 return {
 strike,
 expiry,
 callDelta: parseFloat(callGK.delta.toFixed(4)),
 callGamma: parseFloat(callGK.gamma.toFixed(4)),
 callVega: parseFloat(callGK.vega.toFixed(4)),
 callIV: parseFloat((iv * 100).toFixed(2)),
 callBid: parseFloat(Math.max(0, callGK.price - spread).toFixed(5)),
 callAsk: parseFloat((callGK.price + spread).toFixed(5)),
 putDelta: parseFloat(putGK.delta.toFixed(4)),
 putGamma: parseFloat(putGK.gamma.toFixed(4)),
 putVega: parseFloat(putGK.vega.toFixed(4)),
 putIV: parseFloat((iv * 100).toFixed(2)),
 putBid: parseFloat(Math.max(0, putGK.price - spread).toFixed(5)),
 putAsk: parseFloat((putGK.price + spread).toFixed(5)),
 };
 });
}

const chainsByExpiry: Record<string, OptionRow[]> = Object.fromEntries(
 EXPIRIES.map((e) => [e, buildChain(e)])
);

// RR & Butterfly table
const rrButterfly: RRButterfly[] = EXPIRIES.map((expiry) => {
 const atm = BASE_IV + r() * 0.005 - 0.0025;
 const rr25 = (r() - 0.5) * 0.8;
 const bf25 = 0.05 + r() * 0.15;
 return {
 expiry,
 atm: parseFloat((atm * 100).toFixed(3)),
 rr25: parseFloat(rr25.toFixed(3)),
 bf25: parseFloat(bf25.toFixed(3)),
 };
});

// Volatility surface data (strikes × tenors)
const SURFACE_TENORS = ["1W", "1M", "3M", "6M", "1Y"];
const SURFACE_DELTAS = ["10D Call", "25D Call", "ATM", "25D Put", "10D Put"];
const volSurface: number[][] = SURFACE_TENORS.map((tenor, ti) => {
 const T = EXPIRY_T[tenor];
 return SURFACE_DELTAS.map((delta, di) => {
 const skew = (di - 2) * (-0.005); // skew richer wings
 const term = Math.sqrt(T) * 0.01;
 const base = BASE_IV + skew + term + r() * 0.005;
 return parseFloat((base * 100).toFixed(2));
 });
});

// Carry trade data
const CARRY_PAIRS: Array<{ pair: string; long: string; short: string; lr: number; sr: number }> =
 [
 { pair: "AUD/JPY", long: "AUD", short: "JPY", lr: 4.35, sr: -0.1 },
 { pair: "NZD/JPY", long: "NZD", short: "JPY", lr: 5.5, sr: -0.1 },
 { pair: "USD/JPY", long: "USD", short: "JPY", lr: 5.25, sr: -0.1 },
 { pair: "GBP/CHF", long: "GBP", short: "CHF", lr: 5.0, sr: 1.75 },
 { pair: "EUR/CHF", long: "EUR", short: "CHF", lr: 4.0, sr: 1.75 },
 ];

const carryTrades: CarryTrade[] = CARRY_PAIRS.map((cp) => {
 const diff = cp.lr - cp.sr;
 const carry = diff * (0.9 + r() * 0.2);
 const risk = 8 + r() * 12;
 const sharpe = parseFloat((carry / risk).toFixed(2));
 const trend: "positive" | "negative" = diff > 2 ? "positive" : "negative";
 return {
 pair: cp.pair,
 longCcy: cp.long,
 shortCcy: cp.short,
 longRate: cp.lr,
 shortRate: cp.sr,
 differential: parseFloat(diff.toFixed(2)),
 expectedCarry: parseFloat(carry.toFixed(2)),
 annualizedRisk: parseFloat(risk.toFixed(1)),
 sharpe,
 trend,
 };
});

// ---------------------------------------------------------------------------
// Helper: color for vol surface cell
// ---------------------------------------------------------------------------
function volColor(vol: number, minV: number, maxV: number): string {
 const t = Math.min(1, Math.max(0, (vol - minV) / (maxV - minV)));
 // low = blue (#3b82f6), mid = green (#22c55e), high = red (#ef4444)
 if (t < 0.5) {
 const u = t * 2;
 const r2 = Math.round(59 + (34 - 59) * u);
 const g = Math.round(130 + (197 - 130) * u);
 const b = Math.round(246 + (94 - 246) * u);
 return `rgb(${r2},${g},${b})`;
 } else {
 const u = (t - 0.5) * 2;
 const r2 = Math.round(34 + (239 - 34) * u);
 const g = Math.round(197 + (68 - 197) * u);
 const b = Math.round(94 + (68 - 94) * u);
 return `rgb(${r2},${g},${b})`;
 }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SpotRateCard({ rate }: { rate: SpotRate }) {
 const up = rate.change >= 0;
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 >
 <Card className="bg-card border-border hover:border-border transition-colors">
 <CardContent className="pt-4 pb-3 px-4">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-semibold text-muted-foreground ">
 {rate.pair}
 </span>
 <Badge
 variant="outline"
 className={
 up
 ? "border-emerald-500/40 text-emerald-400 text-xs"
 : "border-red-500/40 text-red-400 text-xs"
 }
 >
 {up ? "+" : ""}
 {rate.changePct.toFixed(3)}%
 </Badge>
 </div>
 <div className="flex items-end gap-3">
 <span className="text-2xl font-mono font-semibold text-foreground">
 {rate.bid}
 </span>
 <span className="text-sm font-mono text-muted-foreground mb-0.5">
 {rate.ask}
 </span>
 </div>
 <div className="flex items-center gap-1 mt-1">
 {up ? (
 <TrendingUp size={12} className="text-emerald-400" />
 ) : (
 <TrendingDown size={12} className="text-red-400" />
 )}
 <span
 className={`text-xs font-mono ${up ? "text-emerald-400" : "text-red-400"}`}
 >
 {up ? "+" : ""}
 {rate.change}
 </span>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}

function OptionsChainTable({ rows, expiry }: { rows: OptionRow[]; expiry: string }) {
 const atmStrike = Math.round(spot * 10000) / 10000;
 return (
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground font-mono border-separate border-spacing-0">
 <thead>
 <tr className="text-muted-foreground">
 <th colSpan={5} className="text-emerald-400 py-2 text-left pl-2">
 — CALLS ({expiry}) —
 </th>
 <th className="text-muted-foreground font-semibold text-center py-2 px-2 border-x border-border">
 STRIKE
 </th>
 <th colSpan={5} className="text-red-400 py-2 text-right pr-2">
 — PUTS ({expiry}) —
 </th>
 </tr>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left py-1 pl-2">Bid</th>
 <th className="text-left py-1">Ask</th>
 <th className="text-left py-1">IV%</th>
 <th className="text-left py-1">Δ</th>
 <th className="text-left py-1">Γ</th>
 <th className="text-center py-1 px-2 border-x border-border">—</th>
 <th className="text-right py-1">Γ</th>
 <th className="text-right py-1">Δ</th>
 <th className="text-right py-1">IV%</th>
 <th className="text-right py-1">Bid</th>
 <th className="text-right py-1 pr-2">Ask</th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row) => {
 const isAtm = Math.abs(row.strike - atmStrike) < 0.0025;
 return (
 <tr
 key={row.strike}
 className={`border-b border-card transition-colors ${
 isAtm
 ? "bg-muted/10/40"
 : "hover:bg-muted/30"
 }`}
 >
 <td className="py-1.5 pl-2 text-emerald-300">{row.callBid}</td>
 <td className="py-1.5 text-emerald-400">{row.callAsk}</td>
 <td className="py-1.5 text-muted-foreground">{row.callIV}</td>
 <td className="py-1.5 text-sky-400">{row.callDelta.toFixed(3)}</td>
 <td className="py-1.5 text-foreground">{row.callGamma.toFixed(4)}</td>
 <td
 className={`py-1.5 text-center font-medium px-2 border-x border-border ${
 isAtm ? "text-amber-400" : "text-foreground"
 }`}
 >
 {row.strike.toFixed(4)}
 {isAtm && (
 <span className="ml-1 text-[11px] text-amber-400">ATM</span>
 )}
 </td>
 <td className="py-1.5 text-right text-foreground">{row.putGamma.toFixed(4)}</td>
 <td className="py-1.5 text-right text-sky-400">{row.putDelta.toFixed(3)}</td>
 <td className="py-1.5 text-right text-muted-foreground">{row.putIV}</td>
 <td className="py-1.5 text-right text-red-300">{row.putBid}</td>
 <td className="py-1.5 pr-2 text-right text-red-400">{row.putAsk}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 );
}

function RRButterflyTable() {
 return (
 <div className="overflow-x-auto">
 <table className="w-full text-sm font-mono border-separate border-spacing-0">
 <thead>
 <tr className="text-muted-foreground border-b border-border text-xs">
 <th className="text-left py-2 pl-3">Expiry</th>
 <th className="text-right py-2">ATM Vol (%)</th>
 <th className="text-right py-2">25D RR (%)</th>
 <th className="text-right py-2 pr-3">25D Fly (%)</th>
 </tr>
 </thead>
 <tbody>
 {rrButterfly.map((row) => (
 <tr key={row.expiry} className="border-b border-card hover:bg-muted/30 transition-colors">
 <td className="py-2 pl-3 text-foreground font-semibold">{row.expiry}</td>
 <td className="py-2 text-right text-amber-400">{row.atm.toFixed(3)}</td>
 <td
 className={`py-2 text-right font-semibold ${
 row.rr25 >= 0 ? "text-emerald-400" : "text-red-400"
 }`}
 >
 {row.rr25 >= 0 ? "+" : ""}{row.rr25.toFixed(3)}
 </td>
 <td className="py-2 pr-3 text-right text-foreground">{row.bf25.toFixed(3)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 <div className="mt-3 px-3 py-2 bg-card border border-border rounded text-xs text-muted-foreground leading-relaxed">
 <span className="text-amber-400 font-medium">25D RR</span> = IV(25D Call) − IV(25D Put). Positive → call skew (EUR/USD call demand).{""}
 <span className="text-foreground font-medium">25D Fly</span> = 0.5 × [IV(25D Call) + IV(25D Put)] − IV(ATM). Wing premium above ATM.
 </div>
 </div>
 );
}

function VolSurfaceHeatmap() {
 const allVols = volSurface.flat();
 const minV = Math.min(...allVols);
 const maxV = Math.max(...allVols);

 const cellW = 90;
 const cellH = 46;
 const labelW = 80;
 const labelH = 30;
 const svgW = labelW + SURFACE_TENORS.length * cellW + 8;
 const svgH = labelH + SURFACE_DELTAS.length * cellH + 8;

 return (
 <div className="overflow-x-auto">
 <svg
 width={svgW}
 height={svgH}
 className="font-mono"
 role="img"
 aria-label="Volatility Surface Heatmap"
 >
 {/* Tenor headers */}
 {SURFACE_TENORS.map((tenor, ti) => (
 <text
 key={tenor}
 x={labelW + ti * cellW + cellW / 2}
 y={18}
 fill="#94a3b8"
 fontSize={11}
 textAnchor="middle"
 fontFamily="monospace"
 >
 {tenor}
 </text>
 ))}
 {/* Delta row labels */}
 {SURFACE_DELTAS.map((delta, di) => (
 <text
 key={delta}
 x={labelW - 6}
 y={labelH + di * cellH + cellH / 2 + 4}
 fill="#94a3b8"
 fontSize={10}
 textAnchor="end"
 fontFamily="monospace"
 >
 {delta}
 </text>
 ))}
 {/* Cells */}
 {SURFACE_TENORS.map((tenor, ti) =>
 SURFACE_DELTAS.map((delta, di) => {
 const vol = volSurface[ti][di];
 const color = volColor(vol, minV, maxV);
 const cx = labelW + ti * cellW;
 const cy = labelH + di * cellH;
 return (
 <g key={`${tenor}-${delta}`}>
 <rect
 x={cx + 1}
 y={cy + 1}
 width={cellW - 2}
 height={cellH - 2}
 rx={4}
 fill={color}
 opacity={0.85}
 />
 <text
 x={cx + cellW / 2}
 y={cy + cellH / 2 - 5}
 fill="rgba(0,0,0,0.85)"
 fontSize={13}
 fontWeight="bold"
 textAnchor="middle"
 fontFamily="monospace"
 >
 {vol.toFixed(2)}
 </text>
 <text
 x={cx + cellW / 2}
 y={cy + cellH / 2 + 10}
 fill="rgba(0,0,0,0.65)"
 fontSize={9}
 textAnchor="middle"
 fontFamily="monospace"
 >
 {tenor}/{delta.split("")[0]}
 </text>
 </g>
 );
 })
 )}
 {/* Color legend bar */}
 <defs>
 <linearGradient id="volLegend" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0%" stopColor="#3b82f6" />
 <stop offset="50%" stopColor="#22c55e" />
 <stop offset="100%" stopColor="#ef4444" />
 </linearGradient>
 </defs>
 <rect
 x={labelW}
 y={svgH - 14}
 width={SURFACE_TENORS.length * cellW}
 height={8}
 rx={3}
 fill="url(#volLegend)"
 opacity={0.7}
 />
 <text x={labelW} y={svgH - 1} fill="#94a3b8" fontSize={9} fontFamily="monospace">
 {minV.toFixed(2)}%
 </text>
 <text
 x={labelW + SURFACE_TENORS.length * cellW}
 y={svgH - 1}
 fill="#94a3b8"
 fontSize={9}
 textAnchor="end"
 fontFamily="monospace"
 >
 {maxV.toFixed(2)}%
 </text>
 </svg>
 </div>
 );
}

function GKCalculator() {
 const [inputs, setInputs] = useState<GKInputs>({
 spot: parseFloat(spot.toFixed(5)),
 strike: parseFloat(spot.toFixed(5)),
 rd: RD * 100,
 rf: RF * 100,
 sigma: BASE_IV * 100,
 T: 90,
 optionType: "call",
 });

 const result = useMemo(() => {
 return gkPrice({
 spot: inputs.spot,
 strike: inputs.strike,
 rd: inputs.rd / 100,
 rf: inputs.rf / 100,
 sigma: inputs.sigma / 100,
 T: inputs.T / 365,
 optionType: inputs.optionType,
 });
 }, [inputs]);

 function setField(field: keyof GKInputs, val: string | number | "call" | "put") {
 setInputs((prev) => ({ ...prev, [field]: val }));
 }

 const inputCls =
 "w-full bg-card border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:border-sky-500";
 const labelCls = "text-xs text-muted-foreground mb-1 block";

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {/* Inputs */}
 <div className="space-y-3">
 <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
 <DollarSign size={14} className="text-sky-400" /> Inputs
 </h3>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className={labelCls}>Spot (S)</label>
 <input
 type="number"
 step="0.0001"
 value={inputs.spot}
 onChange={(e) => setField("spot", parseFloat(e.target.value) || 0)}
 className={inputCls}
 />
 </div>
 <div>
 <label className={labelCls}>Strike (K)</label>
 <input
 type="number"
 step="0.0001"
 value={inputs.strike}
 onChange={(e) => setField("strike", parseFloat(e.target.value) || 0)}
 className={inputCls}
 />
 </div>
 <div>
 <label className={labelCls}>Domestic Rate rd (%)</label>
 <input
 type="number"
 step="0.01"
 value={inputs.rd}
 onChange={(e) => setField("rd", parseFloat(e.target.value) || 0)}
 className={inputCls}
 />
 </div>
 <div>
 <label className={labelCls}>Foreign Rate rf (%)</label>
 <input
 type="number"
 step="0.01"
 value={inputs.rf}
 onChange={(e) => setField("rf", parseFloat(e.target.value) || 0)}
 className={inputCls}
 />
 </div>
 <div>
 <label className={labelCls}>IV σ (%)</label>
 <input
 type="number"
 step="0.1"
 value={inputs.sigma}
 onChange={(e) => setField("sigma", parseFloat(e.target.value) || 0)}
 className={inputCls}
 />
 </div>
 <div>
 <label className={labelCls}>Days to Expiry</label>
 <input
 type="number"
 step="1"
 value={inputs.T}
 onChange={(e) => setField("T", parseInt(e.target.value) || 1)}
 className={inputCls}
 />
 </div>
 </div>
 <div className="flex gap-2">
 <Button
 size="sm"
 variant={inputs.optionType === "call" ? "default" : "outline"}
 onClick={() => setField("optionType", "call")}
 className={inputs.optionType === "call" ? "bg-emerald-600 hover:bg-emerald-700 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}
 >
 Call
 </Button>
 <Button
 size="sm"
 variant={inputs.optionType === "put" ? "default" : "outline"}
 onClick={() => setField("optionType", "put")}
 className={inputs.optionType === "put" ? "bg-red-600 hover:bg-red-700 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}
 >
 Put
 </Button>
 </div>
 </div>

 {/* Results */}
 <div className="space-y-3">
 <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
 <Activity size={14} className="text-muted-foreground/50" /> Results
 </h3>
 <div className="bg-card border border-border rounded-lg p-4 space-y-2">
 <div className="flex justify-between items-center border-b border-border pb-2 mb-3">
 <span className="text-muted-foreground text-sm">Option Price</span>
 <span className="text-2xl font-mono font-semibold text-foreground">
 {result.price.toFixed(5)}
 </span>
 </div>
 {[
 { label: "Delta (Δ)", val: result.delta.toFixed(5), color: "text-sky-400" },
 { label: "Gamma (Γ)", val: result.gamma.toFixed(6), color: "text-foreground" },
 { label: "Vega (ν)", val: result.vega.toFixed(6), color: "text-amber-400" },
 { label: "d₁", val: result.d1.toFixed(5), color: "text-muted-foreground" },
 { label: "d₂", val: result.d2.toFixed(5), color: "text-muted-foreground" },
 ].map(({ label, val, color }) => (
 <div key={label} className="flex justify-between text-sm">
 <span className="text-muted-foreground">{label}</span>
 <span className={`font-mono font-medium ${color}`}>{val}</span>
 </div>
 ))}
 </div>
 {/* Formula display */}
 <div className="bg-background border border-border rounded-lg p-3">
 <p className="text-xs text-muted-foreground leading-5 font-mono">
 <span className="text-muted-foreground font-medium">Garman-Kohlhagen (1983):</span>
 <br />
 C = S·e<sup>-rf·T</sup>·N(d₁) − K·e<sup>-rd·T</sup>·N(d₂)
 <br />
 d₁ = [ln(S/K) + (rd−rf+σ²/2)T] / σ√T
 <br />
 d₂ = d₁ − σ√T
 <br />
 <span className="text-muted-foreground">Extension of Black-Scholes for FX, with domestic rate rd and continuous foreign rate rf</span>
 </p>
 </div>
 </div>
 </div>
 );
}

function CarryTradeTable() {
 const sorted = [...carryTrades].sort((a, b) => b.differential - a.differential);
 return (
 <div className="space-y-4">
 <div className="overflow-x-auto">
 <table className="w-full text-sm border-separate border-spacing-0">
 <thead>
 <tr className="text-muted-foreground text-xs border-b border-border">
 <th className="text-left py-2 pl-3">Pair</th>
 <th className="text-left py-2">Long CCY</th>
 <th className="text-right py-2">Long Rate</th>
 <th className="text-right py-2">Short Rate</th>
 <th className="text-right py-2">Differential</th>
 <th className="text-right py-2">Est. Carry</th>
 <th className="text-right py-2">Ann. Risk</th>
 <th className="text-right py-2 pr-3">Sharpe</th>
 </tr>
 </thead>
 <tbody>
 {sorted.map((ct) => (
 <tr
 key={ct.pair}
 className="border-b border-card hover:bg-muted/30 transition-colors"
 >
 <td className="py-2 pl-3 font-medium text-foreground">{ct.pair}</td>
 <td className="py-2">
 <Badge
 variant="outline"
 className="border-emerald-500/30 text-emerald-400 text-xs"
 >
 {ct.longCcy}
 </Badge>
 </td>
 <td className="py-2 text-right font-mono text-emerald-400">
 {ct.longRate.toFixed(2)}%
 </td>
 <td className="py-2 text-right font-mono text-red-400">
 {ct.shortRate.toFixed(2)}%
 </td>
 <td className="py-2 text-right font-mono font-medium text-amber-400">
 +{ct.differential.toFixed(2)}%
 </td>
 <td className="py-2 text-right font-mono text-sky-400">
 {ct.expectedCarry.toFixed(2)}%
 </td>
 <td className="py-2 text-right font-mono text-muted-foreground">
 {ct.annualizedRisk.toFixed(1)}%
 </td>
 <td className="py-2 pr-3 text-right font-mono">
 <span
 className={
 ct.sharpe >= 0.4
 ? "text-emerald-400 font-medium"
 : ct.sharpe >= 0.2
 ? "text-amber-400"
 : "text-red-400"
 }
 >
 {ct.sharpe.toFixed(2)}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Carry Bar Chart (SVG) */}
 <div className="mt-2">
 <p className="text-xs text-muted-foreground mb-2 pl-1">Interest Rate Differential by Pair</p>
 <svg width="100%" viewBox={`0 0 500 ${sorted.length * 36 + 16}`} className="font-mono">
 {sorted.map((ct, i) => {
 const maxDiff = Math.max(...sorted.map((c) => c.differential));
 const barW = (ct.differential / maxDiff) * 300;
 const y = i * 36 + 8;
 return (
 <g key={ct.pair}>
 <text x={0} y={y + 18} fill="#94a3b8" fontSize={11} fontFamily="monospace">
 {ct.pair}
 </text>
 <rect x={80} y={y + 6} width={barW} height={16} rx={3} fill="#f59e0b" opacity={0.7} />
 <text x={80 + barW + 6} y={y + 18} fill="#fbbf24" fontSize={11} fontFamily="monospace">
 +{ct.differential.toFixed(2)}%
 </text>
 </g>
 );
 })}
 </svg>
 </div>

 <div className="bg-card border border-amber-500/20 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
 <span className="text-amber-400 font-medium flex items-center gap-1 mb-1">
 <Info size={12} /> Carry Trade Risk
 </span>
 Carry trades profit from interest rate differentials but are exposed to sudden currency reversals (unwinding risk). High-carry pairs often exhibit crash risk during risk-off episodes. Positive Sharpe does not guarantee future performance.
 </div>
 </div>
 );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function FXOptionsPage() {
 const [selectedExpiry, setSelectedExpiry] = useState<string>("1M");
 const chain = chainsByExpiry[selectedExpiry] ?? [];

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">

 {/* Page hero */}
 <div className="mb-6">
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">FX Options</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">CALLS · PUTS · VOLATILITY SURFACE</p>
 </div>

 {/* Spot rates grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
 {spotRates.slice(0, 4).map((rate) => (
 <div key={rate.pair} className="rounded-lg border border-border bg-card p-5">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{rate.pair}</div>
 <div className="font-mono tabular-nums text-lg font-semibold text-foreground">{rate.bid}</div>
 <div className={`text-xs font-mono mt-0.5 ${rate.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
 {rate.change >= 0 ? "+" : ""}{rate.changePct.toFixed(3)}%
 </div>
 </div>
 ))}
 </div>

 <div className="border-t border-border my-6" />

 {/* Main Tabs */}
 <Tabs defaultValue="chain" className="w-full flex-1">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 <TabsTrigger
 value="chain"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 Options Chain
 </TabsTrigger>
 <TabsTrigger
 value="rr"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 RR &amp; Butterfly
 </TabsTrigger>
 <TabsTrigger
 value="surface"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 Vol Surface
 </TabsTrigger>
 <TabsTrigger
 value="gk"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 G-K Pricer
 </TabsTrigger>
 <TabsTrigger
 value="carry"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 Carry Trades
 </TabsTrigger>
 </TabsList>

 {/* Options Chain */}
 <TabsContent value="chain" className="data-[state=inactive]:hidden">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Options Chain</h2>
 <div className="rounded-lg border border-border bg-card p-5 mb-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
 <div>
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">EUR/USD Vanilla Options</div>
 <span className="text-sm font-mono tabular-nums text-foreground">Spot: {spot.toFixed(5)}</span>
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="text-xs text-muted-foreground mr-1">Expiry:</span>
 {EXPIRIES.map((e) => (
 <Button
 key={e}
 size="sm"
 variant={selectedExpiry === e ? "default" : "outline"}
 onClick={() => setSelectedExpiry(e)}
 className={
 selectedExpiry === e
 ? "bg-sky-600 hover:bg-sky-700 text-foreground h-6 text-xs px-2"
 : "border-border text-muted-foreground hover:bg-muted h-6 text-xs px-2"
 }
 >
 {e}
 </Button>
 ))}
 </div>
 </div>
 <div className="flex gap-4 mb-3 text-xs text-muted-foreground flex-wrap">
 {[
 { label: "Δ Delta", color: "text-sky-400" },
 { label: "Γ Gamma", color: "text-foreground" },
 { label: "IV Implied Vol", color: "text-muted-foreground" },
 ].map(({ label, color }) => (
 <span key={label} className={`${color} flex items-center gap-1`}>
 <span className="inline-block w-2 h-2 rounded-full bg-current" />
 {label}
 </span>
 ))}
 </div>
 <OptionsChainTable rows={chain} expiry={selectedExpiry} />
 </div>
 </TabsContent>

 {/* RR & Butterfly */}
 <TabsContent value="rr" className="data-[state=inactive]:hidden">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Risk Reversal &amp; Butterfly</h2>
 <div className="rounded-lg border border-border bg-card p-5 mb-6">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">EUR/USD STRUCTURES</div>
 <RRButterflyTable />
 </div>
 </TabsContent>

 {/* Vol Surface */}
 <TabsContent value="surface" className="data-[state=inactive]:hidden">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Implied Volatility Surface</h2>
 <div className="rounded-lg border border-border bg-card p-5 mb-6">
 <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">EUR/USD — DELTA VS TENOR</div>
 <VolSurfaceHeatmap />
 <div className="border-t border-border my-6" />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <p className="text-foreground font-medium mb-2">Reading the Surface</p>
 <p>Each cell shows the implied volatility for a given delta strike and tenor. Higher vol (red) indicates more expensive options; lower vol (blue) signals cheaper options relative to the surface.</p>
 </div>
 <div className="rounded-lg border border-border bg-muted/30 p-5">
 <p className="text-foreground font-medium mb-2">Skew &amp; Term Structure</p>
 <p>Negative skew = puts more expensive than calls (left column higher). Positive term structure = longer dated options carry more vol — normal in FX due to event uncertainty compounding over time.</p>
 </div>
 </div>
 </div>
 </TabsContent>

 {/* G-K Pricer */}
 <TabsContent value="gk" className="data-[state=inactive]:hidden">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Garman-Kohlhagen Pricer</h2>
 <div className="rounded-lg border border-border bg-card p-5 mb-6">
 <GKCalculator />
 </div>
 </TabsContent>

 {/* Carry Trades */}
 <TabsContent value="carry" className="data-[state=inactive]:hidden">
 <h2 className="text-xl font-serif tracking-tight text-foreground mb-4">Carry Trade Monitor</h2>
 <div className="rounded-lg border border-border bg-card p-5 mb-6">
 <CarryTradeTable />
 </div>
 </TabsContent>
 </Tabs>

 <p className="text-[11px] text-muted-foreground text-center pt-4 pb-2">
 All data is synthetically generated for educational purposes. Prices do not represent real market quotes.
 </p>

 </div>
 </div>
 );
}
