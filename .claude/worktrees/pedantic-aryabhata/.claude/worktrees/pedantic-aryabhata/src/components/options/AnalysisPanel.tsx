"use client";

import type { ChainAnalytics, OptionChainExpiry } from "@/types/options";
import { CONTRACT_MULTIPLIER, RISK_FREE_RATE } from "@/types/options";
import { blackScholes } from "@/services/options/black-scholes";
import { cn } from "@/lib/utils";

// ── Local format helper ───────────────────────────────────────────────────────

function fmt(n: number): string {
 if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
 if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
 return n.toFixed(0);
}

// ── Seeded PRNG (same algo as chain-generator) ────────────────────────────────

function seededRandom(seed: number): () => number {
 let s = seed;
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AnalysisPanelProps {
 analytics: ChainAnalytics;
 smile: { strike: number; callIV: number; putIV: number }[];
 termStructure: { dte: number; atmIV: number; expiry: string }[];
 oiVol: { strike: number; callOI: number; putOI: number; callVol: number; putVol: number }[];
 chain: OptionChainExpiry[];
 spotPrice?: number;
}

// ── Shared card sub-components ────────────────────────────────────────────────

function CardTitle({
 title,
 subtitle,
}: {
 title: string;
 subtitle?: React.ReactNode;
}) {
 return (
 <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
 <span className="text-xs font-medium text-muted-foreground">
 {title}
 </span>
 {subtitle && (
 <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[11px] text-muted-foreground">
 {subtitle}
 </span>
 )}
 </div>
 );
}

// ── Chart 1: Call vs Put Volume by Expiry ────────────────────────────────────

function VolumeChart({
 analytics,
 chain,
}: {
 analytics: ChainAnalytics;
 chain: OptionChainExpiry[];
}) {
 const volumeData = chain.slice(0, 4).map((exp) => ({
 label: exp.expiry.slice(5),
 callVol: exp.calls.reduce((s, c) => s + c.volume, 0),
 putVol: exp.puts.reduce((s, p) => s + p.volume, 0),
 }));

 const maxVolume = Math.max(1, ...volumeData.flatMap((d) => [d.callVol, d.putVol]));

 const padTop = 15;
 const padBottom = 25;
 const padLeft = 40;
 const padRight = 15;
 const chartW = 300 - padLeft - padRight;
 const chartH = 120 - padTop - padBottom;

 const groupW = volumeData.length > 0 ? chartW / volumeData.length : 60;
 const barW = 22;
 const barGap = 4;

 const toY = (v: number) => padTop + chartH - (v / maxVolume) * chartH;

 const gridLines = [0.25, 0.5, 0.75, 1];

 const subtitle = `Total: ${fmt(analytics.totalCallVolume + analytics.totalPutVolume)} | P/C: ${analytics.putCallRatioVolume.toFixed(2)}`;

 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title="Call vs Put Volume" subtitle={subtitle} />
 <div className="flex-1">
 <svg viewBox="0 0 300 120" className="w-full">
 {/* Y gridlines */}
 {gridLines.map((pct) => {
 const y = padTop + chartH - pct * chartH;
 return (
 <line
 key={pct}
 x1={padLeft}
 y1={y}
 x2={300 - padRight}
 y2={y}
 stroke="currentColor"
 strokeOpacity={0.15}
 strokeWidth={0.5}
 strokeDasharray="3 2"
 className="text-muted-foreground"
 />
 );
 })}

 {/* Y axis label */}
 {gridLines.map((pct) => {
 const y = padTop + chartH - pct * chartH;
 return (
 <text
 key={`label-${pct}`}
 x={padLeft - 3}
 y={y + 3}
 textAnchor="end"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.6}
 >
 {fmt(maxVolume * pct)}
 </text>
 );
 })}

 {/* Bars */}
 {volumeData.map((d, i) => {
 const groupX = padLeft + i * groupW + groupW / 2;
 const callX = groupX - barW - barGap / 2;
 const putX = groupX + barGap / 2;

 const callH = Math.max(1, (d.callVol / maxVolume) * chartH);
 const putH = Math.max(1, (d.putVol / maxVolume) * chartH);

 return (
 <g key={d.label}>
 {/* Call bar */}
 <rect
 x={callX}
 y={toY(d.callVol)}
 width={barW}
 height={callH}
 fill="#10b981"
 fillOpacity={0.75}
 rx={1}
 />
 {/* Put bar */}
 <rect
 x={putX}
 y={toY(d.putVol)}
 width={barW}
 height={putH}
 fill="#ef4444"
 fillOpacity={0.75}
 rx={1}
 />
 {/* X label */}
 <text
 x={groupX}
 y={padTop + chartH + 12}
 textAnchor="middle"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.7}
 >
 {d.label}
 </text>
 </g>
 );
 })}

 {/* Legend */}
 <rect x={padLeft} y={padTop - 10} width={6} height={6} fill="#10b981" fillOpacity={0.8} rx={1} />
 <text x={padLeft + 8} y={padTop - 4} fontSize={7} fill="#10b981" opacity={0.9}>
 Calls
 </text>
 <rect x={padLeft + 36} y={padTop - 10} width={6} height={6} fill="#ef4444" fillOpacity={0.8} rx={1} />
 <text x={padLeft + 44} y={padTop - 4} fontSize={7} fill="#ef4444" opacity={0.9}>
 Puts
 </text>
 </svg>
 </div>
 </div>
 );
}

