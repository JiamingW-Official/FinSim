"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  Crosshair,
  Swords,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowUpCircle,
  X,
} from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import type { AppNotification, NotificationType } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

// ── Type-driven icon map (no emojis) ─────────────────────────────────────────

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  achievement: <Trophy className="h-3.5 w-3.5" />,
  level_up: <ArrowUpCircle className="h-3.5 w-3.5" />,
  trade: <TrendingUp className="h-3.5 w-3.5" />,
  quest: <Crosshair className="h-3.5 w-3.5" />,
  arena: <Swords className="h-3.5 w-3.5" />,
  challenge: <Star className="h-3.5 w-3.5" />,
  xp: <Zap className="h-3.5 w-3.5" />,
  signal: <TrendingDown className="h-3.5 w-3.5" />,
  system: <Info className="h-3.5 w-3.5" />,
  alert: <AlertTriangle className="h-3.5 w-3.5" />,
};

/** Named-icon fallback (for legacy `icon` field from game-store) */
const NAMED_ICON: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="h-3.5 w-3.5" />,
  TrendingUp: <TrendingUp className="h-3.5 w-3.5" />,
  TrendingDown: <TrendingDown className="h-3.5 w-3.5" />,
  Star: <Star className="h-3.5 w-3.5" />,
  Crosshair: <Crosshair className="h-3.5 w-3.5" />,
  Swords: <Swords className="h-3.5 w-3.5" />,
  Sparkles: <Zap className="h-3.5 w-3.5" />,
  CheckCircle: <CheckCircle className="h-3.5 w-3.5" />,
  Bell: <Bell className="h-3.5 w-3.5" />,
};

function resolveIcon(n: AppNotification): React.ReactNode {
  // Prefer named icon if explicitly set and not the generic "Bell" fallback
  if (n.icon && n.icon !== "Bell" && NAMED_ICON[n.icon]) {
    return NAMED_ICON[n.icon];
  }
  return TYPE_ICON[n.type] ?? <Bell className="h-3.5 w-3.5" />;
}

// ── Type accent colours (left border) ────────────────────────────────────────

const TYPE_ACCENT: Record<NotificationType, string> = {
  achievement: "border-l-amber-400",
  level_up: "border-l-purple-400",
  trade: "border-l-green-400",
  quest: "border-l-cyan-400",
  arena: "border-l-red-400",
  challenge: "border-l-rose-400",
  xp: "border-l-primary",
  signal: "border-l-sky-400",
  system: "border-l-muted-foreground",
  alert: "border-l-orange-400",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDayBucket(timestamp: number): "today" | "yesterday" | "earlier" {
  const now = new Date();
  const date = new Date(timestamp);
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
  if (date.toDateString() === todayStr) return "today";
  if (date.toDateString() === yesterdayStr) return "yesterday";
  return "earlier";
}

// ── Row component ─────────────────────────────────────────────────────────────

function NotificationRow({
  n,
  onMarkRead,
}: {
  n: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => { if (!n.read) onMarkRead(n.id); }}
      className={cn(
        "relative flex items-start gap-2.5 border-l-2 px-3 py-2 transition-colors hover:bg-accent/20 cursor-default",
        TYPE_ACCENT[n.type] ?? "border-l-muted",
        !n.read && "bg-primary/5",
      )}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div className={cn("mt-0.5 shrink-0", n.color ?? "text-muted-foreground")}>
        {resolveIcon(n)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-[11px] font-semibold leading-tight">{n.title}</p>
        <p className="line-clamp-2 text-[10px] text-muted-foreground leading-snug mt-0.5">
          {n.message}
        </p>
      </div>

      {/* Timestamp */}
      <span className="shrink-0 text-[9px] text-muted-foreground/60 mt-0.5">
        {formatRelativeTime(n.timestamp)}
      </span>
    </motion.div>
  );
}

// ── Group header ──────────────────────────────────────────────────────────────

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="sticky top-0 bg-card/95 backdrop-blur-sm px-3 py-1 border-b border-border/40">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Group notifications by day bucket
  const groups: Array<{ label: string; items: AppNotification[] }> = [];
  const buckets: Record<string, AppNotification[]> = { today: [], yesterday: [], earlier: [] };
  for (const n of notifications) {
    buckets[getDayBucket(n.timestamp)].push(n);
  }
  if (buckets.today.length > 0) groups.push({ label: "Today", items: buckets.today });
  if (buckets.yesterday.length > 0) groups.push({ label: "Yesterday", items: buckets.yesterday });
  if (buckets.earlier.length > 0) groups.push({ label: "Earlier", items: buckets.earlier });

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent cursor-pointer"
        title="Activity feed"
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[11px] font-bold">
                Activity
                {unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                    {unreadCount} new
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-10 text-muted-foreground">
                  <Bell className="h-5 w-5 opacity-30" />
                  <p className="text-[11px]">No notifications</p>
                  <p className="text-[10px] opacity-60">
                    Start trading to see updates here
                  </p>
                </div>
              ) : (
                <div>
                  {groups.map((group) => (
                    <div key={group.label}>
                      <GroupHeader label={group.label} />
                      <div className="divide-y divide-border/40">
                        {group.items.map((n) => (
                          <NotificationRow key={n.id} n={n} onMarkRead={markRead} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
