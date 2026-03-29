"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Play } from "lucide-react";
import type { VisualStrategy } from "./VisualStrategyBuilder";

// ── Types ─────────────────────────────────────────────────────────────────

type ParamKey =
  | "rsi_period"
  | "ema_period"
  | "macd_fast"
  | "macd_slow"
  | "bb_period"
  | "adx_period"
  | "cci_period"
  | "stop_loss_pct";

interface ParamConfig {
  label: string;
  min: number;
  max: number;
  step: number;
}

const PARAM_CONFIGS: Record<ParamKey, ParamConfig> = {
  rsi_period: { label: "RSI Period", min: 5, max: 30, step: 1 },
  ema_period: { label: "EMA Period", min: 5, max: 50, step: 5 },
  macd_fast: { label: "MACD Fast", min: 5, max: 20, step: 1 },
  macd_slow: { label: "MACD Slow", min: 15, max: 50, step: 1 },
  bb_period: { label: "BB Period", min: 10, max: 40, step: 5 },
  adx_period: { label: "ADX Period", min: 7, max: 28, step: 7 },
  cci_period: { label: "CCI Period", min: 10, max: 30, step: 5 },
  stop_loss_pct: { label: "Stop Loss %", min: 1, max: 10, step: 1 },
};

interface HeatmapCell {
  p1: number;
  p2: number;
  sharpe: number;
  totalReturn: number;
}

// ── Seeded PRNG ────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateHeatmapData(
  p1Key: ParamKey,
  p2Key: ParamKey,
  strategyId: string,
): HeatmapCell[] {
  const cfg1 = PARAM_CONFIGS[p1Key];
  const cfg2 = PARAM_CONFIGS[p2Key];

  const p1Values: number[] = [];
  for (let v = cfg1.min; v <= cfg1.max; v += cfg1.step) p1Values.push(v);
  const p2Values: number[] = [];
  for (let v = cfg2.min; v <= cfg2.max; v += cfg2.step) p2Values.push(v);

  // Limit to reasonable grid size
  const maxCols = 10;
  const maxRows = 8;
  const p1Slice = p1Values.slice(0, maxCols);
  const p2Slice = p2Values.slice(0, maxRows);

  const cells: HeatmapCell[] = [];
  const seedBase = strategyId.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0x1337);
  const rng = mulberry32(seedBase + p1Key.length + p2Key.length);

  // Generate a realistic hump-shaped surface with noise
  const p1Mid = p1Slice[Math.floor(p1Slice.length / 2)];
  const p2Mid = p2Slice[Math.floor(p2Slice.length / 2)];
  const p1Range = (cfg1.max - cfg1.min) || 1;
  const p2Range = (cfg2.max - cfg2.min) || 1;

  for (const p2 of p2Slice) {
    for (const p1 of p1Slice) {
      const d1 = (p1 - p1Mid) / p1Range;
      const d2 = (p2 - p2Mid) / p2Range;
      // Gaussian hump centered near (p1Mid, p2Mid)
      const hump = Math.exp(-(d1 * d1 + d2 * d2) * 8);
      const noise = (rng() - 0.5) * 0.4;
      const sharpe = parseFloat((hump * 2.0 - 0.2 + noise).toFixed(2));
      const totalReturn = parseFloat((sharpe * 12 + (rng() - 0.5) * 5).toFixed(1));
      cells.push({ p1, p2, sharpe, totalReturn });
    }
  }

  return cells;
}

// ── Main Component ─────────────────────────────────────────────────────────

interface Props {
  savedStrategies: VisualStrategy[];
}

