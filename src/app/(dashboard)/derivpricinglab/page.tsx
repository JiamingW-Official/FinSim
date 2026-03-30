"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
 FlaskConical,
 GitBranch,
 Shuffle,
 Sparkles,
 TrendingUp,
 TrendingDown,
 Info,
 Activity,
 Target,
 BarChart3,
 Zap,
 DollarSign,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------
let s = 834;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Box-Muller transform
const randNormal = () => {
 const u1 = rand();
 const u2 = rand();
 return Math.sqrt(-2 * Math.log(u1 + 1e-12)) * Math.cos(2 * Math.PI * u2);
};

// ---------------------------------------------------------------------------
// Black-Scholes Math
// ---------------------------------------------------------------------------

/** Abramowitz & Stegun polynomial approximation for N(x) */
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
 callPrice: number;
 putPrice: number;
 d1: number;
 d2: number;
 callDelta: number;
 putDelta: number;
 gamma: number;
 vega: number;
 callTheta: number;
 putTheta: number;
 callRho: number;
 putRho: number;
}

function blackScholes(S: number, K: number, T: number, r: number, sigma: number): BSResult {
 if (T <= 0 || sigma <= 0) {
 const callIntrinsic = Math.max(0, S - K);
 const putIntrinsic = Math.max(0, K - S);
 return {
 callPrice: callIntrinsic, putPrice: putIntrinsic,
 d1: 0, d2: 0,
 callDelta: S > K ? 1 : 0, putDelta: S < K ? -1 : 0,
 gamma: 0, vega: 0, callTheta: 0, putTheta: 0,
 callRho: 0, putRho: 0,
 };
 }

 const sqrtT = Math.sqrt(T);
 const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
 const d2 = d1 - sigma * sqrtT;

 const Nd1 = normalCDF(d1);
 const Nd2 = normalCDF(d2);
 const Nnd1 = normalCDF(-d1);
 const Nnd2 = normalCDF(-d2);
 const nd1 = normalPDF(d1);
 const discK = K * Math.exp(-r * T);

 const callPrice = S * Nd1 - discK * Nd2;
 const putPrice = discK * Nnd2 - S * Nnd1;
 const callDelta = Nd1;
 const putDelta = Nd1 - 1;
 const gamma = nd1 / (S * sigma * sqrtT);
 const vega = S * nd1 * sqrtT / 100;
 const callTheta = (-S * nd1 * sigma / (2 * sqrtT) - r * discK * Nd2) / 365;
 const putTheta = (-S * nd1 * sigma / (2 * sqrtT) + r * discK * Nnd2) / 365;
 const callRho = K * T * Math.exp(-r * T) * Nd2 / 100;
 const putRho = -K * T * Math.exp(-r * T) * Nnd2 / 100;

 return { callPrice, putPrice, d1, d2, callDelta, putDelta, gamma, vega, callTheta, putTheta, callRho, putRho };
}

// ---------------------------------------------------------------------------
// Binomial Tree
// ---------------------------------------------------------------------------

interface BinomialNode {
 stockPrice: number;
 callValue: number;
 putValue: number;
 row: number;
 col: number;
}

function buildBinomialTree(S: number, K: number, T: number, r: number, sigma: number, steps: number) {
 const dt = T / steps;
 const u = Math.exp(sigma * Math.sqrt(dt));
 const d = 1 / u;
 const p = (Math.exp(r * dt) - d) / (u - d); // risk-neutral probability
 const disc = Math.exp(-r * dt);

 // Build stock price tree
 const stockTree: number[][] = [];
 for (let i = 0; i <= steps; i++) {
 stockTree[i] = [];
 for (let j = 0; j <= i; j++) {
 stockTree[i][j] = S * Math.pow(u, j) * Math.pow(d, i - j);
 }
 }

 // Terminal payoffs
 const callTree: number[][] = [];
 const putTree: number[][] = [];
 for (let i = 0; i <= steps; i++) {
 callTree[i] = new Array(i + 1).fill(0);
 putTree[i] = new Array(i + 1).fill(0);
 }
 for (let j = 0; j <= steps; j++) {
 callTree[steps][j] = Math.max(0, stockTree[steps][j] - K);
 putTree[steps][j] = Math.max(0, K - stockTree[steps][j]);
 }

 // Backward induction
 for (let i = steps - 1; i >= 0; i--) {
 for (let j = 0; j <= i; j++) {
 callTree[i][j] = disc * (p * callTree[i + 1][j + 1] + (1 - p) * callTree[i + 1][j]);
 putTree[i][j] = disc * (p * putTree[i + 1][j + 1] + (1 - p) * putTree[i + 1][j]);
 }
 }

 const nodes: BinomialNode[] = [];
 for (let i = 0; i <= steps; i++) {
 for (let j = 0; j <= i; j++) {
 nodes.push({ stockPrice: stockTree[i][j], callValue: callTree[i][j], putValue: putTree[i][j], row: i, col: j });
 }
 }

 return { nodes, riskNeutralP: p, u, d, callPrice: callTree[0][0], putPrice: putTree[0][0] };
}

// ---------------------------------------------------------------------------
// Monte Carlo Paths
// ---------------------------------------------------------------------------

interface MCResult {
 paths: number[][];
 callPrice: number;
 putPrice: number;
 callCI: [number, number];
 putCI: [number, number];
 terminalPrices: number[];
 convergence: { n: number; callEst: number }[];
}

