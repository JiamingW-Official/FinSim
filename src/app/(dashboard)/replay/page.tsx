"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { OHLCVBar } from "@/types/market";
import { WATCHLIST_STOCKS } from "@/types/market";
import {
  generateIntradayBars,
  aggregateDailyBars,
  aggregateHourlyBars,
  expand15mTo5m,
} from "@/services/market-data/intraday-generator";

// ── Types ────────────────────────────────────────────────────────────────────

type ReplayStatus = "idle" | "playing" | "paused" | "complete";

type ReplayTimeframe = "1m" | "5m" | "15m" | "1h" | "1D";

interface ReplayTrade {
  id: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  barIndex: number;
  timestamp: number;
  exitPrice?: number;
  exitBarIndex?: number;
  pnl?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SPEED_OPTIONS: { label: string; intervalMs: number }[] = [
  { label: "1x", intervalMs: 800 },
  { label: "2x", intervalMs: 400 },
  { label: "5x", intervalMs: 160 },
  { label: "10x", intervalMs: 80 },
];

const AI_COMMENTS: string[] = [
  "Price consolidating near resistance — watch for breakout or reversal.",
  "Volume spike on the last bar signals institutional participation.",
  "The candle body is shrinking — momentum may be exhausting.",
  "Bullish engulfing formation developing. Confirmation needed next bar.",
  "Price rejected the upper wick twice — sellers defending this level.",
  "Consecutive higher lows suggest buyers are stepping in aggressively.",
  "Volume divergence: price rising but volume declining — caution advised.",
  "This candle closed above the previous high — trend continuation signal.",
  "Bearish pin bar at resistance — look for a short entry on confirmation.",
  "Accumulation range detected. Wait for a clean breakout above range high.",
  "The session is showing a clear higher-high, higher-low structure.",
  "Price found support at the open of the session. Bulls defending the level.",
  "Doji candle at a key level — indecision. Bias shifts to whichever side breaks.",
  "Strong close near session high indicates sustained buying pressure.",
  "Watch the volume on the next bar — a quiet bar here often precedes a move.",
  "Three consecutive red candles with decreasing volume — sellers weakening.",
  "Price reclaimed the prior day high — short-term bullish bias.",
  "Wick-to-body ratio is high — market is probing for liquidity above/below.",
  "This level has acted as both support and resistance multiple times.",
  "Momentum is building. The last five bars all closed above their midpoints.",
];

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTradingDays(count: number): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  // Anchor to project current date 2026-03-27
  const d = new Date("2026-03-27T00:00:00Z");
  while (days.length < count) {
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      const iso = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        value: iso,
      });
    }
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return days;
}

const TRADING_DAYS = getTradingDays(30);

/** Build synthetic daily bars for a ticker/date combo using seeded PRNG. */
function buildSyntheticDailyBars(ticker: string, dateStr: string): OHLCVBar[] {
  const seed = hashStr(ticker + "|" + dateStr);
  const rand = mulberry32(seed);

  // Base price varies by ticker deterministically
  const baseRand = mulberry32(hashStr(ticker + "|base"));
  const basePrice = 50 + baseRand() * 450; // $50–$500

  const anchorDate = new Date(dateStr + "T00:00:00Z");
  const bars: OHLCVBar[] = [];
  let price = basePrice;

  // Generate 60 trading-day history
  for (let i = 59; i >= 0; i--) {
    const barDate = new Date(anchorDate);
    barDate.setUTCDate(barDate.getUTCDate() - i);
    const dow = barDate.getUTCDay();
    if (dow === 0 || dow === 6) continue;

    const dayReturn = (rand() - 0.485) * 0.035;
    const open = price;
    const close = open * (1 + dayReturn);
    const volatility = Math.abs(dayReturn) + 0.005 + rand() * 0.015;
    const high = Math.max(open, close) * (1 + rand() * volatility);
    const low = Math.min(open, close) * (1 - rand() * volatility);
    const volume = Math.round(1_000_000 + rand() * 9_000_000);

    bars.push({
      timestamp: barDate.getTime(),
      open,
      high,
      low,
      close,
      volume,
      ticker,
      timeframe: "1d",
    });
    price = close;
  }
  return bars;
}

