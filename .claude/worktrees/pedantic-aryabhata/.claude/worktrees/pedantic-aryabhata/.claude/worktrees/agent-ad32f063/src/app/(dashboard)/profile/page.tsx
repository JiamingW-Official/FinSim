"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TierProgress } from "@/components/profile/TierProgress";
import { TraderDNA } from "@/components/profile/TraderDNA";
import { BehavioralInsights } from "@/components/profile/BehavioralInsights";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { XPHistory } from "@/components/profile/XPHistory";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { useTradingStore } from "@/stores/trading-store";
import {
  ACHIEVEMENT_DEFS,
  LEARNING_ACHIEVEMENT_DEFS,
  MINIGAME_ACHIEVEMENT_DEFS,
  LEVEL_THRESHOLDS,
  getXPForNextLevel,
} from "@/types/game";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import {
  BarChart3,
  Target,
  Flame,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Lock,
  Trophy,
  Zap,
  Award,
  Shield,
  Star,
  Activity,
  Eye,
  Layers,
  LineChart,
  GraduationCap,
  Crown,
  Brain,
  FlaskConical,
  ScrollText,
  Swords,
  Medal,
  Gift,
  Sparkles,
  GitBranch,
  Clock,
} from "lucide-react";

// ─── Icon map for achievement icons ──────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  TrendingUp,
  TrendingDown,
  Flame,
  BarChart3,
  Award,
  Target,
  DollarSign,
  Trophy,
  Shield,
  Star,
  BookOpen,
  Activity,
  Eye,
  Layers,
  LineChart,
  GraduationCap,
  Crown,
  Brain,
  FlaskConical,
  ScrollText,
  Swords,
  Medal,
  Gift,
  Sparkles,
  GitBranch,
};

