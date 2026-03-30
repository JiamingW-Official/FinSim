"use client";

import { motion } from "framer-motion";

const PRICE_POINTS = [40, 55, 45, 60, 50, 65, 70, 55, 75, 80, 68, 85, 78, 90];
const SMA_POINTS = [40, 47, 46, 53, 51, 57, 62, 58, 66, 72, 70, 76, 77, 84];

function toPath(points: number[], width: number, height: number): string {
 const xStep = width / (points.length - 1);
 const maxVal = Math.max(...points, ...SMA_POINTS);
 const minVal = Math.min(...points, ...SMA_POINTS);
 const range = maxVal - minVal || 1;
 const padding = 10;
 const plotH = height - padding * 2;

 return points
 .map((p, i) => {
 const x = i * xStep;
 const y = padding + plotH - ((p - minVal) / range) * plotH;
 return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
 })
 .join(" ");
}

export function IndicatorDiagram() {
 const w = 280;
 const h = 120;
 const pricePath = toPath(PRICE_POINTS, w, h);
 const smaPath = toPath(SMA_POINTS, w, h);

 return (
 <div className="flex flex-col items-center gap-2 py-4">
 <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
 {/* Grid lines */}
 {[0.25, 0.5, 0.75].map((f) => (
 <line
 key={f}
 x1="0" y1={h * f} x2={w} y2={h * f}
 stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4"
 />
 ))}
 {/* Price line */}
 <motion.path
 d={pricePath}
 fill="none" stroke="#10b981" strokeWidth="2"
 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
 transition={{ duration: 1.5, ease: "easeInOut" }}
 />
 {/* SMA overlay */}
 <motion.path
 d={smaPath}
 fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3"
 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
 transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
 />
 </svg>
 <div className="flex items-center gap-4 text-xs">
 <span className="flex items-center gap-1">
 <span className="inline-block h-0.5 w-4 bg-profit" /> Price
 </span>
 <span className="flex items-center gap-1">
 <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-warning" /> SMA
 </span>
 </div>
 </div>
 );
}
