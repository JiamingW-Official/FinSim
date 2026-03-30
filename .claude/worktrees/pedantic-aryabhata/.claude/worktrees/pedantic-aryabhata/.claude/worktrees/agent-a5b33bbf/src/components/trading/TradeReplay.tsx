"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Share2,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TradeReplayData,
  OHLCV,
  Annotation,
} from "@/services/trading/replay-engine";
import { encodeReplayURL } from "@/services/trading/replay-engine";

// ─── Sub-types ────────────────────────────────────────────────────────────────

interface ChartDimensions {
  width: number;
  height: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

// ─── SVG Mini Candlestick Chart ───────────────────────────────────────────────

interface CandlestickChartProps {
  bars: OHLCV[];
  visibleUpTo: number; // index of last visible bar (inclusive)
  annotations: Annotation[];
  dims: ChartDimensions;
}

function CandlestickChart({
  bars,
  visibleUpTo,
  annotations,
  dims,
}: CandlestickChartProps) {
  const { width, height, paddingTop, paddingBottom, paddingLeft, paddingRight } =
    dims;

  const visibleBars = bars.slice(0, visibleUpTo + 1);
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  if (visibleBars.length === 0) return null;

  // Price range
  const allHighs = visibleBars.map((b) => b.high);
  const allLows = visibleBars.map((b) => b.low);
  const priceMin = Math.min(...allLows);
  const priceMax = Math.max(...allHighs);
  const priceRange = priceMax - priceMin || 1;
  const pricePad = priceRange * 0.08;
  const displayMin = priceMin - pricePad;
  const displayMax = priceMax + pricePad;
  const displayRange = displayMax - displayMin;

  function toY(price: number): number {
    return (
      paddingTop + chartH * (1 - (price - displayMin) / displayRange)
    );
  }

  const totalBars = bars.length;
  const barW = chartW / totalBars;
  const candleW = Math.max(1, barW * 0.6);

  function toX(idx: number): number {
    return paddingLeft + (idx + 0.5) * barW;
  }

  // Y-axis labels
  const yTicks = 4;
  const yTickValues: number[] = [];
  for (let i = 0; i <= yTicks; i++) {
    yTickValues.push(displayMin + (displayRange * i) / yTicks);
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      style={{ display: "block" }}
    >
      {/* Background */}
      <rect width={width} height={height} fill="white" />

      {/* Grid lines */}
      {yTickValues.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <text
              x={paddingLeft - 4}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
            >
              {v.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Dimmed future bars area */}
      {visibleUpTo < totalBars - 1 && (
        <rect
          x={toX(visibleUpTo + 1) - barW / 2}
          y={paddingTop}
          width={chartW - (toX(visibleUpTo + 1) - barW / 2 - paddingLeft)}
          height={chartH}
          fill="rgba(248,250,252,0.85)"
        />
      )}

      {/* Candlesticks */}
      {visibleBars.map((bar, i) => {
        const x = toX(i);
        const isUp = bar.close >= bar.open;
        const bodyTop = toY(Math.max(bar.open, bar.close));
        const bodyBot = toY(Math.min(bar.open, bar.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        const color = isUp ? "#22c55e" : "#ef4444";

        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={x}
              y1={toY(bar.high)}
              x2={x}
              y2={toY(bar.low)}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={x - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={isUp ? color : color}
              opacity={isUp ? 0.85 : 0.85}
            />
          </g>
        );
      })}

      {/* Annotations */}
      {annotations
        .filter((a) => a.barIndex <= visibleUpTo)
        .map((ann, i) => {
          const x = toX(ann.barIndex);
          const y = toY(ann.price);
          const isEntry = ann.type === "entry";
          const triColor = isEntry ? "#2d9cdb" : "#22c55e";
          const triColorLoss =
            ann.pnl !== undefined && ann.pnl < 0 ? "#ef4444" : triColor;
          const finalColor = ann.type === "exit" ? triColorLoss : triColor;

          // Triangle pointing up for entry (buy), down for exit (sell)
          const triSize = 7;
          const triPoints = isEntry
            ? `${x},${y - triSize * 1.5} ${x - triSize},${y} ${x + triSize},${y}`
            : `${x},${y + triSize * 1.5} ${x - triSize},${y} ${x + triSize},${y}`;

          return (
            <g key={i}>
              <polygon points={triPoints} fill={finalColor} />
              {/* Horizontal dashed line */}
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke={finalColor}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              {/* Label */}
              <rect
                x={paddingLeft + 2}
                y={y - 11}
                width={ann.label.length * 5.5 + 8}
                height={14}
                rx={2}
                fill={finalColor}
                opacity={0.9}
              />
              <text
                x={paddingLeft + 6}
                y={y}
                fontSize={8}
                fill="white"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                {ann.label}
              </text>
            </g>
          );
        })}

      {/* Current bar cursor line */}
      {visibleUpTo >= 0 && visibleUpTo < totalBars && (
        <line
          x1={toX(visibleUpTo)}
          y1={paddingTop}
          x2={toX(visibleUpTo)}
          y2={height - paddingBottom}
          stroke="#2d9cdb"
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={0.6}
        />
      )}

      {/* Chart border */}
      <rect
        x={paddingLeft}
        y={paddingTop}
        width={chartW}
        height={chartH}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={1}
      />
    </svg>
  );
}

// ─── Move List (chess.com style) ──────────────────────────────────────────────

interface MoveListProps {
  bars: OHLCV[];
  annotations: Annotation[];
  currentBar: number;
  onJump: (barIdx: number) => void;
}

function MoveList({ bars, annotations, currentBar, onJump }: MoveListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Build a list of notable bars: every annotation bar + entry/exit
  const annotationBars = new Set(annotations.map((a) => a.barIndex));

  // Show key bars in 10-bar increments plus annotation bars
  const keyBars: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i % 10 === 0 || annotationBars.has(i)) {
      if (!keyBars.includes(i)) keyBars.push(i);
    }
  }
  keyBars.sort((a, b) => a - b);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-active="true"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentBar]);

