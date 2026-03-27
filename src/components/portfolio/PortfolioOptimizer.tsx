"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asset {
  ticker: string;
  expectedReturn: number; // %
  volatility: number;     // %
}

type CorrelationLevel = "low" | "medium" | "high";

const CORRELATION_VALUE: Record<CorrelationLevel, number> = {
  low: 0.1,
  medium: 0.45,
  high: 0.8,
};

interface PortfolioPoint {
  volatility: number;
  ret: number;
  weights: number[];
}

// ─── Default Assets ───────────────────────────────────────────────────────────

const DEFAULT_ASSETS: Asset[] = [
  { ticker: "AAPL", expectedReturn: 14.5, volatility: 28.0 },
  { ticker: "MSFT", expectedReturn: 13.8, volatility: 25.5 },
  { ticker: "GOOG", expectedReturn: 12.0, volatility: 27.0 },
  { ticker: "AMZN", expectedReturn: 15.2, volatility: 30.0 },
  { ticker: "BND",  expectedReturn: 3.5,  volatility: 4.5  },
];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function buildCovMatrix(assets: Asset[], correlations: number[][]): number[][] {
  const n = assets.length;
  const cov: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const si = assets[i].volatility / 100;
      const sj = assets[j].volatility / 100;
      cov[i][j] = i === j ? si * si : correlations[i][j] * si * sj;
    }
  }
  return cov;
}

function portfolioStats(
  weights: number[],
  assets: Asset[],
  cov: number[][],
): { vol: number; ret: number; sharpe: number } {
  const n = assets.length;
  let ret = 0;
  for (let i = 0; i < n; i++) ret += weights[i] * (assets[i].expectedReturn / 100);

  let varP = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      varP += weights[i] * weights[j] * cov[i][j];
    }
  }
  const vol = Math.sqrt(Math.max(varP, 0));
  const riskFreeRate = 0.05;
  const sharpe = vol > 0 ? (ret - riskFreeRate) / vol : 0;
  return { vol: vol * 100, ret: ret * 100, sharpe };
}

function normalizeWeights(w: number[]): number[] {
  const sum = w.reduce((s, x) => s + x, 0);
  return sum > 0 ? w.map((x) => x / sum) : w.map(() => 1 / w.length);
}

// Monte Carlo: generate random portfolios on the efficient frontier
function generateFrontier(
  assets: Asset[],
  cov: number[][],
  samples = 400,
): PortfolioPoint[] {
  const n = assets.length;
  const points: PortfolioPoint[] = [];

  // Random portfolios
  for (let s = 0; s < samples; s++) {
    // Use deterministic seeded values for SSR safety
    const seed = s * 1103515245 + 12345;
    const rawWeights = Array.from({ length: n }, (_, i) => {
      const x = ((seed ^ (i * 6364136223846793005 + 1442695040888963407)) >>> 0) / 4294967296;
      return Math.abs(x);
    });
    const weights = normalizeWeights(rawWeights);
    const stats = portfolioStats(weights, assets, cov);
    points.push({ volatility: stats.vol, ret: stats.ret, weights });
  }

  // Add equal weight
  const eqW = assets.map(() => 1 / n);
  const eqStats = portfolioStats(eqW, assets, cov);
  points.push({ volatility: eqStats.vol, ret: eqStats.ret, weights: eqW });

  return points;
}

// Minimum variance portfolio (gradient descent)
function findMinVariance(assets: Asset[], cov: number[][]): PortfolioPoint {
  const n = assets.length;
  let weights = assets.map(() => 1 / n);

  for (let iter = 0; iter < 2000; iter++) {
    const lr = 0.01;
    const grad = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        grad[i] += 2 * weights[j] * cov[i][j];
      }
    }
    weights = weights.map((w, i) => Math.max(0, w - lr * grad[i]));
    weights = normalizeWeights(weights);
  }

  const stats = portfolioStats(weights, assets, cov);
  return { volatility: stats.vol, ret: stats.ret, weights };
}

