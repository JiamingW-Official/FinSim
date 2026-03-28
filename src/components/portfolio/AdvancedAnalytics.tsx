"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

// ── mulberry32 PRNG ──────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── TypeScript interfaces ─────────────────────────────────────────────────────

interface MonthlyReturn {
  month: string;
  portfolio: number;
  sp500: number;
  balanced: number;
  riskFree: number;
}

interface BenchmarkStats {
  alpha: number;
  beta: number;
  r2: number;
  trackingError: number;
  informationRatio: number;
}

interface FactorExposure {
  name: string;
  label: string;
  beta: number;
  tStat: number;
  contribution: number; // % of total return
}

interface DrawdownPoint {
  index: number;
  drawdown: number; // negative number, fraction
}

interface WorstDrawdown {
  startMonth: string;
  endMonth: string;
  depth: number; // negative fraction
  recoveryDays: number;
}

interface DrawdownStats {
  maxDrawdown: number;
  avgDrawdown: number;
  recoveryDate: string;
  worstDrawdowns: WorstDrawdown[];
}

interface RollingPoint {
  index: number;
  value: number;
}

interface RollingStats {
  volatility: RollingPoint[];
  sharpe: RollingPoint[];
  beta: RollingPoint[];
}

interface CorrelationData {
  tickers: string[];
  matrix: number[][];
  diversificationScore: number;
  highCorrelationPairs: string[];
}

// ── Data generation helpers ──────────────────────────────────────────────────

const MONTHS = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
];

function generateBenchmarkData(): MonthlyReturn[] {
  const rng = mulberry32(6543);
  return MONTHS.map((month) => ({
    month,
    portfolio: (rng() - 0.42) * 0.12,
    sp500: (rng() - 0.43) * 0.09,
    balanced: (rng() - 0.44) * 0.06,
    riskFree: 0.0043 + rng() * 0.001,
  }));
}

function computeBenchmarkStats(data: MonthlyReturn[]): BenchmarkStats {
  const portfolio = data.map((d) => d.portfolio);
  const sp500 = data.map((d) => d.sp500);

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = (arr: number[]) => {
    const m = mean(arr);
    return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  };
  const covariance = (a: number[], b: number[]) => {
    const ma = mean(a);
    const mb = mean(b);
    return a.reduce((s, ai, i) => s + (ai - ma) * (b[i] - mb), 0) / a.length;
  };

  const beta = covariance(portfolio, sp500) / variance(sp500);
  const alpha = (mean(portfolio) - beta * mean(sp500)) * 12; // annualised
  const diffReturns = portfolio.map((p, i) => p - sp500[i]);
  const trackingError = Math.sqrt(variance(diffReturns) * 12);

  // R² = corr²
  const corr =
    covariance(portfolio, sp500) /
    Math.sqrt(variance(portfolio) * variance(sp500));
  const r2 = corr ** 2;

  const informationRatio = alpha / trackingError;

  return {
    alpha: parseFloat((alpha * 100).toFixed(2)),
    beta: parseFloat(beta.toFixed(2)),
    r2: parseFloat(r2.toFixed(3)),
    trackingError: parseFloat((trackingError * 100).toFixed(2)),
    informationRatio: parseFloat(informationRatio.toFixed(2)),
  };
}

function generateFactorExposures(): FactorExposure[] {
  const rng = mulberry32(6544);
  const factors: { name: string; label: string }[] = [
    { name: "Market (Rm-Rf)", label: "MKT" },
    { name: "Size (SMB)", label: "SMB" },
    { name: "Value (HML)", label: "HML" },
    { name: "Profitability (RMW)", label: "RMW" },
    { name: "Investment (CMA)", label: "CMA" },
    { name: "Momentum (MOM)", label: "MOM" },
  ];
  const rawContribs = factors.map(() => (rng() - 0.4) * 20);
  const total = rawContribs.reduce((a, b) => a + Math.abs(b), 0);
  return factors.map((f, i) => ({
    ...f,
    beta: parseFloat(((rng() - 0.3) * 2).toFixed(2)),
    tStat: parseFloat(((rng() - 0.3) * 4).toFixed(2)),
    contribution: parseFloat(((rawContribs[i] / total) * 100).toFixed(1)),
  }));
}

