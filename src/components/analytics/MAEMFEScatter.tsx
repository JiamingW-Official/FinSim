"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { filterClosedTrades, computeMAEMFE } from "@/services/analytics/trade-analytics";

const W = 480;
const H = 280;
const MARGIN = { top: 24, right: 24, bottom: 48, left: 56 };

function fmtPct(v: number): string {
 return `${(v * 100).toFixed(1)}%`;
}

export function MAEMFEScatter() {
 const tradeHistory = useTradingStore((s) => s.tradeHistory);

 const { points, chartW, chartH, maxVal } = useMemo(() => {
 const closed = filterClosedTrades(tradeHistory);
 const maemfe = computeMAEMFE(closed);
 const chartW = W - MARGIN.left - MARGIN.right;
 const chartH = H - MARGIN.top - MARGIN.bottom;

 const allVals = maemfe.flatMap((p) => [p.mae, p.mfe]);
 const maxVal = allVals.length > 0 ? Math.max(...allVals) * 1.1 : 0.1;

 return { points: maemfe, chartW, chartH, maxVal };
 }, [tradeHistory]);

 if (points.length === 0) {
 return (
 <div className="flex h-32 flex-col items-center justify-center gap-1 text-muted-foreground">
 <p className="text-sm">No closed trades yet</p>
 <p className="text-xs opacity-60">Close some trades to see MAE/MFE analysis</p>
 </div>
 );
 }

 function toSVGX(mae: number) {
 return MARGIN.left + (mae / maxVal) * (W - MARGIN.left - MARGIN.right);
 }
 function toSVGY(mfe: number) {
 return MARGIN.top + (1 - mfe / maxVal) * (H - MARGIN.top - MARGIN.bottom);
 }

 const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxVal);

 // Diagonal break-even line: MFE = MAE
 const diagX1 = toSVGX(0);
 const diagY1 = toSVGY(0);
 const diagX2 = toSVGX(maxVal);
 const diagY2 = toSVGY(maxVal);

 const wins = points.filter((p) => p.isWin).length;
 const losses = points.length - wins;

 return (
 <div className="space-y-3">
 {/* Stat chips */}
 <div className="flex flex-wrap gap-2 text-xs">
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Trades <span className="font-mono text-foreground">{points.length}</span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Wins <span className="font-mono text-green-400">{wins}</span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Losses <span className="font-mono text-red-400">{losses}</span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Avg MAE{" "}
 <span className="font-mono text-foreground">
 {fmtPct(points.reduce((s, p) => s + p.mae, 0) / points.length)}
 </span>
 </span>
 <span className="rounded border border-border bg-card/60 px-2 py-0.5">
 Avg MFE{" "}
 <span className="font-mono text-foreground">
 {fmtPct(points.reduce((s, p) => s + p.mfe, 0) / points.length)}
 </span>
 </span>
 </div>

 {/* SVG scatter */}
 <div className="overflow-x-auto">
 <svg
 viewBox={`0 0 ${W} ${H}`}
 className="w-full max-w-full"
 style={{ minWidth: 280 }}
 aria-label="MAE/MFE scatter plot"
 >
 {/* Grid lines Y */}
 {ticks.map((v, i) => {
 const y = toSVGY(v);
 return (
 <g key={`gy-${i}`}>
 <line
 x1={MARGIN.left}
 x2={MARGIN.left + chartW}
 y1={y}
 y2={y}
 stroke="hsl(220 13% 20%)"
 strokeWidth={0.5}
 strokeDasharray="3 4"
 />
 <text
 x={MARGIN.left - 5}
 y={y + 3.5}
 textAnchor="end"
 fontSize={9}
 fill="hsl(215 20% 50%)"
 >
 {fmtPct(v)}
 </text>
 </g>
 );
 })}

 {/* Grid lines X */}
 {ticks.map((v, i) => {
 const x = toSVGX(v);
 return (
 <g key={`gx-${i}`}>
 <line
 x1={x}
 x2={x}
 y1={MARGIN.top}
 y2={MARGIN.top + chartH}
 stroke="hsl(220 13% 18%)"
 strokeWidth={0.5}
 strokeDasharray="3 4"
 />
 <text
 x={x}
 y={MARGIN.top + chartH + 14}
 textAnchor="middle"
 fontSize={9}
 fill="hsl(215 20% 50%)"
 >
 {fmtPct(v)}
 </text>
 </g>
 );
 })}

 {/* Break-even diagonal line (MFE = MAE) */}
 <line
 x1={diagX1}
 y1={diagY1}
 x2={diagX2}
 y2={diagY2}
 stroke="hsl(220 60% 55%)"
 strokeWidth={1}
 strokeDasharray="5 3"
 opacity={0.6}
 />
 <text
 x={diagX2 - 4}
 y={diagY2 - 6}
 textAnchor="end"
 fontSize={8}
 fill="hsl(220 60% 55%)"
 opacity={0.8}
 >
 MFE = MAE
 </text>

 {/* Scatter dots */}
 {points.map((p, i) => (
 <circle
 key={i}
 cx={toSVGX(p.mae)}
 cy={toSVGY(p.mfe)}
 r={4}
 fill={p.isWin ? "hsl(142 55% 45%)" : "hsl(0 65% 45%)"}
 fillOpacity={0.8}
 stroke={p.isWin ? "hsl(142 55% 65%)" : "hsl(0 65% 65%)"}
 strokeWidth={0.75}
 />
 ))}

 {/* Axes */}
 <line
 x1={MARGIN.left}
 x2={MARGIN.left + chartW}
 y1={MARGIN.top + chartH}
 y2={MARGIN.top + chartH}
 stroke="hsl(220 13% 30%)"
 strokeWidth={1}
 />
 <line
 x1={MARGIN.left}
 x2={MARGIN.left}
 y1={MARGIN.top}
 y2={MARGIN.top + chartH}
 stroke="hsl(220 13% 30%)"
 strokeWidth={1}
 />

 {/* Axis labels */}
 <text
 x={MARGIN.left + chartW / 2}
 y={H - 4}
 textAnchor="middle"
 fontSize={9}
 fill="hsl(215 20% 45%)"
 >
 MAE — Max Adverse Excursion (% of entry)
 </text>
 <text
 x={14}
 y={MARGIN.top + chartH / 2}
 textAnchor="middle"
 fontSize={9}
 fill="hsl(215 20% 45%)"
 transform={`rotate(-90, 14, ${MARGIN.top + chartH / 2})`}
 >
 MFE — Max Favorable Excursion (%)
 </text>
 </svg>
 </div>

 {/* Legend */}
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5">
 <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600/80" />
 Win trade
 </div>
 <div className="flex items-center gap-1.5">
 <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600/80" />
 Loss trade
 </div>
 <div className="flex items-center gap-1.5">
 <svg width={16} height={8}>
 <line
 x1={0}
 y1={4}
 x2={16}
 y2={4}
 stroke="hsl(220 60% 55%)"
 strokeWidth={1.5}
 strokeDasharray="5 3"
 />
 </svg>
 Break-even line
 </div>
 </div>
 </div>
 );
}