// ── Chart 2: Volatility Analysis (IV vs HV over time) ────────────────────────

function VolatilityChart({ analytics }: { analytics: ChainAnalytics }) {
 const rand = seededRandom(Math.floor(analytics.atmIV * 1000));

 const ivHistory = Array.from({ length: 20 }, (_, i) => {
 const noise = (rand() - 0.5) * 0.03;
 return Math.max(0.05, analytics.atmIV + noise - i * 0.001);
 });

 const hvHistory = Array.from({ length: 20 }, () => {
 const noise = (rand() - 0.5) * 0.02;
 return Math.max(0.05, analytics.historicalVolatility + noise);
 });

 const allVals = [...ivHistory, ...hvHistory];
 const minV = Math.max(0, Math.min(...allVals) * 0.85);
 const maxV = Math.max(...allVals) * 1.2;

 const padTop = 15;
 const padBottom = 25;
 const padLeft = 40;
 const padRight = 15;
 const svgW = 300;
 const svgH = 120;
 const chartW = svgW - padLeft - padRight;
 const chartH = svgH - padTop - padBottom;

 const toX = (i: number) => padLeft + (i / 19) * chartW;
 const toY = (v: number) =>
 padTop + chartH - ((v - minV) / Math.max(0.001, maxV - minV)) * chartH;

 const ivPath = ivHistory
 .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
 .join(" ");

 const hvPath = hvHistory
 .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
 .join(" ");

 const spread = ((analytics.atmIV - analytics.historicalVolatility) * 100).toFixed(1);
 const spreadSign = analytics.atmIV >= analytics.historicalVolatility ? "+" : "";
 const spreadSubtitle = `IV-HV: ${spreadSign}${spread}%`;

 const gridLines = [0.25, 0.5, 0.75, 1];

 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title="Volatility Analysis" subtitle={spreadSubtitle} />
 <div className="flex-1">
 <svg viewBox="0 0 300 120" className="w-full">
 {/* Gridlines */}
 {gridLines.map((pct) => {
 const v = minV + pct * (maxV - minV);
 const y = toY(v);
 return (
 <line
 key={pct}
 x1={padLeft}
 y1={y}
 x2={svgW - padRight}
 y2={y}
 stroke="currentColor"
 strokeOpacity={0.1}
 strokeWidth={0.5}
 strokeDasharray="3 2"
 className="text-muted-foreground"
 />
 );
 })}

 {/* Y axis labels */}
 {gridLines.map((pct) => {
 const v = minV + pct * (maxV - minV);
 const y = toY(v);
 return (
 <text
 key={`yl-${pct}`}
 x={padLeft - 3}
 y={y + 3}
 textAnchor="end"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.6}
 >
 {(v * 100).toFixed(0)}%
 </text>
 );
 })}

 {/* HV dashed line */}
 <path
 d={hvPath}
 fill="none"
 stroke="#60a5fa"
 strokeWidth={1.5}
 strokeDasharray="4 2"
 strokeOpacity={0.8}
 />

 {/* IV solid line */}
 <path
 d={ivPath}
 fill="none"
 stroke="#f97316"
 strokeWidth={1.5}
 strokeOpacity={0.9}
 />

 {/* X axis ticks */}
 {[0, 5, 10, 15, 19].map((i) => (
 <text
 key={i}
 x={toX(i)}
 y={svgH - padBottom + 12}
 textAnchor="middle"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.6}
 >
 {i === 0 ? "-20d" : i === 19 ? "now" : `-${19 - i}d`}
 </text>
 ))}

 {/* Legend top-right */}
 <rect x={svgW - padRight - 70} y={padTop - 10} width={6} height={6} fill="#f97316" fillOpacity={0.9} rx={1} />
 <text x={svgW - padRight - 62} y={padTop - 4} fontSize={7} fill="#f97316" opacity={0.9}>
 IV
 </text>
 <rect x={svgW - padRight - 40} y={padTop - 10} width={6} height={6} fill="#60a5fa" fillOpacity={0.8} rx={1} />
 <text x={svgW - padRight - 32} y={padTop - 4} fontSize={7} fill="#60a5fa" opacity={0.9}>
 HV
 </text>
 </svg>
 </div>
 </div>
 );
}

