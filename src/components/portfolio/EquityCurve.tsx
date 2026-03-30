"use client";

import { useEffect, useRef } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
 createChart,
 type IChartApi,
 type ISeriesApi,
 type UTCTimestamp,
 AreaSeries,
 ColorType,
} from "lightweight-charts";

export function EquityCurve() {
 const equityHistory = useTradingStore((s) => s.equityHistory);
 const containerRef = useRef<HTMLDivElement>(null);
 const chartRef = useRef<IChartApi | null>(null);
 const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

 useEffect(() => {
 if (!containerRef.current) return;

 const chart = createChart(containerRef.current, {
 layout: {
 background: { type: ColorType.Solid, color: "transparent" },
 textColor: "#6b7280",
 fontFamily: "JetBrains Mono, monospace",
 fontSize: 10,
 attributionLogo: false,
 },
 grid: {
 vertLines: { color: "#1e293b" },
 horzLines: { color: "#1e293b" },
 },
 timeScale: {
 borderColor: "#1e293b",
 timeVisible: false,
 },
 rightPriceScale: {
 borderColor: "#1e293b",
 },
 crosshair: {
 horzLine: { color: "#374151", labelBackgroundColor: "#1a2235" },
 vertLine: { color: "#374151", labelBackgroundColor: "#1a2235" },
 },
 handleScroll: { mouseWheel: true, pressedMouseMove: true },
 handleScale: { mouseWheel: true, pinch: true },
 });

 const series = chart.addSeries(AreaSeries, {
 lineColor: "#10b981",
 topColor: "rgba(16, 185, 129, 0.25)",
 bottomColor: "rgba(16, 185, 129, 0.02)",
 lineWidth: 2,
 priceFormat: {
 type: "custom",
 formatter: (price: number) => `$${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
 },
 });

 chartRef.current = chart;
 seriesRef.current = series;

 const resizeObserver = new ResizeObserver((entries) => {
 const { width, height } = entries[0].contentRect;
 chart.applyOptions({ width, height });
 });
 resizeObserver.observe(containerRef.current);

 return () => {
 resizeObserver.disconnect();
 chart.remove();
 };
 }, []);

 useEffect(() => {
 if (!seriesRef.current || equityHistory.length === 0) return;

 const data = equityHistory
 .map((snap) => ({
 time: (snap.timestamp / 1000) as UTCTimestamp,
 value: snap.portfolioValue,
 }))
 .sort((a, b) => (a.time as number) - (b.time as number))
 // Deduplicate: lightweight-charts requires unique timestamps
 .filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

 seriesRef.current.setData(data);
 chartRef.current?.timeScale().fitContent();
 }, [equityHistory]);

 if (equityHistory.length === 0) {
 return (
 <div className="flex h-[340px] items-center justify-center">
 <p className="text-sm text-muted-foreground">No equity data yet</p>
 </div>
 );
 }

 return <div ref={containerRef} className="h-[340px] w-full" />;
}
