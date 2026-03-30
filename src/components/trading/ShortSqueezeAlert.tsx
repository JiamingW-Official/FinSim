"use client";

import { useMemo } from "react";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";

interface ShortSqueezeAlertProps {
  className?: string;
}

export function ShortSqueezeAlert({ className: _className }: ShortSqueezeAlertProps) {
  const currentTicker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const fundamentals = FUNDAMENTALS[currentTicker];

  const priceRising = useMemo(() => {
    if (allData.length < 5 || revealedCount < 5) return false;
    const recent = allData.slice(Math.max(0, revealedCount - 5), revealedCount);
    if (recent.length < 2) return false;
    return recent[recent.length - 1].close > recent[0].close;
  }, [allData, revealedCount]);

  const shortFloat = fundamentals?.shortFloat ?? 0;
  const avgVolume = (fundamentals?.avgVolume30d ?? 1) * 1_000_000;
  const sharesOutstanding = (fundamentals?.sharesOutstanding ?? 1) * 1_000_000_000;
  const shortShares = sharesOutstanding * (shortFloat / 100);
  const daysToCover = avgVolume > 0 ? shortShares / avgVolume : 0;

  const isHighShortFloat = shortFloat >= 20;
  const hasSqueezeRisk = isHighShortFloat && priceRising;

  // Squeeze score: 0–100 based on short float and DTC
  const squeezeScore = Math.min(100, Math.round((shortFloat / 50) * 60 + (Math.min(daysToCover, 10) / 10) * 40));

  if (!fundamentals || shortFloat < 5 || !hasSqueezeRisk) return null;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-500/5 border border-amber-500/15 rounded mx-2 mb-1">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <span className="text-[9px] font-mono text-amber-400/80 flex-1">
        {currentTicker}: Squeeze risk {squeezeScore}%
      </span>
      <span className="text-[8px] font-mono text-amber-400/40">{daysToCover.toFixed(1)}d DTC</span>
    </div>
  );
}