function AchIcon({ name, className }: { name: string; className?: string }) {
  const I = ICON_MAP[name] ?? Award;
  return <I className={className} />;
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({
  icon,
  label,
  value,
  valueClass,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3">
      <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={cn("text-sm font-black tabular-nums", valueClass)}>
        {value}
      </p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const completedLessons = useLearnStore((s) => s.completedLessons);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const winRate =
    stats.totalTrades > 0
      ? ((stats.profitableTrades / stats.totalTrades) * 100).toFixed(1)
      : "0.0";

  const xpForCurrent = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const xpForNext = getXPForNextLevel(level);
  const xpIntoLevel = xp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  const xpPct = Math.min((xpIntoLevel / Math.max(xpNeeded, 1)) * 100, 100);

  const CHIPS = [
    {
      icon: <BarChart3 className="h-3.5 w-3.5 text-blue-400" />,
      label: "Total Trades",
      value: stats.totalTrades.toString(),
    },
    {
      icon: <Target className="h-3.5 w-3.5 text-cyan-400" />,
      label: "Win Rate",
      value: `${winRate}%`,
      sub: `${stats.profitableTrades} wins`,
    },
    {
      icon: <DollarSign className="h-3.5 w-3.5 text-green-400" />,
      label: "Total P&L",
      value: `${totalPnL >= 0 ? "+" : ""}${formatCurrency(totalPnL)}`,
      valueClass: totalPnL >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      icon: <TrendingUp className="h-3.5 w-3.5 text-green-400" />,
      label: "Biggest Win",
      value: formatCurrency(stats.largestWin),
      valueClass: "text-green-400",
    },
    {
      icon: <Flame className="h-3.5 w-3.5 text-orange-400" />,
      label: "Best Streak",
      value: `${stats.consecutiveWins}`,
      sub: "wins in a row",
    },
    {
      icon: <BookOpen className="h-3.5 w-3.5 text-violet-400" />,
      label: "Lessons Done",
      value: completedLessons.length.toString(),
      sub: `${achievements.length} achievements`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              Level {level}
            </p>
            <h2 className="text-2xl font-black text-foreground">{title}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground tabular-nums">
              {xp.toLocaleString()} XP total
            </p>
            <p className="text-[10px] text-muted-foreground tabular-nums">
              {(xpNeeded - xpIntoLevel).toLocaleString()} to Lv.{level + 1}
            </p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground tabular-nums">
          <span>{xpIntoLevel.toLocaleString()} XP</span>
          <span>{xpNeeded.toLocaleString()} XP</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Career Stats
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CHIPS.map((chip) => (
            <StatChip key={chip.label} {...chip} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Tier Progress
        </p>
        <TierProgress />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Share Profile
        </p>
        <PublicProfileCard />
      </div>
    </div>
  );
}

// ─── Equity Curve (SVG) ───────────────────────────────────────────────────────
function EquityCurve({ trades }: { trades: { pnl: number; date: number }[] }) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-10 text-muted-foreground">
        <TrendingUp className="h-6 w-6 opacity-20" />
        <p className="text-[11px]">No closed trades yet</p>
      </div>
    );
  }

  const points: { x: number; y: number; cum: number }[] = [];
  let cum = 0;
  trades.forEach((t, i) => {
    cum += t.pnl;
    points.push({ x: i, y: 0, cum });
  });

  const W = 480;
  const H = 120;
  const PAD = { top: 8, right: 8, bottom: 20, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = points.map((p) => p.cum);
  const minV = Math.min(0, ...values);
  const maxV = Math.max(0, ...values);
  const range = maxV - minV || 1;

  const toX = (i: number) =>
    PAD.left + (i / Math.max(points.length - 1, 1)) * innerW;
  const toY = (v: number) =>
    PAD.top + innerH - ((v - minV) / range) * innerH;

  const zeroY = toY(0);
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.cum)}`)
    .join(" ");
  const areaD =
    `M ${toX(0)} ${zeroY} ` +
    points.map((p, i) => `L ${toX(i)} ${toY(p.cum)}`).join(" ") +
    ` L ${toX(points.length - 1)} ${zeroY} Z`;

  const finalPnL = values[values.length - 1];
  const isPositive = finalPnL >= 0;
  const stroke = isPositive ? "#22c55e" : "#ef4444";
  const fillStop = isPositive ? "#22c55e20" : "#ef444420";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ height: 120 }}
      aria-label="Equity curve"
    >
      <line
        x1={PAD.left}
        y1={zeroY}
        x2={W - PAD.right}
        y2={zeroY}
        stroke="hsl(var(--border))"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <path d={areaD} fill={fillStop} />
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[minV, 0, maxV].filter((v, i, a) => a.indexOf(v) === i).map((v) => (
        <text
          key={v}
          x={PAD.left - 4}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize="8"
          fill="hsl(var(--muted-foreground))"
          fontFamily="system-ui"
        >
          {v >= 0 ? `+${(v / 1000).toFixed(1)}k` : `${(v / 1000).toFixed(1)}k`}
        </text>
      ))}
    </svg>
  );
}

// ─── Monthly P&L bar chart ────────────────────────────────────────────────────
function MonthlyPnLChart({ trades }: { trades: { pnl: number; date: number }[] }) {
  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of trades) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + t.pnl);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, pnl]) => ({
        label: key.slice(5),
        pnl,
      }));
  }, [trades]);

  if (monthly.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
        <BarChart3 className="h-5 w-5 opacity-20" />
        <p className="text-[11px]">No monthly data yet</p>
      </div>
    );
  }

  const maxAbs = Math.max(...monthly.map((m) => Math.abs(m.pnl)), 1);
  const BAR_MAX_H = 72;

  return (
    <div className="flex items-end gap-1" style={{ height: BAR_MAX_H + 20 }}>
      {monthly.map((m) => {
        const pct = Math.abs(m.pnl) / maxAbs;
        const barH = Math.max(pct * BAR_MAX_H, 2);
        const isPos = m.pnl >= 0;
        return (
          <div
            key={m.label}
            className="flex flex-1 flex-col items-center gap-0.5"
            title={`${m.label}: ${formatCurrency(m.pnl)}`}
          >
            <div
              className={cn(
                "w-full rounded-t",
                isPos ? "bg-green-500/70" : "bg-red-500/60",
              )}
              style={{ height: barH }}
            />
            <span className="text-[8px] text-muted-foreground">{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Hourly Performance Heatmap ───────────────────────────────────────────────
function HourlyHeatmap({ seedValue }: { seedValue: number }) {
  const HOURS = Array.from({ length: 9 }, (_, i) => i + 9);
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const data = useMemo(() => {
    const rand = mulberry32(seedValue ^ 0xcafe1234);
    return DAYS.map(() =>
      HOURS.map(() => {
        const v = rand() * 2 - 1;
        return v;
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedValue]);

  function cellColor(v: number) {
    if (v > 0.4) return "bg-green-500/70";
    if (v > 0.1) return "bg-green-500/30";
    if (v < -0.4) return "bg-red-500/60";
    if (v < -0.1) return "bg-red-500/25";
    return "bg-muted/20";
  }

  return (
    <div>
      <div className="flex gap-0.5 pl-8 mb-0.5">
        {HOURS.map((h) => (
          <div
            key={h}
            className="flex-1 text-center text-[7px] text-muted-foreground tabular-nums"
          >
            {h > 12 ? `${h - 12}p` : `${h}a`}
          </div>
        ))}
      </div>
      {data.map((row, di) => (
        <div key={DAYS[di]} className="flex items-center gap-0.5 mb-0.5">
          <span className="w-7 text-[9px] text-muted-foreground shrink-0">{DAYS[di]}</span>
          {row.map((v, hi) => (
            <div
              key={hi}
              className={cn("flex-1 h-4 rounded-sm", cellColor(v))}
              title={`${DAYS[di]} ${HOURS[hi]}:00 — ${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}%`}
            />
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
        <div className="h-2.5 w-2.5 rounded-sm bg-green-500/70" />
        <span>Strong gain</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-muted/20" />
        <span>Neutral</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-red-500/60" />
        <span>Strong loss</span>
      </div>
    </div>
  );
}

// ─── Statistics Deep-Dive Tab ─────────────────────────────────────────────────
function StatisticsTab() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const stats = useGameStore((s) => s.stats);
  const xp = useGameStore((s) => s.xp);

  const {
    sells,
    bestTrades,
    worstTrades,
    avgWin,
    avgLoss,
    expectancy,
    avgHoldMs,
    bestTicker,
    worstTicker,
    mostUsedTicker,
    bestStreak,
    worstStreak,
  } = useMemo(() => {
    const sellList = tradeHistory.filter((t) => t.side === "sell");
    const sorted = [...sellList].sort((a, b) => b.realizedPnL - a.realizedPnL);
    const best3 = sorted.slice(0, 3);
    const worst3 = sorted.slice(-3).reverse();

    const wins = sellList.filter((t) => t.realizedPnL > 0);
    const losses = sellList.filter((t) => t.realizedPnL < 0);
    const aw =
      wins.length > 0
        ? wins.reduce((s, t) => s + t.realizedPnL, 0) / wins.length
        : 0;
    const al =
      losses.length > 0
        ? losses.reduce((s, t) => s + t.realizedPnL, 0) / losses.length
        : 0;
    const wr = sellList.length > 0 ? wins.length / sellList.length : 0;
    const exp = wr * aw + (1 - wr) * al;

    let totalHoldMs = 0;
    let pairCount = 0;
    const buysByTicker = new Map<string, number[]>();
    for (const t of tradeHistory) {
      if (t.side === "buy") {
        const arr = buysByTicker.get(t.ticker) ?? [];
        arr.push(t.timestamp);
        buysByTicker.set(t.ticker, arr);
      } else {
        const arr = buysByTicker.get(t.ticker);
        if (arr && arr.length > 0) {
          const buyTs = arr.shift()!;
          totalHoldMs += t.timestamp - buyTs;
          pairCount++;
          buysByTicker.set(t.ticker, arr);
        }
      }
    }
    const ah = pairCount > 0 ? totalHoldMs / pairCount : 0;

    const pnlByTicker = new Map<string, number>();
    const countByTicker = new Map<string, number>();
    for (const t of sellList) {
      pnlByTicker.set(t.ticker, (pnlByTicker.get(t.ticker) ?? 0) + t.realizedPnL);
      countByTicker.set(t.ticker, (countByTicker.get(t.ticker) ?? 0) + 1);
    }
    const tickerPnL = Array.from(pnlByTicker.entries());
    const bestT = tickerPnL.length
      ? tickerPnL.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      : "—";
    const worstT = tickerPnL.length
      ? tickerPnL.reduce((a, b) => (b[1] < a[1] ? b : a))[0]
      : "—";
    const countEntries = Array.from(countByTicker.entries());
    const mostT = countEntries.length
      ? countEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      : "—";

    let curWin = 0;
    let curLoss = 0;
    let bestS = 0;
    let worstS = 0;
    for (const t of sellList) {
      if (t.realizedPnL > 0) {
        curWin++;
        curLoss = 0;
        bestS = Math.max(bestS, curWin);
      } else {
        curLoss++;
        curWin = 0;
        worstS = Math.max(worstS, curLoss);
      }
    }

    return {
      sells: sellList,
      bestTrades: best3,
      worstTrades: worst3,
      avgWin: aw,
      avgLoss: al,
      expectancy: exp,
      avgHoldMs: ah,
      bestTicker: bestT,
      worstTicker: worstT,
      mostUsedTicker: mostT,
      bestStreak: bestS,
      worstStreak: worstS,
    };
  }, [tradeHistory]);

  const tradeSeries = useMemo(
    () => sells.map((t) => ({ pnl: t.realizedPnL, date: t.simulationDate })),
    [sells],
  );

  function formatHold(ms: number) {
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
    if (ms < 86_400_000) return `${(ms / 3_600_000).toFixed(1)}h`;
    return `${(ms / 86_400_000).toFixed(1)}d`;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-xs font-bold text-muted-foreground">Cumulative P&L</p>
        <EquityCurve trades={tradeSeries} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-xs font-bold text-muted-foreground">P&L by Month</p>
        <MonthlyPnLChart trades={tradeSeries} />
      </div>

      {sells.length > 0 && (
        <>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Trade Metrics
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatChip
                icon={<TrendingUp className="h-3.5 w-3.5 text-green-400" />}
                label="Avg Win"
                value={formatCurrency(avgWin)}
                valueClass="text-green-400"
              />
              <StatChip
                icon={<TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                label="Avg Loss"
                value={formatCurrency(avgLoss)}
                valueClass="text-red-400"
              />
              <StatChip
                icon={<Target className="h-3.5 w-3.5 text-blue-400" />}
                label="Expectancy"
                value={`${expectancy >= 0 ? "+" : ""}${formatCurrency(expectancy)}`}
                valueClass={expectancy >= 0 ? "text-green-400" : "text-red-400"}
              />
              <StatChip
                icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                label="Avg Hold"
                value={avgHoldMs > 0 ? formatHold(avgHoldMs) : "—"}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Ticker Intelligence
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                <p className="text-[9px] text-muted-foreground mb-0.5">Best Ticker</p>
                <p className="text-sm font-black text-green-400">{bestTicker}</p>
                <p className="text-[8px] text-muted-foreground">highest total P&L</p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-[9px] text-muted-foreground mb-0.5">Worst Ticker</p>
                <p className="text-sm font-black text-red-400">{worstTicker}</p>
                <p className="text-[8px] text-muted-foreground">lowest total P&L</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-3">
                <p className="text-[9px] text-muted-foreground mb-0.5">Most Traded</p>
                <p className="text-sm font-black">{mostUsedTicker}</p>
                <p className="text-[8px] text-muted-foreground">by trade count</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Streaks
            </p>
            <div className="grid grid-cols-2 gap-2">
              <StatChip
                icon={<Flame className="h-3.5 w-3.5 text-orange-400" />}
                label="Best Win Streak"
                value={`${bestStreak} wins`}
                valueClass="text-orange-400"
              />
              <StatChip
                icon={<TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                label="Worst Loss Streak"
                value={`${worstStreak} losses`}
                valueClass="text-red-400"
              />
            </div>
          </div>
        </>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Hourly Performance Heatmap
        </p>
        <HourlyHeatmap seedValue={stats.totalTrades ^ (xp & 0xffff)} />
      </div>

      {sells.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold text-green-400">
              <TrendingUp className="h-3 w-3" />
              Best Trades
            </p>
            <div className="space-y-1.5">
              {bestTrades.map((t, i) => (
                <div
                  key={`best-${i}`}
                  className="rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.ticker}</span>
                    <span className="text-xs font-bold tabular-nums text-green-400">
                      +{formatCurrency(t.realizedPnL)}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    {formatShortDate(t.simulationDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold text-red-400">
              <TrendingDown className="h-3 w-3" />
              Worst Trades
            </p>
            <div className="space-y-1.5">
              {worstTrades.map((t, i) => (
                <div
                  key={`worst-${i}`}
                  className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.ticker}</span>
                    <span className="text-xs font-bold tabular-nums text-red-400">
                      {formatCurrency(t.realizedPnL)}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    {formatShortDate(t.simulationDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Behavioral DNA Tab ───────────────────────────────────────────────────────
function BehavioralDNATab() {
  return (
    <div className="space-y-6">
      <TraderDNA />
      <BehavioralInsights />
    </div>
  );
}

// ─── Achievement defs by section ──────────────────────────────────────────────
const TRADING_DEFS = ACHIEVEMENT_DEFS.map((d) => ({
  ...d,
  category: "trading" as const,
}));

const LEARNING_DEFS = LEARNING_ACHIEVEMENT_DEFS.map((d) => ({
  id: d.id,
  name: d.name,
  description: d.description,
  icon: d.icon,
  xp: undefined as number | undefined,
  category: "learning" as const,
  condition: undefined as undefined,
}));

const MINIGAME_DEFS = MINIGAME_ACHIEVEMENT_DEFS.map((d) => ({
  id: d.id,
  name: d.name,
  description: d.description,
  icon: d.icon,
  xp: undefined as number | undefined,
  category: "minigame" as const,
  condition: undefined as undefined,
}));

const ALL_DEFS = [...TRADING_DEFS, ...LEARNING_DEFS, ...MINIGAME_DEFS];

// Progress hints for near-complete achievements
function progressHint(
  id: string,
  stats: ReturnType<typeof useGameStore.getState>["stats"],
): string | null {
  switch (id) {
    case "ten_trades":
      return `${stats.totalTrades}/10 trades`;
    case "fifty_trades":
      return `${stats.totalTrades}/50 trades`;
    case "five_streak":
      return `${stats.consecutiveWins}/5 wins`;
    case "limit_master":
      return `${stats.limitOrdersUsed}/5 limit orders`;
    case "diversified":
      return `${stats.uniqueTickersTraded.length}/5 tickers`;
    case "on_a_roll":
      return `${stats.dailyStreak}/3-day streak`;
    case "dedicated":
      return `${stats.dailyStreak}/7-day streak`;
    case "combo_master":
      return `${stats.comboCount}/5 combo`;
    default:
      return null;
  }
}

function AchievementCard({
  name,
  description,
  icon,
  xp,
  unlocked,
  unlockedAt,
  hint,
}: {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp?: number;
  unlocked: boolean;
  unlockedAt?: number;
  hint?: string | null;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all",
        unlocked
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card/30 opacity-55",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            unlocked
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-muted/30 text-muted-foreground",
          )}
        >
          {unlocked ? (
            <AchIcon name={icon} className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-bold">{name}</p>
            {xp ? (
              <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                +{xp} XP
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
            {description}
          </p>
          {unlocked && unlockedAt ? (
            <p className="mt-1 text-[9px] text-primary/70">
              Unlocked {formatShortDate(unlockedAt)}
            </p>
          ) : hint ? (
            <p className="mt-1 text-[9px] text-muted-foreground/60">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type AchDef = typeof ALL_DEFS[number];

function AchievementSection({
  label,
  defs,
  unlockedIds,
  unlockedMap,
  stats,
}: {
  label: string;
  defs: AchDef[];
  unlockedIds: Set<string>;
  unlockedMap: Map<string, { id: string; unlockedAt: number }>;
  stats: ReturnType<typeof useGameStore.getState>["stats"];
}) {
  const unlocked = defs.filter((d) => unlockedIds.has(d.id));
  const locked = defs.filter((d) => !unlockedIds.has(d.id));
  const pct = defs.length > 0 ? (unlocked.length / defs.length) * 100 : 0;

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {label}
        </p>
        <div className="flex-1 h-1 overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full rounded-full bg-amber-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
          {unlocked.length}/{defs.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {unlocked.map((d) => (
          <AchievementCard
            key={d.id}
            {...d}
            unlocked={true}
            unlockedAt={unlockedMap.get(d.id)?.unlockedAt}
          />
        ))}
        {locked.map((d) => (
          <AchievementCard
            key={d.id}
            {...d}
            unlocked={false}
            hint={progressHint(d.id, stats)}
          />
        ))}
      </div>
    </div>
  );
}

function AchievementsTab() {
  const achievements = useGameStore((s) => s.achievements);
  const stats = useGameStore((s) => s.stats);

  const unlockedIds = useMemo(
    () => new Set(achievements.map((a) => a.id)),
    [achievements],
  );

  const unlockedMap = useMemo(
    () =>
      new Map(achievements.map((a) => [a.id, { id: a.id, unlockedAt: a.unlockedAt }])),
    [achievements],
  );

  const totalUnlocked = unlockedIds.size;
  const totalAchievements = ALL_DEFS.length;

  return (
    <div className="space-y-6">
      {/* Global summary */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 px-4 py-3">
        <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black">
            {totalUnlocked}{" "}
            <span className="font-normal text-muted-foreground">
              / {totalAchievements} achievements unlocked
            </span>
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${(totalUnlocked / Math.max(totalAchievements, 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Three categorized sections */}
      <AchievementSection
        label="Trading Achievements"
        defs={TRADING_DEFS}
        unlockedIds={unlockedIds}
        unlockedMap={unlockedMap}
        stats={stats}
      />
      <AchievementSection
        label="Learning Achievements"
        defs={LEARNING_DEFS}
        unlockedIds={unlockedIds}
        unlockedMap={unlockedMap}
        stats={stats}
      />
      <AchievementSection
        label="Mini-Game Achievements"
        defs={MINIGAME_DEFS}
        unlockedIds={unlockedIds}
        unlockedMap={unlockedMap}
        stats={stats}
      />
    </div>
  );
}

// ─── XP History Tab ───────────────────────────────────────────────────────────
function XPTab() {
  return (
    <div className="space-y-5">
      <XPHistory />
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Tier Progression
        </p>
        <TierProgress />
      </div>
    </div>
  );
}

// ─── Customize Tab ────────────────────────────────────────────────────────────
function CustomizeTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-4 text-xs font-bold text-muted-foreground">Profile Customization</p>
        <ProfileEditor />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-4 p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ProfileHeader />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.06 }}
        >
          <Tabs defaultValue="overview">
            <TabsList className="mb-4 w-full grid grid-cols-5">
              <TabsTrigger value="overview" className="text-[10px] sm:text-xs">Overview</TabsTrigger>
              <TabsTrigger value="statistics" className="text-[10px] sm:text-xs">Stats</TabsTrigger>
              <TabsTrigger value="dna" className="text-[10px] sm:text-xs">DNA</TabsTrigger>
              <TabsTrigger value="achievements" className="text-[10px] sm:text-xs">Trophies</TabsTrigger>
              <TabsTrigger value="customize" className="text-[10px] sm:text-xs">Customize</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="data-[state=inactive]:hidden">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="statistics" className="data-[state=inactive]:hidden">
              <StatisticsTab />
            </TabsContent>
            <TabsContent value="dna" className="data-[state=inactive]:hidden">
              <BehavioralDNATab />
            </TabsContent>
            <TabsContent value="achievements" className="data-[state=inactive]:hidden">
              <AchievementsTab />
            </TabsContent>
            <TabsContent value="customize" className="data-[state=inactive]:hidden">
              <CustomizeTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
