"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BACKTEST_EVENTS,
  runStressTest,
  type StressTestSummaryResult,
  type StressTestRow,
} from "@/services/backtest/event-backtest";
import { BACKTEST_STRATEGIES, type StrategyId } from "@/services/backtest/strategies";

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function pnlColor(n: number): string {
  if (n >= 5) return "text-green-400";
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

// ── Resilience Score Gauge ────────────────────────────────────────────────

function ResilienceGauge({ score }: { score: number }) {
  const W = 160;
  const H = 90;
  const CX = W / 2;
  const CY = H - 10;
  const R = 68;

  // Arc from 180deg to 0deg (left to right = 0 to 100)
  const angleForScore = (s: number) => Math.PI - (s / 100) * Math.PI;
  const angle = angleForScore(score);

  const arcX = (a: number) => CX + R * Math.cos(a);
  const arcY = (a: number) => CY - R * Math.sin(a);

  // Full arc path (background)
  const bgPath = `M ${arcX(Math.PI)} ${arcY(Math.PI)} A ${R} ${R} 0 0 1 ${arcX(0)} ${arcY(0)}`;

  // Score arc
  const scorePath =
    score > 0
      ? `M ${arcX(Math.PI)} ${arcY(Math.PI)} A ${R} ${R} 0 ${score > 50 ? 1 : 0} 1 ${arcX(angle)} ${arcY(angle)}`
      : null;

  // Needle
  const needleX = CX + (R - 8) * Math.cos(angle);
  const needleY = CY - (R - 8) * Math.sin(angle);

  // Color based on score
  const arcColor =
    score >= 70 ? "rgba(34,197,94,0.85)" : score >= 45 ? "rgba(251,191,36,0.85)" : "rgba(239,68,68,0.85)";
  const scoreLabel =
    score >= 70 ? "Resilient" : score >= 45 ? "Moderate" : "Fragile";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      {/* Background arc */}
      <path d={bgPath} fill="none" stroke="hsl(var(--border)/0.3)" strokeWidth={10} strokeLinecap="round" />

      {/* Colored arc */}
      {scorePath && (
        <path d={scorePath} fill="none" stroke={arcColor} strokeWidth={10} strokeLinecap="round" />
      )}

      {/* Tick marks at 0, 25, 50, 75, 100 */}
      {[0, 25, 50, 75, 100].map((v) => {
        const a = angleForScore(v);
        const x1 = CX + (R - 14) * Math.cos(a);
        const y1 = CY - (R - 14) * Math.sin(a);
        const x2 = CX + (R - 6) * Math.cos(a);
        const y2 = CY - (R - 6) * Math.sin(a);
        const lx = CX + (R - 22) * Math.cos(a);
        const ly = CY - (R - 22) * Math.sin(a);
        return (
          <g key={v}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--border)/0.5)" strokeWidth={1} />
            <text x={lx} y={ly + 3} textAnchor="middle" fontSize={6} className="fill-muted-foreground">
              {v}
            </text>
          </g>
        );
      })}

      {/* Needle */}
      <line
        x1={CX}
        y1={CY}
        x2={needleX}
        y2={needleY}
        stroke="hsl(var(--foreground)/0.8)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={4} fill="hsl(var(--foreground)/0.6)" />

      {/* Score text */}
      <text x={CX} y={CY - 28} textAnchor="middle" fontSize={18} fontWeight="700" style={{ fill: arcColor }}>
        {score}
      </text>
      <text x={CX} y={CY - 14} textAnchor="middle" fontSize={8} className="fill-muted-foreground">
        {scoreLabel}
      </text>
    </svg>
  );
}

// ── Event heatmap row ─────────────────────────────────────────────────────

