/**
 * Module-level singleton to share the lightweight-charts API instances
 * between CandlestickChart (producer) and DrawingOverlay (consumer).
 *
 * This enables coordinate conversion: (time, price) ↔ (pixelX, pixelY)
 */

import type { IChartApi, ISeriesApi } from "lightweight-charts";

let _chart: IChartApi | null = null;
let _series: ISeriesApi<"Candlestick"> | null = null;
const _listeners: Set<() => void> = new Set();
let _rangeVersion = 0; // bumped on every visible range change

function notify() {
 _listeners.forEach((fn) => fn());
}

export function registerChartApi(
 chart: IChartApi,
 series: ISeriesApi<"Candlestick">,
) {
 _chart = chart;
 _series = series;

 // Subscribe to visible range changes so DrawingOverlay re-renders
 chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
  _rangeVersion++;
  notify();
 });

 notify();
}

export function unregisterChartApi() {
 _chart = null;
 _series = null;
 notify();
}

export function getChartApi() {
 return { chart: _chart, series: _series };
}

export function getRangeVersion() {
 return _rangeVersion;
}

/**
 * Subscribe to chart API changes (mount/unmount/scroll).
 * Returns an unsubscribe function.
 */
export function subscribeChartApi(fn: () => void): () => void {
 _listeners.add(fn);
 return () => {
  _listeners.delete(fn);
 };
}
