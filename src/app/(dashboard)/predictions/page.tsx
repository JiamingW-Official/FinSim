"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart3, Coins, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PREDICTION_MARKETS,
  CATEGORY_LABELS,
  type MarketCategory,
} from "@/data/prediction-markets";
import { usePredictionMarketStore } from "@/stores/prediction-market-store";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type FilterTab = "all" | MarketCategory;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "macro", label: "Macro" },
  { value: "equities", label: "Equities" },
  { value: "earnings", label: "Earnings" },
  { value: "crypto", label: "Crypto" },
  { value: "fed", label: "Policy" },
  { value: "geopolitics", label: "Geopolitics" },
];

export default function PredictionsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const bets = usePredictionMarketStore((s) => s.bets);
  const totalResolved = usePredictionMarketStore((s) => s.totalResolved);
  const accuracy = usePredictionMarketStore((s) => s.getAccuracy());
  const brierScore = usePredictionMarketStore((s) => s.getBrierScore());

  const activeBets = useMemo(
    () => bets.filter((b) => !b.resolved),
    [bets],
  );

  const filteredMarkets = useMemo(() => {
    if (activeFilter === "all") return PREDICTION_MARKETS;
    return PREDICTION_MARKETS.filter((m) => m.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <TrendingUp className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-lg font-semibold">Prediction Markets</h1>
            <p className="text-[11px] text-muted-foreground">
              Bet on real market outcomes. Learn probability thinking.
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">
              {insightPoints.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <StatChip
            icon={<BarChart3 className="h-3 w-3" />}
            label="Bets placed"
            value={String(bets.length)}
          />
          <StatChip
            icon={<Target className="h-3 w-3" />}
            label="Accuracy"
            value={totalResolved > 0 ? `${accuracy}%` : "--"}
          />
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1 cursor-help">
                  <span className="text-[10px] text-muted-foreground">
                    Brier Score
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {totalResolved > 0 ? brierScore.toFixed(3) : "--"}
                  </span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-64 text-xs">
                The Brier Score measures calibration (0 = perfect, 1 = worst).
                It penalizes confident wrong predictions more heavily. A score
                below 0.25 means you are well-calibrated.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">
            {activeBets.length} active bet{activeBets.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-border px-4 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeFilter === tab.value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Active bets section */}
        {activeBets.length > 0 && activeFilter === "all" && (
          <div className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Active Bets
            </h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {activeBets.map((bet) => {
                const market = PREDICTION_MARKETS.find(
                  (m) => m.id === bet.marketId,
                );
                if (!market) return null;
                return <PredictionCard key={market.id} market={market} />;
              })}
            </div>
          </div>
        )}

        {/* All markets */}
        <div>
          {activeFilter === "all" && activeBets.length > 0 && (
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              All Markets
            </h2>
          )}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredMarkets.map((market) => (
              <PredictionCard key={market.id} market={market} />
            ))}
          </div>
          {filteredMarkets.length === 0 && (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No markets in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}