function runMonteCarlo(S: number, K: number, T: number, r: number, sigma: number, numPaths: number, displayPaths: number): MCResult {
 // Reset seed for reproducibility
 s = 834;
 const steps = 50;
 const dt = T / steps;
 const drift = (r - 0.5 * sigma * sigma) * dt;
 const vol = sigma * Math.sqrt(dt);

 const allTerminal: number[] = [];
 const paths: number[][] = [];

 for (let p = 0; p < numPaths; p++) {
 let price = S;
 const path: number[] = [S];
 for (let t = 0; t < steps; t++) {
 price *= Math.exp(drift + vol * randNormal());
 if (p < displayPaths) path.push(price);
 }
 if (p < displayPaths) paths.push(path);
 else {
 // still need final price
 let fp = S;
 for (let t = 0; t < steps; t++) fp *= Math.exp(drift + vol * randNormal());
 allTerminal.push(fp);
 continue;
 }
 allTerminal.push(price);
 }

 const disc = Math.exp(-r * T);
 const callPayoffs = allTerminal.map(p => Math.max(0, p - K));
 const putPayoffs = allTerminal.map(p => Math.max(0, K - p));
 const callMean = callPayoffs.reduce((a, b) => a + b, 0) / numPaths * disc;
 const putMean = putPayoffs.reduce((a, b) => a + b, 0) / numPaths * disc;

 const callVar = callPayoffs.reduce((acc, v) => acc + Math.pow(v * disc - callMean, 2), 0) / numPaths;
 const putVar = putPayoffs.reduce((acc, v) => acc + Math.pow(v * disc - putMean, 2), 0) / numPaths;
 const zSE = 1.96;
 const callSE = zSE * Math.sqrt(callVar / numPaths);
 const putSE = zSE * Math.sqrt(putVar / numPaths);

 // Convergence: sample at intervals
 const convergence: { n: number; callEst: number }[] = [];
 const checkpoints = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
 for (const n of checkpoints) {
 if (n <= numPaths) {
 const est = callPayoffs.slice(0, n).reduce((a, b) => a + b, 0) / n * disc;
 convergence.push({ n, callEst: est });
 }
 }

 return {
 paths,
 callPrice: callMean,
 putPrice: putMean,
 callCI: [callMean - callSE, callMean + callSE],
 putCI: [putMean - putSE, putMean + putSE],
 terminalPrices: allTerminal,
 convergence,
 };
}

// ---------------------------------------------------------------------------
// Exotic Pricing (simplified Monte Carlo)
// ---------------------------------------------------------------------------

interface ExoticResult {
 type: string;
 price: number;
 vanillaPrice: number;
 keyMetric: string;
 metricLabel: string;
 description: string;
 useCase: string;
}

function priceExotics(S: number, K: number, T: number, r: number, sigma: number): ExoticResult[] {
 s = 834;
 const steps = 50;
 const dt = T / steps;
 const drift = (r - 0.5 * sigma * sigma) * dt;
 const vol = sigma * Math.sqrt(dt);
 const disc = Math.exp(-r * T);
 const N = 5000;

 let asianSum = 0, barrierSum = 0, lookbackSum = 0, digitalSum = 0;
 const barrierLevel = S * 1.15;

 const bs = blackScholes(S, K, T, r, sigma);
 const vanillaCall = bs.callPrice;

 for (let p = 0; p < N; p++) {
 let price = S;
 let sumPrices = S;
 let maxPrice = S;
 let knockedIn = false;

 for (let t = 0; t < steps; t++) {
 price *= Math.exp(drift + vol * randNormal());
 sumPrices += price;
 if (price > maxPrice) maxPrice = price;
 if (price >= barrierLevel) knockedIn = true;
 }

 const avgPrice = sumPrices / (steps + 1);

 // Asian average-price call
 asianSum += Math.max(0, avgPrice - K);
 // Barrier knock-in call (becomes vanilla when price hits barrier)
 barrierSum += knockedIn ? Math.max(0, price - K) : 0;
 // Lookback call (payoff = max stock price - K)
 lookbackSum += Math.max(0, maxPrice - K);
 // Digital (cash-or-nothing): pays $1 if S_T > K
 digitalSum += price > K ? 1 : 0;
 }

 return [
 {
 type: "Asian (Average Price)",
 price: asianSum / N * disc,
 vanillaPrice: vanillaCall,
 keyMetric: ((asianSum / N * disc) / vanillaCall * 100 - 100).toFixed(1),
 metricLabel: "vs. Vanilla %",
 description: "Payoff based on average price over the option's life, reducing path-dependency risk.",
 useCase: "Commodities & FX hedging — reduces manipulation risk at expiry.",
 },
 {
 type: "Barrier (Knock-In)",
 price: barrierSum / N * disc,
 vanillaPrice: vanillaCall,
 keyMetric: (barrierLevel).toFixed(2),
 metricLabel: `Barrier @ $${barrierLevel.toFixed(0)}`,
 description: `Up-and-in call: activates when stock hits $${barrierLevel.toFixed(0)} (15% above spot).`,
 useCase: "Cheaper way to gain upside; only activates if rally materializes.",
 },
 {
 type: "Lookback Call",
 price: lookbackSum / N * disc,
 vanillaPrice: vanillaCall,
 keyMetric: ((lookbackSum / N * disc) / vanillaCall).toFixed(2),
 metricLabel: "Price Multiplier vs Vanilla",
 description: "Payoff = max stock price over life minus strike. Never regret missing the peak.",
 useCase: "Trend-following funds, high-vol environments. Always gets the best price.",
 },
 {
 type: "Digital (Binary)",
 price: (digitalSum / N) * disc,
 vanillaPrice: vanillaCall,
 keyMetric: ((digitalSum / N) * 100).toFixed(1),
 metricLabel: "Probability ITM %",
 description: "Pays exactly $1 if stock > strike at expiry. Fixed, binary payoff.",
 useCase: "Structured products, binary event hedges (earnings, FDA decisions).",
 },
 ];
}

// ---------------------------------------------------------------------------
// SVG Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number) {
 return Math.max(lo, Math.min(hi, v));
}

function toSvgX(v: number, min: number, max: number, w: number, padL: number, padR: number) {
 return padL + ((v - min) / (max - min)) * (w - padL - padR);
}

