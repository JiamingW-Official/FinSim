"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
 createChart,
 createSeriesMarkers,
 type IChartApi,
 type ISeriesApi,
 type ISeriesMarkersPluginApi,
 type MouseEventParams,
 type Time,
 type SeriesMarker,
 type IPriceLine,
 ColorType,
 CandlestickSeries,
 HistogramSeries,
 LineSeries,
 AreaSeries,
 type UTCTimestamp,
} from "lightweight-charts";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore, type IndicatorType } from "@/stores/chart-store";
import { registerChartApi, unregisterChartApi } from "@/stores/chart-api-store";
import { INTRADAY_TIMEFRAMES } from "@/types/market";
import type { Timeframe } from "@/types/market";
import {
 aggregateDailyBars,
 aggregateHourlyBars,
 aggregateWeeklyBars,
 expand15mTo5m,
} from "@/services/market-data/intraday-generator";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
 calculateSMA,
 calculateEMA,
 calculateBollingerBands,
 calculateRSI,
 calculateMACD,
 calculateStochastic,
 calculateATR,
 calculateVWAP,
 calculateADX,
 calculateOBV,
 calculateCCI,
 calculateWilliamsR,
 calculateParabolicSAR,
} from "@/services/indicators";

const CHART_COLORS = {
 background: "#0a0e17",
 text: "#6b7280",
 grid: "#1a2235",
 upColor: "#10b981",
 downColor: "#ef4444",
 crosshair: "#374151",
 borderColor: "#1e293b",
};

const INDICATOR_COLORS: Record<string, string> = {
 sma20: "#f59e0b",
 sma50: "#3b82f6",
 ema12: "#8b5cf6",
 ema26: "#ec4899",
 bollinger: "#6366f1",
 rsi: "#f59e0b",
 macd: "#06b6d4",
 macd_signal: "#f97316",
 stochastic_k: "#a78bfa",
 stochastic_d: "#fb923c",
 atr: "#14b8a6",
 vwap: "#facc15",
 adx: "#f97316",
 obv: "#06b6d4",
 cci: "#a78bfa",
 williams_r: "#fb923c",
 psar_bull: "#10b981",
 psar_bear: "#ef4444",
};

interface CrosshairData {
 open: number;
 high: number;
 low: number;
 close: number;
 volume: number;
 time: string;
 isUp: boolean;
}

interface OHLCBar {
 timestamp: number;
 open: number;
 high: number;
 low: number;
 close: number;
 volume: number;
 timeframe?: string;
}

/** Compute Heikin Ashi bars from regular OHLC bars */
function computeHeikinAshi(bars: OHLCBar[]): OHLCBar[] {
 if (bars.length === 0) return [];
 const result: OHLCBar[] = [];
 let prevHaOpen = (bars[0].open + bars[0].close) / 2;
 let prevHaClose = (bars[0].open + bars[0].high + bars[0].low + bars[0].close) / 4;

 for (let i = 0; i < bars.length; i++) {
 const bar = bars[i];
 const haClose = (bar.open + bar.high + bar.low + bar.close) / 4;
 const haOpen = i === 0 ? prevHaOpen : (prevHaOpen + prevHaClose) / 2;
 const haHigh = Math.max(bar.high, haOpen, haClose);
 const haLow = Math.min(bar.low, haOpen, haClose);
 result.push({
 ...bar,
 open: haOpen,
 high: haHigh,
 low: haLow,
 close: haClose,
 });
 prevHaOpen = haOpen;
 prevHaClose = haClose;
 }
 return result;
}