// ── Chart 3 & 4: Horizontal bar chart (Volume or OI by Strike) ───────────────

function HorizontalStrikeChart({
 title,
 oiVol,
 useOI,
 subtitle,
}: {
 title: string;
 oiVol: { strike: number; callOI: number; putOI: number; callVol: number; putVol: number }[];
 useOI: boolean;
 subtitle?: string;
}) {
 if (oiVol.length === 0) {
 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title={title} subtitle={subtitle} />
 <div className="flex flex-1 items-center justify-center py-8">
 <span className="text-xs text-muted-foreground">No data</span>
 </div>
 </div>
 );
 }

 // Determine ATM index (middle of the array)
 const midIdx = Math.floor(oiVol.length / 2);
 const atmStart = Math.max(0, midIdx - 7);
 const atmEnd = Math.min(oiVol.length, midIdx + 7);
 const visible = oiVol.slice(atmStart, atmEnd);

 const atmStrike = oiVol[midIdx].strike;

 const callValues = visible.map((d) => (useOI ? d.callOI : d.callVol));
 const putValues = visible.map((d) => (useOI ? d.putOI : d.putVol));
 const maxVal = Math.max(1, ...callValues, ...putValues);

 const svgW = 300;
 const svgH = 160;
 const padTop = 8;
 const padBottom = 8;
 const rowCount = visible.length;
 const rowH = rowCount > 0 ? (svgH - padTop - padBottom) / rowCount : 16;
 const centerX = 150;
 const labelW = 40;
 const maxBarHalf = 110 - labelW / 2;

 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title={title} subtitle={subtitle} />
 <div className="flex-1">
 <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
 {/* Header labels */}
 <text x={centerX - labelW / 2 - 4} y={padTop + 6} textAnchor="end" fontSize={7} fill="#10b981" opacity={0.7}>
 Calls
 </text>
 <text x={centerX + labelW / 2 + 4} y={padTop + 6} textAnchor="start" fontSize={7} fill="#ef4444" opacity={0.7}>
 Puts
 </text>

 {visible.map((d, i) => {
 const callVal = useOI ? d.callOI : d.callVol;
 const putVal = useOI ? d.putOI : d.putVol;
 const y = padTop + i * rowH + rowH / 2;
 const callBarW = (callVal / maxVal) * maxBarHalf;
 const putBarW = (putVal / maxVal) * maxBarHalf;
 const isAtm = d.strike === atmStrike;
 const barH = Math.max(3, rowH - 3);

 return (
 <g key={d.strike}>
 {/* Call bar (left) */}
 <rect
 x={centerX - labelW / 2 - callBarW}
 y={y - barH / 2}
 width={callBarW}
 height={barH}
 fill="#10b981"
 fillOpacity={isAtm ? 0.9 : 0.55}
 rx={1}
 />
 {/* Put bar (right) */}
 <rect
 x={centerX + labelW / 2}
 y={y - barH / 2}
 width={putBarW}
 height={barH}
 fill="#ef4444"
 fillOpacity={isAtm ? 0.9 : 0.55}
 rx={1}
 />
 {/* Strike label */}
 <text
 x={centerX}
 y={y + 3}
 textAnchor="middle"
 fontSize={isAtm ? 7.5 : 6.5}
 fontWeight={isAtm ? "bold" : "normal"}
 fill={isAtm ? "#f97316" : "currentColor"}
 className={isAtm ? "" : "text-muted-foreground"}
 opacity={isAtm ? 1 : 0.7}
 >
 {d.strike}
 </text>
 </g>
 );
 })}

 {/* Center divider line */}
 <line
 x1={centerX - labelW / 2}
 y1={padTop + 12}
 x2={centerX - labelW / 2}
 y2={svgH - padBottom}
 stroke="currentColor"
 strokeOpacity={0.15}
 strokeWidth={0.5}
 className="text-muted-foreground"
 />
 <line
 x1={centerX + labelW / 2}
 y1={padTop + 12}
 x2={centerX + labelW / 2}
 y2={svgH - padBottom}
 stroke="currentColor"
 strokeOpacity={0.15}
 strokeWidth={0.5}
 className="text-muted-foreground"
 />
 </svg>
 </div>
 </div>
 );
}