function toSvgY(v: number, min: number, max: number, h: number, padT: number, padB: number) {
 return h - padB - ((v - min) / (max - min)) * (h - padT - padB);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DerivPricingLabPage() {
 // ── Black-Scholes params ──────────────────────────────────────────────────
 const [bsS, setBsS] = useState(100);
 const [bsK, setBsK] = useState(100);
 const [bsR, setBsR] = useState(0.05);
 const [bsSigma, setBsSigma] = useState(0.25);
 const [bsT, setBsT] = useState(1);

 // ── MC params ────────────────────────────────────────────────────────────
 const [mcPaths, setMcPaths] = useState(1000);

 // ── BS Results ───────────────────────────────────────────────────────────
 const bs = useMemo(
 () => blackScholes(bsS, bsK, bsT, bsR, bsSigma),
 [bsS, bsK, bsT, bsR, bsSigma]
 );

 // ── Binomial Tree ────────────────────────────────────────────────────────
 const binomial = useMemo(
 () => buildBinomialTree(bsS, bsK, bsT, bsR, bsSigma, 3),
 [bsS, bsK, bsT, bsR, bsSigma]
 );

 // ── Monte Carlo ──────────────────────────────────────────────────────────
 const mc = useMemo(
 () => runMonteCarlo(bsS, bsK, bsT, bsR, bsSigma, mcPaths, 20),
 [bsS, bsK, bsT, bsR, bsSigma, mcPaths]
 );

 // ── Exotics ───────────────────────────────────────────────────────────────
 const exotics = useMemo(
 () => priceExotics(bsS, bsK, bsT, bsR, bsSigma),
 [bsS, bsK, bsT, bsR, bsSigma]
 );

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Header */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Pricing Lab</h1>
 <p className="text-xs font-medium tracking-widest text-muted-foreground mb-8">INTERACTIVE · MODELS · SENSITIVITIES</p>

 {/* Shared Parameter Bar — Hero */}
 <div>
 <Card className="bg-card border-border mb-6">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-4 font-medium">
 Shared Option Parameters — all tabs update in real time
 </p>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
 <SliderParam
 label="Spot Price (S)"
 value={bsS}
 min={60} max={200} step={1}
 format={(v) => `$${v.toFixed(0)}`}
 onChange={setBsS}
 color="violet"
 />
 <SliderParam
 label="Strike Price (K)"
 value={bsK}
 min={60} max={200} step={1}
 format={(v) => `$${v.toFixed(0)}`}
 onChange={setBsK}
 color="sky"
 />
 <SliderParam
 label="Risk-Free Rate (r)"
 value={bsR}
 min={0.001} max={0.15} step={0.001}
 format={(v) => `${(v * 100).toFixed(1)}%`}
 onChange={setBsR}
 color="emerald"
 />
 <SliderParam
 label="Volatility (σ)"
 value={bsSigma}
 min={0.05} max={0.80} step={0.01}
 format={(v) => `${(v * 100).toFixed(0)}%`}
 onChange={setBsSigma}
 color="amber"
 />
 <SliderParam
 label="Time to Expiry (T)"
 value={bsT}
 min={0.05} max={3} step={0.05}
 format={(v) => `${v.toFixed(2)}yr`}
 onChange={setBsT}
 color="rose"
 />
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="bs">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="bs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Black-Scholes
 </TabsTrigger>
 <TabsTrigger value="binomial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Binomial Tree
 </TabsTrigger>
 <TabsTrigger value="mc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Monte Carlo
 </TabsTrigger>
 <TabsTrigger value="exotics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Exotics
 </TabsTrigger>
 </TabsList>

 {/* ── Black-Scholes Tab ───────────────────────────────────────── */}
 <TabsContent value="bs" className="space-y-4">
 {/* Prices + Greeks */}
 <div className="grid grid-cols-2 gap-4">
 <PriceCard title="Call Price" price={bs.callPrice} color="emerald" icon={<TrendingUp className="w-4 h-4" />} />
 <PriceCard title="Put Price" price={bs.putPrice} color="rose" icon={<TrendingDown className="w-4 h-4" />} />
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 <GreekCard label="Δ Call Delta" value={bs.callDelta.toFixed(4)} sub="≈ probability ITM" color="violet" />
 <GreekCard label="Δ Put Delta" value={bs.putDelta.toFixed(4)} sub="negative for puts" color="sky" />
 <GreekCard label="Γ Gamma" value={bs.gamma.toFixed(5)} sub="delta sensitivity" color="amber" />
 <GreekCard label="V Vega" value={`$${bs.vega.toFixed(4)}`} sub="per +1% vol" color="emerald" />
 <GreekCard label="Θ Call Theta" value={`$${bs.callTheta.toFixed(4)}`} sub="per day decay" color="rose" />
 <GreekCard label="ρ Call Rho" value={`$${bs.callRho.toFixed(4)}`} sub="per +1% rate" color="slate" />
 </div>

 {/* d1/d2 explanation */}
 <Card className="bg-card border-border">
 <CardContent className="p-4 flex gap-8 flex-wrap">
 <div>
 <p className="text-xs text-muted-foreground mb-1">d₁</p>
 <p className="text-lg font-mono text-foreground">{bs.d1.toFixed(4)}</p>
 <p className="text-xs text-muted-foreground mt-1">ln(S/K) + (r+σ²/2)T / σ√T</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-1">d₂ = d₁ − σ√T</p>
 <p className="text-lg font-mono text-sky-300">{bs.d2.toFixed(4)}</p>
 <p className="text-xs text-muted-foreground mt-1">N(d₂) = risk-neutral prob ITM</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-1">N(d₂)</p>
 <p className="text-lg font-mono text-emerald-300">{(normalCDF(bs.d2) * 100).toFixed(2)}%</p>
 <p className="text-xs text-muted-foreground mt-1">Prob call expires in-the-money</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-1">Put-Call Parity Check</p>
 <p className="text-lg font-mono text-amber-300">
 {(bs.callPrice - bs.putPrice).toFixed(3)}
 </p>
 <p className="text-xs text-muted-foreground mt-1">C − P = {(bsS - bsK * Math.exp(-bsR * bsT)).toFixed(3)} (S − Ke⁻ʳᵀ)</p>
 </div>
 </CardContent>
 </Card>

 {/* Payoff Diagram */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Payoff Diagram at Expiry
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <PayoffDiagram S={bsS} K={bsK} callPremium={bs.callPrice} putPremium={bs.putPrice} />
 </CardContent>
 </Card>

 {/* Vol Smile + Sensitivity Heatmap side by side */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Implied Volatility Smile
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <VolSmileChart S={bsS} T={bsT} r={bsR} baseVol={bsSigma} />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Call Price Sensitivity Heatmap (S × σ)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <SensitivityHeatmap K={bsK} T={bsT} r={bsR} />
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Binomial Tree Tab ───────────────────────────────────────── */}
 <TabsContent value="binomial" className="space-y-4">
 <div className="grid grid-cols-3 gap-4">
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-1">Risk-Neutral Prob (p)</p>
 <p className="text-2xl font-semibold text-sky-300">{(binomial.riskNeutralP * 100).toFixed(2)}%</p>
 <p className="text-xs text-muted-foreground mt-1">p = (e^(rΔt) − d) / (u − d)</p>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-1">Up Factor (u)</p>
 <p className="text-2xl font-semibold text-emerald-300">{binomial.u.toFixed(4)}</p>
 <p className="text-xs text-muted-foreground mt-1">u = e^(σ√Δt)</p>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-1">Down Factor (d)</p>
 <p className="text-2xl font-medium text-rose-300">{binomial.d.toFixed(4)}</p>
 <p className="text-xs text-muted-foreground mt-1">d = 1/u</p>
 </CardContent>
 </Card>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <Card className="bg-card border-border p-4">
 <p className="text-xs text-muted-foreground mb-1">Binomial Call Price</p>
 <p className="text-2xl font-semibold text-emerald-400">${binomial.callPrice.toFixed(4)}</p>
 </Card>
 <Card className="bg-card border-border p-4">
 <p className="text-xs text-muted-foreground mb-1">Black-Scholes Call Price</p>
 <p className="text-lg font-medium text-foreground">${bs.callPrice.toFixed(4)}</p>
 <p className="text-xs text-muted-foreground mt-1">
 Diff: ${Math.abs(binomial.callPrice - bs.callPrice).toFixed(4)} (converges with more steps)
 </p>
 </Card>
 </div>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 3-Step Binomial Tree — Stock Prices (top) / Call Values (middle) / Put Values (bottom)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <BinomialTreeSVG nodes={binomial.nodes} steps={3} p={binomial.riskNeutralP} K={bsK} />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <div className="flex items-start gap-3">
 <div className="text-sm text-muted-foreground space-y-1">
 <p><span className="text-foreground font-medium">Risk-Neutral Valuation:</span> We price options as if investors are risk-neutral — discounting at the risk-free rate. This works because we can replicate any option payoff by delta-hedging.</p>
 <p><span className="text-foreground font-medium">Backward Induction:</span> Start at terminal nodes (payoffs), then work backwards multiplying by p (up) and 1−p (down), discounting each step by e^(−rΔt).</p>
 <p><span className="text-foreground font-medium">Convergence:</span> With 3 steps there is a small error vs Black-Scholes. At 50+ steps, the binomial price converges to within cents.</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Monte Carlo Tab ─────────────────────────────────────────── */}
 <TabsContent value="mc" className="space-y-4">
 {/* Path count control */}
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <div className="flex items-center gap-3">
 <div className="flex-1">
 <p className="text-xs text-muted-foreground mb-2">Number of Simulations: <span className="text-foreground font-medium">{mcPaths.toLocaleString()}</span></p>
 <Slider
 min={100} max={10000} step={100}
 value={[mcPaths]}
 onValueChange={([v]) => setMcPaths(v)}
 className="w-full"
 />
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span>100</span><span>2,500</span><span>5,000</span><span>7,500</span><span>10,000</span>
 </div>
 </div>
 <div className="text-right shrink-0">
 <p className="text-xs text-muted-foreground">More paths → lower std error</p>
 <p className="text-xs text-muted-foreground mt-1">SE ∝ 1/√N</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Prices + CIs */}
 <div className="grid grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-1">MC Call Price</p>
 <p className="text-lg font-medium text-emerald-400">${mc.callPrice.toFixed(4)}</p>
 <p className="text-xs text-muted-foreground mt-1">
 95% CI: [${mc.callCI[0].toFixed(3)}, ${mc.callCI[1].toFixed(3)}]
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">
 BS reference: <span className="text-foreground">${bs.callPrice.toFixed(4)}</span>
 </p>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-1">MC Put Price</p>
 <p className="text-lg font-medium text-rose-400">${mc.putPrice.toFixed(4)}</p>
 <p className="text-xs text-muted-foreground mt-1">
 95% CI: [${mc.putCI[0].toFixed(3)}, ${mc.putCI[1].toFixed(3)}]
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">
 BS reference: <span className="text-foreground">${bs.putPrice.toFixed(4)}</span>
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Spaghetti paths */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 20 Simulated Price Paths (GBM)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <SpaghettiChart paths={mc.paths} S={bsS} K={bsK} />
 </CardContent>
 </Card>

 {/* Histogram + Convergence */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Terminal Price Distribution
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <TerminalHistogram prices={mc.terminalPrices} S={bsS} K={bsK} />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Convergence Chart (Call Price vs N)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <ConvergenceChart data={mc.convergence} bsPrice={bs.callPrice} />
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Exotics Tab ─────────────────────────────────────────────── */}
 <TabsContent value="exotics" className="space-y-4">
 <Card className="bg-card border-border">
 <CardContent className="p-4 flex items-start gap-3">
 <p className="text-sm text-muted-foreground">
 Exotic options have path-dependent payoffs not captured by standard Black-Scholes.
 Prices are estimated via Monte Carlo (5,000 paths, same parameters as other tabs).
 Vanilla call reference: <span className="text-foreground font-medium">${bs.callPrice.toFixed(4)}</span>
 </p>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {exotics.map((ex) => (
 <ExoticCard key={ex.type} ex={ex} vanillaCall={bs.callPrice} />
 ))}
 </div>

 {/* Comparison bar chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Exotic vs Vanilla Pricing Comparison
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4">
 <ExoticComparisonChart exotics={exotics} vanillaCall={bs.callPrice} />
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SliderParamProps {
 label: string;
 value: number;
 min: number;
 max: number;
 step: number;
 format: (v: number) => string;
 onChange: (v: number) => void;
 color: "violet" | "sky" | "emerald" | "amber" | "rose";
}

function SliderParam({ label, value, min, max, step, format, onChange, color }: SliderParamProps) {
 const colorMap: Record<string, string> = {
 violet: "text-foreground",
 sky: "text-sky-300",
 emerald: "text-emerald-300",
 amber: "text-amber-300",
 rose: "text-rose-300",
 };
 return (
 <div>
 <div className="flex justify-between items-baseline mb-2">
 <p className="text-xs text-muted-foreground">{label}</p>
 <p className={`text-sm font-medium ${colorMap[color]}`}>{format(value)}</p>
 </div>
 <Slider
 min={min} max={max} step={step}
 value={[value]}
 onValueChange={([v]) => onChange(v)}
 className="w-full"
 />
 </div>
 );
}

interface PriceCardProps {
 title: string;
 price: number;
 color: "emerald" | "rose";
 icon: React.ReactNode;
}

function PriceCard({ title, price, color, icon }: PriceCardProps) {
 const bg = color === "emerald" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20";
 const text = color === "emerald" ? "text-emerald-400" : "text-rose-400";
 return (
 <Card className={`${bg} border`}>
 <CardContent className="p-5">
 <div className="flex items-center gap-2 mb-2">
 <span className={text}>{icon}</span>
 <p className="text-sm text-muted-foreground">{title}</p>
 </div>
 <p className={`text-lg font-medium ${text}`}>${price.toFixed(4)}</p>
 </CardContent>
 </Card>
 );
}

interface GreekCardProps {
 label: string;
 value: string;
 sub: string;
 color: string;
}

function GreekCard({ label, value, sub, color }: GreekCardProps) {
 const colorMap: Record<string, string> = {
 violet: "text-foreground border-border bg-muted/5",
 sky: "text-sky-300 border-sky-500/20 bg-sky-500/5",
 amber: "text-amber-300 border-amber-500/20 bg-amber-500/5",
 emerald: "text-emerald-300 border-emerald-500/20 bg-emerald-500/5",
 rose: "text-rose-300 border-rose-500/20 bg-rose-500/5",
 slate: "text-muted-foreground border-muted-foreground/20 bg-muted-foreground/5",
 };
 const cls = colorMap[color] ?? colorMap.slate;
 return (
 <Card className={`border ${cls}`}>
 <CardContent className="p-3">
 <p className="text-xs text-muted-foreground mb-1">{label}</p>
 <p className={`text-xl font-medium font-mono ${cls.split("")[0]}`}>{value}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
 </CardContent>
 </Card>
 );
}

// ── Payoff Diagram ──────────────────────────────────────────────────────────

function PayoffDiagram({ S, K, callPremium, putPremium }: { S: number; K: number; callPremium: number; putPremium: number }) {
 const W = 560; const H = 220; const PL = 50; const PR = 20; const PT = 20; const PB = 35;
 const sMin = K * 0.6; const sMax = K * 1.4;
 const nPts = 80;

 const callPoints: [number, number][] = [];
 const putPoints: [number, number][] = [];
 const callPLPoints: [number, number][] = [];
 const putPLPoints: [number, number][] = [];

 for (let i = 0; i <= nPts; i++) {
 const sp = sMin + (sMax - sMin) * i / nPts;
 callPoints.push([sp, Math.max(0, sp - K)]);
 putPoints.push([sp, Math.max(0, K - sp)]);
 callPLPoints.push([sp, Math.max(0, sp - K) - callPremium]);
 putPLPoints.push([sp, Math.max(0, K - sp) - putPremium]);
 }

 const allY = [...callPoints.map(p => p[1]), ...putPoints.map(p => p[1])];
 const yMax = Math.max(...allY, callPremium * 1.5) * 1.1;
 const yMin = -Math.max(callPremium, putPremium) * 1.5;

 const toX = (v: number) => toSvgX(v, sMin, sMax, W, PL, PR);
 const toY = (v: number) => toSvgY(v, yMin, yMax, H, PT, PB);

 const mkPath = (pts: [number, number][]) =>
 pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join("");

 const zeroY = toY(0);

 // Y-axis labels (deduplicated)
 const yTicks = [-Math.max(callPremium, putPremium), 0, yMax * 0.5, yMax];
 const uniqueYTicks = [...new Set(yTicks.map(v => parseFloat(v.toFixed(2))))];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
 {/* Grid */}
 <line x1={PL} y1={zeroY} x2={W - PR} y2={zeroY} stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />
 <line x1={toX(K)} y1={PT} x2={toX(K)} y2={H - PB} stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
 <line x1={toX(S)} y1={PT} x2={toX(S)} y2={H - PB} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

 {/* Payoff lines */}
 <path d={mkPath(callPoints)} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" />
 <path d={mkPath(putPoints)} fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" />
 {/* P&L lines */}
 <path d={mkPath(callPLPoints)} fill="none" stroke="#10b981" strokeWidth="2.5" />
 <path d={mkPath(putPLPoints)} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

 {/* Axis */}
 <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#334155" strokeWidth="1" />
 <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#334155" strokeWidth="1" />

 {/* Y ticks */}
 {uniqueYTicks.map((v, i) => (
 <g key={i}>
 <line x1={PL - 4} y1={toY(v)} x2={PL} y2={toY(v)} stroke="#475569" strokeWidth="1" />
 <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#64748b">{v.toFixed(1)}</text>
 </g>
 ))}

 {/* X ticks */}
 {[sMin, K * 0.8, K, K * 1.2, sMax].map((v, i) => (
 <g key={i}>
 <line x1={toX(v)} y1={H - PB} x2={toX(v)} y2={H - PB + 4} stroke="#475569" strokeWidth="1" />
 <text x={toX(v)} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#64748b">${v.toFixed(0)}</text>
 </g>
 ))}

 {/* Labels */}
 <text x={toX(S) + 4} y={PT + 12} fontSize="9" fill="#f59e0b">S={S}</text>
 <text x={toX(K) + 4} y={PT + 22} fontSize="9" fill="#818cf8">K={K}</text>

 {/* Legend */}
 <rect x={W - PR - 130} y={PT} width="128" height="40" rx="4" fill="#0f172a" opacity="0.8" />
 <line x1={W - PR - 120} y1={PT + 12} x2={W - PR - 104} y2={PT + 12} stroke="#10b981" strokeWidth="2.5" />
 <text x={W - PR - 100} y={PT + 16} fontSize="9" fill="#94a3b8">Call P&amp;L</text>
 <line x1={W - PR - 120} y1={PT + 28} x2={W - PR - 104} y2={PT + 28} stroke="#f43f5e" strokeWidth="2.5" />
 <text x={W - PR - 100} y={PT + 32} fontSize="9" fill="#94a3b8">Put P&amp;L</text>
 </svg>
 );
}

