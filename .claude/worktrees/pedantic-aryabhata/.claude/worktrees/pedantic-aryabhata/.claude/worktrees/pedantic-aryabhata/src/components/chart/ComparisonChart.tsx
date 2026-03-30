"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WATCHLIST_STOCKS } from "@/types/market";
import type { OHLCVBar } from "@/types/market";

// ── Constants ─────────────────────────────────────────────────────────────────

const TICKER_COLORS: Record<string, string> = {
  AAPL: "#60a5fa",  // blue
  MSFT: "#34d399",  // emerald
  GOOG: "#fbbf24",  // amber
  AMZN: "#f97316",  // orange
  NVDA: "#a78bfa",  // violet
  TSLA: "#f43f5e",  // rose
  JPM:  "#22d3ee",  // cyan
  SPY:  "#94a3b8",  // slate (reference)
  QQQ:  "#fb7185",  // pink
  META: "#4ade80",  // green
};

const FALLBACK_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f97316", "#a78bfa"];

const TIME_RANGES = [
  { label: "1M",  days: 30 },
  { label: "3M",  days: 90 },
  { label: "6M",  days: 180 },
  { label: "1Y",  days: 365 },
  { label: "2Y",  days: 730 },
] as const;

type TimeRangeLabel = (typeof TIME_RANGES)[number]["label"];

const MAX_TICKERS = 5;

// ── Data fetching ─────────────────────────────────────────────────────────────

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

async function fetchDailyBars(ticker: string, from: string, to: string): Promise<OHLCVBar[]> {
  const params = new URLSearchParams({ ticker, timeframe: "1d", from, to });
  const res = await fetch(`/api/market-data?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch ${ticker}`);
  return res.json();
}

// ── Statistics helpers ─────────────────────────────────────────────────────────

function normalizeReturns(bars: OHLCVBar[]): number[] {
  if (bars.length === 0) return [];
  const base = bars[0].close;
  if (base === 0) return bars.map(() => 100);
  return bars.map((b) => (b.close / base) * 100);
}

function dailyReturns(bars: OHLCVBar[]): number[] {
  const rets: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    if (bars[i - 1].close !== 0) {
      rets.push(bars[i].close / bars[i - 1].close - 1);
    }
  }
  return rets;
}

function computeStats(bars: OHLCVBar[], spyBars: OHLCVBar[]) {
  if (bars.length < 2) {
    return { totalReturn: 0, maxDrawdown: 0, sharpe: 0, volatility: 0, beta: 0 };
  }

  const base = bars[0].close;
  const last = bars[bars.length - 1].close;
  const totalReturn = base !== 0 ? (last / base - 1) * 100 : 0;

  // Max Drawdown
  let peak = bars[0].close;
  let maxDrawdown = 0;
  for (const bar of bars) {
    if (bar.close > peak) peak = bar.close;
    const dd = peak !== 0 ? (peak - bar.close) / peak : 0;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }
  maxDrawdown *= 100;

  const rets = dailyReturns(bars);
  if (rets.length === 0) return { totalReturn, maxDrawdown, sharpe: 0, volatility: 0, beta: 0 };

  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
  const stdDev = Math.sqrt(variance);
  const annualizedVol = stdDev * Math.sqrt(252) * 100;

  const riskFreeDaily = 0.05 / 252; // 5% risk-free rate
  const excessMean = mean - riskFreeDaily;
  const sharpe = stdDev !== 0 ? (excessMean / stdDev) * Math.sqrt(252) : 0;

  // Beta vs SPY
  let beta = 1;
  if (spyBars.length >= 2) {
    const spyRets = dailyReturns(spyBars);
    const minLen = Math.min(rets.length, spyRets.length);
    if (minLen > 1) {
      const r = rets.slice(rets.length - minLen);
      const s = spyRets.slice(spyRets.length - minLen);
      const spyMean = s.reduce((a, b) => a + b, 0) / s.length;
      let cov = 0;
      let spyVar = 0;
      for (let i = 0; i < minLen; i++) {
        const dm = r[i] - mean;
        const sm = s[i] - spyMean;
        cov += dm * sm;
        spyVar += sm * sm;
      }
      cov /= minLen;
      spyVar /= minLen;
      beta = spyVar !== 0 ? cov / spyVar : 1;
    }
  }

  return {
    totalReturn,
    maxDrawdown,
    sharpe: Math.round(sharpe * 100) / 100,
    volatility: Math.round(annualizedVol * 10) / 10,
    beta: Math.round(beta * 100) / 100,
  };
}

