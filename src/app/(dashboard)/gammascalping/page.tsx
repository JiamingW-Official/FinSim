"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart2,
  TrendingUp,
  Shield,
  Zap,
  Info,
  ArrowUpDown,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// ─── PRNG ─────────────────────────────────────────────────────────────────────
let s = 890;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ─── Black-Scholes helpers ────────────────────────────────────────────────────
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

function bsmDelta(S: number, K: number, T: number, sigma: number, r: number, isCall: boolean): number {
  const Ty = Math.max(T / 365, 0.0001);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * Math.sqrt(Ty));
  return isCall ? normalCDF(d1) : normalCDF(d1) - 1;
}

function bsmGamma(S: number, K: number, T: number, sigma: number, r: number): number {
  const Ty = Math.max(T / 365, 0.0001);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * Math.sqrt(Ty));
  return normalPDF(d1) / (S * sigma * Math.sqrt(Ty));
}

function bsmTheta(S: number, K: number, T: number, sigma: number, r: number, isCall: boolean): number {
  const Ty = Math.max(T / 365, 0.0001);
  const sqrtT = Math.sqrt(Ty);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const term1 = -(S * normalPDF(d1) * sigma) / (2 * sqrtT);
  const term2 = isCall
    ? -r * K * Math.exp(-r * Ty) * normalCDF(d2)
    : r * K * Math.exp(-r * Ty) * normalCDF(-d2);
  return (term1 + term2) / 365;
}

// ─── Generate seeded stock path ───────────────────────────────────────────────
function generateStockPath(n: number, S0: number, mu: number, sigma: number, dt: number): number[] {
  const path = [S0];
  for (let i = 1; i < n; i++) {
    const z = (rand() + rand() + rand() - 1.5) * 1.1547; // approx normal
    path.push(path[i - 1] * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z));
  }
  return path;
}

// ─── Pre-generate all seeded data ─────────────────────────────────────────────
const SPOT = 100;
const SIGMA_IV = 0.25;
const SIGMA_REAL = 0.32;
const RATE = 0.05;
const T_DAYS = 30;
const DT = 1 / 252;

// Tab 1: stock path 20 bars for hedge viz
const hedgePath20 = generateStockPath(20, SPOT, 0.05, SIGMA_REAL, DT);

// Tab 2: gamma scalping simulation 100 bars, 15 hedge points
const scalpPath = generateStockPath(100, SPOT, 0.0, SIGMA_REAL, DT);

// Tab 3: 2-year implied vs realized vol
const IV_HIST = Array.from({ length: 24 }, (_, i) => {
  const base = 0.20 + rand() * 0.12;
  return { month: i, iv: base, rv: base - 0.03 + (rand() - 0.5) * 0.08 };
});

// Tab 4: MM daily P&L breakdown (20 days)
const MM_DAILY = Array.from({ length: 20 }, (_, i) => {
  const gammaIncome = (rand() * 1200 + 200);
  const thetaDecay = -(rand() * 800 + 300);
  const vegaMove = (rand() - 0.5) * 600;
  const deltaResidual = (rand() - 0.5) * 400;
  return {
    day: i + 1,
    gamma: gammaIncome,
    theta: thetaDecay,
    vega: vegaMove,
    delta: deltaResidual,
    total: gammaIncome + thetaDecay + vegaMove + deltaResidual,
  };
});

// ─── Helper: SVG coordinate mapping ──────────────────────────────────────────
function mapX(i: number, n: number, w: number, pad: number): number {
  return pad + (i / (n - 1)) * (w - 2 * pad);
}
function mapY(v: number, min: number, max: number, h: number, pad: number): number {
  return h - pad - ((v - min) / (max - min)) * (h - 2 * pad);
}