// ── Vol Smile ───────────────────────────────────────────────────────────────

function VolSmileChart({ S, T, r, baseVol }: { S: number; T: number; r: number; baseVol: number }) {
 const W = 360; const H = 200; const PL = 46; const PR = 16; const PT = 16; const PB = 30;

 // Generate smile: quadratic smile with skew
 const strikes = Array.from({ length: 20 }, (_, i) => S * (0.70 + i * 0.03));
 const moneyness = strikes.map(k => Math.log(k / S));
 const ivs = moneyness.map(m => {
 const smile = baseVol + 0.08 * m * m - 0.04 * m; // skewed smile
 return clamp(smile, 0.05, 1.0);
 });

 const xMin = strikes[0]; const xMax = strikes[strikes.length - 1];
 const yMin = Math.min(...ivs) * 0.9; const yMax = Math.max(...ivs) * 1.1;

 const toX = (v: number) => toSvgX(v, xMin, xMax, W, PL, PR);
 const toY = (v: number) => toSvgY(v, yMin, yMax, H, PT, PB);

 const pathD = strikes.map((k, i) => `${i === 0 ? "M" : "L"}${toX(k).toFixed(1)},${toY(ivs[i]).toFixed(1)}`).join("");
 const areaD = `${pathD} L${toX(xMax).toFixed(1)},${toY(yMin).toFixed(1)} L${toX(xMin).toFixed(1)},${toY(yMin).toFixed(1)} Z`;

 const yTicks = [yMin, (yMin + yMax) / 2, yMax];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
 <defs>
 <linearGradient id="smileGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 <path d={areaD} fill="url(#smileGrad)" />
 <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth="2" />
 {/* ATM line */}
 <line x1={toX(S)} y1={PT} x2={toX(S)} y2={H - PB} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
 <text x={toX(S) + 3} y={PT + 10} fontSize="8" fill="#f59e0b">ATM</text>

 <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#334155" strokeWidth="1" />
 <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#334155" strokeWidth="1" />

 {yTicks.map((v, i) => (
 <g key={i}>
 <text x={PL - 5} y={toY(v) + 4} textAnchor="end" fontSize="8" fill="#64748b">{(v * 100).toFixed(0)}%</text>
 <line x1={PL - 3} y1={toY(v)} x2={PL} y2={toY(v)} stroke="#475569" strokeWidth="1" />
 </g>
 ))}
 {[xMin, S, xMax].map((v, i) => (
 <text key={i} x={toX(v)} y={H - PB + 14} textAnchor="middle" fontSize="8" fill="#64748b">${v.toFixed(0)}</text>
 ))}
 <text x={PL} y={PT - 4} fontSize="8" fill="#94a3b8">IV</text>
 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="#94a3b8">Strike</text>
 </svg>
 );
}

