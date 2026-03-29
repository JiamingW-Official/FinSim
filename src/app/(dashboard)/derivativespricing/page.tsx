"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
 FlaskConical,
 GitBranch,
 BarChart2,
 Layers,
 TrendingUp,
} from "lucide-react";

// ─── Seeded PRNG ────────────────────────────────────────────────────────────
function makeRand(seed: number) {
 let s = seed;
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

// ─── Normal CDF (Abramowitz & Stegun) ────────────────────────────────────────
function normalCDF(x: number): number {
 const a1 = 0.254829592,
 a2 = -0.284496736,
 a3 = 1.421413741,
 a4 = -1.453152027,
 a5 = 1.061405429,
 p = 0.3275911;
 const sign = x < 0 ? -1 : 1;
 x = Math.abs(x) / Math.sqrt(2);
 const t = 1.0 / (1.0 + p * x);
 const y =
 1.0 -
 (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
 Math.exp(-x * x);
 return 0.5 * (1.0 + sign * y);
}

function normalPDF(x: number): number {
 return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ─── Black-Scholes ────────────────────────────────────────────────────────────
interface BSResult {
 call: number;
 put: number;
 d1: number;
 d2: number;
 delta_call: number;
 delta_put: number;
 gamma: number;
 theta_call: number;
 theta_put: number;
 vega: number;
 rho_call: number;
 rho_put: number;
}

function blackScholes(S: number, K: number, T: number, r: number, sigma: number): BSResult {
 if (T <= 0) {
 const intrinsicCall = Math.max(S - K, 0);
 const intrinsicPut = Math.max(K - S, 0);
 return {
 call: intrinsicCall, put: intrinsicPut, d1: 0, d2: 0,
 delta_call: S > K ? 1 : 0, delta_put: S > K ? 0 : -1,
 gamma: 0, theta_call: 0, theta_put: 0, vega: 0, rho_call: 0, rho_put: 0,
 };
 }
 const sqrtT = Math.sqrt(T);
 const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
 const d2 = d1 - sigma * sqrtT;
 const Nd1 = normalCDF(d1);
 const Nd2 = normalCDF(d2);
 const Nd1n = normalCDF(-d1);
 const Nd2n = normalCDF(-d2);
 const df = Math.exp(-r * T);

 const call = S * Nd1 - K * df * Nd2;
 const put = K * df * Nd2n - S * Nd1n;
 const gamma = normalPDF(d1) / (S * sigma * sqrtT);
 const vega = S * normalPDF(d1) * sqrtT / 100; // per 1% vol move
 const theta_call = (-(S * normalPDF(d1) * sigma) / (2 * sqrtT) - r * K * df * Nd2) / 365;
 const theta_put = (-(S * normalPDF(d1) * sigma) / (2 * sqrtT) + r * K * df * Nd2n) / 365;
 const rho_call = K * T * df * Nd2 / 100;
 const rho_put = -K * T * df * Nd2n / 100;

 return {
 call, put, d1, d2,
 delta_call: Nd1, delta_put: Nd1 - 1,
 gamma, theta_call, theta_put, vega, rho_call, rho_put,
 };
}

// ─── Slider Row ───────────────────────────────────────────────────────────────
function SliderRow({
 label, value, min, max, step, format, onChange,
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
 <div className="flex flex-col gap-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{label}</span>
 <span className="text-foreground font-mono">{format(value)}</span>
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

// ─── Greek Chip ───────────────────────────────────────────────────────────────
function GreekChip({ label, value, color }: { label: string; value: string; color: string }) {
 return (
 <div className={`flex flex-col items-center p-3 rounded-lg border ${color}`}>
 <span className="text-xs text-muted-foreground mb-1">{label}</span>
 <span className="text-base font-mono font-semibold text-foreground">{value}</span>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 1: Black-Scholes Lab
// ═══════════════════════════════════════════════════════════════════════════════
function BSLab() {
 const [S, setS] = useState(100);
 const [K, setK] = useState(100);
 const [T, setT] = useState(0.5);
 const [r, setR] = useState(0.05);
 const [sigma, setSigma] = useState(0.2);

 const bs = useMemo(() => blackScholes(S, K, T, r, sigma), [S, K, T, r, sigma]);

 // Price surface: vol (y) × strike (x) grid
 const heatmapData = useMemo(() => {
 const strikes = Array.from({ length: 11 }, (_, i) => K * 0.75 + (K * 0.5 * i) / 10);
 const vols = Array.from({ length: 11 }, (_, i) => 0.05 + (0.55 * i) / 10);
 const cells: { x: number; y: number; callPrice: number; maxPrice: number }[] = [];
 let maxPrice = 0;
 for (let vi = 0; vi < vols.length; vi++) {
 for (let ki = 0; ki < strikes.length; ki++) {
 const res = blackScholes(S, strikes[ki], T, r, vols[vi]);
 if (res.call > maxPrice) maxPrice = res.call;
 cells.push({ x: ki, y: vi, callPrice: res.call, maxPrice: 0 });
 }
 }
 return { cells: cells.map(c => ({ ...c, maxPrice })), strikes, vols };
 }, [S, K, T, r]);

 const heatColor = (value: number, max: number) => {
 const ratio = max > 0 ? Math.min(value / max, 1) : 0;
 const r2 = Math.round(20 + ratio * 235);
 const g2 = Math.round(180 * (1 - ratio));
 const b2 = Math.round(200 * (1 - ratio));
 return `rgb(${r2},${g2},${b2})`;
 };

 const W = 400, H = 220;
 const cellW = W / 11, cellH = H / 11;

 return (
 <div className="flex flex-col gap-3 p-4">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 {/* Sliders */}
 <div className="lg:col-span-1 bg-card rounded-md border border-border p-4 flex flex-col gap-4">
 <h3 className="text-sm font-semibold text-muted-foreground">Parameters</h3>
 <SliderRow label="Spot Price (S)" value={S} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setS} />
 <SliderRow label="Strike Price (K)" value={K} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setK} />
 <SliderRow label="Time to Expiry (T)" value={T} min={0.01} max={2} step={0.01}
 format={v => `${v.toFixed(2)} yr`} onChange={setT} />
 <SliderRow label="Risk-Free Rate (r)" value={r} min={0} max={0.15} step={0.001}
 format={v => `${(v * 100).toFixed(1)}%`} onChange={setR} />
 <SliderRow label="Volatility (σ)" value={sigma} min={0.01} max={0.8} step={0.01}
 format={v => `${(v * 100).toFixed(0)}%`} onChange={setSigma} />
 </div>

 {/* Prices */}
 <div className="lg:col-span-2 flex flex-col gap-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-emerald-950 border border-emerald-700 rounded-md p-4 text-center">
 <div className="text-xs text-emerald-400 mb-1">Call Price</div>
 <div className="text-2xl font-mono font-semibold text-emerald-300">${bs.call.toFixed(4)}</div>
 <div className="text-xs text-muted-foreground mt-1">d₁ = {bs.d1.toFixed(4)}</div>
 </div>
 <div className="bg-rose-950 border border-rose-700 rounded-md p-4 text-center">
 <div className="text-xs text-rose-400 mb-1">Put Price</div>
 <div className="text-2xl font-mono font-semibold text-rose-300">${bs.put.toFixed(4)}</div>
 <div className="text-xs text-muted-foreground mt-1">d₂ = {bs.d2.toFixed(4)}</div>
 </div>
 </div>

 {/* Greeks */}
 <div className="grid grid-cols-3 gap-2">
 <GreekChip label="Δ Call" value={bs.delta_call.toFixed(4)} color="border-border bg-muted/50" />
 <GreekChip label="Δ Put" value={bs.delta_put.toFixed(4)} color="border-border bg-muted/50" />
 <GreekChip label="Γ" value={bs.gamma.toFixed(6)} color="border-border bg-muted/50" />
 <GreekChip label="Θ Call/day" value={bs.theta_call.toFixed(4)} color="border-amber-800 bg-amber-950/40" />
 <GreekChip label="Θ Put/day" value={bs.theta_put.toFixed(4)} color="border-amber-800 bg-amber-950/40" />
 <GreekChip label="Vega /1%" value={bs.vega.toFixed(4)} color="border-cyan-800 bg-cyan-950/40" />
 <GreekChip label="ρ Call /1%" value={bs.rho_call.toFixed(4)} color="border-pink-800 bg-pink-950/40" />
 <GreekChip label="ρ Put /1%" value={bs.rho_put.toFixed(4)} color="border-pink-800 bg-pink-950/40" />
 <GreekChip label="S/K Ratio" value={(S/K).toFixed(3)} color="border-border bg-muted/40" />
 </div>
 </div>
 </div>

 {/* Heatmap */}
 <div className="bg-card rounded-md border border-border p-4">
 <h3 className="text-sm font-semibold text-muted-foreground mb-3">Call Price Surface — Vol × Strike</h3>
 <div className="overflow-x-auto">
 <svg width={W + 60} height={H + 50} className="font-mono text-[11px]">
 {/* Y axis label: vol */}
 <text x={8} y={H / 2 + 25} textAnchor="middle" fill="#a1a1aa" fontSize={10}
 transform={`rotate(-90,8,${H/2+25})`}>Volatility</text>
 {/* X axis label: strike */}
 <text x={60 + W / 2} y={H + 48} textAnchor="middle" fill="#a1a1aa" fontSize={10}>Strike</text>

 <g transform="translate(50,0)">
 {heatmapData.cells.map((cell, idx) => (
 <rect
 key={idx}
 x={cell.x * cellW}
 y={(10 - cell.y) * cellH}
 width={cellW - 1}
 height={cellH - 1}
 fill={heatColor(cell.callPrice, cell.maxPrice)}
 opacity={0.85}
 />
 ))}
 {/* X tick labels (strikes) */}
 {heatmapData.strikes.filter((_, i) => i % 2 === 0).map((sk, i) => (
 <text key={i} x={(i * 2) * cellW + cellW / 2} y={H + 14}
 textAnchor="middle" fill="#71717a" fontSize={9}>{sk.toFixed(0)}</text>
 ))}
 {/* Y tick labels (vols) */}
 {heatmapData.vols.filter((_, i) => i % 2 === 0).map((v, i) => (
 <text key={i} x={-4} y={(10 - i * 2) * cellH + cellH / 2 + 3}
 textAnchor="end" fill="#71717a" fontSize={9}>{(v * 100).toFixed(0)}%</text>
 ))}
 </g>
 </svg>
 </div>
 <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
 <div className="w-20 h-3 rounded" style={{background: "linear-gradient(to right, rgb(20,180,200), rgb(255,0,0))"}} />
 <span>Low → High call price</span>
 </div>
 </div>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 2: Binomial Tree (N=4)
// ═══════════════════════════════════════════════════════════════════════════════
function BinomialTree() {
 const [S, setS] = useState(100);
 const [K, setK] = useState(100);
 const [T, setT] = useState(0.5);
 const [r, setR] = useState(0.05);
 const [sigma, setSigma] = useState(0.2);
 const [optType, setOptType] = useState<"call" | "put">("call");

 const N = 4;

 const tree = useMemo(() => {
 const dt = T / N;
 const u = Math.exp(sigma * Math.sqrt(dt));
 const d = 1 / u;
 const p = (Math.exp(r * dt) - d) / (u - d);
 const df = Math.exp(-r * dt);

 // Stock prices
 const stock: number[][] = [];
 for (let i = 0; i <= N; i++) {
 stock[i] = [];
 for (let j = 0; j <= i; j++) {
 stock[i][j] = S * Math.pow(u, j) * Math.pow(d, i - j);
 }
 }

 // Option values at expiry
 const optVals: number[][] = [];
 optVals[N] = stock[N].map(s =>
 optType === "call" ? Math.max(s - K, 0) : Math.max(K - s, 0)
 );

 // Backward induction
 for (let i = N - 1; i >= 0; i--) {
 optVals[i] = [];
 for (let j = 0; j <= i; j++) {
 optVals[i][j] = df * (p * optVals[i + 1][j + 1] + (1 - p) * optVals[i + 1][j]);
 }
 }

 const bsRef = blackScholes(S, K, T, r, sigma);
 const bsPrice = optType === "call" ? bsRef.call : bsRef.put;

 return { stock, optVals, u, d, p, binomialPrice: optVals[0][0], bsPrice };
 }, [S, K, T, r, sigma, optType]);

 // SVG layout
 const W = 520, H = 320;
 const colX = (i: number) => 40 + (i / N) * (W - 80);
 const rowY = (i: number, j: number) => {
 // center at midpoint of step i
 const mid = i / 2;
 return 30 + ((j - mid) / (N / 2)) * (H / 2 - 20) + H / 2;
 };

 return (
 <div className="flex flex-col gap-3 p-4">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-1 bg-card rounded-md border border-border p-4 flex flex-col gap-4">
 <h3 className="text-sm font-medium text-muted-foreground">Parameters (N=4 steps)</h3>
 <SliderRow label="Spot Price (S)" value={S} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setS} />
 <SliderRow label="Strike Price (K)" value={K} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setK} />
 <SliderRow label="Time to Expiry (T)" value={T} min={0.05} max={2} step={0.05}
 format={v => `${v.toFixed(2)} yr`} onChange={setT} />
 <SliderRow label="Risk-Free Rate (r)" value={r} min={0} max={0.15} step={0.001}
 format={v => `${(v * 100).toFixed(1)}%`} onChange={setR} />
 <SliderRow label="Volatility (σ)" value={sigma} min={0.05} max={0.8} step={0.01}
 format={v => `${(v * 100).toFixed(0)}%`} onChange={setSigma} />

 <div className="flex gap-2 mt-2">
 {(["call", "put"] as const).map(t => (
 <button key={t} onClick={() => setOptType(t)}
 className={`flex-1 py-1.5 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
 optType === t ? "bg-primary text-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
 }`}>
 {t.toUpperCase()}
 </button>
 ))}
 </div>

 {/* Comparison */}
 <div className="mt-2 grid grid-cols-2 gap-2">
 <div className="bg-muted rounded-lg p-3 text-center">
 <div className="text-xs text-muted-foreground">Binomial</div>
 <div className="text-lg font-mono font-medium text-foreground">${tree.binomialPrice.toFixed(4)}</div>
 </div>
 <div className="bg-muted rounded-lg p-3 text-center">
 <div className="text-xs text-muted-foreground">Black-Scholes</div>
 <div className="text-lg font-mono font-medium text-foreground">${tree.bsPrice.toFixed(4)}</div>
 </div>
 </div>
 <div className="text-xs text-muted-foreground text-center">
 Diff: ${Math.abs(tree.binomialPrice - tree.bsPrice).toFixed(4)}
 </div>
 <div className="text-xs text-muted-foreground">u={tree.u.toFixed(4)}, d={tree.d.toFixed(4)}, p={tree.p.toFixed(4)}</div>
 </div>

 {/* Tree SVG */}
 <div className="lg:col-span-2 bg-card rounded-md border border-border p-4 overflow-x-auto">
 <h3 className="text-sm font-medium text-muted-foreground mb-2">Binomial Tree (Stock / Option Value)</h3>
 <svg width={W} height={H} className="font-mono text-[11px]">
 {/* Edges */}
 {Array.from({ length: N }, (_, i) =>
 Array.from({ length: i + 1 }, (_, j) => (
 <g key={`edge-${i}-${j}`}>
 <line x1={colX(i)} y1={rowY(i, j)} x2={colX(i + 1)} y2={rowY(i + 1, j + 1)}
 stroke="#3f3f46" strokeWidth={1} />
 <line x1={colX(i)} y1={rowY(i, j)} x2={colX(i + 1)} y2={rowY(i + 1, j)}
 stroke="#3f3f46" strokeWidth={1} />
 </g>
 ))
 )}

 {/* Nodes */}
 {Array.from({ length: N + 1 }, (_, i) =>
 Array.from({ length: i + 1 }, (_, j) => {
 const cx = colX(i);
 const cy = rowY(i, j);
 const optVal = tree.optVals[i][j];
 const stockVal = tree.stock[i][j];
 const isITM = optType === "call" ? stockVal > K : stockVal < K;
 return (
 <g key={`node-${i}-${j}`}>
 <rect x={cx - 28} y={cy - 18} width={56} height={36}
 rx={5} fill={isITM ? "#14532d" : "#27272a"} stroke={isITM ? "#16a34a" : "#3f3f46"} strokeWidth={1} />
 <text x={cx} y={cy - 4} textAnchor="middle" fill="#a1a1aa" fontSize={9}>
 S:{stockVal.toFixed(1)}
 </text>
 <text x={cx} y={cy + 9} textAnchor="middle"
 fill={optVal > 0.001 ? "#34d399" : "#71717a"} fontSize={9} fontWeight="bold">
 V:{optVal.toFixed(2)}
 </text>
 </g>
 );
 })
 )}

 {/* Step labels */}
 {Array.from({ length: N + 1 }, (_, i) => (
 <text key={`step-${i}`} x={colX(i)} y={H - 4} textAnchor="middle" fill="#52525b" fontSize={9}>
 t={i}
 </text>
 ))}
 </svg>
 </div>
 </div>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 3: Monte Carlo
// ═══════════════════════════════════════════════════════════════════════════════
function MonteCarlo() {
 const [S, setS] = useState(100);
 const [K, setK] = useState(100);
 const [T, setT] = useState(0.5);
 const [r, setR] = useState(0.05);
 const [sigma, setSigma] = useState(0.2);
 const [optType, setOptType] = useState<"call" | "put">("call");

 const PATHS_VIS = 100;
 const STEPS = 50;

 // Box-Muller for normal samples
 function boxMuller(rand: () => number): number {
 const u1 = Math.max(rand(), 1e-10);
 const u2 = rand();
 return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
 }

 const { paths, payoffs, convergence, bsPrice } = useMemo(() => {
 const rand = makeRand(652005);
 const dt = T / STEPS;
 const drift = (r - 0.5 * sigma * sigma) * dt;
 const diffusion = sigma * Math.sqrt(dt);

 const allPaths: number[][] = [];
 const allPayoffs: number[] = [];

 for (let p = 0; p < PATHS_VIS; p++) {
 const path: number[] = [S];
 let cur = S;
 for (let s = 0; s < STEPS; s++) {
 const z = boxMuller(rand);
 cur = cur * Math.exp(drift + diffusion * z);
 path.push(cur);
 }
 allPaths.push(path);
 const finalS = path[STEPS];
 const payoff = optType === "call" ? Math.max(finalS - K, 0) : Math.max(K - finalS, 0);
 allPayoffs.push(payoff * Math.exp(-r * T));
 }

 // Convergence table: running average at n=5,10,20,50,100
 const convergenceRows: { n: number; price: number }[] = [];
 for (const n of [5, 10, 20, 50, 100]) {
 const slice = allPayoffs.slice(0, n);
 convergenceRows.push({ n, price: slice.reduce((a, b) => a + b, 0) / slice.length });
 }

 const bsRef = blackScholes(S, K, T, r, sigma);
 const bsPrice = optType === "call" ? bsRef.call : bsRef.put;

 return { paths: allPaths, payoffs: allPayoffs, convergence: convergenceRows, bsPrice };
 }, [S, K, T, r, sigma, optType]);

 const mcPrice = payoffs.reduce((a, b) => a + b, 0) / payoffs.length;

 // SVG for paths
 const W = 440, H = 220;
 const allVals = paths.flat();
 const minV = Math.min(...allVals);
 const maxV = Math.max(...allVals);
 const scaleX = (i: number) => (i / STEPS) * W;
 const scaleY = (v: number) => H - ((v - minV) / (maxV - minV + 0.001)) * H;

 // Histogram of payoffs
 const maxPayoff = Math.max(...payoffs);
 const BINS = 20;
 const binWidth = maxPayoff / BINS;
 const hist = Array(BINS).fill(0);
 payoffs.forEach(p => {
 const b = Math.min(Math.floor(p / binWidth), BINS - 1);
 hist[b]++;
 });
 const maxHist = Math.max(...hist);

 return (
 <div className="flex flex-col gap-3 p-4">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-1 bg-card rounded-md border border-border p-4 flex flex-col gap-4">
 <h3 className="text-sm font-medium text-muted-foreground">Parameters (100 paths)</h3>
 <SliderRow label="Spot Price (S)" value={S} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setS} />
 <SliderRow label="Strike Price (K)" value={K} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setK} />
 <SliderRow label="Time to Expiry (T)" value={T} min={0.05} max={2} step={0.05}
 format={v => `${v.toFixed(2)} yr`} onChange={setT} />
 <SliderRow label="Risk-Free Rate (r)" value={r} min={0} max={0.15} step={0.001}
 format={v => `${(v * 100).toFixed(1)}%`} onChange={setR} />
 <SliderRow label="Volatility (σ)" value={sigma} min={0.05} max={0.8} step={0.01}
 format={v => `${(v * 100).toFixed(0)}%`} onChange={setSigma} />
 <div className="flex gap-2">
 {(["call", "put"] as const).map(t => (
 <button key={t} onClick={() => setOptType(t)}
 className={`flex-1 py-1.5 rounded-lg text-xs text-muted-foreground font-medium transition-colors ${
 optType === t ? "bg-primary text-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
 }`}>
 {t.toUpperCase()}
 </button>
 ))}
 </div>

 <div className="grid grid-cols-2 gap-2 mt-2">
 <div className="bg-muted rounded-lg p-3 text-center">
 <div className="text-xs text-muted-foreground">MC Price</div>
 <div className="text-lg font-mono font-medium text-foreground">${mcPrice.toFixed(4)}</div>
 </div>
 <div className="bg-muted rounded-lg p-3 text-center">
 <div className="text-xs text-muted-foreground">BS Price</div>
 <div className="text-lg font-mono font-medium text-foreground">${bsPrice.toFixed(4)}</div>
 </div>
 </div>

 {/* Convergence table */}
 <div className="mt-2">
 <div className="text-xs text-muted-foreground mb-2">Convergence vs # Paths</div>
 <table className="w-full text-xs text-muted-foreground font-mono">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left pb-1 text-muted-foreground">N</th>
 <th className="text-right pb-1 text-muted-foreground">Price</th>
 <th className="text-right pb-1 text-muted-foreground">Error</th>
 </tr>
 </thead>
 <tbody>
 {convergence.map(row => (
 <tr key={row.n} className="border-b border-border/20">
 <td className="py-0.5 text-muted-foreground">{row.n}</td>
 <td className="text-right text-foreground">${row.price.toFixed(4)}</td>
 <td className={`text-right ${Math.abs(row.price - bsPrice) < 0.5 ? "text-emerald-400" : "text-amber-400"}`}>
 {Math.abs(row.price - bsPrice).toFixed(4)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="lg:col-span-2 flex flex-col gap-4">
 {/* Paths */}
 <div className="bg-card rounded-md border border-border p-4">
 <h3 className="text-sm font-medium text-muted-foreground mb-2">100 Simulated Stock Paths</h3>
 <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
 {/* Strike line */}
 <line x1={0} y1={scaleY(K)} x2={W} y2={scaleY(K)}
 stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />
 <text x={W - 4} y={scaleY(K) - 3} textAnchor="end" fill="#f59e0b" fontSize={9}>K={K}</text>

 {paths.map((path, pi) => {
 const isITM = optType === "call" ? path[STEPS] > K : path[STEPS] < K;
 return (
 <polyline key={pi}
 points={path.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join("")}
 fill="none"
 stroke={isITM ? "#34d399" : "#f87171"}
 strokeWidth={0.5}
 opacity={0.35}
 />
 );
 })}
 </svg>
 <div className="flex gap-4 text-xs text-muted-foreground mt-1">
 <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-400 inline-block" /> ITM at expiry</span>
 <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block" /> OTM at expiry</span>
 <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block border-dashed border-t" /> Strike K</span>
 </div>
 </div>

 {/* Payoff histogram */}
 <div className="bg-card rounded-md border border-border p-4">
 <h3 className="text-sm font-medium text-muted-foreground mb-2">Discounted Payoff Distribution</h3>
 <svg width="100%" viewBox={`0 0 ${W} 120`}>
 {hist.map((count, i) => {
 const bH = maxHist > 0 ? (count / maxHist) * 100 : 0;
 const bW = (W / BINS) - 2;
 return (
 <rect key={i}
 x={i * (W / BINS) + 1} y={110 - bH} width={bW} height={bH}
 fill="#6366f1" opacity={0.7} rx={1}
 />
 );
 })}
 <line x1={0} y1={110} x2={W} y2={110} stroke="#3f3f46" strokeWidth={1} />
 <text x={0} y={115} fill="#71717a" fontSize={9}>$0</text>
 <text x={W} y={115} fill="#71717a" fontSize={9} textAnchor="end">${maxPayoff.toFixed(1)}</text>
 </svg>
 </div>
 </div>
 </div>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 4: Exotic Options
// ═══════════════════════════════════════════════════════════════════════════════
function ExoticOptions() {
 const [S, setS] = useState(100);
 const [K, setK] = useState(100);
 const [T, setT] = useState(0.5);
 const [r, setR] = useState(0.05);
 const [sigma, setSigma] = useState(0.2);
 const [barrierH, setBarrierH] = useState(120);

 const STEPS = 252;

 function boxMuller(rand: () => number): number {
 const u1 = Math.max(rand(), 1e-10);
 const u2 = rand();
 return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
 }

 const results = useMemo(() => {
 const rand = makeRand(652005);
 const N_PATHS = 2000;
 const dt = T / STEPS;
 const drift = (r - 0.5 * sigma * sigma) * dt;
 const diffusion = sigma * Math.sqrt(dt);
 const df = Math.exp(-r * T);

 let asianCallSum = 0, asianPutSum = 0;
 let lookbackCallSum = 0, lookbackPutSum = 0;
 let barrierCallSum = 0;
 let vanillaCallSum = 0, vanillaPutSum = 0;

 for (let p = 0; p < N_PATHS; p++) {
 let cur = S;
 let sumPrice = S;
 let minPrice = S;
 let maxPrice = S;
 let hitBarrier = false;

 for (let s = 0; s < STEPS; s++) {
 const z = boxMuller(rand);
 cur = cur * Math.exp(drift + diffusion * z);
 sumPrice += cur;
 if (cur < minPrice) minPrice = cur;
 if (cur > maxPrice) maxPrice = cur;
 if (cur >= barrierH) hitBarrier = true;
 }

 const avgPrice = sumPrice / (STEPS + 1);
 asianCallSum += Math.max(avgPrice - K, 0) * df;
 asianPutSum += Math.max(K - avgPrice, 0) * df;
 lookbackCallSum += Math.max(maxPrice - K, 0) * df; // fixed strike lookback
 lookbackPutSum += Math.max(K - minPrice, 0) * df;
 barrierCallSum += hitBarrier ? 0 : Math.max(cur - K, 0) * df; // down-and-out call (knock-out if above barrier)
 vanillaCallSum += Math.max(cur - K, 0) * df;
 vanillaPutSum += Math.max(K - cur, 0) * df;
 }

 const vanillaCall = vanillaCallSum / N_PATHS;
 const vanillaPut = vanillaPutSum / N_PATHS;
 const asianCall = asianCallSum / N_PATHS;
 const asianPut = asianPutSum / N_PATHS;
 const lookbackCall = lookbackCallSum / N_PATHS;
 const lookbackPut = lookbackPutSum / N_PATHS;
 const barrierCall = barrierCallSum / N_PATHS;

 const bsRef = blackScholes(S, K, T, r, sigma);

 return { vanillaCall, vanillaPut, asianCall, asianPut, lookbackCall, lookbackPut, barrierCall, bsCall: bsRef.call, bsPut: bsRef.put };
 }, [S, K, T, r, sigma, barrierH]);

 const rows = [
 { name: "Vanilla Call (BS)", price: results.bsCall, formula: "max(S_T − K, 0)", note: "Standard European" },
 { name: "Vanilla Put (BS)", price: results.bsPut, formula: "max(K − S_T, 0)", note: "Standard European" },
 { name: "Asian Call (avg price)", price: results.asianCall, formula: "max(Ā − K, 0)", note: "Ā = arithmetic avg of path" },
 { name: "Asian Put (avg price)", price: results.asianPut, formula: "max(K − Ā, 0)", note: "Lower vol → cheaper premium" },
 { name: "Lookback Call (fixed)", price: results.lookbackCall, formula: "max(S_max − K, 0)", note: "Hindsight on max" },
 { name: "Lookback Put (fixed)", price: results.lookbackPut, formula: "max(K − S_min, 0)", note: "Hindsight on min" },
 { name: `Barrier Call (knock-out H=${barrierH})`, price: results.barrierCall, formula: "Call if never hit H", note: "Up-and-out knock-out" },
 ];

 return (
 <div className="flex flex-col gap-3 p-4">
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
 <div className="bg-card rounded-md border border-border p-4 flex flex-col gap-4">
 <h3 className="text-sm font-medium text-muted-foreground">Parameters (MC 2000 paths)</h3>
 <SliderRow label="Spot Price (S)" value={S} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setS} />
 <SliderRow label="Strike Price (K)" value={K} min={50} max={200} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setK} />
 <SliderRow label="Time to Expiry (T)" value={T} min={0.05} max={2} step={0.05}
 format={v => `${v.toFixed(2)} yr`} onChange={setT} />
 <SliderRow label="Risk-Free Rate (r)" value={r} min={0} max={0.15} step={0.001}
 format={v => `${(v * 100).toFixed(1)}%`} onChange={setR} />
 <SliderRow label="Volatility (σ)" value={sigma} min={0.05} max={0.8} step={0.01}
 format={v => `${(v * 100).toFixed(0)}%`} onChange={setSigma} />
 <SliderRow label="Barrier Level (H)" value={barrierH} min={S + 1} max={S * 2} step={1}
 format={v => `$${v.toFixed(0)}`} onChange={setBarrierH} />
 </div>

 <div className="lg:col-span-3 bg-card rounded-md border border-border p-4">
 <h3 className="text-sm font-medium text-muted-foreground mb-3">Exotic Options Comparison</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left pb-2 text-muted-foreground text-xs">Option Type</th>
 <th className="text-left pb-2 text-muted-foreground text-xs">Payoff Formula</th>
 <th className="text-right pb-2 text-muted-foreground text-xs">Price</th>
 <th className="text-right pb-2 text-muted-foreground text-xs">vs Vanilla</th>
 <th className="text-left pb-2 text-muted-foreground text-xs pl-3">Note</th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row, i) => {
 const ref = i < 2 ? null : (i % 2 === 0 ? results.vanillaCall : results.vanillaPut);
 const diff = ref !== null ? row.price - ref : null;
 return (
 <tr key={i} className="border-b border-border/20 hover:bg-muted/30">
 <td className="py-2 text-foreground text-xs font-medium">{row.name}</td>
 <td className="py-2 text-muted-foreground font-mono text-xs">{row.formula}</td>
 <td className="py-2 text-right font-mono font-medium text-foreground">${row.price.toFixed(4)}</td>
 <td className="py-2 text-right font-mono text-xs text-muted-foreground">
 {diff !== null ? (
 <span className={diff >= 0 ? "text-amber-400" : "text-emerald-400"}>
 {diff >= 0 ? "+" : ""}{diff.toFixed(4)}
 </span>
 ) : <span className="text-muted-foreground">—</span>}
 </td>
 <td className="py-2 pl-3 text-muted-foreground text-xs">{row.note}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <div className="mt-4 text-xs text-muted-foreground">
 Priced via Monte Carlo (2,000 paths, 252 steps/year). Asian options use arithmetic average price.
 Lookback uses fixed strike. Barrier is up-and-out (knocked out if S ever ≥ H).
 </div>
 </div>
 </div>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 5: Interest Rate Models
// ═══════════════════════════════════════════════════════════════════════════════
function InterestRateModels() {
 const [r0, setR0] = useState(0.05);
 const [kappa, setKappa] = useState(0.5);
 const [theta, setTheta] = useState(0.04);
 const [vasicekSigma, setVasicekSigma] = useState(0.01);
 const [faceValue, setFaceValue] = useState(1000);

 const T_MAX = 10;
 const N_STEPS = 200;
 const N_PATHS = 8;

 function boxMuller(rand: () => number): number {
 const u1 = Math.max(rand(), 1e-10);
 const u2 = rand();
 return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
 }

 const { paths, yieldCurve, bondPrices } = useMemo(() => {
 const rand = makeRand(652005);
 const dt = T_MAX / N_STEPS;

 // Simulate Vasicek paths
 const allPaths: number[][] = [];
 for (let p = 0; p < N_PATHS; p++) {
 const path = [r0];
 let rCur = r0;
 for (let s = 0; s < N_STEPS; s++) {
 const z = boxMuller(rand);
 rCur = rCur + kappa * (theta - rCur) * dt + vasicekSigma * Math.sqrt(dt) * z;
 path.push(rCur);
 }
 allPaths.push(path);
 }

 // Vasicek analytical zero-coupon bond: P(0,T) = A(T) * exp(-B(T)*r0)
 // B(T) = (1 - e^(-kT)) / k
 // A(T) = exp[(B(T)-T)(kappa^2 * theta - sigma^2/2) / kappa^2 - sigma^2 * B(T)^2 / (4*kappa)]
 const yieldCurve: { T: number; yield: number }[] = [];
 const bondPrices: { T: number; price: number }[] = [];
 for (let ti = 1; ti <= 20; ti++) {
 const Tv = ti * 0.5;
 const B = kappa > 0.0001 ? (1 - Math.exp(-kappa * Tv)) / kappa : Tv;
 const sigSq = vasicekSigma * vasicekSigma;
 const kappaSq = kappa * kappa;
 const lnA = kappaSq > 0.0001
 ? (B - Tv) * (kappa * kappa * theta - sigSq / 2) / kappaSq - (sigSq * B * B) / (4 * kappa)
 : 0;
 const P = Math.exp(lnA - B * r0);
 const yld = Tv > 0 ? -Math.log(Math.max(P, 1e-10)) / Tv : r0;
 yieldCurve.push({ T: Tv, yield: yld });
 bondPrices.push({ T: Tv, price: faceValue * P });
 }

 return { paths: allPaths, yieldCurve, bondPrices };
 }, [r0, kappa, theta, vasicekSigma, faceValue]);

 // SVG for paths
 const W = 440, H = 220;
 const allVals = paths.flat();
 const minR = Math.min(...allVals, 0);
 const maxR = Math.max(...allVals, 0.15);
 const scaleX = (i: number) => (i / N_STEPS) * W;
 const scaleY = (v: number) => H - ((v - minR) / (maxR - minR + 0.001)) * H;

 // Yield curve SVG
 const maxYield = Math.max(...yieldCurve.map(y => y.yield));
 const minYield = Math.min(...yieldCurve.map(y => y.yield));
 const ycScaleX = (T: number) => (T / 10) * (W - 20) + 10;
 const ycScaleY = (y: number) =>
 H - 10 - ((y - minYield) / (maxYield - minYield + 0.001)) * (H - 20);

 const colors = ["#6366f1", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#38bdf8", "#fb923c", "#4ade80"];

 return (
 <div className="flex flex-col gap-3 p-4">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="bg-card rounded-md border border-border p-4 flex flex-col gap-4">
 <h3 className="text-sm font-medium text-muted-foreground">Vasicek Model Parameters</h3>
 <div className="text-xs text-muted-foreground">dr = κ(θ−r)dt + σdW</div>
 <SliderRow label="Initial Rate (r₀)" value={r0} min={0.001} max={0.15} step={0.001}
 format={v => `${(v * 100).toFixed(2)}%`} onChange={setR0} />
 <SliderRow label="Mean Reversion Speed (κ)" value={kappa} min={0.01} max={2} step={0.01}
 format={v => v.toFixed(2)} onChange={setKappa} />
 <SliderRow label="Long-Run Mean (θ)" value={theta} min={0.001} max={0.15} step={0.001}
 format={v => `${(v * 100).toFixed(2)}%`} onChange={setTheta} />
 <SliderRow label="Volatility (σ)" value={vasicekSigma} min={0.001} max={0.05} step={0.001}
 format={v => `${(v * 100).toFixed(2)}%`} onChange={setVasicekSigma} />
 <SliderRow label="Face Value ($)" value={faceValue} min={100} max={10000} step={100}
 format={v => `$${v.toFixed(0)}`} onChange={setFaceValue} />

 <div className="mt-2 text-xs text-muted-foreground font-medium">Selected Bond Prices (Analytical)</div>
 <div className="grid grid-cols-2 gap-2">
 {[1, 2, 5, 10].map(yr => {
 const row = bondPrices.find(b => b.T === yr);
 return (
 <div key={yr} className="bg-muted rounded-lg p-2 text-center">
 <div className="text-xs text-muted-foreground">{yr}Y Bond</div>
 <div className="font-mono text-sm text-foreground">${row ? row.price.toFixed(2) : "—"}</div>
 <div className="text-xs text-muted-foreground">
 {row ? `y: ${(yieldCurve.find(y => y.T === yr)?.yield ?? 0 * 100).toFixed(2)}%` : ""}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="lg:col-span-2 flex flex-col gap-4">
 {/* Short rate paths */}
 <div className="bg-card rounded-md border border-border p-4">
 <h3 className="text-sm font-medium text-muted-foreground mb-2">Vasicek Short Rate Paths (8 simulations)</h3>
 <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
 {/* Long-run mean line */}
 <line x1={0} y1={scaleY(theta)} x2={W} y2={scaleY(theta)}
 stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
 <text x={W - 4} y={scaleY(theta) - 3} textAnchor="end" fill="#f59e0b" fontSize={9}>
 θ={`${(theta * 100).toFixed(1)}%`}
 </text>

 {paths.map((path, pi) => (
 <polyline key={pi}
 points={path.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join("")}
 fill="none"
 stroke={colors[pi % colors.length]}
 strokeWidth={1}
 opacity={0.7}
 />
 ))}

 {/* Y axis ticks */}
 {[0, 0.05, 0.1, 0.15].filter(v => v >= minR && v <= maxR).map(v => (
 <g key={v}>
 <line x1={0} y1={scaleY(v)} x2={6} y2={scaleY(v)} stroke="#3f3f46" />
 <text x={8} y={scaleY(v) + 3} fill="#71717a" fontSize={8}>{(v * 100).toFixed(0)}%</text>
 </g>
 ))}

 {/* X axis ticks */}
 {[0, 2, 4, 6, 8, 10].map(t => (
 <text key={t} x={scaleX((t / T_MAX) * N_STEPS)} y={H - 2}
 textAnchor="middle" fill="#71717a" fontSize={8}>{t}Y</text>
 ))}
 </svg>
 </div>

 {/* Yield curve */}
 <div className="bg-card rounded-md border border-border p-4">
 <h3 className="text-sm font-medium text-muted-foreground mb-2">Zero-Coupon Yield Curve</h3>
 <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
 <polyline
 points={yieldCurve.map(y => `${ycScaleX(y.T)},${ycScaleY(y.yield)}`).join("")}
 fill="none" stroke="#6366f1" strokeWidth={2}
 />
 {yieldCurve.map((y, i) => (
 <circle key={i} cx={ycScaleX(y.T)} cy={ycScaleY(y.yield)} r={2.5}
 fill="#6366f1" opacity={0.8} />
 ))}
 {/* Axis labels */}
 {[1, 2, 3, 5, 7, 10].map(t => (
 <text key={t} x={ycScaleX(t)} y={H - 2} textAnchor="middle" fill="#71717a" fontSize={8}>{t}Y</text>
 ))}
 {[minYield, (minYield + maxYield) / 2, maxYield].map((v, i) => (
 <text key={i} x={4} y={ycScaleY(v) + 3} fill="#71717a" fontSize={8}>
 {(v * 100).toFixed(2)}%
 </text>
 ))}
 <line x1={10} y1={H - 10} x2={W - 10} y2={H - 10} stroke="#3f3f46" strokeWidth={1} />
 </svg>
 <div className="text-xs text-muted-foreground mt-1">
 Vasicek analytical zero-coupon yields. κ={kappa.toFixed(2)}, θ={(theta * 100).toFixed(2)}%, σ={(vasicekSigma * 100).toFixed(2)}%
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════════
export default function DerivativesPricingPage() {
 return (
 <div className="min-h-screen bg-background text-foreground">
 <div className="max-w-7xl mx-auto px-4 py-6">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="border-l-4 border-l-primary rounded-lg bg-card p-6 flex items-center gap-3 mb-6"
 >
 <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-600/30">
 </div>
 <div>
 <h1 className="text-xl font-medium">Derivatives Pricing Laboratory</h1>
 <p className="text-sm text-muted-foreground">Black-Scholes, Binomial Trees, Monte Carlo, Exotic Options, Interest Rate Models</p>
 </div>
 <div className="ml-auto flex gap-2">
 <Badge variant="outline" className="border-indigo-700 text-indigo-400 text-xs">Interactive</Badge>
 <Badge variant="outline" className="border-border text-muted-foreground text-xs">Pure SVG</Badge>
 </div>
 </motion.div>

 {/* Tabs */}
 <Tabs defaultValue="bs" className="w-full mt-8">
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-4">
 <TabsTrigger value="bs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Black-Scholes Lab
 </TabsTrigger>
 <TabsTrigger value="binomial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Binomial Tree
 </TabsTrigger>
 <TabsTrigger value="mc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Monte Carlo
 </TabsTrigger>
 <TabsTrigger value="exotic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Exotic Options
 </TabsTrigger>
 <TabsTrigger value="rates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Interest Rate Models
 </TabsTrigger>
 </TabsList>

 <TabsContent value="bs" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
 <BSLab />
 </motion.div>
 </TabsContent>
 <TabsContent value="binomial" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
 <BinomialTree />
 </motion.div>
 </TabsContent>
 <TabsContent value="mc" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
 <MonteCarlo />
 </motion.div>
 </TabsContent>
 <TabsContent value="exotic" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
 <ExoticOptions />
 </motion.div>
 </TabsContent>
 <TabsContent value="rates" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
 <InterestRateModels />
 </motion.div>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
