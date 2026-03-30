"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OptionType } from "@/types/options";
import { RISK_FREE_RATE } from "@/types/options";
import { blackScholes, normalCDF, normalPDF } from "@/services/options/black-scholes";

// ── PRNG ────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
 return function () {
 seed |= 0;
 seed = (seed + 0x6d2b79f5) | 0;
 let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
 t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

// ── Types ────────────────────────────────────────────────────────────────────

interface MarginPosition {
 id: string;
 symbol: string;
 type: OptionType;
 strike: number;
 expiry: string; // "YYYY-MM-DD"
 quantity: number; // negative = short
 currentPrice: number; // option premium per share
 iv: number; // decimal e.g. 0.30
 underlyingPrice: number;
}

interface PositionGreeks {
 delta: number;
 gamma: number;
 theta: number;
 vega: number;
}

// ── Greeks computation ───────────────────────────────────────────────────────

function computeGreeks(pos: MarginPosition): PositionGreeks {
 const S = pos.underlyingPrice;
 const K = pos.strike;
 const r = RISK_FREE_RATE;
 const sigma = pos.iv;
 const today = new Date();
 const expDate = new Date(pos.expiry);
 const T = Math.max((expDate.getTime() - today.getTime()) / (365.25 * 24 * 3600 * 1000), 1 / 365);

 if (sigma <= 0 || S <= 0 || K <= 0) {
 return { delta: 0, gamma: 0, theta: 0, vega: 0 };
 }

 const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
 const d2 = d1 - sigma * Math.sqrt(T);

 let delta: number;
 if (pos.type === "call") {
 delta = normalCDF(d1);
 } else {
 delta = normalCDF(d1) - 1;
 }

 const gamma = normalPDF(d1) / (S * sigma * Math.sqrt(T));

 // Theta per day
 const theta_term1 = -(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T));
 let theta: number;
 if (pos.type === "call") {
 theta = (theta_term1 - r * K * Math.exp(-r * T) * normalCDF(d2)) / 365;
 } else {
 theta = (theta_term1 + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;
 }

 // Vega per 1% IV
 const vega = (S * normalPDF(d1) * Math.sqrt(T)) / 100;

 // Scale by contracts × 100 shares, but return per-contract Greek first
 const sign = pos.quantity >= 0 ? 1 : -1;
 const absQty = Math.abs(pos.quantity);

 return {
 delta: delta * sign * absQty * 100,
 gamma: gamma * sign * absQty * 100,
 theta: theta * sign * absQty * 100,
 vega: vega * sign * absQty * 100,
 };
}

// ── Margin calculations ──────────────────────────────────────────────────────

const STRESS_MOVES = [-0.15, -0.10, -0.05, -0.03, 0, 0.03, 0.05, 0.10, 0.15];
const IV_STRESS = 0.04; // ±4 percentage points

function computeRegTMargin(positions: MarginPosition[]): number {
 let total = 0;
 for (const pos of positions) {
 if (pos.quantity >= 0) continue; // only short positions require margin
 const underlyingValue = pos.underlyingPrice * 100; // per contract
 const perContractMargin = Math.max(underlyingValue * 0.20, 250);
 total += perContractMargin * Math.abs(pos.quantity);
 }
 return total;
}

function computeScenarioPnL(positions: MarginPosition[], stockMove: number, ivShift: number): number {
 let totalPnL = 0;
 for (const pos of positions) {
 const newS = pos.underlyingPrice * (1 + stockMove);
 const newIV = Math.max(pos.iv + ivShift, 0.01);
 const today = new Date();
 const expDate = new Date(pos.expiry);
 const T = Math.max((expDate.getTime() - today.getTime()) / (365.25 * 24 * 3600 * 1000), 1 / 365);

 const newPrice = blackScholes(newS, pos.strike, T, RISK_FREE_RATE, newIV, pos.type);
 const priceDiff = (newPrice - pos.currentPrice) * pos.quantity * 100;
 totalPnL += priceDiff;
 }
 return totalPnL;
}

function computePortfolioMargin(positions: MarginPosition[]): number {
 let worstPnL = Infinity;
 for (const move of STRESS_MOVES) {
 for (const ivDir of [-1, 1]) {
 const pnl = computeScenarioPnL(positions, move, ivDir * IV_STRESS);
 if (pnl < worstPnL) worstPnL = pnl;
 }
 }
 // Margin = max(worst loss, 0)
 return Math.max(-worstPnL, 0);
}

// ── Sample data using mulberry32(7777) ──────────────────────────────────────

function generateSamplePositions(): MarginPosition[] {
 const rng = mulberry32(7777);

 const symbols = ["SPY", "AAPL", "TSLA", "NVDA", "QQQ"];
 const spotPrices: Record<string, number> = {
 SPY: 512,
 AAPL: 185,
 TSLA: 242,
 NVDA: 875,
 QQQ: 440,
 };
 const today = new Date();

 const positions: MarginPosition[] = [];

 const configs: Array<{ type: OptionType; strikeOffset: number; dte: number; qty: number; iv: number }> = [
 { type: "call", strikeOffset: 5, dte: 30, qty: 2, iv: 0.18 },
 { type: "put", strikeOffset: -10, dte: 45, qty: -3, iv: 0.22 },
 { type: "call", strikeOffset: 15, dte: 60, qty: -2, iv: 0.35 },
 { type: "put", strikeOffset: -5, dte: 21, qty: 1, iv: 0.28 },
 { type: "call", strikeOffset: 0, dte: 7, qty: -1, iv: 0.42 },
 ];

 symbols.forEach((sym, i) => {
 const spot = spotPrices[sym];
 const cfg = configs[i];
 const expDate = new Date(today);
 expDate.setDate(expDate.getDate() + cfg.dte);
 const expiry = expDate.toISOString().split("T")[0];
 const strike = Math.round((spot + cfg.strikeOffset) / 5) * 5;
 const T = cfg.dte / 365;
 const price = blackScholes(spot, strike, T, RISK_FREE_RATE, cfg.iv, cfg.type);
 // Add small random noise
 const noisedPrice = price * (0.95 + rng() * 0.10);

 positions.push({
 id: `pos-${i}`,
 symbol: sym,
 type: cfg.type,
 strike,
 expiry,
 quantity: cfg.qty,
 currentPrice: Math.max(noisedPrice, 0.01),
 iv: cfg.iv,
 underlyingPrice: spot,
 });
 });

 return positions;
}

// ── Stress Test SVG Chart ────────────────────────────────────────────────────

interface StressChartProps {
 positions: MarginPosition[];
}

function StressChart({ positions }: StressChartProps) {
 const W = 400;
 const H = 220;
 const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
 const innerW = W - PAD.left - PAD.right;
 const innerH = H - PAD.top - PAD.bottom;

 const dataPoints = STRESS_MOVES.map((move) => {
 const pnl = computeScenarioPnL(positions, move, 0);
 return { move, pnl };
 });

 const pnls = dataPoints.map((d) => d.pnl);
 const minPnL = Math.min(...pnls);
 const maxPnL = Math.max(...pnls);
 const range = maxPnL - minPnL || 1;

 const xScale = (move: number) => ((move + 0.15) / 0.30) * innerW;
 const yScale = (pnl: number) => innerH - ((pnl - minPnL) / range) * innerH;
 const zeroY = yScale(0);

 // Build polyline points
 const points = dataPoints.map((d) => `${xScale(d.move)},${yScale(d.pnl)}`).join(" ");

 // Find breakeven crossings
 const breakevenXs: number[] = [];
 for (let i = 0; i < dataPoints.length - 1; i++) {
 const p1 = dataPoints[i];
 const p2 = dataPoints[i + 1];
 if ((p1.pnl >= 0) !== (p2.pnl >= 0)) {
 const t = -p1.pnl / (p2.pnl - p1.pnl);
 const beMv = p1.move + t * (p2.move - p1.move);
 breakevenXs.push(xScale(beMv));
 }
 }

 // Max loss point
 const maxLossIdx = pnls.indexOf(minPnL);
 const maxLossPt = dataPoints[maxLossIdx];

 // x-axis labels
 const xLabels = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15];

 return (
 <svg
 width={W}
 height={H}
 viewBox={`0 0 ${W} ${H}`}
 className="max-w-full"
 style={{ fontFamily: "inherit" }}
 >
 <g transform={`translate(${PAD.left},${PAD.top})`}>
 {/* Grid lines */}
 {[-1, -0.5, 0, 0.5, 1].map((frac) => {
 const y = frac === 0 ? zeroY : innerH * (1 - (frac + 1) / 2);
 return (
 <line
 key={`grid-${frac}`}
 x1={0}
 y1={yScale(minPnL + range * ((frac + 1) / 2))}
 x2={innerW}
 y2={yScale(minPnL + range * ((frac + 1) / 2))}
 stroke="rgba(255,255,255,0.06)"
 strokeWidth={1}
 />
 );
 })}

 {/* Zero line */}
 {minPnL <= 0 && maxPnL >= 0 && (
 <line
 x1={0}
 y1={zeroY}
 x2={innerW}
 y2={zeroY}
 stroke="rgba(255,255,255,0.25)"
 strokeWidth={1}
 strokeDasharray="4,3"
 />
 )}

 {/* Fill areas — red below zero, green above */}
 {/* Build two separate polygons */}
 {(() => {
 // Green area (above zero)
 const greenPts: string[] = [];
 const redPts: string[] = [];

 for (let i = 0; i < dataPoints.length; i++) {
 const x = xScale(dataPoints[i].move);
 const y = yScale(dataPoints[i].pnl);
 const clampedY = Math.min(y, zeroY);
 greenPts.push(`${x},${clampedY}`);
 }
 // close at zero line
 greenPts.push(`${xScale(dataPoints[dataPoints.length - 1].move)},${zeroY}`);
 greenPts.push(`${xScale(dataPoints[0].move)},${zeroY}`);

 for (let i = 0; i < dataPoints.length; i++) {
 const x = xScale(dataPoints[i].move);
 const y = yScale(dataPoints[i].pnl);
 const clampedY = Math.max(y, zeroY);
 redPts.push(`${x},${clampedY}`);
 }
 redPts.push(`${xScale(dataPoints[dataPoints.length - 1].move)},${zeroY}`);
 redPts.push(`${xScale(dataPoints[0].move)},${zeroY}`);

 return (
 <>
 <polygon
 points={greenPts.join(" ")}
 fill="rgba(16,185,129,0.15)"
 stroke="none"
 />
 <polygon
 points={redPts.join(" ")}
 fill="rgba(239,68,68,0.15)"
 stroke="none"
 />
 </>
 );
 })()}

 {/* P&L line */}
 <polyline
 points={points}
 fill="none"
 stroke="#f97316"
 strokeWidth={2}
 strokeLinejoin="round"
 />

 {/* Breakeven markers */}
 {breakevenXs.map((bx, i) => (
 <g key={`be-${i}`}>
 <line x1={bx} y1={0} x2={bx} y2={innerH} stroke="#a3e635" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
 <text x={bx + 3} y={10} fill="#a3e635" fontSize={8} fontWeight="600">BE</text>
 </g>
 ))}

 {/* Max loss marker */}
 {minPnL < 0 && (
 <g>
 <circle
 cx={xScale(maxLossPt.move)}
 cy={yScale(maxLossPt.pnl)}
 r={4}
 fill="#ef4444"
 stroke="#fff"
 strokeWidth={1}
 />
 <text
 x={xScale(maxLossPt.move) + 6}
 y={yScale(maxLossPt.pnl) - 4}
 fill="#ef4444"
 fontSize={8}
 fontWeight="600"
 >
 Max Loss
 </text>
 </g>
 )}

 {/* Data dots */}
 {dataPoints.map((d, i) => (
 <circle
 key={`dot-${i}`}
 cx={xScale(d.move)}
 cy={yScale(d.pnl)}
 r={2.5}
 fill={d.pnl >= 0 ? "#10b981" : "#ef4444"}
 />
 ))}

 {/* X axis */}
 <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
 {xLabels.map((mv) => (
 <g key={`xl-${mv}`} transform={`translate(${xScale(mv)},${innerH})`}>
 <line y2={4} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
 <text y={14} textAnchor="middle" fill="#94a3b8" fontSize={8}>
 {mv > 0 ? `+${(mv * 100).toFixed(0)}%` : `${(mv * 100).toFixed(0)}%`}
 </text>
 </g>
 ))}

 {/* Y axis */}
 <line x1={0} y1={0} x2={0} y2={innerH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
 {[minPnL, (minPnL + maxPnL) / 2, maxPnL].map((v, i) => {
 const y = yScale(v);
 const label = v >= 0 ? `+$${Math.abs(v).toFixed(0)}` : `-$${Math.abs(v).toFixed(0)}`;
 return (
 <g key={`yl-${i}`} transform={`translate(0,${y})`}>
 <line x2={-4} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
 <text x={-6} dy="0.32em" textAnchor="end" fill="#94a3b8" fontSize={8}>
 {label}
 </text>
 </g>
 );
 })}

 {/* Axis labels */}
 <text
 x={innerW / 2}
 y={innerH + 32}
 textAnchor="middle"
 fill="#64748b"
 fontSize={9}
 >
 Stock Price Move
 </text>
 <text
 x={-innerH / 2}
 y={-48}
 textAnchor="middle"
 fill="#64748b"
 fontSize={9}
 transform="rotate(-90)"
 >
 Portfolio P&amp;L ($)
 </text>
 </g>
 </svg>
 );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt$(n: number, decimals = 0): string {
 const abs = Math.abs(n);
 const str = abs.toLocaleString("en-US", {
 minimumFractionDigits: decimals,
 maximumFractionDigits: decimals,
 });
 return (n < 0 ? "-$" : "$") + str;
}

function fmtPct(n: number): string {
 return (n >= 0 ? "+" : "") + (n * 100).toFixed(2) + "%";
}

function fmtSigned(n: number, decimals = 4): string {
 return (n >= 0 ? "+" : "") + n.toFixed(decimals);
}

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
 return (
 <div className="mb-3 flex items-baseline gap-2">
 <span className="text-[11px] font-semibold text-foreground/90">
 {children}
 </span>
 {subtitle && (
 <span className="text-xs text-muted-foreground">{subtitle}</span>
 )}
 </div>
 );
}

// ── Main component ───────────────────────────────────────────────────────────

const ACCOUNT_SIZE = 150_000; // Assume $150k account for PM eligibility

export function PortfolioMarginCalc() {
 const [positions, setPositions] = useState<MarginPosition[]>(generateSamplePositions);

 // ── Derived data ───────────────────────────────────────────────────────────

 const greeksByPos = useMemo(
 () => positions.map((p) => computeGreeks(p)),
 [positions],
 );

 const netGreeks = useMemo(() => {
 return greeksByPos.reduce(
 (acc, g) => ({
 delta: acc.delta + g.delta,
 gamma: acc.gamma + g.gamma,
 theta: acc.theta + g.theta,
 vega: acc.vega + g.vega,
 }),
 { delta: 0, gamma: 0, theta: 0, vega: 0 },
 );
 }, [greeksByPos]);

 const regTMargin = useMemo(() => computeRegTMargin(positions), [positions]);
 const pmMargin = useMemo(() => computePortfolioMargin(positions), [positions]);
 const savings = regTMargin > 0 ? (regTMargin - pmMargin) / regTMargin : 0;
 const pmEligible = ACCOUNT_SIZE >= 100_000;

 // Scenario table
 const scenarioPnLs = useMemo(
 () =>
 STRESS_MOVES.map((move) => ({
 move,
 pnlUp: computeScenarioPnL(positions, move, IV_STRESS),
 pnlBase: computeScenarioPnL(positions, move, 0),
 pnlDown: computeScenarioPnL(positions, move, -IV_STRESS),
 })),
 [positions],
 );

 // Expected P&L (rough 1% SPY move)
 const totalPremiumCollected = useMemo(() => {
 return positions.reduce((acc, p) => {
 if (p.quantity < 0) {
 acc += p.currentPrice * Math.abs(p.quantity) * 100;
 }
 return acc;
 }, 0);
 }, [positions]);

 // Dollar impact of 1% move
 const deltaImpact = (netGreeks.delta * (positions[0]?.underlyingPrice ?? 500) * 0.01) || 0;
 const avgSpot = positions.length > 0 ? positions.reduce((s, p) => s + p.underlyingPrice, 0) / positions.length : 500;
 const gammaImpact = 0.5 * netGreeks.gamma * Math.pow(avgSpot * 0.01, 2);
 const totalImpact = deltaImpact + gammaImpact;

 // Capital efficiency
 const effectiveMargin = Math.max(pmEligible ? pmMargin : regTMargin, 1);
 const capitalEfficiency = totalPremiumCollected / effectiveMargin;
 const romAnnualized =
 positions.length > 0
 ? (netGreeks.theta * 365) / effectiveMargin
 : 0;

 // ── Handlers ───────────────────────────────────────────────────────────────

 const addPosition = useCallback(() => {
 const today = new Date();
 const exp = new Date(today);
 exp.setDate(exp.getDate() + 30);
 setPositions((prev) => [
 ...prev,
 {
 id: `pos-${Date.now()}`,
 symbol: "SPY",
 type: "call",
 strike: 510,
 expiry: exp.toISOString().split("T")[0],
 quantity: 1,
 currentPrice: 5.0,
 iv: 0.20,
 underlyingPrice: 512,
 },
 ]);
 }, []);

 const deletePosition = useCallback((id: string) => {
 setPositions((prev) => prev.filter((p) => p.id !== id));
 }, []);

 const updatePosition = useCallback(
 (id: string, field: keyof MarginPosition, raw: string) => {
 setPositions((prev) =>
 prev.map((p) => {
 if (p.id !== id) return p;
 const updated = { ...p };
 if (field === "symbol") {
 updated.symbol = raw.toUpperCase();
 } else if (field === "type") {
 updated.type = raw as OptionType;
 } else if (field === "expiry") {
 updated.expiry = raw;
 } else if (
 field === "strike" ||
 field === "quantity" ||
 field === "currentPrice" ||
 field === "iv" ||
 field === "underlyingPrice"
 ) {
 const n = parseFloat(raw);
 if (!isNaN(n)) (updated as Record<string, unknown>)[field] = n;
 }
 return updated;
 }),
 );
 },
 [],
 );

 // ── Render ─────────────────────────────────────────────────────────────────

 return (
 <div className="space-y-4 p-3">

 {/* ── Section 1: Position Input Table ─────────────────────────────── */}
 <Card className="rounded-xl border border-border/20 bg-card/30">
 <CardHeader className="pb-2 pt-3 px-3">
 <div className="flex items-center justify-between">
 <CardTitle className="text-xs font-semibold">
 Position Input
 </CardTitle>
 <Button
 size="sm"
 variant="outline"
 className="h-6 px-2 text-xs"
 onClick={addPosition}
 >
 + Add Position
 </Button>
 </div>
 </CardHeader>
 <CardContent className="overflow-x-auto px-3 pb-3">
 <table className="w-full min-w-[860px] text-xs">
 <thead>
 <tr className="border-b border-border">
 {[
 "Symbol", "Type", "Strike", "Expiry", "Qty", "Price", "IV",
 "Underlying", "Delta", "Gamma", "Theta/day", "Vega/1%", "",
 ].map((h) => (
 <th
 key={h}
 className="pb-1 pr-2 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35"
 >
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {positions.map((pos, idx) => {
 const g = greeksByPos[idx];
 const isShort = pos.quantity < 0;
 return (
 <tr key={pos.id} className="border-b border-border hover:bg-muted/10">
 {/* Symbol */}
 <td className="py-1 pr-2">
 <Input
 className="h-6 w-14 bg-transparent border border-border/20 rounded px-2 py-1 text-[11px] font-mono"
 value={pos.symbol}
 onChange={(e) => updatePosition(pos.id, "symbol", e.target.value)}
 />
 </td>
 {/* Type */}
 <td className="py-1 pr-2">
 <select
 className="h-6 rounded border border-border bg-transparent px-1 text-xs text-foreground"
 value={pos.type}
 onChange={(e) => updatePosition(pos.id, "type", e.target.value)}
 >
 <option value="call">Call</option>
 <option value="put">Put</option>
 </select>
 </td>
 {/* Strike */}
 <td className="py-1 pr-2">
 <Input
 className="h-6 w-16 bg-transparent border border-border/20 rounded px-2 py-1 text-[11px] font-mono"
 type="number"
 value={pos.strike}
 onChange={(e) => updatePosition(pos.id, "strike", e.target.value)}
 />
 </td>
 {/* Expiry */}
 <td className="py-1 pr-2">
 <Input
 className="h-6 w-24 bg-transparent border border-border/20 rounded px-2 py-1 text-[11px] font-mono"
 type="date"
 value={pos.expiry}
 onChange={(e) => updatePosition(pos.id, "expiry", e.target.value)}
 />
 </td>
 {/* Qty */}
 <td className="py-1 pr-2">
 <Input
 className={cn(
 "h-6 w-14 bg-transparent border border-border/20 rounded px-2 py-1 text-[11px] font-mono",
 isShort ? "text-red-500" : "text-emerald-500",
 )}
 type="number"
 value={pos.quantity}
 onChange={(e) => updatePosition(pos.id, "quantity", e.target.value)}
 />
 </td>
 {/* Price */}
 <td className="py-1 pr-2">
 <Input
 className="h-6 w-16 bg-transparent border border-border/20 rounded px-2 py-1 text-[11px] font-mono"
 type="number"
 step="0.01"
 value={pos.currentPrice.toFixed(2)}
 onChange={(e) => updatePosition(pos.id, "currentPrice", e.target.value)}
 />
 </td>
 {/* IV */}
 <td className="py-1 pr-2">
 <Input
 className="h-6 w-14 bg-transparent border border-border/20 rounded px-2 py-1 text-[11px] font-mono"
 type="number"
 step="0.01"
 value={pos.iv.toFixed(2)}
 onChange={(e) => updatePosition(pos.id, "iv", e.target.value)}
 />
 </td>
 {/* Underlying */}
 <td className="py-1 pr-2">
 <Input
 className="h-6 w-16 bg-transparent border border-border/20 rounded px-2 py-1 text-[11px] font-mono"
 type="number"
 step="0.01"
 value={pos.underlyingPrice}
 onChange={(e) => updatePosition(pos.id, "underlyingPrice", e.target.value)}
 />
 </td>
 {/* Greeks (read-only) */}
 <td className={cn("py-1 pr-2 font-mono", g.delta >= 0 ? "text-emerald-500" : "text-red-500")}>
 {fmtSigned(g.delta, 1)}
 </td>
 <td className="py-1 pr-2 font-mono text-orange-400">
 {fmtSigned(g.gamma, 2)}
 </td>
 <td className={cn("py-1 pr-2 font-mono", g.theta <= 0 ? "text-red-500" : "text-emerald-500")}>
 {fmtSigned(g.theta, 2)}
 </td>
 <td className="py-1 pr-2 font-mono text-orange-500">
 {fmtSigned(g.vega, 2)}
 </td>
 {/* Delete */}
 <td className="py-1">
 <button
 className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
 onClick={() => deletePosition(pos.id)}
 >
 ×
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 {positions.length === 0 && (
 <p className="py-4 text-center text-[11px] text-muted-foreground">
 No positions. Click &quot;Add Position&quot; to begin.
 </p>
 )}
 </CardContent>
 </Card>

 {/* ── Section 2: Margin Regimes ────────────────────────────────────── */}
 <div className="grid grid-cols-2 gap-3">
 {/* Reg-T */}
 <Card className="rounded-xl border border-border/20 bg-card/30">
 <CardHeader className="pb-2 pt-3 px-3">
 <CardTitle className="flex items-center gap-2 text-xs font-semibold">
 Reg-T Margin
 <Badge variant="outline" className="text-[11px] px-1 py-0 border-amber-500/50 text-amber-400">
 Standard
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="px-3 pb-3 space-y-2">
 <div className="flex items-end justify-between">
 <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">Total Margin Required</span>
 <span className="text-[13px] font-mono font-bold tabular-nums text-amber-400">{fmt$(regTMargin)}</span>
 </div>
 <div className="rounded-md border border-border bg-muted/20 p-2 text-xs text-muted-foreground">
 <p className="font-semibold text-foreground/80 mb-1">Calculation basis</p>
 <p>20% × underlying value per contract</p>
 <p>Minimum $250 per contract</p>
 <p className="mt-1 text-amber-400/80">Applies to short positions only</p>
 </div>

 {/* Per-position breakdown */}
 <div className="space-y-1">
 {positions.filter((p) => p.quantity < 0).map((p) => {
 const m = Math.max(p.underlyingPrice * 100 * 0.20, 250) * Math.abs(p.quantity);
 return (
 <div key={p.id} className="flex justify-between text-[11px]">
 <span className="text-muted-foreground">
 {p.symbol} {p.type === "call" ? "C" : "P"}{p.strike} ({p.quantity})
 </span>
 <span className="font-mono text-amber-400/80">{fmt$(m)}</span>
 </div>
 );
 })}
 {positions.filter((p) => p.quantity < 0).length === 0 && (
 <p className="text-xs text-muted-foreground">No short positions.</p>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Portfolio Margin */}
 <Card className="rounded-xl border border-border/20 bg-card/30">
 <CardHeader className="pb-2 pt-3 px-3">
 <CardTitle className="flex items-center gap-2 text-xs font-semibold">
 Portfolio Margin
 {pmEligible ? (
 <Badge className="text-[11px] px-1 py-0 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
 PM Eligible
 </Badge>
 ) : (
 <Badge variant="outline" className="text-[11px] px-1 py-0 border-red-500/40 text-red-500">
 Need $100k+
 </Badge>
 )}
 </CardTitle>
 </CardHeader>
 <CardContent className="px-3 pb-3 space-y-2">
 <div className="flex items-end justify-between">
 <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">Stress-Test Margin</span>
 <span className="text-[13px] font-mono font-bold tabular-nums text-emerald-500">{fmt$(pmMargin)}</span>
 </div>
 <div className="rounded-md border border-border bg-muted/20 p-2 text-xs text-muted-foreground">
 <p className="font-semibold text-foreground/80 mb-1">Stress scenarios</p>
 <p>Stock ±15%, ±10%, ±5%, ±3%, 0%</p>
 <p>IV shift ±4 percentage points</p>
 <p className="mt-1 text-emerald-500/80">Margin = worst-case P&L loss</p>
 </div>
 {/* Savings */}
 <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2">
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Capital Savings vs Reg-T</span>
 <span className="font-semibold text-emerald-500">
 {fmt$(Math.max(regTMargin - pmMargin, 0))}
 </span>
 </div>
 <div className="flex justify-between text-xs mt-1">
 <span className="text-muted-foreground">% Reduction</span>
 <span className="font-semibold text-emerald-500">
 {savings > 0 ? `${(savings * 100).toFixed(1)}%` : "0%"}
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* ── Section 3: Stress Test SVG Chart ─────────────────────────────── */}
 <Card className="rounded-xl border border-border/20 bg-card/30">
 <CardHeader className="pb-2 pt-3 px-3">
 <CardTitle className="text-xs font-semibold">
 Stress Test P&amp;L Chart
 </CardTitle>
 </CardHeader>
 <CardContent className="px-3 pb-3">
 {positions.length > 0 ? (
 <div className="space-y-3">
 <StressChart positions={positions} />
 {/* Scenario table */}
 <div className="overflow-x-auto">
 <table className="w-full text-[11px]">
 <thead>
 <tr className="border-b border-border">
 <th className="pb-1 pr-2 text-left text-muted-foreground">Move</th>
 <th className="pb-1 pr-2 text-right text-orange-500">IV +4pp</th>
 <th className="pb-1 pr-2 text-right text-orange-400">Base IV</th>
 <th className="pb-1 pr-2 text-right text-orange-400">IV -4pp</th>
 </tr>
 </thead>
 <tbody>
 {scenarioPnLs.map(({ move, pnlUp, pnlBase, pnlDown }) => (
 <tr key={move} className="border-b border-border">
 <td className="py-0.5 pr-2 font-mono text-foreground/80">
 {move > 0 ? `+${(move * 100).toFixed(0)}%` : `${(move * 100).toFixed(0)}%`}
 </td>
 <td className={cn("py-0.5 pr-2 text-right font-mono", pnlUp >= 0 ? "text-emerald-500" : "text-red-500")}>
 {fmt$(pnlUp)}
 </td>
 <td className={cn("py-0.5 pr-2 text-right font-mono", pnlBase >= 0 ? "text-emerald-500" : "text-red-500")}>
 {fmt$(pnlBase)}
 </td>
 <td className={cn("py-0.5 pr-2 text-right font-mono", pnlDown >= 0 ? "text-emerald-500" : "text-red-500")}>
 {fmt$(pnlDown)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 ) : (
 <p className="py-4 text-center text-[11px] text-muted-foreground">
 Add positions to view stress test.
 </p>
 )}
 </CardContent>
 </Card>

 {/* ── Section 4: Greeks Aggregation ────────────────────────────────── */}
 <Card className="rounded-xl border border-border/20 bg-card/30">
 <CardHeader className="pb-2 pt-3 px-3">
 <CardTitle className="text-xs font-semibold">
 Portfolio Greeks
 </CardTitle>
 </CardHeader>
 <CardContent className="px-3 pb-3 space-y-3">
 {/* Net Greeks cards */}
 <div className="grid grid-cols-4 gap-2">
 {[
 {
 label: "Net Delta",
 value: netGreeks.delta.toFixed(1),
 sub: "shares equiv.",
 color: netGreeks.delta >= 0 ? "text-emerald-500" : "text-red-500",
 },
 {
 label: "Net Gamma",
 value: netGreeks.gamma.toFixed(3),
 sub: "per $1 move",
 color: netGreeks.gamma >= 0 ? "text-orange-400" : "text-orange-400",
 },
 {
 label: "Net Theta",
 value: fmt$(netGreeks.theta, 2),
 sub: "per day",
 color: netGreeks.theta >= 0 ? "text-emerald-500" : "text-red-500",
 },
 {
 label: "Net Vega",
 value: fmt$(netGreeks.vega, 2),
 sub: "per 1% IV",
 color: netGreeks.vega >= 0 ? "text-orange-500" : "text-orange-400",
 },
 ].map((item) => (
 <div
 key={item.label}
 className="rounded-lg border border-border bg-muted/10 p-2 text-center"
 >
 <p className="text-[11px] text-muted-foreground">{item.label}</p>
 <p className={cn("text-sm font-semibold font-mono", item.color)}>{item.value}</p>
 <p className="text-[11px] text-muted-foreground">{item.sub}</p>
 </div>
 ))}
 </div>

 {/* Dollar impact table */}
 <div>
 <SectionTitle subtitle="estimated">1% Stock Move Impact</SectionTitle>
 <div className="rounded-md border border-border bg-muted/10 p-2 text-xs space-y-1">
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Delta P&L (net Δ × avg spot × 1%)
 </span>
 <span className={cn("font-mono font-semibold", deltaImpact >= 0 ? "text-emerald-500" : "text-red-500")}>
 {fmt$(deltaImpact, 2)}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Gamma P&L (½ × Γ × (1% × S)²)
 </span>
 <span className={cn("font-mono font-semibold", gammaImpact >= 0 ? "text-emerald-500" : "text-red-500")}>
 {fmt$(gammaImpact, 2)}
 </span>
 </div>
 <div className="flex justify-between border-t border-border pt-1">
 <span className="font-semibold text-foreground/80">Total Impact</span>
 <span className={cn("font-mono font-semibold", totalImpact >= 0 ? "text-emerald-500" : "text-red-500")}>
 {fmt$(totalImpact, 2)}
 </span>
 </div>
 </div>
 </div>

 {/* Portfolio characterization badges */}
 <div className="flex flex-wrap gap-1.5">
 <Badge
 variant="outline"
 className={cn(
 "text-[11px] px-2",
 netGreeks.delta >= 0
 ? "border-emerald-500/40 text-emerald-500"
 : "border-red-500/40 text-red-500",
 )}
 >
 {netGreeks.delta >= 0 ? "Delta Long" : "Delta Short"}
 </Badge>
 <Badge
 variant="outline"
 className={cn(
 "text-[11px] px-2",
 netGreeks.gamma >= 0
 ? "border-orange-500/40 text-orange-400"
 : "border-orange-500/40 text-orange-400",
 )}
 >
 {netGreeks.gamma >= 0 ? "Long Gamma" : "Short Gamma"}
 </Badge>
 <Badge
 variant="outline"
 className={cn(
 "text-[11px] px-2",
 netGreeks.theta >= 0
 ? "border-emerald-500/40 text-emerald-500"
 : "border-red-500/40 text-red-500",
 )}
 >
 {netGreeks.theta >= 0 ? "Theta Positive" : "Theta Negative"}
 </Badge>
 <Badge
 variant="outline"
 className={cn(
 "text-[11px] px-2",
 netGreeks.vega >= 0
 ? "border-orange-500/40 text-orange-500"
 : "border-amber-500/40 text-amber-400",
 )}
 >
 {netGreeks.vega >= 0 ? "Long Vega" : "Short Vega"}
 </Badge>
 </div>
 </CardContent>
 </Card>

 {/* ── Section 5: Margin Efficiency Metrics ─────────────────────────── */}
 <Card className="rounded-xl border border-border/20 bg-card/30">
 <CardHeader className="pb-2 pt-3 px-3">
 <CardTitle className="text-xs font-semibold">
 Margin Efficiency
 </CardTitle>
 </CardHeader>
 <CardContent className="px-3 pb-3 space-y-3">
 {/* Metrics grid */}
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <SectionTitle>Key Ratios</SectionTitle>
 {[
 {
 label: "Return on Margin (ann.)",
 value: `${(romAnnualized * 100).toFixed(1)}%`,
 desc: "Net Theta × 365 / Margin",
 color: romAnnualized >= 0 ? "text-emerald-500" : "text-red-500",
 },
 {
 label: "Capital Efficiency",
 value: `${(capitalEfficiency * 100).toFixed(1)}%`,
 desc: "Premium Collected / Margin",
 color: capitalEfficiency >= 0.1 ? "text-orange-400" : "text-amber-400",
 },
 {
 label: "Premium Collected",
 value: fmt$(totalPremiumCollected),
 desc: "From short positions",
 color: "text-orange-400",
 },
 ].map((item) => (
 <div key={item.label} className="flex items-start justify-between gap-2">
 <div>
 <p className="text-xs text-foreground/80">{item.label}</p>
 <p className="text-[11px] text-muted-foreground">{item.desc}</p>
 </div>
 <span className={cn("text-sm font-semibold font-mono shrink-0", item.color)}>
 {item.value}
 </span>
 </div>
 ))}
 </div>

 <div className="space-y-2">
 <SectionTitle>Buying Power Reduction</SectionTitle>
 <div className="space-y-1">
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Reg-T BPR</span>
 <span className="font-mono text-amber-400">{fmt$(regTMargin)}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Portfolio Margin BPR</span>
 <span className="font-mono text-emerald-500">{fmt$(pmMargin)}</span>
 </div>
 <div className="my-1 h-px bg-border/40" />
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Account Size</span>
 <span className="font-mono text-foreground/80">{fmt$(ACCOUNT_SIZE)}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Remaining BP (Reg-T)</span>
 <span className="font-mono text-foreground/60">
 {fmt$(Math.max(ACCOUNT_SIZE - regTMargin, 0))}
 </span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Remaining BP (PM)</span>
 <span className="font-mono text-emerald-500">
 {fmt$(Math.max(ACCOUNT_SIZE - pmMargin, 0))}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Strategy suggestion */}
 <div className="rounded-md border border-orange-500/20 bg-orange-500/5 p-3">
 <p className="mb-1 text-xs font-semibold text-orange-400">Optimal Strategy Suggestion</p>
 <p className="text-xs text-muted-foreground">
 {(() => {
 const isShortGamma = netGreeks.gamma < 0;
 const isShortVega = netGreeks.vega < 0;
 const isDeltaLong = netGreeks.delta > 0;
 const thetaPositive = netGreeks.theta > 0;

 if (isShortGamma && isShortVega && thetaPositive) {
 return "Portfolio is theta-positive and short volatility — consistent with premium selling strategies (iron condors, strangles). Monitor for large moves that could breach margin limits.";
 } else if (!isShortGamma && !isShortVega) {
 return "Portfolio is long gamma and long vega — benefits from large moves and IV expansion. Consider selling near-term premium to fund long vol exposure and reduce margin drag.";
 } else if (isDeltaLong && !thetaPositive) {
 return "Portfolio is net long delta with negative theta. Consider adding a short call or covered call overlay to generate theta income and reduce directional risk.";
 } else if (!isDeltaLong && !thetaPositive) {
 return "Portfolio is net short delta with negative theta — high-risk directional short. Consider adding protective calls or reducing short delta exposure.";
 } else {
 return "Portfolio Greeks appear balanced. Maintain current allocation and monitor vega exposure closely if implied volatility shifts materially.";
 }
 })()}
 </p>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