function EventHeatmapRow({ row, maxAbs }: { row: StressTestRow; maxAbs: number }) {
  const fillW = Math.abs(row.pnlPct) / maxAbs;
  const isPos = row.pnlPct >= 0;

  return (
    <tr className="border-b border-border/10">
      <td className="px-2 py-1.5 text-[10px] max-w-[180px] truncate" title={row.eventName}>
        {row.eventName}
      </td>
      <td className="px-2 py-1.5">
        <div className="h-5 rounded bg-accent/20 relative overflow-hidden w-full min-w-[80px]">
          <div
            className={cn("absolute top-0 bottom-0 rounded transition-all", isPos ? "bg-green-500/40" : "bg-red-500/40")}
            style={{
              left: isPos ? "50%" : `${50 - fillW * 50}%`,
              width: `${fillW * 50}%`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-[9px] font-mono font-semibold", pnlColor(row.pnlPct))}>
              {fmtPct(row.pnlPct)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-2 py-1.5 text-right text-[10px] text-red-400 font-mono tabular-nums">
        {row.maxDrawdown > 0 ? `-${row.maxDrawdown.toFixed(1)}%` : "—"}
      </td>
      <td className="px-2 py-1.5 text-center">
        <span className={cn("text-[9px] px-1 py-0.5 rounded border font-semibold", GRADE_COLOR[row.grade])}>
          {row.grade}
        </span>
      </td>
      <td className="px-2 py-1.5 text-center">
        {row.survived ? (
          <span className="text-[9px] text-green-400">Yes</span>
        ) : (
          <span className="text-[9px] text-red-400">No</span>
        )}
      </td>
    </tr>
  );
}

// ── All-strategy comparison bar chart ────────────────────────────────────

interface AllStrategyBarProps {
  results: StressTestSummaryResult[];
}

function AllStrategyBar({ results }: AllStrategyBarProps) {
  const sorted = useMemo(
    () => [...results].sort((a, b) => b.resilienceScore - a.resilienceScore),
    [results],
  );

  return (
    <div className="space-y-1.5">
      {sorted.map((r) => {
        const pct = r.resilienceScore;
        const color =
          pct >= 70
            ? "bg-green-500/70"
            : pct >= 45
            ? "bg-amber-500/70"
            : "bg-red-500/70";

        return (
          <div key={r.strategyId} className="flex items-center gap-2 text-[10px]">
            <div className="w-36 text-right text-muted-foreground truncate" title={r.strategyName}>
              {r.strategyName}
            </div>
            <div className="flex-1 h-4 rounded bg-accent/20 relative overflow-hidden">
              <div
                className={cn("absolute left-0 top-0 bottom-0 rounded", color)}
                style={{ width: `${pct}%` }}
              />
              <span className="absolute left-1.5 top-0 bottom-0 flex items-center font-mono font-semibold text-foreground">
                {pct}
              </span>
            </div>
            <div className={cn("w-12 text-right font-mono tabular-nums font-semibold", pnlColor(r.avgPnlPct))}>
              {fmtPct(r.avgPnlPct)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function StressTestSummary() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyId>("sma_crossover");
  const [singleResult, setSingleResult] = useState<StressTestSummaryResult | null>(null);
  const [allResults, setAllResults] = useState<StressTestSummaryResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "compare">("single");

  const handleRunSingle = useCallback(() => {
    setIsRunning(true);
    setSingleResult(null);

    setTimeout(() => {
      try {
        const res = runStressTest(selectedStrategyId);
        setSingleResult(res);
        setViewMode("single");
      } finally {
        setIsRunning(false);
      }
    }, 40);
  }, [selectedStrategyId]);

  const handleRunAll = useCallback(() => {
    setIsRunningAll(true);
    setAllResults(null);

    setTimeout(() => {
      try {
        const results = BACKTEST_STRATEGIES.map((s) => runStressTest(s.id));
        setAllResults(results);
        setViewMode("compare");
      } finally {
        setIsRunningAll(false);
      }
    }, 60);
  }, []);

  const maxAbsPnl = useMemo(() => {
    if (!singleResult) return 1;
    return Math.max(1, ...singleResult.rows.map((r) => Math.abs(r.pnlPct)));
  }, [singleResult]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Strategy to Stress Test
          </label>
          <select
            value={selectedStrategyId}
            onChange={(e) => {
              setSelectedStrategyId(e.target.value as StrategyId);
              setSingleResult(null);
            }}
            className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {BACKTEST_STRATEGIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground mt-1">
            Runs the strategy against all {BACKTEST_EVENTS.length} crisis events. Scores 0-100 based on survival rate and average P&amp;L.
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleRunSingle}
            disabled={isRunning || isRunningAll}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap",
              isRunning
                ? "bg-primary/20 text-primary/50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {isRunning ? "Running..." : "Stress Test Strategy"}
          </button>
          <button
            onClick={handleRunAll}
            disabled={isRunning || isRunningAll}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap border",
              isRunningAll
                ? "border-border/30 text-muted-foreground cursor-not-allowed"
                : "border-border/50 text-foreground hover:bg-accent/30",
            )}
          >
            {isRunningAll ? "Running all..." : "Compare All Strategies"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {(isRunning || isRunningAll) && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <div className="text-sm font-medium">
            {isRunningAll ? `Running ${BACKTEST_STRATEGIES.length} strategies × ${BACKTEST_EVENTS.length} events...` : `Running ${BACKTEST_EVENTS.length} events...`}
          </div>
        </div>
      )}

      {/* Single strategy view */}
      {singleResult && viewMode === "single" && !isRunning && (
        <div className="space-y-4">
          {/* Header metrics */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Gauge */}
            <div className="flex flex-col items-center">
              <ResilienceGauge score={singleResult.resilienceScore} />
              <div className="text-[10px] text-muted-foreground text-center -mt-1">
                Event Resilience Score
              </div>
            </div>

            {/* Stats chips */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: "Survived Events", value: `${singleResult.survivedCount} / ${singleResult.totalEvents}`, color: singleResult.survivedCount >= singleResult.totalEvents * 0.6 ? "text-green-400" : "text-amber-400" },
                { label: "Avg P&L (all events)", value: fmtPct(singleResult.avgPnlPct), color: pnlColor(singleResult.avgPnlPct) },
                { label: "Avg Max Drawdown", value: `-${singleResult.avgMaxDrawdown.toFixed(1)}%`, color: "text-red-400" },
                { label: "A/B Grades", value: String(singleResult.rows.filter((r) => r.grade === "A" || r.grade === "B").length), color: "text-green-400" },
                { label: "D/F Grades", value: String(singleResult.rows.filter((r) => r.grade === "D" || r.grade === "F").length), color: "text-red-400" },
                { label: "Resilience Score", value: String(singleResult.resilienceScore), color: singleResult.resilienceScore >= 70 ? "text-green-400" : singleResult.resilienceScore >= 45 ? "text-amber-400" : "text-red-400" },
              ].map((chip) => (
                <div key={chip.label} className="rounded-lg border border-border/30 p-2.5">
                  <div className="text-[9px] text-muted-foreground">{chip.label}</div>
                  <div className={cn("text-sm font-semibold font-mono tabular-nums", chip.color)}>
                    {chip.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-event heatmap table */}
          <div className="rounded-lg border border-border/30 p-3">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              Performance Across All {BACKTEST_EVENTS.length} Crisis Events — {singleResult.strategyName}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-2 py-1.5 text-left text-[10px] font-normal text-muted-foreground">Event</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-normal text-muted-foreground">P&amp;L</th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-normal text-muted-foreground">Max DD</th>
                    <th className="px-2 py-1.5 text-center text-[10px] font-normal text-muted-foreground">Grade</th>
                    <th className="px-2 py-1.5 text-center text-[10px] font-normal text-muted-foreground">Survived</th>
                  </tr>
                </thead>
                <tbody>
                  {singleResult.rows.map((row) => (
                    <EventHeatmapRow key={row.eventId} row={row} maxAbs={maxAbsPnl} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border/30 bg-accent/10">
                    <td className="px-2 py-1.5 text-[10px] font-semibold">Average</td>
                    <td className="px-2 py-1.5">
                      <span className={cn("text-[10px] font-mono font-semibold tabular-nums", pnlColor(singleResult.avgPnlPct))}>
                        {fmtPct(singleResult.avgPnlPct)}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-[10px] font-mono font-semibold text-red-400 tabular-nums">
                      -{singleResult.avgMaxDrawdown.toFixed(1)}%
                    </td>
                    <td />
                    <td className="px-2 py-1.5 text-center text-[10px] font-semibold">
                      {singleResult.survivedCount}/{singleResult.totalEvents}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Resilience score explanation */}
          <div className="rounded-lg border border-border/20 bg-accent/10 p-3 text-[10px] text-muted-foreground space-y-1">
            <div className="font-medium text-foreground text-xs">How is the Resilience Score calculated?</div>
            <div>Base: 50 points. Survival rate: up to +30 points (survived / total events). Average P&amp;L: up to +20 points (clamped to -30%...+20% range). Score 70+ = resilient; 45-70 = moderate; below 45 = fragile.</div>
          </div>
        </div>
      )}

      {/* Compare all strategies */}
      {allResults && viewMode === "compare" && !isRunningAll && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border/30 p-3">
            <div className="text-xs font-medium mb-3 text-muted-foreground">
              Event Resilience Score — All Strategies (bar = score 0-100, label = avg P&amp;L)
            </div>
            <AllStrategyBar results={allResults} />
          </div>

          {/* Summary table */}
          <div className="rounded-lg border border-border/30 p-3">
            <div className="text-xs font-medium mb-2 text-muted-foreground">Full Comparison Table</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] min-w-[480px]">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">#</th>
                    <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">Strategy</th>
                    <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Score</th>
                    <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Avg P&amp;L</th>
                    <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Avg Max DD</th>
                    <th className="px-2 py-1.5 text-right font-normal text-muted-foreground">Survived</th>
                  </tr>
                </thead>
                <tbody>
                  {[...allResults]
                    .sort((a, b) => b.resilienceScore - a.resilienceScore)
                    .map((r, rank) => (
                      <tr key={r.strategyId} className="border-b border-border/10 hover:bg-accent/20">
                        <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{rank + 1}</td>
                        <td className="px-2 py-1.5 font-medium">
                          <span className="flex items-center gap-1.5">
                            {rank === 0 && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/20 font-semibold">
                                BEST
                              </span>
                            )}
                            {r.strategyName}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-mono font-semibold">
                          <span className={cn(r.resilienceScore >= 70 ? "text-green-400" : r.resilienceScore >= 45 ? "text-amber-400" : "text-red-400")}>
                            {r.resilienceScore}
                          </span>
                        </td>
                        <td className={cn("px-2 py-1.5 text-right tabular-nums font-mono font-semibold", pnlColor(r.avgPnlPct))}>
                          {fmtPct(r.avgPnlPct)}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-mono text-red-400">
                          -{r.avgMaxDrawdown.toFixed(1)}%
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-mono">
                          {r.survivedCount}/{r.totalEvents}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!singleResult && !allResults && !isRunning && !isRunningAll && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <div className="h-10 w-10 rounded-xl bg-accent/30 flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Stress test a strategy against all historical crises</p>
          <p className="text-xs opacity-60 mt-1 max-w-xs">
            Select a strategy and click &quot;Stress Test Strategy&quot; to see how it performs across every crisis event, or compare all 10 strategies at once.
          </p>
        </div>
      )}
    </div>
  );
}
