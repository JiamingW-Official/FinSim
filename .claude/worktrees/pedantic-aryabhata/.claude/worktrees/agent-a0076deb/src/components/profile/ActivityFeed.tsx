"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  BookOpen,
  Zap,
  BarChart3,
} from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { cn } from "@/lib/utils";

// ─── Activity types ───────────────────────────────────────────────────────────

type ActivityKind = "trade_win" | "trade_loss" | "achievement" | "lesson" | "level_up";

interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  ts: number; // unix ms (real wall-clock time for achievements/lessons; simulationDate for trades)
}

// ─── Relative time formatter ──────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const now = Date.now();
  const diffMs = now - ts;

  if (diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 30) return `${diffDay} days ago`;

  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;
}

// ─── Kind config ─────────────────────────────────────────────────────────────

const KIND_CONFIG: Record<
  ActivityKind,
  { Icon: React.ElementType; iconClass: string; dotClass: string }
> = {
  trade_win: {
    Icon: TrendingUp,
    iconClass: "text-green-500",
    dotClass: "bg-green-500",
  },
  trade_loss: {
    Icon: TrendingDown,
    iconClass: "text-red-500",
    dotClass: "bg-red-500",
  },
  achievement: {
    Icon: Trophy,
    iconClass: "text-amber-500",
    dotClass: "bg-amber-500",
  },
  lesson: {
    Icon: BookOpen,
    iconClass: "text-violet-500",
    dotClass: "bg-violet-500",
  },
  level_up: {
    Icon: Zap,
    iconClass: "text-primary",
    dotClass: "bg-primary",
  },
};

// ─── Helpers for currency display ─────────────────────────────────────────────

function fmtPnl(v: number): string {
  const abs = Math.abs(v);
  const sign = v >= 0 ? "+" : "-";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(2)}`;
}

// ─── Build activity list ───────────────────────────────────────────────────────

function buildActivities(
  tradeHistory: ReturnType<typeof useTradingStore.getState>["tradeHistory"],
  achievements: ReturnType<typeof useGameStore.getState>["achievements"],
  completedLessons: string[],
  levelUps: { level: number; ts: number }[],
): ActivityItem[] {
  const items: ActivityItem[] = [];

  // Trades (sell side only, last 10)
  const sells = tradeHistory
    .filter((t) => t.side === "sell")
    .slice(0, 10);

  for (const t of sells) {
    const isWin = t.realizedPnL >= 0;
    items.push({
      id: `trade-${t.id}`,
      kind: isWin ? "trade_win" : "trade_loss",
      title: `${isWin ? "Profitable" : "Losing"} trade — ${t.ticker}`,
      subtitle: `${fmtPnl(t.realizedPnL)} P&L`,
      ts: t.timestamp,
    });
  }

  // Achievements (all, most recent first)
  for (const a of achievements) {
    items.push({
      id: `ach-${a.id}`,
      kind: "achievement",
      title: `Achievement unlocked — ${a.name}`,
      subtitle: a.description,
      ts: a.unlockedAt,
    });
  }

  // Lessons (use index-based synthetic timestamps since we only have lesson IDs)
  completedLessons.forEach((lessonId, idx) => {
    // Use a synthetic timestamp: oldest lesson gets the earliest slot
    // We don't have real timestamps so we space them 1 hour apart from a base
    const syntheticBase = Date.now() - (completedLessons.length - idx) * 3_600_000;
    items.push({
      id: `lesson-${lessonId}`,
      kind: "lesson",
      title: `Lesson completed`,
      subtitle: lessonId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      ts: syntheticBase,
    });
  });

  // Level ups
  for (const lu of levelUps) {
    items.push({
      id: `level-${lu.level}`,
      kind: "level_up",
      title: `Reached Level ${lu.level}`,
      subtitle: "Keep trading to progress further",
      ts: lu.ts,
    });
  }

  // Sort by most recent
  items.sort((a, b) => b.ts - a.ts);

  // Return last 10
  return items.slice(0, 10);
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const { Icon, iconClass, dotClass } = KIND_CONFIG[item.kind];

  return (
    <div className="flex gap-3">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
            item.kind === "achievement"
              ? "border-amber-500/30 bg-amber-500/10"
              : item.kind === "trade_win"
              ? "border-green-500/30 bg-green-500/10"
              : item.kind === "trade_loss"
              ? "border-red-500/30 bg-red-500/10"
              : item.kind === "lesson"
              ? "border-violet-500/30 bg-violet-500/10"
              : "border-primary/30 bg-primary/10",
          )}
        >
          <Icon className={cn("h-3 w-3", iconClass)} />
        </div>
        {!isLast && (
          <div className="mt-1 flex-1 w-px bg-border" style={{ minHeight: 16 }} />
        )}
      </div>

      {/* Content */}
      <div className={cn("min-w-0 pb-4", isLast && "pb-0")}>
        <p className="text-xs font-semibold text-foreground leading-snug">
          {item.title}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">
          {item.subtitle}
        </p>
        <p className="mt-1 text-[9px] text-muted-foreground/60">
          {relativeTime(item.ts)}
        </p>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-4 py-8 text-center">
      <BarChart3 className="h-6 w-6 text-muted-foreground opacity-30" />
      <div>
        <p className="text-sm font-semibold text-foreground">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Start trading and learning to see your activity feed here.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActivityFeed() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const achievements = useGameStore((s) => s.achievements);
  const level = useGameStore((s) => s.level);
  const completedLessons = useLearnStore((s) => s.completedLessons);

  // Build synthetic level-up events from current level
  const levelUps = useMemo(() => {
    const ups: { level: number; ts: number }[] = [];
    if (level > 1) {
      // Space level ups ~1 day apart, ending at now
      for (let l = 2; l <= level; l++) {
        ups.push({
          level: l,
          ts: Date.now() - (level - l) * 86_400_000,
        });
      }
    }
    return ups;
  }, [level]);

  const activities = useMemo(
    () => buildActivities(tradeHistory, achievements, completedLessons, levelUps),
    [tradeHistory, achievements, completedLessons, levelUps],
  );

  if (activities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Recent Activity
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Last {activities.length} events across trading, learning and achievements
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {activities.map((item, i) => (
          <ActivityRow
            key={item.id}
            item={item}
            isLast={i === activities.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
