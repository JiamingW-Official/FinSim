"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAlertsStore } from "@/stores/alerts-store";
import { useChartStore } from "@/stores/chart-store";
import { formatAlertCondition } from "@/services/trading/alerts";
import type { AlertCondition } from "@/services/trading/alerts";
import {
  Bell,
  BellRing,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Activity,
  Trash2,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const CONDITION_TYPES = [
  { value: "price_above", label: "Price Above" },
  { value: "price_below", label: "Price Below" },
  { value: "rsi_above", label: "RSI Above" },
  { value: "rsi_below", label: "RSI Below" },
  { value: "volume_spike", label: "Volume Spike" },
  { value: "support_break", label: "Support Break" },
  { value: "resistance_break", label: "Resistance Break" },
] as const;

type ConditionTypeKey = (typeof CONDITION_TYPES)[number]["value"];

// ── Component ──────────────────────────────────────────────────────────────────

export function AlertsPanel() {
  const { alerts, triggeredAlerts, addAlert, removeAlert, clearTriggered } =
    useAlertsStore();
  const ticker = useChartStore((s) => s.currentTicker);

  const [showForm, setShowForm] = useState(false);
  const [conditionType, setConditionType] =
    useState<ConditionTypeKey>("price_above");
  const [value, setValue] = useState("");
  const [showTriggered, setShowTriggered] = useState(true);

  const activeAlerts = alerts.filter((a) => !a.triggered);

  function handleAdd() {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;

    let condition: AlertCondition;
    switch (conditionType) {
      case "price_above":
        condition = { type: "price_above", value: numValue };
        break;
      case "price_below":
        condition = { type: "price_below", value: numValue };
        break;
      case "rsi_above":
        condition = { type: "rsi_above", value: numValue };
        break;
      case "rsi_below":
        condition = { type: "rsi_below", value: numValue };
        break;
      case "volume_spike":
        condition = { type: "volume_spike", multiplier: numValue };
        break;
      case "support_break":
        condition = { type: "support_break", level: numValue };
        break;
      case "resistance_break":
        condition = { type: "resistance_break", level: numValue };
        break;
      default:
        return;
    }

    addAlert(ticker, condition);
    setValue("");
    setShowForm(false);
  }

  function getConditionIcon(type: string) {
    if (type.includes("above") || type.includes("resistance"))
      return <TrendingUp className="h-3 w-3" />;
    if (type.includes("below") || type.includes("support"))
      return <TrendingDown className="h-3 w-3" />;
    return <Activity className="h-3 w-3" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Price Alerts</span>
          {activeAlerts.length > 0 && (
            <span className="text-xs font-mono tabular-nums bg-muted/50 px-1.5 py-0.5 rounded">
              {activeAlerts.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {/* Add Alert Form */}
      {showForm && (
        <div className="border border-border/40 rounded-lg p-3 bg-muted/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium shrink-0">
              {ticker}
            </span>
            <select
              value={conditionType}
              onChange={(e) =>
                setConditionType(e.target.value as ConditionTypeKey)
              }
              className="flex-1 text-[11px] bg-background border border-border/40 rounded px-2 py-1 outline-none focus:border-primary transition-colors"
            >
              {CONDITION_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                conditionType === "volume_spike" ? "Multiplier" : "Value"
              }
              step={conditionType === "volume_spike" ? "0.5" : "0.01"}
              className="flex-1 text-[11px] font-mono tabular-nums bg-background border border-border/40 rounded px-2 py-1 outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!value || isNaN(parseFloat(value))}
              className="text-xs font-medium px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Set
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length === 0 && triggeredAlerts.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-4">
          No alerts set. Add one to get notified.
        </p>
      )}

      {activeAlerts.length > 0 && (
        <div className="space-y-1">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded border border-border/50 bg-muted/10 group"
            >
              <span className="text-muted-foreground">
                {getConditionIcon(alert.condition.type)}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {alert.ticker}
              </span>
              <span className="flex-1 text-[11px] font-medium truncate">
                {formatAlertCondition(alert.condition)}
              </span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="space-y-1">
          <button
            onClick={() => setShowTriggered(!showTriggered)}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-400 w-full"
          >
            <BellRing className="h-3 w-3" />
            Triggered ({triggeredAlerts.length})
            {showTriggered ? (
              <ChevronUp className="h-3 w-3 ml-auto" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-auto" />
            )}
          </button>

          {showTriggered && (
            <>
              {triggeredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded border border-amber-500/20 bg-amber-500/5"
                >
                  <BellRing className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="flex-1 text-[11px] text-amber-300 truncate">
                    {alert.message || formatAlertCondition(alert.condition)}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono tabular-nums shrink-0">
                    {alert.triggeredAt
                      ? new Date(alert.triggeredAt).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : ""}
                  </span>
                </div>
              ))}
              <button
                onClick={clearTriggered}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto pt-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