/** Convert ReplayTimeframe → display bars from 15m base bars. */
function toDisplayBars(bars15m: OHLCVBar[], tf: ReplayTimeframe): OHLCVBar[] {
  if (bars15m.length === 0) return [];
  switch (tf) {
    case "1m": {
      // Expand 15m → 5m → 1m (5 sub-bars per 5m bar)
      const fiveM = expand15mTo5m(bars15m);
      const result: OHLCVBar[] = [];
      const intervalMs = 60_000;
      for (const bar of fiveM) {
        const { open, high, low, close, volume, ticker, timestamp } = bar;
        const range = high - low || Math.abs(close) * 0.001 || 0.01;
        const rand = mulberry32(hashStr(ticker + String(timestamp) + "1m"));
        const pts: number[] = [open, 0, 0, 0, 0, close];
        for (let k = 1; k <= 4; k++) {
          const t = k / 5;
          pts[k] = open + (close - open) * t + (rand() - 0.5) * range * 0.4;
        }
        for (let k = 0; k < 5; k++) {
          const bO = pts[k];
          const bC = pts[k + 1];
          const bMax = Math.max(bO, bC);
          const bMin = Math.min(bO, bC);
          const wick = range * 0.05 * (0.5 + rand());
          result.push({
            timestamp: timestamp + k * intervalMs,
            open: bO,
            high: Math.min(bMax + wick, high),
            low: Math.max(bMin - wick, low),
            close: bC,
            volume: Math.max(1, Math.round(volume / 5)),
            ticker,
            timeframe: "5m",
          });
        }
      }
      return result;
    }
    case "5m":
      return expand15mTo5m(bars15m);
    case "15m":
      return bars15m;
    case "1h":
      return aggregateHourlyBars(bars15m);
    case "1D":
      return aggregateDailyBars(bars15m);
  }
}

// ── Inline card wrapper (avoids missing shadcn card dep) ──────────────────────

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card",
        className,
      )}
    >
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatsCardProps {
  startPrice: number;
  currentPrice: number;
  sessionHigh: number;
  sessionLow: number;
}