// Max Sharpe portfolio (gradient ascent on Sharpe)
function findMaxSharpe(assets: Asset[], cov: number[][]): PortfolioPoint {
  const n = assets.length;
  let weights = assets.map(() => 1 / n);
  const riskFreeRate = 0.05;

  for (let iter = 0; iter < 2000; iter++) {
    const lr = 0.008;
    const s = portfolioStats(weights, assets, cov);
    const retP = s.ret / 100;
    const volP = s.vol / 100;

    const grad = Array(n).fill(0);
    // Gradient of Sharpe w.r.t. weights[i]
    for (let i = 0; i < n; i++) {
      const dRet = assets[i].expectedReturn / 100;
      let dVar = 0;
      for (let j = 0; j < n; j++) dVar += 2 * weights[j] * cov[i][j];
      const dVol = volP > 0 ? dVar / (2 * volP) : 0;
      grad[i] = (dRet * volP - (retP - riskFreeRate) * dVol) / (volP * volP + 1e-10);
    }

    weights = weights.map((w, i) => Math.max(0, w + lr * grad[i]));
    weights = normalizeWeights(weights);
  }

  const stats = portfolioStats(weights, assets, cov);
  return { volatility: stats.vol, ret: stats.ret, weights };
}

// ─── SVG Scatter Plot ─────────────────────────────────────────────────────────

