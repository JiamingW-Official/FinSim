"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  OptionChainExpiry,
  OptionSentiment,
  ChainAnalytics,
  StrategyRecommendation,
} from "@/types/options";
import { generateStrategyRecommendations } from "@/services/options/analytics";
import { StrategyRecommendationCard } from "./StrategyRecommendationCard";
import { useOptionsStore } from "@/stores/options-store";

interface StrategyBuilderV2Props {
  chain: OptionChainExpiry[];
  spotPrice: number;
  selectedExpiry: string;
  analytics: ChainAnalytics;
  onApply?: () => void;
}

const SENTIMENTS: {
  value: OptionSentiment;
  label: string;
  activeClass: string;
  icon: string;
}[] = [
  {
    value: "very_bullish",
    label: "Very Bullish",
    activeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    icon: "↑↑",
  },
  {
    value: "bullish",
    label: "Bullish",
    activeClass: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    icon: "↑",
  },
  {
    value: "neutral",
    label: "Neutral",
    activeClass: "border-border/40 bg-muted/30 text-muted-foreground",
    icon: "→",
  },
  {
    value: "directional",
    label: "Directional",
    activeClass: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    icon: "↕",
  },
  {
    value: "bearish",
    label: "Bearish",
    activeClass: "border-red-500/20 bg-red-500/5 text-red-400",
    icon: "↓",
  },
  {
    value: "very_bearish",
    label: "Very Bearish",
    activeClass: "border-red-500/30 bg-red-500/10 text-red-400",
    icon: "↓↓",
  },
];

const SECTION_HDR = "text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 mb-1.5";

export function StrategyBuilderV2({
  chain,
  spotPrice,
  selectedExpiry,
  analytics,
  onApply,
}: StrategyBuilderV2Props) {
  const [sentiment, setSentiment] = useState<OptionSentiment | null>(null);
  const applyPreset = useOptionsStore((s) => s.applyPreset);

  const frontExpiry = chain.find((c) => c.expiry === selectedExpiry) ?? chain[0];
  const dte = frontExpiry?.daysToExpiry ?? 30;

  const recommendations = useMemo<StrategyRecommendation[]>(() => {
    if (!sentiment || chain.length === 0) return [];
    return generateStrategyRecommendations(
      sentiment,
      chain,
      spotPrice,
      selectedExpiry,
      analytics.atmIV,
      dte,
    );
  }, [sentiment, chain, spotPrice, selectedExpiry, analytics.atmIV, dte]);

  const handleSelect = (rec: StrategyRecommendation) => {
    if (!frontExpiry) return;
    applyPreset(rec.preset, spotPrice, frontExpiry);
    onApply?.();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sentiment selection */}
      <div className="px-4 pt-3 pb-3 border-b border-border/20 shrink-0">
        <p className={SECTION_HDR}>Market Outlook</p>
        <div className="grid grid-cols-3 gap-1.5">
          {SENTIMENTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSentiment(sentiment === s.value ? null : s.value)}
              className={cn(
                "rounded-xl border border-border/20 bg-card/30 p-3 flex flex-col items-center gap-0.5 transition-colors text-center",
                sentiment === s.value
                  ? s.activeClass
                  : "text-muted-foreground hover:text-foreground hover:border-border/40",
              )}
            >
              <span className="text-sm font-mono font-semibold leading-none">{s.icon}</span>
              <span className="text-[10px] font-mono leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics summary */}
      {analytics.atmIV > 0 && (
        <div className="px-4 py-2 border-b border-border/20 shrink-0 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground/35">ATM IV</span>
            <span className="text-[11px] font-mono tabular-nums text-orange-400">
              {(analytics.atmIV * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground/35">IV Rank</span>
            <span
              className={cn(
                "text-[11px] font-mono tabular-nums",
                analytics.ivRank < 30
                  ? "text-emerald-400"
                  : analytics.ivRank < 60
                  ? "text-amber-400"
                  : "text-red-400",
              )}
            >
              {analytics.ivRank.toFixed(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground/35">Exp Move</span>
            <span className="text-[11px] font-mono tabular-nums text-amber-400/80">
              +/-${analytics.expectedMove1SD.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground/35">DTE</span>
            <span className="text-[11px] font-mono tabular-nums">{dte}d</span>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {sentiment === null ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center px-6">
            <p className="text-[11px] font-mono text-muted-foreground/50 mb-1">
              Select your market outlook above
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/35">
              We&apos;ll recommend the best strategies for your view
            </p>
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[10px] font-mono text-muted-foreground/50">No recommendations available</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <p className={SECTION_HDR}>
              Recommended Strategies
            </p>
            <span className="text-[9px] font-mono text-muted-foreground/50 bg-muted/20 rounded px-1.5 py-0.5">
              {recommendations.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
            {recommendations.map((rec) => (
              <StrategyRecommendationCard
                key={rec.preset.id}
                rec={rec}
                spotPrice={spotPrice}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
