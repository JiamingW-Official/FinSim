import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import type { Alert, AlertCondition } from "@/services/trading/alerts";
import {
  checkAlert,
  generateAlertMessage,
} from "@/services/trading/alerts";

interface AlertsState {
  alerts: Alert[];
  triggeredAlerts: Alert[];
  addAlert: (ticker: string, condition: AlertCondition) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (
    ticker: string,
    price: number,
    indicators?: Record<string, number>,
  ) => Alert[];
  clearTriggered: () => void;
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: [],
      triggeredAlerts: [],

      addAlert: (ticker, condition) => {
        const alert: Alert = {
          id: generateId(),
          ticker,
          condition,
          createdAt: Date.now(),
          triggered: false,
          message: "",
        };
        set((state) => ({ alerts: [...state.alerts, alert] }));
      },

      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
          triggeredAlerts: state.triggeredAlerts.filter((a) => a.id !== id),
        }));
      },

      checkAlerts: (ticker, price, indicators) => {
        const { alerts } = get();
        const tickerAlerts = alerts.filter(
          (a) => a.ticker === ticker && !a.triggered,
        );
        const newlyTriggered: Alert[] = [];

        for (const alert of tickerAlerts) {
          if (checkAlert(alert, price, indicators)) {
            const triggered: Alert = {
              ...alert,
              triggered: true,
              triggeredAt: Date.now(),
              message: generateAlertMessage(ticker, alert.condition, price),
            };
            newlyTriggered.push(triggered);
          }
        }

        if (newlyTriggered.length > 0) {
          const triggeredIds = new Set(newlyTriggered.map((a) => a.id));
          set((state) => ({
            alerts: state.alerts.map((a) =>
              triggeredIds.has(a.id)
                ? {
                    ...a,
                    triggered: true,
                    triggeredAt: Date.now(),
                    message: generateAlertMessage(
                      ticker,
                      a.condition,
                      price,
                    ),
                  }
                : a,
            ),
            triggeredAlerts: [
              ...state.triggeredAlerts,
              ...newlyTriggered,
            ],
          }));
        }

        return newlyTriggered;
      },

      clearTriggered: () => {
        set({ triggeredAlerts: [] });
      },
    }),
    { name: "alpha-deck-alerts" },
  ),
);