/** Generate synthetic quarterly earnings dates within the range of bars */
function generateEarningsDates(bars: OHLCBar[], seed: number): number[] {
 if (bars.length === 0) return [];
 const startMs = bars[0].timestamp;
 const endMs = bars[bars.length - 1].timestamp;
 const QUARTER_MS = 91 * 24 * 3600 * 1000;
 // Use seeded PRNG for offset within quarter
 let s = seed;
 const prng = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
 const dates: number[] = [];
 let t = startMs;
 while (t <= endMs + QUARTER_MS) {
 const offset = Math.floor(prng() * 20 * 24 * 3600 * 1000); // ±20d jitter
 const earningsMs = t + offset;
 if (earningsMs >= startMs && earningsMs <= endMs) {
 dates.push(earningsMs);
 }
 t += QUARTER_MS;
 }
 return dates;
}

/** Generate synthetic semi-annual dividend dates within the range of bars */
function generateDividendDates(bars: OHLCBar[], seed: number): number[] {
 if (bars.length === 0) return [];
 const startMs = bars[0].timestamp;
 const endMs = bars[bars.length - 1].timestamp;
 const SEMI_MS = 182 * 24 * 3600 * 1000;
 let s = seed + 9999;
 const prng = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
 const dates: number[] = [];
 let t = startMs;
 while (t <= endMs + SEMI_MS) {
 const offset = Math.floor(prng() * 10 * 24 * 3600 * 1000);
 const divMs = t + offset;
 if (divMs >= startMs && divMs <= endMs) {
 dates.push(divMs);
 }
 t += SEMI_MS;
 }
 return dates;
}

/** Map a timestamp to the nearest bar timestamp */
function snapToBar(tsMs: number, bars: OHLCBar[]): number | null {
 if (bars.length === 0) return null;
 let best = bars[0];
 let bestDiff = Math.abs(bars[0].timestamp - tsMs);
 for (const bar of bars) {
 const diff = Math.abs(bar.timestamp - tsMs);
 if (diff < bestDiff) {
 bestDiff = diff;
 best = bar;
 }
 }
 return best.timestamp;
}