  function getAnnotationForBar(idx: number): Annotation | undefined {
    return annotations.find((a) => a.barIndex === idx);
  }

  function formatBarDate(ts: number): string {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div ref={listRef} className="overflow-y-auto flex-1 min-h-0">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-white border-b border-slate-200">
          <tr>
            <th className="px-2 py-1.5 text-left font-medium text-slate-400 w-6">
              #
            </th>
            <th className="px-2 py-1.5 text-left font-medium text-slate-400">
              Date
            </th>
            <th className="px-2 py-1.5 text-right font-medium text-slate-400">
              Close
            </th>
            <th className="px-2 py-1.5 text-right font-medium text-slate-400">
              Event
            </th>
          </tr>
        </thead>
        <tbody>
          {keyBars.map((barIdx) => {
            const bar = bars[barIdx];
            const ann = getAnnotationForBar(barIdx);
            const isActive = barIdx === currentBar;
            const isPast = barIdx <= currentBar;
            const pnlSign =
              ann?.pnl !== undefined
                ? ann.pnl >= 0
                  ? "pos"
                  : "neg"
                : null;

            return (
              <tr
                key={barIdx}
                data-active={isActive}
                onClick={() => onJump(barIdx)}
                className={cn(
                  "cursor-pointer border-b border-slate-100 transition-colors",
                  isActive
                    ? "bg-[#2d9cdb]/10 text-slate-900"
                    : isPast
                      ? "hover:bg-slate-50 text-slate-700"
                      : "hover:bg-slate-50 text-slate-400",
                )}
              >
                <td className="px-2 py-1 font-mono text-[10px] text-slate-400">
                  {barIdx + 1}
                </td>
                <td className="px-2 py-1 font-mono">{formatBarDate(bar.timestamp)}</td>
                <td className="px-2 py-1 text-right font-mono tabular-nums">
                  {bar.close.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right">
                  {ann ? (
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
                        ann.type === "entry"
                          ? "bg-[#2d9cdb]/15 text-[#2d9cdb]"
                          : pnlSign === "pos"
                            ? "bg-green-500/15 text-green-600"
                            : pnlSign === "neg"
                              ? "bg-red-500/15 text-red-600"
                              : "bg-slate-200 text-slate-600",
                      )}
                    >
                      {ann.type}
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Trade Summary Panel ──────────────────────────────────────────────────────

interface SummaryPanelProps {
  replay: TradeReplayData;
  currentBar: number;
}

function SummaryPanel({ replay, currentBar }: SummaryPanelProps) {
  const { summary, bars, annotations } = replay;

  // Compute running P&L at currentBar
  const exitAnn = annotations.find((a) => a.type === "exit");
  const entryAnn = annotations.find((a) => a.type === "entry");

  let runningPnL: number | null = null;
  if (entryAnn && currentBar >= entryAnn.barIndex) {
    const currentPrice = bars[currentBar]?.close ?? summary.entryPrice;
    const qty = summary.quantity;
    if (summary.direction === "long") {
      runningPnL = (currentPrice - summary.entryPrice) * qty;
    } else {
      runningPnL = (summary.entryPrice - currentPrice) * qty;
    }
  }

  const isFinished = exitAnn ? currentBar >= exitAnn.barIndex : false;
  const displayPnL = isFinished ? summary.netPnL : runningPnL;

  function StatRow({
    label,
    value,
    className,
  }: {
    label: string;
    value: string;
    className?: string;
  }) {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={cn("text-xs font-mono tabular-nums font-medium", className)}>
          {value}
        </span>
      </div>
    );
  }

  const pnlClass =
    displayPnL === null
      ? "text-slate-500"
      : displayPnL > 0
        ? "text-green-600"
        : displayPnL < 0
          ? "text-red-600"
          : "text-slate-500";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Trade Summary
      </div>

      {/* Big P&L display */}
      <div className="text-center py-2 border-b border-slate-100 mb-2">
        <div
          className={cn(
            "text-2xl font-bold tabular-nums font-mono",
            pnlClass,
          )}
        >
          {displayPnL !== null
            ? `${displayPnL >= 0 ? "+" : ""}$${Math.abs(displayPnL).toFixed(2)}`
            : "—"}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {isFinished
            ? "Realized P&L"
            : entryAnn && currentBar >= entryAnn.barIndex
              ? "Running P&L"
              : "Before entry"}
        </div>
      </div>

      <div className="space-y-0">
        <StatRow
          label="Direction"
          value={summary.direction.toUpperCase()}
          className={
            summary.direction === "long" ? "text-green-600" : "text-red-600"
          }
        />
        <StatRow
          label="Entry"
          value={`$${summary.entryPrice.toFixed(2)}`}
        />
        <StatRow
          label="Exit"
          value={
            isFinished ? `$${summary.exitPrice.toFixed(2)}` : "Open"
          }
          className={isFinished ? undefined : "text-slate-400"}
        />
        <StatRow label="Qty" value={summary.quantity.toString()} />
        <StatRow
          label="P&L %"
          value={
            isFinished
              ? `${summary.pnlPercent >= 0 ? "+" : ""}${summary.pnlPercent.toFixed(2)}%`
              : "—"
          }
          className={
            isFinished
              ? summary.pnlPercent >= 0
                ? "text-green-600"
                : "text-red-600"
              : undefined
          }
        />
        <StatRow label="Max Drawdown" value={`$${summary.maxDrawdown.toFixed(2)}`} />
        <StatRow label="Max Runup" value={`$${summary.maxRunup.toFixed(2)}`} />
        <StatRow label="Hold Duration" value={summary.holdDurationLabel} />
        <StatRow
          label="Fees"
          value={`$${summary.totalFees.toFixed(2)}`}
          className="text-slate-500"
        />
      </div>
    </div>
  );
}

// ─── Main TradeReplay Component ───────────────────────────────────────────────

interface TradeReplayProps {
  replay: TradeReplayData;
  onClose: () => void;
}

export function TradeReplay({ replay, onClose }: TradeReplayProps) {
  const { bars, annotations, summary } = replay;
  const totalBars = bars.length;

  const [currentBar, setCurrentBar] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [learned, setLearned] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`replay-learned-${replay.tradeId}`) ?? "";
  });
  const [copied, setCopied] = useState(false);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved "what I learned" note
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(`replay-learned-${replay.tradeId}`);
    if (saved) setLearned(saved);
  }, [replay.tradeId]);