// ── Correlation matrix ─────────────────────────────────────────────────────────

function computeCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const as = a.slice(a.length - n);
  const bs = b.slice(b.length - n);
  const meanA = as.reduce((x, y) => x + y, 0) / n;
  const meanB = bs.reduce((x, y) => x + y, 0) / n;
  let cov = 0, varA = 0, varB = 0;
  for (let i = 0; i < n; i++) {
    const da = as[i] - meanA;
    const db = bs[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : cov / denom;
}

function corrColor(v: number): string {
  // blue (-1) → white (0) → red (+1)
  if (v >= 0) {
    const r = Math.round(255 * v + 255 * (1 - v));
    const g = Math.round(255 * (1 - v));
    const b = Math.round(255 * (1 - v));
    return `rgb(${r},${g},${b})`;
  } else {
    const abs = -v;
    const r = Math.round(255 * (1 - abs));
    const g = Math.round(255 * (1 - abs));
    const b = Math.round(255 * abs + 255 * (1 - abs));
    return `rgb(${r},${g},${b})`;
  }
}

// ── Ticker color helper ────────────────────────────────────────────────────────

function tickerColor(ticker: string, idx: number): string {
  return TICKER_COLORS[ticker] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SeriesData {
  ticker: string;
  bars: OHLCVBar[];
  normalized: number[];   // indexed at aligned timestamps
  timestamps: number[];   // Unix ms per bar
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TickerChip({
  ticker,
  color,
  removable,
  onRemove,
}: {
  ticker: string;
  color: string;
  removable: boolean;
  onRemove: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ borderColor: color, color }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {ticker}
      {removable && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
          aria-label={`Remove ${ticker}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ComparisonChart({ defaultTicker }: { defaultTicker: string }) {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(() => {
    const tickers = [defaultTicker];
    if (!tickers.includes("SPY")) tickers.push("SPY");
    return tickers;
  });
  const [timeRange, setTimeRange] = useState<TimeRangeLabel>("1Y");
  const [seriesMap, setSeriesMap] = useState<Map<string, SeriesData>>(new Map());
  const [loadingTickers, setLoadingTickers] = useState<Set<string>>(new Set());
  const [addingTicker, setAddingTicker] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const svgWidth = 560;
  const svgHeight = 180;
  const padLeft = 44;
  const padRight = 8;
  const padTop = 12;
  const padBottom = 24;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  // Load data for a ticker
  const loadTicker = useCallback(
    async (ticker: string, days: number) => {
      setLoadingTickers((prev) => new Set(prev).add(ticker));
      try {
        const { from, to } = getDateRange(days);
        const bars = await fetchDailyBars(ticker, from, to);
        if (bars.length > 0) {
          const normalized = normalizeReturns(bars);
          const timestamps = bars.map((b) => b.timestamp);
          setSeriesMap((prev) => {
            const next = new Map(prev);
            next.set(ticker, { ticker, bars, normalized, timestamps });
            return next;
          });
        }
      } catch {
        // silently fail — ticker removed from map
      } finally {
        setLoadingTickers((prev) => {
          const next = new Set(prev);
          next.delete(ticker);
          return next;
        });
      }
    },
    [],
  );

  // Refetch when time range changes
  const days = TIME_RANGES.find((r) => r.label === timeRange)?.days ?? 365;

  useEffect(() => {
    // Clear old data and reload all
    setSeriesMap(new Map());
    for (const t of selectedTickers) {
      loadTicker(t, days);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Load when tickers list changes (add only new ones)
  useEffect(() => {
    for (const t of selectedTickers) {
      if (!seriesMap.has(t) && !loadingTickers.has(t)) {
        loadTicker(t, days);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTickers]);

  // Build aligned series for chart (align by common date range, use last N bars per ticker)
  const alignedSeries = useMemo(() => {
    const result: { ticker: string; values: number[]; color: string }[] = [];
    if (seriesMap.size === 0) return result;

    // Find minimum length across all loaded tickers
    let minLen = Infinity;
    for (const [t, sd] of seriesMap) {
      if (selectedTickers.includes(t)) {
        minLen = Math.min(minLen, sd.normalized.length);
      }
    }
    if (!isFinite(minLen) || minLen === 0) return result;

    selectedTickers.forEach((ticker, idx) => {
      const sd = seriesMap.get(ticker);
      if (!sd) return;
      const values = sd.normalized.slice(sd.normalized.length - minLen);
      result.push({ ticker, values, color: tickerColor(ticker, idx) });
    });
    return result;
  }, [seriesMap, selectedTickers]);

  // Y-axis extent
  const { yMin, yMax } = useMemo(() => {
    if (alignedSeries.length === 0) return { yMin: 90, yMax: 110 };
    let mn = Infinity, mx = -Infinity;
    for (const s of alignedSeries) {
      for (const v of s.values) {
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }
    const pad = Math.max((mx - mn) * 0.08, 1);
    return { yMin: mn - pad, yMax: mx + pad };
  }, [alignedSeries]);

  const toX = (i: number, len: number) =>
    padLeft + (len <= 1 ? 0 : (i / (len - 1)) * plotW);
  const toY = (v: number) =>
    padTop + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;

  // Hover crosshair
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || alignedSeries.length === 0) return;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const relX = mx - padLeft;
      const len = alignedSeries[0].values.length;
      if (len < 2) return;
      const rawIdx = Math.round((relX / plotW) * (len - 1));
      setHoverIdx(Math.max(0, Math.min(rawIdx, len - 1)));
    },
    [alignedSeries, plotW],
  );

  const handleMouseLeave = useCallback(() => setHoverIdx(null), []);

  // Crosshair x position
  const crosshairX =
    hoverIdx !== null && alignedSeries.length > 0
      ? toX(hoverIdx, alignedSeries[0].values.length)
      : null;

  // Add ticker handlers
  const handleAddTicker = useCallback(() => {
    const t = addInput.toUpperCase().trim();
    if (!t) return;
    const valid = WATCHLIST_STOCKS.map((s) => s.ticker);
    if (!valid.includes(t)) return;
    if (selectedTickers.includes(t)) { setAddInput(""); setAddingTicker(false); return; }
    if (selectedTickers.length >= MAX_TICKERS) return;
    setSelectedTickers((prev) => [...prev, t]);
    setAddInput("");
    setAddingTicker(false);
  }, [addInput, selectedTickers]);

  const handleRemoveTicker = useCallback((ticker: string) => {
    setSelectedTickers((prev) => prev.filter((t) => t !== ticker));
    setSeriesMap((prev) => {
      const next = new Map(prev);
      next.delete(ticker);
      return next;
    });
  }, []);

  // SPY daily returns for beta calculation
  const spyBars = seriesMap.get("SPY")?.bars ?? [];

  // Stats per ticker
  const statsRows = useMemo(() => {
    return selectedTickers.map((ticker, idx) => {
      const sd = seriesMap.get(ticker);
      if (!sd) return { ticker, idx, loading: true, stats: null };
      const stats = computeStats(sd.bars, spyBars);
      return { ticker, idx, loading: false, stats };
    });
  }, [selectedTickers, seriesMap, spyBars]);

  // Correlation matrix
  const corrMatrix = useMemo(() => {
    const tickers = selectedTickers.filter((t) => seriesMap.has(t));
    const matrix: number[][] = tickers.map((a, ai) =>
      tickers.map((b, bi) => {
        if (ai === bi) return 1;
        const rA = dailyReturns(seriesMap.get(a)?.bars ?? []);
        const rB = dailyReturns(seriesMap.get(b)?.bars ?? []);
        return computeCorrelation(rA, rB);
      }),
    );
    return { tickers, matrix };
  }, [selectedTickers, seriesMap]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const range = yMax - yMin;
    const step = range > 40 ? 20 : range > 20 ? 10 : range > 8 ? 5 : 2;
    const first = Math.ceil(yMin / step) * step;
    const ticks: number[] = [];
    for (let v = first; v <= yMax; v += step) ticks.push(v);
    return ticks;
  }, [yMin, yMax]);

  const isLoading = loadingTickers.size > 0;
  const availableToAdd = WATCHLIST_STOCKS.map((s) => s.ticker).filter(
    (t) => !selectedTickers.includes(t),
  );

  return (
    <div className="flex flex-col gap-3 p-2 h-full overflow-y-auto text-xs">
      {/* ── Controls row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Ticker chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {selectedTickers.map((ticker, idx) => (
            <TickerChip
              key={ticker}
              ticker={ticker}
              color={tickerColor(ticker, idx)}
              removable={selectedTickers.length > 1}
              onRemove={() => handleRemoveTicker(ticker)}
            />
          ))}

          {selectedTickers.length < MAX_TICKERS && (
            <div className="relative">
              {addingTicker ? (
                <div className="flex items-center gap-1">
                  <select
                    autoFocus
                    value={addInput}
                    onChange={(e) => setAddInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTicker(); if (e.key === "Escape") { setAddingTicker(false); setAddInput(""); } }}
                    className="h-5 rounded border border-border bg-background px-1 text-xs text-foreground"
                  >
                    <option value="">Pick ticker</option>
                    {availableToAdd.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTicker}
                    disabled={!addInput}
                    className="h-5 rounded border border-border bg-primary/20 px-1.5 text-xs text-primary hover:bg-primary/30 disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingTicker(false); setAddInput(""); }}
                    className="h-5 rounded border border-border bg-muted/30 px-1.5 text-xs text-muted-foreground hover:bg-muted/50"
                  >
                    <X size={9} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTicker(true)}
                  className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus size={9} />
                  Add
                </button>
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Time range buttons */}
        <div className="flex items-center gap-0.5 rounded border border-border overflow-hidden">
          {TIME_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setTimeRange(r.label)}
              className={cn(
                "px-2 py-0.5 text-xs transition-colors",
                timeRange === r.label
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Performance chart ── */}
      <div className="relative">
        {isLoading && alignedSeries.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Loading...
          </div>
        )}
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Y-axis grid + labels */}
          {yTicks.map((v) => {
            const y = toY(v);
            return (
              <g key={v}>
                <line
                  x1={padLeft}
                  x2={svgWidth - padRight}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 3}
                  y={y + 3}
                  fontSize={8}
                  fill="currentColor"
                  fillOpacity={0.45}
                  textAnchor="end"
                >
                  {v === 100 ? "0%" : `${(v - 100).toFixed(0)}%`}
                </text>
              </g>
            );
          })}

          {/* 100 baseline */}
          <line
            x1={padLeft}
            x2={svgWidth - padRight}
            y1={toY(100)}
            y2={toY(100)}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {/* Series lines */}
          {alignedSeries.map(({ ticker, values, color }) => {
            if (values.length < 2) return null;
            const pts = values
              .map((v, i) => `${toX(i, values.length).toFixed(1)},${toY(v).toFixed(1)}`)
              .join(" ");
            return (
              <polyline
                key={ticker}
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {/* Crosshair */}
          {crosshairX !== null && (
            <>
              <line
                x1={crosshairX}
                x2={crosshairX}
                y1={padTop}
                y2={padTop + plotH}
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              {/* Dots at intersection */}
              {alignedSeries.map(({ ticker, values, color }) => {
                if (hoverIdx === null || hoverIdx >= values.length) return null;
                const v = values[hoverIdx];
                return (
                  <circle
                    key={ticker}
                    cx={crosshairX}
                    cy={toY(v)}
                    r={3}
                    fill={color}
                    stroke="var(--background)"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Tooltip box */}
              {(() => {
                const boxX = crosshairX + 6;
                const tooltipItems = alignedSeries
                  .filter(({ values }) => hoverIdx !== null && hoverIdx < values.length)
                  .map(({ ticker, values, color }) => ({
                    ticker,
                    color,
                    ret: (values[hoverIdx!] - 100).toFixed(1),
                  }));
                const boxW = 72;
                const boxH = tooltipItems.length * 12 + 8;
                const clampedX = crosshairX > svgWidth - padRight - boxW - 10
                  ? crosshairX - boxW - 6
                  : boxX;
                return (
                  <g>
                    <rect
                      x={clampedX}
                      y={padTop + 4}
                      width={boxW}
                      height={boxH}
                      rx={3}
                      fill="var(--card)"
                      stroke="var(--border)"
                      strokeWidth={0.5}
                      opacity={0.95}
                    />
                    {tooltipItems.map(({ ticker, color, ret }, i) => (
                      <g key={ticker}>
                        <circle
                          cx={clampedX + 7}
                          cy={padTop + 10 + i * 12}
                          r={2.5}
                          fill={color}
                        />
                        <text
                          x={clampedX + 13}
                          y={padTop + 13 + i * 12}
                          fontSize={7.5}
                          fill={color}
                          fontWeight="600"
                        >
                          {ticker}
                        </text>
                        <text
                          x={clampedX + boxW - 3}
                          y={padTop + 13 + i * 12}
                          fontSize={7.5}
                          fill="currentColor"
                          fillOpacity={0.7}
                          textAnchor="end"
                        >
                          {Number(ret) >= 0 ? "+" : ""}
                          {ret}%
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </>
          )}

          {/* X-axis label (start/end) */}
          {alignedSeries.length > 0 && (() => {
            const sd = seriesMap.get(alignedSeries[0].ticker);
            const allTs = sd?.timestamps ?? [];
            const len = alignedSeries[0].values.length;
            const startTs = len > 0 ? allTs[allTs.length - len] : null;
            const endTs = allTs[allTs.length - 1] ?? null;
            const fmt = (ts: number | null) =>
              ts ? new Date(ts).toLocaleDateString("en-US", { month: "short", year: "2-digit" }) : "";
            return (
              <>
                {startTs && (
                  <text x={padLeft} y={svgHeight - 3} fontSize={7} fill="currentColor" fillOpacity={0.4}>{fmt(startTs)}</text>
                )}
                {endTs && (
                  <text x={svgWidth - padRight} y={svgHeight - 3} fontSize={7} fill="currentColor" fillOpacity={0.4} textAnchor="end">{fmt(endTs)}</text>
                )}
              </>
            );
          })()}
        </svg>

        {/* Legend with current return */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {alignedSeries.map(({ ticker, values, color }) => {
            const lastVal = values[values.length - 1];
            const ret = lastVal !== undefined ? lastVal - 100 : null;
            return (
              <span key={ticker} className="flex items-center gap-1 text-xs">
                <span className="inline-block h-0.5 w-4 rounded" style={{ background: color }} />
                <span style={{ color }}>{ticker}</span>
                {ret !== null && (
                  <span className={ret >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Return statistics table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1 text-left font-medium text-muted-foreground pr-2">Ticker</th>
              <th className="py-1 text-right font-medium text-muted-foreground px-2">Return</th>
              <th className="py-1 text-right font-medium text-muted-foreground px-2">Max DD</th>
              <th className="py-1 text-right font-medium text-muted-foreground px-2">Sharpe</th>
              <th className="py-1 text-right font-medium text-muted-foreground px-2">Vol</th>
              <th className="py-1 text-right font-medium text-muted-foreground pl-2">Beta</th>
            </tr>
          </thead>
          <tbody>
            {statsRows.map(({ ticker, idx, loading, stats }) => (
              <tr key={ticker} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="py-1 pr-2">
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: tickerColor(ticker, idx) }}
                    />
                    <span style={{ color: tickerColor(ticker, idx) }} className="font-semibold">{ticker}</span>
                  </span>
                </td>
                {loading || !stats ? (
                  <td colSpan={5} className="py-1 text-center text-muted-foreground">Loading…</td>
                ) : (
                  <>
                    <td className={cn("py-1 px-2 text-right tabular-nums font-medium", stats.totalReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {stats.totalReturn >= 0 ? "+" : ""}{stats.totalReturn.toFixed(1)}%
                    </td>
                    <td className="py-1 px-2 text-right tabular-nums text-red-400">
                      -{stats.maxDrawdown.toFixed(1)}%
                    </td>
                    <td className={cn("py-1 px-2 text-right tabular-nums", stats.sharpe >= 1 ? "text-emerald-400" : stats.sharpe >= 0 ? "text-amber-400" : "text-red-400")}>
                      {stats.sharpe.toFixed(2)}
                    </td>
                    <td className="py-1 px-2 text-right tabular-nums text-muted-foreground">
                      {stats.volatility.toFixed(1)}%
                    </td>
                    <td className="py-1 pl-2 text-right tabular-nums text-muted-foreground">
                      {stats.beta.toFixed(2)}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Correlation matrix ── */}
      {corrMatrix.tickers.length >= 2 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Correlation Matrix</span>
          <div className="inline-block">
            <svg
              width={corrMatrix.tickers.length * 36 + 28}
              height={corrMatrix.tickers.length * 36 + 28}
              className="overflow-visible"
            >
              {/* Column labels */}
              {corrMatrix.tickers.map((t, ci) => (
                <text
                  key={`col-${ci}`}
                  x={28 + ci * 36 + 18}
                  y={12}
                  fontSize={8}
                  fill="currentColor"
                  fillOpacity={0.6}
                  textAnchor="middle"
                >
                  {t}
                </text>
              ))}

              {corrMatrix.matrix.map((row, ri) => (
                <g key={ri}>
                  {/* Row label */}
                  <text
                    x={24}
                    y={28 + ri * 36 + 18}
                    fontSize={8}
                    fill="currentColor"
                    fillOpacity={0.6}
                    textAnchor="end"
                  >
                    {corrMatrix.tickers[ri]}
                  </text>

                  {row.map((val, ci) => {
                    const cellX = 28 + ci * 36;
                    const cellY = 16 + ri * 36;
                    return (
                      <g key={ci}>
                        <rect
                          x={cellX}
                          y={cellY}
                          width={34}
                          height={34}
                          fill={corrColor(val)}
                          rx={2}
                        />
                        <text
                          x={cellX + 17}
                          y={cellY + 21}
                          fontSize={8}
                          fill={Math.abs(val) > 0.5 ? "#fff" : "#000"}
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {val.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>

            {/* Color scale legend */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] text-muted-foreground">-1</span>
              <svg width={60} height={8}>
                <defs>
                  <linearGradient id="corrGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgb(0,0,255)" />
                    <stop offset="50%" stopColor="rgb(255,255,255)" />
                    <stop offset="100%" stopColor="rgb(255,0,0)" />
                  </linearGradient>
                </defs>
                <rect width={60} height={8} fill="url(#corrGrad)" rx={2} />
              </svg>
              <span className="text-[11px] text-muted-foreground">+1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
