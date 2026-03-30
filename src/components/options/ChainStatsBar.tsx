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
 <div className="h-8 flex shrink-0 items-center gap-4 overflow-x-auto border-b border-border/20 bg-background/50 px-3">
 {/* Spot price */}
 <div className="flex items-baseline gap-1 shrink-0">
 <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">Spot</span>
 <span className="text-[11px] font-mono tabular-nums text-foreground/80">
 ${spotPrice.toFixed(2)}
 {isLoading && <span className="ml-0.5 animate-pulse text-muted-foreground/40">…</span>}
 </span>
 </div>

 {chips.map((chip) => (
 <div key={chip.label} className="flex shrink-0 items-center gap-2">
 <span className="h-3 w-px bg-border/30 shrink-0" />
 <div className="flex items-baseline gap-1">
 <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
 {chip.label}
 </span>
 <span className={cn("text-[11px] font-mono tabular-nums", chip.colorClass)}>
 {chip.value}
 </span>
 </div>
 </div>
 ))}
 </div>
 );
}
