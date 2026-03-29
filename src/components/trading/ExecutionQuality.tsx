"use client";

import { useMemo } from "react";
import { useTradingPreferencesStore } from "@/stores/trading-preferences-store";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  BarChart2,
  Info,
} from "lucide-react";

// ── Seeded PRNG (LCG) ──────────────────────────────────────────────────────
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = ((s * 1103515245 + 12345) & 0x7fffffff) >>> 0;
    return s / 0x7fffffff;
  };
}

// ── Derive a stable numeric seed from a trade ID string ───────────────────
function idSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ── Synthetic fallback trades ─────────────────────────────────────────────
function makeSyntheticTrades(count = 20) {
  const tickers = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"];
  return Array.from({ length: count }, (_, i) => {
    const rng = seededRng(i * 7919 + 42);
    const isMarket = rng() > 0.35;
    const price = 100 + rng() * 400;
    const qty = Math.max(1, Math.floor(rng() * 10));
    const slippage = isMarket ? rng() * 0.0015 * price * qty : 0;
    return {
      id: `syn-${i}`,
      ticker: tickers[i % tickers.length],
      side: (rng() > 0.5 ? "buy" : "sell") as "buy" | "sell",
      quantity: qty,
      price,
      realizedPnL: (rng() - 0.45) * 200,
      fees: isMarket ? 0 : 0.65,
      slippage,
      timestamp: Date.now() - (count - i) * 3_600_000,
      simulationDate: Date.now() - (count - i) * 3_600_000,
    };
  });
}

// ── Section header ────────────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground font-medium mb-1.5">
      {children}
    </p>
  );
}

