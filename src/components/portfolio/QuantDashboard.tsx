"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import {
  calculateRiskMetrics,
  calculateDrawdownSeries,
  type RiskMetrics,
} from "@/services/quant/risk-metrics";
import { analyzePortfolio, type PortfolioAnalytics } from "@/services/quant/portfolio-analytics";
import { cn } from "@/lib/utils";

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCell({
  label,
  value,
  tooltip,
  color,
}: {
  label: string;
  value: string;
  tooltip: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/20 bg-card p-3" title={tooltip}>
      <div className="text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-base font-semibold tabular-nums font-mono",
          color,
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Factor Bar ─────────────────────────────────────────────────────────────

function FactorBar({
  label,
  exposure,
  description,
}: {
  label: string;
  exposure: number;
  description: string;
}) {
  // exposure is -1 to +1. Bar center is 50%.
  const pct = Math.round(exposure * 50); // -50 to +50
  const isPositive = pct >= 0;

  return (
    <div className="flex items-center gap-3" title={description}>
      <span className="w-20 text-xs font-medium text-muted-foreground shrink-0">
        {label}
      </span>
      <div className="relative h-4 flex-1 rounded bg-muted/50 overflow-hidden">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
        {/* Bar */}
        {isPositive ? (
          <div
            className="absolute top-0.5 bottom-0.5 rounded-sm bg-emerald-500/70"
            style={{ left: "50%", width: `${Math.abs(pct)}%` }}
          />
        ) : (
          <div
            className="absolute top-0.5 bottom-0.5 rounded-sm bg-red-500/70"
            style={{
              right: "50%",
              width: `${Math.abs(pct)}%`,
            }}
          />
        )}
      </div>
      <span
        className={cn(
          "w-10 text-right text-xs font-mono tabular-nums",
          isPositive ? "text-emerald-500" : "text-red-500",
        )}
      >
        {exposure >= 0 ? "+" : ""}
        {exposure.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Drawdown Chart (SVG) ───────────────────────────────────────────────────

function DrawdownChart({
  data,
}: {
  data: { timestamp: number; drawdown: number }[];
}) {
  if (data.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
        Not enough data for drawdown chart
      </div>
    );
  }

  const width = 600;
  const height = 120;
  const padding = { top: 8, right: 8, bottom: 20, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxDD = Math.max(...data.map((d) => d.drawdown), 1);

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + (d.drawdown / maxDD) * chartH;
    return `${x},${y}`;
  });

  // Fill area
  const areaPath = `M${padding.left},${padding.top} ${points.join(" L")} L${padding.left + chartW},${padding.top} Z`;
  const linePath = `M${points.join(" L")}`;

  // Y-axis labels
  const yLabels = [0, maxDD / 2, maxDD].map((v) => ({
    label: `-${v.toFixed(1)}%`,
    y: padding.top + (v / maxDD) * chartH,
  }));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {yLabels.map((yl, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={yl.y}
            x2={width - padding.right}
            y2={yl.y}
            className="stroke-border"
            strokeDasharray="2,4"
            strokeWidth={0.5}
          />
          <text
            x={padding.left - 4}
            y={yl.y + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
            fontFamily="monospace"
          >
            {yl.label}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} className="fill-red-500/10" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        className="stroke-red-500"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Formatting helpers ─────────────────────────────────────────────────────

function fmtPct(v: number, decimals = 2): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals)}%`;
}

function fmtRatio(v: number): string {
  if (!isFinite(v)) return "N/A";
  return v.toFixed(2);
}

function fmtDollars(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pnlColor(v: number): string {
  if (v > 0) return "text-emerald-500";
  if (v < 0) return "text-red-500";
  return "text-muted-foreground";
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function QuantDashboard() {
  const equityHistory = useTradingStore((s) => s.equityHistory);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const positions = useTradingStore((s) => s.positions);

  const equityPoints = useMemo(
    () =>
      equityHistory.map((e) => ({
        timestamp: e.timestamp,
        value: e.portfolioValue,
      })),
    [equityHistory],
  );

  const metrics: RiskMetrics = useMemo(
    () => calculateRiskMetrics(equityPoints, tradeHistory),
    [equityPoints, tradeHistory],
  );

  const drawdownData = useMemo(
    () => calculateDrawdownSeries(equityPoints),
    [equityPoints],
  );

  const portfolio: PortfolioAnalytics = useMemo(
    () => analyzePortfolio(positions, tradeHistory, equityPoints),
    [positions, tradeHistory, equityPoints],
  );

  const hasData = equityHistory.length >= 2;

  if (!hasData) {
    return (
      <div className="rounded-lg border border-border/20 bg-card p-6 text-center text-sm text-muted-foreground">
        Start trading to generate quantitative analytics. Metrics will appear
        after your first few trades.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Performance Metrics ──────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Performance
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCell
            label="Total Return"
            value={fmtPct(metrics.totalReturn)}
            tooltip="Total portfolio return since inception"
            color={pnlColor(metrics.totalReturn)}
          />
          <MetricCell
            label="CAGR"
            value={fmtPct(metrics.annualizedReturn)}
            tooltip="Compound Annual Growth Rate — annualized return assuming reinvestment"
            color={pnlColor(metrics.annualizedReturn)}
          />
          <MetricCell
            label="Sharpe"
            value={fmtRatio(metrics.sharpeRatio)}
            tooltip="Sharpe Ratio = (Rp - Rf) / Vol. Measures excess return per unit of total risk. >1 is good, >2 is excellent."
            color={pnlColor(metrics.sharpeRatio)}
          />
          <MetricCell
            label="Sortino"
            value={fmtRatio(metrics.sortinoRatio)}
            tooltip="Sortino Ratio = (Rp - Rf) / Downside Dev. Like Sharpe but only penalizes downside volatility."
            color={pnlColor(metrics.sortinoRatio)}
          />
          <MetricCell
            label="Max Drawdown"
            value={`-${metrics.maxDrawdown.toFixed(2)}%`}
            tooltip={`Worst peak-to-trough decline. Duration: ${metrics.maxDrawdownDuration} days.`}
            color="text-red-500"
          />
        </div>
      </div>

      {/* ── Risk Metrics ─────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Risk
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricCell
            label="VaR (95%)"
            value={fmtPct(metrics.valueAtRisk95)}
            tooltip="Value at Risk: maximum expected daily loss at 95% confidence (parametric, normal distribution)"
            color="text-red-500"
          />
          <MetricCell
            label="CVaR (95%)"
            value={fmtPct(metrics.conditionalVaR95)}
            tooltip="Conditional VaR (Expected Shortfall): expected loss when loss exceeds VaR threshold"
            color="text-red-500"
          />
          <MetricCell
            label="Beta"
            value={fmtRatio(metrics.beta)}
            tooltip="Portfolio sensitivity to market moves. 1.0 = moves with market, >1 = amplified, <1 = dampened."
          />
          <MetricCell
            label="Alpha"
            value={fmtPct(metrics.alpha)}
            tooltip="Jensen's Alpha: excess return after adjusting for market risk (beta). Positive = outperformance."
            color={pnlColor(metrics.alpha)}
          />
        </div>
      </div>

      {/* ── Trade Statistics ──────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Trade Statistics
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricCell
            label="Win Rate"
            value={`${metrics.winRate.toFixed(1)}%`}
            tooltip="Percentage of trades that were profitable"
            color={metrics.winRate >= 50 ? "text-emerald-500" : "text-red-500"}
          />
          <MetricCell
            label="Profit Factor"
            value={fmtRatio(metrics.profitFactor)}
            tooltip="Gross profit / gross loss. >1 means profitable, >2 is good, >3 is excellent."
            color={pnlColor(metrics.profitFactor - 1)}
          />
          <MetricCell
            label="Expectancy"
            value={fmtDollars(metrics.expectancy)}
            tooltip="Expected dollar profit per trade: (WinRate * AvgWin) - (LossRate * AvgLoss)"
            color={pnlColor(metrics.expectancy)}
          />
          <MetricCell
            label="Kelly %"
            value={fmtPct(metrics.kellyFraction)}
            tooltip="Kelly Criterion: optimal fraction of capital to risk per trade for maximum long-term growth. Half-Kelly is commonly used in practice."
            color={pnlColor(metrics.kellyFraction)}
          />
        </div>
      </div>

      {/* ── Distribution ─────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Return Distribution
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricCell
            label="Ann. Volatility"
            value={`${metrics.annualizedVolatility.toFixed(2)}%`}
            tooltip="Annualized standard deviation of daily returns (daily vol * sqrt(252))"
          />
          <MetricCell
            label="Calmar"
            value={fmtRatio(metrics.calmarRatio)}
            tooltip="Calmar Ratio = CAGR / Max Drawdown. Higher is better. Measures return per unit of drawdown risk."
            color={pnlColor(metrics.calmarRatio)}
          />
          <MetricCell
            label="Skewness"
            value={metrics.skewness.toFixed(3)}
            tooltip="Skewness of daily returns. Positive = more large gains, Negative = more large losses. Normal distribution = 0."
            color={pnlColor(metrics.skewness)}
          />
          <MetricCell
            label="Kurtosis"
            value={metrics.kurtosis.toFixed(3)}
            tooltip="Excess kurtosis of daily returns. >0 means fat tails (more extreme events than normal). Normal = 0."
            color={metrics.kurtosis > 0 ? "text-amber-500" : undefined}
          />
        </div>
      </div>

      {/* ── Portfolio Breakdown ───────────────────────────────────────── */}
      {positions.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
            Portfolio
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricCell
              label="Portfolio Beta"
              value={fmtRatio(portfolio.portfolioBeta)}
              tooltip="Value-weighted portfolio beta vs market"
            />
            <MetricCell
              label="Ann. Vol"
              value={`${portfolio.portfolioVolatility.toFixed(1)}%`}
              tooltip="Annualized portfolio volatility from equity curve"
            />
            <MetricCell
              label="Concentration"
              value={`${(portfolio.concentrationIndex * 100).toFixed(0)}%`}
              tooltip="Herfindahl index (sum of squared weights). 100% = single stock, lower = more diversified."
              color={
                portfolio.concentrationIndex > 0.5
                  ? "text-amber-500"
                  : undefined
              }
            />
            <MetricCell
              label="Diversification"
              value={`${(portfolio.diversificationRatio * 100).toFixed(0)}%`}
              tooltip="Diversification ratio (1 - Herfindahl). Higher = more diversified."
              color={
                portfolio.diversificationRatio > 0.5
                  ? "text-emerald-500"
                  : undefined
              }
            />
          </div>

          {/* Sector weights */}
          {Object.keys(portfolio.sectorWeights).length > 0 && (
            <div className="mt-3 rounded-lg border border-border/20 bg-card p-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Sector Allocation
              </div>
              <div className="space-y-1.5">
                {Object.entries(portfolio.sectorWeights)
                  .sort(([, a], [, b]) => b - a)
                  .map(([sector, weight]) => (
                    <div key={sector} className="flex items-center gap-2">
                      <span className="w-24 text-xs text-muted-foreground truncate">
                        {sector}
                      </span>
                      <div className="relative h-3 flex-1 rounded bg-muted/50 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded bg-primary/50"
                          style={{ width: `${Math.min(weight, 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-mono tabular-nums text-muted-foreground">
                        {weight.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Risk contributions */}
          {portfolio.riskContributions.length > 0 && (
            <div className="mt-3 rounded-lg border border-border/20 bg-card p-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Risk Contribution
              </div>
              <div className="space-y-1.5">
                {portfolio.riskContributions
                  .sort((a, b) => b.riskContrib - a.riskContrib)
                  .map((rc) => (
                    <div key={rc.ticker} className="flex items-center gap-2">
                      <span className="w-16 text-xs font-medium">
                        {rc.ticker}
                      </span>
                      <div className="relative h-3 flex-1 rounded bg-muted/50 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded bg-amber-500/50"
                          style={{
                            width: `${Math.min(rc.riskContrib, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-mono tabular-nums text-muted-foreground">
                        {rc.riskContrib.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Drawdown Chart ────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Drawdown
        </h3>
        <div className="rounded-lg border border-border/20 bg-card p-3">
          <DrawdownChart data={drawdownData} />
        </div>
      </div>
    </div>
  );
}
