"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTRADAY_BARS = 14; // ~30-minute slots in a 7h trading day
const SPY_DAILY_DRIFT = 0.0003; // ~7% / 252 trading days

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt$(v: number, alwaysSign = false): string {
  const abs = Math.abs(v);
  let s: string;
  if (abs >= 1_000_000) s = `${(v / 1_000_000).toFixed(2)}M`;
  else if (abs >= 1_000) s = `${(v / 1_000).toFixed(1)}k`;
  else s = v.toFixed(2);
  return alwaysSign && v > 0 ? `+${s}` : s;
}

function fmtPct(v: number, alwaysSign = false): string {
  const s = `${Math.abs(v).toFixed(2)}%`;
  if (alwaysSign && v > 0) return `+${s}`;
  if (v < 0) return `-${s}`;
  return s;
}

// Seeded PRNG — same formula as the rest of the codebase
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── AnimatedNumber ───────────────────────────────────────────────────────────

interface AnimatedNumberProps {
  value: number;
  formatter: (v: number) => string;
  className?: string;
}

function AnimatedNumber({ value, formatter, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    setFlash(value > prev.current ? "up" : "down");
    prev.current = value;

    // Animate toward target over ~400ms
    const start = display;
    const end = value;
    const startTime = performance.now();
    const duration = 400;

    let raf: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(start + (end - start) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const flashTimer = setTimeout(() => setFlash(null), 600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(flashTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-300",
        flash === "up" && "text-emerald-300",
        flash === "down" && "text-red-300",
        !flash && className,
      )}
    >
      {formatter(display)}
    </span>
  );
}

// ─── RiskGauge ────────────────────────────────────────────────────────────────

interface RiskGaugeProps {
  label: string;
  value: number; // 0–100
  warning?: boolean;
  caption: string;
}

function RiskGauge({ label, value, warning, caption }: RiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  // color gradient: green → amber → red
  const color =
    clamped < 40 ? "#10b981" : clamped < 70 ? "#f59e0b" : "#ef4444";

  // SVG arc parameters
  const R = 28;
  const cx = 36;
  const cy = 36;
  const startAngle = -210;
  const sweep = 240; // degrees
  const arcLength = (sweep / 360) * 2 * Math.PI * R;
  const dashOffset = arcLength - (clamped / 100) * arcLength;

  const polarToCart = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  };

  const describeArc = (startDeg: number, endDeg: number) => {
    const s = polarToCart(startDeg);
    const e = polarToCart(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const trackPath = describeArc(startAngle, startAngle + sweep);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative">
        <svg width={72} height={56} viewBox="0 0 72 72">
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={trackPath}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
          />
          {/* Value text */}
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={color}
            fontFamily="var(--font-mono, monospace)"
          >
            {clamped.toFixed(0)}%
          </text>
        </svg>
        {warning && (
          <span className="absolute -top-1 -right-1">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-center leading-tight">{label}</p>
      <p className="text-[11px] text-muted-foreground text-center leading-tight">{caption}</p>
    </div>
  );
}

// ─── IntradayChart ─────────────────────────────────────────────────────────────

interface IntradayPoint {
  slot: number; // 0..INTRADAY_BARS-1
  pnl: number;
}

interface IntradayChartProps {
  points: IntradayPoint[];
  currentSlot: number;
}

function IntradayChart({ points, currentSlot }: IntradayChartProps) {
  const W = 280;
  const H = 72;
  const padX = 6;
  const padY = 8;

  const values = points.map((p) => p.pnl);
  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 0);
  const range = maxV - minV || 1;

  const toX = (slot: number) =>
    padX + ((slot / (INTRADAY_BARS - 1)) * (W - padX * 2));
  const toY = (v: number) =>
    padY + (1 - (v - minV) / range) * (H - padY * 2);

  const zeroY = toY(0);

  // Build polyline path
  const linePoints = points.map((p) => `${toX(p.slot)},${toY(p.pnl)}`).join(" ");

  // Build filled area path
  const areaPath =
    points.length > 0
      ? `M ${toX(points[0].slot)},${zeroY} ` +
        points.map((p) => `L ${toX(p.slot)},${toY(p.pnl)}`).join(" ") +
        ` L ${toX(points[points.length - 1].slot)},${zeroY} Z`
      : "";

  const lastPt = points[points.length - 1];
  const isUp = lastPt ? lastPt.pnl >= 0 : true;
  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const fillColor = isUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)";

  // Hour labels (simplified)
  const hourLabels = ["9:30", "11", "12", "1pm", "2", "3", "4"];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 16}`} preserveAspectRatio="none">
      {/* Zero line */}
      <line
        x1={padX}
        y1={zeroY}
        x2={W - padX}
        y2={zeroY}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={0.5}
        strokeDasharray="3 3"
        opacity={0.4}
      />

      {/* Area fill */}
      {areaPath && (
        <path d={areaPath} fill={fillColor} />
      )}

      {/* Line */}
      {points.length > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Open marker */}
      {points.length > 0 && (
        <circle
          cx={toX(points[0].slot)}
          cy={toY(points[0].pnl)}
          r={3}
          fill="hsl(var(--muted))"
          stroke={strokeColor}
          strokeWidth={1}
        />
      )}

      {/* Current marker */}
      {lastPt && (
        <circle
          cx={toX(lastPt.slot)}
          cy={toY(lastPt.pnl)}
          r={4}
          fill={strokeColor}
        />
      )}

      {/* Hour labels */}
      {hourLabels.map((label, i) => {
        const x = padX + (i / (hourLabels.length - 1)) * (W - padX * 2);
        return (
          <text
            key={label}
            x={x}
            y={H + 12}
            textAnchor="middle"
            fontSize={7}
            fill="hsl(var(--muted-foreground))"
            opacity={0.6}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LivePnLDashboard() {
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const cash = useTradingStore((s) => s.cash);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  // ── Derived P&L values ──────────────────────────────────────────────────────

  const unrealizedPnL = useMemo(
    () => positions.reduce((s, p) => s + p.unrealizedPnL, 0),
    [positions],
  );

  // Today's realized P&L: sum of closed trades from last 24h of simulation time
  const todayRealized = useMemo(() => {
    if (tradeHistory.length === 0) return 0;
    const latestDate = tradeHistory[0].simulationDate;
    const dayMs = 86_400_000;
    return tradeHistory
      .filter(
        (t) =>
          t.realizedPnL !== 0 &&
          latestDate - t.simulationDate < dayMs,
      )
      .reduce((s, t) => s + t.realizedPnL, 0);
  }, [tradeHistory]);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  // ── Position ladder ─────────────────────────────────────────────────────────

  const sortedPositions = useMemo(
    () =>
      [...positions].sort(
        (a, b) => Math.abs(b.unrealizedPnL) - Math.abs(a.unrealizedPnL),
      ),
    [positions],
  );

  const maxPosPnL = useMemo(
    () =>
      Math.max(
        ...sortedPositions.map((p) => Math.abs(p.unrealizedPnL)),
        1,
      ),
    [sortedPositions],
  );

  // ── Attribution breakdown (synthetic) ──────────────────────────────────────
  // Split unrealizedPnL into price change + theta + dividends + fees components
  const attribution = useMemo(() => {
    if (positions.length === 0) return null;
    const fees = tradeHistory
      .slice(0, 10)
      .reduce((s, t) => s + (t.fees ?? 0), 0);
    const theta = unrealizedPnL * -0.02; // simulated theta drag ~2%
    const dividends = portfolioValue * 0.00005; // tiny daily dividend yield
    const priceChange = unrealizedPnL - theta - dividends + fees;
    const total = Math.abs(priceChange) + Math.abs(theta) + dividends + fees || 1;
    return {
      priceChange,
      theta,
      dividends,
      fees: -fees,
      total,
    };
  }, [unrealizedPnL, positions.length, tradeHistory, portfolioValue]);

  // SPY synthetic comparison (seeded per revealedCount)
  const spyReturn = useMemo(() => {
    const rng = mulberry32(revealedCount * 1337 + 42);
    return (rng() - 0.5) * 0.012 + SPY_DAILY_DRIFT; // ±0.6% + drift
  }, [revealedCount]);
  const spyPnL = INITIAL_CAPITAL * spyReturn;

  // ── Risk meters ─────────────────────────────────────────────────────────────

  const positionsValue = useMemo(
    () => positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0),
    [positions],
  );
  const portfolioHeat = portfolioValue > 0 ? (positionsValue / portfolioValue) * 100 : 0;
  const cashPct = portfolioValue > 0 ? (cash / portfolioValue) * 100 : 100;

  const concentrationRisk = useMemo(() => {
    if (positionsValue === 0 || positions.length === 0) return 0;
    const max = Math.max(...positions.map((p) => p.currentPrice * p.quantity));
    return (max / positionsValue) * 100;
  }, [positions, positionsValue]);

  // Net delta: for equity positions, delta = shares (simplified); options not modelled here
  const netDelta = useMemo(
    () =>
      positions.reduce((s, p) => {
        return s + (p.side === "long" ? p.quantity : -p.quantity);
      }, 0),
    [positions],
  );
  // Normalize delta to 0–100 gauge (cap at 10k shares)
  const deltaGauge = Math.min(100, (Math.abs(netDelta) / 10_000) * 100);

  // ── Intraday P&L chart (synthetic, seeds on revealedCount) ──────────────────

  const intradayPoints = useMemo<IntradayPoint[]>(() => {
    const rng = mulberry32(revealedCount * 777 + 99);
    const currentSlotIndex = revealedCount % INTRADAY_BARS;
    const pts: IntradayPoint[] = [];
    let running = 0;
    for (let i = 0; i <= currentSlotIndex; i++) {
      running += (rng() - 0.48) * (Math.abs(unrealizedPnL) * 0.15 + 50);
      pts.push({ slot: i, pnl: running });
    }
    // Anchor last slot to actual unrealizedPnL
    if (pts.length > 0) {
      pts[pts.length - 1] = { slot: currentSlotIndex, pnl: unrealizedPnL };
    }
    return pts;
  }, [revealedCount, unrealizedPnL]);

  const currentSlot = revealedCount % INTRADAY_BARS;

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (positions.length === 0 && tradeHistory.filter((t) => t.realizedPnL !== 0).length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Live P&L Dashboard
        </div>
        <p className="text-xs text-muted-foreground py-6 text-center">
          Open a position to start monitoring real-time P&L.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Live P&L Dashboard
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* ── Section 1: Live P&L Ticker ───────────────────────────────────────── */}
      <div className="rounded-md bg-muted/30 p-3 space-y-2">
        <div className="flex items-end justify-between gap-4">
          {/* Unrealized */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Unrealized P&L</p>
            <p className="text-2xl font-bold leading-none">
              <AnimatedNumber
                value={unrealizedPnL}
                formatter={(v) =>
                  `${v >= 0 ? "+" : ""}${formatCurrency(v)}`
                }
                className={unrealizedPnL >= 0 ? "text-emerald-400" : "text-red-400"}
              />
            </p>
            <p
              className={cn(
                "text-[11px] font-semibold mt-0.5",
                unrealizedPnL >= 0 ? "text-emerald-400/70" : "text-red-400/70",
              )}
            >
              {positions.length > 0 &&
                fmtPct(
                  (unrealizedPnL /
                    positions.reduce(
                      (s, p) => s + p.avgPrice * p.quantity,
                      0,
                    )) *
                    100,
                  true,
                )}
            </p>
          </div>

          {/* Today's realized */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Today Realized</p>
            <p
              className={cn(
                "text-base font-semibold tabular-nums",
                todayRealized >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {todayRealized >= 0 ? "+" : ""}
              {formatCurrency(todayRealized)}
            </p>
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">All-Time P&L</p>
            <p
              className={cn(
                "text-base font-semibold tabular-nums",
                totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {totalPnL >= 0 ? "+" : ""}
              {fmt$(totalPnL, false)}
            </p>
            <p
              className={cn(
                "text-xs font-bold tabular-nums",
                totalPnLPct >= 0 ? "text-emerald-400/70" : "text-red-400/70",
              )}
            >
              {fmtPct(totalPnLPct, true)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Position Ladder ───────────────────────────────────────── */}
      {sortedPositions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Position Ladder
          </p>
          <div className="space-y-1">
            {sortedPositions.map((pos) => {
              const barPct =
                maxPosPnL > 0
                  ? (Math.abs(pos.unrealizedPnL) / maxPosPnL) * 100
                  : 0;
              const isPos = pos.unrealizedPnL >= 0;
              const value = pos.currentPrice * pos.quantity;
              return (
                <div key={`${pos.ticker}-${pos.side}`} className="space-y-0.5 rounded-md px-1.5 py-1 -mx-1.5 transition-colors duration-150 hover:bg-muted/20">
                  {/* Row header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold w-10">{pos.ticker}</span>
                      <span
                        className={cn(
                          "rounded px-1 py-0.5 text-[11px] font-semibold uppercase",
                          pos.side === "long"
                            ? "bg-emerald-500/12 text-emerald-400"
                            : "bg-red-500/12 text-red-400",
                        )}
                      >
                        {pos.side}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {pos.quantity} @ {formatCurrency(pos.avgPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground tabular-nums">
                        {formatCurrency(pos.currentPrice)}
                      </span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          isPos ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {isPos ? "+" : ""}
                        {formatCurrency(pos.unrealizedPnL)}
                      </span>
                      <span
                        className={cn(
                          "tabular-nums text-[11px]",
                          isPos ? "text-emerald-400/70" : "text-red-400/70",
                        )}
                      >
                        ({fmtPct(pos.unrealizedPnLPercent, true)})
                      </span>
                    </div>
                  </div>
                  {/* SVG bar */}
                  <svg width="100%" height={6} viewBox="0 0 200 6" preserveAspectRatio="none">
                    <rect x={0} y={0} width={200} height={6} rx={3} fill="hsl(var(--muted))" />
                    <rect
                      x={0}
                      y={0}
                      width={barPct * 2}
                      height={6}
                      rx={3}
                      fill={isPos ? "#10b981" : "#ef4444"}
                      opacity={0.75}
                    />
                  </svg>
                  <div className="flex justify-between text-[11px] text-muted-foreground/60">
                    <span>Value {formatCurrency(value)}</span>
                    <span>
                      {portfolioValue > 0
                        ? `${((value / portfolioValue) * 100).toFixed(1)}% of portfolio`
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 3: P&L Attribution Breakdown ────────────────────────────── */}
      {attribution && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Daily P&L Attribution
          </p>
          <div className="space-y-2">
            {/* Stacked bar */}
            {(() => {
              const items = [
                { label: "Price Chg", value: attribution.priceChange, color: "#3b82f6" },
                { label: "Theta", value: attribution.theta, color: "#f59e0b" },
                { label: "Divs", value: attribution.dividends, color: "#10b981" },
                { label: "Fees", value: attribution.fees, color: "#6b7280" },
              ];
              const totalAbs = items.reduce((s, i) => s + Math.abs(i.value), 0) || 1;
              const segments = items.map((item) => ({
                ...item,
                pct: (Math.abs(item.value) / totalAbs) * 100,
              }));
              let cursor = 0;
              return (
                <>
                  <svg width="100%" height={20} viewBox="0 0 280 20" preserveAspectRatio="none">
                    {segments.map((seg) => {
                      const x = (cursor / 100) * 280;
                      const w = (seg.pct / 100) * 280;
                      cursor += seg.pct;
                      return (
                        <rect
                          key={seg.label}
                          x={x}
                          y={0}
                          width={Math.max(w - 1, 0)}
                          height={20}
                          fill={seg.color}
                          rx={2}
                        />
                      );
                    })}
                  </svg>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.label}{" "}
                          <span
                            className={cn(
                              "font-mono",
                              item.value >= 0 ? "text-emerald-400" : "text-red-400",
                            )}
                          >
                            {item.value >= 0 ? "+" : ""}
                            {fmt$(item.value, false)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* vs SPY */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/40">
              <span className="text-xs text-muted-foreground">vs SPY today:</span>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  spyPnL >= 0 ? "text-primary" : "text-red-400",
                )}
              >
                {spyPnL >= 0 ? "+" : ""}
                {formatCurrency(spyPnL)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({fmtPct(spyReturn * 100, true)})
              </span>
              {unrealizedPnL > spyPnL ? (
                <span className="ml-auto text-[11px] rounded px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400">
                  Outperforming
                </span>
              ) : (
                <span className="ml-auto text-[11px] rounded px-1.5 py-0.5 bg-red-500/10 text-red-400">
                  Underperforming
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Section 4: Risk Meters ───────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Risk Meters
        </p>
        <div className="grid grid-cols-4 gap-2">
          <RiskGauge
            label="Portfolio Heat"
            value={portfolioHeat}
            caption={`${portfolioHeat.toFixed(0)}% deployed`}
          />
          <RiskGauge
            label="Concentration"
            value={concentrationRisk}
            warning={concentrationRisk > 30}
            caption={concentrationRisk > 30 ? ">30% in 1 pos" : "Diversified"}
          />
          <RiskGauge
            label="Delta Exposure"
            value={deltaGauge}
            caption={`${netDelta > 0 ? "+" : ""}${netDelta.toFixed(0)} net`}
          />
          <RiskGauge
            label="Cash Available"
            value={cashPct}
            caption={formatCurrency(cash)}
          />
        </div>
      </div>

      {/* ── Section 5: Intraday P&L Chart ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Intraday P&L
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Open: {intradayPoints.length > 0 ? fmt$(intradayPoints[0].pnl, true) : "—"}
            </span>
            <span
              className={cn(
                "text-[11px] font-semibold",
                unrealizedPnL >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              Now: {fmt$(unrealizedPnL, true)}
            </span>
          </div>
        </div>
        <IntradayChart points={intradayPoints} currentSlot={currentSlot} />
      </div>
    </div>
  );
}
