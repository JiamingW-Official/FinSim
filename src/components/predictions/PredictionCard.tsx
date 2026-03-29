"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PredictionMarket } from "@/data/prediction-markets";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/data/prediction-markets";
import { usePredictionMarketStore } from "@/stores/prediction-market-store";
import type { PredictionBet } from "@/stores/prediction-market-store";

interface PredictionCardProps {
  market: PredictionMarket;
}

export function PredictionCard({ market }: PredictionCardProps) {
  const [showBetForm, setShowBetForm] = useState<"yes" | "no" | null>(null);
  const [showLearnWhy, setShowLearnWhy] = useState(false);
  const [betAmount, setBetAmount] = useState(50);
  const [betProbability, setBetProbability] = useState(market.initialProbability);

  const placeBet = usePredictionMarketStore((s) => s.placeBet);
  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const existingBet = usePredictionMarketStore((s) => s.getMarketBet(market.id));

  const expectedPayout = useMemo(() => {
    if (!showBetForm) return 0;
    const prob = betProbability / 100;
    if (showBetForm === "yes") {
      return Math.round(betAmount * (1 / prob));
    }
    return Math.round(betAmount * (1 / (1 - prob)));
  }, [showBetForm, betAmount, betProbability]);

  const handlePlaceBet = () => {
    if (!showBetForm) return;
    if (betAmount > insightPoints) return;
    placeBet(market.id, showBetForm, betAmount, betProbability);
    setShowBetForm(null);
  };

  const difficultyDots = Array.from({ length: 3 }, (_, i) => i < market.difficulty);

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          {market.question}
        </h3>
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium",
            CATEGORY_COLORS[market.category],
          )}
        >
          {CATEGORY_LABELS[market.category]}
        </span>
      </div>

      {/* Probability bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Market consensus</span>
          <span className="font-medium text-foreground">
            {market.initialProbability}% YES
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-colors duration-300"
            style={{ width: `${market.initialProbability}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{market.initialProbability}% Yes</span>
          <span>{100 - market.initialProbability}% No</span>
        </div>
      </div>

      {/* Meta row: difficulty + expiry */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {difficultyDots.map((filled, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                filled ? "bg-foreground/60" : "bg-muted-foreground/20",
              )}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">
            {market.difficulty === 1
              ? "Easy"
              : market.difficulty === 2
                ? "Medium"
                : "Hard"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{market.expiresInDays}d</span>
        </div>
      </div>

      {/* Existing bet display */}
      {existingBet && <ExistingBetBadge bet={existingBet} market={market} />}

      {/* YES / NO buttons */}
      {!existingBet && !showBetForm && (
        <div className="mb-2 flex gap-2">
          <button
            onClick={() => {
              setShowBetForm("yes");
              setBetProbability(market.initialProbability);
            }}
            className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/5"
          >
            Yes {market.initialProbability}%
          </button>
          <button
            onClick={() => {
              setShowBetForm("no");
              setBetProbability(100 - market.initialProbability);
            }}
            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/5"
          >
            No {100 - market.initialProbability}%
          </button>
        </div>
      )}

      {/* Inline bet form */}
      {showBetForm && !existingBet && (
        <div className="mb-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 text-[11px] font-medium text-foreground">
            Bet{" "}
            <span
              className={
                showBetForm === "yes" ? "text-emerald-400" : "text-red-400"
              }
            >
              {showBetForm.toUpperCase()}
            </span>
          </div>

          {/* Amount slider */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Amount</span>
              <span className="font-medium text-foreground">
                {betAmount} pts
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={Math.min(100, insightPoints)}
              step={10}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
              <span>10</span>
              <span>{Math.min(100, insightPoints)}</span>
            </div>
          </div>

          {/* Probability slider */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Your probability estimate</span>
              <span className="font-medium text-foreground">
                {betProbability}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={99}
              step={1}
              value={betProbability}
              onChange={(e) => setBetProbability(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
              <span>1%</span>
              <span>99%</span>
            </div>
          </div>

          {/* Payout preview */}
          <div className="mb-3 flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-[11px]">
            <span className="text-muted-foreground">Expected payout</span>
            <span className="font-semibold text-emerald-400">
              {expectedPayout} pts
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlaceBet}
              disabled={betAmount > insightPoints}
              className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Place Bet
            </button>
            <button
              onClick={() => setShowBetForm(null)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Learn why toggle */}
      <button
        onClick={() => setShowLearnWhy(!showLearnWhy)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {showLearnWhy ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Learn why this matters
      </button>
      {showLearnWhy && (
        <div className="mt-2 rounded bg-muted/30 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {market.educationalNote}
          <div className="mt-2 flex flex-wrap gap-1">
            {market.relatedConcepts.map((concept) => (
              <span
                key={concept}
                className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground/60"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExistingBetBadge({
  bet,
  market,
}: {
  bet: PredictionBet;
  market: PredictionMarket;
}) {
  const prob = bet.probability;
  const expectedPayout =
    bet.position === "yes"
      ? Math.round(bet.amount * (1 / prob))
      : Math.round(bet.amount * (1 / (1 - prob)));

  return (
    <div className="mb-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-semibold",
              bet.position === "yes"
                ? "bg-emerald-500/5 text-emerald-400"
                : "bg-red-500/5 text-red-400",
            )}
          >
            {bet.position.toUpperCase()}
          </span>
          <span className="text-muted-foreground">
            {bet.amount} pts at {Math.round(bet.probability * 100)}%
          </span>
        </div>
        <span className="font-medium text-foreground">
          Payout: {expectedPayout} pts
        </span>
      </div>
    </div>
  );
}
