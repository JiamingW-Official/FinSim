"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SECTORS,
  DEFAULT_SECTOR_PERFORMANCE,
  type SectorPeriod,
  type SectorPerformance,
} from "@/data/sector-data";

interface SectorHeatmapProps {
  /** Override default performance data if available from simulation */
  performance?: SectorPerformance[];
}

const PERIODS: { label: string; value: SectorPeriod }[] = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "YTD", value: "YTD" },
];

/**
 * Map performance percentage to a background color.
 * Green for positive, red for negative, intensity scales with magnitude.
 */
function performanceColor(pct: number): string {
  const maxIntensity = 10; // +-10% = full saturation
  const normalized = Math.min(1, Math.abs(pct) / maxIntensity);

  if (pct >= 0) {
    // Green: from card bg to emerald
    const alpha = 0.08 + normalized * 0.55;
    return `rgba(16, 185, 129, ${alpha.toFixed(2)})`;
  } else {
    const alpha = 0.08 + normalized * 0.55;
    return `rgba(239, 68, 68, ${alpha.toFixed(2)})`;
  }
}

function performanceTextColor(pct: number): string {
  if (pct > 0) return "text-emerald-500";
  if (pct < 0) return "text-red-500";
  return "text-muted-foreground";
}

export function SectorHeatmap({ performance }: SectorHeatmapProps) {
  const [period, setPeriod] = useState<SectorPeriod>("1D");
  const data = performance ?? DEFAULT_SECTOR_PERFORMANCE;

  // Build a lookup from sector name to performance
  const perfMap = new Map<string, SectorPerformance>();
  for (const p of data) {
    perfMap.set(p.sector, p);
  }

  // Sort sectors by performance for the selected period (best to worst)
  const sorted = [...SECTORS].sort((a, b) => {
    const perfA = perfMap.get(a.name)?.[period] ?? 0;
    const perfB = perfMap.get(b.name)?.[period] ?? 0;
    return perfB - perfA;
  });

  return (
    <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
      {/* Header with period selector */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground">
          Sector Performance
        </span>
        <div className="flex gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                period === p.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/30",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sector grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border/30 p-px">
        {sorted.map((sector) => {
          const perf = perfMap.get(sector.name);
          const value = perf?.[period] ?? 0;
          const hasHoldings = sector.watchlistTickers.length > 0;

          return (
            <div
              key={sector.name}
              className="relative p-2 transition-colors"
              style={{ backgroundColor: performanceColor(value) }}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">
                    {sector.shortName}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70">
                    {sector.weight.toFixed(1)}% of S&P
                  </div>
                </div>
                <div
                  className={cn(
                    "text-xs font-mono tabular-nums font-semibold whitespace-nowrap",
                    performanceTextColor(value),
                  )}
                >
                  {value >= 0 ? "+" : ""}
                  {value.toFixed(2)}%
                </div>
              </div>

              {/* Holdings in this sector */}
              {hasHoldings && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {sector.watchlistTickers.map((t) => (
                    <span
                      key={t}
                      className="px-1 py-px text-[11px] font-mono bg-background/60 rounded text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
