"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
 filterClosedTrades,
 computeTradeStats,
 buildPnLHistogram,
 normalPDF,
} from "@/services/analytics/trade-analytics";

const W = 480;
const H = 200;
const MARGIN = { top: 16, right: 20, bottom: 36, left: 52 };

function fmt(v: number): string {
 const sign = v >= 0 ? "+" : "";
 if (Math.abs(v) >= 1000) return `${sign}$${(v / 1000).toFixed(1)}k`;
 return `${sign}$${v.toFixed(0)}`;
}

function fmtStat(v: number, decimals = 2): string {
 return v.toFixed(decimals);
}

export function WinLossDistribution() {
 const tradeHistory = useTradingStore((s) => s.tradeHistory);

 const { stats, buckets, curvePoints, chartW, chartH } = useMemo(() => {
 const closed = filterClosedTrades(tradeHistory);
 const stats = computeTradeStats(closed);
 const buckets = buildPnLHistogram(stats.pnlSeries, 10);

 const chartW = W - MARGIN.left - MARGIN.right;
 const chartH = H - MARGIN.top - MARGIN.bottom;

 if (buckets.length === 0) {
 return { stats, buckets, curvePoints: [], chartW, chartH };
 }

 // Compute normal overlay curve
 const mean = stats.pnlSeries.reduce((s, v) => s + v, 0) / stats.pnlSeries.length;
 const variance =
 stats.pnlSeries.reduce((s, v) => s + (v - mean) ** 2, 0) /
 Math.max(1, stats.pnlSeries.length - 1);
 const std = Math.sqrt(variance);

 const maxCount = Math.max(1, ...buckets.map((b) => b.totalCount));
 const minX = buckets[0].bucketMin;
 const maxX = buckets[buckets.length - 1].bucketMax;
 const xRange = maxX - minX || 1;

 // Scale PDF to match histogram height
 const pdfAtMean = std > 0 ? normalPDF(mean, mean, std) : 0;
 const pdfScale = pdfAtMean > 0 ? (maxCount / pdfAtMean) * 0.9 : 0;

 const STEPS = 80;
 const curvePoints: Array<{ x: number; y: number }> = [];
 for (let i = 0; i <= STEPS; i++) {
 const v = minX + (i / STEPS) * xRange;
 const pdf = normalPDF(v, mean, std);
 const scaledCount = pdf * pdfScale;
 const px = MARGIN.left + ((v - minX) / xRange) * chartW;
 const py = MARGIN.top + chartH - (scaledCount / maxCount) * chartH;
 curvePoints.push({ x: px, y: py });
 }

 return { stats, buckets, curvePoints, chartW, chartH };
 }, [tradeHistory]);

 const hasTrades = stats.totalTrades > 0;

 if (!hasTrades) {
 return (
 <div className="flex h-32 flex-col items-center justify-center gap-1 text-muted-foreground">
 <p className="text-sm">No closed trades yet</p>
 <p className="text-xs opacity-60">Close some trades to see P&L distribution</p>
 </div>
 );
 }

 const minX = buckets.length > 0 ? buckets[0].bucketMin : 0;
 const maxX = buckets.length > 0 ? buckets[buckets.length - 1].bucketMax : 1;
 const xRange = maxX - minX || 1;
 const maxCount = Math.max(1, ...buckets.map((b) => b.totalCount));

 const bucketWidth = chartW / (buckets.length || 1);

 const curvePath =
 curvePoints.length > 1
 ? curvePoints
 .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
 .join(" ")
 : "";

 return (
 <div className="space-y-3">
 {/* Stat chips */}
 <div className="flex flex-wrap gap-2 text-xs">
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Skewness <span className="font-mono text-foreground">{fmtStat(stats.skewness)}</span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Kurtosis <span className="font-mono text-foreground">{fmtStat(stats.kurtosis)}</span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Avg win <span className="font-mono text-green-400">{fmt(stats.avgWin)}</span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Avg loss <span className="font-mono text-red-400">{fmt(stats.avgLoss)}</span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Expectancy <span className={`font-mono ${stats.expectancy >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(stats.expectancy)}</span>
 </span>
 </div>

 {/* SVG Chart */}
 <div className="overflow-x-auto">
 <svg
 viewBox={`0 0 ${W} ${H}`}
 className="w-full max-w-full"
 style={{ minWidth: 280 }}
 aria-label="P&L distribution histogram"
 >
 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
 const y = MARGIN.top + (1 - frac) * chartH;
 const count = Math.round(frac * maxCount);
 return (
 <g key={frac}>
 <line
 x1={MARGIN.left}
 x2={MARGIN.left + chartW}
 y1={y}
 y2={y}
 stroke="hsl(220 13% 20%)"
 strokeWidth={0.5}
 />
 <text
 x={MARGIN.left - 4}
 y={y + 3.5}
 textAnchor="end"
 fontSize={9}
 fill="hsl(215 20% 50%)"
 >
 {count}
 </text>
 </g>
 );
 })}

 {/* Bars */}
 {buckets.map((b, i) => {
 const barX = MARGIN.left + i * bucketWidth + 1;
 const bw = Math.max(1, bucketWidth - 2);

 const winH = (b.winCount / maxCount) * chartH;
 const lossH = (b.lossCount / maxCount) * chartH;

 const winY = MARGIN.top + chartH - winH;
 const lossY = MARGIN.top + chartH - lossH;

 return (
 <g key={i}>
 {/* Loss (red) bars — bottom segment */}
 {b.lossCount > 0 && (
 <rect
 x={barX}
 y={lossY}
 width={bw}
 height={lossH}
 fill="hsl(0 65% 45%)"
 fillOpacity={0.85}
 rx={1}
 />
 )}
 {/* Win (green) bars stacked on top */}
 {b.winCount > 0 && (
 <rect
 x={barX}
 y={winY - (b.lossCount > 0 ? lossH : 0)}
 width={bw}
 height={winH}
 fill="hsl(142 55% 40%)"
 fillOpacity={0.85}
 rx={1}
 />
 )}
 </g>
 );
 })}

 {/* Normal distribution overlay curve */}
 {curvePath && (
 <path
 d={curvePath}
 fill="none"
 stroke="hsl(220 80% 65%)"
 strokeWidth={1.5}
 strokeDasharray="4 3"
 opacity={0.7}
 />
 )}

 {/* X axis */}
 <line
 x1={MARGIN.left}
 x2={MARGIN.left + chartW}
 y1={MARGIN.top + chartH}
 y2={MARGIN.top + chartH}
 stroke="hsl(220 13% 28%)"
 strokeWidth={1}
 />

 {/* X axis labels — 5 evenly spaced */}
 {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
 const v = minX + frac * xRange;
 const px = MARGIN.left + frac * chartW;
 return (
 <text
 key={frac}
 x={px}
 y={MARGIN.top + chartH + 14}
 textAnchor="middle"
 fontSize={9}
 fill="hsl(215 20% 50%)"
 >
 {fmt(v)}
 </text>
 );
 })}

 {/* Y-axis label */}
 <text
 x={14}
 y={MARGIN.top + chartH / 2}
 textAnchor="middle"
 fontSize={9}
 fill="hsl(215 20% 45%)"
 transform={`rotate(-90, 14, ${MARGIN.top + chartH / 2})`}
 >
 Trades
 </text>

 {/* X-axis label */}
 <text
 x={MARGIN.left + chartW / 2}
 y={H - 4}
 textAnchor="middle"
 fontSize={9}
 fill="hsl(215 20% 45%)"
 >
 Realized P&L ($)
 </text>
 </svg>
 </div>

 {/* Legend */}
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5">
 <span className="inline-block h-2 w-3 rounded-sm bg-green-600/80" />
 Wins
 </div>
 <div className="flex items-center gap-1.5">
 <span className="inline-block h-2 w-3 rounded-sm bg-red-600/80" />
 Losses
 </div>
 <div className="flex items-center gap-1.5">
 <svg width={16} height={8}>
 <line x1={0} y1={4} x2={16} y2={4} stroke="hsl(220 80% 65%)" strokeWidth={1.5} strokeDasharray="4 3" />
 </svg>
 Normal dist.
 </div>
 </div>
 </div>
 );
}
