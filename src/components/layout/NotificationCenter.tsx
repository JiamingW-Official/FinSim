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
  Sparkles,
  CheckCircle,
  X,
} from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import type { AppNotification } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="h-3.5 w-3.5" />,
  TrendingUp: <TrendingUp className="h-3.5 w-3.5" />,
  TrendingDown: <TrendingDown className="h-3.5 w-3.5" />,
  Star: <Star className="h-3.5 w-3.5" />,
  Crosshair: <Crosshair className="h-3.5 w-3.5" />,
  Swords: <Swords className="h-3.5 w-3.5" />,
  Sparkles: <Sparkles className="h-3.5 w-3.5" />,
  CheckCircle: <CheckCircle className="h-3.5 w-3.5" />,
};

const TYPE_ACCENT: Record<string, string> = {
  achievement: "border-l-amber-400",
  level_up: "border-l-purple-400",
  trade: "border-l-emerald-400",
  quest: "border-l-cyan-400",
  arena: "border-l-red-400",
  challenge: "border-l-rose-400",
  xp: "border-l-primary",
};

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

function NotificationRow({ n }: { n: AppNotification }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-2.5 border-l-2 px-3 py-2 transition-colors",
        TYPE_ACCENT[n.type] ?? "border-l-muted",
        !n.read && "bg-primary/5",
      )}
    >
      <div className={cn("mt-0.5 shrink-0", n.color)}>
        {ICON_MAP[n.icon] ?? <Star className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold">{n.title}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {n.description}
        </p>
      </div>
      <span className="shrink-0 text-[9px] text-muted-foreground/60">
        {formatRelativeTime(n.timestamp)}
      </span>
    </motion.div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useNotificationStore((s) => s.notifications);
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[11px] font-bold">Activity</span>
              <div className="flex items-center gap-1.5">
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
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
                  <Bell className="h-5 w-5 opacity-30" />
                  <p className="text-[11px]">No activity yet</p>
                  <p className="text-[10px] opacity-60">
                    Start trading to see updates here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((n) => (
                    <NotificationRow key={n.id} n={n} />
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
