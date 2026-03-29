"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  Crosshair,
  Swords,
  Sparkles,
  CheckCircle,
  X,
  Zap,
  Radio,
  Settings,
  TriangleAlert,
} from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import type { AppNotification } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

// ── Icon map keyed by the `icon` string stored in each notification ──────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="h-3.5 w-3.5" />,
  TrendingUp: <TrendingUp className="h-3.5 w-3.5" />,
  TrendingDown: <TrendingDown className="h-3.5 w-3.5" />,
  Star: <Star className="h-3.5 w-3.5" />,
  Crosshair: <Crosshair className="h-3.5 w-3.5" />,
  Swords: <Swords className="h-3.5 w-3.5" />,
  Sparkles: <Sparkles className="h-3.5 w-3.5" />,
  CheckCircle: <CheckCircle className="h-3.5 w-3.5" />,
  Bell: <Bell className="h-3.5 w-3.5" />,
  Zap: <Zap className="h-3.5 w-3.5" />,
  Radio: <Radio className="h-3.5 w-3.5" />,
  Settings: <Settings className="h-3.5 w-3.5" />,
  TriangleAlert: <TriangleAlert className="h-3.5 w-3.5" />,
};

// ── Left-border accent colour per notification type ─────────────────────────

const TYPE_ACCENT: Record<string, string> = {
  achievement: "border-l-amber-400",
  level_up: "border-l-purple-400",
  trade: "border-l-emerald-400",
  quest: "border-l-cyan-400",
  arena: "border-l-red-400",
  challenge: "border-l-rose-400",
  xp: "border-l-primary",
  signal: "border-l-blue-400",
  system: "border-l-muted-foreground",
  alert: "border-l-amber-500",
};

// ── Relative time formatter ──────────────────────────────────────────────────

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

// ── Group notifications into Today / Yesterday / Earlier ────────────────────

function groupByDate(notifications: AppNotification[]): {
  label: string;
  items: AppNotification[];
}[] {
  const now = Date.now();
  const dayMs = 1000 * 60 * 60 * 24;
  const todayStart = now - (now % dayMs);
  const yesterdayStart = todayStart - dayMs;

  const today: AppNotification[] = [];
  const yesterday: AppNotification[] = [];
  const earlier: AppNotification[] = [];

  for (const n of notifications) {
    if (n.timestamp >= todayStart) {
      today.push(n);
    } else if (n.timestamp >= yesterdayStart) {
      yesterday.push(n);
    } else {
      earlier.push(n);
    }
  }

  const groups: { label: string; items: AppNotification[] }[] = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (yesterday.length > 0) groups.push({ label: "Yesterday", items: yesterday });
  if (earlier.length > 0) groups.push({ label: "Earlier", items: earlier });
  return groups;
}

// ── Individual row ────────────────────────────────────────────────────────────

function NotificationRow({
  n,
  onClose,
}: {
  n: AppNotification;
  onClose: () => void;
}) {
  const router = useRouter();
  const markRead = useNotificationStore((s) => s.markRead);

  function handleClick() {
    markRead(n.id);
    if (n.href) {
      router.push(n.href);
    }
    onClose();
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-2.5 border-l-2 px-3 py-2 text-left",
        "transition-colors duration-150 hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
        TYPE_ACCENT[n.type] ?? "border-l-muted",
        !n.read && "bg-primary/5",
      )}
    >
      {/* Colored icon */}
      <div className={cn("mt-0.5 shrink-0", n.color)}>
        {ICON_MAP[n.icon] ?? <Star className="h-3.5 w-3.5" />}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold leading-tight">{n.title}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {n.description}
        </p>
      </div>

      {/* Meta: time + unread dot */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">
          {formatRelativeTime(n.timestamp)}
        </span>
        {!n.read && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>
    </motion.button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  // Cap display to 20 most recent
  const displayNotifications = notifications.slice(0, 20);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = groupByDate(displayNotifications);

  function handleClose() {
    setOpen(false);
  }

  // Close dropdown on outside click
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

  function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);
    // Mark all read when opening
    if (nextOpen && unreadCount > 0) markAllRead();
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-md p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground hover:bg-muted/30 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[11px] font-medium text-primary-foreground"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-72 rounded-lg border border-border/40 bg-card shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-px text-[11px] font-medium text-primary">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {notifications.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Mark all read
                    </button>
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Grouped list */}
            <div className="max-h-80 overflow-y-auto">
              {displayNotifications.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
                  <Bell className="h-5 w-5 opacity-30" />
                  <p className="text-[11px] font-medium">All caught up!</p>
                  <p className="text-xs opacity-60">
                    No new notifications
                  </p>
                </div>
              ) : (
                <div>
                  {groups.map((group) => (
                    <div key={group.label}>
                      {/* Date group header */}
                      <div className="sticky top-0 bg-card/95 px-3 py-1 backdrop-blur-sm">
                        <span className="text-[11px] font-semibold text-muted-foreground/50">
                          {group.label}
                        </span>
                      </div>
                      <div className="divide-y divide-border/40">
                        {group.items.map((n) => (
                          <NotificationRow
                            key={n.id}
                            n={n}
                            onClose={handleClose}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 20 && (
              <div className="border-t border-border/40 px-3 py-2 text-center text-xs text-muted-foreground">
                Showing 20 of {notifications.length} — clear to reset
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
