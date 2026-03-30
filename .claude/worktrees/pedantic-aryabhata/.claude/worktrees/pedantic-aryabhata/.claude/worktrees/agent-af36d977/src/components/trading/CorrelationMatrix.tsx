"use client";

import { useState } from "react";

// ─── Mulberry32 PRNG ─────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Tickers ─────────────────────────────────────────────────────────────────
const TICKERS = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "AMZN",
  "META",
  "SPY",
  "QQQ",
  "GLD",
  "BTC-USD",
] as const;

type Ticker = (typeof TICKERS)[number];

// ─── Build correlation matrix ─────────────────────────────────────────────────
// Base correlation values encoding financial logic:
// Groups: tech[AAPL,MSFT,NVDA,META,AMZN], index[SPY,QQQ], safe[GLD], crypto[BTC], volatile[TSLA]
function buildCorrelationMatrix(): number[][] {
  const n = TICKERS.length;
  // Base pairwise correlations (upper triangle)
  // Encoding: row ≤ col
  const BASE: Partial<Record<string, number>> = {
    // Tech-Tech: high 0.75-0.92
    "AAPL-MSFT": 0.88,
    "AAPL-NVDA": 0.82,
    "AAPL-META": 0.80,
    "AAPL-AMZN": 0.78,
    "MSFT-NVDA": 0.85,
    "MSFT-META": 0.83,
    "MSFT-AMZN": 0.81,
    "NVDA-META": 0.79,
    "NVDA-AMZN": 0.77,
    "META-AMZN": 0.82,
    // Tech-TSLA: moderate (TSLA is volatile)
    "AAPL-TSLA": 0.55,
    "MSFT-TSLA": 0.52,
    "NVDA-TSLA": 0.60,
    "META-TSLA": 0.50,
    "AMZN-TSLA": 0.48,
    // Tech-SPY: moderate-high
    "AAPL-SPY": 0.72,
    "MSFT-SPY": 0.74,
    "NVDA-SPY": 0.65,
    "META-SPY": 0.68,
    "AMZN-SPY": 0.70,
    // Tech-QQQ: high (tech-heavy index)
    "AAPL-QQQ": 0.85,
    "MSFT-QQQ": 0.87,
    "NVDA-QQQ": 0.80,
    "META-QQQ": 0.82,
    "AMZN-QQQ": 0.83,
    // Tech-GLD: negative
    "AAPL-GLD": -0.12,
    "MSFT-GLD": -0.15,
    "NVDA-GLD": -0.10,
    "META-GLD": -0.13,
    "AMZN-GLD": -0.11,
    // Tech-BTC: moderate
    "AAPL-BTC-USD": 0.45,
    "MSFT-BTC-USD": 0.42,
    "NVDA-BTC-USD": 0.50,
    "META-BTC-USD": 0.40,
    "AMZN-BTC-USD": 0.38,
    // TSLA-index
    "TSLA-SPY": 0.55,
    "TSLA-QQQ": 0.60,
    "TSLA-GLD": -0.18,
    "TSLA-BTC-USD": 0.48,
    // SPY-QQQ: very high
    "SPY-QQQ": 0.95,
    // Index-GLD: slightly negative (risk-off asset)
    "SPY-GLD": -0.08,
    "QQQ-GLD": -0.12,
    // Index-BTC
    "SPY-BTC-USD": 0.38,
    "QQQ-BTC-USD": 0.42,
    // GLD-BTC: mild positive (both alternative stores of value)
    "GLD-BTC-USD": 0.22,
  };

  const rand = mulberry32(12345);
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
        continue;
      }
      const a = TICKERS[i];
      const b = TICKERS[j];
      const key1 = `${a}-${b}`;
      const key2 = `${b}-${a}`;
      const base = BASE[key1] ?? BASE[key2];
      if (base !== undefined) {
        // Add small deterministic noise
        const noise = (rand() - 0.5) * 0.04;
        const val = Math.max(-1, Math.min(1, base + noise));
        matrix[i][j] = val;
      } else {
        // Fallback for any missed pair: moderate positive
        matrix[i][j] = 0.35 + (rand() - 0.5) * 0.1;
      }
    }
  }

  return matrix;
}

const CORRELATION_MATRIX = buildCorrelationMatrix();

// ─── Color mapping ────────────────────────────────────────────────────────────
// 3-color scale: red(-1) → white(0) → green(+1)
// Diagonal (val===1) gets a distinct blue so self-correlations pop visually.
function corrToColor(val: number): string {
  if (val === 1) return "hsl(217, 78%, 48%)"; // self-correlation: distinct blue
  if (val > 0) {
    // Gradual white → green transition; fully saturated at val=1
    const pct = Math.pow(val, 0.8); // slight gamma for more gradual mid-range
    const sat = Math.round(pct * 72);
    const light = Math.round(97 - pct * 42);
    return `hsl(142, ${sat}%, ${light}%)`;
  } else {
    // Gradual white → red transition; fully saturated at val=-1
    const pct = Math.pow(Math.abs(val), 0.8);
    const sat = Math.round(pct * 80);
    const light = Math.round(97 - pct * 38);
    return `hsl(0, ${sat}%, ${light}%)`;
  }
}