function generateDrawdownData(): { points: DrawdownPoint[]; stats: DrawdownStats } {
  const rng = mulberry32(6545);
  const n = 50;
  const prices: number[] = [100];
  for (let i = 1; i < n; i++) {
    prices.push(prices[i - 1] * (1 + (rng() - 0.46) * 0.05));
  }

  let peak = prices[0];
  const points: DrawdownPoint[] = prices.map((p, index) => {
    if (p > peak) peak = p;
    return { index, drawdown: (p - peak) / peak };
  });

  const maxDrawdown = Math.min(...points.map((p) => p.drawdown));

  const avgDrawdown =
    points.filter((p) => p.drawdown < 0).reduce((a, b) => a + b.drawdown, 0) /
    Math.max(1, points.filter((p) => p.drawdown < 0).length);

  const worstDrawdowns: WorstDrawdown[] = Array.from({ length: 5 }, (_, i) => {
    const depth = maxDrawdown * (1 - i * 0.15);
    const startIdx = Math.floor(rng() * 8);
    const endIdx = startIdx + 3 + Math.floor(rng() * 5);
    return {
      startMonth: MONTHS[startIdx % 12],
      endMonth: MONTHS[endIdx % 12],
      depth: parseFloat(depth.toFixed(4)),
      recoveryDays: Math.floor(30 + rng() * 90),
    };
  });

  return {
    points,
    stats: {
      maxDrawdown,
      avgDrawdown,
      recoveryDate: MONTHS[8],
      worstDrawdowns,
    },
  };
}

function generateRollingStats(window: number): RollingStats {
  const rng = mulberry32(6546 + window);
  const n = 50;
  const mk = (scale: number, offset: number): RollingPoint[] =>
    Array.from({ length: n }, (_, index) => ({
      index,
      value: offset + (rng() - 0.5) * scale,
    }));

  return {
    volatility: mk(0.06, 0.18),
    sharpe: mk(1.2, 1.1),
    beta: mk(0.4, 0.9),
  };
}

function generateCorrelationData(): CorrelationData {
  const tickers = ["AAPL", "MSFT", "TSLA", "SPY", "QQQ"];
  const rng = mulberry32(6547);
  const n = tickers.length;

  // Build a symmetric matrix with 1s on diagonal
  const matrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1;
      if (j < i) return 0; // fill from upper triangle
      return parseFloat((rng() * 1.6 - 0.3).toFixed(2));
    })
  );

  // Mirror upper triangle to lower
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      matrix[i][j] = matrix[j][i];
    }
  }

  // Clamp to [-1, 1]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = Math.max(-1, Math.min(1, matrix[i][j]));
    }
  }

  // Diversification score
  let pairSum = 0;
  let pairCount = 0;
  const highCorrelationPairs: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairSum += matrix[i][j];
      pairCount++;
      if (matrix[i][j] > 0.8) {
        highCorrelationPairs.push(`${tickers[i]}-${tickers[j]}`);
      }
    }
  }
  const avgCorr = pairSum / pairCount;
  const diversificationScore = parseFloat((1 - avgCorr).toFixed(3));

  return { tickers, matrix, diversificationScore, highCorrelationPairs };
}

// ── Colour helpers ────────────────────────────────────────────────────────────

function corrColor(v: number): string {
  // -1 → red, 0 → neutral, 1 → green
  const r = v < 0 ? 255 : Math.round(255 * (1 - v));
  const g = v > 0 ? 255 : Math.round(255 * (1 + v));
  const b = Math.round(255 * (1 - Math.abs(v)));
  return `rgb(${r},${g},${b})`;
}

// ── SVG Chart helpers ─────────────────────────────────────────────────────────

function normaliseSeries(
  values: number[],
  minY: number,
  maxY: number,
  height: number,
  padY = 10
) {
  const range = maxY - minY || 1;
  return values.map(
    (v) => padY + ((maxY - v) / range) * (height - padY * 2)
  );
}