// ─── Tab 1: Delta Hedging Mechanics ──────────────────────────────────────────
function DeltaHedgingTab() {
  const [hedgeFreq, setHedgeFreq] = useState(5);

  const hedgePoints = useMemo(() => {
    const points: { idx: number; price: number; delta: number; hedge: number }[] = [];
    let hedgePos = 0;
    for (let i = 0; i < hedgePath20.length; i++) {
      if (i % hedgeFreq === 0) {
        const T = Math.max(T_DAYS - i, 1);
        const d = bsmDelta(hedgePath20[i], SPOT, T, SIGMA_IV, RATE, true);
        hedgePos = d;
        points.push({ idx: i, price: hedgePath20[i], delta: d, hedge: hedgePos });
      }
    }
    return points;
  }, [hedgeFreq]);

  const pMin = Math.min(...hedgePath20) - 1;
  const pMax = Math.max(...hedgePath20) + 1;
  const W = 560, H = 180, PAD = 30;

  // Gamma/theta grid (seeded)
  const gridData = useMemo(() => {
    let gs = 890;
    const rg = () => {
      gs = (gs * 1103515245 + 12345) & 0x7fffffff;
      return gs / 0x7fffffff;
    };
    return Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => {
        const g = rg() * 120 - 20;
        return { gamma: g, theta: -(rg() * 80 + 10), net: g * (0.8 + rg() * 0.4) };
      })
    );
  }, []);

  const tCostData = [1, 2, 3, 5, 10, 20].map((freq) => {
    const cost = (20 / freq) * 0.05 * SPOT * 0.01;
    const trackingErr = freq * 0.8;
    return { freq, cost, trackingErr };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-primary" />
          Delta Hedging Fundamentals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-primary/10 border border-border rounded-lg p-3">
            <div className="text-primary font-medium mb-1">Delta = Hedge Ratio</div>
            <div className="text-muted-foreground text-xs leading-relaxed">
              Delta measures how much an option's price changes per $1 move in the underlying.
              A delta of 0.6 means hold 60 shares short per 1 call to be delta-neutral.
            </div>
          </div>
          <div className="bg-primary/10 border border-border rounded-lg p-3">
            <div className="text-primary font-medium mb-1">Hedge P&amp;L Formula</div>
            <div className="text-muted-foreground text-xs font-mono leading-relaxed">
              ΔP&amp;L ≈ ½ × Γ × (ΔS)² − Θ × Δt<br />
              <span className="text-muted-foreground">Gamma income minus theta bleed</span>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="text-amber-300 font-medium mb-1">Continuous vs Discrete</div>
            <div className="text-muted-foreground text-xs leading-relaxed">
              Continuous hedging is theoretically perfect but incurs infinite transaction costs.
              Discrete hedging introduces tracking error proportional to Γ × ΔS².
            </div>
          </div>
        </div>
      </div>

      {/* Stock path + hedge adjustment SVG */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground font-medium">Stock Path with Hedge Rebalances</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Hedge every</span>
            <input
              type="range"
              min={1}
              max={10}
              value={hedgeFreq}
              onChange={(e) => setHedgeFreq(Number(e.target.value))}
              className="w-24 accent-blue-400"
            />
            <span className="text-foreground font-medium w-12">{hedgeFreq} bars</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD}
              x2={W - PAD}
              y1={PAD + t * (H - 2 * PAD)}
              y2={PAD + t * (H - 2 * PAD)}
              stroke="#ffffff10"
              strokeDasharray="4 4"
            />
          ))}
          {/* Price path */}
          <polyline
            points={hedgePath20.map((p, i) => `${mapX(i, 20, W, PAD)},${mapY(p, pMin, pMax, H, PAD)}`).join(" ")}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={2}
          />
          {/* Hedge adjustment markers */}
          {hedgePoints.map((hp) => (
            <g key={hp.idx}>
              <circle
                cx={mapX(hp.idx, 20, W, PAD)}
                cy={mapY(hp.price, pMin, pMax, H, PAD)}
                r={5}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={1}
              />
              <text
                x={mapX(hp.idx, 20, W, PAD)}
                y={mapY(hp.price, pMin, pMax, H, PAD) - 8}
                textAnchor="middle"
                fontSize={9}
                fill="#fbbf24"
              >
                Δ={hp.delta.toFixed(2)}
              </text>
            </g>
          ))}
          {/* Axis labels */}
          <text x={PAD} y={H - 6} fontSize={10} fill="#64748b">Bar 0</text>
          <text x={W - PAD} y={H - 6} fontSize={10} fill="#64748b" textAnchor="end">Bar 19</text>
          <text x={PAD - 4} y={PAD + 4} fontSize={10} fill="#94a3b8" textAnchor="end">${pMax.toFixed(0)}</text>
          <text x={PAD - 4} y={H - PAD} fontSize={10} fill="#94a3b8" textAnchor="end">${pMin.toFixed(0)}</text>
        </svg>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Price path</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Hedge rebalance (delta shown)</span>
          <span className="text-muted-foreground">Rebalances: {hedgePoints.length} | Transaction cost ≈ ${(hedgePoints.length * 0.05 * SPOT * 0.01).toFixed(2)}</span>
        </div>
      </div>

      {/* Transaction cost vs hedge frequency */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">Transaction Cost vs Hedge Frequency Tradeoff</h3>
        <svg viewBox="0 0 560 160" className="w-full" style={{ height: 160 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={40} x2={530} y1={20 + t * 120} y2={20 + t * 120} stroke="#ffffff10" strokeDasharray="4 4" />
          ))}
          {/* Transaction cost (decreases with less frequent hedging) */}
          {tCostData.map((d, i) => {
            const x = 40 + i * 98;
            const costH = (d.cost / 1) * 100;
            const errH = (d.trackingErr / 18) * 100;
            return (
              <g key={i}>
                <rect x={x} y={140 - costH} width={30} height={costH} fill="#ef444466" />
                <rect x={x + 32} y={140 - errH} width={30} height={errH} fill="#8b5cf666" />
                <text x={x + 30} y={155} fontSize={9} fill="#64748b" textAnchor="middle">{d.freq}b</text>
              </g>
            );
          })}
          <text x={40} y={15} fontSize={10} fill="#ef4444">Transaction Cost</text>
          <text x={200} y={15} fontSize={10} fill="#8b5cf6">Tracking Error</text>
          <text x={400} y={15} fontSize={10} fill="#64748b">←Optimal zone→</text>
          <line x1={310} x2={420} y1={20} y2={140} stroke="#22c55e40" strokeWidth={20} />
        </svg>
        <p className="text-xs text-muted-foreground mt-2">Hedge too frequently → high transaction costs. Hedge too rarely → large gamma P&amp;L tracking error. Optimal frequency depends on gamma × (ΔS)² vs bid-ask spread.</p>
      </div>

      {/* Gamma vs Theta daily grid */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">Gamma vs Theta Daily P&amp;L Grid ($ per 100-share lot)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">DTE / ΔS%</th>
                {["1%", "2%", "3%", "4%", "5%"].map((h) => (
                  <th key={h} className="text-center py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[30, 21, 14, 7, 1].map((dte, row) => (
                <tr key={dte} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-muted-foreground font-medium">{dte} DTE</td>
                  {gridData[row].map((cell, col) => (
                    <td key={col} className="py-2 px-3 text-center">
                      <span className={`font-mono ${cell.net > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {cell.net > 0 ? "+" : ""}{cell.net.toFixed(0)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Net of gamma income and theta decay. Short DTE positions have highest gamma sensitivity.</p>
      </div>
    </div>
  );
}

// ─── Tab 2: Gamma P&L ─────────────────────────────────────────────────────────
function GammaPnLTab() {
  // Gamma scalping sim: 100 bars, hedge every ~7 bars
  const HEDGE_INTERVAL = 7;
  const simK = SPOT;
  const simT0 = T_DAYS;

  const simulation = useMemo(() => {
    let cumulativePnL = 0;
    let lastHedgeIdx = 0;
    let lastHedgeDelta = bsmDelta(scalpPath[0], simK, simT0, SIGMA_IV, RATE, true);
    const hedgeEvents: { idx: number; price: number; pnl: number; cumPnL: number; delta: number }[] = [];
    const pnlByAdjustment: { dS: number; pnl: number }[] = [];

    for (let i = 1; i < scalpPath.length; i++) {
      const T = Math.max(simT0 - i * (simT0 / scalpPath.length), 1);
      if (i % HEDGE_INTERVAL === 0 || i === scalpPath.length - 1) {
        const dS = scalpPath[i] - scalpPath[lastHedgeIdx];
        const gamma = bsmGamma(scalpPath[lastHedgeIdx], simK, T, SIGMA_IV, RATE);
        const theta = bsmTheta(scalpPath[lastHedgeIdx], simK, T, SIGMA_IV, RATE, true);
        const dt = (i - lastHedgeIdx) / 252;
        const hedgePnL = 0.5 * gamma * dS * dS * 100 + theta * dt * 100;
        cumulativePnL += hedgePnL;
        const newDelta = bsmDelta(scalpPath[i], simK, T, SIGMA_IV, RATE, true);
        hedgeEvents.push({ idx: i, price: scalpPath[i], pnl: hedgePnL, cumPnL: cumulativePnL, delta: newDelta });
        pnlByAdjustment.push({ dS: Math.abs(dS), pnl: hedgePnL });
        lastHedgeDelta = newDelta;
        lastHedgeIdx = i;
      }
    }
    return { hedgeEvents, pnlByAdjustment, finalPnL: cumulativePnL };
  }, []);

  const pMin = Math.min(...scalpPath) - 1;
  const pMax = Math.max(...scalpPath) + 1;
  const W = 560, H = 180, PAD = 35;

  // Long gamma profit zone SVG (realized vol > implied vol)
  const profitZoneVols = Array.from({ length: 50 }, (_, i) => {
    const rv = 0.05 + i * 0.01;
    const pnl = (rv - SIGMA_IV) * 100 * 50; // simplified
    return { rv, pnl };
  });

  const cumPnLMin = Math.min(...simulation.hedgeEvents.map((e) => e.cumPnL));
  const cumPnLMax = Math.max(...simulation.hedgeEvents.map((e) => e.cumPnL));

  return (
    <div className="space-y-6">
      {/* Key concept */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          Gamma P&amp;L Decomposition
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-sm font-medium mb-2">P&amp;L Formula</div>
            <div className="bg-muted rounded-lg p-3 font-mono text-sm space-y-1">
              <div className="text-emerald-400">Gamma P&amp;L = ½ × Γ × (ΔS)²</div>
              <div className="text-red-400">Theta Decay = Θ × Δt</div>
              <div className="text-primary border-t border-border pt-1 mt-1">Net = Gamma − |Theta|</div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <div>• Breakeven realized vol: σ_R = σ_IV when Γ-income = Θ-decay</div>
              <div>• Exact breakeven: σ_R² = σ_IV² ↔ need RV = IV</div>
              <div>• If RV &gt; IV: long gamma profits; if RV &lt; IV: short gamma profits</div>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm font-medium mb-2">Long Gamma Profit Zone</div>
            <svg viewBox="0 0 260 130" className="w-full">
              <line x1={30} x2={250} y1={65} y2={65} stroke="#ffffff20" />
              <line x1={30} x2={30} y1={15} y2={115} stroke="#ffffff20" />
              {profitZoneVols.slice(0, 50).map((pt, i) => {
                const x = 30 + i * 4.4;
                const y = 65 - (pt.pnl / 50);
                return i > 0 ? (
                  <line
                    key={i}
                    x1={30 + (i - 1) * 4.4}
                    x2={x}
                    y1={65 - (profitZoneVols[i - 1].pnl / 50)}
                    y2={y}
                    stroke={pt.pnl > 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth={2}
                  />
                ) : null;
              })}
              {/* IV marker */}
              <line x1={30 + 20 * 4.4} x2={30 + 20 * 4.4} y1={15} y2={115} stroke="#f59e0b" strokeDasharray="3 3" />
              <text x={30 + 20 * 4.4 + 3} y={25} fontSize={9} fill="#f59e0b">IV=25%</text>
              <text x={35} y={12} fontSize={9} fill="#22c55e">Profit (RV&gt;IV)</text>
              <text x={35} y={125} fontSize={9} fill="#ef4444">Loss (RV&lt;IV)</text>
              <text x={250} y={70} fontSize={9} fill="#64748b" textAnchor="end">RV →</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Gamma scalping simulation */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground font-medium">Gamma Scalping Simulation (ATM Call, 30 DTE)</h3>
          <div className={`text-sm font-mono font-semibold px-3 py-1 rounded-full ${simulation.finalPnL >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            Net P&amp;L: {simulation.finalPnL >= 0 ? "+" : ""}{simulation.finalPnL.toFixed(2)}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - 2 * PAD)} y2={PAD + t * (H - 2 * PAD)} stroke="#ffffff08" strokeDasharray="3 3" />
          ))}
          {/* Stock path */}
          <polyline
            points={scalpPath.map((p, i) => `${mapX(i, 100, W, PAD)},${mapY(p, pMin, pMax, H, PAD)}`).join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1.5}
          />
          {/* Hedge events */}
          {simulation.hedgeEvents.map((ev) => (
            <g key={ev.idx}>
              <circle
                cx={mapX(ev.idx, 100, W, PAD)}
                cy={mapY(ev.price, pMin, pMax, H, PAD)}
                r={4}
                fill={ev.pnl >= 0 ? "#22c55e" : "#ef4444"}
                stroke="#0f172a"
                strokeWidth={1}
              />
            </g>
          ))}
          <text x={PAD} y={H - 4} fontSize={9} fill="#64748b">0</text>
          <text x={W - PAD} y={H - 4} fontSize={9} fill="#64748b" textAnchor="end">100</text>
          <text x={PAD - 3} y={PAD + 4} fontSize={9} fill="#94a3b8" textAnchor="end">${pMax.toFixed(0)}</text>
          <text x={PAD - 3} y={H - PAD} fontSize={9} fill="#94a3b8" textAnchor="end">${pMin.toFixed(0)}</text>
        </svg>

        {/* Hedge event table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-1.5 pr-3">Bar</th>
                <th className="text-right py-1.5 pr-3">Price</th>
                <th className="text-right py-1.5 pr-3">Delta</th>
                <th className="text-right py-1.5 pr-3">Hedge P&amp;L</th>
                <th className="text-right py-1.5">Cum P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {simulation.hedgeEvents.slice(0, 15).map((ev) => (
                <tr key={ev.idx} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-1.5 pr-3 text-muted-foreground">{ev.idx}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-foreground">${ev.price.toFixed(2)}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-primary">{ev.delta.toFixed(3)}</td>
                  <td className={`py-1.5 pr-3 text-right font-mono ${ev.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {ev.pnl >= 0 ? "+" : ""}{ev.pnl.toFixed(2)}
                  </td>
                  <td className={`py-1.5 text-right font-mono ${ev.cumPnL >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {ev.cumPnL >= 0 ? "+" : ""}{ev.cumPnL.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* P&L scatter: delta adjustment vs P&L */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">P&amp;L vs Hedge Adjustment Size (|ΔS|)</h3>
        <svg viewBox="0 0 560 160" className="w-full" style={{ height: 160 }}>
          <line x1={40} x2={530} y1={80} y2={80} stroke="#ffffff20" />
          <line x1={40} x2={40} y1={20} y2={145} stroke="#ffffff20" />
          {simulation.pnlByAdjustment.map((pt, i) => {
            const x = 40 + (pt.dS / 6) * 490;
            const y = 80 - (pt.pnl / 10);
            return (
              <circle
                key={i}
                cx={Math.min(530, x)}
                cy={Math.max(20, Math.min(145, y))}
                r={4}
                fill={pt.pnl >= 0 ? "#22c55e80" : "#ef444480"}
                stroke={pt.pnl >= 0 ? "#22c55e" : "#ef4444"}
                strokeWidth={1}
              />
            );
          })}
          <text x={535} y={83} fontSize={9} fill="#64748b">|ΔS| →</text>
          <text x={44} y={18} fontSize={9} fill="#22c55e">Profit</text>
          <text x={44} y={150} fontSize={9} fill="#ef4444">Loss</text>
          <text x={285} y={155} fontSize={9} fill="#64748b" textAnchor="middle">Hedge rebalance size (absolute $)</text>
        </svg>
        <p className="text-xs text-muted-foreground mt-2">Larger stock moves generate more gamma income. The quadratic relationship (½Γ(ΔS)²) means big moves are disproportionately profitable for long gamma.</p>
      </div>
    </div>
  );
}

// ─── Tab 3: Vol Arbitrage ──────────────────────────────────────────────────────
function VolArbitrageTab() {
  const [selectedStrategy, setSelectedStrategy] = useState(0);

  const strategies = [
    { name: "Long Gamma", desc: "Buy options, delta hedge — profit if RV > IV", side: "long", color: "emerald" },
    { name: "Short Gamma", desc: "Sell options, delta hedge — profit if RV < IV", side: "short", color: "amber" },
    { name: "Vol Surface Arb", desc: "Trade mispricings across strikes/expiries", side: "neutral", color: "blue" },
    { name: "Calendar Spread", desc: "Long near-dated vol vs short far-dated vol", side: "neutral", color: "purple" },
  ];

  const volPremium = IV_HIST.map((d) => ({ month: d.month, premium: d.iv - d.rv }));
  const avgPremium = volPremium.reduce((a, b) => a + b.premium, 0) / volPremium.length;

  const W = 560, H = 160, PAD = 35;
  const ivMin = Math.min(...IV_HIST.map((d) => d.rv)) - 0.02;
  const ivMax = Math.max(...IV_HIST.map((d) => d.iv)) + 0.02;

  // Vol surface data (strike x expiry)
  const surfaceStrikes = [85, 90, 95, 100, 105, 110, 115];
  const surfaceExpiries = ["1W", "2W", "1M", "2M", "3M"];
  const surfaceIV = surfaceStrikes.map((k) =>
    surfaceExpiries.map((_, ei) => {
      const moneyness = Math.abs(Math.log(k / 100));
      const skew = k < 100 ? 0.03 : -0.01;
      const term = ei * 0.01;
      return 0.22 + moneyness * 0.15 + skew + term;
    })
  );

  return (
    <div className="space-y-6">
      {/* Strategy selector */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Volatility Arbitrage Strategies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {strategies.map((st, i) => (
            <button
              key={i}
              onClick={() => setSelectedStrategy(i)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedStrategy === i
                  ? `border-${st.color}-500/60 bg-${st.color}-500/20`
                  : "border-border bg-foreground/5 hover:bg-muted/50"
              }`}
            >
              <div className={`text-sm font-medium ${selectedStrategy === i ? `text-${st.color}-300` : "text-muted-foreground"}`}>{st.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{st.desc}</div>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStrategy}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-muted/60 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed"
          >
            {selectedStrategy === 0 && (
              <div>
                <strong className="text-emerald-300">Long Gamma (Long Vol)</strong>: Buy ATM options and dynamically delta hedge. You pay implied vol (IV) as premium but collect realized vol (RV) as gamma income. Profitable when RV &gt; IV. Preferred when vol is cheap historically or earnings catalysts loom. Risk: theta decay if RV stays below IV.
              </div>
            )}
            {selectedStrategy === 1 && (
              <div>
                <strong className="text-amber-300">Short Gamma (Short Vol)</strong>: Sell ATM options and hedge deltas. You collect IV premium but pay away RV gamma. Profitable when RV &lt; IV — the historical norm (vol risk premium). Risk: gap moves, large realized moves. Requires strict delta hedging discipline and risk limits.
              </div>
            )}
            {selectedStrategy === 2 && (
              <div>
                <strong className="text-primary">Vol Surface Arbitrage</strong>: Exploit relative mispricings between strikes (skew arb) or expiries (term structure arb). Example: buy cheap 30-delta put, sell expensive 10-delta put in same expiry. Vanna/charm effects near expiry create systematic dislocations — especially in index products.
              </div>
            )}
            {selectedStrategy === 3 && (
              <div>
                <strong className="text-primary">Calendar Spread</strong>: Long near-dated vol, short far-dated vol (or vice versa). Profits from term structure mean reversion. Near-dated options have higher gamma but more theta. Far-dated options have higher vega sensitivity. Vanna effects (∂Delta/∂Vol) amplify P&amp;L near expiry.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* IV vs RV chart */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground font-medium">2-Year Implied Vol vs Realized Vol</h3>
          <div className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
            Avg Vol Premium: +{(avgPremium * 100).toFixed(1)}%
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - 2 * PAD)} y2={PAD + t * (H - 2 * PAD)} stroke="#ffffff08" strokeDasharray="3 3" />
          ))}
          {/* Shaded vol premium area */}
          <polyline
            points={[
              `${PAD},${H - PAD}`,
              ...IV_HIST.map((d, i) => `${mapX(i, 24, W, PAD)},${mapY(d.iv, ivMin, ivMax, H, PAD)}`),
              `${W - PAD},${H - PAD}`,
            ].join(" ")}
            fill="#f59e0b15"
          />
          {/* IV line */}
          <polyline
            points={IV_HIST.map((d, i) => `${mapX(i, 24, W, PAD)},${mapY(d.iv, ivMin, ivMax, H, PAD)}`).join(" ")}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
          />
          {/* RV line */}
          <polyline
            points={IV_HIST.map((d, i) => `${mapX(i, 24, W, PAD)},${mapY(d.rv, ivMin, ivMax, H, PAD)}`).join(" ")}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <text x={PAD} y={H - 4} fontSize={9} fill="#64748b">Month 0</text>
          <text x={W - PAD} y={H - 4} fontSize={9} fill="#64748b" textAnchor="end">Month 24</text>
          <text x={PAD - 3} y={PAD + 4} fontSize={9} fill="#94a3b8" textAnchor="end">{(ivMax * 100).toFixed(0)}%</text>
          <text x={PAD - 3} y={H - PAD} fontSize={9} fill="#94a3b8" textAnchor="end">{(ivMin * 100).toFixed(0)}%</text>
        </svg>
        <div className="flex items-center gap-6 mt-2 text-xs">
          <span className="flex items-center gap-1.5 text-amber-400"><span className="w-4 h-0.5 bg-amber-400 inline-block" /> Implied Vol</span>
          <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-4 h-0.5 bg-emerald-400 inline-block border-dashed" style={{ borderStyle: "dashed" }} /> Realized Vol</span>
          <span className="text-muted-foreground">IV &gt; RV in {IV_HIST.filter((d) => d.iv > d.rv).length}/24 months — structural vol risk premium</span>
        </div>
      </div>

      {/* Vol Surface */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">Vol Surface — Implied Vol by Strike &amp; Expiry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">Strike</th>
                {surfaceExpiries.map((e) => (
                  <th key={e} className="text-center py-2 px-3">{e}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {surfaceStrikes.map((k, ki) => (
                <tr key={k} className="border-b border-border/50">
                  <td className={`py-2 pr-4 font-medium ${k === 100 ? "text-amber-300" : "text-muted-foreground"}`}>
                    {k === 100 ? "★ " : ""}{k}
                  </td>
                  {surfaceIV[ki].map((iv, ei) => {
                    const intensity = (iv - 0.18) / 0.20;
                    const bg = iv > 0.28 ? "bg-red-500/20 text-red-300" : iv > 0.25 ? "bg-amber-500/20 text-amber-300" : "bg-primary/10 text-primary";
                    return (
                      <td key={ei} className="py-2 px-3 text-center">
                        <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${bg}`}>{(iv * 100).toFixed(1)}%</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-red-500/40 inline-block" /> High IV (&gt;28%) — potential short vol</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500/40 inline-block" /> Elevated (25–28%)</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-primary/30 inline-block" /> Normal (&lt;25%)</div>
        </div>
      </div>

      {/* Vanna/Charm effects */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-3">Vanna &amp; Charm Effects Near Expiry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
            <div className="text-indigo-300 font-medium mb-1">Vanna (∂Delta/∂Vol)</div>
            <div className="text-muted-foreground text-xs leading-relaxed">
              As vol drops, OTM option deltas collapse — forcing delta hedgers to buy back short stock hedges. Creates systematic buying pressure on underlyings when IV falls. Most pronounced on OTM options 5–15 DTE.
            </div>
          </div>
          <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
            <div className="text-pink-300 font-medium mb-1">Charm (∂Delta/∂Time)</div>
            <div className="text-muted-foreground text-xs leading-relaxed">
              Delta decays toward 0 or 1 as expiry approaches. OTM options lose delta faster (charm pulls toward 0), ITM options accelerate toward 1. Forces daily re-hedging even with no price move — systematic flow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 4: MM Risk Management ────────────────────────────────────────────────
function MMRiskTab() {
  const riskLimits = {
    deltaBand: { current: 0.12, limit: 0.25, label: "Delta Band" },
    gammaBand: { current: 0.08, limit: 0.15, label: "Gamma Band" },
    vegaLimit: { current: 0.65, limit: 1.0, label: "Vega Limit" },
  };

  const stressScenarios = [
    { name: "Gap Down 10%", delta: -18500, gamma: 12400, vega: -8200, theta: 3100, total: -11200, color: "red" },
    { name: "Vol Spike +50%", delta: -2100, gamma: 1800, vega: -22000, theta: 3100, total: -19200, color: "red" },
    { name: "Pin Risk (ATM)", delta: 8900, gamma: -15600, vega: -800, theta: 12400, total: 4900, color: "amber" },
    { name: "Flat + Vol Crush", delta: 100, gamma: -400, vega: 14500, theta: 3100, total: 17300, color: "emerald" },
    { name: "Trending Melt-Up", delta: -9200, gamma: 7800, vega: 2100, theta: 3100, total: 3800, color: "amber" },
  ];

  const W = 560, H = 200, PAD = 40;
  const dayLabels = MM_DAILY.map((d) => d.day);
  const maxAbs = Math.max(...MM_DAILY.map((d) => Math.max(Math.abs(d.gamma), Math.abs(d.theta), Math.abs(d.total))));

  return (
    <div className="space-y-6">
      {/* Book overview */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Market Maker Book Management
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Net Delta", value: "+0.12", desc: "Mildly long delta; hedge 12 shares short per lot", color: "blue" },
            { label: "Net Gamma", value: "+$842", desc: "Long gamma: profits from large moves", color: "emerald" },
            { label: "Net Theta", value: "-$318/day", desc: "Paying $318/day in time decay", color: "red" },
            { label: "Net Vega", value: "-$1,240", desc: "Short vol exposure; profits if IV drops", color: "amber" },
          ].map((card) => (
            <div key={card.label} className={`bg-${card.color}-500/10 border border-${card.color}-500/20 rounded-lg p-3`}>
              <div className={`text-xs text-${card.color}-300 font-medium`}>{card.label}</div>
              <div className={`text-lg font-bold text-${card.color}-400 font-mono mt-1`}>{card.value}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-tight">{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk limits */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">Risk Limits Dashboard</h3>
        <div className="space-y-3">
          {Object.values(riskLimits).map((rl) => {
            const pct = rl.current / rl.limit;
            const barColor = pct > 0.8 ? "bg-red-500" : pct > 0.6 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div key={rl.label} className="flex items-center gap-4">
                <div className="w-32 text-sm text-muted-foreground">{rl.label}</div>
                <div className="flex-1 h-3 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${barColor} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="w-24 text-right text-xs font-mono">
                  <span className={pct > 0.8 ? "text-red-400" : pct > 0.6 ? "text-amber-400" : "text-emerald-400"}>
                    {(pct * 100).toFixed(0)}%
                  </span>
                  <span className="text-muted-foreground"> of limit</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> &lt;60% — Comfortable</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 60–80% — Watch</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &gt;80% — Reduce</div>
        </div>
      </div>

      {/* Daily P&L breakdown chart */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">Daily Greeks P&amp;L Breakdown (20 days)</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - 2 * PAD)} y2={PAD + t * (H - 2 * PAD)} stroke="#ffffff08" strokeDasharray="3 3" />
          ))}
          <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} stroke="#ffffff25" />
          {MM_DAILY.map((d, i) => {
            const x = PAD + i * ((W - 2 * PAD) / 20);
            const barW = (W - 2 * PAD) / 20 - 2;
            const scale = (H / 2 - PAD) / maxAbs;
            const midY = H / 2;
            return (
              <g key={i}>
                {/* Gamma bar */}
                <rect
                  x={x}
                  y={d.gamma >= 0 ? midY - d.gamma * scale : midY}
                  width={barW * 0.45}
                  height={Math.abs(d.gamma) * scale}
                  fill="#22c55e60"
                />
                {/* Theta bar */}
                <rect
                  x={x + barW * 0.5}
                  y={d.theta >= 0 ? midY - d.theta * scale : midY}
                  width={barW * 0.45}
                  height={Math.abs(d.theta) * scale}
                  fill="#ef444460"
                />
                {/* Total line */}
                {i > 0 && (
                  <line
                    x1={PAD + (i - 1) * ((W - 2 * PAD) / 20) + barW / 2}
                    x2={x + barW / 2}
                    y1={midY - MM_DAILY[i - 1].total * scale}
                    y2={midY - d.total * scale}
                    stroke="#60a5fa"
                    strokeWidth={2}
                  />
                )}
              </g>
            );
          })}
          <text x={PAD} y={H - 4} fontSize={9} fill="#64748b">Day 1</text>
          <text x={W - PAD} y={H - 4} fontSize={9} fill="#64748b" textAnchor="end">Day 20</text>
        </svg>
        <div className="flex items-center gap-6 mt-2 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-3 h-3 rounded bg-emerald-500/40 inline-block" /> Gamma income</span>
          <span className="flex items-center gap-1.5 text-red-400"><span className="w-3 h-3 rounded bg-red-500/40 inline-block" /> Theta decay</span>
          <span className="flex items-center gap-1.5 text-primary"><span className="w-4 h-0.5 bg-primary inline-block" /> Net P&amp;L</span>
        </div>
      </div>

      {/* Gap risk and pin risk */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">Pin Risk at Expiry</h3>
        <svg viewBox="0 0 560 140" className="w-full" style={{ height: 140 }}>
          {/* Probability distribution */}
          {Array.from({ length: 60 }, (_, i) => {
            const x = 40 + i * 8;
            const center = 280;
            const dist = x - center;
            const h = 80 * Math.exp(-(dist * dist) / 1200);
            return (
              <rect
                key={i}
                x={x}
                y={110 - h}
                width={7}
                height={h}
                fill={Math.abs(dist) < 16 ? "#f59e0b60" : "#3b82f640"}
              />
            );
          })}
          {/* Strike line */}
          <line x1={280} x2={280} y1={20} y2={120} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />
          <text x={283} y={18} fontSize={10} fill="#f59e0b">Strike = $100</text>
          <text x={283} y={30} fontSize={9} fill="#94a3b8">Pin zone ±$1</text>
          {/* Arrows showing forced hedging */}
          <text x={130} y={135} fontSize={9} fill="#22c55e">← Buy stock (delta goes to 1)</text>
          <text x={310} y={135} fontSize={9} fill="#ef4444">Sell stock (delta to 0) →</text>
          <line x1={40} x2={520} y1={120} y2={120} stroke="#ffffff20" />
          <text x={40} y={112} fontSize={9} fill="#64748b">$85</text>
          <text x={260} y={112} fontSize={9} fill="#64748b">$100</text>
          <text x={510} y={112} fontSize={9} fill="#64748b">$115</text>
        </svg>
        <p className="text-xs text-muted-foreground mt-2">
          When stock pins near strike at expiry, gamma explodes to infinity — forcing market makers to rapidly buy/sell to stay delta-neutral, creating high transaction costs and potential P&amp;L swings.
        </p>
      </div>

      {/* Stress scenarios */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <h3 className="text-foreground font-medium mb-4">Stress Scenarios — P&amp;L Impact ($)</h3>
        <div className="space-y-2">
          {stressScenarios.map((sc) => (
            <div key={sc.name} className="grid grid-cols-6 gap-2 text-xs py-2 border-b border-border/50 items-center">
              <div className={`text-${sc.color}-300 font-medium col-span-1`}>{sc.name}</div>
              <div className="text-right font-mono">
                <span className="text-muted-foreground text-xs">Δ </span>
                <span className={sc.delta >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {sc.delta >= 0 ? "+" : ""}{sc.delta.toLocaleString()}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-muted-foreground text-xs">Γ </span>
                <span className={sc.gamma >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {sc.gamma >= 0 ? "+" : ""}{sc.gamma.toLocaleString()}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-muted-foreground text-xs">V </span>
                <span className={sc.vega >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {sc.vega >= 0 ? "+" : ""}{sc.vega.toLocaleString()}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-muted-foreground text-xs">Θ </span>
                <span className={sc.theta >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {sc.theta >= 0 ? "+" : ""}{sc.theta.toLocaleString()}
                </span>
              </div>
              <div className={`text-right font-mono font-semibold ${sc.total >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {sc.total >= 0 ? "+" : ""}{sc.total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>Δ = Delta P&amp;L</span>
          <span>Γ = Gamma P&amp;L</span>
          <span>V = Vega P&amp;L</span>
          <span>Θ = Theta P&amp;L</span>
          <span className="text-muted-foreground font-medium">Last col = Net</span>
        </div>
      </div>

      {/* Key risk concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-foreground text-sm font-medium">Gap Risk</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Overnight price gaps bypass continuous hedging — the delta hedge becomes stale. Short gamma books suffer most. Managed via position limits on earnings/events and overnight gamma exposure caps.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-foreground text-sm font-medium">Best Practices</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Delta band: re-hedge when |delta| &gt; threshold</li>
            <li>• Gamma limit: max $ gamma per expiry cluster</li>
            <li>• Vega diversification across term structure</li>
            <li>• Pin risk: flatten positions near expiry</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GammaScalpingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gamma Scalping &amp; Dynamic Hedging</h1>
              <p className="text-muted-foreground text-sm">How market makers profit from realized vs implied volatility through continuous delta hedging</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Long Gamma", "Delta-Neutral", "Vol Arbitrage", "Market Making", "Realized vs Implied"].map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 border border-border text-muted-foreground">{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="delta" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-foreground/5 border border-border rounded-xl p-1 h-auto gap-1">
            {[
              { value: "delta", label: "Delta Hedging", icon: ArrowUpDown },
              { value: "gamma", label: "Gamma P&L", icon: Zap },
              { value: "vol", label: "Vol Arbitrage", icon: TrendingUp },
              { value: "mm", label: "MM Risk Mgmt", icon: Shield },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 text-xs py-2 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground rounded-lg text-muted-foreground"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="delta" className="data-[state=inactive]:hidden">
              <motion.div key="delta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <DeltaHedgingTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="gamma" className="data-[state=inactive]:hidden">
              <motion.div key="gamma" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <GammaPnLTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="vol" className="data-[state=inactive]:hidden">
              <motion.div key="vol" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <VolArbitrageTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="mm" className="data-[state=inactive]:hidden">
              <motion.div key="mm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <MMRiskTab />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