export function CandlestickChart() {
 const containerRef = useRef<HTMLDivElement>(null);
 const chartRef = useRef<IChartApi | null>(null);
 const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
 const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
 const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
 const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
 const priceLineRef = useRef<IPriceLine | null>(null);
 const pendingLinesRef = useRef<Map<string, IPriceLine>>(new Map());
 const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
 const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<"Line"> | ISeriesApi<"Histogram">>>(
 new Map(),
 );
 const prevTickerRef = useRef<string>("");
 const [crosshairData, setCrosshairData] = useState<CrosshairData | null>(
 null,
 );
 const [tickerTransition, setTickerTransition] = useState(false);

 const allData = useMarketDataStore((s) => s.allData);
 const revealedCount = useMarketDataStore((s) => s.revealedCount);
 const isPlaying = useMarketDataStore((s) => s.isPlaying);
 // visibleData = revealed 15m bars (source of truth for time progression)
 const visibleData = useMemo(
 () => allData.slice(0, revealedCount),
 [allData, revealedCount],
 );

 const tradeHistory = useTradingStore((s) => s.tradeHistory);
 const positions = useTradingStore((s) => s.positions);
 const pendingOrders = useTradingStore((s) => s.pendingOrders);
 const currentTicker = useChartStore((s) => s.currentTicker);
 const activeIndicators = useChartStore((s) => s.activeIndicators);
 const currentTimeframe = useChartStore((s) => s.currentTimeframe);
 const chartType = useChartStore((s) => s.chartType);
 const showVolume = useChartStore((s) => s.showVolume);
 const showGrid = useChartStore((s) => s.showGrid);
 const useLog = useChartStore((s) => s.useLog);
 const showEarnings = useChartStore((s) => s.showEarnings);
 const showDividends = useChartStore((s) => s.showDividends);
 const subBarStep = useMarketDataStore((s) => s.subBarStep);

 // Derived display bars — allData is 15m; aggregate up or expand down
 const displayBars = useMemo(() => {
 if (currentTimeframe === "5m") {
 const expanded = expand15mTo5m(visibleData);
 const trimCount = 2 - subBarStep;
 return trimCount > 0 ? expanded.slice(0, expanded.length - trimCount) : expanded;
 }
 if (currentTimeframe === "15m") return visibleData;
 if (currentTimeframe === "1h") return aggregateHourlyBars(visibleData);
 if (currentTimeframe === "1d") return aggregateDailyBars(visibleData);
 if (currentTimeframe === "1wk") return aggregateWeeklyBars(aggregateDailyBars(visibleData));
 return visibleData;
 }, [visibleData, currentTimeframe, subBarStep]);

 // Heikin Ashi transformed bars (only computed when needed)
 const haBars = useMemo(() => {
 if (chartType !== "heikin_ashi") return displayBars;
 return computeHeikinAshi(displayBars);
 }, [displayBars, chartType]);

 // The bars used for the primary price series rendering
 const renderBars = chartType === "heikin_ashi" ? haBars : displayBars;

 // Ticker change detection for transition animation
 useEffect(() => {
 if (prevTickerRef.current && prevTickerRef.current !== currentTicker) {
 setTickerTransition(true);
 const timer = setTimeout(() => setTickerTransition(false), 400);
 return () => clearTimeout(timer);
 }
 prevTickerRef.current = currentTicker;
 }, [currentTicker]);

 // Build a lookup map for crosshair data (uses displayBars for intraday accuracy)
 const dataByTime = useMemo(() => {
 const map = new Map<number, (typeof allData)[0]>();
 for (const bar of displayBars) {
 map.set(Math.floor(bar.timestamp / 1000), bar);
 }
 return map;
 }, [displayBars]);

 const handleCrosshairMove = useCallback(
 (param: MouseEventParams<Time>) => {
 if (!param.time) {
 setCrosshairData(null);
 return;
 }
 const bar = dataByTime.get(param.time as number);
 if (bar) {
 const isIntradayBar = INTRADAY_TIMEFRAMES.has(bar.timeframe as Timeframe);
 const timeLabel = isIntradayBar
 ? new Date(bar.timestamp).toLocaleString("en-US", {
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 hour12: false,
 timeZone: "America/New_York",
 })
 : new Date(bar.timestamp).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 });
 setCrosshairData({
 open: bar.open,
 high: bar.high,
 low: bar.low,
 close: bar.close,
 volume: bar.volume,
 time: timeLabel,
 isUp: bar.close >= bar.open,
 });
 }
 },
 [dataByTime],
 );

 // Create chart on mount
 useEffect(() => {
 if (!containerRef.current) return;

 const chart = createChart(containerRef.current, {
 layout: {
 background: {
 type: ColorType.Solid,
 color: CHART_COLORS.background,
 },
 textColor: CHART_COLORS.text,
 fontFamily: "JetBrains Mono, monospace",
 fontSize: 11,
 attributionLogo: false,
 },
 grid: {
 vertLines: { color: CHART_COLORS.grid },
 horzLines: { color: CHART_COLORS.grid },
 },
 crosshair: {
 vertLine: { color: CHART_COLORS.crosshair, width: 1, style: 2 },
 horzLine: { color: CHART_COLORS.crosshair, width: 1, style: 2 },
 },
 rightPriceScale: {
 borderColor: CHART_COLORS.borderColor,
 },
 timeScale: {
 borderColor: CHART_COLORS.borderColor,
 timeVisible: false,
 },
 autoSize: true,
 });

 const candleSeries = chart.addSeries(CandlestickSeries, {
 upColor: CHART_COLORS.upColor,
 downColor: CHART_COLORS.downColor,
 borderUpColor: CHART_COLORS.upColor,
 borderDownColor: CHART_COLORS.downColor,
 wickUpColor: CHART_COLORS.upColor,
 wickDownColor: CHART_COLORS.downColor,
 visible: true,
 });

 const lineSeries = chart.addSeries(LineSeries, {
 color: "#3b82f6",
 lineWidth: 2,
 priceLineVisible: false,
 lastValueVisible: true,
 crosshairMarkerVisible: true,
 visible: false,
 });

 const areaSeries = chart.addSeries(AreaSeries, {
 lineColor: "#3b82f6",
 topColor: "rgba(59, 130, 246, 0.3)",
 bottomColor: "rgba(59, 130, 246, 0.02)",
 lineWidth: 2,
 priceLineVisible: false,
 lastValueVisible: true,
 visible: false,
 });

 const volumeSeries = chart.addSeries(HistogramSeries, {
 priceFormat: { type: "volume" },
 priceScaleId: "volume",
 });

 chart.priceScale("volume").applyOptions({
 scaleMargins: { top: 0.8, bottom: 0 },
 });

 chartRef.current = chart;
 candleSeriesRef.current = candleSeries;
 lineSeriesRef.current = lineSeries;
 areaSeriesRef.current = areaSeries;
 volumeSeriesRef.current = volumeSeries;

 // Register chart API for DrawingOverlay coordinate conversion
 registerChartApi(chart, candleSeries);

 return () => {
 unregisterChartApi();
 chart.remove();
 chartRef.current = null;
 candleSeriesRef.current = null;
 lineSeriesRef.current = null;
 areaSeriesRef.current = null;
 volumeSeriesRef.current = null;
 };
 }, []);

 // Subscribe to crosshair move
 useEffect(() => {
 const chart = chartRef.current;
 if (!chart) return;
 chart.subscribeCrosshairMove(handleCrosshairMove);
 return () => {
 chart.unsubscribeCrosshairMove(handleCrosshairMove);
 };
 }, [handleCrosshairMove]);

 // Update timeVisible based on timeframe (show HH:MM for sub-daily)
 const showTime = currentTimeframe === "5m" || currentTimeframe === "15m" || currentTimeframe === "1h";
 useEffect(() => {
 if (!chartRef.current) return;
 chartRef.current.applyOptions({
 timeScale: { timeVisible: showTime },
 });
 }, [showTime]);

 // Apply grid visibility
 useEffect(() => {
 if (!chartRef.current) return;
 const color = showGrid ? CHART_COLORS.grid : "transparent";
 chartRef.current.applyOptions({
 grid: {
 vertLines: { color },
 horzLines: { color },
 },
 });
 }, [showGrid]);

 // Apply log scale
 useEffect(() => {
 if (!chartRef.current) return;
 chartRef.current.priceScale("right").applyOptions({
 mode: useLog ? 1 : 0, // 1 = Logarithmic, 0 = Normal
 });
 }, [useLog]);

 // Switch which series is visible based on chartType
 useEffect(() => {
 const candle = candleSeriesRef.current;
 const line = lineSeriesRef.current;
 const area = areaSeriesRef.current;
 if (!candle || !line || !area) return;

 const isCandleType = chartType === "candlestick" || chartType === "heikin_ashi";
 candle.applyOptions({ visible: isCandleType });
 line.applyOptions({ visible: chartType === "line" });
 area.applyOptions({ visible: chartType === "area" });
 }, [chartType]);

 // Apply volume visibility
 useEffect(() => {
 if (!volumeSeriesRef.current) return;
 volumeSeriesRef.current.applyOptions({ visible: showVolume });
 }, [showVolume]);

 // Update candle/volume data when displayBars / chartType changes
 useEffect(() => {
 if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
 if (!lineSeriesRef.current || !areaSeriesRef.current) return;
 if (renderBars.length === 0) return;

 const candleData = renderBars.map((bar) => ({
 time: (bar.timestamp / 1000) as UTCTimestamp,
 open: bar.open,
 high: bar.high,
 low: bar.low,
 close: bar.close,
 }));

 const lineData = displayBars.map((bar) => ({
 time: (bar.timestamp / 1000) as UTCTimestamp,
 value: bar.close,
 }));

 const volumeData = displayBars.map((bar) => ({
 time: (bar.timestamp / 1000) as UTCTimestamp,
 value: bar.volume,
 color:
 bar.close >= bar.open
 ? "rgba(16, 185, 129, 0.3)"
 : "rgba(239, 68, 68, 0.3)",
 }));

 candleSeriesRef.current.setData(candleData);
 lineSeriesRef.current.setData(lineData);
 areaSeriesRef.current.setData(lineData);
 volumeSeriesRef.current.setData(volumeData);

 // Auto-scroll to latest bar during playback
 if (isPlaying && chartRef.current) {
 chartRef.current.timeScale().scrollToRealTime();
 }
 }, [renderBars, displayBars, isPlaying]);

 // Synthetic earnings / dividend dates
 const tickerSeed = useMemo(() => {
 let h = 0;
 for (let i = 0; i < currentTicker.length; i++) {
 h = (h * 31 + currentTicker.charCodeAt(i)) & 0x7fffffff;
 }
 return h;
 }, [currentTicker]);

 const earningsDates = useMemo(() => {
 if (!showEarnings) return [];
 return generateEarningsDates(displayBars, tickerSeed);
 }, [displayBars, tickerSeed, showEarnings]);

 const dividendDates = useMemo(() => {
 if (!showDividends) return [];
 return generateDividendDates(displayBars, tickerSeed);
 }, [displayBars, tickerSeed, showDividends]);

 // Trade markers + session boundary markers + earnings/dividend markers
 useEffect(() => {
 const activeSeries = candleSeriesRef.current;
 if (!activeSeries) return;

 const markers: SeriesMarker<UTCTimestamp>[] = tradeHistory
 .filter((t) => t.ticker === currentTicker)
 .filter((t) => {
 const barTime = t.simulationDate / 1000;
 return displayBars.some(
 (bar) => Math.floor(bar.timestamp / 1000) === Math.floor(barTime),
 );
 })
 .map((trade) => ({
 time: (Math.floor(trade.simulationDate / 1000)) as UTCTimestamp,
 position: trade.side === "buy" ? ("belowBar" as const) : ("aboveBar" as const),
 color: trade.side === "buy" ? "#10b981" : "#ef4444",
 shape: trade.side === "buy" ? ("arrowUp" as const) : ("arrowDown" as const),
 text: `${trade.side === "buy" ? "B" : "S"} ${trade.quantity}@${trade.price.toFixed(0)}`,
 }));

 // Session boundary markers for intraday views
 const isIntraday = showTime;
 if (isIntraday && displayBars.length > 0) {
 const OPEN_UTC_H = 14.5;
 const LUNCH_UTC_H = 17;
 const seenDays = new Set<string>();
 const seenLunches = new Set<string>();

 for (const bar of displayBars) {
 const d = new Date(bar.timestamp);
 const dayKey = d.toISOString().slice(0, 10);
 const utcH = d.getUTCHours() + d.getUTCMinutes() / 60;

 if (!seenDays.has(dayKey) && utcH >= OPEN_UTC_H && utcH < OPEN_UTC_H + 0.5) {
 seenDays.add(dayKey);
 markers.push({
 time: (bar.timestamp / 1000) as UTCTimestamp,
 position: "aboveBar",
 color: "#3b82f6",
 shape: "square",
 text: "OPEN",
 });
 }

 if (!seenLunches.has(dayKey) && utcH >= LUNCH_UTC_H && utcH < LUNCH_UTC_H + 0.5) {
 seenLunches.add(dayKey);
 markers.push({
 time: (bar.timestamp / 1000) as UTCTimestamp,
 position: "aboveBar",
 color: "#6b7280",
 shape: "square",
 text: "PM",
 });
 }
 }
 }

 // Earnings markers
 for (const ts of earningsDates) {
 const snapped = snapToBar(ts, displayBars);
 if (snapped !== null) {
 markers.push({
 time: (snapped / 1000) as UTCTimestamp,
 position: "aboveBar",
 color: "#f59e0b",
 shape: "square",
 text: "E",
 });
 }
 }

 // Dividend markers
 for (const ts of dividendDates) {
 const snapped = snapToBar(ts, displayBars);
 if (snapped !== null) {
 markers.push({
 time: (snapped / 1000) as UTCTimestamp,
 position: "belowBar",
 color: "#8b5cf6",
 shape: "circle",
 text: "D",
 });
 }
 }

 // Sort all markers by time
 markers.sort((a, b) => (a.time as number) - (b.time as number));

 // Detach old markers plugin, create new one
 if (markersPluginRef.current) {
 markersPluginRef.current.detach();
 markersPluginRef.current = null;
 }

 if (markers.length > 0) {
 markersPluginRef.current = createSeriesMarkers(
 activeSeries,
 markers,
 );
 }
 }, [tradeHistory, currentTicker, displayBars, showTime, earningsDates, dividendDates]);

 // Average cost price line
 useEffect(() => {
 const activeSeries = candleSeriesRef.current;
 if (!activeSeries) return;

 if (priceLineRef.current) {
 activeSeries.removePriceLine(priceLineRef.current);
 priceLineRef.current = null;
 }

 const position = positions.find((p) => p.ticker === currentTicker);
 if (position) {
 priceLineRef.current = activeSeries.createPriceLine({
 price: position.avgPrice,
 color:
 position.side === "long"
 ? "rgba(16, 185, 129, 0.6)"
 : "rgba(239, 68, 68, 0.6)",
 lineWidth: 1,
 lineStyle: 2,
 axisLabelVisible: true,
 title: `Avg ${position.side === "long" ? "Cost" : "Short"}: $${position.avgPrice.toFixed(2)}`,
 });
 }
 }, [positions, currentTicker]);

 // Pending order price lines
 useEffect(() => {
 const activeSeries = candleSeriesRef.current;
 if (!activeSeries) return;

 for (const [, line] of pendingLinesRef.current) {
 try {
 activeSeries.removePriceLine(line);
 } catch { /* already removed */ }
 }
 pendingLinesRef.current.clear();

 for (const order of pendingOrders) {
 if (order.ticker !== currentTicker) continue;

 const triggerPrice = order.limitPrice ?? order.stopPrice ?? order.takeProfitPrice;
 if (!triggerPrice) continue;

 let color: string;
 let lineStyle: number;
 let title: string;

 if (order.type === "limit") {
 color = order.side === "buy" ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)";
 lineStyle = 3;
 title = `Limit ${order.side === "buy" ? "Buy" : "Sell"} @ $${triggerPrice.toFixed(2)}`;
 } else if (order.type === "stop_loss") {
 color = "rgba(239, 68, 68, 0.7)";
 lineStyle = 2;
 title = `Stop @ $${triggerPrice.toFixed(2)}`;
 } else {
 color = "rgba(16, 185, 129, 0.7)";
 lineStyle = 2;
 title = `TP @ $${triggerPrice.toFixed(2)}`;
 }

 const line = activeSeries.createPriceLine({
 price: triggerPrice,
 color,
 lineWidth: 1,
 lineStyle,
 axisLabelVisible: true,
 title,
 });
 pendingLinesRef.current.set(order.id, line);
 }
 }, [pendingOrders, currentTicker]);

 // Technical indicators — only in daily / weekly view
 useEffect(() => {
 const chart = chartRef.current;
 if (!chart) return;

 for (const [, series] of indicatorSeriesRefs.current) {
 try {
 chart.removeSeries(series);
 } catch {
 /* series may already be removed */
 }
 }
 indicatorSeriesRefs.current.clear();

 if (displayBars.length === 0) return;

 const addLineSeries = (
 key: string,
 data: { time: number; value: number }[],
 color: string,
 lineWidth: number = 1,
 lineStyle: number = 0,
 priceScaleId?: string,
 ) => {
 if (data.length === 0) return;
 const options: Record<string, unknown> = {
 color,
 lineWidth,
 lineStyle,
 priceLineVisible: false,
 lastValueVisible: false,
 crosshairMarkerVisible: false,
 };
 if (priceScaleId) {
 options.priceScaleId = priceScaleId;
 }
 const series = chart.addSeries(LineSeries, options);
 series.setData(
 data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })),
 );
 indicatorSeriesRefs.current.set(key, series);
 };

 for (const ind of activeIndicators) {
 switch (ind) {
 case "sma20":
 addLineSeries("sma20", calculateSMA(displayBars, 20), INDICATOR_COLORS.sma20);
 break;
 case "sma50":
 addLineSeries("sma50", calculateSMA(displayBars, 50), INDICATOR_COLORS.sma50);
 break;
 case "ema12":
 addLineSeries("ema12", calculateEMA(displayBars, 12), INDICATOR_COLORS.ema12);
 break;
 case "ema26":
 addLineSeries("ema26", calculateEMA(displayBars, 26), INDICATOR_COLORS.ema26);
 break;
 case "bollinger": {
 const bb = calculateBollingerBands(displayBars);
 addLineSeries("bb_upper", bb.upper, INDICATOR_COLORS.bollinger, 1, 2);
 addLineSeries("bb_middle", bb.middle, INDICATOR_COLORS.bollinger, 1, 0);
 addLineSeries("bb_lower", bb.lower, INDICATOR_COLORS.bollinger, 1, 2);
 break;
 }
 case "rsi": {
 const rsiData = calculateRSI(displayBars);
 addLineSeries("rsi", rsiData, INDICATOR_COLORS.rsi, 1, 0, "rsi");
 chart.priceScale("rsi").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 break;
 }
 case "macd": {
 const macdResult = calculateMACD(displayBars);
 if (macdResult.histogram.length > 0) {
 const histSeries = chart.addSeries(HistogramSeries, {
 priceScaleId: "macd",
 priceLineVisible: false,
 lastValueVisible: false,
 });
 histSeries.setData(
 macdResult.histogram.map((p) => ({
 time: p.time as UTCTimestamp,
 value: p.value,
 color: p.color,
 })),
 );
 indicatorSeriesRefs.current.set("macd_hist", histSeries);
 }
 addLineSeries("macd_line", macdResult.macdLine, INDICATOR_COLORS.macd, 1, 0, "macd");
 addLineSeries("macd_signal", macdResult.signalLine, INDICATOR_COLORS.macd_signal, 1, 0, "macd");
 chart.priceScale("macd").applyOptions({
 scaleMargins: { top: 0.82, bottom: 0 },
 });
 break;
 }
 case "stochastic": {
 const stochResult = calculateStochastic(displayBars);
 addLineSeries("stoch_k", stochResult.kLine, INDICATOR_COLORS.stochastic_k, 1, 0, "stochastic");
 addLineSeries("stoch_d", stochResult.dLine, INDICATOR_COLORS.stochastic_d, 1, 0, "stochastic");
 chart.priceScale("stochastic").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 break;
 }
 case "atr": {
 const atrData = calculateATR(displayBars);
 addLineSeries("atr", atrData, INDICATOR_COLORS.atr, 1, 0, "atr");
 chart.priceScale("atr").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 break;
 }
 case "vwap": {
 const vwapData = calculateVWAP(displayBars);
 addLineSeries("vwap", vwapData, INDICATOR_COLORS.vwap, 2);
 break;
 }
 case "adx": {
 const adxData = calculateADX(displayBars);
 addLineSeries("adx", adxData, INDICATOR_COLORS.adx, 1, 0, "adx");
 chart.priceScale("adx").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 break;
 }
 case "obv": {
 const obvData = calculateOBV(displayBars);
 addLineSeries("obv", obvData, INDICATOR_COLORS.obv, 1, 0, "obv");
 chart.priceScale("obv").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 break;
 }
 case "cci": {
 const cciData = calculateCCI(displayBars);
 addLineSeries("cci", cciData, INDICATOR_COLORS.cci, 1, 0, "cci");
 chart.priceScale("cci").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 break;
 }
 case "williams_r": {
 const wrData = calculateWilliamsR(displayBars);
 addLineSeries("williams_r", wrData, INDICATOR_COLORS.williams_r, 1, 0, "williams_r");
 chart.priceScale("williams_r").applyOptions({
 scaleMargins: { top: 0.85, bottom: 0 },
 });
 break;
 }
 case "psar": {
 const psarData = calculateParabolicSAR(displayBars);
 const psarBull: { time: number; value: number }[] = [];
 const psarBear: { time: number; value: number }[] = [];
 psarData.forEach((pt, i) => {
 const bar = displayBars[i + 1];
 if (bar && pt.value < bar.close) {
 psarBull.push(pt);
 } else if (bar) {
 psarBear.push(pt);
 }
 });
 if (psarBull.length > 0) {
 addLineSeries("psar_bull", psarBull, INDICATOR_COLORS.psar_bull, 1);
 }
 if (psarBear.length > 0) {
 addLineSeries("psar_bear", psarBear, INDICATOR_COLORS.psar_bear, 1);
 }
 break;
 }
 }
 }

 return () => {
 for (const [, series] of indicatorSeriesRefs.current) {
 try {
 chart.removeSeries(series);
 } catch {
 /* ignore */
 }
 }
 indicatorSeriesRefs.current.clear();
 };
 }, [activeIndicators, displayBars]);

 // Current bar data for the OHLCV overlay (when crosshair isn't active)
 const lastBar =
 displayBars.length > 0 ? displayBars[displayBars.length - 1] : null;
 const displayData =
 crosshairData ??
 (lastBar
 ? {
 open: lastBar.open,
 high: lastBar.high,
 low: lastBar.low,
 close: lastBar.close,
 volume: lastBar.volume,
 time: showTime
 ? new Date(lastBar.timestamp).toLocaleString("en-US", {
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 hour12: false,
 timeZone: "America/New_York",
 })
 : new Date(lastBar.timestamp).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 }),
 isUp: lastBar.close >= lastBar.open,
 }
 : null);

 return (
 <div className="relative h-full w-full min-h-[300px]">
 {/* Ticker transition overlay */}
 {tickerTransition && (
 <div className="chart-fade-overlay pointer-events-none absolute inset-0 z-20 bg-background/60" />
 )}
 {/* OHLCV Overlay */}
 {displayData && (
 <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-3 text-[11px] tabular-nums">
 <span className="text-muted-foreground">{displayData.time}</span>
 {(chartType === "candlestick" || chartType === "heikin_ashi") && (
 <>
 <span className="text-muted-foreground">
 O{" "}
 <span className={cn(displayData.isUp ? "text-profit" : "text-loss")}>
 {formatCurrency(displayData.open)}
 </span>
 </span>
 <span className="text-muted-foreground">
 H{" "}
 <span className={cn(displayData.isUp ? "text-profit" : "text-loss")}>
 {formatCurrency(displayData.high)}
 </span>
 </span>
 <span className="text-muted-foreground">
 L{" "}
 <span className={cn(displayData.isUp ? "text-profit" : "text-loss")}>
 {formatCurrency(displayData.low)}
 </span>
 </span>
 </>
 )}
 <span className="text-muted-foreground">
 C{" "}
 <span
 className={cn(
 "font-medium",
 displayData.isUp ? "text-profit" : "text-loss",
 )}
 >
 {formatCurrency(displayData.close)}
 </span>
 </span>
 <span className="text-muted-foreground">
 V{" "}
 <span className="text-foreground">
 {displayData.volume >= 1_000_000
 ? `${(displayData.volume / 1_000_000).toFixed(1)}M`
 : displayData.volume >= 1_000
 ? `${(displayData.volume / 1_000).toFixed(0)}K`
 : displayData.volume.toLocaleString()}
 </span>
 </span>
 {chartType === "heikin_ashi" && (
 <span className="rounded bg-amber-500/20 px-1 text-[11px] text-amber-400">HA</span>
 )}
 </div>
 )}
 <div ref={containerRef} className="h-full w-full" />
 </div>
 );
}
