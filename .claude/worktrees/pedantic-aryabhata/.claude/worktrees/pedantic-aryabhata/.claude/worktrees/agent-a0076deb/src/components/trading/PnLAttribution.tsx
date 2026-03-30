"use client";

import { useMemo } from "react";
import type { TradeRecord } from "@/types/trading";
import { formatCurrency } from "@/lib/utils";

interface Props {
  trades: TradeRecord[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ── donut chart ───────────────────────────────────────────────────────────────

interface DonutProps {
  winners: number;
  losers: number;
  total: number;
}

function WinnersLosersDonut({ winners, losers, total }: DonutProps) {
  const SIZE = 160;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 58;
  const INNER_R = 34;
  const GAP = 0.03; // radians gap between sectors

  if (total === 0) {
    return (
      <div className="flex h-[160px] w-[160px] items-center justify-center text-xs text-muted-foreground">
        No closed trades
      </div>
    );
  }

  // Angles
  const winFrac = winners / total;
  const loseFrac = losers / total;
  // Neutral (breakeven) fills the remainder
  const neutralFrac = Math.max(0, 1 - winFrac - loseFrac);

  const segments: Array<{ frac: number; color: string; label: string }> = [
    { frac: winFrac, color: "#22c55e", label: "Win" },
    { frac: loseFrac, color: "#ef4444", label: "Loss" },
    { frac: neutralFrac, color: "#6b7280", label: "Even" },
  ].filter((s) => s.frac > 0);

  function arc(startAngle: number, endAngle: number): string {
    const s = startAngle - Math.PI / 2;
    const e = endAngle - Math.PI / 2;
    const x1 = cx + R * Math.cos(s);
    const y1 = cy + R * Math.sin(s);
    const x2 = cx + R * Math.cos(e);
    const y2 = cy + R * Math.sin(e);
    const ix1 = cx + INNER_R * Math.cos(e);
    const iy1 = cy + INNER_R * Math.sin(e);
    const ix2 = cx + INNER_R * Math.cos(s);
    const iy2 = cy + INNER_R * Math.sin(s);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");
  }

  const paths: Array<{ d: string; color: string }> = [];
  let angle = 0;
  for (const seg of segments) {
    const span = seg.frac * Math.PI * 2 - GAP;
    if (span > 0) {
      paths.push({ d: arc(angle + GAP / 2, angle + span + GAP / 2), color: seg.color });
    }
    angle += seg.frac * Math.PI * 2;
  }

  const winRate = total > 0 ? Math.round((winners / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.9} />
        ))}
        {/* Center label */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          fontWeight="700"
          fill="currentColor"
        >
          {winRate}%
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fill="#9ca3af"
        >
          win rate
        </text>
      </svg>
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-500 inline-block" />
          <span className="text-muted-foreground">Winners</span>
          <span className="ml-auto font-mono font-medium tabular-nums">{winners}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500 inline-block" />
          <span className="text-muted-foreground">Losers</span>
          <span className="ml-auto font-mono font-medium tabular-nums">{losers}</span>
        </div>
        {losers + winners < total && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-gray-500 inline-block" />
            <span className="text-muted-foreground">Breakeven</span>
            <span className="ml-auto font-mono font-medium tabular-nums">
              {total - winners - losers}
            </span>
          </div>
        )}
        <div className="border-t border-border pt-1 flex items-center gap-1.5">
          <span className="text-muted-foreground">Total</span>
          <span className="ml-auto font-mono font-medium tabular-nums">{total}</span>
        </div>
      </div>
    </div>
  );
}

// ── P&L bar chart per ticker ─────────────────────────────────────────────────

interface TickerBar {
  ticker: string;
  pnl: number;
}