function StatsCard({
  startPrice,
  currentPrice,
  sessionHigh,
  sessionLow,
}: StatsCardProps) {
  const pctChange =
    startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const isUp = pctChange >= 0;

  return (
    <SectionCard title="Session Stats">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Start</p>
          <p className="font-mono text-sm font-medium">
            {formatCurrency(startPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current</p>
          <p
            className={cn(
              "font-mono text-sm font-medium",
              isUp ? "text-emerald-500" : "text-red-500",
            )}
          >
            {formatCurrency(currentPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Session High</p>
          <p className="font-mono text-sm font-medium text-emerald-500">
            {formatCurrency(sessionHigh)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Session Low</p>
          <p className="font-mono text-sm font-medium text-red-500">
            {formatCurrency(sessionLow)}
          </p>
        </div>
        <div className="col-span-2 mt-1 flex items-center gap-1.5">
          {isUp ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              isUp ? "text-emerald-500" : "text-red-500",
            )}
          >
            {isUp ? "+" : ""}
            {pctChange.toFixed(2)}%
          </span>
        </div>
      </div>
    </SectionCard>
  );
}

interface TradeActionsProps {
  currentPrice: number;
  onTrade: (side: "buy" | "sell", qty: number, price: number) => void;
  disabled: boolean;
}

function TradeActions({ currentPrice, onTrade, disabled }: TradeActionsProps) {
  const [qty, setQty] = useState<string>("10");

  const handleBuy = () => {
    const q = parseInt(qty, 10);
    if (!isNaN(q) && q > 0) onTrade("buy", q, currentPrice);
  };

  const handleSell = () => {
    const q = parseInt(qty, 10);
    if (!isNaN(q) && q > 0) onTrade("sell", q, currentPrice);
  };

  return (
    <SectionCard title="Simulated Trade">
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Quantity (shares)
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Market price:{" "}
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(currentPrice)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleBuy}
            disabled={disabled || currentPrice === 0}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            Buy
          </button>
          <button
            onClick={handleSell}
            disabled={disabled || currentPrice === 0}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-red-700 disabled:opacity-40"
          >
            Sell
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

interface TradeLogProps {
  trades: ReplayTrade[];
  currentPrice: number;
}

function TradeLog({ trades, currentPrice }: TradeLogProps) {
  return (
    <SectionCard title={`Trade Log (${trades.length})`}>
      {trades.length === 0 ? (
        <p className="text-xs text-muted-foreground">No trades placed yet.</p>
      ) : (
        <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
          {[...trades].reverse().map((t) => {
            const openPnl =
              t.exitPrice == null
                ? t.side === "buy"
                  ? (currentPrice - t.price) * t.qty
                  : (t.price - currentPrice) * t.qty
                : null;
            const pnlVal = t.pnl ?? openPnl ?? 0;
            const isOpen = t.exitPrice == null;
            return (
              <div
                key={t.id}
                className="rounded border border-border bg-background p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      className={cn(
                        "h-4 px-1.5 text-[11px]",
                        t.side === "buy"
                          ? "bg-emerald-600/20 text-emerald-400"
                          : "bg-red-600/20 text-red-400",
                      )}
                    >
                      {t.side.toUpperCase()}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {t.qty} @ {formatCurrency(t.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOpen && (
                      <Badge className="h-4 bg-primary/20 px-1 text-[11px] text-primary">
                        OPEN
                      </Badge>
                    )}
                    <span
                      className={cn(
                        "font-mono text-xs text-muted-foreground font-medium",
                        pnlVal >= 0 ? "text-emerald-500" : "text-red-500",
                      )}
                    >
                      {pnlVal >= 0 ? "+" : ""}
                      {formatCurrency(pnlVal)}
                    </span>
                  </div>
                </div>
                {t.exitPrice != null && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Exit: {formatCurrency(t.exitPrice)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

interface AICommentaryProps {
  barIndex: number;
  isActive: boolean;
}

function AICommentary({ barIndex, isActive }: AICommentaryProps) {
  const commentIndex = useMemo(
    () => Math.floor(barIndex / 10) % AI_COMMENTS.length,
    [barIndex],
  );
  const comment = AI_COMMENTS[commentIndex];
  const triggerBar = Math.floor(barIndex / 10) * 10;

  return (
    <SectionCard title="AI Commentary">
      {isActive ? (
        <>
          <p className="text-sm leading-relaxed text-foreground">{comment}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Bar {triggerBar} — updates every 10 bars
          </p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Start replay to see AI commentary.
        </p>
      )}
    </SectionCard>
  );
}

function KeyboardHints() {
  return (
    <SectionCard title="Shortcuts">
      <div className="flex flex-col gap-1.5">
        {[
          { key: "Space", desc: "Play / Pause" },
          { key: "←", desc: "Step back" },
          { key: "→", desc: "Step forward" },
        ].map(({ key, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Keyboard className="h-3 w-3" />
              {desc}
            </span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Inline SVG Replay Chart ────────────────────────────────────────────────────

interface ReplayChartProps {
  bars: OHLCVBar[];
}

function ReplayChart({ bars }: ReplayChartProps) {
  const VBOX_W = 1000;
  const VBOX_H = 500;
  const PAD = { top: 30, bottom: 40, left: 10, right: 70 };

  const visible = useMemo(() => {
    if (bars.length === 0) return [];
    return bars.slice(Math.max(0, bars.length - 120));
  }, [bars]);

  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (visible.length === 0)
      return { minPrice: 0, maxPrice: 1, priceRange: 1 };
    let mn = visible[0].low;
    let mx = visible[0].high;
    for (const b of visible) {
      if (b.low < mn) mn = b.low;
      if (b.high > mx) mx = b.high;
    }
    const pad = (mx - mn) * 0.06 || 1;
    return {
      minPrice: mn - pad,
      maxPrice: mx + pad,
      priceRange: mx - mn + pad * 2,
    };
  }, [visible]);

  const chartW = VBOX_W - PAD.left - PAD.right;
  const chartH = VBOX_H - PAD.top - PAD.bottom;

  const toX = useCallback(
    (i: number) =>
      PAD.left + (i / Math.max(visible.length - 1, 1)) * chartW,
    [visible.length, chartW],
  );

  const toY = useCallback(
    (price: number) =>
      PAD.top + chartH - ((price - minPrice) / priceRange) * chartH,
    [minPrice, priceRange, chartH],
  );

  const barWidth = useMemo(
    () => Math.max(2, (chartW / Math.max(visible.length, 1)) * 0.65),
    [chartW, visible.length],
  );

  // Y-axis price labels (5 levels)
  const priceLabels = useMemo(() => {
    const labels: { price: number; y: number }[] = [];
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (priceRange * i) / 4;
      labels.push({ price, y: toY(price) });
    }
    return labels;
  }, [minPrice, priceRange, toY]);

  const lastBar = visible.length > 0 ? visible[visible.length - 1] : null;

  if (visible.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Generating bars...</p>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${VBOX_W} ${VBOX_H}`}
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      {/* Background */}
      <rect width={VBOX_W} height={VBOX_H} fill="#0a0e17" />

      {/* Horizontal grid */}
      {priceLabels.map(({ y }, idx) => (
        <line
          key={idx}
          x1={PAD.left}
          y1={y}
          x2={VBOX_W - PAD.right}
          y2={y}
          stroke="#1a2235"
          strokeWidth="0.8"
        />
      ))}

      {/* Candles */}
      {visible.map((bar, i) => {
        const cx = toX(i);
        const isUp = bar.close >= bar.open;
        const color = isUp ? "#10b981" : "#ef4444";
        const bTop = toY(Math.max(bar.open, bar.close));
        const bBot = toY(Math.min(bar.open, bar.close));
        const bH = Math.max(0.8, bBot - bTop);
        const highY = toY(bar.high);
        const lowY = toY(bar.low);
        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={cx}
              y1={highY}
              x2={cx}
              y2={lowY}
              stroke={color}
              strokeWidth="1"
            />
            {/* Body */}
            <rect
              x={cx - barWidth / 2}
              y={bTop}
              width={barWidth}
              height={bH}
              fill={color}
              opacity={0.9}
            />
          </g>
        );
      })}

      {/* Price labels (Y-axis right) */}
      {priceLabels.map(({ price, y }, idx) => (
        <text
          key={idx}
          x={VBOX_W - PAD.right + 8}
          y={y + 4}
          fontSize="10"
          fill="#6b7280"
          textAnchor="start"
        >
          {price >= 100 ? price.toFixed(0) : price.toFixed(2)}
        </text>
      ))}

      {/* Current price line + label */}
      {lastBar && (
        <>
          <line
            x1={PAD.left}
            y1={toY(lastBar.close)}
            x2={VBOX_W - PAD.right}
            y2={toY(lastBar.close)}
            stroke={lastBar.close >= lastBar.open ? "#10b981" : "#ef4444"}
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
          <rect
            x={VBOX_W - PAD.right}
            y={toY(lastBar.close) - 8}
            width={PAD.right - 4}
            height={16}
            fill={lastBar.close >= lastBar.open ? "#10b981" : "#ef4444"}
            rx="2"
          />
          <text
            x={VBOX_W - PAD.right + 2}
            y={toY(lastBar.close) + 4}
            fontSize="10"
            fill="white"
            fontWeight="bold"
          >
            {lastBar.close.toFixed(2)}
          </text>
        </>
      )}

      {/* Date labels (X-axis) */}
      {visible.length > 0 && (
        <>
          <text
            x={PAD.left}
            y={VBOX_H - 10}
            fontSize="10"
            fill="#6b7280"
            textAnchor="start"
          >
            {new Date(visible[0].timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </text>
          {visible.length > 1 && (
            <text
              x={VBOX_W - PAD.right}
              y={VBOX_H - 10}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {new Date(
                visible[visible.length - 1].timestamp,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReplayPage() {
  // ── Config selectors ────────────────────────────────────────────────────────
  const [ticker, setTicker] = useState<string>("AAPL");
  const [dateValue, setDateValue] = useState<string>(TRADING_DAYS[0].value);
  const [replayTf, setReplayTf] = useState<ReplayTimeframe>("15m");
  const [speedIndex, setSpeedIndex] = useState<number>(0);

  // ── Bar data ────────────────────────────────────────────────────────────────
  const [allBars15m, setAllBars15m] = useState<OHLCVBar[]>([]);
  const [revealedCount, setRevealedCount] = useState<number>(1);
  const [status, setStatus] = useState<ReplayStatus>("idle");

  // ── Trade state (local only) ─────────────────────────────────────────────
  const [trades, setTrades] = useState<ReplayTrade[]>([]);

  // ── Interval ref ─────────────────────────────────────────────────────────
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep stable reference to advance for interval callback
  const advanceRef = useRef<() => void>(() => void 0);

  const totalBars = allBars15m.length;

  // ── Derived display bars ───────────────────────────────────────────────────
  const displayBars = useMemo(() => {
    const base15m = allBars15m.slice(0, revealedCount);
    return toDisplayBars(base15m, replayTf);
  }, [allBars15m, revealedCount, replayTf]);

  // ── Session stats ──────────────────────────────────────────────────────────
  const startPrice = useMemo(
    () => (displayBars.length > 0 ? displayBars[0].open : 0),
    [displayBars],
  );
  const currentPrice = useMemo(
    () =>
      displayBars.length > 0 ? displayBars[displayBars.length - 1].close : 0,
    [displayBars],
  );
  const sessionHigh = useMemo(
    () =>
      displayBars.length > 0
        ? Math.max(...displayBars.map((b) => b.high))
        : 0,
    [displayBars],
  );
  const sessionLow = useMemo(
    () =>
      displayBars.length > 0
        ? Math.min(...displayBars.map((b) => b.low))
        : Infinity,
    [displayBars],
  );

  // ── Generate bars when ticker/date changes ─────────────────────────────────
  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const dailyBars = buildSyntheticDailyBars(ticker, dateValue);
    const bars15m = generateIntradayBars(dailyBars, "15m");
    setAllBars15m(bars15m);
    setRevealedCount(1);
    setStatus("idle");
    setTrades([]);
    stopInterval();
  }, [ticker, dateValue, stopInterval]);

  // ── Advance one bar ────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setRevealedCount((prev) => {
      if (prev >= totalBars) {
        stopInterval();
        setStatus("complete");
        return prev;
      }
      return prev + 1;
    });
  }, [totalBars, stopInterval]);

  // Keep ref in sync
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  const stepBack = useCallback(() => {
    setRevealedCount((prev) => Math.max(1, prev - 1));
    setStatus((s) => (s === "complete" ? "paused" : s));
  }, []);

  const play = useCallback(() => {
    setStatus((s) => {
      if (s === "complete") return s;
      return "playing";
    });
  }, []);

  const pause = useCallback(() => {
    stopInterval();
    setStatus((s) => (s === "playing" ? "paused" : s));
  }, [stopInterval]);

  const reset = useCallback(() => {
    stopInterval();
    setRevealedCount(1);
    setStatus("idle");
    setTrades([]);
  }, [stopInterval]);

  // ── Manage interval based on status + speedIndex ───────────────────────────
  useEffect(() => {
    stopInterval();
    if (status === "playing") {
      const speed = SPEED_OPTIONS[speedIndex];
      intervalRef.current = setInterval(() => advanceRef.current(), speed.intervalMs);
    }
    return stopInterval;
  }, [status, speedIndex, stopInterval]);

  // ── Auto-detect complete ───────────────────────────────────────────────────
  useEffect(() => {
    if (revealedCount >= totalBars && totalBars > 0 && status === "playing") {
      stopInterval();
      setStatus("complete");
    }
  }, [revealedCount, totalBars, status, stopInterval]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => stopInterval(), [stopInterval]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setStatus((s) => {
          if (s === "playing") {
            stopInterval();
            return "paused";
          }
          if (s !== "complete") return "playing";
          return s;
        });
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stopInterval();
        setStatus((s) => (s === "playing" ? "paused" : s));
        setRevealedCount((prev) => Math.max(1, prev - 1));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setStatus((s) => {
          if (s !== "playing" && s !== "complete") {
            setRevealedCount((prev) =>
              Math.min(prev + 1, totalBars),
            );
          }
          return s;
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [stopInterval, totalBars]);

  // ── Trade handler ──────────────────────────────────────────────────────────
  const handleTrade = useCallback(
    (side: "buy" | "sell", qty: number, price: number) => {
      setTrades((prev) => {
        const oppositeOpen = prev.find(
          (t) => t.side !== side && t.exitPrice == null,
        );
        if (oppositeOpen) {
          const pnl =
            oppositeOpen.side === "buy"
              ? (price - oppositeOpen.price) * oppositeOpen.qty
              : (oppositeOpen.price - price) * oppositeOpen.qty;
          return prev.map((t) =>
            t.id === oppositeOpen.id
              ? { ...t, exitPrice: price, exitBarIndex: revealedCount, pnl }
              : t,
          );
        }
        const newTrade: ReplayTrade = {
          id: crypto.randomUUID(),
          side,
          qty,
          price,
          barIndex: revealedCount,
          timestamp: Date.now(),
        };
        return [...prev, newTrade];
      });
    },
    [revealedCount],
  );

  // ── Status badge ───────────────────────────────────────────────────────────
  const statusBadge = useMemo(() => {
    switch (status) {
      case "playing":
        return (
          <Badge className="border-emerald-600/30 bg-emerald-600/20 text-xs text-emerald-400">
            Playing
          </Badge>
        );
      case "paused":
        return (
          <Badge className="border-amber-600/30 bg-amber-600/20 text-xs text-amber-400">
            Paused
          </Badge>
        );
      case "complete":
        return (
          <Badge className="border-border bg-primary/20 text-xs text-primary">
            Complete
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted/60 text-xs text-muted-foreground">
            Ready
          </Badge>
        );
    }
  }, [status]);

  const atEnd = revealedCount >= totalBars && totalBars > 0;
  const isPlaying = status === "playing";
  const progress = totalBars > 0 ? (revealedCount / totalBars) * 100 : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left Panel: Chart (~70%) ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        {/* Config bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 border-l-4 border-l-primary">
          {/* Ticker select */}
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {WATCHLIST_STOCKS.map((s) => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} — {s.name}
              </option>
            ))}
          </select>

          {/* Date select */}
          <select
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {TRADING_DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Timeframe buttons */}
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
            {(["1m", "5m", "15m", "1h", "1D"] as ReplayTimeframe[]).map(
              (tf) => (
                <button
                  key={tf}
                  onClick={() => setReplayTf(tf)}
                  className={cn(
                    "rounded px-2 py-1 text-xs text-muted-foreground transition-colors",
                    replayTf === tf
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tf}
                </button>
              ),
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {statusBadge}
            <span className="font-mono text-xs text-muted-foreground">
              Bar {revealedCount} / {totalBars}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative flex-1 overflow-hidden bg-background">
          <ReplayChart bars={displayBars} />
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-border">
          <div
            className="h-1 bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 border-t border-border bg-card px-4 py-2">
          {/* Reset */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={reset}
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* Prev */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              pause();
              stepBack();
            }}
            disabled={revealedCount <= 1}
            title="Step back (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Play / Pause */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 transition-all",
              isPlaying && "bg-primary/15 text-primary ring-1 ring-primary/30",
            )}
            onClick={() => (isPlaying ? pause() : play())}
            disabled={atEnd}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Next */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (!isPlaying) advance();
            }}
            disabled={atEnd}
            title="Step forward (→)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-4 w-px bg-border" />

          {/* Speed selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Speed:</span>
            {SPEED_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setSpeedIndex(i)}
                className={cn(
                  "rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors",
                  speedIndex === i
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Seek slider */}
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
            <input
              type="range"
              min={1}
              max={Math.max(totalBars, 1)}
              value={revealedCount}
              onChange={(e) => {
                pause();
                const val = Number(e.target.value);
                setRevealedCount(val);
                setStatus(val >= totalBars ? "complete" : "paused");
              }}
              title="Seek"
              aria-label="Seek bar"
              className="h-1.5 w-36 cursor-pointer appearance-none rounded-full bg-border accent-primary"
            />
          </div>
        </div>
      </div>

      {/* ── Right Panel: Sidebar (~30%) ──────────────────────────────────────── */}
      <div className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto bg-background p-3">
        <StatsCard
          startPrice={startPrice}
          currentPrice={currentPrice}
          sessionHigh={sessionHigh > 0 ? sessionHigh : 0}
          sessionLow={sessionLow === Infinity ? 0 : sessionLow}
        />
        <TradeActions
          currentPrice={currentPrice}
          onTrade={handleTrade}
          disabled={status === "idle" || currentPrice === 0}
        />
        <TradeLog trades={trades} currentPrice={currentPrice} />
        <AICommentary barIndex={revealedCount} isActive={status !== "idle"} />
        <KeyboardHints />
      </div>
    </div>
  );
}
