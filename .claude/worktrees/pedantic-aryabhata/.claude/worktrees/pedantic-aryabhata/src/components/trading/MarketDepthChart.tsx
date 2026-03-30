"use client";

import { useMemo } from "react";
import { generateOrderBook } from "@/services/market-data/order-book";

interface MarketDepthChartProps {
 ticker: string;
 currentPrice: number;
 priceMin: number;
 priceMax: number;
}

const WIDTH = 280;
const HEIGHT = 120;
const PADDING = { top: 8, right: 8, bottom: 20, left: 36 };
const CHART_W = WIDTH - PADDING.left - PADDING.right;
const CHART_H = HEIGHT - PADDING.top - PADDING.bottom;

function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
 if (inMax === inMin) return outMin;
 return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function formatK(n: number): string {
 if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
 if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
 return n.toString();
}

export function MarketDepthChart({ ticker, currentPrice, priceMin, priceMax }: MarketDepthChartProps) {
 const book = useMemo(
 () => generateOrderBook(ticker, currentPrice, 30),
 [ticker, currentPrice],
 );

 // Build cumulative depth arrays within [priceMin, priceMax]
 const { bidPoints, askPoints, maxDepth } = useMemo(() => {
 // bids are sorted desc, filter to price range
 const filteredBids = book.bids
 .filter((l) => l.price >= priceMin && l.price <= priceMax)
 .slice()
 .sort((a, b) => a.price - b.price); // asc for charting

 // asks sorted asc, filter to range
 const filteredAsks = book.asks.filter(
 (l) => l.price >= priceMin && l.price <= priceMax,
 );

 // Rebuild cumulative sums for filtered data
 let cumBid = 0;
 const bidPts: Array<{ price: number; cum: number }> = [];
 // Bids: accumulate from mid down. We want the "wall" shape:
 // at mid price, cum=0, as price decreases, cum increases.
 // filteredBids is sorted asc price, so we iterate reversed to go from mid down
 const bidsFromMid = [...filteredBids].reverse();
 for (const level of bidsFromMid) {
 cumBid += level.size;
 bidPts.push({ price: level.price, cum: cumBid });
 }

 let cumAsk = 0;
 const askPts: Array<{ price: number; cum: number }> = [];
 for (const level of filteredAsks) {
 cumAsk += level.size;
 askPts.push({ price: level.price, cum: cumAsk });
 }

 const maxBid = bidPts.length > 0 ? Math.max(...bidPts.map((p) => p.cum)) : 1;
 const maxAsk = askPts.length > 0 ? Math.max(...askPts.map((p) => p.cum)) : 1;
 const maxD = Math.max(maxBid, maxAsk, 1);

 return { bidPoints: bidPts, askPoints: askPts, maxDepth: maxD };
 }, [book, priceMin, priceMax]);

 // Convert to SVG coordinates
 const toX = (price: number) =>
 PADDING.left + lerp(price, priceMin, priceMax, 0, CHART_W);
 const toY = (cum: number) =>
 PADDING.top + lerp(cum, maxDepth, 0, 0, CHART_H);

 // Build bid area path (starts at mid price x, y bottom, goes left)
 const midX = toX(book.midpoint);
 const bottomY = PADDING.top + CHART_H;

 const bidPath = useMemo(() => {
 if (bidPoints.length === 0) return "";
 // Start at midpoint bottom, draw up-then-left step chart
 let d = `M ${midX} ${bottomY}`;
 // bidPoints sorted by price descending from mid
 // For each level, draw a step: go to that price x, then go down to that cum y
 let prevY = bottomY;
 for (const pt of bidPoints) {
 const x = toX(pt.price);
 const y = toY(pt.cum);
 // Horizontal step then vertical step
 d += ` L ${x} ${prevY}`;
 d += ` L ${x} ${y}`;
 prevY = y;
 }
 // Close the area
 const leftX = PADDING.left;
 d += ` L ${leftX} ${prevY}`;
 d += ` L ${leftX} ${bottomY}`;
 d += " Z";
 return d;
 }, [bidPoints, midX, bottomY]); // eslint-disable-line react-hooks/exhaustive-deps

 const askPath = useMemo(() => {
 if (askPoints.length === 0) return "";
 let d = `M ${midX} ${bottomY}`;
 let prevY = bottomY;
 for (const pt of askPoints) {
 const x = toX(pt.price);
 const y = toY(pt.cum);
 d += ` L ${x} ${prevY}`;
 d += ` L ${x} ${y}`;
 prevY = y;
 }
 const rightX = PADDING.left + CHART_W;
 d += ` L ${rightX} ${prevY}`;
 d += ` L ${rightX} ${bottomY}`;
 d += " Z";
 return d;
 }, [askPoints, midX, bottomY]); // eslint-disable-line react-hooks/exhaustive-deps

 // Y-axis ticks
 const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((f) => ({
 value: Math.round(maxDepth * f),
 y: toY(maxDepth * f),
 }));

 // X-axis ticks: 5 evenly spaced prices
 const xTicks = Array.from({ length: 5 }, (_, i) => {
 const price = priceMin + ((priceMax - priceMin) * i) / 4;
 return { price, x: toX(price) };
 });

 return (
 <div className="rounded-lg border border-border bg-card overflow-hidden">
 <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
 <span className="text-xs font-semibold text-muted-foreground">
 Market Depth
 </span>
 <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
 Mid: ${book.midpoint.toFixed(2)}
 </span>
 </div>

 <svg
 viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
 width="100%"
 height={HEIGHT}
 className="block"
 style={{ background: "transparent" }}
 >
 {/* Grid lines */}
 {yTicks.slice(1).map((tick, i) => (
 <line
 key={i}
 x1={PADDING.left}
 y1={tick.y}
 x2={PADDING.left + CHART_W}
 y2={tick.y}
 stroke="currentColor"
 strokeWidth={0.5}
 className="text-border"
 strokeDasharray="2 3"
 />
 ))}

 {/* Bid area */}
 {bidPath && (
 <path
 d={bidPath}
 fill="rgb(16,185,129)"
 fillOpacity={0.15}
 stroke="rgb(16,185,129)"
 strokeWidth={1.5}
 strokeOpacity={0.7}
 />
 )}

 {/* Ask area */}
 {askPath && (
 <path
 d={askPath}
 fill="rgb(239,68,68)"
 fillOpacity={0.15}
 stroke="rgb(239,68,68)"
 strokeWidth={1.5}
 strokeOpacity={0.7}
 />
 )}

 {/* Mid price line */}
 <line
 x1={midX}
 y1={PADDING.top}
 x2={midX}
 y2={bottomY}
 stroke="rgb(148,163,184)"
 strokeWidth={1}
 strokeDasharray="3 3"
 strokeOpacity={0.6}
 />

 {/* Y-axis labels */}
 {yTicks.slice(1).map((tick, i) => (
 <text
 key={i}
 x={PADDING.left - 3}
 y={tick.y + 3}
 textAnchor="end"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground/60"
 >
 {formatK(tick.value)}
 </text>
 ))}

 {/* X-axis labels */}
 {xTicks.map((tick, i) => (
 <text
 key={i}
 x={tick.x}
 y={HEIGHT - 4}
 textAnchor="middle"
 fontSize={7}
 fill="currentColor"
 className="text-muted-foreground/60"
 >
 {tick.price.toFixed(0)}
 </text>
 ))}

 {/* Axes */}
 <line
 x1={PADDING.left}
 y1={PADDING.top}
 x2={PADDING.left}
 y2={bottomY}
 stroke="currentColor"
 strokeWidth={0.5}
 className="text-border"
 />
 <line
 x1={PADDING.left}
 y1={bottomY}
 x2={PADDING.left + CHART_W}
 y2={bottomY}
 stroke="currentColor"
 strokeWidth={0.5}
 className="text-border"
 />
 </svg>

 {/* Legend */}
 <div className="flex items-center justify-center gap-4 px-2 pb-1.5 text-[11px]">
 <div className="flex items-center gap-1">
 <div className="w-3 h-1.5 rounded-sm bg-emerald-500/70" />
 <span className="text-muted-foreground/70">Bids</span>
 </div>
 <div className="flex items-center gap-1">
 <div className="w-3 h-1.5 rounded-sm bg-red-500/70" />
 <span className="text-muted-foreground/70">Asks</span>
 </div>
 </div>
 </div>
 );
}
