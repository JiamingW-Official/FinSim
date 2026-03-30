"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, TrendingDown, Info } from "lucide-react";

// ── Beta estimates per ticker ─────────────────────────────────────────────────

const TICKER_BETA: Record<string, number> = {
  SPY: 1.0,
  QQQ: 1.2,
  AAPL: 1.1,
  MSFT: 0.9,
  GOOGL: 1.05,
  AMZN: 1.15,
  NVDA: 1.6,
  TSLA: 1.8,
  META: 1.25,
  GLD: -0.1,
};

function getTickerBeta(ticker: string): number {
  return TICKER_BETA[ticker] ?? 1.0;
}

// ── Number formatters ─────────────────────────────────────────────────────────

function fmtDollar(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

function fmtPct(n: number, decimals = 2): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueClass,
  sub,
}: {
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">
        <span className={cn("text-xs font-semibold tabular-nums", valueClass)}>
          {value}
        </span>
        {sub && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Concentration SVG donut ───────────────────────────────────────────────────

interface Slice {
  ticker: string;
  pct: number;
  color: string;
}

const SLICE_COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
  "#34d399",
  "#fb923c",
];

function ConcentrationDonut({ slices }: { slices: Slice[] }) {
  const cx = 54;
  const cy = 54;
  const r = 40;
  const gap = 0.015; // radians gap between slices

  let cumAngle = -Math.PI / 2;
  const paths: { d: string; color: string; ticker: string; pct: number }[] = [];

  for (const slice of slices) {
    const angleSpan = slice.pct * 2 * Math.PI - gap;
    const startAngle = cumAngle + gap / 2;
    const endAngle = startAngle + angleSpan;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angleSpan > Math.PI ? 1 : 0;

    paths.push({
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: slice.color,
      ticker: slice.ticker,
      pct: slice.pct,
    });

    cumAngle += slice.pct * 2 * Math.PI;
  }

  return (
    <div className="flex items-center gap-4">
      <svg width={108} height={108} aria-label="Concentration donut chart">
        {/* Inner circle cutout using a white/bg overlay */}
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.85} />
        ))}
        <circle cx={cx} cy={cy} r={22} fill="hsl(var(--card))" />
      </svg>
      <div className="flex flex-col gap-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {s.ticker}{" "}
              <span className="font-semibold text-foreground">
                {(s.pct * 100).toFixed(1)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RiskDashboard() {
  const { tradeHistory, positions, portfolioValue, pendingOrders, cash } =
    useTradingStore((s) => ({
      tradeHistory: s.tradeHistory,
      positions: s.positions,
      portfolioValue: s.portfolioValue,
      pendingOrders: s.pendingOrders,
      cash: s.cash,
    }));

  // ── 1. Portfolio VaR ────────────────────────────────────────────────────────

  const varMetrics = useMemo(() => {
    // Only closed trades with realised P&L on the sell side
    const closed = tradeHistory.filter(
      (t) => t.side === "sell" && typeof t.realizedPnL === "number",
    );
    if (closed.length < 10) return null;

    const last30 = closed.slice(0, 30);
    // Returns as fraction of portfolioValue at trade time (approx: pnl / portfolioValue)
    const returns = last30.map((t) => t.realizedPnL / INITIAL_CAPITAL);
    const sorted = [...returns].sort((a, b) => a - b);
    // 5th percentile index for up to 30 samples
    const idx = Math.max(0, Math.floor(sorted.length * 0.05) - 1);
    const varReturn = sorted[idx];
    const varDollar = varReturn * portfolioValue;
    const varPct = varReturn * 100;

    return { varDollar, varPct };
  }, [tradeHistory, portfolioValue]);

  // ── 2. Maximum Drawdown ─────────────────────────────────────────────────────

  const drawdownMetrics = useMemo(() => {
    // Build equity series from trade history (oldest first)
    // Reconstruct running portfolio value using cumulative realized P&L
    const sellTrades = [...tradeHistory]
      .filter((t) => t.side === "sell")
      .reverse(); // oldest first

    if (sellTrades.length === 0) {
      return {
        peakValue: INITIAL_CAPITAL,
        currentDrawdownPct: 0,
        maxDrawdownPct: 0,
        recovering: false,
      };
    }

    let runningValue = INITIAL_CAPITAL;
    let peak = INITIAL_CAPITAL;
    let maxDd = 0;

    for (const t of sellTrades) {
      runningValue += t.realizedPnL;
      if (runningValue > peak) peak = runningValue;
      const dd = (peak - runningValue) / peak;
      if (dd > maxDd) maxDd = dd;
    }

    const currentPeak = Math.max(peak, portfolioValue);
    const currentDd =
      currentPeak > 0 ? (currentPeak - portfolioValue) / currentPeak : 0;
    const recovering = currentDd < maxDd && currentDd < 0.02;

    return {
      peakValue: currentPeak,
      currentDrawdownPct: currentDd * 100,
      maxDrawdownPct: maxDd * 100,
      recovering,
    };
  }, [tradeHistory, portfolioValue]);

  // ── 3. Kelly Fraction ───────────────────────────────────────────────────────

  const kellyMetrics = useMemo(() => {
    const closed = tradeHistory.filter(
      (t) => t.side === "sell" && typeof t.realizedPnL === "number",
    );
    if (closed.length < 5) return null;

    const wins = closed.filter((t) => t.realizedPnL > 0);
    const losses = closed.filter((t) => t.realizedPnL < 0);
    const winRate = wins.length / closed.length;
    const avgWin =
      wins.length > 0
        ? wins.reduce((s, t) => s + t.realizedPnL, 0) / wins.length
        : 0;
    const avgLoss =
      losses.length > 0
        ? Math.abs(losses.reduce((s, t) => s + t.realizedPnL, 0) / losses.length)
        : 1;

    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    // Kelly % = W - (1-W)/R  where R = avgWin/avgLoss
    const kelly =
      winLossRatio > 0 ? winRate - (1 - winRate) / winLossRatio : 0;
    const kellyPct = Math.max(0, kelly * 100);
    const halfKellyPct = kellyPct / 2;

    return { kellyPct, halfKellyPct, winRate, winLossRatio };
  }, [tradeHistory]);

  // ── 4. Concentration Risk ───────────────────────────────────────────────────

  const concentrationMetrics = useMemo(() => {
    if (positions.length === 0) return null;

    const totalPositionValue = positions.reduce(
      (sum, p) => sum + p.quantity * p.currentPrice,
      0,
    );

    if (totalPositionValue <= 0) return null;

    const slices: Slice[] = positions.map((p, i) => {
      const posValue = p.quantity * p.currentPrice;
      return {
        ticker: p.ticker,
        pct: posValue / portfolioValue,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
      };
    });

    // Cash slice
    const cashPct = cash / portfolioValue;
    if (cashPct > 0.01) {
      slices.push({
        ticker: "CASH",
        pct: cashPct,
        color: "#64748b",
      });
    }

    const largest = slices.reduce((max, s) => (s.pct > max.pct ? s : max), slices[0]);

    return { slices, largest };
  }, [positions, portfolioValue, cash]);

  // ── 5. Portfolio Beta ───────────────────────────────────────────────────────

  const betaMetrics = useMemo(() => {
    if (positions.length === 0) return null;

    const totalPositionValue = positions.reduce(
      (sum, p) => sum + p.quantity * p.currentPrice,
      0,
    );
    if (totalPositionValue <= 0) return null;

    let weightedBeta = 0;
    for (const pos of positions) {
      const posValue = pos.quantity * pos.currentPrice;
      const weight = posValue / portfolioValue;
      const beta = getTickerBeta(pos.ticker);
      weightedBeta += weight * beta;
    }

    return { beta: weightedBeta };
  }, [positions, portfolioValue]);

  // ── 6. P&L at Risk (stop losses) ───────────────────────────────────────────

  const palAtRisk = useMemo(() => {
    if (positions.length === 0) return null;

    const stopOrders = pendingOrders.filter((o) => o.type === "stop_loss");

    let totalStopLoss = 0;
    let positionsWithStop = 0;

    for (const pos of positions) {
      const stop = stopOrders.find((o) => o.ticker === pos.ticker);
      if (stop && stop.stopPrice != null) {
        const stopPrice = stop.stopPrice;
        const currentValue = pos.quantity * pos.currentPrice;
        const stopValue = pos.quantity * stopPrice;
        totalStopLoss += stopValue - currentValue; // negative = loss
        positionsWithStop++;
      }
    }

    const noStopsCount = positions.length - positionsWithStop;

    return { totalStopLoss, positionsWithStop, noStopsCount };
  }, [positions, pendingOrders]);

  // ── Kelly color ─────────────────────────────────────────────────────────────

  function kellyColor(pct: number): string {
    if (pct < 20) return "text-green-400";
    if (pct < 40) return "text-amber-400";
    return "text-red-400";
  }

  const hasData =
    tradeHistory.length > 0 ||
    positions.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
        <ShieldCheck className="h-8 w-8 mb-1 text-border" />
        <p className="text-sm font-medium">No trading data yet</p>
        <p className="text-xs max-w-sm">
          Make some trades on the Trade page and your risk metrics will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* 1 – Portfolio VaR */}
      <Section title="Value at Risk (95% VaR)" icon={TrendingDown}>
        {varMetrics === null ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground py-1">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Insufficient data — requires at least 10 closed trades.
          </div>
        ) : (
          <>
            <MetricRow
              label="1-Day 95% VaR"
              value={`${fmtDollar(varMetrics.varDollar)} (${fmtPct(varMetrics.varPct)})`}
              valueClass={
                varMetrics.varDollar < 0 ? "text-red-400" : "text-green-400"
              }
              sub="Historical simulation, last 30 closed trades"
            />
            <p className="text-[11px] text-muted-foreground leading-snug">
              There is a 5% chance of losing more than{" "}
              <span className="text-red-400 font-semibold">
                {fmtDollar(Math.abs(varMetrics.varDollar))}
              </span>{" "}
              in a single day based on your trading history.
            </p>
          </>
        )}
      </Section>

      {/* 2 – Maximum Drawdown */}
      <Section title="Maximum Drawdown" icon={TrendingDown}>
        <MetricRow
          label="Current drawdown"
          value={`-${drawdownMetrics.currentDrawdownPct.toFixed(2)}%`}
          valueClass={
            drawdownMetrics.currentDrawdownPct > 5
              ? "text-red-400"
              : drawdownMetrics.currentDrawdownPct > 2
              ? "text-amber-400"
              : "text-muted-foreground"
          }
        />
        <MetricRow
          label="Max historical drawdown"
          value={`-${drawdownMetrics.maxDrawdownPct.toFixed(2)}%`}
          valueClass="text-red-400"
        />
        <MetricRow
          label="Portfolio peak"
          value={fmtDollar(drawdownMetrics.peakValue)}
          valueClass="text-foreground"
        />
        {drawdownMetrics.recovering && (
          <div className="flex items-center gap-1.5 text-[11px] text-green-400 mt-1">
            <ShieldCheck className="h-3 w-3 shrink-0" />
            Currently recovering from drawdown
          </div>
        )}

        {/* Drawdown bar */}
        <div className="mt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>0%</span>
            <span>Current</span>
            <span>Max</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/30 relative overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500/50"
              style={{
                width: `${Math.min(drawdownMetrics.maxDrawdownPct, 100)}%`,
              }}
            />
            {drawdownMetrics.maxDrawdownPct > 0 && (
              <div
                className="absolute top-0 h-full w-0.5 bg-red-400"
                style={{
                  left: `${Math.min(
                    (drawdownMetrics.currentDrawdownPct /
                      Math.max(drawdownMetrics.maxDrawdownPct, 1)) *
                      Math.min(drawdownMetrics.maxDrawdownPct, 100),
                    100,
                  )}%`,
                }}
              />
            )}
          </div>
        </div>
      </Section>

      {/* 3 – Kelly Fraction */}
      <Section title="Kelly Criterion" icon={ShieldCheck}>
        {kellyMetrics === null ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground py-1">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Requires at least 5 closed trades to calculate.
          </div>
        ) : (
          <>
            <MetricRow
              label="Kelly fraction"
              value={`${kellyMetrics.kellyPct.toFixed(1)}% per trade`}
              valueClass={kellyColor(kellyMetrics.kellyPct)}
            />
            <MetricRow
              label="Half-Kelly (conservative)"
              value={`${kellyMetrics.halfKellyPct.toFixed(1)}% per trade`}
              valueClass="text-green-400"
            />
            <MetricRow
              label="Win rate"
              value={`${(kellyMetrics.winRate * 100).toFixed(1)}%`}
              valueClass={kellyMetrics.winRate >= 0.5 ? "text-green-400" : "text-amber-400"}
            />
            <MetricRow
              label="Avg win / avg loss"
              value={kellyMetrics.winLossRatio.toFixed(2)}
              valueClass={kellyMetrics.winLossRatio >= 1 ? "text-green-400" : "text-red-400"}
            />
            <p className="text-[11px] text-muted-foreground leading-snug mt-1">
              Kelly suggests sizing each trade at{" "}
              <span className={cn("font-semibold", kellyColor(kellyMetrics.kellyPct))}>
                {kellyMetrics.kellyPct.toFixed(1)}%
              </span>{" "}
              of capital. Use half-Kelly{" "}
              <span className="font-semibold text-green-400">
                ({kellyMetrics.halfKellyPct.toFixed(1)}%)
              </span>{" "}
              to reduce variance.
            </p>
          </>
        )}
      </Section>

      {/* 4 – Concentration Risk */}
      <Section title="Concentration Risk" icon={Info}>
        {concentrationMetrics === null ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground py-1">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            No open positions — portfolio is fully in cash.
          </div>
        ) : (
          <>
            <ConcentrationDonut slices={concentrationMetrics.slices} />
            <MetricRow
              label="Largest position"
              value={`${concentrationMetrics.largest.ticker} — ${(concentrationMetrics.largest.pct * 100).toFixed(1)}%`}
              valueClass={
                concentrationMetrics.largest.pct > 0.3
                  ? "text-red-400"
                  : concentrationMetrics.largest.pct > 0.2
                  ? "text-amber-400"
                  : "text-green-400"
              }
            />
            {concentrationMetrics.largest.pct > 0.3 && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-400">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Concentration warning: largest position exceeds 30% of portfolio.
              </div>
            )}
          </>
        )}
      </Section>

      {/* 5 – Portfolio Beta */}
      <Section title="Correlation to Market (Beta)" icon={TrendingDown}>
        {betaMetrics === null ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground py-1">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            No open positions to compute beta.
          </div>
        ) : (
          <>
            <MetricRow
              label="Portfolio Beta"
              value={betaMetrics.beta.toFixed(2)}
              valueClass={
                betaMetrics.beta > 1.5
                  ? "text-red-400"
                  : betaMetrics.beta > 1.0
                  ? "text-amber-400"
                  : betaMetrics.beta < 0
                  ? "text-blue-400"
                  : "text-green-400"
              }
            />
            <p className="text-[11px] text-muted-foreground leading-snug">
              {betaMetrics.beta > 1.5
                ? "High-beta portfolio — amplified moves vs. the market."
                : betaMetrics.beta > 1.0
                ? "Slightly more volatile than the broad market."
                : betaMetrics.beta < 0
                ? "Negative beta — inverse or hedge-oriented exposure."
                : "Low-beta portfolio — relatively defensive."}
            </p>

            {/* Beta scale bar */}
            <div className="mt-1 relative">
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-500/40 via-green-500/40 to-red-500/40" />
              {/* Marker */}
              <div
                className="absolute -top-0.5 h-3 w-0.5 rounded-full bg-foreground"
                style={{
                  left: `${Math.min(Math.max((betaMetrics.beta / 2.5) * 100, 0), 100)}%`,
                }}
              />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                <span>-0.5</span>
                <span className="text-center">1.0 (market)</span>
                <span>2.5+</span>
              </div>
            </div>

            {/* Per-ticker breakdown */}
            <div className="mt-1 space-y-1">
              {positions.map((pos) => (
                <div
                  key={`${pos.ticker}-${pos.side}`}
                  className="flex justify-between text-[10px]"
                >
                  <span className="text-muted-foreground">
                    {pos.ticker} ({pos.side})
                  </span>
                  <span className="font-semibold tabular-nums">
                    β {getTickerBeta(pos.ticker).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* 6 – P&L at Risk */}
      <Section title="P&L at Risk (Stop Losses)" icon={AlertTriangle}>
        {palAtRisk === null ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground py-1">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            No open positions.
          </div>
        ) : (
          <>
            {palAtRisk.noStopsCount > 0 && (
              <div className="flex items-start gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-2 py-2 text-[11px] text-red-400 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  WARNING: {palAtRisk.noStopsCount} position
                  {palAtRisk.noStopsCount > 1 ? "s" : ""} with no stop loss
                  defined.
                </span>
              </div>
            )}
            <MetricRow
              label="Positions with stops"
              value={`${palAtRisk.positionsWithStop} / ${positions.length}`}
              valueClass={
                palAtRisk.positionsWithStop === positions.length
                  ? "text-green-400"
                  : "text-amber-400"
              }
            />
            {palAtRisk.positionsWithStop > 0 && (
              <MetricRow
                label="Max loss if all stops hit"
                value={fmtDollar(palAtRisk.totalStopLoss)}
                valueClass={
                  palAtRisk.totalStopLoss < 0 ? "text-red-400" : "text-muted-foreground"
                }
                sub="Approximate — based on current price vs. stop price"
              />
            )}
            {palAtRisk.noStopsCount === 0 && positions.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-green-400 mt-1">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                All positions have stop loss orders.
              </div>
            )}

            {/* Individual position stop status */}
            <div className="mt-1 space-y-1">
              {positions.map((pos) => {
                const stop = pendingOrders.find(
                  (o) =>
                    o.type === "stop_loss" && o.ticker === pos.ticker,
                );
                return (
                  <div
                    key={`${pos.ticker}-${pos.side}`}
                    className="flex justify-between text-[10px]"
                  >
                    <span className="text-muted-foreground">
                      {pos.ticker} ({pos.side})
                    </span>
                    {stop && stop.stopPrice != null ? (
                      <span className="text-green-400 font-semibold tabular-nums">
                        Stop @ {fmtDollar(stop.stopPrice)}
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold">
                        No stop
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
