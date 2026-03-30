"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
 createChart,
 type IChartApi,
 ColorType,
 CandlestickSeries,
 HistogramSeries,
 type UTCTimestamp,
} from "lightweight-charts";

// ── Realistic AAPL-like 5-minute intraday data ──────────────────────────────
// Pattern: gap up open → morning sell-off → lunch consolidation → afternoon rally
function generateRealisticIntraday() {
 const bars: {
 time: UTCTimestamp;
 open: number;
 high: number;
 low: number;
 close: number;
 volume: number;
 }[] = [];

 // Seeded PRNG for determinism
 let seed = 42;
 const rand = () => {
 seed = (seed * 1103515245 + 12345) & 0x7fffffff;
 return (seed >>> 0) / 0x7fffffff;
 };

 // Start at $191.50, base date for 5-min bars
 const baseTime = new Date("2024-11-15T09:30:00Z").getTime() / 1000;
 let price = 191.5;

 // Phase definitions: [numBars, drift, volatility, volumeBase]
 const phases: [number, number, number, number][] = [
 [6, 0.12, 0.35, 800000], // 9:30-10:00 — opening pop, high vol
 [6, -0.08, 0.25, 600000], // 10:00-10:30 — profit taking
 [6, -0.15, 0.30, 700000], // 10:30-11:00 — morning sell-off
 [6, 0.05, 0.18, 400000], // 11:00-11:30 — bounce attempt
 [6, -0.03, 0.12, 250000], // 11:30-12:00 — lunch consolidation
 [6, 0.02, 0.10, 200000], // 12:00-12:30 — quiet lunch
 [6, -0.01, 0.08, 180000], // 12:30-13:00 — dead zone
 [6, 0.04, 0.12, 300000], // 13:00-13:30 — early afternoon
 [6, 0.10, 0.20, 500000], // 13:30-14:00 — breakout begins
 [6, 0.18, 0.28, 650000], // 14:00-14:30 — strong rally
 [6, -0.05, 0.22, 550000], // 14:30-15:00 — pullback
 [6, 0.15, 0.25, 700000], // 15:00-15:30 — power hour
 [6, 0.08, 0.20, 900000], // 15:30-16:00 — closing rush
 ];

 let barIdx = 0;
 for (const [numBars, drift, vol, volBase] of phases) {
 for (let j = 0; j < numBars; j++) {
 const open = price;
 // Random walk with drift
 const move = drift / numBars + vol * (rand() - 0.5);
 const close = open + move;
 const wickUp = Math.abs(move) * (0.3 + rand() * 0.7);
 const wickDown = Math.abs(move) * (0.3 + rand() * 0.7);
 const high = Math.max(open, close) + wickUp;
 const low = Math.min(open, close) - wickDown;
 const volume = Math.round(volBase * (0.6 + rand() * 0.8));

 bars.push({
 time: (baseTime + barIdx * 300) as UTCTimestamp, // 5-min intervals
 open: Math.round(open * 100) / 100,
 high: Math.round(high * 100) / 100,
 low: Math.round(low * 100) / 100,
 close: Math.round(close * 100) / 100,
 volume,
 });

 price = close;
 barIdx++;
 }
 }

 return bars;
}

const DEMO_DATA = generateRealisticIntraday();
const lastBar = DEMO_DATA[DEMO_DATA.length - 1];
const firstBar = DEMO_DATA[0];
const dayChange = lastBar.close - firstBar.open;
const dayChangePct = (dayChange / firstBar.open) * 100;

