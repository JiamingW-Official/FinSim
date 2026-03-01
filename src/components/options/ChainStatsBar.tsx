"use client";

import { cn } from "@/lib/utils";
import type { ChainAnalytics } from "@/types/options";
import { formatVolume } from "@/services/options/analytics";

interface ChainStatsBarProps {
  analytics: ChainAnalytics;
  spotPrice: number;
}

interface StatChip {
  label: string;
  value: string;
  colorClass: string;
}

export function ChainStatsBar({ analytics, spotPrice }: ChainStatsBarProps) {
  const {
    totalCallVolume, totalPutVolume, putCallRatioVolume,
    totalCallOI, totalPutOI,
    atmIV, historicalVolatility, ivRank, ivVsHvSpread,
    expectedMove1SD,
  } = analytics;

  const totalVol = totalCallVolume + totalPutVolume;
  const totalOI = totalCallOI + totalPutOI;

  const ivVsHvClass = ivVsHvSpread > 0.02 ? "text-orange-400" : "text-emerald-400";

  const pcVolClass =
    putCallRatioVolume > 1.2
      ? "text-red-400"
      : putCallRatioVolume < 0.8
        ? "text-emerald-400"
        : "text-foreground";

  const ivRankClass =
    ivRank >= 60 ? "text-red-400" : ivRank >= 30 ? "text-amber-400" : "text-emerald-400";

  const chips: StatChip[] = [
    {
      label: "Total Vol",
      value: formatVolume(totalVol),
      colorClass: "text-foreground",
    },
    {
      label: "P/C Vol",
      value: putCallRatioVolume.toFixed(2),
      colorClass: pcVolClass,
    },
    {
      label: "Open Int",
      value: formatVolume(totalOI),
      colorClass: "text-foreground",
    },
    {
      label: "ATM IV",
      value: `${(atmIV * 100).toFixed(2)}%`,
      colorClass: ivVsHvClass,
    },
    {
      label: "Hist Vol",
      value: `${(historicalVolatility * 100).toFixed(2)}%`,
      colorClass: "text-muted-foreground",
    },
    {
      label: "IV Rank",
      value: `${ivRank.toFixed(0)}`,
      colorClass: ivRankClass,
    },
    {
      label: "Exp Move",
      value: `±$${expectedMove1SD.toFixed(2)}`,
      colorClass: "text-amber-400",
    },
  ];

  return (
    <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-card px-4 py-1.5">
      {/* Ticker + spot price */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground">
          Spot
        </span>
        <span className="text-[11px] font-black tabular-nums">
          ${spotPrice.toFixed(2)}
        </span>
      </div>

      <div className="h-4 w-px shrink-0 bg-border/50" />

      {chips.map((chip, i) => (
        <div key={chip.label} className="flex shrink-0 items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] text-muted-foreground/70">{chip.label}</span>
            <span className={cn("text-[11px] font-bold tabular-nums", chip.colorClass)}>
              {chip.value}
            </span>
          </div>
          {i < chips.length - 1 && (
            <div className="h-4 w-px shrink-0 bg-border/50" />
          )}
        </div>
      ))}
    </div>
  );
}