// ── Sensitivity Heatmap ──────────────────────────────────────────────────────

function SensitivityHeatmap({ K, T, r }: { K: number; T: number; r: number }) {
 const spotsN = 10; const volsN = 8;
 const spots = Array.from({ length: spotsN }, (_, i) => K * (0.8 + i * 0.044));
 const vols = Array.from({ length: volsN }, (_, i) => 0.10 + i * 0.10);

 const prices = vols.map(sig => spots.map(sp => blackScholes(sp, K, T, r, sig).callPrice));
 const allP = prices.flat();
 const pMin = Math.min(...allP); const pMax = Math.max(...allP);

 const cellW = 40; const cellH = 24;
 const W = cellW * spotsN + 60; const H = cellH * volsN + 40;

 function heatColor(v: number) {
 const t = (v - pMin) / (pMax - pMin + 1e-9);
 // deep blue → purple → gold
 if (t < 0.5) {
 const r2 = Math.round(t * 2 * 99 + 30);
 const g2 = Math.round(t * 2 * 50);
 const b2 = Math.round(160 - t * 2 * 60);
 return `rgb(${r2},${g2},${b2})`;
 } else {
 const t2 = (t - 0.5) * 2;
 const r2 = Math.round(99 + t2 * 156);
 const g2 = Math.round(50 + t2 * 128);
 const b2 = Math.round(100 - t2 * 90);
 return `rgb(${r2},${g2},${b2})`;
 }
 }

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {vols.map((sig, vi) =>
 spots.map((sp, si) => {
 const p = prices[vi][si];
 const x = 52 + si * cellW; const y = H - 40 - (vi + 1) * cellH;
 return (
 <g key={`${vi}-${si}`}>
 <rect x={x} y={y} width={cellW - 1} height={cellH - 1} fill={heatColor(p)} rx="2" />
 <text x={x + cellW / 2} y={y + cellH / 2 + 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)">{p.toFixed(1)}</text>
 </g>
 );
 })
 )}
 {/* X axis labels */}
 {spots.map((sp, i) => (
 <text key={i} x={52 + i * cellW + cellW / 2} y={H - 6} textAnchor="middle" fontSize="7.5" fill="#64748b">${sp.toFixed(0)}</text>
 ))}
 <text x={52 + spotsN * cellW / 2} y={H} textAnchor="middle" fontSize="8" fill="#94a3b8" />
 {/* Y axis labels */}
 {vols.map((sig, i) => (
 <text key={i} x={48} y={H - 40 - i * cellH - cellH / 2 + 4} textAnchor="end" fontSize="7.5" fill="#64748b">{(sig * 100).toFixed(0)}%</text>
 ))}
 <text x={10} y={H / 2} textAnchor="middle" fontSize="8" fill="#94a3b8" transform={`rotate(-90,10,${H / 2})`}>σ</text>
 <text x={52 + (spotsN * cellW) / 2} y={H - 22} textAnchor="middle" fontSize="8" fill="#94a3b8">Spot →</text>
 </svg>
 );
}

