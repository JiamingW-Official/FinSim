"use client";

import { useEffect, useRef } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
 createChart,
 type IChartApi,
 type ISeriesApi,
 AreaSeries,
 LineSeries,
 ColorType,
 CrosshairMode,
} from "lightweight-charts";
import { BarChart3 } from "lucide-react";

const WINDOW = 10;

export function WinRateChart() {
 const containerRef = useRef<HTMLDivElement>(null);
 const chartRef = useRef<IChartApi | null>(null);
 const areaRef = useRef<ISeriesApi<"Area"> | null>(null);
 const lineRef = useRef<ISeriesApi<"Line"> | null>(null);
 const tradeHistory = useTradingStore((s) => s.tradeHistory);

 // Get sell trades (realized P&L) sorted by simulation date (chart time axis)
 const sellTrades = [...tradeHistory]
 .filter((t) => t.side === "sell")
 .sort((a, b) => a.simulationDate - b.simulationDate);

 useEffect(() => {
 if (!containerRef.current) return;

 const chart = createChart(containerRef.current, {
 height: 180,
 layout: {
 background: { type: ColorType.Solid, color: "transparent" },
 textColor: "rgba(255,255,255,0.5)",
 fontSize: 10,
 },
 grid: {
 vertLines: { color: "rgba(255,255,255,0.03)" },
 horzLines: { color: "rgba(255,255,255,0.03)" },
 },
 crosshair: { mode: CrosshairMode.Magnet },
 rightPriceScale: {
 borderColor: "rgba(255,255,255,0.05)",
 scaleMargins: { top: 0.1, bottom: 0.1 },
 },
 timeScale: {
 borderColor: "rgba(255,255,255,0.05)",
 timeVisible: false,
 },
 handleScroll: false,
 handleScale: false,
 });

 const areaSeries = chart.addSeries(AreaSeries, {
 lineColor: "#10b981",
 topColor: "rgba(16, 185, 129, 0.3)",
 bottomColor: "rgba(16, 185, 129, 0.02)",
 lineWidth: 2,
 priceFormat: {
 type: "custom",
 formatter: (v: number) => `${v.toFixed(0)}%`,
 },
 });

 const refLine = chart.addSeries(LineSeries, {
 color: "rgba(255,255,255,0.15)",
 lineWidth: 1,
 lineStyle: 2,
 priceLineVisible: false,
 lastValueVisible: false,
 crosshairMarkerVisible: false,
 });

 chartRef.current = chart;
 areaRef.current = areaSeries;
 lineRef.current = refLine;

 const ro = new ResizeObserver((entries) => {
 const { width } = entries[0].contentRect;
 chart.applyOptions({ width });
 });
 ro.observe(containerRef.current);

 return () => {
 ro.disconnect();
 chart.remove();
 };
 }, []);

 // Update data when sellTrades change
 useEffect(() => {
 if (!areaRef.current || !lineRef.current || sellTrades.length < 2) return;

 const winRateData: { time: string; value: number }[] = [];
 const refData: { time: string; value: number }[] = [];

 for (let i = 0; i < sellTrades.length; i++) {
 const windowStart = Math.max(0, i - WINDOW + 1);
 const windowSlice = sellTrades.slice(windowStart, i + 1);
 const wins = windowSlice.filter((t) => t.realizedPnL > 0).length;
 const rate = (wins / windowSlice.length) * 100;

 const d = new Date(sellTrades[i].simulationDate);
 const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

 // Avoid duplicate dates — keep last value
 if (winRateData.length > 0 && winRateData[winRateData.length - 1].time === dateStr) {
 winRateData[winRateData.length - 1].value = rate;
 } else {
 winRateData.push({ time: dateStr, value: rate });
 refData.push({ time: dateStr, value: 50 });
 }
 }

 // Guarantee ascending order — lightweight-charts requires this strictly
 winRateData.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
 refData.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));

 areaRef.current.setData(winRateData);
 lineRef.current.setData(refData);
 chartRef.current?.timeScale().fitContent();
 }, [sellTrades.length]); // eslint-disable-line react-hooks/exhaustive-deps

 if (sellTrades.length < 2) {
 return (
 <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
 <BarChart3 className="h-5 w-5 opacity-30" />
 <p className="text-[11px]">Complete at least 2 sells to see win rate</p>
 </div>
 );
 }

 return <div ref={containerRef} className="w-full" />;
}
