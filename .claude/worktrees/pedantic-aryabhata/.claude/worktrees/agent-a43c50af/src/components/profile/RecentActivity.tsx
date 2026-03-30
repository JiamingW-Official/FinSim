"use client";

import { useNotificationStore } from "@/stores/notification-store";
import {
  Trophy, Sparkles, TrendingUp, ScrollText, Swords, Target, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy, Sparkles, TrendingUp, ScrollText, Swords, Target, Zap,
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivity() {
  const notifications = useNotificationStore((s) => s.notifications);
  const recent = notifications.slice(0, 10);

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground">
        <Zap className="h-5 w-5 opacity-30" />
        <p className="text-[11px]">No activity yet</p>
        <p className="text-[10px] opacity-60">Start trading to see your activity here</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {recent.map((n) => {
        const IconComp = ICON_MAP[n.icon] ?? Zap;
        return (
          <div
            key={n.id}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
          >
            <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted/20")}>
              <IconComp className={cn("h-3 w-3", n.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold truncate">{n.title}</p>
              {n.message && (
                <p className="text-[9px] text-muted-foreground truncate">{n.message}</p>
              )}
            </div>
            <span className="shrink-0 text-[9px] tabular-nums text-muted-foreground/50">
              {formatRelativeTime(n.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
