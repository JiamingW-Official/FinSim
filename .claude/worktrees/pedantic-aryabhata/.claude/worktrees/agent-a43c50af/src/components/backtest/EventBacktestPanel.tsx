"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BACKTEST_EVENTS,
  runEventBacktest,
  type EventBacktestResult,
  type EventStrategyResult,
  type CandleData,
} from "@/services/backtest/event-backtest";

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function pnlColor(n: number): string {
  if (n > 5) return "text-green-400";
  if (n >= 0) return "text-green-300";
  if (n > -10) return "text-amber-400";
  return "text-red-400";
}

const GRADE_COLOR: Record<string, string> = {
  A: "bg-green-500/15 text-green-400 border-green-500/30",
  B: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  C: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  D: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  F: "bg-red-500/15 text-red-400 border-red-500/30",
};

// ── Event Price Chart ─────────────────────────────────────────────────────

interface EventChartProps {
  bars: CandleData[];
  strategyResult: EventStrategyResult | null;
}

function EventPriceChart({ bars, strategyResult }: EventChartProps) {
  const W = 560;
  const H = 200;
  const PAD_L = 42;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);

  const minP = Math.min(...lows) * 0.995;
  const maxP = Math.max(...highs) * 1.005;
  const rangeP = maxP - minP || 1;

  const xOf = (i: number) => PAD_L + (i / (bars.length - 1)) * chartW;
  const yOf = (p: number) => PAD_T + (1 - (p - minP) / rangeP) * chartH;

  // Candle body width
  const candleW = Math.max(1.5, (chartW / bars.length) * 0.6);

  // Phase separator x positions
  const crashStartX = xOf(30);
  const recoveryStartX = xOf(38);

  // Entry / exit markers from strategy
  const entryMarkers: { x: number; y: number }[] = [];
  const exitMarkers: { x: number; y: number }[] = [];
  if (strategyResult) {
    for (const t of strategyResult.trades) {
      const ei = t.entryBar;
      const xi = t.exitBar;
      if (ei >= 0 && ei < bars.length) {
        entryMarkers.push({ x: xOf(ei), y: yOf(t.entryPrice) });
      }
      if (xi >= 0 && xi < bars.length) {
        exitMarkers.push({ x: xOf(xi), y: yOf(t.exitPrice) });
      }
    }
  }

  // Y grid labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    price: minP + f * rangeP,
    y: PAD_T + (1 - f) * chartH,
  }));

  // Price line (closes) as polyline
  const closePts = closes
    .map((c, i) => `${xOf(i).toFixed(1)},${yOf(c).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Grid */}
      {yLabels.map((l, idx) => (
        <g key={idx}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={l.y}
            y2={l.y}
            stroke="currentColor"
            className="text-border/30"
            strokeWidth={0.5}
          />
          <text
            x={PAD_L - 4}
            y={l.y + 3}
            textAnchor="end"
            fontSize={7}
            className="fill-muted-foreground"
          >
            {l.price.toFixed(1)}
          </text>
        </g>
      ))}

      {/* Phase shading */}
      <rect
        x={crashStartX}
        y={PAD_T}
        width={recoveryStartX - crashStartX}
        height={chartH}
        fill="rgba(239,68,68,0.06)"
      />
      <rect
        x={recoveryStartX}
        y={PAD_T}
        width={xOf(bars.length - 1) - recoveryStartX}
        height={chartH}
        fill="rgba(34,197,94,0.04)"
      />

      {/* Phase labels */}
      <text x={PAD_L + 4} y={PAD_T + 9} fontSize={7} className="fill-muted-foreground">
        Pre-Event
      </text>
      <text x={crashStartX + 3} y={PAD_T + 9} fontSize={7} className="fill-red-400/70">
        Crash
      </text>
      <text x={recoveryStartX + 3} y={PAD_T + 9} fontSize={7} className="fill-green-400/70">
        Recovery
      </text>

      {/* Phase separator lines */}
      <line
        x1={crashStartX}
        x2={crashStartX}
        y1={PAD_T}
        y2={H - PAD_B}
        stroke="rgba(239,68,68,0.4)"
        strokeWidth={0.8}
        strokeDasharray="3 2"
      />
      <line
        x1={recoveryStartX}
        x2={recoveryStartX}
        y1={PAD_T}
        y2={H - PAD_B}
        stroke="rgba(34,197,94,0.4)"
        strokeWidth={0.8}
        strokeDasharray="3 2"
      />

      {/* Candlesticks */}
      {bars.map((b, i) => {
        const x = xOf(i);
        const isBull = b.close >= b.open;
        const bodyTop = yOf(Math.max(b.open, b.close));
        const bodyBot = yOf(Math.min(b.open, b.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        const wickColor = isBull ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.7)";
        const bodyColor = isBull ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)";

        return (
          <g key={i}>
            <line
              x1={x}
              x2={x}
              y1={yOf(b.high)}
              y2={yOf(b.low)}
              stroke={wickColor}
              strokeWidth={0.8}
            />
            <rect
              x={x - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={bodyColor}
            />
          </g>
        );
      })}

      {/* Price polyline overlay */}
      <polyline points={closePts} fill="none" stroke="hsl(var(--primary)/0.5)" strokeWidth={0.8} />

      {/* Entry markers (triangle up) */}
      {entryMarkers.map((m, i) => (
        <polygon
          key={`entry-${i}`}
          points={`${m.x},${m.y - 6} ${m.x - 4},${m.y + 2} ${m.x + 4},${m.y + 2}`}
          fill="hsl(var(--primary))"
          opacity={0.9}
        />
      ))}

      {/* Exit markers (triangle down) */}
      {exitMarkers.map((m, i) => (
        <polygon
          key={`exit-${i}`}
          points={`${m.x},${m.y + 6} ${m.x - 4},${m.y - 2} ${m.x + 4},${m.y - 2}`}
          fill="rgba(239,68,68,0.9)"
          opacity={0.9}
        />
      ))}

      {/* X-axis */}
      <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke="currentColor" className="text-border/50" strokeWidth={0.5} />
      <text x={PAD_L} y={H - 6} fontSize={7} className="fill-muted-foreground">Bar 0</text>
      <text x={(W - PAD_R + PAD_L) / 2} y={H - 6} textAnchor="middle" fontSize={7} className="fill-muted-foreground">
        Bar {Math.floor(bars.length / 2)}
      </text>
      <text x={W - PAD_R} y={H - 6} textAnchor="end" fontSize={7} className="fill-muted-foreground">
        Bar {bars.length - 1}
      </text>
    </svg>
  );
}

// ── Strategy equity mini-chart ─────────────────────────────────────────────

function MiniEquityChart({ equityCurve }: { equityCurve: { bar: number; equity: number }[] }) {
  if (equityCurve.length < 2) return null;
  const W = 80;
  const H = 28;
  const equities = equityCurve.map((e) => e.equity);
  const minE = Math.min(...equities);
  const maxE = Math.max(...equities);
  const rangeE = maxE - minE || 1;
  const pts = equityCurve
    .map((e, i) => {
      const x = (i / (equityCurve.length - 1)) * W;
      const y = H - ((e.equity - minE) / rangeE) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const finalEquity = equities[equities.length - 1];
  const isPos = finalEquity >= 10000;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={isPos ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)"}
        strokeWidth={1.2}
      />
    </svg>
  );
}

// ── Results table ─────────────────────────────────────────────────────────

interface ResultsTableProps {
  result: EventBacktestResult;
  onSelectStrategy: (id: string) => void;
  selectedStrategy: string | null;
}

function ResultsTable({ result, onSelectStrategy, selectedStrategy }: ResultsTableProps) {
  const sorted = useMemo(
    () => [...result.strategyResults].sort((a, b) => b.finalPnlPct - a.finalPnlPct),
    [result],
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] min-w-[600px]">
        <thead>
          <tr className="border-b border-border/30">
            <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">#</th>
            <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">Strategy</th>
            <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Entry</th>
            <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Max DD</th>
            <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Recovery Bar</th>
            <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Final P&amp;L</th>
            <th className="px-2 py-1.5 text-center font-normal text-muted-foreground">Grade</th>
            <th className="px-2 py-1.5 text-center font-normal text-muted-foreground">Equity</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, rank) => {
            const isBest = s.strategyId === result.bestStrategyId;
            const isSelected = s.strategyId === selectedStrategy;
            return (
              <tr
                key={s.strategyId}
                onClick={() => onSelectStrategy(s.strategyId)}
                className={cn(
                  "border-b border-border/10 cursor-pointer transition-colors",
                  isSelected
                    ? "bg-primary/10 border-primary/20"
                    : isBest
                    ? "bg-green-500/5 hover:bg-green-500/10"
                    : "hover:bg-accent/30",
                )}
              >
                <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{rank + 1}</td>
                <td className="px-2 py-1.5 font-medium">
                  <span className="flex items-center gap-1.5">
                    {isBest && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/20 font-semibold">
                        BEST
                      </span>
                    )}
                    {s.strategyName}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums font-mono">
                  {s.entryBar >= 0 ? `Bar ${s.entryBar}` : "—"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums font-mono text-red-400">
                  {s.maxDrawdownFromEntry > 0 ? `-${s.maxDrawdownFromEntry.toFixed(1)}%` : "—"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums font-mono">
                  {s.recoveryBar >= 0 ? `Bar ${s.recoveryBar}` : "No recovery"}
                </td>
                <td className={cn("px-2 py-1.5 text-right tabular-nums font-mono font-semibold", pnlColor(s.finalPnlPct))}>
                  {fmtPct(s.finalPnlPct)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-semibold", GRADE_COLOR[s.grade])}>
                    {s.grade}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex justify-center">
                    <MiniEquityChart equityCurve={s.equityCurve} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────

export default function EventBacktestPanel() {
  const [selectedEventId, setSelectedEventId] = useState<string>(BACKTEST_EVENTS[0].id);
  const [result, setResult] = useState<EventBacktestResult | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedEvent = useMemo(
    () => BACKTEST_EVENTS.find((e) => e.id === selectedEventId)!,
    [selectedEventId],
  );

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setResult(null);
    setSelectedStrategyId(null);

    setTimeout(() => {
      try {
        const res = runEventBacktest(selectedEvent);
        setResult(res);
        setSelectedStrategyId(res.bestStrategyId);
      } finally {
        setIsRunning(false);
      }
    }, 40);
  }, [selectedEvent]);

  const selectedStrategyResult = useMemo(() => {
    if (!result || !selectedStrategyId) return null;
    return result.strategyResults.find((s) => s.strategyId === selectedStrategyId) ?? null;
  }, [result, selectedStrategyId]);

  return (
    <div className="space-y-4">
      {/* Event selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Historical Crisis Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setResult(null);
              setSelectedStrategyId(null);
            }}
            className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {BACKTEST_EVENTS.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground mt-1">{selectedEvent.description}</p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <div>
              Crash:{" "}
              <span className="text-red-400 font-mono font-semibold">
                {selectedEvent.crashPercent}%
              </span>
            </div>
            <div>
              Recovery:{" "}
              <span className="font-mono font-semibold">
                {selectedEvent.recoveryDays}d
              </span>
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap",
              isRunning
                ? "bg-primary/20 text-primary/50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {isRunning ? "Running..." : "Run All Strategies"}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!result && !isRunning && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <div className="h-10 w-10 rounded-xl bg-accent/30 flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm6.75-7.5A1.125 1.125 0 0110.875 4.5h2.25c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 019.75 19.125V5.625zm6.75 4.5A1.125 1.125 0 0117.625 9h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0116.5 19.875v-9.75z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Select a crisis event and run all strategies</p>
          <p className="text-xs opacity-60 mt-1 max-w-xs">
            See how each of the 10 trading strategies would have responded to the crash, trough, and recovery phase
          </p>
        </div>
      )}

      {isRunning && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <div className="text-sm font-medium">Running 10 strategies...</div>
          <div className="text-xs text-muted-foreground mt-1">Generating event price series and simulating each strategy</div>
        </div>
      )}

      {result && !isRunning && (
        <div className="space-y-4">
          {/* Summary chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Best Strategy", value: result.strategyResults.find((s) => s.strategyId === result.bestStrategyId)?.strategyName ?? "—", color: "text-green-400" },
              { label: "Best P&L", value: fmtPct(Math.max(...result.strategyResults.map((s) => s.finalPnlPct))), color: "text-green-400" },
              { label: "Worst P&L", value: fmtPct(Math.min(...result.strategyResults.map((s) => s.finalPnlPct))), color: "text-red-400" },
              { label: "Event Crash", value: `${result.event.crashPercent}%`, color: "text-red-400" },
              { label: "Strategies Tested", value: "10", color: "text-foreground" },
            ].map((chip) => (
              <div key={chip.label} className="rounded-lg border border-border/30 px-3 py-1.5">
                <div className="text-[9px] text-muted-foreground">{chip.label}</div>
                <div className={cn("text-xs font-semibold font-mono tabular-nums", chip.color)}>
                  {chip.value}
                </div>
              </div>
            ))}
          </div>

          {/* Price chart */}
          <div className="rounded-lg border border-border/30 p-3">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              Event Price Chart
              {selectedStrategyResult && (
                <span className="ml-2 text-foreground">
                  — {selectedStrategyResult.strategyName}
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    (triangles = entry/exit)
                  </span>
                </span>
              )}
            </div>
            <EventPriceChart bars={result.bars} strategyResult={selectedStrategyResult} />
          </div>

          {/* Results table */}
          <div className="rounded-lg border border-border/30 p-3">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              Strategy Performance — click a row to highlight entries on chart
            </div>
            <ResultsTable
              result={result}
              onSelectStrategy={setSelectedStrategyId}
              selectedStrategy={selectedStrategyId}
            />
          </div>

          {/* Selected strategy detail */}
          {selectedStrategyResult && (
            <div className="rounded-lg border border-border/30 p-3 space-y-2">
              <div className="text-xs font-medium">{selectedStrategyResult.strategyName} — Detail</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Trades", value: String(selectedStrategyResult.tradeCount) },
                  { label: "Entry Bar", value: selectedStrategyResult.entryBar >= 0 ? `Bar ${selectedStrategyResult.entryBar}` : "Never entered" },
                  { label: "Max Drawdown", value: selectedStrategyResult.maxDrawdownFromEntry > 0 ? `-${selectedStrategyResult.maxDrawdownFromEntry.toFixed(2)}%` : "—", red: true },
                  { label: "Recovery", value: selectedStrategyResult.recoveryBar >= 0 ? `Bar ${selectedStrategyResult.recoveryBar}` : "No recovery in window" },
                ].map((item) => (
                  <div key={item.label} className="rounded border border-border/20 p-2">
                    <div className="text-[9px] text-muted-foreground">{item.label}</div>
                    <div className={cn("text-xs font-semibold font-mono", item.red ? "text-red-400" : "text-foreground")}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trade list */}
              {selectedStrategyResult.trades.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] min-w-[360px]">
                    <thead>
                      <tr className="border-b border-border/20">
                        <th className="px-1.5 py-1 text-left font-normal text-muted-foreground">Trade</th>
                        <th className="px-1.5 py-1 text-right font-normal text-muted-foreground">Entry Bar</th>
                        <th className="px-1.5 py-1 text-right font-normal text-muted-foreground">Exit Bar</th>
                        <th className="px-1.5 py-1 text-right font-normal text-muted-foreground">Entry Price</th>
                        <th className="px-1.5 py-1 text-right font-normal text-muted-foreground">Exit Price</th>
                        <th className="px-1.5 py-1 text-right font-normal text-muted-foreground">P&amp;L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStrategyResult.trades.map((t, idx) => (
                        <tr key={idx} className="border-b border-border/10">
                          <td className="px-1.5 py-1 text-muted-foreground">{idx + 1}</td>
                          <td className="px-1.5 py-1 text-right tabular-nums font-mono">{t.entryBar}</td>
                          <td className="px-1.5 py-1 text-right tabular-nums font-mono">{t.exitBar}</td>
                          <td className="px-1.5 py-1 text-right tabular-nums font-mono">{t.entryPrice.toFixed(2)}</td>
                          <td className="px-1.5 py-1 text-right tabular-nums font-mono">{t.exitPrice.toFixed(2)}</td>
                          <td className={cn("px-1.5 py-1 text-right tabular-nums font-mono font-semibold", pnlColor(t.pnlPct))}>
                            {fmtPct(t.pnlPct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