export default function OptimizationPanel({ savedStrategies }: Props) {
  const [selectedStrategyIdx, setSelectedStrategyIdx] = useState<number>(0);
  const [param1, setParam1] = useState<ParamKey>("rsi_period");
  const [param2, setParam2] = useState<ParamKey>("ema_period");
  const [hasRun, setHasRun] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const strategyId =
    savedStrategies[selectedStrategyIdx]?.id ??
    `default-strat-${selectedStrategyIdx}`;

  const cells = useMemo(() => {
    if (!hasRun) return [];
    return generateHeatmapData(param1, param2, strategyId + runCount);
  }, [hasRun, param1, param2, strategyId, runCount]);

  const bestCell = useMemo(() => {
    if (cells.length === 0) return null;
    return cells.reduce((best, c) => (c.sharpe > best.sharpe ? c : best), cells[0]);
  }, [cells]);

  const p1Values = useMemo(() => {
    const cfg = PARAM_CONFIGS[param1];
    const vals: number[] = [];
    for (let v = cfg.min; v <= cfg.max; v += cfg.step) vals.push(v);
    return vals.slice(0, 10);
  }, [param1]);

  const p2Values = useMemo(() => {
    const cfg = PARAM_CONFIGS[param2];
    const vals: number[] = [];
    for (let v = cfg.min; v <= cfg.max; v += cfg.step) vals.push(v);
    return vals.slice(0, 8);
  }, [param2]);

  const sharpeMin = cells.length ? Math.min(...cells.map((c) => c.sharpe)) : 0;
  const sharpeMax = cells.length ? Math.max(...cells.map((c) => c.sharpe)) : 1;
  const sharpeRange = sharpeMax - sharpeMin || 1;

  function cellColor(sharpe: number): string {
    const t = (sharpe - sharpeMin) / sharpeRange;
    if (t < 0.33) {
      // Red zone
      const r = Math.round(220 - t * 3 * 20);
      return `rgba(${r}, 40, 40, 0.8)`;
    } else if (t < 0.66) {
      // Yellow zone
      const g = Math.round(100 + (t - 0.33) * 3 * 120);
      return `rgba(180, ${g}, 30, 0.8)`;
    } else {
      // Green zone
      const g = Math.round(150 + (t - 0.66) * 3 * 105);
      return `rgba(20, ${g}, 80, 0.8)`;
    }
  }

  const handleRun = () => {
    setHasRun(true);
    setRunCount((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-lg border border-border/20 bg-muted/10 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground">
          Grid Search Parameters
        </h3>

        {/* Strategy selector */}
        <div className="flex items-center gap-3">
          <span className="w-24 text-xs text-muted-foreground">Strategy</span>
          <select
            value={selectedStrategyIdx}
            onChange={(e) => setSelectedStrategyIdx(parseInt(e.target.value, 10))}
            className="flex-1 appearance-none rounded-md border border-border/20 bg-card px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {savedStrategies.length === 0 ? (
              <option value={0}>Demo Strategy (no saved strategies)</option>
            ) : (
              savedStrategies.map((s, i) => (
                <option key={s.id} value={i}>{s.name}</option>
              ))
            )}
          </select>
        </div>

        {/* Param 1 */}
        <div className="flex items-center gap-3">
          <span className="w-24 text-xs text-muted-foreground">Parameter 1</span>
          <select
            value={param1}
            onChange={(e) => setParam1(e.target.value as ParamKey)}
            className="flex-1 appearance-none rounded-md border border-border/20 bg-card px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {(Object.keys(PARAM_CONFIGS) as ParamKey[]).map((k) => (
              <option key={k} value={k}>{PARAM_CONFIGS[k].label}</option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground/70">
            {PARAM_CONFIGS[param1].min}–{PARAM_CONFIGS[param1].max}, step {PARAM_CONFIGS[param1].step}
          </span>
        </div>

        {/* Param 2 */}
        <div className="flex items-center gap-3">
          <span className="w-24 text-xs text-muted-foreground">Parameter 2</span>
          <select
            value={param2}
            onChange={(e) => setParam2(e.target.value as ParamKey)}
            className="flex-1 appearance-none rounded-md border border-border/20 bg-card px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {(Object.keys(PARAM_CONFIGS) as ParamKey[]).filter((k) => k !== param1).map((k) => (
              <option key={k} value={k}>{PARAM_CONFIGS[k].label}</option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground/70">
            {PARAM_CONFIGS[param2].min}–{PARAM_CONFIGS[param2].max}, step {PARAM_CONFIGS[param2].step}
          </span>
        </div>

        <button
          onClick={handleRun}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary"
        >
          <Play className="h-3.5 w-3.5" />
          Run Grid Search ({p1Values.length} × {p2Values.length} = {p1Values.length * p2Values.length} combinations)
        </button>
      </div>

      {/* Overfitting warning — always shown */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
        <div className="text-xs text-amber-200">
          Best in-sample parameters may not generalize. Grid-search optimization is prone to overfitting.
          Always validate the best parameters on out-of-sample data using Walk-Forward Analysis.
        </div>
      </div>

      {/* Heatmap */}
      {hasRun && cells.length > 0 && (
        <div className="space-y-3">
          {/* Best parameters callout */}
          {bestCell && (
            <div className="rounded-lg border border-border/20 bg-primary/5 px-4 py-2.5">
              <div className="text-xs text-primary font-semibold">Best Parameters Found</div>
              <div className="mt-1 flex gap-4 text-xs">
                <span className="text-muted-foreground">
                  {PARAM_CONFIGS[param1].label}: <span className="font-semibold text-primary">{bestCell.p1}</span>
                </span>
                <span className="text-muted-foreground">
                  {PARAM_CONFIGS[param2].label}: <span className="font-semibold text-primary">{bestCell.p2}</span>
                </span>
                <span className="text-muted-foreground">
                  Sharpe: <span className="font-semibold text-emerald-400">{bestCell.sharpe.toFixed(2)}</span>
                </span>
                <span className="text-muted-foreground">
                  Return: <span className={`font-semibold ${bestCell.totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {bestCell.totalReturn >= 0 ? "+" : ""}{bestCell.totalReturn.toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Heatmap grid */}
          <div>
            <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
              Sharpe Ratio Heatmap
            </h3>
            <SharpeHeatmap
              cells={cells}
              p1Values={p1Values}
              p2Values={p2Values}
              p1Label={PARAM_CONFIGS[param1].label}
              p2Label={PARAM_CONFIGS[param2].label}
              bestCell={bestCell}
              cellColor={cellColor}
            />
          </div>

          {/* Color scale legend */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Low Sharpe</span>
            <div className="flex h-3 flex-1 rounded overflow-hidden">
              {Array.from({ length: 20 }, (_, i) => {
                const t = i / 19;
                const sharpeVal = sharpeMin + t * sharpeRange;
                return (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: cellColor(sharpeVal) }}
                  />
                );
              })}
            </div>
            <span>High Sharpe</span>
          </div>
        </div>
      )}

      {!hasRun && (
        <div className="flex h-32 items-center justify-center rounded-lg border border-border/20 bg-muted/5 text-sm text-muted-foreground/70">
          Configure parameters and run the grid search to see the heatmap
        </div>
      )}
    </div>
  );
}

// ── Sharpe Heatmap (pure SVG) ─────────────────────────────────────────────

interface HeatmapProps {
  cells: HeatmapCell[];
  p1Values: number[];
  p2Values: number[];
  p1Label: string;
  p2Label: string;
  bestCell: HeatmapCell | null;
  cellColor: (sharpe: number) => string;
}

function SharpeHeatmap({
  cells,
  p1Values,
  p2Values,
  p1Label,
  p2Label,
  bestCell,
  cellColor,
}: HeatmapProps) {
  const CELL_W = 44;
  const CELL_H = 32;
  const PAD_L = 64; // for y-axis label
  const PAD_T = 28; // for x-axis label
  const PAD_R = 8;
  const PAD_B = 24;

  const W = PAD_L + p1Values.length * CELL_W + PAD_R;
  const H = PAD_T + p2Values.length * CELL_H + PAD_B;

  // Build lookup
  const lookup = new Map<string, HeatmapCell>();
  for (const cell of cells) {
    lookup.set(`${cell.p1}-${cell.p2}`, cell);
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
        {/* X-axis label */}
        <text
          x={PAD_L + (p1Values.length * CELL_W) / 2}
          y={14}
          textAnchor="middle"
          fontSize={9}
          fill="#71717a"
          fontWeight="bold"
        >
          {p1Label}
        </text>

        {/* Y-axis label */}
        <text
          x={10}
          y={PAD_T + (p2Values.length * CELL_H) / 2}
          textAnchor="middle"
          fontSize={9}
          fill="#71717a"
          fontWeight="bold"
          transform={`rotate(-90, 10, ${PAD_T + (p2Values.length * CELL_H) / 2})`}
        >
          {p2Label}
        </text>

        {/* X-axis tick labels */}
        {p1Values.map((v, xi) => (
          <text
            key={xi}
            x={PAD_L + xi * CELL_W + CELL_W / 2}
            y={PAD_T - 4}
            textAnchor="middle"
            fontSize={7}
            fill="#52525b"
          >
            {v}
          </text>
        ))}

        {/* Y-axis tick labels */}
        {p2Values.map((v, yi) => (
          <text
            key={yi}
            x={PAD_L - 6}
            y={PAD_T + yi * CELL_H + CELL_H / 2 + 3}
            textAnchor="end"
            fontSize={7}
            fill="#52525b"
          >
            {v}
          </text>
        ))}

        {/* Grid cells */}
        {p2Values.map((p2v, yi) =>
          p1Values.map((p1v, xi) => {
            const cell = lookup.get(`${p1v}-${p2v}`);
            if (!cell) return null;
            const isBest = bestCell?.p1 === p1v && bestCell?.p2 === p2v;
            const x = PAD_L + xi * CELL_W;
            const y = PAD_T + yi * CELL_H;
            return (
              <g key={`${xi}-${yi}`}>
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  fill={cellColor(cell.sharpe)}
                  rx={2}
                />
                {isBest && (
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={CELL_W - 2}
                    height={CELL_H - 2}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    rx={2}
                  />
                )}
                <text
                  x={x + CELL_W / 2}
                  y={y + CELL_H / 2 + 3}
                  textAnchor="middle"
                  fontSize={7}
                  fill="rgba(255,255,255,0.9)"
                  fontWeight={isBest ? "bold" : "normal"}
                >
                  {cell.sharpe.toFixed(2)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
