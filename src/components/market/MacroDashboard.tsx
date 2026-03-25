"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MACRO_INDICATORS,
  type MacroIndicator,
} from "@/services/market/macro-indicators";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Globe,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

type Category =
  | "all"
  | "growth"
  | "inflation"
  | "employment"
  | "rates"
  | "housing"
  | "consumer";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "growth", label: "Growth" },
  { value: "inflation", label: "Inflation" },
  { value: "employment", label: "Employment" },
  { value: "rates", label: "Rates" },
  { value: "housing", label: "Housing" },
  { value: "consumer", label: "Consumer" },
];

// ── Sparkline ──────────────────────────────────────────────────────────────────

function Sparkline({
  data,
  trend,
}: {
  data: { value: number }[];
  trend: MacroIndicator["trend"];
}) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 64;
  const height = 24;
  const padding = 1;

  const points = values
    .map((v, i) => {
      const x =
        padding + (i / (values.length - 1)) * (width - 2 * padding);
      const y =
        height - padding - ((v - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor =
    trend === "improving"
      ? "stroke-emerald-400"
      : trend === "deteriorating"
        ? "stroke-red-400"
        : "stroke-muted-foreground";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
    >
      <polyline
        points={points}
        fill="none"
        className={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Indicator Card ─────────────────────────────────────────────────────────────

function IndicatorCard({
  indicator,
  expanded,
  onToggle,
}: {
  indicator: MacroIndicator;
  expanded: boolean;
  onToggle: () => void;
}) {
  const trendIcon =
    indicator.trend === "improving" ? (
      <TrendingUp className="h-3 w-3 text-emerald-400" />
    ) : indicator.trend === "deteriorating" ? (
      <TrendingDown className="h-3 w-3 text-red-400" />
    ) : (
      <Minus className="h-3 w-3 text-muted-foreground" />
    );

  const trendBadgeClass =
    indicator.trend === "improving"
      ? "bg-emerald-500/10 text-emerald-400"
      : indicator.trend === "deteriorating"
        ? "bg-red-500/10 text-red-400"
        : "bg-muted/50 text-muted-foreground";

  const changeColor =
    indicator.change > 0
      ? "text-emerald-400"
      : indicator.change < 0
        ? "text-red-400"
        : "text-muted-foreground";

  // Format the value based on unit
  function formatValue(v: number, unit: string): string {
    if (unit === "K") return `${v.toFixed(0)}K`;
    if (unit === "M") return `${v.toFixed(2)}M`;
    if (unit === "$B") return `$${v.toFixed(1)}B`;
    if (unit === "%") return `${v.toFixed(2)}%`;
    if (unit === "index") return v.toFixed(1);
    return v.toString();
  }

  function formatChange(c: number, unit: string): string {
    const sign = c > 0 ? "+" : "";
    if (unit === "K") return `${sign}${c.toFixed(0)}K`;
    if (unit === "M") return `${sign}${c.toFixed(2)}M`;
    if (unit === "%") return `${sign}${c.toFixed(2)}%`;
    return `${sign}${c.toFixed(1)}`;
  }

  return (
    <div
      className={cn(
        "border border-border/50 rounded-lg bg-card transition-colors",
        expanded && "border-border",
      )}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 hover:bg-muted/20 transition-colors rounded-lg"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              {trendIcon}
              <span className="text-[11px] font-semibold truncate">
                {indicator.name}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold font-mono tabular-nums">
                {formatValue(indicator.currentValue, indicator.unit)}
              </span>
              <span
                className={cn(
                  "text-[10px] font-mono tabular-nums font-medium",
                  changeColor,
                )}
              >
                {formatChange(indicator.change, indicator.unit)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Sparkline
              data={indicator.historicalValues}
              trend={indicator.trend}
            />
            <span
              className={cn(
                "text-[9px] font-medium px-1.5 py-0.5 rounded",
                trendBadgeClass,
              )}
            >
              {indicator.trend}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border/30 space-y-2 pt-2">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {indicator.description}
          </p>
          <div className="bg-primary/5 border border-primary/10 rounded px-2 py-1.5">
            <span className="text-[9px] font-medium text-primary block mb-0.5">
              Market Impact
            </span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {indicator.marketImpact}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
            <span>
              Prev:{" "}
              <span className="font-mono tabular-nums font-medium text-foreground">
                {formatValue(indicator.previousValue, indicator.unit)}
              </span>
            </span>
            <span>
              Category:{" "}
              <span className="font-medium text-foreground capitalize">
                {indicator.category}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export function MacroDashboard() {
  const [category, setCategory] = useState<Category>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    category === "all"
      ? MACRO_INDICATORS
      : MACRO_INDICATORS.filter((i) => i.category === category);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Macro Indicators</span>
        <span className="text-[10px] font-mono tabular-nums bg-muted/50 px-1.5 py-0.5 rounded">
          {filtered.length}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              "text-[10px] font-medium px-2.5 py-1 rounded transition-colors",
              category === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Indicator Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((indicator) => (
          <IndicatorCard
            key={indicator.name}
            indicator={indicator}
            expanded={expandedId === indicator.name}
            onToggle={() =>
              setExpandedId(
                expandedId === indicator.name ? null : indicator.name,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
