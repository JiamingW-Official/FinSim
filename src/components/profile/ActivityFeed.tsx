"use client";

import { useMemo } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import {
  Trophy, Zap, TrendingUp, TrendingDown, Sparkles, ScrollText,
  BarChart3, BookOpen, Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy, Zap, TrendingUp, TrendingDown, Sparkles, ScrollText,
  BarChart3, BookOpen, Target,
};

interface FeedItem {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  dotColor: string;
  title: string;
  subtitle: string;
  timestamp: number;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function ActivityFeed() {
  const notifications = useNotificationStore((s) => s.notifications);
  const achievements = useGameStore((s) => s.achievements);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const level = useGameStore((s) => s.level);

  const items: FeedItem[] = useMemo(() => {
    const feed: FeedItem[] = [];

    // From notification log
    for (const n of notifications.slice(0, 20)) {
      const IconComp = ICON_MAP[n.icon] ?? Zap;
      let dotColor = "bg-primary/40";
      if (n.type === "achievement") dotColor = "bg-amber-500/60";
      else if (n.type === "level_up") dotColor = "bg-violet-500/60";
      else if (n.type === "trade") dotColor = "bg-emerald-500/60";

      feed.push({
        id: `notif-${n.id}`,
        icon: IconComp,
        iconColor: n.color,
        dotColor,
        title: n.title,
        subtitle: n.description || "",
        timestamp: n.timestamp,
      });
    }

    // From trade history — recent sells
    const recentSells = tradeHistory
      .filter((t) => t.side === "sell")
      .slice(0, 8);

    for (const t of recentSells) {
      const won = t.realizedPnL > 0;
      // Only add if not already represented by a notification
      const alreadyCovered = feed.some(
        (f) => Math.abs(f.timestamp - t.timestamp) < 2000,
      );
      if (alreadyCovered) continue;
      feed.push({
        id: `trade-${t.id}`,
        icon: won ? TrendingUp : TrendingDown,
        iconColor: won ? "text-emerald-400" : "text-red-400",
        dotColor: won ? "bg-emerald-500/60" : "bg-red-500/60",
        title: `${won ? "Closed" : "Closed"} ${t.ticker} position`,
        subtitle: `${won ? "+" : ""}$${t.realizedPnL.toFixed(2)} realized P&L`,
        timestamp: t.timestamp,
      });
    }

    // Achievements unlocked (with timestamp)
    for (const a of achievements.slice(0, 6)) {
      const alreadyCovered = feed.some((f) => f.title === a.name);
      if (alreadyCovered) continue;
      feed.push({
        id: `ach-${a.id}`,
        icon: Trophy,
        iconColor: "text-amber-400",
        dotColor: "bg-amber-500/60",
        title: `Achievement unlocked: ${a.name}`,
        subtitle: a.description,
        timestamp: a.unlockedAt,
      });
    }

    // Deduplicate and sort by timestamp desc
    const seen = new Set<string>();
    return feed
      .filter((f) => {
        if (seen.has(f.id)) return false;
        seen.add(f.id);
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 15);
  }, [notifications, tradeHistory, achievements, level]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
        <BarChart3 className="h-5 w-5 opacity-30" />
        <p className="text-[11px]">No activity yet</p>
        <p className="text-[10px] opacity-60">
          Start trading and completing lessons to build your feed
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border/40" />

      <div className="space-y-0">
        {items.map((item, i) => {
          const IconComp = item.icon;
          const isLast = i === items.length - 1;
          return (
            <div key={item.id} className={cn("flex gap-3", !isLast && "pb-3")}>
              {/* Timeline node */}
              <div className="relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                <IconComp className={cn("h-3.5 w-3.5", item.iconColor)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold leading-snug">{item.title}</p>
                  <span className="shrink-0 text-[9px] tabular-nums text-muted-foreground/50 mt-0.5">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                {item.subtitle && (
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
