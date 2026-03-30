"use client";

import { useMemo } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import {
  computeBehavioralProfile,
  getBehavioralInsights,
  type BehavioralInsight,
  type InsightSeverity,
} from "@/services/analytics/behavioral-profile";

// ─── Severity styling config ──────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  {
    borderClass: string;
    bgClass: string;
    iconClass: string;
    Icon: React.ElementType;
    label: string;
  }
> = {
  info: {
    borderClass: "border-l-blue-400",
    bgClass: "bg-blue-500/5",
    iconClass: "text-blue-400",
    Icon: Info,
    label: "Info",
  },
  warning: {
    borderClass: "border-l-amber-400",
    bgClass: "bg-amber-500/5",
    iconClass: "text-amber-400",
    Icon: AlertTriangle,
    label: "Warning",
  },
  danger: {
    borderClass: "border-l-red-500",
    bgClass: "bg-red-500/5",
    iconClass: "text-red-500",
    Icon: XCircle,
    label: "Danger",
  },
};

// ─── Single insight row ───────────────────────────────────────────────────────

function InsightRow({ insight }: { insight: BehavioralInsight }) {
  const cfg = SEVERITY_CONFIG[insight.severity];
  const { Icon } = cfg;

  return (
    <div
      className={[
        "rounded-lg border border-l-4 p-3",
        cfg.borderClass,
        cfg.bgClass,
        "border-border",
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <Icon
          className={["mt-0.5 h-3.5 w-3.5 shrink-0", cfg.iconClass].join(" ")}
          aria-label={cfg.label}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {insight.title}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function NoInsights() {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-5 text-center">
      <p className="text-xs font-semibold text-foreground">
        No insights yet
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Complete at least 3 sell trades to unlock behavioral analysis.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BehavioralInsights() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const { profile, sells } = useMemo(() => {
    const sellList = tradeHistory.filter(
      (t) => t.side === "sell" && t.realizedPnL !== undefined,
    );
    return {
      profile: computeBehavioralProfile(tradeHistory),
      sells: sellList,
    };
  }, [tradeHistory]);

  const insights = useMemo(
    () => getBehavioralInsights(profile, sells),
    [profile, sells],
  );

  if (profile.tradeCount < 3) {
    return <NoInsights />;
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Behavioral Insights
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Personalised observations from your trading history
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            No significant patterns detected yet — keep trading to build a
            richer profile.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((insight) => (
            <InsightRow key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