function corrToTextColor(val: number): string {
  // Dark text for light cells, light text for saturated cells
  if (val === 1) return "#fff";
  const abs = Math.abs(val);
  if (abs > 0.6) return "#fff";
  if (abs > 0.3) return "#374151";
  return "#6b7280";
}

// ─── SVG dimensions ──────────────────────────────────────────────────────────
const CELL = 40;
const LABEL_W = 50; // left label column width
const LABEL_H = 40; // top label row height
const LEGEND_H = 36;
const LEGEND_MARGIN = 12;
const n = TICKERS.length;
const SVG_W = LABEL_W + n * CELL;
const SVG_H = LABEL_H + n * CELL + LEGEND_MARGIN + LEGEND_H;
const LEGEND_W = 200;

// ─── Component ───────────────────────────────────────────────────────────────
export function CorrelationMatrix() {
  const [hovered, setHovered] = useState<[number, number] | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-xs text-muted-foreground">
        Pairwise correlation coefficients (deterministic, seed 12345)
      </p>
      <div className="overflow-x-auto w-full">
        <svg
          width={SVG_W}
          height={SVG_H}
          aria-label="Correlation matrix"
          role="img"
          className="text-[9px]"
        >
          {/* Column labels (top) */}
          {TICKERS.map((ticker, j) => (
            <text
              key={`col-${ticker}`}
              x={LABEL_W + j * CELL + CELL / 2}
              y={LABEL_H - 6}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={9}
              fontFamily="var(--font-sans, system-ui, sans-serif)"
              fill={
                hovered && (hovered[0] === j || hovered[1] === j)
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground))"
              }
              fontWeight={
                hovered && (hovered[0] === j || hovered[1] === j)
                  ? "600"
                  : "400"
              }
            >
              {ticker === "BTC-USD" ? "BTC" : ticker}
            </text>
          ))}

          {/* Row labels (left) */}
          {TICKERS.map((ticker, i) => (
            <text
              key={`row-${ticker}`}
              x={LABEL_W - 4}
              y={LABEL_H + i * CELL + CELL / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="var(--font-sans, system-ui, sans-serif)"
              fill={
                hovered && (hovered[0] === i || hovered[1] === i)
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground))"
              }
              fontWeight={
                hovered && (hovered[0] === i || hovered[1] === i)
                  ? "600"
                  : "400"
              }
            >
              {ticker === "BTC-USD" ? "BTC" : ticker}
            </text>
          ))}

          {/* Matrix cells */}
          {CORRELATION_MATRIX.map((row, i) =>
            row.map((val, j) => {
              const x = LABEL_W + j * CELL;
              const y = LABEL_H + i * CELL;
              const isHovered =
                hovered !== null && hovered[0] === i && hovered[1] === j;
              return (
                <g
                  key={`cell-${i}-${j}`}
                  onMouseEnter={() => setHovered([i, j])}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "default" }}
                >
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    fill={corrToColor(val)}
                    rx={2}
                    opacity={isHovered ? 0.85 : 1}
                  />
                  {isHovered && (
                    <rect
                      x={x + 1}
                      y={y + 1}
                      width={CELL - 2}
                      height={CELL - 2}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={1.5}
                      rx={2}
                    />
                  )}
                  <text
                    x={x + CELL / 2}
                    y={y + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontFamily="var(--font-mono, monospace)"
                    fontWeight={i === j ? "700" : "400"}
                    fill={corrToTextColor(val)}
                  >
                    {val.toFixed(2)}
                  </text>
                </g>
              );
            }),
          )}

          {/* Legend */}
          {(() => {
            const legendY = LABEL_H + n * CELL + LEGEND_MARGIN;
            const legendX = LABEL_W + (n * CELL - LEGEND_W) / 2;
            const steps = 40;
            const stepW = LEGEND_W / steps;
            return (
              <g transform={`translate(0, ${legendY})`}>
                {/* Gradient bar */}
                {Array.from({ length: steps }).map((_, k) => {
                  const t = k / (steps - 1); // 0..1
                  const val = t * 2 - 1; // -1..+1
                  return (
                    <rect
                      key={`legend-${k}`}
                      x={legendX + k * stepW}
                      y={0}
                      width={stepW + 0.5}
                      height={10}
                      fill={corrToColor(val)}
                    />
                  );
                })}
                {/* Legend border */}
                <rect
                  x={legendX}
                  y={0}
                  width={LEGEND_W}
                  height={10}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  rx={2}
                />
                {/* Labels */}
                <text
                  x={legendX}
                  y={20}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="var(--font-mono, monospace)"
                  fill="hsl(var(--muted-foreground))"
                >
                  -1.00
                </text>
                <text
                  x={legendX + LEGEND_W / 2}
                  y={20}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="var(--font-mono, monospace)"
                  fill="hsl(var(--muted-foreground))"
                >
                  0.00
                </text>
                <text
                  x={legendX + LEGEND_W}
                  y={20}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="var(--font-mono, monospace)"
                  fill="hsl(var(--muted-foreground))"
                >
                  +1.00
                </text>
                {/* Descriptive label */}
                <text
                  x={legendX + LEGEND_W / 2}
                  y={32}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontFamily="var(--font-sans, system-ui, sans-serif)"
                  fill="hsl(var(--muted-foreground))"
                >
                  −1.0 ← Negative · Diagonal = Self · Positive → +1.0
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