function TickerPnLBars({ data }: { data: TickerBar[] }) {
  if (data.length === 0) {
    return <p className="text-xs text-muted-foreground">No closed trades yet.</p>;
  }

  const sorted = [...data].sort((a, b) => b.pnl - a.pnl);
  const maxAbs = Math.max(...sorted.map((d) => Math.abs(d.pnl)), 1);
  const BAR_MAX_W = 140; // px

  return (
    <div className="space-y-1.5">
      {sorted.map((d) => {
        const w = Math.round((Math.abs(d.pnl) / maxAbs) * BAR_MAX_W);
        const isPos = d.pnl >= 0;
        return (
          <div key={d.ticker} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-right text-[11px] font-mono font-medium">
              {d.ticker}
            </span>
            <div
              className="h-4 rounded-sm transition-all duration-300"
              style={{
                width: `${w}px`,
                minWidth: "4px",
                background: isPos ? "#22c55e" : "#ef4444",
                opacity: 0.85,
              }}
            />
            <span
              className={`text-[11px] font-mono tabular-nums ${isPos ? "text-green-500" : "text-red-400"}`}
            >
              {isPos ? "+" : ""}
              {formatCurrency(d.pnl)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function PnLAttribution({ trades }: Props) {
  // Only closed (sell) trades have realizedPnL meaningful
  const closed = useMemo(
    () => trades.filter((t) => t.side === "sell" && t.realizedPnL !== 0),
    [trades],
  );

  const stats = useMemo(() => {
    if (closed.length === 0) {
      return {
        winners: 0,
        losers: 0,
        total: 0,
        byTicker: [] as TickerBar[],
        best: null as TradeRecord | null,
        worst: null as TradeRecord | null,
        avgHoldTime: null as string | null,
        streak: { type: "wins" as "wins" | "losses", count: 0 },
      };
    }

    const winners = closed.filter((t) => t.realizedPnL > 0).length;
    const losers = closed.filter((t) => t.realizedPnL < 0).length;

    // P&L by ticker
    const tickerMap: Record<string, number> = {};
    for (const t of closed) {
      tickerMap[t.ticker] = (tickerMap[t.ticker] ?? 0) + t.realizedPnL;
    }
    const byTicker: TickerBar[] = Object.entries(tickerMap).map(([ticker, pnl]) => ({
      ticker,
      pnl,
    }));

    // Best / worst
    const sortedByPnL = [...closed].sort((a, b) => b.realizedPnL - a.realizedPnL);
    const best = sortedByPnL[0] ?? null;
    const worst = sortedByPnL[sortedByPnL.length - 1] ?? null;

    // Average hold time: use timestamp difference between consecutive buy/sell pairs
    // Approximate: if timestamps are available, average gap between trades
    const gaps: number[] = [];
    const allTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 1; i < allTrades.length; i++) {
      const gap = allTrades[i].timestamp - allTrades[i - 1].timestamp;
      if (gap > 0 && gap < 30 * 24 * 60 * 60 * 1000) {
        gaps.push(gap);
      }
    }
    const avgHoldTime = gaps.length > 0
      ? formatDuration(gaps.reduce((s, g) => s + g, 0) / gaps.length)
      : null;

    // Current streak
    const sorted = [...closed].sort((a, b) => b.timestamp - a.timestamp);
    let streakType: "wins" | "losses" = sorted[0].realizedPnL >= 0 ? "wins" : "losses";
    let streakCount = 0;
    for (const t of sorted) {
      const isWin = t.realizedPnL >= 0;
      if ((streakType === "wins" && isWin) || (streakType === "losses" && !isWin)) {
        streakCount++;
      } else {
        break;
      }
    }

    return {
      winners,
      losers,
      total: closed.length,
      byTicker,
      best,
      worst,
      avgHoldTime,
      streak: { type: streakType, count: streakCount },
    };
  }, [closed, trades]);

  return (
    <div className="space-y-5">
      {/* Row 1: donut + streak/hold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Winners vs Losers donut */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Winners vs Losers</p>
          <WinnersLosersDonut
            winners={stats.winners}
            losers={stats.losers}
            total={stats.total}
          />
        </div>

        {/* Key stats */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Trade Stats</p>

          {/* Current streak */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current Streak</span>
            {stats.streak.count > 0 ? (
              <span
                className={`text-xs font-semibold tabular-nums ${
                  stats.streak.type === "wins" ? "text-green-500" : "text-red-400"
                }`}
              >
                {stats.streak.count} {stats.streak.type} in a row
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>

          {/* Avg hold time */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Avg Hold Time</span>
            <span className="text-xs font-mono font-medium">
              {stats.avgHoldTime ?? "—"}
            </span>
          </div>

          {/* Closed trades count */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Closed Trades</span>
            <span className="text-xs font-mono font-medium tabular-nums">
              {stats.total}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Best trade */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
              Best Trade
            </p>
            {stats.best ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{stats.best.ticker}</span>
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-green-500 tabular-nums">
                    +{formatCurrency(stats.best.realizedPnL)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(stats.best.timestamp)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>

          {/* Worst trade */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
              Worst Trade
            </p>
            {stats.worst && stats.worst.realizedPnL < 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{stats.worst.ticker}</span>
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-red-400 tabular-nums">
                    {formatCurrency(stats.worst.realizedPnL)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(stats.worst.timestamp)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: P&L by ticker bar chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium text-muted-foreground">P&amp;L by Ticker</p>
        <TickerPnLBars data={stats.byTicker} />
      </div>
    </div>
  );
}