function polyline(
  xs: number[],
  ys: number[]
): string {
  return xs.map((x, i) => `${x},${ys[i]}`).join(" ");
}

// ── Section 1: Performance Benchmarking ──────────────────────────────────────

function BenchmarkChart({ data }: { data: MonthlyReturn[] }) {
  const W = 600;
  const H = 200;
  const padX = 40;
  const padY = 16;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  // Convert to cumulative returns
  function cumulative(returns: number[]): number[] {
    const result: number[] = [];
    let cum = 1;
    for (const r of returns) {
      cum *= 1 + r;
      result.push(cum);
    }
    return result;
  }

  const portfolio = cumulative(data.map((d) => d.portfolio));
  const sp500 = cumulative(data.map((d) => d.sp500));
  const balanced = cumulative(data.map((d) => d.balanced));
  const riskFree = cumulative(data.map((d) => d.riskFree));

  const allValues = [...portfolio, ...sp500, ...balanced, ...riskFree];
  const minY = Math.min(...allValues) - 0.02;
  const maxY = Math.max(...allValues) + 0.02;

  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * innerW);
  const toY = (v: number) =>
    padY + ((maxY - v) / (maxY - minY)) * innerH;

  const lines = [
    { values: portfolio, color: "#3b82f6", label: "Portfolio", dash: "" },
    { values: sp500, color: "#10b981", label: "S&P 500", dash: "" },
    { values: balanced, color: "#f59e0b", label: "60/40", dash: "4 2" },
    { values: riskFree, color: "#6b7280", label: "Risk-free", dash: "2 3" },
  ];

  const yTicks = 4;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
        {/* Grid lines */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = minY + ((maxY - minY) * i) / yTicks;
          const y = toY(v);
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#374151" strokeWidth={0.5} />
              <text x={padX - 4} y={y + 3} textAnchor="end" fontSize={9} fill="#6b7280">
                {((v - 1) * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) =>
          i % 2 === 0 ? (
            <text key={i} x={xs[i]} y={H - 2} textAnchor="middle" fontSize={9} fill="#6b7280">
              {d.month}
            </text>
          ) : null
        )}

        {/* Lines */}
        {lines.map((l) => (
          <polyline
            key={l.label}
            points={polyline(xs, l.values.map(toY))}
            fill="none"
            stroke={l.color}
            strokeWidth={1.8}
            strokeDasharray={l.dash}
          />
        ))}

        {/* Legend */}
        {lines.map((l, i) => (
          <g key={l.label} transform={`translate(${padX + i * 130}, 8)`}>
            <line x1={0} y1={4} x2={16} y2={4} stroke={l.color} strokeWidth={2} strokeDasharray={l.dash} />
            <text x={20} y={8} fontSize={9} fill="#9ca3af">{l.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Section 2: Factor bar chart ───────────────────────────────────────────────

function FactorBarChart({ factors }: { factors: FactorExposure[] }) {
  const W = 520;
  const H = 180;
  const labelW = 140;
  const barMaxW = W - labelW - 60;
  const rowH = H / factors.length;
  const maxAbs = Math.max(...factors.map((f) => Math.abs(f.contribution)));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {/* Zero line */}
        <line
          x1={labelW}
          y1={0}
          x2={labelW}
          y2={H}
          stroke="#374151"
          strokeWidth={1}
        />
        {factors.map((f, i) => {
          const y = i * rowH;
          const w = (Math.abs(f.contribution) / maxAbs) * barMaxW * 0.9;
          const positive = f.contribution >= 0;
          return (
            <g key={f.label}>
              <text x={labelW - 6} y={y + rowH / 2 + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                {f.label}
              </text>
              <rect
                x={positive ? labelW + 2 : labelW - w - 2}
                y={y + rowH * 0.2}
                width={w}
                height={rowH * 0.6}
                fill={positive ? "#10b981" : "#ef4444"}
                rx={2}
                opacity={0.85}
              />
              <text
                x={positive ? labelW + w + 6 : labelW - w - 6}
                y={y + rowH / 2 + 4}
                textAnchor={positive ? "start" : "end"}
                fontSize={9}
                fill={positive ? "#10b981" : "#ef4444"}
              >
                {f.contribution > 0 ? "+" : ""}{f.contribution}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Section 3: Underwater / drawdown chart ────────────────────────────────────

function DrawdownChart({ points }: { points: DrawdownPoint[] }) {
  const W = 400;
  const H = 160;
  const padX = 30;
  const padY = 12;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2 - 14;

  const minDD = Math.min(...points.map((p) => p.drawdown));
  const xs = points.map((p) => padX + (p.index / (points.length - 1)) * innerW);
  const toY = (v: number) => padY + (v / (minDD || -0.01)) * innerH;

  const pathPoints = points
    .map((p, i) => `${xs[i]},${toY(p.drawdown)}`)
    .join(" ");

  const areaPath =
    `M ${xs[0]},${toY(0)} ` +
    points.map((p, i) => `L ${xs[i]},${toY(p.drawdown)}`).join(" ") +
    ` L ${xs[xs.length - 1]},${toY(0)} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 260 }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = minDD * t;
          const y = toY(v);
          return (
            <g key={t}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#374151" strokeWidth={0.5} />
              <text x={padX - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#6b7280">
                {(v * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* Filled area */}
        <path d={areaPath} fill="#ef4444" opacity={0.2} />
        {/* Line */}
        <polyline points={pathPoints} fill="none" stroke="#ef4444" strokeWidth={1.5} />

        {/* Max drawdown marker */}
        {(() => {
          const maxIdx = points.reduce(
            (mi, p, i) => (p.drawdown < points[mi].drawdown ? i : mi),
            0
          );
          const mx = xs[maxIdx];
          const my = toY(points[maxIdx].drawdown);
          return (
            <g>
              <line x1={mx} y1={my} x2={mx} y2={toY(0)} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" />
              <circle cx={mx} cy={my} r={3} fill="#f59e0b" />
              <text x={mx + 4} y={my - 3} fontSize={8} fill="#f59e0b">Max DD</text>
            </g>
          );
        })()}

        {/* X-axis */}
        <line x1={padX} y1={toY(0)} x2={W - padX} y2={toY(0)} stroke="#6b7280" strokeWidth={0.8} />
      </svg>
    </div>
  );
}

// ── Section 4: Rolling sparkline ──────────────────────────────────────────────

function RollingSparkline({
  data,
  color,
  label,
  unit,
}: {
  data: RollingPoint[];
  color: string;
  label: string;
  unit: string;
}) {
  const W = 200;
  const H = 80;
  const padX = 4;
  const padY = 8;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2 - 14;

  const vals = data.map((d) => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * innerW);
  const toY = (v: number) => padY + ((maxV - v) / range) * innerH;

  const pathD =
    "M " + data.map((d, i) => `${xs[i]},${toY(d.value)}`).join(" L ");
  const areaD =
    `M ${xs[0]},${padY + innerH} ` +
    data.map((d, i) => `L ${xs[i]},${toY(d.value)}`).join(" ") +
    ` L ${xs[xs.length - 1]},${padY + innerH} Z`;

  const last = vals[vals.length - 1];

  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-2 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>
          {last.toFixed(2)}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <path d={areaD} fill={color} opacity={0.12} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} />
        {/* Last point dot */}
        <circle cx={xs[xs.length - 1]} cy={toY(last)} r={2.5} fill={color} />
      </svg>
    </div>
  );
}

// ── Section 5: Correlation heatmap ────────────────────────────────────────────

function CorrelationHeatmap({ data }: { data: CorrelationData }) {
  const { tickers, matrix } = data;
  const n = tickers.length;
  const cellSize = 44;
  const labelSize = 36;
  const W = labelSize + n * cellSize;
  const H = labelSize + n * cellSize;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 240 }}>
        {/* Column labels */}
        {tickers.map((t, j) => (
          <text
            key={`col-${j}`}
            x={labelSize + j * cellSize + cellSize / 2}
            y={labelSize - 4}
            textAnchor="middle"
            fontSize={9}
            fill="#9ca3af"
          >
            {t}
          </text>
        ))}
        {/* Row labels */}
        {tickers.map((t, i) => (
          <text
            key={`row-${i}`}
            x={labelSize - 4}
            y={labelSize + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            fontSize={9}
            fill="#9ca3af"
          >
            {t}
          </text>
        ))}
        {/* Cells */}
        {matrix.map((row, i) =>
          row.map((val, j) => {
            const x = labelSize + j * cellSize;
            const y = labelSize + i * cellSize;
            const bg = corrColor(val);
            const textDark = Math.abs(val) > 0.5;
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={bg}
                  rx={2}
                  opacity={0.85}
                />
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill={textDark ? "#111827" : "#e5e7eb"}
                  fontWeight={i === j ? "700" : "400"}
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdvancedAnalytics() {
  const [rollingWindow, setRollingWindow] = useState<30 | 60 | 90>(30);

  const benchmarkData = useMemo(() => generateBenchmarkData(), []);
  const benchmarkStats = useMemo(() => computeBenchmarkStats(benchmarkData), [benchmarkData]);
  const factorExposures = useMemo(() => generateFactorExposures(), []);
  const { points: drawdownPoints, stats: drawdownStats } = useMemo(() => generateDrawdownData(), []);
  const rollingStats = useMemo(() => generateRollingStats(rollingWindow), [rollingWindow]);
  const correlationData = useMemo(() => generateCorrelationData(), []);

  // Regime detection — compare last 10 vol points to average
  const volValues = rollingStats.volatility.map((p) => p.value);
  const avgVol = volValues.reduce((a, b) => a + b, 0) / volValues.length;
  const recentVol =
    volValues.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const isHighVol = recentVol > avgVol * 1.1;

  const statChips: { label: string; value: string; color: string }[] = [
    {
      label: "Alpha (ann.)",
      value: `${benchmarkStats.alpha > 0 ? "+" : ""}${benchmarkStats.alpha}%`,
      color: benchmarkStats.alpha >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Beta",
      value: benchmarkStats.beta.toString(),
      color: "text-blue-400",
    },
    {
      label: "R²",
      value: benchmarkStats.r2.toString(),
      color: "text-violet-400",
    },
    {
      label: "Tracking Error",
      value: `${benchmarkStats.trackingError}%`,
      color: "text-amber-400",
    },
    {
      label: "Info Ratio",
      value: benchmarkStats.informationRatio.toString(),
      color: benchmarkStats.informationRatio >= 0 ? "text-emerald-400" : "text-red-400",
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Section 1: Performance Benchmarking ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block" />
          Performance Benchmarking
        </h3>
        <BenchmarkChart data={benchmarkData} />
        <div className="flex flex-wrap gap-2">
          {statChips.map((chip) => (
            <div
              key={chip.label}
              className="rounded-md border border-border/50 bg-background/60 px-2.5 py-1.5 flex flex-col gap-0.5"
            >
              <span className="text-[9px] text-muted-foreground">{chip.label}</span>
              <span className={cn("text-[11px] font-semibold tabular-nums", chip.color)}>
                {chip.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Risk Factor Decomposition ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 inline-block" />
          Risk Factor Decomposition (Fama-French 5 + Momentum)
        </h3>
        <FactorBarChart factors={factorExposures} />
        <div className="overflow-x-auto rounded-md border border-border/50">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Factor</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Beta</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">t-stat</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {factorExposures.map((f) => (
                <tr key={f.label} className="border-b border-border/20 hover:bg-muted/10">
                  <td className="px-3 py-2 text-muted-foreground">{f.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{f.beta}</td>
                  <td className={cn(
                    "px-3 py-2 text-right tabular-nums",
                    Math.abs(f.tStat) > 2 ? "text-yellow-400" : "text-muted-foreground"
                  )}>
                    {f.tStat}
                  </td>
                  <td className={cn(
                    "px-3 py-2 text-right tabular-nums font-semibold",
                    f.contribution >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {f.contribution > 0 ? "+" : ""}{f.contribution}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: Drawdown Analysis ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
          Drawdown Analysis
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Max Drawdown", value: `${(drawdownStats.maxDrawdown * 100).toFixed(2)}%`, color: "text-red-400" },
            { label: "Avg Drawdown", value: `${(drawdownStats.avgDrawdown * 100).toFixed(2)}%`, color: "text-orange-400" },
            { label: "Recovery", value: drawdownStats.recoveryDate, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-md border border-border/50 bg-background/60 px-2.5 py-2">
              <div className="text-[9px] text-muted-foreground mb-0.5">{s.label}</div>
              <div className={cn("text-[13px] font-semibold tabular-nums", s.color)}>{s.value}</div>
            </div>
          ))}
        </div>

        <DrawdownChart points={drawdownPoints} />

        <div className="overflow-x-auto rounded-md border border-border/50">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Start</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">End</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Depth</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Recovery (d)</th>
              </tr>
            </thead>
            <tbody>
              {drawdownStats.worstDrawdowns.map((dd, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                  <td className="px-3 py-2 text-muted-foreground/60">{i + 1}</td>
                  <td className="px-3 py-2 text-muted-foreground">{dd.startMonth}</td>
                  <td className="px-3 py-2 text-muted-foreground">{dd.endMonth}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-red-400">
                    {(dd.depth * 100).toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {dd.recoveryDays}d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: Rolling Statistics ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
            Rolling Statistics
          </h3>
          <div className="flex gap-1">
            {([30, 60, 90] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setRollingWindow(w)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                  rollingWindow === w
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {w}d
              </button>
            ))}
          </div>
        </div>

        {/* Regime badge */}
        <div className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium",
          isHighVol
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            isHighVol ? "bg-red-400" : "bg-emerald-400"
          )} />
          Regime: {isHighVol ? "High-Volatility" : "Low-Volatility"}
          <span className="text-muted-foreground ml-1">
            (recent {(recentVol * 100).toFixed(1)}% vs avg {(avgVol * 100).toFixed(1)}%)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <RollingSparkline
            data={rollingStats.volatility}
            color="#f59e0b"
            label={`Rolling ${rollingWindow}d Volatility`}
            unit="%"
          />
          <RollingSparkline
            data={rollingStats.sharpe}
            color="#3b82f6"
            label={`Rolling ${rollingWindow}d Sharpe`}
            unit=""
          />
          <RollingSparkline
            data={rollingStats.beta}
            color="#8b5cf6"
            label={`Rolling ${rollingWindow}d Beta`}
            unit=""
          />
        </div>
      </div>

      {/* ── Section 5: Correlation Breakdown ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 inline-block" />
          Correlation Breakdown — Top 5 Holdings
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-6 rounded-sm" style={{ background: "rgb(255,0,128)" }} />
            -1 (Strong negative)
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-6 rounded-sm" style={{ background: "rgb(255,255,255)" }} />
            0 (Neutral)
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-6 rounded-sm" style={{ background: "rgb(0,255,0)" }} />
            +1 (Strong positive)
          </div>
        </div>

        <CorrelationHeatmap data={correlationData} />

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-border/50 bg-background/60 px-3 py-2">
            <div className="text-[9px] text-muted-foreground mb-0.5">Diversification Score</div>
            <div className={cn(
              "text-[13px] font-semibold tabular-nums",
              correlationData.diversificationScore > 0.5 ? "text-emerald-400" : "text-amber-400"
            )}>
              {correlationData.diversificationScore.toFixed(3)}
            </div>
            <div className="text-[9px] text-muted-foreground">1 - avg pairwise corr</div>
          </div>

          {correlationData.highCorrelationPairs.length > 0 && (
            <div className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/8 px-3 py-2">
              <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[9px] font-medium text-amber-400">Concentration Risk</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  {correlationData.highCorrelationPairs.join(", ")} &gt; 0.8 correlation
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