// ── Binomial Tree SVG ────────────────────────────────────────────────────────

function BinomialTreeSVG({ nodes, steps, p, K }: { nodes: BinomialNode[]; steps: number; p: number; K: number }) {
 const W = 680; const H = 340;
 const colX = (col: number) => 60 + col * ((W - 100) / steps);
 const rowY = (row: number, col: number, totalCols: number) => {
 const spread = H * 0.75;
 const base = H / 2;
 if (totalCols === 1) return base;
 return base + (col - (totalCols - 1) / 2) * (spread / (totalCols - 1 + 0.0001));
 };

 const nodeMap: Record<string, BinomialNode> = {};
 nodes.forEach(n => { nodeMap[`${n.row}-${n.col}`] = n; });

 const getY = (row: number, col: number) => rowY(row, col, row + 1);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Edges */}
 {nodes.map(node => {
 if (node.row >= steps) return null;
 const x1 = colX(node.row); const y1 = getY(node.row, node.col);
 // up child: row+1, col+1
 const upChild = nodeMap[`${node.row + 1}-${node.col + 1}`];
 // down child: row+1, col
 const downChild = nodeMap[`${node.row + 1}-${node.col}`];
 return (
 <g key={`edge-${node.row}-${node.col}`}>
 {upChild && (
 <g>
 <line x1={x1 + 28} y1={y1} x2={colX(node.row + 1) - 28} y2={getY(node.row + 1, node.col + 1)} stroke="#1e40af" strokeWidth="1.5" />
 <text
 x={(x1 + 28 + colX(node.row + 1) - 28) / 2 + 6}
 y={(y1 + getY(node.row + 1, node.col + 1)) / 2 - 4}
 fontSize="8.5" fill="#60a5fa" textAnchor="middle"
 >p={p.toFixed(2)}</text>
 </g>
 )}
 {downChild && (
 <g>
 <line x1={x1 + 28} y1={y1} x2={colX(node.row + 1) - 28} y2={getY(node.row + 1, node.col)} stroke="#7c3aed" strokeWidth="1.5" />
 <text
 x={(x1 + 28 + colX(node.row + 1) - 28) / 2 - 6}
 y={(y1 + getY(node.row + 1, node.col)) / 2 + 10}
 fontSize="8.5" fill="#a78bfa" textAnchor="middle"
 >1-p={(1 - p).toFixed(2)}</text>
 </g>
 )}
 </g>
 );
 })}

 {/* Nodes */}
 {nodes.map(node => {
 const x = colX(node.row); const y = getY(node.row, node.col);
 const isITM = node.stockPrice > K;
 const borderColor = isITM ? "#10b981" : "#f43f5e";
 return (
 <g key={`node-${node.row}-${node.col}`}>
 <rect x={x - 28} y={y - 26} width={56} height={52} rx="5"
 fill="#0f172a" stroke={borderColor} strokeWidth="1.5" />
 <text x={x} y={y - 12} textAnchor="middle" fontSize="8.5" fill="#e2e8f0" fontWeight="600">
 ${node.stockPrice.toFixed(1)}
 </text>
 <text x={x} y={y} textAnchor="middle" fontSize="7.5" fill="#10b981">
 C${node.callValue.toFixed(2)}
 </text>
 <text x={x} y={y + 13} textAnchor="middle" fontSize="7.5" fill="#f43f5e">
 P${node.putValue.toFixed(2)}
 </text>
 </g>
 );
 })}

 {/* Step labels */}
 {Array.from({ length: steps + 1 }, (_, i) => (
 <text key={i} x={colX(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b">t={i}</text>
 ))}
 </svg>
 );
}