function EfficientFrontierChart({
  points,
  minVar,
  maxSharpe,
  currentPoint,
}: {
  points: PortfolioPoint[];
  minVar: PortfolioPoint;
  maxSharpe: PortfolioPoint;
  currentPoint: PortfolioPoint;
}) {
  const W = 320;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };

  const allVols = [...points.map((p) => p.volatility), minVar.volatility, maxSharpe.volatility, currentPoint.volatility];
  const allRets = [...points.map((p) => p.ret), minVar.ret, maxSharpe.ret, currentPoint.ret];
  const minVol = Math.max(0, Math.min(...allVols) - 1);
  const maxVol = Math.max(...allVols) + 1;
  const minRet = Math.min(...allRets) - 0.5;
  const maxRet = Math.max(...allRets) + 0.5;

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const toX = (v: number) => PAD.left + ((v - minVol) / (maxVol - minVol)) * chartW;
  const toY = (r: number) => PAD.top + chartH - ((r - minRet) / (maxRet - minRet)) * chartH;

  // Build frontier line: sort by return, hull-like selection (minimum vol per return bucket)
  const sorted = [...points].sort((a, b) => a.ret - b.ret);
  const buckets = 20;
  const retRange = maxRet - minRet;
  const frontierLine: PortfolioPoint[] = [];
  for (let b = 0; b < buckets; b++) {
    const lo = minRet + (b / buckets) * retRange;
    const hi = minRet + ((b + 1) / buckets) * retRange;
    const bucket = sorted.filter((p) => p.ret >= lo && p.ret < hi);
    if (bucket.length > 0) {
      frontierLine.push(bucket.reduce((best, p) => (p.volatility < best.volatility ? p : best)));
    }
  }
  frontierLine.push(minVar);
  frontierLine.push(maxSharpe);
  frontierLine.sort((a, b) => a.ret - b.ret);

  const lineD = frontierLine
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.volatility).toFixed(1)},${toY(p.ret).toFixed(1)}`)
    .join(" ");

  // X/Y axis labels
  const xTicks = [minVol, (minVol + maxVol) / 2, maxVol].map((v) => parseFloat(v.toFixed(1)));
  const yTicks = [minRet, (minRet + maxRet) / 2, maxRet].map((r) => parseFloat(r.toFixed(1)));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid lines */}
      {yTicks.map((r) => (
        <line
          key={r}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={toY(r)}
          y2={toY(r)}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeDasharray="3,3"
        />
      ))}

      {/* Scatter points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={toX(p.volatility)}
          cy={toY(p.ret)}
          r={1.8}
          fill="#3b82f6"
          fillOpacity={0.25}
        />
      ))}

      {/* Frontier line */}
      <path d={lineD} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeOpacity={0.6} />

      {/* Current portfolio */}
      <circle
        cx={toX(currentPoint.volatility)}
        cy={toY(currentPoint.ret)}
        r={5}
        fill="#f59e0b"
        stroke="#fcd34d"
        strokeWidth={1}
      />
      <text
        x={toX(currentPoint.volatility) + 7}
        y={toY(currentPoint.ret) + 4}
        fontSize={8}
        fill="#f59e0b"
      >
        Current
      </text>

      {/* Min variance */}
      <circle
        cx={toX(minVar.volatility)}
        cy={toY(minVar.ret)}
        r={5}
        fill="#10b981"
        stroke="#34d399"
        strokeWidth={1}
      />
      <text
        x={toX(minVar.volatility) + 7}
        y={toY(minVar.ret) + 4}
        fontSize={8}
        fill="#10b981"
      >
        Min-Var
      </text>

      {/* Max Sharpe */}
      <circle
        cx={toX(maxSharpe.volatility)}
        cy={toY(maxSharpe.ret)}
        r={5}
        fill="#8b5cf6"
        stroke="#a78bfa"
        strokeWidth={1}
      />
      <text
        x={toX(maxSharpe.volatility) + 7}
        y={toY(maxSharpe.ret) + 4}
        fontSize={8}
        fill="#8b5cf6"
      >
        Max Sharpe
      </text>

      {/* X axis */}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={H - PAD.bottom}
        y2={H - PAD.bottom}
        stroke="currentColor"
        strokeOpacity={0.2}
      />
      {xTicks.map((v) => (
        <text
          key={v}
          x={toX(v)}
          y={H - PAD.bottom + 12}
          textAnchor="middle"
          fontSize={7}
          fill="currentColor"
          fillOpacity={0.5}
        >
          {v.toFixed(0)}%
        </text>
      ))}

      {/* Y axis */}
      <line
        x1={PAD.left}
        x2={PAD.left}
        y1={PAD.top}
        y2={H - PAD.bottom}
        stroke="currentColor"
        strokeOpacity={0.2}
      />
      {yTicks.map((r) => (
        <text
          key={r}
          x={PAD.left - 4}
          y={toY(r) + 3}
          textAnchor="end"
          fontSize={7}
          fill="currentColor"
          fillOpacity={0.5}
        >
          {r.toFixed(1)}%
        </text>
      ))}

      {/* Axis labels */}
      <text
        x={W / 2}
        y={H - 2}
        textAnchor="middle"
        fontSize={7}
        fill="currentColor"
        fillOpacity={0.4}
      >
        Volatility (%)
      </text>
      <text
        x={8}
        y={H / 2}
        textAnchor="middle"
        fontSize={7}
        fill="currentColor"
        fillOpacity={0.4}
        transform={`rotate(-90, 8, ${H / 2})`}
      >
        Return (%)
      </text>
    </svg>
  );
}

// ─── Weights Table ────────────────────────────────────────────────────────────

function WeightsTable({
  assets,
  weights,
  label,
  color,
}: {
  assets: Asset[];
  weights: number[];
  label: string;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <p className={cn("text-[10px] font-semibold uppercase tracking-wide", color)}>{label}</p>
      <div className="space-y-1.5">
        {assets.map((a, i) => (
          <div key={a.ticker} className="flex items-center gap-2">
            <span className="text-xs font-medium w-10">{a.ticker}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", color === "text-emerald-400" ? "bg-emerald-500" : "bg-violet-500")}
                style={{ width: `${(weights[i] * 100).toFixed(1)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-10 text-right">
              {(weights[i] * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PortfolioOptimizer() {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  // correlation pairs stored as upper-triangle index [i][j] where i < j
  const [corrLevels, setCorrLevels] = useState<CorrelationLevel[][]>(
    () => Array.from({ length: DEFAULT_ASSETS.length }, (_, i) =>
      Array.from({ length: DEFAULT_ASSETS.length }, (_, j) =>
        i < j ? "medium" : "low"
      )
    )
  );

  const updateAsset = useCallback((idx: number, field: keyof Asset, raw: string) => {
    const value = field === "ticker" ? raw : parseFloat(raw) || 0;
    setAssets((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const updateCorr = useCallback((i: number, j: number, level: CorrelationLevel) => {
    setCorrLevels((prev) => {
      const next = prev.map((row) => [...row]);
      next[i][j] = level;
      next[j][i] = level;
      return next;
    });
  }, []);

  const correlationMatrix = useMemo<number[][]>(() => {
    const n = assets.length;
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) =>
        i === j ? 1 : CORRELATION_VALUE[corrLevels[i][j] ?? "medium"]
      )
    );
  }, [assets, corrLevels]);

  const cov = useMemo(() => buildCovMatrix(assets, correlationMatrix), [assets, correlationMatrix]);
  const frontierPoints = useMemo(() => generateFrontier(assets, cov, 350), [assets, cov]);

  const minVar = useMemo(() => findMinVariance(assets, cov), [assets, cov]);
  const maxSharpe = useMemo(() => findMaxSharpe(assets, cov), [assets, cov]);

  // Current portfolio: equal weight
  const currentWeights = useMemo(() => assets.map(() => 1 / assets.length), [assets]);
  const currentStats = useMemo(() => portfolioStats(currentWeights, assets, cov), [currentWeights, assets, cov]);
  const currentPoint: PortfolioPoint = { volatility: currentStats.vol, ret: currentStats.ret, weights: currentWeights };

  const [showCorrPanel, setShowCorrPanel] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Portfolio Optimizer</h3>
        <span className="text-[10px] text-muted-foreground">Modern Portfolio Theory</span>
      </div>

      {/* Asset inputs */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Assets</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-1 px-1 font-medium">Ticker</th>
                <th className="text-right py-1 px-1 font-medium">Exp. Return %</th>
                <th className="text-right py-1 px-1 font-medium">Volatility %</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a, i) => (
                <tr key={i} className="border-b border-muted/40">
                  <td className="py-1 px-1">
                    <input
                      className="w-14 rounded bg-muted/40 px-1.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      value={a.ticker}
                      onChange={(e) => updateAsset(i, "ticker", e.target.value)}
                    />
                  </td>
                  <td className="py-1 px-1 text-right">
                    <input
                      type="number"
                      className="w-16 rounded bg-muted/40 px-1.5 py-0.5 text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary"
                      value={a.expectedReturn}
                      step={0.1}
                      onChange={(e) => updateAsset(i, "expectedReturn", e.target.value)}
                    />
                  </td>
                  <td className="py-1 px-1 text-right">
                    <input
                      type="number"
                      className="w-16 rounded bg-muted/40 px-1.5 py-0.5 text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary"
                      value={a.volatility}
                      step={0.1}
                      onChange={(e) => updateAsset(i, "volatility", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation panel toggle */}
      <div>
        <button
          onClick={() => setShowCorrPanel((v) => !v)}
          className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={cn("transition-transform", showCorrPanel ? "rotate-90" : "")}
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Correlation Inputs
        </button>

        {showCorrPanel && (
          <div className="mt-2 space-y-1.5">
            {assets.map((a, i) =>
              assets.map((b, j) => {
                if (j <= i) return null;
                return (
                  <div key={`${i}-${j}`} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-20">
                      {a.ticker} / {b.ticker}
                    </span>
                    <div className="flex gap-1">
                      {(["low", "medium", "high"] as CorrelationLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => updateCorr(i, j, lvl)}
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded capitalize transition-colors",
                            corrLevels[i][j] === lvl
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      r={CORRELATION_VALUE[corrLevels[i][j] ?? "medium"].toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Efficient frontier chart */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Efficient Frontier</p>
        <div className="rounded-lg border border-border bg-muted/20 p-2">
          <EfficientFrontierChart
            points={frontierPoints}
            minVar={minVar}
            maxSharpe={maxSharpe}
            currentPoint={currentPoint}
          />
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-1 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[9px] text-muted-foreground">Current (equal-weight)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-muted-foreground">Min Variance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="text-[9px] text-muted-foreground">Max Sharpe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Current Sharpe", value: currentStats.sharpe.toFixed(2), color: "text-amber-400" },
          { label: "Min-Var Sharpe", value: portfolioStats(minVar.weights, assets, cov).sharpe.toFixed(2), color: "text-emerald-400" },
          { label: "Max Sharpe", value: portfolioStats(maxSharpe.weights, assets, cov).sharpe.toFixed(2), color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={cn("font-mono tabular-nums text-sm font-semibold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Weights tables */}
      <div className="grid grid-cols-2 gap-4">
        <WeightsTable
          assets={assets}
          weights={maxSharpe.weights}
          label="Max Sharpe Weights"
          color="text-violet-400"
        />
        <WeightsTable
          assets={assets}
          weights={minVar.weights}
          label="Conservative Weights"
          color="text-emerald-400"
        />
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        The efficient frontier shows all portfolios achieving the maximum return for a given level of risk. The Max Sharpe point has the best risk-adjusted return. The Min-Variance point has the lowest possible portfolio volatility. Based on Modern Portfolio Theory (Markowitz, 1952).
      </p>
    </div>
  );
}
