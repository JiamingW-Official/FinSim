"use client";

import { cn } from "@/lib/utils";
import type { ChainAnalytics } from "@/types/options";
import { formatVolume } from "@/services/options/analytics";

interface ChainStatsBarProps {
  analytics: ChainAnalytics;
  spotPrice: number;
  isLoading?: boolean;
}

interface StatChip {
  label: string;
  value: string;
  colorClass: string;
}

export function ChainStatsBar({ analytics, spotPrice, isLoading }: ChainStatsBarProps) {
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
    <div className="flex shrink-0 items-center gap-0 overflow-x-auto border-b border-border/20 bg-card px-3 py-1.5 text-[10px]">
      <span className="shrink-0 text-muted-foreground">Spot</span>
      <span className="ml-1 shrink-0 font-medium tabular-nums">${spotPrice.toFixed(2)}</span>
      {isLoading && (
        <span className="ml-1 text-muted-foreground/50 animate-pulse">...</span>
      )}
      {chips.map((chip) => (
        <span key={chip.label} className="shrink-0 flex items-center">
          <span className="mx-1.5 text-border">|</span>
          <span className="text-muted-foreground/70">{chip.label}</span>
          <span className={cn("ml-1 font-medium tabular-nums", chip.colorClass)}>
            {chip.value}
          </span>
        </span>
      ))}
    </div>
  );
}