// ── Spaghetti Chart ──────────────────────────────────────────────────────────

function SpaghettiChart({ paths, S, K }: { paths: number[][]; S: number; K: number }) {
 const W = 520; const H = 220; const PL = 50; const PR = 16; const PT = 16; const PB = 30;

 const allPrices = paths.flat();
 const yMin = Math.min(...allPrices) * 0.95;
 const yMax = Math.max(...allPrices) * 1.05;
 const nSteps = paths[0]?.length ?? 1;

 const toX = (i: number) => toSvgX(i, 0, nSteps - 1, W, PL, PR);
 const toY = (v: number) => toSvgY(v, yMin, yMax, H, PT, PB);

 const colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#84cc16", "#fb923c", "#ec4899",
 "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#fb7185", "#c4b5fd", "#7dd3fc", "#6ee7b7", "#fde68a", "#fda4af"];

 const kY = toY(K);
 const sY = toY(S);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Strike line */}
 <line x1={PL} y1={kY} x2={W - PR} y2={kY} stroke="#6366f1" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
 <text x={PL + 2} y={kY - 3} fontSize="8" fill="#818cf8">K={K}</text>
 {/* Spot */}
 <line x1={PL} y1={sY} x2={PL + 8} y2={sY} stroke="#f59e0b" strokeWidth="2" />
 <text x={PL + 10} y={sY + 4} fontSize="8" fill="#f59e0b">S₀</text>

 {paths.map((path, pi) => {
 const d = path.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join("");
 return <path key={pi} d={d} fill="none" stroke={colors[pi % colors.length]} strokeWidth="1" opacity="0.55" />;
 })}

 <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#334155" strokeWidth="1" />
 <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#334155" strokeWidth="1" />

 {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => (
 <g key={i}>
 <text x={PL - 5} y={toY(v) + 4} textAnchor="end" fontSize="8" fill="#64748b">${v.toFixed(0)}</text>
 <line x1={PL - 3} y1={toY(v)} x2={PL} y2={toY(v)} stroke="#475569" strokeWidth="1" />
 </g>
 ))}
 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="#94a3b8">Time Steps</text>
 <text x={8} y={H / 2} textAnchor="middle" fontSize="8" fill="#94a3b8" transform={`rotate(-90,8,${H / 2})`}>Price</text>
 </svg>
 );
}

// ── Terminal Histogram ───────────────────────────────────────────────────────

function TerminalHistogram({ prices, S, K }: { prices: number[]; S: number; K: number }) {
 const W = 360; const H = 200; const PL = 46; const PR = 16; const PT = 16; const PB = 30;
 const bins = 30;
 const pMin = Math.min(...prices); const pMax = Math.max(...prices);
 const binSize = (pMax - pMin) / bins;

 const counts = new Array(bins).fill(0);
 prices.forEach(p => {
 const idx = clamp(Math.floor((p - pMin) / binSize), 0, bins - 1);
 counts[idx]++;
 });
 const maxCount = Math.max(...counts);

 const toX = (v: number) => toSvgX(v, pMin, pMax, W, PL, PR);
 const toY = (v: number) => toSvgY(v, 0, maxCount * 1.05, H, PT, PB);

 const barW = (W - PL - PR) / bins;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {counts.map((c, i) => {
 const x = PL + i * barW;
 const binMid = pMin + (i + 0.5) * binSize;
 const isITM = binMid > K;
 return (
 <rect key={i} x={x + 0.5} y={toY(c)} width={barW - 1} height={H - PB - toY(c)}
 fill={isITM ? "#10b98166" : "#f43f5e66"} stroke={isITM ? "#10b981" : "#f43f5e"} strokeWidth="0.5" />
 );
 })}

 {/* K line */}
 <line x1={toX(K)} y1={PT} x2={toX(K)} y2={H - PB} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />
 <text x={toX(K) + 2} y={PT + 10} fontSize="8" fill="#818cf8">K</text>
 {/* S line */}
 <line x1={toX(S)} y1={PT} x2={toX(S)} y2={H - PB} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
 <text x={toX(S) + 2} y={PT + 20} fontSize="8" fill="#f59e0b">S₀</text>

 <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#334155" strokeWidth="1" />
 <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#334155" strokeWidth="1" />

 {[pMin, K, pMax].map((v, i) => (
 <text key={i} x={toX(v)} y={H - PB + 14} textAnchor="middle" fontSize="8" fill="#64748b">${v.toFixed(0)}</text>
 ))}
 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="#94a3b8">Terminal Price</text>
 </svg>
 );
}

// ── Convergence Chart ────────────────────────────────────────────────────────

