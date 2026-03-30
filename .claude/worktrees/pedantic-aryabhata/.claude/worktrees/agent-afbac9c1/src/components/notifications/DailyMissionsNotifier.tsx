"use client";

/**
 * DailyMissionsNotifier
 * Fires a single "Daily missions refreshed" system notification once per
 * calendar day, the first time the dashboard is mounted. Uses localStorage
 * to track the last-notified date independently of the notification store so
 * it doesn't re-fire on every page load.
 */

import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notification-store";

const STORAGE_KEY = "finsim-daily-notif-date";

export function DailyMissionsNotifier() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    try {
      const lastNotified = localStorage.getItem(STORAGE_KEY);
      if (lastNotified === today) return; // already fired today
      localStorage.setItem(STORAGE_KEY, today);
    } catch {
      // localStorage unavailable — fire anyway (SSR safety)
    }

    addNotification({
      type: "system",
      title: "Daily missions refreshed",
      message: "New daily quests and challenges are available. Complete them to earn bonus XP.",
      icon: "Bell",
      color: "text-muted-foreground",
      priority: "low",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