// ── Chart 5: Volatility Smile ─────────────────────────────────────────────────

function VolSmileChart({
 smile,
}: {
 smile: { strike: number; callIV: number; putIV: number }[];
}) {
 if (smile.length === 0) {
 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title="Volatility Smile" />
 <div className="flex flex-1 items-center justify-center py-8">
 <span className="text-xs text-muted-foreground">No data</span>
 </div>
 </div>
 );
 }

 const strikes = smile.map((s) => s.strike);
 const allIV = smile.flatMap((s) => [s.callIV, s.putIV]);

 const minStrike = Math.min(...strikes);
 const maxStrike = Math.max(...strikes);
 const minIV = Math.max(0, Math.min(...allIV) * 0.85);
 const maxIV = Math.max(...allIV) * 1.15;

 const padTop = 15;
 const padBottom = 25;
 const padLeft = 40;
 const padRight = 15;
 const svgW = 300;
 const svgH = 120;
 const chartW = svgW - padLeft - padRight;
 const chartH = svgH - padTop - padBottom;

 const toX = (strike: number) =>
 padLeft + ((strike - minStrike) / Math.max(1, maxStrike - minStrike)) * chartW;
 const toY = (iv: number) =>
 padTop + chartH - ((iv - minIV) / Math.max(0.001, maxIV - minIV)) * chartH;

 const midStrike = (minStrike + maxStrike) / 2;
 const spotX = toX(midStrike);

 const callPath = smile
 .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.strike).toFixed(1)},${toY(d.callIV).toFixed(1)}`)
 .join(" ");

 const putPath = smile
 .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.strike).toFixed(1)},${toY(d.putIV).toFixed(1)}`)
 .join(" ");

 // Axis ticks: show ~4 strikes
 const tickStrides = Math.max(1, Math.floor(smile.length / 4));
 const xTicks = smile.filter((_, i) => i % tickStrides === 0 || i === smile.length - 1);

 const yTicks = [minIV, minIV + (maxIV - minIV) * 0.5, maxIV];

 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title="Volatility Smile" />
 <div className="flex-1">
 <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
 {/* Gridlines */}
 {yTicks.map((iv, i) => {
 const y = toY(iv);
 return (
 <line
 key={i}
 x1={padLeft}
 y1={y}
 x2={svgW - padRight}
 y2={y}
 stroke="currentColor"
 strokeOpacity={0.1}
 strokeWidth={0.5}
 strokeDasharray="3 2"
 className="text-muted-foreground"
 />
 );
 })}

 {/* Y axis labels */}
 {yTicks.map((iv, i) => (
 <text
 key={i}
 x={padLeft - 3}
 y={toY(iv) + 3}
 textAnchor="end"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.6}
 >
 {(iv * 100).toFixed(0)}%
 </text>
 ))}

 {/* Spot price vertical line */}
 <line
 x1={spotX}
 y1={padTop}
 x2={spotX}
 y2={padTop + chartH}
 stroke="#6b7280"
 strokeOpacity={0.4}
 strokeWidth={1}
 strokeDasharray="3 2"
 />

 {/* Put IV dashed (orange) */}
 <path
 d={putPath}
 fill="none"
 stroke="#f97316"
 strokeWidth={1.5}
 strokeDasharray="4 2"
 strokeOpacity={0.85}
 />

 {/* Call IV solid (blue) */}
 <path
 d={callPath}
 fill="none"
 stroke="#60a5fa"
 strokeWidth={1.5}
 strokeOpacity={0.9}
 />

 {/* X axis labels */}
 {xTicks.map((d) => (
 <text
 key={d.strike}
 x={toX(d.strike)}
 y={svgH - padBottom + 12}
 textAnchor="middle"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.6}
 >
 {d.strike}
 </text>
 ))}

 {/* Legend */}
 <rect x={padLeft} y={padTop - 10} width={6} height={6} fill="#60a5fa" fillOpacity={0.9} rx={1} />
 <text x={padLeft + 8} y={padTop - 4} fontSize={7} fill="#60a5fa" opacity={0.9}>
 Call IV
 </text>
 <rect x={padLeft + 44} y={padTop - 10} width={6} height={6} fill="#f97316" fillOpacity={0.9} rx={1} />
 <text x={padLeft + 52} y={padTop - 4} fontSize={7} fill="#f97316" opacity={0.9}>
 Put IV
 </text>
 </svg>
 </div>
 </div>
 );
}

