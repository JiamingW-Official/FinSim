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
 href?: string;
}

interface NotificationState {
 notifications: AppNotification[];

 addNotification: (
 n: Omit<AppNotification, "id" | "timestamp" | "read">,
 ) => void;
 markRead: (id: string) => void;
 markAllRead: () => void;
 clearAll: () => void;
}

const MAX_NOTIFICATIONS = 50;

const now = Date.now();

const DEMO_NOTIFICATIONS: AppNotification[] = [
 {
 id: "demo_1",
 type: "achievement",
 title: "First Trade Placed",
 description: "You placed your first simulated trade. The journey begins.",
 icon: "Trophy",
 color: "text-amber-400",
 timestamp: now - 1000 * 60 * 3,
 read: false,
 href: "/portfolio",
 },
 {
 id: "demo_2",
 type: "level_up",
 title: "Level 2 Reached",
 description: "You earned enough XP to reach Level 2. Keep it up!",
 icon: "Zap",
 color: "text-primary",
 timestamp: now - 1000 * 60 * 47,
 read: false,
 href: "/profile",
 },
 {
 id: "demo_3",
 type: "quest",
 title: "Quest Unlocked: RSI Rider",
 description: "Use RSI to enter a trade at oversold levels and profit 2%.",
 icon: "Crosshair",
 color: "text-muted-foreground",
 timestamp: now - 1000 * 60 * 60 * 3,
 read: true,
 href: "/quests",
 },
 {
 id: "demo_4",
 type: "trade",
 title: "Position Closed +4.2%",
 description: "AAPL long closed for a gain of $420. Nice trade.",
 icon: "TrendingUp",
 color: "text-primary",
 timestamp: now - 1000 * 60 * 60 * 26,
 read: true,
 href: "/portfolio",
 },
 {
 id: "demo_5",
 type: "challenge",
 title: "Monthly Challenge: Vol Player",
 description: "Trade through an earnings release without losing more than 2%.",
 icon: "Star",
 color: "text-rose-400",
 timestamp: now - 1000 * 60 * 60 * 50,
 read: true,
 href: "/challenges",
 },
];

export const useNotificationStore = create<NotificationState>()(
 persist(
 (set) => ({
 notifications: DEMO_NOTIFICATIONS,

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