export function LandingDemoChart() {
 const containerRef = useRef<HTMLDivElement>(null);
 const chartRef = useRef<IChartApi | null>(null);
 const [hoverPrice, setHoverPrice] = useState<number | null>(null);
 const [hoverTime, setHoverTime] = useState<string | null>(null);

 const displayPrice = hoverPrice ?? lastBar.close;
 const displayChange = displayPrice - firstBar.open;
 const displayChangePct = (displayChange / firstBar.open) * 100;

 const initChart = useCallback(() => {
 if (!containerRef.current) return;

 // Clean up old chart
 if (chartRef.current) {
 chartRef.current.remove();
 chartRef.current = null;
 }

 const chart = createChart(containerRef.current, {
 layout: {
 background: { type: ColorType.Solid, color: "transparent" },
 textColor: "#5a6370",
 fontSize: 10,
 fontFamily: "Inter, system-ui, sans-serif",
 attributionLogo: false,
 },
 grid: {
 vertLines: { color: "rgba(255,255,255,0.03)" },
 horzLines: { color: "rgba(255,255,255,0.03)" },
 },
 crosshair: {
 vertLine: { color: "rgba(255,255,255,0.1)", width: 1, style: 2, labelVisible: false },
 horzLine: { color: "rgba(255,255,255,0.1)", width: 1, style: 2, labelVisible: true },
 },
 rightPriceScale: {
 borderVisible: false,
 textColor: "#5a6370",
 scaleMargins: { top: 0.08, bottom: 0.18 },
 },
 timeScale: {
 borderVisible: false,
 timeVisible: true,
 secondsVisible: false,
 rightOffset: 5,
 barSpacing: 6,
 tickMarkFormatter: (time: UTCTimestamp) => {
 const d = new Date(time * 1000);
 const h = d.getUTCHours().toString().padStart(2, "0");
 const m = d.getUTCMinutes().toString().padStart(2, "0");
 return `${h}:${m}`;
 },
 },
 handleScroll: { mouseWheel: true, pressedMouseMove: true },
 handleScale: { mouseWheel: true, pinch: true },
 });

 const candleSeries = chart.addSeries(CandlestickSeries, {
 upColor: "#10b981",
 downColor: "#ef4444",
 borderUpColor: "#10b981",
 borderDownColor: "#ef4444",
 wickUpColor: "#10b981",
 wickDownColor: "#ef4444",
 });

 candleSeries.setData(DEMO_DATA);

 // Volume
 const volumeSeries = chart.addSeries(HistogramSeries, {
 priceFormat: { type: "volume" },
 priceScaleId: "volume",
 });
 chart.priceScale("volume").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 volumeSeries.setData(
 DEMO_DATA.map((d) => ({
 time: d.time,
 value: d.volume,
 color: d.close >= d.open ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
 }))
 );

 chart.timeScale().fitContent();

 // Crosshair move handler
 chart.subscribeCrosshairMove((param) => {
 if (!param.time || !param.seriesData) {
 setHoverPrice(null);
 setHoverTime(null);
 return;
 }
 const data = param.seriesData.get(candleSeries) as { close?: number } | undefined;
 if (data?.close) {
 setHoverPrice(data.close);
 const d = new Date((param.time as number) * 1000);
 const h = d.getUTCHours().toString().padStart(2, "0");
 const m = d.getUTCMinutes().toString().padStart(2, "0");
 setHoverTime(`${h}:${m}`);
 }
 });

 chartRef.current = chart;
 }, []);

 useEffect(() => {
 initChart();
 const ro = new ResizeObserver(() => {
 if (chartRef.current && containerRef.current) {
 chartRef.current.applyOptions({
 width: containerRef.current.clientWidth,
 height: containerRef.current.clientHeight,
 });
 }
 });
 if (containerRef.current) ro.observe(containerRef.current);
 return () => {
 ro.disconnect();
 chartRef.current?.remove();
 chartRef.current = null;
 };
 }, [initChart]);

 return (
 <div className="rounded-lg border border-border bg-card overflow-hidden">
 {/* App content */}
 <div className="flex">
 {/* Chart area */}
 <div className="flex-1 min-w-0">
 {/* Ticker bar */}
 <div className="flex items-center gap-3 px-3 pt-3 pb-1 sm:px-4">
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold tracking-tight">AAPL</span>
 <span className="text-xs font-semibold tabular-nums text-foreground">
 ${displayPrice.toFixed(2)}
 </span>
 <span
 className={`text-[10px] font-medium tabular-nums ${
 displayChange >= 0 ? "text-emerald-400/80" : "text-red-400/80"
 }`}
 >
 {displayChange >= 0 ? "+" : ""}
 {displayChange.toFixed(2)} ({displayChangePct >= 0 ? "+" : ""}
 {displayChangePct.toFixed(2)}%)
 </span>
 {hoverTime && (
 <span className="text-[10px] text-muted-foreground/50 tabular-nums">
 {hoverTime}
 </span>
 )}
 </div>
 <div className="hidden sm:flex items-center gap-1 ml-auto">
 {["5m", "15m", "1h", "1D", "1W"].map((t) => (
 <span
 key={t}
 className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
 t === "5m"
 ? "bg-foreground/10 text-foreground"
 : "text-muted-foreground/40"
 }`}
 >
 {t}
 </span>
 ))}
 </div>
 </div>

 {/* Interactive chart */}
 <div ref={containerRef} className="w-full h-[220px] sm:h-[260px]" />
 </div>

 {/* Order entry panel */}
 <div className="hidden sm:flex w-44 border-l border-border p-3 flex-col gap-2">
 <div className="text-[10px] font-medium text-muted-foreground">
 Order Entry
 </div>
 <div className="flex gap-1">
 <div className="flex-1 rounded-md bg-foreground/10 text-foreground text-[10px] font-medium text-center py-1.5 cursor-pointer hover:bg-foreground/15 transition-colors">
 Buy
 </div>
 <div className="flex-1 rounded-md bg-muted/60 text-muted-foreground text-[10px] font-medium text-center py-1.5 cursor-pointer hover:bg-muted transition-colors">
 Sell
 </div>
 </div>
 <div className="space-y-1.5">
 <div>
 <div className="text-[9px] text-muted-foreground/60 mb-0.5">Shares</div>
 <div className="rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] tabular-nums">
 100
 </div>
 </div>
 <div>
 <div className="text-[9px] text-muted-foreground/60 mb-0.5">Type</div>
 <div className="rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px]">
 Market
 </div>
 </div>
 <div>
 <div className="text-[9px] text-muted-foreground/60 mb-0.5">Est. Cost</div>
 <div className="text-xs font-medium tabular-nums">
 ${(displayPrice * 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
 </div>
 </div>
 </div>
 <div className="mt-auto rounded-md bg-foreground/90 py-1.5 text-center text-[10px] font-medium text-background cursor-pointer hover:bg-foreground/80 transition-colors active:scale-[0.98]">
 Place Order
 </div>
 </div>
 </div>

 {/* Bottom status bar */}
 <div className="flex items-center justify-between px-3 py-1.5 bg-muted/10 border-t border-border text-[10px] text-muted-foreground/60">
 <div className="flex items-center gap-3">
 <span className="tabular-nums">AAPL ${lastBar.close.toFixed(2)}</span>
 <span
 className={`tabular-nums ${dayChange >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}
 >
 {dayChange >= 0 ? "+" : ""}
 {dayChangePct.toFixed(2)}%
 </span>
 <span className="hidden sm:inline">
 Vol {(DEMO_DATA.reduce((s, d) => s + d.volume, 0) / 1e6).toFixed(1)}M
 </span>
 </div>
 <span className="tabular-nums">$100,000.00</span>
 </div>
 </div>
 );
}
