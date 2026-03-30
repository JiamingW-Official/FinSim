import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType =
  | "achievement"
  | "level_up"
  | "trade"
  | "quest"
  | "arena"
  | "challenge"
  | "xp"
  | "signal"
  | "system"
  | "alert";

export type NotificationPriority = "low" | "medium" | "high";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  /** Human-readable detail text (also exposed as `description` for backwards compat). */
  message: string;
  icon: string;
  color: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
}

/** @deprecated Use `message`. Kept for backwards compatibility with game-store calls. */
export type LegacyNotificationInput = Omit<AppNotification, "id" | "timestamp" | "read" | "message" | "priority"> & {
  description: string;
  message?: string;
  priority?: NotificationPriority;
};

export type NotificationInput =
  | Omit<AppNotification, "id" | "timestamp" | "read">
  | LegacyNotificationInput;

interface NotificationState {
  notifications: AppNotification[];

  addNotification: (n: NotificationInput) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const MAX_NOTIFICATIONS = 50;

/** Default priority per notification type. */
function defaultPriority(type: NotificationType): NotificationPriority {
  switch (type) {
    case "achievement":
    case "level_up":
      return "high";
    case "trade":
    case "signal":
    case "alert":
      return "medium";
    default:
      return "low";
  }
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (n) => {
        // Check notification preferences
        try {
          const { usePreferencesStore } = require("./preferences-store");
          const prefs = usePreferencesStore.getState().notificationPreferences;
          if (prefs[n.type] === false) return;
        } catch { /* preferences store not loaded yet */ }

        // Normalise legacy `description` field to `message`
        const raw = n as Record<string, unknown>;
        const message =
          typeof raw.message === "string"
            ? (raw.message as string)
            : typeof raw.description === "string"
            ? (raw.description as string)
            : "";

        const priority: NotificationPriority =
          (raw.priority as NotificationPriority | undefined) ??
          defaultPriority(n.type);

        const notification: AppNotification = {
          type: n.type,
          title: n.title,
          icon: (raw.icon as string) ?? "Bell",
          color: (raw.color as string) ?? "text-muted-foreground",
          message,
          priority,
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications].slice(
            0,
            MAX_NOTIFICATIONS,
          ),
        }));
      },

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: "alpha-deck-notifications",
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 20),
      }),
    },
  ),
);
