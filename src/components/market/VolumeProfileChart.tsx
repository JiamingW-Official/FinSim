"use client";

import { cn } from "@/lib/utils";
import type { VolumeProfile } from "@/services/market/volume-profile";

// ── Component ──────────────────────────────────────────────────────────────────

interface VolumeProfileChartProps {
  profile: VolumeProfile;
  currentPrice: number;
}

export function VolumeProfileChart({
  profile,
  currentPrice,
}: VolumeProfileChartProps) {
  const { levels, poc, valueAreaHigh, valueAreaLow, totalVolume } = profile;

  if (levels.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[11px] text-muted-foreground">
        No volume data available
      </div>
    );
  }

  const maxVolume = Math.max(...levels.map((l) => l.volume));
  const minPrice = Math.min(...levels.map((l) => l.priceLevel));
  const maxPrice = Math.max(...levels.map((l) => l.priceLevel));

  // Chart dimensions
  const barHeight = 16;
  const chartHeight = levels.length * barHeight;
  const labelWidth = 56;
  const barAreaWidth = 200;
  const totalWidth = labelWidth + barAreaWidth + 8;

  return (
    <div className="flex flex-col gap-2">
      {/* Header stats */}
      <div className="flex items-center gap-4 text-[10px]">
        <div>
          <span className="text-muted-foreground">POC </span>
          <span className="font-mono tabular-nums font-semibold text-primary">
            ${poc.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">VAH </span>
          <span className="font-mono tabular-nums font-medium">
            ${valueAreaHigh.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">VAL </span>
          <span className="font-mono tabular-nums font-medium">
            ${valueAreaLow.toFixed(2)}
          </span>
        </div>
        <div className="ml-auto">
          <span className="text-muted-foreground">Vol </span>
          <span className="font-mono tabular-nums font-medium">
            {totalVolume >= 1_000_000
              ? `${(totalVolume / 1_000_000).toFixed(1)}M`
              : totalVolume >= 1_000
                ? `${(totalVolume / 1_000).toFixed(0)}K`
                : totalVolume.toString()}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={chartHeight}
          viewBox={`0 0 ${totalWidth} ${chartHeight}`}
          className="block"
        >
          {/* Value Area background */}
          {levels.map((level, i) => {
            const inValueArea =
              level.priceLevel >= valueAreaLow &&
              level.priceLevel <= valueAreaHigh;
            if (!inValueArea) return null;
            return (
              <rect
                key={`va-${i}`}
                x={labelWidth}
                y={i * barHeight}
                width={barAreaWidth}
                height={barHeight}
                className="fill-primary/5"
              />
            );
          })}

          {/* Volume bars (reversed so highest price is at top) */}
          {[...levels].reverse().map((level, i) => {
            const barWidth =
              maxVolume > 0
                ? (level.volume / maxVolume) * barAreaWidth
                : 0;
            const buyWidth =
              maxVolume > 0
                ? (level.buyVolume / maxVolume) * barAreaWidth
                : 0;
            const sellWidth = barWidth - buyWidth;

            const isPOC = level.priceLevel === poc;
            const inValueArea =
              level.priceLevel >= valueAreaLow &&
              level.priceLevel <= valueAreaHigh;
            const isCurrentPrice =
              Math.abs(level.priceLevel - currentPrice) <=
              (maxPrice - minPrice) / levels.length;

            const y = i * barHeight;

            return (
              <g key={`bar-${i}`}>
                {/* Price label */}
                <text
                  x={labelWidth - 6}
                  y={y + barHeight / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className={cn(
                    "text-[9px] font-mono",
                    isPOC
                      ? "fill-primary font-semibold"
                      : isCurrentPrice
                        ? "fill-foreground font-medium"
                        : "fill-muted-foreground",
                  )}
                >
                  {level.priceLevel.toFixed(2)}
                </text>

                {/* Buy volume (green) */}
                <rect
                  x={labelWidth}
                  y={y + 1}
                  width={Math.max(buyWidth, 0)}
                  height={barHeight - 2}
                  rx={2}
                  className={cn(
                    isPOC
                      ? "fill-emerald-400/60"
                      : inValueArea
                        ? "fill-emerald-400/35"
                        : "fill-emerald-400/20",
                  )}
                />

                {/* Sell volume (red, stacked after buy) */}
                <rect
                  x={labelWidth + buyWidth}
                  y={y + 1}
                  width={Math.max(sellWidth, 0)}
                  height={barHeight - 2}
                  rx={0}
                  className={cn(
                    isPOC
                      ? "fill-red-400/60"
                      : inValueArea
                        ? "fill-red-400/35"
                        : "fill-red-400/20",
                  )}
                />

                {/* POC marker */}
                {isPOC && (
                  <line
                    x1={labelWidth + barWidth + 4}
                    y1={y + barHeight / 2}
                    x2={labelWidth + barWidth + 12}
                    y2={y + barHeight / 2}
                    className="stroke-primary"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                )}

                {/* Current price marker */}
                {isCurrentPrice && (
                  <line
                    x1={labelWidth - 2}
                    y1={y + barHeight / 2}
                    x2={labelWidth + barAreaWidth}
                    y2={y + barHeight / 2}
                    className="stroke-foreground"
                    strokeWidth={0.5}
                    strokeDasharray="2 2"
                  />
                )}

                {/* Volume label on larger bars */}
                {level.percentOfTotal > 5 && (
                  <text
                    x={labelWidth + barWidth + (isPOC ? 16 : 4)}
                    y={y + barHeight / 2 + 1}
                    dominantBaseline="middle"
                    className="text-[8px] fill-muted-foreground font-mono"
                  >
                    {level.percentOfTotal.toFixed(1)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400/40" />
          <span>Buy volume</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-400/40" />
          <span>Sell volume</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary/30" />
          <span>Value area (70%)</span>
        </div>
      </div>
    </div>
  );
}