// ── Chart 6: Volatility Term Structure ───────────────────────────────────────

function TermStructureChart({
 termStructure,
}: {
 termStructure: { dte: number; atmIV: number; expiry: string }[];
}) {
 if (termStructure.length === 0) {
 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title="Vol Term Structure" />
 <div className="flex flex-1 items-center justify-center py-8">
 <span className="text-xs text-muted-foreground">No data</span>
 </div>
 </div>
 );
 }

 const dtes = termStructure.map((t) => t.dte);
 const ivs = termStructure.map((t) => t.atmIV);

 const minDTE = Math.min(...dtes);
 const maxDTE = Math.max(...dtes);
 const minIV = Math.max(0, Math.min(...ivs) * 0.85);
 const maxIV = Math.max(...ivs) * 1.15;

 const padTop = 15;
 const padBottom = 25;
 const padLeft = 40;
 const padRight = 15;
 const svgW = 300;
 const svgH = 120;
 const chartW = svgW - padLeft - padRight;
 const chartH = svgH - padTop - padBottom;

 const toX = (dte: number) =>
 padLeft + ((dte - minDTE) / Math.max(1, maxDTE - minDTE)) * chartW;
 const toY = (iv: number) =>
 padTop + chartH - ((iv - minIV) / Math.max(0.001, maxIV - minIV)) * chartH;

 const linePath = termStructure
 .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.dte).toFixed(1)},${toY(d.atmIV).toFixed(1)}`)
 .join(" ");

 const gridLines = [0.25, 0.5, 0.75, 1];

 return (
 <div className="flex flex-col rounded-lg border border-border bg-card">
 <CardTitle title="Vol Term Structure" />
 <div className="flex-1">
 <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
 {/* Gridlines */}
 {gridLines.map((pct) => {
 const iv = minIV + pct * (maxIV - minIV);
 const y = toY(iv);
 return (
 <line
 key={pct}
 x1={padLeft}
 y1={y}
 x2={svgW - padRight}
 y2={y}
 stroke="currentColor"
 strokeOpacity={0.1}
 strokeWidth={0.5}
 strokeDasharray="3 2"
 className="text-muted-foreground"
 />
 );
 })}

 {/* Y axis labels */}
 {gridLines.map((pct) => {
 const iv = minIV + pct * (maxIV - minIV);
 const y = toY(iv);
 return (
 <text
 key={`yl-${pct}`}
 x={padLeft - 3}
 y={y + 3}
 textAnchor="end"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.6}
 >
 {(iv * 100).toFixed(0)}%
 </text>
 );
 })}

 {/* Line */}
 <path
 d={linePath}
 fill="none"
 stroke="#10b981"
 strokeWidth={1.5}
 strokeOpacity={0.85}
 />

 {/* Dots + X labels */}
 {termStructure.map((d) => (
 <g key={d.dte}>
 <circle
 cx={toX(d.dte)}
 cy={toY(d.atmIV)}
 r={3}
 fill="#10b981"
 fillOpacity={0.9}
 />
 <text
 x={toX(d.dte)}
 y={svgH - padBottom + 12}
 textAnchor="middle"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground"
 opacity={0.7}
 >
 {d.dte}D
 </text>
 </g>
 ))}
 </svg>
 </div>
 </div>
 );
}

// ── Scenario Analysis (3×3 price × IV grid) ──────────────────────────────────

function ScenarioAnalysis({
 analytics,
 spotPrice,
}: {
 analytics: ChainAnalytics;
 spotPrice: number;
}) {
 if (spotPrice <= 0) return null;

 const strike = spotPrice; // ATM
 const dte = 30;
 const T = dte / 365;
 const baseIV = Math.max(analytics.atmIV, 0.05);

 // Reference price
 const refPrice = blackScholes(spotPrice, strike, T, RISK_FREE_RATE, baseIV, "call");

 const priceChanges = [-0.10, 0, 0.10];
 const ivChanges = [-0.05, 0, 0.05];

 const cells: { pricePct: number; ivChange: number; pnl: number }[] = [];
 for (const p of priceChanges) {
 for (const iv of ivChanges) {
 const newSpot = spotPrice * (1 + p);
 const newIV = Math.max(baseIV + iv, 0.01);
 const newPrice = blackScholes(newSpot, strike, T, RISK_FREE_RATE, newIV, "call");
 const pnl = (newPrice - refPrice) * CONTRACT_MULTIPLIER;
 cells.push({ pricePct: p, ivChange: iv, pnl: +pnl.toFixed(2) });
 }
 }

 const maxAbsPnL = Math.max(1, ...cells.map((c) => Math.abs(c.pnl)));

 function cellColor(pnl: number): string {
 const intensity = Math.min(1, Math.abs(pnl) / maxAbsPnL);
 if (pnl > 0) {
 const g = Math.round(180 + intensity * 75);
 return `rgba(16, ${g}, 129, ${0.15 + intensity * 0.45})`;
 } else {
 const r = Math.round(180 + intensity * 75);
 return `rgba(${r}, 68, 68, ${0.15 + intensity * 0.45})`;
 }
 }

 return (
 <div className="col-span-2 flex flex-col rounded-lg border border-border bg-card">
 <CardTitle
 title="Scenario Analysis — ATM Call P&L"
 subtitle={`Base: $${refPrice.toFixed(2)} | T=${dte}d | IV=${(baseIV * 100).toFixed(0)}%`}
 />
 <div className="p-3">
 <div className="overflow-x-auto">
 <table className="w-full text-center text-xs">
 <thead>
 <tr>
 <th className="pb-2 pr-2 text-left text-[11px] font-semibold text-muted-foreground">
 Price \ IV
 </th>
 {ivChanges.map((iv) => (
 <th key={iv} className="pb-2 text-[11px] font-semibold text-muted-foreground">
 {iv > 0 ? "+" : ""}{(iv * 100).toFixed(0)}pp IV
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {priceChanges.map((p) => (
 <tr key={p}>
 <td className={cn("py-1 pr-2 text-left font-semibold", p > 0 ? "text-emerald-400" : p < 0 ? "text-red-400" : "text-muted-foreground")}>
 {p > 0 ? "+" : ""}{(p * 100).toFixed(0)}%
 </td>
 {ivChanges.map((iv) => {
 const cell = cells.find((c) => c.pricePct === p && c.ivChange === iv);
 const pnl = cell?.pnl ?? 0;
 return (
 <td
 key={iv}
 className="rounded px-3 py-1.5 font-mono font-semibold"
 style={{ backgroundColor: cellColor(pnl), color: pnl >= 0 ? "#10b981" : "#ef4444" }}
 >
 {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(0)}
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="mt-2 text-[11px] text-muted-foreground">
 P&L per 1 ATM call contract (100 shares) vs. base scenario. Rows = price change; Cols = IV change.
 </p>
 </div>
 </div>
 );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AnalysisPanel({
 analytics,
 smile,
 termStructure,
 oiVol,
 chain,
 spotPrice = 0,
}: AnalysisPanelProps) {
 // Max-pain strike: where total OI (call + put) is highest
 const atmStrike =
 oiVol.length > 0
 ? oiVol.reduce((best, d) =>
 d.callOI + d.putOI > best.callOI + best.putOI ? d : best,
 ).strike
 : 0;

 const oiSubtitle = atmStrike > 0 ? `Max Pain est. near $${atmStrike}` : undefined;

 return (
 <div className={cn("overflow-auto p-3")}>
 <div className="grid grid-cols-2 gap-3">
 {/* Chart 1: Call vs Put Volume */}
 <VolumeChart analytics={analytics} chain={chain} />

 {/* Chart 2: IV vs HV over time */}
 <VolatilityChart analytics={analytics} />

 {/* Chart 3: Volume by Strike */}
 <HorizontalStrikeChart
 title="Volume by Strike"
 oiVol={oiVol}
 useOI={false}
 />

 {/* Chart 4: Open Interest by Strike */}
 <HorizontalStrikeChart
 title="Open Interest by Strike"
 oiVol={oiVol}
 useOI={true}
 subtitle={oiSubtitle}
 />

 {/* Chart 5: Volatility Smile */}
 <VolSmileChart smile={smile} />

 {/* Chart 6: Volatility Term Structure */}
 <TermStructureChart termStructure={termStructure} />

 {/* Chart 7: Scenario Analysis */}
 {spotPrice > 0 && (
 <ScenarioAnalysis analytics={analytics} spotPrice={spotPrice} />
 )}
 </div>
 </div>
 );
}