function ConvergenceChart({ data, bsPrice }: { data: { n: number; callEst: number }[]; bsPrice: number }) {
 const W = 360; const H = 200; const PL = 52; const PR = 16; const PT = 16; const PB = 30;

 if (data.length < 2) return <p className="text-muted-foreground text-xs">Need more simulations</p>;

 const xs = data.map(d => d.n);
 const ys = data.map(d => d.callEst);
 const xMin = xs[0]; const xMax = xs[xs.length - 1];
 const yAll = [...ys, bsPrice];
 const yMin = Math.min(...yAll) * 0.92; const yMax = Math.max(...yAll) * 1.08;

 const toX = (v: number) => toSvgX(v, xMin, xMax, W, PL, PR);
 const toY = (v: number) => toSvgY(v, yMin, yMax, H, PT, PB);

 const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.n).toFixed(1)},${toY(d.callEst).toFixed(1)}`).join("");
 const bsY = toY(bsPrice);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* BS reference */}
 <line x1={PL} y1={bsY} x2={W - PR} y2={bsY} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5 3" />
 <text x={W - PR - 2} y={bsY - 4} textAnchor="end" fontSize="8" fill="#a78bfa">BS={bsPrice.toFixed(3)}</text>

 {/* MC line */}
 <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
 {data.map((d, i) => (
 <circle key={i} cx={toX(d.n)} cy={toY(d.callEst)} r="3" fill="#10b981" />
 ))}

 <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#334155" strokeWidth="1" />
 <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#334155" strokeWidth="1" />

 {[yMin, bsPrice, yMax].map((v, i) => (
 <g key={i}>
 <text x={PL - 4} y={toY(v) + 4} textAnchor="end" fontSize="8" fill="#64748b">{v.toFixed(2)}</text>
 <line x1={PL - 3} y1={toY(v)} x2={PL} y2={toY(v)} stroke="#475569" strokeWidth="1" />
 </g>
 ))}
 {xs.filter((_, i) => i % 2 === 0).map((x, i) => (
 <text key={i} x={toX(x)} y={H - PB + 14} textAnchor="middle" fontSize="7.5" fill="#64748b">{x >= 1000 ? `${x / 1000}k` : x}</text>
 ))}
 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="#94a3b8">N simulations</text>
 <text x={8} y={H / 2} textAnchor="middle" fontSize="8" fill="#94a3b8" transform={`rotate(-90,8,${H / 2})`}>Call Price</text>
 </svg>
 );
}

// ── Exotic Card ──────────────────────────────────────────────────────────────

function ExoticCard({ ex, vanillaCall }: { ex: ExoticResult; vanillaCall: number }) {
 const cheaper = ex.price < vanillaCall;
 return (
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 {ex.type}
 </CardTitle>
 </CardHeader>
 <CardContent className="p-4 space-y-3">
 <div className="flex gap-4">
 <div>
 <p className="text-xs text-muted-foreground mb-0.5">Exotic Price</p>
 <p className="text-lg font-medium text-amber-400">${ex.price.toFixed(4)}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-0.5">Vanilla Call</p>
 <p className="text-lg font-medium text-foreground">${vanillaCall.toFixed(4)}</p>
 </div>
 <div className="ml-auto text-right">
 <p className="text-xs text-muted-foreground mb-0.5">{ex.metricLabel}</p>
 <Badge className={cheaper ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-rose-500/15 text-rose-400 border-rose-500/20"}>
 {ex.keyMetric}
 </Badge>
 </div>
 </div>

 {/* Mini price bar */}
 <div>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span>$0</span>
 <span>${(Math.max(ex.price, vanillaCall) * 1.1).toFixed(2)}</span>
 </div>
 <div className="relative h-4 bg-muted rounded overflow-hidden">
 <div
 className="absolute left-0 top-0 h-full bg-primary/40 rounded"
 style={{ width: `${clamp((vanillaCall / (Math.max(ex.price, vanillaCall) * 1.1)) * 100, 0, 100)}%` }}
 />
 <div
 className="absolute left-0 top-0 h-2 bg-amber-500/70 rounded"
 style={{ width: `${clamp((ex.price / (Math.max(ex.price, vanillaCall) * 1.1)) * 100, 0, 100)}%`, top: 4 }}
 />
 </div>
 <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
 <span className="text-foreground">■ Vanilla</span>
 <span className="text-amber-400">■ Exotic</span>
 </div>
 </div>

 <p className="text-xs text-muted-foreground border-l-2 border-amber-500/40 pl-2">{ex.description}</p>
 <div className="flex items-start gap-2">
 <p className="text-xs text-emerald-300">{ex.useCase}</p>
 </div>
 </CardContent>
 </Card>
 );
}

// ── Exotic Comparison Bar Chart ──────────────────────────────────────────────

function ExoticComparisonChart({ exotics, vanillaCall }: { exotics: ExoticResult[]; vanillaCall: number }) {
 const W = 560; const H = 160; const PL = 160; const PR = 30; const PT = 20; const PB = 20;
 const allPrices = [...exotics.map(e => e.price), vanillaCall];
 const xMax = Math.max(...allPrices) * 1.15;
 const items = [{ label: "Vanilla Call", price: vanillaCall, color: "#8b5cf6" }, ...exotics.map(e => ({ label: e.type, price: e.price, color: "#f59e0b" }))];

 const rowH = (H - PT - PB) / items.length;
 const toX = (v: number) => PL + (v / xMax) * (W - PL - PR);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {items.map((item, i) => {
 const y = PT + i * rowH;
 const barW = toX(item.price) - PL;
 return (
 <g key={i}>
 <text x={PL - 6} y={y + rowH / 2 + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{item.label}</text>
 <rect x={PL} y={y + 4} width={Math.max(0, barW)} height={rowH - 8} rx="3" fill={item.color} opacity="0.75" />
 <text x={PL + barW + 4} y={y + rowH / 2 + 4} fontSize="9" fill={item.color}>${item.price.toFixed(3)}</text>
 </g>
 );
 })}
 <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#334155" strokeWidth="1" />
 {[0, xMax * 0.25, xMax * 0.5, xMax * 0.75, xMax].map((v, i) => (
 <g key={i}>
 <line x1={toX(v)} y1={H - PB} x2={toX(v)} y2={H - PB + 4} stroke="#475569" strokeWidth="1" />
 <text x={toX(v)} y={H - 4} textAnchor="middle" fontSize="7.5" fill="#64748b">${v.toFixed(1)}</text>
 </g>
 ))}
 </svg>
 );
}
