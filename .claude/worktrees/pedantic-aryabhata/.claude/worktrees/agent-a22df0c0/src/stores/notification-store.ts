import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType =
  | "achievement"
  | "level_up"
  | "trade"
  | "quest"
  | "arena"
  | "challenge"
  | "xp";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  icon: string;
  color: string;
  timestamp: number;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];

  addNotification: (
    n: Omit<AppNotification, "id" | "timestamp" | "read">,
  ) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const MAX_NOTIFICATIONS = 50;

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

        const notification: AppNotification = {
          ...n,
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