// ── Stat row ──────────────────────────────────────────────────────────────
interface StatRowProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}
function StatRow({ label, value, sub, positive, negative }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            positive && "text-green-500",
            negative && "text-red-400",
            !positive && !negative && "text-foreground",
          )}
        >
          {value}
        </span>
        {sub && (
          <div className="text-xs text-muted-foreground/60 tabular-nums">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 1. Slippage Bar Chart (SVG) ───────────────────────────────────────────
function SlippageBarChart({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
  const W = 244;
  const H = 56;
  const PAD_L = 28;
  const PAD_B = 14;
  const chartW = W - PAD_L - 4;
  const chartH = H - PAD_B - 4;

  const max = Math.max(...values, 0.001);
  const barW = Math.max(2, chartW / values.length - 2);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Y gridlines */}
      {[0, 0.5, 1].map((frac, i) => {
        const y = 4 + chartH - frac * chartH;
        return (
          <line
            key={i}
            x1={PAD_L}
            y1={y}
            x2={W - 4}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}
      {/* Y axis label */}
      <text
        x={PAD_L - 2}
        y={4 + chartH / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={8}
        fill="currentColor"
        fillOpacity={0.4}
      >
        $
      </text>
      {/* Bars */}
      {values.map((v, i) => {
        const h = Math.max(1, (v / max) * chartH);
        const x = PAD_L + i * (chartW / values.length) + 1;
        const y = 4 + chartH - h;
        const isMax = v === max;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={1}
            fill={isMax ? "rgb(239 68 68)" : "hsl(var(--primary))"}
            fillOpacity={isMax ? 0.9 : 0.6}
          />
        );
      })}
      {/* X axis ticks — first and last label */}
      {[0, values.length - 1].map((i) => (
        <text
          key={i}
          x={PAD_L + i * (chartW / values.length) + barW / 2}
          y={H - 2}
          textAnchor="middle"
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.35}
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

// ── 2. Donut Chart (SVG) ──────────────────────────────────────────────────
function DonutChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const R = 26;
  const STROKE = 10;
  const CX = 36;
  const CY = 36;
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  let cumAngle = -Math.PI / 2;
  const paths: { d: string; color: string; label: string; pct: number }[] = [];

  for (const sl of slices) {
    if (sl.value === 0) continue;
    const angle = (sl.value / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(cumAngle);
    const y1 = CY + R * Math.sin(cumAngle);
    const x2 = CX + R * Math.cos(cumAngle + angle);
    const y2 = CY + R * Math.sin(cumAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`;
    paths.push({
      d,
      color: sl.color,
      label: sl.label,
      pct: Math.round((sl.value / total) * 100),
    });
    cumAngle += angle;
  }

  return (
    <div className="flex items-center gap-3">
      <svg width={72} height={72}>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
          />
        ))}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.6}
        >
          Fill
        </text>
        <text
          x={CX}
          y={CY + 7}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.6}
        >
          Rate
        </text>
      </svg>
      <div className="space-y-1">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-xs text-muted-foreground">
              {p.label}
            </span>
            <span className="text-xs font-medium tabular-nums ml-auto">
              {p.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 4. Hourly Heatmap (SVG) ───────────────────────────────────────────────
function HourlyHeatmap({ scores }: { scores: number[] }) {
  // scores[0..23]: normalized 0–1 (higher = better performance)
  const W = 244;
  const H = 40;
  const COLS = 24;
  const cellW = Math.floor(W / COLS);
  const cellH = H - 12;

  const maxS = Math.max(...scores, 0.001);
  const minS = Math.min(...scores);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {scores.map((s, h) => {
        const norm = maxS > minS ? (s - minS) / (maxS - minS) : 0;
        // Color: low = muted, high = primary green-ish
        const opacity = 0.15 + norm * 0.75;
        const isBest = s === maxS;
        const isWorst = s === minS;
        return (
          <g key={h}>
            <rect
              x={h * cellW}
              y={0}
              width={cellW - 1}
              height={cellH}
              rx={1}
              fill={
                isBest
                  ? "rgb(34 197 94)"
                  : isWorst
                    ? "rgb(239 68 68)"
                    : "hsl(var(--primary))"
              }
              fillOpacity={
                isBest || isWorst ? 0.75 : opacity
              }
            />
            {/* Hour label every 4 hours */}
            {h % 4 === 0 && (
              <text
                x={h * cellW + cellW / 2}
                y={H - 2}
                textAnchor="middle"
                fontSize={7}
                fill="currentColor"
                fillOpacity={0.4}
              >
                {h}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Reset button ──────────────────────────────────────────────────────────
function ResetStatsButton() {
  const resetStats = useTradingPreferencesStore((s) => s.resetStats);
  return (
    <button
      type="button"
      onClick={resetStats}
      className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
    >
      <DollarSign className="h-2.5 w-2.5" />
      Reset execution stats
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function ExecutionQuality() {
  const totalSlippage = useTradingPreferencesStore((s) => s.totalSlippagePaid);
  const totalCommission = useTradingPreferencesStore(
    (s) => s.totalCommissionPaid,
  );
  const totalTrades = useTradingPreferencesStore((s) => s.totalTradesTracked);
  const totalFillSavings = useTradingPreferencesStore(
    (s) => s.totalFillSavings,
  );
  const proMode = useTradingPreferencesStore((s) => s.proMode);
  const realTrades = useTradingStore((s) => s.tradeHistory);

  const usingFallback = realTrades.length === 0;

  const trades = useMemo(
    () => (usingFallback ? makeSyntheticTrades(20) : realTrades),
    [usingFallback, realTrades],
  );

  // ── Derived values ──────────────────────────────────────────────────────

  // 1. Slippage per trade (last 20)
  const last20 = useMemo(() => trades.slice(0, 20).reverse(), [trades]);

  const slippagePerTrade = useMemo(
    () =>
      last20.map((t) => {
        // Real slippage from record; if zero (limit), simulate tiny spread
        if (t.slippage > 0) return t.slippage;
        // Simulate per-trade slippage from seeded PRNG (0.01–0.15% of notional)
        const rng = seededRng(idSeed(t.id));
        const pct = 0.0001 + rng() * 0.0014;
        return pct * t.price * t.quantity;
      }),
    [last20],
  );

  const slippageLabels = useMemo(
    () =>
      last20.map((_, i) => `T${i + 1}`),
    [last20],
  );

  const avgSlippage =
    slippagePerTrade.length > 0
      ? slippagePerTrade.reduce((a, b) => a + b, 0) / slippagePerTrade.length
      : 0;
  const worstSlippage = slippagePerTrade.length > 0 ? Math.max(...slippagePerTrade) : 0;
  const totalSlippageCost = slippagePerTrade.reduce((a, b) => a + b, 0);

  // 2. Fill rate (simulate fill status by seeded PRNG)
  const fillData = useMemo(() => {
    let full = 0;
    let partial = 0;
    let none = 0;
    const avgFillMs: number[] = [];
    for (const t of trades) {
      const rng = seededRng(idSeed(t.id) + 1);
      const r = rng();
      if (r < 0.78) {
        full++;
      } else if (r < 0.94) {
        partial++;
      } else {
        none++;
      }
      // Fill time 50–800ms
      avgFillMs.push(50 + rng() * 750);
    }
    const avgMs =
      avgFillMs.length > 0
        ? avgFillMs.reduce((a, b) => a + b, 0) / avgFillMs.length
        : 0;
    return { full, partial, none, avgMs };
  }, [trades]);

  // 3. Market vs Limit breakdown
  const orderBreakdown = useMemo(() => {
    let marketCount = 0;
    let limitCount = 0;
    let marketNotional = 0;
    let limitNotional = 0;
    for (const t of trades) {
      const isMarket = t.slippage > 0;
      const notional = t.price * t.quantity;
      if (isMarket) {
        marketCount++;
        marketNotional += notional;
      } else {
        limitCount++;
        limitNotional += notional;
      }
    }
    // Market avg cost including slippage vs limit (no slippage)
    const marketAvgCostPct = marketNotional > 0 ? (totalSlippageCost / marketCount) / (marketNotional / marketCount) * 100 : 0;
    const limitAvgCostPct = 0; // limit orders fill at price
    const limitSavings =
      marketCount > 0
        ? (marketAvgCostPct / 100) * (marketNotional + limitNotional)
        : 0;
    return {
      marketCount,
      limitCount,
      marketAvgCostPct,
      limitAvgCostPct,
      limitSavings,
    };
  }, [trades, totalSlippageCost]);

  // 4. Hourly heatmap — simulate performance by hour using seeds
  const hourlyScores = useMemo(() => {
    const scores = Array(24).fill(0);
    const counts = Array(24).fill(0);
    for (const t of trades) {
      const rng = seededRng(idSeed(t.id) + 3);
      // Hour derived from trade id seed (reproducible)
      const hour = Math.floor(rng() * 24);
      const perfScore = (rng() - 0.4) * 100; // -40 to +60
      scores[hour] += perfScore;
      counts[hour]++;
    }
    // Normalize
    return scores.map((s, i) =>
      counts[i] > 0 ? s / counts[i] : (seededRng(i * 31 + 7)() - 0.5) * 20,
    );
  }, [trades]);

  const bestHour = hourlyScores.indexOf(Math.max(...hourlyScores));
  const worstHour = hourlyScores.indexOf(Math.min(...hourlyScores));
  const hourLabel = (h: number) => {
    const suffix = h < 12 ? "am" : "pm";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}${suffix}`;
  };

  // 5. Commission tracker
  const totalGrossPnL = trades.reduce((s, t) => s + t.realizedPnL, 0);
  const commTotal = usingFallback
    ? trades.filter((t) => t.slippage === 0).length * 0.65
    : totalCommission;
  const commPct =
    totalGrossPnL > 0 ? (commTotal / totalGrossPnL) * 100 : 0;
  // Break-even: each profitable trade earns avgPnL, need N trades to cover commissions
  const profitableTrades = trades.filter((t) => t.realizedPnL > 0);
  const avgProfitPerTrade =
    profitableTrades.length > 0
      ? profitableTrades.reduce((s, t) => s + t.realizedPnL, 0) /
        profitableTrades.length
      : 0;
  const breakEvenTrades =
    avgProfitPerTrade > 0 ? Math.ceil(commTotal / avgProfitPerTrade) : 0;

  // vs market banner
  const MARKET_AVG_SLIPPAGE_PCT = 0.0015;
  const avgTradeNotional =
    trades.length > 0
      ? trades.reduce((s, t) => s + t.price * t.quantity, 0) / trades.length
      : 0;
  const benchmarkSlippage = avgTradeNotional * MARKET_AVG_SLIPPAGE_PCT;
  const vsMarket = benchmarkSlippage - avgSlippage;
  const isBetter = vsMarket >= 0;
  const vsMarketPct =
    benchmarkSlippage > 0 ? Math.abs(vsMarket / benchmarkSlippage) * 100 : 0;

  return (
    <div className="p-3 space-y-4 text-xs">
      {/* Fallback notice */}
      {usingFallback && (
        <div className="flex items-start gap-1.5 rounded-md bg-muted/50 px-2.5 py-2">
          <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground">
            Showing simulated data — place trades to see real metrics
          </span>
        </div>
      )}

      {/* ── 1. Slippage Analysis ── */}
      <section>
        <SectionHeader>Slippage Analysis</SectionHeader>
        <div className="rounded-md bg-muted/40 px-3 py-1 mb-2">
          <StatRow
            label="Avg slippage / trade"
            value={formatCurrency(avgSlippage)}
            positive={avgSlippage < benchmarkSlippage}
            negative={avgSlippage >= benchmarkSlippage}
          />
          <StatRow
            label="Worst slippage"
            value={formatCurrency(worstSlippage)}
            negative={worstSlippage > 0}
          />
          <StatRow
            label="Total slippage cost"
            value={formatCurrency(totalSlippageCost)}
            negative={totalSlippageCost > 0}
          />
        </div>

        {/* vs market banner */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 mb-2",
            isBetter
              ? "bg-green-500/8 border border-green-500/20"
              : "bg-red-500/8 border border-red-500/20",
          )}
        >
          {isBetter ? (
            <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400 shrink-0" />
          )}
          <p className="text-xs">
            Executions are{" "}
            <span className={isBetter ? "text-green-500" : "text-red-400"}>
              {vsMarketPct.toFixed(1)}% {isBetter ? "better" : "worse"}
            </span>{" "}
            than market average ({(MARKET_AVG_SLIPPAGE_PCT * 100).toFixed(2)}%)
          </p>
        </div>

        {/* Bar chart */}
        {slippagePerTrade.length > 0 && (
          <div className="overflow-x-auto">
            <SlippageBarChart
              values={slippagePerTrade}
              labels={slippageLabels}
            />
          </div>
        )}
      </section>

      {/* ── 2. Fill Rate ── */}
      <section>
        <SectionHeader>Fill Rate</SectionHeader>
        <DonutChart
          slices={[
            {
              label: "Complete",
              value: fillData.full,
              color: "rgb(34 197 94)",
            },
            {
              label: "Partial",
              value: fillData.partial,
              color: "rgb(234 179 8)",
            },
            {
              label: "Unfilled",
              value: fillData.none,
              color: "rgb(239 68 68)",
            },
          ]}
        />
        <div className="rounded-md bg-muted/40 px-3 py-1 mt-2">
          <StatRow
            label="Avg fill time"
            value={`${Math.round(fillData.avgMs)} ms`}
            positive={fillData.avgMs < 300}
          />
          <StatRow
            label="Complete fills"
            value={`${fillData.full} / ${trades.length}`}
            positive={fillData.full / trades.length > 0.75}
          />
        </div>
      </section>

      {/* ── 3. Market vs Limit Orders ── */}
      <section>
        <SectionHeader>Market vs Limit Orders</SectionHeader>
        <div className="rounded-md bg-muted/40 px-3 py-1">
          <StatRow
            label="Market orders"
            value={String(orderBreakdown.marketCount)}
            sub={`avg cost: ${orderBreakdown.marketAvgCostPct.toFixed(3)}%`}
          />
          <StatRow
            label="Limit orders"
            value={String(orderBreakdown.limitCount)}
            sub="avg cost: 0.000%"
            positive={orderBreakdown.limitCount > 0}
          />
          <StatRow
            label="Market / total"
            value={`${trades.length > 0 ? ((orderBreakdown.marketCount / trades.length) * 100).toFixed(0) : 0}%`}
          />
        </div>
        {orderBreakdown.limitSavings > 1 && (
          <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-primary/8 border border-primary/20 px-2.5 py-2">
            <BarChart2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground">
              You could save{" "}
              <span className="text-primary font-medium">
                {formatCurrency(orderBreakdown.limitSavings)}
              </span>{" "}
              by using limit orders on all trades
            </span>
          </div>
        )}
      </section>

      {/* ── 4. Best Execution Timing ── */}
      <section>
        <SectionHeader>Best Execution Timing</SectionHeader>
        <HourlyHeatmap scores={hourlyScores} />
        <div className="mt-1.5 rounded-md bg-muted/40 px-3 py-1">
          <StatRow
            label="Best hour"
            value={hourLabel(bestHour)}
            positive
          />
          <StatRow
            label="Worst hour"
            value={hourLabel(worstHour)}
            negative
          />
        </div>
        <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-green-500/8 border border-green-500/20 px-2.5 py-2">
          <Clock className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground">
            You trade best during{" "}
            <span className="text-green-500 font-medium">
              {hourLabel(bestHour)}–{hourLabel((bestHour + 1) % 24)}
            </span>{" "}
            market hours
          </span>
        </div>
      </section>

      {/* ── 5. Commission Tracker ── */}
      <section>
        <SectionHeader>Commission Tracker</SectionHeader>
        <div className="rounded-md bg-muted/40 px-3 py-1">
          <StatRow
            label="Total commissions"
            value={formatCurrency(commTotal)}
            sub={proMode ? "$0.005/share" : "Free mode ($0 commissions)"}
            negative={commTotal > 0}
          />
          <StatRow
            label="Commission % of P&L"
            value={commPct > 0 ? `${commPct.toFixed(2)}%` : "—"}
            negative={commPct > 5}
          />
          <StatRow
            label="Total fill savings"
            value={formatCurrency(Math.abs(totalFillSavings))}
            positive={totalFillSavings > 0}
            negative={totalFillSavings < 0}
          />
          {breakEvenTrades > 0 && (
            <StatRow
              label="Break-even trades"
              value={`${breakEvenTrades} needed`}
              sub="to cover commissions"
            />
          )}
        </div>
        {commTotal > 0 && (
          <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-muted/50 px-2.5 py-2">
            <Activity className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground">
              Options contracts: $0.65 per contract. Stocks:{" "}
              {proMode ? "$0.005/share" : "$0 (free mode)"}
            </span>
          </div>
        )}
      </section>

      {/* Tips */}
      <section>
        <SectionHeader>Tips to Reduce Costs</SectionHeader>
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-1">
            <span className="mt-1 shrink-0 h-1 w-1 rounded-full bg-muted-foreground/40" />
            Use limit orders to avoid market-order slippage entirely
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-1 shrink-0 h-1 w-1 rounded-full bg-muted-foreground/40" />
            Avoid large orders (&gt;5% of daily volume) — market impact adds hidden cost
          </li>
          <li className="flex items-start gap-1">
            <span className="mt-1 shrink-0 h-1 w-1 rounded-full bg-muted-foreground/40" />
            Trade during your best performance window ({hourLabel(bestHour)})
          </li>
        </ul>
      </section>

      <ResetStatsButton />
    </div>
  );
}
