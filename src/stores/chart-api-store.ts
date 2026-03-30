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
let _rangeUnsub: (() => void) | null = null;

function notify() {
 _listeners.forEach((fn) => fn());
}

export function registerChartApi(
 chart: IChartApi,
 series: ISeriesApi<"Candlestick">,
) {
 // Prevent duplicate range subscriptions on re-register
 if (_rangeUnsub) {
  _rangeUnsub();
  _rangeUnsub = null;
 }

 _chart = chart;
 _series = series;

 // Subscribe to visible range changes so DrawingOverlay re-renders
 const handler = () => {
  _rangeVersion++;
  notify();
 };
 chart.timeScale().subscribeVisibleLogicalRangeChange(handler);
 _rangeUnsub = () => {
  try {
   chart.timeScale().unsubscribeVisibleLogicalRangeChange(handler);
  } catch { /* chart may already be disposed */ }
 };

 notify();
}

/**
 * Notify listeners that chart data has changed (e.g. after setData).
 * This triggers a re-render in DrawingOverlay so that coordinate
 * conversions work correctly with the new data.
 */
export function notifyChartDataReady() {
 _rangeVersion++;
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

// ── Crosshair point tracking ──────────────────────────────────────────────────
let _crosshairPoint: { time: number; price: number } | null = null;
const _crosshairListeners: Set<() => void> = new Set();

export function updateCrosshairPoint(time: number | null, price: number | null) {
 _crosshairPoint =
  time != null && price != null ? { time, price } : null;
 _crosshairListeners.forEach((fn) => fn());
}

export function getCrosshairPoint() {
 return _crosshairPoint;
}

export function subscribeCrosshairUpdate(fn: () => void): () => void {
 _crosshairListeners.add(fn);
 return () => {
  _crosshairListeners.delete(fn);
 };
}

// ── Chart click forwarding ────────────────────────────────────────────────────
const _clickListeners: Set<() => void> = new Set();

export function notifyChartClick() {
 _clickListeners.forEach((fn) => fn());
}

export function subscribeChartClick(fn: () => void): () => void {
 _clickListeners.add(fn);
 return () => {
  _clickListeners.delete(fn);
 };
}