  // Persist notes to localStorage
  const handleLearnedChange = useCallback(
    (text: string) => {
      setLearned(text);
      if (typeof window !== "undefined") {
        localStorage.setItem(`replay-learned-${replay.tradeId}`, text);
      }
    },
    [replay.tradeId],
  );

  // Playback
  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    if (currentBar >= totalBars - 1) {
      setCurrentBar(0);
    }
    setIsPlaying(true);
    playIntervalRef.current = setInterval(() => {
      setCurrentBar((prev) => {
        if (prev >= totalBars - 1) {
          stopPlayback();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [currentBar, totalBars, stopPlayback]);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  const handleStepForward = useCallback(() => {
    stopPlayback();
    setCurrentBar((prev) => Math.min(totalBars - 1, prev + 1));
  }, [totalBars, stopPlayback]);

  const handleStepBack = useCallback(() => {
    stopPlayback();
    setCurrentBar((prev) => Math.max(0, prev - 1));
  }, [stopPlayback]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, stopPlayback, startPlayback]);

  const handleJump = useCallback(
    (barIdx: number) => {
      stopPlayback();
      setCurrentBar(barIdx);
    },
    [stopPlayback],
  );

  const handleShare = useCallback(async () => {
    const encoded = encodeReplayURL(replay);
    const url = `${window.location.origin}/trade?replay=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: show the URL
      prompt("Copy this replay URL:", url);
    }
  }, [replay]);

  const handleExportPNG = useCallback(() => {
    // Draw the SVG chart to a canvas and export
    const svgEl = document.querySelector(
      "[data-replay-chart] svg",
    ) as SVGSVGElement | null;
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `replay-${replay.ticker}-${replay.tradeId.slice(0, 8)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [replay.ticker, replay.tradeId]);

  const dims: ChartDimensions = {
    width: 600,
    height: 260,
    paddingTop: 12,
    paddingBottom: 20,
    paddingLeft: 44,
    paddingRight: 12,
  };

  const currentBarData = bars[currentBar];
  const pnlClass =
    summary.winLoss === "win"
      ? "text-green-600"
      : summary.winLoss === "loss"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-900 text-sm">
              Trade Replay
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {summary.ticker}
            </span>
            <span
              className={cn(
                "text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded",
                summary.winLoss === "win"
                  ? "bg-green-500/10 text-green-600"
                  : summary.winLoss === "loss"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-slate-100 text-slate-500",
              )}
            >
              {summary.winLoss}
            </span>
            <span className={cn("text-sm font-bold tabular-nums font-mono", pnlClass)}>
              {summary.netPnL >= 0 ? "+" : ""}${summary.netPnL.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={onClose}
              className="ml-1 p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Chart + Controls */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-slate-200">
            {/* Chart */}
            <div
              data-replay-chart
              className="flex-1 min-h-0 p-3 bg-white"
              style={{ minHeight: 200 }}
            >
              <CandlestickChart
                bars={bars}
                visibleUpTo={currentBar}
                annotations={annotations}
                dims={dims}
              />
            </div>

            {/* Bar info strip */}
            <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-4 text-xs font-mono tabular-nums text-slate-600">
              <span className="text-slate-400">
                Bar {currentBar + 1}/{totalBars}
              </span>
              {currentBarData && (
                <>
                  <span>
                    {new Date(currentBarData.timestamp).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                  <span>
                    O:{" "}
                    <span className="text-slate-900">
                      {currentBarData.open.toFixed(2)}
                    </span>
                  </span>
                  <span>
                    H:{" "}
                    <span className="text-green-600">
                      {currentBarData.high.toFixed(2)}
                    </span>
                  </span>
                  <span>
                    L:{" "}
                    <span className="text-red-600">
                      {currentBarData.low.toFixed(2)}
                    </span>
                  </span>
                  <span>
                    C:{" "}
                    <span className="text-slate-900">
                      {currentBarData.close.toFixed(2)}
                    </span>
                  </span>
                </>
              )}
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-slate-200 bg-white">
              <button
                onClick={handleStepBack}
                disabled={currentBar === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium min-h-10"
              >
                <ChevronLeft className="h-4 w-4" />
                Step Back
              </button>

              <button
                onClick={handleTogglePlay}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-white text-xs font-medium transition-colors min-h-10",
                  isPlaying
                    ? "bg-slate-700 hover:bg-slate-800"
                    : "bg-[#2d9cdb] hover:bg-[#2489c5]",
                )}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </button>

              <button
                onClick={handleStepForward}
                disabled={currentBar >= totalBars - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium min-h-10"
              >
                Step Forward
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Slider */}
              <div className="flex-1 px-2">
                <input
                  type="range"
                  min={0}
                  max={totalBars - 1}
                  value={currentBar}
                  onChange={(e) => {
                    stopPlayback();
                    setCurrentBar(Number(e.target.value));
                  }}
                  className="w-full h-1.5 accent-[#2d9cdb] cursor-pointer"
                />
              </div>
            </div>

            {/* "What I learned" textarea */}
            <div className="px-4 pb-3 border-t border-slate-100 bg-white">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-3 mb-1.5">
                What I Learned
              </label>
              <textarea
                value={learned}
                onChange={(e) => handleLearnedChange(e.target.value)}
                placeholder="Notes about this trade — what went well, what could improve..."
                rows={2}
                className="w-full text-xs text-slate-700 border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#2d9cdb] placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Right: Move list + Summary */}
          <div className="w-64 flex flex-col border-l border-slate-200 overflow-hidden">
            {/* Move list (chess.com-style) */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Bar-by-Bar
              </div>
              <MoveList
                bars={bars}
                annotations={annotations}
                currentBar={currentBar}
                onJump={handleJump}
              />
            </div>

            {/* Summary panel */}
            <div className="border-t border-slate-200 p-3 overflow-y-auto">
              <SummaryPanel replay={replay} currentBar={currentBar} />
            </div>
          </div>
        </div>
      </div>
      {/* Hidden canvas for PNG export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
