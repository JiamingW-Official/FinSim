"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type SeriesMarker,
  type UTCTimestamp,
  type Time,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { RefreshCw } from "lucide-react";
import type { BacktestBar, BacktestTrade } from "@/types/backtest";

const CHART_COLORS = {
  background: "#0a0e17",
  text: "#6b7280",
  grid: "#1a2235",
  upColor: "#10b981",
  downColor: "#ef4444",
  crosshair: "#374151",
};

interface BacktestChartProps {
  bars: BacktestBar[];
  trades: BacktestTrade[];
  isRunning: boolean;
  /** Whether we're showing preview data (before backtest runs) */
  isPreview?: boolean;
  /** Callback to regenerate the preview bars */
  onRegenerate?: () => void;
}

export default function BacktestChart({ bars, trades, isRunning, isPreview, onRegenerate }: BacktestChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.background },
        textColor: CHART_COLORS.text,
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: CHART_COLORS.grid },
        horzLines: { color: CHART_COLORS.grid },
      },
      crosshair: {
        vertLine: { color: CHART_COLORS.crosshair, width: 1, style: 2, labelBackgroundColor: "#1e293b" },
        horzLine: { color: CHART_COLORS.crosshair, width: 1, style: 2, labelBackgroundColor: "#1e293b" },
      },
      rightPriceScale: { borderColor: "#1e293b" },
      timeScale: { borderColor: "#1e293b", timeVisible: false },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.upColor,
      downColor: CHART_COLORS.downColor,
      borderUpColor: CHART_COLORS.upColor,
      borderDownColor: CHART_COLORS.downColor,
      wickUpColor: CHART_COLORS.upColor,
      wickDownColor: CHART_COLORS.downColor,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const markersPlugin = createSeriesMarkers(candleSeries);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    markersPluginRef.current = markersPlugin;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      markersPluginRef.current = null;
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || bars.length === 0) return;

    const candleData = bars.map((b) => ({
      time: (b.timestamp / 1000) as UTCTimestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));

    const volumeData = bars.map((b) => ({
      time: (b.timestamp / 1000) as UTCTimestamp,
      value: b.volume,
      color: b.close >= b.open ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // Trade markers (only when not in preview mode)
    if (markersPluginRef.current) {
      if (trades.length > 0 && !isPreview) {
        const markers: SeriesMarker<UTCTimestamp>[] = [];

        for (const trade of trades) {
          const entryBar = bars[trade.entryBar];
          const exitBar = bars[trade.exitBar];
          if (!entryBar || !exitBar) continue;

          markers.push({
            time: (entryBar.timestamp / 1000) as UTCTimestamp,
            position: "belowBar",
            color: trade.direction === "long" ? "#10b981" : "#ef4444",
            shape: "arrowUp",
            text: `${trade.direction === "long" ? "BUY" : "SHORT"} ${trade.shares}`,
          });

          markers.push({
            time: (exitBar.timestamp / 1000) as UTCTimestamp,
            position: "aboveBar",
            color: trade.pnl >= 0 ? "#10b981" : "#ef4444",
            shape: "arrowDown",
            text: `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(0)}`,
          });
        }

        markers.sort((a, b) => (a.time as number) - (b.time as number));
        markersPluginRef.current.setMarkers(markers);
      } else {
        markersPluginRef.current.setMarkers([]);
      }
    }

    // Fit content
    chartRef.current?.timeScale().fitContent();
  }, [bars, trades, isPreview]);

  return (
    <div className="relative flex-1 overflow-hidden">
      {isRunning && (
        <div className="backtest-running absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium text-primary">Computing...</span>
          </div>
        </div>
      )}

      {/* Preview banner + regenerate */}
      {isPreview && bars.length > 0 && !isRunning && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          <div className="rounded-lg border border-border bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-lg backdrop-blur">
            Preview — {bars.length} bars
          </div>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Regenerate bars"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card/90 text-muted-foreground shadow-lg backdrop-blur transition-colors hover:bg-primary/20 hover:text-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {bars.length === 0 && !isRunning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/70">
          <svg className="h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 4-6" />
          </svg>
          <span className="text-sm">Loading chart preview...</span>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
