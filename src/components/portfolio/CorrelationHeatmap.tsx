"use client";

import { useState, useMemo } from "react";
import type { CorrelationMatrix } from "@/services/quant/correlation";

interface CorrelationHeatmapProps {
  correlations: CorrelationMatrix;
}

/**
 * Map correlation (-1 to +1) to a color.
 * -1 = deep red, 0 = neutral gray, +1 = deep green
 */
function correlationColor(value: number): string {
  if (value >= 0) {
    // 0..1 → white to green
    const intensity = Math.min(1, value);
    const r = Math.round(255 - intensity * 195); // 255 → 60
    const g = Math.round(255 - intensity * 80); // 255 → 175
    const b = Math.round(255 - intensity * 195); // 255 → 60
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // -1..0 → red to white
    const intensity = Math.min(1, -value);
    const r = Math.round(255 - intensity * 30); // 255 → 225
    const g = Math.round(255 - intensity * 185); // 255 → 70
    const b = Math.round(255 - intensity * 185); // 255 → 70
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/** Text color for readability against the cell background */
function textColor(value: number): string {
  const absVal = Math.abs(value);
  return absVal > 0.6 ? "#fff" : "#374151";
}

export function CorrelationHeatmap({ correlations }: CorrelationHeatmapProps) {
  const { tickers, matrix } = correlations;
  const n = tickers.length;

  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Layout constants
  const cellSize = 40;
  const labelWidth = 40;
  const labelHeight = 40;
  const svgWidth = labelWidth + n * cellSize;
  const svgHeight = labelHeight + n * cellSize;

  // Precompute color scale legend positions
  const legendSteps = useMemo(() => {
    const steps: { value: number; color: string }[] = [];
    for (let v = -1; v <= 1; v += 0.1) {
      steps.push({ value: parseFloat(v.toFixed(1)), color: correlationColor(v) });
    }
    return steps;
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Correlation Matrix
        </span>
      </div>

      <div className="p-2 overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block mx-auto"
        >
          {/* Column labels (top) */}
          {tickers.map((ticker, i) => (
            <text
              key={`col-${ticker}`}
              x={labelWidth + i * cellSize + cellSize / 2}
              y={labelHeight - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
              fontFamily="monospace"
              fontWeight={500}
            >
              {ticker}
            </text>
          ))}

          {/* Row labels (left) */}
          {tickers.map((ticker, i) => (
            <text
              key={`row-${ticker}`}
              x={labelWidth - 4}
              y={labelHeight + i * cellSize + cellSize / 2 + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={9}
              fontFamily="monospace"
              fontWeight={500}
            >
              {ticker}
            </text>
          ))}

          {/* Cells */}
          {matrix.map((row, i) =>
            row.map((value, j) => {
              const x = labelWidth + j * cellSize;
              const y = labelHeight + i * cellSize;
              const isHovered =
                hoveredCell !== null &&
                hoveredCell.row === i &&
                hoveredCell.col === j;

              return (
                <g
                  key={`${i}-${j}`}
                  onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  <rect
                    x={x + 0.5}
                    y={y + 0.5}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    rx={2}
                    fill={correlationColor(value)}
                    stroke={isHovered ? "#3b82f6" : "transparent"}
                    strokeWidth={isHovered ? 1.5 : 0}
                  />
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 3}
                    textAnchor="middle"
                    fill={textColor(value)}
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight={i === j ? 700 : 400}
                  >
                    {value.toFixed(2)}
                  </text>
                </g>
              );
            }),
          )}
        </svg>

        {/* Tooltip */}
        {hoveredCell !== null && (
          <div className="mt-1 text-center text-[10px] font-mono tabular-nums text-muted-foreground">
            {tickers[hoveredCell.row]} / {tickers[hoveredCell.col]}:{" "}
            <span className="font-semibold text-foreground">
              {matrix[hoveredCell.row][hoveredCell.col].toFixed(4)}
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-0.5 mt-2">
          <span className="text-[8px] text-muted-foreground mr-1">-1</span>
          {legendSteps.map((step) => (
            <div
              key={step.value}
              className="h-2 w-2 rounded-[1px]"
              style={{ backgroundColor: step.color }}
            />
          ))}
          <span className="text-[8px] text-muted-foreground ml-1">+1</span>
        </div>
      </div>
    </div>
  );
}
